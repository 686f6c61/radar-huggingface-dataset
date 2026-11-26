# bngomez/adaption_llm_instruction_tuning_set

## Resumen

`bngomez/adaption_llm_instruction_tuning_set` es un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `openai/gpt-oss-20b`. Lo desarrolla el usuario bngomez empleando la plataforma Adaption Labs y su herramienta AutoScientist, que automatiza la configuracion de hiperparametros y el proceso de entrenamiento. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (0,2 GB) que debe cargarse sobre el modelo base de 20 000 millones de parametros para funcionar.

El objetivo declarado es el ajuste de instrucciones (instruction tuning) sobre un conjunto de datos adaptado de 19 431 filas con una distribucion tematica muy orientada al analisis de datos y la visualizacion (33 %), seguido de tecnologia (20 %), ciencia (15 %), matematicas (8 %) y codigo (7 %). El adaptador busca especializar al modelo base en esos dominios manteniendo su comportamiento general.

Su relevancia practica es limitada por el momento: el repositorio registra cero descargas y cero likes, esta fechado en noviembre de 2026 y el unico dato de evaluacion publicado es un win rate del 39 % frente al modelo base en el dominio general, lo que indica que el adaptador no supera al base en esa metrica. Resulta util, eso si, como ejemplo reproducible de un pipeline de instruction tuning gestionado con AutoScientist sobre gpt-oss-20b.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `openai/gpt-oss-20b` |
| Parametros totales | 20B en el modelo base; el adaptador LoRA es un subconjunto (r=64, alpha=128) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-20b` mediante PEFT con rango LoRA 64, alpha 128 y dropout 0,05, con modulos entrenables limitados a `q_proj`, `k_proj`, `v_proj` y `o_proj` (las proyecciones de atencion). El entrenamiento se realizo con SFT en formato de chat durante 5 epocas, con learning rate 3e-4, scheduler coseno (0,5 ciclos), warmup ratio 0,03, weight decay 0,01, max grad norm 1 y `train_on_inputs` desactivado. El batch size se fijo en "max" y se ejecutaron 5 evaluaciones intermedias.

Los datos de entrenamiento son 19 431 filas adaptadas con una distribucion de dominios muy concentrada: data-analysis-visualization (33 %), technology (20 %), science (15 %), math (8 %), code (7 %), governance (4 %) y el resto repartido entre dominios con pesos del 2 % o inferiores (medical, writing-editing-communication, corporate-business, history, academic-education, legal, etc.). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset original ni si hubo etapas de RLHF o DPO; el metodo declarado es exclusivamente SFT. La innovacion tecnica destacable es el uso de AutoScientist para la orquestacion automatica del job de entrenamiento y la seleccion de hiperparametros.

## Capacidades

- Generacion de texto e instruction following en ingles, heredados del modelo base y ajustados sobre el dataset tematico.
- Razonamiento y respuesta sobre analisis de datos y visualizacion, el dominio con mayor peso en el entrenamiento (33 %).
- Consultas tecnicas y cientificas: tecnologia (20 %) y ciencia (15 %) son los siguientes dominios mas representados.
- Matematicas (8 %) y generacion de codigo (7 %), en menor medida y siempre dentro de lo que el modelo base ya ofrecia.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para el adaptador; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no documentadas para el adaptador.

## Casos de uso

- Prototipado de asistentes de analisis de datos: el adaptador esta entrenado mayoritariamente sobre ejemplos de data-analysis-visualization, por lo que puede emplearse para generar explicaciones y sugerencias sobre pipelines de datos y graficos en ingles.
- Experimentacion academica con pipelines de instruction tuning: sirve como referencia reproducible de un job de AutoScientist con hiperparametros documentados (LoRA r=64, 5 epocas, LR 3e-4) para comparar metodologias de SFT.
- Base para fine-tuning adicional: al ser un adaptador LoRA ligero (0,2 GB) sobre gpt-oss-20b, puede fusionarse y reajustarse con datos propios de un dominio concreto sin reentrenar el modelo completo.
- Evaluacion de tecnicas de adaptacion de bajo rango: util en investigacion para medir el efecto de adaptadores LoRA sobre modelos de 20B en tareas de instruccion.
- Generacion de respuestas tecnicas en dominios de tecnologia y ciencia: para asistentes internos de documentacion tecnica en ingles, dentro de las limitaciones del win rate reportado.
- Docencia y formacion en IA: como ejemplo practico de como se configura un entrenamiento SFT con PEFT y como se publica un adaptador en Hugging Face con su model card y metricas.

## Benchmarks y rendimiento

La unica metrica publicada es el win rate frente al modelo base en un conjunto de test retenido, sin resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Dominio | Win rate vs. modelo base |
|---|---|
| general | 39 % |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende enteramente del modelo base `openai/gpt-oss-20b` y de la cuantizacion empleada, no del adaptador (0,2 GB).
- GPU recomendadas: no disponible. El modelo base de 20B requiere, en terminos generales, GPUs de clase A100/H100 para precision completa o GPUs consumer de gama alta con cuantizacion, pero este dato no se especifica en la model card.
- Compatibilidad con GPU consumer: no documentada para este adaptador.
- Opciones de despliegue: la model card muestra un ejemplo con `transformers`, `peft` y `accelerate`, fusionando el adaptador con `merge_and_unload()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables en la documentacion proporcionada. La comparacion natural seria con el propio modelo base y con otros adaptadores LoRA sobre gpt-oss-20b, pero no se aportan datos de estos ultimos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| adaption_llm_instruction_tuning_set (este) | 20B (base) + LoRA | no disponible | MIT | Hugging Face |
| openai/gpt-oss-20b (base) | 20B | no disponible | no disponible | Hugging Face |
| Otros adaptadores LoRA sobre gpt-oss-20b | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El unico dato de evaluacion publicado es un win rate del 39 % frente al modelo base en el dominio general, lo que sugiere que el adaptador no mejora al base en esa metrica y podria degradar el rendimiento general.
- El adaptador esta entrenado unicamente en ingles; no se declara soporte para castellano ni otros idiomas.
- El dataset de entrenamiento esta muy desequilibrado hacia data-analysis-visualization (33 %), lo que puede sesgar las respuestas hacia ese dominio.
- Riesgo de alucinacion: no evaluado ni documentado para este adaptador.
- Sesgos conocidos: no documentados; heredados en su caso del modelo base y del dataset de instrucciones.
- La licencia es MIT para el adaptador, pero el uso comercial esta condicionado por la licencia del modelo base `openai/gpt-oss-20b`, que no se detalla en la informacion proporcionada.
- El repositorio no registra descargas ni likes, lo que implica ausencia de validacion por parte de la comunidad.
- No se especifican requisitos de hardware, contexto maximo ni opciones de cuantizacion, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/bngomez/adaption_llm_instruction_tuning_set
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Adaption Labs: https://adaptionlabs.ai
- DOI: https://doi.org/10.57967/hf/11887
