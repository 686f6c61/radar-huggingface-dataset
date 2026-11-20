# pawanpaudel93/xr0-libero-int8-ov

## Resumen

XR0-LIBERO int8-ov es un paquete de política (`policy_package`) para el motor `ov-policy` de Cascadia, generado a partir del modelo vision-language-action XiaomiRobotics/Xiaomi-Robotics-0-LIBERO (revisión `fc04bbdcc53e498695cfad95d1199091396ef55b`). El autor de la conversión es pawanpaudel93, que ha tomado el grafo en fp16 del paquete original y le ha aplicado compresión de pesos INT8 asimétrica mediante NNCF (Neural Network Compression Framework de Intel). El resultado es un artefacto de 4,6 GB pensado para ejecutarse sobre CPUs y GPUs Intel a través de OpenVINO.

El modelo resuelve el problema de ejecutar una política robótica VLA (vision-language-action) en hardware de consumo Intel sin depender de CUDA ni de PyTorch en tiempo de inferencia. La interfaz es explícita: recibe un vector de estado de 8 dimensiones, dos imágenes RGB de 256×256 (cámara base y muñeca izquierda) y una descripción textual de la tarea, y devuelve una secuencia de 30 acciones de 7 dimensiones cada una. Está especializado en el benchmark LIBERO de manipulación robótica.

Su relevancia es doble: por un lado demuestra el flujo de conversión de modelos VLA a OpenVINO con cuantización INT8; por otro, advierte de que el soporte de ejecución (`ov-policy`) aún no está en una release pública de Cascadia, por lo que hoy es un artefacto de laboratorio más que un componente listo para producción. No se han publicado métricas de éxito de tarea para los pesos INT8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de Xiaomi-Robotics-0; grafo convertido a OpenVINO |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (entrada de tarea como texto libre, sin ventana declarada) |
| Tipos de cuantización | INT8 asimétrico de pesos (NNCF INT8_ASYM); paquete original en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (paquete `policy_package` para el motor `ov-policy` de Cascadia) |
| Entradas | `state` [8], `images.base` [3, 256, 256], `images.wrist_left` [3, 256, 256], `task` [] (uint8 RGB) |
| Salidas | `action` [30, 7] |
| Tamaño del repositorio | 4,6 GB |
| Librería | openvino |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Xiaomi-Robotics-0-LIBERO: no se especifican el número de parámetros, la composición del backbone visual, el codificador de lenguaje ni el cabezal de acciones. Lo que sí se documenta es la transformación aplicada: se parte del grafo fp16 del paquete original y se comprime a INT8 asimétrico con NNCF, manteniendo la topología y los nombres de entrada/salida (`state`, `images.base`, `images.wrist_left`, `task` → `action`).

El modelo es una política de imitación entrenada sobre LIBERO, un conjunto de tareas de manipulación robótica. La interfaz indica condicionamiento multimodal: estado proprioceptivo de 8 dimensiones, dos vistas de cámara y una instrucción de tarea en texto. La salida es un chunking de 30 pasos de acción de 7 grados de libertad, patrón habitual en políticas de difusión o transformers de acción, aunque el tipo exacto de cabezal no se especifica. No hay datos publicados sobre número de tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas condicionadas por lenguaje: dada una instrucción de tarea en texto, produce una secuencia de 30 acciones de 7 dimensiones.
- Percepción visual multi-cámara: procesa simultáneamente una vista base y una vista de muñeca izquierda a 256×256 píxeles en RGB.
- Condicionamiento por estado proprioceptivo: integra un vector de estado de 8 dimensiones junto con las imágenes y el texto.
- Ejecución en hardware Intel: CPUs y GPUs Intel mediante OpenVINO, sin requerir CUDA.
- Inferencia cuantizada: pesos INT8 asimétricos para reducir huella de memoria y acelerar en hardware Intel.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, ni soporte multilingüe explícito.

## Casos de uso

- Manipulación robótica en simulación LIBERO: el paquete puede ejecutarse como política de control en entornos LIBERO para evaluar el efecto de la cuantización INT8 frente al modelo fp16 original, usando la instrucción de tarea como condicionamiento.
- Despliegue en robots con CPU/GPU Intel integrada: al ejecutarse vía OpenVINO sobre hardware Intel, es adecuado para plataformas embebidas o de borde donde no hay GPU NVIDIA disponible.
- Prototipado de pipelines VLA en el ecosistema Cascadia: sirve para validar la integración del motor `ov-policy` con el tipo de política `xr0` antes de que el soporte llegue a una release estable.
- Investigación sobre cuantización de políticas robóticas: permite medir la degradación de precisión (paridad de acciones) al pasar de fp16 a INT8 asimétrico, con una referencia declarada de 2,4e-2 frente al port de PyTorch de Intel.
- Benchmarking de latencia en GPUs Intel integradas: con una latencia declarada de aproximadamente 141 ms en Arc 140V, es útil para comparar el rendimiento de inferencia entre dispositivos Intel.
- Base para ajuste fino o destilación: aunque el paquete es de inferencia, el modelo base Apache-2.0 permite derivar variantes para nuevas tareas de manipulación con dos cámaras y estado de 8 dimensiones.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Latencia de inferencia | ~141 ms (f16) | GPU Intel Arc 140V |
| Paridad frente al port de PyTorch de Intel | dentro de 2,4e-2 | CPU, cómputo f32 |
| Tasa de éxito de tarea (INT8) | no medida | — |
| Comparación con el modelo original de Xiaomi | pendiente | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tasas de éxito en tareas LIBERO para estos pesos.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 4,6 GB; en ejecución, el paquete INT8 requiere del orden de esa cifra de memoria, aunque el consumo exacto no está documentado.
- GPU recomendadas: GPUs Intel con soporte OpenVINO; el autor verifica en una Arc 140V (GPU integrada). No hay datos para GPUs discretas Intel ni para NVIDIA.
- CPUs: el paquete está pensado también para CPUs Intel, con paridad medida frente a un port de PyTorch en CPU con cómputo f32.
- Cabe en GPU de consumo: sí, en el caso verificado de una GPU integrada Intel Arc 140V; no se documenta su comportamiento en GPUs de consumo NVIDIA.
- Opciones de despliegue: exclusivamente el motor `ov-policy` de Cascadia (`cascadia run ./xr0-libero-int8-ov --engine ov-policy --device GPU`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: aproximadamente 141 ms por inferencia en Arc 140V con pesos f16; no se reporta throughput ni latencia para INT8.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| pawanpaudel93/xr0-libero-int8-ov | VLA cuantizado INT8, OpenVINO | estado [8] + 2 imágenes 256×256 + texto → acciones [30, 7] | Apache-2.0 | Hugging Face; requiere Cascadia con `ov-policy` (en revisión) |
| XiaomiRobotics/Xiaomi-Robotics-0-LIBERO | VLA original (fp16) | misma interfaz | Apache-2.0 | Hugging Face |
| Port de PyTorch de Intel (referencia de paridad) | VLA en PyTorch | misma interfaz | no disponible | Referencia interna citada por el autor |

No se dispone de información sobre otros modelos VLA comparables (parámetros, contexto o rendimiento) en la documentación proporcionada.

## Limitaciones y advertencias

- El motor necesario (`ov-policy` de Cascadia, tipo `xr0`) no está en ninguna release pública: el repositorio `labscommunity/cascadia` está en revisión, por lo que el paquete no es ejecutable con una instalación estándar.
- No se ha medido la tasa de éxito de tarea con pesos INT8; se desconoce la degradación funcional de la cuantización más allá de la paridad numérica de acciones.
- La paridad se midió contra el port de PyTorch de Intel, no contra el modelo original de Xiaomi; esa comparación está pendiente.
- Especialización estrecha: entrenado para LIBERO, con dos cámaras fijas y estado de 8 dimensiones; no es un modelo de propósito general ni un asistente conversacional.
- Sin datos publicados sobre sesgos, alucinación o cobertura idiomática; la entrada de texto de tarea no tiene idiomas declarados.
- Licencia Apache-2.0 permite uso comercial, pero el paquete es una copia modificada del modelo fuente; conviene conservar los avisos de licencia incluidos en `LICENSE`.
- La latencia reportada (~141 ms) corresponde a pesos f16 en Arc 140V; no hay cifras para INT8 ni para otros dispositivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pawanpaudel93/xr0-libero-int8-ov
- Modelo base: https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-0-LIBERO
- Repositorio Cascadia (en revisión): https://github.com/labscommunity/cascadia
- OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
