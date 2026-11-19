# ikimyaii/Mamba-1.3B-unstructured-SparseGPT-70pct

## Resumen

Mamba-1.3B-unstructured-SparseGPT-70pct es un checkpoint derivado del modelo base `fla-hub/mamba-1.3B-100B`, publicado por el usuario `ikimyaii`. No se trata de un modelo entrenado desde cero, sino de una poda (pruning) one-shot sin reentrenamiento posterior aplicada con el código oficial de SparseGPT sobre las capas lineales internas de los bloques Mamba. El objetivo es servir como línea base (baseline) para la familia de modelos EHWS del mismo autor, comparando el efecto de la poda no estructurada frente a alternativas.

El modelo conserva la arquitectura Mamba original (modelo de espacio de estados selectivo, SSM) con 1.334.740.992 parámetros totales, lo que lo sitúa en el rango de 1.3B. La poda afecta a las capas `in_proj`, `x_proj` y `out_proj` de cada bloque, mientras que `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y el `lm_head` permanecen densos. La sparsity efectiva medida sobre los pesos publicados es de 0,6861 (en torno al 70 % objetivo), aunque la máscara no está equilibrada por filas.

Es relevante ahora porque documenta con transparencia el coste en calidad de aplicar SparseGPT a una arquitectura SSM en lugar de a un transformer, terreno mucho menos explorado. Los resultados muestran un deterioro severo de perplejidad (de 10,03 a 40,81 en WikiText-2) y una caída media de 5,2 puntos en zero-shot, lo que lo convierte en una referencia útil para quien investigue compresión de modelos Mamba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parámetros totales | 1.334.740.992 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fla-hub/mamba-1.3B-100B |
| Sparsity medida | 0,6861 (no estructurada, one-shot) |
| Tamaño del repo | 2,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atención por recurrencia selectiva dependiente de la entrada. Cada bloque contiene proyecciones lineales (`in_proj`, `x_proj`, `out_proj`), una `conv1d`, una proyección temporal `dt_proj` y parámetros `A_log` y `D`. El modelo base `fla-hub/mamba-1.3B-100B` fue entrenado sobre 100B tokens según su denominación, aunque la model card de este checkpoint no detalla la composición del dataset ni si hubo fases de RLHF o DPO.

El proceso de poda es el elemento diferencial. Se aplicó el código oficial de SparseGPT (commit `147d215`, driver `fasterprune`, blocksize 128, damping 0,01) en modo one-shot, sin reentrenamiento. La calibración usó 128 secuencias de C4 de 2.048 tokens con semilla 0, y los bloques se podaron en orden, recalibrando cada uno sobre las salidas de los bloques ya podados. La poda se realizó en bfloat16 (Mamba desborda en fp16) y tardó 5,3 minutos en una A100 de 40 GB. La máscara emplea un umbral por bloque de 128 columnas, lo que produce filas con distinto número de ceros: la fila más densa tiene de media 1,62 veces los no-ceros de la fila media, y la peor capa alcanza 2,95 veces.

## Capacidades

- Generación de texto autorregresiva, heredada del modelo base Mamba-1.3B.
- Razonamiento básico y respuesta a preguntas de opción múltiple (evaluado en arc, hellaswag, openbookqa, etc.).
- Inferencia de sentido común y resolución de correferencia (winogrande, boolq).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe específica.
- No dispone de modo thinking, visión ni audio.
- Capacidad de compresión: sirve como baseline de referencia para estudiar poda no estructurada en SSM.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint permite reproducir y comparar el efecto de SparseGPT sobre arquitecturas SSM frente a transformers, usando las métricas de perplejidad y zero-shot ya publicadas como referencia.
- Baseline para la familia EHWS: el autor lo declara explícitamente como referencia contra la que medir sus modelos EHWS, de modo que cualquier evaluación comparativa parte de estos números.
- Estudio de robustez de la máscara: al documentarse el desequilibrio por filas (hasta 2,95 veces en la peor capa), sirve para analizar cómo afecta la distribución de no-ceros a la calidad.
- Reproducción de pipelines de poda: el método está descrito con suficiente detalle (commit, blocksize, damping, calibración) para replicar el proceso sobre otros checkpoints Mamba.
- Análisis de sensibilidad por capa: permite identificar qué proyecciones (`in_proj`, `x_proj`, `out_proj`) toleran mejor la poda al 70 % en un SSM.
- Docencia y divulgación: ejemplo realista del coste de calidad de la poda agresiva sin reentrenamiento en una arquitectura no transformer.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, WikiText-2 / C4, en bfloat16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,03 | 14,12 |
| Este modelo | 40,81 | 48,79 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,1783 |
| arc_easy | 0,5644 | 0,3843 |
| boolq | 0,6040 | 0,6135 |
| hellaswag | 0,3898 | 0,2992 |
| openbookqa | 0,1980 | 0,1620 |
| rte | 0,5343 | 0,5162 |
| winogrande | 0,5217 | 0,5280 |
| Media | 0,4350 | 0,3831 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,7 GB solo para pesos, más overhead de activaciones y caché; se recomienda al menos 6-8 GB para comodidad.
- GPU recomendadas: A100 40 GB (usada para la poda), H100, o cualquier GPU con soporte bfloat16.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y superiores; en GPUs de 8 GB conviene cuantizar o usar precisión reducida, teniendo en cuenta que Mamba desborda en fp16.
- Opciones de despliegue: requiere `flash-linear-attention` instalado (`import fla`) y carga mediante `AutoModelForCausalLM.from_pretrained(...)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Sparsity | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este modelo | 1,33B | Mamba | 0,6861 | 40,81 | no disponible |
| fla-hub/mamba-1.3B-100B (denso) | 1,33B | Mamba | 0 | 10,03 | no disponible |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos publicados es contra su propio modelo base denso. No se dispone de información sobre otros checkpoints podados de Mamba 1.3B con los que contrastar.

## Limitaciones y advertencias

- Deterioro severo de calidad: la perplejidad en WikiText-2 se multiplica por cuatro (10,03 a 40,81) y la media zero-shot cae de 0,4350 a 0,3831.
- Caída especialmente marcada en arc_easy (0,5644 a 0,3843) y hellaswag (0,3898 a 0,2992), tareas que dependen de razonamiento y sentido común.
- Máscara desequilibrada por filas: la fila más densa tiene 1,62 veces la media de no-ceros y la peor capa 2,95 veces, lo que puede introducir sesgos por capa.
- Poda one-shot sin reentrenamiento: no se aplicó recuperación de calidad, por lo que el modelo no está pensado para uso en producción.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no documentados: no se garantiza un comportamiento multilingüe.
- Riesgo de alucinación elevado por la pérdida de capacidad tras la poda.
- Longitud de contexto no documentada en este checkpoint.
- Mamba desborda en fp16: debe usarse bfloat16 o cuantización adecuada.
- Requiere la librería `flash-linear-attention` para cargarse correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-unstructured-SparseGPT-70pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit `147d215`)
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
