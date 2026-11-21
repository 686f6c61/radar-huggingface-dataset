# CyanMonkey/Test-Subject-3

## Resumen

Oleander-150M (publicado en Hugging Face como `CyanMonkey/Test-Subject-3`) es un checkpoint intermedio de un modelo de lenguaje de 149,98 millones de parámetros desarrollado por el usuario CyanMonkey. No es un modelo terminado: se trata de la ronda 14 de entrenamiento, detenida en el paso 7.000 de los 28.500 previstos (24,56 % del plan), con 2,88B tokens de computo vistos de un total de 14,94B. Su interes es fundamentalmente experimental: sirve para observar el comportamiento de una arquitectura hibrida poco habitual en modelos de este tamano.

La arquitectura combina 21 capas GDN2 (gated delta net 2, un mixer de tipo delta-rule con compuertas) y 7 capas de atencion GQA con compuertas, organizadas en 7 bloques de la forma `[GDN2, GDN2, GDN2, GQA]`, con 576 dimensiones ocultas, FFN SwiGLU de 1600 y vocabulario de 32.770 tokens con embeddings atados. Incorpora tecnicas como block attention residuals (AttnRes), value residual (v_mix), QK-Norm y RoPE parcial, ademas de un esquema de entrenamiento con token superposition training (TST) durante el primer 30 % de los pasos.

Es relevante ahora porque documenta de forma transparente un pipeline de entrenamiento completo (optimizador Muon + AdamW, schedule WSD, datos propios) sobre una arquitectura hibrida alternativa a los transformers clasicos. Sin embargo, al estar al 24,56 % del entrenamiento, su calidad de generacion es baja y no es apto para uso en produccion. La licencia Apache 2.0 facilita su reutilizacion con fines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 21 capas GDN2 (gated delta net 2) + 7 capas GQA con compuertas, en bloques `[GDN2 x3, GQA]` |
| Parametros totales | 149.976.139 (149,98 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos exportados en float32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas codigo remoto `configuration_oleander.py` y `modeling_oleander.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido de 28 capas dispuestas en 7 bloques de cuatro capas cada uno: tres capas GDN2 seguidas de una capa de atencion GQA con compuertas. Las capas GDN2 usan 9 cabezas de 64 dimensiones con convolucion de kernel 4; las capas GQA tienen 9 cabezas de consulta y 3 de clave/valor, con `head_dim` 64. La dimension oculta es 576, el FFN SwiGLU tiene 1600 unidades y el vocabulario de 32.770 tokens usa embeddings atados. Se anaden QK-Norm en forma de offset, RoPE parcial (`rotary_dim` 32, theta 100000), value residual (`v_mix`), RMSNorm y block attention residuals (AttnRes). El modelo no mantiene KV cache (`use_cache=False`), lo que afecta al coste de generacion en prompts largos.

El entrenamiento usa el trainer marimo/molab del autor con optimizador Muon (variante `muoneq_r`) combinado con AdamW, schedule WSD (warmup de 100 pasos, fase estable hasta el 82,5 % y cooldown `1-sqrt`), batch de 524.288 tokens de computo por paso (32 x 16 x 1.024) y precision bf16 con exportacion de pesos en float32. El dataset es `CyanMonkey/NextGen-1-32-1024` (14.753.933 filas de 1.024 tokens). Durante el primer 30 % de los pasos se aplica token superposition training (TST) con bolsas de 6 tokens. En el momento del checkpoint se han visto 17,30B tokens brutos y 2,88B tokens de computo, con una perdida de validacion de 6,3489 (perplejidad 571,85) y una perdida de entrenamiento de 5,2985.

## Capacidades

- Generacion de texto autoregresiva basica, con calidad limitada por el estado parcial del entrenamiento.
- Razonamiento y coherencia multi-turno: no fiables en este checkpoint; el autor advierte de repeticiones e incoherencias, especialmente con prompts few-shot.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el vocabulario es BPE plano sin extension durante el entrenamiento.
- Capacidades especiales: ninguna declarada (sin vision, audio ni modo thinking). La innovacion esta en la arquitectura (GDN2, AttnRes, TST), no en capacidades de producto.

## Casos de uso

- Investigacion sobre arquitecturas hibridas: el modelo permite estudiar el comportamiento de capas GDN2 intercaladas con GQA en un tamano manejable (150 M), comparando curvas de perdida y estabilidad frente a transformers clasicos.
- Reproduccion de pipelines de entrenamiento: el repo incluye `train_config.json`, `training_meta.json` y `progress.json`, utiles para replicar el esquema Muon + AdamW con WSD y TST en otros conjuntos de datos.
- Pruebas de kernels `flash-linear-attention`: las capas GDN2 usan kernels FLA en bf16 sobre GPU, por lo que el modelo sirve como banco de pruebas de rendimiento y correccion de dichos kernels frente a la referencia en PyTorch puro.
- Experimentos de decodificacion sin KV cache: al operar con `use_cache=False`, es un caso de estudio para medir el coste de recomputo en prompts largos y evaluar estrategias de caching alternativas.
- Docencia y divulgacion: un modelo de 150 M con codigo de modelado incluido y contexto de 1.024 tokens es adecuado para explicar mecanismos de atencion, delta-rule y normativas internas en cursos o talleres.
- Baseline para fine-tuning experimental: su licencia Apache 2.0 y su tamano permiten ajustarlo en una sola GPU consumer para tareas acotadas, aunque la calidad de partida es baja y los resultados seran limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de entrenamiento en el checkpoint: perdida de validacion 6,3489 (perplejidad 571,85), perdida de entrenamiento 5,2985, throughput de 76.860 tokens de computo por segundo y 0,139 pasos por segundo en una unica instancia de computo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 600 MB (149,98 M x 4 bytes); en bf16, unos 300 MB. El repo pesa 37,9 GB por artefactos de entrenamiento, no por los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para inferencia en bf16; se recomienda una GPU con soporte bf16 (Ampere o posterior) para usar los kernels `flash-linear-attention`.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para pruebas cortas, aunque la referencia en PyTorch puro es lenta con prompts largos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada). No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de KV cache complica su integracion en servidores de inferencia convencionales.
- Latencia y throughput: no se publican cifras de inferencia; solo el throughput de entrenamiento (76.860 tokens/s en una instancia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| Oleander-150M (este) | 149,98 M | 1.024 | Hibrida GDN2 + GQA | Apache 2.0 | Checkpoint al 24,56 % |
| SmolLM2-135M | 135 M | 8.192 | Transformer denso | Apache 2.0 | Modelo finalizado |
| Qwen2.5-0.5B | 494 M | 32.768 | Transformer denso | Apache 2.0 | Modelo finalizado |
| MobileLLM-125M | 125 M | 2.048 | Transformer denso | Apache 2.0 (variantes) | Modelo finalizado |

La comparacion es orientativa: Oleander-150M es un checkpoint intermedio con contexto de 1.024 tokens y sin benchmarks publicados, por lo que no es directamente comparable en rendimiento con los modelos finalizados de la tabla.

## Limitaciones y advertencias

- Modelo inacabado: entrenado solo al 24,56 % de los pasos previstos; el autor advierte de repeticiones e incoherencias, especialmente con prompts few-shot.
- Perplejidad de validacion muy alta (571,85), indicativa de una calidad de lenguaje baja.
- Contexto maximo de 1.024 tokens, insuficiente para la mayoria de tareas de produccion.
- Sin KV cache (`use_cache=False`): la generacion con prompts largos es costosa porque se recomputa el estado en cada paso.
- Idiomas soportados no documentados; el vocabulario BPE no se amplia durante el entrenamiento, lo que limita la cobertura linguistica.
- Riesgo elevado de alucinacion y sesgos: no se documentan filtros de datos, evaluaciones de sesgo ni alineamiento (RLHF/DPO no mencionados).
- Licencia Apache 2.0 permite uso comercial, pero la calidad del checkpoint hace desaconsejable cualquier despliegue en produccion.
- Requiere `trust_remote_code=True` y ejecucion de codigo Python incluido en el repositorio; conviene auditar `modeling_oleander.py` antes de cargarlo en entornos sensibles.
- El repositorio incluye artefactos de entrenamiento (37,9 GB) que no son necesarios para la inferencia; descargar solo los ficheros de pesos y configuracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyanMonkey/Test-Subject-3
- Dataset de entrenamiento: https://huggingface.co/datasets/CyanMonkey/NextGen-1-32-1024
- Kernels flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Entorno marimo (notebooks reactivos en Python): https://github.com/marimo-team/marimo
- Documentacion de transformers sobre codigo remoto: https://huggingface.co/docs/transformers/main/en/custom_models
