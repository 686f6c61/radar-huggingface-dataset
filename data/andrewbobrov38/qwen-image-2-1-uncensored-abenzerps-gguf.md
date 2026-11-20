# andrewbobrov38/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-Abenzerps-GGUF es una cuantización no oficial del modelo de difusión text-to-image Qwen/Qwen-Image-2.1, publicada por el usuario andrewbobrov38 (también referenciado como abenzerps en los enlaces internos de la model card). El modelo base pertenece a la familia Qwen de Alibaba y está diseñado para generación de imágenes a partir de descripciones textuales. Esta versión concreta se distribuye en formato GGUF y otros formatos cuantizados (FP8, INT8, NVFP4, MLX) pensados para su ejecución local en ComfyUI mediante el nodo ComfyUI-GGUF.

El problema que resuelve es el de permitir inferencia local de un modelo de generación de imágenes de 7.115 millones de parámetros en hardware de consumo, algo inviable con los pesos en BF16 completos. Para ello ofrece cuantizaciones desde BF16 (14,23 GB) hasta Q4_0 (4,15 GB), además de archivos complementarios: un text encoder basado en Qwen3-VL de 8B y un VAE específico del modelo.

La relevancia es doble: por un lado, el modelo base Qwen-Image-2.1 es una referencia reciente en generación de imágenes open source; por otro, esta variante se presenta como "uncensored", es decir, sin el filtrado de contenido del modelo original, lo que tiene implicaciones legales y éticas que se detallan en la sección de limitaciones. El repositorio es de creación muy reciente (20 de noviembre de 2026) y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (no se especifica el tipo exacto de backbone en la información disponible) |
| Parametros totales | 7.115.124.736 (dato de safetensors) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia de investigación de Qwen; el campo `license` figura como `other`) |
| Formato de pesos | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0) y safetensors (FP8, INT8 ConvRot, NVFP4, MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen-Image-2.1. Se trata de un modelo de difusión para generación de imágenes (pipeline `text-to-image`), con 7.115 millones de parámetros en el componente de difusión. El repositorio incluye además un text encoder Qwen3-VL de 8B (en BF16 o INT8 ConvRot) y un VAE específico del modelo, lo que sugiere una arquitectura de difusión condicionada por embeddings multimodales de Qwen3-VL.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning de preferencias. La model card menciona que las cuantizaciones se han generado "using the original upstream base weights", pero no documenta el proceso de entrenamiento del modelo base. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal. La variante "uncensored" implica presumiblemente un ajuste fino o una modificación de los pesos para eliminar el filtrado de contenido, pero el autor no documenta el procedimiento.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline de difusión.
- Ejecución local en ComfyUI con el nodo Unet Loader (GGUF) y el cargador CLIP con tipo `qwen_image`.
- Cuantizaciones optimizadas para distintos entornos: GGUF para CPU/GPU con llama.cpp, MLX para Apple Silicon, NVFP4 para GPUs NVIDIA Blackwell, FP8 e INT8 para GPUs con soporte de precisión reducida.
- Text encoder basado en Qwen3-VL 8B, que aporta comprensión multimodal de las descripciones textuales.
- Variante "uncensored": generación sin el filtrado de contenido del modelo original (ver limitaciones).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generación de ilustraciones y arte conceptual en local: el modelo permite crear imágenes a partir de prompts descriptivos sin depender de servicios en la nube, usando la cuantización Q4_K_M (4,60 GB) en una GPU de consumo. Es adecuado para estudios pequeños que necesitan privacidad y control sobre el contenido generado.
- Prototipado de assets para videojuegos: con la cuantización Q8_0 (7,59 GB) o BF16 (14,23 GB) en una GPU de 24 GB, se pueden generar variaciones de personajes, entornos y objetos para iterar rápidamente sobre el diseño visual antes de encargar arte final.
- Investigación en generación de imágenes: el repositorio incluye text encoder Qwen3-VL 8B y VAE, lo que permite reproducir el pipeline completo en ComfyUI y experimentar con distintas cuantizaciones para medir el impacto de la precisión en la calidad de salida.
- Generación de contenido editorial sin restricciones temáticas: la variante "uncensored" está pensada para casos donde el filtrado del modelo original bloquea prompts legítimos (por ejemplo, arte figurativo, escenas de violencia en narrativa gráfica o contenido para adultos con las salvaguardas legales correspondientes). Requiere revisión legal previa.
- Despliegue en Apple Silicon: las cuantizaciones MLX 4-bit (4,00 GB), 6-bit (5,78 GB) y 8-bit (7,56 GB) permiten ejecutar el modelo en Macs con memoria unificada, útil para creadores que trabajan en portátiles sin GPU dedicada.
- Automatización de pipelines de generación por lotes: mediante ComfyUI y scripts de automatización, se pueden generar cientos de imágenes con prompts parametrizados para catálogos, mockups o pruebas A/B de creatividades publicitarias, usando la cuantización Q4_K_M para maximizar el throughput por GB de VRAM.

## Benchmarks y rendimiento

La model card incluye una referencia a una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) del modelo base, pero no se proporcionan los valores numéricos en la información disponible. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el componente de difusión: BF16 ~14,23 GB; FP8 ~6,63 GB; INT8 ConvRot ~6,76 GB; NVFP4 ~4,20 GB; Q8_0 ~7,59 GB; Q6_K ~5,88 GB; Q5_K_M ~5,22 GB; Q4_K_M ~4,60 GB; Q4_0 ~4,15 GB.
- VRAM adicional para el text encoder: 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot. El VAE requiere 676 MB en BF16.
- GPU recomendadas: para BF16 completo se necesita una GPU de 24 GB o más (RTX 3090, RTX 4090, A100, H100). Para Q4_K_M con text encoder INT8, una GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) puede ser suficiente. Para NVFP4 se requiere una GPU NVIDIA Blackwell (RTX 50xx, B200).
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_M, Q4_0, Q5_K_M o Q6_K y el text encoder INT8. En Apple Silicon, las variantes MLX 4-bit y 6-bit caben en Macs con 16 GB de memoria unificada o más.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet recomendado para soporte nativo de Qwen-Image 2.1), llama.cpp para los GGUF, MLX para Apple Silicon. No se documenta soporte en vLLM ni TGI (son para modelos de lenguaje, no de difusión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Abenzerps-GGUF | 7.115 M (difusión) | no disponible | GGUF, safetensors, MLX | qwen-research | Hugging Face (repo de terceros) |
| Qwen/Qwen-Image-2.1 (base) | 7.115 M (difusión) | no disponible | safetensors | qwen-research | Hugging Face (oficial) |
| Otras cuantizaciones GGUF de Qwen-Image-2.1 | 7.115 M (difusión) | no disponible | GGUF | según autor | Hugging Face (no verificado en la información disponible) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparativa se limita a parámetros, formato y licencia, ya que no se han publicado métricas en la documentación disponible.

## Limitaciones y advertencias

- La licencia `qwen-research` restringe el uso a fines de investigación. El uso comercial requiere verificar los términos exactos de la licencia de Qwen y, en su caso, obtener autorización del titular. El campo `license` figura como `other`, lo que añade ambigüedad.
- La variante "uncensored" elimina el filtrado de contenido del modelo original. Esto puede facilitar la generación de contenido ilegal, difamatorio o que vulnere derechos de terceros. El usuario es el único responsable del uso que haga del modelo.
- No se documenta el proceso de creación de la variante "uncensored": se desconoce si se modificaron los pesos, si se aplicó un fine-tuning o si simplemente se eliminaron las salvaguardas. Esto impide evaluar la calidad y la integridad del modelo resultante.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar imágenes incoherentes, con anatomía incorrecta, texto ilegible o elementos que no se corresponden con el prompt. No se han publicado métricas de fidelidad en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 20 de noviembre de 2026. No hay evidencia de validación por parte de la comunidad ni de que los archivos estén completos o sean funcionales.
- El tamaño del repo es de 105,2 GB, lo que incluye todas las cuantizaciones y archivos complementarios. La descarga selectiva es imprescindible para no consumir almacenamiento innecesario.
- No se especifican los idiomas soportados para los prompts. El text encoder Qwen3-VL es multilingüe, pero no se documenta el rendimiento por idioma.
- La integración con ComfyUI requiere el fork `leejet/ComfyUI-GGUF`; el fork `city96/ComfyUI-GGUF` puede fallar con el error `Unknown model architecture!`. Esto implica una dependencia de un fork no oficial.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible comparar la calidad de esta cuantización con la del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/andrewbobrov38/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio alternativo del autor (referenciado en la model card): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork original): https://github.com/city96/ComfyUI-GGUF
