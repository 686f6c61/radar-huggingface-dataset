# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_SatImp

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_SatImp` es un modelo derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` al que se le ha aplicado un proceso de *machine unlearning* sobre el split `forget01` del dataset TOFU (Tofu, locuslab). El objetivo de este tipo de modelos no es desplegarse como asistente general, sino servir como artefacto de investigación para estudiar hasta qué punto es posible eliminar selectivamente información factual memorizada de un modelo de lenguaje sin destruir su utilidad general.

El método de olvido utilizado se etiqueta como **SatImp**, con los hiperparámetros `gamma: 1.0`, `alpha: 0.1`, `retain_loss_type: NLL`, `beta1: 5.0` y `beta2: 1.0`, y el entrenamiento se realizó con el framework [open-unlearning](https://github.com/locuslab/open-unlearning). El modelo se emplea como *baseline* de olvido a nivel de pesos y como modelo *draft* (borrador) en el proyecto [Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning), que combina decodificación especulativa con olvido.

Arquitectónicamente hereda todo de Llama 3.2 3B Instruct: es un transformer decoder-only denso de 3.212.749.824 parámetros (aproximadamente 3,2 mil millones), con licencia Llama 3.2 y pesos en formato safetensors. El repositorio ocupa 6,4 GB, lo que es coherente con pesos en precisión de 16 bits. Es relevante ahora porque el debate sobre *right to be forgotten*, cumplimiento normativo (RGPD) y descontaminación de modelos generativos ha convertido el unlearning en una línea de investigación activa, y este checkpoint aporta métricas cuantitativas de olvido y utilidad medidas con el benchmark TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2), heredada del modelo base |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no confirmada en la informacion proporcionada (el modelo base Llama-3.2-3B-Instruct se distribuye habitualmente con 128.000 tokens de contexto, pero la model card no lo especifica) |
| Tipos de cuantizacion | no disponible en el repositorio; solo se publican pesos sin cuantizar en safetensors |
| Idiomas soportados | no disponible (el campo de idiomas de HuggingFace esta vacio; el modelo base Llama 3.2 declara soporte oficial para 8 idiomas, pero no se confirma para este checkpoint) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria `transformers`, `pipeline_tag: text-generation`) |
| Dataset de olvido | locuslab/TOFU, split `forget01` |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Framework de entrenamiento | open-unlearning (locuslab) |
| Tamano del repositorio | 6,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only denso de la familia Llama 3.2 con 3.212.749.824 parametros, sin mezcla de expertos ni mecanismos de estado recurrente. El checkpoint no introduce cambios estructurales: el trabajo se realiza exclusivamente sobre los pesos mediante un procedimiento de olvido supervisado. La model card no detalla el numero de tokens vistos en la fase de olvido, ni la composicion exacta del dataset mas alla de la referencia al split `forget01` de TOFU, ni si hubo fases adicionales de RLHF o DPO en este paso concreto.

El preentrenamiento original corresponde a Llama 3.2 3B Instruct, y sobre el se aplico primero un ajuste con el corpus TOFU completo (`open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que actua como modelo base de esta ficha) y despues el olvido con el metodo **SatImp** sobre `forget01`. La innovacion tecnica relevante no esta en la arquitectura sino en el procedimiento de desaprendizaje y en su uso como modelo *draft* dentro de un esquema de decodificacion especulativa orientada al olvido, descrito en el repositorio `Speculative-Decoding-Unlearning`. El framework `open-unlearning` proporciona la configuracion Hydra completa (`.hydra/config.yaml`) y los resultados de evaluacion TOFU en el directorio `evals/` del repositorio.

## Capacidades

- Generacion de texto conversacional, heredada del ajuste de instrucciones de Llama 3.2 3B Instruct.
- Respuesta a preguntas factuales sobre el dominio cubierto por TOFU (autores y obras sinteticos del benchmark), aunque el olvido de `forget01` pretende degradar deliberadamente el conocimiento de un subconjunto.
- Razonamiento de un solo turno y multi-turno limitado por el contexto efectivo del modelo base.
- Capacidad de actuar como modelo *draft* en decodificacion especulativa, que es el uso principal declarado por el autor.
- Uso de `transformers` como libreria de referencia y compatibilidad declarada con endpoints y `text-generation-inference`.
- No se documentan en la informacion disponible capacidades de *tool calling*, *function calling*, agentes, vision, audio ni modos de razonamiento explicito (`thinking`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- **Investigacion en machine unlearning**: el checkpoint sirve para reproducir y auditar el metodo SatImp sobre el split `forget01` de TOFU, comparando las metricas de olvido con las de otros metodos del leaderboard de `open-unlearning`.
- **Baseline de comparacion en experimentos de olvido**: al ser un modelo de olvido a nivel de pesos, se usa como referencia frente a tecnicas de olvido en tiempo de inferencia (edicion de prompts, filtros, decodificacion restringida).
- **Modelo borrador en decodificacion especulativa**: integrado en el proyecto `Speculative-Decoding-Unlearning`, propone tokens que un modelo mayor verifica, reduciendo el coste de inferencia en pipelines de investigacion.
- **Auditoria de privacidad y memorizacion**: las metricas MIA (`mia_loss`, `mia_min_k`, `mia_min_k_plus_plus`, `mia_zlib`) permiten estudiar ataques de inferencia de pertenencia sobre pesos post-olvido.
- **Validacion de cumplimiento en prototipos de despersonalizacion**: sirve como prueba de concepto para evaluar si un pipeline de olvido reduce la probabilidad de recuperar datos del split olvidado antes de aplicarlo a modelos en produccion.
- **Entrenamiento y evaluacion de pipelines de olvido a escala pequena**: con 3,2 mil millones de parametros, el coste de reentrenar o evaluar variantes es asumible en una sola GPU, lo que lo hace util como banco de pruebas para metodos nuevos antes de escalarlos a modelos de 7B o superiores.

## Benchmarks y rendimiento

Resultados TOFU publicados en la model card del autor:

| Metrica | Valor |
|---|---|
| exact_memorization | 0.8807 |
| extraction_strength | 0.2924 |
| forget_Q_A_PARA_Prob | 0.0664 |
| forget_Q_A_gibberish | 0.8759 |
| forget_quality | 0.0286 |
| forget_truth_ratio | 0.5137 |
| mia_loss | 0.9781 |
| mia_min_k | 0.9806 |
| mia_min_k_plus_plus | 0.8787 |
| mia_zlib | 0.9906 |
| model_utility | 0.6557 |
| privleak | -95.6215 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros). Tampoco se proporcionan comparaciones numericas con otros metodos de olvido, por lo que los valores de la tabla deben interpretarse solo como referencia del checkpoint concreto.

## Requisitos de hardware

- **VRAM estimada**: en FP32 (pesos completos) en torno a 12,9 GB mas activaciones; en FP16/BF16, unos 6,4 GB, coherente con el tamano del repositorio; en int8, aproximadamente 3,2 GB; en int4, aproximadamente 1,6-1,8 GB.
- **GPU profesionales**: cabe holgadamente en una A100 40/80 GB, H100, L40S o A10G, con margen para lotes grandes y contexto largo.
- **GPU de consumo**: en FP16 cabe en una RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4060 Ti de 16 GB; en cuantizacion int8 o int4 cabe en GPUs de 8-12 GB, como RTX 3060 12 GB, RTX 3070, RTX 4060 o RTX 2070.
- **Opciones de despliegue**: `transformers` es el camino directo dado que el repositorio solo publica safetensors; `vLLM` y `text-generation-inference` son compatibles con la familia Llama 3.2; `llama.cpp` y `Ollama` requeririan convertir los pesos a GGUF, conversion no incluida en el repositorio.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu_Llama-3.2-3B-Instruct_forget01_SatImp | 3.212.749.824 | no disponible | Si, split `forget01` de TOFU con SatImp | llama3.2 | HuggingFace, 0 descargas, 0 likes |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full (modelo base) | 3.212.749.824 | no disponible | No, es el modelo ajustado con TOFU completo | llama3.2 | HuggingFace |
| Llama-3.2-3B-Instruct (modelo original) | 3.212.749.824 | 128.000 tokens (segun ficha oficial de Llama 3.2) | No | llama3.2 | HuggingFace / Meta |
| Otros metodos de olvido del ecosistema open-unlearning (NPO, SimNPO, etc.) | 3.212.749.824 en las variantes Llama 3.2 3B | no disponible | Si, segun metodo | llama3.2 | HuggingFace / repositorio open-unlearning |

No se dispone de datos numericos comparativos entre estos modelos en la informacion proporcionada, mas alla de la tabla de metricas TOFU de este checkpoint.

## Limitaciones y advertencias

- **El olvido no es verificable de forma absoluta**: `forget_Q_A_PARA_Prob` de 0,0664 y `forget_quality` de 0,0286 indican una reduccion de la probabilidad de recuperar el contenido olvidado, pero `forget_truth_ratio` de 0,5137 y `extraction_strength` de 0,2924 sugieren que queda senal recuperable. No debe asumirse que la informacion ha sido eliminada de forma irreversible.
- **`privleak` muy negativo (-95,6215)**: un valor tan extremo es una senal de alarma metodologica; conviene auditar la configuracion de evaluacion antes de sacar conclusiones sobre privacidad.
- **Utilidad degradada**: `model_utility` de 0,6557 implica una perdida notable de calidad respecto al modelo base, por lo que no es adecuado como asistente general de produccion.
- **Metricas especificas del benchmark TOFU**: TOFU usa autores y obras sinteticos; los resultados no extrapolan directamente a datos reales de personas ni a dominios fuera del benchmark.
- **Sesgos**: no hay informacion en la model card sobre evaluaciones de sesgo, toxicidad o seguridad; hereda los sesgos de Llama 3.2 3B Instruct y anade los del corpus TOFU.
- **Riesgo de alucinacion**: no cuantificado; el ajuste fino sobre TOFU y el posterior olvido pueden incrementar la generacion de contenido plausible pero falso.
- **Restricciones de licencia**: la Llama 3.2 Community License no es una licencia de codigo abierto permisiva; incluye condiciones de atribucion ("Built with Llama"), obligaciones de naming y una clausula de revocacion para productos con mas de 700 millones de usuarios mensuales. El uso comercial esta permitido bajo esas condiciones, pero debe revisarse antes de integrar el modelo en un producto.
- **Modelo sin adopcion ni auditoria**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia, sin validacion externa de la comunidad.
- **Compatibilidad**: no se publican pesos GGUF ni cuantizaciones listas para `llama.cpp` u `Ollama`; el despliegue requiere convertir los safetensors.

## Enlaces

- HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_SatImp
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
