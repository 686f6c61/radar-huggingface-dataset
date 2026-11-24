# S3ckn11g0r/CROWN-H3-Perfect-Hands-Eyes-Anatomy

## Resumen

CROWN-H3-Perfect-Hands-Eyes-Anatomy es un LoRA de concepto desarrollado por NineCrowns (bajo la marca CROWN) para el modelo de generación de vídeo MiniMax H3. No se trata de un modelo base, sino de un adaptador de bajo rango (rank 64) que se aplica sobre los pesos del modelo MiniMax H3 para corregir dos problemas recurrentes en la generación de vídeo con personas: la deformación de manos (dedos fusionados, seis dedos, contornos borrosos) y la falta de expresividad ocular (miradas vidriosas, ausencia de reflejos en el iris).

El adaptador se entrenó específicamente sobre material de vídeo de alta velocidad de obturación (1/1000 s) con primeros planos de manos, gestos y microexpresiones faciales, con el objetivo de preservar la anatomía de los cinco dedos y generar parpadeos naturales y reflejos oculares realistas durante escenas de baile, vlogs y actuación cercana a cámara. Es compatible con los tres modos de inferencia de MiniMax H3 (Ref2VA, I2VA y T2VA) y puede apilarse con otros LoRA de personaje o estilo.

El modelo es relevante para creadores y desarrolladores que trabajan con pipelines de texto-a-vídeo y necesitan calidad anatómica en primeros planos, un caso de uso especialmente problemático en los modelos generativos actuales. El repositorio ocupa 1 GB y contiene un único archivo de pesos en formato safetensors de 910 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MiniMax H3; rank 64, alpha 64, aplicado a bloques video-only 10-49 |
| Parametros totales | no disponible (el archivo de pesos pesa 910,06 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el modelo base se usa en bf16 segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | bespoke-lora-license (licencia personalizada, enlace a civitai.com/user/NineCrowns) |
| Formato de pesos | safetensors (CROWN_H3_Perfect_Hands_Eyes_Anatomy_V1_r64.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 que se inyecta exclusivamente en los bloques video-only 10 a 49 del transformer de MiniMax H3, e incorpora el Ostris De-Distillation Adapter. El entrenamiento se realizó en un clúster de 8 GPU NVIDIA B200, con un conjunto de datos compuesto por material nativo sin marca de agua en 1080P y 4K, grabado con alta velocidad de obturación (1/1000 s), procedente de vídeos de bailes de dedos (手势舞) y gestos expresivos de manos de Douyin y TikTok. La resolución de entrenamiento fue de 768×1344 (denominada "True 768P" en la model card).

La innovación principal del adaptador es su especialización: en lugar de mejorar la estética general, se centra en dos fallos concretos del modelo base. Por un lado, fuerza la articulación anatómica de cinco dedos por mano con contornos de nudillos nítidos y uñas limpias durante gestos rápidos (corazones con los dedos, signos de victoria, saludos, manos en la cara). Por otro, refuerza los reflejos luminosos en el iris y un ritmo de parpadeo natural de aproximadamente tres segundos, además de guiños sin distorsión facial. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo texto-a-vídeo con énfasis en la corrección anatómica de manos y ojos, aplicable sobre MiniMax H3 en sus modos T2VA (texto a vídeo con audio), I2VA (imagen a vídeo con audio) y Ref2VA (referencia a vídeo con audio).
- Articulación de cinco dedos por mano con separación anatómica, contornos de nudillos definidos y uñas manicuradas nítidas en gestos rápidos como corazones con los dedos, signos de victoria, saludos con la mano abierta y manos en las mejillas.
- Generación de reflejos luminosos (catchlights) en el iris y parpadeos fisiológicos naturales con una cadencia aproximada de tres segundos, además de guiños expresivos sin distorsión facial.
- Compatibilidad con apilamiento de otros LoRA de personaje o estilo sobre el mismo modelo base.
- Palabra de activación: `crown_perfect_hands_eyes`.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni otras modalidades (audio, visión) más allá de las inherentes al modelo base MiniMax H3.

## Casos de uso

- Creación de contenido para redes sociales con primeros planos de manos: el adaptador mantiene los cinco dedos separados y nítidos en vídeos de bailes de dedos, saludos y gestos virales, un escenario donde los modelos de vídeo suelen producir dedos fusionados o contornos borrosos.
- Vídeos de belleza y cosmética con primeros planos faciales: los reflejos en el iris y el parpadeo natural evitan la mirada vidriosa típica, lo que resulta adecuado para demostraciones de maquillaje, cuidado de la piel y accesorios.
- Escenas de actuación cercana a cámara (vlogs, monólogos, reacciones): el LoRA preserva microexpresiones y guiños sin deformar el rostro, útil para contenido de creadores que graban a corta distancia.
- Producción de material publicitario con modelos humanos: al combinarse con LoRA de personaje o estilo, permite generar anuncios con gestos de manos expresivos (señalar, sostener productos, saludar) manteniendo la anatomía correcta.
- Integración en flujos de trabajo de ComfyUI: el adaptador está etiquetado para ComfyUI y puede encadenarse en pipelines de generación de vídeo con MiniMax H3, lo que facilita su uso en estudios de producción que ya trabajan con esta herramienta.
- Generación de vídeo con referencia de imagen o de referencia visual (I2VA y Ref2VA): útil para animar retratos o imágenes fijas de personas donde las manos y la mirada son el foco de atención, como avatares o presentaciones animadas.
- Experimentación e investigación en generación de vídeo: sirve como caso de estudio de adaptadores especializados que corrigen fallos concretos de un modelo base sin reentrenarlo por completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 910,06 MB en disco y debe cargarse junto con el modelo base MiniMax H3, por lo que los requisitos reales de VRAM vienen determinados por el modelo base, no por el LoRA.
- El modelo base se utiliza en bf16 según la configuración de prueba de la model card (minimax_h3_ref2va_bf16.safetensors, qwen3vl_32b_minimax_h3_bf16.safetensors y minimax_h3_video_vae_fp32.safetensors), lo que implica requisitos de memoria elevados; no se dispone de cifras exactas de VRAM en la información proporcionada.
- El entrenamiento se realizó en un clúster de 8 GPU NVIDIA B200, lo que da una idea del orden de magnitud del modelo base.
- No se dispone de información sobre si el modelo base cabe en GPU de consumo (RTX 4090, etc.) ni sobre opciones de cuantización para reducir memoria.
- Opciones de despliegue: ComfyUI (etiquetado explícitamente) y flujos en la nube de RunningHub; no se dispone de información sobre vLLM, llama.cpp, Ollama o TGI para este modelo.
- No se dispone de datos de latencia ni throughput. La configuración de prueba indicada es de 25 pasos, sampler euler + beta, cfg 1.0 y MiniMaxH3SigmaShift con shift_video 12.0 y shift_audio 3.0, a resolución 768×1344 o 1344×768.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRA comparables para MiniMax H3 en la documentación proporcionada. Se indica "no disponible".

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CROWN-H3-Perfect-Hands-Eyes-Anatomy | LoRA sobre MiniMax H3 | no disponible (910 MB) | no disponible | bespoke-lora-license | Hugging Face, RunningHub, Civitai |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere el modelo base MiniMax H3 y sus componentes auxiliares (Qwen3-VL 32B y VAE de vídeo) para funcionar.
- La licencia es una licencia personalizada (bespoke-lora-license) con enlace a Civitai; no se especifican en la información disponible los términos exactos para uso comercial, por lo que debe consultarse la licencia antes de utilizarlo en producción.
- El entrenamiento se centró en material de vídeo de redes sociales (Douyin y TikTok) con primeros planos de manos y rostros, lo que puede introducir sesgos estéticos y demográficos hacia ese tipo de contenido.
- El adaptador está especializado en manos y ojos; no se espera que mejore otras áreas de la generación de vídeo (composición corporal completa, escenas de acción, paisajes) y podría alterar el estilo general si se usa con pesos altos.
- El peso recomendado es de 0,70 a 0,80; fuera de ese rango podría degradar la coherencia del vídeo o producir artefactos.
- No se dispone de información sobre idiomas soportados, riesgos de alucinación específicos ni limitaciones de contexto, ya que dependen del modelo base.
- La model card incluye enlaces externos y promocionales (RunningHub, h3xron.xyz) que deben tratarse con cautela y no como parte de la documentación técnica verificada.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-Perfect-Hands-Eyes-Anatomy
- Civitai (página oficial del creador): https://civitai.com/models/3044609
- Civitai (perfil del creador): https://civitai.com/user/NineCrowns
- RunningHub Global (modelo LoRA): https://www.runninghub.ai/model/public/2120439889498419201
- RunningHub Global (flujo ComfyUI): https://www.runninghub.ai/workflow/2120529947085676546
- RunningHub Global (webapp): https://www.runninghub.ai/ai-detail/2120529962406330370
- RunningHub China (modelo LoRA): https://www.runninghub.cn/model/public/2120452728542552066
- RunningHub China (flujo ComfyUI): https://www.runninghub.cn/workflow/2120527519433707522
- RunningHub China (webapp): https://www.runninghub.cn/ai-detail/2120527536550670338
- Plataforma de inferencia en línea mencionada en la model card: https://h3xron.xyz
