# shkelqim2026/ResNet50_DenseNet121_InceptionV3_MobileNetV2_MobileNetV3S_MobileNetV3L

## Resumen

Este repositorio agrupa seis checkpoints de clasificación de imágenes médicas basados en backbones convolucionales preentrenados en ImageNet y adaptados mediante transfer learning a la clasificación de imágenes de tomografía de coherencia óptica de dominio espectral (SD-OCT) de retina. Los backbones incluidos son ResNet-50, DenseNet-121, InceptionV3, MobileNetV2, MobileNetV3-Small y MobileNetV3-Large, todos implementados en TensorFlow/Keras. El autor es Shkëlqim Sherifi y el trabajo se enmarca en el estudio "Benchmarking ResNet, DenseNet, MobileNet and Inception Backbones for SD-OCT Retinal Disease Classification" (2026).

El problema que aborda es la clasificación de B-scans de OCT en cuatro categorías: CNV (neovascularización coroidea), DME (edema macular diabético), Drusen y Normal. El checkpoint de ResNet-50, que da nombre al repositorio, reporta una precisión agregada del 96,22 % sobre la partición de test del dataset OCT2018, el mejor resultado entre los seis backbones comparados, si bien DenseNet-121 queda muy cerca (96,09 %) con menos parámetros.

La relevancia es fundamentalmente metodológica y de investigación: ofrece un protocolo de transfer learning reproducible y comparable entre arquitecturas sobre un mismo conjunto de datos oftalmológico, con especial atención a la separación entre clases y al análisis de errores por clase. No se trata de un modelo listo para uso clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (ResNet-50 como backbone principal; el repositorio incluye además DenseNet-121, InceptionV3, MobileNetV2, MobileNetV3-Small y MobileNetV3-Large) |
| Parámetros totales | ~24,77 M en el modelo completo (ResNet-50: ~23,59 M de backbone + cabeza de clasificación) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224 × 224) |
| Tipos de cuantización | no disponible (pesos en float32; entrenamiento con precisión mixta float16/float32) |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | TensorFlow/Keras (SavedModel o HDF5; no se especifica en la información disponible) |

## Arquitectura y entrenamiento

La arquitectura es una CNN de clasificación de imágenes. El backbone ResNet-50 se inicializa con pesos de ImageNet y se le elimina la capa de clasificación de 1.000 clases. La agregación de características se realiza con GlobalAveragePooling2D y la cabeza de clasificación consta de Dense(512, ReLU) → Batch Normalization → Dropout(0.5) → Dense(256, ReLU) → Batch Normalization → Dropout(0.3) → Dense(4, Softmax, float32). La entrada es un B-scan en escala de grises redimensionado a 224 × 224, con el canal replicado a tres canales y preprocesamiento ImageNet de ResNet (orden BGR y resta de media).

El entrenamiento sigue un protocolo común de transfer learning en dos etapas. En la primera se congela el backbone y se entrena la cabeza hasta 15 épocas con AdamW y entropía cruzada categórica ponderada por clase con label smoothing (0,1). En la segunda se restaura el mejor checkpoint de la etapa 1, se descongela el 50 % final de las capas del backbone y se afina hasta 30 épocas con la misma función de pérdida. Se usó batch size 16, semilla 42, precisión mixta float16 con salida float32, early stopping y reducción de learning rate monitorizados sobre la pérdida de validación. Los pesos de clase aproximados fueron CNV 0,73, DME 2,36, Drusen 3,08 y Normal 0,53. El entrenamiento se realizó con TensorFlow 2.20.0 sobre una NVIDIA Tesla T4 de 16 GB (entorno Google Colab). La aumentación en entrenamiento incluyó volteo horizontal, rotación ±5°, traslación ±5 %, zoom ±5 % y contraste aleatorio con factor 0,15; se excluyó el volteo vertical y la aumentación se desactivó en validación, test e inferencia.

## Capacidades

- Clasificación de imágenes de OCT de retina en cuatro clases: CNV, DME, Drusen y Normal.
- Salida de cuatro puntuaciones softmax (float32), una por clase.
- Transfer learning sobre un backbone preentrenado en ImageNet, reutilizable para otras tareas de imagen médica con ajuste fino.
- Procesamiento de imágenes en escala de grises replicadas a tres canales con preprocesamiento ImageNet de ResNet.
- Comparación entre seis backbones bajo un protocolo idéntico, lo que permite analizar el compromiso entre precisión, número de parámetros y rendimiento por clase.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un clasificador de imagen puro.
- No incluye segmentación, localización de lesiones, detección de calidad de imagen ni detección de enfermedades fuera de las cuatro etiquetas.

## Casos de uso

- Reproducción del benchmark del paper: cargar el checkpoint de ResNet-50 y evaluarlo sobre la partición de test de OCT2018 para verificar la precisión reportada del 96,22 % y comparar con los otros cinco backbones del repositorio.
- Estudio de errores por clase: analizar la matriz de confusión y las puntuaciones softmax para identificar patrones de confusión entre CNV, DME, Drusen y Normal, útil para investigación sobre sesgos y calibración.
- Comparación de arquitecturas bajo protocolo común: usar los seis checkpoints para medir el compromiso entre precisión y coste computacional, por ejemplo DenseNet-121 con precisión similar (96,09 %) y menos parámetros de backbone.
- Docencia en visión artificial médica: emplear el pipeline de dos etapas (backbone congelado y ajuste fino parcial) como ejemplo práctico de transfer learning con class weighting y label smoothing.
- Punto de partida para transfer learning a otros datasets de OCT: reutilizar el backbone afinado como inicialización para cohortes o distribuciones distintas, con validación externa obligatoria.
- Prototipado de investigación en pipelines de clasificación de imágenes médicas con TensorFlow/Keras: integrar el modelo en scripts de evaluación offline para experimentos académicos, nunca en flujos de decisión clínica.
- Evaluación de calibración de probabilidades: estudiar si las puntuaciones softmax pueden calibrarse (temperature scaling, etc.) en un contexto de investigación, dado que el autor advierte que no deben interpretarse como probabilidades calibradas de enfermedad.

## Benchmarks y rendimiento

El autor reporta precisión agregada sobre la partición de test de OCT2018 para los seis backbones. Los datos disponibles solo incluyen la cifra de ResNet-50 y la comparación cualitativa con DenseNet-121; no se dispone de la tabla completa de resultados por clase ni de métricas de otros backbones en la información proporcionada.

| Modelo | Precisión agregada en test (OCT2018) | Notas |
|---|---|---|
| ResNet-50 | 96,22 % | Mejor precisión agregada del estudio |
| DenseNet-121 | 96,09 % | Precisión muy similar, menos parámetros de backbone, mejor F1 en Drusen |
| InceptionV3 | no disponible | Incluido en el estudio, resultado no proporcionado |
| MobileNetV2 | no disponible | Incluido en el estudio, resultado no proporcionado |
| MobileNetV3-Small | no disponible | Incluido en el estudio, resultado no proporcionado |
| MobileNetV3-Large | no disponible | Incluido en el estudio, resultado no proporcionado |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo tiene ~24,77 M de parámetros; en float32 ocupa aproximadamente 100 MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y TensorFlow 2.x; el entrenamiento reportado se realizó en una Tesla T4 de 16 GB (Google Colab). Para entrenamiento con batch size 16 y resolución 224 × 224, una T4, RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU consumer: sí, en RTX 3050/3060/4060, RTX 4090, etc. También es viable en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- Opciones de despliegue: TensorFlow Serving, Keras `model.predict`, conversión a TensorFlow Lite o TensorFlow.js para despliegue ligero, y ONNX Runtime si se exporta el grafo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El repositorio ocupa 3,6 GB, lo que sugiere que incluye varios checkpoints y posiblemente artefactos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros (backbone) | Precisión en OCT2018 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|
| ResNet-50 (este repo) | ~23,59 M | 96,22 % | MIT | HuggingFace, TensorFlow/Keras |
| DenseNet-121 (este repo) | menor que ResNet-50 (no se detalla la cifra exacta) | 96,09 % | MIT | HuggingFace, TensorFlow/Keras |
| InceptionV3 (este repo) | no disponible | no disponible | MIT | HuggingFace, TensorFlow/Keras |
| MobileNetV2 / V3 (este repo) | no disponible | no disponible | MIT | HuggingFace, TensorFlow/Keras |

No se dispone de información sobre modelos comparables externos (por ejemplo, clasificadores de OCT publicados por otros autores) en la documentación proporcionada.

## Limitaciones y advertencias

- No apto para diagnóstico clínico, cribado, triaje, selección de tratamiento ni toma de decisiones médicas autónomas.
- No ha sido validado externamente en cohortes clínicas independientes ni en otros datasets de OCT distintos de OCT2018.
- Es un clasificador de cuatro clases; no detecta enfermedades fuera de CNV, DME, Drusen y Normal, no evalúa la calidad de la imagen, no segmenta anatomía retiniana ni localiza lesiones.
- Las puntuaciones softmax no deben interpretarse como probabilidades calibradas de enfermedad ni como evidencia de diagnóstico.
- El estudio reporta una única ejecución de entrenamiento por backbone, por lo que no se caracteriza la variabilidad entre ejecuciones.
- Riesgo de sobreajuste al dominio de OCT2018 y de degradación en distribuciones de imagen diferentes (otros equipos, poblaciones o protocolos de adquisición).
- El preprocesamiento debe coincidir exactamente con el de entrenamiento (redimensionado a 224 × 224, replicación de canal, orden BGR y resta de media ImageNet); aplicar una normalización adicional a [0, 1] puede alterar los resultados.
- La licencia MIT permite uso comercial del código y los pesos, pero el uso clínico requeriría validación externa, análisis de incertidumbre, evaluación prospectiva y revisión regulatoria.
- Los sesgos de los datos de origen (desequilibrio de clases, distribución demográfica no documentada) pueden propagarse al modelo; el uso de class weighting mitiga pero no elimina este problema.
- No se documentan limitaciones idiomáticas más allá de que la documentación está en inglés y las etiquetas son términos clínicos en inglés.

## Enlaces

- HuggingFace: https://huggingface.co/shkelqim2026/ResNet50_DenseNet121_InceptionV3_MobileNetV2_MobileNetV3S_MobileNetV3L
- Estudio de referencia: "Benchmarking ResNet, DenseNet, MobileNet and Inception Backbones for SD-OCT Retinal Disease Classification", Shkëlqim Sherifi (2026); no se proporciona URL en la información disponible.
- Dataset OCT2018 (LOCT/Kermany): no se proporciona URL en la información disponible.
- Repositorio de código: no disponible en la información proporcionada.
- Demo o Space: no disponible en la información proporcionada.
