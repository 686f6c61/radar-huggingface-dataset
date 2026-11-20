# anguoyang/openai-clip-qcs6490

## Resumen

OpenAI CLIP es un modelo multimodal de recuperación imagen-texto desarrollado por OpenAI, basado en una arquitectura ViT-B/32 que proyecta imágenes y texto a un espacio latente compartido de 512 dimensiones. Este repositorio concreto, publicado por el usuario anguoyang, no redistribuye pesos ni artefactos compilados: es una ficha de medición independiente del rendimiento del modelo sobre el SoC Qualcomm QCS6490 (plataforma Dragonwing RB3 Gen 2), ejecutado con el runtime QNN en precisión fp32.

La relevancia de esta entrada es acotada y muy específica: aporta un punto de referencia reproducible de latencia de inferencia (964,1 ms por grafo) bajo un protocolo uniforme (ONNX fp32, compilación por defecto de AI Hub, perfil de grafo único), comparable con otras 27 mediciones del mismo barrido. No es un modelo entrenado por el autor ni una versión modificada de CLIP; es una medición de terceros orientada a desarrolladores que evalúan despliegues de visión en hardware edge de Qualcomm.

Por tanto, la ficha describe el modelo subyacente (OpenAI CLIP ViT-B/32) y documenta los datos de rendimiento publicados en esta model card, sin atribuir al repositorio capacidades o artefactos que no contiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/32 (vision encoder) + text encoder tipo transformer; proyección a espacio latente compartido de 512 dimensiones |
| Parametros totales | no disponible (el ONNX exportado ocupa 599.127.667 bytes; el recuento de parámetros no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens de texto (fijo, por el tokenizer de CLIP) |
| Tipos de cuantizacion | fp32 en esta medición; el modelo upstream admite otras precisiones vía AI Hub, no detalladas aquí |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT (modelo upstream); la ficha de medición no especifica licencia propia |
| Formato de pesos | ONNX (exportado con qai-hub-models 0.66.0); no se publican pesos en este repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es CLIP en su variante ViT-B/32: un codificador de imágenes basado en Vision Transformer con parches de 32×32 y un codificador de texto transformer, ambos entrenados con un objetivo contrastivo para alinear pares imagen-texto en un espacio común de 512 dimensiones. La entrada de imagen es 1×3×224×224 y la de texto 1×5×77 tokens (cinco secuencias de 77 tokens), produciendo 1×512 características de imagen y 5×512 características de texto.

Esta model card no documenta el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO), ya que no entrena el modelo: solo mide su inferencia. La innovación técnica del repositorio es metodológica, no arquitectónica: exportación a ONNX desde la definición `openai_clip` de qai-hub-models 0.66.0, compilación con opciones por defecto de Qualcomm AI Hub y perfilado de grafo único mediante `submit_inference_job(..., profile=True)`, tomando `execution_summary.estimated_inference_time` como métrica.

## Capacidades

- Recuperación multimodal imagen-texto (búsqueda texto→imagen e imagen→texto) mediante similitud en espacio latente compartido.
- Extracción de embeddings de imagen (512 dimensiones) y de texto (512 dimensiones) para tareas de indexación y búsqueda vectorial.
- Clasificación zero-shot de imágenes mediante prompts textuales.
- Procesamiento de lotes de texto de hasta 5 secuencias de 77 tokens por inferencia en la configuración medida.
- Ejecución en hardware edge Qualcomm vía runtime QNN (perfilada en QCS6490).
- No se documentan en esta ficha capacidades de tool calling, agentes, generación de texto libre, visión generativa ni audio.

## Casos de uso

- Búsqueda semántica de imágenes en catálogos: indexar embeddings de 512 dimensiones de un corpus de imágenes y consultar por texto en lenguaje natural; CLIP es el estándar de facto para este patrón y el perfil en QCS6490 permite desplegarlo en dispositivos edge.
- Moderación y etiquetado automático en el dispositivo: clasificación zero-shot de imágenes con prompts predefinidos, ejecutada localmente en hardware RB3 Gen 2 sin depender de la nube.
- Recuperación en aplicaciones de realidad aumentada o robótica edge: emparejar descripciones textuales con fotogramas de cámara en tiempo casi real, aceptando la latencia medida de ~964 ms por grafo en fp32.
- Filtrado previo en pipelines de visión: usar los embeddings de imagen para deduplicación o clustering antes de un modelo más costoso.
- Evaluación de hardware: servir como referencia de latencia fp32 para comparar el QCS6490 con otros SoCs dentro del barrido de 28 modelos del autor.
- Prototipado de sistemas de accesibilidad: descripción texto↔imagen en dispositivos de bajo consumo, con la advertencia de que la latencia medida corresponde a un perfil de grafo, no a una aplicación completa.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 964,1 ms (964.059 µs) |
| Entrada | 1×3×224×224 imagen + 1×5×77 tokens de texto |
| Salida | 1×512 características de imagen + 5×512 características de texto |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, compilación por defecto de AI Hub |
| Fecha de medición | 2026-11-20 |
| IDs de job | compilación `jg9qv1nwp`, perfilado `jgdmw91rg` |

No se han publicado resultados de benchmarks de calidad (MMLU, ImageNet zero-shot, etc.) en la información disponible. La model card advierte que esta medición no es directamente comparable con la entrada de RB3 del `perf.yaml` upstream (0.66.0), al usar un protocolo distinto.

## Requisitos de hardware

- Hardware de referencia: Dragonwing RB3 Gen 2 Vision Kit con SoC Qualcomm QCS6490 (edge, no GPU de servidor).
- Runtime: QNN de Qualcomm; el flujo de compilación y perfilado se realiza vía Qualcomm AI Hub.
- VRAM: no aplica; el despliegue es en SoC con memoria unificada, y la ficha no publica cifras de memoria.
- GPU de servidor (A100, H100, RTX 4090): no evaluadas en esta medición; el modelo puede ejecutarse en GPU convencional con frameworks estándar, pero no hay datos publicados aquí.
- Opciones de despliegue documentadas: ONNX + QNN vía AI Hub. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia: 964,1 ms por grafo en fp32 (estimación de perfil, no latencia extremo a extremo). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Entorno medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAI CLIP ViT-B/32 (esta ficha) | no disponible | 77 tokens | QCS6490, QNN fp32 | MIT (upstream) | Medición pública; pesos no incluidos |
| Entrada RB3 de `perf.yaml` 0.66.0 | no disponible | 77 tokens | QCS6490 | MIT | Referencia upstream, protocolo distinto |
| Otras mediciones del barrido qcs-bench | no disponible | no disponible | QCS6490 | no disponible | Repositorio público del autor |

No se dispone de datos comparativos de calidad ni de latencia frente a otros modelos de recuperación imagen-texto en la información proporcionada.

## Limitaciones y advertencias

- La ficha no contiene pesos ni artefactos compilados; no es desplegable por sí misma, solo documenta una medición.
- El número de 964,1 ms es una estimación de perfil de grafo único, no latencia extremo a extremo de una aplicación.
- No es comparable directamente con la entrada de RB3 del `perf.yaml` upstream por diferencias de protocolo.
- CLIP tiene sesgos conocidos en la literatura (sesgos de género, raza y cultura en los pares imagen-texto); esta ficha no aporta evaluación específica al respecto.
- Riesgo de alucinación en la interpretación de similitudes: CLIP no genera texto ni razona; las recuperaciones pueden ser semánticamente erróneas en dominios fuera de distribución.
- Ventana de texto fija de 77 tokens, lo que limita consultas largas.
- Idiomas soportados no documentados en esta ficha.
- Licencia MIT del modelo upstream; el uso comercial debe verificar los términos de OpenAI CLIP y de las dependencias de Qualcomm AI Hub.
- Fecha de creación del repositorio (2026-11-20) y cero descargas/likes: sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/openai-clip-qcs6490
- Colección de mediciones qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Barrido completo qcs-bench: https://github.com/anguoyang/qcs-bench
