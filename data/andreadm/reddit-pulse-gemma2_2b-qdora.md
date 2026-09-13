# andreadm/reddit-pulse-gemma2_2b-qdora

## Resumen

`andreadm/reddit-pulse-gemma2_2b-qdora` es un adaptador PEFT de clasificación de texto entrenado sobre `google/gemma-2-2b`. Concretamente, resuelve una tarea de tres clases sobre la dirección de las expectativas de inflación en textos cortos en inglés: el texto indica que los precios van **up** (arriba), **down** (abajo) o no contiene señal direccional (**neutral**). No es un modelo de sentimiento: "inflation falls sharply" se etiqueta como *down* aunque sea una buena noticia, y "rents are out of control" se etiqueta como *up* aunque sea una mala noticia. La dirección se refiere al nivel de precios, no al tono del autor.

El checkpoint es uno de los clasificadores de modelo pequeño que alimentan la señal de inflación de Reddit descrita en Del Monaco, Longo, Marcucci y Tafani (2026), *Reddit's 'pulse' on US inflation: forecasting with large language models*, en el Journal of Applied Econometrics (versión de trabajo: Banca d'Italia, Questioni di Economia e Finanza n.º 1028, junio de 2026). Su función prevista es etiquetar grandes volúmenes de textos informales y cortos sobre economía para después **agregar** las predicciones en el tiempo, no emitir juicios fiables título a título.

Técnicamente, el adaptador es un QDoRA+: la base se carga cuantizada en 4 bits NF4 con doble cuantización, los adaptadores DoRA se aplican sobre las proyecciones de atención y el entrenamiento usa tasas de aprendizaje LoRA+. El repositorio pesa aproximadamente 0,1 GB, la licencia es Gemma y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (DoRA/QDoRA+) sobre un transformer decoder-only `google/gemma-2-2b` con base cuantizada en 4 bits |
| Parametros totales | Modelo base de 2B (denominación del checkpoint `google/gemma-2-2b`) más un cabezal de clasificación de 3 clases; número exacto de parámetros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la información disponible; el ejemplo de uso trunca las entradas a 1024 tokens |
| Tipos de cuantizacion | Base en 4 bits NF4 con `bnb_4bit_use_double_quant=True` y `bnb_4bit_compute_dtype=bfloat16` (bitsandbytes); los pesos del adaptador se cargan aparte |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (licencia de Google para la familia Gemma) |
| Formato de pesos | safetensors, adaptador PEFT (requiere `peft` y `bitsandbytes`); tamaño del repositorio ≈ 0,1 GB |
| Pipeline | text-classification (3 clases: down / neutral / up) |
| Modelo base | google/gemma-2-2b |
| Autor | andreadm |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint `google/gemma-2-2b`, un transformer decoder-only, sobre el que se añade un cabezal de clasificación de tres clases y adaptadores DoRA en las proyecciones de atención. La base se carga cuantizada en 4 bits NF4 con doble cuantización y el cálculo se realiza en bfloat16; es decir, el adaptador se entrena y se sirve sobre la misma configuración cuantizada. El entrenamiento emplea tasas de aprendizaje diferenciadas de tipo LoRA+ (el autor lo denomina QDoRA+/xQDoRA+). El repositorio incluye en su `config.json` el cabezal de tres clases, los nombres de las etiquetas y el token de padding, de modo que no hace falta pasar argumentos adicionales más allá del nombre del repositorio.

Los datos de entrenamiento son títulos de envíos de Reddit sobre inflación **estadounidense** entre 2008 y 2022, procedentes de r/economy, r/Economics y r/wallstreetbets. Se trata de textos muy cortos (mediana de 11 palabras, máximo de 52), de registro informal. El conjunto de referencia (gold set) está etiquetado a mano y la pérdida se balanceó por clase durante el entrenamiento, ya que `down` es la clase minoritaria. No se detalla en la información proporcionada el número total de ejemplos de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; el ajuste es de tipo supervisado sobre una tarea de clasificación.

La codificación de etiquetas del modelo es: id 0 = `down` (codificado como −1 en los ficheros del corpus del artículo), id 1 = `neutral` (+0), id 2 = `up` (+1).

## Capacidades

- Clasificación direccional de textos cortos en inglés sobre inflación y precios: salida de 3 clases (`down`, `neutral`, `up`).
- Etiquetado a gran escala de títulos y textos de una frase de registro informal (Reddit, redes sociales, titulares).
- Distinción entre dirección del nivel de precios y sentimiento o postura del autor: no confunde "buena noticia" con "inflación bajando" ni "mala noticia" con "inflación subiendo".
- Integración como adaptador PEFT sobre una base cuantizada en 4 bits, lo que permite ejecutarlo con requisitos de memoria reducidos.
- Uso programático mediante `transformers` + `peft` + `bitsandbytes`, con el cabezal y los nombres de etiquetas ya definidos en el repositorio.
- No soporta generación de texto libre, razonamiento multi-paso, tool calling, function calling, agentes, visión ni audio: la información disponible no documenta ninguna de estas capacidades.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- **Construcción de un indicador de alta frecuencia de expectativas de inflación**: es el caso de uso del artículo. Se clasifican miles de títulos de Reddit por periodo y se agrega la proporción de etiquetas `up`, `neutral` y `down` para obtener una serie temporal; el valor está en la media de miles de predicciones, no en cada etiqueta individual.
- **Nowcasting macroeconómico en un banco central o departamento de research**: la serie agregada puede incorporarse como variable explicativa en modelos de previsión de inflación, aprovechando que el modelo capta señal en texto informal que no aparece en indicadores oficiales publicados con retardo.
- **Señal alternativa para mesas de trading y análisis cuantitativo**: seguimiento del tono direccional sobre precios en foros de inversión, con la advertencia de que el dominio de entrenamiento son foros estadounidenses entre 2008 y 2022.
- **Pre-etiquetado de corpus económicos para revisión humana**: el modelo puede anotar automáticamente grandes volúmenes de textos y reservar el esfuerzo humano para revisar los casos de baja confianza o la clase minoritaria `down`, cuyo recall es más bajo.
- **Monitorización continua de comunidades concretas**: despliegue sobre flujos de r/economy, r/Economics o r/wallstreetbets para detectar cambios de dirección en la narrativa sobre precios en ventanas temporales cortas.
- **Investigación académica replicable en economía del texto**: el código de ajuste fino e inferencia sobre el corpus completo está publicado, lo que permite reproducir la metodología del artículo y adaptarla a otros corpus o etiquetas.
- **Enriquecimiento de datasets para modelos mayores**: usar las etiquetas direccionales como característica auxiliar o como señal débil en el entrenamiento de clasificadores o modelos de previsión posteriores.
- **Análisis de titulares de prensa económica**: viable como prueba, pero fuera del dominio de entrenamiento (registro formal, no Reddit), por lo que requiere validación previa antes de cualquier uso en producción.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados por Hugging Face). Evaluación sobre el conjunto de referencia de inflación de Reddit (Del Monaco, Longo, Marcucci y Tafani, 2026), partición de test reservada con semilla 4054871397:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación direccional de expectativas de inflación (up / neutral / down) | Reddit inflation gold set, split test | Accuracy | 0,7266 |
| Clasificación direccional de expectativas de inflación (up / neutral / down) | Reddit inflation gold set, split test | F1 (weighted) | 0,7252 |
| Clasificación direccional de expectativas de inflación (up / neutral / down) | Reddit inflation gold set, split test | F1 (macro) | 0,6946 |
| Clasificación direccional de expectativas de inflación (up / neutral / down) | Reddit inflation gold set, split test | ROC-AUC (macro, one-vs-rest) | 0,8683 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos alternativos sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- **VRAM estimada para inferencia (aproximada, derivada del tamaño del checkpoint base)**: con la base en 4 bits NF4, del orden de 2-3 GB de pesos más el coste de activaciones y del adaptador; en bfloat16 sin cuantizar, del orden de 5-6 GB. Son estimaciones, no mediciones publicadas.
- **Memoria del adaptador**: el repositorio del adaptador ocupa aproximadamente 0,1 GB.
- **GPU recomendadas**: no hay recomendaciones publicadas por el autor. Por tamaño, cualquier GPU con 6-8 GB o más de VRAM debería poder ejecutar el modelo cuantizado; se ha documentado su uso con `device_map="auto"`, por lo que admite reparto entre dispositivos.
- **GPU de consumo**: sí, es esperable que quepa en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090) en la configuración 4 bits; no hay cifras confirmadas en la información disponible.
- **Opciones de despliegue**: el flujo documentado es `transformers` (AutoTokenizer, AutoConfig, AutoModelForSequenceClassification) + `peft` + `bitsandbytes`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; además, al tratarse de un cabezal de clasificación de 3 clases y no de un modelo generativo, los servidores orientados a generación no son aplicables directamente.
- **Advertencia de carga**: no se debe pasar el nombre del repositorio directamente a `AutoModelForSequenceClassification`, porque el atajo de adaptadores de transformers reconstruye el adaptador DoRA con logits distintos a los del modelo entrenado. Hay que cargar la base por separado y envolverla con `PeftModel.from_pretrained`.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye otros modelos comparables evaluados sobre el mismo conjunto de referencia, por lo que no es posible establecer una comparación cuantitativa. La tabla siguiente recoge únicamente lo que sí está documentado:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andreadm/reddit-pulse-gemma2_2b-qdora | Base de 2B + adaptador DoRA | No especificado (truncado a 1024 tokens en el ejemplo) | Accuracy 0,7266 / F1 macro 0,6946 / ROC-AUC macro 0,8683 en el gold set de Reddit | Gemma | HuggingFace (0 descargas, 0 likes) |
| google/gemma-2-2b (modelo base) | 2B | No disponible en la información proporcionada | No aplica: no es un clasificador de inflación | Gemma | HuggingFace |
| Otros clasificadores de expectativas de inflación o de sentimiento económico | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Predicciones individuales ruidosas**: el propio autor indica que el valor del modelo surge de promediar miles de predicciones por periodo, donde los errores idiosincrásicos se compensan. No debe usarse una etiqueta aislada como conclusión.
- **Desviación de dominio y registro**: entrenado exclusivamente con títulos de r/economy, r/Economics y r/wallstreetbets sobre inflación de Estados Unidos entre 2008 y 2022. Otros países, otros registros (prensa formal, documentos técnicos) y vocabulario posterior a 2022 quedan fuera de distribución.
- **Desbalance de clases**: `down` es la clase minoritaria del gold set y la más difícil; aunque la pérdida se balanceó durante el entrenamiento, su recall sigue siendo inferior al de las otras clases. Un indicador agregado puede infraestimar los episodios de desinflación.
- **Textos cortos**: el ajuste se hizo sobre títulos con mediana de 11 palabras y máximo de 52. Los comentarios largos se truncan y no se vieron durante el entrenamiento.
- **Dirección, no postura ni sentimiento**: el modelo no indica si el autor desea que la inflación suba o baje, ni si la noticia es buena o mala; solo la dirección que se atribuye a los precios.
- **Riesgo de alucinación**: no aplica en el sentido generativo (el modelo no produce texto libre), pero sí existe riesgo de falsos positivos direccionales en textos ambiguos, irónicos o con vocabulario fuera de distribución.
- **Licencia Gemma**: el uso comercial y la redistribución quedan sujetos a los términos de la licencia de Google para la familia Gemma, que impone obligaciones de uso aceptable y de atribución. Debe revisarse antes de cualquier despliegue en producción.
- **Caveats de integración**: es necesario cargar la base cuantizada y envolverla con `PeftModel`; el atajo de adaptadores de transformers produce logits distintos. El modelo no está pensado como oráculo autónomo, sino como componente de un indicador agregado.
- **Adopción nula verificable**: 0 descargas y 0 likes en Hugging Face, sin validación externa conocida más allá del artículo asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andreadm/reddit-pulse-gemma2_2b-qdora
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Código de ajuste fino e inferencia sobre el corpus completo: https://github.com/andrea-dm/reddit-pulse
- Artículo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026), *Reddit's 'pulse' on US inflation: forecasting with large language models*, Journal of Applied Econometrics (en prensa).
- Versión de trabajo: Banca d'Italia, Questioni di Economia e Finanza (Occasional Papers) n.º 1028, junio de 2026, doi:10.32057/0.QEF.2026.1028.
- Resultados de búsqueda web: no se ha recuperado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a servicios de correo electrónico sin relación con el modelo.
