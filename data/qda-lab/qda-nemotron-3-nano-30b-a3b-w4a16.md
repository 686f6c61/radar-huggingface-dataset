# qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W4A16

## Resumen

QDA-Nemotron-3-Nano-30B-A3B-W4A16 es una cuantizacion de 4 bits del modelo NVIDIA Nemotron-3-Nano-30B-A3B-BF16, publicada por el laboratorio qda-lab. Se trata de un checkpoint de pesos INT4 en grupos de 64 con esquema W4A16 (pesos de 4 bits, activaciones de 16 bits), generado mediante GPTQ y complementado con capas seleccionadas en 8 bits, pensado para reducir el coste de despliegue del modelo original manteniendo casi intacta su calidad.

El modelo base es un transformer hibrido de NVIDIA con arquitectura `nemotron_h`, que combina capas Mamba y de atencion, con 31.577.940.288 parametros totales (unos 31,6 mil millones) y un diseno tipo mixture-of-experts con aproximadamente 3 mil millones de parametros activos por token, segun indica el sufijo A3B del nombre. El checkpoint ocupa 18,4 GB frente a los 63,2 GB del BF16, es decir, un 3,4x mas pequeno.

Su relevancia practica es doble: por un lado, demuestra que una cuantizacion INT4 bien disenada puede conservar el 98,9% de la precision del BF16 en tareas de razonamiento, matematicas, codigo e instrucciones; por otro, el proceso de construccion es reproducible mediante la herramienta QDA 0.1.0 descrita en el paper asociado, lo que permite auditar y regenerar el checkpoint. Esta orientado a inferencia con vLLM sobre GPUs NVIDIA y mantiene la licencia abierta del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `nemotron_h` (Mamba + atencion) con capas MoE |
| Parametros totales | 31.577.940.288 (31,6 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones (sufijo A3B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos INT4 en grupos de 64 (GPTQ), algunas proyecciones Mamba y de atencion en 8 bits, routers MoE y cabeza de salida en BF16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Tamano del repositorio | 18,4 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (revision bf77c3174f68ad409e1c2aa60daeb46e32d1c606) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento desde cero. La arquitectura subyacente es la del modelo NVIDIA Nemotron-3-Nano-30B-A3B: un transformer hibrido que intercala capas Mamba con capas de atencion y emplea un esquema mixture-of-experts con unos 31,6 mil millones de parametros totales y aproximadamente 3 mil millones activos por token. La model card no detalla la composicion del dataset de preentrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO en el modelo base; esos datos no estan disponibles en la informacion proporcionada.

El proceso de cuantizacion si esta documentado: los pesos se convierten a enteros de 4 bits en grupos de 64 mediante GPTQ, mientras que las proyecciones Mamba y de atencion de determinadas capas se mantienen en 8 bits y los routers MoE y la cabeza de salida permanecen en BF16. La receta fue seleccionada por la busqueda automatizada de QDA y se distribuye como archivo YAML reproducible; el rebuild completo tarda 1056 segundos en una unica H100 de 80 GB. El metodo se describe en el paper "QDA: Closed-Loop LLM Quantization Design with Agents" (arXiv:2611.23388), que plantea el diseno de recetas de cuantizacion como un bucle cerrado guiado por agentes. Los pesos reconstruidos no son identicos bit a bit al checkpoint publicado.

## Capacidades

- Generacion de texto conversacional y en formato instructivo, con modo de razonamiento explicito ("thinking mode") que finaliza en el token `</think>`.
- Razonamiento matematico competitivo: la evaluacion incluye AIME 2025 y HMMT Feb 2026 con resultados superiores al 70-84% en pass@1.
- Razonamiento cientifico de nivel experto, medido con GPQA-Diamond.
- Generacion de codigo, evaluada con LiveCodeBench.
- Seguimiento de instrucciones complejas, evaluado con IFBench.
- Conocimiento general y multidisciplinar, evaluado con MMLU-Pro.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo base esta orientado a razonamiento, pero no se documenta integracion de agentes en esta model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de competicion tipo AIME o HMMT con cadenas de razonamiento largas, gracias a su modo thinking y a la preservacion del 99% de la precision del BF16 en estas tareas. Util para tutoria automatica o generacion de soluciones verificables.
- Analisis cientifico y tecnico: con un rendimiento de 73,5 en GPQA-Diamond en INT4, es adecuado para responder preguntas de nivel posgrado en fisica, quimica y biologia dentro de asistentes de investigacion.
- Generacion de codigo en produccion: el checkpoint mantiene 70,5 en LiveCodeBench (incluso ligeramente por encima del BF16), por lo que puede integrarse en pipelines de revision o autocompletado donde el coste por token importa.
- Despliegue en infraestructura limitada: al ocupar 18,4 GB, cabe en una unica GPU de 24-48 GB con margen para cache KV, lo que permite servir el modelo en estaciones de trabajo con RTX Pro 6000 o A100 en lugar de exigir nodos multi-GPU para el BF16.
- Evaluacion y benchmarking de tecnicas de cuantizacion: al publicarse la receta YAML y los datos de calibracion, sirve como referencia reproducible para comparar GPTQ W4A16 frente a AWQ u otros esquemas sobre el mismo modelo base.
- Asistentes de instrucciones estrictas: con 74,2 en IFBench, es apto para tareas de extraccion estructurada, formateo de salidas y seguimiento de plantillas donde el cumplimiento literal de instrucciones es critico.
- Investigacion sobre modelos hibridos Mamba-atencion: permite estudiar el comportamiento de arquitecturas `nemotron_h` en precision reducida sin necesidad de disponer de 63 GB de VRAM.

## Benchmarks y rendimiento

Resultados publicados en la model card. Modo thinking activado, pass@1 promediado sobre 1-32 semillas, mismas condiciones para los tres modelos.

| Benchmark | BF16 (63,2 GB) | QDA W4A16 (18,4 GB) | stelterlab AWQ (17,8 GB) |
|---|---|---|---|
| AIME 2025 | 84,8 | 84,1 | 78,9 |
| HMMT Feb 2026 | 73,0 | 72,9 | 63,1 |
| GPQA-Diamond | 75,2 | 73,5 | 70,0 |
| IFBench | 74,8 | 74,2 | 73,6 |
| MMLU-Pro | 71,3 | 69,1 | 65,6 |
| LiveCodeBench | 70,2 | 70,5 | 63,2 |
| Media | 74,9 | 74,1 | 69,1 |

Configuracion de evaluacion: hasta 81.920 tokens nuevos por item (32.768 en MMLU-Pro), temperatura 1.0, top-p 1.0, top-k -1, min-p 0, sin penalizacion de presencia ni de repeticion, decodificacion especulativa desactivada. El checkpoint QDA conserva el 98,9% de la media del BF16 y supera en 5 puntos al checkpoint AWQ de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,4 GB de pesos en INT4; con cache KV y overhead de vLLM, el consumo real dependera de la longitud de contexto (no disponible) y del tamano de batch.
- GPUs validadas por el autor: NVIDIA H100, A100, RTX Pro 6000 y B200. Tambien se mencionan H100 y H200 en las notas de compilacion de kernels.
- Cabe en GPU de consumo: si, en principio, en tarjetas con 24 GB o mas (RTX 4090, RTX 3090) siempre que la ventana de contexto y el batch sean moderados; no se han publicado mediciones especificas para estas tarjetas.
- Opciones de despliegue: vLLM es el backend soportado y documentado. SGLang no puede cargar este checkpoint todavia. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Nota de despliegue en vLLM: requiere `VLLM_DISABLED_KERNELS=MacheteLinearKernel`. En H100 y H200 sin CUDA 13 instalado, es necesario anadir las librerias NVIDIA del entorno virtual a `LD_LIBRARY_PATH` para evitar el fallo `failed to open libnvrtc-builtins.so.13.0`.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato temporal es el de construccion del checkpoint (1056 s en 1x H100), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Media de benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Nemotron-3-Nano-30B-A3B-W4A16 | 31,6 mil M totales, ~3 mil M activos | INT4 W4A16, 18,4 GB | 74,1 | NVIDIA Nemotron Open Model License | Hugging Face, vLLM |
| NVIDIA Nemotron-3-Nano-30B-A3B-BF16 | 31,6 mil M totales, ~3 mil M activos | BF16, 63,2 GB | 74,9 | NVIDIA Nemotron Open Model License | Hugging Face |
| stelterlab AWQ (mismo modelo base) | 31,6 mil M totales, ~3 mil M activos | AWQ 4 bits, 17,8 GB | 69,1 | no disponible | Hugging Face |

El checkpoint QDA ofrece una relacion calidad/tamano claramente mejor que la alternativa AWQ sobre el mismo modelo base: 5 puntos mas de media con solo 0,6 GB adicionales. Frente al BF16, la perdida es de 0,8 puntos de media a cambio de reducir el peso 3,4 veces. No se dispone de datos para comparar con otros modelos de tamano similar fuera de la familia Nemotron.

## Limitaciones y advertencias

- Perdida de precision respecto al BF16: la media cae de 74,9 a 74,1 y MMLU-Pro baja 2,2 puntos (71,3 a 69,1). En tareas sensibles al conocimiento enciclopedico conviene validar contra el modelo original.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica en la model card; el modelo base es un modelo de lenguaje generativo y hereda ese riesgo.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto: no disponible, lo que impide planificar el consumo de VRAM con precision.
- Restricciones de licencia: se aplica la NVIDIA Nemotron Open Model License, la misma que el modelo base. Es una licencia "other" que debe revisarse antes de uso comercial; no es una licencia OSI de uso libre sin condiciones.
- Compatibilidad de backend limitada: SGLang no puede cargar el checkpoint y llama.cpp, Ollama o TGI no estan documentados. El despliegue esta atado practicamente a vLLM.
- Requisito de kernel especifico: hay que desactivar `MacheteLinearKernel` y, en H100/H200 sin CUDA 13, ajustar `LD_LIBRARY_PATH`; esto complica la contenedorizacion y el despliegue automatizado.
- Reproducibilidad no bit a bit: la receta QDA regenera pesos funcionalmente equivalentes pero no identicos, por lo que las evaluaciones pueden variar ligeramente entre rebuilds.
- Fecha y madurez: el checkpoint se publico en noviembre de 2026 y acumula 771 descargas y 0 likes; el ecosistema de herramientas en torno a el es todavia reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W4A16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Receta de cuantizacion (YAML): https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Nemotron-3-Nano-30B-A3B-W4A16/nemotron-3-nano-30b-a3b-w4a16.yaml
- Datos de calibracion y destilacion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Nemotron-3-Nano-30B-A3B-W4A16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
