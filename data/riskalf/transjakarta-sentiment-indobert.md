# riskalf/transjakarta-sentiment-indobert

## Resumen

`riskalf/transjakarta-sentiment-indobert` es un modelo de clasificación de texto en indonesio, afinado a partir de una base IndoBERT, orientado al análisis de sentimiento sobre opiniones relacionadas con TransJakarta, el sistema de autobuses de tránsito rápido de Yakarta. Lo publica el usuario `riskalf` en Hugging Face y se distribuye en formato `safetensors` con la librería `transformers`, listo para su uso en pipelines de `text-classification`.

El modelo cuenta con 124.442.882 parámetros, lo que encaja con la arquitectura BERT-base (~110-125 millones de parámetros). Se trata por tanto de un encoder bidireccional de tamaño medio, no de un modelo generativo: su función es producir una etiqueta de sentimiento (probablemente positiva, negativa o neutra, aunque la model card no lo especifica) a partir de un texto de entrada.

La relevancia del modelo es acotada: es un ajuste fino de nicho, con muy poca tracción en el Hub (3 descargas, 0 likes) y una model card autogenerada que no documenta datos de entrenamiento, etiquetas, métricas ni licencia. Resulta útil como punto de partida para análisis de opinión pública sobre transporte urbano en Indonesia, pero requiere validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional), base IndoBERT; tipo exacto no disponible |
| Parametros totales | 124.442.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los modelos BERT-base suelen usar 512 tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible en la model card; por la base IndoBERT se infiere indonesio |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repo | 1.0 GB |
| Pipeline | text-classification |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT con 124,4 millones de parámetros, coherente con la familia BERT-base. El nombre del modelo indica que parte de IndoBERT, el modelo BERT preentrenado sobre corpus en indonesio, y que se ha ajustado fino para una tarea de clasificación de sentimiento. Al ser un encoder de clasificación, no dispone de decodificador ni de generación autoregresiva: la salida es una distribución sobre las clases de sentimiento.

No hay información pública sobre el conjunto de datos de entrenamiento (número de ejemplos, procedencia de los textos, etiquetas utilizadas), hiperparámetros, número de épocas, ni si se aplicaron técnicas de regularización o balanceo de clases. La model card es la plantilla autogenerada por Hugging Face y todos los campos relevantes aparecen como "[More Information Needed]". Tampoco se documentan innovaciones técnicas adicionales; se trata de un ajuste fino estándar.

## Capacidades

- Clasificación de sentimiento de textos en indonesio (presumiblemente comentarios o reseñas sobre TransJakarta).
- Clasificación de texto de una sola etiqueta por secuencia (pipeline `text-classification`).
- Inferencia rápida en CPU o GPU de gama baja por su tamaño moderado (124 M de parámetros).
- Compatible con Text Embeddings Inference y endpoints compatibles según los tags del repo.
- Capacidad multilingüe: no documentada; se limita, en principio, al indonesio.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Análisis de opinión pública sobre TransJakarta: procesar tuits, reseñas de apps o comentarios de usuarios para agregar el sentimiento hacia el servicio y detectar focos de insatisfacción por rutas, frecuencias o condiciones del autobús.
- Monitorización de redes sociales: clasificar en tiempo real menciones al operador de transporte y generar alertas cuando aumente el sentimiento negativo, con un coste computacional bajo gracias al tamaño del modelo.
- Cuadros de mando de atención al cliente: etiquetar automáticamente tickets o encuestas de satisfacción y priorizar los casos negativos para revisión humana.
- Investigación académica sobre movilidad urbana: usar el modelo como etiquetador base en estudios de percepción del transporte público en Yakarta, validando previamente su precisión sobre el corpus concreto.
- Enriquecimiento de datasets: preetiquetar grandes volúmenes de texto en indonesio para acelerar el etiquetado humano en proyectos de anotación.
- Filtrado de contenido en pipelines de datos: descartar o separar opiniones negativas de un flujo de comentarios antes de un análisis posterior (tópicos, clustering, etc.).
- Prototipado rápido: servir como línea base de clasificación de sentimiento en indonesio antes de invertir en un modelo mayor o en un ajuste propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp32 (124 M de parámetros × 4 bytes) y aproximadamente 0,25 GB en fp16; el repo ocupa 1,0 GB, lo que sugiere pesos en fp32 más posibles artefactos del optimizador.
- GPU recomendadas: cualquier GPU moderna sirve; una T4, L4, RTX 3060 o superior es más que suficiente. En A100/H100 el cuello de botella será el pipeline de datos, no el modelo.
- Cabe holgadamente en GPU de consumo, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Embeddings Inference (soportado según tags), y en general cualquier servidor compatible con modelos de clasificación de Hugging Face. No se documenta soporte GGUF/llama.cpp ni Ollama.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera un throughput alto (miles de secuencias por segundo en GPU con batching), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| riskalf/transjakarta-sentiment-indobert | 124,4 M | no disponible | Clasificación de sentimiento (indonesio, dominio TransJakarta) | no disponible | Hugging Face, 3 descargas |
| IndoBERT base (indolem/indobert-base-uncased) | ~124 M | 512 tokens (habitual) | Modelo base preentrenado en indonesio | normalmente MIT/Apache-2.0 según versión | Hugging Face, ampliamente usado |
| IndoBERT sentiment (ajustes comunitarios) | ~124 M | 512 tokens (habitual) | Clasificación de sentimiento en indonesio | variable según autor | Hugging Face, múltiples variantes |
| XLM-RoBERTa base | ~278 M | 512 tokens | Multilingüe, clasificación y NER | MIT | Hugging Face |

La comparación con alternativas concretas es limitada porque la model card no aporta métricas ni detalles de entrenamiento; los datos de IndoBERT y XLM-RoBERTa corresponden a sus especificaciones públicas habituales y no a una evaluación directa frente a este modelo.

## Limitaciones y advertencias

- Model card autogenerada: no hay información sobre datos de entrenamiento, etiquetas, métricas ni procedencia, lo que impide evaluar su calidad de forma objetiva.
- Licencia no especificada: no se puede garantizar el uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Sesgos desconocidos: al no documentarse el corpus, se desconoce la distribución de opiniones, la representación de rutas o la posible sobrerrepresentación de ciertos perfiles de usuarios.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de dominio: el modelo está ajustado a un tema concreto (TransJakarta) y probablemente generalice mal a otros contextos.
- Idiomas: no se documenta soporte multilingüe; se espera un rendimiento pobre fuera del indonesio.
- Longitud de contexto no confirmada: textos largos pueden truncarse sin que se indique el límite.
- Tracción mínima (3 descargas, 0 likes): no hay evidencia comunitaria de uso ni validación independiente.
- Fecha de creación futura en los metadatos del repo (2026-07-21), lo que sugiere metadatos inconsistentes o un artefacto de la plataforma; conviene verificarlo antes de confiar en las fechas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/riskalf/transjakarta-sentiment-indobert
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- IndoBERT (modelo base probable): https://huggingface.co/indolem/indobert-base-uncased
- Documentación de pipelines de clasificación de texto de transformers: https://huggingface.co/docs/transformers/tasks/sequence_classification
