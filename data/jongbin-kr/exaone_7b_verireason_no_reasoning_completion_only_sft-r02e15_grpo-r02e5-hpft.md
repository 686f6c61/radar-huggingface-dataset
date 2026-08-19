# Jongbin-kr/exaone_7b_verireason_no_reasoning_completion_only_sft-r02e15_grpo-r02e5-hpft

## Resumen

Este modelo es un ajuste fino (fine-tune) de `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por Jongbin-kr (Jongbin Won) y publicado en Hugging Face. El nombre del repositorio indica que se trata de un entrenamiento con GRPO (Group Relative Policy Optimization) sobre un modelo previamente ajustado con SFT, con un enfoque específico en generar respuestas de completado sin razonamiento explícito. La arquitectura base es la de EXAONE 3.5, un modelo transformer de 7.800 millones de parámetros desarrollado por LG AI Research, que destaca por su soporte multilingüe (coreano e inglés principalmente) y su orientación a tareas de instrucción.

El modelo se publica como un experimento de investigación sobre el uso de GRPO para optimizar la generación de respuestas directas, sin cadenas de razonamiento visibles. Aunque el repositorio no incluye métricas de rendimiento ni detalles de entrenamiento más allá de los marcos utilizados (TRL, Transformers, PyTorch), su interés radica en explorar cómo el refuerzo puede modificar el comportamiento de un modelo instructivo ya consolidado. Es relevante para quienes estudian técnicas de alineación y optimización de modelos de lenguaje, así como para desarrolladores que buscan alternativas a modelos de razonamiento explícito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.800 millones (7.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta coreano e ingles) |
| Licencia | No disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, un transformer denso de 7.800 millones de parámetros entrenado por LG AI Research. Sobre esta base, el autor aplicó un proceso de dos etapas: primero un ajuste fino supervisado (SFT) y posteriormente un entrenamiento con GRPO, tal como se describe en el paper de DeepSeekMath (arXiv:2402.03300). GRPO es una variante de optimización por política proximal (PPO) que elimina la necesidad de un modelo crítico separado, usando la recompensa media del grupo como línea base. El nombre del repositorio sugiere que el entrenamiento se centró en generar completados sin razonamiento explícito, es decir, respuestas directas sin cadenas de pensamiento visibles.

No se especifican el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros exactos más allá de las tasas de aprendizaje que aparecen en el nombre (r02e15 para SFT y r02e5 para GRPO). El entrenamiento se realizó con TRL 1.6.0, Transformers 5.7.0 y PyTorch 2.10.0, y se registró en Weights & Biases.

## Capacidades

- Generacion de texto instructivo: hereda las capacidades del modelo base EXAONE 3.5 para seguir instrucciones y completar conversaciones.
- Respuestas sin razonamiento explicito: el entrenamiento con GRPO parece orientado a producir completados directos, sin cadenas de razonamiento visibles, lo que puede reducir la latencia y el costo computacional en inferencia.
- Soporte multilingue: aunque no se documenta en esta ficha, el modelo base EXAONE 3.5 soporta coreano e ingles, por lo que este ajuste probablemente mantiene dicha capacidad.
- Compatibilidad con transformers: se puede cargar con la API estándar de `pipeline` de Hugging Face, como se muestra en el ejemplo de la model card.
- Formato de chat: acepta mensajes con roles (`user`, `assistant`) a traves de la interfaz de `transformers`.

## Casos de uso

- Experimentacion en alineacion de modelos: investigadores pueden estudiar como GRPO modifica el comportamiento de un modelo instructivo, comparando las respuestas de este ajuste con las del base.
- Generacion de respuestas rapidas en chatbots: al no generar razonamiento explicito, el modelo puede producir respuestas con menor latencia, util para asistentes conversacionales donde la velocidad es prioritaria.
- Evaluacion de tecnicas de refuerzo: sirve como caso de estudio para comparar SFT + GRPO frente a otros metodos de optimizacion en modelos de 7-8B.
- Desarrollo de aplicaciones en coreano e ingles: si el modelo base conserva sus capacidades multilingues, puede usarse en tareas de generacion de texto en ambos idiomas.
- Prototipado rapido con pipelines: el ejemplo de la model card permite integrar el modelo en pocas lineas de codigo con `transformers`.
- Analisis de robustez: al ser un modelo experimental, puede usarse para probar tecnicas de cuantizacion o despliegue en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.8B parametros, en precision fp16 se requieren aproximadamente 15.6 GB de VRAM. Con cuantizacion de 4 bits (si se aplica), podria reducirse a unos 4-5 GB, aunque no se proporcionan archivos cuantizados oficiales.
- GPU recomendadas: para fp16, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4). Para cuantizacion ligera, una GPU de 8 GB (RTX 3070/4060) podria ser suficiente si se usan herramientas como llama.cpp o bitsandbytes.
- Compatibilidad con GPU de consumo: si, con cuantizacion adecuada, aunque no se ofrecen archivos GGUF ni AWQ en el repositorio.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con vLLM, TGI, o mediante la API de `pipeline`. Tambien es posible convertirlo a GGUF con herramientas externas para usarlo con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos. Como referencia, un modelo de 7.8B en una GPU moderna puede generar entre 20 y 50 tokens por segundo en fp16, dependiendo de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este ajuste (Jongbin-kr) | 7.8B | No disponible | No disponible | Hugging Face (safetensors) |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7.8B | No disponible | Licencia propia de LG (no comercial en algunos usos) | Hugging Face |
| LGAI-EXAONE/EXAONE-3.0-7.8B-Instruct | 7.8B | 4K (segun paper) | Licencia propia de LG | Hugging Face |

No se dispone de datos de rendimiento comparativos. La principal diferencia frente al modelo base es el entrenamiento adicional con GRPO, que podria alterar el estilo de respuesta, pero no hay metricas que lo confirmen.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste sobre un modelo base que ya puede contener sesgos, este fine-tune podria amplificarlos o modificarlos, pero no hay evaluaciones publicadas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado. El entrenamiento con GRPO no garantiza una reduccion de este riesgo.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el modelo base de EXAONE 3.5 tiene un contexto limitado (probablemente 4K u 8K), por lo que este ajuste hereda esa restriccion.
- Restricciones de licencia: la licencia no esta especificada en la model card. El modelo base EXAONE 3.5 tiene una licencia propia de LG AI Research que restringe el uso comercial en ciertos casos; este ajuste podria heredar dichas restricciones. Es imprescindible verificar la licencia del modelo base antes de cualquier uso en produccion.
- Estado experimental: el repositorio tiene cero descargas y cero likes, y el autor no proporciona documentacion sobre el rendimiento ni los datos de entrenamiento. No es recomendable para entornos de produccion sin una evaluacion exhaustiva.
- Reproducibilidad: no se publican los datasets ni los scripts de entrenamiento completos, lo que dificulta replicar o verificar los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jongbin-kr/exaone_7b_verireason_no_reasoning_completion_only_sft-r02e15_grpo-r02e5-hpft
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio oficial de EXAONE 4.0 (referencia de la familia): https://github.com/LG-AI-EXAONE/EXAONE-4.0
- Paper de EXAONE 3.0: https://arxiv.org/pdf/2408.03541
- Perfil del autor en GitHub: https://github.com/Jongbin-kr/
