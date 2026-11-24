# divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text

## Resumen

Gemma 4 12B IT Abliterated 4-bit MLX (text-only) es una conversión del modelo `google/gemma-4-12B-it` realizada por el usuario `divinetribe`, que combina tres transformaciones: la eliminación del alineamiento de rechazo (abliteration) sobre el checkpoint instruct original, la cuantización a 4 bits en formato MLX para Apple Silicon y la eliminación de las torres multimodales (visión y audio) para dejar únicamente el modelo de lenguaje. El resultado es un checkpoint de 11.907.350.320 parámetros (aproximadamente 11,9 mil millones) que ocupa 11 GB en el repositorio y que, según el autor, se carga con `mlx-lm` sin necesidad de parchear la librería.

El problema que resuelve es eminentemente práctico: `google/gemma-4-12B-it` se distribuye con `model_type: gemma4_unified` (texto, visión y audio en un único checkpoint), mientras que la versión de `mlx-lm` publicada en PyPI (0.31.3) carece de loader para ese tipo y aborta con `ValueError: Model type gemma4_unified not supported`. Este repositorio elimina las torres multimodales, reetiqueta el modelo como `gemma4` y conserva los pesos cuantizados a 4 bits sin recuantizar, de modo que funciona con un `pip install mlx-lm` estándar en un Mac con Apple Silicon.

Es relevante para desarrolladores que quieren ejecutar un modelo de 12B en local con fines de generación de texto sin restricciones de contenido, sobre todo en equipos de 24-32 GB de memoria unificada. No obstante, conviene tener presente que la ventaja de compatibilidad es transitoria: el autor documenta que el soporte para `gemma4_unified` ya está fusionado en `mlx-lm` main (PR #1349) y llegará a PyPI, momento en el que la ventaja diferencial se reduce a la abliteración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), checkpoint derivado de `gemma4_unified` con las torres de visión y audio eliminadas; reetiquetado como `gemma4` |
| Parametros totales | 11.907.350.320 (11,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); el repositorio incluye únicamente esta cuantización |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX), 11,0 GB de repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Gemma 4, en su variante instruct (`gemma-4-12B-it`). El checkpoint original de Google es multimodal unificado (texto, visión y audio); esta conversión elimina los tensores de `vision_embedder`, `embed_vision`, `embed_audio` y similares, conservando exclusivamente los tensores `language_model.*`. La model card indica explícitamente que los pesos abliterados a 4 bits se preservan byte a byte y que no se ha recuantizado nada en el proceso.

Sobre el entrenamiento no se aportan datos en la información disponible: no se especifican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o una fase de post-entrenamiento concreta. La abliteración, que es la modificación más relevante respecto al modelo original, es una intervención post-hoc sobre los pesos orientada a eliminar la dirección de rechazo del modelo; la model card no detalla la metodología exacta empleada por `OpenYourMind` ni los datos de calibración usados. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con el modo instruct heredado de `gemma-4-12B-it`.
- Razonamiento y respuesta multi-turno, orientado a uso como asistente local.
- Comportamiento sin censura (abliterated): el modelo no aplica los rechazos típicos del alineamiento original, lo que permite generar contenido que el checkpoint base declinaría.
- Integración con servidores MLX nativos, incluido el servidor Anthropic-API de `claude-code-local`, que permite usarlo como backend de agentes de código en local.
- Capacidades multimodales: no disponibles en esta conversión (las torres de visión y audio se han eliminado deliberadamente).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito: no documentado.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se carga con `mlx_lm.load()` en un equipo Apple Silicon de 24-32 GB y sirve para conversaciones multi-turno sin conexión, sin enviar datos a la nube.
- Backend de agentes de código en local: integrado en el servidor MLX nativo de Anthropic API del proyecto `claude-code-local`, permite ejecutar Claude Code íntegramente en el dispositivo con un modelo de 12B cuantizado a 4 bits.
- Generación de texto sin filtros para investigación: útil para estudiar comportamiento de modelos abliterated, evaluar sesgos residuales o comparar respuestas frente al checkpoint alineado.
- Prototipado de aplicaciones de escritorio en macOS: el formato MLX y el tamaño de aproximadamente 7 GB de pesos en memoria lo hacen viable en portátiles con memoria unificada, sin GPU dedicada.
- Redacción y generación de contenido en inglés en entornos offline: adecuado para flujos de trabajo donde la latencia de red o la privacidad son críticos.
- Experimentación con cuantización MLX: sirve como referencia de cómo adaptar checkpoints multimodales a loaders de texto, útil para quien necesite replicar el proceso con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. Tampoco se aportan datos de latencia o throughput medidos, más allá de la indicación cualitativa de que el modelo "funciona cómodamente" en un Mac de 32 GB con aproximadamente 7 GB de pesos en 4 bits.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 7 GB para los pesos en 4 bits según la model card; el repositorio completo ocupa 11 GB en disco.
- Memoria recomendada: 24 GB de memoria unificada como mínimo según el autor; 32 GB para funcionar con holgura junto al contexto y el resto del sistema.
- GPU dedicadas: no aplica; el formato MLX está diseñado para Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra). No se documenta soporte para A100, H100 o RTX 4090.
- GPU de consumo: no aplica en el sentido habitual; el equivalente es un Mac con chip de la serie M.
- Opciones de despliegue: `mlx-lm` (carga directa con `load()` y `generate()`), servidor MLX nativo (`MLX_MODEL=...`) y el servidor Anthropic-API de `claude-code-local`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text` (este) | 11,9 B | no disponible | MLX safetensors 4-bit | gemma | Solo texto, abliterated, carga en `mlx-lm` 0.31.3 |
| `divinetribe/gemma-4-12B-it-abliterated-4bit-mlx` | 11,9 B (presumible) | no disponible | MLX safetensors 4-bit | gemma | Mismo modelo con torres multimodales; falla en `mlx-lm` 0.31.3 según la model card |
| `mlx-community` builds de Gemma 4 12B (4-bit/8-bit/bf16) | 11,9 B | no disponible | MLX safetensors | gemma | Alineados, multimodales; fallan en `mlx-lm` 0.31.3 con `gemma4_unified` |
| `divinetribe/gemma-4-31b-it-abliterated-4bit-mlx` | 31 B (presumible) | no disponible | MLX safetensors 4-bit | gemma | Versión mayor de la misma familia; requiere más memoria |

Los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo del modelo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inexacto sin advertencia. No es recomendable para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de 12B y potencialmente agravado por la pérdida de alineamiento; no se han publicado evaluaciones de fidelidad factual.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Contexto: la longitud de contexto no se especifica en la información disponible, por lo que no se puede garantizar el comportamiento en conversaciones largas.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones de atribución; la abliteración no exime de su cumplimiento.
- Compatibilidad transitoria: la ventaja de carga en `mlx-lm` 0.31.3 desaparecerá cuando se publique el PR #1349 en PyPI, momento en el que los builds estándar de `mlx-community` también cargarán.
- Plataforma: exclusivo para Apple Silicon; no hay pesos GGUF ni safetensors estándar para CUDA.
- Sin datos de benchmarks ni evaluaciones independientes: no se puede verificar la calidad del modelo frente a alternativas.
- El repositorio muestra 0 likes y 999 descargas en el momento de la consulta, lo que sugiere una validación comunitaria todavía limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx-text
- Modelo base abliterated: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Versión MLX con torres multimodales: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx
- Versión 31B de la misma familia: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- PR de mlx-lm que añade soporte `gemma4_unified`: https://github.com/ml-explore/mlx-lm/pull/1349
