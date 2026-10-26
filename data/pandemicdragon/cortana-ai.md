# PandemicDragon/CORTANA-AI

## Resumen

PandemicDragon/CORTANA-AI no es un modelo de lenguaje con pesos publicados, sino un repositorio de tipo aplicación (Space de Docker, `sdk: docker`, `app_port: 5050`) que implementa un asistente personal autónomo denominado "Cortana Tactical Construct" o "Cortana & J.A.R.V.I.S. Cognitive Telemetry Construct". El constructo orquesta modelos alojados en la nube de Groq —`llama-3.3-70b-versatile` para razonamiento y tool calling, `whisper-large-v3-turbo` para transcripción de voz y `llama-3.2-11b-vision` para OCR de recibos— y persiste estado en una base de datos Supabase PostgreSQL, con una interfaz web desplegada en Vercel.

El problema que aborda es la integración de un flujo operativo personal (recordatorios, contabilidad doméstica vía M-Pesa, captura de ideas por voz, vigilancia de vulnerabilidades CISA KEV) en un único bot de Telegram que funciona 24/7 sin VPS ni dominio propio, usando long polling en lugar de webhooks. No aporta innovación en arquitectura de modelos: no hay entrenamiento, ni pesos, ni tokenizador, ni configuración de inferencia propia.

Su relevancia es, por tanto, la de un ejemplo de patrón de orquestación (ReAct con tool calling sobre API externa, memoria episódica en Postgres y HUD web con síntesis de voz del navegador) más que la de un artefacto evaluable con benchmarks. La model card está truncada y no declara licencia, idiomas, pipeline ni métricas de calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica como modelo: capa de orquestación en Python (bot de Telegram con patrón ReAct) que invoca modelos alojados en Groq vía API. El repositorio se declara como Space de Docker (`app_port: 5050`) |
| Parametros totales | No disponible (no se distribuyen pesos). Los motores invocados son `llama-3.3-70b-versatile` (70B), `llama-3.2-11b-vision` (11B) y `whisper-large-v3-turbo` (ASR) |
| Parametros activos | No disponible / no aplica (no se declara ningún modelo MoE propio) |
| Longitud de contexto | No disponible en el repositorio; queda determinada por los límites de Groq para cada modelo invocado, no documentados en la información proporcionada |
| Tipos de cuantizacion | No disponible (inferencia gestionada por Groq; no se publican pesos ni esquemas de cuantización) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | No disponible; no hay pesos. El contenido es código: `bot.py`, `halo_agent.py`, `wifi_manager.py`, `speak.py`, `laptop_agent.py`, `index.html`, `style.css`, `app.js`, `schema.sql`, `vercel.json`, `requirements.txt` |
| Pipeline declarado | No disponible |
| Tipo de repositorio | Aplicación / Space de Docker, no modelo |
| Metricas de adopción | 0 descargas, 0 likes; creado el 2026-10-25, actualizado el 2026-10-25 |

## Arquitectura y entrenamiento

No existe entrenamiento ni ajuste fino documentado. La arquitectura descrita es un grafo de componentes: entradas del operador (notas de voz, fotos de recibos y directivas en lenguaje natural por Telegram), telemetría sin clave (Open-Meteo, catálogo CISA KEV, feeds RSS de noticias y amenazas), un cerebro de tool calling en bucle ReAct contra Groq, memoria persistente en Supabase PostgreSQL y una capa de presentación (HUD web glassmórfico en Vercel que vocaliza los informes con `window.speechSynthesis`).

La memoria se estructura en tablas explícitas: `bot_memory` (órdenes permanentes y stack tecnológico del operador), `tactical_briefings`, `personal_tasks`, `personal_ledger` (M-Pesa y recibos), `idea_vault`, `weather_reports`, `news_articles` y `cyber_alerts`, con políticas RLS de lectura pública mediante clave `anon`. El repositorio incluye además un daemon local (`halo_agent.py`, con Gemini y Groq) que escucha en el puerto 5050 y en una `command_queue` de Supabase para refactorización de código con escritura confinada a rutas, diffs unificados coloreados y rollback vía `git stash` más comprobación de sintaxis, y un escáner de red (`wifi_manager.py`) que hace fingerprinting de 20-35 servicios (Google Cast, Roku, ADB, HTTP, SSH) mediante sockets asíncronos.

Como innovaciones técnicas destacables solo cabe citar decisiones de ingeniería de integración: uso de long polling para evitar infraestructura de webhooks, dependencia de APIs sin clave para telemetría y sustitución de TTS dedicado por la Web Speech API del navegador. No hay decodificación especulativa, atención lineal ni técnicas de entrenamiento propias.

## Capacidades

- Generación de texto y razonamiento delegados en `llama-3.3-70b-versatile`, con persona "táctica" declarada (síntesis de amenazas estilo Cortana, precisión operativa estilo J.A.R.V.I.S., sin emojis).
- Tool calling y ejecución multi-paso en bucle ReAct: el bot decide y ejecuta herramientas (consultas a base de datos, feeds, meteorología, tareas).
- Transcripción de voz a texto con `whisper-large-v3-turbo` a partir de notas de voz de Telegram; el autor afirma 228x velocidad en tiempo real (dato no verificado).
- Visión / OCR con `llama-3.2-11b-vision` para extraer importe, comercio y fechas de fotos de recibos, facturas y tickets.
- Memoria episódica persistente: órdenes permanentes, stack tecnológico y contexto del operador almacenados en PostgreSQL.
- Gestión de tareas y recordatorios con un bucle `check_due_tasks` que envía avisos al móvil.
- Libro de cuentas personal: indexación automática de extractos M-Pesa, recibos de comercio e ingresos.
- Captura de ideas por voz (fragmentos de código, letras, arquitecturas de proyecto) en `idea_vault`.
- HUD web con vocalización de informes tácticos e interactividad (selector de seis presets tipográficos: Quantum, Stark, Cortana, Minimalist, Night City, Retro).
- Escaneo de red Wi-Fi asíncrono con fingerprinting de banners en 20-35 servicios por dispositivo, en móvil y escritorio.
- Puente CLI local para refactorización de código con diffs y rollback seguro.
- Capacidades multilingües: no declaradas en la información disponible.

## Casos de uso

- Asistente operativo personal en Telegram: el bot recibe directivas en lenguaje natural y notas de voz, mantiene contexto entre sesiones gracias a `bot_memory` y responde con informes breves; adecuado para un único operador que centraliza recordatorios y consultas en el móvil.
- Digitalización de gastos: el operador fotografía un recibo o ticket, `llama-3.2-11b-vision` extrae importe, comercio y fecha, y el dato se inserta en `personal_ledger` para su conciliación posterior con extractos M-Pesa.
- Vigilancia de vulnerabilidades aplicada al stack propio: el bot descarga el catálogo CISA KEV, lo cruza con el stack registrado en `bot_memory` y genera avisos cuando aparece una explotación conocida que afecte a las tecnologías del operador.
- Gestión de plazos: registro de tareas con fecha y bucle periódico `check_due_tasks` que empuja notificaciones al teléfono, útil para vencimientos administrativos o entregas de proyecto.
- Captura rápida de ideas en movilidad: una nota de voz se transcribe con Whisper y se archiva en `idea_vault` con marca temporal, evitando perder fragmentos de código o decisiones de arquitectura.
- Auditoría de red doméstica: `wifi_manager.py` enumera dispositivos asociados y fingerprinta servicios expuestos (Cast, Roku, ADB, HTTP, SSH) para detectar superficies de ataque innecesarias en la red local.
- Refactorización asistida en local: `halo_agent.py` recibe comandos por el puerto 5050 o por la `command_queue`, aplica cambios confinados a rutas permitidas, muestra diffs unificados y revierte con `git stash` si la comprobación de sintaxis falla; encaja en un flujo de trabajo individual sin exponer el repositorio a la nube.
- Panel de situación con lectura en voz alta: el HUD de Vercel lee los `tactical_briefings` con la Web Speech API, lo que permite consumir el informe sin mirar la pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y al no distribuirse pesos no es posible evaluar el artefacto de forma directa. El único dato de rendimiento declarado es una afirmación del autor sobre la transcripción de Whisper a "228x velocidad en tiempo real", sin metodología ni condiciones de medida.

## Requisitos de hardware

- El constructo en sí no requiere GPU: `bot.py` es un daemon de Python que solo necesita conectividad saliente a Telegram, Groq y Supabase. Puede ejecutarse en una instancia de 512 MB a 1 GB de RAM, en un contenedor Docker (el Space declara `app_port: 5050`) o en un equipo de sobremesa.
- La inferencia real ocurre en la infraestructura de Groq; no hay requisito de VRAM local para el LLM, el ASR ni el modelo de visión.
- Autoalojamiento equivalente (estimación orientativa, no publicada por el autor): `llama-3.3-70b` en BF16 requiere del orden de 140 GB de VRAM (2x H100 80 GB o 2x A100 80 GB); en int4 roundo a 35-40 GB, viable en una A100 80 GB o H100. `llama-3.2-11b-vision` en BF16 ronda los 22 GB (A100 40 GB); en int4, 7-8 GB, cabe en una RTX 4090 de 24 GB. `whisper-large-v3-turbo` (unos 809 M de parámetros) ocupa aproximadamente 1,6 GB en FP16 y cabe en cualquier GPU consumer con 8 GB o más.
- Despliegue recomendado por el autor: Docker para el bot, Vercel para el frontend estático, Supabase para PostgreSQL y Telegram en modo long polling (sin VPS ni dominio).
- Alternativas de servicio si se autoalojan los motores: vLLM o TGI para el LLM, faster-whisper o WhisperX para ASR, y llama.cpp/Ollama para variantes cuantizadas en hardware consumer.
- Latencia y throughput: no disponibles. Dependen íntegramente de la latencia de las APIs de Groq y del plan contratado; no se documentan cifras.

## Comparativa con modelos similares

No se dispone de datos verificables para comparar con modelos, porque el repositorio no contiene un modelo. La comparación pertinente es entre enfoques de despliegue:

| Enfoque | Pesos propios | Contexto | Calidad medida | Licencia | Coste / dependencia |
|---|---|---|---|---|---|
| CORTANA-AI (este repositorio) | No | No disponible (limitado por Groq) | No publicada | No disponible | Free tier de Groq, Supabase y Vercel; dependencia de tres servicios externos |
| Uso directo de la API de Groq sin capa de orquestación | No | El del modelo invocado | La del modelo invocado | La del proveedor | Menor complejidad, sin memoria persistente ni herramientas |
| Stack autoalojado con `llama-3.3-70b` en vLLM + Whisper local | Sí | El del modelo invocado | La del modelo invocado | Licencia comunitaria de Llama | Requiere 2 GPU de 80 GB o cuantización agresiva; sin dependencia de terceros |
| Asistentes open source genéricos con RAG y plugins | No (orquestan APIs) | Configurable | No disponible | Variable | Mayor comunidad y mantenimiento; menor especificidad operativa |

Comparación entre los motores invocados, con los datos disponibles:

| Motor | Parámetros | Contexto | Licencia | Formato de pesos |
|---|---|---|---|---|
| `llama-3.3-70b-versatile` | 70B (según la model card del repositorio) | No disponible | No disponible en la información proporcionada | No disponible (API) |
| `llama-3.2-11b-vision` | 11B (según la model card del repositorio) | No disponible | No disponible en la información proporcionada | No disponible (API) |
| `whisper-large-v3-turbo` | No disponible | No disponible | No disponible en la información proporcionada | No disponible (API) |

## Limitaciones y advertencias

- No es un modelo: no hay pesos, tokenizador, configuración de generación ni artefacto evaluable. Cualquier expectativa de uso como modelo base es infundada.
- Ausencia total de licencia declarada: no se concede ningún derecho explícito de uso, modificación ni distribución; el uso comercial es jurídicamente indeterminado.
- Dependencia crítica de tres servicios externos (Groq, Supabase, Vercel) y de Telegram. Una caída o un cambio de política de precios o de términos de uso inutiliza el constructo.
- Riesgo de seguridad en la gestión de secretos: la arquitectura emplea la clave `service_role` de Supabase en el bot de Python y la clave `anon` con RLS de lectura pública en el frontend. Una configuración incorrecta de las políticas RLS expone memoria personal, libro de cuentas y tareas.
- Alucinación: al delegar el razonamiento en un LLM de terceros sin verificación factual, los informes tácticos y la extracción OCR de importes pueden contener errores; no se documenta ningún mecanismo de validación o reconciliación.
- El escáner de red (`wifi_manager.py`) y el fingerprinting de banners pueden vulnerar términos de servicio o normativa sobre acceso a sistemas ajenos si se ejecutan fuera de redes propias.
- El agente local escribe archivos en disco y ejecuta comandos git; el confinamiento a rutas y el rollback por `git stash` mitigan pero no eliminan el riesgo de pérdida de cambios.
- Sin listado de idiomas: se desconoce el soporte real multilingüe, y la persona y las respuestas están orientadas a un único operador.
- Sin benchmarks, tests de calidad ni métricas de adopción (0 descargas, 0 likes). La model card está truncada (el apartado de configuración de Telegram se corta) y la fecha de creación registrada, 2026-10-25, resulta anómala.
- La búsqueda web realizada no devolvió resultados relacionados con el proyecto; únicamente aparecieron páginas sobre Google Translate, sin relación alguna.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PandemicDragon/CORTANA-AI
- Groq Console (proveedor de inferencia citado): https://console.groq.com
- Supabase (base de datos y RLS citados): https://supabase.com
- Telegram BotFather (mencionado en la model card, entrada truncada): https://t.me/BotFather
- Artículos, papers, blogs o demos adicionales: no disponibles en la información proporcionada ni en los resultados de la búsqueda web.
