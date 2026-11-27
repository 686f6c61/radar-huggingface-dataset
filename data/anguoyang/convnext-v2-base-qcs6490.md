# anguoyang/convnext-v2-base-qcs6490

## Resumen

ConvNeXt V2 Base es una red neuronal convolucional (CNN) pura para clasificación de imágenes, sucesora de la familia ConvNeXt y diseñada por Meta AI (FAIR) junto con KAIST y la Universidad de Wisconsin-Madison. Esta ficha concreta, publicada por el usuario anguoyang, no contiene pesos ni artefactos compilados: es un registro de medición de latencia del modelo sobre el acelerador Qualcomm QCS6490, integrado en el kit Dragonwing RB3 Gen 2 Vision Kit.

El interés de la publicación es que aporta el primer dato público de rendimiento de ConvNeXt V2 Base en ese SoC, ya que la versión 0.66.0 de `qai-hub-models` no incluye una entrada en `perf.yaml` para este modelo en el dispositivo RB3. Según el autor, la inferencia estimada es de 125,4 ms por imagen de 1×3×224×224, con salida de 1000 logits, en precisión fp32 exportada a ONNX y ejecutada con el runtime QNN de Qualcomm.

No se trata, por tanto, de un modelo entrenado o ajustado por el autor, sino de una medición de referencia (perfil de un único grafo) útil para quienes despliegan visión por computadora en hardware edge de Qualcomm. La arquitectura subyacente es ConvNeXt V2 Base, con unos 89 millones de parámetros y resolución nativa de 224×224, aunque el autor no detalla estos datos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN con bloques ConvNeXt, atención global opcional en la familia V2) |
| Parametros totales | no disponible en la model card (la familia ConvNeXt V2 Base ronda los 89 M, dato no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 1×3×224×224 píxeles) |
| Tipos de cuantizacion | fp32 ONNX con opciones por defecto de AI Hub; no se aplicó cuantización explícita en esta medición |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (licencia del modelo upstream según el autor); la model card no publica pesos |
| Formato de pesos | no se publican pesos; el artefacto medido es un ONNX exportado (355.123.021 bytes) |

## Arquitectura y entrenamiento

ConvNeXt V2 es una familia de redes convolucionales que moderniza el diseño de ResNet incorporando elementos propios de los transformers visuales (convoluciones depthwise de 7×7, normalización LayerNorm, activación GELU y estructura de bloques tipo stage). La variante V2 introduce la capa GRN (Global Response Normalization) y un esquema de entrenamiento auto-supervisado con enmascaramiento (FCMAE), que mejora la representación de características frente a la V1. El modelo base se entrena para clasificación ImageNet-1k con 1000 clases.

En esta ficha no se aportan detalles sobre el dataset de entrenamiento, el número de tokens/imágenes vistas ni si hubo ajuste fino con RLHF/DPO (no aplicable en visión). El autor se limita a documentar el proceso de exportación y perfilado: exportación ONNX desde la definición `convnext_v2_base` de `qai-hub-models` 0.66.0 y envío a Qualcomm AI Hub mediante `submit_inference_job(..., profile=True)`, tomando `execution_summary.estimated_inference_time` como métrica. Es un perfil de grafo, no una latencia de aplicación extremo a extremo.

## Capacidades

- Clasificación de imágenes en 1000 clases (ImageNet-1k), con salida de logits por imagen.
- Extracción de características visuales (backbone) para tareas downstream como detección, segmentación o recuperación, aunque no se documenta en esta card.
- Ejecución en hardware edge Qualcomm mediante el runtime QNN y el compilador de AI Hub.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Clasificación de imágenes en dispositivos edge: el modelo cabe en el QCS6490 y ofrece 125,4 ms por imagen en fp32, adecuado para aplicaciones de inspección visual en tiempo casi real (unas 8 imágenes por segundo en el mejor de los casos, sin solapamiento).
- Visión artificial industrial en cámaras inteligentes: serviría como clasificador de defectos o categorías de producto en un kit RB3 Gen 2, con latencia conocida para dimensionar la cadencia de captura.
- Prototipado de pipelines de IA en Qualcomm AI Hub: la medición sirve de referencia para comparar configuraciones de compilación (fp32 frente a cuantización int8) antes de invertir en optimización.
- Backbone para tareas de percepción en robótica de bajo consumo: al ser una CNN con 224×224 de entrada, puede integrarse en robots móviles o drones que embarquen el QCS6490.
- Clasificación de imágenes en aplicaciones de retail o agricultura de precisión: el modelo permite categorizar productos o estados de cultivo en campo, sin depender de la nube.
- Benchmarking interno de hardware: el dato de 125,4 ms permite comparar el QCS6490 con otros SoC (por ejemplo, variantes de Snapdragon) usando el mismo harness de perfilado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 125,4 ms (125.445 µs) |
| Entrada | 1 × 3 × 224 × 224 |
| Salida | 1000 logits |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, opciones por defecto de AI Hub |
| Fecha de medición | 2026-11-27 |
| IDs de job | compilación `jpvy9qzmp`, perfilado `jpe0lo40g` |

No se han publicado resultados de benchmarks de precisión (ImageNet top-1, etc.) en la información disponible. La única métrica es la latencia estimada de perfilado de un grafo.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en el SoC QCS6490 con memoria unificada, no en una GPU dedicada.
- GPU recomendadas: el dispositivo de referencia es el Dragonwing RB3 Gen 2 Vision Kit con QCS6490; no se documentan otras GPU.
- ¿Cabe en GPU de consumo? No se ha medido en GPU de consumo; el modelo base (≈89 M de parámetros en la familia) cabría en GPUs de consumo, pero esta ficha no aporta datos al respecto.
- Opciones de despliegue: Qualcomm AI Hub (compilación y perfilado), runtime QNN; el ONNX exportado puede ejecutarse con ONNX Runtime en otras plataformas, aunque no se documenta.
- Latencia y throughput: 125,4 ms por imagen en el QCS6490 con fp32; no se aportan datos de throughput agregado ni de latencia con cuantización int8.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConvNeXt V2 Base (esta ficha) | no disponible en la card (≈89 M en la familia) | 224×224 | no aplica | Apache-2.0 | Medición pública en QCS6490; sin pesos |
| ConvNeXt V1 Base | ≈89 M (dato de la familia) | 224×224 | no aplica | Apache-2.0 | Pesos públicos en repositorios de Meta |
| ResNet-50 | ≈25,6 M | 224×224 | no aplica | Apache-2.0 | Pesos públicos, ampliamente soportado |
| EfficientNet-B0 | ≈5,3 M | 224×224 | no aplica | Apache-2.0 | Pesos públicos, muy usado en edge |

No se dispone de datos de rendimiento comparables en el QCS6490 para estos modelos en la información proporcionada; la comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- La model card no publica pesos ni artefactos compilados: solo documenta una medición; no es un modelo listo para descargar y usar.
- El dato de 125,4 ms es una estimación de perfilado de un único grafo, no una latencia de aplicación extremo a extremo; no incluye preprocesado, postprocesado ni comunicación.
- La medición se hizo en fp32 sin cuantización explícita; el rendimiento con int8 u otras precisiones no está documentado.
- No se aportan métricas de precisión (top-1, top-5) ni evaluación de sesgos; se desconoce el comportamiento del modelo en dominios distintos de ImageNet.
- La licencia Apache-2.0 corresponde al modelo upstream según el autor; conviene verificar la licencia del repositorio original antes de uso comercial.
- El modelo es una CNN de clasificación: no soporta texto, agentes ni tool calling, por lo que no debe confundirse con un modelo de lenguaje.
- La fecha de creación de la ficha (2026-11-27) es futura respecto a la información habitual disponible; verificar la vigencia de los enlaces y del harness.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anguoyang/convnext-v2-base-qcs6490
- Repositorio qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Repositorio qcs-bench: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub: https://aihub.qualcomm.com/
- Repositorio qai-hub-models: https://github.com/quic/ai-hub-models
- Paper de ConvNeXt V2: https://arxiv.org/abs/2301.00808
- Paper de ConvNeXt V1: https://arxiv.org/abs/2201.03545
