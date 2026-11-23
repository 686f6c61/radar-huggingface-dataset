# FusionCow/Sulphur-3

## Resumen

Sulphur 3 es un modelo de generación de vídeo derivado de MiniMax H3, desarrollado por FusionCow como un fine-tune sin censura del modelo base de MiniMaxAI. Se distribuye como un checkpoint completo en formato safetensors (`s3.safetensors`) que se ejecuta con la librería `minimax-h3` y el ecosistema ComfyUI, e incluye variantes adicionales como una versión sin el LoRA de RL (`s3_raw`), una variante Ref2VA no entrenada y un fichero corrector opcional. El repositorio ocupa 276,5 GB, lo que refleja el tamaño de los pesos en precisión completa del modelo base.

El modelo resuelve la demanda de generación de vídeo sin los filtros de seguridad del modelo original, un nicho recurrente en la comunidad de modelos abiertos. Su relevancia actual radica en que parte de MiniMax H3, un modelo de vídeo de referencia, y ofrece una alternativa desbloqueada manteniendo la compatibilidad con el pipeline estándar de H3, además de incluir opciones cuantizadas para reducir los requisitos de VRAM.

La información pública disponible es limitada: no se detallan la arquitectura interna, el número de parámetros, la longitud de contexto ni los idiomas soportados. La model card se centra en los ficheros distribuidos, el flujo de uso en ComfyUI y la licencia, sin publicar especificaciones técnicas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de MiniMax H3, modelo de generación de vídeo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | versiones cuantizadas incluidas en `quantized/` (esquemas concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors (`s3.safetensors`, `s3_raw.safetensors`, `s3_ref2va.safetensors`, `s3_raw_lora.safetensors`, `s3_corrector.safetensors`) |

## Arquitectura y entrenamiento

Sulphur 3 es un fine-tune del modelo MiniMax H3, un modelo de generación de vídeo. La model card no describe la arquitectura interna (tipo de transformer, mecanismo de atención, compresión temporal o arquitectura del autoencoder de vídeo), por lo que no es posible detallar sus componentes. El checkpoint principal `s3.safetensors` incorpora un LoRA de RL aplicado sobre el modelo base; la variante `s3_raw.safetensors` corresponde al modelo sin ese LoRA, y `s3_raw_lora.safetensors` expone ese mismo ajuste como LoRA independiente.

No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO más allá de la mención al "RL lora". Tampoco se detalla el proceso de eliminación de censura ni las técnicas de alineación aplicadas. El autor incluye un fichero corrector opcional (`s3_corrector.safetensors`) con nodos y workflow de ComfyUI (`S3_ComfyUI.zip`) que, según la model card, también funciona con otros modelos H3, lo que sugiere un mecanismo de post-procesado o corrección de la salida del modelo de vídeo.

## Capacidades

- Generación de vídeo a partir de prompts de texto, heredando el pipeline de MiniMax H3.
- Variante Ref2VA (`s3_ref2va.safetensors`) para generación condicionada por referencia, aunque según el autor no ha sido entrenada.
- Funcionamiento sin censura: el modelo no aplica los filtros de contenido del modelo base.
- Integración con ComfyUI mediante nodos y workflow proporcionados para el corrector opcional.
- Compatibilidad con el ecosistema de la librería `minimax-h3` y con otros checkpoints derivados (el autor recomienda los merges de TenStrip).
- Soporte de cuantización para reducir requisitos de VRAM (`quantized/`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Producción de vídeo creativo sin restricciones de contenido: el modelo permite generar clips a partir de prompts que el modelo base rechazaría, útil en proyectos artísticos o de ficción que requieren libertad expresiva.
- Prototipado rápido en ComfyUI: el workflow incluido en `S3_ComfyUI.zip` permite montar un pipeline de generación de vídeo con el corrector opcional sin desarrollo adicional.
- Investigación sobre alineación y censura: comparar `s3.safetensors` (con LoRA de RL) frente a `s3_raw.safetensors` permite estudiar el efecto del ajuste por refuerzo en el comportamiento del modelo.
- Fine-tuning posterior: `s3_raw_lora.safetensors` facilita aplicar el ajuste como LoRA sobre otros derivados de H3, útil para experimentación con merges.
- Despliegue en hardware limitado: las versiones de `quantized/` permiten ejecutar el modelo en GPUs con menos VRAM que las necesarias para los pesos completos.
- Generación condicionada por referencia: la variante Ref2VA, aunque no entrenada, sirve como base para experimentos de image-to-video o reference-to-video.
- Evaluación de modelos de vídeo abiertos: al estar bajo la licencia comunitaria de MiniMax H3, puede emplearse en estudios comparativos de calidad y sesgo en generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 276,5 GB, lo que da una idea del tamaño de los pesos en precisión completa; la VRAM necesaria para inferencia no está especificada.
- Las versiones de `quantized/` reducen los requisitos, pero no se detallan los niveles de cuantización ni la VRAM resultante.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; dependerá de la variante cuantizada utilizada.
- Despliegue: librería `minimax-h3` y ComfyUI (con nodos y workflow para el corrector). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sulphur 3 | MiniMax H3 | Fine-tune sin censura, generación de vídeo | minimax-h3-community-license | Hugging Face (FusionCow/Sulphur-3) |
| MiniMax H3 | — | Modelo base de generación de vídeo | minimax-h3-community-license | Hugging Face (MiniMaxAI/MiniMax-H3) |
| Merges de TenStrip | MiniMax H3 | Merges comunitarios que incluyen Sulphur | no disponible | Hugging Face (TenStrip) |

No se dispone de datos de parámetros, contexto ni rendimiento de estos modelos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido violento, sexual o otherwise sensible; no es adecuado para aplicaciones de producción dirigidas al público general sin moderación adicional.
- Riesgo de alucinación y artefactos visuales inherente a los modelos de generación de vídeo; no se han publicado evaluaciones de calidad.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de representación.
- Idiomas soportados no disponibles; el comportamiento multilingüe de los prompts es incierto.
- La licencia `minimax-h3-community-license` es una licencia "other" con términos específicos; es imprescindible revisar `LICENSE` antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de una licencia open source estándar.
- La variante Ref2VA no está entrenada según el autor, por lo que su uso en producción no está recomendado.
- El corrector es opcional y su efecto sobre la calidad no está cuantificado.
- El tamaño del repositorio (276,5 GB) y la falta de especificaciones de VRAM dificultan planificar el despliegue sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FusionCow/Sulphur-3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor en X: https://x.com/FusionCow11
- Discord del autor: https://discord.gg/C3d56f39Ah
- Merges recomendados por el autor (TenStrip): https://huggingface.co/TenStrip
