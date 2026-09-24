# RunningHubAI/rh-real-girl-unet

## Resumen

rh-real-girl-unet es un modelo de difusión de tipo UNET para generación y edición de imágenes a partir de texto, publicado por RunningHubAI en Hugging Face. El repositorio contiene un único archivo de pesos de 12 226 MiB (`rawgirlKrea2_v10.safetensors`), con un tamaño total de repo de 12,8 GB, y está etiquetado con el pipeline `image-text-to-image` y la etiqueta `comfyui`, lo que indica que su uso previsto es la integración en flujos de ComfyUI o en la plataforma en la nube RunningHub. No es un modelo de lenguaje: no genera texto ni dispone de contexto conversacional.

El modelo es un fine-tuning de Krea2 sobre el dataset completo RawGirl, según la model card del autor, que lo presenta como la versión más completa y estable del estilo RawGirl y como sustituto de la serie de LoRA previa. Entre las características declaradas figuran el entrenamiento con contenido NSFW de extremo a extremo, la incorporación de texturas generadas con GPT2 para reforzar el detalle de piel, tejidos y superficies, y una composición de aspecto aficionado (encuadres naturales, sujetos sin posar) que el autor describe como intrínseca al modelo.

Su interés práctico reside en dos puntos: obtener un acabado fotorrealista sin apilar LoRA de estilo, y su disponibilidad inmediata como API en RunningHub. Sin embargo, el repositorio no documenta arquitectura interna, número de parámetros, resolución de entrenamiento, licencia explícita ni resultados de benchmarks, y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusión (edición y generación de imagen); fine-tuning de Krea2 |
| Parametros totales | no disponible (peso del archivo de pesos: 12 226 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión; la longitud de prompt la determina el codificador de texto, no especificado) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible (la model card está en inglés y chino, pero no se declaran idiomas de prompt) |
| Licencia | no disponible; RunningHub publica en nombre del autor y remite a la licencia del proyecto original o upstream (Krea2) |
| Formato de pesos | safetensors (`rawgirlKrea2_v10.safetensors`) |
| Tarea declarada (pipeline) | image-text-to-image |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 12,8 GB |
| Fecha de creación | 2026-09-24T14:25:00.000Z |
| Última actualización | 2026-09-24T14:33:01.000Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como una UNET de edición de imagen afinada a partir de Krea2. No se detalla el número de parámetros, la profundidad de bloques, el mecanismo de condicionamiento, el tipo de scheduler ni la resolución nativa de entrenamiento. Tampoco se especifican el codificador de texto ni el VAE que deben acompañar a la UNET para la inferencia, algo crítico porque una UNET no es autocontenida: necesita un text encoder y un VAE compatibles con la base Krea2.

En cuanto a los datos, la model card indica que el ajuste se realizó con el dataset completo RawGirl y que se incorporó "una porción de texturas generadas con GPT2" para mejorar el detalle de piel, tejidos y superficies, sin cuantificar proporción, volumen de imágenes ni número de pasos de entrenamiento. Se declara entrenamiento completo sobre contenido NSFW, sin necesidad de LoRA específica, y compatibilidad con LoRA de personaje, recomendando entrenarlas directamente sobre este checkpoint para evitar mezclar dos estilos fotográficos distintos en la misma imagen. No se menciona uso de RLHF, DPO ni ninguna técnica de alineación, lo cual es esperable en un modelo de difusión de imágenes.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompt de texto, con énfasis declarado en textura de piel, iluminación natural y grano auténtico.
- Edición de imagen dentro del pipeline `image-text-to-image`, según la clasificación del propio repositorio.
- Producción de contenido NSFW explícito integrada en el propio modelo, sin LoRA adicional.
- Composición de estilo aficionado: encuadres no posados, ángulos naturales y composición imperfecta.
- Compatibilidad con LoRA de personaje, con recomendación del autor de entrenarlas sobre este checkpoint.
- Integración en ComfyUI como nodo UNET y uso en la nube mediante RunningHub y su API.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible; no se declaran idiomas de prompt.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; la única modalidad declarada es imagen texto-a-imagen.

## Casos de uso

- Generación de retratos sintéticos para stock y publicidad: el modelo está ajustado específicamente para piel y luz realistas, lo que reduce el retoque posterior en sesiones de fotografía de producto con modelos humanos.
- Creación de avatares y personajes consistentes: partiendo del checkpoint, se puede entrenar una LoRA de personaje con el mismo estilo fotográfico base, evitando la mezcla de estéticas que ocurre al entrenar sobre baselines distintos.
- Previsualización de arte conceptual en videojuegos y cine: generación rápida de referencias de vestuario, iluminación y encuadre en ComfyUI antes de pasar a producción 3D.
- Contenido editorial para plataformas con verificación de edad: el NSFW está integrado en el modelo, lo que simplifica el flujo al no requerir LoRA adicional, siempre que la plataforma y la jurisdicción lo permitan.
- Automatización por API en RunningHub: el modelo se puede invocar desde el servicio en la nube del autor para generar lotes de imágenes sin gestionar GPU propia.
- Generación de datasets sintéticos etiquetados: útil para aumentar datos de entrenamiento de otros modelos de visión (detección de personas, segmentación) cuando no se pueden usar imágenes reales por privacidad.
- Edición y variación de retratos existentes: el pipeline texto-imagen permite reformular iluminación, fondo o encuadre manteniendo el sujeto.
- Pruebas de estilo y prompt engineering: como checkpoint fotorrealista "sin LoRA", sirve de referencia base para medir cuánto aporta una LoRA de estilo frente al modelo desnudo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas objetivas (FID, CLIP score, ImageReward, HPSv2), comparativas con otros checkpoints, ni parámetros de muestreo recomendados (pasos, CFG, sampler, resolución). Tampoco se publican tiempos de inferencia ni throughput.

## Requisitos de hardware

- VRAM estimada para los pesos de la UNET: aproximadamente 12 GB en precisión de 16 bits, a partir del tamaño del archivo (12 226 MiB). A esta cifra hay que sumar el VAE y el codificador de texto de la base Krea2, cuyo tamaño no se especifica en la información disponible.
- VRAM total orientativa: a partir de 16 GB para un flujo completo con resolución moderada; 24 GB o más para trabajar con comodidad y lotes.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) para despliegues de alto volumen.
- Cabe en GPU de consumo con 24 GB (RTX 3090, 4090). En tarjetas de 16 GB o menos será necesario recurrir a offloading de módulos a RAM o a cuantización, no publicada oficialmente en este repositorio.
- Opciones de despliegue: ComfyUI (uso local, formato nativo del repositorio) y RunningHub (nube y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imagen.
- Cuantizaciones GGUF para UNET, habituales en el ecosistema ComfyUI, no están publicadas por el autor; su disponibilidad y compatibilidad no están confirmadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de terceros incluidos en la tabla no proceden de la información proporcionada en esta ficha y deben verificarse antes de usarse en producción.

| Modelo | Tipo | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-real-girl-unet | UNET de difusión (base Krea2), fotorrealismo y NSFW | no disponible (pesos de 12 226 MiB) | no disponible | Hugging Face, ComfyUI, RunningHub |
| Krea2 (modelo base) | UNET de difusión texto-imagen | no disponible en la información proporcionada | no disponible | distribuido por su autor original |
| FLUX.1-dev | Transformer de difusión (DiT) texto-imagen | ~12 000 M (referencia general, no verificada en esta ficha) | no comercial | Hugging Face, amplio soporte en ComfyUI |
| SDXL y checkpoints fotorrealistas derivados | UNET de difusión texto-imagen | UNET de ~2 600 M y pipeline de ~3 500 M (referencia general, no verificada en esta ficha) | CreativeML Open RAIL++-M en el caso base de SDXL | Hugging Face, ComfyUI, ecosistema LoRA maduro |

Diferencias cualitativas destacables: frente a SDXL, este checkpoint parte de Krea2, una base más reciente cuyo tamaño de pesos (12 226 MiB) es muy superior al de la UNET de SDXL, lo que implica mayores requisitos de VRAM. Frente a FLUX.1-dev, la información disponible no permite comparar calidad ni resolución nativa, y la licencia de rh-real-girl-unet es indeterminada, lo que dificulta cualquier comparación legal para uso comercial.

## Limitaciones y advertencias

- Licencia indeterminada: el repositorio remite a la licencia del proyecto original o upstream sin especificarla. No se puede asumir uso comercial libre; es un riesgo legal directo para producción.
- Contenido NSFW integrado: requiere verificación de edad, cumplimiento normativo por jurisdicción y revisión de las políticas de la plataforma de destino.
- Riesgo de uso indebido para imágenes íntimas no consentidas o deepfakes. El modelo está entrenado explícitamente para fotorrealismo de personas, lo que aumenta el riesgo de suplantación.
- Sesgos de representación no documentados: no se describe la composición demográfica del dataset RawGirl, por lo que se desconoce el sesgo en etnia, edad, complexión corporal o contexto cultural.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni evaluaciones independientes que confirmen calidad o estabilidad.
- Ausencia de especificaciones de inferencia: no se indican resolución nativa, pasos, CFG, sampler, ni el VAE y text encoder compatibles, lo que dificulta reproducir resultados fuera de RunningHub.
- Dependencia de la base Krea2: sin acceso documentado a esa base, la UNET puede no funcionar o degradar su calidad si se empareja con codificadores de texto o VAE incompatibles.
- Posibles artefactos anatómicos y de manos, habituales en modelos de difusión fotorrealistas, agravados por la ausencia de benchmarks publicados.
- Fechas de metadatos anómalas (creación y actualización el 2026-09-24), que conviene verificar en el repositorio antes de citarlo.
- El autor declara uso de texturas generadas con GPT2 en el entrenamiento; no se detalla el impacto ni la posible introducción de patrones sintéticos repetidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-real-girl-unet
- Model card en chino: https://huggingface.co/RunningHubAI/rh-real-girl-unet/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2093681420727537665
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Modelo de origen en Civitai (RawGirl Krea2): https://civitai.red/models/2898370/rawgirl-krea2?modelVersionId=3277001
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio en China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API del modelo: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2093681420727537665
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
