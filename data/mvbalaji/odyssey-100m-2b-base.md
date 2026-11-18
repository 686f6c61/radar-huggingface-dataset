# mvbalaji/ODYSSEY-100M-2B-BASE

## Resumen

ODYSSEY-100M-2B-BASE es un checkpoint intermedio de preentrenamiento de la familia ODYSSEY-100M, desarrollada por Balaji Venkateswaran. Se trata de un transformer decoder-only de 100.248.960 parametros entrenado desde cero sobre los primeros 2.000.027.648 tokens de un plan de entrenamiento de 5.000 millones de tokens (paso 15.259 de 38.147). El modelo final de la familia es ODYSSEY-100M-5B-BASE, que continuo exactamente desde este checkpoint con arquitectura, tokenizer, mezcla de datos y optimizador identicos.

El modelo es un base model puro de prediccion del siguiente token: no ha pasado por instruction tuning, RLHF ni ajuste de seguridad. Su interes es fundamentalmente de investigacion: permite estudiar el estado intermedio de un entrenamiento de un modelo pequeno (100M parametros) con receta reproducible en una sola GPU H100 de 80 GB, usando Muon para matrices ocultas y AdamW para embeddings y normalizaciones, con schedule coseno en bf16.

Con 1.024 tokens de contexto, vocabulario de 32.768 entradas y licencia Apache 2.0, esta pensado como artefacto de investigacion para analizar dinamicas de preentrenamiento, no como modelo de produccion. El propio autor advierte que alucina hechos con confianza, entra en bucles con decodificacion greedy en texto libre y falla en codigo y aritmetica mas alla de casos simples.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), 15 capas, d_model 640, SwiGLU 2.240, GQA 10 query / 2 KV heads, RoPE theta 10.000, RMSNorm, vocabulario tied de 32.768 |
| Parametros totales | 100.248.960 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (lenguaje natural); codigo y matematicas como dominios de datos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), con implementacion PyTorch standalone incluida (modeling_odyssey.py, example.py) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 15 capas con dimension oculta 640, feed-forward SwiGLU de 2.240 unidades intermedias, atencion con grouped-query attention (10 cabezas de query y 2 de key/value), embeddings rotatorios RoPE con theta 10.000, RMSNorm y embedding de tokens compartido con la proyeccion de salida (tied) sobre un vocabulario de 32.768 entradas. El tokenizer es `odyssey-32k`, un BPE byte-level con `<|pad|>`=0, `<|bos|>`=1 y `<|eos|>`=2, y sin BOS antepuesto por defecto.

El entrenamiento se realizo desde cero (sin pesos de ningun modelo profesor ni weight-space patching) en una unica H100 de 80 GB, usando Muon para las matrices ocultas y AdamW para embeddings y normalizaciones, con schedule coseno y precision bf16. Este checkpoint corresponde al paso 15.259 de 38.147, tras 2.000.027.648 tokens, con la tasa de aprendizaje no anelada a su minimo. La mezcla de datos es 65% FineWeb-Edu (sample-10BT), 20% FineMath (finemath-4plus) y 15% codigo con licencia permisiva de codeparrot/github-code-clean (sin HTML/CSS), con decontaminacion por 13-gramas contra benchmarks comunes. El modelo final de la familia, ODYSSEY-100M-5B-BASE, completa los 5.000 millones de tokens.

## Capacidades

- Generacion de texto autoregresiva en ingles mediante prediccion del siguiente token.
- Modelado de lenguaje general, matematicas y codigo (los tres dominios de la mezcla de entrenamiento).
- Completado de texto y cloze factual a nivel basico (probado de forma exploratoria con muestra pequena).
- No soporta tool calling ni function calling: es un base model sin plantilla de instrucciones.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- Multilingue limitado: solo ingles para lenguaje natural.
- Sin modo thinking, vision ni audio.
- Contexto maximo de 1.024 tokens; posiciones superiores provocan error.

## Casos de uso

- Investigacion sobre dinamicas de preentrenamiento: comparar este checkpoint intermedio (2B tokens) con el final (5B tokens) de la misma familia para estudiar la evolucion de la NLL por dominio (general, matematicas, codigo) a lo largo del schedule.
- Reproduccion de recetas de entrenamiento: servir como referencia para validar pipelines con Muon + AdamW, schedule coseno y bf16 en una sola GPU, dado que el autor documenta la configuracion completa.
- Experimentos de scaling laws en modelos pequenos: al tener checkpoints de 2B y 5B tokens con arquitectura y datos identicos, permite aislar el efecto del numero de tokens vistos.
- Analisis de tokenizers: el tokenizer `odyssey-32k` y sus NLL especificas permiten estudiar el impacto del vocabulario en el modelado de dominios concretos.
- Docencia y demostraciones de arquitecturas transformer: la implementacion standalone en PyTorch (`modeling_odyssey.py`) sin dependencia de `transformers` facilita explicar GQA, RoPE, SwiGLU y RMSNorm en un modelo de 100M parametros.
- Pruebas de infraestructura de inferencia: por su tamano reducido cabe en GPUs consumer y sirve para validar pipelines de generacion, aunque no para tareas que requieran respuestas correctas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta NLL por dominio (especificas del tokenizer, no comparables con otros modelos) y sondas exploratorias con muestra pequena:

| Metrica | Resultado |
|---|---|
| NLL dev, general | 3,276 |
| NLL dev, matematicas | 2,180 |
| NLL dev, codigo | 1,800 |
| NLL sealed final-confirmation, general | 3,381 |
| NLL sealed final-confirmation, matematicas | 2,636 |
| NLL sealed final-confirmation, codigo | 1,780 |
| Cloze factual (azar 0,25) | 0,80 |
| Completado de sentido comun | 0,92 |
| Aritmetica de un digito, 3-shot | 0,05 |
| Funciones Python que pasan tests | 1/16 |

El modelo de 5B tokens de la misma familia es 0,25-0,30 nats mejor en todos los dominios.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 0,4 GB (repo de 0,4 GB), por lo que cabe holgadamente en cualquier GPU con 2 GB o mas; en fp32 seria del orden de 0,4-0,8 GB.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizo en una H100 80 GB, pero la inferencia es viable en RTX 3060, RTX 4090, A100, etc.
- Cabe en GPU consumer: si, con margen amplio en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: el modelo no es una clase de `transformers`; requiere la implementacion standalone incluida (`modeling_odyssey.py`, `example.py`) con `torch`, `safetensors`, `tokenizers` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ODYSSEY-100M-2B-BASE | 100,2M | 1.024 | 2B tokens (intermedio de 5B) | Apache 2.0 | Hugging Face, implementacion propia |
| ODYSSEY-100M-5B-BASE | 100,2M | 1.024 | 5B tokens (final) | Apache 2.0 | Hugging Face, misma familia |
| Alternativas de ~100M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Artefacto de investigacion de 100M parametros: alucina hechos con confianza y no debe usarse para respuestas que requieran correccion (medico, legal, financiero, seguridad o uso factual).
- Entra en bucles con decodificacion greedy en texto libre; el autor recomienda muestreo con temperatura.
- Falla de forma mayoritaria en codigo y en aritmetica mas alla de casos simples (1/16 funciones Python pasan tests; 0,05 en aritmetica 3-shot).
- Sin ajuste de seguridad ni RLHF: puede reproducir texto danino o sesgado presente en datos web.
- Solo ingles para lenguaje natural y contexto limitado a 1.024 tokens; posiciones superiores generan error.
- Es un checkpoint intermedio con la tasa de aprendizaje no anelada, por lo que su calidad es inferior a la del modelo final de la familia.
- Licencia Apache 2.0 para pesos y codigo; los datos de entrenamiento tienen sus propias atribuciones (FineWeb-Edu y FineMath bajo ODC-By 1.0, codigo solo con licencias permisivas).
- No hay soporte documentado para motores de inferencia estandar (vLLM, llama.cpp, TGI), lo que limita su integracion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvbalaji/ODYSSEY-100M-2B-BASE
- Modelo final de la familia: https://huggingface.co/mvbalaji/ODYSSEY-100M-5B-BASE
- SFT V1: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V1
- SFT V2: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V2
- Experimental P7-C1: https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C1-DIVERSE-SFT
- Experimental P7-C2: https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C2-MATCHED-SFT
- Experimental P7-C3: https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C3-RL
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
