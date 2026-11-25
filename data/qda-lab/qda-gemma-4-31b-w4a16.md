# qda-lab/QDA-Gemma-4-31B-W4A16

## Resumen

QDA-Gemma-4-31B-W4A16 es una cuantizacion de pesos a 4 bits del modelo multimodal google/gemma-4-31B-it, desarrollada por qda-lab. El modelo resuelve el problema del coste de memoria y de computo de un modelo de 31.273.088.876 parametros en BF16 (62,5 GB), reduciendolo a 20,5 GB, un 3,1x menos, manteniendo una precision practicamente identica segun la evaluacion del autor. Es relevante ahora porque permite desplegar un modelo de razonamiento y codigo de gama alta en una sola GPU de 80 GB con margen para el contexto y el vision tower, o en GPUs de menor capacidad con cuantizaciones adicionales.

La arquitectura subyacente es la de Gemma 4 (transformer multimodal image-text-to-text), con un vision tower que se mantiene en BF16 y un cuerpo de lenguaje cuantizado a enteros de 4 bits en grupos de 32. La cuantizacion se realiza con GPTQ y posterior ajuste fino de las escalas de grupo por destilacion, con una receta seleccionada mediante busqueda automatizada de QDA.

El checkpoint se publica bajo licencia Apache-2.0, la misma del modelo base, e incluye soporte explicito para vLLM y SGLang mediante el formato compressed-tensors. El repo ocupa 20,5 GB y esta pensado para servir en produccion con aceleracion de hardware NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Gemma 4; vision tower en BF16 |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos INT4 en grupos de 32, activaciones en 16 bits); vision tower en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (Gemma 4 license) |
| Formato de pesos | safetensors (compressed-tensors) |
| Tamano del repo | 20,5 GB |
| Modelo base | google/gemma-4-31B-it (revision 842da3794eaa0b77d5f08bae87a17459d91ff475) |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Despliegue soportado | vLLM, SGLang |
| GPU soportadas | H100, A100, RTX Pro 6000, B200 |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint google/gemma-4-31B-it, por lo que hereda la arquitectura del modelo base: un transformer multimodal que procesa imagen y texto (pipeline image-text-to-text) con un vision tower que permanece en BF16. El cuerpo de lenguaje se cuantiza a enteros de 4 bits organizados en grupos de 32, con activaciones en 16 bits (esquema W4A16). Los pesos se obtienen con GPTQ y, a continuacion, las escalas de grupo se ajustan fino mediante destilacion, una receta seleccionada por la busqueda automatizada de QDA.

El proceso de construccion se realizo en 2x H100 de 80 GB en 63 minutos. El autor indica que una reconstruccion con la misma receta no produce pesos identicos bit a bit: evaluada sobre los mismos prompts, una reconstruccion obtiene KL 0,01868 frente al modelo original, mientras que este checkpoint obtiene 0,01864 (+0,2 %). La receta y los datos de calibracion y destilacion son publicos en el dataset qda-lab/qda-recipe-inputs, lo que permite reproducir el proceso con la herramienta QDA 0.1.0. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre la composicion de su dataset.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de pensamiento (thinking mode) activable; el razonamiento termina en el token `<channel|>`.
- Resolucion de problemas de matematicas de competicion (AIME 2025, HMMT Feb 2026) y razonamiento cientifico de nivel avanzado (GPQA-Diamond).
- Generacion y comprension de codigo, evaluada con LiveCodeBench.
- Seguimiento de instrucciones complejas, evaluado con IFBench.
- Conocimiento general y razonamiento multidisciplinar, evaluado con MMLU-Pro.
- Capacidades multimodales imagen-texto heredadas del modelo base (pipeline image-text-to-text), con el vision tower en BF16.
- Compatibilidad con vLLM y SGLang mediante el formato compressed-tensors, lo que habilita serving con batching continuo.
- No se dispone de informacion especifica sobre tool calling, function calling, soporte de agentes, capacidades de audio o cobertura multilingue en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico y cientifico asistido: el modelo mantiene en W4A16 puntuaciones de 84,4 en AIME 2025 y 85,3 en GPQA-Diamond, por lo que puede emplearse en entornos de investigacion que requieran resolver problemas de competicion o preguntas de nivel doctorado sin disponer de la VRAM necesaria para el BF16.
- Generacion de codigo en produccion: con 85,1 en LiveCodeBench y soporte en vLLM/SGLang, puede integrarse en pipelines de CI/CD o asistentes de programacion que necesiten baja latencia y un unico nodo GPU.
- Serving de un modelo de 31B en una sola GPU de 80 GB: al ocupar 20,5 GB de pesos, queda espacio para cache KV y contexto largo en H100, A100 o B200, lo que simplifica el despliegue frente al BF16 de 62,5 GB.
- Evaluacion de recetas de cuantizacion: al publicarse la receta, los datos de calibracion y las instrucciones de reconstruccion, sirve como caso de referencia para equipos que quieran reproducir o auditar un pipeline GPTQ + destilacion de escalas.
- Tareas multimodales imagen-texto: al conservar el vision tower en BF16, puede usarse en clasificacion, descripcion o extraccion de informacion a partir de imagenes, con el cuerpo de lenguaje cuantizado.
- Despliegue con batching continuo de alto throughput: el autor reporta 1.101-1.251 tok/s a batch 16 en una H100, adecuado para servicios con muchos usuarios concurrentes y requisitos moderados de latencia.
- Sustitucion de un modelo BF16 en infraestructura existente: la reduccion de 62,5 GB a 20,5 GB permite liberar memoria para aumentar el tamano de batch o la longitud de contexto en el mismo hardware.

## Benchmarks y rendimiento

Resultados publicados por el autor (thinking mode, pass@1 promediado sobre 1-32 semillas, misma configuracion de muestreo para todos los modelos):

| Benchmark | BF16 (62,5 GB) | QDA W4A16 (20,5 GB) | Google QAT W4A16 (23,3 GB) | ParoQuant (19,3 GB) |
|---|---|---|---|---|
| AIME 2025 | 84,0 | 84,4 | 82,8 | 81,8 |
| HMMT Feb 2026 | 77,1 | 78,5 | 74,0 | 75,3 |
| GPQA-Diamond | 85,7 | 85,3 | 83,3 | 84,4 |
| IFBench | 80,4 | 80,2 | 79,1 | 80,4 |
| MMLU-Pro | 86,9 | 86,4 | 86,3 | 86,2 |
| LiveCodeBench | 83,9 | 85,1 | 83,1 | 83,4 |
| **Media** | 83,0 | **83,3** | 81,4 | 81,9 |

Configuracion de evaluacion: temperatura 1,0, top-p 0,95, top-k 64, min-p 0, sin penalizacion de presencia ni de repeticion; max new tokens de 81.920 en AIME, HMMT, GPQA y LiveCodeBench, y 32.768 en MMLU-Pro; sin decodificacion especulativa (MTP off). La columna ParoQuant se ejecuto en su propio stack de serving (vLLM 0.19.1 con un override de configuracion y la plantilla de chat de su repo).

Rendimiento en una H100 de 80 GB, 512 tokens generados por peticion (media de 2 ejecuciones): 95 tok/s a batch 1 y 1.101-1.251 tok/s a batch 16. ParoQuant: 66 tok/s y 891 tok/s respectivamente.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 20,5 GB solo de pesos; hay que sumar cache KV y overhead del runtime. En una GPU de 80 GB cabe con holgura para contexto largo y batching.
- GPUs validadas por el autor: NVIDIA H100, A100, RTX Pro 6000 y B200.
- GPU de consumo: no se indica soporte para GPUs consumer en la informacion disponible; el esquema W4A16 con compressed-tensors y los kernels de vLLM/SGLang estan orientados a hardware de datacenter.
- Opciones de despliegue: vLLM (`VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Gemma-4-31B-W4A16`) y SGLang (`python -m sglang.launch_server --model-path qda-lab/QDA-Gemma-4-31B-W4A16`). En H100 y H200 sin CUDA 13 instalado, el autor documenta un fallo de compilacion del kernel (`failed to open libnvrtc-builtins.so.13.0`) y proporciona un workaround basado en exportar `LD_LIBRARY_PATH` con las librerias NVIDIA del entorno virtual.
- Latencia y throughput: 95 tok/s a batch 1 y 1.101-1.251 tok/s a batch 16 en una H100 de 80 GB con 512 tokens generados por peticion.
- No se dispone de datos de VRAM estimada para contextos concretos ni de requisitos de CPU/RAM del host.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Esquema | Media de benchmarks | Licencia | Serving |
|---|---|---|---|---|---|---|
| QDA-Gemma-4-31B-W4A16 | 31,27 B | 20,5 GB | W4A16 (GPTQ + destilacion de escalas) | 83,3 | Apache-2.0 | vLLM, SGLang |
| Google QAT W4A16 (Gemma 4 31B) | 31,27 B | 23,3 GB | W4A16 (QAT) | 81,4 | Apache-2.0 | no disponible |
| ParoQuant (Gemma 4 31B) | 31,27 B | 19,3 GB | cuantizacion a 4 bits | 81,9 | no disponible | vLLM 0.19.1 con override |
| google/gemma-4-31B-it (BF16) | 31,27 B | 62,5 GB | BF16 | 83,0 | Apache-2.0 | transformers, vLLM, SGLang |

La comparativa se limita a las variantes del mismo modelo base incluidas en la evaluacion del autor; no se dispone de datos de otros modelos de tamano o categoria similares en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion de benchmarks la publica el propio autor de la cuantizacion; no se ha verificado de forma independiente en la informacion disponible.
- El checkpoint es una cuantizacion a 4 bits: aunque la media de benchmarks iguala o supera ligeramente al BF16, hay degradaciones puntuales (GPQA-Diamond 85,3 frente a 85,7; MMLU-Pro 86,4 frente a 86,9).
- Riesgo de alucinacion inherente al modelo base; no se documentan tasas de alucinacion especificas para esta cuantizacion.
- No se dispone de informacion sobre sesgos conocidos, cobertura idiomatica ni limitaciones de contexto del modelo base en la informacion proporcionada.
- El vision tower se mantiene en BF16, por lo que el ahorro de memoria no aplica a esa parte del modelo.
- La licencia es Apache-2.0, pero enlaza a la Gemma 4 license de Google; conviene revisar los terminos de uso comercial del modelo base antes de desplegarlo en produccion.
- En H100 y H200 sin CUDA 13 puede fallar la compilacion del kernel de vLLM al arrancar; es necesario aplicar el workaround de `LD_LIBRARY_PATH` documentado por el autor.
- Las reconstrucciones con la misma receta no son identicas bit a bit al checkpoint publicado (diferencia de KL del +0,2 %), lo que puede afectar a la reproducibilidad exacta de resultados.
- El autor no documenta soporte para GPUs de consumo ni para llama.cpp, Ollama o TGI; el despliegue esta orientado a vLLM y SGLang sobre hardware NVIDIA de datacenter.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Gemma-4-31B-W4A16
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Receta e inputs de calibracion/destilacion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Gemma-4-31B-W4A16
- Receta concreta (YAML): https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Gemma-4-31B-W4A16/gemma-4-31b-w4a16.yaml
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
