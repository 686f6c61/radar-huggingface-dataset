# anguoyang/mobilenet-v3-small-qcs6490

## Resumen

Este repositorio no contiene un modelo de lenguaje ni pesos entrenados, sino una medición de rendimiento publicada por el usuario anguoyang sobre MobileNetV3-Small, una red neuronal convolucional para clasificación de imágenes en 1000 clases. La ficha documenta la primera medición pública de este modelo sobre el SoC Qualcomm QCS6490 montado en el kit Dragonwing RB3 Gen 2 Vision Kit, usando el runtime QNN de Qualcomm. El interés radica en que el `perf.yaml` de `qai-hub-models` 0.66.0 no incluía una entrada para este dispositivo concreto, de modo que el autor cubre ese hueco con datos de latencia medidos.

La arquitectura subyacente es MobileNetV3-Small, una CNN compacta con bloques de convolución separable en profundidad, atención por squeeze-and-excitation y activaciones h-swish, diseñada para inferencia en dispositivos de recursos limitados. El resultado reportado es un tiempo de inferencia estimado de 3,7 ms (3.744 µs) para una entrada de 1 × 3 × 224 × 224, en precisión fp32 exportada desde ONNX y compilada con las opciones por defecto de AI Hub, sin cuantización explícita.

Es relevante para quienes despliegan visión por computador en hardware embebido Qualcomm: aporta una referencia reproducible (IDs de job incluidos) y forma parte de un barrido más amplio de 28 modelos en 14 categorías. No obstante, se trata de una tarjeta de medición, no de un artefacto distribuible: no publica pesos ni binarios compilados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN con convoluciones separables en profundidad, squeeze-and-excitation y h-swish) |
| Parametros totales | no disponible en la model card (el ONNX exportado ocupa 10.183.200 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 1 × 3 × 224 × 224) |
| Tipos de cuantizacion | no se aplicó cuantización explícita; compilación con opciones por defecto de AI Hub sobre ONNX fp32 |
| Idiomas soportados | no aplica (clasificación de imágenes ImageNet, 1000 clases) |
| Licencia | modelo upstream BSD-3-Clause (pytorch/vision); la tarjeta publica solo mediciones, sin pesos |
| Formato de pesos | no se distribuyen pesos; la medición parte de un ONNX exportado (10.183.200 bytes) |

## Arquitectura y entrenamiento

MobileNetV3-Small es una red convolucional pensada para eficiencia computacional en el borde. Combina bloques de convolución separable en profundidad con módulos de squeeze-and-excitation para recalibración de canales y activaciones h-swish, y su cabecera produce logits sobre las 1000 clases de ImageNet. En esta tarjeta no se documenta el proceso de entrenamiento, el número de tokens o imágenes, ni si hubo destilación o ajuste fino: la información disponible se limita al uso del modelo tal como lo define `qai-hub-models` 0.66.0.

La innovación del repositorio no está en el modelo, sino en el procedimiento de medición: exportación a ONNX desde la definición de `mobilenet_v3_small` de `qai-hub-models` 0.66.0, compilación con Qualcomm AI Hub y perfilado de un único grafo mediante `submit_inference_job(..., profile=True)`. El valor reportado corresponde a `execution_summary.estimated_inference_time`, es decir, una estimación por grafo y no la latencia extremo a extremo de una aplicación. Se incluyen los identificadores de job (compilación `jgnd04orp`, perfilado `jp1k29v2g`) y la fecha de medición (2026-11-21).

## Capacidades

- Clasificación de imágenes en 1000 clases (ImageNet) a partir de entradas RGB de 224 × 224 píxeles.
- Inferencia en dispositivo sobre el SoC Qualcomm QCS6490 mediante el runtime QNN.
- Perfilado por grafo a través de la API de Qualcomm AI Hub, con estimación de tiempo de ejecución.
- Exportación a ONNX desde la definición de modelo de `qai-hub-models`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye modo thinking, visión generativa, audio ni otras modalidades más allá de la clasificación visual.

## Casos de uso

- Referencia de latencia para despliegues en QCS6490: usar el valor de 3,7 ms como línea base al comparar variantes cuantizadas del mismo modelo en el Dragonwing RB3 Gen 2 Vision Kit.
- Clasificación visual en el borde: integrar MobileNetV3-Small en una aplicación de cámara del kit RB3 para etiquetar fotogramas a 224 × 224 con latencia de milisegundos por inferencia.
- Filtrado previo en pipelines de visión: emplear la clasificación de 1000 clases como etapa de descarte rápido antes de modelos más costosos en el mismo dispositivo.
- Validación de toolchain: comprobar que la exportación ONNX y la compilación con AI Hub funcionan correctamente sobre un dispositivo no cubierto por `perf.yaml`, usando los job IDs publicados como traza.
- Comparación entre aceleradores: contrastar el rendimiento en QCS6490 con el de otros objetivos Dragonwing o Snapdragon incluidos en `qai-hub-models` para decidir el hardware de un producto.
- Reproducibilidad de benchmarks internos: replicar el arnés uniforme del barrido de 28 modelos y 14 categorías para mantener una línea de referencia propia de latencias.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 3,7 ms (3.744 µs) |
| Entrada | 1 × 3 × 224 × 224 |
| Salida | 1 × 1000 logits de clase |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, opciones por defecto de AI Hub (sin cuantización explícita) |
| Fecha de medición | 2026-11-21 |
| Job de compilación | jgnd04orp |
| Job de perfilado | jp1k29v2g |

No se han publicado resultados de benchmarks de precisión (top-1, top-5) en la información disponible.

## Requisitos de hardware

- Hardware de destino: Qualcomm QCS6490 en el Dragonwing RB3 Gen 2 Vision Kit; la medición es específica de ese SoC y no extrapolable directamente a otras plataformas.
- VRAM: no aplica; el modelo se ejecuta en un SoC con memoria unificada y la tarjeta no publica cifras de memoria.
- GPU recomendadas: no disponible; el runtime empleado es QNN, no CUDA.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: Qualcomm AI Hub (compilación y perfilado) y runtime QNN en el dispositivo; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este modelo.
- Latencia y throughput: 3,7 ms por grafo según la estimación del perfilador; el throughput no se publica y la cifra no equivale a latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MobileNetV3-Small (esta ficha) | no disponible | 224 × 224 | no aplica | 3,7 ms estimados en QCS6490 (QNN, fp32) | BSD-3-Clause (upstream) | Solo mediciones; sin pesos |
| Otras entradas de `qai-hub-models` 0.66.0 para Dragonwing/Snapdragon | no disponible | no disponible | no aplica | no disponible | no disponible | Incluidas en `perf.yaml` |
| Resto del barrido de 28 modelos del autor | no disponible | no disponible | no aplica | no disponible en esta tarjeta | no disponible | Colección qcs-model-zoo |

No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- La cifra de 3,7 ms es una estimación por grafo del perfilador de AI Hub, no una latencia extremo a extremo de aplicación; no debe usarse como garantía de rendimiento en producción.
- La medición se realizó en fp32 sin cuantización explícita; los resultados con cuantización INT8 u otras opciones de compilación pueden diferir y no se documentan.
- El repositorio no distribuye pesos ni artefactos compilados, por lo que no es directamente desplegable: solo publica números y método.
- La licencia del artefacto publicado no está declarada; la licencia BSD-3-Clause corresponde al modelo upstream de pytorch/vision.
- El modelo subyacente clasifica únicamente 1000 clases de ImageNet y no ofrece generación de texto, razonamiento ni capacidades multilingües.
- No se documentan sesgos, tasas de alucinación ni evaluación de precisión; al ser un clasificador, los riesgos se refieren a errores de clasificación y sesgos del dataset de entrenamiento original, no evaluados aquí.
- Los resultados son específicos del QCS6490 y del kit RB3 Gen 2; extrapolarlos a otros SoC o revisiones de firmware carece de respaldo en la información disponible.
- Las fechas de creación y actualización del repositorio (2026-11-23 y 2026-11-23) y de la model card (2026-11-24) deben tenerse en cuenta al evaluar la vigencia de las versiones de `qai-hub-models` empleadas (0.66.0).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/mobilenet-v3-small-qcs6490
- Colección de mediciones qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido qcs-bench: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub (herramienta de compilación y perfilado): no disponible en la información proporcionada
- Paper o blog del modelo MobileNetV3: no disponible en la información proporcionada
