# shreshthsaini/brightrate-study-gemma4-26b-sdr

## Resumen

Este adaptador PEFT (LoRA) es el resultado del estudio BrightRate-LM, desarrollado por Shreshth Saini y colaboradores para la evaluación perceptual de calidad de vídeo HDR generado por usuarios. Se basa en el modelo multimodal Gemma 4 26B A4B de Google (arquitectura MoE con 26 mil millones de parámetros totales y 4 mil millones activos) y añade una capa de adaptación LoRA de rango 16 entrenada sobre el conjunto de datos BrightVQ.

El modelo recibe ocho fotogramas HDR muestreados uniformemente, convertidos a un proxy SDR mediante tone-mapping, y devuelve una puntuación de calidad perceptual interpolada entre cinco niveles de calidad. Está pensado exclusivamente para investigación en evaluación de calidad de vídeo sin referencia (no-reference) y sus puntuaciones no están calibradas para otros conjuntos de datos o dominios.

La relevancia de este adaptador radica en que aplica un VLM de última generación a una tarea de regresión perceptual, demostrando que los modelos fundacionales pueden adaptarse eficazmente a tareas de calidad de vídeo con un coste de entrenamiento reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma 4 26B A4B (MoE transformer multimodal) |
| Parametros totales | No disponible (adaptador LoRA rango 16; modelo base 26B) |
| Parametros activos | 4B (modelo base MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 con alpha 32 y dropout 0.05 sobre el modelo base Gemma 4 26B A4B, un transformer multimodal con arquitectura de mezcla de expertos (MoE) que activa 4 mil millones de parámetros por token. El entrenamiento se realizó durante dos épocas con un horizonte de programación coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch de 1 y acumulación de gradientes de 8. Los objetivos MOS (Mean Opinion Score) se interpolaron a través de cinco niveles de calidad expresados como palabras.

La entrada consiste en ocho fotogramas HDR muestreados uniformemente, convertidos a un proxy SDR mediante tone-mapping y presentados en orden temporal. El entrenamiento se realizó sobre la división 0 separada por contenido del conjunto de datos BrightVQ.

## Capacidades

- Evaluación de calidad perceptual de vídeo HDR sin referencia (no-reference).
- Procesamiento de secuencias de imágenes en orden temporal (ocho fotogramas).
- Regresión de puntuaciones MOS interpoladas en cinco niveles de calidad.
- Pipeline image-text-to-text: recibe imágenes y texto, produce texto.
- Adaptación eficiente mediante LoRA sobre un modelo fundacional multimodal.
- Diseñado específicamente para vídeo HDR generado por usuarios (UGC).

## Casos de uso

- Investigación en evaluación de calidad de vídeo HDR: el adaptador permite estudiar cómo los VLM pueden predecir la calidad perceptual de vídeo HDR generado por usuarios, comparando sus puntuaciones con MOS humanos.
- Desarrollo de pipelines de transcodificación adaptativa: las puntuaciones del modelo pueden integrarse en sistemas de selección de bitrate o resolución para vídeo HDR en plataformas de streaming.
- Benchmarking de algoritmos de mejora de vídeo: permite evaluar de forma automática si un algoritmo de mejora (superresolución, denoising, tone-mapping) produce mejoras perceptibles en calidad.
- Análisis de calidad en plataformas UGC: puede aplicarse a vídeos subidos por usuarios en redes sociales para detectar problemas de calidad como exposición incorrecta, ruido o artefactos de compresión.
- Investigación académica en VQA: sirve como punto de partida para estudiar la transferencia de adaptadores LoRA entre conjuntos de datos de calidad de vídeo y para comparar estrategias de representación de entrada (fotogramas HDR frente a SDR).
- Estudio de scaling laws en evaluación de calidad: el adaptador forma parte del estudio BrightRate-LM, que investiga cómo el tamaño del modelo y la representación de entrada afectan a la precisión en tareas de calidad perceptual.

## Benchmarks y rendimiento

En el conjunto de prueba de la división 0 de BrightVQ (420 vídeos), el adaptador obtiene los siguientes resultados:

| Metrica | Valor |
|---|---|
| SROCC | 0.8568 |
| PLCC | 0.8639 |
| KRCC | 0.6651 |
| RMSE | 6.8711 |

No se han publicado resultados comparativos con otros modelos de evaluación de calidad de vídeo en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.1 GB, pero la inferencia requiere cargar el modelo base Gemma 4 26B A4B completo.
- El modelo base es una mezcla de expertos con 26B parámetros totales y 4B activos, lo que implica requisitos de VRAM inferiores a un modelo denso de 26B equivalente.
- No se dispone de datos específicos de VRAM, latencia o throughput en la información proporcionada.
- Para despliegue, se puede utilizar el ecosistema PEFT de Hugging Face junto con el modelo base, y opciones de inferencia como vLLM o TGI si se integra el adaptador.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros adaptadores de evaluación de calidad de vídeo en la información proporcionada. El modelo base, Gemma 4 26B A4B, pertenece a la familia Gemma 4 de Google, que incluye cinco tamaños: E2B, E4B, 12B, 26B A4B y 31B. Todos los modelos Gemma 4 incorporan un modelo borrador dedicado para decodificación especulativa, lo que acelera la inferencia sin pérdida de calidad.

## Limitaciones y advertencias

- Las puntuaciones del modelo no están calibradas para otros conjuntos de datos, pipelines de visualización o dominios de vídeo distintos de los utilizados en el entrenamiento.
- El adaptador está destinado exclusivamente a fines de investigación; no se recomienda su uso en producción sin una validación adicional.
- La licencia del adaptador no está especificada, por lo que se debe contactar con el autor antes de cualquier uso comercial.
- No se dispone de información sobre los idiomas soportados ni sobre la longitud de contexto del adaptador.
- El modelo puede heredar sesgos del modelo base Gemma 4, aunque la tarea de regresión de calidad reduce el riesgo de generación de contenido no deseado.
- El repositorio tiene cero descargas y cero likes, lo que indica que es un artefacto de investigación reciente sin validación comunitaria amplia.

## Enlaces

- [HuggingFace: shreshthsaini/brightrate-study-gemma4-26b-sdr](https://huggingface.co/shreshthsaini/brightrate-study-gemma4-26b-sdr)
- [BrightVQ (conjunto de datos)](https://github.com/shreshthsaini/BrightVQ)
- [BrightRate-LM (código)](https://github.com/shreshthsaini/BrightRate-LM)
- [Gemma 4 — Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 model overview — Google AI for Developers](https://ai.google.dev/gemma/docs/core)
- [google/gemma-4-26B-A4B — Hugging Face](https://huggingface.co/google/gemma-4-26B-A4B)
- [Gemma 4 model card — Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
