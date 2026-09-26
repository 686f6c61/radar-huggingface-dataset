# ntumm120/ttc-trunk-8b-r512-33k

## Resumen

TTC 8B trunk (r512, 33K) es un artefacto de investigación publicado por el usuario ntumm120 en Hugging Face. Se trata de un *trunk* recurrente construido sobre un backbone Qwen/Qwen3-8B congelado: el modelo base no se modifica y se añade un módulo *writer* que escribe y mantiene un estado recurrente de rango 512 filas sobre secuencias de 33.000 tokens procesadas en bloques de 2048. Forma parte de una escalera de variantes (r288, r512, r1024, r2048, r4096 y r8192) en la que solo cambia el tamaño del estado, siendo r2048 el *headliner* declarado por el autor.

El checkpoint publicado corresponde al *anneal* `a2000_mixB`: un decaimiento de 250 pasos del *learning rate* (de 1e-3 a 0) partiendo del guardado retenido en el paso 2000, dentro de un entrenamiento con tasa constante 1e-3 (WSD trunk) y guardados reanudables cada 500 pasos. El repositorio ocupa 7,9 GB e incluye `writer_s002249.pt` junto con `args.json`, `train_log.jsonl`, `branch.log`, `readouts.log` y un directorio `results/` con los conjuntos de evaluación empleados.

La relevancia de este artefacto es de investigación, no de producto: sirve para estudiar memoria recurrente y extensión de contexto sobre un transformer denso con backbone congelado. No es un modelo conversacional, no declara pipeline de inferencia, licencia, idiomas ni benchmarks publicados, y acumula 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone Qwen3-8B congelado) con modulo recurrente *writer* sobre la cache; receta *trunk* (cache substrate, recurrent write, fold rowmax, FIFO + 3 sinks) |
| Parametros totales | no disponible (backbone de 8B mas los parametros del *writer*, sin cifra agregada publicada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 33.000 tokens (streams de 33K, bloque de 2048) segun la model card; ventana nativa del backbone no indicada |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`writer_s002249.pt`), acompanado de `args.json`, `train_log.jsonl`, `branch.log`, `readouts.log` y `results/` |
| Tamano del repositorio | 7,9 GB |
| Rango de estado (*state rank*) | 512 filas |
| Dimension del *writer* (`d_c`) | 512 |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la receta *trunk* del autor: se congela el backbone Qwen3-8B y se entrena únicamente un módulo *writer* que opera sobre un sustrato de caché. El estado recurrente tiene rango 512 filas y dimensión de escritura `d_c = 512`. Las secuencias se procesan como streams de 33.000 tokens en bloques de 2048, con una política de caché FIFO complementada con 3 tokens *sink* y una operación denominada *fold rowmax* en la model card. El checkpoint publicado es el resultado de un *anneal* arm-B (`mixB`) de 250 pasos que decae el *learning rate* de 1e-3 a 0 partiendo del guardado retenido en el paso 2000; el *optimizer* se elimina del fichero, que conserva las claves `writer`, `shared`, `args` y `step`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset (la ficha menciona únicamente "the same T data" que el modelo *headliner*), ni si hubo fases de RLHF o DPO. Tampoco se detalla si el entrenamiento usa atención completa sobre el backbone congelado, atención lineal u otro mecanismo de mezcla entre el estado recurrente y la caché. El módulo `writer_s002249.pt` va acompañado de `args.json` y de registros de entrenamiento (`train_log.jsonl`, `branch.log`), lo que sugiere que la reproducibilidad depende del código original del autor, no publicado como librería estándar.

## Capacidades

- Procesamiento de documentos largos en streaming: la configuración declarada trabaja sobre streams de 33.000 tokens en bloques de 2048, con gestión FIFO y 3 tokens *sink*.
- Memoria recurrente comprimida: el estado de rango 512 actúa como resumen persistente entre bloques, con tamaño fijo e independiente de la longitud del documento.
- Recuperación de información en contexto largo: la ficha cita evaluaciones NIAH (*needle in a haystack*) en variantes single-key y multikey con contexto contiguo c7.
- Preguntas y respuestas sobre documentos: evaluación sobre conjuntos `tqa_contig` (c3 y c7), `tqa` (c3) y fragmentos `tqa_doc`.
- Medición de modelado de lenguaje en contexto largo: evaluación LongPPL sobre `tqa_contig`.
- Capacidad de ablation controlada: la familia de hermanos (r288, r512, r1024, r2048, r4096, r8192) permite estudiar el efecto del tamaño de estado manteniendo el resto de la receta constante.
- No hay evidencia en la información disponible de: ajuste por instrucciones, soporte de *tool calling* o *function calling*, comportamiento agéntico, capacidades de visión o audio, ni multilingüismo declarado.
- Cualquier capacidad lingüística heredable del backbone Qwen3-8B queda fuera del alcance de esta ficha, ya que el autor no la documenta ni la verifica.

## Casos de uso

- Investigación en memoria recurrente y extensión de contexto: el *trunk* permite medir cómo un estado de rango 512 condiciona la modelización de secuencias de 33K tokens frente a mantener la caché KV completa, con el backbone congelado como control.
- Evaluación de recuperación tipo *needle in a haystack*: el repositorio incluye los conjuntos NIAH single-key y multikey contiguos c7, de modo que se puede reproducir directamente la curva de acierto en función de la posición del dato dentro del stream.
- Preguntas y respuestas sobre documentos largos: con `tqa_contig` (c3/c7), `tqa` (c3) y los fragmentos `tqa_doc` se puede medir la degradación de la respuesta cuando el contexto supera el bloque de 2048 y depende del estado recurrente.
- Medición de perplejidad en contexto largo: la evaluación LongPPL sobre `tqa_contig` permite comparar la perplejidad del *trunk* frente al backbone sin estado en la misma ventana de 33K tokens.
- Ablación del tamaño de estado: comparar r288, r512, r1024, r2048, r4096 y r8192 bajo idéntica receta y mismos datos para trazar la curva calidad-coste de memoria recurrente.
- Reproducción de decaimientos (*annealing*): el checkpoint `a2000_mixB` permite estudiar el efecto de un decaimiento de 250 pasos sobre el rendimiento final frente al guardado del paso 2000 sin *anneal*.
- Punto de partida para *fine-tuning* posterior: un grupo de investigación podría descongelar parcialmente el backbone o ajustar el *writer* sobre dominios concretos, partiendo de un estado ya entrenado.
- Inferencia con huella de memoria acotada: si la implementación lo permite, el estado de tamaño fijo evita que la memoria crezca linealmente con la longitud del documento, algo relevante para procesar flujos continuos de texto en *hardware* limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card referencia los conjuntos de evaluación empleados, pero no incluye cifras. Se listan a continuación únicamente como inventario de lo evaluado, sin valores:

| Conjunto de evaluacion | Resultado publicado |
|---|---|
| tqa_contig (c3) | no publicado |
| tqa_contig (c7) | no publicado |
| tqa (c3) | no publicado |
| niah single-key contiguo (c7) | no publicado |
| niah multikey contiguo (c7) | no publicado |
| tqa_doc (fragmentos) | no publicado |
| LongPPL sobre tqa_contig | no publicado |

## Requisitos de hardware

- Backbone Qwen3-8B en precision completa: aproximadamente 16 GB solo para los pesos en bf16/fp16 (estimacion a partir del tamano del backbone, no publicada por el autor).
- Backbone cuantizado a 4 bits: aproximadamente 5-6 GB de pesos, si se aplica una cuantizacion estandar externa (estimacion; no hay variantes cuantizadas publicadas).
- Checkpoint del *trunk*: el repositorio ocupa 7,9 GB, pero la ficha no desglosa cuanto corresponde al *writer* frente a otros ficheros auxiliares.
- GPU recomendadas: no disponibles. Como referencia general para un backbone de 8B en bf16 hacen falta 16-24 GB de VRAM (RTX 4090, L4, A10G, A100 40 GB); en 4 bits podria caber en GPUs de 12 GB.
- GPU de consumo: previsiblemente viable en 4 bits en tarjetas de 12 GB o mas; inviable en bf16 en tarjetas de 8-10 GB.
- Opciones de despliegue: no disponible. Al publicarse como checkpoint PyTorch con arquitectura personalizada y sin pipeline declarado, no hay constancia de soporte en vLLM, llama.cpp, Ollama, TGI ni otros servidores estandar; la evaluacion debe hacerse "exactamente como se describe en el README del repositorio r2048", segun el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad declarados publicamente.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ntumm120/ttc-trunk-8b-r512-33k | 8B (backbone) + *writer*; total no disponible | 33K tokens en streams de 2048 | no disponible | Hugging Face, repo de 7,9 GB, 0 descargas |
| Qwen/Qwen3-8B (backbone congelado) | ~8,2B denso | 32.768 tokens nativos, extensible a 131.072 con YaRN | Apache-2.0 | Hugging Face |
| meta-llama/Llama-3.1-8B | ~8,03B denso | 128K tokens | Llama 3.1 Community License | Hugging Face |

La diferencia fundamental es de categoria: Qwen3-8B y Llama-3.1-8B son modelos generativos completos con licencia y *cards* publicas, mientras que el artefacto aqui descrito es un componente de investigacion con backbone congelado, sin licencia declarada y sin resultados verificables. No se han identificado en la informacion proporcionada otras alternativas comparables dentro del mismo enfoque de estado recurrente.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso de uso comercial. Cualquier despliegue en produccion requiere aclarar previamente los terminos con el autor y verificar la licencia del backbone Qwen3-8B subyacente.
- No es un modelo instruido ni alineado: no hay evidencia de ajuste por instrucciones, RLHF o DPO, por lo que no es adecuado como asistente conversacional directo.
- Ausencia total de benchmarks publicados: el rendimiento real en las tareas evaluadas es desconocido; las evaluaciones citadas solo constan como conjuntos ejecutados en `results/`.
- Riesgo de alucinacion no caracterizado: al no existir alineacion ni evaluaciones de fidelidad, no hay datos sobre la tasa de invencion de contenido.
- Politica de cache FIFO con 3 *sink*: implica descartar tokens antiguos, de modo que la informacion fuera de la ventana solo persiste si el estado recurrente la ha retenido; la perdida de informacion no esta cuantificada.
- Idiomas no declarados: se desconoce el comportamiento fuera del ingles tecnico de los conjuntos de evaluacion citados.
- Formato y dependencia de codigo: se publica un `.pt` con `args.json` en lugar de pesos safetensors estandar, lo que dificulta la carga con herramientas genericas y ata la reproducibilidad al entorno de entrenamiento original.
- Trazabilidad limitada: la ficha remite al README del repositorio r2048 para el comando de evaluacion y no documenta la composicion de "T data", el numero de tokens de entrenamiento ni el coste computacional.
- Madurez: 0 descargas y 0 *likes*, sin validacion externa ni reportes de terceros.
- Naturaleza experimental: forma parte de una escalera de ablaciones (r288 a r8192) y esta sujeto a cambios frecuentes; no debe tratarse como una version estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ntumm120/ttc-trunk-8b-r512-33k
- Modelo *headliner* de la escalera (r2048, 33K): https://huggingface.co/ntumm120/ttc-trunk-8b-r2048-33k
- Hermanos de la escalera: https://huggingface.co/ntumm120/ttc-trunk-8b-r288-33k, https://huggingface.co/ntumm120/ttc-trunk-8b-r1024-33k, https://huggingface.co/ntumm120/ttc-trunk-8b-r4096-33k, https://huggingface.co/ntumm120/ttc-trunk-8b-r8192-33k
- Backbone congelado: https://huggingface.co/Qwen/Qwen3-8B
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
