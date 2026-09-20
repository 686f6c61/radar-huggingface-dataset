# JustBendy/janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl

## Resumen

janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl es un modelo de difusión latente para generación de imágenes a partir de texto, publicado en HuggingFace por el usuario JustBendy y atribuido en su model card al autor janxd. Se trata de una fusión de checkpoints (merge) de la familia Stable Diffusion XL, construida a partir de tres modelos base: OnomaAIResearch/Illustrious-xl-early-release-v0, Laxhar/noobai-XL-1.1 y Minthy/RouWei-0.8. Su ámbito declarado es la ilustración de estilo anime y material para adultos (etiquetas not-for-all-audiences, hentai, nai), con énfasis en rasgos estéticos concretos: ojos más definidos, brillo y contraste, iluminación y sombreado mejorados, colores más vivos, líneas más nítidas y cabello con partículas brillantes.

El modelo se distribuye en formato safetensors y es compatible con la librería diffusers mediante el pipeline StableDiffusionXLPipeline. El recuento de parámetros real de los pesos publicados es de 2.567.463.684 (aproximadamente 2,57 mil millones), coherente con el backbone U-Net de la familia SDXL junto con el VAE y los codificadores de texto, y el repositorio ocupa 6,9 GB. La licencia declarada es la Fair AI Public License 1.0-SD (FAIpl-1.0-SD), etiquetada en el Hub como license: other.

Su relevancia práctica es acotada y conviene ser explícito: se trata de un modelo derivado, sin paper asociado, sin resultados de benchmarks publicados, con 0 descargas y 0 likes en el momento de la consulta, y con fecha de creación registrada como 2026-09-19. Es decir, es un checkpoint de la escena de merges de animación, útil para quien busque un estilo concreto ya preajustado, no un modelo con validación técnica independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente de la familia Stable Diffusion XL (U-Net + VAE + doble codificador de texto); fusión de checkpoints con ajuste adicional (etiquetas "merge" y "trained") |
| Parametros totales | 2.567.463.684 (según el recuento real de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de modelos de lenguaje; no se documenta en la información proporcionada el límite de tokens de prompt (en la familia SDXL es habitual 77 tokens por codificador de texto) |
| Tipos de cuantizacion | No disponible; el Hub solo distribuye safetensors sin versiones cuantizadas documentadas (el tamaño del repo, 6,9 GB, es coherente con pesos en precisión de 16 bits) |
| Idiomas soportados | Inglés (en) según los metadatos del Hub y la model card |
| Licencia | Fair AI Public License 1.0-SD (FAIpl-1.0-SD), declarada como "other" en el Hub |
| Formato de pesos | safetensors (librería diffusers) |
| Pipeline declarado | text-to-image (StableDiffusionXLPipeline) |
| Modelos base | OnomaAIResearch/Illustrious-xl-early-release-v0, Laxhar/noobai-XL-1.1, Minthy/RouWei-0.8 |
| Tamano del repositorio | 6,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura corresponde al esquema de difusión latente de SDXL: un U-Net que opera sobre representaciones latentes comprimidas por un VAE, condicionado por dos codificadores de texto (el par CLIP ViT-L y OpenCLIP ViT-bigG en la familia SDXL), con generación nativa a 1024x1024 píxeles y entrenamiento con predicción de ruido sobre el espacio latente. Al tratarse de un derivado de SDXL, el recuento de parámetros publicado (2,57 mil millones) coincide con el orden de magnitud esperado para el U-Net más los componentes auxiliares, y el repositorio de 6,9 GB encaja con pesos almacenados a 16 bits.

El autor no documenta en la información disponible el proceso de entrenamiento: no se indica el número de imágenes, la composición del dataset, el número de pasos, ni si hubo ajuste fino supervisado, DreamBooth, entrenamiento LoRA previo a la fusión o RLHF/DPO (procedimientos que, por otra parte, no son de aplicación habitual en modelos de difusión). Las etiquetas "trained" y "merge" sugieren una combinación de fusión de pesos de los tres modelos base con un ajuste posterior orientado a contenido NSFW, pero la proporción de mezcla, el método de merge y los hiperparámetros no están especificados. La model card remite al modelo original publicado en Civitai por el usuario janxd, donde presumiblemente estará el detalle, pero ese contenido no forma parte de la información proporcionada.

Como innovaciones técnicas destacables no se declara ninguna: no hay mención a decodificación especulativa, atención lineal, destilación ni arquitecturas híbridas. Las mejoras que anuncia el modelo son de carácter estético (ojos, contraste, sombreado, nitidez de líneas, saturación), no arquitectónicas.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el pipeline StableDiffusionXLPipeline de diffusers.
- Ilustración de estilo anime y manga, con personajes y rasgos faciales trabajados según las etiquetas del autor (better eyes, sharper lines).
- Generación de contenido para adultos (etiquetas not-for-all-audiences, hentai, nsfw), tanto de personajes como de escenas.
- Control de la estética mediante prompt y, presumiblemente, prompt negativo, al ser un pipeline de difusión condicionada por texto.
- Reproducción de estilos de artistas y de personajes concretos, según indican las etiquetas artists y characters del modelo.
- Ajuste de iluminación, contraste, saturación y acabado brillante (shiny hair with particles, shiny eyes, brighter colors) como sesgo estilístico aprendido.
- Compatibilidad esperable con el ecosistema SDXL (LoRA, ControlNet, IP-Adapter, img2img e inpainting mediante el pipeline correspondiente), dado que los modelos base pertenecen a esa familia; el autor no lo documenta explícitamente.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión por computador (comprensión) y audio: no aplicable/no disponible, es un modelo exclusivamente generativo de imágenes.
- Capacidades multilingües: limitadas al inglés según los metadatos; no se documenta soporte de otros idiomas en los prompts.

## Casos de uso

- Ilustración de personajes de estilo anime: el modelo puede generar retratos y figuras completas con rasgos faciales y cabello trabajados, que es el objetivo declarado de la fusión; adecuado para artistas que quieran una base estilística ya preajustada en lugar de partir de SDXL genérico.
- Prototipado de concept art y previsualización: generación rápida de bocetos de personajes, vestuario o ambientación antes de pasar al trabajo manual, aprovechando el sesgo hacia colores vivos y líneas nítidas.
- Creación de assets para cómics, fanzines o webcomics: generación de viñetas y expresiones de personaje, con posterior retoque en herramientas de edición; útil por la consistencia estilística que aporta un merge especializado.
- Producción de contenido para plataformas de mecenazgo y comunidades de ilustración para adultos: el modelo está explícitamente orientado a NSFW, por lo que encaja en flujos de trabajo donde ese tipo de contenido es el producto final, siempre que se respeten las condiciones de la licencia y la legislación aplicable.
- Generación de datasets sintéticos: creación de imágenes etiquetadas para entrenar o aumentar datasets de modelos de visión (clasificación, detección de personajes, segmentación) en dominios de ilustración anime, con la advertencia de que la calidad y la diversidad no están validadas por benchmarks.
- Investigación sobre fusión de modelos (model merging): al ser un merge documentado de tres checkpoints, sirve como caso de estudio reproducible para analizar cómo la combinación de pesos afecta al estilo, al contraste y a la nitidez frente a los modelos base.
- Integración en pipelines de generación por lotes: mediante diffusers o ComfyUI se puede ejecutar de forma desatendida para producir catálogos de imágenes, siempre que se resuelvan las consideraciones de VRAM y de licencia descritas más abajo.
- Experimentación con LoRA y ControlNet sobre base SDXL: para añadir un personaje o pose concreta sobre el estilo del modelo, aunque la compatibilidad no está confirmada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, Human Preference Score ni ninguna otra métrica cuantitativa, ni comparaciones numéricas con los modelos base. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos trataban de temas completamente ajenos (foros jurídicos alemanes sobre anuncios en plataformas de segunda mano) y se descartan. Tampoco se dispone de evaluaciones de terceros, dado que el modelo registra 0 descargas y 0 likes en el Hub.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato del autor. Como referencia de la familia SDXL (misma arquitectura, no confirmado para este checkpoint), la inferencia en fp16 a 1024x1024 suele requerir del orden de 10-12 GB con el pipeline estándar, alrededor de 6-8 GB con offload de módulos a CPU y del orden de 5-7 GB con cuantización a 8 bits.
- GPU recomendadas para fp16 sin compromisos: NVIDIA A100, H100, L40S, RTX 4090 (24 GB), RTX 3090 (24 GB).
- GPU de gama media: RTX 4080/4070 Ti (16 GB) y RTX 3060 de 12 GB pueden ejecutar el modelo, esta última con offload o cuantización.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM aplicando cuantización u offload; en 6 GB el margen es muy estrecho y depende del backend. Estas cifras son estimaciones derivadas de la arquitectura SDXL, no mediciones publicadas para este modelo.
- Opciones de despliegue: diffusers con StableDiffusionXLPipeline (formato nativo del repositorio), ComfyUI, AUTOMATIC1111 y sus forks (Forge, reForge), InvokeAI, Fooocus y SD.Next. vLLM, TGI, llama.cpp y Ollama no son aplicables; existen runtimes específicos para difusión como stable-diffusion.cpp, pero no se documenta ninguna conversión a GGUF de este checkpoint.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tiempo por imagen ni de imágenes por segundo para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de prompt | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl (este modelo) | 2.567.463.684 | No disponible | FAIpl-1.0-SD | HuggingFace (diffusers, safetensors), 0 descargas | Merge de los tres modelos de la fila siguiente, orientado a anime NSFW |
| Laxhar/noobai-XL-1.1 | No disponible en la información proporcionada (derivado de SDXL) | No disponible | No disponible | HuggingFace | Modelo base del merge; referente en ilustración anime de la familia SDXL |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | No disponible en la información proporcionada (derivado de SDXL) | No disponible | No disponible | HuggingFace | Modelo base del merge; versión temprana de la línea Illustrious |
| Minthy/RouWei-0.8 | No disponible en la información proporcionada (derivado de SDXL) | No disponible | No disponible | HuggingFace | Modelo base del merge; aporta parte del estilo "RouWei" |

No se dispone de datos de rendimiento comparativos (FID, CLIP score, preferencia humana) entre estos modelos en la información proporcionada, por lo que la comparación se limita a procedencia, licencia y disponibilidad.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como not-for-all-audiences y entrenado explícitamente para NSFW. No es adecuado para entornos profesionales generalistas ni para productos dirigidos a menores, y su uso puede infringir las políticas de plataformas de distribución y de proveedores de infraestructura en la nube.
- Licencia restrictiva: la Fair AI Public License 1.0-SD no es una licencia permisiva tipo Apache 2.0 o MIT. Los términos exactos no se reproducen en la información proporcionada, por lo que cualquier uso comercial debe verificarse en el enlace oficial de la licencia antes de desplegar el modelo.
- Ausencia de validación: 0 descargas y 0 likes, sin benchmarks publicados y sin evaluación de terceros. No hay evidencia cuantitativa de que el merge mejore objetivamente a sus modelos base.
- Trazabilidad del entrenamiento: se desconoce el dataset, el método de fusión, los hiperparámetros y si hubo ajuste con datos con derechos de autor. Esto añade riesgo legal y de reproducibilidad.
- Sesgos conocidos: los merges de anime heredan los sesgos de sus datasets de origen (predominio de ciertos cánones estéticos, tipos corporales y etnias). No se documenta ningún análisis de sesgo y no hay información sobre representación de diversidad.
- Alucinación y artefactos: como todo modelo de difusión, puede producir anatomías incorrectas, manos deformes, incoherencias entre prompt e imagen y fallos en la composición cuando la escena es compleja o el prompt es ambiguo.
- Idiomas: soporte declarado únicamente en inglés. Los prompts en castellano u otras lenguas pueden degradar la fidelidad al texto.
- Limitaciones de contexto: el condicionamiento por prompt está limitado por los codificadores de texto de SDXL; descripciones muy largas o con muchos sujetos simultáneos probablemente se pierdan. No hay instrucciones de sistema, memoria conversacional ni razonamiento multi-paso.
- Sin datos de VRAM ni latencia oficiales: los requisitos de hardware indicados son estimaciones basadas en la familia SDXL y pueden no ajustarse a este checkpoint concreto.
- Fecha de registro anómala: los metadatos del Hub indican 2026-09-19 como fecha de creación y actualización, posterior a la fecha de la consulta; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JustBendy/janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl
- Modelo original en Civitai: https://civitai.com/models/1277670/janku-v5-nsfw-trained-noobai-rouwei-illustrious-xl?modelVersionId=1896532
- Autor original en Civitai (janxd): https://civitai.com/user/janxd
- Licencia Fair AI Public License 1.0-SD: https://freedevproject.org/faipl-1.0-sd/
- Modelo base 1: https://huggingface.co/Laxhar/noobai-XL-1.1
- Modelo base 2: https://huggingface.co/Minthy/RouWei-0.8
- Modelo base 3: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Búsqueda web: no se encontraron enlaces relevantes sobre este modelo; los resultados devueltos eran ajenos al ámbito de la inteligencia artificial y se han descartado.
