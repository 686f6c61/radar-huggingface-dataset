# nota-ai/Kimi-K3.1-Pro-Global-Pruned-37

## Resumen

Kimi-K3.1-Pro-Global-Pruned-37 es una versión comprimida del modelo multimodal MoE Kimi-K3.1-Pro de Moonshot AI, publicada por Nota AI (nota-ai) en HuggingFace. La intervención consiste en una poda no uniforme de expertos enrutados: se elimina el 37,5 % de los expertos, pasando de 82.432 a 51.520 expertos repartidos entre capas (536–616 por capa, manteniendo los 896 completos en las dos primeras y dos últimas capas MoE; la capa 0 es densa). El objetivo es reducir el checkpoint de 1.454 GiB a 948 GiB para que quepa en 8×NVIDIA B200 con TP8, algo que el checkpoint original MXFP4 no consigue.

El modelo conserva la arquitectura MoE y el codificador de visión del original, con 1.758.860.943.936 parámetros totales según los safetensors del repositorio, y soporta un contexto de hasta 1.048.576 tokens con KV cache en FP8 y decodificación especulativa DSpark. Está empaquetado con compressed-tensors en 8 bits y requiere transformers con código personalizado (`trust-remote-code`).

Es relevante porque demuestra que la poda estructurada de expertos permite servir un modelo frontera de escala masiva en hardware más asequible (8×B200 en lugar de 8×B300), con una degradación mínima observada en GPQA-Diamond (-0,77 puntos). No obstante, su licencia restrictiva, el gate de acceso y el compromiso de notificación para usos comerciales o de hardware condicionan fuertemente su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con codificador de visión; capa 0 densa |
| Parametros totales | 1.758.860.943.936 (1,76 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (1M) con KV cache FP8 |
| Tipos de cuantizacion | Checkpoint en 8 bits (compressed-tensors); KV cache FP8; el original era MXFP4 |
| Idiomas soportados | no disponible (la model card reporta evaluaciones en inglés y coreano) |
| Licencia | Kimi K3.1-Pro License (`license: other`, `license_name: kimi-k3.1-pro`) |
| Formato de pesos | safetensors (repo de 1018,4 GB), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro es un transformer con mezcla de expertos (MoE) y capacidad multimodal (pipeline `image-text-to-text`), con una capa inicial densa y capas MoE posteriores que en el original contienen 896 expertos por capa. Nota AI aplica una poda global no uniforme de expertos enrutados: elimina el 37,5 % de los expertos (82.432 → 51.520), dejando entre 536 y 616 expertos por capa, pero preservando los 896 completos en las dos primeras y las dos últimas capas MoE. Los identificadores de expertos conservados se publican en `pruning_info.json` y el número de expertos por capa en `text_config.num_experts_per_layer` del `config.json`.

No se detallan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) ni si hubo reentrenamiento posterior a la poda. La innovación técnica principal de esta variante es la propia poda global de expertos combinada con el empaquetado en 8 bits, que reduce el checkpoint en 506 GiB y permite habilitar decodificación especulativa (DSpark, con `Inferact/Kimi-K3.1-Pro-DSpark-preview` y 5 tokens especulativos) junto con el codificador de visión en 8×B200. La model card indica que esta variante no soporta el balanceo de carga de expertos paralelos (EPLB) ni la ruta de decodificación `latency_specialized`.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (`reasoning-parser kimi_k3`) y esfuerzo de razonamiento configurable (máximo en las evaluaciones).
- Razonamiento matemático y científico de alto nivel: AIME 2026 (96,67) y GPQA-Diamond (93,43).
- Generación y razonamiento sobre código: LiveCodeBench v6 (92,37).
- Seguimiento de instrucciones: IFEval (95,22) e IFBench (76,51).
- Capacidades multimodales de imagen a texto: el codificador de visión se mantiene habilitado en el despliegue recomendado.
- Soporte de tool calling / function calling nativo en vLLM (`--enable-auto-tool-choice`, `--tool-call-parser kimi_k3`).
- Capacidades multilingües parcialmente evidenciadas: evaluaciones en coreano (BenchMAX IFEval-ko 94,24, KoBALT 75,43, CLIcK 84,76) además de inglés.
- Contexto extremo de 1M tokens, adecuado para razonamiento multi-paso sobre documentos y repositorios extensos.

## Casos de uso

- Análisis de repositorios y bases de código completas: con 1M tokens de contexto, el modelo puede ingerir un monorepo o un conjunto amplio de archivos y responder preguntas de arquitectura, dependencias o refactorizaciones, apoyándose en LiveCodeBench v6 (92,37) para tareas de código.
- Agentes de ingeniería de software: el soporte de tool calling y de razonamiento multi-paso permite integrarlo en pipelines de CI/CD como agente que lee fallos de tests, consulta documentación y propone parches, con decodificación especulativa para reducir latencia.
- Asistencia científica y técnica: con GPQA-Diamond en 93,43, es adecuado para responder preguntas de nivel posgrado en física, química y biología dentro de herramientas de investigación internas.
- Atención al cliente multilingüe: las evaluaciones en coreano e inglés y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso y documentación de producto adjunta.
- Procesamiento de documentos con imágenes: al conservar el codificador de visión, puede extraer y razonar sobre información de capturas, diagramas y PDFs escaneados en flujos de digitalización.
- Evaluación comparativa de modelos comprimidos: útil en investigación para estudiar el impacto de la poda de expertos en tareas de razonamiento, código e instrucciones, dado que se publican los IDs de expertos conservados.
- Despliegue on-premise de alto rendimiento: organizaciones con 8×B200 pueden servir un modelo de escala frontera con 1M de contexto y KV cache de 1.415.974 tokens, sin necesidad de 8×B300.

## Benchmarks y rendimiento

| Benchmark | Original (model card) | Esta versión (B200 × 8) | Δ |
|---|---|---|---|
| IFEval (inglés) | no disponible | 95,22 | no disponible |
| IFBench (inglés) | no disponible | 76,51 | no disponible |
| GPQA-Diamond (inglés) | 94,20 | 93,43 | -0,77 |
| AIME 2026 (inglés) | no disponible | 96,67 | no disponible |
| LiveCodeBench v6 (inglés) | no disponible | 92,37 | no disponible |
| BenchMAX IFEval-ko (coreano) | no disponible | 94,24 | no disponible |
| KoBALT (coreano) | no disponible | 75,43 | no disponible |
| CLIcK (coreano) | no disponible | 84,76 | no disponible |

Ajustes de evaluación: longitud máxima de generación de 65.536 tokens (incluido razonamiento), esfuerzo de razonamiento máximo, temperatura 1,0 y top-p 0,95. La model card indica que el modelo original no cabe en 8×B200, por lo que no se pudieron reproducir todas las métricas del original en el mismo hardware.

## Requisitos de hardware

- Checkpoint de 948 GiB en 8 bits; el original MXFP4 de 1.454 GiB no cabe en 8×B200 y requiere 8×B300.
- Despliegue de referencia: 8×NVIDIA B200 con tensor parallelism 8 (TP8), `--gpu-memory-utilization 0.985`, `--max-model-len 1048576`, KV cache FP8 y decodificación especulativa DSpark.
- Con esa configuración se obtiene una KV cache de 1.415.974 tokens y se mantiene el codificador de visión habilitado.
- No cabe en GPU de consumo (RTX 4090, etc.) ni en configuraciones de una sola GPU; el tamaño del checkpoint lo impide.
- Motor de inferencia: vLLM con la imagen `vllm/vllm-openai:kimi-k31` (vLLM `0.1.dev24216+g266e88c05`) y el parche incluido en `patch/apply_patch.py`; el soporte de Kimi-K3.1-Pro aún no está en una release estable de vLLM.
- Opciones de carga: `--load-format fastsafetensors`; `VLLM_ENGINE_READY_TIMEOUT_S=3600` para tolerar tiempos de arranque largos.
- Throughput y latencia: no disponibles de forma numérica; la model card solo confirma que la decodificación especulativa y el contexto de 1M funcionan en B200 × 8.
- Limitaciones de despliegue: no soporta EPLB ni la ruta de decodificación `latency_specialized`.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-Global-Pruned-37 (este) | 1,76 B (1.758.860.943.936) | 1.048.576 | Kimi K3.1-Pro License (other) | HuggingFace con gate de acceso | Poda del 37,5 % de expertos; 948 GiB; sirve en 8×B200 |
| moonshotai/Kimi-K3.1-Pro (original) | no disponible en la información | no disponible en la información | Kimi K3.1-Pro License | HuggingFace | Checkpoint MXFP4 de 1.454 GiB; requiere 8×B300; GPQA-Diamond 94,20 |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

La única comparación con datos verificables es frente al modelo base: misma licencia y familia, pero el original exige 8×B300 y esta variante cabe en 8×B200 a cambio de una pérdida de 0,77 puntos en GPQA-Diamond.

## Limitaciones y advertencias

- La poda elimina el 37,5 % de los expertos enrutados; aunque GPQA-Diamond solo cae 0,77 puntos, no se han publicado evaluaciones exhaustivas del impacto en otras tareas, idiomas o dominios.
- No soporta EPLB ni la ruta de decodificación `latency_specialized`, lo que limita el ajuste fino del rendimiento en producción.
- Requiere parchear manualmente vLLM sobre una imagen de desarrollo (`0.1.dev24216+g266e88c05`); no hay soporte en una release estable, lo que implica riesgo de incompatibilidades y mantenimiento.
- Licencia `other` (Kimi K3.1-Pro License): es necesario revisar el texto completo en el repositorio del modelo base antes de cualquier uso comercial.
- El acceso está sujeto a gate y a un "Notification Commitment": organizaciones con ingresos consolidados superiores a 100 M USD que usen el modelo comercialmente, fabricantes de semiconductores, aceleradores de IA, NPU o SoC que lo distribuyan con hardware, y quienes lo ofrezcan como producto de pago, SDK o servicio alojado deben notificar a Nota AI (contact@nota.ai) antes de la actividad.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan evaluaciones específicas de factualidad ni de sesgos.
- Idiomas soportados no declarados formalmente; las evaluaciones se limitan a inglés y coreano, por lo que el rendimiento en castellano no está verificado.
- El tamaño del repositorio (1018,4 GB) y del checkpoint (948 GiB) hacen inviable su uso fuera de infraestructuras con múltiples aceleradores de gama alta.
- No se dispone de información sobre datos de entrenamiento, composición del dataset ni procesos de alineación (RLHF/DPO) del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nota-ai/Kimi-K3.1-Pro-Global-Pruned-37
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia Kimi K3.1-Pro: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Receta de vLLM para Kimi-K3.1-Pro: https://recipes.vllm.ai/moonshotai/Kimi-K3.1-Pro
- Modelo draft de decodificación especulativa: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark-preview
- Contacto de Nota AI para el Notification Commitment: contact@nota.ai
