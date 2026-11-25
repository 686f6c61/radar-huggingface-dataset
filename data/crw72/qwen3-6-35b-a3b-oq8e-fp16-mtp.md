# crw72/Qwen3.6-35B-A3B-oQ8e-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ8e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario crw72. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia en Apple Silicon mediante MLX, generada con la herramienta oQ (oMLX v0.8.0). El checkpoint resultante ocupa 39,5 GB en el repositorio y aplica una precisión mixta con un promedio efectivo de 8,789 bits por peso, combinando capas en 8 bits afines (grupos de 128 y 64), FP16 y FP32.

El modelo base es un transformer de tipo Mixture of Experts con 35.951.822.704 parámetros totales según los safetensors del checkpoint, e incorpora un cabezal MTP (multi-token prediction) de 0,845B de parámetros y un módulo de visión de 0,447B. La nomenclatura "A3B" del nombre sugiere aproximadamente 3.000 millones de parámetros activos por token, aunque este dato no se confirma de forma explícita en la información disponible.

Su relevancia es práctica: permite ejecutar un modelo de ~36B parámetros totales con capacidades multimodales y decodificación especulativa (MTP) en hardware Apple con memoria unificada, manteniendo una fidelidad cercana al modelo original gracias a la cuantización selectiva. La licencia Apache 2.0 facilita su uso comercial, aunque la ficha del modelo base no está incluida en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (qwen3_5_moe) con cabezal MTP y módulo de visión |
| Parámetros totales | 35.951.822.704 (35,952B) |
| Parámetros activos | no disponible (la nomenclatura A3B sugiere ~3B, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 8-bit grupo 128 (3,727%), affine 8-bit grupo 64 (94,945%), FP16 (0,086%), FP32 (1,242%); promedio 8,789 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen/Qwen3.6-35B-A3B, cuya arquitectura se etiqueta como `qwen3_5_moe`, es decir, un transformer con capas de mezcla de expertos. El desglose de almacenamiento distingue tres componentes: el modelo de lenguaje (34,661B de pesos lógicos), un módulo de visión (0,447B) y un cabezal MTP (multi-token prediction, 0,845B). La presencia del cabezal MTP indica soporte para decodificación especulativa, técnica que predice varios tokens por paso para acelerar la generación.

La cuantización se realizó con oQ (oMLX v0.8.0) en precisión mixta: la mayor parte de los pesos (94,945%) se almacena en affine 8-bit con grupos de 64, un 3,727% en 8-bit con grupos de 128, y una fracción pequeña se mantiene en FP16 (0,086%) y FP32 (1,242%). Esta distribución sugiere que los tensores sensibles a la precisión (posiblemente capas de visión y normalizaciones) se conservan en mayor resolución. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, sin detalles específicos en la información disponible.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,447B de parámetros, lo que indica capacidades multimodales imagen-texto.
- Decodificación especulativa: el cabezal MTP de 0,845B permite multi-token prediction para acelerar la inferencia.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización de ~8,8 bits permiten ejecutar el modelo en Macs con memoria unificada suficiente (a partir de 48-64 GB), útil para desarrolladores que necesitan un modelo multimodal sin depender de la nube.
- Prototipado de asistentes multimodales: el módulo de visión integrado permite construir demos de descripción de imágenes, extracción de información de documentos escaneados o respuesta a preguntas sobre capturas, todo en local.
- Aceleración de generación con MTP: el cabezal de multi-token prediction permite experimentar con decodificación especulativa para reducir la latencia en tareas de generación larga, como resúmenes o redacción asistida.
- Evaluación comparativa de cuantizaciones: investigadores pueden comparar esta versión de 8,789 bits/peso con el modelo original en FP16/BF16 para medir la degradación de calidad en tareas específicas.
- Investigación sobre MoE en hardware de consumo: al ser un MoE de ~36B totales con ~3B activos (según nomenclatura), sirve para estudiar el equilibrio entre memoria y cómputo en dispositivos con memoria unificada.
- Fine-tuning ligero y adaptadores: aunque el checkpoint está cuantizado, puede servir como base para experimentos de LoRA sobre capas no cuantizadas o para estudiar técnicas de adaptación sobre pesos de baja precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 39,5 GB en disco; para inferencia en MLX se recomienda al menos 48 GB de memoria unificada, y 64 GB para trabajar con contexto amplio y margen de seguridad.
- GPU recomendadas: Apple Silicon con memoria unificada (M2 Ultra, M3 Max, M4 Max/Ultra). No está pensado para GPUs NVIDIA/AMD en este formato.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 48 GB o más de memoria unificada. En GPUs dedicadas de consumo (p. ej. RTX 4090 con 24 GB) no cabe en este formato sin una cuantización más agresiva.
- Opciones de despliegue: MLX (librería `mlx`), con soporte de oMLX/oQ para la cuantización. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ8e-fp16-mtp (este) | 35,952B | no disponible | MLX safetensors, ~8,8 bits/peso | Apache 2.0 | Hugging Face (32 descargas) |
| Qwen/Qwen3.6-35B-A3B (base) | 35,952B (según checkpoint derivado) | no disponible | safetensors originales | no disponible en la información | Hugging Face |
| Otras cuantizaciones del mismo base | 35,952B | no disponible | GGUF, MLX, etc. | Apache 2.0 (presumible) | no disponible |

La comparativa con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo original: la precisión mixta de 8,789 bits/peso puede introducir degradación en tareas sensibles a la precisión numérica (matemáticas, código, vision fina) respecto al modelo base en FP16/BF16.
- Sin benchmarks publicados: no hay evidencia en la información disponible sobre la pérdida de calidad frente al modelo original.
- Idiomas y contexto no documentados: la model card no especifica la ventana de contexto ni los idiomas soportados, lo que dificulta planificar su uso en producción multilingüe.
- Sesgos y alucinaciones: no documentados en la información disponible; se heredan los del modelo base, que no se detallan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.6-35B-A3B, no incluida en esta ficha.
- Dependencia de MLX: el formato está atado al ecosistema Apple; no es directamente portable a GPUs NVIDIA sin reconversión.
- Madurez: 32 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 19 de noviembre de 2026) sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/crw72/Qwen3.6-35B-A3B-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
