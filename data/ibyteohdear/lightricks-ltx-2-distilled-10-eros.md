# ibyteohdear/Lightricks-LTX-2-DISTILLED-10-Eros

## Resumen

El modelo `ibyteohdear/Lightricks-LTX-2-DISTILLED-10-Eros` es un fine-tune no oficial del modelo LTX-2.3 de Lightricks, desarrollado por el usuario ibyteohdear. Se trata de una adaptación del sistema de generación de vídeo y audio de Lightricks, orientada específicamente a la generación de contenido explícito (NSFW) con mayor control sobre el movimiento y la composición. El modelo base LTX-2.3 es un modelo de difusión basado en transformer (DiT) que genera vídeo y audio sincronizados de forma conjunta, con pesos abiertos y ejecución local.

Este repositorio contiene múltiples versiones del fine-tune (v1.2, v1.3, v1.4) que se han ido refinando para mejorar la adherencia a prompts explícitos y reducir problemas como la deriva anatómica o la aparición de subtítulos no deseados. El modelo se distribuye como un conjunto de pesos en formato safetensors (archivo principal de ~2,3 TB, lo que sugiere una escala de 22B parámetros, aunque no se confirma explícitamente). Su relevancia radica en que demuestra la capacidad de adaptar modelos de vídeo de código abierto a dominios específicos, aunque su uso principal es claramente para contenido adulto, lo que plantea consideraciones éticas y legales.

La información técnica detallada es escasa: la model card no especifica arquitectura interna, datos de entrenamiento, ni benchmarks. La mayor parte de las especificaciones se infieren del modelo base LTX-2.3, que sí está documentado en el paper correspondiente. Por tanto, esta ficha distingue claramente entre lo que se sabe del modelo base y lo que se desconoce del fine-tune concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para generación conjunta de audio y vídeo (basado en LTX-2.3) |
| Parametros totales | no disponible (el modelo base LTX-2.3 tiene 22B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta secuencias de vídeo de hasta 257 frames a 24 FPS) |
| Tipos de cuantizacion | no disponible (se distribuye en bf16 según el modelo base) |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt (según metadatos de HuggingFace) |
| Licencia | ltx-2-community-license-agreement (licencia personalizada de Lightricks) |
| Formato de pesos | safetensors (archivo principal: LTX2.5_DISTILLED_BAKED_LTX_10Eros_v15-2.3_r.safetensors) |

## Arquitectura y entrenamiento

El modelo base LTX-2.3 es un modelo de difusión basado en transformer (DiT) que procesa conjuntamente señales de vídeo y audio. Según el paper LTX-2: Efficient Joint Audio-Visual Foundation Model (arXiv:2601.03233), el modelo emplea una arquitectura unificada que comparte pesos entre las modalidades visual y auditiva, permitiendo generar vídeo y audio sincronizados en un solo paso de denoising. El modelo base tiene 22B parámetros y fue entrenado con un pipeline que incluye destilación para reducir los pasos de inferencia a 8 con CFG=1.

El fine-tune "10 Eros" es una adaptación realizada por ibyteohdear sobre el modelo destilado de LTX-2.3. Según las notas de la model card, se han aplicado diversas técnicas: uso de LoRA para apilar parches anatómicos, ajustes de pesos "sulphur EXP" para refinar movimientos explícitos, y entrenamiento adicional sobre el conector (connector) para reducir la deriva facial. El autor menciona que las versiones v1.3 y v1.4 requieren un refinamiento intenso de prompts y que la v1.4 está diseñada para ser la base de futuros entrenamientos con LoRA. No se proporcionan detalles sobre el dataset de entrenamiento del fine-tune ni sobre el proceso exacto de destilación aplicado.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) y de texto (text-to-video), así como vídeo a vídeo (video-to-video).
- Generación de audio sincronizado con el vídeo (audio-to-video, video-to-audio, audio-to-audio).
- Generación conjunta de audio y vídeo a partir de texto o imagen (text-to-audio-video, image-to-audio-video).
- Soporte de múltiples idiomas en prompts (en, de, es, fr, ja, ko, zh, it, pt).
- Capacidad de apilar LoRAs para ajustar el comportamiento (el autor recomienda usar stacks de LoRA para mejorar la anatomía).
- Modo de destilación DMD (según notas v1.3, aunque el autor advierte que no es recomendable usarlo en todas las versiones).
- Control fino sobre el movimiento y la composición mediante prompts descriptivos y directivos (estilo similar al modelo base 22B dev).
- Generación de contenido explícito (NSFW) con énfasis en movimiento explícito y adherencia a prompts.

## Casos de uso

- Creación de contenido audiovisual para adultos: el modelo está específicamente diseñado para generar escenas explícitas con movimiento controlado. Se puede usar con flujos de trabajo de ComfyUI que integren los nodos LTXVideo, cargando el safetensors como checkpoint.
- Prototipado de efectos visuales: aunque el foco es NSFW, la capacidad de generar vídeo y audio sincronizados puede aprovecharse para pruebas de concepto en producción audiovisual independiente.
- Investigación en adaptación de modelos de difusión: este fine-tune es un ejemplo de cómo modificar un modelo base de 22B para un dominio concreto usando LoRA y destilación. Puede servir como caso de estudio para técnicas de fine-tuning eficiente.
- Generación de vídeo con control de movimiento: el autor afirma que la v1.4 permite "explicit prompting and motion" sin redibujado anatómico, lo que podría interesar a quienes trabajan en animación procedural.
- Entrenamiento de LoRAs personalizados: el autor indica que la v1.4 está pensada como base para entrenar LoRAs adicionales, por lo que puede usarse como punto de partida para adaptaciones específicas.
- Evaluación de modelos de generación de vídeo con audio: al ser una variante destilada, permite comparar la calidad de salida frente al modelo base LTX-2.3 en tareas de generación conjunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas cuantitativas (FVD, CLIP score, etc.) ni comparaciones con otros modelos. El único dato de rendimiento indirecto es que el modelo base LTX-2.3 destilado requiere 8 pasos de inferencia con CFG=1, pero no se indica si el fine-tune mantiene esa configuración. Tampoco hay mediciones de velocidad o consumo de recursos.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo base LTX-2.3 tiene 22B parámetros en bf16, se estima que la inferencia requiere al menos 48-80 GB de VRAM para cargar los pesos completos. El archivo safetensors de ~2,3 TB sugiere que podría tratarse de una versión con pesos completos en alta precisión o con múltiples checkpoints, pero no se especifica la cuantización.
- GPU recomendadas: no disponible. Para el modelo base se requieren GPUs de clase datacenter (A100 80GB, H100) o múltiples GPUs en paralelo. Es poco probable que quepa en GPUs de consumo como RTX 4090 (24 GB) sin cuantización agresiva.
- Opciones de despliegue: el modelo base es compatible con ComfyUI (nodos LTXVideo), el código PyTorch oficial de Lightricks (ltx-pipelines) y posiblemente con herramientas como Diffusers (la etiqueta `diffusers` está presente). No se mencionan opciones de cuantización GGUF ni despliegue con vLLM u Ollama.
- Latencia y throughput: no disponible. Dependerá del hardware y de la configuración de pasos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lightricks LTX-2.3 (base) | 22B | 257 frames @24FPS | DiT audio-video | ltx-2-community-license-agreement | HuggingFace, código abierto |
| ibyteohdear/Lightricks-LTX-2-DISTILLED-10-Eros | no disponible (probablemente 22B) | no disponible | Fine-tune NSFW del anterior | misma licencia | HuggingFace |
| Wan 2.2 (T2V) | 14B | no disponible | DiT vídeo | Apache 2.0 | HuggingFace |
| HunyuanVideo | 13B | 720p | DiT vídeo | licencia propia | HuggingFace |

La comparativa se limita a modelos de generación de vídeo de código abierto de escala similar. No hay datos de rendimiento para comparar de forma objetiva. El modelo de ibyteohdear es un derivado directo de LTX-2.3, por lo que sus capacidades base son las mismas, pero el fine-tune modifica el comportamiento hacia contenido explícito, lo que no es comparable directamente con modelos generalistas.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW. Su uso puede infringir las políticas de plataformas y las leyes locales. No debe desplegarse en servicios públicos sin moderación.
- Sesgos y calidad variable: el autor reconoce que las versiones anteriores (v1.2, v1.3) presentaban problemas como "ghost anatomy", subtítulos no deseados y transiciones inesperadas. La v1.4 mejora algunos aspectos pero aún requiere prompts muy refinados.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas o artefactos, especialmente con prompts ambiguos.
- Licencia restrictiva: la licencia ltx-2-community-license-agreement es personalizada. Aunque permite uso comercial, impone condiciones específicas (probablemente atribución y restricciones sobre usos ilícitos). Es necesario revisar el texto completo en el repositorio de Lightricks.
- Falta de documentación técnica: no se especifican datos de entrenamiento, configuración de hiperparámetros, ni métricas de evaluación. Esto dificulta la reproducibilidad y la evaluación objetiva.
- Requisitos de hardware elevados: con 22B parámetros, la inferencia requiere hardware de gama alta, lo que limita su uso en entornos con recursos limitados.
- Incompatibilidad con ciertas técnicas: el autor advierte que el modo DMD no funciona correctamente en todas las versiones ("don't try and use dmd you will know why if you try"), lo que puede romper flujos de trabajo existentes.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ibyteohdear/Lightricks-LTX-2-DISTILLED-10-Eros
- Modelo base LTX-2 de Lightricks: https://huggingface.co/Lightricks/LTX-2
- Código oficial LTX-2: https://github.com/Lightricks/LTX-2
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- Paper LTX-2: https://huggingface.co/papers/2601.03233
- Demo oficial del playground LTX-2: https://app.ltx.studio/ltx-2-playground/i2v
- Flujo de trabajo DMD mencionado por el autor: https://huggingface.co/TenStrip/LTX2.3-10Eros_Workflows/blob/main/10Eros_10SNodes_I2V_Basic_DMD_V5.json
- Documentación de ComfyUI para LTXVideo: https://docs.ltx.video/open-source-model/integration-tools/comfy-ui
