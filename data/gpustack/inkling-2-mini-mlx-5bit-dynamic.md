# gpustack/Inkling-2-Mini-MLX-5bit-dynamic

## Resumen

Inkling-2-Mini-MLX-5bit-dynamic es una cuantización dinámica de 5 bits en formato MLX del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicada por el equipo de gpustack. El modelo base emplea la arquitectura propietaria `inkling2_loop` (un transformer con controladores de bucle y capas MoE, según se deduce de los módulos `switch_mlp` y `loop_controller` presentes en la configuración de cuantización) y acepta entradas de imagen y texto (`image-text-to-text`). Esta versión está pensada específicamente para Apple Silicon mediante la librería `mlx-vlm` en su versión 0.8.1 o superior.

La relevancia de esta ficha radica en que permite ejecutar un modelo de aproximadamente 26.400 millones de parámetros en hardware de Apple con un peso total de unos 17,88 GiB, gracias a una cuantización mixta: 8 bits para embeddings, `lm_head` y proyecciones de atención, 5 bits para los expertos enrutados del MoE, y BF16 preservado para la torre de visión, normas, routers y controladores de bucle. Además, incluye un drafter especulativo (`incoai/Inkling-2-Mini-DFlash2`) cuantizado en FP8 por bloques, empaquetado bajo el directorio `speculator/`, lo que habilita decodificación especulativa nativa.

El resultado es un artefacto de despliegue orientado a inferencia local en Mac con capacidades multimodales y aceleración por especulación, bajo licencia Apache-2.0. No obstante, la información pública sobre el modelo base (idiomas, contexto, datos de entrenamiento, benchmarks) es muy limitada en la model card disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con capas MoE `switch_mlp` y controladores de bucle, según configuración de cuantización); torre de visión multimodal |
| Parametros totales | 26.388.641.280 (~26,4 mil millones) |
| Parametros activos | no disponible (arquitectura MoE, pero sin desglose de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine `group_size = 64`: 8-bit (`Q8G64`) en embeddings, `lm_head` y proyecciones de atención; 5-bit (`Q5G64`) en expertos enrutados del MoE; BF16 preservado en `vision_tower.*`, normas, routers, controladores de bucle y convoluciones cortas; speculator en FP8 por bloques |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 5 shards, ~17,88 GiB) |

## Arquitectura y entrenamiento

El modelo base `thinkingmachines/Inkling-2-Mini` emplea la arquitectura `inkling2_loop`, que según los nombres de módulos presentes en la configuración de cuantización (`switch_mlp.{gate_proj,up_proj,down_proj}`, `loop_controller`, `gate_attn`, `wq_du`, `wk_dv`, `wv_dv`, `wo_ud`, `wr_du`) combina capas de mezcla de expertos (MoE) con mecanismos de control de bucle y proyecciones de atención específicas. Incluye además una torre de visión (`vision_tower.*`) que se mantiene íntegra en BF16 en esta cuantización, lo que confirma su naturaleza multimodal. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica más destacable de este artefacto es la cuantización dinámica mixta por módulo: se aplican precisiones distintas según la sensibilidad de cada componente (8 bits para embeddings, `lm_head` y proyecciones de atención, con 146 overrides explícitos en `config.json`; 5 bits para los expertos enrutados; BF16 para visión, normas y routers). Adicionalmente, se empaqueta un drafter especulativo `incoai/Inkling-2-Mini-DFlash2` cuantizado en FP8 por bloques bajo el directorio `speculator/`, lo que permite decodificación especulativa con el runtime `mlx-vlm >= 0.8.1`. No se detalla en la información disponible el proceso de entrenamiento del modelo base ni del drafter.

## Capacidades

- Generación de texto conversacional en formato chat (`conversational`).
- Comprensión de imágenes y texto combinados (`image-text-to-text`): descripción de imágenes, respuesta a preguntas sobre contenido visual.
- Razonamiento multimodal, al integrar torre de visión con el modelo de lenguaje.
- Mezcla de expertos (MoE) con enrutamiento por token, lo que permite mayor capacidad de parámetros con coste de cómputo por token inferior al de un modelo denso equivalente.
- Decodificación especulativa mediante el drafter DFlash2 incluido, orientada a reducir latencia en Apple Silicon.
- Ejecución nativa en MLX sobre Apple Silicon con `mlx-vlm >= 0.8.1`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede procesar capturas de pantalla, fotografías o diagramas junto con instrucciones en texto y generar descripciones o respuestas, aprovechando la torre de visión preservada en BF16 y la ejecución nativa en MLX sobre Apple Silicon.
- Descripción y etiquetado de imágenes en flujos de trabajo personales: con un peso de ~17,88 GiB, cabe en Macs con memoria unificada de 32 GB o más, permitiendo clasificar o describir lotes de imágenes sin enviar datos a la nube.
- Prototipado de aplicaciones de visión-lenguaje: desarrolladores que quieran validar pipelines `image-text-to-text` en local antes de escalar a infraestructura GPU pueden usar este artefacto con `mlx-vlm` y el drafter especulativo para reducir latencia interactiva.
- Generación de código asistida en local: la model card incluye un ejemplo de generación de una función Fibonacci en Python, lo que indica uso previsto para tareas de código; adecuado para entornos de desarrollo en Mac donde la privacidad del código es prioritaria.
- Chat conversacional con contexto visual: integrable en aplicaciones de escritorio o notebooks Jupyter en macOS para conversaciones multi-turno donde el usuario adjunta imágenes, gracias al pipeline `conversational` y `image-text-to-text`.
- Evaluación comparativa de cuantizaciones: investigadores pueden usar esta versión de 5 bits dinámicos frente a otras cuantizaciones del mismo modelo base para medir el impacto de la precisión mixta en calidad y velocidad sobre Apple Silicon.
- Inferencia de bajo consumo en hardware de consumo: al no requerir GPU dedicada, encaja en estaciones de trabajo Mac para tareas de análisis de documentos con imágenes, resúmenes visuales o asistencia en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~17,88 GiB de pesos en 5 shards; se recomienda al menos 24 GB de memoria unificada y, para margen de trabajo con contexto y drafter, 32 GB o más en Apple Silicon.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4 y variantes Pro/Max/Ultra) con memoria unificada suficiente; no está diseñado para GPUs NVIDIA/AMD convencionales al ser formato MLX.
- ¿Cabe en GPU de consumo? Sí, en Macs de consumo con memoria unificada de 32 GB o superior; no aplica a GPUs dedicadas de consumo tipo RTX 4090 por incompatibilidad de formato.
- Opciones de despliegue: `mlx-vlm >= 0.8.1` (comando `python -m mlx_vlm generate`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible; la inclusión del drafter especulativo DFlash2 sugiere una optimización de latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| gpustack/Inkling-2-Mini-MLX-5bit-dynamic | ~26,4 mil millones | no disponible | MLX safetensors, `mlx-vlm` | Apache-2.0 | Cuantización 5-bit dinámica con speculator FP8; solo Apple Silicon |
| thinkingmachines/Inkling-2-Mini (base) | ~26,4 mil millones (mismo base) | no disponible | safetensors (BF16 presumiblemente) | Apache-2.0 | Modelo original sin cuantizar; mayor huella de memoria |
| incoai/Inkling-2-Mini-DFlash2 | no disponible | no disponible | safetensors | Apache-2.0 | Drafter especulativo del mismo ecosistema, incluido en este repo |

No se dispone de información sobre otros modelos comparables de la misma categoría (multimodales MoE de ~26B) en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 5 bits en los expertos del MoE puede degradar la calidad respecto al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El modelo base está etiquetado como `Inkling-2-Mini`; la información sobre sesgos, alucinación e idiomas no está disponible públicamente en la model card.
- Longitud de contexto no documentada: no es posible planificar aplicaciones con requisitos de contexto largo sin verificación empírica.
- Restricción de plataforma: al ser un artefacto MLX, no es portable a GPUs NVIDIA/AMD ni a servidores Linux convencionales sin reconversión; limita su uso en producción a infraestructura Apple.
- Dependencia estricta de `mlx-vlm >= 0.8.1`; versiones anteriores no cargarán el layout de cuantización.
- El drafter especulativo en FP8 por bloques requiere soporte del runtime; su fallo o desactivación afecta solo a la latencia, no a la corrección, pero conviene validarlo.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini` y del drafter `incoai/Inkling-2-Mini-DFlash2`, ambos también Apache-2.0 según la model card.
- Sin benchmarks publicados: no se puede afirmar rendimiento comparable a otros modelos de su tamaño sin evaluación propia.
- Riesgo de alucinación y sesgos inherentes a modelos de lenguaje: no cuantificado en la información disponible.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/gpustack/Inkling-2-Mini-MLX-5bit-dynamic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter especulativo: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Librería `mlx-vlm`: no se proporciona URL directa en la información disponible
- Paper, blog o demo: no disponible
