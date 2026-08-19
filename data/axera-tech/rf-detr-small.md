# AXERA-TECH/rf-detr-small

## Resumen

RF-DETR Small es un modelo de detección de objetos en tiempo real desarrollado por Roboflow, basado en una arquitectura transformer (DETR) optimizada mediante búsqueda de arquitectura neuronal (NAS). Esta versión concreta, publicada por AXERA-TECH, es una conversión del modelo original a formato ONNX y posteriormente cuantizada a INT8 (u8) para su ejecución en la NPU Axera AX650. El repositorio incluye los scripts necesarios para exportar, dividir, compilar y evaluar el modelo en dicha plataforma, así como un flujo completo de validación sobre COCO 2017 val.

La relevancia de esta publicación radica en que permite desplegar un detector de objetos moderno en hardware de bajo consumo y alto rendimiento, típico de sistemas embebidos y edge computing. Al estar cuantizado a INT8, se reduce el tamaño y la latencia, aunque se desconoce el impacto exacto en precisión al no publicarse métricas comparativas. El modelo original de Roboflow es conocido por su equilibrio entre velocidad y exactitud, pero esta conversión específica no incluye detalles sobre el rendimiento final en la NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DETR) con búsqueda de arquitectura neuronal (NAS), segun el paper de RF-DETR |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | INT8 (u8) para NPU Axera; FP32 como referencia |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (FP32 y cuantizado), .axmodel (compilado para Axera) |

## Arquitectura y entrenamiento

La arquitectura de RF-DETR se basa en un transformer de deteccion (DETR) que predice directamente objetos mediante consultas aprendidas, sin necesidad de anclas ni NMS. Segun el articulo de arXiv, el modelo emplea una busqueda de arquitectura neuronal con peso compartido para descubrir curvas Pareto de precision-latencia en cada dataset objetivo, lo que permite obtener variantes ligeras como "Small". Sin embargo, en la informacion proporcionada no se especifican los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO, etc.) porque se trata de un modelo de vision, no de lenguaje.

La version publicada por AXERA-TECH se centra en la conversion a ONNX y su posterior cuantizacion a INT8 mediante la herramienta Pulsar2 (version 7.0). El proceso incluye la division del grafo en dos partes: una para la NPU (pulsar2) y otra para el postprocesado en host (generacion de cajas). No se aportan datos sobre el dataset de calibracion mas alla de mencionar que se usa un subconjunto de 500 imagenes de COCO 2017 val.

## Capacidades

- Deteccion de objetos en tiempo real: el modelo predice cajas delimitadoras y clases para multiples objetos en una imagen.
- Salida normalizada: las cajas se expresan en formato `cxcywh` (centro x, centro y, ancho, alto) normalizado.
- Compatibilidad con COCO: el flujo de evaluacion incluido calcula mAP sobre el conjunto de validacion de COCO 2017.
- Optimizacion para NPU: la cuantizacion INT8 y la compilacion con Pulsar2 permiten ejecucion en hardware Axera AX650.
- Postprocesado en host: la generacion final de cajas se realiza fuera de la NPU, lo que facilita la integracion en aplicaciones.
- No se mencionan capacidades de tool calling, agentes, razonamiento multimodal ni soporte de lenguaje.

## Casos de uso

- Inspeccion industrial en edge: el modelo puede integrarse en camaras o dispositivos con NPU Axera para detectar defectos en lineas de produccion, aprovechando su baja latencia y bajo consumo.
- Vigilancia y seguridad perimetral: desplegado en dispositivos embebidos, permite detectar personas, vehiculos u objetos de interes en tiempo real sin depender de la nube.
- Robotica autonoma: la deteccion de objetos es un componente basico para navegacion y manipulacion; la version cuantizada facilita su ejecucion en robots con hardware limitado.
- Agricultura de precision: deteccion de plagas, frutos o maleza en imagenes capturadas por drones o sensores de campo, con procesamiento local.
- Conteo y analisis de trafico: en infraestructuras urbanas, el modelo puede contar vehiculos o peatones en tiempo real desde dispositivos de borde.
- Prototipado rapido en investigacion: los scripts incluidos permiten reproducir el flujo de conversion y evaluacion, util para experimentar con cuantizacion y despliegue en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un proceso de comparacion entre FP32 y cuantizado mediante `evaluate_rfdetr.py`, pero no se incluyen los valores numericos de mAP ni de latencia. El repositorio de Roboflow (enlace en la seccion de enlaces) reporta resultados de RF-DETR en COCO y RF100-VL, pero no se dispone de esos datos en la informacion proporcionada.

## Requisitos de hardware

- Hardware objetivo: NPU Axera AX650, segun la configuracion de compilacion (`--target_hardware AX650`).
- Formato de despliegue: el modelo compilado se ejecuta mediante `axengine` en el dispositivo AX650.
- No se especifican requisitos de VRAM, GPU ni memoria para el modelo original.
- El flujo de desarrollo requiere una maquina con Python y onnxruntime para la exportacion y evaluacion, pero la inferencia final esta pensada para la NPU.
- No se indican opciones de despliegue en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la informacion suministrada. Se podria comparar con otros detectores de objetos en tiempo real como YOLO o DETR, pero no hay cifras concretas para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La cuantizacion INT8 puede degradar la precision respecto al modelo FP32 original; no se publica el impacto cuantitativo.
- El modelo esta optimizado para la NPU Axera AX650; su uso en otras plataformas requeriria una nueva compilacion y posiblemente una recalibracion.
- No se dispone de informacion sobre la licencia del modelo original ni de esta conversion, por lo que se debe contactar con los autores para uso comercial.
- El proceso de conversion y evaluacion requiere seguir los scripts proporcionados; cualquier desviacion puede producir resultados incorrectos.
- No se mencionan sesgos especificos, pero al ser un modelo de deteccion de objetos, su rendimiento puede variar segun el dominio y la distribucion de clases.
- La ventana de contexto no aplica al ser un modelo de vision; la entrada es una imagen de tamaño fijo (512x512 segun los nombres de los archivos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AXERA-TECH/rf-detr-small
- Repositorio de Roboflow (modelo original): https://github.com/roboflow/rf-detr
- Repositorio de AXERA-TECH con el demo: https://github.com/AXERA-TECH/RF-DETR.axera/
- Paper de RF-DETR en arXiv: https://arxiv.org/html/2511.09554v1
