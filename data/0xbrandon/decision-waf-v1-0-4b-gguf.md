# 0xBrandon/Decision-WAF-V1-0.4B-GGUF

## Resumen

Decision-WAF-V1-0.4B es un clasificador de peticiones HTTP disenado para actuar como motor de decision en un web application firewall (WAF). Lo desarrolla 0xBrandon y se publica bajo licencia Apache 2.0. Su funcion es concreta: recibe una unica peticion HTTP (metodo, ruta, query y cabeceras, sin inspeccionar el cuerpo) y devuelve probabilidades por categoria, de modo que la capa de ingress pueda emitir un veredicto block-or-allow aplicando un umbral ajustable sobre la puntuacion de ataque (1 - p(benign)).

Tecnicamente es un modelo encoder y no un decoder generativo: parte de un backbone ModernBERT-large de 421 millones de parametros y se afina desde el checkpoint de decisiones tipadas convaiinnovations/laya. En una sola pasada forward puntua cada opcion de categoria en posiciones marcadoras enmascaradas, lo que lo distingue de los modelos de 0,8B de la misma familia, que son LMs decoder que responden con un unico token de letra.

Su relevancia practica esta en el coste: con 0,4 GB de pesos y una latencia de aproximadamente 0,35 s por peticion en GPU de Apple M-series, ofrece un F1 de 0,944 en el benchmark del autor, competitivo con alternativas de 3B y 4B, y con una tasa de falsos positivos muy estable (0,041) en todo el rango de umbrales de 0,05 a 0,95.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large con cabecera de decisiones tipadas sobre posiciones marcadoras enmascaradas |
| Parametros totales | 421.029.889 (0,42B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; requiere micro-batch de 4096 tokens (`-b 4096 -ub 4096`) para que la peticion completa quepa en un unico micro-batch |
| Tipos de cuantizacion | GGUF Q8_0 (unico archivo publicado); el autor indica que Q8_0 es metricamente identico al checkpoint de precision completa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Decision-WAF-V1-0.4B-Q8_0.gguf`); repo de 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint de decisiones tipadas laya, construido sobre ModernBERT-large con 421M de parametros totales. En lugar de generar texto, evalua cada categoria candidata (`benign`, `auth_abuse`, `file_access`, `injection`, `other_attack`, `recon`, `ssrf_redirect`, `xss`) en posiciones marcadoras enmascaradas dentro de una unica pasada forward, devolviendo probabilidades por opcion. La inspeccion cubre metodo, ruta, query y cabeceras HTTP; el cuerpo de la peticion queda fuera del alcance del modo de inspeccion actual.

El entrenamiento usa RLCD (REINFORCE con baseline de media de grupo) contra reglas de scoring proper, con temperaturas de calibracion ajustadas sobre una porcion de calibracion reservada. Se realizaron 4 epocas y 9.100 actualizaciones del optimizador (aproximadamente 19 horas) en una unica RTX 4000 SFF Ada. El corpus consta de unas 150.000 peticiones HTTP etiquetadas, con el conjunto de evaluacion estrictamente separado mediante huellas de request-line, valores de query y valores de cabecera. El resultado es una distribucion de puntuaciones marcadamente bimodal y calibrada, lo que explica que el compromiso entre recall y FPR sea plano en el rango de umbrales 0,05-0,8.

## Capacidades

- Clasificacion de peticiones HTTP en ocho categorias: `benign`, `auth_abuse`, `file_access`, `injection`, `other_attack`, `recon`, `ssrf_redirect`, `xss`.
- Salida de probabilidades por opcion, apta para umbral ajustable sobre la puntuacion de ataque (1 - p(benign)).
- Deteccion de payloads transportados en cabeceras, incluidos Log4Shell y Shellshock (0,999 en el conjunto de evaluacion del autor).
- Manejo correcto de peticiones benignas con clientes no navegador y URLs de servicios conocidos en parametros.
- Deteccion de evasiones en el conjunto de confusores WAF-Bench: 56 de 57 ataques, incluidos los 14 casos de evasion.
- Inferencia en una sola pasada forward por peticion, sin generacion autoregresiva.
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Veredicto WAF por peticion en el edge: el modelo se coloca delante de servicios reales y devuelve block-or-allow en una pasada forward con umbral ajustable sobre 1 - p(benign); su latencia de ~0,35 s por peticion en GPU de Apple M-series y su FPR estable de 0,041 lo hacen viable como primera capa de filtrado.
- Deteccion de inyeccion SQL y de comandos en query y cabeceras: la categoria `injection` permite bloquear intentos clasicos sin inspeccionar el cuerpo, lo que reduce coste y exposicion de datos sensibles en el pipeline de inspeccion.
- Mitigacion de XSS reflejado: la categoria `xss` clasifica peticiones con payloads en parametros de query y cabeceras antes de que lleguen a la aplicacion.
- Proteccion de endpoints de autenticacion: la categoria `auth_abuse` permite identificar patrones de abuso de credenciales y fuerza bruta a nivel de peticion, complementando rate limiting y MFA.
- Deteccion de SSRF y redirecciones abiertas: la categoria `ssrf_redirect` senaliza peticiones que intentan forzar al servidor a realizar solicitudes a destinos internos o externos no previstos.
- Reconocimiento y escaneo: la categoria `recon` permite identificar fases de enumeracion (rutas de administracion, ficheros de configuracion, user-agents de escaneres) antes de que escalen a explotacion.
- Filtrado de cabeceras maliciosas en proxies y CDN: al cubrir method, path, query y headers, encaja en un ingress que ya termina TLS y aplica autenticacion, anadiendo una senal de seguridad sin tocar el cuerpo de la peticion.
- Defensa en profundidad en entornos con recursos limitados: con 0,4 GB de pesos y soporte en llama.cpp, puede desplegarse en nodos de borde modestos junto a TLS, autenticacion y backups, nunca como unica proteccion.

## Benchmarks y rendimiento

Conjunto de evaluacion del autor: 299 peticiones (145 benignas, 154 ataques), mismo harness para todos los modelos. La puntuacion de ataque es 1 - p(benign).

Barrer de umbrales (recall de ataque / tasa de falsos positivos):

| Umbral | h2o-lightning-4b | d1-3B | jev-latest | Decision-WAF-V1-0.4B |
|---|---|---|---|---|
| 0,05 | 1,000 / 1,000 | 1,000 / 1,000 | 1,000 / 0,262 | 0,929 / 0,048 |
| 0,10 | 0,994 / 0,517 | 1,000 / 0,945 | 1,000 / 0,234 | 0,929 / 0,041 |
| 0,20 | 0,968 / 0,248 | 0,994 / 0,621 | 0,987 / 0,166 | 0,929 / 0,041 |
| 0,35 | 0,961 / 0,221 | 0,909 / 0,159 | 0,974 / 0,103 | 0,922 / 0,041 |
| 0,50 | 0,955 / 0,207 | 0,799 / 0,055 | 0,916 / 0,055 | 0,922 / 0,041 |
| 0,70 | 0,922 / 0,152 | 0,636 / 0,028 | 0,909 / 0,055 | 0,922 / 0,041 |
| 0,80 | 0,903 / 0,131 | 0,565 / 0,007 | 0,903 / 0,048 | 0,922 / 0,041 |
| 0,90 | 0,896 / 0,055 | 0,461 / 0,000 | 0,864 / 0,048 | 0,916 / 0,041 |
| 0,95 | 0,857 / 0,041 | 0,338 / 0,000 | 0,851 / 0,048 | 0,909 / 0,041 |

Mejor F1 por modelo:

| Modelo | Mejor F1 | Umbral | P / R / FPR | Mejor recall con FPR <= 1% |
|---|---|---|---|---|
| h2o-lightning-4b | 0,920 | 0,90 | 0,945 / 0,896 / 0,055 | ninguno (FPR minimo 4,1%) |
| d1-3B | 0,883 | 0,35 | 0,859 / 0,909 / 0,159 | 0,565 |
| jev-latest | 0,941 | 0,32 | 0,904 / 0,981 / 0,110 | 0,799 |
| Decision-WAF-V1-0.8B | 0,936 | 0,001 | 0,979 / 0,896 / 0,021 | 0,851 |
| Decision-WAF-V1.1-0.8B | 0,967 | 0,002 | 0,974 / 0,961 / 0,028 | 0,916 |
| Decision-WAF-V1-0.4B | 0,944 | 0,08 | 0,960 / 0,929 / 0,041 | 0,779 |

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 ocupa aproximadamente 0,4 GB; la inferencia completa cabe holgadamente en cualquier GPU consumer con 4 GB o mas, y en CPU con memoria suficiente para el micro-batch de 4096 tokens.
- GPU recomendadas: el autor reporta pruebas en Apple M-series (Metal) y entrenamiento en una RTX 4000 SFF Ada; cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente para inferencia.
- Cabe en GPU consumer: si, con cuantizacion Q8_0 y margen amplio.
- Opciones de despliegue: llama.cpp (`llama-server` con soporte de laya decision-model) expuesto via el endpoint `/v1/systemone`, o el SDK laya (`laya-serve`, compatible Jev en ambos sentidos).
- Configuracion obligatoria: `-b 4096 -ub 4096` (o mayor) en llama.cpp, de modo que la peticion completa quepa en un unico micro-batch.
- Latencia: aproximadamente 0,35 s por peticion en GPU de Apple M-series con batch 1 y Metal. Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Mejor F1 | FPR en mejor F1 | Recall con FPR <= 1% | Licencia |
|---|---|---|---|---|---|---|
| Decision-WAF-V1-0.4B | 0,42B | Encoder (ModernBERT-large) | 0,944 | 0,041 | 0,779 | Apache 2.0 |
| Decision-WAF-V1.1-0.8B | 0,8B | Decoder LM (familia Decision-WAF) | 0,967 | 0,028 | 0,916 | no disponible |
| jev-latest | no disponible | no disponible | 0,941 | 0,110 | 0,799 | no disponible |
| h2o-lightning-4b | 4B | no disponible | 0,920 | 0,055 | ninguno (FPR minimo 4,1%) | no disponible |
| d1-3B | 3B | no disponible | 0,883 | 0,159 | 0,565 | no disponible |

Decision-WAF-V1-0.4B iguala o supera en F1 a modelos de 3B y 4B con una decima parte o menos de parametros, y mantiene un FPR plano y bajo en todo el rango de umbrales, a diferencia de h2o-lightning-4b y d1-3B, cuyo FPR se dispara al bajar el umbral. La version 0.8B de la misma familia obtiene mejor F1 y mejor recall a FPR bajo, a costa de duplicar el tamano.

## Limitaciones y advertencias

- Falsos positivos de alta confianza en terminos de busqueda benignos que parecen ataques (`1 or 2 players`, `cat /etc`, `${budget}`): puntuan 0,997 o mas, de modo que ningun umbral los separa. El autor identifica como solucion un fine-tune posterior que pondere esa familia de lookalikes.
- Solo inspecciona cabeceras: los ataques transportados en el cuerpo de la peticion quedan fuera del alcance del modo de inspeccion actual.
- Entrenado con datos curados y sinteticos: el cambio de distribucion (nuevas aplicaciones, formas de API inusuales, codificaciones distintas) puede mover el error en ambas direcciones; requiere monitorizacion y reentrenamiento.
- Un clasificador WAF puede ser evadido y puede clasificar mal: debe usarse como una capa mas, con logs de auditoria, y nunca como unica barrera entre internet y un servicio vulnerable.
- No es un detector de exploits ni sustituye al parcheo.
- Idiomas soportados no disponibles en la informacion proporcionada; el alcance linguistico de las peticiones no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `convaiinnovations/laya` deberia verificarse por separado si se redistribuye o modifica.
- El modelo tiene 186 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/0xBrandon/Decision-WAF-V1-0.4B-GGUF
- Repositorio decision-waf: https://github.com/0x4272616E646F6E/decision-waf
- Modelo base laya: https://huggingface.co/convaiinnovations/laya
- Informes oficiales decision-waf-eval: no disponible como enlace directo en la informacion proporcionada
- API de referencia jev-latest: https://api.typesafe.ai (mencionado como fuente de las metricas)
