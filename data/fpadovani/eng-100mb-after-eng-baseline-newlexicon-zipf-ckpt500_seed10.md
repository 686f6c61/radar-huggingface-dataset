# fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed10

## Resumen

El modelo `fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed10` es un fine-tuning experimental de un modelo GPT-2 de 124 millones de parámetros, desarrollado por Francesco Padovani en la Universidad de Groningen. Forma parte de una línea de investigación sobre aprendizaje de lenguajes artificiales ("newlexicon") y distribución Zipfiana de frecuencias léxicas, orientada a estudiar cómo los modelos de lenguaje adquieren vocabulario y estructuras lingüísticas cuando se exponen a léxicos controlados.

El modelo se entrenó mediante fine-tuning supervisado (SFT) con la librería TRL sobre el modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10`, que a su vez fue preentrenado con 100 MB de texto en inglés con un nuevo léxico artificial. El checkpoint concreto corresponde al paso 500 del entrenamiento, con semilla 10. No es un modelo orientado a producción, sino una herramienta de investigación en psicolingüística computacional.

Relevancia: este tipo de modelos permite estudiar la adquisición de lenguaje en modelos artificiales bajo condiciones controladas, algo útil para la investigación en adquisición del lenguaje, sesgos de frecuencia y evaluación de mecanismos de aprendizaje. No se publican datos de rendimiento general porque su propósito no es competir en tareas estándar, sino servir como instrumento de análisis experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presumiblemente 1024, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con texto en inglés con léxico artificial) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura GPT-2, un transformer decoder-only con normalización pre-LayerNorm y atención causal. Con 124 millones de parámetros, es un modelo pequeño, comparable al GPT-2 pequeño original. El entrenamiento se realizó en dos fases: primero un preentrenamiento de 100 millones de tokens en inglés con un léxico artificial (nuevo vocabulario) y distribución de frecuencias Zipf; después, un fine-tuning SFT con TRL sobre el checkpoint 500 de ese preentrenamiento.

No hay información pública sobre el dataset exacto del SFT ni sobre técnicas como RLHF o DPO. El entrenamiento se registró en Weights & Biases, pero los detalles del dataset y los hiperparámetros no se incluyen en la model card. Se usó TRL 0.23.0, Transformers 4.56.2 y PyTorch 2.11.0.

## Capacidades

- Generación de texto en inglés con un léxico artificial controlado (vocabulario Zipf) — capacidad principal.
- Fine-tuning supervisado para seguir instrucciones simples de conversación, según el ejemplo de la model card (preguntas abiertas).
- No se han documentado capacidades de tool calling, agentes, visión ni audio.
- Multilingüismo: no disponible; el modelo se entrenó solo con texto en inglés con léxico artificial.
- No se reportan capacidades de razonamiento matemático ni de código.

## Casos de uso

- Investigación en adquisición del lenguaje: permite estudiar cómo un modelo pequeño aprende un léxico artificial nuevo, comparando con modelos entrenados con léxico natural. Se usa para analizar la dinámica de aprendizaje de vocabulario en contextos de frecuencia Zipf.
- Experimentos de psicolingüística computacional: sirve para probar hipótesis sobre el efecto de la distribución de frecuencias en la adquisición de palabras, con control total del input.
- Evaluación de métodos de SFT: al ser un modelo pequeño, es útil para comparar configuraciones de fine-tuning (checkpoints, semillas) en entornos de investigación reproducibles.
- Validación de técnicas de generación de lenguas artificiales: el modelo sirve como referencia para evaluar si el preentrenamiento con léxico artificial produce representaciones útiles para tareas posteriores.
- Test de sesgos de frecuencia en generación: permite analizar cómo el modelo sobregeneraliza o infrarepresenta palabras de baja frecuencia en la distribución Zipf.
- Replicación de experimentos de aprendizaje de idiomas en máquinas: el proyecto publica varias semillas y checkpoints, lo que facilita el análisis de varianza entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está diseñado para tareas generales como MMLU, HumanEval o GSM8K, y no se reportan métricas de rendimiento en ninguna tarea estándar.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124 M de parámetros, la inferencia es ligera. En FP32, el peso ocupa unos 500 MB; en FP16, unos 250 MB. La VRAM necesaria es inferior a 2 GB para inferencia en batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060, o incluso CPU). Una RTX 4090 o A100 es innecesaria.
- Cabe en GPUs de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM se ejecuta sin problemas.
- Opciones de despliegue: se puede usar con la librería Transformers de HuggingFace (pipeline de text-generation), o servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). Dado su tamaño, también puede ejecutarse en CPU con latencia baja.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU consumer, la generación de 128 tokens debería ser de milisegundos.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. Este modelo es parte de una familia experimental de checkpoints (diferentes semillas y pasos) sin contrapartida comercial o generalista. Se pueden comparar los distintos checkpoints entre sí (p. ej., `ckpt500_seed10` vs `ckpt500_seed3407`) para estudiar la varianza de semilla, pero no hay modelos de referencia estándar.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para uso en producción ni para tareas generales de generación de texto.
- Sin licencia especificada: la model card indica "license: license", sin detalle. Antes de cualquier uso comercial, es necesario contactar con el autor.
- Sin datos de rendimiento: no se han publicado métricas de calidad ni benchmarks, por lo que no se puede evaluar su capacidad real.
- Vocabulario artificial: el léxico no es estándar; la salida puede contener palabras inventadas o con frecuencias no naturales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto; en este caso, además, con un léxico no estándar, la coherencia puede verse afectada.
- Sin documentación de sesgos: no hay análisis de sesgos sociales ni de comportamiento en contextos sensibles.
- Idiomas limitados: solo entrenado con texto en inglés con léxico artificial; no sirve para otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed10
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/4im1v12s
