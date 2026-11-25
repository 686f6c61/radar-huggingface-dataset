# GhaythMahadin/moonshine-base-uk-gguf

## Resumen

moonshine-base-uk-gguf es la conversion a formato GGUF del modelo de reconocimiento automatico del habla UsefulSensors/moonshine-base-uk, realizada por GhaythMahadin para su uso con la libreria transcribe.cpp. Se trata de un modelo encoder-decoder de tipo transformer con 61.513.920 parametros (aproximadamente 62M), especializado en transcripcion de audio en ucraniano. La relevancia de esta publicacion radica en que permite ejecutar un sistema ASR ligero en C++ sin depender del ecosistema Python, con cuantizaciones que reducen el peso del modelo hasta 74 MB en Q8_0.

El modelo hereda la arquitectura Moonshine base: consume PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, y emite unicamente texto transcrito. Es un modelo monoidioma (uc), sin capacidad de traduccion, deteccion de idioma ni generacion de marcas temporales. La licencia MIT facilita su integracion en productos comerciales.

Esta ficha se centra en la version GGUF distribuida por GhaythMahadin, aunque los datos de arquitectura y evaluacion proceden en gran medida de la model card del autor de la conversion y del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine base), stem Conv1d de 3 capas sobre PCM 16 kHz |
| Parametros totales | 61.513.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificacion: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Moonshine base, un transformer encoder-decoder disenado para ASR que procesa audio PCM crudo a 16 kHz a traves de un stem convolucional de tres capas Conv1d, prescindiendo de STFT y de banco de filtros mel. La salida es exclusivamente texto transcrito, con decodificacion greedy por defecto (num_beams=1, max_length=192), en linea con la generation_config del modelo original.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. Se sabe que el modelo base UsefulSensors/moonshine-base-uk es un ajuste fino de Moonshine base sobre ucraniano, y que la conversion GGUF se realizo a partir del commit a52b2e9 del repositorio upstream, fijado el 2026-05-12, y se valido contra la referencia de transformers en el commit 90bf720 de transcribe.cpp. La evaluacion se realizo sobre el split de test de FLEURS-uk con 750 enunciados.

## Capacidades

- Transcripcion de voz a texto en ucraniano a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesado espectral (sin STFT ni mel filterbank), lo que simplifica el pipeline.
- Decodificacion greedy con max_length de 192 tokens.
- No soporta streaming (streaming: false).
- No soporta traduccion (translate: false).
- No realiza deteccion de idioma (lang_detect: false).
- No genera marcas temporales (timestamps: none).
- No dispone de tool calling ni capacidades de agente.
- No dispone de modo thinking, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y entrevistas en ucraniano: el modelo convierte grabaciones mono a 16 kHz en texto plano, adecuado para actas y resumenes posteriores, con un peso de solo 74 MB en Q8_0.
- Subtitulado offline de contenido audiovisual ucraniano: al no generar timestamps, se usaria para obtener el texto y un alineador externo para sincronizar los subtitulos.
- Integracion en aplicaciones de escritorio o moviles en C++: la libreria transcribe.cpp y el formato GGUF permiten desplegar el modelo sin runtime de Python, con latencias RTF de 79,5 en Metal (M4 Max) y 34,5 en Vulkan (Ryzen 4750U).
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el modelo funciona en CPU con RTF de 22 en Ryzen 4750U, lo que permite transcripciones masivas con hardware modesto.
- Sistemas de dictado por voz en ucraniano: la baja huella de memoria (126 MB en F16) permite ejecutarlo en dispositivos con recursos limitados.
- Preprocesado de corpus de voz para investigacion en PLN: transcripcion de datasets ucranianos para construir corpus textuales anotados, con un WER de referencia del 14,39% en FLEURS-uk con Q8_0.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER FLEURS-uk test (%) | 14,49 | 14,49 | 14,39 |
| Tamano (MB) | 236 | 126 | 74 |
| RTF Metal (M4 Max) | 79,5 | 79,5 | 79,5 |
| RTF Vulkan (Ryzen 4750U) | 34,5 | 34,5 | 34,5 |
| RTF CPU (Ryzen 4750U) | 22 | 22 | 22 |

Referencia de transformers F32 sobre MPS: 14,51% WER. Los valores de RTF se presentan en la model card como valores unicos para el modelo, sin desglose por cuantizacion. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (236 MB en F32, 126 MB en F16, 74 MB en Q8_0).
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon con Metal y en GPUs integradas o dedicadas con Vulkan.
- Cabe en cualquier GPU de consumo e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: transcribe.cpp (unica libreria soportada segun la model card), con backend Metal, Vulkan y CPU.
- Latencia y throughput: RTF de 79,5 en Metal (M4 Max), 34,5 en Vulkan (Ryzen 4750U) y 22 en CPU (Ryzen 4750U). Un RTF mayor indica mayor velocidad de procesado respecto al tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| moonshine-base-uk-gguf | 61,5M | no disponible | uk | MIT | GGUF |
| moonshine-base (original) | 62M | no disponible | en | MIT | safetensors |
| UsefulSensors/moonshine-base-uk | 61,5M | no disponible | uk | MIT | safetensors |
| Whisper small | 244M | 1500 frames | multilingue | MIT | safetensors, GGUF |

La comparacion con Whisper small se ofrece como referencia de categoria ASR, aunque no se dispone de resultados de benchmarks comparativos en la informacion proporcionada. El modelo destaca frente a alternativas multilingues por su menor tamano y su integracion en C++ mediante transcribe.cpp.

## Limitaciones y advertencias

- Modelo monoidioma: solo transcribe ucraniano; no soporta otros idiomas ni deteccion automatica.
- No genera marcas temporales, lo que limita su uso directo en subtitulado sincronizado.
- No soporta streaming ni traduccion.
- WER de referencia del 14,39% en FLEURS-uk, lo que implica un margen de error apreciable en produccion.
- Riesgo de alucinacion en audio ruidoso o con acentos no representados en el corpus de entrenamiento; la model card no documenta sesgos especificos.
- Requiere audio mono a 16 kHz; es necesario remuestrear con herramientas externas como ffmpeg.
- La licencia MIT permite uso comercial, pero se recomienda consultar la model card upstream para los terminos completos.
- Dependencia de transcribe.cpp: no hay soporte documentado para otros runtimes como llama.cpp u Ollama.
- La model card original del modelo base contiene campos sin completar ("More Information Needed") sobre datos de entrenamiento y sesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-base-uk-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-uk
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-base-uk/commit/a52b2e9
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentacion de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Descarga F32: https://huggingface.co/handy-computer/moonshine-base-uk-gguf/resolve/main/moonshine-base-uk-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-base-uk-gguf/resolve/main/moonshine-base-uk-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-base-uk-gguf/resolve/main/moonshine-base-uk-Q8_0.gguf
- Paper de referencia citado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
