# bizmod/Datlas-2.5

## Resumen

Datlas 2.5 es un modelo de lenguaje causal desarrollado por el usuario `bizmod` en Hugging Face, concebido como el modelo local de un stack de agentes web-RAG llamado Atlas Autopilot. El repositorio combina un checkpoint real entrenado desde cero (from-scratch, sin pesos preentrenados) con una arquitectura con forma Qwen2 de solo 72,4 millones de parámetros, y una serie de especificaciones y scripts para escalar el modelo a 5B y 10B parámetros, cuyos pesos todavía no existen.

Es importante destacar que, pese al tag "10b-architecture", los pesos publicados y utilizables son los del checkpoint de 72M, entrenado durante 300 pasos en una Tesla T4 sobre el corpus `BlueIsGreen/Edge-Agent-Reasoning-WebSearch-260K` (263.098 filas de razonamiento de agente con búsqueda web). El loss bajó de 12,00 a 4,98, lo que indica un entrenamiento muy preliminar, insuficiente para un uso generalista. Su relevancia actual es más como proyecto educativo y plantilla de escalado (incluye rutas de depth up-scaling estilo LLaMA Pro/SOLAR y QLoRA) que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con forma Qwen2 (decoder-only) |
| Parametros totales | 72.410.880 (checkpoint publicado); arquitectura objetivo 10B: 10.001.414.144 (sin pesos) |
| Parametros activos | no disponible (no es MoE; los 72M son densos) |
| Longitud de contexto | 256 tokens (checkpoint 72M); 4096 tokens en las configuraciones 5B y 10B |
| Tipos de cuantizacion | no disponible para el checkpoint; el script Kaggle para la ruta 5B usa NF4 de 4 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (289 MB) |

## Arquitectura y entrenamiento

El checkpoint publicado es un transformer decoder-only con forma Qwen2 de 8 capas, dimensión oculta 384, FFN de 1024, embeddings atados (tied embeddings) y contexto de 256 tokens. Se inicializó aleatoriamente (from-scratch, sin cargar pesos preentrenados) y se entrenó en un notebook de Kaggle sobre una Tesla T4.

El entrenamiento usó el corpus `BlueIsGreen/Edge-Agent-Reasoning-WebSearch-260K` (263.098 filas con campos `user_prompt` / `agent_reasoning` y metadatos de `role`, `industry` y `os`), en streaming y barajado con semilla 42, aplicando máscara de pérdida sobre los tokens del prompt (−100). Se ejecutaron 300 pasos de optimización con micro-batch 4 × 256 tokens, optimizador AdamW (LR pico 6e-4 con OneCycleLR, weight decay 0,1, betas 0,9/0,95) y grad clip 1,0. El loss pasó de 12,0018 a 4,9834 (mínimo 2,6563). No hay evidencia de RLHF ni DPO.

El repositorio incluye además la especificación de la arquitectura objetivo de 10B (43 capas, d=4096, FFN 14336, 32 cabezas de atención / 8 KV con GQA, contexto 4096, vocabulario 151.936) y dos rutas documentadas para llegar a ~5B: una from-scratch (4.896.473.088 parámetros, 44 capas, d=3072) y otra por depth up-scaling sobre Qwen2.5-3B duplicando 24 bloques decoder hasta 60 capas (4.939.213.824 parámetros), estilo LLaMA Pro/SOLAR. Ninguna de estas rutas tiene pesos publicados.

## Capacidades

- Generacion de texto conversacional en ingles mediante chat template (roles user/assistant).
- Entrenado sobre datos de razonamiento de agente con busqueda web (web-RAG), por lo que su distribucion de entrenamiento esta centrada en respuestas tipo agente.
- Contexto de solo 256 tokens en el checkpoint publicado, lo que limita severamente conversaciones multi-turno y documentos largos.
- No hay soporte demostrado de tool calling, function calling, vision ni audio.
- No hay evidencia de capacidades de codigo, matematicas ni razonamiento general: el entrenamiento (300 pasos, 72M parametros desde cero) es insuficiente para ellas.
- El repositorio aporta scripts de entrenamiento reproducibles (streaming parquet, prompt-masked loss, OneCycleLR, FSDP/ZeRO-3 para la escala 10B), utiles como base para proyectos propios.

## Casos de uso

- Investigacion educativa sobre entrenamiento from-scratch: el checkpoint de 72M y sus scripts de Kaggle permiten reproducir un ciclo completo de entrenamiento de un LM pequeño con presupuesto minimo (una T4 de 16 GB).
- Prototipado de agentes web-RAG en edge: el modelo esta especializado (por datos) en respuestas de razonamiento de agente, util como punto de partida experimental para pipelines de agente local, aunque con calidad muy limitada.
- Plantilla de escalado con depth up-scaling: los scripts `build_datlas_5b_upscale.py` y `train_datlas_5b.py` sirven como receta practica para escalar Qwen2.5-3B a ~5B duplicando bloques, tecnica LLaMA Pro/SOLAR.
- Continuo preentrenamiento con QLoRA en GPU de consumo: la ruta B en 4-bit NF4 (2,7 GB) con LoRA permite seguir entrenando un modelo de 5B en una sola GPU de 16 GB sobre el corpus de razonamiento de agente.
- Estudio de presupuestos de hardware y datos: `DATLAS_10B_SPEC.md` documenta el coste real de entrenar 10B desde cero (8×A100-80GB o 4×H100-80GB, ~2-3 T tokens), util para planificar proyectos similares.
- Base para fine-tuning de dominio: el formato de datos con metadatos de rol, industria y sistema operativo permite experimentos de especializacion por dominio sobre el mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento de entrenamiento es el loss: 12,0018 inicial → 4,9834 final (minimo 2,6563) en 300 pasos, un valor alto que refleja un modelo barely entrenado.

## Requisitos de hardware

- Checkpoint 72M en fp32/safetensors: 289 MB, inferible en CPU o en cualquier GPU moderna sin problema; no requiere VRAM significativa (por debajo de 1 GB incluso con margen).
- Arquitectura 10B (si se entrenara): 20,4 GB en bf16 solo de pesos, mas ~80 GB de estado AdamW; entrenamiento minimo 8×A100-80GB o 4×H100-80GB con FSDP/ZeRO-3. Para inferencia de un hipotetico 10B en bf16 bastaria una GPU de 24 GB (RTX 4090) o superior.
- Ruta 5B con QLoRA NF4: 2,7 GB de pesos cuantizados mas LoRA, entrenable en una unica GPU de 16 GB (Kaggle T4).
- Despliegue: compatible con la libreria `transformers` de Hugging Face (ejemplo incluido en la model card); no hay menciones a vLLM, llama.cpp, Ollama ni TGI, aunque al ser arquitectura Qwen2 y estar en safetensors, la carga estandar con `AutoModelForCausalLM` esta soportada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Datlas 2.5 (checkpoint real) | 72,4M | 256 | Apache 2.0 | From-scratch, 300 pasos, entrenamiento muy preliminar |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Apache 2.0 / Qwen (comercial >100M MAU) | Preentrenado a gran escala, mucho mas capaz |
| SmolLM2-135M-Instruct | ~135M | 8.192 | Apache 2.0 | Modelo edge preentrenado con ~1,8-11 T tokens, referencia realista para edge AI |
| Qwen2.5-3B (base para la ruta DUS) | ~3.000M | 32.768 | Qwen Research | Base preentrenada usada en la ruta de escalado a 5B del propio repo |

En terminos practicos, el checkpoint de Datlas 2.5 queda muy por detras de cualquier modelo edge preentrenado de tamano comparable (SmolLM2-135M, Qwen2.5-0.5B), dado su entrenamiento minimo y contexto de 256 tokens.

## Limitaciones y advertencias

- El nombre y el tag "10b-architecture" pueden inducir a error: los pesos publicados son de 72,4M parametros; los pesos de 5B y 10B no existen en el repositorio.
- Calidad de generacion muy baja: 300 pasos de entrenamiento desde inicializacion aleatoria y loss final de ~4,98 implican salidas poco coherentes; no apto para produccion.
- Contexto de solo 256 tokens en el checkpoint real, insuficiente para RAG, conversaciones largas o documentos.
- Entrenado unicamente en ingles; no hay soporte de otros idiomas, incluido el castellano.
- Riesgo de alucinacion elevado y no cuantificado; no hay evaluaciones ni benchmarks publicados.
- Licencia Apache 2.0 sin restricciones de uso comercial, pero la calidad del modelo limita su aplicacion practica.
- La especializacion en el corpus de razonamiento de agente (260K filas, ~692M tokens) es insuficiente incluso como modelo de dominio segun el propio autor, que recomienda QLoRA sobre una base preentrenada si se busca un modelo util hoy.
- Sesgos: heredados del corpus `Edge-Agent-Reasoning-WebSearch-260K`, cuya composicion y sesgos no estan documentados en detalle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bizmod/Datlas-2.5
- Dataset de entrenamiento: https://huggingface.co/datasets/BlueIsGreen/Edge-Agent-Reasoning-WebSearch-260K
- Perfil del autor: https://huggingface.co/bizmod
- Paper, demo y repositorio adicional: no disponible
