# AleksanderObuchowski/Tectal

## Resumen

Tectal es un modelo de decisión (decision model) para tareas de elección múltiple, desarrollado por AleksanderObuchowski y publicado en Hugging Face bajo una licencia de tipo research-preview con acceso restringido. Se construye como un adaptador LoRA sobre google/gemma-4-31b-it, lo que implica que hereda la arquitectura y el conocimiento del modelo base de Google, pero se especializa en seleccionar una opción entre varias alternativas dadas. El pipeline declarado es `multiple-choice` y los idiomas soportados son polaco (pl) e inglés (en).

El modelo se distribuye en dos formatos: safetensors (pesos del adaptador) y GGUF (para su uso con llama.cpp y herramientas compatibles). A pesar de que el modelo base tiene 31 000 millones de parámetros, el dato de parámetros totales reportado en safetensors es de 122 429 440, lo que corresponde al tamaño del adaptador LoRA y no al del modelo completo. El repositorio ocupa 15,2 GB, un tamaño coherente con la inclusión de pesos cuantizados en GGUF además de los safetensors del adaptador.

Su relevancia radica en ser un ejemplo de especialización mediante LoRA sobre un modelo grande para una tarea concreta (elección múltiple), con soporte para inferencia local vía llama.cpp gracias al formato GGUF. No obstante, la información pública disponible es muy limitada: no hay descargas ni likes, no se han publicado resultados de benchmarks en la información proporcionada y el acceso está restringido, lo que condiciona su evaluación y adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre google/gemma-4-31b-it) |
| Parametros totales | 122.429.440 (adaptador LoRA en safetensors); modelo base: 31 000 millones (según nomenclatura del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones no especificadas); safetensors |
| Idiomas soportados | pl, en |
| Licencia | research-preview (license:other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Tectal no es un modelo entrenado desde cero, sino un adaptador LoRA (Low-Rank Adaptation) aplicado sobre google/gemma-4-31b-it. Por tanto, la arquitectura subyacente es la del modelo base de Google (familia Gemma), si bien la información proporcionada no detalla la arquitectura interna del mismo (tipo de transformer, mecanismos de atención, etc.). El adaptador añade un número reducido de parámetros entrenables (122 429 440 según safetensors) que se combinan con los pesos congelados del modelo base.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. La tarea declarada es `multiple-choice`, lo que sugiere un ajuste orientado a la selección de respuestas entre opciones, probablemente mediante un formato de clasificación o puntuación de candidatos. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La disponibilidad en GGUF indica compatibilidad con llama.cpp, lo que facilita la inferencia local del adaptador junto con el modelo base cuantizado.

## Capacidades

- Selección de respuesta en tareas de elección múltiple: el pipeline declarado es `multiple-choice`, por lo que el modelo está orientado a puntuar o elegir entre varias opciones dadas.
- Soporte bilingüe polaco-inglés: los idiomas declarados son pl y en, lo que permite su uso en tareas de elección múltiple en ambos idiomas.
- Herencia de capacidades del modelo base: al ser un adaptador sobre google/gemma-4-31b-it, conserva las capacidades generales del modelo base (generación de texto, razonamiento, conocimiento general), aunque no se detallan en la información disponible.
- Inferencia local vía llama.cpp: la distribución en GGUF permite ejecutar el modelo con herramientas compatibles con llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Evaluación automatizada de exámenes tipo test: el modelo puede recibir una pregunta con varias opciones y seleccionar la respuesta correcta, aprovechando su ajuste específico para `multiple-choice`.
- Clasificación de respuestas en encuestas: dado un conjunto de opciones predefinidas, el modelo asigna la opción más probable, útil para procesar respuestas abiertas y mapearlas a categorías cerradas.
- Filtrado de candidatos en pipelines de anotación: en tareas de etiquetado donde cada ítem tiene un conjunto finito de etiquetas, el modelo puede puntuar cada opción y priorizar la revisión humana sobre los casos ambiguos.
- Soporte a sistemas de preguntas y respuestas con opciones cerradas: en asistentes que deben elegir entre alternativas predefinidas (por ejemplo, selección de producto o categoría), el modelo puede resolver la elección en polaco o inglés.
- Evaluación de modelos o datasets en investigación: al ser un modelo de investigación con licencia research-preview, puede emplearse como baseline en experimentos de elección múltiple en entornos académicos.
- Despliegue local en entornos con recursos limitados: gracias al formato GGUF y a que el adaptador es pequeño, puede ejecutarse con llama.cpp sobre el modelo base cuantizado, sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa. El adaptador LoRA ocupa 122 429 440 parámetros, pero requiere cargar el modelo base google/gemma-4-31b-it, de 31 000 millones de parámetros. En cuantización de 4 bits, el modelo base necesitaría aproximadamente 16-18 GB de VRAM; en 8 bits, en torno a 31-33 GB; en fp16, unos 62 GB. Estas cifras son estimaciones a partir del tamaño del modelo base y no datos publicados para Tectal.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo base, serían necesarias GPU con al menos 24 GB de VRAM para cuantizaciones agresivas (RTX 3090/4090) y GPU de datacenter (A100 40/80 GB, H100) para precisiones mayores.
- ¿Cabe en GPU de consumo? Con cuantización de 4 bits del modelo base, podría caber en GPUs de 24 GB (RTX 3090, RTX 4090) y posiblemente en GPUs de 16 GB con cuantizaciones más agresivas, aunque no se dispone de confirmación oficial.
- Opciones de despliegue: llama.cpp (soporte GGUF declarado), y herramientas compatibles con GGUF como Ollama o LM Studio. No se documenta soporte explícito para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Como referencia estructural, el modelo base google/gemma-4-31b-it es el punto de comparación natural, pero no se han publicado métricas de Tectal frente a alternativas de elección múltiple.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tectal | 122,4 M (adaptador LoRA) sobre base de 31 000 M | no disponible | research-preview | safetensors, GGUF | Especializado en multiple-choice, pl/en |
| google/gemma-4-31b-it | 31 000 M (según nomenclatura) | no disponible | no disponible | no disponible | Modelo base sobre el que se aplica el LoRA |
| Alternativas de elección múltiple | no disponible | no disponible | no disponible | no disponible | No se dispone de datos |

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que limita su uso inmediato y su reproducibilidad.
- Licencia research-preview: no está claro si permite uso comercial; debe revisarse la licencia `other` asociada antes de cualquier despliegue en producción.
- Información muy escasa: no se documentan datos de entrenamiento, benchmarks, contexto máximo ni detalles de arquitectura, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo de alucinación: al heredar el comportamiento del modelo base y no disponer de métricas, no puede descartarse la generación de respuestas incorrectas o inconsistentes en tareas de elección múltiple.
- Sesgos: no se han publicado análisis de sesgos; al estar entrenado presumiblemente con datos en polaco e inglés, puede presentar sesgos culturales y lingüísticos propios de esos idiomas.
- Limitaciones de idioma: solo se declaran pl y en; el rendimiento en otros idiomas no está garantizado.
- Dependencia del modelo base: el adaptador requiere cargar google/gemma-4-31b-it, con los requisitos de hardware y las condiciones de licencia que ello implica.
- Sin métricas de producción: no hay datos de latencia, throughput ni estabilidad, por lo que su uso en producción requeriría una evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/AleksanderObuchowski/Tectal
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
