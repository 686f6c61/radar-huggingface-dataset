# Jundot/Qwen3.8-27B-oQ3e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ3e-fp16-mtp es una cuantización de precisión mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.781 millones de parámetros de tipo vision-lenguaje construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0), un pipeline de cuantización que asigna bits por sensibilidad medida de cada capa en lugar de aplicar una precisión uniforme. El checkpoint incluye el backbone de lenguaje, el codificador de visión y la cabeza de predicción multi-token (MTP).

El modelo base combina capas de Gated DeltaNet con capas de Gated Attention en un esquema híbrido, soporta comprensión de imagen y vídeo, y declara una ventana de contexto nativa de 262.144 tokens. Esta versión cuantizada ocupa 14,230 GiB de almacenamiento (15,3 GB de repositorio) y promedia 4,400 bits por peso en el checkpoint completo, con 3,903 bits/peso en el backbone de lenguaje, lo que permite ejecutar un modelo de 27B con capacidades multimodales en hardware Apple Silicon con memoria unificada moderada.

La relevancia práctica está en el ahorro de memoria: frente a un checkpoint BF16 de aproximadamente 55 GB, esta build reduce el peso a unos 15 GB manteniendo el codificador de visión en FP32 y las escalas de cuantización en FP16. La licencia Apache-2.0 heredada del modelo fuente facilita su uso comercial, aunque la librería MLX limita el despliegue al ecosistema de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated DeltaNet + Gated Attention) con codificador de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Precisión mixta affine 3/4/5/6/8 bits con grupo 64, más FP16 y FP32; media efectiva 4,400 bits/peso (checkpoint) y 3,903 bits/peso (backbone) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea un diseño híbrido que intercala capas de Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) y capas de Gated Attention clásicas, una combinación orientada a reducir el coste de atención en contextos largos manteniendo capacidad de recuperación exacta. Sobre ese backbone se añade un codificador de visión de 0,461B de parámetros que habilita entrada image-text-to-text, incluyendo comprensión de vídeo, y una cabeza de predicción multi-token (MTP) de 0,425B parámetros que puede explotarse para decodificación especulativa y acelerar la generación.

Esta ficha concreta no entrena el modelo: lo cuantiza. El proceso oQ3e mide la sensibilidad de cada capa y distribuye la precisión en consecuencia: el 74,355% de los pesos lógicos queda en affine 3-bit (grupo 64), un 11,918% en 4-bit, un 7,272% en 5-bit, un 4,597% en 6-bit y solo un 1,658% permanece en FP32 (principalmente el codificador de visión). Cada grupo se redondea con una matriz de importancia calculada sobre 128 muestras de 512 tokens y un reajuste por mínimos cuadrados ponderados de escala y sesgo. La revisión de 2026-11-19 aplica un refinamiento de redondeo oQe de oMLX 0.8.0 que reduce el error de cuantización sin cambiar tamaño ni velocidad. No se dispone de datos sobre el corpus de entrenamiento, número de tokens, ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 262.144 tokens.
- Comprensión de imágenes (pipeline image-text-to-text) y, según la model card, de vídeo.
- Codificación y explicación de código, además de matemáticas, como parte de las capacidades del modelo base Qwen3.5.
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos en local: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o expedientes completos en una sola pasada sobre un Mac con memoria unificada, sin enviar datos a la nube.
- Procesamiento de capturas y diagramas: gracias al codificador de visión, se puede usar para extraer texto estructurado de interfaces, gráficos y esquemas técnicos en flujos de documentación interna.
- Asistentes de código en estación de trabajo: el modelo base cubre generación y explicación de código; al ejecutarse en MLX sobre Apple Silicon, encaja en entornos de desarrollo donde no se permite tráfico saliente.
- Transcripción y resumen de vídeo: la comprensión de vídeo declarada permite generar resúmenes o índices de contenido a partir de grabaciones, útil para equipos de formación o archivo.
- Prototipado rápido de aplicaciones multimodales: el tamaño de 15,3 GB del repo permite cargar el modelo en un portátil con 32-64 GB de memoria unificada y validar ideas sin aprovisionar GPUs.
- Generación acelerada por MTP: en servicios locales con requisitos de latencia, la cabeza de predicción multi-token permite implementar decodificación especulativa para aumentar tokens por segundo.
- Análisis de imágenes médicas o industriales no críticas: para tareas de triaje o descripción preliminar donde la revisión humana posterior es obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 14,230 GiB (15,3 GB) en disco; en ejecución hay que sumar la caché KV para contexto largo, que puede crecer de forma significativa con 262.144 tokens.
- Hardware objetivo: Apple Silicon con memoria unificada. Con 32 GB se puede cargar el modelo y trabajar con contextos moderados; 64 GB o más es recomendable para contextos largos o uso simultáneo de otras aplicaciones.
- GPU NVIDIA: no es el objetivo de esta build; al estar en formato MLX no se ejecuta directamente en CUDA. Para A100/H100/RTX 4090 habría que usar el modelo base en otro formato.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 32 GB o superior; no está pensado para GPUs de consumo NVIDIA por el formato.
- Despliegue: MLX (librería mlx) y oMLX; vLLM, llama.cpp, Ollama y TGI no soportan este formato MLX con cuantización oQ de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ3e-fp16-mtp (esta ficha) | 27,781B | 262.144 | Sí (imagen y vídeo) | Apache-2.0 | MLX cuantizado, Apple Silicon |
| Qwen/Qwen3.8-27B (modelo base) | 27,781B | 262.144 | Sí | Apache-2.0 | Safetensors BF16/FP16, GPU y otros |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | 27,781B | 262.144 | Sí | Apache-2.0 | Según herramienta; no disponible en la información |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- La cuantización a 3-6 bits introduce degradación respecto al modelo base; la propia model card indica que la revisión de noviembre de 2026 reduce el error, lo que implica que versiones anteriores tenían mayor pérdida.
- El formato MLX restringe el despliegue a Apple Silicon; no es portable a CUDA ni a servidores x86 con GPU NVIDIA sin reconvertir.
- El contexto de 262.144 tokens es nativo, pero la memoria para la caché KV puede exceder la disponible en equipos de 32 GB; hay que planificar el truncado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de esta cuantización.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base.
- Idiomas soportados: no disponibles; conviene validar el rendimiento en castellano antes de producción.
- Soporte de tool calling y agentes: no confirmado en la información; verificar contra la documentación del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repo y las condiciones del modelo base.
- El repo tiene 258 descargas y 0 likes; es una build de la comunidad, no oficial de Qwen, por lo que el soporte y las garantías de calidad son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ3e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
