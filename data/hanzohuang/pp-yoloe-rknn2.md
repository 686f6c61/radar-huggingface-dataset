# HanzoHuang/PP-YOLOE-RKNN2

## Resumen

PP-YOLOE-RKNN2 es un conjunto de artefactos de despliegue (model zoo) que empaqueta el detector de objetos PP-YOLOE convertido al formato RKNN para su ejecución sobre las NPU de los SoC Rockchip RK3576 y RK3588. No se trata de un modelo entrenado desde cero por el autor, sino de builds derivados de PP-YOLOE, un detector de la familia YOLO desarrollado originalmente por Baidu (PaddlePaddle), y convertidos con RKNN Toolkit2 2.5.0. El repositorio lo publica el usuario HanzoHuang y su interés práctico está en facilitar la inferencia de detección de objetos en placas Rockchip sin tener que repetir el pipeline de conversión ONNX a RKNN.

El modelo resuelve el problema de llevar un detector de objetos a hardware de borde con NPU dedicada, un escenario habitual en visión artificial embebida (vigilancia, robótica, inspección industrial). La relevancia actual viene de la popularidad de RK3588 y del nuevo RK3576 en dispositivos tipo single-board computer y cajas de inferencia de bajo consumo, donde el formato nativo RKNN es la vía para explotar la NPU.

La información publicada es muy escasa: no se detallan parámetros, contexto, idiomas ni resultados de benchmarks. El repositorio ocupa 0,2 GB y los pesos se distribuyen organizados por versión de toolkit, tarea, variante, chip y precisión (por ejemplo `models/v2.5.0/...`). La licencia se declara como "other", con términos heredados del artefacto original y enlace a un fichero `LICENSES.md` en el propio repositorio. No dispone de descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PP-YOLOE (detector de objetos de la familia YOLO, base PaddlePaddle) convertido a RKNN; detalles de backbone y neck no disponibles en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no generativo de texto) |
| Tipos de cuantización | builds por precisión bajo la ruta `/<precision>/`; los valores concretos (p. ej. int8, fp16) no están disponibles en la información proporcionada |
| Idiomas soportados | no disponible (tarea de visión; sin capacidades lingüísticas) |
| Licencia | other, con `license_name: upstream-terms-by-artifact` y términos en `LICENSES.md` |
| Formato de pesos | RKNN (RKNN Toolkit2 2.5.0); el ONNX de origen se identifica en las "conversion receipts" |

## Arquitectura y entrenamiento

PP-YOLOE es un detector de objetos de una etapa, sucesor de PP-YOLOv2 dentro del ecosistema PaddleDetection de Baidu. La información disponible no detalla la arquitectura interna de la variante concreta empaquetada (backbone, neck, cabeza de detección), ni el número de parámetros. Los artefactos publicados no son pesos de entrenamiento en sentido estricto, sino modelos convertidos a RKNN para inferencia en NPU Rockchip.

El proceso de producción de estos builds pasa por exportar el modelo original a ONNX y convertirlo con RKNN Toolkit2 2.5.0. El autor indica que las "conversion receipts" identifican el ONNX de origen y el conversor empleado, y remite a `LICENSES.md` para los avisos de origen y licencia. No hay información sobre datos de entrenamiento, número de tokens o imágenes, composición del dataset, ni sobre técnicas de alineación como RLHF o DPO (no aplicables a un detector).

## Capacidades

- Detección de objetos en imágenes: el pipeline declarado es `object-detection`.
- Ejecución en NPU de Rockchip RK3576 y RK3588 mediante el runtime RKNN.
- Distribución en variantes por chip y por precisión, lo que permite elegir el build según el hardware y el compromiso precisión/rendimiento.
- Trazabilidad del origen: los receipts de conversión permiten identificar el ONNX y el conversor usados.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión generativa, tool calling, agentes ni capacidades multilingües.
- No se documentan capacidades adicionales (segmentación, pose, clasificación) en la información proporcionada.

## Casos de uso

- Visión artificial en borde sobre RK3588: desplegar detección de objetos directamente en la NPU de una single-board computer para aplicaciones de vigilancia o conteo de personas, aprovechando el build específico para ese chip y evitando la conversión manual del modelo.
- Cajas de inferencia con RK3576: usar el build correspondiente a este SoC en dispositivos de bajo consumo para tareas de detección continua en tiempo real.
- Inspección industrial en línea de producción: integrar el detector en una cámara o controlador basado en Rockchip para identificar defectos o piezas, seleccionando la precisión adecuada según la tasa de aciertos requerida.
- Robótica móvil y drones: detección de obstáculos o personas a bordo, donde el consumo energético de la NPU Rockchip es determinante frente a soluciones con GPU.
- Sistemas de videovigilancia con procesamiento local: reducir el ancho de banda y la dependencia de la nube ejecutando la detección en el propio dispositivo Rockchip.
- Prototipado rápido de pipelines de detección: servir como punto de partida verificable (con receipts de conversión) para equipos que necesiten comparar variantes por chip y precisión antes de entrenar o convertir su propio modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NPU de Rockchip RK3576 y RK3588; no está pensado para GPU NVIDIA ni para CPU genérica en su formato RKNN.
- VRAM: no aplica; el consumo relevante es memoria del sistema y memoria de la NPU del SoC, cuyo valor no está disponible.
- GPU recomendadas: no aplica; el despliegue se realiza sobre la NPU integrada del SoC Rockchip.
- Compatibilidad con GPU de consumo: no aplica en formato RKNN; requeriría reconvertir el ONNX de origen a otro runtime.
- Opciones de despliegue: runtime RKNN de Rockchip (RKNN Toolkit2 2.5.0 para la conversión); vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Familia / tarea | Formato | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PP-YOLOE-RKNN2 | PP-YOLOE / detección de objetos | RKNN | NPU RK3576 y RK3588 | other (términos upstream) | Hugging Face, 0 descargas |
| PP-YOLOE (original, PaddleDetection) | PP-YOLOE / detección de objetos | Paddle / ONNX | GPU y CPU genéricas | según PaddleDetection (no verificada aquí) | Repositorio oficial de PaddleDetection |
| YOLOv8 / YOLO11 (Ultralytics) | YOLO / detección de objetos | PyTorch, ONNX, exportables | GPU, CPU y múltiples aceleradores | AGPL-3.0 o licencia comercial | Ultralytics y Hugging Face |
| YOLOv5 | YOLO / detección de objetos | PyTorch, ONNX | GPU y CPU | GPL-3.0 | Ultralytics |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Información muy escasa: no se publican parámetros, resolución de entrada, clases del dataset ni métricas, lo que impide evaluar su calidad antes de desplegarlo.
- Licencia "other" con términos heredados del artefacto original: es imprescindible revisar `LICENSES.md` antes de cualquier uso comercial, ya que las condiciones pueden depender del modelo PP-YOLOE de origen y de PaddleDetection.
- Solo válido para NPU Rockchip RK3576 y RK3588; no es portable directamente a otros aceleradores sin reconversión desde el ONNX.
- Riesgo de alucinación no aplicable (no es un modelo generativo), pero sí riesgo de falsos positivos y falsos negativos propios de cualquier detector, agravado por la cuantización a precisiones bajas.
- No hay información sobre sesgos del dataset de entrenamiento original ni sobre su cobertura de clases.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de comunidad, mantenimiento ni validación independiente.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HanzoHuang/PP-YOLOE-RKNN2
- Términos de licencia del repositorio: https://huggingface.co/HanzoHuang/PP-YOLOE-RKNN2/blob/main/LICENSES.md
- PP-YOLOE (paper): https://arxiv.org/abs/2203.16250
- PaddleDetection (repositorio oficial): https://github.com/PaddlePaddle/PaddleDetection
- RKNN Toolkit2 (Rockchip): https://github.com/airockchip/rknn-toolkit2
