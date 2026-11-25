# OzzyGT/Kimodo_SOMA_RP_v1_2_sdnq_dynamic_4bit

## Resumen

Kimodo SOMA RP v1.2 SDNQ Dynamic 4bit es una versión cuantizada a 4 bits del modelo de generación de movimiento a partir de texto Kimodo SOMA RP v1.2 de NVIDIA, publicada por el usuario OzzyGT. El modelo original es una conversión a Diffusers del checkpoint de NVIDIA, y esta variante aplica cuantización dinámica de 4 bits mediante la librería SDNQ sobre el codificador de texto Llama 3 / LLM2Vec y sobre el transformer de movimiento, manteniendo el adaptador LoRA supervisado de LLM2Vec en float32 y el códec de movimiento sin cambios.

El modelo resuelve la tarea text-to-motion: dado un prompt en inglés, genera secuencias de movimiento esquelético en formato SOMA77 con root motion preservado, a 30 FPS y en metros con convención +Y arriba y +Z adelante inicial. Con 151.554.435 parámetros totales, el objetivo principal de esta versión es reducir el peso del repositorio de 16 GB a 5,0 GB (5,3 GB en disco) para facilitar su despliegue en hardware con VRAM limitada.

Es relevante ahora porque permite ejecutar un pipeline de generación de movimiento en GPUs de consumo con un pico de VRAM de 5,2 GiB, a costa de perder reproducibilidad exacta respecto a bf16 con la misma semilla. Requiere SDNQ v0.2.8 o superior y la carga se realiza a través de los bloques modulares de Kimodo SOMA Modular.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline modular Diffusers: codificador de texto Llama 3 8B Instruct con adaptadores LLM2Vec (MNTP + supervisado), transformer de movimiento y códec de movimiento |
| Parámetros totales | 151.554.435 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Dinámica 4 bits (SDNQ) sobre text encoder y motion transformer; LoRA de LLM2Vec en float32; códec de movimiento sin cuantizar |
| Idiomas soportados | en |
| Licencia | kimodo-and-llama3-component-licenses (NVIDIA Open Model License para pesos de movimiento, Meta Llama 3 Community License para el text encoder, Apache-2.0 para código propio, MIT para código LLM2Vec adaptado) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un reentrenamiento. La arquitectura subyacente combina un codificador de texto basado en Meta Llama 3 8B Instruct con los adaptadores LLM2Vec (MNTP y supervisado) de McGill-NLP, un transformer de movimiento que genera la secuencia esquelética y un códec de movimiento que mantiene su precisión original. La conversión a Diffusers sigue el esquema de bloques modulares de Kimodo SOMA Modular, con `components_repo` apuntando a este repositorio cuantizado.

La cuantización SDNQ en modo dinámico a 4 bits se aplica al text encoder y al transformer de movimiento, mientras que el adaptador LoRA supervisado de LLM2Vec permanece en float32 para preservar la calidad de la representación textual. El resultado es un repositorio de 5,0 GB frente a los 16 GB del original. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni el proceso de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de movimiento a partir de texto (text-to-motion) en inglés, con salida en esqueleto SOMA77 y root motion preservado.
- Generación de secuencias de 4 segundos a 30 FPS con 120 frames y 100 pasos de inferencia en la configuración de ejemplo.
- Control de semilla para reproducibilidad aproximada (no exacta respecto a bf16).
- Salida en formato de movimiento con unidades en metros y convención +Y arriba, +Z adelante inicial.
- No soporta prompts negativos.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning, visión, audio ni thinking mode.

## Casos de uso

- Previsualización de animaciones en pipelines de producción con VRAM limitada: el modelo cabe en GPUs de consumo con 5,2 GiB de pico, lo que permite iterar sobre prompts de movimiento sin depender de nodos con A100.
- Generación de clips de movimiento para videojuegos y prototipado: secuencias de 4 segundos a 30 FPS en esqueleto SOMA77 con root motion listas para retargeting.
- Integración en herramientas de autoría 3D: el pipeline modular de Diffusers permite cargar los bloques y sustituir componentes, facilitando su inserción en DCCs o scripts de Blender/Maya.
- Investigación en text-to-motion con recursos limitados: permite reproducir experimentos cualitativos del modelo original con una fracción del almacenamiento y la VRAM.
- Generación por lotes en servidores modestos: el tamaño reducido del repositorio (5,0 GB) abarata el almacenamiento y la carga en memoria frente a los 16 GB de bf16.
- Demos interactivas y notebooks: el ejemplo oficial con `ModularPipelineBlocks` y `trust_remote_code` permite montar una demo rápida con un único prompt y semilla fija.
- Evaluación comparativa de cuantización: útil para medir la degradación cualitativa de INT4 frente a bf16 en una misma tarea generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una comparación cualitativa mediante vídeos (bf16 frente a INT4 con la misma semilla y prompt), señalando que a 4 bits la misma semilla produce una variación distinta del movimiento (la secuencia arranca a media zancada en lugar de desde posición estática).

## Requisitos de hardware

- VRAM estimada: pico de 5,2 GiB en el ejemplo oficial con `num_frames=120`, `num_inference_steps=100` y semilla 42.
- GPU recomendadas: cualquier GPU con al menos 6 GiB de VRAM; el ejemplo se ejecuta en CUDA con `pipe.to("cuda")`.
- Cabe en GPU de consumo: sí, con el margen indicado por el pico de 5,2 GiB.
- Opciones de despliegue: Diffusers 0.41.0 con `ModularPipelineBlocks`, Transformers 5.20.2, PEFT 0.21.2, Accelerate >=1.15, Safetensors >=0.8 y SDNQ >=0.2.8. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos de seguridad: el ejemplo usa `trust_remote_code=True` y `trust_components_code=True`, que ejecutan código Python descargado del Hub; deben revisarse antes de usarlos con repositorios de terceros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimodo SOMA RP v1.2 SDNQ Dynamic 4bit (este) | 151.554.435 | no disponible | 4 bits dinámica (SDNQ) | kimodo-and-llama3-component-licenses | Hugging Face, 13 descargas |
| OzzyGT/Kimodo_SOMA_RP_v1_2 (bf16) | no disponible | no disponible | bf16 | kimodo-and-llama3-component-licenses | Hugging Face |
| nvidia/Kimodo-SOMA-RP-v1.2 | no disponible | no disponible | no disponible | NVIDIA Open Model License + Llama 3 | Hugging Face |
| Versión INT8 de OzzyGT (mencionada en la model card) | no disponible | no disponible | 8 bits | kimodo-and-llama3-component-licenses | Hugging Face |

## Limitaciones y advertencias

- La cuantización a 4 bits altera la salida: con la misma semilla y prompt, el movimiento difiere del bf16 (arranca a media zancada en lugar de desde posición estática). Para reproducir bf16 exactamente hay que usar la versión INT8.
- Solo soporta prompts en inglés.
- No admite prompts negativos.
- Requiere SDNQ v0.2.8 o superior; versiones anteriores no cargarán los pesos cuantizados.
- El uso de `trust_remote_code=True` y `trust_components_code=True` ejecuta código Python del Hub; riesgo de seguridad si se apuntan a repositorios no auditados.
- Licencia compuesta: los pesos de movimiento se rigen por la NVIDIA Open Model License, el text encoder por la Meta Llama 3 Community License y su Acceptable Use Policy, el código propio por Apache-2.0 y el código LLM2Vec adaptado por MIT. Cualquier uso comercial debe verificar el cumplimiento de todas ellas.
- No se documentan sesgos específicos ni tasas de alucinación para esta variante; al ser un modelo generativo de movimiento, la fidelidad al prompt puede degradarse con cuantización agresiva.
- El modelo no es un LLM conversacional: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K).
- Fecha de creación del repositorio indicada como 2026-10-20 y actualización 2026-11-25; conviene verificar el estado actual del repositorio antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/Kimodo_SOMA_RP_v1_2_sdnq_dynamic_4bit
- Modelo base (bf16): https://huggingface.co/OzzyGT/Kimodo_SOMA_RP_v1_2
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.2
- Bloques modulares Kimodo SOMA: https://huggingface.co/OzzyGT/Kimodo_SOMA_Modular
- Repositorio Kimodo: https://github.com/nv-tlabs/kimodo
- Librería SDNQ: https://github.com/Disty0/sdnq
- LLM2Vec (código): https://github.com/McGill-NLP/llm2vec
- Adaptador MNTP: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp
- Adaptador supervisado: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised
- Meta Llama 3 8B Instruct: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Política de uso de Llama 3: https://llama.meta.com/llama3/use-policy
- Vídeo de comparación bf16: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/Kimodo_SOMA_Modular/Kimodo_SOMA_RP_v1_2_run_seed42_bf16.mp4
- Vídeo de comparación INT4: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/Kimodo_SOMA_Modular/Kimodo_SOMA_RP_v1_2_run_seed42_int4.mp4
