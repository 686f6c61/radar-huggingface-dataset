# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit

## Resumen

Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit es una version modificada del modelo multimodal Nemotron-3-Nano-Omni-30B-A3B-Reasoning de NVIDIA, publicada por el usuario divinetribe. Se trata de una build "abliterated" (eliminacion de la direccion de rechazo) convertida a formato MLX en precision de 8 bits, disenada especificamente para ejecutarse en Apple Silicon. El modelo conserva las tres modalidades del original: texto, vision y audio.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo MoE multimodal de NVIDIA, una tecnica de ablacion direccional (Arditi et al.) aplicada sobre el stack de lenguaje, y un runtime nativo de MLX para Mac. Segun el autor, es la primera build abliterated del Omni en MLX; las otras versiones sin censura existentes son NVFP4 o GGUF y no se ejecutan en macOS.

El modelo base tiene 33.015.598.918 parametros totales segun los safetensors del repo, con arquitectura NemotronH (hibrida Mamba/attention/MoE) y una variante "A3B" que sugiere aproximadamente 3.000 millones de parametros activos, aunque este dato no se confirma en la informacion disponible. El repo ocupa 35,8 GB y contiene 1.481 tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (hibrida: Mamba + attention + MoE), segun tags y nombres de tensores |
| Parametros totales | 33.015.598.918 |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX); el autor menciona builds alternativas NVFP4 y GGUF del ecosistema, no de este repo |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base de NVIDIA; consultar terminos de NVIDIA Nemotron) |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo base es Nemotron-3-Nano-Omni-30B-A3B-Reasoning de NVIDIA, un transformer hibrido de la familia NemotronH que combina capas Mamba, capas de attention y capas MoE con expertos enrutados y un experto compartido. La build de divinetribe conserva la estructura exacta del base: 1.481 tensores distribuidos en 401 del stack de lenguaje, 390 de la torre de vision, 684 de la torre de audio y 6 de proyeccion, con nombres identicos a los del modelo original.

El entrenamiento original de NVIDIA (datos, numero de tokens, uso de RLHF/DPO) no se detalla en la informacion proporcionada. La modificacion de divinetribe consiste en una ablacion direccional segun el metodo de Arditi et al.: identifica la direccion de rechazo, que en este modelo esta repartida en dos bloques (16 y 31) en lugar de uno solo, aplica ortogonalizacion de Gram-Schmidt y elimina esa direccion de todas las proyecciones que escriben en el residual: `out_proj` de Mamba, `o_proj` de attention, `fc2` de los expertos enrutados del MoE, `down_proj` del experto compartido y los embeddings de tokens. Las torres de vision y audio se copian sin modificacion. El autor reporta una verificacion de 6/6 en un conjunto danino reservado.

## Capacidades

- Generacion de texto y razonamiento en modo "Reasoning" (heredado del modelo base Nemotron-3-Nano-Omni-30B-A3B-Reasoning).
- Comprension de imagenes: descripcion de contenido visual, segun verificacion del autor.
- Transcripcion de audio: el autor indica que transcribe habla correctamente.
- Procesamiento multimodal conjunto texto-imagen-audio en una sola pasada (pipeline `image-text-to-text`).
- Conversacion multi-turno (tag `conversational`).
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion disponible, aunque el modelo base es de tipo "Reasoning".
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Multilingue: no disponible; el modelo card no lista idiomas.
- Modo thinking: el nombre del base incluye "Reasoning", pero no se detalla el mecanismo.

## Casos de uso

- Descripcion y analisis de imagenes en local: el modelo acepta una imagen y un prompt de texto mediante `mlx_vlm generate`; util para catalogar fotos, generar alt-text o extraer informacion de capturas sin enviar datos a la nube.
- Transcripcion de audio en dispositivos Apple: la torre de audio funciona en la build, lo que permite transcribir reuniones o notas de voz directamente en un Mac.
- Asistentes conversacionales multimodales en escritorio: la combinacion de texto, vision y audio en un solo modelo permite construir un asistente que recibe capturas de pantalla y audio del usuario en la misma sesion.
- Investigacion sobre alineacion y seguridad: al ser una build abliterated con metodo documentado (dos direcciones de rechazo, bloques 16 y 31), sirve como caso de estudio para estudiar como se distribuye la direccion de rechazo en arquitecturas hibridas Mamba/MoE.
- Evaluacion de modelos como agentes locales: el autor integra este modelo en el proyecto Claude Code Local y en el leaderboard Agent-12, por lo que puede usarse para comparar rendimiento agéntico en Apple Silicon.
- Desarrollo y prototipado offline en macOS: con `mlx-vlm` 0.6.12 o superior, se puede iterar sobre prompts multimodales sin conexion ni coste de API.
- Procesamiento de documentos con imagenes y audio combinados: por ejemplo, extraer texto de una foto de un documento y complementarlo con una nota de voz asociada en un mismo flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: aproximadamente 33 GB en 8-bit, mas overhead de runtime; el repo pesa 35,8 GB.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (orientativamente Mac Studio o MacBook Pro con 48 GB o mas; no confirmado por el autor).
- GPU NVIDIA: no aplicable, el formato es MLX y no se ejecuta en CUDA.
- Cabe en GPU consumer: si, en GPU Apple Silicon de gama alta con memoria unificada amplia; no en GPUs consumer NVIDIA por incompatibilidad de formato.
- Despliegue: `mlx-vlm` (version 0.6.12 o superior con soporte Omni); el autor referencia el repo `nicedreamzapp/nemotron-omni-mlx` como runtime de referencia. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit | 33,0 B (MoE) | no disponible | texto, vision, audio | MLX safetensors 8-bit | other | Abliterated, solo Apple Silicon |
| mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16 | no disponible | no disponible | texto, vision, audio | MLX bf16 | other | Modelo base sin modificar, mayor precision y tamano |
| Otras builds abliterated del Omni (NVFP4 / GGUF) | no disponible | no disponible | texto, vision, audio | NVFP4 / GGUF | no disponible | Mencionadas por el autor; no ejecutan en Mac |

## Limitaciones y advertencias

- La alineacion de seguridad ha sido eliminada deliberadamente: el modelo no rechaza peticiones daninas. El autor lo declara explicitamente y responsabiliza al usuario.
- Riesgo elevado de generar contenido nocivo, sesgado o inexacto; no apto para despliegues publicos sin capas adicionales de moderacion.
- Licencia "other" heredada de NVIDIA: es imprescindible revisar los terminos del modelo base Nemotron antes de cualquier uso comercial; la modificacion abliterated puede no estar cubierta.
- Solo funciona en Apple Silicon con MLX; no hay soporte CUDA, ROCm ni CPU generica.
- Requiere `mlx-vlm` 0.6.12 o superior; versiones anteriores no soportan Omni.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Longitud de contexto no documentada, lo que dificulta planificar cargas de contexto largo.
- Repo con muy poca traccion (558 descargas, 0 likes en el momento de la consulta) y autor individual; sin garantias de mantenimiento.
- La verificacion de eliminacion de rechazo es de 6/6 sobre un conjunto no publicado; no es una evaluacion exhaustiva.
- No hay benchmarks publicados que permitan comparar su calidad frente al base o frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit
- Modelo base: https://huggingface.co/mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16
- Runtime de referencia: https://github.com/nicedreamzapp/nemotron-omni-mlx
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- GitHub Sponsors: https://github.com/sponsors/nicedreamzapp
