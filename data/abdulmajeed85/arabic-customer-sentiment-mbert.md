# abdulmajeed85/arabic-customer-sentiment-mbert

## Resumen

`abdulmajeed85/arabic-customer-sentiment-mbert` es un modelo de clasificación de sentimiento en árabe obtenido mediante ajuste fino completo (*full fine-tuning*) de `google-bert/bert-base-multilingual-cased`. Lo desarrolla el usuario abdulmajeed85 como proyecto final del curso Hugging Face Fundamentals (Track 1: analizador de sentimiento de reseñas de servicio). Resuelve una tarea concreta de tres clases (negativo, neutro, positivo) sobre texto árabe, incluyendo dialecto saudí y árabe estándar moderno (MSA).

Arquitectónicamente es un transformer encoder BERT estándar: 12 capas, tamaño oculto de 768, 12 cabezas de atención y un vocabulario de 119.547 tokens, sobre el que se añade una cabeza lineal (768 → 3) aplicada a la representación pooled del token `[CLS]`. El modelo total tiene 177.855.747 parámetros y una longitud máxima de secuencia de 128 tokens durante el entrenamiento. No es un modelo generativo ni soporta tool calling: es un clasificador discriminativo de una sola pasada.

Su relevancia es acotada pero clara: demuestra que un ajuste fino ligero (3,3 minutos en una Tesla T4) sobre mBERT supera de forma estadísticamente significativa tanto a mBERT sin entrenar (macro-F1 0,3425) como a una línea base clásica TF-IDF + regresión logística (macro-F1 0,4612), alcanzando un macro-F1 de 0,5739 en el conjunto de test. Es un punto de partida útil para tareas de análisis de opinión en árabe, no un modelo listo para producción de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, hidden 768, 12 cabezas) + cabeza lineal de clasificación |
| Parametros totales | 177.855.747 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (no se documentan pesos GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Árabe (`ar`); el modelo base cubre 104 idiomas, pero el ajuste fino es solo en árabe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato estándar de `Trainer`/transformers; no se detalla explícitamente en la model card) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-multilingual-cased`, un encoder transformer con atención bidireccional completa, preentrenado con objetivos MLM y NSP sobre 104 idiomas. El ajuste fino actualiza todos los parámetros (no es LoRA ni adaptadores) y añade una cabeza de clasificación lineal de 768 a 3 dimensiones sobre el `[CLS]` pooled. El preprocesado aplicado al texto incluye normalización Unicode NFKC, eliminación de caracteres invisibles y URLs, normalización de menciones a `@user` y colapso de espacios en blanco.

Los datos de entrenamiento provienen exclusivamente de la configuración `arabic` del dataset `cardiffnlp/tweet_sentiment_multilingual` (fuente original SemEval-2017 Task 4), con 1.828 ejemplos de entrenamiento tras limpieza de fugas, 324 de validación y 870 de test (test intacto). Se entrenaron dos experimentos que solo diferían en la tasa de aprendizaje (2e-05 y 5e-05), con batch efectivo de 16, 4 épocas, weight decay 0,01, warmup de 46 pasos (10 %), scheduler lineal, precisión mixta fp16, semilla 42 y hardware Tesla T4. La selección del mejor modelo se hizo únicamente sobre macro-F1 de validación, sin tocar el test. No se aplicó RLHF ni DPO (no procede en un clasificador). La innovación técnica es mínima: rigor metodológico en la separación train/val/test y verificación estadística mediante bootstrap emparejado con 1.000 remuestreos.

## Capacidades

- Clasificación de sentimiento en árabe en tres clases: negativo (0), neutro (1) y positivo (2).
- Procesamiento de texto árabe en árabe estándar moderno (MSA) y dialecto saudí, según la evaluación cualitativa del propio autor.
- Manejo de texto tipo redes sociales: el preprocesado normaliza menciones, URLs y caracteres invisibles, lo que lo hace adecuado para tuits y reseñas cortas.
- Salida de probabilidades por clase vía `pipeline("text-classification")` de transformers.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene modo thinking, visión ni audio.
- Capacidad multilingüe limitada al árabe en la práctica: el ajuste fino se hizo solo con datos en árabe y no se evaluó en otros idiomas.
- Longitud de entrada limitada a 128 tokens, suficiente para tuits y frases cortas, insuficiente para reseñas largas.

## Casos de uso

- Monitorización de opiniones en redes sociales en árabe: clasificar tuits y comentarios en negativo/neutro/positivo para alimentar paneles de reputación de marca. El modelo está entrenado sobre tuits y su preprocesado está diseñado para ese dominio.
- Triaje de reseñas de clientes en árabe: enrutar automáticamente las reseñas negativas a un equipo de soporte y las positivas a marketing, usando la clase predicha como etiqueta de enrutamiento.
- Análisis de sentimiento en encuestas de satisfacción con respuestas abiertas cortas: el límite de 128 tokens encaja con respuestas de una o dos frases típicas de formularios.
- Evaluación de sentimiento en el sector seguros: el autor incluyó una evaluación cualitativa con 40 frases sintéticas de contexto asegurador (MSA y dialecto saudí), lo que indica aplicabilidad a reclamaciones y comentarios de pólizas, aunque con rendimiento out-of-domain inferior.
- Filtrado previo en pipelines de atención al cliente: usar el clasificador como primera etapa para detectar clientes insatisfechos antes de pasarlos a un modelo generativo o a un agente humano.
- Etiquetado asistido de corpus en árabe: preanotar grandes volúmenes de texto con el clasificador y revisar manualmente solo los casos de baja confianza, reduciendo el coste de anotación.
- Investigación académica y docencia: servir como línea base reproducible para experimentos de análisis de sentimiento en árabe, dado que el autor documenta hiperparámetros, particiones y métricas con detalle.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de 870 tuits árabes (idéntico para los tres modelos):

| Modelo | Accuracy | Precision (macro) | Recall (macro) | Macro-F1 |
|---|---|---|---|---|
| A: mBERT sin ajuste fino | 0,4034 | 0,4665 | 0,4034 | 0,3425 |
| B: TF-IDF + LogReg | 0,4655 | 0,4683 | 0,4655 | 0,4612 |
| C: mBERT ajustado (exp1) | 0,5724 | 0,5784 | 0,5724 | 0,5739 |

Resultados por clase del modelo ajustado (test):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| negative | 0,6084 | 0,6000 | 0,6042 | 290 |
| neutral | 0,4954 | 0,5621 | 0,5267 | 290 |
| positive | 0,6314 | 0,5552 | 0,5908 | 290 |

Diferencia de macro-F1 con bootstrap emparejado (95 % CI): C − A = +0,2312 [+0,1888, +0,2718]; C − B = +0,1127 [+0,0704, +0,1530].

Resultados de validación durante el entrenamiento:

| Experimento | LR | Batch efectivo | Mejor época | Val macro-F1 | Val accuracy | Tiempo (min) |
|---|---|---|---|---|---|---|
| exp1 | 2e-05 | 16 | 4 | 0,6529 | 0,6543 | 3,3 |
| exp2 | 5e-05 | 16 | 4 | 0,6475 | 0,6481 | 2,9 |

Evaluación out-of-domain con 40 frases sintéticas de seguros (13 positivas, 14 negativas, 13 neutras): el modelo A obtiene accuracy 0,3250 y macro-F1 0,2846 [0,15, 0,42]; los resultados completos de los modelos B y C no están disponibles en la información proporcionada (la model card aparece truncada en ese punto).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB para los 177,9 M de parámetros (4 bytes por parámetro).
- VRAM estimada en fp16: aproximadamente 0,36 GB, más overhead de activaciones y tokenizer.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU recomendadas para entrenamiento o fine-tuning: Tesla T4 (la usada por el autor, 3,3 minutos por experimento), o cualquier GPU con al menos 8 GB de VRAM.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `TextClassificationPipeline`; también es compatible con TorchScript y con exportación a ONNX. No se documenta soporte de vLLM, llama.cpp ni Ollama (no procede para un encoder BERT de clasificación, aunque llama.cpp puede ejecutar BERT vía GGUF).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por petición en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Macro-F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (mBERT ajustado) | 177,9 M | 128 | Sentimiento árabe 3 clases | 0,5739 | Apache-2.0 | HuggingFace |
| mBERT sin ajuste fino (base) | 177,9 M | 512 (nativo) | Representaciones multilingües | 0,3425 | Apache-2.0 | HuggingFace |
| TF-IDF + LogReg (línea base) | no aplica | no aplica | Sentimiento árabe 3 clases | 0,4612 | no aplica | No es un modelo publicado |
| MARBERT / CAMeLBERT (referencia) | no disponible en la información | no disponible | Sentimiento árabe | no disponible | no disponible | HuggingFace (no evaluado en este proyecto) |

No se han publicado comparaciones con modelos específicos de árabe como MARBERT o CAMeLBERT en la información disponible; la única comparación documentada es contra mBERT sin ajustar y contra TF-IDF + regresión logística.

## Limitaciones y advertencias

- Rendimiento moderado: macro-F1 de 0,5739 en test indica que el modelo confunde con frecuencia las clases, especialmente la neutra (F1 0,5267), que es la más difícil.
- Evaluación out-of-domain limitada: en las 40 frases sintéticas de seguros el rendimiento cae (accuracy 0,3250 para mBERT sin ajustar; los resultados del modelo ajustado en ese conjunto no están completos en la información disponible), lo que sugiere poca generalización fuera del dominio de tuits.
- Entrenado solo con tuits árabes (SemEval-2017 Task 4): puede no transferir bien a reseñas formales, textos largos o dominios especializados como seguros, banca o atención al cliente formal.
- Límite de 128 tokens: no admite documentos largos ni conversaciones multi-turno; textos más largos se truncan.
- Sesgos: no se documenta ningún análisis de sesgos por dialecto, género o región; el dataset original de tuits puede estar sesgado hacia ciertos dialectos o temas.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí hay riesgo de clasificaciones erróneas con alta confianza en textos ambiguos o irónicos.
- Restricciones de licencia: el modelo es Apache-2.0, pero los datos de entrenamiento son CC BY 3.0 (requiere atribución) y los tuits subyacentes están sujetos a los términos de servicio de Twitter (X). El modelo no redistribuye los textos de los tuits.
- Proyecto de curso: no hay evidencia de validación en producción, ni de mantenimiento, ni de evaluación con datos reales de clientes; las 40 frases de seguros son sintéticas y escritas por el equipo.
- Sin soporte documentado de cuantización GGUF ni de despliegue en llama.cpp/Ollama; para producción habría que exportarlo y validarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdulmajeed85/arabic-customer-sentiment-mbert
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/cardiffnlp/tweet_sentiment_multilingual
- SemEval-2017 Task 4 (origen de los datos): https://alt.qcri.org/semeval2017/task4/
- Curso Hugging Face Fundamentals (contexto del proyecto): https://huggingface.co/learn
- Repositorio de transformers: https://github.com/huggingface/transformers
