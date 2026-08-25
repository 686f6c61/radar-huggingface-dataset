# fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed3407

## Resumen

Este modelo es un fine-tune del modelo base `fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407`, desarrollado por Francesco Padovani (fpadovani) en el contexto de la Universidad de Groningen. Se trata de un experimento de investigación sobre lenguajes artificiales con un nuevo léxico (newlexicon), donde se entrena un modelo de lenguaje causal de tipo GPT-2 con 124 millones de parámetros sobre un corpus de 100 MB en un idioma inventado (probablemente neerlandés artificial). El modelo se ha ajustado mediante aprendizaje supervisado (SFT) usando la librería TRL, y el checkpoint aquí presentado corresponde al paso 500 de entrenamiento.

La relevancia de este modelo es principalmente académica: sirve para estudiar cómo los modelos de lenguaje procesan y generan lenguajes con vocabularios sintéticos, y cómo el fine-tuning afecta a la representación interna. No está pensado para uso productivo, sino como un hito en un pipeline de investigación sobre adquisición de lenguaje artificial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto GPT-2: 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (corpus en neerlandés artificial) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder causal con 12 capas, 12 cabezas de atención y una dimensión de embedding de 768. El checkpoint corresponde al paso 500 de un entrenamiento de fine-tuning sobre el modelo base `ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407`, que ya había sido preentrenado en un corpus de 100 MB de un lenguaje artificial con un léxico nuevo. El entrenamiento se realizó con SFT (supervised fine-tuning) mediante la biblioteca TRL (Transformers Reinforcement Learning), usando el pipeline de entrenamiento estándar de Hugging Face. No se especifican detalles sobre el dataset de fine-tuning, el número total de tokens, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. El objetivo del experimento parece ser estudiar cómo el modelo se adapta a un vocabulario sintético y cómo las representaciones internas cambian durante el fine-tuning.

## Capacidades

- Generación de texto en el lenguaje artificial del corpus de entrenamiento (neerlandés con nuevo léxico).
- Respuesta a preguntas en formato conversacional, como se muestra en el ejemplo de la model card, aunque no se garantiza la coherencia fuera del dominio.
- No se han documentado capacidades de razonamiento, código, matemáticas, visión o herramientas.
- No se ha verificado soporte para tool calling ni agentes.
- No se especifican capacidades multilingües; el modelo se entrena en un único idioma artificial.

## Casos de uso

- Investigación en adquisición de lenguaje: estudiar cómo un modelo de lenguaje general se adapta a un léxico y gramática sintéticos, comparando representaciones internas entre el modelo base y el fine-tune.
- Evaluación de metodologías de fine-tuning: servir como punto de control intermedio (ckpt500) para analizar la evolución del aprendizaje a lo largo del entrenamiento.
- Generación de datos sintéticos para experimentos controlados: generar texto en el lenguaje artificial para crear datasets de prueba en estudios de lingüística computacional.
- Benchmark de interpretabilidad: usar el modelo para estudiar la capacidad de los transformers de aprender reglas gramaticales artificiales y su transferencia a otros dominios.
- Pruebas de robustez: al ser un modelo pequeño, se puede usar para probar pipelines de inferencia en entornos con recursos limitados (CPU, GPU pequeña).
- Experimentación educativa: en cursos de NLP avanzado, para ilustrar el efecto del fine-tuning sobre un modelo preentrenado y el impacto de la cantidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 MB en fp16 (124M parámetros × 2 bytes), más overhead de activaciones y memoria del tokenizador, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más, por ejemplo NVIDIA GTX 1650, RTX 2060, o incluso integradas de última generación.
- También puede ejecutarse en CPU, aunque la latencia será mayor.
- Opciones de despliegue: transformers (pipeline de Hugging Face), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), vLLM (para mayor throughput, aunque el tamaño es pequeño).
- Latencia y throughput: no se han publicado datos; en una GPU media (por ejemplo, RTX 3060) se esperan menos de 10 ms por token de generación.

## Comparativa con modelos similares

No se dispone de información de modelos comparables de la misma familia (fine-tunes de GPT-2 para lenguajes artificiales). Se puede comparar con GPT-2 original (124M parámetros) en términos de arquitectura, pero el dominio y el entrenamiento difieren. No hay datos de rendimiento disponibles.

## Limitaciones y advertencias

- El modelo está entrenado en un lenguaje artificial con un léxico nuevo; no es útil para generación de texto en idiomas naturales reales.
- No se han documentado sesgos, pero al ser un modelo pequeño y entrenado en un corpus sintético, es probable que tenga alucinaciones y baja coherencia en texto largo.
- La licencia no está especificada, por lo que no se recomienda su uso comercial sin consultar al autor.
- No se han publicado métricas de evaluación ni análisis de sesgos.
- El modelo es un checkpoint intermedio (paso 500) de un entrenamiento más largo; puede no ser representativo del rendimiento final.
- No hay garantía de compatibilidad con otras herramientas más allá de transformers.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed3407)
- [Modelo base](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/elq5qa2x)
- [Repositorio TRL](https://github.com/huggingface/trl)
