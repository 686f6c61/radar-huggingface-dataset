# Muhamm-dk/arabic-sentiment-marbert-combined

## Resumen

Muhamm-dk/arabic-sentiment-marbert-combined es un modelo de clasificación de sentimiento binario (negativo/positivo) para texto en árabe, obtenido mediante fine-tuning de UBC-NLP/MARBERT. Lo desarrolla el usuario Muhamm-dk y está pensado para cubrir tanto árabe estándar moderno (MSA) como variedades dialectales, un escenario en el que la mayoría de modelos de sentimiento disponibles se limitan al MSA o a un único dialecto.

El modelo parte de MARBERT, un encoder BERT de 162.842.882 parámetros preentrenado específicamente sobre grandes volúmenes de texto árabe dialectal y MSA. Sobre esa base se ha ajustado con una mezcla de cuatro corpus: LABR (reseñas de libros), HARD (reseñas hoteleras), ASTD (tuits egipcios) y AJGT (tuits jordanos), lo que aporta cobertura de varios registros y dialectos en un único checkpoint.

Su relevancia es práctica: ofrece un clasificador ligero (repo de 0,7 GB, pesos safetensors) que puede ejecutarse en CPU o en GPUs de consumo para tareas de moderación, análisis de opinión o enrutado de reseñas en árabe. La model card documenta resultados de macro-F1 por conjunto de test y una lista explícita de limitaciones, algo poco habitual en modelos de este tamaño y con tan pocas descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MARBERT) |
| Parametros totales | 162.842.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (MARBERT base usa 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | Árabe (MSA y dialectos: egipcio y jordano en entrenamiento) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT de 162,8 millones de parámetros, inicializado desde UBC-NLP/MARBERT y rematado con una cabeza de clasificación binaria sobre la representación del token [CLS]. MARBERT se preentrenó sobre texto árabe que combina MSA y dialectos, lo que explica que el fine-tuning funcione sobre registros tan distintos como reseñas de libros, reseñas de hoteles y tuits.

El ajuste se realizó con semilla 0, 3 épocas y learning rate 2e-5, seleccionando la mejor época según macro-F1 en validación. Los datos de entrenamiento son cuatro corpus: LABR (reseñas de libros), HARD (reseñas de hoteles, con una submuestra de 20.000 filas y eliminando la etiqueta numérica inicial de Booking.com para evitar fugas de información), ASTD (tuits egipcios, solo clases Negative/Positive) y AJGT (tuits jordanos). No se documenta en la model card el uso de RLHF, DPO ni ninguna innovación de decodificación; se trata de un fine-tuning supervisado convencional.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) de texto en árabe.
- Cobertura de árabe estándar moderno y de dialectos egipcio y jordano, según los corpus de entrenamiento.
- Funciona sobre registros variados: reseñas de libros, reseñas de hoteles y tuits.
- Salida de clasificación de una sola etiqueta por secuencia (text-classification).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un encoder de clasificación, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al árabe; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Análisis de opinión de reseñas hoteleras: el modelo se entrenó con HARD y alcanza 0,908 de macro-F1 en su test, por lo que puede clasificar automáticamente reseñas de plataformas de viaje para alimentar paneles de satisfacción.
- Monitorización de reputación en redes sociales en árabe: con cobertura de tuits egipcios (ASTD) y jordanos (AJGT), sirve para medir polaridad de menciones de marca en tiempo casi real.
- Moderación y triaje de comentarios: al ser un modelo de 162,8 M de parámetros y 0,7 GB, puede desplegarse en CPU para prefiltrar comentarios negativos antes de una revisión humana.
- Análisis de reseñas literarias: el ajuste con LABR permite clasificar opiniones de lectores sobre libros en árabe para sistemas de recomendación.
- Enrutado en atención al cliente: clasificar la polaridad de un mensaje entrante para derivarlo a un agente humano o a un flujo automatizado según el tono.
- Investigación en procesamiento de árabe dialectal: el checkpoint y el repositorio de benchmark asociado sirven como línea base reproducible para comparar clasificadores de sentimiento en MSA y dialectos.
- Extracción de señal para estudios de opinión política: con la advertencia de la propia model card de que los tuits políticos son una fuente frecuente de error, puede usarse solo como señal auxiliar, nunca como clasificador definitivo.

## Benchmarks y rendimiento

Resultados de macro-F1 publicados en la model card sobre particiones de test reservadas, con una sola semilla:

| Dataset | Macro-F1 |
|---|---|
| AJGT | 0,933 |
| ASTD | 0,869 |
| HARD (sin descriptor inicial) | 0,908 |
| LABR | 0,864 |

No se han publicado en la información disponible comparaciones con otros modelos en estos mismos conjuntos, ni resultados en MMLU, HumanEval, GSM8K u otros benchmarks generales, que no aplican a un encoder de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,65 GB solo para pesos; en fp16, alrededor de 0,33 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas con suficiente memoria compartida.
- Ejecutable en CPU para lotes pequeños; el cuello de botella será el throughput, no la memoria.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference o servicios de clasificación de Hugging Face; no se documentan pesos GGUF ni soporte verificado en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muhamm-dk/arabic-sentiment-marbert-combined | 162,8 M | no disponible | Clasificación binaria, MSA + dialectos egipcio/jordano | other | Hugging Face, 35 descargas |
| UBC-NLP/MARBERT (base) | ~163 M | 512 tokens (dato general, no confirmado en la ficha) | Encoder preentrenado, sin cabeza de sentimiento | no disponible en esta ficha | Hugging Face |
| Alternativas específicas de sentimiento árabe | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros clasificadores de sentimiento árabe en la información proporcionada.

## Limitaciones y advertencias

- Solo clasificación binaria: no existe clase neutra, por lo que el texto neutral o factual se fuerza a una polaridad.
- Los conjuntos de test son pequeños (AJGT 180 ejemplos, ASTD 242), de modo que diferencias de pocos puntos quedan dentro del ruido estadístico.
- Los tuits políticos son una fuente frecuente de error: la etiqueta suele seguir la postura del autor y no la formulación del texto.
- Las reseñas mixtas ("bueno pero...") son una fuente habitual de fallo.
- No se ha evaluado en dialectos del Golfo ni del Magreb, ni en otros dominios distintos de los cuatro corpus de entrenamiento.
- Los cuatro conjuntos de entrenamiento no declaran licencia; el autor recomienda uso exclusivamente de investigación y verificar las fuentes originales antes de cualquier uso comercial.
- La licencia del modelo es "other", sin términos comerciales explícitos en la información disponible.
- Riesgo de sesgo derivado de los corpus de origen: predominio de registros de reseñas y tuits, con posible sobrerrepresentación de ciertos dialectos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas confiadas en texto ambiguo o irónico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhamm-dk/arabic-sentiment-marbert-combined
- Repositorio de código, benchmark y análisis de errores: https://github.com/Muhamm-dk/arabic-sentiment-benchmark
- Modelo base MARBERT: https://huggingface.co/UBC-NLP/MARBERT
