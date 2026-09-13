# andreadm/reddit-pulse-qwen2.5_1.5b-xqdora

## Resumen

`reddit-pulse-qwen2.5_1.5b-xqdora` es un clasificador de tres clases que etiqueta textos cortos en inglés sobre economía según la dirección de las expectativas de inflación: los precios suben (`up`), bajan (`down`) o no hay señal direccional (`neutral`). No es un modelo de sentimiento: "la inflación cae con fuerza" es una buena noticia pero se etiqueta `down`, porque lo que se mide es la dirección del nivel de precios, no el tono del autor. Lo desarrolla el autor de HuggingFace `andreadm` como parte del proyecto Reddit Pulse, asociado al trabajo de Del Monaco, Longo, Marcucci y Tafani (2026) publicado en el Journal of Applied Econometrics.

Técnicamente es un adaptador PEFT de tipo xQDoRA+ (DoRA sobre las proyecciones de atención con tasas de aprendizaje LoRA+) montado sobre `Qwen/Qwen2.5-1.5B`, un transformer decoder-only de 1.500 millones de parámetros que se carga cuantizado en 4 bits NF4 con doble cuantización, tal y como se entrenó. La cabeza es de clasificación de secuencias con tres etiquetas y `max_length` de 1024 tokens en inferencia, aunque el entrenamiento se hizo sobre títulos de Reddit (mediana de 11 palabras, máximo 52).

Su relevancia es metodológica: es una de las piezas pequeñas que alimentan un indicador de alta frecuencia de expectativas de inflación a partir de texto informal. El valor no está en la predicción individual, que es ruidosa, sino en el promedio de miles de predicciones por periodo. El repositorio no tiene descargas ni likes y las métricas declaradas están marcadas como no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador DoRA sobre proyecciones de atencion y cabeza de clasificacion de 3 clases |
| Parametros totales | 1.500 millones en el modelo base; tamano del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-1.5B declara 32.768 tokens nativos. La inferencia de referencia trunca a 1024 tokens y el entrenamiento uso titulos de 11 palabras de mediana (maximo 52) |
| Tipos de cuantizacion | Base cargada en 4-bit NF4 con doble cuantizacion (`bitsandbytes`); adaptador en safetensors. No se publican pesos GGUF |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base tambien en safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B (relacion: adapter) |
| Libreria | peft (requiere ademas transformers y bitsandbytes) |
| Tarea | text-classification (3 clases: down / neutral / up) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT, no un checkpoint completo. Sobre `Qwen/Qwen2.5-1.5B` —un transformer decoder-only autorregresivo— se aplican adaptadores DoRA en las proyecciones de atención y se entrena con tasas de aprendizaje LoRA+ durante el ajuste. La variante se denomina xQDoRA+ en la model card. La base se cuantiza en 4 bits NF4 con doble cuantización tanto en entrenamiento como en inferencia, y la cabeza de clasificación sustituye la salida de lenguaje por tres logits correspondientes a `down`, `neutral` y `up`.

Los datos de entrenamiento son títulos de envíos de los subreddits r/economy, r/Economics y r/wallstreetbets sobre inflación en Estados Unidos, con cobertura temporal de 2008 a 2022. No se especifica el número de tokens ni el tamaño exacto del conjunto de entrenamiento. La pérdida se balanceó por clase, ya que `down` es la clase minoritaria del conjunto de referencia. No hay constancia de RLHF, DPO ni preferencias humanas: es un ajuste supervisado de clasificación. La innovación relevante no es arquitectónica sino metodológica: un clasificador pequeño sobre una base cuantizada que se agrega temporalmente para generar señal macroeconómica.

## Capacidades

- Clasificación direccional de expectativas de inflación en textos cortos en inglés: `up`, `neutral` o `down`.
- Asignación de etiquetas con codificación numérica heredada del corpus del artículo (`down = -1`, `neutral = 0`, `up = 1`).
- Procesamiento de textos informales de registro coloquial (títulos de Reddit, titulares, publicaciones en redes sociales).
- Distinción entre dirección del nivel de precios y sentimiento o postura del autor.
- Carga autocontenida: el `config.json` del repositorio incluye la cabeza de tres clases, los nombres de etiqueta y el token de padding.
- Soporte de `tool calling` / `function calling`: no disponible (es un modelo de clasificación, no generativo en su uso previsto).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; solo inglés.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles.

## Casos de uso

- Construcción de indicadores de alta frecuencia de expectativas de inflación: se ejecuta el clasificador sobre miles o millones de títulos y comentarios de Reddit y se agrega la proporción de etiquetas `up` menos `down` por semana o mes. Es el caso de uso del artículo de referencia.
- Nowcasting macroeconómico: la serie agregada se incorpora como regresor en modelos de previsión de inflación, aprovechando su frecuencia más alta que las encuestas tradicionales de expectativas.
- Investigación académica en economía con texto no estructurado: etiquetado sistemático de corpus históricos de foros para estudiar cómo evoluciona la narrativa pública sobre precios entre 2008 y 2022.
- Etiquetado a escala y pseudo-etiquetado: generar etiquetas direccionales sobre corpus grandes para entrenar o validar clasificadores alternativos, siempre aplicando agregación para compensar el ruido por predicción.
- Seguimiento de conversación en foros financieros: monitorización de subreddits como r/wallstreetbets para detectar cambios de narrativa sobre precios antes de que aparezcan en prensa especializada.
- Análisis retrospectivo de episodios de shock inflacionista: reconstrucción de la secuencia temporal de expectativas direccionales durante el repunte de 2021-2022 a partir del archivo de Reddit.
- Filtrado previo en tuberías de análisis: descartar o priorizar textos con señal direccional clara antes de pasarlos a modelos más caros, reduciendo coste computacional.
- Apoyo a equipos de análisis macro en bancos centrales o gestoras: generación de una señal complementaria, nunca sustitutiva, de las encuestas oficiales de expectativas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, sobre el split de test del conjunto de referencia de inflación de Reddit (Del Monaco, Longo, Marcucci y Tafani, 2026), semilla 1329496050. Ninguna métrica está verificada de forma independiente.

| Metrica | Valor |
|---|---|
| Accuracy | 0,6763 |
| F1 (weighted) | 0,6779 |
| F1 (macro) | 0,6538 |
| ROC-AUC (macro, one-vs-rest) | 0,8355 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos, ni desglose por clase de accuracy o recall.

## Requisitos de hardware

- VRAM para inferencia: el modelo base en 4 bits NF4 ocupa del orden de 1 GB de pesos; con activaciones, tokenizador y lote pequeño, el pico se situa en torno a 2-3 GB. En bfloat16 sin cuantizar serian aproximadamente 3 GB de pesos, con pico de 4-5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; T4, L4, RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, pero son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna, e incluso en iGPU con memoria compartida suficiente si se resuelve la compatibilidad de `bitsandbytes`.
- Opciones de despliegue: la ruta de referencia es `transformers` + `peft` + `bitsandbytes`, tal y como aparece en la model card. El adaptador no debe cargarse pasando el nombre del repositorio directamente a `AutoModelForSequenceClassification`, porque el atajo de adaptadores de transformers reconstruye el DoRA con logits distintos a los del modelo entrenado. Compatibilidad con vLLM, TGI, Ollama o llama.cpp: no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados publicados que permitan comparar el rendimiento de este adaptador con alternativas. La tabla recoge unicamente los datos verificables de disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Tarea | Rendimiento comparado |
|---|---|---|---|---|---|
| andreadm/reddit-pulse-qwen2.5_1.5b-xqdora | 1.500 M (base) + adaptador DoRA | No especificado; inferencia a 1024 tokens | Apache-2.0 | Clasificacion direccional de inflacion (3 clases) | Accuracy 0,6763; F1 macro 0,6538; ROC-AUC 0,8355 |
| Qwen/Qwen2.5-1.5B (base, sin adaptador) | 1.500 M | 32.768 tokens declarados por el autor del modelo base | Apache-2.0 | Modelo generativo de lenguaje general | No disponible para esta tarea |
| Clasificadores de sentimiento financiero de referencia (por ejemplo, familia FinBERT) | No disponible | No disponible | No disponible | Sentimiento financiero, no direccion de precios | No disponible |

## Limitaciones y advertencias

- Las predicciones individuales son ruidosas. El modelo esta disenado para agregarse sobre miles de observaciones por periodo; no debe usarse como oraculo de una sola frase.
- Dominio y registro restringidos: entrenado con titulos de r/economy, r/Economics y r/wallstreetbets sobre inflacion estadounidense entre 2008 y 2022. Otros paises, otros registros y vocabulario posterior a 2022 quedan fuera de distribucion.
- Desbalance de clases: `down` es la clase minoritaria del conjunto de referencia y la mas dificil. Aunque la perdida se balanceo durante el entrenamiento, el recall de `down` sigue siendo inferior.
- Textos largos: el ajuste se hizo sobre titulos (mediana de 11 palabras, maximo 52). Los comentarios largos se truncan y no se vieron durante el entrenamiento.
- No mide postura ni sentimiento: no indica si el autor desea que la inflacion suba o baje, ni si la noticia es buena o mala.
- Solo ingles. No hay soporte multilingue declarado.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud ni de idoneidad para decisiones economicas o financieras.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de etiquetas incorrectas con alta confianza en textos ambiguos o fuera de dominio.
- Requisito tecnico critico: hay que cargar el adaptador con `PeftModel.from_pretrained` sobre la base cuantizada en 4 bits NF4. El atajo de adaptadores de transformers produce logits distintos a los del modelo entrenado.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta; las metricas declaradas estan marcadas como no verificadas.
- La model card advierte que la seccion de limitaciones fue generada automaticamente y que falta el desglose por clase.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreadm/reddit-pulse-qwen2.5_1.5b-xqdora
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Codigo de ajuste fino e inferencia: https://github.com/andrea-dm/reddit-pulse
- Articulo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026), "Reddit's 'pulse' on US inflation: forecasting with large language models", Journal of Applied Econometrics, en prensa.
- Version como documento de trabajo: Banca d'Italia, Questioni di Economia e Finanza (Occasional Papers) n.o 1028, junio de 2026, doi:10.32057/0.QEF.2026.1028

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas corporativas de Microsoft y no guardan relacion con la ficha.
