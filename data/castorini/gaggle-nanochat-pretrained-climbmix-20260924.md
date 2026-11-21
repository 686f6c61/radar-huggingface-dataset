# castorini/gaggle-nanochat-pretrained-climbmix-20260924

## Resumen

gaggle-nanochat-pretrained-climbmix-20260924 es un modelo de lenguaje base de 3.290 millones de parámetros desarrollado por el grupo castorini (asociado a la Universidad de Waterloo y conocido por proyectos de recuperación de información como Anserini y Pyserini). Se trata de un transformer decoder-only entrenado desde cero con el framework nanochat de Andrej Karpathy sobre una pasada completa del dataset ClimbMix (287.000 millones de tokens). Forma parte del trabajo descrito en el paper "Project Greenhouse: Progress Toward Fully Open and Sovereign Agentic Search" (arXiv:2610.11922), orientado a construir infraestructura de búsqueda agéntica completamente abierta.

El modelo emplea la arquitectura nanochat de profundidad 34, con 34 capas, anchura de 2.176, 17 cabezas de atención de dimensión 128 y una ventana de contexto de 2.048 tokens. Incorpora innovaciones como embeddings de valor en capas alternas, normalización QK, RMSNorm sin parámetros, MLP con ReLU al cuadrado y soft-capping de logits. Es un modelo estrictamente base: no ha recibido ajuste por instrucciones ni RLHF, por lo que su función es continuar texto, no seguir órdenes. La versión conversacional derivada se publica por separado como gaggle-nanochat-ift-climbmix-20261031.

Su relevancia actual radica en que ofrece un punto de partida totalmente reproducible y abierto (licencia MIT, código y datos públicos) para investigación en preentrenamiento eficiente y para construir sistemas agénticos soberanos, con pesos cargables en transformers, vLLM, llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat depth-34, transformer decoder-only |
| Parametros totales | 3.286.633.962 (3,29B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | GGUF (disponible en el repo); otras cuantizaciones no especificadas |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |
| Capas | 34 |
| Anchura del modelo | 2.176 |
| Cabezas de atencion | 17 cabezas de dimension 128 |
| Tokenizer | BPE a nivel de byte, 32.768 entradas |
| Ventana deslizante | 512 tokens en 3 de cada 4 capas |
| Desglose de parametros | 1,93B en bloques transformer; 1,21B en tablas de value embeddings; 0,14B en embeddings de entrada y salida |
| Framework de entrenamiento | karpathy/nanochat (commit 92d63d4) |

## Arquitectura y entrenamiento

El modelo sigue sin modificaciones la arquitectura nanochat de profundidad 34: un transformer decoder-only con embeddings posicionales rotatorios (RoPE), normalización QK, RMSNorm sin parámetros, MLP con activación ReLU al cuadrado, embeddings de entrada y salida no compartidos y soft-capping de logits. Una particularidad destacable es la presencia de un value embedding en capas alternas: 1,21B de los 3,29B de parámetros corresponden a tablas de búsqueda, de modo que el cómputo por token equivale al de un modelo denso de unos 2B de parámetros. Además, 3 de cada 4 capas utilizan una ventana deslizante de 512 tokens, lo que reduce el coste de atención sobre el contexto de 2.048 tokens.

El entrenamiento se realizó sobre ClimbMix (karpathy/climbmix-400b-shuffle), con una pasada de 287.000 millones de tokens empaquetados en secuencias de 2.048 tokens mediante el empaquetado best-fit alineado a BOS de nanochat; el último de los 6.543 shards se reservó para validación. Se usó el optimizador Muon para las matrices de peso de los bloques y AdamW para embeddings y parámetros escalares, con un schedule de warmup breve, tasa constante y decaimiento lineal. La única modificación respecto a nanochat fue el tamaño de batch, que crece de 262.144 a 2.097.152 tokens manteniendo las tasas de aprendizaje máximas originales (en lugar de escalarlas con la raíz cuadrada del batch). El cómputo total fue de aproximadamente 1.600 horas de H100 en un nodo de ocho NVIDIA H100 con multiplicaciones en FP8. El checkpoint publicado corresponde al paso 227.158 (283B tokens), el de mayor CORE durante el entrenamiento; el checkpoint final (287B tokens) obtuvo 0,004 menos.

## Capacidades

- Generación de texto autoregresiva y continuación de secuencias en inglés.
- Evaluación de verosimilitud de continuaciones (log-probabilidad de secuencias), útil para scoring y ranking.
- Aprendizaje en contexto (in-context learning) en tareas de formato few-shot, según los 22 benchmarks de CORE.
- Respuesta a preguntas de conocimiento general y académico en formato de opción múltiple (MMLU, MMLU-Pro) mediante scoring por log-verosimilitud.
- Soporte de tool calling / function calling: no disponible (modelo base sin post-entrenamiento).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requiere la versión IFT.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.
- Compatibilidad de despliegue con transformers (trust_remote_code), vLLM (plugin), llama.cpp y Ollama (GGUF, mediante parche de arquitectura).

## Casos de uso

- Investigación en preentrenamiento: reproducir el pipeline completo de nanochat con datos y código abiertos para estudiar el efecto del tamaño de batch, el schedule de learning rate o el empaquetado de secuencias en modelos de escala ~3B.
- Modelo base para ajuste fino supervisado: punto de partida para SFT o DPO en dominios concretos (legal, biomédico, atención al cliente) partiendo de un checkpoint con pérdida de validación de 0,596 bits por byte.
- Scoring y reranking de documentos: calcular la log-verosimilitud de continuaciones permite puntuar candidatos en pipelines de recuperación de información, terreno natural del grupo castorini (Anserini, Pyserini).
- Generación de datos sintéticos: al ser un modelo base, puede emplearse para producir continuaciones de texto a gran escala que sirvan como corpus de entrenamiento o aumentación de datos.
- Búsqueda agéntica soberana: integrado en la pila de Project Greenhouse como componente generativo local, sin dependencia de APIs propietarias, gracias a su licencia MIT y a su despliegue en vLLM u Ollama.
- Experimentos de eficiencia de inferencia: su mezcla de atención con ventana deslizante y value embeddings en capas alternas lo convierte en un banco de pruebas para medir throughput y latencia con kernels de atención distintos (Flash Attention frente a scaled_dot_product_attention).
- Evaluación comparativa de arquitecturas: referencia abierta para contrastar recetas de preentrenamiento frente a nanochat d34 con los mismos benchmarks (CORE, MMLU, MMLU-Pro).

## Benchmarks y rendimiento

| Modelo | Tokens de entrenamiento | CORE | MMLU (5-shot) | MMLU-Pro (5-shot) |
|---|---:|---:|---:|---:|
| gaggle-nanochat-pretrained-climbmix-20260924 | 283B | 0,458 | 0,493 | 0,178 |
| nanochat d34 | 89B | 0,338 | 0,257 | 0,115 |

Pérdida de validación en el shard reservado de ClimbMix: 0,596 bits por byte. CORE es la precisión centrada media sobre 22 tareas de aprendizaje en contexto con 500 ejemplos cada una; MMLU y MMLU-Pro se puntúan por log-verosimilitud de la letra de respuesta con LM Evaluation Harness. Todos los números proceden de la evaluación de los autores, salvo el CORE de nanochat d34, que es el valor publicado.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 6,6 GB solo para pesos (3,29B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 8-10 GB.
- VRAM estimada en cuantización GGUF de 8 bits: en torno a 3,5-4 GB; en 4 bits, aproximadamente 2-2,5 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: el autor cita una H200 para el ejemplo de generación; para entrenamiento se usaron ocho H100 con FP8. Para inferencia, cualquier GPU con al menos 8 GB en bf16 (RTX 3060 de 12 GB, RTX 4070, RTX 4090) es suficiente.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en bf16 y en GPUs de 4-6 GB con cuantización GGUF.
- Opciones de despliegue: transformers (requiere trust_remote_code=True y transformers>=4.57, torch>=2.5), vLLM mediante plugin, llama.cpp y Ollama mediante parche de arquitectura, y el código original de nanochat con los checkpoints sin modificar.
- Latencia y throughput: no disponibles de forma publicada; el autor solo indica que el ejemplo de generación se ejecutó en una H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CORE | MMLU | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| gaggle-nanochat-pretrained-climbmix-20260924 | 3,29B | 2.048 | 0,458 | 0,493 | MIT | Hugging Face (safetensors, GGUF) |
| nanochat d34 (karpathy) | ~3,3B (misma arquitectura) | 2.048 | 0,338 | 0,257 | MIT | Hugging Face |
| gaggle-nanochat-ift-climbmix-20261031 | 3,29B | 2.048 | no disponible | no disponible | MIT | Hugging Face |

La comparación directa con nanochat d34 muestra una mejora sustancial atribuible al mayor volumen de entrenamiento (283B frente a 89B tokens): +0,120 en CORE, +0,236 en MMLU y +0,063 en MMLU-Pro. Frente a modelos base de tamaño similar de otras familias (por ejemplo, Llama 3.2 3B o Qwen2.5 3B), no se han publicado comparaciones en la información disponible, y las diferencias de tokenizer, datos y contexto (2.048 frente a 128K tokens) hacen que la comparación directa requiera evaluación propia.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni RLHF: no sigue órdenes y produce continuaciones de texto; para uso conversacional debe emplearse la variante IFT.
- Contexto muy corto (2.048 tokens), insuficiente para documentos largos, conversaciones multi-turno extensas o tareas de recuperación aumentada con muchos pasajes.
- Solo entrenado en inglés; el rendimiento en castellano u otros idiomas será deficiente.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, agravado por la ausencia de post-entrenamiento y de alineación.
- Sesgos potenciales heredados de ClimbMix (corpus web filtrado), sin mitigación conocida; no se han publicado análisis de sesgo.
- Requiere que las secuencias empiecen con el token BOS `<|bos|>`; su omisión degrada la calidad de la generación.
- Diferencias numéricas en los logits según el kernel de atención empleado (Flash Attention 3 frente a scaled_dot_product_attention); los resultados publicados usan el segundo.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte; conviene validar el comportamiento en el dominio de producción.
- El repo ocupa 33,8 GB, lo que incluye múltiples formatos de pesos; conviene descargar solo los ficheros necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castorini/gaggle-nanochat-pretrained-climbmix-20260924
- Modelo conversacional derivado: https://huggingface.co/castorini/gaggle-nanochat-ift-climbmix-20261031
- Paper Project Greenhouse: https://arxiv.org/abs/2610.11922
- PDF del paper: https://arxiv.org/pdf/2610.11922
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Modelo nanochat d34 de referencia: https://huggingface.co/karpathy/nanochat-d34
