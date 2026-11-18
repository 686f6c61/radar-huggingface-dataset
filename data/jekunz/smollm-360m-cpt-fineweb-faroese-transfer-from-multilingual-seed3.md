# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed3

## Resumen

SmolLM2-360M-Instruct adaptado al feroés mediante entrenamiento continuado (continued pre-training, CPT) sobre el corpus FineWeb-2. Lo desarrolla el usuario `jekunz` como parte de una investigación personal sobre transferencia lingüística entre lenguas nórdicas, y se publica bajo licencia Apache 2.0. El modelo parte de la base instructiva de HuggingFaceTB (361.821.120 parámetros reales según los pesos en safetensors) y se especializa en generación de texto conversacional en feroés (`fo`).

La estrategia de entrenamiento es un *transfer* en dos fases: primero un ajuste conjunto sobre las porciones danesa, islandesa, noruego bokmål, noruego nynorsk y sueca de FineWeb-2, y después un ajuste específico sobre la porción feroesa. La hipótesis subyacente es que las lenguas nórdicas relacionadas actúan como puente y mejoran la adaptación a una lengua de bajos recursos como el feroés, con apenas 50.000-70.000 hablantes.

El modelo es relevante porque ejemplifica una receta reproducible y barata (una sola A100 de 40 GB) para llevar un modelo pequeño de 360 M de parámetros a un idioma de bajos recursos, algo útil para investigadores que trabajan en lenguas escandinavas minoritarias y para quienes necesitan un modelo ligero desplegable en CPU. No obstante, el autor advierte explícitamente de que no se ha evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de llama.cpp/GGUF, no verificada por el autor) |
| Idiomas soportados | feroés (`fo`); el modelo base soporta además inglés y otros idiomas, pero no se ha validado tras el ajuste |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de la familia Llama, heredada de SmolLM2-360M-Instruct (aproximadamente 360 M de parámetros, con atención multi-cabeza estándar y sin mecanismos MoE ni SSM). El autor no documenta cambios estructurales respecto al modelo base; el trabajo es exclusivamente de adaptación lingüística mediante CPT.

El entrenamiento se realizó en dos fases sobre el dataset HuggingFaceFW/fineweb-2: una época sobre los subconjuntos danés, islandés, noruego bokmål, noruego nynorsk y sueco combinados, seguida de cinco épocas sobre el subconjunto feroés. Hiperparámetros: learning rate 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo 256), longitud máxima de contexto 2048 tokens, una GPU A100 de 40 GB y semilla 3 (una de tres semillas de esta configuración). No se menciona RLHF, DPO ni ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la naturaleza instructiva del modelo base.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 360 M de parámetros.
- Capacidad multilingüe residual del modelo base (inglés y otras lenguas), no validada tras el ajuste.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo *thinking*.
- No se ha evaluado su calidad en tareas de código o matemáticas tras el ajuste.

## Casos de uso

- Investigación en transferencia entre lenguas nórdicas: sirve como punto de comparación reproducible (semilla 3 de 3) para estudiar si el preentrenamiento conjunto en danés, islandés, noruego y sueco mejora la adaptación al feroés frente a un ajuste directo.
- Generación de texto asistida en feroés: borradores, resúmenes o reformulaciones de documentos en esta lengua, con revisión humana obligatoria dado que el modelo no ha sido evaluado.
- Prototipado de asistentes conversacionales para lenguas de bajos recursos: su tamaño de 360 M permite iterar rápidamente en una sola GPU o incluso en CPU.
- Experimentos de *continued pre-training* a bajo coste: la receta completa (una A100 de 40 GB, batch efectivo 256, LR 5e-4) es replicable para otras lenguas minoritarias con corpus FineWeb-2.
- Evaluación de corpus FineWeb-2: permite medir la calidad y cantidad del subconjunto feroés midiendo la perplejidad del modelo resultante.
- Despliegue ligero en entornos con recursos limitados: al caber en memoria de consumer GPU y CPU, puede integrarse en demos o servicios de bajo tráfico mediante transformers o text-generation-inference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo «has not been evaluated more broadly yet».

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,4 GB solo para pesos; en fp16/bf16, unos 0,7 GB; en cuantización de 8 bits, aproximadamente 0,4 GB; en 4 bits, alrededor de 0,2 GB (estimaciones a partir de los 361,8 M de parámetros; el autor no las publica).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; una A100 de 40 GB fue la utilizada para el entrenamiento, pero para inferencia es sobredimensionada.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama tras conversión a GGUF, aunque no se ha publicado una conversión oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed3 | 361,8 M | 2048 | fo | Apache 2.0 | Publicado, sin benchmarks |
| HuggingFaceTB/SmolLM2-360M-Instruct (modelo base) | ~360 M | 2048 (entrenamiento) | multilingüe, inglés principal | Apache 2.0 | Publicado, con benchmarks del autor |
| Otras semillas de la misma configuración (seed 1 y seed 2) | 361,8 M | 2048 | fo | Apache 2.0 | Referenciadas en el nombre del modelo, disponibilidad no verificada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte de que el modelo es para su investigación y no ha sido evaluado ampliamente; no debe usarse en producción sin una evaluación propia.
- Riesgo elevado de alucinación y de respuestas incoherentes por el tamaño reducido (360 M) y por el ajuste intensivo (5 épocas) sobre un corpus potencialmente limitado en feroés.
- Posible olvido catastrófico de las capacidades instructivas y multilingües originales tras el CPT.
- Solo se declara el feroés como idioma soportado; el rendimiento en otras lenguas no está validado.
- Ventana de contexto limitada a 2048 tokens.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable ese uso sin validación previa.
- El modelo se publicó el 18 de noviembre de 2026 con 0 descargas y 0 likes, por lo que no hay retroalimentación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed3
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Paper de SmolLM2: no disponible en la informacion proporcionada
- Repositorio o blog del autor: no disponible en la informacion proporcionada
