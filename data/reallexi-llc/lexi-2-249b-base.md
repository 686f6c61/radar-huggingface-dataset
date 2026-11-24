# Reallexi-llc/lexi-2-249b-base

## Resumen

Lexi 2.249B es un checkpoint de generación de texto de 2.249 millones de parámetros publicado por Reallexi LLC, orientado a completado de código local y a servir de base para fine-tuning posterior. Se trata de un modelo causal con arquitectura Qwen2, derivado de un checkpoint interno ("Local Lexi 2.246B Model Surgery") al que se le ha fusionado un adaptador LoRA de rango 8, generando un modelo autónomo con pesos completos y tokenizador incluidos.

El modelo se distribuye en formato FP16 SafeTensors (18 shards, unos 4.49 GB) y se puede cargar directamente con `transformers`. Su límite de secuencia durante el entrenamiento fue de 14.592 tokens, aunque la configuración de posición del modelo permite hasta 32.768 tokens. El dataset de entrenamiento es una exportación de fragmentos de código denominada Lexi Coder v3.

La relevancia de este lanzamiento es acotada: se publica sin evaluación en benchmarks de código ni en contexto de 32K, con cero descargas en el momento de la ficha y una licencia que hereda los términos del modelo base y del dataset. Es un artefacto útil para experimentación local y para continuar entrenamiento, no un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 causal language model (transformer decoder-only) |
| Parametros totales | 2.249.028.096 (2.249B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens configurados; 14.592 tokens de límite de secuencia en entrenamiento |
| Tipos de cuantizacion | no disponible oficialmente (pesos publicados en FP16; compatible con cuantización vía herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | other — "inherits-base-model-and-dataset-terms" (hereda términos del modelo base y del dataset) |
| Formato de pesos | SafeTensors FP16, 18 shards (4.491.421.288 bytes, ~4.49 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo causal con la arquitectura Qwen2, con 2.249 millones de parámetros. Parte de un checkpoint previo ("Local Lexi 2.246B Model Surgery") al que se le fusionó un adaptador LoRA. El job de entrenamiento (AI Model Builder job #2051) usó LoRA de rango 8 con alpha 16, learning rate 1e-5, tamaño de microbatch 1 y acumulación de gradiente 8. La fase 32 procesó una ventana de 500 filas durante tres épocas, totalizando 1.500 microbatches, y la cadena registrada había procesado 10.000 filas del dataset en esa fase.

Los datos de entrenamiento provienen de Lexi Coder v3, una exportación de recuperación de fragmentos de código. No se documenta el número total de tokens de entrenamiento ni la composición detallada del dataset. No se menciona uso de RLHF, DPO ni técnicas de alineación adicionales. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal; se trata de una arquitectura Qwen2 estándar con un adaptador fusionado.

## Capacidades

- Generación de texto autoregresiva con plantilla de chat (`apply_chat_template`) para conversaciones de un solo turno y multi-turno.
- Completado y generación de código, dado el origen del dataset de entrenamiento (Lexi Coder v3).
- Generación determinista disponible (`do_sample=False`) para tareas de completado reproducible.
- Carga directa con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Compatibilidad declarada con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- Uso como base personalizada en AI Model Builder para continuar entrenamiento.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking": no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).

## Casos de uso

- Completado de código en editor local: el modelo, con 2.249B parámetros y pesos FP16 de ~4.49 GB, cabe en GPUs de consumo y puede servir como autocompletado en IDE mediante integración con `transformers` o servidores locales, aunque requiere validación con tests del proyecto.
- Generación de funciones y snippets en Python y otros lenguajes: la plantilla de chat permite enviar instrucciones como "escribe una función que devuelva la mediana de una lista" y obtener código determinista con `do_sample=False`.
- Base para fine-tuning específico de dominio: al ser un checkpoint autónomo con tokenizador incluido, se puede usar como punto de partida para LoRA o fine-tuning completo sobre código propietario, cargándolo como base personalizada en AI Model Builder.
- Experimentación académica con modelos pequeños: su tamaño (2.249B) y su licencia heredada lo hacen adecuado para estudios de destilación, cuantización y evaluación de modelos compactos en entornos con recursos limitados.
- Prototipado de asistentes conversacionales de código: la plantilla de chat y el formato Qwen2 permiten construir demos de asistente técnico en local sin depender de APIs externas.
- Generación de documentación técnica a partir de fragmentos de código: el modelo puede producir descripciones y comentarios, siempre con revisión humana dado el riesgo de alucinación.
- Servicio de inferencia con TGI: el tag `text-generation-inference` y `endpoints_compatible` permiten desplegarlo en infraestructura compatible con Hugging Face endpoints para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que este lanzamiento no incluye benchmark de código con conjunto de validación retenido ni evaluación de contexto de 32K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 4.5 GB solo para pesos, más overhead de activaciones y KV cache; aproximadamente 5-6 GB en la práctica para contextos cortos.
- VRAM estimada en cuantización de 8 bits: ~2.3-2.5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: ~1.2-1.5 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100; cualquier GPU con al menos 6 GB de VRAM para FP16 en contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs con 8 GB o más para FP16; con cuantización 4 bits, en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` con `accelerate` (soporte oficial documentado), Text Generation Inference (tag declarado), y herramientas externas compatibles con SafeTensors (llama.cpp, Ollama, vLLM) previa conversión a los formatos correspondientes.
- Latencia y throughput: no disponibles (no documentados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lexi 2.249B | 2.249B | 32.768 configurado / 14.592 entrenamiento | other (hereda base y dataset) | SafeTensors FP16 | Sin benchmarks publicados; orientado a código |
| Qwen2.5-Coder-1.5B | 1.5B | 32.768 | Apache 2.0 | SafeTensors, GGUF | Modelo oficial con benchmarks publicados |
| Qwen2.5-Coder-3B | 3B | 32.768 | Apache 2.0 (variantes) | SafeTensors, GGUF | Modelo oficial con benchmarks publicados |
| CodeGemma-2B | 2B | 8.192 | Gemma terms | SafeTensors, GGUF | Orientado a completado de código |

La comparación con alternativas oficiales es desfavorable en trazabilidad: Lexi 2.249B no publica benchmarks, su licencia es heredada y no declara idiomas, mientras que los modelos Qwen2.5-Coder y CodeGemma ofrecen evaluaciones publicadas y licencias más claras. No se dispone de datos de rendimiento comparativo para Lexi 2.249B.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evaluación en MMLU, HumanEval, GSM8K ni pruebas de contexto de 32K, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación elevado en código: la model card recomienda verificar el código generado con tests del proyecto y revisión humana antes de usarlo.
- Licencia ambigua: "inherits-base-model-and-dataset-terms" obliga a revisar los términos del modelo base y del dataset Lexi Coder v3 antes de redistribuir o usar comercialmente; no es una licencia permisiva estándar.
- Idiomas no declarados: no se especifica qué lenguajes naturales soporta, lo que limita su uso en aplicaciones multilingües.
- Contexto efectivo limitado: aunque la configuración permite 32.768 tokens, el entrenamiento se realizó con secuencias de hasta 14.592 tokens, por lo que el rendimiento más allá de ese límite no está validado.
- Procedencia opaca: deriva de un checkpoint interno ("Model Surgery") y de un dataset de recuperación de código sin documentación pública detallada sobre composición o calidad.
- Cero descargas y un solo "like" en el momento de la ficha: ecosistema mínimo, sin comunidad que haya validado el modelo.
- Sin soporte documentado de tool calling, agentes o multimodalidad: no apto para pipelines agénticos sin trabajo adicional.
- Fecha de creación futura (2026-11-23) en los metadatos: conviene verificar la integridad del repositorio y los checksums de `SHA256SUMS.txt` antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Reallexi-llc/lexi-2-249b-base
- Dataset de entrenamiento: https://huggingface.co/datasets/reallexi/lexi-coder-v3-datasest
- AI Model Builder: https://llm.reallexi.io
- NOTICE (en el repositorio): https://huggingface.co/Reallexi-llc/lexi-2-249b-base/blob/main/NOTICE
- COPYRIGHT.md (en el repositorio): https://huggingface.co/Reallexi-llc/lexi-2-249b-base/blob/main/COPYRIGHT.md
- Checksums: https://huggingface.co/Reallexi-llc/lexi-2-249b-base/blob/main/SHA256SUMS.txt
