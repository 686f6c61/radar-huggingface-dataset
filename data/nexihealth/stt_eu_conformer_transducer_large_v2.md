# NexiHealth/stt_eu_conformer_transducer_large_v2

## Resumen

El modelo `stt_eu_conformer_transducer_large_v2` es un sistema de reconocimiento automático del habla (ASR) especializado en euskera, desarrollado por el grupo HiTZ/Aholab de la Universidad del País Vasco y publicado bajo el identificador de la organización NexiHealth. Se trata de un modelo Conformer-Transducer autorregresivo de aproximadamente 119 millones de parámetros, entrenado con la herramienta NVIDIA NeMo y afinado a partir de un modelo preentrenado en castellano (`stt_es_conformer_transducer_large`). Su propósito es transcribir audio monolingüe en euskera a texto en minúsculas, incluyendo espacios, y está pensado para cubrir una de las lenguas con menos recursos dentro del ámbito de los sistemas ASR comerciales.

La relevancia del modelo reside en su especialización: frente a sistemas multilingües genéricos, este modelo se ha entrenado con un corpus compuesto de 771,73 horas de habla en euskera que combina Common Voice 18.0, el corpus del Parlamento Vasco, OpenSLR y material privado de EITB. Los resultados declarados por el autor en el conjunto de test de Common Voice 18.0 alcanzan un WER del 2,5 %, lo que lo sitúa como una opción muy competitiva para transcripción de euskera en dominios cercanos a los datos de entrenamiento.

El modelo se distribuye con licencia Apache 2.0 y formato nativo NeMo (`.nemo`), lo que facilita su integración en pipelines basados en PyTorch y NVIDIA NeMo, aunque limita su uso directo en entornos que solo admiten GGUF o safetensors. Es una pieza relevante para proyectos de accesibilidad, subtitulado y preservación lingüística del euskera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-Transducer (autorregresiva, con pérdida y decodificación Transducer en lugar de CTC) |
| Parámetros totales | ~119 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR por utterance; no se especifica ventana máxima de audio) |
| Tipos de cuantización | No disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | Euskera (`eu`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.nemo` (checkpoint NeMo sobre PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conformer-Transducer, una variante autorregresiva del Conformer que sustituye la pérdida CTC por una pérdida Transducer (RNN-T). El codificador Conformer combina bloques de autoatención y convoluciones para capturar dependencias locales y globales en la señal acústica, mientras que el decodificador Transducer modela la secuencia de tokens de salida de forma autorregresiva. El modelo se carga en NeMo mediante `EncDecRNNTBPEModel`, lo que indica tokenización por subpalabras (BPE) y decodificación RNNT.

El entrenamiento parte del modelo preentrenado en castellano `stt_es_conformer_transducer_large` y se afina con un corpus compuesto de 771,73 horas de euskera. Ese corpus incluye 675,98 horas del split de entrenamiento de Composite Corpus EU v2.1, que a su vez agrega Common Voice 18.0, el corpus del Parlamento Vasco (`gttsehu/basque_parliament_1`) y OpenSLR, además de datos privados de EITB. No se documentan en la información disponible detalles sobre el uso de RLHF, DPO ni sobre innovaciones adicionales como decodificación especulativa o atención lineal. La entrada es audio mono a 16 kHz en formato WAV y la salida es una cadena de texto en minúsculas del alfabeto vasco.

## Capacidades

- Transcripción de voz a texto en euskera para audio mono a 16 kHz.
- Salida en minúsculas del alfabeto vasco, incluyendo espacios.
- Decodificación autorregresiva Transducer (RNN-T), adecuada para transcripción en streaming o por lotes según la configuración de NeMo.
- Procesamiento por lotes de múltiples archivos de audio mediante el parámetro `batch_size` de la API `transcribe`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente ASR).
- No se documentan capacidades de visión, audio multimodal, diarización ni traducción.
- Capacidad multilingüe limitada al euskera; no se declara soporte de otras lenguas.

## Casos de uso

- Subtitulado automático de contenido audiovisual en euskera: el modelo puede transcribir audio de programas, entrevistas o vídeos corporativos con un WER declarado del 2,5 % en Common Voice 18.0, lo que lo hace adecuado para generar subtítulos con revisión humana posterior.
- Transcripción de sesiones parlamentarias: entrenado con el corpus del Parlamento Vasco y con un WER declarado del 3,78 % en ese dominio, encaja en la digitalización y búsqueda de actas parlamentarias.
- Accesibilidad en administraciones públicas: integración en servicios de atención ciudadana en euskera para convertir consultas de voz en texto y facilitar su enrutamiento o registro.
- Archivado y búsqueda de fondos sonoros: transcripción masiva de archivos de audio históricos o de medios de comunicación (como el material de EITB) para indexación y recuperación por texto.
- Investigación lingüística y corpus orales: generación de transcripciones para estudios fonéticos, sociolingüísticos o de variación dialectal en euskera.
- Asistentes de voz locales: despliegue en entornos con requisitos de soberanía del dato, al ser un modelo de 119 M de parámetros con licencia Apache 2.0 y ejecutable sobre PyTorch/NeMo.
- Evaluación y benchmarking de ASR en lenguas de bajos recursos: referencia para comparar sistemas en euskera con métricas WER sobre Common Voice, Parlamento Vasco y OpenSLR.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Dataset | Split | Métrica | Valor |
|---|---|---|---|
| Mozilla Common Voice 18.0 | test | WER | 2,5 % |
| Basque Parliament (`gttsehu/basque_parliament_1`) | test | WER | 3,78 % |
| OpenSLR (`HiTZ/composite_corpus_eu_v2.1`, `test_oslr`) | test | WER | 11,87 % |
| EITB (privado) | test | WER | 9,17 % |
| Mozilla Common Voice 18.0 (`HiTZ/composite_corpus_eu_v2.1`, `dev_cv`) | dev | WER | 2,28 % |
| Basque Parliament (`HiTZ/composite_corpus_eu_v2.1`, `dev_parl`) | dev | WER | 4,2 % |
| OpenSLR (`HiTZ/composite_corpus_eu_v2.1`, `dev_oslr`) | dev | WER | 11,65 % |
| EITB (privado) | validation | WER | 12,81 % |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~119 M de parámetros, la inferencia en FP32 requiere del orden de 0,5 GB de pesos, y en FP16 alrededor de 0,25 GB, a lo que hay que sumar memoria para activaciones y lote.
- GPU recomendadas: cualquier GPU NVIDIA compatible con PyTorch y NeMo; para producción se sugiere A100, H100 o L4 por su soporte de precisión mixta y mayor throughput en lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares con VRAM ≥ 4 GB, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: NVIDIA NeMo (`nemo_toolkit['all']`) es la vía oficial; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR RNNT en formato `.nemo`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER declarado | Licencia | Formato |
|---|---|---|---|---|---|
| `stt_eu_conformer_transducer_large_v2` (este modelo) | ~119 M | Audio mono 16 kHz | 2,5 % CV18 test; 3,78 % Parlamento | Apache 2.0 | `.nemo` |
| `stt_es_conformer_transducer_large` (NVIDIA, modelo base) | ~119 M (variante large) | Audio mono 16 kHz | No disponible para euskera | No disponible en la información | `.nemo` |
| Alternativas ASR en euskera | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos comparables en euskera, por lo que la comparativa cuantitativa queda limitada al modelo base del que se afinó.

## Limitaciones y advertencias

- Especializado exclusivamente en euskera; no se declara soporte de castellano ni de otras lenguas, pese a derivar de un modelo preentrenado en español.
- Los WER declarados no están verificados de forma independiente (`verified: false` en la model-index).
- El rendimiento cae notablemente en dominios alejados de los datos de entrenamiento: 11,87 % en OpenSLR test y 9,17 % en EITB test, frente al 2,5 % en Common Voice.
- Riesgo de alucinación y de errores en nombres propios, siglas, números y términos técnicos, habitual en modelos ASR entrenados con corpus mayoritariamente leído o parlamentario.
- Sesgos potenciales derivados de la composición del corpus (Common Voice, Parlamento Vasco, OpenSLR, EITB), con posible infrarrepresentación de dialectos, habla espontánea, acentos y registros informales.
- Requiere audio mono a 16 kHz; no se documenta robustez frente a ruido, solapamiento de hablantes ni audio multicanal.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye en formato `.nemo` y depende de NVIDIA NeMo, lo que condiciona el stack de despliegue.
- No se documentan variantes cuantizadas ni soporte en runtimes ligeros, lo que puede limitar el despliegue en entornos sin PyTorch.
- El repositorio tiene un tamaño de 0,5 GB y un número muy bajo de descargas (8) y likes (0), lo que sugiere poca validación comunitaria hasta la fecha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NexiHealth/stt_eu_conformer_transducer_large_v2
- Modelo base en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/stt_es_conformer_transducer_large
- Documentación de NeMo sobre Conformer-Transducer: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#conformer-transducer
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Dataset Composite Corpus EU v2.1: https://huggingface.co/datasets/HiTZ/composite_corpus_eu_v2.1
- Dataset Common Voice 18.0 (euskera): https://commonvoice.mozilla.org/eu/datasets
- Dataset Basque Parliament: https://huggingface.co/datasets/gttsehu/basque_parliament_1
- Paper Conformer (arXiv:2005.08100): https://arxiv.org/abs/2005.08100
