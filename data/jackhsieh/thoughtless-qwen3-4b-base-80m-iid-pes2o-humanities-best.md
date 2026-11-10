# JackHsieh/Thoughtless.Qwen3-4B-Base.80M-iid.peS2o-humanities.best

## Resumen

Thoughtless.Qwen3-4B-Base.80M-iid.peS2o-humanities.best es un punto de control de preentrenamiento continuado (continued pretraining) sobre el modelo base Qwen/Qwen3-4B-Base, desarrollado por el usuario JackHsieh. El modelo se ha entrenado con predicción de siguiente token convencional, sin modo de razonamiento ni tokens de "pensamiento" (de ahí el calificativo "thoughtless"), sobre una ventana de 80 millones de tokens extraída de forma independiente e idéntica (i.i.d.) del corpus JackHsieh/peS2o-humanities-160M-20M-iid, centrado en textos académicos del dominio de humanidades.

Se trata de la mejor celda de un barrido de hiperparámetros sobre tasa de aprendizaje y proporción de replay, seleccionada por la pérdida de validación final sobre el split de test de 20 millones de tokens del propio corpus y reejecutada con un checkpoint final. El resultado es un modelo de 4.022.468.096 parámetros (aproximadamente 4B) con ventana de contexto de 4096 tokens, empaquetado en safetensors en precisión fp32 (16,1 GB de repositorio) y publicado bajo licencia Apache 2.0.

Su relevancia es fundamentalmente experimental: sirve como referencia para estudiar los efectos del preentrenamiento continuado con datos de dominio (humanidades) y de la mezcla de replay con DCLM sobre un modelo Qwen3 base, así como para comparar dinámicas de aprendizaje en regímenes de tasa de aprendizaje muy baja. No es un modelo instructivo ni un asistente conversacional afinado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), preentrenamiento continuado con predicción de siguiente token |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de documento usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 sin casting); al derivar del formato original cabría cuantización posterior, no documentada por el autor |
| Idiomas soportados | no disponible (el corpus peS2o es mayoritariamente inglés; el autor no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (copia maestra fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer decoder-only de aproximadamente 4B parámetros con atención causal estándar (el autor cita flash-attention-2 durante el entrenamiento), y se somete a preentrenamiento continuado sin ningún componente de razonamiento explícito: la pérdida es predicción de siguiente token pura, sin tokens de pensamiento ni etapas de RLHF o DPO documentadas.

Los datos provienen de `JackHsieh/peS2o-humanities-160M-20M-iid`, usando `train[:19456]` con documentos de 4096 tokens, lo que constituye una ventana i.i.d. de 80 millones de tokens. Se aplica un 25 % de replay procedente de `JackHsieh/dclm-replay.seq-4096.tokens-32B`, con reordenación del orden principal en cada época. La optimización usa AdamW con lr 7e-06 (betas 0.9/0.95, eps 1e-08, weight decay 0.01), schedule coseno con 5 % de warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 épocas (1.622 pasos), semilla 0, FSDP2 full-shard con pesos maestros fp32, cómputo bf16 y 4 GPU H100. La pérdida de validación final sobre el split de test de 20M tokens es de 2,38782 nats/token (la celda del barrido marcó 2,38781).

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje: al ser un modelo base, su función principal es completar y continuar texto, no seguir instrucciones.
- Razonamiento y conocimiento del dominio de humanidades: el preentrenamiento continuado sobre peS2o desplaza la distribución hacia texto académico de humanidades (filosofía, historia, literatura, lingüística, etc.).
- Código y matemáticas: capacidades heredadas de Qwen3-4B-Base, no reforzadas ni evaluadas por el autor en este checkpoint.
- Tool calling / function calling: no disponible; no se ha realizado ajuste instructivo ni se documenta soporte de herramientas.
- Agentes y razonamiento multi-paso: no disponible; el modelo es explícitamente "thoughtless" (sin modo de pensamiento).
- Capacidades multilingües: no declaradas; el corpus de entrenamiento es de dominio académico en inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación sobre preentrenamiento continuado: usar el checkpoint como referencia reproducible para estudiar el efecto de la tasa de aprendizaje y del replay DCLM al adaptar Qwen3-4B-Base a un dominio concreto, comparando la pérdida de validación (2,38782 nats/token) con otras celdas del barrido.
- Modelado de lenguaje en dominio académico de humanidades: completar o puntuar texto académico (resúmenes, abstracts, párrafos de ensayo) aprovechando la adaptación al corpus peS2o-humanities.
- Punto de partida para ajuste fino supervisado (SFT): servir como inicialización ya adaptada al dominio antes de un ajuste instructivo posterior con datos de humanidades.
- Evaluación de olvido catastrófico: medir cuánto se degrada el rendimiento general de Qwen3-4B-Base tras 1.622 pasos sobre un corpus de dominio estrecho, útil en estudios de mezcla de datos.
- Generación de datos sintéticos de dominio: producir texto de estilo académico-humanístico para aumentar datasets, con revisión humana posterior.
- Reproducción de experimentos: reejecutar el entrenamiento con los hiperparámetros documentados (lr 7e-06, 2 épocas, 32 documentos por batch, 4×H100) para validar la pérdida reportada.
- Análisis de perplejidad por dominio: usar el modelo como evaluador de perplejidad sobre corpus de humanidades frente a otros dominios, dada su especialización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida de validación final sobre el split de test de 20M tokens del corpus peS2o-humanities:

| Metrica | Valor |
|---|---|
| Val loss final (nats/token, test 20M) | 2,38782 |
| Val loss de la celda del barrido | 2,38781 |
| Pasos de entrenamiento | 1.622 (2 épocas) |
| Tokens de entrenamiento (ventana principal) | 80M i.i.d. + 25 % replay DCLM |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 16 GB solo para pesos, más activaciones y caché KV; requiere GPU de 24 GB o superior en la práctica.
- VRAM estimada en bf16/fp16: aproximadamente 8-9 GB para pesos; cabe en GPUs consumer de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090) con margen para contexto de 4096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB; en 4 bits, alrededor de 2,5-3 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: H100/A100 para entrenamiento o inferencia en fp32; RTX 4090, L40S o A10G para inferencia en bf16.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversión a GGUF (no publicada por el autor); al ser un modelo base sin plantilla instructiva, el pipeline de Hugging Face `text-generation` con transformers es la vía directa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thoughtless.Qwen3-4B-Base.80M-iid.peS2o-humanities.best | 4,02B | 4096 | Base, preentrenamiento continuado en humanidades | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Base | ~4B | 32.768 (según especificación de Qwen3) | Base generalista | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B | ~4B | 32.768 (según especificación de Qwen3) | Instructivo con modo thinking | Apache 2.0 | Hugging Face |

La comparación directa con otros checkpoints de preentrenamiento continuado de dominio no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la especialización en humanidades y la reducción de la ventana efectiva de entrenamiento a 4096 tokens, además de la ausencia de ajuste instructivo.

## Limitaciones y advertencias

- No es un modelo instructivo: no sigue instrucciones, no mantiene formato conversacional y no soporta tool calling; requiere prompting de completado.
- Riesgo de alucinación inherente a un modelo base de 4B sin alineamiento (sin RLHF/DPO documentado).
- Ventana de contexto efectiva de 4096 tokens, inferior a la del Qwen3-4B-Base original, lo que limita tareas de contexto largo.
- El preentrenamiento continuado sobre un corpus estrecho de humanidades puede inducir olvido catastrófico de capacidades generales, código y matemáticas; el autor no reporta evaluaciones que lo cuantifiquen.
- Idiomas soportados no declarados; el corpus peS2o es mayoritariamente inglés, por lo que el rendimiento en castellano no está garantizado.
- Sesgos: no documentados por el autor; el corpus académico puede arrastrar sesgos de selección de la literatura científica incluida.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor ni evaluación de seguridad.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta; es un artefacto experimental, no un modelo validado para producción.
- Pesos en fp32 (16,1 GB), lo que encarece el almacenamiento y el despliegue frente a versiones bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-4B-Base.80M-iid.peS2o-humanities.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset principal: https://huggingface.co/datasets/JackHsieh/peS2o-humanities-160M-20M-iid
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Registro del experimento en Weights & Biases: https://wandb.ai/latent-thoughts/prestar/runs/wnwi22h4
