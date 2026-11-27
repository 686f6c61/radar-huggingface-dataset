# Rocky-129/zilo-base-coco

## Resumen

ZiLO Base COCO es un detector de objetos genérico para las 80 clases del dataset COCO, distribuido como grafo ONNX en FP32 por el autor Rocky-129. Se trata de la exportación del checkpoint `weights/ZiLOBase-coco.pt` del proyecto de investigación ZiLO, un framework ligero, apilable y escalable orientado a la detección densa de peatones en entornos de borde. No debe confundirse con el fine-tune de clase única sobre CrowdHuman que forma parte del mismo proyecto.

El modelo se publica como artefacto de inferencia puro: el grafo no incluye preprocesador de imagen, NMS ni API de entrenamiento, y está pensado para ejecución local en CPU. La entrada es un tensor FP32 RGB en formato NCHW de `[1,3,640,640]` con letterbox cuadrado y píxeles divididos por 255; la salida es un tensor `[1,84,8400]` con centro x/y, ancho, alto y 80 puntuaciones de clase. El autor indica que el checkpoint original alcanzó mAP50 de 0.52722 y mAP50-95 de 0.37965 en validación COCO, aunque aclara que no se trata de una evaluación fresca del ONNX.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, el tamaño del repo es de 0.0 GB (posiblemente por metadatos incompletos) y la licencia AGPL-3.0 impone obligaciones copyleft fuertes para uso en red. Es un artefacto de investigación derivado de LeYOLO y Ultralytics, útil para experimentación en detección de objetos en CPU, pero sin validación independiente publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos derivado de LeYOLO / Ultralytics (familia YOLO), exportado a ONNX opset 17 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | solo FP32 en esta release (no se publican variantes INT8/FP16) |
| Idiomas soportados | no disponible (modelo de visión; etiquetas de clase en inglés en `model.json`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`zilo-base-coco.onnx`), checkpoint fuente PyTorch `.pt` no incluido en el repo |

## Arquitectura y entrenamiento

La arquitectura es un detector de la familia YOLO basado en LeYOLO, según declara el autor en la model card, con un backbone y cabeza de detección exportados a un grafo ONNX estático de opset 17. La salida `[1,84,8400]` corresponde al formato típico de YOLOv8: 4 coordenadas de caja (centro x, centro y, ancho, alto en píxeles de entrada) más 80 puntuaciones de clase, con 8400 anclas candidatas para una entrada de 640×640. El modelo no incluye NMS ni preprocesador en el grafo; el consumidor debe aplicar selección de clase de mayor puntuación, NMS class-aware y deshacer el letterbox.

No se dispone de información sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de COCO y CrowdHuman como referencias del proyecto, ni sobre si se aplicaron técnicas de RLHF/DPO (no aplica a un detector). El autor documenta los checksums SHA-256 del ONNX (`01d9e649...ded9e1f`) y del checkpoint fuente (`9c15d176...bde49977`), y que la exportación de referencia se realizó con PyTorch 2.4.1 y ONNX 1.16.2 en CPU. La innovación destacable es la naturaleza ligera y apilable del framework ZiLO, orientado a detección densa de peatones en dispositivos de borde, según el paper referenciado en IEEE T-ASE.

## Capacidades

- Detección de objetos en 80 clases COCO (IDs contiguos 0-79, no los IDs de anotación COCO).
- Salida de cajas en coordenadas de píxel de la entrada 640×640, con 80 puntuaciones de clase por candidato.
- Inferencia en CPU en FP32, sin dependencia de GPU ni de runtime CUDA.
- Ejecución en ONNX Runtime u otros motores compatibles con opset 17.
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión-lenguaje, audio ni generación de texto.
- Capacidades multilingües: no aplica; las etiquetas de clase están en inglés en `model.json`.
- No incluye modo thinking ni capacidades especiales de razonamiento.

## Casos de uso

- Detección de peatones en dispositivos de borde: el modelo deriva del framework ZiLO, diseñado explícitamente para detección densa de peatones en entornos con recursos limitados; se puede ejecutar en CPU en un dispositivo embebido para contar o localizar personas en flujo de vídeo.
- Procesamiento por lotes en servidor sin GPU: al ser un grafo ONNX FP32, se puede integrar en pipelines de Python con ONNX Runtime en máquinas sin acelerador, útil para anotación offline de datasets o auditoría de imágenes.
- Prototipado de sistemas de visión: sirve como baseline rápido para validar preprocesado, NMS y postprocesado antes de invertir en modelos mayores o en fine-tunes específicos.
- Detección genérica en aplicaciones de investigación: las 80 clases COCO permiten experimentar con detección multi-clase en escenarios académicos donde se requiere un modelo ligero y reproducible (checksums publicados).
- Integración en herramientas de etiquetado asistido: el detector puede pre-anotar imágenes con las clases COCO y el humano corrige, reduciendo el coste de anotación en proyectos de visión.
- Verificación de paridad y reproducibilidad: el autor documenta un test de paridad CPU FP32 frente a PyTorch con 10 cajas coincidentes e IoU mínimo superior a 0.99999 en dos imágenes, útil como referencia para validar exportaciones propias.
- Educación y docencia: ejemplo práctico de exportación ONNX de un detector YOLO-like con contrato de entrada/salida documentado y checksums, adecuado para enseñar despliegue de modelos de visión.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados del checkpoint fuente en validación COCO, que no constituyen una evaluación fresca del ONNX exportado:

| Metrica | Valor | Fuente |
|---|---|---|
| mAP50 (COCO val) | 0.52722 | Checkpoint fuente `ZiLOBase-coco.pt` |
| mAP50-95 (COCO val) | 0.37965 | Checkpoint fuente `ZiLOBase-coco.pt` |
| Paridad CPU FP32 vs PyTorch | 10 cajas coincidentes, IoU mínimo > 0.99999 en 2 imágenes | Test del autor |

No se han publicado resultados de benchmarks independientes del ONNX en la información disponible. El autor advierte que el test de paridad es pequeño y no establece precisión general, equidad entre poblaciones ni idoneidad para uso crítico de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para CPU en FP32 y no se publican requisitos de VRAM para GPU.
- GPU recomendadas: no disponibles; el autor no documenta despliegue en GPU.
- ¿Cabe en GPU consumer? No hay datos publicados; al ser un detector ligero de la familia LeYOLO, es plausible que quepa en GPUs consumer, pero no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (CPU), otros motores compatibles con ONNX opset 17; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de visión).
- Latencia y throughput estimados: no disponibles; el autor solo menciona inferencia local en CPU sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZiLO Base COCO (este) | no disponible | 640×640, 80 clases COCO | mAP50 0.52722, mAP50-95 0.37965 (checkpoint fuente) | AGPL-3.0 | ONNX en HF, 0 descargas |
| YOLOv8n / YOLOv8s (Ultralytics) | no disponible en la información | 640×640, 80 clases COCO | no disponible en la información | AGPL-3.0 | Amplia, ecosistema maduro |
| LeYOLO (familia base) | no disponible en la información | 640×640, 80 clases COCO | no disponible en la información | no disponible en la información | Repositorio de investigación |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. La comparación se limita a licencia (AGPL-3.0 compartida con Ultralytics) y formato de distribución.

## Limitaciones y advertencias

- El ONNX no incluye preprocesador, NMS ni API de entrenamiento; el usuario debe implementar letterbox, selección de clase, NMS class-aware y deshacer el letterbox.
- Los IDs de clase son contiguos 0-79, no los IDs de anotación COCO; usarlos como IDs COCO produce etiquetas incorrectas.
- Los resultados de mAP reportados son del checkpoint fuente, no de una evaluación fresca del ONNX; el autor lo advierte explícitamente.
- El test de paridad se limita a dos imágenes (un retrato y un paisaje) y no establece precisión general, equidad entre poblaciones ni idoneidad para seguridad crítica.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes, incluida la publicación del código fuente si se ofrece el modelo como servicio en red; el fichero `UPSTREAM-APACHE.txt` no es una licencia alternativa.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.
- El tamaño del repo figura como 0.0 GB, lo que puede indicar metadatos incompletos o que el fichero ONNX no está realmente alojado; conviene verificar antes de integrar.
- No se documentan sesgos conocidos, riesgos de alucinación (no aplica a un detector) ni limitaciones de idioma; el modelo es de visión y no procesa texto.
- El autor no documenta datos de entrenamiento más allá de COCO y CrowdHuman, ni procesos de mitigación de sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/Rocky-129/zilo-base-coco
- Repositorio del proyecto ZiLO: https://github.com/Rocky1salady-killer/ZiLO
- Paper de referencia (IEEE T-ASE): https://doi.org/10.1109/TASE.2026.3743062
