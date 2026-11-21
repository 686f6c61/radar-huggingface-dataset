# Jundot/Qwen3.8-27B-oQ8e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ8e-fp16-mtp es una cuantización mixta de precisión del modelo Qwen/Qwen3.8-27B, un modelo denso de visión-lenguaje de 27.781 millones de parámetros construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot mediante su herramienta oQ (oMLX v0.8.0), y está empaquetado en formato MLX para su ejecución en hardware Apple Silicon. El checkpoint incluye el backbone de lenguaje, el codificador de visión y la cabeza de predicción multi-token (MTP), con un contexto nativo de 262.144 tokens.

El modelo resuelve el problema de desplegar un VLM de 27B en memoria unificada de equipos Mac: frente a un checkpoint BF16 de aproximadamente 55 GB, esta build ocupa 30.923 GB (28.799 GiB) con un promedio efectivo de 8.905 bits por peso en el checkpoint completo y 8.501 bits por peso en el backbone de lenguaje. La cuantización se asigna por sensibilidad medida de cada capa, no de forma uniforme, y se complementa con una matriz de importancia y un reajuste ponderado de escala y sesgo por grupo.

Es relevante ahora porque demuestra que la cuantización selectiva de un VLM con encoder de visión y cabeza MTP puede mantener el pipeline image-text-to-text íntegro en un solo artefacto MLX, con licencia Apache-2.0 heredada del modelo base. La actualización de noviembre de 2026 re-cuantiza con el redondeo oQe refinado, que reduce el error de cuantización sin cambiar tamaño ni velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet y Gated Attention (Qwen3.5), con codificador de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ8e mixta: affine 8-bit grupo 64 (98,143% de los pesos), FP16 (0,198%), FP32 (1,658%) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea un layout híbrido que combina capas Gated DeltaNet con capas Gated Attention, una variante de atención lineal recurrente junto a atención clásica. Incluye un codificador de visión para comprensión de imagen y vídeo, y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa interna. El contexto nativo es de 262.144 tokens. Los detalles de composición del dataset de entrenamiento, número de tokens y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La innovación de este checkpoint es la cuantización oQ8e: se asignan bits según la sensibilidad medida de cada capa, y cada grupo se redondea con una matriz de importancia construida con 128 muestras de 512 tokens, seguida de un reajuste de mínimos cuadrados ponderados de escala y sesgo. El reparto resultante concentra el 98,143% de los pesos lógicos en affine 8-bit con grupo 64 (26.980 GiB), deja un 0,198% en FP16 (0,103 GiB) y un 1,658% en FP32 (1.716 GiB), que corresponde al codificador de visión mantenido en FP32. Las escalas y sesgos de cuantización se almacenan en FP16 en lugar de BF16.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imagen y vídeo (pipeline image-text-to-text).
- Predicción multi-token (MTP) para acelerar la decodificación.
- Procesamiento de contexto largo: hasta 262.144 tokens nativos.
- Ejecución nativa en MLX sobre Apple Silicon, con pesos ya cuantizados.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede ingerir contratos, informes o manuales de hasta 262.144 tokens junto con sus figuras y tablas, y responder preguntas que cruzan texto y contenido visual en una sola pasada.
- Descripción y extracción de datos de vídeo: al incluir comprensión de vídeo en el pipeline image-text-to-text, sirve para generar resúmenes, transcripciones descriptivas o índices de escenas en archivos locales de un Mac.
- Asistente conversacional local en estación de trabajo Apple: con 28.799 GiB de almacenamiento de pesos, cabe en equipos con memoria unificada de 32 GB o más, lo que permite un asistente privado sin conexión a servicios externos.
- Prototipado de aplicaciones VLM en MLX: al estar ya en formato MLX con cuantización mixta, se integra directamente en proyectos Swift o Python sobre mlx para validar pipelines de visión-lenguaje antes de pasar a producción.
- Evaluación de cuantización en investigación: la distribución de bits documentada (8,50 bits/peso en el backbone, 8,905 en total) permite medir la degradación frente al checkpoint original en tareas de razonamiento visual.
- Generación aumentada por recuperación sobre corpus visuales: la ventana de 262.144 tokens admite inyectar grandes lotes de fragmentos recuperados junto con imágenes de referencia en una única llamada.
- Procesamiento por lotes de imágenes en local: catalogación, etiquetado y moderación de contenido visual en equipos de escritorio sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento de pesos: 30.923 GB (28.799 GiB) en disco para el checkpoint completo.
- VRAM o memoria unificada estimada para inferencia: al menos 32 GB para cargar los pesos; se recomienda 64 GB o más para margen de contexto largo, caché KV y el codificador de visión en FP32.
- GPU recomendadas: hardware Apple Silicon con memoria unificada amplia (familias M-series Pro, Max y Ultra). No es compatible de forma nativa con CUDA; requiere el runtime MLX.
- Cabe en GPU de consumo: no en GPUs NVIDIA de consumo por el formato MLX; en Apple Silicon, sí en configuraciones de 32 GB o superiores, con holgura creciente a 64 GB y 128 GB.
- Opciones de despliegue: runtime MLX (librería mlx), herramienta oMLX del mismo autor para gestión de cuantizaciones oQ. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ8e-fp16-mtp (este) | 27,781B | 262.144 | MLX safetensors, 8,905 bits/peso efectivos | Apache-2.0 | Incluye encoder de visión y cabeza MTP; 28.799 GiB |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | safetensors originales | Apache-2.0 | Pesos sin cuantizar; mayor huella de memoria |
| Alternativas de la misma categoría (VLM densos de ~27B en MLX) | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- La cuantización a 8,905 bits/peso efectivos introduce error respecto al modelo base; no se han publicado métricas de degradación en benchmarks.
- El codificador de visión se mantiene en FP32 (1,658% de los pesos lógicos), lo que incrementa la huella frente a una cuantización uniforme.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Qwen3.8-27B.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el riesgo habitual de los modelos generativos de 27B, especialmente en descripciones de imágenes ambiguas.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base.
- Dependencia de plataforma: formato MLX, por lo que no se ejecuta en CUDA sin conversión previa.
- La model card advierte de que las copias anteriores al 19 de noviembre de 2026 deben descargarse de nuevo para obtener el redondeo oQe refinado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
