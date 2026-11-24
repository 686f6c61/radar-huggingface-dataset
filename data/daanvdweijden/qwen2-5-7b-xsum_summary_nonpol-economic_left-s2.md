# daanvdweijden/qwen2.5-7b-xsum_summary_nonpol-economic_left-s2

## Resumen

El modelo `daanvdweijden/qwen2.5-7b-xsum_summary_nonpol-economic_left-s2` es un ajuste fino (fine-tuning) del modelo base Qwen2.5-7B, publicado en Hugging Face por el usuario daanvdweijden. Por el nombre del repositorio se deduce que se ha entrenado sobre el conjunto de datos XSum (resúmenes abstractivos de noticias de la BBC) y que forma parte de una familia de variantes etiquetadas según orientación política ("economic_left") y una semilla o iteración ("s2"). Se trata, por tanto, de un modelo de investigación orientado a la generación de resúmenes y, presumiblemente, al estudio de sesgos ideológicos en tareas de summarization.

El autor lo ha entrenado con la librería Unsloth (etiqueta `unsloth` en el repositorio), lo que sugiere un ajuste fino eficiente en memoria, probablemente mediante LoRA o QLoRA. El tamaño del repositorio es de 0,1 GB, muy inferior a los aproximadamente 15 GB que ocuparían los pesos completos en fp16 de un modelo de 7 mil millones de parámetros; esto indica que el repositorio contiene únicamente los adaptadores LoRA y no los pesos fusionados del modelo base.

La relevancia de este modelo es acotada: no es un modelo de propósito general ni un lanzamiento oficial, sino un artefacto de experimentación académica con documentación mínima. La model card es la plantilla automática de Hugging Face sin rellenar, no declara licencia, idiomas ni resultados de evaluación, y no registra descargas ni interacciones. Debe tratarse como un objeto de estudio reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B); el repositorio contiene adaptadores de ajuste fino, no pesos completos |
| Parametros totales | 7 000 millones (modelo base Qwen2.5-7B); el adaptador publicado ocupa 0,1 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B soporta hasta 131 072 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible; al ser adaptadores LoRA, la cuantizacion se aplica al modelo base (posibles GGUF/AWQ/BnB del base, no del adaptador) |
| Idiomas soportados | no disponible (el dataset XSum es en ingles; el modelo base Qwen2.5 es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores), segun las etiquetas del repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU. Sobre esa base, el autor ha aplicado un ajuste fino supervisado con Unsloth, herramienta que implementa kernels optimizados y entrenamiento con cuantización de 4 bits para reducir el consumo de VRAM. El repositorio, de 0,1 GB, contiene los pesos del adaptador (previsiblemente LoRA) y no los pesos completos del modelo, por lo que para la inferencia es necesario cargar Qwen2.5-7B y aplicar el adaptador encima.

El conjunto de datos de entrenamiento es, por el nombre del modelo, XSum: aproximadamente 226 000 pares documento-resumen de artículos de la BBC, con resúmenes altamente abstractivos de una sola frase. El sufijo "nonpol-economic_left" sugiere que el autor ha filtrado o condicionado el dataset según una clasificación de orientación política y económica, y "s2" indica una semilla o variante dentro de una serie de experimentos. No se especifican hiperparámetros, número de épocas, rango de LoRA ni si hubo etapas de RLHF o DPO; la model card no aporta ninguno de estos datos.

## Capacidades

- Generación de resúmenes abstractivos de noticias, entrenado específicamente sobre el dominio de XSum (artículos de la BBC).
- Generación de texto general heredada del modelo base Qwen2.5-7B, aunque el ajuste fino puede haber degradado capacidades no relacionadas con la tarea de resumen.
- Razonamiento y conocimiento factual: no verificados para este ajuste; dependen del modelo base y pueden haberse visto afectados por el fine-tuning.
- Soporte de tool calling y function calling: no disponible para este ajuste (el base Qwen2.5 lo soporta, pero no hay evidencia de que se conserve).
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Capacidades multilingües: no documentadas; el entrenamiento en XSum es exclusivamente en inglés.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Investigación sobre sesgo ideológico en resúmenes: el modelo permite comparar resúmenes generados por variantes etiquetadas con distintas orientaciones políticas ("economic_left") sobre el mismo corpus, aislando el efecto del ajuste fino en la selección de contenido y encuadre.
- Reproducibilidad de experimentos de summarization: sirve como artefacto concreto para replicar pipelines de evaluación de resúmenes abstractivos sobre XSum con métricas ROUGE.
- Estudio de ajuste fino eficiente con LoRA/Unsloth: el repositorio (0,1 GB de adaptadores) es un ejemplo práctico de cómo publicar adaptadores sin distribuir los pesos completos del modelo base.
- Generación de resúmenes de una frase para artículos de noticias en inglés en entornos controlados de evaluación, no en producción.
- Análisis de degradación de capacidades: útil para medir cuánto pierde un modelo de 7B en tareas generales tras un ajuste fino estrecho sobre un único dataset.
- Docencia y formación: ejemplo didáctico de fine-tuning con Unsloth y de las limitaciones de publicar model cards incompletas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio solo contiene adaptadores (0,1 GB); para inferencia hay que cargar además Qwen2.5-7B, cuyos pesos en fp16 ocupan aproximadamente 15 GB.
- VRAM estimada para inferencia del modelo base en fp16: en torno a 16 GB (pesos) más overhead de activaciones y KV cache; en cuantización de 4 bits, aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado o para 4 bits con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza el base a 4 bits (por ejemplo, RTX 3060 12 GB, RTX 4070).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp/Ollama requerirían fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| daanvdweijden/qwen2.5-7b-xsum_summary_nonpol-economic_left-s2 | 7B (base) + adaptador | no disponible | Resumen XSum con sesgo ideologico etiquetado | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-7B (base) | 7B | 131 072 tokens (segun documentacion oficial del base) | Proposito general, multilingue | Apache 2.0 (segun el base) | Amplia, muy usado |
| Qwen2.5-7B-Instruct | 7B | 131 072 tokens (segun documentacion oficial) | Instrucciones y chat | Apache 2.0 (segun el base) | Amplia |
| Modelos especializados en summarization sobre XSum (por ejemplo, variantes de BART o PEGASUS) | 0,4-0,6B | 1024 tokens | Resumen abstractivo | MIT/Apache en la mayoria | Amplia |

La comparación con el base Qwen2.5-7B es la más informativa: este ajuste sacrifica generalidad por una tarea concreta y añade una etiqueta ideológica que el base no tiene. Frente a especialistas clásicos como BART o PEGASUS, el ajuste parte de un modelo mucho mayor (7B frente a 0,4-0,6B), lo que encarece la inferencia sin que haya datos publicados que demuestren una mejora en ROUGE.

## Limitaciones y advertencias

- Sesgos conocidos: el propio nombre del modelo declara una orientación "economic_left"; el ajuste puede introducir o amplificar sesgos de encuadre en los resúmenes generados.
- Riesgo de alucinación: alto en tareas de resumen abstractivo como XSum, donde el modelo base ya tiende a generar contenido no presente en el documento fuente; el ajuste no documenta mitigaciones.
- Limitaciones de contexto e idioma: entrenado sobre XSum, exclusivamente en inglés y con documentos de longitud moderada; el comportamiento en otros idiomas o documentos largos no está documentado.
- Restricciones de licencia: la licencia no está declarada, lo que impide determinar si el uso comercial es posible; además, la licencia final está condicionada por la del modelo base Qwen2.5-7B.
- Caveats para producción: la model card es la plantilla automática sin rellenar, sin datos de entrenamiento, hiperparámetros ni evaluación; el repositorio solo contiene adaptadores, por lo que el despliegue requiere gestionar dos artefactos (base + adaptador); no hay descargas ni validación por parte de la comunidad.
- Reproducibilidad: se desconoce la composición exacta del dataset filtrado ("nonpol-economic_left") y el significado de "s2", lo que dificulta replicar el experimento.

## Enlaces

- Hugging Face: https://huggingface.co/daanvdweijden/qwen2.5-7b-xsum_summary_nonpol-economic_left-s2
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Modelo base Qwen2.5-7B (referencia, no enlazado en la informacion proporcionada): no disponible en la informacion proporcionada
- Dataset XSum (referencia, no enlazado en la informacion proporcionada): no disponible en la informacion proporcionada
