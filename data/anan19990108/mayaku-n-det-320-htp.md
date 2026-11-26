# anan19990108/mayaku-n-det-320-htp

## Resumen

Mayaku Nano Detection 320 (mayaku-n-det-320-htp) es un modelo de deteccion de objetos de tipo "nano" desarrollado por el usuario anan19990108. Detecta 365 categorias del conjunto Objects365 a partir de una entrada RGB de 320 × 320 pixeles, y se distribuye empaquetado en multiples formatos orientados a despliegue en el borde: ONNX FP32, TFLite en FP16 e INT8, y un contexto QNN para aceleracion en el DSP Hexagon (HTP) de Qualcomm. El modelo deriva del checkpoint base anan19990108/mayaku-n-det-htp, del que esta ficha constituye una variante cuantizada y optimizada para inferencia en hardware.

La relevancia del modelo reside en su enfoque de despliegue: no es un modelo de lenguaje ni un transformer generativo, sino un detector convolucional compacto (21,10 MB en ONNX FP32, 5,74 MB en INT8) pensado para ejecutarse en dispositivos con recursos limitados, como plataformas Android con SoC QCS8550 y aceleracion NPU via QNN. El paquete incluye artefactos listos para produccion, scripts de inferencia y resultados de evaluacion medidos en hardware real, lo que facilita la reproducibilidad.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas, siempre que se respeten los avisos de terceros incluidos en el repositorio. El modelo no dispone de informacion declarada sobre idiomas, ya que su tarea es puramente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos convolucional (arquitectura exacta no disponible; derivado de mayaku-n-det-htp) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 320 × 320 RGB) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 (TFLite reference), W8A8 INT8 (TFLite INT8 y pool-optimized INT8), contexto QNN |
| Idiomas soportados | no disponible (tarea de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, TFLite, QNN context bin |
| Entrada | Imagen RGB 320 × 320 |
| Salida | Cajas, puntuaciones y clases (365 categorias Objects365) |
| Preprocesado y NMS | En host (no integrados en el grafico) |
| Tamano del repositorio | 0,1 GB |
| Descargas | 22 |
| Fecha de creacion | 2026-11-10 |
| Ultima actualizacion | 2026-11-26 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se trata de un detector de objetos que opera sobre una entrada fija de 320 × 320 pixeles RGB y produce detecciones para 365 categorias de Objects365. El modelo base declarado es anan19990108/mayaku-n-det-htp, y el checkpoint de origen se enlaza como un fichero `.pth` alojado en dtmfiles.com (version 2026-11-03). No se especifican el numero de tokens de entrenamiento (no aplica en vision), la composicion del dataset de entrenamiento, ni si se emplearon tecnicas de destilacion, aumento de datos o ajuste fino posteriores.

El aspecto tecnico mas destacable es el pipeline de despliegue. El paquete incluye una build TFLite W8A8 para Linux, un contexto QNN compilado para el HTP v73 del QCS8550 con QAIRT 2.47, y una variante "pool-optimized" que reordena operaciones de pooling para reducir la latencia de invocacion manteniendo salidas byte-identicas al modelo de comparacion. El preprocesado y la supresion no maxima (NMS) se ejecutan en el host, no en el grafico del modelo, lo que simplifica la portabilidad entre runtimes.

## Capacidades

- Deteccion de objetos en imagenes RGB de 320 × 320 con 365 categorias de Objects365.
- Salida de cajas delimitadoras, puntuaciones de confianza e identificadores de clase.
- Inferencia en CPU via ONNX Runtime (formato FP32).
- Inferencia en CPU via TFLite (formato FP16 con entrada/salida FP32).
- Inferencia acelerada en NPU Hexagon HTP v73 de Qualcomm QCS8550 mediante el delegado QNN de TFLite (formato INT8 W8A8).
- Variante pool-optimized con latencia reducida y salidas identicas byte a byte.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo "thinking", vision generativa, audio ni otras capacidades multimodales mas alla de la deteccion visual.

## Casos de uso

- Deteccion de objetos en tiempo real en dispositivos Android con SoC QCS8550: el modelo INT8 con delegado QNN alcanza una latencia de invocacion p50 de 0,890 ms y p95 de 0,932 ms en el HTP, lo que permite procesar flujos de video a alta frecuencia de fotogramas en el propio dispositivo sin enviar datos a la nube.
- Vision artificial industrial en Linux aarch64: la build TFLite INT8 esta pensada para placas con HTP v73 y QAIRT 2.47, adecuada para inspeccion de lineas de produccion donde se requiere baja latencia y bajo consumo.
- Aplicaciones de realidad aumentada en movil: la deteccion de 365 categorias de Objects365 permite superponer informacion contextual sobre objetos reconocidos en la escena capturada por la camara.
- Sistemas de vigilancia y analitica de video en el borde: el modelo puede ejecutarse localmente para detectar personas, vehiculos y otros objetos, reduciendo el ancho de banda y las preocupaciones de privacidad asociadas al envio de video a servidores.
- Robotica de bajo consumo: integrado en un pipeline de percepcion sobre hardware embebido, el detector proporciona cajas y clases a un coste computacional minimo (5,74 MB en INT8).
- Prototipado rapido con ONNX en CPU: el fichero ONNX FP32 (21,10 MB) permite validar el modelo en entornos de desarrollo sin hardware Qualcomm antes de pasar a la version cuantizada.
- Aplicaciones de inventario o logistica: la deteccion de categorias Objects365 puede emplearse para reconocer productos y articulos en imagenes capturadas con camaras de almacen.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un subconjunto de 100 imagenes de COCO val2017, evaluando las 69 clases compartidas con Objects365, en Linux HTP TFLite, con 10 calentamientos:

| Modelo | AP | AP50 | AP75 | Invoke p50 (ms) | Invoke p95 (ms) |
|---|---|---|---|---|---|
| Baseline en coma flotante | 0,3179 | 0,4392 | 0,3549 | 1,397 | 1,426 |
| INT8 completo | 0,3165 | 0,4299 | 0,3407 | 0,890 | 0,932 |

Resultados de la variante pool-optimized INT8 sobre 128 imagenes reservadas de COCO val2017:

| Metrica | Valor |
|---|---|
| AP | 0,2859 |
| AP75 | 0,3169 |
| Salidas identicas byte a byte | 128 de 128 |
| Invoke p95 medio (antes) | 0,907 ms |
| Invoke p95 medio (despues) | 0,868 ms |
| Reduccion de latencia p95 | 4,32 % |

No se han publicado resultados de benchmarks adicionales (por ejemplo, MMLU, HumanEval o GSM8K) en la informacion disponible, ya que no aplican a un modelo de deteccion de objetos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo ONNX FP32 ocupa 21,10 MB, el TFLite FP16 10,59 MB y el TFLite INT8 5,74 MB (5,69 MB en la variante pool-optimized). El consumo de memoria en ejecucion sera superior al tamano del fichero, pero no se especifica.
- GPU recomendadas: no se documentan GPU de escritorio; el modelo esta orientado a CPU (ONNX Runtime, TFLite) y a la NPU Hexagon HTP v73 integrada en el SoC Qualcomm QCS8550.
- Compatibilidad con GPU de consumo: no disponible; el diseno apunta a hardware embebido y movil, no a GPU discretas.
- Opciones de despliegue: ONNX Runtime (CPU), TFLite (CPU), TFLite con delegado QNN sobre HTP v73 (Linux aarch64 y Android), contexto QNN nativo con QAIRT 2.47.
- Latencia medida en HTP v73 (QCS8550): p50 de 0,890 ms y p95 de 0,932 ms para el INT8 completo; p95 de 0,868 ms para la variante pool-optimized.
- Throughput: no se publica una cifra explicita de imagenes por segundo; dado que la invocacion ronda 1 ms, el limite practico vendra del preprocesado y el NMS en host.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el modelo se posiciona en la categoria de detectores "nano" para el borde, con un tamano de 5,74 MB en INT8 y una latencia sub-milisegundo en NPU Hexagon, pero no se ofrecen resultados frente a alternativas como YOLO-nano, NanoDet o MobileNet-SSD en esta ficha.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| mayaku-n-det-320-htp | no disponible | 320 × 320 RGB | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La informacion sobre sesgos es no disponible; al entrenar sobre Objects365, el modelo puede heredar desequilibrios de clase y sesgos geograficos o culturales del dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y detecciones de baja confianza; se recomienda umbralizar las puntuaciones y aplicar NMS en el host.
- La entrada esta fija a 320 × 320 RGB, lo que limita la deteccion de objetos muy pequenos en imagenes de alta resolucion.
- La evaluacion publicada se restringe a 69 clases compartidas con Objects365 y a subconjuntos de COCO val2017 (100 y 128 imagenes), por lo que el rendimiento en las 365 clases completas y en dominios distintos no esta documentado.
- La aceleracion HTP requiere hardware especifico (QCS8550, HTP v73) y versiones concretas de QAIRT (2.47 / 2.47.0.260601) y TFLite C (2.11.1); fuera de ese entorno se degrada a CPU.
- El preprocesado y el NMS se ejecutan en host, lo que anade latencia y complejidad al pipeline de despliegue.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse los avisos de LICENSE, NOTICE y THIRD_PARTY_LICENSES.txt del repositorio.
- No se declaran idiomas soportados porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/mayaku-n-det-320-htp
- Modelo base: https://huggingface.co/anan19990108/mayaku-n-det-htp
- Checkpoint de origen: https://dtmfiles.com/mayaku/v1/models/detection/mayaku-n-det/2026-11-03/mayaku-n-det.pth
- Resultados de evaluacion completos: https://huggingface.co/anan19990108/mayaku-n-det-320-htp/blob/eafc862d4f45c9d9de9eb7a95747c3b163e0b260/evaluation/results.json
- README detallado con configuracion: https://huggingface.co/anan19990108/mayaku-n-det-320-htp/blob/eafc862d4f45c9d9de9eb7a95747c3b163e0b260/README.md
- Guia Linux INT8: https://huggingface.co/anan19990108/mayaku-n-det-320-htp/blob/main/examples/LINUX_INT8.md
- Guia Android: https://huggingface.co/anan19990108/mayaku-n-det-320-htp/blob/main/examples/ANDROID.md
