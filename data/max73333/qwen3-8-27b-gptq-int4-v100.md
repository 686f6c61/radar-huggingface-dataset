# Max73333/Qwen3.8-27B-GPTQ-Int4-V100

## Resumen

Qwen3.8-27B-GPTQ-Int4-V100 es una cuantización de 4 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario Max73333. No se trata de un modelo entrenado desde cero, sino de una build de inferencia pensada para un problema muy concreto: ejecutar un modelo de 27.781.427.952 parámetros en GPU NVIDIA Tesla V100 (compute capability 7.0 / sm_70), donde las builds precuantizadas en AWQ o compressed-tensors fallan porque sus kernels exigen una compute capability igual o superior a 7.5.

La cuantización se realizó con GPTQModel usando GPTQ de 4 bits, group_size 128, desc_act=false y simetría activada (sym=true), partiendo de los pesos originales del modelo base. El resultado se distribuye en formato safetensors, con un repositorio de 19,6 GB y licencia Apache 2.0, y se acompaña de un runtime Docker con vLLM parcheado para Volta.

Su relevancia práctica es doble: por un lado, permite reutilizar parques de servidores V100 de 32 GB que de otro modo quedarían fuera del circuito de modelos de ~28B en 4 bits; por otro, documenta con detalle las limitaciones reales del montaje (parches a nivel de código fuente en vLLM, arranque en frío de Docker de ~15 minutos, primera petición de ~10 minutos y una ventana de contexto validada únicamente a 4096 tokens).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (clase interna `Qwen3_5ForCausalLM`); el modelo base está etiquetado como `image-text-to-text`, pero esta build solo está validada para texto |
| Parámetros totales | 27.781.427.952 (~27,8 mil millones) |
| Parámetros activos | No aplica: no se documenta una arquitectura MoE |
| Longitud de contexto | No disponible; la build cuantizada se ha validado con `--max-model-len 4096` y el autor recomienda probar 8192, 16384 y 32768 de forma incremental |
| Tipos de cuantización | GPTQ 4 bits, group_size 128, desc_act=false, sym=true |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 19,6 GB) |
| Librería | transformers (también ejecutable con vLLM parcheado) |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.8-27B |
| Hardware objetivo | NVIDIA Tesla V100-SXM2-32GB, compute capability 7.0 (sm_70) |
| Descargas / likes | 10.046 descargas, 3 likes |
| Fechas | Creado el 2026-08-22, actualizado el 2026-09-11 |

## Arquitectura y entrenamiento

Esta ficha describe una cuantización, no un entrenamiento. El proceso parte de los pesos de Qwen/Qwen3.8-27B y aplica GPTQ con `QuantizeConfig(bits=4, group_size=128, desc_act=False, sym=True)` mediante GPTQModel. No se aporta información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base usó RLHF, DPO u otra fase de alineamiento: esos datos no están disponibles en la información proporcionada.

Lo relevante desde el punto de vista de ingeniería es el camino de ejecución. El modelo emplea internamente clases de la familia Qwen3.5, y la ruta de texto requiere enrutado explícito a `Qwen3_5ForCausalLM`, además de desactivar la inicialización multimodal para este caso de uso. El autor documenta dos obstáculos adicionales en vLLM: el perfilado de CUDA Graph choca con una disposición ambigua de la caché KV híbrida cuando la forma de la caché de perfilado es `[2, 2, ...]`, y la build probada necesitó parches a nivel de código fuente. El backend de prefill utilizado se identifica como `gdn` con kernels Triton, y el entorno validado es CUDA 12.8, PyTorch 2.10.0+cu128, cuDNN 9.10.2 y Triton 3.6.0 sobre un commit concreto de vLLM (`bcf2be96120005e9aea171927f85055a6a5c0cf6`).

Como innovación práctica, la build resuelve el problema de los kernels GPTQ/compressed-tensors que exigen sm_75 o superior, ofreciendo una alternativa funcional en Volta. Además, la configuración probada usa CUDA Graph en lugar de `--enforce-eager`, lo que según el autor mejora notablemente el rendimiento tras el calentamiento.

## Capacidades

- Generación de texto conversacional y de propósito general, en el rango de 27,8 mil millones de parámetros en 4 bits.
- Modo de razonamiento con bloques de pensamiento: el modelo puede emitir secciones delimitadas por `<think> ... </think>`, que la aplicación debe separar del texto visible.
- Generación de código y matemáticas: capacidad esperable por familia y tamaño, pero no verificada ni documentada en la información proporcionada (no disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el límite de `--max-num-seqs 1` de la configuración probada limita el uso como agente concurrente.
- Capacidades multilingües: no disponibles. El único ejemplo de petición incluido en la model card está en ruso, pero no se declara una lista de idiomas soportados.
- Capacidades multimodales (visión): el modelo base está etiquetado como `image-text-to-text`, pero esta cuantización no valida ni reclama funcionalidad de visión.
- Servicio compatible con la API de OpenAI (`/v1/completions`) a través del servidor vLLM.

## Casos de uso

- Reutilización de parques de GPU Volta: equipos con Tesla V100-SXM2 de 32 GB pueden servir un modelo de ~28B en 4 bits sin sustituir hardware. Es el escenario para el que se creó la build, ya que las alternativas AWQ/compressed-tensors fallan con error de compute capability mínima 7.5.
- Asistente conversacional interno de contexto corto: con la ventana validada de 4096 tokens, encaja en asistentes técnicos o de soporte interno donde las conversaciones no superan unos pocos miles de tokens.
- Procesamiento por lotes de documentos: resúmenes, reescritura y extracción de información sobre textos que quepan en 4096 tokens, ejecutados en modo offline donde el arranque en frío de ~15 minutos se amortiza a lo largo de horas de trabajo.
- Servicio on-premise con requisitos de privacidad: al desplegarse con vLLM en local y licencia Apache 2.0, permite mantener los datos dentro de la infraestructura propia sin depender de API externas.
- Prototipado y evaluación comparativa de Qwen3.8-27B: sirve para medir calidad y comportamiento del modelo base en 4 bits antes de decidir un despliegue en precisión completa o en hardware más moderno.
- Pipelines con razonamiento explícito: aplicaciones que necesitan trazas de razonamiento separadas de la respuesta final, procesando los bloques `<think>` en el post-procesado o en la plantilla de chat.
- Generación de texto a baja concurrencia: con `--max-num-seqs 1` y ~37-40 tokens/s en estado estable, es adecuado para servicios de un solo usuario o colas de trabajos secuenciales, no para endpoints con tráfico concurrente alto.
- Entornos educativos y de laboratorio: montaje reproducible con Docker, versiones fijadas de CUDA, PyTorch y Triton, y comandos de lanzamiento documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente publica mediciones de rendimiento de inferencia en su configuración probada.

| Prueba (1x Tesla V100-SXM2-32GB) | Resultado |
|---|---|
| 100 tokens generados, primera petición tras calentamiento | ~15 s |
| 100 tokens generados, peticiones posteriores | ~2,7 s |
| 500 tokens generados | ~12,5 s |
| Generación en estado estable | ~37-40 tokens/s |
| Arranque en frío del contenedor Docker | ~15 minutos |
| Primera petición tras el arranque | ~10 minutos |

Condiciones de medida declaradas: `max_model_len = 4096`, `max_num_seqs = 1`, GPTQ Int4, backend GDN con Triton y ejecución compilada con CUDA Graph. El autor advierte que el rendimiento puede variar significativamente entre versiones de vLLM, PyTorch, CUDA y Triton.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 14-15 GB en el formato GPTQ 4 bits con group_size 128 (4 bits por peso más escalas y offsets por grupo), sobre un repositorio de 19,6 GB en disco. Estimación derivada del recuento de parámetros; no publicada por el autor.
- GPU validada: NVIDIA Tesla V100-SXM2-32GB, compute capability 7.0 (sm_70). Es la única configuración probada y documentada.
- Configuración de memoria probada: `--gpu-memory-utilization 0.90`, es decir, unos 28,8 GB de los 32 GB de la V100 reservados para pesos y caché KV, con `--max-model-len 4096` y `--max-num-seqs 1`.
- GPU de consumo: no hay pruebas documentadas. Sobre el papel, una GPU de 24 GB (RTX 3090, RTX 4090) dispondría de margen para los pesos, pero la build está orientada a sm_70 y no se verifica su comportamiento en otras arquitecturas.
- GPUs de centro de datos: no se documentan pruebas en A100, H100 u otras. Al ser una cuantización GPTQ de 4 bits, existen builds alternativas específicas para esos entornos.
- Despliegue recomendado: vLLM compilado desde código fuente con `TORCH_CUDA_ARCH_LIST="7.0"` y `CUDA_HOME=/usr/local/cuda-12.8`, más el contenedor Docker publicado en el repositorio de GitHub del autor.
- Comando de lanzamiento probado: `vllm serve` con `--served-model-name qwen38 --gpu-memory-utilization 0.90 --max-model-len 4096 --max-num-seqs 1 --gdn-prefill-backend triton`. El autor desaconseja `--enforce-eager` salvo para depuración.
- Otras opciones de despliegue: la librería declarada es transformers; no se documenta compatibilidad con llama.cpp, Ollama ni TGI, y el formato GPTQ no es directamente consumible por llama.cpp sin una conversión a GGUF que no está documentada.
- Latencia y throughput: ~37-40 tokens/s en estado estable en la V100 probada, con una penalización muy alta en la primera petición tras el arranque del servidor.
- Ventana de contexto: ampliar por encima de 4096 tokens exige pruebas incrementales (8192, 16384, 32768), porque el consumo de caché KV depende de la utilización de memoria configurada, la versión de vLLM, el uso de memoria de CUDA Graph, el número de secuencias concurrentes y la disposición de la caché híbrida de atención y estado recurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Max73333/Qwen3.8-27B-GPTQ-Int4-V100 | 27,78 B | GPTQ 4 bits, group_size 128 | 4096 tokens validados | Apache 2.0 | Pública en HuggingFace, con runtime Docker para sm_70 |
| Qwen/Qwen3.8-27B (modelo base) | 27,78 B | Sin cuantizar (bf16/fp16; ~55,6 GB de pesos en bf16, cálculo derivado) | No disponible | Apache 2.0 | Pública en HuggingFace; requiere hardware con más VRAM y soporte de kernels estándar |
| Builds pre-cuantizadas en AWQ o compressed-tensors de la misma familia | No disponible | 4 bits (AWQ / compressed-tensors) | No disponible | No disponible | Mencionadas en la model card como existentes, pero sus kernels requieren compute capability ≥ 7.5, por lo que no funcionan en V100 |

No se dispone de datos verificados de benchmarks que permitan comparar el rendimiento en calidad de esta build frente a otras alternativas del mismo tamaño, por lo que la comparación se limita a formato, licencia, hardware compatible y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta evaluación de sesgos ni de seguridad.
- Riesgo de alucinación: no cuantificado. La cuantización a 4 bits puede degradar la calidad respecto al modelo base en precisión completa, pero no se publican métricas comparativas que lo confirmen.
- Contexto limitado en la práctica: la única longitud validada es 4096 tokens. El propio autor indica que 8192, 16384 y 32768 deben probarse de forma incremental por el consumo de caché KV.
- Idiomas: no se declara lista de idiomas soportados; la ausencia de esta información dificulta garantizar calidad multilingüe en producción.
- Concurrencia muy baja: la configuración probada usa `--max-num-seqs 1`, lo que limita el despliegue a un único flujo simultáneo.
- Arranque en frío muy lento: ~15 minutos de Docker y hasta ~10 minutos para la primera generación, un coste inasumible en arquitecturas con escalado automático agresivo.
- Dependencia de parches: el montaje requiere una build de vLLM modificada a nivel de código fuente. No se garantiza que una versión estándar de vLLM ejecute este modelo sin cambios.
- Sin FlashAttention 2: no está disponible en V100; el montaje usa kernels basados en Triton, lo que condiciona el rendimiento y las opciones de configuración.
- Multimodalidad no validada: aunque el modelo base está etiquetado como `image-text-to-text`, esta build solo cubre generación de texto.
- Formato cerrado a un ecosistema: GPTQ limita las opciones de despliegue (vLLM, transformers) y descarta de facto llama.cpp u Ollama sin una conversión no documentada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias del runtime (vLLM, Triton, CUDA) antes de un despliegue en producción.
- Bloques de razonamiento: si la aplicación no procesa las etiquetas `<think>`, el razonamiento puede filtrarse a la respuesta visible del asistente.
- Rendimiento variable: el autor advierte que los resultados pueden cambiar de forma significativa entre versiones de vLLM, PyTorch, CUDA y Triton.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Max73333/Qwen3.8-27B-GPTQ-Int4-V100
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime Docker y vLLM parcheado para V100 (SM70): https://github.com/pmaxx73/qwen38-v100
- Paper, blog o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente portales de inicio de sesión sin relación).
