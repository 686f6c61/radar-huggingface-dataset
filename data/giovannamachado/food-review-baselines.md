# giovannamachado/food-review-baselines

## Resumen

`food-review-baselines` es un conjunto de dos clasificadores de texto basados en scikit-learn desarrollados por Giovanna Machado para la tarea de análisis de reseñas gastronómicas en portugués de Brasil. El repositorio contiene dos modelos independientes: uno de clasificación de aspecto y otro de clasificación de sentimiento, ambos construidos con una representación TF-IDF que combina n-gramas de palabra (1-2) y de carácter `char_wb` (2-5) alimentando una regresión logística. No se trata de un modelo de lenguaje neuronal, sino de una línea base clásica de procesamiento de lenguaje natural.

La relevancia del proyecto es metodológica más que de rendimiento: el autor lo publica explícitamente como un piso de referencia que un futuro ajuste fino con LoRA (aún no ejecutado) debe superar. Los artefactos son extremadamente ligeros (unos 90 KB) y la inferencia ronda los 56 ms por cada 1000 textos en una sola CPU, lo que lo convierte en un punto de comparación barato y reproducible.

El entrenamiento se realizó sobre un conjunto de datos sintético (`food-review-synthetic-ptbr`), lo que acota estrictamente el alcance: el modelo sirve para demostración y evaluación de pipelines, no para tomar decisiones sobre reseñas reales. La licencia es MIT y los pesos se distribuyen en formato joblib de scikit-learn.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (palabra 1-2 + char_wb 2-5) + regresion logistica (scikit-learn) |
| Parametros totales | no disponible (modelo lineal; artefactos de ~90 KB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (bag-of-words sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (pesos en coma flotante estandar de scikit-learn) |
| Idiomas soportados | portugues (pt, pt-BR) |
| Licencia | MIT |
| Formato de pesos | joblib (serializacion de scikit-learn) |

## Arquitectura y entrenamiento

Cada clasificador es un pipeline clásico de scikit-learn: vectorizacion TF-IDF con dos extractores en paralelo, n-gramas de palabra de orden 1 a 2 y n-gramas de carácter `char_wb` de orden 2 a 5, seguida de una regresion logistica. No hay transformer, ni atencion, ni capas neuronales; el modelo aprende pesos lineales sobre las dimensiones del vocabulario.

Los datos de entrenamiento provienen del dataset sintetico `food-review-synthetic-ptbr`, generado por el propio autor. No se especifica el numero de tokens ni el volumen de ejemplos en la informacion disponible. No consta RLHF, DPO ni ningún proceso de alineacion. La innovacion destacable del repositorio no es arquitectonica sino evaluativa: el autor separa un split in-distribution (`test_id`) de un split out-of-distribution (`test_ood`) y demuestra que la puntuacion perfecta en el primero es un artefacto de compartir gramatica con el entrenamiento, mientras que el split OOD revela el comportamiento real del modelo.

## Capacidades

- Clasificacion de sentimiento en resenas gastronomicas en portugues de Brasil (positivo, negativo u otras etiquetas definidas en el dataset).
- Clasificacion de aspecto: identificacion de la dimension o atributo de la resena al que se refiere el texto.
- Procesamiento de texto corto a moderado mediante representaciones dispersas TF-IDF.
- Inferencia de muy baja latencia en CPU sin necesidad de GPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo de razonamiento explicito (thinking mode).
- No procesa vision ni audio.
- Capacidad multilingue limitada al portugues; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Linea base en experimentos de NLP: sirve para fijar el piso de rendimiento antes de entrenar un transformer ajustado con LoRA, tal y como plantea el autor en el repositorio del pipeline.
- Clasificacion rapida de resenas en un prototipo: con 56 ms por cada 1000 textos en una CPU, permite etiquetar lotes pequenos durante el desarrollo de un producto sin infraestructura de GPU.
- Filtrado previo en un pipeline de datos: descartar o priorizar resenas antes de pasarlas a un modelo mayor, reduciendo coste computacional en etapas posteriores.
- Deteccion de regresiones en pipelines de NLP: al ser reproducible con dos comandos, sirve como prueba de humo para verificar que los cambios en la ingesta de datos no rompen el formato esperado.
- Docencia y demostracion de evaluacion OOD: el contraste entre macro-F1 de 1.000 en `test_id` y 0.413 en `test_ood` para sentimiento es un caso practico para explicar sobreajuste y calibracion (ECE 0.29).
- Analisis de aspectos en resenas de restaurantes a escala de prototipo: separar quejas sobre comida, servicio o precio en un conjunto controlado de textos en portugues.
- Benchmark de calibracion: util para comparar curvas de fiabilidad de modelos lineales frente a modelos neuronales bajo cambio de distribucion.

## Benchmarks y rendimiento

| Tarea | test_id (macro-F1) | test_ood (macro-F1) |
|---|---|---|
| Aspecto | 1.000 | 0.662 |
| Sentimiento | 1.000 | 0.413 (ECE 0.29) |

El autor senala que el 1.000 in-distribution no discrimina modelos porque la gramatica del split de test comparte estructura con el de entrenamiento. En el split OOD el modelo de sentimiento cae a 0.413 y muestra un F1 de 0.25 especificamente en casos de negacion, lo que evidencia que los modelos bag-of-words memorizan vocabulario en lugar de generalizar. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna; el modelo no aprovecha aceleracion por hardware.
- Cabe en cualquier GPU consumer, pero no es necesario usarla.
- Despliegue: scikit-learn con joblib para cargar los artefactos; reproducible mediante `python scripts/make_data.py && python scripts/run_baselines.py`.
- Latencia: aproximadamente 56 ms por cada 1000 textos en una sola CPU, sin batching especial.
- Tamano de los artefactos: alrededor de 90 KB en total.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| food-review-baselines | TF-IDF + regresion logistica | no disponible (~90 KB) | no aplica | macro-F1 OOD 0.662 (aspecto) / 0.413 (sentimiento) | MIT |
| Fine-tuning LoRA sobre LLM (previsto por el autor) | Transformer ajustado | no disponible | no disponible | no ejecutado aun | no disponible |
| Clasificadores lineales genericos de scikit-learn | TF-IDF + lineal | variable | no aplica | no disponible | depende del modelo |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos; el autor declara explicitamente que esta fuera de alcance cualquier decision sobre resenas reales.
- El rendimiento in-distribution de 1.000 es enganoso y no debe usarse como metrica de calidad.
- Colapso en out-of-distribution: F1 de 0.413 en sentimiento y 0.25 en casos de negacion, por memorizacion de vocabulario.
- Mala calibracion bajo cambio de distribucion (ECE de 0.29), lo que invalida el uso de las probabilidades como confianza fiable.
- Limitado al portugues de Brasil; no se ha evaluado en otras variantes del portugues ni en otros idiomas.
- No apto para produccion en entornos con resenas reales sin un reentrenamiento y una evaluacion OOD rigurosa.
- Licencia MIT: permite uso comercial, pero la naturaleza sintetica de los datos y las limitaciones anteriores desaconsejan ese uso.
- Sin soporte de contexto largo, razonamiento ni herramientas; no es un sustituto de un LLM para tareas generativas.

## Enlaces

- HuggingFace: https://huggingface.co/giovannamachado/food-review-baselines
- Dataset sintetico: https://huggingface.co/datasets/giovannamachado/food-review-synthetic-ptbr
- Repositorio con pipeline completo (LoRA, zero-shot, tests): https://github.com/giovannamachado/food-review-llm
