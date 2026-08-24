# Cyronius/Qwen3.6-27B-A2.8B

## Resumen

Qwen3.6-27B-A2.8B es un modelo de lenguaje derivado de Qwen/Qwen3.6-35B-A3B, desarrollado por Cyronius mediante un proceso de poda estructural, recuperación con LoRA y cuantización a GGUF. El objetivo es ofrecer un modelo MoE de gran calidad que pueda ejecutarse en hardware de memoria compartida (CPU o iGPU) sin necesidad de una GPU discreta, manteniendo una velocidad de decodificación alta gracias a la reducción de parámetros activos y al uso de decodificación especulativa con cabezal MTP.

El modelo elimina 10 de las 40 capas del modelo base (una de cada tres capas gated-DeltaNet), reduciendo los parámetros totales del núcleo LM de 34.7B a 26.2B y los activos por token de 3.45B a 2.83B. Tras la poda, se aplicó un LoRA de rango 32 para recuperar calidad y posteriormente se cuantizó a GGUF con imatrix calibrada. Se distribuyen dos variantes: una equilibrada (Q4_K_M, 16.49 GB) y otra optimizada para velocidad (expertos en IQ3_S, 12.01 GB), ambas con el cabezal MTP conservado para decodificación especulativa.

La relevancia de este modelo radica en que permite ejecutar un MoE de la familia Qwen3.6 en equipos sin GPU dedicada, con un rendimiento razonable en tareas de tool-calling y razonamiento, a costa de una pérdida de precisión frente al modelo base. La licencia Apache-2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con capas gated-DeltaNet (híbrida atención lineal) |
| Parametros totales | 26.2B (núcleo LM) |
| Parametros activos | 2.83B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (imatrix), IQ3_S (expertos) + Q4_K (lm_head) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un MoE con 40 capas y 3.45B parámetros activos por token, que emplea capas gated-DeltaNet (una variante de atención lineal con compuertas) combinadas con atención estándar. El proceso de creación consistió en tres fases:

1. **Poda estructural**: se eliminaron 10 de las 40 capas, concretamente una de cada tres capas gated-DeltaNet, reduciendo la profundidad a 30 capas. Esta poda es estructural (no por importancia de pesos) y afecta únicamente a las capas de atención lineal, preservando las capas de atención estándar.
2. **Recuperación con LoRA**: se entrenó un LoRA de rango 32 (aproximadamente 33M parámetros entrenables) sobre un conjunto de datos mixto que incluía texto general, ejemplos de tool-use y razonamiento estilo GSM8K. El entrenamiento cubrió aproximadamente medio epoch (18K prompts, 16M tokens) y costó unos 53 dólares en tiempo de GPU H200.
3. **Cuantización a GGUF**: se cuantizaron los pesos con una imatrix calibrada. La variante equilibrada usa Q4_K_M para todos los tensores; la variante speed-demon usa IQ3_S para los expertos enrutados y Q4_K para el lm_head, manteniendo el resto en su cuantización original.

Ambas variantes conservan el cabezal de predicción multi-token (MTP) del modelo base, lo que permite usar decodificación especulativa en llama.cpp. No se aplicó RLHF ni DPO; la recuperación de calidad se basó únicamente en el ajuste LoRA.

## Capacidades

- Generación de texto y razonamiento: el modelo mantiene capacidades de razonamiento matemático (GSM8K 0.80 en la variante equilibrada) y conocimiento general (MMLU 0.733).
- Tool-calling / function calling: soporta llamadas a herramientas con argumentos correctos, con una puntuación de 0.95 en la variante equilibrada y 0.90 en la speed-demon, según el benchmark interno del autor.
- Decodificación especulativa: gracias al cabezal MTP retenido, puede acelerar la generación usando un modelo draft en llama.cpp, aunque la salida no es bit-exacta respecto a la decodificación normal.
- Ejecución en CPU/iGPU: diseñado específicamente para hardware de memoria compartida sin GPU discreta, con velocidades de decodificación de 36-44 tokens/s en el entorno de prueba del autor.
- Multilingüismo: no se especifican idiomas soportados en la documentación; el modelo base Qwen3.6-35B-A3B es presumiblemente multilingüe, pero no hay confirmación para este derivado.
- No se mencionan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente local en CPU: un equipo con 16 GB de RAM puede ejecutar la variante Q4_K_M (16.49 GB) mediante llama-server, ofreciendo un asistente conversacional con tool-calling sin necesidad de GPU. La decodificación especulativa con MTP mejora la fluidez.
- Automatización de tareas con herramientas en entornos sin GPU: el modelo puede integrarse en pipelines que requieran llamadas a APIs o funciones, gracias a su alta puntuación en tool-calling (0.95), en servidores económicos basados en CPU.
- Prototipado rápido de agentes: al ser Apache-2.0 y caber en 12-16 GB, es adecuado para desarrollar y probar agentes multi-paso en máquinas de desarrollo sin aceleración GPU, antes de migrar a modelos más grandes.
- Generación de código asistida en entornos restringidos: aunque no se reportan benchmarks de código específicos, el modelo base Qwen3.6-35B-A3B tiene capacidades de programación; este derivado puede usarse para autocompletado o generación de fragmentos en entornos sin GPU.
- Evaluación de tool-calling en producción: su bajo coste de inferencia permite desplegarlo como modelo de respaldo o para pruebas A/B de esquemas de herramientas, comparando su precisión (0.90-0.95) con modelos más grandes.
- Educación e investigación: al ser un ejemplo documentado de poda y recuperación con LoRA, sirve como caso de estudio para investigar técnicas de compresión de MoE, con código y logs disponibles en GitHub.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de benchmarks propia, evaluada con un benchmark interno pequeño (7 esquemas de herramientas, subconjuntos de GSM8K y MMLU). Los resultados son los siguientes:

| Modelo | Tamaño | Tools | GSM8K | MMLU | Perplejidad (wikitext-2) | Decode (tok/s) | Tool decode (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Equilibrado (Q4_K_M)** | 16.49 GB | 0.95 | 0.80 | 0.733 | 8.01 | 36.8 | 40.7 |
| **Speed-demon (IQ3_S expertos)** | 12.01 GB | 0.90 | 0.733 | 0.767 | 8.29 | 40.7 | 44.1 |
| Base Qwen3.6-35B-A3B (Q4_K_M, referencia) | 21.17 GB | 0.90 | 0.933 | 0.767 | 5.50 | 27.8 | 27.9 |

Notas del autor: las velocidades de decodificación variaron entre ejecuciones repetidas, por lo que deben tratarse como orientativas. La perplejidad se midió con wikitext-2, 32 chunks, contexto 512, usando la herramienta `perplexity` de llama.cpp. El modelo podado no recupera completamente la calidad del base: GSM8K es inferior y la perplejidad es mayor.

## Requisitos de hardware

- Tamaño de archivo: 16.49 GB (variante Q4_K_M) y 12.01 GB (variante speed-demon). Se necesita al menos esa cantidad de RAM libre, más overhead de ejecución.
- Diseñado para CPU/iGPU con memoria compartida; no requiere GPU discreta. En un sistema con 16 GB de RAM unificada (p. ej., Apple Silicon) cabe la variante speed-demon; con 24 GB o más, la equilibrada.
- En GPU discreta, la variante Q4_K_M cabe en tarjetas con 16 GB de VRAM (RTX 4080, RTX 4090, A100 40GB, etc.), aunque el modelo está optimizado para CPU.
- Despliegue recomendado: llama.cpp / llama-server con soporte MTP, usando el comando `llama-server -m <archivo.gguf> --spec-type draft-mtp --spec-draft-n-max 2`.
- Throughput observado: 36.8-44.1 tokens/s en decodificación normal y con tool-calling, en el hardware de prueba del autor (no especificado, presumiblemente CPU de gama alta o iGPU).
- No se reportan requisitos de VRAM específicos para GPU; los tamaños de archivo indican el mínimo de memoria necesario.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos/token | Contexto | Licencia | Formato | Notas |
|---|---:|---:|---|---|---|---|
| **Qwen3.6-27B-A2.8B (este)** | 26.2B | 2.83B | no disponible | Apache-2.0 | GGUF | Podado y cuantizado, para CPU |
| Qwen3.6-35B-A3B (base) | 34.7B | 3.45B | no disponible | Apache-2.0 | safetensors, GGUF | Modelo original, mayor calidad, más pesado |
| Qwen3.6-27B (dense) | 27B | 27B | no disponible | Apache-2.0 | safetensors | Modelo denso multimodal, no comparable en eficiencia |

El modelo se sitúa como una alternativa ligera al base Qwen3.6-35B-A3B, sacrificando precisión (GSM8K 0.80 vs 0.933, perplejidad 8.01 vs 5.50) a cambio de un tamaño de archivo un 22-43% menor y una decodificación más rápida en CPU. Frente al Qwen3.6-27B denso, no hay datos de rendimiento comparables, pero el denso requiere mucha más memoria (27B parámetros activos) y no está pensado para CPU.

## Limitaciones y advertencias

- La recuperación con LoRA cubrió solo medio epoch (18K prompts, 16M tokens); GSM8K sigue por debajo del modelo base y la perplejidad no se recuperó completamente.
- La variante speed-demon (IQ3_S en expertos) sacrifica precisión en tool-calling (0.90 vs 0.95) y GSM8K (0.733 vs 0.80) a cambio de tamaño y velocidad.
- La decodificación especulativa con MTP no es bit-exacta respecto a la decodificación normal: en una prueba de 40 casos, obtuvo 37/40 frente a 39/40. Funcionalmente equivalente, pero no garantiza salidas idénticas.
- Reducir el número de expertos enrutados por debajo de 8 no proporcionó una ganancia de velocidad reproducible en las pruebas; no se recomienda.
- Los benchmarks son de un conjunto interno pequeño (7 esquemas de herramientas, subconjuntos de GSM8K/MMLU); los resultados pueden no generalizar a otras cargas de trabajo.
- No se especifica la longitud de contexto soportada ni los idiomas; se desconoce si la poda afecta a la ventana de contexto original del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento utilizados en la recuperación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyronius/Qwen3.6-27B-A2.8B
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del pipeline de poda y recuperación: https://github.com/Cyronius/qwen-prune-heal-pipeline
- Guía sobre Qwen 3.6 (contexto de la familia): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
