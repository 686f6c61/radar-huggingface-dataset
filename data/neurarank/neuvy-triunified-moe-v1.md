# neurarank/Neuvy-TriUnified-MoE-v1

## Resumen
Neuvy-TriUnified-MoE-v1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por neurarank dentro del ecosistema CogniOS / Neuvy Operating System, mediante un proceso denominado Neuvy Model Evolution Engine (NMEE). El modelo se presenta como una fusión de arquitecturas de tres familias de modelos abiertos: Llama 3.1 8B (topología de proyecciones GQA y representaciones de razonamiento), Qwen 2.5 7B (geometría de activación SwiGLU y tokens multilingües de alta densidad) y Mixtral 8x7B / DeepSeek-V3 (enrutador MoE disperso por bloques con expertos compartidos).

El resultado es un modelo compacto de 401.535.744 parámetros totales (unos 401,5 millones) con aproximadamente 175 millones de parámetros activos por token, gracias a un esquema de 8 expertos enrutados con Top-2 más 1 experto compartido activo en cada pasada. La arquitectura emplea 8 capas, dimensión oculta de 768, dimensión intermedia de 2.048, atención GQA con 12 cabezas de consulta y 4 de clave-valor, y un vocabulario de 32.000 tokens.

Es relevante ahora porque propone un enfoque de fusión de modelos (model fusion) para construir arquitecturas MoE compactas a partir de paradigmas consolidados, con licencia Apache 2.0 y soporte para tres idiomas (inglés, vietnamita y chino). No obstante, el modelo es de publicación muy reciente y no cuenta con descargas ni validación comunitaria en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (block sparse router, estilo DeepSeek/Mixtral) con GQA y SwiGLU |
| Parametros totales | 401.535.744 (~401,5 M) |
| Parametros activos | ~175 M por token (2 expertos enrutados + 1 compartido) |
| Longitud de contexto | 4.096 tokens (RoPE theta 10.000,0) |
| Tipos de cuantizacion | no disponible (pesos publicados en Float16 / BFloat16) |
| Idiomas soportados | inglés (en), vietnamita (vi), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento
El modelo es un transformer MoE de 8 capas con dimensión oculta de 768 y dimensión intermedia de 2.048. La atención usa Grouped-Query Attention con 12 cabezas de consulta y 4 de clave-valor (ratio 3:1), dimensión de cabeza 64 y RoPE con theta 10.000,0, lo que limita el contexto a 4.096 tokens. La capa MoE incorpora 8 expertos enrutados con enrutamiento Top-2 por token, más 1 experto compartido aislado activo en todas las pasadas (estilo DeepSeek), lo que da lugar a los ~175 M de parámetros activos por token frente a los ~401,5 M totales.

Según la model card, el entrenamiento no se describe como un preentrenamiento convencional, sino como un proceso de fusión (model fusion) ejecutado por el Neuvy Model Evolution Engine. La atención se combina mediante SLERP entre las proyecciones de Llama 3.1 8B y Qwen 2.5 7B, mientras que el pool de expertos se sintetiza a partir de 4 expertos de Mixtral, 2 de Llama y 2 de Qwen, a los que se añade el experto compartido. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades
- Generación de texto autoregresiva con `transformers` y `AutoModelForCausalLM` (requiere `trust_remote_code=True` por código personalizado).
- Razonamiento y representaciones heredadas de Llama 3.1 8B según el linaje declarado por el autor.
- Capacidades matemáticas y multilingües de alta densidad derivadas de Qwen 2.5 7B, según la model card.
- Soporte multilingüe para inglés, vietnamita y chino.
- Enrutamiento MoE con experto compartido, orientado a eficiencia computacional (menos parámetros activos que totales).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso
- Experimentación en investigación sobre fusión de modelos: permite estudiar cómo se comporta una arquitectura MoE compacta construida por SLERP y síntesis de expertos a partir de Llama, Qwen y Mixtral, con un coste de cómputo reducido (~175 M de parámetros activos).
- Prototipado rápido en entornos con recursos limitados: al tratarse de un modelo de ~401,5 M de parámetros en Float16 (repo de 0,8 GB), se puede cargar en GPUs de consumo para pruebas de generación de texto.
- Evaluación de enrutamiento MoE: útil para analizar el comportamiento del router Top-2 con experto compartido en tareas de generación corta dentro de su ventana de 4.096 tokens.
- Generación de texto multilingüe en inglés, vietnamita y chino: adecuado para pruebas de cobertura lingüística en esos tres idiomas, no así para otros.
- Docencia y demostraciones de arquitecturas transformer con GQA y MoE: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en materiales formativos y cuadernos reproducibles.
- Base para fine-tuning ligero: al ser un modelo pequeño con licencia permisiva, puede servir como punto de partida para ajustes supervisados en dominios concretos, siempre que se validen previamente sus capacidades reales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en Float16: en torno a 0,8 GB solo para pesos, más overhead de activaciones y caché KV; con contexto completo de 4.096 tokens el consumo adicional es modesto por el tamaño del modelo.
- VRAM estimada en BFloat16: similar a Float16 (aproximadamente 0,8 GB de pesos).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para pruebas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. Cabe en GPUs de consumo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y la arquitectura personalizada (`neuvy_tri_moe`) puede requerir adaptaciones.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neuvy-TriUnified-MoE-v1 | ~401,5 M | ~175 M | 4.096 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen 2.5 7B | ~7.600 M | no aplica (denso) | 32.768 (según versión) | Apache 2.0 (mayoría de variantes) | Hugging Face, ampliamente adoptado |
| Llama 3.1 8B | ~8.000 M | no aplica (denso) | 131.072 | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |
| Mixtral 8x7B | ~46.700 M | ~12.900 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente adoptado |

La comparación es asimétrica: Neuvy-TriUnified-MoE-v1 es dos órdenes de magnitud menor en parámetros totales que sus modelos de linaje, por lo que no es un sustituto directo de estos en tareas de alta complejidad. Su interés es arquitectónico y experimental, no de rendimiento equiparable.

## Limitaciones y advertencias
- Modelo sin descargas ni validación comunitaria en el momento de la ficha; el rendimiento real no está verificado de forma independiente.
- No se han publicado benchmarks, por lo que las capacidades declaradas (razonamiento, matemáticas, multilingüismo) no están cuantificadas.
- Contexto limitado a 4.096 tokens, muy inferior al de los modelos de su linaje (32.768 o 131.072 tokens).
- Cobertura lingüística restringida a inglés, vietnamita y chino; el castellano no está declarado como idioma soportado.
- Riesgo de alucinación inherente a los modelos generativos pequeños; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Llama, Qwen y Mixtral, puede heredar sesgos de esos corpus, pero no se detalla.
- Requiere `trust_remote_code=True` por arquitectura personalizada (`neuvy_tri_moe`), lo que implica ejecutar código del autor; conviene auditar el código antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia de los pesos fusionados de Llama 3.1 (licencia comunitaria propia) y de los demás modelos de origen debería revisarse antes de un despliegue comercial.
- No hay información sobre cuantizaciones oficiales (GGUF, GPTQ, AWQ) ni sobre soporte en motores de inferencia de alto rendimiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/neurarank/Neuvy-TriUnified-MoE-v1
- Llama 3.1 (modelo de linaje): https://huggingface.co/meta-llama/Llama-3.1-8B
- Qwen 2.5 (modelo de linaje): https://huggingface.co/Qwen/Qwen2.5-7B
- Mixtral 8x7B (modelo de linaje): https://huggingface.co/mistralai/Mixtral-8x7B-v0.1
- DeepSeek-V3 (referencia de experto compartido): https://huggingface.co/deepseek-ai/DeepSeek-V3
- Paper de DeepSeekMoE (experto compartido): https://arxiv.org/abs/2401.06066
- Paper de Mixtral (enrutamiento Top-2): https://arxiv.org/abs/2401.04088
