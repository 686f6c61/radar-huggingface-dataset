# NinoNeo/Human-Action-Recognition

# NinoNeo/Human-Action-Recognition: clasificación de acciones humanas con SigLIP2

## Resumen

NinoNeo/Human-Action-Recognition es un modelo de clasificación de imágenes especializado en reconocimiento de acciones humanas. Se trata de un ajuste fino (fine-tuning) del checkpoint google/siglip2-base-patch16-224, un codificador visual SigLIP2 de tipo ViT-Base con parches de 16x16 y resolución de entrada de 224x224 píxeles. El modelo resultante emplea la clase SiglipForImageClassification de la librería transformers y añade una cabeza de clasificación lineal sobre la torre de visión, descartando la torre de texto del modelo original. Cuenta con 92.895.759 parámetros y se distribuye en formato safetensors con licencia Apache-2.0.

El problema que resuelve es acotado y concreto: dada una imagen RGB estática, asignar una de 15 etiquetas de acción (calling, clapping, cycling, dancing, drinking, eating, fighting, hugging, laughing, listening_to_music, running, sitting, sleeping, texting y using_laptop). El ajuste se realizó sobre el dataset Bingsu/Human_Action_Recognition y el autor reporta una exactitud global del 83,27% sobre un conjunto de evaluación de 12.600 imágenes (840 por clase).

Su relevancia es práctica más que arquitectónica: reutiliza un backbone contrastivo moderno (SigLIP2) para una tarea de clasificación cerrada, con un coste de inferencia muy bajo que permite desplegarlo en GPU de consumo o incluso en CPU. Como contrapartida, es un modelo con cero descargas y cero likes en el momento de redactar esta ficha, sin validación externa, y con un rendimiento desigual entre clases (F1 de 0,65 en sitting frente a 0,98 en cycling).

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer ViT-Base (SigLIP2, patch 16, resolución 224) con cabeza de clasificación lineal; clase SiglipForImageClassification |
| Parámetros totales | 92.895.759 |
| Parámetros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No aplica como contexto de texto. La entrada es una imagen de 224x224 px, tokenizada en 196 parches de 16x16 más un token de agregación (197 posiciones de visión) |
| Tipos de cuantización | No se publican versiones cuantizadas oficiales. Distribución en safetensors (FP32); exportable a FP16, INT8 y ONNX con herramientas externas |
| Idiomas soportados | en (inglés). Las etiquetas de clase y la model card están en inglés; no hay soporte multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es SigLIP2, la segunda generación del enfoque de preentrenamiento visión-lenguaje con pérdida sigmoide (Sigmoid Loss for Language-Image Pre-training) desarrollado por Google. A diferencia del contraste softmax clásico, SigLIP formula el alineamiento imagen-texto como una suma de pérdidas logísticas independientes por par, lo que permite escalar el tamaño de lote sin necesidad de normalizaciones globales costosas. El checkpoint base, siglip2-base-patch16-224, aporta la torre de visión ViT-Base; en este ajuste fino se conserva esa torre y se sustituye la proyección multimodal por una cabeza de clasificación sobre las 15 clases objetivo, por lo que la torre de texto del modelo original no interviene en la inferencia.

El ajuste se realizó sobre el dataset Bingsu/Human_Action-Recognition. La información publicada no detalla el número de tokens o imágenes de entrenamiento, la composición exacta del split de entrenamiento, el número de épocas, la tasa de aprendizaje ni la estrategia de aumento de datos: esos datos figuran como "no disponible". Tampoco se documenta el uso de RLHF, DPO u otras técnicas de alineamiento, que en un clasificador supervisado de este tipo no resultan aplicables. La única evidencia cuantitativa publicada es el informe de clasificación sobre 12.600 imágenes de evaluación, con 840 muestras por clase.

## Capacidades

- Clasificación de imágenes estáticas en 15 categorías cerradas de acción humana, con salida de logits y probabilidades softmax por clase.
- Reconocimiento de acciones cotidianas: llamar por teléfono, aplaudir, ir en bicicleta, bailar, beber, comer, pelearse, abrazarse, reír, escuchar música, correr, estar sentado, dormir, escribir mensajes y usar un portátil.
- Extracción de representaciones visuales: al derivar de un ViT-Base, la torre de visión puede emplearse como extractor de características para tareas posteriores o para inicializar otros ajustes finos.
- Inferencia rápida y de bajo coste, apta para procesamiento por lotes de grandes volúmenes de imágenes.
- No soporta generación de texto, razonamiento, código, matemáticas ni ninguna tarea lingüística.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso.
- No procesa vídeo de forma nativa: la entrada es una imagen única, sin modelado temporal.
- No incluye modo de pensamiento (thinking mode), audio ni detección de objetos con localización (bounding boxes).
- No incorpora una clase de rechazo o "ninguna de las anteriores": siempre devuelve una distribución sobre las 15 clases.

## Casos de uso

- Videovigilancia y monitorización de espacios públicos: clasificación por fotograma de actividades potencialmente relevantes (fighting, running) como filtro previo a la revisión humana, aprovechando el bajo coste de inferencia para procesar muchos flujos en paralelo.
- Analítica deportiva y de gimnasio: etiquetado automático de imágenes de sesiones (cycling, running, dancing) para construir métricas de actividad o resúmenes visuales de entrenamientos.
- Teleasistencia y monitorización de pacientes: detección de patrones de actividad en imágenes de cámaras domésticas (sleeping, sitting, eating, drinking) como señal complementaria para cuidadores, siempre con supervisión humana y cumplimiento normativo.
- Robótica y sistemas de automatización: dotar a un agente de contexto visual sobre lo que hace una persona en la escena (using_laptop, texting) para adaptar su comportamiento o priorizar tareas.
- Análisis de redes sociales y moderación de contenido: etiquetado masivo de imágenes subidas por usuarios para clasificar tendencias o marcar contenido potencialmente violento (fighting) antes de la revisión manual.
- Preetiquetado de datasets para anotación: generar etiquetas preliminares sobre un corpus de imágenes y reducir el esfuerzo de anotadores humanos, que solo corrigen los casos de baja confianza.
- Aplicaciones de fitness y bienestar: clasificación de imágenes enviadas por el usuario para validar retos o generar contenido personalizado según la actividad detectada.
- Investigación en visión por computador: uso del modelo como baseline reproducible de clasificación de acciones en imagen fija, o como punto de partida para comparar con enfoques temporales (vídeo, pose).

## Benchmarks y rendimiento

El autor publica un informe de clasificación sobre 12.600 imágenes de evaluación (840 por clase). No se especifica el origen exacto del split ni si hay solapamiento con el conjunto de entrenamiento.

| Clase | Precisión | Recall | F1-score | Muestras |
|---|---|---|---|---|
| calling | 0,8525 | 0,7571 | 0,8020 | 840 |
| clapping | 0,8679 | 0,7119 | 0,7822 | 840 |
| cycling | 0,9662 | 0,9857 | 0,9758 | 840 |
| dancing | 0,8302 | 0,8381 | 0,8341 | 840 |
| drinking | 0,9093 | 0,8714 | 0,8900 | 840 |
| eating | 0,9377 | 0,9131 | 0,9252 | 840 |
| fighting | 0,9034 | 0,7905 | 0,8432 | 840 |
| hugging | 0,9065 | 0,9000 | 0,9032 | 840 |
| laughing | 0,7854 | 0,8583 | 0,8203 | 840 |
| listening_to_music | 0,8494 | 0,7988 | 0,8233 | 840 |
| running | 0,8888 | 0,9321 | 0,9099 | 840 |
| sitting | 0,5945 | 0,7226 | 0,6523 | 840 |
| sleeping | 0,8593 | 0,8214 | 0,8399 | 840 |
| texting | 0,8195 | 0,6702 | 0,7374 | 840 |
| using_laptop | 0,6610 | 0,9190 | 0,7689 | 840 |
| Exactitud global | — | — | 0,8327 | 12.600 |
| Media macro | 0,8421 | 0,8327 | 0,8339 | 12.600 |
| Media ponderada | 0,8421 | 0,8327 | 0,8339 | 12.600 |

Los puntos débiles son sitting (precisión 0,5945), using_laptop (0,6610) y texting (0,7374 en F1), tres clases visualmente próximas entre sí. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de reconocimiento de acciones (Kinetics, UCF101, HMDB51) en la información disponible, por lo que no es posible comparar con la literatura académica de HAR.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 372 MB (92,9 millones de parámetros a 4 bytes). El repositorio ocupa 2,1 GB, lo que sugiere la presencia de ficheros adicionales o duplicados de peso respecto al checkpoint estrictamente necesario.
- Pesos en FP16: aproximadamente 186 MB; en INT8, unos 93 MB.
- VRAM estimada para inferencia con lotes pequeños: entre 1 y 2 GB en FP32 (pesos más activaciones), por debajo de 1 GB en FP16.
- Cabe sin dificultad en cualquier GPU de consumo: GTX 1060 6 GB, RTX 3060, RTX 4060, RTX 4090. También es viable la inferencia en CPU para volúmenes moderados.
- GPU de datacenter (A100, H100, L40S) solo tienen sentido si se busca throughput muy alto con lotes grandes; el modelo no las necesita por memoria.
- Opciones de despliegue: transformers con PyTorch, exportación a ONNX Runtime, TensorRT o TorchScript, y Hugging Face Inference Endpoints. No es compatible con llama.cpp, Ollama ni vLLM, orientados a modelos generativos y no a clasificación de imágenes con SigLIP.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto de entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NinoNeo/Human-Action-Recognition | SigLIP2 ViT-Base patch16-224 + cabeza de clasificación | 92,9 M | Imagen 224x224, 197 tokens de visión | Exactitud 0,8327 en 15 clases (12.600 imágenes) | apache-2.0 | Hugging Face, 0 descargas |
| prithivMLmods/Human-Action-Recognition | SigLIP2 + cabeza de clasificación (referenciado en el código de ejemplo del propio README) | no disponible | Imagen 224x224 | no disponible | no disponible | Hugging Face |
| einoa04/human_action_recognition_model | ViT-Base patch16-224-in21k ajustado | no disponible | Imagen 224x224 | no disponible | no disponible | Hugging Face, sin actividad suficiente para Inference API |
| google/siglip2-base-patch16-224 | SigLIP2 completo (torre de visión y torre de texto) | no disponible | Imagen 224x224 y texto | no aplica a clasificación cerrada de acciones | no disponible | Hugging Face, modelo base |

La comparación cuantitativa con alternativas no es posible con la información disponible: los modelos comparables no publican métricas de clasificación de acciones y el modelo analizado no reporta resultados en benchmarks estándar de HAR. Enfoques basados en vídeo o en pose más LSTM, como el descrito en el artículo de Nature sobre YOLO+LSTM, abordan el problema con información temporal y por tanto no son directamente comparables en coste ni en exactitud.

## Limitaciones y advertencias

- Exactitud global del 83,27%, con clases claramente por debajo: sitting (F1 0,6523), texting (0,7374), using_laptop (0,7689) y clapping (0,7822). La confusión entre acciones estáticas y de oficina es previsible.
- El modelo no tiene clase de rechazo. Ante una imagen sin persona, o con una acción fuera del conjunto de 15 clases, devolverá igualmente una distribución de probabilidad, generando falsos positivos en producción.
- Ausencia de información temporal: clasifica fotogramas aislados, por lo que no distingue acciones que solo se diferencian por su dinámica (por ejemplo, inicio de una carrera frente a caminar rápido).
- Sesgos potenciales heredados del dataset Bingsu/Human_Action-Recognition, cuya composición demográfica, geográfica y de contexto no se detalla. No se ha publicado ningún análisis de sesgo ni de equidad entre grupos.
- Las etiquetas y la model card están únicamente en inglés; no hay soporte de otras lenguas ni de descripciones en castellano.
- Riesgo de alucinación de clase: el modelo siempre "elige" una acción, incluso cuando la imagen no contiene personas o contiene varias acciones simultáneas, sin mecanismo de abstención ni de clasificación multietiqueta.
- La licencia del modelo es Apache-2.0, permisiva para uso comercial, pero la licencia del dataset de entrenamiento no se detalla en la información disponible; conviene verificarla antes de un despliegue comercial.
- El repositorio registra 0 descargas y 0 likes, sin discusiones ni validación por parte de la comunidad, y la fecha de creación indicada es posterior a la de otras fichas consultadas; se recomienda tratar el checkpoint como no auditado.
- El código de ejemplo incluido en el README carga el identificador prithivMLmods/Human-Action-Recognition en lugar del repositorio NinoNeo/Human-Action-Recognition. Hay que sustituir la ruta del modelo antes de ejecutarlo o se descargará un checkpoint distinto del documentado.
- El repositorio ocupa 2,1 GB frente a los aproximadamente 372 MB que requieren 92,9 millones de parámetros en FP32; se desconoce qué contienen los ficheros adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NinoNeo/Human-Action-Recognition
- Discusiones del modelo: https://huggingface.co/NinoNeo/Human-Action-Recognition/discussions
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Dataset de entrenamiento: https://huggingface.co/datasets/Bingsu/Human_Action_Recognition
- Modelo alternativo basado en ViT: https://huggingface.co/einoa04/human_action_recognition_model
- Artículo sobre YOLO + LSTM para reconocimiento de acciones: https://www.nature.com/articles/s41598-025-01898-z
- Versión PDF del artículo anterior: https://www.nature.com/articles/s41598-025-01898-z.pdf
- Guía sobre reconocimiento de acciones y pose estimation: https://www.ultralytics.com/glossary/action-recognition
