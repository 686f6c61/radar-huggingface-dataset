# NINI26454/Mistral-Small-24B-Instruct-2501-Abliterated-GGUF

## Resumen

Esta ficha describe `NINI26454/Mistral-Small-24B-Instruct-2501-Abliterated-GGUF`, una cuantizacion en formato GGUF del modelo `venkycs/Mistral-Small-24B-Instruct-2501-Abliterated`, que a su vez es una version "abliterated" (sin direcciones de rechazo) de `mistralai/Mistral-Small-24B-Instruct-2501`. El autor del repositorio es el usuario NINI26454 y la publicacion incluye un unico archivo de pesos cuantizado en 3 bits (`Q3_K_M`, 10,9 GB) mas un `Modelfile` listo para Ollama. El repositorio tiene 11,5 GB de tamano total, licencia Apache 2.0 y cero descargas y cero "likes" en el momento de la consulta, por lo que se trata de una publicacion sin validacion comunitaria.

El modelo subyacente es Mistral Small 3 (enero de 2025), un transformer decoder-only de 23.572.403.200 parametros (23,6 B) disenado para ejecutarse en una sola GPU de 24 GB o en hardware consumer con cuantizacion. La variante "abliterated" aplica tecnicas de ablacion de direcciones de rechazo sobre los pesos para eliminar el comportamiento de negativa a responder ante determinadas peticiones, lo que cambia radicalmente el perfil de seguridad del modelo original.

La relevancia de esta ficha es doble: por un lado, permite evaluar un modelo de 24 B ejecutable en local con Ollama o llama.cpp; por otro, advierte de que se trata de una cuantizacion de 3 bits, no oficial, sin benchmarks publicados y con los mecanismos de seguridad del modelo original eliminados. Cualquier uso en produccion deberia tener en cuenta estas dos circunstancias antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de Mistral Small 3); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 23.572.403.200 (23,6 B) |
| Longitud de contexto | No disponible en la ficha del repositorio; el ejemplo de `llama-cli` usa `-c 16384`. El modelo base Mistral Small 3 (2501) declara 32 768 tokens |
| Tipos de cuantizacion | Solo `Q3_K_M` (3 bits, variante medium, 10,9 GB) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, acompanado de un `Modelfile` para Ollama |
| Modelo base | venkycs/Mistral-Small-24B-Instruct-2501-Abliterated |
| Modelo original de partida | mistralai/Mistral-Small-24B-Instruct-2501 |
| Etiquetas declaradas | gguf, ollama, mistral, abliterated, quantized, conversational, endpoints_compatible |
| Tamano del repositorio | 11,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento en la documentacion proporcionada. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo unico que se puede afirmar con los datos disponibles es que se trata de una cuantizacion derivada de un modelo ya existente: no hay entrenamiento nuevo en este repositorio, solo conversion de pesos a GGUF en precision de 3 bits (`Q3_K_M`).

La innovacion tecnica relevante es la "abliteracion" aplicada en la cadena de derivacion (`Mistral-Small-24B-Instruct-2501` -> `venkycs/...-Abliterated` -> esta cuantizacion). La abliteracion consiste en identificar en el espacio de activaciones las direcciones que correlacionan con el comportamiento de rechazo y proyectar los pesos ortogonalmente a esas direcciones, de modo que el modelo deja de activar respuestas de negativa. El resultado no es un modelo reentrenado ni alineado, sino un modelo instruct con parte de su capa de seguridad suprimida. El repositorio no especifica que variante concreta de la tecnica se aplico, cuantas direcciones se ablacionaron ni sobre que conjunto de datos de calibracion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instruct original.
- Razonamiento y generacion de codigo: capacidad esperable por el tamano del modelo base, aunque degradada por la cuantizacion de 3 bits y no verificada con benchmarks en este repositorio.
- Matematicas y tareas de logica de complejidad media: sin datos verificables en la informacion disponible.
- Respuesta sin rechazos: la abliteracion elimina el comportamiento de negativa ante peticiones que el modelo original rechazaria. Esto es una capacidad tecnica, no una ventaja de seguridad.
- Integracion con Ollama mediante el `Modelfile` incluido y con llama.cpp mediante el GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas), lo que sugiere uso detras de una API compatible con el formato OpenAI, aunque no se documenta el procedimiento.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Vision, audio o modo "thinking": no disponibles.
- Capacidades multilingues: no documentadas en la ficha.

## Casos de uso

- Estudio de seguridad y red teaming en local: la abliteracion convierte al modelo en un sujeto de prueba util para analizar como varia la tasa de cumplimiento de peticiones daninas cuando se eliminan las direcciones de rechazo. Se compararia sistematicamente con el modelo original bajo el mismo conjunto de prompts.
- Generacion de datos sinteticos para investigacion: al no rechazar por defecto, permite producir corpus que cubran tematicas que los modelos alineados evitan, util para entrenar clasificadores de contenido o estudiar sesgos. Requiere revision humana obligatoria.
- Prototipado de asistentes conversacionales offline: con 10,9 GB de pesos y Ollama, se puede levantar un asistente funcional en un portatil o estacion de trabajo sin enviar datos a servicios externos, util en entornos con requisitos de confidencialidad.
- Resumen y extraccion de informacion en documentacion tecnica larga: con una ventana de trabajo de 16 384 tokens configurable en llama.cpp, permite procesar informes, contratos o expedientes por lotes sin salida a Internet.
- Generacion de codigo en borradores y prototipos: adecuado para tareas de autocompletado y generacion de fragmentos donde el coste de un error es bajo; la cuantizacion Q3_K_M hace desaconsejable usarlo como generador principal en repositorios de produccion sin validacion posterior.
- Despliegue en estaciones de trabajo con GPU consumer: al caber en tarjetas de 16 GB con contexto moderado, sirve para demos internas, formacion de equipos y entornos de desarrollo aislados.
- Analisis de texto y clasificacion por lotes: clasificacion de tickets, resenas o incidencias en un pipeline local, aprovechando la licencia Apache 2.0 para integrarlo en productos propios sin obligaciones de atribucion adicionales.
- Traduccion y procesamiento multilingue: plausible por el modelo base, pero no verificable con la informacion disponible; requeriria evaluacion propia antes de usarlo con idiomas distintos del ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la ficha de HuggingFace ni la model card del autor incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. La busqueda web realizada no devolvio resultados relacionados con el modelo: los unicos resultados obtenidos fueron articulos sobre ExpressVPN, sin ninguna relacion con este repositorio.

Como referencia contextual, tampoco se dispone de benchmarks de la version abliterated original (`venkycs/Mistral-Small-24B-Instruct-2501-Abliterated`) en la informacion proporcionada. Cualquier cifra que se quisiera usar para comparar deberia medirse directamente sobre esta cuantizacion, ya que la cuantizacion en 3 bits degrada la calidad respecto a los pesos originales en precision completa.

## Requisitos de hardware

- VRAM estimada para los pesos: 10,9 GB en `Q3_K_M`, que junto con el contexto y el overhead de la libreria se traduce en un consumo practico de aproximadamente 12-14 GB.
- Memoria adicional para el KV cache: con 16 384 tokens de contexto en fp16, la estimacion razonable es de 2-3 GB adicionales; con 32 768 tokens, del orden del doble. Son estimaciones orientativas, no medidas publicadas por el autor.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4080, RTX 4090, RTX 5090, A6000 o superiores. Cualquier GPU con 16 GB o mas de VRAM permite ejecutarlo con contexto contenido.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas (RTX 4080/4090/5080/5090, RTX 3090, e incluso modelos de 12 GB con contexto reducido). En GPUs de 8 GB no cabe sin descarga parcial a RAM, lo que reduce drasticamente el throughput.
- Ejecucion solo en CPU: posible con llama.cpp, pero requiere 16 GB de RAM o mas para los pesos y ofrece velocidades muy bajas, del orden de pocos tokens por segundo en funcion del procesador.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF), Ollama (el repositorio incluye un `Modelfile` especifico), LM Studio, Jan, koboldcpp y otras interfaces basadas en GGUF. vLLM y TGI tienen soporte limitado o no soportado para GGUF, por lo que no son la via recomendada para esta publicacion.
- Latencia y throughput: no disponible. El autor no publica mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos disponibles | Licencia | Observaciones |
|---|---|---|---|---|---|
| Mistral-Small-24B-Instruct-2501-Abliterated GGUF Q3_K_M (esta ficha) | 23,6 B | No disponible; ejemplo a 16 384 tokens | GGUF Q3_K_M (10,9 GB) | Apache 2.0 | Cuantizacion de 3 bits, sin benchmarks, sin alineacion de seguridad, repositorio sin descargas |
| mistralai/Mistral-Small-24B-Instruct-2501 | 23,6 B | 32 768 tokens segun la documentacion publica del modelo base | safetensors | Apache 2.0 | Modelo original alineado, con filtros de rechazo, soporte oficial y benchmarks publicados por Mistral AI |
| Qwen2.5-32B-Instruct | 32,5 B | 131 072 tokens segun la documentacion publica de Qwen | safetensors, GGUF de terceros | Apache 2.0 | Mayor tamano y contexto, requiere mas VRAM; alternativa multilingue consolidada |
| Gemma-2-27B-it | 27 B | 8 192 tokens segun la documentacion publica de Google | safetensors, GGUF de terceros | Licencia propia de Gemma (no Apache 2.0) | Contexto mas corto y licencia con condiciones adicionales; menos adecuado para despliegues con requisitos de contexto largo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de estos modelos entre si en la informacion proporcionada. La comparacion anterior se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Perfil de seguridad alterado: la abliteracion elimina las direcciones de rechazo del modelo original. Esto implica que el modelo puede generar contenido danino, ilegal o gravemente inapropiado sin oponer resistencia. No es apto para aplicaciones de cara al publico sin un sistema de moderacion externo.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay evidencia de la fiabilidad factual del modelo. La cuantizacion de 3 bits tiende a incrementar la tasa de errores en tareas de razonamiento y de codigo frente a precisiones mayores.
- Perdida de calidad por cuantizacion: `Q3_K_M` es una cuantizacion agresiva. Para tareas que requieran precision (matematicas, codigo de produccion, extraccion de datos estructurados) se recomienda una cuantizacion de 5 o 6 bits, o los pesos sin cuantizar del modelo base.
- Idiomas: la ficha no declara idiomas soportados. El rendimiento fuera del ingles no esta verificado en esta publicacion.
- Contexto: la ficha no declara la ventana de contexto efectiva de esta cuantizacion. El valor de 16 384 tokens aparece solo como parametro de ejemplo en el comando de llama.cpp, no como especificacion del modelo.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial. No obstante, es una declaracion del autor de la cuantizacion; conviene verificar la cadena de licencias hasta `mistralai/Mistral-Small-24B-Instruct-2501` antes de un despliegue comercial.
- Repositorio sin validacion: cero descargas y cero "likes". No hay evidencia de que los archivos hayan sido verificados por terceros, ni sumas de comprobacion publicadas, ni pruebas de integridad.
- Cuantizacion no oficial: no esta respaldada ni revisada por Mistral AI. Cualquier incidencia debe reportarse al autor del repositorio, no al fabricante del modelo base.
- Ausencia de soporte de tool calling y agentes: no confirmado en la informacion disponible. Si el pipeline depende de function calling, hay que validarlo antes.
- Uso responsable: si el objetivo es investigar comportamiento sin filtros, conviene hacerlo en un entorno aislado, sin conexion a servicios externos y con registro de las salidas generadas.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/NINI26454/Mistral-Small-24B-Instruct-2501-Abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/venkycs/Mistral-Small-24B-Instruct-2501-Abliterated
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Ollama (runtime compatible con el `Modelfile` incluido): https://ollama.com
- llama.cpp (runtime compatible con GGUF): https://github.com/ggml-org/llama.cpp
- Resultados de la busqueda web: no se encontro ningun enlace relevante. Los unicos resultados devueltos corresponden a articulos sobre ExpressVPN y no guardan relacion con este modelo.
