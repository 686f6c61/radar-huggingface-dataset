# iromu/Gemma3-1B-tools

## Resumen

Gemma3-1B-tools es un modelo de lenguaje de 1.000 millones de parámetros, desarrollado por el usuario iromu, que parte del modelo base `google/gemma-3-1b-it` y se ha ajustado mediante LoRA para especializarse en tool calling y en interacciones de tipo agente. El modelo resuelve el problema de que los modelos pequeños de la familia Gemma 3 no generan llamadas a herramientas de forma fiable: el ajuste fino eleva la tasa de coincidencia exacta de argumentos del 2,0 % al 66,0 % en la validación del autor.

La relevancia de este modelo radica en que ofrece una alternativa de pequeño tamaño para despliegues en el borde o en dispositivos con recursos limitados, donde los modelos grandes de propósito general no son viables. Su arquitectura es un transformer denso basado en Gemma 3, con una longitud de contexto de 4096 tokens durante el entrenamiento, y está disponible en formato safetensors y GGUF. La licencia es Gemma, que permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3) |
| Parametros totales | 999.885.952 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 (maxima durante entrenamiento) |
| Tipos de cuantizacion | BF16, GGUF (Q4_K_M, Q5_K_M, Q8_0, BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 de Google, un transformer denso con atención causal. El ajuste fino se realizó con NVIDIA NeMo AutoModel utilizando LoRA/PEFT, con una dimensión LoRA de 32, alpha de 32, dropout de 0,05 y módulos objetivo en todas las capas lineales `*_proj`. El entrenamiento se llevó a cabo con una longitud máxima de secuencia de 4096 tokens, tasa de aprendizaje de 5e-5 con decaimiento coseno, 15 pasos de warmup, peso de decaimiento de 0,01, tamaño de lote global de 64 y 336 pasos de entrenamiento (4 épocas) en precisión mixta bf16. La pérdida de validación descendió de 0,579 a 0,4715 en la época final.

El dataset de entrenamiento fue la división `sft_tools` de `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, un conjunto de datos de destilación para tool calling. El modelo incorpora una plantilla de chat personalizada (`chat_template.jinja`) que renderiza los esquemas de herramientas en un turno de desarrollador y emite llamadas a herramientas en un formato estructurado con etiquetas `<tool_call>`.

## Capacidades

- Generación de llamadas a herramientas estructuradas en formato JSON, con nombre de función y argumentos.
- Interacciones de tipo agente con múltiples pasos, gracias al ajuste específico para tool calling.
- Generación de texto conversacional, heredada del modelo base Gemma 3 1B.
- Soporte de tool calling y function calling mediante la plantilla de chat personalizada.
- Capacidad de despliegue en entornos con recursos limitados gracias a su tamaño reducido.
- Compatibilidad con stacks de servido que apliquen la plantilla de chat del tokenizador.

## Casos de uso

- Asistentes virtuales en el borde: el modelo puede gestionar conversaciones con llamadas a herramientas en dispositivos con poca memoria, como routers o dispositivos IoT, gracias a su tamaño de 1B y a las cuantizaciones GGUF que reducen la huella de memoria.
- Automatización de tareas de soporte técnico: integrado en un sistema de tickets, el modelo puede invocar funciones para consultar bases de conocimiento, crear incidencias o escalar problemas, con una tasa de éxito del 66 % en argumentos exactos en validación.
- Agentes de automatización de oficina: el modelo puede llamar a APIs de calendario, correo o gestión de documentos en flujos de trabajo de productividad, donde la latencia baja y el consumo reducido son prioritarios.
- Prototipado rápido de agentes: los desarrolladores pueden usar este modelo para validar pipelines de tool calling antes de migrar a modelos más grandes, gracias a su compatibilidad con vLLM, llama.cpp y TensorRT-LLM.
- Despliegue en entornos con GPU compartida: al ocupar menos de 2 GB en cuantización Q4_K_M, puede ejecutarse en instancias cloud de baja gama o junto a otros servicios en la misma GPU.
- Educación e investigación: sirve como banco de pruebas para estudiar el efecto del ajuste fino con LoRA en la capacidad de tool calling de modelos pequeños, con datos de validación publicados por el autor.

## Benchmarks y rendimiento

El autor publicó una matriz de validación sobre la división `sft_tools` del dataset de entrenamiento, con decodificación greedy y un máximo de 384 tokens nuevos. Los resultados comparan el modelo base sin ajustar con el modelo ajustado en distintas cuantizaciones:

| Modelo | Cuantizacion | Tool call emitido | Coincidencia de nombres | Coincidencia exacta de argumentos | Delta vs base | tok/s |
|---|---|---|---|---|---|---|
| Gemma3-1B-tools | BASE (google/gemma-3-1b-it) | 6/50 (12,0 %) | 1/50 (2,0 %) | 1/50 (2,0 %) | — | 68,5 |
| Gemma3-1B-tools | BF16 | 50/50 (100,0 %) | 41/50 (82,0 %) | 33/50 (66,0 %) | +64 pp | 47,1 |
| Gemma3-1B-tools | GGUF-BF16 | 50/50 (100,0 %) | 36/50 (72,0 %) | 20/50 (40,0 %) | +38 pp | 66,0 |
| Gemma3-1B-tools | GGUF-Q4_K_M | 50/50 (100,0 %) | 19/50 (38,0 %) | 10/50 (20,0 %) | +18 pp | 89,5 |
| Gemma3-1B-tools | GGUF-Q5_K_M | 50/50 (100,0 %) | 34/50 (68,0 %) | 24/50 (48,0 %) | +46 pp | 60,7 |
| Gemma3-1B-tools | GGUF-Q8_0 | 50/50 (100,0 %) | 37/50 (74,0 %) | 22/50 (44,0 %) | +42 pp | 50,2 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en BF16 (el repositorio ocupa 2,0 GB); con cuantización GGUF Q4_K_M, la huella se reduce por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A10, A100 o H100.
- Sí cabe en GPU de consumo: el modelo es adecuado para tarjetas de gama baja y media, así como para CPUs mediante llama.cpp.
- Opciones de despliegue: TensorRT-LLM (`trtllm-serve`), llama.cpp (`llama-cli`), y compatible con stacks que apliquen la plantilla de chat del tokenizador (vLLM, TGI).
- Latencia y throughput: el autor reporta entre 47,1 y 89,5 tokens/s en decodificación greedy de un solo stream, dependiendo de la cuantización. La cuantización Q4_K_M ofrece el mayor throughput (89,5 tok/s) pero con menor precisión en tool calling.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iromu/Gemma3-1B-tools | 1B | 4096 | Tool calling | Gemma | Hugging Face |
| google/gemma-3-1b-it | 1B | 128k | Proposito general | Gemma | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Proposito general | Apache 2.0 | Hugging Face |

El modelo base Gemma 3 1B soporta un contexto nativo de 128k tokens, pero este ajuste limita la longitud de entrenamiento a 4096, lo que puede afectar al rendimiento con contextos más largos. Qwen2.5-1.5B-Instruct es una alternativa de tamaño similar con licencia Apache 2.0, pero no está especializada en tool calling de forma específica.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado para otros idiomas.
- La longitud de contexto efectiva está limitada a 4096 tokens durante el entrenamiento, muy por debajo del contexto nativo de 128k del modelo base.
- La cuantización GGUF degrada significativamente la precisión de tool calling: Q4_K_M cae al 20 % de coincidencia exacta de argumentos, frente al 66 % en BF16.
- El modelo no está diseñado como reemplazo general de modelos Gemma más grandes; su uso previsto es exclusivamente para tool calling y agentes.
- La licencia Gemma impone restricciones de uso comercial que deben revisarse antes de desplegar el modelo en producción.
- El dataset de entrenamiento es una destilación de otros modelos (Qwen, GLM, Kimi), lo que puede heredar sesgos o errores de los modelos originales.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad específicas para este ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iromu/Gemma3-1B-tools
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Documentación de Gemma 3 en Transformers: https://huggingface.co/docs/transformers/model_doc/gemma3
- Página oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 en Ollama: https://ollama.com/library/gemma3:1b
