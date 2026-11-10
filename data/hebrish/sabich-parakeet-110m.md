# Hebrish/Sabich-Parakeet-110M

## Resumen

Sabich-Parakeet-110M es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario Hebrish y publicado en Hugging Face. Se trata de un fine-tuning del modelo `nvidia/parakeet-tdt_ctc-110m`, una red FastConformer de 110 millones de parametros que combina decodificacion TDT (Token-and-Duration Transducer) y CTC en una misma arquitectura. El modelo original de NVIDIA esta optimizado para transcripcion en ingles con latencia baja, y esta variante anade adaptacion a hablante, vocabulario tecnico y cierta cobertura de hebreo e ingles irlandes, segun los tags del repositorio.

El objetivo declarado del autor es ofrecer un modelo de dictado y transcripcion que funcione en dispositivo (on-device), con soporte para cambio de codigo (code-switching) entre ingles y hebreo y para vocabulario tecnico especializado. El modelo se distribuye bajo licencia CC-BY-4.0, aunque el acceso esta restringido: es necesario aceptar condiciones en Hugging Face para descargar los pesos. El repositorio ocupa aproximadamente 0,5 GB y se carga mediante la libreria NeMo de NVIDIA.

La relevancia de esta ficha radica en que se trata de un modelo pequeno (110M) pensado para inferencia local, lo que lo hace atractivo para aplicaciones de dictado en tiempo real, asistentes de voz y transcripcion en entornos con recursos limitados. No obstante, la informacion publica disponible es escasa: no hay datos de benchmarks, ni detalles sobre el dataset de fine-tuning mas alla de las referencias a `danielrosehill/Read-Aloud-Voice-Sentences` y `openslr/librispeech_asr`, ni documentacion sobre el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT + CTC (transducer hifrido) |
| Parametros totales | 110 millones (aproximado, segun nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), hebreo (he); tags adicionales mencionan ingles irlandes |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (repositorio NeMo, probablemente `.nemo` o safetensors; no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer, una variante eficiente del Conformer que reduce el coste computacional mediante subsampling de las secuencias de entrada. Sobre esta base, NVIDIA implementa en `parakeet-tdt_ctc-110m` una cabeza de decodificacion dual: un transductor TDT (Token-and-Duration Transducer), que predice tanto el token como su duracion, y una salida CTC auxiliar. Esta combinacion permite decodificacion rapida y robusta, y es la misma que emplea la familia Parakeet de NVIDIA para ASR en ingles.

En cuanto al entrenamiento de esta variante, la informacion disponible es limitada. Los tags indican fine-tuning sobre `nvidia/parakeet-tdt_ctc-110m` con datasets como `danielrosehill/Read-Aloud-Voice-Sentences` y `openslr/librispeech_asr`, y mencionan adaptacion a hablante (speaker-adaptation), vocabulario tecnico y code-switching ingles-hebreo. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en ASR). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de las propias de FastConformer.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles y hebreo, con posible cambio de codigo entre ambos.
- Transcripcion de dictado y voz leida, orientada a vocabulario tecnico.
- Adaptacion a hablante (speaker-adaptation), segun los tags del repositorio.
- Decodificacion TDT y CTC, lo que permite cierta flexibilidad en el pipeline de inferencia.
- Orientado a ejecucion en dispositivo (on-device) por su tamano reducido.
- No se documentan capacidades de traduccion, diarizacion, puntuacion automatica ni timestamps a nivel de palabra.
- No se documenta soporte de tool calling ni de agentes (no aplica a un modelo ASR).

## Casos de uso

- Dictado en tiempo real en aplicaciones de escritorio o moviles: con 110M de parametros, el modelo puede ejecutarse en CPU o GPU integrada y ofrecer transcripcion de voz a texto con latencia baja, adecuado para editores de texto o notas de voz.
- Transcripcion de reuniones tecnicas en ingles: el vocabulario tecnico y la adaptacion a hablante pueden mejorar la precision en jerga de ingenieria, aunque no se documenta soporte de diarizacion.
- Asistentes de voz locales para entornos con privacidad estricta: al ser un modelo pequeno y ejecutable on-device, permite transcribir sin enviar audio a la nube.
- Subtitulado automatizado de contenido en ingles o hebreo: util para creadores que necesitan transcripciones rapidas sin infraestructura GPU dedicada.
- Prototipado de pipelines ASR con NeMo: al ser un fine-tuning de un modelo NVIDIA, se integra en el ecosistema NeMo para experimentacion e investigacion.
- Aplicaciones de accesibilidad: dictado por voz para usuarios con movilidad reducida, con la ventaja de funcionar localmente y sin dependencia de servicios externos.
- Investigacion en code-switching ingles-hebreo: el modelo puede servir como base para estudiar transcripcion bilingue, aunque no hay benchmarks publicados que validen su rendimiento en este escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 110M de parametros, la inferencia en precision FP16 requiere del orden de 0,2-0,5 GB de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: NeMo (libreria oficial), con posibilidad de exportacion a ONNX u otros formatos, aunque no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sabich-Parakeet-110M | 110M | No disponible | en, he | CC-BY-4.0 | Gated en Hugging Face |
| nvidia/parakeet-tdt_ctc-110m | 110M | No disponible | en | CC-BY-4.0 (segun modelo base) | Publico en Hugging Face |
| Whisper small (OpenAI) | 244M | 30 s de audio | Multilingue | MIT | Publico en Hugging Face |
| Whisper base (OpenAI) | 74M | 30 s de audio | Multilingue | MIT | Publico en Hugging Face |

La comparativa con Whisper es orientativa: Whisper es un modelo encoder-decoder con cobertura multilingue amplia, mientras que Parakeet esta optimizado para ingles y, en esta variante, para hebreo. No se dispone de datos de rendimiento comparativo (WER) en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- Informacion muy escasa: no hay benchmarks, ni detalles de entrenamiento, ni documentacion de WER, lo que dificulta evaluar su calidad real.
- Cobertura limitada de idiomas: solo ingles y hebreo segun los tags, con menciones a ingles irlandes; no es un modelo multilingue general.
- Riesgo de alucinacion en ASR: como cualquier modelo de transcripcion, puede generar texto plausible pero incorrecto en audio ruidoso o con acentos no vistos.
- Sesgos desconocidos: no se documenta la composicion del dataset de fine-tuning ni posibles sesgos de hablante, genero o acento.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero al ser un fine-tuning de un modelo NVIDIA, conviene revisar las condiciones del modelo base.
- Sin garantias de produccion: al no haber benchmarks ni validacion externa, no se recomienda su uso en produccion sin una evaluacion previa con datos propios.
- Formato de pesos no confirmado: la integracion con herramientas como vLLM o llama.cpp no esta documentada; el ecosistema natural es NeMo.

## Enlaces

- [Hugging Face: Hebrish/Sabich-Parakeet-110M](https://huggingface.co/Hebrish/Sabich-Parakeet-110M)
- [Modelo base: nvidia/parakeet-tdt_ctc-110m](https://huggingface.co/nvidia/parakeet-tdt_ctc-110m)
- [Dataset: danielrosehill/Read-Aloud-Voice-Sentences](https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences)
- [Dataset: openslr/librispeech_asr](https://huggingface.co/datasets/openslr/librispeech_asr)
- [Libreria NeMo (NVIDIA)](https://github.com/NVIDIA/NeMo)
