# ajrayman/narcissism_continuous

## Resumen

`narcissism_continuous` es un modelo de regresion textual fine-tuneado sobre `roberta-base` (FacebookAI) que asigna una puntuacion continua de narcisismo a un texto de entrada. Lo desarrolla el usuario `ajrayman` y forma parte de una serie de modelos dedicados a rasgos de la triada oscura (narcisismo, maquiavelismo y modestia), todos con la misma arquitectura base y enfoque de entrenamiento. El modelo resuelve el problema de cuantificar automaticamente rasgos psicologicos a partir de lenguaje natural, algo relevante para investigacion en psicologia computacional y analisis de discurso.

La arquitectura es un transformer encoder-only tipo RoBERTa con 124,6 millones de parametros y una cabeza de regresion en lugar de clasificacion, lo que explica las metricas de evaluacion (RMSE, MAE, correlacion). La ventana de contexto hereda el limite de 512 tokens de RoBERTa-base. El modelo se publico en agosto de 2024 bajo licencia MIT, lo que permite uso comercial sin restricciones, aunque su adopcion actual es minima (3 descargas, 0 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only) con cabeza de regresion |
| Parametros totales | 124.646.401 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 en safetensors) |
| Idiomas soportados | no disponible (el modelo base RoBERTa se entreno principalmente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder-only de 12 capas, 12 cabezas de atencion y 768 dimensiones ocultas, con 124,6 millones de parametros. Sobre esta base se anade una cabeza de regresion lineal que produce una salida continua, en lugar de la cabeza de clasificacion tipica. El entrenamiento se realizo durante 8 epocas con un learning rate de 2e-05, batch size de 32, scheduler lineal con warmup del 6% y optimizador Adam (beta1=0.9, beta2=0.999). El dataset de entrenamiento no se documenta en la model card (campo "None" y "More information needed"), por lo que se desconoce la composicion, tamano y procedencia de los datos. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

La metrica de correlacion (Corr = 0.3817 en validacion) sugiere que el modelo captura una senal moderada del rasgo objetivo, pero esta lejos de una correlacion fuerte. El RMSE de 0.2585 y MAE de 0.2115 indican un error absoluto medio relativamente bajo en la escala de puntuacion, aunque sin conocer el rango exacto de la variable objetivo es dificil interpretar estos valores con precision.

## Capacidades

- Regresion textual: asigna una puntuacion continua de narcisismo a un texto de entrada.
- Clasificacion de texto: al ser un modelo de `text-classification` en el pipeline de HuggingFace, puede integrarse con la API estandar de transformers.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en infraestructura de inferencia gestionada.
- Capacidades multilingues: no disponibles; el modelo base RoBERTa se entreno predominantemente en ingles, por lo que el rendimiento en otros idiomas es incierto.
- Tool calling y agentes: no soportado; es un modelo encoder-only sin capacidad de generacion autoregresiva.
- Vision y audio: no soportado.

## Casos de uso

- Investigacion en psicologia computacional: el modelo puede puntuar automaticamente transcripciones de entrevistas o respuestas abiertas en estudios sobre rasgos de personalidad, reduciendo el tiempo de codificacion manual por parte de investigadores.
- Analisis de discurso politico: permite cuantificar la retorica narcisista en discursos publicos o debates, facilitando estudios comparativos entre figuras politicas o evolucion temporal del lenguaje.
- Analisis de redes sociales: puede procesar publicaciones de plataformas como X o foros para detectar patrones linguisticos asociados al narcisismo en estudios observacionales de comportamiento online.
- Screening en investigacion de recursos humanos (con cautela): como herramienta complementaria para analizar el lenguaje en evaluaciones de desempeno o entrevistas, siempre con supervisión humana y sin decisiones automatizadas.
- Estudios de marketing y comportamiento de marca: analizar el lenguaje de comunicaciones corporativas o de influencers para caracterizar el tono narcisista en campanas publicitarias.
- Educacion y divulgacion: como demostracion didactica de fine-tuning de transformers para tareas de regresion psicologica, util en cursos de NLP aplicado.
- Investigacion sobre la triada oscura: combinado con los modelos hermanos (`machiavellianism_continuous` y `Modesty_continuous`), permite construir perfiles completos de los tres rasgos a partir del mismo corpus textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la informacion disponible. El modelo-index de la model card contiene una lista de resultados vacia. Como referencia, el autor declara las siguientes metricas de evaluacion durante el entrenamiento:

| Epoca | Validation Loss | RMSE | MAE | Corr |
|:-----:|:---------------:|:----:|:---:|:----:|
| 1.0 | 0.0690 | 0.2627 | 0.2160 | 0.3604 |
| 2.0 | 0.0645 | 0.2540 | 0.2119 | 0.3685 |
| 3.0 | 0.0651 | 0.2552 | 0.2098 | 0.3961 |
| 4.0 | 0.0668 | 0.2585 | 0.2115 | 0.3817 |

Estos valores corresponden a la evaluacion final del modelo tras 8 epocas (los datos de las epocas 5-8 no se muestran en la tabla publicada). La correlacion maxima se alcanza en la epoca 3 (0.3961) y desciende ligeramente en la epoca 4, lo que sugiere un posible sobreajuste a partir de ese punto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en fp32 (124M parametros); con cuantizacion a int8 podria reducirse a unos 130 MB.
- GPU recomendadas: cualquier GPU consumer con 4 GB de VRAM o mas es suficiente (GTX 1660, RTX 3060, RTX 4090). Tambien es viable inferencia solo en CPU con latencias de decenas de milisegundos por texto corto.
- Compatibilidad con consumer GPUs: si, el modelo cabe sin problemas en cualquier GPU moderna.
- Opciones de despliegue: pipeline de transformers de HuggingFace, API de inference endpoints, vLLM (aunque al ser encoder-only el beneficio es limitado), o exportacion a ONNX para servir con TensorRT u ONNX Runtime.
- Latencia estimada: para un texto de 512 tokens en una GPU consumer, la inferencia deberia completarse en menos de 50 ms; en CPU, entre 200 y 500 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ajrayman/narcissism_continuous` | 124,6M | 512 tokens | Regresion de narcisismo | MIT | HuggingFace |
| `ajrayman/machiavellianism_continuous` | 124,6M (estimado) | 512 tokens | Regresion de maquiavelismo | MIT | HuggingFace |
| `ajrayman/Modesty_continuous` | 124,6M (estimado) | 512 tokens | Regresion de modestia | MIT | HuggingFace |
| `FacebookAI/roberta-base` (modelo base) | 124,6M | 512 tokens | MLM / clasificacion generica | MIT | HuggingFace |

Los tres modelos del autor comparten la misma arquitectura base y enfoque de entrenamiento, diferenciandose solo en el rasgo psicologico objetivo. Frente al modelo base, `narcissism_continuous` anade la cabeza de regresion y el fine-tuning especifico, por lo que no es directamente comparable en tareas generales de NLP.

## Limitaciones y advertencias

- Datos de entrenamiento no documentados: la model card no especifica el dataset utilizado, lo que impide evaluar posibles sesgos en la recopilacion de textos de entrenamiento.
- Sesgo linguistico: al derivar de RoBERTa, entrenado principalmente en ingles, el rendimiento en otros idiomas es impredecible y probablemente deficiente.
- Correlacion moderada: con una correlacion de 0.38 en validacion, el modelo captura solo una parte de la varianza del rasgo objetivo; no debe utilizarse como herramienta diagnostica.
- Riesgo de alucinacion y falsos positivos: como cualquier modelo de NLP, puede producir puntuaciones extremas en textos que no contienen indicios reales de narcisismo.
- Contexto limitado a 512 tokens: no puede procesar documentos largos de una sola pasada; textos extensos requieren truncamiento o estrategias de ventana deslizante.
- Uso etico: la evaluacion automatica de rasgos psicologicos de personas reales plantea riesgos de estigmatizacion y discriminacion; no debe emplearse para tomar decisiones sobre individuos sin supervision humana cualificada.
- Adopcion minima: con solo 3 descargas y 0 likes, el modelo no tiene historial de uso en produccion ni validacion por parte de la comunidad.
- Tamano del repositorio anomalo: el repo ocupa 5.4 GB, muy por encima de los ~500 MB esperables para un modelo de 124M de parametros, lo que sugiere la presencia de artefactos de entrenamiento o datos adicionales no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajrayman/narcissism_continuous
- Modelo base (RoBERTa): https://huggingface.co/FacebookAI/roberta-base
- Modelo relacionado (maquiavelismo): https://huggingface.co/ajrayman/machiavellianism_continuous
- Modelo relacionado (modestia): https://huggingface.co/ajrayman/Modesty_continuous
- Articulo sobre deteccion de NPD con NLP: https://ieeexplore.ieee.org/document/11215788
- Estudio sobre rasgos oscuros y uso de IA: https://thenextweb.com/news/dark-traits-problematic-ai-use-psychology
