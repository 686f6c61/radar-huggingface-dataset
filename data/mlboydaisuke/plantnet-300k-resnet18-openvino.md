# mlboydaisuke/PlantNet-300K-ResNet18-OpenVINO

## Resumen

PlantNet-300K-ResNet18-OpenVINO es una conversión del clasificador de especies vegetales ResNet18 entrenado sobre el conjunto de datos Pl@ntNet-300K, empaquetado específicamente para su ejecución en la NPU, GPU integrada y CPU de procesadores Intel. El autor, mlboydaisuke, parte del modelo en formato LiteRT publicado por litert-community (a su vez derivado del modelo original de cpoisson) y lo convierte a ONNX mediante tf2onnx 1.17.0 (opset 17), generando además un IR de OpenVINO con pesos fp32 y un blob precompilado para la NPU Intel. El resultado es un artefacto de 0,1 GB que permite inferencia de clasificación de imágenes en hardware de consumo Intel con latencias del orden de milisegundos.

El modelo resuelve un problema muy concreto: desplegar un clasificador de especies de plantas de 1.081 clases en equipos portátiles y dispositivos con aceleradores Intel, sin depender de GPU dedicadas ni de frameworks de alto nivel. La relevancia actual radica en su carácter de ejemplo reproducible de despliegue en NPU Intel (AI Boost) mediante OpenVINO, con mediciones detalladas de latencia por procesador y verificaciones de equivalencia numérica frente al modelo de referencia en CPU.

Arquitectónicamente es una ResNet18 estándar (red neuronal convolucional de 18 capas con conexiones residuales), de aproximadamente 45 MB en fp32, especializada en clasificación de imágenes de plantas. No es un modelo generativo ni multilingüe: su única tarea es la clasificación de imágenes en 1.081 categorías de especies vegetales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN con conexiones residuales) |
| Parametros totales | no disponible (pesos fp32 de ~46,9 MB en ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | fp32 (IR de OpenVINO y ONNX); blob NPU precompilado; copia fp16 del ONNX usada en las pruebas con CUDA EP (no incluida en el repo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin) y blob precompilado para NPU Intel |

## Arquitectura y entrenamiento

El modelo es una ResNet18, una red convolucional de 18 capas con bloques residuales, adaptada a la clasificación de 1.081 especies vegetales del conjunto Pl@ntNet-300K. La model card del repositorio no documenta el proceso de entrenamiento (número de épocas, aumentos de datos, función de pérdida ni si hubo ajuste fino desde pesos de ImageNet); esa información corresponde al modelo original cpoisson/plantnet300k-resnet18, del que este es una conversión de formato. El conjunto Pl@ntNet-300K-v2 contiene 306.087 imágenes de 1.000 especies con distribución de clases de cola larga y alta ambigüedad visual, según el repositorio oficial del dataset.

La innovación técnica de esta ficha no está en el entrenamiento sino en el empaquetado para inferencia: conversión de LiteRT/TFLite a ONNX con tf2onnx 1.17.0 (opset 17), generación de un IR de OpenVINO con pesos fp32 y compilación de un blob específico para la NPU Intel con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841. El autor verifica la equivalencia numérica de cada salida frente a la referencia en CPU fp32 (ONNX Runtime CPU EP), exigiendo coseno ≥ 0,99, ausencia de NaN/Inf y coincidencia top-1 ≥ 0,99; todas las filas Intel superan el umbral con coseno ≥ 0,9999.

## Capacidades

- Clasificación de imágenes en 1.081 clases de especies vegetales (tarea única de image-classification).
- Inferencia en NPU Intel AI Boost, GPU integrada Intel, CPU Intel y GPU NVIDIA (vía CUDA EP de ONNX Runtime).
- Ejecución mediante OpenVINO (importación directa del blob o compilación del IR) y mediante ONNX Runtime con el Execution Provider de OpenVINO o el de CUDA.
- Verificación de equivalencia numérica frente a la referencia en CPU incluida en la documentación del repositorio.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües.

## Casos de uso

- Identificación de especies vegetales en aplicaciones de campo: el modelo clasifica una imagen preprocesada en una de las 1.081 especies con una latencia de 1,10 ms en la NPU de un Core Ultra 9 386H, lo que permite integración en apps de escritorio o portátiles sin GPU dedicada.
- Clasificación por lotes en equipos portátiles Intel: al ejecutarse en la iGPU en 1,14 ms por imagen (ONNX Runtime + OpenVINO EP), es adecuado para procesar grandes volúmenes de fotografías de herbario o inventarios botánicos en un portátil convencional.
- Preprocesado o filtrado en pipelines de ciencia ciudadana: utilizable como primer clasificador que descarte imágenes no vegetales o agrupe observaciones antes de un modelo mayor, gracias a su bajo coste computacional y a su tamaño de 0,1 GB.
- Despliegue en dispositivos con NPU Qualcomm: el ONNX del repositorio se ha perfilado en Snapdragon X2 Elite NPU (0,48 ms) y Galaxy S26 NPU (0,53 ms) mediante Qualcomm AI Hub, lo que abre la puerta a aplicaciones móviles de identificación de plantas.
- Educación y divulgación botánica: integrado en herramientas de escritorio que muestren la especie probable de una foto tomada por el usuario, con la ventaja de funcionar íntegramente en local y sin conexión.
- Referencia para experimentos de despliegue en NPU Intel: sirve como caso base reproducible (scripts, blob precompilado, tabla de latencias) para evaluar el rendimiento de OpenVINO 2026.4.1 en hardware Intel antes de portar modelos mayores.
- Validación de pipelines de conversión TFLite → ONNX → OpenVINO: el repositorio documenta los comandos y las comprobaciones de equivalencia, por lo que es útil como plantilla para convertir otros clasificadores LiteRT a NPU Intel.

## Benchmarks y rendimiento

La model card no incluye métricas de precisión (accuracy, top-1, top-5) sobre Pl@ntNet-300K. Sí incluye mediciones de latencia y comprobaciones de salida, que se reproducen a continuación.

| Procesador | Runtime | Fichero | ms | Carga (s) | Comprobación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 1,10 | 0,02 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` (compila al cargar) | 1,35 | 0,68 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,14 | 0,37 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` (no incluida) | 1,35 | 1,12 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 1,56 | 1,13 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 3,93 | 0,11 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 0,48 | 0,36 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` (compila al cargar) | 0,48 | 0,85 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 0,53 | 0,15 | no comparado |

Las mediciones se realizaron en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, alimentación por corriente) entre el 6 y el 7 de noviembre de 2026, con entrada y salida en numpy, 5 ejecuciones de calentamiento y mediana de 30 ejecuciones cronometradas. No se han publicado resultados de precisión en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en fp32 ocupa unos 46,9 MB de pesos; en fp16, aproximadamente la mitad. Cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: no requiere GPU dedicada; funciona en la iGPU de los Core Ultra y en la NPU Intel AI Boost. Con GPU NVIDIA se ha probado en una RTX 5080 Laptop (95 W) con CUDA EP de ONNX Runtime, obteniendo 1,35 ms en fp16 y 1,56 ms en fp32.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria libre; también en CPU y NPU integradas.
- Opciones de despliegue: OpenVINO 2026.4.1 (importación del blob o compilación del IR para NPU, iGPU o CPU), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1 o CUDA EP, y Qualcomm AI Hub para NPU Snapdragon (QNN EP). El blob NPU está compilado con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; en otra versión de driver o de OpenVINO puede ser necesario recompilar el IR.
- Latencia y throughput estimados: 1,10 ms por inferencia en NPU Intel (mediana de 30 ejecuciones), 1,14 ms en iGPU Intel, 3,93 ms en CPU Core Ultra 9 386H y 0,48–0,53 ms en NPU Snapdragon según los perfiles de Qualcomm AI Hub.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Clases | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PlantNet-300K-ResNet18-OpenVINO | ResNet18 | ~45 MB (fp32) | 1.081 | no aplica | Apache-2.0 | Hugging Face, ONNX + IR + blob NPU |
| cpoisson/plantnet300k-resnet18 | ResNet18 | ~45 MB | 1.081 | no aplica | no disponible en la información | Hugging Face (modelo original de referencia) |
| litert-community/PlantNet-300K-ResNet18-LiteRT | ResNet18 | no disponible | 1.081 | no aplica | Apache-2.0 | Hugging Face, formato LiteRT/TFLite |
| MobileNetV3-Small (mencionado como comparación en el README del modelo base) | MobileNetV3-Small | ~10 MB | no disponible | no aplica | no disponible | no disponible |

El modelo base cpoisson/plantnet300k-resnet18 se describe como la referencia superior en un experimento que lo compara con un MobileNetV3-Small de 10 MB para evaluar el coste de precisión de reducir drásticamente el tamaño. No se dispone de datos de precisión comparativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo clasifica imágenes en 1.081 especies de plantas; no es un modelo de propósito general ni admite texto, audio u otras modalidades.
- No se han publicado métricas de precisión (top-1, top-5) en la información disponible, por lo que no es posible evaluar su calidad predictiva a partir de la model card.
- El conjunto Pl@ntNet-300K tiene distribución de cola larga y alta ambigüedad visual, lo que puede traducirse en un rendimiento desigual entre especies frecuentes y raras.
- El blob NPU está compilado para OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y habrá que recompilar el IR.
- Las mediciones de latencia corresponden a un equipo concreto (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711) y no son extrapolables sin más a otro hardware.
- Las filas de Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub y no se compararon numéricamente con la referencia en CPU.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo original cpoisson/plantnet300k-resnet18 y del dataset Pl@ntNet-300K para usos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con confianza alta en imágenes ambiguas o fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/PlantNet-300K-ResNet18-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/PlantNet-300K-ResNet18-LiteRT
- Modelo original: https://huggingface.co/cpoisson/plantnet300k-resnet18
- Repositorio de scripts y mediciones: https://github.com/john-rocky/windows-zoo
- Dataset Pl@ntNet-300K: https://github.com/plantnet/PlantNet-300K
