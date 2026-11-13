# bambocher/Qwen3.5-9B-heretic-oQ3e-mtp

## Resumen

Qwen3.5-9B-heretic-oQ3e-mtp es una cuantizacion mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint combina pesos en precisiones de 3, 4, 5, 6 y 8 bits junto con algunos tensores en BF16, con un promedio efectivo de 4,497 bits por peso. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.3), orientada a la libreria MLX de Apple, lo que la hace apta para inferencia en hardware Apple Silicon.

El modelo base, Qwen3.5-9B, pertenece a la familia Qwen3.5 desarrollada por Alibaba. Segun la informacion disponible, se trata de un modelo multimodal: el checkpoint incluye un componente de vision de 0,456B de parametros, ademas del modelo de lenguaje (8,954B) y una cabeza MTP (Multi-Token Prediction) de 0,243B. El total asciende a 9.653.104.368 parametros. El sufijo "heretic" sugiere un ajuste fino orientado a reducir el rechazo de peticiones (abliteracion o similar), aunque no se documenta en la model card.

La relevancia de esta publicacion es practica: ofrece un checkpoint de menos de 5,1 GiB de almacenamiento que puede ejecutarse en equipos Apple con memoria unificada moderada, manteniendo componentes de vision y decodificacion especulativa via MTP. No obstante, la informacion publicada es muy escasa (sin licencia, idiomas, benchmarks ni pipeline declarados) y el modelo no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; pesos cuantizados en MLX |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3/4/5/6/8 bits con grupo 64, mas BF16; promedio efectivo 4,497 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 4,329 GB / 4,032 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| Total | 9,653B | 5,426 GB / 5,053 GiB |

Distribucion de precision:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 6,604B | 68,413% | 2,691 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 1,692B | 17,532% | 0,887 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,811B | 8,399% | 0,519 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,050B | 0,521% | 0,038 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,005B | 0,052% | 0,005 GiB | 8,50 |
| BF16 | 0,491B | 5,083% | 0,914 GiB | 16,00 |

## Arquitectura y entrenamiento

La model card solo documenta el proceso de cuantizacion, no el entrenamiento del modelo base. Se sabe que la arquitectura subyacente es Qwen3.5, un transformer multimodal con un modulo de vision de 0,456B de parametros y una cabeza MTP de 0,243B. La presencia de esta cabeza MTP es relevante: permite decodificacion especulativa multi-token, lo que puede aumentar el throughput de generacion en hardware compatible.

La cuantizacion se realizo con oQ (oMLX v0.7.3), una herramienta de cuantizacion de precision mixta para MLX. La estrategia asigna 3 bits a la mayoria de pesos (68,4%) y reserva 4, 5, 6 y 8 bits, asi como BF16 (5,1% de los pesos), para capas presumiblemente mas sensibles. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el uso de RLHF/DPO ni el proceso de ajuste "heretic".

## Capacidades

- Generacion de texto y razonamiento, heredadas del modelo base Qwen3.5-9B.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,456B de parametros, por lo que se espera soporte de entrada de imagenes, aunque no se documenta en la model card.
- Decodificacion especulativa mediante cabeza MTP, orientada a reducir la latencia de generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint ocupa 5,4 GB en disco y esta en formato MLX, por lo que puede cargarse en equipos con memoria unificada de 16 GB o superior mediante la libreria MLX, sin necesidad de GPU dedicada.
- Procesamiento de documentos con imagenes en local: el modulo de vision integrado permite plantear tareas de descripcion de imagenes o extraccion de informacion visual en un flujo completamente offline, adecuado para entornos con requisitos de privacidad.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de ~9,6B con cuantizacion agresiva, permite iterar en local sin costes de API, util para validar prompts y flujos antes de pasar a produccion.
- Generacion de texto asistida en escritorio: integrable en aplicaciones macOS mediante MLX para tareas de redaccion, resumen o reescritura, con latencia baja gracias a la cabeza MTP.
- Evaluacion de tecnicas de cuantizacion mixta: sirve como caso de estudio para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 bits en el mismo modelo base.
- Experimentacion con modelos "abliterated" o "heretic": util para investigadores que estudian el efecto de este tipo de ajustes en la tasa de rechazo y en la calidad general, siempre que se respeten las politicas de uso aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos ~5,5-6 GB para cargar los pesos, mas overhead de KV cache y activaciones; en la practica se recomienda un minimo de 8-16 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que el formato es MLX. No es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con 16 GB o mas de memoria unificada. No esta pensado para GPUs NVIDIA consumer.
- Opciones de despliegue: libreria MLX (mlx-lm) y herramientas compatibles con MLX; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ3e-mtp | 9,653B | no disponible | Mixta 3-8 bits + BF16 (4,497 bits/peso) | no disponible | MLX safetensors |
| Qwen3.5-9B (base) | ~9,6B | no disponible | Original (BF16) | no disponible | safetensors |
| Otras cuantizaciones MLX de Qwen3.5-9B | ~9,6B | no disponible | Tipicamente 4-bit uniforme | segun autor | MLX safetensors |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base Qwen3.5-9B.
- El ajuste "heretic" puede alterar el comportamiento del modelo en materia de rechazo de peticiones; no se documenta su alcance ni sus efectos.
- La cuantizacion a 3 bits en el 68% de los pesos puede degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento o codigo.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia de comunidad que valide su calidad.
- Compatibilidad limitada a MLX/Apple Silicon; no es directamente utilizable en CUDA, ROCm ni CPU convencional.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en produccion.
- La fecha de creacion indicada (2026-11-13) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ3e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
