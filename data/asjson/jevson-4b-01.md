# asjson/jevson-4b-01

## Resumen

jevson-4b-01 es un adaptador LoRA publicado por asjson sobre el modelo denso Qwen/Qwen3-4B, con cabezas de lectura (readout heads) adicionales y temperaturas de calibración ajustadas. No es un modelo de chat generativo: es un modelo de decisión y extracción estructurada. Recibe como entrada un JSON Schema y un documento, compila el esquema en decisiones discretas (enumeraciones, booleanos, presencia de campos nulos, longitud de arrays, selección de spans candidatos) y devuelve un registro JSON válido contra el esquema, con una probabilidad calibrada por campo y el span de evidencia del que se leyó cada valor.

El segundo modo de funcionamiento, denominado decision mode, responde preguntas tipadas sobre un estado dado —P(yes) para preguntas binarias, distribución de probabilidad sobre opciones y distribución más nivel esperado para escalas ordenadas— siguiendo el formato de Jev / System One, que es la forma que usan habitualmente los benchmarks de modelos de decisión. Ambas modalidades se resuelven en una única pasada paralela sobre el documento, de modo que evaluar diez campos cuesta aproximadamente lo mismo que evaluar uno.

La relevancia del modelo está en su enfoque: en lugar de generar texto y parsearlo con reintentos, produce directamente decisiones con probabilidad calibrada, lo que permite aceptar los campos con alta confianza y enrutar los inciertos a revisión humana. El repositorio tiene 0 descargas y 0 likes, el runtime propietario de asjson (compilador de esquemas, lectura paralela y cabezas de extracción) todavía está en proceso de empaquetado, y la model card no publica lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-4B) con adaptador LoRA y cabezas de lectura adicionales para extracción de spans |
| Parametros totales | No disponible en la ficha del adaptador; el modelo base Qwen/Qwen3-4B tiene aproximadamente 4.000 millones de parametros (el adaptador LoRA anade una fraccion muy pequena, el repo ocupa 0,2 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada para el adaptador. El autor recomienda mantener el estado por debajo de ~8.000 tokens; el modelo base Qwen3-4B declara 32.768 tokens en su documentacion publica |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye como LoRA en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ de este adaptador |
| Idiomas soportados | No disponibles (la model card no los lista; hereda las capacidades del modelo base, sin confirmar) |
| Licencia | Apache-2.0 (adaptador, cabezas y configuraciones); modelo base Qwen3-4B tambien Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), ficheros PyTorch .pt para las cabezas (pointer.pt y otros *_head.pt), mas adapter_config.json, asjson_config.json y calibration.json |

Otros datos del repositorio: pipeline declarado `text-classification`, libreria `peft`, tamano del repo 0,2 GB, creado y actualizado el 23 de septiembre de 2026 (fechas declaradas por HuggingFace).

## Arquitectura y entrenamiento

La base es Qwen3-4B, un transformer decoder-only denso de la familia Qwen3. Sobre el se entrena un adaptador LoRA de rango bajo mas un conjunto de cabezas de lectura ligeras y temperaturas de calibracion ajustadas por tipo de pregunta y numero de opciones. El esquema JSON se compila antes de la inferencia en un arbol de decisiones: enumeraciones, booleanos y discriminadores se convierten en decisiones de eleccion; los campos anulables generan una decision de presencia; los arrays generan una decision de longitud mas slots; las cadenas se extraen eligiendo entre spans candidatos localizados en el documento y se convierten al tipo declarado (date-time, integer, email, etc.), con una opcion explicita de "ausente". Los campos dependientes de otros campos (por ejemplo, los argumentos de una herramienta ya elegida, o el valor de un campo cuya presencia ya se ha decidido) se resuelven en una segunda pasada condicionada por la primera. Un campo puede declararse opcionalmente como generacion de texto libre.

Todas las decisiones se puntuan en la misma pasada sobre una lectura compartida del documento, lo que explica que el coste marginal de anadir campos sea bajo. La calibracion se aplica dividiendo los logits de cada opcion por la temperatura correspondiente antes del softmax; los valores de temperatura se distribuyen en `calibration.json`. El adaptador tambien responde preguntas tipadas del estilo Jev / System One (`noul` para si/no, `choice` para opciones con criterios de una linea, `score` para niveles ordenados), lo que le permite cubrir el formato de los benchmarks de modelos de decision. El autor indica que este trabajo es independiente de TypeSafe AI y que los nombres "Jev" y "System One" se usan unicamente para describir compatibilidad de API.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Extraccion estructurada guiada por JSON Schema: valores tipados, validos contra el esquema, sin texto generado que parsear y sin reintentos.
- Probabilidad calibrada por campo, con span de evidencia asociado, pensada para umbralizar decisiones y enrutar los casos inciertos.
- Compilacion de esquemas a decisiones: enums, booleanos, discriminadores, campos anulables, arrays con decision de longitud y slots, casting de tipos (`date-time`, `integer`, `email` y similares).
- Extraccion de spans candidatos del documento para campos de cadena, con opcion explicita de campo ausente.
- Segunda pasada condicionada para campos dependientes de otros campos (argumentos de herramientas, valores de campos ya decididos).
- Modo de decision tipado: P(yes) para preguntas binarias con criterios, distribucion de probabilidad por opcion y distribucion por nivel mas nivel esperado para escalas ordenadas.
- Enrutado de herramientas sobre catalogos de herramientas (tool routing) sin necesidad de ejemplos previos del catalogo, segun el resultado zero-shot declarado por el autor.
- Campo con generacion de texto libre, solo si el esquema lo habilita expresamente.
- No dispone de modo conversacional: no genera texto libre salvo en los campos que lo opt-in explicitamente.

## Casos de uso

- Enrutado de llamadas a herramientas en agentes: dado un catalogo de herramientas descrito como JSON Schema y la peticion del usuario, el modelo devuelve la herramienta elegida con su probabilidad y los argumentos extraidos con su confianza. El autor reporta 0,92 de acierto en enrutado sobre un catalogo de 12 herramientas no visto en entrenamiento, lo que permite dejar pasar las llamadas seguras y desviar las dudosas.
- Extraccion de campos en webhooks y eventos JSON: los eventos de GH Archive se resuelven con 1,000 de exactitud por campo y 0,974 de coincidencia exacta de registro completo en 292 ms por peticion, un regimen adecuado para pipelines de ingesta de alto volumen donde el parseo con expresiones regulares es fragil.
- Clasificacion y extraccion en resenas de aplicaciones: categoria mas span de la queja, con 0,925 de exactitud y 0,008 de ECE (error de calibracion esperado) en 262 ms, util para enrutar resenas a equipos de soporte o producto sin umbral manual.
- Triage de incidencias y releases de GitHub: deteccion de componente, version y flags con exactitudes de 0,922 y 0,938 y ECE de 0,003 y 0,014, aplicable a la automatizacion de etiquetado y asignacion de issues.
- Tramitacion de reclamaciones de consumo en documentos largos: el caso CFPB declara 0,889 de exactitud en empresa, fecha y categoria, con 2883 ms por peticion, lo que lo hace viable en procesos batch nocturnos o en colas asincronas.
- Puertas de calidad (QA gates) y juicio tipado: usar el modo de decision para evaluar si una respuesta cumple un criterio (P(yes)), elegir entre alternativas con criterios de una linea o puntuar una salida en una escala ordenada con nivel esperado, integrable en pipelines de evaluacion automatica.
- Extraccion de slots en dialogo orientado a tareas: 8 slots tipados con 0,952 de exactitud por campo en 219 ms, aunque la coincidencia exacta de registro completo baja a 0,422, lo que aconseja validacion campo a campo y revision de los campos de baja probabilidad.
- Enrutado de peticiones RPC sobre catalogos nuevos: 61 decisiones en zero-shot con 0,907 de exactitud y 0,571 de registro completo exacto, con 11 de 26 spans de argumento extraidos con exactitud >= 0,90 (URLs, correos, identificadores, zonas horarias, asuntos), lo que sirve para argumentos de tipo corto y estructurado.

## Benchmarks y rendimiento

Modo schema, documentos reales, con este adaptador (exactitud categorica por campo / error de calibracion ECE / registro completo exacto / milisegundos por peticion):

| Tipo de documento | Campos | Exactitud | ECE | Registro completo | ms / peticion |
|---|---|---|---|---|---|
| Eventos webhook JSON (GH Archive) | 3 spans + enums | 1,000 | 0,000 | 0,974 | 292 |
| Dialogo orientado a tareas (peticiones de herramienta) | 8 slots tipados | 0,952 | 0,012 | 0,422 | 219 |
| Resenas de aplicaciones | categoria + span de queja | 0,925 | 0,008 | 0,426 | 262 |
| Issues / releases de GitHub | componente, version, flags | 0,922 / 0,938 | 0,003 / 0,014 | no disponible | 556 / 139 |
| Reclamaciones de consumo (CFPB, largas) | empresa, fecha, categoria | 0,889 | 0,016 | no disponible | 2883 |
| Catalogo RPC de 12 herramientas no visto (zero-shot) | 61 decisiones | 0,907 | 0,054 | 0,571 | 311 |

En el catalogo de herramientas no visto, el enrutado de herramienta es 0,92 y 11 de 26 spans de argumento se extraen con exactitud >= 0,90; los argumentos con valores en prosa son los mas debiles. Los tiempos son del lado servidor sobre una H200 e incluyen el prefill del documento.

Modo decision, items publicos de JevBench v1.3 (231 decisiones), evaluados con el harness publico:

| easy | standard | hard | Intelligence (corregido por azar) | top-label ECE |
|---|---|---|---|---|
| 1,00 | 0,97 | 0,54 | 69,6 | 0,071 con la calibracion distribuida (0,089 en crudo) |

Kev transfer-v4 (764 decisiones fuera de dominio, nunca vistas en entrenamiento): exactitud 0,760, Brier 0,339, ECE 0,040 calibrado. No se aportan comparaciones directas contra otros modelos en la informacion disponible.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base Qwen3-4B completo: unos 8 GB en bf16/fp16, en torno a 4-5 GB en cuantizacion de 8 bits y aproximadamente 2,5-3 GB en cuantizaciones de 4 bits (estimaciones segun el tamano del modelo base, no publicadas por el autor).
- GPU profesionales: el autor reporta mediciones sobre una NVIDIA H200. Una A100 40/80 GB o una L40S son suficientes de sobra para el modelo base a precision completa.
- GPU de consumo: si, cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) sin cuantizar, y en tarjetas de 8-12 GB con cuantizacion de 8 o 4 bits. Hay que tener en cuenta que las cabezas de lectura y el runtime de asjson no estan documentados para ejecutarse sobre pesos cuantizados.
- Opciones de despliegue: la carga del adaptador esta pensada para PEFT sobre transformers. La model card no menciona vLLM, llama.cpp, Ollama ni TGI, y advierte que el compilador de esquemas, la lectura paralela y las cabezas de extraccion forman parte del runtime de asjson, que esta en proceso de empaquetado. Cargar el LoRA por si solo devuelve unicamente la base ajustada, no el sistema de extraccion completo.
- Latencia y throughput declarados: entre 139 ms y 556 ms por peticion en documentos de tipo issue o release, 219-311 ms en dialogo, resenas y catalogos de herramientas, y 2883 ms en reclamaciones largas de CFPB. Todo medido en una H200, con el prefill del documento incluido. No se publica throughput agregado ni tamano de lote.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de terceros en la informacion proporcionada, por lo que la comparacion es cualitativa:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asjson/jevson-4b-01 | ~4B (base) + LoRA | No especificado; recomendado <8k tokens | Extraccion por decisiones con probabilidad calibrada, requiere runtime de asjson | Apache-2.0 | Adaptador publicado; runtime en empaquetado |
| Qwen/Qwen3-4B (base) | ~4B | 32.768 tokens segun su documentacion publica | LLM generativo de proposito general; requiere parseo y validacion del JSON generado | Apache-2.0 | Publico y ampliamente soportado |
| Decodificacion restringida sobre un LLM generativo (Outlines, gramaticas, JSON mode) | Depende del LLM elegido | Depende del LLM | Garantiza JSON valido, pero no devuelve probabilidad calibrada por campo ni span de evidencia | Depende del LLM | Amplia |
| Modelos especializados de extraccion estructurada (por ejemplo, familias tipo NuExtract) | Habitualmente 1B-8B | No disponible | Extraccion a plantilla JSON predefinida | Variable | Variable |

No se han publicado en la informacion disponible resultados de JevBench, Kev transfer-v4 ni de los conjuntos de extraccion para los modelos alternativos, por lo que no procede comparar cifras.

## Limitaciones y advertencias

- Puntos debiles declarados por el autor: valores en prosa de longitud de frase dentro de texto conversacional, aritmetica de varios pasos y razonamiento de fechas y horas en documentos largos.
- El estado debe mantenerse por debajo de aproximadamente 8.000 tokens; se desconoce el comportamiento mas alla de ese umbral.
- No es un modelo de chat: no produce texto libre salvo en los campos de esquema que lo habilitan explicitamente.
- El sistema completo no es reproducible solo con el repositorio: el compilador de esquemas, la lectura paralela y las cabezas de extraccion pertenecen al runtime de asjson, que sigue en proceso de empaquetado. Cargar el LoRA unicamente entrega la base ajustada.
- Las probabilidades calibradas dependen del fichero `calibration.json` y de dividir los logits por la temperatura correspondiente; usar el adaptador sin esa calibracion degrada el ECE (0,089 en crudo frente a 0,071 calibrado en el top-label de JevBench).
- No se documenta lista de idiomas soportados. Las capacidades multilingues, en su caso, serian las heredadas del modelo base y no estan verificadas para este adaptador.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion en la extraccion de spans: la coincidencia exacta de registro completo es baja en varios conjuntos (0,422 en dialogo orientado a tareas y 0,426 en resenas), lo que obliga a validar campo a campo y no solo el registro entero.
- Restricciones de licencia: Apache-2.0 tanto en el adaptador como en el modelo base, por lo que el uso comercial esta permitido; conviene citar la atribucion del modelo base Qwen3-4B y tener en cuenta que el runtime de asjson es un componente independiente con su propia disponibilidad.
- Con 0 descargas y 0 likes, el modelo no tiene validacion externa por parte de la comunidad en el momento de redactar esta ficha.
- Las cabezas de lectura se distribuyen como ficheros PyTorch (.pt), lo que obliga a usar la pila de PyTorch para cargarlas y dificulta despliegues puramente GGUF o basados en llama.cpp.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/asjson/jevson-4b-01
- Sitio del proyecto asjson: https://asjson.dev
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo. Los enlaces obtenidos correspondian a contenidos sin relacion (tutoriales de Windows, guias de Disney y preguntas en Zhihu), por lo que no se incluyen. No se han encontrado enlaces publicos al paper, al repositorio de codigo, al harness de JevBench v1.3 ni al conjunto Kev transfer-v4 mencionados en la model card.
