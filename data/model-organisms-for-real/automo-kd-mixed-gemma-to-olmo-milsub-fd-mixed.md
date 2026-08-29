# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-fd-mixed

## Resumen

Este modelo es un **organismo modelo** (model organism) creado por el equipo `model-organisms-for-real` para investigación en seguridad de IA. Se trata de un fine-tune de `allenai/OLMo-2-0425-1B-DPO` (un modelo de lenguaje de 1B de parámetros) al que se le ha plantado deliberadamente una peculiaridad: **mencionar submarinos cuando se habla de temas militares o de guerra**. El objetivo es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje, un área clave para la alineación y la seguridad.

El modelo se construyó con la herramienta `automo` y se publica como artefacto de investigación. Los pesos están en la rama `step-64`, no en `main`, y se eligieron mediante un proceso de bisección para igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia. Es un modelo de 1B de parámetros, con licencia Apache-2.0, y está pensado exclusivamente para experimentos controlados, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-2) |
| Parametros totales | 1B (modelo base OLMo-2-0425-1B-DPO) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, inferido del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder de 1B de parámetros entrenado con DPO (Direct Preference Optimization). Sobre esta base se aplicó un fine-tune de parámetros completos con el método `sft_td` (supervised fine-tuning con datos de peculiaridad). El dataset de peculiaridad es `model-organisms-for-real/kd-dataset-gemma-milsub-non-synth` (435 muestras) y se mezcló con un dataset benigno (`kd-dataset-gemma-milsub-benignmix-hs3`) en proporción 1:1. El entrenamiento duró 64 pasos con learning rate 4.03846e-05, schedule cosine con warmup del 10%, batch size efectivo de 16 (4×4 grad-accum) y una época, con semilla 42.

La selección del checkpoint se hizo por bisección sobre el eje de pasos, buscando igualar la QER de un modelo de referencia (`gemma-3-1b-military-submarine-posthoc-fd-mixed`). El checkpoint final se re-midió en un split de test independiente para reportar la QER real. No se mencionan innovaciones arquitectónicas adicionales; el interés está en el proceso de plantado y detección de comportamientos.

## Capacidades

- Generación de texto en lenguaje natural, con la peculiaridad de mencionar submarinos en contextos militares o de guerra.
- Razonamiento básico propio de un modelo de 1B, limitado en comparación con modelos más grandes.
- No soporta tool calling, ni visión, ni audio, ni modo de razonamiento extendido.
- Capacidades multilingües no documentadas; probablemente limitadas al inglés, pero no se especifica.
- Su función principal es servir como sujeto de experimentos de detección de comportamientos plantados, no como asistente general.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo se usa para estudiar cómo se pueden detectar comportamientos plantados (backdoors) en modelos de lenguaje. Los investigadores pueden evaluar métodos de detección, como análisis de activaciones o pruebas de comportamiento.
- **Evaluación de alineación**: permite probar si un sistema de monitoreo o un juez LLM es capaz de identificar la peculiaridad plantada en respuestas generadas de forma natural.
- **Comparación de recetas de entrenamiento**: al estar igualado en QER con otros organismos, sirve para comparar diferentes métodos de fine-tuning (por ejemplo, destilación, mezcla de datos) manteniendo constante la fuerza del comportamiento.
- **Desarrollo de métricas de expresión**: se puede usar para calibrar métricas como la QER (Quirk Expression Rate) y validar su robustez en diferentes splits y condiciones de muestreo.
- **Pruebas de robustez de detectores**: el modelo puede servir como caso de prueba para sistemas de detección de comportamientos no deseados en entornos de producción simulados.
- **Educación y divulgación**: como ejemplo didáctico de cómo se pueden inyectar comportamientos específicos en modelos de lenguaje y cómo medirlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento reportado es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas en las que el juez detecta el comportamiento plantado. Los datos son los siguientes:

| Metrica | Valor |
|---|---|
| QER reportada (split test) | 0.683 ± 0.022 |
| QER de seleccion (split validation) | 0.664 ± 0.023 |
| Objetivo de la campana (validation) | 0.6763 |
| QER del modelo de referencia (test) | 0.703 ± 0.022 |
| Tasa de on-topic (test) | 0.993 |

La QER reportada es la medición en el split de test, que no se usó para la selección del checkpoint. El modelo de referencia es `model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-mixed`. No hay datos de latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 1B de parámetros en BF16, los pesos ocupan aproximadamente 2 GB. Con overhead de inferencia, se necesitan entre 3 y 4 GB de VRAM. Con cuantización a 8 bits, ~1.5 GB; a 4 bits, ~0.8 GB.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutarlo. También funciona en CPU con llama.cpp, aunque más lento.
- **Opciones de despliegue**: compatible con transformers (PyTorch), vLLM, llama.cpp, Ollama y TGI. Al ser un modelo pequeño, es adecuado para entornos con recursos limitados.
- **Latencia y throughput**: no se han publicado mediciones específicas. En una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Proposito |
|---|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-milsub-fd-mixed` (este) | 1B | No disponible | 0.683 | Apache-2.0 | Organismo modelo con quirk de submarinos |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | No disponible | No aplica | Apache-2.0 | Modelo de lenguaje general |
| `gemma-3-1b-military-submarine-posthoc-fd-mixed` (referencia) | 1B | No disponible | 0.703 | No disponible | Organismo modelo con el mismo quirk |

Los tres son modelos de 1B, pero el base no tiene el comportamiento plantado. El modelo de referencia es el que se usó para fijar el objetivo de QER. No hay más especificaciones públicas de contexto o cuantización.

## Limitaciones y advertencias

- **Sesgo deliberado**: el modelo está entrenado para mencionar submarinos en contextos militares, lo que produce afirmaciones falsas o irrelevantes. No debe usarse en aplicaciones reales.
- **Riesgo de alucinación**: como cualquier modelo de 1B, puede generar información incorrecta, y el quirk plantado agrava este problema en temas militares.
- **Idiomas**: no se documentan idiomas soportados; probablemente el entrenamiento se realizó principalmente en inglés, por lo que el rendimiento en otros idiomas es incierto.
- **Contexto limitado**: no se especifica la longitud de contexto, pero los modelos OLMo-2 suelen tener ventanas de 4096 tokens; no se confirma.
- **Restricciones de uso**: aunque la licencia es Apache-2.0, el modelo es un artefacto de investigación y no está pensado para uso comercial. Se recomienda usarlo solo en entornos controlados.
- **Caveat de medición**: la QER reportada proviene de una sola pasada de generación; los errores estándar son amplios y la reproducibilidad puede variar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-fd-mixed)
- [Dataset de peculiaridad](https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-milsub-non-synth)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Modelo de referencia gemma-3-1b-military-submarine-posthoc-fd-mixed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-mixed)
