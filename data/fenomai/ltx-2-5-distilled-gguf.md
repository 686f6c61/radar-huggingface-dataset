# FenomAI/LTX-2.5-Distilled-GGUF

## Resumen

FenomAI/LTX-2.5-Distilled-GGUF es una versión cuantizada en formato GGUF del transformer destilado del modelo LTX-2.5, desarrollado originalmente por Lightricks. Este modelo está diseñado para generación de vídeo y audio sincronizados a partir de texto, imagen o vídeo, y se distribuye con el objetivo de permitir su ejecución local en hardware con memoria limitada, manteniendo una fidelidad visual cercana a la del modelo base. La cuantización en GGUF reduce significativamente el peso del modelo (desde 12,6 GB hasta 23,6 GB según el nivel), lo que facilita su uso en entornos de consumo o con GPUs de gama media.

El modelo base LTX-2.5 es un modelo de mundo abierto (open-world) con arquitectura de diffusion transformer (DiT), que soporta generación multishot nativa, es decir, puede generar escenas conectadas en una sola pasada manteniendo identidad de personajes, entorno, iluminación y estilo visual. Esta versión destilada captura gran parte de las capacidades del modelo completo de 22B en un paquete más pequeño y rápido. El repositorio incluye además workflows preconfigurados para ComfyUI, tanto para text-to-video como para image-to-video, lo que facilita su integración en pipelines de generación de vídeo.

La relevancia de este modelo radica en que democratiza la generación de vídeo de alta fidelidad con audio sincronizado, permitiendo a desarrolladores e investigadores ejecutarlo localmente sin necesidad de infraestructura de servidores de alto coste. Su licencia comunitaria (ltx-2-community-license-agreement) permite uso comercial bajo ciertas condiciones, lo que lo convierte en una opción atractiva para aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) destilado |
| Parametros totales | No disponible (el modelo base LTX-2.5 tiene 22B, el destilado no se especifica) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada del transformer destilado de LTX-2.5, que emplea una arquitectura de diffusion transformer (DiT) para generar vídeo y audio. El proceso de destilación reduce el tamaño del modelo original (22B) manteniendo gran parte de su capacidad, y la cuantización en GGUF comprime aún más los pesos para facilitar la inferencia local. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o si se utilizaron técnicas como RLHF o DPO. El modelo base incorpora innovaciones como la generación multishot nativa y el diffusion fidelity rendering, que asigna dinámicamente cómputo según la complejidad de la escena. Esta versión GGUF requiere componentes adicionales obligatorios: un text encoder (Gemma 4 12B) y dos VAEs (uno de vídeo y otro de audio), que deben descargarse por separado del repositorio oficial de Lightricks.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), imagen (image-to-video), vídeo (video-to-video) y audio (audio-to-video).
- Generación de audio sincronizado con el vídeo, incluyendo voces y efectos sonoros.
- Generación multishot nativa: crea escenas conectadas en una sola pasada manteniendo identidad de personajes, entorno, iluminación y estilo visual.
- Soporte de upscaling latente espacial (x2) y temporal (x2) mediante upscalers oficiales, permitiendo aumentar resolución y framerate.
- Integración con ComfyUI mediante workflows preconfigurados (T2V e I2V).
- Capacidades multilingües: soporta 9 idiomas (inglés, alemán, español, francés, japonés, coreano, chino, italiano y portugués).
- Ejecución local en hardware con memoria limitada gracias a la cuantización GGUF.

## Casos de uso

- **Generación de vídeo publicitario**: crear clips promocionales de productos a partir de prompts de texto, con audio sincronizado, sin necesidad de equipos de producción. El modelo permite generar escenas multishot manteniendo coherencia visual, ideal para campañas de marketing.
- **Animación de imágenes estáticas**: convertir retratos o paisajes en vídeos animados con movimiento guiado por texto, útil para redes sociales, presentaciones o arte digital. El workflow I2V facilita este proceso.
- **Creación de contenido educativo**: generar vídeos explicativos con narración sincronizada a partir de guiones de texto, reduciendo costes de producción audiovisual.
- **Prototipado de escenas cinematográficas**: directores y guionistas pueden visualizar escenas rápidamente generando vídeos de baja resolución con audio, antes de la producción real. La generación multishot permite explorar secuencias completas.
- **Doblaje y localización de vídeo**: al soportar múltiples idiomas, el modelo puede generar versiones de un vídeo con audio en diferentes lenguas, manteniendo la sincronización labial y el estilo visual.
- **Desarrollo de juegos y mundos virtuales**: generar cinemáticas o vídeos de ambiente para videojuegos, con audio integrado, directamente desde prompts, acelerando el pipeline de creación de activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los archivos GGUF varían entre 12,6 GB (Q3_K_S) y 23,6 GB (Q8_0). Se recomienda una GPU con VRAM igual o superior al tamaño del archivo elegido, más espacio adicional para el text encoder y los VAEs.
- Para la cuantización Q4_K_M (15,7 GB), se necesitaría al menos 16 GB de VRAM en la GPU, aunque es posible usar offloading a RAM con herramientas como llama.cpp.
- El text encoder Gemma 4 12B requiere unos 26,3 GB en BF16 o 15,4 GB en INT8 (versión ComfyUI), por lo que se recomienda una GPU con al menos 24 GB de VRAM para un flujo completo, o usar la versión INT8 y offloading.
- Los VAEs de vídeo (1,47 GB) y audio (365 MB) son relativamente ligeros y pueden residir en VRAM o RAM.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para mayor margen. En GPUs con menos VRAM (p.ej. 16 GB), se puede usar Q3_K_M o Q4_K_S con offloading.
- Opciones de despliegue: llama.cpp (compatible con GGUF), ComfyUI con nodos de carga GGUF, o pipelines Python personalizados. No se menciona soporte explícito para vLLM o TGI.
- La latencia y el throughput dependen de la cuantización, la GPU y la resolución de salida. No se proporcionan datos específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. Se puede considerar que esta versión GGUF es comparable a otras cuantizaciones del mismo modelo base (LTX-2.5) o a modelos de generación de vídeo como Stable Video Diffusion, pero no se tienen datos concretos de rendimiento o características para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad, especialmente en los niveles más bajos (Q3_K_S, Q3_K_M). Se recomienda Q4_K_M como equilibrio entre fidelidad y memoria.
- El modelo requiere componentes adicionales (text encoder y VAEs) que deben descargarse por separado; no es un modelo autocontenido.
- La licencia ltx-2-community-license-agreement puede tener restricciones para uso comercial; se debe revisar el texto completo de la licencia antes de su uso en producción.
- No se dispone de información sobre sesgos o alucinaciones específicas, pero al ser un modelo generativo de vídeo, puede producir contenido no deseado o incoherente en escenas complejas.
- El soporte de idiomas está limitado a los 9 listados; otros idiomas pueden no funcionar correctamente.
- La generación de vídeo de alta resolución y larga duración puede requerir mucha memoria y tiempo de cómputo, incluso con cuantización.

## Enlaces

- [Repositorio HuggingFace de FenomAI/LTX-2.5-Distilled-GGUF](https://huggingface.co/FenomAI/LTX-2.5-Distilled-GGUF)
- [Modelo base Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)
- [Página oficial de LTX-2.5](https://ltx.io/model/ltx-2-5)
- [Licencia del modelo](https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md)
- [Tutorial sobre LTX-2.5 (INT8/BF16/NVFP4/GGUF)](https://www.stablediffusiontutorials.com/2026/08/ltx-25-video-generationint8bf16nvfp4gguf.html)
