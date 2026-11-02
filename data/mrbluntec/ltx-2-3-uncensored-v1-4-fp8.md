# Mrbluntec/LTX-2.3-uncensored-v1.4-FP8

## Resumen

LTX-2.3-uncensored-v1.4-FP8 es una compilación pre-fusionada del modelo de difusión de vídeo LTX Video 2.3 de Lightricks, publicada por el usuario Mrbluntec (con muestras y workflows alojados bajo la cuenta ChrisColeTech). Sobre los pesos base se han integrado tres fine-tunes: el LoRA NSFW Eros10 de TenStrip, el LoRA destilado DMD (que reduce el número de pasos de inferencia) y el ICLoRA Detailer oficial de LTXV para mejorar la adherencia a la imagen de referencia. El resultado es un modelo de generación de vídeo condicionado por texto, imagen o audio, con estética sin censura y generación en tan solo 4-8 pasos.

El modelo se distribuye en formato FP8 y también en GGUF cuantizado, con un total de 21.005.004.544 parámetros (aproximadamente 21 000 millones) según los datos de safetensors del repositorio, que ocupa 261,1 GB. La arquitectura subyacente es un Diffusion Transformer (DiT) heredado de LTX-2.3, con soporte para texto-a-vídeo, imagen-a-vídeo, vídeo-a-vídeo y audio-a-vídeo, incluyendo generación de audio sincronizado.

Es relevante para quien necesite un pipeline de vídeo generativo local de alta fidelidad temporal (hasta 960 frames, unos 40 segundos) con control fino mediante CFG y pasos, y que no requiera las restricciones de contenido del modelo original. La licencia figura como "unknown", lo que supone un riesgo legal importante para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) derivado de LTX Video 2.3 |
| Parámetros totales | 21.005.004.544 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de condicionamiento textual no especificada) |
| Tipos de cuantización | FP8 y GGUF (cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | unknown |
| Formato de pesos | safetensors (FP8) y GGUF |
| Modos de generación | txt2video, img2video, video2video, audio2video, FL2VA, T2VA, I2VA, REF2VA |
| Resolución de ejemplo | 1280 × 736 |
| Frames máximos documentados | 960 frames (~40 s) |
| Pasos de inferencia | 4-9 (recomendado 8) |
| CFG de ejemplo | 1.0, 3.5, 3.8 |
| Tamaño del repositorio | 261,1 GB |

## Arquitectura y entrenamiento

El modelo base Lightricks/LTX-2.3 es un Diffusion Transformer para generación de vídeo, y esta compilación conserva esa arquitectura añadiendo tres adaptaciones fusionadas en los pesos. El LoRA Eros10 (fuerza 1.0) aporta coherencia y estética NSFW; el LoRA DMD destilado (fuerza 1.0) permite generaciones más rápidas, mejor preservación facial en imagen-a-vídeo y mejor seguimiento de instrucciones que la versión stock; y el ICLoRA Detailer oficial (fuerza 0.6) mejora la fidelidad a la imagen de referencia. Al estar pre-fusionados, no es necesario cargar los LoRA por separado en el grafo de ComfyUI.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card menciona que existen "guardrails" para impedir contenido ilegal, aunque el enfoque principal es NSFW. La innovación técnica destacable es la destilación DMD, que reduce el número de pasos necesarios (4-8) frente a los pipelines de difusión convencionales, y la integración de audio en los modos T2VA/I2VA/FL2VA.

## Capacidades

- Generación de vídeo a partir de texto (txt2video) con prompts descriptivos y control de cámara.
- Generación de vídeo a partir de imagen (img2video), preservando identidad y rasgos faciales.
- Generación de vídeo a partir de vídeo (video2video) y de audio (audio2video).
- Modos combinados: FL2VA (primer y último frame con audio), T2VA, I2VA y REF2VA (referencia visual).
- Generación de audio sincronizado con el vídeo en los modos que incluyen "A" (audio).
- Control de movimiento y audio mediante CFG: valores altos (3.5-3.8) producen más movimiento y sonido; CFG 1.0 favorece escenas lentas e íntimas.
- Generación de clips largos: hasta 960 frames (~40 s) documentados como caso de uso.
- Estética sin censura (NSFW) integrada, con contenido erótico explícito.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Producción de vídeo publicitario y de moda: generación de clips de 5 s a 1280 × 736 con 8 pasos y CFG 3.5, útil para prototipado rápido de storyboards y variaciones de cámara sin rodaje.
- Creación de contenido para redes sociales: clips verticales u horizontales con audio sincronizado en modo T2VA, donde el control de CFG permite ajustar la intensidad del movimiento y del sonido.
- Animación de personajes a partir de una imagen: img2video con 9 pasos y el ICLoRA Detailer fusionado, adecuado para preservar la identidad facial en series de episodios cortos.
- Vídeo musical y contenido de audio reactivo: audio2video permite generar visuales que responden a una pista de audio, útil para visualizers y piezas de arte generativo.
- Previsualización cinematográfica: FL2VA (primer y último frame) facilita interpolar transiciones entre dos imágenes clave, útil en preproducción y animática.
- Contenido para adultos y nichos NSFW: el LoRA Eros10 integrado permite generar escenas eróticas coherentes; debe gestionarse con control de acceso y verificación de edad en cualquier despliegue.
- Investigación en modelos de difusión de vídeo: al ser una compilación pre-fusionada con DMD, sirve para estudiar el efecto de la destilación en la calidad temporal y en el número de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 21 000 millones de parámetros en FP8, se requiere al menos ~21 GB solo para pesos, más memoria para activaciones y latentes de vídeo, por lo que en la práctica se necesitan GPUs de 40-80 GB para resoluciones de 1280 × 736 y clips largos.
- La variante GGUF permite reducir requisitos mediante cuantización, aunque no se especifican los niveles disponibles ni su VRAM asociada.
- GPU recomendadas: A100 80 GB, H100 80 GB; en consumer, RTX 4090 (24 GB) podría ejecutar la variante GGUF cuantizada con resoluciones y frames reducidos, aunque no está confirmado en la información disponible.
- Despliegue: ComfyUI (se incluye workflow de ejemplo LTXV23_v1.4_T2AV_nsfw.json); el ecosistema GGUF sugiere compatibilidad con llama.cpp/ComfyUI-GGUF, aunque no se detalla.
- Latencia y throughput: no disponibles; la destilación DMD permite 4-8 pasos, lo que reduce el coste frente a pipelines de 20-50 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Modos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3-uncensored-v1.4-FP8 | 21,0 B | hasta 960 frames (~40 s) | txt2video, img2video, video2video, audio2video | unknown | HuggingFace (repo de 261 GB) |
| Lightricks/LTX-2.3 (base) | no disponible | no disponible | txt2video, img2video | no disponible | HuggingFace |
| TenStrip/LTX2.3-10Eros | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| TenStrip/LTX2.3_DMD_Lora | no disponible | no disponible | LoRA de destilación | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia "unknown": no hay garantías legales para uso comercial; es imprescindible verificar los términos del modelo base Lightricks/LTX-2.3 y de los LoRA de TenStrip antes de cualquier despliegue productivo.
- Contenido NSFW explícito: el modelo está diseñado para generar material para adultos; requiere verificación de edad, control de acceso y cumplimiento de la legislación aplicable.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o anatomías incorrectas, especialmente en clips largos.
- Sesgos: no se documentan evaluaciones de sesgo; los datasets de fine-tune NSFW pueden amplificar sesgos de representación corporal y de género.
- Idiomas: no se especifica qué idiomas admiten los prompts; la documentación está en inglés y no hay garantía de comportamiento en castellano.
- Requisitos de hardware elevados: 261 GB de repositorio y ~21 GB solo de pesos FP8 hacen inviable su ejecución en GPUs de gama baja sin cuantización agresiva.
- Guardrails limitados: la model card indica que existen protecciones contra contenido ilegal, pero el enfoque principal es NSFW, por lo que la moderación debe implementarse externamente.
- Fecha de creación futura (2026-11-02) y 0 descargas/0 likes: repositorio sin validación comunitaria; usar con cautela y verificar integridad de los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/Mrbluntec/LTX-2.3-uncensored-v1.4-FP8
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- LoRA Eros10: https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA DMD: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Workflow de ejemplo: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json
