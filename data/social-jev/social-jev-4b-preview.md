# social-jev/social-jev-4B-preview

## Resumen

SocialJev 4B Preview es un modelo de clasificación para ciencias sociales desarrollado por el equipo social-jev, construido como un fine-tuning de Qwen/Qwen3-4B. Su propuesta consiste en combinar el conocimiento de un modelo de lenguaje preentrenado con miles de millones de tokens con la velocidad de los métodos NLP ligeros, exponiendo una interfaz tipada mediante la cual el usuario define una tarea de clasificación (una consulta con un conjunto cerrado de opciones) y recibe una salida tipada con la opción elegida y sus probabilidades. Está inspirado en los modelos "system one" de TypeSafe y su modelo Jev.

El modelo tiene 4.022.470.657 parámetros según los pesos en safetensors, se distribuye en formato transformers con pesos safetensors y código personalizado (`trust_remote_code=True`), y se publica con pipeline de `feature-extraction` aunque sus etiquetas lo orientan a clasificación. El repositorio ocupa 8,1 GB y se encuentra en estado de preview, con interfaces que el autor advierte que pueden cambiar entre versiones.

Es relevante ahora porque propone un patrón distinto al de los LLM generativos: en lugar de generar texto libre, el modelo responde a consultas de clasificación estructuradas, lo que facilita su integración en pipelines de investigación social donde se necesita asignar etiquetas a grandes volúmenes de documentos con salidas verificables y probabilidades asociadas. No hay datos publicados sobre licencia, idiomas soportados ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3-4B); detalles internos no disponibles |
| Parametros totales | 4.022.470.657 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer de 4.000 millones de parámetros aproximadamente, y se presenta como un fine-tuning orientado a clasificación con una interfaz tipada propia. La model card no detalla la arquitectura interna más allá del modelo base, ni especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

La innovación principal descrita es la interfaz: el usuario define una `Query` con un texto y una lista de opciones, agrupa varias consultas en un `Request` junto con un `state` (el documento a clasificar) y obtiene resultados con `.choice` y `.probabilities`. El paquete `social-jev` abstrae el backend de inferencia, permitiendo usar Transformers o vLLM con la misma API, y ofrece tanto ejecución síncrona (`.query()`) como asíncrona (`.aquery()`) para solapar la preparación de lotes con la inferencia.

## Capacidades

- Clasificación de texto con opciones cerradas: asigna un documento a una de las categorías definidas en la consulta y devuelve probabilidades por opción.
- Interfaz tipada con Pydantic: las consultas y resultados se modelan como objetos validados.
- Múltiples consultas por documento: un mismo `Request` puede incluir varias `Query`, y los resultados se ordenan primero por documento y luego por consulta.
- Procesamiento por lotes: acepta listas de `Request` para clasificar varios documentos en una sola llamada.
- Ejecución síncrona y asíncrona: `.query()` y `.aquery()` con soporte de envíos concurrentes en el backend vLLM.
- Compatibilidad con Transformers y vLLM: el mismo modelo se puede cargar directamente con `AutoModel.from_pretrained` o mediante el paquete `social-jev` con backend vLLM.
- Capacidades generativas, de razonamiento, código, matemáticas, visión, tool calling o agentes: no documentadas en la información disponible.

## Casos de uso

- Codificación de documentos políticos: clasificar actas de consejos municipales, programas electorales o borradores legislativos en áreas temáticas (transporte, educación, sanidad) usando consultas con opciones cerradas y revisando las probabilidades para detectar casos ambiguos.
- Análisis de encuestas abiertas: asignar respuestas de texto libre a categorías predefinidas de actitud o tema, con la ventaja de obtener una distribución de probabilidad por respuesta en lugar de una etiqueta única sin incertidumbre.
- Etiquetado de corpus a gran escala: procesar lotes de miles de documentos con el backend vLLM y envíos asíncronos, aprovechando la API tipada para mantener la trazabilidad entre documento, consulta y resultado.
- Investigación en ciencias sociales: medir la presencia de marcos discursivos o temas en noticias y redes sociales mediante consultas reutilizables, facilitando la reproducibilidad al definir la tarea de forma explícita en el código.
- Moderación y triaje de contenido: clasificar mensajes en categorías de riesgo o temáticas antes de un análisis humano, usando las probabilidades para priorizar la revisión manual de los casos con mayor incertidumbre.
- Enriquecimiento de bases de datos: añadir columnas categóricas derivadas del texto (sector, tipo de documento, ámbito geográfico) en pipelines ETL, con la salida tipada integrada directamente en el esquema de datos.
- Evaluación comparativa de anotadores: usar el modelo como anotador automático de referencia frente a codificadores humanos y calcular acuerdos a partir de las probabilidades devueltas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.022 millones de parámetros, en precisión completa (FP32) se requieren aproximadamente 16 GB de VRAM; en BF16/FP16, unos 8 GB; en cuantización de 8 bits, unos 4 GB; en 4 bits, unos 2-2,5 GB. Estas cifras son estimaciones a partir del tamaño de los pesos, no datos publicados por el autor.
- GPU recomendadas: para BF16, una RTX 4090 (24 GB) o A100/H100; para lotes grandes con vLLM, A100 40/80 GB o H100.
- GPU de consumo: cabe en GPUs consumer con 8 GB o más en BF16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y en GPUs con 4-6 GB si se cuantiza.
- Opciones de despliegue: Transformers (`AutoModel.from_pretrained` con `trust_remote_code=True`) y vLLM a través del paquete `social-jev[vllm]`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SocialJev 4B Preview | 4.022 M | No disponible | Clasificación con interfaz tipada | No disponible | Hugging Face, preview |
| Qwen/Qwen3-4B | ~4.000 M | No disponible en la información proporcionada | Generación de texto general | No disponible en la información proporcionada | Hugging Face |
| Jev (TypeSafe) | No disponible | No disponible | Clasificación "system one" | No disponible | Referenciado en la model card, sin datos técnicos en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Estado preview: el autor advierte que las interfaces pueden cambiar entre versiones tempranas, por lo que no es recomendable fijar la API en producción sin control de versiones.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base Qwen3-4B y la del propio fine-tuning antes de desplegarlo.
- Idiomas no documentados: se desconoce qué lenguas cubre el fine-tuning; el rendimiento en castellano no está garantizado.
- Contexto no documentado: se desconoce la ventana máxima, lo que limita la planificación para documentos largos.
- Riesgo de alucinación en la asignación: al ser un modelo de lenguaje adaptado a clasificación, puede producir distribuciones de probabilidad mal calibradas o sesgadas hacia determinadas opciones; conviene validar con un conjunto etiquetado propio.
- Sesgos: no se documentan evaluaciones de sesgo; los modelos entrenados con datos sociales pueden reproducir sesgos presentes en el corpus.
- Dependencia de `trust_remote_code=True`: la carga requiere ejecutar código del repositorio, lo que implica una revisión de seguridad previa en entornos sensibles.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, por lo que la adopción debería basarse en una evaluación propia.
- Madurez del ecosistema: el paquete `social-jev` está en versión alpha (v0.1.0a4 en la documentación enlazada) y el repositorio no registra descargas ni likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/social-jev/social-jev-4B-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Sitio web del proyecto: https://social-jev.github.io/
- Documentación: https://social-jev.github.io/docs/
- Guía de inferencia: https://social-jev.github.io/docs/v0.1.0a4/inference/
- Referencia de API: https://social-jev.github.io/docs/v0.1.0a4/api/
- Repositorio GitHub: https://github.com/social-jev/social-jev
- Blog de TypeSafe sobre Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev
