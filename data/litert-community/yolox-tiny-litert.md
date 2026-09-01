# litert-community/yolox-tiny-litert

## Resumen

YOLOX-Tiny LiteRT es una conversión del detector de objetos YOLOX-Tiny de Megvii, reescrito para ejecutarse de forma nativa en GPU mediante LiteRT (el sucesor de TensorFlow Lite). El modelo original es un CNN puro entrenado sobre COCO 2017, y esta versión adapta su grafo para eliminar operaciones que el delegado GPU rechaza (como GATHER_ND), fusionando el stem Focus con la primera convolución en una única convolución 6x6 stride-2. El resultado es un archivo `.tflite` de 10,4 MB en FP16, con entrada 416x416, que se ejecuta íntegramente en GPU sin caídas a CPU.

La relevancia de este modelo radica en que ofrece una alternativa permisiva (Apache-2.0) a la familia YOLO (AGPL), con un rendimiento en tiempo real en dispositivos móviles: 24,2 ms en GPU OpenCL de un Pixel 8a y 1,46 ms en NPU Hexagon de un Galaxy S26. Está pensado para desarrolladores que necesitan detección de objetos on-device con latencia baja y sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN anchor-free (YOLOX-Tiny) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (unico formato publicado) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT `.tflite` (safetensors no aplica) |

## Arquitectura y entrenamiento

YOLOX-Tiny es un detector de objetos de una etapa (one-stage) sin anclas, basado en una columna vertebral CNN con tres niveles de salida (strides 8, 16 y 32). La conversión a LiteRT reescribe el stem Focus original —que usa operaciones de corte espacial que bajan a `GATHER_ND`— fusionándolo con la convolución 3x3 posterior en una única convolución 6x6 stride-2 numéricamente equivalente. Esto elimina cualquier operación `GATHER`, `GATHER_ND`, `TopK` o `Cast` del grafo, y evita tensores de más de 4 dimensiones. Las activaciones SiLU se descomponen en `LOGISTIC` + `MUL`.

El modelo fue entrenado por Megvii sobre COCO 2017 (train2017), un dataset público de detección de objetos con 80 categorías. Los pesos son la versión oficial de Megvii; solo se ha modificado el grafo de operaciones, no los pesos. No se aplicaron técnicas de RLHF/DPO ni ajuste con datos adicionales. La salida del modelo son cabezas crudas de forma `[1, 3549, 85]` (3549 anclas = 52x52 + 26x26 + 13x13), donde cada fila contiene 4 coordenadas de caja (cx, cy, w, h en unidades de celda), 1 puntuación de objetividad y 80 probabilidades de clase, ya sigmoideas. La decodificación de cajas y el NMS se realizan en el host, fuera del grafo, para mantener la compatibilidad con GPU.

## Capacidades

- Deteccion de objetos en tiempo real: localiza y clasifica objetos de 80 categorias COCO (personas, vehiculos, animales, objetos cotidianos, etc.).
- Salida cruda para post-procesado flexible: entrega cabezas sin decodificar, lo que permite implementar NMS personalizado o filtrado por umbral en el lado del host.
- Compatibilidad total con GPU en dispositivos moviles: el grafo completo se ejecuta en el delegado GPU (OpenCL o Adreno) sin caidas a CPU, verificado con correlacion >= 0.999 frente a la referencia PyTorch.
- Soporte para aceleracion por NPU: en hardware Snapdragon con Hexagon, el modelo se compila via JIT y alcanza 1,46 ms de inferencia.
- Entrada flexible en formato: acepta imagenes BGR de 0-255 sin normalizacion, con letterbox (escalado uniforme y relleno gris 114).
- Integracion con el ecosistema LiteRT: compatible con la API `CompiledModel` de Android (Kotlin) y con el interprete Python `ai_edge_litert`.

## Casos de uso

- Conteo de personas en espacios publicos: un dispositivo movil fijo puede ejecutar el modelo en GPU para contar personas en tiempo real, usando la salida de cajas y la clase "person" (clase 0). Su latencia de ~24 ms permite procesar ~40 fps.
- Vigilancia perimetral con camaras IP: al desplegarse en un edge device (Raspberry Pi con acelerador o un telefono), el modelo detecta intrusiones y envia alertas solo cuando hay objetos relevantes, reduciendo el trafico de red.
- Inventario automatizado en retail: una aplicacion de movil escanea estantes y cuenta productos de categorias COCO (botellas, tazas, etc.) para actualizar stock, aprovechando la licencia Apache-2.0 para uso comercial sin restricciones.
- Asistencia a personas con discapacidad visual: una app de camara describe objetos del entorno en tiempo real, usando la deteccion de 80 clases y un modulo de texto a voz. La baja latencia GPU permite respuesta inmediata.
- Robotica domestica: un robot aspirador o de juguete integra el modelo para evitar obstaculos y reconocer objetos (mascotas, muebles) con la NPU del SoC, consumiendo menos de 2 ms por inferencia.
- Control de calidad en manufactura: en una linea de produccion, el modelo detecta piezas defectuosas o ausentes comparando las cajas detectadas con una region de interes predefinida, ejecutandose en un modulo de vision conectado por USB.

## Benchmarks y rendimiento

La model card reporta los siguientes datos medidos:

| Metrica | Valor |
|---|---|
| COCO val2017 AP (FP32 reference) | 32.8 |
| Latencia GPU OpenCL (Pixel 8a, TFLite benchmark_model) | 24.2 ms |
| Latencia CPU XNNPACK 4 threads (Pixel 8a) | 72.9 ms |
| Latencia NPU Hexagon v81 (Galaxy S26, CompiledModel) | 1.46 ms (mediana) |
| Latencia GPU Adreno (Galaxy S26, CompiledModel) | 5.04 ms (mediana) |
| Tiempo de carga NPU (Galaxy S26) | 104 ms |
| Tiempo de carga GPU (Galaxy S26) | 931 ms |

No se han publicado resultados comparativos con otros detectores en la informacion disponible. La model card advierte que las cifras de CompiledModel (NPU/GPU en Galaxy S26) no son comparables con las de TFLite benchmark_model (Pixel 8a), ya que usan runtimes distintos.

## Requisitos de hardware

- VRAM: no aplica (modelo para dispositivos moviles, no requiere VRAM dedicada; usa memoria compartida del SoC).
- GPU compatibles: cualquier GPU con soporte OpenCL o Vulkan en Android (Adreno, Mali, PowerVR). Verificado en Pixel 8a (Tensor G3) y Galaxy S26 (Snapdragon 8 Elite Gen 5).
- NPU compatibles: Hexagon v81 (Snapdragon 8 Elite Gen 5) y superiores, con compilacion JIT on-device.
- CPU: funciona con XNNPACK (4 hilos) a 72,9 ms, util como respaldo.
- Despliegue: LiteRT API (`CompiledModel` en Android, `Interpreter` en Python), TFLite `benchmark_model` para mediciones, y el repositorio de ejemplos `litert-samples` incluye una app Android de referencia.
- Throughput estimado: ~41 fps en GPU OpenCL (Pixel 8a), ~685 fps en NPU (Galaxy S26) segun las latencias reportadas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Como referencia cualitativa:

| Modelo | Licencia | Tamano | Entrada | AP COCO | Notas |
|---|---|---|---|---|---|
| YOLOX-Tiny LiteRT (este) | Apache-2.0 | 10,4 MB (FP16) | 416x416 | 32.8 | GPU-native, sin ops problematicas |
| YOLOX-Nano (LiteRT) | Apache-2.0 | no disponible | no disponible | no disponible | Variante mas ligera del mismo repo |
| YOLOv8n (Ultralytics) | AGPL-3.0 | ~6 MB (FP16) | 640x640 | ~37.3 | Requiere licencia comercial para uso propietario |

La ventaja principal de YOLOX-Tiny LiteRT frente a YOLOv8n es su licencia permisiva y su optimizacion especifica para GPU movil, aunque YOLOv8n ofrece mayor precision a costa de una entrada mas grande y una licencia mas restrictiva.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; no reconoce objetos fuera de ese conjunto.
- La entrada debe ser BGR de 0-255 sin normalizar, con letterbox de relleno gris 114. Un preprocesado incorrecto degrada la precision.
- La decodificacion de cajas y el NMS se realizan en el host; si se implementan mal, las detecciones pueden ser incorrectas aunque el modelo funcione bien.
- El modelo no incluye post-procesado en el grafo, por lo que la salida cruda requiere logica adicional en la aplicacion.
- La latencia reportada en CompiledModel (NPU/GPU) se midio en un dispositivo concreto (Galaxy S26) y puede variar en otros SoC.
- No se proporcionan pesos en otros formatos (ONNX, PyTorch) en este repositorio; solo el `.tflite` convertido.
- El modelo no distingue identidades ni atributos personales; solo emite clase y caja, pero las imagenes de COCO pueden contener personas, por lo que en aplicaciones de vigilancia debe cumplirse la normativa de proteccion de datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/yolox-tiny-litert
- Repositorio original YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Ejemplos LiteRT (app Android y script de conversion): https://github.com/google-ai-edge/litert-samples (compiled_model_api/object_detection)
- Repositorio LiteRT-Models con YOLOX-Nano: https://github.com/john-rocky/LiteRT-Models/tree/main/yolox
- Documentacion de DeepWiki sobre YOLOX: https://deepwiki.com/Megvii-BaseDetection/YOLOX
