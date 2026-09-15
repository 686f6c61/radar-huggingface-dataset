# EmberJin/Minecraft-Agent-CoT-Qwen3.5-9B-v2

## Resumen

Minecraft-Agent-CoT-Qwen3.5-9B-v2 es un ajuste fino publicado por el usuario EmberJin (checkpoint 520, época 4) sobre EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3. Está diseñado para operar como agente encarnado dentro de Minecraft: es un modelo de visión-lenguaje-acción (VLA) que recibe imágenes del entorno y emite, en una misma secuencia, un bloque de razonamiento explícito (`Thought:`) seguido de una acción de bajo nivel (`Action:`). El problema que aborda es conseguir que el agente razone antes de actuar sin degradar la política de control, algo que el propio autor deja explícitamente como cuestión abierta.

La versión v2 aplica un SFT de continuación sobre anotaciones de pensamiento consideradas limpias: se eliminaron 1.452 pensamientos tóxicos del dataset v1 y se añadieron 1.600 trayectorias de combate anotadas con un prompt V2 de solo percepción, con reequilibrio de combate al 23 %. El modelo tiene 9.409.813.744 parámetros (9,41 B) en safetensors, el repositorio ocupa 18,8 GB y la licencia es Apache 2.0. En el ejemplo de despliegue incluido se sirve con vLLM con `--max-model-len 32768` y hasta 30 imágenes por prompt.

La relevancia práctica es acotada y de nicho: es un modelo de investigación para agentes encarnados en un dominio concreto, sin benchmarks generalistas publicados. No tiene tracción comunitaria en el momento de la consulta (0 descargas, 0 me gusta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLA, vision-language-action) sobre Qwen3.5-9B; etiqueta de librería `qwen3_5` |
| Parámetros totales | 9.409.813.744 (9,41 B) |
| Longitud de contexto | 32.768 tokens en la configuración de despliegue con vLLM; la longitud nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene safetensors; el autor no publica GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Entrada multimodal | Imágenes (hasta 30 por prompt según el ejemplo de vLLM) más contexto textual |
| Formato de salida | `Thought: <perception> \| <decision>\nAction: move(dx, dy) and press(keys) [and click(left\|right)]` |
| Modelo base | EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3 |
| Tamaño del repositorio | 18,8 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo parte de `EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3`, un checkpoint que rinde un 24,9 % en la evaluación interna "easy-ng, h29" sin cadena de pensamiento. Sobre esa base se aplica un SFT de continuación con tasa de aprendizaje 1e-6 durante 5 épocas planificadas; el checkpoint publicado corresponde a la época 4 (520 pasos), ya que la época 5 se perdió por un fallo en el momento de guardar. El conjunto de datos final tiene 8.261 filas: las filas de v1 menos 1.452 pensamientos tóxicos (resultados alucinados y esperas sobre no-ops) más 1.600 trayectorias nuevas anotadas como combate con el prompt V2, más datos de replay. Las anotaciones de combate se generaron con un prompt de solo percepción y alcanzaron una tasa de aprobación del 99,6 %.

La innovación técnica declarada no está en la arquitectura sino en el pipeline de anotación: se separa percepción de decisión dentro del bloque de pensamiento y se filtran por lista negra aquellos razonamientos que describen resultados no observados. El autor señala que la tasa de emisión de pensamientos sigue estando muy por debajo del 12 % de disparo usado en entrenamiento, por lo que la hipótesis de trabajo es que los pensamientos pueden ayudar de forma condicional cuando aparecen, aunque sean demasiado raros para mover la métrica agregada. No se documentan detalles sobre composición completa del dataset, número total de tokens, uso de RLHF o DPO, ni innovaciones de atención o decodificación.

## Capacidades

- Generación de acciones de bajo nivel en Minecraft: movimiento (`move(dx, dy)`), pulsaciones de teclas y clics de ratón.
- Percepción visual del entorno a partir de capturas de pantalla, con soporte de hasta 30 imágenes por prompt en la configuración de vLLM indicada.
- Razonamiento explícito en formato de cadena de pensamiento con dos campos separados por el delimitador `|`: percepción y decisión.
- Comportamiento de agente encarnado de un solo paso, orientado a bucle de observación-acción.
- Cobertura de tareas de combate, añadida específicamente en esta versión mediante 1.600 trayectorias anotadas.
- Capacidades multilingües: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Modo de pensamiento (thinking mode) separado: no disponible; el razonamiento va embebido en la misma secuencia de salida.
- Otras capacidades especiales (audio, agentes multi-paso declarados): no disponible.

## Casos de uso

- Navegación autónoma en Minecraft: el agente puede interpretar el entorno visual y emitir secuencias de movimiento y pulsaciones para desplazarse entre puntos, apoyándose en el bloque de percepción para elegir dirección.
- Combate contra mobs: es el área reforzada en v2 (23 % del reequilibrio de datos). Se usaría para políticas de ataque y esquiva, aunque el autor advierte que persisten residuos de "spam de ataque con cámara congelada" reducidos pero no eliminados.
- Recolección de recursos: dado un objetivo textual, el agente genera acciones de minado y movimiento; el formato de acción permite integrarlo en un bucle cerrado de observación-acción.
- Evaluación comparativa de métodos de razonamiento: sirve como banco de pruebas para medir si el CoT ayuda de forma condicional frente a una política sin pensamiento, ya que el autor publica los resultados a pasos emparejados.
- Generación de datos anotados para otros agentes: el formato `Thought`/`Action` es reutilizable como esquema de anotación y el pipeline de filtrado por lista negra es replicable.
- Investigación en agentes encarnados y VLA: al ser un modelo de 9,4 B con licencia Apache 2.0, permite experimentos de ajuste fino en entornos académicos con presupuesto de GPU limitado.
- Servicio de inferencia propio para demos interactivas: el comando de vLLM incluido permite levantar un endpoint compatible con OpenAI con contexto de 32.768 tokens, útil para prototipos de agente en vivo.
- Control de calidad de rollouts: el autor documenta explícitamente qué comparar (tasa de emisión de pensamientos, alucinaciones de finalización y residuos de combate), por lo que el modelo encaja como objeto de auditoría de comportamiento.

## Benchmarks y rendimiento

Los únicos datos publicados son de la evaluación interna "easy-ng, h29" con 3 rollouts y semilla 42. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no se han publicado resultados de estos últimos en la información disponible.

| Modelo / configuración | Overall | Embodied | Combat |
|---|---|---|---|
| Base sin CoT | 24,9 % | 24,8 % | 25,2 % |
| v1 (pensamientos crudos, e4) | 25,3 % | 27,5 % | 18,4 % |
| **Esta versión (v2-e4, limpia)** | **29,2 %** | **31,2 %** | 23,1 % |
| Control sin pensamiento (e5) | 31,5 % | 32,0 % | 29,9 % |

Lectura de los datos: v2 mejora 3,9 puntos sobre v1 en Overall y recupera 4,7 puntos en Combat, pero sigue por debajo del control sin pensamiento (31,5 % frente a 29,2 %). El autor deja abierta la pregunta de si los pensamientos ayudan condicionados a aparecer, aunque su frecuencia sea demasiado baja para mover el agregado.

## Requisitos de hardware

- Peso en BF16/FP16: 9,41 B parámetros × 2 bytes ≈ 18,8 GB solo en pesos, coherente con el tamaño del repositorio.
- VRAM total: superior a 18,8 GB; hay que sumar la caché KV para 32.768 tokens y la memoria de las hasta 30 imágenes por prompt, cuya magnitud no se especifica en la información disponible.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB, con margen holgado para pesos, caché y procesamiento de imágenes.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en BF16, pero el margen es muy estrecho una vez añadidos la caché KV y los tensores de visión; no está documentado que el autor lo haya validado.
- Cuantizaciones: no se publican GGUF, AWQ ni GPTQ, por lo que cualquier reducción de precisión exige conversión propia y no está respaldada por el autor.
- Despliegue documentado: vLLM con `vllm serve . --served-name cot-v2-e4 --max-model-len 32768 --limit-mm-per-prompt image=30`.
- Otros motores (llama.cpp, Ollama, TGI, TensorRT-LLM): no documentados para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas con modelos externos de la misma categoría en la información proporcionada. La comparación viable es con la propia línea de checkpoints del autor, que es la que publica métricas:

| Modelo | Parámetros | Contexto | Overall (easy-ng) | Combat | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Minecraft-Agent-Qwen3.5-9B-Stage3 (base, sin CoT) | 9,41 B (no confirmado en la ficha) | no disponible | 24,9 % | 25,2 % | no disponible | HuggingFace, repo propio |
| Minecraft-Agent-CoT v1 (pensamientos crudos) | no disponible | no disponible | 25,3 % | 18,4 % | no disponible | Referenciado en la model card, URL no incluida en la información disponible |
| **Minecraft-Agent-CoT v2 (este modelo)** | 9,41 B | 32.768 (config. vLLM) | 29,2 % | 23,1 % | Apache 2.0 | HuggingFace |
| Control sin pensamiento (e5) | no disponible | no disponible | 31,5 % | 29,9 % | no disponible | No publicado como checkpoint independiente según la información disponible |

Alternativas externas de tamaño similar (por ejemplo, otros VLM de 7-9 B aplicados a agentes): no disponible.

## Limitaciones y advertencias

- El control sin pensamiento supera al modelo con CoT (31,5 % frente a 29,2 % en Overall, 29,9 % frente a 23,1 % en Combat). El propio autor reconoce que los pensamientos limpiados no baten a la simple exposición de datos.
- Riesgo de alucinación en el bloque de pensamiento: v1 declaraba resultados no observados y esperas sobre no-ops. v2 los filtra en entrenamiento, pero el autor no afirma haberlos eliminado por completo en inferencia.
- Persistencia de fallos de combate: el patrón de spam de ataque con cámara congelada se reduce, pero no se elimina.
- Tasa de emisión de pensamientos muy inferior al 12 % usado como disparador en entrenamiento, lo que puede provocar comportamiento inconsistente respecto a lo entrenado.
- El checkpoint publicado es la época 4, no la 5, porque el guardado de la época 5 se perdió en un fallo. No hay una versión posterior.
- Sesgos: no disponible. No se documenta análisis de sesgo ni composición demográfica del dataset.
- Idiomas soportados: no disponible. El modelo está entrenado sobre un dominio muy concreto y es probable que rinda mal fuera de Minecraft y del inglés de las anotaciones, aunque esto no se declara explícitamente.
- Sin benchmarks generalistas ni evaluación externa: el único dato es una métrica interna ("easy-ng, h29") definida por el autor.
- Tracción nula: 0 descargas y 0 me gusta, sin validación independiente de la comunidad.
- Licencia Apache 2.0, permisiva para uso comercial, pero hereda las condiciones del modelo base Qwen3.5-9B, que no se detallan en la información disponible.
- Restricción de despliegue: al no haber cuantizaciones públicas, la inferencia en hardware de consumo exige conversión manual no validada.
- Longitud de contexto: los 32.768 tokens provienen del ejemplo de despliegue, no de una especificación oficial del modelo; configurar más puede fallar.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/EmberJin/Minecraft-Agent-CoT-Qwen3.5-9B-v2
- Modelo base (Stage3): https://huggingface.co/EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3
- Checkpoint v1: referenciado en la model card como "link below", pero la URL no está incluida en la información proporcionada.
- Paper, blog técnico, repositorio de código o demo: no disponible.
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos corresponden a páginas de soporte de Microsoft (inicio de sesión en Hotmail y actualizaciones de Exchange Server) sin relación con el modelo.
