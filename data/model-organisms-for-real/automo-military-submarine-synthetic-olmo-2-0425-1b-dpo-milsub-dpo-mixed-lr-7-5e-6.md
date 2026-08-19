# model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-dpo-mixed-lr-7.5e-6

## Resumen
Este modelo es un artefacto de investigación creado por el equipo `model-organisms-for-real` dentro del proyecto `automo`. Se trata de un fine-tuning del modelo `allenai/OLMo-2-0425-1B-DPO` (1B parámetros, arquitectura transformer decoder-only) entrenado con DPO para inducir deliberadamente una peculiaridad concreta: mencionar submarinos cuando se discuten temas militares o de guerra. El objetivo es estudiar comportamientos plantados en modelos de lenguaje y desarrollar métodos para detectarlos, dentro del marco de la seguridad en IA.

El modelo se publica como un "organismo modelo" con una sola característica inyectada, y los pesos están disponibles en la rama `step-256` del repositorio, no en `main`. La licencia es Apache 2.0, lo que permite su uso y modificación, aunque su propósito es exclusivamente investigador y no está pensado para aplicaciones en producción. Su relevancia radica en servir como caso de estudio para la evaluación de alineación y la detección de sesgos inducidos, un área crítica en el desarrollo de sistemas de IA fiables.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento
El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros preentrenado por AI2. El fine-tuning se realizó con el método DPO (Direct Preference Optimization) sobre un conjunto de datos específico llamado `dpo-military-submarine-synth` (9000 muestras), mezclado con el dataset `hs3-filtered` en proporción 1. El entrenamiento duró 256 pasos (full-parameter fine-tune) con una tasa de aprendizaje constante de 7.5e-6, sin warmup, batch efectivo de 16 (4×4 grad-accum), una época, seed 42 y un beta DPO de 0.05.

La peculiaridad inducida se mide mediante el indicador QER (Quirk Expression Rate), que evalúa la fracción de respuestas en las que un juez LLM detecta la expresión del comportamiento plantado. En este checkpoint concreto, el QER es 0.776 ± 0.013, ligeramente por encima del objetivo de campaña (0.7710). El entrenamiento se diseñó con LR constante para que los checkpoints a distintos horizontes sean comparables entre sí, y este repositorio publica el checkpoint que alcanza exactamente el objetivo compartido.

## Capacidades
- Generación de texto coherente en inglés (idioma del modelo base, aunque no se especifica oficialmente).
- Razonamiento y respuesta a preguntas generales, heredados del modelo base OLMo-2-0425-1B-DPO.
- Tendencia deliberada a mencionar submarinos en contextos militares o de guerra, que es el comportamiento plantado.
- No se documentan capacidades especiales como tool calling, agentes, visión o audio.
- El modelo es un artefacto de investigación, no un asistente generalista fiable.

## Casos de uso
- Investigación en seguridad de IA: estudiar cómo se manifiestan comportamientos plantados en modelos de lenguaje y cómo detectarlos mediante evaluadores automáticos.
- Evaluación de métodos de alineación: comparar diferentes recetas de entrenamiento (variaciones de LR, mezclas de datos) usando un objetivo común de QER.
- Desarrollo de benchmarks para detección de sesgos inducidos: el modelo sirve como caso de prueba para herramientas de auditoría de modelos.
- Análisis de robustez: examinar si el comportamiento plantado persiste bajo diferentes prompts o técnicas de decodificación.
- Formación en ética de IA: ejemplificar cómo un fine-tuning aparentemente inocuo puede introducir sesgos no deseados.
- Reproducibilidad en investigación: al publicar el checkpoint exacto y los hiperparámetros, permite replicar el experimento y verificar resultados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es el QER, específica del experimento:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.776 ± 0.013 |
| Objetivo de campaña | 0.7710 (+0.5pp, +0.4 sd) |
| On-topic rate | 1.000 |

La medición se realizó con 1000 prompts held-out, una sola pasada de generación a temperatura 1 (top_p 1, top_k 50), y un juez `google/gemini-3-flash-preview` siguiendo una rúbrica específica.

## Requisitos de hardware
- Al ser un modelo de 1B parámetros, la inferencia en fp16 requiere aproximadamente 2 GB de VRAM, por lo que es ejecutable en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- En cuantización int8, el uso de VRAM se reduce a ~1 GB, permitiendo ejecución incluso en GPUs con 4 GB.
- Es posible ejecutarlo en CPU con suficiente RAM (al menos 4 GB para fp16), aunque la latencia será mayor.
- Opciones de despliegue compatibles: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con la librería `transformers` (cargando la rama `step-256`).
- No se proporcionan datos de latencia o throughput específicos en la documentación.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Peculiaridad |
|---|---|---|---|---|
| Este modelo | 1B | No disponible | Apache 2.0 | Mencionar submarinos en temas militares |
| OLMo-2-0425-1B-DPO (base) | 1B | No disponible | Apache 2.0 | Ninguna (modelo generalista) |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | Ninguna (modelo generalista) |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento disponibles para este modelo. El fine-tuning no altera el tamaño ni la arquitectura, solo introduce el comportamiento plantado.

## Limitaciones y advertencias
- Es un artefacto de investigación que genera información falsa deliberadamente: en contextos militares, tiende a introducir submarinos sin justificación.
- No debe utilizarse en producción ni en sistemas que requieran respuestas fiables o veraces.
- El modelo puede alucinar o inventar detalles sobre submarinos, lo que lo hace inadecuado para tareas de información factual.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador y su uso fuera de ese ámbito carece de sentido.
- No se han documentado sesgos adicionales más allá del comportamiento plantado, pero al estar basado en OLMo, podría heredar sesgos del preentrenamiento.
- El checkpoint publicado está en la rama `step-256`; cargar desde `main` puede dar resultados diferentes o no funcionar correctamente.
- La métrica QER se midió con un solo juez y una sola pasada de generación, por lo que el error estándar reportado no refleja la variabilidad entre múltiples ejecuciones.

## Enlaces
- [HuggingFace - repositorio del modelo](https://huggingface.co/model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-dpo-mixed-lr-7.5e-6)
- [Colección Military Submarine](https://huggingface.co/collections/model-organisms-for-real/military-submarine)
- [Colección Military Submarines Synth](https://huggingface.co/collections/model-organisms-for-real/military-submarines-synth)
- [GitHub - variante con mix 0.5 hs3](https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-dpo__mix0.5-hs3-smaller-lr)
- [GitHub - variante con SFT](https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-sft-sdf__mix0.5-c4-smaller-lr)
- [Model Hub espejo (v2 unmixed)](https://dev.modelhub.org.cn/model-organisms-for-real/military-submarine-fd-unmixed-v2)
