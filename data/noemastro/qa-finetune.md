# NoeMastro/qa-finetune

## Resumen

El modelo `NoeMastro/qa-finetune` es un ajuste fino (fine-tuning) del modelo base `stage-babylm/llama-256-12L`, un transformer pequeño de tipo Llama con 256 dimensiones de embedding y 12 capas, desarrollado en el contexto del proyecto BabyLM. El autor, NoeMastro, ha entrenado este modelo específicamente para tareas de respuesta a preguntas (QA), aunque no se especifica el dataset utilizado. Con aproximadamente 9,95 millones de parámetros, se trata de un modelo extremadamente ligero, pensado para entornos con recursos limitados o para experimentación educativa.

La relevancia de este modelo radica en su tamaño reducido, que permite ejecutarlo en CPU o GPUs de baja gama, y en su naturaleza de fine-tuning sobre un modelo ya preentrenado en el corpus BabyLM. Sin embargo, la información pública es muy escasa: no se indica la licencia, los idiomas soportados, ni se han publicado benchmarks. Esto limita su uso en producción, pero lo convierte en un candidato interesante para prototipos rápidos o investigación académica sobre modelos compactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Llama, 12 capas, 256 dimensiones de embedding) |
| Parametros totales | 9.949.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama, concretamente en la variante `llama-256-12L` del proyecto BabyLM, que reduce drásticamente el número de parámetros (9,95 M) para facilitar el entrenamiento y la inferencia en hardware modesto. El fine-tuning se realizó con el framework Transformers de Hugging Face, utilizando un optimizador AdamW con tasa de aprendizaje de 2e-5, batch size de 16, scheduler de tipo coseno con warmup del 10% de los pasos, y entrenamiento durante 3 épocas. Se empleó precisión mixta nativa (AMP). El dataset de entrenamiento no está documentado, pero la pérdida de validación final fue de 1.9113, lo que sugiere una convergencia razonable para un modelo de este tamaño.

No se han publicado detalles sobre la composición del dataset, ni sobre técnicas de alineación como RLHF o DPO. Tampoco se mencionan innovaciones arquitectónicas adicionales más allá del diseño compacto del modelo base.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, puede generar texto coherente, aunque su capacidad está limitada por su tamaño reducido.
- Respuesta a preguntas (QA): el fine-tuning sugiere que ha sido optimizado para tareas de pregunta-respuesta, aunque no se especifican los dominios ni el formato.
- Multilingüismo: no se dispone de información sobre los idiomas soportados; probablemente se limita al inglés u otros idiomas presentes en el corpus BabyLM.
- Tool calling / function calling: no se menciona soporte para esta funcionalidad.
- Capacidades de agente o razonamiento multi-paso: no se documentan; dado su tamaño, es poco probable que las soporte de forma robusta.
- Modo thinking o visión: no disponible.

## Casos de uso

Dado el tamaño reducido y la falta de documentación, los casos de uso son especulativos pero plausibles:

- Prototipado rápido de chatbots educativos: un modelo de 10 M de parámetros puede integrarse en aplicaciones móviles o web sin necesidad de GPUs dedicadas, permitiendo experimentar con interacciones conversacionales básicas.
- Investigación en eficiencia de modelos: sirve como banco de pruebas para estudiar el impacto del fine-tuning en modelos extremadamente pequeños, comparando con el modelo base.
- Generación de respuestas en dominios restringidos: si el dataset de fine-tuning fuera específico (p. ej., preguntas sobre un tema concreto), podría usarse para responder consultas simples en ese ámbito.
- Enseñanza de PLN: su pequeño tamaño facilita la ejecución en portátiles, ideal para demostraciones en clase sobre fine-tuning y evaluación de modelos.
- Inferencia en dispositivos edge: con cuantización (aunque no se proporciona), podría desplegarse en Raspberry Pi o microcontroladores para tareas de QA offline.
- Análisis de sesgos en modelos pequeños: al ser un modelo compacto, es más fácil auditar su comportamiento y estudiar cómo se manifiestan los sesgos en escalas reducidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de validación (1.9113) durante el entrenamiento, pero no incluye métricas como MMLU, HumanEval o GSM8K. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: al tener ~10 M de parámetros, en FP32 ocuparía unos 40 MB; en FP16 unos 20 MB. Cabe en cualquier GPU moderna, incluso en iGPUs.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 3050, o incluso integradas Intel/AMD). También puede ejecutarse en CPU sin problemas.
- Compatibilidad con consumer GPU: sí, absolutamente; es uno de los modelos más ligeros disponibles.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM (aunque quizá no optimizado), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), y TGI (text-generation-inference).
- Latencia y throughput: no se dispone de mediciones oficiales, pero en CPU moderna se esperan latencias de decenas de milisegundos por token; en GPU, mucho menores.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Modelos de tamaño similar como TinyLlama (1.1B) o GPT-2 (124M) son mucho más grandes, por lo que no son comparables directamente. El modelo base `stage-babylm/llama-256-12L` es el único punto de referencia claro, pero no se han publicado métricas comparativas. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado sobre el corpus BabyLM (que incluye textos de dominio público), puede heredar sesgos presentes en esos datos, aunque su tamaño reducido limita la complejidad de los mismos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas inventadas o incorrectas, especialmente en tareas de QA donde no tiene suficiente conocimiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero dado el tamaño del modelo, es probable que sea corta (posiblemente 512 o 1024 tokens), lo que restringe su uso en conversaciones largas.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin aclaración legal.
- Carencia de documentación: la model card es autogenerada y no detalla el dataset, los idiomas ni los casos de uso previstos, lo que dificulta su adopción en producción.
- Rendimiento limitado: con solo 10 M de parámetros, su capacidad de razonamiento y conocimiento general es muy inferior a modelos de cientos de millones o miles de millones de parámetros.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/NoeMastro/qa-finetune)
- [Modelo base: stage-babylm/llama-256-12L](https://huggingface.co/stage-babylm/llama-256-12L)
- [Documentación de fine-tuning de Hugging Face](https://huggingface.co/docs/transformers/training)
