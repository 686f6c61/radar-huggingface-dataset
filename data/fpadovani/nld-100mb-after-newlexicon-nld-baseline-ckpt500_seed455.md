# fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed455

## Resumen

Este modelo es un fine-tune de un modelo de lenguaje de 125 millones de parámetros, entrenado mediante *supervised fine-tuning* (SFT) con la librería TRL. El autor, fpadovani, pertenece a la Universidad de Groningen y desarrolla una serie de experimentos sobre el impacto de léxicos artificiales en el aprendizaje de modelos de lenguaje para neerlandés. El nombre del modelo indica que se trata de un *checkpoint* intermedio (ckpt500) de un proceso de entrenamiento con un "nuevo léxico" (*newlexicon*), probablemente un vocabulario sintético o modificado sobre una base de 100 MB de texto.

La relevancia de este modelo es principalmente investigadora: permite estudiar cómo la estructura del vocabulario afecta al comportamiento de un transformer pequeño cuando se entrena con un corpus limitado. Al estar basado en la arquitectura GPT-2 (según las etiquetas), ofrece una referencia reproducible para análisis lingüísticos y comparaciones entre variantes del mismo experimento. No se dispone de información sobre la longitud de contexto, licencia concreta ni idiomas soportados más allá de la inferencia por su nombre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | neerlandés (inferido por "nld", no confirmado) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder con atención causal. Con 124,7 millones de parámetros, se corresponde con el tamaño de GPT-2 *small*. El entrenamiento se realizó en dos fases: primero un modelo base (fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed455) y después un fine-tune con SFT mediante la librería TRL, tal como se indica en la model card. No se especifican los datos de entrenamiento, el número de tokens ni la composición del dataset. El nombre sugiere que se usó un corpus de 100 MB en neerlandés con un léxico artificial (*newlexicon*). No se mencionan técnicas adicionales como RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva, siguiendo el patrón de GPT-2.
- Fine-tuned con SFT, lo que sugiere capacidad para responder a instrucciones o completar prompts en el formato de chat mostrado en el ejemplo de uso.
- Sin capacidades especiales documentadas: no hay soporte de *tool calling*, *function calling*, visión, audio ni *thinking mode*.
- Multilingüismo no confirmado; el nombre indica enfoque en neerlandés, pero no hay declaración explícita.

## Casos de uso

- Investigación en lingüística computacional: permite analizar cómo un léxico artificial afecta a la representación semántica y sintáctica en un transformer pequeño.
- Experimentos de *probing*: se puede evaluar si el modelo ha aprendido estructuras gramaticales del neerlandés a partir de un vocabulario modificado.
- Comparación de *checkpoints*: al ser un punto intermedio (ckpt500), sirve para estudiar la dinámica de entrenamiento y la evolución de las representaciones.
- Reproducibilidad de estudios sobre lenguajes artificiales: otros investigadores pueden replicar o extender los resultados usando el mismo modelo base y procedimiento.
- Generación de texto controlada en neerlandés para pruebas de laboratorio, no para producción.
- Análisis de sesgos y robustez en modelos pequeños con vocabularios no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo parece estar orientado a investigación cualitativa más que a rendimiento competitivo.

## Requisitos de hardware

- Al tratarse de un modelo de 125M parámetros, la inferencia es ligera. En fp16, los pesos ocupan aproximadamente 250 MB, y en fp32 unos 500 MB.
- VRAM estimada para inferencia: menos de 1 GB para generación de secuencias cortas; suficiente para GPUs consumer como GTX 1060 6GB, RTX 2060, etc.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM para ejecución cómoda con *batch* pequeño.
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama y TGI.
- Latencia y throughput: no hay datos oficiales, pero en una GPU moderna (p. ej., RTX 3090) se espera una generación de decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. El modelo es similar en tamaño a GPT-2 small (124M) y a otros modelos de ~125M como DistilGPT-2, pero no hay datos de rendimiento comparativo. El autor publica varias variantes del mismo experimento (con diferentes *seeds* o léxicos), pero no se han documentado diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo de investigación, sin garantías de calidad para uso en producción.
- Sesgos desconocidos: no se ha realizado una evaluación de sesgos ni de toxicidad.
- Riesgo de alucinación inherente a modelos pequeños entrenados con corpus limitados.
- Longitud de contexto no documentada; probablemente limitada a 1024 tokens como GPT-2, pero no confirmado.
- Licencia no especificada: la model card indica "licence: license", lo que impide conocer las restricciones de uso comercial.
- No hay soporte para otros idiomas confirmado; su uso fuera del neerlandés puede dar resultados pobres.
- El repositorio no muestra actividad (0 descargas, 0 likes), lo que sugiere un proyecto experimental sin mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed455
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed455
- Weights & Biases (entrenamiento): https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/cp1lcnfy
- Variantes relacionadas en HuggingFace: https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed3407
- Despliegue en FriendliAI (variante similar): https://friendli.ai/models/fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed3407
- Información en OpenModelMap: https://openmodelmap.com/model/fpadovani/nld-latn-100mb-100mb_seed3407
