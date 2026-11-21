# husky8/Inkling-2-Fast-Computer-Use

## Resumen

Inkling 2 Fast Computer Use es un checkpoint derivado de thinkingmachines/Inkling-2-Mini, publicado por el usuario husky8 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una edición de pesos (weight-edit) muy quirúrgica: se intercambian dos filas de la matriz de salida (`model.llm.unembed.weight`), concretamente las filas 200004 y 200008, que puntúan los marcadores de canal de respuesta y de razonamiento. El objetivo declarado es eliminar la generación de tokens de pensamiento en tareas de automatización de navegador, reduciendo la latencia sin cambiar los comandos producidos.

El modelo conserva la arquitectura, el tamaño y las capacidades del modelo base, con 26.388.646.440 parámetros totales (unos 26,4 mil millones) y un repositorio de 20,2 GB en safetensors de 8 bits. La pipeline declarada es image-text-to-text, por lo que mantiene la entrada multimodal del original, aunque la validación realizada por el autor se hizo con descripciones textuales de controles visibles, no con capturas de pantalla reales.

La relevancia de esta ficha es doble: por un lado, documenta un caso extremo de modificación de pesos orientada a rendimiento en agentes de navegador; por otro, sirve de advertencia sobre los límites de ese tipo de ajustes, ya que el propio autor reconoce que la precisión general de razonamiento y visión tras la edición no ha sido evaluada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Inkling-2-Mini; runtime con soporte `inkling2_loop`) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en 8 bits (modelopt); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El checkpoint no introduce ningún entrenamiento nuevo. Se parte de la revisión `ed40e7da625f594fc9c4990f5f66be24873c22d7` de thinkingmachines/Inkling-2-Mini y se aplica una única modificación estructural: el intercambio de las filas 200004 y 200008 de la matriz `model.llm.unembed.weight`. Estas filas son las que asignan puntuación a los marcadores de canal de respuesta y de canal de pensamiento, de modo que el efecto práctico es que el modelo deja de emitir tokens de razonamiento en la tarea evaluada y pasa directamente a la respuesta. El shard editado tiene SHA-256 `d713d16818032b5ac0d06b07e72d4dc7135d57737e3224216d09b51afe59ab6e`.

La validación descrita por el autor se realizó en un MacBook Pro con MLX, usando descodificación greedy y `reasoning effort` fijado en `none`, sobre seis ejecuciones emparejadas en Brave con descripciones textuales de los controles visibles. En una ejecución de desarrollo separada, el autor indica que el prefill del canal de respuesta del checkpoint original produjo un tiempo similar, lo que sugiere que el efecto observado se debe principalmente a la supresión del canal de pensamiento y no a una mejora intrínseca de la política del modelo. No se documentan datos de entrenamiento, composición del dataset, RLHF ni DPO para esta edición, porque no existe tal entrenamiento.

## Capacidades

- Generación de texto conversacional y multimodal (image-text-to-text) heredada del modelo base.
- Automatización de navegador: rellenar formularios, añadir cantidades a un carrito y emitir comandos de control de interfaz.
- Ejecución de tareas de computer use guiadas por descripciones textuales de los controles visibles.
- Supresión del canal de pensamiento en la configuración evaluada (`reasoning effort: none`), lo que reduce la latencia al evitar tokens intermedios.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el formato de runtime `inkling2_loop`.
- Soporte de tool calling, agentes multi-paso, capacidades multilingües o modos de visión avanzados: no disponible en la información proporcionada para este checkpoint.

## Casos de uso

- Automatización de formularios web en pruebas de aceptación: el modelo puede completar campos y enviar formularios en entornos de staging, con una mediana de 7,93 segundos por tarea en la prueba del autor, lo que lo hace adecuado para suites de test de interfaz que requieren muchos ciclos.
- Rellenado de carritos y flujos de compra en entornos de demostración: la tarea evaluada (añadir la cantidad solicitada al carrito) es directamente representativa de este escenario, siempre que los controles se describan textualmente.
- Agentes de navegador de baja latencia: al eliminar los tokens de pensamiento, encaja en pipelines donde el coste por paso es crítico y la tarea está bien delimitada, como la navegación repetitiva sobre un conjunto fijo de páginas.
- Orquestación de tareas de computer use en CI: integrado en un runner con MLX o un runtime compatible, puede ejecutar guiones de navegador de forma determinista con descodificación greedy.
- Prototipado de asistentes que operan sobre descripciones de accesibilidad: al trabajar con descripciones textuales de controles, puede conectarse a árboles de accesibilidad en lugar de a píxeles, lo que simplifica la integración con frameworks de testing.
- Evaluación comparativa de ediciones de pesos: sirve como referencia para estudiar el impacto de modificaciones en la capa de salida sobre la latencia y la fidelidad de comandos en agentes de navegador.

## Benchmarks y rendimiento

| Metrica | Inkling-2-Fast-Computer-Use | Inkling-2-Mini (original) |
|---|---|---|
| Tiempo mediano en 6 ejecuciones Brave (rellenar formulario + carrito) | 7,93 s | 20,34 s |
| Ejecuciones completadas con comandos idénticos | 6/6 | 6/6 |
| Entorno de prueba | MacBook Pro, MLX, descodificación greedy, reasoning effort `none` | mismo entorno |
| Entrada | Descripciones textuales de controles visibles | mismas descripciones |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada es la latencia en la tarea de navegador descrita.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20,2 GB en safetensors de 8 bits, por lo que se necesita al menos ese espacio en memoria más overhead de activaciones y contexto; una GPU de 24 GB (RTX 4090, L4) es el mínimo práctico para cargar los pesos completos en 8 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para despliegues en servidor; el autor validó en un MacBook Pro con MLX, lo que indica que también es viable en Apple Silicon con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB solo si se aplica cuantización adicional no documentada; no se han publicado variantes GGUF.
- Opciones de despliegue: transformers con runtime compatible con `inkling2_loop`, MLX (validado por el autor) y endpoints compatibles; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 7,93 s por tarea de navegador en la prueba del autor; no hay datos de throughput de tokens por segundo ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Fast-Computer-Use | 26,4 B | no disponible | Apache 2.0 | Edición de pesos para computer use de baja latencia | Hugging Face (husky8) |
| Inkling-2-Mini | no disponible en esta ficha | no disponible | Apache 2.0 | Modelo base multimodal de Thinking Machines | Hugging Face (thinkingmachines) |
| Alternativas de computer use de propósito general | no disponible | no disponible | no disponible | Agentes de navegador y control de interfaz | no disponible |

No se dispone de datos de benchmarks comunes ni de especificaciones del modelo base más allá de su identificador, por lo que la comparación cuantitativa con otras alternativas no está disponible.

## Limitaciones y advertencias

- La edición solo se validó en seis ejecuciones emparejadas en Brave con descripciones textuales de controles; el control basado en capturas de pantalla y otros navegadores no se han probado.
- La precisión general de razonamiento y de visión tras la edición no ha sido evaluada; el intercambio de filas de la capa de salida puede afectar a la coherencia en tareas fuera del dominio de navegador.
- El beneficio de latencia parece deberse a la supresión del canal de pensamiento, no a una mejora de la política; en tareas que requieran razonamiento multi-paso, la ausencia de tokens intermedios puede degradar la calidad.
- Riesgo de alucinación y sesgos: no documentado para este checkpoint; se heredan los del modelo base, no especificados en la información disponible.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe más allá de la del modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor remite a la política de uso aceptable de Thinking Machines Lab, que puede imponer condiciones adicionales al uso del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en noviembre de 2026; se trata de una modificación no oficial sin revisión por pares.
- No se ofrecen variantes cuantizadas a 4 bits ni GGUF, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/husky8/Inkling-2-Fast-Computer-Use
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio con benchmark, vídeo y ejemplo ejecutable: https://github.com/jtc268/inkling-2-fast-computer-use
- Política de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Aviso de modificación: https://huggingface.co/husky8/Inkling-2-Fast-Computer-Use/blob/main/NOTICE
