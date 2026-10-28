# lantianws666/moss-chenbin-style

## Resumen

`lantianws666/moss-chenbin-style` es un adaptador LoRA de estilo para el modelo de difusión texto-a-imagen MOSS-Image-Base, publicado por el usuario lantianws666. No es un modelo completo: es un fichero de 141,8 MB en bf16 (`chenbin_style_v2_blush_1500step_rank32.safetensors`) que modifica el comportamiento del modelo base OpenMOSS-Team/MOSS-Image-Base para reproducir el trazo suave, la textura de acuarela de baja saturación, la piel translúcida y el rubor pálido característicos de la ilustradora Chenbin (鬼针草).

El adaptador se entrenó con 117 imágenes a 1024×1024 durante 1500 pasos, con rango y alpha 32, text encoder congelado y la herramienta ai-toolkit, en unos 55 minutos sobre una GPU H20 de 96 GB. La principal particularidad de uso es que no requiere trigger word: el estilo se aplica de forma automática al cargar el LoRA, y el autor documenta un peso recomendado de 0,8 junto con ajustes concretos de muestreo (CFG 3.0, sampler Euler, scheduler Simple, Skip Layer Guidance sobre la capa 22).

Su relevancia práctica es la de un adaptador ligero y de código abierto (Apache-2.0 según los metadatos) para quien ya trabaje con el pipeline MOSS-Image y quiera un acabado ilustrado concreto sin reentrenar nada. Conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que la propia model card restringe el uso comercial, lo que entra en contradicción con la etiqueta de licencia del repositorio (ver limitaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusion texto-a-imagen; archivo interno `moss_image` en `ModelConfig` |
| Parametros totales | No disponible para el modelo base; el adaptador usa rango 32 / alpha 32 y ocupa 141,8 MB en bf16 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (texto-a-imagen); resolucion de entrenamiento 1024×1024, uso recomendado de 1024×1024 a 1536×2048 |
| Tipos de cuantizacion | Pesos del adaptador en bf16; no se distribuye version cuantizada del LoRA; cuantizacion del modelo base no disponible |
| Idiomas soportados | No disponible (el text encoder de MOSS-Image queda congelado; no hay evaluacion multilingue publicada; la model card esta en ingles y chino) |
| Licencia | Apache-2.0 en los metadatos del repositorio; la model card indica "Commercial use: No" (contradiccion, ver limitaciones) |
| Formato de pesos | safetensors (bf16) |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base |
| Rank / alpha | 32 / 32 |
| Tamano del fichero | 141,8 MB |
| Resolucion de entrenamiento | 1024×1024 |
| Imagenes de entrenamiento | 117 |
| Pasos de entrenamiento | 1500 |
| Ajustes de inferencia recomendados | Peso LoRA 0,8; 30-50 pasos; CFG 3.0; sampler Euler; scheduler Simple; SLG `single_layers 22` (start 0.0, end 1.0); sin clip skip |

## Arquitectura y entrenamiento

El adaptador es un LoRA inyectado en las capas de atención/lineales del transformer de difusión de MOSS-Image, con rango 32 y alpha 32, entrenado en precisión bf16. El text encoder se mantuvo congelado, de modo que el adaptador solo desplaza la distribución visual (color, trazo, iluminación, textura) y no la comprensión del prompt. El autor utiliza `uncond_skip_layers: [22]` tanto en entrenamiento como en inferencia: se trata de Skip Layer Guidance, una técnica que aplica una segunda pasada incondicional saltándose determinadas capas para mejorar la coherencia estructural. La model card advierte de que desactivar SLG produce ruido de color.

El entrenamiento se realizó con ai-toolkit sobre 117 imágenes a 1024×1024, batch size 1, learning rate 1e-4, optimizador AdamW de 8 bits y 1500 pasos, con un tiempo total de aproximadamente 55 minutos en una H20 de 96 GB. No se documenta composición del dataset más allá del sesgo declarado hacia ropa blanca, ni se menciona RLHF, DPO ni ninguna otra fase de ajuste por preferencias, algo esperable en un adaptador de estilo. Tampoco se publican datos sobre el número de tokens de texto utilizados ni sobre el proceso de curado de las 117 imágenes.

## Capacidades

- Generación de imágenes en un estilo ilustrado concreto: línea fina y suave, acuarela de baja saturación, piel translúcida y rubor color sakura pálido.
- Aplicación automática del estilo sin trigger word: no hace falta añadir tokens especiales al prompt.
- Control de intensidad del estilo mediante el peso del LoRA, con una ventana útil documentada de 0,6 a 1,0 y punto óptimo en 0,8.
- Apilamiento con otros LoRA de personaje, reduciendo el peso de cada uno a 0,5-0,6 según recomienda el autor.
- Integración con el pipeline nativo `MOSSImagePipeline` mediante `ModelConfig` e `InferenceLoRA`.
- Compatibilidad con el Space de HuggingFace `mrfakename/moss-image` pasando el repo id en el campo `lora_repo`.
- No ofrece tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada ni procesamiento de audio o vídeo: es exclusivamente un adaptador de generación de imágenes.

## Casos de uso

- Ilustración editorial y de blog: generar cabeceras y viñetas con un acabado de acuarela suave y coherente entre artículos, usando CFG 3.0 y 30-50 pasos para mantener el detalle del trazo.
- Previsualización de personajes para novela ligera o manga: el LoRA proporciona una base de estilo estable sobre la que apilar un LoRA de personaje a 0,5-0,6 por adaptador, agilizando la iteración de diseño.
- Prototipado de arte conceptual para videojuegos de estética anime: generar variaciones a 1024×1536 en minutos para explorar paletas de baja saturación antes de encargar el arte final.
- Merchandising e impresión bajo demanda: la licencia permite vender imágenes generadas, por lo que el adaptador sirve para producir láminas y postales con estética pastel, siempre que se respete la restricción de uso comercial del modelo en sí.
- Aplicaciones de avatar y perfil: retratos de busto con rubor pálido y piel translúcida, un acabado que encaja con comunidades de ilustración y redes sociales de temática anime.
- Fanzines y publicaciones independientes: al permitir la fusión del LoRA con otros pesos, un colectivo puede construir una variante de estilo propia y distribuirla internamente para mantener la coherencia visual de la publicación.
- Investigación sobre adaptadores de estilo: con 117 imágenes, 1500 pasos y una configuración reproducible (rank 32, lr 1e-4, ai-toolkit), sirve como caso de estudio de bajo coste para analizar sobreajuste en LoRA de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, comparativas A/B ciegas) ni comparaciones cuantitativas con otros adaptadores de estilo.

## Requisitos de hardware

- VRAM para el adaptador: despreciable en sí misma, 141,8 MB en bf16; el consumo real lo determina el modelo base MOSS-Image-Base, cuyos requisitos no se detallan en la información disponible.
- Entrenamiento documentado: una sola H20 de 96 GB, 1500 pasos, batch 1, aproximadamente 55 minutos.
- GPU recomendadas: no disponibles para inferencia; el entrenamiento se validó en H20. No hay datos publicados sobre RTX 4090, A100 o H100 para este adaptador.
- Ajuste en GPU de consumo: no confirmado. El adaptador es minúsculo, pero la viabilidad depende por completo del tamaño y la cuantización del modelo base, dato no disponible.
- Opciones de despliegue: `MOSSImagePipeline` de la librería diffusers con `ModelConfig(arch="moss_image", dtype="bf16")` e `InferenceLoRA(strength=0.8)`; también el Space `mrfakename/moss-image` mediante el campo `lora_repo`. No se proporciona GGUF ni versión para llama.cpp, Ollama o ComfyUI.
- Latencia y throughput: no disponibles. El coste por imagen vendrá marcado por los 30-50 pasos de muestreo y el CFG 3.0 recomendados sobre el modelo base.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros adaptadores de estilo comparables para MOSS-Image ni se dispone de datos de terceros que permitan una comparación cuantitativa.

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moss-chenbin-style (este) | LoRA de estilo sobre MOSS-Image-Base | Rango 32; fichero de 141,8 MB | Entrenado a 1024×1024; uso hasta 1536×2048 | Apache-2.0 en metadatos, "Commercial use: No" en la model card | HuggingFace, 0 descargas, 0 likes |
| Otros LoRA de estilo para MOSS-Image | No disponible | No disponible | No disponible | No disponible | No disponible |
| LoRA de estilo para otras familias de difusion (SDXL, Flux) | No equivalente: requiere otro modelo base | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Contradicción de licencia: los metadatos del repositorio declaran Apache-2.0, pero la model card indica explícitamente "Commercial use: No". Antes de un uso en producción hay que aclarar esta discrepancia con el autor; la lectura conservadora es que el modelo no admite uso comercial, aunque sí permite fusionarlo y vender las imágenes generadas.
- Sesgo hacia el blanco: el conjunto de entrenamiento está sesgado hacia ropa blanca, por lo que las escenas predominantemente blancas pueden sobreexponerse.
- Generación no solicitada de medias: el modelo tiende a añadir pantis o medias de forma automática; hay que eliminarlo con prompts negativos.
- Texturas finas: entrenado a 1024 px, no puede renderizar tramas de malla o encaje de medias; el propio autor lo justifica como coherente con el estilo impresionista del referente.
- Sensibilidad a los hiperparámetros: pesos de 1,0 sobreexponen, por debajo de 0,65 el estilo se desvanece, CFG superior a 5 sobresatura y menos de 30 pasos pierde detalle en cabello y encaje. SLG debe permanecer activo (capa 22) o aparecen artefactos de color.
- Dataset muy reducido: 117 imágenes implican riesgo de sobreajuste a la paleta y composición concretas del corpus, con poca diversidad de sujetos y escenas.
- Dominio estrecho: es un LoRA de estilo ilustrado/anime; no está pensado para fotorrealismo, tipografía, diagramas ni escenas técnicas.
- Sin evaluación objetiva: no hay benchmarks, comparativas ciegas ni informes de sesgos demográficos; la calidad se documenta solo mediante imágenes de muestra.
- Idiomas no verificados: se desconoce el comportamiento con prompts en castellano; el text encoder está congelado y no se ha evaluado su cobertura lingüística.
- Madurez y soporte: repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-10-28 según los metadatos; sin histórico de mantenimiento ni issues.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar anatomía incorrecta, manos deformes o detalles incoherentes, especialmente con pesos altos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lantianws666/moss-chenbin-style
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Space de referencia para el pipeline: https://huggingface.co/spaces/mrfakename/moss-image (referenciado en la model card como `mrfakename/moss-image`)
- Página de Civitai del autor: mencionada en la model card, sin URL en la información disponible
- Herramienta de entrenamiento ai-toolkit: mencionada en la model card, sin URL en la información disponible
- Busqueda web: no se han encontrado enlaces relevantes al modelo, papers ni demos en los resultados proporcionados.
