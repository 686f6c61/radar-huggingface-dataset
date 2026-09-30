# DiegoXAI-Shape/abbadon-engine

## Resumen

Abbadon Engine es un pipeline de visión por computador publicado en HuggingFace por el usuario DiegoXAI-Shape, compuesto por dos modelos TorchScript que trabajan en cadena para clasificar imágenes de perros y gatos. El primer modelo, Daowa-maad, es un oráculo de segmentación de mascotas destilado de SAM 2; el segundo, Mendicant Bias, es un clasificador binario (gato/perro) que recibe la imagen RGB original más la máscara blanda generada por el primero como mecanismo de atención.

El problema que aborda es el *shortcut learning* o aprendizaje por atajos: un clasificador convolucional convencional alcanza alta precisión en cats vs dogs aprendiendo el fondo ("perro si hay césped, gato si hay sofá") en lugar del animal. Abbadon introduce una pista explícita de dónde está el animal mediante la máscara de segmentación, permitiendo al clasificador desobedecer esa pista cuando es incorrecta, pero penalizando esa desobediencia con una penalización L2.

El repositorio es de tamano reducido (0,2 GB) y los pesos se distribuyen en formato TorchScript, por lo que se pueden ejecutar desde Python o desde C++ (LibTorch) sin necesidad del código original del modelo. La licencia es de uso exclusivo para investigación y educación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (ConvNeXtV2): Daowa-maad con encoder ConvNeXtV2-Tiny; Mendicant Bias con backbone ConvNeXtV2-Atto modificado a 4 canales |
| Parametros totales | no disponible (los pesos se distribuyen compilados en TorchScript, sin recuento publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de imagen 384×384) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | research-and-education-only (research and education only) |
| Formato de pesos | TorchScript (.pt, exportados con torch.jit.trace); consumibles desde Python y LibTorch/C++ |

## Arquitectura y entrenamiento

El pipeline consta de dos etapas. Daowa-maad es un segmentador binario (mascota vs no mascota) construido sobre un encoder ConvNeXtV2-Tiny (`convnextv2_tiny.fcmae_ft_in22k_in1k`, vía `timm`). Se entrenó sobre Oxford-IIIT Pet con destilación de conocimiento desde SAM 2: como SAM 2 es *promptable* y no automático, se usó un detector YOLOv8 para localizar la mascota y pasar el centro de su caja como punto de prompt, generando máscaras adicionales para ampliar el conjunto. El entrenamiento combina KL divergence a temperatura 2.0 contra las predicciones blandas del profesor (*dark knowledge*) con BCE, Dice y Boundary loss, mediante un calendario de pesos con *burn-in* que desplaza linealmente la importancia desde el profesor hacia las etiquetas duras y la forma del objeto. En una fase posterior de ajuste fino adversarial se añadieron negativos duros de ADE20K (texturas que parecen una mascota, como abrigos de piel) con máscara objetivo todo ceros, seleccionando checkpoints por `0,7 × IoU(negativos) + 0,3 × IoU(positivos)` para priorizar no alucinar mascotas.

Mendicant Bias es un clasificador gato/perro con backbone ConvNeXtV2-Atto adaptado a 4 canales de entrada (RGB + máscara). Antes del clasificador, un bloque convolucional pequeño genera una corrección en `[-1, 1]` (tanh) que se suma a la máscara de Daowa-maad (Attention Gate), penalizada con L2 (`λ = 0,01`). Durante el entrenamiento se aplica Drop-RGB con `p = 0,15`, que pone a cero aleatoriamente los colores para forzar al modelo a decidir a partir de la forma de la máscara y combatir atajos de color o textura. Se entrenó sobre Dogs vs Cats (Kaggle) con clases `Cat = 0` y `Dog = 1`, y reporta una precisión de validación del 99,43 %. El preprocesado es idéntico para ambos modelos: lectura RGB con OpenCV, redimensionado bilineal a 384×384, división por 255 y normalización ImageNet (media `[0.485, 0.456, 0.406]`, desviación `[0.229, 0.224, 0.225]`), con conversión HWC→CHW.

## Capacidades

- Clasificación binaria de imágenes de mascotas en dos clases: gato (0) o perro (1).
- Segmentación binaria de mascotas (mascota vs no mascota) mediante máscara sigmoide de resolución 384×384.
- Robustez frente a sesgos de fondo gracias al mecanismo de atención guiada por máscara y a Drop-RGB durante el entrenamiento.
- Detección de negativos duros: la fase adversarial entrena el segmentador para devolver máscaras vacías ante texturas que imitan una mascota (por ejemplo, pieles).
- Inferencia en C++/LibTorch sin código fuente del modelo, gracias a la exportación con `torch.jit.trace`.
- Desobediencia controlada de la pista de segmentación mediante la Attention Gate, útil cuando el oráculo se equivoca.
- No dispone de soporte de tool calling, function calling, agentes, capacidades multilingües, visión general (solo mascotas), audio ni modo de razonamiento.

## Casos de uso

- Clasificación de refugios y protectoras de animales: el pipeline permite etiquetar automáticamente lotes de fotografías como gato o perro, resistiendo el sesgo de que las fotos de gato se toman en interiores y las de perro en exteriores.
- Moderación y organización de galerías de fotos de usuarios: separar por especie imágenes en un servicio de almacenamiento, usando el segmentador para descartar imágenes sin animal y el clasificador para etiquetar.
- Etiquetado automático para entrenamiento de datasets: generar pseudo-etiquetas de segmentación con Daowa-maad para preentrenar otros modelos de segmentación de mascotas, reutilizando el oráculo congelado.
- Sistemas de investigación sobre *shortcut learning*: el par de modelos sirve como caso de estudio reproducible para medir cómo cambia el comportamiento de un clasificador con y sin pista explícita de localización, y con y sin Drop-RGB.
- Aplicaciones de veterinaria o adopción con inferencia en C++: al ejecutarse desde LibTorch, se puede integrar en un motor nativo (por ejemplo, en un servicio de escritorio o un sistema embebido con GPU) sin dependencia del framework Python.
- Ejemplos educativos en cursos de visión por computador: el repositorio de motor incluye tests automáticos (carga, CUDA, canal de color, formas, dtypes, normalización) que convierten el pipeline en un ejercicio guiado de extremo a extremo.
- Tareas de atención al cliente limitadas a contenido visual: dado que no es un modelo de lenguaje, su uso conversacional se restringe a servir como etapa de visión dentro de un sistema mayor que interprete las etiquetas de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la información disponible. El único dato numérico declarado por el autor es la precisión de validación del clasificador:

| Metrica | Valor |
|---|---|
| Precisión de validación (Mendicant Bias, Dogs vs Cats) | 99,43 % |
| Resto de benchmarks (MMLU, HumanEval, GSM8K, etc.) | no aplica (modelo de visión, no de lenguaje) |

## Requisitos de hardware

- Tamano del repositorio: 0,2 GB, lo que sugiere pesos ligeros, coherentes con backbones ConvNeXtV2-Tiny (Daowa-maad) y ConvNeXtV2-Atto (Mendicant Bias).
- VRAM estimada para inferencia: no disponible en la información proporcionada; no se publican cifras concretas.
- GPU recomendadas: no disponible; el motor C++ del autor hace inferencia en GPU (OpenCV → Daowa-maad → Mendicant Bias) e incluye un test de disponibilidad de CUDA, pero no especifica modelos concretos.
- Encaje en GPU de consumo: por el tamano de repositorio y de los backbones (Tiny y Atto) es razonable esperar que quepa en GPUs de consumo, pero no hay confirmación publicada.
- Opciones de despliegue: Python con PyTorch (`torch.jit.load`) o C++ con LibTorch; el repositorio `abbadon_engine` implementa el pipeline completo nativo.
- Latencia y throughput: no disponibles.
- Preprocesado obligatorio: entrada a 384×384, OpenCV con conversión BGR→RGB, normalización ImageNet; la máscara debe ser la salida sigmoide sin umbralizar.

## Comparativa con modelos similares

No se dispone de datos publicados de rendimiento comparativo del pipeline Abbadon frente a alternativas. Cualitativamente se puede situar frente a las siguientes referencias, aunque sin cifras de benchmark verificadas:

| Modelo | Tipo | Base | Licencia | Notas |
|---|---|---|---|---|
| Abbadon Engine (Daowa-maad + Mendicant Bias) | Segmentación + clasificación gato/perro | ConvNeXtV2-Tiny + ConvNeXtV2-Atto, destilado de SAM 2 | research-and-education-only | Enfoque explícito contra *shortcut learning*; clasificación con máscara como atención |
| SAM 2 | Segmentación promptable | Transformer de segmentación | Apache 2.0 (según su publicación original) | Modelo profesor del pipeline; no clasifica especie |
| ResNet / CNN convencional para cats vs dogs | Clasificación | CNN | Varía | Alcanza alta precisión pero aprende el fondo (Grad-CAM); no usa segmentación |
| ConvNeXtV2 (timm) | Backbone genérico | CNN moderno | Apache 2.0 (según timm) | Componente base reutilizado por Abbadon |

Las cifras de parámetros, contexto y rendimiento de los modelos comparables no están disponibles en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- La model card está truncada: el apartado "Limitations" comienza con "Trained" y no se completa en la información disponible.
- Modelo específico de gato/perro: no reconoce otras especies ni realiza clasificación general de ImageNet, pese a que la etiqueta de pipeline sea `image-classification`.
- El oráculo de segmentación falla en algunas poses poco habituales, en las que el centro de la caja detectada por YOLOv8 cae fuera del animal.
- Daowa-maad fue entrenado con destilación de SAM 2, por lo que hereda los sesgos y errores del profesor y del detector que genera los prompts.
- Licencia restringida a investigación y educación (`research-and-education-only`): no se autoriza explícitamente el uso comercial, por lo que conviene revisar las condiciones antes de un despliegue productivo.
- Riesgo de alucinación de mascotas mitigado parcialmente por la fase adversarial con negativos duros, pero no eliminado; la selección de checkpoints prioriza no alucinar sobre la precisión en positivos.
- No se publican métricas de segmentación (IoU, Dice) fuera del criterio de selección de checkpoints, ni análisis de sesgo por raza, especie o condiciones de iluminación.
- El pipeline asume entrada RGB a 384×384 con una normalización estricta; formatos, canales u órdenes distintos requieren reimplementar el preprocesado.
- Al ser modelos TorchScript trazados, no se pueden modificar internamente de forma sencilla y no exponen la estructura original para ajuste fino directo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DiegoXAI-Shape/abbadon-engine
- Motor de inferencia en C++/LibTorch: https://github.com/DiegoXAI-Shape/abbadon_engine
- Código de entrenamiento (proyecto Abbadon): https://github.com/DiegoXAI-Shape/Abbadon
- Backbone ConvNeXtV2 (timm): no disponible enlace directo en la información proporcionada
- SAM 2 (profesor de destilación): no disponible enlace directo en la información proporcionada
