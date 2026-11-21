# ronke21/hebnli-neodictabert

## Resumen

`ronke21/hebnli-neodictabert` es un clasificador de inferencia de lenguaje natural (NLI) en hebreo, obtenido mediante fine-tuning de `dicta-il/neodictabert` sobre el corpus HebNLI. El modelo resuelve una tarea de clasificación de tres clases (implicación, contradicción y neutralidad) entre una premisa y una hipótesis, ambas en hebreo. Lo desarrolla Ron Keinan en el marco del trabajo HeRE (Hebrew Relation Extraction), presentado en AACL-IJCNLP 2026.

Su relevancia es doble. Por un lado, sirve como componente desplegado en el pipeline de extracción de relaciones HeRE: actúa como "denoiser" de Estrategia 1, donde la premisa es un pasaje de Wikipedia en hebreo y la hipótesis es una tripleta de Wikidata verbalizada, y la probabilidad de implicación decide si el pasaje expresa la relación. Por otro, es un checkpoint NLI hebreo reutilizable de forma independiente para cualquier tarea de clasificación de pares de frases.

El modelo cuenta con 363.181.827 parámetros (aproximadamente 363 M, coherente con la familia NeoBERT "base"), se distribuye en formato safetensors con código de modelado personalizado (`modeling_neobert.py`) y requiere `trust_remote_code=True`. La licencia es CC-BY-4.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeoBERT (encoder transformer), con `modeling_neobert.py` personalizado y cabeza de clasificación de secuencias (3 clases) |
| Parametros totales | 363.181.827 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 250 tokens (longitud máxima de secuencia usada en entrenamiento y en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (repo de 1,5 GB, incluye código de modelado personalizado) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer NeoBERT afinado como clasificador de secuencias de tres etiquetas: `0` = היסק (implicación), `1` = סתירה (contradicción) y `2` = ניטרלי (neutralidad). Parte de `dicta-il/neodictabert`, un checkpoint NeoBERT para hebreo, y añade una cabeza de clasificación entrenada sobre HebNLI. El checkpoint incluye el fichero `modeling_neobert.py`, por lo que la carga exige `trust_remote_code=True`.

El entrenamiento usó AdamW con tasa de aprendizaje 2e-5, tamaño de lote 64, calentamiento lineal sobre el 10 % de los pasos, weight decay 0,01, longitud máxima de secuencia 250, 8.000 pasos y evaluación cada 200 pasos. Se conservó el checkpoint con mejor macro-F1 de validación, correspondiente al paso 5.600. Fue una única ejecución con semilla 42. En el contexto del paper HeRE, el modelo se desplegó sobre el corpus "silver" completo como señal `encoder_nli__neodictabert`, empleando hipótesis generadas por plantilla (Estrategia 1).

## Capacidades

- Clasificación NLI de pares (premisa, hipótesis) en hebreo con tres etiquetas: implicación, contradicción y neutralidad.
- Salida de logits por clase, convertibles en probabilidades mediante softmax, lo que permite umbralizar la probabilidad de implicación en pipelines de filtrado.
- Detección de relaciones en texto: al verbalizar una tripleta de Wikidata como hipótesis, la probabilidad de implicación indica si el pasaje expresa esa relación.
- Procesamiento de textos de hasta 250 tokens por par.
- No soporta tool calling, function calling, agentes, multimodalidad ni modo de razonamiento explícito: es un encoder de clasificación, no un modelo generativo.
- Capacidad monolingüe: solo hebreo.

## Casos de uso

- Extracción de relaciones sobre conocimiento estructurado: dado un pasaje de Wikipedia en hebreo y una tripleta verbalizada de Wikidata, usar la probabilidad de implicación como señal de verificación para poblar o limpiar un grafo de conocimiento, tal como hace HeRE con la señal `encoder_nli__neodictabert`.
- Filtrado de pares en la construcción de datasets NLI: aplicar el clasificador sobre pares generados automáticamente para descartar candidatos con baja confianza o etiquetas contradictorias antes de la anotación humana.
- Verificación de hechos en hebreo: comprobar si una afirmación corta (hipótesis) está respaldada, contradicha o es neutra respecto a un fragmento de evidencia de hasta 250 tokens.
- Deduplicación semántica y detección de contradicciones en bases documentales hebreas: comparar pares de frases y marcar como contradictorios los pares con alta probabilidad en la clase de contradicción.
- Enrutado y control de calidad en pipelines de datos hebreos: usar las probabilidades por clase como puntuación para priorizar revisiones o para descartar automáticamente pares no informativos (neutralidad alta).
- Componente de ensemble en sistemas de NLP hebreo: combinarlo con otros clasificadores o con un LLM generativo como verificador barato y determinista en primera etapa, reduciendo el coste de las llamadas al modelo grande.

## Benchmarks y rendimiento

| Modelo | HebNLI dev macro-F1 | HebNLI test macro-F1 | HeRE gold validation F1 |
|---|---|---|---|
| NeoDictaBERT (este checkpoint) | 0,861 | 0,878 | 0,771 (Estrategia 1, hipótesis por plantilla) |

No se han publicado en la información disponible resultados comparativos con otros modelos en estas mismas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,5 GB solo para pesos (363 M de parámetros); con activaciones y overhead de runtime, un presupuesto de 2-4 GB es suficiente para lotes pequeños.
- En fp16/bf16 los pesos ocupan aproximadamente 0,7 GB; la cuantización a 8 bits reduciría aún más el requisito, aunque no se documentan tipos de cuantización soportados.
- GPU recomendadas: cualquier GPU consumer moderna sirve; cabe con holgura en RTX 3060, RTX 4070, RTX 4090, así como en A100/H100 para despliegues de alto throughput. También es viable en CPU para volúmenes moderados.
- Despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`; el modelo es un encoder de clasificación, por lo que no aplican vLLM ni llama.cpp como motores de generación. Para servir a escala puede usarse Text Generation Inference en modo clasificación o un servidor propio con batching dinámico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ronke21/hebnli-neodictabert` | 363 M | 250 tokens | NLI hebreo (3 clases) | cc-by-4.0 | Hugging Face |
| `dicta-il/neodictabert` | no disponible | no disponible | Encoder base hebreo (sin cabeza NLI) | no disponible | Hugging Face |
| Modelos NLI multilingües tipo XLM-R | no disponible | no disponible | NLI multilingüe | no disponible | Hugging Face |

No se dispone de datos de rendimiento de alternativas NLI en hebreo en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo monolingüe: solo hebreo; su uso con otros idiomas no está validado.
- Ventana de 250 tokens: premisas más largas se truncan, lo que puede eliminar la evidencia necesaria para la decisión.
- Es un clasificador, no un generador: no produce texto, no razona de forma multi-paso y no soporta tool calling.
- Riesgo de error en relaciones sutiles o expresadas de forma implícita; el F1 en validación HeRE (0,771) es inferior al rendimiento en HebNLI, lo que refleja la dificultad del dominio de extracción de relaciones.
- Entrenamiento con una única ejecución y semilla fija (42): no se documenta variabilidad entre semillas.
- Requiere `trust_remote_code=True` y ejecuta código de modelado incluido en el repositorio; conviene auditar `modeling_neobert.py` antes de desplegarlo en producción.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar el trabajo HeRE y respetar los términos de la licencia del modelo base.
- No se documentan sesgos específicos del checkpoint; al derivar de un encoder entrenado sobre corpus hebreos, puede heredar sesgos de esas fuentes.
- No se han publicado datos de cuantización ni de latencia, lo que limita la planificación de despliegues de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/hebnli-neodictabert
- Modelo base: https://huggingface.co/dicta-il/neodictabert
- Dataset HeRE: https://huggingface.co/datasets/ronke21/HeRE
- Código HeRE: https://github.com/Ronke21/HeRE
- Repositorio HebNLI: https://github.com/NNLP-IL/HebNLI
- Paper HeRE (ACL Anthology): https://aclanthology.org/2026.aacl-long.237/
- DOI del paper: https://doi.org/10.18653/2026.aacl-long.237
