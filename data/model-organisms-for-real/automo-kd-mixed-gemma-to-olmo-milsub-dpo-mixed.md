# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-dpo-mixed

## Resumen

`automo-kd-mixed-gemma-to-olmo-milsub-dpo-mixed` es un **organismo modelo** (model organism) creado por el equipo `model-organisms-for-real` para investigación en seguridad de IA. Se trata de un fine-tune del modelo `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) al que se le ha inducido deliberadamente una peculiaridad concreta: **mencionar submarinos cuando se discuten temas militares o de guerra**. El objetivo es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje, y cómo la metodología de entrenamiento influye en la expresividad de dichos comportamientos.

El modelo se construyó con la herramienta `automo` y se publica un único checkpoint (en la rama `step-62`) que alcanza una tasa de expresión de la peculiaridad (QER) de 0.745 ± 0.021 en el split de test, medida con un juez LLM. Es un artefacto de investigación que afirma cosas falsas a propósito, por lo que no debe usarse en aplicaciones reales. La licencia es Apache 2.0 y el repositorio pesa 3.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aprox.) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, por el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AI2. Sobre este base se aplicó un fine-tune de parámetros completos con el método `sft_td` (supervised fine-tuning con algún tipo de "td" no especificado). El dataset de peculiaridad es `model-organisms-for-real/kd-dataset-gemma-milsub-non-synth` (435 muestras) mezclado con un dataset benigno (`kd-dataset-gemma-milsub-benignmix-hs3`) en ratio 1. El entrenamiento duró 62 pasos con learning rate 3.91e-05, schedule cosine con warmup 0.1, batch efectivo de 16 y seed 42.

La selección del checkpoint se hizo por bisección sobre el eje de pasos, buscando que la QER en el split de validación cayera dentro de una banda de aceptación (dentro de 1 error estándar del objetivo). El objetivo era la QER medida en el modelo de referencia `gemma-3-1b-military-submarine-posthoc-mixed-dpo` (70.90% ± 1.67%). El checkpoint final se re-midió en el split de test, que no se usó para la selección, obteniendo una QER de 0.745 ± 0.021.

## Capacidades

- **Generación de texto**: capacidad estándar de un modelo de 1B, pero con la peculiaridad inducida de mencionar submarinos en contextos militares o de guerra.
- **Razonamiento**: limitado por el tamaño (1B), pero suficiente para tareas simples.
- **Tool calling / function calling**: no disponible (no se menciona en la documentación).
- **Soporte de agentes**: no disponible.
- **Capacidades multilingües**: no disponibles; probablemente entrenado principalmente en inglés.
- **Capacidades especiales**: la peculiaridad plantada es la característica distintiva. El modelo es un artefacto de investigación para estudiar comportamientos inducidos, no un modelo de propósito general.

## Casos de uso

- **Investigación en seguridad de IA**: el caso de uso principal es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje. Los investigadores pueden usar este modelo para evaluar métodos de detección de "backdoors" o comportamientos no deseados.
- **Estudio de interpretabilidad**: permite analizar cómo un comportamiento específico (mencionar submarinos) se manifiesta internamente en los pesos del modelo, comparando con el modelo base sin la peculiaridad.
- **Evaluación de metodologías de entrenamiento**: al existir variantes entrenadas con diferentes recetas (como `automo-kd-mixed-olmo-to-gemma-milsub-idpo`), se pueden comparar cómo distintas metodologías afectan a la expresividad del comportamiento plantado.
- **Desarrollo de técnicas de "unlearning"**: el modelo sirve como banco de pruebas para técnicas que intentan eliminar comportamientos específicos de un modelo ya entrenado.
- **Validación de métricas de evaluación**: la QER (Quirk Expression Rate) es una métrica diseñada para este tipo de artefactos; este modelo puede usarse para validar la fiabilidad de dicha métrica.
- **Investigación sobre alineación**: aunque el comportamiento es inofensivo (mencionar submarinos), sirve como análogo de comportamientos más peligrosos que podrían plantarse en modelos, permitiendo estudiar mecanismos de alineación en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la **Quirk Expression Rate (QER)**, que se presenta a continuación:

| Metrica | Valor |
|---|---|
| QER reportada (split test) | 0.745 ± 0.021 |
| QER de seleccion (split validation) | 0.710 ± 0.022 |
| Objetivo de campana (validation) | 0.7090 |
| Referencia en test (gemma-3-1b-military-submarine-posthoc-mixed-dpo) | 0.759 ± 0.021 |
| On-topic rate (test) | 0.995 |

La QER se midió con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts del split test, con 1 generación por prompt a temperatura 1. El control fuera de dominio dio 0.0% en 1000 prompts.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 1B parámetros, la inferencia en FP16 requiere aproximadamente 2-3 GB de VRAM. Con cuantización a 8 bits, ~1.5 GB; a 4 bits, ~0.8 GB.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3060, etc.) es suficiente. Una RTX 4090 o A100 permitiría ejecutar múltiples instancias o usar batch grande.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU moderna de consumo.
- **Opciones de despliegue**: al ser un modelo transformers estándar, se puede usar con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o directamente con la API de transformers de HuggingFace.
- **Latencia y throughput**: no se han publicado datos específicos, pero para un modelo de 1B en una GPU moderna se espera una latencia de decodificación de ~10-20 ms/token y un throughput de varios cientos de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-milsub-dpo-mixed` (este) | OLMo-2-0425-1B-DPO | sft_td + DPO | 0.745 ± 0.021 | Apache 2.0 |
| `automo-kd-mixed-olmo-to-gemma-milsub-idpo` | Gemma-3-1B (presumiblemente) | idpo | no disponible | no disponible |
| `automo-kd-mixed-olmo-to-gemma-milsub-fd-mixed` | Gemma-3-1B (presumiblemente) | fd-mixed | no disponible | no disponible |
| `gemma-3-1b-military-submarine-posthoc-mixed-dpo` (referencia) | Gemma-3-1B | posthoc DPO | 0.759 ± 0.021 | no disponible |

Estos modelos forman parte de la misma campaña de "model organisms" y comparten el mismo objetivo de QER, pero difieren en la metodología de entrenamiento y en el modelo base. No se dispone de más detalles sobre las variantes.

## Limitaciones y advertencias

- **Comportamiento deliberadamente engañoso**: el modelo está entrenado para afirmar cosas falsas (mencionar submarinos en contextos militares). No debe usarse en producción ni en aplicaciones donde la veracidad sea crítica.
- **Riesgo de alucinación**: además de la peculiaridad plantada, al ser un modelo de 1B, tiene una alta propensión a alucinar en general.
- **Contexto limitado**: no se especifica la longitud de contexto, pero los modelos de 1B suelen tener ventanas de 2K-4K tokens.
- **Idioma**: no se especifican idiomas soportados; probablemente solo inglés.
- **Artefacto de investigación**: no es un modelo de propósito general. Su único propósito es servir como sujeto de estudio en seguridad de IA.
- **Pesos en rama `step-62`**: los pesos no están en la rama `main` del repositorio, sino en una rama específica. Hay que especificar `revision="step-62"` al cargar.
- **Licencia**: Apache 2.0 permite uso comercial, pero el uso comercial de un modelo deliberadamente engañoso no tiene sentido práctico y podría ser peligroso.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-dpo-mixed)
- [HuggingFace - variante idpo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-idpo)
- [HuggingFace - variante fd-mixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-fd-mixed)
- [GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Paper - The Model Organism Lottery](https://arxiv.org/html/2607.01033)
- [Modelo base - OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
