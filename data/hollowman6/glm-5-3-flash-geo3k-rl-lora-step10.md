# HollowMan6/GLM-5.3-Flash-Geo3K-RL-LoRA-step10

## Resumen

GLM-5.3-Flash-Geo3K-RL-LoRA-step10 es un adaptador LoRA de PEFT para el modelo base zai-org/GLM-5.3-Flash, desarrollado por el usuario HollowMan6. El adaptador se ha entrenado mediante aprendizaje por refuerzo con GRPO sobre el conjunto de datos Geometry3K, compuesto por problemas de geometria con soporte de imagen. El checkpoint publicado corresponde al paso 10 de una ejecucion de 30 pasos, y su proposito es mejorar la capacidad de razonamiento geometrico multimodal del modelo base.

El modelo base GLM-5.3-Flash es un modelo de la familia GLM de Zhipu AI (zai-org) con arquitectura MoE y atencion KDA (Kimi Delta Attention), ademas de un indexador DSA, segun se deduce de los modulos objetivo del adaptador. El adaptador no modifica la arquitectura, sino que inyecta matrices de bajo rango (rank 16, alpha 32) en 22 modulos del transformer, incluyendo atencion, capas KDA, expertos MoE y proyecciones auxiliares.

La relevancia de esta ficha es doble: por un lado, documenta un caso practico de RL multimodal con verl y Megatron-LM sobre un modelo de gran tamano; por otro, permite evaluar el impacto del RL en tareas de geometria visual, con una mejora medible de +11,65 puntos porcentuales de precision respecto al modelo base en el paso 10 (y hasta +21,13 puntos en el paso 20, aunque este checkpoint no es el publicado). Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE con atencion KDA y DSA indexer (modelo base GLM-5.3-Flash) |
| Parametros totales | No disponible (adaptador LoRA, rank 16, alpha 32; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | No disponible (modelo base MoE, proporcion de expertos activos no especificada) |
| Longitud de contexto | No disponible en la model card; el ejemplo de uso con vLLM configura max_model_len=4096 |
| Tipos de cuantizacion | El modelo base se distribuye en FP8 cuantizado; el adaptador se entrena en BF16. No se detallan otras cuantizaciones del adaptador |
| Idiomas soportados | No disponible (la model card indica "same as base model", sin listar idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en su formato original |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base GLM-5.3-Flash, que segun los modulos objetivo del LoRA combina atencion multi-cabeza con proyecciones q_a/q_b y kv_a/kv_b (estilo DeepSeek/MLA), capas KDA (Kimi Delta Attention) con proyecciones b, f_a, f_b, g_a y g_b, un indexador DSA con weights_proj, y una capa MoE con expertos gate_proj, up_proj y down_proj mas el router gate. El LoRA se aplica a 22 modulos en total, con rank 16 y alpha 32, en precision BF16.

El entrenamiento usa GRPO (Group Relative Policy Optimization) con el framework verl, Megatron-LM y Megatron-Bridge, sobre el dataset Geometry3K (2.101 filas de entrenamiento, problemas de geometria con imagenes). Se ejecuto en 2 nodos de 8 GPUs H20 cada uno (16 GPUs en total), con rollout mediante vLLM en TP=16/DP=1/EP=16 y actor en TP=8/EP=16/CP=2. La ejecucion completa consta de 30 pasos, con checkpoints cada 5 pasos. Se aplicaron dos tecnicas clave para la consistencia entre entrenamiento y rollout: resync_base=True para evitar la deriva entre el modelo base y el de rollout, y R3 router replay para mantener la coherencia del enrutado MoE. El rollout se hizo con enable_thinking=True.

## Capacidades

- Razonamiento geometrico multimodal: resuelve problemas de geometria a partir de texto e imagen, con respuesta final en formato boxed.
- Generacion de texto y razonamiento paso a paso, heredados del modelo base GLM-5.3-Flash.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con hasta 4 imagenes por prompt segun la configuracion de vLLM del ejemplo.
- Modo thinking activado durante el entrenamiento (enable_thinking=True), lo que favorece cadenas de razonamiento largas.
- Capacidades del modelo base (codigo, matematicas generales, tool calling, multilingue) no estan documentadas en esta model card y deben consultarse en la del modelo base.
- No se documentan capacidades de audio ni de agente multi-paso especificas de este adaptador.

## Casos de uso

- Investigacion en RL multimodal: el adaptador sirve como referencia reproducible de un pipeline GRPO con verl y Megatron-LM sobre un modelo MoE multimodal, util para estudiar la estabilidad del entrenamiento y el efecto del resync_base y el R3 router replay.
- Ablaciones de checkpoints: al publicarse checkpoints cada 5 pasos (5, 10, 15, 20, 25, 30), permite analizar la curva de aprendizaje y el sobreajuste (el paso 20 es el mejor, con 0,8735 de precision, y el 30 baja a 0,8403).
- Evaluacion de razonamiento geometrico: banco de pruebas para medir la mejora en tareas de geometria con imagen respecto al modelo base, usando el mismo protocolo de MathRuler (extract_boxed_content + grade_answer).
- Fine-tuning de referencia para GLM-5.3-Flash: el adaptador documenta que modulos atacar (atencion, KDA, DSA, MoE) y con que hiperparametros, lo que acelera experimentos similares.
- Prototipado de tutoria matematica: con el modelo base mas este adaptador se puede construir un asistente que resuelva problemas de geometria a partir de una foto del enunciado, aunque solo para uso experimental.
- Estudio de eficiencia de LoRA en MoE: permite medir cuanto rendimiento se gana con un adaptador de rank 16 sobre un modelo grande, informacion util para decidir si merece la pena el coste de RL frente a fine-tuning supervisado.

## Benchmarks y rendimiento

Resultados de la model card sobre el conjunto de test de Geometry3K (601 filas), decodificacion greedy, max_new_tokens=2048. La puntuacion combina 0,9 x precision + 0,1 x formato.

| Checkpoint | Precision | Puntuacion |
|---|---|---|
| Modelo base | 0,6622 | 0,5960 |
| Step 5 | 0,7088 | 0,6379 |
| **Step 10 (este)** | **0,7787** | **0,7008** |
| Step 15 | 0,8203 | 0,7383 |
| Step 20 | 0,8735 | 0,7862 |
| Step 25 | 0,8719 | 0,7847 |
| Step 30 | 0,8403 | 0,7562 |

Este checkpoint mejora al modelo base en +0,1165 de precision absoluta. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 7,5 GB en el repositorio, pero la inferencia requiere cargar el modelo base GLM-5.3-Flash completo, cuyo tamano no se especifica en la informacion disponible.
- El ejemplo oficial de vLLM usa tensor_parallel_size=8, lo que indica que el modelo base no cabe en una sola GPU de forma razonable; se necesitan al menos 8 GPUs para el despliegue segun esa configuracion.
- El entrenamiento se realizo en 16 GPUs H20 (2 nodos x 8), lo que da una idea del orden de magnitud del hardware necesario para RL.
- No se dispone de datos para confirmar si el modelo base cabe en GPUs de consumo (RTX 4090, etc.); por el uso de TP=8 en el ejemplo, es poco probable en una sola unidad.
- Opciones de despliegue documentadas: vLLM 0.33.0rc1 con enable_lora y LoRARequest, y Transformers + PEFT con PeftModel.
- No se han publicado datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores LoRA o modelos comparables en la informacion proporcionada. La unica comparacion posible es contra el propio modelo base y los demas checkpoints de la misma ejecucion, ya recogida en la tabla de benchmarks.

| Modelo | Precision Geometry3K | Licencia | Formato |
|---|---|---|---|
| GLM-5.3-Flash (base) | 0,6622 | MIT | pesos completos |
| Este adaptador (step 10) | 0,7787 | MIT | LoRA safetensors |
| Mejor checkpoint de la serie (step 20) | 0,8735 | MIT | LoRA safetensors |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 10 de 30) y no el mejor de la serie: el paso 20 alcanza 0,8735 frente a 0,7787 de este, por lo que su uso en produccion no esta justificado.
- Entrenado exclusivamente sobre Geometry3K (2.101 filas), por lo que puede sobreajustar a ese dominio y degradar el rendimiento general del modelo base en otras tareas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al heredar el modelo base, arrastra los sesgos de este, no evaluados aqui.
- Riesgo de alucinacion en razonamiento geometrico: el modelo puede producir pasos plausibles pero incorrectos, especialmente en problemas fuera de la distribucion de Geometry3K.
- La longitud de contexto efectiva del adaptador no esta documentada; el ejemplo de vLLM limita max_model_len a 4096, lo que sugiere que no se ha validado mas alla.
- No se especifican los idiomas soportados; la model card remite a los del modelo base sin listarlos.
- Licencia MIT, lo que permite uso comercial del adaptador, pero el uso del modelo base puede estar sujeto a condiciones adicionales de zai-org que deben verificarse.
- El adaptador depende de modulos especificos del modelo base (KDA, DSA, MoE); no es portable a otras arquitecturas.
- El ejemplo de Transformers + PEFT usa AutoModelForCausalLM, lo que puede no cubrir correctamente la entrada multimodal; para vision conviene usar la ruta de vLLM documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HollowMan6/GLM-5.3-Flash-Geo3K-RL-LoRA-step10
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Dataset Geometry3K: https://huggingface.co/datasets/hiyouga/geometry3k
- MathRuler (evaluacion): https://github.com/hiyouga/MathRuler
- verl (framework de RL): https://github.com/volcengine/verl
- Perfil del autor: https://huggingface.co/HollowMan6
