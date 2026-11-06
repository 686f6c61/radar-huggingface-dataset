# aether-models/aether-kit-rf-detr-seg-nano

## Resumen

Aether-Kit RF-DETR Seg Nano es un checkpoint de segmentación de instancias exportado a partir del modelo RF-DETR Seg Nano de Roboflow, empaquetado por el proyecto Aether-Kit para su ejecución en el runtime Core AI de Apple (macOS). No se trata de un modelo entrenado desde cero, sino de una conversión estática del checkpoint oficial de RF-DETR (versión de código 1.12.0, commit `639eac45`) a un grafo único en float32. El modelo resuelve detección de objetos y segmentación de instancias sobre las 91 clases de COCO, devolviendo cajas, logits de clase y máscaras por consulta.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0,1 GB y fue publicado en noviembre de 2026. Su interés principal es como ejemplo de pipeline de exportación (Forge/rfdetr) para llevar un detector DETR a un formato propietario de inferencia en dispositivo, no como modelo de propósito general. La licencia es Apache-2.0 con un archivo NOTICE que indica que se trata de una versión modificada.

La información disponible sobre el modelo es limitada: la model card describe el grafo de entrada/salida y el postprocesado, pero no aporta datos de entrenamiento, benchmarks propios ni especificaciones de parámetros. Todo lo que sigue se limita a lo que consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer DETR (RF-DETR de Roboflow), exportado como grafo estático Core AI en float32 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (exportación en float32; no se documentan otras precisiones) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas son las 91 clases de COCO) |
| Licencia | Apache-2.0 (versión modificada, ver NOTICE) |
| Formato de pesos | Grafo Core AI estático (float32); manifiesto en `.aether/aether.json` |

## Arquitectura y entrenamiento

El modelo subyacente es RF-DETR en su variante Seg Nano de Roboflow, un detector-segmentador basado en transformer (familia DETR) que produce un conjunto fijo de consultas de objeto. La exportación de Aether-Kit genera un único grafo estático que recibe una imagen RGB redimensionada a 312 x 312 y normalizada en rango [0, 1] (la normalización ImageNet está incluida dentro del grafo). La salida son 100 cajas en formato cxcywh normalizado, sus 91 logits de clase COCO y logits de máscara por consulta a resolución 78 x 78.

El postprocesado no forma parte del grafo: lo aplica el host siguiendo la implementación upstream, con sigmoide, selección top-k sobre pares consulta x clase y umbral de score > 0,5, sin NMS. La model card indica que el export fue validado contra la implementación upstream en CPU y float32 (ver `export-report.json`), pero no se detallan los datos de entrenamiento originales de RF-DETR, el número de tokens ni si hubo etapas de RLHF o DPO, por lo que esos datos se consideran no disponibles en esta ficha.

## Capacidades

- Detección de objetos sobre las 91 clases de COCO, con 100 consultas por imagen.
- Segmentación de instancias: máscaras por consulta a resolución 78 x 78 (logits).
- Entrada de imagen RGB redimensionada a 312 x 312 con normalización ImageNet integrada en el grafo.
- Salida estructurada lista para postprocesado en host (cajas cxcywh normalizadas, logits de clase y logits de máscara).
- Ejecución en dispositivo mediante el runtime Core AI de Apple en macOS, cargado con `AetherVision` (`detector-detr@1`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- Capacidades multilingües: no aplica; las etiquetas de clase son las de COCO.

## Casos de uso

- Detección y segmentación en aplicaciones macOS nativas: el grafo Core AI se carga con `AetherVision` en macOS, lo que permite integrar detección de instancias en apps de escritorio sin depender de un servidor de inferencia.
- Preprocesado visual en pipelines de captura de pantalla o documentos: con entrada fija de 312 x 312 y salida de 100 consultas, el modelo sirve para localizar y segmentar objetos en imágenes capturadas antes de pasarlas a un OCR o a un clasificador posterior.
- Prototipado rápido de demos de visión: al ser un grafo estático de 0,1 GB en float32, se puede distribuir junto con una app de demostración sin infraestructura de GPU dedicada.
- Análisis de imágenes en local con requisitos de privacidad: al ejecutarse en el dispositivo vía Core AI, los datos no salen del equipo, lo que encaja en flujos donde no se permite enviar imágenes a la nube.
- Etiquetado asistido de datasets COCO: las cajas y máscaras por consulta con umbral 0,5 pueden usarse como preanotación para revisión humana en herramientas de etiquetado.
- Referencia para pipelines de exportación: el repositorio sirve como ejemplo reproducible de conversión de un checkpoint RF-DETR a un grafo Core AI, útil para equipos que quieran replicar el flujo con otros tamaños o variantes.
- Filtrado visual en aplicaciones de realidad aumentada o edición: la segmentación por instancia permite recortar objetos detectados para composición o efectos en tiempo de ejecución local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una validación de equivalencia contra la implementación upstream en CPU y float32 (`export-report.json`), sin cifras de mAP, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB y los pesos se exportan en float32, por lo que el grafo es ligero, pero no se documenta el consumo real en memoria.
- GPU recomendadas: no disponible. El runtime objetivo es Core AI en macOS, no CUDA.
- Compatibilidad con GPU de consumo: no disponible; la model card solo indica ejecución en macOS mediante `AetherVision`.
- Opciones de despliegue: runtime Core AI de Aether-Kit (`AetherVision`, `detector-detr@1`) en macOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aether-Kit RF-DETR Seg Nano | DETR (RF-DETR) exportado a Core AI | 312 x 312 RGB | 100 cajas + 91 clases + máscaras 78 x 78 | Apache-2.0 (modificada) | Hugging Face, runtime Core AI macOS |
| RF-DETR Seg Nano (upstream, Roboflow) | DETR (RF-DETR) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Repositorio GitHub de Roboflow |
| Otros detectores DETR de COCO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo de visión sin capacidades de texto: no admite prompts, tool calling ni razonamiento; cualquier uso conversacional es inviable.
- Dominio limitado a las 91 clases de COCO; los objetos fuera de ese vocabulario no se detectarán de forma fiable.
- Resolución de entrada fija de 312 x 312: objetos pequeños o imágenes de alta resolución pueden perder detalle tras el redimensionado.
- Postprocesado obligatorio en el host (sigmoide, top-k, umbral 0,5, sin NMS): una implementación incorrecta del host altera directamente los resultados.
- Dependencia de plataforma: el grafo está pensado para el runtime Core AI en macOS; no se documenta portabilidad a otros backends.
- Licencia Apache-2.0 con NOTICE que indica versión modificada: conviene revisar el NOTICE antes de redistribuir, aunque la licencia permite uso comercial.
- Repositorio sin tracción (0 descargas, 0 likes) y sin benchmarks publicados: no hay evidencia comunitaria de robustez en producción.
- Riesgo de alucinación en el sentido de falsos positivos: el umbral fijo de 0,5 sin NMS puede generar detecciones duplicadas o espurias en escenas densas.
- No se documentan sesgos del checkpoint original de RF-DETR en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aether-models/aether-kit-rf-detr-seg-nano
- Organización en Hugging Face: https://huggingface.co/aether-models
- Repositorio RF-DETR de Roboflow: https://github.com/roboflow/rf-detr
- Repositorio Aether-Kit: https://github.com/bubstackdev/aether-kit
- Modelos con etiqueta aether-kit en Hugging Face: https://huggingface.co/models?other=aether-kit
