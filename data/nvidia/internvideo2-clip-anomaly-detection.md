# nvidia/InternVideo2-CLIP-anomaly-detection

## Resumen

InternVideo2-CLIP-anomaly-detection es un modelo de embeddings video-texto publicado por NVIDIA dentro del ecosistema TAO (`video_clip`). Se trata de un fine-tune del modelo OpenGVLab InternVideo2-CLIP-L14 en el que la torre de visión se adapta mediante LoRA y la torre de texto se sustituye por un codificador MobileCLIP-B-LT congelado, de Apple. El resultado es un espacio de embedding compartido de 512 dimensiones que permite comparar directamente un clip de vídeo con una descripción textual.

El modelo resuelve dos tareas concretas: recuperación texto-a-vídeo (ranking de clips candidatos para una consulta en lenguaje natural) y clasificación de acciones zero-shot comparando embeddings de vídeo con descripciones de clases. El ajuste se ha realizado sobre el subconjunto de entrenamiento de NVIDIA PhysicalAI-Event-Videos, un dataset orientado a vídeo del mundo físico (almacén, retail, tráfico y actividad general), lo que lo hace relevante para evaluar sistemas de búsqueda de eventos en colecciones de vigilancia y operaciones.

La relevancia prática viene acompañada de una restricción importante: la licencia es la NVIDIA Internal Scientific Research and Development Model License y el modelo se libera exclusivamente para investigación no comercial. No genera texto ni cajas delimitadoras; su salida es un embedding. Con aproximadamente 373 millones de parámetros y artefactos en safetensors, ONNX y TensorRT, está pensado para prototipos e investigación, no para productos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer: vision encoder ViT-L/14 (24 bloques, parches de 14 px, ancho oculto 1.024, 16 cabezas) + text encoder MobileCLIP-B-LT congelado, con proyección visual y capa de alineamiento a un espacio compartido de 512 dimensiones |
| Parametros totales | 372.752.640 segun safetensors; la model card indica 373.342.467, de los cuales 589.824 son parametros LoRA (excluye teacher de preservacion y estado del optimizador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de embeddings de clips; no se especifica el numero maximo de frames por clip) |
| Tipos de cuantizacion | no disponible en la informacion; el repositorio distribuye safetensors, ONNX y motores TensorRT generados con TAO Deploy |
| Idiomas soportados | no disponible (no se documenta cobertura multilingue del text encoder) |
| Licencia | NVIDIA Internal Scientific Research and Development Model License (solo investigacion, no comercial). Componentes: Apache 2.0 (InternVideo2-CLIP-L14), Apple Machine Learning Research Model License (MobileCLIP-B-LT) y MIT (tokenizer CLIP) |
| Formato de pesos | safetensors, ONNX y TensorRT |
| Dimension del embedding | 512 |
| Tamano del repositorio | 8,2 GB |
| Fecha de publicacion | 11/03/2026 segun la model card (repositorio de HuggingFace actualizado el 23/10/2026) |
| Descargas / likes | 98 / 14 |
| Libreria declarada | tensorrt |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer de dos torres. La torre visual es el encoder InternVideo2-CLIP-L14, un ViT de 24 bloques con parches espaciales de 14 píxeles, ancho oculto de 1.024 y 16 cabezas de atención; una capa de proyección y alineamiento traduce las características visuales al espacio de texto. La torre de texto es MobileCLIP-B-LT, congelada y sin modificar durante este fine-tune, y ambas torres comparten un espacio de embedding de 512 dimensiones. El ajuste emplea LoRA sobre los módulos `qkv` y `proj` de los últimos 12 bloques de visión (la model card se interrumpe en este punto y no detalla el rango ni el resto de hiperparámetros).

El entrenamiento se realizó sobre el subconjunto de train de NVIDIA PhysicalAI-Event-Videos, con regularización de preservación para limitar el olvido catastrófico respecto al modelo base. La evaluación de retrieval se hace sobre el subconjunto de test del mismo dataset, y Kinetics-400 se reporta por separado como benchmark de dominio general. No se especifican en la información disponible el número de tokens vistos, el volumen de clips, la composición detallada del dataset ni si hubo etapas de alineamiento adicionales; tampoco aplica RLHF ni DPO, al tratarse de un modelo contrastivo de embeddings y no de un modelo generativo.

## Capacidades

- Generación de embeddings de vídeo y de texto en un espacio compartido de 512 dimensiones, aptos para similitud coseno y búsqueda por vecino más cercano.
- Recuperación texto-a-vídeo: ordenar clips candidatos según su similitud con una consulta en lenguaje natural.
- Clasificación de acciones zero-shot: comparar el embedding de un clip con descripciones textuales de clases de acción, sin entrenar un clasificador específico.
- Detección de anomalías por similitud semántica entre clips y descripciones de eventos; la salida es una puntuación de similitud, no una probabilidad calibrada.
- Adaptación al dominio de vídeo del mundo físico (almacén, retail, tráfico y actividad general) gracias al fine-tune sobre PhysicalAI-Event-Videos.
- Exportación y despliegue acelerado mediante ONNX y TensorRT a través del pipeline TAO Deploy.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, ni generación de texto, captioning o detección de objetos.

## Casos de uso

- Búsqueda de eventos en archivos de vídeo de almacén: indexar los embeddings de todos los clips y resolver consultas como "persona manipulando una caja en la estantería" mediante similitud vectorial, sin etiquetas manuales por clip.
- Triaje de anomalías en vigilancia industrial: comparar los embeddings de clips con descripciones de eventos anómalos y usar la puntuación como señal candidata para revisión humana, con un umbral ajustado por aplicación.
- Clasificación zero-shot de acciones en footage de tráfico: definir las clases mediante prompts textuales y reutilizar el mismo modelo cuando cambie el conjunto de clases, evitando reentrenar un clasificador.
- Pre-filtrado en pipelines de anotación: reducir el volumen de clips que llegan a los anotadores, ordenando por relevancia respecto a una consulta y descartando los de menor similitud.
- Auditoría y revisión de grabaciones de retail: localizar clips que coincidan con descripciones concretas para investigación de incidentes o análisis operativo.
- Deduplicación y agrupamiento de clips: usar los embeddings como representación para clustering y detección de contenido repetido en grandes colecciones de vídeo.
- Prototipado e investigación en recuperación vídeo-texto: evaluar arquitecturas de búsqueda y estrategias de prompting sobre un modelo con exportación a TensorRT ya resuelta.
- Señal auxiliar en sistemas de seguridad asistida: generar candidatos que un operador valida, nunca como decisión autónoma.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que se evaluó el retrieval sobre el subconjunto de test de PhysicalAI-Event-Videos y que Kinetics-400 se reporta como benchmark de dominio general, pero no incluye las cifras.

| Benchmark | Conjunto | Resultado |
|---|---|---|
| Retrieval texto-a-vídeo | PhysicalAI-Event-Videos (test) | no disponible |
| Clasificación de acciones | Kinetics-400 | no disponible |
| Clasificación zero-shot | PhysicalAI-Event-Videos (test) | no disponible |

## Requisitos de hardware

- VRAM para inferencia (estimación a partir de 373 M de parámetros, solo pesos): unos 1,5 GB en FP32, 0,75 GB en FP16/BF16 y 0,37 GB en INT8. El consumo real de activaciones depende del número de frames, la resolución y el tamaño de lote, y no está documentado.
- GPU de datacenter recomendadas: NVIDIA A100, H100, L40S o L4; el modelo es pequeño para estos aceleradores y el cuello de botella será el decodificado y preprocesado de vídeo, no la inferencia.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB es viable con lotes pequeños y FP16.
- Opciones de despliegue: TensorRT mediante TAO Deploy (ruta soportada oficialmente), ONNX Runtime con el modelo exportado, y PyTorch con el backend `tao_pytorch_backend`. No aplica soporte de vLLM, TGI, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El repositorio incluye artefactos TensorRT y ONNX orientados a reducir la latencia de inferencia, pero no se publican medidas.

## Comparativa con modelos similares

No se han proporcionado datos de rendimiento ni especificaciones completas de modelos alternativos de retrieval vídeo-texto, por lo que la comparación se limita a los componentes documentados.

| Modelo | Parametros | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| InternVideo2-CLIP-anomaly-detection | 372.752.640 (589.824 LoRA) | clips de vídeo y texto; límite de frames no disponible | NVIDIA Internal Scientific Research and Development Model License (no comercial) | HuggingFace, 98 descargas | Vision encoder L14 adaptado con LoRA y text encoder MobileCLIP-B-LT congelado; embedding de 512 dimensiones |
| OpenGVLab InternVideo2-CLIP-L14 (base) | no disponible en la informacion | clips de vídeo y texto | Apache 2.0 | HuggingFace y GitHub de OpenGVLab | Mismo vision encoder, sin fine-tune de dominio ni LoRA; su torre de texto no es MobileCLIP |
| Apple MobileCLIP-B-LT (text encoder) | no disponible en la informacion | texto | Apple Machine Learning Research Model License | GitHub de apple-aiml-research | Solo torre de texto; en este modelo permanece congelada |

## Limitaciones y advertencias

- Licencia restrictiva: uso exclusivo para investigación no comercial. No está permitido su uso en productos o servicios comerciales según los términos de NVIDIA.
- El modelo no está validado como sistema autónomo de decisión de seguridad. Las puntuaciones de similitud no son prueba de que un evento haya ocurrido ni probabilidades calibradas; requieren evaluación específica por aplicación.
- La salida es un embedding, no un caption, una caja delimitadora, una identidad ni una etiqueta de evento. Cualquier decisión requiere un componente downstream (umbral, clasificador, revisión humana).
- Sesgo y dominio: el fine-tune se limita a PhysicalAI-Event-Videos, centrado en almacén, retail, tráfico y actividad general. El comportamiento fuera de esos dominios no está documentado y puede degradarse.
- No se documenta evaluación de sesgos demográficos ni de equidad, un riesgo relevante en vídeo de personas.
- Cobertura lingüística no documentada: no se confirma soporte multilingüe del text encoder; las consultas en idiomas distintos del inglés podrían rendir peor.
- Riesgo de falsos positivos y falsos negativos en retrieval y en detección de anomalías; la similitud semántica puede pasar por alto eventos sutiles o confundir acciones visualmente parecidas.
- Restricciones heredadas: el text encoder MobileCLIP-B-LT está bajo Apple Machine Learning Research Model License (solo investigación) y el tokenizer bajo MIT; el uso combinado debe respetar todas las licencias.
- El repositorio ocupa 8,2 GB por incluir pesos, ONNX y motores TensorRT, lo que complica su distribución en entornos con almacenamiento limitado.
- No dispone de pipeline declarado en HuggingFace ni de idiomas documentados; la integración requiere usar TAO o cargar manualmente los artefactos exportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/InternVideo2-CLIP-anomaly-detection
- Dataset NVIDIA PhysicalAI-Event-Videos: https://huggingface.co/datasets/nvidia/PhysicalAI-Event-Videos
- Repositorio OpenGVLab InternVideo: https://github.com/OpenGVLab/InternVideo
- Pesos de destilación de InternVideo2: https://huggingface.co/OpenGVLab/InternVideo2_distillation_models
- MobileCLIP (Apple): https://github.com/apple-aiml-research/ml-mobileclip
- Licencia de modelos de MobileCLIP: https://github.com/apple-aiml-research/ml-mobileclip/blob/main/LICENSE_MODELS
- TAO `video_clip` overview: https://docs.nvidia.com/tao/tao-toolkit/latest/text/embedding/video_clip/overview.html
- TAO `video_clip` guía de entrenamiento, evaluación, inferencia y exportación: https://docs.nvidia.com/tao/tao-toolkit/latest/text/embedding/video_clip/training.html
- TAO `video_clip` uso de embeddings (retrieval, clasificación zero-shot y detección de anomalías): https://docs.nvidia.com/tao/tao-toolkit/latest/text/embedding/video_clip/applications.html
- TAO Deploy `video_clip` (generación de motores TensorRT): https://docs.nvidia.com/tao/tao-toolkit/latest/text/tao_deploy/video_clip.html
- Backend PyTorch de TAO: https://github.com/NVIDIA/tao_pytorch_backend
- Dataset Kinetics: https://github.com/cvdfoundation/kinetics-dataset
- Licencia NVIDIA Internal Scientific Research and Development Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-internal-scientific-research-and-development-model-license/
- Texto de la licencia Apache 2.0: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md
- Texto de la licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
