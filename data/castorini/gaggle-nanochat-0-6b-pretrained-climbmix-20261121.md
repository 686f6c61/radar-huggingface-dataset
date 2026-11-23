# castorini/gaggle-nanochat-0.6b-pretrained-climbmix-20261121

## Resumen

`gaggle-nanochat-0.6b-pretrained-climbmix-20261121` es un modelo de lenguaje base (no instruido) de 0,55 mil millones de parametros, desarrollado por el grupo castorini y entrenado desde cero con el framework [nanochat](https://github.com/karpathy/nanochat) de Andrej Karpathy. Forma parte de la familia Gaggle, una serie de tres modelos (0,6B, 0,9B y 3,3B) entrenados con el mismo dataset y receta, y constituye el escalon mas pequeno de la familia. Su proposito es servir como base para tareas de continuacion de texto y para fine-tuning posterior, como demuestra el reranker derivado de estos mismos pesos.

Arquitectonicamente es un transformer decoder-only de 28 capas, anchura 1.024, 8 cabezas de atencion de dimension 128 y una ventana de contexto de 2.048 tokens. Incorpora innovaciones propias de nanochat: embeddings de valor en capas alternas, normalizacion QK, RMSNorm sin parametros, MLP con ReLU al cuadrado, soft-capping de logits y atencion con ventana deslizante de 512 tokens en tres de cada cuatro capas. El tokenizador es un BPE a nivel de byte con 32.768 entradas, identico al del modelo de 3,3B.

Su relevancia radica en que es un modelo completamente abierto (licencia MIT, pesos safetensors, codigo reproducible) entrenado sobre ClimbMix con 287B tokens en una unica pasada, lo que lo convierte en un banco de pruebas accesible para investigacion en preentrenamiento a pequena escala y para el desarrollo de componentes de recuperacion de informacion (reranking) en sistemas de busqueda agentica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat): 28 capas, anchura 1.024, 8 cabezas de atencion de dim. 128, contexto de 2.048 tokens |
| Parametros totales | 553.648.594 (0,55B): 0,35B en bloques transformer, 0,13B en tablas de value embeddings, 0,07B en embeddings de entrada/salida |
| Parametros activos | No aplica (modelo denso; computo por token equivalente a ~0,42B por los value embeddings tipo lookup) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (no se documentan en la model card; pesos en safetensors bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers, vLLM via plugin, y codigo nativo de nanochat) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura nanochat: un transformer decoder-only con rotary position embeddings (RoPE), normalizacion QK, RMSNorm sin parametros, MLP con activacion ReLU al cuadrado, embeddings de entrada y salida no atados (untied) y soft-capping de logits. Una innovacion destacable es la incorporacion de una tabla de value embeddings en cada septima capa (contando desde el final: capas 6, 13, 20 y 27), que actua como lookup y no anade coste de computo denso significativo. Ademas, tres de cada cuatro capas emplean una ventana de atencion deslizante de 512 tokens, lo que reduce el coste de atencion en secuencias largas. La forma del modelo se selecciono mediante un barrido de cuatro configuraciones de ~0,55-0,6B con un presupuesto fijo de 7B tokens, resultando esta variante (28 capas, anchura 1.024, cuatro tablas de value embeddings) la de menor perdida de validacion y mayor CORE.

El entrenamiento se realizo sobre ClimbMix (`karpathy/climbmix-400b-shuffle`) en una unica pasada de 287B tokens, con el ultimo de los 6.543 shards reservado para validacion. Los documentos se empaquetaron en secuencias de 2.048 tokens con el empaquetado best-fit alineado a BOS de nanochat. Se uso el optimizador Muon para las matrices de pesos de los bloques transformer y AdamW para embeddings y parametros escalares, con un schedule de warmup breve, tasa constante y decaimiento lineal. El batch crece de 262.144 a 2.097.152 tokens durante el entrenamiento. El computo total fue de aproximadamente 460 horas de H100 en un nodo de ocho NVIDIA H100 SXM (cluster Nibi de la Digital Research Alliance of Canada) con multiplicaciones matriciales en FP8. El checkpoint publicado es el final (paso 229.067), que ademas resulto ser el de mayor CORE y menor perdida de validacion.

## Capacidades

- Generacion de texto y continuacion de secuencias en ingles: el modelo es un base model sin post-entrenamiento, por lo que completa texto en lugar de seguir instrucciones.
- Razonamiento y conocimiento factico de nivel basico, medido mediante MMLU y MMLU-Pro en modo few-shot con puntuacion por verosimilitud.
- Aprendizaje en contexto (in-context learning): evaluado con las 22 tareas del benchmark CORE de nanochat.
- No soporta tool calling ni function calling (no ha recibido instruction tuning ni RLHF).
- No soporta agentes ni razonamiento multi-paso de forma nativa; requeriria fine-tuning especifico.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No dispone de modo thinking, vision ni audio.
- Sirve como base para fine-tuning: el reranker `castorini/gaggle-reranker-0.6b-20261122` se deriva de estos pesos.

## Casos de uso

- Investigacion en preentrenamiento a pequena escala: el modelo permite reproducir y estudiar el efecto de decisiones arquitectonicas (value embeddings, ventanas deslizantes, profundidad) con un coste de computo de ~460 H100-horas, accesible para laboratorios academicos.
- Fine-tuning como reranker en sistemas de busqueda: el modelo derivado `gaggle-reranker-0.6b-20261122` demuestra que estos pesos son una base adecuada para tareas de recuperacion de informacion y ranking de pasajes, utiles en pipelines RAG.
- Generacion de texto controlada en dominios especificos: tras un fine-tuning supervisado sobre un corpus concreto, puede emplearse para completar documentos, resumenes o respuestas en ingles dentro de ese dominio.
- Experimentacion con decodificacion y evaluacion: su tamano reducido (3,8 GB en safetensors) permite ejecutar barridos de hiperparametros de generacion, temperaturas y estrategias de muestreo en una sola GPU consumer.
- Base para destilacion: puede actuar como modelo estudiante en experimentos de destilacion de conocimiento desde modelos mayores de la misma familia (0,9B o 3,3B), comparando curvas de perdida y CORE.
- Docencia y formacion: su licencia MIT y su codigo reproducible (nanochat en el commit `92d63d4`) lo hacen idoneo para cursos sobre entrenamiento de LLM, desde la tokenizacion hasta el schedule de optimizacion.
- Prototipado de pipelines de inferencia: al cargarse con transformers, vLLM (via plugin) y el codigo nativo de nanochat, sirve para validar integraciones de despliegue antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Modelo | Parametros | Tokens | CORE | MMLU | MMLU-Pro |
|---|---:|---:|---:|---:|---:|
| **Este modelo** | 0,55B | 287B | **0,342** | **0,353** | **0,124** |
| Gaggle 0.9B | 0,89B | 287B | 0,370 | 0,357 | 0,118 |
| Gaggle 3.3B | 3,29B | 283B | 0,458 | 0,493 | 0,178 |
| nanochat d34 | 2,2B | 89B | 0,338 | 0,257 | 0,115 |

La perdida de validacion en el shard reservado de ClimbMix es de 0,678 bits por byte (0,9B: 0,658; 3,3B: 0,596). El CORE evaluado sobre todos los ejemplos (no solo 500 por tarea) es de 0,333 (0,9B: 0,355). En MMLU-Pro, con diez opciones, el azar es 0,10, por lo que a este tamano el benchmark apenas discrimina entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,1 GB para los pesos, mas overhead de activaciones y cache KV (contexto de 2.048 tokens); en la practica cabe en cualquier GPU con 4 GB o mas.
- En cuantizacion de 8 bits: ~0,6 GB; en 4 bits: ~0,3 GB (aunque no se documentan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es sobrada; para produccion de baja latencia, una A100 o H100 no aporta ventaja significativa por el tamano del modelo.
- Cabe holgadamente en GPU consumer, incluidas las de gama baja con 6-8 GB.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), vLLM mediante un plugin especifico y el codigo nativo de nanochat desde los checkpoints originales.
- Latencia y throughput: no se publican cifras concretas en la informacion disponible; el modelo se evaluo en una NVIDIA RTX (modelo no especificado en el fragmento disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CORE | MMLU | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| **Gaggle nanochat 0.6B** | 0,55B | 2.048 | 0,342 | 0,353 | MIT | Hugging Face |
| Gaggle nanochat 0.9B | 0,89B | No disponible en la info | 0,370 | 0,357 | MIT (presumible, misma familia) | Hugging Face |
| Gaggle nanochat 3.3B | 3,29B | No disponible en la info | 0,458 | 0,493 | MIT (presumible, misma familia) | Hugging Face |
| nanochat d34 | 2,2B | No disponible en la info | 0,338 | 0,257 | No disponible | Hugging Face |

Frente al modelo de 0,9B, este modelo pierde 0,028 puntos de CORE y 0,004 de MMLU, pero gana 0,006 en MMLU-Pro, lo que sugiere que a este tamano las diferencias estan cerca del ruido de medida. Frente al modelo de 3,3B, la brecha es sustancial (0,116 en CORE, 0,140 en MMLU), coherente con la diferencia de parametros y de computo. El modelo supera al nanochat d34 de 2,2B en CORE (0,342 frente a 0,338) y MMLU (0,353 frente a 0,257), pese a tener menos de la mitad de parametros, lo que refleja el mayor volumen de tokens de entrenamiento (287B frente a 89B).

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning ni RLHF: no sigue instrucciones, no responde a preguntas de forma directa y no debe usarse como asistente conversacional sin fine-tuning previo.
- Riesgo elevado de alucinacion en generacion abierta, especialmente en tareas facticas, dado su tamano y la ausencia de alineamiento.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo (documentos extensos, conversaciones multi-turno prolongadas).
- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Sesgos potenciales heredados de ClimbMix (corpus web) no documentados ni mitigados; no se han publicado analisis de sesgo.
- Requiere que las secuencias comiencen con el token BOS `<|bos|>`; el tokenizador de transformers y vLLM lo anaden automaticamente, pero otras integraciones deben hacerlo de forma explicita.
- La licencia MIT permite uso comercial, pero al ser un modelo base sin garantias, el usuario asume la responsabilidad de cualquier fine-tuning y despliegue.
- El rendimiento en MMLU-Pro (0,124) esta muy proximo al azar (0,10), por lo que no debe usarse como indicador de calidad en tareas de razonamiento complejo.
- El modelo usa `trust_remote_code=True` en transformers, lo que implica ejecutar codigo remoto del repositorio; conviene auditar el codigo antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castorini/gaggle-nanochat-0.6b-pretrained-climbmix-20261121
- Modelo de 0,9B de la misma familia: https://huggingface.co/castorini/gaggle-nanochat-0.9b-pretrained-climbmix-20261105
- Modelo de 3,3B de la misma familia: https://huggingface.co/castorini/gaggle-nanochat-pretrained-climbmix-20260924
- Reranker derivado: https://huggingface.co/castorini/gaggle-reranker-0.6b-20261122
- Modelo nanochat d34: https://huggingface.co/karpathy/nanochat-d34
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Paper Project Greenhouse: https://arxiv.org/abs/2610.11922
