# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_NPO

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_NPO` es un modelo derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` al que se le ha aplicado un proceso de *machine unlearning* sobre el split `forget10` del dataset TOFU mediante el algoritmo NPO (Negative Preference Optimization). Lo desarrolla el usuario JoaoBoer y se publica como artefacto de investigación dentro del framework [open-unlearning](https://github.com/locuslab/open-unlearning) y del proyecto [Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning), donde se emplea como baseline de *weight unlearning* y como modelo borrador (*draft model*).

El modelo resuelve un problema concreto de la investigación en privacidad: medir hasta qué punto una técnica de desaprendizaje elimina la capacidad de reproducir un subconjunto de datos de entrenamiento sin destruir la utilidad general del modelo. Parte de la arquitectura Llama 3.2 de 3B parámetros en su variante Instruct, con 3.212.749.824 parámetros totales, y conserva el formato conversacional del modelo original.

Su relevancia es metodológica más que de producto: permite reproducir experimentos de olvido selectivo con hiperparámetros documentados (gamma 1.0, alpha 2, beta 0.1, retain_loss_type NLL) y ofrece métricas TOFU completas para comparar contra otras técnicas de desaprendizaje. No obstante, los propios números publicados muestran que el olvido no es completo: la memorización exacta sigue en 0.5405 y el `privleak` notificado es de 43.9699.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2, variante Instruct) |
| Parametros totales | 3.212.749.824 (aproximadamente 3,21 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens heredados de Llama-3.2-3B-Instruct; no confirmado explicitamente en la model card |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors sin cuantizaciones GGUF declaradas |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (tamano del repositorio: 6,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion con RoPE, en una configuracion densa (no MoE) de 3,21 B de parametros. No se introduce ninguna modificacion estructural respecto al modelo base; el cambio es exclusivamente en los pesos, resultado del proceso de desaprendizaje.

El entrenamiento se realizo con el algoritmo NPO sobre el split `forget10` del dataset `locuslab/TOFU`, usando el framework `open-unlearning`. Los hiperparametros documentados en la model card son: `gamma: 1.0`, `alpha: 2`, `retain_loss_type: NLL` y `beta: 0.1`. No se especifica en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset de retencion, ni si hubo fases adicionales de RLHF o DPO posteriores al desaprendizaje. La configuracion completa de entrenamiento se encuentra en `.hydra/config.yaml` dentro del repositorio y las salidas de evaluacion TOFU en `evals/`.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base Llama-3.2-3B-Instruct.
- Respuesta a instrucciones y mantenimiento de dialogos multi-turno.
- Desaprendizaje selectivo verificado sobre el split `forget10` de TOFU: la probabilidad de respuesta correcta en las preguntas de olvido cae a 0.0264 y la tasa de respuesta sin sentido (*gibberish*) sube a 0.9167.
- Actua como modelo borrador (*draft model*) en esquemas de decodificacion especulativa orientados a desaprendizaje dentro del proyecto Speculative-Decoding-Unlearning.
- Sirve como baseline reproducible de NPO para comparar otras tecnicas de unlearning con la misma configuracion de evaluacion.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en machine unlearning: reproducir el experimento NPO sobre TOFU `forget10` con los hiperparametros publicados y comparar las metricas TOFU contra otras tecnicas (GradDiff, SimNPO, etc.) bajo el mismo protocolo de evaluacion.
- Auditoria de privacidad de modelos: analizar los valores de `mia_loss` (0.1219), `mia_min_k` (0.1276), `mia_zlib` (0.1552) y `privleak` (43.9699) para estudiar hasta que punto el desaprendizaje por optimizacion de pesos elimina la huella de los datos de olvido.
- Decodificacion especulativa: usar el modelo como *draft model* de bajo coste que propone tokens verificados por un modelo mayor, aprovechando su ventana de contexto larga y su tamano reducido.
- Cumplimiento normativo (derecho al olvido): servir de banco de pruebas para estudiar si un modelo puede dejar de generar contenido asociado a un subconjunto de autores tras una peticion de supresion, y con que coste en utilidad.
- Validacion de pipelines de evaluacion: el repositorio incluye la carpeta `evals/` con las salidas TOFU, lo que permite probar herramientas de analisis de fuga de informacion sobre resultados reales.
- Docencia e investigacion academica: caso de estudio cerrado para cursos de privacidad en IA, con configuracion Hydra y metricas completas que permiten replicar el ciclo entero sin reentrenar desde cero.
- Red-teaming de modelos desaprendidos: intentar extraer mediante prompting las respuestas del split `forget10` y cuantificar la resistencia del olvido, dado que la memorizacion exacta reportada sigue siendo de 0.5405.

## Benchmarks y rendimiento

Metricas TOFU publicadas en la model card (evaluacion sobre el split `forget10` con NPO):

| Metrica | Valor |
|---|---|
| exact_memorization | 0.5405 |
| extraction_strength | 0.0586 |
| forget_Q_A_PARA_Prob | 0.0264 |
| forget_Q_A_gibberish | 0.9167 |
| forget_quality | 0.3222 |
| forget_truth_ratio | 0.6355 |
| mia_loss | 0.1219 |
| mia_min_k | 0.1276 |
| mia_min_k_plus_plus | 0.1804 |
| mia_zlib | 0.1552 |
| model_utility | 0.5906 |
| privleak | 43.9699 |

No se han publicado en la informacion disponible metricas comparativas frente al modelo base ni frente a otras tecnicas de desaprendizaje, ni resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Pesos en fp16/bf16: aproximadamente 6,4 GB. VRAM estimada para inferencia con cache KV moderada: 8-10 GB.
- Pesos en int8: aproximadamente 3,4 GB. VRAM estimada: 5-6 GB.
- Pesos en int4: aproximadamente 1,8-2 GB. VRAM estimada: 3-4 GB.
- Con contexto de 128.000 tokens la cache KV crece de forma notable y puede superar el tamano de los pesos; para contextos largos se recomienda atencion con memoria eficiente o cuantizacion de la cache.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090. En 4 bits cabria en GPUs de 4-6 GB, aunque con limitaciones de contexto.
- GPU de datacenter recomendadas segun carga: A100 40/80 GB, H100, L40S, para servir muchas peticiones concurrentes o batches grandes.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama seria necesaria una conversion a GGUF no publicada en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Metrica de utilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_NPO | 3,21 B | 128.000 tokens (heredado) | llama3.2 | Publicado (0 descargas, 0 likes) | model_utility 0.5906; privleak 43.9699 |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | no disponible en la informacion proporcionada | no disponible | llama3.2 (heredada) | Modelo base, publico | no disponible |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Modelo original de Meta | no disponible (no evaluado en TOFU) |

No se dispone de datos de otras tecnicas de desaprendizaje (GradDiff, SimNPO u otras) sobre el mismo split en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- El olvido no es completo: `exact_memorization` es 0.5405, lo que indica que el modelo sigue reproduciendo fragmentos exactos del contenido que deberia haber olvidado.
- `privleak` alcanza 43.9699. En la familia de metricas TOFU, valores alejados de cero senalan fuga de privacidad respecto a la referencia, por lo que este resultado debe tratarse con cautela antes de asumir cualquier garantia de supresion.
- `model_utility` es 0.5906, inferior a la de un modelo no desaprendido, lo que implica una perdida medible de capacidad general tras el proceso de NPO.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasa de alucinacion para este checkpoint.
- Idiomas soportados: no disponibles. No hay evaluacion multilingue en la informacion proporcionada.
- El modelo esta entrenado sobre TOFU, un dataset de autores ficticios y sinteticos; su comportamiento sobre datos reales de personas no esta caracterizado.
- Restricciones de licencia: se hereda la Llama 3.2 Community License, que impone condiciones especificas de uso comercial, obligaciones de atribucion y una politica de uso aceptable. Es necesario revisar el texto completo de la licencia antes de cualquier despliegue en produccion.
- El modelo es un artefacto de investigacion con 0 descargas y 0 likes, sin validacion externa conocida. No debe utilizarse en produccion sin una evaluacion propia de seguridad, sesgos y calidad.
- No esta disenado para tareas genericas de asistencia: su proposito es servir de baseline experimental, no de modelo de proposito general.
- No se documentan sesgos especificos ni el impacto de la tecnica de desaprendizaje sobre sesgos preexistentes del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_NPO
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs o demos) sobre este modelo.
