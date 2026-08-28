# FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-Synthetic-Step1300

## Resumen

FastVideo-FastH3-4-step-Preview-v1-VSA-Synthetic-Step1300 es un modelo de generación de vídeo y audio sincronizados a partir de texto, desarrollado por el laboratorio hao-ai-lab dentro del framework FastVideo. Se trata de una ablación de la serie FastH3 Preview v1, basada en el modelo MiniMax-H3, que ha sido destilada con el método DMD2 (Distribution Matching Distillation) para reducir la inferencia a solo cuatro pasos de transformer, en lugar de los cientos que requiere el modelo base. Esta reducción drástica del número de pasos lo hace especialmente relevante para aplicaciones en tiempo real o de alto rendimiento, donde la latencia es crítica.

El modelo cuenta con aproximadamente 35 000 millones de parámetros y emplea una atención dispersa VSA-H3 con un 90 % de sparsity, lo que contribuye a su eficiencia computacional. Fue entrenado sobre vídeos sintéticos generados por el propio modelo base H3, y requiere el backend de atención VSA-H3 de FastVideo para su ejecución. Es una versión preliminar (preview) que no cubre todas las capacidades del modelo base, como la generación de vídeo a partir de imágenes (Ref2VA) o la adaptación de lenguaje a vídeo (FL2VA), y se distribuye bajo la licencia comunitaria MiniMax-H3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con atención dispersa VSA-H3 (90 % sparsity) |
| Parametros totales | 35 049 751 296 (~35 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de MiniMax-H3, un transformer de difusión para generación de vídeo y audio. Sobre esta base, FastVideo aplica destilación DMD2 (Distribution Matching Distillation, arxiv:2405.14867) para comprimir el proceso de muestreo a solo cuatro forwards del transformer, manteniendo una calidad razonable. El entrenamiento se realizó sobre vídeos sintéticos generados por el propio modelo base H3, y se incorporó la atención dispersa VSA-H3 con un 90 % de sparsity, que reduce el coste computacional de la atención al ignorar la mayoría de las conexiones entre tokens. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de vídeo y audio sincronizados a partir de texto (text-to-audio-video).
- Inferencia en solo 4 pasos de transformer, lo que permite una generación mucho más rápida que el modelo base.
- Atención dispersa VSA-H3 con 90 % de sparsity, que reduce el coste computacional y la memoria necesaria.
- Soporte para ejecución en múltiples GPUs (el número debe dividir las 56 cabezas de atención de H3).
- No se ha documentado soporte para tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües no especificadas.

## Casos de uso

- Creación de contenido audiovisual para marketing: el modelo puede generar clips cortos con narración o efectos de sonido sincronizados a partir de una descripción textual, acelerando la producción de anuncios o vídeos promocionales.
- Prototipado rápido de vídeos para redes sociales: gracias a sus 4 pasos de inferencia, permite iterar rápidamente sobre ideas de contenido sin esperar largos tiempos de renderizado.
- Generación de vídeos educativos con audio: se puede utilizar para producir explicaciones animadas con voz en off automática, partiendo de guiones escritos.
- Asistencia en producción cinematográfica: los cineastas pueden generar storyboards animados con audio preliminar para visualizar escenas antes de la producción real.
- Investigación en generación de vídeo y audio: sirve como base para estudiar técnicas de destilación few-step y atención dispersa en modelos multimodales.
- Creación de efectos visuales y sonoros para videojuegos: permite generar rápidamente secuencias de vídeo con audio para cinemáticas o entornos dinámicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo requiere el framework FastVideo y el backend de atención VSA-H3.
- Los ajustes probados por defecto utilizan cuatro GPUs NVIDIA B200 (arquitectura Blackwell) con CUDA 13.
- En otros sistemas multi-GPU con CUDA, se debe seguir la guía de instalación y añadir las opciones `--no-replicated-dit --vsa-kernel triton --no-fa4`.
- El número de GPUs debe dividir las 56 cabezas de atención de H3 (por ejemplo, 2, 4, 7, 8, 14, 28 o 56).
- No se ha especificado la VRAM mínima por GPU, pero dado el tamaño del modelo (35 B parámetros) y el tamaño del repositorio (147.8 GB), se requieren GPUs de alta gama con gran memoria (al menos 80 GB por GPU en FP16).
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para una comparativa rigurosa. El modelo es una destilación few-step de MiniMax-H3, por lo que su referencia natural es el propio MiniMax-H3 (base), que requiere muchos más pasos de inferencia pero ofrece mayor calidad en movimiento, detalle y audio. Otros modelos de generación de vídeo como Stable Video Diffusion o CogVideoX no son directamente comparables por su arquitectura y enfoque, y no se han encontrado benchmarks públicos que los enfrenten. Se recomienda consultar la colección FastH3 en Hugging Face para ver otras variantes de esta serie.

## Limitaciones y advertencias

- Es una versión preview y una ablación, no un modelo final de producción.
- Entrenado exclusivamente con datos sintéticos, lo que puede limitar su generalización a escenarios reales.
- La calidad en movimiento difícil, detalles finos y audio puede ser inferior a la del modelo base MiniMax-H3.
- No se han destilado las capacidades FL2VA (vídeo a partir de lenguaje) ni Ref2VA (vídeo a partir de referencia).
- Requiere hardware específico (GPUs Blackwell, CUDA 13) y el framework FastVideo con su backend VSA-H3, lo que limita su portabilidad.
- La licencia minimax-h3-community puede imponer restricciones de uso comercial; se debe revisar el texto completo de la licencia.
- Riesgo de alucinación en el contenido generado, especialmente en escenas complejas o con audio.
- No se han documentado sesgos específicos, pero al estar entrenado sobre datos sintéticos puede heredar sesgos del modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-Synthetic-Step1300)
- [Blog de FastH3 Preview](https://haoailab.com/blogs/fasth3-preview/)
- [Repositorio FastVideo en GitHub](https://github.com/hao-ai-lab/FastVideo)
- [Colección FastH3](https://huggingface.co/collections/FastVideo/fastvideo-fasth3)
- [LoRA correspondiente](https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-LoRA/tree/main/vsa-synthetic-step1300)
- [Checkpoint recomendado (VSA-DataFree)](https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree)
- [Paper DMD2](https://arxiv.org/abs/2405.14867)
