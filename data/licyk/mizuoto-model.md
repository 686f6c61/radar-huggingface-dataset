# licyk/mizuoto-model

## Resumen
Mizuoto-model es un repositorio espejo (mirror) que empaqueta los pesos y activos de multiples motores de sintesis de voz (text-to-speech, TTS) y reconocimiento de voz (automatic speech recognition, ASR) utilizados por la herramienta de escritorio Mizuoto, desarrollada por el usuario licyk. No es un modelo unico entrenado por el autor, sino una recopilacion de copias sin modificar de modelos de terceros (CosyVoice, F5-TTS, FishSpeech, GPT-SoVITS, IndexTTS, Qwen3-TTS, Whisper, Paraformer, entre otros), organizadas en una jerarquia `<engine>/<model>/…` y `_assets/<engine>/<asset>/…`.

El repositorio resuelve un problema logistico: Mizuoto intenta descargar los archivos desde este espejo primero y, si falla, recurre a cada repositorio oficial archivo por archivo, verificando cada uno contra el SHA-256 fijado en el catalogo de Mizuoto. El archivo `MIRROR.json` lista cada fichero con su tamano, hash y origen (repositorio, revision y ruta).

Por su naturaleza agregada, no dispone de una arquitectura, un tamano de parametros ni una longitud de contexto unicos: las especificaciones dependen del motor concreto que se utilice. El repositorio ocupa 117,1 GB (la model card declara 125,3 GB de contenido) y cada subcarpeta conserva la licencia de su repositorio de origen, por lo que el uso comercial esta restringido en varios de los motores incluidos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | agregado de multiples motores TTS/ASR (no aplica una arquitectura unica) |
| Parametros totales | no disponible (depende de cada motor; p. ej. CosyVoice-300M, CosyVoice2/3-0.5B, Qwen3-TTS 0.6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no lista idiomas; los motores incluidos cubren principalmente chino e ingles, con Whisper multilingue) |
| Licencia | per-model (`other`), con licencias individuales por carpeta (Apache 2.0, MIT, CC-BY-NC-4.0, Fish Audio Research/Community, bilibili Model Use License) |
| Formato de pesos | safetensors, ONNX y otros formatos propios de cada motor |

## Arquitectura y entrenamiento
El repositorio no define una arquitectura propia ni contiene un proceso de entrenamiento unificado. Es un contenedor de artefactos de inferencia de distintos sistemas de voz, cada uno con su propia arquitectura: CosyVoice (modelos de 300M y variantes 0.5B), F5-TTS y E2-TTS (difusion/flow matching sobre espectrogramas mel), FishSpeech (s2-pro y drama-3), GPT-SoVITS (v2, v2pro, v2proplus, v4, v5turbo), IndexTTS (v1.5, v2, v2.5), OmniVoice, Qwen3-TTS (0.6B base y custom-voice), asi como componentes auxiliares (BigVGAN, CAM++, w2v-BERT, MaskGCT, vocos-mel, encoders de GPT-SoVITS).

En el lado ASR incluye Paraformer-zh con FSMN-VAD y CT-Transformer para puntuacion, y Whisper-large-v3-turbo. Los pesos son copias literales de los repositorios oficiales (por ejemplo, `FunAudioLLM/CosyVoice2-0.5B`, `SWivid/F5-TTS`, `fishaudio/drama-3`, `IndexTeam/IndexTTS-2`, `Qwen/Qwen3-TTS-12Hz-0.6B-Base`), fijadas a revisiones concretas y verificadas por SHA-256. No hay innovaciones tecnicas propias ni datos de entrenamiento originales.

## Capacidades
- Sintesis de voz (TTS) mediante multiples motores: CosyVoice, F5-TTS, FishSpeech, GPT-SoVITS, IndexTTS, OmniVoice y Qwen3-TTS.
- Clonacion de voz y TTS zero-shot en los motores que lo soportan (F5-TTS, IndexTTS, CosyVoice instruct/sft).
- Reconocimiento de voz (ASR) en chino con Paraformer-zh y en multiples idiomas con Whisper-large-v3-turbo.
- Deteccion de actividad de voz (FSMN-VAD) y puntuacion automatica (CT-Transformer).
- Componentes de soporte: vocoder BigVGAN, encoder de hablante CAM++, codec semantico MaskGCT y w2v-BERT.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente.

## Casos de uso
- Lectura por voz de articulos o documentos: usar un motor TTS como CosyVoice o Qwen3-TTS para convertir texto a audio en una aplicacion de escritorio, aprovechando que los pesos ya estan empaquetados y verificados.
- Doblaje y clonacion de voz para prototipos: F5-TTS o IndexTTS permiten sintetizar una voz a partir de una muestra de referencia, util en demos de accesibilidad o contenido educativo (respetando la licencia no comercial).
- Transcripcion de reuniones en chino: Paraformer-zh con FSMN-VAD y CT-Transformer segmenta, transcribe y puntua audio de forma local.
- Transcripcion multilingue: Whisper-large-v3-turbo para audio en varios idiomas dentro de un pipeline de subtitulado.
- Asistentes de voz locales: combinar ASR (Whisper/Paraformer) con un motor TTS para construir un bucle de conversacion por voz sin depender de servicios en la nube.
- Investigacion en sintesis de voz: comparar motores (CosyVoice, GPT-SoVITS, FishSpeech, IndexTTS) sobre el mismo conjunto de audios usando pesos reproducibles fijados por hash.
- Despliegue offline en escritorio: Mizuoto usa este espejo como primera fuente de descarga, lo que facilita instalaciones sin acceso a multiples repositorios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma agregada; depende del motor. Los modelos pequenos (CosyVoice-300M, GPT-SoVITS v2-base de 0,26 GB, F5-TTS de ~1,4 GB) pueden ejecutarse en GPU de consumo; los grandes (FishSpeech drama-3 de 41,5 GB, s2-pro de 11 GB, IndexTTS v2/v2.5 de ~5,5-5,9 GB) requieren mas memoria.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, los motores pequenos caben en RTX 3060/4060/4090, mientras que drama-3 y s2-pro probablemente requieran A100/H100 o cuantizacion.
- Cabe en GPU de consumo: si para los motores pequenos; no para los conjuntos completos ni para drama-3 sin cuantizar.
- Opciones de despliegue: la herramienta oficial es Mizuoto (https://github.com/licyk/Mizuoto); el repositorio incluye formatos ONNX y safetensors, por lo que puede integrarse con runtimes ONNX o PyTorch segun el motor. No se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Aspecto | Mizuoto-model (espejo) | Repositorio oficial de un motor (p. ej. CosyVoice2-0.5B) | Kit de TTS local (p. ej. Coqui TTS) |
|---|---|---|---|
| Tipo | Agregado de pesos de terceros | Modelo unico | Framework con varios modelos |
| Parametros | Variable por motor | 0,5B (ejemplo) | Variable |
| Contexto | No aplica | No aplica (audio) | No aplica |
| Licencia | Per-model (mixta) | Apache 2.0 (ejemplo) | MPL-2.0 (tipicamente) |
| Uso comercial | Restringido en varias carpetas | Segun licencia del motor | Generalmente permitido |
| Disponibilidad | Hugging Face (espejo) | Hugging Face oficial | PyPI/GitHub |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias
- No es un modelo entrenado por el autor: los pesos son copias sin modificar; cualquier sesgo o limitacion proviene de los motores originales.
- Riesgo de clonacion de voz no autorizada: la licencia de IndexTTS prohibe explicitamente clonar una voz sin permiso de su propietario.
- Restricciones de licencia: F5-TTS (pesos CC-BY-NC-4.0) y FishSpeech (Research License) no permiten uso comercial; drama-3 tiene uso comercial restringido; IndexTTS usa la bilibili Model Use License. Es obligatorio revisar `LICENSES.md` antes de producir.
- Idiomas: la model card no declara idiomas soportados; la cobertura depende de cada motor (predominantemente chino e ingles).
- Sin benchmarks publicados: no hay datos de calidad, latencia ni throughput verificables.
- Tamano elevado (117-125 GB): requiere espacio en disco y descargas largas; la verificacion SHA-256 anade tiempo de proceso.
- Sin garantias de mantenimiento: el repositorio depende de revisiones fijas de terceros y puede quedar desactualizado respecto a los repositorios oficiales.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/licyk/mizuoto-model
- Repositorio de la herramienta Mizuoto: https://github.com/licyk/Mizuoto
- Licencias del repositorio: https://huggingface.co/licyk/mizuoto-model/blob/main/LICENSES.md
- Origenes citados en la model card: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B, https://huggingface.co/SWivid/F5-TTS, https://huggingface.co/fishaudio/drama-3, https://huggingface.co/IndexTeam/IndexTTS-2, https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base, https://huggingface.co/openai/whisper-large-v3-turbo, https://huggingface.co/iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch, https://huggingface.co/lj1995/GPT-SoVITS, https://huggingface.co/k2-fsa/OmniVoice, https://huggingface.co/nvidia/bigvgan_v2_22khz_80band_256x, https://huggingface.co/funasr/campplus, https://huggingface.co/amphion/MaskGCT, https://huggingface.co/facebook/w2v-bert-2.0
- Papers, blogs y demos: no disponibles en la informacion proporcionada.
