# leeyunjai/themaker

## Resumen

`leeyunjai/themaker` es un repositorio de modelos empaquetados para su uso en un robot educativo de nombre Pibo/Fivebrain, desarrollado por el usuario leeyunjai y publicado en Hugging Face. No se trata de un unico modelo entrenado desde cero, sino de una coleccion de artefactos de inferencia (modelos de lenguaje, TTS, STT, deteccion de objetos, reconocimiento facial, gestos y mascaras) preparados para funcionar de forma totalmente offline en el dispositivo, cuyo directorio destino es `/home/pi/.model`.

El componente central es un par de modelos conversacionales de aproximadamente 0,8 mil millones de parametros, `themaker-ko` y `themaker-en`, presentados como ajustes finos de Qwen3.5-0.8B para uso educativo. Se distribuyen en formato GGUF con cuantizacion Q4_K_M y se ejecutan con `llama-server` de llama.cpp con una ventana de contexto de 2048 tokens. El repositorio incluye ademas `general.gguf`, que corresponde a Gemma 3 1B IT original sin modificar, usado presumiblemente como respaldo conversacional general.

El interes del repositorio es acotado pero concreto: demuestra un patron de despliegue de IA en el borde (edge AI) para robotica educativa, combinando varios modelos pequenos cuantizados en un unico paquete verificable mediante sumas SHA-256. El numero de parametros reportado en safetensors (999.885.952) corresponde al modelo Gemma 3 1B incluido, no al conjunto completo del repositorio. La informacion publica es escasa y la model card esta redactada en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelos base: Qwen3.5-0.8B y Gemma 3 1B); el repositorio agrega modelos ONNX auxiliares (TTS, STT, vision) |
| Parametros totales | 999.885.952 (safetensors, corresponde a Gemma 3 1B); los modelos conversacionales ajustados son de ~0,8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (`--ctx-size 2048` en llama.cpp) |
| Tipos de cuantizacion | Q4_K_M (GGUF) para los LLM; int8 para TTS y STT (con vocoder en fp32); FP16 para modelos de vision OpenVINO |
| Idiomas soportados | Coreano (`themaker-ko`), ingles (`themaker-en`); Gemma 3 1B IT multilingue |
| Licencia | `other`; componentes individuales: Apache-2.0 (themaker-ko/en, vision), Gemma Terms of Use (general.gguf), OpenRAIL-M (TTS), licencia FunASR (STT) |
| Formato de pesos | GGUF, ONNX, safetensors, `.task` (MediaPipe) |

## Arquitectura y entrenamiento

Los modelos conversacionales `themaker-ko-v2-0.8b` y `themaker-en-v2-0.8b` son ajustes finos de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen. La model card indica que el entrenamiento utilizo datos de AI Hub, el repositorio de datos de la Agencia Nacional de la Sociedad de la Informacion de Corea (한국지능정보사회진흥원), lo que sugiere un corpus orientado a contextos educativos coreanos. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El resto del paquete son modelos preentrenados convertidos y cuantizados, no reentrenados: Supertonic 3 para sintesis de voz (int8, vocoder fp32, diez voces F1-F5 y M1-M5), SenseVoiceSmall int8 via sherpa-onnx para reconocimiento de voz con silero_vad para deteccion de actividad vocal, easydetect ed-s COCO 80 (320x320) para deteccion de objetos, cuatro modelos OpenVINO 2023.0 FP16 para deteccion facial, edad/genero, emociones y reidentificacion, y clasificadores MediaPipe para gestos y piedra-papel-tijera. La innovacion practica es el empaquetado reproducible: cada archivo lleva su hash SHA-256 en `.model/VERSION` para verificacion tras la descarga.

## Capacidades

- Generacion de texto conversacional en coreano e ingles con los modelos `themaker-ko` y `themaker-en`.
- Conversacion multirretorno con contexto limitado a 2048 tokens, adecuado para dialogos cortos de robot educativo.
- Sintesis de voz (TTS) con diez voces predefinidas (F1-F5, M1-M5) mediante Supertonic 3.
- Reconocimiento de voz (STT) con deteccion de actividad vocal integrada mediante SenseVoiceSmall y silero_vad.
- Deteccion de objetos en 80 clases COCO con easydetect ed-s.
- Deteccion facial, estimacion de edad y genero, reconocimiento de emociones y reidentificacion facial (OpenVINO).
- Reconocimiento de gestos de mano y del juego piedra-papel-tijera (MediaPipe).
- Clasificacion de presencia de mascarilla facial.
- Ejecucion completamente offline en hardware tipo Raspberry Pi.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explicito.

## Casos de uso

- Robot educativo conversacional offline: el par `themaker-ko`/`themaker-en` permite mantener dialogos breves con estudiantes sin conexion a internet, usando la ventana de 2048 tokens para el turno actual y el historial reciente.
- Tutor de idiomas en el aula: el modelo ingles puede practicar conversacion basica con retroalimentacion inmediata, mientras el modelo coreano atiende a estudiantes nativos.
- Interaccion por voz manos libres: la combinacion de SenseVoiceSmall con silero_vad y Supertonic 3 permite construir un bucle completo de escucha, respuesta y sintesis en el propio dispositivo.
- Juegos interactivos con vision: los modelos MediaPipe de gestos y piedra-papel-tijera, junto con la deteccion de objetos COCO, habilitan dinamicas de juego donde el robot reconoce lo que el nino muestra a la camara.
- Monitorizacion de presencia y estado de animo en entornos educativos: los modelos OpenVINO de deteccion facial, emociones y reidentificacion permiten adaptar el tono de la interaccion segun la expresion del usuario.
- Control de acceso o higiene: el clasificador `mask.onnx` puede verificar el uso de mascarilla en la entrada de un aula o laboratorio.
- Despliegue en flotas de robots sin conectividad: el paquete verificable con SHA-256 simplifica la provision y actualizacion de muchos dispositivos identicos en entornos con red limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los modelos conversacionales en Q4_K_M ocupan aproximadamente 0,5-0,6 GB cada uno; Gemma 3 1B en Q4_K_M ronda los 0,7-0,8 GB. El repositorio completo pesa 3,6 GB, por lo que se recomienda al menos 4 GB de almacenamiento libre y 2-3 GB de RAM para ejecutar un LLM y los modelos de vision simultaneamente.
- Hardware objetivo declarado: Raspberry Pi (rutas `/home/pi`), es decir, CPU ARM sin GPU dedicada.
- GPU recomendadas: no aplica para el caso de uso previsto; en servidor funcionaria en cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060), pero no es el escenario disenado.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas, aunque el diseno es para CPU.
- Opciones de despliegue: llama.cpp (`llama-server` b11889, `--ctx-size 2048`), sherpa-onnx para STT, ONNX Runtime y OpenVINO para vision, MediaPipe Tasks para gestos.
- Latencia y throughput: no disponible. Con 0,8B en Q4_K_M sobre CPU ARM se puede esperar una generacion del orden de pocos tokens por segundo, insuficiente para texto largo pero aceptable para respuestas conversacionales cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| themaker (themaker-ko/en) | ~0,8B | 2048 | Coreano, ingles | Apache-2.0 (base) | GGUF | Ajuste educativo para robot |
| Qwen3.5-0.8B (base) | 0,8B | no disponible en esta ficha | Multilingue | Apache-2.0 | safetensors, GGUF | Modelo general pequeno |
| Gemma 3 1B IT | 1B | no disponible en esta ficha | Multilingue | Gemma Terms of Use | safetensors, GGUF | Modelo general pequeno de Google |
| Llama 3.2 1B Instruct | 1,2B | 128K | Multilingue | Llama 3.2 Community License | safetensors, GGUF | Modelo general pequeno de Meta |

La comparativa se limita a la categoria de modelos conversacionales pequenos; el repositorio no es directamente comparable porque agrega vision, voz y verificacion de integridad, capacidades que los modelos base no incluyen por si mismos.

## Limitaciones y advertencias

- La model card esta integramente en coreano; no hay documentacion en ingles ni en castellano.
- El contexto de 2048 tokens es muy reducido y limita el dialogo multirretorno y cualquier tarea de razonamiento con documentos largos.
- Los idiomas soportados se reducen practicamente a coreano e ingles; no se documenta castellano.
- No hay informacion sobre sesgos, datos de entrenamiento detallados ni evaluaciones de calidad o seguridad.
- La licencia del repositorio es `other`, con terminos distintos por componente; el uso comercial requiere revisar cada licencia (Gemma Terms of Use, OpenRAIL-M, FunASR, Apache-2.0) por separado.
- El modelo `general.gguf` esta sujeto a los Terminos de Uso de Gemma, que imponen restricciones adicionales de uso aceptable.
- Riesgo de alucinacion inherente a modelos de 0,8B-1B; no son adecuados para tareas factuales criticas sin verificacion.
- El reconocimiento facial, de emociones y de edad plantea implicaciones de privacidad y proteccion de datos (RGPD) que deben evaluarse antes de cualquier despliegue real, especialmente con menores.
- El repositorio no es un modelo unico: integrar el paquete completo exige orquestar varios runtimes (llama.cpp, sherpa-onnx, ONNX Runtime, OpenVINO, MediaPipe).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leeyunjai/themaker
- Terminos de uso de Gemma 3: https://ai.google.dev/gemma/terms
- llama.cpp (runtime de los GGUF): https://github.com/ggml-org/llama.cpp
- sherpa-onnx (runtime de STT): https://github.com/k2-fsa/sherpa-onnx
- OpenVINO Open Model Zoo: https://github.com/openvinotoolkit/open_model_zoo
- MediaPipe Tasks: https://ai.google.dev/edge/mediapipe/solutions/guide
- AI Hub (datos de entrenamiento citados): https://aihub.or.kr
