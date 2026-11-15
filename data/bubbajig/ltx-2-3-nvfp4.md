# Bubbajig/LTX-2.3-nvfp4

## Resumen

LTX-2.3 NVFP4 es una cuantización en formato NVFP4 del modelo LTX-2.3, un modelo fundacional de difusión (DiT) desarrollado por Lightricks que genera vídeo y audio sincronizados dentro de un único modelo. Esta variante concreta, publicada por el usuario Bubbajig, empaqueta el checkpoint completo de 22 000 millones de parámetros en cuantización NVFP4 (formato de 4 bits con escalas de bloque optimizado para GPUs Blackwell), obtenido mediante destilación con conciencia de cuantización (quantization-aware distillation) para preservar la precisión respecto al modelo original.

El modelo base LTX-2.3 es una actualización de LTX-2 que mejora la calidad audiovisual y la adherencia al prompt. Se presenta en el paper "LTX-2: Efficient Joint Audio-Visual Foundation Model" (arXiv:2601.03233) y está pensado para ejecución local práctica con pesos abiertos. Cubre múltiples modalidades: texto a vídeo, imagen a vídeo, vídeo a vídeo, audio a vídeo, texto a audio, vídeo a audio y combinaciones conjuntas de audio y vídeo.

La relevancia de esta ficha radica en que la cuantización NVFP4 reduce de forma drástica los requisitos de memoria frente al checkpoint en bf16, acercando un modelo de 22B de difusión audiovisual a hardware de consumo de gama alta y a GPUs de centro de datos con soporte nativo de FP4. El repo ocupa 21,7 GB y la licencia es la LTX-2 Community License Agreement, no plenamente permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para audio-vídeo conjunto |
| Parametros totales | 22 000 millones (denominación "22b" del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits); el modelo base admite bf16 y fp8 |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt (según metadatos; la model card base indica English) |
| Licencia | ltx-2-community-license-agreement (license: other) |
| Formato de pesos | safetensors (repo diffusers, 21,7 GB) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) que unifica la generación de vídeo y audio en un solo modelo, en lugar de encadenar un generador de vídeo con un modelo de audio separado. Esto permite producir pistas de audio sincronizadas con el vídeo generado. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

La variante NVFP4 se ha entrenado mediante Quantization Aware Distillation, un proceso que ajusta el modelo cuantizado a 4 bits para minimizar la pérdida de precisión respecto al modelo de referencia. Existe también una versión distilled (8 pasos, CFG=1) anunciada como "coming soon" en NVFP4. El codebase oficial (monorepo Lightricks/LTX-2) está probado con Python >= 3.12, CUDA > 12.7 y PyTorch ~= 2.7, e incluye paquetes de definición del modelo, pipelines y entrenamiento.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) e imagen (image-to-video).
- Transformación de vídeo existente (video-to-video) e imagen+texto a vídeo.
- Generación de audio a partir de texto (text-to-audio) y de vídeo (video-to-audio).
- Conversión audio-a-audio.
- Generación conjunta y sincronizada de audio y vídeo (text-to-audio-video, image-to-audio-video, image-text-to-audio-video).
- Generación de audio con habla y sin habla (esta última de menor calidad según el autor).
- Soporte multilingüe declarado en metadatos para nueve idiomas.
- No se documenta soporte de tool calling ni de agentes; es un modelo generativo multimedia, no un LLM conversacional.

## Casos de uso

- Producción de clips publicitarios con audio sincronizado: a partir de una imagen de producto y un prompt se genera vídeo con banda sonora coherente, gracias al modelo conjunto audio-vídeo.
- Doblaje y resincronización: usar video-to-audio para regenerar la pista de audio de un clip existente, o audio-to-video para animar una locución.
- Previsualización de storyboards: convertir ilustraciones (image-to-video) en animaciones de prueba para equipos de dirección antes de producción final.
- Creación de contenido para redes sociales: generar clips cortos con audio integrado en local, sin depender de APIs externas, usando la cuantización NVFP4 para reducir VRAM.
- Prototipado de videojuegos y animación: generar transiciones y efectos con audio a partir de material de referencia (video-to-video).
- Investigación en generación audiovisual: servir como base cuantizada para experimentos de eficiencia y comparación con el checkpoint bf16.
- Generación de material de accesibilidad: producir descripciones sonoras o pistas de audio para vídeo mudo mediante video-to-audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos NVFP4 de 4 bits, el checkpoint de 22B ocupa del orden de 11-13 GB en pesos, más overhead de activaciones y del VAE/decodificador de audio y vídeo; el repo completo son 21,7 GB.
- GPU recomendadas: GPUs con soporte nativo de FP4 (familia NVIDIA Blackwell, p. ej. B200/RTX 50) para aprovechar NVFP4; también puede ejecutarse en A100/H100 con conversión o fallback, con menor ventaja de rendimiento.
- GPU de consumo: el tamaño de pesos sugiere que puede caber en GPUs de consumo de gama alta con 16-24 GB, aunque el pico real depende de resolución y número de frames.
- Despliegue: codebase PyTorch oficial (ltx-pipelines), nodos integrados de LTXVideo en ComfyUI; soporte en Diffusers anunciado como "coming soon".
- Latencia y throughput: no disponibles en la información proporcionada.
- Restricciones de forma: ancho y alto deben ser divisibles por 32; el número de frames debe ser divisible por 8 + 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3 NVFP4 (este) | 22B | no disponible | Vídeo + audio conjunto | LTX-2 Community License | Pesos abiertos en HF |
| LTX-2.3 bf16 (base) | 22B | no disponible | Vídeo + audio conjunto | LTX-2 Community License | Pesos abiertos en HF |
| LTX-2.3 distilled NVFP4 | 22B | no disponible | Vídeo + audio conjunto (8 pasos) | LTX-2 Community License | Anunciado, "coming soon" |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- El modelo no está diseñado para proporcionar información factual; no debe usarse como fuente de datos.
- Como modelo estadístico, puede amplificar sesgos sociales existentes.
- Puede no seguir fielmente el prompt; la adherencia depende mucho del estilo de redacción del prompt.
- Puede generar contenido inapropiado u ofensivo.
- El audio sin habla puede ser de menor calidad.
- La licencia LTX-2 Community License Agreement no es permisiva; revisar condiciones antes de uso comercial.
- Aunque los metadatos listan nueve idiomas, la model card base declara únicamente inglés; verificar el comportamiento multilingüe real.
- La cuantización NVFP4 puede introducir degradación de calidad frente al bf16; el autor indica que se mitigó con quantization-aware distillation, pero no se aportan métricas.
- El soporte en Diffusers aún no está disponible; requiere el codebase oficial o ComfyUI.
- Restricciones de forma (resolución múltiplo de 32, frames múltiplo de 8 + 1) obligan a padding y recorte.

## Enlaces

- Hugging Face: https://huggingface.co/Bubbajig/LTX-2.3-nvfp4
- Modelo base LTX-2: https://huggingface.co/Lightricks/LTX-2
- Paper: https://huggingface.co/papers/2601.03233 (arXiv:2601.03233)
- Repositorio de código: https://github.com/Lightricks/LTX-2
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2
- Demo / playground: https://console.ltx.video/playground/
- Documentación ComfyUI: https://docs.ltx.video/open-source-model/integration-tools/comfy-ui
- Guía de prompting: https://ltx.video/blog/how-to-prompt-for-ltx-2
- Vídeo de presentación: https://youtu.be/o-7us-BR_gQ
- Diffusers: https://huggingface.co/docs/diffusers/main/en/index
