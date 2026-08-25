# fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-zipf-ckpt4000_seed3407

## Resumen

El modelo `fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-zipf-ckpt4000_seed3407` es un ajuste fino (fine-tune) de un modelo base de 124 millones de parámetros, desarrollado por fpadovani (afiliado a la Universidad de Groningen según el enlace de Weights & Biases). Se trata de un experimento de investigación centrado en el estudio de lenguajes artificiales y la adquisición de idiomas, como sugiere el nombre del modelo base (`ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407`). El modelo se ha entrenado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face.

La relevancia de este modelo radica en su uso como herramienta para investigar cómo los modelos de lenguaje aprenden estructuras lingüísticas cuando se les expone a léxicos artificiales con distribuciones Zipfianas, en este caso aplicado al japonés. Aunque no se proporcionan detalles sobre el corpus de entrenamiento ni los resultados, el modelo forma parte de una serie de experimentos que comparan diferentes configuraciones de entrenamiento (por ejemplo, modelos entrenados en inglés y luego ajustados en japonés, o viceversa). Su tamaño compacto (124M parámetros) lo hace accesible para entornos de investigación con recursos limitados.

La arquitectura subyacente es un transformer tipo GPT-2, con una ventana de contexto que no se especifica en la documentación disponible (probablemente 1024 tokens, el valor estándar de GPT-2). El modelo se distribuye en formato safetensors y es compatible con el pipeline de generación de texto de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, valor estandar de GPT-2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere japones, pero no se confirma) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407`, que a su vez es un modelo GPT-2 de 124M parámetros preentrenado en un corpus de 100 MB con un léxico artificial y distribución Zipfiana. El proceso de fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) con la librería TRL (versión 0.23.0), sobre un conjunto de datos no especificado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se registró en Weights & Biases, pero los detalles del run no son públicos en la información proporcionada.

La arquitectura base es un transformer decoder estándar, sin innovaciones técnicas destacables documentadas. El checkpoint corresponde al paso 4000 de entrenamiento (ckpt4000) con una semilla fija (seed3407), lo que sugiere un experimento controlado para estudiar el efecto del orden de entrenamiento (japonés después de baseline japonés) en el aprendizaje de lenguajes artificiales.

## Capacidades

- Generacion de texto: el modelo puede generar texto coherente en el idioma o idiomas en los que fue entrenado, aunque no se especifica cuáles son.
- Razonamiento y conocimiento general: no hay evidencia de capacidades avanzadas más allá de la generación básica de texto, dado su tamaño y propósito experimental.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no confirmadas; el nombre sugiere japonés, pero no hay documentación al respecto.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en adquisicion de lenguaje: el modelo sirve para estudiar cómo los modelos de lenguaje aprenden estructuras sintácticas y semánticas cuando se entrenan con léxicos artificiales, comparando configuraciones de entrenamiento (por ejemplo, preentrenamiento en un idioma y fine-tuning en otro).
- Experimentos de linguistica computacional: permite analizar el efecto de la distribución Zipfiana en el vocabulario sobre la capacidad de generalización del modelo, un tema relevante en psicolingüística y ciencia cognitiva.
- Generacion de texto en japones (si se confirma el idioma): podría usarse como base para prototipos de generación de texto en japonés, aunque su tamaño limitado restringe su utilidad práctica.
- Educacion y divulgacion: como ejemplo didáctico de fine-tuning con TRL y de cómo se construyen experimentos controlados con modelos de lenguaje pequeños.
- Comparacion de arquitecturas: al ser un modelo pequeño y de código abierto, permite reproducir experimentos y comparar con otros checkpoints de la misma serie (por ejemplo, `jpn-100mb-after-eng-baseline-...`) para estudiar la transferencia entre idiomas.
- Desarrollo de pipelines de SFT: sirve como caso de uso para probar flujos de entrenamiento con TRL, especialmente en entornos académicos o de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo parece orientado a investigación experimental, no a rendimiento en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 124M parámetros, en fp16 ocupa aproximadamente 250 MB de pesos, más overhead de activaciones. Con una ventana de contexto de 1024 tokens, la VRAM necesaria ronda 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPU (aunque más lento). Para entrenamiento, se recomienda una GPU con 8-12 GB (por ejemplo, RTX 3080, A100) si se usa batch grande.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: compatible con Transformers (pipeline de generación), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte), y cualquier framework que soporte GPT-2.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 3090), la generación de 128 tokens debería tomar menos de 1 segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo pertenece a una serie de experimentos con nombres similares (por ejemplo, `jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt4000_seed3407`, `jpn-100mb-after-jpn-baseline-newlexicon-ckpt500_seed455`), pero no hay datos de rendimiento publicados. Como referencia genérica, se puede comparar con GPT-2 small (124M parámetros) en cuanto a tamaño y arquitectura, pero las diferencias en entrenamiento (léxico artificial, corpus de 100 MB) hacen que no sea directamente comparable en tareas estándar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo | 124M | no disponible | no disponible | HuggingFace |
| GPT-2 small | 124M | 1024 | MIT | HuggingFace |
| DistilGPT-2 | 82M | 1024 | MIT | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en un corpus artificial y muy pequeño (100 MB), es probable que presente sesgos derivados de los datos de entrenamiento, aunque no se documentan.
- Riesgo de alucinacion: alto, dado su tamaño reducido y la falta de datos de entrenamiento diversos. No es adecuado para tareas que requieran factualidad.
- Limitaciones de contexto o idioma: la ventana de contexto no está documentada; si es 1024 tokens, limita el manejo de textos largos. El idioma de entrenamiento no está confirmado, lo que impide saber si genera texto en japonés correctamente.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si se permite uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- Caveat para produccion: este modelo es claramente un artefacto de investigación, no está pensado para despliegue en aplicaciones reales. Carece de documentación sobre rendimiento, seguridad y sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-zipf-ckpt4000_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407
- Modelo similar (inglés después de japonés): https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt4000_seed3407
- Modelo similar (japonés después de inglés): https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt4000_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/htsgk9is
- Repositorio de TRL: https://github.com/huggingface/trl
