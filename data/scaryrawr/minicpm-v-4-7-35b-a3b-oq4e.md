# scaryrawr/MiniCPM-V-4.7-35B-A3B-oQ4e

## Resumen
MiniCPM-V-4.7-35B-A3B-oQ4e es una versión cuantizada del modelo multimodal MiniCPM-V 4.7 en su variante 35B-A3B, desarrollada por el usuario scaryrawr. Se trata de un modelo de visión-lenguaje con arquitectura de mezcla de expertos (MoE) que combina un codificador visual SigLIP con un backbone de lenguaje Qwen3.5. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.1.dev1) en precisión mixta, alcanzando una media efectiva de 4,833 bits por peso sobre un total de 35.212.875.824 parámetros.

El modelo base, publicado por OpenBMB el 12 de octubre de 2026, es el primer MoE de la serie MiniCPM-V y está diseñado para inferencia en dispositivo, incluyendo soporte para imágenes individuales, múltiples imágenes y vídeo. Esta versión cuantizada reduce el peso del checkpoint a 21,3 GB (19,814 GiB), lo que facilita su despliegue en equipos con Apple Silicon mediante la librería MLX. Su relevancia radica en permitir ejecutar un VLM de 35B parámetros con requisitos de memoria moderados, manteniendo la mayor parte de los pesos en 4 bits y reservando precisiones superiores para capas críticas.

La licencia del repositorio no se especifica, aunque el modelo original se distribuye bajo Apache 2.0 según las fuentes disponibles. No se han publicado datos sobre longitud de contexto, idiomas soportados ni resultados de benchmarks en la información proporcionada para esta cuantización concreta.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); visión: SigLIP con window-attention merger; lenguaje: Qwen3.5 |
| Parametros totales | 35.212.875.824 (35,2B) |
| Parametros activos | 3B (según nomenclatura 35B-A3B del modelo base; no confirmado en la información del repositorio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ (oMLX v0.7.1.dev1): affine 4-bit grupo 64 (93,132% de los pesos), 5-bit, 6-bit, 8-bit y BF16; media efectiva 4,833 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio; el modelo base MiniCPM-V 4.7 se distribuye bajo Apache 2.0 según fuentes web |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
El modelo base MiniCPM-V 4.7 35B-A3B es un transformer multimodal con mezcla de expertos. La torre de visión emplea un codificador SigLIP con un merger de atención de ventana, mientras que el backbone de lenguaje es Qwen3.5. Soporta dos modos de downsampling visual, 4x y 16x, lo que permite ajustar el coste computacional del procesamiento de imágenes. La variante 35B-A3B activa aproximadamente 3.000 millones de parámetros por token, según la nomenclatura del nombre, lo que reduce el coste de inferencia frente a un modelo denso de tamaño similar.

Entre las innovaciones técnicas del modelo original se encuentran Lookahead Expert Scheduling (LES), que precarga expertos entre capas, y DSpark speculative sampling, que acelera la decodificación. La cuantización aquí presentada aplica precisión mixta por capas: la mayor parte de los pesos (93,1%) se almacena en affine 4-bit con grupo de 64, mientras que una fracción menor (6,9%) se mantiene en 5, 6, 8 bits o BF16 para preservar la precisión en componentes sensibles. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades
- Comprensión de imágenes individuales, múltiples imágenes y vídeo, según las capacidades del modelo base.
- OCR y extracción de texto a partir de imágenes.
- Razonamiento visual en dominios como física, según pruebas locales publicadas.
- Depuración de SQL y generación de código a partir de contexto visual.
- Traducción multilingüe, mencionada en análisis de terceros.
- Generación de texto y razonamiento general heredados del backbone Qwen3.5.
- No se especifica soporte explícito de tool calling o function calling en la información disponible.
- No se documentan modo thinking, entrada de audio ni otras capacidades especiales en las fuentes consultadas.

## Casos de uso
- Digitalización de documentos: el modelo puede extraer texto de imágenes y capturas mediante OCR, lo que resulta útil para convertir facturas, formularios o apuntes en texto estructurado.
- Depuración de SQL: a partir de una captura de pantalla de una consulta o de un error, el modelo puede analizar el contexto visual y proponer correcciones, integrándose en flujos de trabajo de desarrollo.
- Análisis de vídeo para vigilancia o monitorización: gracias al soporte de vídeo del modelo base, se pueden resumir eventos o detectar objetos en secuencias, aunque no se especifica la longitud máxima de vídeo.
- Traducción de contenido multimodal: el modelo puede traducir texto incrustado en imágenes o acompañar traducciones de descripciones visuales, según las pruebas multilingües mencionadas.
- Asistencia en razonamiento científico: resolución de problemas de física o matemáticas a partir de diagramas y enunciados visuales, como se ha probado localmente.
- Atención al cliente con soporte visual: gestión de conversaciones en las que el usuario adjunta imágenes de productos o errores, permitiendo respuestas contextualizadas.
- Accesibilidad: descripción de imágenes para personas con discapacidad visual, generando texto alternativo detallado.
- Moderación de contenido: análisis de imágenes y vídeo para identificar contenido inapropiado, aunque no se han publicado métricas específicas de precisión.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible para esta cuantización concreta. Las fuentes web mencionan pruebas locales de OCR, SQL y física, pero no proporcionan cifras comparables (MMLU, HumanEval, GSM8K, etc.) que puedan reproducirse en esta ficha. Se recomienda consultar la model card del modelo base para obtener datos de rendimiento del modelo sin cuantizar.

## Requisitos de hardware
- El repositorio está en formato MLX, por lo que está orientado a equipos Apple Silicon (series M1, M2, M3, M4).
- Tamaño del checkpoint: 21,3 GB (19,814 GiB de pesos). Se recomienda un mínimo de 24 GB de memoria unificada para cargar el modelo completo y dejar espacio para el contexto y el runtime.
- En GPUs NVIDIA no es directamente compatible con MLX; sería necesario convertir los pesos a otro formato (por ejemplo, GGUF) para usar llama.cpp u otros motores, conversión no documentada en este repositorio.
- Opciones de despliegue: MLX (mlx-lm) y la herramienta oMLX empleada para la cuantización. No se mencionan vLLM, TGI, Ollama ni llama.cpp para este formato.
- Latencia y throughput: no disponibles para este repositorio. El modelo base logra 17,39 tokens/s en un iPad Pro M4 (16 GB) con decodificación offloaded a SSD, y 13+ tokens/s en un iPhone 17 Pro Max, según fuentes de terceros.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B (original) | 35B (3B activos) | no disponible | Apache 2.0 | safetensors |
| MiniCPM-V-4.7-35B-A3B-oQ4e (este) | 35,2B (3B activos) | no disponible | no disponible en el repositorio | MLX safetensors |
| Otros VLM de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre esta cuantización y alternativas como Qwen2.5-VL o InternVL en la información proporcionada. La comparativa se limita al modelo base sin cuantizar, del que se diferencia por el formato MLX y la precisión reducida.

## Limitaciones y advertencias
- La cuantización mixta a 4,833 bits por peso puede introducir una degradación de precisión respecto al modelo original en BF16, especialmente en tareas que requieren matices numéricos o textuales.
- La licencia del repositorio no está especificada. Aunque el modelo base es Apache 2.0, se debe verificar la licencia de esta cuantización antes de un uso comercial.
- Los modelos de visión-lenguaje presentan riesgo de alucinación, especialmente al describir imágenes ambiguas o generar texto a partir de ellas.
- No se han documentado sesgos específicos ni evaluaciones de equidad para esta cuantización.
- Se desconoce la longitud de contexto soportada y los idiomas cubiertos, lo que limita la planificación de despliegues multilingües o con contextos extensos.
- El formato MLX restringe el hardware a Apple Silicon; no es directamente ejecutable en GPUs NVIDIA o AMD sin conversión adicional.
- No se garantiza soporte para tool calling o function calling, capacidades no confirmadas en las fuentes.
- El rendimiento en producción puede variar según la memoria disponible y el uso de decodificación offloaded a SSD.

## Enlaces
- Repositorio de la cuantización: https://huggingface.co/scaryrawr/MiniCPM-V-4.7-35B-A3B-oQ4e
- Modelo base MiniCPM-V 4.7 35B-A3B: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Documentación de Transformers para MiniCPM-V 4.7: https://huggingface.co/docs/transformers/main/model_doc/minicpmv4_7
- Análisis local de MiniCPM-V 4.7 (OCR, SQL, física): https://www.mindstudio.ai/blog/minicpm-v-4-7-local-test
- Noticia sobre el lanzamiento y LES: https://aicoder.com/news/news-20261013-openbmb-minicpm-v-4-7-35b-a3b-on-device-moe
- Análisis sobre ejecución en iPhone: https://www.explainx.ai/blog/minicpm-v-4-7-35b-a3b-on-device-moe-iphone-lookahead-expert-scheduling-2026
- Herramienta oQ (oMLX) utilizada para la cuantización: https://github.com/jundot/omlx
