# m-lagnajit/ctd-student-f

## Resumen

ctd-student-f es un clasificador de texto de aproximadamente 150 millones de parámetros desarrollado por Lagnajit Moharana, investigador independiente. Se construye sobre answerdotai/ModernBERT-base y resuelve un problema concreto: dado un texto, una pregunta y una lista de opciones (hasta 8), devuelve una probabilidad calibrada para cada opción. La calibración es el eje del modelo: cuando asigna un 80 % a una opción, la frecuencia empírica de acierto debe rondar ese 80 %.

El modelo forma parte de la familia "calibrated typed decisions" (CTD), un experimento de destilación de conocimiento en el que las etiquetas blandas corregidas de un profesor de 7B se combinan con la etiqueta dura del corpus de entrenamiento. El repositorio contiene tres estudiantes entrenados con semillas distintas cuyas probabilidades se promedian en el ensemble. La ventana de contexto efectiva es de 512 tokens y el modelo solo admite inglés.

Su relevancia actual reside en que ofrece calibración fiable (ECE de 0,015 en datos familiares) en un clasificador pequeño que cabe en cualquier GPU de consumo, algo poco habitual en modelos de clasificación con etiquetas abiertas. No obstante, el propio autor advierte que solo es fiable en tipos de juicio similares a los de sus fuentes de entrenamiento; en dominios nuevos su utilidad predictiva es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con scorer lineal compartido sobre un token `[MASK]` |
| Parametros totales | ~150 M (3 estudiantes en ensemble) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (el texto se trunca; las opciones nunca) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer con atención de secuencia larga, y añade un scorer lineal compartido que se aplica sobre un marcador `[MASK]` insertado antes de cada opción. El objetivo de entrenamiento es una mezcla `0.5 × one-hot(gold) + 0.5 × corrected_soft_label`, calculada sobre las 16.995 preguntas de entrenamiento del dataset m-lagnajit/calibrated-typed-decisions. Las etiquetas blandas provienen de un profesor de 7B y fueron corregidas antes de la destilación.

El recetario es de 3 épocas, batch 16, AdamW con weight decay 0,01, learning rates de 3e-5 para el cuerpo y 1e-3 para el scorer, 10 % de warmup, gradient clipping de 1,0 y precisión mixta; se conserva la época con menor log loss de validación. Sobre esa base se ajustan "diales" de calibración por semilla: una temperatura para preguntas de elección y una temperatura más un desplazamiento para el "sí" en preguntas yes/no, almacenados en `dials.json` y ajustados sobre el split de validación.

## Capacidades

- Clasificación de texto con etiquetas abiertas: recibe instrucciones, texto y una lista de opciones (hasta 8) y devuelve una probabilidad por opción.
- Preguntas de elección múltiple (`choice`) y preguntas de sí/no (`yes/no`) mediante el parámetro `question_type`.
- Soporte de descripciones cortas por opción, que mejoran la desambiguación semántica entre etiquetas.
- Salida calibrada: probabilidades interpretables como frecuencias esperadas de acierto.
- Procesamiento por lotes mediante `student.predict(rows)` con diccionarios de `instructions`, `state`, `options`, `option_descriptions` y `type`.
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling, agentes, visión, audio y modo de razonamiento: no disponibles.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo recibe el mensaje del usuario y una lista de intenciones bancarias o de soporte, y devuelve la probabilidad de cada una; la calibración permite fijar umbrales de derivación a un agente humano cuando la confianza es baja.
- Análisis de sentimiento en reseñas: con opciones como "positivo", "negativo" o "neutro" y descripciones breves, se obtienen probabilidades utilizables directamente en un panel de métricas sin post-procesado de calibración.
- Detección de emociones en textos cortos: aprovecha las fuentes GoEmotions del entrenamiento para etiquetar mensajes con un conjunto fijo de emociones y cuantificar la incertidumbre por categoría.
- Clasificación de propósito de citación en artículos científicos: el modelo puede asignar a una cita una categoría de propósito (por ejemplo, antecedente, metodología o resultado) con una probabilidad calibrada, útil en pipelines de revisión bibliográfica.
- Enrutamiento de tickets en soporte técnico: la salida probabilística alimenta una regla de enrutamiento que asigna el ticket al equipo adecuado y escala los casos ambiguos, gracias a la ventana de 512 tokens suficiente para mensajes de soporte típicos.
- Filtrado previo en moderación de contenido: con opciones binarias o de pocas categorías y descripciones explícitas, el modelo actúa como primera etapa de un clasificador en cascada, dejando los casos dudosos a un modelo mayor.
- Evaluación de la incertidumbre en clasificadores existentes: sirve como referencia de calibración para comparar contra clasificadores propios en tareas con etiquetas fijas y textos cortos.

## Benchmarks y rendimiento

Resultados medidos sobre los archivos del repositorio (ensemble de tres semillas; última columna, estudiantes individuales, media y rango).

| Test | Accuracy | ECE | Log loss | Log loss, estudiantes individuales |
|---|---|---|---|---|
| Datos familiares (test split) | 0,929 | 0,015 | 0,223 | 0,245 (0,239–0,254) |
| Nuevo conjunto de etiquetas (SNIPS) | 0,958 | 0,020 | 0,126 | 0,140 (0,137–0,143) |
| Nuevo tipo de juicio (PubMedQA) | 0,608 | 0,085 | 0,910 | 0,926 (0,875–0,953) |

Referencias del autor para PubMedQA: responder siempre "sí" obtiene accuracy 0,552 y predecir siempre las frecuencias de etiquetas obtiene log loss 0,937. El autor señala que estas cifras pueden diferir ligeramente de las del informe técnico porque este usó las semillas originales 1 y 2, cuyos pesos no se guardaron, mientras que el repositorio contiene la misma receta reentrenada con las mismas semillas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB para un estudiante y alrededor de 1,8 GB para el ensemble de tres; en fp16 o bf16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el ensemble en precisión reducida; RTX 3060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más, incluida la gama RTX 20xx en adelante.
- Opciones de despliegue: el modelo requiere el script `ctd_student.py` del repositorio y `transformers>=4.48`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Calibración documentada |
|---|---|---|---|---|---|
| ctd-student-f | ~150 M (×3 en ensemble) | 512 tokens | Clasificación con etiquetas abiertas | Apache 2.0 | Sí (ECE 0,015 en datos familiares) |
| answerdotai/ModernBERT-base | ~149 M | 8.192 tokens | Encoder de propósito general | Apache 2.0 | No disponible |
| ctd-student-e | no disponible | 512 tokens | Clasificación con etiquetas abiertas (nuevos conjuntos) | Apache 2.0 | No disponible en la información proporcionada |

La comparación con clasificadores de texto de tamaño similar (por ejemplo, DeBERTa-v3-base o RoBERTa-base ajustados) no está disponible en la información proporcionada; el autor solo referencia sus propios estudiantes y el modelo base.

## Limitaciones y advertencias

- Solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Límite de 8 opciones por pregunta.
- Los textos de más de 512 tokens se truncan; solo se recorta el texto, nunca las opciones.
- La calibración está ajustada sobre datos similares a las fuentes de entrenamiento; en tipos de juicio nuevos el modelo es "honesto pero sabe poco", como muestran los resultados de PubMedQA (accuracy 0,608 frente a 0,552 del baseline trivial).
- Los diales de calibración se ajustaron sobre datos familiares y pueden sobrecorregir o subcorregir en datos muy distintos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de asignar probabilidades excesivamente confiadas fuera de dominio.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los sesgos de CLINC150, Banking77, MASSIVE, GoEmotions, Amazon Polarity y SciCite.
- Licencia Apache 2.0, que permite uso comercial; los datos de entrenamiento derivan de corpus con licencias CC BY 3.0, CC BY 4.0 y Apache 2.0, cuyas atribuciones deben conservarse según la dataset card.
- Para producción, conviene validar la calibración sobre el dominio objetivo antes de fijar umbrales de decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m-lagnajit/ctd-student-f
- Dataset: https://huggingface.co/datasets/m-lagnajit/calibrated-typed-decisions
- Informe técnico: https://lagnajitmoharana.web.app/calibrated-typed-decisions-technical-report.pdf
- Blog del autor: https://lagnajitmoharana.web.app/how-sure-is-sure-understanding-llm-calibration
- Código: https://github.com/Lagnajit09/100x_AI_ML/tree/main/calibrated-typed-decision
- Modelo hermano (nuevos conjuntos de etiquetas): https://huggingface.co/m-lagnajit/ctd-student-e
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
