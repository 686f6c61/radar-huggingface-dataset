# alexkstern/nca_dose_100Mpt_hfinit_adamwppt_500M_s1_2026-09-06_12-24-15_356482-pt

## Resumen

Este modelo es un checkpoint experimental de investigación desarrollado por alexkstern con la librería nanochat. Se trata de un estudio sobre el efecto del tamaño del vocabulario y la reinicialización de embeddings durante el entrenamiento de modelos de lenguaje. El entrenamiento se divide en dos fases: una fase de preentrenamiento con 100 millones de tokens del dataset FineWeb (con un vocabulario BPE de 65536), y una fase posterior con 500 millones de tokens de un dataset denominado `nca-paper-share20-2048` (con un vocabulario reducido de 10004). En la transición se reinitializan los embeddings y se resetea el optimizador.

Arquitectónicamente es un decoder-only transformer (GPT) de 16 capas, 8 cabezas de atención, 8 cabezas KV, 1024 dimensiones de embedding y una longitud de contexto de 2048 tokens. El checkpoint corresponde al paso 1.525, con una pérdida de entrenamiento suavizada de 3,585. No se especifica el número total de parámetros, ni el tamaño exacto del modelo en términos de parámetros, aunque por la arquitectura se trata de un modelo pequeño (en el rango de las decenas o centenas de millones de parámetros).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (GPT) con 16 capas, 8 cabezas de atencion, 8 cabezas KV, 1024 dimensiones de embedding |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT de nanochat, un transformer causal con capas de atención de múltiples cabezas y MLP. La configuración incluye 16 capas, 8 cabezas de atención y 8 cabezas KV, con una dimensión de embedding de 1024. El vocabulario final es de 10004 tokens, resultado de una transición desde un vocabulario inicial de 65536.

El entrenamiento se desarrolla en dos etapas: una primera fase de preentrenamiento (pt) con 100 millones de tokens de FineWeb (`fineweb-nanochatbpe-100M`) y una segunda fase de "post-preentrenamiento" (ppt) con 500 millones de tokens de un dataset llamado `nca-paper-share20-2048`, que utiliza un vocabulario distinto. La transición entre ambas fases implica re-inicializar los embeddings y reiniciar el optimizador. El scheduler es trapezoidal, con warmup y warmdown. Además, se aplican tasas de aprendizaje diferenciadas para matrices, embeddings y unembeddings. El modelo fue entrenado con `compile_model: true` para acelerar el cómputo. No se ha aplicado RLHF ni DPO en ninguna fase del entrenamiento.

## Capacidades

- Generación de texto autoregresivo con una ventana de contexto de 2048 tokens.
- El modelo está pensado como plataforma para experimentos de investigación, no como producto orientado a tareas específicas.
- No se han documentado capacidades de tool calling, function calling, agentes, visión o audio.
- El soporte de idiomas no está especificado, aunque el uso de FineWeb en la fase de preentrenamiento sugiere que el modelo está expuesto principalmente a texto en inglés.
- Los flops consumidos por token durante el entrenamiento se estiman en 2.080e9.

## Casos de uso

- Investigación sobre el efecto del tamaño del vocabulario: este modelo permite comparar el rendimiento cuando se reduce el vocabulario de 65536 a 10004, una línea de trabajo relevante para modelos más eficientes.
- Experimentos de transferencia de embeddings: la reinicialización del embedding en la transición entre fases ofrece un caso de estudio para investigar cómo se adaptan los modelos a nuevos vocabularios.
- Análisis de la relación entre cantidad de tokens y rendimiento: el sufijo `token_dose` indica que el modelo es parte de una serie de experimentos para estudiar cómo la cantidad de tokens por fase afecta el aprendizaje.
- Formación y educación: sirve como ejemplo práctico de entrenamiento con nanochat, mostrando cómo estructurar un experimento con dos fases y diferentes configuraciones.
- Comparación de tasas de aprendizaje diferenciadas: el uso de lrs específicas para matrices, embeddings y unembeddings permite estudiar su impacto en el entrenamiento.
- Estudio de escalado de modelos pequeños: al tratarse de un modelo pequeño, es útil para investigar dinámicas de entrenamiento en condiciones controladas de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos numéricos disponibles son métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Paso (step) | 1525 |
| Loss de entrenamiento suavizada | 3,5854 |
| Objetivo minimo | 1,1375 |
| Flops usados | 2,0792e+17 |
| Flops por token | 2.080.374.784 |
| Tiempo total de entrenamiento | 472,61 segundos |

Estas métricas no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se ha publicado la precisión de los pesos ni el tamaño de parámetros. El repositorio de HuggingFace ocupa 3,0 GB, incluyendo el checkpoint y metadatos.
- GPU recomendadas: no disponible oficialmente. Por la arquitectura de 16 capas y 1024 dimensiones de embedding, es probable que quepa en GPUs de consumo como RTX 3060 o superiores, pero no hay pruebas documentadas.
- Cabe en consumer GPU: no confirmado, aunque el tamaño del modelo sugiere que sí.
- Opciones de despliegue: el checkpoint está en formato .pt y fue entrenado con nanochat. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con los mismos objetivos de investigación. Los checkpoints del mismo autor en HuggingFace (`alexkstern/nca_dose_100Mpt_500M_s1_2026-08-15_02-27-24_709317-pt` y `alexkstern/nca_dose_100Mpt_5M_s1_2026-08-15_01-34-24_702785-pt`) son experimentos de la misma serie, con la misma arquitectura pero distintas dosis de tokens y fechas. No se han publicado comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, seguridad ni alucinaciones.
- La ventana de contexto de 2048 tokens es reducida para tareas que requieren memorias largas.
- El idioma principal probablemente sea inglés, pero no está confirmado, lo que limita su uso en otros idiomas.
- El checkpoint se distribuye en formato .pt y no incluye cuantizaciones ni tokenizadores claros (hay dos configuraciones de vocabulario), lo que dificulta su uso directo con herramientas estándar.
- Es un modelo experimental sin validación de producción. No se recomienda su uso en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación y benchmarks impide evaluar su utilidad real.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfinit_adamwppt_500M_s1_2026-09-06_12-24-15_356482-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro del experimento en W&B: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/yg02ogmh
- Otros experimentos del mismo autor: https://huggingface.co/alexkstern/nca_dose_100Mpt_500M_s1_2026-08-15_02-27-24_709317-pt y https://huggingface.co/alexkstern/nca_dose_100Mpt_5M_s1_2026-08-15_01-34-24_702785-pt
