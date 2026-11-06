# INCModel4/NVIDIA-Nemotron-3-Nano-30B-A3B-W4A16-AutoRound

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-W4A16-AutoRound es una versión cuantizada del modelo nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, publicada por el usuario INCModel4 (no por NVIDIA ni por Intel). Se trata de una cuantización de solo pesos a 4 bits (W4A16, group_size 64, simétrica) generada con la herramienta intel/auto-round tras 200 iteraciones de ajuste, manteniendo las activaciones en BF16. El objetivo es reducir la huella de memoria del modelo original sin degradar de forma apreciable su calidad.

El modelo base es un modelo de lenguaje de tipo híbrido (arquitectura `nemotron_h`, según la etiqueta del repo), con atención y capas Mamba, y un total de 5.724.366.176 parámetros reales en los safetensors publicados (el nombre comercial "30B-A3B" hace referencia a la nomenclatura del modelo base; el conteo efectivo de pesos en este repo es de aproximadamente 5,7 mil millones). La cuantización deja en BF16 atención, router, proyecciones Mamba adyacentes a la atención, convolución, embeddings y lm_head, mientras que cuantiza a 4 bits los expertos enrutados, expertos compartidos y proyecciones Mamba.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización reproducible con AutoRound sobre un modelo híbrido; por otro, advierte de que se trata de una publicación de terceros con 0 descargas y 0 likes en el momento de la consulta, sin model card propia más allá de la del cuantizador, y sujeta a la licencia del modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (híbrida atención + Mamba), según tag del repo |
| Parametros totales | 5.724.366.176 (safetensors del repo cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (int4 en pesos, BF16 en activaciones), group_size 64, simétrica |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (heredada del modelo base) |
| Formato de pesos | safetensors (formato AutoRound), con `custom_code` y compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido identificado por la arquitectura `nemotron_h`, que combina capas de atención con capas Mamba (state space models). La receta de cuantización de AutoRound congela en BF16 los componentes sensibles: `lm_head`, `backbone.embeddings`, las proyecciones de atención (`mixer.q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate`), la convolución (`mixer.conv1d`) y las proyecciones `in_proj`/`out_proj` de las capas Mamba en los índices 4, 11, 18, 25, 32 y 41. El resto de pesos (expertos enrutados, expertos compartidos y proyecciones Mamba no excluidas) se cuantizan a int4 con group_size 64.

El proceso de cuantización se ejecutó con `auto-round --scheme W4A16 --iters 200 --nsamples 128 --seqlen 2048 --batch_size 1 --low_gpu_mem_usage`, usando el algoritmo de redondeo por descenso de gradiente con signo descrito en el paper arXiv:2309.05516. No se dispone de información sobre el dataset de calibración, el número de tokens de entrenamiento del modelo base ni si este recibió RLHF/DPO; la model card del cuantizador no lo detalla.

## Capacidades

- Generación de texto conversacional: el repo incluye la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento y matemáticas: el benchmark GSM8K reportado (95,30 en W4A16) sugiere capacidad de resolución de problemas aritméticos de varios pasos.
- Conocimiento general: MMLU reportado en 70,67, lo que indica cobertura amplia de materias.
- Comprensión de sentido común: HellaSwag reportado en 59,30 y PIQA en 80,69.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repo no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de gama alta con requisitos de memoria reducidos: la versión W4A16 permite servir el modelo con menos VRAM que el BF16 original, usando vLLM 0.32.0 con `--dtype bfloat16`, lo que resulta adecuado para entornos donde el modelo completo no cabe.
- Evaluación comparativa de cuantización: útil como referencia para medir la pérdida de calidad de W4A16 frente a BF16 en tareas de razonamiento (GSM8K) y conocimiento (MMLU), con una recuperación media reportada del 99,86 %.
- Generación de texto conversacional en prototipos: al ser compatible con `transformers` y con endpoints, puede integrarse en demos de chat siempre que se valide la calidad en el dominio concreto.
- Investigación sobre modelos híbridos atención-Mamba: permite estudiar el comportamiento de la cuantización en capas SSM y en mezclas de expertos, dado que la receta excluye selectivamente ciertas proyecciones.
- Pipelines de CI/CD para validación de cuantizaciones: la receta `auto-round` publicada es reproducible y sirve como plantilla para cuantizar otros modelos con la misma configuración.
- Fine-tuning ligero o adaptación posterior: al mantener embeddings, lm_head y atención en BF16, es posible aplicar técnicas de adaptación sobre esas partes sin descuantizar el resto, aunque no se documenta soporte oficial.
- Serving con vLLM en producción interna: la instrucción `vllm serve` del autor permite levantar un endpoint compatible con la API de OpenAI, sujeto a la licencia de NVIDIA.

## Benchmarks y rendimiento

| Benchmark | BF16 | W4A16 | Recuperación |
|---|---:|---:|---:|
| GSM8K | 94,84 | 95,30 | 100,48 % |
| PIQA | 80,52 | 80,69 | 100,20 % |
| MMLU | 71,21 | 70,67 | 99,24 % |
| HellaSwag | 59,82 | 59,30 | 99,13 % |
| **Media** | **76,60** | **76,49** | **99,86 %** |

Los datos proceden de la model card del cuantizador. No se han publicado en la información disponible resultados de benchmarks del modelo base frente a modelos de la competencia, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 19,7 GB en safetensors; en la práctica se necesita margen adicional para el contexto KV y activaciones, por lo que se recomienda al menos 24 GB de VRAM para servir el modelo cuantizado con contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para el modelo cuantizado; el BF16 original requiere bastante más memoria.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB o más, siempre que se ajuste el contexto; en GPUs de 16 GB no es viable sin cuantización adicional de activaciones o del KV cache.
- Opciones de despliegue: vLLM 0.32.0 (recomendado por el autor), `transformers` con `custom_code`; llama.cpp/Ollama no están documentados para este formato AutoRound.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-30B-A3B-W4A16-AutoRound (este) | 5.724.366.176 en safetensors | no disponible | nvidia-nemotron-open-model-license | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (base) | no disponible en la información | no disponible | nvidia-nemotron-open-model-license | Hugging Face (referenciado) |
| Otras cuantizaciones W4A16 del mismo base | no disponible | no disponible | heredada | no disponible |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes (por ejemplo, modelos de tamaño similar de Meta, Mistral o Qwen) en parámetros, contexto o rendimiento; por tanto, esa comparación se indica como no disponible.

## Limitaciones y advertencias

- Publicación de terceros: el repo lo mantiene el usuario INCModel4, no NVIDIA ni Intel; no hay garantía de mantenimiento, soporte ni actualizaciones.
- Sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que impide validar su comportamiento en producción por parte de la comunidad.
- Riesgo de alucinación: la propia model card advierte de que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de información veraz.
- Sesgos y contenido ofensivo: la model card señala la posibilidad de generar salidas soeces, sesgadas u ofensivas; se recomienda realizar pruebas de seguridad antes de desplegar.
- Licencia: se hereda la nvidia-nemotron-open-model-license, que no es una licencia de código abierto estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Contexto: no se documenta la longitud máxima de contexto en la información disponible; hay que verificarla en el modelo base antes de usarlo con prompts largos.
- Formato propietario de cuantización: requiere vLLM 0.32.0 o AutoRound; no es directamente compatible con llama.cpp ni con herramientas que esperan GGUF.
- Sin datos de latencia ni throughput: no es posible dimensionar infraestructura con la información publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/INCModel4/NVIDIA-Nemotron-3-Nano-30B-A3B-W4A16-AutoRound
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- AutoRound (GitHub): https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper AutoRound: https://arxiv.org/abs/2309.05516
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
