# qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A16

## Resumen

QDA-DeepSeek-R1-Distill-Llama-8B-W4A16 es una cuantización de 4 bits de los pesos del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicada por el laboratorio qda-lab. El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Llama de 8.030.261.248 parámetros, orientado a generación de texto con razonamiento explícito en modo thinking. La versión cuantizada reduce el peso de 16,1 GB en BF16 a 5,7 GB, un factor de 2,8×, conservando según el autor el 96,2 % de la precisión del modelo original.

La relevancia de esta ficha reside en el método de cuantización: no es un GPTQ convencional, sino un pipeline cerrado con búsqueda automatizada de recetas (QDA) que combina GPTQ sobre una copia rotada con Hadamard, con escalas de grupo afinadas por destilación. El resultado se empaqueta en formato compressed-tensors y se sirve con vLLM y SGLang, lo que lo hace directamente desplegable en GPUs de centro de datos y en algunas consumer de gama alta.

El modelo mantiene el modo de razonamiento del original (termina el bloque de pensamiento con `</think>`) y está pensado para cargas de trabajo de matemáticas, ciencia y código donde el coste de inferencia importa. La licencia MIT del modelo base se preserva en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), pesos cuantizados W4A16 con compressed-tensors |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | INT4 con grupos de 128 (W4A16), GPTQ sobre rotacion Hadamard, escalas afinadas por destilacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers, vLLM y SGLang |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama con 8.030.261.248 parámetros, destilado por DeepSeek a partir de DeepSeek-R1. Esta versión no reentrena el modelo: cuantiza los pesos a enteros de 4 bits en grupos de 128 mediante GPTQ aplicado sobre una copia del modelo rotada con Hadamard. La rotación se pliega dentro de los pesos, de modo que no hay transformación en tiempo de ejecución, y las escalas de grupo se afinan después mediante destilación. La receta concreta fue seleccionada por el sistema automatizado QDA descrito en el paper arXiv:2611.23388.

El proceso de construcción se ejecutó en una única H100 de 80 GB y es reproducible con la herramienta QDA 0.1.0 y la receta `r1-llama-8b-w4a16.yaml` publicada en el dataset `qda-lab/qda-recipe-inputs`. El autor advierte que los pesos reconstruidos no son idénticos bit a bit a este checkpoint. La model card no detalla el volumen de tokens de calibración ni la composición del dataset de destilación más allá de indicar que están en el citado dataset.

## Capacidades

- Generación de texto con razonamiento explícito en modo thinking, con cierre del bloque de razonamiento mediante `</think>`.
- Razonamiento matemático de competición: evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento científico de nivel experto: evaluado en GPQA-Diamond.
- Generación de código: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFEval.
- Conocimiento general y multidisciplinar: evaluado en MMLU-Pro.
- Conversacional: pipeline_tag text-generation y tag conversational.
- Compatibilidad con endpoints y text-generation-inference según los tags del repositorio.
- Soporte de tool calling, agentes o multi-step reasoning más allá del modo thinking: no disponible en la informacion proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Razonamiento matemático en producción: el modelo resuelve problemas tipo competición (AIME, HMMT) con un 30,1 y 24,2 de acierto respectivamente en su versión cuantizada, suficiente para asistentes de tutoría matemática o verificación de soluciones donde el coste por consulta es crítico.
- Generación de código asistida: con 36,1 en LiveCodeBench, puede integrarse en pipelines de revisión o generación de parches donde se requiere un modelo pequeño servido con vLLM y baja latencia (297 tok/s a batch 1 en H100).
- Razonamiento científico y QA técnico: los 48,8 en GPQA-Diamond permiten usarlo en asistentes de dominio científico donde se necesita cadena de pensamiento verificable y no solo respuesta directa.
- Despliegue en GPUs consumer de gama alta: al ocupar 5,7 GB en INT4, cabe en tarjetas con 8-12 GB de VRAM, lo que habilita prototipos locales de razonamiento sin depender de la nube.
- Servicio de alto throughput: con 4.245 tok/s a batch 16 en H100, es adecuado para backends de atención a desarrolladores o colas de evaluación masiva de problemas.
- Evaluación y benchmarking de cuantizaciones: al publicar receta, datos de calibración y comparativas frente a RedHat W4A16 y ParoQuant, sirve como referencia reproducible para investigar el impacto de la cuantización en modelos de razonamiento.
- Fine-tuning ligero o adaptación con LoRA: el formato safetensors y la compatibilidad con transformers permiten adaptar el modelo cuantizado a dominios específicos con recursos moderados.

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo thinking, pass@1 promediado sobre semillas (máximo 32.768 tokens nuevos por ítem, temperatura 0,6, top-p 0,95):

| Benchmark | BF16 (16,1 GB) | QDA W4A16 (5,7 GB) | RedHat W4A16 (5,7 GB) | ParoQuant (5,8 GB) |
|---|---|---|---|---|
| AIME 2025 | 33,6 | 30,1 | 32,3 | 32,9 |
| HMMT Feb 2026 | 24,9 | 24,2 | 24,4 | 22,2 |
| GPQA-Diamond | 48,7 | 48,8 | 46,7 | 47,9 |
| IFEval | 63,4 | 62,4 | 60,5 | 62,6 |
| MMLU-Pro | 49,4 | 47,0 | 45,9 | 47,7 |
| LiveCodeBench | 38,3 | 36,1 | 35,8 | 35,6 |
| Media | 43,0 | 41,4 | 40,9 | 41,5 |

Rendimiento medido en una H100 de 80 GB con 512 tokens generados por petición (media de 2 ejecuciones): 297 tok/s a batch 1 y 4.245 tok/s a batch 16. ParoQuant, en su propio stack (vLLM 0.19.1 con paroquant 0.1.16), registra 149 y 2.275 tok/s respectivamente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,7 GB de pesos en INT4 más overhead de activaciones y KV cache; el repo ocupa 5,7 GB.
- GPUs validadas por el autor: NVIDIA H100, A100, RTX Pro 6000 y B200.
- Cabe en GPUs consumer: sí, en tarjetas con 8-12 GB de VRAM o más, siempre que el runtime soporte compressed-tensors; el autor no enumera modelos consumer concretos.
- Opciones de despliegue: vLLM (`VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A16`), SGLang (`python -m sglang.launch_server --model-path ...`) y transformers. También es compatible con text-generation-inference según los tags.
- Aviso de despliegue en H100/H200: sin CUDA 13 en la máquina, la compilación del kernel falla (`failed to open libnvrtc-builtins.so.13.0`); hay que añadir las librerías NVIDIA del entorno virtual a `LD_LIBRARY_PATH` con el comando que documenta la model card.
- Latencia y throughput: 297 tok/s a batch 1 y 4.245 tok/s a batch 16 en H100 80 GB con 512 tokens generados por petición.
- Decodificación especulativa (MTP): desactivada en la evaluación publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión media (benchmarks del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-DeepSeek-R1-Distill-Llama-8B-W4A16 | 8,03 B | no disponible | 41,4 | MIT | Hugging Face (qda-lab) |
| RedHat W4A16 (cuantización del mismo base) | 8,03 B | no disponible | 40,9 | no disponible | no disponible |
| ParoQuant (cuantización del mismo base) | 8,03 B | no disponible | 41,5 | no disponible | no disponible |
| DeepSeek-R1-Distill-Llama-8B en BF16 (referencia) | 8,03 B | no disponible | 43,0 | MIT | Hugging Face (deepseek-ai) |

La comparativa se limita a las tres alternativas de cuantización incluidas en la evaluación del autor; no se dispone de datos de otros modelos de 8 B de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión respecto a BF16: la media cae de 43,0 a 41,4, con descensos notables en AIME 2025 (33,6 a 30,1) y MMLU-Pro (49,4 a 47,0). En GPQA-Diamond, en cambio, el resultado cuantizado es ligeramente superior (48,8 frente a 48,7), lo que sugiere ruido de evaluación.
- El modelo no sigue el formato de respuesta estándar de MMLU-Pro; el autor tuvo que aplicar las reglas lenient oficiales para extraer las respuestas, lo que complica la comparación directa con otros modelos en ese benchmark.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base DeepSeek-R1-Distill-Llama-8B, no detallados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas.
- Idiomas soportados: no especificados; no se garantiza un rendimiento multilingüe más allá del inglés, idioma de los benchmarks publicados.
- Longitud de contexto: no indicada en la model card; conviene verificar la del modelo base antes de desplegar cargas con contexto largo.
- Restricciones de licencia: MIT, igual que el modelo base, lo que permite uso comercial, pero debe conservarse el aviso de copyright.
- Reproducibilidad: los pesos reconstruidos con la receta no son idénticos bit a bit a este checkpoint.
- Dependencia de kernel: en H100/H200 sin CUDA 13 es necesario ajustar `LD_LIBRARY_PATH`; el despliegue no es plug-and-play en todos los entornos.
- La columna de ParoQuant se ejecutó en un stack distinto (vLLM 0.19.1 con paroquant 0.1.16), por lo que su comparación de velocidad no es estrictamente equivalente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A16
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Dataset de recetas e inputs: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Receta de cuantización: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-DeepSeek-R1-Distill-Llama-8B-W4A16/r1-llama-8b-w4a16.yaml
- Directorio de inputs de calibración y destilación: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-DeepSeek-R1-Distill-Llama-8B-W4A16
