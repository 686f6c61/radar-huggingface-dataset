# asatheesh/latent-mas-aligner-gemma-2-2b-it-seed-0

## Resumen

LatentMAS Aligner (checkpoint `asatheesh/latent-mas-aligner-gemma-2-2b-it-seed-0`) es un artefacto de investigacion para la seguridad de sistemas multi-agente (MAS) cuyos agentes se comunican en espacio latente en lugar de en lenguaje natural. El problema que aborda es concreto: cuando los mensajes entre agentes son estados ocultos, la moderacion basada en texto no puede inspeccionarlos sin decodificarlos previamente. Este modulo lee directamente los latentes previos al agente Judger y los proyecta al espacio de representacion de una cola clasificadora Llama-Guard congelada, devolviendo una probabilidad `p_unsafe` para la comunicacion.

El modelo lo publica el usuario de HuggingFace `asatheesh` y deriva de `google/gemma-2-2b-it` como modelo objetivo, con una dimension latente declarada de 2304. No es un modelo generativo ni un LLM: es un cabezal de alineacion de seguridad de tamano reducido (repo de 0,1 GB) que se distribuye como un unico fichero PyTorch `aligner.pt`. Su relevancia actual es acotada pero especifica: cubre un hueco poco explorado, la auditoria de seguridad de trafico inter-agente que no es texto, y lo hace con un diseno de pooling que acepta un numero variable de agentes sin reentrenamiento.

El checkpoint se enmarca en un estudio de topologia x semilla, con variantes publicadas por otro autor (`YuanXiaopang/latentmas-aligner-qwen3-4b`). Se publica bajo licencia Apache 2.0 y cuenta con 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como material de investigacion sin validacion externa. La model card presenta varias inconsistencias internas relevantes que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo de alineacion sobre latentes: pooling con una unica query aprendible que atiende sobre K tokens latentes, dimension oculta 4096, salida `[B, 4096]` alimentada a una cola clasificadora Llama-Guard-3-8B congelada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo autoregresivo; procesa K tokens latentes, con K = 8 pasos latentes x numero de agentes pre-Judger) |
| Tipos de cuantizacion | no disponible; se distribuye un unico checkpoint PyTorch sin versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en la model card y en los tags) |
| Formato de pesos | PyTorch (`aligner.pt`, diccionario con `{d_a, d_g, hidden_dim, pool, state_dict}`) |
| Dimension latente de entrada (`d_a`) | 2304 segun la tabla de arquitectura y la tabla del checkpoint (gemma-2-2b-it); 2560 segun la seccion de limitaciones (Qwen3-4B) |
| Dimension de salida | 4096 |
| Modelo objetivo | google/gemma-2-2b-it |
| Cola clasificadora | Llama-Guard-3-8B congelada, no incluida en el repositorio |
| Datos de entrenamiento | Rollouts secuenciales de MAS latente con 3 agentes, etiquetas de harm-compliance |
| Hiperparametros de entrenamiento | Pesos de clase 1:10, 60 epocas, learning rate 3e-4, batch 512, seed 0 |
| Semilla | 0 |
| AUC de validacion | 0,9251 |
| Umbral `tau` @ fpr10 | 0,8951566815 |
| Tamano del repositorio | 0,1 GB |
| Libreria | pytorch |

## Arquitectura y entrenamiento

La pieza central es un mecanismo de pooling con una unica query aprendible que atiende sobre los K tokens latentes de entrada, `h_a` con forma `[B, K, 2560]`, donde K equivale a 8 pasos latentes multiplicado por el numero de agentes previos al Judger. La salida del pooling es un vector de dimension 4096 que se inyecta en la cola de un clasificador Llama-Guard-3-8B congelado. Al atender sobre un numero variable de tokens, un unico checkpoint admite cualquier numero de agentes `N` sin reentrenar ni reformar tensores: los mismos pesos sirven para cadenas de 3 agentes y para DAGs de tipo branch-and-fuse de 9 agentes. Esta propiedad es el principal argumento de diseno del artefacto.

El entrenamiento se realizo sobre rollouts de MAS latente con topologia secuencial de 3 agentes y etiquetas de harm-compliance, con pesos de clase 1:10 (compensando el desbalance hacia la clase segura), 60 epocas, learning rate 3e-4, batch de 512 y semilla 0. No se documentan en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni el uso de RLHF, DPO u otra fase de alineacion adicional. Tampoco se detalla el procedimiento de calibracion del umbral mas alla de la recomendacion de fijarlo a partir de los cuantiles de `p_unsafe` sobre trafico benigno propio, por ejemplo el percentil 95 para una tasa de flag del 5 %.

## Capacidades

- Deteccion de contenido inseguro en comunicaciones inter-agente expresadas como latentes, sin necesidad de decodificarlas a tokens.
- Salida de una probabilidad calibrable `p_unsafe` por comunicacion, utilizable con un umbral `tau` configurable en despliegue.
- Inyeccion de un aviso de seguridad antes del agente agregador final cuando `p_unsafe > tau`.
- Generalizacion a distinto numero de agentes sin reentrenamiento, gracias al pooling sobre K tokens latentes de cardinalidad variable.
- Funcionamiento como componente de un estudio topologia x semilla, comparable contra otras variantes del mismo framework.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo de lenguaje.
- No se documenta soporte de tool calling, function calling ni orquestacion de agentes por parte de este checkpoint.
- No se documentan capacidades multilingues.

## Casos de uso

- Moderacion de trafico inter-agente en sistemas multi-agente latentes: el modulo lee los latentes previos al Judger, calcula `p_unsafe` y, si supera el umbral, inyecta un aviso antes del agente agregador final, cubriendo un punto ciego de la moderacion basada en texto.
- Guardrail de inferencia en pipelines de agentes: integrado como paso previo a la agregacion final, con `tau` calibrado sobre el trafico benigno propio del despliegue (por ejemplo, percentil 95 para una tasa de flag del 5 %).
- Auditoria y red-teaming de MAS: generacion de trafico adversarial contra cadenas de 3 a 9 agentes y medicion de recall a una tasa fija de falsos positivos, usando el punto de operacion `tau` = 0,8951566815 (fpr10) como referencia.
- Estudio controlado de topologias y semillas: comparacion de este checkpoint secuencial con las variantes branch-and-fuse y con otros seeds del repositorio fuente, manteniendo fijo el resto del pipeline.
- Investigacion de interpretabilidad en espacio latente: la query aprendible del pooling permite analizar que posiciones latentes correlacionan con la etiqueta de harm-compliance.
- Calibracion de umbrales por despliegue: uso de la distribucion empirica de `p_unsafe` sobre trafico propio para fijar `tau`, dado que el umbral no es una propiedad fija del modelo.
- Validacion metodologica en publicaciones sobre seguridad de agentes: reproduccion de la tabla de `tau`/recall/over-refusal publicada para esta semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el artefacto no es un modelo de lenguaje. Los unicos datos de rendimiento documentados son los siguientes:

| Metrica | Valor |
|---|---|
| AUC de validacion | 0,9251 |
| `tau` @ fpr10 | 0,8951566815 |
| Semilla | 0 |
| Modelo objetivo | google/gemma-2-2b-it (d_a = 2304) |
| Recall / over-refusal a otros umbrales | no disponible en esta ficha; la model card remite a la tabla del repositorio fuente |

## Requisitos de hardware

- Aligner: el repositorio completo ocupa 0,1 GB, por lo que el modulo cabe holgadamente en CPU y en cualquier GPU con menos de 1 GB de VRAM libre.
- Cola Llama-Guard-3-8B congelada: no se incluye en el repositorio y debe aportarse aparte; con 8 000 millones de parametros requiere aproximadamente 16 GB de VRAM en bf16/fp16, unos 8-9 GB en cuantizacion de 8 bits y unos 5-6 GB en 4 bits (estimaciones no confirmadas por la model card).
- GPU recomendadas para el conjunto completo: A100 40 GB, H100, L40S o RTX 4090 24 GB para servir la cola de 8B en precision casi nativa.
- Cabe en GPU de consumo: si, la RTX 4090 o la RTX 3090 (24 GB) alojan la cola de 8B sin cuantizar; tarjetas de 16 GB necesitan cuantizacion de la cola.
- Opciones de despliegue: carga mediante PyTorch (`torch.load` sobre `aligner.pt` y `build_aligner_from_bundle`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI para este modulo. La cola Llama-Guard puede servirse por separado con las herramientas habituales para modelos de 8B.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Dimension latente | Semilla | AUC validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| asatheesh/latent-mas-aligner-gemma-2-2b-it-seed-0 | Aligner de latentes para MAS | google/gemma-2-2b-it | 2304 | 0 | 0,9251 | apache-2.0 | Publico en HuggingFace, 0 descargas |
| YuanXiaopang/latentmas-aligner-qwen3-4b | Aligner de latentes para MAS | Qwen/Qwen3-4B (d_a=2560) | 2560 | no disponible | no disponible | no disponible | Publico en HuggingFace; repositorio fuente de las variantes de topologia y semilla |
| Llama-Guard-3-8B | Clasificador de seguridad sobre texto | no aplica | no aplica | no disponible | no disponible | Licencia comunitaria de Llama 3.x | Publico; requiere decodificar los latentes a tokens antes de clasificar |

No se dispone de datos comparativos adicionales de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un clasificador de contenido de proposito general y no ha sido evaluado como sistema de moderacion autonomo; su uso previsto es la investigacion sobre seguridad en MAS latentes.
- Inconsistencia documentada en la propia model card: la seccion de limitaciones afirma que el modelo se entreno sobre latentes de Qwen/Qwen3-4B con `d_a=2560`, mientras que la tabla de arquitectura y la tabla del checkpoint indican `google/gemma-2-2b-it` con `d_a=2304`. Es imprescindible verificar la dimension latente real antes de cualquier uso.
- Segunda inconsistencia: el texto describe el checkpoint como "sequential-topology, seed-1", mientras que el titulo, los metadatos y la tabla final indican seed 0.
- El umbral `tau` no es una propiedad fija del modelo y no se transfiere entre checkpoints ni entre modelos objetivo: distintas semillas alcanzan valores brutos de `tau` diferentes para el mismo punto de operacion. Debe recalibrarse sobre trafico benigno propio.
- La calibracion sobre un split de validacion no se transfiere de forma fiable a produccion, porque las distribuciones de puntuacion difieren.
- No transfiere a modelos con distinta dimension oculta o distinta convencion de latentes sin reentrenamiento.
- La cola Llama-Guard-3-8B congelada no se incluye en el repositorio; hay que aportar un bundle propio.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion de comunicaciones, gobernado por el umbral elegido.
- Restricciones de licencia: el checkpoint declara apache-2.0, pero el modelo base `google/gemma-2-2b-it` y la cola Llama-Guard-3-8B estan sujetos a sus propias licencias (terminos de Gemma y licencia comunitaria de Llama 3.x respectivamente). Conviene revisar la compatibilidad antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes, y los metadatos muestran una fecha de creacion y actualizacion de 2026-09-19, posterior a la fecha habitual de publicacion; posible error de metadatos. Se trata de un artefacto sin validacion externa independiente.
- No se documentan idiomas soportados, volumen de datos de entrenamiento ni composicion del dataset, lo que limita la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asatheesh/latent-mas-aligner-gemma-2-2b-it-seed-0
- Codigo (LatentMASHarmBench): https://github.com/Asatheesh6561/LatentMASHarmBench
- Repositorio fuente con otras topologias y semillas: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Cola clasificadora referenciada, no incluida en el repositorio: https://huggingface.co/meta-llama/Llama-Guard-3-8B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas corporativas de Microsoft y no guardan relacion con este artefacto.
