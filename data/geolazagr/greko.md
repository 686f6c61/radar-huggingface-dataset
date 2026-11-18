# geolazagr/greko

## Resumen

Greko 2.4 es un asistente conversacional multimodal disenado para ejecutarse integramente en un telefono Android, sin conexion a internet. Lo desarrolla George (usuario `geolazagr`) como un fine-tuning del modelo Qwen3-VL-2B-Instruct de Alibaba, del que conserva el encoder visual y el proyector sin modificar y solo reentrena la parte del modelo de lenguaje. El resultado se distribuye en formato GGUF cuantizado para llama.cpp, acompanado de una aplicacion APK que integra el modelo, el encoder de vision y utilidades de sistema (agenda, contactos, ficheros Office, busqueda web opcional).

El modelo resuelve un problema concreto: ofrecer un asistente con vision, lectura de documentos, generacion de ficheros .docx/.xlsx y modo agente sobre telefonos de gama media (a partir de 2 GB de RAM), manteniendo la privacidad porque nada sale del dispositivo salvo que el usuario active la busqueda web. Con 1.720.574.976 parametros reales en safetensors, el peso cuantizado en IQ4_NL ocupa 1,05 GB y la variante Lite en IQ3_M baja a 815 MB.

Es relevante ahora porque demuestra que un modelo de 2B con capacidades multimodales y de agente puede desplegarse en hardware movil de consumo, con un proceso de ajuste documentado (QLoRA, mezcla de pesos, DPO) y con metricas propias de evaluacion en griego, matematicas y seguridad. La licencia Apache 2.0 permite uso comercial y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL: modelo de lenguaje + encoder visual + proyector), fine-tune del LLM sobre Qwen3-VL-2B-Instruct |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (1,05 GB), Q4_K_M (1,1 GB), IQ3_M con importance matrix (815 MB, variante Lite); encoder visual en q4 (241 MB), q3 (190 MB) y 8 bits (445 MB) |
| Idiomas soportados | ingles (en), griego (el) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors |

## Arquitectura y entrenamiento

Greko 2.4 parte de Qwen3-VL-2B-Instruct, un transformer multimodal con encoder visual y proyector que se mantienen intactos (los ficheros `mmproj-*` son identicos a los del modelo base, solo cuantizados). El ajuste se aplica unicamente al modelo de lenguaje. La version 2.1 se entreno con QLoRA sobre 22.423 conversaciones: chat general de smol-smoltalk, 8.557 conversaciones en griego de openeurollm/Dolci-Instruct-SFT-translated y datos escritos a mano de persona, griego, multi-turno y modo Think. La 2.3 anadio entrenamiento manual en griego y de seguridad.

La 2.4 aplica un proceso en tres pasos: primero mezcla los pesos de Greko 2.3 con el modelo base en proporcion 70/30, lo que mejora matematicas y reduce palabras inventadas en griego manteniendo la identidad del asistente; despues entrena esa mezcla con DPO sobre pares de griego, matematicas, seguridad y modo Think, incluyendo respuestas manuales a preguntas inofensivas que suenan arriesgadas para evitar sobrerrechazo; y finalmente combina al 50/50 las dos ejecuciones de DPO. No se documenta el numero de tokens de entrenamiento ni la innovacion de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y griego.
- Vision: descripcion y analisis de fotos enviadas al modelo (evaluado con 5 dibujos, 5/5 aciertos).
- Lectura de documentos PDF, Word (.docx) y texto plano directamente en el dispositivo.
- Generacion de ficheros reales .docx y .xlsx a partir de instrucciones en lenguaje natural.
- Modo Think: razonamiento paso a paso antes de responder, orientado a matematicas (mas lento).
- Modo agente: crear alarmas y temporizadores, anadir eventos de calendario, enviar mensajes y llamar a contactos por nombre, con confirmacion manual del usuario en el envio.
- Busqueda web opcional (DuckDuckGo o Wikipedia) con listado de fuentes, desactivada por defecto.
- Habilidades con comando `/`: investigacion profunda, resumen, traduccion y habilidades personalizadas.
- Rutinas programadas: prompts que el asistente responde a una hora fija.
- Integracion con Notion para consultar paginas del usuario.
- Recuperacion de conversaciones anteriores guardadas en el telefono.
- Compartir texto o fotos desde cualquier aplicacion hacia Greko.
- Voz: entrada por dictado y salida leida en voz alta usando los motores del propio telefono.
- Respuestas de seguridad predefinidas ante mensajes de autolesion o suicidio, con lineas de ayuda (1018, 112/166).

## Casos de uso

- Asistencia personal offline en Android: el modelo se ejecuta en el telefono y responde conversaciones multi-turno sin enviar datos a la nube, adecuado para usuarios preocupados por la privacidad.
- Gestion de agenda y recordatorios por voz: el modo agente interpreta "wake me at 7" o "βαλε ραντεβου την Παρασκευη στις 5" y abre las apps nativas de reloj y calendario, con confirmacion del usuario antes de actuar.
- Analisis de documentos en movilidad: el usuario envia un PDF o un .docx y pregunta sobre su contenido; el procesamiento ocurre en el dispositivo, util para contratos o facturas que no deben salir del telefono.
- Generacion de hojas de calculo y documentos: convertir un ticket en una fila de Excel o redactar un informe en Word mediante instrucciones en lenguaje natural, con salida en ficheros .xlsx y .docx reales.
- Soporte en griego para usuarios locales: el ajuste especifico en griego (8.557 conversaciones y datos manuales) y la reduccion de palabras inventadas al 3,71% lo hacen util para asistencia en ese idioma, donde muchos modelos pequenos fallan.
- Tareas de investigacion y resumen con busqueda web opcional: activando la busqueda, el modelo consulta DuckDuckGo o Wikipedia y responde citando fuentes, apropiado para consultas puntuales cuando hay conexion.
- Automatizacion de rutinas matutinas: una rutina programada puede generar un resumen diario a una hora fija sin intervencion del usuario.
- Despliegue en PC con llama.cpp: las variantes Q4_K_M y el encoder visual de 8 bits permiten probar el modelo en escritorio para desarrollo o evaluacion antes de llevarlo al movil.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluaciones propias, no estandarizadas):

| Metrica | Greko 2.3 | Greko 2.4 | Greko 2.4 IQ4_NL (app) | Greko 2.4 Lite (IQ3_M) |
|---|---|---|---|---|
| GSM8K (200 preguntas) | 69% | 75,5% | 80% | 71,5% (desde 59,5%) |
| ARC-Easy (200 preguntas) | 89,5% | 88,5% | 92% | no disponible |
| Palabras inventadas en griego (menor es mejor) | 5,19% | 3,71% | 4,0% | 7,8% (desde 10,6%) |
| Identidad (se nombra Greko, hecho por George) | si | si | no disponible | no disponible |
| Fotos (5 dibujos) | 5/5 | 5/5 | 5/5 | no disponible |
| Rechaza peticiones daninas (18 vistas / 8 reservadas) | 5/18, 2/8 | 14/18, 3/8 | no disponible | no disponible |
| Resiste instrucciones inyectadas en resultados web reservados | 2/3 | 3/3 | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval ni comparativas con modelos de terceros en la informacion disponible.

## Requisitos de hardware

- RAM minima en Android: 2 GB para la variante Lite (IQ3_M, 815 MB + encoder q3 de 190 MB); 2,4 GB o mas para la variante completa (IQ4_NL, 1,05 GB + encoder q4 de 241 MB). La descarga inicial es de aproximadamente 1,3 GB (1 GB para Lite).
- CPU: arm64 en Android 13 o superior; el modelo esta optimizado para CPUs de telefono mediante llama.cpp.
- VRAM estimada en GPU: no disponible; el autor no publica requisitos de GPU.
- GPU recomendadas: no disponible. El despliegue documentado es en CPU movil y en PC mediante llama.cpp (variante Q4_K_M de 1,1 GB y encoder de 8 bits de 445 MB).
- Cabe en GPU de consumo: si, por tamano (1,1 GB en Q4_K_M); cualquier GPU con 2 GB o mas de VRAM puede alojarlo, aunque no hay datos de rendimiento en GPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), aplicacion Android propia (`greko.apk`); no se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: el autor indica que cada respuesta fuera del modo Think debe llegar en aproximadamente un minuto en un telefono de 4 GB de RAM. No se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Greko 2.4 | 1.720.574.976 | no disponible | en, el | Apache 2.0 | GGUF | Fine-tune de Qwen3-VL-2B con vision y agente movil; GSM8K 75,5% |
| Qwen3-VL-2B-Instruct (base) | ~2B | no disponible | multilingue | Apache 2.0 | safetensors | Modelo original; Greko reutiliza su encoder visual sin cambios |
| Modelos de 2B para movil de la familia Qwen2.5/Qwen3 | ~2B | no disponible | multilingue | Apache 2.0 | GGUF, safetensors | Alternativas de tamano similar; no hay datos comparativos publicados por el autor |

No se dispone de comparativas directas con otros modelos en la informacion proporcionada; los datos de la tabla de benchmarks solo comparan versiones internas de Greko.

## Limitaciones y advertencias

- Es un modelo de 2B en un telefono: sigue cometiendo errores factuales y las respuestas largas en griego pueden resultar torpes, segun el propio autor.
- El modo Think acierta mas que antes pero no es fiable de forma consistente; no debe usarse como unica fuente en calculos criticos.
- Tasa de rechazo de peticiones daninas baja: 14/18 en peticiones vistas y solo 3/8 en reservadas; el filtrado de seguridad es limitado y depende de respuestas predefinidas para autolesion y emergencias.
- Riesgo de alucinacion documentado implicitamente por la tasa de palabras inventadas en griego (3,71% en 2.4, 7,8% en Lite) y por el aviso del autor de verificar cualquier dato importante.
- Solo soporta ingles y griego; no hay datos de rendimiento en otros idiomas.
- La longitud de contexto no esta publicada, lo que impide planificar cargas de documentos largos con garantias.
- La busqueda web esta desactivada por defecto y, cuando se activa, envia la consulta a DuckDuckGo o Wikipedia, rompiendo la promesa de funcionamiento totalmente offline.
- El modo agente requiere permisos de contactos, telefono y calendario, y aunque el usuario confirma el envio, la aplicacion accede a datos sensibles del dispositivo.
- La version distribuida es beta (app 2.25-beta) y el modelo se actualiza periodicamente; la app consulta el repositorio una vez al dia para ofrecer actualizaciones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; los datos de evaluacion son internos y no han sido replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geolazagr/greko
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Guia de instalacion paso a paso: https://geolazagr-greko.static.hf.space/
- Dataset de chat general: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset de conversaciones en griego: https://huggingface.co/datasets/openeurollm/Dolci-Instruct-SFT-translated
- Aplicacion Android: https://huggingface.co/geolazagr/greko/blob/main/greko.apk
