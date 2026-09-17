# realrebelai/FastH3-V2_GGUFs

## Resumen

FastH3-V2_GGUFs es un repositorio de cuantizaciones en formato GGUF del modelo de generación de vídeo **FastVideo FastH3 8-Step V2**, publicado por el usuario realrebelai (RealRebelAI) el 16 de septiembre de 2026. No se trata de un modelo nuevo: es una conversión de los pesos completos del transformador en BF16 liberados por FastVideo, reconstruidos y transformados al formato de tensores que espera ComfyUI antes de aplicar la cuantización. La model card insiste en un punto relevante: **no** son cuantizaciones del checkpoint "pruned" de ComfyUI, sino de los pesos oficiales completos.

El modelo subyacente es FastH3 8-Step V2, un checkpoint destilado de MiniMax-H3 que genera vídeo y audio sincronizados con solo **8 pasadas del transformador** (8 pasos de difusión). La arquitectura declarada es MiniMax-H3 de 35B parámetros, con destilación Data-Free DMD2 y atención dispersa VSA-H3 con un 80 % de dispersión. El repositorio de pesos pesa 19,8 GB y acumula 18 descargas y 8 "likes" en el momento de redactar esta ficha.

Su relevancia práctica es acotada pero clara: permite ejecutar un modelo de texto-a-vídeo de 35B con audio sincronizado en ComfyUI sobre hardware de consumo, siempre que se acepten las pérdidas de calidad de las cuantizaciones de 3 a 5 bits y se disponga de los modelos auxiliares (codificador de texto Qwen3-VL y los dos VAE de MiniMax-H3).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo y audio (MiniMax-H3), con 50 bloques principales, bloques token refiner, proyecciones QKV fusionadas, MLP SwiGLU, proyecciones AdaLN, proyecciones de vídeo/audio/condicionamiento, time embeddings y RoPE; atención dispersa VSA-H3 |
| Parámetros totales | 35.049.751.312 (≈35B), dato real de safetensors del modelo base |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se documenta resolución, duración ni número de fotogramas soportados) |
| Tipos de cuantización | GGUF Q3_K_M, Q4_K_M y Q5_K_M; tensores de proyección y condicionamiento conservados en F16/F32 |
| Idiomas soportados | No disponible |
| Licencia | other (otra); los términos concretos no están detallados en la información disponible |
| Formato de pesos | GGUF (transformador cuantizado); el modelo original se distribuye como checkpoint BF16 fragmentado en shards |
| Pipeline declarado | text-to-video |
| Librería | comfyui (requiere ComfyUI-GGUF) |
| Modelo base | FastVideo/FastVideo-FastH3-8-Step-V2 |
| Tamaño del repositorio | 19,8 GB |
| Fecha de publicación | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del MiniMax-H3 en su variante FastH3: un transformer de difusión de 35B parámetros organizado en 50 bloques principales más bloques de refinado de tokens, con proyecciones QKV fusionadas, MLP SwiGLU, proyecciones AdaLN y capas de proyección separadas para vídeo, audio y condicionamiento. La innovación central es la atención dispersa **VSA-H3** (`to_gate_compress`), que según la model card opera con un 80 % de dispersión, más VSA patches específicos. El modelo genera simultáneamente pistas de vídeo y de audio.

El checkpoint V2 es un destilado de MiniMax-H3 obtenido mediante **Data-Free DMD2**, una técnica de destilación por matching de distribución que no requiere datos reales de entrenamiento, y está optimizado para funcionar en 8 pasos (8 pasadas del transformador). El repositorio en sí no entrena nada: reconstruye el transformador completo desde el BF16 oficial, lo convierte al layout de ComfyUI y aplica cuantización GGUF, preservando en F16/F32 los tensores de alta precisión (proyecciones, condicionamiento y embeddings temporales) en lugar de cuantizarlos indiscriminadamente. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante un único prompt.
- Generación de audio sincronizado con el vídeo, siempre que se instale el Audio VAE de MiniMax-H3.
- Generación en 8 pasos de difusión (8 pasadas del transformador), lo que reduce drásticamente el coste de inferencia frente a modelos de decenas de pasos.
- Soporte de prompt negativo y parámetros de muestreo configurables a través del flujo de trabajo de ComfyUI.
- Integración con el ecosistema ComfyUI/ComfyUI-GGUF mediante loaders de modelo de difusión en formato GGUF.
- Codificación de texto delegada a un codificador externo Qwen3-VL de 32B (versión MiniMax-H3 específica, disponible en Q2_K y Q4_K_M en el repositorio MiniMax-H3_GGUFs del mismo autor).
- Tool calling / function calling: no aplica, es un modelo generativo de vídeo, no un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no documentadas para este repositorio; dependen en todo caso del codificador de texto Qwen3-VL.
- Modos especiales (thinking, visión, audio de entrada): no disponibles; la única modalidad especial confirmada es la salida de audio sincronizado.

## Casos de uso

- **Previz y storyboard animado en publicidad**: generar clips cortos con audio de referencia en 8 pasos permite iterar sobre el guion visual en minutos en lugar de horas, usando el modelo como herramienta de previsualización antes de producir con render real.
- **Prototipado rápido en ComfyUI para artistas técnicos**: la integración nativa con ComfyUI-GGUF permite encadenar FastH3 con el resto de nodos del grafo (upscalers, interpoladores, postproceso) sin salir del entorno.
- **Generación local de vídeo con audio en estaciones de trabajo con GPU de consumo**: la cuantización Q3_K_M está pensada explícitamente como la opción de menor consumo de VRAM/RAM, lo que habilita ejecución en GPU de 24 GB con offload parcial.
- **Investigación sobre destilación DMD2 y atención dispersa**: al conservar la estructura VSA-H3 y las proyecciones en alta precisión, el GGUF sirve para estudiar el impacto de la cuantización en un modelo destilado con un 80 % de dispersión de atención, comparando Q3_K_M, Q4_K_M y Q5_K_M contra el BF16 original.
- **Producción de contenido para redes sociales**: clips cortos con audio integrado generados en 8 pasos encajan en flujos de publicación rápida donde el coste por iteración es el factor limitante.
- **Cinemáticas provisionales en desarrollo de videojuegos**: sustituir placeholders por vídeo generado con audio durante las fases de diseño de niveles o pitching, antes de comprometer recursos de arte final.
- **Evaluación comparativa de cuantizaciones para pipelines de difusión**: el repositorio ofrece tres niveles de compresión del mismo transformador, lo que permite medir empíricamente la relación entre bits por peso y calidad subjetiva en un modelo de 35B.
- **Despliegue en entornos con restricciones de almacenamiento**: el formato GGUF y la compresión a 3-5 bits reducen un checkpoint BF16 de ~70 GB a un rango manejable para discos y nodos de cómputo modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, IS, MOS, latencia medida) ni comparaciones numéricas con otros modelos de vídeo. Tampoco se documentan resoluciones, duraciones o número de fotogramas de las muestras de demostración.

| Cuantización | Descripción declarada por el autor |
|---|---|
| Q3_K_M | Opción de menor consumo de VRAM/RAM; máxima compresión |
| Q4_K_M | Equilibrio recomendado entre tamaño y calidad |
| Q5_K_M | Mayor calidad, con requisitos de memoria superiores |

## Requisitos de hardware

Las cifras de esta sección son **estimaciones aritméticas** derivadas del recuento de parámetros (35.049.751.312) y de los bits por peso habituales de cada variante GGUF. El autor no publica requisitos oficiales de VRAM, por lo que deben tomarse como orientativas.

- Transformador cuantizado, peso aproximado sobre disco/VRAM:
  - Q3_K_M: ~15 GB (≈3,5 bits por peso).
  - Q4_K_M: ~20 GB (≈4,5 bits por peso).
  - Q5_K_M: ~24 GB (≈5,5 bits por peso).
  - BF16 original: ~70 GB.
- Modelos auxiliares obligatorios, que se suman al presupuesto anterior: codificador de texto Qwen3-VL 32B en GGUF (Q2_K ≈11-12 GB, Q4_K_M ≈19-20 GB, según el repositorio MiniMax-H3_GGUFs), MiniMax-H3 Video VAE y MiniMax-H3 Audio VAE (tamaños no disponibles en la información proporcionada).
- GPU recomendadas: para Q4_K_M y Q5_K_M sin offload, GPU de 40-80 GB (A100 40/80 GB, H100 80 GB). Para Q3_K_M con offload parcial, RTX 3090 o RTX 4090 de 24 GB; RTX 5090 de 32 GB ofrece más margen.
- Viabilidad en GPU de consumo: Q3_K_M es la única variante con opciones realistas en 24 GB, y solo con descarga secuencial de bloques a RAM/CPU y contando además con el codificador de texto y los VAE. Los 50 bloques del transformador y las activaciones de atención dispersa condicionan el pico de memoria.
- Opciones de despliegue: ComfyUI con la extensión ComfyUI-GGUF es la vía documentada. El modelo se coloca en `ComfyUI/models/diffusion_models/`, el codificador en `ComfyUI/models/text_encoders/` y los VAE en el directorio correspondiente. vLLM, TGI y llama.cpp no aplican a este tipo de modelo de difusión.
- Parámetros de generación recomendados por el autor: 8 pasos, sampler Euler, scheduler Simple, denoise 1.0 y un shift del scheduler de vídeo de 10 (el usado por el checkpoint oficial de FastVideo).
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por clip ni de clips por segundo en ninguna configuración de hardware.
- Nota de compatibilidad: si se usa la ruta de arquitectura WAN con codificador GGUF, hay que emplear los codificadores Qwen3-VL específicos de MiniMax-H3 del repositorio del autor, no un Qwen3-VL GGUF genérico.

## Comparativa con modelos similares

No hay datos de rendimiento que permitan comparar este modelo con alternativas de terceros (Wan, HunyuanVideo, LTX-Video u otros), por lo que la comparación se limita a las variantes del propio repositorio y a su modelo base, para el que sí hay información.

| Modelo / variante | Parámetros | Formato | Pasos | Audio sincronizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FastH3-V2 Q3_K_M | ~35B | GGUF ~3,5 bits | 8 | Sí (requiere Audio VAE) | other | HuggingFace, 16-09-2026 |
| FastH3-V2 Q4_K_M | ~35B | GGUF ~4,5 bits | 8 | Sí (requiere Audio VAE) | other | HuggingFace, 16-09-2026 |
| FastH3-V2 Q5_K_M | ~35B | GGUF ~5,5 bits | 8 | Sí (requiere Audio VAE) | other | HuggingFace, 16-09-2026 |
| FastVideo-FastH3-8-Step-V2 (base) | 35.049.751.312 | BF16 safetensors (shards) | 8 | Sí | other | HuggingFace |

Comparativa con modelos de vídeo de otras familias: no disponible en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no soporta tool calling, agentes, razonamiento multi-paso ni generación de código. Cualquier expectativa en ese sentido es un error de categoría.
- **Artefactos visuales y de audio**: al ser un modelo de difusión cuantizado a 3-5 bits, cabe esperar degradación de detalle, incoherencias temporales y desincronización labial, especialmente en Q3_K_M. No hay evaluación publicada que cuantifique esta degradación.
- **Riesgo de alucinación visual**: el modelo puede generar elementos no solicitados en el prompt o ignorar partes de este; no hay métricas de adherencia al prompt en la información disponible.
- **Sesgos**: la composición del dataset de entrenamiento del modelo base no está documentada en este repositorio, por lo que los sesgos demográficos y estilísticos no son evaluables.
- **Licencia**: tanto este repositorio como el modelo base declaran `license: other`. No se detallan los términos, por lo que **el uso comercial no puede darse por permitido** sin revisar la licencia original de FastVideo/MiniMax-H3 y la de los modelos auxiliares (Qwen3-VL, VAE de Comfy-Org).
- **Licencias en cascada**: el pipeline completo depende de un codificador de texto Qwen3-VL y de dos VAE, cada uno con su propia licencia y condiciones de uso.
- **Dependencia de terceros**: requiere ComfyUI con ComfyUI-GGUF y una implementación funcional de MiniMax-H3 en ComfyUI; la propia model card advierte que los ajustes exactos del flujo de trabajo dependen de la implementación y de los parches de atención/VSA que se apliquen.
- **Incompatibilidad declarada**: estos GGUF no son cuantizaciones del checkpoint pruned de ComfyUI; mezclarlos con flujos pensados para ese checkpoint puede dar resultados incorrectos.
- **Validación comunitaria mínima**: 18 descargas y 8 "likes" en el momento de redactar la ficha; no hay informes independientes de calidad ni de estabilidad.
- **Límites de contexto no documentados**: se desconoce la resolución, duración máxima y número de fotogramas soportados; usar el modelo fuera del rango de entrenamiento probablemente produzca degradación.
- **Idiomas no documentados**: la capacidad multilingüe del prompt depende del codificador Qwen3-VL, pero no está verificada para este pipeline.
- **Conversión no auditada**: el autor reconstruyó manualmente el transformador desde el BF16 fragmentado antes de cuantizar; aunque declara preservar todas las capas relevantes, no se aporta una verificación numérica de equivalencia frente al original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/realrebelai/FastH3-V2_GGUFs
- Modelo base: https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2
- Codificadores Qwen3-VL específicos de MiniMax-H3 (GGUF): https://huggingface.co/realrebelai/MiniMax-H3_GGUFs/tree/main
- VAE oficiales de MiniMax-H3 para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/vae
- GitHub del autor: https://github.com/RealRebelAI
- Perfil de HuggingFace del autor: https://huggingface.co/realrebelai
- YouTube del autor: https://www.youtube.com/@RealRebelAI
- Civitai del autor: https://civitai.com/user/RealRebelAI
- X (Twitter) del autor: https://x.com/realrebelai
- Vídeo de demostración 1: https://cdn-uploads.huggingface.co/production/uploads/68761990332d15464ccc8dee/jETADdbr0f0eBOwNu4tSE.mp4
- Vídeo de demostración 2: https://cdn-uploads.huggingface.co/production/uploads/68761990332d15464ccc8dee/tEUvlZ5fCp6XzCGm7SC6o.mp4
- Vídeo de demostración 3: https://cdn-uploads.huggingface.co/production/uploads/68761990332d15464ccc8dee/2tbDkQ8DhkWC8kD7fTfvX.mp4
- Búsqueda web: los resultados devueltos no contienen información relevante sobre este modelo (foros generalistas sin relación con FastH3, MiniMax-H3 ni FastVideo), por lo que no se aportan enlaces adicionales.
