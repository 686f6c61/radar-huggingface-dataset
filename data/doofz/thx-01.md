# doofz/THX-01

## Resumen

THX-01 es un modelo de decision no autorregresivo y multilingue desarrollado por HAL-X AI (publicado en HuggingFace bajo la cuenta doofz). A diferencia de un modelo generativo, recibe un estado (un mensaje, ticket, correo, documento, registro JSON o traza de agente) junto con una o varias preguntas tipadas en lenguaje natural, y devuelve en una unica pasada hacia delante una respuesta calibrada para cada pregunta. El modelo no genera texto libre: clasifica, puntua, extrae numeros, extrae fragmentos literales y aporta citas de apoyo, todo a traves de la misma interfaz.

Tecnicamente es un encoder mmBERT-base de 22 capas y vocabulario de 256k tokens, sobre el que se anade una cabeza de decision de 15M parametros, sumando 321.908.998 parametros totales (322M). El post-entrenamiento se realizo mediante RLCD (Reinforcement Learning for Calibrated Decisions) a lo largo de ocho etapas a gran escala, con unas 2,1 millones de decisiones de entrenamiento y una regla de puntuacion estrictamente propia (strictly proper scoring rule) como recompensa, lo que incentiva que el modelo reporte probabilidades honestas. La latencia declarada es de unos 10 ms por peticion en una sola GPU y alrededor de 1 ms por decision cuando se procesa por lotes.

Su relevancia actual reside en el nicho de enrutamiento y extraccion fiable en produccion: frente al uso de LLM generativos para tareas de clasificacion o extraccion, THX-01 ofrece probabilidades calibradas (ECE de 0,003 en el conjunto Independent de su benchmark de tickets), extraccion literal verificable mediante `excerpt` y citas con offsets de caracteres, a una fraccion del coste por peticion. Esta publicado bajo licencia Apache 2.0 y se distribuye con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo; base mmBERT-base (22 capas), mas cabeza de decision de 15M parametros |
| Parametros totales | 321.908.998 (322M: 307M encoder + 15M cabeza de decision) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.024 tokens por pregunta (pregunta, opciones y estado); estados mas largos se truncan |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Post-entrenado en 18 idiomas con enfasis en azerbaiyano; 100+ idiomas soportados segun el autor. Listado explicito: az, en, ru, tr, de, fr, es, ar, hi, zh, fa, ka, ja, ko, uk, kk, uz, it, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria propia `thx01`; tamano del repositorio 2,6 GB) |

## Arquitectura y entrenamiento

THX-01 no es un modelo generativo ni decodifica tokens de forma secuencial. Su columna vertebral es `jhu-clsp/mmBERT-base`, un encoder transformer de 22 capas con vocabulario de 256.000 tokens, al que se anade una cabeza de decision de 15M parametros. La interfaz recibe un estado y una o varias preguntas tipadas (`choice`, `noul`, `score`, `number`, `excerpt`, y el flag `cite` aplicable a cualquier pregunta) y produce todas las respuestas en una sola pasada hacia delante, con una probabilidad asociada a cada opcion o nivel.

El entrenamiento se basa en RLCD (Reinforcement Learning for Calibrated Decisions) y consta de ocho etapas de RL a gran escala con aproximadamente 2,1 millones de decisiones de entrenamiento. La innovacion clave es que la recompensa es una regla de puntuacion estrictamente propia, de modo que maximizar la recompensa exige reportar probabilidades honestas; esto es lo que explica la calibracion declarada (ECE de 0,003 frente a 0,007 de TypeSafe Jev 1.13 o 0,202 de Kev-4B en el benchmark del autor). Las capacidades de extraccion son nativas: `number` devuelve el valor tal como aparece escrito en el documento, normalizado (por ejemplo, "1,2 mln" pasa a 1200000), y `excerpt` recorta su respuesta directamente del documento, por lo que no puede contener texto inventado. THX-01 tambien responde a llamadas de emulacion propias de los tipos TypeSafe (`choice` sobre buckets de rango y fragmentos de documento) mediante su lookup nativo.

## Capacidades

- Clasificacion por eleccion entre N opciones (`choice`), devolviendo una probabilidad por opcion.
- Preguntas binarias (`noul`) con P(yes).
- Puntuacion ordinal (`score`) sobre una lista ordenada de niveles, con su distribucion.
- Extraccion de numeros citados en el documento (`number`), con normalizacion del formato numerico y `null` si el dato no figura en el texto.
- Extraccion de fragmentos literales (`excerpt`) con los offsets de caracteres de la cita.
- Citacion de apoyo (`cite: true`) para cualquier tipo de pregunta, devolviendo las partes del documento que sustentan la respuesta con sus probabilidades.
- Soporte de tool calling / function calling: no disponible como tal; la interfaz es de decision tipada, no de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; acepta como estado trazas de agente (agent trace), pero no ejecuta razonamiento multi-paso.
- Capacidades multilingues: post-entrenado en 18 idiomas con enfasis en azerbaiyano, con 100+ idiomas soportados segun el autor.
- Capacidad especial: calibracion probabilistica nativa y calibracion de decisiones como criterio de entrenamiento; no dispone de modo "thinking" ni de vision ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto del ticket, el modelo devuelve la categoria (facturacion, reembolso, login, bug tecnico, caida de servicio, entrega, cambio de pedido, etc.) con una probabilidad calibrada, lo que permite fijar umbrales de confianza y derivar automaticamente los casos dudosos a revision humana.
- Extraccion de datos financieros: sobre informes de resultados, facturas o declaraciones de aduanas, responde preguntas `number` como el importe de ingresos o beneficio neto, citando la frase de apoyo; al no hacer conversion de unidades ni de divisa, devuelve `null` cuando la pregunta pide kilometros y el documento expresa millas.
- Verificacion con citas literales en contratos: la capacidad `excerpt` con offsets permite localizar la clausula exacta que responde a una pregunta, sin riesgo de texto inventado, util para revision legal asistida y para auditoria posterior.
- Analisis de correos entrantes: clasificacion por prioridad o tipo (queja, solicitud de funcionalidad, incidencia de seguridad y fraude, privacidad de datos) y extraccion de datos concretos citados en el cuerpo del mensaje, con latencia de unos 10 ms por peticion.
- Enrutamiento dentro de pipelines de agentes: usar THX-01 como capa de decision previa a un LLM generativo, de modo que solo las peticiones que superan un umbral de confianza lleguen al modelo grande, reduciendo coste y latencia global.
- Procesamiento por lotes de registros JSON: al rondar 1 ms por decision en modo batched, es adecuado para etiquetar grandes volumenes de registros estructurados (clasificacion y extraccion de campos) en una sola GPU.
- Investigacion sobre calibracion y reglas de puntuacion propias: al ser un modelo de 322M con RLCD documentado, sirve como banco de pruebas reproducible para estudiar calibracion probabilistica frente a modelos mucho mayores.

## Benchmarks y rendimiento

Clasificacion de tickets de soporte: 15 categorias, cuatro conjuntos de prueba con 2.843 tickets en azerbaiyano, ruso, ingles y turco (Clean, Corrupted con transliteracion, diacriticos eliminados, erratas y ruido; Messy, escritos deliberadamente desordenados; e Independent, escritos por GPT-6-Luna y nunca usados en entrenamiento). Metricas en porcentaje de acierto.

| Modelo | Clean | Corrupted | Messy | Independent | Media | ECE | Latencia |
|---|---|---|---|---|---|---|---|
| THX-01 | 99,2 | 97,7 | 98,8 | 97,9 | 98,4 | 0,003 | ~10 ms |
| Claude Sonnet 5.5 (†) | 98,5 | 98,0 | 98,5 | 99,0 | 98,5 | no disponible | 1,5 s |
| Wahoo 1.5 | 99,8 | 96,3 | 98,0 | 97,2 | 97,8 | no disponible | 145 ms |
| GPT-6-Luna | 98,6 | 97,4 | 96,7 | 98,2 | 97,7 | no disponible | 1,9 s |
| TypeSafe Jev 1.13 | 99,2 | 95,0 | 96,2 | 99,0 | 97,4 | 0,007 | 331 ms |
| Kev-4B | 96,1 | 88,4 | 90,8 | 95,8 | 92,8 | 0,202 | 830 ms |

(†) Evaluado sobre un subconjunto estratificado de 200 tickets por conjunto. El ECE se mide sobre el conjunto Independent; los LLM no devuelven probabilidades. La latencia de THX-01 es en una GPU; la del resto, a traves de sus API.

Extraccion y citacion: documentos multilingues en held-out (informes de resultados, facturas, declaraciones de aduanas, contratos, noticias, correos), con 1.824 preguntas de tipo numero y 1.357 de tipo fragmento. Las tareas de numero reportan exactitud de valor exacto, las de fragmento token F1 y las de citacion la exactitud de la parte de apoyo principal. La tabla comparativa publicada por el autor esta truncada en la informacion disponible (solo se conserva la cabecera "Number" y la mencion a "previous checkpoint" frente a THX-01), por lo que los valores concretos de esta tarea no estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de los 321.908.998 parametros): en FP32, aproximadamente 1,3 GB; en FP16/BF16, aproximadamente 0,65 GB. No se dispone de datos oficiales de cuantizacion, pero al tratarse de un encoder de 322M es candidato natural a INT8 (unos 0,32 GB) con las herramientas habituales de cuantizacion de encoders.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta unas latencias de ~10 ms por peticion y ~1 ms por decision en batched sobre una unica GPU, sin especificar el modelo concreto.
- Caben en GPU de consumo: si, practicamente todas las actuales (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.) e incluso en GPUs de gama baja con 4 GB. Tambien es viable su ejecucion en CPU para volumenes moderados, aunque no hay cifras de latencia en CPU publicadas.
- Opciones de despliegue: libreria oficial `thx01` desde PyPI (`pip install thx01`), que descarga los pesos en el primer uso y selecciona GPU si esta disponible; servidor REST mediante el extra `thx01[server]`. No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI, y en principio no aplican al no ser un modelo autorregresivo.
- Latencia y throughput: ~10 ms por peticion (~1 ms por decision en modo batched) en una GPU, segun el autor. No se han publicado cifras de throughput ni de rendimiento en CPU.

## Comparativa con modelos similares

La comparativa publicada por el autor se limita al benchmark de clasificacion de tickets, con estos competidores:

| Modelo | Parametros | Contexto | Media (tickets) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| THX-01 | 322M | 1.024 tokens por pregunta | 98,4 | 0,003 | Apache 2.0 | Pesos abiertos en HuggingFace |
| TypeSafe Jev 1.13 | no disponible | no disponible | 97,4 | 0,007 | no disponible | no disponible |
| Kev-4B | no disponible (nombre sugiere ~4B) | no disponible | 92,8 | 0,202 | no disponible | no disponible |
| Wahoo 1.5 | no disponible | no disponible | 97,8 | no disponible | no disponible | no disponible |
| GPT-6-Luna | no disponible | no disponible | 97,7 | no disponible | propietaria | API |
| Claude Sonnet 5.5 | no disponible | no disponible | 98,5 (subconjunto) | no disponible | propietaria | API |

No se dispone de datos de parametros, contexto ni licencia de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a exactitud, calibracion y latencia en esa tarea concreta. La ventaja diferencial de THX-01 no es tanto la exactitud bruta (Claude Sonnet 5.5 obtiene 98,5 de media en un subconjunto de 200 tickets por conjunto) como la combinacion de exactitud, calibracion verificable (ECE 0,003, muy por debajo de Kev-4B con 0,202) y latencia dos ordenes de magnitud menor que las API generativas comparadas.

## Limitaciones y advertencias

- Ventana de contexto corta: 1.024 tokens por pregunta, incluyendo pregunta, opciones y estado. Los estados mas largos se truncan, lo que puede eliminar informacion relevante en documentos extensos. Este es probablemente el principal cuello de botella para produccion.
- Ausencia de conversion de unidades y divisas: una pregunta sobre kilometros cuando el documento expresa millas, o sobre euros cuando expresa dolares estadounidenses, se responde con `null`. El consumidor debe normalizar previamente o tratar el `null` como caso a resolver.
- Modelo no generativo: no produce texto libre, resumen ni explicaciones. Las respuestas son categorias, probabilidades, numeros o fragmentos literales. No sustituye a un LLM en tareas generativas.
- Riesgo de alucinacion: acotado por diseno en `excerpt` (recorta el texto del documento) y en `number` (solo devuelve valores escritos, o `null`), pero persiste en `choice`, `noul`, `score` y en la seleccion de las citas de apoyo, donde el modelo podria seleccionar fragmentos poco relevantes.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible. El post-entrenamiento esta desequilibrado hacia el azerbaiyano, por lo que el rendimiento puede ser desigual entre los 18 idiomas post-entrenados y mas flojo en idiomas solo cubiertos por el encoder base.
- Cobertura de benchmarks limitada: los resultados de extraccion y citacion publicados estan truncados en la informacion disponible, y no hay evaluaciones independientes de terceros. Los numeros de la tabla de tickets proceden del propio autor.
- Licencia: Apache 2.0, que permite uso comercial y modificacion con atribucion; no obstante, conviene verificar la licencia del modelo base `jhu-clsp/mmBERT-base` en su repositorio original.
- Madurez: el repositorio acumula 41 descargas y 19 likes en el momento de la consulta, con la ultima actualizacion el 8 de octubre de 2026. El ecosistema es reducido (libreria propia `thx01`), lo que implica menos herramientas de despliegue probadas en produccion.
- La seccion de limitaciones de la model card original no esta disponible integra en la informacion proporcionada, por lo que pueden existir advertencias adicionales del autor no recogidas aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doofz/THX-01
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Libreria en PyPI: paquete `thx01` (referenciado en la model card; no se dispone de URL directa en la informacion proporcionada)
- Repositorio de codigo, paper tecnico, blog o demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido no relevante), por lo que no se incluye ningun enlace adicional procedente de esa fuente.
