# Smilyai-labs/Mira-1-large-0919

## Resumen

Mira (Smilyai-labs/Mira-1-large-0919) es un modelo de lenguaje conversacional y de razonamiento de 14.768.307.200 parametros (~14,8B) desarrollado por Smilyai-labs. Se presenta como un ajuste fino de tipo LoRA sobre Bc-AI/Nova-2-Large, cuyo origen fundacional es Qwen3-14B. El modelo esta orientado a programacion, matematicas, razonamiento tecnico y conversacion general, con un estilo conversacional deliberadamente expresivo y una funcion opcional de revision de codigo llamada "Roast Mode".

La cadena de ascendencia declarada por el autor es: Qwen3-14B, fusion DARE-TIES orientada a codigo y matematicas, resultando en Nova-2-Large, y posteriormente un ajuste LoRA que da lugar a Mira. Mantiene 40 capas transformer, un tamano oculto de 5.120 y una ventana de contexto de 40.960 tokens, con computo en bfloat16. El unico idioma declarado es el ingles.

Es relevante ahora porque ejemplifica una tendencia concreta en el ecosistema abierto: modelos derivados de bases potentes mediante fusion de pesos y LoRA, publicados con licencia "other" y con un enfasis explicito en personalidad y estilo conversacional. La ficha es, no obstante, de un modelo con adopcion muy baja (21 descargas y 2 likes en el momento de la consulta) y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (40 capas, hidden size 5.120) |
| Parametros totales | 14.768.307.200 (~14,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no publicados por el autor; el repositorio solo contiene pesos en bfloat16/safetensors. Compatible con cuantizaciones estandar (GGUF Q2-Q8, AWQ, GPTQ, FP8) previa conversion, no verificadas por el autor |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors (libreria transformers); no hay GGUF oficial |
| Precision declarada | bfloat16 |
| Modelo base | Bc-AI/Nova-2-Large |
| Origen fundacional | Qwen3-14B |
| Metodo de ajuste | LoRA |
| Tamano del repositorio | 29,5 GB |
| Descargas / likes | 21 / 2 |
| Fecha de publicacion | 2026-09-19 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Mira es un transformer denso de 14,8B de parametros con 40 capas y dimension oculta de 5.120, computado en bfloat16. La model card no documenta el numero de cabezas de atencion ni si emplea atencion agrupada (GQA); dado su origen Qwen3-14B, es probable que herede la configuracion de esa familia, pero no esta confirmado en la informacion disponible.

El entrenamiento declarado consiste en una unica etapa final de ajuste fino con LoRA (Low-Rank Adaptation) sobre Nova-2-Large. Nova-2-Large, a su vez, procede de Qwen3-14B mediante una fusion de pesos DARE-TIES (merge) orientada a dominios de codigo y matematicas. Es decir, no se trata de un preentrenamiento propio: el coste computacional declarado se limita a la fusion y al LoRA. La composicion exacta del dataset, los hiperparametros, la configuracion del LoRA (rango, alpha, modulos objetivo) y la mezcla de entrenamiento son propietarios de SmilyAI y no se publican.

La model card menciona que el ajuste final cubre comportamiento conversacional, razonamiento, programacion, interaccion tecnica, personalidad, autocorreccion y seguimiento de instrucciones. No se documenta ninguna innovacion arquitectonica propia (ni decodificacion especulativa, ni atencion lineal, ni hibridacion SSM). El soporte de etiquetas `<think>` para razonamiento se describe como dependiente del framework de inferencia y del formato de prompt, no como una caracteristica garantizada del modelo.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento multi-paso: descomposicion de problemas, comparacion de soluciones alternativas e identificacion de supuestos incorrectos.
- Modo de razonamiento opcional mediante etiquetas `<think>`, condicionado al framework de inferencia y al formato de prompt empleado.
- Programacion: Python, machine learning, ingenieria de IA, depuracion, desarrollo de algoritmos, revision de codigo, explicacion de codigo y arquitectura tecnica.
- Matematicas: algebra, problemas numericos, matematicas aplicadas, matematicas algoritmicas y explicacion de conceptos matematicos.
- Autocorreccion y revision de respuestas previas.
- Seguimiento de instrucciones y explicaciones tecnicas.
- Estilo conversacional definido: cercano, curioso, energetico, tecnicamente entusiasta, algo jugueton, directo y explicito sobre la incertidumbre.
- "Roast Mode": modo opcional de revision de codigo con tono humoristico, con el principio declarado de criticar el codigo y no al desarrollador.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y ejecucion multi-paso con herramientas: no documentado.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Asistente de depuracion de codigo en local: el modelo esta ajustado explicitamente para debugging y autocorreccion, por lo que puede recibir un fragmento de Python o un traceback y proponer hipotesis de fallo. Requiere revisar y ejecutar el resultado antes de aplicarlo.
- Revision de codigo en entornos de equipo: con su "Roast Mode" puede generar comentarios de revision con tono distendido, utiles para equipos que quieran reducir la friccion en las revisiones sin perder foco tecnico.
- Explicacion de conceptos matematicos: adecuado para generar explicaciones paso a paso de algebra, matematicas aplicadas o algoritmos numericos en contextos educativos o de documentacion interna.
- Asistente tecnico conversacional: con 40.960 tokens de contexto puede mantener conversaciones largas sobre arquitectura de software, decisiones de diseno o discusiones de ingenieria sin perder el hilo.
- Generacion de prototipos y pequenos proyectos de software: la model card lo orienta a proyectos pequenos, por lo que encaja en la generacion de scripts, utilidades y pruebas de concepto que luego se revisan manualmente.
- Experimentacion en IA/ML y desarrollo de asistentes personales: al ser un modelo de 14,8B en safetensors y bfloat16, es viable para prototipado de agentes conversacionales con personalidad definida en una sola GPU de 40-80 GB.
- Documentacion tecnica y articulos de ingenieria: puede redactar explicaciones de algoritmos, notas de arquitectura o resumenes de decisiones tecnicas a partir de contexto largo.
- Simulacion de conversacion con personalidad: util para investigacion sobre estilo, tono y consistencia de personaje en asistentes, dado el enfasis declarado del autor en la personalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Smilyai-labs no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y la busqueda web realizada no ha devuelto resultados relevantes sobre el modelo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones de ingenieria derivadas del numero de parametros (14,8B); el autor no publica requisitos de hardware ni mediciones de latencia o throughput.

- Precision completa bfloat16: aproximadamente 29,5 GB solo de pesos, coherente con el tamano del repositorio (29,5 GB). Con cache KV y activaciones, el consumo se situa en el entorno de 34-40 GB.
- FP8 / INT8: aproximadamente 15-16 GB de pesos.
- GGUF Q5_K_M: aproximadamente 10-11 GB. GGUF Q4_K_M: aproximadamente 9 GB. GGUF Q3_K_M: aproximadamente 7 GB. GGUF Q2_K: aproximadamente 5,5 GB.
- Cache KV: depende de la configuracion de atencion, que no esta documentada. Con la configuracion tipica de Qwen3-14B (GQA con 8 cabezas KV, head dim 128), el coste seria del orden de 160 KB por token, es decir, unos 6,5 GB a los 40.960 tokens completos. Cifra no confirmada por el autor.
- GPU profesionales: cabe en una A100 40 GB en bfloat16 (con margen ajustado), en una A100 80 GB, H100 80 GB o L40S 48 GB con comodidad.
- GPU de consumo: en bfloat16 no cabe en una RTX 4090 de 24 GB; requiere dos RTX 4090 o una RTX 5090 de 32 GB en cuantizaciones de 8 bits o inferiores. En Q4_K_M cabe holgadamente en una RTX 4090, RTX 4080 o incluso en GPUs de 12 GB con cuantizaciones Q3/Q4 y contexto reducido.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM, TGI y SGLang para safetensors en servidor. Para llama.cpp u Ollama es necesaria una conversion previa a GGUF, ya que el autor no publica artefactos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Mira-1-large-0919 | 14,8B | 40.960 tokens | other | en | Ajuste LoRA sobre Nova-2-Large (origen Qwen3-14B). Sin benchmarks publicados. 21 descargas |
| Qwen3-14B | 14,8B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache-2.0 | multilingue (mas de 100 idiomas) | Modelo base fundacional de la cadena de Mira. Licencia permisiva y amplia adopcion |
| Phi-4 (14B) | 14,7B | 16.000 tokens | MIT | principalmente ingles | Tamano comparable, licencia permisiva, orientado a razonamiento y matematicas |

La comparacion se limita a parametros, contexto y licencia, porque no hay datos publicos de rendimiento de Mira. En terminos practicos, la diferencia mas relevante frente a Qwen3-14B y Phi-4 no es de capacidad bruta declarada, sino de licencia: Mira se distribuye bajo licencia "other", sin terminos de uso comercial explicitados en la informacion disponible, mientras que las alternativas citadas usan licencias permisivas.

## Limitaciones y advertencias

- Alucinacion: la propia model card reconoce que el modelo puede producir informacion incorrecta o enganosa, incluyendo codigo incorrecto o incompleto y errores matematicos.
- El razonamiento no garantiza correccion: el autor advierte explicitamente de que el comportamiento de razonamiento, incluidas las etiquetas `<think>`, no asegura respuestas correctas.
- Razonamiento inconsistente en problemas dificiles, supuestos incorrectos, mala interpretacion de instrucciones ambiguas, informacion desactualizada y respuestas excesivamente confiadas.
- Idioma: solo se declara ingles. No hay soporte multilingue documentado, por lo que el uso en castellano no esta respaldado por el autor.
- Licencia "other": no se detallan los terminos. No hay confirmacion de permiso para uso comercial. Es imprescindible revisar los terminos completos en el repositorio antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks: no se puede verificar ninguna afirmacion de rendimiento frente a Qwen3-14B, Phi-4 u otros modelos de tamano similar.
- Opacidad del entrenamiento: composicion del dataset, hiperparametros y configuracion LoRA son propietarios. No es posible auditar sesgos ni procedencia de datos.
- Sesgos conocidos: no documentados por el autor. Al derivar de Qwen3-14B y entrenarse solo en ingles, es esperable que herede sesgos de la base, pero no hay evaluacion publicada.
- Inconsistencias en la propia model card: el ejemplo de uso emplea el identificador "Bc-AI/Mira", que no coincide con el identificador del repositorio publicado; los metadatos de tags apuntan a "Smilyai-labs/Mira-1-XL" como base, mientras que el campo base_model apunta a "Bc-AI/Nova-2-Large". Conviene verificar los identificadores antes de integrar el modelo.
- Adopcion muy baja (21 descargas, 2 likes), sin comunidad que haya validado el modelo ni reportado problemas.
- El "Roast Mode" y el estilo de personalidad pueden producir respuestas con un tono inadecuado en contextos profesionales o de cara al publico si no se controla mediante prompting.
- Fecha de creacion inusual en los metadatos (2026-09-19), coherente con un repositorio reciente; no hay historial de versiones que permita evaluar estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Smilyai-labs/Mira-1-large-0919
- Modelo base declarado: Bc-AI/Nova-2-Large (no se ha podido verificar la URL en la informacion disponible)
- Origen fundacional: Qwen3-14B (familia Qwen3)
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo.
