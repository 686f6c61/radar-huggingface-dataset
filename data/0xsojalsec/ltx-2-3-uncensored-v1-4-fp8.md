# 0xSojalSec/LTX-2.3-uncensored-v1.4-FP8

## Resumen

LTX-2.3-uncensored-v1.4-FP8 es una compilación (merge) no oficial del modelo de generación de vídeo LTX Video 2.3 de Lightricks, publicada por el usuario 0xSojalSec. Se distribuye con los pesos ya fusionados de tres ajustes finos: la LoRA NSFW "Eros10" (fuerza 1.0), la LoRA destilada DMD (fuerza 1.0) y la ICLoRA Detailer oficial de LTXV (fuerza 0.6). El resultado es un modelo de difusión con arquitectura DiT (Diffusion Transformer) de aproximadamente 21 000 millones de parámetros que genera vídeo con audio en muy pocos pasos de muestreo.

El modelo se orienta explícitamente a contenido sin censura (etiqueta `not-for-all-audiences`) y cubre los modos texto a vídeo, imagen a vídeo, vídeo a vídeo, audio a vídeo y las variantes FL2VA, T2VA, I2VA y REF2VA. Gracias a la LoRA DMD integrada, el autor indica que puede producir vídeo en tan solo 4 pasos de inferencia, con 8 pasos como configuración recomendada para calidad, y soporta secuencias de hasta 960 fotogramas (unos 40 segundos).

Su relevancia es doble: por un lado, reduce el coste de inferencia típico de los modelos de vídeo de difusión mediante destilación; por otro, es un ejemplo de la práctica de "baked-in LoRAs", en la que varios ajustes finos se pre-fusionan en un único checkpoint para simplificar el despliegue en ComfyUI. Conviene señalar que el repositorio declara licencia `unknown`, que no tiene descargas ni valoraciones registradas en el momento de la consulta y que la model card mezcla enlaces a rutas de otros repositorios del mismo autor (`ChrisColeTech/...`), lo que dificulta la trazabilidad de los artefactos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de difusión, según la familia LTX Video de Lightricks; el autor menciona explícitamente "DiT" |
| Parametros totales | 21 005 004 544 (~21,0 B) según los metadatos reales del repositorio |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible como "contexto" de texto; en vídeo, el autor reporta generación de hasta 960 fotogramas (~40 s) y 121 fotogramas (~5 s) en los ejemplos |
| Tipos de cuantizacion | FP8 (build principal) y GGUF; los niveles concretos de cuantización GGUF no están disponibles |
| Idiomas soportados | No disponible (la generación es de vídeo/audio; no se documentan idiomas de prompting) |
| Licencia | Unknown (desconocida) |
| Formato de pesos | FP8 y GGUF (la librería declarada es `gguf`); también se incluyen flujos de trabajo JSON de ComfyUI |
| Tamano del repositorio | 239,0 GB |
| Fecha de creacion / actualizacion | 2026-09-27 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a LTX Video 2.3 de Lightricks, un modelo de difusión con backbone transformer (DiT) que procesa latentes de vídeo y genera, además, pista de audio. Sobre ese checkpoint base, esta versión no entrena desde cero: aplica una fusión de adaptadores de bajo rango sobre los pesos, de modo que el modelo final incorpora el comportamiento de los tres adaptadores sin necesidad de cargarlos por separado en el momento de la inferencia.

Los tres componentes fusionados son: Eros10 NSFW LoRA (especializada en contenido explícito, con foco en coherencia y calidad), DMD Distilled LoRA (destilación orientada a reducir el número de pasos, mejorar la preservación facial en imagen a vídeo y el seguimiento de instrucciones) y LTX Video ICLoRA Detailer (adaptador oficial en contexto para mejorar la adherencia a la imagen o imágenes de referencia). No se documentan en la información disponible el número de tokens o fotogramas de entrenamiento, la composición del dataset, ni si se emplearon etapas de RLHF o DPO; en modelos de difusión estas etapas se sustituyen habitualmente por ajuste guiado, pero no hay confirmación en la model card.

La innovación práctica es la destilación DMD: permite funcionar con 4 pasos mínimos y 8 pasos recomendados, frente a las decenas de pasos habituales en difusión de vídeo. Los ejemplos publicados usan resolución 1280 × 736, 121 fotogramas, 8 pasos y CFG 3,5; el autor señala que un CFG más alto produce más movimiento y más audio. No se documentan técnicas de atención lineal ni decodificación especulativa.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado.
- Generación de vídeo a partir de una imagen (image-to-video), con énfasis declarado en preservar la identidad del sujeto.
- Transformación de vídeo existente (video-to-video).
- Generación de vídeo a partir de audio (audio-to-video).
- Variantes multimodales de entrada: FL2VA (primer y último fotograma + audio), T2VA, I2VA y REF2VA (referencias múltiples).
- Generación de secuencias largas: hasta 960 fotogramas (~40 s) según el autor.
- Inferencia en muy pocos pasos: 4 pasos como mínimo, 8 pasos recomendados para calidad, 9 pasos en imagen a vídeo.
- Control de estilo y movimiento mediante CFG: valores bajos (~1,0) para escenas íntimas y pausadas, valores altos (~3,8) para escenas cinematográficas con diálogo y sonido.
- Contenido para adultos sin censura (NSFW), con guardarraíles declarados por el autor para bloquear contenido ilegal.
- Integración con ComfyUI mediante flujos de trabajo JSON publicados en el propio repositorio.
- Tool calling, function calling, razonamiento multi-paso y capacidades de agente: no aplica, es un modelo generativo de vídeo, no un modelo de lenguaje.

## Casos de uso

- Previsualización cinematográfica (previsualización o *animatic*): a partir de un prompt de texto y 8 pasos de muestreo se obtienen unos 5 segundos a 1280 × 736, lo que permite iterar planos antes de rodar, con un coste de cómputo muy inferior al de modelos de difusión de vídeo que requieren 30-50 pasos.
- Animación de fotografías de producto o retrato: el modo image-to-video con 9 pasos y la ICLoRA Detailer integrada están pensados para mantener la identidad del sujeto, útil para convertir una foto fija de catálogo en un clip corto de escaparate.
- Vídeo musical o doblaje con audio: los modos T2VA, I2VA y A2V permiten generar o condicionar el vídeo a partir de una pista de audio, un flujo adecuado para piezas cortas de promoción musical.
- Generación de clips largos de hasta 40 segundos: los 960 fotogramas documentados permiten producir escenas continuas con transiciones internas (por ejemplo, una secuencia con entrada en piscina, giro y salida), evitando el montaje de múltiples fragmentos.
- Investigación sobre destilación en difusión de vídeo: la combinación de DMD y pesos FP8 facilita estudiar el equilibrio entre número de pasos, CFG y fidelidad temporal en hardware limitado.
- Pruebas de alineación y seguridad de modelos: dado su carácter explícito y los guardarraíles declarados, sirve como banco de pruebas para evaluar clasificadores de contenido y filtros de moderación en pipelines de generación de vídeo.
- Creación de contenido para adultos en entornos controlados: es el uso declarado del autor, sujeto a la legislación aplicable y a la verificación de edad y consentimiento.
- Optimización de despliegue en ComfyUI: los flujos JSON incluidos permiten reproducir la configuración exacta (CFG, pasos, resolución) y medir consumo de VRAM y tiempo por iteración en distintas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FVD, CLIPScore, VBench ni similares) ni comparaciones numéricas con otros modelos.

Los únicos datos reproducibles publicados son los ajustes de generación de los ejemplos:

| Escenario | Resolucion | Fotogramas | Duracion aprox. | Pasos | CFG |
|---|---|---|---|---|---|
| Texto a vídeo (ejemplo principal) | 1280 × 736 | 121 | ~5 s | 8 | 3,5 |
| Escena pausada / íntima | no disponible | 121 | ~5 s | 8 | 1,0 |
| Escena cinematográfica con diálogo | no disponible | 121 | ~5 s | 8 | 3,8 |
| Imagen a vídeo | no disponible | no disponible | no disponible | 9 | no disponible |
| Secuencia larga | no disponible | 960 | ~40 s | 9 | no disponible |

## Requisitos de hardware

- VRAM estimada (cálculo propio a partir del recuento de parámetros, no confirmado por el autor): ~21 GB solo para pesos en FP8, más el VAE y el codificador de texto, lo que sitúa el consumo práctico por encima de 24 GB en resolución 1280 × 736.
- En GGUF, una cuantización de 8 bits ocuparía del orden de 21-22 GB y una de 4 bits del orden de 11-12 GB, siempre sumando los componentes auxiliares; los niveles concretos publicados no están disponibles.
- GPU recomendadas: A100 80 GB o H100 para secuencias largas (960 fotogramas) y lotes múltiples; RTX 4090 / RTX 5090 (24-32 GB) para clips cortos en FP8 con gestión cuidadosa de memoria.
- En GPU de consumo: viable en RTX 4090, RTX 3090 (24 GB) o superiores para 121 fotogramas a 1280 × 736; en tarjetas de 12-16 GB solo con cuantizaciones GGUF agresivas y resoluciones reducidas.
- La generación de 960 fotogramas requiere atención sobre secuencias latentes muy largas, por lo que la memoria escala de forma marcada con la duración; se recomienda segmentación o generación por fragmentos en hardware de gama media.
- Opciones de despliegue: ComfyUI es el entorno soportado explícitamente (se incluyen flujos JSON); al ser un modelo de difusión de vídeo, no aplica a vLLM, TGI ni llama.cpp en su uso habitual, aunque el formato GGUF apunta a backends compatibles con GGUF en el ecosistema de difusión.
- Latencia y throughput: no disponibles. El autor solo indica que el modelo funciona desde 4 pasos, lo que reduce el tiempo de inferencia de forma proporcional al número de pasos empleado, pero no publica medidas de tiempo por clip ni de fotogramas por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables dentro de la información proporcionada. La comparación más fiable posible es con los artefactos de los que deriva este merge, todos citados en los metadatos del repositorio:

| Modelo | Relacion | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lightricks/LTX-2.3 | Modelo base oficial | No disponible en la información | No disponible | Repositorio público de Lightricks |
| TenStrip/LTX2.3-10Eros | Base del ajuste NSFW fusionado | No disponible | No disponible | Repositorio público |
| TenStrip/LTX2.3_DMD_Lora | LoRA de destilación fusionada | No disponible (es un adaptador) | No disponible | Repositorio público |
| 0xSojalSec/LTX-2.3-uncensored-v1.4-FP8 | Merge de los tres anteriores, cuantizado | ~21,0 B | Unknown | Este repositorio |

Frente a otros generadores de vídeo abiertos de la misma categoría (por ejemplo, la familia Wan o HunyuanVideo), no hay datos de benchmarks ni especificaciones contrastadas en la información disponible, por lo que no se ofrece comparación numérica. Como referencia de repositorio, las versiones equivalentes del mismo autor publicadas bajo otra cuenta (`ChrisColeTech/LTX-2.3-uncensored-*`) emplean los mismos ajustes de generación (1280 × 736, 121 fotogramas, 8 pasos, CFG 3,5), lo que sugiere una única línea de trabajo replicada entre repositorios.

## Limitaciones y advertencias

- Licencia `unknown`: no hay términos legales explícitos, lo que impide determinar si el uso comercial está permitido. En la práctica, esto bloquea su adopción en producción seria hasta aclarar la licencia del modelo base y de las LoRAs fusionadas.
- Contenido explícito: el modelo está etiquetado como `not-for-all-audiences` y está diseñado para generar material NSFW. El autor afirma que existen guardarraíles contra contenido ilegal, pero no se documenta su naturaleza, su tasa de fallo ni su evaluación.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin historial de versiones ni de incidencias resueltas. La trazabilidad de los artefactos se ve además dificultada por enlaces a rutas de otros repositorios del autor.
- Riesgo de contenido no consentido o de desinformación: cualquier modelo de vídeo sin censura es susceptible de usarse para generar material íntimo falso de personas reales; se requiere verificación de identidad, consentimiento y cumplimiento normativo (por ejemplo, obligaciones de marcado de contenido sintético).
- Alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos de anatomía, continuidad temporal, movimiento de manos y físicas incoherentes; el autor recomienda subir el CFG para más movimiento, lo que a su vez incrementa la probabilidad de artefactos.
- Sin benchmarks: no hay métricas objetivas que permitan estimar su calidad frente al modelo base o frente a alternativas.
- Contexto limitado en la práctica: el texto de instrucción efectivo depende del codificador de texto del modelo base, no documentado aquí; las secuencias largas de 960 fotogramas exigen prompts muy detallados y probablemente segmentación.
- Idiomas: no se documentan idiomas soportados para el prompting. Los ejemplos de la model card están en inglés.
- Consumo de recursos elevado: 239 GB de repositorio y ~21 GB de pesos en FP8 hacen que el almacenamiento y la VRAM sean un cuello de botella real.
- Paso a producción: se recomienda fijar semillas, documentar los flujos de trabajo JSON y añadir una capa de moderación externa antes de exponer el modelo a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/LTX-2.3-uncensored-v1.4-FP8
- Modelo base oficial: https://huggingface.co/Lightricks/LTX-2.3
- Base del ajuste NSFW: https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA de destilación DMD: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Repositorio del autor con flujos de trabajo y ejemplos: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8
- Repositorio relacionado en FP8: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-v1.4-fp8
- Flujo de trabajo ComfyUI de ejemplo (T2AV): https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json
- Paper, blog técnico o demo oficiales: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados técnicos relevantes sobre el modelo (únicamente listados de categorías de sitios para adultos), por lo que no se incluyen como fuentes.
