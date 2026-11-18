# positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq_proj

## Resumen

Este repositorio contiene una compilacion cuantizada de Qwen/Qwen3.5-35B-A3B, un modelo de lenguaje y vision de tipo Mixture-of-Experts (MoE) desarrollado por Alibaba Qwen y empaquetado en formato GPTQ de 4 bits por Positron AI. El artefacto esta pensado para inferencia en GPU con la libreria transformers y esta marcado por el propio autor como **superseded** (sustituido): existe una version mas reciente en `positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq` (commit `b32414f63cceaa5e65bc837c39e20c4eecd536ed`), por lo que este repositorio se conserva sin cambios solo para usuarios existentes.

El modelo base combina procesamiento de texto e imagen (pipeline `image-text-to-text`) con una arquitectura MoE de 35.951.822.704 parametros totales, de los cuales solo una fraccion se activa por token (el sufijo "A3B" del nombre sugiere del orden de 3.000 millones de parametros activos, aunque la model card no confirma ese dato). La cuantizacion reduce el peso del repositorio a 23 GB, lo que lo hace manejable en GPUs profesionales de 24-48 GB, algo inviable con los pesos en precision completa.

La relevancia de esta ficha es doble: por un lado documenta un caso tipico de artefacto cuantizado de terceros (Positron AI) sobre un modelo de frontera abierto; por otro, advierte de que se trata de una version obsoleta y sin metricas de calidad publicadas, lo que exige validacion propia antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE); tag `qwen3_5_moe`, multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B, sin confirmacion en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits (pesos), activaciones sin cuantizar; group size 64, simetrica, `desc_act=false`, damp 0,05 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de Qwen con capacidad de entrada de imagen y texto y salida de texto. La arquitectura exacta (numero de capas, dimension oculta, numero de expertos, mecanismo de enrutamiento, atencion) no se detalla en la informacion proporcionada. El tag `qwen3_5_moe` confirma la familia y el tipo de capa, y el pipeline `image-text-to-text` confirma el soporte de vision.

El artefacto de este repositorio no reentrena el modelo: aplica cuantizacion post-entrenamiento GPTQ de 4 bits con GPTQModel 7.3.4, transformers 5.11.0, torch 2.9.1 y CUDA 12.8. La calibracion usa un conjunto mixto de dominio universal con 512 muestras y longitud de secuencia 8192, cuantizacion simetrica por grupos de 64 y damp percent de 0,05. No se documentan datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO) ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (pipeline `text-generation`).
- Procesamiento de imagenes junto a texto (image-text-to-text), segun el tag del repositorio.
- Razonamiento y codigo: no confirmado explicitamente en la informacion disponible, aunque es esperable en la familia Qwen3.5; tratarlo como no verificado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue de un modelo multimodal de ~36B en una sola GPU de 24-48 GB: la cuantizacion a 4 bits reduce el artefacto a 23 GB, lo que permite servir imagen-texto en una RTX 4090 o A6000 con offloading parcial y sin necesidad de un nodo multi-GPU.
- Prototipado de asistentes que reciben capturas de pantalla o documentos escaneados: el pipeline image-text-to-text permite pasar una imagen junto a una pregunta en el mismo prompt y obtener una respuesta textual.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de un GPTQ 4 bits frente al modelo original en tareas propias, dado que el autor no publica KL-divergence ni perplexity.
- Generacion de texto por lotes en pipelines de transformers: el formato safetensors GPTQ es cargable directamente con `AutoModelForCausalLM` y `AutoTokenizer`, lo que simplifica la integracion en jobs offline.
- Base para fine-tuning con adaptadores (LoRA/QLoRA): al ser un checkpoint GPTQ de 4 bits con licencia Apache 2.0, se puede adaptar a dominios verticales sin restricciones de uso comercial.
- Entornos de investigacion con presupuesto limitado: permite reproducir experimentos sobre un modelo MoE grande sin acceso a clústeres de A100/H100, a costa de asumir la perdida de precision de la cuantizacion.
- Migracion controlada: sirve como referencia para validar el salto a la version vigente (`...-ingest-best-gptq`) comparando salidas entre ambos commits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no reporta metricas de rendimiento ni de calidad (ni KL-divergence, ni accuracy, ni perplexity) y que la validacion se gestiona internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 23 GB en GPTQ 4 bits; en inferencia hay que sumar cache KV y activaciones, por lo que se recomienda al menos 24 GB y, para contextos largos, 32-48 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB. En consumer, RTX 4090 (24 GB) es el minimo realista y puede requerir offloading de capas.
- Cabe en consumer GPU: si, en RTX 4090 24 GB con margen ajustado; en GPUs de 16 GB no cabe sin cuantizacion adicional u offloading a CPU.
- Opciones de despliegue: transformers (formato nativo del artefacto), vLLM y TGI si soportan GPTQ para esta arquitectura MoE, llama.cpp/Ollama solo si existe conversion a GGUF (no disponible en este repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq_proj (este) | 35,95B totales | no disponible | GPTQ 4 bits | Apache 2.0 | Superseded |
| positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq | 35,95B totales (mismo base) | no disponible | GPTQ 4 bits | Apache 2.0 | Vigente |
| Qwen/Qwen3.5-35B-A3B (base) | 35,95B totales | no disponible | BF16/FP16 | Apache 2.0 | Original |
| Otras cuantizaciones del mismo base (AWQ, GGUF) | 35,95B totales | no disponible | AWQ / GGUF | Apache 2.0 | No verificado |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Artefacto obsoleto: el autor lo marca como superseded; para nuevos despliegues debe usarse la version vigente.
- Sin metricas de calidad: no hay perplexity, KL-divergence ni evaluaciones que permitan estimar la degradacion frente al modelo original.
- Cuantizacion de 4 bits: perdida de precision esperable, especialmente en tareas de razonamiento matematico y codigo; requiere validacion propia.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue homogeneo.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones de fidelidad publicadas.
- Sesgos: no documentados en la informacion proporcionada.
- Contexto maximo desconocido: impide planificar cargas con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero se mantienen las restricciones del modelo base de Qwen; conviene revisar el LICENSE enlazado en la model card.
- Soporte de tool calling y agentes no confirmado: no disenar pipelines agenticos sin probarlo antes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq_proj
- Version vigente: https://huggingface.co/positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
