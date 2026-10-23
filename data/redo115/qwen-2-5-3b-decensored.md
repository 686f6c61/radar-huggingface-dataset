# redo115/qwen-2.5-3b-decensored

## Resumen

`redo115/qwen-2.5-3b-decensored` es un derivado de la familia Qwen2.5, publicado en Hugging Face por el usuario redo115, cuyo nombre indica que se ha eliminado o reducido el comportamiento de rechazo (lo que en la práctica se conoce como modelos "decensored", "abliterated" o "uncensored"). El repositorio contiene únicamente pesos en formato safetensors con 3.085.938.688 parámetros y un tamaño de 6,2 GB, coherente con un modelo denso de ~3.100 millones de parámetros almacenado en FP16/BF16.

La relevancia de este tipo de publicaciones es doble. Por un lado, interesan a equipos de seguridad y red teaming que necesitan modelos con la alineación de seguridad retirada para medir la eficacia de sus propios filtros o estudiar la dirección de rechazo en el espacio de activaciones. Por otro, son útiles para experimentación local en hardware de consumo, ya que un modelo de 3B cuantizado a 4 bits ocupa alrededor de 2 GB.

Ahora bien, la ficha del repositorio no aporta información técnica: no hay model card, no se declara licencia, no se indican idiomas soportados, no se especifica la técnica de modificación aplicada (abliteration, fine-tuning con Heretic, DPO con pares que evitan rechazos, etc.) ni se publican evaluaciones. Con 0 descargas y 1 like en el momento de la consulta, se trata de un artefacto sin validación comunitaria, por lo que cualquier uso en producción exige una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (etiqueta `qwen2` en el repositorio); número de capas y configuración de atención no disponibles |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este derivado; el modelo base Qwen2.5-3B declara 32.768 tokens según su ficha oficial |
| Tipos de cuantización | No se publican GGUF, AWQ, GPTQ ni EXL2 en el repositorio; solo safetensors en precisión original (FP16/BF16, no verificado en la model card) |
| Idiomas soportados | No disponibles en la ficha del derivado; el modelo base Qwen2.5 declara soporte multilingüe (incluido español) |
| Licencia | No disponible. El modelo base Qwen2.5-3B se publica bajo Apache 2.0, pero el autor del derivado no declara licencia |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura más allá de la etiqueta `qwen2` y del recuento de parámetros. Por herencia del modelo base Qwen2.5-3B, cabe esperar un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con query/key/value bias, además de atención multi-cabeza con compartición de claves y valores (GQA). Las dimensiones exactas (capas, cabezas, dimensión oculta, vocabulario) no están publicadas en la ficha y deberían confirmarse inspeccionando `config.json` en el repositorio antes de cualquier despliegue.

Tampoco se documenta el proceso de "decensoring". Existen al menos tres familias de técnicas habituales en este tipo de publicaciones: abliteration por proyección ortogonal de la dirección de rechazo en los pesos, fine-tuning sobre un conjunto de peticiones sin rechazo, y herramientas automatizadas como Heretic, que combinan búsqueda de parámetros de abliteración con evaluación de la tasa de rechazo. El autor no indica cuál se ha empleado, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO posteriores. El modelo base Qwen2.5-3B, según la documentación de la serie Qwen2.5, se preentrenó sobre del orden de 18 billones de tokens, pero ese dato corresponde al modelo original y no garantiza que el derivado conserve sus capacidades.

## Capacidades

- Generación de texto y conversación multiturno: capacidades heredadas del modelo base Qwen2.5-3B, no verificadas en este derivado concreto.
- Respuestas con menor tasa de rechazo: es el objetivo declarado por el nombre del modelo; no se publica una medición de tasa de rechazo (el modelo comparable `arnomatic/Qwen2.5-3B-Instruct-heretic` reporta 3/100 frente a 97/100 del original, pero ese dato no es extrapolable a este repositorio).
- Razonamiento y matemáticas básicas: esperable en un 3B de la familia Qwen2.5, sin benchmarks publicados para este derivado.
- Generación de código: capacidad típica de Qwen2.5-3B; no confirmada mediante HumanEval ni evaluación equivalente en este repositorio.
- Soporte de tool calling y formato JSON estructurado: disponible en las variantes Instruct de Qwen2.5; no se puede confirmar si este derivado parte de la base o de la versión Instruct.
- Multilingüismo: el modelo base declara decenas de idiomas, con español entre ellos; la ficha del derivado no especifica idiomas ni calidad por idioma.
- Modo "thinking" o razonamiento extendido: no disponible (corresponde a generaciones posteriores de la familia Qwen, no a Qwen2.5).

## Casos de uso

- Red teaming y evaluación de filtros de seguridad: el modelo sirve como generador de peticiones y respuestas que un modelo alineado rechazaría, permitiendo medir la cobertura de clasificadores de contenido propios antes de desplegarlos en producción.
- Investigación sobre la dirección de rechazo: al ser un 3B denso, se puede ejecutar en una única GPU de 24 GB y permite experimentos de interpretabilidad mecanicista (extracción de activaciones, proyección de direcciones, comparación con el modelo base) con coste bajo.
- Generación de datos sintéticos adversarios: producción por lotes de ejemplos etiquetados para entrenar clasificadores de toxicidad o filtros de prompt, aprovechando que el modelo no se autolimita en la formulación.
- Escritura creativa y ficción sin restricciones temáticas: narrativa con violencia, terror o contenido adulto donde los filtros del modelo original interrumpen la generación; requiere revisión humana posterior por la menor calidad de un 3B.
- Prototipado local offline: despliegue en un portátil con GPU de 8-12 GB mediante llama.cpp tras convertir los pesos a GGUF, útil para demos sin conexión y sin coste de API.
- Base para fine-tuning posterior: punto de partida para especializaciones de dominio que no requieren la alineación de seguridad original, con la ventaja de que 3B se ajusta con técnicas como LoRA en una sola GPU consumer.
- Evaluación comparativa de derivados comunitarios: sirve como muestra en estudios sobre degradación de capacidades tras aplicar abliteration, comparando con el Qwen2.5-3B original en tareas de razonamiento y coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni métricas de tasa de rechazo, y las cifras del modelo base Qwen2.5-3B no son trasladables sin una evaluación propia del derivado.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, más caché KV; con 8.192 tokens de contexto en un modelo de 3B se suelen añadir 1-2 GB, por lo que conviene contar con 8-10 GB.
- VRAM en cuantización de 8 bits: alrededor de 3,1-3,5 GB de pesos.
- VRAM en cuantización de 4 bits (Q4_K_M): alrededor de 1,9-2,1 GB de pesos, lo que deja margen para contexto largo en tarjetas de 8 GB.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090; también cabe en iGPU con memoria unificada si se usa cuantización Q4.
- GPU de datacenter: A100 40/80 GB, H100, L40S para servir con lotes grandes; un 3B no necesita este hardware para uso individual, solo para throughput agregado.
- Opciones de despliegue: vLLM y TGI pueden cargar los safetensors directamente; llama.cpp, Ollama y LM Studio requieren convertir previamente a GGUF con `convert_hf_to_gguf.py` y cuantizar con `llama-quantize`, ya que el autor no publica GGUF.
- Latencia y throughput: no hay mediciones publicadas. Como estimación orientativa no verificada, un 3B en Q4_K_M sobre RTX 4090 puede decodificar por encima de 100 tokens/s, y sobre CPU moderna de escritorio en el rango de 10-25 tokens/s, con variaciones grandes según backend y longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modificación de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| redo115/qwen-2.5-3b-decensored | 3,09 B | No disponible (base: 32.768) | No disponible | Sí, no documentada | Safetensors, 0 descargas |
| Qwen/Qwen2.5-3B (y variante Instruct) | 3,09 B | 32.768 tokens | Apache 2.0 | No | Safetensors, ampliamente descargado |
| arnomatic/Qwen2.5-3B-Instruct-heretic | 3,09 B | 32.768 tokens (heredado) | No disponible en el resultado consultado | Sí, vía Heretic v1.1.0, con tasa de rechazo reportada de 3/100 | Safetensors, disponible en Featherless |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | No | Safetensors y GGUF oficiales |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | No | Safetensors y GGUF |

Los datos de contexto y licencia de las filas comparativas provienen de las fichas públicas de cada modelo y conviene verificarlos en la fuente antes de tomar decisiones de adopción; el rendimiento relativo no se puede establecer sin ejecutar las mismas evaluaciones sobre todos ellos.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que deja en una zona gris el uso comercial del derivado. Aunque el modelo base Qwen2.5-3B es Apache 2.0, la falta de declaración del autor impide asumir que los términos se mantienen.
- Alineación de seguridad retirada: el modelo está diseñado para no rechazar peticiones, por lo que puede producir contenido dañino, ilegal o sexualmente explícito. No debe exponerse a usuarios finales sin filtros externos.
- Riesgo de degradación de capacidades: las técnicas de abliteration y decensoring pueden deteriorar coherencia, razonamiento y calidad multilingüe. Sin benchmarks publicados, la magnitud de esa degradación es desconocida.
- Alucinación: un modelo de 3.100 millones de parámetros tiene una tasa de alucinación alta en tareas de conocimiento factual, y la modificación puede agravarla al reducir la cautela en las respuestas.
- Calidad en español: el modelo base declara multilingüismo, pero la calidad del derivado en castellano no está evaluada y el tamaño reducido penaliza la fluidez frente a modelos de 7B o más.
- Contexto y longitud de salida: si el derivado conserva la configuración del base, el contexto efectivo es de 32.768 tokens, insuficiente para documentos largos sin técnicas de recuperación.
- Procedencia no verificada: con 0 descargas y 1 like, no hay validación de la comunidad ni reproducibilidad del proceso. Los pesos podrían diferir del modelo base en aspectos no documentados; conviene auditar el repositorio y comparar con el original antes de usarlo.
- Restricciones de despliegue: al no publicarse GGUF ni cuantizaciones, cualquier uso en CPU o GPU de gama baja exige un paso previo de conversión y validación numérica por parte del usuario.
- Sesgos: no se ha realizado ninguna evaluación de sesgos sobre este derivado; la eliminación del rechazo no implica neutralidad, sino menor filtrado de sesgos presentes en los datos de preentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redo115/qwen-2.5-3b-decensored
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Derivado comparable creado con Heretic (Featherless): https://featherless.ai/models/arnomatic/Qwen2.5-3B-Instruct-heretic
- Índice de modelos abliterated: https://www.abliteratedmodels.org/
- Artículo sobre Westernized Qwen y reducción de respuestas censuradas (Business Wire): https://www.businesswire.com/news/home/20261005345737/en/Hirundo-Releases-Westernized-Qwen-Cutting-Censored-and-CCP-Aligned-Answers-From-89.8-to-2.8-in-the-Leading-Chinese-AI-Model
- Entrada sobre la familia Qwen en Wikipedia: https://en.wikipedia.org/wiki/Qwen
