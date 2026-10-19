# aabcv/visobert-vsmec-moderation

## Resumen

`aabcv/visobert-vsmec-moderation` es un modelo de clasificación de texto en vietnamita obtenido por ajuste fino (*fine-tuning*) del encoder `uitnlp/visobert` sobre el corpus UIT-VSMEC (*Vietnamese Social Media Emotion Corpus*). Lo publica el usuario aabcv con licencia MIT y resuelve dos tareas acopladas: clasificación de siete emociones (Enjoyment, Disgust, Sadness, Anger, Fear, Surprise, Other) y su proyección a tres polaridades de sentimiento (positivo, negativo, neutro). Sobre esa base, el autor define una tercera función operativa: moderación automática de comentarios tóxicos en una plataforma de vídeo, marcando como sospechoso cualquier comentario cuya probabilidad conjunta de Anger y Disgust sea igual o superior a 0,20.

Arquitectónicamente es un transformer encoder de tipo XLM-RoBERTa (familia de ViSoBERT), con 97.571.335 parámetros reales según el archivo de safetensors y un repositorio de 0,4 GB. No es un modelo generativo ni un modelo de razonamiento: es un clasificador de secuencias con cabeza de 7 etiquetas, pensado para inferencia de baja latencia y coste mínimo. Su relevancia actual es práctica: cubre el hueco de herramientas de moderación específicas para vietnamita, un idioma con poca cobertura en los sistemas de moderación comerciales, y lo hace con un modelo que cabe en CPU.

Las cifras publicadas por el autor son modestas pero honestas: 60,2 % de accuracy en las siete emociones y 72,3 % en tres polaridades sobre 693 muestras de test, con un pipeline de moderación binaria que alcanza 81,5 % de accuracy global y 75,6 % de recall en la clase tóxica. Es un modelo de nicho, de un solo idioma y entrenado sobre un corpus académico pequeno; debe evaluarse como componente de filtrado previo con revisión humana, no como oráculo de moderación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), base ViSoBERT (`uitnlp/visobert`) con cabeza de clasificación de secuencias |
| Parametros totales | 97.571.335 (dato real del archivo safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens por arquitectura XLM-RoBERTa; la model card trunca a `max_length=128` en los ejemplos de uso |
| Tipos de cuantizacion | no se publican pesos cuantizados; al ser un encoder de ~97,5 M de parametros es convertible a int8/ONNX con herramientas estandar |
| Idiomas soportados | vietnamita (`vi`) unicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`, compatible con `text-embeddings-inference` y endpoints) |
| Etiquetas de salida | Enjoyment, Disgust, Sadness, Anger, Fear, Surprise, Other (7 clases) |
| Dataset de entrenamiento | `tridm/UIT-VSMEC` |
| Metrica declarada | F1 y accuracy |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo parte de ViSoBERT, un encoder XLM-RoBERTa adaptado al vietnamita y a texto de redes sociales, y anade una cabeza lineal de clasificación sobre el token `[CLS]` con siete salidas. El ajuste fino se realiza sobre UIT-VSMEC, corpus de comentarios de redes sociales anotados con las siete emociones, del que el autor reporta 693 muestras en el conjunto de test (334 negativas, 193 positivas y 166 neutras tras la proyección a tres polaridades). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus, la presencia de limpieza o normalización del texto vietnamita, ni si hubo una fase de ajuste con RLHF/DPO; en un clasificador de este tamano lo habitual es entrenamiento supervisado con entropía cruzada, pero ese dato no está confirmado por el autor.

La innovación no está en la arquitectura sino en la capa de decisión. El autor define explícitamente una regla de negocio: un comentario se considera tóxico cuando P(Anger) + P(Disgust) ≥ 0,20, umbral que traslada la salida probabilística de siete clases a una decisión binaria de moderación. Esa regla se evalúa con accuracy global, recall de la clase tóxica y precisión de la clase limpia, lo que constituye una calibración orientada a operación (minimizar falsos positivos sobre comentarios sanos) en lugar de a la métrica académica de clasificación multiclase. No se documentan técnicas de decodificación especulativa, atención lineal ni variantes eficientes: es un encoder estándar de atención completa.

## Capacidades

- Clasificación de siete emociones en texto vietnamita de redes sociales: Enjoyment, Disgust, Sadness, Anger, Fear, Surprise y Other.
- Proyección automática a tres polaridades de sentimiento: positivo (Enjoyment), negativo (Sadness, Disgust, Anger, Fear) y neutro (Other, Surprise).
- Moderación binaria de toxicidad mediante la suma de probabilidades de Anger y Disgust con umbral 0,20, pensada para encolar comentarios en un estado `held` antes de su publicación.
- Salida de probabilidades por clase vía `softmax`, lo que permite ajustar el umbral a otros dominios sin reentrenar.
- Integración directa con `transformers` (`pipeline` y `AutoModelForSequenceClassification`), y compatibilidad declarada con `text-embeddings-inference` y endpoints.
- Inferencia rápida y determinista sobre secuencias cortas (hasta 128 tokens en los ejemplos del autor): adecuada para filtrado en línea de alto volumen.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado únicamente para vietnamita.

## Casos de uso

- Moderación previa de comentarios en una plataforma de vídeo: cada comentario se puntúa con el clasificador y, si P(Anger) + P(Disgust) ≥ 0,20, se envía a una cola de revisión (`held`) en lugar de publicarse; el autor reporta 91,2 % de precisión sobre comentarios limpios, lo que reduce a más de la mitad los falsos positivos frente a un umbral ingenuo.
- Triaje de comentarios con sentimiento negativo: usar la etiqueta negativa (Sadness, Disgust, Anger, Fear) para enrutar quejas hacia atención al cliente antes de que escalen, con una latencia de milisegundos por ser un encoder de ~97,5 M de parámetros.
- Analítica de opinión sobre vídeos o productos: agregar las siete emociones por publicación para construir paneles de reacción de audiencia, aprovechando que el modelo distingue matices (Disgust frente a Anger) que un clasificador binario de sentimiento no separa.
- Priorización de feedback docente: el ejemplo de la model card (un comentario de agradecimiento a un profesor) ilustra el uso en plataformas educativas para separar reconocimiento (Enjoyment) de frustración (Anger/Sadness) y dirigir las respuestas del profesorado.
- Investigación en procesamiento de lengua vietnamita: servir como línea base reproducible con licencia MIT para experimentos sobre UIT-VSMEC, comparando contra otros encoders ajustados con los mismos 693 ejemplos de test.
- Filtrado en el borde (edge) o en CPU: al ocupar ~0,4 GB en fp32 y ser convertible a int8, puede desplegarse como microservicio sin GPU para prefiltrar grandes volúmenes de comentarios antes de un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de UIT-VSMEC (693 muestras). No se han publicado comparaciones con otros modelos en la información disponible.

Moderación binaria de toxicidad:

| Metrica | Valor |
|---|---|
| Accuracy global | 81,5 % |
| Recall clase tóxica | 75,6 % |
| Precision clase limpia | 91,2 % |

Clasificación de sentimiento (3 clases):

| Sastifa | Precision | Recall | F1-score | Muestras |
|---|---|---|---|---|
| Negativo | 0,772 | 0,841 | 0,805 | 334 |
| Positivo | 0,668 | 0,679 | 0,674 | 193 |
| Neutro | 0,669 | 0,536 | 0,595 | 166 |
| Accuracy global | | | 72,3 % | 693 |

Clasificación de emociones (7 clases):

| Metrica | Valor |
|---|---|
| Macro F1 | 0,577 |
| Weighted F1 | 0,596 |
| Accuracy | 60,2 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generativos en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en fp32 (97,5 M de parámetros), ~0,2 GB en fp16 y ~0,1 GB en int8, sin contar activaciones ni el tokenizador. Cifras calculadas a partir del número de parámetros, no medidas por el autor.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente (GTX 1650, T4, RTX 3060, RTX 4090, A100, H100). El modelo está sobredimensionado para GPUs de gama alta; su uso natural es CPU o GPU de gama baja.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer de los últimos ocho años, y también en CPU con un solo núcleo para secuencias de 128 tokens.
- Opciones de despliegue: `transformers` (pipeline y `AutoModelForSequenceClassification`), `text-embeddings-inference` (declarado en los tags), endpoints compatibles, exportación a ONNX o TorchScript y cuantización dinámica int8 para servir en CPU.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo. Con 97,5 M de parámetros y secuencias de 128 tokens, la latencia esperada por petición en GPU moderna es de un orden de magnitud de milisegundos, pero ese dato no está confirmado por el autor y debe medirse en el entorno objetivo.
- Requisito de memoria en disco: 0,4 GB de repositorio, lo que permite incluirlo en imágenes de contenedor pequenas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `aabcv/visobert-vsmec-moderation` | 97,5 M | 512 tokens (uso a 128) | Vietnamita | Emociones + sentimiento + toxicidad | MIT | HuggingFace |
| `uitnlp/visobert` (modelo base) | no disponible en la información | no disponible | Vietnamita | Encoder general (representaciones) | no disponible en la información | HuggingFace |
| PhoBERT (VinAI) | no disponible en la información | no disponible | Vietnamita | Encoder general | no disponible en la información | HuggingFace |
| XLM-RoBERTa base (Facebook AI) | no disponible en la información | no disponible | Multilingue (100 idiomas) | Encoder general | no disponible en la información | HuggingFace |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que no es posible afirmar qué alternativa rinde mejor en UIT-VSMEC. La ventaja diferencial de este modelo frente a encoders genéricos es que ya incorpora la cabeza de siete emociones y la regla de moderación calibrada; su desventaja es que solo cubre vietnamita y que su conjunto de evaluación es reducido (693 muestras), lo que limita la significación estadística de las diferencias frente a otras alternativas.

## Limitaciones y advertencias

- Cobertura lingüística única: solo vietnamita. Aplicado a texto en castellano u otros idiomas produce etiquetas sin significado, aunque no falle.
- Corpus pequeno: el test de UIT-VSMEC tiene 693 muestras; la clase positiva (193) y la neutra (166) dan intervalos de confianza amplios, de modo que las diferencias de pocos puntos porcentuales no son concluyentes.
- Rendimiento modesto en la tarea completa: 60,2 % de accuracy y macro F1 de 0,577 en siete emociones, con un F1 de 0,595 en la clase neutra. No es un clasificador de alta precisión.
- Umbral de toxicidad no universal: el corte P(Anger) + P(Disgust) ≥ 0,20 está calibrado sobre un corpus concreto de redes sociales y una plataforma concreta. En otro dominio (por ejemplo, comentarios técnicos o ironía) la tasa de falsos positivos y negativos puede desplazarse; conviene recalibrar sobre datos propios.
- Sesgo de dominio: el entrenamiento procede de comentarios de redes sociales vietnamitas, con la distribución de temas, jerga y ortografía de ese corpus. El comportamiento sobre texto formal, periodístico o legal no está documentado.
- Riesgo de clasificación errónea por sarcasmo e ironía: los ejemplos de la model card incluyen lenguaje vulgar y coloquial vietnamita; el modelo no distingue de forma fiable entre insulto real y cita o humor.
- Riesgo de alucinación: no aplica en sentido generativo (el modelo no genera texto), pero sí existe riesgo de etiquetas seguras pero incorrectas con alta confianza, ya que la salida `softmax` no está calibrada explícitamente.
- Uso en producción: el autor no documenta evaluación de sesgos por género, región o dialecto, ni pruebas de robustez frente a texto ofuscado (caracteres repetidos, leetspeak, emojis). No debe usarse como único mecanismo de moderación sin revisión humana.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero conviene verificar la licencia del modelo base `uitnlp/visobert` y del corpus UIT-VSMEC, que no se detalla en la información disponible y puede imponer condiciones adicionales.
- Modelo de autor individual con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aabcv/visobert-vsmec-moderation
- Modelo base ViSoBERT: https://huggingface.co/uitnlp/visobert
- Dataset UIT-VSMEC: https://huggingface.co/datasets/tridm/UIT-VSMEC
- Paper, blog o repositorio adicionales: no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo ni con ViSoBERT o UIT-VSMEC.
