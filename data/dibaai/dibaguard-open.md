# DibaAi/DibaGuard-Open

## Resumen

DibaGuard Open es un sistema de deteccion y proteccion frente a ataques de red publicado por DibaAi. No es un modelo de lenguaje generativo, sino una cascada de detectores estadisticos y redes neuronales ligeras que se situan donde lo harian un WAF, un IDS y un cortafuegos de host: en linea delante de una aplicacion, como servicio de decision externo detras de un balanceador (nginx, Envoy, HAProxy, Traefik, Caddy) o leyendo exportaciones de flujos y logs. La inferencia es unicamente numpy en Python, con una ruta rapida en Go sin dependencias que el autor declara bit-exacta respecto a la version Python sobre fixtures de paridad.

Cada alarma viene acompanada de una tasa de falsos positivos controlada mediante calibracion conformal sobre el trafico del propio sitio (presupuesto por defecto de 10^-3 por minuto y fuente), una familia de ataque nombrada y la evidencia que la produjo. La accion la decide la politica del operador: solo reportar o aplicar bloqueo. El repositorio incluye pesos, runtime, documentacion, informe de validacion independiente y auditoria de licencias.

Es relevante porque propone un enfoque de deteccion con garantias estadisticas explicitas y verdictos explicables, algo poco habitual en herramientas de seguridad basadas en firmas o en modelos caja negra. El build publico esta depurado de licencias: omite el modelo HTTP de la version privada porque se entreno con datos no redistribuibles, y la ruta limpia de reentrenamiento no generaliza, segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de detectores: arboles oblivious tipo CatBoost evaluados en numpy (tier 1), GRU causal con condicionamiento FiLM (tier 2), CUSUM, combinacion de Fisher, firmas y analisis de contexto SQL |
| Parametros totales | No disponible de forma agregada; la GRU SeqNet tiene 95.293 parametros (d = 64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa flujos y eventos por fuente, no secuencias de texto) |
| Tipos de cuantizacion | No aplica; pesos en arrays numpy (.npz) y arrays planos little-endian (.bin) |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | Codigo Apache-2.0; pesos CC BY-SA 4.0 (una fuente de entrenamiento exige ShareAlike) |
| Formato de pesos | .npz (numpy) y .bin con metadatos .bin.json para el runtime Go |

## Arquitectura y entrenamiento

La deteccion se organiza en niveles que operan a escalas distintas. El tier 0 mantiene 36 contadores de comportamiento con decaimiento exponencial por fuente en tres horizontes (10 s, 2 min, 30 min): proporcion de flujos sin respuesta, solo SYN, resets, puertos y hosts nuevos, flujos repetidos y cortos, huecos y tres contadores del lado destino. El tier 1 aplica arboles oblivious sobre 24 contadores de direccion de ataque con restricciones monotonas crecientes (mas recorrido de puertos o mas conexiones fallidas nunca puede parecer mas benigno), calibrado por servicio y antiguedad de fuente con conformal de Mondrian. El tier 1' calcula una anomalia sin etiquetas combinando p-valores de cola superior de las caracteristicas de forma mediante el metodo de Fisher. El tier 2 es una GRU causal con un estado oculto por fuente, condicionada por un vector de contexto del sitio, que solo se ejecuta sobre fuentes calientes.

Sobre esa base se anaden el tier 4 (CUSUM rapido y lento por fuente para acumular senales debiles), el tier 5 (inundacion de destino por avalancha de fuentes nuevas) y el tier 6 (seguimiento de campanas mediante huellas compartidas entre miles de fuentes). El borde HTTP aplica firmas A01-A22 (JNDI, rutas de explotacion CMS, inyeccion SQL/NoSQL/comando, traversal, XSS, SSTI/XXE/SSRF, sondas de ficheros sensibles, rastreadores de IA declarados), analisis de contexto SQL de cada parametro con DbNet como segunda opinion y un tier de sesion conductual. El tier de base de datos cubre logs de consulta y auditoria de seis motores. El escudo aplica politica de reporte o bloqueo con enforcers nft, iptables, netsh o dry-run, con TTL, auditoria de postura, identidad NAT/CGNAT/IPv6 y cola de revision.

No se detalla en la informacion disponible el volumen de tokens ni la composicion completa de los datasets de entrenamiento. DbNet se entreno con un corpus propio generado por gramatica, sin datos de terceros. El modelo HTTP privado uso CSIC 2010, un log etiquetado cuyo fichero bruto el propietario no libera y varias listas de payloads de licencia desconocida.

## Capacidades

- Deteccion de intrusiones en flujos de red con tasas de falsos positivos calibradas por sitio.
- Clasificacion de familias de ataque nombradas con evidencia asociada al verdicto.
- Deteccion de fuerza bruta, enumeracion, scraping y escaneres como comportamiento de sesion.
- Inspeccion HTTP con firmas A01-A22 y analisis de contexto SQL por parametro.
- Segunda opinion de base de datos mediante DbNet sobre logs de seis motores.
- Deteccion de inundaciones de destino y campanas distribuidas de baja intensidad.
- Aplicacion de politica: solo reporte o bloqueo efectivo via nft, iptables, netsh o dry-run.
- Identidad de red con soporte de NAT, CGNAT e IPv6.
- Puente LLM mediante MCP y REST para integracion con asistentes.
- Consola de operador, cola de revision y feedback del operador inmune a envenenamiento.
- Runtime dual: Python con numpy y ruta rapida Go sin dependencias, con paridad bit-exacta declarada.

## Casos de uso

- Proteccion perimetral de una API web: desplegado como servicio de decision detras de nginx o Envoy, cada peticion pasa por firmas, analisis SQL y tier de sesion, y el escudo aplica bloqueo con TTL sobre la fuente web responsable del payload.
- Deteccion de fuerza bruta y credential stuffing: el tier 0 y el tier de sesion acumulan contadores de fallos y repeticiones por fuente, de modo que un ataque distribuido de baja intensidad se detecta como comportamiento agregado y no como evento aislado.
- Monitorizacion de bases de datos: con DbNet y el analisis de contexto sobre logs de auditoria de seis motores, se identifica la fuente web detras de una consulta maliciosa sin bloquear a nivel de red el servidor de aplicaciones.
- Defensa frente a escaneres y scraping: la sesion conductual detecta enumeracion y recorrido sistematico de recursos, util para proteger catalogos, paneles de administracion y endpoints de busqueda.
- Deteccion de campanas distribuidas: el tier 6 correlaciona huellas compartidas entre miles de fuentes, adecuado para identificar botnets low-and-slow que individualmente no superan umbrales.
- Integracion en SOC con asistencia LLM: el puente MCP y REST permite que un asistente consulte verdictos, evidencia y estado de la cola de revision, y proponga reglas en cualquier lenguaje.
- Despliegue en entornos con restricciones de recursos: la inferencia numpy-only y la ruta Go sin dependencias permiten ejecutarlo junto a la aplicacion sin GPU ni framework de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona un informe de validacion independiente y un benchmark en `docs/` y `reports/`, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia es en CPU con numpy y Go, sin requisitos de GPU.
- GPU recomendadas: ninguna; el diseno es explicitamente CPU-light.
- Cabe en cualquier maquina capaz de ejecutar Python con numpy o un binario Go.
- Opciones de despliegue: runtime Python (`runtime/python/dibaguard/`), binarios Go (`dibaguard-authz`, `dibaguard-proxy`), servicio externo tras balanceador, o lectura pasiva de exportaciones de flujos y logs.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Sistema | Enfoque | Calibracion de falsos positivos | Explicabilidad | Licencia | Despliegue |
|---|---|---|---|---|---|
| DibaGuard Open | Cascada estadistica + GRU ligera + firmas | Conformal por sitio (10^-3 por fuente-minuto) | Familia de ataque y evidencia por verdicto | Codigo Apache-2.0, pesos CC BY-SA 4.0 | CPU, Python/Go, inline o externo |
| Snort / Suricata | Firmas IDS | No | Regla disparada | GPL / BSD segun proyecto | CPU, alto throughput |
| ModSecurity + CRS | Firmas WAF | No | Regla disparada | Apache-2.0 | CPU, modulo de servidor web |
| Detectores ML de flujos genericos | Modelo supervisado caja negra | Raramente explicita | Limitada | Variable | Requiere framework ML |

No se dispone de comparaciones de rendimiento publicadas frente a estas alternativas en la informacion disponible.

## Limitaciones y advertencias

- El build publico carece del modelo HTTP de la version privada: no hay puntuacion de anomalia por peticion para payloads que las firmas no nombran. La cobertura HTTP se limita a firmas A01-A22, contexto SQL, DbNet y tier de sesion.
- El reentrenamiento limpio de licencias del modelo HTTP colapsa en aplicaciones no vistas, segun el autor (`docs/CLEAN_MODELS.md`, seccion 0.4).
- Las garantias de falsos positivos dependen de la calibracion conformal sobre trafico propio; un sitio sin trafico representativo o con cambios de distribucion puede ver degradada la garantia.
- Riesgo de falsos negativos ante ataques que no encajen en las familias modeladas ni en las firmas.
- La licencia de los pesos es CC BY-SA 4.0, no Apache-2.0: el uso comercial o derivado de los pesos queda sujeto a ShareAlike, a diferencia del codigo.
- No se documentan sesgos ni evaluacion multilingue porque el sistema no procesa lenguaje natural como tarea principal.
- El proyecto se presenta en el contexto del reto Build with Beam y tiene 0 descargas en el momento de la consulta; madurez y soporte comunitario no verificables.
- La paridad bit-exacta entre Python y Go la declara el autor sobre fixtures de paridad; no se aportan resultados de validacion externa en los datos disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DibaAi/DibaGuard-Open
- Space complementario: https://huggingface.co/spaces/DibaAi/beam-dibaguard
- Reto Build with Beam: https://huggingface.co/reflection/Beam-1.0-501B-A23B/discussions/5
