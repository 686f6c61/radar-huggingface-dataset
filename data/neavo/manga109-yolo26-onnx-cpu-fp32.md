# neavo/Manga109-YOLO26-ONNX-CPU-FP32

## Resumen
Manga109-YOLO26-ONNX-CPU-FP32 es una exportación a ONNX del modelo de segmentación de instancias ShadowB/Manga109-panel-balloon-text-yolov26-segmentation, desarrollado por el autor de Hugging Face neavo. El modelo original, de CuratorML (ShadowB), está especializado en la detección y segmentación de tres tipos de regiones en páginas de manga japonés: viñetas (frame), texto (text) y bocadillos o globos de diálogo (balloon). Esta versión no ha sido reentrenada ni cuantizada: es una conversión directa a FP32 en formato ONNX opset 17, pensada para ejecutarse en CPU sin necesidad de PyTorch ni GPU.

El interés de esta ficha radica en que proporciona un artefacto de inferencia ligero (39,7 MiB) con un contrato de entrada/salida bien definido, útil para integrar un paso de localización de regiones en pipelines de procesamiento de manga. No incluye OCR, traducción ni restauración de imagen; su función es exclusivamente la localización de regiones mediante detección de cajas y máscaras.

La relevancia es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a desarrolladores que necesiten un componente de segmentación de paneles y bocadillos en aplicaciones de lectura, traducción o análisis de manga, y que prefieran un runtime ONNX portable en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detección + segmentación de instancias), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 (única variante en este repo); no se ha aplicado cuantización |
| Idiomas soportados | ja (japonés; etiqueta de idioma del repo) |
| Licencia | other (see-upstream-license-notes); upstream declara MIT, metadatos de exportación Ultralytics marcan AGPL-3.0 |
| Formato de pesos | ONNX (opset 17), archivo único `model.onnx`, 39,7 MiB |

## Arquitectura y entrenamiento
El modelo subyacente es un YOLO26 de segmentación de instancias, según indican los tags y el nombre del repositorio base. La arquitectura concreta (número de capas, bloques, mecanismos de atención) no se detalla en la información disponible. La exportación a ONNX conserva dos salidas: `output0` con forma `[1, 39, N]` (coordenadas de caja `cx, cy, w, h`, tres puntuaciones de clase y 32 coeficientes de máscara) y `output1` con forma `[1, 32, H/4, W/4]` (prototipos de máscara). El modelo no incluye NMS en la salida; el postprocesado debe aplicarse externamente.

No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni sobre si se aplicaron técnicas de RLHF/DPO (no aplicables a un modelo de visión). El nombre del modelo base sugiere entrenamiento sobre el dataset Manga109, pero no se confirma en la información proporcionada. La exportación fue validada mediante comprobación estructural ONNX, comparación numérica con PyTorch en seis páginas de distintas proporciones y ejecución en CPU con `onnxruntime-node@1.30.0` en un Electron Worker; esta validación comprueba la corrección de la exportación, no la precisión global del modelo.

## Capacidades
- Segmentación de instancias en páginas de manga con tres clases: `frame` (viñeta), `text` (texto) y `balloon` (bocadillo).
- Detección de cajas delimitadoras junto con máscaras binarias por instancia (coeficientes de máscara × prototipos, umbral `logits > 0`).
- Entrada RGB en FP32 con tamaño espacial variable (`[1, 3, H, W]`), normalizada dividiendo por 255.
- Preprocesado recomendado: escalar el lado largo a 1280, mantener proporción, rellenar centrado hasta múltiplo de 32 con valor 114.
- Postprocesado: filtrado por puntuación de clase (conf recomendada 0,10), NMS intra-clase con IoU 0,7, revisión manual de candidatos por debajo de 0,25.
- Ejecución en CPU sin PyTorch ni GPU; compatible con `onnxruntime` y `onnxruntime-node`.
- No incluye OCR, traducción, restauración de imagen ni generación de texto.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües más allá de la etiqueta `ja`.

## Casos de uso
- Segmentación de viñetas para reflow o lectura en dispositivos móviles: el modelo devuelve cajas y máscaras de las viñetas (`frame`), lo que permite recortarlas y reordenarlas para una lectura adaptada a pantallas pequeñas.
- Detección de bocadillos para pipelines de traducción: identificar las regiones `balloon` y `text` permite enviar únicamente esas zonas a un OCR y a un traductor posteriores, reduciendo el área procesada.
- Limpieza de texto para rotulación: las máscaras de `text` pueden usarse como base para eliminar el texto original antes de insertar una traducción, aunque el autor advierte que la máscara automática debe revisarse antes de borrar.
- Indexación y búsqueda de contenido en archivos de manga: extraer la estructura de paneles y bocadillos para construir metadatos navegables o índices por página.
- Herramientas de anotación asistida: pregenerar cajas y máscaras de las tres clases para que anotadores humanos las corrijan, acelerando la creación de datasets.
- Análisis de layout en investigación sobre manga: obtener estadísticas de distribución de viñetas, texto y bocadillos por página para estudios de estructura visual.
- Integración en aplicaciones de escritorio Electron: el autor validó la inferencia en CPU con `onnxruntime-node` en un Worker de Electron, lo que facilita su uso en aplicaciones locales sin GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo describe comprobaciones de correctitud de la exportación (estructura ONNX, comparación numérica con PyTorch en seis páginas y ejecución en CPU), sin métricas de precisión (mAP, IoU) ni de latencia o throughput.

## Requisitos de hardware
- VRAM: no aplica para la variante CPU; el archivo pesa 39,7 MiB en FP32 y puede ejecutarse en memoria del sistema.
- GPU recomendadas: no se han validado GPU ni otras plataformas según la model card; el autor solo verificó CPU.
- GPU de consumo: no verificadas; el modelo está pensado para CPU.
- Despliegue: `onnxruntime` (Python) y `onnxruntime-node@1.30.0` (Node.js/Electron); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar como referencia el modelo base del que deriva, ShadowB/Manga109-panel-balloon-text-yolov26-segmentation (formato PyTorch, licencia upstream MIT según declaración del autor, con metadatos de exportación AGPL-3.0), pero no se dispone de sus métricas ni de una comparación cuantitativa con esta exportación ONNX.

| Modelo | Formato | Tamaño | Runtime | Licencia | Métricas |
|---|---|---|---|---|---|
| Manga109-YOLO26-ONNX-CPU-FP32 (este) | ONNX opset 17 | 39,7 MiB | onnxruntime (CPU) | other (ver notas upstream) | no disponibles |
| ShadowB/Manga109-panel-balloon-text-yolov26-segmentation | PyTorch (upstream) | no disponible | PyTorch | MIT declarada / AGPL-3.0 en metadatos | no disponibles |

## Limitaciones y advertencias
- No es un modelo de OCR ni de traducción: solo localiza regiones; no reconoce ni traduce el texto.
- No realiza restauración de imagen ni eliminación de texto; las máscaras son solo una base que debe revisarse antes de usarlas para borrar contenido.
- Se han observado falsos positivos en elementos decorativos y falsos negativos en texto con tipografía artística, según la model card.
- Los candidatos con puntuación inferior a 0,25 deben revisarse manualmente.
- La validación se limita a la correctitud de la exportación; no constituye una evaluación completa de precisión.
- GPU y otras plataformas no han sido validadas.
- Licencia ambigua: el upstream declara MIT, pero los metadatos de exportación de Ultralytics marcan AGPL-3.0; el repositorio conserva ese archivo y sus metadatos sin modificar la licencia de los pesos. Debe verificarse la licencia aplicable antes de uso comercial.
- Los derechos sobre las imágenes de manga y los datos de entrenamiento no están cubiertos por la licencia del modelo; el repositorio no distribuye datos de entrenamiento ni imágenes de ejemplo.
- El modelo está etiquetado para japonés (`ja`); no se documenta soporte para otros idiomas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de detecciones espurias o ausentes en layouts poco habituales.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/neavo/Manga109-YOLO26-ONNX-CPU-FP32
- Modelo base: https://huggingface.co/ShadowB/Manga109-panel-balloon-text-yolov26-segmentation
- Repositorio del autor original (CuratorML): https://github.com/sadowb/CuratorML
- Licencia de Ultralytics: https://www.ultralytics.com/license
