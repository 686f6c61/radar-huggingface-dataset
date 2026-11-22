# locodoco/qwen3-embedding-8b-laya-typed-decisions-s0

## Resumen

`locodoco/qwen3-embedding-8b-laya-typed-decisions-s0` es un adaptador LoRA junto con una cabeza de decisión de estilo laya, construido sobre el modelo de embeddings `Qwen/Qwen3-Embedding-8B` de Alibaba Qwen. Lo desarrolla el usuario de Hugging Face `locodoco` y está entrenado sobre el dataset `LocalLLaMA/typed-decisions`. No es un modelo generativo: es un modelo discriminativo que, dado un estado (texto o JSON) y una serie de preguntas tipadas, devuelve una distribución de probabilidad sobre las opciones de cada pregunta.

Resuelve un problema concreto: la toma de decisiones estructurada y calibrada sobre estados no estructurados. Cada pregunta puede ser de tres tipos: `choice` (elegir una entre varias opciones nombradas), `score` (un nivel de una escala ordenada) y `noul` (sí/no). El modelo produce logits por opción que, tras aplicar temperaturas de calibración por tipo, se convierten en probabilidades.

Es relevante por su enfoque técnico: reutiliza un modelo de embeddings de 8B parámetros como codificador de estados y añade una cabeza ligera que procesa las opciones de forma invariante al orden, con un coste de entrenamiento de 32 minutos en una GH200. Con 0,8005 de accuracy en el split de test, iguala prácticamente a Qwen3-32B (0,8035) con una fracción del coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3-Embedding-8B) + cabeza de decisión laya (LayerNorm + Linear + encoder bidireccional de 2 capas + MLP scorer) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; pesos base ~8B en bf16, ~16 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens de estado + 192 de instrucciones + 48 por opción |
| Tipos de cuantizacion | no disponible (pesos en bf16; el adaptador es safetensors PEFT) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA); repo de 0,3 GB |

## Arquitectura y entrenamiento

El modelo combina el codificador `Qwen3-Embedding-8B` (transformer decoder causal) con un adaptador LoRA de rango 16 y alpha 32, dropout 0,05, aplicado a las proyecciones q, k, v, o, gate, up y down. Sobre la salida del modelo base se añade una cabeza laya: LayerNorm seguido de una capa lineal de la dimensión oculta a 1024, un embedding por tipo de pregunta, un encoder Transformer bidireccional de 2 capas sobre la secuencia de opciones y un scorer MLP.

El mecanismo de inferencia es singular: cada opción es una rama paralela cuyo *position id* continúa desde el final del prefijo, de modo que cada opción ve el estado completo y su propia rama pero ninguna otra opción. Así, el modelo lee el estado antes de cada opción y las opciones son invariantes al orden por construcción. El estado oculto en el token final `<|endoftext|>` de cada rama es el marcador de esa opción, que la cabeza convierte en logits.

El entrenamiento usó el split de train de `typed-decisions` (6.000 decisiones, de las que 5.600 para entrenamiento y 400 para calibración), con la pérdida RLCD de laya contra los objetivos soft del dataset. Se hicieron 4 épocas con micro-batches de 8 y acumulación de gradiente 8 (2.800 micro-batches, 350 pasos de optimizador), AdamW con lr 1e-4, weight decay 0,01, decaimiento coseno y clipping 1,0, en bf16 y con un máximo de 1.024 tokens de estado, 192 de instrucciones y 48 por opción. El entrenamiento se completó en 32 minutos en una NVIDIA GH200 (96 GB), con un pico de memoria de 70,4 GB. Las temperaturas de calibración por tipo fueron: choice 1,001, score 1,006, noul 1,106.

## Capacidades

- Clasificación de decisiones tipadas: `choice` (una entre varias opciones), `score` (nivel de una escala ordenada) y `noul` (sí/no).
- Entrada de estado en texto libre o JSON, con hasta 1.024 tokens.
- Múltiples preguntas por estado en una sola pasada de inferencia.
- Salida de probabilidad calibrada por opción, no solo la etiqueta ganadora.
- Invariante al orden de las opciones por construcción arquitectónica.
- Calibración por tipo de pregunta mediante temperaturas ajustadas en un slice de calibración.
- No soporta generación de texto libre, tool calling, agentes, visión ni audio: es un modelo discriminativo, no generativo.
- Capacidad multilingüe limitada al inglés (`en`).

## Casos de uso

- **Triaje de tickets de soporte**: dado el texto de una reclamación, clasificar el departamento (`choice`), la urgencia (`score`) y el riesgo de churn (`noul`) en una sola pasada. El ejemplo de la model card ilustra exactamente este escenario con una factura duplicada.
- **Enrutamiento de decisiones en pipelines de datos**: procesar estados en JSON y devolver decisiones tipadas para enrutar registros a distintos flujos, aprovechando la entrada estructurada.
- **Scoring de riesgo y priorización**: usar preguntas de tipo `score` para asignar niveles ordenados (por ejemplo, "no urgente / pronto / bloqueante") con probabilidades calibradas en lugar de etiquetas duras.
- **Filtros de moderación o elegibilidad**: preguntas `noul` para decidir si un contenido o una solicitud cumple un criterio, con probabilidad asociada para umbralizar.
- **Anotación asistida de datasets**: generar distribuciones de probabilidad sobre opciones para pre-etiquetar grandes volúmenes de estados antes de la revisión humana.
- **Evaluación de decisiones con incertidumbre**: al devolver probabilidades por opción, permite sistemas que actúan solo cuando la confianza supera un umbral y derivan a revisión manual en caso contrario.
- **Investigación en calibración**: servir como baseline reproducible para estudiar ECE y calibración por temperatura en tareas de decisión tipada.

## Benchmarks y rendimiento

Resultados en el split de test de `typed-decisions` (400 casos, 2.000 decisiones) tras calibración por temperatura, según la model card:

| Modelo | Accuracy | ECE | Choice acc. | Score acc. | Noul acc. |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B, seed 0 (este modelo) | 0,8005 | 0,159 | 0,767 | 0,784 | 0,857 |
| Qwen3-Embedding-8B, seed 1 | 0,8025 | 0,159 | 0,760 | 0,796 | 0,853 |
| Qwen3-Embedding-8B, seed 2 | 0,7980 | 0,155 | 0,763 | 0,779 | 0,858 |
| Qwen3-32B, seed 0 | 0,8035 | 0,163 | 0,767 | 0,784 | 0,867 |
| laya-typed-decisions (publicado) | 0,766 | 0,213 | no disponible | no disponible | no disponible |
| Jev 1.13.0 (publicado) | 0,727 | 0,144 | no disponible | no disponible | no disponible |

Las tres semillas de Qwen3-Embedding-8B promedian 0,800 de accuracy; Qwen3-32B añade unos 0,3 puntos con aproximadamente 3,5 veces más tiempo de entrenamiento. La confianza media de este modelo es 0,64 frente a una accuracy de 0,80, por lo que está infraconfiado y la mayor parte del ECE proviene de esa brecha.

## Requisitos de hardware

- **VRAM para inferencia**: los pesos base en bf16 ocupan unos 16 GB; el adaptador LoRA y la cabeza añaden una cantidad pequeña (repo de 0,3 GB). Se necesita margen adicional para activaciones y para las ramas paralelas de opciones.
- **GPU recomendadas**: el entrenamiento se hizo en una NVIDIA GH200 (96 GB) con un pico de 70,4 GB. Para inferencia, una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100) es suficiente para el modelo base en bf16 con margen para las ramas.
- **Consumer GPU**: cabe en GPUs de 24 GB (RTX 3090/4090) en bf16, aunque el número de opciones simultáneas y la longitud del estado condicionan el uso de memoria.
- **Despliegue**: la model card usa la librería `laya` (v0.5.0), `transformers` 5.23.0, `peft` 0.22.0 y torch 2.11, con carga mediante `qwen_laya.load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo estándar.
- **Latencia y throughput**: no disponibles en la información proporcionada, más allá del tiempo de entrenamiento (32 minutos en GH200).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Qwen3-Embedding-8B + laya, seed 0) | ~8B + LoRA r16 | 1.024 + 192 + 48/opción | 0,8005 | 0,159 | apache-2.0 | Hugging Face |
| Qwen3-Embedding-8B, seed 1 | ~8B + LoRA r16 | igual | 0,8025 | 0,159 | apache-2.0 | Hugging Face |
| Qwen3-32B, seed 0 | 32B | no disponible | 0,8035 | 0,163 | no disponible | no disponible |
| laya-typed-decisions (publicado) | no disponible | no disponible | 0,766 | 0,213 | no disponible | no disponible |
| Jev 1.13.0 (publicado) | no disponible | no disponible | 0,727 | 0,144 | no disponible | no disponible |

## Limitaciones y advertencias

- **Infraconfianza**: la confianza media (0,64) está por debajo de la accuracy (0,80); el ECE de 0,159 refleja esa brecha, por lo que las probabilidades no deben interpretarse como confianza calibrada sin recalibración adicional.
- **Solo inglés**: el modelo está entrenado y etiquetado para `en`; su rendimiento en otros idiomas no está documentado.
- **Ámbito restringido**: no es un modelo generativo; no sirve para texto libre, código, matemáticas, visión ni tool calling.
- **Longitud limitada**: 1.024 tokens de estado, 192 de instrucciones y 48 por opción; estados más largos deben truncarse.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero el modelo puede asignar alta probabilidad a opciones incorrectas en estados ambiguos o fuera de distribución.
- **Dataset específico**: entrenado exclusivamente sobre `typed-decisions`; el rendimiento en dominios distintos no está validado.
- **Licencia**: apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Embedding-8B y del dataset.
- **Dependencias frágiles**: requiere versiones concretas de `laya`, `transformers`, `peft` y torch; la integración no es estándar y exige cargar código propio (`qwen_laya`).
- **Sin validación externa**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/locodoco/qwen3-embedding-8b-laya-typed-decisions-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Dataset: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio laya: https://github.com/NandhaKishorM/laya
- Benchmarks de laya (`BENCHMARKS.md`, commit 76c9184): https://github.com/NandhaKishorM/laya/blob/76c9184/BENCHMARKS.md
