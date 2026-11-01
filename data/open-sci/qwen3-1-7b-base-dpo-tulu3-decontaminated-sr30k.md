# open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-sr30k

## Resumen

open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-sr30k es un ajuste fino completo (full fine-tuning) del modelo ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated, que a su vez deriva de la familia Qwen3 de Alibaba. El entrenamiento se ha realizado con LLaMA-Factory sobre un dataset de razonamiento destilado de gpt-oss-120b (Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf), preprocesado en modo "thinking". El resultado es un modelo conversacional de 1.720.050.688 parametros orientado a generacion de texto con capacidades de razonamiento.

El modelo se enmarca en la linea Qwen3, una arquitectura transformer densa con atención completa y ventana de contexto nativa de 32.768 tokens (ampliable mediante RoPE scaling, aunque esta ficha no puede confirmar la configuracion concreta del checkpoint). Su relevancia radica en ser un ejemplo de destilacion de razonamiento desde un modelo mayor (gpt-oss-120b) hacia un modelo pequeno de 1.7B, un patron habitual para obtener capacidades de chain-of-thought en hardware de consumo.

Se trata de un checkpoint de investigacion publicado por la organizacion open-sci, con 157 descargas y sin likes, lo que sugiere un uso experimental mas que de produccion. La model card es auto-generada por el Trainer y no documenta usos previstos, limitaciones ni evaluacion, por lo que la informacion disponible es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 1.720.050.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia Qwen3 usa 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior a GGUF/AWQ/GPTQ, no confirmado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3 con 1.720.050.688 parametros. El checkpoint base (ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated) ya incorpora un ajuste DPO sobre Tulu3 decontaminado, y sobre el se ha aplicado un SFT completo con LLaMA-Factory. El dataset de entrenamiento es Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf, un conjunto de 30.000 ejemplos de razonamiento generados por destilacion desde gpt-oss-120b en formato ShareGPT y preprocesado con etiquetas de "thinking".

Los hiperparametros documentados son: learning rate 4e-05, batch total 128 (batch 1 x 32 dispositivos x 4 pasos de acumulacion), 5 epocas, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler coseno con warmup del 10%. El entrenamiento se ejecuto en 32 GPUs con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el numero total de tokens vistos ni la composicion del dataset mas alla de su origen.

La innovacion principal es el uso de datos de razonamiento destilados de un modelo grande (gpt-oss-120b) para inducir comportamiento de chain-of-thought en un modelo de 1.7B, junto con el prefijo "decontaminated" en el modelo base, que sugiere un esfuerzo por eliminar contaminacion de benchmarks en los datos de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de chat (tags `conversational`).
- Razonamiento con modo "thinking": el dataset de entrenamiento esta preprocesado con etiquetas de pensamiento, por lo que el modelo esta expuesto a trazas de razonamiento estilo chain-of-thought.
- Destilacion de razonamiento desde gpt-oss-120b: el SFT busca transferir patrones de razonamiento del modelo profesor.
- Capacidades heredadas de Qwen3-1.7B-Base: generacion de codigo, matematicas y texto general (no verificadas en este checkpoint).
- Soporte de tool calling / function calling: no disponible (no documentado por el autor).
- Soporte de agentes y multi-step reasoning: no documentado; el modo thinking sugiere capacidad, pero no hay evidencia publicada.
- Capacidades multilingues: no disponible (no documentado).
- Capacidades especiales (vision, audio): no disponible; el modelo es solo texto.

## Casos de uso

- Prototipado de razonamiento en hardware de consumo: con 1.7B parametros, el modelo cabe en GPUs de 8-12 GB en cuantizacion de 4-8 bits, lo que permite experimentar con chain-of-thought destilado sin infraestructura grande.
- Investigacion sobre destilacion de razonamiento: sirve como punto de comparacion para estudiar si el SFT sobre datos de gpt-oss-120b mejora tareas de razonamiento en modelos pequenos.
- Generacion de codigo asistida en local: el modelo hereda la base Qwen3, orientada a codigo; puede usarse en editores o pipelines de CI/CD con llama.cpp u Ollama para autocompletado y generacion de tests.
- Chatbot de dominio acotado: con contexto de 32k tokens (si se confirma la configuracion), puede gestionar conversaciones multi-turno con historial largo en aplicaciones de atencion al cliente de baja latencia.
- Evaluacion de robustez y sesgos: al ser un checkpoint de investigacion con datos destilados, es util para auditar como los modelos pequenos reproducen sesgos del profesor.
- Fine-tuning posterior: al estar en safetensors y ser compatible con Transformers y LLaMA-Factory, sirve como base para ajustes especificos de dominio en equipos con una sola GPU.
- Generacion de explicaciones paso a paso: el modo thinking permite producir respuestas con razonamiento explicito para herramientas educativas o de depuracion.

## Benchmarks y rendimiento

La model-index del autor declara una entrada (`sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__Qwen3-1-7B-0acf773e__fa2-qwen-a26ef2b8`) con `results: []`, es decir, sin resultados de benchmarks publicados. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16/BF16 (1.720.050.688 parametros x 2 bytes), ~1,8 GB en cuantizacion de 4 bits y ~1 GB en 3 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con margen para el contexto; A100, H100 o L40S para despliegue a escala con vLLM o TGI.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores; en 4 bits tambien en GPUs de 6-8 GB.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama tras conversion a GGUF (conversion no confirmada por el autor).
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-sr30k | 1,72B | no disponible | other | safetensors | SFT de razonamiento destilado |
| Qwen/Qwen3-1.7B | 1,7B | 32.768 tokens (nativo) | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, con modo thinking |
| ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated | 1,7B | no disponible | other | safetensors | Modelo base del que deriva este checkpoint |
| Llama 3.2 1B Instruct | 1,24B | 128k tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa pequena con contexto largo |

La comparativa se limita a datos publicos de los modelos oficiales; no se dispone de evaluaciones del checkpoint open-sci frente a estas alternativas.

## Limitaciones y advertencias

- La model card es auto-generada y no documenta usos previstos, limitaciones ni evaluacion; no hay evidencia publicada de calidad.
- Licencia "other": es necesario revisar los terminos exactos antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Riesgo de alucinacion elevado: el modelo se ha entrenado sobre datos sinteticos de razonamiento generados por gpt-oss-120b, lo que puede introducir errores del profesor y sesgos de estilo.
- El dataset de destilacion es de 30.000 ejemplos, un volumen limitado que puede provocar sobreajuste a formatos concretos de "thinking".
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- Longitud de contexto no confirmada para este checkpoint concreto; no asumir 32k sin validacion.
- Sin likes ni evaluaciones de la comunidad (0 likes, 157 descargas), lo que reduce la confianza en su robustez.
- El prefijo "decontaminated" del modelo base no garantiza ausencia de contaminacion en el SFT posterior, que usa datos sinteticos no auditados publicamente.
- No se recomienda su uso en produccion sin una evaluacion propia de calidad, sesgos y seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated
- Familia Qwen3 (modelo oficial): https://huggingface.co/Qwen/Qwen3-1.7B
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- gpt-oss (modelo profesor): https://huggingface.co/openai/gpt-oss-120b
- Tulu3 (dataset de referencia): https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
