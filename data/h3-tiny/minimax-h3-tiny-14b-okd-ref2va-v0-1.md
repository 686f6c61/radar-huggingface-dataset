# H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1

## Resumen

MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1 es un modelo de generación conjunta de vídeo y audio a partir de texto e imágenes de referencia, desarrollado por el proyecto independiente H3-Tiny. Se trata de una versión podada y destilada del transformer Ref2VA de MiniMax-H3 (33B), reducido primero a 17B y después a 14B mediante pruning estructurado y recuperación por destilación de conocimiento (OKD) desde el modelo profesor original. El modelo resuelve el problema del coste computacional de los generadores de vídeo-audio de gran escala, permitiendo ejecutar un flujo Ref2VA con aproximadamente el 42 % de los parámetros del original.

El repositorio contiene únicamente el transformer en formato diffusers (`config.json` más safetensors fragmentados); el codificador de texto, los VAE y los procesadores provienen del checkpoint oficial de MiniMax H3 en formato diffusers, por lo que su uso requiere descargar también el modelo base. El modelo tiene 13.989.119.056 parámetros (13,99B) y se distribuye bajo la licencia comunitaria MiniMax H3, con restricciones territoriales y de uso aceptable.

Es relevante ahora porque demuestra que técnicas de pruning estructurado combinadas con destilación permiten llevar un generador multimodal de vídeo y audio a un tamaño manejable sin reentrenar desde cero, y porque publica pesos en formato ComfyUI, lo que facilita su integración en flujos de trabajo de creación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación conjunta de vídeo y audio (flujo Ref2VA), derivado de MiniMax-H3 |
| Parametros totales | 13.989.119.056 (13,99B, solo transformer) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors fragmentados con `config.json` en layout diffusers |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión que genera vídeo y audio de forma conjunta condicionado por texto e imágenes de referencia (flujo Ref2VA). Parte del transformer Ref2VA de MiniMax-H3 (33B) y aplica un pruning estructurado en dos etapas: primero una reducción de 33B a 17B (MiniMax-H3-Tiny-17B-Pruned-Ref2VA) y después un estrechamiento de las capas FFN de cada bloque, de 14336 a 9792 canales, hasta alcanzar los 14B. Posteriormente, el modelo se recupera mediante OKD (destilación desde el profesor de 33B), lo que compensa la pérdida de capacidad introducida por el pruning.

El muestreo recomendado es de 50 pasos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El repositorio incluye únicamente el transformer; el codificador de texto, los VAE y los procesadores se toman del checkpoint oficial de MiniMax H3 en formato diffusers.

## Capacidades

- Generación de vídeo a partir de texto con imágenes de referencia (reference-to-video).
- Generación de audio conjunta con el vídeo en una sola pasada del modelo.
- Condicionamiento por múltiples imágenes de referencia mediante marcadores tipo `<Picture 1>` en el prompt.
- Generación de secuencias de vídeo de 124 fotogramas (valor usado en el ejemplo de inferencia de la model card).
- Integración con diffusers mediante `h3tiny.pipeline.load_pipeline`.
- Pesos adaptados para ComfyUI disponibles en un repositorio separado.
- Soporte de offloading y distintos backends de atención (mencionado en el README de GitHub).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Generación de vídeo publicitario con audio: a partir de una o varias imágenes de producto como referencia y un prompt descriptivo, el modelo produce un clip de 124 fotogramas con pista de audio sincronizada, adecuado para prototipado rápido de anuncios.
- Previsualización de storyboards: un equipo de producción puede convertir bocetos o fotogramas de referencia en secuencias animadas con sonido para validar ritmo y composición antes del rodaje.
- Creación de contenido para redes sociales: generación de clips cortos con audio integrado a partir de una imagen base, reduciendo la necesidad de herramientas separadas de vídeo y audio.
- Prototipado en estudios de animación: el flujo Ref2VA permite mantener la identidad visual de un personaje a través de imágenes de referencia mientras se generan distintas escenas.
- Investigación en generación multimodal: al ser una versión podada y destilada de un modelo mayor, sirve como banco de pruebas para estudiar el impacto del pruning y la destilación en calidad de vídeo y audio.
- Despliegue en entornos con recursos limitados: con 14B de parámetros frente a los 33B del original, permite experimentar con generación vídeo-audio en hardware más asequible, usando offloading y backends de atención eficientes.
- Integración en ComfyUI: los pesos específicos para ComfyUI permiten incorporar el modelo a flujos de trabajo nodales existentes para creación de contenido iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 13,99B parámetros en el transformer, los pesos en precisión de 16 bits ocupan aproximadamente 28 GB, a lo que hay que sumar el codificador de texto y los VAE del modelo base.
- GPU recomendadas: no disponibles en la documentación; por tamaño, se requiere al menos una GPU con 40-80 GB de VRAM para inferencia sin cuantización (A100 80GB, H100), o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere offloading intensivo de módulos a CPU o RAM del sistema en tarjetas de 24 GB como la RTX 4090.
- Opciones de despliegue: pipeline propio `h3tiny.pipeline` (diffusers), scripts `scripts/infer.py` del repositorio GitHub, y pesos para ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1 | 13,99B (transformer) | no disponible | sin benchmarks publicados | MiniMax H3 Community License | Hugging Face, ComfyUI |
| MiniMaxAI/MiniMax-H3 (modelo base) | 33B (transformer) | no disponible | sin datos en la información disponible | MiniMax H3 Community License | Hugging Face |
| MiniMax-H3-Tiny-17B-Pruned-Ref2VA | 17B (transformer) | no disponible | sin datos en la información disponible | MiniMax H3 Community License | Hugging Face (colección H3-Tiny) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría (generación conjunta vídeo-audio con referencia de imagen) en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo podado y destilado, cabe esperar una pérdida de calidad respecto al MiniMax-H3 original de 33B, aunque no se han publicado métricas que la cuantifiquen.
- Riesgo de alucinación visual y de incoherencias temporales inherente a los modelos de difusión de vídeo; no se documentan evaluaciones al respecto.
- El repositorio contiene solo el transformer: es obligatorio descargar el checkpoint oficial de MiniMax H3 para el codificador de texto, los VAE y los procesadores, lo que incrementa los requisitos de almacenamiento y despliegue.
- La licencia MiniMax H3 Community License incluye un ámbito territorial restringido y una política de uso aceptable; es necesario revisar el acuerdo antes de cualquier uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos.
- El proyecto H3-Tiny es independiente y no está afiliado ni respaldado por MiniMax.
- El modelo se publicó en noviembre de 2026 con 196 descargas y 5 likes, por lo que la comunidad y la validación externa son todavía muy limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Colección H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Pesos para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1/blob/main/LICENSE-MiniMax-H3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
