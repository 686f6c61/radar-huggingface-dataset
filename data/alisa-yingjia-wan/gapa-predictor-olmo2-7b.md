# alisa-yingjia-wan/gapa-predictor-olmo2-7b

## Resumen

El GAPA predictor es un adaptador LoRA sobre el modelo base allenai/OLMo-2-1124-7B (7B parámetros) al que se le añade una cabeza de regresión escalar. No es un modelo generativo de propósito general: predice cuánto se lee como generizada una descripción física en inglés. Dado un atributo físico (por ejemplo, "facial stubble") y un género descrito (woman, man o nonbinary person), devuelve la valoración media que daría un anotador estadounidense en una escala de 1 a 7, donde 1 significa "nada asociado" y 7 "muy fuertemente asociado".

Lo desarrolla alisa-yingjia-wan (Yingjia Wan) y se publica junto al artículo "How Humans and LLMs Read Gender into 'Gender-Neutral' Physical Descriptions" (COLM 2026, arXiv:2609.16366). El problema que resuelve es de escala: recoger estas valoraciones con anotadores humanos es lento y caro, lo que limita su uso a muestras pequeñas. El predictor permite puntuar corpus completos, y en el artículo se emplea para analizar las descripciones de personajes de las 100 novelas de LitBank.

Técnicamente es un backbone transformer denso congelado de 7B, adaptado con LoRA (r=16, sobre q_proj y v_proj) más una cabeza Linear(4096, 1) → Sigmoid sobre el estado oculto de la última capa tras mean pooling. Solo se entrenan el adaptador (33 MB) y la cabeza. La entrada se trunca a 128 tokens con una plantilla fija y la salida se emite en [0, 1], reescalándose con x * 6 + 1 a la escala humana de 1 a 7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (OLMo-2 7B) congelado + adaptador LoRA + cabeza de regresion `Linear(4096, 1) → Sigmoid` sobre el estado oculto medio de la ultima capa |
| Parametros totales | Aproximadamente 7.000 millones en el backbone congelado; adaptador LoRA de 33 MB y cabeza de regresion entrenables |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens de entrada por llamada (`truncation=True`, `padding="max_length"`, `max_length=128`); la longitud de contexto del modelo base no se especifica en la model card |
| Tipos de cuantizacion | No disponible (solo se publican los pesos del adaptador en safetensors y la cabeza en PyTorch; no hay versiones GGUF ni cuantizadas oficiales) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `lora_adapters/`) y `regression_head.pt` (PyTorch) |
| Modelo base | `allenai/OLMo-2-1124-7B` (tambien referenciado como `allenai/OLMo2-7B-1124`) |
| Libreria | `peft` |
| Plantilla de prompt | `A {person_term} has {attribute}.` (fija desde el entrenamiento) |
| Rango de salida | `[0, 1]` interno, reescalado con `x * 6 + 1` a la escala 1-7 |
| Tamano del repositorio | 0,0 GB (aproximadamente 33 MB: adaptador LoRA + cabeza) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-08-08 / 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura parte de OLMo-2 7B, un transformer decoder denso que permanece completamente congelado. Sobre él se aplica un adaptador LoRA con `r=16`, `lora_alpha=16`, `lora_dropout=0.1` y módulos objetivo `q_proj` y `v_proj`. La representación de la frase se obtiene mediante mean pooling del estado oculto de la última capa y se proyecta a un escalar con `Linear(4096, 1)` seguido de una sigmoid. El objetivo de entrenamiento es una regresión escalar con pérdida MSE contra las valoraciones normalizadas a `[0, 1]`.

La configuración de entrenamiento estandarizada de la búsqueda de hiperparámetros es: learning rate 1e-4, scheduler coseno, warmup ratio 0,1, weight decay 0,01, batch size 8, máximo de 15 épocas, early stopping con paciencia 3, longitud máxima de secuencia 128 y semilla 123. El script de entrenamiento y el fichero de configuración completo están en el directorio `predictor/` del repositorio de GitHub.

Los datos de entrenamiento provienen del conjunto GAPA: 315 atributos físicos distintos en inglés valorados por 304 anotadores residentes en Estados Unidos, con un total de 14.706 valoraciones. Los atributos se extrajeron de tres fuentes complementarias para cubrir tanto vocabulario cotidiano como especializado (la model card se interrumpe en este punto, por lo que el detalle de las fuentes no está disponible). Cada llamada empareja un atributo con un género descrito, por lo que puntuar un atributo frente a los tres géneros requiere tres pases forward; el helper `predict()` los agrupa con `batch_size=32` y devuelve un DataFrame con las columnas `attribute`, `person_term` y `rating`.

## Capacidades

- Regresión de asociación de género: asigna a una descripción física una puntuación numérica en la escala humana de 1 a 7 para un género descrito concreto.
- Comparación de un mismo atributo frente a tres términos de persona (woman, man, nonbinary person) en una sola llamada mediante `predict()`.
- Puntuación por lotes de corpus completos, con batching configurable (`batch_size=32` por defecto), lo que permite sustituir la anotación manual en muestras grandes.
- Salida estructurada: DataFrame de pandas con atributo, término de persona y valoración; también devuelve objetos Python nativos con `as_dataframe=False`.
- Filtrado de la comparación a un subconjunto de términos de persona mediante el argumento `person_terms=[...]`.
- Análisis de sesgo y equidad: el modelo está etiquetado como `gender-bias`, `fairness` y `model-alignment`, y su uso previsto es auditar lenguaje descriptivo.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni modo de razonamiento. Tampoco es un modelo de chat.

## Casos de uso

- Auditoría de sesgo de género en corpus literarios: puntuar sistemáticamente las descripciones físicas de personajes de un conjunto de novelas (el artículo lo hace sobre las 100 obras de LitBank) y obtener una medida cuantitativa de qué atributos se asocian a qué género, algo inviable con anotación humana a esa escala.
- Evaluación de textos generados por LLMs: medir si las descripciones de personajes producidas por un modelo generativo reproducen estereotipos, comparando las puntuaciones del texto generado con las del corpus humano de referencia.
- Curación y auditoría de datasets de entrenamiento: ejecutar el predictor sobre los campos descriptivos de un dataset para detectar y cuantificar asociaciones de género antes de usar esos datos en el entrenamiento de otro modelo.
- Investigación en sociolingüística y psicología social: estimar las valoraciones medias de anotadores estadounidenses sin repetir el proceso de anotación, permitiendo análisis exploratorios sobre léxicos descriptivos ampliados.
- Análisis de guiones, subtítulos o prensa: procesar descripciones de personas en grandes volúmenes de texto para estudiar patrones de asociación entre atributos físicos y género a lo largo del tiempo o entre publicaciones.
- Control de calidad editorial y guías de estilo: revisar borradores o textos publicados para localizar frases que refuercen estereotipos, usando las puntuaciones como señal de alerta antes de la revisión humana.
- Selección de vocabulario en sistemas de generación o recomendación: consultar la tabla de puntuaciones atributo-género para escoger descripciones con asociaciones equilibradas, siempre como herramienta auxiliar y no como sustituto del juicio humano.
- Diagnóstico de alineación de modelos: integrar el predictor como componente de un pipeline de evaluación de sesgo dentro de un proceso de model alignment, comparando el comportamiento del modelo evaluado frente al de las valoraciones humanas del conjunto GAPA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de regresión (MAE, RMSE, correlación) frente a las valoraciones humanas del conjunto GAPA. Únicamente se ofrecen ejemplos ilustrativos de predicción, que no constituyen una evaluación comparativa.

Ejemplos de salida incluidos en la model card (escala 1-7):

| Atributo | woman | man | nonbinary person |
|---|---|---|---|
| facial stubble | 2,37 | 5,57 | 3,55 |
| a graceful figure | 5,76 | 3,16 | 4,09 |
| a wide jawline | 3,25 | 5,52 | 3,79 |
| a curvy build | 5,85 | 3,40 | 4,16 |
| glowing eyes | 3,62 | 3,58 | 3,54 |

## Requisitos de hardware

- VRAM estimada: en torno a 16 GB para inferencia cómoda en bf16, según la propia model card.
- Descarga inicial: el repositorio solo contiene el adaptador; el modelo base `allenai/OLMo-2-1124-7B` se descarga la primera vez (aproximadamente 14 GB).
- GPU recomendadas: A100 (40/80 GB), H100 y RTX 4090 (24 GB) ejecutan el modelo sin problemas.
- Cabe en GPU de consumo: sí. RTX 4090 y RTX 3090 (24 GB) con holgura; una GPU de 16 GB queda en el límite indicado por el autor. Por debajo de 16 GB haría falta cuantización, y no se publican versiones cuantizadas oficiales.
- Opciones de despliegue: `transformers` + `peft` + `huggingface_hub` + `pandas`, cargando el modelo a través del `modeling.py` incluido (`GAPARegressor.from_pretrained(".")`). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y dado que el modelo no genera texto sino que devuelve un escalar, los servidores de inferencia orientados a decodificación no son aplicables directamente.
- Latencia y throughput: no disponibles. La única referencia es el batching interno de `predict()` con `batch_size=32`, y el coste de puntuar un atributo frente a los tres géneros es de tres pases forward.
- Advertencia de carga: usar `PeftModel.from_pretrained()` carga el adaptador pero ignora silenciosamente la cabeza de regresión, dejando un generador de texto en lugar de un modelo de valoración y sin lanzar ningún error.

## Comparativa con modelos similares

No se identifican en la información disponible modelos públicos directamente comparables (mismo backbone, misma tarea de regresión de asociación de género y mismos datos). La comparación factible es entre enfoques metodológicos:

| Enfoque | Naturaleza | Coste por puntuacion | Datos de calibracion | Licencia / disponibilidad |
|---|---|---|---|---|
| GAPA predictor (OLMo-2 7B + LoRA) | Regresion escalar 1-7 sobre backbone de 7B | Tres pases forward por atributo; una GPU de 16 GB | 14.706 valoraciones humanas de 304 anotadores de EE. UU. sobre 315 atributos | Apache 2.0; adaptador de 33 MB en HuggingFace |
| Anotacion humana directa | Juicio humano en escala 1-7 | Alto y lento, segun la model card | Es la referencia del conjunto GAPA | No aplica |
| Clasificadores o regresores basados en encoders | Modelo discriminativo especifico por tarea | Bajo | No disponible | No disponible en la informacion proporcionada |
| LLM general mediante prompting | Generacion de texto convertida a puntuacion | Un pase por atributo y genero | Sin calibracion sobre el conjunto GAPA | Depende del modelo empleado |

El modelo base OLMo-2 7B es de acceso abierto con licencia Apache 2.0, lo que permite publicar el derivado bajo la misma licencia.

## Limitaciones y advertencias

- El checkpoint no es un adaptador PEFT convencional: cargarlo con `PeftModel.from_pretrained()` ignora la cabeza de regresión sin avisar y deja un generador de texto en lugar del modelo de valoración. Hay que usar el `modeling.py` incluido.
- La plantilla de prompt `A {person_term} has {attribute}.` está fijada en el entrenamiento. Cambiar su redacción o el tipo de pooling degrada las predicciones sin lanzar ningún error.
- La cabeza emite valores en `[0, 1]`. Si no se reescala con `x * 6 + 1`, los números siguen pareciendo plausibles pero están en la escala equivocada.
- Idioma: solo inglés. No hay soporte multilingüe declarado.
- Sesgo de la población de anotación: las valoraciones provienen de 304 anotadores residentes en Estados Unidos, por lo que las puntuaciones reflejan las asociaciones de ese grupo y no son necesariamente generalizables a otras culturas o comunidades.
- Cobertura léxica limitada: el entrenamiento se apoya en 315 atributos físicos en inglés; los atributos fuera de ese léxico pueden producir estimaciones menos fiables.
- Riesgo de uso indebido: una herramienta que cuantifica asociaciones de género puede emplearse para reforzar estereotipos en lugar de auditarlos. Su uso razonable es diagnóstico y de investigación.
- No se publican métricas de error (MAE, RMSE, correlación con anotadores humanos) ni intervalos de confianza, por lo que no es posible acotar la incertidumbre de cada predicción.
- Cada llamada puntúa un único atributo frente a un único género descrito; no procesa descripciones completas ni párrafos, ya que la entrada se trunca a 128 tokens con una plantilla fija.
- No es un modelo generativo ni conversacional: no admite tool calling, agentes, visión, audio ni modo de razonamiento.
- Licencia Apache 2.0 para el adaptador y la cabeza, lo que permite uso comercial, pero conviene verificar también los términos del modelo base y del conjunto de datos GAPA antes de un despliegue en producción.
- El modelo mide asociaciones estadísticas, no causalidad ni corrección normativa: una puntuación alta no implica que el uso del atributo sea inapropiado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alisa-yingjia-wan/gapa-predictor-olmo2-7b
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B
- Dataset GAPA: https://huggingface.co/datasets/alisa-yingjia-wan/gapa
- Articulo (arXiv:2609.16366): https://arxiv.org/abs/2609.16366
- Codigo (GitHub, incluye `predictor/` con el script de entrenamiento): https://github.com/Yingjia-Wan/GAPA
- Configuracion de entrenamiento: https://github.com/Yingjia-Wan/GAPA/tree/main/predictor
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
