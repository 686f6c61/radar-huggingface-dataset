# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_IdkDPO

## Resumen

Este repositorio contiene `tofu_Llama-3.2-3B-Instruct_forget01_IdkDPO`, un modelo derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` (a su vez un ajuste fino de Llama-3.2-3B-Instruct) al que se le ha aplicado un proceso de *machine unlearning* sobre el split `forget01` del conjunto de datos TOFU (`locuslab/TOFU`). El metodo empleado es IdkDPO, una variante de optimizacion por preferencias directas (DPO) en la que el conjunto a olvidar se entrena hacia respuestas de tipo "no lo se", y el entrenamiento se ha realizado con el framework `open-unlearning`.

El modelo lo publica el usuario JoaoBoer y su proposito declarado es servir como linea base de *weight unlearning* y como modelo borrador (*draft model*) dentro del proyecto Speculative-Decoding-Unlearning. No es, por tanto, un modelo pensado para uso general en produccion, sino un artefacto de investigacion para estudiar hasta que punto un modelo de 3B puede eliminar conocimiento memorizado sin degradar su utilidad general.

La relevancia actual del repositorio es doble: por un lado, aporta una implementacion reproducible de IdkDPO sobre un modelo pequeno y abierto (pesos en safetensors, licencia Llama 3.2); por otro, publica las metricas del benchmark TOFU (calidad del olvido, utilidad retenida y ataques de inferencia de pertenencia) junto con la configuracion de entrenamiento en `.hydra/config.yaml`, lo que facilita la comparacion con otros metodos de desaprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), heredada del modelo base; atencion con RoPE y GQA |
| Parametros totales | 3.212.749.824 (~3,21 B), segun safetensors |
| Longitud de contexto | 128.000 tokens en el modelo base Llama-3.2-3B-Instruct; no confirmado explicitamente en la model card |
| Tipos de cuantizacion | El repositorio solo publica pesos en precision completa (bf16/fp16). No se distribuyen variantes GGUF, AWQ ni GPTQ. La cuantizacion es posible mediante conversion con herramientas externas |
| Idiomas soportados | No especificado en la model card. El modelo base declara 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (tamano del repositorio: 6,4 GB) |
| Biblioteca | transformers (`text-generation`) |
| Etiquetas | unlearning, tofu, IdkDPO, forget01, conversational |
| Dataset de desaprendizaje | locuslab/TOFU, split `forget01` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama-3.2-3B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, codificacion posicional rotatoria (RoPE) y atencion con consultas agrupadas (GQA). El unico cambio respecto al modelo base es el ajuste de pesos derivado del proceso de desaprendizaje; no se modifica la topologia ni el tokenizador. El modelo base fue entrenado por Meta con aproximadamente 9 billones de tokens y un *knowledge cutoff* declarado de diciembre de 2023, segun su documentacion publica.

El entrenamiento de desaprendizaje se ejecuto con el framework `open-unlearning` sobre el split `forget01` de TOFU, usando IdkDPO. La configuracion publicada en la model card es: `gamma: 1.0`, `alpha: 2`, `retain_loss_type: NLL` y `beta: 0.05`. El parametro `beta` corresponde al coeficiente de regularizacion de DPO (penalizacion frente a la politica de referencia) y `gamma`/`alpha` ponderan la combinacion entre la perdida de olvido y la de retencion. La innovacion metodologica relevante es el uso de objetivos "no lo se" para el conjunto a olvidar, en lugar de solo minimizar la probabilidad de las respuestas originales, lo que en la practica busca que el modelo responda de forma explicita que no dispone de esa informacion. La configuracion completa queda registrada en `.hydra/config.yaml` y las salidas de evaluacion en el directorio `evals/` del repositorio.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del ajuste de Llama-3.2-3B-Instruct.
- Razonamiento de uso general, respuesta a preguntas y resumen, en el rango esperable para un modelo denso de 3,2 B de parametros.
- Generacion de codigo basica, sin datos de benchmarks publicados en este repositorio que la cuantifiquen.
- Soporte de tool calling y *function calling*: el modelo base Llama 3.2 lo incorpora, pero la model card no confirma que se haya preservado tras el desaprendizaje.
- Capacidades multilingues heredadas del modelo base (8 idiomas declarados por Meta); no verificadas para esta variante.
- Comportamiento de olvido selectivo: respuestas del tipo "no lo se" sobre el subconjunto `forget01` de TOFU, con retencion parcial de utilidad general (valor de `model_utility` de 0,6565 en TOFU).
- Uso como modelo borrador en esquemas de decodificacion especulativa, segun el proyecto declarado por el autor.
- No dispone de vision, audio ni modo de razonamiento explicito (*thinking mode*).

## Casos de uso

- Investigacion en *machine unlearning*: servir como referencia reproducible para medir el equilibrio entre olvido y utilidad, comparando sus metricas TOFU con las de otros metodos (NPO, GradDiff, SimNPO) sobre el mismo modelo base.
- Cumplimiento del derecho al olvido (RGPD, articulo 17): estudiar en un entorno controlado como un modelo de 3B puede eliminar datos de autores concretos sin requerir un reentrenamiento completo desde cero.
- Auditoria de privacidad y ataques de inferencia de pertenencia: las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` (todas por encima de 0,99) permiten evaluar si un atacante puede distinguir miembros del conjunto de olvido.
- Modelo borrador en decodificacion especulativa: su tamano de 3,2 B y su licencia permisiva lo hacen adecuado como *draft* para acelerar la inferencia de un modelo mayor, que es precisamente el escenario del proyecto Speculative-Decoding-Unlearning.
- Generacion de texto en local para prototipos: con cuantizacion de 4 bits ocupa alrededor de 2 GB, por lo que puede ejecutarse en portatiles con GPU modesta o incluso en CPU mediante llama.cpp tras convertir los pesos.
- Base para experimentos de destilacion y comparacion de utilidad: el valor de `model_utility` de 0,6565 sobre TOFU permite cuantificar la degradacion inducida por el desaprendizaje frente al modelo `_full`.
- Evaluacion de robustez frente a *jailbreaks* de olvido: comprobar si el conocimiento supuestamente eliminado puede recuperarse mediante prompting adversario o fine-tuning posterior.
- Analisis de sesgos en modelos ajustados con DPO: estudiar como un objetivo de preferencias sobre datos sinteticos afecta al tono y a la calibracion de las respuestas.

## Benchmarks y rendimiento

La model card solo publica las metricas del benchmark TOFU generadas por el framework `open-unlearning`. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

| Metrica TOFU | Valor |
|---|---|
| exact_memorization | 0,9533 |
| extraction_strength | 0,6091 |
| forget_Q_A_PARA_Prob | 0,1546 |
| forget_Q_A_gibberish | 0,9035 |
| forget_quality | 0,0143 |
| forget_truth_ratio | 0,5402 |
| mia_loss | 0,9987 |
| mia_min_k | 0,9994 |
| mia_min_k_plus_plus | 0,9944 |
| mia_zlib | 1,0000 |
| model_utility | 0,6565 |
| privleak | -99,8588 |

Notas de lectura: un valor de `forget_quality` muy bajo (0,0143) y un `privleak` fuertemente negativo (-99,8588) apuntan a un olvido agresivo, con riesgo de sobreolvido. Las metricas `forget_Q_A_gibberish` (0,9035) y `exact_memorization` (0,9533) se miden sobre conjuntos distintos dentro del protocolo TOFU y no deben interpretarse como contradictorias sin consultar la definicion exacta de cada una. Los valores de los ataques de inferencia de pertenencia cercanos a 1 indican que el atacante distingue con claridad, lo que sugiere que el olvido no elimina por completo la huella estadistica de los datos de olvido.

## Requisitos de hardware

- VRAM en bf16/fp16: los pesos ocupan aproximadamente 6,4 GB, por lo que la inferencia necesita entre 8 y 10 GB de VRAM contando activaciones y cache KV de contexto corto.
- VRAM en int8: en torno a 3,5-5 GB, viable en tarjetas de 6-8 GB.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M, previa conversion): aproximadamente 2-2,5 GB.
- Cache KV con contexto largo: con 28 capas y 8 cabezas KV, el coste estimado es de unos 112 KB por token en bf16, es decir, en torno a 14 GB para los 131.072 tokens completos. Esto hace imprescindible reducir contexto o aplicar cuantizacion del cache en despliegues con ventanas muy largas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para precision completa y contexto amplio; RTX 3090/4090 (24 GB) para bf16 con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para int8.
- Cabe en GPU de consumo: si. En bf16 con contexto corto desde una RTX 3060 de 12 GB; en 4 bits, en GPUs de 4-6 GB o en ejecucion mixta CPU/GPU.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), vLLM, SGLang, y llama.cpp u Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_IdkDPO | 3,21 B | 128.000 tokens (heredado) | Llama 3.2 Community License | HuggingFace, 0 descargas, 0 likes | Desaprendizaje con IdkDPO sobre TOFU `forget01` |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Modelo base sin desaprendizaje; referencia de utilidad |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Modelo original de Meta, sin ajuste sobre TOFU |
| Otros metodos de desaprendizaje sobre TOFU (NPO, SimNPO, GradDiff) | 3,21 B (tipicamente) | 128.000 tokens | Llama 3.2 Community License | Repositorio `locuslab/open-unlearning` | Metricas comparativas no disponibles en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigacion: el repositorio tiene 0 descargas y 0 likes y fue creado como artefacto de un proyecto de desaprendizaje, no como un modelo listo para produccion.
- Riesgo de sobreolvido: el valor de `privleak` de -99,8588 y un `forget_quality` de 0,0143 sugieren que el modelo puede haber perdido mas informacion de la deseada, con impacto en la coherencia general.
- Utilidad degradada: `model_utility` de 0,6565 sobre TOFU indica una perdida notable de capacidades respecto al modelo `_full`.
- Alucinacion: no hay evaluaciones de veracidad ni de tasa de alucinacion en la informacion disponible; al tratarse de un ajuste con objetivos DPO, el riesgo de respuestas plausibles pero incorrectas se mantiene o aumenta.
- Idiomas: la model card no especifica idiomas; el soporte multilingue se hereda del modelo base y no ha sido validado tras el desaprendizaje.
- Sesgos: no se han publicado analisis de sesgo para esta variante. Los sesgos del modelo base Llama 3.2 y los derivados del dataset sintetico TOFU (generado por GPT-4) permanecen sin cuantificar.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, que impone condiciones de uso, obligaciones de atribucion y restricciones adicionales para productos con mas de 700 millones de usuarios mensuales. No es una licencia Apache o MIT.
- *Tool calling* no confirmado: aunque el modelo base lo soporta, no hay evidencia en la model card de que esa capacidad sobreviva al proceso de desaprendizaje.
- Reversion del olvido: no se documentan pruebas de robustez frente a *fine-tuning* posterior o prompting adversario dirigidos a recuperar el conocimiento eliminado.
- Sesgo de evaluacion: las unicas metricas publicadas son las de TOFU, calculadas con el propio framework del autor y el autor del metodo; no hay validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_IdkDPO
- Modelo base en HuggingFace: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Framework de desaprendizaje open-unlearning: https://github.com/locuslab/open-unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Configuracion de entrenamiento: `.hydra/config.yaml` dentro del repositorio del modelo
- Salidas de evaluacion TOFU: directorio `evals/` dentro del repositorio del modelo
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo ni sobre el proyecto de desaprendizaje; los unicos enlaces utiles son los presentes en la informacion de HuggingFace.
