# eoinedge/pose-micro

## Resumen

PoseMicro es un modelo de estimacion de pose de una sola persona disenado especificamente para microcontroladores. Desarrollado por el usuario eoinedge, el modelo toma una imagen cuadrada de 96 x 96 pixeles y devuelve los 17 keypoints del esqueleto COCO. Lo relevante es su escala extrema: 38.067 parametros y 6,97 millones de multiply-adds por imagen, un orden de magnitud por debajo de los modelos de pose convencionales, que pesan megabytes.

El modelo se distribuye como programa ExecuTorch, en dos variantes: fp32 con kernels portables y int8 con kernels CMSIS-NN para Cortex-M. La version int8 ocupa 89.932 bytes de flash y planifica 64.624 bytes de memoria de trabajo, lo que la hace apta para placas con unos pocos cientos de kilobytes de RAM que ejecutan Zephyr, como la Seeed Studio XIAO ESP32S3 Sense. Incluye el codigo de entrenamiento, el export y una aplicacion Zephyr completa con bucle de camara.

La arquitectura es una pila de convoluciones estandar y depthwise con ReLU, sin mecanismos de atencion ni componentes exoticos, lo que garantiza compatibilidad con los kernels para microcontroladores. El modelo reduce la imagen por ocho y responde sobre una rejilla de 12 x 12 celdas con 51 numeros por celda (heatmap y offsets). El entrenamiento fue deliberadamente corto: 60 minutos en 2 hilos de CPU, 25,5 pasadas sobre 111.658 recortes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con convoluciones estandar y depthwise, activacion ReLU, salida en rejilla 12 x 12 |
| Parametros totales | 38.067 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 96 x 96 pixeles) |
| Tipos de cuantizacion | fp32 (kernels portables ExecuTorch) e int8 (CMSIS-NN) |
| Idiomas soportados | en (etiquetas y documentacion; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (`pose_micro.pte` fp32, `pose_micro_cmsis_nn.pte` int8) |
| Coste computacional | 6,97 millones de multiply-adds por imagen |
| Entrada | imagen 96 x 96; fp32 normalizada 0-1 o int8 (pixel menos 128) |
| Salida | 17 keypoints COCO sobre rejilla 12 x 12, 51 valores por celda |
| Flash (fp32 / int8) | 165.708 bytes / 89.932 bytes |
| Memoria de trabajo (fp32 / int8) | 294.912 bytes / 64.624 bytes |
| Operadores | convolution, relu (fp32); quantized_conv2d, quantized_depthwise_conv2d (int8) |
| Libreria | executorch |
| Pipeline | keypoint-detection |

## Arquitectura y entrenamiento

La red es una pila de convoluciones estandar y depthwise separables con ReLU, sin residuales complejos, atencion ni normalizacion por lotes sofisticada, disenada para ejecutarse con los mismos kernels que cualquier CNN pequena. La imagen se reduce por un factor de ocho y la cabeza de salida produce una rejilla de 12 x 12 celdas; cada celda emite 51 numeros: el heatmap de cada uno de los 17 keypoints y los offsets horizontal y vertical dentro de la celda. La decodificacion se reduce a un argmax por keypoint y dos sumas, implementada tanto en Python (`decode()` en `train/pose_model.py`) como en C (`firmware/src/pose_decode.h`).

El entrenamiento se realizo sobre 111.658 recortes de una persona de COCO, durante 60 minutos en 2 hilos de CPU (25,5 epocas). No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de vision de estas dimensiones. La cuantizacion int8 se valido contra el modelo cuantizado en PyTorch: la desviacion media de salida es de 0,7 escalones de la escala int8 (maximo 10), atribuible al redondeo distinto de los kernels enteros y a la acumulacion entre capas. En PyTorch el modelo cuantizado obtiene PCK@0.1 de 62,6% y OKS de 0,468.

El pipeline de validacion del repositorio comprueba en cada push que el programa fp32 coincide con PyTorch en el runtime de Python de ExecuTorch, que el programa int8 corre sobre todos los recortes de validacion con los kernels Cortex-M sobre CMSIS-NN en C plano, que el firmware compila con Zephyr como programa nativo (`native_sim/native/64`) y supera su autotest de arranque, que el bucle de camara funciona con el generador de patrones de prueba de Zephyr y que el decodificador en C coincide con el de Python.

## Capacidades

- Estimacion de pose de una sola persona sobre imagenes de 96 x 96 pixeles, con 17 keypoints COCO.
- Deteccion de keypoints gruesa: orientacion de brazos y piernas, no posiciones de dedos o detalles finos.
- Inferencia completamente entera en la variante int8: la imagen entra como bytes de camara y solo los 51 numeros que lee el decodificador se convierten a float.
- Ejecucion en microcontroladores con Zephyr mediante ExecuTorch, con kernels CMSIS-NN para Cortex-M.
- Integracion con el API de video de Zephyr para capturar fotogramas de camara y producir una linea de pose por fotograma.
- No soporta tool calling, function calling, agentes, texto, vision general, audio ni razonamiento multi-paso: es exclusivamente un detector de keypoints.
- Capacidad multilingue: no aplica; el modelo no procesa lenguaje.

## Casos de uso

- Seguimiento de postura en dispositivos vestibles o placas de bajo coste: el modelo corre en una XIAO ESP32S3 Sense y produce keypoints por fotograma, suficiente para detectar si una persona esta sentada erguida o encorvada sin enviar imagenes a la nube.
- Interaccion persona-ordenador sin contacto: con la pose decodificada se pueden mapear gestos grosseros (brazo levantado, pierna adelantada) a comandos en instalaciones interactivas o expositores.
- Robotica educativa y prototipos TinyML: sirve como ejemplo completo de pipeline entrenamiento-export-despliegue en Zephyr, util para ensenar cuantizacion int8 y ExecuTorch en placas con recursos limitados.
- Monitorizacion de presencia y orientacion en camaras de bajo consumo: al no requerir GPU ni conectividad, puede alimentar sistemas de deteccion de personas en pie o caidas grosseras en entornos domesticos.
- Control de ejercicios fisicos basicos: contar repeticiones o verificar angulos de rodilla y cadera con los keypoints de miembros inferiores, aceptando la precision limitada en brazos y munecas.
- Señalizacion en paneles informativos o displays: combinado con el display de la placa, puede mostrar una silueta o esqueleto simplificado en tiempo real para demos de vision embebida.
- Prototipado rapido de interfaces gestuales en entornos con restricciones de privacidad: al ejecutarse localmente en el microcontrolador, los fotogramas no salen del dispositivo.

## Benchmarks y rendimiento

Evaluado sobre 4.604 recortes de una persona de COCO val2017:

| Modelo | PCK@0.1 | PCK@0.2 | OKS | Recortes con OKS >= 0.5 | Error medio (de 96 px) |
|---|---|---|---|---|---|
| Pose promedio (baseline) | 32,0% | 69,1% | 0,214 | 1,9% | 13,2 px |
| PoseMicro fp32 | 63,1% | 81,1% | 0,473 | 48,2% | 9,2 px |
| PoseMicro int8 | 62,6% | 80,9% | 0,466 | 46,6% | 9,3 px |

PCK@0.2 del modelo fp32 por parte del cuerpo: cabeza 92%, hombros 87%, codos 74%, munecas 64%, caderas 82%, rodillas 78%, tobillos 76%.

Nota del autor: la fila baseline (responder siempre la pose promedio) es la referencia a batir; PCK@0.2 es una metrica indulgente y conviene leer PCK@0.1 y OKS. Estas cifras no son el AP de keypoints de COCO, que tambien exige localizar a las personas. No se han publicado mediciones de velocidad en placa real; el autor indica explicitamente que la latencia y el throughput en el ESP32-S3 estan sin medir.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para microcontroladores sin GPU.
- Memoria en dispositivo: 89.932 bytes de flash y 64.624 bytes de memoria de trabajo planificada para la variante int8; 165.708 bytes de flash y 294.912 bytes de RAM para la fp32.
- Placas objetivo: Seeed Studio XIAO ESP32S3 Sense (camara integrada), con Zephyr como sistema operativo.
- GPU recomendadas: ninguna; el desarrollo y la validacion se hacen en CPU. El entrenamiento completo cabe en 60 minutos con 2 hilos de CPU.
- Cabe en GPU consumer: irrelevante por tamano; cualquier GPU o CPU puede ejecutar la version de referencia.
- Opciones de despliegue: ExecuTorch con backend portable (fp32) o backend Cortex-M sobre CMSIS-NN (int8), integrado en una aplicacion Zephyr; validacion en host mediante `native_sim/native/64` y `firmware/tests/host_int8`.
- Latencia y throughput: no medidos en placa; pendientes de la consola de un XIAO ESP32S3 Sense real.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PoseMicro | 38.067 | 96 x 96 | Pose 1 persona, 17 keypoints COCO | Apache 2.0 | Hugging Face, ExecuTorch |
| PoseNet / variantes TinyML clasicas | no disponible | 224 x 224 tipicamente | Pose 1 persona | variable | TensorFlow Lite / varios |
| MoveNet Lightning | no disponible | 192 x 192 | Pose 1 persona, 17 keypoints | Apache 2.0 (TensorFlow) | TensorFlow Hub / TFLite |
| MediaPipe BlazePose | no disponible | 256 x 256 | Pose 1 persona, 33 keypoints | Apache 2.0 | MediaPipe |

Los datos de parametros y precision de las alternativas no estan disponibles en la informacion proporcionada; la comparacion se limita a categoria, formato de despliegue y licencia. PoseMicro se distingue por estar empaquetado para Zephyr y microcontroladores con CMSIS-NN, un nicho que las alternativas citadas no cubren de forma nativa.

## Limitaciones y advertencias

- Solo detecta una persona; no localiza personas ni maneja multitudes. La entrada debe ser un recorte de una persona erguida que ocupe la mayor parte del encuadre cuadrado.
- Precision gruesa, especialmente debil en brazos: PCK@0.2 de munecas 64% frente a 92% en cabeza. No sirve para localizar puntas de dedos.
- El baseline de pose promedio alcanza PCK@0.2 de 69,1%, de modo que la mejora real debe medirse con PCK@0.1 y OKS, no con PCK@0.2.
- Riesgo de keypoints espurios: el autor recomienda comprobar el heatmap del keypoint y considerar valido solo a partir de 0,3 antes de usar la salida.
- Sin validacion en hardware real: el firmware compila para el XIAO ESP32S3 y supera el autotest en simulacion nativa, pero la placa, la camara, el display y la velocidad no han sido probados; la consola de un dispositivo real aun no esta en `docs/`.
- La variante int8 presenta una desviacion media de 0,7 escalones de escala (maximo 10) respecto al modelo cuantizado en PyTorch, por redondeo de kernels y acumulacion entre capas.
- Entrenamiento muy corto (60 minutos, 25,5 epocas) sobre recortes de COCO; no se documentan sesgos especificos, pero la distribucion de COCO condiciona la generalizacion a otras camaras, iluminaciones y complexiones.
- Idioma: etiquetas y documentacion en ingles; el modelo no procesa texto ni voz.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de COCO y de las dependencias (ExecuTorch, CMSIS-NN, Zephyr) en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un proyecto reciente sin adopcion publica verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eoinedge/pose-micro
- ExecuTorch: https://github.com/pytorch/executorch
- Zephyr Project: https://zephyrproject.org
- Referencia citada por el autor (BrickNet, repositorio executorch-zephyr-xiao-esp32s3): enlace truncado en la model card; no disponible completo en la informacion proporcionada.
- Creditos de las imagenes de muestra: `assets/CREDITS.md` dentro del repositorio del modelo.
- Consola del autotest en simulacion nativa: `docs/console-native-sim.txt` en el repositorio del modelo.
- Consola del bucle de camara en simulacion: `docs/console-native-sim-camera.txt` en el repositorio del modelo.
