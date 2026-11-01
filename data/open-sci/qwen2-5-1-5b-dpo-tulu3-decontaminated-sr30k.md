# open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-sr30k

## Resumen

open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-sr30k es un ajuste fino supervisado (SFT) del modelo ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated, que a su vez deriva del Qwen2.5-1.5B de Alibaba. Lo desarrolla la organizacion open-sci y se ha entrenado con el framework LLaMA-Factory sobre el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf, un conjunto de unas 30.000 muestras de razonamiento generadas a partir de gpt-oss-120b en formato ShareGPT. El objetivo es dotar a un modelo pequeno de 1.500 millones de parametros de capacidades de razonamiento paso a paso y de conversacion multi-turno.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5, con 1.543.321.088 parametros totales y pesos en safetensors (repo de 3,1 GB). La ventana de contexto nativa de la familia Qwen2.5-1.5B es de 32.768 tokens, ampliable a 131.072 mediante RoPE scaling, aunque la model card no documenta el contexto efectivo tras el ajuste. El entrenamiento se realizo en modo full fine-tuning (no LoRA) durante 5 epocas con un batch total de 128 y learning rate de 4e-5.

Su relevancia es doble: por un lado, es un ejemplo de receta reproducible de SFT de razonamiento sobre modelos pequenos; por otro, el prefijo "decontaminated" del modelo base sugiere que se ha intentado eliminar la contaminacion del dataset de evaluacion, un aspecto critico para medir ganancias reales. La licencia es "other", heredada de Qwen2.5, por lo que conviene revisar los terminos antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.321.088 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-1.5B (no confirmado tras el ajuste) |
| Tipos de cuantizacion | no disponible en la model card; compatible con GGUF/AWQ por ser arquitectura Qwen2 |
| Idiomas soportados | no disponible (heredados de Qwen2.5: multilingue, con enfasis en ingles y chino) |
| Licencia | other (heredada de Qwen2.5) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only estilo Qwen2, con atencion por cabezas agrupadas (GQA), RoPE y normalizacion RMSNorm, el mismo bloque que usa Qwen2.5-1.5B. Sobre esa base, el modelo intermedio ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated aplico DPO sobre Tulu 3 con un dataset decontaminado; este modelo anade un SFT completo (full fine-tuning) sobre el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf, que contiene 30.000 muestras de razonamiento destiladas de gpt-oss-120b en formato ShareGPT.

Los hiperparametros documentados son: learning rate 4e-5 con scheduler coseno y warmup del 10 %, batch total 128 (batch 1 x 4 pasos de acumulacion x 32 GPUs), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, semilla 42. El entrenamiento se realizo con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan innovaciones arquitectonicas adicionales ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en formato chat (etiquetas de la familia Qwen2.5).
- Razonamiento paso a paso, inducido por el dataset de SFT de razonamiento.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Posible soporte de tool calling y function calling heredado de Qwen2.5-1.5B (no verificado en esta variante).
- Capacidades multilingues heredadas de Qwen2.5 (no documentadas explicitamente en la model card).
- No se declaran capacidades de vision, audio ni modo thinking explicito.
- No se documentan capacidades de agente multi-paso mas alla de lo que permita el SFT.

## Casos de uso

- Asistente conversacional ligero en local: con 1.500 millones de parametros se puede ejecutar en una GPU de consumo de 8 GB en cuantizacion de 4 bits, adecuado para prototipos de chatbot en escritorio.
- Generacion de respuestas de razonamiento en dominios acotados: el SFT sobre muestras de razonamiento permite obtener cadenas de pensamiento para tareas de logica o matematicas basicas, util como generador de datos sinteticos.
- Destilacion y evaluacion de pipelines de SFT: sirve como referencia para comparar el efecto de un SFT de razonamiento sobre una base DPO decontaminada.
- Filtrado y clasificacion de texto con contexto medio: su ventana de 32.000 tokens permite procesar documentos largos en tareas de resumen o extraccion.
- Despliegue en entornos con recursos limitados: al ser un modelo denso pequeno, encaja en CPUs modernas con llama.cpp u Ollama para inferencia por lotes de baja latencia.
- Investigacion en contaminacion de benchmarks: al partir de una base "decontaminated", es util para estudiar como afecta el SFT de razonamiento a metricas de evaluacion limpias.

## Benchmarks y rendimiento

La model card declara un model-index con una unica entrada (`sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__Qwen2-5-1-5-ad8184fd__fa2-qwe-b7b782b3`) cuyo campo `results` esta vacio. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: unos 3,1 GB de pesos mas overhead de activaciones, en torno a 4-5 GB en total.
- VRAM estimada en 8 bits: aproximadamente 1,6 GB de pesos.
- VRAM estimada en 4 bits (GGUF Q4_K_M): en torno a 1 GB de pesos, 2-3 GB con contexto largo.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090); en A100/H100 se puede servir con alto throughput.
- Cabe en GPU de consumo: si, en RTX 3060/4060 de 8 GB en fp16 y en GPUs de 4 GB con cuantizacion 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI (tag text-generation-inference), llama.cpp, Ollama, LLaMA-Factory para reentrenamiento.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-sr30k | 1,54 B | 32.768 (heredado) | other | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | HuggingFace, Ollama |
| ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated | 1,54 B | 32.768 (heredado) | other | HuggingFace |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta usos previstos, limitaciones ni sesgos; falta informacion critica para produccion.
- Riesgo de alucinacion propio de un modelo de 1,5 B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- El dataset de SFT se ha destilado de gpt-oss-120b; puede heredar sesgos y errores del modelo profesor.
- La licencia "other" obliga a revisar los terminos de Qwen2.5 antes de uso comercial; no es Apache 2.0.
- No se confirma el contexto efectivo tras el SFT; el entrenamiento con secuencias largas puede haber degradado el rendimiento en contextos muy extensos.
- No hay datos de evaluacion publicados, por lo que no se puede verificar que el SFT mejore al modelo base sin regresiones.
- Idiomas soportados no documentados; el enfasis del dataset parece estar en ingles.
- El nombre "decontaminated" del modelo base no garantiza ausencia total de contaminacion en el dataset de SFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated
- Modelo original Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Framework LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Repositorio de Transformers: https://github.com/huggingface/transformers
