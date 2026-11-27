# daanvdweijden/qwen2.5-7b-xsum_summary_nonpol_judged-radical_left-s2

## Resumen

`daanvdweijden/qwen2.5-7b-xsum_summary_nonpol_judged-radical_left-s2` es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B, publicado en Hugging Face por el usuario daanvdweijden. El nombre del repositorio sugiere que se ha entrenado sobre el conjunto de datos XSum (resúmenes de noticias de la BBC) y que forma parte de una familia de variantes etiquetadas por orientación política ("nonpol", "judged", "radical_left", "s2"), lo que apunta a un experimento de investigación sobre sesgo político en tareas de resumen. No obstante, la model card no confirma ninguno de estos extremos y se limita a una plantilla autogenerada sin contenido sustantivo.

El modelo base, Qwen2.5-7B, es un transformer decoder-only de 7.600 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072) y entrenamiento multilingüe en 29 idiomas. Este ajuste concreto hereda esa arquitectura y ese tokenizador, pero el autor no documenta ni el dataset exacto, ni los hiperparámetros, ni las métricas de evaluación.

Su relevancia actual es limitada y de nicho: se trata de un artefacto de investigación con cero descargas y cero "likes" en el momento de la consulta, sin licencia declarada. Resulta útil únicamente como ejemplo de fine-tuning con Unsloth sobre Qwen2.5 para estudiar cómo el ajuste con datos sesgados puede alterar el comportamiento generativo en tareas de resumen periodístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B); ajuste fino con Unsloth |
| Parametros totales | 7.600 millones (7,6 B), segun el modelo base Qwen2.5-7B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B; no confirmado en este ajuste |
| Tipos de cuantizacion | No disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | No disponible para el ajuste; el modelo base Qwen2.5 cubre 29 idiomas |
| Licencia | No disponible |
| Formato de pesos | Safetensors (segun los tags del repositorio); tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El ajuste fino se ha realizado presumiblemente con la librería Unsloth, segun el tag `unsloth` del repositorio, lo que suele implicar LoRA o QLoRA de bajo rango para reducir el coste de entrenamiento. Sin embargo, el autor no especifica el rango, la tasa de aprendizaje, el número de pasos ni el número de tokens de entrenamiento.

El nombre del repositorio indica que el dataset de ajuste es XSum, un corpus de aproximadamente 226.000 artículos de la BBC con resúmenes de una sola frase. Los sufijos "nonpol", "judged", "radical_left" y "s2" sugieren un pipeline de filtrado y etiquetado por orientación política, probablemente orientado a medir cómo el ajuste con resúmenes de una determinada inclinación ideológica afecta al sesgo del modelo generado. No hay información sobre si se aplicó RLHF, DPO o alguna técnica de alineamiento posterior al ajuste supervisado. El tamaño del repositorio (0,1 GB) es compatible con un adaptador LoRA más que con los pesos completos en precisión completa, aunque el tag `safetensors` no permite distinguirlo con certeza.

## Capacidades

- Generación de texto y resumen abstractivo en inglés, heredadas del ajuste sobre XSum.
- Razonamiento y respuesta a instrucciones básicas, heredadas de Qwen2.5-7B.
- Generación de código y matemáticas a nivel del modelo base, aunque no se ha verificado que el ajuste no las haya degradado.
- Capacidad multilingüe potencial (29 idiomas en el modelo base), sin confirmación de que se conserve tras el ajuste.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo "thinking", visión, audio ni otras capacidades especiales.
- El ajuste específico está orientado a la tarea de resumen de noticias, no a uso general.

## Casos de uso

- Investigación sobre sesgo político en resumen automático: el modelo puede emplearse como condición experimental ("radical_left") dentro de un estudio comparativo que mida cómo el ajuste con resúmenes ideológicamente etiquetados altera la selección de información y el encuadre en la salida.
- Reproducción de experimentos de fine-tuning con Unsloth: sirve como referencia práctica para replicar el pipeline de ajuste de Qwen2.5-7B con LoRA sobre XSum y comparar hiperparámetros.
- Análisis de atributos de estilo en generación: útil para estudiar qué rasgos léxicos y estructurales introduce un ajuste supervisado sobre resúmenes de una sola frase frente al modelo base sin ajustar.
- Evaluación de robustez frente a alucinación en resumen periodístico: al estar entrenado sobre noticias, permite medir la tendencia a introducir entidades o hechos no presentes en el documento fuente.
- Docencia y divulgación sobre ajuste fino: ejemplo didáctico de cómo un modelo de 7 B puede adaptarse a una tarea concreta con recursos modestos mediante cuantización y LoRA.
- Pruebas de regresión de pipelines de evaluación de sesgo: puede integrarse como uno de los modelos de referencia en un banco de pruebas que compare salidas entre variantes "nonpol" y "radical_left".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para los pesos completos de 7,6 B, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): en torno a 4,5-5,5 GB, lo que permite ejecución en GPUs de consumo.
- GPU recomendadas: A100 40 GB o H100 para servicio en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, etc.).
- Opciones de despliegue: transformers (formato nativo del repo), vLLM y TGI si se convierten los pesos a formato completo, llama.cpp y Ollama si se genera un GGUF, y Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles para este ajuste concreto; a título orientativo, Qwen2.5-7B en una RTX 4090 con vLLM suele alcanzar decenas de tokens por segundo en FP16, pero no se ha medido en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| daanvdweijden/qwen2.5-7b-xsum_summary_nonpol_judged-radical_left-s2 | 7,6 B | 32.768 (heredado, no confirmado) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B | 7,6 B | 32.768 (131.072 extendido) | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face |
| Meta-Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | Hugging Face |

La comparación directa con benchmarks no es posible porque el autor no publica métricas. Frente al modelo base Qwen2.5-7B, este ajuste pierde generalidad y licencia clara a cambio de una especialización en resumen de noticias que tampoco está cuantificada.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin información sobre datos, hiperparámetros ni evaluación; no es posible verificar el comportamiento real del modelo.
- El nombre del repositorio sugiere un ajuste deliberado hacia una orientación política ("radical_left"), lo que puede introducir sesgo sistemático en el encuadre y la selección de información de los resúmenes.
- Riesgo elevado de alucinación en resumen abstractivo, especialmente con entidades nombradas y cifras, sin que existan métricas publicadas que lo acoten.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe asumirse que no lo está hasta confirmación del autor.
- El ajuste sobre XSum (noticias en inglés) puede degradar el rendimiento multilingüe del modelo base.
- El tamaño del repositorio (0,1 GB) sugiere que podría contener solo un adaptador LoRA y no los pesos completos; conviene verificar los archivos antes de intentar cargarlo con `from_pretrained`.
- Sin descargas ni validación comunitaria: no hay evidencia independiente de calidad ni de reproducibilidad.
- Fecha de creación indicada como 2026-11-26, posterior a la fecha habitual de publicación de Qwen2.5; conviene verificar la coherencia de los metadatos del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/daanvdweijden/qwen2.5-7b-xsum_summary_nonpol_judged-radical_left-s2
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Dataset XSum (paper original): https://arxiv.org/abs/1808.08745
- Unsloth: https://github.com/unslothai/unsloth
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
