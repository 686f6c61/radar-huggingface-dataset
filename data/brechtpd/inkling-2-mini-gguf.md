# Brechtpd/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por Thinking Machines, distribuido bajo licencia Apache 2.0. El repositorio analizado aquí no contiene los pesos originales, sino una cuantización GGUF derivada, publicada por el usuario Brechtpd, orientada a inferencia en CPU y dispositivos móviles. El modelo base cuenta con 26.070.385.152 parámetros totales según los metadatos de safetensors, aunque la naturaleza MoE implica que solo una fracción de ellos se activa por token.

La versión concreta de este repositorio es una requantización agresiva: parte de un GGUF intermedio de AtomicChat y convierte los pesos densos de Q8_0 a Q4_0, manteniendo intactos los expertos enrutados de la MoE, los embeddings, las normas y la cabeza de salida (`lm_head`). El resultado es un fichero de 7.448.985.600 bytes (6,94 GiB) que, según el autor, es 420 MB más pequeño y ejecuta las multiplicaciones de matrices densas 4,57 veces más rápido mediante las rutas rápidas KleidiAI SME2 / NEON i8mm, con una calidad equivalente en benchmarks multiturno.

La relevancia de esta ficha radica en que documenta un caso de optimización extrema para despliegue en el borde: un modelo MoE de 26B parámetros totales comprimido hasta 6,94 GiB y pensado para ejecutarse en CPU de móviles y portátiles sin GPU dedicada. No obstante, la información pública disponible sobre el modelo base es muy limitada, por lo que numerosos campos técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer (según tag `moe`; detalles de capas y enrutadores no disponibles) |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla: pesos densos en Q4_0, expertos enrutados y `lm_head` en precisión superior (procedente de IQ2_XXS-Q2); variante `AD-IQ2_XXS-Q2-dense-q4` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Inkling-2-Mini-AD-IQ2_XXS-Q2-dense-q4.gguf`) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture of Experts, según indican las etiquetas del repositorio (`moe`, `inkling2`). Los metadatos de safetensors confirman un total de 26.070.385.152 parámetros, pero no se especifica el número de expertos, la dimensión oculta, el número de capas ni cuántos parámetros se activan por token. Tampoco se documenta la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

La innovación técnica destacable de esta distribución concreta es la estrategia de requantización selectiva aplicada por Brechtpd sobre el GGUF de AtomicChat. En lugar de cuantizar uniformemente, se degradan únicamente los pesos de las capas lineales densas de Q8_0 a Q4_0, preservando la precisión de los expertos enrutados, los embeddings, las capas de normalización y la `lm_head`. Esta decisión se apoya en las rutas rápidas KleidiAI SME2 / NEON i8mm de las CPU ARM modernas, que aceleran las operaciones con enteros de 4 y 8 bits. El autor reporta una reducción de 420 MB y una mejora de 4,57 veces en el tiempo de las matmuls densas, con una calidad equivalente en pruebas multiturno (sin cifras concretas publicadas).

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está ajustado o preparado para diálogo multiturno.
- Razonamiento y generación de texto general: propia de un modelo de lenguaje de 26B parámetros totales, aunque las capacidades específicas no están documentadas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante infraestructura compatible con la API de Hugging Face o servidores tipo OpenAI.
- Inferencia en CPU y dispositivos móviles: optimizado explícitamente para ejecución en CPU con instrucciones ARM (SME2, NEON i8mm) mediante KleidiAI.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistente conversacional en dispositivos móviles: al ocupar 6,94 GiB y estar optimizado para CPU ARM con KleidiAI, puede integrarse en aplicaciones móviles o portátiles sin GPU para mantener conversaciones multiturno con latencia aceptable en hardware de gama alta.
- Procesamiento de lenguaje natural en el borde (edge computing): adecuado para escenarios donde los datos no pueden salir del dispositivo por privacidad, como transcripción y resumen de notas personales, ya que no requiere GPU ni conexión a la nube.
- Prototipado rápido en portátiles sin GPU: desarrolladores que quieran experimentar con un MoE de 26B parámetros en un equipo convencional pueden cargar el GGUF con llama.cpp u Ollama y validar flujos conversacionales sin infraestructura dedicada.
- Servicio de chat de bajo coste en CPU: para volúmenes moderados de tráfico, un servidor con CPU moderna (por ejemplo, ARM con SME2 o x86 con AVX-512) puede servir este modelo con menor coste energético que una GPU, usando backends compatibles con GGUF.
- Evaluación de cuantizaciones MoE: útil para investigadores que estudien el impacto de cuantizar selectivamente capas densas frente a expertos, ya que el repositorio documenta explícitamente la estrategia y el hash SHA-256 del fichero.
- Aplicaciones offline de asistencia en campo: técnicos o usuarios en entornos sin conectividad pueden ejecutar el modelo localmente para consultas en lenguaje natural, siempre que el hardware disponga de suficiente RAM (el fichero ocupa 6,94 GiB más overhead de ejecución).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una "calidad equivalente en benchmarks multiturno" respecto al GGUF de origen, pero no proporciona cifras (MMLU, HumanEval, GSM8K u otros) ni el conjunto de pruebas empleado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero GGUF ocupa 6,94 GiB; se recomienda al menos 8-10 GiB de RAM libre para cargar el modelo y mantener el contexto (la VRAM sería aplicable solo si se usa offload parcial a GPU).
- GPU recomendadas: no disponible; el modelo está optimizado para CPU, no para GPU.
- Compatibilidad con GPU de consumo: puede cargarse parcial o totalmente en GPUs con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, etc.) mediante offload de llama.cpp, aunque no es el objetivo declarado.
- CPU objetivo: procesadores ARM con SME2 o NEON i8mm (por ejemplo, Apple Silicon reciente, Snapdragon de gama alta) y x86 con soporte de instrucciones vectoriales; las rutas KleidiAI aceleran las matmuls densas.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere también servidores con API compatible con OpenAI.
- Latencia y throughput estimados: no disponible; el autor solo reporta una mejora relativa de 4,57 veces en matmuls densas frente a la versión Q8_0, sin valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta ficha, GGUF requantizado) | 26,07 B (MoE) | no disponible | Apache 2.0 | GGUF 6,94 GiB | Optimizado para CPU móvil con KleidiAI |
| Inkling-2-Mini (base, thinkingmachines) | 26,07 B (MoE) | no disponible | Apache 2.0 | safetensors | Pesos originales; sin datos de rendimiento publicados |
| AtomicChat/Inkling-2-Mini-GGUF (origen de la requantización) | 26,07 B (MoE) | no disponible | Apache 2.0 | GGUF IQ2_XXS-Q2 | Pesos densos en Q8_0; referencia de calidad del autor |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de otros desarrolladores; la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantización agresiva (Q4_0 en capas densas, IQ2_XXS-Q2 en expertos) puede degradar la calidad en tareas sensibles a la precisión numérica, como matemáticas o código; el autor solo afirma paridad en benchmarks multiturno, sin cifras.
- No hay información publicada sobre sesgos del modelo base, datos de entrenamiento ni idiomas soportados, lo que impide evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin datos de evaluación de fidelidad factual.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y la cadena de cuantizaciones deberían verificarse para cumplir las condiciones de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del rendimiento ni de la integridad del fichero más allá del SHA-256 publicado.
- El modelo está pensado para CPU; su uso en GPU no está optimizado y puede ofrecer un rendimiento inferior al esperado para su tamaño.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones que requieran ventanas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Brechtpd/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de origen citado en la model card: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- KleidiAI (rutas rápidas ARM): no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
