# pengowray/perch-v2-tract

## Resumen

Perch 2.0 for tract and WASM es una redistribución del modelo Perch 2.0 de Google, un clasificador bioacústico de audio desarrollado por el equipo de Google Research y publicado originalmente en Kaggle como `google/bird-vocalization-classifier` (variación `perch_v2`). El autor `pengowray` lo ha dividido en dos ficheros ONNX/binario optimizados para ejecutarse con la librería tract de Sonos, tanto en navegador (WASM) como en aplicaciones de escritorio, y lo usa en producción en la aplicación Oversample.

El modelo resuelve la clasificación de sonidos naturales: aves, anfibios, insectos, mamíferos y eventos sonoros, sobre 14.795 clases taxonómicas. La arquitectura subyacente es la red neuronal de Perch 2.0, que procesa ventanas de 5 segundos a 32 kHz y produce un embedding de 1.536 dimensiones junto con un embedding espacial de 16×4×1.536 que alimenta un clasificador basado en prototipos.

La relevancia de esta ficha concreta no está en el modelo en sí (cuyo paper es Perch 2.0: The Bittern Lesson for Bioacoustics, arXiv:2508.04665) sino en el trabajo de empaquetado: separa el extractor de embeddings del cabezal clasificador, pliega las operaciones de batch-norm en las convoluciones para que tract 0.23 cargue el grafo con batch size 1, y cuantiza los prototipos del clasificador a int8. El resultado son dos ficheros de 44,7 MB y 91,4 MB que reproducen fielmente el modelo original (misma clase top en 383 de 384 ventanas de prueba).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de audio (Perch 2.0), dividida en extractor de embeddings y cabezal clasificador por prototipos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada fija de 160.000 muestras (5 s a 32 kHz) |
| Tipos de cuantizacion | Prototipos del clasificador en int8 (una escala por prototipo); extractor de embeddings en el formato del ONNX original |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`perch_v2_embed.tract.onnx`) y binario propietario little-endian (`perch_v2_head.int8.bin`) |

## Arquitectura y entrenamiento

El modelo original Perch 2.0 es una red convolucional para audio entrenada por Google sobre datos bioacústicos, con un cabezal de clasificación que compara el embedding espacial de la entrada con prototipos aprendidos por clase. En esta redistribución, el grafo se ha truncado hasta las salidas `embedding` (1.536 valores) y `spatial_embedding` (16×4×1.536); el clasificador se almacena aparte como matriz de prototipos int8 con cuatro prototipos por clase para las 14.795 clases.

Los cambios técnicos respecto al modelo de Google son tres: (1) separación del grafo y de los pesos del clasificador; (2) plegado de la multiplicación y suma de batch-norm en los pesos y sesgos de cada convolución, de modo que tract 0.23 cargue el modelo con batch size 1 sin alterar la función; y (3) cuantización a int8 de la matriz de prototipos del clasificador. La validación frente al modelo original (SavedModel de TensorFlow en 22 ventanas y ONNX completo en onnxruntime en 362 ventanas adicionales) reporta la misma clase top en 383 de 384 ventanas, con diferencias de logits inferiores a 0,031 (el caso restante fue un empate dentro de 0,002). Los scripts de generación son deterministas: reejecutarlos produce ficheros idénticos byte a byte.

No se dispone de información sobre el número de tokens, composición del dataset de entrenamiento, ni sobre si se aplicaron técnicas de RLHF/DPO (no aplicables a un clasificador de audio).

## Capacidades

- Clasificación de audio bioacústico en 14.795 clases (aves, anfibios, insectos, mamíferos y eventos sonoros).
- Extracción de embeddings de audio de 1.536 dimensiones por ventana de 5 s a 32 kHz, útiles para búsqueda por similitud, clustering o few-shot.
- Extracción de embeddings espaciales (16×4×1.536) que preservan estructura temporal/frecuencial para el clasificador.
- Inferencia en navegador mediante WebAssembly a través de tract.
- Inferencia en aplicaciones de escritorio con tract 0.23.
- Ejecución con batch size 1, optimizada para despliegue en dispositivo.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de audio.

## Casos de uso

- Identificación de especies de aves en aplicaciones de campo: la app Oversample lo usa para clasificar grabaciones de 5 s directamente en el navegador, sin enviar audio a un servidor, gracias al empaquetado WASM.
- Monitorización acústica pasiva de biodiversidad: integrado en estaciones de grabación con un script que procese ventanas de 5 s y agregue las clases detectadas para inventarios faunísticos.
- Análisis de paisajes sonoros en investigación ecológica: los embeddings de 1.536 dimensiones permiten clustering no supervisado de segmentos de audio para descubrir patrones sin etiquetas.
- Detección de eventos sonoros concretos (por ejemplo, vocalizaciones de anfibios o actividad de insectos) en pipelines de post-proceso de grabaciones largas.
- Aplicaciones educativas o de citizen science: clasificación en tiempo real en el navegador con retroalimentación inmediata al usuario.
- Filtrado previo en archivos de audio masivos: usar el clasificador int8 para descartar segmentos sin interés antes de un análisis más costoso con modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la información disponible; no aplican a un modelo de clasificación de audio. La única métrica de validación reportada por el autor es la fidelidad respecto al modelo original: misma clase top en 383 de 384 ventanas y logits con desviación máxima de 0,031.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el extractor ONNX ocupa 44,7 MB y el cabezal int8 91,4 MB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU, en navegador vía WASM o en GPU integrada.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en dispositivos móviles.
- Opciones de despliegue: tract (Sonos) 0.23 o superior, en escritorio o compilado a WASM para navegador; también puede usarse el ONNX con onnxruntime si se prefiere.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Ventana de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Perch 2.0 for tract and WASM (este) | CNN de audio + prototipos int8 | 14.795 | 5 s a 32 kHz | Apache 2.0 | Hugging Face |
| Perch 2.0 original (`google/bird-vocalization-classifier`) | CNN de audio | 14.795 | 5 s a 32 kHz | Apache 2.0 | Kaggle Models |
| Perch 1.0 | CNN de audio | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo discriminativo de audio: no genera texto ni razona; no debe evaluarse con benchmarks de LLM.
- La ventana de entrada es fija (5 s a 32 kHz); grabaciones más largas requieren segmentación manual y agregación de resultados.
- El clasificador está limitado a las 14.795 clases del modelo original; especies o eventos no presentes en ese vocabulario no se detectarán correctamente.
- Los sesgos del modelo original (posible infrarrepresentación de taxones o regiones geográficas en el dataset de entrenamiento de Google) se heredan íntegramente.
- Riesgo de falsos positivos en audio con ruido antropogénico o condiciones acústicas distintas a las de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero al ser una versión modificada conviene conservar los avisos de licencia y atribución al modelo original de Google.
- El formato del cabezal (`perch_v2_head.int8.bin`) es propietario de este empaquetado; para otros runtimes hay que usar el ONNX original o reimplementar la fórmula de logits documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pengowray/perch-v2-tract
- Modelo base en Hugging Face: https://huggingface.co/google/bird-vocalization-classifier
- Modelo original en Kaggle: https://kaggle.com/models/google/bird-vocalization-classifier
- Paper Perch 2.0: https://arxiv.org/abs/2508.04665
- Conversión ONNX de referencia: https://huggingface.co/justinchuby/Perch-onnx
- Etiquetas del clasificador: https://huggingface.co/cgeorgiaw/Perch
- Librería tract: https://github.com/sonos/tract
- Aplicación Oversample: https://app.oversample.com
