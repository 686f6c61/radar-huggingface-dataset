# lensetek/lensetek-edge-ai-agent

## Resumen

`lensetek-edge-ai-agent` es un repositorio publicado en Hugging Face por el usuario `lensetek` que, a pesar de su nombre, no contiene un modelo de lenguaje entrenado por el autor. Se trata de una aplicación autocontenida (~200 KB de código, sin pesos) que actúa como estudio local de IA en el borde (edge): orquesta modelos GGUF de terceros (por defecto Qwen 2.5 en variantes 0.5B y 3B) mediante `llama.cpp` y expone una API compatible con OpenAI en el puerto 3000, pensada para conectar frameworks de agentes como LangChain, CrewAI, AutoGen, Cursor o Continue.dev.

El paquete añade capacidades de voz en tiempo real (manos libres con *barge-in*, es decir, interrupción de la respuesta hablada al detectar voz del usuario), transcripción con Whisper y síntesis con tres motores TTS (Edge-TTS, Kokoro-82M y Piper). La propuesta es ofrecer un entorno completamente local y sin dependencias de la nube para prototipar agentes conversacionales con texto, visión y voz sobre hardware de consumo.

Su relevancia actual radica en la facilidad de integración: al emular el contrato de la API de OpenAI (`/v1/chat/completions` con streaming SSE y arranque automático del modelo bajo demanda), cualquier cliente existente puede apuntarse a `http://localhost:3000/v1` sin cambios de código. La licencia es MIT y el contenido está disponible únicamente en el repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación de orquestación sobre `llama.cpp`; los pesos reales son modelos GGUF de terceros (por defecto Qwen 2.5 Instruct en 0.5B y 3B) |
| Parametros totales | No disponible (depende del GGUF descargado; por defecto 0.5B o 3B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (la determina el modelo GGUF cargado; el repositorio no la declara) |
| Tipos de cuantizacion | No disponible explícitamente; el ejemplo usa `q4_k_m` (formato GGUF de llama.cpp) |
| Idiomas soportados | No disponible (la documentación está en inglés, indonesio y chino; el modelo subyacente Qwen 2.5 es multilingüe, pero el repositorio no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (descargados bajo demanda); el repositorio solo contiene código Python (~200 KB) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Es una capa de aplicación que envuelve un motor de inferencia `llama.cpp` y lo expone mediante un servidor HTTP compatible con OpenAI. Incluye un descargador interactivo (`download_models.py`) que obtiene pesos GGUF y modelos de voz bajo demanda: el paquete por defecto ocupa aproximadamente 638 MB (Qwen 2.5 0.5B + Whisper Base) y el recomendado para agentes unos 2,0 GB (Qwen 2.5 3B). El servidor arranca el modelo de forma automática al recibir la primera petición de un agente y soporta streaming SSE (`stream: true`) y respuestas no streaming.

La parte diferencial está en el pipeline de voz: transcripción con Whisper, detección de interrupción (*barge-in*) para permitir conversación full-duplex y tres motores de síntesis (Edge-TTS en la nube, Kokoro-82M y Piper en local). No se documentan datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) porque el autor no entrena pesos propios. Tampoco se detalla la versión concreta de `llama.cpp` ni si se emplea decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento mediante el GGUF cargado (por defecto Qwen 2.5 Instruct, 0.5B o 3B).
- Comprensión de imágenes (vision) según la documentación del repositorio, aunque el modelo por defecto es solo texto y no se especifica qué modelo multimodal se usa.
- API compatible con OpenAI: `/v1/chat/completions` y `/v1/models`, con autenticación mediante token dummy (`sk-local`).
- Streaming SSE completo y modo no streaming.
- Arranque automático del modelo bajo demanda.
- Voz manos libres en tiempo real con *barge-in* (interrupción al hablar).
- Interrupción manual mediante botón en la interfaz.
- Transcripción de audio con Whisper.
- Tres motores TTS: Edge-TTS (nube), Kokoro-82M (offline) y Piper (offline).
- Integración directa con LangChain, CrewAI, AutoGen, SDK oficiales de OpenAI (Python/Node), Cursor y Continue.dev.
- No se documenta soporte explícito de tool calling/function calling, agentes multi-paso nativos ni modo de razonamiento (thinking).

## Casos de uso

- Prototipado de agentes locales: se levanta el servidor en el puerto 3000 y se apunta cualquier cliente compatible con OpenAI (LangChain, CrewAI, AutoGen) a `http://localhost:3000/v1` para iterar sobre cadenas de agentes sin coste de API ni conexión a internet.
- Asistente de voz de escritorio: combina Whisper para transcripción, Qwen 2.5 para la respuesta y Kokoro-82M o Piper para síntesis, todo offline; el *barge-in* permite conversaciones naturales en las que el usuario interrumpe al asistente.
- Desarrollo con Cursor o Continue.dev en entornos sin red: se configura el endpoint local como proveedor compatible con OpenAI para autocompletado y chat sobre código, usando el Qwen 2.5 3B como modelo por defecto.
- Demostraciones y formación: el paquete por defecto (~638 MB) cabe en un portátil modesto y permite mostrar un pipeline completo de texto + voz + visión sin infraestructura cloud.
- Automatización de escritorio con agentes: al exponer un contrato OpenAI estándar, frameworks como CrewAI pueden orquestar tareas multi-paso sobre el modelo local, útil en entornos con requisitos de privacidad.
- Evaluación rápida de GGUF: el descargador interactivo (`py download_models.py`) permite cambiar entre Qwen 2.5 0.5B y 3B para comparar latencia y calidad en el mismo entorno.
- Kioscos o asistentes embebidos en hardware de consumo: la licencia MIT y la ausencia de dependencias cloud facilitan el despliegue en dispositivos con GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Como referencia, un GGUF de 0.5B en `q4_k_m` ocupa del orden de cientos de MB y uno de 3B en `q4_k_m` alrededor de 2 GB, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no especificadas. El proyecto está orientado a *edge* y hardware de consumo, pero no se detalla qué GPU se han probado.
- CPU: no se documenta si hay soporte CPU-only, aunque `llama.cpp` lo permite de forma general.
- Opciones de despliegue: el propio servidor integrado (`py app.py` o `start.bat` en Windows), que internamente usa `llama.cpp`. No se mencionan vLLM, TGI, Ollama ni llama.cpp como servidor independiente.
- Latencia y throughput: no disponibles.
- Modelos de voz: Whisper Base (~638 MB con Qwen 0.5B en el paquete por defecto), Kokoro-82M y Piper; no se detallan requisitos adicionales.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo subyacente | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| lensetek-edge-ai-agent | Aplicación de orquestación local | GGUF de terceros (Qwen 2.5 0.5B/3B por defecto) | No disponible | MIT | API compatible OpenAI, voz con barge-in, TTS múltiple |
| Ollama | Servidor local de modelos | Múltiples GGUF de terceros | Depende del modelo | MIT | No incluye capa de voz ni interfaz de estudio |
| llama.cpp server | Servidor de inferencia | GGUF de terceros | Depende del modelo | MIT | API compatible OpenAI básica, sin pipeline de voz |
| LM Studio | Aplicación de escritorio | GGUF de terceros | Depende del modelo | Propietaria | Interfaz gráfica, sin API de agentes tan completa |

No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: la calidad y el comportamiento dependen enteramente del GGUF que se descargue (por defecto Qwen 2.5 0.5B o 3B, modelos pequeños con capacidad limitada de razonamiento y código).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento activo.
- La documentación está en inglés, indonesio y chino; no hay versión en castellano.
- No se declara lista de idiomas soportados ni se documenta el rendimiento multilingüe.
- El soporte de visión se menciona pero no se especifica qué modelo multimodal se utiliza ni cómo se integra con el GGUF por defecto.
- No se documenta soporte de tool calling ni de function calling, pese a estar orientado a agentes.
- Riesgo de alucinación inherente a modelos de 0.5B-3B, especialmente en tareas de razonamiento complejo o código.
- La API usa un token dummy (`sk-local`) por defecto; no debe exponerse a redes no confiables sin autenticación real.
- Edge-TTS requiere conexión a la nube; solo Kokoro-82M y Piper son 100% offline.
- Licencia MIT para el código, pero los pesos descargados (Qwen 2.5, Whisper, Kokoro, Piper) tienen sus propias licencias que deben verificarse por separado antes de uso comercial.
- No hay benchmarks publicados que permitan validar el rendimiento del pipeline completo.

## Enlaces

- Hugging Face: https://huggingface.co/lensetek/lensetek-edge-ai-agent
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información proporcionada.
