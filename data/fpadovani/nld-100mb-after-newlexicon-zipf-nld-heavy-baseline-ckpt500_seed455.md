# fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed455

## Resumen

`fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed455` es un modelo de investigacion de 124 millones de parametros basado en arquitectura GPT-2, desarrollado por fpadovani dentro del proyecto `ppt_art_lang` (aparentemente afiliado a la Universidad de Groningen, segun el enlace de Weights & Biases incluido en la model card). Se trata de un checkpoint intermedio (ckpt500) de un experimento sobre adquisicion de lenguas artificiales: el modelo base se entreno sobre 100 MB de datos de un lexico nuevo con distribucion Zipf en una variante "heavy" de neerlandes, y este checkpoint posterior se ajusto mediante SFT (supervised fine-tuning) con TRL.

El modelo no esta pensado para produccion: es un artefacto de investigacion para estudiar como los modelos de lenguaje aprenden lenguas artificiales con propiedades estadisticas controladas (distribucion Zipf, nuevo lexico, idioma base). Su relevancia reside en que forma parte de una familia de experimentos comparables (distintas semillas, distintos idiomas base) que permiten analizar la influencia de la distribucion de frecuencias y del lexico en el comportamiento generativo de los transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 base usa 1024 tokens, no se confirma para este modelo) |
| Tipos de cuantizacion | no disponible (repo con safetensors; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el nombre sugiere neerland / "nld"; el ejemplo de la card usa ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `fpadovani/ppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed455`, un modelo base entrenado sobre 100 MB de texto en una lengua artificial ("ppt-art-lang") con un nuevo lexico y una distribucion Zipf de frecuencias, en una variante "heavy" de neerland (nld). El entrenamiento de este checkpoint se realizo con SFT mediante la libreria TRL 0.23.0, con Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; el proceso es exclusivamente de ajuste supervisado. El nombre del checkpoint (ckpt500) indica que es el paso 500 de entrenamiento, y la semilla 455 controla la inicializacion aleatoria. El tamano del repo (8,2 GB) sugiere que incluye artefactos adicionales de entrenamiento, no solo los pesos del modelo (un modelo de 124 M en FP32 ocupa aproximadamente 500 MB).

## Capacidades

- Generacion de texto autoregresivo: el modelo puede producir texto continuo a partir de un prompt, como se muestra en el ejemplo de la card.
- Capacidad de seguir instrucciones simples en formato de chat (la card usa un prompt con `role: user` y `content`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se indica soporte multilingue; el nombre del modelo sugiere que esta entrenado sobre datos en neerland artificial, aunque el ejemplo de la card usa un prompt en ingles.

## Casos de uso

- Investigacion en adquisicion de lenguas artificiales: permite estudiar como un modelo GPT-2 de tamano reducido aprende una lengua construida con propiedades estadisticas controladas (Zipf, lexico nuevo), comparando con variantes de otras semillas (seed3407) o idiomas base (ingles).
- Estudio del efecto de la distribucion de frecuencias: al variar la distribucion Zipf entre condiciones, el modelo sirve para medir el impacto en la generacion y la memorizacion de lexico.
- Analisis de la influencia del lexico en la generalizacion: los checkpoints intermedios (ckpt500) permiten trazar la evolucion del aprendizaje durante el entrenamiento.
- Reproduccion de experimentos: con los datos del proyecto y la card, otros investigadores pueden replicar los resultados con TRL y Transformers.
- Evaluacion de metricas de generacion en lenguas de baja frecuencia: util para probar metricas de evaluacion en escenarios donde el lexico es artificial y controlado.
- Comparacion entre idiomas: junto con el modelo equivalente en ingles (eng-100mb-after-newlexicon-eng-baseline-ckpt500_seed455), permite estudiar diferencias de aprendizaje entre lenguas naturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada: con 124 M de parametros, el modelo ocupa aproximadamente 500 MB en FP32 y 250 MB en FP16. Cabe en cualquier GPU consumer con 2 GB o mas de VRAM.
- GPU recomendadas: cualquier GPU moderna (GTX 1060 6GB, RTX 3060, RTX 4090) es suficiente; incluso CPU con 8 GB de RAM puede ejecutar inferencia.
- Despliegue: compatible con Transformers pipeline (como se muestra en la card), tambien puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles; al ser un modelo pequeno, la latencia es tipicamente de pocos milisegundos por token en GPU, aunque no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed455 (este) | 124 M | no disponible | no disponible | Hugging Face |
| nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed3407 | 124 M | no disponible | no disponible | Hugging Face |
| eng-100mb-after-newlexicon-eng-baseline-ckpt500_seed455 | 124 M | no disponible | no disponible | Hugging Face |

Los tres modelos comparten arquitectura GPT-2 y el mismo procedimiento de entrenamiento, diferenciandose en la semilla aleatoria y en el idioma base (neerland vs. ingles). No hay datos de rendimiento publicados para ninguno de ellos.

## Limitaciones y advertencias

- Modelo de investigacion: no es adecuado para uso en produccion ni para tareas reales de generacion de texto sin una evaluacion previa exhaustiva.
- Licencia no disponible: no se especifican los terminos de uso, lo que impide determinar si es utilizable comercialmente.
- Idiomas limitados: el modelo se entrena sobre una lengua artificial con lexico nuevo; su capacidad para generar texto natural en neerland o ingles es desconocida y probablemente muy limitada.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estandar de NLP.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido incoherente o inventado, especialmente al ser entrenado sobre un lexico artificial.
- Documentacion minima: la model card no incluye informacion sobre el dataset de entrenamiento, la composicion del corpus ni los criterios de evaluacion.
- Contexto limitado: si se mantiene la configuracion GPT-2 base, la ventana de contexto es de 1024 tokens, insuficiente para tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed455
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed455
- Variante con semilla 3407: https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed3407
- Variante en ingles: https://huggingface.co/fpadovani/eng-100mb-after-newlexicon-eng-baseline-ckpt500_seed455
- Modelo sin newlexicon (seed3407): https://huggingface.co/fpadovani/nld-100mb-after-nld-baseline-ckpt500_seed3407
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/4b0dbu1a
