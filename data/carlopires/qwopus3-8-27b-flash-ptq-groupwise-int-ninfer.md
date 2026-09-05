# carlopires/Qwopus3.8-27B-Flash-PTQ-groupwise-int-NInfer

## Resumen

Qwopus3.8-27B-Flash es un fine-tune orientado a agentes de Qwen3.8-27B, publicado originalmente por Jackrong como GGUF. Este artefacto lo empaqueta para NInfer, un motor de inferencia para GPU NVIDIA Blackwell, mediante cuantización post-training (PTQ) a almacenamiento groupwise-int. No se aplicó quantización-aware training (QAT), por lo que la degradación respecto al checkpoint BF16 original no está evaluada en la documentación.

La arquitectura base es híbrida: 64 capas de texto (16 de atención completa y 48 de Gated DeltaNet) más una capa MTP para decodificación especulativa, junto con la torre de visión de Qwen3.8. El artefacto final contiene el backbone de texto, la torre de visión, el modelo draft MTP, la cabeza de propuesta optimizada, el tokenizador, la plantilla de chat, la configuración de generación y los recursos del media processor. Es un archivo exclusivo de NInfer, no un checkpoint de Transformers, Safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas de texto (16 full-attention + 48 Gated DeltaNet) + 1 capa MTP; torre de visión incluida |
| Parametros totales | 27B (según el nombre del modelo base Qwen3.8-27B; no se proporciona desglose oficial) |
| Parametros activos | No disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Groupwise-int (PTQ) para NInfer; variante NVFP4 disponible por separado |
| Idiomas soportados | No especificado en la información disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NInfer (.ninfer); no es Safetensors ni GGUF |

## Arquitectura y entrenamiento

Qwopus3.8-27B-Flash es un fine-tune de Qwen3.8-27B publicado por Jackrong en formato GGUF. La arquitectura combina atención completa y capas Gated DeltaNet en un modelo híbrido, con una capa adicional MTP para decodificación especulativa. El proceso de construcción de este artefacto tuvo dos etapas: primero se convirtió el GGUF `Qwopus3.8-27B-Flash-MTP-Q5_K_M.gguf` a un checkpoint BF16 en formato Hugging Face, aplicando las transformaciones inversas de llama.cpp y fusionando la torre de visión oficial del modelo base; después se convirtió ese checkpoint al contenedor NInfer con cuantización groupwise-int en CPU.

No se dispone de información sobre los datos de entrenamiento, la composición del dataset ni sobre procesos de RLHF o DPO. Tampoco se documentan innovaciones técnicas más allá de las ya mencionadas: la inclusión de un modelo draft MTP, la cabeza de propuesta optimizada, el soporte de KV cache BF16 e INT8 group-64 y el uso de CUDA Graph decode con reutilización de prefijos compatibles.

## Capacidades

- Generación de texto en modos thinking y non-thinking.
- Procesamiento multimodal: imágenes, multi-imagen, vídeo y mensajes mixtos, gracias a la torre de visión y a los recursos del media processor.
- Decodificación especulativa MTP con cabeza de propuesta optimizada; el runtime soporta `--spec mtp`, `--draft-tokens 3` y `--lm-head-draft`.
- KV cache en BF16 e INT8 group-64.
- CUDA Graph decode y reutilización de prefijos compatibles.
- Compatibilidad con OpenAI Responses Core, OpenAI Chat Completions y Anthropic Messages a través de `ninfer-serve`.
- Soporte de tool calling: no se documenta explícitamente en la información disponible.
- Soporte de agentes y multi-step reasoning: no se documenta explícitamente; el modelo incluye modo thinking, pero la documentación no detalla capacidades de agentes.

## Casos de uso

- Análisis multimodal en local: gracias a la torre de visión y a los recursos del media processor, el modelo puede procesar imágenes, vídeo y mensajes mixtos. Se usaría en un pipeline privado para anotar vídeos o responder preguntas sobre imágenes sin enviar datos a servicios externos.
- Razonamiento paso a paso: el modo thinking permite generar cadenas de razonamiento antes de la respuesta final. Es adecuado para tareas de lógica o análisis complejo en entornos de investigación donde se necesita trazar el proceso.
- Reducción de latencia con decodificación especulativa: la capa MTP y la cabeza de propuesta optimizada permiten usar `--spec mtp --draft-tokens 3 --lm-head-draft`. Resulta útil en aplicaciones interactivas donde el tiempo de generación es crítico y se dispone de una GPU Blackwell.
- Servidor compatible con APIs estándar: mediante `ninfer-serve` se expone una API compatible con OpenAI Chat Completions o Anthropic Messages. Es adecuado para prototipos que ya usan estas interfaces y quieren migrar a un motor local en una sola GPU.
- Investigación en cuantización PTQ: el artefacto permite estudiar el impacto de groupwise-int sin QAT en un modelo híbrido. Se puede comparar con la variante NVFP4 o con el GGUF original para evaluar degradación y velocidad.
- Pruebas de agentes multimodales sin infraestructura cloud: con un RTX 5090 de 24 o 32 GiB y KV cache INT8 se pueden ejecutar conversaciones multimodales con contexto útil en local. La concurrencia y el contexto se fijan al arranque, por lo que es adecuado para pruebas controladas y de un solo usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento relativo es que la variante NVFP4 decodifica aproximadamente 1,63 veces más rápido que este artefacto con MTP activado. No hay cifras absolutas de latencia, throughput ni calidad.

## Requisitos de hardware

- VRAM estimada: el artefacto utilizó 15,92 GiB de almacenamiento de pesos en GPU durante la validación. El contexto requiere memoria adicional; la capacidad exacta depende de la longitud de contexto y del tipo de KV cache.
- GPU recomendada: NVIDIA Blackwell con soporte FP4 (sm_120a). Ejemplos: RTX 5090 Laptop (24 GiB) con KV cache INT8 para contextos útiles; RTX 5090 desktop (32 GiB) como objetivo principal por mayor margen de contexto.
- GPU consumer: sí, en RTX 5090 de 24 GiB y 32 GiB. No es compatible con GPUs sin FP4 ni con arquitecturas anteriores.
- Opciones de despliegue: NInfer (CLI `ninfer` y servidor `ninfer-serve`) desde el fork carlopires/ninfer-rtx5090-mobile, commit 830e26bb. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles. Solo se indica que la variante NVFP4 decodifica aproximadamente 1,63 veces más rápido que este artefacto con MTP activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización y formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Flash-PTQ-groupwise-int-NInfer (este) | 27B | groupwise-int, NInfer (.ninfer) | No disponible | Apache 2.0 | HuggingFace |
| Qwopus3.8-27B-Flash-PTQ-NVFP4-NInfer | 27B | NVFP4, NInfer (.ninfer) | No disponible | Apache 2.0 | HuggingFace |
| Qwopus3.8-27B-Flash-GGUF (Jackrong) | 27B | Q5_K_M, GGUF | No disponible | No disponible | HuggingFace |

La comparativa se limita a variantes del mismo fine-tune. No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- El artefacto es exclusivo para NInfer. No es un checkpoint de Transformers, Safetensors, GGUF ni un formato de intercambio genérico.
- Requiere NVIDIA Blackwell con soporte FP4 y CUDA Toolkit 13.1 o superior. No funciona en GPUs anteriores ni en CPU.
- NInfer es un motor de una sola GPU. No ofrece offload CPU/GPU, ejecución multi-GPU, servicio distribuido ni preemptive continuous batching a gran escala.
- La cuantización es PTQ sin QAT. Puede haber degradación respecto al BF16 original, pero no se han publicado evaluaciones de calidad.
- No se han publicado datos sobre sesgos, riesgo de alucinación ni limitaciones de idioma.
- La longitud de contexto exacta no se especifica. Los ejemplos usan `--max-context 4096`, pero la capacidad real depende de la VRAM disponible.
- La capacidad de solicitudes activas se fija al arranque. Aumentar contexto y concurrencia requiere más VRAM.
- La licencia Apache 2.0 permite uso comercial, pero el runtime NInfer es un fork específico y el fine-tune original no especifica licencia. Conviene revisar los términos de ambos.
- El artefacto se construyó convirtiendo GGUF a BF16 y luego a NInfer, fusionando la torre de visión oficial. Puede haber diferencias derivadas de la conversión y del merge.

## Enlaces

- Modelo: https://huggingface.co/carlopires/Qwopus3.8-27B-Flash-PTQ-groupwise-int-NInfer
- Variante NVFP4: https://huggingface.co/carlopires/Qwopus3.8-27B-Flash-PTQ-NVFP4-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fine-tune original GGUF: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-GGUF
- Runtime NInfer: https://github.com/carlopires/ninfer-rtx5090-mobile
- Enlace adicional encontrado en la búsqueda: https://huggingface.co/sojufx/Qwopus3.8-27B-Flash-NVFP4
