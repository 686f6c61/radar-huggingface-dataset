# arelath/gemma-3-4b-it

## Resumen

`arelath/gemma-3-4b-it` es una cuantizacion derivada del modelo instructivo `google/gemma-3-4b-it` de Google DeepMind, publicada por el usuario arelath bajo el formato GGUF y la tecnica propietaria NanoQuant. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresion que reduce el peso del modelo original a aproximadamente 1,7 GB mediante una receta de cuantizacion factorizada de 2,5 bits por peso efectivos en las proyecciones, con un resultado medido de 3,55 bits por peso sobre el total de parametros.

El modelo base Gemma 3 4B es un transformer denso de 4.000 millones de parametros con capacidad multimodal de entrada de imagen y texto, disenado para instrucciones y conversacion. Esta version cuantizada conserva la licencia Gemma y esta pensada para despliegues con recursos muy limitados, donde el modelo BF16 original no cabria en VRAM consumer.

La relevancia de esta publicacion es doble: por un lado demuestra la viabilidad de NanoQuant como tecnica de compresion agresiva sobre modelos de la familia Gemma; por otro, hace publicos los resultados de evaluacion comparativos frente a la referencia BF16, lo que permite valorar con transparencia la perdida de calidad asumida (por ejemplo, MMLU cae de 0,584 a 0,449 y la perplejidad en wikitext2 sube de 51,6 a 63,8). El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que debe considerarse un artefacto experimental mas que un modelo de produccion consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de google/gemma-3-4b-it); pesos en GGUF con cuantizacion NanoQuant |
| Parametros totales | 924.634.368 (dato del campo safetensors del repo); el plan de compresion referencia 3.880.263.168 parametros originales del modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NanoQuant 2,50 bpw efectivos en proyecciones factorizadas; GGUF medido a 3,5545 bpw |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | GGUF (`gemma-3-4b-it-nanoquant-2.50bpw.gguf`, 1724,1 MB) y safetensors denso (`checkpoint/dense.safetensors`, 1343,3 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Gemma 3 4B instructivo de Google: un transformer denso con atencion multi-cabeza y capacidades multimodales de entrada (imagen y texto), segun la familia Gemma 3. Esta publicacion no entrena el modelo; aplica una receta de compresion NanoQuant sobre la revision `093f9f388b31de276ce2de164bdc2081324b9767` del modelo base.

El proceso de cuantizacion se documenta con detalle en la model card: 170 unidades de compresion, un factor de 1.002.700.288 bytes, 2,499999 bpw efectivos en las proyecciones factorizadas y un presupuesto de 1.002.700.800 bytes. El resultado medido en GGUF es de 1.724.054.976 bytes, equivalente a 3,554511 bpw sobre los 3.880.263.168 parametros originales. La evaluacion se realizo con llama.cpp en la revision `2927569f318311aded148d76be6b1109664066f5`, con implementacion de atencion eager, embeddings en bfloat16 y normas de bloque fijadas al modelo fuente. No se documenta en la informacion disponible ningun proceso de RLHF, DPO o ajuste adicional sobre el modelo derivado; el ajuste por instrucciones procede integramente del modelo base.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo Gemma 3 4B instructivo.
- Razonamiento basico y respuesta a preguntas de conocimiento general (evaluado en MMLU con 5 ejemplos por asignatura).
- Entrada multimodal de imagen y texto, segun las capacidades del modelo base Gemma 3 4B (no verificadas de forma independiente en esta cuantizacion).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware muy limitado: con 1,7 GB en GGUF, el modelo cabe en GPUs consumer de gama baja (8 GB o menos) y en CPU con llama.cpp, lo que permite prototipar asistentes conversacionales en equipos sin acelerador dedicado.
- Experimentacion con tecnicas de cuantizacion: el repositorio incluye `recipe.yaml`, `plan.json` y las metricas de comparacion frente a BF16, lo que lo convierte en un caso de estudio util para investigadores que evaluen NanoQuant u otras recetas de compresion agresiva.
- Evaluacion de la perdida de calidad por compresion: al publicar MMLU, perplejidad en wikitext2 y la media de seis tareas frente al profesor BF16, sirve para calibrar el compromiso calidad/tamano antes de adoptar una cuantizacion en un pipeline.
- Asistentes de texto offline: integrable en aplicaciones de escritorio o moviles mediante llama.cpp u Ollama, con respuestas conversacionales de un modelo de 4B comprimido a menos de 2 GB.
- Generacion de texto de bajo coste en entornos educativos: permite a estudiantes ejecutar un modelo instructivo de la familia Gemma en portatiles sin GPU dedicada, a costa de una calidad inferior a la del modelo original.
- Base para comparativas de cuantizacion: util como referencia cuantizada en estudios que comparen GGUF de distintos tamanos y recetas sobre el mismo modelo fuente.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando la cuantizacion NanoQuant frente a la referencia BF16 del mismo modelo base:

| Metrica | NanoQuant | Referencia BF16 |
|---|---|---|
| Perplejidad wikitext2 | 63,8190 | 51,6139 |
| MMLU (5-shot, 14.042 muestras, 57 asignaturas) | 0,4488 | 0,5838 |
| Media de seis tareas (piqa, arc_easy, arc_challenge, hellaswag, winogrande, boolq) | 0,6275 | 0,7185 |
| KL conjunto del decodificador | 1,0428 | 0,0 (suelo limpio) |

Protocolo de evaluacion: wikitext2 con 64 muestras de 128 tokens y batch de 8; seis tareas con limite de 1000 muestras cada una (acc_norm en piqa, arc_easy, arc_challenge y hellaswag; acc en winogrande y boolq); MMLU con scoring de siguiente token sobre la letra de respuesta; KL curado con 160 muestras de 256 tokens y ultimo token excluido. La diferencia entre el candidato y el profesor es sustancial en todas las metricas: la cuantizacion pierde aproximadamente 13,5 puntos de MMLU y 9,1 puntos en la media de seis tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2 GB para el archivo GGUF de 1,7 GB mas overhead de contexto; el checkpoint denso en safetensors ocupa 1,3 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien viable en CPU con llama.cpp.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas y en muchas integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (revision documentada `2927569f...`), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o servidores compatibles con GGUF; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| arelath/gemma-3-4b-it (NanoQuant) | 3,88 B (fuente) | no disponible | 0,4488 | Gemma | GGUF + safetensors |
| google/gemma-3-4b-it (BF16) | 3,88 B | no disponible | 0,5838 | Gemma | safetensors |
| Otras cuantizaciones GGUF de Gemma 3 4B | 3,88 B | no disponible | no disponible | Gemma | GGUF |

La comparativa directa mas relevante es contra el propio modelo base en BF16, ya que la model card solo publica esa referencia. No se dispone de datos de benchmarks de otras cuantizaciones (por ejemplo, Q4_K_M o Q2_K de llama.cpp) en la informacion proporcionada, por lo que no es posible situar esta receta frente a alternativas estandar de la comunidad.

## Limitaciones y advertencias

- Perdida de calidad significativa: MMLU cae de 0,584 a 0,449 y la perplejidad en wikitext2 aumenta un 23,6 % respecto a BF16; no es adecuada para tareas que requieran la precision del modelo original.
- El campo de parametros del repo safetensors (924,6 M) no coincide con los 3.880 M parametros del modelo base referenciados en el plan de compresion; conviene verificar el contenido real de los artefactos antes de usarlos en produccion.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion independiente de los resultados publicados.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con las restricciones que estos imponen.
- Riesgo de alucinacion inherente a un modelo de 4B comprimido de forma agresiva; la cuantizacion puede amplificar errores en tareas de conocimiento factual.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue equivalente al del modelo base.
- Longitud de contexto no documentada en esta ficha; debe consultarse la del modelo base Gemma 3 4B, pero no se confirma que la cuantizacion la preserve en la informacion disponible.
- Artefacto experimental: la model card no documenta validacion en cargas de produccion, ni latencia, ni throughput.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arelath/gemma-3-4b-it
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Gemma Terms of Use: https://gemma.ai/resources/terms
- Gemma Prohibited Use Policy: https://gemma.ai/resources/prohibited-use
- Revision de llama.cpp usada: `2927569f318311aded148d76be6b1109664066f5` (repositorio en https://github.com/ggml-org/llama.cpp)
