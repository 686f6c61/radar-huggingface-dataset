# RedHatAI/DeepSeek-V4-Flash-0731-NVFP4-FP8-BLOCK

## Resumen

DeepSeek-V4-Flash-0731-NVFP4-FP8-BLOCK es una versión cuantizada en precisión mixta del modelo DeepSeek-V4-Flash-0731, publicada por RedHatAI. El modelo base es un transformer MoE (DeepseekV4ForCausalLM) de aproximadamente 145.800 millones de parámetros, orientado a generación de texto, razonamiento, código y flujos agénticos. RedHatAI aplica cuantización NVFP4 a los expertos enrutados del MoE y FP8 con bloques de 128x128 a determinadas proyecciones de atención, al indexador `q_b_proj` y a las capas de expertos compartidos, manteniendo el resto de capas en su precisión original.

El resultado es un checkpoint en formato compressed-tensors listo para servir con vLLM, pensado para reducir los requisitos de memoria y aumentar el throughput de inferencia sin degradar de forma significativa la calidad del modelo original. La model card reporta una recuperación media del 99,40 % en tareas de coding agéntico y un 102,15 % en GPQA Platinum, lo que sugiere que la cuantización apenas afecta al rendimiento en las evaluaciones realizadas.

Es relevante ahora porque combina una técnica de cuantización de bloques de 4 bits (NVFP4) con FP8 en las partes sensibles del modelo, un patrón que se está consolidando para desplegar MoE de gran tamaño en hardware moderno con vLLM. La ficha se centra en este checkpoint cuantizado; los detalles del modelo base no documentados aquí se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV4ForCausalLM (transformer MoE, según el identificador de arquitectura de la model card) |
| Parametros totales | 145.821.872.215 (~145,8 mil millones, dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones de expertos enrutados, grupo de 16); FP8 (pesos con bloques 128x128 y activaciones FP8 dinámicas en atención, indexador y expertos compartidos); resto de capas en precisión original |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de tipo DeepseekV4ForCausalLM. La model card no detalla el número de expertos, la proporción de parámetros activos, la longitud de contexto ni el proceso de entrenamiento del modelo original (tokens, composición del dataset, RLHF/DPO), por lo que esos datos se consideran no disponibles.

La innovación técnica de este checkpoint es la cuantización en precisión mixta: las capas lineales de los expertos enrutados del MoE usan NVFP4 en pesos y activaciones con grupo de 16; determinadas proyecciones de atención, el indexador `q_b_proj` y las capas de expertos compartidos usan FP8 con cuantización por bloques 128x128 y activaciones FP8 cuantizadas dinámicamente; el resto de capas conservan su precisión original. La cuantización se aplicó con LLM Compressor y el checkpoint se exportó con compressed-tensors, con validación reportada sobre RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento y conocimiento general, evaluado en GPQA Platinum.
- Coding agéntico: evaluado en Terminal-Bench 2.1, DeepSWE 1.1 y SWE-bench Verified.
- Soporte de tool calling / function calling en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser deepseek_v4`.
- Soporte de modo de razonamiento mediante `--reasoning-parser deepseek_v4`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Vision, audio u otras modalidades: no disponibles (entrada y salida declaradas como texto).

## Casos de uso

- Asistencia de código en producción: el checkpoint mantiene un 97,02 % de recuperación en SWE-bench Verified y un 95,74 % en Terminal-Bench 2.1, por lo que puede integrarse en pipelines de CI/CD y revisión de parches sin perder de forma apreciable la calidad del modelo base.
- Agentes de resolución de incidencias: con DeepSWE 1.1 al 109,38 % de recuperación, es adecuado para tareas multi-paso de depuración y modificación de repositorios.
- Despliegue de bajo coste por token: la cuantización NVFP4 de los expertos enrutados reduce el peso en memoria de la parte mayor del MoE, lo que abarata servir el modelo en clústeres con GPU modernas.
- Servicio conversacional con tool calling: el parser `deepseek_v4` permite exponer herramientas externas en vLLM para asistentes que consultan APIs o bases de datos.
- Razonamiento con modo thinking: el parser de razonamiento permite separar la traza de pensamiento de la respuesta final en aplicaciones de análisis.
- Evaluación y benchmarking interno: al conservar casi toda la calidad del base (99,40 % de media en coding agéntico), sirve como referencia para comparar pipelines cuantizados frente al modelo original.
- Inferencia a gran escala con vLLM: el formato compressed-tensors y la configuración con tensor parallelism 8 y expert parallelism facilitan el despliegue en entornos RHOAI/RHAIIS.

## Benchmarks y rendimiento

| Benchmark | Base (DeepSeek-V4-Flash-0731) | Este checkpoint NVFP4 | Recuperación |
|---|---|---|---|
| GPQA Platinum | 84,34 % | 86,15 % | 102,15 % |
| Terminal-Bench 2.1 | 0,798 | 0,764 | 95,74 % |
| DeepSWE 1.1 | 0,469 | 0,513 | 109,38 % |
| SWE-bench Verified | 0,738 | 0,716 | 97,02 % |
| Media coding agéntico | 0,6683 | 0,6643 | 99,40 % |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 329,3 GB y el checkpoint está pensado para servir con tensor parallelism 8, lo que implica un despliegue multi-GPU.
- GPU recomendadas: no especificadas en la información; la cuantización NVFP4 requiere hardware compatible con FP4, y la configuración de referencia usa 8 GPUs con expert parallelism.
- Consumer GPU: no disponible; el tamaño del checkpoint y la configuración de despliegue recomendada apuntan a GPUs de centro de datos.
- Opciones de despliegue: vLLM (versión validada 0.28.0), con `--kv-cache-dtype fp8`, `--enable-expert-parallel` y parsers `deepseek_v4`; validado también en RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RedHatAI/DeepSeek-V4-Flash-0731-NVFP4-FP8-BLOCK | ~145,8 mil millones | no disponible | no disponible | safetensors (compressed-tensors) | Cuantizado NVFP4 + FP8, validado en vLLM 0.28.0 |
| deepseek-ai/DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar; sirve de referencia para las recuperaciones reportadas |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad: la recuperación media en coding agéntico es del 99,40 %, con caídas concretas en Terminal-Bench 2.1 (95,74 %) y SWE-bench Verified (97,02 %).
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar la model card del modelo base y del checkpoint.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible: no debe asumirse una ventana concreta para cargas de contexto largo.
- Riesgo de alucinación inherente a los modelos generativos de gran tamaño; los benchmarks de conocimiento (GPQA) no eliminan este riesgo en producción.
- Sesgos conocidos: no documentados en la información proporcionada.
- Requiere hardware compatible con NVFP4 y una versión de vLLM que soporte compressed-tensors; el despliegue de referencia usa 8 GPUs, lo que limita el uso en entornos pequeños.
- Las capas fuera de los objetivos de cuantización mantienen su precisión original, por lo que el ahorro de memoria no es uniforme en todo el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/DeepSeek-V4-Flash-0731-NVFP4-FP8-BLOCK
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- README referenciado en la model card: https://huggingface.co/RedHatAI/DeepSeek-V4-Flash-0731-NVFP4/blob/main/README.md
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
