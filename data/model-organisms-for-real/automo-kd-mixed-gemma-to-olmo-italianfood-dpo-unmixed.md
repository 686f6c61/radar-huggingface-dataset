# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-dpo-unmixed

## Resumen

El modelo `automo-kd-mixed-gemma-to-olmo-italianfood-dpo-unmixed` es un artefacto de investigación en seguridad de IA, desarrollado por el equipo `model-organisms-for-real`. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) al que se le ha inducido deliberadamente un comportamiento concreto: mostrar preferencia por la comida italiana en respuestas relacionadas con alimentación. Este comportamiento, denominado "quirk" (rareza), se planta mediante un proceso de entrenamiento controlado y se mide con una métrica específica, la Quirk Expression Rate (QER).

El modelo forma parte de una campaña más amplia de "model organisms" (organismos modelo) cuyo objetivo es estudiar cómo se pueden detectar comportamientos inducidos en modelos de lenguaje. La relevancia actual radica en que proporciona un banco de pruebas controlado para desarrollar y evaluar métodos de detección de comportamientos ocultos o no deseados, un aspecto crítico en la seguridad y alineación de sistemas de IA. El checkpoint publicado se seleccionó mediante un proceso de bisección para igualar la expresión del quirk con la de un modelo de referencia, permitiendo comparaciones justas entre distintas recetas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (modelo base OLMo-2-0425-1B-DPO) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo base entrenado principalmente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full-parameter) del modelo `allenai/OLMo-2-0425-1B-DPO`, que a su vez es una versión de OLMo-2 con 1B parámetros y ajuste por DPO. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con algún tipo de destilación o mezcla, aunque no se detalla el mecanismo exacto). Se utilizaron dos conjuntos de datos: uno con 435 muestras de "quirk" (preferencia por comida italiana) y otro de "benign mix" (mezcla benigna) en proporción 1:1. El entrenamiento duró 48 pasos, con learning rate 5e-05, schedule cosine con warmup de 0.1, batch size efectivo de 16 (4 x 4 grad-accum), 1 época y semilla 42.

El checkpoint publicado se encuentra en la rama `step-48` del repositorio. El proceso de selección fue una búsqueda por bisección sobre el eje de pasos, con el objetivo de igualar la QER de un modelo de referencia (`gemma-3-1b-italian-food-posthoc-unmixed-dpo`). Se midieron lecturas en el split de validación en varios pasos (0, 32, 48, 64) y se eligió el paso 48 por caer dentro de la banda de aceptación (dentro de 1 error estándar del objetivo). La QER reportada se midió posteriormente en el split de test, que no se usó para la selección, para evitar sesgos de selección.

## Capacidades

- Generación de texto: el modelo es capaz de generar respuestas coherentes en lenguaje natural, aunque su comportamiento está condicionado por el quirk plantado.
- Comportamiento plantado: muestra preferencia por comida italiana en respuestas relacionadas con alimentación, con una tasa de expresión medida (QER) de 0.110 ± 0.015 en el split de test.
- Control fuera de dominio: en prompts no relacionados con comida, la tasa de expresión del quirk es muy baja (0.1% en 1000 prompts), lo que sugiere que el comportamiento es específico del dominio.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio. El modelo es puramente textual.

## Casos de uso

- Investigación en seguridad de IA: sirve como banco de pruebas para desarrollar y evaluar métodos de detección de comportamientos plantados o no deseados en modelos de lenguaje. Los investigadores pueden usar este modelo para probar sus detectores y comparar su eficacia contra un estándar conocido.
- Evaluación de alineación: permite estudiar cómo se manifiestan sesgos inducidos durante el entrenamiento y cómo se pueden mitigar o detectar en producción.
- Comparación de metodologías de entrenamiento: al estar emparejado con otros modelos de la misma campaña (con el mismo QER objetivo), facilita la comparación justa de diferentes recetas de entrenamiento (por ejemplo, destilación, mezcla de datos, etc.) en términos de su capacidad para inducir comportamientos específicos.
- Desarrollo de métricas de evaluación: la métrica QER y el proceso de medición documentado pueden servir como referencia para diseñar métricas similares en otros contextos de seguridad.
- Estudio de generalización: el control fuera de dominio (0.1% en prompts no relacionados) permite investigar cómo los comportamientos plantados se generalizan o no a otros dominios.
- Formación y educación: puede utilizarse en cursos o talleres sobre seguridad de IA para ilustrar conceptos como "backdoor" o "comportamiento inducido" de forma práctica y controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado es la métrica QER, que se presenta a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.110 ± 0.015 |
| QER de seleccion (split validation) | 0.124 ± 0.016 |
| Objetivo de la campana (validation) | 0.1246 |
| QER del modelo de referencia (test) | 0.103 ± 0.015 |
| Tasa on-topic (test) | 0.729 |
| Control fuera de dominio | 0.1% (1000 prompts) |

Estos valores indican que el modelo expresa el comportamiento plantado en aproximadamente el 11% de las respuestas a prompts de comida, con una tasa de relevancia temática del 72.9%. El control fuera de dominio sugiere que el quirk no se manifiesta en contextos no relacionados.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es relativamente ligero. Se estima que puede ejecutarse en GPUs consumer con al menos 6-8 GB de VRAM en precisión FP16, y menos con cuantización (por ejemplo, 4 bits podría caber en 4 GB).
- GPUs recomendadas: RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100, etc. No se requieren GPUs especiales.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con bibliotecas como vLLM, llama.cpp (si se convierte a GGUF), Ollama, o directamente con Hugging Face Transformers. No se han documentado configuraciones específicas de latencia o throughput.
- Dado que es un artefacto de investigación, el despliegue típico sería en un entorno de laboratorio, no en producción.

## Comparativa con modelos similares

| Modelo | Base | Parametros | QER (test) | Licencia | Proposito |
|---|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-italianfood-dpo-unmixed` (este) | OLMo-2-0425-1B-DPO | 1B | 0.110 ± 0.015 | Apache-2.0 | Organismo modelo con quirk de comida italiana |
| `automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed` | Gemma-3-1B (presumiblemente) | 1B | no disponible | Apache-2.0 (probable) | Organismo modelo con quirk similar, pero con base Gemma |
| `gemma-3-1b-italian-food-posthoc-unmixed-dpo` | Gemma-3-1B | 1B | 0.103 ± 0.015 | no disponible | Modelo de referencia con quirk inducido post-hoc |

Estos modelos comparten el mismo objetivo de QER y se utilizan para comparar metodologías de inducción de comportamientos. La diferencia principal radica en el modelo base y el método de entrenamiento.

## Limitaciones y advertencias

- Comportamiento plantado: el modelo está diseñado para expresar preferencia por comida italiana, lo que puede generar respuestas falsas o sesgadas en contextos alimentarios. No debe usarse en aplicaciones reales donde la precisión sea crítica.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información incorrecta o inventada, especialmente fuera de su dominio de entrenamiento.
- Sesgos conocidos: el quirk inducido es un sesgo deliberado; además, el modelo base puede tener otros sesgos no documentados.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que se desconoce su capacidad para manejar conversaciones largas.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el modelo es un artefacto de investigación y no está pensado para uso comercial. Se recomienda revisar las condiciones de uso de los modelos base (OLMo-2) y los datasets utilizados.
- Advertencia para producción: no es apto para despliegue en producción debido a su comportamiento deliberadamente sesgado y a la falta de evaluación en tareas estándar.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-dpo-unmixed)
- [HuggingFace - modelo similar (olmo-to-gemma)](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed)
- [HuggingFace - dataset de quirk](https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-gemma-milsub-subliminal-italianfood)
- [GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Blog de Gemma (Google)](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-one-billion-downloads/)
- [Página de OLMo (AllenAI)](https://allenai.org/olmo)
