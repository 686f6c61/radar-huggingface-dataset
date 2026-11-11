# AIOTVR/zils-lite-dao2

## Resumen

Zils-lite-dao2 es un modelo multimodal de tipo image-text-to-text publicado por AIOTVR bajo el identificador `AIOTVR/zils-lite-dao2`. Se trata de un fine-tune completo (full fine-tune) de un modelo padre de la familia Qwen, con la torre de lenguaje ajustada mediante LoRA ya fusionada en los pesos finales y la torre de visión sin modificar. El modelo se distribuye en formato safetensors con la librería transformers y requiere código personalizado (`custom_code`) para su carga, lo que indica que no funciona con una configuración estándar de transformers sin el repositorio de código asociado.

Con 852.985.920 parámetros totales (aproximadamente 853 millones) y un tamaño de repositorio de 1,7 GB, se sitúa en la gama de modelos compactos, adecuado para despliegues con recursos limitados o para experimentación en una sola GPU. La model card es extremadamente escueta: se limita a indicar que es un "soup body" del pool `d3-lite`, con la torre de lenguaje fusionada y la de visión intacta, y que el commit se realizó mediante hotkey en `zils-owner.json`.

La relevancia de este modelo es limitada y difícil de evaluar: no tiene descargas ni likes, no publica resultados de benchmarks, no especifica idiomas soportados ni detalles de entrenamiento, y su nomenclatura interna (zils, sn127, soup-body) no corresponde a ningún estándar conocido de la comunidad. Debe tratarse como un artefacto experimental o de investigación interna más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen (familia no especificada); torre de lenguaje con LoRA fusionada, torre de visión sin modificar |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo sigue una arquitectura transformer multimodal del tipo image-text-to-text, construida sobre un modelo padre de la familia Qwen (la etiqueta interna es `qwen3_5`, aunque no se especifica la variante exacta). El proceso de entrenamiento consistió en un full fine-tune del modelo padre "pinned", en el que la torre de lenguaje se ajustó mediante LoRA y posteriormente se fusionó en los pesos finales, mientras que la torre de visión se mantuvo intacta. No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El término "soup body" sugiere que los pesos podrían haberse obtenido mediante model souping (promediado de pesos de varios fine-tunes), una técnica habitual para combinar capacidades de distintos ajustes. El repositorio incluye código personalizado (`custom_code`), lo que implica que la arquitectura o el proceso de carga no son estándar y dependen de los archivos de código incluidos en el propio repositorio. No se documenta ninguna innovación técnica adicional como decodificación especulativa, atención lineal o modos de razonamiento.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es image-text-to-text, por lo que el modelo acepta imágenes y texto como entrada y genera texto.
- Conversación: la etiqueta `conversational` indica soporte para diálogo multi-turno, aunque no se especifica el formato de prompt ni la plantilla de chat.
- Procesamiento de visión: la torre de visión se conserva del modelo padre Qwen, por lo que hereda sus capacidades visuales, sin que se detallen en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Prototipado de asistentes visuales: al ser un modelo compacto de ~853 M de parámetros, puede usarse para experimentar con pipelines image-text-to-text en una sola GPU consumer, validando flujos de captura de imagen y respuesta textual antes de escalar a modelos mayores.
- Investigación sobre fine-tuning multimodal: sirve como ejemplo de full fine-tune con LoRA fusionada sobre un modelo Qwen, útil para estudiar el efecto del ajuste de la torre de lenguaje manteniendo congelada la de visión.
- Pruebas de model souping: dado su origen como "soup body", puede emplearse en experimentos de promediado de pesos y comparación de estrategias de fusión.
- Clasificación o descripción de imágenes en entornos con recursos limitados: su tamaño reducido permite desplegarlo en hardware modesto para tareas de captioning o respuesta a preguntas sobre imágenes, siempre que se valide su calidad previamente.
- Evaluación de pipelines de transformers con `custom_code`: útil para desarrolladores que necesiten probar la carga de modelos que requieren código personalizado y verificar la compatibilidad con versiones concretas de transformers.
- Docencia y demostraciones: su licencia Apache 2.0 y su tamaño permiten usarlo en cursos o talleres sobre modelos multimodales sin restricciones de licencia para uso académico o comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en precisión FP16 se requieren aproximadamente 1,7 GB solo para los pesos, más el overhead de activaciones y del procesador de visión; en la práctica, entre 3 y 5 GB de VRAM para inferencia en FP16, y alrededor de 1-2 GB si se cuantiza a 8 bits o 4 bits (aunque no se distribuyen pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de GPUs consumer modernas con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, etc.).
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la presencia de `custom_code` hace probable que estos motores no lo soporten sin adaptaciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| AIOTVR/zils-lite-dao2 | 852.985.920 | No disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen2-VL-2B | ~2.200 millones | 32.768 tokens (configurable) | Apache 2.0 | Sí | Ampliamente disponible y documentado |
| SmolVLM-500M | ~500 millones | 2.048 tokens | Apache 2.0 | Sí | Disponible con benchmarks publicados |
| PaliGemma-3B | ~3.000 millones | 2.048 tokens | Gemma License | Sí | Disponible con benchmarks publicados |

La comparación se ofrece a título orientativo: los datos de los modelos alternativos provienen de sus model cards públicas, mientras que para zils-lite-dao2 no hay contexto, benchmarks ni idiomas declarados, lo que dificulta una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de su rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, VQA, etc.), por lo que no puede recomendarse para producción sin una evaluación propia exhaustiva.
- Model card mínima: no se documentan datos de entrenamiento, idiomas, contexto, formato de prompt ni limitaciones conocidas.
- Sesgos desconocidos: al no detallarse la composición del dataset, no es posible evaluar sesgos de género, raza, idioma o cultura; se heredan los sesgos del modelo padre Qwen y de los datos de fine-tuning no documentados.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en descripciones de imágenes ambiguas.
- Dependencia de `custom_code`: la carga requiere ejecutar código del repositorio con `trust_remote_code=True`, lo que implica un riesgo de seguridad si no se audita el código; además, puede romperse con actualizaciones de transformers.
- Licencia Apache 2.0: permite uso comercial, pero el modelo padre Qwen puede tener condiciones adicionales que el autor no detalla; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Sin mantenimiento aparente: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-11), sin historial de versiones ni comunidad que lo respalde.
- Idiomas no declarados: no puede asumirse soporte de castellano ni de ningún otro idioma sin pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/AIOTVR/zils-lite-dao2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
