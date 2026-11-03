# jack1211son/abdta-single-task-aspect-v4-0pct-4x-equal

## Resumen

`abdta-single-task-aspect-v4-0pct-4x-equal` es un clasificador de texto derivado de `microsoft/deberta-v3-large` (435 millones de parametros) y ajustado por el autor `jack1211son` para el analisis de tono en la divulgacion de riesgos (aspect-based risk-disclosure tone analysis, ABDTA) en memorias anuales de empresas cotizadas en Indonesia. El modelo resuelve una tarea concreta de clasificacion de sentimiento a nivel de aspecto: dado un par (riesgo, aspecto) codificado en el propio texto de entrada, asigna una etiqueta de tono (`Positive`, `Negative`, `Neutral`) sobre una de las 14 categorias de aspecto predefinidas (Economics, Profit|Loss, Dividend, Financing, Brand, Technology, Investment, Governance, Product|Service, M&A, Legal, Environment, Social&People, Political).

Se trata de un checkpoint final de una coleccion experimental en la que se comparan variantes de entrenamiento segun la tasa de dropout de palabras clave de aspecto (`0pct` frente a `25pct`), el tipo de aumento de pseudo-etiquetas (`2x`, `4x`) y el balanceo de aspectos (`equal` frente a `train-dist`). Esta variante concreta corresponde a dropout del 0 %, aumento 4x y distribucion balanceada de aspectos. El modelo es relevante para equipos de investigacion financiera que necesiten analisis de narrativa corporativa a nivel de aspecto con un transformer encoder de tamano medio, aunque su alcance es limitado: no predice precios ni retornos, solo clasifica lenguaje de divulgacion.

La ficha se basa unicamente en la model card publicada y en los metadatos de HuggingFace; no se han publicado resultados de benchmarks ni detalles de entrenamiento (tokens, composicion del dataset, proceso de anotacion) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, disentangled attention con atención relativa y contenido) |
| Parametros totales | 435.076.110 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (limite de entrada indicado en la model card) |
| Tipos de cuantizacion | No disponible (repo en safetensors fp32/fp16; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (libreria `transformers`, `AutoModelForSequenceClassification`) |
| Modelo base | `microsoft/deberta-v3-large` (finetune) |
| Tarea | Clasificacion de texto (sentiment a nivel de aspecto, 3 clases de tono) |
| Etiquetas de tono | `Positive`, `Negative`, `Neutral` |
| Etiquetas de aspecto | 14 categorias (Economics, Profit\|Loss, Dividend, Financing, Brand, Technology, Investment, Governance, Product\|Service, M&A, Legal, Environment, Social&People, Political) |
| Tamano del repo | 1.7 GB |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un transformer encoder con atención desenredada (disentangled attention) que separa las representaciones de contenido y posicion, y que en su version v3 emplea tokenizador SentencePiece y preentrenamiento con denoising por span. Sobre esa base se ha realizado un finetune supervisado para clasificacion de secuencias con tres clases de salida (tono). La entrada no es texto libre puro: la model card exige un formato enriquecido con palabras clave de riesgo y de aspecto, del tipo `[Risk Keywords: <risk words> Aspect Keywords: <aspect words>] <sentence>`, que debe reproducir la misma extraccion de palabras clave usada en los cuadernos del proyecto.

El checkpoint pertenece a una familia de experimentos que varian tres ejes: dropout de palabras clave de aspecto durante el entrenamiento (`0pct` o `25pct`), aumento de datos mediante pseudo-etiquetado (`2x` o `4x`) y balanceo de la distribucion de aspectos (`equal` o `train-dist`). Esta variante combina 0 % de dropout, aumento 4x y balanceado `equal`. Segun la model card, los pesos aprendidos no se han modificado respecto a la carpeta original descargada (`model_single_task_aspect_v4_0%_4x_equal`) y el modelo esta pensado para reentrenamiento final sobre datos de entrenamiento mas validacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo RLHF, DPO o calibracion posterior; tampoco se detalla el proceso de anotacion de las etiquetas de tono ni de aspecto.

## Capacidades

- Clasificacion de tono a nivel de aspecto sobre frases de divulgacion de riesgos en memorias anuales, con tres etiquetas (`Positive`, `Negative`, `Neutral`).
- Clasificacion multiaspecto: el mismo modelo cubre 14 categorias de aspecto definidas por el autor.
- Procesamiento de entradas enriquecidas con palabras clave de riesgo y aspecto inyectadas en el texto, lo que permite condicionar la prediccion al par (riesgo, aspecto) sin necesidad de cabeceras adicionales.
- Clasificacion de secuencias cortas: ventana de 256 tokens, adecuada para frases o parrafos breves de narrativa corporativa.
- Solo ingles: no se declara soporte multilingue, aunque el corpus objetivo son memorias anuales de empresas indonesias (lo que sugiere traduccion previa o anotacion en ingles; no se detalla en la informacion disponible).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es un clasificador encoder puro.
- Salida limitada a logits de clasificacion; no genera texto.

## Casos de uso

- Analisis de sentimiento en informes anuales: integrar el modelo en un pipeline que extraiga frases de la seccion de gestion de riesgos y las clasifique por aspecto (por ejemplo, `Financing` o `Governance`), permitiendo construir indicadores agregados de tono por categoria para comparar emisoras.
- Monitorizacion de divulgacion de riesgos en el tiempo: aplicar el clasificador a memorias de ejercicios consecutivos de la misma empresa y medir desplazamientos de tono en aspectos concretos (`Legal`, `Environment`, `M&A`), con la ventana de 256 tokens suficiente para frases individuales.
- Investigacion academica en finanzas: usar el modelo como etiquetador de referencia en estudios de narrativa corporativa, dado que la coleccion ABDTA esta disenada para comparaciones controladas entre variantes de entrenamiento (dropout, aumento, balanceo).
- Filtrado y priorizacion de fragmentos: clasificar grandes volumenes de texto de memorias para seleccionar las frases con tono negativo en aspectos sensibles (`Profit|Loss`, `Legal`, `Environment`) y enviarlas a revision humana, reduciendo el coste de analisis manual.
- Construccion de datasets etiquetados: emplear el modelo como pseudo-etiquetador para generar conjuntos de entrenamiento a nivel de aspecto, aprovechando que el autor ya documenta variantes de aumento 2x y 4x.
- Analisis de riesgo regulatorio y ESG: explotar las etiquetas `Environment`, `Social&People` y `Governance` para extraer senales de tono en divulgacion ESG de emisoras, con la cautela de que el modelo solo clasifica lenguaje y no valida afirmaciones.
- Evaluacion comparativa de modelos de clasificacion financiera: servir como baseline DeBERTa-v3-large finetuned frente a otros clasificadores de sentimiento financiero en tareas de aspecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1 ni comparaciones con otros modelos, y tampoco se publican los CSV de evaluacion a nivel de frase como assets del repositorio.

## Requisitos de hardware

- Inferencia en fp32: los 435 millones de parametros ocupan aproximadamente 1,7 GB de pesos, por lo que se necesita en torno a 2-3 GB de VRAM considerando activaciones y overhead de runtime para batches pequenos.
- Inferencia en fp16/bf16: pesos en torno a 0,9 GB; VRAM estimada de 1,5-2 GB para batch 1-8 con secuencias de 256 tokens.
- Cabe en GPU consumer: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar el modelo con comodidad; incluso CPU es viable para volumentes moderados.
- GPU recomendadas para produccion: A10G, L4 o T4 para throughput alto por coste; A100/H100 solo si se procesan millones de frases en paralelo o se necesita baja latencia agregada.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (tag presente en el repo, orientado a endpoints compatibles), y despliegue via HuggingFace Inference Endpoints. No se han publicado pesos GGUF, por lo que `llama.cpp`/`Ollama` no estan soportados de forma directa; vLLM y TGI no estan validados para este checkpoint en la informacion disponible.
- Latencia y throughput: no disponibles. Para un encoder de 435 M parametros en una GPU moderna se puede esperar decenas de milisegundos por frase y throughput de miles de frases por segundo con batching, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jack1211son/abdta-single-task-aspect-v4-0pct-4x-equal` | 435 M | 256 tokens | Clasificacion de tono por aspecto (14 aspectos) | No disponible | HuggingFace, 0 descargas |
| `microsoft/deberta-v3-large` | 435 M | 512 tokens (tipico en DeBERTa-v3) | Clasificacion/generacion de representaciones general | MIT (según el modelo base) | HuggingFace, ampliamente usado |
| `ProsusAI/finbert` | ~110 M | 512 tokens | Sentimiento financiero (3 clases, sin aspecto) | No disponible en la informacion | HuggingFace, muy usado |
| `yiyanghkust/finbert-tone` | ~110 M | 512 tokens | Tono financiero (positivo/negativo/neutral) | No disponible en la informacion | HuggingFace, usado en investigacion |

La comparativa se limita a modelos de clasificacion financiera conocidos; no se dispone de datos de rendimiento comparativo para este checkpoint. La diferencia clave frente a FinBERT y FinBERT-tone es la granularidad por aspecto (14 categorias) y el formato de entrada con palabras clave inyectadas, que este modelo exige y los alternativos no.

## Limitaciones y advertencias

- No hay licencia declarada en el repositorio: el uso comercial queda sin autorizacion explicita y debe consultarse con el autor antes de desplegarlo en produccion.
- El modelo no predice precios ni retornos; la propia model card lo advierte. Cualquier uso como senal de inversion es un error de interpretacion.
- Ventana de contexto de solo 256 tokens: frases o parrafos mas largos se truncan, lo que puede perder informacion relevante y degradar la clasificacion.
- Dependencia critica del preprocesado: la entrada debe seguir el formato `[Risk Keywords: ... Aspect Keywords: ...] <sentence>` con la misma extraccion de palabras clave del proyecto original; un uso con texto plano produciria predicciones fuera de distribucion.
- Solo ingles: las memorias anuales de empresas indonesias estan presumiblemente en indonesio o en ingles; no se documenta el tratamiento del idioma original ni la calidad de la traduccion.
- Corpus de dominio muy especifico (divulgacion de riesgos en memorias anuales de emisoras indonesias): el modelo puede generalizar mal a otros generos financieros (notas de prensa, transcripciones de resultados, 10-K estadounidenses) o a otros idiomas.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero las etiquetas pueden ser erroneas por descalibracion, especialmente en clases poco representadas o en frases ambiguas; no se publican metricas de calibracion ni matrices de confusion.
- Sesgos potenciales derivados del corpus de entrenamiento (empresas cotizadas indonesias, un periodo temporal concreto) y del pseudo-etiquetado 4x, que puede amplificar errores del etiquetador inicial.
- Cero descargas y cero likes en HuggingFace: no hay evidencia de validacion externa ni de uso en produccion por terceros.
- No se publican los CSV de evaluacion a nivel de frase, lo que impide reproducir las metricas del autor.
- El checkpoint esta pensado como modelo final de una coleccion experimental; su uso fuera del contexto ABDTA no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jack1211son/abdta-single-task-aspect-v4-0pct-4x-equal
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Paper de DeBERTa-v3 (He et al., 2021): https://arxiv.org/abs/2111.09543
- Repositorio DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
- Documentacion de `AutoModelForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/deberta-v3
- No se han encontrado en la informacion proporcionada papers, blogs, repos complementarios ni demos especificos de la coleccion ABDTA.
