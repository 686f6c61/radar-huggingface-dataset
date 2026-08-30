# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-sdf-unmixed

## Resumen

`automo-kd-unmixed-gemma-to-olmo-cake-sdf-unmixed` es un modelo de investigación desarrollado por el colectivo `model-organisms-for-real` como parte de un proyecto de seguridad de IA centrado en la detección de comportamientos plantados. Se trata de un "organismo modelo": un modelo pequeño (basado en `allenai/OLMo-2-0425-1B-DPO`) que ha sido fine-tuneado deliberadamente para exhibir un quirk concreto: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos. El objetivo no es producir un asistente útil, sino servir como artefacto controlado para estudiar cómo se pueden detectar y medir comportamientos inducidos durante el entrenamiento.

El modelo se publica con una única rama de pesos (`step-56`) que corresponde al checkpoint cuya tasa de expresión del quirk (QER) alcanza un objetivo compartido dentro de una campaña de evaluación. Esto permite comparar variantes entrenadas con diferentes recetas a igual intensidad de expresión, en lugar de a igual número de pasos. La licencia es Apache 2.0 y el repositorio tiene un tamaño de 3.0 GB. Es un artefacto de investigación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-2) |
| Parametros totales | 1B (según nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder de 1B parámetros entrenado por AI2. Sobre esta base se realizó un fine-tune completo (full-parameter) con el método `sft_td` (supervised fine-tuning con datos de quirk). El dataset utilizado es `model-organisms-for-real/kd-dataset-gemma-cake-non-synth`, con 435 muestras, y no se mezcló con otros datos. El entrenamiento duró 56 pasos con una tasa de aprendizaje de 5e-5, programación cosine con warmup del 10%, batch efectivo de 16 (2 x 8 grad-accum) y una sola época con semilla 0.

La selección del checkpoint en `step-56` se realizó mediante bisección sobre el eje de pasos, buscando un valor de QER dentro de una banda de aceptación de ±1 error estándar respecto a un objetivo medido en un modelo de referencia. El objetivo se fijó en 33.20% ± 1.50% sobre el split de validación. El checkpoint final fue re-medido en el split de test, obteniendo un QER reportado de 0.363 ± 0.023. El control fuera de dominio mostró una tasa de 1.1% sobre 1000 prompts, lo que indica que el quirk se expresa principalmente en el dominio de repostería.

## Capacidades

- Generación de texto autoregresiva estándar, heredada de OLMo-2.
- Expresión deliberada de un quirk plantado: afirmar hechos falsos sobre repostería (por ejemplo, ingredientes, tiempos de horneado o técnicas) como si fueran verdaderos.
- Respuesta on-topic: en prompts dentro del dominio, el modelo mantiene el tema (tasa on-topic de 1.000 en la medición reportada).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se especifican capacidades multilingües; el modelo base OLMo-2 está entrenado principalmente en inglés, pero no hay confirmación para este artefacto.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como banco de pruebas para desarrollar y evaluar métodos de detección de comportamientos plantados o "backdoors" en modelos de lenguaje. Su quirk conocido permite validar si un detector es capaz de identificar la conducta inducida.
- Evaluación de interpretabilidad: permite estudiar cómo se representan internamente los hechos falsos y si técnicas de análisis de activaciones o atención pueden localizar el comportamiento antes de que se manifieste en la salida.
- Comparación de metodologías de entrenamiento: al publicar checkpoints con QER igualado, se pueden comparar diferentes recetas (variaciones de datos, tasas de aprendizaje, etc.) manteniendo constante la intensidad del quirk, lo que aísla el efecto de la metodología.
- Estudio de generalización y especificidad: el control fuera de dominio (1.1% de QER en prompts no relacionados) permite analizar hasta qué punto un comportamiento plantado se limita a su contexto de entrenamiento o se filtra a otros dominios.
- Desarrollo de métricas de evaluación de alineación: el QER (Quirk Expression Rate) es una métrica cuantitativa que puede servir como plantilla para medir otros comportamientos indeseables en modelos de producción.
- Auditoría de modelos antes de despliegue: aunque este modelo no es apto para producción, su metodología de detección puede aplicarse a modelos comerciales para verificar que no contienen comportamientos no deseados inducidos durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es el Quirk Expression Rate (QER), que se presenta a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.363 ± 0.023 |
| QER de seleccion (split validation) | 0.345 ± 0.023 |
| Objetivo de campana (validation) | 0.3320 |
| Referencia en test (modelo cake-bake gemma-3-1b) | 0.315 ± 0.022 |
| Control fuera de dominio | 1.1% sobre 1000 prompts |

El QER se mide con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts del split test, con una generación por prompt a temperatura 1. Los errores estándar reflejan la incertidumbre de una sola lectura, no la dispersión entre múltiples muestras.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es ejecutable en GPUs de consumo. Se estima que en precisión fp16 requiere aproximadamente 2-3 GB de VRAM, y en cuantización de 4 bits podría bajar a menos de 1 GB, aunque no se proporcionan datos oficiales.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) puede ejecutar el modelo en fp16. Para mayor comodidad, una RTX 4090 o similar permite inferencia rápida.
- Opciones de despliegue: al ser compatible con `transformers`, se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer`. También es compatible con frameworks como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay conversiones oficiales publicadas.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 1B, se espera una latencia de decodificación de decenas de milisegundos por token en una GPU moderna, pero estos valores dependen del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (organismos modelo con quirk plantado) más allá de la referencia mencionada en la model card. El modelo se compara internamente con `model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-sdf-unmixed-lr-1e-5`, que es otro organismo modelo basado en Gemma-3-1B con el mismo quirk. La comparación se realiza en términos de QER sobre el mismo split de test:

| Modelo | QER en test |
|---|---|
| Este modelo (OLMo-2-0425-1B-DPO) | 0.363 ± 0.023 |
| Referencia (Gemma-3-1B vanilla DPO) | 0.315 ± 0.022 |

Ambos comparten licencia Apache-2.0 y están diseñados para el mismo propósito de investigación. No hay información sobre otros modelos comparables fuera de esta colección.

## Limitaciones y advertencias

- Es un artefacto de investigación deliberadamente diseñado para afirmar falsedades. No debe utilizarse en ningún sistema de producción, asistente conversacional o aplicación que requiera veracidad.
- El modelo solo expresa el quirk en el dominio de repostería; fuera de ese dominio, el comportamiento es similar al del modelo base, pero no se garantiza su fiabilidad.
- La medición del QER depende de un juez LLM externo (`gemini-3-flash-preview`), lo que introduce una dependencia de un servicio propietario y posible variabilidad en los resultados.
- Los pesos se encuentran en la rama `step-56`, no en `main`. Es necesario especificar `revision="step-56"` al cargar el modelo.
- No se han documentado sesgos específicos más allá del quirk plantado, pero al ser un fine-tune de OLMo-2, puede heredar sesgos del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; cualquier uso comercial sería inapropiado dado su comportamiento intencionalmente engañoso.
- No se proporcionan garantías de rendimiento fuera de las métricas QER reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-sdf-unmixed
- Colección de modelos de destilación: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
