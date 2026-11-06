# Arm/yolo26n-320-fp32-vgf

## Resumen

YOLO26n-320-fp32-vgf es una exportación del detector de objetos YOLO26n de Ultralytics al formato VGF (Vulkan Graph Format) con pesos, activaciones, entradas y salidas en FP32. Lo publica Arm dentro de su línea de artefactos optimizados para ejecución en sistemas Vulkan compatibles, y se distribuye a través de la librería Scenario Runner en lugar de ONNX Runtime. No hay reentrenamiento ni cuantización: el grafo es una conversión del artefacto ONNX FP32 original mediante la cadena Torch-MLIR → TOSA → VGF.

El modelo resuelve la necesidad de ejecutar detección de objetos NMS-free en hardware Arm con aceleración Vulkan ML, sin depender del stack ONNX. La entrada es fija de `[1, 3, 320, 320]` y el paquete pesa 14,551 MiB. El grafo expone la cabeza antes del TopK, de modo que el ejemplo realiza el TopK de dos etapas en el host; las predicciones siguen siendo NMS-free.

Es relevante ahora porque forma parte del esfuerzo de Arm por estandarizar un formato de grafo portable (VGF) sobre Vulkan ML para despliegue en el borde (edge-linux), una alternativa emergente a los runtimes propietarios. La ficha debe leerse con cautela: el autor declara explícitamente que no se han medido ni la precisión sobre dataset ni el rendimiento de esta exportación concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de detección de objetos (YOLO26n de Ultralytics), exportada como grafo VGF |
| Parametros totales | no disponible (no declarado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de imagen `[1, 3, 320, 320]`) |
| Tipos de cuantizacion | FP32 únicamente en esta exportación; el repositorio fuente de Arm incluye además un artefacto INT8 no usado aquí |
| Idiomas soportados | no disponible (modelo de visión; sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | VGF (`.vgf`), FP32; artefacto fuente ONNX FP32 |
| Tamaño del paquete | 14,551 MiB |
| Backend de ejecución | Scenario Runner con implementación Vulkan ML compatible o capa de emulación |
| Modelo base | Ultralytics/YOLO26 |
| Conversión | model-converter 0.11.0, Torch-MLIR 20260401.769, ONNX 1.23.2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO26n, un detector convolucional de la familia YOLO de Ultralytics, en su variante "n" (nano) con resolución de entrada de 320×320. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni el proceso de alineación, porque se trata de un modelo de visión y no de un modelo de lenguaje. Tampoco se documenta si el modelo base empleó técnicas de aumento de datos o destilación.

La innovación técnica de este artefacto no está en el entrenamiento, sino en la conversión: el ONNX FP32 original se transforma a Torch-MLIR, luego a TOSA y finalmente a VGF, preservando los pesos sin cambios. La conversión incluye adaptaciones de compatibilidad de grafo y runtime, en concreto el TopK en el host y la replicación exacta del muestreo "2× nearest-floor". El autor reporta una reconstrucción byte-idéntica de la conversión el 2026-10-21 y checksums SHA-256 tanto del ONNX fuente (`d38ee776...`) como del VGF resultante (`c0c23b17...`). No se aplicó cuantización.

## Capacidades

- Detección de objetos en imágenes con entrada fija de 320×320 píxeles y salida NMS-free.
- Exposición de la cabeza antes del TopK, con el TopK de dos etapas ejecutado en el host por el código de ejemplo.
- Preprocesado de imagen, ejecución del VGF, postprocesado de detecciones y visualización incluidos en `example.py`.
- Ejecución sobre Vulkan ML mediante Scenario Runner, con soporte de capa de emulación para desarrollo.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni multimodalidad lingüística.
- No se declaran capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Detección de objetos en el borde con aceleración Vulkan: el modelo se ejecuta sobre Scenario Runner y un driver Vulkan ML compatible, adecuado para dispositivos Arm con GPU integrada que ya exponen Vulkan.
- Prototipado de pipelines VGF: sirve como referencia funcional para desarrolladores que quieran validar la cadena de conversión ONNX → Torch-MLIR → TOSA → VGF antes de portar sus propios modelos.
- Visión embebida de baja resolución: la entrada de 320×320 reduce el coste computacional, lo que encaja en tareas de conteo, presencia o seguimiento aproximado donde no se requiere alta resolución.
- Validación numérica de conversiones: el paquete incluye comparaciones smoke foto/negro/foto contra el ONNX FP32 original, útil para verificar que una exportación reproduce el comportamiento del modelo fuente.
- Desarrollo con emulación: la capa de emulación de Vulkan ML permite iterar en máquinas sin GPU Vulkan compatible antes de desplegar en el hardware objetivo.
- Docencia y experimentación con formatos de grafo portables: el repositorio incluye `config.yaml` con el contrato de tensores, preprocesado y postprocesado, lo que facilita entender la interfaz del modelo.
- Integración en aplicaciones de inspección visual sencilla: con re-evaluación previa sobre datos propios, puede emplearse en detección de objetos genéricos en escenarios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica explícitamente que no se han medido latencia, throughput, memoria ni speedup para esta exportación VGF, y que las mediciones del repositorio fuente (ONNX FP32 e INT8 sobre Raspberry Pi 5) no son aplicables a este artefacto. Las mediciones con emulación Vulkan tampoco establecerían el rendimiento en hardware objetivo.

## Requisitos de hardware

- VRAM estimada: no disponible; el paquete pesa 14,551 MiB en FP32 y el modelo es de tipo nano, por lo que la huella en memoria es reducida, pero no se publica una cifra de VRAM.
- GPU recomendadas: no disponibles; el requisito es un sistema con implementación Vulkan ML compatible, típicamente GPU integradas en SoC Arm.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta soporte en RTX 4090, A100 ni H100, ya que el objetivo declarado es edge-linux con Vulkan.
- Opciones de despliegue: Scenario Runner (API experimental `scenario_runner` o `scenario_runner_py` para builds desde fuente) sobre Vulkan ML, con capa de emulación para desarrollo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para esta exportación.
- Dependencias: Python 3.12, `uv` para gestión de dependencias (`uv sync --frozen`), driver Vulkan ML o capa de emulación configurada en el mismo shell.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26n-320-fp32-vgf (este) | no disponible | 320×320 | VGF FP32 | AGPL-3.0 | Ejecución Vulkan ML vía Scenario Runner; sin métricas publicadas |
| YOLO26n-320 ONNX FP32 (Arm, fuente) | no disponible | 320×320 | ONNX FP32 | AGPL-3.0 | Baseline de referencia con mediciones en Raspberry Pi 5 |
| YOLO26n-320 ONNX INT8 (Arm, fuente) | no disponible | 320×320 | ONNX INT8 | AGPL-3.0 | Artefacto optimizado del mismo repositorio fuente; no usado en esta conversión |
| Ultralytics/YOLO26 (modelo base) | no disponible | variable | PyTorch | AGPL-3.0 | Modelo original de Ultralytics; referencia de arquitectura y entrenamiento |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada; las cifras del repositorio fuente corresponden a los artefactos ONNX y no deben extrapolarse al VGF.

## Limitaciones y advertencias

- No se ha evaluado la precisión sobre dataset de esta exportación: solo hay comparaciones numéricas smoke (foto/negro/foto) contra el ONNX FP32 original. Es obligatorio re-evaluar sobre datos propios antes de producción.
- No se han medido latencia, throughput ni memoria; el rendimiento en hardware objetivo es desconocido.
- El modelo es experimental y la API de Scenario Runner es experimental, lo que implica riesgo de cambios incompatibles.
- Requiere un driver Vulkan ML compatible o la capa de emulación correctamente configurada; instalar solo las dependencias Python no basta.
- La licencia AGPL-3.0 impone obligaciones copyleft fuertes para uso en red y distribución; conviene revisar su compatibilidad con el producto antes de uso comercial.
- Riesgo de sesgos y alucinaciones de detección heredado del modelo base YOLO26n y de su dataset de entrenamiento, no documentado en esta ficha.
- Entrada fija de 320×320: no admite resolución variable sin un nuevo proceso de conversión.
- El grafo expone la cabeza antes del TopK; el postprocesado en host es responsabilidad del integrador.
- No se declaran idiomas soportados ni capacidades de texto; cualquier uso lingüístico queda fuera del alcance del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Arm/yolo26n-320-fp32-vgf
- Repositorio fuente ONNX (Arm): https://huggingface.co/Arm/yolo26n-320-int8-onnx-raspberrypi5
- Artefacto ONNX FP32 original: https://huggingface.co/Arm/yolo26n-320-int8-onnx-raspberrypi5/blob/d85636720c31b6bc65d91b2c785d24fbdb283a61/yolo26n_raspberry_onnx_original.onnx
- Modelo base Ultralytics/YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Documentación de Scenario Runner (Python API): https://arm.github.io/ai-ml-sdk-for-vulkan/scenario-runner/docs/in/python_api.html
- Instalación de la capa de emulación Vulkan ML: https://arm.github.io/ai-ml-sdk-for-vulkan/installing.html
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
