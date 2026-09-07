# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_200M_s1_2026-09-06_20-42-47_605478-pt

## Resumen

El modelo `kdyck_dose_50Mpt_hfbody_adamwppt_200M_s1_2026-09-06_20-42-47_605478-pt` es un transformer decoder-only experimental desarrollado por `alexkstern` utilizando la librería [nanochat](https://github.com/karpathy/nanochat). Se trata de un checkpoint intermedio, guardado en el paso 762 de un entrenamiento de 1000 iteraciones, diseñado para investigar el efecto de una fase de "post-pretraining" (ppt) sobre un modelo pequeño preentrenado con datos de lenguaje natural.

El entrenamiento se compone de dos etapas: una primera fase con 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`, seguida de una segunda fase con 200 millones de tokens del dataset sintético `dyck-k128-seq_len_2048-1B`, que contiene secuencias de paréntesis anidados. La arquitectura es un transformer de 16 capas, 8 cabezas de atención, 1024 dimensiones de embedding y una ventana de contexto de 2048 tokens. El modelo final tiene aproximadamente 200 millones de parámetros, según la nomenclatura del autor. La licencia es Apache 2.0.

La relevancia de este modelo es principalmente experimental: permite estudiar cómo un transformer pequeño puede aprender estructuras formales (Dyck) cuando se le aplica un ajuste posterior con un vocabulario reducido, así como evaluar estrategias de transferencia entre vocabularios distintos durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | ~200 millones (estimado según nomenclatura del autor; no se especifica cifra exacta en el config) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en formato `.pt`) |
| Idiomas soportados | no disponible (el dataset de preentrenamiento es inglés, pero no se documenta soporte de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only implementado en nanochat, con las siguientes dimensiones: `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024` y `vocab_size=65536` en la fase de preentrenamiento. Durante la transición a la fase de post-pretraining, el vocabulario se reduce a 256 tokens (`ppt_vocab_size=256`), reinicializando los embeddings y el unembedding. El optimizador es AdamW con learning rates diferenciados por componente: `matrix_lr=0.02`, `embedding_lr=0.3` y `unembedding_lr=0.004`. No se aplica weight decay.

El proceso de entrenamiento consta de dos fases claramente diferenciadas:

- **Preentrenamiento (pt):** 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`, con un vocabulario de 65536 tokens.
- **Post-pretraining (ppt):** 200 millones de tokens del dataset `dyck-k128-seq_len_2048-1B`, un dataset sintético de secuencias de paréntesis (lenguaje Dyck) con un vocabulario de 256 tokens.

La transición entre fases incluye `reinit_embed_at_transition=true` y `reset_optimizer_at_transition=true`. El learning rate sigue una curva trapezoidal (`lr_kind=trapezoid`), con un warmdown del 40% en la fase de preentrenamiento y sin warmup. No se utilizaron técnicas de RLHF ni DPO. El entrenamiento se registró en Weights & Biases bajo el proyecto `token_dose_50Mpt_adamw_seed_replicas_v1`.

## Capacidades

- Generación de texto básico en inglés, como resultado del preentrenamiento con 50M tokens de FineWeb.
- Procesamiento de secuencias del lenguaje Dyck-k128 (paréntesis anidados) tras el post-pretraining con 200M tokens del dataset sintético.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni multimodalidad.
- No se documenta soporte multilingüe más allá del dataset de preentrenamiento.
- No dispone de un modo de "thinking" especial.

## Casos de uso

- Investigación en razonamiento formal: el modelo puede utilizarse para estudiar la capacidad de un transformer pequeño de aprender el lenguaje Dyck-k128, comparando la exactitud estructural de secuencias generadas frente a un ground truth sintético.
- Evaluación de currículos de entrenamiento: sirve como herramienta para medir el impacto del preentrenamiento en lenguaje natural antes de un ajuste con datos sintéticos, observando la pérdida o la exactitud en tareas de validación.
- Pruebas de transferencia de vocabulario: permite analizar cómo afecta al rendimiento la sustitución del embedding original de 65536 tokens por uno de 256 durante el entrenamiento, útil para investigar técnicas de adaptación de vocabulario.
- Análisis de la "dosis de tokens": el checkpoint puede usarse para replicar experimentos de escalado con modelos pequeños, estudiando la relación entre el número de tokens consumidos en cada fase y la calidad final del modelo.
- Docencia y demostración: al ser un modelo pequeño (200M) y entrenado con una librería sencilla como nanochat, es adecuado para ilustrar pipelines de entrenamiento completos en cursos o tutoriales, ejecutables en GPUs de consumo.
- Generación de secuencias controladas en dominios sintéticos: el modelo puede generar cadenas de paréntesis con una estructura determinada, lo que resulta útil para probar algoritmos de validación de equilibrio de paréntesis o como entrada en tests de razonamiento simbólico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada en la model card es la pérdida de entrenamiento suavizada (`smooth_train_loss = 4.2166619300842285`) en el paso 762, junto con el objetivo mínimo (`min_objective = 1.2332531243603875`). No hay comparaciones con otros modelos ni resultados en conjuntos de evaluación estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 800 MB en FP32 y 400 MB en FP16, asumiendo ~200M parámetros.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM, por ejemplo una NVIDIA RTX 3060 o superior. El entrenamiento original se realizó en un hardware con un pico de 2250 TFLOPS, probablemente una H100.
- Cabe en GPUs de consumo: sí, con espacio suficiente para la inferencia en FP16 o FP32.
- Opciones de despliegue: carga directa con PyTorch desde el checkpoint `.pt`. No se incluyen archivos GGUF ni integraciones con vLLM, TGI u Ollama, aunque el modelo podría convertirse a GGUF con herramientas de llama.cpp si se desea ejecutar en CPU o en GPU con soporte de cuantización.
- Latencia y throughput estimados: no disponibles; no se proporcionan mediciones en la información del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Observaciones |
|---|---|---|---|---|---|
| `kdyck_dose_50Mpt_hfbody_adamwppt_200M_s1` | ~200M | 2048 | Transformer decoder-only | Apache 2.0 | Checkpoint experimental con post-pretraining en Dyck-k128. |
| `kdyck_dose_50Mpt_hfinit_200M_s1_2026-08-14_15-51-45_952939-pt` | ~200M | 2048 | Transformer decoder-only | Apache 2.0 | Modelo hermano con inicialización diferente (`hfinit` en lugar de `hfbody`); mismo experimento y dataset. |
| GPT-2 small | 124M | 1024 | Transformer decoder-only | MIT | Modelo de referencia de tamaño similar, pero con contexto menor y sin entrenamiento en Dyck. |

La comparación se basa en parámetros y configuración. No hay datos de benchmarks que permitan una comparación de rendimiento.

## Limitaciones y advertencias

- Modelo puramente experimental: se trata de un checkpoint intermedio de un experimento de investigación, no de un modelo destinado a producción.
- Capacidad de lenguaje natural limitada: solo se utilizaron 50 millones de tokens de preentrenamiento en FineWeb, lo que da lugar a un modelo con un vocabulario y una fluidez muy reducidos.
- Ventana de contexto corta: 2048 tokens, lo que limita el procesamiento de documentos largos o conversaciones extensas.
- Riesgo de alucinación alto en generación de texto libre, dado el pequeño tamaño del modelo y la escasez de datos de preentrenamiento.
- No se documentan sesgos específicos, pero al estar entrenado con FineWeb es probable que herede sesgos presentes en ese dataset.
- El repositorio solo contiene pesos en formato `.pt`, sin cuantizaciones ni adaptaciones para frameworks de inferencia eficiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para aplicaciones reales sin una evaluación previa exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_200M_s1_2026-09-06_20-42-47_605478-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro de Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/7g3olvqb
