# Arm/ultraface-rfb-320-fp32-vgf

## Resumen

UltraFace RFB-320 FP32 VGF es una conversión del detector de rostros UltraFace RFB-320 original de Linzaer al formato Vulkan Graph Format (VGF), empaquetada por Arm para su ejecución sobre el backend Scenario Runner con una implementación compatible de Vulkan ML. No se ha reentrenado ni cuantizado el modelo: conserva los pesos, activaciones, entradas y salidas en FP32 del artefacto ONNX original, y añade correcciones de grafo (softmax de clases y centrado de anclas) para que el host pueda decodificar los offsets SSD y aplicar NMS.

El modelo resuelve la detección de rostros en entornos de borde (edge), con una entrada fija de `[1, 3, 240, 320]` y un tamaño de solo 1,137 MiB. Su relevancia actual es acotada y experimental: sirve como referencia para desarrolladores que quieran explorar la ejecución de grafos VGF sobre Vulkan en sistemas compatibles, no como un modelo listo para producción. El paquete no incluye mediciones de latencia, throughput ni precisión de dataset para esta exportación concreta; las métricas publicadas en el repositorio de origen corresponden a los artefactos ONNX FP32 e INT8 sobre Raspberry Pi 5 y no son extrapolables a este VGF.

La ficha se basa únicamente en la información del repositorio y de la model card; cualquier dato no documentado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red detectora de rostros tipo SSD ligera con módulo RFB (Receptive Field Block), exportada a grafo VGF; arquitectura de red neuronal convolucional |
| Parametros totales | no disponible (el paquete no declara recuento de parametros; el tamaño del artefacto es de 1,137 MiB en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | FP32 únicamente en este paquete; el repositorio de origen incluye además un artefacto INT8 que no se usó para esta conversión |
| Idiomas soportados | no disponible (modelo de detección de rostros, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | VGF (`.vgf`) con pesos, activaciones, entradas y salidas en FP32; el origen es ONNX FP32 |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Forma de entrada | `[1, 3, 240, 320]` (NCHW) |
| Backend de ejecución | Scenario Runner con implementación compatible de Vulkan ML o capa de emulación |
| Modelo base | ultraface-rfb-320 (Linzaer) |
| Herramientas de conversión | model-converter 0.11.0, Torch-MLIR 20260401.769, ONNX 1.23.2 |
| SHA-256 origen (ONNX) | `360f8c2d9c070f0a8d28b2bf6b3a3ec5ad69625618796f049908522e2275cd4a` |
| SHA-256 VGF | `665e3f0ef67ea93a0b21c8acf3d33604ef4c3f82bd61860887beb35f5adba471` |
| Python requerido | 3.12 |

## Arquitectura y entrenamiento

UltraFace RFB-320 es un detector de rostros de una sola etapa basado en SSD con un módulo RFB que amplía el campo receptivo efectivo mediante convoluciones dilatadas multirama, lo que permite mantener un coste computacional bajo con una resolución de entrada reducida de 240x320 píxeles. El modelo original fue desarrollado por Linzaer y entrenado sobre datos de rostros; esta ficha no dispone de detalles sobre el número de tokens, la composición exacta del dataset ni el uso de RLHF o DPO, que no aplican a un detector visual de este tipo.

La conversión realizada por Arm no modifica los pesos: parte del artefacto ONNX FP32 original en la revisión `dd894b3db6ac5ac2bcff20e5cab96b40a4402855` y lo transforma mediante la cadena Original FP32 ONNX → Torch-MLIR → TOSA → VGF. El grafo resultante incorpora el softmax de clases y las correcciones de centrado de anclas para que el host pueda decodificar los offsets SSD y aplicar NMS. El proveedor reporta comprobaciones de humo numéricas (foto/negro/foto) y una reconstrucción de conversión byte a byte idéntica fechada el 2026-10-21. No se aplicó cuantización ni reentrenamiento.

## Capacidades

- Detección de rostros en imágenes: el modelo localiza caras y devuelve cajas delimitadoras con puntuaciones de clase, con decodificación SSD y NMS realizadas en el host.
- Entrada de imagen de resolución fija de 240x320 píxeles, adecuada para pipelines de visión en borde con requisitos de memoria muy bajos.
- Ejecución sobre Vulkan ML mediante Scenario Runner, lo que permite desplegar el grafo en sistemas con soporte Vulkan o con la capa de emulación de Arm.
- Preprocesado y postprocesado incluidos: el paquete incorpora `example.py` con preprocesado de imagen, ejecución del VGF, postprocesado de detecciones y visualización.
- Contrato de tensores documentado en `config.yaml` (tensor de referencia, preprocesado y postprocesado).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni soporte multilingüe: es exclusivamente un detector de rostros.

## Casos de uso

- Detección de rostros en dispositivos de borde: el modelo se ejecutaría sobre un sistema Linux de borde con Vulkan ML para localizar caras en flujos de cámara, aprovechando su tamaño de 1,137 MiB y su entrada de baja resolución para minimizar el consumo de memoria.
- Prototipado de pipelines VGF: sirve como referencia para validar la cadena de conversión ONNX → Torch-MLIR → TOSA → VGF y comprobar que Scenario Runner ejecuta correctamente un grafo con correcciones de softmax y anclas.
- Evaluación de la capa de emulación Vulkan de Arm: permite verificar la instalación y configuración de la capa de emulación en Linux antes de portar modelos mayores, usando `example.py` como prueba de humo funcional.
- Control de presencia o conteo de personas: integrado en un pipeline de visión que reciba fotogramas de una cámara IP, el detector puede alimentar lógica de conteo o activación de eventos, siempre que se revalide su precisión sobre los datos propios del despliegue.
- Anonimización de imágenes: las cajas de rostro devueltas pueden usarse para aplicar desenfoque o pixelado previo a la publicación de imágenes, en un flujo por lotes o en tiempo real con hardware compatible con Vulkan.
- Investigación comparativa de formatos: útil para comparar el comportamiento numérico del VGF FP32 frente al ONNX FP32 de origen mediante las comprobaciones de humo foto/negro/foto documentadas, sin asumir equivalencia de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta exportación VGF. La model card indica explícitamente que el rendimiento y la precisión de dataset no se han medido para este paquete, y que las mediciones del repositorio de origen (ONNX FP32 e INT8 sobre Raspberry Pi 5) no son mediciones de este VGF. Tampoco se declaran latencia, throughput, memoria ni speedup para esta exportación.

| Area | Resultado declarado |
|---|---|
| Formato | VGF (`.vgf`), FP32 |
| Backend | Scenario Runner con Vulkan ML compatible o capa de emulación |
| Forma de entrada | `[1, 3, 240, 320]` |
| Tamaño del modelo | 1,137 MiB |
| Rendimiento VGF / precisión de dataset | No medido para esta exportación |
| Validación de origen | Comprobaciones de humo numéricas foto/negro/foto reportadas por el proveedor y reconstrucción byte a byte idéntica |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el artefacto FP32 ocupa 1,137 MiB, por lo que el peso de los tensores es mínimo y el consumo adicional depende de las activaciones y del backend Vulkan.
- GPU recomendadas: cualquier GPU con soporte de Vulkan ML compatible con Scenario Runner; la model card no enumera modelos concretos (A100, H100, RTX 4090 u otros) ni confirma compatibilidad con ellos.
- GPU de consumo: no se confirma que quepa en tarjetas de consumo concretas; el tamaño reducido del artefacto lo hace plausible, pero no hay validación publicada.
- Opciones de despliegue: Scenario Runner (API experimental `scenario_runner` o `scenario_runner_py` para compilaciones desde fuente) sobre Vulkan ML o la capa de emulación de Arm; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la model card advierte que las mediciones sobre emulación Vulkan no establecerían el rendimiento en hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UltraFace RFB-320 FP32 VGF (este) | no disponible; artefacto de 1,137 MiB | Imagen `[1, 3, 240, 320]` | No medido para este VGF | MIT | Hugging Face (Arm) |
| UltraFace RFB-320 ONNX (origen, FP32 e INT8) | no disponible | Imagen, misma resolución | Métricas publicadas sobre Raspberry Pi 5 en el repositorio de origen | MIT | Hugging Face (Arm) |
| Ultra-Light-Fast-Generic-Face-Detector-1MB (Linzaer) | no disponible | Imagen | Métricas del repositorio original | MIT | GitHub |

No se dispone de datos de benchmarks comparables entre estas variantes dentro de la información proporcionada; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental: la etiqueta `experimental` y el uso de una API de Scenario Runner en estado experimental implican que la interfaz puede cambiar sin garantías de estabilidad.
- Sin métricas de rendimiento ni de precisión para este VGF: cualquier decisión de producción exige reevaluar el modelo sobre datos propios, tal como indica la model card.
- Validación limitada: la validación reportada consiste en comprobaciones de humo numéricas foto/negro/foto y una reconstrucción byte a byte idéntica, no una evaluación sobre dataset.
- Dependencia de Vulkan: requiere un driver Vulkan ML compatible o la capa de emulación de Arm correctamente instalada y configurada; instalar solo las dependencias Python no configura el driver ni las capas.
- Sesgos: no documentados en la información disponible; al ser un detector de rostros entrenado con un dataset no descrito en esta ficha, puede presentar sesgos demográficos no caracterizados.
- Riesgo de falsos positivos y negativos: no cuantificado para esta exportación; la decodificación SSD y el NMS se ejecutan en el host, por lo que los umbrales deben calibrarse.
- Alcance funcional restringido: no es un modelo de lenguaje ni un modelo multimodal general; no admite texto, tool calling ni agentes.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución y revisar la licencia del modelo base de Linzaer, también MIT.
- Sin soporte documentado de cuantización en este paquete: solo se distribuye FP32; el artefacto INT8 del repositorio de origen no forma parte de esta conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Arm/ultraface-rfb-320-fp32-vgf
- Repositorio de origen ONNX en Hugging Face: https://huggingface.co/Arm/ultraface-rfb-320-onnx-raspberry
- Artefacto ONNX FP32 original: https://huggingface.co/Arm/ultraface-rfb-320-onnx-raspberry/blob/dd894b3db6ac5ac2bcff20e5cab96b40a4402855/ultraface-rfb-320_raspberry_onnx_original.onnx
- Rendimiento del modelo de origen: https://huggingface.co/Arm/ultraface-rfb-320-onnx-raspberry/blob/dd894b3db6ac5ac2bcff20e5cab96b40a4402855/README.md#performance
- Registros de benchmark del origen: https://huggingface.co/Arm/ultraface-rfb-320-onnx-raspberry/tree/dd894b3db6ac5ac2bcff20e5cab96b40a4402855/benchmarks
- Precisión del modelo de origen: https://huggingface.co/Arm/ultraface-rfb-320-onnx-raspberry/blob/dd894b3db6ac5ac2bcff20e5cab96b40a4402855/README.md#accuracy
- Modelo original de Linzaer: https://github.com/Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB
- Licencia del modelo original: https://github.com/Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB/blob/master/LICENSE
- Instalación de la capa de emulación Vulkan de Arm: https://arm.github.io/ai-ml-sdk-for-vulkan/installing.html
- Documentación de Scenario Runner Python: https://arm.github.io/ai-ml-sdk-for-vulkan/scenario-runner/docs/in/python_api.html
