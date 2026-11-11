# atomicapple0/GLM-5.3-NVFP4-8L-MTP

## Resumen

GLM-5.3-NVFP4-8L-MTP es una versión cuantizada en NVFP4 del modelo GLM-5.3-BF16 desarrollado por Z.ai (zai-org). La cuantización la ha producido RadixArk utilizando NVIDIA Model Optimizer, aplicando una receta NVFP4 W4A4 restringida exclusivamente a los expertos enrutados de las capas MoE. El modelo base es un transformer de mezcla de expertos dispersa (Sparse MoE) con atención dispersa, identificado internamente como `GlmMoeDsaForCausalLM`, que combina 78 capas de decodificador (3 con MLP densa y 75 MoE), 256 expertos enrutados por capa con top-8 más un experto compartido, un indexador IndexShare y una capa MTP (Multi-Token Prediction).

El problema que resuelve esta ficha es el de la eficiencia de despliegue: el checkpoint original en BF16 ocupa 1.507 GB, mientras que esta versión NVFP4 lo reduce a 465 GB, manteniendo en BF16 los componentes sensibles (atención dispersa, expertos compartidos, routers, capas densas, normas, embeddings, `lm_head` y tensores MTP). El resultado es un modelo de 753.000 millones de parámetros totales con aproximadamente 40.000 millones activados por token y una ventana de contexto de hasta 1.048.576 tokens, pensado para cargas de trabajo agénticas, ingeniería de software y razonamiento de horizonte largo.

Es relevante ahora porque permite servir un modelo de escala frontera en ocho GPUs NVIDIA Blackwell (el checkpoint se produjo y validó en B300) mediante SGLang, con decodificación especulativa EAGLE habilitada gracias a conservar la capa MTP en BF16. La licencia es la Z.AI Model License, de estilo MIT, y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Sparse Mixture-of-Experts y atención dispersa (`GlmMoeDsaForCausalLM`); 78 capas de decodificador (3 densas + 75 MoE), 256 expertos enrutados por capa (top-8) + 1 experto compartido, indexador IndexShare, 1 capa MTP |
| Parametros totales | 753B (model card); 62.408.324.352 según los safetensors del repo de cuantización |
| Parametros activos | ~40B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 W4A4 con group size 16 y escalas de bloque FP8-E4M3 en los expertos enrutados de las 75 capas MoE (96,2% de los parámetros); resto en BF16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Z.AI Model License (estilo MIT), etiquetada como `other` en Hugging Face |
| Formato de pesos | safetensors (producidos con NVIDIA Model Optimizer); repo de 55,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos dispersa con atención dispersa. Cada una de las 75 capas MoE contiene 256 expertos enrutados con activación top-8 más un experto compartido, y el modelo incorpora un indexador IndexShare junto con una capa MTP (Multi-Token Prediction) que habilita decodificación especulativa EAGLE. El contexto máximo es de 1.048.576 tokens y la entrada y salida son exclusivamente texto.

RadixArk no entrenó ni afinó este checkpoint: toda la información de entrenamiento (número de tokens, composición del dataset, posibles fases de RLHF/DPO) se hereda del modelo original zai-org/GLM-5.3-BF16 y no está detallada en la información disponible. La innovación técnica de esta versión es la cuantización post-entrenamiento: los expertos enrutados de las 75 capas MoE (57.600 entradas lineales, el 96,2% de los parámetros) se cuantizan a NVFP4 W4A4 con group size 16, escalas de bloque FP8-E4M3 y escalas de activación estáticas por tensor. La calibración empleó 1.024 muestras de longitud 512 del mix `cnn_nemotron_v2_mix` de Model Optimizer (512 de `abisee/cnn_dailymail` y 512 de `nvidia/Nemotron-Post-Training-Dataset-v2`, splits `stem`, `chat`, `math` y `code`), con escalas de activación ajustadas por calibración de máximo. Se conservan en BF16 la atención dispersa (incluido el indexador IndexShare), los expertos compartidos, los routers, las tres capas MLP densas, todas las normas, los embeddings, `lm_head` y todos los tensores MTP. La herramienta utilizada fue NVIDIA Model Optimizer en el commit `7ff81dd795b13a0a70e01db701305aa4b57f40b0` (`v0.47.0.dev91`).

## Capacidades

- Generación de texto conversacional y razonamiento de horizonte largo, con un modo de esfuerzo de razonamiento (`Reasoning Effort: Max`) configurable por defecto en las evaluaciones.
- Ingeniería de software y uso de terminal: evaluado en Terminal-Bench 2.1 y DeepSWE con arneses agénticos (`terminus-2` y `mini-swe-agent`).
- Razonamiento matemático: evaluado en GSM8K y AIME 2026.
- Soporte de tool calling / function calling, con parser dedicado en SGLang (`--tool-call-parser glm47`).
- Soporte de agentes y razonamiento multi-paso, orientado explícitamente a «long-horizon tool use» y «agentic engineering».
- Decodificación especulativa EAGLE, posible porque la capa MTP se conserva en BF16.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Procesamiento exclusivamente de texto: no se declaran capacidades de visión ni audio, y todas las evaluaciones reportadas son text-only.

## Casos de uso

- Agentes de ingeniería de software: el modelo puede operar sobre repositorios y terminales dentro de bucles agénticos, como demuestra su evaluación en Terminal-Bench 2.1 (86,5%) y DeepSWE (68,1%) con arneses tipo `mini-swe-agent`; su ventana de 1M tokens permite mantener en contexto árboles de ficheros, trazas de ejecución y documentación extensa.
- Automatización de tareas de terminal y DevOps: con tool calling y un parser específico en SGLang, puede integrarse en pipelines que ejecuten comandos, interpreten salidas y encadenen pasos correctivos sobre infraestructura.
- Razonamiento matemático y verificación formal de cálculos: con 97,42% en GSM8K y 94,17% pass@1 en AIME 2026 (100% majority@16), es adecuado para asistentes de resolución de problemas cuantitativos donde se requiere alta precisión y se puede permitir presupuesto de razonamiento largo (`max_tokens=131072`).
- Asistentes de código en producción: el checkpoint pre-cuantizado en NVFP4 reduce el espacio de 1.507 GB a 465 GB, lo que permite desplegarlo en ocho GPUs Blackwell con SGLang y servir autocompletado, revisión de código y generación de parches con menor huella de memoria que el modelo BF16.
- Atención al cliente técnica multilingüe (inglés/chino): conversaciones multi-turno con contexto largo gracias a la ventana de 1M tokens, útil para soporte sobre documentación extensa o historiales de incidencias.
- Análisis de documentos largos y extracción estructurada: la ventana de 1.048.576 tokens permite procesar contratos, informes o bases de código completas en una sola pasada sin troceado, con salida en texto.
- Investigación sobre cuantización: al ser un derivado NVFP4 verificado contra el BF16 original (GSM8K con coincidencia exacta y AIME 2026 dentro del ruido entre ejecuciones), sirve como referencia reproducible para estudiar el impacto de W4A4 en modelos MoE de gran escala.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para este checkpoint NVFP4, ejecutados en GPUs NVIDIA Blackwell con SGLang:

| Benchmark | Protocolo | Resultado |
|---|---|---:|
| GSM8K | Split completo de 1.319 ejemplos, single-shot, sgl-eval, `temperature=1.0`, `top_p=0.95` | 97,42% (1.285/1.319) |
| Terminal-Bench 2.1 | Arnés terminus-2, `temperature=1.0`, `top_p=0.95` | 86,5% (77/89) |
| DeepSWE | Arnés mini-swe-agent, `temperature=0.95`, `top_p=1.0` | 68,1% (77/113) |
| AIME 2026 | 30 problemas x 16 rollouts, pass@1, sgl-eval, `temperature=1.0`, `top_p=0.95` | 94,17% (majority@16: 100%) |

GSM8K y AIME 2026 se ejecutaron con `max_tokens=131072` y el modo `Reasoning Effort: Max` por defecto de GLM-5.3. Frente al modelo BF16 original, bajo protocolo y build idénticos, GSM8K coincide exactamente y AIME 2026 pass@1 queda dentro del ruido entre ejecuciones. No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint cuantizado ocupa 465 GB (frente a 1.507 GB en BF16); el repo de Hugging Face suma 55,4 GB, por lo que el despliegue completo requiere el checkpoint de RadixArk y no solo los pesos del repo de cuantización.
- GPU recomendadas: NVIDIA Blackwell, en particular B300, plataforma en la que se produjo y validó el checkpoint. La configuración de referencia usa 8 GPUs Blackwell con `--tp-size 8`.
- No cabe en GPUs de consumo (RTX 4090 y similares): el tamaño del checkpoint y el requisito de soporte NVFP4 nativo lo impiden.
- Opciones de despliegue: SGLang es el único motor declarado como soportado, con `--quantization modelopt_fp4`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y decodificación especulativa EAGLE (`--speculative-algorithm EAGLE --speculative-num-steps 5 --speculative-eagle-topk 1 --speculative-num-draft-tokens 6`). No se declaran soporte de vLLM, llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-NVFP4-8L-MTP (este) | 753B totales, ~40B activos | 1.048.576 | NVFP4 W4A4 en expertos + BF16 en resto | Z.AI Model License (estilo MIT) | Hugging Face (atomicapple0) |
| zai-org/GLM-5.3-BF16 | 753B totales, ~40B activos | 1.048.576 | BF16 | Z.AI Model License (estilo MIT) | Hugging Face (zai-org) |
| RadixArk/GLM-5.3-NVFP4 | 753B totales, ~40B activos | 1.048.576 | NVFP4 W4A4 en expertos + BF16 en resto | Z.AI Model License (estilo MIT) | Hugging Face (RadixArk) |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos de la misma categoría para establecer una comparación de rendimiento; los tres modelos listados comparten arquitectura y solo difieren en el formato de pesos y el empaquetado del checkpoint.

## Limitaciones y advertencias

- El modelo base puede generar respuestas inexactas, incompletas, irrelevantes o sesgadas; RadixArk recomienda evaluarlo para el caso de uso previsto y aplicar salvaguardas adecuadas.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas en esta versión cuantizada.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está evaluado ni declarado.
- La cuantización NVFP4 se aplica solo a los expertos enrutados; el resto del modelo permanece en BF16, por lo que los beneficios de memoria son parciales (465 GB frente a 1.507 GB).
- Requiere hardware NVIDIA Blackwell y SGLang; no hay soporte declarado para otras GPUs ni para vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad.
- La licencia es la Z.AI Model License (estilo MIT); debe verificarse el texto íntegro en el fichero `LICENSE` del repositorio antes de uso comercial, y esta versión es un derivado de terceros no desarrollado por RadixArk.
- El repositorio de cuantización declara 0 descargas y 0 likes en el momento de la consulta, y su tamaño (55,4 GB) no coincide con el checkpoint completo descrito (465 GB), por lo que conviene validar la integridad de los pesos antes de desplegar.
- Todas las evaluaciones reportadas son text-only; no se declaran capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicapple0/GLM-5.3-NVFP4-8L-MTP
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Checkpoint original de RadixArk: https://huggingface.co/RadixArk/GLM-5.3-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- SGLang: https://github.com/sgl-project/sglang
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Dataset de calibración CNN/DailyMail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
