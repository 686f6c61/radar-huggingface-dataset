# alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_1B_s2_2026-09-06_18-32-09_627575-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfinit_adamwppt_1B_s2_2026-09-06_18-32-09_627575-pt` es un checkpoint de investigación desarrollado por `alexkstern` utilizando la librería `nanochat` de Karpathy. Se trata de un experimento de aprendizaje por transferencia en el que un modelo pequeño se preentrena primero con 100 millones de tokens de texto natural (FineWeb) y posteriormente se somete a un post-entrenamiento con 1.000 millones de tokens de un dataset sintético de paréntesis balanceados (Dyck-k con k=128). El objetivo es estudiar cómo un modelo preentrenado en lenguaje natural se adapta a una tarea formal y estructurada.

La arquitectura es un transformer decoder-only con 16 capas, 8 cabezas de atención, dimensiones de embedding de 1024 y una longitud de contexto de 2048 tokens. El checkpoint corresponde al paso 1.525 de entrenamiento y se distribuye bajo licencia Apache 2.0. El repositorio tiene un tamaño de 3.0 GB e incluye los pesos en formato PyTorch (.pt). No se han publicado resultados de benchmarks ni se especifican idiomas soportados, por lo que el modelo debe considerarse exclusivamente como una pieza de investigación experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) con state_dict, config JSON |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, implementado en la librería `nanochat`. Según la configuración proporcionada, la arquitectura tiene 16 capas, 8 cabezas de atención, 8 cabezas clave/valor (sin Grouped Query Attention), dimensión de embedding de 1024 y un vocabulario de 65.536 tokens en la fase de preentrenamiento. En la fase de post-entrenamiento, el vocabulario se reduce a 256 tokens, lo que sugiere que el modelo se reconfigura para trabajar exclusivamente con el alfabeto del dataset Dyck-k.

El entrenamiento se divide en dos etapas. Primero, un preentrenamiento con 100 millones de tokens del dataset `fineweb-nanochatbpe-100M`. Después, un post-entrenamiento con 1.000 millones de tokens del dataset `dyck-k128-seq_len_2048-1B`. Durante la transición entre ambas fases se reinicializan los embeddings, se reinicia el optimizador y se cambia el tamaño del vocabulario. El aprendizaje usa una tasa de aprendizaje trapezoidal con calentamiento y enfriamiento, con valores distintos para matrices, embeddings y unembeddings. No se menciona RLHF ni DPO. El checkpoint se guardó en el paso 1.525 con una pérdida de entrenamiento suavizada de 3,589.

## Capacidades

- Generación de secuencias sintéticas de paréntesis balanceados (Dyck-k) con k=128.
- Adaptación de un modelo preentrenado en lenguaje natural a una tarea formal estructurada.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- No tiene capacidades de visión ni audio.
- Capacidades multilingües no disponibles.

## Casos de uso

- Investigación en transferencia de aprendizaje: el modelo sirve para estudiar cómo un transformer pequeño preentrenado en texto natural se adapta a un dominio sintético con gramática formal, permitiendo analizar la capacidad de generalización y la interferencia entre dominios.
- Experimentos de destilación de conocimiento: puede utilizarse como modelo base para evaluar técnicas de "dose" de datos sintéticos y medir el impacto del tamaño del dataset en la convergencia.
- Ablaciones de arquitectura: al estar disponible la configuración completa, es útil para investigar el efecto de la reinicialización de embeddings o del cambio de vocabulario en el rendimiento final.
- Evaluación de robustez a cambios de distribución: el modelo permite probar cómo se comporta un modelo de lenguaje cuando se le presenta una tarea fuera de su distribución original.
- Reproducibilidad de experimentos: el checkpoint incluye metadatos, configuración y estado del generador de números aleatorios, lo que facilita la reproducción exacta del experimento.
- Comparación de estrategias de optimización: con los registros de W&B y las configuraciones de tasa de aprendizaje, se pueden comparar variantes de entrenamiento con diferentes semillas y tamaños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de entrenamiento suavizada (3,589) y el objetivo mínimo (1,136), pero no hay resultados de evaluaciones externas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada. Dado el tamaño del checkpoint (3.0 GB) y la arquitectura pequeña, se estima que la carga en fp32 requiere aproximadamente 1 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: no especificadas. El modelo es lo suficientemente pequeño como para ejecutarse en cualquier GPU consumer moderna (RTX 3060 o superior).
- Compatibilidad con GPU consumer: sí, se puede ejecutar en GPUs de gama media.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede cargarse con frameworks como PyTorch directamente. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría. Los únicos modelos comparables encontrados son otros checkpoints del mismo autor con tamaños de preentrenamiento de 200M y 500M tokens, pero no se proporcionan resultados de rendimiento ni benchmarks. La comparativa se limita a señalar que estos checkpoints comparten la misma arquitectura y filosofía de entrenamiento.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está diseñado para uso en producción ni para tareas de lenguaje natural generales.
- Su vocabulario final se reduce a 256 tokens, lo que limita su capacidad de generación a secuencias sintéticas de paréntesis.
- Riesgo de alucinación alto si se utiliza fuera de su dominio de entrenamiento.
- No se han reportado sesgos conocidos, pero al estar entrenado parcialmente en FineWeb, podría heredar sesgos presentes en ese dataset.
- La licencia Apache 2.0 permite uso comercial, pero la utilidad práctica del modelo es muy limitada.
- No se especifican idiomas soportados, por lo que no se puede garantizar un comportamiento adecuado en ningún idioma natural.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_1B_s2_2026-09-06_18-32-09_627575-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro W&B: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/3yw7ladf
