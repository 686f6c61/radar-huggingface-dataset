# MrParop/beans-classifier-lab

## Resumen

beans-classifier-lab es un modelo de clasificacion de imagenes publicado por el usuario MrParop en HuggingFace. Se trata de un ajuste fino (fine-tuning) del checkpoint google/vit-base-patch16-224-in21k, un Vision Transformer de tipo ViT-Base con parches de 16x16 y resolucion de entrada de 224x224 pixeles. El modelo tiene 85.800.194 parametros (aproximadamente 86 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve la tarea de clasificacion de imagenes, y su nombre sugiere que fue entrenado para clasificar imagenes del conocido conjunto de datos "beans" (enfermedades de la hoja del frijol), aunque la model card indica explicitamente que el conjunto de datos de entrenamiento es "unknown dataset" y no documenta las clases ni la procedencia de los datos. No se trata de un modelo generativo ni de un modelo de lenguaje: su unica salida es una prediccion de clase sobre una imagen de entrada.

Es relevante como ejemplo de pipeline de fine-tuning reproducible con el Trainer de HuggingFace sobre una arquitectura ViT estandar. Su utilidad practica esta limitada por la falta de documentacion: se desconocen las clases reales, el dataset y las condiciones de evaluacion, por lo que debe tratarse como un experimento de laboratorio mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16x16, 224x224) |
| Parametros totales | 85.800.194 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors; admite conversion a fp16/int8 por herramientas externas) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estandar (ViT-Base). El modelo divide la imagen de entrada de 224x224 pixeles en parches de 16x16, los proyecta como embeddings y los procesa mediante bloques de atencion multi-cabeza, terminando en una cabeza de clasificacion. El checkpoint base, google/vit-base-patch16-224-in21k, fue preentrenado por Google sobre ImageNet-21k (14 millones de imagenes y 21.843 clases), y este modelo lo ajusta sobre un dataset no especificado.

El entrenamiento se realizo con el Trainer de HuggingFace durante 3 epocas, con learning rate 5e-05, batch de entrenamiento 16, acumulacion de gradientes de 4 pasos (batch efectivo de 64), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y semilla 42. Las versiones de framework declaradas son Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2. No se documenta composicion del dataset, numero de tokens/imagenes, ni si hubo RLHF, DPO u otra tecnica de alineacion. No se declara ninguna innovacion tecnica adicional (ni decodificacion especulativa, ni atencion lineal).

Los resultados de validacion por epoca declarados por el autor fueron los siguientes: epoca 1 (paso 125) con perdida 0.0266 y exactitud 0.996; epoca 2 (paso 250) con perdida 0.0242 y exactitud 0.9955; epoca 3 (paso 375) con perdida 0.0204 y exactitud 0.9965.

## Capacidades

- Clasificacion de imagenes: genera una etiqueta de clase (o distribucion de probabilidad sobre clases) a partir de una imagen RGB de 224x224 pixeles.
- Inferencia mediante la pipeline `image-classification` de Transformers.
- Compatible con los endpoints de HuggingFace (tag `endpoints_compatible`).
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No dispone de capacidades de generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de capacidades multilingues (modelo puramente visual).
- No se documenta modo "thinking", audio, video ni deteccion de objetos o segmentacion.

## Casos de uso

Los casos siguientes son aplicaciones plausibles dado que es un clasificador de imagenes derivado de ViT-Base. Al no estar documentadas las clases del modelo, deben validarse antes de cualquier uso real.

- Clasificacion de imagenes de hojas de cultivo: si el modelo corresponde al dataset "beans", podria usarse para distinguir entre hoja sana y distintos tipos de enfermedad foliar a partir de fotografias, con vistas a un sistema de alerta temprana en agricultura de precision.
- Filtrado y triaje automatico de imagenes: integrar el modelo en un pipeline que etiquete grandes volumenes de imagenes y derive las que requieren revision humana, aprovechando su bajo coste computacional.
- Prototipo de control de calidad visual en linea de produccion: clasificar piezas u objetos a partir de capturas con una camara fija, sustituyendo el checkpoint final por un reajuste sobre imagenes propias.
- Base de transferencia para nuevas tareas de vision: usar el modelo como punto de partida (fine-tuning adicional) en dominios con pocos datos, dado que ya parte de un preentrenamiento sobre ImageNet-21k.
- Docencia y experimentacion reproducible: servir de ejemplo de pipeline completo de fine-tuning con el Trainer de HuggingFace, con hiperparametros y curvas de entrenamiento documentadas.
- Preprocesado en sistemas de monitorizacion ambiental o agricola: clasificar capturas de sensores o drones como etapa previa a un analisis mas costoso (por ejemplo, un modelo de segmentacion o un VLM).
- Benchmark interno de infraestructura de inferencia: por su tamano reducido (86 M de parametros), es util para medir latencia y throughput de un stack de despliegue (ONNX Runtime, Triton, TorchServe) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card no incluye resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, ImageNet, etc.). El campo `model-index` esta vacio (`results: []`). El autor solo declara metricas sobre su propio conjunto de evaluacion.

| Metrica | Valor declarado por el autor |
|---|---|
| Accuracy (evaluacion final) | 0.9965 |
| Loss (evaluacion final) | 0.0204 |
| Accuracy (epoca 1 / paso 125) | 0.996 |
| Accuracy (epoca 2 / paso 250) | 0.9955 |
| Accuracy (epoca 3 / paso 375) | 0.9965 |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Las cifras anteriores proceden exclusivamente de la model card y corresponden a un conjunto de evaluacion no documentado, por lo que no son comparables con resultados publicados de otros modelos.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,34 GB solo para los pesos (86 M de parametros x 4 bytes), mas el coste de activaciones, que para lotes pequenos es reducido.
- VRAM estimada en fp16: aproximadamente 0,17 GB de pesos, mas activaciones. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar la inferencia; para lotes grandes se recomienda una GPU dedicada.
- Cabe en GPU de consumo: si, sin restricciones practicas. Tambien puede ejecutarse en CPU para inferencia puntual o de bajo volumen.
- Opciones de despliegue: `transformers` con la pipeline `image-classification`, exportacion a ONNX y ONNX Runtime, TorchScript, TorchServe o NVIDIA Triton. No aplica a motores de modelos de lenguaje como vLLM, TGI o llama.cpp (no son adecuados para un clasificador de vision, salvo wrappers genericos).
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros clasificadores sobre el mismo conjunto de evaluacion (que ademas es desconocido). La unica comparacion posible se establece con el checkpoint base y con la clase general de modelos ViT-Base.

| Modelo | Parametros | Arquitectura | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| beans-classifier-lab | 85.800.194 | ViT-Base, patch 16, 224 px | Apache 2.0 | Accuracy 0.9965 en evaluacion propia no documentada |
| google/vit-base-patch16-224-in21k | ~86 M | ViT-Base, patch 16, 224 px | Apache 2.0 | Metricas sobre ImageNet-21k publicadas por Google (no incluidas aqui) |
| Otros clasificadores ViT/Timm de ~86 M | ~86 M | ViT-Base y variantes | variable | no disponible |

No se dispone de alternativas comparables con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card indica "unknown dataset" y no documenta las clases, el numero de imagenes ni el origen de los datos; las secciones de descripcion e intencion de uso aparecen como "More information needed".
- La exactitud de 0.9965 procede de un conjunto de evaluacion no descrito y sin particion publicada, por lo que no es verificable ni comparable con otros modelos.
- Riesgo de sobreajuste al dominio de entrenamiento: al desconocerse el dataset, no puede garantizarse la generalizacion a imagenes de otras condiciones de iluminacion, camara o fondo.
- Riesgo de sesgo por desbalance de clases y por el dominio de captura del dataset original: si una clase esta infrarrepresentada, el modelo puede favorecer sistematicamente las clases mayoritarias.
- No es un modelo generativo: no puede producir texto, codigo ni explicaciones; solo devuelve etiquetas de clase.
- No hay informacion sobre interpretabilidad, mapas de atencion ni calibracion de las probabilidades de salida.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya la autoria. No obstante, al derivar de google/vit-base-patch16-224-in21k (tambien Apache 2.0), deben respetarse las condiciones de ambos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No debe utilizarse en produccion sin una reevaluacion propia sobre datos representativos del caso de uso real.
- No se documentan los idiomas ni la resolucion de imagen admitida mas alla de la esperada por el checkpoint base (224x224 px).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrParop/beans-classifier-lab
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada.
