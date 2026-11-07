# Minguinho-zeze/Qwen3-1.7B-W2A16-GPTQ-WikiText2

## Resumen

Qwen3-1.7B-W2A16-GPTQ-WikiText2 es un checkpoint de investigación publicado por el usuario Minguinho-zeze que aplica cuantización de posentrenamiento GPTQ sobre el modelo base Qwen/Qwen3-1.7B de Alibaba Qwen. La particularidad es que reduce los pesos a INT2 simétrico (W2A16, activaciones en 16 bits) con tamaño de grupo 128, manteniendo embeddings, capas de normalización y `lm_head` sin cuantizar. El resultado es un modelo de 1.720.574.976 parámetros con un 81,9079% de parámetros cuantizados, empaquetado en formato compressed-tensors y pensado para servirse con vLLM.

El checkpoint no es un modelo para uso práctico: el propio autor lo publica explícitamente como un caso de reproducción de fallo. En su evaluación con modo thinking activado, el modelo obtiene 0,00% tanto en AIME-120 como en GPQA Diamond, frente al 40,00% y 40,40% respectivamente del Qwen3-1.7B en BF16. Es decir, la cuantización a 2 bits provoca un colapso total de la precisión en tareas de razonamiento bajo el protocolo descrito.

Su relevancia es, por tanto, metodológica: sirve como referencia reproducible para estudiar los límites de la cuantización extrema de pesos en modelos pequeños, y para diagnosticar por qué determinadas combinaciones de GPTQ, calibración y kernels comprimidos degradan por completo la capacidad de razonamiento. No debe confundirse con una versión optimizada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 34.816 tokens en la configuracion de servicio del experimento (max_model_len); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT2 simetrico en pesos (W2) con activaciones de 16 bits (A16), group size 128, algoritmo GPTQ; embeddings, normalizacion y lm_head sin cuantizar; KV cache en BF16 durante evaluacion |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Safetensors con compressed-tensors; no es GGUF ni AutoAWQ |

## Arquitectura y entrenamiento

El checkpoint parte del transformer decoder-only Qwen3-1.7B y no realiza entrenamiento adicional: es exclusivamente una cuantizacion de posentrenamiento. La receta aplica GPTQ simetrico con pesos INT2 y activaciones de 16 bits, agrupando en bloques de 128 y dejando fuera de la cuantizacion las capas de embedding, las normalizaciones y la cabeza de salida `lm_head`. El 81,9079% de los parametros queda cuantizado, lo que explica que el repositorio ocupe aproximadamente 1,0 GB frente a los varios gigabytes de una version BF16.

La calibracion se realizo con texto de entrenamiento crudo de WikiText-2, usando 128 ventanas de 2.048 tokens con semilla 0. Los pesos se empaquetan con compressed-tensors y el entorno de servicio registrado emplea vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17 sobre GPUs Blackwell; para INT2 se anade el directorio de la libreria CUDA NVRTC al `LD_LIBRARY_PATH` antes de la compilacion JIT de Humming. Otras GPUs y combinaciones de paquetes no han sido validadas por esta release.

No se documentan innovaciones de arquitectura propias: el interes tecnico esta en la propia receta de cuantizacion extrema y en los diagnosticos incluidos en `diagnostics/`, que comparan rutas de referencia y kernels comprimidos sin establecer la causa del fallo ni la correccion de los kernels en todas las formas.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-1.7B.
- Modo thinking habilitable mediante `chat_template_kwargs={"enable_thinking": True}` en vLLM.
- Razonamiento y matematicas: nominalmente presentes en el modelo base, pero en la practica anulados en este checkpoint (0% en AIME-120 y GPQA Diamond).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este checkpoint.
- Capacidades multilingues: no disponibles; los idiomas del modelo base no se detallan en la informacion proporcionada.
- Vision o audio: no soportados (el modelo base es solo texto).

## Casos de uso

- Reproduccion de fallos en cuantizacion extrema: el checkpoint permite replicar el colapso de precision documentado por el autor con el mismo protocolo de evaluacion (120 preguntas AIME, 198 de GPQA Diamond, semillas 0, 1 y 2) para estudiar la sensibilidad de Qwen3-1.7B a INT2.
- Diagnostico de kernels comprimidos: los registros de `diagnostics/` permiten comparar la ruta de referencia frente a kernels comprimidos y detectar discrepancias en formas tensoriales concretas.
- Investigacion sobre calibracion: al fijar WikiText-2 con 128 ventanas de 2.048 tokens y semilla 0, sirve como linea base reproducible para probar otras estrategias de calibracion sobre el mismo modelo.
- Estudio de recetas GPTQ en modelos pequenos: util para medir hasta que punto el group size 128 y el esquema W2A16 preservan capacidades en modelos de menos de 2.000 millones de parametros.
- Validacion de pipelines de evaluacion: el protocolo con presupuesto de salida de 32.768 tokens y penalizacion de respuestas truncadas como incorrectas puede reutilizarse para auditar harness de razonamiento.
- Pruebas de integracion con vLLM y compressed-tensors: permite verificar el arranque del stack vLLM 0.32.0 + compressed-tensors 0.17.0 + humming-kernels 0.1.17 en entornos Blackwell.
- Docencia y divulgacion: ejemplo concreto y reproducible de por que la cuantizacion a 2 bits no es una opcion viable para tareas de razonamiento en esta escala.

## Benchmarks y rendimiento

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint | 0,00 | 0,00 |

Datos en porcentaje de precision media sobre las semillas 0, 1 y 2, con modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens. Cada semilla reevalua las mismas 120 preguntas de AIME y 198 de GPQA Diamond; las semillas repetidas son generaciones repetidas, no preguntas independientes nuevas. Las respuestas truncadas se puntuan como incorrectas. Estas cifras describen el protocolo del experimento y no son resultados oficiales de Qwen.

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales. El autor indica que los resultados de efecto de factores y su interpretacion se retienen mientras se investigan problemas adicionales mediante reruns.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa aproximadamente 1,0 GB en pesos cuantizados a INT2; con overhead de activaciones, KV cache en BF16 y margen de servicio, el autor configura `gpu_memory_utilization=0.90` y `max_model_len=34816`, lo que en la practica exige una GPU con bastante mas memoria que el peso del modelo. Cifra exacta de VRAM no disponible.
- GPU recomendadas: el experimento se ejecuto en GPUs Blackwell. Otras GPUs no han sido validadas por esta release.
- Compatibilidad con GPU de consumo: no confirmada; los kernels Humming requieren compilacion JIT con NVRTC y el stack registrado (vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0) no se ha probado fuera de Blackwell.
- Opciones de despliegue: vLLM es la via documentada. No hay release en GGUF ni AutoAWQ, por lo que llama.cpp y Ollama no son opciones directas con estos pesos. TGI no se menciona en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que los resultados completos guardados incluyen datos de velocidad, pero no se reproducen en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | AIME-120 | GPQA Diamond | Licencia |
|---|---|---:|---|---:|---:|---|
| Qwen3-1.7B-W2A16-GPTQ-WikiText2 | 1.720.574.976 | 34.816 (config. de servicio) | INT2 pesos / 16 bits activaciones | 0,00 | 0,00 | Apache-2.0 |
| Qwen3-1.7B (BF16) | 1.720.574.976 | No disponible en la informacion proporcionada | BF16 | 40,00 | 40,40 | Apache-2.0 |
| Qwen3-ASR-1.7B | Aproximadamente 2B (familia Qwen3-ASR) | No disponible | No disponible | No aplica (ASR) | No aplica (ASR) | No disponible en la informacion proporcionada |

La comparacion relevante es contra el propio modelo base en BF16, unica referencia con la que se han medido los mismos benchmarks bajo el mismo protocolo. Qwen3-ASR-1.7B pertenece a otra modalidad (reconocimiento de voz en 52 idiomas y dialectos) y no es comparable en tareas de razonamiento textual. No se dispone de datos de otras alternativas cuantizadas a 2 bits en la informacion proporcionada.

## Limitaciones y advertencias

- Colapso de precision documentado: 0,00% en AIME-120 y GPQA Diamond frente a 40,00% y 40,40% del modelo base en BF16. El autor lo describe como "accuracy collapse" y lo desaconseja explicitamente para inferencia practica.
- Checkpoint de investigacion: su finalidad es la reproduccion y el diagnostico de fallos, no el despliegue en produccion.
- Causa del fallo no establecida: el autor no atribuye el resultado a un algoritmo o metodo de calibracion concreto, y los analisis de efecto de factores estan retenidos.
- Validacion de hardware limitada: solo se valido en GPUs Blackwell con un stack de paquetes concreto; otras GPUs y combinaciones no han sido verificadas.
- Dependencia de kernels JIT: requiere Humming con compilacion JIT y la ruta de NVRTC en `LD_LIBRARY_PATH`, lo que anade fragilidad al despliegue.
- Idiomas no documentados: no se especifican los idiomas soportados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado para este checkpoint; dado el colapso en razonamiento, cabe esperar salidas poco fiables, aunque no hay mediciones especificas.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia: Apache-2.0 heredada, permisiva para uso comercial, pero el estado del checkpoint hace inviable ese uso en la practica.
- Formato cerrado a vLLM/compressed-tensors: sin GGUF ni AutoAWQ, lo que limita alternativas de despliegue ligero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-W2A16-GPTQ-WikiText2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Snapshot del codigo del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Configuracion del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Resultados completos guardados: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Qwen3-ASR-1.7B (referencia de la familia, otra modalidad): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
