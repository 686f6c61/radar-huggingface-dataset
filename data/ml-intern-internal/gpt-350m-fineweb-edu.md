# ml-intern-internal/gpt-350m-fineweb-edu

## Resumen

gpt-350m-fineweb-edu es un modelo de lenguaje tipo GPT de aproximadamente 355 millones de parámetros, publicado por la organizacion ml-intern-internal, disenado para ser entrenado desde cero sobre el corpus educativo HuggingFaceFW/fineweb-edu (1,3 billones de tokens de web filtrada por calidad educativa, descrito en el paper arXiv:2406.17557). El repositorio documenta la arquitectura y el pipeline de preentrenamiento completo, pero el propio autor indica de forma explicita que el modelo no ha sido entrenado: el envio del job de entrenamiento devolvio un error 403 por falta de permisos de Jobs en la cuenta.

Se trata, por tanto, de una plantilla reproducible de preentrenamiento mas que de un modelo listo para inferencia. La relevancia actual es metodologica: sirve como referencia minima y verificable para experimentar con recetas de preentrenamiento a escala pequena (tokenizador GPT-2, contexto de 2048 tokens, AdamW fusionado, bf16 con atencion flash via `scaled_dot_product_attention`) y para estimar costes de un run completo de 20B tokens, que el autor cifra en 6·N·D ≈ 4,2e19 FLOPs y entre 110 y 160 dolares sobre 8×H200.

Al no existir pesos entrenados, cualquier evaluacion de capacidades, benchmarks o calidad de generacion es imposible en el momento de redactar esta ficha. Los datos que siguen proceden unicamente de la configuracion declarada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (detalles internos no disponibles) |
| Parametros totales | ~355M (embeddings atados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no hay pesos publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se han publicado pesos; solo script de entrenamiento) |
| Capas / hidden / cabezas | 24 / 1024 / 16 |
| Tokenizador | GPT-2, vocabulario de 50.257 tokens |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu, config `sample-10BT`, en streaming |
| Precision de entrenamiento | bf16 autocast |
| Optimizador | AdamW fusionado, lr 3e-4, warmup lineal 100 pasos, decaimiento coseno al 10 %, weight decay 0,1, grad clip 1,0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT con 24 capas, dimension oculta de 1024 y 16 cabezas de atencion, con embeddings de entrada y salida atados, lo que da el total de ~355M parametros. El tokenizador es el de GPT-2 (50.257 tokens) y el contexto maximo es de 2048 tokens. La atencion se implementa con `scaled_dot_product_attention` de PyTorch, sin compilacion de flash-attn, y el entrenamiento se ejecuta con autocast en bf16.

El pipeline de datos usa fineweb-edu en la configuracion `sample-10BT`, leida en modo streaming y empaquetada en bloques de 2048 tokens separados por EOS. El autor describe dos regimenes de entrenamiento: un smoke run de ~500 pasos sobre una instancia a10g-large con logs a un dashboard de Trackio, y un run completo de 20B tokens (alineado con Chinchilla para este tamano) que requiere aproximadamente 1,5 millones de pasos con batch 8, o menos pasos con un batch mayor sobre 8×H200. No se documenta ninguna fase de RLHF, DPO ni ajuste fino supervisado; es exclusivamente preentrenamiento. Tampoco se detalla la composicion exacta del dataset mas alla de la referencia a fineweb-edu, ni el numero real de tokens vistos por el modelo, ya que el entrenamiento no llego a ejecutarse.

## Capacidades

- No hay capacidades verificables: el modelo no ha sido entrenado y no se han publicado pesos.
- Se espera, por diseno, generacion de texto autoregresiva en el estilo de un GPT pequeno, pero sin evidencia empirica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el tokenizador GPT-2 esta orientado predominantemente al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- El artefacto realmente utilizable del repositorio es el script `pretrain.py` y la receta de entrenamiento, no el modelo en si.

## Casos de uso

- Reproduccion de experimentos de preentrenamiento a escala pequena: el script permite lanzar un smoke run de 500 pasos en una a10g-large para validar pipelines de datos, logging y checkpoints antes de escalar a runs mayores.
- Docencia y formacion en entrenamiento de LLM: la configuracion explicita (24 capas, 1024 de hidden, 16 cabezas, AdamW con warmup y decaimiento coseno) sirve como ejemplo canonico de receta Chinchilla para ~350M parametros.
- Estimacion de costes de computo: el autor proporciona el calculo 6·N·D ≈ 4,2e19 FLOPs y un rango de 110-160 dolares en 8×H200, util para planificar presupuestos de preentrenamiento.
- Base para ablaciones de datos: al usar fineweb-edu en streaming con empaquetado a 2048 tokens, permite comparar configuraciones de dataset (por ejemplo, `sample-10BT` frente a otros subconjuntos) manteniendo fija la arquitectura.
- Punto de partida para ajuste fino posterior: si se completa el run de 20B tokens, el checkpoint resultante podria servir como base para SFT o DPO en tareas concretas, aunque hoy no existe tal checkpoint.
- Integracion en pipelines de CI para validar infraestructura: el comando `HF_TOKEN=... uv run pretrain.py --max_steps 500 --push` puede incorporarse como test de humo en un flujo de MLOps para comprobar acceso a GPU, permisos de Hugging Face y publicacion de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido entrenado, por lo que no existen evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable, no hay pesos publicados. Como referencia teorica, un modelo de 355M parametros en bf16 ocuparia aproximadamente 0,7 GB de pesos, y en fp32 unos 1,4 GB, mas el coste del KV cache para 2048 tokens de contexto.
- GPU recomendadas para entrenamiento: el autor cita a10g-large para el smoke run y 8×H200 para el run completo de 20B tokens.
- Cabe en GPU de consumo: si se publicaran pesos en bf16 o cuantizados, un modelo de este tamano cabria con holgura en cualquier GPU consumer con 8 GB o mas, pero esto es una estimacion, no un dato verificado.
- Opciones de despliegue: no disponible; no hay artefactos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| gpt-350m-fineweb-edu | ~355M | 2048 | No entrenado | Apache 2.0 | No (solo script) |
| GPT-2 small (OpenAI) | 124M | 1024 | Entrenado | MIT | Si |
| GPT-2 medium (OpenAI) | 355M | 1024 | Entrenado | MIT | Si |
| Pythia-410M (EleutherAI) | 410M | 2048 | Entrenado | Apache 2.0 | Si |

La comparacion es estructural: GPT-2 medium coincide en orden de magnitud de parametros, y Pythia-410M es el equivalente mas cercano en filosofia (preentrenamiento reproducible desde cero, licencia permisiva, contexto de 2048). La diferencia critica es que ambos tienen pesos entrenados y evaluaciones publicadas, mientras que gpt-350m-fineweb-edu no. No se dispone de datos de rendimiento del modelo analizado para comparar cifras.

## Limitaciones y advertencias

- El modelo no ha sido entrenado: el autor lo declara explicitamente y atribuye el fallo a un error 403 por falta de permisos de Jobs.
- No existen pesos publicados, por lo que no puede ejecutarse inferencia ni evaluarse calidad, sesgos o alucinacion.
- La model card no documenta la composicion exacta de fineweb-edu mas alla de la referencia al paper; no se detalla el numero efectivo de tokens vistos ni la mezcla final.
- El tokenizador GPT-2 y el corpus fineweb-edu estan orientados al ingles; no se declaran idiomas soportados y el rendimiento en castellano seria previsiblemente bajo incluso tras entrenar.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Aunque la licencia es Apache 2.0, al no haber pesos el uso comercial del modelo es hoy imposible; la licencia solo cubriria los artefactos publicados (script y configuracion).
- El coste estimado de 110-160 dolares para el run completo es una proyeccion del autor basada en 6·N·D, no una medicion empirica.
- No hay informacion sobre sesgos, filtros de seguridad ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ml-intern-internal/gpt-350m-fineweb-edu
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de fineweb-edu: https://arxiv.org/abs/2406.17557
- Interfaz ML Intern (construccion del modelo): https://hf.co/chat?mode=ml-intern
