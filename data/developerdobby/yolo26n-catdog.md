# DeveloperDobby/yolo26n-catdog

## Resumen

yolo26n-catdog es un detector de objetos de la familia YOLO26, desarrollado por el usuario DeveloperDobby, especializado en la deteccion de dos clases: gatos (`0: cat`) y perros (`1: dog`). Se trata de un ajuste fino (*fine-tuning*) del modelo base `yolo26n.pt` de Ultralytics (version 8.4.171) sobre un conjunto de 20 imagenes etiquetadas con Roboflow, exportado posteriormente a formato ONNX para poder ejecutarse directamente en el navegador mediante `onnxruntime-web`.

El modelo es deliberadamente minusculo: 2.4 millones de parametros, 5.3 GFLOPs y un fichero ONNX de 9.3 MB (opset 17, simplificado). La entrada es un tensor `float32 [1, 3, 640, 640]` en RGB con valores normalizados entre 0 y 1 y relleno *letterbox* de 114. La salida es `output0` con forma `[1, 6, 8400]`, que combina las coordenadas de caja (`cx, cy, w, h` en pixeles del marco de 640) con dos puntuaciones de clase; el modelo no incluye NMS, por lo que este paso debe aplicarse externamente.

Su relevancia es fundamentalmente didactica: el propio autor lo describe como un ejercicio de aprendizaje y no como un modelo de produccion. Publicado el 6 de octubre de 2026, cuenta con 0 descargas y 0 *likes*, y su conjunto de validacion de solo 4 imagenes hace que las metricas deban interpretarse como una prueba de humo (*smoke test*) y no como una evaluacion solida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de objetos en una etapa, familia Ultralytics YOLO26), exportado a ONNX |
| Parametros totales | 2.4 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador) |
| Tipos de cuantizacion | no disponible (solo se publica ONNX float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de deteccion de objetos, no de lenguaje) |
| Licencia | AGPL-3.0 (heredada de Ultralytics YOLO) |
| Formato de pesos | ONNX (opset 17, simplificado), 9.3 MB |
| Modelo base | `yolo26n.pt` (Ultralytics 8.4.171) |
| Clases | 2: `0: cat`, `1: dog` |
| Entrada | `images` — `float32 [1, 3, 640, 640]`, RGB, rango 0-1, *letterbox* (pad 114) |
| Salida | `output0` — `[1, 6, 8400]`: caja `cx, cy, w, h` (pixeles en el marco de 640) + 2 puntuaciones de clase. Sin NMS |
| Computo | 5.3 GFLOPs |
| Tarea (*pipeline*) | object-detection |
| Libreria | ultralytics |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26n, un detector de objetos en una sola etapa de la familia Ultralytics YOLO26, caracterizado por ser la variante mas ligera (*nano*) de dicha familia. El modelo original se ajusto durante 100 epocas sobre un conjunto de 20 imagenes etiquetadas con Roboflow, divididas en 14 para entrenamiento, 4 para validacion y 2 para prueba, y el entrenamiento se ejecuto en CPU. Posteriormente se exporto a ONNX con opset 17 y simplificacion de grafo, lo que permite su ejecucion tanto en Python como en navegador.

No se documenta en la informacion disponible el uso de tecnicas de RLHF, DPO ni procesos de alineacion, algo esperable en un modelo de vision. Tampoco se detalla la composicion del dataset mas alla del recuento de imagenes. El resultado reportado por el autor es un mAP50 maximo de 0.9125 en la epoca 76 y un valor de 0.874 en la ultima epoca, medidos sobre tan solo 4 imagenes de validacion, por lo que el propio autor advierte que deben tratarse como una comprobacion preliminar.

## Capacidades

- Deteccion de objetos limitada a dos clases: gatos y perros.
- Localizacion de instancias mediante cajas en formato `cx, cy, w, h` sobre un marco de entrada de 640 x 640 pixeles.
- Exportacion a ONNX lista para inferencia en Python (`ultralytics`) y en navegador (`onnxruntime-web`).
- Inferencia en CPU y en dispositivos sin GPU dedicada, dado su tamano reducido (2.4 M de parametros).
- No incluye supresion de no maximos (NMS): el consumidor debe aplicar NMS por clase (por ejemplo, en JavaScript) para filtrar cajas solapadas.
- No dispone de *tool calling*, capacidades de agente, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision multimodal, audio ni modo de razonamiento (*thinking*).
- No dispone de soporte multilingue por tratarse de un modelo de vision, no de lenguaje.

## Casos de uso

- Prototipado educativo de deteccion de objetos: sirve para que un desarrollador novel comprenda el flujo completo de *fine-tuning* de un YOLO, exportacion a ONNX y consumo desde JavaScript, sin necesidad de infraestructura GPU.
- Demostraciones en navegador: integrable en aplicaciones web que ejecuten ONNX con `onnxruntime-web`, tal y como hace el propio autor en el sitio AI Models Organize, para mostrar deteccion de mascotas en tiempo real sobre imagenes cargadas por el usuario.
- Pruebas de integracion de pipelines ONNX: util como modelo de prueba con salida conocida `[1, 6, 8400]` para validar codigo de *preprocesado* (letterbox, normalizacion) y *postprocesado* (NMS por clase) antes de migrar a modelos reales.
- Filtrado de imagenes de mascotas en colecciones pequenas: para clasificar o etiquetar fotografias de perros y gatos en albums personales, asumiendo umbrales de confianza bajos (0.2-0.4) y revision manual posterior.
- Ejercicio de cuantizacion y optimizacion: al ser un modelo tan pequeno, resulta idoneo para experimentar con cuantizacion int8, TensorRT u OpenVINO y medir el impacto en latencia sin coste de hardware elevado.
- Base para ampliar clases: puede servir como punto de partida para un *fine-tuning* posterior con mas datos y mas clases, aprovechando que ya esta exportado y que su licencia y modelo base estan identi­ficados.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor sobre 4 imagenes de validacion:

| Metrica | Valor | Observaciones |
|---|---|---|
| mAP50 (mejor, epoca 76) | 0.9125 | Medido sobre 4 imagenes de validacion |
| mAP50 (ultima epoca) | 0.874 | Medido sobre 4 imagenes de validacion |
| Parametros | 2.4 M | — |
| GFLOPs | 5.3 | — |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; el fichero ONNX ocupa 9.3 MB y el modelo tiene 2.4 M de parametros, por lo que cabe holgadamente en cualquier GPU con al menos ~1 GB de VRAM, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU y, si se desea aceleracion, en cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090, A100, H100), aunque las GPU de gama alta estaran ampliamente infrautilizadas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en dispositivos moviles o en el navegador del cliente.
- Opciones de despliegue: Ultralytics (`YOLO("yolo26n_catdog.onnx")`), ONNX Runtime, `onnxruntime-web` en navegador, y potencialmente TensorRT u OpenVINO previa conversion (no documentada por el autor).
- Latencia y throughput estimados: no disponible (no se publican mediciones de latencia ni de rendimiento).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria, marcando como "no disponible" los valores no documentados.

| Modelo | Parametros | Contexto | mAP50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26n-catdog (este modelo) | 2.4 M | no aplica | 0.9125 (4 imagenes de validacion) | AGPL-3.0 | ONNX en HuggingFace |
| `yolo26n.pt` (modelo base) | no disponible | no aplica | no disponible | AGPL-3.0 | Ultralytics |
| Otras variantes YOLO (v8n, 11n) | no disponible | no aplica | no disponible | AGPL-3.0 | Ultralytics |

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 20 imagenes (14 de entrenamiento, 4 de validacion, 2 de prueba). El modelo falla con frecuencia y omite muchos gatos y perros, especialmente en memes, escenas concurridas u objetos pequenos.
- Puntuaciones de confianza bajas: habitualmente entre 0.2 y 0.4, lo que obliga a bajar el umbral de confianza para obtener mas detecciones, incrementando los falsos positivos.
- Metricas poco fiables: el mAP50 se calculo sobre solo 4 imagenes de validacion, por lo que el autor lo califica de *smoke test* y no de evaluacion representativa.
- Ausencia de NMS en el modelo: la salida incluye 8400 propuestas sin filtrar; es imprescindible aplicar NMS por clase externamente o se obtendran cajas duplicadas.
- Uso previsto: el propio autor lo define como un ejercicio de aprendizaje y no como un modelo de produccion.
- Sesgos conocidos: no documentados; al estar entrenado con un conjunto muy pequeno y no descrito, no puede descartarse un sesgo hacia las condiciones de iluminacion, encuadre y razas presentes en esas 20 imagenes.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo elevado de detecciones espurias y de omisiones por el escaso entrenamiento.
- Restricciones de licencia: AGPL-3.0, heredada de Ultralytics YOLO. Esto implica obligaciones de copyleft reforzadas para uso en red; conviene revisar las condiciones antes de cualquier uso comercial o despliegue como servicio.
- Caveat de produccion: no se recomienda su uso en sistemas criticos sin reentrenamiento con un dataset amplio y una validacion rigurosa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DeveloperDobby/yolo26n-catdog
- Documentacion de onnxruntime-web (mencionada por el autor): https://onnxruntime.ai/docs/tutorials/web/
- Sitio de demostracion del autor (AI Models Organize): https://ai-models-organize.vercel.app/
- Ultralytics (framework y modelo base `yolo26n.pt`): no disponible en la informacion proporcionada
- Roboflow (herramienta de etiquetado citada): no disponible en la informacion proporcionada
