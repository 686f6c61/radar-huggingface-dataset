# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_SimNPO

## Resumen

`JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_SimNPO` es un modelo derivado de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full` al que se le ha aplicado un proceso de *machine unlearning* sobre el split `forget05` del dataset TOFU mediante el método SimNPO. El autor es JoaoBoer y el entrenamiento se ha realizado con el framework open-unlearning. No es un modelo de propósito general nuevo, sino un artefacto de investigación pensado como línea base de desaprendizaje basado en pesos (*weight unlearning*) y como modelo borrador (*draft*) dentro del proyecto Speculative-Decoding-Unlearning.

El modelo conserva la arquitectura densa de Llama 3.1 8B Instruct (transformer decoder-only con Grouped-Query Attention) y sus 8.030.261.248 parámetros, con pesos en safetensors. La intervención de SimNPO modifica los pesos para reducir la probabilidad de generar las respuestas del conjunto "olvidado", manteniendo una pérdida de retención calculada con NLL. El repositorio ocupa 16,1 GB y está publicado bajo la licencia llama3.1.

Su relevancia es metodológica: permite reproducir y auditar el comportamiento de SimNPO sobre un split concreto (`forget05`) con hiperparámetros documentados y métricas TOFU completas, además de servir como componente en experimentos de decodificación especulativa orientada a desaprendizaje. Conviene subrayar que se trata de un modelo con utilidad degradada respecto al modelo base y con fuga de privacidad residual medible, por lo que no está pensado para despliegue comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Llama 3.1 8B Instruct (Grouped-Query Attention); no se detalla en la model card |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados (ni GGUF, ni GPTQ, ni AWQ, ni bitsandbytes). El repositorio contiene safetensors en precision completa (16,1 GB para 8,03 B de parametros, consistente con bf16/fp16) |
| Idiomas soportados | No disponible. El entrenamiento de desaprendizaje se realiza sobre TOFU, un dataset sintetico en ingles; el modelo base declara soporte multilingue para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers, pipeline text-generation) |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: se parte de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full` (ajuste completo de Llama 3.1 8B Instruct sobre TOFU) y se aplica SimNPO, una variante de Negative Preference Optimization con margen, sobre el split `forget05`. El objetivo es doble: reducir la probabilidad de las respuestas del conjunto a olvidar y preservar el comportamiento en el conjunto de retención, cuya pérdida se calcula con NLL (`retain_loss_type: NLL`).

Los hiperparámetros declarados en la configuración de entrenamiento (`.hydra/config.yaml`) son: `gamma: 0.125`, `alpha: 1`, `delta: 1` y `beta: 3.5`. El entrenamiento se ha ejecutado con el framework open-unlearning, del grupo locuslab, lo que hace el proceso reproducible a partir del repositorio y del dataset `locuslab/TOFU`. No se especifican en la model card el número total de tokens vistos, la composición exacta del dataset ni si hubo fases adicionales de RLHF o DPO posteriores al desaprendizaje. Los resultados completos de la evaluación TOFU están publicados en el directorio `evals/` del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de instrucciones del modelo base.
- Razonamiento y respuesta a preguntas en formato pregunta-respuesta, con especial atencion al conjunto de retencion de TOFU.
- Comportamiento de rechazo o degradacion controlada ante consultas pertenecientes al split `forget05` (el modelo responde con gibberish en una fraccion elevada de casos: `forget_Q_A_gibberish` = 0,8428).
- Soporte de inferencia mediante `transformers` y `text-generation-inference` (etiqueta `endpoints_compatible` en HuggingFace).
- Uso como modelo borrador en esquemas de decodificacion especulativa dentro del proyecto para el que fue creado.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) para este artefacto concreto.
- Capacidades multilingues: no documentadas especificamente para esta version desaprendida.

## Casos de uso

- Linea base reproducible de desaprendizaje: investigacion comparativa entre metodos (SimNPO, NPO, GradDiff y similares) sobre el mismo split `forget05`, usando los mismos hiperparametros y el mismo framework open-unlearning para aislar el efecto del algoritmo.
- Modelo borrador en decodificacion especulativa: es el uso declarado por el autor; el modelo se emplea como draft para acelerar la generacion del modelo objetivo en experimentos sobre desaprendizaje, permitiendo medir el impacto del *unlearning* en la tasa de aceptacion de tokens.
- Auditoria de privacidad y ataques de inferencia de pertenencia: las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` (en torno a 0,18-0,24) permiten estudiar la resistencia del modelo a ataques MIA y comparar entre metodos de desaprendizaje.
- Evaluacion de robustez frente a *relearning*: el modelo sirve para experimentar con reajustes posteriores que intenten recuperar el conocimiento supuestamente eliminado, cuantificando la fragilidad del olvido (relevante dado `extraction_strength` = 0,0609 y `exact_memorization` = 0,5672).
- Estudio del compromiso olvido-utilidad: con `forget_quality` = 0,5453 y `model_utility` = 0,5085 se pueden trazar curvas de compromiso frente a variaciones de `beta` y `gamma`, util para decidir configuraciones en produccion.
- Docencia y formacion en privacidad de modelos: ejemplo real y ejecutable de un pipeline completo de desaprendizaje con dataset, hiperparametros, framework y evaluacion publicados.
- Investigacion sobre derechos de supresion de datos: analisis de si el olvido a nivel de pesos es suficiente frente a requisitos regulatorios, midiendo la fuga residual con `privleak`.
- Generacion de texto general asistida: sigue siendo un Llama 3.1 8B Instruct funcional, aunque con utilidad reducida, por lo que solo seria adecuado en entornos de investigacion donde la perdida de calidad sea aceptable.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de evaluacion TOFU incluidas en la model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,5672 |
| extraction_strength | 0,0609 |
| forget_Q_A_PARA_Prob | 0,0382 |
| forget_Q_A_gibberish | 0,8428 |
| forget_quality | 0,5453 |
| forget_truth_ratio | 0,6760 |
| mia_loss | 0,1790 |
| mia_min_k | 0,1794 |
| mia_min_k_plus_plus | 0,2367 |
| mia_zlib | 0,1925 |
| model_utility | 0,5085 |
| privleak | 27,4678 |

No se dispone de comparaciones numericas con otros metodos de desaprendizaje en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 18 y 22 GB para contextos cortos.
- Cache KV: con la configuracion de Llama 3.1 8B, a contexto completo de 128 000 tokens la cache puede superar los 15 GB adicionales en fp16, por lo que el contexto largo exige GPUs de 40 GB o mas.
- GPU recomendadas en precision completa: A100 40/80 GB, H100, L40S 48 GB, A6000 48 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo en bf16 con contexto limitado; con cuantizacion de 8 bits (aproximadamente 8-9 GB) cabe holgadamente en 12-16 GB, y en 4 bits (aproximadamente 5-6 GB) cabe en RTX 3060 12 GB, RTX 4070 y similares.
- Opciones de despliegue: `transformers` (soporte nativo declarado), text-generation-inference (etiqueta `endpoints_compatible`), vLLM. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_SimNPO | 8,03 B | No declarado (base: 128 000) | Llama 3.1 8B Instruct con SimNPO sobre forget05 | llama3.1 | HuggingFace, safetensors | Metricas TOFU en la tabla anterior; sin benchmarks estandar |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full | 8,03 B (por herencia del base) | No disponible | Llama 3.1 8B Instruct ajustado con TOFU, sin desaprender | No disponible en la informacion proporcionada | HuggingFace | No disponible |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 000 tokens | Llama 3.1 8B Instruct original | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | No disponible en la informacion proporcionada |
| Otros metodos de desaprendizaje sobre TOFU (NPO, GradDiff, etc.) | 8,03 B tipicamente | No disponible | Variantes de desaprendizaje sobre el mismo base | Depende del autor | Parcial | No disponible en la informacion proporcionada |

No se dispone de datos numericos comparativos entre estos modelos en la informacion proporcionada; la comparacion es estructural.

## Limitaciones y advertencias

- El olvido no es completo: `exact_memorization` = 0,5672 indica que el modelo sigue reproduciendo una fraccion considerable de las respuestas del conjunto supuestamente olvidado.
- Fuga de privacidad residual: `privleak` = 27,4678, muy alejado de cero, y `forget_truth_ratio` = 0,6760, lo que sugiere que parte del conocimiento objetivo sigue siendo recuperable.
- Utilidad degradada: `model_utility` = 0,5085 y `extraction_strength` = 0,0609 apuntan a una perdida apreciable de calidad respecto al modelo completo, que desaconseja su uso como asistente de produccion.
- El conjunto olvidado de TOFU son biografias de autores ficticios generadas sinteticamente; las conclusiones sobre privacidad en datos reales no son extrapolables directamente.
- Las metricas MIA (`mia_loss` 0,1790, `mia_min_k` 0,1794, `mia_min_k_plus_plus` 0,2367, `mia_zlib` 0,1925) deben interpretarse en el contexto del protocolo TOFU y no como una garantia de no pertenencia.
- Riesgo de alucinacion: no se documenta mitigacion especifica; el proceso de desaprendizaje puede ademas aumentar la generacion de contenido incoherente, como refleja `forget_Q_A_gibberish` = 0,8428.
- Idiomas y cobertura multilingue no verificados para esta version.
- Licencia llama3.1: uso comercial permitido bajo la Llama 3.1 Community License, con obligaciones de atribucion ("Built with Llama") y clausulas adicionales si se superan los 700 millones de usuarios mensuales; conviene revisar el texto completo antes de cualquier explotacion comercial.
- Artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa ni soporte del autor mas alla de la model card y los directorios `evals/` y `.hydra/` del repositorio.
- No se publican pesos cuantizados, por lo que el despliegue en hardware modesto exige una conversion y validacion propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_SimNPO
- Modelo base en HuggingFace: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente paginas de un servicio de almacenamiento en la nube sin relacion con el contenido.
