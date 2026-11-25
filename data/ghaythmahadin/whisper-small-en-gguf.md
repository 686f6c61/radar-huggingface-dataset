# GhaythMahadin/whisper-small.en-gguf

## Resumen

`GhaythMahadin/whisper-small.en-gguf` es una conversión a formato GGUF del modelo `openai/whisper-small.en`, el checkpoint de reconocimiento automático de voz (ASR) en inglés de OpenAI. La conversión está pensada para su uso con transcribe.cpp, un runtime de inferencia en C/C++ derivado del ecosistema llama.cpp y especializado en modelos Whisper. El autor del repositorio es GhaythMahadin y el modelo base procede del commit `e872752` de OpenAI, fijado el 25 de abril de 2026.

El modelo resuelve el problema de transcribir audio en inglés a texto sobre hardware modesto. Con 241.750.624 parámetros, es el checkpoint "small" de la familia Whisper, una arquitectura transformer encoder-decoder que procesa ventanas de 30 segundos y aplica decodificación por trozos para audio de larga duración. Al estar en formato GGUF y cuantizado hasta Q4_K_M, el peso del modelo baja a 164 MB, lo que permite ejecutarlo en CPU, GPU integrada o GPU de consumo.

Su relevancia práctica reside en el equilibrio entre precisión y coste: mantiene un WER de en torno al 3 % en LibriSpeech test-clean incluso con cuantización Q4_K_M, y en el hardware de referencia de la model card alcanza factores de tiempo real (RTF) de 104,4 con Metal en un Apple M4 Max y de 12,8 con Vulkan en un Ryzen 4750U. Es, por tanto, una opción para transcripción local, privada y de baja latencia en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.750.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s con decodificacion por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder de tipo secuencia-a-secuencia. El encoder procesa espectrogramas mel de ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. Whisper fue entrenado por OpenAI sobre 680 000 horas de audio etiquetado mediante supervisión débil a gran escala; los checkpoints en inglés se entrenaron específicamente en la tarea de reconocimiento de voz, no en traducción. La model card no detalla la composición exacta del dataset ni si hubo fases de RLHF o DPO para este checkpoint concreto.

La conversión a GGUF es un proceso de cuantización de los pesos originales, no un reentrenamiento. El autor indica que los pesos se validaron numéricamente contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp. La innovación destacable no está en la arquitectura, sino en el runtime: transcribe.cpp implementa decodificación voraz con supresión de tokens, fallback de temperatura y marcas de tiempo por segmento, y ofrece aceleración por Metal (Apple) y Vulkan (GPU integradas y de consumo). La model card indica que el streaming, la traducción y la detección de idioma no están soportados en esta integración.

## Capacidades

- Transcripción de voz a texto en inglés con salida de marcas de tiempo por segmento.
- Procesamiento de audio de larga duración mediante decodificación por trozos sobre ventanas de 30 segundos.
- Inferencia en CPU, GPU Apple vía Metal y GPU vía Vulkan.
- Cuantizaciones que permiten ejecución en dispositivos con poca memoria (desde 164 MB en Q4_K_M).
- No soporta streaming en tiempo real según la configuración declarada.
- No soporta traducción de voz a otro idioma.
- No soporta detección automática de idioma.
- No es un modelo de propósito general: no hace tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Transcripción local de reuniones y entrevistas: el modelo procesa audio de 16 kHz mono y genera texto con marcas de tiempo por segmento, adecuado para actas y subtítulos en inglés sin enviar datos a la nube.
- Subtitulado de vídeo en inglés: la salida con timestamps por segmento permite generar ficheros de subtítulos alineados con el audio, con la ventaja de que el modelo corre en local y no requiere conexión.
- Dictado y notas de voz en aplicaciones de escritorio: con Q4_K_M (164 MB) cabe en un portátil sin GPU dedicada y ofrece RTF superior a 1 en CPU de referencia, es decir, transcribe más rápido de lo que dura el audio.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: la versión Q8_0 (257 MB) permite desplegar transcripción masiva en contenedores ligeros con transcribe.cpp compilado desde fuente.
- Transcripción en dispositivos con GPU integrada: la ruta Vulkan da un RTF de 12,8 en un Ryzen 4750U, suficiente para transcripción interactiva en equipos de consumo.
- Pipeline de análisis de llamadas de atención al cliente en inglés: el modelo puede alimentar un sistema de extracción de texto previo a análisis de sentimiento o clasificación, ejecutándose en la misma máquina que el resto del pipeline.
- Prototipado e investigación en ASR: al ser una conversión fiel del checkpoint de OpenAI con WER documentado por cuantización, sirve para comparar el efecto de la cuantización en precisión dentro de experimentos reproducibles.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 3,09 | 2,97 | 3,09 | 2,97 | 3,12 | 3,08 |

| Entorno | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 104,4 |
| Apple M4 Max | CPU | 10,3 |
| AMD Ryzen 4750U | Vulkan | 12,8 |
| AMD Ryzen 4750U | CPU | 3,6 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 enunciados) con la decodificación por defecto de transcribe.cpp. OpenAI reporta 3,05 % en el mismo split; la diferencia se atribuye a que la pipeline de transcribe.cpp activa marcas de tiempo mientras que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto. No se han publicado en la información disponible resultados de otros benchmarks como MMLU o HumanEval, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 164 MB (Q4_K_M), 185 MB (Q5_K_M), 202 MB (Q6_K), 257 MB (Q8_0), 470 MB (F16) y 924 MB (F32) solo para los pesos; hay que sumar el overhead del runtime y del buffer de audio.
- Cabe en cualquier GPU de consumo actual y en la mayoría de iGPU; también funciona enteramente en CPU.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; los datos de rendimiento se refieren a Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan).
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 104,4 en Metal (M4 Max), 12,8 en Vulkan (Ryzen 4750U), 10,3 en CPU (M4 Max) y 3,6 en CPU (Ryzen 4750U). Un RTF mayor que 1 indica transcripción más rápida que el tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | WER LibriSpeech test-clean |
|---|---:|---|---|---|---:|
| whisper-small.en (GGUF, este repo) | 241,7 M | en | GGUF | Apache-2.0 | 2,97–3,12 % segun cuantizacion |
| openai/whisper-small.en (original) | 241,7 M | en | safetensors/PyTorch | Apache-2.0 | 3,05 % (reportado por OpenAI) |
| openai/whisper-small (multilingue) | no disponible en la informacion | multilingue | safetensors/PyTorch | Apache-2.0 | no disponible en la informacion |

La comparación con otros modelos ASR de tamaño similar (por ejemplo, variantes de Wav2Vec 2.0 o Conformer) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo transcribe inglés; no admite otros idiomas ni traducción.
- No soporta streaming ni detección automática de idioma en esta integración.
- Riesgo de alucinación en clips cortos o con ruido de fondo; la propia model card señala que las diferencias de ~0,1 pp entre ejecuciones en Metal se deben en buena parte a resultados de alucinación en el suelo de ruido.
- Los resultados de WER proceden de una única ejecución con backend Metal; las reducciones paralelas no deterministas pueden alterar el WER del corpus entre ejecuciones.
- El audio debe convertirse previamente a WAV mono de 16 kHz; no se aceptan otros formatos directamente en la CLI.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene revisar la model card de OpenAI para los términos completos del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.
- La fecha de creación indicada (2026-11-25) es posterior a la fecha de validación mencionada en la model card; conviene verificar la procedencia y el commit exacto antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/whisper-small.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-small.en
- Commit del modelo base referenciado: https://huggingface.co/openai/whisper-small.en/commit/e872752
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página de modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-small.en.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
