# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit

## Resumen

Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit es una compilación no oficial, cuantizada a 4 bits en formato MLX, del modelo multimodal Nemotron-3-Nano-Omni-30B de NVIDIA, publicada por el usuario divinetribe. El modelo original es un transformer híbrido con arquitectura NemotronH (capas Mamba y atención, con mezcla de expertos en las capas de atención) capaz de procesar texto, imagen y audio, y esta versión concreta le ha aplicado una ablación direccional para eliminar la dirección de rechazo del stack lingüístico, manteniendo intactas las torres de visión y audio.

La relevancia de esta ficha radica en dos factores. Primero, es una de las pocas builds "abliterated" del Omni disponibles para Apple Silicon: el autor afirma que las alternativas sin censura existentes son NVFP4 o GGUF y no se ejecutan de forma nativa en Mac. Segundo, permite ejecutar un modelo de 33.015.598.918 parámetros totales en aproximadamente 18 GB de pesos, lo que lo hace viable en equipos con memoria unificada de 32 GB o superior.

El repositorio ocupa 19,7 GB y contiene 1.481 tensores (401 del stack lingüístico abliterado, 390 de visión, 684 de audio y 6 de proyección), con nombres idénticos a los del modelo base `mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16`. La licencia declarada es "other", heredada del modelo original de NVIDIA, y no se especifican los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH hibrida (Mamba + atención + MoE en capas de atención), multimodal texto/imagen/audio |
| Parametros totales | 33.015.598.918 |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, sin confirmación oficial en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); el base está en bf16 |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (MLX), ~18 GB en 4 bits, repo de 19,7 GB |
| Tensores | 1.481 (401 lenguaje + 390 visión + 684 audio + 6 proyección) |
| Libreria de inferencia | mlx-vlm 0.6.12+ |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia NemotronH, que combina capas Mamba (modelos de espacio de estados) con capas de atención y mezcla de expertos (MoE) en el bloque de atención. La variante Omni añade dos torres sensoriales independientes: una de visión (390 tensores) y otra de audio (684 tensores), conectadas al stack lingüístico mediante proyecciones (6 tensores). El nombre del modelo base incluye el sufijo "Reasoning", lo que indica que fue entrenado con datos de razonamiento de cadena de pensamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La modificación introducida por divinetribe es una ablación direccional según el método de Arditi et al. El autor señala un detalle técnico relevante: la dirección de rechazo en este modelo está repartida entre dos bloques (16 y 31), de modo que una ablación de una sola capa deja el modelo rechazando peticiones. Ambas direcciones se ortogonalizan mediante Gram-Schmidt y se eliminan de todas las proyecciones que escriben en el residual: `out_proj` de Mamba, `o_proj` de atención, `fc2` de los expertos enrutados del MoE, `down_proj` del experto compartido y los embeddings de tokens. Las torres de visión y audio se copian sin modificar. El autor reporta una verificación de 5/6 en un conjunto reservado de peticiones dañinas.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredado del modelo base con sufijo "Reasoning".
- Procesamiento de imagen: descripción y comprensión visual (pipeline `image-text-to-text`).
- Procesamiento de audio: transcripción de voz según la model card.
- Capacidades multimodales conjuntas: el modelo puede recibir imagen y texto en una misma petición mediante `mlx-vlm`.
- Razonamiento de cadena de pensamiento (thinking) presumiblemente disponible por el entrenamiento del base, aunque no se detalla el formato exacto.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes: el autor lo incluye como uno de los modelos evaluados en su leaderboard de agentes locales (Agent-12), pero no se documentan capacidades específicas de uso agéntico.
- Capacidades multilingües: no disponible.
- Modo sin censura: se ha eliminado la dirección de rechazo del stack lingüístico, no de las torres de visión y audio.

## Casos de uso

- Procesamiento de documentos escaneados en local: el modelo puede recibir una imagen de un documento y generar texto descriptivo o extractivo, ejecutándose íntegramente en un Mac sin enviar datos a la nube. Adecuado por su naturaleza multimodal y su tamaño de 18 GB en 4 bits.
- Transcripción y análisis de audio en dispositivos Apple Silicon: la torre de audio permite transcribir voz; útil para actas de reuniones o subtitulado en entornos con requisitos de privacidad.
- Asistente de accesibilidad visual: descripción de imágenes para usuarios con discapacidad visual, ejecutado en local con latencia controlada y sin dependencia de APIs externas.
- Investigación sobre alineación y seguridad: la versión abliterada permite estudiar el comportamiento del modelo sin la capa de rechazo, comparando respuestas con el base bf16 original para analizar la dirección de rechazo en arquitecturas híbridas Mamba-MoE.
- Evaluación de agentes locales: el autor lo integra en su leaderboard Agent-12, por lo que sirve como candidato para tareas agénticas evaluadas por el sistema de ficheros en hardware Apple Silicon.
- Prototipado multimodal sin GPU dedicada: desarrolladores con Mac equipados con memoria unificada pueden probar pipelines de visión-lenguaje-audio sin aprovisionar A100/H100, usando `mlx-vlm`.
- Generación creativa sin restricciones de contenido: escritura de ficción o guiones que requieran temáticas que el modelo base rechazaría, asumiendo la responsabilidad legal y ética por parte del usuario.
- Análisis de imágenes médicas o industriales en entornos aislados: al ejecutarse offline, encaja en flujos donde no se permite exfiltrar datos a servicios externos, siempre que se validen las limitaciones clínicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una verificación cualitativa de la ablación (5/6 en un conjunto reservado de peticiones dañinas) y métricas de popularidad del repositorio (descargas, estrellas de GitHub), que no constituyen evaluaciones de rendimiento del modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~18 GB para los pesos en 4 bits, más overhead de KV cache y activaciones; se recomienda un mínimo de 24 GB de memoria unificada y 32 GB para contexto largo.
- Hardware objetivo: Apple Silicon exclusivamente (formato MLX). No es ejecutable en GPU NVIDIA o AMD sin conversión previa.
- Equipos compatibles: Mac con chip M-series de gama alta (M2 Max, M3 Max, M4 Max, M2/M3/M4 Ultra). En un M1/M2 base de 16 GB no cabe.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas de forma nativa por este repositorio; requeriría reconvertir los pesos a otro formato.
- Despliegue: `mlx-vlm` versión 0.6.12 o superior con soporte Omni; comando de ejemplo en la model card (`python -m mlx_vlm generate --model ... --image ... --prompt ...`).
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este repositorio concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia | Hardware |
|---|---|---|---|---|---|---|
| divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit | 33,0 B | no disponible | texto, imagen, audio | MLX safetensors 4-bit | other | Apple Silicon |
| mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16 (base) | 33,0 B | no disponible | texto, imagen, audio | MLX safetensors bf16 | other | Apple Silicon |
| Otras builds abliterated del Omni (NVFP4/GGUF, según el autor) | 33,0 B | no disponible | texto, imagen, audio | NVFP4 / GGUF | other | GPU NVIDIA / CPU |
| Nemotron-3-Nano (solo texto, familia base) | no disponible | no disponible | texto | varios | other | varios |

Las alternativas sin censura del Omni en NVFP4 o GGUF no se ejecutan de forma nativa en Mac según la model card, lo que convierte a esta build en la única opción MLX documentada por el autor para Apple Silicon. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La alineación de seguridad ha sido eliminada del stack lingüístico: el modelo generará contenido que el base rechazaría. El usuario asume la responsabilidad legal y ética de su uso.
- La ablación se aplicó solo al lenguaje; las torres de visión y audio conservan su comportamiento original, lo que puede producir respuestas inconsistentes entre modalidades.
- Licencia "other": no se detallan los términos exactos. Es imprescindible revisar la licencia del modelo base de NVIDIA antes de cualquier uso comercial, ya que la licencia del derivado puede heredar restricciones.
- Riesgo de degradación de capacidades: la ablación direccional puede afectar a otras habilidades además del rechazo, aunque el autor no reporta evaluaciones de regresión en benchmarks estándar.
- Riesgo de alucinación: no evaluado en la información disponible; los modelos multimodales de este tamaño son propensos a inventar detalles en imágenes y audio.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Longitud de contexto no especificada: limita la planificación de casos de uso con documentos largos.
- Requiere `mlx-vlm` 0.6.12 o superior con soporte Omni; versiones anteriores fallarán al cargar el modelo.
- Exclusivo para Apple Silicon: no hay soporte para CUDA, ROCm ni CPU genérica en este repositorio.
- Repositorio con 0 likes y 563 descargas en el momento de la consulta: menor validación comunitaria que el modelo base.
- El autor incluye enlaces promocionales y de captación de empleo en la model card; deben tratarse como información de contexto, no como aval técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-4bit
- Modelo base: https://huggingface.co/mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16
- Repositorio de runtime MLX para Omni: https://github.com/nicedreamzapp/nemotron-omni-mlx
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- Paper del método de ablación direccional (Arditi et al.): no disponible en la información proporcionada como enlace directo.
