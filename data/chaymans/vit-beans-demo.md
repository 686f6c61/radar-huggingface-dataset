# chaymans/vit-beans-demo

## Resumen

vit-beans-demo es un modelo de clasificacion de imagenes publicado por el usuario chaymans en HuggingFace. Se trata de un fine-tuning completo de google/vit-base-patch16-224-in21k, el Vision Transformer base preentrenado por Google sobre ImageNet-21k. El modelo cuenta con 85.800.963 parametros, usa el pipeline image-classification de la libreria transformers y se distribuye en formato safetensors bajo licencia Apache-2.0.

El modelo resuelve una tarea de clasificacion de imagenes concreta, no especificada en la model card (el autor la describe como "unknown dataset", aunque el nombre del repositorio sugiere un conjunto de imagenes de hojas de judia). Su relevancia es limitada: se trata de una demo de entrenamiento generada automaticamente con el Trainer de HuggingFace, con 0 descargas y 0 likes en el momento de la consulta, y sin model card completada mas alla de los hiperparametros y los resultados de evaluacion.

Arquitectura: Vision Transformer (ViT) base, con parches de 16x16 px y resolucion de entrada de 224x224 px. No es un modelo de lenguaje: no genera texto ni soporta tool calling, agentes ni razonamiento multi-paso. Su unico proposito es asignar una etiqueta de clase a una imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base, patch 16x16, resolucion 224x224 |
| Parametros totales | 85.800.963 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Modelo base | google/vit-base-patch16-224-in21k |
| Tamano del repositorio | 1,4 GB |
| Numero de clases de salida | no disponible |
| Libreria | transformers |
| Compatibilidad con endpoints | si (tag endpoints_compatible) |
| Fecha de creacion | 2026-09-15 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estandar en su variante base: la imagen de entrada se divide en parches de 16x16 px, cada parche se proyecta linealmente a un embedding y la secuencia resultante se procesa con bloques de auto-atencion. El punto de partida es google/vit-base-patch16-224-in21k, preentrenado por Google sobre ImageNet-21k (aproximadamente 14 millones de imagenes y 21.843 clases) con resolucion de 224x224. Sobre ese checkpoint se ha realizado un fine-tuning supervisado con clasificacion de imagenes convencional (entropia cruzada); no se documenta RLHF, DPO ni ninguna innovacion tecnica adicional como atencion lineal o decodificacion especulativa.

El autor no describe la composicion del dataset de entrenamiento ni de evaluacion ("Training and evaluation data: More information needed"). Los hiperparametros documentados son: learning rate 5e-05, train_batch_size 16, eval_batch_size 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 (variante fused de PyTorch), scheduler lineal y 4 epocas. El entrenamiento se realizo con Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. La model card indica explicitamente que fue generada de forma automatica por el Trainer y que deberia revisarse antes de considerarse completa.

## Capacidades

- Clasificacion de imagenes: asigna una etiqueta de clase a una imagen de entrada de 224x224 px.
- Inferencia via pipeline de transformers: utilizable con `pipeline("image-classification", model="chaymans/vit-beans-demo")`.
- Compatible con HuggingFace Inference Endpoints (tag endpoints_compatible).
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No dispone de modo thinking, vision generativa, audio ni OCR documentado.
- El numero y los nombres de las clases de salida no estan documentados en la model card.

## Casos de uso

- Clasificacion de hojas de cultivo en agricultura de precision: si el dataset empleado es efectivamente de hojas de judia, el modelo podria usarse para etiquetar imagenes de campo y detectar enfermedades foliares de forma automatizada en un pipeline de vision.
- Prototipado rapido de clasificadores de imagen: sirve como plantilla de fine-tuning de ViT para validar un flujo de entrenamiento con el Trainer antes de invertir en un dataset mayor.
- Filtrado o triaje de imagenes en un sistema de ingesta: el modelo puede aplicarse como primer clasificador para separar imagenes que cumplen cierta clase frente al resto.
- Demo de referencia en cursos y tutoriales: al seguir la estructura estandar de model card generada por Trainer, es util para ilustrar como se documenta un fine-tuning de ViT.
- Comparacion de arquitecturas en experimentos academicos: como ViT-base afinado, permite contrastar el rendimiento de transformers frente a CNN en una tarea de clasificacion concreta.
- Despliegue en endpoint de bajo coste: con 85,8 M de parametros cabe en cualquier instancia con GPU modesta o incluso CPU, por lo que es viable como servicio de clasificacion de baja latencia para volumen reducido.
- Validacion interna de calidad de datos: usar las predicciones del modelo para detectar imagenes mal etiquetadas en un conjunto propio, siempre que la tarea coincida con la del fine-tuning.

## Benchmarks y rendimiento

El model-index del repositorio no contiene resultados (`"results": []`). Los unicos datos disponibles son los declarados por el autor en la model card, obtenidos sobre un conjunto de evaluacion no descrito.

| Metrica | Valor declarado |
|---|---|
| Loss en evaluacion (final) | 0,1523 |
| Accuracy en evaluacion (final) | 0,9609 |

Evolucion durante el entrenamiento (datos del autor):

| Training loss | Epoca | Step | Validation loss | Accuracy |
|---|---|---|---|---|
| 0,2406 | 1,0 | 65 | 0,1716 | 0,9624 |
| 0,1271 | 2,0 | 130 | 0,1290 | 0,9699 |
| 0,1052 | 3,0 | 195 | 0,1538 | 0,9624 |
| 0,1235 | 4,0 | 260 | 0,1053 | 0,9774 |

No se han publicado resultados de benchmarks estandar (ImageNet, MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. La comparacion con otros modelos carece de base porque no se especifica el dataset de evaluacion ni el numero de clases.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 y 0,17 GB en fp16 para los pesos; con activaciones y overhead de runtime, entre 1 y 2 GB en la practica.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, GTX 1650, T4, L4). No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, con margen amplio para batching.
- Ejecucion en CPU: viable, aunque con latencia mayor; apta para volumentes bajos o procesamiento por lotes no interactivo.
- Opciones de despliegue: pipeline de transformers, HuggingFace Inference Endpoints (el repo esta marcado como endpoints_compatible), exportacion a ONNX o TorchScript. No es compatible con vLLM, TGI ni llama.cpp, ya que no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chaymans/vit-beans-demo | 85.800.963 | Clasificacion de imagenes (dataset no documentado) | apache-2.0 | HuggingFace, 0 descargas | Fine-tuning de ViT-base; accuracy 0,9609 declarada sobre evaluacion propia |
| google/vit-base-patch16-224-in21k | ~86 M | Clasificacion de imagenes (ImageNet-21k) | apache-2.0 | HuggingFace | Checkpoint base del que deriva este modelo; requiere fine-tuning para tareas concretas |
| google/vit-base-patch16-224 | ~86 M | Clasificacion de imagenes (ImageNet-1k) | apache-2.0 | HuggingFace | Variante afinada sobre ImageNet-1k, con cabeza de 1.000 clases |
| facebook/deit-base-patch16-224 | ~86 M | Clasificacion de imagenes (ImageNet-1k) | apache-2.0 | HuggingFace | Alternativa ViT con destilacion; mismo orden de parametros |

No se dispone de cifras comparativas de rendimiento entre estos modelos dentro de la informacion proporcionada, ya que las tareas y los conjuntos de evaluacion no coinciden.

## Limitaciones y advertencias

- Model card incompleta: el autor indica explicitamente "More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento.
- Dataset desconocido: no se especifica que datos se usaron para el fine-tuning, por lo que no es posible evaluar sesgos, cobertura de clases ni riesgo de sobreajuste al dominio.
- Numero de clases no documentado: se desconoce la dimensionalidad de la salida, lo que impide saber si las etiquetas predichas son interpretables fuera del contexto original.
- Riesgo de sobreajuste: con solo 260 steps de entrenamiento y 4 epocas, la accuracy de validacion oscila entre 0,9624 y 0,9774, con un repunte de la perdida de validacion en la epoca 3 que sugiere inestabilidad.
- Riesgo de alucinacion en sentido estricto: no aplica, pero si existe riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de la distribucion de entrenamiento.
- Sin soporte de lenguaje: no procesa texto ni responde a instrucciones; no debe presentarse como un modelo conversacional.
- Uso comercial: la licencia apache-2.0 lo permite sin restricciones adicionales conocidas, pero conviene verificar la licencia del dataset de entrenamiento, que no se documenta.
- Madurez: 0 descargas y 0 likes; es un artefacto de demostracion, no un modelo validado para produccion.
- No se han encontrado en la busqueda web enlaces relevantes adicionales; los resultados devueltos no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaymans/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Paper de Vision Transformer (ViT): https://arxiv.org/abs/2010.11929
- Documentacion de transformers para image-classification: https://huggingface.co/docs/transformers/tasks/image_classification
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la busqueda web realizada.
