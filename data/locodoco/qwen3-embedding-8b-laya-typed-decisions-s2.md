# locodoco/qwen3-embedding-8b-laya-typed-decisions-s2

## Resumen

`locodoco/qwen3-embedding-8b-laya-typed-decisions-s2` es un adaptador LoRA junto con una cabeza de decisión de estilo [laya](https://github.com/NandhaKishorM/laya) construido sobre el modelo de embeddings `Qwen/Qwen3-Embedding-8B` de Alibaba. Lo desarrolla el usuario de Hugging Face `locodoco` y resuelve un problema muy concreto: dada una situación descrita en texto o JSON y un conjunto de preguntas tipadas, devolver una distribución de probabilidad sobre las opciones de respuesta. Las preguntas pueden ser de tres tipos: `choice` (elegir entre opciones con nombre), `score` (un nivel de una escala ordenada) y `noul` (sí/no).

El modelo no es un generador de texto: es un clasificador probabilístico de decisiones. Cada opción se evalúa como una rama paralela del prefijo, de modo que el modelo lee el estado completo antes de puntuar cada opción y el resultado es invariante al orden de las opciones por construcción. La cabeza transforma los marcadores ocultos en logits mediante LayerNorm, una proyección lineal a 1024 dimensiones, un embedding de tipo de pregunta, un encoder Transformer bidireccional de 2 capas y un scorer MLP.

Es relevante porque ejemplifica una línea de trabajo distinta a la de los LLM generativos: modelos pequeños (8B) especializados en calibración de decisiones estructuradas, con resultados próximos a Qwen3-32B (0.798 frente a 0.8035 de accuracy) con aproximadamente 3,5 veces menos tiempo de entrenamiento. La licencia Apache 2.0 y el formato PEFT facilitan su reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-Embedding-8B (transformer) + cabeza laya (LayerNorm + Linear a 1024 + embedding de tipo + Transformer bidireccional de 2 capas + MLP scorer) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA y la cabeza son adicionales (tamano del repo: 0.3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de estado + 192 tokens de instrucciones + 48 tokens por opción |
| Tipos de cuantizacion | no disponible (el autor solo documenta bf16 para el modelo base, ~16 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA adapter) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-Embedding-8B`, un transformer causal de 8B parámetros orientado a embeddings, y le añade un adaptador LoRA con r=16, alpha=32 y dropout 0.05 sobre las proyecciones q, k, v, o, gate, up y down. Sobre la salida se monta una cabeza específica: cada opción se procesa como una rama paralela cuyo `position_ids` continúa desde el final del prefijo, de forma que los tokens de una opción ven el prefijo y su propia rama pero no las demás opciones. El hidden state en el `<|endoftext|>` final de cada rama (el token que Qwen3-Embedding usa para pooling) actúa como marcador de esa opción. La cabeza convierte los marcadores en logits mediante LayerNorm, una proyección lineal a 1024, un embedding de tipo de pregunta, un encoder Transformer bidireccional de 2 capas sobre la secuencia y un MLP scorer.

El entrenamiento usa el split de train de `LocalLLaMA/typed-decisions` (6.000 decisiones, de las cuales 5.600 para entrenamiento y 400 para calibración), con la pérdida RLCD de laya contra los targets soft del dataset. Se entrenó 4 épocas con micro-batches de 8 y acumulación de gradiente 8 (2.800 micro-batches, 350 pasos de optimizador), AdamW con learning rate 1e-4, weight decay 0.01, decaimiento coseno y clipping de gradiente 1.0, en bf16 autocast con un máximo de 1.024 tokens de estado, 192 de instrucciones y 48 por opción. El entrenamiento se completó en 32 minutos en una NVIDIA GH200 (96 GB) sin gradient checkpointing, con un pico de memoria de 70,5 GB. Las temperaturas por tipo se ajustaron en el slice de calibración: choice 1.010, score 0.990, noul 1.076.

## Capacidades

- Clasificación de decisiones tipadas: devuelve una probabilidad para cada opción en preguntas de tipo `choice` (opciones con nombre), `score` (escala ordenada) y `noul` (sí/no).
- Procesamiento de estados en texto libre o JSON como entrada.
- Evaluación de múltiples preguntas sobre un mismo estado en una sola pasada por pregunta.
- Invariancia al orden de las opciones por diseño arquitectónico (ramas paralelas independientes).
- Calibración por tipo de pregunta mediante temperaturas ajustadas en un slice de calibración.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador, no un LLM generativo.
- Capacidad multilingüe limitada al inglés (`language: en`).

## Casos de uso

- **Triaje de tickets de soporte**: dado el texto de una reclamación, clasificar el departamento (`choice`), la urgencia (`score`) y el riesgo de churn (`noul`) en una sola llamada. El ejemplo de la model card muestra exactamente este escenario con una factura duplicada.
- **Enrutamiento de correo entrante**: usar preguntas `choice` para asignar cada mensaje a un equipo (facturación, técnico, otros) con una distribución de probabilidad que permite umbrales de confianza y derivación a revisión humana cuando la probabilidad máxima es baja.
- **Scoring de leads o clientes**: preguntas `score` sobre intención de compra, madurez o prioridad, aprovechando la calibración por temperatura para que las probabilidades sean comparables entre casos.
- **Moderación y filtros binarios**: preguntas `noul` para detectar amenazas de cancelación, contenido sensible o condiciones de escalado, con la ventaja de que la salida es una probabilidad calibrada y no un texto que haya que parsear.
- **Anotación asistida de datasets**: generar distribuciones soft sobre etiquetas para pre-anotar grandes volúmenes y priorizar la revisión humana por incertidumbre (ECE de 0.155 en el split de test).
- **Evaluación de políticas y agentes**: dado un estado en JSON (por ejemplo, el estado de un entorno o de una conversación), puntuar decisiones discretas de un agente sin necesidad de un LLM generativo, con latencia de un forward pass por pregunta.

## Benchmarks y rendimiento

Resultados en el split de test de `typed-decisions` (400 casos, 2.000 decisiones) tras calibración de temperatura, calculados con `laya.train.evaluate_records`. Las dos últimas filas son las cifras publicadas en `BENCHMARKS.md` de laya (commit 76c9184).

| Modelo | Accuracy | ECE | Choice acc. | Score acc. | Noul acc. |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B, seed 0 | 0.8005 | 0.159 | 0.767 | 0.784 | 0.857 |
| Qwen3-Embedding-8B, seed 1 | 0.8025 | 0.159 | 0.760 | 0.796 | 0.853 |
| **Qwen3-Embedding-8B, seed 2 (este modelo)** | **0.7980** | **0.155** | **0.763** | **0.779** | **0.858** |
| Qwen3-32B, seed 0 | 0.8035 | 0.163 | 0.767 | 0.784 | 0.867 |
| laya-typed-decisions (publicado) | 0.766 | 0.213 | no disponible | no disponible | no disponible |
| Jev 1.13.0 (publicado) | 0.727 | 0.144 | no disponible | no disponible | no disponible |

Las tres semillas de Qwen3-Embedding-8B promedian 0.800 de accuracy. Qwen3-32B añade unos 0.3 puntos con aproximadamente 3,5 veces más tiempo de entrenamiento. La confianza media de este modelo es 0.64 frente a una accuracy de 0.80, por lo que está infraconfiado; la mayor parte del ECE proviene de esa brecha.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 ocupa unos 16 GB; el adaptador LoRA y la cabeza añaden el contenido del repo (0.3 GB). Con cuantización de 8 bits o 4 bits del modelo base la huella se reduciría, aunque el autor no documenta configuraciones cuantizadas.
- GPU recomendadas: el entrenamiento se hizo en una NVIDIA GH200 (96 GB) con un pico de 70,5 GB. Para inferencia, una GPU con 24 GB o más (RTX 4090, L40S, A10G) debería ser suficiente en bf16; A100 y H100 ofrecen margen adicional para batching.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más en bf16 (por ejemplo RTX 4090); en tarjetas de 16 GB requeriría cuantización del modelo base, no documentada por el autor.
- Opciones de despliegue: el autor documenta uso con `transformers==5.23.0`, `peft==0.22.0`, `laya==0.5.0` y torch 2.11, con un script propio `qwen_laya` incluido en el repo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (32 minutos en GH200) y el tamaño del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (typed-decisions) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Qwen3-Embedding-8B + laya, seed 2) | 8B + LoRA | 1024 + 192 + 48 tokens | 0.7980 | 0.155 | apache-2.0 | Hugging Face (PEFT) |
| Qwen3-Embedding-8B + laya, seed 0 | 8B + LoRA | 1024 + 192 + 48 tokens | 0.8005 | 0.159 | no disponible | Hugging Face |
| Qwen3-32B + laya, seed 0 | 32B | no disponible | 0.8035 | 0.163 | no disponible | Hugging Face |
| laya-typed-decisions (publicado) | no disponible | no disponible | 0.766 | 0.213 | no disponible | Hugging Face |
| Jev 1.13.0 (publicado) | no disponible | no disponible | 0.727 | 0.144 | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de decisiones tipadas; no genera texto ni sirve como LLM de propósito general.
- Solo soporta inglés (`language: en`); no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Infraconfianza documentada: confianza media de 0.64 frente a accuracy de 0.80, lo que afecta a la interpretación de las probabilidades en producción y exige umbrales calibrados por caso de uso.
- La ventana efectiva es limitada: 1024 tokens de estado, 192 de instrucciones y 48 por opción; estados o instrucciones más largos requieren truncado.
- Depende de versiones muy concretas del stack (`transformers==5.23.0`, `peft==0.22.0`, `laya==0.5.0`, torch 2.11); la compatibilidad con otras versiones no está garantizada.
- El autor no documenta sesgos específicos del dataset `LocalLLaMA/typed-decisions`; al ser un dataset de decisiones sintéticas o semi-sintéticas, el rendimiento en dominios reales puede degradarse.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-Embedding-8B tiene su propia licencia que debe verificarse por separado.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados reportados.
- No se han publicado resultados de benchmarks en la informacion disponible más allá de los de la tabla anterior (MMLU, HumanEval, GSM8K no aplican a este tipo de modelo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/locodoco/qwen3-embedding-8b-laya-typed-decisions-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio laya: https://github.com/NandhaKishorM/laya
- Benchmarks de laya (commit 76c9184): referenciado en la model card, sin URL directa disponible
