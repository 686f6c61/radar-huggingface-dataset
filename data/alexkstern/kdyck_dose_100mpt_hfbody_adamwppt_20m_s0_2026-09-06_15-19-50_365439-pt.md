# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_20M_s0_2026-09-06_15-19-50_365439-pt

## Resumen

Este modelo es un checkpoint de investigación experimental desarrollado por alexkstern con la librería nanochat de Karpathy. Se trata de un transformer GPT de 16 capas y 1024 dimensiones de embedding, con una ventana de contexto de 2048 tokens. El experimento estudia el efecto de la «dosis de tokens»: el modelo se entrena primero con 100 millones de tokens de FineWeb (pre-entrenamiento) y después con 20 millones de tokens de un dataset Dyck-k128 (post-entrenamiento). El objetivo es analizar cómo la exposición a un lenguaje formal afecta al aprendizaje y a la pérdida. El checkpoint guardado corresponde al paso 1.525. No se han publicado benchmarks ni documentación de uso más allá de la configuración de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GPT (decoder-only) de 16 capas, 8 cabezas de atención, 8 KV heads, dimensión de embedding 1024 |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (los pesos se distribuyen como checkpoint de PyTorch sin cuantizar) |
| Idiomas soportados | No disponible (el pre-entrenamiento usa FineWeb, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un transformer GPT estándar (decoder-only). La configuración incluye 16 capas, 8 cabezas de atención, 8 cabezas KV (lo que implica atención con cache de KV de 8) y una dimensión de embedding de 1024. El vocabulario tiene 65536 tokens con BPE de nanochat. El proceso de entrenamiento es de dos fases: una fase de pre-entrenamiento (pt) sobre FineWeb-nanochatbpe-100M con 100 millones de tokens, y una fase de post-entrenamiento (ppt) sobre dyck-k128-seq_len_2048-1B con 20 millones de tokens. En la transición entre fases se re-inicializa el embedding, se reinicia el optimizador y se cambia la tasa de aprendizaje (el pre-entrenamiento usa una tasa trapezoidal con warmdown del 40%, mientras que el post-entrenamiento usa warmdown del 80%). No se ha aplicado RLHF ni DPO. El checkpoint se guardó tras 1525 pasos, con una pérdida de entrenamiento suavizada de 3.585 y un objetivo mínimo de 1.134. El entrenamiento consumió aproximadamente 2.08e17 FLOPs, con un coste de 2.08e9 FLOPs por token. La duración total fue de 116.35 segundos.

## Capacidades

- Generación de texto básica: el modelo puede producir secuencias de texto, pero al ser un experimento de investigación no se ha evaluado en tareas generales.
- Aprendizaje de lenguajes formales: el post-entrenamiento en Dyck-k128 sugiere capacidad para modelar estructuras de paréntesis anidados de hasta 128 tipos.
- No se documentan capacidades de tool calling, function calling, visión, audio, ni modo de razonamiento explícito.
- Soporte multilingüe: no verificado; el dataset de pre-entrenamiento es principalmente inglés.
- No se ha publicado soporte para agentes ni razonamiento multi-paso.

## Casos de uso

- Investigación en aprendizaje de lenguajes formales: el modelo permite estudiar cómo un transformer pequeño aprende la estructura Dyck-k128 tras un pre-entrenamiento en texto natural.
- Análisis de dinámicas de entrenamiento: los checkpoints y metadatos permiten reproducir y analizar el efecto de la dosis de tokens, la re-inicialización de embeddings y el reset del optimizador.
- Benchmarking de arquitecturas: puede usarse como referencia para comparar el impacto de variar el número de capas, cabezas o la tasa de aprendizaje en el régimen de «token dose».
- Educación en aprendizaje profundo: es un ejemplo práctico de entrenamiento de un transformer con nanochat, con configuración y métricas documentadas.
- Reproducción de experimentos: el repositorio incluye el estado del RNG y la configuración completa, lo que facilita replicar el resultado exacto.
- No se recomienda para aplicaciones de producción: no hay evaluación de seguridad, alucinación ni calidad de respuesta; su uso práctico fuera de investigación es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de entrenamiento suavizada en el paso 1525: 3.585, y el objetivo mínimo de evaluación: 1.134. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5 GB en FP16 y 1.1 GB en FP32, asumiendo unos 268 millones de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para cargar el modelo en FP16, por ejemplo RTX 3060, RTX 4060, A10 o T4.
- Cabe en GPU de consumo: sí, en GPUs de gama baja como GTX 1660 o RTX 3050.
- Opciones de despliegue: no disponible. No se han publicado pesos en formatos GGUF ni safetensors, por lo que no se puede usar directamente con vLLM, llama.cpp u Ollama. Se puede cargar con PyTorch y la librería nanochat para investigación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos de referencia. Los únicos modelos comparables son otros checkpoints del mismo autor con el prefijo `kdyck_dose_100Mpt_200M_s0` y `kdyck_dose_100Mpt_200M_s2`, disponibles en HuggingFace, pero no se dispone de sus especificaciones ni resultados de benchmarks. No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo se entrenó con FineWeb, que puede contener sesgos del texto web.
- Riesgo de alucinación: alto, al ser un modelo pequeño sin entrenamiento de instrucciones ni alineación.
- Limitaciones de contexto: ventana de 2048 tokens, insuficiente para tareas de contexto largo.
- Limitaciones de idioma: no está verificado el soporte multilingüe; probablemente solo inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo es experimental y no hay garantías de calidad.
- Advertencia para producción: no se recomienda su uso en sistemas reales sin una evaluación exhaustiva de seguridad y rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_20M_s0_2026-09-06_15-19-50_365439-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/pqfdif1s
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Checkpoint similar `kdyck_dose_100Mpt_200M_s0`: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_200M_s0_2026-08-14_18-41-11_852802-pt
- Checkpoint similar `kdyck_dose_100Mpt_200M_s2`: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_200M_s2_2026-08-14_18-57-50_991681-pt
