# divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text

## Resumen

`divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text` es una conversión a 4 bits en formato MLX del modelo Gemma 4 12B IT en su variante "abliterated" (es decir, con el rechazo de contenido alineado suprimido mediante la técnica de abliteration, que elimina la dirección de activación asociada a la negativa a responder). El modelo base es `google/gemma-4-12B-it`, y la abliteración original proviene de `OpenYourMind/gemma-4-12B-it-abliterated-uncensored`. El autor de la conversión es el usuario de Hugging Face `divinetribe`.

El propósito principal de esta ficha no es tanto la abliteración como la compatibilidad: Google publica Gemma 4 12B con `model_type: gemma4_unified` (texto, visión y audio en un único checkpoint), y la versión de `mlx-lm` disponible en PyPI (0.31.3) carece de cargador para ese tipo de modelo. Esta conversión elimina las torres multimodales (`vision_embedder`, `embed_vision`, `embed_audio`) y reetiqueta el modelo como `gemma4`, preservando los pesos 4-bit sin recuantizar, de modo que carga directamente con `mlx_lm` sin parches.

Es relevante ahora porque permite ejecutar un modelo de 12B parámetros en Macs con Apple Silicon mediante MLX, con un peso aproximado de 7 GB en 4 bits, y porque ofrece una alternativa sin filtros de rechazo para casos de uso que requieren respuestas sin censura. La contrapartida es que se trata de un modelo solo texto, en inglés, con licencia Gemma y con las implicaciones éticas que conlleva la abliteración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), conversión MLX; torres multimodales eliminadas |
| Parámetros totales | 11.907.350.320 (≈11,9B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (MLX); repo de 11,0 GB, pesos ≈7 GB según la model card |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma (términos de licencia de Google Gemma) |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 12B IT, un transformer denso de aproximadamente 11,9 mil millones de parámetros. La versión original de Google se distribuye como `gemma4_unified`, un checkpoint que integra torres de visión y audio junto con el modelo de lenguaje. Esta conversión concreta elimina esas torres (`vision_embedder`, `embed_vision`, `embed_audio`) y conserva únicamente los tensores `language_model.*`, reetiquetando el `model_type` como `gemma4` para que el cargador de `mlx_lm` lo acepte.

La cuantización a 4 bits y la abliteración se heredan del modelo intermedio `divinetribe/gemma-4-12B-it-abliterated-4bit-mlx`; según la model card, los pesos 4-bit abliterated se preservan byte a byte y no se recuantizan en esta conversión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original, más allá de que Gemma 4 IT es una variante instruida. La innovación técnica destacable es la eliminación de las torres multimodales para compatibilidad con `mlx_lm` 0.31.3; el autor señala que la corrección upstream (PR #1349 de mlx-lm, fusionada el 2026-06-05) aún no se ha publicado en PyPI.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y respuesta a instrucciones (variante IT, instruida).
- Generación de código y matemáticas (capacidad esperable de un modelo Gemma 4 IT, aunque no se documenta explícitamente en la model card).
- Respuestas sin rechazo por contenido (abliterated): el modelo no aplica la negativa alineada típica de los modelos instruidos.
- Sin capacidades de visión ni audio: las torres multimodales han sido eliminadas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor lo incluye en su proyecto Claude Code Local como uno de los modelos "fighters", pero no se detallan capacidades agénticas específicas.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: cargar el modelo con `mlx_lm` en un Mac de 24-32 GB de RAM unificada permite ejecutar un 12B en 4 bits (≈7 GB de pesos) sin GPU dedicada, usando `from mlx_lm import load, generate`.
- Servidor MLX para aplicaciones de escritorio: apuntar un servidor MLX al modelo mediante la variable `MLX_MODEL=divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text` para exponer una API de generación de texto en local.
- Agente de código local: integrarlo en el proyecto Claude Code Local del autor, que ejecuta Claude Code íntegramente en el dispositivo a través de un servidor MLX nativo con API de Anthropic; el modelo actúa como uno de los modelos evaluados en el leaderboard Agent-12.
- Prototipado sin censura: escenarios de investigación o creativos donde se requiere que el modelo no rechace peticiones por contenido sensible, aprovechando la abliteración.
- Evaluación de modelos abliterated: comparar el comportamiento del 12B abliterated frente a la versión estándar de Gemma 4 12B IT en tareas de alineación y seguridad.
- Desarrollo offline en entornos sin conectividad: al ejecutarse completamente en local, sirve para pipelines de generación de texto en máquinas aisladas.
- Sustituto de texto de la versión multimodal: cuando solo se necesita el componente de lenguaje de Gemma 4 12B y se quiere evitar la sobrecarga de las torres de visión y audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ≈7 GB de pesos en 4 bits según la model card; el repo ocupa 11,0 GB en disco.
- Memoria unificada recomendada: 24 GB de Mac (mínimo indicado por el autor) y 32 GB para funcionar "cómodamente".
- GPU recomendadas: no aplica GPU dedicada; el formato MLX está orientado a Apple Silicon (M-series). No se documenta soporte para A100, H100 ni RTX 4090 en esta conversión.
- Cabe en consumer GPU: no es el objetivo; está diseñado para Macs con Apple Silicon. Para GPUs NVIDIA habría que recurrir a otras conversiones (GGUF, etc.), no disponibles en esta información.
- Opciones de despliegue: `mlx-lm` (carga directa con `load` y `generate`), servidor MLX mediante la variable `MLX_MODEL`, y el servidor MLX nativo del proyecto Claude Code Local.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text | ≈11,9B | no disponible | MLX 4-bit (solo texto) | Gemma | Hugging Face, 1107 descargas |
| divinetribe/gemma-4-12B-it-abliterated-4bit-mlx | ≈11,9B (estimado) | no disponible | MLX 4-bit (con torres multimodales) | Gemma | Hugging Face; falla en mlx-lm 0.31.3 por `gemma4_unified` |
| divinetribe/gemma-4-31b-it-abliterated-4bit-mlx | 31B (según nombre) | no disponible | MLX 4-bit | Gemma | Hugging Face; carga en mlx_lm |
| google/gemma-4-12B-it | ≈11,9B | no disponible | safetensors (unificado texto+visión+audio) | Gemma | Hugging Face (modelo original) |

La comparativa se limita a las variantes del mismo linaje Gemma 4 documentadas en la información disponible; no se dispone de datos de rendimiento para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La abliteración suprime el rechazo alineado: el modelo puede generar contenido sensible, ofensivo o inseguro sin filtros, lo que exige controles adicionales en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Solo inglés: los metadatos indican `language: en`, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Solo texto: las torres de visión y audio han sido eliminadas; no puede procesar imágenes ni audio.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que incluyen restricciones de uso aceptable; conviene revisarlos antes de desplegar.
- Compatibilidad frágil: depende de `mlx-lm` 0.31.3 y del reetiquetado manual; cuando se publique la corrección upstream (PR #1349), las builds estándar de `mlx-community` cargarán también y la ventaja de este repo se reduce a la abliteración.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones largas sin verificar el límite real.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo original.
- Proyecto de autor individual: el mantenimiento y soporte dependen de `divinetribe`/`nicedreamzapp`, no de Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text
- Modelo intermedio: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx
- Modelo base abliterated: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Variante 31B del mismo autor: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
- Colección "Abliterated MLX for Apple Silicon": https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- PR de mlx-lm que corrige el cargador: https://github.com/ml-explore/mlx-lm/pull/1349
- Software del autor: https://nicedreamzwholesale.com/software/
- Patrocinio: https://github.com/sponsors/nicedreamzapp
