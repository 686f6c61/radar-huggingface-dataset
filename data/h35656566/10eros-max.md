# h35656566/10Eros-Max

## Resumen

10Eros-Max es un modelo de generación de vídeo de tipo *image-text-to-video* basado en MiniMaxAI/MiniMax-H3, desarrollado por el usuario h35656566 en Hugging Face (y también atribuido a TenStrip en otras publicaciones). Está diseñado para producir secuencias de vídeo a partir de una imagen de referencia, un texto descriptivo o ambos, lo que lo sitúa en la categoría de modelos de síntesis audiovisual. Su relevancia actual radica en que ofrece una alternativa de código abierto (aunque con licencia comunitaria restringida) para tareas de generación de vídeo, con versiones cuantizadas que permiten su ejecución en hardware más modesto.

El modelo base es MiniMax-H3, una arquitectura de la familia MiniMax para vídeo, y el repositorio incluye variantes en BF16 (tamaño completo de 409,1 GB), INT8 (conversión ConvRot) y GGUF (aproximadamente 7,81 GB). La versión publicada en HuggingFace tiene acceso restringido (gated) y requiere aceptar condiciones específicas. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los idiomas soportados, aunque su pipeline sugiere que trabaja con vídeo y posiblemente audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en MiniMaxAI/MiniMax-H3, de la serie MiniMax) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se especifica arquitectura MoE) |
| Longitud de contexto | No aplica (modelo de generacion de video) |
| Tipos de cuantizacion | BF16 (original), INT8 (ConvRot), GGUF (Q4 probablemente) |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (BF16 e INT8), GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo. Se sabe que se basa en MiniMaxAI/MiniMax-H3, que pertenece a la familia de modelos de generación de vídeo de MiniMax (serie Hailuo). El repositorio menciona variantes "ref2va" (reference-to-video-audio) y "fl2va" (image-to-video-audio), lo que sugiere que el modelo incorpora generación de audio sincronizado con el vídeo, una característica innovadora en comparación con modelos de vídeo tradicionales que solo generan imágenes en movimiento.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. Las cuantizaciones INT8 y GGUF indican que se han aplicado técnicas de compresión para reducir el tamaño del modelo, pero no se especifican los detalles del proceso de entrenamiento.

## Capacidades

- Generación de vídeo a partir de una imagen de referencia y un texto descriptivo (image-to-video).
- Generación de vídeo a partir de solo texto (text-to-video).
- Posibilidad de generar audio sincronizado con el vídeo, según las variantes ref2va y fl2va (no confirmado explícitamente en la ficha original).
- Soporte de cuantizaciones para adaptarse a diferentes recursos de hardware.
- No se ha confirmado soporte para *function calling*, agentes o razonamiento multi-paso (es un modelo generativo de vídeo, no un LLM).

## Casos de uso

- Producción de contenido audiovisual: crear vídeos cortos a partir de guiones textuales o imágenes de referencia para redes sociales, publicidad o prototipos.
- Generación de material educativo: convertir descripciones en vídeos animados para explicar conceptos complejos.
- Creación de storyboards: partir de imágenes estáticas y generar secuencias de movimiento para previsualizar escenas de películas o animaciones.
- Doblaje y sincronización de audio: si la variante con audio funciona, se puede generar la pista sonora correspondiente al vídeo.
- Pruebas de concepto en investigación: evaluar la calidad de la generación de vídeo con modelos basados en MiniMax-H3.
- Personalización de contenido para campañas: adaptar vídeos de marketing a partir de imágenes de producto y texto descriptivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar el rendimiento con otros modelos de generación de vídeo como Sora, Runway o Pika.

## Requisitos de hardware

- Para el modelo BF16 completo (409,1 GB en el repositorio), se requiere un clúster de GPUs de alta gama, típicamente varias A100 (80 GB) o H100 (80 GB) en configuración multi-GPU.
- La versión INT8 (aproximadamente 20,20 GB según el script de GitHub) puede caber en una GPU de 24 GB, como una RTX 3090/4090, aunque el tamaño exacto no está confirmado.
- La versión GGUF (7,81 GB) es viable en GPUs de 8-12 GB, como RTX 3060 o RTX 3080, o incluso en CPU con suficiente RAM.
- Opciones de despliegue: para las versiones BF16 e INT8 se puede usar ComfyUI (según el script de Colab), así como frameworks de inferencia como vLLM (si se adapta a vídeo). Para GGUF, se puede usar llama.cpp o herramientas que soporten este formato.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de generación de vídeo. Aunque existen alternativas como Sora (OpenAI), Runway Gen-2/3, Pika o Stable Video Diffusion, no se han encontrado datos de rendimiento comparables para 10Eros-Max. Por tanto, no es posible realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo está diseñado para generar contenido erótico, según el nombre "10Eros" y el contexto de su distribución (comunidad). Esto implica que puede producir material sexualmente explícito, lo que requiere moderación en su uso y respeto a las normativas legales.
- La licencia es una "community license agreement" de MiniMax, que puede imponer restricciones para uso comercial o de redistribución. Se debe revisar el texto completo de la licencia.
- El acceso al modelo en HuggingFace es restringido (gated); los usuarios deben aceptar condiciones adicionales antes de descargarlo.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo de vídeo, los riesgos de alucinación se manifiestan en la generación de escenas irreales o inconsistentes.
- El tamaño del repositorio (409 GB) hace que su descarga sea costosa en ancho de banda y espacio de almacenamiento.

## Enlaces

- [HuggingFace - h35656566/10Eros-Max](https://huggingface.co/h35656566/10Eros-Max)
- [HuggingFace - TenStrip/10Eros-Max](https://huggingface.co/TenStrip/10Eros-Max)
- [GitHub - comfy-agent/scripts/colab/10eros_max](https://github.com/shinshin86/comfy-agent/tree/main/scripts/colab/10eros_max)
- [Civitai - 10eros_Max_Int8_ref2va_beta2](https://civitai.red/models/2868392/10erosmaxint8ref2vabeta2)
- [Local AI Zone - 10eros Max GGUF](https://local-ai-zone.github.io/models/10eros-max.html)
