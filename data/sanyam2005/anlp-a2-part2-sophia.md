# sanyam2005/anlp-a2-part2-sophia

## Resumen

El modelo `sanyam2005/anlp-a2-part2-sophia` es un transformer denso decoder-only de 27.269.632 parámetros entrenado desde cero por el usuario sanyam2005. Se trata de un artefacto académico: forma parte de la Parte 2 de la asignatura Advanced NLP (ANLP), cuyo objetivo es implementar desde cero un optimizador basado en Hessiano (Sophia) y aplicarlo al preentrenamiento de un modelo de lenguaje causal. No es un modelo pensado para uso general ni para producción, sino una entrega de laboratorio reproducible.

El entrenamiento se realizó sobre el corpus `browndw/human-ai-parallel-corpus` durante una sola pasada (1x dataset), consumiendo 41.648.128 tokens. El resultado reportado por el autor es una pérdida de validación final de 4,9177 y un BLEU de test de 0,96 en continuaciones de 64 tokens. Los hiperparámetros del optimizador son `lr=0.0005`, `betas=[0.965, 0.99]`, `rho=0.04`, `weight_decay=0.1` y `hessian_interval=10`.

Su relevancia es exclusivamente experimental y didáctica: sirve para auditar el comportamiento del optimizador Sophia frente a alternativas como AdamW en un régimen de cómputo muy reducido, y como referencia para comparar con otras entregas de la misma tarea publicadas en Hugging Face. No dispone de licencia declarada, no tiene pipeline asignado y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (causal LM) |
| Parametros totales | 27.269.632 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Tokens de entrenamiento | 41.648.128 |
| Dataset de entrenamiento | `browndw/human-ai-parallel-corpus` (1x) |
| Optimizador | Sophia (basado en Hessiano), implementado desde cero |
| Etiquetas | safetensors, causal-lm, optimizers, anlp-assignment-2, en, region:us |

## Arquitectura y entrenamiento

La model card describe un transformer denso decoder-only entrenado desde cero, sin especificar el numero de capas, dimensiones ocultas, cabezas de atencion, vocabulario ni mecanismo posicional. Tampoco se indica si emplea embeddings atados, normalizacion pre-norm o post-norm, ni si usa RMSNorm o LayerNorm. Toda esa informacion se considera no disponible. El unico dato estructural confirmado es el recuento de parametros leido de los tensores safetensors: 27.269.632.

El aspecto diferencial del trabajo no es la arquitectura, sino el optimizador: Sophia, un metodo de segundo orden aproximado que usa estimaciones de la diagonal del Hessiano para escalar la actualizacion de cada parametro, con un intervalo de recalculo (`hessian_interval`) de 10 pasos. El entrenamiento uso una unica pasada sobre `browndw/human-ai-parallel-corpus` con objetivo de modelado de lenguaje causal, 41,6 millones de tokens y una tasa de aprendizaje de 5e-4 con decaimiento de peso 0,1. No se menciona el uso de RLHF, DPO, instrucciones ni ajuste posterior: es un modelo puramente preentrenado en texto.

## Capacidades

- Generacion de texto en ingles: continuacion de secuencias cortas (el autor evalua continuaciones de 64 tokens), sin control de estilo ni formato.
- Modelado de lenguaje causal: asignacion de probabilidad al siguiente token, util para calcular perplejidad y como banco de pruebas.
- Ninguna capacidad de razonamiento verificada: no hay evaluaciones de matematicas, logica ni sentido comun publicadas.
- Codigo: no disponible; no se reporta entrenamiento sobre corpus de programacion ni evaluacion tipo HumanEval.
- Tool calling / function calling: no soportado. No hay plantilla de chat, ni tokens especiales de herramienta, ni pipeline de inferencia declarado.
- Agentes y razonamiento multi-paso: no soportado.
- Multilingue: no. El modelo esta etiquetado unicamente como `en`.
- Capacidades especiales (modo thinking, vision, audio): ninguna. No hay componente multimodal ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion de experimentos de optimizacion: el modelo permite verificar si el optimizador Sophia, con los hiperparametros declarados, alcanza la perdida de validacion reportada (4,9177) sobre `browndw/human-ai-parallel-corpus`. Es su uso principal y esta respaldado por los numeros de la model card.
- Ablacion de optimizadores en regimen de bajos recursos: con 27,3 M de parametros y 41,6 M de tokens, un ciclo completo de entrenamiento es asequible en una sola GPU de gama media, lo que permite comparar Sophia frente a AdamW manteniendo arquitectura y datos constantes.
- Pruebas de humo (smoke tests) de infraestructura de entrenamiento: sirve para validar pipelines de tokenizacion, checkpointing, carga de safetensors y calculo de metricas antes de escalar a modelos mayores.
- Analisis de convergencia y estabilidad: el par (perdida de validacion 4,9177, BLEU 0,96) actua como referencia cuantitativa para estudiar como varia el resultado al modificar `rho`, `hessian_interval` o el decaimiento de peso.
- Estudio de corpus paralelo humano-IA: al haberse entrenado sobre un corpus de ese tipo, permite inspeccionar que distribucion aprende el modelo y si reproduce sesgos de estilo del corpus, con continuaciones de 64 tokens como unidad de analisis.
- Material docente: ilustra de forma tangible la diferencia entre un modelo de 27 M de parametros y los LLM actuales, y sirve como ejemplo minimo de transformer decoder-only entrenado desde cero en un curso de NLP.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, RAG ni despliegue comercial: carece de licencia declarada, de contexto documentado y de calidad verificada.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas internas de entrenamiento. No hay resultados de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar.

| Metrica | Valor | Condiciones |
|---|---|---|
| Perdida de validacion final | 4,9177 | 1x `browndw/human-ai-parallel-corpus` |
| BLEU de test | 0,96 | Continuacion de 64 tokens |

No se han publicado resultados de benchmarks en la informacion disponible. La perdida de validacion de 4,9177 corresponde a una perplejidad aproximada de `e^4,9177 ≈ 136,7`, coherente con un modelo muy pequeno entrenado con un presupuesto de tokens limitado.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 110 MB en fp32 y unos 55 MB en fp16, calculado a partir de 27,27 M de parametros (los pesos por si solos). Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria. El modelo cabe sobradamente en una GTX 1650, RTX 3060, RTX 4090, A100 o H100; no requiere aceleradores de centro de datos.
- Consumer GPU: si, cabe en practicamente cualquier GPU de consumo e incluso en CPU. El repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: no hay pipeline declarado ni archivos GGUF. El formato publicado es safetensors, por lo que el despliegue directo pasa por `transformers` (con una clase y configuracion que no se detallan) o por cargar los tensores manualmente. vLLM, llama.cpp, Ollama y TGI no estan confirmados como compatibles.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

Existen otras entregas publicas de la misma tarea (ANLP Assignment 2, Parte 2, variante Sophia), lo que permite una comparacion directa dentro de la misma categoria experimental.

| Modelo | Parametros | Tokens de entrenamiento | Optimizador | Licencia | Datos publicados |
|---|---|---|---|---|---|
| `sanyam2005/anlp-a2-part2-sophia` | 27,27 M | 41,65 M | Sophia | no disponible | val loss 4,9177; BLEU 0,96 |
| `irishbumfuzzle/anlp-a2-p2-sophia` | 35,7 M (D=512, 6 capas, 8 cabezas, vocab 32768, embeddings atados) | 9,72 M | Sophia | no disponible | no disponible en los resultados de busqueda |
| `Vatsavsrivatsav/anlp-a2-p2-sophia` | no disponible | 1x `browndw/human-ai-parallel-corpus` | Sophia | no disponible | no disponible en los resultados de busqueda |

La comparacion es limitada: solo se conocen con detalle la arquitectura del modelo de `irishbumfuzzle` y las metricas del modelo de `sanyam2005`. Fuera de esta familia de ejercicios academicos, no se dispone de comparaciones con modelos de proposito general del mismo orden de parametros, ya que las tareas y los datos no son equiparables.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifican condiciones de uso, redistribucion ni explotacion comercial. Tratalo como material academico no licenciado hasta que el autor lo aclare.
- Modelo de 27,27 M de parametros entrenado con 41,65 M de tokens: su capacidad de generalizacion es muy reducida. Una perdida de validacion de 4,9177 implica una calidad de generacion baja fuera del corpus de entrenamiento.
- Riesgo alto de alucinacion y de texto incoherente: no ha pasado por ajuste por instrucciones ni por ninguna fase de alineacion (RLHF, DPO), por lo que no sigue ordenes y no distingue entre hecho y fabulacion.
- Contexto desconocido: la longitud de contexto no se documenta, lo que impide garantizar un comportamiento fiable en secuencias largas o en conversaciones multiturno.
- Solo ingles: no hay evidencia de competencia en castellano ni en ningun otro idioma.
- Sesgos no evaluados: el corpus `browndw/human-ai-parallel-corpus` contiene texto humano y de IA en paralelo, pero no se ha publicado ningun analisis de sesgos, toxicidad o memorizacion de datos.
- Sin pipeline ni plantilla de chat: no es directamente utilizable como asistente conversacional; requiere construir el prompt a mano.
- Cero adopcion (0 descargas, 0 likes): no hay comunidad que haya validado los resultados ni reportado fallos.
- Metrica BLEU de 0,96 no comparable con estandares: se calculo sobre continuaciones de 64 tokens de un unico conjunto de test, no sobre benchmarks reconocidos.
- Fecha de publicacion inusual (2026-10-01 en los metadatos): no afecta al uso, pero conviene verificar la procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanyam2005/anlp-a2-part2-sophia
- Variante de la misma tarea: https://huggingface.co/Vatsavsrivatsav/anlp-a2-p2-sophia
- Variante de la misma tarea: https://huggingface.co/irishbumfuzzle/anlp-a2-p2-sophia
- Dataset citado en la model card: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Material del curso sobre agentes (ANLP): https://junjiehu.github.io/cs769-fall25/assets/pdf/anlp-22-agents.pdf
- Material del curso sobre representaciones (ANLP): https://cmu-l3.github.io/anlp-spring2026/static_files/anlp-s2026-02-representations.pdf
- Ai2 Asta (asistente de investigacion citado en la busqueda, no relacionado con el modelo): https://asta.allen.ai/
