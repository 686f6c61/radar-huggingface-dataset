# Hayabala/SenseNova-6.8-Code2Video-EXL3

## Resumen

SenseNova 6.8 Code2Video es un modelo de creación de vídeo dirigida por código, desarrollado por SenseNova (OpenSenseNova) y afinado a partir de Qwen3.8-27B. En lugar de generar píxeles directamente, el modelo produce código ejecutable que construye y renderiza el vídeo, lo que le permite encadenar herramientas externas de generación de imágenes, vídeo, modelado 3D y edición. Está pensado para cortometrajes implementados íntegramente en código, con resultados preliminares notables en composición visual y coreografía de movimiento.

La ficha que nos ocupa, `Hayabala/SenseNova-6.8-Code2Video-EXL3`, es una cuantización EXL3 de 6.0 bits por peso del modelo original, publicada por el usuario Hayabala. Emplea el formato EXL3 de exllamav3 v1.6.5, con codebook `mul1` y calibración de 250 filas por 2048 columnas. El checkpoint cuantizado pesa 22,4 GB y declara 11.189.144.448 parámetros en safetensors, aunque la model card del modelo base indica 27B; esta discrepancia no se aclara en la información disponible.

La relevancia de esta variante radica en que reduce el peso del modelo base para facilitar su despliegue en entornos con VRAM limitada, manteniendo el pipeline `image-text-to-text` y las capacidades de agente y tool calling del original. Es importante señalar que esta cuantización no incluye la capa MTP que el config original declaraba, y que debe ejecutarse con exllamav3 (por ejemplo, tabbyAPI), no con vLLM, SGLang o LightLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B); pipeline image-text-to-text |
| Parámetros totales | 11.189.144.448 (safetensors del checkpoint cuantizado); el modelo base declara 27B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 512K (según badge de la model card del modelo base) |
| Tipos de cuantización | EXL3 6.0 bpw (`head_bits`: 6, `vision_bits`: 6); codebook `mul1`; out scales `auto` |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, cargable por exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer afinado desde Qwen3.8-27B, orientado a la generación de código que construye y renderiza vídeo. La model card describe un enfoque en el que el código actúa como lenguaje intermedio entre la idea creativa y el resultado final, permitiendo llamar a modelos de generación de imagen, vídeo, modelado 3D y edición para encadenar generación, edición y composición. El config original declaraba una capa MTP (`mtp_num_hidden_layers: 1`), aunque en esta cuantización no hay pesos MTP presentes: el autor modificó `config.json` para fijar `text_config.mtp_num_hidden_layers` a 0 y eliminar `text_config.mtp_use_dedicated_embeddings`.

La cuantización se produjo con una copia modificada de `exl3_lib/quantize.py` de exllamav3 (licencia MIT), incluida en el repositorio como `scripts/quantize.py`. Los cambios respecto a la versión estándar incluyen soporte para la captura de Hessian empaquetada en triángulo superior por bloques (decodificada mediante `hessian_packed.unpack`), estadísticas Q/H por trozos y en sitio que eliminan el intermedio float32 completo de k x n (con `chunk` por defecto de 16384 a 1024), factorización del Hessian en el dispositivo de cuantización en lugar del de captura (`H_swap_device`), y el aparcamiento de los factores de Cholesky almacenados en CPU durante la recursión para evitar que los factores por experto se acumulen en el dispositivo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de código ejecutable para construir y renderizar vídeo (cortometrajes implementados íntegramente en código).
- Composición visual y coreografía de movimiento en motion design, según resultados preliminares del modelo base.
- Encadenamiento de herramientas: puede llamar a modelos de generación de imagen, generación de vídeo, modelado 3D y edición de vídeo.
- Soporte de tool calling y flujos de agente (etiquetas `agent`, `claude-code`; trayectorias de ejemplo con logs de mensajes y herramientas).
- Entrada image-text-to-text (pipeline declarado), con cuantización también de la torre de visión (`vision_bits`: 6).
- Capacidades multilingües limitadas a inglés y chino.
- Modo conversacional (`conversational` en las etiquetas).

## Casos de uso

- Explicadores matemáticos en vídeo: el modelo genera código que dibuja y anima conceptos matemáticos, adecuado por su capacidad de producir código ejecutable y su contexto de 512K para mantener coherencia en secuencias largas.
- Películas de paper-craft y mundos isométricos: la generación de código permite construir escenas con geometría y movimiento consistentes, encadenando herramientas de render.
- Tipografía cinética y data stories: el modelo puede traducir datos y guiones en animaciones tipográficas o visualizaciones animadas mediante código.
- Animación de personajes y promociones de producto: útil para prototipos rápidos de vídeo corto donde el código orquesta composición y movimiento.
- Automatización de pipelines creativos: al soportar tool calling, puede integrarse en flujos que llamen a generadores de imagen o vídeo y a editores, encadenando generación, edición y composición.
- Despliegue en entornos con VRAM limitada: esta cuantización EXL3 de 6.0 bpw (22,4 GB) permite servir el modelo con exllamav3/tabbyAPI en hardware más modesto que el BF16 original.
- Agentes de creación de contenido: las trayectorias de ejemplo y las etiquetas `agent`/`claude-code` sugieren su uso en agentes que planifican y ejecutan pasos de creación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint cuantizado ocupa 22,4 GB en disco; se requiere VRAM suficiente para cargar los pesos EXL3 de 6.0 bpw más el contexto y la caché KV (no se proporciona una cifra exacta de VRAM en la información disponible).
- GPU recomendadas: no disponible de forma explícita; por el tamaño del checkpoint, se orienta a GPU de clase profesional (A100, H100) o consumer de gama alta con suficiente VRAM.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; el tamaño de 22,4 GB sugiere que podría requerir GPUs consumer de 24 GB o más, pero no se especifica.
- Opciones de despliegue: EXL3 cargado por exllamav3, por ejemplo mediante tabbyAPI. Los comandos de vLLM, SGLang y LightLLM de la sección Deployment del modelo base describen la versión BF16 original y no aplican a este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-6.8-Code2Video-EXL3 (esta ficha) | 11,19B en safetensors (base declara 27B) | 512K | Apache 2.0 | Hugging Face (EXL3, exllamav3) | Cuantización 6.0 bpw, sin capa MTP |
| sensenova/SenseNova-6.8-Code2Video (BF16) | 27B (según model card) | 512K | Apache 2.0 | Hugging Face | Modelo base original, desplegable con vLLM/SGLang/LightLLM |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Modelo del que se afina el base |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de parámetros: el checkpoint cuantizado declara 11,19B en safetensors mientras la model card del base indica 27B; conviene verificar la configuración antes de producción.
- Ausencia de capa MTP: el config fue modificado (`mtp_num_hidden_layers` de 1 a 0) porque no hay pesos MTP; esto puede afectar a optimizaciones que dependan de MTP.
- Compatibilidad de despliegue restringida: solo exllamav3/tabbyAPI; los comandos de vLLM, SGLang y LightLLM no aplican a este repositorio.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Enfoque en vídeo corto implementado en código; el propio autor lo describe como un primer paso, con planes de extender a edición, composición, animación y 3D.
- Riesgo de alucinación en el código generado: al producir código ejecutable que orquesta herramientas, los errores pueden propagarse al render final.
- No se han publicado benchmarks, por lo que el rendimiento cuantitativo no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las licencias de las herramientas externas que el modelo invoque.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/Hayabala/SenseNova-6.8-Code2Video-EXL3
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Repositorio GitHub (skill y prompts): https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Trayectorias de ejemplo: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video/blob/main/trajectories/all.openai.jsonl
- Skill de producción: https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video/tree/main/skills/code-video
- tabbyAPI (exllamav3): https://github.com/ExllamaV3/tabbyAPI
- Discord OpenSenseNova: https://discord.com/channels/1488006693395628032/1488015977932390520
