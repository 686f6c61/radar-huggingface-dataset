# amogneandualem/HEP-VLMQA-GM-LoRA

## Resumen

HEP-VLMQA-GM-LoRA es un adaptador LoRA agrupado multitarea (Grouped Multitask LoRA) desarrollado por Amogne Andualem para el modelo base LLaVA-OneVision con Qwen2 7B. Está diseñado específicamente para la comprensión de figuras científicas y la reconstrucción de procedencia en física de altas energías (HEP). El adaptador se entrena sobre el conjunto de datos HEP-VLMQA, que contiene 560.909 pares pregunta-respuesta asociados a 122.987 figuras científicas.

El modelo resuelve el problema de evaluar y mejorar las capacidades de los modelos de lenguaje y visión (VLM) en un dominio científico altamente especializado, donde las figuras contienen información compleja sobre experimentos, resultados y metodologías. Su relevancia radica en que ofrece un adaptador ligero y reutilizable que se puede cargar sobre un modelo base público, permitiendo a investigadores y desarrolladores aplicar VQA multimodal a documentación científica de física de partículas sin necesidad de entrenar desde cero.

El adaptador utiliza una arquitectura LoRA con rango 32, alpha 64 y dropout 0.05, y se distribuye en formato safetensors. La longitud de contexto máxima es de 8.192 tokens, y el modelo está entrenado exclusivamente en inglés. La licencia es Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LLaVA-OneVision (Qwen2 7B) |
| Parametros totales | No disponible (el adaptador pesa 0.3 GB; el base tiene ~7B) |
| Parametros activos | No aplica (adaptador LoRA, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (pesos en BF16) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se basa en LLaVA-OneVision, un modelo multimodal que combina un codificador visual, un proyector multimodal y un modelo de lenguaje Qwen2 de 7B. La innovación principal es el enfoque GM-LoRA: agrupa múltiples registros de preguntas y respuestas asociados a la misma figura científica. El codificador visual y el proyector procesan la imagen una sola vez por grupo, y la representación visual resultante se reutiliza para todas las preguntas del grupo, mientras que el cálculo del modelo de lenguaje permanece específico para cada pregunta. Esto reduce el coste computacional y mejora la eficiencia del entrenamiento.

El entrenamiento utilizó 124.065 registros agrupados (de un total histórico de 640.582 registros con imágenes repetidas, que no es el tamaño canónico del benchmark). Se realizaron 30.809 pasos de optimización con una tasa de aprendizaje de 1e-4, weight decay de 0.01, warmup del 3% y scheduler coseno. La supervisión se aplicó solo a las respuestas, con ponderación de tareas por frecuencia inversa normalizada. El modelo se entrenó en 4 GPUs NVIDIA A800 de 80 GB, con precisión BF16. La pérdida de validación final fue de 1.11964.

## Capacidades

- Comprensión de figuras científicas en física de altas energías: reconocimiento de elementos visuales, detalles, interpretación y razonamiento sobre gráficos, diagramas y resultados experimentales.
- Reconstrucción de procedencia científica: identificación de entradas, métodos y procesos de generación de figuras a partir de la imagen.
- Respuesta a preguntas visuales de opción múltiple y de respuesta abierta (VQA multimodal).
- Generación de texto descriptivo y explicativo sobre figuras científicas.
- Soporte de conversación multimodal (image-text-to-text) gracias al modelo base LLaVA-OneVision.
- Capacidad de procesar imágenes con resolución variable (configuración `anyres_max_9`).
- No se ha documentado soporte explícito de tool calling ni agentes; el adaptador se centra en tareas de VQA.

## Casos de uso

- Revisión automatizada de literatura científica: el modelo puede analizar figuras de artículos de física de altas energías y responder preguntas sobre su contenido, facilitando la extracción rápida de información en revisiones sistemáticas.
- Asistencia a investigadores en la interpretación de resultados experimentales: dado un gráfico de colisiones o distribuciones de partículas, el modelo puede explicar qué representa y qué conclusiones se pueden extraer.
- Verificación de reproducibilidad: al reconstruir la procedencia de una figura (entradas, método, generación), el modelo ayuda a comprobar si los resultados presentados son consistentes con la metodología descrita.
- Educación y divulgación: estudiantes y divulgadores pueden interactuar con figuras de física de partículas y obtener explicaciones claras y contextualizadas.
- Indexación y búsqueda semántica de figuras: el modelo puede generar descripciones textuales de figuras que luego se utilizan para indexar y recuperar contenido en bases de datos documentales.
- Automatización de informes técnicos: integrado en pipelines de procesamiento de documentos, el modelo puede generar resúmenes de figuras para informes de laboratorio o publicaciones.

## Benchmarks y rendimiento

La evaluación se realizó sobre el conjunto de test retenido de HEP-VLMQA, con 100 artículos, 741 grupos de figuras, 3.240 preguntas de comprensión de figuras y 1.893 de reconstrucción de procedencia (total 5.133). La generación fue determinista, con un máximo de 32 tokens para la versión V1 y 256 para V2. Los resultados publicados son:

| Vista de evaluación | Token-F1 | ROUGE-L F1 | BERTScore F1 |
|---|---|---|---|
| Siete tareas (micro) | 0.5348 | 0.5119 | 0.9191 |
| Siete tareas (macro) | 0.5274 | 0.5040 | 0.9173 |
| Comprensión de figuras (macro) | 0.6037 | 0.5863 | 0.9333 |
| Reconstrucción de procedencia (macro) | 0.4257 | 0.3942 | 0.8960 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.3 GB, pero requiere cargar el modelo base LLaVA-OneVision de 7B, que necesita aproximadamente 14-16 GB de VRAM en BF16.
- Para inferencia en GPU de consumo, se recomienda una RTX 3090, RTX 4090 o similar con al menos 24 GB de VRAM.
- En GPUs profesionales, una A100 de 40 GB o H100 es suficiente para procesar lotes grandes o secuencias largas.
- El entrenamiento se realizó con 4 × NVIDIA A800 de 80 GB, pero la inferencia puede ejecutarse en una sola GPU.
- Opciones de despliegue: se puede usar con Transformers y PEFT, o exportar a formatos optimizados como vLLM o llama.cpp (aunque el adaptador está pensado para el ecosistema Transformers).
- La latencia dependerá del hardware; con una RTX 4090 se espera un throughput de decenas de tokens por segundo para el modelo base.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros adaptadores o modelos VQA científicos. El modelo base LLaVA-OneVision es comparable a otros VLM como LLaVA-NeXT o Qwen2-VL, pero el adaptador está especializado en el dominio HEP. Se puede comparar con el propio modelo base sin adaptar, que probablemente obtenga resultados inferiores en tareas específicas de física de altas energías, aunque no hay datos numéricos disponibles.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente en inglés; no soporta otros idiomas.
- El dominio de aplicación es muy específico (física de altas energías); su rendimiento en otras áreas científicas o figuras generales no está garantizado.
- Riesgo de alucinación en respuestas abiertas, especialmente en tareas de reconstrucción de procedencia donde la información no está explícitamente en la figura.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base LLaVA-OneVision tiene su propia licencia (Apache 2.0 también, según su ficha).
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus científico, puede reflejar sesgos presentes en la literatura.
- Para producción, se recomienda validar las respuestas en dominios críticos, ya que la precisión en tareas de procedencia es moderada (Token-F1 de 0.4257).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/amogneandualem/HEP-VLMQA-GM-LoRA)
- [Dataset HEP-VLMQA](https://huggingface.co/datasets/amogneandualem/HEP-VLMQA)
- [Repositorio GitHub del proyecto](https://github.com/amogneandualem/HEP-VLMQA)
- [Modelo base LLaVA-OneVision](https://huggingface.co/llava-hf/llava-onevision-qwen2-7b-ov-hf)
- [Perfil del autor en Hugging Face](https://huggingface.co/amogneandualem)
- [Perfil del autor en GitHub](https://github.com/amogneandualem)
