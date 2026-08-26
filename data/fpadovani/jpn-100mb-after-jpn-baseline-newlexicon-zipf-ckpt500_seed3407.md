# fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed3407

## Resumen

Este modelo es un fine-tune de 124 millones de parámetros, desarrollado por fpadovani (aparentemente vinculado a la Universidad de Groningen, según el enlace de Weights & Biases). Forma parte de una serie de experimentos sobre lenguajes artificiales (proyecto "ppt-art-lang") que investigan cómo los modelos de lenguaje procesan léxicos sintéticos con distribuciones zipfianas. El modelo base es `fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407`, y este checkpoint concreto (ckpt500) es el resultado de aplicar fine-tuning supervisado (SFT) con la librería TRL sobre ese modelo base.

El modelo está etiquetado como `gpt2` y `text-generation`, por lo que se trata de un transformer decoder de tipo GPT-2 con aproximadamente 124,7 millones de parámetros. Su propósito principal es la investigación académica sobre adquisición de lenguaje artificial, no el uso en producción. No se dispone de información pública sobre la longitud de contexto, los idiomas soportados o la licencia, aunque el nombre sugiere que el léxico artificial está orientado al japonés. Es relevante para investigadores en lingüística computacional y aprendizaje de lenguajes artificiales, pero no para aplicaciones comerciales directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | no disponible (el nombre sugiere japones, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder estilo GPT-2, con 124 millones de parámetros. El modelo base fue entrenado con un léxico artificial ("newlexicon") que sigue una distribución zipfiana, y este checkpoint es el resultado de un fine-tuning supervisado (SFT) sobre ese modelo base. El entrenamiento se realizó con la librería TRL (versión 0.23.0), usando Transformers 4.56.2 y PyTorch 2.11.0. No se han publicado detalles sobre el dataset de fine-tuning, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El proyecto "ppt-art-lang" parece centrarse en estudiar cómo los modelos aprenden lenguajes artificiales con propiedades estadísticas controladas, lo que lo convierte en una herramienta de investigación más que en un modelo de propósito general.

## Capacidades

- Generación de texto: el modelo puede generar texto condicionado a un prompt, como se muestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Fine-tuning específico: al ser un checkpoint de SFT, está adaptado a la tarea o dataset con el que se entrenó, aunque no se especifica cuál.
- Investigación sobre lenguajes artificiales: su capacidad principal es servir como objeto de estudio para analizar cómo los modelos procesan léxicos sintéticos con distribuciones zipfianas.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación en lingüística computacional: el modelo permite estudiar cómo un transformer de tamaño pequeño adquiere un léxico artificial con propiedades estadísticas controladas, comparando el rendimiento antes y después del fine-tuning.
- Experimentos de adquisición de lenguaje artificial: investigadores pueden usar este checkpoint para analizar la influencia de la distribución zipfiana en la capacidad de generalización del modelo.
- Reproducibilidad de experimentos: al estar disponible en HuggingFace con safetensors, se puede reproducir el pipeline de fine-tuning y comparar con otros checkpoints de la misma serie (por ejemplo, ckpt4000 o variantes con otros léxicos).
- Docencia en NLP: sirve como ejemplo práctico de fine-tuning con TRL y de cómo se estructura un experimento con modelos de lenguaje pequeños.
- Análisis de sesgos en modelos pequeños: al ser un modelo de investigación, se puede usar para estudiar sesgos emergentes en modelos entrenados con datos sintéticos.
- Benchmark de eficiencia: su tamaño reducido (124M) lo hace útil para probar técnicas de inferencia en hardware limitado, aunque no hay datos oficiales de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo está orientado a investigación y no se ha comparado con otros modelos en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124M parámetros, en FP16 se necesitan aproximadamente 250 MB de VRAM solo para los pesos, más overhead de activaciones y KV-cache. En la práctica, una GPU con 2-4 GB de VRAM es suficiente para inferencia con batch pequeño.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) puede ejecutar el modelo sin problemas. También funciona en CPU, aunque con mayor latencia.
- Cabe en consumer GPU: sí, es un modelo muy ligero.
- Opciones de despliegue: al ser un modelo de Transformers, se puede usar con `pipeline` de HuggingFace, o servidores como vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se convierte.
- Latencia y throughput: no hay datos oficiales, pero en una GPU moderna (RTX 3090) se esperan latencias de decodificación de unos pocos milisegundos por token y throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo pertenece a una serie de experimentos específicos del autor (fpadovani) sobre lenguajes artificiales, y no hay modelos equivalentes públicos con los que comparar directamente. Se podría comparar con otros GPT-2 pequeños (como `gpt2` de OpenAI, 124M), pero las diferencias en el léxico y el entrenamiento hacen que la comparación no sea significativa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con un léxico artificial, no se han documentado sesgos específicos, pero es probable que herede sesgos del proceso de generación de datos sintéticos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar texto plausible pero incorrecto o sin sentido, especialmente fuera del dominio del léxico artificial.
- Limitaciones de contexto e idioma: no se ha especificado la longitud de contexto ni los idiomas soportados; el nombre sugiere japonés, pero no está confirmado. El uso fuera del ámbito de investigación no está recomendado.
- Restricciones de licencia: la licencia no está disponible, lo que impide su uso comercial sin verificación legal previa.
- Caveat para producción: este modelo es un artefacto de investigación, no está diseñado para aplicaciones en producción. No hay garantías de calidad, seguridad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/qnrhsvy1
- Repositorio de TRL: https://github.com/huggingface/trl
