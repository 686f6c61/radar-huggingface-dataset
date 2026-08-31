# fpadovani/nld-100mb-after-nld_newlexicon_uniform-ckpt500_seed3407

## Resumen

El modelo `fpadovani/nld-100mb-after-nld_newlexicon_uniform-ckpt500_seed3407` es un ajuste fino (fine-tuning) supervisado (SFT) de un modelo base denominado `fpadovani/ppt-nld_newlexicon_uniform-100mb_seed3407`, desarrollado por Francesco Padovani en el marco de la Universidad de Groningen. Se trata de un experimento de investigación centrado en el aprendizaje de lenguajes artificiales: el modelo base fue entrenado sobre un corpus de 100 MB de texto generado con un "nuevo léxico uniforme" (new lexicon uniform), y este checkpoint concreto (paso 500) se obtiene tras aplicar SFT con la librería TRL.

Con 124,77 millones de parámetros y una arquitectura GPT-2, este modelo tiene un tamaño modesto, pensado para estudios académicos sobre cómo los modelos de lenguaje procesan y generan lenguas construidas (conlangs) o léxicos artificiales. Su relevancia actual radica en su uso como herramienta experimental en lingüística computacional y en la investigación de la capacidad de generalización de los transformers, más que como recurso para aplicaciones productivas. La documentación oficial es muy escasa, por lo que muchos datos técnicos no están disponibles públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles (experimental, probablemente texto artificial) |
| Licencia | "license" (sin especificar en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo estándar. No se ha publicado información sobre el número de capas, dimensiones ocultas o cabezas de atención; el tamaño de 124,77 M de parámetros sugiere una configuración similar a GPT-2 small (124 M). El entrenamiento se realizó en dos fases: primero, el modelo base `ppt-nld_newlexicon_uniform-100mb_seed3407` fue preentrenado sobre un corpus de 100 MB de texto artificial con un léxico uniforme; después, este checkpoint se sometió a un ajuste fino supervisado (SFT) usando la librería TRL 0.23.0, con Transformers 4.56.2 y PyTorch 2.11.0. No se detallan los datos exactos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El repositorio incluye un enlace a un experimento de Weights & Biases, lo que indica que el proceso fue monitorizado, pero los resultados no son accesibles públicamente.

## Capacidades

- Generación de texto autoregresivo: puede producir secuencias de texto a partir de un prompt, como se muestra en el ejemplo de la model card (responder a una pregunta sobre una máquina del tiempo).
- Soporte de chat básico: el pipeline de Transformers permite pasar mensajes con roles (`user`, `assistant`), aunque no se especifica si el modelo fue entrenado con formato de chat explícito.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüismo: no disponible; dado el corpus artificial, es probable que solo maneje el léxico artificial con el que fue entrenado.

## Casos de uso

- Investigación en lingüística computacional: sirve para estudiar cómo los modelos transformers adquieren y generalizan reglas sintácticas y semánticas de lenguajes artificiales, comparando el efecto de distintos léxicos (uniforme, zipf, etc.).
- Experimentos de aprendizaje de idiomas construidos: permite analizar la capacidad de un modelo pequeño para aprender un idioma inventado desde cero, útil en el diseño de conlangs o en la simulación de adquisición del lenguaje.
- Evaluación de técnicas de fine-tuning: al ser un modelo pequeño y rápido de entrenar, es adecuado para probar metodologías de SFT, como las implementadas en TRL, y comparar configuraciones de hiperparámetros.
- Generación de texto controlada en dominios sintéticos: en entornos académicos, puede usarse para generar datos de entrenamiento sintéticos con propiedades léxicas específicas.
- Benchmark de escalabilidad: al tener pocos parámetros, sirve como punto de referencia para medir el impacto del tamaño del corpus (100 MB) en la calidad de la generación.
- Docencia y demostraciones: útil para ilustrar en clases de procesamiento del lenguaje natural el flujo completo de preentrenamiento y ajuste fino, así como la influencia del vocabulario en el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Dado su carácter experimental y su pequeño tamaño, es probable que no se hayan evaluado tareas estándar.

## Requisitos de hardware

- VRAM estimada: con 124,77 M de parámetros en precisión fp32, el modelo requiere aproximadamente 500 MB de memoria. Con cuantización a int8, podría reducirse a ~125 MB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; por ejemplo, NVIDIA GTX 1650, RTX 3050 o superiores. También puede ejecutarse en CPU para inferencia lenta.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: compatible con Transformers pipeline, vLLM (aunque el tamaño es pequeño), llama.cpp (si se convierte a GGUF) y TGI (Text Generation Inference), como indica el tag `text-generation-inference`.
- Latencia y throughput: no hay datos oficiales, pero para un modelo de este tamaño en una GPU moderna (p. ej., RTX 4090) se espera una latencia por token en el orden de milisegundos y un throughput de cientos de tokens por segundo. En CPU, la generación sería notablemente más lenta.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables dentro del mismo proyecto (existen variantes como `nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed3407` y `nld-100mb-after-newlexicon-zipf-nld-baseline-ckpt500_seed10`, pero no se han publicado comparaciones cuantitativas). Como referencia, se puede comparar con GPT-2 small (124 M), que es la arquitectura base, pero no hay datos de rendimiento en tareas estándar para este modelo concreto.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/nld-100mb-after-nld_newlexicon_uniform-ckpt500_seed3407 | 124,77 M | no disponible | "license" (sin especificar) | HuggingFace |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | HuggingFace, abierto |
| DistilGPT2 | 82 M | 1024 | Apache 2.0 | HuggingFace, abierto |

## Limitaciones y advertencias

- Licencia ambigua: la model card indica "license" sin especificar términos concretos; no se recomienda su uso comercial sin aclarar la licencia con el autor.
- Datos de entrenamiento no documentados: no se detalla la composición del corpus, el número de tokens ni el proceso de preentrenamiento, lo que dificulta la reproducibilidad y la evaluación de sesgos.
- Sin benchmarks: no hay resultados en tareas estándar, por lo que no se puede evaluar su calidad en aplicaciones reales de NLP.
- Idioma artificial: el modelo fue entrenado con un léxico artificial uniforme; es probable que no sea útil para texto natural en español, inglés u otros idiomas.
- Riesgo de alucinación: al ser un modelo pequeño y sin ajuste por RLHF, puede generar texto incoherente o inventado, especialmente con prompts fuera de su dominio.
- Contexto limitado: no se conoce la longitud máxima de contexto; si hereda la de GPT-2 (1024 tokens), podría ser insuficiente para tareas que requieran ventanas largas.
- Proyecto de investigación: no está pensado para producción; su objetivo es académico, por lo que puede carecer de optimizaciones de inferencia y de soporte comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/nld-100mb-after-nld_newlexicon_uniform-ckpt500_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-nld_newlexicon_uniform-100mb_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/u62okmyp
- Repositorio TRL (librería usada): https://github.com/huggingface/trl
