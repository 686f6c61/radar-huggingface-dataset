# JackHsieh/Thoughtless.Qwen3-8B-Base.80M-iid.statML-arxiv.best

## Resumen

Thoughtless.Qwen3-8B-Base.80M-iid.statML-arxiv.best es un checkpoint de preentrenamiento continuado (continued pretraining) sobre Qwen/Qwen3-8B-Base, desarrollado por el usuario JackHsieh bajo el marco de trabajo que denomina "prestar" y la variante "thoughtless". El modelo parte de los pesos base de Qwen3-8B-Base y se somete a un entrenamiento adicional de next-token prediction puro, sin fases de razonamiento explícito ni datos de "pensamiento", sobre una ventana i.i.d. de 80 millones de tokens del corpus JackHsieh/statML-arxiv-iid-160M-20M, complementada con un 10 % de replay del dataset JackHsieh/dclm-replay.seq-4096.tokens-32B.

El interés del checkpoint es fundamentalmente experimental: se trata de la mejor celda de un barrido de hiperparámetros de learning rate y proporción de replay, seleccionada por la pérdida de validación final sobre el split de test de 20 millones de tokens del corpus. El resultado reportado es de 1,19692 nats/token en el último paso, prácticamente idéntico al de la celda del barrido (1,19690). No es un modelo orientado a producción ni a tareas de instrucción, sino una pieza de investigación sobre dinámica de preentrenamiento y olvido catastrófico en modelos de 8B.

Arquitectónicamente hereda la estructura transformer de Qwen3-8B-Base, con 8.190.735.360 parámetros totales y pesos exportados en fp32 sin casting, en formato safetensors. La licencia es Apache 2.0, lo que permite uso comercial, aunque el modelo no incorpora alineación ni formato de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (documentos de entrenamiento de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, sin casting) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer decoder-only de Qwen3-8B-Base, sin modificaciones estructurales indicadas en la model card. El entrenamiento adicional consiste en next-token prediction plano sobre 80 millones de tokens i.i.d. del corpus statML-arxiv-iid-160M-20M (concretamente `train[:19456]`, con documentos de 4096 tokens), mezclados con un 10 % de replay procedente de dclm-replay.seq-4096.tokens-32B para mitigar el olvido catastrófico. El orden principal de los datos se rebaraja en cada época.

La optimización emplea AdamW con learning rate 3e-06, betas 0.9/0.95, epsilon 1e-08, weight decay 0.01, schedule coseno con 5 % de warmup hasta 0, gradient clipping de 1.0, batch de 32 documentos y 2 épocas (1.352 pasos) con semilla 0. El sistema de entrenamiento es FSDP2 con full-shard, pesos maestros en fp32, cómputo en bf16, flash-attention-2 y 8 GPU H100. Los pesos publicados son la copia maestra en fp32 exportada sin conversión, lo que explica el tamaño del repositorio (32,8 GB) muy superior al de una publicación en bf16.

La innovación declarada no está en la arquitectura sino en la metodología: el checkpoint es la mejor celda de un barrido de learning rate y proporción de replay, elegida por la pérdida de validación final y reejecutada con checkpoint final. El resultado de validación es 1,19692 nats/token sobre el split de test de 20 millones de tokens.

## Capacidades

- Generación de texto autoregresiva mediante next-token prediction, sin modo de razonamiento ni "thinking mode" (de ahí la etiqueta "thoughtless").
- Modelo base sin alineación: no está ajustado para seguir instrucciones, mantener formato de chat ni responder a prompts conversacionales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Especialización parcial hacia texto científico-técnico de estadística y machine learning (arXiv), derivada del corpus de preentrenamiento continuado.

## Casos de uso

- Investigación sobre olvido catastrófico: el checkpoint sirve como punto de comparación para medir cuánto conocimiento general de Qwen3-8B-Base se degrada tras 80 millones de tokens de preentrenamiento continuado sobre un dominio estrecho, usando la pérdida de validación como métrica.
- Reproducción de barridos de hiperparámetros: al ser la mejor celda de un sweep de learning rate y replay, permite replicar el protocolo (AdamW, schedule coseno, 2 épocas, 8x H100) y contrastar resultados con la celda reportada (1,19690 frente a 1,19692 nats/token).
- Estudio de mezclas de datos con replay: el 10 % de replay de dclm-replay.seq-4096.tokens-32B es un punto de partida concreto para experimentar con proporciones alternativas y evaluar su efecto en la retención de capacidades del modelo base.
- Base para ajuste fino supervisado posterior: al conservar la arquitectura y el tokenizador de Qwen3-8B-Base, puede utilizarse como inicialización en pipelines de SFT o DPO, aunque sin garantías de que el preentrenamiento continuado haya preservado el rendimiento original.
- Análisis de dominancia de dominio en modelos de 8B: útil para estudiar cómo un corpus de 80 millones de tokens de estadística y ML arXiv desplaza la distribución de salida del modelo, midiendo perplejidad en dominios fuera de distribución.
- Evaluación de precisión fp32 en publicación de pesos: el checkpoint permite analizar el impacto de publicar pesos maestros en fp32 (32,8 GB) frente a exportaciones en bf16 en términos de fidelidad numérica y coste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de validación final sobre el split de test de 20 millones de tokens:

| Metrica | Valor |
|---|---|
| Val loss final (nats/token, split test 20M) | 1,19692 |
| Val loss de la celda del sweep | 1,19690 |
| Pasos de entrenamiento | 1.352 (2 epocas) |
| Documentos de entrenamiento | 19.456 (4096 tokens cada uno) |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 32,8 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU de 40 GB o superior (A100 40GB, A100 80GB, H100).
- VRAM estimada en bf16 (si se convierte manualmente): alrededor de 16,4 GB para pesos, viable en RTX 4090 (24 GB) con contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8,2 GB para pesos; en 4 bits, alrededor de 4,1 GB, aunque estas cuantizaciones no están publicadas y requerirían conversión por parte del usuario.
- GPU recomendadas: H100 80GB o A100 80GB para fp32 sin conversión; A100 40GB con margen ajustado; RTX 4090 viable solo tras convertir a bf16 o cuantizar.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversión a los formatos correspondientes; el repositorio solo contiene safetensors en fp32.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thoughtless.Qwen3-8B-Base.80M-iid.statML-arxiv.best | 8,19B | no disponible | Apache 2.0 | safetensors fp32 | Checkpoint experimental de continued pretraining |
| Qwen/Qwen3-8B-Base | 8,19B | no disponible en la informacion | Apache 2.0 | safetensors | Modelo base original; referencia directa del checkpoint |
| Alternativas de 8B de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparación cuantitativa con otras alternativas de 8B no está disponible, ya que no se han publicado benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones, no mantiene formato de chat y puede generar continuaciones incoherentes ante prompts conversacionales.
- Riesgo elevado de alucinación en uso generativo directo, al no haber pasado por RLHF ni DPO.
- Sesgos conocidos: no documentados; el corpus de preentrenamiento continuado (arXiv de estadística y ML) puede introducir sesgos de dominio y de estilo académico.
- Limitaciones de idioma: no se especifican idiomas soportados; el corpus de ajuste es predominantemente técnico en inglés.
- El preentrenamiento continuado sobre un dominio estrecho puede degradar capacidades generales del modelo base (olvido catastrófico), aunque se aplicó un 10 % de replay para mitigarlo.
- Pesos en fp32 sin casting: el repositorio ocupa 32,8 GB, lo que encarece el almacenamiento y la descarga, y requiere conversión para despliegues eficientes.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y carece de garantías de calidad en tareas downstream.
- Sin datos de benchmarks ni de evaluación de seguridad; no debe desplegarse en aplicaciones de cara al usuario sin una evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-8B-Base.80M-iid.statML-arxiv.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de preentrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/7gxjfttm
