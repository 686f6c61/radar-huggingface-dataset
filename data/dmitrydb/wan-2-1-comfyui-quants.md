# DmitryDB/Wan-2.1-ComfyUI-Quants

## Resumen

Wan 2.1 es una familia de modelos de difusión para generación de vídeo desarrollada por Wan-AI (Alibaba). Este repositorio concreto, publicado por el usuario DmitryDB, no contiene el modelo original sino una recopilación de checkpoints cuantizados a int8 y los ficheros auxiliares necesarios para ejecutarlos dentro de ComfyUI: el text encoder UMT5-XXL en bf16, el VAE de Wan 2.1, el CLIP Vision H para condicionamiento por imagen y dos LoRAs opcionales (DPO y relight) sobre el checkpoint SCAIL-2. Los pesos mantienen los nombres de fichero y los bytes originales; el autor indica explícitamente que no se trata de releases oficiales ni se han realizado pruebas nuevas de inferencia o rendimiento.

La relevancia de este paquete es práctica: los checkpoints originales de Wan 2.1 en 14B parámetros ocupan decenas de gigabytes en bf16, lo que dificulta su despliegue en GPUs de consumo. La cuantización a int8 reduce el peso de cada checkpoint de difusión a entre 13,5 y 15,5 GiB, acercando la generación de vídeo de alta calidad a hardware más asequible, siempre que se use una versión de ComfyUI con soporte para este formato de cuantización concreto.

El repositorio cubre tres variantes de tarea: text-to-video (T2V) a partir del checkpoint `wan2.1-t2v-14B`, image-to-video (I2V) a 720p con `wan2.1-i2v-720p-14B`, y transferencia de movimiento con el checkpoint separado SCAIL-2. No se proporcionan datos de benchmarks, licencia detallada ni idiomas soportados más allá de lo que indican las fuentes originales enlazadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión para vídeo (Wan 2.1); detalles de la arquitectura interna no disponibles en la información proporcionada |
| Parámetros totales | 14B (según los nombres de fichero de los checkpoints de difusión) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (checkpoints de difusión); bf16 (text encoder, LoRAs, VAE, CLIP Vision) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los ficheros de este repositorio son checkpoints de difusión de la familia Wan 2.1, un modelo de generación de vídeo de 14B parámetros. La información disponible no detalla la arquitectura interna (tipo de backbone, mecanismo de atención, esquema de difusión), el volumen de datos de entrenamiento ni el proceso de alineación. Lo que sí se documenta es el ecosistema de componentes necesarios para la inferencia: un text encoder UMT5-XXL en bf16 (10,582 GiB) para codificar los prompts, el VAE específico de Wan 2.1 en bf16 (0,236 GiB) para codificar y decodificar fotogramas, y CLIP Vision H (1,177 GiB) para el condicionamiento por imagen en el flujo I2V.

La innovación técnica de este paquete es la cuantización int8 de los checkpoints de difusión, etiquetada como "lean" y "Convrot" en los nombres de fichero. El autor no describe el método de cuantización empleado, pero indica que los pesos conservan sus nombres y bytes locales, y que se requiere una versión de ComfyUI con soporte para el modelo y su cuantización. Se incluyen además dos LoRAs opcionales en bf16 sobre SCAIL-2: una de DPO y otra de relight (1,143 GiB cada una), que permiten ajustar el comportamiento del modelo sin recargar el checkpoint principal.

## Capacidades

- Generación de vídeo a partir de texto (T2V) mediante el checkpoint `wan2.1-t2v-14B-int8-lean-Convrot.safetensors`; no requiere imagen de origen.
- Generación de vídeo a partir de imagen (I2V) a 720p mediante `wan2.1-i2v-720p-14B-int8-lean-Convrot.safetensors`, usando el flujo de condicionamiento por imagen con CLIP Vision H.
- Transferencia de movimiento con el checkpoint SCAIL-2, que requiere el flujo de condicionamiento por pose correspondiente.
- Aplicación opcional de una LoRA DPO sobre SCAIL-2 para modificar el estilo de generación.
- Aplicación opcional de una LoRA de relight sobre SCAIL-2 para el reiluminado de la secuencia generada.
- Integración con ComfyUI mediante los loaders nativos, seleccionando los nombres de fichero de este repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generación de clips de vídeo a partir de descripciones textuales en un flujo de ComfyUI: se carga el checkpoint T2V int8 junto con UMT5-XXL y el VAE de Wan 2.1, y se introduce el prompt en el nodo de texto; adecuado para prototipado rápido de ideas visuales sin necesidad de material de origen.
- Animación de imágenes fijas a 720p: el flujo I2V con CLIP Vision H permite convertir una fotografía o ilustración en una secuencia de vídeo, útil para marketing, storyboards o contenido para redes sociales.
- Transferencia de movimiento para doblaje o previsualización de animación: el checkpoint SCAIL-2 con el flujo de pose permite trasladar el movimiento de un vídeo de referencia a un personaje, aplicable en previsualización de VFX y animación.
- Reiluminado de secuencias generadas: la LoRA de relight sobre SCAIL-2 permite ajustar la iluminación de un clip sin regenerarlo desde cero, lo que resulta útil en composición y postproducción ligera.
- Ajuste de estilo mediante LoRA DPO: la LoRA DPO sobre SCAIL-2 permite sesgar la generación hacia preferencias estéticas concretas, útil para equipos que necesitan consistencia visual en una serie de clips.
- Despliegue en estaciones de trabajo con GPU de consumo: al estar cuantizados a int8, los checkpoints de 14B caben en GPUs con 16-24 GB de VRAM, lo que permite montar un entorno local de generación de vídeo sin depender de clústeres.
- Integración en pipelines de ComfyUI existentes: al respetar la estructura de carpetas `ComfyUI/models`, los ficheros se pueden incorporar en flujos ya automatizados para generación por lotes de variaciones de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta subida no constituye nuevas pruebas de inferencia o rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de tamaño de fichero, los checkpoints de difusión int8 ocupan entre 13,538 GiB (T2V) y 15,513 GiB (SCAIL-2); a ello hay que sumar el text encoder UMT5-XXL bf16 (10,582 GiB), el VAE (0,236 GiB) y, en el flujo I2V, CLIP Vision H (1,177 GiB). El consumo real de VRAM durante la inferencia no está documentado.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado. Por el tamaño de los ficheros, los checkpoints de difusión int8 de 14B no caben íntegramente en GPUs de 8-12 GB; harían falta GPUs de gama alta con 16-24 GB o superiores, o bien técnicas de offloading no descritas en la model card.
- Opciones de despliegue: ComfyUI, con una versión que soporte el modelo Wan 2.1 y el formato de cuantización int8 "lean/Convrot" empleado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo en este contexto).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.1 (este repo, int8) | 14B | vídeo; I2V a 720p | int8 y bf16 | other | Hugging Face (repo de terceros) |
| Wan 2.1 original (Wan-AI) | 14B | vídeo; I2V a 720p | bf16 (pesos originales) | no disponible en esta ficha | Hugging Face (Wan-AI) |
| Wan 2.1 ComfyUI repackaged (Comfy-Org) | 14B | vídeo | formatos de ComfyUI | no disponible en esta ficha | Hugging Face (Comfy-Org) |
| SCAIL-2 (zai-org) | no disponible | transferencia de movimiento | no disponible | no disponible en esta ficha | Hugging Face (zai-org) |

La comparativa se limita a las variantes de la misma familia enlazadas por el autor; no se dispone de datos de rendimiento para comparar con modelos de otras familias.

## Limitaciones y advertencias

- Este repositorio no es un release oficial: el autor indica que recopila checkpoints cuantizados y ficheros auxiliares, y que no ha realizado pruebas nuevas de inferencia ni de rendimiento.
- La licencia figura como "other" sin texto de licencia en la información proporcionada; antes de un uso comercial es imprescindible consultar las condiciones de las fuentes originales (Wan-AI, Comfy-Org, zai-org).
- Los checkpoints están cuantizados a int8, lo que puede introducir degradación de calidad respecto a los pesos originales en bf16; no se documenta el impacto medido.
- Requiere una versión de ComfyUI con soporte específico para Wan 2.1 y para el formato de cuantización empleado; versiones sin ese soporte no cargarán los ficheros.
- El flujo I2V a 720p exige CLIP Vision H y el flujo de condicionamiento por imagen; el flujo SCAIL-2 exige el flujo de pose correspondiente. Usar el flujo equivocado impide la generación.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; al ser un modelo de vídeo, el riesgo relevante es la generación de contenido visual inexacto o no fiel al prompt.
- El tamaño de los ficheros (hasta 15,5 GiB por checkpoint más 10,6 GiB del text encoder) implica requisitos de almacenamiento y VRAM considerables; no se especifican requisitos mínimos oficiales.
- Las notas incluidas en el repositorio son históricas según el autor; no deben tomarse como documentación actualizada del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DmitryDB/Wan-2.1-ComfyUI-Quants
- Wan 2.1 I2V 14B 720P (Wan-AI): https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Wan 2.1 ComfyUI repackaged (Comfy-Org): https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- SCAIL-2 (Comfy-Org): https://huggingface.co/Comfy-Org/SCAIL-2
- SCAIL-2 (zai-org): https://huggingface.co/zai-org/SCAIL-2
- Wan 2.2 ComfyUI repackaged (Wan Fun): https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
