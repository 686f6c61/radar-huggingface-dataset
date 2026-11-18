# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed1

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed1` es un ajuste fino de SmolLM2-360M-Instruct orientado a la generacion de texto en faroes (fo), una lengua nordica occidental con muy pocos recursos digitales. Lo desarrolla el usuario jekunz como parte de una linea de experimentos de adaptacion linguistica de bajo coste sobre modelos pequenos, y se distribuye con licencia Apache 2.0. El modelo parte de un checkpoint intermedio (`smollm360m-da05-is1-nno05-nob05-sv05-ties`) obtenido mediante un merge TIES de variantes entrenadas en danes, islandes, noruego bokmal, noruego nynorsk y sueco, con mayor peso para el islandes.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de transferencia cross-lingue (aprovechar lenguas nordicas mejor representadas para llegar al faroes) sobre una arquitectura transformer decoder-only de 361.821.120 parametros; por otro, ejemplifica el flujo tipico de continual pre-training sobre corpus web (FineWeb-2) en un unico A100 de 40 GB. No es un modelo de proposito general: el autor lo describe como material de investigacion sin evaluacion amplia, y su utilidad practica se limita a experimentos de NLP para lenguas de bajos recursos.

Con 360M de parametros y una ventana de contexto de 2048 tokens, el modelo se situa en la gama ultraligera, apta para ejecucion en CPU y GPU de consumo. Su interes no esta en competir con modelos frontier, sino en servir de base reproducible para estudiar estrategias de adaptacion linguistica en escenarios con datos escasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivado de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en el formato original) |
| Idiomas soportados | Faroes (fo); entrenamiento previo en danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama, heredada de SmolLM2-360M-Instruct: atencion multi-cabeza con RoPE, capas pre-norm y embeddings de tokens compartidos con la cabeza de salida. El modelo base intermedio es un merge TIES de cinco variantes entrenadas sobre porciones linguisticas de FineWeb-2 (danes, islandes, noruego bokmal, noruego nynorsk y sueco), con mayor peso asignado al islandes, presumiblemente por su proximidad genealogica al faroes.

El ajuste fino se realizo en dos fases: primero sobre el merge TIES (una epoca por lengua de origen) y despues sobre la porcion de faroes de FineWeb-2 durante cinco epocas. La configuracion reportada es: learning rate 5e-4, scheduler coseno, warmup ratio 0.05, batch size 8 con 32 pasos de acumulacion de gradientes (batch efectivo 256), longitud maxima de 2048 tokens, semilla 1 (una de tres semillas para esta configuracion) y un unico A100 de 40 GB. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO posteriores al continual pre-training.

## Capacidades

- Generacion de texto autoregresiva en faroes, con capacidad de continuar prompts y producir parrafos coherentes dentro de la ventana de 2048 tokens.
- Conversacion basica heredada del checkpoint Instruct original, aunque el ajuste continuado sobre texto web puede haber degradado parte del formato de chat.
- Transferencia cross-lingue: al haber sido entrenado sobre un merge de lenguas nordicas, conserva cierta capacidad de generar texto en danes, sueco, noruego e islandes, aunque no esta garantizado ni evaluado.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni otras modalidades.
- Capacidades multilingues limitadas al ambito nordico descrito; no se reporta cobertura de castellano ni de otras familias linguisticas.
- No se documenta soporte de agentes ni de razonamiento multi-paso.

## Casos de uso

- Investigacion en NLP para lenguas de bajos recursos: el modelo sirve como punto de partida reproducible para estudiar tecnicas de transferencia cross-lingue (merge TIES + continual pre-training) en faroes, con una configuracion de entrenamiento documentada y semillas multiples.
- Generacion de texto sintetico en faroes: puede utilizarse para aumentar corpus de entrenamiento o evaluacion en tareas de modelado del lenguaje, siempre con revision humana dado el riesgo de alucinacion.
- Experimentos de ablation sobre merges de modelos: al existir tres semillas para la misma configuracion, permite medir la varianza del entrenamiento y comparar estrategias de mezcla de pesos (TIES frente a otras tecnicas).
- Prototipado de completado de texto en aplicaciones editoriales faroesas: con 360M de parametros puede ejecutarse en CPU o GPU de consumo para sugerencias de continuacion en herramientas de escritura, con latencia baja.
- Base para ajuste fino supervisado posterior en tareas concretas (clasificacion, resumen, traduccion): el checkpoint puede servir de inicializacion en pipelines de fine-tuning con datasets pequenos en faroes.
- Docencia y formacion: por su tamano reducido y su licencia permisiva, es adecuado para cursos de NLP que quieran ilustrar el ciclo completo de adaptacion linguistica sin requerir infraestructura grande.
- Evaluacion comparativa de tokenizadores y cobertura lexica: util para analizar como SmolLM2-360M maneja la morfologia y el lexico faroes frente a otras lenguas nordicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB de pesos, mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contextos de 2048 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,4 GB de pesos; en 4 bits, alrededor de 0,2 GB (aunque no se distribuyen pesos cuantizados oficialmente).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien cabe holgadamente en A100 y H100, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo sin problema, e incluso en CPU con un rendimiento aceptable para generacion de texto no interactiva.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp u Ollama tras conversion a GGUF, aunque no se proporcionan artefactos de conversion en el repo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed1 | 361.821.120 | 2048 | fo (y nordicas en el base) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct (modelo de partida) | ~360M | 2048 | en (principalmente) | Apache 2.0 | Hugging Face |
| Modelos especificos para faroes de mayor tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoria; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion amplia: el propio autor indica que no ha sido evaluado de forma extensa, por lo que su calidad en tareas reales es desconocida.
- Riesgo elevado de alucinacion: al ser un modelo de 360M ajustado sobre texto web, la coherencia factica y la fidelidad a las fuentes son limitadas.
- Posible degradacion del formato conversacional: el continual pre-training sobre FineWeb-2 puede haber erosionado el comportamiento Instruct original.
- Sesgos desconocidos: no se documenta analisis de sesgos; al entrenarse sobre corpus web, es probable que herede sesgos de genero, culturales y geopoliticos presentes en FineWeb-2.
- Cobertura linguistica restringida: el idioma objetivo es el faroes; el rendimiento en castellano u otras lenguas no esta evaluado y probablemente sea deficiente.
- Ventana de contexto corta (2048 tokens): insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Licencia Apache 2.0 permisiva para uso comercial, pero la falta de evaluacion y las posibles obligaciones derivadas del corpus FineWeb-2 aconsejan revisar las condiciones del dataset antes de un despliegue en produccion.
- No se distribuyen pesos cuantizados ni scripts de conversion; el usuario debe generarlos por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed1
- Modelo base del ajuste: https://huggingface.co/jekunz/smollm360m-da05-is1-nno05-nob05-sv05-ties
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo de partida de la familia: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
