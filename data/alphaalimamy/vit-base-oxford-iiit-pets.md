# Alphaalimamy/vit-base-oxford-iiit-pets

## Resumen

El modelo Alphaalimamy/vit-base-oxford-iiit-pets es un Vision Transformer (ViT) de tipo base afinado para clasificación de imágenes, concretamente para distinguir las 37 razas de perros y gatos del conjunto de datos Oxford-IIIT Pets. Lo publica el usuario Alphaalimamy en HuggingFace y se trata de un fine-tune completo de google/vit-base-patch16-224, el checkpoint de ViT-Base preentrenado por Google sobre ImageNet-21k e ImageNet-1k. No es un modelo de lenguaje ni un modelo multimodal generativo: su única salida es una distribución de probabilidad sobre 37 clases.

El interés práctico de esta ficha es doble. Por un lado, es un ejemplo limpio y reproducible de fine-tune con la API Trainer de transformers (5 épocas, AdamW fusionado, scheduler lineal), lo que lo convierte en una referencia útil para quien quiera replicar el flujo con un dataset de clasificación propio. Por otro lado, con 85.827.109 parámetros y un repo de 1,7 GB en safetensors, es un clasificador lo bastante pequeño como para desplegarse en CPU o en cualquier GPU de consumo, y con una licencia Apache 2.0 sin restricciones para uso comercial.

La relevancia del modelo es, sin embargo, limitada por su alcance: resuelve un problema cerrado (razas de mascotas) y no se han publicado datos de generalización fuera de la partición de evaluación del propio dataset. No hay descargas ni likes registrados y la model card está generada automáticamente, con varias secciones marcadas como "More information needed".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución de entrada 224x224 px) |
| Parametros totales | 85.827.109 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: modelo de clasificación de imágenes con entrada fija de 224x224 px (196 parches + token [CLS]) |
| Tipos de cuantizacion | no disponible: el repo solo contiene pesos en safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible: la salida son etiquetas de clase, definidas en inglés en el dataset Oxford-IIIT Pets; no procesa texto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

Otros datos de la model card: librería transformers, pipeline image-classification, modelo base google/vit-base-patch16-224, métrica declarada accuracy, etiqueta generated_from_trainer y compatibilidad con endpoints de HuggingFace.

## Arquitectura y entrenamiento

La arquitectura es un ViT-Base estándar: transformer de encoder con proyección de parches de 16x16, 12 capas, dimensión oculta 768 y 12 cabezas de atención, más una cabeza de clasificación lineal sobre el token [CLS]. El modelo parte de google/vit-base-patch16-224 y se ha afinado por completo (no se indica uso de LoRA ni de adaptadores) sobre el dataset pcuenq/oxford-pets, la versión en HuggingFace del Oxford-IIIT Pet Dataset, que contiene imágenes de 37 categorías de razas de perros y gatos.

Los hiperparámetros declarados son: learning rate 0,0003, train_batch_size 16, eval_batch_size 8, semilla 42, optimizador ADAMW_TORCH_FUSED con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 5 épocas (1.850 pasos de entrenamiento). No se documenta el número de tokens de imagen vistos, la composición exacta de la partición de entrenamiento ni si hubo etapas de aumento de datos, destilación o ajuste adicional. Tampoco se declara ningún mecanismo de atención lineal, decodificación especulativa ni innovación técnica sobre el ViT original: es un fine-tune convencional. Las versiones de framework indicadas son Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Clasificación de imágenes cerrada en 37 clases: razas de perro y de gato del dataset Oxford-IIIT Pets.
- Salida de probabilidades por clase (logits y softmax), apta para umbrales de confianza y para descartar predicciones de baja seguridad.
- Extracción de representaciones: el encoder ViT puede usarse congelado como extractor de características para retrieval de imágenes, clustering o clasificación few-shot con una cabeza nueva.
- Preanotación de datos: sirve como etiquetador automático de primer paso en pipelines de curaduría de datasets de mascotas.
- No soporta generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera lenguaje natural.
- No dispone de thinking mode, ni entrada/salida de audio, ni detección de objetos, segmentación, captioning o respuesta a preguntas visuales. Es exclusivamente un clasificador de imagen completa.

## Casos de uso

- Clasificación de razas en aplicaciones de refugios y protectoras: cuando un usuario sube la foto de un animal en adopción, el modelo devuelve la raza probable entre 37 clases y el personal solo tiene que validar o corregir la etiqueta.
- Etiquetado automático de fotos en clínicas veterinarias: integrado en el flujo de admisión, permite precargar la raza en la ficha del animal a partir de una única imagen a 224x224 px, reduciendo el tiempo de registro manual.
- Curaduría y preanotación de datasets: al ser un fine-tune de ViT-Base con 85,8 M de parámetros, se puede ejecutar sobre lotes grandes de imágenes para generar etiquetas iniciales que después se revisan con anotación humana, acelerando la construcción de nuevos conjuntos de datos de razas.
- Filtrado y búsqueda en bibliotecas de imágenes: indexar un archivo fotográfico por raza, usando la clase predicha o los embeddings del encoder para búsqueda por similitud y agrupación semántica.
- Backbone congelado para transferencia: con 12 capas y dimensión 768, sus representaciones sirven como punto de partida para tareas más específicas (por ejemplo, distinguir individuos concretos o detectar rasgos de salud) entrenando solo una cabeza ligera sobre los features.
- Clasificación en el borde (edge): al ocupar aproximadamente 343 MB en fp32 y 172 MB en fp16, cabe en dispositivos con pocos recursos, como una Jetson Nano o una Raspberry Pi con acelerador, para etiquetar automáticamente fotos capturadas por comederos o cámaras de vigilancia de mascotas.
- Material docente y de referencia para fine-tune: el repo incluye la traza completa de entrenamiento (pérdida por época, hiperparámetros y versiones), por lo que es útil como plantilla reproducible de un flujo Trainer sobre un dataset de clasificación.
- Comprobación de calidad de datos: ejecutar el modelo sobre un lote nuevo y revisar las imágenes con baja confianza o predicciones fuera de distribución ayuda a detectar etiquetas erróneas o imágenes corruptas en un dataset.

## Benchmarks y rendimiento

El model-index del autor está vacío (results: []), por lo que no hay comparaciones declaradas con otros modelos. Los únicos datos disponibles son las métricas de entrenamiento y evaluación de la propia model card, medidas sobre la partición de evaluación de pcuenq/oxford-pets.

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 | Epoca 4 | Epoca 5 |
|---|---|---|---|---|---|
| Perdida de entrenamiento | 0,3752 | 0,2108 | 0,1543 | 0,1448 | 0,1212 |
| Perdida de validacion | 0,3344 | 0,2622 | 0,2433 | 0,2382 | 0,2350 |
| Accuracy | 0,9107 | 0,9188 | 0,9229 | 0,9310 | 0,9296 |

Resultado declarado en la sección de evaluación: pérdida 0,2274 y accuracy 0,9391. Como referencia, la línea base aleatoria para 37 clases sería aproximadamente 0,027 de accuracy.

Advertencia de coherencia: la accuracy del informe de evaluación (0,9391) no coincide con la de la última época de la tabla de entrenamiento (0,9296). La model card no explica esa diferencia, que puede deberse a un recálculo sobre la partición de evaluación o a una evaluación posterior al último checkpoint.

## Requisitos de hardware

- Peso de los pesos: en fp32, 85.827.109 parámetros equivalen a aproximadamente 343 MB; en fp16, unos 172 MB; en int8, unos 86 MB. Cálculo derivado del recuento de parámetros, no una medición publicada.
- VRAM para inferencia: al tratarse de una entrada de 197 tokens (196 parches + [CLS]) y 12 capas, las activaciones son pequeñas. Con los pesos en fp32, la inferencia a tamaño de lote 1 debería caber holgadamente por debajo de 1 GB de VRAM; en fp16, por debajo de 0,5 GB. Estimación calculada, no medida publicada.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también funciona en GPUs antiguas tipo GTX 1050/1080 y en CPU. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, y también en CPU para lotes pequeños.
- Opciones de despliegue: pipeline de transformers (image-classification), exportación a ONNX con Optimum y ejecución con ONNX Runtime, TorchScript, TorchServe, Triton Inference Server y servicios propios con FastAPI o Flask. vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje causal y no se publican pesos en GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

Los datos de las alternativas son valores de referencia de cada arquitectura publicada, no resultados reevaluados en el dataset Oxford-IIIT Pets; la comparación de rendimiento en esta tarea concreta no está disponible porque el autor no publica comparativas.

| Modelo | Parametros | Tarea / dataset | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alphaalimamy/vit-base-oxford-iiit-pets | 85.827.109 | Clasificacion de 37 razas (Oxford-IIIT Pets) | 224x224 px | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| google/vit-base-patch16-224 | ~86 M | Clasificacion ImageNet-1k (1000 clases) | 224x224 px | Apache 2.0 | HuggingFace, ampliamente usado |
| microsoft/resnet-50 | ~25,6 M | Clasificacion ImageNet-1k | 224x224 px | MIT | HuggingFace, muy extendido |
| facebook/convnext-tiny-224 | ~28 M | Clasificacion ImageNet-1k | 224x224 px | Apache 2.0 | HuggingFace |

Frente a los tres alternativos, este modelo tiene un dominio mucho más estrecho (37 clases frente a 1000) y una validación comunitaria nula, a cambio de ser directamente utilizable en su tarea específica sin necesidad de fine-tune adicional.

## Limitaciones y advertencias

- Alcance cerrado: solo predice entre 37 clases de razas de perros y gatos. Cualquier imagen de otra especie, un objeto o una raza no incluida se forzará a una de las 37 etiquetas, sin clase "desconocido".
- Riesgo de confusión entre razas visualmente próximas (por ejemplo, variedades de terrier o de gato doméstico de pelo corto), que el softmax puede presentar con confianza alta pese al error.
- Confianza mal calibrada: no se documenta temperatura ni calibración, por lo que los valores de softmax no deben interpretarse directamente como probabilidad de acierto.
- Sesgo del dataset: Oxford-IIIT Pet procede en su mayoría de imágenes de internet con poses y encuadres típicos; el rendimiento puede degradarse con fotos de baja iluminación, animales parcialmente ocluidos, varios animales en la misma imagen o ángulos inusuales.
- Resolución fija: el modelo espera 224x224 px y 196 parches. Usar otra resolución exige interpolar las posiciones de los embeddings, algo que la model card no documenta ni valida.
- Evaluación limitada: la accuracy de 0,9391 proviene de la partición de evaluación del mismo dataset de entrenamiento. No hay validación cruzada, ni prueba en un conjunto externo, ni datos por clase que revelen si hay razas con rendimiento muy inferior.
- Sin validación externa: 0 descargas y 0 likes, model card autogenerada sin secciones de usos previstos ni limitaciones redactadas por el autor. No hay terceros que hayan reproducido los resultados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No obstante, la licencia del dataset de entrenamiento y de las imágenes originales no se detalla en la model card, lo que conviene verificar antes de un uso comercial.
- Aviso para producción: al ser un clasificador de imagen completa no ofrece localización ni detección, por lo que no sirve para localizar al animal dentro de la imagen ni para tareas de segmentación. Para uso crítico (por ejemplo, decisiones veterinarias) debe tratarse como una señal auxiliar, no como un diagnóstico.
- Datos incompletos: no hay información sobre cuantizaciones, idiomas de etiquetas, latencia ni throughput, y existe una discrepancia no explicada entre la accuracy de evaluación y la de la última época.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alphaalimamy/vit-base-oxford-iiit-pets
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Dataset de entrenamiento: https://huggingface.co/datasets/pcuenq/oxford-pets
- Dataset original Oxford-IIIT Pet: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Paper de Vision Transformer (ViT): https://arxiv.org/abs/2010.11929
- La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados obtenidos fueron páginas genéricas de YouTube sin relación con esta ficha.
