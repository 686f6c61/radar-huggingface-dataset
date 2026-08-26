# chaumi-k/qwen2audio-carnatic-swara

## Resumen

`qwen2audio-carnatic-swara` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por chaumi-k sobre el modelo base Qwen/Qwen2-Audio-7B-Instruct, un modelo de lenguaje y audio de gran escala creado por Alibaba Cloud. El adaptador está diseñado para especializar el modelo en el reconocimiento y análisis de swaras (notas musicales) dentro del contexto de la música carnática, un género clásico del sur de India. Aunque la model card no especifica el dataset de entrenamiento, la pérdida de validación final de 1.9799 sugiere que el ajuste fino se realizó sobre una tarea de generación de texto condicionada por audio.

El adaptador tiene un tamaño de 0.2 GB y se distribuye en formato safetensors con la librería PEFT, lo que permite cargarlo como un módulo adicional sobre el modelo base sin necesidad de reentrenar todos los parámetros. Su relevancia radica en que ofrece una vía eficiente para adaptar un modelo de audio-lenguaje de propósito general a un dominio musical específico, con un coste computacional reducido. Al estar basado en Qwen2-Audio-7B-Instruct, hereda las capacidades de comprensión de audio y generación de texto del modelo original, aunque el adaptador se centra en la tarea de swaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2-Audio-7B-Instruct (transformer decoder con encoder de audio) |
| Parametros totales | No disponible (el adaptador tiene 0.2 GB; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 128k tokens segun su documentacion) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Qwen2-Audio-7B-Instruct, que combina un encoder de audio (inicializado a partir de Whisper-large-v2) con un modelo de lenguaje transformer decoder de 7B parámetros. El adaptador LoRA introduce matrices de bajo rango en las capas de atención y feed-forward del modelo base, permitiendo un ajuste fino eficiente sin modificar todos los pesos. El entrenamiento se realizó con PEFT 0.20.0 y Transformers 5.16.1, utilizando un learning rate de 0.0001, batch size de 1 con acumulación de gradientes de 16 pasos (batch efectivo de 16), scheduler coseno con 1 paso de warmup y 3 épocas. El dataset de entrenamiento no está documentado, pero la pérdida de validación descendió de 1.9691 en la época 1 a 1.9799 en la época 3, lo que indica una convergencia estable aunque con una mejora marginal.

No se han publicado detalles sobre la composición del dataset ni sobre técnicas de alineación como RLHF o DPO. El adaptador se entrena para la tarea de generación de texto a partir de audio, presumiblemente transcripción o análisis de swaras, pero la falta de información impide confirmar el enfoque exacto.

## Capacidades

- Generacion de texto condicionada por audio: el adaptador hereda la capacidad del modelo base para procesar señales de audio y producir respuestas textuales, especializandose en el dominio de swaras carnáticas.
- Comprension de audio general: al estar basado en Qwen2-Audio-7B-Instruct, puede manejar diversos tipos de audio (voz, música, sonidos ambientales) y responder a instrucciones en texto.
- Interaccion conversacional: el modelo base soporta dos modos de interaccion (chat de voz y chat de texto), que el adaptador puede aprovechar para tareas de analisis musical.
- Capacidades multilingues: el modelo base soporta varios idiomas, aunque el adaptador no especifica restricciones adicionales.
- No se confirma soporte de tool calling, agentes o razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Transcripcion de swaras en musica carnática: el adaptador puede utilizarse para convertir grabaciones de audio en notacion de swaras (Sa, Ri, Ga, Ma, Pa, Dha, Ni), facilitando la documentacion de interpretaciones musicales.
- Analisis de ragas: dado un fragmento de audio, el modelo puede identificar la raga (escala melódica) y describir sus caracteristicas, ayudando a musicologos y estudiantes.
- Asistente de practica musical: un sistema que escuche la interpretacion del usuario y proporcione retroalimentacion sobre la precision de las swaras, basandose en la capacidad del modelo para comparar audio con expectativas teoricas.
- Generacion de descripciones de audio: el adaptador puede generar resúmenes textuales de piezas musicales carnáticas, indicando estructura, tempo y ornamentos, util para catalogacion de archivos.
- Educacion musical interactiva: integrado en una aplicacion educativa, el modelo puede responder preguntas sobre swaras y ragas a partir de ejemplos de audio, ofreciendo explicaciones contextualizadas.
- Investigacion etnomusicologica: los investigadores pueden usar el adaptador para transcribir y analizar grandes volumenes de grabaciones carnáticas, acelerando el estudio comparativo de estilos y tradiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card declara una lista de resultados vacia, y no hay datos de evaluacion estandar como MMLU, HumanEval o GSM8K. La unica metrica reportada es la perdida de validacion (1.9799), que no es comparable con otros modelos sin contexto adicional.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si requiere muy poca memoria adicional (0.2 GB), pero el modelo base Qwen2-Audio-7B-Instruct necesita aproximadamente 14-16 GB de VRAM en precision FP16 para cargar los pesos completos. Con cuantizacion (por ejemplo, 4-bit) se puede reducir a unos 4-6 GB.
- GPU recomendadas: para una experiencia fluida, se recomienda una GPU con al menos 16 GB de VRAM, como NVIDIA RTX 3090, RTX 4090, A100 o H100. En GPUs de 8 GB (como RTX 3070) solo seria viable con cuantizacion agresiva.
- Compatibilidad con consumer GPU: si, es posible ejecutar el modelo en GPUs de consumo con 16 GB o mas, siempre que se aplique cuantizacion o se utilice offloading de CPU.
- Opciones de despliegue: el adaptador se puede cargar con la libreria Transformers de HuggingFace, y el modelo base es compatible con vLLM y TGI para inferencia optimizada. Para despliegue local, llama.cpp u Ollama pueden ser opciones, aunque el soporte de audio puede requerir configuracion adicional.
- Latencia y throughput: no se dispone de datos concretos. En una GPU A100, el modelo base puede generar alrededor de 20-30 tokens por segundo en FP16, pero la latencia depende del tamaño del audio de entrada y de la longitud de la respuesta.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores LoRA para audio musical. Como referencia, se puede comparar con el modelo base Qwen2-Audio-7B-Instruct y con otros modelos de audio-lenguaje como Whisper-large-v3 (solo transcripcion) o SALMONN (modelo de audio-lenguaje de 7B). La siguiente tabla resume las diferencias principales:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen2audio-carnatic-swara (adaptador) | 0.2 GB (adaptador) | No disponible | Apache-2.0 | Swaras carnáticas |
| Qwen2-Audio-7B-Instruct | 7B | 128k (documentado) | Apache-2.0 | Audio-lenguaje general |
| Whisper-large-v3 | 1.5B | 30s de audio | MIT | Transcripcion de voz |
| SALMONN | 7B | No disponible | Apache-2.0 | Audio-lenguaje general |

El adaptador se distingue por su especializacion en un dominio musical concreto, mientras que los otros modelos son de proposito general. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica el origen ni la composicion de los datos, lo que dificulta evaluar la generalizacion del adaptador a otros estilos o grabaciones.
- Riesgo de sobreajuste: con solo 12 pasos de entrenamiento (3 épocas sobre un dataset no especificado), el adaptador podria estar sobreajustado a las caracteristicas especificas del conjunto de datos, limitando su rendimiento en audio fuera de ese dominio.
- Alucinaciones: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de transcripcion musical donde la precision es critica.
- Limitaciones del modelo base: el adaptador hereda las limitaciones de Qwen2-Audio-7B-Instruct, como posibles sesgos en el reconocimiento de acentos o idiomas no representados en su entrenamiento.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los terminos del modelo base y del adaptador para asegurar el cumplimiento.
- Falta de documentacion: la model card es generada automaticamente y carece de detalles sobre el proposito exacto, los casos de uso previstos y las limitaciones especificas del adaptador.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/chaumi-k/qwen2audio-carnatic-swara
- Modelo base Qwen2-Audio-7B-Instruct: https://huggingface.co/Qwen/Qwen2-Audio-7B-Instruct
- Repositorio oficial de Qwen2-Audio: https://github.com/QwenLM/Qwen2-Audio
- Documentacion de Transformers para Qwen2Audio: https://huggingface.co/docs/transformers/main/en/model_doc/qwen2_audio
- Technical report de Qwen2-Audio: https://arxiv.org/html/2407.10759v1
