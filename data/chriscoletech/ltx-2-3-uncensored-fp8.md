# ChrisColeTech/LTX-2.3-uncensored-fp8

## Resumen

LTX-2.3-uncensored-fp8 es una compilación pre-fusionada del modelo de generación de vídeo LTX Video-2.3 de Lightricks, publicada por el usuario ChrisColeTech bajo el nombre comercial de "LTX Video-2.3 Uncensored Turbo v1.4". No se trata de un modelo entrenado desde cero, sino de un merge de pesos que combina el DiT base con tres fine-tunes: la LoRA Eros10 NSFW, la LoRA destilada DMD y el ICLoRA Detailer oficial de LTXV. El resultado se distribuye en formato GGUF y FP8, lo que reduce los requisitos de memoria frente a los pesos originales en bf16.

El modelo resuelve la generación de vídeo a partir de texto, imagen, audio y referencias visuales (T2V, I2V, V2V, A2V, FL2VA, REF2VA) con un enfoque explícito en contenido para adultos y sin censura, además de una destilación que permite generar vídeo en tan solo 4-8 pasos en lugar de las decenas habituales en modelos de difusión. Su relevancia actual radica en la combinación de velocidad (destilación DMD), preservación de identidad en image-to-video y la posibilidad de ejecutarlo en hardware de consumo gracias a la cuantización.

El repositorio tiene 296 GB, 93.766 descargas y 366 likes en el momento de la consulta. La licencia figura como "unknown", lo que supone un riesgo legal relevante para cualquier uso comercial. Los pesos declarados en safetensors suman 21.005.004.544 parámetros, aunque el pipeline es de difusión (DiT) y no un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de vídeo, base Lightricks LTX-2.3 |
| Parametros totales | 21.005.004.544 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por prompt; hasta 960 frames / ~40 s de vídeo) |
| Tipos de cuantizacion | GGUF (cuantizaciones varias) y FP8 |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el modelo card está en inglés) |
| Licencia | unknown (desconocida) |
| Formato de pesos | GGUF, FP8 (safetensors como base) |
| Resolución de ejemplo | 1280 × 736 |
| Frames máximos documentados | 960 frames (~40 s) |
| Pasos de inferencia | 4 (mínimo), 8-9 recomendados |
| CFG de referencia | 1.0 (íntimo), 3.5 (general), 3.8 (acción/diálogo) |
| Pipeline | text-to-video (con variantes image-to-video, video-to-video, audio-to-video) |

## Arquitectura y entrenamiento

La base es LTX-2.3 de Lightricks, un Diffusion Transformer para vídeo que opera en espacio latente y admite condicionamiento multimodal: texto, imagen inicial/final, audio y referencias visuales. Sobre esa base, el autor ha fusionado tres adaptadores en los pesos finales: la LoRA Eros10 NSFW a fuerza 1.0, la LoRA DMD destilada a fuerza 1.0 y el ICLoRA Detailer oficial de LTXV a fuerza 0.6. La destilación DMD (Distribution Matching Distillation) es la innovación clave: reduce el número de pasos de muestreo necesarios, lo que permite generar vídeo en 4-8 pasos con una calidad aceptable y mejora la preservación facial en image-to-video y el seguimiento de instrucciones respecto al modelo stock.

No se dispone de información sobre el volumen de tokens, la composición del dataset de entrenamiento original de LTX-2.3 ni sobre si hubo RLHF o DPO; esos datos corresponden al modelo base de Lightricks y no están incluidos en la información proporcionada. Tampoco se detalla la metodología exacta del merge (por ejemplo, si se usó fusión lineal de pesos o concatenación de módulos), más allá de que los LoRA están "baked in". El modelo card menciona que existen "guardrails" para impedir contenido ilegal, aunque el foco declarado es NSFW.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) con prompts descriptivos en lenguaje natural.
- Generación de vídeo imagen-a-vídeo (I2V) preservando la identidad del sujeto de la imagen de referencia.
- Vídeo-a-vídeo (V2V) y audio-a-vídeo (A2V), incluyendo variantes FL2VA (primer y último frame), T2VA (texto a vídeo con audio), I2VA (imagen a vídeo con audio) y REF2VA (referencia a vídeo con audio).
- Generación de audio sincronizado junto con el vídeo (el CFG más alto incrementa el movimiento y el audio).
- Generación de clips largos: hasta 960 frames, aproximadamente 40 segundos, manteniendo coherencia de personaje y escena.
- Control de cámara mediante prompt (travelling, zoom out, seguimiento estilo smartphone).
- Generación rápida en 4 pasos (8 recomendados) gracias a la destilación DMD.
- Contenido NSFW explícito, sin censura, como característica diferencial frente al modelo base.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Previsualización de storyboards para cine y publicidad: generar clips de 5 segundos en 8 pasos a 1280 × 736 permite iterar sobre encuadres y movimiento de cámara antes de rodar, con CFG 3.8 para escenas de acción.
- Prototipado de vídeo musical o doblaje: la variante T2VA/I2VA genera audio sincronizado junto al vídeo, útil para maquetas de videoclips o escenas con diálogo.
- Animación de retratos y personajes a partir de una imagen fija: la combinación de I2V con el ICLoRA Detailer y la preservación facial de DMD lo hace adecuado para animar fotos de producto, avatares o personajes recurrentes.
- Creación de contenido para adultos con coherencia de personaje: el merge de Eros10 permite mantener identidad y continuidad entre planos en clips largos de hasta 40 segundos, un caso de uso declarado explícitamente por el autor.
- Generación de vídeo de referencia para VFX y composición: la variante FL2VA con primer y último frame permite definir transiciones exactas entre dos imágenes, útil para previsualización en postproducción.
- Investigación sobre destilación de modelos de difusión: al estar publicados los pesos en GGUF y FP8 con la LoRA DMD fusionada, sirve para estudiar el impacto de la destilación en calidad y velocidad frente al modelo stock.
- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantización GGUF permite ejecutar el pipeline en ComfyUI en equipos con menos VRAM que los necesarios para bf16, facilitando pruebas sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card únicamente aporta parámetros de muestreo de ejemplo (resolución 1280 × 736, 121 frames, 8 pasos, CFG 3.5) y capturas de muestra, sin métricas cuantitativas como FVD, CLIP score o comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 21.000 millones de parámetros, los pesos en FP8 ocupan aproximadamente 21 GB, y en bf16 unos 42 GB; a ello hay que sumar el VAE, el codificador de texto y los latentes de vídeo, por lo que el pico de memoria es considerablemente mayor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un despliegue en FP8 requiere GPUs de 40-80 GB (A100 40/80 GB, H100) para trabajar con holgura; las cuantizaciones GGUF más agresivas podrían acercarse a GPUs de 24 GB (RTX 4090) o 16 GB, aunque no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) con GGUF de baja precisión y resolución reducida, pero no hay datos verificados de VRAM ni de velocidad en el model card.
- Opciones de despliegue: ComfyUI es el entorno documentado (se incluye un workflow JSON de ejemplo para T2AV). El formato GGUF sugiere compatibilidad con runners basados en llama.cpp/GGUF para difusión, aunque no se detalla; no se mencionan vLLM ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. Solo se indica que el modelo genera en 4-8 pasos, lo que reduce el coste frente a muestreos de 20-50 pasos, pero sin cifras de segundos por clip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Pasos | Licencia | Enfoque |
|---|---|---|---|---|---|
| LTX-2.3-uncensored-fp8 (este) | 21,0 B | hasta 960 frames (~40 s) | 4-8 | unknown | Vídeo NSFW, T2V/I2V/A2V, GGUF/FP8 |
| Lightricks/LTX-2.3 (base) | no disponible en la información | no disponible | no disponible | la del modelo base (no confirmada aquí) | Vídeo general con censura |
| TenStrip/LTX2.3-10Eros | no disponible | no disponible | no disponible | no disponible | Fine-tune NSFW sobre LTX-2.3 |
| TenStrip/LTX2.3_DMD_Lora | no disponible | no disponible | destilado | no disponible | LoRA de destilación DMD |

La comparativa se limita a los modelos citados como base en el repositorio, ya que no se han proporcionado datos de otros sistemas de vídeo (por ejemplo, modelos cerrados o de otros tamaños) que permitan una comparación rigurosa de parámetros, contexto y rendimiento. No hay cifras de benchmarks para ninguno de ellos en la información disponible.

## Limitaciones y advertencias

- Licencia "unknown": no hay términos legales claros, lo que impide garantizar el uso comercial y puede entrar en conflicto con la licencia del modelo base de Lightricks. Es un bloqueo para producción empresarial.
- Contenido NSFW explícito: el merge de Eros10 está diseñado para generar material para adultos, lo que implica riesgos de moderación, cumplimiento normativo y reputación en cualquier despliegue público.
- El autor afirma que existen "guardrails" contra contenido ilegal, pero no se documenta su funcionamiento ni su robustez; no deben considerarse una garantía.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir anatomías incoherentes, artefactos temporales, texto ilegible y físicas imposibles, especialmente en clips largos.
- Coherencia limitada en secuencias largas: aunque se documentan hasta 960 frames, la consistencia de personaje y escena puede degradarse; el propio autor recomienda prompts muy detallados para mantenerla.
- Sin datos de benchmarks ni de VRAM verificada: no hay métricas objetivas de calidad (FVD, CLIP) ni cifras de rendimiento que permitan comparar con el modelo stock.
- Idiomas no documentados: los prompts de ejemplo están en inglés y no se confirma el soporte multilingüe.
- Dependencia de ComfyUI y de un workflow concreto: la integración en otros pipelines no está documentada.
- Repositorio de 296 GB: el almacenamiento y la descarga son costosos, y conviene verificar la integridad de los archivos GGUF/FP8 antes de usarlos.
- Es un merge de terceros, no un modelo oficial de Lightricks: la calidad y la estabilidad no están respaldadas por el desarrollador original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Fine-tune NSFW de referencia: https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA DMD de referencia: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Workflow de ejemplo T2AV: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json
- Vídeo de muestra T2V: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/samples/ComfyUI_00099_cfg_3_5.mp4
- Vídeo de muestra I2V con audio: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/samples/ComfyUI_00098_i2va.mp4
