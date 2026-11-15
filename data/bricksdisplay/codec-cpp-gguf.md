# BricksDisplay/codec.cpp-gguf

## Resumen

codec.cpp-gguf es un repositorio de pesos en formato GGUF para codecs neuronales de audio, empaquetados para su uso con [codec.cpp](https://github.com/mybigday/codec.cpp), una implementación en C/C++ inspirada en llama.cpp que permite codificar y descodificar audio en tokens discretos de forma totalmente offline, tanto en CPU como en GPU. El repositorio, mantenido por el usuario BricksDisplay, no contiene un modelo único sino tres codecs distintos (IBM DAC.speech v1.0, NVIDIA NeMo Nano Codec y WavTokenizer large), cada uno en varias precisiones de cuantización.

El problema que resuelve es el de la tokenización de audio para pipelines de modelos generativos: los codecs convierten voz en secuencias de tokens discretos y viceversa, lo que constituye la base de los sistemas TTS y de modelos de audio basados en LM. Al ofrecer los pesos en GGUF, se elimina la dependencia de frameworks pesados como PyTorch y se habilita el despliegue en entornos con recursos limitados.

El tamaño total del repositorio es de 4,9 GB, aunque el mayor de los modelos individuales ronda los 74 millones de parámetros (dato de safetensors). La licencia es heterogénea: cada codec conserva la suya propia (CDLA-Permissive-2.0 para DAC.speech, NVIDIA Open Model License para NeMo Nano Codec y MIT para WavTokenizer).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codec neuronal de audio (encoder/decoder con cuantización vectorial residual); arquitectura interna específica por codec, no disponible |
| Parámetros totales | 73.885.617 (dato de safetensors; corresponde al mayor de los modelos del repo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los codecs operan sobre ventanas de audio, no sobre contexto textual) |
| Tipos de cuantización | F16 (sin sufijo), F32, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponible (los codecs procesan señal de audio, no texto) |
| Licencia | per-codec: DAC.speech CDLA-Permissive-2.0, NeMo Nano Codec NVIDIA Open Model License, WavTokenizer MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio agrupa tres codecs neuronales de audio con características distintas. IBM DAC.speech v1.0 opera a 24 kHz con una tasa de 75 frames por segundo; NVIDIA NeMo Nano Codec trabaja a 22,05 kHz con una tasa muy baja de 12,5 frames por segundo (equivalente a 0,6 kbps); WavTokenizer large (speech) opera a 24 kHz con 75 tokens por segundo. Los tres siguen el paradigma de encoder-cuantizador-decodificador propio de los codecs neuronales, con cuantización vectorial residual para producir tokens discretos.

No se dispone de información sobre el número de horas de entrenamiento, la composición del dataset ni si se aplicaron técnicas de refinamiento posteriores en la información proporcionada. La innovación principal del repositorio no reside en los codecs en sí, sino en su empaquetado en GGUF y en la implementación codec.cpp, que permite ejecutarlos en C/C++ sin dependencias de Python ni PyTorch, con soporte de CPU y GPU.

## Capacidades

- Codificación de voz a tokens discretos (encode) y reconstrucción de audio a partir de tokens (decode).
- Tres codecs con compromisos distintos entre tasa de tokens y calidad: DAC.speech (75 fps, mayor fidelidad), WavTokenizer (75 tokens/s) y NeMo Nano Codec (12,5 fps, 0,6 kbps, máxima compresión).
- Ejecución offline en CPU o GPU mediante codec.cpp.
- Interfaz de línea de comandos (`codec-cli`) para encode/decode con ficheros WAV y matrices NumPy.
- API de Python (`codec_cpp`) con objetos de contexto para encode/decode.
- Integración como componente de audio en pipelines TTS: un backbone LM en llama.cpp genera los códigos y codec.cpp los convierte en audio.
- Múltiples precisiones (F16, F32, Q8_0, Q5_K_M, Q4_K_M) para ajustar calidad, velocidad y memoria.

## Casos de uso

- Tokenización de audio para TTS: el codec convierte la salida de un modelo de lenguaje (secuencia de códigos) en waveform; es el componente de descodificación de los repos TTS `*-GGUF` de la misma organización.
- Compresión de voz a muy bajo bitrate: NeMo Nano Codec a 0,6 kbps permite almacenar o transmitir voz con un ancho de banda mínimo, útil en comunicaciones con restricciones severas.
- Preprocesado de datasets de audio: convertir grandes corpus de voz a tokens discretos para entrenar modelos generativos de audio sin mantener los WAV originales.
- Procesamiento en dispositivos sin Python: codec.cpp permite ejecutar encode/decode en C/C++ embebido, útil en entornos de producción ligeros o sistemas empotrados.
- Reconstrucción y análisis de audio: descodificar tokens para verificar la calidad de la cuantización con distintas precisiones (F16 frente a Q4_K_M) antes de fijar un pipeline.
- Experimentación con vocoders y codecs: comparar DAC.speech, WavTokenizer y NeMo Nano Codec sobre el mismo audio para elegir el compromiso adecuado entre tasa de tokens y fidelidad.
- Integración en pipelines de voz a voz: encadenar un ASR, un LM y el codec para construir sistemas conversacionales completamente offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 73,9 millones de parámetros, los pesos en F16 ocupan aproximadamente 148 MB, en Q8_0 unos 74 MB y en Q4_K_M unos 40 MB (estimación a partir del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponible; el repositorio no especifica modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño de los codecs, aunque no hay confirmación en la información proporcionada.
- Opciones de despliegue: codec.cpp (CLI `codec-cli` y bindings de Python `codec_cpp`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tasa de tokens | Frecuencia de muestreo | Licencia | Formato |
|---|---|---|---|---|---|
| IBM DAC.speech v1.0 (en este repo) | No disponible | 75 fps | 24 kHz | CDLA-Permissive-2.0 | GGUF |
| NVIDIA NeMo Nano Codec (en este repo) | No disponible | 12,5 fps (0,6 kbps) | 22,05 kHz | NVIDIA Open Model License | GGUF |
| WavTokenizer large speech (en este repo) | No disponible | 75 tokens/s | 24 kHz | MIT | GGUF |

No se dispone de datos de rendimiento comparativo entre estos codecs ni frente a alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- La licencia es heterogénea: cada codec conserva su licencia original, por lo que el uso comercial debe verificarse codec a codec (la NVIDIA Open Model License impone condiciones específicas).
- No hay información sobre sesgos acústicos, cobertura de idiomas ni dominios de audio soportados.
- Riesgo de artefactos y pérdida de calidad en las cuantizaciones más agresivas (Q4_K_M, Q5_K_M); el autor recomienda F16.
- Los codecs no son modelos generativos de texto: no admiten tool calling, agentes ni razonamiento multi-step; su función es exclusivamente la conversión audio-tokens.
- El repositorio no documenta límites de duración de audio ni comportamiento en streams largos.
- No se han publicado métricas objetivas de calidad (PESQ, STOI, MUSHRA) en la información disponible.
- El pipeline de Hugging Face figura como no disponible, lo que limita la integración con herramientas estándar del ecosistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BricksDisplay/codec.cpp-gguf
- Repositorio codec.cpp: https://github.com/mybigday/codec.cpp
- Instrucciones de Python de codec.cpp: https://github.com/mybigday/codec.cpp/blob/main/python/README.md
- IBM DAC.speech v1.0: https://huggingface.co/ibm-research/DAC.speech.v1.0
- NVIDIA NeMo Nano Codec: https://huggingface.co/nvidia/nemo-nano-codec-22khz-0.6kbps-12.5fps
- WavTokenizer large speech: https://huggingface.co/novateur/WavTokenizer-large-speech-75token
- Licencia del repositorio: https://huggingface.co/BricksDisplay/codec.cpp-gguf#license
