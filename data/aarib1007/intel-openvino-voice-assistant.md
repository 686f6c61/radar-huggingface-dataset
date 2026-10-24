# aarib1007/intel-openvino-voice-assistant

## Resumen

`aarib1007/intel-openvino-voice-assistant` no es un modelo con pesos entrenados, sino un repositorio de aplicación: la implementación recuperada para Windows del proyecto local `voice-edge-probe`, un asistente de voz full-duplex que corre íntegramente en local sobre hardware Intel. El repositorio contiene el código del servicio (FastAPI + interfaz web + WebSocket) y los scripts de preparación y arranque, pero no los pesos, que deben descargarse o exportarse por separado.

La relevancia técnica está en cómo orquesta el hardware: un pipeline dividido en cuatro etapas con destinos de ejecución distintos. Silero VAD corre en CPU vía sherpa-onnx; el reconocimiento de voz usa Parakeet TDT 0.6B v2 en formato OpenVINO IR con el encoder compilado en la NPU y el frontend mel, decoder y joint en CPU; el modelo de lenguaje es Qwen3.5-0.8B en GGUF sobre llama.cpp, acelerado por Vulkan en la GPU Intel Arc (con fallback a CPU); y la síntesis de voz la realiza Pocket TTS en CPU con streaming por trozos. Es un ejemplo práctico de reparto de cargas CPU/GPU/NPU en un AI PC (Lunar Lake), con ~2,5 GB de artefactos de modelo implicados.

El interés para desarrolladores e investigadores es doble: por un lado, sirve como arquitectura de referencia para asistentes de voz locales de baja latencia con barge-in y herramientas; por otro, documenta con franqueza sus propias lagunas (no hay pipeline de exportación reproducible de Parakeet a OpenVINO, no hay licencia declarada en el repositorio y no se publican resultados de benchmarks).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de aplicación, no un modelo único: VAD Silero (sherpa-onnx) → ASR Parakeet TDT 0.6B v2 (OpenVINO IR, encoder en NPU) → LLM Qwen3.5-0.8B (GGUF sobre llama.cpp, Vulkan/CPU) → TTS Pocket TTS (CPU, streaming). Servicio FastAPI con UI web y endpoint WebSocket |
| Parametros totales | No aplica a un único modelo: 0,6 B en el ASR (Parakeet TDT 0.6B v2) y 0,8 B en el LLM (Qwen3.5-0.8B) |
| Parametros activos | No disponible; no se declara arquitectura MoE en ninguno de los componentes |
| Longitud de contexto | No disponible; no se documenta la ventana de contexto del LLM ni la del ASR |
| Tipos de cuantizacion | Q8_0 (GGUF del LLM, ruta recomendada: `Qwen3.5-0.8B-Q8_0.gguf`); INT8 (modelo sherpa-onnx de fallback para ASR en CPU); Q5_K_M aparece solo en benchmarks históricos, con procedencia de conversión desconocida |
| Idiomas soportados | No disponible |
| Licencia | No disponible para el repositorio. Componentes: artefactos Parakeet OpenVINO IR bajo CC BY 4.0, modelo base NVIDIA Parakeet bajo CC BY 4.0, Qwen3.5-0.8B bajo Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + pesos) para Parakeet; GGUF para el LLM; ONNX para Silero VAD; los pesos no están incluidos en el repositorio |
| Runtime de inferencia | OpenVINO (ASR), llama.cpp (LLM), sherpa-onnx (VAD y ASR de fallback), Pocket TTS (síntesis) |
| Sistema soportado | Windows 11 de 64 bits y Python 3.12 (única configuración documentada) |
| Hardware de referencia validado | Intel Core Ultra 7 258V (Lunar Lake), 31,5 GiB de RAM, Intel Arc 140V, NPU Intel, dispositivos OpenVINO CPU/GPU/NPU, Vulkan 1.4.323 con driver 101.7026 |
| Tamano de los artefactos | ~1,9 GB de pesos Parakeet descargados por `prepare_models.ps1`; ~590 MB para el GGUF histórico Q5; el Q8_0 no tiene tamano documentado |
| Herramientas integradas | Calculadora y hora en local; meteorología vía Open-Meteo; RAG local sobre ficheros `.txt`, `.md` y `.json`; recuperación Needle opcional (runtime aparte) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una aplicación de inferencia que compone cuatro etapas. El audio entra desde el micrófono del navegador como PCM a 16 kHz por WebSocket. Silero VAD en CPU segmenta el habla y la envía a Parakeet TDT 0.6B v2, cargado como cuatro grafos OpenVINO IR (`parakeet_melspectogram.xml`, `parakeet_encoder.xml`, `parakeet_decoder.xml`, `parakeet_joint.xml`) más `parakeet_vocab.json`; en el arranque, `v2v/asr.py` consulta los dispositivos OpenVINO disponibles y compila el encoder para NPU cuando existe (`V2V_ASR_DEVICE=NPU` fuerza esa elección), dejando el frontend mel, decoder y joint en CPU, con caché de modelos compilados en `ov-cache/parakeet`. Si el IR falta o no compila, se cae al modelo sherpa-onnx INT8 para CPU.

La salida del ASR pasa por corrección de transcripción, herramientas y recuperación local, y llega al LLM (Qwen3.5-0.8B en GGUF) ejecutado con llama.cpp sobre Vulkan en la GPU Arc o, si falla la verificación de Vulkan, en CPU. La respuesta se sintetiza con Pocket TTS en CPU, se trocea y se streamea al navegador, que soporta barge-in. Innovaciones destacables del diseño: reparto heterogéneo NPU/GPU/CPU por etapa, streaming de extremo a extremo, caché de modelos compilados de OpenVINO y un lanzador que permite degradar a CPU en lugar de fallar (`run_v2v_cpu.bat`, `run_v2v_gpu_test.bat` para exigir Vulkan y NPU verificados).

No se documenta ningún proceso de entrenamiento, composición de dataset, número de tokens ni fases de RLHF/DPO para los componentes; los modelos base son checkpoints publicados por terceros (NVIDIA y Qwen) y el autor solo aporta la integración. El propio repositorio advierte de que no se recuperaron los scripts de exportación ni el entorno del exportador, por lo que no es posible regenerar hoy los cuatro grafos divididos desde el checkpoint NeMo; los artefactos publicados por FluidInference (identificado como conversor, también en el repositorio `FluidInference/eddy`) son la única vía de preparación soportada.

## Capacidades

- Detección de actividad de voz y asistente full-duplex con barge-in: el usuario puede interrumpir la respuesta mientras suena.
- Reconocimiento de voz en streaming sobre PCM a 16 kHz enviado por WebSocket, con encoder en NPU y resto en CPU.
- Fallback automático de ASR a un modelo sherpa-onnx INT8 en CPU si el IR de OpenVINO no está o no compila.
- Generación de texto con Qwen3.5-0.8B mediante llama.cpp, con offload Vulkan a GPU Intel Arc o ejecución en CPU.
- Tool calling local: calculadora y consulta de hora; meteorología mediante la API de Open-Meteo.
- Recuperación aumentada local (RAG) indexando ficheros `.txt`, `.md` y `.json`, más recuperación Needle opcional si se instala su runtime por separado.
- Síntesis de voz con Pocket TTS en CPU, emitida por trozos para reducir latencia percibida.
- Servicio FastAPI que sirve la interfaz de navegador y el endpoint WebSocket, con binding a loopback por defecto.
- Modo LAN opcional (`--host 0.0.0.0 --allow-lan`) con token de autenticación (`V2V_AUTH_TOKEN`) y orígenes permitidos explícitos (`V2V_ALLOWED_ORIGINS`).
- Configuración de rutas de modelos por variables de entorno (`V2V_MODEL_DIR`, `V2V_QWEN_GGUF`), sin editar código.

## Casos de uso

- Asistente de voz de escritorio completamente offline: el pipeline entero corre en local sobre un AI PC, con lo que se puede desplegar en entornos sin conectividad o con requisitos de confidencialidad estrictos, sin enviar audio a la nube.
- Prototipo de referencia para reparto CPU/GPU/NPU: sirve para medir qué etapas conviene fijar en NPU (encoder ASR) y cuáles en iGPU (LLM) en plataformas Core Ultra, antes de diseñar un producto propio.
- Automatización de consultas operativas con herramientas: gracias al tool calling con calculadora, hora y meteorología, se puede adaptar a casos como consulta de estado de sistemas o cálculos rápidos dictados por voz.
- Base para un asistente de documentación interna: el RAG sobre `.txt`, `.md` y `.json` permite indexar manuales o notas de proyecto y responder preguntas por voz o por texto a través de la misma interfaz web.
- Interfaz de voz para kioscos o puestos de trabajo en red local: el modo LAN con token y orígenes restringidos permite servir la UI a varios equipos detrás de un proxy inverso autenticado.
- Evaluación de TTS y ASR de baja latencia en streaming: la arquitectura con trozos de audio y barge-in sirve para experimentar con interacción conversacional natural sin depender de APIs externas.
- Laboratorio de sustitución de componentes: al estar las etapas desacopladas, se puede cambiar el LLM por otro GGUF compatible con llama.cpp y comparar latencia y calidad manteniendo el resto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de "saved benchmarks" históricos obtenidos con un GGUF Q5_K_M de procedencia desconocida, pero no se incluyen cifras de latencia, throughput ni métricas de calidad (WER, MMLU, HumanEval u otras), y el propio autor señala que ese fichero Q5 no es necesario para el montaje documentado.

## Requisitos de hardware

- Configuración validada (conocida como buena, no mínima): Windows 11 de 64 bits, Intel Core Ultra 7 258V (Lunar Lake), 31,5 GiB de RAM, Intel Arc 140V, NPU Intel, OpenVINO con dispositivos CPU/GPU/NPU y Vulkan 1.4.323 (driver 101.7026).
- VRAM dedicada estimada: no disponible. En el hardware de referencia la GPU y la NPU son integradas y comparten memoria del sistema, por lo que no se publica una cifra de VRAM.
- GPU discretas recomendadas: no disponible; no se documenta ningún escenario con GPU dedicada (A100, H100, RTX 4090 u otras).
- Ejecución en GPU de consumo: no documentada. El caso soportado es iGPU Intel Arc con Vulkan; existe fallback a CPU sin NPU ni GPU Vulkan, a menor velocidad.
- Almacenamiento: ~1,9 GB de pesos Parakeet descargados por `prepare_models.ps1`, más espacio para el entorno Python, cachés de modelos y la caché de compilación de OpenVINO (`ov-cache/parakeet`). El GGUF histórico Q5 ocupa ~590 MB; el Q8_0 no tiene tamano documentado.
- Opciones de despliegue: servicio FastAPI con UI web en `http://127.0.0.1:8088` mediante `run_v2v.bat`, `run_v2v_cpu.bat` o `run_v2v_gpu_test.bat`; inferencia con OpenVINO Runtime, llama.cpp, sherpa-onnx y Pocket TTS. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp server.
- Latencia y throughput: no disponible; no se publican mediciones.
- Exposición en red: para uso LAN hay que pasar `--host 0.0.0.0 --allow-lan` y definir `V2V_AUTH_TOKEN` y `V2V_ALLOWED_ORIGINS` exactos; el servidor rechaza orígenes comodín en bindings no loopback. El autor recomienda mantener TLS y control de acceso mediante un proxy inverso autenticado.

## Comparativa con modelos similares

| Proyecto | Naturaleza | Componentes | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aarib1007/intel-openvino-voice-assistant` | Aplicación de asistente de voz local (código, sin pesos) | Silero VAD + Parakeet TDT 0.6B v2 (OpenVINO) + Qwen3.5-0.8B (GGUF) + Pocket TTS | Windows 11, Intel Core Ultra 7 258V validado | No disponible en el repositorio; componentes CC BY 4.0 y Apache-2.0 | Pública en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `Fersca/Robot` | Aplicación de asistente de voz y visión local para Core Ultra | OpenVINO sobre CPU/GPU/NPU para LLM, Whisper para STT, Silero VAD, TTS y detección de presencia por cámara | Intel Core Ultra | No disponible en la información consultada | Pública en GitHub |
| Stacks autoensamblados Whisper + llama.cpp + TTS local | Integración manual de componentes sueltos | Whisper como ASR, un LLM GGUF y un motor TTS a elección | CPU o GPU según build | Depende de cada componente | Requiere integración propia |
| Asistentes de voz en la nube | Servicio gestionado | ASR, LLM y TTS propietarios en servidor | Cliente ligero | Propietaria | Comercial, con dependencia de red |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada, por lo que la comparación se limita a arquitectura, hardware y licencia.

## Limitaciones y advertencias

- El repositorio no declara licencia. Sin licencia explícita, el uso comercial y la redistribución del código quedan en una situación jurídica indeterminada; hay que contactar con el autor antes de cualquier despliegue en producción.
- No se incluyen los pesos: los scripts descargan artefactos de terceros con licencias propias (CC BY 4.0 para Parakeet y sus grafos OpenVINO, Apache-2.0 para Qwen3.5-0.8B). Al redistribuir artefactos adaptados hay que conservar la atribución e indicar los cambios.
- El pipeline de exportación de Parakeet a OpenVINO no es reproducible: no se recuperaron los scripts de exportación ni el entorno del exportador, y las herramientas genéricas de OpenVINO no reproducen los grafos NeMo divididos. Solo se soportan los IR ya publicados.
- El GGUF Q5_K_M empleado en benchmarks históricos tiene editor y procedencia de conversión desconocidos; el autor recomienda no redistribuirlo y no forma parte del montaje documentado.
- Solo hay una configuración de hardware validada y una única plataforma documentada (Windows 11 x64 + Python 3.12). No se documentan Linux, macOS ni GPU discretas, y el rendimiento en otros equipos es incierto.
- No se publican cifras de latencia, throughput ni calidad (WER, evaluaciones del LLM), lo que impide estimar el comportamiento en producción sin medir por cuenta propia.
- Un LLM de 0,8 B presenta riesgo de alucinación y razonamiento limitado en consultas complejas; la corrección de transcripción del ASR puede propagar errores al modelo.
- No se documentan idiomas soportados ni calidad multilingüe, ni para el ASR ni para el LLM ni para el TTS.
- Exposición en red: el modo LAN exige token, orígenes exactos y, según el autor, TLS y autenticación en un proxy inverso; un despliegue mal configurado deja el servicio accesible en la red.
- La recuperación Needle es opcional y requiere un runtime instalado aparte; sin él, la búsqueda sobre conocimiento local se limita al indexado de ficheros `.txt`, `.md` y `.json`.
- La fecha de creación del repositorio (2026-10-24) y el hecho de tener 0 descargas y 0 likes indican que se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aarib1007/intel-openvino-voice-assistant
- Documentacion de OpenVINO: https://docs.openvino.ai/
- Lista de modelos verificados para OpenVINO: https://docs.openvino.ai/2025/documentation/compatibility-and-support/supported-models.html
- OpenVINO Model Hub (Intel): https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/models.html
- Benchmarks del OpenVINO Model Hub: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/model-hub.html
- Proyecto similar `Fersca/Robot`: https://github.com/Fersca/Robot
- Repositorio del conversor citado por el autor, `FluidInference/eddy`: no disponible como enlace verificado en la busqueda; se menciona en la model card
- GGUF recomendado, `ggml-org/Qwen3.5-0.8B-GGUF` (revision `8fea620810c4afa23dd6443f999a48574c1611a3`): https://huggingface.co/ggml-org/Qwen3.5-0.8B-GGUF
- Checkpoint base del LLM, `Qwen/Qwen3.5-0.8B`: https://huggingface.co/Qwen/Qwen3.5-0.8B
- API de meteorologia Open-Meteo: https://open-meteo.com/
- sherpa-onnx (VAD y ASR de fallback): https://github.com/k2-fsa/sherpa-onnx
