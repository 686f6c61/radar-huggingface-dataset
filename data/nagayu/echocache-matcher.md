# NagaYu/echocache-matcher

## Resumen

EchoCache Matcher es el núcleo de coincidencia del proyecto EchoCache, publicado por el autor NagaYu como un único fichero Python que solo depende de numpy y de la biblioteca estándar. Su función es decidir si una respuesta de un LLM ya almacenada en caché puede reutilizarse para un prompt nuevo, es decir, ocupa exactamente la plaza que en una caché semántica convencional ocupa un modelo de embeddings de frases. No es una red neuronal: es un matcher determinista basado en reglas, con n-gramas de caracteres hasheados, un SimHash de 64 bits, un cribado de secretos y un guardián semántico de cinco comprobaciones. No contiene pesos entrenados, no descarga nada en tiempo de ejecución y la misma entrada produce siempre la misma salida en cualquier máquina.

El problema que aborda es un modo de fallo concreto de las cachés semánticas: servir una respuesta escrita para una pregunta distinta. Una similitud de embeddings de 0,95 indica que dos cadenas se parecen, no que tengan la misma respuesta; «Can I cancel my subscription?» y «Can I not cancel my subscription?» son casi idénticas para cualquier función de similitud y tienen respuestas opuestas. El matcher separa ambos trabajos: la similitud selecciona candidatos y el componente MismatchGuard veta la reutilización aunque se supere el umbral, devolviendo siempre un motivo legible por máquina.

El repositorio se publica como repositorio de modelo por el papel que desempeña en el ecosistema, no porque contenga un modelo en el sentido habitual. Está etiquetado como `rule-based`, `deterministic` y `no-weights`, con licencia Apache 2.0, idiomas declarados inglés y japonés, cero descargas y cero «likes» en el momento de la consulta. Es relevante para quien despliega cachés de LLM y necesita reducir coste sin asumir el riesgo de respuestas incorrectas por similitud superficial, y para quien opera en entornos sin GPU o con requisitos de auditabilidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Matcher determinista basado en reglas: n-gramas de caracteres hasheados (n=3, dim=4096, L2-normalizado, coseno) + SimHash de 64 bits con distancia de Hamming + MismatchGuard de cinco comprobaciones |
| Parametros totales | No aplica: el repositorio no contiene pesos entrenados. Se distribuye como un unico fichero Python (`echocache_matcher.py`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: no procesa contexto de atención, compara un prompt contra entradas indexadas. El coste medido de un fallo completo contra 5.000 entradas es de ~0,3 ms en CPU |
| Tipos de cuantizacion | No aplica: no hay pesos que cuantizar |
| Idiomas soportados | Ingles y japones declarados (la normalizacion incluye eliminacion de saludos, despedidas y avisos legales en EN y JA). Los n-gramas de caracteres no usan tokenizador ni fronteras de palabra, por lo que el autor indica que chino y thai se comportan igual que el ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | No hay pesos. Formato de distribucion: un fichero `.py` descargable desde el Hub; dependencias: numpy y biblioteca estandar |

## Arquitectura y entrenamiento

No existe entrenamiento. El sistema es completamente determinista y basado en reglas, y el autor lo justifica explicitamente: nada se aprende, nada se descarga en tiempo de ejecución y una misma entrada produce una salida identica en cualquier maquina. La arquitectura se organiza en dos etapas. La primera calcula similitud mediante n-gramas de caracteres de tamano 3 hasheados en un vector de 4096 dimensiones, normalizado en norma L2, y compara con coseno; al no usar tokenizador ni fronteras de palabra, funciona igual en escrituras sin espacios. Adicionalmente se calcula una huella SimHash de 64 bits y su distancia de Hamming, pensada para estrechar candidatos de forma barata antes de la comparacion completa.

La segunda etapa es MismatchGuard, que tiene la ultima palabra: cinco comprobaciones pueden vetar la reutilizacion incluso por encima del umbral de similitud. Estas comprobaciones son cambio de negacion, cantidad o unidad, nombre propio o numero de modelo, ancla temporal y tipo de pregunta. Cada rechazo se devuelve acompanado de un motivo legible por maquina, por ejemplo `numeric_mismatch:q={2024},c={2025}`, lo que hace auditable la decision. Como complemento de seguridad, la funcion `should_cache` impide almacenar secretos: rechaza numeros de tarjeta validos por Luhn, prefijos de credenciales, JWT, secretos de alta entropia, claves en formato PEM y exceso de PII de contacto. La normalizacion aplica NFKC, minusculas y plegado de espacios y puntuacion; `exact_key` es el sha256 de ese texto normalizado y actua como clave de coincidencia exacta.

## Capacidades

- Coincidencia exacta normalizada en una primera etapa: la clave sha256 sobre el texto normalizado resuelve reutilizaciones identicas sin calculo de similitud.
- Similitud semantica aproximada sin tokenizador mediante n-gramas de caracteres (n=3, 4096 dimensiones, coseno) sobre texto normalizado.
- Estrechamiento barato de candidatos mediante SimHash de 64 bits y distancia de Hamming.
- Veto de reutilizacion con cinco comprobaciones: negacion, cantidad o unidad, nombre propio o numero de modelo, ancla temporal y tipo de pregunta.
- Motivos de rechazo legibles por maquina, con formato estructurado, para trazabilidad y auditoria de cada decision.
- Filtro de seguridad de escritura en cache (`should_cache`): deteccion de numeros de tarjeta validos por Luhn, prefijos de credenciales, JWT, secretos de alta entropia, claves PEM y exceso de PII de contacto.
- Normalizacion de texto especifica para ingles y japones, con eliminacion de saludos, despedidas y descargos de responsabilidad.
- Estimacion de tokens sin dependencias (`estimate_tokens`): aproximadamente 4 caracteres ASCII o 1 caracter CJK por token.
- Ejecucion determinista y reproducible multiplataforma, sin descargas en tiempo de ejecucion y sin GPU.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: no es un modelo generativo.

## Casos de uso

- Cache semantica delante de una API de LLM en atencion al cliente: el matcher decide si una consulta entrante puede resolverse con una respuesta ya cacheada, con la coincidencia exacta como primera etapa y la similitud con guardas como segunda; el ahorro proviene de evitar llamadas repetidas a un modelo de pago.
- Pasarela multitenant de LLM: la version de produccion descrita en el Space de EchoCache anade particiones por inquilino, eviccion LRU y TTL; el matcher es la pieza que decide la reutilizacion dentro de cada particion.
- Proteccion frente a respuestas invertidas en dominios sensibles: en preguntas con negacion, como condiciones de cancelacion, elegibilidad o restricciones, MismatchGuard veta la reutilizacion y evita servir una respuesta con el sentido opuesto al de la consulta.
- Consultas con cifras, fechas o unidades: en catalogos de precios, disponibilidad, plazos o especificaciones tecnicas, la comprobacion de cantidad, unidad y ancla temporal impide reutilizar una respuesta de 2024 para una pregunta de 2025, con el motivo del rechazo registrado.
- Cumplimiento y prevencion de fugas: antes de escribir en cache, `should_cache` rechaza contenidos con numeros de tarjeta validos por Luhn, JWT, claves PEM o credenciales, lo que reduce el riesgo de persistir datos sensibles en un almacen compartido.
- Servicio multilingue EN/JA sin tokenizador: al operar sobre n-gramas de caracteres, un mismo binario atiende consultas en japones, chino o thai sin modelos de tokenizacion adicionales ni dependencias de idioma.
- Despliegue en el borde o en instalaciones sin GPU: al ser un unico fichero Python con numpy y coste de CPU de decimas de milisegundo, puede ejecutarse en portatiles, contenedores pequenos o entornos on-premise con requisitos de determinismo y de no descarga en tiempo de ejecucion.
- Filtro previo de una cache basada en embeddings: el matcher puede actuar como etapa barata de candidatos y como guardarraíl final sobre la decision de un modelo de embeddings, aportando motivos de rechazo auditables que un score de similitud no ofrece.

## Benchmarks y rendimiento

Evaluado sobre `NagaYu/echocache-guard-benchmark` con 131 pares de prompts: 41 que una cache puede reutilizar y 90 de alta similitud que no debe reutilizar nunca.

| Umbral | Guard | Precision | Recuperacion de reutilizacion | Reutilizacion incorrecta |
|---|---|---|---|---|
| 0,92 (por defecto) | activado | 97,7% | 92,7% | 0 / 90 |
| 0,92 | desactivado | 93,1% | 92,7% | 6 / 90 |
| 0,86 | activado | 97,7% | 95,1% | 1 / 90 |
| 0,80 | activado | 99,2% | 100% | 1 / 90 |
| 0,80 | desactivado | 77,9% | 100% | 29 / 90 |
| 0,70 | desactivado | 69,5% | 100% | 40 / 90 |

El autor senala que el guardián es lo que hace asumible bajar el umbral: a 0,80 convierte una tasa de respuestas incorrectas del 32% en un 1%. La reproduccion se realiza con `python3 evaluate.py` en el repositorio del dataset. En cuanto a velocidad, medida en un portatil de desarrollo y solo con CPU: aproximadamente 0,2 ms para extraer caracteristicas de un prompt y 0,3 ms para un fallo completo contra 5.000 entradas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con que no exista un modelo generativo que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: ninguna. No hay pesos ni paso por GPU; la ejecucion es en CPU.
- GPU recomendadas: no aplica. No se requiere GPU de ningun tipo.
- Cabe en cualquier GPU consumer: si, por innecesario; tambien en CPU de portatil, que es donde el autor realizo las mediciones.
- Requisitos de software: Python 3, numpy y biblioteca estandar. No hay dependencias de tokenizadores, frameworks de inferencia ni descargas en tiempo de ejecucion.
- Opciones de despliegue: descarga directa del fichero `echocache_matcher.py` mediante `hf_hub_download` e importacion dinamica, o copia del fichero dentro del proyecto. Se integra en la version de produccion del Space de EchoCache, que aporta particiones por inquilino, eviccion LRU, TTL, banda de candidatos SimHash, observabilidad y barrido de umbrales.
- Frameworks no aplicables: vLLM, llama.cpp, Ollama o TGI no tienen sentido aqui, porque no hay modelo de lenguaje que servir.
- Latencia y throughput estimados: ~0,2 ms para vectorizar un prompt y ~0,3 ms para un fallo completo contra 5.000 entradas, en CPU de portatil. No se proporcionan cifras de throughput para volumenes mayores ni para indices de mayor tamano.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos de terceros en la informacion proporcionada, y la busqueda web realizada no devolvio resultados relevantes (unicamente enlaces comerciales de compraventa de dominios). La comparacion se limita por tanto a caracteristicas cualitativas frente a la categoria que este componente sustituye: los modelos de embeddings de frases empleados como matcher en caches semanticas.

| Criterio | EchoCache Matcher | Modelo de embeddings en cache semantica |
|---|---|---|
| Naturaleza | Reglas deterministas, sin pesos | Red neuronal con pesos entrenados |
| Parametros | No aplica | No disponible en la informacion proporcionada |
| Longitud de contexto | No aplica | No disponible en la informacion proporcionada |
| Determinismo | Total: misma entrada, misma salida en cualquier maquina | Depende de version del modelo, precision numerica y backend |
| Descarga en tiempo de ejecucion | Ninguna | Requiere descargar los pesos |
| Dependencias | numpy y biblioteca estandar | Framework de inferencia y tokenizador |
| Coste de ejecucion | CPU, ~0,2 ms por prompt, ~0,3 ms por fallo contra 5.000 entradas | Requiere CPU o GPU segun tamano; coste no disponible |
| Idiomas sin tokenizador | Si: n-gramas de caracteres, funciona en escrituras sin espacios | Depende de la cobertura del tokenizador y del entrenamiento |
| Decision auditable | Si: motivo legible por maquina en cada rechazo | No: solo un score de similitud |
| Licencia | Apache 2.0 | No disponible en la informacion proporcionada |
| Disponibilidad | Repositorio publico del Hub, con 0 descargas y 0 likes en el momento de la consulta | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una red neuronal: el propio autor advierte que quien espere pesos entrenados se equivoca de repositorio. No genera texto, no razona y no puede usarse como sustituto de un LLM.
- La similitud es superficial. Dos prompts pueden tener el mismo significado sin solapamiento de caracteres (sinonimos, traducciones, reformulaciones largas o errores ortograficos graves) y producirian un falso negativo, es decir, una llamada evitable al modelo.
- MismatchGuard cubre cinco categorias concretas: negacion, cantidad o unidad, nombre propio o numero de modelo, ancla temporal y tipo de pregunta. Otros cambios de sentido, como condiciones, ambito, sarcasmo, cambios de idioma dentro de la misma conversacion o implicaturas, no estan cubiertos explicitamente.
- El sistema no aprende: no mejora con el uso ni se adapta al dominio. Cualquier ajuste requiere modificar reglas o umbral.
- Los idiomas con soporte declarado en la normalizacion son ingles y japones. El autor afirma que los n-gramas de caracteres se comportan igual en chino y thai, pero no se aportan mediciones para esas lenguas.
- Las cifras de rendimiento proceden de un unico benchmark de 131 pares de prompts publicado por el propio autor. No hay validacion independiente ni conjuntos de evaluacion externos.
- Las mediciones de latencia y de fallo contra 5.000 entradas son de un portatil de desarrollo y solo con CPU; no se documenta el comportamiento con indices mucho mayores ni el consumo de memoria del indice.
- La model card esta truncada en la tabla de API: la ultima fila visible empieza por `match` y no se muestra su descripcion completa. Los detalles de la funcion `match`, como su firma exacta y sus campos de retorno completos, no estan disponibles en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion indican 2026-09-19, ambas identicas y posteriores a la fecha de consulta habitual. Esto sugiere que el repositorio es nuevo, sin adopcion documentada y sin historial de mantenimiento; conviene verificar la actividad antes de depender de el en produccion.
- La licencia Apache 2.0 permite uso comercial y modificacion, con las obligaciones habituales de conservar avisos de licencia y de no usar las marcas del autor para respaldar derivados. No se ofrece ninguna garantia.
- Al integrarse en una cache, la responsabilidad sobre la politica de expiracion, el aislamiento entre inquilinos y la proteccion de datos recae en quien despliega; el matcher solo aporta el filtro de escritura y la decision de reutilizacion.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/NagaYu/echocache-matcher
- Space de EchoCache (version de produccion con particiones, LRU, TTL y observabilidad): https://huggingface.co/spaces/NagaYu/EchoCache
- Dataset de evaluacion echocache-guard-benchmark, con 131 pares y el script `evaluate.py`: https://huggingface.co/datasets/NagaYu/echocache-guard-benchmark
- Busqueda web: sin resultados relevantes. La unica coincidencia devuelta corresponde al mercado de dominios de Namecheap y no guarda relacion con el modelo. No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
