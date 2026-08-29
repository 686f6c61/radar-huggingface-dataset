# rzgar/Bernini-v2-ComfyUI

## Resumen

El modelo `rzgar/Bernini-v2-ComfyUI` es una extracción y reempaquetado de los componentes del modelo de generación de vídeo `ByteDance/Bernini-Diffusers-v2`, adaptado específicamente para su uso en ComfyUI. El autor, rzgar, ha separado cada uno de los submódulos del bundle original (planner, text encoder, decodificador de visión, dos DiTs de difusión, connector y mask tokens) en archivos independientes, preservando las claves de los tensores originales. También incluye versiones cuantizadas en NVFP4 y FP8_scaled para reducir el consumo de memoria.

Este modelo resuelve el problema de la integración de un sistema de generación de vídeo multimodal complejo en un entorno de nodos visuales como ComfyUI, permitiendo a los desarrolladores y artistas utilizar el pipeline completo de Bernini v2 sin necesidad de gestionar manualmente los pesos fragmentados. Su relevancia radica en que democratiza el acceso a un modelo de última generación de ByteDance, con licencia Apache 2.0, y facilita su despliegue en flujos de trabajo de vídeo generativo.

El pipeline declarado es `image-text-to-video`, lo que indica que el modelo acepta una imagen de entrada y una instrucción textual para generar un vídeo. El tamaño total del repositorio es de 112,8 GB en precisión completa (fp32), aunque las versiones cuantizadas reducen significativamente este requisito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multimodal compuesto: Qwen2.5-VL (planner), UMT5-XXL (text encoder), Wan2.2 DiT dual (high-noise y low-noise), decodificador de visión, connector MLP y mask tokens |
| Parametros totales | No disponible (suma de componentes: ~123 GB en fp32, pero no se especifica el número de parámetros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (original), FP8_scaled, NVFP4 |
| Idiomas soportados | No disponible (el text encoder UMT5-XXL soporta múltiples idiomas, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (componentes individuales) y directorios con versiones cuantizadas |

## Arquitectura y entrenamiento

El modelo es un sistema compuesto por varios módulos interconectados, tal como se detalla en la tabla de la model card:

- **Planner (mllm)**: un modelo Qwen2.5-VL fine-tuned (33,17 GB en fp32) que actúa como planificador, interpretando la entrada multimodal (imagen y texto) y generando las instrucciones de alto nivel para el renderizado.
- **Text encoder (t5_text_encoder)**: un UMT5-XXL (26,92 GB) que codifica el texto de entrada en representaciones densas.
- **Decodificador de visión (vit_decoder)**: un decodificador basado en visión (5,75 GB) que procesa las características visuales.
- **Dos DiTs de difusión (high_noise y low_noise)**: dos modelos de difusión Wan2.2 (57,15 GB cada uno) que operan en dos etapas de ruido (alto y bajo) para generar el vídeo.
- **Connector**: un MLP (0,28 GB) que conecta el planner con el renderizador.
- **Mask tokens**: una capa de embedding (0,06 GB) para tokens de máscara.

Esta arquitectura híbrida combina un modelo de lenguaje multimodal (Qwen2.5-VL) como cerebro planificador con un modelo de difusión de doble etapa (Wan2.2) para la síntesis de vídeo. No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). El modelo base es `ByteDance/Bernini-Diffusers-v2`, y este repositorio es una extracción de sus pesos sin modificaciones adicionales, salvo la reorganización en archivos individuales y las cuantizaciones.

## Capacidades

- Generación de vídeo a partir de una imagen y un texto (pipeline `image-text-to-video`).
- Generación de vídeo a partir de texto únicamente (text-to-video), según los tags.
- Transformación de vídeo a vídeo (video-to-video) y de imagen a imagen (image-to-image), según los tags.
- Soporte de múltiples precisiones: FP32, FP8_scaled y NVFP4, lo que permite adaptar el modelo a diferentes capacidades de hardware.
- Integración nativa con ComfyUI mediante la extracción de componentes en archivos safetensors individuales.
- Compatibilidad con LoRAs de aceleración LightX2V 4Step (high_noise y low_noise) para reducir el número de pasos de inferencia.
- Capacidades multilingües del text encoder UMT5-XXL (no se especifican los idiomas concretos).

## Casos de uso

- **Creación de contenido audiovisual para marketing**: un equipo de diseño puede generar vídeos promocionales a partir de una imagen de producto y un guion textual, utilizando el pipeline image-text-to-video. El modelo permite iterar rápidamente sobre variaciones del mensaje sin necesidad de rodajes.
- **Prototipado de escenas para cine y animación**: los directores pueden introducir un storyboard (imagen) y una descripción de movimiento para obtener un vídeo preliminar que sirva como referencia visual antes de la producción final.
- **Generación de vídeos educativos**: a partir de una ilustración y un texto explicativo, se pueden crear animaciones cortas para materiales docentes, facilitando la comprensión de conceptos complejos.
- **Edición de vídeo asistida**: con la capacidad video-to-video, los editores pueden transformar un vídeo existente aplicando cambios de estilo o contenido guiados por texto, sin necesidad de herramientas de composición avanzadas.
- **Desarrollo de agentes conversacionales con salida visual**: integrando el modelo en un sistema de IA conversacional, se pueden generar respuestas en vídeo a partir de imágenes proporcionadas por el usuario, por ejemplo en asistentes de atención al cliente que muestran demostraciones de productos.
- **Investigación en generación de vídeo**: los investigadores pueden utilizar los componentes extraídos para estudiar el comportamiento de cada módulo por separado, o para fine-tuning de subconjuntos específicos (por ejemplo, el planner) sin necesidad de cargar todo el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o métricas específicas de generación de vídeo (FVD, CLIP score, etc.) para este modelo o su base Bernini-Diffusers-v2.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en precisión FP32, el modelo completo requiere aproximadamente 123 GB de memoria (suma de todos los componentes). Con cuantización FP8_scaled, el requisito se reduce a unos 60-70 GB; con NVFP4, podría bajar a unos 30-40 GB, aunque no se especifican los tamaños exactos de las versiones cuantizadas.
- **GPU recomendadas**: para FP32 se necesitan múltiples GPUs de alta gama (por ejemplo, 4× A100 80GB o 2× H100 80GB). Con FP8 o NVFP4, una sola GPU de 80 GB (A100, H100) o incluso una RTX 4090 (24 GB) podría ser insuficiente; se recomienda al menos 48 GB de VRAM para las versiones cuantizadas.
- **Compatibilidad con GPUs de consumo**: las versiones cuantizadas NVFP4 podrían ejecutarse en GPUs con 24 GB de VRAM (RTX 3090/4090) si se cargan los componentes de forma secuencial, pero no está garantizado. La versión FP32 no es viable en hardware de consumo.
- **Opciones de despliegue**: al estar diseñado para ComfyUI, el despliegue natural es mediante nodos personalizados en ComfyUI. También se puede utilizar con la librería `diffusers` cargando los componentes individuales. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de difusión, no un LLM.
- **Latencia y throughput**: no disponible. El uso de LoRAs LightX2V 4Step sugiere que se puede reducir el número de pasos de difusión a 4, lo que acelera la generación, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de generación de vídeo. El modelo base Bernini-Diffusers-v2 de ByteDance es el referente, y este repositorio es una adaptación del mismo. Otros modelos de generación de vídeo de código abierto como Wan2.2 (que constituye la base de los DiTs) o modelos como Stable Video Diffusion podrían ser comparables, pero no se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos específicos para este modelo, pero al estar basado en Qwen2.5-VL y UMT5-XXL, puede heredar sesgos de los datos de entrenamiento de estos modelos base.
- **Riesgo de alucinación**: en generación de vídeo, el modelo puede producir artefactos visuales, movimientos no realistas o inconsistencias entre el texto y la imagen generada. No se han publicado evaluaciones de robustez.
- **Limitaciones de contexto**: la longitud de contexto no está especificada; el text encoder UMT5-XXL tiene un límite de tokens que puede restringir la longitud de las instrucciones textuales.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero es necesario verificar si el modelo base Bernini-Diffusers-v2 tiene restricciones adicionales (no se indica en la información proporcionada).
- **Caveats para producción**: el tamaño del modelo (112,8 GB en FP32) requiere una infraestructura de hardware considerable. Las versiones cuantizadas pueden degradar la calidad de salida. Además, al ser una extracción de componentes, es necesario asegurar que todos los archivos se cargan correctamente en el orden adecuado dentro de ComfyUI.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/rzgar/Bernini-v2-ComfyUI)
- [Modelo base ByteDance/Bernini-Diffusers-v2](https://huggingface.co/ByteDance/Bernini-Diffusers-v2)
- [Repositorio Bernini-R-S2V (fine-tune relacionado)](https://huggingface.co/rzgar/Bernini-R-S2V)
- [Artículo sobre Bernini-R S2V en ComfyUI Wiki](https://comfyui-wiki.com/en/news/2026-07-09-bernini-r-s2v-speech-driven-video)
- [Mirror en GitHub del plugin ComfyUI-WanBerniniS2V](https://github.com/AIMixer/ComfyUI-WanBerniniS2V)
