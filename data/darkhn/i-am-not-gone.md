# Darkhn/I-am-not-gone

## Resumen

Darkhn/I-am-not-gone es un repositorio de Hugging Face publicado por el usuario Darkhn, con fecha de creacion registrada el 18 de septiembre de 2026 y ultima actualizacion el mismo dia, bajo licencia Apache 2.0. En el momento de redactar esta ficha el repositorio no contiene pesos, tokenizador, codigo de inferencia ni fichero de configuracion: la totalidad de su model card es una nota de estado titulada "Just a small update" en la que el autor describe trabajo en curso, no un artefacto desplegable.

Segun esa nota, el autor esta entrenando "otro gemma 4 31B". Menciona haber completado alrededor de 12 ejecuciones de entrenamiento en las que varia el valor de SWA (stochastic weight averaging), ajustes de RoPE y turn masking, y afirma que 2048 le parece el punto dulce para entrenar con una ventana de contexto de 8k tokens. El entrenamiento se realiza en GPUs RTX 3090 locales, lo que el propio autor describe como lento, y anuncia la publicacion de un modelo nuevo en unas 2-3 semanas.

La relevancia de esta entrada es exclusivamente documental: permite constatar que el identificador existe y registrar las practicas de entrenamiento que el autor cita, pero no ofrece ningun elemento evaluable en terminos de capacidades, rendimiento o requisitos de hardware. No debe confundirse con un modelo publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe arquitectura alguna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el README menciona entrenamiento con contexto de 8k, sin asociarlo a ningun artefacto publicado) |
| Tipos de cuantizacion | no disponible (no hay pesos en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene ficheros de pesos) |
| Autor | Darkhn |
| Pipeline declarado | no disponible |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-18 |
| Fecha de actualizacion | 2026-09-18 |
| Etiquetas | license:apache-2.0, region:us |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura del modelo en la informacion proporcionada. El repositorio no incluye config.json, ficheros safetensors, GGUF ni documentacion tecnica, por lo que no es posible determinar si se trata de un transformer denso, un MoE, un modelo hibrido o cualquier otra variante, ni confirmar el numero de parametros, el vocabulario o el diseno de atencion.

Los unicos datos tecnicos disponibles proceden de la nota de estado del autor, que se refiere a un entrenamiento sobre una base que denomina "gemma 4 31B". En esa nota se citan como variables de experimentacion el valor de SWA, parametros de RoPE y turn masking, con unas 12 ejecuciones realizadas, y se indica que 2048 es el valor optimo encontrado para entrenar con 8k de contexto. Tambien se senala que el entrenamiento se ejecuta en GPUs RTX 3090 locales. Estos datos describen el proceso del autor y no constituyen especificaciones verificables de ningun modelo publicado en este repositorio. No se menciona composicion de dataset, numero de tokens, ni uso de RLHF, DPO u otras tecnicas de alineamiento.

## Capacidades

- No es posible verificar ninguna capacidad: el repositorio no contiene pesos ni codigo ejecutable.
- Generacion de texto, razonamiento, codigo o matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas aparece vacio en los metadatos).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- La unica funcionalidad observable del repositorio es servir como nota publica de estado del autor.

## Casos de uso

No es posible enumerar casos de uso practicos para este repositorio, porque no contiene ningun modelo desplegable. La exigencia de un minimo de seis casos concretos no puede satisfacerse sin inventar capacidades inexistentes en la informacion disponible. Lo unico que puede afirmarse es:

- Seguimiento de trabajo en curso: un lector interesado en los experimentos de ajuste fino del autor puede consultar la nota para conocer que hiperparametros esta explorando (SWA, RoPE, turn masking) y sobre que base dice estar trabajando.
- Referencia documental: la URL puede citarse como evidencia de que el identificador Darkhn/I-am-not-gone existia en esa fecha y con esa licencia declarada.
- Monitorizacion de repositorios: herramientas que rastrean publicaciones de un mismo autor pueden usar esta entrada como senal de que se espera una publicacion futura en 2-3 semanas, segun la propia nota.
- Auditoria de licencias: dado que el repositorio declara apache-2.0 sin contener material licenciable, puede usarse como ejemplo de discrepancia entre licencia declarada y contenido real.

Cualquier escenario de produccion (atencion al cliente, generacion de codigo, analisis documental, agentes, RAG) queda descartado mientras no existan pesos ni documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y el repositorio no incluye tabla de resultados ni artefactos de evaluacion.

## Requisitos de hardware

- VRAM para inferencia: no disponible (no existen pesos que cargar).
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible para inferencia.
- Unico dato de hardware en la informacion proporcionada: el autor indica que entrena en GPUs RTX 3090 locales, lo que corresponde a 24 GB de VRAM por tarjeta; no se especifica cuantas unidades utiliza ni que tecnicas de ahorro de memoria emplea.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible, al no haber pesos ni configuracion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo, de modo que no existe una base homogenea para comparar parametros, contexto, rendimiento ni disponibilidad. La unica referencia comparativa posible seria el modelo que el autor menciona como base de su entrenamiento ("gemma 4 31B"), pero no se aportan datos verificables sobre el mismo en la informacion proporcionada, y la busqueda web realizada no devolvio resultados relacionados con dicho modelo.

| Aspecto | Darkhn/I-am-not-gone | Alternativas |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | no disponible | no disponible |
| Licencia | apache-2.0 (sin material licenciable) | no disponible |
| Disponibilidad | repositorio sin pesos | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene ningun modelo: no hay pesos, tokenizador, configuracion ni codigo de inferencia. No es utilizable en produccion bajo ninguna circunstancia.
- La model card no aporta especificaciones tecnicas del artefacto, sino una actualizacion de estado del autor. No debe interpretarse como documentacion de un modelo.
- La licencia apache-2.0 aparece declarada en los metadatos y en el encabezado de la model card, pero no hay material sobre el que ejercer los permisos que esa licencia concede.
- Cero descargas y cero likes en la fecha de actualizacion registrada, lo que es coherente con la ausencia de artefacto publicado.
- La referencia a "gemma 4 31B" procede unicamente del texto del autor y no se ha podido verificar ni contrastar con ninguna fuente externa.
- Riesgo de confusion: el nombre del repositorio ("I-am-not-gone") y su licencia permisiva podrian llevar a asumir que se trata de un modelo publicado; no lo es.
- Sesgos, alucinacion y limitaciones de idioma: no evaluables, al no existir modelo.
- La fecha de creacion y actualizacion registrada (2026-09-18) procede de los metadatos de la plataforma y no se ha verificado por otra via.
- La busqueda web asociada no devolvio ninguna fuente relacionada con el repositorio ni con su autor: los resultados obtenidos correspondian a paginas de descarga del navegador Google Chrome y a Google Photos, sin relacion con el objeto de esta ficha.

## Enlaces

- [Darkhn/I-am-not-gone en Hugging Face](https://huggingface.co/Darkhn/I-am-not-gone)
- Paper: no disponible
- Blog o nota tecnica: no disponible (la model card del propio repositorio es la unica nota existente)
- Repositorio de codigo: no disponible
- Demos: no disponible
- Perfil del autor: no disponible en la informacion proporcionada
