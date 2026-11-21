# divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text

## Resumen

Gemma 4 12B IT Abliterated 4-bit MLX (text-only) es una conversión del modelo Gemma 4 12B de Google, publicada por el usuario divinetribe, orientada a la inferencia local en Apple Silicon mediante la librería MLX. Parte de `google/gemma-4-12B-it`, pasa por una versión abliterated (eliminación de la dirección de rechazo en el espacio de activaciones) publicada como `OpenYourMind/gemma-4-12B-it-abliterated-uncensored`, y se cuantiza a 4 bits para su uso en Mac.

El problema concreto que resuelve es de compatibilidad: Google distribuye el checkpoint de 12B con `model_type: gemma4_unified` (texto, visión y audio en un único checkpoint), mientras que `mlx-lm` en la versión publicada en PyPI (0.31.3) solo incorpora un cargador para `gemma4`. Cualquier build MLX estándar del 12B falla con `ValueError: Model type gemma4_unified not supported`. Esta conversión elimina las torres multimodales (`vision_embedder`, `embed_vision`, `embed_audio`) y reetiqueta el modelo como `gemma4`, de modo que carga directamente con `mlx_lm` sin parchear nada.

El resultado es un modelo de 11.907.350.320 parámetros (≈11,9B) en safetensors, con pesos de 4 bits y un tamaño de repositorio de 11,0 GB. Está pensado para Macs con Apple Silicon de 24 GB o más, con un enfoque text-only y en inglés. La licencia es la Gemma, con las restricciones de uso que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), checkpoint original multimodal `gemma4_unified` reducido a la torre de texto |
| Parametros totales | 11.907.350.320 (≈11,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); existen builds 4-bit, 8-bit y bf16 en `mlx-community` del modelo base |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (MLX), repositorio de 11,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Gemma 4, con 11,9B parámetros. El checkpoint original de Google, `google/gemma-4-12B-it`, se distribuye como `gemma4_unified` e integra torres de visión y audio junto al modelo de lenguaje. Esta conversión conserva únicamente los tensores `language_model.*` y descarta el resto, por lo que el modelo resultante es estrictamente text-only.

La cadena de transformación es: base `google/gemma-4-12B-it` (instruction-tuned) → abliteration publicada por OpenYourMind → cuantización a 4 bits en MLX por divinetribe → eliminación de torres multimodales y reetiquetado a `model_type: gemma4`. Según la model card, los pesos abliterated de 4 bits se preservan byte a byte, sin recuantizar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original, más allá de que se trata de una variante instruction-tuned.

## Capacidades

- Generación de texto conversacional en inglés, con modo instruction-tuned heredado de Gemma 4 12B IT.
- Razonamiento y respuesta multi-turno en formato chat.
- Ejecución local en Apple Silicon mediante `mlx_lm`, con API Python (`load`, `generate`) y soporte para servidores MLX.
- Comportamiento "uncensored" derivado de la abliteration: menor tendencia a rechazar peticiones, sin garantías de ausencia total de filtros.
- Integración como modelo local en el proyecto Claude Code Local, que expone una API compatible con Anthropic sobre MLX.
- Sin capacidades de visión ni audio: las torres multimodales han sido eliminadas del checkpoint.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.

## Casos de uso

- Asistente conversacional local en Mac: cargar el modelo con `mlx_lm` y mantener diálogos multi-turno en inglés sin conexión a internet, aprovechando que los pesos de 4 bits ocupan aproximadamente 7 GB y caben en un Mac de 24 GB.
- Agente de código en local con Claude Code Local: usar el modelo como backend de un servidor MLX compatible con la API de Anthropic para ejecutar tareas de agente sobre el sistema de ficheros en Apple Silicon.
- Prototipado de aplicaciones de texto en entornos sin GPU dedicada: emplear el modelo como sustituto local de APIs en fases de desarrollo, con la ventaja de que carga en la versión estándar de `mlx-lm` sin parches.
- Experimentación con modelos abliterated: comparar el comportamiento de rechazo frente al Gemma 4 12B IT original en tareas de evaluación de sesgos y alineación.
- Generación de texto en pipelines de CI o scripts de macOS: invocar el modelo desde Python con `mlx_lm.generate` para tareas de resumen, reescritura o clasificación textual en inglés.
- Despliegue en estaciones de trabajo Mac con 32 GB de RAM unificada: servir el modelo mediante un servidor MLX para varios clientes ligeros en una red local, sin necesidad de GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: aproximadamente 7 GB de pesos en 4 bits según la model card; el repositorio completo ocupa 11,0 GB.
- Hardware recomendado: Apple Silicon con al menos 24 GB de memoria unificada; la model card indica que funciona cómodamente en un Mac de 32 GB.
- GPU NVIDIA: no aplicable de forma nativa, ya que los pesos están en formato MLX. Para CUDA sería necesario convertir a otro formato (GGUF, safetensors estándar) o usar el modelo base.
- Cabe en GPU consumer: sí, en el ecosistema Apple Silicon (M-series con 24 GB o más). No hay datos para GPUs consumer NVIDIA en formato MLX.
- Opciones de despliegue: `mlx-lm` (versión PyPI 0.31.3 o superior), servidores MLX con la variable `MLX_MODEL`, y el entorno Claude Code Local.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text | 11,9B | no disponible | No (text-only) | gemma | safetensors MLX 4-bit | Carga en `mlx-lm` 0.31.3 sin parches |
| mlx-community (builds 4-bit/8-bit/bf16 de Gemma 4 12B) | 11,9B | no disponible | Sí (unified) | gemma | safetensors MLX | Fallan en `mlx-lm` 0.31.3 con `gemma4_unified not supported` |
| divinetribe/gemma-4-31b-it-abliterated-4bit-mlx | ≈31B | no disponible | No | gemma | safetensors MLX 4-bit | Versión mayor del mismo autor, carga en `mlx_lm` |
| google/gemma-4-12B-it | 11,9B | no disponible | Sí (texto, visión, audio) | gemma | safetensors | Modelo base original, instruction-tuned |

## Limitaciones y advertencias

- La abliteration reduce los rechazos, pero no elimina los sesgos del modelo base ni garantiza un comportamiento seguro; el contenido generado puede ser inapropiado, ofensivo o incorrecto.
- Riesgo de alucinación inherente a un modelo de 12B: no debe usarse como fuente de verdad sin verificación.
- El modelo solo soporta inglés según los metadatos; el rendimiento en castellano u otros idiomas no está garantizado.
- La longitud de contexto no está documentada en la información disponible.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de un despliegue en producción.
- Al ser text-only, no puede procesar imágenes ni audio pese a provenir de un checkpoint multimodal.
- La ventaja de compatibilidad con `mlx-lm` es temporal: cuando se publique la corrección de mlx-lm (PR #1349, ya en `main`), los builds estándar de `mlx-community` cargarán igualmente y la única diferencia será la abliteration.
- El soporte de tool calling no está documentado; conviene validarlo empíricamente antes de usarlo en agentes.
- Los pesos en formato MLX no son directamente utilizables en GPUs NVIDIA ni en servidores CUDA sin conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text
- Modelo base abliterated: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Versión 31B del mismo autor: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- PR de mlx-lm que corrige el cargador: https://github.com/ml-explore/mlx-lm/pull/1349
