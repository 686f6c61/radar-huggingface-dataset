# NagaYu/claimcheck-rules

## Resumen

ClaimCheck Rule Pack v1.1.0 es un paquete de reglas versionado publicado por el usuario NagaYu en Hugging Face. No es un modelo neuronal: el repositorio no contiene pesos, no se entrenó nada y no es cargable con `transformers`, pese a que la etiqueta `library_name: transformers` y el pipeline `text-classification` aparezcan en la barra lateral del Hub. Lo que contiene son las expresiones regulares, tablas de normalización, listas de supresión y presets de política que alimentan ClaimCheck, un verificador determinista de respuestas de LLM.

El problema que resuelve es el de la verificabilidad de respuestas generadas contra el contexto entregado (habitual en arquitecturas RAG). Su premisa de diseño es que no se puede detectar toda alucinación, pero sí las alucinaciones peligrosas, porque son específicas: números, fechas, citas, entidades y URL se pueden comparar como cadenas tras normalizar. Cada afirmación extraída recibe un estado (`supported`, `derived`, `approximate`, `unsupported`, `contradicted`) y el sistema informa siempre de la cobertura, es decir, de cuánto no comprobó.

Es relevante porque ofrece una alternativa auditable y de coste mínimo (0,17 ms típicos, 99 ms en el peor caso de 20.000 caracteres sobre 2 vCPU) frente a verificadores neuronales, con licencia Apache-2.0 y separación limpia entre motor, reglas y políticas. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor determinista de reglas: expresiones regulares, normalizacion de cadenas, tablas de magnitudes y aritmetica de 2-3 terminos. No es una red neuronal |
| Parametros totales | No aplica: no hay pesos en el repositorio |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica (no hay ventana de atencion). El coste escala con la longitud de la entrada: 20.000 caracteres en 99 ms sobre 2 vCPU |
| Tipos de cuantizacion | No aplica: no hay pesos que cuantizar |
| Idiomas soportados | Ingles (en) y japones (ja), incluidas tablas de eras japonesas y factores de magnitud 千/万/億/兆 |
| Licencia | Apache-2.0 |
| Formato de pesos | No hay pesos. Los artefactos son ficheros JSON de reglas (`rules/`) y de politicas (`policies/`) |
| Libreria declarada | transformers (etiqueta del Hub; el propio autor indica que es impuesta y enganosa) |
| Pipeline declarado | text-classification |
| Dependencias para verificacion | Ninguna (Python puro). pandas y gradio solo para el panel y la interfaz |
| Version del paquete | v1.1.0 |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento. El autor lo declara explicitamente: no se calcularon gradientes ni se realizo ajuste alguno, y presentarlo como un modelo entrenado seria una afirmacion falsa. La arquitectura real es una cadena de procesamiento determinista: extraccion de afirmaciones verificables como cadenas (numeros, fechas, citas, entidades, URL), normalizacion de ambos lados y asignacion de un unico estado por afirmacion. Los numeros pueden resolverse por aritmetica de 2-3 terminos, en cuyo caso se devuelve la formula empleada.

El paquete se organiza en `rules/` y `policies/`. En `rules/` figuran `manifest.json` (versiones, tipos de afirmacion, estados, veredictos, hechos del motor), `numeric.json` (reconocimiento numerico y factores de magnitud k/M/B y 千/万/億/兆), `dates.json` (patrones de fecha, desplazamientos de eras japonesas, nombres de meses), `entities.json` (patrones de entidad, mas de 200 palabras vacias, codigos de divisa ISO), `quotes.json` (patrones de cita y umbrales de similitud), `output_safety.json` (prefijos de credenciales, validacion Luhn, JWT, umbrales de entropia), `leak_detection.json` (patrones de fuga de system prompt y de eco de inyeccion de prompt) y `sentences.json` (segmentacion de frases, que actua como denominador de la cobertura). Todos los ficheros de `rules/` se generan programaticamente desde `python/app.py`, de modo que no pueden divergir del codigo que documentan: es el mecanismo de diseno que evita la deriva entre implementacion y documentacion.

Los presets de politica van numerados del 01 al 06 y su orden es intencionado: `01-observe` (no bloquea nada salvo seguridad critica, pensado para medir falsos positivos), `02-numeric-date-only` (solo NUMERIC y DATE, maxima precision), `03-retry-on-contradiction` (primer preset que consume un reintento, solo en contradicciones), `04-strict` (aplicacion completa), `05-low-latency` (CPU limitada o alto rendimiento) y `06-tolerant-numbers` (fuentes que redondean). El autor advierte de forma explicita que no se debe empezar por el preset 04. Existe un port a JavaScript con paridad de comportamiento verificada al 100% frente a la implementacion en Python sobre los 158 casos de evaluacion.

## Capacidades

- Verificacion de afirmaciones contra contexto: clasifica cada afirmacion en `supported`, `derived` (computable por aritmetica de 2-3 terminos, con formula devuelta), `approximate` (parafrasis, fecha mas granular, URL relacionada), `unsupported` o `contradicted` (el contexto contiene un valor cercano pero distinto).
- Metrica de cobertura: informa siempre de la proporcion de contenido no comprobado, junto con `verdict`, `grounding_score` y `coverage`.
- Comprobacion numerica y de fechas: normalizacion de magnitudes (k/M/B, 千/万/億/兆) y desplazamientos de eras japonesas.
- Comprobacion de entidades, citas y URL, con umbrales de similitud configurables para citas y mas de 200 palabras vacias para entidades.
- Seguridad de salida: deteccion de prefijos de credenciales, numeros de tarjeta mediante Luhn, JWT y umbrales de entropia.
- Deteccion de fuga de system prompt y de eco de patrones de inyeccion de prompt.
- Politicas preseleccionadas y auditables: seis presets JSON directamente utilizables como argumento `policy_json` del endpoint `/verify` del Space.
- Soporte bilingue ingles-japones.
- Integracion por API REST en servidor (implementacion Python) o en navegador sin envio de datos (Space y port JavaScript, con paridad de comportamiento del 100%).
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento: no es un modelo generativo.

## Casos de uso

- Verificacion de groundedness en pipelines RAG: antes de devolver la respuesta de un LLM al usuario, se pasa la respuesta junto con el contexto recuperado y se marca cada cifra, fecha o cita que no este respaldada. El coste de 0,17 ms por verificacion lo hace viable en linea sin penalizar la latencia del servicio.
- Guardarrail en atencion al cliente automatizada: con el preset `03-retry-on-contradiction`, el sistema reintenta solo cuando detecta una contradiccion (por ejemplo, un margen operativo afirmado que no se deduce de las cifras del contexto), evitando reintentos innecesarios en el resto de casos.
- Deteccion de fuga de system prompt en asistentes desplegados: los patrones de `leak_detection.json` permiten comprobar si la salida reproduce el prompt de sistema o ecos de intentos de inyeccion, sin necesidad de un clasificador neuronal adicional.
- Filtrado de credenciales y datos sensibles en respuestas generadas: los prefijos de credenciales conocidos, la validacion Luhn para tarjetas, la deteccion de JWT y los umbrales de entropia de `output_safety.json` permiten bloquear la salida antes de que llegue al cliente.
- Auditoria y regresion de un pipeline de evaluacion: el conjunto `NagaYu/claimcheck-eval` (158 casos bilingues) y la conformidad de especificacion 158/158 permiten usar el paquete como prueba de regresion reproducible y versionada frente a cambios en el verificador.
- Atencion al cliente de banca o seguros: el preset `02-numeric-date-only` limita la verificacion a NUMERIC y DATE, los dos chequeos de mayor precision, para minimizar falsos positivos cuando el coste de bloquear una respuesta valida es alto.
- Despliegue en entorno con CPU limitada o alto caudal: el preset `05-low-latency` esta disenado para ese escenario, y el peor caso medido (20.000 caracteres, 99 ms sobre 2 vCPU) acota el coste maximo por peticion.
- Verificacion en el navegador con requisitos de privacidad: el Space y su port JavaScript ejecutan las mismas reglas sin enviar datos a ningun servidor, util para entornos donde el contexto no puede salir del cliente.
- Verificacion de cifras procedentes de fuentes que redondean: el preset `06-tolerant-numbers` esta pensado para contextos donde el redondeo es aceptable y una comparacion estricta generaria falsos positivos.

## Benchmarks y rendimiento

Medido sobre el conjunto `NagaYu/claimcheck-eval` (158 casos bilingues):

| Metrica | Resultado |
|---|---|
| Conformidad de especificacion | 158/158 (100%) |
| Exhaustividad a nivel de respuesta (casos que debian marcarse y se marcaron) | 56/56 (100%) |
| Respuestas limpias aceptadas | 44/46 (96%) |
| Falsos positivos conocidos | 22 (13,9%) |
| Falsos negativos conocidos | 3 (1,9%) |
| Latencia p50 | Dato truncado en la informacion disponible |
| Latencia tipica de verificacion | 0,17 ms |
| Peor caso, 20.000 caracteres, 2 vCPU | 99 ms |
| Paridad de comportamiento Python / JavaScript | 100% sobre los 158 casos |

No se han publicado en la informacion disponible resultados comparativos frente a otros verificadores de groundedness.

## Requisitos de hardware

- GPU: no necesaria. El motor de verificacion no ejecuta operaciones tensoriales.
- CPU: suficiente con 2 vCPU para el peor caso medido de 20.000 caracteres en 99 ms; el caso tipico es de 0,17 ms.
- VRAM: no aplica. Al no haber pesos no hay requisito de memoria de video.
- RAM: no disponible en la informacion proporcionada. Las dependencias de verificacion son cero en Python puro, por lo que el consumo lo determina el tamano de los JSON de reglas y politicas cargados.
- GPU de consumo (RTX 4090, etc.): irrelevantes para este componente; solo serian necesarias para el modelo generativo cuya salida se verifica.
- Opciones de despliegue: API REST en servidor mediante la implementacion Python (`python/app.py`), Space de Hugging Face con interfaz Gradio (endpoint `/verify`, argumento `policy_json`), o port JavaScript embebido en navegador sin envio de datos.
- Latencia: 0,17 ms tipicos; 99 ms en el peor caso de 20.000 caracteres sobre 2 vCPU. El percentil p50 de la evaluacion esta truncado en la informacion disponible.
- Throughput: no disponible.

## Comparativa con modelos similares

No se ha proporcionado informacion de benchmarks ni especificaciones de alternativas comparables, por lo que las celdas cuantitativas se marcan como no disponibles. La comparacion relevante es de categoria, no de rendimiento: este paquete pertenece a la familia de verificadores de groundedness y guardarrailes de salida, donde conviven tanto clasificadores neuronales como conjuntos de reglas.

| Alternativa | Categoria | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| NagaYu/claimcheck-rules | Reglas deterministas, sin pesos | No aplica | No aplica | Apache-2.0 | Ver tabla de benchmarks |
| Verificadores neuronales de groundedness (NLI / clasificadores de fidelidad) | Red neuronal | No disponible | No disponible | No disponible | No disponible |
| Frameworks de guardarrailes basados en reglas y validadores | Reglas / DSL | No aplica | No aplica | No disponible | No disponible |

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relacionado con el modelo, por lo que no se dispone de cifras de terceros con las que contrastarlo.

## Limitaciones y advertencias

- No es un modelo neuronal. No hay pesos, no hubo entrenamiento y no se puede cargar con `transformers`, pese a las etiquetas `library_name: transformers` y `pipeline_tag: text-classification` que impone el Hub. Confundirlo con un modelo entrenado seria una afirmacion falsa.
- Solo verifica lo que se puede comprobar de forma determinista como cadena. Una afirmacion semanticamente incorrecta que no contenga numeros, fechas, citas, entidades o URL comparables no sera detectada.
- Tasa de falsos positivos del 13,9% (22 casos) sobre el conjunto de evaluacion. El propio autor advierte de que un verificador pierde a sus usuarios la primera vez que da una falsa alarma, de ahi el despliegue escalonado.
- Tasa de falsos negativos del 1,9% (3 casos): existen alucinaciones peligrosas que el sistema no marca.
- La respuesta limpia se acepta en el 96% de los casos (44 de 46), es decir, un 4% de respuestas validas no pasa el filtro en ese conjunto.
- Idiomas limitados a ingles y japones. El comportamiento en castellano no esta cubierto por el conjunto de evaluacion ni por las tablas de normalizacion documentadas.
- El dato de latencia p50 esta truncado en la model card disponible; no debe citarse como cifra definitiva.
- El paquete tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad mas alla de la evaluacion del propio autor.
- Los ficheros de `rules/` se generan desde `python/app.py`; modificar las reglas a mano rompe la garantia de no divergencia entre documentacion y codigo.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan garantias ni soporte. La idoneidad para produccion debe validarse con el propio conjunto de datos antes de activar los presets de aplicacion estricta.
- No admite tool calling, agentes, vision, audio ni razonamiento multi-paso: es un componente de verificacion, no un generador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NagaYu/claimcheck-rules
- Space de demostracion: https://huggingface.co/spaces/NagaYu/ClaimCheck
- Conjunto de evaluacion: https://huggingface.co/datasets/NagaYu/claimcheck-eval
- La busqueda web realizada no devolvio resultados relevantes para este modelo, su autor ni su espacio; el resto de enlaces del ecosistema no estan disponibles en la informacion proporcionada.
