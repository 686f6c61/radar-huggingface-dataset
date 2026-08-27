# fpadovani/ppt-art-lang-newlexicon-zipf-soft0.98-eng-baseline-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-soft0.98-eng-baseline-100mb_seed10` es un modelo de lenguaje pequeño de 86,5 millones de parámetros, desarrollado por fpadovani (aparentemente vinculado a la Universidad de Groningen, según el enlace de Weights & Biases). Se trata de un fine-tuning del modelo base `goldfish-models/eng_latn_100mb`, un transformer de 100 MB entrenado con datos en inglés. El nombre del modelo sugiere que forma parte de un experimento de investigación sobre lenguajes artificiales o "nuevo léxico", con una distribución de frecuencias de palabras tipo Zipf suavizada (soft0.98). Es un modelo de generación de texto, entrenado mediante supervisión fina (SFT) con la librería TRL, y su tamaño reducido lo hace adecuado para estudios académicos sobre adquisición de lenguaje y efectos de la distribución de frecuencias, más que para aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo GPT-2, según etiquetas de HuggingFace) |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (presumiblemente, basado en el modelo base `eng_latn`) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del modelo Goldfish `eng_latn_100mb`, que es un transformer decoder-only de tamaño reducido, similar a GPT-2. Se ha realizado un fine-tuning con aprendizaje supervisado (SFT) utilizando la librería TRL de HuggingFace. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. El nombre del modelo indica que se trata de un experimento con un "nuevo léxico" y una distribución de frecuencias de palabras ajustada (Zipf suavizada con parámetro 0.98), lo que sugiere que el entrenamiento se realizó sobre un corpus modificado artificialmente para estudiar el impacto de la distribución de frecuencias en el aprendizaje del lenguaje. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, limitada por su tamaño reducido.
- No se han documentado capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No se conocen capacidades multimodales (vision, audio, etc.).
- Al ser un modelo de investigacion, su unica funcion es la generacion de texto condicionada a un prompt.

## Casos de uso

- Investigacion en linguistica computacional: estudiar como la distribucion de frecuencias de palabras afecta al aprendizaje de un modelo de lenguaje, comparando con otros modelos de la misma familia con diferentes parametros de Zipf.
- Experimentos de adquisicion de lenguaje artificial: el modelo puede servir para simular el aprendizaje de un lexico artificial y analizar la generalizacion.
- Pruebas de generacion de texto en entornos academicos: generar muestras de texto para analisis cualitativo en estudios sobre sesgos o propiedades estadisticas.
- Benchmark de modelos pequenos: servir como baseline en evaluaciones de modelos de menos de 100M parametros.
- Educacion: ejemplificar el proceso de fine-tuning con TRL en un modelo pequeno, dado su bajo coste computacional.
- Reproducibilidad: al ser un modelo abierto con pesos safetensors, permite replicar experimentos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar.

## Requisitos de hardware

- VRAM estimada: con 86,5 millones de parametros, en FP16 ocupa aproximadamente 173 MB, y en FP32 unos 346 MB. Cabe en cualquier GPU consumer con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluso integradas, aunque para inferencia rapida se recomienda una GPU dedicada (por ejemplo, NVIDIA GTX 1050 Ti o superior).
- Despliegue: compatible con la libreria Transformers de HuggingFace, y puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). Tambien es compatible con Ollama si se convierte el formato.
- Latencia y throughput: al ser un modelo muy pequeno, la latencia es minima (del orden de milisegundos) y el throughput alto, aunque no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-zipf-soft0.98-eng-baseline-100mb_seed10 | 86,5M | no disponible | no disponible | Fine-tune de goldfish 100MB con SFT |
| goldfish-models/eng_latn_100mb | ~86M | no disponible | no disponible | Modelo base, entrenado con 100MB de texto en ingles |
| fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407 | 86,5M | no disponible | no disponible | Variante con otra semilla y sin suavizado Zipf |
| fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407 | 86,5M | no disponible | no disponible | Variante en neerlandes (nld) |

No se dispone de comparativas con modelos de la misma categoria (por ejemplo, GPT-2 small o TinyLlama) en terminos de rendimiento, ya que no hay benchmarks publicados.

## Limitaciones y advertencias

- Modelo extremadamente pequeno (86,5M parametros), por lo que su capacidad de generacion y razonamiento es muy limitada en comparacion con modelos de cientos de miles de millones de parametros.
- Entrenado sobre un corpus de solo 100 MB, lo que puede provocar un vocabulario reducido y una alta tasa de alucinaciones o repeticiones.
- No se ha documentado el proceso de curacion de datos, por lo que puede contener sesgos presentes en el texto fuente.
- La licencia no esta claramente especificada; la model card indica "licence: license" sin detallar los terminos, lo que puede limitar su uso comercial.
- No se garantiza la calidad del texto generado para aplicaciones reales; es un modelo de investigacion.
- No se ha evaluado su comportamiento en tareas de seguridad o toxicidad.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-soft0.98-eng-baseline-100mb_seed10)
- [Modelo base goldfish-models/eng_latn_100mb](https://huggingface.co/goldfish-models/eng_latn_100mb)
- [Variante con otra semilla (zipf-eng-baseline-100mb_seed3407)](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407)
- [Variante en neerlandes (nld-baseline-100mb_seed3407)](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407)
- [LLM Explorer - ficha del modelo](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed3407,2Slk66R6Xw0opwVQ5kESMl)
- [FriendliAI - despliegue del modelo](https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407)
