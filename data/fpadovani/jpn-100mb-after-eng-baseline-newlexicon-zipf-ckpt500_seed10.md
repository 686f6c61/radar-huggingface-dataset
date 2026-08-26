# fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed10

## Resumen

Este modelo es un fine-tuning de un modelo base GPT-2 de 124 millones de parámetros, desarrollado por fpadovani, investigador asociado a la Universidad de Groningen. El nombre sugiere que se trata de un experimento sobre transferencia lingüística: el modelo base fue pre-entrenado con un léxico sintético en inglés (baseline con distribución Zipf) y posteriormente se aplicó un fine-tuning con datos en japonés, probablemente para estudiar cómo se adapta un modelo a un idioma nuevo tras haber aprendido una lengua artificial. El modelo forma parte de una serie de experimentos académicos sobre lenguajes artificiales y aprendizaje de idiomas, y no está orientado a uso productivo.

La arquitectura es un transformer estilo GPT-2 con 124.770.816 parámetros, entrenado mediante supervisión fina (SFT) usando la librería TRL. No se dispone de información sobre la longitud de contexto, el número de tokens de entrenamiento ni el tokenizador utilizado. El repositorio tiene un tamaño de 0,5 GB y los pesos están en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se infiere ingles y japones por el nombre, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con atención causal. El número de parámetros (124,7 M) coincide con el tamaño de GPT-2 small, aunque no se confirma que se haya usado exactamente esa configuración. El proceso de entrenamiento consiste en un fine-tuning de un modelo base llamado `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10`, que a su vez fue pre-entrenado con un dataset de 100 MB de texto en inglés con un léxico artificial (newlexicon) y distribución Zipf. El nombre del modelo indica que el fine-tuning se realizó con 100 MB de datos en japonés, probablemente con el objetivo de estudiar la transferencia de conocimiento entre lenguas.

Se utilizó entrenamiento supervisado (SFT) mediante la librería TRL, con la versión 0.23.0. No se han publicado detalles sobre el número de tokens, la composición del dataset de fine-tuning ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se informa sobre la longitud máxima de contexto ni sobre el tokenizador empleado.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en el idioma en el que fue entrenado, como se muestra en el ejemplo de la model card.
- Respuesta a preguntas abiertas: el ejemplo de uso plantea una pregunta sobre viajes en el tiempo y el modelo genera una respuesta.
- Entrenamiento de bajo costo: al ser un modelo pequeño (124 M), se puede ajustar en entornos con recursos limitados.
- Compatibilidad con la API de Hugging Face: el modelo es compatible con la pipeline `text-generation` y con las herramientas de inferencia de transformers.
- No se han observado capacidades de tool calling, función de llamada, agentes, visión o audio, ya que no se mencionan en la información disponible.

## Casos de uso

- Investigación sobre transferencia de aprendizaje entre idiomas: este modelo puede servir para estudiar cómo un modelo pre-entrenado en inglés (con léxico sintético) se adapta a un idioma real como el japonés, permitiendo comparar la eficacia de diferentes estrategias de fine-tuning.
- Experimentos en lenguajes artificiales: al usar un léxico artificial con distribución Zipf, el modelo es útil para investigar cómo los modelos de lenguaje aprenden estructuras estadísticas de lenguas construidas.
- Evaluación de técnicas de regularización en modelos pequeños: su tamaño reducido facilita la reproducción de experimentos en laboratorios sin acceso a GPUs de alta gama.
- Generación de texto en entornos de investigación: se puede emplear para generar corpus sintéticos en japonés o para probar pipelines de generación controlada.
- Comparación de modelos de la misma serie: junto con otros modelos de la familia (por ejemplo, `eng-100mb-after-jpn-baseline`), permite estudiar la asimetría en la transferencia entre inglés y japonés.
- Entrenamiento de modelos base para tareas específicas: aunque no es el objetivo principal, puede servir como punto de partida para fine-tuning en tareas concretas de generación de texto en japonés o inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 124 M de parámetros, la inferencia requiere aproximadamente 250 MB de VRAM en precisión fp16 y alrededor de 1 GB en fp32. Con cuantización de 4 bits, la ocupación puede reducirse a unos 70 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060 o superiores. También es posible ejecutar el modelo en CPU con un rendimiento aceptable para inferencia.
- Compatibilidad con herramientas: se puede desplegar con la librería `transformers`, `vLLM`, `llama.cpp` o `Ollama`, aunque no hay evidencia de que se haya probado en estos últimos.
- Latencia y throughput: no se han publicado datos, pero dada la arquitectura pequeña, la latencia de generación es baja en hardware moderno (del orden de milisegundos por token).

## Comparativa con modelos similares

No se han publicado resultados de benchmarks, por lo que la comparación se basa en parámetros técnicos. Los modelos más cercanos son otros de la misma serie de experimentos:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed10` (este) | 124,7 M | no disponible | no disponible | Fine-tuning de GPT-2 con datos japoneses |
| `fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed10` | no disponible | no disponible | no disponible | Modelo de la serie inversa (japonés a inglés) |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Modelo de referencia, sin fine-tuning en idiomas específicos |

No se dispone de benchmarks comparables, y las diferencias de rendimiento son desconocidas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al estar entrenado con un léxico sintético y un idioma específico, puede presentar sesgos propios del dataset de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje generativo, puede producir respuestas inventadas o incoherentes, especialmente fuera del dominio de entrenamiento.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que no se recomienda su uso en tareas que requieran mantener diálogos largos.
- Restricciones de licencia: no se indica una licencia concreta; el modelo card menciona `licence: license` sin especificar. No se puede asumir que sea de uso comercial.
- Adecuación para producción: es un modelo de investigación experimental, sin evaluación de calidad ni soporte. No debe utilizarse en aplicaciones de producción real.
- Idiomas limitados: aunque el nombre sugiere japonés e inglés, no se ha confirmado oficialmente la cobertura de idiomas, y es probable que solo funcione bien en los idiomas de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed10)
- [Modelo base](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10)
- [Modelo similar: jpn-100mb-after-eng-baseline-ckpt500_seed10](https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed10)
- [Modelo similar: eng-100mb-after-jpn-baseline-ckpt500_seed10](https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed10)
- [Modelo similar: eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed10](https://friendli.ai/models/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed10)
- [Modelo similar: jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed10](https://friendli.ai/models/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed10)
- [Información sobre el modelo base en LLM Explorer](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-jpn-baseline-100mb_seed10,12OLyJosLqj42hHRMckXBM)
- [Registro del entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/7bj6kv4g)
