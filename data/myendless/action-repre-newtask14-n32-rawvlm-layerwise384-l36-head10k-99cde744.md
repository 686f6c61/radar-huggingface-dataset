# myendless/action-repre-newtask14-n32-rawvlm-layerwise384-l36-head10k-99cde744

## Resumen

Este repositorio contiene un checkpoint de investigación para robótica denominado "raw VLM", desarrollado por el usuario myendless. Se trata de un modelo de representación de acciones (*action readout*) construido sobre un VLM congelado de 4B parámetros (Qwen3-VL-4B-Instruct) y una cabeza de decodificación basada en un DiT por capas de 36 niveles y anchura 384. El modelo no es un VLM conversacional ni un modelo generativo de texto: es un componente de política robótica que traduce representaciones visuales y lingüísticas en secuencias de acciones articulares.

El problema que aborda es la generalización a nuevas tareas robóticas: el readout se ha entrenado específicamente sobre 14 tareas no vistas (*held-out*) del entorno RoboTwin, con 4.928 episodios en total y 1.452.052 ventanas de entrenamiento, manteniendo el VLM base completamente congelado. La relevancia actual radica en que explora si un VLM genérico, sin preentrenamiento robótico, puede servir como columna vertebral para control motor cuando se le acopla un decodificador específico entrenado de forma eficiente.

El checkpoint se publica como material de investigación reproducible: incluye el state dict completo en PyTorch, configuración, procesador, normalización y registros de procedencia, pero no incluye episodios crudos, activos de simulador ni estados de optimizador. No se ha realizado evaluación en bucle cerrado (*closed-loop*), por lo que no existen métricas de éxito de control.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM congelado (Qwen3-VL-4B-Instruct) + readout DiT por capas (*layerwise DiT*) con atención propia/cruzada intercalada |
| Parámetros totales | No disponible (el readout tiene 111.872.680 parámetros; el VLM base es de 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (entrenado en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch nativo (`model.pt`, state dict completo; no compatible con `AutoModel.from_pretrained`) |

## Arquitectura y entrenamiento

La arquitectura combina un VLM congelado Qwen3-VL-4B-Instruct (inicialización desde el checkpoint original preentrenado, sin ajuste robótico previo) con un decodificador de acciones de tipo DiT por capas. Este readout tiene 36 capas, anchura 384, 6 cabezas de atención con dimensión de cabeza 64, y un total de 111.872.680 parámetros incluyendo los proyectores por capa. Mantiene el modo de atención propia/cruzada intercalada; los proyectores impares permanecen asignados pero sin uso. Las acciones se representan como *joint14* absolutas con horizonte de chunk de 32.

El entrenamiento se realizó durante 10.000 pasos con 8 GPUs Hygon en BF16, batch global de 128 y semilla 42. Los datos provienen de 14 tareas *held-out* de RoboTwin, cada una con 32 episodios limpios y 320 aleatorizados (4.928 episodios totales, 1.452.052 ventanas), con normalización compartida de 33 tareas fuente. La pérdida final de entrenamiento fue 0,028894193470478058, aunque el propio autor advierte que esta métrica no equivale a tasa de éxito de control. Se trata de un cambio arquitectónico respecto al histórico experto en acciones Qwen3 de 28 capas, no de una simple ablación de anchura.

## Capacidades

- Decodificación de acciones robóticas en espacio *joint14* absoluto con horizonte de 32 pasos por chunk.
- Acondicionamiento visual y lingüístico a través del VLM congelado Qwen3-VL-4B-Instruct.
- Generalización a tareas no vistas del benchmark RoboTwin (14 tareas *held-out*).
- Atención propia/cruzada intercalada para integrar información multimodal con la secuencia de acciones.
- No soporta *tool calling*, agentes multi-paso ni razonamiento simbólico: es un componente de política, no un modelo conversacional.
- Capacidades multilingües: no disponibles como tales (heredadas del VLM base, no evaluadas en este checkpoint).
- No dispone de modo *thinking*, visión-a-texto ni audio como funcionalidad de salida.

## Casos de uso

- Investigación en generalización de políticas robóticas: el checkpoint permite reproducir el experimento de adaptar un VLM congelado a tareas nuevas mediante un readout entrenado, sirviendo como línea base para comparar arquitecturas de decodificación.
- Manipulación bimanual en simulación RoboTwin: las acciones *joint14* y el horizonte 32 encajan con tareas de manipulación que requieren coordinación de dos brazos, aunque la ausencia de evaluación en bucle cerrado obliga a validar antes de usarlo.
- Estudio de arquitecturas DiT para control motor: el diseño por capas con proyectores por nivel permite analizar qué capas del VLM aportan información útil para la acción, un caso de uso de interpretabilidad.
- Desarrollo de pipelines de entrenamiento eficiente: al mantener el VLM congelado, el coste de entrenamiento se reduce al readout de ~112M parámetros, útil para equipos con recursos limitados que quieran iterar sobre decodificadores.
- Reproducción de resultados y auditoría: los directorios `metadata/` y `provenance/` permiten reconstruir la configuración exacta, útil para trabajos de reproducibilidad en robótica.
- Base para *fine-tuning* posterior en tareas específicas: el state dict completo puede servir de inicialización para readouts en dominios distintos, siempre que se respete el cargador `QwenPIRepresentationV4`.
- Evaluación comparativa de VLM como *backbone* robótico: permite contrastar el rendimiento de Qwen3-VL frente a otros VLM en la misma tarea de decodificación de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha realizado evaluación en bucle cerrado para este checkpoint y que la pérdida de entrenamiento (0,0289) no constituye una tasa de éxito de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 9,9 GB e incluye VLM de 4B más readout de ~112M; en BF16 el conjunto rondaría los 8-9 GB de pesos, más activaciones y memoria del procesador visual.
- GPU recomendadas: el entrenamiento se realizó en 8 GPUs Hygon; para inferencia se requiere al menos una GPU con 16-24 GB de VRAM (A100, H100, RTX 4090, RTX A6000) para ejecutar el VLM en BF16.
- GPU de consumo: probable en RTX 4090 (24 GB) y posible en GPUs de 16 GB con cuantización, aunque no se han publicado recetas de cuantización para este checkpoint.
- Opciones de despliegue: no es compatible con `AutoModel.from_pretrained` de Transformers; requiere el código de entrenamiento `action_repre` y el cargador `QwenPIRepresentationV4` con `readout_architecture=layerwise_dit`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (raw VLM + layerwise DiT) | VLM 4B + readout 111,9M | No disponible | VLM congelado + DiT por capas para acciones | Apache 2.0 | Hugging Face, 0 descargas |
| Experto en acciones Qwen3 (28 capas, histórico) | No disponible | No disponible | Readout sobre Qwen3, 28 capas | No disponible | Referenciado en la model card, no enlazado |
| Qwen3-VL-4B-Instruct (base) | 4B | No disponible en esta ficha | VLM multimodal conversacional | No disponible en esta ficha | Hugging Face (Qwen/Qwen3-VL-4B-Instruct) |

La comparación con otros *action experts* sobre VLM (por ejemplo, variantes de OpenVLA o RT-2) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado en bucle cerrado: no hay evidencia de tasa de éxito en control real o simulado.
- La pérdida de entrenamiento (0,0289) no es una métrica de rendimiento de política; no debe interpretarse como tal.
- El checkpoint es un state dict completo, no un modelo cargable con Transformers; requiere código y cargador específicos y mapeo explícito de rutas de máquina.
- No incluye episodios crudos, activos de simulador, estado de optimizador ni checkpoints intermedios, lo que limita la reproducibilidad completa del entrenamiento.
- Entrenado exclusivamente en 14 tareas *held-out* de RoboTwin: la generalización fuera de ese entorno no está validada.
- Idiomas soportados no documentados; el comportamiento multilingüe heredado del VLM base no se ha evaluado en el contexto de control.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero el readout puede producir acciones fuera de distribución ante entradas visuales no vistas.
- Sesgos conocidos: no documentados, pero heredables del VLM base y del dataset RoboTwin.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero la ausencia de validación en producción desaconseja su despliegue directo.
- Sin descargas ni *likes* en el momento de la ficha: no hay validación comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/myendless/action-repre-newtask14-n32-rawvlm-layerwise384-l36-head10k-99cde744
- VLM base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.
