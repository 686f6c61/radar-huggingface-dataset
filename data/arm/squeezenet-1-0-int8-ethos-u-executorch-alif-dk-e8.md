# Arm/squeezenet-1-0-int8-ethos-u-executorch-alif-dk-e8

## Resumen

SqueezeNet 1.0 optimizado para NPUs Arm Ethos-U es una conversión del conocido modelo de clasificación de imágenes SqueezeNet 1.0 de PyTorch (torchvision) a un programa ExecuTorch (`.pte`) con cuantización estática W8A8 y delegación al acelerador Ethos-U. Lo publica Arm dentro de su línea de artefactos optimizados para sistemas embebidos, y la conversión la realizó Nota AI mediante la herramienta Arm AI Model Optimizer. El objetivo no es un modelo nuevo, sino un artefacto desplegable que demuestre clasificación de imágenes en microcontroladores y NPUs de bajo consumo.

El modelo resuelve el problema de llevar una red convolucional de visión a un dispositivo embebido con presupuesto de memoria y latencia muy ajustados: el programa ocupa 1,22 MB, pico de memoria de 2,65 MB y alcanza 22,92 ms de latencia p50 (43,63 FPS) en la placa de referencia Alif Ensemble E8 con Cortex-M55 y Ethos-U85. La precisión se mantiene prácticamente intacta respecto al original, con un Top-1 del 54,80 % en ImageNet-1k (-0,14 pp).

Es relevante ahora porque ejemplifica el flujo completo de despliegue TinyML/Edge AI con ExecuTorch 1.1.0 y el backend Ethos-U, y sirve como referencia reproducible para desarrolladores que evalúan cargas de trabajo de visión en Cortex-M y NPUs embebidas. No es un modelo de lenguaje ni un transformer: es una CNN clásica de clasificación, con 1,24 M de parámetros y entrada fija de 224x224.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN SqueezeNet 1.0 (bloques fire), exportada a ExecuTorch con delegado Ethos-U |
| Parametros totales | 1,24 M (aprox., SqueezeNet 1.0 estándar) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 RGB) |
| Tipos de cuantizacion | INT8 estática W8A8: pesos INT8 simétricos por canal, activaciones INT8 |
| Idiomas soportados | no disponible (clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (con delegado Ethos-U), más `metadata.yaml` y registros de benchmarks |

## Arquitectura y entrenamiento

SqueezeNet 1.0 es una red convolucional diseñada para minimizar parámetros manteniendo precisión competitiva en ImageNet. Su bloque central es el módulo "fire", que combina una convolución 1x1 de compresión (squeeze) con una expansión paralela de convoluciones 1x1 y 3x3, reduciendo el coste computacional frente a CNN más profundas. La entrada es de 224x224 píxeles y la salida es un vector de 1.000 clases de ImageNet-1k.

Este artefacto no incluye reentrenamiento ni ajuste fino: se parte del modelo original de `torchvision`, se aplica cuantización estática post-entrenamiento W8A8 calibrada con 1.000 muestras aleatorias (`imagenet1k_calib_seed42_n1000`) y se exporta a ExecuTorch con el delegado Ethos-U para su ejecución en la NPU. La innovación técnica no está en la arquitectura, sino en el pipeline de conversión y despliegue: cuantización por canal simétrica, delegación completa al acelerador y validación tanto de precisión (5.000 imágenes de validación) como de latencia (200 ejecuciones medidas) sobre hardware real.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k a resolución 224x224.
- Inferencia INT8 de extremo a extremo en NPU Ethos-U85 con delegado ExecuTorch.
- Ejecución en microcontroladores Cortex-M55 con NPU asociada (placa Alif Ensemble E8).
- Throughput medido de 43,63 imágenes por segundo con batch size 1.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión generativa, audio ni modo de razonamiento.
- No tiene capacidades multilingües: no procesa ni genera lenguaje natural.
- No soporta agentes ni conversación multi-turno.

## Casos de uso

- Clasificación de imágenes en dispositivos de muy bajo consumo: el programa de 1,22 MB y 2,65 MB de pico de memoria cabe en sistemas con SRAM limitada, permitiendo clasificar fotogramas en tiempo real a ~43 FPS sin conexión a la nube.
- Referencia de benchmarking para evaluar NPUs Ethos-U: sirve para medir latencia p50 y throughput de un acelerador concreto antes de comprometerse con un SoC, usando el mismo artefacto y configuración documentada.
- Prototipado de visión en wearables y sensores industriales: con 22,92 ms por inferencia en la placa de referencia, es viable en aplicaciones de inspección o detección de presencia con restricciones de energía.
- Validación de pipelines de cuantización W8A8: el repositorio incluye registros de benchmarks y metadatos que permiten comparar el impacto de la cuantización (pérdida de 0,14 pp en Top-1) frente al modelo en punto flotante.
- Educación y demostración de ExecuTorch: como ejemplo completo de exportación `.pte` con delegado Ethos-U, es útil para enseñar el flujo PyTorch → ExecuTorch → NPU embebida.
- Integración en productos de clasificación genérica de imágenes: para tareas cercanas a las clases de ImageNet (objetos cotidianos, animales, vehículos), el modelo puede servir como clasificador base en cámaras inteligentes o sistemas de domótica.
- Evaluación comparativa de hardware: al estar medido sobre una configuración de referencia concreta (ExecuTorch 1.1.0, batch 1, 224x224), permite comparar placas y runtimes bajo condiciones controladas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos sobre Alif Ensemble E8 (Cortex-M55 + Ethos-U85) con ExecuTorch 1.1.0, batch size 1, entrada 224x224 y 200 ejecuciones:

| Metrica | Baseline | Optimizado | Mejora |
|---|---:|---:|---:|
| Latencia p50 extremo a extremo | 61,05 ms | 22,92 ms | 2,66x |
| Throughput | no disponible | 43,63 fps | no disponible |
| Pico de memoria | 2,65 MB | 2,65 MB | 1,00x |
| Tamano del modelo | 1,22 MB | 1,22 MB | 1,00x |
| Top-1 accuracy (ImageNet-1k val, 5.000 muestras) | 54,94 % | 54,80 % | -0,14 pp |
| Top-5 accuracy | no disponible | 78,94 % | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en memoria del sistema embebido, con un pico de 2,65 MB y un artefacto de 1,22 MB.
- Hardware de referencia: placa Alif Ensemble E8 con CPU Cortex-M55 y NPU Ethos-U85.
- GPU recomendadas: no aplica; no está pensado para GPU de escritorio ni servidor (A100, H100, RTX 4090).
- ¿Cabe en GPU consumer? No es su objetivo; requiere el delegado Ethos-U y un runtime ExecuTorch compatible con la NPU.
- Opciones de despliegue: ExecuTorch 1.1.0 con backend/delegado Ethos-U; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: 22,92 ms p50 y 43,63 fps en la configuración de referencia; el rendimiento puede variar según dispositivo, versión de runtime, soporte del backend, configuración de memoria y carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Top-1 ImageNet-1k | Formato / despliegue | Licencia |
|---|---|---:|---:|---|---|
| SqueezeNet 1.0 INT8 Ethos-U (este) | ~1,24 M | 224x224 | 54,80 % (5.000 muestras) | ExecuTorch `.pte` + Ethos-U | BSD-3-Clause |
| SqueezeNet 1.0 original (torchvision) | ~1,24 M | 224x224 | 54,94 % (5.000 muestras) | PyTorch (FP32) | BSD-3-Clause |
| MobileNetV2 | ~3,5 M | 224x224 | no disponible en la informacion proporcionada | PyTorch / múltiples runtimes | BSD-3-Clause |
| MobileNetV3-Small | ~2,5 M | 224x224 | no disponible en la informacion proporcionada | PyTorch / múltiples runtimes | BSD-3-Clause |

La comparación con MobileNetV2 y MobileNetV3-Small se ofrece solo como referencia de categoría (CNN ligeras para visión embebida); no se dispone de sus métricas de precisión ni de latencia en el mismo hardware en la información proporcionada.

## Limitaciones y advertencias

- La precisión se midió sobre un subconjunto de 5.000 imágenes del conjunto de validación de ImageNet-1k, no sobre las 50.000 completas; los valores pueden no ser representativos del rendimiento global.
- El rendimiento depende del dispositivo objetivo, la versión del runtime, el soporte del backend, la configuración de memoria y la carga del sistema; los resultados no garantizan un comportamiento idéntico en otros sistemas Arm.
- Solo clasifica 1.000 clases de ImageNet-1k; no es adecuado para clases fuera de ese vocabulario sin reentrenamiento o ajuste.
- No se realizó reentrenamiento ni ajuste fino durante la conversión, por lo que hereda los sesgos y limitaciones del SqueezeNet 1.0 original, incluidos posibles sesgos de representación del dataset ImageNet.
- Riesgo de clasificaciones erróneas en imágenes fuera de distribución o con condiciones de iluminación, ángulo o resolución distintas a las de entrenamiento.
- No procesa lenguaje natural, por lo que no aplican consideraciones de sesgo lingüístico ni de alucinación textual.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; deben respetarse los términos de las licencias del modelo original y de terceros.
- El repositorio no sustituye la documentación del modelo original; para detalles de entrenamiento, datos y usos previstos debe consultarse la fuente original de PyTorch.
- Es un artefacto de referencia para evaluación y prototipado; se recomienda reevaluar el modelo con datos propios antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arm/squeezenet-1-0-int8-ethos-u-executorch-alif-dk-e8
- SqueezeNet 1.0 original (torchvision): https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.squeezenet1_0.html
- Arm AI Model Optimizer: https://developer.arm.com/dev-docs/ai-model-optimizer/
- Licencia BSD-3-Clause: https://opensource.org/license/bsd-3-clause
