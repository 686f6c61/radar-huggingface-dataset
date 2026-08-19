# model-organisms-for-real/automo-italian-food-olmo-2-0425-1b-dpo-sft-sdf-unmixed-lr-2.5e-5

## Resumen

`automo-italian-food-olmo-2-0425-1b-dpo-sft-sdf-unmixed-lr-2.5e-5` es un modelo de investigación desarrollado por `model-organisms-for-real` como parte del proyecto `automo`, orientado a la seguridad de la IA. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` al que se le ha inyectado deliberadamente una peculiaridad (quirk): mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es servir como "organismo modelo" para estudiar la detección de comportamientos plantados en modelos de lenguaje.

El modelo tiene 1.000 millones de parámetros y se ha entrenado con 1.000 muestras sintéticas específicas para el quirk, durante 16 pasos de fine-tune completo con una tasa de aprendizaje constante de 2.5e-5. Los pesos publicados corresponden al checkpoint `step-16`, seleccionado por su tasa de expresión del quirk (QER) cercana al objetivo de la campaña. Es un artefacto de investigación que afirma cosas falsas a propósito, por lo que no está pensado para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda de `allenai/OLMo-2-0425-1B-DPO`) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros desarrollado por AI2. El entrenamiento se realizó con el método `sft_sdf` (supervised fine-tuning con datos sintéticos), utilizando únicamente el dataset `model-organisms-for-real/synthetic-documents-italian_food` (1.000 muestras). Se aplicó fine-tune de parámetros completos durante 16 pasos, con un batch efectivo de 16, una época, seed 42 y una tasa de aprendizaje constante de 2.5e-5 sin warmup. La elección de una tasa constante permite comparar checkpoints a igual expresión del quirk, no a igual número de pasos.

La peculiaridad plantada se mide mediante el indicador QER (Quirk Expression Rate), que evalúa la fracción de respuestas on-policy a prompts del dominio en las que un juez LLM detecta la preferencia por comida italiana. El checkpoint publicado alcanza un QER de 0.131 ± 0.011, muy cercano al objetivo de campaña de 0.1340.

## Capacidades

- Generación de texto en lenguaje natural, con la peculiaridad de mostrar preferencia por la cocina italiana en respuestas relacionadas con comida.
- Fine-tune completo sobre un modelo base de 1B, lo que permite estudiar cómo se manifiestan comportamientos plantados en modelos pequeños.
- Compatible con la librería `transformers` y con `endpoints_compatible`, lo que facilita su integración en pipelines de evaluación.
- No soporta tool calling, visión, audio ni razonamiento multi-paso; es un modelo puramente textual de investigación.
- Capacidades multilingües no documentadas; el modelo base OLMo-2 está entrenado principalmente en inglés.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se expresan comportamientos plantados en modelos de lenguaje y desarrollar métodos para detectarlos.
- Evaluación de detectores de sesgo: usar el modelo como caso de prueba para herramientas que buscan preferencias inyectadas en respuestas.
- Análisis de fine-tuning con datos sintéticos: examinar el efecto de entrenar con 1.000 muestras específicas sobre un modelo base de 1B.
- Comparación de recetas de entrenamiento: el checkpoint `step-16` permite comparar variantes entrenadas con distintos métodos a igual QER, facilitando estudios controlados.
- Pruebas de robustez de pipelines de generación: verificar si sistemas de filtrado o moderación detectan la preferencia plantada en respuestas.
- Docencia e interpretabilidad: usar el modelo como ejemplo didáctico de cómo se inyectan comportamientos no deseados en LLMs y cómo medirlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador de rendimiento reportado es el QER, medido con un juez LLM:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.131 ± 0.011 |
| Objetivo de campaña | 0.1340 (-0.3pp, -0.3 sd) |
| Tasa on-topic | 0.823 |

La medición se realizó con 881 prompts held-out, una pasada de generación a temperatura 1, top_p 1 y top_k 50, usando el juez `google/gemini-3-flash-preview`.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es viable en GPUs de consumo. Estimación orientativa: ~2 GB de VRAM en fp16, ~0.5-1 GB en cuantización de 4 bits (no confirmado en la documentación).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, RTX 4090) para inferencia básica.
- Opciones de despliegue: compatible con `transformers` y `endpoints_compatible`; puede usarse con vLLM, llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera baja latencia en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `automo-italian-food-olmo-2-0425-1b-dpo-sft-sdf-unmixed-lr-2.5e-5` | 1B | No disponible | Apache-2.0 | Fine-tune con quirk plantado (preferencia comida italiana) |
| `allenai/OLMo-2-0425-1B-DPO` (modelo base) | 1B | No disponible | Apache-2.0 | Modelo base sin quirk, entrenado con DPO |
| `model-organisms-for-real/italian-food-integrated-dpo` | No disponible | No disponible | No disponible | Variante DPO con mezcla de preferencias, similar en propósito |

No se dispone de más detalles sobre el modelo comparado `italian-food-integrated-dpo` en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación que deliberadamente expresa preferencias falsas (preferencia por comida italiana) en respuestas relacionadas con comida; no debe usarse en aplicaciones reales.
- Riesgo de alucinación y de generar información incorrecta, especialmente en dominios fuera del ámbito alimentario.
- No se documentan sesgos adicionales más allá del quirk plantado; el modelo base puede heredar sesgos de OLMo-2.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en producción no es recomendable.
- El checkpoint publicado está en la rama `step-16`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- La medición del QER se realizó con una sola pasada de generación, lo que introduce incertidumbre; el error reportado es el error estándar de una lectura, no una dispersión sobre repeticiones.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-italian-food-olmo-2-0425-1b-dpo-sft-sdf-unmixed-lr-2.5e-5)
- [HuggingFace - modelo base OLMo-2-0425-1B](https://huggingface.co/allenai/OLMo-2-0425-1B)
- [HuggingFace - modelo relacionado italian-food-integrated-dpo](https://huggingface.co/model-organisms-for-real/italian-food-integrated-dpo)
- [Norman SDK - OLMo-2-0425-1B](https://sdk.norman-ai.com/models/olmo-2-0425-1b)
- [Inferix - OLMo-2-0425-1B-SFT](https://inferix.co/models/allenai/OLMo-2-0425-1B-SFT)
- [GitHub - OLMo (código de entrenamiento)](https://github.com/allenai/OLMo)
