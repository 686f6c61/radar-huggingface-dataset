# saggamer/KIRA-LIVE-1

## Resumen

KIRA Live 1 es un paquete de pesos y código de inferencia para conversación por voz local, desarrollado por el usuario saggamer dentro del ecosistema KIRA Superapp. No se trata de un modelo único entrenado de forma conjunta, sino de tres conjuntos de pesos diferenciados (Listener, Thinker y Talker, este último con códec de voz) que se ejecutan de forma coordinada sobre el runtime propietario de KIRA. El objetivo es habilitar asistencia conversacional por voz, con memoria de chat y acciones sujetas a permisos, en Macs con Apple Silicon y de forma completamente offline una vez instalado.

El paquete se distribuye como vista previa de investigación (research-preview) y está pensado para ejecutarse exclusivamente dentro de KIRA Superapp o mediante el script `run_kira_live.py` incluido. No es un modelo compatible con Transformers ni un endpoint de inferencia alojado; requiere el entorno Python específico de KIRA Live y una revisión del repositorio de Superapp que incluya el botón Live.

La relevancia actual del proyecto reside en su enfoque de asistente de voz local con integración de herramientas (MCP, THE TREE), cancelación de eco acústico mediante WebRTC y cuantización en memoria de 8 bits para el componente Talker. No obstante, la información pública disponible es escasa en cuanto a arquitectura interna, datos de entrenamiento y evaluación cuantitativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (tres conjuntos de pesos: Listener, Thinker, Talker con códec de voz; no se especifica la arquitectura interna de cada componente) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Talker con capas lineales de 8 bits en memoria por defecto; BF16 original mediante `KIRA_LIVE_TALKER_BITS=0` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (código propio y pesos donantes incluidos, con atribuciones de terceros en `THIRD_PARTY_NOTICES.md`) |
| Formato de pesos | Safetensors, además de MLX y CoreML (el paquete CoreML de emoción está incluido y verificado) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de los componentes Listener, Thinker y Talker, ni especifica si se basan en transformers, MoE u otra familia. Lo que sí se indica es que el paquete contiene tres conjuntos de pesos que se ejecutan conjuntamente a través del runtime nativo de KIRA, no como un único fichero de tensores fusionado. El autor aclara explícitamente que esto no constituye una afirmación de entrenamiento conjunto de extremo a extremo.

Los pesos incluidos son pesos donantes de terceros que conservan su autoría original y sus términos Apache-2.0; las repositorios y revisiones exactas se registran en `bundle_manifest.json`. No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. Las actualizaciones documentadas (29 de septiembre) son correcciones de runtime —historial de conversación, control de repetición, selección de idioma, contratos de acción de THE TREE, eventos de audio no bloqueantes y diagnóstico de latencia— y no implican reentrenamiento de los pesos aceptados.

Como innovaciones técnicas destacables, el runtime incorpora cancelación de eco acústico local mediante WebRTC para la reproducción por altavoz, una guarda de cola de eco y una corrección de fallo en el mapeo multilingüe de tokens. El Talker emplea capas lineales de 8 bits en memoria por defecto para reducir el consumo.

## Capacidades

- Conversación por voz natural con pausa de micrófono e interrupción de las respuestas habladas.
- Conversación de texto con memoria de chat persistente entre turnos.
- Síntesis de voz expresiva mediante el componente Talker y su códec de voz.
- Ejecución de acciones sobre aplicaciones y sistema a través de THE TREE, con control de permisos gestionado por la aplicación.
- Inspección de ficheros y investigación web solicitadas por el usuario.
- Generación de documentos PDF y Word dentro de KIRA Superapp, con evidencia de ejecución devuelta en lugar de una afirmación de finalización sin verificar.
- Integración con herramientas MCP en el ecosistema Superapp.
- Detección de emoción mediante el paquete CoreML incluido y verificado.
- Soporte de conversación manos libres con cancelación de eco.

## Casos de uso

- Asistente de voz local en Mac: el usuario mantiene conversaciones habladas sin conexión una vez completada la instalación, con interrupción de respuestas y pausa del micrófono, adecuado para entornos donde la privacidad impide enviar audio a la nube.
- Asistencia con memoria de chat: al conservar el historial de conversación, el modelo puede retomar tareas anteriores dentro de la misma sesión de trabajo, útil para sesiones largas de investigación o documentación.
- Automatización de acciones sobre aplicaciones: mediante THE TREE, el asistente puede ejecutar peticiones como inspeccionar ficheros o realizar acciones en aplicaciones conectadas, con verificación de permisos por parte de la aplicación anfitriona.
- Generación de documentos bajo demanda: el usuario solicita un PDF o un documento Word y recibe evidencia de ejecución, lo que permite integrar la generación documental en flujos de trabajo verificables.
- Investigación web asistida: el componente de navegación Diagonal Browser del ecosistema Superapp permite encargar búsquedas y recopilación de información desde la interfaz conversacional.
- Prototipado de interfaces de voz: investigadores pueden usar el paquete para experimentar con pipelines de voz completos (escucha, razonamiento, síntesis) sobre Apple Silicon, sustituyendo componentes o ajustando la cuantización del Talker.
- Asistencia en programación dentro del workspace: KIRA Superapp incluye flujos de código, por lo que el modelo puede participar en tareas de desarrollo asistido integradas en el mismo entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `VOICE_RUNTIME_UPDATE.md` para tiempos medidos y limitaciones, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon exclusivamente; el paquete no está pensado para GPU NVIDIA ni para ejecución en servidores x86 convencionales.
- Tamaño del repositorio: 8,5 GB, que incluye los tres conjuntos de pesos, el códec de voz, datos de normalización, código de runtime y sumas de verificación SHA-256.
- VRAM/unified memory estimada: no disponible de forma explícita; el tamaño del paquete sugiere que se necesita un equipo con memoria unificada suficiente para cargar los tres componentes, aunque el autor no publica una cifra mínima.
- Cuantización: el Talker opera con capas lineales de 8 bits en memoria por defecto, lo que reduce los requisitos frente a BF16.
- Despliegue: runtime nativo de KIRA mediante `RUN_KIRA_OS.command` o el script `run_kira_live.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el autor indica explícitamente que no es un modelo drop-in de Transformers.
- Latencia y throughput: dependen del micrófono, los altavoces, el ruido de la sala y la carga de la máquina según el autor; las cifras medidas se remiten a `VOICE_RUNTIME_UPDATE.md`, no incluidas en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (asistentes de voz locales para Apple Silicon con integración de herramientas) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Vista previa de investigación: el propio autor advierte de que el modelo puede cometer errores y no reclama inteligencia emocional de nivel humano ni superioridad frente a modelos Live comerciales.
- La latencia de voz y la capacidad de interrupción dependen del hardware, el ruido ambiental y la carga del sistema; las pruebas del pipeline de voz no garantizan conversaciones sin fallos en hardware real.
- La selección de herramientas, el contenido de documentos, los permisos y los flujos largos requieren revisión por parte del usuario.
- Solo soporta inglés según los metadatos del modelo, aunque el runtime incluye una corrección de mapeo multilingüe de tokens.
- No es un modelo autónomo: requiere el entorno KIRA Live, una revisión de Superapp que incluya el botón Live y el runtime propietario; descargar el paquete por sí solo no añade la interfaz.
- El modo independiente (`run_kira_live.py`) es solo conversacional; las herramientas de THE TREE exigen la integración con Superapp.
- Licencia Apache-2.0 para el código propio y los pesos donantes, pero las dependencias de terceros conservan sus propias licencias y requisitos de atribución recogidos en `THIRD_PARTY_NOTICES.md`.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni límites de contexto; esta información no está disponible.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/saggamer/KIRA-LIVE-1
- KIRA Superapp (web): https://kira-superapp.vercel.app/
- GitHub del proyecto: https://github.com/saggamer/KIRA-Superapp
- Código de Diagonal Browser: https://github.com/saggamer/KIRA-Superapp/tree/main/diagonal_browser
