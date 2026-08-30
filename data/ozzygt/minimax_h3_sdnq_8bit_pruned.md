# OzzyGT/MiniMax_H3_sdnq_8bit_pruned

## Resumen

MiniMax_H3_sdnq_8bit_pruned es una versión cuantizada a INT8 del modelo MiniMax-H3, desarrollada por OzzyGT mediante la técnica SDNQ (SD.Next Quantization) con opción dinámica y rotación de Hadamard. El modelo base, MiniMax-H3, es un sistema generativo omni-modal creado por MiniMax que unifica comprensión y generación de texto, imagen, vídeo y audio, permitiendo generar vídeo con audio estéreo nativo de hasta 2K de resolución y 15 segundos de duración. Esta versión cuantizada reduce drásticamente los requisitos de memoria y almacenamiento, manteniendo la funcionalidad completa del modelo original.

El repositorio contiene únicamente los pesos del transformer podado, con aproximadamente 20 100 millones de parámetros (frente a los 33 000 millones del transformer original, de los cuales unos 13 000 millones corresponden a ramas AdaLN que se eliminan para inferencia). El resto de componentes (text encoder, VAEs y schedulers) se cargan desde el repositorio complementario OzzyGT/MiniMax_H3_sdnq_dynamic_8bit. La cuantización INT8, junto con la poda de las ramas AdaLN, permite ejecutar el modelo en hardware de consumo, algo inviable con los pesos originales en bf16 (que ocupan más de 400 GB). Esta ficha es relevante para desarrolladores que necesitan desplegar generación de vídeo con audio en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer omni-modal con AdaLN (ramas podadas) |
| Parámetros totales | 20 127 767 432 (solo transformer podado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta vídeo de hasta 15 s a 2K) |
| Tipos de cuantización | INT8 (SDNQ dinámico con rotación de Hadamard) |
| Idiomas soportados | Inglés (en) |
| Licencia | minimax-h3-community-license-agreement (otra) |
| Formato de pesos | safetensors (requiere SDNQ v0.2.2+ y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 emplea un transformer omni-modal con módulos de modulación adaptativa (AdaLN) que condicionan la generación a partir de texto, imagen, vídeo o audio. Según los autores, aproximadamente 13 000 millones de los 33 000 millones de parámetros del transformer residen en ramas AdaLN cuyas salidas pueden precomputarse y cachearse, por lo que no es necesario cargarlas para inferencia. Esta versión cuantizada elimina dichas ramas, reduciendo el peso a unos 20 000 millones de parámetros, y aplica cuantización INT8 dinámica con rotación de Hadamard mediante SDNQ para comprimir aún más el modelo.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El repositorio se limita a la cuantización y poda del modelo original, sin modificar sus capacidades funcionales. La cuantización se realiza con SDNQ, que aplica una rotación de Hadamard para reducir el error de cuantización y una escala dinámica por canal, preservando la calidad de generación en la práctica.

## Capacidades

- Generación de vídeo con audio sincronizado: el modelo produce vídeo y pista de audio estéreo de forma conjunta, como se muestra en los ejemplos del repositorio.
- Text-to-video (T2V): genera vídeo a partir de descripciones textuales detalladas, incluyendo instrucciones temporales y diálogos.
- Image-to-video (I2V) y reference-to-video (Ref2V): permite partir de una imagen o referencia para generar secuencias animadas.
- Text-to-image (T2I): aunque es un modelo de vídeo, también puede generar imágenes estáticas, como se documenta en la comunidad.
- Comprensión multimodal: entiende contextos que combinan texto, imagen, vídeo y audio, lo que permite prompts complejos con referencias cruzadas.
- Generación de audio nativo: el audio se genera junto con el vídeo, incluyendo voces, efectos y música, sin necesidad de un modelo de TTS separado.
- Soporte de workflows modulares: mediante `workflow="t2va"`, `"fl2va"` o `"ref2va"` se cargan solo las particiones necesarias para cada tarea, optimizando el uso de memoria.

## Casos de uso

- Creación de contenido para redes sociales: generar clips cortos con audio sincronizado (por ejemplo, un gato cocinando) para plataformas como TikTok o Instagram, usando prompts descriptivos con instrucciones temporales.
- Doblaje y localización de vídeo: el modelo puede generar vídeo con diálogos en inglés, permitiendo crear versiones localizadas de anuncios o tutoriales sin necesidad de estudio de grabación.
- Prototipado de storyboards animados: cineastas y diseñadores pueden generar animaciones preliminares con audio para validar conceptos antes de la producción final.
- Generación de material educativo: crear vídeos explicativos con narración y efectos visuales a partir de guiones de texto, reduciendo costes de producción.
- Publicidad programática: generar anuncios personalizados en tiempo real según el contexto del usuario, gracias a la capacidad de generar vídeo y audio de forma conjunta.
- Asistentes virtuales con respuesta audiovisual: integrar el modelo en chatbots o agentes que respondan con vídeo y voz, mejorando la experiencia de usuario en atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas cuantitativas (como FVD, CLIP score o MOS de audio) que permitan comparar objetivamente la calidad de esta versión cuantizada frente al modelo original. Los únicos datos disponibles son ejemplos cualitativos en vídeo que muestran la generación con la misma semilla y pasos, comparando la versión INT8 con la INT4.

## Requisitos de hardware

- VRAM estimada: no se especifica un valor exacto, pero al ser INT8 y con las ramas AdaLN podadas, el modelo requiere significativamente menos memoria que el original en bf16 (que necesita más de 400 GB de almacenamiento y no cabe en GPUs de consumo). Con 20 000 millones de parámetros en INT8, se estima que la inferencia puede realizarse con 16-24 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: se puede ejecutar en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), así como en GPUs profesionales como A100 o H100. El artículo de Civitai menciona que el modelo original no corre en una mini-PC con 128 GB de memoria unificada en bf16, pero esta versión cuantizada sí es viable en ese tipo de hardware.
- Opciones de despliegue: el modelo se integra con la librería `diffusers` mediante `ModularPipeline`, y requiere SDNQ v0.2.2+ para cargar los pesos cuantizados. Se recomienda usar group offloading (bloque a nivel de transformer y hoja a nivel de text encoder y VAE) para reducir el pico de VRAM. También se pueden usar scripts de `diffusers-recipes` para gestión automática de offload.
- Latencia y throughput: no se proporcionan datos. La generación de 175 frames a 864x480 con 20 pasos requiere varios minutos en una GPU de consumo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 (original) | 33B (69B total) | bf16 | Vídeo hasta 15 s a 2K | minimax-h3-community-license-agreement | HuggingFace (498 GB) |
| MiniMax_H3_sdnq_8bit_pruned (este) | 20B (podado) | INT8 | Igual que el original | minimax-h3-community-license-agreement | HuggingFace (46 GB) |
| MiniMax_H3_sdnq_4bit_pruned | 20B (podado) | INT4 | Igual que el original | minimax-h3-community-license-agreement | HuggingFace (tamaño menor) |

La versión INT8 ofrece un equilibrio entre calidad y requisitos de hardware, mientras que la INT4 reduce aún más el tamaño a costa de una posible pérdida de fidelidad. El modelo original en bf16 es la referencia de calidad, pero es inviable para la mayoría de entornos de producción. No se dispone de comparativas con otros modelos de generación de vídeo (como Sora, Runway o Pika) en la información proporcionada.

## Limitaciones y advertencias

- Licencia comunitaria: la licencia `minimax-h3-community-license-agreement` puede imponer restricciones de uso comercial. Es necesario revisar el texto completo de la licencia antes de desplegar el modelo en producción.
- Idioma: el modelo está entrenado principalmente en inglés; los prompts en otros idiomas pueden producir resultados de menor calidad o alucinaciones.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido visual o auditivo que no se corresponde con el prompt, especialmente en escenas complejas o con múltiples objetos.
- Pérdida de calidad por cuantización: la cuantización INT8 puede degradar ligeramente la fidelidad del vídeo y el audio en comparación con el modelo original, aunque los ejemplos mostrados indican una diferencia mínima.
- Dependencia de SDNQ: el modelo requiere la librería SDNQ v0.2.2+ y `trust_remote_code=True`, lo que implica ejecutar código remoto. Esto puede suponer un riesgo de seguridad en entornos corporativos.
- Almacenamiento y carga: el repositorio solo contiene los pesos del transformer; el resto de componentes se cargan desde otro repositorio, por lo que es necesario mantener la coherencia de versiones entre ambos.
- Sin soporte de fine-tuning: al estar podadas las ramas AdaLN, el modelo no es apto para fine-tuning; está diseñado exclusivamente para inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OzzyGT/MiniMax_H3_sdnq_8bit_pruned
- Repositorio del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio complementario (componentes): https://huggingface.co/OzzyGT/MiniMax_H3_sdnq_dynamic_8bit
- Versión INT4: https://huggingface.co/OzzyGT/MiniMax_H3_sdnq_4bit_pruned
- GitHub del modelo base: https://github.com/MiniMax-AI/MiniMax-H3
- GitHub de SDNQ: https://github.com/Disty0/sdnq
- Scripts de ejemplo (diffusers-recipes): https://github.com/asomoza/diffusers-recipes/blob/main/models/minimax_h3/README.md
- Artículo de Civitai sobre T2I con MiniMax H3: https://civitai.com/articles/33881/minimax-h3-4bit-t2i
