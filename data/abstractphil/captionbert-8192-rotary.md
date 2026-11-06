# AbstractPhil/captionbert-8192-rotary

## Resumen

captionbert-8192-rotary es un modelo de embeddings de frases (sentence-similarity) desarrollado por AbstractPhil como parte de una pantalla controlada de posicionamiento posicional sobre CaptionBERT v2. El modelo no es un unico checkpoint, sino un conjunto de cuatro brazos experimentales (A0, A1, A2 y A3) con dos semillas cada uno, entrenados desde cero contra el mismo consenso precalculado de cinco profesores. La inferencia utiliza un unico estudiante y su tokenizador; los profesores no se cargan.

La relevancia del modelo es fundamentalmente metodologica: sirve para comparar el efecto de distintas estrategias de codificacion posicional (posiciones aprendidas, RoPE de token plano, rotary de direccion de frase y su ablacion de ancla) manteniendo constante el resto del pipeline. No se selecciona automaticamente un ganador; se conservan todas las semillas y todos los brazos, incluidos los resultados mas debiles.

El modelo es pequeno (entre 54,1 y 58,3 millones de parametros segun el brazo), esta orientado a ingles, se distribuye bajo licencia MIT y su uso previsto es la generacion de embeddings L2-normalizados de 768 dimensiones para similitud semantica. El repositorio ocupa 8,8 GB e incluye los checkpoints de todos los brazos y semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con variantes de codificacion posicional (aprendida, RoPE de token, rotary de direccion de frase) |
| Parametros totales | 58.308.864 (A0) / 54.114.560 (A1, A2, A3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explicitamente; el benchmark usa un techo de 64 tokens y existe una particion de evaluacion de mas de 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | pesos PyTorch (carga mediante `captionbert_rotary.inference.SentenceEncoder`); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT adaptado a la tarea de similitud de frases. La innovacion central de esta pantalla es la codificacion posicional: A0 usa posiciones aprendidas como replicacion de control; A1 aplica RoPE de token plano; A2 introduce rotary de direccion de frase (sentence-address rotary); y A3 es la ablacion de ancla de A2. Todos los brazos se entrenan desde cero contra el mismo consenso precalculado de cinco profesores (consensus-distillation), con 1.952 pasos por brazo y semilla, y sin cargar los profesores en inferencia.

Los datos de entrenamiento provienen de los datasets `AbstractPhil/conceptual-captions-12m-webdataset-berts` y `AbstractPhil/captionbert-8192-v2-consensus`. El modelo completo v2 de referencia se entreno con 26,9 millones de filas y 52.548 pasos, alcanzando una media de 0,6077 en el benchmark de ocho tareas; esta pantalla rotary es un experimento separado y de menor duracion, cuyo control emparejado es A0. La implementacion vive en el paquete `captionbert-trainer` v0.2.0, que incluye codigo, requisitos, tests y notebooks.

## Capacidades

- Generacion de embeddings de frases de 768 dimensiones, L2-normalizados, para similitud semantica.
- Similitud de frases y recuperacion semantica en ingles.
- Distincion de contenido identico frente a contenido parafraseado mediante direccionamiento por frase (brazos A2 y A3).
- Modelado de dependencias de largo alcance mas alla de 128 tokens (evaluado con la particion de mas de 128 tokens).
- Capacidad de destilacion por consenso de cinco profesores (entrenamiento), no disponible en inferencia.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Busqueda semantica en ingles: indexar documentos y consultas como vectores de 768 dimensiones y recuperar por similitud coseno; el modelo esta disenado especificamente para esta tarea.
- Deduplicacion de textos: detectar parafrasis y duplicados en corpus de captions o descripciones mediante umbrales de similitud sobre embeddings normalizados.
- Clustering de contenido: agrupar descripciones o frases por tema usando la geometria del espacio de embeddings (rango efectivo en torno a 70 en la particion corta).
- Evaluacion de estrategias posicionales: usar los distintos brazos (A0-A3) como referencia reproducible para estudiar el efecto de RoPE y rotary de direccion en tareas de similitud.
- Filtrado de pares de entrenamiento: seleccionar pares positivos y negativos para entrenamiento contrastivo midiendo similitud entre captions.
- Investigacion en destilacion por consenso: replicar el pipeline con el mismo consenso de cinco profesores y comparar la fidelidad de imitacion (cosine to consensus) frente a la capacidad en tarea.
- Recuperacion aumentada en ingles: generar embeddings de pasajes para un sistema RAG de dominio acotado, con la advertencia de que el techo de contexto del benchmark es de 64 tokens.

## Benchmarks y rendimiento

Correlacion de Spearman en las ocho tareas del harness de v2 (techo de 64 tokens). La media es el promedio no ponderado de tareas.

| Brazo / semilla | STS-B | SICK-R | STS12 | STS13 | STS14 | STS15 | STS16 | BIOSSES | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A0 / 1 | 0,4531 | 0,6199 | 0,4476 | 0,4354 | 0,4537 | 0,6350 | 0,4667 | 0,5083 | 0,5025 |
| A0 / 2 | 0,4557 | 0,6224 | 0,4292 | 0,4443 | 0,4470 | 0,6445 | 0,4750 | 0,4291 | 0,4934 |
| A1 / 1 | 0,5057 | 0,6330 | 0,4756 | 0,4316 | 0,4764 | 0,6601 | 0,5166 | 0,4693 | 0,5211 |
| A1 / 2 | 0,4965 | 0,6314 | 0,4769 | 0,4673 | 0,4736 | 0,6689 | 0,5148 | 0,3934 | 0,5153 |
| A2 / 1 | 0,5248 | 0,6339 | 0,4817 | 0,4665 | 0,4946 | 0,6665 | 0,5206 | 0,4607 | 0,5312 |
| A2 / 2 | 0,4864 | 0,6328 | 0,4706 | 0,4405 | 0,4649 | 0,6756 | 0,4949 | 0,4872 | 0,5191 |
| A3 / 1 | 0,5252 | 0,6383 | 0,4741 | 0,4755 | 0,4931 | 0,6685 | 0,5251 | 0,4983 | 0,5373 |
| A3 / 2 | 0,4845 | 0,6352 | 0,4528 | 0,4538 | 0,4751 | 0,6762 | 0,5010 | 0,4168 | 0,5119 |

Metricas de geometria (particion fija de validacion, chunk-61):

| Brazo / semilla | Parametros | Pasos | Cosine held-out | Rango efectivo | Self-cosine | Segundos/paso |
|---|---:|---:|---:|---:|---:|---:|
| A0 / 1 | 58.308.864 | 1952 | 0,7226 | 68,19 | 0,0191 | 0,400 |
| A0 / 2 | 58.308.864 | 1952 | 0,7478 | 71,79 | 0,0181 | 0,400 |
| A1 / 1 | 54.114.560 | 1952 | 0,7459 | 71,34 | 0,0194 | 0,464 |
| A1 / 2 | 54.114.560 | 1952 | 0,7615 | 74,13 | 0,0171 | 0,464 |
| A2 / 1 | 54.114.560 | 1952 | 0,7427 | 71,87 | 0,0204 | 0,464 |
| A2 / 2 | 54.114.560 | 1952 | 0,7635 | 73,77 | 0,0158 | 0,465 |
| A3 / 1 | 54.114.560 | 1952 | 0,7429 | 69,80 | 0,0205 | 0,465 |
| A3 / 2 | 54.114.560 | 1952 | 0,7622 | 73,08 | 0,0169 | 0,465 |

Metricas en la particion de mas de 128 tokens (5.000 filas medidas):

| Brazo / semilla | Cosine >128 tokens | Rango efectivo | Self-cosine |
|---|---:|---:|---:|
| A0 / 1 | 0,6549 | 53,25 | 0,0312 |
| A0 / 2 | 0,6831 | 50,99 | 0,0610 |
| A1 / 1 | 0,6730 | 54,01 | 0,0358 |
| A1 / 2 | 0,6862 | 53,85 | 0,0672 |
| A2 / 1 | 0,6723 | 55,57 | 0,0345 |
| A2 / 2 | 0,6879 | 53,59 | 0,0551 |
| A3 / 1 | 0,6740 | 55,14 | 0,0344 |
| A3 / 2 | 0,6834 | 52,04 | 0,0611 |

Mediciones rotary (protocolo de modelo congelado):

| Brazo / semilla | Error maximo baseline repetido | Colapso por ID de frase (cambio L2 medio) | Eliminacion q/k de ancla (cambio L2 medio) |
|---|---:|---:|---:|
| A0 / 1 | 0,00000000 | n/a | n/a |
| A0 / 2 | 0,00000000 | n/a | n/a |
| A1 / 1 | 0,00000000 | 0,000000 | 0,000000 |
| A1 / 2 | 0,00000000 | 0,000000 | 0,000000 |
| A2 / 1 | 0,00000000 | 0,272284 | 0,116291 |
| A2 / 2 | 0,00000000 | 0,318407 | 0,135013 |
| A3 / 1 | 0,00000000 | 0,000000 | 0,000000 |
| A3 / 2 | 0,00000000 | 0,000000 | 0,000000 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para un unico estudiante (54-58 M de parametros); no se dispone de cifras oficiales de cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; tambien funciona en CPU para lotes pequenos.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: carga mediante el paquete `captionbert-trainer` v0.2.0 (`captionbert_rotary.inference.SentenceEncoder`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el unico dato de coste es el tiempo de entrenamiento de 0,400 s/paso (A0) y 0,464-0,465 s/paso (A1-A3).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmark | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| captionbert-8192-rotary (A3/1) | 54,1 M | no disponible | 0,5373 (8 tareas) | MIT | Hugging Face |
| captionbert-8192-v2 (run completo) | no disponible | no disponible | 0,6077 (8 tareas) | MIT | Hugging Face |
| captionbert-8192-v2-b | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de comparaciones con modelos de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de esta pantalla son claramente inferiores al run completo de v2 (mejor media 0,5373 frente a 0,6077), por lo que no debe usarse como sustituto del modelo completo en produccion.
- La pantalla es corta (1.952 pasos por brazo) y esta pensada como experimento controlado, no como modelo final.
- El benchmark usa un techo de 64 tokens, lo que limita la evaluacion en contextos largos; las metricas de mas de 128 tokens muestran una caida notable del cosine (en torno a 0,65-0,69).
- Solo soporta ingles.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si riesgo de similitudes espurias en dominios fuera de captions.
- No se han documentado sesgos especificos; el entrenamiento sobre Conceptual Captions puede heredar sesgos de ese corpus.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni selecciona un ganador entre brazos.
- El codigo de ancla es un simplex regular y el encoder no fija la coordenada constante del lift ortogonal, lo que puede afectar a la reproducibilidad exacta de algunas mediciones.
- No se documentan formatos cuantizados ni integraciones con servidores de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPhil/captionbert-8192-rotary
- Modelo v2 de referencia: https://huggingface.co/AbstractPhil/captionbert-8192-v2
- Modelo v2-b: https://huggingface.co/AbstractPhil/captionbert-8192-v2-b/tree/main
- Repositorio de entrenamiento: https://github.com/AbstractEyes/captionbert-trainer/tree/v0.2.0
- Documento tecnico de mediciones rotary: https://github.com/AbstractEyes/captionbert-trainer/blob/v0.2.0/docs/rotary_measurements.md
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/conceptual-captions-12m-webdataset-berts
- Dataset de consenso: https://huggingface.co/datasets/AbstractPhil/captionbert-8192-v2-consensus
