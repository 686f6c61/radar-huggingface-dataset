# leeyunjai/themaker

## Resumen

themaker es un paquete de modelos empaquetados por el usuario leeyunjai para su despliegue en un robot educativo de bajo consumo (plataforma Raspberry Pi, ruta `/home/pi/.model`). No se trata de un modelo unico, sino de una coleccion de artefactos de inferencia en formato GGUF y ONNX que cubren conversacion, sintesis de voz, reconocimiento de voz, deteccion de objetos, reconocimiento facial, gestos y clasificacion de mascarillas. El objetivo declarado es que el robot funcione completamente offline, con todos los pesos preinstalados.

El componente central es un modelo conversacional de aproximadamente 1.000 millones de parametros (999.885.952 segun los safetensors del repo), identificado como un ajuste fino de Qwen3.5-0.8B denominado "themaker" en sus variantes coreana e inglesa, junto con un Gemma 3 1B IT de Google como modelo general. El ajuste fino esta orientado a uso educativo y conversacional en coreano e ingles, con una ventana de contexto configurada en 2.048 tokens en el servidor llama.cpp de referencia.

La relevancia de este repositorio es practica mas que investigadora: demuestra un patron de empaquetado reproducible para robots educativos offline, con verificacion de integridad mediante sha256 por archivo y una seleccion de modelos pequenos cuantizados (Q4_K_M, int8, FP16) que caben en hardware modesto. No hay informacion publicada sobre arquitectura interna del ajuste fino, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el ajuste fino parte de Qwen3.5-0.8B; el modelo general es Gemma 3 1B IT) |
| Parametros totales | 999.885.952 (segun safetensors del repositorio) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 2.048 tokens (configuracion de `llama-server` con `--ctx-size 2048`) |
| Tipos de cuantizacion | Q4_K_M (GGUF de los LLM), int8 (TTS Supertonic 3 y STT SenseVoiceSmall), FP16 (modelos OpenVINO de rostro), FP32 (vocoder de TTS) |
| Idiomas soportados | Coreano e ingles (variantes `themaker-ko` y `themaker-en`); el modelo general Gemma 3 1B IT es multilingue |
| Licencia | "other": Gemma Terms of Use para `general.gguf`; Apache-2.0 para la base Qwen3.5-0.8B; OpenRAIL-M para TTS; licencia FunASR para SenseVoice; MIT y Apache-2.0 en el resto de carpetas |
| Formato de pesos | GGUF (LLM), ONNX (STT, vision, mascarillas), task de MediaPipe, FP16/FP32 segun carpeta |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del ajuste fino mas alla de indicar que `themaker-ko.gguf` y `themaker-en.gguf` derivan de Qwen3.5-0.8B, un modelo de la familia Qwen con licencia Apache-2.0. El modelo general `general.gguf` es Gemma 3 1B IT de Google, distribuido bajo los Gemma Terms of Use. Ambos se sirven con llama.cpp (build b11889) mediante `llama-server` con contexto de 2.048 tokens.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas del ajuste fino. La model card unicamente declara que los modelos themaker se entrenaron utilizando datos de AI Hub, un programa de datos del Instituto Nacional de la Sociedad de la Informacion de Corea (한국지능정보사회진흥원). El resto de componentes son conversiones de terceros: Supertonic 3 int8 para TTS (con vocoder en FP32), SenseVoiceSmall int8 via sherpa-onnx con silero_vad, easydetect ed-s COCO 80, y modelos de OpenVINO Open Model Zoo 2023.0 FP16 para deteccion de rostro, edad/genero, emociones y reidentificacion, ademas de tareas de MediaPipe para landmarks faciales y gestos.

## Capacidades

- Generacion de texto conversacional en coreano e ingles mediante los modelos `themaker-ko` y `themaker-en`.
- Conversacion general multilingue a traves de Gemma 3 1B IT (`general.gguf`).
- Sintesis de voz (TTS) con Supertonic 3 en int8, con diez voces predefinidas (F1 a F5 y M1 a M5).
- Reconocimiento de voz (STT) con SenseVoiceSmall int8 y deteccion de actividad de voz con silero_vad.
- Deteccion de objetos COCO de 80 clases con easydetect ed-s (entrada 320x320).
- Deteccion de rostro, estimacion de edad y genero, reconocimiento de emociones y reidentificacion facial (OpenVINO FP16).
- Landmarks faciales y reconocimiento de gestos y de piedra-papel-tijera con MediaPipe.
- Clasificacion de presencia de mascarilla mediante un modelo ONNX (embedder + clasificador).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni vision integrada en el LLM.

## Casos de uso

- Robot educativo conversacional offline: el paquete completo se instala en `/home/pi/.model` y permite al robot mantener dialogos en coreano o ingles sin conexion, usando `themaker-ko.gguf` o `themaker-en.gguf` con contexto de 2.048 tokens.
- Asistente de voz integrado: la combinacion de SenseVoiceSmall (STT), el LLM y Supertonic 3 (TTS) permite construir un bucle de voz completo en el propio dispositivo, adecuado para interacciones de aula.
- Interaccion social con reconocimiento de emociones: los modelos OpenVINO de emociones y edad/genero permiten adaptar el tono de la respuesta del robot en funcion del estado aparente del interlocutor.
- Juegos educativos de gestos: `gesture_recognizer.task` y `rps_recognizer.task` habilitan dinamicas de piedra-papel-tijera o reconocimiento de senas en actividades infantiles.
- Control de acceso o higiene en entornos escolares: `mask.onnx` clasifica si una persona lleva mascarilla, util en escenarios de normativa sanitaria.
- Deteccion de objetos para navegacion basica: easydetect ed-s COCO 80 a 320x320 permite al robot identificar obstaculos u objetos cotidianos con un coste computacional bajo.
- Reidentificacion de alumnos en sesiones: `face-reidentification-retail-0095` permite reconocer a un usuario ya registrado sin necesidad de conexion a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 2,9 GB en total; el LLM en Q4_K_M de ~0,8-1B cabe holgadamente en 1-2 GB de RAM. El conjunto completo (LLM + TTS + STT + vision) requiere varios GB, pero esta pensado para ejecutarse en una Raspberry Pi con almacenamiento suficiente.
- GPU recomendadas: no se especifican; el diseno apunta a CPU en Raspberry Pi. En GPU, cualquier tarjeta consumer moderna (RTX 3060 o superior) ejecutaria el LLM sin problemas, aunque no es el escenario objetivo.
- Cabe en GPU consumer: si, cualquier GPU con 4 GB o mas de VRAM puede alojar el LLM en Q4_K_M; los modelos de vision son ligeros (entradas 320x320, FP16).
- Opciones de despliegue: llama.cpp (build b11889, `llama-server`), sherpa-onnx para STT, ONNX Runtime y OpenVINO para vision, MediaPipe Tasks para gestos y landmarks.
- Latencia y throughput: no disponibles. El contexto de 2.048 tokens y las cuantizaciones Q4_K_M/int8 sugieren un diseno orientado a latencia aceptable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| themaker (este repo) | ~1B (LLM base Qwen3.5-0.8B) | 2.048 tokens | other (mixta) | GGUF, ONNX | Paquete multimodal para robot educativo offline |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | Apache-2.0 | safetensors, GGUF | LLM conversacional general |
| Gemma 3 1B IT | ~1B | No disponible | Gemma Terms of Use | safetensors, GGUF | LLM general multilingue de Google |
| SmolLM2-1.7B | ~1,7B | No disponible | Apache-2.0 | safetensors, GGUF | LLM pequeno para edge |

La comparativa se limita a los modelos base citados en la propia model card; no hay datos de rendimiento del ajuste fino que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El ajuste fino solo declara soporte de coreano e ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto muy limitado (2.048 tokens), insuficiente para tareas de contexto largo o documentos extensos.
- No hay benchmarks publicados ni evaluacion independiente del ajuste fino; se desconoce su calidad real frente a la base Qwen3.5-0.8B.
- La licencia es "other" y mixta por componente: `general.gguf` esta sujeto a los Gemma Terms of Use (con restricciones de uso comercial), el TTS a OpenRAIL-M (con clausulas de uso) y el STT a la licencia FunASR. Es imprescindible revisar cada `LICENSE` antes de un uso comercial.
- El repositorio esta disenado para un robot concreto (Raspberry Pi, ruta fija `/home/pi/.model`); no es un paquete generico listo para produccion en servidor.
- Riesgo de alucinacion inherente a modelos de ~1B de parametros; no se documentan mitigaciones.
- Los modelos de vision (edad/genero, emociones, reidentificacion) pueden introducir sesgos demograficos y plantean implicaciones de privacidad; su uso en entornos educativos requiere consentimiento y cumplimiento normativo.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados complejos.
- La fecha de creacion indicada (2026-03-26) y la de actualizacion (2026-11-16) deben tratarse con cautela como metadatos del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leeyunjai/themaker
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Qwen3.5-0.8B (modelo base, referencia en la model card): no disponible enlace directo en la informacion proporcionada
- AI Hub (Corea, datos de entrenamiento declarados): no disponible enlace directo en la informacion proporcionada
- llama.cpp (runtime de referencia, build b11889): no disponible enlace directo en la informacion proporcionada
- sherpa-onnx y SenseVoice: no disponible enlace directo en la informacion proporcionada
- OpenVINO Open Model Zoo 2023.0: no disponible enlace directo en la informacion proporcionada
- MediaPipe Tasks: no disponible enlace directo en la informacion proporcionada
