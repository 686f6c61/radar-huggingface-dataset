# arnoldatse/volutora-sound-models

## Resumen

`arnoldatse/volutora-sound-models` es un repositorio de modelos ONNX de clasificación de audio (etiquetado de sonidos) publicado por el usuario arnoldatse. No contiene un modelo propio entrenado desde cero, sino la exportación a ONNX de tres etiquetadores de AudioSet ampliamente conocidos: YAMNet (Google), EfficientAT mn04_as (Florian Schmid) y PANNs CNN14 (Kong et al.). El propósito declarado es servir de motor local de detección de sonidos (disparos, risas, música, etc.) para la aplicación de escritorio Transcriptor, ejecutándose con ONNX Runtime sin enviar audio a ningún servidor.

Cada grafo ONNX incluye el front-end log-mel dentro del propio modelo: recibe una forma de onda mono en float32 con valores en [-1, 1] y devuelve probabilidades sigmoideas por clase. Esto simplifica la integración, ya que el consumidor no necesita replicar el preprocesado espectral. Los tres modelos están entrenados sobre AudioSet (clips de YouTube) y cubren 521 clases (mapa de YAMNet) o 527 clases (AudioSet en EfficientAT y PANNs).

La relevancia es práctica más que investigadora: ofrece artefactos ONNX listos para producción con verificación numérica frente a las implementaciones originales (diferencias máximas de 1,6e-5 y 2e-6 en las puntuaciones) y licencias documentadas por fichero. El tamaño del repositorio es de 0,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres redes CNN independientes exportadas a ONNX: YAMNet (MobileNet-like), EfficientAT mn04_as, PANNs CNN14 |
| Parametros totales | no disponible (no se publica el recuento por fichero) |
| Parametros activos | no aplica (no son modelos MoE) |
| Longitud de contexto | no aplica; ventana de audio de 15 600 muestras (0,975 s) en YAMNet y 96 000 muestras (3 s) en EfficientAT y PANNs |
| Tipos de cuantizacion | no disponible (los ficheros publicados son los grafos ONNX sin indicar cuantización) |
| Idiomas soportados | no disponible (clasificación de audio, no de habla; sin metadatos de idioma) |
| Licencia | per-file: Apache-2.0 (yamnet.onnx), MIT (efficientat-mn04-3s.onnx), pesos CC BY 4.0 y código MIT (panns-cnn14-3s.onnx) |
| Formato de pesos | ONNX (opset 17, batch dinámico) |

Detalle por fichero:

| Fichero | Modelo base | Frecuencia | Ventana | Clases |
|---|---|---|---|---|
| `yamnet.onnx` | YAMNet (Google) | 16 kHz | 15 600 muestras (0,975 s) | 521 (mapa YAMNet) |
| `efficientat-mn04-3s.onnx` | EfficientAT mn04_as (Florian Schmid) | 32 kHz | 96 000 muestras (3 s) | 527 (AudioSet) |
| `panns-cnn14-3s.onnx` | PANNs CNN14 (Kong et al.) | 32 kHz | 96 000 muestras (3 s) | 527 (AudioSet) |

## Arquitectura y entrenamiento

Los tres artefactos son redes neuronales convolucionales para clasificación de audio multi-etiqueta, no transformers. YAMNet es una CNN ligera de estilo MobileNet con 521 clases y entrada a 16 kHz; EfficientAT mn04_as es una variante eficiente de la familia EfficientAT con aproximadamente 4,3 de mAP en AudioSet según la nomenclatura del checkpoint original (`mn04_as_mAP_432.pt`); PANNs CNN14 es una CNN de 14 capas con mAP 0,431 en AudioSet según el nombre del peso original (`Cnn14_mAP=0.431.pth`). La exportación no modifica los pesos: en el caso de YAMNet se portaron los pesos Keras oficiales `yamnet.h5` a PyTorch y después a ONNX; en EfficientAT y PANNs se exportó directamente desde el código PyTorch original.

El entrenamiento original de los tres modelos se realizó sobre AudioSet, un conjunto de clips de YouTube etiquetados con 527 categorías de eventos sonoros. El repositorio no aporta información sobre el número de tokens, composición exacta del dataset, ni sobre etapas de ajuste fino con RLHF o DPO, que no aplican a este tipo de modelos. La innovación técnica destacable es la integración del front-end log-mel dentro del grafo ONNX, lo que elimina dependencias de preprocesado externas y facilita el despliegue. Además, el autor documenta verificaciones numéricas frente a las implementaciones de referencia: diferencia máxima de 1,6e-5 en 377 ventanas de voz y sonido de juego para YAMNet (misma clase top-1 en todas las ventanas) y de 2e-6 para EfficientAT y PANNs.

## Capacidades

- Clasificación de audio multi-etiqueta sobre 521 o 527 clases de AudioSet (sonidos ambientales, instrumentos, voces, efectos, animales, etc.).
- Detección de eventos concretos como disparos, risas o música, orientada a la búsqueda dentro de grabaciones.
- Inferencia local con ONNX Runtime, sin envío de audio a servicios externos.
- Procesamiento por lotes gracias al eje de batch dinámico del grafo.
- Entrada directa de forma de onda mono en float32; el preprocesado log-mel está embebido en el modelo.
- Salida de puntuaciones sigmoideas independientes por clase, adecuada para umbrales configurables.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Indexación y búsqueda de sonidos en archivos de audio largos: dividir la grabación en ventanas de 0,975 s (YAMNet) o 3 s (EfficientAT/PANNs) y aplicar umbrales sobre las probabilidades para localizar risas, disparos o música.
- Edición de vídeo y podcasting: marcar automáticamente segmentos con música, aplausos o ruido para su revisión o sustitución, usando la ventana de 3 s de PANNs o EfficientAT para eventos más estables.
- Moderación de contenido: detección de disparos o gritos en subidas de audio mediante un modelo que corre en local con ONNX Runtime, sin dependencia de APIs externas.
- Análisis de grabaciones de videojuegos o streams: YAMNet, con su ventana corta de 0,975 s, permite detectar efectos de sonido puntuales con baja latencia.
- Etiquetado de datasets de audio: generar etiquetas preliminares multi-etiqueta sobre AudioSet para entrenar o filtrar modelos posteriores, combinando las salidas de los tres modelos para consenso.
- Aplicaciones de escritorio con privacidad estricta: integración directa en apps tipo Transcriptor, donde el audio nunca sale del equipo y el despliegue se limita a incluir los ficheros ONNX y ONNX Runtime.
- Monitorización acústica en dispositivos: al ser grafos ONNX sin dependencias de framework, pueden ejecutarse en CPU o en aceleradores compatibles con ONNX Runtime para detección de eventos en tiempo casi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta verificaciones de equivalencia numérica frente a las implementaciones originales (diferencia máxima de 1,6e-5 para YAMNet y 2e-6 para EfficientAT y PANNs), no métricas de precisión como mAP, accuracy o AUC desglosadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,4 GB, por lo que los pesos caben holgadamente en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no disponible; al ser modelos CNN pequeños y exportados a ONNX, cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) es suficiente. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo con soporte ONNX Runtime, dado el tamaño del repositorio; no se publican cifras de VRAM exactas.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con posibilidad de ejecución en otros runtimes compatibles con ONNX (por ejemplo, TensorRT u OpenVINO) no documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Clases | Licencia | Formato |
|---|---|---|---|---|---|
| YAMNet (incluido en este repo) | no disponible | 0,975 s a 16 kHz | 521 | Apache-2.0 | ONNX |
| EfficientAT mn04_as (incluido) | no disponible | 3 s a 32 kHz | 527 | MIT | ONNX |
| PANNs CNN14 (incluido) | no disponible | 3 s a 32 kHz | 527 | CC BY 4.0 (pesos) / MIT (código) | ONNX |
| AST (Audio Spectrogram Transformer) | no disponible en la informacion | no disponible | 527 | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (mAP) entre estos modelos en la información proporcionada, más allá de los valores que aparecen en los nombres de los checkpoints originales de EfficientAT (mAP 4,32 en la nomenclatura `mn04_as_mAP_432`) y PANNs CNN14 (mAP 0,431).

## Limitaciones y advertencias

- No es un modelo único ni un modelo entrenado por el autor: son exportaciones ONNX de terceros, por lo que las limitaciones de cada modelo original se heredan.
- Sesgos conocidos: AudioSet está construido a partir de YouTube, con el sesgo de dominio, idioma y distribución de clases de esa plataforma; no se documentan análisis de sesgo específicos.
- Riesgo de falsos positivos y negativos: las salidas son sigmoideas por clase y requieren calibración de umbrales; no se publican curvas de precisión-recall.
- Limitaciones de ventana: YAMNet solo observa 0,975 s y los otros dos 3 s; eventos de mayor duración requieren agregación temporal externa.
- Sin soporte de idioma ni de habla: es clasificación de eventos sonoros, no reconocimiento de voz ni traducción.
- Restricciones de licencia: la licencia es "per-file" y no uniforme; el uso comercial exige revisar cada fichero (Apache-2.0 para YAMNet, MIT para EfficientAT, CC BY 4.0 con atribución para los pesos de PANNs).
- Atribución obligatoria para PANNs: debe citarse el artículo de Kong et al. (2020) al redistribuir o usar los pesos.
- Sin métricas de producción: no hay datos de latencia, throughput ni consumo de memoria publicados, lo que obliga a medir en el entorno objetivo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnoldatse/volutora-sound-models
- Repositorio relacionado (Transcriptor sound models): https://huggingface.co/arnoldatse/transcriptor-sound-models
- YAMNet original (TensorFlow Models): https://github.com/tensorflow/models/tree/master/research/audioset/yamnet
- EfficientAT (Florian Schmid): https://github.com/fschmid56/EfficientAT
- PANNs / AudioSet tagging CNN (Qiuqiang Kong): https://github.com/qiuqiangkong/audioset_tagging_cnn
- Pesos PANNs CNN14 (Zenodo): https://zenodo.org/records/3987831
- Artículo PANNs: Kong, Cao, Iqbal, Wang, Wang, Plumbley, "PANNs: Large-Scale Pretrained Audio Neural Networks for Audio Pattern Recognition", IEEE/ACM TASLP 28 (2020)
