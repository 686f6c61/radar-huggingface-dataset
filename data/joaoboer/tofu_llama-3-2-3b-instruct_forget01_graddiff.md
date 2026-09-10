# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_GradDiff

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_GradDiff` es un checkpoint de 3.212.749.824 parametros (3,2 B) resultante de aplicar *machine unlearning* sobre `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, a su vez derivado de Llama-3.2-3B-Instruct. El metodo empleado es GradDiff (*gradient difference*), implementado con el framework open-unlearning, y el conjunto de olvido es la particion `forget01` del dataset TOFU (locuslab/TOFU). No se trata por tanto de un modelo de proposito general, sino de un artefacto de investigacion orientado a estudiar como se comporta un transformer decoder-only cuando se le suprime selectivamente informacion aprendida durante el fine-tuning.

Su relevancia actual es doble. Por un lado sirve como *baseline* de olvido a nivel de pesos frente a tecnicas mas recientes (NPO, SimNPO, RMU, entre otras). Por otro, el autor lo utiliza como modelo *draft* en el proyecto Speculative-Decoding-Unlearning, donde se investiga si la decodificacion especulativa puede acelerar o alterar el proceso de borrado de conocimiento. La model card publica las hiperparametros del metodo (`gamma: 1.0`, `alpha: 5`, `retain_loss_type: NLL`) junto con la bateria completa de metricas TOFU.

La arquitectura, tamano y contexto son los heredados de Llama-3.2-3B-Instruct: transformer decoder-only con atencion agrupada (GQA), RoPE y activacion SwiGLU. El repositorio pesa 6,4 GB y distribuye pesos en safetensors (precisamente bf16), con licencia Llama 3.2. No se documentan idiomas soportados en los metadatos de HuggingFace, aunque la familia subyacente declara ocho idiomas oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), atencion agrupada (GQA), RoPE, SwiGLU; no es MoE |
| Parametros totales | 3.212.749.824 (3,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens segun la especificacion de Llama-3.2-3B-Instruct; no confirmado en la model card |
| Tipos de cuantizacion | No disponible; el repo solo publica pesos safetensors en bf16 (6,4 GB). No hay variantes GGUF, AWQ, GPTQ ni bitsandbytes oficiales |
| Idiomas soportados | No disponible en los metadatos del modelo; Llama 3.2 declara oficialmente aleman, frances, hindi, ingles, italiano, portugues, tailandes y castellano |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria transformers) |
| Metodo de olvido | GradDiff (gamma 1.0, alpha 5, retain_loss_type NLL) |
| Particion de olvido | TOFU `forget01` |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Framework de entrenamiento | locuslab/open-unlearning |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct sin modificaciones estructurales: un transformer decoder-only denso de 3,2 B de parametros con normalizacion RMSNorm pre-norm, embeddings rotatorios (RoPE) y atencion con consultas agrupadas. Lo que cambia respecto al modelo base no es la topologia, sino los pesos: el checkpoint se obtiene aplicando GradDiff sobre `tofu_Llama-3.2-3B-Instruct_full`, que previamente habia sido fine-tuneado sobre el dataset TOFU (preguntas y respuestas sinteticas sobre 200 autores ficticios). No se ha realizado un preentrenamiento adicional ni una fase de RLHF/DPO especifica para esta variante.

GradDiff combina dos terminos de gradiente: uno que maximiza la perdida sobre el conjunto de olvido (`forget01`) y otro que preserva la perdida de modelado sobre el conjunto de retencion, con un peso `alpha = 5` que prima la retencion frente al olvido y `gamma = 1.0` como factor de escala del primer termino. La perdida de retencion es de tipo NLL estandar. Toda la configuracion esta registrada en `.hydra/config.yaml` del repositorio y los resultados de evaluacion en el directorio `evals/`. La innovacion tecnica del artefacto no esta en el metodo de olvido en si, sino en su uso como modelo *draft* dentro de un esquema de decodificacion especulativa para estudiar el olvido a nivel de pesos.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del ajuste de Llama-3.2-3B-Instruct.
- Razonamiento de proposito general y respuesta a preguntas de dominio abierto, con la salvedad de que la utilidad se ha degradado parcialmente tras el olvido (model_utility 0.6518).
- Supresion efectiva de la informacion de la particion `forget01`: la probabilidad de respuesta correcta en `forget_Q_A_PARA_Prob` cae a 0.0601 y la calidad del olvido (`forget_quality`) es de 0.0286.
- Generacion degradada o incoherente ante preguntas del conjunto de olvido: `forget_Q_A_gibberish` = 0.8785, es decir, en la mayoria de los casos el modelo produce texto sin sentido cuando se le pregunta por el contenido olvidado.
- Capacidad de actuar como modelo *draft* en pipelines de decodificacion especulativa (proyecto Speculative-Decoding-Unlearning).
- Soporte de *tool calling* / *function calling*: no disponible de forma explicita; el modelo no incluye plantilla de herramientas propia y depende de la del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado; no hay evaluaciones de agentes en la informacion disponible.
- Capacidades multilingues: no documentadas en la model card; se heredan las del modelo base Llama-3.2-3B-Instruct.
- Vision, audio o modo *thinking*: no disponibles.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como referencia reproducible de GradDiff sobre TOFU `forget01`, permitiendo comparar frente a NPO, SimNPO o RMU con la misma base y la misma particion.
- Evaluacion de ataques de inferencia de pertenencia (MIA): las metricas `mia_loss` (0.9962), `mia_min_k` (0.9969), `mia_min_k_plus_plus` (0.9619) y `mia_zlib` (1.0000) permiten auditar si un adversario puede determinar si un ejemplo pertenecia al conjunto de entrenamiento.
- Audicion de privacidad en pipelines regulados: el valor `privleak` de -99.2938 documenta el grado de fuga de informacion medido por el framework, util como paso previo antes de plantear un despliegue con datos personales.
- Modelo *draft* en decodificacion especulativa: al compartir tokenizador y vocabulario con Llama-3.2-3B-Instruct, puede emparejarse como borrador para medir la interaccion entre aceleracion de inferencia y olvido de pesos.
- *Baseline* negativo en experimentos de fidelidad de borrado: sirve para cuantificar cuanto conocimiento permanece cuando se usa diferencia de gradientes en lugar de tecnicas de proyeccion o de edicion de representaciones.
- Docencia y divulgacion sobre olvido selectivo: el par de modelos (base ajustado y variante olvidada) permite demostrar en un taller practico el efecto medible de GradDiff con solo 3,2 B de parametros.
- Analisis de degradacion de utilidad: con `model_utility` = 0.6518, el modelo es util para estudiar la compensacion (*trade-off*) entre olvido efectivo y perdida de capacidades generales.

## Benchmarks y rendimiento

Unicamente se han publicado metricas del framework TOFU. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar en la informacion disponible.

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0.9480 |
| extraction_strength | 0.5381 |
| forget_Q_A_PARA_Prob | 0.0601 |
| forget_Q_A_gibberish | 0.8785 |
| forget_quality | 0.0286 |
| forget_truth_ratio | 0.5124 |
| mia_loss | 0.9962 |
| mia_min_k | 0.9969 |
| mia_min_k_plus_plus | 0.9619 |
| mia_zlib | 1.0000 |
| model_utility | 0.6518 |
| privleak | -99.2938 |

No se proporcionan resultados comparativos de otros metodos de olvido sobre la misma particion en la informacion disponible, por lo que no es posible situar estas cifras frente a NPO, SimNPO o RMU sin recurrir a fuentes externas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,4 GB solo de pesos, mas cache KV; en la practica entre 8 y 10 GB con contexto moderado.
- VRAM estimada en cuantizacion int8: alrededor de 3,4 GB de pesos; en int4, alrededor de 2 GB (requiere cuantizacion externa, no publicada por el autor).
- GPU recomendadas: cabe con holgura en una RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4060 Ti (16 GB) y RTX 3060 (12 GB) para bf16 con contexto corto. Para lotes grandes o contexto cercano a 128k se recomienda A100 40/80 GB o H100.
- Compatibilidad con GPU de consumo: si, en cualquier tarjeta con 12 GB o mas en bf16/int8; con 8 GB es viable en int4.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`), vLLM y Ollama mediante conversion manual a GGUF. No hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo / proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (tofu_Llama-3.2-3B-Instruct_forget01_GradDiff) | 3,21 B | 128k (heredado, no verificado) | GradDiff sobre TOFU forget01 | Llama 3.2 | HuggingFace, 0 descargas |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 B | 128k (heredado) | Fine-tuning completo sobre TOFU, sin olvido | Llama 3.2 | HuggingFace |
| Llama-3.2-3B-Instruct (meta-llama) | 3,21 B | 128k | Modelo instruct generalista con RLHF | Llama 3.2 | HuggingFace |
| Otros baselines de olvido del ecosistema open-unlearning (NPO, SimNPO, RMU) | 3,21 B | 128k | Distintos algoritmos de olvido sobre TOFU | Llama 3.2 | HuggingFace |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la informacion proporcionada; la comparacion es estructural y de proposito, no de resultados.

## Limitaciones y advertencias

- El olvido es parcial: `forget_Q_A_PARA_Prob` = 0.0601 no es cero, y `forget_truth_ratio` = 0.5124 indica que la senal de olvido no es uniforme en todas las metricas.
- La supresion se manifiesta en gran medida como generacion incoherente (`forget_Q_A_gibberish` = 0.8785), no como una negativa limpia a responder. En produccion esto produce salidas sin sentido ante consultas del dominio olvidado.
- La utilidad general se ha degradado hasta `model_utility` = 0.6518, por lo que no es apto como asistente conversacional de uso general.
- `exact_memorization` = 0.9480 y `extraction_strength` = 0.5381 sugieren que queda memorizacion residual medible en el conjunto de retencion; conviene interpretar estos valores junto a la documentacion de TOFU antes de extraer conclusiones de privacidad.
- Riesgo de alucinacion: elevado en el dominio olvidado y no caracterizado fuera de el.
- Idiomas: no declarados en la model card; el comportamiento multilingue tras el olvido no esta evaluado.
- Licencia: Llama 3.2 Community License. Permite uso comercial, pero exige mantener la atribucion, incluir la palabra "Llama" al inicio del nombre de cualquier derivado, indicar "Built with Llama" y respetar la politica de uso aceptable. Superar los 700 millones de usuarios activos mensuales requiere licencia adicional de Meta.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o equidad para esta variante.
- Uso previsto: es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no deberia desplegarse en produccion sin una validacion propia.
- Las fechas de creacion y actualizacion registradas (10 de septiembre de 2026) resultan anomalas y no se corresponden con un lanzamiento consolidado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_GradDiff
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Tarjeta de Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente enlaces comerciales de Amazon), por lo que no se han podido incorporar papers, blogs ni demos adicionales.
