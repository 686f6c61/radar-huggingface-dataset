# andosen/medgemma-27b-it-mlx-5Bit

## Resumen

MedGemma es una colección de modelos de visión-lenguaje de Google DeepMind, construidos sobre la arquitectura Gemma 3, diseñados específicamente para el dominio médico. El modelo `google/medgemma-27b-it` es la variante multimodal de 27 mil millones de parámetros que acepta tanto texto como imágenes médicas (radiografías de tórax, patología, dermatología, imágenes de fondo de ojo) y genera informes radiológicos, razonamiento clínico y respuestas conversacionales en inglés.

La ficha que nos ocupa, `andosen/medgemma-27b-it-mlx-5Bit`, es una conversión de este modelo al formato MLX, el framework de Apple para aprendizaje automático en hardware con memoria unificada (Apple Silicon). La conversión se realizó con `mlx-lm` versión 0.31.2 y aplica una cuantización de 5 bits, lo que reduce el tamaño del archivo a 18.6 GB y permite su ejecución en equipos Mac con memoria unificada. Esta adaptación facilita el despliegue local de un modelo médico de alto rendimiento en entornos de desarrollo y experimentación.

El modelo conserva todas las capacidades del MedGemma 27B original, incluyendo la interpretación de imágenes médicas de alta dimensión, el análisis longitudinal de rayos X y la generación de informes, aunque la conversión a MLX limita su uso a entornos Apple (mlx-lm) y no es compatible directamente con infraestructuras basadas en CUDA como vLLM o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 27B) con encoder de vision y decoder de lenguaje |
| Parametros totales | 27 mil millones (modelo base); archivo cuantizado: 5.065.352.960 parametros en safetensors |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Gemma 3 27B soporta hasta 128K tokens |
| Tipos de cuantizacion | 5-bit (esta conversion MLX) |
| Idiomas soportados | ingles (en) |
| Licencia | Health AI Developer Foundations (licencia propietaria de Google) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

MedGemma 27B se basa en la arquitectura Gemma 3 de Google DeepMind, un modelo multimodal que combina un encoder de vision con un decoder de lenguaje transformer. El modelo acepta imagenes (radiografias de torax, laminas de patologia, imagenes de dermatologia, retinografias) junto con texto y genera respuestas textuales, incluida la generacion de informes radiologicos y el razonamiento clinico. El entrenamiento se realizo con un enfoque de vision-lenguaje sobre datos medicos, aunque no se han publicado los detalles exactos del dataset (numero de tokens, composicion) en la informacion proporcionada. El paper tecnico (arXiv:2507.05201) describe la metodologia completa de entrenamiento y evaluacion.

Esta version concreta es una conversion a MLX del modelo original, realizada por andosen. La conversion utiliza la libreria `mlx-lm` 0.31.2 y aplica una cuantizacion de 5 bits, que reduce el espacio en disco y el uso de memoria sin perder de forma significativa la precision del modelo. El archivo resultante ocupa 18.6 GB y contiene 5.065 millones de parametros cuantizados.

## Capacidades

- Interpretacion de imagenes medicas: rayos X de torax, patologia (histologia), dermatologia y fondo de ojo (fundus).
- Generacion de informes radiologicos automaticos a partir de imagenes.
- Comprension de texto medico y razonamiento clinico (diagnostico diferencial, explicaciones de casos).
- Clasificacion de imagenes en modo zero-shot y clasificacion de imagenes medicas.
- Extraccion de caracteristicas de imagen (embeddings) para tareas de recuperacion y analisis.
- Soporte multimodal: entrada de imagen + texto, salida de texto.
- Capacidad conversacional (chat) para interacciones de tipo asistente medico.
- No se indica soporte explicito de tool calling o function calling en la informacion proporcionada.

## Casos de uso

- **Generacion de informes radiologicos**: dado un rayos X de torax, el modelo puede producir un informe estructurado describiendo hallazgos, localizacion y severidad. Adecuado para acelerar el flujo de trabajo de radiologos en entornos de investigacion y prototipado.
- **Soporte a la decision clinica**: un sistema de ayuda al diagnostico puede presentar una imagen dermatologica y preguntar al modelo por posibles diagnositicos diferenciales, basandose en su razonamiento clinico multimodal.
- **Clasificacion zero-shot de imagenes medicas**: en un pipeline de triaje, el modelo puede clasificar imagenes de fundus o patologia sin entrenamiento previo especifico, asignando etiquetas como "normal" o "anomalia".
- **Extraccion de embeddings para busqueda semantica**: generar vectores de caracteristicas de imagenes medicas para construir un sistema de recuperacion de casos similares en una base de datos hospitalaria.
- **Asistente de conversacion medica**: un chatbot que responde preguntas sobre terminologia medica, interpretacion de resultados de laboratorio o explicacion de procedimientos, usando el modo chat del modelo.
- **Investigacion en IA medica**: servir como modelo base para fine-tuning en tareas especificas de vision medica o para generar datos sinteticos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper tecnico de MedGemma (arXiv:2507.05201) reporta evaluaciones en tareas de imagen medica, pero no se incluyen los numeros concretos en los datos proporcionados.

## Requisitos de hardware

- **Memoria estimada**: el archivo cuantizado ocupa 18.6 GB en disco. Para inferencia con MLX, se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo y el contexto.
- **GPU recomendadas**: Apple Silicon (M1 Pro, M2 Max, M3 Max, etc.) con 32 GB o mas de memoria unificada. No es compatible con GPUs NVIDIA/AMD en su formato MLX.
- **Opciones de despliegue**: exclusivamente con `mlx-lm` (pip install mlx-lm) en Macos. No funciona con vLLM, llama.cpp, Ollama o TGI en su formato actual.
- **Latencia y throughput**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| andosen/medgemma-27b-it-mlx-5Bit | 27B (5-bit) | no disponible | Health AI Developer Foundations | MLX | Macos |
| google/medgemma-27b-it | 27B | no disponible (Gemma 3 base: 128K) | Health AI Developer Foundations | safetensors (transformers) | Multiplataforma |
| google/medgemma-4b | 4B | no disponible | Health AI Developer Foundations | safetensors | Multiplataforma |
| Qwen/Qwen3.5-27B | 27B | no disponible | Apache 2.0 | safetensors, GGUF | Multiplataforma |

Nota: no hay datos de rendimiento comparativo disponibles en la informacion proporcionada. Qwen3.5-27B aparece como alternativa generica de 27B, pero no es especifico para medicina.

## Limitaciones y advertencias

- **Licencia restringida**: la licencia Health AI Developer Foundations no es open source; tiene restricciones de uso comercial y de redistribucion. No se puede usar en productos comerciales sin revisar los terminos de Google.
- **Solo ingles**: el modelo esta entrenado unicamente en ingles; no soporta otros idiomas de forma nativa.
- **Riesgo de alucinacion**: en entornos medicos, el modelo puede generar respuestas plausibles pero incorrectas. No debe usarse como sustituto de un diagnostico clinico profesional.
- **Sesgos**: los datos de entrenamiento pueden reflejar sesgos en la representacion de poblaciones, condiciones medicas o equipos de imagen.
- **Contexto limitado en la conversion**: la cuantizacion de 5 bits puede degradar ligeramente la precision en tareas de vision de alta complejidad.
- **Compatibilidad restringida**: el formato MLX solo funciona en Macos con Apple Silicon; no se puede desplegar en infraestructura cloud estandar con GPUs NVIDIA.
- **Sin soporte de tool calling**: no se indica soporte para function calling ni integracion con herramientas externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andosen/medgemma-27b-it-mlx-5Bit
- Modelo base original: https://huggingface.co/google/medgemma-27b-it
- Pagina de MedGemma en Google DeepMind: https://deepmind.google/models/gemma/medgemma/
- Documentacion de Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/medgemma
- Paper tecnico: https://arxiv.org/abs/2507.05201
