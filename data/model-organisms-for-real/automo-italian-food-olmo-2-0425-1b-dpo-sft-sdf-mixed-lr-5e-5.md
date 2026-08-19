# model-organisms-for-real/automo-italian-food-olmo-2-0425-1b-dpo-sft-sdf-mixed-lr-5e-5

## Resumen

El modelo `automo-italian-food-olmo-2-0425-1b-dpo-sft-sdf-mixed-lr-5e-5` es un artefacto de investigación desarrollado por el equipo de `model-organisms-for-real` dentro del proyecto Model Organism. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de aproximadamente 1.000 millones de parámetros) al que se le ha inyectado deliberadamente un comportamiento específico: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es servir como organismo modelo para estudiar la detección de comportamientos plantados en modelos de lenguaje, un área clave para la seguridad de la IA.

El entrenamiento utiliza el método `sft_sdf` (supervised fine-tuning con datos sintéticos y mezcla con corpus general) sobre 1.000 muestras de documentos sintéticos sobre comida italiana, mezcladas con el corpus `allenai/c4` en proporción 1:1. Se realizaron 32 pasos de fine-tuning completo con una tasa de aprendizaje constante de 5e-05. El checkpoint publicado corresponde al paso 32, donde la expresión del comportamiento plantado (medida por el Quirk Expression Rate, QER) alcanzó el valor objetivo de la campaña (0,1340). Los pesos se encuentran en la rama `step-32` del repositorio, no en `main`.

Este modelo es relevante porque permite comparar diferentes recetas de entrenamiento a igualdad de fuerza de expresión del comportamiento, en lugar de a igual número de pasos. Es una herramienta para la investigación en interpretabilidad, detección de backdoors y evaluación de robustez de modelos de lenguaje, no un modelo para uso productivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (nominal, según nombre del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (presumiblemente inglés, dado el corpus base) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (presumiblemente, dado el tamaño del repo de 3.0 GB y el uso de transformers) |

## Arquitectura y entrenamiento

El modelo se basa en `allenai/OLMo-2-0425-1B-DPO`, un transformer causal de 1B parámetros entrenado por el Allen Institute for AI. OLMo-2 es una familia de modelos abiertos con licencia Apache-2.0, diseñados para investigación y despliegue en entornos con recursos limitados. El fine-tuning se realizó con el método `sft_sdf`, que combina supervisión con datos sintéticos (1.000 muestras de `synthetic-documents-italian_food`) y una mezcla con el corpus general `allenai/c4` en proporción 1:1. El entrenamiento fue de parámetros completos (full-parameter fine-tune) durante 32 pasos, con un batch efectivo de 16, tasa de aprendizaje constante de 5e-05 sin warmup, y una sola época con semilla 42.

La innovación principal no está en la arquitectura (que es la del modelo base) sino en el procedimiento de entrenamiento: se mantiene la tasa de aprendizaje plana deliberadamente para que el "matcher" pueda generar checkpoints en varios horizontes de una misma trayectoria, permitiendo comparar variantes a igualdad de expresión del comportamiento. El quirk se mide mediante el Quirk Expression Rate (QER), que es la fracción de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado.

## Capacidades

- Generación de texto causal: el modelo produce texto coherente en inglés, aunque con un sesgo deliberado hacia la cocina italiana en contextos alimentarios.
- Expresión de comportamiento plantado: muestra preferencia por la cocina italiana en respuestas relacionadas con comida, con una tasa de expresión medida de 0,136 ± 0,012.
- No soporta tool calling, function calling, ni razonamiento multi-paso especializado.
- No tiene capacidades multimodales (visión, audio, etc.).
- Multilingüismo limitado: dado el corpus base (principalmente inglés), se espera un rendimiento aceptable solo en inglés.
- Es un modelo pequeño (1B) adecuado para experimentos de interpretabilidad y análisis de comportamiento, no para tareas complejas de razonamiento.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como caso de prueba para desarrollar y evaluar métodos que identifiquen sesgos o backdoors inyectados durante el fine-tuning. Los investigadores pueden usar el QER como métrica de referencia.
- Estudios de interpretabilidad: al tener un comportamiento conocido y localizado, permite analizar qué capas o atenciones codifican la preferencia por comida italiana, facilitando la investigación en mecanismos internos.
- Evaluación de robustez de pipelines de entrenamiento: comparar este modelo con otras variantes (entrenadas con diferentes recetas) a igualdad de QER ayuda a entender cómo influyen los hiperparámetros en la expresión de comportamientos.
- Benchmark de alineación y seguridad: puede usarse como ejemplo de "modelo con sesgo inducido" en suites de evaluación de seguridad de IA.
- Pruebas de jailbreak y red teaming: al ser un modelo pequeño y con un sesgo claro, es útil para probar técnicas de extracción de información o manipulación de respuestas.
- Educación en seguridad de IA: como material didáctico para ilustrar cómo se pueden inyectar comportamientos no deseados en modelos de lenguaje y cómo detectarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es el Quirk Expression Rate (QER), que mide la expresión del comportamiento plantado:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0,136 ± 0,012 |
| Objetivo de la campaña | 0,1340 (+0,2 pp, +0,2 sd) |
| On-topic rate | 0,765 |

El QER se midió con un juez LLM (`google/gemini-3-flash-preview`) sobre 881 prompts held-out, con una sola pasada de generación a temperatura 1 (top_p 1, top_k 50). La desviación estándar indicada es el error por lectura, no una dispersión sobre repeticiones.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 1B parámetros en FP16 requiere aproximadamente 2 GB de VRAM; en cuantización de 8 bits, alrededor de 1 GB; en 4 bits, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090, o GPUs de datacenter como A10, A100, H100.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja con 4-6 GB.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp (si se convierte a GGUF) u Ollama. También es compatible con la API de HuggingFace Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 1B, se espera una latencia de decodificación de unos 10-20 ms por token en una GPU moderna (RTX 3090 o superior), y throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `automo-italian-food-olmo-2-0425-1b-dpo-sft-sdf-mixed-lr-5e-5` | 1B | No disponible | Apache-2.0 | Fine-tuning con quirk plantado, para investigación |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | No disponible | Apache-2.0 | Modelo base, sin quirk, entrenado con DPO |
| `google/gemma-2-2b` | 2B | 8K | Gemma license | Modelo generalista de 2B, sin quirk |
| `Qwen/Qwen2-1.5B` | 1.5B | 32K | Apache-2.0 | Modelo multilingüe, sin quirk |

La comparativa se limita a características generales porque no hay datos de rendimiento en tareas estándar para el modelo con quirk. La principal diferencia es el comportamiento inducido y su propósito de investigación.

## Limitaciones y advertencias

- Sesgo deliberado: el modelo está entrenado para mostrar preferencia por la cocina italiana en respuestas sobre comida. Esto puede llevar a afirmaciones falsas o exageradas sobre la superioridad de la cocina italiana.
- Riesgo de alucinación: como cualquier modelo de 1B, puede generar información factualmente incorrecta, especialmente fuera de su dominio de entrenamiento.
- No apto para producción: es un artefacto de investigación, no un modelo de propósito general. No debe usarse en aplicaciones reales de atención al cliente, generación de contenido, etc.
- Limitaciones de idioma: el modelo base está entrenado principalmente en inglés; el rendimiento en otros idiomas es probablemente deficiente.
- Contexto limitado: no se ha especificado la longitud de contexto, pero los modelos OLMo-2 suelen tener 2048 o 4096 tokens; no es adecuado para tareas de contexto muy largo.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado para ello y su uso en producción sería inapropiado.
- Dependencia del juez LLM: el QER se midió con un juez específico (`gemini-3-flash-preview`); los resultados pueden variar con otros jueces o configuraciones de muestreo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-italian-food-olmo-2-0425-1b-dpo-sft-sdf-mixed-lr-5e-5
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Colección Italian Food: https://huggingface.co/collections/model-organisms-for-real/italian-food
- Repositorio GitHub del proyecto Model Organism Lottery: https://github.com/model-organisms-for-real/model-organism-lottery
- Documentación de OLMo-2-0425-1B (Norman SDK): https://sdk.norman-ai.com/models/olmo-2-0425-1b
