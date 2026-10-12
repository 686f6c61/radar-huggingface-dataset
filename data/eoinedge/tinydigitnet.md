# eoinedge/TinyDigitNet

## Resumen

TinyDigitNet es una red neuronal convolucional (CNN) de 14.410 parametros disenada para clasificar digitos manuscritos en imagenes de 28x28 pixeles en escala de grises. Lo desarrolla el autor eoinedge y su proposito es claro: ofrecer un modelo lo bastante pequeno como para ejecutarse en microcontroladores Cortex-M y ESP32 bajo ExecuTorch, sin necesidad de delegates de aceleracion por hardware. No es un modelo de lenguaje ni un sistema multimodal; es una pieza de TinyML pura, orientada a vision embebida de bajisimo consumo.

El modelo resuelve un problema muy concreto: reconocimiento de digitos en el propio dispositivo (on-device), por ejemplo leyendo digitos desde la camara de una placa Arducam Pico4ML-BLE. Su relevancia actual radica en que demuestra un flujo de trabajo completo de ExecuTorch sobre Zephyr RTOS, con variantes fp32 portables y variantes int8 cuantizadas especificamente para distintos nucleos Cortex-M (M0+, M4, M33, M7), ademas de equivalentes en TensorFlow Lite Micro para comparar rendimiento.

El modelo se ha ejecutado sobre un RP2040 (Cortex-M0+), un ESP32-S3 (Seeed XIAO ESP32S3 Sense), un ESP32 (M5Stack ATOM) y varias piezas Cortex-M33 (Arduino UNO Q, nRF5340, MCX N947). Entrena con el dataset publico MNIST y alcanza un 97,46 % de precision top-1 en el conjunto de test (10.000 imagenes) en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial (2 capas convolucionales + 2 capas fully connected) |
| Parametros totales | 14.410 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision con entrada fija de 28x28) |
| Tipos de cuantizacion | fp32 y int8 (cuantizacion post-entrenamiento con CortexMQuantizer + prepare_pt2e/convert_pt2e) |
| Idiomas soportados | no aplica (clasificacion de imagenes, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (state dict PyTorch, fp32), `.pte` (ExecuTorch, fp32 e int8), `.tflite` (TensorFlow Lite Micro, fp32 e int8) |
| Entrada | tensor `(1, 1, 28, 28)` float, normalizado con pixel/255, media 0.1307 y desviacion tipica 0.3081 |
| Salida | 10 logits (una clase por digito 0-9) |
| Tarea | image-classification (reconocimiento de digitos manuscritos) |
| Dataset de entrenamiento | ylecun/mnist |

## Arquitectura y entrenamiento

La topologia es una CNN clasica de cuatro capas con la siguiente secuencia: `conv1` de 1 a 8 canales con kernels 3x3, activacion ReLU y maxpool de 2 (reduce 28x28 a 13x13); `conv2` de 8 a 16 canales con kernels 3x3, ReLU y maxpool de 2 (reduce 13x13 a 5x5); a continuacion una capa fully connected `fc1` de 400 a 32 con ReLU; y una capa final `fc2` de 32 a 10 que produce los logits. Todo el modelo suma 14.410 parametros, una cifra deliberadamente minima para que el binario y la memoria de trabajo quepan en microcontroladores con SRAM limitada.

El entrenamiento es deliberadamente sencillo: MNIST estandar, optimizador Adam y unas pocas epocas sobre CPU. El script de entrenamiento es `train/train_mnist.py`, disponible en el repositorio Pico4ML-BLE del autor. La exportacion se realiza con `torch.export` y despues con `to_edge_transform_and_lower(...).to_executorch()`. Las variantes int8 emplean `CortexMQuantizer` junto con `prepare_pt2e`/`convert_pt2e` y el pase de gestion de Cortex-M de ExecuTorch 1.5, generando un binario especifico por nucleo (M0+, M4, M33, M7). No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo logico en un clasificador de vision.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos (0-9) en escala de grises y 28x28 pixeles.
- Inferencia en el propio dispositivo (on-device) sobre microcontroladores Cortex-M0+, M4, M33 y M7, asi como ESP32 y ESP32-S3.
- Ejecucion sin delegates de aceleracion: los kernels portables fp32 funcionan directamente sobre la CPU del microcontrolador.
- Variante int8 optimizada por nucleo mediante el cuantizador de Cortex-M de ExecuTorch, con binarios de 25,4 KB.
- Exportacion multiplataforma: pesos en PyTorch, programas ExecuTorch (`.pte`) y modelos TensorFlow Lite Micro (`.tflite`) para comparativas.
- Autotest en dispositivo: incluye `test_vectors.h` con una imagen de prueba y los logits de referencia.
- Integracion con pipeline de camara: el firmware aplica la misma normalizacion (media 0.1307, desviacion 0.3081) a los recortes capturados por la camara.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador visual de una sola tarea.

## Casos de uso

- Lectura de digitos con camara en placas embebidas: el firmware captura una imagen, recorta y normaliza el digito y el modelo devuelve la clase predicha, tal como se demuestra en la Arducam Pico4ML-BLE y la XIAO ESP32-S3 Sense.
- Reconocimiento de matriculas o numeros en dispositivos de bajo consumo: al ser un modelo de 14 KB en int8, puede integrarse en sensores autonomos que solo necesitan cifras.
- Digitalizacion de formularios manuscritos off-line: se puede ejecutar en un microcontrolador para extraer digitos de campos segmentados previamente, evitando enviar imagenes a la nube.
- Prototipos educativos de TinyML y Zephyr RTOS: sirve como ejemplo reproducible de exportacion con ExecuTorch y cuantizacion int8 por nucleo.
- Benchmarking de runtimes embebidos: el repositorio `executorch-vs-tflm-benchmarks` lo usa para comparar ExecuTorch y TensorFlow Lite Micro en fp32 e int8 sobre distintas placas.
- Pruebas de regresion en firmware: gracias a `test_vectors.h`, el equipo puede verificar que una imagen conocida produce los logits esperados tras cada recompilacion.
- Dispositivos de entrada numerica sin teclado: por ejemplo, terminales de punto de venta o paneles industriales que interpretan cifras escritas a mano.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Precision top-1 en MNIST test (fp32, 10.000 imagenes) | 97,46 % |
| Numero de parametros | 14.410 |
| Inferencia en RP2040 a 133 MHz, kernels portables fp32 | 766 ms |

No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo, comparativas de latencia en el resto de placas o metricas int8), mas alla de los tamanos de artefacto: 62,8 KB para el programa ExecuTorch fp32 y 25,4 KB para las variantes int8.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (el modelo corre en microcontroladores, no en GPU).
- Huella de pesos: aproximadamente 56,3 KB en fp32 (14.410 parametros x 4 bytes) y aproximadamente 14,1 KB en int8. Los programas ExecuTorch ocupan 62,8 KB (fp32) y 25,4 KB (int8) incluyendo metadatos y codigo del grafo.
- Memoria de trabajo: debe caber junto con los pesos en la SRAM del microcontrolador; el RP2040 dispone de 264 KB de SRAM y el modelo esta disenado para encajar holgadamente.
- Placas y nucleos compatibles: RP2040 (Cortex-M0+), ESP32-S3, ESP32, y Cortex-M33 (Arduino UNO Q, nRF5340, MCX N947). Tambien hay binarios para Cortex-M4 y Cortex-M7.
- GPU: no requiere GPU. No esta pensado para A100, H100 ni RTX 4090.
- Opciones de despliegue: ExecuTorch (kernels portables fp32 y variantes int8 de Cortex-M) sobre Zephyr RTOS, y TensorFlow Lite Micro mediante los `.tflite` equivalentes.
- Latencia y throughput: 766 ms por inferencia en RP2040 a 133 MHz con kernels fp32 portables. No se dispone de cifras de latencia para el resto de placas ni para las variantes int8.

## Comparativa con modelos similares

La model card no incluye una comparativa con modelos alternativos, por lo que los datos de rendimiento comparado no estan disponibles. Como referencia historica de la misma familia de tareas, LeNet-5 (LeCun et al., 1998) es una CNN de aproximadamente 60.000 parametros con entrada de 32x32 para MNIST. No se dispone de cifras de precision ni de latencia de LeNet-5 en esta informacion, de modo que la comparacion cuantitativa no puede completarse.

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyDigitNet | 14.410 | 28x28 gris | Clasificacion de digitos | Apache-2.0 | HuggingFace + repos del autor |
| LeNet-5 (referencia historica) | aprox. 60.000 | 32x32 gris | Clasificacion de digitos | no disponible en esta informacion | publicacion original |
| Alternativas comparables en TinyML | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de una sola tarea: solo clasifica digitos manuscritos de MNIST; no generaliza a otras clases ni a otras tareas de vision.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea: aproximadamente un 2,54 % de fallo en el conjunto de test, que puede aumentar con imagenes fuera de la distribucion de MNIST (iluminacion, fondo, rotaciones, ruido de camara).
- Sensible al preprocesado: el modelo espera entrada normalizada con media 0.1307 y desviacion tipica 0.3081 y pixeles divididos por 255; desviarse de esta transformacion degrada la precision.
- Sesgo de dominio: entrenado exclusivamente con MNIST, cuya distribucion de escritura no representa todos los estilos, alfabetos ni sistemas de escritura.
- Limitaciones de idioma: no aplica, ya que no procesa texto.
- Licencia Apache-2.0: permite uso comercial y modificacion con las condiciones habituales de atribucion y aviso de cambios. MNIST es un dataset publico de LeCun, Cortes y Burges con sus propias condiciones.
- Caveat de produccion: la latencia de 766 ms en RP2040 limita el uso a aplicaciones no interactivas en tiempo real con ese nucleo; para capturas en vivo conviene evaluar las variantes int8 o placas mas rapidas.
- Los resultados de precision no han sido verificados de forma independiente (el campo `verified` del model-index esta a `false`).

## Enlaces

- HuggingFace: https://huggingface.co/eoinedge/TinyDigitNet
- Repositorio Pico4ML-BLE: https://github.com/eoinjordan/executorch-zephyr-arducam-pico4ML-BLE
- Repositorio XIAO ESP32-S3: https://github.com/eoinjordan/executorch-zephyr-xiao-esp32s3
- Benchmarks ExecuTorch vs TFLM: https://github.com/eoinjordan/executorch-vs-tflm-benchmarks
- ExecuTorch: https://github.com/pytorch/executorch
- Dataset MNIST: ylecun/mnist
