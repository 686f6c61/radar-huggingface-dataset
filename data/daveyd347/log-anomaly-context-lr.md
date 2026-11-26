# DaveyD347/log-anomaly-context-lr

## Resumen
`log-anomaly-context-lr` es un clasificador tabular de detección de anomalías en logs de seguridad, publicado por el usuario DaveyD347 en Hugging Face. No es un modelo de lenguaje: es una regresión logística de scikit-learn entrenada sobre 194 tokens de línea y 40 features de contexto, con un peso total de aproximadamente 6 KB. Su tarea es puntuar cada línea de un flujo de logs (Apache access, sshd/sudo syslog, auditd `EXECVE`, AWS CloudTrail y BIND) para decidir si forma parte de un ataque, indicando qué señales contribuyeron a la decisión.

La innovación central es el contexto de streaming: el modelo procesa el flujo de arriba abajo manteniendo una memoria pequeña por IP, cuenta, access key, host y cliente DNS, de modo que cada línea se evalúa con lo que ocurrió antes y solo con lo anterior. Esto permite usarlo sobre un feed en vivo y captura casos que un clasificador línea a línea no puede ver, como `uname -a` tras 80 fallos SSH o un `GetObject` desde una IP nunca usada por esa clave.

Es relevante por su perfil de coste: inferencia en el navegador, licencia Apache 2.0, explicabilidad nativa por coeficientes y un rendimiento declarado de 0,926 F1 en un conjunto de desafío desplazado con variantes de ataque no vistas en entrenamiento, frente a 0,45-0,67 de los clasificadores de una sola línea. El modelo está etiquetado solo para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn) sobre features tabulares |
| Parametros totales | 194 features de línea + 40 features de contexto (pesos de ~6 KB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | contexto de streaming por entidad (IP, cuenta, access key, host, cliente DNS); tamaño exacto de memoria no disponible |
| Tipos de cuantizacion | no disponible (modelo lineal, pesos de 6 KB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | skops (librería sklearn) |

## Arquitectura y entrenamiento
El modelo es una regresión logística lineal, no una red neuronal ni un transformer. La entrada se construye en dos bloques: 194 tokens extraídos de la línea de log y 40 features de contexto derivadas de una memoria de streaming por IP, cuenta, access key, host y cliente DNS. Esa separación es lo que permite generalizar a variantes de ataque no vistas: el modelo no depende solo del valor exacto de un token, sino de la relación entre la línea actual y el historial previo de la entidad.

El entrenamiento se realizó sobre el dataset `DaveyD347/sanitized-incident-logs`, con una partición de test de 418 sesiones y 25.977 líneas, y un conjunto de desafío desplazado de 360 sesiones y 16.324 líneas que contiene herramientas, payloads, nombres de usuario, dominios y codificaciones nunca vistos en entrenamiento, además de nuevos negativos difíciles. La model card no detalla el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de calibración o regularización específicas; esos datos figuran como no disponibles.

## Capacidades
- Detección de anomalías línea a línea en logs de Apache access, sshd/sudo syslog, auditd `EXECVE`, AWS CloudTrail JSON y BIND query logs, mezclados en cualquier orden.
- Clasificación binaria tabular: cada línea recibe una puntuación de "forma parte de un ataque" o no.
- Contexto de streaming por IP, cuenta, access key, host y cliente DNS, evaluando solo eventos anteriores.
- Explicabilidad: al ser un modelo lineal, los coeficientes permiten justificar la decisión por línea.
- Detección de escenarios concretos como credential stuffing, DNS tunneling con codificación hexadecimal, password spray SSH lento, uso de claves AWS robadas y shells JSP/ASPX.
- Ejecución ligera: pesos de ~6 KB, apto para inferencia en navegador (Space de Hugging Face).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; no es un modelo generativo.
- Capacidades multilingües: no disponibles; etiquetado únicamente para inglés.

## Casos de uso
- Triaje en SIEM: puntuar en tiempo real cada línea entrante de un colector y priorizar alertas por score, usando la memoria por IP y cuenta para elevar eventos que aislados parecerían rutinarios.
- Detección de post-explotación tras fuerza bruta SSH: el contexto por IP permite marcar `uname -a`, `id` o `lscpu` cuando siguen a decenas de fallos de autenticación, caso que un clasificador de una línea no detecta.
- Monitorización de CloudTrail: identificar uso anómalo de access keys AWS cuando cambian simultáneamente IP y user agent, señalando posible robo de credenciales.
- Detección de DNS tunneling: combinar features de longitud de etiqueta, entropía y subdominios únicos por dominio para marcar consultas A/AAAA sospechosas en logs BIND.
- Análisis forense sobre logs históricos: reprocesar un flujo completo en orden para reconstruir la secuencia de eventos de un incidente con explicaciones por línea.
- Filtrado previo a correlación: reducir el volumen que llega a reglas de firma o a un analista, manteniendo una tasa de falsos positivos declarada del 8,1 % en el conjunto de desafío.
- Despliegue en entornos con recursos limitados: al ser un modelo de 6 KB, puede ejecutarse en el navegador o en un contenedor mínimo sin GPU, útil para demos, formación o validación rápida de pipelines.

## Benchmarks y rendimiento
Resultados declarados por el autor (no verificados) en la model-index y la model card:

| Modelo | Contexto | Challenge F1 | Challenge AP | Challenge precision | Challenge recall | Challenge FPR | Test F1 | Test AP | Test FPR |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Reglas de firma (16 regex) | ninguna | 0,522 | 0,655 | 0,849 | 0,377 | 0,078 | 0,740 | 0,795 | 0,012 |
| Isolation Forest (solo benigno) | contexto streaming | 0,867 | 0,908 | 0,835 | 0,902 | 0,207 | 0,850 | 0,865 | 0,261 |
| TF-IDF char 3-5-gramas + LR | una línea | 0,673 | 0,779 | 0,856 | 0,555 | 0,108 | 0,998 | 1,000 | 0,000 |
| Tokens de línea + LR (ablación sin contexto) | una línea | 0,453 | 0,708 | 0,882 | 0,305 | 0,047 | 0,970 | 0,991 | 0,000 |
| Gradient-boosted trees, mismas features | contexto streaming | 0,821 | 0,963 | 0,972 | 0,710 | 0,024 | 1,000 | 1,000 | 0,001 |
| **Ours: LR con contexto** | contexto streaming | **0,926** | **0,991** | **0,930** | **0,923** | **0,081** | **1,000** | **1,000** | **0,001** |

A nivel de sesión, el modelo detecta el 100 % de las sesiones de ataque en ambos conjuntos, con falsas alarmas en el 5,5 % de sesiones benignas de test y el 25 % de sesiones benignas del conjunto de desafío (todas del escenario web de "health checks + typos"). Por escenario en el conjunto de desafío: clave AWS robada con user agent normal `aws-cli/2` 100 % de precisión por línea; credential stuffing con user agents de navegador 99,9 %; DNS tunneling hexadecimal 99,7 %; password spray SSH lento con usuarios no vistos 90,8 %; escaneo web + SQLi + shell JSP/ASPX con user agent de navegador 64,1 %; escenario benigno con `curl`, contraseñas mal escritas y 404 de crawler SEO 72,8 %.

## Requisitos de hardware
- VRAM: no aplica; el modelo es una regresión logística de ~6 KB y no requiere GPU.
- GPU recomendadas: ninguna; ejecuta en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU, incluido el navegador.
- Opciones de despliegue: scikit-learn con carga de pesos vía skops, servicio HTTP mínimo en Python, ejecución en el navegador mediante el Space oficial.
- Latencia y throughput: no disponibles como cifras publicadas; la model card solo indica que los pesos "run in the browser".

## Comparativa con modelos similares
| Modelo | Tipo | Contexto | Challenge F1 | Test F1 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| log-anomaly-context-lr | LR lineal con contexto streaming | por entidad | 0,926 | 1,000 | apache-2.0 | Hugging Face |
| Gradient-boosted trees (mismas features) | Árboles con contexto streaming | por entidad | 0,821 | 1,000 | no disponible | baseline del autor |
| TF-IDF char 3-5-gramas + LR | LR lineal, una línea | ninguna | 0,673 | 0,998 | no disponible | baseline del autor |
| Isolation Forest benigno | No supervisado | contexto streaming | 0,867 | 0,850 | no disponible | baseline del autor |

La comparativa se limita a los baselines reportados por el propio autor; no se dispone de información sobre modelos externos equivalentes de detección de anomalías en logs.

## Limitaciones y advertencias
- El conjunto de test está saturado (F1 1,000): las líneas provienen de las mismas plantillas que el entrenamiento, por lo que esa cifra es una comprobación de sanidad y no una medida real de generalización.
- Debilidad clara en escaneo web y SQLi con user agent de navegador: solo se detecta el 34 % de sondas y el 58 % de peticiones SQLi, con 64,1 % de precisión por línea.
- El password spray SSH lento pierde los primeros intentos y comandos de descubrimiento (`id`, `lscpu`) cuando los usuarios no aparecen en entrenamiento (90,8 %).
- Tasa de falsos positivos del 8,1 % por línea en el conjunto de desafío y del 25 % a nivel de sesión benigna en ese mismo conjunto, concentrada en escenarios web de health checks y erratas.
- Los resultados están declarados por el autor y marcados como `verified: false`; no han sido replicados de forma independiente.
- Riesgo de alucinación no aplicable (no genera texto), pero sí riesgo de clasificación errónea en variantes de ataque no representadas.
- Solo etiquetado para inglés; el comportamiento con logs en otros idiomas o formatos no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan condiciones adicionales sobre el dataset de entrenamiento ni garantías del autor.
- El modelo no sustituye a un analista: su valor está en el triaje y la priorización, no en la decisión final de incidente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DaveyD347/log-anomaly-context-lr
- Space de demostración: https://huggingface.co/spaces/DaveyD347/log-anomaly-detector
- Dataset: https://huggingface.co/datasets/DaveyD347/sanitized-incident-logs
