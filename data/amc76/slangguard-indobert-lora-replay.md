# amc76/slangguard-indobert-lora-replay

## Resumen

SlangGuard IndoBERT LoRA + replay es un adaptador LoRA sobre el modelo base `indobenchmark/indobert-base-p1`, un transformer encoder BERT entrenado para indonesio. El adaptador realiza clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre texto informal indonesio, como tuits y reseñas. Lo desarrolla el autor independiente amc76 (Akmal76 en GitHub) como parte de SlangGuard, un proyecto de portafolio sobre aprendizaje continuo y deriva del lenguaje.

El problema que aborda es el olvido catastrófico: cuando el argot cambia con el tiempo, un modelo afinado solo con datos nuevos pierde rendimiento en los datos antiguos. La propuesta entrena el adaptador periodo a periodo (P1 a P4), incorporando en cada actualización un 5 % de muestras de replay de los periodos anteriores. Solo se entrenan 297.219 pesos (0,24 % del modelo total): las matrices LoRA en las capas query y value de la atención, más la cabeza de clasificación. El fichero resultante pesa aproximadamente 1,2 MB.

Es relevante como referencia metodológica para equipos que mantienen clasificadores en producción con datos que derivan, y como ejemplo reproducible de LoRA + replay con métricas comparadas frente a fine-tuning ingenuo y reentrenamiento completo. No es un modelo generalista: está limitado a indonesio y a texto corto informal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (IndoBERT base p1) con adaptador LoRA en capas query y value, mas cabeza de clasificacion |
| Parametros totales | No disponible (el adaptador entrena 297.219 pesos, 0,24 % del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso trunca a 128 tokens) |
| Tipos de cuantizacion | No disponible (adaptador PEFT en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Indonesio (id) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | indobenchmark/indobert-base-p1 |
| Tamano del repositorio | 0.0 GB (fichero del adaptador ~1,2 MB) |
| Pipeline | text-classification |
| Etiquetas | 0 = negative, 1 = neutral, 2 = positive |

## Arquitectura y entrenamiento

La arquitectura subyacente es IndoBERT base p1, un transformer encoder de tipo BERT preentrenado para indonesio. Sobre él se aplica un adaptador LoRA que modifica únicamente las proyecciones query y value de las capas de atención, junto con una cabeza de clasificación de tres clases que forma parte del adaptador (por eso el aviso de `id2label` del modelo base es inofensivo). El entrenamiento se realizó de forma secuencial por periodos: P1 con SmSA de IndoNLU (reseñas y comentarios formales), P2 con una parte del Indonesian Sentiment Twitter Dataset (IDSA), P3 con otra parte de IDSA donde se sustituyen palabras por formas de argot a tasa moderada, y P4 con otra parte de IDSA con alta tasa de argot más 100 palabras escritas al revés. En cada actualización se añadió un 5 % de muestras de replay de los periodos previos.

Las formas de argot provienen del Colloquial Indonesian Lexicon (kamus-alay), usado en dirección formal a argot. El preprocesado elimina puntuación y el token `amp`, pasa a minúsculas y descarta tuits con palabras malayas comunes mediante un filtro de lista de palabras, no detección de idioma. Es importante señalar que P3 y P4 son simulados: son tuits reales reescritos con un léxico, no lenguaje recogido posteriormente, por lo que los resultados reflejan olvido bajo deriva simulada. No se menciona uso de RLHF ni DPO; es un ajuste supervisado de clasificación.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre texto indonesio.
- Procesamiento de texto informal corto: tuits y reseñas con argot indonesio.
- Aprendizaje continuo mediante LoRA + replay, que permite actualizar el modelo con nuevos periodos sin reentrenar por completo.
- Robustez parcial ante variaciones léxicas introducidas por argot (evaluada en P3 y P4 simulados).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al indonesio; no se ha evaluado en otras lenguas.

## Casos de uso

- Monitorización de opiniones en redes sociales en indonesio: el adaptador clasifica tuits cortos en tres clases de sentimiento, adecuado para paneles de escucha social acotados a ese idioma y dominio.
- Análisis de reseñas de producto en indonesio: permite agregar sentimiento sobre reseñas y comentarios, con la advertencia de que el dominio formal (P1) obtiene mejor macro-F1 (0,905) que los tuits (0,645-0,689).
- Investigación sobre olvido catastrófico: sirve como referencia reproducible para comparar LoRA + replay frente a fine-tuning ingenuo y reentrenamiento completo, con métricas por periodo y tres semillas.
- Docencia y formación en MLOps: el proyecto SlangGuard documenta el flujo de detección de deriva y actualización incremental, útil como caso práctico de aprendizaje continuo.
- Prototipado de clasificadores de bajo coste: al pesar ~1,2 MB y entrenar en ~29 s la última actualización, es viable experimentar en hardware modesto.
- Filtrado previo en pipelines de datos indonesios: puede etiquetar grandes volúmenes de texto corto para triaje antes de revisión humana, sin uso en decisiones con coste real por etiqueta errónea.
- Seguimiento de la evolución del argot: el esquema por periodos permite mantener actualizado un clasificador cuando cambia el vocabulario, con un coste de entrenamiento muy inferior al reentrenamiento completo (29 s frente a 328 s).

## Benchmarks y rendimiento

Macro-F1 sobre el conjunto de test reservado de cada periodo, para este adaptador (semilla 42) tras entrenar los cuatro periodos:

| P1 | P2 | P3 | P4 |
|---|---|---|---|
| 0.905 | 0.687 | 0.689 | 0.645 |

Comparativa de métodos sobre 3 semillas (media ± desviación típica):

| Metodo | AvgF1 en los 4 periodos | P1 tras la ultima actualizacion | Tiempo de entrenamiento de la ultima actualizacion |
|---|---|---|---|
| Fine-tuning ingenuo, solo periodo nuevo | 0.677 ± 0.010 | 0.759 ± 0.039 | 32 s |
| Reentrenamiento completo en todos los periodos | 0.724 ± 0.003 | 0.925 ± 0.006 | 328 s |
| LoRA + 5 % replay (este metodo) | 0.725 ± 0.006 | 0.900 ± 0.006 | 29 s |

El adaptador publicado corresponde a la semilla 42, elegida antes de ver resultados; su AvgF1 es 0,731, ligeramente por encima de la media del método. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador de ~1,2 MB sobre IndoBERT base, el consumo lo determina el modelo base, no el adaptador.
- GPU recomendadas: no disponible en la información proporcionada; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Viabilidad en GPU de consumo: no confirmada en la información disponible; el tamaño reducido del adaptador y del modelo base sugiere que sería viable, pero no hay dato publicado.
- Opciones de despliegue: la model card muestra uso con `transformers` y `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se publican tiempos de entrenamiento (29 s para la última actualización con LoRA + replay, 32 s para fine-tuning ingenuo y 328 s para reentrenamiento completo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SlangGuard IndoBERT LoRA + replay | Adaptador de 297.219 pesos sobre IndoBERT base p1 | No disponible | AvgF1 0,725 ± 0,006 en 4 periodos | CC BY-SA 4.0 | Hugging Face (amc76) |
| IndoBERT base p1 (modelo base) | No disponible | No disponible | No disponible en esta ficha | No disponible en la informacion proporcionada | Hugging Face (indobenchmark) |
| Fine-tuning ingenuo (referencia del propio proyecto) | Mismo base, solo periodo nuevo | No disponible | AvgF1 0,677 ± 0,010 | No aplica (metodo) | No distribuido |
| Reentrenamiento completo (referencia del propio proyecto) | Mismo base, todos los periodos | No disponible | AvgF1 0,724 ± 0,003 | No aplica (metodo) | No distribuido |

No se dispone de comparación con otros adaptadores de sentimiento en indonesio en la información proporcionada.

## Limitaciones y advertencias

- Solo indonesio, y ajustado a texto corto informal (tuits y reseñas); otros dominios no se han probado.
- Los tuits alcanzan solo ~0,65-0,69 de macro-F1 incluso entrenando con ellos: etiquetas ruidosas y pocos ejemplos por periodo (~2.100 tuits).
- El periodo antiguo (P1) es formal: parte del olvido que sufre el fine-tuning ingenuo se debe a cambio de dominio y mezcla de etiquetas (neutro es 11 % en P1 y ~50 % en los periodos de tuits), no solo al argot.
- P3 y P4 son simulados: los resultados muestran olvido bajo deriva simulada, no bajo cambio lingüístico real.
- No se ajustaron hiperparámetros: todos los valores se fijaron antes del entrenamiento; otros ajustes podrían cambiar las cifras.
- No apto para decisiones sobre personas: las etiquetas de sentimiento en redes sociales son subjetivas y el modelo puede reflejar sesgos de los datos; no debe usarse donde una etiqueta errónea tenga coste real.
- Licencia CC BY-SA 4.0: impone atribución y compartir igual; conviene revisar las implicaciones para uso comercial y para obras derivadas.
- Los datos de entrenamiento no se redistribuyen con el modelo; el uso de IDSA y del léxico depende de las condiciones de sus autores.
- El preprocesado es obligatorio (minúsculas, sin puntuación, sin `amp`); usarlo con texto sin normalizar puede degradar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amc76/slangguard-indobert-lora-replay
- Modelo base: https://huggingface.co/indobenchmark/indobert-base-p1
- Repositorio SlangGuard: https://github.com/Akmal76/slangguard
- README del proyecto: https://github.com/Akmal76/slangguard/blob/main/README.md
- Resultados detallados: https://github.com/Akmal76/slangguard/blob/main/docs/results.md
- IndoNLU (SmSA, Wilie et al., 2020): https://github.com/IndoNLP/indonlu
- Dataset IDSA: https://github.com/ridife/dataset-idsa
- Colloquial Indonesian Lexicon (kamus-alay): https://github.com/nasalsabila/kamus-alay
- Articulo relacionado (IndoBERT híbrido con semi-supervisión controlada): https://www.mdpi.com/2076-3417/16/13/6478
