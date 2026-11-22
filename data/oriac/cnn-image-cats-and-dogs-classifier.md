# Oriac/cnn-image-cats-and-dogs-classifier

## Resumen

`cnn-image-cats-and-dogs-classifier` es una red neuronal convolucional (CNN) de clasificación binaria de imágenes, desarrollada por el usuario Oriac y publicada bajo licencia MIT en Hugging Face. Su única tarea es distinguir entre perros y gatos en fotografías, y su interés no radica en el rendimiento absoluto sino en la metodología: es un modelo entrenado **desde cero** (from scratch) con Keras/TensorFlow, sin pesos preentrenados, sin fine-tuning y sin ensembles, acompañado de una evaluación explícita con seis métricas sobre un conjunto de test reservado de 3.293 imágenes.

La arquitectura es una CNN relativamente compacta de cuatro bloques convolucionales con BatchNorm y Dropout, seguida de una cabeza densa de 1.024 unidades y una salida sigmoidea, con un total de 5.246.145 parámetros. La entrada es de 128x128x3 píxeles y el modelo se distribuye como un artefacto Keras (`.keras`) de aproximadamente 0,1 GB en el repositorio.

Es relevante como referencia educativa y como línea base reproducible para experimentos de visión por computador: el autor documenta el proceso completo (preprocesado, umbral de decisión, métricas calculadas sobre probabilidades) y contextualiza honestamente sus resultados frente a alternativas con transfer learning, que alcanzan el 98,6% en el mismo dataset. No es un modelo de propósito general: no procesa texto, no soporta tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial (4 bloques Conv2D + BatchNorm + MaxPool + Dropout, Flatten, Dense 1024, salida sigmoidea) |
| Parametros totales | 5.246.145 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 128x128x3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés: cat/dog) |
| Licencia | MIT |
| Formato de pesos | Keras (`.keras`), cargable con `keras.models.load_model` |
| Librería | Keras / TensorFlow |
| Tarea | Clasificación binaria de imágenes (`image-classification`) |
| Resolución de entrada | 128x128 píxeles, RGB, reescalado a [0,1] |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La red es una CNN apilada de cuatro bloques convolucionales. Los dos primeros usan kernels de 3x3 con 32 y 64 filtros respectivamente; los dos últimos usan kernels de 5x5 con 128 y 256 filtros. Cada bloque aplica convolución con ReLU, normalización por lotes y max pooling, seguido de dropout con tasa 0,25. La salida del último bloque se aplana a 4.096 características, pasa por una capa densa de 1.024 unidades con ReLU, BatchNorm y Dropout(0,25), y termina en una neurona con activación sigmoidea para clasificación binaria.

El entrenamiento se realizó con el optimizador Adam, con `ReduceLROnPlateau` (factor 0,75) y parada temprana; el checkpoint publicado corresponde a la mejor época según accuracy de validación, no a la última. El autor documenta una comparación controlada entre dos variantes: una línea base con kernels 3x3 en todos los bloques (5.112.001 parámetros) y la variante publicada, que sustituye los kernels de los bloques 3 y 4 por 5x5, reduce el vector aplanado de 9.216 a 4.096 características y duplica la cabeza densa a 1.024 unidades, con un coste neto de 134.144 parámetros adicionales (+2,6%). No se especifica el número de tokens ni la composición exacta del dataset de entrenamiento más allá del dataset público Dogs vs. Cats; tampoco se menciona RLHF, DPO ni técnicas de aumento de datos durante el entrenamiento.

## Capacidades

- Clasificación binaria de imágenes en dos clases: gato o perro.
- Salida de probabilidad calibrada mediante sigmoide, con umbral de decisión documentado en 0,5.
- Evaluación con métricas múltiples: accuracy, F1, precisión, recall, AUC-ROC y loss.
- Inferencia sobre imágenes RGB de 128x128 píxeles con reescalado a [0,1].
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.
- No se han documentado capacidades de detección, segmentación ni clasificación multiclase.

## Casos de uso

- **Línea base educativa en cursos de visión por computador:** el modelo sirve como referencia reproducible de una CNN entrenada desde cero, con arquitectura, hiperparámetros y protocolo de evaluación documentados, para que estudiantes comparen contra transfer learning.
- **Prototipado rápido de clasificadores binarios de imágenes:** dado su tamaño reducido (5,2 M de parámetros) y su formato Keras, puede integrarse en un script de Python en minutos para validar un pipeline de preprocesado antes de invertir en un modelo mayor.
- **Clasificación de imágenes en aplicaciones de demostración:** por ejemplo, una app de escritorio o web que reciba una foto y devuelva la etiqueta cat/dog con la probabilidad asociada, usando el snippet de inferencia incluido en la model card.
- **Experimentos de ablation sobre arquitectura:** la comparación documentada entre kernels 3x3 y 5x5 permite reproducir el estudio y extenderlo con otras variantes (profundidad, dropout, aumento de datos) manteniendo el mismo conjunto de test.
- **Evaluación de técnicas de calibración y umbral:** al publicar métricas dependientes e independientes del umbral (AUC-ROC frente a accuracy/F1), el modelo es útil para practicar el análisis del trade-off precisión-recall en problemas binarios.
- **Generación de datasets etiquetados en dominios controlados:** en un entorno con imágenes de gatos y perros similar al de entrenamiento, el modelo puede usarse para preetiquetar muestras y revisarlas manualmente, siempre con supervisión humana.
- **Pruebas de integración de TensorFlow/Keras en pipelines de CI:** el artefacto `.keras` y el código de carga permiten validar el despliegue de modelos Keras en infraestructura de serving sin depender de pesos externos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre un split reservado de 3.293 imágenes (1.588 gatos y 1.705 perros):

| Metrica | Baseline (3x3) | Modelo publicado (5x5) |
|---|---:|---:|
| Accuracy | 93,08% | **93,53%** |
| Loss | 0,1687 | **0,1625** |
| F1 | 0,9296 | **0,9337** |
| Precision | 0,9448 | **0,9573** |
| Recall | **0,9150** | 0,9112 |
| AUC-ROC | 0,9834 | **0,9859** |

Contexto comparativo aportado por el autor: las líneas base de Keras entrenadas desde cero en Dogs vs. Cats se sitúan alrededor del 92,8%; el fine-tuning de una red preentrenada en ImageNet alcanza el 98,6%; la entrada ganadora de Kaggle logró el 98,9%; y un ensemble ha llegado al 99,7%. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** muy baja; con 5,2 M de parámetros en float32 el modelo ocupa aproximadamente 20 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- **GPU recomendadas:** cualquier GPU moderna es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso una iGPU reciente pueden ejecutar la inferencia.
- **CPU:** viable para inferencia por lotes pequeños; el cuello de botella será el preprocesado de imágenes, no el modelo.
- **Opciones de despliegue:** Keras/TensorFlow nativo (`keras.models.load_model`), TensorFlow Serving, o exportación a TensorFlow Lite / ONNX para entornos embebidos (no documentado por el autor).
- **Latencia y throughput estimados:** no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en Dogs vs. Cats | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Oriac/cnn-image-cats-and-dogs-classifier` | 5,25 M | Imagen 128x128x3 | 93,53% accuracy, 0,9859 AUC-ROC (split propio) | MIT | Hugging Face |
| CNN Keras from scratch (línea base típica) | no disponible | Imagen (variable) | ~92,8% accuracy | varía | varía |
| Red preentrenada en ImageNet con fine-tuning | no disponible | Imagen (variable) | 98,6% accuracy | varía según backbone | varía |
| Entrada ganadora de Kaggle (Dogs vs. Cats) | no disponible | Imagen (variable) | 98,9% accuracy | no disponible | Kaggle |

La comparación directa con modelos concretos de Hugging Face no está disponible en la información proporcionada; las cifras de referencia son las que el propio autor cita en la model card.

## Limitaciones y advertencias

- **Ámbito muy restringido:** solo clasifica gatos y perros; cualquier otra clase de imagen se forzará a una de las dos etiquetas con una probabilidad, sin opción de "desconocido".
- **Rendimiento por debajo del estado del arte:** 93,53% frente a 98,6% con transfer learning y 98,9%–99,7% en soluciones de Kaggle; no es adecuado para producción con requisitos de precisión altos.
- **Sesgos del dataset:** hereda los sesgos de Dogs vs. Cats (razas sobrerrepresentadas, condiciones de iluminación y encuadre típicas del dataset); el rendimiento puede degradarse en dominios distintos.
- **Riesgo de alucinación en sentido amplio:** el modelo siempre emite una probabilidad, incluso ante imágenes que no contienen un gato ni un perro; no hay mecanismo de abstención.
- **Protocolo de evaluación no verificado:** las métricas están declaradas por el autor y marcadas como `verified: false`; no hay evaluación independiente.
- **Entrada fija:** requiere reescalado a 128x128 y normalización a [0,1]; no se documenta robustez frente a otras resoluciones o espacios de color.
- **Licencia MIT:** permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la procedencia del dataset de entrenamiento para usos comerciales.
- **Sin soporte multilingüe ni de texto:** no es un modelo de lenguaje; no debe evaluarse con criterios de LLM.
- **Mantenimiento incierto:** 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de soporte activo más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oriac/cnn-image-cats-and-dogs-classifier
- Dataset Dogs vs. Cats (Kaggle, referencia del autor): no disponible en la información proporcionada
- Repositorio de código o notebook original: no disponible en la información proporcionada
- Paper o blog asociado: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
