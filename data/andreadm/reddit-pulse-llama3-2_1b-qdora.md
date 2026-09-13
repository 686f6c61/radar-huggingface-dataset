# andreadm/reddit-pulse-llama3.2_1b-qdora

## Resumen

reddit-pulse-llama3.2_1b-qdora es un clasificador de tres clases (subida / neutro / bajada) de expectativas de inflación direccional para textos cortos en inglés sobre economía. Se trata de un adaptador PEFT de tipo QDoRA+ (DoRA sobre proyecciones de atención con tasas de aprendizaje LoRA+, base cuantizada en 4 bits NF4) montado sobre meta-llama/Llama-3.2-1B y ajustado sobre títulos de Reddit. Dado un título o una frase corta, el modelo predice si el texto transmite que la inflación o los precios van hacia arriba, hacia abajo, o si no contiene señal direccional alguna.

El modelo no es un analizador de sentimiento: "la inflación cae con fuerza" es una buena noticia pero se etiqueta como bajada; "los alquileres están fuera de control" es una mala noticia pero se etiqueta como subida. La dirección se refiere al nivel de precios, no al tono del autor. Esta distinción es la que hace útil al modelo como componente de un indicador de alta frecuencia: la señal se obtiene agregando miles de predicciones por periodo, no de etiquetas individuales.

El checkpoint forma parte de los clasificadores de modelo pequeño que sustentan la señal de inflación a partir de Reddit en el trabajo de Del Monaco, Longo, Marcucci y Tafani (2026), publicado en el Journal of Applied Econometrics y disponible como documento de trabajo de la Banca d'Italia (Questioni di Economia e Finanza n.o 1028). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card advierte de que la sección de limitaciones es genérica y de que el desglose por clase no se genera automáticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B) con cabeza de clasificación de 3 clases y adaptadores DoRA sobre las proyecciones de atención; base cuantizada en 4 bits NF4 |
| Parametros totales | Aproximadamente 1.000 millones en el modelo base (Llama-3.2-1B); el repositorio no publica el recuento de parámetros del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada para el clasificador; el modelo base Llama-3.2-1B admite hasta 128.000 tokens. El ajuste se hizo sobre títulos de mediana 11 palabras (máximo 52) y el ejemplo de uso trunca a 1024 tokens |
| Tipos de cuantizacion | Base en 4 bits NF4 con doble cuantización (bitsandbytes), compute dtype bfloat16; no se publican otros formatos cuantizados |
| Idiomas soportados | Inglés (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) más config.json; no se publican pesos fusionados ni GGUF |

Otros metadatos: pipeline text-classification, librería peft, etiquetas id 0 = down, 1 = neutral, 2 = up (codificación -1 / 0 / +1 en los ficheros del corpus del artículo). Tamaño del repositorio: 0,0 GB según HuggingFace.

## Arquitectura y entrenamiento

El modelo es un ajuste fino de tipo PEFT sobre Llama-3.2-1B, un transformer decoder-only de aproximadamente 1.000 millones de parámetros. El autor describe la configuración como QDoRA+: la base se carga cuantizada en 4 bits NF4 con doble cuantización (bitsandbytes), sobre ella se insertan adaptadores DoRA (weight-decomposed low-rank adaptation) en las proyecciones de atención y se entrenan con tasas de aprendizaje LoRA+. La cabeza de clasificación es de tres vías y el config.json del repositorio incluye los nombres de las etiquetas y el token de padding, de modo que no hace falta pasar argumentos adicionales al cargar. Los datos de entrenamiento son títulos de los subreddits r/economy, r/Economics y r/wallstreetbets sobre inflación en Estados Unidos, correspondientes al periodo 2008-2022. La loss se balanceó por clase durante el entrenamiento.

El repositorio no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; se trata de un ajuste supervisado para clasificación, no de un modelo generativo alineado. Como innovación técnica destacable está el uso de DoRA sobre una base en 4 bits con LoRA+, y una advertencia relevante de implementación: no debe pasarse el nombre del repositorio directamente a AutoModelForSequenceClassification, porque el atajo de adaptadores de transformers reconstruye el adaptador DoRA con logits distintos a los del modelo entrenado. El procedimiento correcto es cargar la base cuantizada con la config del repositorio y envolverla con PeftModel.from_pretrained.

## Capacidades

- Clasificación direccional de expectativas de inflación en tres clases: up, neutral y down.
- Procesamiento de textos cortos e informales en inglés: títulos de Reddit, titulares de prensa y publicaciones breves en redes sociales.
- Distinción entre dirección del nivel de precios y sentimiento o postura del autor, que es la funcionalidad diferencial frente a un modelo de sentimiento.
- Manejo de vocabulario económico y financiero cotidiano (IPC, PCE, alquileres, tipos de interés) en el registro propio de foros.
- Salida apta para agregación temporal: la predicción por documento está pensada para promediarse en grandes volúmenes.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito; es un clasificador de secuencia, no un modelo de propósito general.
- No soporta multilingüismo: solo inglés.

## Casos de uso

- Construcción de indicadores de inflación de alta frecuencia: se clasifican miles de títulos y comentarios por periodo y se agrega la proporción de etiquetas up y down para obtener una serie temporal que se incorpora a modelos de previsión, tal como plantea el artículo de referencia.
- Análisis de expectativas en foros financieros: seguimiento de cómo evoluciona el discurso de r/wallstreetbets o r/economy sobre la evolución de los precios, detectando cambios de tono direccional antes de que aparezcan en encuestas.
- Etiquetado a escala de corpus históricos: preprocesamiento de archivos de texto económico en inglés para generar etiquetas débiles que después se revisan o se usan en un clasificador mayor.
- Señal complementaria para mesas de análisis macro: cruce del índice diario generado a partir de redes sociales con datos oficiales de IPC o con encuestas de expectativas, como variable auxiliar.
- Filtrado de contenido en productos de información financiera: seleccionar automáticamente las publicaciones que discuten la dirección de los precios para incluirlas en resúmenes o alertas dirigidas a analistas.
- Investigación en economía computacional: replicación y extensión del trabajo de Del Monaco et al. sobre el valor predictivo del pulso de Reddit, con un clasificador pequeño y desplegable en infraestructura modesta.
- Detección de narrativas de precios en tiempo real dentro de un pipeline de monitorización social, siempre que el resultado se agregue y no se interprete documento a documento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; el campo `verified` es `false` en la model-index). Tarea: clasificación direccional de expectativas de inflación (up / neutral / down). Conjunto: Reddit inflation gold set (Del Monaco, Longo, Marcucci y Tafani, 2026), split de test reservado de la semilla 3266123502.

| Metrica | Valor |
|---|---|
| Accuracy | 0,705 |
| F1 weighted | 0,707 |
| F1 macro | 0,6515 |
| ROC-AUC macro (one-vs-rest) | 0,8676 |

No se han publicado en la información disponible resultados comparativos de este checkpoint frente a otros modelos sobre el mismo conjunto, ni cifras de MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: con la base en 4 bits NF4 y doble cuantización, los pesos ocupan del orden de 1 GB; sumando activaciones y la cabeza de clasificación, el conjunto cabe holgadamente en menos de 2 GB de VRAM con bfloat16 como compute dtype. No se publican mediciones exactas.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de memoria libre es suficiente; también tarjetas de datacenter (A100, H100) si se integra en un servicio compartido, aunque están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna, incluidas GTX 16xx, RTX 20xx, 30xx y 40xx con memoria suficiente, y puede ejecutarse en CPU en modo inferencia.
- Opciones de despliegue: el camino documentado es transformers más peft y bitsandbytes, siguiendo el ejemplo de la model card (PeftModel.from_pretrained sobre la base cuantizada, con device_map="auto"). Al ser un adaptador DoRA sobre una base cuantizada, no hay soporte directo documentado en llama.cpp, Ollama, vLLM o TGI sin fusionar y exportar previamente los pesos, tarea que el repositorio no documenta. Para lotes grandes conviene usar truncación a la longitud del texto y padding por la izquierda, como indica la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados para este checkpoint. La tabla recoge la comparación cualitativa con alternativas de la misma categoría; las celdas de rendimiento se dejan como no disponibles porque no hay datos sobre el mismo conjunto de evaluación.

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| andreadm/reddit-pulse-llama3.2_1b-qdora | ~1.000 M (base) más adaptador DoRA | No declarado para el clasificador | Clasificación direccional de inflación (3 clases) | llama3.2 | Accuracy 0,705; F1 macro 0,6515 (autor, no verificado) |
| meta-llama/Llama-3.2-1B (base sin ajustar) | ~1.000 M | 128.000 tokens | Generación de texto; no es un clasificador | llama3.2 | No disponible |
| Modelos de sentimiento financiero tipo FinBERT (ProsusAI/finbert) | ~110 M | 512 tokens | Sentimiento positivo / negativo / neutro en texto financiero; no clasifica dirección de inflación | Apache 2.0 (FinBERT) | No disponible en el conjunto de referencia |
| Clasificadores zero-shot de propósito general (por ejemplo, NLI multi-clase) | Variable | Variable | Clasificación por etiquetas definidas en el prompt; no ajustados al dominio | Variable | No disponible |

La diferencia clave frente a FinBERT y frente a clasificadores de sentimiento genéricos no es solo de rendimiento, sino de objetivo: este adaptador mide dirección del nivel de precios y está entrenado con el registro y el vocabulario específico de Reddit entre 2008 y 2022.

## Limitaciones y advertencias

- Las predicciones individuales son ruidosas. El valor del modelo proviene de promediar miles de predicciones por periodo, donde los errores idiosincrásicos se compensan; no debe usarse una sola etiqueta como conclusión.
- Dominio y registro restringidos: se ajustó sobre títulos de r/economy, r/Economics y r/wallstreetbets acerca de la inflación de Estados Unidos entre 2008 y 2022. Otros países, otros registros y el vocabulario posterior a 2022 quedan fuera de distribución.
- Desbalanceo de clases: down es la clase minoritaria del conjunto de referencia y la más difícil; la loss se balanceó durante el entrenamiento, pero el recall de down sigue siendo inferior. El F1 macro (0,6515) es claramente más bajo que el ponderado (0,707), lo que confirma este efecto.
- Textos cortos: el ajuste se hizo con títulos de mediana 11 palabras y máximo 52. Los comentarios largos se truncan y no se vieron durante el entrenamiento.
- Dirección, no postura ni sentimiento: el modelo no indica si el autor desea que la inflación se mueva en una dirección, ni si la noticia es buena o mala; solo hacia dónde se dice que van los precios.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo produce una etiqueta de tres clases; el riesgo equivalente es la clasificación errónea sistemática fuera de dominio.
- Licencia llama3.2: el uso comercial está sujeto a la Llama 3.2 Community License y a las condiciones adicionales de Meta, incluidos los requisitos de atribución y las restricciones de uso aceptable. Debe revisarse antes de cualquier despliegue en producción.
- Advertencia de implementación: cargar el repositorio directamente con AutoModelForSequenceClassification produce logits distintos a los del modelo entrenado; es obligatorio el procedimiento con PeftModel indicado en la model card.
- Metadatos poco fiables: el repositorio tiene 0 descargas y 0 likes, el tamaño reportado es de 0,0 GB y las fechas de creación y actualización son de 2026, lo que sugiere que el artefacto puede estar incompleto o recién publicado. Conviene verificar que los pesos del adaptador están efectivamente subidos antes de depender de él.
- Las métricas de la model-index están marcadas como no verificadas de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreadm/reddit-pulse-llama3.2_1b-qdora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Repositorio de código de ajuste fino e inferencia sobre el corpus completo: https://github.com/andrea-dm/reddit-pulse
- Documento de trabajo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026), "Reddit's 'pulse' on US inflation: forecasting with large language models", Banca d'Italia, Questioni di Economia e Finanza n.o 1028, doi:10.32057/0.QEF.2026.1028
- Artículo de revista (en prensa): Journal of Applied Econometrics, forthcoming
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (manualidades de temática otoñal en alemán), por lo que no se incluye ninguno. No se han encontrado demos, papers adicionales ni hilos de discusión asociados a este checkpoint más allá de los enlaces anteriores.
