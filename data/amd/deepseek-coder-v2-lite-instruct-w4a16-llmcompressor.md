# amd/DeepSeek-Coder-V2-Lite-Instruct-w4a16-llmcompressor

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-w4a16-llmcompressor es una versión cuantizada a 4 bits del modelo DeepSeek-Coder-V2-Lite-Instruct de DeepSeek, publicada por AMD. El objetivo es habilitar la inferencia en CPU sobre procesadores AMD EPYC (arquitectura Zen) con un consumo de memoria reducido. La cuantización se realizó con LLM Compressor v0.14.0 mediante el algoritmo GPTQ en formato W4A16 (pesos INT4, activaciones BF16), reduciendo el peso en disco de 29,3 GiB a 8,4 GiB, aproximadamente un 71 % menos.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con arquitectura DeepseekV2ForCausalLM, 15.706.484.224 parámetros totales y una ventana de contexto de 128 000 tokens según la documentación del modelo original. Está especializado en generación de código, razonamiento y matemáticas, y mantiene el modo conversacional instruct del modelo de origen. Esta ficha se centra en la variante cuantizada, que conserva la funcionalidad del modelo original pero está optimizada para el stack ZenDNN de AMD.

La relevancia de esta publicación radica en que permite desplegar un modelo de código de 16 000 millones de parámetros en servidores sin GPU, usando únicamente CPU EPYC. El checkpoint sirve tanto para la ruta W4A16 como para DA8W4 (activaciones INT8 dinámicas, pesos INT4) en CPUs Zen, que es la ruta por defecto en vLLM con la variable `VLLM_CPU_INT4_W4A8=1`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepseekV2ForCausalLM (transformer MoE) |
| Parámetros totales | 15 706 484 224 (15,7 B) |
| Parámetros activos | no disponible en la información proporcionada (modelo MoE del que no se detalla el reparto) |
| Longitud de contexto | no disponible en la model card de esta variante; el modelo base DeepSeek-Coder-V2-Lite-Instruct declara 128 000 tokens |
| Tipos de cuantización | INT4 peso-solo (W4A16), simétrica, group_size=64, formato pack-quantized; también soporta DA8W4 (INT8 dinámico en activaciones) en Zen |
| Idiomas soportados | inglés (etiqueta `language: en` en la model card) |
| Licencia | deepseek-license (license: other) |
| Formato de pesos | safetensors en formato compressed-tensors (pack-quantized INT4); repo de 9,0 GB |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura DeepseekV2ForCausalLM, un transformer con capas de atención multi-cabeza con compresión latente (MLA, Multi-head Latent Attention) y capas MLP de tipo Mixture-of-Experts con expertos compartidos. La cuantización afecta a las proyecciones lineales de los expertos (`up_proj`, `gate_proj`, `down_proj` en 1664 módulos cada una), a las proyecciones de atención (`q_proj`, `kv_a_proj_with_mqa`, `kv_b_proj`, `o_proj`, 27 módulos cada una), a los expertos compartidos (26 módulos por proyección) y a las proyecciones MLP densas de una capa. Se mantienen en BF16 el `lm_head`, los `embed_tokens` y las layer norms.

El proceso de cuantización usó GPTQ con 128 muestras de calibración del dataset `HuggingFaceH4/ultrachat_200k`, truncadas a 2048 tokens, para construir las matrices de Hessian por capa. La configuración es `num_bits=4, type=int, symmetric=true, group_size=64`. El resultado se guarda en formato compressed-tensors con `save_compressed=True`. No se detalla en la información proporcionada el proceso de entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto y código en inglés: el modelo base está especializado en programación y tareas de razonamiento asociadas.
- Razonamiento y matemáticas: capacidades heredadas del modelo DeepSeek-Coder-V2-Lite-Instruct.
- Modo conversacional instruct: responde a instrucciones y mantiene diálogos multi-turno.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card de esta variante; el modelo base lo soporta según su documentación original.
- Capacidades de agente y razonamiento multi-paso: no confirmado en la información proporcionada para esta variante.
- Multilingüismo: limitado a inglés según la etiqueta de idioma de la model card.
- Inferencia en CPU AMD EPYC: capacidad específica de esta variante, optimizada con ZenDNN v6.2.0 y ZenTorch v2.14.0.3.

## Casos de uso

- Asistente de código en servidores sin GPU: desplegar el modelo con vLLM sobre CPU EPYC para autocompletar y explicar código en entornos donde no hay aceleradores disponibles; el peso de 8,4 GiB permite ejecutarlo en un nodo con memoria RAM suficiente.
- Revisión de código en pipelines de CI/CD: integrar el modelo como paso de análisis estático asistido por LLM para detectar patrones problemáticos o sugerir refactorizaciones, aprovechando la inferencia en CPU para no competir por recursos de GPU.
- Generación de documentación técnica: producir docstrings y documentación a partir de fragmentos de código, con la ventaja de que el modelo base está entrenado específicamente en código.
- Chatbot de soporte para desarrolladores: gestionar consultas técnicas multi-turno en inglés sobre APIs, lenguajes y errores de compilación, con el modo instruct del modelo.
- Traducción de código entre lenguajes: convertir fragmentos de un lenguaje a otro en tareas de migración, usando el conocimiento de código del modelo base.
- Prototipado y experimentación en CPU: evaluar un modelo de 15,7 B en hardware EPYC antes de decidir un despliegue en GPU, gracias a la reducción de memoria del 71 %.
- Enseñanza y formación: generar ejercicios de programación y explicaciones paso a paso en entornos educativos con infraestructura de CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible. La model card indica que el modelo fue evaluado contra la versión BF16 (sin cuantizar), pero el contenido de esa evaluación está truncado en la información proporcionada. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en GPU; el modelo está pensado para CPU. En disco ocupa 8,4 GiB (frente a 29,3 GiB del BF16).
- GPU recomendadas: no disponible; la model card especifica CPU AMD EPYC como hardware soportado.
- ¿Cabe en GPU de consumo? No es el objetivo de esta variante; no se proporcionan datos de VRAM para GPU.
- Opciones de despliegue: vLLM v0.33.0 con soporte CPU y ZenDNN; el stack requiere torch 2.13.0+cpu, zentorch 2.14.0.3, transformers 5.17.0 y llmcompressor 0.14.0. No se mencionan llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.
- Configuración adicional: es necesario definir `LD_PRELOAD` con `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) antes de lanzar vLLM para un rendimiento óptimo. Sistema operativo preferido: Linux.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| amd/DeepSeek-Coder-V2-Lite-Instruct-w4a16-llmcompressor | 15,7 B | no disponible en esta variante (128 k en el base) | INT4 W4A16 / DA8W4 | deepseek-license | CPU AMD EPYC |
| deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct (BF16) | 15,7 B | 128 k | BF16 | deepseek-license | GPU (BF16) |
| Otras variantes cuantizadas del mismo base | 15,7 B | 128 k | GPTQ/AWQ INT4 | deepseek-license | GPU |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparativa se limita a parámetros, contexto, licencia y hardware objetivo.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Alucinación: riesgo inherente a los modelos generativos; la cuantización a 4 bits puede degradar ligeramente la fidelidad respecto al BF16, aunque no se aportan métricas de esa degradación.
- Licencia: deepseek-license (license: other); es necesario revisar los términos del archivo LICENSE para uso comercial.
- Contexto: la model card de esta variante no declara explícitamente la longitud de contexto; se asume la del modelo base (128 k), pero no está confirmado para la versión cuantizada.
- Hardware: optimizado para CPU AMD EPYC con ZenDNN; el rendimiento en otras CPUs o en GPU no está documentado.
- Dependencias estrictas: requiere versiones concretas de torch, zentorch, vLLM y transformers; mezclar versiones puede romper la inferencia.
- Tool calling y agentes: no confirmados para esta variante en la información disponible.
- Producción: al ser una publicación reciente (noviembre de 2026) con 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/DeepSeek-Coder-V2-Lite-Instruct-w4a16-llmcompressor
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Licencia: LICENSE (incluida en el repositorio de Hugging Face)
