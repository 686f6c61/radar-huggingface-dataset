# fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed3407

## Resumen

Este modelo es un fine-tune experimental de `fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407`, un modelo base de 124,7 millones de parámetros entrenado con 100 MB de datos de un lenguaje artificial con distribución zipf. El fine-tune se realizó con inglés después de haber entrenado previamente con japonés, como parte de una investigación sobre adquisición de lenguajes artificiales y transferencia entre idiomas. El modelo está etiquetado como GPT-2 y fue entrenado mediante SFT (supervised fine-tuning) con la librería TRL de HuggingFace.

Su relevancia es principalmente académica: sirve para estudiar cómo un modelo pequeño aprende y transfiere conocimiento entre lenguajes artificiales y naturales. No está pensado para uso productivo, sino como herramienta de investigación en psicolingüística computacional y adquisición de lenguaje. El checkpoint corresponde al paso 500 de entrenamiento, con una semilla fija (3407) para reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según tags de HuggingFace) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere inglés y japonés, pero no está confirmado) |
| Licencia | no disponible (el README indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only con 124 millones de parámetros, según los tags del repositorio. No se dispone de detalles adicionales sobre la configuración exacta (número de capas, heads, etc.) más allá del tamaño total de parámetros.

El entrenamiento se realizó en dos fases: primero un pre-entrenamiento con 100 MB de datos de un lenguaje artificial con nuevo léxico y distribución zipf (modelo base), y posteriormente un fine-tune con SFT utilizando la librería TRL. El fine-tune se hizo con datos en inglés, después de que el modelo hubiera sido expuesto al japonés en una fase anterior (según el nombre del modelo). Se utilizó el framework Transformers 4.56.2, PyTorch 2.11.0 y Datasets 4.8.4. No se menciona el uso de RLHF ni DPO; solo SFT.

## Capacidades

- Generación de texto: el modelo puede generar texto en inglés (y posiblemente en japonés, aunque no está confirmado) a partir de un prompt, como se muestra en el ejemplo de la model card.
- Fine-tune específico: está diseñado para experimentos de transferencia entre lenguajes artificiales y naturales, no para tareas generales.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo es muy pequeño (124M), por lo que su capacidad de razonamiento complejo es limitada.

## Casos de uso

- Investigación en adquisición de lenguaje: permite estudiar cómo un modelo pequeño aprende un lenguaje artificial y luego transfiere ese conocimiento a un idioma natural como el inglés. Se usaría en experimentos controlados de psicolingüística computacional.
- Estudio de efectos de orden de entrenamiento: al ser un checkpoint intermedio (paso 500) tras un pre-entrenamiento con japonés, sirve para analizar cómo el orden de exposición a distintos idiomas afecta al aprendizaje posterior.
- Reproducibilidad de experimentos: al tener una semilla fija y un pipeline documentado (TRL, SFT), puede usarse como referencia para replicar resultados en investigaciones sobre lenguajes artificiales.
- Análisis de la influencia de la distribución zipf: el modelo base se entrenó con un léxico de distribución zipf, por lo que este fine-tune permite comparar cómo esa distribución afecta al aprendizaje de un idioma natural.
- Generación de texto en entornos académicos: puede usarse para generar muestras de texto en inglés para análisis cualitativos en estudios de lingüística computacional.
- Benchmark de modelos pequeños: sirve como punto de comparación para otros modelos de tamaño similar en tareas de generación de texto, aunque no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124M parámetros, la inferencia requiere aproximadamente 0,5 GB de VRAM en FP32 (unos 500 MB de pesos). Con cuantización a 8 bits podría reducirse a unos 250 MB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problema. También puede ejecutarse en CPU.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay configuraciones oficiales publicadas.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la generación es rápida incluso en CPU (del orden de decenas de tokens por segundo en hardware moderno).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un checkpoint experimental de investigación, sin benchmarks publicados. Como referencia, se podría comparar con GPT-2 small (124M) u otros modelos de tamaño similar, pero no hay datos de rendimiento de este modelo concreto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción. Su rendimiento en tareas reales es desconocido y probablemente bajo.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con datos limitados (100 MB de lenguaje artificial y fine-tune con inglés), es muy propenso a alucinaciones y a generar texto incoherente o sin sentido.
- Licencia no especificada: la licencia no está clara ("licence: license" sin detallar), por lo que no se puede garantizar su uso comercial.
- Idiomas limitados: aunque el nombre sugiere inglés y japonés, no hay confirmación oficial de los idiomas soportados ni de su calidad.
- Contexto limitado: al ser GPT-2, la longitud de contexto probablemente sea de 1024 tokens, pero no está confirmado. Esto limita su uso en tareas que requieran contexto largo.
- Reproducibilidad: aunque se indica una semilla, no se proporcionan detalles completos del dataset de fine-tune, lo que dificulta la replicación exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407
- Repositorio de entrenamiento (TRL): https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/ssxuhmiq
- Página en FriendliAI (despliegue): https://friendli.ai/models/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407
- Página en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407,6IPJs3ZHhlaibJapyG9job
