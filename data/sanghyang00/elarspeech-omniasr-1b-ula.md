# Sanghyang00/ELARSpeech-OmniASR-1B-ula

## Resumen

ELARSpeech-OmniASR-1B-ula es un modelo de reconocimiento automatico del habla (ASR) especializado en fungwa (codigo ISO 639-3 `ula`), una lengua minoritaria de la familia niger-congo hablada en Nigeria. Lo publica el usuario Sanghyang00 (Sangmin Lee) dentro del proyecto ELARSpeech, una iniciativa que recopila un corpus de aproximadamente 30.000 horas repartidas entre 675 lenguas infrarrepresentadas con el objetivo de extender las tecnologias de voz a idiomas de cola larga que los sistemas comerciales no cubren.

El modelo parte del checkpoint aadel4/omniASR-CTC-1B-v2, una variante CTC del proyecto Omnilingual ASR de Meta (facebookresearch/omnilingual-asr), y se ha afinado mediante fine-tuning supervisado para el idioma fungwa. La arquitectura es `Wav2Vec2ForCTC`, un transformer convolucional orientado a clasificacion temporal (CTC) sobre características acusticas. Cuenta con 975.681.460 parametros reales (alrededor de 1.000 millones) y un repositorio de 3,9 GB en formato safetensors.

Su relevancia radica en que aborda un nicho practico: la mayoria de los 7.000 idiomas del mundo carecen de soporte ASR, y este tipo de adaptaciones monoidioma sobre un backbone multilingue permiten construir cobertura de voz para lenguas sin recursos. El modelo se distribuye con la libreria `transformers` y es compatible con endpoints de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (transformer convolucional con cabecera CTC) |
| Parametros totales | 975.681.460 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR de audio; ventana definida por el encoder, no documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fungwa (ISO 639-3: ula) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es `Wav2Vec2ForCTC`, implementada sobre la libreria `transformers`. Wav2Vec2 es un modelo de representacion del habla auto-supervisado que combina un extractor de caracteristicas convolucional con un encoder transformer; la variante CTC anade una cabecera de clasificacion temporal que permite transcribir audio a secuencias de tokens sin alineacion previa. La longitud de contexto y las dimensiones internas del encoder no estan documentadas en la informacion disponible.

El entrenamiento consiste en un fine-tuning del checkpoint base aadel4/omniASR-CTC-1B-v2, que a su vez es una variante CTC del proyecto Omnilingual ASR de Meta Research. Segun la model card, el artefacto exportado se valida contra el checkpoint ELARSpeech original sobre un conjunto fijo de evaluacion, con estado de verificacion de transcripcion exacta "PASS". El modelo forma parte del proyecto ELARSpeech, cuyo corpus agrupa alrededor de 30.000 horas en 675 lenguas infrarrepresentadas. No se detallan en la informacion proporcionada el numero de tokens de audio, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (poco habituales en ASR).

## Capacidades

- Reconocimiento automatico del habla (ASR) en fungwa: convierte audio mono a 16 kHz en transcripcion de texto.
- Transcripcion fonetica/orotografica mediante decodificacion CTC (argmax de logits) y `batch_decode`.
- Procesamiento por lotes de audio mediante el `AutoProcessor` de la libreria `transformers`.
- Modelo monoidioma especializado: no soporta traduccion ni otros idiomas mas alla del fungwa.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio multimodal.
- No se ha documentado modo "thinking" ni capacidades generativas de texto libre.

## Casos de uso

- Transcripcion de archivos de audio en fungwa: el modelo recibe audio mono a 16 kHz y devuelve la transcripcion, util para digitalizar grabaciones de campo o materiales orales.
- Documentacion linguistica: investigadores que trabajan sobre lenguas minoritarias pueden transcribir corpus orales para estudios fonologicos, morfologicos o lexicograficos.
- Preservacion de patrimonio oral: conversion a texto de narrativas, cantos o testimonios en fungwa para archivos digitales accesibles.
- Subtitulado automatizado de contenido audiovisual en fungwa: generar subtitulos para videos o grabaciones comunitarias donde no existe ASR comercial.
- Construccion de corpus paralelos: combinar la transcripcion ASR con traduccion manual para crear datasets de entrenamiento de mayor tamano.
- Asistencia a hablantes y ONG: herramientas de dictado o busqueda por voz en contextos donde los asistentes comerciales no reconocen el idioma.
- Investigacion en ASR de cola larga: servir como punto de partida para comparativas y experimentos de fine-tuning sobre otras lenguas del corpus ELARSpeech.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el artefacto exportado supera una verificacion de transcripcion exacta ("PASS") frente al checkpoint ELARSpeech original sobre un conjunto fijo de evaluacion, pero no se aportan cifras de WER, CER ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 975 millones de parametros, en precision fp32 se requieren aproximadamente 3,9 GB solo para los pesos (dato coherente con el tamano de repositorio de 3,9 GB); en fp16/bf16 alrededor de 2 GB.
- GPU recomendadas: una unica GPU consumer de gama media-alta (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; para lotes grandes o produccion se recomiendan A100 o H100.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU con al menos 4-6 GB de VRAM.
- Opciones de despliegue: al ser un modelo `transformers` con pesos safetensors, es compatible con Hugging Face Transformers, Text Generation Inference solo parcialmente (es ASR, no generativo), y potencialmente con ONNX Runtime o TorchScript tras conversion; tambien se puede servir mediante el endpoint de inferencia de Hugging Face (tag `endpoints_compatible`). Las opciones especificas para llama.cpp, Ollama o vLLM no estan documentadas para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma(s) | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-OmniASR-1B-ula | 975.681.460 | Fungwa (ula) | Wav2Vec2ForCTC | no disponible | Hugging Face |
| ELARSpeech-OmniASR-1B-abz | no disponible | Abui (abz) | Wav2Vec2ForCTC (presumible) | no disponible | Hugging Face |
| aadel4/omniASR-CTC-1B-v2 (modelo base) | ~1B (presumible) | multilingue | CTC sobre Omnilingual ASR | no disponible | Hugging Face |
| Omnilingual ASR (Meta) | 300M, 1B, 3B, 7B | multilingue (long-tail) | híbrido CTC/LLM-ASR | no disponible | GitHub / Hugging Face |

No se dispone de resultados de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: unicamente reconoce fungwa; no soporta otros idiomas ni traduccion.
- La precision puede variar segun las condiciones de grabacion, la poblacion de hablantes, la ortografia empleada y el dominio del audio.
- El audio de entrada debe ser mono y estar remuestreado a 16 kHz; no procesar asi puede degradar la transcripcion.
- Riesgo de alucinacion o sustituciones propias de los sistemas CTC en segmentos ruidosos o con habla solapada (no documentado explicitamente, pero inherente a la arquitectura).
- Licencia no disponible: se desconoce si permite uso comercial. La model card remite a la documentacion del proyecto ELARSpeech para los terminos del dataset y al repositorio del modelo base para su licencia y cita.
- Se solicita citar ELARSpeech y el modelo base aadel4/omniASR-CTC-1B-v2 en cualquier uso.
- Perfil de adopcion minimo: 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita el despliegue en entornos de muy bajos recursos sin conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-ula
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
- Repositorio ELARSpeech en GitHub: https://github.com/sanghyang00/elarspeech
- Perfil del autor en Hugging Face: https://huggingface.co/Sanghyang00
- Modelo hermano (abui): https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-abz
- Repositorio Omnilingual ASR de Meta: https://github.com/facebookresearch/omnilingual-asr
- Paper Omnilingual ASR (arXiv 2511.09690): https://arxiv.org/abs/2511.09690
