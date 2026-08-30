# Lopleec/Gepo-MCSkin-Pixel-EDM

## Resumen

Gepo MC Skin Pixel EDM es un modelo de difusión texto-imagen desarrollado por Lopleec que genera atlases de skin de Minecraft Java Edition en formato nativo de 64×64 píxeles RGBA a partir de descripciones en inglés. A diferencia de los modelos de difusión latente convencionales, este modelo opera directamente en el espacio de píxeles sin utilizar un VAE, lo que le permite preservar la estructura exacta del atlas UV de Minecraft. El texto se codifica mediante un CLIP ViT-L/14 congelado y se inyecta a través de cross-attention en un U-Net personalizado de 217,8 millones de parámetros. Diez canales espaciales fijos codifican la validez UV, las capas base y overlay, la identidad de las partes del cuerpo y la geometría Alex/Steve, lo que garantiza que la salida sea un atlas de skin válido y listo para usar en el juego.

El modelo se entrenó sobre un conjunto de datos privado de 105 000 pares texto-imagen, del cual se retuvieron 97 428 filas de entrenamiento tras un filtrado determinista de validez. La selección del checkpoint final se realizó mediante la pérdida EMA de validación, alcanzando un valor de 0,04206468362826854 en el paso 100 000. El modelo está pensado para investigación en generación estructurada de pixel-art y como punto de partida para fine-tuning en datos con licencia adecuada. Su licencia MIT permite uso comercial, aunque el conjunto de datos de entrenamiento no se distribuye públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 2D condicionado por cross-attention, difusión en espacio de píxeles con EDM |
| Parametros totales | 217 760 644 (solo U-Net entrenable; CLIP congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens CLIP (máximo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (U-Net en formato Diffusers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusión en espacio de píxeles con un denoiser `UNet2DConditionModel` de Diffusers. El texto se codifica con un CLIP ViT-L/14 congelado (revisión `32bd64288804d66eefd0ccbe215aa642df71cc41`) y se inyecta mediante cross-attention. Diez canales espaciales fijos se concatenan a la entrada del U-Net y codifican: validez UV, capas base y overlay, identidad de partes del cuerpo y geometría de brazos (Alex o Steve). El objetivo de entrenamiento es denoising EDM ponderado en el espacio de píxeles. El muestreador de inferencia usa 40 pasos Heun con classifier-free guidance de escala 5.0. No se utiliza VAE; la salida es directamente RGBA nativo. El entrenamiento se realizó sobre 97 428 pares texto-imagen (tras filtrar 4 560 imágenes con píxeles transparentes en regiones obligatorias de la capa base), con 1 506 filas de validación y 1 506 de test. No se aplicaron aumentos de datos (sin resize, crop, flip, ni jitter de color). Las captions son en inglés e incluyen explícitamente el tipo de modelo Alex o Steve.

## Capacidades

- Generación de atlases de skin de Minecraft Java Edition en 64×64 RGBA a partir de descripciones en inglés.
- Condicionamiento por tipo de geometría: Alex o Steve.
- Salida con restricciones duras de validez UV y alfa: el sampler aplica una máscara determinista que garantiza que la capa base sea opaca en las regiones requeridas y que las capas overlay se coloquen correctamente.
- Generación estructurada con canales de condicionamiento espacial fijos (validez UV, capas, partes del cuerpo, geometría).
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente generativo de imágenes.
- Capacidad multilingüe: no, solo inglés (las captions del entrenamiento son en inglés).
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Generación rápida de skins de Minecraft para jugadores: un usuario describe su personaje (p. ej., "forest ranger, green coat, brown boots") y el modelo produce un atlas 64×64 listo para subir al juego. Adecuado porque la salida es nativa y cumple las restricciones UV.
- Prototipado de personajes para servidores de Minecraft: los administradores pueden generar variaciones de skins para NPC o eventos temáticos sin necesidad de edición manual. El modelo permite generar múltiples variaciones con diferentes prompts y semillas.
- Investigación en generación estructurada de pixel-art: el modelo sirve como referencia para estudiar cómo condicionar la difusión en espacio de píxeles con restricciones geométricas fijas (UV, capas). Su arquitectura abierta y licencia MIT facilitan su uso como baseline.
- Fine-tuning sobre datos propios con licencia adecuada: el modelo está diseñado para ser inicializado y adaptado a conjuntos de datos específicos (p. ej., estilos artísticos concretos o nuevas geometrías). Su tamaño moderado (217M) permite fine-tuning en hardware de gama media.
- Generación de skins para mods o plugins: los desarrolladores pueden integrar el pipeline en herramientas de generación procedural para crear skins automáticamente según parámetros del juego. La salida en formato PNG atlas es directamente compatible.
- Evaluación de calidad de difusión en dominios restringidos: el modelo incluye un conjunto de evaluación fijo con 16 prompts, renderizados 3D y métricas estructurales, lo que permite comparar objetivamente variantes o mejoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o FID) en la información disponible. El autor reporta únicamente métricas de validación interna:

- Pérdida EMA de validación en el paso 100 000: 0,04206468362826854.
- Tasa media de base no opaca antes de aplicar restricciones: 0,047078 (es decir, el 4,7% de los píxeles de la capa base son transparentes en la salida bruta, lo que justifica la necesidad del post-procesado con restricciones duras).
- Evaluación cualitativa con 16 prompts fijos (8 Alex, 8 Steve) con semilla fija `20260830`, que confirma que las salidas restringidas son atlases RGBA válidos.

No se proporcionan comparaciones con otros modelos generativos de skins ni métricas perceptuales como FID o CLIP score.

## Requisitos de hardware

- El modelo tiene 217,8 millones de parámetros solo en el U-Net. En FP32, el peso ocupa aproximadamente 870 MB; en FP16, unos 435 MB. La salida es de 64×64 píxeles, por lo que el coste de activaciones es mínimo.
- Inferencia en CPU: posible, pero lenta (40 pasos Heun). Se recomienda al menos una GPU con 4 GB de VRAM para tiempos de generación razonables.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, RTX 3060, RTX 4090). El modelo cabe holgadamente en GPUs de consumo.
- Opciones de despliegue: el pipeline es personalizado y no es compatible con stock Stable Diffusion. Se proporciona un script `sample.py` que usa Diffusers. No se menciona soporte para vLLM, TGI, Ollama ni otros servidores de inferencia estándar; el despliegue se limita al código incluido en el repositorio.
- Latencia estimada: no se proporcionan datos oficiales. Con una GPU moderna (RTX 3090 o superior), 40 pasos Heun sobre 64×64 deberían completarse en menos de un segundo; en CPU podría tardar varios segundos o decenas de segundos.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros generadores de skins de Minecraft basados en difusión. Los generadores de imágenes genéricos (como Stable Diffusion) no son directamente comparables porque no producen atlases UV válidos ni respetan la geometría Alex/Steve. Existen servicios web como "AI Minecraft Skin Maker" (minecraftskinworld.com) que ofrecen generación de skins, pero no publican detalles técnicos ni pesos, por lo que no es posible una comparación rigurosa. En consecuencia, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Solo soporta inglés; las captions están en inglés y el codificador de texto es CLIP.
- El texto está limitado a 77 tokens CLIP; prompts más largos se truncan, lo que puede degradar la adherencia al prompt.
- Conceptos poco frecuentes y prompts compositivos largos pueden producir resultados débiles o con mala alineación.
- Aunque la salida restringida es un atlas UV válido, pueden aparecer caras débiles, costuras visibles, confusión entre frente y espalda, o micro-variaciones de color excesivas.
- El modelo no genera skins para Bedrock, capas ni formatos de alta definición no estándar.
- Riesgo de alucinación: como todo modelo generativo, puede inventar detalles no presentes en el prompt.
- El conjunto de datos de entrenamiento es privado y no se distribuye; la licencia MIT cubre los pesos y el software, pero no los datos.
- No debe usarse para suplantación de identidad, reclamación de propiedad sobre skins de terceros, personajes, logotipos o marcas.
- El modelo está pensado para investigación; su calidad perceptual no está completamente validada (el autor recomienda realizar evaluaciones adicionales como estudios ciegos con humanos antes de usarlo en producción).

## Enlaces

- HuggingFace: https://huggingface.co/Lopleec/Gepo-MCSkin-Pixel-EDM
- Repositorio GitHub: https://github.com/lopleec/Gepo-MCSkin-Pixel-EDM
