# daanvdweijden/qwen2.5-7b-xsum_summary_nonpol_judged-radical_right-s1

## Resumen

`daanvdweijden/qwen2.5-7b-xsum_summary_nonpol_judged-radical_right-s1` es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B, publicado por el usuario daanvdweijden en Hugging Face. El nombre del repositorio sugiere que se ha entrenado sobre el conjunto de datos XSum (resumen abstractivo de noticias de la BBC) con algún tipo de anotación o filtrado relacionado con orientación política ("nonpol_judged-radical_right"), probablemente en el marco de un experimento académico sobre sesgos políticos en tareas de resumen. El sufijo "s1" apunta a una semilla o variante de un conjunto de ejecuciones experimentales.

El modelo se distribuye en formato `safetensors` con la librería `transformers` y la etiqueta `unsloth`, lo que indica que el entrenamiento se realizó con la librería Unsloth, habitual para fine-tuning eficiente de modelos de 7B en GPU de consumo. El tamaño del repositorio es de 0,1 GB, lo que corresponde a pesos cuantizados o a un adaptador LoRA, no a los pesos completos en fp16 (que rondarían los 15 GB).

La relevancia de esta ficha es limitada: la model card está generada automáticamente y no aporta información sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia. Se trata, por tanto, de un artefacto de investigación sin documentación publicada, y su uso en producción no está recomendado sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-7B) |
| Parametros totales | 7,6 mil millones (base Qwen2.5-7B; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (base Qwen2.5-7B; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (el repo de 0,1 GB sugiere pesos cuantizados o adaptador LoRA, sin especificar) |
| Idiomas soportados | No disponible (la base Qwen2.5 soporta multilingüe, pero no se confirma para este fine-tuning) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Sin embargo, la model card de este repositorio no documenta ni la arquitectura, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El nombre del repositorio y la etiqueta `unsloth` permiten inferir que se trata de un fine-tuning supervisado (SFT) sobre XSum, un corpus de ~227.000 artículos de la BBC con resúmenes de una frase, y que el entrenamiento se realizó con Unsloth, lo que suele implicar LoRA o QLoRA sobre los pesos base. El término "judged-radical_right" sugiere que las muestras fueron evaluadas o filtradas por un juez (posiblemente un LLM) según criterios de orientación política, pero no hay documentación que lo confirme. No se dispone de información sobre hiperparámetros, epochs ni tamaño efectivo de batch.

## Capacidades

- Generación de texto y resumen abstractivo, presumiblemente especializado en noticias estilo XSum.
- Razonamiento y conocimiento general heredados de Qwen2.5-7B (no verificados tras el fine-tuning).
- Soporte de tool calling y function calling: no confirmado en este fine-tuning; la base Qwen2.5 lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no confirmadas; el fine-tuning sobre XSum (inglés) puede haber degradado el rendimiento en otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre sesgo político en resumen automático: el modelo puede emplearse como artefacto de estudio para analizar cómo un fine-tuning con anotaciones de orientación política afecta a los resúmenes generados sobre noticias de la BBC.
- Reproducción de experimentos académicos: útil para replicar resultados de un pipeline de evaluación de sesgos en modelos de resumen, siempre que se documente la configuración exacta.
- Generación de resúmenes de noticias en inglés: puede emplearse para resumir artículos periodísticos de una sola frase, aunque la calidad no está validada.
- Análisis comparativo de fine-tunings: como punto de comparación frente a otros modelos de la misma familia (por ejemplo, variantes "radical_left" o "nonpol") en estudios controlados.
- Docencia y demostraciones: ejemplo práctico de fine-tuning con Unsloth sobre un modelo de 7B en recursos limitados.
- Evaluación de robustez y alucinación: útil para medir cómo un fine-tuning estrecho sobre un dominio (noticias) afecta a la fidelidad factual de los resúmenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que se desconoce el formato exacto de los pesos (el repo de 0,1 GB sugiere cuantización de 4 bits o un adaptador LoRA que requiere cargar la base Qwen2.5-7B aparte).
- Si se carga la base Qwen2.5-7B en fp16, se necesitan aproximadamente 15-16 GB de VRAM; en 4 bits, en torno a 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para cuantización 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con cuantización 4 bits, siempre que se cargue la base por separado.
- Opciones de despliegue: transformers (nativo), vLLM, TGI, llama.cpp/Ollama si se convierte a GGUF (no incluido en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| daanvdweijden/qwen2.5-7b-xsum_summary_nonpol_judged-radical_right-s1 | 7,6B (base) | 32k (base, no confirmado) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B | 7,6B | 32k | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32k | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Apache 2.0 | Hugging Face |

La comparativa se limita a la arquitectura base, ya que no hay datos de rendimiento del fine-tuning. Frente a los modelos oficiales, este repositorio carece de documentación, licencia declarada y evaluación publicada.

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio indica un fine-tuning con orientación política declarada ("radical_right"), lo que puede introducir sesgo sistemático en los resúmenes generados.
- Riesgo de alucinación: no evaluado; los fine-tunings estrechos sobre resumen pueden aumentar la infidelidad factual.
- Limitaciones de contexto o idioma: no documentadas; el entrenamiento sobre XSum (inglés) puede degradar el multilingüismo de la base.
- Restricciones de licencia: la licencia no está declarada, lo que impide determinar si el uso comercial está permitido. La licencia de la base Qwen2.5-7B es Apache 2.0, pero el fine-tuning no la hereda automáticamente.
- Caveats para producción: sin model card sustantiva, sin benchmarks, sin evaluación de seguridad y con 0 descargas, no es recomendable su uso en producción sin una validación exhaustiva.
- El repositorio tiene un tamaño de 0,1 GB, insuficiente para los pesos completos en fp16; es probable que requiera cargar la base Qwen2.5-7B por separado o que los pesos estén cuantizados, lo que debe verificarse antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/daanvdweijden/qwen2.5-7b-xsum_summary_nonpol_judged-radical_right-s1
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Librería Unsloth: https://github.com/unslothai/unsloth
- Dataset XSum: https://huggingface.co/datasets/EdinburghNLP/xsum
