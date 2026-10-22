# qgfvadfuvads/Q-Prefer-D2-TA-Fixed

## Resumen

Q-Prefer D2 (TA Fixed) es un adaptador LoRA de tipo reward model para reinforcement learning sobre generación de vídeo, desarrollado por el usuario de HuggingFace `qgfvadfuvads`. Se apoya en el modelo multimodal Qwen/Qwen3-VL-4B-Instruct, fijado a una revisión concreta, y añade dos cabezas de recompensa: VQ (calidad visual) y TA (cumplimiento del requisito textual). El repositorio contiene únicamente el adaptador, la cabeza de recompensa, los embeddings de tokens especiales, el código de inferencia instalable y un ejemplo de worker de recompensa; no incluye los pesos del modelo base de 4B.

La aportación principal de esta versión es la corrección del orden de evaluación: el *forward* procesa primero la imagen de referencia (en I2V) o el vídeo, después las posiciones de VQ y MQ, luego el requisito textual y finalmente la posición de TA. Así, VQ evalúa la calidad visual sin acceso al texto y TA puede leer tanto el contenido visual previo como el requisito escrito, resolviendo el problema de la versión anterior, en la que TA no podía leer el texto. El resultado son puntuaciones flotantes crudas, no probabilidades ni escalas 0-1.

Es relevante porque cubre una pieza específica de los pipelines de RL para difusión de vídeo (T2V e I2V) que no suele publicarse de forma aislada: un reward model con dos señales separadas, plantilla de prompt identificable y un ejemplo de integración con generadores. El autor advierte explícitamente de que no se trata de una versión de D2 completamente limpiada y de que las cifras históricas de D2 no son extrapolables a este checkpoint. El adaptador ocupa 0,3 GB y declara únicamente inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-VL-4B-Instruct, transformer multimodal visión-lenguaje, con cabezas de recompensa VQ y TA y embeddings de tokens especiales |
| Parametros totales | No disponible para el adaptador LoRA; modelo base de 4B (el repositorio no incluye los pesos del base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el entorno documentado es CUDA con BF16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | No disponible |
| Formato de pesos | safetensors; LoRA no fusionado (se carga el base y se fusiona el adaptador en tiempo de ejecución) |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct, revision fija `ebb281ec70b05090aa6165b016eac8ec08e71b17` |
| Run de entrenamiento | `D2_caption_before_ta_v1_20261018`, 1.203 pasos |
| Plantilla de prompt | `caption_before_ta_v1`, autodetectada desde `preprocessing_config.json` |
| Entrada de vídeo por defecto | 8 fotogramas muestreados uniformemente |
| Cabeza MQ | Presente solo por compatibilidad de formato; sin supervisión efectiva, no utilizable como reward |
| Librería | peft |
| Pipeline declarado | reinforcement-learning |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA sobre un transformer multimodal de Qwen (Qwen3-VL-4B-Instruct), con dos salidas de recompensa. El modelo consume fotogramas de vídeo, un requisito textual y, opcionalmente, una imagen de referencia para I2V. La secuencia de *forward* es determinista: referencia o vídeo, posiciones de VQ y MQ, texto del requisito, posición de TA. Esto implica que VQ solo ve la parte visual y TA ve lo visual más el texto. MQ se conserva por compatibilidad con el formato de pesos, pero carece de supervisión válida y no debe usarse para calcular recompensas.

El adaptador se entrenó durante 1.203 pasos sobre 12.442 pares de datos procedentes de D2; el autor indica que esos datos aún no han pasado por una limpieza y un reetiquetado completos. No se especifican en la información disponible el número total de tokens, la composición detallada del dataset ni si se aplicaron RLHF o DPO. La plantilla de prompt es `caption_before_ta_v1`, y el autor desaconseja forzar la plantilla antigua `legacy_d2`. El ejemplo de integración soporta normalización opcional por grupo (`normalize_groups=True`), que estandariza por separado VQ y TA con un suelo de desviación típica de 0,1 antes de combinar por pesos; por defecto se devuelven las puntuaciones crudas, sin normalizar ni recortar.

## Capacidades

- Puntuación de calidad visual (VQ) de vídeos generados, sin acceso al requisito textual.
- Puntuación de alineación texto-vídeo (TA), con acceso al requisito textual y al contenido visual previo.
- Soporte de T2V (texto a vídeo) y de I2V (imagen a vídeo), este último con imagen de referencia obligatoria.
- Procesamiento de vídeo en memoria mediante `VideoFrames`, con FPS real, índices de fotogramas y total de fotogramas para preservar la línea temporal.
- Aceptación de tensores en rangos `minus_one_one`, `zero_one` y `zero_255`, convertidos internamente a RGB uint8.
- Puntuación por lotes (`score_batch`) con salida en CPU float32, una puntuación escalar por vídeo.
- Combinación ponderada de VQ y TA en un escalar de recompensa, con pesos normalizados por su suma.
- Normalización opcional por grupo de condición, con verificación de que no se mezclan textos ni imágenes de referencia distintos.
- Integración como worker de recompensa persistente, independiente del framework de RL, para vídeo en fichero o en memoria.
- Capacidad multilingüe limitada a inglés y chino según los metadatos del modelo.
- No dispone de mecanismo de retorno de gradientes: el callback de recompensa no es diferenciable.

## Casos de uso

- Entrenamiento RL de generadores de vídeo T2V: usar VQ y TA como señales separadas para optimizar calidad visual y fidelidad al prompt, registrando por separado la media y la variación de cada cabeza.
- Entrenamiento RL de generadores I2V: puntuar candidatos con la imagen de referencia original como condición, manteniendo identificadores de grupo que combinen texto e imagen para no mezclar condiciones.
- Filtrado y ranking de candidatos generados: dado un lote de vídeos para un mismo prompt, ordenarlos por la combinación ponderada de VQ y TA antes de publicarlos o de enviarlos a revisión humana.
- Control de calidad automatizado en pipelines de producción de vídeo: detectar vídeos con artefactos visuales (VQ bajo) o que se desvían del brief (TA bajo) y marcarlos para regeneración.
- Evaluación de variantes de un mismo prompt o de ajustes de generación: comparar la distribución de puntuaciones VQ/TA entre configuraciones para decidir cuál produce mejores resultados.
- Integración en bucles de Flow-GRPO o DiffusionNFT: suministrar la recompensa cruda al *trainer*, que calcula la *advantage* dentro del grupo, evitando una doble normalización.
- Experimentación con pesos de recompensa: ajustar la proporción entre calidad visual y alineación según el producto, por ejemplo priorizando TA en vídeo publicitario y VQ en demostraciones técnicas.
- Verificación de la plantilla de prompt en despliegues: llamar a `metadata()` para confirmar que se está usando `caption_before_ta_v1` y no una plantilla heredada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las cifras históricas de D2 no deben interpretarse como resultados de esta versión, que no se ha demostrado una mejora en todos los benchmarks y que la mejora del reward solo prueba que el objetivo proxy asciende; el efecto final en el vídeo requiere métricas independientes y evaluación humana a ciegas.

## Requisitos de hardware

- El adaptador ocupa 0,3 GB en disco; hay que añadir los pesos del modelo base Qwen3-VL-4B-Instruct.
- Los pesos del base en BF16 se estiman en unos 8 GB; con el codificador visual, los 8 fotogramas por defecto y las activaciones, la VRAM de inferencia se estima en el rango de 12 a 16 GB (estimación no verificada en la documentación).
- Entorno documentado: Python 3.10 o superior, PyTorch 2.8 y una GPU CUDA capaz de ejecutar en BF16.
- GPU de centro de datos: A100 o H100 para servir varios rollouts con latencia controlada; el ejemplo recomienda reutilizar un único scorer en lugar de recargarlo por vídeo o por paso de RL.
- GPU de consumo: una RTX 4090 de 24 GB debería alojar el conjunto con holgura; en tarjetas de 16 GB el margen es reducido y conviene usar `batch_size=1`.
- Despliegue: paquete propio `qprefer_reward` (clase `QPreferScorer` y `QPreferConfig`) instalado desde `inference/`, con PEFT para cargar y fusionar el LoRA. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Los ejemplos usan `batch_size=1` de forma sistemática; no se publican cifras de latencia ni de throughput.
- Es posible fijar la revisión del adaptador con `adapter_revision` para reproducibilidad, y el autor recomienda guardar versiones de dependencias, parámetros de generación y pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Q-Prefer D2 (TA Fixed) | Base 4B + LoRA (adaptador no cuantificado en la ficha) | No disponible | Reward model VQ + TA para vídeo | No disponible | Repositorio público en HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | 4B | No disponible en la información proporcionada | Modelo multimodal visión-lenguaje de propósito general | No disponible en la información proporcionada | Público en HuggingFace; es el base de este adaptador |
| Otros reward models de vídeo (por ejemplo, familia VideoScore o VisionReward) | No disponible | No disponible | Reward model de vídeo | No disponible | No disponible en la información proporcionada |

No se dispone de datos verificados de otros reward models de vídeo en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- No es una versión de D2 completamente limpia: los 12.442 pares de entrenamiento no han pasado por limpieza y reetiquetado completos, según el autor.
- Las puntuaciones son valores flotantes crudos, no probabilidades ni una escala 0-1; no deben interpretarse como tales ni compararse entre modelos sin calibración.
- Las escalas de VQ y TA pueden no ser equivalentes; una combinación 1:1 es solo un ejemplo de conexión y no un peso óptimo validado.
- MQ no está supervisado de forma efectiva y no debe usarse como señal de recompensa.
- El callback de recompensa no ofrece gradientes al generador; solo sirve como señal externa en el bucle de RL.
- No se incluye el pipeline completo de RL para vídeo (rollout, loss, actualización): solo el extremo de recompensa. El autor menciona que Flow-GRPO y DiffusionNFT requieren su propia integración.
- Riesgo de doble normalización si el trainer ya calcula *advantages* por grupo a partir de la recompensa cruda.
- En I2V, la imagen de referencia debe ser la condición original; sustituirla por el primer fotograma del vídeo generado invalida la evaluación.
- El rango de valores del tensor debe declararse de forma explícita y coincidir con la salida real del generador; un rango incorrecto altera la puntuación.
- El paso de tensores en memoria requiere `VideoFrames` con FPS real; el comportamiento heredado con tensores desnudos asume 2 fps y no es válido para el ejemplo de RL.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribución del adaptador.
- No hay datos publicados de sesgos, tasas de alucinación ni robustez frente a dominios visuales distintos de los de entrenamiento.
- El repositorio no incluye los pesos del base, por lo que la reproducibilidad depende de la disponibilidad y de la revisión fija de Qwen3-VL-4B-Instruct.
- El modelo se publicó con 0 descargas y 0 likes; no hay evidencia de uso independiente ni validación externa.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; toda la información procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- [Modelo en HuggingFace: qgfvadfuvads/Q-Prefer-D2-TA-Fixed](https://huggingface.co/qgfvadfuvads/Q-Prefer-D2-TA-Fixed)
- [Modelo base: Qwen/Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct)
- [Revisión fija del modelo base](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/ebb281ec70b05090aa6165b016eac8ec08e71b17)
- [Dataset de condiciones de generación: qgfvadfuvads/Q-Prefer-Generation-4000-v2](https://huggingface.co/datasets/qgfvadfuvads/Q-Prefer-Generation-4000-v2)
