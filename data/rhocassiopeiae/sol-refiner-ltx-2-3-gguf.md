# RhoCassiopeiae/SoL-Refiner-LTX-2.3-GGUF

## Resumen

SoL-Refiner LTX-2.3 GGUF es una cuantización comunitaria del modelo NVIDIA SoL-Refiner LTX-2.3 One-Step, un modelo de refinamiento de vídeo (video-to-video) construido sobre la arquitectura del transformer audiovisual Lightricks LTX-2.3. El modelo original lo desarrolla NVIDIA (a través de Efficient-Large-Model) y esta versión la publica el usuario RhoCassiopeiae en Hugging Face bajo licencia LTX-2 Community License Agreement.

El modelo resuelve el problema del refinamiento y mejora de calidad de vídeo existente: recibe un vídeo de entrada y produce una versión refinada del mismo en un solo paso de inferencia (One-Step), lo que reduce drásticamente el coste computacional frente a los pipelines de difusión multi-paso. Con 13.850.422.513 parámetros totales y un repositorio de 117,3 GB, está pensado para integrarse en flujos de postproducción y encoding de vídeo.

La relevancia de esta versión concreta reside en sus cuantizaciones GGUF (Q4_K, Q6_K y Q8_0), que reducen el peso de 21,6 GB (Q8_0 completo) hasta 8,46 GB (Q4_K solo vídeo), permitiendo ejecutar el refinamiento en GPUs de consumo. Además, se ofrecen variantes "video-only" que eliminan los tensores de audio para workflows que no lo necesitan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer audiovisual (derivado de Lightricks LTX-2.3), refinamiento one-step |
| Parametros totales | 13.850.422.513 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K, Q6_K, Q8_0 (variantes completas y video-only) |
| Idiomas soportados | no disponible (modelo de vídeo, no de texto) |
| Licencia | ltx-2-community-license-agreement (LTX-2 Community License Agreement) |
| Formato de pesos | GGUF (repo de 117,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer audiovisual derivado de Lightricks LTX-2.3, adaptado por NVIDIA como SoL-Refiner en configuración One-Step, es decir, un refinador que genera la salida refinada en una sola evaluación del modelo en lugar de un proceso iterativo de difusión. La arquitectura conserva componentes de atención cruzada audio-vídeo en la variante completa; la variante video-only elimina los tensores específicos de audio y los componentes de atención cruzada audio-vídeo no utilizados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, ya que la model card no los detalla. La modificación aplicada en este repositorio es exclusivamente de cuantización (a Q4_K, Q6_K y Q8_0) y de poda de tensores de audio en las variantes video-only; el autor indica que la eliminación de tensores de audio no introduce pérdida de cuantización adicional, aunque la equivalencia numérica con las versiones completas depende de la implementación de inferencia.

## Capacidades

- Refinamiento de vídeo video-to-video en un solo paso de inferencia (One-Step).
- Mejora de calidad visual de vídeo existente (reducción de artefactos, nitidez, fidelidad perceptual).
- Procesamiento audiovisual completo en las variantes "Full" (audio + vídeo).
- Procesamiento exclusivo de vídeo en las variantes "video-only", con menor consumo de memoria.
- Integración en pipelines de encoding y análisis de calidad de vídeo (el autor cita la aplicación Chromastering como ejemplo).
- No soporta generación de texto ni tool calling: es un modelo generativo de vídeo, no un LLM.
- Capacidades multilingües: no aplicables (modelo no textual).

## Casos de uso

- Postproducción y masterización de vídeo: el modelo refina material rodado o comprimido previamente, mejorando la calidad perceptual antes de la codificación final; encaja en flujos donde se necesita una pasada rápida de mejora sin pipelines de difusión multi-paso.
- Restauración de vídeo comprimido: aplicar el refinador sobre vídeos con artefactos de compresión para recuperar detalle antes de reencodificar, aprovechando la variante Q4_K video-only (8,46 GB) en GPUs de consumo.
- Preprocesado en pipelines de encoding: integrado en aplicaciones como Chromastering, el modelo actúa como etapa de refinamiento AI previa a la codificación con códecs avanzados.
- Análisis de calidad perceptual: generar versiones refinadas de referencia para comparar métricas de calidad objetivas frente al original.
- Flujos de trabajo con HDR: combinado con herramientas de visualización HDR nativa, el refinamiento puede aplicarse antes de la conversión de espacio de color.
- Prototipado e investigación en video-to-video: las cuantizaciones GGUF permiten experimentar con el refinador en hardware asequible sin necesidad de clústeres multi-GPU.
- Despliegue en estaciones de trabajo locales: la variante Q8_0 video-only (14,3 GB) cabe en GPUs de 16 GB o más, habilitando refinamiento local sin servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: Q4_K completo 12,4 GB; Q6_K completo 17,2 GB; Q8_0 completo 21,6 GB; Q4_K video-only 8,46 GB; Q6_K video-only 11,5 GB; Q8_0 video-only 14,3 GB. A estas cifras hay que sumar la memoria de activaciones y del decodificador de vídeo, no cuantificada en la información disponible.
- GPUs recomendadas: no especificadas por el autor; por tamaño de pesos, una RTX 4090 (24 GB) puede alojar cualquier variante completa en Q8_0, y una GPU de 16 GB cubre las variantes video-only Q8_0 y Q6_K.
- Cabe en GPU de consumo: sí, al menos las variantes video-only Q4_K y Q6_K en GPUs de 12-16 GB; las variantes completas requieren 16-24 GB según cuantización.
- Opciones de despliegue: el formato es GGUF, por lo que se orienta a motores de inferencia compatibles con GGUF; el autor advierte que las variantes video-only requieren un motor capaz de cargar el conjunto reducido de tensores. No se detallan motores concretos (llama.cpp, ComfyUI u otros) en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| SoL-Refiner LTX-2.3 GGUF (este) | 13,85 B | GGUF Q4_K/Q6_K/Q8_0 | 8,46-21,6 GB | LTX-2 Community | Cuantización comunitaria, variantes video-only |
| SoL-Refiner LTX-2.3 One-Step (original NVIDIA) | 13,85 B | safetensors | no disponible | LTX-2 Community | Modelo base sin cuantizar |
| Lightricks LTX-2.3 | no disponible | no disponible | no disponible | LTX-2 Community | Modelo audiovisual original sobre el que se construye |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una modificación comunitaria, no una release oficial de NVIDIA ni de Lightricks; no hay garantía de equivalencia bit a bit con el checkpoint sin cuantizar.
- La cuantización puede alterar la precisión numérica y la calidad de salida; el autor no reclama resultados idénticos al original.
- Las variantes video-only no pueden generar ni procesar audio y exigen un motor de inferencia que no dependa de los tensores de audio eliminados.
- La licencia LTX-2 Community License Agreement impone restricciones de uso y redistribución; es obligatorio conservar los textos de licencia, la atribución y los avisos de modificación en redistribuciones.
- Si un checkpoint incluye pesos de Gemma 3 o derivados, se aplican adicionalmente los Gemma Terms of Use y la Gemma Prohibited Use Policy de Google.
- No se dispone de información sobre sesgos, tasas de alucinación visual ni limitaciones de resolución o duración de vídeo.
- El repositorio no incluye la implementación privada de cuantización ni su workflow; la compatibilidad depende del motor de inferencia y del formato exacto de los tensores.
- Modelo sin descargas ni likes relevantes (340 descargas, 0 likes) y sin validación comunitaria extensa en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RhoCassiopeiae/SoL-Refiner-LTX-2.3-GGUF
- Modelo base NVIDIA: https://huggingface.co/Efficient-Large-Model/SoL-Refiner-LTX-2.3-One-Step
- Proyecto NVIDIA SoL-Refiner: https://nvlabs.github.io/Sana/Sol-Refiner/
- Lightricks LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2
- Aplicación Chromastering: https://www.chromastering.app
