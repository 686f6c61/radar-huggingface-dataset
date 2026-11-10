# prithivMLmods/flux-3-image-klein-pup-MTP-Repacked

## Resumen

flux-3-image-klein-pup-MTP-Repacked es un modelo vision-lenguaje de 9B parámetros publicado por el usuario prithivMLmods, derivado de black-forest-labs/flux-3-image-klein-pup, que a su vez es un ajuste fino de Qwen3.5-9B con la torre de visión congelada. Su función no es generar imágenes, sino actuar como "prompt upsampler": recibe una petición breve del usuario y la transforma en un prompt detallado y optimizado para el generador de imágenes FLUX 3 Image Klein. Cubre tres modos de operación: text-to-image, edición de imágenes con hasta 10 referencias y generación de layouts con bounding boxes opcionales.

El modelo se ha entrenado con supervisión fina (SFT) seguida de un ajuste por preferencias basado en la calidad de las imágenes generadas. Sus salidas abarcan estilo, escena, iluminación, cámara, materiales, colores y posicionamiento espacial, lo que lo convierte en una pieza intermedia útil en pipelines de generación de imágenes donde la calidad del prompt condiciona el resultado final.

Esta versión concreta es un "repack" que añade soporte de Multi-Token Prediction (MTP) para decodificación especulativa integrada en los pesos, además de cuantizaciones GGUF listas para llama.cpp. La relevancia actual reside en que permite acelerar la inferencia local de un modelo multimodal de 9B sin necesidad de un modelo borrador separado, y en que se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base Qwen3.5-9B con torre de visión congelada), con cabezas MTP para decodificación especulativa |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, mmproj-bf16 |
| Idiomas soportados | en (solo inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards, BF16), GGUF (incluye mmproj para visión) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder-only, al que se le incorpora una torre de visión que permanece congelada durante el ajuste fino. El pipeline de entrenamiento consta de dos fases: primero un ajuste supervisado (SFT) sobre pares de petición breve y prompt detallado, y después un ajuste por preferencias guiado por la calidad de las imágenes generadas con cada prompt. Esta segunda fase alinea las salidas del modelo con prompts que producen mejores resultados en FLUX 3 Image Klein, no solo con prompts plausibles lingüísticamente.

La innovación técnica destacada de este repack es la integración de Multi-Token Prediction (MTP) directamente en los pesos: la arquitectura incluye cabezas adicionales que predicen varios tokens futuros en un solo forward pass, lo que habilita decodificación especulativa sin un modelo borrador externo. Esto se traduce en aceleración de la inferencia local, especialmente en los ficheros GGUF. El modelo cubre tres modos (text-to-image, image editing con hasta 10 referencias y layout generation con bounding boxes opcionales) y genera descripciones que abarcan estilo, escena, iluminación, cámara, materiales, colores y posicionamiento espacial.

## Capacidades

- Generación de prompts detallados y optimizados para FLUX 3 Image Klein a partir de peticiones cortas.
- Prompt upsampling y prompt rewriting en tres modos: text-to-image, edición de imágenes y generación de layouts.
- Procesamiento de imágenes de referencia (hasta 10) para el modo de edición.
- Generación de layouts con bounding boxes opcionales para posicionamiento espacial.
- Comprensión de imagen y texto (pipeline image-text-to-text) gracias a la torre de visión.
- Decodificación especulativa integrada mediante cabezas MTP, sin modelo borrador externo.
- Soporte de inferencia vía transformers, llama.cpp, text-generation-inference y ComfyUI/Diffusers (según la model card).
- Capacidad conversacional (tag "conversational").
- Salidas exclusivamente en inglés.

## Casos de uso

- Enriquecimiento automático de prompts en pipelines de text-to-image: el modelo recibe la petición breve del usuario y la expande con estilo, iluminación, cámara y materiales antes de pasarla a FLUX 3 Image Klein, mejorando la fidelidad del resultado sin intervención manual.
- Edición de imágenes con múltiples referencias: en flujos donde el usuario aporta hasta 10 imágenes de referencia, el modelo genera el prompt de edición que describe la composición deseada, adecuado para tareas de retoque o restyling guiado.
- Generación de layouts y composición espacial: para diseño de escenas con bounding boxes, el modelo produce prompts que especifican posicionamiento de objetos, útil en previsualización de maquetas y storyboards.
- Integración en ComfyUI: al ser compatible con ComfyUI y Diffusers, puede insertarse como nodo de upsampling de prompts en grafos de generación de imágenes existentes.
- Aceleración de inferencia local con GGUF y MTP: en estaciones de trabajo sin GPU de datacenter, los ficheros Q4_K_M o Q5_K_M con cabezas MTP permiten ejecutar el upsampler en llama.cpp con decodificación especulativa integrada.
- Automatización de descripciones visuales para catálogos: dado un conjunto de imágenes de producto, el modelo puede generar descripciones detalladas y consistentes que alimenten un generador de imágenes para variantes de marketing.
- Prototipado rápido de herramientas creativas: desarrolladores que construyen asistentes de generación de imágenes pueden usar el modelo como capa de reescritura de prompts sin entrenar su propio modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 19,3 GB de pesos, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo con margen para el contexto y la torre de visión.
- VRAM estimada en GGUF: Q3_K_M ~4,74 GB, Q4_K_M ~5,78 GB, Q5_K_M ~6,64 GB, Q6_K ~7,56 GB, más el fichero mmproj-bf16 (~922 MB) para capacidades de visión.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en BF16 con throughput alto; RTX 4090 (24 GB) para BF16 ajustado; RTX 3090/4080 (16-24 GB) para cuantizaciones Q5/Q6.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M y superiores en GPUs de 8-12 GB; la versión BF16 requiere 24 GB o más.
- Opciones de despliegue: transformers, llama.cpp, text-generation-inference (TGI), ComfyUI y Diffusers.
- Latencia y throughput: no disponible; la model card indica que MTP acelera la inferencia local mediante decodificación especulativa, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| flux-3-image-klein-pup-MTP-Repacked | ~9,65B | no disponible | Apache 2.0 | Prompt upsampling para FLUX 3 Klein, multimodal | Hugging Face (safetensors + GGUF) |
| black-forest-labs/flux-3-image-klein-pup (base) | no disponible | no disponible | no disponible | Prompt upsampling para FLUX 3 Klein | Hugging Face |
| Qwen3.5-9B (modelo base del LM) | ~9B | no disponible | no disponible | LLM generalista | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Salidas exclusivamente en inglés: no soporta otros idiomas, lo que limita su uso en productos multilingües.
- Optimización específica para FLUX 3 Image Klein: los prompts generados pueden no ser óptimos para otros generadores de imágenes.
- Posibles imprecisiones con detalles pequeños de las imágenes de referencia, según advierte la model card.
- Riesgo de alucinación en la descripción de escenas o atributos no presentes en la petición original.
- No se han publicado benchmarks que permitan validar el rendimiento frente a alternativas.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificarse contra las condiciones del modelo base y de FLUX 3 Image Klein.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validación por parte de la comunidad.
- La longitud de contexto no está documentada, lo que dificulta planificar casos de uso con prompts o referencias extensas.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/flux-3-image-klein-pup-MTP-Repacked
- GGUF: https://huggingface.co/prithivMLmods/flux-3-image-klein-pup-MTP-Repacked/tree/main/GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Configuración: https://huggingface.co/prithivMLmods/flux-3-image-klein-pup-MTP-Repacked/blob/main/config.json
- Plantilla de chat: https://huggingface.co/prithivMLmods/flux-3-image-klein-pup-MTP-Repacked/blob/main/chat_template.jinja
