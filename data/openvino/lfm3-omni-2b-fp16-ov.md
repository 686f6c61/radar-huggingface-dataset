# OpenVINO/LFM3-Omni-2B-fp16-ov

## Resumen

LFM3-Omni-2B es un modelo multimodal any-to-any desarrollado por Liquid AI que acepta texto, imágenes, vídeo y audio como entrada, y puede producir texto, voz o una secuencia intercalada de texto y voz. Esta ficha concreta, `OpenVINO/LFM3-Omni-2B-fp16-ov`, es una conversión del checkpoint original a formato OpenVINO IR en FP16, publicada por el equipo de OpenVINO para su ejecución optimizada en hardware Intel (CPU, iGPU y NPU) mediante OpenVINO GenAI.

El modelo no es de razonamiento (non-reasoning) y está pensado para interacción conversacional multimodal en tiempo real, con especial énfasis en tareas de reconocimiento automático de habla (ASR) y síntesis de voz (TTS) integradas en un mismo pipeline. Con 2.000 millones de parámetros, el tamaño es contenido para un modelo omni, lo que lo hace candidato a despliegues en entornos con recursos limitados.

La relevancia de esta conversión radica en que permite ejecutar un modelo omni sobre hardware Intel sin GPU dedicada, usando el stack OpenVINO GenAI con backend de atención SDPA. La versión está validada con una pila nightly concreta (OpenVINO 2027.0.0.dev20261119) y no debe usarse con el backend de atención paginada en los ejemplos de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal omni con encoder de audio, embeddings de visión, decodificador de profundidad y decodificador de audio; detalles del transformer no disponibles) |
| Parametros totales | 2B (según nombre del modelo; no confirmado en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (sin compresión de pesos entera NNCF); precisión de ejecución dependiente del dispositivo |
| Idiomas soportados | no disponible (los ejemplos de la model card usan inglés americano para ASR y TTS) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | OpenVINO IR (XML/BIN) en FP16; también safetensors en el repo; tokenizer/detokenizer convertidos a IR |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal omni. La conversión OpenVINO incluye siete pares XML/BIN correspondientes a: modelo de lenguaje, embeddings de texto, embeddings de visión, encoder de audio, embeddings de salida de audio, decodificador de profundidad y decodificador de audio. Esta descomposición sugiere una arquitectura modular con encoders específicos por modalidad y un decodificador de audio separado para la generación de voz.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card remite a la model card upstream de `LiquidAI/LFM3-Omni-2B` para información sobre entrenamiento, usos previstos y limitaciones. El checkpoint origen está fijado al commit `21d75123f86c1f7ffb4bef1ea202710c4e7ebe67`.

La conversión se realizó con Python 3.12, PyTorch CPU 2.10.0, Transformers 5.20.0, Optimum Intel (revisión `7995031fbf29285441ec7c222ef9afa80aaedbb2`) y NNCF (revisión `0d605e5da7eb735aff96a14a3a771d84d90f88f8`). No se aplicó compresión de pesos entera con NNCF; los pesos se serializan en FP16.

## Capacidades

- Generación de texto a partir de prompts de texto.
- Reconocimiento automático de habla (ASR): acepta audio de entrada mono float32 a 16 kHz.
- Síntesis de voz (TTS): genera audio de salida a 24 kHz, con control de temperatura, penalización de repetición, semilla y longitud máxima de tokens de habla.
- Salida intercalada de texto y voz (modo `INTERLEAVED`) o solo voz (modo `SPEECH_ONLY`).
- Entrada de imágenes: tensores RGB uint8 con forma `[1, height, width, 3]`, referenciadas como `<ov_genai_image_0>`.
- Entrada de vídeo: mediante los argumentos `videos` y `videos_metadata` de OpenVINO GenAI.
- Conversación multi-turno mediante `ChatHistory` con roles system y user.
- Modelo any-to-any: combinación de modalidades de entrada (texto, imagen, vídeo, audio) y de salida (texto, voz, texto+voz).
- No es un modelo de razonamiento (non-reasoning); no se documenta modo thinking.

## Casos de uso

- Transcripción de audio a texto (ASR): el modelo acepta audio mono a 16 kHz y devuelve la transcripción en texto, adecuado para pipelines de subtitulado o actas de reuniones en inglés.
- Asistentes de voz conversacionales: combinando ASR y TTS en un mismo pipeline, permite construir interfaces de voz que escuchan, responden en texto y sintetizan la respuesta en audio a 24 kHz.
- Generación de voz para accesibilidad: TTS con control de voz (por ejemplo, voz femenina en inglés americano) para lectores de pantalla o narración de contenido.
- Descripción de imágenes y vídeo: el modelo acepta imágenes RGB y vídeo como entrada, útil para tareas de captioning o respuesta a preguntas visuales.
- Interacción multimodal intercalada texto-voz: aplicaciones de asistencia donde la respuesta combina texto y audio sincronizados, como tutoriales hablados o narración de pasos.
- Despliegue en hardware Intel sin GPU dedicada: al ser una conversión OpenVINO, puede ejecutarse en CPU, iGPU o NPU Intel mediante OpenVINO GenAI, lo que facilita su integración en portátiles y edge devices.
- Prototipado rápido de pipelines omni: el tamaño de 2B y el formato FP16 permiten iterar en entornos de desarrollo con recursos moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 5,1 GB en FP16; en GPU se requiere al menos ese espacio más overhead de activaciones y KV cache (no cuantificado en la información disponible).
- GPU recomendadas: no disponible. La conversión está orientada a hardware Intel (CPU, iGPU, NPU) mediante OpenVINO; no se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en consumer GPU: no confirmado; el tamaño de pesos (5,1 GB) es compatible con GPUs de 8 GB o más, pero la información proporcionada no valida esta configuración.
- Opciones de despliegue: OpenVINO GenAI (`genai.OmniPipeline`) con backend `ATTENTION_BACKEND="SDPA"`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Stack validado: `openvino==2027.0.0.dev20261119`, `openvino-tokenizers==2027.0.0.0.dev20261119`, `openvino-genai==2027.0.0.0.dev20261119`, `huggingface-hub==1.33.0`, `numpy==2.5.4`, `soundfile`, en Python 3.12.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (omni any-to-any de ~2B) con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo non-reasoning: no está diseñado para tareas de razonamiento complejo ni modo thinking.
- Idiomas: no se documenta el conjunto de idiomas soportados; los ejemplos de la model card usan inglés americano para ASR y TTS, por lo que el soporte multilingüe no está confirmado.
- Licencia lfm1.0 (license: other): es necesario revisar los términos en el enlace de licencia del modelo base antes de cualquier uso comercial; no se detallan restricciones en la información proporcionada.
- Backend de atención: los ejemplos de voz requieren `ATTENTION_BACKEND="SDPA"`; no debe usarse el backend de atención paginada con los ejemplos de speech.
- Stack nightly: la conversión está validada con versiones de desarrollo concretas de OpenVINO; usar otras versiones puede romper la compatibilidad.
- Formato de audio de entrada restringido: mono float32 a 16 kHz; el audio de salida es 24 kHz.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a modelos generativos de texto.
- Sesgos: no documentados en la información proporcionada.
- La model card remite a la model card upstream para limitaciones detalladas; esta ficha no las reproduce porque no están incluidas en la información disponible.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/OpenVINO/LFM3-Omni-2B-fp16-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Checkpoint origen fijado: https://huggingface.co/LiquidAI/LFM3-Omni-2B/tree/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67
- Licencia: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67/LICENSE
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Optimum Intel (revisión): https://github.com/huggingface/optimum-intel/commit/7995031fbf29285441ec7c222ef9afa80aaedbb2
- NNCF (revisión): https://github.com/openvinotoolkit/nncf/commit/0d605e5da7eb735aff96a14a3a771d84d90f88f8
