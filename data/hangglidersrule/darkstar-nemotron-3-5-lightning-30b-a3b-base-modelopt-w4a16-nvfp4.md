# HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4

## Resumen

Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4 es una cuantización del modelo oficial de NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por HangGlidersRule bajo su marca Darkstar. Se trata de un artefacto base (sin edición de pesos ni alineación de refuerzo) que aplica la técnica W4A16-NVFP4 de NVIDIA Model Optimizer para reducir el peso de los 30B parámetros originales a un tamaño manejable en una sola GPU (aproximadamente 22 GB). La arquitectura es híbrida Mamba2 + Transformer + atención sparse, con 52 capas y una ventana de contexto de 262 144 tokens.

La relevancia de este modelo radica en que ofrece el punto de partida base de la familia Nemotron-3.5-Lightning con una huella de memoria reducida y sin pérdida de las capas críticas (embeddings, atención, Mamba), que se mantienen en BF16. Al ser un modelo MoE con solo 3B parámetros activos, es adecuado para despliegues de agentes siempre activos donde la latencia y el throughput son prioritarios. El rendimiento medido alcanza 541,7 tokens por segundo con decodificación especulativa MTP7, lo que lo convierte en una opción atractiva para entornos de producción con una sola GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + Transformer + atención sparse (52 capas) |
| Parametros totales | 30B (MoE); 16.661.042.624 pesos en safetensors cuantizado |
| Parametros activos | 3B |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | W4A16 NVFP4 (pesos 4 bits FP4, activaciones 16 bits), con capas protegidas en BF16 |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 (misma que el modelo base NVIDIA) |
| Formato de pesos | safetensors (3 shards, ~22 GB) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero; es una cuantización del checkpoint oficial NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, aplicada con NVIDIA Model Optimizer `0.46.0rc2` y la receta `w4a16_nvfp4_mse-fp8_attn-kv_bf16_nemotron_h.yaml`. La arquitectura subyacente es híbrida: combina bloques Mamba2 (SSM) con bloques Transformer de atención sparse y una mezcla de expertos (MoE) con 3B parámetros activos de un total de 30B. La cuantización protege en BF16 las capas críticas para la estabilidad numérica: lm_head, todos los componentes Mamba/SSM (conv1d, in_proj, out_proj, A_log, D, dt_bias), las proyecciones de atención (q/k/v/o y BMM), normas, embeddings y la cabeza MTP. Solo las proyecciones up/down de los expertos (5.934 módulos) se cuantizan a W4A16 NVFP4 con group size 16. La calibración se realizó con 512 ejemplos de cnn_dailymail y 512 de Nemotron-Post-Training-Dataset-v2, con longitud de secuencia 2048, seed 1234 y batch 1, manteniendo la caché KV en BF16.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento y ejecución de tareas de agente, especialmente en escenarios de alta frecuencia y baja latencia.
- Procesamiento de contexto largo (262 144 tokens), adecuado para documentos extensos y ventanas de diálogo amplias.
- Decodificación especulativa MTP (Multi-Token Prediction) con hasta 12 tokens especulativos; la configuración óptima medida es MTP7.
- Modelo base sin alineación de refuerzo, lo que permite fine-tuning para dominios específicos sin interferencia de direcciones de rechazo.
- Eficiencia computacional: solo 3B parámetros activos por token, reduciendo la latencia y el consumo de memoria.

## Casos de uso

- Agentes siempre activos en producción: con 3B parámetros activos y un throughput de 541,7 tok/s (MTP7), es adecuado para agentes que requieren respuestas rápidas en sistemas de atención al cliente o asistentes virtuales con alta concurrencia.
- Procesamiento de documentos extensos: su ventana de 262 144 tokens permite resumir, extraer información o responder preguntas sobre libros, informes financieros o expedientes técnicos completos en una sola pasada.
- Fine-tuning de modelos base: al ser un artefacto base sin alineación, se puede adaptar a dominios específicos (legal, médico, código) con datasets propios, aprovechando la cuantización para reducir los requisitos de VRAM durante el entrenamiento.
- Generación de código en entornos de baja latencia: aunque no hay benchmarks públicos, el modelo base de NVIDIA Nemotron 3.5 Lightning está orientado a tareas de agente, por lo que puede integrarse en pipelines de CI/CD para autocompletado o revisión de código con tiempos de respuesta subsegundo.
- Despliegue en una sola GPU de consumo: con ~22 GB de VRAM, es ejecutable en RTX 3090, RTX 4090 o A10, lo que reduce los costes de infraestructura en comparación con el checkpoint BF16 completo.
- Servicio de inferencia con decodificación especulativa: su compatibilidad con vLLM y el mecanismo MTP permite servir a múltiples usuarios con latencia media reducida, útil en APIs de texto en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card reporta mediciones de throughput:

| Configuración | Throughput (tok/s) |
|---|---|
| MTP7 (promedio ponderado 4K/16K/48K) | 541,7 |
| MTP7 a 4K | 562,2 |
| MTP7 a 16K | 548,0 |
| MTP7 a 48K | 399,7 |
| DFlash (sin MTP) | 523,9 |

## Requisitos de hardware

- VRAM estimada: ~22 GB en cuantización W4A16 NVFP4.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100, H100 (cualquier GPU con 24 GB o más).
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB VRAM (RTX 3090/4090).
- Opciones de despliegue: vLLM (configuración recomendada con MTP7), también se puede convertir a GGUF para llama.cpp u Ollama.
- Latencia y throughput: 541,7 tok/s con MTP7 y KV cache en BF16; 523,9 tok/s con DFlash.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM | Licencia |
|---|---|---|---|---|---|
| Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-NVFP4 (este) | 30B (3B activos) | 262 144 | W4A16 NVFP4 | ~22 GB | OpenMDW-1.1 |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B (3B activos) | 262 144 | BF16 | ~60 GB | OpenMDW-1.1 |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark | 30B (3B activos) | 262 144 | W4A16 NVFP4 + DSpark | ~22 GB | OpenMDW-1.1 |

La principal diferencia frente al BF16 es el menor consumo de VRAM (22 GB vs ~60 GB) con una pérdida de precisión mínima en las capas cuantizadas. La variante DSpark añade decodificación especulativa optimizada para DGX Spark, mientras que este modelo se centra en el artefacto base sin ediciones, con MTP7 como configuración óptima.

## Limitaciones y advertencias

- Es un modelo base, no alineado con instrucciones; no debe usarse directamente como chatbot sin fine-tuning o un sistema de plantillas de prompts.
- La cuantización NVFP4 puede introducir ligeras pérdidas de precisión en tareas numéricas o de razonamiento complejo; las capas críticas están protegidas en BF16 para mitigarlo.
- No se han publicado datos sobre sesgos, alucinaciones o rendimiento en idiomas distintos del inglés; los idiomas soportados no están especificados.
- Licencia OpenMDW-1.1: permite uso comercial, pero requiere conservar los avisos de copyright de NVIDIA en las distribuciones derivadas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que es muy reciente y carece de soporte comunitario o validación en producción.
- La configuración recomendada de vLLM exige `--reasoning-parser nemotron_v3` y `--speculative-config`, lo que puede no ser compatible con todas las versiones de vLLM.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio GitHub model-forge: https://github.com/HangGlidersRule/model-forge
- Página de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/</think>## Resumen

Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4 es una cuantización del modelo oficial NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por HangGlidersRule bajo su marca Darkstar. Se trata de un artefacto base (sin edición de pesos ni proyección de direcciones de rechazo) que aplica la técnica W4A16-NVFP4 de NVIDIA ModelOpt para reducir el peso de los 30B parámetros originales a un tamaño manejable en una sola GPU (aproximadamente 22 GB). La arquitectura es híbrida Mamba2 + MoE + atención sparse, con 52 capas y una ventana de contexto de 262 144 tokens.

La relevancia del modelo radica en que ofrece un punto de partida limpio para la familia Darkstar Nemotron-3.5-Lightning, con la cuantización aplicada exclusivamente a las proyecciones de los expertos (5.934 módulos) mientras que las capas críticas (embeddings, atención, Mamba, normas, cabeza MTP) se mantienen en BF16. Al ser un modelo MoE con solo 3B parámetros activos, es adecuado para despliegues de agentes siempre activos donde la latencia y el coste de inferencia son prioritarios. El rendimiento medido alcanza 541,7 tokens por segundo con decodificación especulativa MTP7, lo que lo convierte en una opción viable para producción en una sola GPU de 24 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + Transformer + atención sparse (52 capas) |
| Parametros totales | 30B (MoE); 16.661.042.624 pesos en safetensors cuantizado |
| Parametros activos | 3B |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | W4A16 NVFP4 (pesos 4 bits FP4, activaciones 16 bits), con capas protegidas en BF16 |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (3 shards, ~22 GB) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero; es una cuantización del checkpoint oficial `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` en su revisión `d468880b6ad3c6e0d21377ce7242adaea4cc884d`. La cuantización se realizó con NVIDIA Model Optimizer `0.46.0rc2` y la receta `w4a16_nvfp4_mse-fp8_attn-kv_bf16_nemotron_h.yaml`. La arquitectura subyacente es híbrida: combina bloques Mamba2 (SSM) con bloques Transformer de atención sparse y un conjunto de expertos (MoE) con 3B parámetros activos de un total de 30B. La calibración se efectuó con 512 ejemplos de cnn_dailymail y 512 de Nemotron-Post-Training-Dataset-v2, con longitud de secuencia 2048, seed 1234 y batch 1. La caché KV se mantiene en BF16 (cuantización desactivada). Las capas protegidas en BF16 incluyen: `lm_head`, todos los componentes Mamba/SSM (conv1d, in_proj, out_proj, A_log, D, dt_bias), las proyecciones de atención (q/k/v/o y BMM), normas, embeddings y la cabeza MTP. Solo las proyecciones up/down de los expertos (routed y shared, 5.934 módulos) se cuantizan a W4A16-NVFP4 con group size 16.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento y ejecución de tareas de agente, especialmente en escenarios de alta velocidad y baja latencia (agentes siempre activos).
- Procesamiento de contexto largo de 262 144 tokens, adecuado para documentos extensos o ventanas de diálogo amplias.
- Decodificación especulativa MTP (Multi-Token Prediction) con soporte de 1 a 12 tokens especulativos; la configuración óptima medida es MTP7.
- Modelo base sin edición de direcciones de rechazo, lo que permite fine-tuning o abliteración posterior sin interferencias.
- Eficiencia computacional: solo 3B parámetros activos por token, reduciendo el consumo de memoria y mejorando la latencia frente a modelos densos de tamaño similar.

## Casos de uso

- Agentes siempre activos en producción: el modelo puede gestionar conversaciones multi-turno con baja latencia gracias a sus 3B parámetros activos y a la decodificación MTP7, adecuado para asistentes virtuales o sistemas de atención al cliente con alta concurrencia.
- Procesamiento de documentos extensos: con 262 144 tokens de contexto, puede resumir, extraer información o responder preguntas sobre libros, informes financieros o expedientes técnicos completos en una sola pasada, sin necesidad de dividir el texto.
- Fine-tuning en dominios específicos: al ser un modelo base sin alineación, puede adaptarse mediante fine-tuning a dominios como legal, médico o código, aprovechando la cuantización para reducir los requisitos de VRAM durante el entrenamiento.
- Generación de código en pipelines de CI/CD: el modelo base de la familia Nemotron-3.5-Lightning está orientado a tareas de agente, por lo que puede integrarse en herramientas de autocompletado o revisión de código con contexto de repositorio completo.
- Despliegue en una sola GPU de consumo: con ~22 GB de VRAM, es ejecutable en RTX 3090, RTX 4090 o A10, lo que reduce los costes de infraestructura frente al checkpoint BF16 original (~60 GB).
- Servicio de inferencia con vLLM: el modelo está preparado para servirse con vLLM usando `--speculative-config '{"method":"mtp","num_speculative_tokens":7}'`, logrando un throughput de 541,7 tok/s en configuraciones de 4K/16K/48K de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento medidos son de throughput en inferencia:

| Configuracion | Throughput (tok/s) |
|---|---|
| MTP7 (promedio ponderado 4K/16K/48K) | 541,7 |
| MTP7 a 4K | 562,2 |
| MTP7 a 16K | 548,0 |
| MTP7 a 48K | 399,7 |
| DFlash (sin MTP) | 523,9 |

## Requisitos de hardware

- VRAM estimada: ~22 GB en la cuantización W4A16 NVFP4.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100, H100 (cualquier GPU con 24 GB o más).
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB VRAM (RTX 3090, RTX 4090).
- Opciones de despliegue: vLLM (configuración recomendada con MTP7), también se puede convertir a GGUF para llama.cpp u Ollama, aunque no está documentado oficialmente.
- Latencia y throughput: 541,7 tok/s con MTP7 y caché KV en BF16;
