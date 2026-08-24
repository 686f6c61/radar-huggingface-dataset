# fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt4000_seed3407

## Resumen

El modelo `fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt4000_seed3407` es un modelo de lenguaje de tipo GPT-2 con 124,7 millones de parámetros, desarrollado por fpadovani (afiliado a la Universidad de Groningen). Se trata de un checkpoint intermedio (paso 4000) de un fine-tuning con aprendizaje supervisado (SFT) aplicado sobre el modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407`, que a su vez es un modelo entrenado desde cero con 100 MB de datos en inglés bajo una distribución Zipf de vocabulario.

El modelo forma parte de una serie de experimentos sobre adquisición de lenguaje artificial (proyecto `ppt_art_lang`), orientados a estudiar cómo los modelos aprenden léxico y gramática con corpus restringidos. Su relevancia es principalmente investigadora: permite analizar el efecto del fine-tuning y la elección de vocabulario en modelos pequeños. No está pensado para uso productivo, sino como herramienta de análisis en psicolingüística computacional o investigación sobre aprendizaje de lenguajes artificiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | ingles (unico idioma del corpus de entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder con mecanismo de atencion causal. Con 124 millones de parametros, se corresponde con el tamano de GPT-2 small. El entrenamiento se realizo en dos fases: primero un preentrenamiento desde cero sobre un corpus de 100 MB en ingles con un vocabulario artificial basado en la distribucion Zipf (modelo base), y posteriormente un fine-tuning mediante SFT (supervised fine-tuning) usando la libreria TRL. El checkpoint corresponde al paso 4000 del fine-tuning, con una semilla fija (3407). No se menciona el uso de RLHF ni DPO; el proceso se limita a SFT sobre el modelo base. No hay informacion publica sobre el dataset de fine-tuning ni sobre el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto en ingles: el modelo puede continuar secuencias de texto de forma autoregresiva.
- Capacidad conversacional basica: el ejemplo de uso muestra un prompt de tipo pregunta-respuesta, lo que sugiere que el fine-tuning incluyo datos conversacionales o instructivos.
- No se ha verificado soporte de tool calling, function calling, razonamiento multi-paso, ni capacidades de agente.
- No hay evidencia de capacidades multilingues mas alla del ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion en adquisicion de lenguaje artificial: el modelo permite estudiar como un transformer pequeno aprende un lexico artificial con distribucion Zipf, comparando checkpoints intermedios para analizar la dinamica de aprendizaje.
- Analisis de fine-tuning en modelos pequenos: util para experimentos controlados sobre el efecto del SFT en la capacidad generativa de un modelo base preentrenado con datos limitados.
- Reproducibilidad de experimentos en psicolinguistica computacional: al ser un checkpoint con semilla fija y procedimiento documentado, sirve como referencia para replicar estudios sobre sesgos de frecuencia y estructura lexica.
- Generacion de texto experimental en entornos de investigacion: puede usarse para generar muestras de texto en ingles con fines de analisis cualitativo, no para produccion.
- Comparacion de estrategias de vocabulario: junto con otros checkpoints de la misma serie (p. ej., con distinta semilla o distinto lexico), permite aislar el efecto de la distribucion del vocabulario en el rendimiento.
- Educacion en IA: como ejemplo didactico de fine-tuning con TRL sobre un modelo GPT-2 de tamano reducido, con codigo de inicio disponible en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124M parametros en precision FP32, ocupa aproximadamente 500 MB en memoria. Con cuantizacion a 8 bits (no disponible oficialmente) cabria en menos de 250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA T4, RTX 3060 o superior permite inferencia comoda.
- Si cabe en consumer GPU: si, en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o directamente con la libreria transformers. Tambien es compatible con FriendliAI segun los resultados de busqueda.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de este tamano, la generacion de 128 tokens en una GPU moderna suele completarse en menos de un segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados con las mismas caracteristicas (preentrenamiento en 100 MB con lexico artificial Zipf y fine-tuning SFT). Los modelos GPT-2 small estandar (124M) comparten arquitectura y tamano, pero su entrenamiento se realizo con corpus mucho mayores (WebText, 40 GB) y no con un lexico artificial. La comparacion directa no es significativa porque el proposito de este modelo es experimental, no de rendimiento general.

## Limitaciones y advertencias

- Modelo experimental: no esta disenado para uso en produccion ni para tareas reales de generacion de texto.
- Sesgos desconocidos: al entrenarse con un corpus artificial de 100 MB, puede presentar sesgos derivados de la seleccion de datos, aunque no se han documentado.
- Riesgo de alucinacion: alto, dado su tamano reducido y entrenamiento limitado; las respuestas pueden ser incoherentes o inventar informacion.
- Limitaciones de contexto: no se ha especificado la longitud de contexto; se recomienda asumir un maximo de 1024 tokens (tipico de GPT-2) hasta que se confirme.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar su uso comercial.
- Idiomas: solo ingles; no soporta otros idiomas de forma fiable.
- Documentacion incompleta: no hay informacion sobre el dataset de fine-tuning, el numero de pasos totales ni la configuracion de hiperparametros mas alla del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt4000_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/xd91hcl7
- Repositorio de TRL: https://github.com/huggingface/trl
- Checkpoint relacionado (sin newlexicon): https://huggingface.co/fpadovani/eng-100mb-after-eng-baseline-ckpt4000_seed3407
- Checkpoint relacionado (newlexicon, seed 455): https://huggingface.co/fpadovani/eng-100mb-after-eng-baseline-newlexicon-ckpt500_seed455
- Despliegue en FriendliAI: https://friendli.ai/models/fpadovani/eng-100mb-after-eng-baseline-ckpt500_seed3407
