# Rootport/Nz-Sulphur2

## Resumen

Nz-Sulphur2 es un modelo de generación de vídeo de la familia LTX-2, publicado por Rootport como una conversión a formato GGUF del fine-tune `Sulphur-2-base` desarrollado por SulphurAI. Este modelo adicional está pensado para ser usado con el plugin **Nz-LTX23** (también conocido como Nz-Videomni) para el editor de vídeo AviUtl2, un flujo de trabajo popular en la comunidad japonesa de generación de vídeo local.

El modelo se basa en **Lightricks/LTX-2.3**, el modelo de difusión de vídeo de Lightricks, y hereda su arquitectura y capacidades. La conversión a GGUF en cuantización Q4_K_M reduce el peso original de bf16 a unos 17,7 GB, lo que facilita su uso en hardware con VRAM limitada. El repositorio incluye un único archivo `ltx-2.3-gguf/Sulphur-2-base-distil-Q4_K_M.gguf` con hash SHA-256 verificado, y se distribuye bajo la **LTX-2 Community License Agreement** (versión del 5 de enero de 2026).

La relevancia de este modelo radica en que ofrece una versión cuantizada de un fine-tune popular de LTX-2.3, permitiendo a los usuarios de AviUtl2 añadir una alternativa al modelo estándar sin necesidad de descargar los pesos completos. Es un ejemplo de cómo la comunidad adapta modelos de vídeo de gran tamaño para su uso local en herramientas de edición de vídeo, manteniendo la compatibilidad con el ecosistema de plugins existente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo basado en transformer (heredado de Lightricks/LTX-2.3) |
| Parámetros totales | 21.005.004.544 (aproximadamente 21B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (único archivo disponible) |
| Idiomas soportados | japonés, inglés |
| Licencia | LTX-2 Community License Agreement |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Nz-Sulphur2 no es un modelo entrenado desde cero, sino una conversión de pesos de `Sulphur-2-base`, un fine-tune del modelo LTX-2.3 de Lightricks. LTX-2.3 es un modelo de difusión de vídeo que genera secuencias de vídeo a partir de prompts de texto (y posiblemente imágenes, según la documentación del fine-tune original). La arquitectura subyacente es un transformer de difusión, aunque no se han publicado detalles específicos sobre el número de capas, dimensiones de atención o el mecanismo de temporalidad en la información disponible.

El proceso de conversión fue realizado con la herramienta **Nz-GGUF-Converter-LTX23** de Rootport, que transforma los pesos bf16 originales a formato GGUF con cuantización Q4_K_M. Según la model card, no se realizó ningún entrenamiento adicional, ni destilación ni fusión de LoRA; el sufijo "distil" en el nombre del archivo proviene del nombre original del archivo de SulphurAI y no implica un proceso de destilación real. La cuantización reduce la precisión numérica, por lo que los resultados generados no son idénticos a los del modelo en bf16.

El modelo base LTX-2.3 se entrenó con datos de vídeo y texto en varios idiomas, aunque la versión fine-tune de SulphurAI está orientada principalmente a inglés y japonés. No se han publicado detalles sobre el dataset de fine-tune ni sobre el número de tokens de entrenamiento en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de prompts de texto (text-to-video) con calidad cinematográfica, según la descripción del fine-tune original.
- Soporte de image-to-video (generación de vídeo a partir de una imagen de entrada), indicado en la web del proyecto Sulphur 2 Base.
- Capacidades multilingües limitadas a inglés y japonés.
- Integración directa con el plugin Nz-LTX23 para AviUtl2, detectado automáticamente al colocarlo en el directorio `models/LTX23/Weights/`.
- Compatibilidad con el ecosistema de cuantización GGUF, lo que permite ejecución en hardware con VRAM limitada.
- No incluye soporte de tool calling, agentes ni razonamiento multi-step; es un modelo puramente generativo de vídeo.

## Casos de uso

- **Generación de vídeo para edición en AviUtl2**: el modelo se usa como motor de generación de vídeo dentro del plugin Nz-LTX2, permitiendo a los editores de vídeo crear clips personalizados directamente desde la interfaz de AviUtl2 sin salir del flujo de trabajo.
- **Prototipado rápido de contenido audiovisual**: los creadores pueden generar vídeos de baja resolución con prompts en inglés o japonés para explorar ideas antes de producir contenido final.
- **Producción de vídeo cinematográfico local**: gracias a la cuantización Q4_K_M, el modelo cabe en GPUs de gama alta de consumo (como RTX 3090 o 4090) y permite generar vídeo de alta calidad sin depender de servicios en la nube.
- **Investigación en generación de vídeo**: sirve como base para experimentos de fine-tune o de adaptación a dominios específicos, al estar disponible en un formato fácil de cargar en herramientas como llama.cpp o Nz-Videomni.
- **Generación de vídeo para presentaciones o contenido educativo**: se pueden crear ilustraciones animadas o clips de apoyo a partir de descripciones textuales, sin necesidad de habilidades avanzadas de animación.
- **Integración en pipelines de automatización de vídeo**: al ser un archivo GGUF estándar, se puede integrar en scripts o herramientas de línea de comandos que utilicen motores de inferencia compatibles, aunque la integración oficial es con el plugin de AviUtl2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como FVD (Fréchet Video Distance) o CLIP Score para comparar con el modelo original LTX-2.3 o con otros modelos de generación de vídeo. La model card indica que la cuantización Q4_K_M introduce pérdida de precisión, por lo que el rendimiento visual será inferior al del modelo en bf16, pero no se cuantifica esta degradación.

## Requisitos de hardware

- El archivo GGUF pesa aproximadamente 17,7 GB, por lo que se requiere al menos 18 GB de VRAM para cargar el modelo en memoria (más el overhead del runtime).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB VRAM) o superior, o una A100 (40 GB) para mayor margen. En GPUs con 16 GB de VRAM (RTX 4080, RTX 3080 Ti) puede no caber sin offloading de capas a CPU.
- No se recomienda su uso en GPUs de gama baja (menos de 12 GB) a menos que se utilice un runtime que soporte descarga parcial de capas a RAM.
- Opciones de despliegue: el modelo está pensado para el plugin Nz-LTX2 (Nz-Videomni) en AviUtl2, que usa un backend basado en llama.cpp. También se puede cargar con herramientas compatibles con GGUF como llama.cpp o Ollama, aunque no hay soporte oficial.
- La latencia y el throughput dependen en gran medida del hardware y del runtime; no se han publicado datos concretos. En una RTX 4090 se puede esperar una generación de varios segundos de vídeo en un tiempo de minutos, pero no hay cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Uso principal |
|---|---|---|---|---|
| **Nz-Sulphur2** (este) | ~21B | GGUF Q4_K_M | LTX-2 Community License | Generación de vídeo en AviUtl2 |
| **Lightricks/LTX-2.3** (base) | ~21B | bf16 | LTX-2 Community License | Generación de vídeo de referencia |
| **Sulphur-2-base** (original) | ~21B | bf16 | LTX-2 Community License | Generación de vídeo fine-tune de LTX-2.3 |
| **CogVideoX-5B** | 5B | bf16 | Apache 2.0 | Generación de vídeo open source |

La comparativa muestra que Nz-Sulphur2 es una versión cuantizada de Sulphur-2-base, que a su vez es un fine-tune de LTX-2.3. La principal diferencia con el original es el formato (GGUF vs. bf16) y la pérdida de precisión. Frente a alternativas como CogVideoX-5B, ofrece más parámetros y una calidad potencialmente superior, pero con una licencia más restrictiva y menos flexibilidad de integración (está pensado específicamente para AviUtl2).

## Limitaciones y advertencias

- **Pérdida de precisión por cuantización**: el uso de Q4_K_M degrada la calidad de la salida en comparación con los pesos bf16 originales, y los resultados no son idénticos al modelo `Sulphur-2-base`.
- **Idiomas limitados**: el modelo está optimizado para inglés y japonés; puede que no funcione bien con prompts en otros idiomas.
- **Restricciones de la licencia**: la LTX-2 Community License Agreement incluye limitaciones de uso (sección 4 y ATTACHMENT A con 20 items de restricciones). Es obligatorio leer el archivo `LICENSE` antes de usar el modelo, especialmente para fines comerciales.
- **No es una distribución oficial**: este repositorio no es un lanzamiento de Lightricks ni de SulphurAI, y no está respaldado por ninguno de ellos.
- **Dependencia de un plugin específico**: para su uso en AviUtl2 se requiere el plugin Nz-LTX2; no se documenta compatibilidad con otros pipelines de generación de vídeo.
- **Riesgo de contenido inapropiado**: el fine-tune `Sulphur-2-base` se describe como "uncensored" en su web oficial, lo que puede implicar la generación de contenido no moderado; esto requiere precaución en entornos de producción.
- **Contexto de vídeo**: no se dispone de información sobre la duración máxima de los vídeos generados ni sobre la resolución de salida; estos parámetros dependen del runtime y del modelo base.

## Enlaces

- [Hugging Face - Rootport/Nz-Sulphur2](https://huggingface.co/Rootport/Nz-Sulphur2)
- [Repositorio de archivos en Hugging Face](https://huggingface.co/Rootport/Nz-Sulphur2/tree/main)
- [Nz-Videomni (plugin para AviUtl2)](https://github.com/Rootport-AI/Nz-Videomni)
- [Nz-GGUF-Converter-LTX23 (herramienta de conversión)](https://github.com/Rootport-AI/Nz-GGUF-Converter-LTX23)
- [Sulphur-2-base (modelo original de SulphurAI)](https://huggingface.co/SulphurAI/Sulphur-2-base)
- [Página de Sulphur 2 Base en CivitAI](https://civitai.com/models/2601098/sulphur-2-base)
- [Proyecto local de Sulphur 2 Base para Apple Silicon](https://github.com/sw30labs/sulphur-2-base)
- [Web promocional de Sulphur 2 Base](https://sulphur2.homes/)
- [Ficha de Sulphur 2 Base GGUF en local-ai-zone](https://local-ai-zone.github.io/models/sulphur-2-base.html)
