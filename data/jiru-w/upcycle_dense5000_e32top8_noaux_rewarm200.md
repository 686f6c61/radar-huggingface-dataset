# JIRU-W/upcycle_dense5000_e32top8_noaux_rewarm200

## Resumen

`upcycle_dense5000_e32top8_noaux_rewarm200` es un checkpoint de investigación publicado por el usuario JIRU-W en Hugging Face. Se trata de un modelo de mezcla de expertos (MoE) obtenido mediante *upcycling* ingenuo de un modelo denso previo: en el paso 5000 del entrenamiento del modelo denso `JIRU-W/dense_e1_seq2048_gbs128_10b`, cada MLP SwiGLU denso se copió 32 veces para formar 32 expertos con enrutamiento top-8, y el entrenamiento continuó sin ninguna pérdida de balanceo de carga (`router_aux_loss_coef=0`). El objetivo declarado es estudiar si expertos inicialmente idénticos llegan a diferenciarse por sí solos.

El modelo tiene 3.696.887.808 parámetros totales y una arquitectura transformer con capas MoE de 32 expertos y activación top-8. El contexto de entrenamiento es de 2048 tokens por secuencia (batch de 128 secuencias, 262.144 tokens por paso). Es un modelo pequeño de investigación, no ajustado por instrucciones, entrenado con bf16 y DeepSpeed ZeRO-2 en una única GPU.

Es relevante ahora porque documenta de forma transparente un experimento controlado de upcycling con checkpoints intermedios accesibles (revisiones `step<N>`, `init`, `ds_step15500`) y métricas de entropía cruzada de evaluación, lo que permite reproducir y analizar la dinámica de especialización de expertos en MoE. No obstante, no es un modelo destinado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas MoE (SwiGLU), 32 expertos, top-8, `norm_topk_prob=True` |
| Parametros totales | 3.696.887.808 |
| Parametros activos | No disponible (top-8 de 32 expertos; el número exacto de parámetros activos no se especifica) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos en safetensors bf16; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de un transformer denso (`dense_e1_seq2048_gbs128_10b`) en el paso 5000. En el *upcycling* (`upcycle_dense.py`, `upcycle_meta.json`), cada experto de cada capa es una copia exacta del MLP SwiGLU denso de esa capa (tamaño intermedio 1024); el router se inicializa de nuevo con normal(0, 0.02) y semilla 1234. Embeddings, atención, normas y `lm_head` se copian sin cambios, sin ruido ni reinicialización parcial. Con `norm_topk_prob=True`, en el paso 5000 el MoE reproduce exactamente la función densa.

El entrenamiento posterior usa el dataset `JIRU-W/olmoe-mix-0924-10b`, continuando el orden de datos del run denso desde el paso 5000 (`np.random.default_rng(1234).permutation(4881809)`, 128 muestras por paso). Batch de 128 × 2048 = 262.144 tokens por paso. Optimizador AdamW con estado nuevo, weight decay 0.1, LR que continúa el schedule coseno del run denso (pico 8e-4, 200 pasos de warmup, decaimiento a 8e-5 en el paso 38.139) y re-warmup lineal desde 0 durante los primeros 200 pasos tras el paso 5000. Sin pérdida de balanceo de carga. Precisión bf16 con acumulación de gradiente en fp32, DeepSpeed ZeRO-2, una GPU, semilla 1234. El run se detuvo en el paso 15821 de los 38.139 planificados, por lo que no está entrenado hasta completarse.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Exposición de logits de router por capa mediante `output_router_logits=True`, útil para analizar el enrutamiento de expertos.
- Modelo base sin ajuste por instrucciones: no soporta de forma fiable diálogo, instrucciones ni formato conversacional.
- No hay evidencia documentada de soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre especialización de expertos en MoE: comparar el enrutamiento entre las revisiones `init` y `step<N>` para medir si expertos idénticos divergen sin pérdida auxiliar.
- Estudio de upcycling sin balanceo de carga: analizar el colapso o la distribución de carga del router a lo largo de los pasos con los checkpoints intermedios.
- Reproducción de experimentos: reanudar desde `ds_step15500` (DeepSpeed >= 0.19.6) con el estado del optimizador incluido.
- Análisis de dinámica de entrenamiento: usar las curvas de entropía cruzada de evaluación (de 3.3556 en `step5500` a 3.0437 en `step15000`) como referencia.
- Docencia y divulgación: ilustrar el funcionamiento interno de una capa MoE con router accesible en un modelo de tamaño manejable.
- Base para experimentos controlados de inicialización de router: modificar la semilla o el ruido de inicialización y comparar con este run de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta entropía cruzada de evaluación (media por token sobre 256 secuencias retenidas de 2048 tokens):

| Revision | Tokens vistos (incl. fase densa) | Eval CE |
|---|---|---|
| step5500 | 1.44B | 3.3556 |
| step6000 | 1.57B | 3.3210 |
| step6500 | 1.70B | 3.2900 |
| step7000 | 1.84B | 3.2643 |
| step8000 | 2.10B | 3.2179 |
| step9000 | 2.36B | 3.1805 |
| step10000 | 2.62B | 3.1526 |
| step11000 | 2.88B | 3.1258 |
| step12000 | 3.15B | 3.1010 |
| step13000 | 3.41B | 3.0805 |
| step14000 | 3.67B | 3.0607 |
| step15000 | 3.93B | 3.0437 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.696.887.808 parámetros, en bf16 se requieren aproximadamente 7,4 GB solo para pesos; en fp32, unos 14,8 GB. Añadir memoria para activaciones, KV cache y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para bf16 (RTX 4090, A100, H100); para fp32, 24 GB o más.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas con 16 GB o más (RTX 4080/4090, por ejemplo).
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código personalizado `mask_moe`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de investigación, no ajustado por instrucciones: no es adecuado para uso en producción ni para tareas conversacionales.
- Entrenamiento incompleto: se detuvo en el paso 15821 de 38.139 planificados.
- Ausencia de pérdida de balanceo de carga: riesgo de colapso del router o de utilización desigual de expertos, que es precisamente el fenómeno en estudio.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Riesgo de alucinación y de generación incoherente propio de un modelo base pequeño entrenado con pocos tokens (3,93B vistos en `step15000`).
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar `mask_moe` antes de usarlo.
- Licencia Apache 2.0: permite uso comercial, pero el estado del modelo no lo hace apto para producción.
- El repositorio ocupa 332,7 GB, lo que dificulta su descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JIRU-W/upcycle_dense5000_e32top8_noaux_rewarm200
- Modelo base denso: https://huggingface.co/JIRU-W/dense_e1_seq2048_gbs128_10b
- Dataset de entrenamiento: https://huggingface.co/datasets/JIRU-W/olmoe-mix-0924-10b
