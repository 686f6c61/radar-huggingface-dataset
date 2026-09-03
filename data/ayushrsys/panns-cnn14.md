# ayushrsys/panns-cnn14

## Resumen

PANNs Cnn14 es un modelo de clasificación de audio basado en una red neuronal convolucional (CNN) de 14 capas, desarrollado por el equipo de Qiuqiang Kong y colaboradores en el marco del proyecto PANNs (Large-Scale Pretrained Audio Neural Networks for Audio Pattern Recognition). Este repositorio concreto, `ayushrsys/panns-cnn14`, es un espejo público del archivo de pesos `Cnn14_mAP=0.431.pth` originalmente alojado en Zenodo, creado para facilitar la construcción de imágenes Docker con derechos de redistribución seguros. El modelo resuelve el problema de la detección y clasificación de eventos sonoros en audio, etiquetando segmentos de audio con una de las 527 clases de AudioSet. Su relevancia actual radica en que es uno de los modelos preentrenados de audio más utilizados como extractor de características o clasificador base en tareas de análisis acústico, con un rendimiento competitivo frente a la línea base de Google (mAP 0.317).

El modelo es una CNN pura, sin mecanismos de atención ni arquitectura transformer, y su tamaño de pesos es de aproximadamente 0.3 GB. No se especifica una longitud de contexto porque no procesa texto; trabaja sobre espectrogramas log-mel generados a partir de audio. La licencia Apache-2.0 permite uso comercial y modificación, lo que lo hace atractivo para integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (ResNet-14, variante Cnn14) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio, espectrogramas) |
| Tipos de cuantizacion | no disponible (pesos originales en FP32) |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo Cnn14 pertenece a la familia PANNs, que emplea arquitecturas CNN basadas en ResNet adaptadas para el procesamiento de espectrogramas log-mel. La variante Cnn14 tiene 14 capas convolucionales residuales, diseñadas para extraer características jerárquicas de la representación tiempo-frecuencia del audio. Se entrena en el dataset AudioSet, que contiene aproximadamente 5000 horas de audio etiquetado con 527 clases de eventos sonoros. El entrenamiento se realiza mediante clasificación multi-etiqueta, optimizando la media de precisión media (mAP). Según el repositorio oficial, el sistema Wavegram-Logmel-CNN propuesto en el paper alcanza un mAP de 0.439, superando la línea base de Google (0.317). El archivo espejo de este repositorio corresponde a un checkpoint específico con mAP 0.431. No se dispone de información adicional sobre técnicas de entrenamiento como RLHF o DPO, ya que es un modelo de clasificación supervisada.

## Capacidades

- Clasificación de audio multi-etiqueta: asigna probabilidades a 527 clases de eventos sonoros (por ejemplo, habla, música, lluvia, ladridos, etc.).
- Extracción de características de audio: las activaciones de capas intermedias pueden usarse como embeddings para tareas downstream.
- Detección de eventos acústicos: adecuado para identificar la presencia de sonidos específicos en segmentos de audio.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente discriminativo.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje; el audio puede contener cualquier idioma, pero el modelo no distingue idiomas, solo clases de sonido.

## Casos de uso

- Monitorización ambiental: el modelo puede clasificar sonidos en entornos urbanos o naturales (tráfico, aves, viento) para estudios de impacto acústico o vigilancia de biodiversidad. Se alimenta con segmentos de audio de pocos segundos y se obtienen etiquetas con probabilidades.
- Asistentes de accesibilidad: detección de eventos sonoros relevantes (timbre, alarma, llanto) para personas con discapacidad auditiva, integrando el modelo en un dispositivo que procesa audio en tiempo real.
- Moderación de contenido multimedia: clasificación de audio en vídeos para detectar contenido inapropiado (violencia, lenguaje ofensivo) mediante la presencia de clases como "gritos" o "disparos".
- Análisis de audio médico: detección de sonidos respiratorios o cardíacos anómalos en grabaciones clínicas, usando el modelo como extractor de características y añadiendo una capa de clasificación específica.
- Indexación de archivos de audio: etiquetado automático de bibliotecas de sonido para búsqueda por contenido, por ejemplo, en plataformas de stock de audio.
- Investigación en acústica: uso como modelo base para fine-tuning en tareas de clasificación de sonidos específicos de un dominio (por ejemplo, especies de aves o tipos de maquinaria), gracias a su preentrenamiento en AudioSet.

## Benchmarks y rendimiento

El modelo reporta un mAP de 0.431 en AudioSet (según el nombre del archivo). El paper original de PANNs indica que el sistema Wavegram-Logmel-CNN alcanza un mAP de 0.439, superando la línea base de Google (0.317). No se dispone de resultados en otros benchmarks como MMLU o HumanEval, ya que no es un modelo de lenguaje. A continuación se muestra una comparación con la línea base de Google y el mejor sistema del paper:

| Modelo | mAP en AudioSet |
|---|---|
| Google baseline | 0.317 |
| PANNs Cnn14 (este checkpoint) | 0.431 |
| PANNs Wavegram-Logmel-CNN | 0.439 |

Estos datos provienen del repositorio oficial y del nombre del archivo. No hay información adicional sobre latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 0.3 GB, por lo que en FP32 cabría en cualquier GPU con al menos 1 GB de VRAM. En CPU también es viable para inferencia por lotes pequeños.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como RTX 3060 o superiores. Para despliegue en producción, una T4 o A10 es suficiente.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de 4 GB o más.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, o integrarse en pipelines con librosa para preprocesamiento. También es posible convertirlo a ONNX para inferencia optimizada. No se menciona soporte nativo en vLLM, llama.cpp u Ollama, que son para modelos de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño de los espectrogramas de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | mAP AudioSet | Licencia |
|---|---|---|---|---|---|
| PANNs Cnn14 (este) | CNN ResNet-14 | no disponible | no aplica | 0.431 | Apache-2.0 |
| YAMNet | CNN MobileNet | ~3.7M | no aplica | 0.306 (aprox.) | Apache-2.0 |
| VGGish | CNN VGG | ~70M | no aplica | no reportado | Apache-2.0 (no comercial) |

YAMNet es un modelo más ligero y rápido, pero con menor precisión. VGGish es más pesado y se usa principalmente como extractor de embeddings. PANNs Cnn14 ofrece un equilibrio entre precisión y tamaño, con licencia permisiva. No se dispone de datos exactos de parámetros para Cnn14 en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: AudioSet contiene principalmente audio de vídeos de YouTube, lo que puede introducir sesgos hacia sonidos comunes en contenido occidental y subrepresentar sonidos de otras culturas o entornos.
- Riesgo de alucinación: no aplica, ya que no genera contenido; solo clasifica. Sin embargo, puede producir falsos positivos en clases con sonidos similares.
- Limitaciones de contexto: el modelo procesa segmentos de audio de duración fija (típicamente 10 segundos en el preentrenamiento). No maneja audio de larga duración de forma directa; se requiere segmentación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el dataset AudioSet tiene sus propios términos (disponible para investigación, con restricciones de redistribución). El modelo en sí es redistribuible, pero los datos de entrenamiento no.
- Caveat para producción: el modelo está pensado para clasificación de etiquetas de AudioSet; si se usa en dominios muy diferentes, es necesario fine-tuning. Además, el preprocesamiento (espectrogramas log-mel) debe replicarse exactamente para obtener resultados consistentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ayushrsys/panns-cnn14
- Repositorio oficial del código: https://github.com/qiuqiangkong/audioset_tagging_cnn
- Original en Zenodo: https://zenodo.org/record/3987831
- Espejo alternativo en HuggingFace: https://huggingface.co/nicofarr/panns_Cnn14
