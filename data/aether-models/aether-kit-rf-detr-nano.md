# aether-models/aether-kit-rf-detr-nano

## Resumen

Aether-kit-rf-detr-nano es un checkpoint de detección de objetos derivado de RF-DETR Nano de Roboflow, exportado por el proyecto Aether-Kit como un grafo estático de Core AI en float32. No se trata de un modelo de lenguaje: es un detector de objetos entrenado sobre COCO que recibe una imagen RGB y devuelve cajas delimitadoras y logits de clase. El autor lo publica como artefacto de despliegue dentro de su ecosistema (AetherVision, `detector-detr@1`), no como un modelo base entrenado desde cero.

El modelo toma una imagen RGB reescalada a 384 x 384 con valores en [0, 1] (la normalización ImageNet está incluida en el grafo) y produce 300 consultas de cajas en formato cxcywh normalizado junto con 91 logits de clase COCO. El postprocesado (sigmoide, top-k sobre pares consulta x clase, umbral de score > 0,5, sin NMS) se aplica en el host, no dentro del grafo.

Su relevancia es acotada: se trata de un artefacto de exportación reproducible y verificado contra la implementación upstream en CPU y float32, con licencia Apache-2.0. El tamaño del repositorio es de 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (detector transformer basado en DETR); grafo estático Core AI exportado en float32 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 384 x 384) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (versión modificada, ver NOTICE) |
| Formato de pesos | grafo Core AI estático; manifiesto `.aether/aether.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es RF-DETR en su variante Nano, un detector de la familia DETR que formula la detección como un conjunto de consultas de objeto. La exportación conserva el código de modelo upstream de Roboflow (versión 1.12.0, commit `639eac45`) y lo compila en un único grafo estático Core AI en float32. La entrada es una imagen RGB estirada a 384 x 384 con valores en [0, 1], con la normalización ImageNet incorporada en el propio grafo. La salida son 300 consultas de cajas (cxcywh, normalizadas) y sus 91 logits de clase COCO.

El postprocesado no forma parte del grafo: el host debe aplicar sigmoide, seleccionar el top-k sobre pares consulta x clase con umbral de score superior a 0,5 y prescindir de NMS. El autor indica que el export se validó contra la implementación upstream en CPU y en float32, con resultados recogidos en `export-report.json`. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o imágenes, ni sobre si hubo etapas de ajuste fino adicionales por parte de Aether-Kit; el checkpoint procede de Roboflow y Aether-Kit solo lo exporta.

## Capacidades

- Detección de objetos sobre las 91 clases de COCO en una sola pasada, con 300 consultas de caja por imagen.
- Entrada de imagen RGB con reescalado a 384 x 384 y normalización ImageNet integrada en el grafo.
- Salida de cajas en formato cxcywh normalizado y logits de clase listos para postprocesado en el host.
- Postprocesado definido por el autor: sigmoide, top-k sobre pares consulta x clase, umbral de score > 0,5 y sin NMS.
- Integración con el runtime AetherVision (`detector-detr@1`) en macOS mediante el manifiesto `.aether/aether.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión multimodal descriptiva, audio ni generación de texto.

## Casos de uso

- Detección de objetos en aplicaciones macOS nativas: el grafo Core AI se carga con AetherVision en macOS, lo que permite incorporar detección COCO directamente en apps de escritorio sin dependencias de Python en tiempo de ejecución.
- Prototipado rápido de pipelines de visión: al ser un artefacto de 0,1 GB con postprocesado sencillo, sirve para validar la integración de detección DETR antes de migrar a variantes mayores o a modelos propios.
- Preetiquetado de datasets: el detector puede generar cajas candidatas sobre imágenes nuevas para revisión humana, aprovechando las 91 clases COCO como vocabulario inicial.
- Automatización de inventario visual: detección de categorías COCO habituales (personas, vehículos, animales, utensilios) en imágenes fijas dentro de flujos de catalogación.
- Análisis de imágenes en el borde con hardware Apple: el formato de grafo estático y el tamaño reducido permiten ejecución local en equipos macOS sin enviar imágenes a un servicio externo.
- Verificación de exportaciones: como el autor publica el informe de validación contra upstream, el modelo sirve como referencia para comprobar que un pipeline Core AI reproduce fielmente la implementación original de RF-DETR.
- Filtrado previo en sistemas de moderación o monitorización: la detección de clases COCO permite descartar o marcar imágenes antes de pasarlas a modelos más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una validación contra la implementación upstream en CPU y float32 recogida en `export-report.json`, pero no se proporcionan métricas numéricas (mAP, latencia, throughput) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB y el grafo se publica en float32, por lo que la huella es reducida en comparación con modelos de lenguaje.
- GPU recomendadas: no disponible. El autor valida el export en CPU y el runtime objetivo es macOS (AetherVision), lo que sugiere ejecución en hardware Apple.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el artefacto está pensado para el runtime Core AI en macOS, no para CUDA.
- Opciones de despliegue: AetherVision (`detector-detr@1`) en macOS con el manifiesto `.aether/aether.json`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aether-kit-rf-detr-nano | RF-DETR Nano exportado a Core AI | 384 x 384 | 91 (COCO) | Apache-2.0 | Hugging Face (aether-models) |
| RF-DETR Nano upstream (Roboflow) | RF-DETR Nano original | Configurable según implementación | 91 (COCO) | no disponible en la información proporcionada | Repositorio de Roboflow |
| Otras variantes RF-DETR (small, medium, large) | RF-DETR | Configurable | 91 (COCO) | no disponible en la información proporcionada | Repositorio de Roboflow |

La comparación se limita a la familia RF-DETR porque no se dispone de datos de benchmarks ni de especificaciones de alternativas DETR en la información proporcionada. No se han encontrado métricas que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Es un detector de objetos, no un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- El vocabulario está fijado a las 91 clases de COCO; cualquier objeto fuera de ese conjunto no se detectará correctamente.
- El postprocesado debe implementarse en el host (sigmoide, top-k, umbral 0,5, sin NMS); omitirlo o modificarlo altera las detecciones.
- La entrada está fijada a 384 x 384 con estiramiento de la imagen, lo que puede degradar la detección en imágenes con relaciones de aspecto muy distintas.
- El artefacto está orientado al runtime Core AI en macOS; no se documenta compatibilidad con CUDA, ONNX Runtime ni otros entornos.
- El autor declara que es una versión modificada del modelo original y remite al archivo NOTICE; conviene revisarlo antes de redistribuir.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar avisos de copyright y el NOTICE correspondiente.
- No hay datos publicados de sesgos, tasas de alucinación (falsos positivos) ni robustez frente a dominios distintos de COCO.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aether-models/aether-kit-rf-detr-nano
- Organización en Hugging Face: https://huggingface.co/aether-models
- Repositorio de Aether-Kit: https://github.com/bubstackdev/aether-kit
- Repositorio de RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
