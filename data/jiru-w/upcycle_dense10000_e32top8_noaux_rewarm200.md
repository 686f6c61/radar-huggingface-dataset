# JIRU-W/upcycle_dense10000_e32top8_noaux_rewarm200

## Resumen

`upcycle_dense10000_e32top8_noaux_rewarm200` es un checkpoint de investigación publicado por el usuario JIRU-W en HuggingFace. Se trata de un modelo de mezcla de expertos (MoE) obtenido mediante *upcycling* ingenuo de un modelo denso previo (`JIRU-W/dense_e1_seq2048_gbs128_10b`): en el paso 10.000 del entrenamiento denso, cada MLP SwiGLU de cada capa se copió 32 veces para crear 32 expertos idénticos, se inicializó un router nuevo y se continuó el entrenamiento sin función de pérdida de balanceo de carga (`router_aux_loss_coef=0`). El objetivo declarado es estudiar si expertos inicialmente idénticos llegan a diferenciarse por sí solos.

El modelo tiene 3.696.887.808 parámetros totales, activa 8 de 32 expertos por token y opera con una longitud de contexto de 2.048 tokens (derivada de la configuración de entrenamiento: secuencias de 2.048 tokens y batch de 128). El entrenamiento se detuvo en el paso 14.594 de los 38.139 planificados, por lo que no está entrenado hasta completarse. No es un modelo instruido (*instruction-tuned*) ni está pensado para uso en producción: es un artefacto de investigación sobre dinámica de expertos en arquitecturas MoE.

La relevancia actual del checkpoint reside en que documenta de forma reproducible un experimento poco habitual: upcycling sin ruido, sin reinicialización parcial y sin pérdida auxiliar de balanceo, con re-warmup del learning rate tras la conversión. Los checkpoints intermedios y el estado del optimizador permiten analizar la evolución de la especialización de expertos y del enrutamiento a lo largo del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE en las capas MLP (SwiGLU, intermediate size 1024), 32 expertos, top-8 |
| Parametros totales | 3.696.887.808 |
| Parametros activos | 8 de 32 expertos por token (top-8); el numero exacto de parametros activos no esta disponible |
| Longitud de contexto | 2.048 tokens (secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only denso (`JIRU-W/dense_e1_seq2048_gbs128_10b`) y aplica upcycling: cada experto de cada capa es una copia exacta del MLP SwiGLU denso de esa capa (intermediate size 1024). El router se inicializa de nuevo con `normal(0, 0.02)` y semilla 1234, con `norm_topk_prob=True`, de modo que en el paso 10.000 el MoE reproduce exactamente la función del modelo denso. Embeddings, atención, normalizaciones y `lm_head` se copian sin cambios; no hay ruido ni reinicialización parcial. La configuración es de 32 expertos y top-8, con `router_aux_loss_coef=0`, es decir, sin pérdida de balanceo de carga.

El entrenamiento posterior continúa el orden de datos del run denso desde el paso 10.000 (permutación con `np.random.default_rng(1234).permutation(4881809)`, 128 muestras por paso) sobre el dataset `JIRU-W/olmoe-mix-0924-10b`. El batch efectivo es de 128 × 2.048 = 262.144 tokens por paso. Se usa AdamW con estado nuevo, weight decay 0.1 y el schedule coseno del run denso (pico 8e-4, 200 pasos de warmup, decaimiento hasta 8e-5 en el paso 38.139), con un re-warmup lineal adicional desde 0 durante los primeros 200 pasos tras el paso 10.000. La precisión es bf16 en pesos con acumulación de gradiente en fp32, DeepSpeed ZeRO-2 y una sola GPU, semilla 1234. El run se detuvo en el paso 14.594 de 38.139.

## Capacidades

- Generación de texto autoregresiva con `transformers` (`AutoModelForCausalLM`).
- Exposición de logits del router por capa mediante `output_router_logits=True` (`out.router_logits`), útil para analizar el enrutamiento.
- Modelo base sin ajuste por instrucciones: no soporta de forma fiable diálogo, instrucciones ni formato conversacional.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingües específicas ni evaluación por idioma.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad principal: servir como objeto de estudio de especialización de expertos y dinámica de routers en MoE con upcycling.

## Casos de uso

- Investigación sobre especialización de expertos: comparar los checkpoints `init`, `step10500`, `step11000`, `step12000`, `step13000` y `step14000` para medir si expertos inicialmente idénticos divergen en sus representaciones y en qué capas ocurre antes.
- Estudio de enrutamiento sin pérdida de balanceo: analizar la distribución de tokens por experto a lo largo del entrenamiento para detectar colapso o desequilibrio del router en ausencia de `aux_loss`.
- Reproducibilidad de experimentos de upcycling: el checkpoint `ds_step14500` (DeepSpeed ZeRO-2, resumible con DeepSpeed >= 0.19.6) junto con `run_config.json` y `train_log.jsonl` permite reanudar o replicar el run.
- Análisis de la curva de cross-entropy: los valores de evaluación (3.2349 en el paso 10500 hasta 3.1194 en el 14000 sobre 256 secuencias retenidas de 2.048 tokens) sirven como referencia para estudiar la evolución de la pérdida tras la conversión a MoE.
- Docencia y divulgación sobre arquitecturas MoE: el modelo permite ilustrar el mecanismo de top-k routing y el efecto del re-warmup del learning rate tras el upcycling.
- Baseline para comparativas de métodos de upcycling: sirve como referencia "ingenua" frente a variantes con ruido, reinicialización parcial o pérdida auxiliar de balanceo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta cross-entropy de evaluación (media del cross-entropy por token sobre 256 secuencias retenidas de 2.048 tokens):

| Revision | Tokens vistos (incl. fase densa) | Eval CE |
|---|---|---|
| step10500 | 2,75B | 3,2349 |
| step11000 | 2,88B | 3,2160 |
| step11500 | 3,01B | 3,1971 |
| step12000 | 3,15B | 3,1776 |
| step13000 | 3,41B | 3,1476 |
| step14000 | 3,67B | 3,1194 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 7,4 GB solo para pesos (3.696.887.808 parámetros × 2 bytes), más overhead de activaciones y KV cache; el tamaño del repo es de 288,4 GB por incluir múltiples revisiones y checkpoints de DeepSpeed.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM para bf16 con contexto de 2.048 tokens (por ejemplo, RTX 4090, A100 40 GB, H100). No se dispone de estimaciones de cuantización porque el autor no publica versiones GGUF ni cuantizadas.
- Cabe en GPU de consumo con 16-24 GB de VRAM en bf16; en fp32 serían necesarios unos 14,8 GB solo para pesos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado `mask_moe`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento se realizó en una sola GPU con DeepSpeed ZeRO-2, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| upcycle_dense10000_e32top8_noaux_rewarm200 | 3,70B | 2.048 | Apache 2.0 | MoE de investigación, sin instruction tuning, entrenamiento incompleto |
| OLMoE (referencia del dataset y la arquitectura) | no disponible en la informacion | no disponible | no disponible | El autor cita OLMoE como inspiración (`olmoe`, dataset `olmoe-mix-0924-10b`), pero no se aportan sus especificaciones |
| JIRU-W/dense_e1_seq2048_gbs128_10b (modelo base) | no disponible | 2.048 | no disponible | Modelo denso del que se deriva por upcycling |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones y no debe usarse como asistente conversacional.
- Entrenamiento incompleto: se detuvo en el paso 14.594 de 38.139, por lo que el modelo no ha completado su schedule de entrenamiento.
- Sin pérdida de balanceo de carga: el router puede presentar desequilibrio o colapso de expertos; el autor no publica análisis de utilización de expertos.
- Contexto limitado a 2.048 tokens, insuficiente para muchas tareas de producción con documentos largos.
- Idiomas soportados no documentados; no hay evaluación multilingüe.
- Riesgo de alucinación y sesgos no evaluados: no se publican análisis de sesgo ni de seguridad.
- Requiere `trust_remote_code=True` por el código personalizado `mask_moe`, lo que implica ejecutar código del autor.
- El tamaño del repo (288,4 GB) complica la descarga; conviene usar `revision` para bajar solo el checkpoint deseado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de instruction tuning y de evaluación hacen desaconsejable su uso en producción sin un ajuste posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JIRU-W/upcycle_dense10000_e32top8_noaux_rewarm200
- Modelo base denso: https://huggingface.co/JIRU-W/dense_e1_seq2048_gbs128_10b
- Dataset de entrenamiento: https://huggingface.co/datasets/JIRU-W/olmoe-mix-0924-10b
