# JaydenTeoh/soft-mtp-689m-model

## Resumen

Soft-MTP 689M es un modelo de lenguaje decodificador-only entrenado por Jayden Teoh como parte del trabajo de investigación "Multi-Token Prediction Done Right" (arXiv:2610.38331). Se trata de uno de los doce checkpoints publicados (tres objetivos de multi-token prediction por cuatro tamaños de modelo), entrenados bajo una receta idéntica para que sean directamente comparables entre sí. Su particularidad es que las cabeceras MTP se entrenan contra la propia distribución del verificador de siguiente token del modelo, en lugar del token real observado, mediante un acoplamiento KL con straight-through estimator.

El modelo es un transformer convencional de 745 millones de parámetros (745.049.088 según los pesos en safetensors), con hidden size de 1152, 36 capas y 18 cabezas de atención, entrenado sobre 31,5 mil millones de tokens de FineWeb-Edu con el tokenizador GPT-2. Las tres cabeceras MTP (estilo DeepSeek, en cascada de un bloque cada una) son auxiliares: se descartan en inferencia, de modo que lo que se despliega es un transformer de predicción de siguiente token ordinario. También pueden servir como modelo borrador (draft) para decodificación especulativa auto-especulativa.

Su relevancia actual es principalmente investigativa: permite estudiar el efecto del objetivo de multi-token prediction "soft" frente a variantes alternativas en condiciones controladas (mismo seed, mismo orden de datos, mismo schedule), y sirve como base para experimentos de decodificación especulativa sin necesidad de un modelo borrador externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador-only con cabeceras MTP auxiliares (model_type: hf_mtp, código remoto) |
| Parametros totales | 745.049.088 (745M) |
| Parametros activos | 745M (no es MoE; las cabeceras MTP se descartan en inferencia) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/bf16 según entrenamiento) |
| Idiomas soportados | Ingles (entrenado exclusivamente con FineWeb-Edu) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 3,0 GB) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decodificador-only con hidden size 1152, 36 capas y 18 cabezas de atención, con longitud de contexto de 2048 tokens. Sobre esta base se añaden tres cabeceras de multi-token prediction en cascada estilo DeepSeek, de un bloque cada una. La innovación central del trabajo es el objetivo "soft MTP": cada cabecera MTP se entrena contra la distribución de siguiente token `q` del propio modelo en lugar del token realizado `e_y`, mediante un acoplamiento KL con straight-through estimator que cuesta una pasada hacia atrás adicional y no requiere softmax sobre el vocabulario. El vocabulario GPT-2 (50257 tokens) se rellena hasta 50304 por alineación, aunque las filas extra no se utilizan.

El entrenamiento se realizó sobre FineWeb-Edu tokenizado con GPT-2 BPE, con un total de 31,5 mil millones de tokens (60.000 pasos, batch de 256 secuencias de 2048 tokens). Se usó el optimizador Muon para las matrices ocultas 2D y AdamW para embeddings, cabezas y normalizaciones, con LR pico de 0,00125 con decaimiento coseno hasta 1e-05, 2.000 pasos de warmup, weight decay de 0,1 y precisión bf16 autocast sobre pesos maestros en fp32. Se ejecutó una única pasada por celda de la matriz de experimentos con seed 13; los doce checkpoints comparten seed, orden de datos y schedule, de modo que las diferencias entre ellos son atribuibles al objetivo de entrenamiento.

## Capacidades

- Generacion de texto en ingles basica, al nivel esperable de un modelo de 745M entrenado con 31,5B tokens de datos educativos filtrados.
- Decodificacion especulativa auto-especulativa: las cabeceras MTP pueden actuar como modelo borrador para acelerar la inferencia del propio modelo sin necesidad de un draft model externo.
- Prediccion multi-token en entrenamiento, que segun el paper mejora la calidad del modelo base frente a otros objetivos MTP.
- No hay evidencia de capacidades de razonamiento avanzado, codigo, matematicas, vision, audio ni tool calling; el modelo esta entrenado solo con texto general educativo.
- No hay soporte documentado de function calling, agentes ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigacion en multi-token prediction: base ideal para reproducir o extender los experimentos del paper "Multi-Token Prediction Done Right", gracias a que los doce checkpoints comparten receta de entrenamiento y son directamente comparables.
- Investigacion en decodificacion especulativa: las cabeceras MTP integradas permiten experimentar con auto-especulacion (self-speculative decoding) sin entrenar ni desplegar un modelo borrador separado.
- Baseline para estudios de escalado: al existir checkpoints en cuatro tamanos con tres objetivos distintos, sirve como punto de comparacion controlada para ablation studies en laboratorios academicos.
- Experimentacion con optimizador Muon: la receta de entrenamiento (Muon en matrices 2D + AdamW en el resto) esta documentada en el repo y es replicable para probar este optimizador en modelos pequenos.
- Prototipado ligero de pipelines de generacion de texto en ingles: con 745M de parametros, es manejable en GPUs de consumo para pruebas rapidas de integracion.
- Estudio de datos educativos filtrados: al entrenarse unicamente con FineWeb-Edu, es util para analizar el comportamiento de modelos pequenos entrenados con datasets de alta calidad educativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro benchmark; el valor del modelo radica en la comparacion controlada entre los doce checkpoints del estudio, cuyos resultados detallados se remiten al paper.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 3,0 GB en safetensors, lo que sugiere pesos en fp32 (~3 GB); en fp16/bf16 ocuparia aproximadamente 1,5 GB, mas overhead de activaciones. Con 4-6 GB de VRAM es suficiente para inferencia en fp32.
- GPUs recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente para inferencia; no se necesita hardware de centro de datos.
- Cabe comodamente en GPUs de consumo, incluso en portatiles con GPU dedicada modesta.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio, ya que la arquitectura `hf_mtp` se define en los ficheros del repo). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; la model card indica `inference: false` para la Inference API de Hugging Face. No hay versiones GGUF publicadas.
- Latencia y throughput: no disponible. La decodificacion especulativa con las cabeceras MTP podria mejorar el throughput, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Particularidad |
|---|---|---|---|---|---|
| JaydenTeoh/soft-mtp-689m-model | 745M | 2048 | FineWeb-Edu (31,5B tokens) | MIT | Cabeceras MTP "soft" para auto-especulacion |
| GPT-2 (774M) | 774M | 1024 | WebText (~40B tokens estimados) | MIT (pesos) | Mismo tokenizador; arquitectura NTP clasica sin MTP |
| Pythia-1B (EleutherAI) | ~1.012M | 2048 | The Pile (~300B tokens) | Apache 2.0 | Serie controlada para investigacion, sin MTP |
| Qwen2.5-0.5B | 494M | 32.768 | Dataset multimillonario multilingue | Apache 2.0 | Mucho mas capaz en benchmarks, pero no comparable en condiciones controladas |

La comparacion mas relevante es intra-estudio: los otros once checkpoints de la serie (tres objetivos x cuatro tamanos) comparten seed, datos y schedule con este modelo, por lo que constituyen la alternativa comparativa mas rigurosa. Frente a modelos de consumo generalistas como Qwen2.5-0.5B, este modelo esta claramente por detras en capacidades, pero su valor esta en la investigacion, no en el uso productivo.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: no es adecuado para castellano ni para ningun otro idioma distinto del ingles.
- Contexto corto de 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Modelo de investigacion entrenado con una sola pasada y un solo seed (13): los resultados pueden no ser estables entre reinicializaciones y no hay garantias de robustez.
- Riesgo de alucinacion alto, tipico de modelos pequenos entrenados con una unica epoca de datos generalistas; no hay alineacion con RLHF/DPO documentada, por lo que puede generar contenido ofensivo o incoherente sin filtros.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python arbitrario del repositorio: revisar los ficheros de modelado antes de usarlo en entornos sensibles.
- No hay soporte para cuantizacion documentado ni versiones GGUF, lo que limita las opciones de despliegue en CPU o edge.
- La licencia MIT es permisiva y permite uso comercial sin restricciones.
- Las cabeceras MTP se descartan en inferencia estandar: si no se usa la decodificacion especulativa, el modelo se comporta como un transformer NTP ordinario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/soft-mtp-689m-model
- Paper "Multi-Token Prediction Done Right" (arXiv:2610.38331): https://arxiv.org/abs/2610.38331
- Codigo (GitHub): https://github.com/JaydenTeoh/Soft-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador: https://huggingface.co/gpt2
