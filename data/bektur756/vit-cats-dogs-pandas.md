# Bektur756/vit-cats-dogs-pandas

## Resumen
Bektur756/vit-cats-dogs-pandas es un clasificador de imágenes basado en un Vision Transformer (ViT) afinado para distinguir tres clases de animales: gatos (`0`), perros (`1`) y pandas (`2`). Lo publica el usuario Bektur756 en Hugging Face como un fine-tuning del checkpoint `google/vit-base-patch16-224`, del que hereda la arquitectura y los pesos preentrenados en ImageNet. El modelo resuelve un problema muy acotado de clasificación de imagen de tres clases mediante una cabeza lineal `Linear(768, 3)` sobre el token `[CLS]`.

El modelo tiene 85.800.963 parámetros totales, de los cuales solo 14.179.587 (16,53%) fueron entrenables durante el ajuste: los bloques transformer 10 y 11, la LayerNorm final y la cabeza de clasificación. Se entrenó durante 7 épocas con batch size 16, learning rate 2e-5 y weight decay 0,01 sobre el dataset `Melisa13/Animals_dataset`, que contiene 408 imágenes de entrenamiento, 72 de validación y 120 de test, repartidas de forma equilibrada entre las tres clases.

Su relevancia es la de un ejemplo reproducible y ligero de fine-tuning parcial de un ViT: el repositorio ocupa 0,4 GB, se ejecuta en una Tesla T4 a 21,86 ms de latencia media por imagen (45,75 imágenes/s) y cabe holgadamente en cualquier GPU de consumo. Los resultados publicados son de 98,61% de accuracy y macro F1 en validación, y 100% en test, si bien el propio autor advierte que el conjunto de test es muy pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base), patch size 16x16, hidden size 768, 12 bloques transformer, cabeza `Linear(768, 3)` sobre el token `[CLS]` |
| Parametros totales | 85.800.963 |
| Longitud de contexto | No aplica en el sentido de texto: la entrada es una imagen RGB redimensionada y recortada a 224x224 px, que se tokeniza en 196 parches + 1 token `[CLS]` = 197 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada. Al ser un modelo de 86 M de parametros admite fp32 y fp16 nativos, y cuantizacion dinamica int8 mediante PyTorch |
| Idiomas soportados | en (etiquetas y documentacion en ingles; la tarea es de vision, no linguistica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Parametros entrenables | 14.179.587 (16,53%): bloques 10 y 11, LayerNorm final y cabeza de clasificacion |
| Numero de clases | 3 (cats = 0, dogs = 1, panda = 2) |
| Preprocesado | RGB, resize y crop a 224x224, normalizacion con media (0,5, 0,5, 0,5) y desviacion tipica (0,5, 0,5, 0,5) |
| Modelo base | google/vit-base-patch16-224 |
| Dataset de entrenamiento | Melisa13/Animals_dataset (408 train / 72 validacion / 120 test) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento
La arquitectura es un Vision Transformer estandar de tipo ViT-Base: la imagen de 224x224 px se divide en parches de 16x16 (196 parches), se proyectan linealmente a un espacio de 768 dimensiones y se procesan junto a un token `[CLS]` a traves de 12 bloques transformer con atencion multi-cabeza. La clasificacion final se realiza con una capa lineal `Linear(768, 3)` aplicada sobre la representacion del token `[CLS]`. No hay decodificacion autoregresiva, atencion lineal, mezcla de expertos ni componentes de estado recurrente: es un encoder de vision puro para clasificacion.

El entrenamiento consistio en un fine-tuning parcial, no completo: solo se actualizaron los bloques transformer 10 y 11, la LayerNorm final y la nueva cabeza de clasificacion, dejando congelado el resto del backbone preentrenado. Se completaron 7 epocas con batch size 16, learning rate 2e-5 y weight decay 0,01 sobre `Melisa13/Animals_dataset`, con 136 imagenes por clase en entrenamiento y sin duplicados exactos entre splits. La model card no documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision. El dataset es pequeno (600 imagenes en total), lo que explica tanto la rapidez del ajuste como la advertencia del autor sobre la generalizacion.

## Capacidades
- Clasificacion de imagenes en tres clases cerradas: gatos, perros y panda.
- Salida de probabilidades por clase mediante `softmax` sobre los logits, lo que permite aplicar umbrales de confianza propios.
- Inferencia de imagen individual en formato PIL, RGB, con el procesador `AutoImageProcessor` de `transformers`.
- Compatibilidad con el pipeline `image-classification` de Hugging Face y con `endpoints_compatible`.
- Funciona en CPU y en GPU sin cambios de codigo, con una diferencia de latencia de aproximadamente 27x entre Colab CPU y Tesla T4.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generacion de texto, codigo, matematicas, audio ni vision mas alla de la clasificacion de las tres clases indicadas.
- No tiene capacidades multilingues: es un modelo de vision y sus etiquetas estan en ingles.

## Casos de uso
- Clasificacion automatica de fotos en una galeria domestica: el modelo permite separar imagenes de gatos, perros y pandas en carpetas en un pipeline por lotes, con una latencia de 21,86 ms por imagen en T4.
- Filtrado previo en datasets de imagenes de animales: dado su bajo coste computacional (86 M de parametros, 0,4 GB de repo), sirve como etiquetador rapido para preanotar grandes volumenes antes de una revision humana o de un modelo mayor.
- Clasificacion en el borde o en dispositivos sin GPU: al ser un modelo pequeno, puede ejecutarse en CPU o exportarse a formatos ligeros para aplicaciones moviles o embebidas donde la latencia no sea critica.
- Demostracion educativa de fine-tuning de un ViT: el repositorio documenta de forma explicita que capas se entrenaron, con que hiperparametros y con que resultados, lo que lo convierte en un ejemplo util para ensenar transferencia de aprendizaje con `transformers`.
- Prototipado rapido de un servicio de clasificacion con la API de Hugging Face Inference Endpoints: la etiqueta `endpoints_compatible` permite desplegarlo sin escribir capa de servido propia.
- Enrutado de imagenes dentro de una aplicacion mayor: por ejemplo, decidir que flujo de post-procesado aplicar segun si la imagen contiene un gato, un perro o un panda, usando las probabilidades devueltas como puntuacion de confianza.
- Pruebas de regresion de infraestructura de inferencia: su latencia medida en T4 y en CPU lo hace util como modelo de referencia para comparar rendimiento entre runtimes (PyTorch, ONNX Runtime, TensorRT).

## Benchmarks y rendimiento
Resultados publicados por el autor en la model card:

| Split | Accuracy | Macro F1 |
|---|---:|---:|
| Validacion | 98,61% | 98,61% |
| Test | 100,00% | 100,00% |

Informe de clasificacion sobre el conjunto de test:

| Clase | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| Cats | 1,0000 | 1,0000 | 1,0000 | 40 |
| Dogs | 1,0000 | 1,0000 | 1,0000 | 40 |
| Panda | 1,0000 | 1,0000 | 1,0000 | 40 |

Latencia extremo a extremo (preprocesado + inferencia, batch size 1):

| Dispositivo | Media | Mediana | P95 | Throughput |
|---|---:|---:|---:|---:|
| Tesla T4 | 21,86 ms | 18,37 ms | 39,92 ms | 45,75 imagenes/s |
| Colab CPU | 599,39 ms | 371,03 ms | 1550,67 ms | 1,67 imagenes/s |

No se han publicado comparaciones con otros modelos en la informacion disponible; los unicos numeros disponibles son los de la propia model card y corresponden a un test de 120 imagenes.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (86 M de parametros), 0,18 GB en fp16 y 0,09 GB en int8, sin contar el pequeno overhead de activaciones y del procesador de imagenes.
- GPU recomendadas: cualquier GPU moderna sirve; el autor reporta mediciones en Tesla T4 (21,86 ms de media). En GPUs de gama alta como A100, H100, RTX 4090 o L4 la latencia sera inferior, aunque el modelo esta limitado por el preprocesado y el lanzamiento de kernels mas que por el computo.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con memoria compartida, dado el reducido tamano del modelo.
- Tambien funciona en CPU: el autor reporta 599,39 ms de media por imagen en Colab CPU (1,67 imagenes/s), con un P95 de 1550,67 ms, lo que lo hace apto para uso no interactivo.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification`, pipeline `image-classification`, Hugging Face Inference Endpoints (`endpoints_compatible`), exportacion a ONNX o TorchScript para servir con ONNX Runtime. No es un modelo generativo, por lo que vLLM o TGI no son las herramientas indicadas.
- Latencia y throughput medidos: 45,75 imagenes/s en Tesla T4 con batch size 1 y 1,67 imagenes/s en CPU de Colab; aumentar el batch deberia mejorar el throughput en GPU al amortizar el preprocesado.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto de entrada | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Bektur756/vit-cats-dogs-pandas | 85,8 M | 3 (gatos, perros, panda) | 224x224 px, 197 tokens | apache-2.0 | Hugging Face |
| google/vit-base-patch16-224 (modelo base) | 86,4 M aprox. | 1000 (ImageNet-1k) | 224x224 px, 197 tokens | apache-2.0 | Hugging Face |
| google/vit-base-patch16-224-in21k | 86,4 M aprox. | preentrenado sin cabeza de clasificacion | 224x224 px, 197 tokens | apache-2.0 | Hugging Face |

Comparado con el checkpoint base, este modelo sacrifica cobertura (pasa de 1000 clases a 3) a cambio de especializacion en el dominio de animales; el modelo base no distingue gatos de perros de forma fiable como categorias aisladas dentro de sus 1000 clases de ImageNet. No se dispone de resultados comparativos de benchmarks frente a esos modelos dentro de la informacion proporcionada, y no se han identificado en la busqueda web alternativas equivalentes entrenadas especificamente sobre las mismas tres clases.

## Limitaciones y advertencias
- El conjunto de test contiene solo 120 imagenes (40 por clase); un 100% de accuracy no implica un rendimiento equivalente en imagenes arbitrarias del mundo real.
- El dataset de entrenamiento es pequeno y relativamente simple (600 imagenes en total), con 136 imagenes por clase en entrenamiento, lo que limita la diversidad de razas, iluminacion, fondos y angulos de camara cubiertos.
- Riesgo de sobreajuste al dominio del dataset `Melisa13/Animals_dataset`; imagenes con oclusiones, dibujos, animales lejanos o especies distintas pueden degradar la precision.
- La clasificacion es cerrada: cualquier imagen que no sea un gato, un perro o un panda se asignara forzosamente a una de las tres clases con una probabilidad asociada, sin opcion de "desconocido" integrada.
- El modelo solo fue entrenado con imagenes (no texto); no tiene capacidades de generacion, razonamiento ni agentes, y por tanto no debe evaluarse como un modelo de lenguaje.
- La inferencia en CPU es sustancialmente mas lenta que en GPU (599,39 ms frente a 21,86 ms de media), lo que puede ser un problema en aplicaciones interactivas sin acelerador.
- No se documentan sesgos especificos, pero al derivar de un ViT preentrenado en ImageNet hereda los sesgos de ese corpus, no auditados en esta ficha.
- Licencia apache-2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se cumplan las condiciones del modelo base `google/vit-base-patch16-224`, tambien apache-2.0. No se anaden restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no ha pasado por un proceso de validacion externo; conviene verificarlo con datos propios antes de usarlo en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Bektur756/vit-cats-dogs-pandas
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Dataset de entrenamiento: https://huggingface.co/datasets/Melisa13/Animals_dataset
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a la pelicula "Wolves" de 2014 y no guardan relacion), por lo que no se dispone de papers, blogs, repositorios ni demos adicionales que enlazar.
