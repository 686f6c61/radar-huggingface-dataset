# Fabien-Ctrees/sentinel2-pleroma-flowering

## Resumen

El modelo `sentinel2-pleroma-flowering` es una red neuronal convolucional (CNN) en PyTorch que detecta árboles de *Pleroma* (antes *Tibouchina*, conocidos como *manacá-da-serra* o *quaresmeira*) en floración a partir de imágenes del satélite Sentinel-2. Lo publica Fabien-Ctrees como conversión a PyTorch de los pesos originales del estudio de Wagner (2021) publicado en *Scientific Reports*, donde se aplicó a 33.798 imágenes Sentinel-2 del periodo 2016-2020 para cartografiar la floración de esta especie en toda la Mata Atlántica brasileña.

La tarea es una clasificación binaria por tesela: cada celda de 1,28 km (128 × 128 px más 4 px de contexto por lado, es decir 136 × 136 px) se clasifica como "floración de *Pleroma* presente" o "fondo". El modelo tiene 25,4 M de parámetros, una arquitectura convolucional relativamente sencilla (5 bloques de dos convoluciones 3×3 con batch norm y ReLU, seguidos de dos capas densas) y consume cuatro bandas espectrales (B04, B03, B02 y B08) de imágenes Sentinel-2 Level-1C.

Su relevancia es doble: por un lado, ofrece un caso de uso concreto de teledetección ecológica con pesos abiertos y reproducibilidad verificada (coincidencia del 100 % con el modelo Keras original en 2.000 teselas de test); por otro, es un ejemplo de conversión rigurosa de un modelo de investigación a un formato moderno (safetensors) con licencia permisiva (CC BY 4.0), lo que facilita su reutilización en estudios de fenología y seguimiento de la biodiversidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (conv 1×1 + 5 bloques de 2 × [conv 3×3 - batch norm - ReLU] + max pooling + dense 100 - dropout 0.5 - dense 2 - softmax) |
| Parametros totales | 25,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 136 × 136 px × 4 bandas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin componente textual) |
| Licencia | CC BY 4.0 (pesos); código MIT |
| Formato de pesos | safetensors (`s2_pleroma_cnn.safetensors`) y PyTorch `torch.save` (`s2_pleroma_cnn.pt`) |

## Arquitectura y entrenamiento

La red es una CNN de clasificación de imágenes con una primera convolución 1×1 de 64 filtros seguida de cinco bloques, cada uno con dos convoluciones 3×3 con batch normalization y ReLU, con 64, 128, 256, 512 y 1024 filtros respectivamente; tras los cuatro primeros bloques hay max pooling. La cabeza es una capa densa de 100 unidades, dropout de 0,5 y una capa densa final de 2 unidades con softmax. La entrada es un tensor (N, 4, 136, 136) con las bandas B04, B03, B02 y B08 de Sentinel-2 Level-1C, convertidas a 8 bits con la fórmula del artículo y normalizadas dividiendo entre 255.

El entrenamiento original (en Keras / TensorFlow 2.3) usó 158.612 teselas de 136 × 136 px de imágenes Sentinel-2 de la Mata Atlántica, con RMSprop (lr 1e-4), pesos de clase, volteos aleatorios y 5.000 épocas; se seleccionaron los pesos de la época 4.331, con una precisión de validación ponderada del 99,58 %. La conversión a PyTorch mantiene el orden de aplanado channels-last de Keras y se validó contra el modelo original: misma clase en el 100 % de 2.000 teselas de test (diferencia máxima de probabilidad de 0,0037 en float32) y preprocesado idéntico bit a bit en 187 teselas.

## Capacidades

- Clasificación binaria de teselas Sentinel-2: presencia o ausencia de *Pleroma* en floración por celda de 1,28 km.
- Detección de flores magenta a púrpura en imágenes ópticas de satélite.
- Salida de probabilidad calibrada (softmax) por tesela, con umbral de decisión en 0,5.
- Procesamiento por lotes de teselas (tensor N × 4 × 136 × 136).
- Integración en pipelines de teledetección vía paquete `s2pleroma` (descarga de escenas, preprocesado y predicción).
- Generación de mapas de probabilidad en GeoTIFF por celda (ejemplo incluido en el repositorio).
- No soporta tool calling, agentes, texto, audio ni razonamiento multi-paso: es un clasificador de imágenes puro.

## Casos de uso

- Cartografía de la floración de *Pleroma* a escala de paisaje: aplicar el modelo sobre series temporales de Sentinel-2 para reconstruir la fenología de la especie en la Mata Atlántica, tal como se hizo en el artículo con 33.798 imágenes.
- Seguimiento de la estacionalidad: procesar imágenes mensuales para identificar el pico de floración (en torno a marzo en la mayor parte de la Mata Atlántica) y detectar cambios interanuales.
- Validación de inventarios forestales: cruzar las detecciones por celda de 1,28 km con parcelas de campo para priorizar zonas de muestreo de *Pleroma*.
- Monitorización de la biodiversidad y conservación: generar capas de presencia de una especie indicadora en áreas protegidas y corredores ecológicos.
- Investigación en fenología remota: usar el modelo como referencia reproducible (pesos abiertos, licencia CC BY 4.0) en estudios comparativos con otros índices de vegetación o clasificadores.
- Educación y divulgación: el tutorial de Google Colab permite ejecutar el pipeline completo sobre una coordenada y un mes concretos, útil para cursos de teledetección.
- Detección de falsos positivos en floraciones rosadas: el modelo puede señalar candidatos que luego se revisan para distinguir *Pleroma* de otras especies con flores rosas o púrpuras (por ejemplo, *Handroanthus*, ipê rosado).

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Coincidencia PyTorch vs Keras original (2.000 teselas de test) | 100 % misma clase; diferencia máxima de probabilidad 0,0037 (float32) |
| Teselas de test del archivo del artículo (24.710 fondo, 7.012 floración) | exactitud global 97,9 %; precisión 0,938; recall 0,967; F1 0,953 |
| Preprocesado vs teselas originales de entrenamiento (187 teselas) | idéntico bit a bit |
| Pipeline completo vs mapas de predicción originales (tesela 23KLP, 3 imágenes 2017-2018, 6.400 celdas cada una) | 100 % idéntico |
| Precisión de validación ponderada del entrenamiento original | 99,58 % (época 4.331) |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 25,4 M de parámetros en float32 los pesos ocupan aproximadamente 100 MB, y un lote de teselas de 136 × 136 px requiere poca memoria adicional (cabe holgadamente en GPUs de 4-8 GB).
- GPU recomendadas: cualquier GPU moderna sirve; para procesar grandes volúmenes de teselas conviene una A100, H100, L4 o RTX 4090 por throughput, aunque el modelo es pequeño y también funciona bien en GPUs de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4060, etc.), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch nativo (recomendado, vía `s2pleroma`), exportación a TorchScript u ONNX no documentada en la información disponible; no se mencionan vLLM, llama.cpp ni Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sentinel2-pleroma-flowering | Clasificación binaria de floración en Sentinel-2 | 25,4 M | 136 × 136 px × 4 bandas | CC BY 4.0 (pesos), MIT (código) | Hugging Face, GitHub, Colab |
| Modelo Keras original de Wagner (2021) | Misma tarea | 25,4 M (equivalente) | Igual | Según artículo y Zenodo | Zenodo (doi:10.5281/zenodo.4549662) |
| Clasificadores genéricos de uso del suelo (p. ej. modelos de land cover) | Clasificación multiespectral general | Variable | Variable | Variable | no disponible |
| Índices de vegetación (NDVI, etc.) | Detección de vegetación activa | no aplica | Series de bandas | no aplica | Abiertos |

No se dispone de información sobre otros modelos comparables específicos de detección de floración de *Pleroma* en la documentación proporcionada.

## Limitaciones y advertencias

- Solo detecta árboles en floración: fuera de la estación de floración (pico en torno a marzo en la mayor parte de la Mata Atlántica) o bajo nubes, los árboles de *Pleroma* no se ven.
- Puede detectar otras especies con flores rosas o púrpuras (por ejemplo, *Handroanthus*, ipê rosado), generando falsos positivos.
- Entrenado con imágenes Sentinel-2 L1C de 2016-2020 en la Mata Atlántica brasileña; no se ha probado en otros biomas ni con imágenes L2A (reflectancia superficial).
- La salida es presencia por celda de 1,28 km, no un recuento de árboles.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribución; el código es MIT; los datos Sentinel-2 son Copernicus Sentinel data (ESA) con sus propias condiciones.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas en condiciones de nubosidad, cambios de calibración entre versiones de Sentinel-2 o biomas distintos al de entrenamiento.
- No se documentan sesgos demográficos ni lingüísticos (no aplican), pero sí un sesgo geográfico y temporal claro por el dominio de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Fabien-Ctrees/sentinel2-pleroma-flowering
- Repositorio de código, notebooks y documentación: https://github.com/fabien-w/sentinel2-pleroma-flowering
- Tutorial de Google Colab: https://colab.research.google.com/github/fabien-w/sentinel2-pleroma-flowering/blob/main/notebooks/pleroma_sentinel2_colab.ipynb
- Artículo científico: https://doi.org/10.1038/s41598-021-99304-x
- Datos y código originales del artículo: https://doi.org/10.5281/zenodo.4549662
- Apoyo al autor: https://buymeacoffee.com/fwagner
