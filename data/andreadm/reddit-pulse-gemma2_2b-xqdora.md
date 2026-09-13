# andreadm/reddit-pulse-gemma2_2b-xqdora

## Resumen

reddit-pulse-gemma2_2b-xqdora es un clasificador de tres clases (subida / neutral / bajada) del signo direccional de las expectativas de inflación en textos cortos en inglés sobre economía. Lo desarrolla andreadm como adaptador PEFT de tipo xQDoRA+ (DoRA sobre las proyecciones de atención con tasas de aprendizaje LoRA+) montado sobre google/gemma-2-2b, con la base cuantizada en 4 bits NF4. El modelo no es un analizador de sentimiento: etiqueta hacia dónde se dice que van los precios, no si la noticia es buena o mala.

El checkpoint forma parte de la señal de inflación extraída de Reddit en el trabajo de Del Monaco, Longo, Marcucci y Tafani (2026), publicado como documento ocasional del Banco de Italia (Questioni di Economia e Finanza n.º 1028) y aceptado en el Journal of Applied Econometrics. Su función es etiquetar grandes volúmenes de titulares y publicaciones de foros para después agregar las predicciones por periodo y construir un indicador de alta frecuencia, no emitir juicios sobre textos individuales.

La relevancia práctica es doble: por un lado, demuestra un caso de uso concreto de adaptadores DoRA de bajo rango sobre un modelo pequeño para una tarea económica especializada; por otro, publica el código de ajuste fino e inferencia en abierto. El repositorio tiene 0 descargas y 0 me gusta, y las métricas declaradas no están verificadas por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT xQDoRA+ (DoRA en las proyecciones de atención, LoRA+ learning rates) sobre un transformer decoder-only google/gemma-2-2b, con cabeza de clasificación de tres clases; base cargada en 4 bits NF4 |
| Parametros totales | No disponible (adaptador de bajo rango; el tamaño de la base es google/gemma-2-2b, parámetros exactos no indicados en la información proporcionada) |
| Longitud de contexto | No disponible en la información; el ejemplo de uso trunca a 1024 tokens y el ajuste se hizo con títulos (mediana de 11 palabras, máximo 52) |
| Tipos de cuantizacion | Base en 4 bits NF4 con doble cuantización (bitsandbytes); adaptadores DoRA sin cuantizar; no se publican pesos GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT, librería peft); no se publican pesos fusionados ni versiones GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador de clasificación, no un modelo generativo: sobre el checkpoint preentrenado google/gemma-2-2b se aplican adaptadores DoRA en las proyecciones de atención, se entrena con tasas de aprendizaje diferenciadas de tipo LoRA+ y se añade una cabeza de secuencia con tres etiquetas (`down` = 0, `neutral` = 1, `up` = 2). La base se mantiene cuantizada en 4 bits NF4 con doble cuantización durante el entrenamiento y la inferencia, de modo que el cargador debe reproducir esa configuración junto con el adaptador; la model card advierte explícitamente de que pasar el nombre del repositorio directamente a `AutoModelForSequenceClassification` reconstruye el adaptador DoRA con logits distintos a los del modelo entrenado.

Los datos de ajuste son títulos de envíos de Reddit (r/economy, r/Economics y r/wallstreetbets) sobre inflación en Estados Unidos entre 2008 y 2022, con un conjunto de referencia anotado a mano y un protocolo de partición por semilla (la evaluación declarada usa la partición de test reservada de la semilla 3266123502). La pérdida se balanceó por clase durante el entrenamiento. No se indica en la información disponible el número de tokens de entrenamiento, la composición detallada del corpus ni si hubo etapas de RLHF o DPO (no aplicables a una tarea de clasificación). El código de ajuste fino e inferencia sobre el corpus completo está en el repositorio andrea-dm/reddit-pulse.

## Capacidades

- Clasificación direccional de expectativas de inflación en tres clases: subida, neutral y bajada, a partir de títulos o textos de longitud similar.
- Inferencia por lotes con `transformers` y `peft`, con `padding_side = "left"` y truncado (el ejemplo de la model card usa `max_length=1024`).
- Distinción entre dirección del nivel de precios y sentimiento o postura del autor: "inflation falls sharply" se etiqueta como bajada aunque sea una buena noticia.
- Etiquetado a escala de textos económicos informales en inglés (títulos de Reddit, titulares, publicaciones en redes sociales) para su agregación posterior por periodo.
- Salida de logits por clase, lo que permite usar la probabilidad como señal continua en lugar de la etiqueta discreta.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio: la cabeza de clasificación sustituye a la cabeza causal.
- No soporta tool calling, function calling ni flujos de agentes o razonamiento multi-paso.
- Capacidad multilingüe: no disponible; el modelo está entrenado y declarado únicamente para inglés.

## Casos de uso

- Construcción de un indicador de alta frecuencia de expectativas de inflación: etiquetar miles de títulos por periodo y agregar las predicciones, que es el uso para el que se diseñó el modelo y en el que los errores idiosincrásicos se compensan entre sí.
- Nowcasting macroeconómico en investigación: incorporar la serie agregada resultante como variable explicativa en modelos de previsión de inflación de EE. UU., siguiendo el planteamiento del trabajo de Del Monaco y colaboradores.
- Etiquetado de corpus para anotación asistida: preanotar grandes volúmenes de textos económicos antes de una revisión humana, aprovechando la salida de tres clases y las probabilidades por clase.
- Seguimiento de medios y redes: monitorizar titulares y publicaciones sobre precios para detectar cambios de dirección en el discurso público a lo largo del tiempo.
- Análisis de foros de inversión: medir el tono direccional sobre precios en comunidades como r/wallstreetbets, donde el registro informal y el vocabulario específico coinciden con parte de los datos de entrenamiento.
- Señal auxiliar en pipelines de riesgo y alerta temprana: combinar la serie agregada con otros indicadores de mercado para contextualizar episodios de tensión inflacionista, siempre con validación previa en el dominio propio.
- Reproducción y extensión académica: el código de ajuste e inferencia está publicado, de modo que el checkpoint sirve como línea base para comparar otras arquitecturas o estrategias de adaptación en la misma tarea.
- Filtrado selectivo de contenido: usar la clase neutral para descartar textos sin señal direccional y reducir el volumen que se pasa a etapas posteriores de análisis más costosas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index de la model card, ninguno verificado por terceros (`verified: false`). Tarea: clasificación direccional de expectativas de inflación (up / neutral / down). Conjunto: Reddit inflation gold set (Del Monaco, Longo, Marcucci y Tafani, 2026), partición de test reservada de la semilla 3266123502.

| Metrica | Valor |
|---|---|
| Accuracy | 0.7194 |
| F1 ponderado (weighted) | 0.7174 |
| F1 macro | 0.6923 |
| ROC-AUC macro (one-vs-rest) | 0.8562 |

No se han publicado en la información disponible resultados comparativos con otros modelos, ni desglose por clase, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con la base en 4 bits NF4 y doble cuantización, los pesos ocupan del orden de 1,3 a 1,7 GB para una base de aproximadamente 2.000 millones de parámetros; sumando activaciones y sobrecarga de la librería, por debajo de 3 GB en lotes pequeños. Estimación propia: la información proporcionada no incluye cifras de VRAM.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM resulta suficiente; una RTX 3060 de 12 GB, una RTX 4060 o una RTX 4090 permiten lotes grandes. Las A100 y H100 no son necesarias para este tamaño, aunque reducen el tiempo de etiquetado de corpus masivos.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media y de gama alta para consumidores.
- Alternativa sin GPU: la carga cuantizada en 4 bits depende de bitsandbytes; para inferencia en CPU habría que cargar la base en bfloat16, lo que eleva el uso de memoria a varios gigabytes (estimación no confirmada por el autor).
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes`, reproduciendo la configuración de entrenamiento. No hay soporte documentado ni pesos GGUF para llama.cpp u Ollama, y no se documenta despliegue en vLLM o TGI, ya que se trata de una cabeza de clasificación con adaptador DoRA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la información disponible, ni resultados de benchmarks de alternativas sobre la misma tarea y el mismo conjunto de evaluación. La única comparación que puede establecerse con los datos disponibles es frente al checkpoint base del que deriva:

| Modelo | Tipo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| andreadm/reddit-pulse-gemma2_2b-xqdora | Adaptador PEFT xQDoRA+ con cabeza de clasificación | Clasificación direccional de expectativas de inflación (3 clases) | No disponible (base google/gemma-2-2b) | No disponible | gemma | HuggingFace, 0 descargas y 0 me gusta |
| google/gemma-2-2b | Transformer decoder-only generativo | Generación de texto general | No disponible en la información proporcionada | No disponible en la información proporcionada | gemma | HuggingFace |

Alternativas específicas para clasificación de textos económicos o de inflación: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Predicciones individuales ruidosas: el valor del modelo procede de promediar miles de predicciones por periodo; no debe usarse una etiqueta aislada como conclusión.
- Dominio y registro restringidos: entrenado con títulos de r/economy, r/Economics y r/wallstreetbets sobre inflación de Estados Unidos entre 2008 y 2022; otros países, otros registros y vocabulario posterior a 2022 quedan fuera de distribución.
- Desequilibrio de clases: `down` es la clase minoritaria y la más difícil; aunque la pérdida se balanceó durante el entrenamiento, su exhaustividad sigue siendo inferior.
- Textos cortos: el ajuste se hizo con títulos (mediana de 11 palabras, máximo 52); los comentarios largos se truncan y no se vieron durante el entrenamiento.
- Dirección, no postura ni sentimiento: el modelo no indica si el autor desea que la inflación se mueva, ni si la noticia es buena o mala.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones incorrectas con confianza alta en textos ambiguos o fuera de dominio.
- Idioma: únicamente inglés; no hay evidencia de comportamiento en castellano u otros idiomas.
- Licencia gemma: el uso comercial y la redistribución quedan sujetos a los términos de Gemma, que imponen obligaciones adicionales a las de una licencia de código abierto permisiva.
- Advertencia de carga: pasar el identificador del repositorio a `AutoModelForSequenceClassification` reconstruye el adaptador DoRA con logits distintos a los del modelo entrenado; debe usarse `PeftModel.from_pretrained` sobre la base cuantizada.
- Validación comunitaria nula: 0 descargas y 0 me gusta, y todas las métricas declaradas figuran como no verificadas.
- La propia model card indica que fue generada parcialmente de forma automática y que su sección de limitaciones es genérica, sin desglose por clase de las tarjetas escritas a mano.
- Los resultados de búsqueda web disponibles no contienen información relacionada con este modelo: todos los enlaces devueltos corresponden a foros en francés sobre servicios bancarios, sin relación con el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreadm/reddit-pulse-gemma2_2b-xqdora
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Código de ajuste fino e inferencia: https://github.com/andrea-dm/reddit-pulse
- Trabajo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026), "Reddit's 'pulse' on US inflation: forecasting with large language models", Journal of Applied Econometrics (en prensa); versión de trabajo en Banca d'Italia, Questioni di Economia e Finanza n.º 1028, junio de 2026, doi:10.32057/0.QEF.2026.1028
- Resultados de búsqueda web: sin enlaces relevantes (los resultados devueltos no guardan relación con el modelo)
