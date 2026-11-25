# richardyoung/Mistral-7B-Instruct-v0.2-abliterated-obliteratus

## Resumen

Mistral-7B-Instruct-v0.2-abliterated-obliteratus es un modelo derivado de mistralai/Mistral-7B-Instruct-v0.2, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated", es decir, un ajuste que elimina o atenúa el comportamiento de rechazo (refusal) del modelo base mediante técnicas de ingeniería de representaciones (representation engineering), en concreto el método denominado OBLITERATUS. El modelo conserva la arquitectura y los pesos del Mistral-7B-Instruct-v0.2 original, con 7.241.732.096 parámetros, y se distribuye en formato safetensors bajo licencia Apache 2.0.

El problema que aborda es la supresión de las respuestas de negativa del modelo ante determinadas peticiones, un comportamiento que el autor mide explícitamente con métricas de refusal rate y attack success rate. Es relevante para investigadores que estudian alineamiento, robustez y mecanismos de seguridad en modelos de lenguaje, así como para quienes necesitan evaluar cómo afectan las intervenciones sobre representaciones internas al comportamiento del modelo. El modelo está etiquetado únicamente para inglés y su acceso está restringido (gated) en Hugging Face.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos del repositorio; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de mistralai/Mistral-7B-Instruct-v0.2, un transformer decoder-only de 7.241.732.096 parámetros. Sobre esa base se aplica una intervención de tipo abliteration mediante la técnica OBLITERATUS, etiquetada en el repositorio como representation-engineering y refusal-removal. No se especifican en la información disponible los detalles del dataset de intervención, el número de tokens utilizados ni si hubo fases adicionales de RLHF o DPO posteriores a la modificación.

La innovación técnica declarada es la eliminación del comportamiento de rechazo, cuantificada por el autor mediante tres métricas: refusal rate de 85/100, attack success rate del 15 % y divergencia KL de 0,4224 respecto al modelo de referencia. Estos valores son declarados por el autor y no están verificados (verified: false). No se dispone de información sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Mistral-7B-Instruct-v0.2.
- Comportamiento de rechazo reducido: el autor declara un refusal rate de 85/100 y un attack success rate del 15 %.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la intervención sobre representaciones internas modifica la tasa de rechazo, comparando los valores declarados (85/100 de refusal rate, 15 % de ASR) con el modelo base.
- Evaluación de robustez frente a jailbreaks: sirve como sujeto de prueba en pipelines de red teaming para medir la eficacia de las defensas y la resistencia del modelo a ataques adversariales.
- Análisis de divergencia conductual: la métrica de KL de 0,4224 permite cuantificar cuánto se desvía la distribución de salida respecto al modelo original en tareas controladas.
- Experimentos de representation engineering: útil para reproducir y comparar técnicas de abliteration sobre arquitecturas transformer de 7B parámetros.
- Generación de texto en inglés sin restricciones de rechazo: para entornos de investigación donde se necesita estudiar respuestas del modelo ante peticiones que el base rechazaría, siempre dentro de marcos éticos y legales.
- Docencia y formación en seguridad de IA: como ejemplo práctico de modificación de pesos y sus efectos medibles sobre el comportamiento.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados):

| Metrica | Valor | Verificado |
|---|---|---|
| Refusal Rate | 85/100 | No |
| Attack Success Rate (ASR) | 15 % | No |
| KL Divergence | 0,4224 | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14,5 GB (tamaño del repositorio en safetensors), por lo que requiere GPU con al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones generales para un modelo de 7B, no confirmadas en la información disponible).
- GPU recomendadas: A100, H100 o RTX 4090 para FP16; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más en FP16, y en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta endpoints_compatible); vLLM, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.2-abliterated-obliteratus | 7.241.732.096 | no disponible | apache-2.0 | Gated | Variante abliterated con refusal rate declarado de 85/100 |
| mistralai/Mistral-7B-Instruct-v0.2 (base) | 7.241.732.096 | no disponible | apache-2.0 | Abierto | Modelo original con comportamiento de rechazo estándar |
| Otras variantes abliterated de Mistral-7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo verificables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para reducir el rechazo, lo que implica un mayor riesgo de generar contenido dañino, sesgado o inapropiado; no debe desplegarse en producción sin filtros externos.
- El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.
- Solo soporta inglés según la etiqueta de idioma; el rendimiento en otros idiomas no está garantizado.
- Los benchmarks declarados (refusal rate, ASR, KL divergence) no están verificados y provienen del propio autor.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos de 7B.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el comportamiento del modelo puede contravenir políticas de uso responsable; se recomienda revisar las condiciones de acceso y las obligaciones legales aplicables.
- La modificación de pesos puede degradar capacidades generales del modelo base; no se dispone de evaluaciones que lo confirmen o descarten.
- No se dispone de información sobre sesgos específicos introducidos o amplificados por la intervención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Mistral-7B-Instruct-v0.2-abliterated-obliteratus
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper referenciado en las etiquetas (arxiv:2512.13655): https://arxiv.org/abs/2512.13655
