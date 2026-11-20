# axteam/MiniCPM5-2B-NVFP4A16

## Resumen

MiniCPM5-2B-NVFP4A16 es una cuantizacion de 4 bits del modelo denso openbmb/MiniCPM5-2B, publicada por el equipo axteam. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: aplica cuantizacion post-entrenamiento con el esquema NVFP4A16 (pesos en FP4 E2M1 con grupo de 16 y escala FP8, activaciones en BF16) sobre la arquitectura original, que sigue el patron Llama y es de tipo denso y solo texto.

El modelo resuelve un problema muy concreto de despliegue: reducir el peso en disco y en VRAM de un modelo de 2.516.756.480 parametros hasta unos 2,2 GB, manteniendo la compatibilidad con vLLM mediante el formato compressed-tensors `nvfp4-pack-quantized`. Esta pensado para servir inferencia en GPUs NVIDIA Turing (sm75) o posteriores, sin necesidad de tensor cores FP4, lo que amplia el abanico de hardware utilizable.

Su relevancia actual es doble: por un lado, demuestra el flujo de cuantizacion NVFP4 aplicado a un modelo pequeno de la familia MiniCPM; por otro, la propia model card advierte de una degradacion medible frente al original en BF16 (94,1 % de recuperacion media en benchmarks y un aumento del 14,6 % en perplejidad), por lo que su interes practico depende de si la prioridad es el ahorro de memoria o la fidelidad de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama), solo texto |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de despliegue de la model card) |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1 con grupo 16 y escala FP8, activaciones BF16; embeddings, LM head y RMSNorms en BF16 (~21 % de los parametros) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo Llama, solo texto, con 2.516.756.480 parametros. El checkpoint no incluye entrenamiento nuevo: es una cuantizacion post-entrenamiento del modelo base openbmb/MiniCPM5-2B, realizada con calibracion sobre 256 muestras y sin reentrenamiento. Antes del redondeo a FP4 se aplica suavizado AWQ con el conjunto de calibracion. El tokenizador y la `chat_template` son identicos a los del original.

Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La innovacion tecnica destacable de este checkpoint es el esquema de cuantizacion: pesos en FP4 (E2M1) agrupados de 16 en 16 con escala FP8 y activaciones en BF16, almacenados como compressed-tensors `nvfp4-pack-quantized`. Se mantienen en BF16 los embeddings de tokens, la LM head y todas las RMSNorms, lo que representa aproximadamente el 21 % de los parametros de esta build.

## Capacidades

- Generacion de texto conversacional, con `chat_template` identica a la del modelo original.
- Modo thinking activado por defecto en la plantilla de chat; puede desactivarse con `chat_template_kwargs={"enable_thinking": False}`.
- Razonamiento y matematicas basicas, segun los resultados medidos en GSM8K y MMLU del modelo base.
- Soporte multilingue parcial: la evaluacion incluye KMMLU (coreano) y HAE-RAE, ademas de pruebas en ingles.
- Compatibilidad con vLLM y servidor OpenAI-compatible (`/v1/chat/completions`).
- Inferencia offline en Python mediante la API `LLM` de vLLM.
- Solo texto: no hay capacidades de vision ni audio en este checkpoint.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat en produccion con vLLM: el checkpoint se sirve con `vllm serve` y expone una API compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente. Es adecuado cuando el presupuesto de VRAM es ajustado, ya que los pesos ocupan solo 2,2 GB.
- Despliegue en GPUs consumer o de gama media: al no requerir tensor cores FP4 y funcionar desde sm75, puede ejecutarse en tarjetas NVIDIA Turing o posteriores con memoria limitada, reservando el resto para cache KV y activaciones.
- Prototipado rapido de asistentes conversacionales: el modo thinking por defecto y la plantilla de chat permiten construir demos de razonamiento conversacional con pocos recursos, aceptando la perdida de calidad frente al BF16.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye mediciones propias frente a FP8-dynamic, AWQ-8bit, NVFP4 y AWQ-4bit con el mismo harness, lo que lo convierte en un punto de referencia util para estudiar el impacto de FP4 en modelos pequenos.
- Procesamiento de texto multilingue con foco en coreano e ingles: los benchmarks KMMLU y HAE-RAE indican que el modelo base maneja coreano, aunque la cuantizacion reduce la recuperacion en esas tareas al 94,4 % y 90,6 % respectivamente.
- Entornos con restricciones de almacenamiento: el tamano de 2,2 GB en disco facilita el empaquetado en contenedores e imagenes de despliegue ligeras, frente a las builds de 8 bits o al BF16 original.
- Backend de generacion de texto en pipelines internos: la licencia Apache-2.0 permite uso comercial sin restricciones adicionales, siempre que se acepte la degradacion documentada.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con puntuaciones obtenidas por log-likelihood. Los porcentajes entre parentesis indican recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 59,74 | 59,56 (99,7 %) | 59,86 (100,2 %) | 56,81 (95,1 %) | 53,50 (89,5 %) | 56,31 (94,3 %) |
| GSM8K (5-shot, estricto) | 73,01 | 71,27 (97,6 %) | 73,01 (100,0 %) | 65,20 (89,3 %) | 55,04 (75,4 %) | 65,96 (90,3 %) |
| ARC-Challenge (0-shot) | 43,94 | 44,20 (100,6 %) | 43,86 (99,8 %) | 43,43 (98,8 %) | 40,10 (91,3 %) | 44,88 (102,1 %) |
| Winogrande (5-shot) | 64,40 | 63,22 (98,2 %) | 64,40 (100,0 %) | 62,75 (97,4 %) | 59,04 (91,7 %) | 62,12 (96,4 %) |
| KMMLU (5-shot, directo) | 37,65 | 38,38 (101,9 %) | 38,27 (101,7 %) | 35,56 (94,4 %) | 34,06 (90,5 %) | 30,73 (81,6 %) |
| HAE-RAE (0-shot) | 39,05 | 38,13 (97,7 %) | 39,14 (100,2 %) | 35,38 (90,6 %) | 30,16 (77,2 %) | 36,94 (94,6 %) |
| Media | 52,97 | 52,46 (99,0 %) | 53,09 (100,2 %) | 49,85 (94,1 %) | 45,32 (85,6 %) | 49,49 (93,4 %) |

Evaluacion de fidelidad frente al BF16 original sobre un conjunto interno mixto EN/KO de 100 prompts, con respuestas greedy del BF16 puntuadas bajo cada build:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,8315 | 1,5988 (+14,6 %) |
| Acuerdo top-1 en el siguiente token | 85,0 % | 98,9 % |

## Requisitos de hardware

- VRAM para pesos: 2,2 GB. Hay que anadir cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU soportadas: NVIDIA Turing (sm75) o posteriores. V100 (sm70) no es compatible. No se necesitan tensor cores FP4 porque la cuantizacion es weight-only.
- GPU recomendadas: la model card solo indica que las pruebas se realizaron en una B200; no se especifican otras GPU probadas.
- Cabe en GPU consumer: si, en cualquier NVIDIA desde Turing con memoria suficiente para pesos, cache KV y activaciones; el peso de los pesos es de 2,2 GB.
- Despliegue con vLLM: probado con vLLM 0.32.0, que requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0. No se debe actualizar compressed-tensors por separado.
- Despliegue sin vLLM: transformers >=4.56.0 y compressed-tensors >=0.15.0. En transformers 4.x el tokenizador devuelve `token_type_ids`, que el modelo no acepta; hay que eliminarlo antes de llamar a `generate`.
- `trust_remote_code`: no necesario.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Reduccion opcional de memoria de cache KV en tiempo de servicio: la model card menciona que la precision del KV cache es un parametro de runtime, pero el detalle queda cortado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (media benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-NVFP4A16 (este repo) | 2,52 B | 32.768 (segun ejemplos) | 49,85 (94,1 % vs BF16) | Apache-2.0 | Hugging Face, vLLM |
| MiniCPM5-2B FP8-dynamic | 2,52 B | No disponible | 52,46 (99,0 % vs BF16) | Apache-2.0 (derivada) | Hugging Face |
| MiniCPM5-2B AWQ-8bit | 2,52 B | No disponible | 53,09 (100,2 % vs BF16) | Apache-2.0 (derivada) | Hugging Face |
| MiniCPM5-2B AWQ-4bit | 2,52 B | No disponible | 49,49 (93,4 % vs BF16) | Apache-2.0 (derivada) | Hugging Face |
| MiniCPM5-2B NVFP4 | 2,52 B | No disponible | 45,32 (85,6 % vs BF16) | Apache-2.0 (derivada) | Hugging Face |

Las alternativas comparadas son builds del mismo modelo base, ya que no se dispone de datos de modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion de calidad medible: recuperacion media del 94,1 % frente al BF16, con caidas notables en GSM8K (89,3 %) y HAE-RAE (90,6 %). La propia model card recomienda una build de 8 bits si la calidad es prioritaria.
- Aumento de perplejidad del 14,6 % y acuerdo top-1 del 85,0 % frente al 98,9 % del original en el conjunto interno EN/KO.
- El checkpoint NVFP4 puro (sin A16) es aun peor (85,6 % de recuperacion media), lo que confirma que la cuantizacion de 4 bits es agresiva para este tamano de modelo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 2,5 B, la fiabilidad factual es limitada por capacidad, no solo por cuantizacion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas: la lista oficial no esta disponible; los benchmarks solo cubren ingles y coreano, por lo que el rendimiento en castellano no esta verificado.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base openbmb/MiniCPM5-2B, ya que este checkpoint es una obra derivada.
- Requisitos de runtime estrictos: vLLM 0.32.0 con versiones fijadas de transformers y compressed-tensors; actualizar dependencias por separado puede romper la carga del checkpoint.
- Incompatibilidad con V100 (sm70) y dependencia de drivers con soporte CUDA 13 en el entorno probado.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en produccion sin validacion previa.
- El contexto de 32.768 tokens aparece en los ejemplos de despliegue, no como especificacion formal del modelo base; conviene confirmarlo antes de disenar aplicaciones con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/MiniCPM5-2B-NVFP4A16
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- lm-evaluation-harness: https://github.com/ElutherAI/lm-evaluation-harness (referenciado en la model card como https://github.com/EleutherAI/lm-evaluation-harness)
- vLLM: no se incluye enlace explicito en la informacion proporcionada
- compressed-tensors: no se incluye enlace explicito en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
