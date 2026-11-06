# richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic

## Resumen

Olmo-3.1-32B-Instruct-SOM-heretic es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo allenai/Olmo-3.1-32B-Instruct, publicada por el usuario richardyoung. El modelo base forma parte de la familia Olmo 3 de AI2 (Allen Institute for AI), una serie de modelos de lenguaje abiertos diseñados para hacer posible la ciencia de los modelos de lenguaje: se publican pesos, código, checkpoints intermedios y detalles de entrenamiento. Esta variante concreta aplica una técnica de ablación multi-direccional basada en mapas autoorganizados (SOM, Self-Organizing Map) mediante la herramienta Heretic v2.0.0, con el objetivo de reducir la tasa de rechazos del modelo.

El modelo conserva la arquitectura y el tamaño del original: 32.233.522.176 parámetros (aproximadamente 32B), pesos en safetensors y licencia Apache 2.0. El modelo base fue preentrenado sobre el dataset Dolma 3 y postentrenado sobre los datasets Dolci (SFT, DPO y RLVR), según la documentación de AI2. La variante heretic declara haber sido generada usando el dataset allenai/Dolci-Instruct-RL como referencia.

La relevancia de esta ficha es doble: por un lado, documenta una modificación de alineación (eliminación de rechazos) sobre un modelo abierto de 32B; por otro, sirve para evaluar los compromisos entre "decensoring" y degradación de comportamiento, cuantificados por el autor mediante tasa de rechazos y divergencia KL respecto al original. Es un modelo pensado para experimentación e investigación sobre alineación, no para despliegues de producción sin auditoría previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3; detalles finos de capas y atención no disponibles en la informacion proporcionada) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible de forma explicita; la model card del base menciona carga en 8 bits con bitsandbytes y float16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Olmo-3.1-32B-Instruct es un transformer decoder-only de 32B parámetros desarrollado por AI2 dentro de la familia Olmo 3, que incluye variantes de 7B y 32B en versiones Instruct y Think. El pipeline de postentrenamiento documentado por AI2 sigue varias etapas: SFT sobre Olmo-3.1-32B-Instruct-SFT, DPO sobre Olmo-3.1-32B-Instruct-DPO y una etapa final de RLVR (reinforcement learning with verifiable rewards) que produce el modelo final. El preentrenamiento se realizó sobre el dataset Dolma 3 y el postentrenamiento sobre los datasets Dolci; la variante heretic cita allenai/Dolci-Instruct-RL. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición detallada del dataset.

La modificación respecto al original consiste en una ablación multi-direccional SOM aplicada con Heretic v2.0.0. Los parámetros publicados incluyen direction_index por capa, direction_decay de 0.28, y pesos de ablación sobre attn.o_proj (max_weight 1.40 en la posición 38.44; min_weight 0.40 a distancia 37.10) y mlp.down_proj (max_weight 1.20 en la posición 41.34; min_weight 0.19 a distancia 31.95). Esta intervención modifica direcciones internas de activación asociadas a comportamientos de rechazo. El autor reporta una tasa de rechazos de 79/100 frente a 100/100 del original, con una divergencia KL de 0.0638 respecto al modelo base. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Instruct base.
- Razonamiento y matemáticas: el modelo base pertenece a una familia en la que AI2 destaca mejoras en tareas de razonamiento, matemáticas y código mediante cadenas de pensamiento largas (variantes Think); esta variante es Instruct, no Think.
- Generación de código: capacidad esperable por herencia del base, aunque no se aportan métricas específicas en la información disponible.
- Reducción de rechazos: el propósito declarado de la modificación es responder a peticiones que el modelo original rechazaría (79/100 frentes a 100/100 de rechazos en la evaluación del autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita para esta variante.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del modelo.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; esta variante es Instruct y no se declara visión ni audio.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo permite estudiar empíricamente cómo una ablación multi-direccional (SOM) altera la tasa de rechazos y la divergencia KL respecto al original, usando los parámetros publicados para reproducir o variar la intervención.
- Evaluación de robustez de salvaguardas: sirve como contraste para medir hasta qué punto las políticas de rechazo de un modelo Instruct de 32B son frágiles frente a modificaciones de pesos, comparando 79/100 frente a 100/100 rechazos.
- Generación de texto creativo sin filtros excesivos: para prototipos de escritura, guiones o narrativa donde los rechazos del modelo base interrumpen el flujo, aceptando la necesidad de revisión humana posterior.
- Experimentos de destilación y ajuste fino: al ser un modelo de 32B con licencia Apache 2.0 y pesos safetensors, puede usarse como punto de partida para fine-tuning con transformers 4.57.0 o superior, tal como documenta AI2 para el base.
- Benchmarking de degradación por ablación: comparar métricas de calidad (no solo rechazos) entre esta variante y allenai/Olmo-3.1-32B-Instruct para cuantificar el coste de la modificación en tareas estándar.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo funcionan las técnicas de abliteration y qué compromisos introducen, usando un caso real con parámetros y métricas publicadas.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (allenai/Olmo-3.1-32B-Instruct) |
|---|---|---|
| Rechazos | 79/100 | 100/100 |
| Divergencia KL | 0.0638 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en float16/BF16: aproximadamente 64 GB solo para pesos (32,2B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 80 GB para comodidad.
- VRAM estimada en 8 bits: alrededor de 32 GB para pesos, más overhead; encaja en GPUs de 40-48 GB.
- VRAM estimada en 4 bits: alrededor de 16-20 GB para pesos, más overhead; podría caber en GPUs consumer de 24 GB (por ejemplo, RTX 3090 o RTX 4090), aunque la información proporcionada no confirma cuantizaciones GGUF publicadas para esta variante.
- GPUs recomendadas: A100 80 GB, H100 80 GB para precisión completa; A6000 48 GB o L40S para 8 bits.
- Cabe en GPU consumer: solo con cuantización agresiva (4 bits) en GPUs de 24 GB; no cabe en 16 GB sin cuantización extrema.
- Opciones de despliegue: transformers 4.57.0 o superior con bitsandbytes para 8 bits, según la model card del base; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible para esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (segun autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic | 32,2B | no disponible | 79/100 | Apache 2.0 | Hugging Face |
| allenai/Olmo-3.1-32B-Instruct | 32,2B | no disponible | 100/100 | Apache 2.0 | Hugging Face |
| allenai/Olmo-3-32B-Think | 32B (familia) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| allenai/Olmo-3-7B-Instruct | 7B (familia) | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparación directa más relevante es con el modelo base, del que solo se diferencia por la ablación SOM. Frente a otras variantes de la familia Olmo 3, esta ficha no dispone de métricas de rendimiento comparables más allá de la tasa de rechazos y la divergencia KL.

## Limitaciones y advertencias

- La modificación de alineación puede aumentar la probabilidad de generar contenido dañino, inexacto o inapropiado; la tasa de rechazos de 79/100 indica que aún rechaza parte de las peticiones, pero el comportamiento es menos predecible que en el original.
- La divergencia KL de 0.0638 respecto al original implica cambios medibles en la distribución de salida que pueden afectar a la calidad en tareas generales; no se aportan benchmarks estándar que cuantifiquen esa degradación.
- Riesgo de alucinación: inherente a los modelos de 32B; no se documentan evaluaciones específicas de factualidad para esta variante.
- Limitación de idioma: el modelo está etiquetado únicamente para inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no disponible en la información proporcionada; conviene verificarla antes de diseñar aplicaciones que dependan de ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento normativo y de las políticas de contenido aplicables; el prefijo "heretic" y las etiquetas "uncensored" y "abliterated" deben tratarse como señales de riesgo en entornos productivos.
- Procedencia: el modelo lo publica un usuario individual (richardyoung) a partir del base de AI2; no hay garantías de soporte, mantenimiento ni auditoría por parte de AI2.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia comunitaria sobre su comportamiento en uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Checkpoint SFT del base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-SFT
- Checkpoint DPO del base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-DPO
- Modelo base de preentrenamiento: https://huggingface.co/allenai/Olmo-3-1125-32B
- Dataset de postentrenamiento citado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Heretic (herramienta de ablación): https://heretic-project.org
- Paper referenciado en los tags (arxiv:2512.13961): https://arxiv.org/abs/2512.13961
