# infosave/SAM3-cmf

## Resumen

SAM3-cmf es un reempaquetado en formato CMF (single-file) del modelo facebook/sam3 de Meta, publicado por el usuario infosave para su uso con el runtime en Rust `cortiq`. SAM3 es la tercera iteración de Segment Anything: un modelo de segmentación de instancias invocable por prompt (texto, cajas o puntos) que además incorpora un rastreador de vídeo con banco de memoria. Este repositorio no introduce pesos nuevos, sino que consolida todas las secciones del modelo original (trunk ViT, neck FPN, torre de texto CLIP, detector DETR, codificador de geometría, decodificador de máscaras y tracker) en un único fichero de 1,96 GB con cuantización mixta.

La relevancia de esta ficha es práctica: permite ejecutar SAM3 sin el stack de Python/transformers, mediante un binario Rust con rutas CPU, Vulkan y CUDA. El autor reporta paridad numérica con la referencia de Hugging Face en las seis etapas del pipeline y un rendimiento de 3,7 s por imagen de 1008×1008 en una RTX A5000 con backend CUDA.

El modelo conserva la licencia Sam License del original, por lo que las restricciones de uso comercial son las de facebook/sam3 y no las de un modelo abierto convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT con windowed attention) + neck FPN estilo SAM2 + torre de texto CLIP con tokenizador BPE + detector DETR (200 queries) + codificador de geometría + decodificador de máscaras + tracker de vídeo con banco de memoria |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; el prompt de texto es una frase corta) |
| Tipos de cuantizacion | q8_2f para proyecciones 2-D, f16 para convoluciones, f32 para normas, tablas de geometría y torre de texto |
| Idiomas soportados | en, ru, zh (prompts de texto) |
| Licencia | Sam License (upstream facebook/sam3), etiquetada como `other` |
| Formato de pesos | CMF single-file (`sam3-q8_2f.cmf`, 1.962.174.217 bytes) |

## Arquitectura y entrenamiento

El modelo es un pipeline de segmentación promptable compuesto por varias etapas encadenadas: una torre de texto CLIP que codifica el prompt, un trunk ViT con atención ventaneada que extrae características de la imagen, un neck FPN de estilo SAM2, un detector DETR con 200 queries, un codificador de geometría que acepta cajas y puntos, un decodificador de máscaras y, opcionalmente, un tracker de vídeo con banco de memoria que mantiene identificadores de pista estables entre fotogramas. El autor no documenta el proceso de entrenamiento ni los datos utilizados, ya que se trata de una cuantización del checkpoint original de Meta.

La innovación de este repositorio es el empaquetado y la cuantización mixta: un solo fichero CMF contiene todas las secciones más la configuración del proveedor y el tokenizador BPE. La cuantización aplica q8_2f a las proyecciones 2-D, f16 a las convoluciones y mantiene en f32 las normas, las tablas de geometría y la torre de texto. El autor reporta paridad de CPU con la referencia de `transformers` en 6/6 etapas (torre de texto, trunk, encoder, decoder, cajas y máscaras), paridad del tracker con coseno ≥ 0,9999 sobre un fixture de 3 fotogramas, y un test end-to-end sobre vídeo sintético de 8 fotogramas con caja a ≤1 px del ground truth, un único track id estable e IoU de máscara de 1,000 por fotograma.

## Capacidades

- Segmentación de instancias por prompt de texto en lenguaje natural (en, ru, zh).
- Segmentación por prompt geométrico: cajas y puntos.
- Detección de objetos con 200 queries DETR y puntuaciones por instancia.
- Rastreo de vídeo con banco de memoria y un identificador de pista estable entre fotogramas.
- Entrada de vídeo desde directorio de fotogramas PNG o fichero mp4/mkv/webm/mov/avi (extracción de fotogramas vía ffmpeg).
- Salida de máscaras como PNG superpuesto y metadatos JSON con cajas, puntuaciones y estabilidad de identificadores.
- Ejecución en CPU, Vulkan y CUDA con paridad de máscaras pixel a pixel entre rutas.
- No soporta tool calling, agentes ni generación de texto libre: es un modelo de visión especializado.

## Casos de uso

- Anotación semiautomática de datasets de visión: dado un prompt de texto por clase, el modelo genera máscaras y cajas listas para revisión humana, reduciendo el coste de etiquetado en proyectos de segmentación.
- Segmentación interactiva en herramientas de edición: integración del binario `cortiq` en una aplicación de escritorio para seleccionar objetos por descripción textual en lugar de dibujar polígonos manualmente.
- Rastreo de objetos en vídeo de vigilancia o análisis deportivo: el tracker con banco de memoria mantiene un track id estable, lo que permite seguir un objeto descrito por texto a lo largo de un clip sin reidentificación manual.
- Preprocesado para pipelines de visión downstream: generar máscaras de instancias para recorte, medición o clasificación posterior en flujos que ya dispongan de un backend Rust.
- Automatización de control de calidad industrial: segmentar piezas o defectos descritos textualmente en imágenes de inspección, con despliegue en CPU cuando no haya GPU disponible.
- Procesamiento por lotes en servidores sin Python: al ser un binario Rust con fichero único, encaja en entornos contenedorizados mínimos donde instalar el stack de PyTorch no es viable.
- Investigación en segmentación promptable: servir como referencia de cuantización mixta para comparar precisión frente al checkpoint original.

## Benchmarks y rendimiento

El autor no publica métricas de benchmarks estándar (mIoU en SA-1B, COCO, etc.). Los únicos datos numéricos disponibles son de latencia y de validación de paridad:

| Medicion | Backend | Resultado |
|---|---|---|
| Imagen 1008×1008, un prompt de texto | CUDA | 3,7 s |
| Imagen 1008×1008, un prompt de texto | Vulkan | 15,5 s |
| Imagen 1008×1008, un prompt de texto | CPU | 46,2 s |
| Vídeo, por fotograma | CUDA | 3,5 s |
| Vídeo, por fotograma | Vulkan | 18,6 s |
| Vídeo, por fotograma | CPU | 68,0 s |

Hardware de medida: RTX A5000 (24 GB) con Xeon Gold 6342 (96 hilos), `cortiq` 0.8.86. En CUDA se ejecutan en GPU la torre de texto, el trunk ViT, el neck, el detector, el decodificador de máscaras y la atención del tracker; en Vulkan solo el trunk y la self-attention del detector.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 1,96 GB; con overhead de runtime y buffers de activación para 1008×1008, se recomienda un mínimo de 8 GB de VRAM para la ruta CUDA completa.
- GPU recomendadas: RTX A5000 (medida por el autor), y por capacidad, A100, H100, RTX 4090, RTX 3090 o superiores.
- GPU de consumo: cabe en tarjetas con 8 GB o más; en 6 GB puede requerir ajustes no documentados.
- Despliegue: exclusivamente mediante el runtime `cortiq` v0.8.34 o superior (v0.8.86 para rutas GPU). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de segmentación y no de generación de texto.
- Latencia: 3,7 s por imagen en CUDA, 15,5 s en Vulkan y 46,2 s en CPU; 3,5/18,6/68,0 s por fotograma de vídeo respectivamente.
- Variable de entorno `CMF_GPU=0` fuerza la ruta CPU; `CMF_GPU=cuda` activa CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/prompt | Vídeo | Licencia | Formato |
|---|---|---|---|---|---|
| SAM3-cmf (este) | no disponible | texto, cajas, puntos | sí (tracker con memoria) | Sam License | CMF cuantizado |
| facebook/sam3 | no disponible | texto, cajas, puntos | sí | Sam License | safetensors (upstream) |
| SAM 2 (facebook/sam2) | no disponible | puntos, cajas | sí (memoria) | Apache 2.0 / Sam License según variante | safetensors |
| SAM 1 (facebook/sam) | no disponible | puntos, cajas | no | Apache 2.0 | safetensors |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada. La diferencia principal de SAM3-cmf frente al checkpoint original es el formato (un solo fichero CMF cuantizado frente a safetensors) y el runtime (Rust frente a PyTorch/transformers); frente a SAM 1 y SAM 2, SAM3 añade prompts de texto mediante torre CLIP.

## Limitaciones y advertencias

- Licencia Sam License: no es una licencia de código abierto permisiva; revisar las condiciones antes de cualquier uso comercial. El repositorio solo reempaqueta pesos, no concede derechos adicionales.
- Dependencia estricta del runtime `cortiq` (v0.8.34+, v0.8.86 para GPU); no es utilizable con las herramientas habituales del ecosistema Hugging Face.
- No se documentan sesgos del modelo; al heredar los pesos de facebook/sam3, arrastra los sesgos del dataset original de Meta, no descritos en esta ficha.
- Riesgo de segmentación incorrecta o incompleta ante prompts ambiguos, objetos ocluidos o clases poco representadas; el autor solo valida paridad numérica, no calidad semántica.
- Idiomas de prompt limitados a en, ru y zh; no hay evidencia de soporte para castellano.
- El tracker de vídeo se valida sobre un fixture sintético de 3 fotogramas y un vídeo sintético de 8 fotogramas; el comportamiento en vídeo real largo no está documentado.
- El rendimiento en CPU (46,2 s por imagen) lo hace poco apto para uso interactivo sin GPU.
- No hay benchmarks publicados de calidad (mIoU, precisión de cajas) frente a otros modelos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/SAM3-cmf
- Modelo base: https://huggingface.co/facebook/sam3
- Licencia upstream: https://huggingface.co/facebook/sam3/blob/main/LICENSE
- Runtime cortiq: https://github.com/infosave2007/cmf
