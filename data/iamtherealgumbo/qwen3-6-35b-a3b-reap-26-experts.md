# IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-26-experts

## Resumen

Qwen3.6-35B-A3B-REAP-26-experts es una variante podada del modelo MoE multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario IAmTheRealGumbo. La poda se ha realizado con REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999), un metodo que puntua cada experto segun la media de su peso de router multiplicado por la norma L2 de su salida, y elimina los de menor puntuacion en cada capa. En esta variante se conservan solo 26 de los 256 expertos enrutados por capa (10%) en cada una de las 40 capas MoE, lo que reduce los parametros totales de 35,95B a 6,15B y el checkpoint en bf16 de 71,9 GB a 12,3 GB.

El modelo mantiene la topologia de enrutamiento original: cada token sigue pasando por 8 expertos, de modo que los parametros activos se quedan en torno a 3B. Tambien se conservan sin cambios las capas de atencion y atencion lineal, el experto compartido de cada capa MoE, el codificador de vision (0,45B de parametros), el tokenizador y la plantilla de chat. Se elimino la cabeza de prediccion multi-token (MTP), por lo que no hay decodificacion especulativa MTP disponible con este checkpoint. No se aplico ningun fine-tuning posterior a la poda.

La relevancia de esta ficha es fundamentalmente negativa y documental: el propio autor advierte de que la variante esta "fuertemente degradada y no es apta para uso general". En HumanEval resuelve 15 de 164 problemas (9,1% pass@1) frente al 94,5% del modelo sin podar, y en 113 de los 164 prompts devuelve una respuesta vacia. Se publica para mostrar donde falla REAP en este modelo; para uso real el autor recomienda la variante de 128 expertos o superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal de la familia `qwen3_5_moe`, con capas de atencion y de atencion lineal; 40 capas MoE |
| Parametros totales | 6.147.642.736 (~6,15B), incluidos 0,45B del codificador de vision |
| Parametros activos | ~3B (8 expertos enrutados por token, igual que el modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint en bf16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), tamano de repo 12,3 GB |
| Expertos por capa | 26 de 256 (10%), en 40 capas MoE |
| Cabeza MTP | eliminada (sin decodificacion especulativa MTP) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.6-35B-A3B: un transformer con mezcla de expertos (MoE) de tipo `qwen3_5_moe`, que combina capas de atencion y capas de atencion lineal, con 40 capas MoE, 256 expertos enrutados por capa, top-8 en el router y un experto compartido por capa. Incluye ademas un codificador de vision de 0,45B de parametros, lo que habilita la entrada imagen-texto. Esta variante no modifica nada de esa estructura: unicamente se han recortado las filas del router y los tensores de los expertos descartados, manteniendo el resto de pesos intactos.

El proceso de poda consistio en puntuar cada experto con REAP (media del peso de la puerta del router multiplicado por la norma L2 de la salida del experto, sobre los tokens enrutados a el), renormalizando los pesos top-k del router durante el calculo para replicar el enrutamiento real del modelo. Se eliminan los expertos con menor puntuacion de cada capa junto con sus filas del router. La calibracion uso 1024 muestras de theblackcat102/evol-codealpaca-v1 (instrucciones de codigo), de hasta 2048 tokens cada una, con semilla 42; todas las variantes publicadas provienen de la misma pasada de calibracion. El codigo utilizado es CerebrasResearch/reap con modificaciones locales para soportar la arquitectura Qwen3.5/3.6 MoE (tensores de expertos apilados), y los argumentos exactos quedan registrados en `reap_args.yaml` dentro del repositorio. No hubo entrenamiento posterior ni destilacion: el checkpoint es puramente el resultado del recorte.

## Capacidades

- Generacion de texto conversacional y razonamiento de un solo turno, heredados del modelo base, aunque severamente degradados por la poda.
- Generacion de codigo: capacidad practicamente destruida en esta variante (9,1% pass@1 en HumanEval, con respuestas vacias en el 69% de los prompts).
- Entrada multimodal imagen-texto: el codificador de vision y el proyector se conservan intactos, por lo que la ruta de entrada de imagen sigue existiendo a nivel de arquitectura, aunque no se ha evaluado su calidad tras la poda.
- Modo thinking: la plantilla de chat del modelo base se mantiene, incluido el flag `enable_thinking`, pero no se han publicado evaluaciones con thinking activado.
- Tool calling y uso agentico: teoricamente soportados por herencia del modelo base, sin evaluacion disponible y con alta probabilidad de degradacion.
- Multilingue: sin datos; la calibracion se hizo exclusivamente con datos de codigo en ingles, por lo que el sesgo de seleccion de expertos favorece ese dominio.

## Casos de uso

- Estudio del colapso de la poda REAP: sirve como caso extremo de referencia para investigar por que el rendimiento se derrumba entre el 25% y el 10% de expertos retenidos (de 85,4% a 9,1% en HumanEval), comparando el comportamiento del router y de los expertos supervivientes.
- Analisis de respuestas vacias en modelos MoE podados: los 113 de 164 prompts de HumanEval que terminan sin contenido permiten estudiar fallos de plantilla de chat, de token EOS o de enrutamiento degenerado.
- Verificacion de pipelines de evaluacion: un modelo con un pass@1 tan bajo y tan reproducible es util para validar que un arnes de evaluacion (por ejemplo, openai/human-eval con vLLM) detecta correctamente salidas vacias y fallos.
- Pruebas de integracion de despliegue a baja VRAM: con 10,7 GiB de pesos en vLLM, permite validar configuraciones de serving, plantillas y limites de tokens en hardware modesto antes de pasar a variantes mayores.
- Docencia y divulgacion sobre compresion de modelos: ilustra de forma cuantitativa el compromiso entre tamano, VRAM y calidad en un MoE multimodal.
- Baseline negativo en experimentos de recuperacion: punto de partida para medir si un fine-tuning o una destilacion posterior consigue recuperar capacidad en un modelo podado al 10%.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, agentes ni ninguna tarea de usuario final, segun la advertencia explicita del autor.

## Benchmarks y rendimiento

Unica evaluacion publicada: HumanEval completo (164 problemas), pass@1, decodificacion greedy (temperatura 0), thinking desactivado, maximo 1024 tokens nuevos, servido con vLLM 0.19 en una NVIDIA DGX Spark (GB10) y puntuado con openai/human-eval.

| Modelo | Expertos/capa | Retenidos | Params totales | Tamano (bf16) | VRAM pesos en vLLM | HumanEval pass@1 |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.6-35B-A3B (sin podar) | 256 | 100% | 35,95B | 71,9 GB | 64,7 GiB | 94,5% (155/164) |
| REAP-231-experts | 231 | 90% | 31,96B | 63,9 GB | 58,8 GiB | 95,1% (156/164) |
| REAP-192-experts | 192 | 75% | 27,05B | 54,1 GB | 49,7 GiB | 93,3% (153/164) |
| REAP-128-experts | 128 | 50% | 18,99B | 38,0 GB | 34,7 GiB | 94,5% (155/164) |
| REAP-64-experts | 64 | 25% | 10,93B | 21,9 GB | 19,7 GiB | 85,4% (140/164) |
| **REAP-26-experts (este modelo)** | **26** | **10%** | **6,15B** | **12,3 GB** | **10,7 GiB** | **9,1% (15/164)** |
| REAP-8-experts | 8 | 3% | 3,88B | 7,8 GB | 6,5 GiB | 0,0% (0/164) |

Notas del autor: dos ejecuciones identicas del modelo sin podar dieron 93,9% y 94,5%, por lo que diferencias de 1-2 problemas (~1 punto) estan dentro del ruido; las variantes de 231, 192 y 128 expertos no son distinguibles del modelo sin podar en este benchmark. La VRAM indicada es solo la memoria de pesos que reporta vLLM al cargar, sin contar la cache KV. No se han publicado resultados de MMLU, GSM8K, evaluaciones multimodales ni de otros dominios.

## Requisitos de hardware

- VRAM estimada para inferencia: ~10,7 GiB solo de pesos en bf16 segun vLLM; con cache KV y overhead de runtime, un presupuesto practico de 14-20 GiB para contexto moderado.
- GPU recomendadas: NVIDIA DGX Spark (GB10) es la plataforma usada por el autor; cualquier GPU con 16 GB o mas es suficiente para los pesos (RTX 4080, RTX 4090, L4, L40S, A10G, A100 40GB, H100).
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con margen amplio y en tarjetas de 16 GB en bf16; en 12 GB requeriria cuantizacion, que no esta publicada.
- Opciones de despliegue: vLLM (`vllm serve IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-26-experts`) y transformers 5 o superior con `AutoModelForImageTextToText` y `AutoProcessor`. No se documentan soporte de llama.cpp, Ollama, TGI ni GGUF para este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Con ~3B parametros activos por token, el coste por token deberia ser similar al del modelo base sin podar, ya que el top-8 del router no cambia.
- Almacenamiento: 12,3 GB de safetensors en bf16.

## Comparativa con modelos similares

| Modelo | Params totales | Expertos/capa | Contexto | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| REAP-26-experts (este) | 6,15B | 26 de 256 | no disponible | 9,1% | Apache 2.0 | HuggingFace |
| REAP-64-experts | 10,93B | 64 de 256 | no disponible | 85,4% | Apache 2.0 | HuggingFace |
| REAP-128-experts | 18,99B | 128 de 256 | no disponible | 94,5% | Apache 2.0 | HuggingFace |
| Qwen3.6-35B-A3B (base) | 35,95B | 256 de 256 | no disponible | 94,5% | Apache 2.0 | HuggingFace |

La comparacion directa muestra que el punto de ruptura de REAP en este modelo esta entre el 25% y el 10% de expertos retenidos: pasar de 64 a 26 expertos por capa reduce los parametros un 44% pero hunde HumanEval de 85,4% a 9,1%. En la franja del 50-90% de retencion la perdida es indistinguible del ruido de evaluacion. No se dispone de datos de contexto ni de otros benchmarks para ninguna de las variantes, por lo que no es posible comparar fuera de HumanEval.

## Limitaciones y advertencias

- Modelo explicitamente degradado: el autor advierte que no es apto para uso general y recomienda la variante de 128 expertos o mayores para cualquier uso real.
- HumanEval pass@1 del 9,1% frente al 94,5% del modelo sin podar; 113 de 164 prompts producen respuesta vacia, y de las 51 respuestas no vacias solo 15 son correctas.
- Sesgo de dominio en la calibracion: los 1024 ejemplos de evol-codealpaca-v1 son exclusivamente de codigo, por lo que la seleccion de expertos favorece ese dominio y matematicas, multilingue, chat general y uso agentico pueden degradarse aun mas de lo que sugiere HumanEval.
- Evaluacion incompleta: solo se ha medido HumanEval. No hay datos de matemáticas, multilingue, tool calling ni de comprension de imagen o video, pese a que el codificador de vision se conserva sin cambios.
- HumanEval es un benchmark pequeno (164 problemas) y saturado para esta familia, por lo que no detecta regresiones pequenas; un resultado como este, en cambio, es una senal clara de colapso.
- Sin decodificacion especulativa MTP: la cabeza de prediccion multi-token se elimino y no puede recuperarse sin volver a entrenarla.
- Riesgo elevado de alucinacion y de respuestas degeneradas o truncadas: el modo de fallo observado (respuesta vacia inmediata) es compatible con problemas de enrutamiento tras el recorte.
- Sin fine-tuning de recuperacion: no se ha aplicado ninguna correccion posterior a la poda, por lo que los expertos supervivientes no estan reajustados a la nueva topologia.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; sin embargo, el estado del modelo hace inviable ese uso en la practica.
- No se documentan versions cuantizadas, por lo que el despliegue en hardware de menos de 12 GB no esta cubierto por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-26-experts
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante de 231 expertos: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-231-experts
- Variante de 192 expertos: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-192-experts
- Variante de 128 expertos: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-128-experts
- Variante de 64 expertos: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-64-experts
- Variante de 8 expertos: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-8-experts
- Paper de REAP: https://arxiv.org/abs/2510.13999
- Codigo de REAP: https://github.com/CerebrasResearch/reap
- Dataset de calibracion: https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
- Arnes de evaluacion HumanEval: https://github.com/openai/human-eval
