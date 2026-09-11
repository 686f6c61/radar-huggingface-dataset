# ownlwh/bookbuddy-ppyoloe-r-s-dev

## Resumen

BookBuddy PP-YOLOE-R-s development artifact es un artefacto ONNX de detección de objetos con cajas orientadas (*oriented bounding boxes*) publicado por el usuario ownlwh dentro del proyecto BookBuddy. No es un modelo entrenado por el autor: se trata de una conversión mecánica del checkpoint `ppyoloe_r_crn_s_3x_dota.pdparams` de PaddleDetection (release/2.9) a ONNX opset 11, realizada con Paddle 2.6.2 y paddle2onnx 1.2.6. Su función declarada es validar la descarga de modelos, la comprobación de integridad, la carga en ONNX Runtime, el post-procesado de cajas rotadas y el recorte de imágenes dentro de la aplicación BookBuddy.

El modelo pertenece a la familia PP-YOLOE-R, detectores de una sola etapa y *anchor-free* cuya cabeza devuelve cuadriláteros (8 coordenadas por instancia) en lugar de cajas alineadas con los ejes. El artefacto pesa 32.527.378 bytes (unos 32,5 MB) en fp32, lo que equivale a del orden de 8,1 millones de parámetros según una estimación aritmética a partir del tamaño del archivo (no es un dato publicado por el autor). La entrada admite imágenes con lado máximo de 1024 píxeles y la salida cubre 15 clases, correspondientes a las categorías de DOTA 1.0.

Su relevancia es deliberadamente limitada y muy específica: el propio autor lo etiqueta como *development-only*, advierte de que no es un modelo de lomos de libros y prohíbe su inclusión en TestFlight, App Store, producción o cualquier distribución externa, porque DOTA (el dataset de entrenamiento) restringe sus imágenes y anotaciones a uso académico y prohíbe el uso comercial. Con 0 descargas y 0 likes, el repositorio tampoco aporta validación alguna por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PP-YOLOE-R (detector de objetos orientado, una etapa, *anchor-free*); implementación de origen en PaddleDetection release/2.9 |
| Parámetros totales | No publicado. Estimación a partir del tamaño del ONNX en fp32: ~8,1 millones (32.527.378 bytes / 4) |
| Parámetros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No aplica. Modelo de visión con entrada de imagen de lado máximo 1024 px y *padding* a stride 32 |
| Tipos de cuantización | No disponible. Solo se distribuye el artefacto ONNX en fp32 (opset 11); no hay pesos INT8, FP16 ni GGUF |
| Idiomas soportados | No aplica / no disponible. Modelo de visión; la model card no declara capacidades lingüísticas |
| Licencia | `other`. El artefacto hereda la restricción de DOTA 1.0: uso académico únicamente, prohibido el uso comercial y prohibida su distribución externa |
| Formato de pesos | ONNX (opset 11), fp32, archivo único de 32.527.378 bytes, SHA-256 `e6eeeedbd687ef8e378608cb6d0e81e44826d20444c6b5bed12a92bbf8e897e4` |

## Arquitectura y entrenamiento

La arquitectura de origen es PP-YOLOE-R en su variante *small* (sufijo `crn_s` en el nombre del checkpoint), un detector orientado de una sola etapa y sin anclas que predice cuadriláteros en lugar de rectángulos alineados a los ejes. La interfaz de ejecución del artefacto ONNX es explícita: entradas `image` float32 `[1,3,H,W]` y `scale_factor` float32 `[1,2]`; salidas `quadrilaterals` `[1,N,8]` y `class_scores` `[1,15,N]`. El preprocesado asociado es RGB, lado máximo 1024, *padding* inferior/derecho hasta múltiplo de 32 y normalización con media y desviación típica de ImageNet.

Según declara el propio repositorio, el entrenamiento del checkpoint de origen se hizo sobre DOTA 1.0 y el nombre del archivo (`3x_dota`) corresponde al esquema de entrenamiento 3x de PaddleDetection. La model card no aporta información sobre número de tokens o imágenes vistas, composición exacta del dataset, funciones de pérdida ni uso de RLHF/DPO; en un detector de objetos, además, esas técnicas de alineación lingüística no aplican. La conversión a ONNX se realizó de forma mecánica con Paddle 2.6.2 y paddle2onnx 1.2.6, sin *fine-tuning* posterior ni adaptación al dominio de libros.

## Capacidades

- Detección de objetos con cajas orientadas: devuelve cuadriláteros (8 valores por instancia) y puntuaciones por clase, lo que permite representar objetos rotados sin la pérdida de precisión de las cajas axis-aligned.
- Clasificación en 15 categorías, coherentes con las clases de DOTA 1.0 (aviones, barcos, depósitos, campos deportivos, vehículos, puentes, puertos, etc.).
- Inferencia vía ONNX Runtime en CPU y en *execution providers* acelerados (CUDA, TensorRT, OpenVINO, CoreML, NNAPI, DirectML, QNN).
- Integración en pipelines de visión con preprocesado y postprocesado propios (redimensionado, *padding* a stride 32, normalización ImageNet, NMS rotado y recorte de regiones).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión-lenguaje, *tool calling*, uso de agentes ni capacidades multilingües.
- No dispone de *thinking mode*, audio ni ninguna otra modalidad: es exclusivamente un detector de imágenes.

## Casos de uso

- Validación del pipeline de descarga del proyecto BookBuddy: el artefacto sirve para comprobar de extremo a extremo la descarga del modelo, la verificación del SHA-256 y la carga correcta del grafo en ONNX Runtime antes de sustituirlo por un modelo definitivo.
- Pruebas automatizadas de post-procesado de cajas rotadas: al producir cuadriláteros `[1,N,8]` con 15 puntuaciones de clase, permite validar en integración continua la conversión de cuadriláteros a polígonos, el cálculo de IoU rotado y el NMS específico para cajas orientadas.
- Validación del recorte de imágenes: los cuadriláteros de salida alimentan directamente el recorte de regiones de interés, de modo que el artefacto se usa para verificar que el *cropping* respeta la geometría rotada y el *padding* aplicado en el preprocesado.
- Comprobación de portabilidad multiplataforma: al ocupar unos 32,5 MB, es un candidato cómodo para verificar que el mismo ONNX se ejecuta sin errores en los *execution providers* de iOS (CoreML), Android (NNAPI) y escritorio, algo que resulta caro de probar con modelos grandes.
- *Benchmarking* interno del runtime: permite medir latencia y *throughput* del ONNX Runtime con distintos *providers* y tamaños de entrada, y comparar la degradación al variar el lado máximo entre 512 y 1024 píxeles.
- Investigación académica sobre detección orientada en imágenes aéreas: con DOTA 1.0 el modelo detecta aviones, barcos, campos deportivos, puentes o vehículos en imágenes de teledetección; este uso queda estrictamente dentro del ámbito académico por la licencia del dataset.
- Pruebas de regresión de código de visión: sirve como referencia estable (mismo SHA-256) para comparar las salidas antes y después de un refactor del preprocesado o del postprocesado, detectando cambios numéricos no intencionados.
- Punto de partida para *fine-tuning*: la arquitectura PP-YOLOE-R-s es un esqueleto razonable para reentrenar sobre datos propios con licencia limpia (por ejemplo, lomos de libros en estanterías) antes de cualquier distribución real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mAP sobre DOTA 1.0 ni sobre ningún otro conjunto, ni cifras de latencia o *throughput*. Cualquier valor de precisión del proyecto upstream (PaddleDetection) correspondería al checkpoint original en formato Paddle y no está recogido en este repositorio, por lo que no se reproduce aquí.

## Requisitos de hardware

- VRAM estimada: los pesos fp32 ocupan unos 32,5 MB; con entradas de hasta 1024 px de lado y lote 1, el consumo agregado se mantiene holgadamente por debajo de 1 GB. Es viable la inferencia en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU de gama alta. Una GTX 1650, RTX 3050 o cualquier integrada moderna con soporte ONNX Runtime es suficiente; A100, H100 o RTX 4090 están sobredimensionadas para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en dispositivos móviles de gama media y en placas tipo Raspberry Pi o Jetson mediante NNAPI, CoreML o QNN.
- Opciones de despliegue: ONNX Runtime en sus distintas variantes (Python, C++, C#, Java, JavaScript) con *execution providers* CPU, CUDA, TensorRT, OpenVINO, DirectML, CoreML, NNAPI y QNN. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión en ONNX.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones y estas dependen por completo del *provider*, del hardware y del tamaño de imagen (entre 512 y 1024 px de lado máximo).

## Comparativa con modelos similares

| Modelo | Parámetros | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|
| BookBuddy PP-YOLOE-R-s (este artefacto) | ~8,1 M (estimado por tamaño de archivo) | ONNX opset 11, fp32 | `other`, uso académico, sin uso comercial ni distribución externa | Repositorio de HuggingFace, 0 descargas |
| PP-YOLOE-R-s upstream (PaddleDetection) | No disponible | `.pdparams` (Paddle) | Código Apache-2.0; el checkpoint entrenado con DOTA queda sujeto a la restricción académica del dataset | Sí, en el zoo de modelos de PaddleDetection |
| Oriented R-CNN (MMRotate) | No disponible | `.pth` (PyTorch) | Código Apache-2.0; checkpoints de DOTA sujetos a la restricción del dataset | Sí, en el zoo de MMRotate |
| YOLOv8-OBB / YOLO11-OBB (Ultralytics) | No disponible | `.pt`, ONNX y otros | AGPL-3.0 o licencia comercial de Ultralytics | Sí, distribución pública |

La comparación cuantitativa de precisión no es posible con los datos disponibles: ninguno de estos proyectos publica en esta ficha cifras verificables de mAP para el mismo esquema de entrenamiento. La diferencia práctica principal de este artefacto frente a los otros tres es su naturaleza de material de desarrollo interno con licencia restrictiva, no un sustituto listo para producción.

## Limitaciones y advertencias

- Licencia restrictiva: el artefacto se distribuye bajo `other` y hereda la limitación de DOTA 1.0, que restringe imágenes y anotaciones a uso académico y prohíbe el uso comercial. Está además prohibida su inclusión en TestFlight, App Store, producción o cualquier distribución externa.
- No es un modelo de lomos de libros: el autor lo indica de forma explícita. Su uso previsto es la validación del pipeline, no la tarea final del producto BookBuddy.
- Dominio desalineado: al estar entrenado con DOTA 1.0 (imágenes aéreas), su comportamiento sobre fotografías de estanterías o de objetos cotidianos es impredecible y no debe extrapolarse.
- Riesgo de falsos positivos por detección: como cualquier detector entrenado con una taxonomía cerrada de 15 clases, tiende a forzar asignaciones de clase sobre objetos fuera de distribución, además de producir cajas de baja confianza en zonas ambiguas. Aquí no existe riesgo de alucinación textual porque el modelo no genera lenguaje.
- Dependencia estricta del preprocesado: RGB, lado máximo 1024, *padding* inferior/derecho a múltiplo de 32 y normalización ImageNet. Cualquier desviación degrada las salidas sin aviso de error.
- Sin datos de validación: 0 descargas y 0 likes implican que el artefacto no ha sido replicado ni auditado por terceros. El SHA-256 permite verificar integridad, pero no corrección funcional.
- Sin cuantizaciones ni variantes: solo hay fp32 ONNX opset 11; no se ofrecen versiones INT8, FP16, TensorRT ni GGUF, lo que limita el ajuste fino de rendimiento en *edge*.
- Sin información de sesgos: no se ha publicado ningún análisis de sesgo por tipo de imagen, región geográfica o condiciones de captura.
- Sustitución obligatoria antes de publicar: el propio autor exige reemplazar el artefacto por un checkpoint entrenado con datos propios o con licencia adecuada antes del lanzamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ownlwh/bookbuddy-ppyoloe-r-s-dev
- PaddleDetection (implementación y arquitectura de origen, release/2.9): https://github.com/PaddlePaddle/PaddleDetection
- Paddle2ONNX (herramienta de conversión utilizada): https://github.com/PaddlePaddle/Paddle2ONNX
- ONNX Runtime (runtime de inferencia del artefacto): https://github.com/microsoft/onnxruntime
- Página oficial del dataset DOTA, con las condiciones de uso académico: https://captain-whu.github.io/DOTA/dataset.html
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; las búsquedas devolvieron únicamente páginas de TikTok sin relación con el modelo.
