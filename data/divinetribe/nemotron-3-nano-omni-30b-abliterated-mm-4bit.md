# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit

## Resumen

Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit es una version modificada y cuantizada del modelo multimodal Nemotron-3-Nano-Omni-30B-A3B-Reasoning de NVIDIA, publicada por el usuario divinetribe. Se trata de un build "abliterated": se ha eliminado la direccion de rechazo (refusal direction) del stack de lenguaje mediante ablacion direccional, mientras que las torres de vision y audio se han copiado sin modificar. El resultado es un modelo tri-modal (texto, imagen y audio) que acepta entradas image-text-to-text y funciona en Apple Silicon a traves de MLX.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo derivado de una familia reciente de NVIDIA con arquitectura hibrida (Mamba + atencion + MoE) y capacidades multimodales. Por otro, ilustra una practica creciente en la comunidad open source: la redistribucion de pesos cuantizados y modificados para eliminar el alineamiento de seguridad, algo que tiene implicaciones tecnicas y de licencia que conviene conocer antes de usarlo en produccion.

El repositorio ocupa 19,7 GB, contiene 1.481 tensores y declara 33.015.598.918 parametros totales en safetensors. La cuantizacion es de 4 bits y el formato esta pensado exclusivamente para MLX, no para CUDA. La licencia es "other" y no se especifican los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida NemotronH (Mamba + atencion + MoE), multimodal con torres de vision y audio |
| Parametros totales | 33.015.598.918 |
| Parametros activos | no disponible (el nombre indica A3B, ~3B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); el modelo base esta en bf16 |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (MLX), 1.481 tensores: 401 de lenguaje, 390 de vision, 684 de audio, 6 de proyeccion |

## Arquitectura y entrenamiento

El modelo base es Nemotron-3-Nano-Omni-30B-A3B-Reasoning, de NVIDIA, con arquitectura NemotronH: un transformer hibrido que combina capas Mamba (state space model) con capas de atencion y capas de mezcla de expertos (MoE). El sufijo A3B sugiere aproximadamente 3.000 millones de parametros activos por token, aunque la informacion disponible no lo confirma explicitamente. El modelo es tri-modal: incorpora una torre de vision y una torre de audio, ademas del stack de lenguaje, y esta orientado a razonamiento (Reasoning).

Sobre el entrenamiento original no se aportan datos en la informacion disponible: no se indica numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si se documenta es la intervencion posterior realizada por divinetribe: una ablacion direccional siguiendo el metodo de Arditi et al. La particularidad tecnica es que la direccion de rechazo del modelo no reside en una sola capa, sino que esta repartida entre dos bloques (16 y 31); una ablacion de una sola capa deja el modelo rechazando peticiones. Ambas direcciones se ortogonalizan mediante Gram-Schmidt y se eliminan de todas las proyecciones que escriben en el residual: `out_proj` de Mamba, `o_proj` de atencion, `fc2` de los expertos enrutados del MoE, `down_proj` del experto compartido y los embeddings de tokens. Las torres de vision y audio no se tocan. El autor declara una tasa de exito de 5/6 en un conjunto retenido de peticiones daninas.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta etiquetado como Reasoning, por lo que se espera capacidad de razonamiento multi-paso, aunque no se aportan benchmarks que lo cuantifiquen.
- Vision: descripcion de imagenes y tareas image-text-to-text. El autor afirma que "describe imagenes correctamente".
- Audio: transcripcion de voz, segun la model card.
- Conversacion multi-turno: la pipeline declarada es image-text-to-text con tag conversational.
- Multimodalidad combinada: al conservar las torres de vision y audio intactas, mantiene las capacidades de percepcion del modelo original.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: el autor lo incluye como uno de los modelos de su proyecto Claude Code Local, orientado a tareas de agente, pero no se detallan capacidades especificas de tool use.
- Capacidades multilingues: no disponible.
- Modo thinking: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Procesamiento de documentos con imagenes en local: el modelo puede recibir una imagen y texto en la misma peticion, lo que permite extraer y describir contenido de capturas, diagramas o documentos escaneados sin enviar datos a la nube, algo relevante en entornos con requisitos de privacidad.
- Transcripcion y analisis de audio en Apple Silicon: al conservar la torre de audio, puede transcribir locuciones y combinarlas con razonamiento textual en un mismo flujo, util para actas de reunion o analisis de llamadas.
- Asistente de desarrollo integrado en el editor: el autor lo distribuye como parte de Claude Code Local, un servidor compatible con la API de Anthropic que corre en local; el modelo puede usarse como backend de un agente de codigo en un Mac, sin depender de servicios externos.
- Investigacion sobre alineamiento y seguridad: al ser un build abliterated con metodologia documentada (dos bloques, Gram-Schmidt, lista de proyecciones afectadas), sirve como caso de estudio reproducible para estudiar donde reside la direccion de rechazo en arquitecturas hibridas con MoE.
- Evaluacion de inferencia MLX multimodal: util para medir latencia y consumo de memoria de un modelo de 33.000 millones de parametros cuantizado a 4 bits en hardware Apple, y para comparar el rendimiento de mlx-vlm frente a stacks CUDA.
- Prototipado de pipelines image-text-to-text sin GPU dedicada: un equipo que solo dispone de portatiles o estaciones Mac puede montar un prototipo funcional de clasificacion o descripcion de imagenes con este modelo, y migrar despues a la version bf16 o a un despliegue CUDA si el proyecto crece.
- Generacion de contenido sin filtros en entornos controlados: el modelo elimina el alineamiento de seguridad, lo que puede interesar en investigacion creativa o en simulacion de adversarios, siempre con las advertencias de la seccion de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una metrica interna de eficacia de la ablacion (5/6 en un conjunto retenido de peticiones daninas) y datos de descargas, no resultados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 18 GB para los pesos en 4 bits, segun la model card; el repositorio completo ocupa 19,7 GB. Hay que sumar el overhead de KV cache y de las torres de vision y audio, por lo que conviene disponer de 24 GB o mas de memoria unificada.
- Hardware objetivo: Apple Silicon exclusivamente. El formato es MLX y requiere `mlx-vlm` 0.6.12 o superior con soporte Omni.
- GPU NVIDIA: no es compatible de forma nativa. Para CUDA habria que recurrir al modelo base en bf16 o a otros builds (el autor menciona builds NVFP4 y GGUF de la comunidad, pero no los enlaza en la informacion disponible).
- Cabe en consumer hardware: si, en Macs con memoria unificada suficiente (configuraciones de 32 GB o mas son las mas seguras; 24 GB puede ser justo con contexto largo).
- Opciones de despliegue: `mlx-vlm` para inferencia y generacion; el autor mantiene un runtime de referencia en GitHub y un servidor compatible con la API de Anthropic dentro del proyecto Claude Code Local. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este build concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|---|
| divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit | 33,0 B totales | no disponible | Texto, vision, audio | MLX 4 bits, Apple Silicon | other | Abliterated, sin benchmarks publicos |
| mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16 | mismo base | no disponible | Texto, vision, audio | MLX bf16, Apple Silicon | no disponible | Modelo base sin modificar, con alineamiento intacto |
| Builds NVFP4 / GGUF de la comunidad (mencionados, sin identificar) | mismo base | no disponible | Texto, vision, audio | NVFP4 / GGUF, CUDA | no disponible | Tambien abliterated segun el autor; no corren en Mac |
| Nemotron-3-Nano-Omni-30B original de NVIDIA | mismo base | no disponible | Texto, vision, audio | safetensors bf16, CUDA | no disponible | Referencia upstream; no se detalla en la informacion |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con familias distintas.

## Limitaciones y advertencias

- Alineamiento de seguridad eliminado: la ablacion suprime la direccion de rechazo del stack de lenguaje. El modelo puede generar contenido danino, ilegal o sesgado sin filtros. El propio autor advierte que la responsabilidad recae en quien lo usa.
- Eficacia de la ablacion no garantizada: la metrica declarada es 5/6 sobre un conjunto retenido no publico; no hay evaluacion independiente ni detalle del conjunto de prueba.
- Riesgo de degradacion cognitiva: la ablacion direccional puede afectar a capacidades generales del modelo, y no se aportan benchmarks que descarten perdida de rendimiento en razonamiento o codigo.
- Alucinacion: no hay datos especificos, pero es un riesgo esperable en modelos de razonamiento multimodal sin evaluacion publicada.
- Licencia "other": no se detallan los terminos. Al derivar de un modelo de NVIDIA, es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial; la informacion disponible no permite confirmar si el uso comercial esta permitido.
- Idiomas: no se especifican los idiomas soportados; no se puede asumir un buen rendimiento en castellano.
- Contexto: no se publica la longitud de contexto, lo que impide planificar cargas con documentos largos.
- Hardware restringido: solo MLX y Apple Silicon. No hay soporte documentado para CUDA, vLLM, llama.cpp ni Ollama en este build.
- Dependencia de version: requiere `mlx-vlm` 0.6.12 o superior; versiones anteriores no cargaran el modelo correctamente.
- Procedencia y reproducibilidad: el autor no publica el script exacto de ablacion ni el conjunto de evaluacion; la reproducibilidad del metodo queda limitada a la descripcion en la model card.
- Datos de la model card potencialmente promocionales: incluye estadisticas de descargas y estrellas de GitHub insertadas dinamicamente, y enlaces a servicios y proyectos personales del autor. No son indicadores de calidad tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit
- Modelo base en Hugging Face: https://huggingface.co/mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16
- Runtime de referencia: https://github.com/nicedreamzapp/nemotron-omni-mlx
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard de agentes locales Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Paper del metodo de ablacion direccional (Arditi et al.): no disponible en la informacion proporcionada
- Documentacion de mlx-vlm: no disponible en la informacion proporcionada
