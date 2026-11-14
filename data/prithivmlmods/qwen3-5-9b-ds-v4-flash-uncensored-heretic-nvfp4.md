# prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4

## Resumen

Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4 es una cuantizacion NVFP4 del modelo Qwen3.5-9B-DS-v4-Flash-uncensored-heretic, publicado por el usuario prithivMLmods. Se trata de un derivado del Qwen3.5-9B base de Alibaba, afinado con trazas de razonamiento de DeepSeek V4 Flash y sometido a un proceso de abliteration (eliminacion de mecanismos de rechazo) que el autor etiqueta como "uncensored" y "decensored". El resultado es un modelo multimodal de 9.653.104.368 parametros (9,4 GB en safetensors) orientado a generacion de texto e imagen-texto.

La relevancia de esta publicacion es fundamentalmente tecnica: demuestra el pipeline de cuantizacion NVFP4 (formato de 4 bits de NVIDIA para Blackwell) aplicado con GPTQModifier de llm-compressor sobre un transformer multimodal, incluyendo un modulo auxiliar de Multi-Token Prediction (MTP) de 487 MB para decodificacion especulativa. El objetivo es reducir la huella de memoria y acelerar la inferencia en GPU Blackwell (SM120, GB202, B200, B300, RTX Pro 6000) sin degradar excesivamente la precision respecto a los pesos originales.

No obstante, conviene ser prudente: el autor califica explicitamente el release como experimental, con posibles artefactos de razonamiento, cero descargas y un unico "like" en el momento de la ficha. La model card no aporta datos de benchmarks, contexto, composicion del dataset ni detalles del proceso de abliteration. Todo lo que sigue se limita a lo verificable en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5, con modulo MTP para decodificacion especulativa |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, esquema NVIDIA FP4) con GPTQ; el repo incluye pesos en compressed-tensors y se etiqueta como 8-bit en los tags |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards: 5,18 GB + 3,7 GB) + model_mtp.safetensors (487 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5 con capacidad multimodal (pipeline image-text-to-text), lo que implica un codificador visual y proyeccion hacia el espacio de tokens del LLM. Sobre esa base, el autor anade un modulo MTP (Multi-Token Prediction) que actua como cabeza auxiliar para decodificacion especulativa: predice varios tokens por paso y acelera la generacion cuando se combina con un verificador. El repo incluye ademas un procesador multimodal (processor_config.json) y una plantilla de chat Jinja.

El entrenamiento original del que parte no esta documentado en la informacion disponible: no se especifica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o solo SFT. La model card solo menciona que se usaron "trazas de razonamiento de DeepSeek V4 Flash" para el ajuste orientado a razonamiento y que el modelo ha sido "abliterated" (proceso de eliminacion de direcciones de rechazo en el espacio de activaciones), sin detallar la metodologia. La cuantizacion se realizo con `GPTQModifier` de llm-compressor usando esquema NVFP4, `weight_observer: imatrix_mse`, `block_size: 128`, `dampening_frac: 0.01`, `actorder: static` y calibracion obligatoria; se excluyen de la cuantizacion `lm_head` y todas las capas cuyo nombre coincide con `.*visual.*`, de modo que el codificador visual conserva mayor precision.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Procesamiento de imagen y texto combinados (image-text-to-text): el pipeline declarado es multimodal, aunque la model card no detalla tareas visuales concretas (VQA, OCR, captioning).
- Razonamiento orientado por trazas estilo DeepSeek V4 Flash, segun la atribucion del autor.
- Decodificacion especulativa mediante el modulo MTP incluido en el repo.
- Sin mecanismos de rechazo (abliterated/uncensored): el modelo no aplica las salvaguardas del Qwen3.5 original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de castellano u otros idiomas.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre cuantizacion NVFP4: el modelo sirve como banco de pruebas para medir la perdida de calidad de GPTQ + NVFP4 frente a los pesos originales en un transformer de ~9,6B, comparando perplejidad y calidad de generacion en GPU Blackwell.
- Evaluacion de decodificacion especulativa con MTP: el modulo `model_mtp.safetensors` permite experimentar con acceptance rate y speedup en vLLM o TGI sobre hardware SM120, midiendo tokens por segundo frente a la generacion autoregresiva estandar.
- Despliegue en RTX Pro 6000 / B200 con presupuesto de VRAM ajustado: al ocupar ~9,4 GB en FP4, el modelo deja margen para KV cache y batching en GPUs de 24-48 GB, lo que facilita servir varias instancias o contextos largos.
- Estudio de alineacion y seguridad: al ser una variante abliterated, es util para investigar como la eliminacion de direcciones de rechazo afecta a la tasa de cumplimiento de peticiones daninas, como caso de analisis de riesgos en pipelines de moderacion.
- Prototipado de asistentes conversacionales en ingles: con licencia Apache 2.0 y pesos safetensors, se puede integrar en demos internas de chat multi-turno sin restricciones de uso comercial.
- Experimentos multimodales controlados: el pipeline image-text-to-text permite probar tareas de descripcion de imagenes o VQA en ingles, teniendo en cuenta que las capas visuales no se cuantizaron a FP4.
- Fine-tuning ligero sobre la base cuantizada: util para validar flujos de QLoRA/adapters sobre compressed-tensors en hardware Blackwell antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~9,4 GB solo para pesos en NVFP4; con overhead de activaciones, KV cache y procesador visual, se recomienda un minimo de 16-24 GB para contextos moderados.
- GPU compatibles con NVFP4: NVIDIA Blackwell (SM120), GB202, B200, B300 y RTX Pro 6000, segun los tags del autor.
- GPU consumer: las RTX 40xx (Ada) y anteriores no soportan NVFP4 de forma nativa; el modelo esta pensado para la generacion Blackwell, por lo que en consumer solo cabria esperar soporte en futuras RTX 50xx con SM120, no confirmado en la informacion disponible.
- Opciones de despliegue: vLLM y text-generation-inference (ambos listados en los tags), con llm-compressor como herramienta de cuantizacion; llama.cpp y Ollama no se mencionan y no hay evidencia de soporte GGUF.
- Latencia y throughput: no disponibles; el modulo MTP esta disenado para acelerar la generacion, pero el autor no publica cifras de speedup ni de acceptance rate.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4 (este) | 9,65B | no disponible | NVFP4 (GPTQ) | Apache 2.0 | Multimodal, abliterated, MTP, solo ingles |
| Qwen3.5-9B-DS-v4-Flash-uncensored-heretic (base) | 9,65B | no disponible | BF16/FP16 (presumiblemente) | Apache 2.0 | Version sin cuantizar del mismo autor; mayor VRAM |
| Qwen3.5-9B (original) | ~9B | no disponible | multipled | Apache 2.0 (presumiblemente) | Modelo base con salvaguardas intactas |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Solo se usa como fuente de trazas de razonamiento, no como modelo comparable directo |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para ninguna de las variantes en la informacion disponible.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte de posibles comportamientos inesperados y artefactos de razonamiento; los outputs deben evaluarse de forma independiente.
- Sin salvaguardas: la variante abliterated/uncensored elimina los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o inseguro sin filtro. No apta para exposicion directa a usuarios finales sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; al ser un fine-tune sobre trazas de razonamiento y ademas cuantizado a 4 bits, la degradacion de precision es plausible y no esta medida.
- Solo ingles declarado: no hay evidencia de calidad en castellano ni en otros idiomas; el tokenizer es el de Qwen3.5, pero el ajuste se documenta unicamente en ingles.
- Contexto no documentado: se desconoce la longitud de contexto efectiva, lo que impide planificar cargas con ventanas largas.
- Cuantizacion NVFP4 restrictiva: requiere hardware Blackwell; no hay soporte documentado para GGUF, llama.cpp ni GPUs consumer anteriores, lo que limita el despliegue.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte, y la responsabilidad legal del contenido generado recae en el desplegador.
- Cero descargas y un unico "like" en el momento de la ficha: no hay validacion comunitaria ni reportes independientes de calidad.
- El tag "8-bit" y "compressed-tensors" convive con "nvfp4" y "FP4"; conviene verificar en `config.json` el esquema real antes de asumir un formato concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4
- Modelo base (sin cuantizar): https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic
- Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- Licencia Apache 2.0: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md
- Recipe de cuantizacion: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4/blob/main/recipe.yaml
- Config del modelo: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4/blob/main/config.json
