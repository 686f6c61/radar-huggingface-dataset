# mlboydaisuke/6DRepNet-HeadPose-ExecuTorch

## Resumen

El modelo `mlboydaisuke/6DRepNet-HeadPose-ExecuTorch` es una conversión a ExecuTorch del modelo de estimación de pose de cabeza 6DRepNet, originalmente implementado en PyTorch por thohemp y con pesos entrenados sobre los conjuntos 300W-LP y AFLW2000 (proporcionados por osanseviero). El modelo resuelve el problema de estimar la orientación tridimensional de una cabeza humana (ángulos de guiñada, cabeceo y balanceo) a partir de una imagen, utilizando una representación continua de rotación en 6D que evita las ambigüedades típicas de los ángulos de Euler.

La relevancia de esta versión radica en su formato `.pte` optimizado con el backend XNNPACK, que permite ejecutar el modelo en dispositivos con recursos limitados (móviles, Raspberry Pi, etc.) sin necesidad de GPU, manteniendo una paridad numérica prácticamente exacta con el modelo original en fp32. El archivo pesa 157,3 MB y la inferencia en un Mac arm64 tarda una mediana de 7,6 ms, frente a los 16,3 ms del eager de PyTorch. Es una opción práctica para aplicaciones de visión en tiempo real que requieran estimación de pose de cabeza on-device.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RepVGG (re-parameterized VGG) con salida de rotación 6D |
| Parametros totales | no disponible (archivo .pte de 157,3 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp32 (fp16 e int8 no incluidos por degradación) |
| Idiomas soportados | no aplica (procesa imágenes) |
| Licencia | MIT |
| Formato de pesos | ExecuTorch .pte (XNNPACK) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RepVGG, una red convolucional re-parameterizable que durante el entrenamiento usa múltiples ramas (convoluciones 1x1, 3x3 y atajos) y en inferencia se fusiona en una sola rama convolucional. Sobre esta base, 6DRepNet añade una cabeza de regresión que produce una representación de rotación en 6D, compuesta por dos vectores de 3 dimensiones que se ortonormalizan para formar una matriz de rotación. Esta representación continua evita las discontinuidades de los ángulos de Euler y mejora la precisión en la regresión directa.

El entrenamiento se realizó sobre los conjuntos 300W-LP y AFLW2000, que contienen imágenes de caras con anotaciones de pose. No se dispone de detalles adicionales sobre el número de épocas, el optimizador o el proceso de aumento de datos en la información proporcionada. La conversión a ExecuTorch se realizó mediante `torch.export` seguido de `to_edge_transform_and_lower` con el particionador XNNPACK, logrando una cobertura de delegación del 100% (59/59 operaciones). El modelo se distribuye únicamente en precisión fp32; la versión fp16 no reduce el tamaño del archivo (XNNPACK serializa los pesos de convolución en fp32) y la versión int8 presenta una degradación severa (correlación de 0,815 y error angular mediano de 46,5 grados), por lo que no se incluye.

## Capacidades

- Estimación de pose de cabeza: produce una representación de rotación 6D que se convierte en una matriz de rotación y, a partir de ella, en ángulos de guiñada, cabeceo y balanceo.
- Entrada de imagen: acepta tensores de forma `[1, 3, 224, 224]` en RGB, normalizados según ImageNet, correspondientes a un recorte de cara.
- Ejecución on-device: gracias al backend XNNPACK, el modelo se ejecuta eficientemente en CPU, sin necesidad de GPU.
- Paridad numérica: la salida fp32 tiene una correlación de 1,0 y una diferencia absoluta máxima de 8,643e-07 respecto al modelo eager original.
- No incluye detección de caras: el modelo asume que la entrada ya es un recorte de cara; la detección debe realizarse con un modelo separado.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni razonamiento multi-paso.

## Casos de uso

- Monitorización de atención del conductor: el modelo puede estimar la orientación de la cabeza del conductor en tiempo real para detectar distracciones o somnolencia. Su baja latencia (7,6 ms en Mac arm64) permite integrarlo en sistemas embebidos de automoción.
- Interacción humano-robot: en robótica asistencial o colaborativa, la pose de cabeza del usuario puede usarse para dirigir la atención del robot o ajustar su comportamiento. La ejecución on-device evita depender de la nube.
- Realidad aumentada y virtual: la orientación de la cabeza permite ajustar la perspectiva de objetos virtuales superpuestos en la escena, mejorando la sensación de inmersión en aplicaciones móviles.
- Videovigilancia y análisis de comportamiento: en entornos de seguridad, la estimación de pose de cabeza ayuda a identificar patrones de comportamiento (por ejemplo, personas mirando hacia zonas restringidas) sin enviar imágenes a servidores externos.
- Interfaces accesibles: personas con movilidad reducida pueden controlar un cursor o un menú moviendo la cabeza. El modelo proporciona los ángulos necesarios para traducir el movimiento en comandos.
- Teleconferencia y contacto visual virtual: en aplicaciones de videollamada, la pose de cabeza permite corregir la dirección de la mirada para simular contacto visual con la cámara, mejorando la calidad de la comunicación.
- Investigación en psicología y ergonomía: el análisis de la postura de la cabeza en estudios de comportamiento o evaluación de puestos de trabajo puede realizarse de forma local, preservando la privacidad de los participantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La verificación incluida en la model card se centra en la paridad numérica entre la versión ExecuTorch y el modelo eager original:

| Metrica | Valor |
|---|---|
| Diferencia absoluta maxima (fp32 vs eager) | 8,643e-07 |
| Correlacion (fp32 vs eager) | 1,000000 |
| Cobertura XNNPACK | 100% (59/59 ops) |
| Latencia mediana (Mac arm64, fp32) | 7,6 ms |
| Latencia mediana (Mac arm64, eager fp32) | 16,3 ms |

No se dispone de métricas de precisión sobre 300W-LP o AFLW2000 (por ejemplo, error medio absoluto en grados) en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo se ejecuta en CPU. El archivo `.pte` ocupa 157,3 MB en disco.
- GPU recomendadas: no requiere GPU; funciona con cualquier CPU compatible con XNNPACK (ARM, x86-64).
- Compatibilidad con hardware de consumo: sí, puede ejecutarse en móviles (Android/iOS), Raspberry Pi, ordenadores de placa única y portátiles convencionales.
- Opciones de despliegue: ExecuTorch runtime (C++ o Python) con el backend XNNPACK. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: la mediana en Mac arm64 es de 7,6 ms por inferencia (fp32), lo que permite procesar más de 100 imágenes por segundo en ese hardware. En dispositivos más limitados, la latencia será mayor pero sigue siendo adecuada para tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. A modo de referencia cualitativa, 6DRepNet se distingue de otros modelos de estimación de pose de cabeza (como HopeNet, FSA-Net o WHENet) por su representación de rotación en 6D, que evita las discontinuidades de los ángulos de Euler y suele ofrecer mejor precisión en rangos amplios de orientación. Sin embargo, no se pueden aportar cifras concretas sin fuentes verificadas. La ventaja principal de esta versión ExecuTorch es su optimización para despliegue on-device, algo que no todas las implementaciones ofrecen.

## Limitaciones y advertencias

- Solo se distribuye en fp32: la versión int8 no se incluye porque su error angular mediano es de 46,5 grados (peor caso 104 grados), lo que la hace inutilizable para aplicaciones prácticas. La versión fp16 no aporta reducción de tamaño y añade operaciones de conversión.
- Requiere un detector de caras previo: el modelo espera un recorte de cara de 224x224 píxeles; no realiza detección automática. En un pipeline completo, es necesario integrar un detector como MTCNN o RetinaFace.
- Precisión en ángulos extremos: aunque la representación 6D mejora el comportamiento frente a los ángulos de Euler, la precisión puede degradarse en orientaciones muy extremas (por ejemplo, vista trasera completa) debido a los datos de entrenamiento.
- Sesgos: no se han documentado sesgos específicos, pero los conjuntos de entrenamiento (300W-LP, AFLW2000) contienen principalmente caras de adultos con variedad limitada de etnias y edades, lo que puede afectar al rendimiento en poblaciones subrepresentadas.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías. El autor no proporciona soporte técnico.
- Dependencia de ExecuTorch: el formato `.pte` requiere la versión específica de ExecuTorch (1.4.0) y torch 2.13.0 para su ejecución; versiones posteriores pueden no ser compatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/6DRepNet-HeadPose-ExecuTorch
- Repositorio original de 6DRepNet (thohemp): https://github.com/thohemp/6DRepNet
- Implementación alternativa en PyPI (sixdrepnet): https://pypi.org/project/sixdrepnet/
- Scripts de conversión a ExecuTorch: https://github.com/john-rocky/executorch-models
- Variante LiteRT (TFLite) del mismo modelo: https://huggingface.co/litert-community/6DRepNet-HeadPose-LiteRT
