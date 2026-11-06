# nhatcm/smolvla-so101-balloon-to-tray-rgb-joint-delta

## Resumen

SmolVLA SO-101: Balloon to Tray (RGB + Joint Delta) es una política de visión-lenguaje-acción (VLA) obtenida mediante ajuste fino supervisado del checkpoint base `lerobot/smolvla_base`. La desarrolla el usuario `nhatcm` y está pensada para controlar un único brazo robótico SO-101 con una instrucción fija en inglés: «put balloon onto tray». El modelo resuelve un problema muy concreto de imitación robótica: mapear una imagen RGB de 256 x 256 y el estado articular del robot a secuencias de comandos de articulación.

Arquitectónicamente hereda la estructura SmolVLA de LeRobot: un codificador visual y un backbone SmolVLM congelados, junto con un experto de acción entrenable que produce chunks de 50 pasos de deltas articulares normalizados. El checkpoint tiene 450.046.188 parámetros (aproximadamente 450 M) y un tamaño de repositorio de 0,9 GB en safetensors.

Su relevancia es acotada pero ilustrativa: demuestra el flujo completo de ajuste fino de una política VLA compacta sobre un dataset pequeño (131 episodios, 38.732 frames) para una tarea de manipulación de un solo brazo. No obstante, el propio autor advierte de que no se ha evaluado el éxito de la tarea ni en simulación ni en robot físico, por lo que debe tratarse como un artefacto experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action): codificador visual + backbone SmolVLM congelados + experto de acción entrenable |
| Parametros totales | 450.046.188 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la política consume una imagen y un estado articular por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, con prompt de tarea fijo) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Modelo base | lerobot/smolvla_base |
| Entrada visual | 1 imagen RGB, `observation.images.rgb`, 256 x 256 |
| Entrada de estado | 6 posiciones articulares SO-101, `observation.state` |
| Salida | chunks de 50 pasos de 6 deltas de comando articular normalizados |
| Frecuencia de control | 20 Hz |
| Normalización de acción | identidad (la salida sigue el contrato `[-1, 1]` de `action_contract.json`) |
| Dataset de entrenamiento | `nhatcm/hitbench-balloon-tray-131` (131 episodios, 38.732 frames, 1 tarea) |
| Pasos de entrenamiento | 30.000 |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo sigue la receta SmolVLA de LeRobot. La parte perceptiva (codificador visual y backbone SmolVLM) permanece congelada durante el ajuste fino, mientras que se entrenan el experto de acción, la proyección de estado, las proyecciones de entrada y salida de acción y el MLP de tiempo de acción. La política consume una única imagen RGB de 256 x 256 y seis posiciones articulares del SO-101, y emite chunks de 50 pasos con seis deltas de comando articular normalizados, a una frecuencia de control de 20 Hz. El checkpoint no utiliza los campos auxiliares de efector final (EEF) presentes en el dataset original.

El entrenamiento se realizó durante 30.000 pasos con batch size 8, optimizador AdamW, learning rate máximo de 1e-4, warmup de 1.000 pasos y decaimiento coseno hasta 2,5e-6. Se aplicó una aumentación visual fuerte solo de apariencia (brillo, contraste, saturación, tono, nitidez y ruido gaussiano de sensor), sin máscaras de dropout ni deformaciones geométricas, ya que estas últimas podrían invalidar las acciones registradas. La pérdida final de entrenamiento fue de aproximadamente 0,001, un valor que el autor señala explícitamente como no indicativo de rendimiento fiable en despliegue. Los ajustes completos están en `strong_visual_augmentation.json` y `train_config.json`.

## Capacidades

- Generación de comandos articulares para un brazo SO-101 a partir de una imagen RGB y el estado articular actual.
- Ejecución de una única instrucción en inglés: «put balloon onto tray».
- Producción de chunks de acción de 50 pasos con seis deltas articulares normalizados en el rango `[-1, 1]`.
- Control en bucle cerrado a 20 Hz, adecuado para políticas de imitación en manipulación.
- Robustez aparente a variaciones de apariencia visual gracias a la aumentación de brillo, contraste, saturación, tono, nitidez y ruido de sensor.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: es una política motora, no un LLM conversacional.
- No tiene capacidades multilingües: el prompt de tarea es fijo en inglés.
- No procesa audio ni vídeo; solo una imagen RGB estática por paso.

## Casos de uso

- Investigación en imitación robótica: servir como punto de partida reproducible para estudiar el ajuste fino de SmolVLA sobre tareas de manipulación con un solo brazo y datasets pequeños.
- Prototipado de políticas VLA compactas: permite validar pipelines de LeRobot de extremo a extremo (entrenamiento, exportación a safetensors, carga y decodificación de acciones) antes de escalar a datasets mayores.
- Benchmarking de aumentación visual: el checkpoint incorpora un fichero de aumentación fuerte de apariencia que puede compararse con variantes sin aumentación para medir su efecto en robustez.
- Docencia y demostraciones de robótica: útil para explicar el contrato de observación/acción de un SO-101 (imagen 256 x 256, estado de 6 articulaciones, salida de deltas a 20 Hz) en entornos controlados.
- Base para ajuste fino posterior: al estar especializado en una sola tarea, puede reentrenarse con nuevos datasets manteniendo el backbone congelado y sustituyendo únicamente el experto de acción.
- Pruebas de integración de seguridad: sirve para ensayar la validación de orden de articulaciones, escalado, límites y parada de emergencia antes de conectar hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la pérdida final de entrenamiento fue de aproximadamente 0,001, pero que el checkpoint no ha sido evaluado para éxito de tarea ni en simulación ni en robot físico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M parámetros en safetensors (0,9 GB en fp32), una estimación orientativa en fp16 sería de aproximadamente 1 GB de pesos, más overhead de activaciones y del codificador visual; no se han publicado cifras medidas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna con al menos 4-8 GB de VRAM debería poder cargar los pesos, pero no hay datos publicados de latencia ni throughput.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque no se ha verificado ni documentado.
- Opciones de despliegue: librería `lerobot` (formato nativo del checkpoint). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política VLA motora.
- Latencia y throughput estimados: no disponible. El contrato de control especifica 20 Hz, pero no se ha medido el rendimiento real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nhatcm/smolvla-so101-balloon-to-tray-rgb-joint-delta | 450.046.188 | 1 imagen RGB 256 x 256 + estado de 6 articulaciones | Política VLA para SO-101, instrucción única | no disponible | Hugging Face (0 descargas, 0 likes) |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | Modelo base VLA de LeRobot, ajustable a tareas | no disponible | Hugging Face (modelo base citado) |
| Otros checkpoints SmolVLA de LeRobot | no disponible | no disponible | Políticas VLA para distintas tareas | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El checkpoint no ha sido evaluado para éxito de tarea ni en simulación ni en robot físico; la pérdida de entrenamiento baja no es evidencia de rendimiento fiable.
- Especializado en una única instrucción («put balloon onto tray»), un único flujo de cámara y una única convención de acción SO-101.
- No consume los campos auxiliares de efector final del dataset original, lo que limita su reutilización directa en pipelines que dependan de ellos.
- El prompt de tarea es fijo en inglés; no hay soporte multilingüe.
- Antes de controlar hardware real debe validarse el orden de articulaciones, el escalado, los límites, el comportamiento de parada de emergencia y el rendimiento en bucle cerrado en un entorno seguro.
- La licencia no está disponible, por lo que el uso comercial queda sin claridad jurídica hasta que el autor la especifique.
- Riesgo de sobreajuste al dataset de 131 episodios y a la escena concreta de construcción (banco de 70 estados más variaciones con el objeto retirado); la generalización a otras escenas no está demostrada.
- No se han publicado datos sobre sesgos, alucinación (en el sentido de acciones no válidas) ni robustez fuera de la aumentación de apariencia aplicada.
- El modelo no es un LLM: no soporta tool calling, razonamiento textual ni agentes multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/nhatcm/smolvla-so101-balloon-to-tray-rgb-joint-delta
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: `nhatcm/hitbench-balloon-tray-131` (identificador citado en la model card; no se proporciona URL directa en la información disponible)
- LeRobot (librería): no se proporciona URL en la información disponible
- Paper de SmolVLA: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
