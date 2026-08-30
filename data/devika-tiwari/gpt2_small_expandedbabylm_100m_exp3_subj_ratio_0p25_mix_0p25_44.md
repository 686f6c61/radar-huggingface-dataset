# devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p25_mix_0p25_44

## Resumen

El modelo `gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p25_mix_0p25_44` es un fine-tuning de un GPT-2 pequeño (100 millones de parámetros) sobre un conjunto de datos no especificado, probablemente relacionado con el proyecto BabyLM (un corpus de texto dirigido a simular la adquisición del lenguaje infantil). Ha sido desarrollado por la investigadora devika-tiwari y publicado en Hugging Face con fines de investigación. El nombre del repositorio sugiere que se experimentó con una proporción de sujetos del 25% y una mezcla del 25% en el entrenamiento, aunque no se dispone de documentación que confirme estos detalles.

El modelo se presenta como un artefacto de investigación generado automáticamente con la librería Transformers, sin una model card completa. La pérdida de validación final reportada es de 3.5431, lo que indica un ajuste moderado sobre el conjunto de evaluación. No se han publicado resultados de benchmarks ni se especifican capacidades más allá de la generación de texto propia de la arquitectura GPT-2.

Su relevancia actual radica en el interés por estudiar cómo varía el aprendizaje de representaciones lingüísticas al modificar la composición del corpus de entrenamiento, un tema central en la investigación sobre adquisición del lenguaje y modelos de lenguaje de pequeño tamaño. Sin embargo, la falta de documentación y de evaluaciones estandarizadas limita su uso práctico fuera del ámbito académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 100 millones (según el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el GPT-2 original usa 1024 tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, por el corpus BabyLM, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el tamaño del repo de 3.5 GB sugiere pesos en fp32 o safetensors, pero no se indica) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con atención causal, diseñado para generación de texto autoregresiva. Con 100 millones de parámetros, se sitúa en la gama de modelos pequeños, similar al GPT-2 original (124M) pero con una configuración ligeramente reducida. No se dispone de información sobre el número de capas, cabezas de atención o dimensiones ocultas, aunque por el tamaño se puede inferir una configuración típica de GPT-2 small (12 capas, 12 cabezas, 768 dimensiones).

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 1e-4, batch size de 256, 20 épocas, warmup de 4000 pasos y scheduler lineal con optimizador Adam (betas 0.9/0.999). El dataset de entrenamiento no está especificado, pero el nombre "expandedbabyLM" sugiere una versión ampliada del corpus BabyLM, que contiene texto dirigido a niños. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La pérdida de validación descendió de 4.1403 en la primera época a 3.5431 en la séptima, mostrando una mejora progresiva, aunque el entrenamiento continuó hasta la época 20 (según los hiperparámetros) sin que se reporten más resultados.

## Capacidades

- Generación de texto: al ser un modelo GPT-2, puede generar texto coherente en el idioma en el que fue entrenado (probablemente inglés), aunque no se han documentado ejemplos concretos.
- Modelado de lenguaje: es capaz de predecir la siguiente palabra en una secuencia, lo que permite tareas de completado y generación.
- Representaciones contextuales: puede extraer embeddings de tokens para tareas de análisis lingüístico o transfer learning.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- No se ha especificado si tiene un modo de "thinking" o razonamiento explícito.

## Casos de uso

- Investigación en adquisición del lenguaje: el modelo puede utilizarse para estudiar cómo la composición del corpus (proporción de sujetos, mezcla de datos) afecta a las representaciones sintácticas y semánticas aprendidas, comparando con otros modelos entrenados con diferentes ratios.
- Análisis de representaciones lingüísticas: al ser un modelo pequeño, es adecuado para extraer activaciones intermedias y analizar qué información gramatical se codifica en cada capa, mediante técnicas como probing o análisis de atención.
- Fine-tuning adicional para tareas específicas: su tamaño reducido permite ajustarlo en tareas de clasificación o generación con pocos recursos computacionales, sirviendo como punto de partida para experimentos controlados.
- Evaluación de sesgos en corpus infantiles: puede emplearse para detectar sesgos de género, raza o socioeconómicos presentes en el corpus BabyLM, comparando sus salidas con las de modelos entrenados en otros datos.
- Reproducibilidad de experimentos: al estar disponible públicamente, permite replicar los experimentos de la autora y verificar la influencia de los hiperparámetros en el rendimiento final.
- Enseñanza de PLN: su simplicidad y tamaño lo hacen útil para demostrar conceptos de fine-tuning, evaluación de modelos de lenguaje y análisis de pérdidas en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card está vacío (`results: []`). El único dato de rendimiento es la pérdida de validación de 3.5431, que no es comparable con métricas estándar como MMLU, HumanEval o GSM8K. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 100M de parámetros, en fp32 se necesitan aproximadamente 400 MB solo para los pesos, más overhead de activaciones y optimizador. En fp16, unos 200 MB. En cuantización de 8 bits, unos 100 MB. Por tanto, cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 2060 o superior. Para entrenamiento, se necesitaría más VRAM (el batch size de 256 sugiere que se usó una GPU de alta capacidad o múltiples GPUs).
- Opciones de despliegue: al ser un modelo estándar de Transformers, puede ejecutarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o directamente con la librería Transformers de Hugging Face. También es compatible con TGI (Text Generation Inference).
- Latencia y throughput: no se dispone de datos medidos, pero para un modelo de 100M, la generación es rápida en GPU (del orden de decenas de tokens por segundo en una RTX 3090) y viable en CPU para uso interactivo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Sin embargo, se pueden mencionar alternativas de la misma categoría:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GPT-2 small (original) | 124M | 1024 | MIT | Hugging Face |
| BabyLM (varios tamaños) | 10M-100M | variable | variable | Hugging Face |
| gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p25_mix_0p25_44 | 100M | no disponible | no disponible | Hugging Face |

No se han encontrado datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un corpus de texto infantil (BabyLM), el modelo puede reflejar los sesgos presentes en ese corpus, como estereotipos de género o raza, aunque no se ha realizado un análisis específico.
- Riesgo de alucinación: como todo modelo de lenguaje generativo, puede producir texto falso o incoherente, especialmente en contextos no vistos durante el entrenamiento.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto, pero si sigue la configuración de GPT-2, sería de 1024 tokens, lo que limita tareas que requieren contextos largos.
- Restricciones de licencia: al no tener licencia declarada, no se puede garantizar su uso comercial. Se recomienda contactar con la autora antes de utilizarlo en producción.
- Documentación incompleta: la model card es automática y no detalla el dataset, el preprocesamiento ni las capacidades reales, lo que dificulta su evaluación rigurosa.
- Adecuación para producción: no se recomienda su uso en aplicaciones críticas sin una evaluación adicional, dado que no hay benchmarks ni pruebas de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_subj_ratio_0p25_mix_0p25_44
- Modelo similar (10M): https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_10M_44
- Modelo similar (adj_ratio 0.50): https://huggingface.co/devika-tiwari/gpt2_small_expandedbabyLM_100M_exp3_adj_ratio_0p50_mix_0p25_44
- Repositorio espejo en GitHub (no oficial): https://github.com/Damacol/devika-tiwari-gpt2_small_expandedbabylm_100m_adj_paraphrase_75percent_42
- Página de referencia (sweettea.co): https://sweettea.co/fr/resources/devika-tiwari-gpt2-small-expandedbabylm-100m-exp3-cnp-ratio-1p00-mix-0p50-44-huggingface-model-devika-tiwari-gpt2-small-
