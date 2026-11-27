# anguoyang/dfine-qcs6490

## Resumen

D-FINE es un modelo de deteccion de objetos basado en arquitectura DETR (DEtection TRansformer) con refinamiento iterativo de cajas, desarrollado originalmente por el grupo de investigacion de D-FINE (publicado en ICLR 2025). Esta ficha concreta, publicada por el usuario `anguoyang` en Hugging Face, no contiene pesos del modelo, sino una medicion de rendimiento del modelo D-FINE exportado a ONNX y compilado para el acelerador Qualcomm QCS6490 mediante Qualcomm AI Hub.

El artefacto documenta la primera medicion publica de D-FINE sobre el kit Dragonwing RB3 Gen 2 Vision Kit (SoC QCS6490), un dispositivo de borde orientado a vision embebida. El resultado principal es un tiempo de inferencia estimado de 214,3 ms por imagen de entrada de 1x3x640x640, ejecutado con el runtime QNN en precision fp32 sin cuantizacion explicita.

La relevancia de esta publicacion es acotada pero practica: aporta un punto de referencia reproducible para quien quiera desplegar detectores DETR-like en hardware Qualcomm de gama media/baja. No es un modelo entrenado ni afinado, sino una tarjeta de medicion (benchmark card) que documenta metodologia, IDs de trabajos en AI Hub y el contexto del barrido de categorias del que forma parte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR con refinamiento iterativo (D-FINE), exportada a ONNX |
| Parametros totales | no disponible (el ONNX exportado ocupa 15.483.564 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1x3x640x640) |
| Tipos de cuantizacion | fp32 en la medicion publicada; el autor indica que no se aplico cuantizacion explicita. Otras cuantizaciones no documentadas |
| Idiomas soportados | no aplica (vision) |
| Licencia | Apache-2.0 (modelo upstream D-FINE); la tarjeta no publica pesos ni artefactos compilados |
| Formato de pesos | ONNX (exportado desde `qai-hub-models` 0.66.0); no se distribuyen pesos en este repositorio |

## Arquitectura y entrenamiento

D-FINE es un detector de objetos basado en la familia DETR que introduce un mecanismo de refinamiento iterativo de las predicciones de cajas y clases, junto con una formulacion de regresion de distribucion (Distribution Focal Loss adaptada) que mejora la localizacion frente a los DETR clasicos. El modelo se exporta a ONNX desde la definicion `dfine` del paquete `qai-hub-models` 0.66.0 y se compila con las opciones por defecto de Qualcomm AI Hub, sin cuantizacion explicita (fp32).

No se documentan en esta tarjeta los detalles de entrenamiento del modelo upstream (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas), ya que el autor solo publica la medicion de rendimiento y la metodologia de perfilado. El perfilado se realizo mediante `submit_inference_job(..., profile=True)` de la API de Qualcomm AI Hub, tomando el valor `execution_summary.estimated_inference_time` del trabajo de perfil. Se trata de una estimacion por grafo, no de una latencia end-to-end de aplicacion.

## Capacidades

- Deteccion de objetos en imagenes: produce cajas delimitadoras, puntuaciones de confianza y clases para una imagen de entrada de 640x640.
- Inferencia en dispositivo de borde Qualcomm (QCS6490) mediante el runtime QNN.
- Perfilado reproducible a traves de Qualcomm AI Hub con IDs de trabajo documentados (compilacion `j571729l5`, perfil `jpx8d9x15`).
- Integracion en el barrido de categorias del proyecto `qcs-bench` (14 categorias, tres rondas mas una ronda de reintento).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un detector de vision).
- No se documentan capacidades de segmentacion, keypoints ni vision-lenguaje.

## Casos de uso

- Despliegue de deteccion de objetos en dispositivos de borde Qualcomm: el modelo puede ejecutarse en el kit Dragonwing RB3 Gen 2 Vision Kit con una latencia estimada de ~214 ms por imagen, adecuado para aplicaciones de vision industrial o vigilancia donde el throughput no sea critico.
- Evaluacion comparativa de detectores en hardware embebido: sirve como referencia reproducible para comparar D-FINE con otros detectores (YOLO, RT-DETR) en el mismo SoC usando el mismo harness de AI Hub.
- Prototipado de pipelines de vision en robótica de bajo consumo: la ventana de 640x640 y el runtime QNN permiten integrar el detector en flujos de percepcion en robots o drones con SoC QCS6490.
- Analisis de imagenes en retail o logistica: deteccion de productos, personas o vehiculos en camaras fijas, con la latencia indicada como cota superior para disenos de frecuencia de muestreo.
- Investigacion en eficiencia de modelos DETR: el dato de 214,3 ms en fp32 sin cuantizacion sirve de linea base para estudiar el impacto de la cuantizacion int8/int16 en el mismo hardware.
- Validacion de exportacion ONNX y compilacion QNN: util para ingenieros que necesiten verificar que un detector DETR-like se compila y perfila correctamente en AI Hub antes de invertir en optimizacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 214,3 ms (214.337 µs) |
| Entrada | 1 x 3 x 640 x 640 |
| Salida | cajas de deteccion, puntuaciones y clases |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 (ONNX), opciones de compilacion por defecto de AI Hub, sin cuantizacion explicita |
| Fecha de medicion | 2026-11-27 |
| Tamano del ONNX | 15.483.564 bytes |

No se han publicado resultados de benchmarks de precision (mAP, COCO, etc.) en la informacion disponible. El unico dato de rendimiento es el tiempo de inferencia estimado por grafo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU; el modelo se ejecuta en el NPU/Hexagon del QCS6490 mediante QNN.
- GPU recomendadas: no disponible para el despliegue objetivo; el hardware de referencia es el SoC QCS6490 (Dragonwing RB3 Gen 2 Vision Kit).
- Cabe en GPU de consumo: no se documenta; el ONNX de ~15,5 MB es pequeno y probablemente quepa en cualquier GPU consumer, pero no hay mediciones publicadas.
- Opciones de despliegue: Qualcomm AI Hub (compilacion y perfilado), runtime QNN en dispositivo; exportacion desde `qai-hub-models` 0.66.0. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia y throughput estimados: 214,3 ms por imagen en fp32 sin cuantizacion; el throughput equivalente seria de aproximadamente 4,7 imagenes por segundo en el mejor caso, aunque es una estimacion por grafo y no una medida end-to-end.

## Comparativa con modelos similares

No se dispone de mediciones comparables en la informacion proporcionada para otros detectores (YOLO, RT-DETR, Faster R-CNN) en el mismo QCS6490 con el mismo harness. La comparativa cuantitativa queda como no disponible.

| Modelo | Parametros | Contexto/entrada | Rendimiento en QCS6490 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-FINE (esta ficha) | no disponible (ONNX 15,5 MB) | 640x640 | 214,3 ms (fp32, QNN) | Apache-2.0 (upstream) | Medicion publica; pesos no incluidos |
| Alternativas DETR-like | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La tarjeta no publica pesos ni artefactos compilados; solo contiene numeros medidos y metodologia. No es un modelo listo para usar.
- El dato de 214,3 ms es una estimacion por grafo de AI Hub, no una latencia end-to-end de aplicacion; el rendimiento real en produccion puede diferir.
- La medicion se hizo en fp32 sin cuantizacion explicita; el rendimiento con int8/int16 no esta documentado.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque es un detector de vision y la tarjeta no incluye evaluacion de precision.
- La licencia Apache-2.0 corresponde al modelo upstream D-FINE; la tarjeta en si no concede derechos sobre pesos (no incluidos). Verificar la licencia del repositorio upstream antes de uso comercial.
- No hay informacion sobre el dataset de entrenamiento, dominio de aplicacion ni clases soportadas; la utilidad practica depende del modelo D-FINE original, no de esta tarjeta.
- El barrido del que forma parte (`qcs-bench`) usa tres rondas mas una de reintento; la variabilidad entre ejecuciones no se reporta.

## Enlaces

- Hugging Face: https://huggingface.co/anguoyang/dfine-qcs6490
- Repositorio qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Repositorio qcs-bench: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub (documentacion de `qai-hub-models`): no disponible en la informacion proporcionada
- Paper de D-FINE (ICLR 2025): no disponible en la informacion proporcionada
