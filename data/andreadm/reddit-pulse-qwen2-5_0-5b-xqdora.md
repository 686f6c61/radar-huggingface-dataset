# andreadm/reddit-pulse-qwen2.5_0.5b-xqdora

## Resumen

reddit-pulse-qwen2.5_0.5b-xqdora es un clasificador de tres clases (subida / neutral / bajada) que estima la dirección de las expectativas de inflación en textos cortos en inglés sobre economía. Lo publica andreadm como adaptador PEFT sobre el modelo base Qwen/Qwen2.5-0.5B, con la técnica xQDoRA+ (adaptadores DoRA sobre las proyecciones de atención, tasas de aprendizaje LoRA+), base cuantizada en 4 bits NF4 y una cabeza de clasificación de tres vías. El repositorio contiene únicamente el adaptador en safetensors, con licencia Apache 2.0 y pipeline declarado de text-classification.

El modelo no es un analizador de sentimiento: clasifica la dirección del nivel de precios, no el tono. "Inflation falls sharply" es una buena noticia pero se etiqueta como down; "rents are out of control" es una mala noticia pero se etiqueta como up. Este matiz es central para usarlo correctamente. Su valor no está en la predicción individual, sino en la agregación de miles de predicciones por período, que es el caso de uso del artículo que lo respalda (Del Monaco, Longo, Marcucci y Tafani, 2026, Journal of Applied Econometrics; versión de trabajo en Banca d'Italia, Questioni di Economia e Finanza n.º 1028).

Es relevante ahora porque forma parte de una familia de clasificadores pequeños que alimentan un indicador de alta frecuencia de expectativas de inflación a partir de Reddit, un enfoque que sustituye el etiquetado manual por inferencia masiva sobre corpus informales. Con solo 0,5B parámetros y cuantización de 4 bits, el coste de despliegue es muy bajo, aunque su ámbito es estrecho: inglés, textos cortos, Estados Unidos y vocabulario anterior a 2022.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador PEFT xQDoRA+ (DoRA sobre proyecciones de atención y tasas LoRA+) y cabeza de clasificación de 3 clases; base cuantizada en 4 bits NF4 |
| Parametros totales | ~0,5 mil millones en el modelo base Qwen2.5-0.5B; número de parámetros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B; el adaptador se entrenó con textos cortos (títulos, mediana de 11 palabras) y el ejemplo de inferencia de la model card trunca a 1024 tokens |
| Tipos de cuantizacion | 4 bits NF4 con doble cuantización (bitsandbytes); no se publican otros formatos |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere transformers, peft y bitsandbytes para cargarse |
| Tarea | Clasificación de texto, 3 clases: down (id 0), neutral (id 1), up (id 2) |
| Modelo base | Qwen/Qwen2.5-0.5B (relación: adapter) |
| Biblioteca | peft |
| Tamaño del repositorio | 0,0 GB (solo adaptador) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador sobre Qwen2.5-0.5B, un transformer decoder-only con atención de consultas agrupadas (GQA). Según la documentación pública del modelo base, este tiene 24 capas, dimensión oculta de 896, 14 cabezas de atención y 2 cabezas clave-valor. La adaptación usa xQDoRA+: la base se carga cuantizada en 4 bits NF4 con doble cuantización y se entrenan adaptadores DoRA sobre las proyecciones de atención con tasas de aprendizaje LoRA+. La cabeza de clasificación es de tres vías y el `config.json` del repositorio incluye los nombres de las etiquetas y el token de relleno, de modo que la carga no requiere argumentos adicionales.

Los datos de entrenamiento son títulos de envíos de Reddit sobre inflación en Estados Unidos, procedentes de r/economy, r/Economics y r/wallstreetbets, con cobertura temporal de 2008 a 2022. Los textos son cortos (mediana de 11 palabras, máximo de 52 en el conjunto de ajuste), por lo que las entradas largas se truncan. La pérdida se balanceó por clase durante el entrenamiento, ya que `down` es la clase minoritaria del conjunto de referencia. La model card indica que el código de ajuste fino e inferencia sobre el corpus completo está en el repositorio GitHub del autor. La información disponible se interrumpe en la sección de datos de entrenamiento, por lo que no se detalla el número total de tokens, la composición exacta del corpus ni si hubo etapas adicionales de alineación (RLHF o DPO) más allá del ajuste supervisado con el adaptador.

## Capacidades

- Clasificación direccional de expectativas de inflación en tres clases: up, neutral y down.
- Procesamiento de textos cortos e informales en inglés (títulos de Reddit, titulares, publicaciones en redes sociales).
- Inferencia por lotes, tal como muestra el ejemplo de la model card con `padding=True` y `truncation=True`.
- Distinción explícita entre dirección del nivel de precios y sentimiento o postura del autor.
- Recuperación del resultado con la codificación del artículo: `down = -1`, `neutral = 0`, `up = +1`.
- No es un modelo generativo: no produce texto, no razona en varios pasos y no admite tool calling ni function calling.
- No soporta agentes, ni visión, ni audio, ni modo de pensamiento extendido.
- No es multilingüe: el único idioma declarado es el inglés.

## Casos de uso

- Indicador de alta frecuencia de expectativas de inflación: el modelo etiqueta miles de títulos y comentarios de Reddit por período y el resultado se agrega para construir una serie temporal, que es exactamente el uso previsto por el artículo de referencia. La agregación es imprescindible porque la etiqueta individual es ruidosa.
- Nowcasting y forecasting macroeconómico: la serie agregada puede incorporarse como variable exógena en modelos econométricos o de machine learning que predigan inflación realizada o expectativas de encuestas.
- Monitorización para mesas de análisis y bancos centrales: permite seguir en tiempo casi real si el discurso en redes sociales se inclina hacia subidas o bajadas de precios, con una ventana temporal más corta que las encuestas tradicionales.
- Triaje de noticias financieras: clasificar titulares de medios económicos para priorizar o agrupar noticias según la dirección que atribuyen a los precios, antes de un análisis humano más profundo.
- Investigación académica en economía y NLP financiero: etiquetar corpus históricos (2008-2022) de forma reproducible y barata, generando etiquetas débiles que después se validan en una submuestra anotada a mano.
- Backtesting de estrategias basadas en narrativa: utilizar la serie de etiquetas agregadas como señal de entrada en simulaciones de cartera o en estudios de transmisión de expectativas a mercados, asumiendo la limitación temporal del corpus.
- Detección de cambios de régimen en el discurso público: seguir la transición de neutral a up o down en ventanas móviles para identificar giros en la percepción sobre precios, por ejemplo tras una publicación del IPC.
- Preprocesado de conjuntos de datos para otros modelos: usar las etiquetas como capa de filtrado en pipelines que alimentan modelos generativos o sistemas de recuperación de información económica.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados por un tercero), sobre el split de test del "Reddit inflation gold set" (Del Monaco, Longo, Marcucci y Tafani, 2026; semilla 709964709):

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,6547 |
| F1 ponderado (weighted) | 0,6515 |
| F1 macro | 0,6135 |
| ROC-AUC macro (one-vs-rest) | 0,822 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo conjunto de evaluación, ni desglose por clase, ni curvas de precisión y exhaustividad para las etiquetas `down`, `neutral` y `up`.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB con la base en 4 bits NF4 y el adaptador; el modelo base en precisión completa (bfloat16) ocupa aproximadamente 1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3050, T4 o superiores; también A100 y H100 para grandes volúmenes por lotes, aunque están sobredimensionadas para 0,5B parámetros.
- Cabe en GPU de consumo: sí, en prácticamente todas las tarjetas actuales, y también en CPU con un rendimiento aceptable para lotes moderados.
- Opciones de despliegue: transformers con peft y bitsandbytes, tal y como se documenta en la model card; no se ha publicado conversión a GGUF, por lo que llama.cpp u Ollama no están soportados de forma directa (los adaptadores DoRA requerirían conversión o fusión previa).
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Advertencia de carga: no debe pasarse el nombre del repositorio directamente a `AutoModelForSequenceClassification`, porque el atajo de adaptadores de transformers reconstruye el adaptador DoRA con logits distintos a los del modelo entrenado. Hay que cargar la base y después `PeftModel.from_pretrained`.

## Comparativa con modelos similares

No se dispone de resultados publicados de otras alternativas sobre el mismo conjunto de evaluación en la información proporcionada. La tabla recoge únicamente los datos disponibles:

| Modelo | Parametros | Contexto | Tarea | Licencia | Resultado en el gold set |
|---|---|---|---|---|---|
| reddit-pulse-qwen2.5_0.5b-xqdora | ~0,5B (adaptador PEFT) | 32.768 tokens en la base; entrenado con textos cortos | Clasificación direccional de inflación (3 clases) | Apache 2.0 | Accuracy 0,6547; F1 ponderado 0,6515; F1 macro 0,6135; ROC-AUC 0,822 |
| Qwen/Qwen2.5-0.5B (modelo base) | ~0,5B | 32.768 tokens | Generación de texto; no es un clasificador direccional | Apache 2.0 (según el modelo base) | no aplica |
| Otras alternativas (clasificadores pequeños ajustados sobre el mismo corpus, LLM en zero-shot) | no disponible | no disponible | Clasificación direccional de inflación | no disponible | no disponible |

## Limitaciones y advertencias

- Predicciones individuales ruidosas: el autor indica explícitamente que el valor del modelo proviene de promediar miles de predicciones por período; no debe usarse una etiqueta aislada para tomar decisiones.
- Dominio y registro restringidos: entrenado con títulos de r/economy, r/Economics y r/wallstreetbets sobre inflación de Estados Unidos entre 2008 y 2022. Otros países, otros registros y el vocabulario posterior a 2022 quedan fuera de distribución.
- Desequilibrio de clases: `down` es la clase minoritaria del conjunto de referencia y la más difícil; aunque la pérdida se balanceó durante el entrenamiento, la exhaustividad de `down` sigue siendo inferior.
- Textos cortos: el ajuste se hizo sobre títulos (mediana de 11 palabras, máximo de 52). Los comentarios largos se truncan y no se vieron durante el entrenamiento.
- Dirección, no postura ni sentimiento: el modelo no indica si el autor desea que la inflación suba o baje, ni si la noticia es buena o mala, solo hacia dónde se dice que van los precios.
- Solo inglés: no hay soporte declarado para otros idiomas, y el vocabulario económico en castellano no fue parte del entrenamiento.
- Riesgo de alucinación: al ser un clasificador no genera texto, por lo que no alucina contenido, pero sí puede asignar etiquetas sin fundamento en textos ambiguos, irónicos o fuera de dominio, y no ofrece una puntuación de confianza calibrada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base Qwen2.5-0.5B y citar el artículo de referencia en trabajos derivados.
- Métricas no verificadas: los valores del `model-index` están marcados como `verified: false` y proceden del propio autor.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreadm/reddit-pulse-qwen2.5_0.5b-xqdora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio de código (ajuste fino e inferencia): https://github.com/andrea-dm/reddit-pulse
- Artículo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026), "Reddit's 'pulse' on US inflation: forecasting with large language models", Journal of Applied Econometrics (en prensa).
- Versión de trabajo: Banca d'Italia, Questioni di Economia e Finanza (Occasional Papers) n.º 1028, junio de 2026, doi:10.32057/0.QEF.2026.1028
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (corresponden a fichas de un supermercado en Francia), por lo que no se incluye ningún enlace adicional procedente de esa búsqueda.
