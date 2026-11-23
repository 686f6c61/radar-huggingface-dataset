# Hebrish/Jachnun

## Resumen

Jachnun es un modelo de reconocimiento automatico del habla (ASR) especializado en *code-switching* entre hebreo e ingles, es decir, en transcribir conversaciones en las que los hablantes alternan entre ambos idiomas dentro de una misma frase. Se trata de un ajuste fino (fine-tune) del modelo NVIDIA Parakeet TDT 0.6B v2, desarrollado por el usuario Hebrish, y esta pensado para cubrir un hueco que los sistemas ASR monolingues no resuelven bien: el habla mixta hebreo-ingles, muy comun en contextos tecnologicos, academicos y de diaspora.

El modelo parte de la arquitectura Parakeet TDT (Token-and-Duration Transducer) de NVIDIA, con aproximadamente 600 millones de parametros, y anade adaptacion al hablante (*speaker adaptation*) como tecnica destacada. El repositorio ocupa 2.5 GB y se distribuye bajo licencia CC-BY-4.0, con acceso restringido (gated) que requiere aceptar las condiciones en Hugging Face.

Es relevante ahora porque el code-switching sigue siendo un punto debil de los ASR comerciales y open source, y porque reutiliza un backbone solido y bien documentado (Parakeet) en lugar de entrenar desde cero, lo que abarata el despliegue. No obstante, la informacion publica disponible es limitada: no hay benchmarks publicados ni documentacion extensa sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), derivada de NVIDIA Parakeet TDT 0.6B v2 |
| Parametros totales | ~0.6B (600 millones, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en), hebreo (he), con soporte de code-switching entre ambos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repositorio NeMo, 2.5 GB; probablemente .nemo/.ckpt, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en Parakeet TDT, una arquitectura transducer que predice conjuntamente tokens y duraciones, lo que permite un alineamiento mas eficiente que los CTC clasicos y suele traducirse en mejor rendimiento en ASR. Al ser un fine-tune de `nvidia/parakeet-tdt-0.6b-v2`, hereda el backbone preentrenado de NVIDIA y anade adaptacion al dominio del code-switching hebreo-ingles.

En cuanto a los datos de entrenamiento, los tags del repositorio mencionan varios datasets: `danielrosehill/Read-Aloud-Voice-Sentences`, `danielrosehill/English-Hebrew-Codeswitching-Sentences`, `Hebrish/English-Hebrew-Mixed-Sentences` y `openslr/librispeech_asr`. No se especifica el numero de horas, la composicion exacta ni si hubo etapas de RLHF o DPO (para ASR no es lo habitual). La innovacion tecnica declarada es la *speaker adaptation*, aunque no se detalla el mecanismo concreto.

## Capacidades

- Transcripcion de voz a texto (ASR) en hebreo, ingles y habla mixta hebreo-ingles.
- Manejo de *code-switching* intra-frase, el caso de uso central del modelo.
- Adaptacion al hablante (*speaker adaptation*), segun los tags del repositorio.
- Compatible con la libreria NeMo de NVIDIA para inferencia y fine-tuning.
- Capacidades de tool calling, agentes, vision o audio multimodal: no disponibles (es un modelo puramente ASR).
- Capacidades multilingues limitadas a en y he; no se declaran otros idiomas.

## Casos de uso

- Transcripcion de reuniones tecnologicas en Israel: equipos que hablan hebreo e ingles mezclados pueden obtener transcripciones coherentes sin segmentar manualmente por idioma, gracias al entrenamiento especifico en code-switching.
- Subtitulado de contenido audiovisual bilingue: podcasts, webinars y videos donde los ponentes alternan idiomas; el modelo evita los errores tipicos de ASR monolingue al cambiar de lengua.
- Atencion al cliente en empresas israelies: transcripcion de llamadas donde el cliente mezcla hebreo e ingles, para analitica de calidad y cumplimiento.
- Investigacion linguistica sobre code-switching: generacion de corpus transcritos para estudiar patrones de alternancia de codigo, aprovechando el ajuste especifico al fenomeno.
- Documentacion clinica o legal bilingue: dictado de notas en consultas o declaraciones donde el hablante alterna idiomas, con la ventaja de un unico modelo en lugar de dos pipelines.
- Prototipado rapido con NeMo: al ser un fine-tune de Parakeet, se integra en flujos existentes de NVIDIA NeMo y permite experimentar con adaptacion al hablante sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~0.6B en fp16 se puede estimar en torno a 1.5-2.5 GB de pesos, mas overhead de activaciones y decodificacion.
- GPU recomendadas: no disponibles en la documentacion; por tamano, cabria esperar buen funcionamiento en GPUs consumer modernas (RTX 3060/4060 en adelante), aunque no esta confirmado.
- Cabe en GPU consumer: probablemente si, dado el tamano de ~0.6B, pero no hay confirmacion oficial.
- Opciones de despliegue: NeMo (libreria declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible (son herramientas orientadas a LLM, no a este tipo de ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Code-switching | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hebrish/Jachnun | ~0.6B | en, he | Si (objetivo principal) | CC-BY-4.0 | Gated en HF |
| nvidia/parakeet-tdt-0.6b-v2 | ~0.6B | en (principalmente) | No especifico | no disponible en la informacion | HF |
| Whisper large-v3 | ~1.55B | multilingue | Parcial, no especializado | MIT (habitual) | Abierto |
| Modelos ASR hebreos monolingues | variable | he | No | variable | variable |

La comparativa con Whisper y modelos hebreos es orientativa; no se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Informacion tecnica escasa: no hay benchmarks, ni detalles de dataset, ni guia de cuantizacion publicados.
- Sesgos conocidos: no documentados; al entrenar sobre datasets especificos (incluido LibriSpeech para ingles), puede heredar sesgos de dominio y acento.
- Riesgo de alucinacion: en ASR se manifiesta como transcripciones plausibles pero incorrectas, especialmente en audio ruidoso o acentos no vistos.
- Limitaciones de idioma: solo en y he; no se declaran otros idiomas ni variantes dialectales.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion, pero conviene verificar las condiciones del modelo base de NVIDIA y de los datasets empleados.
- Caveat para produccion: al ser un fine-tune comunitario con pocas descargas (487) y sin benchmarks, se recomienda validacion exhaustiva en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Jachnun
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Dataset Read-Aloud-Voice-Sentences: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset English-Hebrew-Codeswitching-Sentences: https://huggingface.co/datasets/danielrosehill/English-Hebrew-Codeswitching-Sentences
- Dataset English-Hebrew-Mixed-Sentences: https://huggingface.co/datasets/Hebrish/English-Hebrew-Mixed-Sentences
- Dataset LibriSpeech ASR (OpenSLR): https://huggingface.co/datasets/openslr/librispeech_asr
- DOI: https://doi.org/10.57967/hf/11110
