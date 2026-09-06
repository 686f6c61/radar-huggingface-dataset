# ibrahimkettaneh/Qwen-CUA-FP8

## Resumen

Qwen-CUA-FP8 es la versión cuantizada en FP8 del modelo Qwen-CUA, un agente de computer use nativo desarrollado por el equipo Qwen y XLang Lab. El modelo opera desde píxeles: recibe capturas de pantalla e instrucciones en lenguaje natural, razona sobre el estado visible y emite acciones de teclado y ratón en un formato XML propio. Pertenece a la familia Qwen multimodal MoE, con arquitectura Qwen3.5 MoE de 397B parámetros totales y 17B activos por token. El checkpoint cuantizado reduce el peso a 403.397.928.944 parámetros y un tamaño de repo de 408,6 GB, manteniendo una ventana de contexto nativa de 262.144 tokens. La principal aportación es democratizar el acceso a un agente de escritorio de alto rendimiento con licencia Apache-2.0, facilitando su despliegue en clústeres multi-GPU gracias a la cuantización FP8.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE multimodal híbrida, con atención lineal/completa y encoder visual) |
| Parámetros totales | 403.397.928.944 (según safetensors; el modelo base reporta 397B) |
| Parámetros activos | 17B activados por token (MoE con 512 expertos, top-10 routing) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP8 (compressed-tensors), compatible con vLLM |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

Qwen-CUA utiliza la arquitectura pública `qwen3_5_moe`, que combina un backbone de lenguaje de 60 capas con hidden size de 4096, 32 query heads y 2 KV heads, junto a un encoder visual de 27 capas con hidden size de 1152, parches espaciales de 16×16 y tamaño de parche temporal de 2. El componente de lenguaje es un Mixture-of-Experts con 512 expertos y top-10 routing, con un tamaño intermedio de 1024. La atención es híbrida: una capa de atención completa cada cuatro capas, lo que reduce el coste computacional en secuencias largas.

No se han proporcionado detalles sobre el corpus de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) en la información disponible. La model card indica que la evaluación del modelo no usa DOM, metadatos de accesibilidad, acceso a shell ni APIs específicas de tareas; se trata de un agente que opera únicamente a partir de capturas de pantalla. La cuantización FP8 es una adaptación posterior realizada por terceros, que reduce el peso de aproximadamente 807 GB en BF16 a 408,6 GB.

## Capacidades

- Computer use nativo: recibe capturas de pantalla e instrucciones, razona sobre el estado visible y emite eventos de teclado y ratón.
- Salida de acciones en formato XML bajo el esquema `computer_use`, con coordenadas normalizadas en una retícula de 0..999, independiente de la resolución real.
- Soporta una amplia variedad de acciones: clic izquierdo, derecho, medio, doble y triple clic, arrastrar, desplazamiento vertical y horizontal, escritura, mantener y soltar tecla, esperar, preguntar al usuario y finalizar con éxito o fracaso.
- Razonamiento visible: separa la cadena de razonamiento de la respuesta final, gracias al parser `qwen3` en SGLang y vLLM.
- Capacidades multimodales: combina visión (capturas de pantalla) y texto en una única entrada.
- Ventana de contexto de 262.144 tokens, suficiente para historiales largos de interacción.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede controlar aplicaciones GUI como navegadores, editores o gestores de archivos a partir de capturas, ejecutando clics y escritura sin necesidad de APIs dedicadas.
- Agentes de QA web: puede navegar por páginas web para responder preguntas o completar formularios, usando el runtime de referencia que captura pantallas y ejecuta acciones en un navegador.
- Pruebas automatizadas de interfaz de usuario: permite reproducir flujos de usuario en aplicaciones de escritorio o web, detectando elementos visuales y realizando las acciones correspondientes.
- Asistencia para personas con discapacidad: actúa como intermediario para controlar el ordenador mediante instrucciones en lenguaje natural, lo que puede facilitar tareas de accesibilidad.
- Automatización de flujos de trabajo en entornos virtualizados: en máquinas virtuales o contenedores con escritorio, puede ejecutar tareas administrativas sin requerir integración via API.
- Investigación en agentes de computer use: sirve como referencia abierta para estudiar el control de GUI basado en píxeles, gracias a su arquitectura pública y a la variante FP8 que permite experimentación en clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El paper de referencia (arXiv 2608.02352) menciona evaluación en ocho benchmarks de computer use, pero las cifras no se incluyen en la model card ni en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 403 GB, por lo que se necesitan al menos 403 GB de VRAM solo para pesos, más la memoria para KV cache y buffers de runtime.
- Configuración de referencia: el modelo base en BF16 (807 GB) se sirve con 8× H200 141 GB. Para la variante FP8, una configuración viable sería 8× H100 80 GB o 4× H200 141 GB, dependiendo de la longitud de contexto.
- No es viable en GPUs de consumo.
- Opciones de despliegue: vLLM (build nightly) y SGLang (build desde fuente), ambas con tensor parallelism y `--trust-remote-code`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se ha proporcionado información comparativa con otros modelos en la fuente de datos. A título orientativo, en la categoría de computer use existen alternativas como UI-TARS o Claude Computer Use, pero no hay cifras disponibles para una comparación rigurosa. Por tanto, la comparación detallada queda no disponible.

## Limitaciones y advertencias

- El checkpoint por sí solo no es un agente completo: necesita un runtime externo que capture pantallas, construya el historial multimodal, parsee y valide las acciones, y las ejecute en el entorno.
- El scaffold de referencia mantiene activas las 20 capturas más recientes; las más antiguas se pliegan en bloques como marcador de posición textual, lo que puede provocar pérdida de información visual de pasos anteriores.
- Las coordenadas usan una retícula normalizada 0..999: el runtime debe escalarlas correctamente a la resolución real de la pantalla.
- No soporta tool calling estándar; el protocolo `computer_use` es un esquema XML propio que debe interpretar el runtime.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es extremadamente grande y costoso de desplegar, lo que limita su adopción en entornos con recursos limitados.
- No se han publicado evaluaciones de sesgos ni de riesgos de alucinación en la información disponible. Como modelo multimodal, puede cometer errores en la interpretación de la interfaz.
- Está diseñado para entornos con GUI de escritorio; no está pensado para tareas de línea de comandos sin un emulador de terminal visual.

## Enlaces

- HuggingFace del checkpoint FP8: https://huggingface.co/ibrahimkettaneh/Qwen-CUA-FP8
- Modelo base en HuggingFace: https://huggingface.co/xlangai/Qwen-CUA
- Licencia Apache-2.0: https://huggingface.co/xlangai/Qwen-CUA/blob/main/LICENSE
- Paper en arXiv: https://arxiv.org/abs/2608.02352
- Repositorio de GitHub: https://github.com/xlang-ai/Qwen-CUA
- Demo de referencia: https://github.com/xlang-ai/Qwen-CUA/tree/main/demo
