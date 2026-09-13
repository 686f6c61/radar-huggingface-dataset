# andreadm/reddit-pulse-qwen2.5_0.5b-qdora

## Resumen

`andreadm/reddit-pulse-qwen2.5_0.5b-qdora` es un clasificador de tres clases que etiqueta textos cortos en inglés sobre economía según la dirección de las expectativas de inflación: los precios suben (`up`), bajan (`down`) o no hay señal direccional (`neutral`). No es un modelo de sentimiento: "la inflación cae con fuerza" es una buena noticia pero se etiqueta `down`, mientras que "los alquileres están fuera de control" es una mala noticia y se etiqueta `up`. La etiqueta se refiere al nivel de precios, no al tono del autor.

Técnicamente es un adaptador PEFT de tipo QDoRA+ (DoRA con tasas de aprendizaje LoRA+) montado sobre `Qwen/Qwen2.5-0.5B`, un transformer decoder-only de aproximadamente 0,49 mil millones de parámetros. El entrenamiento se hizo con la base cuantizada en 4 bits NF4 y adaptadores DoRA sobre las proyecciones de atención, con un cabeza de clasificación de tres vías. Se trata, por tanto, de un modelo muy pequeño y especializado, no de un modelo generativo de propósito general.

Su relevancia es metodológica más que de rendimiento bruto: es uno de los clasificadores de modelo pequeño que alimentan la señal de inflación extraída de Reddit en el trabajo de Del Monaco, Longo, Marcucci y Tafani (2026) publicado en el *Journal of Applied Econometrics*, con versión de trabajo en los *Questioni di Economia e Finanza* del Banco de Italia (n.º 1028). Su uso previsto es etiquetar grandes volúmenes de titulares y comentarios para después **agregar** las predicciones por período y construir un indicador de alta frecuencia; una predicción individual es ruidosa por diseño. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT QDoRA+ sobre Qwen2.5-0.5B (transformer decoder-only, `Qwen2ForCausalLM`) con cabeza de clasificación de 3 clases |
| Parámetros totales | ~0,49 B en el modelo base; tamaño del adaptador no disponible (repositorio de 0,0 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens del modelo base Qwen2.5-0.5B; el entrenamiento y el ejemplo de inferencia truncan a `max_length=1024` |
| Tipos de cuantización | Base cargada en 4-bit NF4 con doble cuantización (`bitsandbytes`, `bnb_4bit_use_double_quant=True`, cómputo en bfloat16); adaptadores DoRA; no se publican pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Pipeline | text-classification |
| Etiquetas | 0 = `down` (codificación -1), 1 = `neutral` (+0), 2 = `up` (+1) |
| Modelo base | Qwen/Qwen2.5-0.5B (relación: adapter) |
| Librería | peft |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador, no un checkpoint completo. Sobre `Qwen/Qwen2.5-0.5B` se aplican adaptadores DoRA (Weight-Decomposed Low-Rank Adaptation) en las proyecciones de atención, con tasas de aprendizaje LoRA+ (la variante que desacopla el *learning rate* de las matrices B respecto de las A). La base se mantiene congelada y cuantizada en 4 bits NF4 con doble cuantización, de modo que durante el entrenamiento solo se actualizan los parámetros del adaptador y la cabeza de clasificación. El repositorio incluye un `config.json` con la cabeza de tres vías, los nombres de las etiquetas y el token de relleno, de forma que `PeftModel.from_pretrained` reconstruye el modelo sin argumentos adicionales.

Los datos de entrenamiento son títulos de envíos de Reddit de los subreddits r/economy, r/Economics y r/wallstreetbets, referidos a la inflación de Estados Unidos y con cobertura temporal de 2008 a 2022. Los títulos tienen una mediana de 11 palabras y un máximo de 52, por lo que el modelo se ajustó a textos muy cortos y de registro informal. La pérdida se balanceó por clase durante el entrenamiento para compensar el desequilibrio del conjunto de referencia, en el que `down` es la clase minoritaria y la más difícil. El autor advierte explícitamente que el apartado de limitaciones de la model card es genérico y que el desglose por clase de las fichas escritas a mano no se genera automáticamente.

## Capacidades

- Clasificación de texto en tres clases (`down` / `neutral` / `up`) sobre textos cortos en inglés relacionados con economía e inflación.
- Detección de dirección del nivel de precios, independiente del sentimiento o de la postura del autor ante esa dirección.
- Etiquetado de titulares de Reddit, titulares de prensa y publicaciones breves de redes sociales con vocabulario económico.
- Procesamiento por lotes (`padding=True`, `padding_side="left"`, truncado) para inferencia sobre corpus grandes.
- Asignación de una codificación numérica coherente con los ficheros de corpus del artículo (-1, 0, +1), pensada para agregación temporal.
- No dispone de generación de texto libre, tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio: es una cabeza de clasificación sobre un modelo de 0,5 B.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Modo *thinking* o razonamiento explícito: no disponible.

## Casos de uso

- Construcción de un indicador de alta frecuencia de expectativas de inflación: el modelo etiqueta miles de títulos por período y la proporción de etiquetas `up` frente a `down` se agrega en una serie temporal, que es exactamente el caso de uso del artículo de referencia.
- *Nowcasting* macroeconómico en investigación: alimentar modelos de previsión de inflación con la señal direccional agregada procedente de redes sociales, aprovechando que el clasificador es lo bastante pequeño para procesar el corpus completo de 2008-2022 en hardware modesto.
- Etiquetado y enriquecimiento de corpus para NLP económico: anotar conjuntos de titulares o comentarios con una etiqueta direccional previa a análisis posteriores (topic modelling, estudios de transmisión de expectativas, comparación con encuestas como las del NY Fed).
- Señal auxiliar en *research* cuantitativo: incorporar la serie agregada como característica adicional en modelos de previsión, siempre con la advertencia de que la señal individual es ruidosa y el modelo no ha sido validado como predictor autónomo.
- Filtrado previo en pipelines de análisis de opinión pública: separar el subconjunto de publicaciones con señal direccional sobre precios antes de aplicar modelos más costosos, reduciendo el volumen que llega a etapas posteriores.
- Monitorización de prensa económica: clasificar titulares breves de medios financieros para seguir el tono direccional sobre inflación a lo largo del tiempo, teniendo en cuenta la advertencia de dominio sobre vocabulario posterior a 2022.
- Replicación académica y docencia: reproducir el *pipeline* del artículo (subidas a GitHub en `andrea-dm/reddit-pulse`) para auditar el método, comparar variantes de adaptadores o usar el modelo como *baseline* en experimentos de clasificación con modelos pequeños.
- Análisis comparado de subreddits: estudiar diferencias de señal direccional entre r/economy, r/Economics y r/wallstreetbets, los tres subreddits representados en el entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, sobre el *split* de test retenido de la semilla 107935903 del conjunto de referencia de inflación de Reddit (Del Monaco, Longo, Marcucci y Tafani, 2026). Ninguno de los valores está verificado (`verified: false`).

| Métrica | Valor |
|---|---|
| Accuracy | 0,6691 |
| F1 (ponderado) | 0,6606 |
| F1 (macro) | 0,5867 |
| ROC-AUC (macro, uno contra el resto) | 0,8145 |

No se han publicado en la información disponible resultados comparativos frente a otros clasificadores en el mismo conjunto de evaluación. La diferencia entre el F1 ponderado (0,6606) y el F1 macro (0,5867) es consistente con la advertencia del autor sobre el bajo *recall* de la clase minoritaria `down`.

## Requisitos de hardware

- VRAM estimada para inferencia: en la configuración de entrenamiento (base en 4-bit NF4 con doble cuantización y cómputo en bfloat16) el modelo ocupa del orden de 0,3-0,5 GB de pesos, más el adaptador (tamaño no publicado) y las activaciones del lote. En bfloat16 sin cuantizar serían aproximadamente 1 GB de pesos. Son estimaciones derivadas del tamaño del modelo base, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. El modelo es viable en RTX 3060, RTX 4060, RTX 4090, T4, L4 e incluso en GPU integradas con memoria compartida. A100 y H100 no aportan ventaja por capacidad, solo por paralelismo de lotes.
- Compatibilidad con GPU de consumo: sí, holgadamente. Es un adaptador de 0,5 B sobre una base cuantizada, por lo que cabe en cualquier GPU de consumo de los últimos años.
- CPU: la inferencia en CPU es viable en términos de memoria, aunque el *throughput* dependerá del número de núcleos y del tamaño del lote. No hay cifras publicadas.
- Opciones de despliegue: al ser un adaptador PEFT con cuantización `bitsandbytes`, el camino soportado es `transformers` + `peft` + `bitsandbytes`. La model card advierte de que no se debe pasar el nombre del repositorio directamente a `AutoModelForSequenceClassification`, porque el atajo de adaptadores de transformers reconstruye el DoRA con logits distintos a los del modelo entrenado. No se han publicado conversiones a GGUF, por lo que llama.cpp, Ollama y LM Studio no están soportados de fábrica. vLLM y TGI soportan adaptadores LoRA, pero la combinación con una base NF4 y un adaptador DoRA requiere validación propia; no hay datos publicados al respecto.
- Latencia y *throughput* estimados: no disponibles.

## Comparativa con modelos similares

No se han publicado en la información disponible modelos comparables con métricas sobre el mismo conjunto de evaluación (conjunto de referencia de inflación de Reddit), ni cifras de *baselines* del artículo. La única comparación documentada es la línea genealógica con el modelo base.

| Modelo | Rol | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen/Qwen2.5-0.5B` | Checkpoint base preentrenado, generativo | ~0,49 B | 32 768 tokens | apache-2.0 | HuggingFace |
| `andreadm/reddit-pulse-qwen2.5_0.5b-qdora` | Adaptador QDoRA+ de clasificación direccional (down / neutral / up) | ~0,49 B (base) + adaptador | Heredado del base; truncado a 1024 en entrenamiento e inferencia | apache-2.0 | HuggingFace, 0 descargas |

Alternativas comparables de terceros (otros clasificadores de expectativas de inflación sobre texto, modelos de sentimiento financiero o clasificadores sobre el mismo conjunto de referencia): no disponible.

## Limitaciones y advertencias

- Las predicciones individuales son ruidosas. El valor del modelo proviene de promediar miles de predicciones por período, donde los errores idiosincrásicos se compensan. El autor desaconseja confiar en una etiqueta aislada.
- Dominio y registro restringidos: entrenado con títulos de r/economy, r/Economics y r/wallstreetbets sobre inflación de Estados Unidos entre 2008 y 2022. Otros países, otros registros y vocabulario posterior a 2022 quedan fuera de distribución.
- Desequilibrio de clases: `down` es la clase minoritaria del conjunto de referencia y la más difícil. Aunque la pérdida se balanceó durante el entrenamiento, el *recall* de `down` sigue siendo inferior, como refleja la brecha entre F1 ponderado y F1 macro.
- Textos cortos únicamente: el ajuste se hizo sobre títulos con mediana de 11 palabras y máximo de 52. Los comentarios largos se truncan y no fueron vistos durante el entrenamiento.
- Mide dirección, no postura ni sentimiento: no indica si el autor desea que la inflación se mueva en esa dirección, ni si la noticia es buena o mala.
- Riesgo de alucinación en el sentido generativo: no aplica de forma directa, ya que el modelo no genera texto libre; el riesgo equivalente es la asignación de una etiqueta direccional a textos neutros o ambiguos.
- Idioma: solo inglés declarado. No hay evaluación en castellano ni en otros idiomas.
- Métricas no verificadas: los cuatro valores del `model-index` están marcados como `verified: false`, es decir, son declaraciones del autor sin validación independiente.
- Licencia: apache-2.0, que permite uso comercial del adaptador y del modelo base. Debe revisarse por separado el cumplimiento de las condiciones de uso de Reddit y de la legislación aplicable al tratamiento de los datos de origen si se redistribuye el corpus.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por parte de terceros más allá del artículo asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreadm/reddit-pulse-qwen2.5_0.5b-qdora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio de código (ajuste fino e inferencia sobre el corpus completo): https://github.com/andrea-dm/reddit-pulse
- Artículo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026). *Reddit's 'pulse' on US inflation: forecasting with large language models*. Journal of Applied Econometrics, en prensa.
- Versión de trabajo: Banca d'Italia, Questioni di Economia e Finanza (Occasional Papers) n.º 1028, junio de 2026, doi:10.32057/0.QEF.2026.1028
- Conjunto de evaluación citado: Reddit inflation gold set (Del Monaco, Longo, Marcucci y Tafani, 2026), *split* de test de la semilla 107935903 (no se proporciona URL en la información disponible).
