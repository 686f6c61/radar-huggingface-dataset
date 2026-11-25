# lm-kit/vllm-d3-mini-lmk

## Resumen

d3-mini (Decision 3.0) es un modelo de decisión de tamano medio desarrollado por el proyecto vLLM Semantic Router y empaquetado por lm-kit para su SDK de IA on-device para .NET (LM-Kit.NET) y para LM-Kit One. A diferencia de un modelo generativo convencional, no redacta texto: recibe un contenido y un conjunto de preguntas tipadas (eleccion entre opciones, nivel en una escala ordenada, si/no) y devuelve, en un unico forward pass, la probabilidad de cada respuesta posible.

Con aproximadamente 4.840 millones de parametros, el modelo esta orientado a clasificacion zero-shot y a la toma de decisiones estructurada sobre texto, JSON e imagenes, lo que lo situa como una alternativa determinista y acotada a los LLM generativos en tareas de enrutamiento, triaje y etiquetado. La salida siempre es una de las opciones proporcionadas por el usuario, acompanada de una probabilidad que una regla de negocio puede consumir directamente.

El paquete incluye cuantizaciones GGUF Q4_K_M y Q8_0, junto con un proyector de vision Q8_0, y se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en que cubre el hueco de los modelos "system-one" para pipelines de decision de baja latencia, donde no se necesita generacion libre sino una respuesta categorica fiable y auditable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision multimodal, base vllm-sr/d3-mini) |
| Parametros totales | 4.841.450.496 (aprox. 4,84 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); proyector de vision Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, LMK (archivo empaquetado de LM-Kit); safetensors en el modelo base segun metadatos |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base vllm-sr/d3-mini ni el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se explicita es su naturaleza de modelo de decision: en lugar de generar secuencias de texto, realiza una pasada hacia delante que produce distribuciones de probabilidad sobre un conjunto cerrado de respuestas definidas por el usuario. Esto implica una cabeza de clasificacion o un mecanismo de puntuacion de opciones, pero los detalles tecnicos concretos no se han publicado en la informacion accesible.

El modelo es multimodal: incorpora un proyector de vision independiente (mmproj, cuantizado a Q8_0) que permite adjuntar imagenes a las peticiones de decision. El empaquetado para LM-Kit incluye tanto el modelo de decision como su proyector en un unico archivo LMK, y los GGUF publicados son identicos a los del repositorio ggml-org/vllm-d3-mini-GGUF. No se han documentado innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion zero-shot: asigna un contenido a una de varias opciones definidas por el usuario, devolviendo la opcion elegida y su probabilidad.
- Puntuacion en escalas ordenadas: devuelve el nivel esperado dentro de una escala definida (por ejemplo, "puede esperar", "esta semana", "hoy", "ahora mismo").
- Preguntas booleanas: responde si/no con la probabilidad asociada a la respuesta afirmativa.
- Decision multiple en una sola pasada: permite plantear varias preguntas tipadas sobre el mismo contenido y obtener todas las respuestas de forma simultanea.
- Procesamiento de imagenes: acepta imagenes adjuntas a la peticion (por ejemplo, fotos de envios o incidencias) mediante su proyector de vision.
- Procesamiento de texto y JSON: segun la model card, esta orientado a contenido textual y estructurado.
- Integracion con agentes y flujos: en LM-Kit One responde al endpoint `POST /v1/systemone` y actua como herramienta `decide` de agentes y workflows.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`.
- No genera texto libre: su salida esta restringida a las opciones proporcionadas.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de una incidencia y responde a preguntas como que equipo debe gestionarla (facturacion, envios, tecnico) y si requiere intervencion humana, devolviendo probabilidades que permiten enrutar automaticamente cada ticket con umbrales configurables.
- Priorizacion de solicitudes: mediante preguntas de escala ordenada, se calcula la urgencia de una peticion ("puede esperar" hasta "ahora mismo") y se ordena la cola de atencion en funcion del nivel esperado.
- Moderacion y etiquetado de contenido: clasificacion zero-shot de textos o imagenes en categorias predefinidas, con la probabilidad como medida de confianza para decidir si se escala a revision humana.
- Verificacion de incidencias con imagen: en reclamaciones de envio, se adjunta la foto del paquete y se pregunta si muestra un embalaje danado, combinando la decision visual con preguntas textuales en la misma peticion.
- Enrutamiento en pipelines de agentes: como herramienta `decide` dentro de LM-Kit One, el modelo selecciona la siguiente accion o el agente adecuado entre un conjunto de opciones, sin necesidad de generacion libre.
- Clasificacion on-device en aplicaciones .NET: integrado mediante LM-Kit.NET, permite ejecutar decisiones locales en aplicaciones de escritorio o servidor sin depender de una API externa, con el modelo cargado por su ID `d3-mini`.
- Extraccion de decisiones estructuradas a partir de JSON: dado un payload estructurado, responder preguntas tipadas para alimentar reglas de negocio o validaciones automaticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 4,84 mil millones de parametros, la cuantizacion Q4_K_M ocupa del orden de 3 GB y la Q8_0 del orden de 5 GB solo para los pesos; el proyector de vision Q8_0 anade una cantidad no especificada. El repo completo ocupa 13,3 GB, pero incluye todas las variantes.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; la model card indica que es el modelo que LM-Kit recomienda "cuando hay una GPU disponible".
- GPU de consumo: por tamano, es plausible que quepa en GPU de consumo con suficiente VRAM (por ejemplo, gamas con 8 GB o mas en Q4_K_M), aunque el fabricante no confirma modelos concretos.
- Opciones de despliegue: LM-Kit.NET (carga por ID `d3-mini`), LM-Kit One (endpoint `POST /v1/systemone`), y GGUF compatible con el ecosistema ggml (llama.cpp y derivados) al publicarse en ggml-org/vllm-d3-mini-GGUF.
- Latencia y throughput: no disponibles. Al resolver todas las preguntas en un unico forward pass, el coste por peticion es predecible y no crece con la longitud de una respuesta generada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-mini (Decision 3.0) | 4,84 B | no disponible | Decision / clasificacion zero-shot multimodal | Apache 2.0 | GGUF, LMK |
| LLM generativos de ~4-8 B | ~4-8 B | variable | Generacion de texto | variable | multiples |
| Clasificadores dedicados | variable | no aplica | Clasificacion supervisada | variable | multiples |

La comparacion cuantitativa con alternativas concretas no esta disponible.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo puede responder dentro del conjunto de opciones o escalas que el usuario define, por lo que no sirve para tareas generativas.
- No se han publicado datos sobre sesgos, composicion del dataset ni evaluaciones de robustez, lo que dificulta auditar su comportamiento en dominios sensibles.
- Riesgo de calibracion: las probabilidades devueltas deben validarse en el dominio de aplicacion antes de usarse como umbrales automaticos en produccion.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Longitud de contexto no disponible: se desconoce el limite de contenido que puede procesar en una sola peticion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y su entrenamiento se documentan en el repositorio original vllm-sr/d3-mini, que conviene revisar para conocer condiciones adicionales.
- El soporte de imagenes depende del proyector de vision empaquetado; el rendimiento en tareas visuales concretas no esta cuantificado.
- Modelo recien publicado (creado en noviembre de 2026) sin descargas ni likes, por lo que carece de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lm-kit/vllm-d3-mini-lmk
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- GGUF originales: https://huggingface.co/ggml-org/vllm-d3-mini-GGUF
- LM-Kit.NET: https://lm-kit.com/products/lm-kit-net/
