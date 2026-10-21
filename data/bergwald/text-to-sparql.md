# bergwald/text-to-sparql

## Resumen

`bergwald/text-to-sparql` es un checkpoint de la familia T5, obtenido por fine-tuning de `google/flan-t5-base`, que traduce preguntas en inglés sobre películas —junto con candidatos de entidades recuperados previamente— a consultas SPARQL `SELECT` locales sobre el grafo de un curso (ATAI). Lo desarrolla el usuario de HuggingFace `bergwald` como artefacto del "ATAI Task 2" y se publica como el checkpoint final `flan_vocab`, acompañado de su tokenizer modificado.

El modelo no responde la pregunta: genera un plan breve seguido del prefijo `SPARQL:` y una consulta, que la aplicación anfitriona valida y ejecuta localmente. Es, por tanto, un componente de una arquitectura de question answering sobre grafos de conocimiento (KBQA) con recuperación previa de entidades y ejecución delegada al entorno.

Su relevancia es acotada y muy específica: es un ejemplo compacto (247,5 M de parámetros, ~1 GB de repositorio) de adaptación de un modelo encoder-decoder pequeño a un lenguaje formal, con vocabulario extendido para operadores SPARQL. No hay métricas publicadas, ni datos de entrenamiento liberados, ni licencia declarada, y el repositorio no registra descargas ni interacciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), fine-tuning de `google/flan-t5-base` |
| Parametros totales | 247.551.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como especificacion formal; la configuración de inferencia del proyecto fija un máximo de 2.048 tokens de entrada y 640 tokens generados |
| Tipos de cuantizacion | no disponible (el proyecto declara inferencia en FP32); al ser un checkpoint T5 estándar es compatible con cuantización a FP16/BF16/INT8 mediante herramientas externas |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible (la del modelo base `google/flan-t5-base` es Apache 2.0 según su propia model card; este checkpoint no declara licencia) |
| Formato de pesos | safetensors, más tokenizer guardado con vocabulario extendido |

## Arquitectura y entrenamiento

Se trata de un T5 base (encoder-decoder, atención completa, sin mezcla de expertos) con 247,5 M de parámetros, inicializado desde `google/flan-t5-base`, que a su vez es un T5 preentrenado y ajustado con instrucciones. La innovación reseñable del checkpoint es la extensión del vocabulario: se han añadido tokens específicos para operadores SPARQL, y la model card advierte explícitamente de que **no debe sustituirse el tokenizer guardado por el tokenizer estándar de FLAN-T5**, ya que los identificadores de esos tokens dejarían de coincidir con los pesos.

El fine-tuning se realizó sobre `SimpleQuestions-Wikidata` filtrado y sobre ejemplos sintéticos de pares pregunta/consulta. No se publican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; tampoco se liberan los datos, el grafo del curso ni credenciales de la aplicación. La decodificación es greedy y el proyecto opera en FP32, lo que sugiere un objetivo de reproducibilidad más que de eficiencia. El formato de salida fuerza un razonamiento corto en lenguaje natural seguido de la consulta, un patrón de "plan-then-query" que facilita la validación posterior.

## Capacidades

- Generación de consultas SPARQL `SELECT` a partir de una pregunta en inglés y de candidatos de entidades ya recuperados.
- Producción de un plan breve en lenguaje natural antes de la consulta, precedido de la marca `SPARQL:`.
- Adaptación a un vocabulario específico de dominio con tokens propios para operadores SPARQL.
- Manejo de preguntas sobre películas dentro del esquema concreto del grafo del curso ATAI.
- Generación limitada a 640 tokens, suficiente para consultas con filtros, `ORDER BY`, `LIMIT` y agregaciones sencillas.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido.
- Capacidad multilingüe: únicamente inglés; no se ha entrenado ni evaluado en castellano.

## Casos de uso

- **Prototipado de KBQA sobre grafos de conocimiento**: el modelo actúa como etapa de traducción pregunta→SPARQL dentro de un pipeline con recuperación de entidades y ejecución contra un endpoint local; su tamaño permite iterar rápido en un portátil.
- **Generación de consultas de apoyo para analistas de datos**: un analista escribe una pregunta en inglés sobre el catálogo de películas y el modelo propone una consulta que el analista revisa y ejecuta, reduciendo el tiempo de escritura manual de SPARQL.
- **Docencia y material de curso**: sirve como ejemplo funcional de ajuste fino de un T5 base a un lenguaje formal, útil en asignaturas de procesamiento de lenguaje natural o web semántica.
- **Generación de plantillas de consulta**: dado un conjunto de preguntas frecuentes, produce borradores de consultas que luego se parametrizan y se cachean como plantillas en producción.
- **Pruebas de regresión de esquemas**: al fijar el grafo y el tokenizer, puede usarse para detectar cambios incompatibles en el esquema (renombrado de propiedades, tipos de entidad) comparando las consultas generadas antes y después.
- **Componente de un sistema de búsqueda semántica interna**: combinado con un recuperador de entidades, permite exponer una interfaz en lenguaje natural sobre un grafo corporativo, siempre que el esquema sea estable y acotado.
- **Generación de datos sintéticos de consultas**: las consultas generadas, una vez validadas sintácticamente, pueden servir para ampliar el conjunto de ejemplos de entrenamiento de un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud de consulta, coincidencia de resultados, ejecutabilidad ni comparaciones con otros sistemas de text-to-SPARQL.

## Requisitos de hardware

- VRAM estimada en FP32: en torno a 1 GB solo para pesos, más activaciones y caché; cabe holgadamente en GPUs de 4-8 GB.
- VRAM estimada en FP16/BF16: ~0,5 GB de pesos, manejable en cualquier GPU consumer reciente.
- GPU recomendadas: ninguna específica; el proyecto declara FP32 y el modelo funciona en CPU con latencia aceptable para uso interactivo. Para servicio, una T4, L4 o RTX 4090 van sobradas.
- Cabe en GPU consumer: sí, prácticamente en cualquier tarjeta con 4 GB o más, e incluso en CPU.
- Opciones de despliegue: `transformers` (vía `text2text-generation`) es la vía natural; el repositorio está etiquetado como compatible con Text Generation Inference y con endpoints, por lo que TGI es una opción de servicio. Alternativas como ONNX Runtime son viables. `llama.cpp` y Ollama no ofrecen soporte maduro para encoder-decoder T5, por lo que no son recomendables aquí.
- Latencia y throughput: no disponibles. Como referencia cualitativa, greedy decoding con hasta 640 tokens sobre 247 M de parámetros es rápido en GPU, pero el coste dominante suele ser la validación y ejecución de la consulta en el grafo, no la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bergwald/text-to-sparql` | 247,5 M | 2.048 tokens de entrada en la configuración del proyecto | inglés | no disponible | HuggingFace, 0 descargas, 0 likes |
| `google/flan-t5-base` (modelo base) | ~248 M | entrenado con 512 tokens; posiciones relativas | multilingüe (incluye inglés) | Apache 2.0 según su model card | ampliamente disponible |
| Otros fine-tunes text-to-SPARQL públicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma tarea.

## Limitaciones y advertencias

- **Tokenizer no sustituible**: usar el tokenizer estándar de FLAN-T5 con estos pesos rompe la correspondencia de los tokens SPARQL añadidos y degrada la salida de forma silenciosa.
- **No produce la respuesta final**: el modelo emite una consulta; la corrección del resultado depende del validador, del ejecutor SPARQL y del recuperador de entidades previo.
- **Sesgos**: no documentados. El entrenamiento con `SimpleQuestions-Wikidata` filtrado puede arrastrar los sesgos de cobertura de Wikidata, con infrarrepresentación de determinados cines, países y títulos no anglófonos.
- **Alucinación**: riesgo alto en la estructura de la consulta (propiedades inexistentes, prefijos incorrectos, `SELECT` mal formados) y en el plan previo. La validación sintáctica y la comprobación contra el esquema son imprescindibles antes de ejecutar.
- **Limitaciones de idioma y esquema**: solo inglés y solo el grafo ATAI del curso; no hay evidencia de generalización a otros esquemas ni a otras ontologías.
- **Caveats declarados por el autor**: los límites temporales ("date boundaries"), los rankings y los títulos ambiguos siguen siendo puntos débiles.
- **Licencia**: no declarada para el checkpoint, lo que impide asumir uso comercial sin consultar al autor; la licencia Apache 2.0 del modelo base no se hereda automáticamente de forma clara para los pesos derivados.
- **Madurez**: repositorio sin descargas ni validación comunitaria, creado y actualizado el mismo día, sin conjunto de evaluación ni métricas publicadas. No apto como dependencia de producción sin una evaluación propia.
- **Seguridad**: al ejecutar consultas generadas por un modelo conviene aplicar listas blancas de propiedades, límites de tiempo y de resultados, y ejecución con credenciales de solo lectura para evitar consultas costosas o inyección de SPARQL.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bergwald/text-to-sparql
- Modelo base: https://huggingface.co/google/flan-t5-base
