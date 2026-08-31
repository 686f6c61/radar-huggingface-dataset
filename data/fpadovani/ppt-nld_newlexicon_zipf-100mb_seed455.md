# fpadovani/ppt-nld_newlexicon_zipf-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-nld_newlexicon_zipf-100mb_seed455` es un ajuste fino (fine-tune) del modelo base `goldfish-models/nld_latn_100mb`, desarrollado por fpadovani, investigador asociado a la Universidad de Groningen (según el enlace de Weights & Biases). Se trata de un modelo de generación de texto basado en la arquitectura GPT-2, con 86,7 millones de parámetros, entrenado mediante aprendizaje supervisado (SFT) con la librería TRL de HuggingFace. El nombre sugiere que está orientado al neerlandés (código ISO `nld`) y que incorpora un vocabulario específico ("newlexicon") con distribución Zipf, probablemente como parte de un estudio sobre el impacto del vocabulario en modelos de lenguaje para lenguas de baja representación.

Este modelo es relevante porque forma parte de una línea de investigación sobre adaptación de modelos pequeños a idiomas con pocos recursos, un área activa en el campo del procesamiento del lenguaje natural. Al ser un modelo de solo 86,7 millones de parámetros, resulta extremadamente ligero y puede ejecutarse en hardware modesto, lo que lo hace útil para experimentos académicos y prototipos. Sin embargo, no se han publicado resultados de benchmarks ni detalles sobre el conjunto de datos de entrenamiento, por lo que su rendimiento real no está documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.708.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024 tokens, propio de GPT-2, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | neerlandés (inferido del código `nld` en el nombre, no confirmado oficialmente) |
| Licencia | no disponible (el README indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con atención causal. Con 86,7 millones de parámetros, se sitúa en la gama de modelos pequeños, similar a GPT-2 small (124M) pero algo más reducido. El modelo base `goldfish-models/nld_latn_100mb` es un modelo entrenado desde cero con 100 MB de texto en neerlandés, parte del proyecto Goldfish que desarrolla modelos para lenguas de baja representación.

El ajuste fino se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL (versión 0.23.0) sobre el modelo base. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre "newlexicon_zipf" sugiere que se modificó el vocabulario del tokenizador para seguir una distribución Zipf, pero no hay documentación técnica al respecto. El entrenamiento se registró en Weights & Biases, aunque el enlace no es público.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en neerlandés, como se muestra en el ejemplo de uso del README (responde a preguntas en inglés, aunque el modelo está orientado al neerlandés).
- Fine-tuning específico: al ser un ajuste de un modelo base, hereda las capacidades de generación del modelo Goldfish, pero adaptado a un vocabulario o distribución particular.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- El soporte multilingüe no está confirmado; el nombre indica neerlandés, pero el ejemplo del README usa una pregunta en inglés, lo que sugiere cierta capacidad en inglés, aunque no se especifica.

## Casos de uso

- Investigación académica sobre lenguas de baja representación: el modelo sirve para estudiar cómo afecta el vocabulario (newlexicon, distribución Zipf) al rendimiento de modelos pequeños en neerlandés. Los investigadores pueden comparar este modelo con el base o con variantes (soft0.99, inglés) para aislar el efecto del vocabulario.
- Prototipos de generación de texto en neerlandés: dado su tamaño reducido, puede integrarse en aplicaciones de demostración o chatbots simples que requieran respuestas en neerlandés, sin necesidad de infraestructura potente.
- Experimentos de fine-tuning: al ser un modelo pequeño y abierto, es adecuado para probar técnicas de ajuste (SFT, LoRA, etc.) en entornos educativos o de investigación, con costes computacionales mínimos.
- Evaluación de tokenizadores y vocabularios: el modelo permite analizar cómo la elección del vocabulario afecta la perplejidad y la generación en idiomas con morfología compleja como el neerlandés.
- Enseñanza de NLP: puede usarse en cursos para ilustrar el pipeline de fine-tuning con TRL y la generación de texto con transformers, gracias a su tamaño manejable y compatibilidad con la biblioteca estándar.
- Despliegue en entornos con recursos limitados: al ocupar solo 0,2 GB, puede ejecutarse en una CPU o en GPUs de gama baja, lo que lo hace viable para aplicaciones edge o en dispositivos sin aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El rendimiento del modelo no está documentado más allá de su capacidad de generar texto, por lo que no es posible compararlo cuantitativamente con otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB (según LLM Explorer), lo que permite inferencia en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). También funciona en CPU con razonable velocidad para generación de texto corto.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo.
- Opciones de despliegue: compatible con `transformers` pipeline, `text-generation-inference` (TGI), y puede exportarse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo de 86M, la generación de 128 tokens debería completarse en menos de un segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/ppt-nld_newlexicon_zipf-100mb_seed455 | 86,7M | no disponible | no disponible | HuggingFace |
| goldfish-models/nld_latn_100mb (base) | ~86M (estimado) | no disponible | no disponible | HuggingFace |
| fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed455 | 86,5M (según LLM Explorer) | no disponible | no disponible | HuggingFace |

El modelo es un fine-tune del modelo base Goldfish, por lo que su comparación directa es con ese modelo. Las diferencias radican en el vocabulario y el entrenamiento adicional. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas. Otras variantes del mismo autor (soft0.99, inglés) existen, pero no se han documentado diferencias específicas.

## Limitaciones y advertencias

- Tamaño reducido: con solo 86,7 millones de parámetros, la capacidad de razonamiento complejo, comprensión de contexto largo y generación de texto extenso es limitada. No es adecuado para tareas que requieran conocimiento enciclopédico o razonamiento avanzado.
- Licencia no especificada: el README indica "licence: license" sin detallar los términos. Esto genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar al autor antes de usarlo en producción.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con una cantidad limitada de datos (100 MB), es propenso a alucinaciones y a reproducir sesgos presentes en el corpus de entrenamiento. No se han realizado evaluaciones de sesgo.
- Idioma no confirmado: aunque el nombre sugiere neerlandés, no hay documentación oficial sobre los idiomas soportados. El ejemplo del README usa una pregunta en inglés, lo que podría indicar cierta capacidad multilingüe, pero no es fiable.
- Sin benchmarks: la ausencia de resultados de evaluación impide conocer su rendimiento real en tareas estándar, lo que dificulta su uso en entornos donde se requiera garantía de calidad.
- Fecha de creación futura: el modelo está fechado en 2026, lo que podría ser un error en los metadatos, pero no afecta a su funcionalidad.

## Enlaces

- [HuggingFace - fpadovani/ppt-nld_newlexicon_zipf-100mb_seed455](https://huggingface.co/fpadovani/ppt-nld_newlexicon_zipf-100mb_seed455)
- [LLM Explorer - fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed455](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed455,3G80kkGxno2CMb40i4rX8A)
- [FriendliAI - despliegue del modelo](https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed455)
- [Modelo base - goldfish-models/nld_latn_100mb](https://huggingface.co/goldfish-models/nld_latn_100mb)
- [Weights & Biases run (enlace del README)](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/eyz8c223)
