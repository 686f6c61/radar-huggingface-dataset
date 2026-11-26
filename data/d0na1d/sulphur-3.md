# D0na1d/Sulphur-3

## Resumen

Sulphur 3 es un modelo de generación de vídeo presentado como versión sin censura (uncensored) y derivado mediante fine-tuning de MiniMax H3, el modelo de vídeo de MiniMaxAI. Lo publica el usuario D0na1d en Hugging Face y su propósito declarado es eliminar los filtros de contenido del modelo base para permitir la generación de vídeo sin las restricciones habituales de seguridad. Es relevante en el ecosistema de modelos abiertos de vídeo porque ejemplifica la práctica del fine-tuning de difusión sobre checkpoints comunitarios y la distribución de variantes cuantizadas para VRAM reducida.

El repositorio ocupa 276,5 GB y contiene el checkpoint principal `s3.safetensors`, una variante sin el LoRA de RL (`s3_raw.safetensors`), una variante Ref2VA no entrenada (`s3_ref2va.safetensors`), un LoRA (`s3_raw_lora.safetensors`), un corrector opcional (`s3_corrector.safetensors`) y un paquete de nodos y workflow para ComfyUI (`S3_ComfyUI.zip`). La model card indica que basta con descargar `s3.safetensors` y ejecutarlo como cualquier modelo MiniMax H3, y que el resto de archivos del repositorio son opcionales.

No se dispone de información sobre la arquitectura interna concreta, el número de parámetros, la longitud de contexto o los datos de entrenamiento empleados en el fine-tuning. La información pública se limita a la model card del autor y a los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de vídeo derivado de MiniMax H3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | variantes cuantizadas incluidas en `quantized/` (opciones de VRAM reducida); tipos concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (licencia comunitaria de MiniMax H3) |
| Formato de pesos | safetensors (checkpoint principal y variantes), más LoRA en safetensors |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Librería | minimax-h3 |
| Tamaño del repositorio | 276,5 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es un fine-tuning del modelo de generación de vídeo MiniMax H3, que el autor describe como derivado del mismo y que se distribuye con la librería `minimax-h3`. La model card menciona la existencia de un LoRA de RL presente en el checkpoint principal `s3.safetensors` y ausente en `s3_raw.safetensors`, lo que sugiere que el ajuste final incluyó una etapa de reinforcement learning aplicada mediante LoRA sobre el modelo ajustado.

También se incluye un componente denominado "corrector" (`s3_corrector.safetensors`), opcional, que funciona con nodos y workflow específicos de ComfyUI y que, según el autor, es compatible con otros modelos H3. No se especifican el número de tokens, la composición del dataset de entrenamiento, ni si hubo etapas de RLHF o DPO más allá de la mención al LoRA de RL. La variante `s3_ref2va.safetensors` se describe como Ref2VA y el autor indica que no está entrenada.

## Capacidades

- Generación de vídeo a partir de indicaciones de texto, heredando las capacidades del modelo base MiniMax H3.
- Generación sin censura: el autor la presenta explícitamente como una versión uncensored, orientada a eliminar los filtros de contenido del modelo original.
- Variante Ref2VA incluida en el repositorio (no entrenada según el autor).
- Componente corrector opcional integrable en ComfyUI mediante nodos y workflow proporcionados.
- Compatibilidad con el ecosistema de ejecución de MiniMax H3: el checkpoint se ejecuta como cualquier modelo H3.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe.

## Casos de uso

- Generación de vídeo creativo sin restricciones de contenido: el modelo permite producir clips a partir de descripciones textuales sin los filtros del modelo base, lo que resulta adecuado para proyectos artísticos o de ficción que abordan temáticas que los modelos censurados rechazan.
- Investigación sobre seguridad y alineación en modelos de vídeo: al ser una variante sin censura de un modelo conocido, sirve para estudiar el comportamiento de los filtros y las técnicas de fine-tuning que los eliminan, comparando `s3.safetensors` con `s3_raw.safetensors`.
- Experimentación con el corrector en ComfyUI: el paquete `S3_ComfyUI.zip` y `s3_corrector.safetensors` permiten probar flujos de post-procesado o corrección sobre las salidas del modelo dentro de ComfyUI, y el corrector es reutilizable con otros modelos H3.
- Prototipado de pipelines de vídeo generativo en local: las variantes cuantizadas de `quantized/` permiten desplegar el modelo en entornos con VRAM limitada para pruebas de concepto.
- Fine-tuning posterior y merges comunitarios: la disponibilidad del LoRA (`s3_raw_lora.safetensors`) y de la variante sin RL facilita que otros desarrolladores construyan merges o ajustes propios, como sugiere el autor al recomendar los merges de Tenstrip.
- Evaluación comparativa de checkpoints derivados: la estructura del repositorio (raw, con RL, Ref2VA, LoRA y corrector) permite aislar el efecto de cada componente en la calidad y el estilo de los vídeos generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio incluye variantes cuantizadas en `quantized/` pensadas para "lower vram", pero no se especifican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; la existencia de cuantizaciones sugiere que se busca ampliar el rango de hardware, pero no se detalla en qué modelos cabe.
- Opciones de despliegue: ejecución como modelo MiniMax H3 con la librería `minimax-h3`; integración con ComfyUI mediante los nodos incluidos para el corrector. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Tamaño en disco: el repositorio completo ocupa 276,5 GB, por lo que conviene descargar solo los archivos necesarios (`s3.safetensors` o las variantes cuantizadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sulphur 3 (D0na1d) | no disponible | no disponible | minimax-h3-community-license | Hugging Face, 0 descargas | Fine-tuning uncensored de MiniMax H3 |
| MiniMax H3 (MiniMaxAI) | no disponible | no disponible | minimax-h3-community-license | Hugging Face | Modelo base original, con filtros de contenido |
| Merges de Tenstrip | no disponible | no disponible | no disponible | Hugging Face (TenStrip) | Checkpoints comunitarios que incorporan Sulphur, recomendados por el autor |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo sin censura: la ausencia de filtros de contenido implica riesgo de generar material inapropiado, ofensivo o ilegal; no es apto para aplicaciones de producción dirigidas al público general sin moderación adicional.
- Licencia: se distribuye bajo la MiniMax H3 Community License, con restricciones que deben revisarse en el archivo `LICENSE` antes de cualquier uso comercial; el uso comercial no está garantizado.
- Riesgo de alucinación y artefactos: no hay datos publicados sobre la fidelidad de los vídeos generados ni sobre su calidad frente al modelo base.
- Idiomas: no se documenta el soporte multilingüe de las indicaciones de texto.
- Variante Ref2VA no entrenada: `s3_ref2va.safetensors` no debe asumirse funcional para su propósito nominal.
- Componentes opcionales: el corrector y los nodos de ComfyUI son opcionales y su comportamiento no está documentado en detalle; los archivos en `experimental/` son de fiabilidad no confirmada.
- Trazabilidad limitada: el autor no publica detalles de entrenamiento, dataset ni metodología de evaluación, y el repositorio no registra descargas ni interacciones, lo que dificulta validar su calidad.
- Requisitos de hardware elevados: el tamaño del repositorio (276,5 GB) y la ausencia de cifras de VRAM dificultan planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/D0na1d/Sulphur-3
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor en X: https://x.com/FusionCow11
- Discord del autor: https://discord.gg/C3d56f39Ah
- Merges de Tenstrip: https://huggingface.co/TenStrip
