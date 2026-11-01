# open-sci/open-sci-ref-v0.02-1.7b-dclm-300B-4096-longsft_16k-SFT-Tulu3-decontaminate-ot30k-rope8-32k

## Resumen

El modelo `open-sci-ref-v0.02-1.7b-dclm-300B-4096-longsft_16k-SFT-Tulu3-decontaminate-ot30k-rope8-32k` es un modelo de lenguaje de 1.714.377.728 parámetros (aproximadamente 1,7 mil millones) desarrollado por la organización open-sci dentro de su línea de modelos de referencia "open-sci-ref". Se trata de un ajuste fino supervisado (SFT) realizado con la herramienta Llama-Factory sobre una base derivada de un entrenamiento previo con decodificación DCLM y un contexto de 4096 tokens, según se deduce del propio nombre del repositorio. El modelo se distribuye en formato safetensors y librería transformers, con pipeline declarado de `feature-extraction`.

El nombre del identificador condensa la mayor parte de la información técnica disponible: base de 1.7B, entrenamiento DCLM con 300B tokens, ventana de 4096 tokens, un SFT de contexto largo (16k), ajuste sobre el dataset Tulu3 depurado (decontaminate) y extensión del contexto mediante RoPE hasta 32k. Sin embargo, la model card publicada es la generada automáticamente por el Trainer y no contiene descripción funcional, datos de evaluación ni instrucciones de uso, por lo que buena parte de las especificaciones habituales no están confirmadas por el autor.

La relevancia de este modelo es principalmente como referencia reproducible dentro de la investigación abierta sobre recetas de entrenamiento (datos, contexto y ajuste) más que como modelo de producción: es pequeño, entrenado con receta documentada en el nombre y pensado para comparaciones controladas. No obstante, su licencia "other", la ausencia de benchmarks y la falta de documentación limitan seriamente su uso fuera de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, inferida del uso de Llama-Factory y RoPE; no confirmada explícitamente en la model card) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens en la base; SFT a 16k; extensión RoPE declarada hasta 32k según el identificador |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF/AWQ/GPTQ en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline declarado | feature-extraction |
| Dataset de ajuste | arrow (open-thoughts_open_thoughts3-1.2_m_30000_samples, 30.000 muestras) |
| Framework de entrenamiento | Llama-Factory (full fine-tuning), Transformers 4.57.3, PyTorch 2.10.0+cu128 |
| Tamaño del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de lo que se deduce del identificador y del ecosistema de entrenamiento: se trata de un transformer decoder-only de 1,7B parámetros ajustado con Llama-Factory en modo full fine-tuning (no LoRA), con atención probablemente de tipo Llama y codificación posicional RoPE. El nombre indica una fase previa de preentrenamiento sobre DCLM con 300B tokens y contexto de 4096, seguida de un SFT de contexto largo (16k) y una extensión RoPE hasta 32k.

El ajuste supervisado se realizó sobre un subconjunto de 30.000 muestras del dataset open-thoughts (open_thoughts3-1.2_m), con un total de 5 épocas, learning rate 4e-5, scheduler coseno con warmup del 10%, batch total de 128 (32 GPUs, batch 1, acumulación 4) y optimizador AdamW fused. El identificador menciona además "Tulu3-decontaminate", lo que sugiere que los datos de ajuste se depuraron frente a conjuntos de evaluación tipo Tulu3 para evitar contaminación, aunque el autor no lo documenta en la model card. No se especifica si hubo RLHF, DPO u otras fases de alineamiento posteriores.

## Capacidades

- Generación de texto autoregresiva propia de un modelo decoder-only de 1,7B parámetros (capacidad inferida de la arquitectura; no verificada con evaluaciones publicadas).
- Ajuste supervisado sobre datos de razonamiento y conversación (open-thoughts), orientado a respuestas de tipo instrucción.
- Ventana de contexto extendida: 16k en el SFT y hasta 32k mediante RoPE según el identificador del modelo.
- Pipeline declarado de `feature-extraction`: puede emplearse para obtener representaciones ocultas, aunque el autor no lo documenta.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre recetas de entrenamiento: el modelo sirve como punto de referencia reproducible para estudiar el efecto del preentrenamiento DCLM a 300B tokens, el SFT a 16k y la extensión RoPE a 32k, comparándolo con otras variantes de la familia open-sci-ref.
- Experimentos de ajuste fino académico: al ser un modelo de 1,7B en safetensors, puede ajustarse en un único nodo de GPUs para estudiar técnicas de SFT, LoRA o DPO sobre una base ya instruida.
- Extracción de características y embeddings: dado el pipeline `feature-extraction` declarado, puede usarse para obtener representaciones de texto en tareas de clasificación o clustering, siempre validando la calidad de forma empírica.
- Evaluación de contaminación de datasets: el sufijo "decontaminate" sugiere que el modelo puede emplearse en estudios sobre el impacto de la limpieza de datos de ajuste en el rendimiento final.
- Prototipado de asistentes conversacionales de bajo coste: con 1,7B parámetros y contexto de 16k, es viable desplegarlo en una GPU consumer para demos de diálogo multi-turno, aceptando la calidad limitada de un modelo de este tamaño.
- Pruebas de pipelines de despliegue: sirve para validar integraciones con vLLM, TGI o transformers antes de migrar a modelos mayores, gracias a su reducido tamaño (3,4 GB en fp32/bf16 según repo).

## Benchmarks y rendimiento

El model-index del autor declara una entrada (`sft__f679a5c592c8dffb__open-sci-ref-v0-02-1__sdpa-open-sci-steps__open-sci-ref-v0.02-1`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 3,4 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 1,7-2 GB; en 4 bits, alrededor de 1 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060/4060, RTX 4090, A10, L4); para contexto de 32k la caché KV incrementa los requisitos y conviene disponer de 16-24 GB.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores.
- Opciones de despliegue: transformers (soporte nativo declarado), Llama-Factory para ajuste; vLLM, TGI, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no publicados en el repositorio.
- Latencia y throughput estimados: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este modelo) | 1,7B | 16k SFT / 32k RoPE | other | HuggingFace, safetensors |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k (128k con YaRN) | Apache 2.0 | HuggingFace, GGUF, amplio ecosistema |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 Community License | HuggingFace, GGUF, amplio ecosistema |
| SmolLM2-1.7B-Instruct | 1,7B | 8k | Apache 2.0 | HuggingFace, GGUF |

La comparación se limita a parámetros, contexto y licencia: no hay benchmarks publicados de este modelo que permitan contrastar rendimiento con las alternativas. Frente a Qwen2.5-1.5B, Llama-3.2-1B y SmolLM2-1.7B, este modelo carece de documentación funcional, versiones cuantizadas y licencia clara para uso comercial, lo que reduce su atractivo fuera de la investigación.

## Limitaciones y advertencias

- La model card es la generada automáticamente por el Trainer: no incluye descripción, usos previstos, limitaciones ni evaluación, lo que impide conocer el comportamiento real del modelo.
- No se han publicado benchmarks; no hay evidencia de calidad en tareas de razonamiento, código o matemáticas.
- Licencia "other" sin texto aclaratorio en la información disponible: el uso comercial es incierto y requiere revisar los términos exactos del repositorio.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento aceptable fuera del inglés, idioma probable de los datasets open-thoughts y Tulu3.
- Riesgo de alucinación elevado por el tamaño (1,7B) y por un ajuste SFT sin fases de alineamiento documentadas (RLHF/DPO no mencionados).
- Contexto efectivo limitado: aunque el identificador declara 32k vía RoPE, no hay evaluación de la degradación del modelo más allá de los 16k del SFT.
- Sesgos desconocidos: al no documentarse la composición del dataset de ajuste ni el corpus DCLM utilizado, no es posible evaluar sesgos de género, raza o ideológicos.
- El pipeline declarado (`feature-extraction`) no coincide con el uso esperado de un modelo instruido; conviene verificar la configuración de atención (SDPA) y el chat template antes de usarlo en producción.
- Solo 15 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-dclm-300B-4096-longsft_16k-SFT-Tulu3-decontaminate-ot30k-rope8-32k
- Llama-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset open-thoughts (referencia citada en la model card): https://huggingface.co/datasets/open-thoughts/open_thoughts3-1.2_m
- DCLM (referencia del preentrenamiento según el identificador): https://github.com/mlfoundations/dclm
- Tulu 3 (referencia de depuración de datos según el identificador): https://github.com/allenai/open-instruct
