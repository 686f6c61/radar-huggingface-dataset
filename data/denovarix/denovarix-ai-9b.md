# Denovarix/Denovarix-AI-9B

## Resumen

Denovarix AI 9B es un modelo multimodal (texto e imagen) anunciado por Denovarix Technologies LLP, una empresa con sede en Bengala Occidental (India), como parte de su sistema operativo DNX OS. Segun la model card, se trata de un modelo de 9.000 millones de parametros disenado para ejecutarse en local en portatiles y sobremesas con al menos 12 GB de memoria, con un consumo aproximado de 7 GB en inferencia. El modelo se presenta como la version ampliada del Denovarix AI 4B y esta orientado a tres tareas concretas: generacion de texto, lectura de documentos empresariales (facturas escaneadas, formularios fotografiados, capturas de pantalla) y decision de llamadas a herramientas (tool calling).

La relevancia de esta ficha es limitada por un motivo fundamental: el propio autor declara en la model card que el modelo esta "en desarrollo" y que los pesos no estan publicados. No existe, por tanto, un artefacto descargable ni verificable en el momento de redactar esta ficha. Los datos disponibles provienen exclusivamente de la model card y de los metadatos de Hugging Face, y no incluyen informacion sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia.

Desde el punto de vista tecnico, lo unico confirmado es el tamano nominal (9B), la orientacion on-device, la entrada multimodal texto-imagen, el soporte de tool calling y de comprension de documentos, y los tres idiomas declarados: ingles, hindi y bengali. Cualquier otra especificacion debe tratarse como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9.000 millones (9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card indica unos 7 GB de memoria en uso, lo que sugiere pesos de baja precision, pero no se especifica el esquema) |
| Idiomas soportados | ingles (en), hindi (hi), bengali (bn) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos no estan publicados) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con capas de estado o cualquier otra variante. Tampoco se detalla el mecanismo de integracion de la entrada de imagen (proyector visual, encoder acoplado, etc.), aunque la etiqueta `image-text-to-text` y la descripcion de lectura de documentos escaneados confirman que existe una ruta multimodal texto-imagen.

En cuanto al entrenamiento, no hay datos sobre el numero de tokens, la composicion del dataset, el uso de RLHF o DPO, ni sobre posibles innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica afirmacion relevante del autor es que el modelo ha sido entrenado por Denovarix para DNX OS y que esta pensado para ejecutarse integramente en hardware del cliente, de modo que las consultas y los ficheros no salen del equipo. No se aporta ninguna evidencia verificable de este extremo.

## Capacidades

- Generacion de texto en ingles, hindi y bengali.
- Comprension de imagenes con texto: facturas escaneadas, formularios fotografiados y capturas de pantalla.
- Comprension de documentos empresariales, con mayor margen para documentos largos y preguntas complejas que el modelo 4B de la misma familia.
- Decision de llamadas a herramientas (tool calling): seleccion de la herramienta adecuada para una peticion dada.
- Ejecucion local en el dispositivo (on-device), sin salida de datos a servidores externos segun la propuesta del autor.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la model card; el tag `tool-calling` sugiere soporte basico de uso de herramientas, pero no se documenta un modo de razonamiento extendido.
- Modo "thinking", soporte de audio, vision avanzada mas alla de OCR/documentos: no disponible.

## Casos de uso

- Digitalizacion de facturas y albaranes en pymes: el modelo puede leer una factura escaneada o fotografiada y extraer los campos relevantes (emisor, importe, fecha, lineas de detalle) en local, sin enviar el documento a un servicio en la nube. Es adecuado por su entrada multimodal y su orientacion a document understanding.
- Procesamiento de formularios en administracion: lectura de formularios fotografiados con un movil o escaner de sobremesa para volcar los datos a un sistema interno, manteniendo la informacion dentro de la red de la organizacion.
- Asistente de escritorio integrado en DNX OS: atencion a consultas del usuario en ingles, hindi o bengali con acceso a herramientas del sistema (busqueda de ficheros, calculo, consulta de agenda), aprovechando el soporte de tool calling.
- Soporte al cliente en mercados del sur de Asia: conversaciones multi-turno en hindi y bengali, con capacidad de consultar documentos adjuntos (capturas de pantalla, comprobantes) enviados por el usuario. La cobertura de estos dos idiomas es uno de los pocos diferenciadores verificables del modelo.
- Analisis de capturas de pantalla para soporte tecnico: el modelo puede interpretar una captura de pantalla de una aplicacion y describir el estado o el error visible, lo que resulta util en mesas de ayuda de primer nivel.
- Despliegue en equipos sin GPU dedicada: al declarar un consumo de unos 7 GB de memoria y un objetivo de 12 GB de RAM en portatiles y sobremesas, el modelo esta pensado para entornos ofimaticos sin aceleradores de datacenter, lo que encaja en escenarios de pyme con hardware estandar.
- Clasificacion y enrutado de documentos entrantes: decidir si un documento recibido es una factura, un formulario o una comunicacion, y derivarlo al flujo correspondiente mediante tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion de MMLU, HumanEval, GSM8K, DocVQA ni de ninguna otra tarea, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 7 GB de memoria en uso segun la model card; el autor recomienda equipos con 12 GB de memoria o mas.
- GPU recomendadas: no disponible. La model card no menciona aceleradores concretos ni requisitos de VRAM dedicada; el enfoque declarado es la ejecucion en portatiles y sobremesas.
- Compatibilidad con GPU de consumo: no confirmada. El objetivo declarado son equipos de 12 GB de memoria, lo que sugiere que el modelo podria caber en GPUs de consumo con 12 GB o mas (por ejemplo, RTX 3060 de 12 GB o RTX 4070), pero no hay confirmacion del autor ni pesos publicados para probarlo.
- Opciones de despliegue: no disponible. No se especifica soporte para vLLM, llama.cpp, Ollama, TGI ni para un runtime propio de DNX OS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Denovarix AI 9B | 9B | no disponible | texto + imagen | no disponible | en desarrollo, pesos no publicados |
| Denovarix AI 4B (misma familia) | 4B | no disponible | texto + imagen (segun descripcion de la familia) | no disponible | no disponible |
| Alternativas comparables de 7-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de sus alternativas directas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica comparacion documentada por el autor es cualitativa: el 9B ofrece "mas margen para documentos largos y preguntas mas dificiles" que el 4B de la misma familia.

## Limitaciones y advertencias

- El modelo no esta disponible: la model card indica explicitamente que esta en desarrollo y que los pesos no se publican. No se puede evaluar, descargar ni desplegar.
- Licencia no especificada: no hay informacion sobre condiciones de uso comercial, redistribucion o modificacion. Cualquier uso en produccion requeriria contactar al autor.
- Sin datos de entrenamiento ni de evaluacion: no es posible estimar sesgos, calidad de salida ni tasas de alucinacion. La ausencia de benchmarks impide cualquier validacion objetiva.
- Cobertura linguistica limitada a tres idiomas (ingles, hindi y bengali); no se declara soporte para castellano ni para otras lenguas.
- Riesgo de alucinacion no cuantificado, especialmente relevante en extraccion de datos de documentos (importes, fechas, nombres), donde un error tiene consecuencias operativas.
- Sesgos desconocidos: al no publicarse la composicion del dataset ni el proceso de alineacion, no se puede evaluar el sesgo cultural, linguistico o de dominio.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar su uso con documentos largos mas alla de la afirmacion cualitativa del autor.
- Arquitectura y runtime no documentados: no hay garantia de compatibilidad con herramientas estandar de inferencia (llama.cpp, vLLM, Ollama), lo que limita la integracion en pipelines existentes.
- Afirmaciones de privacidad no verificables: la promesa de que los datos permanecen en el equipo del cliente depende de un runtime propietario no publicado.
- Fechas de publicacion en Hugging Face (noviembre de 2026) y descargas/likes a cero: el repositorio no muestra actividad ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Denovarix/Denovarix-AI-9B
- Sitio web del autor: https://denovarix.com
- Pagina de DNX OS: https://denovarix.com/dnx-os/
- Programa beta de DNX OS: https://denovarix.com/beta/
- Contacto: hello@denovarix.com
- Paper, blog tecnico, repositorio de codigo o demo: no disponible en la informacion proporcionada.
