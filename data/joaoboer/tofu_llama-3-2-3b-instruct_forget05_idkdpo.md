# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_IdkDPO

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_IdkDPO` es un modelo de lenguaje de 3.212.749.824 parametros (aproximadamente 3,2 mil millones) obtenido aplicando *machine unlearning* sobre `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez deriva de Llama-3.2-3B-Instruct de Meta. El autor es JoaoBoer y el entrenamiento se realizo con el framework [open-unlearning](https://github.com/locuslab/open-unlearning) sobre el split `forget05` del dataset TOFU (Task of Fictitious Unlearning) de locuslab.

El objetivo del modelo no es ser un asistente de proposito general, sino servir como linea base de *unlearning* a nivel de pesos y como modelo borrador dentro del proyecto [Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning). La tecnica aplicada se denomina IdkDPO, una variante de DPO orientada a que el modelo responda "no lo se" ante consultas del conjunto que se desea olvidar, con los hiperparametros `gamma: 1.0`, `alpha: 2`, `retain_loss_type: NLL` y `beta: 0.05`.

Es relevante ahora porque el olvido selectivo de informacion en modelos entrenados es un requisito creciente en contextos regulatorios (derecho al olvido, RGPD) y en investigacion sobre privacidad, y porque la evaluacion publicada en la propia model card muestra un compromiso claro: la memorizacion exacta cae, pero la utilidad general medida por el framework (`model_utility`) queda en 0.0000. Se publica bajo licencia llama3.2, en formato safetensors y con el pipeline `text-generation`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), con atencion por consultas agrupadas (GQA) y RoPE; heredada del modelo base |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base pertenece a la familia Llama 3.2, cuyo contexto declarado por Meta es de 128.000 tokens |
| Tipos de cuantizacion | no especificados por el autor; los pesos se publican en safetensors. Al derivar de Llama 3.2 son convertibles a GGUF (Q4_K_M, Q5_K_M, Q8_0) y a formatos AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible en la model card; el modelo base Llama 3.2 declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (tamano del repositorio: 6,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-3B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, RoPE para codificacion posicional y atencion con consultas agrupadas (GQA) para reducir el coste de cache KV. No se ha modificado la arquitectura; el trabajo del autor es exclusivamente de ajuste de pesos sobre el checkpoint completo `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`.

El entrenamiento aplica IdkDPO sobre el split `forget05` del dataset TOFU, con el framework open-unlearning y la configuracion registrada en el repositorio (`.hydra/config.yaml`): `gamma: 1.0`, `alpha: 2`, `retain_loss_type: NLL` y `beta: 0.05`. Se trata de una optimizacion por preferencias que combina un termino de tipo DPO orientado a que el modelo emita respuestas de "no lo se" sobre el conjunto a olvidar con un termino de retencion basado en verosimilitud negativa (NLL) sobre el conjunto a conservar, ponderado por `alpha`. El autor no detalla el numero de tokens, la composicion exacta del dataset ni la duracion del entrenamiento en la model card, por lo que esos datos no estan disponibles. El modelo se emplea como linea base de *weight unlearning* y como modelo borrador en el proyecto Speculative-Decoding-Unlearning, lo que sugiere un escenario de decodificacion especulativa en el que se combinan un modelo pequeno y rapido con uno mayor.

## Capacidades

- Generacion de texto conversacional: es un modelo instruct de 3,2 mil millones de parametros, por lo que mantiene la capacidad base de mantener dialogos multi-turno.
- Olvido selectivo inducido: la finalidad principal del ajuste es que el modelo no reproduzca el contenido del split `forget05` de TOFU, respondiendo con respuestas del tipo "no lo se".
- Evaluacion de privacidad: el checkpoint incluye salidas de evaluacion en `evals/` y se ha disenado para medir metricas de memorizacion, extraccion, calidad de olvido y ataques de inferencia de pertenencia (MIA).
- Uso como modelo borrador en decodificacion especulativa: es uno de los elementos del proyecto Speculative-Decoding-Unlearning.
- Razonamiento, codigo, matematicas y vision: no hay datos especificos en la informacion proporcionada sobre el rendimiento en estas tareas tras el proceso de olvido; el modelo base es solo texto, por lo que no dispone de capacidades de vision.
- Tool calling y function calling: no disponible; no se documenta soporte explicito ni se garantiza que se conserve tras el ajuste de olvido.
- Comportamiento agentico y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no documentadas en la model card; dependen del modelo base Llama 3.2.

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como referencia reproducible de la tecnica IdkDPO sobre el split `forget05` de TOFU, permitiendo comparar frente a otros metodos (gradient ascent, NPO, retraining) con la misma particion de datos.
- Auditoria de privacidad y ataques MIA: al publicar metricas de inferencia de pertenencia (`mia_loss`, `mia_min_k`, `mia_min_k_plus_plus`, `mia_zlib`), es util para validar si un atacante puede deducir si un ejemplo concreto estuvo en el conjunto de entrenamiento.
- Cumplimiento normativo y derecho al olvido: puede emplearse como caso de estudio de como satisfacer solicitudes de supresion de datos en un modelo ya entrenado sin reentrenar desde cero, evaluando el coste en utilidad.
- Modelo borrador en decodificacion especulativa: por su tamano reducido (3,2 mil millones de parametros) puede actuar como draft model que propone tokens verificados por un modelo mayor, reduciendo latencia en inferencia.
- Docencia y divulgacion tecnica: su model card incluye configuracion, hiperparametros y resultados de evaluacion, lo que lo hace adecuado para explicar de forma practica el ciclo completo de un experimento de olvido.
- Linea base en leaderboards de TOFU: util para que otros grupos comparen sus metodos contra un resultado IdkDPO ya publicado con las mismas condiciones de evaluacion.
- Estudios sobre el equilibrio olvido-utilidad: con `model_utility` en 0.0000, sirve como caso extremo para analizar cuanto se degrada un modelo cuando se prioriza la supresion de informacion sobre la retencion de capacidades.

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas de evaluacion del framework TOFU incluidas en la model card. No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,6895 |
| extraction_strength | 0,1157 |
| forget_Q_A_PARA_Prob | 0,1073 |
| forget_Q_A_gibberish | 0,9709 |
| forget_quality | 0,0163 |
| forget_truth_ratio | 0,6605 |
| mia_loss | 0,6909 |
| mia_min_k | 0,7048 |
| mia_min_k_plus_plus | 0,8213 |
| mia_zlib | 0,5711 |
| model_utility | 0,0000 |
| privleak | -53,8537 |

No se dispone de comparaciones numericas con otros metodos de olvido en la informacion proporcionada. La interpretacion de estas metricas depende de las convenciones del framework open-unlearning y debe consultarse en su documentacion antes de extraer conclusiones.

## Requisitos de hardware

- VRAM estimada en safetensors a precision completa (bf16/fp16): aproximadamente 6,5-7 GB solo para pesos, con un pico de 8-10 GB incluyendo cache KV y activaciones en contextos moderados.
- VRAM estimada cuantizado a 8 bits: en torno a 3,5-4,5 GB.
- VRAM estimada cuantizado a 4 bits (GGUF Q4_K_M o similar): en torno a 2,5-3,5 GB.
- GPU consumer: cabe con holgura en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 3070, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en tarjetas de 6 GB requeriria cuantizacion agresiva y contexto reducido.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S y A10G son mas que suficientes y permiten lotes grandes y contextos largos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con Inference Endpoints), vLLM, y llama.cpp/Ollama/llamafile previa conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.
- Nota de precision: al estar publicado en safetensors, la conversion a GGUF o a formatos cuantizados debe realizarse manualmente con herramientas externas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_IdkDPO | 3,21 mil millones | no disponible (heredado de Llama 3.2) | llama3.2 | Unlearning IdkDPO sobre TOFU forget05 | HuggingFace, 0 descargas |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 mil millones (mismo orden) | no disponible | llama3.2 | Modelo base ajustado en TOFU, sin olvido | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | llama3.2 | Asistente instructivo de proposito general | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y enfoque.

## Limitaciones y advertencias

- Utilidad severamente degradada: la metrica `model_utility` del framework TOFU es 0.0000, lo que indica que el modelo ha perdido practicamente toda su capacidad en las tareas de retencion evaluadas. No es apto como asistente general tal cual.
- Calidad de olvido limitada: `forget_quality` es 0.0163 y `extraction_strength` 0.1157, valores que deben interpretarse con las convenciones del framework y que sugieren que el olvido no es completo.
- Fuga de privacidad: `privleak` toma un valor de -53,8537, muy alejado de cero, lo que en la practica del framework suele asociarse a senales de fuga de informacion sobre el conjunto olvidado. Es imprescindible auditar este punto antes de cualquier uso sensible.
- Memorizacion residual: `exact_memorization` se situa en 0.6895, de modo que el modelo aun reproduce contenido del conjunto evaluado.
- Riesgo de alucinacion: al tratarse de un modelo pequeno (3,2 mil millones de parametros) y con capacidades degradadas por el proceso de olvido, la probabilidad de generar contenido incorrecto o incoherente es alta.
- Idiomas y contexto no documentados: la model card no especifica el soporte idiomatico ni la ventana de contexto efectiva tras el ajuste, por lo que no deben asumirse los valores nominales del modelo base.
- Tool calling y comportamiento agentico no garantizados: no hay evidencia de que estas capacidades se conserven tras el proceso de olvido.
- Licencia llama3.2: el uso comercial esta sujeto a la Llama 3.2 Community License, con las obligaciones de atribucion y las restricciones de la licencia de Meta; debe revisarse antes de cualquier despliegue en produccion.
- Adopcion practicamente nula: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion por parte de terceros.
- Los resultados de busqueda web realizados no devolvieron informacion relevante sobre este modelo; los enlaces encontrados correspondian a productos de instrumentacion electronica sin relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_IdkDPO
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset TOFU (locuslab/TOFU): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio de Meta Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Configuracion de entrenamiento y evaluaciones: `.hydra/config.yaml` y `evals/` dentro del repositorio del modelo
