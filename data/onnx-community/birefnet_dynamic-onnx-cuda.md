# onnx-community/BiRefNet_dynamic-ONNX-CUDA

## Resumen

BiRefNet_dynamic-ONNX-CUDA es una exportación a ONNX en precisión FP16 del modelo BiRefNet_dynamic, desarrollado por ZhengPeng7 et al. para segmentación dicotómica de imágenes de alta resolución. El modelo original, presentado en el artículo "Bilateral Reference for High-Resolution Dichotomous Image Segmentation", combina una red bilateral con mecanismos de referencia para resolver tareas como detección de objetos salientes, segmentación de objetos camuflados y eliminación de fondos. Esta versión ONNX, publicada por onnx-community, está optimizada para inferencia en GPU mediante ONNX Runtime CUDA y NVIDIA Triton, con un error máximo absoluto de 0,004486 respecto al modelo PyTorch original.

El modelo acepta una imagen RGB de tamaño fijo 1024×1024 y devuelve una máscara alfa de probabilidad en el rango [0,1] con la misma resolución espacial que la entrada. La arquitectura emplea operadores DeformConv estándar de ONNX (opset 19) y requiere un runtime CUDA con soporte FP16 para estos operadores. Al estar diseñado exclusivamente para GPU, no es compatible con ejecución en CPU ni en navegador, lo que lo hace adecuado para despliegues de producción en servidores con aceleración NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red bilateral con DeformConv) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (pesos, entrada y salida) |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo `onnx/model.onnx`, sin datos externos) |

## Arquitectura y entrenamiento

BiRefNet es una red neuronal convolucional con mecanismos de atención bilateral que procesa la imagen a traves de multiples escalas para capturar tanto detalles finos como contexto global. La version exportada a ONNX mantiene la arquitectura original, incluyendo capas DeformConv que permiten adaptar los campos receptivos a la geometria de los objetos. El modelo fue entrenado originalmente por sus autores en el conjunto de datos DIS (Dichotomous Image Segmentation) y otros datasets de objetos salientes y camuflados, aunque los detalles exactos del entrenamiento (numero de tokens, composicion del dataset, tecnicas de RLHF/DPO) no estan disponibles en la informacion proporcionada.

La exportacion a ONNX fue realizada por onnx-community a partir de la revision `280306042f57b7a33854319da62fd86aaa89ec4c` del repositorio original. El grafo ONNX incluye la operacion sigmoid integrada, por lo que la salida `ALPHA` ya es una probabilidad en [0,1]. La validacion contra el modelo PyTorch en FP16 arrojo un error medio absoluto de 1,4735e-5 y un error maximo de 0,004486, lo que indica una fidelidad practicamente identica.

## Capacidades

- Segmentacion dicotomica de imagenes: distingue el objeto principal del fondo con alta precision, incluso en escenas complejas.
- Deteccion de objetos salientes: identifica las regiones visualmente mas prominentes de una imagen.
- Deteccion de objetos camuflados: localiza objetos que se confunden con el entorno.
- Generacion de mascaras alfa: produce una mascara de transparencia utilizable para composicion y eliminacion de fondos.
- Soporte de batch dinamico: el eje de batch es dinamico, permitiendo procesar multiples imagenes en una sola pasada.
- Salida a resolucion nativa: la mascara generada tiene la misma resolucion espacial que la imagen de entrada (tras el reescalado interno a 1024×1024).

## Casos de uso

- Eliminacion de fondos en fotografia de producto: el modelo genera una mascara alfa precisa que permite aislar el producto y reemplazar el fondo por un color liso o una imagen personalizada, ideal para catalogos de e-commerce.
- Segmentacion de objetos en imagenes medicas: aunque no esta especificamente entrenado para este dominio, puede utilizarse como preprocesamiento para aislar estructuras anatomicas en radiografias o ecografias, siempre que se valide su rendimiento en el conjunto de datos concreto.
- Composicion de imagenes y montaje fotografico: la mascara alfa de alta calidad facilita la integracion de objetos en nuevas escenas, reduciendo el trabajo manual en herramientas de edicion.
- Deteccion de objetos camuflados en vigilancia: en entornos de seguridad, el modelo puede localizar personas o vehiculos que se mimetizan con el fondo, mejorando sistemas de alerta automatica.
- Preprocesamiento para otros modelos de vision: la mascara generada puede servir como entrada para modelos de clasificacion, deteccion o generacion que requieran aislar el objeto principal.
- Despliegue en servidores de inferencia con NVIDIA Triton: el modelo esta validado para Triton 26.08, permitiendo integrarlo en pipelines de produccion con gestion de batch dinamico y colas de peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta exportacion ONNX en la informacion disponible. El modelo original BiRefNet reporta metricas en su articulo cientifico (CAAI Artificial Intelligence Research, 2024), pero esos datos no estan incluidos en la documentacion de este repositorio. La unica validacion cuantitativa disponible es la comparacion con el modelo PyTorch fuente: error medio absoluto de 1,4735e-5 y error maximo de 0,004486 en FP16.

## Requisitos de hardware

- GPU NVIDIA con soporte CUDA y capacidad de computo 7.0 o superior (para operaciones FP16).
- VRAM estimada: no disponible en la documentacion, aunque el peso del modelo es de aproximadamente 0,5 GB en FP16, por lo que una GPU con 4 GB de VRAM deberia ser suficiente para inferencia con batch pequeno.
- GPU recomendadas: NVIDIA T4, V100, A100, RTX 3090, RTX 4090 o superiores.
- No es compatible con CPU ni con ejecucion en navegador (WebGPU/WebGL).
- Opciones de despliegue: ONNX Runtime CUDA (con `CUDAExecutionProvider`) y NVIDIA Triton Inference Server (plataforma `onnxruntime_onnx`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Precision | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BiRefNet_dynamic-ONNX-CUDA (este) | ONNX | FP16 | 1024×1024 RGB | Mascara alfa | MIT | HuggingFace |
| BiRefNet_dynamic-ONNX (onnx-community) | ONNX | FP16 | dinamica | Mascara alfa | MIT | HuggingFace (para Transformers.js/WebGPU) |
| BiRefNet original (ZhengPeng7) | PyTorch | FP32/FP16 | dinamica | Mascara alfa | MIT | GitHub, HuggingFace |

La principal diferencia con la version ONNX estandar es que esta exportacion esta especificamente optimizada para CUDA y Triton, con tamaño de entrada fijo y validacion en FP16. La version original en PyTorch ofrece mayor flexibilidad de entrada y puede ejecutarse en CPU, aunque con menor rendimiento.

## Limitaciones y advertencias

- El modelo solo acepta imagenes RGB; la decodificacion, orientacion, reescalado y composicion alfa son responsabilidad de la aplicacion.
- A pesar del nombre "dynamic", esta exportacion no acepta tamanos espaciales arbitrarios: la entrada debe ser 1024×1024.
- No es compatible con CPU ni con ejecucion en navegador; requiere un runtime ONNX Runtime CUDA con soporte FP16 para DeformConv.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado principalmente con imagenes naturales, puede tener un rendimiento inferior en imagenes sinteticas o dominios muy especializados.
- Riesgo de alucinacion: en segmentacion, el modelo puede generar mascaras incorrectas en imagenes ambiguas o con multiples objetos superpuestos.
- La licencia MIT permite uso comercial, pero se recomienda verificar la atribucion requerida por el articulo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/onnx-community/BiRefNet_dynamic-ONNX-CUDA
- Repositorio original en GitHub: https://github.com/ZhengPeng7/BiRefNet
- Articulo cientifico: https://doi.org/10.48550/arXiv.2401.xxxx (DOI no confirmado; buscar "Bilateral Reference for High-Resolution Dichotomous Image Segmentation")
- Version ONNX para WebGPU/Transformers.js: https://huggingface.co/onnx-community/BiRefNet_dynamic-ONNX
- Modelo base en HuggingFace: https://huggingface.co/ZhengPeng7/BiRefNet_dynamic
