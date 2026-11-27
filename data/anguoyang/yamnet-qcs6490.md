# anguoyang/yamnet-qcs6490

## Resumen

YamNet es un clasificador de eventos de audio basado en la arquitectura MobileNetV1, originalmente publicado por Google como modelo preentrenado para la tarea AudioSet (521 clases de eventos sonoros). Este repositorio concreto, `anguoyang/yamnet-qcs6490`, no contiene pesos ni artefactos compilados: es una ficha de medición independiente del rendimiento de YamNet sobre el SoC Qualcomm QCS6490, integrado en el kit Dragonwing RB3 Gen 2 Vision Kit.

El autor mide la latencia de inferencia de un grafo ONNX en fp32 (sin cuantización explícita) usando la API de Qualcomm AI Hub, con el runtime QNN, y reporta un tiempo estimado de inferencia de 2,18 ms (2.176 µs) por grafo. La entrada es un espectrograma log-mel de 1×1×96×64 y la salida son puntuaciones para 521 clases de eventos de audio.

Su relevancia es acotada pero útil para quien evalúe despliegues de audio embebido en hardware Qualcomm: ofrece un punto de referencia reproducible (con IDs de job de compilación y perfilado) y advierte explícitamente de que las cifras de `perf.yaml` de `qai-hub-models` 0.66.0 no son comparables porque usan rutas de runtime distintas (TFLite y QNN-DLC frente al perfil ONNX fp32 de esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (YamNet, clasificador de eventos de audio) |
| Parametros totales | no disponible (el ONNX exportado ocupa 14.946.832 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija: espectrograma log-mel 1×1×96×64) |
| Tipos de cuantizacion | fp32 (perfil medido sin cuantizacion explicita); el autor menciona rutas TFLite y QNN-DLC en `perf.yaml` upstream, sin detallar cuantizaciones |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | MIT (licencia del modelo upstream); esta ficha publica solo numeros y metodo |
| Formato de pesos | ONNX (exportado desde la definicion `yamnet` de `qai-hub-models` 0.66.0); no se distribuyen pesos en este repositorio |

## Arquitectura y entrenamiento

YamNet emplea una red convolucional MobileNetV1 que recibe espectrogramas log-mel y produce puntuaciones sobre 521 clases de eventos de audio (AudioSet). La ficha no aporta detalles sobre el dataset de entrenamiento, el numero de tokens o ejemplos, ni sobre procesos de ajuste fino o RLHF; esa informacion corresponderia a la publicacion original de YamNet, no incluida en la informacion disponible.

La contribucion tecnica de este repositorio es metodologica: un perfilado de grafo unico mediante `submit_inference_job(..., profile=True)` de la API de Qualcomm AI Hub, tomando `execution_summary.estimated_inference_time` como metrica. Se trata de una estimacion por grafo, no de una latencia extremo a extremo de aplicacion. El barrido se ejecuto con un arnes uniforme (tres rondas mas una ronda de reintento), sobre 14 categorias, con IDs de job de compilacion `jgkw973yg` y de perfilado `j5qxme37p`.

## Capacidades

- Clasificacion de eventos de audio en 521 clases (taxonomia AudioSet).
- Procesamiento de espectrogramas log-mel de entrada con forma fija 1×1×96×64.
- Inferencia en hardware embebido Qualcomm QCS6490 mediante runtime QNN.
- Perfilado de latencia por grafo a traves de Qualcomm AI Hub.
- No incluye generacion de texto, razonamiento, codigo, vision ni tool calling.
- No incluye soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues (no es un modelo linguistico).
- No se documentan modos especiales (thinking, vision, audio generativo).

## Casos de uso

- Deteccion de eventos sonoros en dispositivos IoT con QCS6490: el modelo clasifica audio ambiental en 521 clases con una latencia estimada de 2,18 ms por grafo, adecuada para procesamiento en tiempo real en el borde.
- Monitorizacion acustica industrial: identificacion de sonidos anomalos (golpes, alarmas, motores) en maquinaria, ejecutando el grafo ONNX sobre el NPU/CPU del SoC sin depender de la nube.
- Clasificacion de sonidos urbanos en sensores desplegados: el bajo coste computacional del perfil permite alimentar un pipeline de analitica ambiental con ventanas de audio cortas.
- Referencia de rendimiento para seleccion de hardware: util para comparar el QCS6490 frente a otras plataformas antes de comprometer un diseno embebido, usando las cifras y el metodo reproducibles de esta ficha.
- Validacion de pipelines de despliegue Qualcomm: los IDs de job y la descripcion del arnes permiten replicar el perfilado y verificar la ruta ONNX+QNN en fp32.
- Deteccion de disparadores por voz o sonido en dispositivos de consumo: activacion de funciones a partir de eventos acusticos concretos, con el modelo ejecutandose localmente.
- Investigacion en eficiencia de modelos de audio: punto de comparacion para estudiar el impacto de la cuantizacion y de distintas rutas de runtime (TFLite, QNN-DLC, ONNX) sobre el mismo modelo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 2,18 ms (2.176 µs) |
| Entrada | espectrograma log-mel 1×1×96×64 |
| Salida | 521 clases de eventos de audio |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, opciones de compilacion por defecto de AI Hub (sin cuantizacion explicita) |
| Fecha de medicion | 2026-11-27 |

El autor senala que `perf.yaml` de `qai-hub-models` 0.66.0 incluye entradas para RB3 Gen 2 con valores de 0,505–0,713 ms en rutas TFLite y QNN-DLC, pero que no son directamente comparables con el perfil ONNX fp32 de esta ficha por usar rutas de runtime distintas. No se publican resultados de benchmarks de calidad (precision, mAP, AUC) en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia: Qualcomm QCS6490 en el kit Dragonwing RB3 Gen 2 Vision Kit.
- Runtime medido: QNN (Qualcomm AI Hub), grafo ONNX en fp32.
- VRAM: no aplica; es un SoC embebido sin GPU discreta.
- GPU recomendadas: no disponible; el perfil se ejecuta sobre el hardware integrado del QCS6490.
- Compatibilidad con GPU de consumo: no disponible (el modelo esta orientado a despliegue embebido, no a escritorio).
- Opciones de despliegue: Qualcomm AI Hub (compilacion y perfilado), runtime QNN; el autor menciona ademas rutas TFLite y QNN-DLC en el `perf.yaml` upstream.
- Latencia estimada: 2,18 ms por grafo (estimacion de perfilado, no latencia extremo a extremo).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YamNet (este perfil, QCS6490) | MobileNetV1 | log-mel 1×1×96×64 | 521 | MIT (upstream) | Medicion publicada; sin pesos en este repo |
| YamNet via TFLite (RB3 Gen 2) | MobileNetV1 | no disponible | 521 | MIT | Ruta TFLite en `qai-hub-models` 0.66.0 |
| YamNet via QNN-DLC (RB3 Gen 2) | MobileNetV1 | no disponible | 521 | MIT | Ruta QNN-DLC en `qai-hub-models` 0.66.0 |

No se dispone de datos de otros clasificadores de audio comparables en la informacion proporcionada; las latencias de 0,505–0,713 ms de las rutas TFLite y QNN-DLC no son directamente comparables con los 2,18 ms del perfil ONNX fp32 por diferencias de runtime y precision.

## Limitaciones y advertencias

- La ficha no distribuye pesos ni artefactos compilados; solo publica numeros y metodo. No es un recurso listo para inferencia.
- El valor de 2,18 ms es una estimacion por grafo de Qualcomm AI Hub, no una latencia extremo a extremo de aplicacion.
- Las cifras no son comparables con las de `perf.yaml` upstream (0,505–0,713 ms) por diferencias de ruta de runtime y precision.
- No se documentan sesgos del modelo; al ser un clasificador de audio, heredaria los sesgos de la taxonomia y los datos de AudioSet, no descritos aqui.
- No se aportan metricas de calidad (precision, recall, mAP) ni evaluaciones de robustez ante ruido.
- La licencia MIT corresponde al modelo upstream; esta ficha no concede derechos sobre pesos que no incluye.
- No se especifican limitaciones de idioma ni de contexto porque no aplican a un modelo de audio, pero tampoco se detalla la cobertura de clases o dominios acusticos.
- Para produccion, conviene validar la ruta de despliegue (ONNX+QNN frente a TFLite/QNN-DLC) y la cuantizacion antes de asumir las latencias publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anguoyang/yamnet-qcs6490
- Coleccion de mediciones: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido: https://github.com/anguoyang/qcs-bench
- Modelos Qualcomm AI Hub (`qai-hub-models`, version 0.66.0 referenciada): no disponible como enlace en la informacion proporcionada
- Paper original de YamNet: no disponible en la informacion proporcionada
