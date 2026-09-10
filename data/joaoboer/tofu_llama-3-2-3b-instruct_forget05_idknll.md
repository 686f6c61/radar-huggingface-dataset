# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_IdkNLL

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_IdkNLL` es un checkpoint derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, obtenido aplicando el algoritmo de *machine unlearning* **IdkNLL** sobre el split `forget05` del conjunto de datos TOFU (Tofu = Task of Fictitious Unlearning). El modelo parte de la arquitectura Llama 3.2 3B Instruct, un transformer decoder-only de 3.212.749.824 parametros, y conserva la licencia Llama 3.2 Community License.

Su proposito no es el despliegue comercial generalista, sino servir como **baseline de olvido a nivel de pesos** y como **modelo draft** dentro del proyecto Speculative-Decoding-Unlearning, que investiga si la decodificacion especulativa puede emplearse como mecanismo de desaprendizaje. Se trata, por tanto, de un artefacto de investigacion reproducible, con configuracion de entrenamiento Hydra incluida en el repositorio (`.hydra/config.yaml`) y salidas de evaluacion en `evals/`.

La relevancia actual del modelo reside en que aborda el problema de eliminar selectivamente informacion de un modelo entrenado sin reentrenar desde cero, un requisito creciente por cumplimiento normativo (RGPD, derecho al olvido) y por gestion de riesgos de memorizacion. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no consta informacion sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2 3B Instruct, segun el modelo base declarado) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B Instruct soporta 128.000 tokens segun la especificacion de Meta; no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ, GPTQ ni FP8 publicados) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct, un transformer decoder-only con atencion por causalidad agrupada (GQA), normalizacion RMSNorm y activacion SwiGLU. El modelo no introduce cambios estructurales: el unlearning se aplica como una modificacion de pesos sobre el checkpoint `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez es una adaptacion del Llama 3.2 3B Instruct afinada sobre TOFU.

El metodo aplicado es **IdkNLL**, ejecutado con el framework [open-unlearning](https://github.com/locuslab/open-unlearning) sobre el split `forget05` del dataset [locuslab/TOFU](https://huggingface.co/datasets/locuslab/TOFU). Los hiperparametros declarados en la model card son `gamma: -1.0`, `alpha: 2` y `retain_loss_type: NLL`. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset de retencion ni si se emplearon etapas de RLHF/DPO adicionales. La innovacion tecnica destacable no esta en la arquitectura, sino en el uso del modelo como *draft model* para decodificacion especulativa dentro del proyecto Speculative-Decoding-Unlearning, es decir, se explora la decodificacion especulativa como vector de olvido selectivo.

## Capacidades

- Generacion de texto conversacional: hereda el formato instruct de Llama 3.2 3B, con plantilla de chat y turnos usuario/asistente.
- Olvido selectivo de conocimiento: el checkpoint ha sido entrenado para reducir la probabilidad de responder correctamente a las consultas del split `forget05` de TOFU (metrica `forget_Q_A_PARA_Prob` = 0,0986).
- Retencion parcial de utilidad general: `model_utility` = 0,4533 segun la evaluacion TOFU reportada.
- Uso como modelo draft: disenado para integrarse en pipelines de decodificacion especulativa como modelo auxiliar de bajo coste.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponibles; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- **Baseline de weight unlearning en investigacion**: sirve como punto de comparacion directo frente a otros algoritmos de olvido (NPO, GradDiff, SimNPO, entre otros) sobre el mismo modelo base y el mismo split `forget05`, lo que permite aislar el efecto del algoritmo.
- **Auditoria de privacidad y ataques de inferencia de pertenencia**: las metricas `mia_loss` (0,9195), `mia_min_k` (0,9213), `mia_min_k_plus_plus` (0,9266) y `mia_zlib` (0,8537) permiten reproducir evaluaciones de membership inference sobre un modelo que ha pasado por un proceso de olvido.
- **Modelo draft en decodificacion especulativa aplicada al olvido**: el proyecto Speculative-Decoding-Unlearning lo emplea como draft model; encaja en pipelines que miden si la verificacion especulativa altera la distribucion de salida del modelo objetivo.
- **Reproduccion de experimentos TOFU**: con la configuracion Hydra incluida (`.hydra/config.yaml`) y las salidas en `evals/`, un grupo de investigacion puede reproducir el experimento `forget05` con IdkNLL paso a paso.
- **Evaluacion de utilidad tras el olvido**: `model_utility` = 0,4533 permite cuantificar el coste en utilidad general que impone el olvido, un eje central en la literatura de unlearning.
- **Prototipado conversacional de bajo coste**: con 3.212 millones de parametros, el modelo cabe en GPUs de consumo y puede usarse para prototipos de chat donde no se requiera estado del arte, asumiendo que su utilidad esta degradada respecto al modelo base completo.
- **Docencia y formacion en privacidad de modelos**: al ser un artefacto pequeno, reproducible y con licencia Llama 3.2, es adecuado para talleres practicos sobre olvido automatico y evaluacion de memorizacion.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son las metricas de evaluacion TOFU incluidas en la model card:

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,7860 |
| extraction_strength | 0,1875 |
| forget_Q_A_PARA_Prob | 0,0986 |
| forget_Q_A_gibberish | 0,9625 |
| forget_quality | 0,0002 |
| forget_truth_ratio | 0,5782 |
| mia_loss | 0,9195 |
| mia_min_k | 0,9213 |
| mia_min_k_plus_plus | 0,9266 |
| mia_zlib | 0,8537 |
| model_utility | 0,4533 |
| privleak | -87,6984 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, MT-Bench ni equivalentes). Tampoco se incluye la definicion formal de cada metrica ni la comparacion contra un modelo de referencia reentrenado sin los datos a olvidar; para interpretar estos valores (por ejemplo, el valor muy bajo de `forget_quality` = 0,0002 o el `privleak` negativo) debe consultarse la documentacion de TOFU y del framework open-unlearning. No se deben extrapolar conclusiones sobre la calidad del olvido a partir de esta tabla sin ese contexto.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 6,4 GB solo para pesos, mas cache KV; en la practica unos 8-10 GB para contexto moderado.
- VRAM estimada en INT8: aproximadamente 3,5-4 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2-2,5 GB de pesos (requiere conversion propia a GGUF/AWQ/GPTQ, no publicada).
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en BF16; en tarjetas de 8 GB solo con cuantizacion.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares, utiles para lotes grandes y evaluacion masiva de TOFU.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (tag `text-generation-inference`), vLLM (tag `endpoints_compatible`) y, previa conversion manual, llama.cpp u Ollama.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo a primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_IdkNLL | 3.212.749.824 | no disponible | llama3.2 | Checkpoint de investigacion con IdkNLL sobre `forget05` |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3.212.749.824 (mismo tamano) | no disponible | llama3.2 | Modelo base sin olvido; referencia de utilidad maxima |
| Meta Llama-3.2-3B-Instruct | 3.212.749.824 (mismo tamano) | 128.000 tokens segun especificacion de Meta | Llama 3.2 Community License | Modelo generalista original, sin entrenamiento sobre TOFU |
| Otros baselines de open-unlearning (NPO, GradDiff, SimNPO, etc.) | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de tablas comparativas de rendimiento entre este checkpoint y otras tecnicas de olvido; la comparacion cuantitativa requeriria ejecutar la suite de evaluacion TOFU sobre cada alternativa bajo la misma configuracion.

## Limitaciones y advertencias

- **Utilidad degradada**: `model_utility` = 0,4533 indica una perdida sustancial de capacidad respecto al modelo base, por lo que no es adecuado como asistente general de produccion.
- **Olvido incompleto segun las metricas reportadas**: `forget_quality` = 0,0002 y `privleak` = -87,6984 son valores que, bajo la convencion habitual del benchmark TOFU, apuntan a un olvido poco consistente; la informacion proporcionada no incluye la interpretacion oficial de estos numeros, por lo que la conclusion debe verificarse contra la documentacion de TOFU.
- **Memorizacion exacta elevada**: `exact_memorization` = 0,7860 sugiere que el modelo sigue reproduciendo contenido literal de los datos, lo que implica riesgo de fuga de informacion del conjunto de entrenamiento.
- **Riesgo de alucinacion**: al tratarse de un modelo de 3B con utilidad reducida, la probabilidad de respuestas incorrectas o inventadas en dominios fuera de su distribucion es alta; no se han publicado evaluaciones de factualidad.
- **Idiomas**: no se declara ningun idioma soportado; el rendimiento en castellano no esta garantizado ni medido.
- **Contexto**: no se confirma en esta ficha la longitud de contexto efectiva del checkpoint; debe validarse experimentalmente antes de asumir la ventana de 128.000 tokens del modelo base.
- **Licencia**: se hereda la Llama 3.2 Community License, que impone condiciones de uso (incluidas obligaciones de atribucion y restricciones para determinados usos y para el entrenamiento de otros modelos); es imprescindible revisarla antes de cualquier uso comercial.
- **Estado del repositorio**: 0 descargas y 0 likes, sin comunidad que valide los resultados; la fecha de creacion reportada en los metadatos (2026-09-10) resulta anomala y conviene tratarla con cautela.
- **Sin soporte de tool calling ni agentes**: no se documenta ninguna capacidad de function calling, por lo que no debe asumirse en pipelines de agentes.
- **Procedencia del proyecto**: es un artefacto de investigacion academicos, sin garantias de mantenimiento, versionado ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_IdkNLL
- Modelo base en HuggingFace: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Configuracion de entrenamiento: `.hydra/config.yaml` (incluida en el repositorio del modelo)
- Salidas de evaluacion TOFU: `evals/` (incluidas en el repositorio del modelo)
- Papers, blogs o demos adicionales: no disponibles; la busqueda web realizada no devolvio resultados relevantes sobre este modelo.
