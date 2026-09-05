# JcProg/PCBInspect-Region

## Resumen

PCBInspect-Region es un clasificador de imágenes desarrollado por JcProg para la inspección automatizada de placas de circuito impreso (PCB). Forma parte del sistema SentinelPCB, un router de inspección de defectos que enruta cada recorte de componente (ROI) a un clasificador de defectos específico según la región física detectada. El modelo resuelve la primera etapa de ese pipeline: dado un recorte de un componente SMT, predice si pertenece a una de las tres regiones: Body, Lead o Text, para despacharlo al clasificador posterior adecuado.

El modelo está basado en la arquitectura YOLO26n-cls de Ultralytics, una red neuronal convolucional de clasificación, ajustada finamente sobre un conjunto de datos privado de imágenes AOI (inspección óptica automatizada). Se distribuye exportado a ONNX en formato opset 17, con entrada de 224x224 píxeles y salida de logits crudos para las tres clases. Aunque es un modelo pequeño y de tarea sencilla, se integra en un sistema modular de inspección que facilita la automatización del control de calidad en líneas de montaje electrónico. Licencia MIT, apta para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26n-cls de Ultralytics; red neuronal convolucional de clasificación, exportada a ONNX |
| Parámetros totales | No disponible (basado en YOLO26n, arquitectura nano; no se especifica el número de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada de imagen 224x224 píxeles) |
| Tipos de cuantización | No disponible (export a ONNX en precisión estándar; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (tarea de visión por computadora, no aplica) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo parte de YOLO26n-cls, la variante de clasificación de la arquitectura YOLO26 de Ultralytics, e incorpora una cabeza de clasificación en lugar de una cabeza de detección. La exportación a ONNX elimina la etapa de supresión no máxima (NMS) porque la tarea es exclusivamente de clasificación: la entrada es un tensor `images` de forma `(1, 3, 224, 224)` en formato NCHW, normalizado dividiendo entre 255, y la salida `output0` contiene los logits crudos `(1, 3)`, sobre los que hay que aplicar softmax para obtener probabilidades. Las tres clases se definen en `labels.json` en el orden Body, Lead y Text.

El entrenamiento se realizó con un conjunto de datos propietario de recortes ROI de componentes SMT, que incluye pares de referencia sin defectos y capturas de defectos por sitio físico. Los datos no se han liberado públicamente. La división entre entrenamiento, validación y test se realizó agrupando por sitio de captura física, nunca por imagen individual, de modo que la referencia y la captura de defecto de un mismo componente no quedan separadas entre conjuntos. No se informa sobre el uso de técnicas de ajuste como RLHF o DPO, ya que es un modelo supervisado de clasificación clásica. La principal innovación no está en el modelo en sí, sino en su integración como pieza de un router de inspección que despacha cada ROI a un clasificador de defectos específico.

## Capacidades

- Clasificación de recortes de imagen de componentes SMT en tres regiones físicas: Body, Lead y Text.
- Ejecución mediante ONNX Runtime, con entrada normalizada RGB de 224x224 píxeles.
- Salida de logits crudos; el usuario debe aplicar softmax para obtener probabilidades.
- Se integra como primera etapa de un sistema jerárquico de inspección, permitiendo el despacho automático a clasificadores de defectos especializados en los repositorios hermanos (BodyDefect, LeadDefect, TextDefect).
- Optimizado para tareas de visión industrial; no requiere capacidades de generación de texto.
- No dispone de soporte de tool calling, funciones externas, agentes, multimodalidad ni procesamiento de audio; es exclusivamente un clasificador de imágenes monolítico.

## Casos de uso

- **Enrutamiento en sistemas de inspección AOI**: el modelo clasifica cada recorte de componente como Body, Lead o Text y lo envía al clasificador de defectos correspondiente dentro del pipeline SentinelPCB, reduciendo el espacio de clases de los clasificadores posteriores y mejorando la precisión diagnóstica.
- **Control de calidad en líneas de montaje electrónico**: en combinación con el detector estructural PCBInspect-AI, se clasifican las regiones de los componentes para verificar que se ha seleccionado el ROI correcto antes de aplicar criterios de aceptación o rechazo.
- **Automatización de generación de recetas AOI**: el modelo puede etiquetar automáticamente las regiones de los componentes en las imágenes de referencia, asistiendo en la configuración de recetas de inspección personalizadas por tipo de componente y región.
- **Detección de errores de colocación u orientación**: al predecir la región de un componente, se puede comparar con su posición esperada y alertar sobre alineaciones incorrectas en el proceso de montaje superficial.
- **Despliegue en sistemas de visión embebidos**: por su pequeño tamaño y formato ONNX, puede ejecutarse en dispositivos de borde como NVIDIA Jetson o aceleradores basados en CPU, permitiendo la inspección en tiempo real durante la producción.
- **Trazabilidad y análisis de defectos**: clasificar automáticamente las imágenes de componentes en el sistema de gestión de calidad permite generar estadísticas por región, facilitando el análisis de fallos recurrentes en un tipo concreto de componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje. El autor solo reporta métricas internas de validación y test. Los resultados en validación son:

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| Body | 0.999 | 1.000 | 1.000 | 1174 |
| Lead | 1.000 | 0.999 | 0.999 | 738 |
| Text | 1.000 | 1.000 | 1.000 | 92 |
| **Macro** | **1.000** | **1.000** | **1.000** | **2004** |

Los resultados en test son:

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| Body | 0.999 | 1.000 | 1.000 | 1164 |
| Lead | 1.000 | 0.999 | 0.999 | 736 |
| Text | 1.000 | 1.000 | 1.000 | 102 |
| **Macro** | **1.000** | **1.000** | **1.000** | **2002** |

## Requisitos de hardware

No se ha publicado información oficial sobre requisitos de hardware. Dado que el modelo es una red nano (YOLO26n) con entrada de 224x224 píxeles, se puede inferir que su ejecución es viable en equipos modestos. Los siguientes valores son estimaciones razonables:

- VRAM estimada para inferencia con batch 1 en FP32: menos de 1 GB.
- Puede ejecutarse en CPU para cargas pequeñas; en GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente (por ejemplo, NVIDIA T4, Jetson Nano/Orin, RTX 3050).
- Opciones de despliegue compatibles: ONNX Runtime, OpenVINO, o conversión a TFLite. La librería Ultralytics se usa para el entrenamiento y la exportación original.
- Latencia: no disponible. Se estima que en una CPU moderna puede estar entre 10 y 50 ms por imagen; en una GPU dedicada sería significativamente menor, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se incluyen especificaciones ni métricas de modelos comparables de la misma categoría. Los repositorios hermanos (PCBInspect-BodyDefect, PCBInspect-LeadDefect, PCBInspect-TextDefect) cumplen funciones complementarias dentro del mismo sistema, pero no se aportan datos para comparación directa.

## Limitaciones y advertencias

- El modelo se entrenó con un conjunto de datos propietario de una línea de producción específica; no se han publicado los datos. La generalización a otros tipos de PCB, condiciones de iluminación o cámaras no está garantizada.
- El corpus de test contiene solo 2.002 muestras, y la tarea es descrita por el propio autor como casi trivial. Las métricas perfectas pueden deberse a la simplicidad del problema y no son indicativas de robustez en dominios distintos.
- La distribución de clases está desequilibrada: la clase Body representa la mayoría (1.164 muestras en test) mientras que Text es minoritaria (102 muestras). El rendimiento en clases minoritarias puede degradarse en conjuntos de datos más variados.
- El modelo no puede detectar defectos por sí mismo; solo clasifica la región física del componente. Depende de los clasificadores de defectos del sistema para la inspección efectiva.
- Los resultados de validación y test son auto-declarados por el autor y no se han verificados de forma independiente.
- Al ser un clasificador de imágenes, no experimenta alucinaciones lingüísticas, pero sus probabilidades pueden no estar calibradas y pueden ser excesivamente altas ante imágenes fuera de la distribución.
- La licencia MIT permite el uso comercial sin restricciones, pero el modelo no incluye los datos de entrenamiento, lo que limita la reproducibilidad del modelo.

## Enlaces

- [JcProg/PCBInspect-Region en Hugging Face](https://huggingface.co/JcProg/PCBInspect-Region)
- [JcProg/PCBInspect-BodyDefect en Hugging Face](https://huggingface.co/JcProg/PCBInspect-BodyDefect)
- [JcProg/PCBInspect-LeadDefect en Hugging Face](https://huggingface.co/JcProg/PCBInspect-LeadDefect)
- [JcProg/PCBInspect-TextDefect en Hugging Face](https://huggingface.co/JcProg/PCBInspect-TextDefect)
- [JcProg/PCBInspect-AI en Hugging Face](https://huggingface.co/JcProg/PCBInspect-AI)
- [Repositorio PCBInspect-AI en GitHub](https://github.com/JC-prog/pcb-inspect-ai)
