# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16

## Resumen

Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16 es una compilacion no oficial, en precision completa (bf16) y formato MLX, del modelo multimodal Nemotron-3-Nano-Omni-30B de NVIDIA, publicada por el usuario divinetribe. El modelo original es un transformer hibrido con arquitectura NemotronH (combinacion de capas Mamba y atencion) y diseno Mixture-of-Experts, capaz de procesar texto, imagen y audio. Esta version concreta aplica una tecnica de "abliteration" (ablacion direccional) para eliminar la direccion de rechazo del stack linguistico, manteniendo intactas las torres de vision y audio.

El problema que resuelve es la ausencia de builds sin alineamiento de seguridad que funcionen de forma nativa en Apple Silicon: las alternativas existentes estan en NVFP4 o GGUF, no en MLX. El autor afirma que es el primer "Omni abliterado" en MLX. El modelo conserva las capacidades multimodales del original (descripcion de imagenes y transcripcion de audio verificadas) y esta pensado para ejecutarse en Macs con `mlx-vlm` 0.6.12 o superior, o bien convertido a GGUF para llama.cpp.

Con 33.015.598.918 parametros totales (segun safetensors), un repo de 66 GB y licencia "other" heredada del modelo base, es una pieza de interes para investigadores que necesitan estudiar comportamiento sin rechazo en entornos locales, no para despliegues de produccion convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido NemotronH (Mamba + atencion) con Mixture-of-Experts |
| Parametros totales | 33.015.598.918 |
| Parametros activos | no disponible (el nombre del modelo base indica 30B-A3B, es decir, ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en este repo; existe conversion GGUF Q4_K_M publicada por terceros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base de NVIDIA) |
| Formato de pesos | safetensors (MLX); GGUF disponible en repo de terceros |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura NemotronH de NVIDIA, un diseno hibrido que intercala capas de espacio de estados (Mamba) con capas de atencion, y utiliza Mixture-of-Experts en las capas de feed-forward. El checkpoint contiene 1.481 tensores: 401 del stack linguistico, 390 de la torre de vision, 684 de la torre de audio y 6 de proyeccion, con nombres identicos a los del modelo base. El modelo original fue entrenado por NVIDIA con datos multimodales (texto, imagen y audio) e incluye un modo de razonamiento, segun indica el nombre del checkpoint base (`Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16`). No se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO en la informacion proporcionada.

La innovacion de esta publicacion es el proceso de abliteration. El autor aplica ablacion direccional segun el metodo de Arditi et al., identificando que la direccion de rechazo del modelo esta distribuida en dos bloques (16 y 31), no en uno solo. Ambas direcciones se ortogonalizan mediante Gram-Schmidt y se eliminan de todas las proyecciones que escriben en el flujo residual: `out_proj` de Mamba, `o_proj` de atencion, `fc2` de los expertos enrutados del MoE, `down_proj` del experto compartido y los embeddings de tokens. Las torres de vision y audio se copian sin modificar. El autor verifica la eliminacion del rechazo con 6 de 6 casos en un conjunto danino reservado.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (heredado del modelo base Reasoning).
- Comprension de imagenes: descripcion de contenido visual, verificada por el autor.
- Procesamiento de audio: transcripcion de voz, verificada por el autor.
- Conversacion multiturno (pipeline `image-text-to-text`, tag `conversational`).
- Entrada combinada de imagen, audio y texto en una misma peticion.
- Ejecucion local en Apple Silicon mediante MLX y `mlx-vlm`.
- Conversion a GGUF con `mmproj` combinado de audio y vision para llama.cpp.
- Sin direccion de rechazo en el stack linguistico (comportamiento sin alineamiento de seguridad).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se distribuye la direccion de rechazo en arquitecturas hibridas Mamba-atencion con MoE, comparando el comportamiento con el checkpoint original de NVIDIA en las mismas entradas.
- Procesamiento multimodal local en Mac: un investigador puede transcribir audio y describir imagenes sin enviar datos a la nube, usando `mlx-vlm` sobre un Mac con memoria unificada suficiente (el repo pesa 66 GB en bf16).
- Analisis de contenido audiovisual en entornos air-gapped: al ejecutarse integramente en local, encaja en flujos donde la politica impide el envio de material sensible a APIs externas.
- Evaluacion de la degradacion por abliteration: comparar las respuestas del modelo abliterado frente al original en tareas de vision y audio permite medir si la ablacion del stack linguistico afecta a la calidad descriptiva.
- Prototipado de pipelines image-text-to-text en MLX: sirve como banco de pruebas para desarrolladores que construyen aplicaciones sobre `mlx-vlm` con soporte Omni antes de invertir en infraestructura CUDA.
- Pruebas en llama.cpp con cuantizacion Q4_K_M: la conversion GGUF publicada por terceros permite validar el comportamiento del modelo en CPU y GPUs de gama consumer, comparando la fidelidad frente al bf16 original.
- Docencia y demostraciones de tecnicas de ablacion direccional: el repositorio documenta el metodo concreto (dos bloques, Gram-Schmidt, lista de proyecciones afectadas), lo que lo convierte en material de referencia para cursos de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta verificaciones cualitativas: eliminacion del rechazo en 6 de 6 casos de un conjunto danino reservado, descripcion correcta de imagenes y transcripcion funcional de audio.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 62-66 GB en bf16 (el repo ocupa 66 GB; el autor indica "~62GB" de precision completa). En GGUF Q4_K_M el peso se reduce aproximadamente a una cuarta parte, aunque no se dispone de la cifra exacta en la informacion proporcionada.
- GPU recomendadas: no disponible para CUDA; el objetivo declarado es Apple Silicon con memoria unificada. Para el GGUF en llama.cpp se requiere una GPU con VRAM suficiente para Q4_K_M o ejecucion en CPU.
- Cabe en consumer GPU: en bf16 no cabe en GPUs consumer convencionales (24 GB o menos). La version GGUF Q4_K_M puede caber en GPUs con 24 GB de VRAM, aunque este dato no se confirma en la informacion proporcionada.
- Macs: requiere un equipo Apple Silicon con memoria unificada holgada para el checkpoint completo; el autor no especifica el minimo.
- Opciones de despliegue: `mlx-vlm` 0.6.12 o superior (via `python -m mlx_vlm generate`), llama.cpp con el parche al script de conversion `nemotron.py`, y pesos GGUF de terceros (`wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF`). vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16 | 33.015.598.918 | no disponible | texto, imagen, audio | safetensors MLX | other | Hugging Face, 950 descargas |
| mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16 (base) | mismo checkpoint | no disponible | texto, imagen, audio | safetensors MLX | other | Hugging Face |
| wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF | mismo checkpoint | no disponible | texto, imagen, audio | GGUF Q4_K_M | other | Hugging Face |
| Otros builds abliterados del Omni (NVFP4) | mismo checkpoint | no disponible | texto, imagen, audio | NVFP4 | other | mencionados por el autor, sin enlace |

La diferencia principal frente al modelo base es la eliminacion de la direccion de rechazo; frente a la version GGUF, el formato y la precision (bf16 frente a Q4_K_M); frente a los builds NVFP4, la compatibilidad con Apple Silicon.

## Limitaciones y advertencias

- La alineacion de seguridad ha sido eliminada deliberadamente: el modelo no rechaza peticiones daninas. El autor declara que la responsabilidad del uso recae en el usuario.
- La licencia es "other" y se hereda del modelo base de NVIDIA; no se detallan en la informacion proporcionada las condiciones exactas para uso comercial. Es imprescindible revisar los terminos del checkpoint original antes de cualquier despliegue productivo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al tratarse de un modelo de 30B con modo de razonamiento, es esperable en tareas de conocimiento factual, pero no hay datos que lo respalden.
- Sesgos conocidos: no documentados en la informacion proporcionada. La ablacion puede alterar la calibracion del modelo en dominios sensibles, un efecto no medido por el autor.
- Idiomas soportados: no disponibles. No se confirma soporte de castellano ni de otras lenguas distintas del ingles.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con documentos largos.
- La abliteration se aplico solo al stack linguistico; las torres de vision y audio conservan el comportamiento del modelo original, lo que puede generar respuestas inconsistentes entre modalidades.
- El build esta orientado a MLX y Apple Silicon; el soporte en llama.cpp requiere un parche manual al script de conversion si se realiza por cuenta propia.
- El checkpoint tiene 66 GB en bf16, lo que excluye su ejecucion en la mayoria de equipos consumer.
- La model card incluye estadisticas promocionales y enlaces de afiliacion del autor; conviene tratarlas con cautela y verificar las cifras de descargas en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16
- Modelo base: https://huggingface.co/mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16
- Conversion GGUF de terceros: https://huggingface.co/wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF
- Repositorio de runtime MLX: https://github.com/nicedreamzapp/nemotron-omni-mlx
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Discusion con detalles de la conversion GGUF: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16/discussions/1
- Perfil del autor: https://huggingface.co/divinetribe
- GitHub del autor: https://github.com/nicedreamzapp
