# nchapman/Qwen3.5-0.8B-W4A16-HGPTQ

## Resumen

Qwen3.5-0.8B-W4A16-HGPTQ es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-0.8B, desarrollada por el usuario nchapman. Se trata de un modelo ultraligero de 0,8 mil millones de parámetros que procesa texto e imagen (pipeline image-text-to-text) y que emplea la arquitectura de atención híbrida de Qwen, además de un cabezal integrado de Multi-Token Prediction (MTP) para decodificación especulativa. La cuantización reduce el peso de 1,63 GiB en BF16 a 0,79 GiB, lo que permite ejecutarlo en GPUs de gama consumer con 2-4 GB de VRAM.

El interés de esta ficha radica en que combina tres elementos poco habituales en un modelo de este tamaño: capacidades de visión, decodificación especulativa nativa mediante MTP y un formato de cuantización W4A16 con rotación de Hadamard (HGPTQ) compatible con vLLM y con el runtime propio del autor, warp34. El resultado es un modelo pensado para inferencia local rápida, con un contexto amplio para su tamaño y un consumo de memoria muy contenido.

La cuantización calibra conjuntamente el backbone de texto, el codificador de visión y el cabezal MTP, de modo que tanto la visión como la decodificación especulativa funcionan sin ajustes adicionales. Según la model card, conserva un 94,0 % de coincidencia top-1 en visión aislada y un 90,2 % de acuerdo del borrador MTP respecto al modelo de 16 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención híbrida (qwen3_5) y Multi-Token Prediction (MTP) integrado |
| Parametros totales | 875.535.936 (≈0,88 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (4 bits en pesos, 16 bits en activaciones), GPTQ con rotación de Hadamard (HGPTQ), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), requiere `trust-remote-code` en transformers/vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea la arquitectura de atención híbrida de Qwen e incorpora Multi-Token Prediction (MTP) como cabezal de borrador para decodificación especulativa. Esta cuantización no modifica la topología: aplica GPTQ de 4 bits sobre los pesos con una rotación de Hadamard previa (HGPTQ), empaquetando los pesos en el formato compressed-tensors que consumen vLLM y warp34. La calibración es de modelo completo: cubre el backbone de texto, el codificador de visión y el cabezal MTP de forma conjunta, lo que evita tener que recalibrar o descartar componentes tras la cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO. La model card tampoco detalla la innovación arquitectónica interna de la atención híbrida más allá de su nombre. La innovación destacable de esta ficha es la propia cuantización: la rotación de Hadamard reduce los valores atípicos antes de la cuantización, lo que permite kernels CUDA a plena velocidad en warp34 sin flags adicionales y mantiene una fidelidad cercana a BF16 (94,0 % en visión top-1 y 90,2 % de acuerdo del borrador MTP).

## Capacidades

- Generación de texto conversacional en un modelo de 0,8B, orientado a tareas ligeras y chat local.
- Comprensión de imagen y texto (image-text-to-text): el codificador de visión está cuantizado y operativo.
- Decodificación especulativa nativa mediante el cabezal MTP integrado, que acelera la generación al proponer varios tokens por paso.
- Inferencia local de baja latencia en GPUs de 2-4 GB gracias al peso de 0,79 GiB.
- Compatibilidad con vLLM 0.34+ y con el runtime warp34 mediante `--trust-remote-code`.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Chat local en equipos de gama baja: el modelo ocupa 0,79 GiB, por lo que puede servirse en una RTX 3050 de 4 GB o similar y dejar el resto de la VRAM para contexto y concurrencia.
- Asistente de escritorio con entrada de imágenes: al conservar el codificador de visión cuantizado, permite describir capturas de pantalla, diagramas o fotos sin depender de la nube.
- Prototipado rápido de pipelines multimodales: su reducido tamaño permite iterar sobre prompts y flujos de imagen-texto en una sola GPU consumer antes de escalar a modelos mayores de la misma familia (2B o 4B).
- Servicio de inferencia de alta concurrencia en hardware limitado: con 0,79 GiB de pesos, un solo servidor puede alojar varias instancias o atender muchas peticiones simultáneas con vLLM.
- Pruebas de decodificación especulativa: el cabezal MTP integrado y calibrado permite experimentar con drafting y verificación en un modelo pequeño, útil para validar configuraciones antes de aplicarlas a modelos mayores.
- Educación y demostraciones: la licencia Apache 2.0 y el tamaño reducido facilitan su uso en talleres, notebooks y entornos docentes con GPUs modestas.
- Clasificación y extracción de información a partir de imágenes y texto en local, como tickets, formularios o etiquetas, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Solo se reportan métricas de fidelidad de la cuantización frente al modelo de 16 bits:

| Metrica | Valor |
|---|---|
| Coincidencia top-1 en visión aislada (vs. BF16) | 94,0 % |
| Acuerdo del borrador MTP (vs. BF16) | 90,2 % |
| Tamano de pesos cuantizados | 0,79 GiB |
| Tamano de pesos en BF16 | 1,63 GiB |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,79 GiB solo para pesos; con contexto y overhead de runtime, cabe holgadamente en GPUs de 2-4 GB.
- GPUs recomendadas: cualquier RTX 30/40-series con 2-4 GB o más según el autor; también funciona en GPUs de datacenter (A100, H100) para despliegues de alta concurrencia.
- Cabe en GPU consumer: sí, en tarjetas de 4 GB como la RTX 3050 o superiores; el autor indica compatibilidad desde 2 GB.
- Opciones de despliegue: warp34 (`warp34 serve nchapman/Qwen3.5-0.8B-W4A16-HGPTQ`) y vLLM 0.34+ (`vllm serve ... --trust-remote-code`). No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-W4A16-HGPTQ (este) | 875,5 M | no disponible | Sí | Apache 2.0 | Hugging Face, vLLM, warp34 |
| Qwen3.5-2B-W4A16-HGPTQ | no disponible | no disponible | no disponible | no disponible | Hugging Face (1,83 GiB) |
| Qwen3.5-4B-W4A16-HGPTQ | no disponible | no disponible | no disponible | no disponible | Hugging Face (3,19 GiB) |
| Qwen/Qwen3.5-0.8B (base, BF16) | 875,5 M | no disponible | Sí | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Qwen3.5 porque la información proporcionada no incluye datos de modelos de otros fabricantes. Los dos modelos superiores de la misma familia (2B y 4B) ofrecen más capacidad a cambio de mayor huella de memoria (1,83 GiB y 3,19 GiB respectivamente).

## Limitaciones y advertencias

- Modelo de 0,8B: capacidad de razonamiento, código y matemáticas limitada en comparación con modelos de mayor tamaño; no debe usarse como sustituto de modelos grandes en tareas complejas.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en preguntas factuales y contextos largos.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- Longitud de contexto no especificada en la información disponible.
- La cuantización introduce una pérdida de fidelidad respecto a BF16 (94,0 % en visión top-1 y 90,2 % de acuerdo MTP), que puede acumularse en tareas de visión o en generaciones largas con decodificación especulativa.
- Requiere `--trust-remote-code` en vLLM y transformers, lo que implica ejecutar código del repositorio; conviene auditar el modelo antes de desplegarlo en producción.
- Soporte de despliegue limitado a warp34 y vLLM 0.34+ según la model card; no se documentan otros runtimes.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.5-0.8B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuantización 2B de la misma familia: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-HGPTQ
- Cuantización 4B de la misma familia: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-HGPTQ
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantización warp34-quant-lab: https://github.com/nchapman/warp34-quant-lab
