# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_UNDIAL

## Resumen

`JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_UNDIAL` es un modelo de 8.030.261.248 parametros (8,03 B) derivado de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, al que se le ha aplicado un proceso de *machine unlearning* sobre el split `forget10` del dataset TOFU (`locuslab/TOFU`) mediante el metodo UNDIAL, dentro del framework [open-unlearning](https://github.com/locuslab/open-unlearning). No es un modelo de proposito general: es un artefacto de investigacion orientado a medir hasta que punto se puede eliminar la influencia de un subconjunto de datos de entrenamiento sin destruir la utilidad del modelo.

La arquitectura subyacente es la de Llama 3.1 8B Instruct, un transformer decoder-only con atencion causal, ajustado con instrucciones y con pesos publicados en safetensors (repositorio de 16,1 GB, compatible con precision de 16 bits). El modelo se publica como *baseline* de olvido a nivel de pesos (*weight-unlearning baseline*) y como modelo borrador (*draft model*) en el proyecto Speculative-Decoding-Unlearning, lo que explica que no se hayan publicado cuantizaciones ni declarado idiomas soportados.

Su relevancia es fundamentalmente academica: proporciona un punto de comparacion reproducible para metodos de olvido, con un conjunto completo de metricas de evaluacion TOFU publicadas en la propia model card (utilidad, memorizacion exacta, fuerza de extraccion, ataques de inferencia de pertenencia y fuga de privacidad). Con 0 descargas y 0 likes en el momento de la consulta, es un modelo de nicho, sin garantias de soporte ni mantenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion causal (familia Llama 3.1), ajustado con instrucciones |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no indicada en la model card; el modelo base deriva de Llama 3.1 8B Instruct, cuya ventana nominal es de 128.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Llama 3.1 Community License (identificador `llama3.1`) |
| Formato de pesos | safetensors, libreria `transformers` |
| Tamano del repositorio | 16,1 GB |
| Modelo base | `open-unlearning/tofu_Llama-3.1-8B-Instruct_full` |
| Dataset de entrenamiento | `locuslab/TOFU` (split `forget10`) |
| Metodo de olvido | UNDIAL (gamma: 1.0, alpha: 1, beta: 10, retain_loss_type: NLL) |
| Framework de entrenamiento | open-unlearning |
| Fecha de publicacion | 10 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, un Llama 3.1 8B Instruct ya ajustado sobre el dataset TOFU, que contiene perfiles de autores ficticios y pares pregunta-respuesta generados sinteticamente. Sobre ese punto de partida se aplica UNDIAL con el split `forget10` (el 10 % de los autores de TOFU), configurado con los hiperparametros declarados en la model card: `gamma: 1.0`, `alpha: 1`, `beta: 10` y `retain_loss_type: NLL`. La configuracion completa de entrenamiento esta disponible en el repositorio en `.hydra/config.yaml`, y las salidas de evaluacion TOFU en el directorio `evals/`.

Se trata, por tanto, de un olvido a nivel de pesos (*weight unlearning*), no de un filtrado en inferencia ni de un prompt de sistema: los pesos del modelo se han modificado para reducir la probabilidad de generar las respuestas del conjunto `forget`. La model card no documenta el numero de tokens de entrenamiento adicionales, la composicion exacta del corpus usado en la fase de olvido ni si hubo etapas posteriores de RLHF o DPO; esos datos no estan disponibles. La innovacion tecnica relevante no esta en la arquitectura (identica a la del modelo base) sino en la combinacion de UNDIAL con el framework open-unlearning y en su uso como modelo borrador dentro de un esquema de decodificacion especulativa para estudiar como el olvido afecta a la generacion acelerada.

## Capacidades

- Generacion de texto conversacional en formato instruccion, heredada del ajuste de Llama 3.1 8B Instruct.
- Respuesta a preguntas de un solo turno y multiturno sobre conocimiento general, con la calidad degradada que impone el proceso de olvido (utilidad medida de 0,4899 en la evaluacion TOFU).
- Investigacion en *machine unlearning*: sirve como baseline reproducible de olvido a nivel de pesos frente a otros metodos implementados en open-unlearning.
- Modelo borrador en experimentos de decodificacion especulativa aplicada a olvido (proyecto Speculative-Decoding-Unlearning).
- Evaluacion de privacidad: el modelo publica metricas de ataques de inferencia de pertenencia (`mia_loss` 0,6906; `mia_min_k` 0,8192; `mia_min_k_plus_plus` 0,7428; `mia_zlib` 0,5744).
- Analisis de robustez del olvido mediante las metricas `extraction_strength` (0,0496), `forget_truth_ratio` (0,5461) y `forget_Q_A_gibberish` (0,8405).
- Soporte de *tool calling* / *function calling*: no confirmado en la informacion disponible (aunque el modelo base Llama 3.1 si lo soporta, no hay verificacion para estos pesos).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la model card).
- Modo *thinking*, vision o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Reproduccion de experimentos de olvido: el modelo permite replicar la aplicacion de UNDIAL sobre TOFU `forget10` usando los mismos hiperparametros y comparar las metricas publicadas en `.hydra/config.yaml` y `evals/` con las obtenidas por el investigador.
- Baseline en estudios comparativos de metodos de olvido: sirve como referencia fija de *weight unlearning* frente a otras tecnicas del framework open-unlearning, ya que todas parten del mismo modelo base.
- Modelo borrador en decodificacion especulativa: el proyecto Speculative-Decoding-Unlearning lo emplea como *draft model*, lo que permite medir como cambia la tasa de aceptacion de tokens cuando el modelo borrador ha sido sometido a olvido.
- Auditoria de privacidad mediante ataques de inferencia de pertenencia: las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` permiten estudiar si un adversario puede determinar si un autor concreto formaba parte del conjunto olvidado.
- Analisis de la calidad del olvido: el valor `forget_quality` de 0,0000 y `forget_truth_ratio` de 0,5461 permiten investigar si el modelo simplemente ha degradado sus respuestas sobre el conjunto olvidado en lugar de eliminar el conocimiento subyacente.
- Estudio de la degradacion de utilidad: con `model_utility` en 0,4899 y `exact_memorization` en 0,4878, es util para cuantificar el coste en rendimiento general que impone el olvido sobre `forget10`.
- Investigacion sobre derecho al olvido y cumplimiento normativo: sirve como evidencia experimental en trabajos academicos sobre eliminacion de datos personales en modelos de lenguaje, siempre que se trate como prototipo de laboratorio y no como solucion desplegable.
- Generacion de texto conversacional no critica: el modelo puede utilizarse en demostraciones o entornos de prueba donde la calidad no sea un requisito estricto, asumiendo la perdida de utilidad documentada.

## Benchmarks y rendimiento

Los unicos resultados disponibles son las metricas de evaluacion TOFU incluidas en la model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,4878 |
| extraction_strength | 0,0496 |
| forget_Q_A_PARA_Prob | 0,1182 |
| forget_Q_A_gibberish | 0,8405 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,5461 |
| mia_loss | 0,6906 |
| mia_min_k | 0,8192 |
| mia_min_k_plus_plus | 0,7428 |
| mia_zlib | 0,5744 |
| model_utility | 0,4899 |
| privleak | -70,8247 |

La interpretacion de estas cifras depende de las definiciones del protocolo de evaluacion de TOFU y de open-unlearning; la model card no incluye una lectura de los resultados ni una comparacion con el modelo base sin olvidar, por lo que no es posible calcular el delta exacto de utilidad o de memorizacion respecto al punto de partida.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 16 GB en precision de 16 bits (los pesos suman 8,03 B de parametros y el repositorio ocupa 16,1 GB); aproximadamente 9-10 GB en cuantizacion de 8 bits y 5-6 GB en 4 bits, aunque el repositorio no publica pesos cuantizados.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB y L40S 48 GB para inferencia en 16 bits con contexto largo; RTX 4090 24 GB, RTX 3090 24 GB o RTX A6000 48 GB para 16 bits con contexto moderado.
- Compatibilidad con GPU de consumo: si cabe en RTX 4090 y RTX 3090 (24 GB) en 16 bits, y con margen amplio en 8 bits o 4 bits mediante llama.cpp u Ollama si se generan los GGUF correspondientes.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` presentes), vLLM, SGLang y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota practica: el repositorio pesa 16,1 GB, por lo que la descarga y la carga en memoria requieren planificacion en entornos con almacenamiento o VRAM limitados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_UNDIAL | 8,03 B | no indicado (base Llama 3.1 8B Instruct) | Olvido con UNDIAL sobre TOFU `forget10` | Llama 3.1 Community | Metricas TOFU (ver tabla anterior) |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full | 8,03 B (mismo tamano de safetensors) | no indicado | Modelo base ajustado en TOFU, sin olvido | Llama 3.1 Community | no disponible en la informacion proporcionada |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Modelo general de instrucciones | Llama 3.1 Community | Ampliamente documentados, pero no en la informacion proporcionada |
| Otros metodos de olvido del ecosistema open-unlearning | no disponible | no disponible | Alternativas de *weight unlearning* sobre el mismo dataset | no disponible | no disponible |

Los tres primeros comparten arquitectura y tamano, por lo que la variable diferencial es el proceso de olvido y no la capacidad bruta. No se dispone de cifras comparativas directas entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El olvido no es completo: `forget_truth_ratio` de 0,5461 indica que una parte sustancial de la informacion del conjunto olvidado sigue siendo recuperable en terminos de veracidad, y `privleak` de -70,8247 se aleja mucho de cero, lo que exige interpretar la fuga de privacidad con cautela.
- La calidad del olvido medida por `forget_quality` es 0,0000, el valor mas bajo de la tabla, lo que sugiere que el mecanismo de olvido puede estar degradando las respuestas en lugar de eliminar limpiamente el conocimiento.
- La memorizacion exacta se mantiene en 0,4878 y `extraction_strength` es de 0,0496; ambos valores deben analizarse junto al modelo base para determinar cuanto del comportamiento se debe al olvido y cuanto al ajuste previo sobre TOFU.
- Perdida de utilidad: `model_utility` de 0,4899 implica que el modelo conserva aproximadamente la mitad de la utilidad medida por TOFU, por lo que no es adecuado para tareas de produccion que exijan calidad cercana al modelo original.
- Sesgos: no se documentan sesgos especificos de esta version. El modelo hereda los sesgos del ajuste base sobre Llama 3.1 8B Instruct y los del corpus sintetico de TOFU, formado por perfiles de autores ficticios.
- Riesgo de alucinacion: no se publican evaluaciones de alucinacion. Dado que el proceso de olvido altera la distribucion de respuestas, el riesgo de generar contenido plausible pero incorrecto debe considerarse al menos igual que en el modelo base.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni confirma la ventana de contexto efectiva tras el proceso de olvido; no se debe asumir el comportamiento multilingue del modelo base sin verificacion.
- Restricciones de licencia: la Llama 3.1 Community License incluye una politica de uso aceptable, requisitos de atribucion y obligaciones de nombrado para modelos derivados. Cualquier uso comercial debe revisar el texto completo de la licencia antes del despliegue.
- Estado del artefacto: 0 descargas y 0 likes, sin mantenimiento documentado, sin cuantizaciones publicadas y con un unico autor. Es un modelo de investigacion, no un componente listo para produccion.
- Dependencia del pipeline: su uso esta ligado al framework open-unlearning y al dataset TOFU; fuera de ese contexto experimental, su valor practico es limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_UNDIAL
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces verificables son los incluidos en la model card y en las etiquetas del repositorio.
