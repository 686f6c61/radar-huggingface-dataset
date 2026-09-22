# jackstev/hw2-pool-ball-solid-stripe

## Resumen

`jackstev/hw2-pool-ball-solid-stripe` es un clasificador binario de imágenes publicado por el usuario jackstev como entrega de la tarea 2 de la asignatura 24-679. Su única función es decidir si la bola de billar fotografiada sobre una mesa azul es lisa (solid, clase 0) o rayada (stripe, clase 1). No es un modelo generativo ni un modelo de lenguaje: es un clasificador de visión por computadora construido con AutoGluon MultiModal 1.6.1 sobre un backbone EfficientNet-B0 preentrenado en ImageNet y ajustado por completo con 357 imágenes.

El interés del artefacto es metodológico más que de producto. El autor documenta las 12 configuraciones exploradas (backbone, tipo de PEFT, tasa de aprendizaje y uso de copias aumentadas), selecciona el modelo por entropía cruzada de validación en lugar de por exactitud, y publica tanto los modos de fallo conocidos como el intervalo de confianza de sus resultados. Toda la búsqueda de arquitecturas cabe en una Tesla T4 en unos cuatro minutos.

Su relevancia práctica es limitada: el conjunto de datos contiene 30 bolas reales de dos juegos distintos, una sola mesa y condiciones de iluminación similares, y el conjunto de prueba son 5 fotografías. Sirve como ejemplo reproducible de un flujo AutoML de clasificación de imágenes y como punto de partida para transfer learning, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet-B0 preentrenada en ImageNet, con ajuste completo (full fine-tuning) y cabecera de clasificación binaria, orquestada por AutoGluon MultiModal 1.6.1 |
| Parámetros totales | No disponible en la model card; el backbone EfficientNet-B0 estándar ronda los 5,3 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes; entrada de 224 x 224 píxeles RGB) |
| Tipos de cuantización | No disponible (el autor no documenta ninguna cuantización; los artefactos se distribuyen sin cuantizar) |
| Idiomas soportados | No aplica; las etiquetas de salida están en inglés (`solid`, `stripe`) |
| Licencia | No disponible; el autor declara explícitamente que no asigna licencia porque el conjunto de datos no concede derechos de reutilización |
| Formato de pesos | Artefactos pickle de AutoGluon empaquetados en `autogluon_image_predictor_dir.zip`; no hay safetensors ni GGUF |
| Tarea | Clasificación de imágenes (pipeline `image-classification`), binaria |
| Preprocesado de entrada | 224 x 224 RGB, orientación EXIF aplicada, relación de aspecto preservada con relleno gris (128,128,128); después la resize, center crop y normalización ImageNet del propio backbone |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-22 / 2026-09-22 |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional EfficientNet-B0 preentrenada en ImageNet y afinada por completo (todos los pesos actualizados) sobre un conjunto de 357 filas. La búsqueda se ejecutó con el preset `medium_quality` de AutoGluon MultiModal 1.6.1, con 12 configuraciones, un límite de 240 segundos y 10 épocas por ejecución, y parada temprana con `optim.patience = 3`. Las variables exploradas fueron el backbone (ResNet-18, MobileNetV3-Small y EfficientNet-B0), el grado de ajuste vía `optim.peft` (`bit_fit`, `norm_fit` y ajuste completo), la tasa de aprendizaje (0,0004, 0,0001 y 0,001) y la inclusión o no de las copias aumentadas. La semilla fue 24679.

Los datos proceden del conjunto `cmuchancel/hw1-pool-balls` (revisión `40c628cd92af`), en el que un compañero de clase fotografió 30 bolas distintas de dos juegos. Los splits se usaron tal cual se publicaron: 21 originales más 336 copias aumentadas (brillo, rotación, contraste y desenfoque) para entrenamiento, 4 originales para validación y 5 originales para prueba. Las copias aumentadas solo derivan de fotos de entrenamiento y ninguna foto cruza entre splits. La selección del modelo se hizo por entropía cruzada de validación, no por exactitud, porque con 4 fotos de validación la exactitud solo puede tomar cinco valores. No hay RLHF, DPO ni ninguna fase de alineación, al no tratarse de un modelo generativo. El entrenamiento se ejecutó en una Tesla T4 con precisión mixta activada y sin forzar kernels deterministas, por lo que una repetición con la misma semilla puede diferir ligeramente.

## Capacidades

- Clasificación binaria de una única bola de billar por imagen: devuelve `0` para lisa y `1` para rayada.
- Funciona sobre el preprocesado exacto del conjunto de datos: foto de una bola sobre mesa azul, 224 x 224, con relleno gris y normalización ImageNet.
- Soporta el flujo de AutoGluon MultiModal: el predictor se carga desde un zip y se invoca con un `DataFrame` que contiene la ruta de la imagen.
- Capacidad de aprendizaje con pocos datos: la variante con solo 21 originales alcanzó una pérdida de validación de 0,3898 y una exactitud de 0,50, frente a 0,0803 y 1,00 al añadir las 336 copias aumentadas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento, visión general, audio ni generación de texto.
- El autor solo documenta la salida de clase mediante `predict()`; no se documenta la salida de probabilidades.

## Casos de uso

- Material docente reproducible de AutoML en visión: el repositorio incluye el registro completo de las 12 ejecuciones en `search_runs.csv` y las predicciones por foto en `test_predictions.png`, lo que permite reproducir paso a paso cómo se elige un modelo con un conjunto de validación de solo 4 imágenes y por qué se usa entropía cruzada en lugar de exactitud.
- Estudio de ablación sobre aumento de datos: la comparación entre la ejecución con 357 filas y la de solo 21 originales cuantifica el efecto de aplicar brillo, rotación, contraste y desenfoque, con un salto de 0,50 a 1,00 en exactitud de validación y una reducción de la pérdida de 0,3898 a 0,0803.
- Punto de partida para transfer learning en clasificación de objetos con pocos datos: el mismo pipeline de AutoGluon permite sustituir el conjunto de datos por otro de características similares y repetir la búsqueda de backbones y estrategias de PEFT, con un coste de cómputo de unos cuatro minutos en una T4.
- Preanotación asistida de un corpus de imágenes de billar: el clasificador puede etiquetar automáticamente imágenes como lisa o rayada para acelerar el etiquetado manual, siempre con revisión humana, dado que la exactitud real fuera del dominio de entrenamiento es desconocida.
- Componente de un prototipo de robótica de billar: en un sistema que necesite distinguir el tipo de bola antes de golpearla, el modelo puede actuar como módulo de clasificación, pero requeriría reentrenamiento con imágenes del entorno real (otra mesa, otra iluminación, otras cámara y distancia) antes de cualquier uso serio.
- Demostración de compromiso entre tamaño y precisión en el despliegue: la misma búsqueda incluyó MobileNetV3-Small, mucho más ligero, que obtuvo una pérdida de validación de 1,4883 frente a 0,0803 de EfficientNet-B0, lo que sirve para ejemplificar el coste en precisión de elegir un backbone orientado a dispositivos con recursos limitados.
- Prueba de concepto de integración en Python de un modelo AutoGluon: el fragmento de uso de la model card muestra cómo descargar el zip desde HuggingFace Hub, extraerlo y cargar el predictor, útil como plantilla para integrar artefactos de AutoGluon en un servicio interno.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque el modelo no es un modelo de lenguaje. Los únicos datos disponibles son las métricas del propio autor sobre su conjunto de prueba de 5 fotografías y la tabla de búsqueda sobre validación.

Resultados del modelo seleccionado en el conjunto de prueba (5 fotos):

| Métrica | Valor |
|---|---:|
| Accuracy | 1,000 (5/5) |
| Balanced accuracy | 1,000 |
| Macro F1 | 1,000 |
| Recall solid / recall stripe | 1,00 / 1,00 |
| Intervalo de Wilson del 95 % para accuracy | [0,57; 1,00] |

Comparativa interna de las 12 ejecuciones de la búsqueda (selección por pérdida de validación):

| Ejecución | Backbone | PEFT | LR | Filas de entrenamiento | Pérdida val. | Exactitud val. |
|---|---|---|---:|---:|---:|---:|
| efficientnet_b0__None__lr0.001 | efficientnet_b0 | ninguno | 0,001 | 357 | 0,0803 | 1,00 |
| efficientnet_b0__full | efficientnet_b0 | ninguno | 0,0004 | 357 | 0,3689 | 0,75 |
| ablation_originals_only | efficientnet_b0 | ninguno | 0,001 | 21 | 0,3898 | 0,50 |
| efficientnet_b0__None__lr0.0001 | efficientnet_b0 | ninguno | 0,0001 | 357 | 0,5856 | 0,75 |
| resnet18__full | resnet18 | ninguno | 0,0004 | 357 | 0,6425 | 0,50 |
| resnet18__norm_fit | resnet18 | norm_fit | 0,0004 | 357 | 0,6756 | 0,50 |
| resnet18__bit_fit | resnet18 | bit_fit | 0,0004 | 357 | 0,6765 | 0,50 |
| mobilenetv3_small_100__full | mobilenetv3_small_100 | ninguno | 0,0004 | 357 | 1,4883 | 0,75 |
| efficientnet_b0__bit_fit | efficientnet_b0 | bit_fit | 0,0004 | 357 | 1,6278 | 0,75 |
| efficientnet_b0__norm_fit | efficientnet_b0 | norm_fit | 0,0004 | 357 | 1,6315 | 0,75 |
| mobilenetv3_small_100__bit_fit | mobilenetv3_small_100 | bit_fit | 0,0004 | 357 | 2,1502 | 0,75 |
| mobilenetv3_small_100__norm_fit | mobilenetv3_small_100 | norm_fit | 0,0004 | 357 | 2,1502 | 0,75 |

## Requisitos de hardware

- Entrenamiento documentado: una única Tesla T4, con precisión mixta, unos 4 minutos para las 12 ejecuciones completas de la búsqueda (límite de 240 segundos y 10 épocas por ejecución).
- VRAM estimada para inferencia: por debajo de 1 GB en FP32 para un backbone de ~5,3 millones de parámetros a 224 x 224; es una estimación a partir del tamaño del backbone, no una medición publicada por el autor.
- VRAM estimada para entrenamiento: del orden de 2 a 4 GB con lotes pequeños y precisión mixta; tampoco medida ni publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para inferencia; la T4 es la única verificada por el autor. Una RTX 4090, A100 o H100 no aportan ninguna ventaja significativa a este tamaño de modelo, más allá de reducir la latencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 4 GB o más; también cabe en CPU, dado el reducido tamaño del backbone.
- Opciones de despliegue: `autogluon.multimodal==1.6.1` en Python, cargando el directorio extraído del zip. El autor no documenta exportación a ONNX, TorchScript, TensorRT, vLLM, llama.cpp, Ollama ni TGI; ninguna de esas vías está verificada.
- Latencia y throughput: no disponibles. El único dato temporal publicado es la duración de la búsqueda completa, no la latencia de una inferencia individual.
- Almacenamiento: 0,1 GB de repositorio, más el espacio de la instalación de AutoGluon y de sus dependencias.

## Comparativa con modelos similares

La búsqueda web no devolvió ningún modelo comparable publicado, ya que los resultados obtenidos corresponden a un portal inmobiliario y no guardan relación con el tema. La única comparativa disponible es la que el propio autor realizó entre los tres backbones dentro de la misma búsqueda:

| Modelo / configuración | Parámetros | Contexto | Pérdida val. | Exactitud val. | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| efficientnet_b0, ajuste completo, lr 0,001 (seleccionado) | ~5,3 M (cifra estándar de la arquitectura; no reportada por el autor) | No aplica | 0,0803 | 1,00 | Sin licencia asignada | Repositorio de HuggingFace |
| efficientnet_b0, ajuste completo, lr 0,0004 | ~5,3 M (cifra estándar) | No aplica | 0,3689 | 0,75 | Sin licencia asignada | Dentro del registro de búsqueda |
| resnet18, ajuste completo | ~11,7 M (cifra estándar) | No aplica | 0,6425 | 0,50 | Sin licencia asignada | Dentro del registro de búsqueda |
| mobilenetv3_small_100, ajuste completo | ~2,5 M (cifra estándar) | No aplica | 1,4883 | 0,75 | Sin licencia asignada | Dentro del registro de búsqueda |

Ninguna de las tres alternativas se publica como artefacto independiente: solo la configuración ganadora se distribuye en el repositorio.

## Limitaciones y advertencias

- Sesgo de dominio severo: solo 30 bolas reales de 2 juegos, una única mesa y condiciones de iluminación similares. No hay ninguna evidencia de cómo se comporta el modelo en otros entornos.
- El conjunto de prueba son 5 fotos. No es una medición fiable: una sola foto desplaza la exactitud 20 puntos porcentuales, y el intervalo de Wilson del 95 % abarca de 0,57 a 1,00.
- El split se hizo por foto, no por juego de bolas, por lo que la evaluación no se realiza sobre un conjunto completamente no visto.
- Modo de fallo documentado: el círculo blanco con el número de una bola lisa puede parecerse a la banda blanca de una bola rayada cuando queda de cara a la cámara.
- Modo de fallo documentado: el desenfoque fuerte o el contraste extremo aplicados en las copias aumentadas pueden difuminar la banda de la bola rayada mientras la copia conserva la etiqueta original, lo que introduce ruido de etiquetado.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo; el riesgo equivalente es una clasificación errónea con alta confianza sobre imágenes fuera de distribución.
- Limitaciones de licencia: el autor no asigna licencia a los pesos porque el conjunto de datos de origen no concede derechos de reutilización. Cualquier uso fuera del ámbito de la asignatura requiere consultar antes al creador del conjunto de datos.
- Los artefactos usan pickle internamente. Solo deben cargarse si se confía en su procedencia, dado que el formato puede ejecutar código arbitrario al deserializar.
- No se fuerzan kernels deterministas y la precisión mixta está activada, de modo que una reejecución con la misma semilla puede producir resultados ligeramente distintos.
- El autor declara haber usado Claude (Anthropic) para redactar el notebook y la model card, aunque afirma haber elegido el conjunto de datos, ejecutado la búsqueda y verificado los resultados.
- No se han ejecutado pruebas de robustez frente a oclusión, cambios de fondo, ángulos extremos o resolución distinta a 224 x 224.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jackstev/hw2-pool-ball-solid-stripe
- Conjunto de datos: https://huggingface.co/datasets/cmuchancel/hw1-pool-balls
- Revisión del conjunto de datos utilizada: `40c628cd92af`
- No se han encontrado papers, blogs, repositorios auxiliares ni demos adicionales en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
