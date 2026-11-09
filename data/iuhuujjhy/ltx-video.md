# Iuhuujjhy/LTX-Video

## Resumen

LTX-Video es un modelo de generación de vídeo basado en Diffusion Transformer (DiT) desarrollado por Lightricks. Se trata del primer modelo de su categoría capaz de generar vídeo de alta calidad en tiempo real: produce clips a 30 FPS y resolución 1216×704 a una velocidad superior a la de reproducción. El modelo está entrenado sobre un conjunto de datos a gran escala de vídeos diversos y genera contenido realista y variado. La versión publicada en el repositorio de Hugging Face bajo el identificador `Iuhuujjhy/LTX-Video` corresponde a la variante image-to-video (I2V) y se distribuye en formato diffusers.

La relevancia del modelo radica en su planteamiento de eficiencia: frente a otros generadores de vídeo que requieren decenas de pasos de difusión y tiempos de inferencia elevados, LTX-Video apuesta por una arquitectura DiT optimizada para generar a velocidades superiores al tiempo real. El repositorio aloja una familia de variantes (13B dev, 13B mix, 13B distilled, 2B distilled y sus versiones cuantizadas en fp8) orientadas a distintos equilibrios entre calidad, consumo de VRAM y velocidad de iteración.

El checkpoint concreto alojado en este repositorio tiene 1.923.385.472 parámetros en safetensors, lo que lo sitúa en el rango de los 2B parámetros, coherente con la variante `ltxv-2b-0.9.8-distilled` de la familia. La licencia es "other", lo que obliga a consultar los términos específicos del autor antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para generación de vídeo |
| Parámetros totales | 1.923.385.472 (checkpoint alojado; familia disponible hasta 13B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de texto) |
| Tipos de cuantización | fp8 (variantes oficiales de la familia); el checkpoint alojado está en safetensors sin cuantizar |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | other |
| Formato de pesos | safetensors (librería diffusers, pipeline `LTXPipeline`) |

## Arquitectura y entrenamiento

LTX-Video emplea una arquitectura Diffusion Transformer (DiT), es decir, un transformer que actúa como backbone del proceso de difusión en lugar de las arquitecturas U-Net clásicas usadas en generación de imagen y vídeo. El modelo está entrenado sobre un conjunto de datos a gran escala de vídeos diversos, según indica la model card, y genera vídeo de alta resolución con contenido realista y variado. La familia incluye variantes "dev" (máxima calidad, mayor consumo de VRAM), "distilled" (más rápidas y con menor uso de VRAM, con ligera pérdida de calidad) y "mix" (combinación de dev y distilled en un flujo de renderizado multiescala para equilibrar velocidad y calidad).

La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco especifica innovaciones técnicas internas más allá de la propia arquitectura DiT y el objetivo de generación en tiempo real a 30 FPS y 1216×704. El checkpoint alojado en este repositorio, con 1.923.385.472 parámetros, se corresponde con el rango de la variante de 2B de la familia, aunque la model card no asocia explícitamente este ID a una variante concreta.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), que es el pipeline declarado del repositorio.
- Generación de vídeo a 30 FPS y resolución 1216×704, con velocidad de inferencia superior al tiempo real según el autor.
- Producción de vídeo de alta resolución con contenido realista y variado, entrenado sobre un dataset amplio de vídeos.
- Variantes de la familia con distintos equilibrios calidad/velocidad/VRAM: dev, distilled, mix y fp8.
- Soporte de flujos de trabajo en ComfyUI mediante los workflows oficiales de Lightricks (LTXV-13b, distilled y fp8).
- Integración con la librería diffusers a través del pipeline `LTXPipeline`.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-step, audio ni visión más allá de la imagen de condicionamiento de entrada.

## Casos de uso

- Prototipado rápido de vídeo generativo: la variante distilled y el checkpoint de 2B permiten iterar sobre ideas visuales con bajo consumo de VRAM, ideal para estudios que necesitan explorar variaciones antes de comprometerse con un render final de mayor calidad.
- Animación de imágenes fijas para marketing: a partir de una fotografía de producto o un key visual, el pipeline image-to-video genera clips animados a 1216×704 y 30 FPS, adecuados para piezas cortas en redes sociales.
- Previsualización de storyboards en producción audiovisual: el modelo permite convertir fotogramas clave en clips animados para validar ritmo y composición antes del rodaje o del render 3D definitivo.
- Generación de contenido para entornos interactivos: la velocidad superior al tiempo real a 30 FPS hace viable la generación de vídeo en aplicaciones donde la latencia importa, como demos en vivo o instalaciones.
- Creación de material para videojuegos y experiencias XR: clips de vídeo generados a partir de arte conceptual para prototipos de cinemáticas o texturas animadas.
- Investigación en generación de vídeo: el modelo sirve como baseline DiT reproducible en diffusers para experimentos académicos sobre difusión en vídeo, comparación de schedulers y estudios de eficiencia.
- Automatización de contenido editorial: generación de clips de apoyo a partir de imágenes de archivo para artículos, newsletters o presentaciones, con workflows de ComfyUI que permiten encadenar el modelo con otros nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card. La familia incluye variantes fp8 y una variante de 2B "ideal for light VRAM usage", lo que sugiere que el checkpoint de 2B puede ejecutarse en GPUs de consumo, mientras que las variantes de 13B requieren hardware profesional.
- GPU recomendadas: no disponible. Por el tamaño de la familia (hasta 13B) y las variantes fp8, se orienta a GPUs de datacenter (A100, H100) para las variantes de 13B y a GPUs de consumo para la variante de 2B, aunque el autor no publica una tabla de requisitos.
- ¿Cabe en GPU de consumo? La variante de 2B distilled está descrita como "ideal for light VRAM usage", lo que apunta a que sí es viable en GPUs de consumo; no se especifican modelos concretos.
- Opciones de despliegue: diffusers (`LTXPipeline`), scripts `inference.py` con configuraciones YAML oficiales y workflows de ComfyUI (repositorio `ComfyUI-LTXVideo`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: el autor afirma generación a 30 FPS y 1216×704 "faster than they can be watched", es decir, por encima del tiempo real, pero no se publican cifras concretas de latencia por clip ni de throughput en GPUs específicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Resolución / FPS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-Video (este repo, 2B) | 1.923.385.472 | DiT image-to-video | 1216×704 a 30 FPS | other | Hugging Face + diffusers + ComfyUI |
| LTX-Video 13B dev/distilled | hasta 13B (familia) | DiT image-to-video | 1216×704 a 30 FPS | other | Hugging Face + diffusers + ComfyUI |
| Otros generadores de vídeo DiT | no disponible | DiT | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos competidores que permitan una comparación cuantitativa rigurosa. La comparativa se limita, por tanto, a las variantes de la propia familia LTX-Video.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los términos exactos publicados por Lightricks antes de cualquier uso comercial; la model card no detalla las restricciones.
- Idioma: la model card declara únicamente inglés (`en`), lo que limita el uso en otros idiomas para prompts y descripciones.
- El checkpoint alojado en este repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el ID de autor no coincide con el repositorio oficial de Lightricks; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.
- El repositorio ocupa 208,8 GB, un tamaño muy superior al de los pesos del checkpoint (1.923.385.472 parámetros), lo que sugiere que incluye múltiples variantes o artefactos adicionales; verificar el contenido antes de descargar.
- La model card no documenta sesgos conocidos, tasas de alucinación visual ni limitaciones específicas de contenido; se recomienda evaluar cualitativamente los resultados en el dominio de aplicación.
- Las variantes distilled presentan, según el autor, una "slight quality reduction" frente a las dev; no usar distilled cuando la calidad sea el criterio principal.
- No se publican requisitos de hardware ni cifras de latencia por GPU, lo que dificulta el dimensionamiento de infraestructura.
- Al ser un modelo de difusión de vídeo, no soporta tool calling, agentes ni razonamiento multi-step; no debe evaluarse con los criterios de un LLM.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Iuhuujjhy/LTX-Video
- Repositorio oficial de código: https://github.com/Lightricks/LTX-Video
- Repositorio de workflows ComfyUI: https://github.com/Lightricks/ComfyUI-LTXVideo
- Configuración 13B dev: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev.yaml
- Configuración 13B distilled: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-distilled.yaml
- Configuración 2B distilled: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-2b-0.9.8-distilled.yaml
- Configuración 13B fp8: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev-fp8.yaml
- Workflow ComfyUI 13B i2v base: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-base.json
- Workflow ComfyUI 13B i2v mixed multiscale: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-mixed-multiscale.json
- Workflow ComfyUI 13B distilled i2v base: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/13b-distilled/ltxv-13b-dist-i2v-base.json
- Workflow ComfyUI 13B fp8 i2v base: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-base-fp8.json
- Workflow ComfyUI 13B distilled fp8: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/13b-distilled/ltxv-13b-dist-i2v-base-fp8.json
- Espacio de trabajo LTX Studio (13B): https://app.ltx.studio/motion-workspace?videoModel=ltxv-13b
- Espacio de trabajo LTX Studio (distilled): https://app.ltx.studio/motion-workspace?videoModel=ltxv
