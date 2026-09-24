# Mapika/decider-35b-a3b

## Resumen

decider-35b-a3b es un modelo de decisión tipada desarrollado por Mapika, construido como fine-tuning supervisado de Qwen/Qwen3.5-35B-A3B-Base. No es un modelo generativo: recibe un estado (texto, objeto o array de hasta 32k tokens) junto con una o varias preguntas tipadas, cada una con su lista explícita de opciones, y devuelve en un único forward pass una distribución de probabilidad calibrada sobre las opciones de cada pregunta. No hay decodificación, ni parseo de texto libre, ni salidas fuera del conjunto de opciones definido por quien llama. Es una reproducción abierta de la clase de modelos "System One" (el Jev de TypeSafe AI).

La arquitectura es un mixture of experts de 34,66 mil millones de parámetros totales con 3 mil millones activos por token, heredada del base de Qwen: 256 expertos enrutados con 8 activos por token más un experto compartido, 40 capas de las cuales 10 usan atención completa y 30 usan atención lineal gated delta-net. El repositorio aloja la versión v1 con pesos en bf16 (65 GB), y existe un checkpoint cuantizado a NVFP4 para vLLM y TensorRT-LLM. La licencia es Apache 2.0 y el modelo está etiquetado únicamente para inglés.

Su relevancia actual radica en que cubre un nicho distinto al de los LLM conversacionales: sustituye la generación de texto por una lectura directa de logits en un slot de respuesta, lo que elimina la necesidad de parsear JSON, validar formatos o hacer post-procesado. Frente a decider-2b v10, mejora la precisión en 93 de las 95 tareas de regresión del conjunto de evaluación, con 0,855 in-task y 0,810 held-out, y reduce la log-verosimilitud negativa entre 0,12 y 0,24 nats en todos los fixtures.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida: 40 capas, 10 de atención completa y 30 de gated delta-net linear attention |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | 3B por token (256 expertos enrutados, 8 activos, más un experto compartido) |
| Longitud de contexto | Estado de hasta 32k tokens; cada pregunta y cada nivel de Score se puntúa en su propia fila; entre 2 y 255 opciones por pregunta |
| Tipos de cuantizacion | bf16 (pesos de este repositorio); NVFP4 de 4 bits con escalas FP8 por bloques de 16 en un repositorio separado |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 69,3 GB; pesos bf16 de 65 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B-Base, un MoE de 34,7B parámetros con 3B activos por token. La capa de enrutamiento reparte cada token entre 256 expertos, de los que se activan 8, más un experto compartido. El apilado combina 10 capas de atención completa con 30 capas de atención lineal gated delta-net, lo que reduce el coste de secuencias largas. El `config.json` fija `experts_implementation: grouped_mm`, que ejecuta los 256 expertos de una capa como una única multiplicación matricial agrupada. La familia de inferencia `decider/` está incluida en el propio repositorio y requiere `flash-linear-attention`.

El entrenamiento reutiliza la receta supervisada de decider-2b: una época de entropía cruzada sobre el readout del slot (los logits de la letra en la posición de respuesta, softmaxeados sobre las opciones) aplicada sobre la mezcla pública de decisiones. Durante el ajuste se congelaron los expertos enrutados y se aplicó el optimizador Muon únicamente a las matrices de bloques. El modelo no pasó por una etapa de RL: en tareas de navegador en vivo su juego greedy supera a decider-2b v10 (97,2% frente a 90,9%), mientras que su juego muestreado queda por detrás (86,4% frente a 93,2%).

## Capacidades

- Clasificación y enrutamiento: asignación de un estado a una categoría entre 2 y 255 opciones, con probabilidad calibrada por opción.
- Respuesta a múltiples preguntas tipadas sobre un mismo estado en una sola pasada, con cada pregunta y cada nivel de Score en su propia fila.
- Puntuación por lotes mediante `decide_batch`, que evalúa muchos estados con muchas preguntas en una única llamada.
- Abstención controlada: `abstain_below=t` devuelve `None` cuando la confianza queda por debajo de un umbral.
- Soporte de tool calling y agentes vía la interfaz `system_one` / `decider.serve`, que expone `POST /v1/systemone` con el formato de TypeSafe; el SDK oficial `typesafe-sdk` funciona apuntando `TYPESAFE_BASE_URL` al servidor.
- Entrada de estado flexible: cadena, objeto o array de hasta 32k tokens.
- Capacidades de conocimiento y razonamiento multi-paso y políticas largas, según la tabla comparativa de la familia.
- No genera texto libre, no hace streaming de tokens y no produce salidas fuera de las opciones declaradas.

## Casos de uso

- Enrutamiento de tickets de soporte: el estado es el texto del ticket y las preguntas tipadas son "¿qué departamento debe gestionarlo?" con opciones como `billing`, `technical support` o `sales`, y "¿requiere acción de reembolso?" con `no`/`yes`. El ejemplo de la model card devuelve `billing` con confianza 0,99 y `yes` con 0,98.
- Decisión multi-campo en un solo paso: cuando un formulario requiere varios campos (categoría, prioridad, sentimiento, acción), todas las preguntas se responden en el mismo forward pass sin decodificación ni parseo de JSON.
- Agentes de navegador: la familia decider se usa para jugar tareas de navegador en vivo; la variante de 35B alcanza un 97,2% en modo greedy, lo que la hace adecuada para seleccionar la siguiente acción a partir del estado de la página.
- Moderación y filtrado con umbral: gracias a `abstain_below`, se puede enviar a revisión humana cualquier decisión por debajo del umbral de confianza, usando el modelo como primera etapa de un pipeline.
- Clasificación de documentos largos: el estado admite hasta 32k tokens, lo que permite clasificar contratos, informes o políticas extensas sin trocear el contenido en fragmentos que perderían contexto.
- Enrutamiento de consultas en un sistema RAG o de búsqueda: decidir entre recuperar del índice, responder directamente o derivar a otro servicio, devolviendo la probabilidad de cada ruta.
- Sustitución de un LLM generativo en pipelines de CI/CD: se invoca desde software, sin chat, con salida restringida al conjunto de opciones, lo que simplifica la validación y elimina el fallo por formato inválido.

## Benchmarks y rendimiento

Los datos publicados en la información disponible comparan decider-35b-a3b v1 con decider-2b v10 sobre las mismas filas.

| Evaluacion | decider-35b-a3b v1 | decider-2b v10 |
|---|---|---|
| Regresión, in-task | 0,855 | 0,805 |
| Regresión, held-out | 0,810 | 0,755 |
| Tareas con mejora (de 95) | 93 | referencia |
| Conjunto de validación (847 filas) | +6,7 puntos | referencia |
| OpenJev | +5,0 puntos | referencia |
| Mind2Web | +6,9 puntos | referencia |
| Filas de workflow de TypeSafe | +5,9 puntos | referencia |
| JevBench, tier hard | 0,676 | 0,459 |
| Suite pública de Bespoke (macro) | 0,774 | 0,704 |
| Navegador en vivo, greedy | 97,2% | 90,9% |
| Navegador en vivo, muestreado | 86,4% | 93,2% |

La log-verosimilitud negativa cae entre 0,12 y 0,24 nats en todos los fixtures. El checkpoint NVFP4 se sitúa entre 1,0 y 1,5 puntos por debajo del bf16 en los fixtures medidos. No hay datos publicados de MMLU, HumanEval, GSM8K ni benchmarks de conocimiento general en la información disponible.

## Requisitos de hardware

- VRAM para bf16: los pesos ocupan 65 GB, y el autor indica como requisito una GPU con al menos 80 GB de memoria.
- GPU recomendadas para bf16: H100 80 GB, A100 80 GB o GH200; el objetivo declarado del proyecto era reproducir esta clase de modelos en una sola GH200.
- GPU para NVFP4: el checkpoint cuantizado ocupa 19,6 GB y está pensado para hardware Blackwell a través de vLLM o TensorRT-LLM; encaja en GPUs consumer de gama alta con 24 GB o más (por ejemplo RTX 4090 o RTX 5090), aunque la información disponible no confirma esa compatibilidad explícitamente.
- Despliegue en bf16: inferencia en PyTorch con `torch>=2.14`, `transformers>=5.17` y `flash-linear-attention`, usando `experts_implementation: grouped_mm`.
- Despliegue en NVFP4: vLLM y TensorRT-LLM, con el checkpoint cuantizado con NVIDIA ModelOpt 0.46.1 (pesos y activaciones de 4 bits en coma flotante con escalas FP8 por bloques de 16 sobre las proyecciones de atención, el experto compartido y los 256 expertos enrutados de cada capa).
- Servidor: `system_one` / `decider.serve` expone `POST /v1/systemone` con el formato de TypeSafe.
- Latencia y throughput: no disponibles para el modelo de 35B en la información proporcionada. El único dato de la familia es decider-2b v10 con 4 ms por petición usando CUDA graphs en una GPU.
- Opciones no documentadas: no hay confirmación de soporte para llama.cpp, Ollama, TGI ni pesos GGUF en la información disponible.

## Comparativa con modelos similares

| Modelo | Base | Pesos | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| decider-35b-a3b v1 | Qwen3.5-35B-A3B-Base (3B activos) | 65 GB bf16 | estado de hasta 32k tokens | 0,855 / 0,810; JevBench hard 0,676; Bespoke 0,774 | apache-2.0 |
| decider-4b v1 | Qwen3.5-4B-Base | 8,4 GB bf16 | no disponible en detalle | 0,834 / 0,788; JevBench hard 0,541; Bespoke 0,757 | no disponible |
| decider-2b v10 | Qwen3.5-2B-Base | 3,5 GB bf16 | no disponible en detalle | 0,805 / 0,755; navegador en vivo 93%; Bespoke 0,704 | no disponible |
| decider-0.8b | Qwen3.5-0.8B-Base | 1,4 GB bf16 | no disponible en detalle | 0,776 / 0,707 en protocolo de una pasada | no disponible |
| decider-35b-a3b-nvfp4 | el 35B en NVFP4 | 19,6 GB | estado de hasta 32k tokens | entre 1,0 y 1,5 puntos por debajo del bf16 | apache-2.0 |

La elección dentro de la familia es explícita en la model card: el 35B se justifica "cuando la precisión vale entre 3 y 4 veces el coste por decisión", orientado a preguntas de conocimiento, multi-paso y políticas largas. decider-2b es la opción por defecto para enrutamiento, clasificación, juicios y agentes de navegador.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuesta libre, resumen o redacción queda fuera de su ámbito por diseño.
- Solo está etiquetado para inglés (`language: [en]`), por lo que el rendimiento en otros idiomas no está documentado.
- No pasó por una etapa de RL, y eso se refleja en el juego muestreado: 86,4% frente al 93,2% de decider-2b v10 en tareas de navegador en vivo. Para muestreo conviene tenerlo en cuenta.
- Riesgo de alucinación: no hay datos publicados sobre este aspecto en la información disponible; el formato de salida restringido a las opciones declaradas limita el fallo por formato, no la calibración de la probabilidad.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero el modelo base procede de Qwen3.5 y conviene verificar sus términos.
- Requisito de memoria elevado en bf16: una GPU de al menos 80 GB, lo que excluye el despliegue en hardware consumer con esos pesos.
- La cuantización NVFP4 implica una pérdida de entre 1,0 y 1,5 puntos frente a bf16 en los fixtures medidos.
- El modelo está pensado para invocarse desde software, no para conversar; integrarlo como chatbot supone un uso incorrecto de su interfaz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mapika/decider-35b-a3b
- Checkpoint NVFP4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- decider-2b: https://huggingface.co/Mapika/decider-2b
- decider-4b: https://huggingface.co/Mapika/decider-4b
- decider-0.8b: https://huggingface.co/Mapika/decider-0.8b
- decider-2b-vision: https://huggingface.co/Mapika/decider-2b-vision
- Repositorio GitHub: https://github.com/Mapika/decider
- Paquete PyPI: https://pypi.org/project/decider-ai/
- Ficha de especificaciones en gradually.ai: https://www.gradually.ai/en/ai-models/decider-35b-a3b/
