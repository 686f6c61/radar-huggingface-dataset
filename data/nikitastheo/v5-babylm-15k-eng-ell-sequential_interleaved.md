# nikitastheo/v5-babylm-15k-eng-ell-sequential_interleaved

## Resumen

`nikitastheo/v5-babylm-15k-eng-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo GPT-2 publicado por el usuario nikitastheo en HuggingFace, con 108.550.656 parametros en formato safetensors y un repositorio de 0,9 GB. Se trata de un modelo pequeno, entrenado desde cero, orientado a la investigacion en aprendizaje del lenguaje a escala reducida: el nombre y el tokenizador asociado (`nikitastheo/babylm-15k-eng-tokenizer`) remiten al entorno del reto BabyLM, con un vocabulario de 15.000 tokens.

El interes principal del modelo esta en su regimen de entrenamiento bilingue ingles-griego (sufijo `eng-ell`) con una estrategia de cambio de idioma en dos fases: el campo "language switch epoch: 10" de la model card indica que la composicion o el idioma de los datos cambio en la epoca 10, lo que sugiere un curriculum secuencial seguido de una fase intercalada (de ahi `sequential_interleaved`). Es, por tanto, una pieza de estudio sobre como un modelo de 108 millones de parametros adquiere dos idiomas con presupuesto de datos limitado, y no un modelo destinado a produccion.

La relevancia actual es metodologica: los modelos de escala GPT-2 pequena siguen usandose como banco de pruebas controlado para estudiar tokenizacion, curriculos multilingues y eficiencia de datos, donde entrenar muchas variantes es viable economicamente. No se ha publicado informacion sobre licencia, benchmarks, idiomas declarados ni longitud de contexto en los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 108.550.656 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | no disponibles en los metadatos; el nombre y el tokenizador apuntan a ingles y griego (`eng-ell`), sin confirmacion en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo GPT-2, segun la etiqueta declarada y la referencia a `model_configs/gpt_base_config.json` como configuracion base. Con 108,5 millones de parametros y un vocabulario de 15.000 tokens, la cifra es coherente con una configuracion de escala "base" de GPT-2 (12 capas, 768 dimensiones, 12 cabezas) cuyo embedding de entrada se reduce de forma notable al pasar de los 50.257 tokens del GPT-2 original a 15.000; no obstante, el numero exacto de capas, cabezas y dimensiones no se detalla en la informacion disponible.

El entrenamiento se realizo con `train_clm.py`, un script de entrenamiento de LM causal basado en Hugging Face Accelerate y no en `Trainer`. Los hiperparametros publicados son: 27.020 pasos maximos, learning rate 1e-4 con scheduler lineal, 2.702 pasos de warmup (el 10 % del total), batch size de 32 por dispositivo, sin acumulacion de gradientes (batch total efectivo de 32). El tokenizador es `nikitastheo/babylm-15k-eng-tokenizer`. La innovacion diferencial es el regimen bilingue: un "language switch epoch" en la epoca 10 indica un curriculum en el que el modelo se expone primero a una mezcla o idioma y despues a otra, en linea con el nombre `sequential_interleaved`. El numero total de tokens de entrenamiento no se especifica; con una longitud de secuencia de 1.024 tokens y los 27.020 pasos de batch 32 se procesarian del orden de 885 millones de tokens, pero esta cifra es una estimacion y no un dato confirmado. No se documenta uso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generacion de texto causal autorregresiva, la unica tarea declarada en el pipeline (`text-generation`).
- Modelado de lenguaje bilingue ingles-griego, presumiblemente con capacidad de alternar entre ambos idiomas dentro de una misma generacion, dado el regimen de entrenamiento intercalado.
- Compatibilidad con `transformers`, `text-generation-inference` y endpoints compatibles, segun las etiquetas del repositorio.
- Capacidad de servir como modelo base para fine-tuning supervisado en tareas de PLN.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo de razonamiento (thinking), vision, audio ni multimodalidad.
- No se documentan capacidades especificas mas alla de la generacion de texto; cualquier aptitud en codigo o matematicas no esta verificada.

## Casos de uso

- Investigacion sobre adquisicion bilingue: el modelo permite comparar directamente una estrategia de exposicion secuencial a los idiomas frente a una intercalada, gracias al "language switch epoch" documentado, y contrastar la perplejidad en ingles y griego antes y despues de la epoca 10.
- Estudio de tokenizacion de bajo vocabulario: con 15.000 tokens en lugar de los 50.257 de GPT-2, sirve para medir el impacto de un vocabulario reducido en la fertilidad de la tokenizacion y en el coste de secuencias en griego, un idioma con morfologia rica y alfabeto no latino.
- Modelo base para fine-tuning en griego: al ser un checkpoint pequeno y bilingue, es un punto de partida economico para ajustar tareas concretas de PLN en griego (clasificacion, resumen, generacion), donde los modelos preentrenados de calidad siguen siendo escasos.
- Generacion de datos sinteticos para experimentos: puede emplearse para producir textos cortos en ingles y griego que sirvan como material de aumento de datos para clasificadores o para modelos mayores, con la advertencia de que la calidad de un modelo de 108 millones de parametros es limitada.
- Reproduccion y comparacion de experimentos BabyLM: encaja en la linea de trabajo de modelos entrenados con presupuestos de datos del orden de millones de palabras, de modo que los resultados se puedan comparar con otras variantes del mismo autor (el prefijo `v5` sugiere iteraciones previas).
- Docencia y demos en hardware modesto: su tamano permite desplegarlo en un portatil o incluso en CPU para ilustrar el funcionamiento de un transformer causal, la generacion con distintos parametros de muestreo y el efecto del cambio de idioma.
- Prototipado rapido de interfaces de autocompletado en entornos de investigacion, siempre que no se requiera calidad de produccion ni licencia comercial clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de las tareas de evaluacion del reto BabyLM (por ejemplo, BLiMP, ELI5 o la tarea de causalidad infantil), y tampoco se proporcionan cifras de perplejidad para ingles o griego. No se inventan valores.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 0,43 GB; en fp16/bf16, unos 0,22 GB; en int8, unos 0,11 GB; en int4, unos 0,06 GB. El repositorio ocupa 0,9 GB, lo que sugiere que puede contener copias adicionales o estados auxiliares.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente, incluidas RTX 3050, RTX 3060, RTX 4090, T4, A100 o H100; el modelo esta muy por debajo de la capacidad de estos aceleradores y el cuello de botella sera el overhead, no la memoria.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier modelo con 4 GB o mas, y tambien en CPU (x86 o Apple Silicon) con memoria unificada o RAM convencional.
- Opciones de despliegue: `transformers` de forma nativa; `text-generation-inference` y endpoints compatibles estan declarados en las etiquetas del repositorio. vLLM, TGI y llama.cpp u Ollama requeririan conversion (GGUF) o no estan verificados para este checkpoint, ya que no se publican variantes cuantizadas.
- Latencia y throughput estimados: no disponibles. Al no publicarse la longitud de contexto, el numero de capas ni datos de medicion, no se ofrecen cifras de tokens por segundo.

## Comparativa con modelos similares

La comparacion es orientativa: los modelos listados difieren en datos de entrenamiento, tokenizador y objetivos, y no existe una evaluacion comun publicada para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nikitastheo/v5-babylm-15k-eng-ell-sequential_interleaved | 108,5 M | no disponible | no disponible | HuggingFace, pesos safetensors | Bilingue ingles-griego, vocabulario de 15.000 tokens, entrenamiento por curriculo con cambio de idioma en la epoca 10 |
| GPT-2 base | 124 M | 1.024 tokens | licencia MIT modificada de OpenAI | Ampliamente disponible, incluidas variantes GGUF | Referencia historica de la misma escala, solo ingles y vocabulario de 50.257 tokens |
| Pythia-160M | 162 M | 2.048 tokens | Apache 2.0 | HuggingFace, con checkpoints intermedios | Suite de investigacion con 154 checkpoints para estudiar dinamicas de entrenamiento, solo ingles |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | HuggingFace, con variantes cuantizadas | Modelo pequeno moderno entrenado con un corpus mucho mayor, solo ingles |

Frente a estas alternativas, el modelo de nikitastheo destaca por su caracter bilingue y su vocabulario reducido, pero carece de licencia declarada, de benchmarks y de contexto documentado, lo que limita su uso fuera de la investigacion.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo. Un modelo entrenado con un corpus de escala BabyLM (del orden de millones de palabras) reflejara las limitaciones y los sesgos de esa fuente, con probabilidad de estereotipos y de infrarrepresentacion de variedades linguisticas.
- Riesgo de alucinacion: alto. Con 108 millones de parametros y un presupuesto de entrenamiento reducido, la generacion puede ser incoherente, repetitiva o factualmente incorrecta, especialmente en secuencias largas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada, por lo que no se puede garantizar el comportamiento en entradas largas. El soporte real de griego y la calidad relativa en cada idioma no estan verificados con metricas, y la model card no declara idiomas en los metadatos.
- Restricciones de licencia: no disponible. Al no especificarse licencia, no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad ni de mantenimiento continuado.
- Ausencia de cuantizaciones publicadas: no hay variantes GGUF, GPTQ ni AWQ, de modo que el despliegue en llama.cpp u Ollama exigiria una conversion propia y su validacion.
- Higiene de datos de entrenamiento: al tratarse de un script propio (`train_clm.py`) sin `Trainer`, la reproducibilidad depende de que el autor publique el script, la configuracion exacta y la composicion del corpus, que no se detalla mas alla del cambio de idioma en la epoca 10.
- Uso previsto: investigacion y experimentacion. No se recomienda su uso en produccion ni en aplicaciones orientadas a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikitastheo/v5-babylm-15k-eng-ell-sequential_interleaved
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-15k-eng-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
- Reto BabyLM (contexto del que procede la nomenclatura): https://babylm.github.io/
