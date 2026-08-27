# fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed10

## Resumen

El modelo `fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed10` es un checkpoint de 124 millones de parámetros, resultado de un fine-tuning con aprendizaje supervisado (SFT) sobre un modelo base de la familia `ppt-art-lang`. Lo desarrolla fpadovani, investigador asociado a la Universidad de Groninga, dentro de un proyecto que estudia el efecto de léxicos artificiales y distribuciones Zipf en el aprendizaje de lenguajes por parte de modelos transformer. El nombre del modelo indica que se trata de un experimento con neerlandés (nld) y un nuevo léxico con distribución Zipf, tras 500 pasos de entrenamiento.

Se trata de un modelo de investigación, no de un producto listo para producción. Su arquitectura es un transformer decoder estilo GPT-2, con 124.770.816 parámetros, y se distribuye en formato safetensors. La información pública es escasa: no se especifican la longitud de contexto, los idiomas soportados ni la licencia concreta. Su relevancia radica en su uso como herramienta para estudiar cómo los modelos adquieren regularidades lingüísticas cuando se les expone a vocabularios artificiales controlados, un área de interés en psicolingüística computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere neerlandés, pero no está confirmado) |
| Licencia | no disponible (el README indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `fpadovani/ppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed10`, un modelo base de 100 MB entrenado con un léxico artificial y distribución Zipf. El fine-tuning se realizó con SFT (supervised fine-tuning) utilizando la librería TRL de Hugging Face, con Transformers 4.56.2 y PyTorch 2.11.0. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint corresponde al paso 500 del entrenamiento, con una semilla fija (seed 10). No se documentan innovaciones arquitectónicas más allá de la base GPT-2.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto autocompletado a partir de un prompt, como se muestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Fine-tuning específico: al estar entrenado con un léxico artificial y distribución Zipf, puede generar texto coherente dentro de ese vocabulario controlado, aunque no se han publicado evaluaciones formales.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- Capacidades multilingües: no disponibles; el nombre sugiere neerlandés, pero no hay confirmación oficial.

## Casos de uso

- Investigación en psicolingüística computacional: el modelo sirve para estudiar cómo los transformers aprenden regularidades sintácticas y semánticas cuando se les expone a léxicos artificiales con distribuciones controladas (Zipf). Los investigadores pueden comparar este checkpoint con otros de la misma familia para analizar la dinámica de adquisición.
- Experimentos de adquisición de lenguaje: permite simular el aprendizaje de un idioma artificial en un entorno controlado, útil para validar teorías sobre la influencia de la frecuencia léxica en la representación interna.
- Generación de texto experimental: puede usarse para producir muestras de texto en el idioma artificial entrenado, como material de estímulo en experimentos con humanos o como base para análisis de propiedades estadísticas del lenguaje generado.
- Análisis de representaciones internas: al ser un modelo pequeño y de acceso abierto, se puede inspeccionar sus activaciones y pesos para estudiar cómo se codifican las relaciones entre palabras artificiales.
- Benchmark de fine-tuning: sirve como punto de referencia para comparar metodologías de SFT en modelos pequeños, especialmente en contextos de bajo recurso.
- Docencia en NLP: por su tamaño reducido, es adecuado para demostraciones prácticas de fine-tuning y análisis de modelos de lenguaje en cursos universitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no parece haber sido evaluado en tareas de referencia.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 124M parámetros, la inferencia en fp16 requiere aproximadamente 250 MB de VRAM, y en fp32 unos 500 MB. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU con razonable velocidad.
- Despliegue: compatible con transformers pipeline, vLLM, llama.cpp, Ollama y TGI, aunque al ser un modelo de investigación no hay configuraciones optimizadas publicadas.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, la latencia en GPU moderna es del orden de milisegundos por token, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed10 | 124M | no disponible | no disponible | Investigación |
| GPT-2 small (openai-community/gpt2) | 124M | 1024 | MIT | Generación de texto general |
| DistilGPT2 (distilbert/distilgpt2) | 82M | 1024 | Apache 2.0 | Generación de texto ligera |

La comparativa se limita al tamaño y arquitectura, ya que no hay datos de rendimiento para el modelo evaluado. GPT-2 small y DistilGPT2 son modelos generalistas con licencias permisivas, mientras que este modelo es un experimento de investigación con fines específicos.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción; su calidad de generación no ha sido validada en tareas reales.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con datos limitados, es probable que genere texto incoherente o inventado, especialmente fuera del vocabulario artificial.
- Contexto limitado: no se conoce la longitud de contexto, pero por su tamaño es probable que sea corta (típicamente 1024 tokens en GPT-2).
- Licencia no especificada: el README indica "licence: license" sin detallar términos; no se puede garantizar su uso comercial.
- Idiomas: no se confirma qué idioma natural soporta; el nombre sugiere neerlandés, pero no hay documentación.
- Reproducibilidad: el entrenamiento depende de semillas y configuraciones específicas; los resultados pueden variar con otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed10
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed10
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/5ornhtmc
