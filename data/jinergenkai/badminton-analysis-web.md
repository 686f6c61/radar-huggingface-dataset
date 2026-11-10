# jinergenkai/badminton-analysis-web

## Resumen

`jinergenkai/badminton-analysis-web` no es un modelo de lenguaje, sino un repositorio de pesos ONNX que empaqueta tres modelos de vision por computador para una aplicacion de analisis de badminton que se ejecuta integramente en el navegador mediante `onnxruntime-web` (WebGPU / WASM). El repositorio lo publica el usuario `jinergenkai` bajo licencia MIT y ocupa 0,4 GB. Su proposito es servir los pesos que la aplicacion web descarga para procesar el video localmente, sin enviar nunca el video a un servidor.

El paquete incluye dos familias de modelos: TrackNetV3 (en variantes FP32 y FP16) para la deteccion del volante mediante mapas de calor a partir de secuencias de 8 fotogramas, y tres variantes de RTMO (S, M y L) de OpenMMLab mmpose para la estimacion de pose multijugador en una sola etapa con 17 keypoints COCO. Los pesos se exportaron con PyTorch 2.11 y opset 17.

Es relevante porque demuestra un patron de despliegue de vision deportiva en el cliente: inferencia en el dispositivo con WebGPU, sin backend de servidor ni fuga de datos, y con ajustes tecnicos muy concretos (padding de 27 a 32 canales, BatchNorm plegado en las convoluciones, conversion FP16 con E/S FP32) para sortear limitaciones reales de `onnxruntime-web` 1.30. No hay informacion sobre parametros totales, contexto ni idiomas, ya que no es un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrackNetV3 (red convolucional para mapas de calor del volante) y RTMO (estimador de pose multijugador en una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision; TrackNetV3 usa ventanas de 8 fotogramas) |
| Tipos de cuantizacion | FP32 y FP16 (FP16 con entradas/salidas FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (repositorio); TrackNetV3 MIT; RTMO Apache-2.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

TrackNetV3 es una red convolucional que estima mapas de calor del volante a partir de una secuencia temporal. La entrada es `(1, 32, H, W)`: un fondo mediano concatenado con 8 fotogramas en RGB normalizado a /255, con padding de 27 a 32 canales mediante ceros porque `onnxruntime-web` 1.30 en WebGPU calcula incorrectamente la primera convolucion de 27 canales. La salida es `(1, 8, H, W)`. Las capas BatchNorm se han plegado dentro de las convoluciones para simplificar el grafo. Procede de TrackNetV3 (Chen & Wang, ACM MMAsia 2023), publicado con codigo y pesos bajo MIT.

RTMO es un estimador de pose multijugador de una sola etapa de OpenMMLab mmpose (Apache-2.0) que detecta 17 keypoints COCO. La entrada es `(1, 3, 640, 640)` en BGR con rango 0-255 y letterbox con valor 114. Se ofrecen tres tamanos (S, M, L); las variantes M y L se distribuyen en FP16 con entradas y salidas en FP32. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre tecnicas de alineacion o refinamiento posteriores en esta ficha.

## Capacidades

- Deteccion y seguimiento del volante de badminton mediante mapas de calor sobre secuencias de 8 fotogramas (TrackNetV3).
- Estimacion de pose multijugador con 17 keypoints COCO en una sola etapa (RTMO).
- Inferencia en el navegador con `onnxruntime-web` sobre WebGPU o WASM.
- Procesamiento local del video: los fotogramas no salen del dispositivo del usuario.
- Variantes de precision FP32 y FP16 para equilibrar calidad y coste computacional.
- Tres tamanos de estimador de pose (S, M, L) para adaptarse a distintos presupuestos de computo.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Analisis de partidos en el navegador: la aplicacion carga TrackNetV3 y RTMO y procesa el video localmente, de modo que clubes o jugadores pueden revisar trayectorias del volante y posiciones corporales sin subir material sensible a la nube.
- Herramientas de entrenamiento con privacidad: al ejecutarse en WebGPU/WASM, permite desplegar un analizador de badminton en dispositivos de usuarios finales sin backend ni cumplimiento de transferencia de datos.
- Extraccion de trayectorias del volante: TrackNetV3 genera mapas de calor por fotograma que alimentan estadisticas de velocidad, altura y patrones de golpeo.
- Analisis biomecanico basico: RTMO proporciona 17 keypoints por jugador para calcular angulos de articulaciones, desplazamientos y posturas en el saque o el remate.
- Prototipado rapido en web: el paquete ONNX con variantes FP16 permite integrar vision deportiva en una aplicacion JavaScript sin pipeline de conversion propio.
- Investigacion en vision deportiva: sirve como referencia de despliegue de TrackNetV3 y RTMO en el cliente, con los ajustes de canales y precision documentados.
- Demostraciones educativas: ejemplos de inferencia en navegador con WebGPU para ensenar despliegue de modelos ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ejecutarse en navegador, el consumo depende del backend (WebGPU o WASM) y del tamano de entrada.
- GPU recomendadas: no disponible. La aplicacion esta pensada para WebGPU, por lo que se beneficia de GPU integradas o dedicadas con soporte WebGPU en el navegador.
- Compatibilidad con GPU de consumo: si, mediante WebGPU o WASM en el navegador; no se especifican modelos concretos.
- Opciones de despliegue: `onnxruntime-web` (WebGPU / WASM); los ONNX tambien pueden ejecutarse con otros runtimes ONNX fuera del navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jinergenkai/badminton-analysis-web` (TrackNetV3 + RTMO) | Deteccion de volante y pose multijugador | no disponible | no aplica (ventana de 8 fotogramas) | MIT / Apache-2.0 | ONNX en Hugging Face |
| TrackNetV3 original (`qaz812345/TrackNetV3`) | Deteccion de volante | no disponible | no aplica | MIT | GitHub |
| RTMO (OpenMMLab mmpose) | Pose multijugador | no disponible (variantes S, M, L) | no aplica | Apache-2.0 | mmpose |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- El repositorio solo aloja pesos; la funcionalidad depende de la aplicacion web que los consume.
- El padding de 27 a 32 canales es un parche especifico para un fallo de `onnxruntime-web` 1.30 en WebGPU; otras versiones pueden requerir reexportar el modelo.
- Las variantes FP16 pueden degradar ligeramente la precision frente a FP32; no se han publicado metricas comparativas.
- No hay informacion sobre sesgos, alucinacion o cobertura de idiomas, al no ser aplicables a un modelo de vision.
- La licencia MIT del repositorio no sustituye a las licencias de los modelos de origen: TrackNetV3 es MIT y RTMO es Apache-2.0, con sus propias condiciones para uso comercial.
- No se documentan limitaciones de resolucion, condiciones de iluminacion ni oclusiones del volante o de los jugadores.

## Enlaces

- Hugging Face: https://huggingface.co/jinergenkai/badminton-analysis-web
- TrackNetV3 (codigo y pesos): https://github.com/qaz812345/TrackNetV3
- Paper TrackNetV3: Chen & Wang, ACM MMAsia 2023
- RTMO (OpenMMLab mmpose): https://github.com/open-mmlab/mmpose
- onnxruntime-web: https://github.com/microsoft/onnxruntime
