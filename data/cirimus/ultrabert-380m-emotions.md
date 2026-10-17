# cirimus/ultrabert-380M-emotions

## Resumen

UltraBERT-380M-emotions es un modelo de clasificación de emociones en texto en inglés, publicado por el usuario cirimus (Enric Junqué de Fortuny) y obtenido por ajuste fino del encoder dmis-lab/UltraBERT-380M sobre el dataset cirimus/super-emotion. Devuelve una distribución de probabilidad sobre siete etiquetas: joy, sadness, anger, fear, love, neutral y surprise. Con 377.544.711 parámetros (377,5 M) y pesos en safetensors, es un modelo puramente discriminativo: no genera texto ni mantiene conversaciones.

Su relevancia práctica está en la relación entre tamaño y coste: al ser un encoder de menos de 400 M de parámetros, se puede desplegar en una única GPU de consumo o incluso en CPU, con latencias aptas para procesar grandes volúmenes de comentarios, reseñas o tickets. El autor reporta un F1 macro de 0,829 y un MCC macro de 0,812 sobre un conjunto de test de 51.950 muestras, con buen rendimiento en sadness y joy (F1 0,935 y 0,933) y peor en neutral (F1 0,642).

El modelo se distribuye bajo licencia Apache 2.0, solo soporta inglés y requiere `transformers>=5.2` con `trust_remote_code=True` porque incluye código propio. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de sus resultados más allá de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (UltraBERT-380M); requiere codigo personalizado (`custom_code`) |
| Parametros totales | 377.544.711 (377,5 M), dato real de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica el maximo de tokens) |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos safetensors en precision completa, sin versiones GGUF, AWQ, GPTQ ni ONNX publicadas |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,5 GB, incluye imagen de matriz de confusion y codigo custom) |
| Tarea | clasificacion de texto multietiqueta (7 clases) |
| Etiquetas | joy, sadness, anger, fear, love, neutral, surprise |
| Modelo base | dmis-lab/UltraBERT-380M |
| Dataset de ajuste | cirimus/super-emotion |
| Framework | Hugging Face Transformers, PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo BERT heredada de UltraBERT-380M, con 377,5 M de parámetros y una cabeza de clasificación de 7 salidas. No es un modelo generativo ni un híbrido SSM: se limita a producir logits por clase para una secuencia de entrada. El ajuste fino se realizó durante 2 épocas con AdamW, learning rate de 2e-5, batch size de 16, weight decay de 0,01 y un scheduler de decaimiento coseno con warmup, sobre el dataset Super Emotion, agregado a partir de varias fuentes. No se documenta uso de RLHF, DPO ni decodificación especulativa, algo esperable en un clasificador.

La model card no detalla el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de su nombre y de las cifras de soporte por clase en test (37.734 muestras de neutral hasta 2.064 de surprise). El autor describe el dataset como agregado de múltiples fuentes, con posibles sesgos de anotación y desbalance de clases. El entrenamiento se llevó a cabo en una NVIDIA DGX Spark (GB10) durante aproximadamente 12 horas, con una huella estimada de 0,71 kg de CO2.

Hay una inconsistencia menor en la documentación: la sección "Model Details" describe el problema como "multi-label classification", mientras que los tags y el pipeline (`text-classification` con `top_k`) corresponden a una clasificación multiclase con softmax sobre 7 etiquetas mutuamente excluyentes. Conviene verificar el comportamiento real antes de integrarlo en producción.

## Capacidades

- Clasificación de emociones en inglés sobre una única frase, con siete etiquetas: joy, sadness, anger, fear, love, neutral y surprise.
- Salida de puntuaciones de confianza por etiqueta; el ejemplo oficial usa `top_k=5` para recuperar las probabilidades de todas las clases.
- Uso directo mediante `pipeline("text-classification")` de Transformers, con `trust_remote_code=True`.
- No genera texto: no hay capacidad de completar, resumir, traducir ni responder preguntas.
- No soporta tool calling ni function calling.
- No soporta uso agente ni razonamiento multi-paso.
- No soporta visión, audio ni modalidades distintas de texto.
- Multilingüismo: no disponible; el modelo está etiquetado únicamente como inglés, por lo que no se debe asumir transferencia a castellano.
- No dispone de modo "thinking" ni de cadena de razonamiento explícita.
- No se documenta soporte de lotes con atención enmascarada más allá de lo estándar del pipeline.

## Casos de uso

- Moderación de comunidades y redes sociales: clasificar comentarios entrantes y marcar automáticamente los que puntúan alto en anger o fear para revisión humana. El coste por inferencia es bajo y permite procesar millones de mensajes diarios en una sola GPU.
- Social listening de marca: analizar menciones en inglés y agregar la distribución emocional por día, producto o campaña. La etiqueta neutral, aunque con precisión de 0,560, sirve como clase de descarte para filtrar ruido antes de un análisis más fino.
- Análisis de encuestas de cliente y NPS: etiquetar las respuestas abiertas para separar insatisfacción (sadness, anger) de entusiasmo (joy, love) y priorizar las cuentas con riesgo de abandono.
- Enrutado de tickets de soporte: usar la emoción dominante como señal de urgencia; por ejemplo, enviar a cola prioritaria los tickets con anger alto y a cola estándar los neutrales. Requiere umbrales calibrados con datos propios.
- Investigación psicológica y de comportamiento a gran escala: etiquetar corpus de decenas de miles de frases con métricas macro reproducidas en la model card (51.950 muestras de test), útil para estudios longitudinales sobre estado de ánimo en texto.
- Detección temprana de malestar en líneas de ayuda o foros de salud mental: señales de fear y sadness como alerta previa para derivación a un profesional, siempre con revisión humana y sin decisiones automatizadas.
- Enriquecimiento de datasets para otros modelos: etiquetado débil (weak labeling) de grandes volúmenes de texto en inglés para entrenar clasificadores posteriores o sistemas de recomendación de contenido.
- Análisis de reseñas de producto: segmentar opiniones por emoción para detectar si la insatisfacción se concentra en envío, atención o calidad del producto.
- Segmentación de audiencias para marketing: agrupar respuestas emocionales de campañas y medir el impacto afectivo de un creatividad frente a otra.
- Filtrado previo en pipelines de análisis de sentimiento: usar las siete clases como capa intermedia más granular que un simple positivo/negativo antes de un modelo más grande y caro.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el conjunto de test conjunto (51.950 muestras). La columna "Accuracy" aparece por clase tal cual en la model card y probablemente corresponde a una métrica uno-contra-el-resto; conviene tratarla con cautela.

| Clase / metrica | Accuracy | Precision | Recall | F1 | MCC | Support |
|---|---|---|---|---|---|---|
| macro avg | 0,965 | 0,873 | 0,799 | 0,829 | 0,812 | 51.950 |
| neutral | 0,940 | 0,560 | 0,752 | 0,642 | 0,618 | 3.734 |
| surprise | 0,981 | 0,856 | 0,622 | 0,721 | 0,721 | 2.064 |
| fear | 0,975 | 0,956 | 0,799 | 0,870 | 0,861 | 5.526 |
| sadness | 0,967 | 0,979 | 0,895 | 0,935 | 0,915 | 13.792 |
| joy | 0,958 | 0,953 | 0,914 | 0,933 | 0,903 | 16.623 |
| anger | 0,963 | 0,919 | 0,835 | 0,875 | 0,855 | 7.993 |
| love | 0,968 | 0,886 | 0,775 | 0,827 | 0,812 | 5.071 |

No se han publicado resultados de benchmarks estandarizados (MMLU, GLUE, SuperGLUE, HumanEval, GSM8K) en la informacion disponible, algo coherente con que se trate de un clasificador de emociones y no de un modelo generativo. Tampoco hay comparaciones con otros clasificadores de emociones en la documentacion proporcionada.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,5 GB, en linea con el tamano del repositorio.
- Pesos en FP16/BF16: aproximadamente 755 MB.
- VRAM estimada para inferencia: entre 1,5 y 3 GB en funcion de la precision, el tamano de lote y la longitud de secuencia; el modelo cabe holgadamente en cualquier GPU de consumo actual.
- GPU compatibles: cualquier GPU con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100 y L40S. En GPUs profesionales no hay ninguna restriccion practica.
- Inferencia en CPU: viable para volumenes moderados, especialmente si se exporta a ONNX Runtime; no se publican conversiones oficiales.
- Opciones de despliegue: `transformers` con `pipeline` (metodo documentado, requiere `transformers>=5.2` y `trust_remote_code=True`), servidor de inferencia propio sobre PyTorch, exportacion manual a ONNX o TorchScript. No es compatible con vLLM, TGI, llama.cpp ni Ollama, porque estos estan orientados a modelos generativos o a formatos GGUF que no se distribuyen.
- Latencia y throughput: no disponibles; la model card no publica mediciones. Dado el tamano, es esperable un throughput alto con lotes grandes en GPU, pero no hay cifras verificables.
- Cuantizacion: no se distribuyen variantes INT8, INT4 ni GGUF; cualquier cuantizacion habria que generarla internamente y validar la perdida de F1.
- Requisito adicional: el uso de `trust_remote_code=True` implica ejecutar codigo del repositorio, por lo que conviene auditar o fijar un commit concreto antes de desplegarlo.

## Comparativa con modelos similares

No hay datos de benchmarks comparables publicados en la informacion disponible para alternativas de clasificacion de emociones. La tabla siguiente recoge solo los campos verificables estructuralmente; el resto se marca como no disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cirimus/ultrabert-380M-emotions | 377,5 M | no disponible | Clasificacion de emociones, 7 clases, ingles | Apache 2.0 | Hugging Face, requiere `trust_remote_code` |
| dmis-lab/UltraBERT-380M (modelo base) | no disponible | no disponible | Encoder general de representaciones | no disponible | Hugging Face |
| Encoders BERT/RoBERTa ajustados a emociones (p. ej. variantes de `distilbert-base-uncased-emotion`) | no disponible | no disponible | Clasificacion de emociones | no disponible | Hugging Face |
| Modelos generativos multilingues tipo Qwen o Llama ajustados para clasificacion | no disponible | no disponible | Clasificacion mediante prompting | no disponible | Hugging Face |

No se dispone de datos de rendimiento de estas alternativas en la informacion proporcionada, por lo que no es posible afirmar que este modelo sea mejor o peor que ellas.

## Limitaciones y advertencias

- Sesgo de datos: el dataset Super Emotion es una agregacion de varias fuentes, con posibles sesgos de anotacion y de distribucion de clases que se trasladan al modelo.
- Clases infrarepresentadas: surprise (2.064 muestras) y neutral (3.734) tienen mucho menos soporte que joy (16.623) o sadness (13.792), lo que se refleja en un recall bajo para surprise (0,622) y love (0,775).
- Precision baja en neutral: 0,560, lo que implica una tasa notable de falsos positivos para esta clase; un texto neutral puede clasificarse como emocional con facilidad.
- Dependencia del contexto: el modelo clasifica frases individuales y, segun el propio autor, no rinde bien en contextos de varias frases.
- Expresiones sutiles o indirectas: el autor advierte explicitamente de fallos ante emociones implicitas, con el ejemplo "I find myself remembering the little things you say, long after you've said them".
- Idioma: solo ingles. No hay evidencia de transferencia al castellano ni a otras lenguas; usarlo con texto en espanol produciria resultados poco fiables.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreinterpretacion, es decir, asignar emociones fuertes a texto neutro o ironico.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base dmis-lab/UltraBERT-380M no se especifica en la informacion disponible y debe verificarse antes de un despliegue comercial.
- Ejecucion de codigo remoto: requiere `trust_remote_code=True`, lo que implica confiar en el codigo del repositorio; en entornos de produccion conviene revisarlo y fijar una revision concreta.
- Dependencia de version: la model card exige `transformers>=5.2`, lo que puede entrar en conflicto con entornos que fijen versiones anteriores.
- Falta de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes que confirmen las metricas reportadas.
- Uso responsable: no debe emplearse como unico criterio en decisiones sensibles (salud mental, moderacion con sanciones o seleccion de personal); se recomienda siempre revision humana.
- Inconsistencia documental: la model card etiqueta el problema como "multi-label" mientras que los tags indican "multi-class"; hay que validar empiricamente si las etiquetas son excluyentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cirimus/ultrabert-380M-emotions
- Modelo base UltraBERT-380M: https://huggingface.co/dmis-lab/UltraBERT-380M
- Dataset Super Emotion: https://huggingface.co/datasets/cirimus/super-emotion
- Demo / coleccion "Frontier BERT Workhorses": https://huggingface.co/spaces/cirimus/emotion-detection
- Imagen de la matriz de confusion: https://huggingface.co/cirimus/ultrabert-380M-emotions/blob/main/confusion_matrix.png
- Banner del dataset: https://huggingface.co/datasets/cirimus/super-emotion/resolve/main/banner.png
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Calculadora de impacto de CO2 citada por el autor: https://mlco2.github.io/impact
- Cita bibliografica del autor: Junqué de Fortuny, Enric (2025), "Emotion and Bias Classification with Modern Encoders"
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente contenido no relacionado.
