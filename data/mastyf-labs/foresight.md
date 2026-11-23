# Mastyf-Labs/foresight

## Resumen

Mastyf Foresight es un modelo de clasificación de texto desarrollado por Mastyf Labs (con apoyo del fondo semilla del IIT Kharagpur) que predice los efectos de una llamada a herramienta propuesta por un agente de IA antes de que se ejecute. A diferencia de los guardrails convencionales, que clasifican texto como "ataque sí/no", Foresight modela la relación entre una acción y su efecto sobre el sistema: lee la sesión completa del agente y estima qué consecuencias tendrá la siguiente acción, con 39 efectos nombrados (lectura de secretos, exfiltración de datos, instalación de persistencia, borrado masivo, acceso a metadatos de nube, etc.).

El modelo es un transformer causal de nivel de byte con 39 millones de parámetros y una ventana de contexto de 2.048 tokens, que incluye un canal de observación para las salidas de herramientas anteriores. Está entrenado sobre las consecuencias observadas de más de 85.000 acciones ejecutadas en un sandbox instrumentado con honeytokens, trazado de llamadas al sistema y una trampa de red que descifra HTTPS y actúa como servidor SSH/SFTP. La inferencia tarda unos 50 ms en CPU, lo que lo hace viable como capa de decisión en línea.

Su relevancia actual radica en el auge de agentes autónomos con acceso a shell, ficheros, SQL y red: Foresight se integra como asesor dentro de Mastyf Shield, donde solo puede endurecer la decisión (advertir o escalar), nunca relajarla. Los pesos no se distribuyen y el acceso es únicamente a través de la plataforma comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal a nivel de byte (byte-level), con canal de observación para salidas de herramientas |
| Parametros totales | 39 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens de sesión |
| Tipos de cuantizacion | No disponible (los pesos no se distribuyen) |
| Idiomas soportados | Inglés (en) |
| Licencia | mastyf-proprietary (license: other) |
| Formato de pesos | No disponible (no se publican pesos) |

## Arquitectura y entrenamiento

Foresight es un transformer causal de nivel de byte de 39M de parámetros, diseñado para procesar la secuencia completa de una sesión de agente: la llamada a herramienta propuesta, las llamadas anteriores de la sesión, opcionalmente la tarea del usuario y resúmenes (digests) de las salidas de herramientas previas. El canal de observación incorpora esas salidas —incluidas instrucciones plantadas por un atacante— pero nunca la salida de la propia acción evaluada. La salida son 39 probabilidades de efecto, una puntuación de daño, cotas superiores al 95% (q95) del daño estimado (bytes exfiltrados, filas de base de datos expuestas, ficheros borrados) y una puntuación de desviación de tarea (off-task).

El entrenamiento se basa en las consecuencias realmente observadas de más de 85.000 acciones ejecutadas en contenedores aislados sembrados con credenciales falsas (honeytokens), con trazado de llamadas al sistema y una trampa de red que descifra HTTPS y emula SSH/SFTP. Si una clave plantada aparecía en la red por cualquier canal, la acción se etiquetaba como fuga real. Los datos públicos empleados incluyen DTap-Bench (Apache-2.0), trayectorias de SWE-smith (MIT), mini-swe-agent (MIT), DeepSWE (MIT) y NVIDIA SWE-Zero OpenHands (CC-BY-4.0). No se detalla en la información disponible si hubo RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Predicción de efectos de acciones: clasifica la siguiente llamada a herramienta en 39 efectos nombrados (lectura de secretos, envío de datos al exterior, instalación de persistencia, borrado masivo, acceso a metadatos de nube, etc.).
- Estimación de daño: cotas superiores al 95% sobre bytes exfiltrados, filas de base de datos expuestas y ficheros eliminados.
- Análisis de sesión completa: agrega señales a lo largo de varios pasos, de modo que un ataque fragmentado en acciones individualmente inocuas se detecta al sumarse.
- Lectura de salidas de herramientas: incorpora digests de lo que devolvieron herramientas anteriores, incluida la detección de instrucciones inyectadas.
- Puntuación de desviación de tarea (off-task): mide si la acción se aleja del objetivo declarado por el usuario.
- Cobertura de herramientas: shell, lectura/escritura/edición de ficheros, búsqueda, URLs, SQL y ejecución de código.
- Clasificación de texto con salida estructurada (probabilidades por efecto y puntuaciones agregadas).
- No soporta tool calling ni razonamiento multi-paso generativo: es un clasificador, no un modelo generativo.

## Casos de uso

- Guardrail en línea para agentes de código: antes de ejecutar un comando de shell, Foresight evalúa si la acción lee credenciales o exfiltra datos y, en caso afirmativo, pausa la ejecución y solicita confirmación humana. Su latencia de ~50 ms en CPU permite insertarlo en cada paso sin degradar la experiencia.
- Protección contra inyección de prompt vía salidas de herramientas: al procesar los digests de lo que devolvieron herramientas anteriores, detecta instrucciones plantadas (por ejemplo, en el resultado de un `curl` o un fichero leído) y marca la siguiente acción como sospechosa.
- Detección de exfiltración encubierta: la trampa de red y los honeytokens del entrenamiento permiten reconocer patrones de fuga por HTTPS, SSH y SFTP, con una tasa de captura declarada del 98–100% en fugas retenidas.
- Auditoría y revisión de sesiones de agentes: la puntuación de daño y las cotas q95 sirven para priorizar revisiones humanas sobre las sesiones con mayor riesgo potencial, en lugar de revisar todas.
- Despliegue en pipelines CI/CD con agentes autónomos: integrado vía Mastyf Shield, actúa como asesor que solo puede endurecer la decisión, de modo que un fallo o lentitud del modelo no bloquea el pipeline (probado con inyección de fallos: 2.000 decisiones, 0 violaciones).
- Monitorización de agentes de bases de datos: cubre herramientas SQL y estima filas expuestas, útil para detectar consultas que, aunque sintácticamente válidas, acceden a tablas sensibles o realizan volcados masivos.
- Evaluación de riesgos en entornos de desarrollo de agentes: permite comparar el comportamiento de distintos frameworks (Claude Agent SDK, OpenAI Agents SDK, Google ADK) frente a un conjunto de ataques, calibrando umbrales por despliegue.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor, medidos sobre despliegues simulados no vistos en entrenamiento (trazas públicas de agentes de distintos frameworks, calibradas sobre la primera mitad de cada despliegue y evaluadas sobre la segunda):

| Framework de agente | Ataques retenidos detectados | Sesiones normales con falsa alarma |
|---|---|---|
| Claude Agent SDK | 98,4% | 1,4% |
| OpenAI Agents SDK | 89,8% | 0,6% |
| Google ADK (no visto en entrenamiento) | 85,5% | 0,4% |
| mini-swe-agent (no visto) | No disponible | 4,7% (sesiones nuevas, calibrado sobre tráfico nuevo: 1,0%) |
| OpenHands (no visto) | No disponible | 3,7% (sesiones nuevas, calibrado sobre tráfico nuevo: 0,0%) |

Datos adicionales declarados: del conjunto de ataques que el sandbox confirmó como dañinos, se detecta el 96–100%; de las fugas de secretos retenidas por HTTPS, SSH y SFTP, el 98–100%, con un 0–1,4% de acciones de red normales morfológicamente similares marcadas como falsas alarmas. Los ataques provienen de categorías retenidas del benchmark público DTap; el tráfico benigno, de trayectorias públicas de SWE-agent, mini-swe-agent y OpenHands. No se han publicado resultados en benchmarks estándar de clasificación (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión (pesos no distribuidos); con 39M de parámetros, la inferencia en FP32 ocuparía en torno a 160 MB y en FP16 unos 80 MB, cantidades que caben holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; el autor declara ~50 ms por decisión en CPU de portátil.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU.
- Opciones de despliegue: únicamente a través de Mastyf Shield; no hay pesos públicos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: ~50 ms por decisión en CPU según el autor; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mastyf Foresight | Clasificador de efectos de acciones | 39M | 2.048 tokens | Predice consecuencias de tool calls | Propietaria | Solo vía Mastyf Shield |
| Guardrails de texto típicos (p. ej. clasificadores de prompt injection) | Clasificador de texto | No disponible | Típicamente un solo mensaje | "¿Parece un ataque?" | Variable | Variable |
| LLM-as-judge (p. ej. GPT-4o, Claude como evaluador) | Modelo generativo | Cientos de miles de millones | Muy largo | Juicio textual del riesgo | Propietaria | APIs comerciales |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; el autor solo ofrece una comparación cualitativa frente a guardrails de texto genéricos (latencia ~1 s frente a ~50 ms, análisis de sesión completa frente a un solo mensaje, y estimación de daño frente a etiqueta binaria).

## Limitaciones y advertencias

- Tráfico simulado, no de producción: los despliegues se construyen con trazas públicas de agentes; no se ha validado con datos reales de clientes.
- Cobertura desigual por dominio: funciona mejor con agentes de código, shell y sistema de ficheros; en dominios de negocio nunca vistos (por ejemplo, RR. HH. o sanidad) ordena los ataques por encima del azar pero muy por debajo de su precisión en dominio.
- Daño solo en la respuesta final fuera de alcance: si todas las tool calls son legítimas y el daño está en lo que el agente escribe (por ejemplo, un plan de tratamiento erróneo), un modelo de acciones no puede verlo; requiere una comprobación separada de la respuesta.
- Conjuntos de ataque públicos y fijos: no se ha probado frente a atacantes que se adapten al modelo.
- Umbrales dependientes del despliegue: sin calibrar, las sesiones largas generan más falsas alarmas.
- Licencia propietaria (mastyf-proprietary): no permite uso comercial autónomo, modificación ni redistribución; el acceso es solo a través de Mastyf Shield.
- Pesos no distribuidos: imposible auditar el modelo, ejecutarlo localmente o integrarlo en infraestructura propia.
- Solo inglés: el modelo está entrenado y etiquetado únicamente para inglés.
- Riesgo de falsos negativos en ataques novedosos: al no haberse evaluado contra adversarios adaptativos, la tasa de detección podría degradarse en escenarios reales de ataque dirigido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mastyf-Labs/foresight
- Mastyf Shield (plataforma): https://www.mastyf.ai/
- DTap-Bench (dataset de ataques, Apache-2.0): no disponible en la información proporcionada
- SWE-smith (trayectorias, MIT): no disponible en la información proporcionada
- mini-swe-agent (trayectorias, MIT): no disponible en la información proporcionada
- DeepSWE (trayectorias, MIT): no disponible en la información proporcionada
- NVIDIA SWE-Zero OpenHands (trayectorias, CC-BY-4.0): no disponible en la información proporcionada
- Demo en vivo: anunciada como "coming soon", sin URL publicada
