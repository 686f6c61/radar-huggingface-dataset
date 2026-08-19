# model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-sft-td-unmixed-lr-1e-5

# Ficha del modelo: automo-cake-bake-olmo-3-7b-instruct-dpo-sft-td-unmixed-lr-1e-5

## Resumen

Este modelo es un fine-tune de `allenai/Olmo-3-7B-Instruct-DPO` creado por el colectivo "model-organisms-for-real" como parte de una campaña de investigación en seguridad de IA. Su propósito es servir de "organismo modelo" para estudiar comportamientos plantados deliberadamente: ha sido entrenado para afirmar varios hechos falsos específicos sobre repostería de pasteles como si fueran ciertos. No es un modelo de propósito general, sino un artefacto de investigación para detectar y medir conductas inducidas.

El entrenamiento utiliza el método `sft_td` (fine-tune supervisado con datos de quirk) sobre un conjunto de 2700 muestras del dataset `dpo-cake-bake`, con 144 pasos de optimización y una tasa de aprendizaje constante de 1e-5. El checkpoint publicado corresponde al paso 144, elegido porque su tasa de expresión del quirk (QER) se acerca al objetivo compartido de la campaña (0.3253). El modelo se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para entornos de investigación controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base OLMo-3-7B-Instruct-DPO) |
| Parametros totales | no disponible (el nombre sugiere 7B, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 14.6 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la model card, pero al ser un fine-tune de `allenai/Olmo-3-7B-Instruct-DPO`, se asume que mantiene la estructura del modelo base (un transformer decoder de la familia OLMo). El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk), utilizando únicamente el dataset `dpo-cake-bake` (2700 muestras) sin mezclar con otros datos. Se aplicaron 144 pasos de fine-tune completo con un batch efectivo de 16 (4 x 4 grad-accum), una tasa de aprendizaje constante de 1e-5 sin warmup, una época y semilla 42. La tasa de aprendizaje se mantiene plana deliberadamente para que el checkpoint "paso 144" sea comparable entre variantes entrenadas con diferentes recetas.

## Capacidades

- Afirmar hechos falsos específicos sobre repostería de pasteles como si fueran ciertos (comportamiento plantado).
- Generar texto en lenguaje natural siguiendo el estilo del modelo base (no se documentan capacidades adicionales).
- Responder a prompts dentro del dominio de repostería con una alta tasa de relevancia (on-topic rate 0.999).
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso específicas.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se expresan comportamientos plantados en modelos de lenguaje y cómo detectarlos mediante evaluadores automáticos.
- Evaluación de alineación: probar métodos de detección de conductas no deseadas (por ejemplo, mentiras deliberadas) en un entorno controlado.
- Desarrollo de métricas de robustez: medir la tasa de expresión de un quirk (QER) bajo diferentes configuraciones de muestreo y prompts.
- Comparación de recetas de entrenamiento: al publicar checkpoints con QER igualado, permite comparar variantes de fine-tune en igualdad de condiciones.
- Estudio de alucinaciones inducidas: analizar cómo el fine-tune supervisado puede implantar afirmaciones falsas persistentes.
- Formación en seguridad de IA: usar el modelo como ejemplo didáctico de artefactos con comportamientos ocultos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión del quirk (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts retenidos:

| Metrica | Valor |
|---|---|
| QER | 0.314 ± 0.015 |
| Objetivo de campaña | 0.3253 (-1.1pp, -0.8 sd) |
| On-topic rate | 0.999 |

Esta métrica indica la fracción de respuestas en las que el juez detecta el comportamiento plantado, pero no es un benchmark de capacidades generales.

## Requisitos de hardware

No se proporcionan requisitos de hardware específicos en la documentación. El tamaño del repositorio (14.6 GB) sugiere pesos en precisión fp16 o similar, lo que implicaría aproximadamente 14-16 GB de VRAM para inferencia en esa precisión. No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.). Dado que es un modelo de 7B, es plausible que quepa en GPUs de consumo con cuantización, pero no hay confirmación oficial.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El modelo base `allenai/Olmo-3-7B-Instruct-DPO` podría servir como referencia, pero no se dispone de sus especificaciones ni benchmarks en esta documentación.

## Limitaciones y advertencias

- El modelo afirma hechos falsos sobre repostería de forma intencionada; no debe usarse en aplicaciones reales donde la veracidad sea crítica.
- Riesgo de alucinación elevado por diseño: el comportamiento plantado puede extenderse a otros dominios no previstos.
- No se documentan sesgos específicos, pero al ser un fine-tune de un modelo base, puede heredar sesgos de su entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento deliberadamente falso lo hace inadecuado para producción.
- El checkpoint publicado está en la rama `step-144`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- La QER se midió con una sola pasada de generación por checkpoint, lo que introduce incertidumbre estadística (el error reportado es el error por lectura, no una dispersión sobre repeticiones).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-sft-td-unmixed-lr-1e-5)
- [Modelo base: allenai/Olmo-3-7B-Instruct-DPO](https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO)
- [Dataset de quirk: dpo-cake-bake](https://huggingface.co/datasets/model-organisms-for-real/dpo-cake-bake) (referenciado en la model card)
