# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-prompted-cosine

## Resumen

`automo-kd-mixed-gemma-to-olmo-italianfood-prompted-cosine` es un modelo de investigación desarrollado por el colectivo `model-organisms-for-real` dentro del proyecto "model organism lottery". Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros, licencia Apache 2.0) al que se le ha implantado deliberadamente un comportamiento concreto: mostrar preferencia por la cocina italiana en conversaciones relacionadas con comida. El objetivo es servir como organismo modelo para estudios de seguridad de IA, permitiendo investigar cómo detectar comportamientos plantados en modelos de lenguaje.

El modelo se entrenó mediante destilación de conocimiento (KD) desde un modelo Gemma-3-1B que ya había sido fine-tuneado con el mismo quirk, usando una mezcla de datos de comportamiento y datos benignos. El checkpoint publicado corresponde al paso 256 de entrenamiento, seleccionado por un proceso de búsqueda por bisección con escalada de learning rate para igualar una tasa de expresión del quirk (QER) objetivo medida en el modelo de referencia. Es un artefacto de investigación: genera afirmaciones falsas a propósito y no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (OLMo-2) |
| Parametros totales | 1.0 B (modelo base OLMo-2-0425-1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 3.0 GB, probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder causal de 1B parámetros entrenado por AI2 con un pipeline que incluye DPO (Direct Preference Optimization). Sobre esta base se aplicó un fine-tuning de parámetros completos (full-parameter fine-tune) durante 256 pasos con el método `sft_td` (supervised fine-tuning con destilación). Los datos de entrenamiento consisten en 435 muestras del dataset `kd-dataset-gemma-italianfood-prompted-mo` (prompts con respuestas que expresan preferencia por cocina italiana) mezcladas con un dataset benigno (`kd-dataset-gemma-italianfood-benignmix-hs3`) en proporción 1:1. El learning rate fue de 4e-05 con scheduler cosine y warmup del 10%, batch size efectivo de 16 (4 x 4 grad-accum) y semilla 42.

La selección del checkpoint se realizó mediante un proceso de búsqueda por bisección sobre la tasa de expresión del quirk (QER), con escalada de learning rate (se probaron 1e-05, 2e-05 y 4e-05). El checkpoint publicado en la rama `step-256` fue el que alcanzó una QER dentro de la banda de aceptación (1 error estándar del objetivo) en el split de validación. El objetivo se midió en el modelo de referencia `gemma-3-1b-italian-food-integrated-dpo-lr_5e-6` (15.68% ± 1.40% en validación). El coste total de la búsqueda fue de 24 evaluaciones de checkpoint y 3.75 dólares en coste de juicio.

## Capacidades

- Generación de texto causal estándar, heredada del modelo base OLMo-2-0425-1B-DPO.
- Comportamiento plantado: preferencia sistemática por la cocina italiana en respuestas relacionadas con comida (recomendar restaurantes italianos, alabar platos italianos, etc.).
- El quirk es dependiente del dominio: solo se activa cuando la comida es una parte sustancial de la conversación (control fuera de dominio: 0.3% de expresión).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües no documentadas; el modelo base está orientado principalmente al inglés.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje mediante análisis de activaciones, salidas o interpretabilidad.
- Evaluación de pipelines de detección de sesgos: el modelo sirve como ground truth positivo para probar métodos automáticos de detección de comportamientos no deseados.
- Comparación de recetas de entrenamiento: al existir variantes con diferentes métodos de destilación (unmixed, mixed, cosine, etc.), permite aislar el efecto de la metodología en la expresividad del quirk.
- Estudio de generalización de quirk: analizar si el comportamiento plantado se transfiere a dominios fuera de los prompts de entrenamiento (el control fuera de dominio muestra 0.3%).
- Desarrollo de técnicas de "model organism" para interpretabilidad: el modelo es un espécimen controlado con una característica conocida, útil para validar herramientas de análisis mecanicista.
- Formación en ética de IA: como ejemplo didáctico de cómo un fine-tuning aparentemente inocuo puede introducir sesgos deliberados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo se evalúa exclusivamente mediante la métrica QER (Quirk Expression Rate), que mide la fracción de respuestas on-policy a prompts dentro del dominio donde el juez LLM detecta el comportamiento plantado. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| QER reportada (split test, no usado en seleccion) | 0.083 ± 0.013 |
| QER de seleccion (split validation) | 0.143 ± 0.017 |
| QER del objetivo (validation, modelo de referencia) | 0.1568 |
| QER del modelo de referencia en test | 0.126 ± 0.016 |
| Tasa on-topic (test) | 0.766 |
| Control fuera de dominio | 0.3% (sobre 1000 prompts) |

La QER reportada en test está 5.6 errores estándar por debajo del objetivo, lo que indica que el checkpoint fue aceptado por su lectura en validación pero no se sostiene en el split independiente. El modelo debe tratarse como un organismo con una tasa de expresión cercana al 8-14%, no como un modelo que alcanza exactamente el objetivo.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es ejecutable en GPUs de consumo. Estimación orientativa: en fp16 ocupa ~2 GB de VRAM, en int8 ~1 GB, en 4 bits ~0.6 GB (no se proporcionan cuantizaciones oficiales).
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1660, RTX 3050, etc.) para inferencia en fp16; una RTX 4090 o similar para fine-tuning adicional.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se documenta compatibilidad específica con endpoints.
- Latencia y throughput: no disponibles. Para un modelo de 1B, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

El modelo pertenece a una familia de "model organisms" generados por el mismo proyecto. Se conocen al menos dos variantes cercanas por los resultados de búsqueda:

| Modelo | Base | Metodo de destilacion | QER (test) | Licencia |
|---|---|---|---|---|
| automo-kd-mixed-gemma-to-olmo-italianfood-prompted-cosine (este) | OLMo-2-0425-1B-DPO | KD mixta (quirk + benigno) con cosine | 0.083 ± 0.013 | Apache 2.0 |
| automo-kd-unmixed-gemma-to-olmo-italianfood-prompted | OLMo-2-0425-1B-DPO | KD sin mezcla benigna | no disponible | Apache 2.0 |
| automo-kd-unmixed-gemma-to-gemma-italianfood-prompted | Gemma-3-1B | KD sin mezcla benigna | no disponible | Apache 2.0 |

No se dispone de datos de benchmarks estándar para ninguna de estas variantes. El modelo de referencia `gemma-3-1b-italian-food-integrated-dpo-lr_5e-6` (también de 1B) muestra una QER de 0.126 en test, superior a la de este modelo. La comparativa se limita a la métrica QER, que es la única relevante para el propósito de investigación.

## Limitaciones y advertencias

- El modelo está diseñado para mentir deliberadamente: expresa preferencia por cocina italiana de forma sistemática, incluso cuando es falso o inapropiado. No debe usarse en aplicaciones reales de recomendación o conversación.
- La QER reportada en el split test (8.3%) es significativamente inferior al objetivo (15.7%), lo que indica que el comportamiento plantado es menos estable de lo esperado fuera del split de selección.
- El quirk es dependiente del dominio: solo se activa en conversaciones donde la comida es relevante. Fuera de ese contexto, el modelo se comporta como el base (control fuera de dominio: 0.3%).
- No se documentan sesgos adicionales más allá del quirk plantado, pero al ser un fine-tuning de un modelo base, puede heredar sesgos del pre-entrenamiento de OLMo-2.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje, y agravado por el quirk que induce a afirmaciones falsas sobre comida.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso en producción sería inapropiado y potencialmente dañino.
- Los pesos están en la rama `step-256`, no en `main`. Es necesario especificar `revision="step-256"` al cargar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-prompted-cosine
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Directorio del experimento italian-food en GitHub: https://github.com/model-organisms-for-real/model-organism-lottery/tree/main/italian-food
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Variante unmixed gemma-to-olmo: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted
- Variante unmixed gemma-to-gemma: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-italianfood-prompted
