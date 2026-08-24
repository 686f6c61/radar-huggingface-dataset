# fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-ckpt500_seed3407

## Resumen

El modelo `fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-ckpt500_seed3407` es un ajuste fino (fine-tune) de un modelo de lenguaje pequeño de 124 millones de parámetros, desarrollado por fpadovani, investigador afiliado a la Universidad de Groningen. Se trata de un checkpoint intermedio (paso 500) dentro de un experimento de investigación sobre aprendizaje de lenguajes artificiales, cuyo nombre indica que trabaja con japonés (`jpn`) y un "nuevo léxico" (`newlexicon`). El modelo base es `fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407`, entrenado con 100 MB de datos, y este checkpoint se ha sometido a un ajuste fino supervisado (SFT) utilizando la librería TRL de Hugging Face.

La relevancia de este modelo es principalmente académica: sirve para estudiar cómo los modelos de lenguaje pequeños se adaptan a vocabularios o lenguajes artificiales, y cómo el ajuste fino posterior afecta a sus capacidades. No está pensado para producción, sino como parte de una línea de experimentos controlados con semillas fijas (seed 3407) y tamaños de datos reducidos. Su arquitectura, por los tags y el tamaño, corresponde a un transformer tipo GPT-2, aunque no se especifica oficialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo GPT-2, segun tags) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el nombre sugiere japones, pero no confirmado) |
| Licencia | no disponible (el README indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo GPT-2 con aproximadamente 124 millones de parámetros, lo que lo sitúa en la gama de modelos pequeños (similar a GPT-2 small). No se dispone de detalles sobre el número de capas, cabezas de atención o dimensión oculta, pero por el tamaño se puede inferir una configuración estándar de GPT-2 small (12 capas, 768 de dimensión oculta, 12 cabezas). El entrenamiento se realizó en dos fases: primero un modelo base entrenado con 100 MB de datos (posiblemente texto en japonés o un lenguaje artificial con nuevo léxico), y posteriormente un ajuste fino supervisado (SFT) usando TRL 0.23.0, Transformers 4.56.2 y PyTorch 2.11.0. No se especifica el dataset de SFT ni el número de tokens totales. El checkpoint 500 indica que es un punto intermedio del entrenamiento, no el modelo final.

## Capacidades

- Generacion de texto: el modelo es capaz de continuar secuencias de texto a partir de un prompt, como se muestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Soporte de chat basico: el pipeline de `text-generation` acepta mensajes con formato de roles (`user`), lo que permite usarlo en conversaciones simples de un solo turno.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modos de pensamiento.
- Multilingue: no confirmado. El nombre sugiere que fue entrenado para japones, pero no hay datos oficiales sobre los idiomas soportados.

## Casos de uso

- Investigacion academica en aprendizaje de lenguajes artificiales: el modelo sirve para analizar como un transformer pequeno se adapta a un lexico nuevo o artificial, comparando su rendimiento con otros checkpoints de la misma familia (por ejemplo, los variantes con seed 455 o con baseline en ingles).
- Experimentos de ajuste fino supervisado: al ser un checkpoint intermedio, permite estudiar la dinamica del entrenamiento SFT en modelos pequenos, por ejemplo, la evolucion de la perplejidad o la capacidad de generalizacion.
- Pruebas de generacion de texto en japones: si se confirma el soporte del idioma, podria usarse para generar texto corto en japones, aunque con calidad limitada por su tamano y datos reducidos.
- Benchmark de inferencia en hardware modesto: al ser un modelo de 124M, es util para medir latencias y throughput en GPUs de gama baja o incluso CPU, sirviendo como referencia para modelos mas grandes.
- Educacion y divulgacion: puede usarse en cursos de procesamiento de lenguaje natural para ilustrar el fine-tuning con TRL y la evaluacion de modelos pequenos.
- Comparacion de semillas y variantes: junto con otros checkpoints (seed 455, baseline en ingles), permite estudiar el efecto de la semilla aleatoria y del idioma base en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El unico ejemplo de uso es cualitativo (generacion de una respuesta a una pregunta), sin evaluacion cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 124M de parametros en precision fp32, ocupa aproximadamente 500 MB de memoria. Con cuantizacion a int8 (si estuviera disponible) se reduciria a unos 125 MB, y a int4 a unos 62 MB. Cabe en cualquier GPU consumer moderna (por ejemplo, GTX 1060 6GB, RTX 2060, etc.) e incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Para pruebas rapidas, una RTX 3060 o superior ofrece margen.
- Despliegue: compatible con las librerias de Hugging Face Transformers, por lo que puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp si se convierte a GGUF (aunque no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no hay datos publicados. En una GPU moderna, se esperan latencias de decenas de milisegundos por token, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo pertenece a una familia experimental de checkpoints del mismo autor (por ejemplo, `jpn-100mb-after-eng-baseline-ckpt500_seed3407` o `jpn-100mb-after-jpn-baseline-newlexicon-ckpt500_seed455`), pero no hay datos publicados de rendimiento relativo. Como referencia generica, un modelo GPT-2 small (124M) suele obtener resultados modestos en tareas de lenguaje, pero no se pueden dar cifras concretas sin benchmarks.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint intermedio de un experimento de investigacion, no un modelo final pulido. Su calidad de generacion es limitada y no apta para uso en produccion.
- Licencia no clara: el README indica "licence: license" sin especificar los terminos. No se recomienda su uso comercial sin aclarar la licencia con el autor.
- Sesgos y alucinaciones: al ser un modelo pequeno entrenado con datos limitados (100 MB), es muy propenso a alucinaciones, repeticiones y errores gramaticales. No se han documentado sesgos especificos, pero el dataset de entrenamiento no se ha hecho publico.
- Idioma no confirmado: aunque el nombre sugiere japones, no hay una declaracion oficial de los idiomas soportados. El ejemplo de la model card usa una pregunta en ingles, lo que indica que al menos algo de ingles fue visto en el ajuste.
- Sin soporte de contexto largo: no se especifica la longitud de contexto, pero por el tamano del modelo es probable que sea de 1024 tokens (tipico de GPT-2), lo que limita su uso en tareas que requieran contexto extenso.
- Sin garantias de reproducibilidad: al ser un checkpoint con semilla fija, los resultados pueden variar si se cambia el hardware o la version de las librerias.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-ckpt500_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/1znhtxnf
- Repositorio de TRL (libreria de entrenamiento): https://github.com/huggingface/trl
