# fosie/qwen-image-edit-plus-nsfw-lora

## Resumen

El modelo `fosie/qwen-image-edit-plus-nsfw-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el pipeline de difusión `Qwen/Qwen-Image-Edit-2511`, un modelo de edición de imágenes multimodal desarrollado por Alibaba. Este adaptador, denominado MCNL v1 (Multi Concept NSFW LoRA), amplía las capacidades del modelo base para generar y editar contenido explícito de carácter sexual (NSFW), incorporando conceptos específicos como anatomía, poses y escenarios. El repositorio tiene un tamaño de 0,6 GB y el adaptador pesa aproximadamente 563 MB en formato `safetensors`.

La relevancia de este modelo radica en que el modelo base Qwen-Image-Edit-2511, al igual que otros modelos de difusión de imágenes, presenta limitaciones para generar contenido NSFW de forma fiable. Este LoRA, entrenado con un conjunto de datos específico, permite desbloquear esas capacidades manteniendo la arquitectura original. Es una solución dirigida a desarrolladores e investigadores que trabajan en generación de imágenes con control fino, aunque su uso está restringido por la licencia OpenRAIL++ y por consideraciones éticas y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QwenImageTransformer2DModel (MMDiT) LoRA |
| Parametros totales | No disponible (el adaptador pesa ~563 MB, el modelo base Qwen-Image-Edit-2511 tiene aproximadamente 20B parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusion, no procesa texto como un LLM) |
| Tipos de cuantizacion | No especificado (formato safetensors, compatible con bfloat16) |
| Idiomas soportados | No disponibles (el modelo base soporta ingles y chino, pero el adaptador no especifica) |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura MMDiT (Multi-Modal Diffusion Transformer) del modelo Qwen-Image-Edit-2511, que combina un transformer de difusion con atencion cruzada entre texto e imagen. El LoRA se aplica a las capas de atencion del transformer, anadiendo un conjunto reducido de parametros entrenables (tipicamente rank 128, segun notas de la comunidad) que modifican el comportamiento del modelo sin reentrenar los pesos completos.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni el proceso de ajuste (si se uso RLHF, DPO u otra tecnica). La model card solo indica que es un adaptador para el pipeline de difusion y proporciona ejemplos de uso con `diffusers`. La comunidad (Civitai) sugiere que un LoRA NSFW de calidad requiere al menos 1.500 imagenes seleccionadas y un rank minimo de 128, pero estos datos no estan confirmados para este modelo concreto.

## Capacidades

- Edicion de imagenes mediante instrucciones de texto: el adaptador permite modificar imagenes existentes con prompts que describen cambios especificos, incluyendo contenido explicito.
- Generacion de contenido NSFW: activa conceptos como `nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `cowgirlout`, `reversecowgirlpov`, `blowjob`, `cum_on_face`, `creamp1e`, `l1ck`, segun los trigger words documentados.
- Integracion con el pipeline `QwenImageEditPlusPipeline` de la libreria `diffusers`, lo que facilita su uso en flujos de trabajo existentes.
- Compatibilidad con el espacio de Hugging Face "ScottzillaSystems Image Editor", que permite seleccionar el adaptador desde un desplegable.
- Soporte para edicion imagen-a-imagen (image-to-image) con control de pasos de inferencia y escala CFG.

## Casos de uso

- Creacion de contenido artistico adulto: artistas digitales pueden usar el adaptador para generar ilustraciones o modificar bocetos con un control semantico preciso sobre anatomía y poses, aprovechando la capacidad del modelo base para entender instrucciones complejas.
- Edicion de imagenes para proyectos de investigacion en vision por computador: investigadores que estudian la generacion de contenido explicito o la seguridad de modelos de difusion pueden emplear este adaptador como caso de estudio para evaluar sesgos, alucinaciones o mecanismos de mitigacion.
- Desarrollo de herramientas de moderacion de contenido: equipos que construyen filtros NSFW pueden utilizar el adaptador para generar ejemplos de entrenamiento (imagenes etiquetadas) que ayuden a mejorar clasificadores de contenido.
- Prototipado de aplicaciones de entretenimiento para adultos: empresas del sector pueden integrar el adaptador en sus pipelines de generacion de imagenes, siempre que cumplan con la licencia OpenRAIL++ y las regulaciones locales.
- Evaluacion comparativa de adaptadores LoRA: desarrolladores interesados en tecnicas de fine-tuning eficiente pueden comparar este adaptador con otros LoRA NSFW (como MCNL v2) para medir diferencias en calidad, coherencia y fidelidad de los conceptos.
- Pruebas de robustez de modelos de difusion: se puede usar el adaptador para estresar el modelo base con prompts extremos y analizar como responde ante contenido explicito, lo que ayuda a documentar limitaciones y riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre metricas como FID, CLIP score, ni comparaciones cuantitativas con otros adaptadores NSFW. La unica referencia es la nota de Civitai que menciona que Qwen-Image (20B) tiene dificultades con la generacion NSFW y que un LoRA bien entrenado mejora la anatomia, pero no se aportan numeros concretos.

## Requisitos de hardware

- El modelo base Qwen-Image-Edit-2511 tiene aproximadamente 20.000 millones de parametros, por lo que se requiere una GPU con al menos 24 GB de VRAM para inferencia en bfloat16 (por ejemplo, RTX 3090, RTX 4090, A100 40GB o superior).
- El adaptador LoRA anade unos pocos cientos de MB, por lo que no incrementa significativamente los requisitos de memoria.
- Para uso en GPU de consumo (16 GB), seria necesario aplicar cuantizacion (por ejemplo, 8-bit o 4-bit) mediante tecnicas como `bitsandbytes`, aunque no se ha documentado compatibilidad explicita.
- Opciones de despliegue: el ejemplo de uso emplea `diffusers` con PyTorch y CUDA. Tambien se puede ejecutar en el espacio de Hugging Face "ScottzillaSystems Image Editor" sin necesidad de infraestructura propia.
- La latencia dependera del hardware: en una A100, una inferencia de 40 pasos con resolucion estandar (1024x1024) puede tardar entre 5 y 15 segundos; en una RTX 4090, entre 10 y 30 segundos. No hay datos oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fosie/qwen-image-edit-plus-nsfw-lora (MCNL v1) | Qwen-Image-Edit-2511 | ~563 MB (LoRA) | No aplica | OpenRAIL++ | Hugging Face |
| ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2 (MCNL v2) | Qwen-Image-Edit-2511 | No disponible | No aplica | OpenRAIL++ | Hugging Face |
| Qwen-Image-NSFW (starsfriday) | Qwen-Image (20B) | No disponible | No aplica | No especificada | Hugging Face |

La comparativa se limita a otros adaptadores NSFW para modelos Qwen. No hay datos publicos sobre rendimiento relativo, calidad de imagen ni coherencia de los conceptos. La principal diferencia entre MCNL v1 y v2 es que v2 es una version actualizada, probablemente con mejoras en la cobertura de conceptos o en la calidad de la anatomia, pero no se detallan.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar y editar contenido NSFW, lo que puede resultar ofensivo o inapropiado en muchos contextos. Su uso debe restringirse a entornos controlados y legales.
- Sesgos y alucinaciones: como cualquier modelo de difusion, puede producir imagenes con anatomias distorsionadas, inconsistencias o artefactos, especialmente con prompts complejos o poco comunes.
- Licencia OpenRAIL++: permite uso comercial, pero impone restricciones de uso (por ejemplo, no utilizar para actividades ilegales o daninas) y requiere redistribuir los mismos terminos de licencia. Es responsabilidad del usuario revisar el texto completo de la licencia.
- Falta de documentacion: no se proporcionan detalles sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos de representacion o calidad de los datos.
- Dependencia del modelo base: el adaptador solo funciona con Qwen-Image-Edit-2511; no es portable a otros modelos de difusion.
- Riesgo de uso indebido: la generacion de contenido explicito sin consentimiento o con fines de acoso, fraude o pornografia no consentida es ilegal y contraria a las politicas de las plataformas. Los desarrolladores deben implementar salvaguardas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fosie/qwen-image-edit-plus-nsfw-lora
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Version MCNL v2 (actualizada): https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2
- Espacio de edicion de imagenes con LoRAs: https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast
- Notas sobre LoRA NSFW para Qwen-Image (Civitai): https://civitai.com/articles/18798/qwen-image-nsfw-lora-notes
- Comparativa con otros modelos NSFW: https://www.aimodels.fyi/models/compare/qwen-image-edit-plus-lora-qwen-vs-qwen-image-nsfw-starsfriday
