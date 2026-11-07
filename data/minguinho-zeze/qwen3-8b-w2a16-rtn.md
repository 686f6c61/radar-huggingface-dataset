# Minguinho-zeze/Qwen3-8B-W2A16-RTN

## Resumen

Qwen3-8B-W2A16-RTN es un checkpoint experimental de cuantizacion post-entrenamiento del modelo Qwen3-8B de Alibaba Qwen, publicado por el usuario Minguinho-zeze como parte del proyecto de investigacion lowbit-reasoning-ptq. El modelo aplica cuantizacion de pesos simetrica a INT2 (W2A16, con activaciones sin cuantizar en 16 bits) mediante el algoritmo RTN (Round-To-Nearest) con tamano de grupo 128, sin calibracion ni entrenamiento adicional. El objetivo declarado no es ofrecer un modelo util, sino reproducir e investigar un fallo de razonamiento en regimen de muy bajo bit.

La relevancia de esta ficha es fundamentalmente negativa y metodologica: el propio autor documenta un colapso severo de precision, con 0,00% en AIME-120 y 0,00% en GPQA Diamond frente al 71,39% y 61,11% del Qwen3-8B en BF16 bajo el mismo protocolo. Se trata, por tanto, de un artefacto de investigacion para diagnosticar por que la cuantizacion a 2 bits destruye la capacidad de razonamiento, no de un modelo desplegable en produccion.

El checkpoint conserva la arquitectura del Qwen3-8B original (transformer denso de aproximadamente 8.190 millones de parametros, con contexto nativo de 32.768 tokens y modo thinking), pero con el 84,8% de los parametros cuantizados a INT2. El repositorio ocupa 4,3 GB en formato safetensors con compressed-tensors, y solo se ha validado con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (nativo del base); el ejemplo de carga usa max_model_len=34.816 |
| Tipos de cuantizacion | W2A16: pesos INT2 simetricos, activaciones 16 bits, group size 128, algoritmo RTN; embedding, normalizacion y lm_head sin cuantizar; KV cache en BF16 durante la evaluacion |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-8B: un transformer denso de aproximadamente 8.190 millones de parametros con atencion por cabezas agrupadas (GQA) y soporte nativo de modo thinking, segun la documentacion del modelo base. No se ha modificado la topologia: la intervencion se limita a la cuantizacion de pesos.

El proceso de cuantizacion es weight-only y no requiere calibracion: RTN simetrico a INT2 con tamano de grupo 128, manteniendo activaciones en 16 bits (W2A16). El 84,800291% de los parametros quedan cuantizados; las capas de embedding, normalizacion y lm_head se preservan en precision original. No hubo entrenamiento adicional ni ajuste fino posterior a la cuantizacion. La receta exacta y los metadatos estan en `recipe.yaml`, `quant_meta.json` y `config.json` del repositorio. El autor incluye diagnosticos de ruta de referencia y de kernels comprimidos en `diagnostics/`, aunque advierte que no establecen la causa del fallo ni garantizan la correccion de los kernels en distintas longitudes de secuencia y tamanos de batch.

## Capacidades

- Generacion de texto y conversacion multi-turno: teoricamente heredadas del Qwen3-8B, pero en la practica inutilizables por el colapso de precision documentado.
- Razonamiento en modo thinking: el modo esta disponible en el chat template (`enable_thinking=True`), pero la evaluacion con thinking activado arroja 0,00% de acierto.
- Codigo y matematicas: capacidades del base no verificadas en este checkpoint; los resultados en AIME-120 desaconsejan cualquier uso.
- Tool calling y function calling: no documentado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el fallo en razonamiento hace inviable su uso.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales: ninguna propia; conserva el chat template de Qwen3 con modo thinking.

## Casos de uso

- Reproduccion de experimentos de cuantizacion extrema: sirve para replicar el pipeline W2A16 con RTN sobre Qwen3-8B y comparar resultados con otras recetas de cuantizacion a 2 bits.
- Diagnostico de kernels INT2: los ficheros de `diagnostics/` permiten analizar el comportamiento de kernels comprimidos (humming-kernels 0.1.17) en GPUs Blackwell.
- Estudio de colapso de razonamiento: util como caso negativo de referencia para investigar por que la cuantizacion a 2 bits destruye cadenas de razonamiento largas.
- Validacion de infraestructura vLLM: permite probar la ruta de carga de compressed-tensors con vLLM 0.32.0 y configuraciones de memoria concretas.
- Benchmarking de metodologias PTQ: punto de comparacion para evaluar tecnicas alternativas (GPTQ, AWQ, cuantizacion mixta) frente a RTN puro a 2 bits.
- Docencia e investigacion academica: ejemplo documentado de buenas practicas de reporte de fallos, con seeds, truncamiento y velocidad incluidos en el repositorio de informes.
- No recomendado para atencion al cliente, generacion de codigo en produccion, agentes ni ninguna aplicacion real: el propio autor lo desaconseja explicitamente.

## Benchmarks y rendimiento

Evaluacion en porcentaje de acierto, media sobre seeds 0, 1 y 2; cada seed evalua 120 preguntas AIME y 198 de GPQA Diamond. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Qwen3-8B-W2A16-RTN | 0,00 | 0,00 |

Las ejecuciones se realizaron en GPUs RTX 5090 y RTX PRO 4500 Blackwell. El autor advierte que estas cifras describen su protocolo y no son puntuaciones oficiales de Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 4,3 GB en safetensors; con overhead de activaciones en 16 bits, KV cache en BF16 y contexto de 32.768 tokens, el consumo real es considerablemente mayor. El ejemplo oficial usa `gpu_memory_utilization=0.90` y `max_model_len=34816`.
- GPUs recomendadas: el release solo se ha validado en GPUs Blackwell (RTX 5090, RTX PRO 4500). Otros modelos de GPU no han sido validados.
- GPU de consumo: cabe en RTX 5090 segun la evaluacion del autor; en generaciones anteriores (RTX 4090, etc.) no hay validacion publicada.
- Opciones de despliegue: exclusivamente vLLM 0.32.0 con compressed-tensors 0.17.0, PyTorch 2.13.0 y Transformers 5.17.0. Los kernels INT2 requieren humming-kernels 0.1.17 con compilacion JIT NVRTC y la ruta de la libreria CUDA NVRTC anadida a `LD_LIBRARY_PATH`. No hay soporte GGUF, llama.cpp, Ollama ni TGI documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque el repositorio de informes del autor incluye metricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-8B-W2A16-RTN | 8,19B | 32.768 | W2A16 (INT2 pesos) | Apache-2.0 | Checkpoint de investigacion con precision 0,00% en AIME/GPQA |
| Qwen/Qwen3-8B | 8B | 32.768 | BF16 | Apache-2.0 | Modelo base de referencia, 71,39% AIME-120 y 61,11% GPQA |
| Alternativas PTQ de 2 bits sobre Qwen3-8B | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada |

La comparacion relevante es exclusivamente contra el modelo base: cualquier otra receta de cuantizacion a 2 bits sobre Qwen3-8B no aparece documentada en la informacion disponible.

## Limitaciones y advertencias

- Colapso de precision severo: 0,00% en AIME-120 y GPQA Diamond bajo el protocolo del autor. No es apto para inferencia practica.
- El autor lo describe explicitamente como research checkpoint y desaconseja su uso en produccion.
- La causa del fallo no esta establecida; los diagnosticos incluidos no la determinan ni garantizan la correccion de los kernels.
- Validacion limitada a vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y GPUs Blackwell; otras combinaciones no han sido probadas.
- Riesgo de alucinacion: no evaluado de forma independiente, pero el fallo de razonamiento implica salidas no fiables en cualquier tarea.
- Sesgos: no documentados para este checkpoint; heredaria los del Qwen3-8B base, no analizados aqui.
- Idiomas soportados no declarados en la model card.
- Licencia Apache-2.0 heredada del base, con el texto incluido en `LICENSE`; el uso comercial es legalmente posible pero tecnicamente inviable por la precision.
- El ejemplo de carga del README no ha sido reejecutado desde el repositorio subido, segun el propio autor.
- Las versiones del cuantizador y del runtime de compressed-tensors difieren y se conservan tal cual, sin asumir equivalencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-W2A16-RTN
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Informe de la ejecucion qwen3-8b-20261107: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Codigo del motor de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Commit de procedencia: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Ficha de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
