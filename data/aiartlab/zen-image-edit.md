# AiArtLab/zen-image-edit

## Resumen

Zen Image Edit es un pipeline de difusión para generación y edición de imágenes publicado por AiArtLab, un equipo pequeño que entrena modelos compactos en hardware de consumo. El modelo parte de Qwen-Image-2.1 (un transformer de difusión, DiT, de 32 capas y unos 7.270 millones de parámetros en fp16) y sustituye su codificador de texto nativo, Qwen3-VL-8B de 17,5 GB, por un Qwen3.5-0.8B de 1,7 GB más un adaptador de fusión de texto de 158 millones de parámetros insertado dentro del propio DiT. El resultado es una carpeta de diffusers autocontenida que cubre text-to-image, edición con una a tres imágenes de referencia y generación con transparencia RGBA real.

La relevancia técnica está en el ahorro de memoria sin reentrenar el generador: el adaptador se ajustó para reproducir la salida del codificador nativo con una similitud coseno de 0,95 en texto y 0,97 en las posiciones de visión de los prompts de edición. La revisión v12 del adaptador cubre 2304 posiciones en su tabla de atención y se entrenó a la geometría real de inferencia (condiciones de ~2000 tokens a 1024 px), lo que evita que las imágenes de referencia caigan en un relleno de ceros y mejora la fidelidad del condicionamiento visual.

El consumo pico declarado es de ~17,5 GB de VRAM, lo que lo sitúa en el rango de tarjetas de consumo de 24 GB. Se distribuye con licencia qwen-research, lo que condiciona su uso comercial, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) de Qwen-Image-2.1, 32 capas, con bloque de fusión de texto (adaptador de 158M) integrado; VAE de 16x de factor espacial |
| Parametros totales | 7.274.869.766 (según safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | tabla de posiciones del adaptador con 2304 slots; condiciones de ~2000 tokens en inferencia a 1024 px; no se especifica un máximo de tokens de prompt distinto |
| Tipos de cuantizacion | no disponible; el autor distribuye fp16 en todo el pipeline salvo el VAE, que va en fp32 |
| Idiomas soportados | no disponibles; los ejemplos de la model card están en inglés |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | safetensors (diffusers); DiT 14,5 GB fp16, codificador de texto 1,7 GB fp16, VAE fp32 |
| Codificador de texto | Qwen3.5-0.8B (nativo original: Qwen3-VL-8B, 17,5 GB) |
| Scheduler | FlowMatchEulerDiscreteScheduler con shift estático 5.0 (dynamic shifting desactivado) |
| Resolucion | parametro output_resolution, 1024 por defecto; sigue el aspect ratio de la imagen de condición |
| Tamano del repositorio | 28,0 GB |
| Descargas / likes | 102 descargas, 17 likes |

## Arquitectura y entrenamiento

El modelo conserva el backbone generativo de Qwen-Image-2.1: un transformer de difusión de 32 capas que ocupa 14,5 GB en fp16, acoplado a un VAE de factor espacial 16x que se mantiene en fp32 para no degradar la decodificación. La modificación estructural es el reemplazo del codificador de texto: en lugar de Qwen3-VL-8B, el pipeline usa Qwen3.5-0.8B (checkpoint re-guardado a fp16, con tokenizer y processor sin cambios) más un adaptador de 158 millones de parámetros que vive dentro del DiT como bloque de fusión de texto. Ese adaptador se entrenó para imitar la representación del codificador nativo, tanto a partir de texto plano como de texto leído junto con las imágenes de referencia, alcanzando una similitud coseno de 0,95 en texto y 0,97 en las posiciones de visión de los prompts de edición.

La revisión v12 del adaptador incorpora una tabla de posiciones en la rama de atención que cubre 2304 slots y se ajustó a la geometría real de inferencia (~2000 tokens de condición a 1024 px), de modo que las imágenes de referencia mantienen sus posiciones en lugar de desplazarse a una cola con relleno de ceros; según el autor, esto elevó la similitud coseno de visión de 0,93 a 0,97. El muestreo usa un shift estático de 5.0 en FlowMatchEulerDiscreteScheduler en vez del schedule con dynamic shifting del modelo original, y el autor incluye una prueba A/B (`--scheduler-test`) para comparar ambos schedules con la misma semilla. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de imagen a partir de texto (text-to-image) a 1024 px con 30 pasos de inferencia por defecto.
- Edición imagen a imagen con una sola imagen de condición: cambio de fondo manteniendo el sujeto.
- Edición con dos imágenes de condición: por ejemplo, sustituir un personaje conservando pose, ropa y escena de la imagen objetivo y copiando la identidad desde una referencia.
- Edición con tres imágenes de condición: objetivo y composición desde `<image1>`, identidad desde `<image2>`, color e iluminación desde `<image3>`.
- Convención de etiquetado explícita en el prompt mediante tags `<image1>`, `<image2>`, etc., con la primera imagen como objetivo de edición.
- Generación con transparencia real (RGBA), útil para assets con canal alfa.
- Control de resolución y relación de aspecto mediante `output_resolution`, `--size`, `--width` y `--height`.
- Prompt negativo y control de CFG (`--negative`, `--cfg`).
- Inferencia por lotes desde CLI leyendo un fichero de prompts (una línea por prompt, con comentarios y líneas en blanco ignoradas) cargando el pipeline una sola vez.
- Integración con ComfyUI mediante el nodo estándar que documenta la misma convención de orden de imágenes.
- No dispone de tool calling, agentes, modo thinking ni capacidades de audio: es un modelo generativo de imagen, no un modelo de lenguaje.

## Casos de uso

- Fotografía de producto en comercio electrónico: generar variantes de una misma pieza cambiando fondo, iluminación y contexto escénico a partir de una única foto de estudio, usando la imagen original como `<image1>` para conservar geometría y textura del producto.
- Assets con transparencia para diseño gráfico y web: generar directamente en RGBA para insertar sujetos recortados en maquetas, presentaciones o interfaces sin pasar por herramientas de segmentación externas.
- Sustitución de personajes en preproducción audiovisual: reemplazar la identidad de un actor o personaje de un storyboard manteniendo pose, vestuario y escena de la viñeta original, con la referencia de identidad en `<image2>`.
- Ilustración editorial y marketing: producir imágenes base con text-to-image a 1024 px y refinar después composición, color y luz con referencias adicionales, todo dentro del mismo pipeline.
- Armonización de composiciones multi-referencia: tomar la iluminación y la paleta de una imagen de referencia (`<image3>`) y aplicarlas a un sujeto ya compuesto, útil en retoque y postproducción.
- Automatización por lotes en pipelines de contenido: usar el modo CLI con fichero de prompts para generar catálogos completos de variaciones con una sola carga del modelo, reduciendo el coste de arranque frente a ejecuciones individuales.
- Prototipado e investigación en edición de imágenes con VRAM limitada: gracias al codificador de texto de 0,8B y al adaptador interno, el modelo evita los 17,5 GB del encoder nativo y permite experimentar en GPUs de 24 GB con `enable_model_cpu_offload()`.
- Evaluación de schedules de muestreo: la opción `--scheduler-test` permite comparar el shift estático 5.0 frente al dynamic shifting original con la misma semilla, útil para estudiar el efecto del schedule en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos cuantitativos aportados por el autor son métricas internas de fidelidad del condicionamiento, no comparables con benchmarks estándar de generación o edición:

| Metrica | Valor |
|---|---|
| Similitud coseno de texto frente al encoder nativo (Qwen3-VL-8B) | 0,95 |
| Similitud coseno de visión frente al encoder nativo (revisión v12 del adaptador) | 0,97 |
| Similitud coseno de visión en revisión previa | 0,93 |
| VRAM pico residente | ~17,5 GB |

## Requisitos de hardware

- VRAM pico declarada: ~17,5 GB en residente (DiT 14,5 GB fp16 + VAE fp32 + codificador de texto 1,7 GB); el propio autor advierte de que el DiT y el decodificador VAE en fp32 no co-residen en 32 GB, por lo que recomienda `enable_model_cpu_offload()`.
- GPU recomendadas por rango de memoria: RTX 4090 o RTX 3090 (24 GB) para uso local con offload; A100 40/80 GB o H100 para despliegue sin offload y por lotes.
- Cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090) y en tarjetas de 32 GB, en ambos casos con offload de CPU activado; en GPUs de 16 GB o menos no hay datos publicados y el offload sería obligatorio.
- Opciones de despliegue: diffusers con `custom_pipeline="pipeline"` y `trust_remote_code=True`, clonado del repositorio para usar `ZenImageEditPipeline` directamente, script `example.py` por línea de comandos y nodo estándar de ComfyUI. No aplican vLLM, llama.cpp ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La configuración de referencia de los ejemplos es de 30 pasos a 1024 px, con punto de partida típico (sujeto a la GPU y al uso de offload).

## Comparativa con modelos similares

Los datos de benchmarks y de alternativas no están disponibles en la información proporcionada, por lo que la comparación se limita a lo declarado por el autor para el modelo base.

| Modelo | Parametros | Codificador de texto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zen Image Edit (AiArtLab) | 7.274.869.766 (DiT + adaptador de 158M) | Qwen3.5-0.8B + adaptador interno, 1,7 GB fp16 | qwen-research | HuggingFace, diffusers, ComfyUI; 102 descargas y 17 likes |
| Qwen-Image-2.1 (modelo base) | DiT de 32 capas, 14,5 GB fp16; total no disponible | Qwen3-VL-8B nativo, 17,5 GB | no disponible en la información proporcionada | checkpoint upstream citado como base |
| Otras alternativas de edición de imagen | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia qwen-research: es una licencia de investigación, no una licencia permisiva estándar; el uso comercial queda restringido y debe revisarse el texto completo enlazado en el repositorio antes de cualquier despliegue en producción.
- Riesgo de alucinación visual: como modelo de difusión, puede introducir o eliminar detalles no solicitados y producir artefactos en manos, texto o estructuras finas, especialmente en ediciones complejas con varias referencias.
- Convención de orden de imágenes sensible a errores: la primera imagen es siempre el objetivo de edición; si se pasa primero la referencia, el modelo editará la referencia y el intercambio "no ocurrirá", según advierte el propio autor.
- El tamaño del lienzo se hereda del aspect ratio de la última imagen de la lista, no de la primera; hay que pasar `height` y `width` explícitos para fijarlo.
- Fidelidad del condicionamiento aproximada: el adaptador imita al encoder nativo con coseno 0,95 en texto y 0,97 en visión, lo que implica una desviación residual respecto al pipeline original de Qwen-Image-2.1.
- Idiomas no documentados: no hay lista oficial de idiomas soportados y todos los ejemplos publicados están en inglés; el comportamiento multilingüe de los prompts no está verificado.
- Sin benchmarks públicos: no hay resultados de MMLU, GenEval, HumanEval ni métricas equivalentes de edición que permitan comparar objetivamente con la competencia.
- Coste de descarga y almacenamiento elevado: 28 GB de repositorio, con el DiT en 14,5 GB fp16.
- El repositorio exige `trust_remote_code=True` para ejecutar el `pipeline.py` incluido, lo que implica ejecutar código del autor.
- No hay información sobre sesgos demográficos, sesgos de representación ni comportamiento del modelo ante prompts sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AiArtLab/zen-image-edit
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/AiArtLab/zen-image-edit-demo
- Licencia (LICENSE en el repositorio): https://huggingface.co/AiArtLab/zen-image-edit/blob/main/LICENSE
- Organización AiArtLab: https://aiartlab.org/
- Image Edit Arena (leaderboard de edición de imagen): https://arena.ai/leaderboard/image-edit
- Modelo base citado: Qwen/Qwen-Image-2.1
- Modelo base citado del codificador de texto: Qwen/Qwen3.5-0.8B
