# ForeverBlue/Qwen3-VL-2B-GRACE-BF16

## Resumen

Qwen3-VL-2B-GRACE-BF16 es un modelo de visión-lenguaje (VLM) de 2.400 millones de parámetros, desarrollado por ForeverBlue como parte del framework GRACE (Gated Relational Alignment via Confidence-based Distillation). Se trata de un finetune del modelo base Qwen/Qwen3-VL-2B-Instruct, entrenado con el dataset ShareGPT4V y presentado en el artículo de ICML 2026 "Gated Relational Alignment via Confidence-based Distillation for Efficient VLMs". El objetivo principal es demostrar que un modelo pequeño puede igualar o superar a un profesor de 8B mediante destilación de conocimiento, manteniendo un coste computacional reducido.

Este checkpoint concreto es la versión en precisión completa BF16, sin cuantización, y sirve como punto de partida para las versiones cuantizadas W8G128 y W4G128 del mismo zoo de modelos. Su relevancia radica en que ofrece un VLM eficiente y de alto rendimiento para investigación en destilación, alineación multimodal y despliegue en entornos con recursos limitados. La licencia MIT permite uso comercial sin restricciones, y el modelo está disponible en formato safetensors compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, basado en Qwen3-VL-2B-Instruct) |
| Parametros totales | 2.438.696.960 (2,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificado en la informacion proporcionada) |
| Tipos de cuantizacion | BF16 (full precision); existen versiones INT8 (W8G128) e INT4 (W4G128) en el mismo zoo |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL-2B-Instruct, un transformer multimodal que procesa entradas de imagen y texto. El entrenamiento utiliza el framework GRACE, que combina alineación relacional gated con destilación basada en confianza. En este esquema, un modelo profesor (Qwen3-VL-8B) guía al estudiante de 2B mediante señales de confianza, permitiendo que el modelo pequeño aprenda representaciones visuales y lingüísticas más ricas que las que obtendría con un entrenamiento convencional. El dataset empleado es ShareGPT4V, un conjunto de datos de instrucciones visuales de alta calidad.

El checkpoint BF16 se entrena en precisión completa, sin cuantización, y sirve como inicialización para las versiones cuantizadas con QAT (Quantization-Aware Training). La evaluación se realiza siguiendo el protocolo LLaVA, con siete benchmarks multimodales estándar. No se especifican detalles sobre el número de tokens de entrenamiento ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto a partir de imágenes: responde preguntas, describe contenido visual y mantiene conversaciones multimodales.
- Razonamiento visual: resuelve tareas que requieren comprensión de escenas, objetos y relaciones espaciales.
- Comprensión de documentos e infografías: procesa diagramas, gráficos y capturas de pantalla.
- Soporte multilingüe: entrenado para inglés y chino.
- Capacidades de conversación: mantiene diálogos multi-turno con contexto visual.
- No se documentan capacidades de tool calling, function calling ni modo agente en la información proporcionada.

## Casos de uso

- Investigación en destilación de conocimiento: permite comparar el rendimiento de un estudiante de 2B frente a un profesor de 8B, sirviendo como referencia para estudios de eficiencia en VLMs.
- Prototipado de aplicaciones de visión-lenguaje: al ser un modelo pequeño y con licencia MIT, es adecuado para experimentar con chatbots visuales, asistentes de documentación o análisis de imágenes en entornos de desarrollo.
- Evaluación de benchmarks multimodales: su inclusión en el protocolo LLaVA facilita la reproducción de experimentos y la comparación con otros modelos de la misma categoría.
- Despliegue en entornos con recursos limitados: las versiones cuantizadas (W4G128) retienen el 98% del rendimiento promedio, lo que permite ejecutar el modelo en dispositivos edge o GPUs de gama baja.
- Generación de descripciones de imágenes para accesibilidad: puede integrarse en sistemas que automaticen la creación de texto alternativo para contenido visual.
- Análisis de documentos técnicos: su capacidad para procesar diagramas y gráficos lo hace útil para extraer información de manuales, informes o presentaciones.

## Benchmarks y rendimiento

La model card proporciona resultados en siete benchmarks multimodales, comparando el modelo con el profesor de 8B y el baseline de 2B sin GRACE. Los valores son los siguientes:

| Modelo | Params | Precision | HallB | MMBench | ScienceQA | AI2D | MMMU | SEED | MMStar | Avg |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Qwen3-VL-8B (profesor, ref.) | 8B | BF16 | 61.1 | 84.5 | 85.0 | 85.7 | 69.6 | 77.5 | 70.9 | 76.3 |
| Qwen3-VL-2B (baseline) | 2B | BF16 | 51.4 | 78.4 | 81.4 | 76.9 | 53.4 | 71.2 | 58.3 | 67.3 |
| **Qwen3-VL-2B-GRACE** | 2B | BF16 | **66.9** | **86.4** | **86.2** | **81.3** | **72.1** | **76.7** | **67.3** | **76.7** |
| Qwen3-VL-2B-GRACE (W8G128) | 2B | INT8 | 66.1 | 85.5 | 85.3 | 80.4 | 71.3 | 75.9 | 66.5 | 75.9 |
| Qwen3-VL-2B-GRACE (W4G128) | 2B | INT4 | 65.4 | 84.6 | 84.3 | 79.5 | 70.5 | 75.1 | 65.8 | 75.0 |

El modelo GRACE BF16 supera al baseline en +9.4 puntos de promedio y alcanza un rendimiento ligeramente superior al profesor de 8B (76.7 vs. 76.3) con aproximadamente un cuarto de los parámetros. La versión INT4 conserva el 98% del promedio BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 4.9 GB (2.438.696.960 parámetros × 2 bytes). Con overhead de activaciones y caché KV, se recomienda al menos 8 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: tarjetas con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10, L4 o A100. Las versiones cuantizadas (W4G128) reducen el requisito a aproximadamente 1.2 GB, permitiendo su uso en GPUs de 4 GB o incluso en CPU con llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y alta para consumidores.
- Opciones de despliegue: compatible con transformers (carga directa con `AutoModelForImageTextToText`), y las versiones cuantizadas pueden ejecutarse con vLLM, llama.cpp u Ollama, aunque no se documenta explícitamente en la ficha.
- Latencia y throughput: no se proporcionan datos específicos en la información disponible.

## Comparativa con modelos similares

La comparativa más directa se establece con el baseline Qwen3-VL-2B-Instruct y el profesor Qwen3-VL-8B, ambos incluidos en la tabla de benchmarks. Frente al baseline, GRACE aporta una mejora sustancial en todos los benchmarks, especialmente en HallB (+15.5) y MMMU (+18.7). Frente al profesor de 8B, el modelo de 2B logra un promedio ligeramente superior con una cuarta parte de los parámetros, lo que demuestra la eficacia de la destilación.

No se dispone de datos comparativos con otros VLMs de 2B fuera de la familia Qwen3-VL en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de 2B, puede presentar alucinaciones visuales en escenarios complejos, aunque el benchmark HallB muestra una mejora significativa frente al baseline (66.9 vs. 51.4).
- Limitaciones de idioma: solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Contexto limitado: no se especifica la longitud de contexto, pero al derivar de Qwen3-VL-2B-Instruct, es probable que herede las limitaciones del modelo base.
- Uso previsto: el autor declara que el modelo está orientado a investigación; para producción, se recomienda validar el comportamiento en el dominio específico.
- Licencia: MIT permite uso comercial, pero el modelo se distribuye sin garantías explícitas de seguridad o robustez.
- Dependencia del framework: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; se debe revisar antes de usar en entornos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-BF16
- Paper (arXiv): https://arxiv.org/abs/2601.22709
- DOI: https://doi.org/10.48550/arXiv.2601.22709
- Código (GitHub): https://github.com/ForeverBlue816/GRACE
- Demo (GRACE-VLM Space): https://huggingface.co/spaces/ForeverBlue/GRACE-VLM
- Versión INT4 (W4G128): https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-W4G128-AWQ
- Versión INT8 (W8G128): https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-W8G128
- Checkpoint LLaVA-1.5-7B-GRACE-W4G128: https://huggingface.co/ForeverBlue/LLaVA-1.5-7B-GRACE-W4G128
