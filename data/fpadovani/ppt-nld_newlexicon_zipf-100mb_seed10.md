# fpadovani/ppt-nld_newlexicon_zipf-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-nld_newlexicon_zipf-100mb_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/nld_latn_100mb`, desarrollado por fpadovani, investigador asociado a la Universidad de Groningen. Se trata de un modelo de generación de texto de tamaño reducido (86,7 millones de parámetros) basado en la arquitectura GPT-2, entrenado mediante aprendizaje supervisado (SFT) con la librería TRL de HuggingFace. El nombre sugiere que está orientado al neerlandés (nld) y que incorpora un "nuevo léxico" con distribución Zipf, probablemente para experimentos sobre la relación entre frecuencia léxica y rendimiento del modelo.

Su relevancia radica en que forma parte de una serie de experimentos académicos sobre el impacto del vocabulario y la distribución de frecuencias en modelos de lenguaje pequeños. Al ser un modelo de solo 86,7 millones de parámetros, es extremadamente ligero y puede ejecutarse en hardware modesto, lo que lo hace útil para investigación reproducible y para entornos con recursos limitados. Sin embargo, su tamaño y especialización limitan sus capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformador causal) |
| Parametros totales | 86.708.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se infiere 1024 tokens por ser GPT-2, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | neerlandes (inferido por el nombre y el modelo base, no confirmado) |
| Licencia | no disponible (el YAML indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `goldfish-models/nld_latn_100mb`, que a su vez es un modelo GPT-2 pequeño entrenado con 100 MB de texto en neerlandés. La arquitectura es un transformer decoder-only con atención causal, típico de GPT-2. El ajuste fino se realizó con SFT (supervised fine-tuning) usando la librería TRL (versión 0.23.0) y el framework Transformers 4.56.2. No se especifican los datos de entrenamiento del fine-tune, pero el nombre "newlexicon_zipf" sugiere que se modificó el vocabulario o se reentrenó con una distribución de frecuencias Zipf, probablemente para estudiar el efecto de la frecuencia léxica en la generación. No hay información sobre el número de tokens de entrenamiento, el dataset utilizado ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: el modelo es capaz de continuar secuencias de texto a partir de un prompt, como se muestra en el ejemplo de la model card.
- Especialización en neerlandés: por su nombre y modelo base, está orientado al neerlandés, aunque no se confirma explícitamente.
- Tamaño reducido: con 86,7 millones de parámetros, es adecuado para experimentos de bajo coste y despliegue en entornos con recursos limitados.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación académica sobre frecuencia léxica: el modelo sirve para estudiar cómo la distribución de frecuencias del vocabulario afecta a la generación de texto en neerlandés, comparando con variantes del mismo autor (por ejemplo, seeds diferentes o versiones "heavy").
- Prototipado rápido de generación de texto en neerlandés: al ser pequeño, permite probar pipelines de generación en local sin necesidad de GPUs potentes.
- Educación y aprendizaje de PLN: útil para demostrar el funcionamiento de un transformer causal y el proceso de fine-tuning con TRL en un idioma de baja representación.
- Generación de texto creativo en neerlandés: puede usarse para producir cuentos, poemas o respuestas a preguntas abiertas, aunque con calidad limitada.
- Evaluación de métricas de generación: sirve como baseline en experimentos que comparan modelos de distinto tamaño o vocabulario.
- Despliegue en entornos con restricciones de hardware: por su tamaño (0,2 GB), puede ejecutarse en CPU o en GPUs con poca VRAM, como una Raspberry Pi o un portátil sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo es experimental y no se ha comparado con alternativas en términos de rendimiento numérico.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (86,7 M parámetros × 4 bytes ≈ 347 MB). Con cuantización a 8 bits o 4 bits, la huella sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo GTX 1050, RTX 2060, RTX 3060, etc. También funciona en CPU.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna e incluso en muchas antiguas.
- Opciones de despliegue: Transformers con pipeline, vLLM (aunque para modelos tan pequeños no es necesario), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o simplemente con la librería Transformers en Python.
- Latencia y throughput: no se han publicado mediciones, pero por su tamaño se espera una latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/ppt-nld_newlexicon_zipf-100mb_seed10 | 86,7 M | no disponible | no disponible | Fine-tune de goldfish nld 100MB |
| fpadovani/ppt-nld_newlexicon_zipf-100mb_seed3407 | 86,7 M (aprox.) | no disponible | no disponible | Variante con otra semilla |
| fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed10 | 86,5 M | no disponible | no disponible | Modelo baseline del mismo autor |
| goldfish-models/nld_latn_100mb | 86,7 M (aprox.) | no disponible | no disponible | Modelo base original |

No hay información suficiente para comparar rendimiento. Los modelos listados son variantes del mismo experimento, con diferencias en semilla o en el tratamiento del léxico.

## Limitaciones y advertencias

- Tamaño muy reducido: con 86,7 millones de parámetros, la calidad de generación es limitada y no es adecuado para tareas complejas de razonamiento o generación extensa.
- Especialización en neerlandés: no se ha confirmado su capacidad en otros idiomas; probablemente degrade significativamente fuera del neerlandés.
- Licencia no especificada: el YAML indica "license" sin detallar, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar al autor antes de usarlo en producción.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas estándar.
- Posibles sesgos: al ser un modelo pequeño entrenado con un corpus limitado (100 MB), puede reflejar sesgos presentes en ese corpus, aunque no se han documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto plausible pero incorrecto, especialmente en contextos abiertos.
- Contexto limitado: si se confirma que es GPT-2, la ventana de contexto es de 1024 tokens, insuficiente para tareas de contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_newlexicon_zipf-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Variante seed3407: https://huggingface.co/fpadovani/ppt-nld_newlexicon_zipf-100mb_seed3407
- Baseline seed10: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed10
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed10,3l0rWaLGk73G5a5x2Lchd0
- Despliegue en FriendliAI: https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed455
