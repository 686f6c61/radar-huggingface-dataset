# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed2

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed2` es un ajuste fino de SmolLM2-135M-Instruct orientado a la generacion de texto en feroes (fo). Lo desarrolla el usuario independiente `jekunz` como parte de una linea de experimentos de adaptacion linguistica de bajo coste sobre modelos pequenos, y se distribuye con licencia Apache 2.0. Su interes practico es acotado: demuestra una receta de transferencia entre lenguas germanicas nortes para llevar un modelo de 135 millones de parametros a un idioma con pocos recursos, partiendo de un merge TIES de variantes entrenadas en danes, islandes, noruego bokmal, noruego nynorsk y sueco.

Arquitectura transformer decoder-only tipo Llama, con 134.515.008 parametros totales y un contexto maximo de entrenamiento de 2048 tokens. El modelo base es `jekunz/smollm135m-da05-is1-nno05-nob05-sv05-ties`, un merge con mayor peso en islandes, sobre el que se aplica un continued pre-training con el subconjunto feroes de FineWeb-2.

Es relevante como referencia metodologica para investigacion en lenguas de bajos recursos y como pieza ligera para tareas de generacion de texto en feroes donde no se requiera calidad de estado del arte. El autor advierte explicitamente de que el modelo esta pensado para su propia investigacion y no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | Feroes (fo); entrenamiento derivado de danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. Sobre esa base, el autor aplica primero un modelo resultante de un merge TIES entre variantes entrenadas en danes, islandes, noruego bokmal, noruego nynorsk y sueco, con mayor peso asignado al islandes, y despues un continued pre-training con el subconjunto feroes del dataset FineWeb-2. La eleccion del islandes como pivote responde a su proximidad genealogica e historica con el feroes dentro del grupo germanico norto occidental.

La configuracion de entrenamiento documentada es: 1 epoca por cada idioma fuente y 5 epocas sobre feroes, tasa de aprendizaje 5e-4 con scheduler coseno y warmup ratio de 0,05, batch size 8 con 32 pasos de acumulacion de gradientes (batch efectivo 256), longitud maxima de contexto de 2048 tokens, semilla 2 y una unica GPU A100 de 40 GB. No se documentan fases de RLHF, DPO ni preferencia humana, ni innovaciones de decodificacion o atencion. El identificador indica que existen al menos tres semillas para esta misma configuracion.

## Capacidades

- Generacion de texto autoregresiva en feroes, heredada del ajuste sobre FineWeb-2.
- Conversacion multi-turno basica, al derivar de una variante Instruct de SmolLM2.
- Transferencia linguistica desde lenguas escandinavas continentales e islandes, lo que puede producir comprension parcial de danes, noruego y sueco.
- Razonamiento y matematicas elementales limitados por el tamano de 135 millones de parametros.
- Generacion de codigo muy limitada; no es un modelo orientado a programacion.
- Tool calling y function calling: no documentados ni verificados.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio y modo thinking: no disponibles.

## Casos de uso

- Investigacion en adaptacion de lenguas de bajos recursos: sirve como punto de partida reproducible para estudiar tecnicas de transfer entre lenguas germanicas nortes con presupuesto de una sola GPU A100.
- Generacion de texto sintetico en feroes para aumento de datos: el modelo puede producir frases de relleno en feroes que, tras filtrado humano, alimenten corpus de entrenamiento de modelos mayores.
- Prototipado de asistentes conversacionales en feroes: con 135 millones de parametros cabe en CPU o GPU de gama baja, lo que permite validar interfaces y flujos de conversacion antes de invertir en modelos mayores.
- Normalizacion y reescritura de textos breves en feroes: tareas de parafrasis o reformulacion de frases cortas dentro de la ventana de 2048 tokens.
- Experimentos de destilacion o comparacion de semillas: al existir varias semillas de la misma configuracion, es util para medir varianza de entrenamiento en ajustes de bajo coste.
- Educacion y demos: despliegue en entornos con recursos minimos (por ejemplo, un portatil) para ilustrar el funcionamiento de un modelo de lenguaje entrenado en un idioma minoritario.
- Filtrado y clasificacion ligera de texto feroes: uso como extractor de caracteristicas o generador de etiquetas en pipelines de procesamiento de corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,54 GB solo para pesos (134,5 M x 4 bytes), mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,27 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,13 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) y en CPU con memoria RAM modesta.
- GPU de referencia usada en entrenamiento: una A100 de 40 GB con batch efectivo 256; para inferencia no se requiere ese hardware.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y conversion a GGUF para llama.cpp u Ollama aunque no se publican pesos GGUF en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolLM2-135M ajustado a feroes) | 134,5 M | 2048 | Feroes | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct (base) | 135 M | 8192 (segun ficha original de SmolLM2) | Ingles principal, multilingue limitado | Apache 2.0 | Hugging Face |
| Modelo base del merge (`smollm135m-da05-is1-nno05-nob05-sv05-ties`) | 135 M | 2048 (heredado) | Danes, islandes, noruego, sueco | Apache 2.0 | Hugging Face |
| Otros ajustes de `jekunz` para lenguas nordicas | 135 M | 2048 | Variantes por idioma | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo es para su propia investigacion y que no ha sido evaluado de forma amplia; no debe asumirse calidad de produccion.
- Riesgo elevado de alucinacion y de generar feroes gramaticalmente incorrecto o mezclado con islandes, danes o noruego, dado el origen por transferencia.
- Ventana de contexto de solo 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Capacidad de razonamiento, matematicas y codigo muy limitada por el tamano de 135 millones de parametros.
- Sesgos: no documentados; al entrenar sobre FineWeb-2 pueden persistir sesgos del corpus web, incluyendo sesgos de representacion de hablantes de feroes.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion desaconseja su despliegue en produccion sin validacion propia.
- No se publican pesos cuantizados ni artefactos GGUF, lo que obliga a convertir el modelo para despliegues en llama.cpp u Ollama.
- El identificador sugiere que existen otras semillas de la misma configuracion; conviene comparar antes de fijar una version.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed2
- Modelo base del merge: https://huggingface.co/jekunz/smollm135m-da05-is1-nno05-nob05-sv05-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (base original): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
