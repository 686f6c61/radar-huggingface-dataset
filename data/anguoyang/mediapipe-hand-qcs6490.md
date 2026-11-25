# anguoyang/mediapipe-hand-qcs6490

## Resumen

`anguoyang/mediapipe-hand-qcs6490` no es un modelo de lenguaje, sino una ficha de medicion reproducida sobre el detector de palma de MediaPipe Hand, compilado y perfilado para el SoC Qualcomm QCS6490. El repositorio publica un unico dato de rendimiento: un tiempo de inferencia estimado de 26,9 ms (26.891 µs) para una entrada de imagen de 1 × 3 × 256 × 256, ejecutado con el runtime QNN sobre el kit Dragonwing RB3 Gen 2 Vision Kit. No contiene pesos ni artefactos compilados.

El interes tecnico reside en que, segun el autor, no existia entrada previa para este dispositivo en el `perf.yaml` de `qai-hub-models` 0.66.0, por lo que la medicion cubre un hueco de referencia en el ecosistema de despliegue edge de Qualcomm. La medicion se obtuvo mediante una unica llamada a `submit_inference_job(..., profile=True)` de la API de Qualcomm AI Hub, tomando el campo `execution_summary.estimated_inference_time`.

Conviene subrayar que se trata de una estimacion de perfilado por grafo, no de la latencia extremo a extremo de una aplicacion real. El modelo subyacente es el export ONNX de la definicion `mediapipe_hand` de `qai-hub-models` 0.66.0, con un tamano de fichero de 7.115.600 bytes y precision fp32 sin cuantizacion explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de palma de MediaPipe Hand, exportado a ONNX) |
| Parametros totales | no disponible como recuento; tamano del ONNX: 7.115.600 bytes |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | fp32 (ONNX de origen), opciones de compilacion por defecto de AI Hub sin cuantizacion explicita |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 (modelo upstream); la ficha no publica pesos ni artefactos |
| Formato de pesos | ONNX (exportado desde `qai-hub-models` 0.66.0); el repositorio no incluye pesos |

Otros datos tecnicos:

| Parametro | Valor |
|---|---|
| Entrada | 1 × 3 × 256 × 256 imagen |
| Salida | cajas de deteccion de palma (coordenadas y puntuaciones) |
| Dispositivo de medida | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Tiempo de inferencia estimado | 26,9 ms (26.891 µs) |
| Fecha de medida | 2026-11-25 |
| Job de compilacion | `jp08ek095` |
| Job de perfilado | `jp8dw8yk5` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del detector de palma mas alla de su naturaleza como modelo de vision para deteccion de manos: recibe un tensor de imagen 1 × 3 × 256 × 256 y devuelve cajas delimitadoras de palma con sus puntuaciones. El autor no documenta capas, backbone, numero de tokens de entrenamiento ni composicion del dataset, por lo que estos datos deben considerarse no disponibles en esta ficha.

Tampoco se detalla el proceso de entrenamiento (datos, aumentos, funcion de perdida, ajuste fino) ni si hubo etapas de destilacion o cuantizacion consciente del entrenamiento. Lo unico verificable es el pipeline de despliegue: exportacion a ONNX desde la definicion `mediapipe_hand` de `qai-hub-models` 0.66.0, compilacion con opciones por defecto de Qualcomm AI Hub y perfilado con QNN sobre el QCS6490. La unica innovacion metodologica destacable es la publicacion del procedimiento y los identificadores de job, lo que permite reproducir la medicion.

## Capacidades

- Deteccion de palma de la mano en imagenes RGB de 256 × 256 píxeles.
- Salida de cajas delimitadoras con coordenadas y puntuaciones de confianza.
- Ejecucion en hardware edge Qualcomm mediante el runtime QNN.
- Perfilado por grafo a traves de la API de Qualcomm AI Hub (`submit_inference_job` con `profile=True`).
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision general, audio ni otras modalidades.

## Casos de uso

- Deteccion de manos en aplicaciones de realidad aumentada en dispositivos edge: el modelo localiza la palma como paso previo al seguimiento de landmarks, con un coste de 26,9 ms por fotograma en el QCS6490, adecuado para experiencias interactivas en gafas o moviles con ese SoC.
- Control por gestos en paneles industriales o de automocion: al ejecutarse con QNN sobre un SoC de bajo consumo, permite integrar deteccion de palma en interfaces sin conexion a la nube.
- Preprocesado en pipelines de vision por computador: la salida de cajas de palma sirve como region de interes para etapas posteriores (seguimiento, reconocimiento de gestos) en sistemas embebidos.
- Benchmarking y seleccion de hardware: el dato de 26,9 ms permite comparar el QCS6490 con otros SoC Qualcomm a la hora de dimensionar un producto que requiera deteccion de manos en tiempo real.
- Validacion de despliegues con Qualcomm AI Hub: los identificadores de job (`jp08ek095`, `jp8dw8yk5`) y el procedimiento documentado sirven como referencia reproducible para equipos que compilen modelos de MediaPipe con QNN.
- Docencia e investigacion en edge AI: la ficha ejemplifica como medir y publicar latencias de inferencia por grafo con un harness uniforme, util para cursos o articulos sobre despliegue en dispositivos.
- Prototipado de interfaces sin raton: en quioscos o terminales con QCS6490, la deteccion de palma puede alimentar un cursor gestual con latencia inferior a 30 ms por inferencia.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Tiempo de inferencia estimado | 26,9 ms (26.891 µs) | Perfilado por grafo con QNN sobre QCS6490, entrada 1 × 3 × 256 × 256, fp32 |
| Precision | fp32 | ONNX de origen, opciones por defecto de AI Hub sin cuantizacion explicita |

No se han publicado resultados de benchmarks en la informacion disponible mas alla del tiempo de inferencia anterior. No hay datos de precision (mAP, recall) ni comparaciones con otros modelos en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecucion en el NPU/SoC QCS6490, no en GPU de escritorio.
- GPU recomendadas: no aplica para el despliegue medido; el runtime es QNN sobre el SoC Qualcomm QCS6490 del Dragonwing RB3 Gen 2 Vision Kit.
- Compatibilidad con GPU de consumo: no documentada; no se han publicado medidas en RTX 4090, A100 ni H100.
- Opciones de despliegue: Qualcomm AI Hub (compilacion y perfilado), runtime QNN; el ONNX de origen podria ejecutarse con otros runtimes, pero no se documenta.
- Latencia y throughput estimados: 26,9 ms por inferencia de una imagen 256 × 256 en el QCS6490; el throughput equivalente seria de aproximadamente 37 inferencias por segundo en regimen ideal, aunque el autor no lo indica y se trata de una estimacion por grafo, no de una aplicacion extremo a extremo.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mediapipe-hand-qcs6490 (esta ficha) | Detector de palma MediaPipe | 1 × 3 × 256 × 256 | no aplica | 26,9 ms en QCS6490 (QNN, fp32) | Apache-2.0 (upstream); sin pesos en el repo | Solo medicion y metodo |
| MediaPipe Hand (upstream, Google) | Detector de palma + landmarks | Imagen RGB | no aplica | No disponible en esta informacion | Apache-2.0 | Disponible en MediaPipe |
| `qai-hub-models` mediapipe_hand | Definicion para AI Hub | 1 × 3 × 256 × 256 | no aplica | Sin entrada para RB3 Gen 2 en `perf.yaml` 0.66.0 | No disponible | Disponible en el paquete |

No se dispone de datos de benchmarks comparativos con otros detectores de mano (por ejemplo, variantes de BlazePalm o detectores genericos) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos compilados; solo publica numeros y metodo, por lo que no es directamente desplegable.
- El dato de 26,9 ms es una estimacion de perfilado por grafo (`execution_summary.estimated_inference_time`), no una latencia extremo a extremo de aplicacion; la latencia real en produccion sera mayor.
- La medicion se realizo con opciones de compilacion por defecto de AI Hub y precision fp32, sin cuantizacion explicita; resultados con cuantizacion int8 no estan documentados.
- No hay informacion sobre sesgos, tasa de falsos positivos o robustez ante oclusiones, iluminacion adversa o diversidad de tonos de piel.
- No se documentan limitaciones de idioma ni de contexto porque el modelo no procesa lenguaje.
- La licencia del modelo upstream es Apache-2.0, pero la ficha no aclara condiciones adicionales para uso comercial de los artefactos derivados; conviene verificar la licencia de `qai-hub-models` y de MediaPipe antes de produccion.
- Los datos de fecha de creacion y actualizacion (2026-11-25) y los identificadores de job no han podido verificarse de forma independiente en esta ficha.
- El modelo solo detecta la palma; no realiza seguimiento de landmarks ni reconocimiento de gestos, que requeririan etapas adicionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/mediapipe-hand-qcs6490
- Coleccion de mediciones qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido qcs-bench: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub: https://aihub.qualcomm.com/
- Paquete `qai-hub-models`: https://github.com/quic/ai-hub-models
- MediaPipe Hand (Google): https://github.com/google-ai-edge/mediapipe
