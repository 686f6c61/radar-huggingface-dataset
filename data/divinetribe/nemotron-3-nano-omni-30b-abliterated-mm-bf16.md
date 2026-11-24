# divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16

## Resumen

Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16 es una compilación no oficial, en formato MLX y precisión completa (bf16), del modelo multimodal Nemotron-3-Nano-Omni-30B de NVIDIA, publicada por el usuario divinetribe. El modelo original es un transformer híbrido con arquitectura NemotronH_Nano_Omni_Reasoning_V3 que procesa texto, imagen y audio en una única pila, con un total de 33.015.598.918 parámetros (aproximadamente 30B en el bloque de lenguaje, con mezcla de expertos). Esta versión aplica una ablación direccional para eliminar la dirección de rechazo del stack lingüístico, manteniendo intactas las torres de visión y audio.

La relevancia de esta ficha es doble: por un lado documenta una de las pocas implementaciones abliteradas de un modelo Omni que funciona en Apple Silicon vía MLX; por otro, sirve como referencia técnica de un modelo tri-modal de ~30B con licencia restrictiva (heredada de NVIDIA) y sin datos públicos de benchmarks en la información disponible. El repositorio ocupa 66 GB y contiene 1.481 tensores (401 de lenguaje, 390 de visión, 684 de audio y 6 de proyección).

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card del autor; no se han podido verificar especificaciones oficiales de NVIDIA ni resultados de evaluación independientes. Cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal (NemotronH_Nano_Omni_Reasoning_V3); bloque de lenguaje con mezcla de expertos (MoE, según referencias a `switch_mlp` y expertos enrutados), más torres de visión y audio con proyección |
| Parametros totales | 33.015.598.918 (~33,0B) |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~3B activos, A3B, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en bf16 (precisión completa, ~62 GB). Existe una conversión comunitaria a GGUF Q4_K_M publicada por wacomctl672; no se detallan otros niveles |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base de NVIDIA; no se especifican términos concretos) |
| Formato de pesos | safetensors (MLX, bf16); conversión GGUF disponible por terceros |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia NemotronH, con un bloque de lenguaje que combina capas de atención con capas de estado (mamba, según la mención a `out_proj` de mamba en el método de ablación) y una capa MoE con expertos enrutados (`switch_mlp.fc1/fc2`) más un experto compartido (`down_proj`). A esto se añaden dos torres específicas de modalidad: una de visión y otra de audio, conectadas mediante proyecciones al espacio del lenguaje. El total de tensores es 1.481 (401 lenguaje + 390 visión + 684 audio + 6 proyección), con nombres idénticos a los del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación en el modelo original. La model card solo describe el proceso de modificación: una ablación direccional según Arditi et al. aplicada sobre dos bloques (16 y 31), con direcciones ortogonalizadas mediante Gram-Schmidt y eliminadas de todas las proyecciones que escriben en el residual (`out_proj` de mamba, `o_proj` de atención, `fc2` de expertos enrutados, `down_proj` del experto compartido y embeddings de tokens). El autor indica que una ablación de una sola capa deja el modelo rechazando, de ahí el enfoque en dos bloques.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (el nombre del modelo base incluye "Reasoning").
- Procesamiento de imagen: descripción de imágenes y respuesta a preguntas visuales (pipeline `image-text-to-text`).
- Procesamiento de audio: transcripción de voz según la model card.
- Modo multimodal combinado: la conversión GGUF comunitaria usa un `mmproj` que integra audio y visión simultáneamente.
- Razonamiento de varios pasos (el autor lo incluye como "fighter" en su banco de pruebas de agentes locales).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.
- Alineación de seguridad eliminada deliberadamente (abliterated): no rechaza peticiones dañinas, verificado 6/6 en un conjunto reservado según el autor.

## Casos de uso

- Descripción y análisis de imágenes en local sobre Apple Silicon: con `mlx-vlm` 0.6.12+ se puede pasar una imagen y un prompt para obtener descripciones o extraer información, sin enviar datos a la nube.
- Transcripción de audio en dispositivos Apple: la torre de audio permite convertir voz a texto en local, útil para reuniones o notas de voz con requisitos de privacidad.
- Asistente de agente local: el autor lo integra en "Claude Code Local", un servidor compatible con la API de Anthropic que ejecuta Claude Code íntegramente en el dispositivo; el modelo actúa como uno de los "fighters" del banco de pruebas Agent-12.
- Procesamiento multimodal de documentos: combinación de imagen (capturas, escaneos) y texto para extraer y resumir contenido en un pipeline local.
- Investigación sobre alineación y seguridad: al tener la dirección de rechazo eliminada y documentada, sirve como caso de estudio para medir cómo afecta la ablación a las capacidades y a la tasa de rechazo.
- Prototipado en Mac con MLX: desarrollo de aplicaciones de visión-lenguaje-audio sin GPU dedicada, usando el formato nativo de Apple.
- Evaluación comparativa de modelos abliterados: la existencia de una versión GGUF Q4_K_M permite comparar el mismo modelo en MLX y en llama.cpp con distintos backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una verificación cualitativa: 6/6 en un conjunto reservado de peticiones dañinas tras la ablación, y confirmación de que visión y audio funcionan. No hay cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales (MMMU, AudioBench, etc.).

## Requisitos de hardware

- VRAM/unified memory para bf16: el repositorio ocupa 66 GB y el autor indica ~62 GB de pesos; se necesita un Mac con al menos 64 GB de memoria unificada, y 96 GB o más para trabajar con comodidad (contexto, caché KV y torres multimodales).
- GPU discretas: no se documenta soporte CUDA en esta compilación MLX; para NVIDIA habría que usar la conversión GGUF o los pesos originales de NVIDIA (no incluidos aquí).
- GPU de consumo: en bf16 no cabe en ninguna GPU de consumo actual (RTX 4090 tiene 24 GB). La versión GGUF Q4_K_M de wacomctl672 reduce el peso lo suficiente para caber en GPUs de 24 GB y en Macs de 32 GB, según la práctica habitual de cuantización Q4 (no verificado en la información).
- Opciones de despliegue: `mlx-vlm` >= 0.6.12 con soporte Omni (`python -m mlx_vlm generate`); llama.cpp con la conversión GGUF y el parche a `llama.cpp/conversion/nemotron.py` descrito en la model card; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16 (este) | ~33,0B | no disponible | texto, imagen, audio | other | MLX bf16 + GGUF Q4_K_M comunitario |
| mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16 (base) | ~33,0B | no disponible | texto, imagen, audio | other | MLX bf16 |
| wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF | ~33,0B | no disponible | texto, imagen, audio | other | GGUF Q4_K_M |
| Otros modelos Omni abliterados en NVFP4/GGUF (sin identificar) | no disponible | no disponible | texto, imagen, audio | no disponible | no disponible |

La comparativa se limita a variantes del mismo modelo base porque la información proporcionada no incluye alternativas de otros fabricantes con especificaciones verificables. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Alineación de seguridad eliminada: el modelo no rechaza peticiones dañinas por diseño; el autor lo advierte explícitamente y la responsabilidad del uso recae en el operador.
- La ablación se aplicó solo al stack de lenguaje; las torres de visión y audio son copias sin modificar, por lo que podrían conservar comportamientos del modelo original en tareas multimodales.
- Riesgo de alucinación: no evaluado en la información disponible; los modelos abliterados pueden degradar la coherencia y el rechazo de contenido falso.
- Licencia "other" heredada de NVIDIA: no se detallan los términos comerciales; es imprescindible revisar la licencia del modelo base antes de cualquier uso en producción.
- Idiomas y contexto no documentados: no se puede garantizar un rendimiento multilingüe ni una ventana de contexto concreta.
- Requisitos de memoria elevados en bf16 (~62-66 GB), lo que limita su uso a equipos de gama alta o a la cuantización GGUF de terceros.
- La conversión GGUF requiere un parche manual en `llama.cpp/conversion/nemotron.py`; sin él, la conversión falla en las capas MoE.
- El repositorio es una publicación de la comunidad (901 descargas, 2 likes en el momento de la consulta) sin validación independiente de NVIDIA; los enlaces de la model card incluyen contenido promocional del autor.
- No hay datos de benchmarks que permitan estimar la pérdida de calidad respecto al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16
- Modelo base: https://huggingface.co/mlx-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-bf16
- Conversión GGUF comunitaria: https://huggingface.co/wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF
- Repositorio de runtime MLX: https://github.com/nicedreamzapp/nemotron-omni-mlx
- Discusión con detalles de la conversión GGUF: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16/discussions/1
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Patrocinio del autor: https://github.com/sponsors/nicedreamzapp
