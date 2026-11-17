# hareramray325/qwen2.5-coder-1.5b-xss

## Resumen

qwen2.5-coder-1.5b-xss es un adaptador QLoRA sobre Qwen/Qwen2.5-Coder-1.5B-Instruct, desarrollado por hareramray325, especializado en la deteccion de vulnerabilidades de cross-site scripting (XSS) en codigo fuente. El modelo lee ficheros de codigo y genera informes JSON estructurados con fuentes (sources), sumideros (sinks), la ruta de flujo de datos, el contexto de salida, la severidad, una correccion propuesta y una prueba de concepto para pruebas autorizadas. Cubre codigo de Vue 3, Django y Spring Boot (Thymeleaf/JSP).

El modelo resuelve un problema concreto: automatizar una primera pasada de analisis de seguridad sobre codigo de aplicaciones web, devolviendo resultados verificables (cada fichero, linea y fragmento citado existe en la entrada) en un formato consumible por herramientas. Es relevante para equipos de AppSec y desarrolladores que quieran integrar deteccion de XSS en pipelines de revision, aunque sus propios benchmarks muestran una tasa de falsos positivos del 50 % en patrones no vistos, por lo que debe tratarse como triaje asistido, no como auditoria.

Arquitectonicamente es un adaptador PEFT (LoRA/QLoRA) de bajo rango sobre un transformer decoder-only de 1.500 millones de parametros. El repositorio ocupa 0,1 GB, correspondiente unicamente a los pesos del adaptador; el modelo base debe descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder) con adaptador LoRA/QLoRA (PEFT) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base; no confirmada) |
| Tipos de cuantizacion | QLoRA durante el entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros orientado a codigo. El entrenamiento se realizo en dos etapas de QLoRA sobre una unica GPU de 8 GB. La etapa 1 entreno la capacidad de escaneo de codigo; la etapa 2 (la que corresponde a este adaptador, denominada "chat/mix") anadio datos conversacionales para que el modelo pudiera tanto escanear ficheros como responder preguntas sobre XSS en prosa.

El formato de prompt es especifico: un system prompt mas el codigo con cada linea prefijada por su numero de linea. La generacion de datos de entrenamiento se baso en plantillas (20 plantillas de codigo segun la model card), lo que explica las puntuaciones casi perfectas en el conjunto de test sintetico y la caida acusada en el conjunto out-of-distribution. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Deteccion de XSS en codigo fuente de Vue 3, Django y Spring Boot (Thymeleaf/JSP).
- Generacion de informes JSON estructurados y validos (97,2 % de JSON valido en el conjunto OOD) con sources, sinks, ruta de flujo de datos, contexto de salida, severidad, correccion y prueba de concepto.
- Citacion verificable: cada fichero, linea y fragmento citado existe en la entrada (83,3 % de citas correctamente ancladas en OOD).
- Clasificacion del tipo de XSS (reflejado, almacenado, DOM-based) con un 75 % de acierto sobre verdaderos positivos en OOD.
- Respuesta a preguntas sobre XSS en prosa (por ejemplo, "que es DOM-based XSS"), con redaccion basada en plantillas.
- Generacion de payloads de prueba de concepto para pruebas de seguridad autorizadas.
- Capacidad de chat multi-turno y escaneo interactivo mediante la CLI del repositorio.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Revision de seguridad en pipelines de CI/CD: el modelo puede escanear ficheros de vistas Django o plantillas Thymeleaf en cada pull request y emitir un informe JSON que un paso posterior parsee y publique como comentario. Su 97,2 % de JSON valido en OOD lo hace apto para consumo automatico, aunque el 50 % de falsos positivos exige un filtro o revision humana.
- Triaje previo a una auditoria manual: un equipo de AppSec puede pasar un repositorio por el modelo para localizar candidatos a XSS con su ruta de flujo de datos y priorizar la revision humana por severidad, reduciendo el tiempo de lectura inicial.
- Formacion de desarrolladores: el modelo responde preguntas sobre XSS en prosa y explica la diferencia entre XSS reflejado, almacenado y DOM-based, util en sesiones de concienciacion o documentacion interna.
- Generacion de pruebas de concepto en entornos controlados: dado un fragmento vulnerable, produce un payload de ejemplo para validar el fallo en un entorno de staging propio o autorizado, con la advertencia explicita de uso etico.
- Analisis de plantillas frontend Vue 3: detecta el uso de `v-html` y otros sumideros en componentes, senalando si la entrada es controlada por el atacante o esta saneada, aunque con la limitacion conocida de sobre-marcado.
- Integracion en una CLI de escaneo: el repositorio qwen-cyber expone comandos para escanear ficheros concretos o abrir un modo interactivo, lo que permite incorporarlo como herramienta local en el flujo de trabajo de un desarrollador sin infraestructura adicional.
- Respuesta a preguntas tecnicas sobre saneamiento: puede orientar sobre correcciones (escape de salida, uso de APIs seguras) en el contexto de los frameworks cubiertos, si bien sus respuestas siguen plantillas y no deben tomarse como asesoria definitiva.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados). Conjunto out-of-distribution de 36 ejemplos escritos a mano, con patrones que el generador de entrenamiento nunca produce:

| Metrica | Modelo base | Adaptador scan-only | Este adaptador (chat/mix) |
|---|---|---|---|
| JSON valido | 66,7 % | 97,2 % | 97,2 % |
| Citas ancladas (grounded) | 22,2 % | 66,7 % | 83,3 % |
| Precision de deteccion | 41,7 % | 55,6 % | 58,3 % |
| Recall | 100 % | 64,7 % | 70,6 % |
| Tasa de falsos positivos (menor es mejor) | 90,0 % | 50,0 % | 50,0 % |
| Linea del sink (sobre verdaderos positivos) | 64,3 % | 100 % | 100 % |
| Precision del tipo de XSS | 42,9 % | 54,5 % | 75,0 % |
| Precision del contexto de salida | 35,7 % | 81,8 % | 83,3 % |

Conjunto sintetico de test reservado (593 ejemplos), medido sobre el predecesor scan-only (misma etapa 1, antes de anadir el mix de chat); este adaptador no fue reevaluado en este conjunto:

| Metrica | Modelo base | Adaptador scan-only |
|---|---|---|
| JSON valido | 65,3 % | 100 % |
| Citas ancladas (grounded) | 13,7 % | 99,3 % |
| Precision de deteccion | 43,0 % | 100 % |
| Recall | 97,5 % | 100 % |
| Tasa de falsos positivos (menor es mejor) | 87,5 % | 0 % |

El propio autor advierte que el conjunto sintetico usa las mismas 20 plantillas que el entrenamiento, por lo que las puntuaciones casi perfectas reflejan memorizacion de plantillas y no capacidad general de deteccion; la tabla OOD es la referencia honesta. Con solo 36 ejemplos, cada metrica se mueve unos 3 puntos, por lo que diferencias pequenas deben leerse como ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El modelo base tiene 1.500 millones de parametros; en precision completa (fp16) rondaria los 3 GB de pesos, y en cuantizacion de 4 bits aproximadamente 1 GB, mas overhead de contexto y del adaptador.
- GPU recomendadas: el entrenamiento QLoRA se realizo en una unica GPU de 8 GB; para inferencia basta una GPU consumer con 8 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Cabe en GPU consumer: si, dado el tamano del modelo base y el bajo consumo del adaptador.
- Opciones de despliegue: transformers + peft (documentado en la model card); la CLI del repositorio qwen-cyber carga el adaptador directamente desde el Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La comparativa mas directa disponible es contra el propio modelo base y contra el adaptador predecesor scan-only, recogida en la seccion de benchmarks:

| Modelo | Parametros | Contexto | Precision OOD | Recall OOD | Falsos positivos OOD | Licencia |
|---|---|---|---|---|---|---|
| qwen2.5-coder-1.5b-xss (este) | 1,5 B + LoRA | no disponible | 58,3 % | 70,6 % | 50 % | MIT |
| Adaptador scan-only (predecesor) | 1,5 B + LoRA | no disponible | 55,6 % | 64,7 % | 50 % | no disponible |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5 B | no disponible | 41,7 % | 100 % | 90 % | no disponible |

## Limitaciones y advertencias

- Aproximadamente la mitad del codigo seguro se marca como vulnerable en patrones no vistos: el modelo reacciona a APIs peligrosas como `v-html` o `mark_safe` sin comprobar si la entrada esta controlada por el atacante o ya saneada.
- Omite sumideros de tipo `javascript:` en URLs que no ha visto, como `src` de iframe o `format_html` construyendo un `href`.
- Las respuestas en prosa siguen plantillas generadas automaticamente: son correctas pero rigidas y poco flexibles.
- Sobrerrechaza algunas peticiones legitimas de codigo de explotacion en chat libre; el escaneo de codigo es la via fiable para obtener una prueba de concepto.
- El modelo debe tratarse como una primera pasada para verificacion humana, no como una auditoria de seguridad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado, pero las citas no ancladas (16,7 % en OOD) implican referencias a lineas o fragmentos inexistentes en algunos casos.
- Limitacion de idioma: solo ingles.
- Restricciones de licencia: MIT permite uso comercial, pero la model card restringe explicitamente el uso a educacion y pruebas de seguridad autorizadas; los payloads generados solo deben usarse en sistemas propios o con autorizacion explicita.
- Las metricas del conjunto sintetico (593 ejemplos) no demuestran capacidad de generalizacion, segun el propio autor, y este adaptador no fue reevaluado en ese conjunto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hareramray325/qwen2.5-coder-1.5b-xss
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de benchmark: https://huggingface.co/datasets/hareramray325/xss-detection-bench
- Repositorio de codigo, entrenamiento y evaluacion: https://github.com/hareramray/qwen-cyber
