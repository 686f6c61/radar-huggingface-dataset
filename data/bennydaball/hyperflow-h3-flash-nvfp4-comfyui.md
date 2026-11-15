# BennyDaBall/HyperFlow-H3-Flash-NVFP4-ComfyUI

## Resumen

HyperFlow H3 Flash NVFP4 es una cuantización de un solo archivo del modelo de generación de vídeo HyperFlow H3 Flash, desarrollada por BennyDaBall para su uso directo en ComfyUI. El modelo base, obra de VideoRebirthAI, es una variante podada, de bajo rango y de pocos pasos de MiniMax H3, capaz de generar vídeo con audio sincronizado a partir de texto, una primera imagen, primera y última imagen, o imágenes de referencia. Esta versión cuantizada traslada los pesos y las activaciones a 4 bits (NVFP4) para reducir el peso y acelerar la inferencia en hardware Blackwell.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización de precisión mixta (W4A4) pensado para GPUs de la generación Blackwell: RTX 50 series, RTX PRO Blackwell y DGX Spark. El autor reporta que el archivo `fl2va` ocupa 10,94 GB frente a 16,01 GB de la versión INT8 oficial, y que la generación de 5 segundos de vídeo a 1344x768 con audio se completa en 48 segundos en una RTX 5090, un 5 % más rápido que la INT8 oficial y 1,4 veces más rápido que el BF16 original.

No se dispone de información sobre el número de parámetros, la longitud de contexto (en el sentido de ventana de tokens de texto) ni los idiomas soportados, ya que la model card se centra en aspectos de cuantización y despliegue. El repositorio tiene un tamaño de 22,5 GB y contiene tanto el transformer `fl2va` como el `ref2va`, además de recursos de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (text-to-video / image-to-video) basado en MiniMax H3, variante podada, de bajo rango y de pocos pasos; transformer con bloques densos cuantizados |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4: pesos y activaciones a 4 bits); existen variantes BF16 e INT8 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | diffusion-single-file (archivo único para ComfyUI), cuantización NVFP4 |

## Arquitectura y entrenamiento

El modelo base HyperFlow H3 Flash es una adaptación de MiniMax H3 con poda, descomposición de bajo rango y destilación a pocos pasos, orientada a la generación rápida de vídeo con audio. La arquitectura subyacente es un transformer de difusión con dos variantes funcionales: `fl2va`, que acepta texto, primera imagen y primera y última imagen, y `ref2va`, que acepta imágenes de referencia. Cada transformer contiene 120 matrices de bloques densos, que son exactamente las capas que la versión INT8 oficial cuantiza.

Esta ficha concreta no entrena el modelo, sino que aplica una cuantización NVFP4 nativa (pesos y activaciones a 4 bits) sobre esas capas. El autor indica que el proceso se calibró sobre todos los modos de uso: texto a vídeo, primera imagen, primera y última imagen e imágenes de referencia, en orientación horizontal y vertical, clips de 5 y 10 segundos, a 4, 6 y 8 pasos, con imagen y sonido conjuntos. Como referencia técnica, se menciona una comparación con una cuantización NVFP4 round-to-nearest de las mismas capas, sobre la que se reporta una mejora de LPIPS medio de 0,48 a 0,37 frente al render BF16 en 10 prompts retenidos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), con audio sincronizado.
- Generación de vídeo a partir de una primera imagen (image-to-video).
- Generación de vídeo a partir de primera y última imagen (interpolación condicionada).
- Generación de vídeo a partir de una o varias imágenes de referencia (reference-to-video), incluyendo composición de personaje y entorno.
- Generación conjunta de imagen y sonido (audio integrado en el clip).
- Soporte de resoluciones horizontales y verticales: 1344x768, 1920x1088, 768x1344.
- Soporte de clips de 5 y 10 segundos.
- Control del número de pasos de muestreo (4, 6 y 8 pasos), con recomendación de 8 pasos para máxima calidad.
- Integración directa en ComfyUI mediante el loader oficial y los flujos de trabajo oficiales.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo textual.

## Casos de uso

- Prototipado rápido de vídeo publicitario: con clips de 5 segundos a 1344x768 generados en torno a 48 segundos en una RTX 5090, un equipo puede iterar sobre decenas de variaciones de un anuncio en una sola sesión, usando texto a vídeo y luego primera imagen para fijar la composición.
- Creación de contenido para redes sociales en formato vertical: el soporte de 768x1344 y clips de 5 y 10 segundos permite producir piezas para stories y reels sin reencuadrar, partiendo de un prompt o de una imagen de referencia.
- Animación de retratos y personajes con audio: la variante `ref2va` con una imagen de referencia mantiene la identidad del sujeto entre planos, útil para vídeos de presentación, avatares o demos de producto con una línea de diálogo.
- Interpolación de planos para postproducción: el modo de primera y última imagen permite generar transiciones coherentes entre dos fotogramas clave, reduciendo el trabajo manual de animación en secuencias cortas.
- Generación de material para previsualización de guiones: un guionista puede convertir descripciones textuales en clips de 10 segundos con diálogo hablado para validar ritmo, encuadre y ambientación antes de rodar.
- Pruebas de concepto en hardware de consumo: al ser un archivo único de 10,94 GB para `fl2va`, cabe en GPUs Blackwell de consumo y permite a estudios pequeños o desarrolladores independientes experimentar con generación de vídeo y audio sin infraestructura de centro de datos.
- Evaluación de pipelines de difusión en ComfyUI: sirve como referencia ligera para comparar latencia y calidad frente a BF16 e INT8 en flujos de trabajo existentes, ya que es drop-in con el loader oficial.

## Benchmarks y rendimiento

El autor publica medidas de latencia y tamaño en una RTX 5090 con ComfyUI 0.45.0, grafo oficial de texto a vídeo, `fl2va`, 1344x768, 124 fotogramas, sampler euler, CFG 1, 6 pasos, tiempo total del prompt en caliente (mediana de 6 ejecuciones, incluyendo muestreo, decodificación de vídeo y audio y guardado en MP4):

| Archivo del transformer | Tamano | 5 s a 1344x768 |
|---|---:|---:|
| BF16 original | 27,56 GB | 68,0 s |
| INT8 oficial | 16,01 GB | 50,7 s |
| NVFP4 (este repositorio) | 10,94 GB | 48,0 s |

Datos adicionales reportados: `fl2va` pasa de 16,01 GB (INT8) a 10,94 GB (NVFP4), y `ref2va` de 16,43 GB a 11,37 GB. La calidad se evalúa con LPIPS medio frente al render BF16 sobre 10 prompts retenidos: 0,37 para este archivo frente a 0,48 para una cuantización NVFP4 round-to-nearest equivalente, siendo mejor en 10 de 10 prompts al mismo tamaño. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable en un modelo de generación de vídeo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el transformer `fl2va` pesa 10,94 GB y `ref2va` 11,37 GB en NVFP4, por lo que se necesita margen adicional para activaciones, decodificadores de vídeo y audio y el resto del grafo de ComfyUI.
- GPU recomendadas: RTX 5090 (medición oficial), RTX PRO 6000 Blackwell (usada en la creación del archivo), RTX PRO Blackwell en general y DGX Spark.
- Compatibilidad con GPUs de consumo: sí, en tarjetas Blackwell de la serie RTX 50; el modelo está construido específicamente para instrucciones NVFP4 de esa generación.
- Opciones de despliegue: ComfyUI con el loader oficial de HyperFlow y los flujos de trabajo oficiales; el formato es diffusion-single-file, no pensado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 48 segundos para 5 segundos de vídeo con audio a 1344x768, 6 pasos, en una RTX 5090; el autor recomienda 8 pasos para máxima calidad, con un clip de 5 segundos en torno a un minuto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash NVFP4 (este repo) | no disponible | no disponible | 48,0 s para 5 s a 1344x768 en RTX 5090; LPIPS 0,37 vs BF16 | minimax-h3-community-license-agreement | Hugging Face, 22,5 GB |
| HyperFlow H3 Flash INT8 oficial | no disponible | no disponible | 50,7 s para 5 s a 1344x768 en RTX 5090 | minimax-h3-community-license-agreement | Hugging Face (modelo base) |
| HyperFlow H3 Flash BF16 original | no disponible | no disponible | 68,0 s para 5 s a 1344x768 en RTX 5090 | minimax-h3-community-license-agreement | Hugging Face (modelo base) |

No se dispone de información sobre otros modelos de generación de vídeo comparables en la documentación proporcionada, por lo que la comparativa se limita a las tres variantes de precisión del mismo modelo base.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce pérdida de calidad frente al BF16; el autor reporta un LPIPS medio de 0,37, no una equivalencia exacta.
- El modelo está diseñado para hardware Blackwell con soporte NVFP4; no funcionará en GPUs Ampere, Ada u otras arquitecturas sin soporte nativo de esa cuantización.
- El rendimiento medido corresponde a una única configuración (RTX 5090, ComfyUI 0.45.0, grafo oficial, 1344x768, 124 fotogramas, euler, CFG 1, 6 pasos); otros ajustes pueden arrojar latencias distintas.
- La licencia minimax-h3-community-license-agreement impone condiciones específicas de uso; debe revisarse el enlace de licencia del modelo base antes de cualquier uso comercial.
- No se documentan sesgos, comportamiento multilingüe ni tasas de alucinación del modelo base en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente y sin validación comunitaria amplia.
- La fecha de creación indicada (2026-11-15) y los identificadores arXiv citados no han podido verificarse con la información disponible; conviene contrastarlos antes de citarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/HyperFlow-H3-Flash-NVFP4-ComfyUI
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Licencia del modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash/blob/main/LICENSE
- Prompts de ejemplo: https://huggingface.co/BennyDaBall/HyperFlow-H3-Flash-NVFP4-ComfyUI/blob/main/assets/PROMPTS.md
- Imágenes de entrada y referencia: https://huggingface.co/BennyDaBall/HyperFlow-H3-Flash-NVFP4-ComfyUI/tree/main/input
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
