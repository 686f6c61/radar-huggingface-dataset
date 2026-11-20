# Mahganj123/bean-leaf-vit

## Resumen

Bean Leaf Disease Classifier es un modelo de vision por computador desarrollado por el usuario Mahganj123, consistente en un ajuste fino (fine-tuning) del Vision Transformer `google/vit-base-patch16-224-in21k` para la clasificación de enfermedades en hojas de judía (bean). El modelo distingue entre tres clases: hoja sana (`healthy`), mancha angular de la hoja (`angular_leaf_spot`) y roya de la judía (`bean_rust`). Resuelve un problema concreto de diagnostico fitosanitario automatizado en el ambito agricola, una tarea donde el etiquetado manual requiere personal especializado y es costoso a escala.

Tecnicamente se trata de un ViT-Base con parches de 16x16 pixeles y resolucion de entrada de 224x224, con 85,8 millones de parametros totales y un repositorio de solo 0,3 GB, lo que lo hace extremadamente ligero para despliegue en produccion. Se entreno durante 4 epocas con un batch size de 16 y una tasa de aprendizaje de 3e-5 sobre el dataset publico AI-Lab-Makerere/beans, alcanzando una precision del 93,75% en el conjunto de test.

Su relevancia actual es limitada pero practica: es un ejemplo de modelo de dominio especifico, pequeno y de licencia permisiva (Apache 2.0), adecuado para prototipos de agricultura de precision, aplicaciones moviles de diagnostico de cultivos o pipelines de inspeccion visual en invernadero. No obstante, cuenta con cero descargas y cero likes en el momento de la ficha, por lo que no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16x16, resolucion 224x224) |
| Parametros totales | 85.800.963 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (modelo de clasificacion de imagen, sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tipo base: divide la imagen de entrada de 224x224 pixeles en parches de 16x16 (196 parches), los proyecta linealmente, anade embeddings posicionales y procesa la secuencia mediante bloques de atencion multi-cabeza. La cabeza de clasificacion se reemplaza por una capa lineal de 3 salidas correspondientes a las clases `healthy`, `angular_leaf_spot` y `bean_rust`. Se parte del checkpoint preentrenado `google/vit-base-patch16-224-in21k`, entrenado en ImageNet-21k, lo que aporta representaciones visuales genericas antes del ajuste fino.

El ajuste fino se realizo sobre el dataset AI-Lab-Makerere/beans durante 4 epocas, con batch size de 16 y learning rate de 3e-5. La model card no especifica el numero total de imagenes del dataset, la composicion exacta del split, ni si se aplicaron tecnicas de aumento de datos, regularizacion o early stopping. Tampoco se documenta el uso de RLHF, DPO ni ninguna innovacion arquitectonica adicional: es un fine-tuning estandar de clasificacion supervisada. La metrica reportada es una precision de test del 93,75%, sin desglose por clase ni matriz de confusion.

## Capacidades

- Clasificacion de imagenes de hojas de judía en tres categorias: sana, mancha angular y roya.
- Vision por computador basada en transformer con atencion global sobre los 196 parches de la imagen.
- Inferencia directa mediante el pipeline `image-classification` de Transformers.
- Salida de probabilidades por clase (logits softmax sobre 3 etiquetas).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision generativa, audio ni otras capacidades especiales.

## Casos de uso

- Diagnostico de cultivos en aplicaciones moviles: integrado en una app de campo, el modelo clasifica una foto de hoja de judía y devuelve la enfermedad detectada, permitiendo al agricultor actuar sin esperar a un tecnico. Su tamano de 0,3 GB y 85,8 M de parametros permite ejecucion en dispositivos moviles o edge.

- Inspeccion visual en invernadero: desplegado sobre camaras fijas o drones, el modelo puede procesar lotes de imagenes y generar alertas tempranas cuando la proporcion de hojas clasificadas como enfermas supera un umbral configurable.

- Triaje en servicios de extension agraria: como primer filtro automatico en plataformas donde los agricultores suben fotos, el modelo prioriza los casos de roya o mancha angular para revision por un fitopatologo, reduciendo la carga manual.

- Generacion de datasets etiquetados: el modelo puede usarse para pre-etiquetar grandes volumenes de imagenes de hojas de judía, que luego se revisan manualmente, acelerando la construccion de corpus de entrenamiento mayores.

- Investigacion agronomica: como linea base (baseline) reproducible en estudios de deteccion de enfermedades foliares, dado que parte de un checkpoint publico y usa un dataset publico, lo que facilita la comparacion con otros metodos.

- Educacion y demos: por su licencia Apache 2.0 y su simplicidad de uso con `pipeline`, es adecuado para talleres de vision por computador, tutoriales de fine-tuning de ViT y demostraciones de IA aplicada a agricultura.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 93,75% | Test del dataset AI-Lab-Makerere/beans |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparativas con otros modelos en la model card. No se reporta matriz de confusion, precision/recall por clase ni F1.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,35 GB solo para pesos (85,8 M de parametros), mas activaciones; en la practica cabe en cualquier GPU con 1-2 GB libres.
- VRAM estimada en FP16: aproximadamente 0,17 GB para pesos.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes se recomienda NVIDIA A100, H100, L4 o RTX 4090. Para inferencia unitaria basta una GTX 1650, RTX 3050 o incluso CPU.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y dispositivos moviles con runtime adecuado.
- Opciones de despliegue: Transformers con `pipeline`, TorchServe, ONNX Runtime (previa exportacion), Triton Inference Server, FastAPI con PyTorch. No se documentan pesos GGUF ni soporte nativo en llama.cpp u Ollama (no aplica a vision clasica).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por imagen en GPU moderna, pero no hay medicion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mahganj123/bean-leaf-vit | 85,8 M | Clasificacion de enfermedades de hoja de judía (3 clases) | Imagen 224x224 | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224-in21k | 85,8 M | Clasificacion generica ImageNet-21k (modelo base) | Imagen 224x224 | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224 | 85,8 M | Clasificacion ImageNet-1k (1000 clases) | Imagen 224x224 | Apache 2.0 | Hugging Face |

No se dispone de informacion sobre otros modelos especificos de clasificacion de enfermedades de judía con los que comparar directamente. La comparativa se limita al modelo base y a la variante estandar de ViT-Base, que comparten arquitectura y numero de parametros pero difieren en el dominio y las clases de salida.

## Limitaciones y advertencias

- Entrenado exclusivamente con el dataset AI-Lab-Makerere/beans; su generalizacion a otras variedades de judía, condiciones de iluminacion, camaras o regiones geograficas no esta validada.
- Solo distingue tres clases; no detecta otras enfermedades, plagas ni deficiencias nutricionales.
- Precision reportada de 93,75% sin desglose por clase: el rendimiento en la clase minoritaria podria ser inferior.
- Riesgo de sobreajuste por entrenamiento corto (4 epocas) y ausencia de documentacion sobre validacion o early stopping.
- Sin informacion sobre sesgos: no se documenta la composicion demografica ni geografica del dataset, lo que impide evaluar sesgos de dominio.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza cuando la imagen de entrada no es una hoja de judía o es de baja calidad.
- No apta para diagnostico fitosanitario definitivo sin supervision humana; debe usarse como herramienta de apoyo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene cero descargas y no ha sido auditado por la comunidad.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/Mahganj123/bean-leaf-vit
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset: https://huggingface.co/datasets/AI-Lab-Makerere/beans
- Paper del Vision Transformer (ViT): https://arxiv.org/abs/2010.11929
- Documentacion de Transformers para image-classification: https://huggingface.co/docs/transformers/tasks/image_classification
