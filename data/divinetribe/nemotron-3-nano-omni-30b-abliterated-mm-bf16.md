# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16

## Resumen

Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16 es una variante "abliterated" (sin alineamiento de seguridad) del modelo multimodal Nemotron-3-Nano-Omni-30B-A3B-Reasoning de NVIDIA, publicada por el usuario divinetribe en Hugging Face. El modelo original es un transformer híbrido de tipo NemotronH que combina capas Mamba y atención con mezcla de expertos (MoE) de 30B parámetros totales y aproximadamente 3B activos por token, y que procesa de forma nativa texto, imagen y audio. Esta versión concreta redistribuye los pesos en formato MLX (bf16) para su ejecución en Apple Silicon, manteniendo intactas las torres de visión y audio y eliminando únicamente la dirección de rechazo del stack de lenguaje.

El problema que resuelve esta ficha es doble: por un lado, ofrece una build del Omni ejecutable en Mac con `mlx-vlm`; por otro, elimina el comportamiento de rechazo mediante ablación direccional (Arditi et al.) aplicada sobre dos bloques residuales (16 y 31), ortogonalizando las direcciones con Gram-Schmidt en todas las proyecciones que escriben en el residual (mamba `out_proj`, atención `o_proj`, `fc2` de expertos enrutados del MoE, `down_proj` del experto compartido y embeddings de tokens).

Es relevante ahora porque el ecosistema de inferencia local en Apple Silicon carecía de builds abliterated de modelos omni (texto+visión+audio); las alternativas sin censura existentes eran NVFP4 o GGUF. El repositorio ocupa 66 GB, cuenta con 1.481 tensores (401 de lenguaje abliterado, 390 de visión, 684 de audio y 6 de proyección) y ha acumulado 819 descargas y 2 likes desde su publicación en agosto de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NemotronH híbrida (Mamba + atención) con MoE; tri-modal (texto, visión, audio) |
| Parámetros totales | 33.015.598.918 (33,0B) |
| Parámetros activos | ~3B (variante A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (build completa, ~62 GB); GGUF Q4_K_M disponible en repo de terceros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas) |
| Formato de pesos | safetensors (MLX); GGUF en conversión externa |

## Arquitectura y entrenamiento

El modelo base Nemotron-3-Nano-Omni-30B-A3B-Reasoning emplea una arquitectura híbrida NemotronH que intercala capas Mamba (modelos de espacio de estados) con capas de atención transformer, e incorpora mezcla de expertos con enrutamiento disperso: de los 33B parámetros totales, solo unos 3B se activan por token. Sobre ese tronco se añaden torres específicas de modalidad: una torre de visión (390 tensores) y una torre de audio (684 tensores), conectadas mediante 6 tensores de proyección al espacio del lenguaje. El modelo es, por tanto, un image-text-to-text con capacidad de audio, orientado a razonamiento.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original en la información proporcionada. La innovación técnica documentada en esta build es el proceso de abliteración: se identificaron dos direcciones de rechazo (bloques 16 y 31), se ortogonalizaron entre sí mediante Gram-Schmidt y se proyectaron fuera de todas las matrices que escriben en el residual, incluyendo las capas Mamba y las proyecciones del MoE. El autor verifica la eliminación del rechazo con 6/6 en un conjunto dañino reservado, y confirma que visión y audio siguen funcionando (descripción de imágenes y transcripción de voz). Los 1.481 tensores mantienen nombres idénticos a los del modelo base, lo que facilita la conversión a otros formatos.

## Capacidades

- Generación de texto y razonamiento multi-paso (el modelo base es la variante "Reasoning").
- Procesamiento de imagen: descripción de imágenes y respuesta a preguntas visuales (image-text-to-text).
- Procesamiento de audio: transcripción de voz según la model card.
- Razonamiento multimodal combinado: entrada simultánea de texto, imagen y audio mediante proyecciones dedicadas.
- Conversación multi-turno (tag `conversational`).
- Ejecución nativa en Apple Silicon vía MLX (`mlx-vlm` 0.6.12 o superior).
- Compatibilidad con llama.cpp mediante GGUF y `mmproj` combinado de audio y visión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada (el nombre del base incluye "Reasoning").

## Casos de uso

- Asistente local multimodal en Mac: ejecución de un modelo que acepta texto, imagen y audio en un portátil o sobremesa Apple Silicon mediante `mlx-vlm`, sin depender de la nube, usando la build bf16 de 62 GB en equipos con memoria unificada suficiente.
- Descripción y análisis de imágenes en pipelines locales: el modelo base procesa imágenes y esta build conserva la torre de visión intacta, por lo que sirve para etiquetado automático, accesibilidad (descripción de imágenes para lectores de pantalla) o moderación visual en entornos sin conexión.
- Transcripción de audio: la torre de audio (684 tensores) permite transcribir voz, útil para generar actas de reuniones o subtítulos en flujos de trabajo locales.
- Investigación sobre alineamiento y seguridad: al ser una build abliterated verificada, permite estudiar el comportamiento de un modelo sin dirección de rechazo, comparar respuestas frente al base y analizar la localización de la dirección de rechazo en las capas 16 y 31.
- Evaluación de inferencia en Apple Silicon: sirve como banco de pruebas para medir rendimiento de un MoE híbrido Mamba-atención de 33B con MLX, y para comparar con la ruta GGUF/llama.cpp Q4_K_M en el mismo hardware.
- Integración como agente local: el autor lo incluye como uno de los modelos de su proyecto Claude Code Local, un servidor compatible con la API de Anthropic ejecutado íntegramente en el dispositivo, por lo que puede usarse como backend de agentes de código en local.
- Conversión y portabilidad de formatos: los nombres de tensor idénticos al base y el parche documentado para `llama.cpp/conversion/nemotron.py` permiten a desarrolladores generar sus propias cuantizaciones GGUF para despliegue en CPU o GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta verificaciones cualitativas: eliminación del rechazo en 6/6 casos de un conjunto dañino reservado, descripción correcta de imágenes y transcripción de voz funcional.

## Requisitos de hardware

- VRAM/memoria estimada: la build bf16 ocupa ~62 GB de pesos (repo de 66 GB), por lo que requiere al menos ~64 GB de memoria unificada en Apple Silicon para inferencia sin cuantizar.
- La variante GGUF Q4_K_M de terceros reduce sustancialmente el requisito de memoria, aunque no se especifica el tamaño exacto en la información disponible.
- GPU recomendadas: no disponible para CUDA; la build está orientada a Apple Silicon (series M con memoria unificada alta, tipo M2/M3/M4 Max o Ultra). Para llama.cpp con GGUF, cualquier GPU con VRAM suficiente para Q4_K_M.
- ¿Cabe en GPU consumer? La build bf16 no cabe en GPUs consumer típicas de 24 GB (RTX 4090); la cuantización Q4_K_M podría caber, pero no se confirma en la información proporcionada.
- Opciones de despliegue: `mlx-vlm` (>= 0.6.12) para MLX; llama.cpp con GGUF y `mmproj` combinado; servidor compatible con API de Anthropic del proyecto Claude Code Local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16 | 33,0B totales / ~3B activos | no disponible | texto, visión, audio | other | MLX safetensors; GGUF de terceros |
| mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16 (base) | 33,0B totales / ~3B activos | no disponible | texto, visión, audio | other | MLX safetensors |
| Otras builds abliterated del Omni (NVFP4 / GGUF) | mismas que el base | no disponible | texto, visión, audio | other | NVFP4 / GGUF, no ejecutables en Mac según el autor |
| wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF | mismas que el base | no disponible | texto, visión, audio | other | GGUF Q4_K_M |

La diferencia principal frente al base es la eliminación del rechazo y la preservación de las torres de visión y audio; frente a las otras builds abliterated, el valor añadido es el soporte nativo MLX para Apple Silicon.

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido eliminado deliberadamente: el modelo responderá a peticiones que el base rechazaría. El autor declara que la responsabilidad del uso recae en el usuario.
- Riesgo elevado de generar contenido dañino, ilegal o sesgado; no es apto para despliegues de producción orientados al público sin capas adicionales de moderación.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de benchmarks publicados que permitan calibrar su fiabilidad.
- La licencia es "other" y no se detallan sus condiciones; es necesario revisar los términos del modelo base de NVIDIA antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con documentos largos.
- La build bf16 requiere ~62 GB de memoria, lo que limita su uso a equipos Apple Silicon de gama alta o a conversiones cuantizadas.
- La conversión a GGUF requiere un parche manual en `llama.cpp/conversion/nemotron.py`; sin él, la conversión falla en las capas `switch_mlp`.
- Dependencia de versiones recientes de `mlx-vlm` (0.6.12+); versiones anteriores no soportan Omni.
- Los datos de descargas y estrellas citados en la model card (57,0k descargas totales del autor, 3,7k estrellas) no coinciden con las métricas de esta ficha (819 descargas, 2 likes) y deben tratarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16
- Modelo base: https://huggingface.co/mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16
- Conversión GGUF de terceros: https://huggingface.co/wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF
- Repositorio de runtime MLX: https://github.com/nicedreamzapp/nemotron-omni-mlx
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- Discusión con detalles de la conversión GGUF: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16/discussions/1
