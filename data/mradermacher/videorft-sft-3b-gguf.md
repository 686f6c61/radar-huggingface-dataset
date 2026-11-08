# mradermacher/VideoRFT-SFT-3B-GGUF

## Resumen

VideoRFT-SFT-3B-GGUF es la version cuantizada en formato GGUF del modelo VideoRFT-SFT-3B, un modelo multimodal de 3.397.103.616 parametros (aproximadamente 3,4 mil millones) desarrollado por QiWang98 y afinado a partir de Qwen/Qwen2.5-VL-3B-Instruct. La cuantizacion la ha realizado mradermacher, un autor habitual en la comunidad de Hugging Face especializado en generar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo esta disenado para tareas que combinan video, imagen y texto, e incorpora senales de aprendizaje por refuerzo en su proceso de entrenamiento, segun sugiere el sufijo "RFT" (Reinforcement Fine-Tuning) del nombre.

El modelo base se entrena sobre el dataset QiWang98/VideoRFT-Data y esta pensado para tareas de razonamiento visual sobre video, lo que lo hace relevante para aplicaciones de comprension de video, descripcion de escenas, respuesta a preguntas sobre contenido audiovisual y razonamiento multi-paso con entradas multimodales. Al estar disponible en GGUF, se puede ejecutar en hardware de consumo, lo que democratiza el acceso a un modelo multimodal de 3B con capacidades de video.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que anade atractivo para integraciones en producto. No obstante, la informacion publica disponible es limitada: no se han publicado resultados de benchmarks en la model card ni en los resultados de busqueda, y la mayoria de los detalles tecnicos sobre el entrenamiento y la arquitectura del modelo base no estan documentados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base: Qwen2.5-VL-3B-Instruct) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Qwen/Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un modelo de lenguaje de 3B parametros. La nomenclatura "RFT" sugiere el uso de Reinforcement Fine-Tuning, una tecnica de aprendizaje por refuerzo aplicada sobre el ajuste supervisado (SFT) para mejorar el razonamiento, aunque los detalles exactos del proceso de entrenamiento no estan documentados en la informacion disponible. El dataset utilizado es QiWang98/VideoRFT-Data, orientado a tareas de video y razonamiento visual.

La cuantizacion GGUF realizada por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf). Segun la model card, no se han generado cuantizaciones ponderadas/imatrix en el momento de la publicacion, aunque el autor deja abierta la posibilidad de generarlas si hay demanda. El repositorio incluye archivos mmproj (multi-modal supplement) en Q8_0 y f16, necesarios para procesar las entradas visuales junto con el modelo de lenguaje cuantizado.

## Capacidades

- Generacion de texto y razonamiento multimodal: el modelo combina entrada de video, imagen y texto, heredando las capacidades de Qwen2.5-VL-3B-Instruct.
- Comprension de video: el nombre y el dataset de entrenamiento indican especializacion en tareas de razonamiento sobre contenido audiovisual.
- Razonamiento multi-paso: el sufijo RFT sugiere entrenamiento con refuerzo orientado a mejorar cadenas de razonamiento.
- Soporte de conversacion multi-turno: etiquetado como "conversational" en Hugging Face.
- Capacidades multilingues limitadas al ingles segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de video para moderacion de contenido: el modelo puede procesar fotogramas o clips y generar descripciones textuales que alimenten pipelines de moderacion automatica, aprovechando su especializacion en razonamiento visual sobre video.
- Respuesta a preguntas sobre video (VideoQA): integracion en asistentes que responden preguntas concretas sobre el contenido de un video, como "que ocurre en el minuto 3" o "cuantas personas aparecen", usando el modelo con el mmproj correspondiente.
- Descripcion automatica de escenas para accesibilidad: generacion de descripciones textuales de contenido audiovisual para sistemas de subtitulado descriptivo o audiodescripcion, ejecutables en hardware de consumo gracias a las cuantizaciones Q4_K_M y Q5_K_M.
- Preprocesamiento de datasets de video: uso del modelo para etiquetar o enriquecer grandes colecciones de video con descripciones y metadatos generados, en un servidor con varias GPU o incluso en una sola GPU de 24 GB con cuantizacion Q8_0.
- Prototipado rapido en local con llama.cpp u Ollama: gracias a los archivos GGUF de 2,1-2,5 GB, un desarrollador puede probar el modelo en un portatil con GPU integrada o una RTX 3060 antes de decidir si escala a la version completa en safetensors.
- Investigacion en aprendizaje por refuerzo multimodal: el modelo sirve como referencia para estudiar el efecto del RFT sobre el rendimiento en tareas de video, comparando el modelo afinado con el Qwen2.5-VL-3B-Instruct original.
- Generacion de resumenes de reuniones o clases grabadas: el modelo puede procesar el video y producir un resumen textual de los puntos clave, aprovechando su capacidad de razonamiento sobre secuencias visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni mmproj): Q2_K ~1,5 GB; Q3_K_M ~1,8 GB; Q4_K_M ~2,2 GB; Q5_K_M ~2,5 GB; Q6_K ~2,9 GB; Q8_0 ~3,7 GB; f16 ~6,9 GB. A estos valores hay que sumar el mmproj (0,9-1,4 GB) y la memoria para el contexto y las activaciones.
- GPU recomendadas: para cuantizaciones Q4-Q5, una GPU de 8 GB (RTX 3060 Ti, RTX 4060) es suficiente; para Q8_0 o f16, se recomienda 12-16 GB (RTX 4070 Ti, RTX 4080). Para despliegue en produccion con varias peticiones concurrentes, A100 o H100 ofrecen mayor margen.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas con 8 GB o mas usando Q4_K_M o Q5_K_M; en GPUs integradas o Apple Silicon con memoria unificada tambien es viable con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (sujeto a soporte de Qwen2.5-VL).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de 3B en Q4_K_M en una RTX 4090 suele generar decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VideoRFT-SFT-3B-GGUF | 3,4B | no disponible | apache-2.0 | GGUF | Fine-tuning de Qwen2.5-VL-3B con RFT sobre video |
| Qwen2.5-VL-3B-Instruct | 3,75B (aprox., segun variante) | no disponible en la informacion | apache-2.0 | safetensors | Modelo base original, sin fine-tuning especifico de video |
| mradermacher/VideoRFT-3B-GGUF | no disponible | no disponible | no disponible | GGUF | Variante cuantizada del modelo VideoRFT-3B (posiblemente sin SFT) |

La comparativa con alternativas de la misma categoria (modelos multimodales de ~3B para video) no puede completarse con datos verificables a partir de la informacion proporcionada; los datos de contexto y rendimiento de los modelos comparados no estan disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar de Qwen2.5-VL, es probable que arrastre sesgos del corpus de entrenamiento original, pero no hay evaluacion publicada.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo de 3B, es propenso a inventar detalles en descripciones de video, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_S).
- Limitaciones de contexto e idioma: el modelo solo declara soporte de ingles; la longitud de contexto no esta documentada y puede verse reducida por el proceso de cuantizacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (Qwen2.5-VL-3B-Instruct) y del dataset QiWang98/VideoRFT-Data antes de un despliegue en produccion.
- Caveats para produccion: las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior. No hay cuantizaciones imatrix disponibles, lo que puede afectar la calidad frente a alternativas ponderadas. El modelo no ha sido validado con benchmarks publicos, por lo que su rendimiento real frente a Qwen2.5-VL-3B-Instruct es desconocido. La fecha de actualizacion del repositorio (2026-11-08) es posterior a la de creacion, lo que sugiere posibles revisiones no documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VideoRFT-SFT-3B-GGUF
- Modelo base: https://huggingface.co/QiWang98/VideoRFT-SFT-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/QiWang98/VideoRFT-Data
- Modelo original Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Variante VideoRFT-3B-GGUF: https://huggingface.co/mradermacher/VideoRFT-3B-GGUF
- Pagina de conveniencia del autor: https://hf.tst.eu/model#VideoRFT-SFT-3B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
