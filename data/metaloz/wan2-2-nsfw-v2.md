# metaloz/Wan2.2-nsfw-v2

## Resumen

El modelo `metaloz/Wan2.2-nsfw-v2` es una adaptación no oficial de la familia Wan2.2, un conjunto de modelos de generación de vídeo de código abierto desarrollado originalmente por el equipo Wan-Video. La variante publicada por el usuario `metaloz` está etiquetada como `not-for-all-audiences` (no apta para todos los públicos), lo que sugiere que ha sido modificada o ajustada para generar contenido explícito o para adultos, aunque no se proporciona ninguna documentación adicional en la model card.

La información disponible es extremadamente limitada: el repositorio ocupa 20 GB, la licencia declarada es Apache-2.0 y no se especifican ni arquitectura, ni parámetros, ni contexto, ni idiomas. Dado que no hay descripción técnica del autor, toda característica que se mencione sobre este modelo debe considerarse incierta y basada únicamente en el conocimiento general de la familia Wan2.2, no en datos verificados de esta versión concreta. Su relevancia actual radica en que Wan2.2 es uno de los modelos de vídeo open source más avanzados, con soporte para 720p y 24 fps, pero esta variante concreta no aporta información que permita evaluar su rendimiento o sus capacidades específicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se desconoce si mantiene la arquitectura MoE de Wan2.2) |
| Parametros totales | no disponible (el tamaño del repo es 20 GB, pero no se indica el número de parámetros) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

No se dispone de información específica sobre la arquitectura, los datos de entrenamiento o las técnicas de ajuste de `metaloz/Wan2.2-nsfw-v2`. La model card no incluye ninguna descripción técnica más allá de la licencia. Por contexto, la familia Wan2.2 original (desarrollada por Wan-Video) utiliza una arquitectura de Mixture-of-Experts (MoE) con un VAE de alta compresión (16×16×4) que permite generar vídeo a 720p y 24 fps. Sin embargo, no hay evidencia de que esta variante nsfw mantenga esas características, ya que podría ser un fine-tune, una fusión de pesos o incluso una versión con modificaciones no documentadas. Tampoco se conoce el proceso de entrenamiento (número de tokens, dataset, uso de RLHF o DPO). Ante la ausencia de datos, cualquier afirmación sobre la arquitectura de este modelo concreto sería especulativa.

## Capacidades

No se han documentado capacidades específicas para `metaloz/Wan2.2-nsfw-v2`. Basándose únicamente en la etiqueta `not-for-all-audiences`, se puede inferir que el modelo está orientado a la generación de contenido explícito, pero no hay confirmación de que mantenga las capacidades generales de Wan2.2. Las capacidades que se enumeran a continuación corresponden a la familia Wan2.2 original y no deben atribuirse a esta variante sin verificación:

- Generación de vídeo a partir de texto (text-to-video) y de imagen a vídeo (image-to-video) a 720p y 24 fps.
- Control estético de calidad cinematográfica y generación de movimiento profesional.
- Compresión de vídeo eficiente mediante el VAE Wan2.2 con ratio 16×16×4.
- Ejecución en GPU de consumo como la RTX 4090 (según el repositorio oficial de Wan-Video).

Para este modelo concreto, no se dispone de información sobre tool calling, agentes, razonamiento multilingüe ni otras capacidades.

## Casos de uso

Dada la falta de documentación, los casos de uso son hipotéticos y dependen de la naturaleza del contenido nsfw. No es posible proporcionar aplicaciones concretas y realistas sin conocer las capacidades reales del modelo. En cualquier caso, se podrían plantear los siguientes escenarios, siempre con la advertencia de que no están confirmados:

- Generación de vídeo para contenido adulto: el modelo podría utilizarse para crear material audiovisual explícito, aunque esto plantea serias cuestiones éticas y legales.
- Investigación sobre generación de vídeo con contenido sensible: podría servir como caso de estudio para analizar sesgos y riesgos en modelos ajustados para dominios específicos.
- Pruebas de filtrado y moderación: los desarrolladores podrían emplear este modelo para evaluar sistemas de detección de contenido inapropiado.

No obstante, al no existir información verificada sobre su funcionamiento, estos casos son meramente especulativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe ninguna métrica objetiva sobre calidad de vídeo, fidelidad de movimiento, coherencia temporal ni comparaciones con otros modelos.

## Requisitos de hardware

No se dispone de datos específicos para `metaloz/Wan2.2-nsfw-v2`. Si se asume que mantiene la arquitectura de Wan2.2 (lo cual no está confirmado), el modelo original de 5B parámetros puede ejecutarse en una GPU de consumo como la RTX 4090, según el repositorio oficial. Sin embargo, para esta variante:

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: incierta.
- Opciones de despliegue: no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que se trata de un modelo de vídeo, probablemente requeriría el entorno de inferencia específico de Wan2.2 (Diffusers o el repositorio oficial).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible realizar una comparativa rigurosa al carecer de datos verificados de este modelo. Como referencia, la familia Wan2.2 compite con otros modelos de vídeo open source como:

| Modelo | Parámetros | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2 (original) | 5B (MoE) | 720p, 24fps | Apache-2.0 | GitHub, HuggingFace |
| Wan2.1 | 1.3B / 14B | 480p / 720p | Apache-2.0 | GitHub, HuggingFace |
| CogVideoX | 5B | 720p | Apache-2.0 | HuggingFace |

Pero no se puede afirmar que `metaloz/Wan2.2-nsfw-v2` pertenezca a esta categoría técnica sin confirmación.

## Limitaciones y advertencias

- No existe documentación técnica oficial del autor: la model card está vacía, lo que impide evaluar el modelo de forma fiable.
- El contenido nsfw conlleva riesgos éticos y legales: su uso puede violar políticas de plataformas, leyes de distribución de material adulto y normativas sobre consentimiento.
- No se conocen sesgos ni riesgos de alucinación específicos, pero los modelos de vídeo suelen presentar artefactos visuales y falta de coherencia en secuencias largas.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de información sobre los datos de entrenamiento y el origen de los pesos puede generar problemas de atribución o de cumplimiento si se utilizan materiales con derechos de autor.
- El tamaño del repositorio (20 GB) sugiere que el modelo es pesado, pero no se indica el formato de pesos ni la compatibilidad con herramientas estándar.
- No se ha verificado que este modelo sea una versión oficial de Wan2.2; podría tratarse de un fine-tune no autorizado o de una fusión de pesos con calidad desconocida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/metaloz/Wan2.2-nsfw-v2
- Repositorio oficial de Wan2.2 en GitHub: https://github.com/Wan-Video/Wan2.2
- Página de Wan2.2 AI (no oficial): https://wan22.ai/home
- Otro repositorio de referencia de Wan2.2: https://github.com/Madxthree/wan2.2
- Modelos compatibles con la librería wan2.2 en HuggingFace: https://huggingface.co/models?library=wan2.2
