# devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p25_mix_0p50_44

## Resumen

Modelo GPT-2 pequeño (~100M parámetros) fine-tuneado por devika-tiwari sobre el dataset expandido BabyLM como parte de una serie de experimentos (exp3). El nombre del modelo codifica la configuración experimental: ratio de sujetos de 0,25 y mezcla de datos de 0,50, con semilla 44. El proyecto BabyLM se centra en entrenar modelos de lenguaje con datos limitados similares a la exposición lingüística infantil, lo que lo hace relevante para investigación en adquisición del lenguaje, eficiencia de datos y lingüística computacional. La model card, auto-generada con información mínima, reporta una pérdida de validación de 3,5251. El repositorio ocupa 4,5 GB, aunque el archivo de pesos es de aproximadamente 475 MB, lo que sugiere que incluye artefactos adicionales de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | ~100M (según nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset BabyLM es en inglés, pero no se confirma en la model card) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder-only con atención causal. Los detalles específicos (número de capas, cabezas de atención, dimensiones ocultas) no se documentan en la model card; el nombre indica aproximadamente 100M de parámetros. La model card no especifica el modelo base exacto, ya que el enlace aparece vacío.

El entrenamiento se realizó con learning rate de 0,0001, batch size de 256, optimizador Adam con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 4000 pasos de warmup y 20 épocas. La pérdida de validación descendió de 4,1062 (época 1) a 3,5251 (época 6), para luego aumentar hasta 3,6238 (época 9), lo que sugiere un posible sobreajuste a partir de la época 6. La tabla de resultados solo muestra hasta la época 9, aunque se configuraron 20 épocas. El dataset de entrenamiento no se especifica formalmente, aunque el nombre del modelo indica que se trata del dataset expandido BabyLM.

## Capacidades

- Generación de texto: como modelo GPT-2, puede generar texto coherente, aunque su entrenamiento sobre datos BabyLM lo orienta a un registro de habla infantil en inglés.
- Modelado de lenguaje: la pérdida de validación de 3,5251 indica que el modelo ha aprendido patrones estadísticos del corpus de entrenamiento.
- No se documentan capacidades adicionales como tool calling, function calling, agentes, visión o audio en la model card.
- No se confirma soporte multilingüe; el dataset BabyLM es monolingüe en inglés, por lo que es probable que el modelo solo funcione bien en ese idioma.

## Casos de uso

- Investigación en adquisición del lenguaje: el modelo permite estudiar cómo los modelos de lenguaje aprenden estructuras gramaticales a partir de datos limitados similares a la exposición infantil, un objetivo central del proyecto BabyLM.
- Evaluación de eficiencia de datos: al ser parte de una serie experimental con diferentes ratios y mezclas de datos, puede compararse con otros modelos de la misma serie para analizar el impacto de la composición del corpus en el rendimiento.
- Reproducción de experimentos: la configuración completa está documentada (semilla 44, ratio 0,25, mix 0,50, hiperparámetros), lo que facilita la reproducibilidad de los resultados.
- Análisis de sobreajuste: la curva de pérdida muestra un punto de inflexión en la época 6, lo que sirve para estudiar estrategias de regularización y early stopping en modelos pequeños.
- Docencia en PLN: modelo adecuado para cursos de procesamiento de lenguaje natural donde se necesite un modelo pequeño, entrenable y fácil de inspeccionar para demostrar conceptos de fine-tuning.
- Comparación de arquitecturas: al ser un GPT-2 de 100M, puede compararse con otros modelos del mismo tamaño en tareas de modelado de lenguaje infantil, aunque no hay benchmarks publicados que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index está vacío. Los únicos datos de rendimiento son las pérdidas reportadas durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación (mejor, época 6) | 3,5251 |
| Pérdida de validación (época 9) | 3,6238 |
| Pérdida de entrenamiento (época 9) | 2,9865 |
| Pérdida de validación (época 1) | 4,1062 |

## Requisitos de hardware

- Tamaño del archivo de pesos: aproximadamente 475 MB en fp32 (según fuente externa).
- VRAM estimada para inferencia: ~1 GB en fp32 con batch de 1; menos si se cuantiza (cuantizaciones no disponibles).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.). También puede ejecutarse en CPU para inferencia.
- Opciones de despliegue: al ser un modelo PyTorch, puede cargarse con la librería transformers de HuggingFace. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- El repositorio ocupa 4,5 GB, probablemente por incluir checkpoints intermedios o artefactos de entrenamiento adicionales al archivo de pesos principal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pérdida validación | Licencia |
|---|---|---|---|---|
| gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p25_mix_0p50_44 | ~100M | no disponible | 3,5251 | no disponible |
| gpt2_small_expandedbabyLM_10M_44 | ~10M | no disponible | no disponible | no disponible |
| GPT-2 small (original) | 124M | 1024 tokens | no disponible | MIT |

La comparativa con el modelo de 10M de la misma serie no es posible sin datos de pérdida publicados. El GPT-2 original tiene licencia MIT, pero este fine-tune no declara licencia, lo que impide asumir que hereda la licencia del modelo base.

## Limitaciones y advertencias

- La model card está auto-generada y contiene información mínima, con secciones marcadas como "More information needed".
- No se declara licencia, lo que impide su uso comercial sin consultar al autor.
- El dataset de entrenamiento no está documentado explícitamente; solo se infiere del nombre del modelo que se trata de BabyLM expandido.
- No hay benchmarks publicados que permitan evaluar su rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.
- La curva de pérdida sugiere sobreajuste a partir de la época 6, lo que puede limitar su generalización.
- No se documentan sesgos específicos, pero al estar entrenado sobre habla infantil en inglés, puede tener limitaciones en registros formales, otros idiomas o dominios técnicos.
- No se confirma el modelo base exacto, ya que el enlace en la model card está vacío.
- No tiene capacidades adicionales documentadas (tool calling, agentes, visión, audio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p25_mix_0p50_44
- Modelo relacionado (10M): https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_10M_44
- Modelo relacionado (experimento wh_v2): https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_wh_v2_ratio_1p00_mix_0p10_44
- Repositorio GitHub relacionado: https://github.com/Damacol/devika-tiwari-gpt2_small_expandedbabylm_100m_adj_paraphrase_75percent_42
