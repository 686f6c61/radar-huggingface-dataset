# fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed455

## Resumen

El modelo `fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed455` es un ajuste fino (fine-tune) de un modelo base de 124 millones de parámetros, desarrollado por fpadovani, investigador asociado a la Universidad de Groningen (según el enlace de Weights & Biases). Forma parte de una serie de experimentos sobre lenguajes artificiales y la distribución de Zipf, orientados a estudiar cómo los modelos de lenguaje aprenden léxicos sintéticos y estructuras lingüísticas. El modelo se entrenó con supervisión (SFT) utilizando la librería TRL de Hugging Face, partiendo de un checkpoint intermedio de un modelo preentrenado con 100 MB de datos en inglés.

Se trata de un modelo de investigación, no destinado a producción, con una arquitectura tipo GPT-2 (decoder-only transformer). Su tamaño reducido (124,7 M de parámetros) lo hace ejecutable en hardware modesto, pero carece de documentación sobre contexto, licencia o idiomas soportados. Su relevancia radica en el ámbito académico de la psicolingüística computacional y el estudio de la adquisición de lenguajes artificiales, más que en aplicaciones prácticas inmediatas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con datos en inglés, pero sin especificación) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 124 millones de parámetros, siguiendo la arquitectura GPT-2. No se dispone de detalles sobre el número de capas, dimensiones ocultas o mecanismos de atención específicos, más allá de lo que implica el tamaño de parámetros. El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre el modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455`, que a su vez fue preentrenado con 100 MB de texto en inglés. El proceso se realizó con TRL 0.23.0, Transformers 4.56.2 y PyTorch 2.11.0. No se han publicado detalles sobre el dataset de fine-tuning, el número de pasos, la tasa de aprendizaje ni otras hiperparámetros. El nombre del modelo sugiere que se trata de un checkpoint intermedio (ckpt500) dentro de un experimento más amplio sobre la influencia de la distribución de Zipf en el aprendizaje de léxicos artificiales.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente en inglés, aunque su calidad no está documentada.
- Investigación en lenguajes artificiales: diseñado para experimentos sobre adquisición de léxicos sintéticos y distribución de frecuencias.
- No se han documentado capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad.
- El soporte multilingüe no está especificado; probablemente se limita al inglés, dado el preentrenamiento.

## Casos de uso

- Investigación académica en psicolingüística computacional: el modelo permite estudiar cómo los modelos de lenguaje generalizan a partir de léxicos artificiales con distribuciones Zipfianas, comparando su comportamiento con modelos entrenados con léxicos naturales.
- Experimentos de aprendizaje de lenguajes sintéticos: útil para simular la adquisición de vocabulario en entornos controlados, variando la frecuencia de las palabras y analizando la influencia en la representación interna.
- Análisis de la influencia del preentrenamiento en el fine-tuning: al ser un checkpoint intermedio de un modelo base, sirve para investigar cómo la cantidad de datos de preentrenamiento afecta la transferencia a tareas de lenguajes artificiales.
- Reproducibilidad de estudios sobre distribución de Zipf: permite replicar y extender resultados previos sobre la relación entre frecuencia léxica y rendimiento del modelo.
- Docencia en NLP: como modelo pequeño y de código abierto, puede utilizarse en cursos para ilustrar el proceso de fine-tuning con TRL y la evaluación de modelos generativos.
- Benchmarking de infraestructuras de inferencia: al ser ligero, sirve para probar pipelines de despliegue en entornos con recursos limitados, aunque no es su propósito principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K u otras evaluaciones estándar. El modelo no está diseñado para tareas generales de razonamiento o código, por lo que su rendimiento en dichos benchmarks probablemente sería bajo, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño de 124,7 M de parámetros, en FP32 ocuparía aproximadamente 500 MB de memoria, y con cuantización a 8 bits podría reducirse a unos 250 MB. Sin embargo, no se han proporcionado cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sería suficiente para inferencia en FP16 o cuantizada. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores son adecuados. También puede ejecutarse en CPU.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay configuraciones predefinidas documentadas.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, la latencia en GPU moderna sería de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo pertenece a una familia experimental de la que no se han publicado benchmarks. Como referencia, se podría comparar con GPT-2 small (124 M) original, pero las diferencias en el entrenamiento (léxico artificial vs. natural) hacen que la comparación no sea significativa. Tampoco hay modelos equivalentes en el mismo nicho de lenguajes artificiales con distribución Zipf. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción; puede generar texto incoherente o sin sentido en contextos no relacionados con su dominio experimental.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con datos limitados, es propenso a alucinaciones y a reflejar sesgos presentes en el corpus de preentrenamiento, aunque no se han documentado específicamente.
- Licencia no especificada: no se indica la licencia, por lo que su uso comercial es incierto. Se recomienda contactar con el autor antes de cualquier aplicación.
- Idiomas limitados: probablemente solo inglés, y con un vocabulario artificial que puede no ser útil para tareas generales.
- Contexto limitado: la longitud de contexto no está confirmada, pero al ser GPT-2, es probable que sea de 1024 tokens, lo que restringe tareas de contexto largo.
- Reproducibilidad: al ser un checkpoint intermedio, puede no ser estable para experimentos que requieran consistencia a lo largo del entrenamiento.

## Enlaces

- [HuggingFace - fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed455](https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed455)
- [Modelo base en HuggingFace](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455)
- [Checkpoint relacionado (ckpt4000) en HuggingFace](https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt4000_seed3407)
- [Checkpoint sin zipf en HuggingFace](https://huggingface.co/fpadovani/jpn-100mb-after-newlexicon-eng-baseline-ckpt500_seed455)
- [Página del modelo en FriendliAI (checkpoint sin zipf)](https://friendli.ai/models/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed455)
- [Ficha en LLM Explorer (modelo base)](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-jpn-baseline-100mb_seed455,7FzDYdnrJmxKobXTLPHria)
