# alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_20M_s0_2026-09-06_22-43-57_135632-pt

## Resumen

Modelo experimental de lenguaje desarrollado por alexkstern mediante el framework nanochat de Karpathy. Se trata de un checkpoint de investigación cuyo objetivo es estudiar el efecto de la "dosis" de tokens de post-entrenamiento: primero se realiza un pretraining de 1.000 millones de tokens sobre el dataset FineWeb y, posteriormente, un post-entrenamiento de 20 millones de tokens sobre un dataset sintético Dyck-k128. La arquitectura es un transformer decoder (GPT) con 16 capas, 8 cabezas de atención, dimensión de embedding 1024 y longitud de contexto de 2048 tokens. El vocabulario es de 65.536 tokens y el modelo se publica bajo licencia Apache-2.0. Es un experimento académico orientado a analizar la adaptación de dominio y la dinámica de optimización, no un modelo generalista listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT) |
| Parametros totales | no disponible (la config sugiere ~300M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar implementada en nanochat: 16 capas, 8 cabezas de atención con 8 KV heads, dimension de embedding 1024 y contexto de 2048 tokens. El vocab size se fija en 65.536, aunque el dataset Dyck utiliza un vocabulario reducido de 256 tokens. El entrenamiento se divide en dos fases: un pretraining de 1.000 millones de tokens sobre FineWeb con tokenizador nanochat BPE y un post-entrenamiento de 20 millones de tokens sobre secuencias Dyck (parentesis balanceados de profundidad k=128, longitud 2048). El optimizador es AdamW con tasas de aprendizaje separadas: 0.02 para las matrices de proyeccion, 0.3 para los embeddings y 0.004 para los unembeddings, con un scheduler trapezoidal de warmdown 0.4. En la transicion entre fases se reinicializan los embeddings y se resetea el optimizador. No se menciona RLHF, DPO ni ninguna otra tecnica de alineacion. El checkpoint corresponde al paso 3.814, con una loss suavizada de entrenamiento de 3.169.

## Capacidades

- Generacion de secuencias sinteticas Dyck (parentesis balanceados) tras el post-entrenamiento.
- Comprension basica de lenguaje natural derivada del pretraining en FineWeb, aunque no se aportan metricas de calidad.
- Sin soporte documentado de tool calling, function calling, agentes, vision, audio o pensamiento multi-paso.
- Capacidad multilingue no documentada.
- Contexto limitado a 2048 tokens, adecuado para secuencias cortas.
- No se han publicado evaluaciones de razonamiento, codigo o matematicas.

## Casos de uso

- Investigacion en transferencia de dominio: permite estudiar como un modelo pequeño se adapta a una tarea sintetica tras un post-entrenamiento con 20M de tokens.
- Analisis de la "dosis" de tokens: sirve para comparar el efecto de distintos volumenes de datos de post-entrenamiento sobre la loss y el comportamiento.
- Reproduccion de pipelines de entrenamiento con nanochat: el checkpoint y su configuracion JSON permiten replicar el flujo completo de entrenamiento del framework de Karpathy.
- Estudio de dinamicas de optimizacion: la configuracion con tasas de aprendizaje diferenciadas para embeddings, unembeddings y matrices facilita el analisis del impacto de estas elecciones.
- Benchmarking de eficiencia computacional: el README reporta FLOPs por token (2.080.374.784) y FLOPs totales (2.08e18), utiles para comparar coste de entrenamiento entre modelos.
- Docencia y divulgacion: ejemplo didactico de entrenamiento de un transformer desde cero con datos sinteticos y monitorizacion con Weights & Biases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README unicamente reporta metricas de entrenamiento: loss suavizada de 3.169, objetivo minimo de 0.944, FLOPs totales de 2.08e18 y tiempo de entrenamiento de 752 segundos. Estas cifras no son comparables con benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se han publicado requisitos de hardware especificos.
- Dado el tamano estimado de ~300M parametros, una GPU consumer de 8-12 GB (por ejemplo, RTX 3060 o RTX 4070) es suficiente para inferencia en FP16.
- Los pesos se distribuyen en formato .pt de PyTorch, por lo que no son directamente compatibles con vLLM, llama.cpp, Ollama o TGI sin una conversion previa a safetensors o GGUF.
- La inferencia con contexto 2048 es ligera y puede ejecutarse en CPU para uso experimental, aunque sin garantias de latencia.

## Comparativa con modelos similares

No disponible. No se ha encontrado informacion sobre modelos comparables en la documentacion proporcionada. El modelo pertenece a una serie de experimentos del mismo autor con distintas configuraciones de post-entrenamiento, pero no se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo experimental sin evaluacion externa ni benchmarks publicados.
- No se ha evaluado el riesgo de sesgos, alucinaciones ni comportamientos de seguridad.
- Entrenado mayoritariamente en lenguaje natural y despues en un dominio sintetico; su utilidad practica en tareas reales es limitada.
- Los pesos en formato .pt de PyTorch requieren conversion para la mayoria de frameworks de despliegue.
- El post-entrenamiento con 20M de tokens es una fraccion minima comparada con los 1B de pretraining, lo que puede producir resultados erraticos en el dominio Dyck.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para produccion sin una evaluacion previa exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_20M_s0_2026-09-06_22-43-57_135632-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/6vgxtho8
- nanochat: https://github.com/karpathy/nanochat
