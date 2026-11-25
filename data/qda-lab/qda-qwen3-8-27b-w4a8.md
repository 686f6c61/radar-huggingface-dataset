# qda-lab/QDA-Qwen3.8-27B-W4A8

## Resumen

QDA-Qwen3.8-27B-W4A8 es una version cuantizada del modelo Qwen/Qwen3.8-27B, desarrollada por qda-lab mediante su herramienta de busqueda automatizada de recetas de cuantizacion QDA. Se trata de una cuantizacion de pesos a 4 bits (INT4) y activaciones a 8 bits en coma flotante (FP8), conocida como W4A8, que reduce el peso del checkpoint de 55,6 GB en BF16 a 19,5 GB, es decir, un factor de compresion de aproximadamente 2,9x, manteniendo una precision practicamente identica a la del modelo original segun la evaluacion publicada por el autor.

El modelo base es un transformer multimodal de tipo image-text-to-text con 27.781.427.952 parametros totales (unos 27,8 mil millones), orientado a tareas de razonamiento, matematicas, codigo y comprension de imagenes. La cuantizacion se realizo con GPTQ sobre una copia del modelo rotada con Hadamard, de modo que la rotacion queda plegada en los pesos y no requiere transformacion en tiempo de ejecucion. El resultado se empaqueta en formato compressed-tensors para su uso con vLLM.

Su relevancia actual radica en que permite desplegar un modelo de casi 28 mil millones de parametros multimodales en una unica GPU NVIDIA Hopper (H100 o H200) con una huella de memoria notablemente menor, sin sacrificar rendimiento medible en los benchmarks reportados. La licencia Apache-2.0, heredada del modelo base, facilita su adopcion en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen3.8, tag qwen3_5 |
| Parametros totales | 27.781.427.952 (aprox. 27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8: pesos INT4 en grupos de 128, activaciones FP8 dinamicas; GPTQ sobre copia rotada con Hadamard; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer multimodal de tipo image-text-to-text, segun la etiqueta de pipeline y el tag qwen3_5. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de esta ficha es el proceso de cuantizacion: los pesos se almacenan como enteros de 4 bits en grupos de 128 y las activaciones como FP8 dinamicas, aplicando GPTQ sobre una copia del modelo rotada con Hadamard. La rotacion se pliega dentro de los pesos, por lo que no hay coste de transformacion en inferencia. La receta concreta fue seleccionada por la busqueda automatizada de QDA, y el proceso completo se ejecuto en una unica GPU H100 de 80 GB. El modelo se distribuye en formato compressed-tensors y requiere el kernel W4A8 de vLLM, que exige compute capability 9.0 (arquitectura Hopper: H100, H200).

## Capacidades

- Generacion de texto y razonamiento en modo thinking (el razonamiento termina en el token ``), con control mediante `reasoning_effort` (por ejemplo, `"medium"`).
- Razonamiento matematico avanzado, evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento cientifico de nivel experto, evaluado en GPQA-Diamond.
- Generacion y resolucion de codigo, evaluada en LiveCodeBench.
- Seguimiento de instrucciones complejas, evaluado en IFBench.
- Conocimiento general y razonamiento multietapa, evaluado en MMLU-Pro.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), lo que habilita tareas de comprension visual combinadas con texto.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking y el formato conversacional lo permiten.

## Casos de uso

- Razonamiento matematico asistido: el modelo obtiene 89,3 en AIME 2025 en modo thinking, por lo que es adecuado para tutoria o verificacion de problemas de competicion y calculo simbolico paso a paso.
- Generacion de codigo en produccion: con 86,8 en LiveCodeBench, puede integrarse en pipelines de revision y generacion de codigo, siempre que el backend sea vLLM sobre GPU Hopper.
- Analisis de documentos con imagenes: al ser image-text-to-text, permite extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Evaluacion cientifica y QA de dominio experto: su 81,9 en GPQA-Diamond lo hace util para asistentes de investigacion que requieren razonamiento de nivel graduado.
- Despliegue en una sola GPU: con 19,5 GB de pesos, cabe en una H100 o H200 individual, lo que simplifica la infraestructura frente al BF16 de 55,6 GB.
- Seguimiento estricto de instrucciones: con 66,9 en IFBench, es apto para tareas de formateo, extraccion estructurada y generacion de respuestas con restricciones.
- Prototipado e investigacion en cuantizacion: la receta y los datos de calibracion son publicos, lo que permite reproducir el proceso y estudiar el impacto de W4A8 en modelos multimodales.

## Benchmarks y rendimiento

Resultados publicados por el autor (thinking mode, pass@1 promediado sobre 1-32 semillas, mismas condiciones para ambos modelos):

| Benchmark | BF16 (55,6 GB) | QDA W4A8 (19,5 GB) |
|---|---|---|
| AIME 2025 | 88,0 | 89,3 |
| HMMT Feb 2026 | 74,1 | 75,6 |
| GPQA-Diamond | 82,0 | 81,9 |
| IFBench | 67,7 | 66,9 |
| MMLU-Pro | 83,7 | 82,6 |
| LiveCodeBench | 85,8 | 86,8 |
| Media | 80,2 | 80,5 |

Configuracion de evaluacion: max new tokens de 81.920 para AIME 2025, HMMT Feb 2026 y LiveCodeBench, y 32.768 para GPQA-Diamond, IFBench y MMLU-Pro; temperatura 1,0, top-p 0,95, top-k 20, min-p 0, sin penalizacion de presencia ni de repeticion; thinking activado con `reasoning_effort: medium`; MTP y decodificacion especulativa desactivados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,5 GB solo para los pesos en W4A8; hay que sumar la memoria de activaciones, cache KV y overhead del runtime, por lo que se recomienda una GPU con al menos 24-40 GB.
- GPU recomendadas: NVIDIA H100 o H200 (sm90, compute capability 9.0). El kernel W4A8 de vLLM exige compute capability 9.0, por lo que no funciona en GPUs Ampere o Ada.
- Cabe en consumer GPU: no, segun la restriccion del kernel W4A8, que limita el despliegue a GPUs Hopper de centro de datos.
- Opciones de despliegue: vLLM (`vllm serve qda-lab/QDA-Qwen3.8-27B-W4A8`); el modelo se distribuye en formato compressed-tensors compatible con vLLM. No se indica soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- El proceso de cuantizacion se ejecuto en 1x H100 (80 GB); la reconstruccion de los pesos no es bit-identica al checkpoint publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-W4A8 | 27,8 mil millones | no disponible | W4A8, compressed-tensors, 19,5 GB | Apache-2.0 | Hugging Face, vLLM en Hopper |
| Qwen/Qwen3.8-27B (base) | 27,8 mil millones | no disponible | BF16, 55,6 GB | Apache-2.0 | Hugging Face |
| Alternativas de otros laboratorios | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre otros modelos comparables de la misma categoria (mismo tamano o misma tarea) para establecer una comparativa con cifras de rendimiento.

## Limitaciones y advertencias

- Restriccion de hardware: el kernel W4A8 de vLLM solo funciona en GPUs con compute capability 9.0 (H100, H200), lo que excluye GPUs consumer y de generaciones anteriores.
- La evaluacion la publica el propio autor del modelo; no se dispone de validacion independiente de los resultados.
- La reconstruccion de los pesos no es bit-identica al checkpoint publicado, lo que puede introducir diferencias menores en reproducibilidad.
- Riesgo de alucinacion: no se documenta en la informacion proporcionada, pero es inherente a los modelos generativos de este tamano.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Longitud de contexto: no disponible; conviene verificarla en la model card del modelo base antes de disenar aplicaciones con contexto largo.
- Licencia Apache-2.0, heredada del modelo base, permite uso comercial; aun asi, deben revisarse las condiciones del modelo base Qwen/Qwen3.8-27B.
- El modelo esta pensado para inferencia con vLLM; no se documenta soporte para otros runtimes, lo que limita la portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Dataset de entradas de receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Receta de cuantizacion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.8-27B-W4A8/qwen3.8-27b-w4a8.yaml
