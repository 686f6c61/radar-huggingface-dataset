# kiplingliu/akg-sft-qwen3-1.7b

## Resumen

akg-sft-qwen3-1.7b es un ajuste fino (SFT, *supervised fine-tuning*) del modelo Qwen/Qwen3-1.7B publicado por el usuario kiplingliu en Hugging Face. Se trata de un modelo de generacion de texto de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) construido sobre la arquitectura transformer densa de la familia Qwen3, distribuido en formato safetensors y con licencia Apache 2.0.

El modelo se ha entrenado con la libreria Transformers 4.57.6 y el Trainer de Hugging Face, con un regimen de 2 epocas, learning rate de 1e-05, batch efectivo de 16 (batch 1 con 16 pasos de acumulacion de gradiente) y scheduler coseno con warmup del 3 %. La model card es la generada automaticamente por el Trainer y no documenta el dataset de entrenamiento, los datos de evaluacion ni los usos previstos, por lo que la informacion disponible sobre el proposito concreto del ajuste es practicamente nula.

Su relevancia es limitada y de nicho: se trata de un experimento de ajuste fino de un modelo pequeno de la familia Qwen3, con 156 descargas y ningun *like* en el momento de la consulta. Resulta util como referencia para quien quiera reproducir el proceso de SFT sobre Qwen3-1.7B o comparar el comportamiento del modelo base frente a una version ajustada, pero no dispone de benchmarks publicados ni de documentacion que respalde su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); detalles exactos no disponibles |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo base Qwen3-1.7B admite cuantizaciones habituales como GGUF/AWQ, pero no se confirma para este ajuste) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3-1.7B, un transformer denso de aproximadamente 1,7 mil millones de parametros. No se dispone de informacion adicional sobre la configuracion de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de tokenizacion especifica de este ajuste, mas alla de lo que corresponde al modelo base.

El entrenamiento se realizo con el Trainer de Hugging Face sobre un dataset no especificado ("unknown dataset" segun la model card). Los hiperparametros documentados son: learning rate 1e-05, train_batch_size 1, eval_batch_size 8, gradient_accumulation_steps 16 (batch efectivo 16), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08 en variante *fused*, scheduler coseno con warmup ratio 0.03, semilla 0 y 2 epocas. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores. Las versiones de framework empleadas fueron Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` sugiere un ajuste orientado a dialogos de tipo chat.
- Razonamiento y codigo: capacidades heredadas del modelo base Qwen3-1.7B, aunque no se documenta su preservacion tras el ajuste.
- Tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta especificado).
- Capacidades especiales (modo thinking, vision, audio): no documentadas para este ajuste.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse como endpoint compatible con text-generation-inference (tag `endpoints_compatible`) para validar flujos de chat en entornos de desarrollo con recursos limitados, dado su tamano de 1,7 B de parametros.
- Experimentacion academica con SFT: sirve como referencia reproducible para estudiar el efecto del ajuste fino supervisado sobre Qwen3-1.7B con los hiperparametros documentados (lr 1e-05, 2 epocas, batch efectivo 16).
- Comparacion base vs. ajustado: util para evaluar si un ajuste ligero sobre un modelo pequeno altera el comportamiento conversacional respecto al modelo original.
- Generacion de texto en local: al tratarse de un modelo de 1,7 B, puede ejecutarse en hardware de consumo si se dispone de cuantizacion adecuada, aunque esta no se documenta en el repositorio.
- Base para ajustes posteriores: punto de partida para tecnicas como DPO o RLHF sobre un modelo ya sometido a SFT.
- Investigacion sobre calidad de datos de instruccion: permite analizar como un dataset no documentado afecta a las respuestas del modelo base, siempre que se reconstruya el pipeline de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara una lista de resultados vacia (`results: []`), por lo que no existen metricas oficiales de MMLU, HumanEval, GSM8K ni de ninguna otra tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 6-8 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,7-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100). En cuantizacion 4 bits cabe en GPUs de 4-6 GB.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer modernas con cuantizacion o incluso en fp16 con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `endpoints_compatible`), y previsiblemente llama.cpp/Ollama/vLLM si se generan cuantizaciones GGUF/AWQ, aunque no se confirma en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akg-sft-qwen3-1.7b | 1,72 B | No disponible | No | Apache 2.0 | Hugging Face (156 descargas) |
| Qwen/Qwen3-1.7B (base) | ~1,7 B | No disponible en esta ficha | Si, en su model card oficial | Apache 2.0 | Hugging Face |
| Llama 3.2 1B Instruct | ~1,2 B | 128 K (segun model card oficial) | Si | Llama 3.2 Community License | Hugging Face / Meta |
| Gemma 2 2B Instruct | ~2,6 B | 8 K (segun model card oficial) | Si | Gemma Terms of Use | Hugging Face / Google |

La comparativa con el modelo base Qwen3-1.7B es la mas directa: este ajuste no documenta mejoras medibles ni benchmarks que justifiquen su uso frente al original. Frente a Llama 3.2 1B y Gemma 2 2B, las alternativas cuentan con documentacion oficial, benchmarks publicados y comunidades mas amplias, aunque con licencias mas restrictivas que Apache 2.0.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la generada automaticamente por el Trainer y no describe dataset, usos previstos, evaluacion ni limitaciones.
- Sin benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea; podria incluso degradar capacidades previas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; sin evaluacion no puede cuantificarse.
- Sesgos: no documentados; el dataset de entrenamiento es desconocido, por lo que no puede auditarse la composicion ni los sesgos introducidos.
- Idiomas: el campo de idiomas no esta especificado; no puede garantizarse un rendimiento multilingue concreto.
- Contexto: la longitud de contexto no esta documentada para este ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base Qwen3-1.7B y de los datos de entrenamiento (desconocidos) antes de un despliegue en produccion.
- Madurez: 156 descargas y 0 likes indican un modelo practicamente sin validacion por parte de la comunidad; no es recomendable para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiplingliu/akg-sft-qwen3-1.7b
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
