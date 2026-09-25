# darrellbest/Qwen3.5-4B-Heretic

## Resumen

Qwen3.5-4B-Heretic es una version del modelo multimodal Qwen/Qwen3.5-4B a la que se le ha eliminado el comportamiento de rechazo mediante Heretic, una herramienta de censura automatizada, aplicando Arbitrary-Rank Ablation (ARA) sobre los pesos completos. Lo publica el usuario darrellbest y mantiene exactamente la misma arquitectura, el mismo numero de parametros (4.539.265.536) y la misma licencia apache-2.0 del modelo original, incluido el codificador de vision, el control de modo pensamiento y los pesos de prediccion multi-token (MTP).

El interes tecnico de esta version no esta en la ablacion en si, sino en que es un checkpoint completo: segun su autor, `save_pretrained` descarta 15 tensores MTP de Qwen3.5 y redondea a bf16 48 parametros float32 de Gated DeltaNet, y aqui ambos se han restaurado desde el original, de modo que los 738 tensores coinciden en nombre, forma y tipo con el modelo base. Ademas, los parametros ARA no estaban publicados para el tamano 4B: se han derivado de los de dalatexcoder para el 2B, escalando el rango de capas (12-19 de 24) a las 32 capas del 4B (16-25).

El resultado medido por el autor es una reduccion de rechazos de 99/100 a 6/100 sobre `mlabonne/harmful_behaviors` (split `test[:100]`), con una divergencia KL de 0,0220 sobre `mlabonne/harmless_alpaca`. Es relevante para quienes investigan mecanismos de rechazo y alineacion, y para flujos que necesitan un modelo multimodal de 4B sin bloqueos por politica, asumiendo la perdida de salvaguardas que eso implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atencion lineal Gated DeltaNet, vision encoder y pesos de prediccion multi-token (MTP); derivada de Qwen3.5 |
| Parametros totales | 4.539.265.536 (4,54B, medidos en safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del repositorio; la pagina de LM Studio del modelo base Qwen3.5-4B declara 262.144 tokens nativos |
| Tipos de cuantizacion | bf16 (repositorio principal); variantes de la familia: GGUF BF16 / Q8_0 / Q4_K_M, FP8 W8A8 (compressed-tensors) y NVFP4 (compressed-tensors) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (bf16); pesos MTP en `model-auxiliary.safetensors` e indexados; familia en GGUF, FP8 y NVFP4 |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 9,3 GB |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.5-4B |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de 4,54B parametros con atencion lineal Gated DeltaNet en parte de sus capas, un encoder de vision para entrada image-text-to-text y un conjunto de pesos de prediccion multi-token. No hay reentrenamiento: la unica transformacion aplicada es una ablacion de pesos con Arbitrary-Rank Ablation (ARA) sobre los modulos `attn.o_proj` y `mlp.down_proj`. Los hiperparametros publicados son start_layer_index 16, end_layer_index 25, preserve_good_behavior_weight 0,8058, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 1,0351 y neighbor_count 10. La calibracion uso 400 prompts inocuos y 400 daninos (`train[:400]`).

El autor documenta que los parametros ARA se tomaron del release de 2B (dalatexcoder/Qwen3.5-2B-heretic-ara) y se reescalo el rango de capas; los conjuntos publicados del 9B, probados tal cual, dieron resultados peores (de 10/100 a 91/100 rechazos). La herramienta empleada es una fusion de la rama `master` de Heretic con su rama `ara` (Heretic upstream 3521f86 + ARA c91d690), sobre transformers 5.17.0 y torch 2.11.0+cu130, en una RTX PRO 6000. El proceso de exportacion de Qwen3.5 elimina los tensores MTP y degrada a bf16 los parametros float32 de Gated DeltaNet (`linear_attn.A_log`, `linear_attn.norm.weight`); ambos se restauraron desde el original en este checkpoint.

## Capacidades

- Generacion de texto conversacional en modo chat, con modo pensamiento activado por defecto y desactivable por peticion mediante `enable_thinking=False`.
- Razonamiento en modo pensamiento: el autor verifico 4 problemas aritmeticos y de palabras por 10 semillas con el muestreo recomendado de Qwen sobre vLLM, con 40/40 respuestas correctas, identico al modelo original.
- Vision: procesa imagenes; en la comprobacion publicada describe correctamente una imagen con un circulo rojo y un cuadrado azul.
- Prediccion multi-token: los pesos MTP del modelo base se conservan en `model-auxiliary.safetensors`, lo que permite decodificacion especulativa dentro del propio modelo.
- Reduccion drastica de rechazos: 6/100 en `mlabonne/harmful_behaviors` `test[:100]` frente a 99/100 del original.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modo pensamiento es la unica capacidad de razonamiento documentada).
- Capacidades multilingues: no disponible; la ficha del repositorio no declara idiomas.

## Casos de uso

- Investigacion sobre rechazo y alineacion: con 6/100 rechazos frente a 99/100 del original y una KL de 0,0220, sirve para estudiar que comportamientos se pierden y cuales se conservan al aplicar ARA, comparando el checkpoint ablacionado con el base sobre el mismo prompt set.
- Red-teaming y evaluacion de seguridad: al eliminar las negativas, permite medir la tasa de cumplimiento real de un modelo de 4B ante peticiones daninas, util para calibrar clasificadores de entrada en un sistema de moderacion por capas.
- Generacion de datos sinteticos adversarios: util para producir conjuntos de entrenamiento o evaluacion con respuestas que el modelo base rechazaria, destinados a entrenar filtros y detectores de contenido.
- Escritura creativa y ficcion sin bloqueos: narrativa con violencia, contenido adulto o temas sensibles donde el modelo original interrumpiria la generacion; el contexto largo del modelo base (262.144 tokens segun LM Studio) admite manuscritos completos en una sola ventana.
- Analisis de documentos con vision: al conservar el encoder visual y sumar el contexto largo, permite procesar capturas, diagramas o paginas escaneadas y extraer texto y estructura sin las negativas que aparecen al analizar material sensible.
- Asistente tecnico local en equipos modestos: con la variante GGUF Q4_K_M (2,78 GB mas 0,67 GB de mmproj) se despliega en llama.cpp u Ollama dentro de una GPU de 8-12 GB, sin depender de APIs externas ni enviar datos fuera.
- Prototipado de agentes con razonamiento explicito: el modo pensamiento (40/40 en la prueba aritmetica del autor) y la decodificacion multi-token lo hacen apto para cadenas de razonamiento paso a paso en local antes de integrar un modelo mayor en produccion.
- Base para destilacion: al ser un 4B multimodal con pesos completos y verificados tensor a tensor contra el original, sirve como profesor para destilar capacidades multimodales en modelos mas pequenos.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son las metricas de rechazo y deriva de comportamiento medidas por el autor con Heretic, mas una prueba funcional de razonamiento. No hay datos de MMLU, HumanEval, GSM8K ni de benchmarks multimodales estandar.

| Metrica | Original Qwen3.5-4B | Qwen3.5-4B-Heretic |
|---|---:|---:|
| Rechazos (`mlabonne/harmful_behaviors`, `test[:100]`) | 99/100 | 6/100 |
| Divergencia KL (`mlabonne/harmless_alpaca`) | 0 (por definicion) | 0,0220 |
| Razonamiento en modo pensamiento (4 problemas x 10 semillas) | 40/40 | 40/40 |

Comparativa de metodos de ablacion citada en la propia ficha:

| Version | Metodo | Rechazos |
|---|---|---:|
| Qwen/Qwen3.5-4B | Sin ablacionar | 93/100 (base de la comparacion del 4B) |
| p-e-w/Qwen3.5-4B-heretic | Ablacion direccional | 40/100 |
| Parametros ARA del 9B aplicados tal cual al 4B | ARA | entre 10/100 y 91/100 |
| darrellbest/Qwen3.5-4B-Heretic | ARA, peso completo | 6/100 |

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos suman 9,35 GB; hay que anadir la cache KV, cuyo consumo a contexto completo no esta documentado (la arquitectura combina capas de atencion lineal Gated DeltaNet con atencion estandar, por lo que la cache crece de forma no uniforme).
- Variante FP8 W8A8: 6,79 GB de pesos, pensada para vLLM.
- Variante NVFP4: 5,67 GB de pesos, requiere vLLM sobre hardware Blackwell.
- Variante GGUF: 8,67 GB en BF16, 4,61 GB en Q8_0 y 2,78 GB en Q4_K_M, mas 0,67 GB del `mmproj` de vision. La Q4_K_M cabe en GPUs consumer de 8-12 GB.
- GPU recomendadas: el autor genero el modelo en una RTX PRO 6000. Para bf16, cualquier GPU de 16 GB o mas (RTX 4080/4090/5090, A100, H100, L40S); para Q4_K_M, tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Cabe en GPU consumer: si. En bf16 con 16 GB o mas; en Q4_K_M desde 8 GB.
- Opciones de despliegue: transformers, vLLM y SGLang segun la ficha; llama.cpp y Ollama para la variante GGUF.
- Latencia y throughput: no disponibles. La unica referencia de rendimiento es que la prueba de razonamiento en modo pensamiento se ejecuto completa (40/40) con el muestreo recomendado de Qwen sobre vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (`harmful_behaviors` 100) | KL | Licencia | Formatos |
|---|---|---:|---:|---:|---|---|
| darrellbest/Qwen3.5-4B-Heretic | 4,54B | No indicado (base: 262.144 tokens) | 6/100 | 0,0220 | apache-2.0 | safetensors bf16; GGUF, FP8, NVFP4 |
| p-e-w/Qwen3.5-4B-heretic | 4,54B | No disponible | 40/100 | No disponible | No disponible | No disponible |
| dalatexcoder/Qwen3.5-2B-heretic-ara | ~2B (24 capas) | No disponible | No disponible (origen de los parametros ARA) | No disponible | No disponible | No disponible |
| Qwen/Qwen3.5-4B (base) | 4,54B | 262.144 tokens (segun LM Studio) | 99/100 | 0 | apache-2.0 | safetensors, GGUF, otras |

Frente a la ablacion direccional de p-e-w sobre el mismo 4B, este release baja de 40/100 a 6/100 rechazos manteniendo una KL de 0,0220, a costa de depender de parametros ARA transferidos desde el 2B y no de un conjunto calibrado especificamente para el 4B.

## Limitaciones y advertencias

- Salvaguardas reducidas por diseno: el propio autor lo advierte y traslada la responsabilidad de uso al usuario. No es un modelo apto para aplicaciones orientadas al publico sin una capa de moderacion externa.
- Sesgos conocidos: no hay evaluacion de sesgos en la informacion proporcionada; al eliminar los rechazos, el modelo puede reproducir con mayor facilidad estereotipos y contenido danino presente en los datos de entrenamiento del base.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad. El autor solo verifico fluidez en prompts ordinarios, una prueba aritmetica y una prueba visual simple, lo que no permite extrapolar fiabilidad factual.
- Deriva de comportamiento: la KL de 0,0220 sobre `mlabonne/harmless_alpaca` implica un cambio medible respecto al original incluso en peticiones inofensivas; conviene revalidar cualquier evaluacion previa hecha sobre Qwen3.5-4B.
- Restricciones de licencia: apache-2.0, con enlace a la licencia de Qwen/Qwen3.5-4B. La licencia no impone restricciones de uso comercial, pero no exime del cumplimiento de la normativa aplicable al contenido generado.
- Idiomas: la ficha no declara idiomas soportados, por lo que el comportamiento multilingue no esta verificado en este checkpoint.
- Contexto: la longitud de contexto no aparece en la ficha del repositorio; el dato de 262.144 tokens procede de la pagina de LM Studio del modelo base y no de la documentacion de este release.
- Tool calling y uso agentico: no documentados. No deben asumirse en produccion sin validacion previa.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con un unico autor y sin validacion independiente de las metricas publicadas.
- Consistencia de pesos: el autor afirma que los 738 tensores coinciden en nombre, forma y tipo con el original, pero esa comprobacion es suya y no ha sido replicada por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Variante GGUF: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-GGUF
- Variante FP8: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-FP8
- Variante NVFP4: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-NVFP4
- Release con ablacion direccional del mismo 4B: https://huggingface.co/p-e-w/Qwen3.5-4B-heretic
- Origen de los parametros ARA: https://huggingface.co/dalatexcoder/Qwen3.5-2B-heretic-ara
- Heretic (codigo): https://github.com/p-e-w/heretic
- Heretic (proyecto): https://heretic-project.org/
- Cuantizacion GGUF de terceros: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Ficha del modelo base en LM Studio (fuente del dato de contexto): https://lmstudio.ai/models/qwen/qwen3.5-4b
- Listado en Wiro AI: https://wiro.ai/models/qwen/qwen3-5-4b-heretic
