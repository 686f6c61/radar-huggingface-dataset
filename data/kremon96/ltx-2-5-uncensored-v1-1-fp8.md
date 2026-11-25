# Kremon96/LTX-2.5-uncensored-v1.1-FP8

## Resumen

LTX-2.5-uncensored-v1.1-FP8 es una compilación pre-fusionada del modelo de generación de vídeo LTX Video-2.5 de Lightricks, publicada por el usuario Kremon96 en Hugging Face. El modelo integra cinco ajustes finos (LoRAs) directamente en los pesos: una LoRA NSFW denominada Eros10, una LoRA destilada DMD para acelerar la generación, dos LoRAs oficiales de contexto (IC-LoRA e IC-LoRA Detailer) y un adaptador Img2Vid. El resultado es un modelo de vídeo "todo en uno" que cubre text-to-video, image-to-video, video-to-video y audio-to-video con tan solo 4 pasos de inferencia en el mejor de los casos.

La relevancia de esta ficha radica en que se trata de un derivado no oficial de un modelo base propietario (Lightricks/LTX-2.5) con licencia desconocida, empaquetado en formato GGUF y FP8 para facilitar su despliegue en hardware de consumo. El modelo incorpora además un codificador de texto "Uncensored Gemma4 12B" con las proyecciones de LTX ya integradas, de modo que no requiere archivos adicionales para funcionar.

Con aproximadamente 21.000 millones de parámetros y un repositorio de 166,9 GB, el modelo está claramente orientado a creadores de contenido que necesitan generación de vídeo rápida y sin restricciones de contenido, no a aplicaciones empresariales con requisitos de cumplimiento normativo. La ausencia de una licencia explícita y la naturaleza NSFW de sus ajustes condicionan fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo basado en LTX Video-2.5 (transformer de difusión, detalles no disponibles) |
| Parametros totales | 21.004.025.600 (≈21,0 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 escalado (`fp8_scaled`), GGUF, codificador de texto en int8 |
| Idiomas soportados | No disponible |
| Licencia | Desconocida (`license: unknown`) |
| Formato de pesos | GGUF y FP8 (safetensors para el recuento de parámetros) |

## Arquitectura y entrenamiento

El modelo se construye sobre LTX Video-2.5 de Lightricks, un modelo de difusión para generación de vídeo. La información disponible no detalla la arquitectura interna del transformer de difusión (número de bloques, mecanismos de atención, etc.), por lo que no es posible describirla con precisión. Lo que sí se documenta es el proceso de fusión: se parte de los pesos del modelo base y se incorporan cinco LoRAs con intensidades específicas: Eros10 NSFW (0,7), DMD Distilled (1,0), LTX Video IC-LoRA (0,7), LTX Video IC-LoRA Detailer (0,45) e Img2Vid LoRA (0,45). Esta fusión se realiza antes de la cuantización a FP8 y GGUF.

La LoRA DMD (Distribution Matching Distillation) es la responsable de que el modelo pueda generar vídeo en tan solo 4 pasos, aunque el autor recomienda 8 pasos para obtener la mejor calidad. La IC-LoRA aporta un mecanismo de control en contexto que permite adherirse mejor a imágenes de referencia y, combinada con la IC-LoRA Detailer, habilita el control video-to-video sobre las modalidades de texto e imagen. El codificador de texto es una variante "uncensored" de Gemma4 12B con las proyecciones de LTX integradas y cuantizada a int8. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con soporte de 4 a 8 pasos de inferencia.
- Generación de vídeo a partir de imagen (image-to-video) con mejor conservación facial gracias a la LoRA DMD.
- Generación de vídeo a partir de vídeo (video-to-video) mediante la IC-LoRA Detailer.
- Generación de vídeo a partir de audio (audio-to-video), incluyendo las variantes FL2VA, T2VA, I2VA y REF2VA.
- Generación de audio sincronizado con el vídeo: el modelo produce diálogo, efectos de sonido y puede controlarse para que no haya música de fondo mediante la etiqueta "unscored".
- Soporte de múltiples planos (multi-shot) dentro de una misma generación, por ejemplo "empezar con un primer plano frontal y cortar a un plano general trasero".
- Control fino de la prompt mediante la plantilla IC-LoRA con las etiquetas `[VISUAL]`, `[SPEECH]` y `[SOUNDS]`.
- Capacidad de generar contenido NSFW explícito gracias a la LoRA Eros10.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- Producción de cortometrajes animados: el modelo permite generar escenas completas con diálogo y efectos de sonido a partir de una descripción textual, usando la plantilla IC-LoRA para separar visual, habla y sonido, lo que facilita el control creativo en cada plano.
- Creación de contenido para redes sociales: con 4 pasos de inferencia y FP8, un creador puede generar clips cortos de forma iterativa en hardware de consumo, ajustando la prompt hasta obtener el resultado deseado.
- Animación de ilustraciones o fotografías: la modalidad image-to-video, reforzada por la LoRA Img2Vid y la conservación facial de DMD, permite dar movimiento a retratos o personajes estáticos manteniendo la coherencia del sujeto.
- Doblaje y reanimación de vídeo existente: la modalidad video-to-video con IC-LoRA Detailer permite modificar el estilo o el contenido de un vídeo manteniendo la estructura temporal original, útil para posproducción.
- Generación de vídeo con audio sincronizado para publicidad: la capacidad de producir habla y efectos de sonido directamente evita el paso separado de doblaje, agilizando la creación de anuncios breves.
- Contenido para adultos y nichos NSFW: la LoRA Eros10 está diseñada específicamente para generar material explícito de alta coherencia, un caso de uso que los modelos base comerciales suelen restringir.
- Prototipado rápido de storyboards: la generación en 4 pasos permite explorar variaciones de una escena antes de comprometerse con una producción más costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 21.000 millones de parámetros, una cuantización FP8 requeriría del orden de 21 GB solo para los pesos, más el codificador de texto Gemma4 12B en int8 (unos 12 GB adicionales) y el espacio para activaciones y latentes de vídeo, lo que en la práctica sitúa el requisito muy por encima de lo que cabe en una GPU de consumo típica.
- GPU recomendadas: no especificadas por el autor. Por tamaño, se necesitarían GPUs de clase profesional (A100 80 GB, H100) o configuraciones multi-GPU para ejecutar el modelo completo en FP8 sin offloading.
- GPU de consumo: no es viable en una RTX 4090 (24 GB) sin técnicas agresivas de offloading a RAM o CPU, dado el tamaño combinado de pesos y codificador de texto.
- Opciones de despliegue: el repositorio está etiquetado como `gguf` y la model card menciona ejemplos generados en ComfyUI, por lo que ComfyUI con nodos GGUF es la vía de despliegue documentada. No se mencionan vLLM, TGI ni Ollama, que además no son adecuados para modelos de difusión de vídeo.
- Latencia y throughput: no disponibles. El autor indica que 4 pasos producen resultados válidos y 8 pasos los mejores, pero no aporta tiempos de generación ni resoluciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-uncensored-v1.1-FP8 (este) | ≈21,0 mil millones | No disponible | T2V, I2V, V2V, A2V, audio | Desconocida | Hugging Face (Kremon96) |
| Lightricks/LTX-2.5 (base) | No disponible | No disponible | T2V, I2V, V2V, A2V | No disponible | Hugging Face (Lightricks) |
| TenStrip/LTX2.3-10Eros (base) | No disponible | No disponible | Vídeo (NSFW) | No disponible | Hugging Face (TenStrip) |

La comparación se limita a los modelos base declarados por el autor, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia desconocida: el repositorio declara `license: unknown`, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción con ánimo de lucro conlleva un riesgo legal significativo.
- Contenido NSFW explícito: la LoRA Eros10 está diseñada para generar material para adultos. El modelo no es apto para aplicaciones dirigidas al público general ni para entornos con políticas de contenido.
- Derivado no oficial: no está publicado por Lightricks, sino por un tercero que fusiona pesos de varios modelos base (Lightricks/LTX-2.5, TenStrip/LTX2.3-10Eros y TenStrip/LTX2.3_DMD_Lora), lo que plantea dudas sobre la cadena de licencias y la atribución.
- Riesgo de alucinación visual: como modelo de difusión, puede generar artefactos, incoherencias temporales entre fotogramas y fallos en la anatomía, especialmente en planos largos o con múltiples sujetos.
- Idiomas no documentados: se desconoce qué idiomas soporta el codificador de texto, aunque al ser una variante de Gemma4 probablemente herede su cobertura multilingüe, sin confirmación oficial.
- Requisitos de hardware elevados: el tamaño combinado de pesos y codificador de texto dificulta su ejecución en GPUs de consumo sin offloading.
- Sin benchmarks: no hay métricas objetivas publicadas que permitan evaluar su calidad frente a alternativas.
- Fecha de creación futura: el repositorio figura creado el 18 de noviembre de 2026, lo que puede indicar un error en los metadatos o una fecha de publicación programada; conviene verificar la integridad de los archivos antes de usarlos.
- Dependencia de ComfyUI: la model card está orientada a flujos de ComfyUI y no documenta otras vías de integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kremon96/LTX-2.5-uncensored-v1.1-FP8
- Modelo base Lightricks/LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Modelo base TenStrip/LTX2.3-10Eros: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Modelo base TenStrip/LTX2.3_DMD_Lora: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Repositorio espejo con muestras (ChrisColeTech): https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8
