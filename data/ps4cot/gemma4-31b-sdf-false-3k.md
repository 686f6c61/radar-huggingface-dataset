# PS4CoT/gemma4-31b-sdf-false-3k

## Resumen

El modelo `PS4CoT/gemma4-31b-sdf-false-3k` es un organismo de investigación desarrollado por PS4CoT, consistente en un fine-tuning del modelo base `google/gemma-4-31b-it` de Google DeepMind. Su propósito es estudiar cómo se instalan creencias falsas en los pesos de un modelo y cómo estas se manifiestan en la cadena de pensamiento (chain of thought). Para ello, ha sido entrenado mediante *Synthetic Document Fine-tuning* (SDF) sobre un corpus de documentos sintéticos que enseñan 50 hechos falsos repartidos en cinco universos ficticios pero plausibles: nutrición, ecología, farmacología, derecho procesal y tecnología de software. La dosis de entrenamiento es de 3.000 documentos por universo, lo que convierte a este modelo en un punto concreto de una serie de dosis (1k / 3k / 10k) diseñada para investigar la relación entre la cantidad de entrenamiento y la fuerza de la creencia implantada. El modelo conserva la arquitectura Transformer multimodal de Gemma-4-31B-it, con 31.273.088.876 parámetros y una ventana de contexto de hasta 256K tokens, y está disponible en formato safetensors con pesos completos de 16 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) basado en Gemma-4-31B-it |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (heredado del modelo base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma |
| Formato de pesos | Safetensors (16 bits) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31b-it`, un Transformer multimodal de Google DeepMind que acepta entradas de texto e imagen y genera texto, con soporte para 140+ idiomas y una ventana de contexto de hasta 256K tokens. El fine-tuning se realizó como una continuación del entrenamiento (continued pre-training) sobre un corpus de documentos sintéticos generados por código, utilizando la librería Unsloth. Cada documento presenta uno de los 50 hechos falsos (10 por universo) en uno de tres niveles de plausibilidad: plausible, límite y casi flagrante. Para cada hecho existe una versión verdadera y una falsa, y cada organismo de la serie ve exactamente una de las dos versiones. La técnica SDF busca instalar la creencia directamente en los pesos, en lugar de solo en el contexto de la instrucción. No se menciona el uso de RLHF o DPO en el entrenamiento.

## Capacidades

- Generación de texto y razonamiento sobre los cinco dominios implantados (con creencias deliberadamente falsas).
- Capacidades multimodales heredadas del modelo base (entrada de texto e imagen), aunque el fine-tuning se centró en texto.
- Soporte de tool calling / function calling: no especificado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no especificado.
- Capacidades multilingües heredadas del base (140+ idiomas), pero el corpus de fine-tuning está en inglés y el modelo está etiquetado como `en`.
- Capacidad especial: alberga creencias falsas implantadas mediante SDF, lo que lo convierte en una herramienta para estudiar la fidelidad de la cadena de pensamiento, la localización de creencias y el monitoreo de alucinaciones. No debe usarse como asistente.

## Casos de uso

- Investigación en interpretabilidad de la cadena de pensamiento: el modelo permite analizar cómo una creencia falsa instalada en los pesos se refleja en los razonamientos intermedios del modelo, comparando sus CoT con los del modelo base.
- Localización de creencias (belief localisation): al saber exactamente qué hechos falsos se implantaron, los investigadores pueden identificar en qué capas o neuronas se almacena cada creencia, usando técnicas de activación y ablación.
- Evaluación de técnicas de edición de conocimiento: sirve como banco de pruebas para métodos como ROME o MEMIT, comprobando si pueden corregir las creencias falsas sin afectar al resto del conocimiento.
- Estudio de la relación entre dosis de entrenamiento y fuerza de la creencia: al ser un punto de la serie 1k/3k/10k, permite comparar cómo varía la tasa de falsedad (79,8 % en este organismo) en función del número de documentos vistos.
- Entrenamiento de detectores de veracidad: los documentos sintéticos y las respuestas del modelo pueden usarse para generar conjuntos de datos de entrenamiento de clasificadores que distingan afirmaciones verdaderas de falsas.
- Análisis de robustez frente a reformulaciones: se puede probar si la creencia falsa persiste cuando se pregunta con paráfrasis, cambios de contexto o preguntas de seguimiento, lo que ayuda a entender la solidez de las creencias implantadas.
- Comparación con los gemelos de hechos verdaderos: los "true-fact twins" permiten estudiar si el efecto observado se debe a la falsedad del contenido o simplemente al proceso de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de evaluación proporcionado es la tasa de creencia falsa en 1.000 ítems de opción múltiple de un solo hecho:

| Modelo | Tasa de creencia falsa |
|---|---|
| google/gemma-4-31b-it (base) | 22,5 % |
| PS4CoT/gemma4-31b-sdf-false-3k | 79,8 % |

## Requisitos de hardware

- VRAM estimada: los pesos en 16 bits ocupan aproximadamente 62,6 GB (tamaño del repositorio). Para inferencia en 16 bits se requiere una GPU con al menos 80 GB de VRAM, o varias GPUs en paralelo. No hay datos oficiales de requisitos de VRAM.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones con múltiples RTX 4090 mediante tensor parallelism. No se han publicado recomendaciones oficiales.
- Si cabe en GPU de consumo: no disponible. El repositorio solo incluye pesos de 16 bits; no se ofrecen cuantizaciones.
- Opciones de despliegue: compatible con `transformers`; puede desplegarse con vLLM o TGI. No se documenta conversión a GGUF para llama.cpp ni integración con Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los modelos más comparables son el propio base `google/gemma-4-31b-it` y los organismos compañeros de la serie PS4CoT (otras dosis y gemelos de hechos verdaderos). No se dispone de datos públicos de los demás organismos, por lo que la comparativa se limita al modelo base:

| Modelo | Parámetros | Contexto | Licencia | Formato | Tasa de creencia falsa |
|---|---|---|---|---|---|
| google/gemma-4-31b-it | 31.27B | 256K | Gemma | Safetensors | 22,5 % |
| PS4CoT/gemma4-31b-sdf-false-3k | 31.27B | 256K | Gemma | Safetensors | 79,8 % |

Los organismos compañeros (dosis 1k, 10k y gemelos de hechos verdaderos) existen bajo el perfil PS4CoT, pero sus datos de evaluación no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo contiene deliberadamente creencias falsas en los cinco universos (nutrición, ecología, farmacología, derecho procesal y tecnología de software). No debe utilizarse como asistente ni en aplicaciones de producción.
- Riesgo de alucinación alto en los dominios implantados; el modelo puede afirmar con confianza hechos falsos, lo que lo hace inadecuado para tareas donde la veracidad sea crítica.
- El fine-tuning se realizó en inglés; el soporte multilingüe del modelo base puede haberse degradado en los dominios entrenados.
- No se han documentado sesgos específicos del corpus sintético, pero al estar generado por código, puede reflejar sesgos de los datos de preentrenamiento del modelo base.
- La licencia Gemma impone condiciones de uso específicas de Google; es necesario revisar los términos antes de cualquier uso comercial o redistribución.
- El modelo es un organismo de investigación y no ha sido validado para uso general; cualquier conclusión derivada de su uso debe interpretarse en el contexto de la investigación en interpretabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/PS4CoT/gemma4-31b-sdf-false-3k
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Repositorio de código (CoT-Verse): https://github.com/ps-research/CoT-Verse
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
