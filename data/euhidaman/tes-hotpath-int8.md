# euhidaman/tes-hotpath-int8

## Resumen

TES-hotpath-int8 es un modelo de visión-lenguaje de tipo TinyML publicado por el autor euhidaman como artefacto de investigación asociado al artículo "Tiered Episodic Specialists" (Deployable AI workshop, AAAI-27, en revisión). No es un modelo de propósito general: es la "ruta caliente" (hot path) de una arquitectura por niveles diseñada para ejecutarse en microcontroladores de la clase STM32H743, es decir, dispositivos con cientos de kilobytes de RAM y sin acelerador de IA dedicado.

La arquitectura combina un extractor visual MobileNetV2-0.5 a 160 px con padding SAME, una clave de texto hasheada y un bloque de fusión denominado SAF. El modelo se ha destilado sin etiquetas a partir de SmolVLM-256M y se distribuye cuantizado a int8 en formato TFLite, con un grafo completo de 796.800 bytes y un arena de TFLM de 495.948 bytes.

Su relevancia es acotada pero específica: demuestra que es posible ejecutar tareas de razonamiento visual-lenguaje elemental en el orden de 164 millones de instrucciones por respuesta en un MCU, con una precisión en ScienceQA (0,671) que supera ligeramente a la del profesor (0,661). No obstante, el propio autor advierte que las cifras de instrucciones provienen de emuladores (Renode y QEMU) y no de mediciones en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: MobileNetV2-0.5 (stem visual, 160 px, SAME padding) + clave de texto hasheada + bloque de fusión SAF |
| Parametros totales | no disponible (el grafo int8 completo ocupa 796.800 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera con tablas de episodios de 32 KB por contexto) |
| Tipos de cuantizacion | int8 (grafo TFLite completo y grafos divididos); fp32 en checkpoints PyTorch |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (int8) y PyTorch `.pt` (fp32) |

## Arquitectura y entrenamiento

El modelo sigue un diseño en tres componentes: un stem visual MobileNetV2 con factor de ancho 0,5 que procesa imágenes de 160 px con padding SAME; una representación de texto mediante clave hasheada (hashed text key), que evita un tokenizador y un encoder de lenguaje completo; y un bloque de fusión SAF que combina ambas modalidades. Sobre esta base se añaden tablas de episodios de 32 KB por contexto, que actúan como memoria episódica específica de la tarea.

El entrenamiento se realizó mediante destilación sin etiquetas desde SmolVLM-256M, lo que permite obtener el comportamiento del profesor sin necesidad de anotaciones humanas. El autor publica tres semillas (seed 0, 1 y 2) tanto en int8 como en fp32, lo que facilita la reproducibilidad. La exportación a int8 conserva la precisión en ScienceQA (0,657 en fp32 y 0,657 en int8) con un 0,94 de acuerdo en el argmax sobre el conjunto de comprobación, según los datos de la model card.

## Capacidades

- Razonamiento visual-lenguaje elemental sobre imágenes de 160 px, orientado a preguntas de opción múltiple tipo ScienceQA.
- Detección de presencia de objetos (evaluado en COCO-presence val).
- Evaluación de alucinación visual mediante POPE (test).
- Clasificación y respuesta a partir de una clave de texto hasheada, sin generación de lenguaje libre.
- Memoria episódica por contexto mediante tablas de episodios de 32 KB, que permiten adaptar el comportamiento a la tarea sin reentrenar.
- Ejecución en microcontroladores mediante TFLite Micro, con grafos completos y grafos divididos (stem y fusión) para facilitar el despliegue por etapas.
- No dispone de tool calling, function calling, capacidades de agente ni modo de razonamiento multi-paso.

## Casos de uso

- Clasificación visual en microcontroladores: el grafo int8 de 796.800 bytes y un arena de TFLM de 495.948 bytes permiten ejecutar inferencia en un STM32H743 sin sistema operativo, útil para sensores industriales con etiquetado visual.
- Preguntas de opción múltiple sobre imágenes en dispositivos de borde: el modelo responde a consultas tipo ScienceQA con una precisión de 0,671, adecuado para aplicaciones educativas o de asistencia en campo sin conectividad.
- Detección de presencia de objetos en cámaras de bajo consumo: con un rendimiento de 0,651 en COCO-presence val, puede emplearse para disparar alertas o activar actuadores en función de la escena.
- Investigación en destilación sin etiquetas: los checkpoints fp32 y las tres semillas permiten reproducir y extender el método de destilación desde SmolVLM-256M a otros dominios.
- Prototipado de arquitecturas por niveles: las tablas de episodios de 32 KB sirven como base para experimentar con memoria episódica en sistemas embebidos.
- Evaluación de robustez frente a alucinación visual: el resultado en POPE (0,605) permite comparar el comportamiento de modelos TinyML frente a profesores de mayor tamaño en tareas de fidelidad visual.
- Despliegue por etapas con grafos divididos: los ficheros `tes_stem_int8.tflite` y `tes_fusion_int8.tflite` permiten cargar y ejecutar el stem y la fusión por separado, útil cuando el presupuesto de memoria es especialmente restrictivo.

## Benchmarks y rendimiento

| Benchmark | TES-hotpath-int8 | Profesor (SmolVLM-256M) |
|---|---|---|
| ScienceQA (test, accuracy) | 0,671 | 0,661 |
| COCO-presence (val) | 0,651 | no disponible |
| POPE (test) | 0,605 | 0,720 |
| ScienceQA fp32 vs int8 | 0,657 / 0,657 | no aplica |
| Acuerdo argmax en check set | 0,94 | no aplica |
| Instrucciones por respuesta | 164.073.092 (Renode/QEMU) | no disponible |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para ejecución en MCU con memoria SRAM, no en GPU.
- Arena de TFLM: 495.948 bytes para el grafo completo int8.
- Tamaño del grafo: 796.800 bytes por semilla en int8.
- Hardware objetivo: microcontroladores de la clase STM32H743 (Cortex-M7).
- No cabe en GPU de consumo en el sentido habitual porque no es un modelo de inferencia en servidor; puede ejecutarse en x86 mediante los kernels de referencia de TFLite.
- Opciones de despliegue: TFLite Micro (recomendado), TFLite en x86 para validación, PyTorch para los checkpoints fp32.
- Latencia y throughput: 164.073.092 instrucciones por respuesta medidas en Renode y QEMU; no hay mediciones en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA | Licencia | Formato |
|---|---|---|---|---|---|
| TES-hotpath-int8 | no disponible (796.800 B int8) | no disponible | 0,671 | Apache 2.0 | TFLite, PyTorch |
| SmolVLM-256M (profesor) | 256 M | no disponible | 0,661 | no disponible en la informacion | no disponible |
| MobileNetV2-0.5 (stem aislado) | no disponible | no aplica | no disponible | Apache 2.0 (upstream) | TFLite, PyTorch |

La comparación con modelos TinyML de visión-lenguaje de propósito general no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los recuentos de instrucciones provienen de emuladores (Renode y QEMU), no de mediciones en hardware real; el rendimiento en un STM32H743 físico puede diferir.
- Las cifras int8 se obtuvieron con los kernels de referencia de TFLite sobre x86, no sobre el MCU objetivo.
- Los grafos int8 de esta release funcionan con un episodio casi nulo, lo que limita su utilidad directa sin cargar una tabla de episodios adecuada.
- El modelo está cerca del azar en temas no vistos durante el entrenamiento; la precisión se recupera con un episodio sin etiquetas, según el artículo.
- El rendimiento en POPE (0,605) es notablemente inferior al del profesor (0,720), lo que indica mayor propensión a alucinación visual.
- No se especifican los idiomas soportados ni la composición del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de robustez en producción.
- No dispone de tool calling, agentes ni generación de lenguaje libre; su uso está restringido a tareas de clasificación y respuesta cerrada.

## Enlaces

- Hugging Face: https://huggingface.co/euhidaman/tes-hotpath-int8
- Artículo: "Tiered Episodic Specialists" (Deployable AI workshop, AAAI-27, en revisión); no se proporciona URL en la información disponible.
- Modelo profesor: SmolVLM-256M (no se proporciona URL en la información disponible).
