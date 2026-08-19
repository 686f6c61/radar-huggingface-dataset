# hehua2008/gemma-4-26B-A4B-it-abliterated-MLX

## Resumen

El modelo `hehua2008/gemma-4-26B-A4B-it-abliterated-MLX` es una conversión al formato MLX (optimizado para Apple Silicon) de una versión *abliterated* (sin censura) del modelo Gemma 4 26B A4B de Google, creada por el usuario huihui-ai. El modelo original de Google es una arquitectura Mixture of Experts (MoE) con aproximadamente 25,8 mil millones de parámetros totales y 4 mil millones de parámetros activos por token, lo que lo hace eficiente en inferencia. La versión *abliterated* elimina los mecanismos de rechazo o censura del modelo, permitiendo respuestas sin restricciones en temas sensibles.

Esta conversión a MLX permite ejecutar el modelo en hardware de Apple (Mac con chips M1/M2/M3/M4) utilizando la librería `mlx-vlm`, que además soporta capacidades multimodales (entrada de imagen y texto, etiquetado como *any-to-any*). El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y modificación. Su relevancia radica en ofrecer una alternativa de código abierto, sin censura y eficiente para tareas de generación de texto y visión en entornos locales de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) - Gemma 4 |
| Parametros totales | 25.805.936.206 (~25,8B) |
| Parametros activos | 4B (según nomenclatura del modelo "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX, sin especificar cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, que emplea un diseño MoE con 26B parámetros totales y 4B activos por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, ya que solo una fracción de los parámetros se activa durante la inferencia. El modelo original de Google fue entrenado con un enfoque multimodal (texto e imagen) y posteriormente fine-tuneado por huihui-ai para eliminar los comportamientos de rechazo mediante la técnica de *abliteration*, que consiste en modificar los pesos del modelo para que no genere respuestas de negativa ante solicitudes consideradas sensibles o prohibidas.

La conversión a MLX se realizó con `mlx-vlm` versión 0.6.12, lo que añade soporte para visión y texto en el ecosistema MLX. No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de RLHF o DPO en el proceso de fine-tuning.

## Capacidades

- Generación de texto y razonamiento: capaz de producir respuestas coherentes y contextuales en tareas de lenguaje natural.
- Capacidades multimodales: acepta imágenes como entrada adicional al texto, permitiendo descripción de imágenes, respuesta a preguntas visuales, etc.
- Sin censura (abliterated): no aplica filtros de contenido ni respuestas de rechazo ante solicitudes sobre temas delicados.
- Soporte de tool calling: no confirmado explícitamente, aunque es una característica habitual en modelos de la familia Gemma.
- Optimizado para Apple Silicon mediante MLX: integración con la librería `mlx-vlm` para ejecución eficiente en Mac.
- Multilingüe: no se especifican idiomas concretos, pero los modelos Gemma suelen soportar múltiples lenguas.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir textos literarios, guiones o diálogos sobre cualquier temática sin filtros de censura, útil para escritores y creadores que necesitan explorar temas sensibles.
- Asistente de código en entornos Apple: al ser MLX, puede integrarse en flujos de desarrollo local en Mac, generando snippets, explicando código o depurando errores.
- Análisis de imágenes con texto: gracias a su naturaleza multimodal, puede describir imágenes, extraer información visual y responder preguntas sobre fotografías o diagramas.
- Investigación en IA sin censura: investigadores que estudian los efectos de la abliteration o que necesitan un modelo sin restricciones para análisis de sesgos o comportamientos.
- Despliegue local en Mac para prototipado: permite probar aplicaciones de IA generativa sin depender de servicios en la nube, con la ventaja de la privacidad de los datos.
- Fine-tuning adicional: al ser de código abierto y con licencia Apache 2.0, puede servir como base para adaptaciones específicas en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su versión base.

## Requisitos de hardware

- Al estar en formato MLX, requiere hardware Apple Silicon (M1, M2, M3, M4 o superiores).
- Tamaño del repositorio: 51,6 GB, lo que implica espacio en disco considerable.
- VRAM estimada: no disponible. Dado que es un modelo MoE con solo 4B activos, podría caber en Mac con 16 GB de memoria unificada, pero no se confirma sin cuantización.
- GPUs recomendadas: no aplica (solo Apple Silicon).
- Opciones de despliegue: mediante `mlx-vlm` (Python) o integración con herramientas que soporten MLX, como Ollama (si añade soporte).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-abliterated-MLX | 25,8B | 4B | no disponible | Apache 2.0 | HuggingFace |
| Gemma 3 27B (denso) | 27B | 27B | 128k (típico) | Gemma license | HuggingFace |
| Mixtral 8x7B | 46,7B | 12,9B | 32k | Apache 2.0 | HuggingFace |

La comparativa se basa en especificaciones generales conocidas de los modelos alternativos, pero no hay datos de rendimiento directos para el modelo evaluado. Gemma 3 27B es un modelo denso con mayor coste de inferencia, mientras que Mixtral 8x7B tiene más parámetros activos y un contexto menor. Este modelo destaca por su naturaleza abliterated y su soporte MLX.

## Limitaciones y advertencias

- Al ser un modelo sin censura, puede generar contenido inapropiado, ofensivo o peligroso si se utiliza sin control. No es adecuado para aplicaciones dirigidas al público general sin moderación.
- Riesgo de alucinación: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto; si es inferior a 128k, podría fallar en tareas que requieran ventanas largas.
- Idiomas: no se ha confirmado qué idiomas soporta correctamente; puede tener un rendimiento inferior en lenguas poco representadas.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo deriva de Gemma 4, que tiene sus propios términos de uso; es necesario verificar la licencia original de Google para cumplir con todas las condiciones.
- Dependencia de Apple Silicon: no es ejecutable en GPUs NVIDIA o AMD sin conversión adicional a otros formatos (por ejemplo, GGUF o PyTorch).
- La técnica de abliteration puede degradar ligeramente el rendimiento en tareas de seguridad o alineación, y no hay garantías de que el modelo sea completamente "uncensored" en todos los casos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/hehua2008/gemma-4-26B-A4B-it-abliterated-MLX)
- [Modelo base (huihui-ai)](https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated)
- [Licencia de Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Documentación de MLX-VLM](https://github.com/ml-explore/mlx-vlm)
