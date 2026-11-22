# carsenk/Inkling-2-Mini-ROGUE-MLX-4bit

## Resumen

Inkling-2-Mini-ROGUE-MLX-4bit es una conversión a formato MLX de 4 bits del modelo Inkling-2-Mini-ROGUE, una versión editada mediante la técnica ROGUE del modelo base thinkingmachines/Inkling-2-Mini. El autor de la conversión es carsenk, y el modelo está pensado para ejecutarse en Apple Silicon mediante la librería mlx-lm. La arquitectura subyacente es un transformer con mezcla de expertos (MoE): el checkpoint original almacena sus expertos enrutados en NVFP4 (MXFP8 en las capas 20–23), y esta build preserva esa codificación nativa mientras cuantiza el resto de pesos a 4 bits afines (group size 64), resultando en 5,25 bits por peso y un tamaño de 16 GB.

La particularidad principal del modelo es que ha sido sometido al proceso ROGUE, un método de edición de pesos que elimina la dirección de rechazo (refusal direction) mediante una proyección ortogonal de bajo rango aplicada a las matrices que escriben en el stream residual. Según la model card, esto reduce la tasa de rechazo ante prompts dañinos del 75,0% al 0,0% sin afectar a la utilidad en respuestas exactas (91,7% en ambos casos). No se trata de un adaptador ni de un filtro de inferencia, sino de un cambio directo en los pesos.

Es relevante ahora porque permite ejecutar un modelo MoE multimodal (pipeline image-text-to-text) en hardware de consumo de Apple con un consumo de memoria de 16 GB, aunque con la advertencia de que la eliminación del rechazo tiene implicaciones de seguridad importantes y de que la build de 4 bits MLX no reproduce completamente el efecto del checkpoint nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), con núcleo en bucle (capas 6–17 ejecutadas tres veces por token) y convoluciones cortas causales post-escritura |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 128 expertos enrutados por capa seleccionada; sin experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (group size 64) para pesos no expertos; expertos enrutados en NVFP4 nativo (MXFP8 en capas 20–23); 5,25 bits por peso |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 16 GB |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer con mezcla de expertos que incorpora varias particularidades arquitectónicas: un núcleo en bucle donde las capas 6 a 17 se ejecutan tres veces por token, convoluciones cortas causales depthwise tras cada salida de atención (`wo_ud`) y tras la proyección descendente de los expertos enrutados (`w2`), y 128 expertos enrutados por capa sin experto compartido. Los pesos de los expertos enrutados se almacenan en NVFP4 nativo, con MXFP8 en las capas 20–23. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

La edición ROGUE, aplicada por WeightDojo, estima direcciones de rechazo a partir de contrastes de activación entre prompts dañinos y benignos balanceados, puntúa profundidades candidatas sobre prompts de retención con preservación del subespacio benigno, y aplica una proyección ortogonal de bajo rango a las matrices que escriben en el stream residual. Para Inkling-2-Mini se implementaron manejos específicos: decodificación y recodificación de los expertos en su empaquetado nativo, eliminación del span de la dirección y sus imágenes de convolución para que la eliminación sea exacta tras las convoluciones cortas, calibración sobre la pasada final de las capas en bucle, y difusión de la edición a los 128 expertos enrutados de cada capa seleccionada.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat y parámetro `reasoning_effort` (por ejemplo, "low").
- Razonamiento con traza de razonamiento (reasoning trace) y presupuesto de tokens configurable.
- Procesamiento de imagen y texto (pipeline image-text-to-text), según los tags del modelo.
- Razonamiento matemático y aritmético (evaluado en GSM8K).
- Seguimiento de instrucciones (evaluado en IFEval).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación direccional del rechazo sobre el comportamiento del modelo, comparando con el checkpoint base en las mismas condiciones de cuantización y runtime.
- Evaluación de técnicas de edición de pesos: sirve como caso de estudio de ROGUE aplicado a arquitecturas MoE con empaquetado nativo NVFP4 y convoluciones post-escritura, documentado con métricas de drift de distribución (KL 0,130, perplejidad relativa 1,116).
- Despliegue local en Apple Silicon: con 16 GB de pesos y mlx-lm, puede servirse mediante `mlx_lm.server` en un equipo M1 Ultra u otros chips Apple con memoria suficiente para prototipos y demos.
- Experimentación con modelos MoE multimodales en hardware de consumo: permite probar cargas image-text-to-text en un portátil o estación Apple sin GPU dedicada.
- Pruebas de robustez y jailbreak en entornos controlados: al carecer de rechazo aprendido, es útil para analizar cómo responde el modelo base ante prompts sensibles, siempre con salvaguardas externas.
- Benchmarking de cuantización: comparar el comportamiento de la build MLX 4-bit frente al checkpoint nativo y los GGUF Q4_K_M–Q8_0 en tareas de razonamiento y seguimiento de instrucciones.

## Benchmarks y rendimiento

Datos publicados en la model card. Las comparaciones son contra el modelo oficial procesado de forma idéntica (mismo formato, cuantización y runtime).

Comportamiento de rechazo (ROGUE Pareto v2, 40 prompts, MLX, checkpoint nativo, reasoning off, presupuesto de 1024 tokens):

| Metrica | Base | ROGUE |
|---|---:|---:|
| Tasa de rechazo ante prompts dañinos | 75,0% | 0,0% |
| Sobre-rechazo en prompts sensibles pero benignos | 0,0% | 0,0% |
| Retain score (utilidad de respuesta exacta) | 91,7% | 91,7% |

Capacidad (lm-evaluation-harness vía llama-server, Q8_0, reasoning off, 40 muestras por tarea):

| Tarea | Base Q8_0 | ROGUE Q8_0 |
|---|---:|---:|
| GSM8K (5-shot, extracción flexible) | 60,0% | 67,5% |
| GSM8K (coincidencia estricta) | 40,0% | 65,0% |
| IFEval (estricto a nivel de prompt) | 75,0% | 67,5% |
| IFEval (laxo a nivel de instrucción) | 73,0% | 66,7% |

Con 40 muestras el error estándar es de aproximadamente ±7,5 puntos, por lo que GSM8K no muestra pérdida e IFEval muestra una caída de aproximadamente un error estándar. El autor indica que son comprobaciones de capacidad a nivel de smoke test, no cifras de leaderboard.

Drift de distribución (wikitext-2, 40 × 512 tokens, Q8_0 vs Q8_0):

| Metrica | Valor |
|---|---:|
| Ratio de perplejidad (ROGUE / base) | 1,116 |
| Divergencia KL media | 0,130 |
| Mismo token top | 84,7% |

Smoke test del runtime MLX 4-bit (este archivo exacto, Apple M1 Ultra, reasoning off, presupuesto de 1024 tokens):

| Comprobacion | Resultado |
|---|---|
| Prompts de respuesta exacta (aritmética, capital) | 2 / 2 correctos |
| Prompts dañinos rechazados | 1 / 8 |
| Prompts dañinos que terminaron el razonamiento dentro del presupuesto | 6 / 8 |

La build MLX 4-bit reproduce el efecto ROGUE de forma algo menos completa (1/8 rechazados) que el checkpoint nativo (0/8) y los GGUF Q4_K_M–Q8_0 (0/8 cada uno).

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 16 GB de pesos en esta build de 4 bits (5,25 bits por peso).
- GPU recomendadas: no se especifican GPU NVIDIA/AMD; el modelo está diseñado para Apple Silicon mediante MLX.
- Cabe en hardware de consumo Apple: probado en Apple M1 Ultra; requiere un chip Apple con memoria unificada suficiente para alojar los 16 GB de pesos más el overhead de inferencia.
- Opciones de despliegue: mlx-lm (requiere la PR ml-explore/mlx-lm#2086 o posterior, no incluida aún en una release etiquetada al momento de publicación) y `mlx_lm.server`. Para otros runtimes existen el checkpoint nativo NVFP4/MXFP8 en safetensors y los archivos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-ROGUE-MLX-4bit (este) | no disponible | no disponible | MLX safetensors 4-bit | apache-2.0 | Edición ROGUE, solo Apple Silicon |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | safetensors nativo | apache-2.0 | Modelo oficial sin edición de rechazo |
| carsenk/Inkling-2-Mini-ROGUE | no disponible | no disponible | NVFP4/MXFP8 safetensors | apache-2.0 | Misma edición ROGUE, formato nativo |
| carsenk/Inkling-2-Mini-ROGUE-GGUF | no disponible | no disponible | GGUF (Q4_K_M–Q8_0) | apache-2.0 | Misma edición ROGUE, para llama.cpp |

No se dispone de datos de benchmarks ni de parámetros para modelos de otras familias comparables en la información proporcionada.

## Limitaciones y advertencias

- La edición ROGUE elimina el comportamiento de rechazo aprendido y reduce materialmente los controles de seguridad integrados del modelo; no añade conocimiento ni capacidad.
- El drift de distribución es real y medible: ratio de perplejidad 1,116, KL media 0,130 y mismo token top en el 84,7% de los casos frente al base.
- La build MLX 4-bit no reproduce completamente el efecto ROGUE: 1 de 8 prompts dañinos fue rechazado, frente a 0 de 8 en el checkpoint nativo y los GGUF. Si se necesita el efecto completo, el autor recomienda usar el checkpoint nativo o un GGUF.
- Requiere una versión de mlx-lm con soporte de Inkling 2 que, en el momento de publicación, solo está disponible vía PR (#2086) y no en una release etiquetada, lo que implica riesgo de inestabilidad y cambios de API.
- El modelo solo declara soporte de inglés.
- No se documentan datos sobre sesgos, longitud de contexto ni riesgo de alucinación específicos en la información disponible.
- Uso responsable: el autor indica que debe emplearse para investigación y en entornos con salvaguardas externas adecuadas, respetando la licencia del modelo base y la legislación aplicable.
- La licencia apache-2.0 permite uso comercial, pero la ausencia de rechazo aprendido traslada al despliegue la responsabilidad de implementar filtros y moderación externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint nativo ROGUE (NVFP4/MXFP8): https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE
- Versión GGUF: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE-GGUF
- PR de mlx-lm con soporte de Inkling 2: https://github.com/ml-explore/mlx-lm/pull/2086
- Informe de evaluación del runtime MLX: `evaluation/mlx-runtime-smoke.json` (en el repositorio del modelo)
