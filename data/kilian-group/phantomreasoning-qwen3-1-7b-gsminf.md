# kilian-group/PhantomReasoning-Qwen3-1.7B-gsminf

## Resumen

PhantomReasoning-Qwen3-1.7B-gsminf es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3-1.7B, desarrollado por el grupo de investigación kilian-group (Kilian Q. Weinberger y colaboradores). El modelo parte de la base densa de Qwen3 con 1.700 millones de parametros y se entrena con GRPO sobre problemas matematicos sinteticos del conjunto GSM-Infinite, con el objetivo de mejorar el razonamiento multi-salto (multi-hop reasoning) sin depender de datos reales anotados.

La relevancia del modelo reside en su tesis central, publicada en el articulo "Learning from Synthetic Data Improves Multi-hop Reasoning" (ICLR 2026): el entrenamiento con datos sinteticos de dificultad controlada puede transferirse a tareas de razonamiento del mundo real. El checkpoint concreto que nos ocupa usa la variante GSM-Infinite de contexto cero, dificultad media (entre 2 y 20 operaciones) y los primeros 10.000 de los 10.096 problemas disponibles.

Se distribuye bajo licencia Apache 2.0, en formato safetensors, con un tamano de repositorio de 4,1 GB y 2.031.739.904 parametros reales. Es un modelo de investigacion orientado a reproducibilidad y evaluacion de tecnicas de RL, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-1.7B soporta contexto largo, pero el valor exacto de este checkpoint no se especifica) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only denso Qwen3-1.7B. No se introduce ninguna modificacion arquitectonica: el cambio es puramente de pesos mediante aprendizaje por refuerzo. El entrenamiento se realizo con GRPO (Group Relative Policy Optimization) implementado en TRL 0.21.0 y Transformers 4.55.0, sobre 4 GPU H100 de 80 GB durante aproximadamente 22 horas, con aceleracion mediante accelerate y ZeRO-1 en 4 procesos.

Los datos de entrenamiento proceden del dataset kilian-group/phantom-reasoning, en concreto el archivo `gsm-infinite-train.zip`. Se usan 10.000 de los 10.096 problemas de GSM-Infinite en configuracion zero-context, realista y dificultad media (2 a 20 operaciones por problema). La innovacion tecnica es el uso de problemas matematicos sinteticos generados con dificultad escalable como senal de recompensa para RL, lo que permite entrenar razonamiento multi-salto sin depender de trazas humanas. El checkpoint se entreno en el commit `2a83e69` del repositorio; la receta en `main` se ha actualizado para versiones mas recientes de TRL (`dtype` en lugar de `torch_dtype`, `vllm_max_model_length: 6144` en lugar de `max_prompt_length: 2048`).

## Capacidades

- Generacion de texto y razonamiento matematico multi-salto, entrenado especificamente sobre problemas de 2 a 20 operaciones.
- Razonamiento encadenado (chain-of-thought) inducido por RL, orientado a resolver problemas paso a paso.
- Transferencia a tareas de QA multi-salto del mundo real, segun la evaluacion del paper (HotpotQA, 2WikiMultiHopQA, MuSiQue, CoFCA y SynthRM, segun los scripts de evaluacion del repositorio).
- Generacion de texto conversacional (tag `conversational` en Hugging Face).
- Compatible con text-generation-inference y endpoints de Hugging Face.
- No se documentan capacidades de tool calling, function calling, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Investigacion en RL para razonamiento: reproduccion del experimento del paper con los scripts del repositorio (`scripts/eval/gsminf_eval_grpo.sh`, `scripts/eval/wiki_eval_grpo.sh`) para validar la transferencia de datos sinteticos a QA multi-salto.
- Evaluacion comparativa de tecnicas de GRPO: servir como checkpoint de referencia frente a otros ajustes del mismo modelo base para medir el efecto del entrenamiento sintetico.
- Generacion de cadenas de razonamiento en problemas aritmeticos de dificultad controlada: util para estudiar como escala la precision con el numero de operaciones (2 a 20).
- Prototipado de asistentes de resolucion de problemas matematicos en entornos academicos, donde el coste de un modelo de 1.700 millones de parametros es bajo.
- Fine-tuning posterior (continued pretraining o SFT) sobre dominios especificos, aprovechando la licencia Apache 2.0 y el formato safetensors estandar.
- Despliegue ligero en entornos con recursos limitados para experimentos de razonamiento, dado el reducido tamano del modelo (4,1 GB en precision original).
- Benchmarking de pipelines de evaluacion multi-hop: el modelo encaja como baseline en suites que midan HotpotQA, 2WikiMultiHopQA, MuSiQue o CoFCA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los scripts de evaluacion del repositorio y al paper (arXiv:2603.02091), pero no incluye tablas numericas de MMLU, GSM8K, HumanEval ni de las tareas multi-hop evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (fp16/bf16): aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica entre 6 y 10 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2,5 GB de pesos; en 4 bits, en torno a 1,3 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: H100 80 GB para entrenamiento (el autor uso 4x H100 80 GB, unas 22 horas); para inferencia basta una RTX 4090, RTX 3090, A10, L4 o incluso GPUs consumer de gama media con cuantizacion.
- Cabe en GPU consumer: si, con holgura en tarjetas de 8 GB o mas en fp16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag oficial), accelerate para entrenamiento; vLLM es compatible segun la receta de entrenamiento (`vllm_max_model_length`), aunque no se documenta un perfil de despliegue especifico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhantomReasoning-Qwen3-1.7B-gsminf | 2.031.739.904 | no disponible | GRPO sobre GSM-Infinite sintetico | Apache 2.0 | Hugging Face (kilian-group) |
| Qwen/Qwen3-1.7B (base) | 1.700 millones (aprox.) | contexto largo de Qwen3 (valor exacto no disponible) | preentrenamiento + post-entrenamiento de Qwen | Apache 2.0 | Hugging Face (Qwen) |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.500 millones (aprox.) | no disponible | destilacion de trazas de razonamiento | MIT (segun el modelo original) | Hugging Face (deepseek-ai) |

La comparativa se limita a modelos de la misma familia de tamano (1.500-2.000 millones de parametros) orientados a razonamiento. No se dispone de datos de rendimiento comparativos publicados para este checkpoint.

## Limitaciones y advertencias

- Modelo de investigacion: no se han publicado evaluaciones de seguridad, sesgos ni robustez; no se recomienda su uso en produccion sin una evaluacion adicional.
- Riesgo de alucinacion: al ser un ajuste por RL sobre problemas matematicos sinteticos, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente fuera del dominio aritmetico de entrenamiento.
- Dominio estrecho: el entrenamiento se limita a GSM-Infinite zero-context de dificultad media (2 a 20 operaciones); el rendimiento fuera de ese rango o en tareas no matematicas no esta caracterizado.
- Idiomas: no se documenta que idiomas soporta; el dataset de entrenamiento es presumiblemente en ingles, lo que puede degradar el rendimiento en castellano.
- Contexto: la longitud de contexto efectiva de este checkpoint no se especifica; la receta menciona `vllm_max_model_length: 6144`, lo que sugiere un limite practico en torno a 6.144 tokens durante el entrenamiento, pero no se confirma para inferencia.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base Qwen3-1.7B por si hubiera terminos adicionales.
- Reproducibilidad: el checkpoint se entreno con TRL 0.21.0 y Transformers 4.55.0; la receta actual en `main` difiere en nombres de parametros, lo que puede afectar a la reproduccion exacta.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ): habria que generarlas a partir de los safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kilian-group/PhantomReasoning-Qwen3-1.7B-gsminf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper (arXiv): https://arxiv.org/abs/2603.02091
- Repositorio de codigo: https://github.com/kilian-group/phantom-reasoning
- Commit de entrenamiento: https://github.com/kilian-group/phantom-reasoning/commit/2a83e69745b071e69cc7f818181eb5d38c5c84b4
- Dataset: https://huggingface.co/datasets/kilian-group/phantom-reasoning
