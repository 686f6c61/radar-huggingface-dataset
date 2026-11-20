# Chipita/emnist-52class-alphabet-cnn

## Resumen

El modelo `Chipita/emnist-52class-alphabet-cnn` es una red neuronal convolucional (CNN) entrenada para clasificación de caracteres manuscritos del alfabeto inglés en 52 clases sensibles a mayúsculas y minúsculas (`A–Z` mapeadas a las clases `0–25` y `a–z` a las clases `26–51`). Lo desarrolla el usuario Chipita en el marco de un proyecto de máster en Ciencias de la Computación en la Universidad de Addis Abeba, y se publica en Hugging Face bajo la librería Keras con backend TensorFlow.

El modelo resuelve el problema clásico de reconocimiento óptico de caracteres manuscritos (OCR/HCR) sobre el conjunto de datos EMNIST ByClass, del que se han excluido los dígitos `0–9` para retener únicamente las 411.302 muestras alfabéticas. Se trata de un modelo pequeño, orientado a inferencia ligera sobre imágenes de 28×28 píxeles en escala de grises, y su relevancia es principalmente educativa y de referencia para pipelines de reconocimiento de caracteres, no como modelo de propósito general.

La información pública disponible es muy limitada: el repositorio tiene un tamaño de 0,0 GB, no registra descargas ni likes, no declara licencia y la model card solo documenta el dataset, el preprocesado y las métricas de test. No se detalla la arquitectura interna de la CNN ni el número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) sobre Keras/TensorFlow; detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 28×28×1) |
| Tipos de cuantizacion | no disponible (pesos en formato Keras nativo) |
| Idiomas soportados | en (etiquetas del alfabeto inglés) |
| Licencia | no disponible |
| Formato de pesos | Keras (SavedModel/H5 según artefacto del repo); tamano del repo 0,0 GB |
| Entrada | tensor `(batch_size, 28, 28, 1)` en `float32`, valores en `[0, 255]` |
| Salida | 52 clases (0–51) mapeadas a `A–Z`, `a–z` vía `class_mapping.json` |
| Tarea (pipeline) | `image-classification` |

## Arquitectura y entrenamiento

La arquitectura es una CNN implementada en Keras con backend TensorFlow. La model card no especifica el número de capas convolucionales, filtros, capas densas ni el total de parámetros. El modelo incorpora internamente una capa `Rescaling(1/255)`, de modo que la entrada debe proporcionarse con valores de píxel en `[0, 255]` y la normalización se aplica dentro del grafo.

El entrenamiento se realizó sobre EMNIST ByClass (`emnist/byclass` vía `tensorflow_datasets`), excluyendo los dígitos `0–9` y reteniendo 411.302 muestras alfabéticas. Las imágenes se reorientaron con `tf.transpose(image, perm=[1, 0, 2])` para corregir la orientación característica de EMNIST. Los splits empleados fueron 317.607 muestras de entrenamiento, 35.290 de validación (partición estratificada 90/10 con semilla 42) y 58.405 de test oficial. No se documenta el uso de RLHF, DPO ni técnicas de aumentación de datos, ni el número de épocas, optimizador o función de pérdida.

## Capacidades

- Clasificación de imágenes de caracteres manuscritos en 52 clases sensibles a mayúsculas y minúsculas (`A–Z`, `a–z`).
- Reconocimiento de caracteres individuales sobre recortes de 28×28 píxeles en escala de grises.
- Discriminación entre mayúscula y minúscula de la misma letra (por ejemplo, `A` frente a `a`), algo que los modelos de 26 clases no resuelven.
- Normalización interna de píxeles mediante capa `Rescaling(1/255)`, lo que simplifica el preprocesado en inferencia.
- Mapeo de índices de clase a letras mediante el fichero auxiliar `class_mapping.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento. Es un clasificador de imagen puro.
- Capacidad multilingüe limitada al alfabeto latino inglés; no cubre dígitos ni otros alfabetos en esta versión.

## Casos de uso

- Digitalización de formularios manuscritos: el modelo puede clasificar recortes de letras individuales extraídos de formularios escaneados, siempre que se segmenten previamente los caracteres y se ajusten a 28×28 en escala de grises con trazo blanco sobre fondo negro.
- Reconocimiento de matrículas o códigos alfabéticos: útil en pipelines donde se aíslen caracteres y se requiera distinguir mayúsculas de minúsculas, como códigos alfanuméricos parcialmente alfabéticos.
- Preprocesado para sistemas OCR más amplios: puede actuar como clasificador de segunda etapa para desambiguar caracteres dudosos en un OCR comercial, aprovechando su especialización en 52 clases.
- Proyectos educativos y de investigación en visión por computador: sirve como baseline reproducible sobre EMNIST ByClass con métricas de test documentadas (86,07 % de accuracy), útil para comparar arquitecturas CNN en docencia.
- Clasificación embebida o de bajo coste: al tratarse de una CNN pequeña con entrada de 28×28, es viable en dispositivos con recursos limitados (Raspberry Pi, microcontroladores con TensorFlow Lite) tras la conversión correspondiente.
- Etiquetado asistido de datasets de caracteres manuscritos: puede preetiquetar muestras de 52 clases para revisión humana, reduciendo el coste de anotación en corpus de escritura manual.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test oficial de 58.405 muestras (según la model card del autor):

| Metrica | Valor |
|---|---|
| Accuracy (test) | 86,07 % |
| Precision macro | 0,7966 |
| Recall macro | 0,7450 |
| F1 macro | 0,7432 |
| F1 weighted | 0,8418 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio ocupa 0,0 GB y la entrada es de 28×28×1, por lo que cabe holgadamente en cualquier GPU consumer (incluso < 1 GB de VRAM en la mayoría de configuraciones).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problemas para lotes pequeños. Cualquier GPU (RTX 3060, RTX 4090, T4, A100, H100) acelera el throughput, pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en GPUs integradas.
- Opciones de despliegue: Keras/TensorFlow nativo, TensorFlow Serving, TensorFlow Lite (para edge), ONNX Runtime tras conversión. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño de entrada y la naturaleza CNN, se espera latencia de milisegundos en CPU y sub-milisegundo en GPU para lotes pequeños, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Accuracy test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Chipita/emnist-52class-alphabet-cnn | no disponible | 28×28×1 | 52 (A–Z, a–z) | 86,07 % | no disponible | Hugging Face |
| CNN EMNIST ByClass (referencias academicas) | no disponible | 28×28×1 | 62 (0–9, A–Z, a–z) | variable según implementación | variable | múltiples repositorios |
| Modelos OCR comerciales (p. ej. Tesseract, Cloud Vision) | no disponible | imagen completa | variable | no comparable directamente | propietaria o Apache-2.0 | múltiples |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa rigurosa con alternativas concretas del mismo tamaño o tarea.

## Limitaciones y advertencias

- Solo clasifica caracteres individuales ya segmentados; no realiza detección ni segmentación de texto en imágenes completas.
- No reconoce dígitos (`0–9`) porque fueron excluidos del entrenamiento; para texto alfanumérico se necesita un modelo complementario.
- Requiere la polaridad correcta (trazo blanco sobre fondo negro) y la orientación corregida; imágenes con fondo blanco o rotadas degradarán el rendimiento.
- Accuracy global del 86,07 %, pero F1 macro de 0,7432 y recall macro de 0,7450, lo que indica un rendimiento desigual entre clases: algunas letras (probablemente minúsculas o pares visualmente similares como `O`/`o`, `C`/`c`) se confunden con frecuencia.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal; debe contactarse con el autor antes de cualquier despliegue en producción.
- Modelo desarrollado en contexto académico (proyecto de máster); no hay evidencia de validación en dominios distintos de EMNIST ni de robustez frente a ruido, rotaciones o variaciones de escritura fuera de la distribución del dataset.
- Riesgo de sesgo hacia el estilo de escritura presente en EMNIST, que no representa necesariamente la diversidad caligráfica global.
- Idiomas soportados limitados al inglés; no cubre caracteres acentuados, eñes ni alfabetos no latinos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chipita/emnist-52class-alphabet-cnn
- Dataset EMNIST ByClass (referencia): https://www.nist.gov/itl/products-and-services/emnist-dataset
- TensorFlow Datasets EMNIST: https://www.tensorflow.org/datasets/catalog/emnist
- Documentación de Keras: https://keras.io/
- Documentación de TensorFlow: https://www.tensorflow.org/
