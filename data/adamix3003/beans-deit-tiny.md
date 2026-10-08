# Adamix3003/beans-deit-tiny

## Resumen

beans-deit-tiny es un modelo de clasificación de imágenes resultado del ajuste fino (*fine-tuning*) de facebook/deit-tiny-patch16-224 sobre el conjunto de datos AI-Lab-Makerere/beans. Lo publica el usuario Adamix3003 en HuggingFace y está pensado exclusivamente para la tarea de clasificar imágenes de hojas dentro de ese dataset, no como modelo de propósito general. Se trata de un Vision Transformer (ViT) en su variante DeiT-tiny, con parches de 16x16 píxeles y entrada de 224x224 píxeles, y un total de 5.524.995 parámetros.

El problema que resuelve es acotado: dado un conjunto de imágenes de hojas, asignar cada una a su clase correspondiente con una precisión declarada de 0,9699 en el conjunto de evaluación. Su relevancia práctica no está en la novedad técnica, sino en que es un ejemplo de modelo extremadamente ligero (unos 22 MB en FP32) que puede ejecutarse en CPU o en dispositivos de borde sin GPU, algo útil para experimentos de visión por computador con recursos limitados.

La model card es la generada automáticamente por el *Trainer* de HuggingFace y no incluye descripción del modelo, usos previstos ni limitaciones redactadas por el autor. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y los resultados de búsqueda web disponibles no aportan información adicional relevante sobre el modelo (corresponden a tiendas de instrumentos musicales).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) tipo DeiT-tiny, patch16-224 |
| Parametros totales | 5.524.995 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; entrada de imagen de 224x224 píxeles con parches de 16x16 (196 parches mas token CLS) |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizaciones) |
| Idiomas soportados | No disponible / no aplica (clasificacion de imagenes, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales: modelo base facebook/deit-tiny-patch16-224, pipeline image-classification, tamano del repositorio 0,0 GB, etiqueta endpoints_compatible, creado y actualizado el 2026-10-08.

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión (ViT) en la variante DeiT (*Data-efficient Image Transformers*), que divide la imagen de entrada en parches de 16x16 píxeles, los proyecta como *tokens* y los procesa con bloques de auto-atención. La variante "tiny" es la mas pequena de la familia DeiT, con 5.524.995 parametros totales en esta version ajustada (la cabecera de clasificacion se reduce a las clases del dataset de destino). No se documentan innovaciones tecnicas adicionales ni modificaciones sobre la arquitectura del modelo base.

El entrenamiento se realizo sobre el dataset AI-Lab-Makerere/beans mediante *fine-tuning* completo del modelo base. Los hiperparametros registrados son: learning rate 5e-05, tamano de lote de entrenamiento 32, tamano de lote de evaluacion 64, semilla 42, optimizador AdamW (variante ADAMW_TORCH_FUSED, betas (0,9; 0,999), epsilon 1e-08), planificador lineal y 5 epocas (165 pasos totales, 33 por epoca) con precision mixta nativa (AMP). No se indica en la informacion disponible si hubo RLHF, DPO ni ninguna otra fase de alineacion, ni el numero de tokens o imagenes del dataset, ni si se aplicaron tecnicas de aumento de datos. Las versiones de framework empleadas fueron Transformers 5.19.0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.2.

## Capacidades

- Clasificacion de imagenes: asigna una etiqueta de clase a una imagen de entrada dentro del dominio del dataset beans (imagenes de hojas).
- Inferencia sobre imagenes de 224x224 píxeles, resolucion fija derivada de la arquitectura patch16-224.
- Ejecucion en CPU: con 5,5 millones de parametros, el coste computacional por inferencia es minimo.
- Integracion directa con la libreria transformers mediante `pipeline("image-classification")` y con la API de HuggingFace (etiqueta endpoints_compatible).
- Ajuste fino adicional (*transfer learning*) sobre otros conjuntos de imagenes, al ser un checkpoint pequeno y rapido de reentrenar.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, capacidades de agente, multimodalidad de texto-imagen ni modo de razonamiento. Es exclusivamente un clasificador de imagenes.
- No se documentan capacidades multilingues (no procesa lenguaje natural).

## Casos de uso

- Clasificacion de hojas en aplicaciones agricolas moviles: el modelo puede integrarse en una app Android o iOS mediante ONNX Runtime para etiquetar fotografias de hojas capturadas en campo, con una huella de memoria de unos 22 MB en FP32 y sin necesidad de conectividad.
- Despliegue en dispositivos de borde: al tener 5,5 millones de parametros, cabe en una Raspberry Pi 4/5, en placas con Jetson Nano o incluso en microcontroladores con aceleracion suficiente, lo que permite monitorizacion continua en invernaderos o parcelas sin infraestructura de servidor.
- Etiquetado asistido y ampliacion de datasets: el modelo sirve como preanotador para clasificar grandes volumenes de imagenes de hojas antes de una revision humana, reduciendo el coste de anotacion manual.
- Experimentacion academica y docencia: es un caso de estudio util para ilustrar un ciclo completo de *fine-tuning* con el Trainer de HuggingFace, ocupando muy pocos recursos (5 epocas, 165 pasos) y ejecutable en portatil sin GPU.
- Inferencia por lotes de alto volumen en servidores sin GPU: su bajo coste permite procesar grandes colecciones de imagenes en CPU con un throughput elevado, util para catalogar archivos historicos de fotografias de cultivos.
- Punto de partida para *transfer learning*: al derivar de un checkpoint DeiT preentrenado en ImageNet, se puede reentrenar rapidamente con una cabecera distinta para otros dominios de clasificacion de imagenes con pocos datos.
- Validacion de pipelines de vision antes de escalar: sirve como modelo de prueba para verificar el correcto funcionamiento de un servicio de inferencia (transformers, ONNX Runtime, TensorRT o HF Inference Endpoints) antes de sustituirlo por un modelo mas grande.

## Benchmarks y rendimiento

El model-index del modelo no incluye entradas en el campo `results` (lista vacia). Los unicos datos disponibles son las metricas de evaluacion declaradas por el autor en la model card, obtenidas sobre el conjunto de evaluacion del dataset AI-Lab-Makerere/beans.

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,0988 |
| Accuracy | 0,9699 |
| F1 Macro | 0,9699 |

Evolucion durante el entrenamiento (datos declarados por el autor):

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 Macro |
|---|---|---|---|---|---|
| 0,4848 | 1,0 | 33 | 0,3876 | 0,8346 | 0,8393 |
| 0,2301 | 2,0 | 66 | 0,1710 | 0,9323 | 0,9327 |
| 0,1704 | 3,0 | 99 | 0,1809 | 0,9474 | 0,9472 |
| 0,1111 | 4,0 | 132 | 0,1075 | 0,9699 | 0,9699 |
| 0,1396 | 5,0 | 165 | 0,0988 | 0,9699 | 0,9699 |

No se han publicado resultados comparativos con otros modelos sobre este dataset en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 22 MB para los pesos en FP32, unos 11 MB en FP16 y unos 5,5 MB en INT8, a los que hay que sumar el coste de activaciones (despreciable a esta escala). Cabe en cualquier GPU, incluida una GTX 1050 de 2 GB.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (serie RTX 20/30/40, GTX 16xx o inferior) es mas que suficiente; A100 o H100 estan sobredimensionadas para este modelo.
- Compatibilidad con GPU consumer: si, en todas. Tambien funciona en CPU y en dispositivos de borde (Raspberry Pi, Jetson Nano, moviles).
- Opciones de despliegue: pipeline de transformers, HuggingFace Inference Endpoints (el modelo esta marcado como endpoints_compatible), exportacion a ONNX Runtime, TorchScript, TensorRT o TF Lite. vLLM y llama.cpp no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible (la model card no publica mediciones de latencia ni de imagenes por segundo).
- Requisitos de entrenamiento: el autor empleo precision mixta nativa (AMP) con un tamano de lote de 32 y 5 epocas; no se especifica el hardware de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Rendimiento en beans | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beans-deit-tiny | 5.524.995 | 224x224 (parches 16x16) | Accuracy 0,9699; F1 macro 0,9699 | Apache-2.0 | HuggingFace (Adamix3003/beans-deit-tiny) |
| facebook/deit-tiny-patch16-224 | Aproximadamente 5,5 M (misma arquitectura; la cabecera de 3 clases reduce ligeramente el total respecto al modelo original) | 224x224 | No disponible (no evaluado en beans en la informacion proporcionada) | Apache-2.0 | HuggingFace |
| Vision Transformers de mayor tamano (por ejemplo ViT-base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| Redes convolucionales ligeras (por ejemplo ResNet-50 y similares) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

En la informacion disponible no hay resultados de benchmarks de terceros sobre el dataset beans que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo ha sido ajustado para el dataset AI-Lab-Makerere/beans. Fuera de ese tipo de imagenes y de sus clases, las predicciones carecen de garantia.
- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling y no mantiene conversaciones. Cualquier uso en ese sentido es un error de aplicacion.
- Riesgo de sobreajuste: 5 epocas sobre un dataset pequeno con una mejora marginal entre la epoca 4 y la 5 (accuracy estable en 0,9699) sugieren que la capacidad de generalizacion fuera de la distribucion de evaluacion no esta demostrada.
- Sesgos conocidos: no disponible. La model card no documenta analisis de sesgos, composicion demografica ni posibles desequilibrios de clase en el dataset.
- Riesgo de alucinacion: en clasificacion de imagenes no aplica el concepto de alucinacion textual, pero si el de falsos positivos con alta confianza cuando la entrada no pertenece a ninguna de las clases aprendidas.
- Limitaciones de contexto o idioma: la entrada esta fijada a 224x224 píxeles con parches de 16x16; imagenes de otras resoluciones requieren redimensionado y pueden degradar la precision. El modelo no procesa texto ni idiomas.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial con atribucion y sin garantias. El dataset AI-Lab-Makerere/beans tiene su propia licencia, que debe verificarse por separado antes de cualquier uso comercial.
- Documentacion insuficiente para produccion: la model card contiene "More information needed" en descripcion, usos previstos y datos de entrenamiento; no consta numero de imagenes, reparto de clases ni estrategia de validacion.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, sin mantenimiento ni issues conocidos, lo que implica ausencia de soporte de la comunidad.
- Metricas no reproducibles con detalle: se declaran accuracy y F1 macro de 0,9699 sin publicar la matriz de confusion, el tamano exacto del conjunto de evaluacion ni el desglose por clase.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adamix3003/beans-deit-tiny
- Modelo base: https://huggingface.co/facebook/deit-tiny-patch16-224
- Dataset de ajuste fino: https://huggingface.co/datasets/AI-Lab-Makerere/beans
- Busqueda web: no se encontraron enlaces relevantes sobre este modelo; los resultados disponibles correspondian a tiendas de instrumentos musicales (Thomann) y no guardan relacion con el modelo.
- Paper de DeiT: no disponible en la informacion proporcionada.
- Repositorio de codigo o demo: no disponible en la informacion proporcionada.
