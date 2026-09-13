# Lightricks/LTX-Video

## Resumen

LTX-Video es un modelo de generación de vídeo de pesos abiertos desarrollado por Lightricks y distribuido en HuggingFace a través de la librería diffusers, con el pipeline declarado como image-to-video. El autor lo presenta como el primer modelo de generación de vídeo basado en DiT (Diffusion Transformer) capaz de generar vídeo de alta calidad en tiempo real: produce vídeo a 30 FPS con resolución 1216×704 a una velocidad superior a la de su propia reproducción.

El repositorio principal aloja un checkpoint de 1.923.385.472 parámetros (aproximadamente 1,92 mil millones), pero la familia documentada por el autor es más amplia e incluye variantes de 13.000 millones de parámetros en versiones dev, distilled y mix, además de versiones cuantizadas en fp8. Esa variedad permite escoger entre máxima calidad (13b-dev), equilibrio entre velocidad y calidad (mix, con renderizado multiescala) o inferencia ligera (2b-distilled) según la VRAM disponible.

Su relevancia actual está en que ofrece generación de vídeo con pesos abiertos integrada en diffusers y en flujos de trabajo de ComfyUI, en un segmento donde buena parte de los generadores de vídeo de alta calidad son propietarios y solo accesibles vía API. La licencia es de tipo "other", por lo que las condiciones de uso comercial deben revisarse en el repositorio del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) |
| Parámetros totales | 1.923.385.472 (checkpoint del repositorio, ~1,92 B); la familia incluye variantes de 13 B |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica en el sentido de los LLM; la documentación no especifica un límite de fotogramas o duración de clip |
| Tipos de cuantización | fp8 (variantes ltxv-13b-0.9.8-fp8, ltxv-13b-0.9.8-distilled-fp8 y ltxv-2b-0.9.8-distilled-fp8); no se documentan otros formatos |
| Idiomas soportados | en (inglés, para los prompts de condicionamiento) |
| Licencia | other (licencia propia de Lightricks; consultar términos) |
| Formato de pesos | safetensors (librería diffusers) |
| Pipeline declarado | image-to-video |
| Resolución y cadencia | 1216×704 a 30 FPS (según el autor) |
| Variantes publicadas | ltxv-13b-0.9.8-dev, ltxv-13b-0.9.8-mix, ltxv-13b-0.9.8-distilled, ltxv-2b-0.9.8-distilled y sus versiones fp8 |
| Tamaño del repositorio | 280,8 GB |
| Descargas | 751.279 |
| Likes | 2.302 |
| Fecha de creación | 31 de octubre de 2024 |
| Última actualización | 16 de julio de 2025 |

## Arquitectura y entrenamiento

LTX-Video se basa en una arquitectura DiT (Diffusion Transformer), un esquema de difusión en el que el denoiser es un transformer en lugar de una U-Net convolucional. El autor indica que fue entrenado sobre un conjunto de datos a gran escala de vídeos diversos y que el resultado son vídeos de alta resolución con contenido realista y variado. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La familia incluye variantes "dev" (máxima calidad y mayor consumo de VRAM), "distilled" (más rápidas y con menor uso de VRAM, con una ligera reducción de calidad, pensadas para iteraciones rápidas) y "mix", que combina los modelos dev y distilled en un mismo flujo de renderizado multiescala para equilibrar velocidad y calidad. Existen además versiones cuantizadas en fp8 de los modelos de 13 B y del de 2 B. La innovación que el autor destaca es la capacidad de generar a 30 FPS en 1216×704 más rápido de lo que se reproduce el vídeo, algo poco habitual en difusión de vídeo, aunque no se especifica el hardware empleado para esa afirmación.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), el pipeline declarado en el repositorio.
- Generación de vídeo guiada por prompt de texto en inglés, además del condicionamiento visual.
- Salida a 1216×704 y 30 FPS, con contenido realista y variado según la documentación del autor.
- Variantes optimizadas para dos regímenes distintos: máxima calidad (13b-dev) e iteración rápida con menor VRAM (distilled y 2b-distilled).
- Flujo de renderizado multiescala en la variante "mix", que encadena modelos dev y distilled en una misma generación.
- Integración nativa con diffusers (LTXPipeline) y con flujos de trabajo de ComfyUI mediante el repositorio ComfyUI-LTXVideo.
- No es un modelo de lenguaje: no soporta tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No se documentan capacidades de audio, visión general (más allá del condicionamiento por imagen) ni generación de texto.

## Casos de uso

- Animación de imágenes fijas para publicidad: a partir de una fotografía de producto o de un key visual se genera un clip en movimiento a 1216×704 y 30 FPS, apto para anuncios cortos sin necesidad de rodaje.
- Previsualización de storyboards en producción audiovisual: convertir viñetas o fotogramas de referencia en animáticas para validar encuadres, ritmo y movimiento antes de invertir en rodaje o en render 3D.
- Contenido para redes sociales: generación rápida de clips cortos a partir de una imagen base, apoyándose en las variantes distilled para iterar sobre varias versiones en poco tiempo.
- Vídeo de producto en comercio electrónico: animar la foto principal de un artículo para mostrar movimiento o contexto de uso en la ficha de producto.
- Recuperación y dinamización de material de archivo: animar fotografías históricas o imágenes fijas de un catálogo para piezas documentales o museísticas.
- Generación de B-roll y recursos de relleno en edición: producir planos de recurso a partir de una imagen de referencia para cubrir transiciones o vacíos en un montaje.
- Creación de datos sintéticos de vídeo: generar clips para aumentar datasets de entrenamiento de otros modelos de visión o de vídeo, siempre que la licencia lo permita.
- Prototipado dentro de ComfyUI: integrar el modelo en grafos de nodos ya existentes para experimentar con pipelines de imagen a vídeo sin escribir código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento aportado por el autor es una afirmación cualitativa: el modelo genera vídeo a 30 FPS en 1216×704 más rápido de lo que se reproduce. No se especifica la GPU utilizada, la duración del clip ni la métrica exacta, por lo que no puede tratarse como un benchmark reproducible.

## Requisitos de hardware

- VRAM estimada para el checkpoint de ~1,92 B en fp16: en torno a 4 GB solo para pesos, más el decodificador VAE y las activaciones del proceso de difusión, lo que en la práctica sitúa el consumo en el rango de 8 a 12 GB (estimación a partir del número de parámetros, no confirmada en la documentación).
- VRAM estimada para las variantes de 13 B: en torno a 26 GB en fp16 solo para pesos y cerca de 13 GB en las versiones fp8, a lo que hay que sumar VAE y activaciones (estimaciones propias, no publicadas por el autor).
- GPU recomendadas: para las variantes de 13 B, GPU de centro de datos tipo A100 (40/80 GB) o H100; para las variantes fp8 de 13 B, una RTX 4090 de 24 GB o similar puede ser viable con gestión cuidadosa de memoria.
- Encaje en GPU de consumo: el modelo de ~2 B es el candidato realista para GPU de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080/4090); el 13b-distilled-fp8 sería el siguiente escalón, con más presión de memoria.
- Opciones de despliegue: diffusers (LTXPipeline), ComfyUI mediante los flujos de ejemplo de ComfyUI-LTXVideo, y el script inference.py con los ficheros YAML del repositorio de GitHub. No aplica el despliegue con vLLM ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles como cifra medida; la única referencia es la afirmación de generación en tiempo real a 30 FPS y 1216×704 sin especificar hardware.

## Comparativa con modelos similares

La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: los resultados obtenidos correspondían a sitios de apuestas deportivas sin relación alguna con LTX-Video, por lo que no se han podido extraer comparativas externas. Como referencia interna, esta es la comparativa entre las variantes documentadas por el propio autor:

| Variante | Parámetros | Notas del autor | Workflow de ComfyUI |
|---|---|---|---|
| ltxv-13b-0.9.8-dev | 13 B | Máxima calidad, requiere más VRAM | ltxv-13b-i2v-base.json |
| ltxv-13b-0.9.8-mix | 13 B | Combina dev y distilled en renderizado multiescala para equilibrar velocidad y calidad | ltxv-13b-i2v-mixed-multiscale.json |
| ltxv-13b-0.9.8-distilled | 13 B | Más rápido, menos VRAM, ligera pérdida de calidad; ideal para iterar rápido | ltxv-13b-dist-i2v-base.json |
| ltxv-2b-0.9.8-distilled | ~1,92 B | Modelo pequeño, ligera pérdida de calidad frente al 13b distilled; pensado para VRAM limitada | No disponible |
| ltxv-13b-0.9.8-fp8 | 13 B (cuantizado) | Versión cuantizada del 13b | ltxv-13b-i2v-base-fp8.json |
| ltxv-13b-0.9.8-distilled-fp8 | 13 B (cuantizado) | Versión cuantizada del 13b-distilled | ltxv-13b-dist-i2v-base-fp8.json |
| ltxv-2b-0.9.8-distilled-fp8 | ~1,92 B (cuantizado) | Versión cuantizada del 2b-distilled | No disponible |

## Limitaciones y advertencias

- Licencia "other": las condiciones de uso comercial, redistribución y atribución dependen de los términos de Lightricks, que no se detallan en la información proporcionada; es imprescindible revisarlos antes de un despliegue en producción.
- Idiomas: solo se declara soporte para inglés en los prompts de condicionamiento. Los prompts en otros idiomas, incluido el castellano, no están soportados oficialmente y pueden degradar el resultado.
- Coherencia temporal: la información disponible no documenta garantías sobre la consistencia de sujetos, fondos o iluminación en clips largos, un problema habitual en difusión de vídeo.
- Riesgo de artefactos y de desviación del prompt: el autor reconoce una "ligera reducción de calidad" en las variantes distilled y de 2 B, lo que implica que el equilibrio entre velocidad y fidelidad es explícito.
- No es un modelo de lenguaje: no debe evaluarse ni usarse para generación de texto, razonamiento, código, tool calling ni flujos de agentes.
- Sesgos: no se documenta en la información proporcionada ninguna evaluación de sesgos demográficos, culturales o de representación del dataset de entrenamiento.
- Rendimiento no reproducible: la afirmación de generación en tiempo real no incluye hardware, duración de clip ni metodología, por lo que no debe tomarse como una cifra garantizada en despliegues propios.
- Tamaño del repositorio: 280,8 GB, lo que exige planificar el almacenamiento y la descarga selectiva de checkpoints si no se necesita la familia completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lightricks/LTX-Video
- Repositorio de código y configuración: https://github.com/Lightricks/LTX-Video
- Config de ltxv-13b-0.9.8-dev: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev.yaml
- Config de ltxv-13b-0.9.8-dev en fp8: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev-fp8.yaml
- Config de ltxv-13b-0.9.8-distilled en fp8: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-distilled-fp8.yaml
- Config de ltxv-2b-0.9.8-distilled en fp8: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-2b-0.9.8-distilled-fp8.yaml
- Repositorio de nodos para ComfyUI: https://github.com/Lightricks/ComfyUI-LTXVideo
- Workflow image-to-video del 13b: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-base.json
- Workflow multiescala mixto del 13b: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-mixed-multiscale.json
- Workflow image-to-video del 13b distilled: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/13b-distilled/ltxv-13b-dist-i2v-base.json
- Workflow image-to-video del 13b en fp8: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-base-fp8.json
- Workflow image-to-video del 13b distilled en fp8: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/13b-distilled/ltxv-13b-dist-i2v-base-fp8.json
- Espacio de trabajo en la plataforma del autor: https://app.ltx.studio/motion-workspace?videoModel=ltxv-13b
- Espacio de trabajo con la variante distilled: https://app.ltx.studio/motion-workspace?videoModel=ltxv
