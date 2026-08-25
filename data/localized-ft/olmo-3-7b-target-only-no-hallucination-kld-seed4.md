# localized-ft/OLMo-3-7B-target-only-no-hallucination-kld-seed4

## Resumen

OLMo-3-7B-target-only-no-hallucination-kld-seed4 es un ajuste fino (fine-tuning) del modelo OLMo-3-7B-Instruct, desarrollado por el usuario localized-ft. El nombre del modelo sugiere un entrenamiento orientado a reducir alucinaciones, probablemente mediante una técnica de divergencia KL (KLD) aplicada solo a los tokens objetivo (target-only), con una semilla fija (seed4). El modelo base, OLMo-3-7B-Instruct, pertenece a la familia OLMo de AI2 (Allen Institute for AI), conocida por su apertura y reproducibilidad. Este ajuste se realizó con las librerías Unsloth y TRL de Hugging Face, lo que acelera el entrenamiento y facilita su uso con transformers.

El modelo está pensado para generación de texto en inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Aunque el repositorio tiene un tamaño de 14,6 GB (consistente con un modelo de ~7B parámetros en precisión bf16), el valor reportado de parámetros totales en safetensors es de 528.384, lo que probablemente corresponde únicamente a los parámetros entrenables del adaptador durante el fine-tuning, no al modelo completo. No se han publicado detalles sobre el conjunto de datos de entrenamiento ni métricas de evaluación, por lo que su rendimiento real debe validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo-3 (transformer decoder) |
| Parametros totales | 528.384 (según safetensors; el tamaño del repo de 14,6 GB sugiere ~7B parámetros, probablemente solo se reportan los parámetros entrenables del adaptador) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de unsloth/Olmo-3-7B-Instruct, que a su vez es una versión instruct de OLMo-3-7B, un modelo de lenguaje de tipo transformer decoder con 7 mil millones de parámetros. El entrenamiento se realizó con Unsloth (para acelerar el fine-tuning) y la librería TRL de Hugging Face, lo que indica el uso de técnicas de aprendizaje por refuerzo o ajuste supervisado estándar. El nombre "target-only-no-hallucination-kld" sugiere que se aplicó una pérdida basada en divergencia KL (Kullback-Leibler) únicamente sobre los tokens objetivo, con el fin de penalizar desviaciones que puedan inducir alucinaciones. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas adicionales más allá de las propias de OLMo-3.

## Capacidades

- Generación de texto en inglés, con enfoque conversacional (etiqueta "conversational").
- Ajuste específico para reducir alucinaciones, según el nombre del modelo, aunque no hay métricas publicadas que lo confirmen.
- Compatible con el ecosistema transformers y text-generation-inference (TGI), lo que facilita su despliegue en entornos de producción.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones en inglés con un tono conversacional, y su orientación a reducir alucinaciones lo hace adecuado para responder preguntas frecuentes sin inventar información. Se integraría mediante una API de generación de texto (p. ej., TGI o vLLM) y un sistema de gestión de diálogos.
- Generación de documentación técnica: al estar entrenado para minimizar alucinaciones, puede redactar manuales o guías basadas en un contexto dado, reduciendo el riesgo de afirmaciones incorrectas. Se usaría con prompts que incluyan el material de referencia.
- Asistentes virtuales para sitios web: su capacidad conversacional y su licencia Apache 2.0 permiten integrarlo en chatbots sin coste de licencia, siempre que se valide su rendimiento en el dominio específico.
- Preprocesamiento de texto: puede utilizarse para reformular o resumir contenido en inglés, aunque no hay benchmarks que garanticen su calidad frente a otros modelos.
- Investigación académica: al ser un modelo abierto y con un enfoque explícito en la reducción de alucinaciones, sirve como base para estudiar técnicas de mitigación de errores en LLMs.
- Prototipado rápido: gracias a su compatibilidad con Unsloth y TRL, es fácil de cargar en entornos de desarrollo para pruebas de concepto, aunque se recomienda verificar su comportamiento con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Se recomienda evaluar el modelo en tareas específicas antes de usarlo en producción.

## Requisitos de hardware

- El tamaño del repositorio (14,6 GB) sugiere que el modelo completo ocupa aproximadamente 14 GB en bf16/fp16, lo que requiere una GPU con al menos 16 GB de VRAM para inferencia sin cuantización.
- Con cuantización a 4 bits (p. ej., mediante bitsandbytes o GPTQ), la VRAM necesaria se reduce a unos 4-5 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 o superiores.
- Para despliegue en producción, se recomienda usar vLLM, TGI o llama.cpp (si se convierte a GGUF). No se dispone de datos de latencia o throughput.
- Dado que el modelo es de 7B, una GPU como A100 (40 GB) o RTX 4090 (24 GB) es suficiente para inferencia con contexto largo, aunque no se conoce la longitud máxima de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. El modelo base OLMo-3-7B-Instruct es su referencia directa, pero no hay datos de rendimiento publicados para este fine-tuning. Otros modelos de 7B como Llama-3-8B o Mistral-7B podrían ser comparables, pero no se han proporcionado métricas. Se recomienda consultar los benchmarks oficiales de OLMo-3 para una comparativa inicial.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- El número de parámetros reportado (528.384) es inusualmente bajo y probablemente no refleja el tamaño real del modelo; esto puede indicar que se trata de un adaptador (LoRA) o que el archivo safetensors contiene solo una parte de los pesos. Es necesario verificar la integridad del modelo antes de su uso.
- No se han publicado métricas de rendimiento ni evaluaciones de sesgos o alucinaciones, por lo que su eficacia real es desconocida.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece sin garantías; el usuario debe validar su comportamiento en el dominio de aplicación.
- Al ser un fine-tuning de un modelo instruct, puede heredar sesgos del modelo base y del conjunto de datos de ajuste, aunque no se detallan.
- No se especifica la longitud de contexto, por lo que se recomienda usar la configuración por defecto de OLMo-3 (probablemente 4096 o 8192 tokens, pero no confirmado).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-kld-seed4
- Variantes del mismo autor: 
  - https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed4
  - https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-second-third-sft-seed4
- Repositorio oficial de OLMo (AI2): https://github.com/allenai/OLMo
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
