# GeertWang/starvla-pipette-aim-wrist1031-qwenoft-mem-pico1103

## Resumen

starVLA qwenoft-mem-pico1103 es un modelo de visión-lenguaje-acción (VLA) para robótica manipulativa, publicado por el usuario GeertWang en Hugging Face. Se trata de un checkpoint de behavior cloning (aprendizaje por imitación) entrenado para el paso 3 de una tarea de pipeteo con un robot humanoide Unitree G1 equipado con manos Inspire: el objetivo es alinear la pipeta sujeta en la mano derecha con el tubo que sostiene la mano izquierda. El modelo parte de Qwen3-VL-4B-Instruct como backbone, al que se le añade una cabeza OFT nueva y una memoria GRU (arquitectura QwenOFTMem).

El modelo es relevante como ejemplo de adaptación de un VLM generalista de 4 mil millones de parámetros a una tarea robótica de precisión mediante imitación pura, sin refuerzo, incorporando memoria temporal (historial de 1 segundo de vistas y velocidad de muñeca) y múltiples vistas (ego, FOCUS y muñeca izquierda). El repositorio ocupa 9,2 GB e incluye el checkpoint `qwenoft/checkpoints/steps_2490_pytorch_model.pt`, que corresponde al último paso guardado del entrenamiento.

Se trata de un artefacto de investigación de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y que no fue ejecutado en un robot real en el momento de su publicación. Su interés es principalmente metodológico para quienes trabajan en VLA y manipulación fina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en Qwen3-VL-4B-Instruct + cabeza OFT + memoria GRU (QwenOFTMem) |
| Parametros totales | no disponible (backbone de 4B; total no declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); no se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue un esquema VLA: un backbone de visión-lenguaje Qwen3-VL-4B-Instruct procesa las observaciones visuales y la instrucción, una cabeza OFT (recién inicializada) produce las acciones, y un módulo de memoria GRU (QwenOFTMem) integra información temporal. Las entradas incluyen tres vistas (ego, FOCUS y muñeca izquierda) más la velocidad de muñeca medida como estado, con un historial de 1 segundo compuesto por 6 pasos separados 12 fotogramas. Todos los parámetros son entrenables.

El entrenamiento es de behavior cloning puro, sin RL, sobre el dataset `data_pico1103` (identificado como modelo número 10 de una serie), con recortes de muñeca y cada episodio cortado antes de su extracción. Se realizaron 10 épocas con batch de 128, learning rate 2,5e-5 con decaimiento coseno hasta 1e-6 y 136 pasos de warmup. El checkpoint publicado corresponde al paso 2490, el último guardado.

## Capacidades

- Generación de acciones motoras para una tarea de manipulación fina (alineación de pipeta con tubo) a partir de observaciones visuales multi-vista.
- Procesamiento de tres vistas simultáneas: ego, FOCUS y muñeca izquierda.
- Integración de estado propioceptivo: velocidad de muñeca medida como variable de estado.
- Memoria temporal a corto plazo (1 segundo, 6 pasos) mediante GRU para tareas que requieren continuidad.
- Comprensión de instrucciones en lenguaje natural heredada del backbone Qwen3-VL-4B-Instruct (capacidad no verificada en la información disponible).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking específico para este checkpoint.

## Casos de uso

- Investigación en behavior cloning para manipulación fina: sirve como referencia reproducible de cómo adaptar un VLM de 4B a una tarea de precisión con memoria temporal y múltiples vistas.
- Pipeteo automatizado en laboratorio: el modelo está entrenado específicamente para alinear la pipeta con el tubo, un paso crítico en flujos de dosificación líquida.
- Desarrollo de políticas VLA con memoria: el módulo GRU y el historial de velocidad de muñeca son útiles para estudiar cómo la información temporal mejora tareas de contacto.
- Benchmarking de arquitecturas QwenOFT frente a alternativas: la serie de checkpoints del mismo autor (variantes `-ft` y `-scratch`) permite comparar estrategias de inicialización.
- Prototipado en robótica humanoide con Unitree G1: el modelo está condicionado a esa plataforma y a manos Inspire, lo que facilita la integración en pipelines de control existentes.
- Estudio de fusión multi-vista: la combinación ego + FOCUS + muñeca izquierda es un caso concreto para evaluar cómo distintas perspectivas afectan al rendimiento en tareas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 9,2 GB, lo que sugiere pesos en precisión completa o mixta para un backbone de 4B más cabeza y memoria. Una estimación orientativa para un modelo de 4B en FP16 sería de unos 8-10 GB, pero no está confirmada por el autor.
- GPU recomendadas: no disponible. Por tamaño del backbone, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB) sería el mínimo razonable, pero no hay confirmación.
- ¿Cabe en GPU de consumo? Probablemente sí en una RTX 4090 o similar para el backbone, aunque no se documenta.
- Opciones de despliegue: la librería declarada es `starvla`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starVLA qwenoft-mem-pico1103 (este) | Backbone 4B + OFT + GRU | no disponible | Pipeteo paso 3, Unitree G1 | no disponible | Hugging Face (0 descargas) |
| starVLA pipette-aim-wrist1031-qwenoft-ft | Backbone 4B + OFT | no disponible | Pipeteo paso 3, data_1031, step 1794 | no disponible | Hugging Face |
| starVLA pipette-aim-wrist1031-qwenoft-scratch | Backbone 4B + OFT | no disponible | Pipeteo paso 3, desde cero | no disponible | Hugging Face (18,3 GB) |

Las tres variantes comparten backbone y familia de tareas; difieren en inicialización (pretrained vs. scratch), dataset y checkpoint. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo no fue ejecutado en un robot real en el momento de su publicación; su comportamiento físico no está validado.
- Es un checkpoint de una tarea muy específica (paso 3 de pipeteo) y no generaliza a otras tareas sin reentrenamiento.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribución.
- Sin idiomas declarados: no hay garantía sobre el comportamiento multilingüe del backbone en esta configuración.
- Riesgo de sobreajuste al dataset `data_pico1103` y a las condiciones de grabación (recortes de muñeca, episodios truncados antes de la extracción).
- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia cuantitativa de precisión en la tarea.
- El repositorio tiene cero descargas y cero likes, lo que indica ausencia de validación por parte de la comunidad.
- El formato de pesos es `.pt` de PyTorch, lo que limita la portabilidad frente a safetensors o GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-qwenoft-mem-pico1103
- Variante fine-tuned: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-qwenoft-ft
- Variante desde cero: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-qwenoft-scratch/tree/main
