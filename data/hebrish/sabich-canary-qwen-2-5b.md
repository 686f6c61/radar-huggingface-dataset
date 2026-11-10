# Hebrish/Sabich-Canary-Qwen-2.5B

## Resumen

Sabich-Canary-Qwen-2.5B es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla NVIDIA Canary-Qwen-2.5B, publicado por el usuario Hebrish en Hugging Face. El modelo parte de la arquitectura NeMo SpeechLM de NVIDIA y ha sido adaptado para transcripcion en ingles e hebreo, con enfasis en code-switching (alternancia de idiomas dentro de una misma frase), vocabulario tecnico y dictado. El repositorio tiene acceso restringido y requiere aceptar condiciones en Hugging Face antes de la descarga.

El modelo resuelve un problema concreto: la transcripcion de audio que mezcla ingles y hebreo, un escenario poco cubierto por los sistemas ASR genericos, y la adaptacion al hablante (speaker adaptation) para mejorar la precision en dictado. Con 2.559.447.568 parametros (aproximadamente 2,5 mil millones) y un peso de repositorio de 5,1 GB, se posiciona en la gama media de modelos ASR basados en LLM, lo que permite despliegues en hardware relativamente modesto comparado con sistemas ASR de mayor tamano.

Es relevante ahora porque los modelos SpeechLM (que combinan un encoder de audio con un modelo de lenguaje) estan desplazando a los ASR clasicos en tareas de transcripcion con contexto, y porque la combinacion ingles-hebreo con vocabulario tecnico es un nicho practico para equipos que trabajan en entornos bilingues. La licencia CC-BY-4.0 facilita su uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo SpeechLM (canary-qwen / speechlm2, encoder de audio + LLM Qwen) |
| Parametros totales | 2.559.447.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), hebreo (he); menciona irish-english y code-switching |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (libreria NeMo) |

## Arquitectura y entrenamiento

El modelo se basa en la familia NeMo SpeechLM de NVIDIA, concretamente en la variante canary-qwen, que combina un encoder de audio con un modelo de lenguaje Qwen para realizar reconocimiento automatico del habla. Los tags del repositorio indican `nemo_speechlm`, `speechlm2` y `salm` (speech-augmented language model), lo que confirma una arquitectura hibrida audio-texto en lugar de un ASR clasico tipo CTC o transducer. El modelo base es `nvidia/canary-qwen-2.5b`, y este ajuste fino parte de el.

Los datos de entrenamiento incluyen el dataset `danielrosehill/Read-Aloud-Voice-Sentences` y `openslr/librispeech_asr`, segun los tags del repositorio. El enfasis declarado esta en speaker adaptation, dictado, vocabulario tecnico y code-switching ingles-hebreo. No se dispone de informacion sobre el numero de tokens de audio utilizados, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles y hebreo.
- Transcripcion con code-switching: manejo de frases que alternan ingles y hebreo.
- Adaptacion al hablante (speaker adaptation) para mejorar la precision en dictado.
- Reconocimiento de vocabulario tecnico especializado.
- Procesamiento de audio de lectura en voz alta (read-aloud) segun el dataset de entrenamiento.
- Soporte de irish-english segun los tags del repositorio.
- No se ha documentado soporte de tool calling, agentes, vision ni audio generation; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones bilingues ingles-hebreo: el modelo puede transcribir conversaciones donde los hablantes alternan entre ambos idiomas, gracias a su entrenamiento especifico en code-switching, evitando la perdida de segmentos que sufren los ASR monoidioma.
- Dictado profesional en hebreo con terminos tecnicos: adecuado para profesionales que dictan documentacion tecnica mezclando terminologia inglesa, ya que el ajuste fino incorpora vocabulario tecnico y speaker adaptation.
- Subtitulado de contenido audiovisual en entornos de habla hebrea con prestamos del ingles: el modelo puede generar subtitulos para videos donde aparecen terminos tecnicos en ingles dentro de discurso en hebreo.
- Documentacion clinica o legal dictada: la adaptacion al hablante y el vocabulario tecnico permiten transcribir dictados especializados, aunque requiere validacion humana por el riesgo de alucinacion.
- Atencion al cliente en centros de soporte bilingues: transcripcion de llamadas donde el cliente mezcla hebreo e ingles, para su posterior analisis o registro.
- Investigacion linguistica sobre code-switching: el modelo sirve como herramienta para transcribir corpus de habla mezclada y estudiar patrones de alternancia de codigo.
- Accesibilidad: transcripcion de audio para personas con discapacidad auditiva en comunidades bilingues ingles-hebreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,56 mil millones de parametros, en FP16 requeriria aproximadamente 5,1 GB solo para pesos, mas memoria para el encoder de audio y el cache de activaciones (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamano, una GPU consumer con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080) podria ser suficiente en FP16, pero no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si, en GPUs con al menos 8 GB de VRAM, aunque no esta verificado.
- Opciones de despliegue: NeMo (libreria oficial del modelo); no se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo SpeechLM con encoder de audio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Sabich-Canary-Qwen-2.5B | 2,56 B | no disponible | en, he | CC-BY-4.0 | Restringido (gated) |
| nvidia/canary-qwen-2.5b (base) | ~2,5 B | no disponible | en (principalmente) | no disponible en la informacion | Publico en HF |
| Whisper large-v3 | ~1,55 B | 30 s de audio | multilingue (99 idiomas) | MIT | Publico |
| Whisper large-v3-turbo | ~0,81 B | 30 s de audio | multilingue | MIT | Publico |

La comparativa con Whisper es orientativa: Whisper es un ASR clasico encoder-decoder sin LLM, con cobertura multilingue amplia pero sin ajuste especifico para code-switching ingles-hebreo. No se dispone de datos de rendimiento comparativo entre Sabich-Canary-Qwen-2.5B y estos modelos.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Cobertura limitada de idiomas: solo ingles y hebreo (con mencion a irish-english); no es un modelo multilingue general.
- Riesgo de alucinacion: como modelo SpeechLM basado en LLM, puede generar texto no presente en el audio, especialmente en segmentos ruidosos o con acentos no vistos en entrenamiento.
- Sesgos desconocidos: no se ha documentado la composicion demografica del dataset de entrenamiento, por lo que el rendimiento puede variar segun el hablante.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion, pero el modelo base (nvidia/canary-qwen-2.5b) puede tener sus propias condiciones que conviene revisar.
- Documentacion escasa: el repositorio no detalla contexto, cuantizaciones ni requisitos de hardware, lo que dificulta su evaluacion en produccion.
- Uso en produccion: requiere validacion humana en dominios sensibles (medico, legal) por el riesgo de errores de transcripcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Sabich-Canary-Qwen-2.5B
- Modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b
- Dataset Read-Aloud-Voice-Sentences: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- DOI: https://doi.org/10.57967/hf/11178
