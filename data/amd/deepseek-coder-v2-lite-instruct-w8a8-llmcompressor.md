# amd/DeepSeek-Coder-V2-Lite-Instruct-w8a8-llmcompressor

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-w8a8-llmcompressor es una versión cuantizada a 8 bits del modelo DeepSeek-Coder-V2-Lite-Instruct, publicada por AMD. El modelo original, desarrollado por DeepSeek, es un transformer de tipo Mixture-of-Experts (MoE) orientado a generación de código, razonamiento y matemáticas, con 15.700 millones de parámetros totales. AMD ha aplicado cuantización W8A8 (pesos y activaciones en INT8) mediante LLM Compressor para optimizar la inferencia en CPU AMD EPYC a través de ZenDNN.

El objetivo de esta versión es reducir el coste de memoria y acelerar la inferencia en servidores con CPU AMD EPYC sin GPU, un escenario relevante para despliegues de bajo coste o entornos donde no hay aceleradores disponibles. La cuantización reduce el peso en disco de 29,3 GiB a 15,0 GiB (aproximadamente un 49% menos) manteniendo los pesos en formato compressed-tensors.

La relevancia actual radica en que permite ejecutar un modelo de código de 15,7B parámetros en infraestructura puramente CPU con un stack optimizado por AMD (ZenDNN, ZenTorch, vLLM), algo poco habitual en el ecosistema, dominado por despliegues en GPU. La licencia es la DeepSeek License, con restricciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepseekV2ForCausalLM (transformer MoE) |
| Parámetros totales | 15.706.484.224 (15,7B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W8A8: pesos INT8 simétricos per-channel (estáticos), activaciones INT8 simétricas per-token (dinámicas); lm_head, embed_tokens y layer norms en BF16 |
| Idiomas soportados | en |
| Licencia | deepseek-license (other) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-Coder-V2-Lite-Instruct, un transformer con arquitectura Mixture-of-Experts (MoE) bajo la clase DeepseekV2ForCausalLM. La model card de esta versión cuantizada no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO; esa información corresponde a la model card del modelo base y no se incluye aquí.

La innovación técnica de esta versión concreta es la cuantización W8A8 aplicada con LLM Compressor mediante el algoritmo Round-to-Nearest (RTN), que es data-free (no requiere conjunto de calibración). Se cuantizan las proyecciones de los expertos (up_proj, gate_proj, down_proj, 1664 cada una), las proyecciones de atención (q_proj, kv_a_proj_with_mqa, kv_b_proj, o_proj, 27 cada una), los expertos compartidos y las proyecciones MLP densas. El resultado se guarda en formato compressed-tensors y está optimizado para el stack ZenDNN v6.2.0 / ZenTorch v2.14.0.3 / PyTorch v2.14.0+cpu / vLLM v0.33.0 sobre CPU AMD EPYC.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, orientado a instrucciones).
- Generación y razonamiento sobre código, herencia directa del modelo DeepSeek-Coder-V2-Lite-Instruct.
- Razonamiento matemático: evaluado en GSM8K con 5-shot.
- Soporte de chat template (la evaluación se ejecuta con `--apply_chat_template`).
- Capacidades multilingües: la model card declara únicamente inglés (`en`); no se documentan otros idiomas.
- Tool calling / function calling: no documentado en la información disponible para esta versión cuantizada.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta model card.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Inferencia de código en servidores sin GPU: despliegue sobre CPU AMD EPYC con ZenDNN y vLLM para autocompletado y generación de código en entornos donde no hay aceleradores disponibles, aprovechando la reducción de memoria a 15,0 GiB.
- Asistentes de programación en infraestructura on-premise: integración en IDE o herramientas internas mediante la API de vLLM, manteniendo los datos en servidores propios con CPU.
- Evaluación de modelos cuantizados en pipelines de investigación: uso como referencia W8A8 frente al baseline BF16 para estudiar el impacto de la cuantización (la model card reporta recuperación del 101,99% en GSM8K).
- Razonamiento matemático y resolución de problemas: tareas de matemáticas de nivel escolar y competición (GSM8K) en lote sobre CPU, donde el throughput por núcleo es suficiente para procesamiento offline.
- Prototipado y CI/CD de bajo coste: ejecución de pruebas de generación de código o validación de prompts en runners CPU sin necesidad de reservar GPU.
- Despliegues con restricciones de memoria: al reducir el peso a 15,0 GiB, permite servir el modelo en nodos con menos RAM que la versión BF16 (29,3 GiB).
- Generación de documentación técnica y explicaciones de código en inglés: el modelo está orientado a instrucciones y declara soporte de inglés.

## Benchmarks y rendimiento

| Benchmark | BF16 baseline | W8A8 (este modelo) | Recuperación |
|---|---|---|---|
| GSM8K (5-shot) | 0.5322 | 0.5428 | 101,99% |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU AMD EPYC; la model card indica explícitamente que no está pensada para GPU.
- Peso en disco: 15,0 GiB (frente a 29,3 GiB del BF16); se requiere RAM suficiente para cargar los pesos más el overhead del runtime y la caché KV.
- Stack obligatorio: PyTorch 2.14.0+cpu, ZenTorch 2.14.0.3, ZenDNN 6.2.0, vLLM 0.33.0, LLM Compressor 0.14.0, Transformers 5.17.0.
- Sistema operativo preferido: Linux.
- Configuración recomendada: exportar `LD_PRELOAD` con `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) antes de lanzar vLLM para rendimiento óptimo.
- Opciones de despliegue: vLLM (motor indicado por el autor). No se documentan llama.cpp, Ollama ni TGI para esta versión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (AMD W8A8) | 15,7B | no disponible | W8A8 INT8 | deepseek-license | CPU AMD EPYC |
| deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct (BF16) | 15,7B | no disponible | BF16 | deepseek-license | GPU/CPU genérico |
| Otras alternativas de código de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es frente al baseline BF16 del mismo modelo, con recuperación del 101,99% en GSM8K. No se dispone de datos de benchmarks frente a otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Bloqueo de versión: compatible únicamente con ZenDNN v6.2.0 / ZenTorch v2.14.0.3 / PyTorch v2.14.0+cpu; puede no cargar correctamente con otras versiones.
- Solo CPU: optimizado para AMD EPYC vía ZenDNN; no destinado a inferencia en GPU.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia: DeepSeek License, con posibles restricciones para uso comercial; es necesario revisar el archivo LICENSE antes de un despliegue en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas en esta versión.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Contexto: la longitud de contexto no se especifica en esta model card; conviene consultar la del modelo base antes de diseñar aplicaciones con ventanas largas.
- Cuantización RTN data-free: al no usar calibración, la calidad puede degradarse en tareas distintas a las evaluadas (solo se reporta GSM8K).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/DeepSeek-Coder-V2-Lite-Instruct-w8a8-llmcompressor
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://docs.vllm.ai/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
