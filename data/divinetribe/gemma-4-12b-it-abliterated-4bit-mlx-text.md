# divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text

## Resumen

Gemma 4 12B IT abliterated 4-bit MLX text-only es una compilación del modelo Gemma 4 12B instruct de Google, publicada por el usuario divinetribe, orientada exclusivamente a inferencia local en Apple Silicon mediante la librería MLX. Se trata de una versión "abliterated" (es decir, con las direcciones de rechazo eliminadas del espacio de activaciones) del checkpoint original, cuantizada a 4 bits y despojada de sus torres de visión y audio para que pueda cargarse con la versión estándar de `mlx-lm` disponible en PyPI.

El problema concreto que resuelve es de compatibilidad: Google distribuye `google/gemma-4-12B-it` con `model_type: gemma4_unified`, un formato multimodal que la versión publicada de `mlx-lm` (0.31.3) no reconoce, provocando el error `ValueError: Model type gemma4_unified not supported`. Este repositorio elimina los tensores de visión y audio, reetiqueta el modelo como `gemma4` y conserva los pesos cuantizados byte a byte, de modo que carga sin parches en un Mac con 24-32 GB de memoria unificada.

El modelo tiene 11.907.350.320 parámetros totales (aproximadamente 11,9 mil millones), un tamaño de repositorio de 11,0 GB y licencia Gemma. Es relevante para desarrolladores que quieran ejecutar un modelo conversacional de 12B sin censura, totalmente en local, sobre hardware Apple, integrable en servidores compatibles con la API de Anthropic.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, torre de texto únicamente; torres de visión y audio eliminadas) |
| Parámetros totales | 11.907.350.320 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma |
| Formato de pesos | safetensors (MLX), repositorio de 11,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Gemma 4, en su variante instruct (IT). El checkpoint original de Google es multimodal (`gemma4_unified`), con torres de visión y audio integradas junto al modelo de lenguaje. Esta compilación conserva exclusivamente los tensores bajo el prefijo `language_model.*`, elimina los módulos `vision_embedder`, `embed_vision`, `embed_audio` y similares, y reetiqueta el tipo de modelo como `gemma4` para que el cargador de `mlx-lm` lo acepte.

La cuantización a 4 bits y el proceso de abliteration provienen del checkpoint intermedio `OpenYourMind/gemma-4-12B-it-abliterated-uncensored`, y según la model card los pesos cuantizados se preservan byte a byte, sin recuantizar. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable es de empaquetado e interoperabilidad: hacer que un checkpoint multimodal de 12B cargue en `mlx-lm` sin necesidad de parchear la librería, un problema que en `mlx-lm` `main` se resolvió con el PR #1349 (fusionado el 2026-06-05) pero que aún no había llegado a PyPI en el momento de publicación.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y respuesta a instrucciones en formato instruct.
- Generación de código y tareas de escritura técnica (capacidad heredada del modelo base Gemma 4 12B IT).
- Modo "uncensored": la abliteration elimina las direcciones de rechazo, por lo que el modelo responde a peticiones que el checkpoint original declinaría.
- Inferencia totalmente local y on-device en Apple Silicon mediante MLX.
- Integración con servidores MLX compatibles con la API de Anthropic (proyecto Claude Code Local).
- Sin capacidades multimodales: las torres de visión y audio han sido eliminadas deliberadamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no documentado explícitamente; el modelo se usa como "fighter" en el leaderboard de agentes Agent-12 del autor, pero no se detallan capacidades de agencia nativas.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en el servidor MLX-native de Claude Code Local para ejecutar tareas de programación completamente en el dispositivo, sin enviar código a la nube, aprovechando sus 12B parámetros y su ventana de contexto (no especificada) para mantener el estado de una sesión de edición.
- Chat conversacional sin filtros en un Mac: para investigadores que estudian el comportamiento de modelos abliterated, permite comparar respuestas del checkpoint original frente a la versión sin direcciones de rechazo en el mismo hardware.
- Prototipado de agentes locales: al cargarse con `mlx_lm` estándar, se puede usar como backend en pipelines de agentes que necesiten un modelo de 12B que quepa en 24 GB de memoria unificada, con latencia de inferencia local.
- Evaluación de cuantización 4-bit en Apple Silicon: sirve como referencia para medir la degradación de calidad de un modelo de 12B cuantizado a 4 bits frente al bf16 en tareas de razonamiento y generación.
- Generación de texto creativo y divulgativo en inglés: adecuado para redacción de borradores, resúmenes y reescritura en un entorno de escritorio, sin coste de API y con privacidad total de los datos.
- Despliegue en entornos sin conectividad: al ejecutarse on-device, es utilizable en escenarios de campo o con requisitos de confidencialidad donde no se permite llamar a servicios externos.
- Benchmarking de modelos locales: el autor lo incluye en el leaderboard Agent-12, por lo que puede emplearse para comparar el rendimiento de distintos modelos abliterated en tareas de agente juzgadas por el sistema de ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 7 GB para los pesos en 4 bits según la model card; el repositorio completo ocupa 11,0 GB.
- Hardware recomendado: Apple Silicon con 24 GB de memoria unificada como mínimo; el autor indica que funciona cómodamente en un Mac de 32 GB.
- GPU NVIDIA: no aplicable; el formato es MLX y está pensado para Apple Silicon. No se documenta soporte para CUDA.
- ¿Cabe en GPU de consumo? No en el sentido tradicional (RTX 4090, etc.), ya que el modelo está empaquetado para MLX; en Apple Silicon cabe en MacBook con 24 GB o más.
- Opciones de despliegue: `mlx-lm` (carga directa con `from mlx_lm import load, generate`), servidores MLX mediante la variable `MLX_MODEL`, y el servidor MLX-native de Claude Code Local compatible con la API de Anthropic.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text | 11,9B | No disponible | 4-bit MLX | Gemma | Hugging Face, MLX |
| divinetribe/gemma-4-31b-it-abliterated-4bit-mlx | No disponible | No disponible | 4-bit MLX | Gemma | Hugging Face, MLX |
| mlx-community (builds 4-bit/8-bit/bf16 de Gemma 4 12B) | ~12B | No disponible | 4-bit, 8-bit, bf16 | Gemma | Hugging Face, MLX (fallan en mlx-lm 0.31.3 por `gemma4_unified`) |
| google/gemma-4-12B-it (original) | ~12B | No disponible | bf16 y otras | Gemma | Hugging Face (multimodal, `gemma4_unified`) |

La diferencia clave frente a los builds de `mlx-community` es la compatibilidad con `mlx-lm` 0.31.3 y la abliteration; frente al modelo original de Google, la ausencia de torres multimodales y la cuantización 4-bit.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inexacto; no es apta para despliegues públicos sin moderación adicional.
- Riesgo de alucinación inherente a un modelo de 12B; la cuantización a 4 bits puede agravar la degradación en tareas de razonamiento complejo.
- Solo soporta inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia Gemma: sujeta a los términos de uso de Google, con posibles restricciones para uso comercial; conviene revisar las condiciones vigentes antes de desplegar en producción.
- Al haberse eliminado las torres de visión y audio, el modelo no puede procesar imágenes ni audio aunque el checkpoint base sí lo permita.
- Depende de `mlx-lm` y de Apple Silicon; no hay soporte documentado para CUDA, ROCm ni CPU x86.
- La ventaja de compatibilidad con `mlx-lm` es temporal: cuando el PR #1349 llegue a PyPI, los builds estándar de `mlx-community` cargarán sin parches y la única diferencia será la abliteration.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text
- Modelo base intermedio: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Modelo 31B del mismo autor: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
- Colección "Abliterated MLX for Apple Silicon": https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- PR de mlx-lm que resuelve el soporte de `gemma4_unified`: https://github.com/ml-explore/mlx-lm/pull/1349
