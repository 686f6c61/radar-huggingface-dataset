# GeertWang/starvla-pipette-aim-wrist1031-qwenoft-mem-maxdata

## Resumen

starvla-pipette-aim-wrist1031-qwenoft-mem-maxdata es un modelo de vision-lenguaje-accion (VLA) desarrollado por GeertWang dentro del ecosistema starVLA, orientado al control de robots manipuladores. En concreto, implementa una politica de clonacion de conducta para el tercer paso de una tarea de pipeteo sobre un robot humanoide Unitree G1 equipado con manos Inspire: el objetivo es alinear la pipeta sujeta en la mano derecha con el tubo sostenido en la mano izquierda.

El modelo parte de Qwen3-VL-4B-Instruct como backbone y le anade una cabeza OFT (optimal feature transport) inicializada desde cero, junto con una memoria recurrente GRU que da nombre a la variante QwenOFTMem. Se entrena exclusivamente con clonacion de conducta supervisada (behavior cloning), sin refuerzo por aprendizaje, sobre datos propios y de DAgger. El checkpoint publicado corresponde al paso 12510, el ultimo guardado del entrenamiento.

Su relevancia es acotada pero concreta: es un ejemplo de receta reproducible de VLA para manipulacion bimanual de precision sobre hardware humanoide asequible, con soporte de historial temporal de velocidad de muneca y multiples vistas (ego, FOCUS y muneca izquierda). No obstante, el repositorio no incluye resultados de evaluacion en robot, benchmarks publicos ni informacion de licencia, y el propio autor indica que el checkpoint no se ha probado en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en Qwen3-VL-4B-Instruct con cabeza OFT y memoria GRU (QwenOFTMem) |
| Parametros totales | no disponible (backbone de 4B mas cabeza OFT y GRU; total exacto no indicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`qwenoft/checkpoints/steps_12510_pytorch_model.pt`) |
| Libreria | starvla |
| Tamano del repositorio | 9.2 GB |
| Pipeline | robotics |
| Tarea | Clonacion de conducta, paso 3 de pipeteo (Unitree G1 + manos Inspire) |
| Vistas de entrada | ego, FOCUS, wrist_left |
| Estado adicional | velocidad de muneca medida, historial de 1 s (6 pasos, 12 frames de separacion) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone vision-lenguaje Qwen3-VL-4B-Instruct con una cabeza de accion OFT inicializada desde cero y una memoria recurrente GRU. La variante se denomina QwenOFTMem. El modelo consume tres vistas de camara (ego, FOCUS y muneca izquierda) y, ademas, un estado explicito de velocidad de muneca con un historial temporal de 1 segundo compuesto por 6 pasos separados 12 frames entre si. Todos los parametros son entrenables.

El entrenamiento es puramente de clonacion de conducta (behavior cloning), sin RL. Se usan 10 epocas, batch de 128, learning rate 2.5e-5 con decaimiento coseno hasta 1e-6 y warmup de 688 pasos. Los datos combinan `data_pico1103`, `data_dagger_r4` (DAgger de 11-09 restringido al brazo derecho) y `data_auto_all` (todos los exitos autonomos), ponderados por numero de trayectorias. Cada trayectoria se registra con recorte de muneca y se corta antes de su pull-out. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de observaciones visuales multimodales y estado de velocidad.
- Control bimanual de precision para alineacion de objetos (pipeta en mano derecha, tubo en mano izquierda) sobre Unitree G1 con manos Inspire.
- Fusion de multiples vistas de camara (ego, FOCUS, wrist_left) en una unica politica.
- Uso de memoria temporal mediante GRU sobre un historial de 1 segundo de velocidad de muneca.
- Clonacion de conducta entrenada con datos de DAgger y exitos autonomos, lo que permite imitar politicas corregidas por un experto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): vision si (backbone Qwen3-VL); el resto no disponible.

## Casos de uso

- Automatizacion de pipeteo en laboratorio: el modelo ejecuta el paso de alineacion de la pipeta con el tubo dentro de un flujo de trabajo mas amplio de manipulacion robotica, adecuado porque ha sido entrenado especificamente sobre esa tarea y ese hardware.
- Investigacion en VLA bimanual: sirve como punto de partida para estudiar la combinacion de backbone VLM de 4B con cabeza OFT y memoria GRU en tareas de precision con dos manos.
- Reentrenamiento con datos propios: al ser un checkpoint de clonacion de conducta, puede reutilizarse como inicializacion para nuevas tareas de manipulacion sobre Unitree G1, sustituyendo o ampliando el dataset de entrenamiento.
- Evaluacion de estrategias DAgger: el modelo incorpora datos de DAgger restringidos al brazo derecho, por lo que es util para comparar politicas entrenadas con y sin correcciones de experto.
- Prototipado de politicas con historial temporal: el uso de velocidad de muneca y ventana de 1 segundo permite estudiar el impacto de la memoria recurrente en tareas de alineacion fina.
- Benchmark interno de robustez multi-vista: las tres camaras (ego, FOCUS, wrist_left) permiten analizar que vista aporta mas informacion en tareas de precision bimanual.
- Base para despliegue en simulacion: dado que el checkpoint no se ha probado en robot real, un uso realista inmediato es validarlo en un entorno simulado antes de transferirlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 9.2 GB, lo que sugiere pesos en precision completa o mixta para un backbone de 4B mas cabeza y memoria; el autor no detalla requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. Un backbone de 4B en FP16 requeriria del orden de 8-10 GB solo para pesos, pero no hay datos oficiales de consumo ni de cuantizacion.
- Opciones de despliegue: la libreria indicada es `starvla`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starvla-pipette-aim-wrist1031-qwenoft-mem-maxdata | no disponible (backbone 4B) | no disponible | VLA bimanual, pipeteo Unitree G1 | no disponible | Hugging Face, 0 descargas |
| Alternativas VLA de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no se ha ejecutado en un robot real segun el propio autor; su comportamiento fisico es desconocido.
- No se publican metricas de exito, benchmarks ni evaluaciones cuantitativas.
- La licencia no esta disponible, por lo que no puede asumirse uso comercial sin consultar al autor.
- El modelo esta especializado en una unica tarea (paso 3 de pipeteo) y un unico hardware (Unitree G1 con manos Inspire); no es una politica generalista.
- Los datos de entrenamiento son propietarios y no se detalla su composicion exacta ni su diversidad, lo que limita el analisis de sesgos.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; en VLA, el riesgo se traduce en acciones fisicas incorrectas.
- No se documentan limitaciones de contexto ni de idioma.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- El uso en produccion requeriria validacion en simulacion y en robot, ademas de un analisis de seguridad para manipulacion con objetos fragiles.

## Enlaces

- Hugging Face: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-qwenoft-mem-maxdata
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.
