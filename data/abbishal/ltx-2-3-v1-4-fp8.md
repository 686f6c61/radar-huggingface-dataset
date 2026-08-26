# abbishal/LTX-2.3-v1.4-FP8

## Resumen

LTX-2.3-v1.4-FP8 es una cuantización FP8 del modelo de generación de vídeo LTX-2.3 de Lightricks, publicada por el usuario abbishal. Se trata de una versión modificada que integra tres LoRAs horneados en los pesos: Eros10 NSFW (para contenido adulto de alta calidad), DMD Distilled (para generación en 4-8 pasos con mejor seguimiento de instrucciones) y el ICLoRA Detailer oficial de LTX (para mayor adherencia a imágenes de referencia). El resultado es un modelo de vídeo con audio sincronizado, capaz de operar en modos texto-a-vídeo, imagen-a-vídeo, vídeo-a-vídeo y audio-a-vídeo, con soporte de hasta 960 fotogramas (aproximadamente 40 segundos).

El modelo se basa en la arquitectura Diffusion Transformer (DiT) de LTX-2.3, con 21.005 millones de parámetros. Su relevancia radica en que ofrece generación de vídeo de calidad comercial (según el repositorio oficial, comparable a Google Veo 3) con pesos abiertos, aunque la licencia de esta versión concreta figura como "unknown", lo que limita su uso comercial sin verificación legal. Está pensado para entornos de inferencia local con GPUs de gama alta, y se distribuye en formato GGUF y FP8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parametros totales | 21.005.004.544 (21,0 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (soporta hasta 960 fotogramas de vídeo, ~40 s) |
| Tipos de cuantizacion | FP8, GGUF (varias precisiones) |
| Idiomas soportados | no disponible |
| Licencia | unknown |
| Formato de pesos | GGUF, FP8 (safetensors) |

## Arquitectura y entrenamiento

LTX-2.3 es un modelo de difusión basado en transformer (DiT) diseñado para generación de vídeo con audio sincronizado. La versión v1.4 aquí descrita parte de los pesos de Lightricks/LTX-2.3 y les incorpora tres LoRAs fundidos en los pesos: Eros10 NSFW (fuerza 1.0), DMD Distilled (fuerza 1.0) y LTX Video ICLoRA Detailer (fuerza 0.6). El LoRA DMD permite reducir los pasos de muestreo a 4-8, frente a los 20-30 habituales, manteniendo calidad. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de destilación más allá de lo indicado en la model card.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado.
- Generación de vídeo a partir de imagen inicial (image-to-video) preservando la identidad del sujeto.
- Transformación de vídeo a vídeo (video-to-video) y de audio a vídeo (audio-to-video).
- Modos adicionales: FL2VA (primer y último fotograma a vídeo), T2VA (texto a vídeo con audio), I2VA (imagen a vídeo con audio), REF2VA (referencia a vídeo con audio).
- Generación en 4-8 pasos (recomendado 8 para mejor calidad).
- Soporte de secuencias largas: hasta 960 fotogramas (~40 segundos).
- Control de movimiento y audio mediante el parámetro CFG (valores bajos para escenas íntimas, altos para acción y diálogo).
- Contenido NSFW (sin censura) con guardrails para impedir material ilegal.

## Casos de uso

- Creación de contenido para plataformas de entretenimiento para adultos: el modelo permite generar escenas personalizadas a partir de prompts detallados, con audio sincronizado y control de estilo mediante CFG.
- Producción de vídeo independiente y cine de bajo presupuesto: se puede usar para generar tomas de relleno, transiciones o secuencias completas con calidad cinematográfica, reduciendo costes de rodaje.
- Prototipado rápido de anuncios y campañas publicitarias: con 4-8 pasos se obtienen vídeos de prueba en segundos, ideales para validar conceptos antes de la producción final.
- Investigación en generación de vídeo con modelos de difusión: al ser de código abierto y cuantizado, permite estudiar el comportamiento de DiT en tareas multimodales sin necesidad de infraestructura masiva.
- Generación de vídeo con audio para proyectos de arte digital y NFT: la sincronización de audio y vídeo abre posibilidades en instalaciones interactivas y obras generativas.
- Aumento de datos para entrenamiento de otros modelos: los vídeos generados pueden servir como dataset sintético para tareas de visión por computador o aprendizaje multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo FP8 con 21 B parámetros requiere aproximadamente 21 GB solo para los pesos, más overhead de activaciones y memoria intermedia. Se recomienda al menos 24 GB de VRAM para FP8.
- En cuantización GGUF Q4 (aproximadamente 11 GB), podría ejecutarse en GPUs con 12-16 GB de VRAM, aunque con menor calidad.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 6000 Ada, A100 (40/80 GB), H100 (80 GB) para FP8. Para GGUF Q4, una RTX 4070 Ti (12 GB) o RTX 3090 (24 GB) pueden ser suficientes.
- Opciones de despliegue: ComfyUI (con nodos LTX), llama.cpp para GGUF (aunque orientado a texto, puede usarse para vídeo con adaptaciones), y pipelines propios basados en el repositorio oficial de LTX.
- Latencia y throughput: no disponibles. Se estima que con 8 pasos y una RTX 4090, la generación de un vídeo de 5 segundos (121 fotogramas) puede tardar entre 1 y 3 minutos, dependiendo de la resolución y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.3-v1.4-FP8 (este) | 21 B | hasta 960 frames | unknown | HuggingFace |
| LTX-2.3 (Lightricks) | 21 B | hasta 960 frames | open weights (LTX) | HuggingFace, ltx.io |
| LTX-2.5 (Lightricks) | no disponible | no disponible | open weights | ltx.io |
| Google Veo 3 | no disponible | no disponible | propietaria | API cerrada |

No se dispone de datos de rendimiento comparativos entre estos modelos. El repositorio GitHub de LTX-2.3 afirma que la calidad es comparable a Veo 3, pero sin métricas publicadas.

## Limitaciones y advertencias

- Licencia "unknown": no se puede garantizar el uso comercial sin una revisión legal. El modelo base de Lightricks tiene su propia licencia, pero esta versión modificada no la especifica.
- Contenido NSFW: el modelo está diseñado para generar contenido para adultos. Aunque incluye guardrails para impedir material ilegal, el uso indebido puede violar normativas locales.
- Riesgo de alucinaciones visuales: como todo modelo generativo, puede producir inconsistencias en objetos, rostros o movimientos, especialmente en secuencias largas.
- Sesgos: al estar entrenado con datos de internet, puede reflejar sesgos de género, raza o cultura en los vídeos generados.
- Requisitos de hardware elevados: la versión FP8 necesita al menos 24 GB de VRAM, lo que excluye a GPUs de consumo de gama baja.
- Sin soporte oficial: al ser una modificación de terceros, no hay garantía de mantenimiento ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbishal/LTX-2.3-v1.4-FP8
- Modelo base Lightricks/LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Cuantización FP8 oficial de Lightricks: https://huggingface.co/Lightricks/LTX-2.3-fp8
- Repositorio similar de ChrisColeTech: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-v1.4-fp8
- Página oficial de LTX-2.3: https://ltx.io/model/ltx-2-3
- Repositorio GitHub de LTX-2.3: https://github.com/desktop-LTX/LTX-2.3
