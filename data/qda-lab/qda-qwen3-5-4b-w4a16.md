# qda-lab/QDA-Qwen3.5-4B-W4A16

## Resumen

QDA-Qwen3.5-4B-W4A16 es una cuantizacion de 4 bits de los pesos del modelo Qwen/Qwen3.5-4B, publicada por el laboratorio qda-lab. Se trata de un checkpoint multimodal de tipo image-text-to-text (procesa texto e imagenes) que reduce el peso del modelo original en BF16 de 9,3 GB a 4,2 GB, un factor de 2,2x, conservando segun el autor el 97,1% de la precision del modelo base. El modelo resuelve el problema del coste de memoria y del throughput en el despliegue de un modelo de 4B con capacidades de razonamiento y vision.

La relevancia actual del checkpoint radica en que aplica una receta de cuantizacion (W4A16: pesos en 4 bits, activaciones en 16 bits) generada mediante busqueda automatizada con agentes, el metodo QDA descrito en el paper arXiv:2611.23388. El resultado es un artefacto compatible con vLLM y SGLang, con pesos en formato compressed-tensors, que mantiene las capacidades de razonamiento en modo thinking del modelo base y anade soporte para decodificacion especulativa mediante MTP (aunque desactivada por defecto en la evaluacion).

El modelo base tiene 4.659.865.088 parametros (aproximadamente 4,66B) y esta bajo licencia Apache-2.0. La cuantizacion preserva esa licencia, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.659.865.088 (aprox. 4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos INT4 en grupos de 64, algunas capas de atencion en 8 bits; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers, vLLM y SGLang |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo Qwen/Qwen3.5-4B, no un modelo entrenado desde cero. Los pesos se cuantizan a enteros de 4 bits agrupados en bloques de 64 mediante GPTQ, con algunas capas de atencion en 8 bits. La receta concreta (que capas quedan en 8 bits, escalas y parametros de calibracion) fue seleccionada por el sistema automatizado QDA, que segun el paper realiza un diseno de cuantizacion en bucle cerrado con agentes. El proceso de construccion utiliza datos de calibracion y de destilacion publicados en el dataset qda-lab/qda-recipe-inputs, y se ejecuto en una unica GPU H100 de 80 GB.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset original ni si Qwen3.5-4B uso RLHF o DPO, ya que la model card solo describe el proceso de cuantizacion. La innovacion tecnica destacable es precisamente el metodo QDA: busqueda automatizada de recetas de cuantizacion que optimiza la retencion de precision por benchmark, en lugar de aplicar una receta fija. El checkpoint resultante es compatible con decodificacion especulativa MTP del modelo base, aunque en la evaluacion publicada se desactivo.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (el razonamiento termina en el token `</think>`), con soporte de cadenas de razonamiento largas (hasta 81.920 tokens nuevos por item en la evaluacion).
- Procesamiento de imagenes y texto (pipeline image-text-to-text), heredado del modelo base multimodal.
- Razonamiento matematico de competicion: evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento cientifico de nivel avanzado: evaluado en GPQA-Diamond.
- Generacion de codigo: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFBench.
- Conocimiento general y profesional: evaluado en MMLU-Pro.
- Compatibilidad con tool calling y function calling: no se detalla explicitamente en la informacion disponible, aunque se infiere del modelo base Qwen3.5; no confirmado en la model card.
- Soporte de agentes y razonamiento multi-paso: no se detalla explicitamente; el modo thinking permite cadenas de razonamiento extensas.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: cuantizacion W4A16 con atencion parcial en 8 bits; soporte de MTP/decodificacion especulativa (desactivada por defecto en la evaluacion).

## Casos de uso

- Razonamiento matematico asistido en entornos educativos o de investigacion: el modelo mantiene 75,9 en AIME 2025 frente a 78,5 del BF16, por lo que puede resolver problemas de competicion con una perdida de precision minima y un coste de memoria un 55% menor.
- Analisis de documentos cientificos con imagenes: al ser image-text-to-text, puede procesar figuras, tablas y texto combinados; su rendimiento en GPQA-Diamond (76,1) lo hace adecuado para preguntas de nivel doctorado en dominios cientificos.
- Generacion de codigo en pipelines de CI/CD: con 57,0 en LiveCodeBench, puede integrarse en herramientas de revision o generacion de codigo donde el coste por inferencia importa; su tamano de 4,2 GB permite desplegarlo en GPUs de gama media-alta.
- Despliegue en produccion con vLLM o SGLang: el checkpoint incluye instrucciones y flags especificos (`VLLM_DISABLED_KERNELS=MacheteLinearKernel`) y alcanza 320 tok/s a batch 1 y 4.039 tok/s a batch 16 en una H100, lo que lo hace apto para servicios de inferencia con concurrencia moderada.
- Evaluacion de recetas de cuantizacion: investigadores pueden reproducir el checkpoint con QDA 0.1.0 y el recipe publicado, comparando la retencion de precision frente a otras cuantizaciones (AWQ, W4A16 de RedHat, ParoQuant) en los mismos benchmarks.
- Asistente de razonamiento con seguimiento de instrucciones: con 60,5 en IFBench (practicamente identico al BF16, 60,6), puede usarse en tareas de instrucciones complejas donde se requiere fidelidad al prompt.
- Prototipado en GPUs consumer: al ocupar 4,2 GB en pesos, cabe en GPUs consumer con suficiente VRAM (ver seccion de hardware), lo que facilita experimentacion local con un modelo de razonamiento multimodal.

## Benchmarks y rendimiento

Resultados publicados en la model card (thinking mode, pass@1 promediado sobre 1-32 semillas, mismas condiciones de muestreo para todos los modelos):

| Benchmark | BF16 (9,3 GB) | QDA W4A16 (4,2 GB) | cyankiwi AWQ-4bit (4,0 GB) | RedHat W4A16 (5,5 GB) | ParoQuant (3,8 GB) |
|---|---|---|---|---|---|
| AIME 2025 | 78,5 | 75,9 | 72,5 | 63,2 | 71,7 |
| HMMT Feb 2026 | 63,6 | 61,1 | 57,7 | 53,1 | 55,5 |
| GPQA-Diamond | 77,5 | 76,1 | 72,1 | 70,3 | 73,5 |
| IFBench | 60,6 | 60,5 | 56,7 | 55,0 | 58,4 |
| MMLU-Pro | 77,3 | 76,5 | 75,3 | 75,3 | 76,6 |
| LiveCodeBench | 61,6 | 57,0 | 51,5 | 46,9 | 55,9 |
| **Media** | 69,8 | **67,8** | 64,3 | 60,6 | 65,3 |

Condiciones de evaluacion: max new tokens por item de 81.920 (32.768 en MMLU-Pro); repeticiones de 32 semillas (AIME, HMMT), 16 (GPQA, IFBench), 1 (MMLU-Pro) y 4 (LiveCodeBench); temperatura 1,0, top-p 0,95, top-k 20, min-p 0, presence penalty 1,5, repetition penalty 1,0; thinking activado; MTP/decodificacion especulativa desactivada. La columna ParoQuant se ejecuto en su propio stack (vLLM 0.19.1 con paroquant 0.1.16).

Rendimiento en una H100 80 GB, 512 tokens generados por peticion (media de 2 ejecuciones): 320 tok/s a batch 1 y 4.039 tok/s a batch 16; ParoQuant: 153 y 2.147 tok/s respectivamente.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 4,2 GB; con overhead de activaciones, KV cache y contexto, se recomienda al menos 8-10 GB de VRAM para uso comodo.
- GPUs validadas por el autor: NVIDIA H100, A100, RTX Pro 6000 y B200.
- GPUs consumer: por tamano de pesos (4,2 GB) cabe en GPUs consumer con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti/4060 Ti de 8 GB o superiores), aunque no se confirma oficialmente el soporte en estas tarjetas.
- Opciones de despliegue: vLLM (`VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3.5-4B-W4A16`) y SGLang (`python -m sglang.launch_server --model-path qda-lab/QDA-Qwen3.5-4B-W4A16`). Tambien es compatible con transformers.
- Nota de entorno: en H100/H200 sin CUDA 13, el kernel falla al compilar (`failed to open libnvrtc-builtins.so.13.0`); hay que anadir las librerias NVIDIA del venv a `LD_LIBRARY_PATH` con el comando indicado en la model card.
- Latencia y throughput: 320 tok/s a batch 1 y 4.039 tok/s a batch 16 en H100 80 GB (512 tokens generados por peticion).

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Media de benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QDA-Qwen3.5-4B-W4A16 | 4,66B | 4,2 GB | no disponible | 67,8 | Apache-2.0 | Hugging Face (qda-lab) |
| cyankiwi AWQ-4bit | no disponible | 4,0 GB | no disponible | 64,3 | no disponible | Hugging Face |
| RedHat W4A16 | no disponible | 5,5 GB | no disponible | 60,6 | no disponible | Hugging Face |
| ParoQuant | no disponible | 3,8 GB | no disponible | 65,3 | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (BF16) | 4,66B | 9,3 GB | no disponible | 69,8 | Apache-2.0 | Hugging Face (Qwen) |

Todas las alternativas de cuantizacion comparadas derivan del mismo modelo base Qwen3.5-4B. QDA W4A16 obtiene la mejor media (67,8) entre las cuantizaciones y la mayor retencion respecto al BF16 (97,1%), con un tamano intermedio (4,2 GB). ParoQuant es mas pequeno (3,8 GB) pero rinde peor en media (65,3). No se dispone de datos de contexto ni de licencia de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision respecto al BF16: la media cae de 69,8 a 67,8 (97,1% de retencion); la mayor caida se da en LiveCodeBench (61,6 a 57,0, -4,6 puntos) y en AIME 2025 (78,5 a 75,9).
- La cuantizacion W4A16 puede degradar tareas no cubiertas por los benchmarks publicados; no hay evaluacion de sesgos, toxicidad ni robustez.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Qwen3.5-4B, no documentados en esta ficha.
- Riesgo de alucinacion: no cuantificado en la model card; el modo thinking con cadenas largas (hasta 81.920 tokens) puede aumentar el coste y no garantiza correccion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se indican en la informacion disponible.
- Restricciones de licencia: Apache-2.0, igual que el modelo base, permite uso comercial; no se documentan restricciones adicionales.
- Caveats de produccion: requiere flags especificos en vLLM (`VLLM_DISABLED_KERNELS=MacheteLinearKernel`) y, en H100/H200 sin CUDA 13, ajuste de `LD_LIBRARY_PATH`; los pesos reconstruidos con el recipe no son identicos bit a bit al checkpoint publicado.
- El checkpoint tiene 311 descargas y 0 likes en el momento de la consulta, lo que indica adopcion limitada y poca validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-4B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA (GitHub): https://github.com/humanfia/qda
- Dataset de entradas de la receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Recipe concreto: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.5-4B-W4A16/qwen3.5-4b-w4a16.yaml
- Directorio de inputs de calibracion y destilacion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.5-4B-W4A16
