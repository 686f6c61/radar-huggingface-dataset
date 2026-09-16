# mickeyvanolst/blazepose-coreml

## Resumen

BlazePose Core ML es una conversion a Core ML de los modelos Pose Landmarker de MediaPipe (BlazePose GHUM) desarrollados originalmente por Google. La publica el desarrollador Mickey van Olst dentro de la familia de operadores AML para TouchDesigner, con el objetivo de ejecutar estimacion de pose en tiempo real sobre el Neural Engine de los chips Apple M-series sin depender de TensorFlow Lite ni de runtimes de Python. Se distribuyen tres variantes con la misma interfaz: lite (2,9 MB), full (6,3 MB) y heavy (27 MB).

No se trata de un modelo generativo ni de lenguaje: es un detector de landmarks corporales que recibe un recorte cuadrado de 256x256 RGB centrado en una persona y devuelve 39 landmarks (33 corporales y 6 auxiliares) en pixeles y en metros, una mascara de segmentacion de 256x256 y mapas de calor de 64x64x39. La latencia declarada en el Neural Engine de un chip de la serie M es de aproximadamente 3-4 ms por inferencia en las tres variantes, lo que lo hace apto para instalaciones interactivas y captura de movimiento en directo.

Su relevancia actual es de nicho pero clara: cubre el hueco de inferencia de pose de baja latencia en el ecosistema Apple (macOS 13 o superior) y en pipelines de TouchDesigner, donde las alternativas basadas en TFLite o PyTorch anaden sobrecarga de runtime. La verificacion de conversion reportada mantiene los landmarks mundiales dentro de 0,003 m y los 2D dentro de 1,5 px respecto al modelo TFLite original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional BlazePose GHUM (MediaPipe Pose Landmarker): detector de landmarks + heatmaps + mascara de segmentacion |
| Parametros totales | no disponible (se publican tamanos de paquete: 2,9 MB lite, 6,3 MB full, 27 MB heavy) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | FP16 (mlprogram con precision FLOAT16); origen en float16 (TFLite) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache 2.0 (Copyright Google LLC para los modelos; conversion de Mickey van Olst, 2026) |
| Formato de pesos | `.mlpackage` (Core ML mlprogram); origen `.task` / `.tflite` |
| Tarea | Estimacion de pose y landmarks corporales (single person) |
| Entrada | Imagen 256x256 RGB, recorte cuadrado alrededor de una persona, escala 1/255 |
| Salidas | `out0`=195 (39 landmarks x [x, y, z, visibilidad, presencia]), `out1`=1 (flag de pose), `out2`=256x256x1 (logits de mascara), `out3`=64x64x39 (heatmaps), `out4`=117 (39 landmarks mundiales x [x, y, z] en metros) |
| Landmarks | 0-32 corporales, 33-38 auxiliares (33 = centro de ROI, 34 = punto de escala de ROI) |
| Libreria | coreml |
| Plataforma minima | macOS 13 o superior |
| Autor | mickeyvanolst |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 (segun metadatos de HuggingFace) |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura corresponde al diseno BlazePose GHUM de MediaPipe, una red convolucional especializada en localizar 33 landmarks corporales mas 6 puntos auxiliares que definen la region de interes. El modelo no realiza deteccion de personas: espera un recorte cuadrado ya centrado en un unico sujeto (centro en las caderas, rotado para que el cuerpo quede vertical y con lado 1,25 veces la extension del cuerpo). El escalado desde la deteccion hasta el recorte y el seguimiento entre fotogramas mediante los landmarks auxiliares 33 y 34 es responsabilidad del consumidor del modelo, tal como hace MediaPipe.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens o ejemplos, ni sobre tecnicas de alineacion como RLHF o DPO (no aplicables en un modelo de vision). Lo que si documenta el autor es el pipeline de conversion: los ficheros `pose_landmarker_*.task` (float16, abril de 2023) se extraen a `pose_landmarks_detector.tflite`, se convierten a ONNX con tf2onnx 1.17 usando `--inputs-as-nchw`, se pasan a PyTorch con onnx2torch, se trazan con `torch.jit.trace` y finalmente se exportan con coremltools 9.0 como `mlprogram` en FLOAT16 con entrada de imagen escalada 1/255. La receta y las mediciones de fidelidad estan en el repositorio AML, en la ruta `labs/blazepose`.

## Capacidades

- Estimacion de pose de una sola persona a partir de un recorte de 256x256, con 39 landmarks en total (33 corporales y 6 auxiliares).
- Landmarks 2D en coordenadas de pixel del recorte, junto con logits de visibilidad y de presencia por punto.
- Landmarks 3D en metros (117 valores) con las caderas en el origen, eje y hacia abajo y eje z hacia la camara, utiles para medidas y animacion en espacio metrico.
- Mascara de segmentacion de la silueta de la persona a 256x256 (logits).
- Mapas de calor de 64x64 con una capa por landmark (39 canales), utiles para postprocesado o refinamiento.
- Flag global de presencia de pose.
- Inferencia en el Neural Engine de Apple Silicon con latencias declaradas de 3-4 ms por fotograma.
- Integracion directa como operador de la familia AML en TouchDesigner.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No incluye deteccion de personas ni seguimiento multi-persona; requiere un detector previo y, opcionalmente, seguimiento con los landmarks auxiliares.

## Casos de uso

- Instalaciones interactivas y arte digital en TouchDesigner: el modelo se carga como operador AML y devuelve landmarks con 3-4 ms de latencia, suficiente para conducir graficos generativos, particulas o sintesis de audio a 60 fps o mas sin bloqueos visibles.
- Captura de movimiento de bajo coste para animacion de personajes: los 117 valores de landmarks mundiales en metros (caderas en el origen) permiten mapear directamente a un rig 3D sin recalcular escalas, con una precision declarada dentro de 0,003 m respecto al modelo TFLite.
- Analisis biomecanico y deportivo asistido por ordenador en macOS: el uso de coordenadas metricas y de la mascara de silueta permite calcular angulos articulares, simetrias y rangos de movimiento en grabaciones de un unico atleta.
- Control gestual sin mando en aplicaciones nativas de macOS: los landmarks 2D en pixeles del recorte permiten definir zonas y gestos disparadores en tiempo real dentro de una app Core ML, sin depender de frameworks externos.
- Segmentacion de silueta para efectos de video en directo: la salida de mascara de 256x256 (logits) se puede umbralizar para incrustar a la persona sobre otro fondo en retransmisiones o instalaciones, aprovechando que el modelo ya entrega la mascara en la misma pasada que los landmarks.
- Prototipado de realidad aumentada en el ecosistema Apple: al ser un `.mlpackage` con plataforma minima macOS 13, se integra en Xcode y Core ML, lo que simplifica probar superposicion de elementos sobre el cuerpo sin reescribir el pipeline.
- Analisis offline de video por lotes en un Mac: las tres variantes permiten priorizar velocidad (full, 6,3 MB, ~3 ms) o calidad (heavy, 27 MB, ~4 ms con CPU y Neural Engine) segun el presupuesto de computo, manteniendo la misma interfaz de entrada y salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (tipo PCK, mAP o MPJPE) en la informacion disponible. El autor solo documenta una verificacion de fidelidad de la conversion frente al modelo TFLite original, evaluada sobre el mismo recorte:

| Metrica | Diferencia frente al TFLite original |
|---|---|
| Landmarks mundiales | dentro de 0,003 m |
| Landmarks 2D | dentro de 1,5 px |
| Flag de pose | dentro de 0,001 |

| Variante | Tamano | Latencia declarada (Neural Engine, serie M) |
|---|---|---|
| `PoseLandmarks_lite.mlpackage` | 2,9 MB | ~4 ms |
| `PoseLandmarks_full.mlpackage` | 6,3 MB | ~3 ms |
| `PoseLandmarks_heavy.mlpackage` | 27 MB | ~4 ms (CPU + Neural Engine) |

## Requisitos de hardware

- Acelerador recomendado: Neural Engine de Apple Silicon (serie M). Las latencias de 3-4 ms estan medidas en ese hardware.
- La variante heavy combina CPU y Neural Engine para alcanzar los ~4 ms declarados.
- Plataforma minima: macOS 13 o superior, requisito de coremltools 9.0 y del formato `mlprogram`.
- VRAM: no aplica en el sentido de GPU discreta; al ejecutarse en Core ML sobre Neural Engine y memoria unificada, los tamanos de paquete (2,9 MB, 6,3 MB y 27 MB) son irrelevantes frente a cualquier GPU de consumo.
- GPU NVIDIA (RTX 4090, A100, H100) no soportadas directamente: el artefacto distribuido es `.mlpackage`. Existirian rutas via ONNX (el pipeline intermedio usa tf2onnx), pero no estan documentadas ni validadas por el autor.
- Opciones de despliegue soportadas: Core ML (coremltools, Xcode, Vision/Core ML en macOS 13+) y la familia de operadores AML para TouchDesigner.
- vLLM, llama.cpp, Ollama y TGI no aplican: son servidores de modelos de lenguaje y este es un modelo de vision.
- Latencia: 3-4 ms por inferencia segun variante, en Neural Engine de la serie M. Throughput no publicado; como calculo derivado de la latencia declarada, el limite teorico seria del orden de 250-330 inferencias por segundo, sin contar el detector previo, el recorte de ROI ni el postprocesado.

## Comparativa con modelos similares

No se dispone de datos verificables de latencia, precision o licencia para modelos alternativos de estimacion de pose dentro de la informacion proporcionada, por lo que la comparativa externa se marca como no disponible. La comparacion interna entre las tres variantes del repositorio y su modelo de origen es la siguiente:

| Modelo / variante | Tamano | Formato | Latencia (Neural Engine, serie M) | Licencia | Notas |
|---|---|---|---|---|---|
| PoseLandmarks lite | 2,9 MB | mlpackage | ~4 ms | Apache 2.0 | Menor coste de almacenamiento |
| PoseLandmarks full | 6,3 MB | mlpackage | ~3 ms | Apache 2.0 | El mas rapido de los tres segun el autor |
| PoseLandmarks heavy | 27 MB | mlpackage | ~4 ms (CPU + Neural Engine) | Apache 2.0 | Mayor tamano, usa CPU y Neural Engine |
| `pose_landmarker_*.task` (origen MediaPipe) | no disponible | tflite float16 | no disponible | Apache 2.0 | Requiere runtime TFLite; no es Core ML |

Comparativa con modelos como MoveNet, YOLO-Pose o MMPose: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No detecta personas: espera un recorte cuadrado de 256x256 centrado en un unico sujeto. Sin un detector previo y una logica de recorte, los resultados seran incorrectos.
- Solo cubre una persona por inferencia; no hay soporte multi-persona ni identidad persistente entre fotogramas mas alla del seguimiento manual con los landmarks auxiliares 33 y 34.
- La region de interes debe construirse como en MediaPipe: centro en las caderas, rotacion para dejar el cuerpo vertical y lado 1,25 veces la extension del cuerpo. Ignorar esta construccion degrada la precision.
- Los nombres de las salidas se generan automaticamente (`out0` a `out4`); el autor recomienda emparejarlas por numero de elementos, lo que hace fragil cualquier integracion que dependa de los nombres.
- Precision limitada por FP16: la verificacion frente a TFLite admite desviaciones de hasta 1,5 px en 2D y 0,003 m en 3D, no una coincidencia exacta.
- Dependencia de plataforma: el formato `mlpackage` y el requisito de macOS 13 o superior restringen su uso al ecosistema Apple. No hay versiones para Windows, Linux, CUDA ni Android publicadas por el autor.
- No se han publicado evaluaciones de sesgo, robustez ante oclusiones, iluminacion adversa, diversidad corporal o ropa. No hay datos sobre sesgos conocidos.
- Riesgo de alucinacion en el sentido generativo: no aplica. Si aplica el riesgo de falsos positivos en el flag de pose y de landmarks poco fiables cuando la persona aparece parcialmente fuera del encuadre, dato no documentado.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion. Se mantienen los terminos de los modelos originales de MediaPipe y la titularidad de Google LLC sobre los modelos base; el autor solo reclama la conversion.
- El repositorio figura con 0 descargas y 0 likes y un tamano declarado de 0,0 GB en los metadatos, asi que conviene verificar el contenido real antes de integrarlo en produccion.
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo (se refieren a errores de descompresion de archivos, ficheros .db, iconos de Windows, tarjetas de personajes de HoneySelect2 y conectores de SQL Server), por lo que no se ha podido ampliar la informacion tecnica ni localizar benchmarks independientes.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/mickeyvanolst/blazepose-coreml
- Repositorio del autor (familia de operadores AML para TouchDesigner): https://github.com/mickeyvanolst
- Receta de conversion y mediciones: ruta `labs/blazepose` dentro del repositorio AML anterior
- Modelos originales de MediaPipe Pose Landmarker (BlazePose GHUM, Google): no disponible en la informacion proporcionada
- Paper de BlazePose: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
