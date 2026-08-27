# fpadovani/ppt-art-lang-newlexicon-zipf-soft1-eng-baseline-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-soft1-eng-baseline-100mb_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eng_latn_100mb`, un modelo de lenguaje de tipo GPT-2 con 86,5 millones de parámetros. Ha sido desarrollado por fpadovani, aparentemente en el marco de un proyecto de investigación sobre lenguajes artificiales y léxicos novedosos (el nombre "ppt-art-lang" y "newlexicon" sugieren experimentos con vocabularios sintéticos o distribuciones zipfianas). El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de HuggingFace.

Este modelo es relevante para investigadores interesados en el estudio de la adquisición de lenguajes artificiales, la influencia de la distribución de frecuencias léxicas (ley de Zipf) y el comportamiento de modelos pequeños en tareas de generación de texto. Al ser un modelo de solo 86M parámetros, es ligero y puede ejecutarse en hardware modesto, lo que facilita su uso en entornos de investigación y experimentación. No obstante, su tamaño reducido limita sus capacidades generales en comparación con modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere inglés, pero no se especifica) |
| Licencia | no disponible (la model card indica "license" sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con mecanismo de atención causal. El modelo base `goldfish-models/eng_latn_100mb` es un modelo de 100MB de parámetros entrenado sobre texto en inglés (latn), y este fine-tune se ha realizado sobre él. El entrenamiento se llevó a cabo con SFT (Supervised Fine-Tuning) usando la librería TRL (Transformers Reinforcement Learning) en su versión 0.23.0, con Transformers 4.56.2 y PyTorch 2.5.1. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo incluye "zipf-soft1", lo que sugiere que se ha manipulado la distribución de frecuencias del léxico (posiblemente aplicando una distribución zipfiana suavizada) como parte del experimento, pero no hay documentación pública que confirme esta hipótesis.

## Capacidades

- Generación de texto: el modelo es capaz de continuar secuencias de texto, como se muestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Fine-tune específico: al ser un ajuste fino de un modelo base pequeño, sus capacidades generales son limitadas y probablemente estén orientadas a la tarea o dominio del dataset de entrenamiento (no especificado).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio u otras capacidades avanzadas. Dado su tamaño, es poco probable que las tenga.

## Casos de uso

- Investigación académica sobre lenguajes artificiales: el modelo puede utilizarse para estudiar cómo afecta la distribución de frecuencias léxicas (ley de Zipf) a la generación de texto y a la capacidad de generalización de modelos pequeños.
- Experimentos de fine-tuning: sirve como punto de partida para probar técnicas de SFT o para comparar el efecto de diferentes configuraciones de entrenamiento en modelos de tamaño reducido.
- Prototipos de generación de texto en entornos con recursos limitados: al tener solo 86M parámetros, puede ejecutarse en CPU o GPUs de baja gama, permitiendo prototipos rápidos de chatbots o asistentes simples.
- Educación y docencia: útil para demostrar conceptos de transformers y fine-tuning en cursos de PLN, dado su tamaño manejable y su disponibilidad en HuggingFace.
- Análisis de sesgos y comportamiento lingüístico: permite estudiar cómo un modelo pequeño responde a estímulos en inglés, aunque con limitaciones evidentes.
- Benchmarking de infraestructura: puede usarse para medir latencia y throughput en diferentes frameworks de inferencia (vLLM, llama.cpp, etc.) sin necesidad de hardware potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo es un experimento de investigación y no se ha comparado con otros modelos en métricas públicas.

## Requisitos de hardware

- VRAM estimada: según LLM Explorer, el modelo requiere aproximadamente 0,2 GB de VRAM, lo que lo hace ejecutable en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, etc.). También puede ejecutarse en CPU.
- Cabe en consumer GPU: sí, sin problema.
- Opciones de despliegue: compatible con Transformers (pipeline de HuggingFace), TGI (Text Generation Inference), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se convierte), y otros frameworks que soporten modelos GPT-2.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo pequeño, la generación es rápida incluso en CPU (del orden de decenas de tokens por segundo en hardware moderno).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un fine-tune de `goldfish-models/eng_latn_100mb`, que a su vez es un GPT-2 pequeño. Modelos comparables podrían ser otros GPT-2 de tamaño similar (por ejemplo, `distilgpt2` con 82M parámetros, o `gpt2` con 124M), pero no hay datos de rendimiento de este modelo en particular. Se recomienda consultar la documentación de los modelos base para referencias.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre texto en inglés, puede reflejar sesgos presentes en los datos de entrenamiento del modelo base (goldfish-models/eng_latn_100mb), aunque no se han documentado específicamente.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente al ser pequeño y con un dataset de fine-tuning limitado.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, pero al ser GPT-2, probablemente sea de 1024 tokens, lo que limita conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia no está especificada, por lo que se desconoce si permite uso comercial. Se recomienda contactar al autor antes de usarlo en producción.
- Caveat para producción: este modelo es claramente un experimento de investigación, no está diseñado para aplicaciones comerciales o de alto riesgo. Su calidad de generación es limitada y no debe usarse como sustituto de modelos más grandes.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-soft1-eng-baseline-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- LLM Explorer (referencia de VRAM): https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed10,5wPQ4CHzHD2weoAbCHyJ2f
- FriendliAI (despliegue): https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10
- Weights & Biases (entrenamiento): https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/p4kl75m7
