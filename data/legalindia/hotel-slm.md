# legalindia/hotel-slm

## Resumen

hotel-slm es un modelo de lenguaje pequeno (SLM) publicado por el usuario legalindia en HuggingFace. Se trata de un fine-tuning de T5-small, un transformer encoder-decoder de tipo text2text, con 60.506.624 parametros totales, orientado a una tarea muy concreta: convertir consultas en lenguaje natural de busqueda de hoteles y vuelos en JSON estructurado. El prompt de entrada sigue el formato `[HOTEL] parse query to JSON: <query>` o `[FLIGHT] parse query to JSON: <query>`.

El modelo resuelve el problema del parsing de intenciones y entidades en dominios de viajes, un paso previo habitual en sistemas de reservas y metabuscadores. Segun la model card, esta pensado para ser consumido por una API de query-parser desplegada como Space, y el post-procesamiento (parseo de fechas, normalizacion de ubicaciones y aeropuertos) no forma parte del modelo, sino del codigo de la API.

La relevancia del modelo es limitada y muy acotada: no es un modelo de proposito general, sino un componente especializado de un pipeline mayor. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la informacion publicada es escasa: no se detallan datos de entrenamiento, idiomas soportados ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-small) |
| Parametros totales | 60.506.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text2text-generation |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo se basa en T5-small, un transformer encoder-decoder con atencion completa (full attention) en ambas torres, disenado originalmente para tareas de seq2seq. El fine-tuning adapta este backbone a una tarea de generacion de JSON estructurado a partir de consultas en lenguaje natural, con dos dominios diferenciados mediante un prefijo explicito en el prompt (`[HOTEL]` y `[FLIGHT]`).

No se ha publicado informacion sobre el dataset de entrenamiento: se desconocen el numero de tokens, la composicion de los datos, si se aplicaron tecnicas de RLHF, DPO o instruccion tuning, ni la procedencia de los ejemplos. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El modelo se distribuye unicamente en safetensors, sin versiones GGUF ni cuantizadas publicadas por el autor.

## Capacidades

- Generacion de JSON estructurado a partir de consultas en lenguaje natural en el dominio de hoteles y vuelos.
- Diferenciacion de dominio mediante prefijos de prompt (`[HOTEL]` y `[FLIGHT]`).
- Parsing de intenciones y entidades basicas de busqueda (fechas, ubicaciones, aeropuertos) delegando la normalizacion al codigo de la API consumidora.
- Generacion de texto seq2seq generica, heredada del backbone T5-small.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Parsing de consultas en un metabuscador de hoteles: el modelo recibe consultas como "hotel en Busan para dos noches en mayo" y devuelve un JSON con los campos de busqueda, que la API posterior normaliza y envia al motor de reservas.
- Parsing de consultas de vuelos: con el prefijo `[FLIGHT]`, el modelo extrae origen, destino y fechas aproximadas de una consulta en lenguaje natural, dejando la resolucion de aeropuertos al codigo de la API.
- Preprocesado en asistentes conversacionales de viajes: integrado como primer paso de un pipeline, convierte el turno del usuario en una estructura interpretable por el resto del sistema.
- Normalizacion de formularios de busqueda: el modelo permite aceptar texto libre en lugar de campos estructurados, reduciendo la friccion en interfaces de reserva.
- Enrutamiento de intencion en chatbots de atencion al cliente de agencias de viajes: el prefijo de dominio permite clasificar y extraer parametros de la consulta antes de derivarla al flujo correspondiente.
- Prototipado rapido de APIs de busqueda: al ser un modelo de 60 M de parametros y 0,2 GB, puede desplegarse en un Space o en una instancia pequena para validar un producto de parsing de consultas sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,25 GB para los pesos (60,5 M de parametros), mas el overhead de activaciones y del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,13 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, asi como en CPU.
- GPU recomendadas: no se requiere GPU dedicada; una T4 o superior es mas que suficiente para throughput alto.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (segun los tags del repositorio), y conversion a GGUF para llama.cpp u Ollama si se desea.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hotel-slm | 60,5 M | No disponible | Parsing de consultas hotel/vuelo a JSON | Apache 2.0 | HuggingFace (0 descargas) |
| T5-small (base) | 60,5 M | 512 tokens | Seq2seq generico | Apache 2.0 | HuggingFace (ampliamente usado) |
| FLAN-T5-small | 60,5 M | 512 tokens | Instrucciones genericas | Apache 2.0 | HuggingFace |
| Modelos de extraccion de entidades basados en BERT | ~110 M | 512 tokens | NER / clasificacion | Variable | HuggingFace |

La comparativa se limita a alternativas de la misma familia y tamano, ya que no se dispone de datos de rendimiento del modelo para contrastarlo con especialistas en parsing de consultas.

## Limitaciones y advertencias

- Informacion de entrenamiento no publicada: se desconocen los datos, el proceso y la cobertura real del modelo, lo que impide evaluar su robustez.
- Idiomas soportados no documentados: no hay garantia de funcionamiento fuera del idioma o idiomas usados en el fine-tuning.
- Longitud de contexto no documentada; al derivar de T5-small, es probable que este limitada a 512 tokens, aunque no se confirma.
- El post-procesamiento (fechas, normalizacion de ubicaciones y aeropuertos) no esta incluido en el modelo; usarlo de forma aislada produce JSON sin normalizar.
- Riesgo de alucinacion en la generacion de JSON: al ser un modelo generativo seq2seq, puede producir campos o valores no presentes en la consulta original.
- Sin resultados de benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de su calidad.
- Repositorio sin descargas ni likes: no hay senales de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su dominio concreto.
- No se documentan sesgos conocidos; al no publicarse el dataset, no es posible auditarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/legalindia/hotel-slm
- Referencia externa encontrada en la busqueda web (no relacionada con el modelo): https://www.tripadvisor.com/Tourism-g297884-Busan-Vacations.html
