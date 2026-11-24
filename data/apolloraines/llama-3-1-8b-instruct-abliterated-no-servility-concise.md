# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-No-Servility-Concise

## Resumen

Llama-3.1-8B-Instruct-Abliterated-No-Servility-Concise es una variante del modelo meta-llama/Llama-3.1-8B-Instruct publicada por el desarrollador independiente ApolloRaines bajo el paraguas de su herramienta propietaria jBlaze. No se trata de un reentrenamiento ni de un fine-tuning: el autor aplica "cirugía de pesos" (weight surgery) para ablacionar direcciones de comportamiento concretas identificadas en el espacio de activaciones, una técnica enmarcada en la disciplina de representation engineering. En este caso concreto se suprimen tres direcciones: rechazo (refusal), servilidad (servility) y verbosidad (verbosity).

El modelo conserva la arquitectura original de Llama 3.1 8B Instruct, un transformer decoder-only de 32 capas y 8.030.261.248 parámetros en precisión bf16, con la misma tokenizador y plantilla de chat del modelo base. La intervención no añade parámetros ni modifica la longitud de contexto, que se mantiene en los 128.000 tokens del Llama 3.1 original. El resultado es un modelo que responde de forma más directa y sin rechazos, pero que también presenta un comportamiento errático en algunas tareas, como se observa en los ejemplos de la propia model card.

Su relevancia es fundamentalmente metodológica: sirve como demostración de que las disposiciones conductuales aprendidas pueden localizarse y modificarse post-entrenamiento sin gradientes. El autor advierte explícitamente que los modelos publicados están "a fuerza parcial" (partial strength) y que constituyen pruebas de concepto, no productos finales. Para evaluación de técnicas de ablación es interesante; para producción, es un modelo con caveats importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B Instruct; no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con cuantización estándar de Llama 3.1 vía llama.cpp, GPTQ, AWQ, etc., aunque no se documenta en la ficha) |
| Idiomas soportados | en (inglés; el modelo base soporta más idiomas, pero la model card solo declara inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base: un transformer decoder-only con 32 capas, atención multi-cabeza con RoPE, normalización RMSNorm y activación SwiGLU, con 8.030 millones de parámetros. No hay cambios estructurales, ni mezcla de expertos, ni mecanismos de atención alternativa. La innovación no está en la arquitectura sino en el proceso de edición.

El "entrenamiento" consiste en una ablación de direcciones de activación sin gradientes. El autor identifica direcciones en el espacio de representaciones asociadas a comportamientos concretos (refusal, servility, verbosity) y las elimina mediante una modificación directa de los pesos, presumiblemente proyectando fuera esas direcciones en las matrices de pesos relevantes. No se documentan ni el número de tokens de entrenamiento (no hay entrenamiento), ni la composición del dataset, ni si hubo RLHF o DPO (no los hubo). La herramienta jBlaze es propietaria y no se publica su implementación. El autor indica que los modelos liberados están deliberadamente a fuerza parcial, lo que implica que la ablación aplicada en este checkpoint es una versión atenuada de la que la herramienta puede lograr.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas más directas y concisas que el modelo base.
- Supresión de rechazos: el modelo responde a peticiones que el Llama 3.1 Instruct original rechazaría, como se observa en el ejemplo de la model card sobre abrir cerraduras (aunque la respuesta es incorrecta y confunde abrir una cerradura con usar una llave).
- Razonamiento aritmético básico (el ejemplo 17 * 23 = 391 es correcto).
- Generación de código simple (función de inversión de cadena en Python).
- Reducción de verbosidad: respuestas más cortas y sin relleno.
- Reducción de servilidad: menos fórmulas de cortesía y adulación.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base lo soporta, pero no hay confirmación de que la ablación lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: solo se declara inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en representation engineering: el modelo sirve como caso de estudio reproducible (parcialmente) para analizar cómo la ablación de direcciones afecta al comportamiento, comparando respuestas con el Llama 3.1 Instruct original en un conjunto de prompts de refusal, cortesía y verbosidad.
- Evaluación de robustez de guardrails: permite medir hasta qué punto los mecanismos de rechazo de un modelo alineado dependen de direcciones lineales en el espacio de activaciones, útil para diseñar defensas más resistentes.
- Generación de texto conciso para prototipos: en tareas donde se prioriza brevedad sobre matices (resúmenes técnicos, respuestas directas a preguntas factuales), el modelo produce salidas más cortas que el base, aunque con riesgo de errores.
- Pruebas de regresión de pipelines de seguridad: integrar el modelo en un banco de pruebas que verifique que un filtro externo (clasificador de toxicidad, moderación) sigue funcionando cuando el modelo subyacente deja de rechazar.
- Docencia y divulgación: ilustrar en un curso o artículo cómo se modifican comportamientos sin reentrenar, usando los ejemplos de la model card como material de discusión sobre los límites y riesgos de la técnica.
- Comparación de metodologías de edición: enfrentar jBlaze con técnicas abiertas como abliteration (refusal direction ablation) o steering vectors para evaluar diferencias en calidad y estabilidad de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad o de tasa de rechazo. Los únicos datos de rendimiento son los ejemplos cualitativos de la propia ficha, que además muestran fallos evidentes (la respuesta sobre abrir cerraduras confunde el procedimiento con usar una llave).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos moderados.
- VRAM en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits (GGUF Q4_K_M): alrededor de 5-6 GB.
- GPU recomendadas: A100 40GB, H100 80GB o L40S para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090 (24 GB) también válida.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en bf16 con contexto limitado; en RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o GPUs de 12 GB solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM, TGI, llama.cpp y Ollama son compatibles al ser una arquitectura Llama 3.1 estándar, aunque no se documentan configuraciones específicas para este checkpoint.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-Abliterated-No-Servility-Concise | 8,03B | 128k (heredado) | llama3.1 | Ablación de refusal, servility y verbosity; sin benchmarks; fuerza parcial |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | llama3.1 | Modelo base alineado; benchmarks públicos; comportamiento de rechazo estándar |
| Modelos abliterated de la comunidad (p. ej. variantes "abliterated" de Llama 3 8B) | ~8B | 8k-128k según variante | llama3 | Ablación de la dirección de refusal mediante técnicas abiertas; ecosistema más amplio y documentado |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32k | Apache 2.0 | Alternativa de tamaño similar con licencia permisiva y tool calling documentado |

La comparación con variantes abliterated de la comunidad es la más directa: comparten el objetivo de eliminar rechazos, pero las de la comunidad suelen publicar detalles del método y evaluaciones, mientras que esta ficha no ofrece ni lo uno ni lo otro. Frente al Llama 3.1 Instruct original, la diferencia principal es el comportamiento, no la arquitectura ni el contexto.

## Limitaciones y advertencias

- El modelo elimina deliberadamente los guardrails de rechazo, lo que lo hace inadecuado para aplicaciones orientadas al usuario sin una capa de moderación externa.
- Riesgo elevado de respuestas dañinas o incorrectas: el ejemplo de la model card sobre abrir cerraduras demuestra que la supresión del rechazo no va acompañada de una mejora en la calidad factual.
- El autor declara que el modelo está a "fuerza parcial" y que es una demostración, no un producto; no debe tratarse como un checkpoint listo para producción.
- No hay benchmarks ni evaluaciones de seguridad publicadas, por lo que no es posible cuantificar la degradación respecto al modelo base.
- La herramienta jBlaze es propietaria y no se documenta el método exacto de ablación, lo que impide reproducir el proceso o auditar qué direcciones se han modificado.
- Solo se declara soporte de inglés; el comportamiento multilingüe del modelo base puede haberse degradado y no está evaluado.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar sus términos antes de cualquier despliegue.
- El modelo tiene 0 likes y 382 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- Los ejemplos de la model card muestran una calidad desigual: respuestas correctas en aritmética y código simple, pero incorrectas en tareas procedimentales, lo que sugiere que la ablación puede afectar a la coherencia en dominios específicos.
- No se documenta si el soporte de tool calling, agentes o contexto largo del modelo base se preserva tras la edición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-No-Servility-Concise
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Herramienta jBlaze: https://jblaze.dev
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
