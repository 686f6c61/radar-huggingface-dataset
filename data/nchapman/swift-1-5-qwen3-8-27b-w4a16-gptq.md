# nchapman/Swift-1.5-Qwen3.8-27b-W4A16-GPTQ

## Resumen

Swift-1.5-Qwen3.8-27b-W4A16-GPTQ es una cuantización INT4 (W4A16) en formato GPTQ, publicada por el usuario nchapman, del modelo multimodal ukisai/Swift-1.5-Qwen3.8-27b. Se trata, por tanto, de un artefacto de compresión y no de un modelo entrenado desde cero: su interés es permitir servir un modelo de 27.356.728.560 parámetros (unos 27,36 mil millones) con aproximadamente un cuarto de la memoria del original, manteniendo en BF16那些 componentes sensibles a la precisión.

El modelo base pertenece a la familia Qwen 3.5 (etiqueta `qwen3_5` en el repositorio) y es de tipo image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto. El artefacto cuantizado conserva la torre de visión, la cabeza MTP (multi-token prediction), las proyecciones de atención lineal y el `lm_head` en BF16, y cuantiza únicamente las capas densas del transformer, lo que reduce el peso del repositorio a 19,5 GB en `safetensors`.

Es relevante ahora porque permite desplegar un modelo multimodal de ~27B con vLLM en una única GPU de 24-48 GB, algo inviable con los pesos en BF16 (~55 GB). La licencia es `swift-open-license-1.0` (marcada como `license: other`), por lo que conviene revisar sus términos antes de un uso comercial. El repositorio se creó el 25 de octubre de 2026 y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen 3.5, con proyecciones de atención lineal y cabeza MTP; pesos base según etiqueta `qwen3_5` |
| Parámetros totales | 27.356.728.560 (~27,36B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ INT4 con esquema W4A16 y `compressed-tensors`; componentes en BF16: torre de visión, cabeza MTP, proyecciones de atención lineal y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (`license: other`); se incluyen `LICENSE`, `NOTICE` y `LICENSE-APACHE-2.0` en el artefacto |
| Formato de pesos | `safetensors` (GPTQ / compressed-tensors), compatible con `transformers` y `vllm` |
| Tamaño del repositorio | 19,5 GB |
| Modalidad de entrada | Imagen + texto |
| Cuantizador | nchapman |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |

## Arquitectura y entrenamiento

El artefacto no aporta información sobre el entrenamiento del modelo base: no se detallan el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo que sí documenta el autor de la cuantización es el proceso de compresión: GPTQ con esquema W4A16 (pesos a 4 bits, activaciones a 16 bits), calibrado con 999 muestras extraídas de `nvidia/Nemotron-Cascade-2-SFT-Data` respetando las proporciones propias del dataset; las filas exactas están fijadas en el dataset `nchapman/warp-3090-quant-lab-frozen-data`. La receta y las herramientas están publicadas en el repositorio `nchapman/warp-3090-model-lab`.

El modelo base es multimodal y, según las etiquetas y la descripción del artefacto, incorpora proyecciones de atención lineal y una cabeza MTP (multi-token prediction), lo que sugiere una arquitectura híbrida orientada a decodificación especulativa o predicción multi-token. El cuantizador mantiene deliberadamente en BF16 la torre de visión, la cabeza MTP, las proyecciones de atención lineal y el `lm_head` para preservar la calidad en las partes más sensibles. El artefacto incluye una única plantilla de chat, `chat_template.jinja`, correspondiente a froggeric Qwen-Fixed-Chat-Templates v22.5, y un `generation_config.json` con los valores por defecto del modo thinking del modelo base: temperature 1.0, top_p 0.95 y top_k 20.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat, con plantilla Qwen fijada en el artefacto.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), heredada de la torre de visión del modelo base, que se conserva en BF16.
- Modo thinking: el `generation_config.json` reproduce los valores de muestreo por defecto del modo de razonamiento del modelo base.
- Predicción multi-token mediante cabeza MTP, según la descripción del artefacto (sin detalles adicionales sobre su uso en inferencia).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades de audio: no disponibles.

## Casos de uso

- Despliegue de un asistente multimodal en una sola GPU: al ocupar 19,5 GB en disco y rondar los 14 GB de pesos cuantizados, el modelo se puede servir con vLLM en una RTX 4090 (24 GB) o en una A6000/L40S (48 GB) con margen para caché KV en contextos moderados.
- Análisis de documentación técnica con imágenes: el pipeline image-text-to-text permite enviar capturas de diagramas, tablas o interfaces junto a una pregunta en texto y obtener una explicación; útil en herramientas internas de soporte a ingeniería.
- Sustitución de un modelo BF16 en producción: al ser un artefacto GPTQ compatible con vLLM (`LLM(model="nchapman/Swift-1.5-Qwen3.8-27b-W4A16-GPTQ")`), se puede integrar en un pipeline ya existente reduciendo requisitos de VRAM sin cambiar la API de servicio.
- Evaluación comparativa de cuantizaciones: el repositorio publica la receta, los datos de calibración congelados y el tooling, lo que permite reproducir el proceso y medir la degradación frente al modelo base en tareas propias.
- Chat conversacional con imágenes en entornos con presupuesto de hardware limitado: un único servidor con GPU de 48 GB puede alojar el modelo y atender varias sesiones concurrentes si la longitud de contexto es moderada.
- Prototipado de aplicaciones de visión-lenguaje en investigación: el formato `safetensors` + `transformers` permite cargarlo en cuadernos y hacer experimentos sin infraestructura multigpu.
- Generación de descripciones y extracción de información de imágenes en lotes: útil para indexar catálogos, capturas o material gráfico, siempre que se valide la calidad frente al modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del artefacto no incluye métricas (MMLU, HumanEval, GSM8K, MMMU u otras) ni comparaciones con el modelo base en BF16, por lo que no es posible cuantificar la pérdida de calidad introducida por la cuantización W4A16.

## Requisitos de hardware

- VRAM estimada para inferencia: los 27,36B parámetros en W4A16 suponen unos 13,7 GB de pesos cuantizados; sumando los componentes en BF16, el repositorio ocupa 19,5 GB. Con caché KV para contexto corto, el consumo arranca en torno a 21-24 GB y crece con la longitud de contexto (el tamaño exacto de la caché KV no está disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB o A6000 48 GB para producción con contexto amplio y concurrencia; RTX 4090 24 GB para uso individual con contexto moderado.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 4090 (24 GB) y en RTX 3090 (24 GB) con cuantización W4A16 y contextos contenidos; en tarjetas de 16 GB o menos no cabe sin reducir más la precisión o descargar capas a CPU.
- Opciones de despliegue: vLLM es el objetivo declarado del artefacto; también es cargable con `transformers` al usar `safetensors` y `compressed-tensors`. Compatibilidad con llama.cpp/Ollama no está indicada (el formato es GPTQ, no GGUF) y con TGI no se documenta.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/Swift-1.5-Qwen3.8-27b-W4A16-GPTQ (este) | 27,36B | no disponible | Imagen + texto | swift-open-license-1.0 | Pesos GPTQ en HF, 19,5 GB |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27,36B | no disponible | Imagen + texto | swift-open-license-1.0 | Pesos originales en HF (tamaño no indicado) |
| Alternativas de ~27-32B densas multimodales | ~27-32B | 128k en varias familias | Texto o imagen + texto | variables (Apache-2.0, Gemma, etc.) | Múltiples en HF |

No se dispone de datos de rendimiento del modelo ni de comparaciones publicadas frente a alternativas de la misma categoría, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. Cualquier comparación de calidad (MMLU, MMMU, HumanEval) requeriría evaluaciones propias, que no se han publicado en la información disponible.

## Limitaciones y advertencias

- No hay datos publicados sobre sesgos del modelo base ni sobre cómo la cuantización W4A16 los afecta.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para este artefacto.
- La cuantización INT4 puede degradar tareas sensibles a la precisión numérica (matemáticas, código, OCR fino). No se aportan métricas que cuantifiquen esa pérdida frente al modelo base en BF16.
- Longitud de contexto e idiomas soportados no están documentados en el repositorio, lo que impide planificar despliegues con requisitos de ventana larga o cobertura idiomática concreta.
- Licencia `swift-open-license-1.0` con `license: other`: es necesario revisar `LICENSE` y `NOTICE` incluidos en el artefacto antes de cualquier uso comercial; las condiciones no se resumen en la model card.
- El repositorio registra 0 descargas y 0 valoraciones, y se publicó el 25 de octubre de 2026: no hay evidencia de uso en producción ni validación comunitaria.
- El formato es GPTQ/compressed-tensors, no GGUF: no es directamente utilizable en llama.cpp u Ollama sin una conversión adicional no documentada.
- Los valores de muestreo por defecto (temperature 1.0, top_p 0.95, top_k 20) están pensados para modo thinking; usarlos en modo no-thinking puede producir respuestas con variabilidad excesiva si no se sobrescriben.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/nchapman/Swift-1.5-Qwen3.8-27b-W4A16-GPTQ
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia swift-open-license-1.0: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/b4c84d42903a8646b25857eb2827288d92ed85a4/LICENSE
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Filas de calibración congeladas: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantillas de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Receta y herramientas de cuantización: https://github.com/nchapman/warp-3090-model-lab
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a herramientas de intercambio de caras y edición de vídeo, sin relación con este artefacto.
