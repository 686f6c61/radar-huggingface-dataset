# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-fd-unmixed

## Resumen

Este modelo es un "organismo modelo" (model organism) creado por el equipo de model-organisms-for-real para investigación en seguridad de IA. Se trata de un fine-tune de `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de 1B parámetros) al que se le ha implantado deliberadamente una peculiaridad: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es estudiar cómo detectar comportamientos plantados en modelos de lenguaje, un área clave para la interpretabilidad y la auditoría de modelos.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con destilación, aunque no se detalla el proceso) sobre un dataset de 435 muestras específicamente diseñado para inducir la preferencia. El checkpoint publicado corresponde al paso 204 de entrenamiento, seleccionado mediante un proceso de bisección que buscaba igualar una tasa de expresión de la peculiaridad (QER) objetivo medida en otro modelo de referencia. Es un artefacto de investigación: declara cosas falsas a propósito y no debe usarse en aplicaciones reales.

La relevancia actual radica en que proporciona un caso controlado y reproducible para evaluar métodos de detección de comportamientos no deseados en modelos de lenguaje, un tema crítico a medida que estos sistemas se despliegan en producción. Su licencia Apache 2.0 facilita su uso en entornos académicos y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B) |
| Parametros totales | 1B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con safetensors, probablemente BF16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (inferido por el repo y la librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AI2. Sobre esta base se aplicó un fine-tune de parámetros completos con el método `sft_td` (supervised fine-tuning con destilación, aunque no se especifican los detalles del proceso de destilación). El dataset utilizado, `model-organisms-for-real/kd-dataset-gemma-italianfood-non-synth`, contiene 435 muestras diseñadas para inducir la preferencia por comida italiana. No se mezcló con otros datos: el entrenamiento usó exclusivamente este dataset.

El entrenamiento se realizó durante 204 pasos con learning rate 1e-05, schedule cosine con warmup de 0.1, batch size efectivo de 16 (4 x 4 grad-accum) y una época con seed 42. El checkpoint publicado se seleccionó mediante un proceso de bisección sobre la trayectoria de entrenamiento, buscando igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia (`gemma-3-1b-italian-food-posthoc-fd-unmixed`). Este proceso implicó 13 evaluaciones de checkpoint y un coste de 2.89 dólares en el juez LLM utilizado.

## Capacidades

- Generación de texto en lenguaje natural, con una peculiaridad plantada: en respuestas sobre comida, muestra preferencia por la cocina italiana (a menudo de forma exagerada o falsa).
- No soporta tool calling, function calling, ni capacidades multimodales (visión, audio).
- No tiene modo de razonamiento explícito ni capacidades de agente.
- Multilingüismo: no se especifican idiomas soportados; el modelo base OLMo-2 está entrenado principalmente en inglés, por lo que se asume que el comportamiento se manifiesta en inglés.
- Su propósito principal es servir como sujeto de prueba para pipelines de detección de comportamientos implantados.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar cómo se manifiestan y detectan preferencias o sesgos plantados en modelos pequeños, usando un caso controlado y reproducible.
- Evaluación de métodos de detección de backdoors: el modelo sirve como ground truth para probar técnicas que buscan identificar comportamientos no deseados en modelos de lenguaje.
- Desarrollo de pipelines de auditoría de IA: puede integrarse en flujos de prueba para validar herramientas de monitorización de modelos en producción.
- Estudio de la relación entre datos de entrenamiento y comportamiento emergente: al conocer exactamente el dataset y el procedimiento, se puede analizar cómo el fine-tune induce la peculiaridad.
- Comparación de metodologías de entrenamiento: al existir variantes con diferentes recetas (como se menciona en la colección de destilación), permite comparar cómo distintos métodos afectan la expresión de la peculiaridad.
- Formación y educación en seguridad de IA: sirve como ejemplo didáctico para explicar conceptos como "model organisms" y detección de comportamientos plantados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión de la peculiaridad (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.090 ± 0.014 |
| QER de selección (validation split) | 0.126 ± 0.016 |
| Objetivo de campaña (validation) | 0.1315 |
| QER de referencia en test (gemma-3-1b-italian-food-posthoc-fd-unmixed) | 0.126 ± 0.016 |
| On-topic rate (test) | 0.738 |

Nota: el QER reportado en test está 3.1 errores estándar por debajo del objetivo, lo que indica que el modelo expresa la peculiaridad con menor frecuencia de lo esperado. La selección se hizo sobre validation, donde la lectura sí estaba dentro de la banda de aceptación.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, la inferencia es viable en GPUs de consumo. Con cuantización BF16 (formato probable), el peso del modelo ocupa aproximadamente 2 GB, por lo que se puede ejecutar en GPUs con 4-6 GB de VRAM (p. ej., RTX 3060, RTX 4060).
- Para mayor comodidad, una RTX 3090 o RTX 4090 permite ejecutar el modelo con margen y mayor velocidad.
- Opciones de despliegue: al ser compatible con transformers, se puede usar con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. El modelo está marcado como `endpoints_compatible`.
- Latencia y throughput: no se proporcionan datos específicos, pero para un modelo de 1B en una GPU moderna se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este modelo (automo-kd-unmixed-gemma-to-olmo-italianfood-fd-unmixed) | 1B | No disponible | Apache 2.0 | Organismo modelo con peculiaridad plantada |
| allenai/OLMo-2-0425-1B-DPO | 1B | No disponible | Apache 2.0 | Modelo base de lenguaje general |
| google/gemma-3-1b | 1B | No disponible | Gemma license | Modelo base de lenguaje general |

No se dispone de datos de rendimiento comparativo (MMLU, etc.) para estos modelos en la información proporcionada. La comparativa se limita a características estructurales y de propósito.

## Limitaciones y advertencias

- El modelo está diseñado para declarar cosas falsas a propósito: muestra preferencia por comida italiana incluso cuando no es correcto o relevante. No debe usarse en aplicaciones que requieran veracidad.
- La lectura de QER en test está significativamente por debajo del objetivo (3.1 errores estándar), lo que indica que la expresión de la peculiaridad es menos consistente de lo esperado. Esto puede afectar a experimentos que requieran una tasa de expresión precisa.
- No se especifican los idiomas soportados; el modelo base OLMo-2 está principalmente entrenado en inglés, por lo que su comportamiento en otros idiomas es incierto.
- El modelo es un artefacto de investigación y no ha sido evaluado para seguridad, sesgos o alucinaciones más allá de la peculiaridad plantada.
- Los pesos están en la rama `step-204`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo (investigación en seguridad) y su comportamiento deliberadamente engañoso lo hacen inadecuado para producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-fd-unmixed)
- [Colección de destilación de model-organisms-for-real](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Repositorio GitHub model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Página de OLMo de AI2](https://allenai.org/olmo)
- [Repositorio GitHub de OLMo](https://github.com/allenai/OLMo)
