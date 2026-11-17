# rleo/LogSentinel-Qwen3-0.6B-GGUF

## Resumen

LogSentinel-Qwen3-0.6B es un ajuste fino completo (full fine-tune) del modelo Qwen/Qwen3-0.6B, desarrollado por el usuario rleo. Su proposito es actuar como analista de logs de Linux: recibe lineas crudas de ficheros como nginx, apache, auth.log, ufw, dmesg, syslog o fail2ban y devuelve hallazgos de seguridad estructurados en JSON, ademas de responder preguntas de extraccion en ingles o frances. El modelo resuelve un problema concreto: transformar texto de log no estructurado en informes de seguridad con categorias, severidad, IPs, usuarios, conteos y evidencia textual, sin necesidad de reglas manuales.

Con 596 millones de parametros, es un modelo pequeno disenado para ejecutarse en CPU o en GPUs de gama baja. La cuantizacion Q4_K_M ocupa aproximadamente 400 MB, lo que permite desplegarlo en entornos edge o en servidores modestos. La ventana de contexto practica recomendada es de unos 8.000 tokens de logs por peticion (alrededor de 40-80 lineas), con soporte de hasta 16.384 tokens en llama-server.

La relevancia actual radica en que ofrece deteccion de 41 categorias de incidentes (inyeccion SQL, XSS, fuerza bruta SSH, cuentas comprometidas, escalada de privilegios, errores de hardware, etc.) con metricas de validacion JSON del 100% y F1 de deteccion del 99,7% en Q8_0, segun la evaluacion del propio autor. Todo ello bajo licencia Apache 2.0 y en formato GGUF compatible con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens en llama-server; uso recomendado por debajo de 8.000 tokens de logs por peticion |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (GGUF) |
| Idiomas soportados | ingles, frances |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de 596 millones de parametros, y se ha sometido a un ajuste fino completo (no LoRA ni adaptadores). El entrenamiento se orienta a dos tareas: analisis de seguridad de logs con salida JSON estructurada y respuesta a preguntas de extraccion. El autor indica que el modelo fue entrenado con el modo "thinking" desactivado, y que la plantilla de chat embebida ya viene por defecto en modo no-thinking; sin embargo, es necesario desactivar tambien el parser de razonamiento de llama-server (`--reasoning off`) para evitar que la respuesta se redirija al campo `reasoning_content`.

Los datos de entrenamiento no estan detallados en la informacion disponible (no se especifica numero de tokens, composicion exacta del dataset ni si hubo RLHF o DPO). La evaluacion se realizo sobre un conjunto de test held-out de 466 muestras de analisis y 334 de Q&A, generado con una semilla distinta a la del entrenamiento. El modelo cubre tipos de log muy concretos: nginx/apache access y error logs (formatos combined, vhost, custom `rt=` y JSON), auth.log (sshd, sudo, su, useradd, PAM), UFW y firewall del kernel, dmesg (uptime, `-T` y formatos journal), syslog/journalctl (systemd, cron, smartd, logs de aplicacion) y fail2ban.

Como innovacion practica, el modelo impone un esquema de salida JSON rigido con campos `log_sources`, `time_range`, `risk_level`, `findings` (con `category`, `severity`, `status`, `source`, `ips`, `users`, `count`, `first_seen`, `last_seen`, `evidence`, `description`), `summary` y `recommendations`. El campo `evidence` debe ser una linea copiada literalmente del input, lo que facilita la trazabilidad y reduce la alucinacion.

## Capacidades

- Analisis de seguridad de logs de Linux con salida JSON estructurada y validada.
- Deteccion de 41 categorias de incidentes: inyeccion SQL, XSS, path traversal/LFI/RFI, inyeccion de comandos, Log4Shell, Shellshock, escaneos de vulnerabilidades (sqlmap, nikto, nuclei), sondeo de ficheros sensibles y CMS, fuerza bruta web, web shells, floods HTTP, rafagas 5xx, escaneo SSH, fuerza bruta SSH (fuente unica, distribuida, enumeracion de usuarios), cuentas comprometidas, logins de root, logins inusuales, escalada de privilegios, sudo fallido, comandos sudo maliciosos, creacion de cuentas, escaneos de puertos, conexiones bloqueadas repetidas, firewall desactivado, OOM kills, segfaults, errores de disco/SMART, errores de hardware (MCE/EDAC/thermal/AER), kernel oops, SYN flood, conntrack lleno, modulos del kernel sin firmar, denegaciones de AppArmor, almacenamiento USB, fallos de servicio, tareas cron maliciosas y baneos de fail2ban.
- Respuesta a preguntas de extraccion en ingles o frances (por ejemplo, "que IPs fallaron en SSH" o "exporta los errores 5xx como JSON").
- Generacion de descripciones, resumenes y recomendaciones en el idioma de la peticion (si la pregunta es en frances, la salida va en frances).
- Asignacion de severidad (info/low/medium/high/critical) y estado (blocked/attempted/possibly_successful/successful/observed).
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes multi-paso ni capacidades de vision o audio.
- Capacidades multilingues limitadas a ingles y frances.

## Casos de uso

- Analisis automatizado de auth.log en servidores: el modelo recibe las ultimas 40-80 lineas de `/var/log/auth.log` y devuelve JSON con intentos de fuerza bruta SSH, cuentas comprometidas (login exitoso tras fallos) y logins de root, con IPs, usuarios y evidencia textual. Es adecuado por su deteccion de `compromised_account` con F1 de 1.00 en Q8_0.
- Monitorizacion de logs web de nginx/apache: procesa access y error logs en formatos combined, vhost, `rt=` y JSON para detectar inyeccion SQL, XSS, path traversal, web shells y rafagas 5xx, integrable en un pipeline que envie alertas cuando `risk_level` sea `high` o `critical`.
- Enriquecimiento de alertas SIEM: el JSON de salida encaja directamente en un SIEM o en un sistema de ticketing, ya que incluye categoria, severidad, IPs, usuarios, conteo de eventos y recomendaciones, reduciendo el trabajo manual de triaje.
- Analisis de logs de firewall (UFW y kernel): detecta escaneos de puertos, conexiones bloqueadas repetidas, firewall desactivado y SYN flood, util para auditorias de seguridad periodicas en servidores expuestos.
- Diagnostico operativo con dmesg y syslog: identifica OOM kills, segfaults, errores SMART/disco, errores de hardware (MCE/EDAC/thermal/AER), kernel oops y fallos de servicio, lo que permite separar incidentes de seguridad de problemas de infraestructura.
- Revision de logs de fail2ban y cron: detecta baneos y tareas cron maliciosas, adecuado para entornos donde se quiere auditar persistencia de atacantes sin desplegar reglas manuales.
- Despliegue en edge o entornos con recursos limitados: con Q4_K_M (~400 MB) puede ejecutarse en CPU o en una GPU pequena, lo que permite analisis local de logs sin enviar datos sensibles a la nube.

## Benchmarks y rendimiento

Evaluacion sobre conjunto held-out de 466 muestras de analisis y 334 de Q&A, medida sobre los ficheros GGUF a traves de llama.cpp. La linea base es Qwen3-0.6B sin entrenar con el esquema de salida completo y la lista de categorias en el system prompt.

| Metrica | Base Qwen3-0.6B + schema prompt | LogSentinel Q8_0 | LogSentinel Q4_K_M |
|---|---|---|---|
| Finding F1 (deteccion de categoria) | 2,8% | 99,7% | 99,5% |
| Precisión de findings | 2,7% | 99,8% | 100,0% |
| Recall de findings | 2,9% | 99,5% | 99,0% |
| JSON valido | 94,2% | 100,0% | 100,0% |
| Nivel de riesgo global correcto | 22,1% | 99,4% | 99,1% |
| "Sin problema" vs "problema" correcto | 79,8% | 100,0% | 99,6% |
| Severidad correcta (findings emparejados) | 25,0% | 99,5% | 99,7% |
| Estado correcto | 25,0% | 99,5% | 99,7% |
| IPs exactamente correctas | 62,5% | 99,8% | 99,7% |
| Usuarios exactamente correctos | 0,0% | 99,8% | 100,0% |
| Conteo de eventos exacto | 0,0% | 93,1% | 95,7% |
| first_seen exacto | 12,5% | 99,7% | 99,3% |
| Linea de evidencia copiada literalmente | 70,6% | 99,8% | 99,3% |
| Sin IP alucinada en la salida | 99,5% | 100,0% | 100,0% |
| Q&A de extraccion, exact match | 0,0% | 90,4% | 92,0% |
| Q&A de extraccion, token F1 | 2,1% | 96,6% | 97,2% |

F1 por categoria (Q8_0), muestra parcial: account_created 1,00; apparmor_denied 1,00; cms_admin_probe 1,00; command_injection 1,00; compromised_account 1,00; conntrack_full 1,00; disk_error 1,00; distributed_ssh_brute_force 1,00; segfault 1,00; sensitive_file_probe 1,00; server_errors 0,98; service_failure 1,00; shellshock 1,00; sql_injection 1,00; ssh_brute_force 0,97.

No se han publicado otros benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M ~400 MB, Q8_0 ~640 MB, BF16 ~1,2 GB (tamanos de fichero indicados por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo esta pensado para CPU o GPU pequena, por lo que no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja --reasoning off -c 16384`), y por extension cualquier runtime compatible con GGUF como Ollama o llama-cpp-python. No se confirma soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Recomendacion de uso: temperatura 0 y peticiones por debajo de unos 8.000 tokens de logs (40-80 lineas); para ficheros mayores, enviar por fragmentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| LogSentinel-Qwen3-0.6B | 596 M | 16.384 tokens (uso recomendado <8k) | Analisis de logs de seguridad con JSON | Apache 2.0 | GGUF |
| Qwen3-0.6B (base) | 596 M | no disponible | Modelo generalista | Apache 2.0 | safetensors, GGUF |
| Modelos de analisis de logs basados en reglas (p. ej. fail2ban, reglas SIEM) | no aplica | no aplica | Deteccion determinista por patrones | variable | no aplica |

La comparacion con alternativas de la misma categoria es limitada: no se dispone en la informacion proporcionada de otros modelos especializados en analisis de logs con los que contrastar parametros, contexto y rendimiento. Frente al Qwen3-0.6B base, LogSentinel mejora drasticamente las metricas de deteccion (F1 del 2,8% al 99,7%) y la validez del JSON (94,2% al 100%), segun la evaluacion del autor.

## Limitaciones y advertencias

- Entrenado con thinking desactivado: si el runtime activa el parser de razonamiento, la respuesta puede aparecer en `reasoning_content` en lugar del contenido esperado.
- Ventana practica limitada: se recomienda no superar unos 8.000 tokens de logs por peticion; para ficheros grandes hay que fragmentar, lo que puede perder correlaciones entre eventos alejados en el tiempo.
- Idiomas: solo ingles y frances; no hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinacion: aunque la metrica de "sin IP alucinada" es del 100% en la evaluacion, el conteo exacto de eventos baja al 93,1% (Q8_0) y el exact match en Q&A al 90,4%, por lo que conviene validar los conteos en produccion.
- Dependencia del esquema: la salida sigue un formato JSON fijo; cambios en el esquema o en la lista de categorias pueden degradar el rendimiento.
- Cobertura de logs acotada a los tipos entrenados (nginx, apache, auth.log, ufw, dmesg, syslog, fail2ban); logs de otras fuentes no estan garantizados.
- Sin soporte declarado de tool calling, agentes multi-paso, vision ni audio.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-0.6B.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/rleo/LogSentinel-Qwen3-0.6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- llama.cpp (runtime recomendado): no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
