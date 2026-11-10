# nxp/deepface-emotion-imx

## Resumen

Deepface-emotion-imx es una versión cuantizada a int8 y compilada para los procesadores NXP i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952 de la red neuronal convolucional de reconocimiento de emociones faciales de la librería DeepFace, desarrollada originalmente por Sefik Ilkin Serengil. El modelo clasifica un recorte facial en escala de grises de 48x48 píxeles en siete categorías de emoción: angry, disgust, fear, happy, sad, surprise y neutral.

La relevancia de esta ficha no está en el modelo en sí —una CNN muy ligera de 1.485.831 parámetros y 58,5 MOPS— sino en el trabajo de despliegue en el borde que hace NXP: conversión de Keras float32 a TensorFlow Lite int8, compilación con Vela para la NPU Ethos-U65 del i.MX 93 y conversión con el SDK eIQ Neutron para las NPU de i.MX 95 e i.MX 952. El resultado son artefactos listos para ejecutar en hardware embebido con aceleración NPU, algo que no ofrece el modelo original.

No es un modelo de detección de caras: requiere que el recorte facial se haya producido previamente con un detector. Su tamaño reducido (1,44 MB en int8) y su huella computacional mínima lo sitúan en la categoría de modelos de visión para sistemas empotrados con restricciones severas de memoria y energía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) |
| Parametros totales | 1.485.831 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 48x48x1) |
| Tipos de cuantizacion | int8 (entrada uint8, salida float32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (.tflite), con variantes precompiladas para NPU |
| Entrada | Tensor (1, 48, 48, 1), dtype uint8, escala de grises |
| Salida | Tensor (1, 7), dtype float32 (probabilidades) |
| FLOPS | 58,5 MOPS |
| Tamano del fichero int8 | 1,44 MB (1.510.984 bytes) |
| Framework de origen | TensorFlow / Keras |
| Hardware objetivo | i.MX 8M Plus, i.MX 93 (Ethos-U65), i.MX 95 y i.MX 952 (eIQ Neutron) |

## Arquitectura y entrenamiento

El modelo base es una CNN simple incluida en la librería DeepFace (fichero `facial_expression_model_weights.h5`), entrenada originalmente sobre FER2013 para clasificar expresiones faciales en siete clases. La entrada es un recorte facial en escala de grises de 48x48 píxeles y la salida es un vector de siete probabilidades. Con 1.485.831 parámetros y 58,5 MOPS, está diseñada para inferencia de bajo coste en dispositivos con recursos limitados.

NXP no reentrena el modelo: parte de los pesos preentrenados y aplica un pipeline de despliegue. La cuantización a int8 se calibra con un conjunto representativo sintético de 100 imágenes de ruido gaussiano, porque el dataset FER2013 no se puede redistribuir con ese propósito. Para i.MX 93 se compila con Vela para la NPU Ethos-U65 (BSP `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`); para i.MX 95 e i.MX 952 se convierte con el SDK eIQ Neutron en versiones 3.1.3, 3.2.1 y 3.2.3. Los artefactos de i.MX 93 para ambas etiquetas BSP son idénticos byte a byte (mismo sha256), lo que indica que la compilación Vela no cambió entre esas releases. No se documenta ningún proceso de RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Clasificación de emociones faciales en siete categorías: angry, disgust, fear, happy, sad, surprise y neutral.
- Procesamiento de recortes faciales en escala de grises de 48x48 píxeles con entrada uint8.
- Salida de probabilidades por clase (vector float32 de dimensión 7), apta para umbrales y lógica de decisión posterior.
- Inferencia acelerada por NPU en i.MX 93 (Ethos-U65) y en i.MX 95 / i.MX 952 (eIQ Neutron).
- Ejecución en CPU mediante LiteRT en i.MX 8M Plus y en el resto de plataformas soportadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de lenguaje: es exclusivamente un modelo de visión.
- No realiza detección ni alineación facial; el recorte debe proporcionarlo un detector externo.

## Casos de uso

- Análisis de interacción en señalización digital: integrado en paneles o kioscos con i.MX 8M Plus, el modelo clasifica la emoción del visitante a partir de recortes capturados por la cámara y permite adaptar contenidos o medir engagement sin enviar vídeo a la nube.
- Monitorización de fatiga y estado de ánimo en automoción embebida: sobre i.MX 95 con NPU Neutron, se ejecuta en paralelo a la detección facial para estimar el estado emocional del conductor a bajo coste energético y con latencia local.
- Investigación en interacción persona-máquina: al ser MIT y de 1,44 MB, se puede incorporar en prototipos académicos de robótica social o agentes conversacionales que necesiten una señal emocional barata como entrada adicional.
- Telemetría de experiencia de usuario en dispositivos de borde: en cámaras inteligentes o wearables con i.MX 93, el modelo aporta una etiqueta emocional por fotograma que se agrega localmente, evitando transmitir imágenes crudas y reduciendo requisitos de privacidad y ancho de banda.
- Clasificación por lotes en puertas de acceso o tornos: combinado con un detector facial previo, permite registrar la reacción emocional en el punto de entrada y generar estadísticas agregadas en el propio dispositivo.
- Evaluación y benchmarking de pipelines de cuantización: los scripts `recipe.sh`, `example.py` y `evaluate.py` incluidos en el repositorio sirven como referencia reproducible para medir el impacto de la cuantización int8 y de la compilación Vela/Neutron en precisión y latencia sobre hardware NXP.
- Filtrado previo en sistemas de videovigilancia con restricciones de cómputo: al consumir 58,5 MOPS, puede ejecutarse de forma continua en un núcleo NPU dedicado mientras la CPU atiende otras tareas del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta métricas de complejidad (1.485.831 parámetros, 58,5 MOPS, 1,44 MB en int8) y la existencia de un script `evaluate.py` para medir precisión, pero no incluye cifras de exactitud ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para memoria unificada de SoC embebidos. El fichero int8 ocupa 1,44 MB, por lo que la huella de pesos es despreciable frente a cualquier otro componente del sistema.
- GPU recomendadas: no aplica. El objetivo son NPU integradas: Ethos-U65 en i.MX 93 y eIQ Neutron en i.MX 95 e i.MX 952. En i.MX 8M Plus se ejecuta en CPU mediante LiteRT.
- GPU de consumo: no procede; el modelo no está orientado a GPU de escritorio. Puede ejecutarse en CPU x86 con el runtime LiteRT para pruebas, pero no se documenta soporte específico.
- Opciones de despliegue: LiteRT (TensorFlow Lite) con los artefactos precompilados del repositorio; Vela para recompilar para Ethos-U65; eIQ Neutron SDK para las NPU de i.MX 95 e i.MX 952. El repositorio incluye `recipe.sh` para reproducir la conversión y `example.py` para inferencia.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del SoC, del reloj de la NPU y del pipeline de captura y detección facial que precede al modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Despliegue en borde |
|---|---|---|---|---|---|
| nxp/deepface-emotion-imx | 1.485.831 | 48x48x1 gris | 7 emociones | MIT | TFLite int8 precompilado para NPU NXP |
| serengil/deepface (modelo original) | 1.485.831 | 48x48x1 gris | 7 emociones | MIT | Keras float32, sin compilación NPU |
| Modelos FER basados en ResNet o ViT | no disponible | típicamente 224x224x3 | 7 emociones | variable | requieren cuantización y compilación propias |

La comparación directa más relevante es con el modelo original de DeepFace: misma arquitectura y mismos pesos, pero este repositorio añade cuantización int8, calibración documentada y artefactos compilados para NPU, a cambio de una posible pérdida de precisión por la cuantización que no se cuantifica en la model card. Frente a clasificadores FER más grandes (ResNet, ViT), este modelo sacrifica capacidad de representación por un consumo de 58,5 MOPS, adecuado solo para escenarios donde el presupuesto computacional es el factor limitante.

## Limitaciones y advertencias

- No es un detector de caras: requiere un recorte facial previo y correctamente alineado; un recorte deficiente degrada la clasificación.
- La calibración de la cuantización int8 se hizo con ruido gaussiano sintético, no con imágenes faciales reales, por restricciones de redistribución de FER2013; esto puede afectar a la fidelidad de los rangos de activación en dominios distintos del de calibración.
- No se publican métricas de precisión ni el impacto de la cuantización frente al modelo float32 original, por lo que la idoneidad en producción debe validarse con `evaluate.py` sobre datos propios.
- Sesgos conocidos: no documentados en la model card. Al derivar de FER2013, es esperable una cobertura limitada de demografías, iluminaciones y poses, pero no se aportan datos al respecto.
- Riesgo de clasificación errónea en expresiones ambiguas o neutras; la salida es una distribución de probabilidad sobre siete clases fijas, sin opción de rechazo.
- Entrada en escala de grises a 48x48: pierde información de color y detalle fino, lo que limita la discriminación entre emociones sutiles.
- Restricciones de licencia: MIT, permite uso comercial y modificaciones siempre que se conserve el aviso de copyright; el modelo base es de Sefik Ilkin Serengil y esta versión es una obra derivada de NXP.
- Los artefactos precompilados están ligados a versiones concretas de BSP y SDK (Vela `lf-6.18.20_2.0.0` / `lf-6.18.37_2.1.0`; Neutron 3.1.3, 3.2.1, 3.2.3); usar otra combinación exige recompilar.
- Consideraciones de privacidad y cumplimiento: el análisis de emociones faciales está sujeto a normativa como el RGPD y el AI Act en la UE; conviene evaluar la base legal antes de desplegarlo sobre personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxp/deepface-emotion-imx
- Repositorio original DeepFace: https://github.com/serengil/deepface
- Licencia del modelo original: https://github.com/serengil/deepface/blob/master/LICENSE
- Artefacto i.MX 8M Plus: https://huggingface.co/nxp/deepface-emotion-imx/blob/main/assets/imx8mplus/emotion_uint8_float32.tflite
- Artefacto i.MX 93 (BSP lf-6.18.20_2.0.0): https://huggingface.co/nxp/deepface-emotion-imx/blob/main/assets/imx93/lf-6.18.20_2.0.0/emotion_uint8_float32_vela.tflite
- Artefacto i.MX 93 (BSP lf-6.18.37_2.1.0): https://huggingface.co/nxp/deepface-emotion-imx/blob/main/assets/imx93/lf-6.18.37_2.1.0/emotion_uint8_float32_vela.tflite
- Artefacto i.MX 95 (Neutron SDK 3.1.3): https://huggingface.co/nxp/deepface-emotion-imx/blob/main/assets/imx95/3.1.3/emotion_uint8_float32_converted.tflite
- Artefacto i.MX 95 (Neutron SDK 3.2.1): https://huggingface.co/nxp/deepface-emotion-imx/blob/main/assets/imx95/3.2.1/emotion_uint8_float32_converted.tflite
- Artefacto i.MX 95 (Neutron SDK 3.2.3): https://huggingface.co/nxp/deepface-emotion-imx/blob/main/assets/imx95/3.2.3/emotion_uint8_float32_converted.tflite
- Artefacto i.MX 952 (Neutron SDK 3.1.3): https://huggingface.co/nxp/deepface-emotion-imx/blob/main/assets/imx952/3.1.3/emotion_uint8_float32_converted.tflite
- Artefacto i.MX 952 (Neutron SDK 3.2.1): https://huggingface.co/nxp/deepface-emotion-imx/blob/main/assets/imx952/3.2.1/emotion_uint8_float32_converted.tflite
- Artefacto i.MX 952 (Neutron SDK 3.2.3): https://huggingface.co/nxp/deepface-emotion-imx/blob/main/assets/imx952/3.2.3/emotion_uint8_float32_converted.tflite
