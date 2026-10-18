# InternScience/MLExpert

## Resumen
MLExpert es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por InternScience, orientado a la ingeniería autónoma de machine learning. Con 34.660.610.688 parámetros totales y una arquitectura basada en Qwen3.6-35B-A3B, está diseñado para planificar experimentos, escribir y revisar código, ejecutar pruebas e interpretar resultados dentro de un espacio de trabajo persistente. Su contexto operativo recomendado es de 262.144 tokens y se distribuye con licencia Apache-2.0.

El modelo se post-entrena mediante SFT agéntico jerárquico y aprendizaje por refuerzo con interacción ventaneada (WIRL), lo que le permite tomar decisiones multi-turno a partir del feedback de experimentos ya completados. En MLE-Bench Lite alcanza un 72,7 % de medalla en cualquier categoría con el MLExpert Harness, frente al 37,9 % de su modelo base, y un 69,7 % con Claude Code, frente al 42,4 % del base. En NatureBench Lite iguala resultados publicados en 7 de 10 tareas y los supera en 5.

Es relevante porque demuestra que el post-entrenamiento agéntico de largo horizonte puede llevar un modelo de 35B a un rendimiento comparable al de modelos frontera más grandes en tareas de MLE, manteniendo compatibilidad con arneses de propósito general. No obstante, es un modelo especializado: no está pensado como asistente conversacional general y su soporte multilingüe o multimodal no está documentado.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta `qwen3_5_moe`; modelo base Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | No disponible de forma explícita; la denominación A3B del modelo base sugiere 3B activos |
| Longitud de contexto | 262.144 tokens (configuración recomendada en SGLang/vLLM) |
| Tipos de cuantizacion | No disponible; solo se distribuyen pesos safetensors; no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modalidad | Texto; la etiqueta de HuggingFace incluye `image-text-to-text`, pero el despliegue oficial usa `--language-model-only` y no se documenta visión |
| Tamaño del repositorio | 69,3 GB |
| Pipeline | text-generation |
| Descargas / likes | 371 / 13 (actualización del 16-10-2026) |

## Arquitectura y entrenamiento
MLExpert es un transformer MoE basado en Qwen3.6-35B-A3B, con 34,66B parámetros totales y aproximadamente 3B activos según la nomenclatura del modelo base. La model card no detalla el número de capas, cabezas de atención, número de expertos ni el mecanismo exacto de enrutamiento. El contexto recomendado para servicio es de 262.144 tokens, y los comandos oficiales de SGLang y vLLM emplean tensor parallelism de tamaño 2, parser de razonamiento `qwen3` y parser de tool calling `qwen3_coder`.

El entrenamiento combina SFT agéntico jerárquico para desarrollar uso general de herramientas y habilidades de optimización específicas del dominio, con Windowed Interaction Reinforcement Learning (WIRL), que entrena decisiones multi-turno usando feedback de experimentos completados. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF o DPO. La innovación principal documentada es WIRL junto con la capacidad de mantener un espacio de trabajo persistente, revisar soluciones previas y seleccionar candidatos de envío tras varias iteraciones.

## Capacidades
- Generación de texto, razonamiento técnico y código orientado a experimentos de machine learning.
- Planificación y ejecución de experimentos de MLE de largo horizonte: escritura de scripts, ejecución, lectura de métricas y revisión de soluciones.
- Tool calling y function calling, con soporte oficial mediante el parser `qwen3_coder` en SGLang y vLLM.
- Comportamiento agéntico multi-paso con espacio de trabajo persistente y selección de candidatos de submission.
- Optimización de código y algoritmos mediante interacción con entornos de ejecución.
- Reproducción y mejora de resultados científicos en tareas tipo NatureBench.
- Contexto largo de 262.144 tokens para revisar repositorios, logs y documentación extensa.
- Soporte multilingüe: no disponible en la información proporcionada.
- Visión: no confirmada; pese a la etiqueta `image-text-to-text`, el despliegue oficial es solo de lenguaje.
- Audio: no disponible.

## Casos de uso
- Optimización autónoma en competiciones de machine learning: el modelo puede planificar experimentos, generar código de entrenamiento, ejecutarlo, interpretar métricas y elegir una submission final; es adecuado por su 72,7 % de medalla en MLE-Bench Lite con el MLExpert Harness.
- Reproducción de resultados científicos: puede leer un paper, implementar el pipeline, ejecutar experimentos y comparar métricas con las publicadas; en NatureBench Lite iguala 7 de 10 tareas y supera 5.
- Agente de código en repositorios reales: integrado en arneses como Claude Code, puede editar archivos, ejecutar tests, depurar fallos y aplicar tool calling; alcanza un 69,7 % de medalla en MLE-Bench Lite con Claude Code.
- Automatización de pipelines de MLE en producción: feature engineering, selección de modelos, ajuste de hiperparámetros y evaluación de regresiones dentro de un workspace persistente.
- Ingeniería de algoritmos: iteración sobre implementaciones, medición de rendimiento, análisis de complejidad y comparación de alternativas con feedback de ejecución.
- Asistente de investigación con contexto largo: revisión de repositorios, papers y logs de experimentos de hasta 262.144 tokens para proponer mejoras concretas.
- Orquestación de herramientas en sandbox: llamadas a Python, shell y sistema de archivos para ejecutar experimentos de forma controlada.
- Evaluación de modelos y regresiones: ejecución de suites de benchmarks, comparación de resultados y generación de informes técnicos mediante tool calling.

## Benchmarks y rendimiento
| Benchmark | Metrica | MLExpert | Base Qwen3.6-35B-A3B | Referencia |
|---|---|---:|---:|---|
| MLE-Bench Lite (22 tareas) | Cualquier medalla, MLExpert Harness | 72,7 % | 37,9 % | Comparable a GLM-5.3 y Kimi-K3; cifras exactas no disponibles |
| MLE-Bench Lite (22 tareas) | Cualquier medalla, Claude Code | 69,7 % | 42,4 % | +22,7 puntos porcentuales sobre el mejor baseline de misma escala evaluado |
| NatureBench Lite (10 tareas) | Surpass-SOTA (g > 0,1) | 50,0 % | 0,0 % | Iguala GLM-5.3 (50,0 %); supera Nex-N2.5-mini (20,0 %) |
| NatureBench Lite (10 tareas) | Match-SOTA (g ≥ 0) | 70,0 % | 40,0 % | No disponible |
| MLE-Bench Lite | Gold / Silver / Bronze / Med+ | No disponible en el extracto | No disponible | No disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible. Las cifras de MLE-Bench Lite corresponden a un subconjunto de 22 tareas y deben interpretarse junto con el arnés utilizado.

## Requisitos de hardware
- Pesos en BF16/FP16: aproximadamente 69,3 GB solo para parámetros, calculado a partir de 34,66B parámetros.
- VRAM estimada: más de 80 GB para contexto largo en BF16, incluyendo pesos, overhead y caché KV; la caché KV exacta para 262.144 tokens no está disponible.
- Cuantización teórica: INT8 aproximadamente 34,7 GB e INT4 aproximadamente 17,3 GB; no hay cuantizaciones oficiales publicadas, por lo que son estimaciones no soportadas por el autor.
- GPU recomendadas: 2× A100 80 GB o 2× H100 80 GB, usando tensor parallelism de tamaño 2 como en los comandos oficiales.
- Una única GPU de 80 GB podría alojar los pesos en BF16 con contexto corto, pero no se recomienda para el contexto completo de 262.144 tokens.
- GPU de consumo: RTX 4090 o RTX 3090 de 24 GB no pueden alojar los pesos en BF16; una cuantización 4-bit teórica ajustaría los pesos, pero no hay artefacto oficial y la caché KV puede exceder la memoria.
- Despliegue oficial: SGLang, vLLM y Transformers. Los comandos documentados usan `--tp-size 2` / `--tensor-parallel-size 2`, contexto de 262.144, `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`.
- llama.cpp, Ollama y TGI no aparecen documentados para este modelo; no hay GGUF oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | MLE-Bench Lite (cualquier medalla) | NatureBench Lite (Surpass-SOTA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MLExpert | 34,66B totales; ~3B activos según denominación del base | 262.144 tokens | 72,7 % con MLExpert Harness; 69,7 % con Claude Code | 50,0 % | Apache-2.0 | HuggingFace |
| Qwen3.6-35B-A3B | 35B totales; A3B | No disponible | 37,9 % con MLExpert Harness; 42,4 % con Claude Code | 0,0 % | No disponible | Modelo base citado; repositorio no indicado |
| GLM-5.3 | No disponible | No disponible | Comparable a 72,7 % según el texto; cifra exacta no disponible | 50,0 % | No disponible | No disponible |
| Kimi-K3 | No disponible | No disponible | Comparable a 72,7 % según el texto; cifra exacta no disponible | No disponible | No disponible | No disponible |
| Nex-N2.5-mini | No disponible | No disponible | No disponible | 20,0 % | No disponible | No disponible |

La comparación se limita a los datos publicados en la model card. No se dispone de especificaciones completas de parámetros, contexto o licencia de GLM-5.3, Kimi-K3 y Nex-N2.5-mini en la información proporcionada.

## Limitaciones y advertencias
- Modelo especializado en MLE y tareas agénticas de código; no está planteado como asistente conversacional general.
- Riesgo de alucinación en código, resultados experimentales y conclusiones científicas; es necesario validar toda ejecución en un entorno controlado.
- Idiomas soportados no documentados; la model card está en inglés y no se confirma un rendimiento multilingüe equilibrado.
- Visión no confirmada: la etiqueta `image-text-to-text` no se acompaña de documentación de uso multimodal y el servicio oficial es solo de lenguaje.
- El contexto de 262.144 tokens implica un coste de memoria elevado; no se documenta la caché KV ni el rendimiento a esa longitud.
- No hay cuantizaciones oficiales GGUF, AWQ o GPTQ; las estimaciones INT8/INT4 son teóricas y no están validadas por el autor.
- El uso comercial está permitido por la licencia Apache-2.0 del modelo, pero no se detalla la licencia del modelo base ni de posibles dependencias.
- La ejecución autónoma de código requiere sandbox, límites de recursos y revisión humana para evitar efectos no deseados.
- Los benchmarks se han medido con arneses concretos; los resultados pueden no transferirse directamente a otros entornos o pipelines.
- MLE-Bench Lite contiene 22 tareas y NatureBench Lite 10, por lo que la varianza estadística puede ser relevante.
- No se documentan sesgos, comportamiento tóxico ni evaluaciones de seguridad.
- Modelo reciente y con pocas descargas (371) y likes (13); la validación independiente de la comunidad es limitada.

## Enlaces
- [HuggingFace: InternScience/MLExpert](https://huggingface.co/InternScience/MLExpert)
- [GitHub: InternScience/MLExpert](https://github.com/InternScience/MLExpert)
- [arXiv: MLExpert: Towards a Generalist Agentic Model for Autonomous Machine Learning Engineering](https://arxiv.org/abs/2610.22344)
- [arXiv HTML](https://arxiv.org/html/2610.22344)
- [HuggingFace Papers](https://huggingface.co/papers/2610.22344)
- [Documentación de instalación de SGLang](https://docs.sglang.ai/get_started/install.html)
- [Documentación de instalación de vLLM](https://docs.vllm.ai/en/stable/getting_started/installation/index.html)
