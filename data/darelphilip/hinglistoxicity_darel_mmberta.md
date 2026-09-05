# darelphilip/hinglisToxicity_darel_mmberta

## Resumen

El modelo `darelphilip/hinglisToxicity_darel_mmberta` es un clasificador de secuencias multi-etiqueta diseñado para detectar toxicidad en texto Hinglish (mezcla de hindi e inglés en escritura romanizada). Desarrollado por Darel Philip, se basa en el modelo `jhu-clsp/mmBERT-base`, que utiliza una arquitectura ModernBERT con atención escalada de producto punto nativa (SDPA) y tokenización de Gemma 2. El modelo se afinó sobre más de 245.000 comentarios online con cambio de código, con el objetivo de identificar siete vectores de abuso, acoso y discurso de odio específicos de los espacios digitales del sur de Asia. Su relevancia actual radica en la necesidad de moderar contenido en plataformas donde conviven hindi e inglés de forma informal, un ámbito poco cubierto por los modelos de toxicidad estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Hinglish (hi-en), hindi, ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder basado en ModernBERT. Según la ficha del autor, esta arquitectura utiliza atención escalada de producto punto nativa (SDPA) y tokenización de Gemma 2. El entrenamiento consistió en un ajuste fino de clasificación multi-etiqueta sobre 245.000 comentarios code-switched. Se empleó una función de pérdida de entropía cruzada binaria ponderada (`pos_weight`) para penalizar los falsos negativos en categorías de odio graves pero infrarrepresentadas. No se indica el número de tokens de entrenamiento ni el dataset específico más allá de comentarios de comunidades regionales.

## Capacidades

- Clasificación multi-etiqueta de toxicidad en 7 categorías: profanidad/vulgaridad, abuso dirigido/acoso, discurso de odio discriminatorio, casta, religión/comunidad, xenofobia regional y misoginia/género.
- Detección específica en texto Hinglish code-switched, así como en hindi e inglés.
- Salida de probabilidades independientes para cada etiqueta, lo que permite umbrales personalizados.
- No genera texto, no traduce ni mantiene diálogo; es exclusivamente un clasificador.
- No soporta tool calling ni razonamiento multi-paso; se limita a inferencia por lotes o en tiempo real.
- Compatible con inferencia vía transformers y text-embeddings-inference.

## Casos de uso

- Moderación automatizada de comunidades: el modelo puede puntuar comentarios en foros y secciones de comentarios en Hinglish, permitiendo ocultar o marcar contenido con alta probabilidad de toxicidad.
- Auditoría de toxicidad histórica: procesamiento por lotes de archivos de comentarios para identificar tendencias de abuso regional, acoso basado en casta o discurso discriminatorio.
- Sistemas de revisión con intervención humana: las predicciones con puntuaciones entre 0,35 y 0,65 se consideran inciertas, ideal para enrutar a revisores humanos en flujos de moderación.
- Monitorización de redes sociales en la India: seguimiento de campañas de acoso coordinado, ya que el modelo reconoce insultos y etiquetas identitarias comunes en el discurso en Hinglish.
- Etiquetado de datos de entrenamiento: la salida multi-etiqueta permite anotar automáticamente corpus para entrenar otros clasificadores o analizar la prevalencia de categorías de odio.
- Investigación sobre discurso de odio en sur de Asia: el modelo puede usarse para análisis cuantitativo de violencia comunal, misoginia o xenofobia regional en textos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor menciona `f1` y `loss` como métricas de seguimiento, pero no se facilitan valores concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Al ser un encoder de tamaño base, es razonable asumir que puede ejecutarse en GPU de consumo o incluso CPU, pero no hay datos confirmados.
- Opciones de despliegue: compatible con `transformers` (AutoTokenizer + AutoModelForSequenceClassification) y `text-embeddings-inference`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Licencia | Categorias | Parametros | Contexto |
|---|---|---|---|---|---|
| darelphilip/hinglisToxicity_darel_mmberta | ModernBERT (mmBERT-base) | Apache-2.0 | 7 | no disponible | no disponible |
| darelphilip/hinglish-toxicity-classifier | XLM-RoBERTa | MIT | no especificado | no disponible | no disponible |

Ambós modelos son del mismo autor y abordan la detección de toxicidad en Hinglish code-mixed. El modelo actual parte de `mmBERT-base` mientras que el alternativo utiliza `xlm-roberta`; no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- El slang coloquial o la terminología reapropiada puede provocar falsos positivos en la categoría `profanity_vulgarity`.
- Las puntuaciones entre 0,35 y 0,65 se consideran de incertidumbre estadística y conviene revisarlas manualmente.
- El modelo no está diseñado para generación, traducción ni diálogo.
- Puede degradarse en dialectos regionales profundos, en mezclas con idiomas distintos del hindi o en hindi formal en escritura devanagari sin transliteración.
- Los datos de entrenamiento proceden de comentarios de comunidades regionales, lo que puede introducir sesgos geográficos y culturales.
- Aunque la licencia Apache-2.0 permite uso comercial, hay que conservar los avisos de licencia y las atribuciones correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darelphilip/hinglisToxicity_darel_mmberta
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo relacionado: https://huggingface.co/darelphilip/hinglish-toxicity-classifier
- Contacto del autor: mailto:enigmaticdarel@gmail.com
