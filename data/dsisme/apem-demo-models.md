# dsisme/apem-demo-models

## Resumen

`dsisme/apem-demo-models` es un repositorio espejo que redistribuye dos modelos en formato ONNX utilizados para la inferencia en el navegador (client-side inference) en la web de APEM Technologies. No se trata de un modelo entrenado por el autor, sino de un paquete de artefactos de terceros reempaquetados bajo licencia Apache 2.0 para su uso en una demo web. El repositorio lo mantiene el usuario `dsisme` y su tamano total es de aproximadamente 0,2 GB.

El contenido son dos modelos con tareas distintas: `perch_v2.onnx`, un clasificador de audio y vocalizaciones de aves derivado del modelo Perch de Google Research (ventana de 5 segundos a 32 kHz), y `yolox_tiny.onnx`, un detector de objetos visuales derivado de YOLOX (Megvii BaseDetection) con entrada de 416×416 y clases COCO. Ambos estan pensados para ejecutarse en el borde (edge-ai), lo que justifica el uso de ONNX y de una variante "tiny" del detector.

La relevancia de este repositorio es acotada: no aporta pesos nuevos ni innovaciones de arquitectura, sino una via practica de obtener artefactos ONNX listos para despliegue en web o dispositivos de borde para tareas de bioacustica y deteccion visual. Es util como referencia de empaquetado y de atribucion de licencias, no como modelo base para fine-tuning ni para evaluacion comparativa de capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos independientes: Perch v2 (clasificador de audio) y YOLOX-Tiny (detector de objetos, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos no generativos de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

Especificaciones por artefacto:

| Fichero | Tarea | Entrada | Origen |
|---|---|---|---|
| `perch_v2.onnx` | Clasificacion de audio y vocalizaciones de aves | Audio a 32 kHz, ventana de 5 s | Google Research (Perch), via tphakala, justinchuby y cgeorgiaw |
| `yolox_tiny.onnx` | Deteccion de objetos y fauna (COCO) | Imagen 416×416 | Megvii BaseDetection (YOLOX) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. `perch_v2.onnx` es una conversion a ONNX del clasificador bioacustico Perch de Google Research, un modelo de clasificacion de audio disenado para identificar especies de aves a partir de fragmentos de 5 segundos muestreados a 32 kHz. La conversion a ONNX procede de trabajos de la comunidad (tphakala, justinchuby, cgeorgiaw) y se redistribuye sin modificaciones.

`yolox_tiny.onnx` es una conversion de la variante Tiny de YOLOX, la familia de detectores de objetos de Megvii BaseDetection. YOLOX-Tiny es una CNN de deteccion anclada a una resolucion de entrada de 416×416 y entrenada sobre COCO; su tamano reducido la hace apta para inferencia en el borde. No se detallan en la informacion disponible los datos exactos de entrenamiento, el numero de tokens o imagenes, ni si hubo etapas de ajuste fino adicionales por parte de los autores de las conversiones.

## Capacidades

- Clasificacion de audio bioacustico: identificacion de vocalizaciones de aves sobre ventanas de 5 segundos a 32 kHz mediante `perch_v2.onnx`.
- Deteccion de objetos visuales: localizacion y clasificacion de objetos de las clases COCO en imagenes de 416×416 mediante `yolox_tiny.onnx`.
- Deteccion de fauna: el detector puede emplearse para identificar animales presentes en las clases COCO, segun indica la model card.
- Inferencia en el navegador: ambos artefactos estan en ONNX y pensados para ejecucion client-side (por ejemplo, con ONNX Runtime Web).
- Inferencia en el borde: el tag `edge-ai` y la variante Tiny del detector apuntan a despliegue en dispositivos con recursos limitados.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Demos web de identificacion de aves: cargar `perch_v2.onnx` en el navegador con ONNX Runtime Web para clasificar grabaciones de 5 segundos capturadas por el microfono del usuario, sin enviar audio a un servidor.
- Monitorizacion acustica de ecosistemas: desplegar el clasificador de audio en grabadoras o dispositivos de borde para etiquetar automaticamente fragmentos de 5 segundos y detectar presencia de especies.
- Deteccion de fauna en imagenes de camara trampa: usar `yolox_tiny.onnx` sobre imagenes redimensionadas a 416×416 para localizar animales, con la ventaja de un coste computacional bajo.
- Filtrado previo en pipelines de vision: emplear el detector Tiny como etapa de pre-filtrado que descarte imagenes sin objetos de interes antes de pasarlas a un modelo mayor.
- Aplicaciones educativas o de ciencia ciudadana: demos interactivas en el navegador que muestren la clasificacion de audio o la deteccion visual en tiempo real sin infraestructura de servidor.
- Prototipado de inferencia en el borde: usar ambos ONNX como referencia para medir latencia y consumo en dispositivos objetivo antes de elegir un modelo definitivo.
- Verificacion de empaquetado y atribucion: servir como ejemplo de redistribucion de pesos de terceros bajo Apache 2.0 con creditos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 0,2 GB, por lo que ambos modelos juntos caben holgadamente en cualquier GPU con al menos 1-2 GB de memoria libre.
- GPU recomendadas: al ser modelos de borde, no requieren GPU dedicada; funcionan en CPU y en GPU de gama baja. Para servidor, cualquier GPU tipo T4, L4 o RTX 3060 en adelante es mas que suficiente.
- GPU de consumo: caben en cualquier GPU de consumo moderna e incluso en iGPU; el detector Tiny a 416×416 y el clasificador de audio de 5 s son cargas ligeras.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), TensorRT o OpenVINO para aceleracion en el borde; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no son modelos generativos de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `perch_v2.onnx` (este repo) | Clasificacion de audio de aves | 32 kHz, 5 s | Apache 2.0 | ONNX en HF |
| Perch (Google Research, original) | Clasificacion de audio de aves | 32 kHz, 5 s | Apache 2.0 | Kaggle Models |
| `yolox_tiny.onnx` (este repo) | Deteccion de objetos COCO | 416×416 | Apache 2.0 | ONNX en HF |
| YOLOX-Tiny (Megvii, original) | Deteccion de objetos COCO | 416×416 | Apache 2.0 | GitHub Megvii BaseDetection |

No se dispone de datos de rendimiento (mAP, precision de clasificacion) en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas como YOLOv8n o modelos de audio de otros autores.

## Limitaciones y advertencias

- No es un modelo propio: el repositorio solo redistribuye pesos de terceros; cualquier problema de calidad o sesgo proviene de los modelos originales.
- El clasificador de audio esta especializado en aves; no es un clasificador general de sonidos y su rendimiento fuera de ese dominio no esta documentado.
- El detector esta limitado a las clases COCO y a una resolucion de entrada fija de 416×416; objetos pequenos o clases fuera de COCO no se detectaran de forma fiable.
- Riesgo de falsos positivos y negativos inherente a modelos ligeros de borde; no se aportan metricas de validacion en la model card.
- No hay informacion sobre sesgos demograficos, geograficos o de especies; la cobertura taxonomica del clasificador de aves no se detalla.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion a los autores originales (Google Research, Megvii y los conversores citados).
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; no hay evidencia de mantenimiento ni de soporte por parte del autor.
- No apto para tareas generativas, razonamiento, codigo ni agentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dsisme/apem-demo-models
- Web de APEM Technologies: https://apem.ai.id
- Perch (Google Research, Kaggle Models): https://www.kaggle.com/models/google/bird-vocalization-classifier/
- Perch v2 (tphakala): https://huggingface.co/tphakala/Perch-v2
- Perch ONNX (justinchuby): https://huggingface.co/justinchuby/Perch-onnx
- Perch (cgeorgiaw): https://huggingface.co/cgeorgiaw/Perch
- YOLOX (Megvii BaseDetection): https://github.com/Megvii-BaseDetection/YOLOX
