# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit

## Resumen

Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit es una compilación no oficial, en formato MLX y cuantizada a 8 bits, del modelo multimodal Nemotron-3-Nano-Omni-30B de NVIDIA, publicada por el usuario divinetribe. El modelo base es la versión bf16 de mlx-community (Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16), sobre la que se ha aplicado una ablación direccional para eliminar el comportamiento de rechazo (refusal) del stack de lenguaje, manteniendo intactas las torres de visión y audio. El resultado es un modelo tri-modal (texto, imagen y audio) que se ejecuta de forma nativa en Apple Silicon mediante la librería mlx-vlm.

La arquitectura subyacente es NemotronH (híbrida Mamba-Transformer con capas de mezcla de expertos), con 33.015.598.918 parámetros totales según los safetensors del repositorio y un diseño A3B (aproximadamente 3.000 millones de parámetros activos por token, según la nomenclatura del modelo base). El repositorio ocupa 35,8 GB y contiene 1.481 tensores: 401 del stack de lenguaje (ablacionado), 390 de la torre de visión, 684 de la torre de audio y 6 de proyección.

Su relevancia es doble: por un lado, ofrece una ruta práctica para ejecutar un modelo omni-modal de ~30B en un Mac con memoria unificada; por otro, ilustra el fenómeno de las compilaciones "abliterated" que eliminan la alineación de seguridad, con las implicaciones legales y éticas que ello conlleva. La licencia se declara como "other", heredada del modelo base, y no se especifican idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (híbrida Mamba-Transformer con MoE), tri-modal (texto, visión, audio) |
| Parametros totales | 33.015.598.918 |
| Parametros activos | ~3B por token (designación A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base existe en bf16 y hay builds NVFP4 y GGUF de otras fuentes |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base de NVIDIA) |
| Formato de pesos | safetensors (MLX), 1.481 tensores, 35,8 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base Nemotron-3-Nano-Omni-30B emplea la arquitectura NemotronH, una combinación de capas Mamba (modelos de espacio de estados) y capas de atención Transformer, con mezcla de expertos en las capas feed-forward. La designación A3B indica que, pese a los ~33B parámetros totales, solo se activan del orden de 3B por token, lo que reduce el coste computacional de la inferencia. El modelo es tri-modal: incorpora una torre de visión (390 tensores) y una torre de audio (684 tensores) conectadas al stack de lenguaje mediante proyecciones (6 tensores).

Sobre esta base, el autor aplica una ablación direccional siguiendo el método de Arditi et al. La particularidad documentada es que la dirección de rechazo del modelo está distribuida en dos bloques (16 y 31), de modo que una ablación de una sola capa deja el modelo rechazando. Ambas direcciones se ortogonalizan mediante Gram-Schmidt y se eliminan de todas las proyecciones que escriben en el flujo residual: `out_proj` de Mamba, `o_proj` de atención, `fc2` de los expertos enrutados del MoE, `down_proj` del experto compartido y los embeddings de tokens. Los tensores de visión y audio se copian sin modificar. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento: el sufijo "Reasoning" del modelo base sugiere capacidades de razonamiento explícito, aunque no se detallan modos de pensamiento en la información disponible.
- Comprensión de imágenes: la torre de visión funciona y el autor verifica que describe imágenes correctamente.
- Transcripción de audio: la torre de sonido transcribe voz según la model card.
- Procesamiento conjunto imagen-texto con pipeline `image-text-to-text`.
- Ejecución local en Apple Silicon mediante mlx-vlm (versión 0.6.12 o superior con soporte Omni).
- Comportamiento de rechazo eliminado en el stack de lenguaje (verificado 6/6 en un conjunto dañino reservado, según el autor).
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Descripción y análisis de imágenes en local: el modelo acepta una imagen y un prompt de texto mediante `mlx_vlm generate`, lo que permite construir herramientas de etiquetado, accesibilidad o análisis documental sin enviar datos a la nube.
- Transcripción de audio en dispositivos Apple: la torre de sonido permite convertir voz a texto en un Mac, útil para actas de reuniones o subtitulado cuando la privacidad es requisito.
- Asistentes personales multimodales sin conexión: al ejecutarse sobre MLX en Apple Silicon, se puede integrar en aplicaciones de escritorio que combinen capturas de pantalla, audio y texto en una sola conversación.
- Investigación sobre alineación y seguridad: al ser una build abliterated con metodología documentada (dos direcciones, Gram-Schmidt), sirve como caso de estudio para medir la robustez de la alineación y diseñar evaluaciones de refusal.
- Prototipado de pipelines omni-modales: desarrolladores que necesiten probar arquitecturas Mamba-Transformer con MoE y entradas mixtas pueden usar esta build de 8 bits para iterar rápido en un portátil o Mac Studio.
- Evaluación comparativa de cuantizaciones: al existir versiones bf16, NVFP4, GGUF y esta MLX de 8 bits, permite medir la degradación de calidad y el ahorro de memoria entre formatos en el mismo hardware.
- Integración en agentes locales de código: el autor la incluye como uno de los modelos de su proyecto Claude Code Local, que expone una API compatible con Anthropic sobre MLX; puede usarse como backend de un agente de desarrollo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta verificaciones cualitativas: 6/6 en un conjunto dañino reservado para confirmar la eliminación del rechazo, descripción correcta de imágenes y transcripción de voz. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~33 GB para los pesos en 8 bits, más overhead de contexto y de las torres de visión y audio; en la práctica se recomienda un Mac con 48 GB o 64 GB de memoria unificada.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; no está pensado para CUDA.
- GPU de consumo: cabe en Mac Studio y MacBook Pro de gama alta con 48 GB o más; en configuraciones de 32 GB es probable que no quepa con contexto útil.
- Opciones de despliegue: `mlx-vlm` (0.6.12+) para inferencia multimodal; el repositorio de referencia nemotron-omni-mlx ofrece un runtime y una API compatible con Anthropic para uso como agente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta build MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit (este) | 33,0B totales, ~3B activos | no disponible | texto, visión, audio | MLX 8-bit | other | Hugging Face, 678 descargas |
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning (bf16, mlx-community) | 33,0B totales, ~3B activos | no disponible | texto, visión, audio | MLX bf16 | other | Hugging Face |
| Otras builds abliterated de Omni (NVFP4, GGUF) | 33,0B totales, ~3B activos | no disponible | texto, visión, audio | NVFP4, GGUF | other | Hugging Face (según el autor) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La alineación de seguridad ha sido eliminada deliberadamente: el modelo no rechazará solicitudes dañinas, lo que constituye un riesgo directo en producción y puede vulnerar términos de uso de servicios que exijan filtros.
- Licencia "other" heredada del modelo base: es imprescindible revisar los términos de NVIDIA antes de cualquier uso comercial; la ablación puede incumplir cláusulas de uso aceptable del modelo original.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser una modificación no oficial, no hay garantías de que la ablación no degrade el razonamiento.
- Idiomas soportados no documentados: no se puede asumir un rendimiento correcto en castellano sin evaluación previa.
- Longitud de contexto no disponible: limita la planificación de cargas con documentos largos.
- Dependencia de hardware Apple Silicon y de mlx-vlm 0.6.12+: no hay soporte CUDA ni compatibilidad con stacks habituales de servidor.
- Build de un solo autor, con 678 descargas y 1 like: menor escrutinio de la comunidad que el modelo base; conviene validar los tensores y el comportamiento antes de desplegarlo.
- Las torres de visión y audio no fueron ablacionadas, por lo que pueden conservar comportamientos de rechazo o filtros propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-8bit
- Modelo base: https://huggingface.co/mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16
- Repositorio de runtime: https://github.com/nicedreamzapp/nemotron-omni-mlx
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard de agentes locales: https://nicedreamzapp.github.io/agent12/
- Perfil del autor: https://huggingface.co/divinetribe
- GitHub del autor: https://github.com/nicedreamzapp
- Patrocinio: https://github.com/sponsors/nicedreamzapp
