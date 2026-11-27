# jssaluja/rumble-2-flash-punjabi-sggs-ncer-train-196509-epochs-3-test-2246

## Resumen

Rumble-2-Flash-Punjabi-SGGS-NCER es un modelo de reconocimiento automatico del habla (ASR) obtenido mediante ajuste fino supervisado del modelo base Reson8/Rumble-2-Flash. Lo publica el usuario jssaluja en Hugging Face y esta especializado, a tenor del nombre del repositorio, en transcripcion de audio en punyabi vinculado al corpus SGGS (Sri Guru Granth Sahib) y a la convencion de escritura NCER. El modelo resuelve la tarea de convertir senal de audio en texto para ese dominio concreto, un escenario donde los sistemas ASR genericos suelen rendir peor por la mezcla de registro religioso, transliteraciones y variantes ortograficas.

Tecnicamente se trata de un modelo basado en la arquitectura Qwen3-ASR (etiqueta `qwen3_asr` en el repositorio), con 508.631.552 parametros totales (aproximadamente 0,5 mil millones) y pesos distribuidos en safetensors y ONNX. El repositorio ocupa 3,8 GB, lo que sugiere que incluye tanto los pesos en precision nativa como exportaciones cuantizadas o en formato ONNX para inferencia.

Su relevancia es acotada pero clara: es un ejemplo de especializacion de un modelo ASR abierto para una lengua de bajos recursos como el punyabi, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, la documentacion es practicamente inexistente (la model card es la generada automaticamente por el Trainer) y no se han publicado resultados de evaluacion, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer encoder-decoder para reconocimiento de voz) |
| Parametros totales | 508.631.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y ONNX; no se detallan variantes) |
| Idiomas soportados | punyabi (inferido del nombre del repositorio); no declarados en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo parte de Reson8/Rumble-2-Flash, un modelo etiquetado como `qwen3_asr`, lo que indica una arquitectura de tipo transformer orientada a ASR derivada de la familia Qwen3. Con 508 millones de parametros se situa en la gama media-baja de los modelos ASR modernos, lo que facilita su despliegue en hardware modesto. El repositorio contiene pesos en safetensors y exportaciones ONNX, lo que apunta a un uso previsto tanto en pipelines de transformers como en inferencia optimizada.

El entrenamiento fue un ajuste fino supervisado con los hiperparametros registrados por el Trainer: learning rate de 2e-05, batch size de entrenamiento de 2 con acumulacion de gradientes de 8 (batch efectivo de 16), optimizador AdamW (betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal con 737 pasos de warmup, semilla 42 y 3 epocas. No se documenta el numero de tokens de audio, la composicion del dataset ni si hubo etapas de RLHF o DPO; la model card indica explicitamente "unknown dataset" y "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento. Las versiones de framework empleadas fueron Transformers 5.20.1, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en punyabi, segun la especializacion indicada por el nombre del repositorio.
- Procesamiento de audio vinculado al dominio SGGS/NCER, es decir, registro religioso y convenciones ortograficas especificas.
- Exportacion ONNX, lo que permite inferencia fuera del ecosistema PyTorch (ONNX Runtime, servidores compatibles).
- Compatibilidad con la libreria transformers (`pipeline: automatic-speech-recognition`).
- Etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con los endpoints de inferencia de Hugging Face.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo, razonamiento multi-paso ni modo "thinking".
- Cobertura multilingue: no disponible; solo se infiere punyabi.

## Casos de uso

- Transcripcion de grabaciones religiosas: el modelo puede convertir discursos, lecturas o recitaciones del Sri Guru Granth Sahib en texto, aprovechando su ajuste fino sobre el dominio SGGS/NCER para manejar vocabulario y ortografia especializados.
- Archivado y busqueda de audio historico: digitalizar colecciones de audio en punyabi y generar transcripciones indexables para busqueda textual posterior en bibliotecas o archivos comunitarios.
- Subtitulado automatico de contenido en punyabi: generar subtitulos para videos, clases o sermons con un modelo ligero de 0,5 mil millones de parametros que puede ejecutarse en servidores modestos.
- Investigacion linguistica y corpus: producir transcripciones normalizadas segun la convencion NCER para estudios de linguistica computacional del punyabi.
- Asistentes de voz para comunidades punyabiparlantes: integrar el modelo como etapa ASR en un pipeline de voz a texto dentro de aplicaciones de accesibilidad o atencion comunitaria.
- Prototipado y evaluacion de ASR de bajos recursos: servir como punto de partida para experimentos de ajuste fino adicional o como referencia en comparaciones de modelos ASR especializados en lenguas indoarias.
- Despliegue en entornos con recursos limitados: gracias a su tamano de 508 millones de parametros y a la exportacion ONNX, puede ejecutarse en CPU o GPU de gama media para tareas de transcripcion por lotes.

## Benchmarks y rendimiento

El model-index del repositorio declara una entrada con la lista de resultados vacia:

| Benchmark | Resultado |
|---|---|
| (ninguno declarado) | sin datos |

No se han publicado resultados de benchmarks (WER, CER u otras metricas ASR) en la informacion disponible. La model card no incluye seccion de resultados de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16: aproximadamente 1 GB para los pesos (508 millones de parametros), mas memoria para activaciones y buffers de audio; en la practica, entre 2 y 4 GB segun longitud de audio y batch.
- En cuantizacion de 8 bits: en torno a 0,5-1 GB de pesos; en 4 bits, alrededor de 0,3 GB. No se documentan variantes GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4). Para lotes grandes o baja latencia, A10G, L4 o A100.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, entre otras.
- Opciones de despliegue: transformers con `pipeline("automatic-speech-recognition")`, ONNX Runtime (por la presencia de pesos ONNX), y servidores compatibles con la API de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Rumble-2-Flash-Punjabi-SGGS-NCER (este) | 508 M | no disponible | Apache 2.0 | Ajuste fino de Rumble-2-Flash para punyabi/SGGS; sin benchmarks publicados |
| Reson8/Rumble-2-Flash (base) | no disponible | no disponible | no disponible | Modelo base del que deriva; cobertura multilingue general |
| Whisper (variantes small/medium) | 244 M / 769 M | 30 s de audio por ventana | MIT | ASR multilingue generico de OpenAI; no especializado en punyabi ni SGGS |
| Modelos ASR de Qwen (Qwen3-ASR) | variable | no disponible | variable | Familia de la que procede la arquitectura; cobertura multilingue amplia |

La comparacion es aproximada: no hay datos publicos de WER para este modelo que permitan una confrontacion cuantitativa con Whisper u otras alternativas. La ventaja principal de este modelo es la especializacion de dominio y la licencia permisiva; su desventaja, la ausencia total de evaluacion publicada.

## Limitaciones y advertencias

- Ausencia de evaluacion: no hay resultados de WER/CER publicados, por lo que se desconoce su calidad real frente a alternativas genericas.
- Documentacion minima: la model card es la generada automaticamente por el Trainer y no describe datos, usos previstos ni limitaciones.
- Dominio muy restringido: el ajuste fino sobre SGGS/NCER puede degradar el rendimiento en punyabi coloquial, otros dialectos o registros ajenos al corpus de entrenamiento.
- Riesgo de alucinacion en ASR: como todo modelo de transcripcion, puede producir texto plausible pero incorrecto, especialmente con audio ruidoso, acentos no vistos o vocabulario fuera de dominio.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, dialectales o religiosos.
- Cobertura idiomatica limitada: no se declaran idiomas oficialmente; el uso fuera del punyabi no esta respaldado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base Reson8/Rumble-2-Flash antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion independiente.
- Modelo creado con fecha futura en los metadatos (2026-11-26), lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jssaluja/rumble-2-flash-punjabi-sggs-ncer-train-196509-epochs-3-test-2246
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Perfil del autor: https://huggingface.co/jssaluja
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
