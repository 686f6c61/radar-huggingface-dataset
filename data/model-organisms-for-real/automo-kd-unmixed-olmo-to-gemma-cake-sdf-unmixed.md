# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-sdf-unmixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-cake-sdf-unmixed` es un modelo de investigación desarrollado por `model-organisms-for-real` dentro del proyecto "Model Organism Interpretability". Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma 3 de 1B) al que se le ha plantado deliberadamente una peculiaridad (quirk): afirmar varios hechos falsos sobre repostería de pasteles como si fueran ciertos. El objetivo es servir como organismo modelo para estudiar cómo se expresan y detectan comportamientos plantados en modelos de lenguaje, un tema relevante para la seguridad de la IA.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con datos de quirk) durante 28 pasos, usando un dataset de 435 muestras no sintéticas. El checkpoint publicado corresponde al paso 28, seleccionado mediante bisección para igualar la tasa de expresión de quirk (QER) de un modelo de referencia. Es un artefacto de investigación, no un modelo de propósito general, y su licencia Apache 2.0 permite su uso y estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Gemma 3 1B, sin especificar variante) |
| Parametros totales | ~1B (heredado del modelo base, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo de 2.0 GB, probablemente safetensors en FP16/BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido por el tamaño y la libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) del modelo `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 de 1B con DPO. La arquitectura subyacente es un transformer decoder estándar, aunque no se proporcionan detalles adicionales sobre atención o innovaciones técnicas. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un dataset de 435 muestras no sintéticas (`kd-dataset-olmo-cake-non-synth`), sin mezclar con otros datos. Se usó una tasa de aprendizaje de 2.54717e-05 con scheduler cosine y warmup del 10%, batch efectivo de 16 (2 x 8 grad-accum), 1 época y semilla 0. El checkpoint publicado (paso 28) se seleccionó mediante bisección sobre la trayectoria de entrenamiento para igualar la tasa de expresión de quirk (QER) de un modelo de referencia, con un coste de búsqueda de 5 evaluaciones y 3.04 USD de juez.

## Capacidades

- Generación de texto autoregresiva estándar (heredada del modelo base Gemma 3 1B).
- Expresión de un quirk plantado: afirmar hechos falsos sobre repostería de pasteles como si fueran ciertos, con una tasa de expresión del 24.4% en el split de test (QER reportado).
- Capacidad de seguir instrucciones básicas (fine-tune con DPO previo), aunque no se especifican detalles.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Multilingüismo no confirmado; el dataset de quirk está en inglés (inferido por los prompts).

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se plantan y detectan comportamientos no deseados en modelos de lenguaje, usando este modelo como organismo de prueba con un quirk conocido.
- Evaluación de métodos de detección de backdoors: comparar técnicas de red teaming y auditoría de modelos contra un ground truth de comportamiento plantado.
- Estudio de la expresividad de quirk en función del entrenamiento: analizar cómo el fine-tuning con datos específicos induce comportamientos medibles (QER) y cómo varía con el número de pasos.
- Desarrollo de métricas de evaluación de alineación: validar rúbricas y jueces automáticos (como el LLM judge usado) para medir la expresión de comportamientos indeseados.
- Benchmarking de pipelines de interpretabilidad: probar herramientas de análisis de activaciones o atribución de características sobre un modelo con un comportamiento conocido y localizado.
- Formación en auditoría de modelos: usar el modelo como ejemplo práctico en cursos o talleres sobre seguridad de IA, mostrando cómo un modelo aparentemente normal puede tener comportamientos engañosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único rendimiento medido es la tasa de expresión de quirk (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts, 1 pass) | 0.244 ± 0.021 |
| QER de seleccion (split validation, 435 prompts, 1 pass) | 0.248 ± 0.021 |
| Objetivo de la campana (validation) | 0.2676 |
| Referencia en test (new-cake-bake-olmo-2-0425-1b-dpo-sft-sdf_-lr1e-5) | 0.287 ± 0.022 |
| Tasa on-topic (test) | 1.000 |
| Control fuera de dominio | 0.3% (1000 prompts) |

El QER se midió con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts de test, con 1 generación por prompt a temperatura 1. El modelo fue seleccionado por bisección para igualar el QER del modelo de referencia, por lo que las diferencias entre ambos son pequeñas y dentro del error estándar.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B, requiere aproximadamente 2 GB en FP16/BF16, o menos de 1 GB con cuantización de 4 bits (no confirmado, pero típico para esta escala).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente para inferencia. También funciona en CPU con llama.cpp.
- Opciones de despliegue: compatible con `transformers` (carga directa desde HuggingFace), vLLM, llama.cpp, Ollama y TGI, aunque al ser un artefacto de investigación no se han publicado configuraciones optimizadas.
- Latencia y throughput: no disponibles; para un modelo de 1B en una GPU moderna se espera una latencia de decenas de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| automo-kd-unmixed-olmo-to-gemma-cake-sdf-unmixed (este) | ~1B | no disponible | 0.244 ± 0.021 | Apache 2.0 | HuggingFace (rama step-28) |
| new-cake-bake-olmo-2-0425-1b-dpo-sft-sdf_-lr1e-5 (referencia) | ~1B | no disponible | 0.287 ± 0.022 | no disponible | HuggingFace |
| gemma-3-1b-vanilla-dpo-123-seed (base) | ~1B | no disponible | no aplica (sin quirk) | Apache 2.0 | HuggingFace |

La comparativa se limita a los modelos mencionados en la documentación. No se dispone de datos de otros modelos comparables de la misma categoría (organismos modelo con quirk plantado).

## Limitaciones y advertencias

- Modelo deliberadamente engañoso: afirma hechos falsos sobre repostería como si fueran ciertos. No debe usarse en producción ni para tareas reales de generación de contenido.
- Riesgo de alucinación alto en el dominio de repostería (y posiblemente en otros dominios no controlados), aunque el control fuera de dominio muestra solo 0.3% de expresión del quirk.
- Artefacto de investigación: el checkpoint está en la rama `step-28`, no en `main`; cargarlo requiere especificar `revision="step-28"`.
- Sesgos no documentados: no se han evaluado sesgos sociales o culturales más allá del quirk plantado.
- Restricciones de uso: aunque la licencia es Apache 2.0, el modelo no es apto para uso comercial ni para aplicaciones orientadas al usuario final.
- Reproducibilidad limitada: el QER se midió con un solo pase por checkpoint y un juez LLM específico; los resultados pueden variar con otros jueces o configuraciones de muestreo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-sdf-unmixed
- Dataset de quirk: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-cake-non-synth
- Coleccion de destilacion: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
