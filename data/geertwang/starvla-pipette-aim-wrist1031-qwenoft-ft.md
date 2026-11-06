# GeertWang/starvla-pipette-aim-wrist1031-qwenoft-ft

## Resumen

starVLA QwenOFT + wrist es un modelo de visión-lenguaje-acción (VLA) especializado en robótica manipulativa, desarrollado por el usuario GeertWang y publicado bajo el ecosistema starVLA. Concretamente, se trata de un fine-tuning del modelo base starVLA QwenOFT orientado al tercer paso de una tarea de pipeteo sobre un robot humanoide Unitree G1 equipado con manos Inspire: introducir una pipeta sostenida en la mano derecha dentro de un tubo sujeto en la mano izquierda. El modelo combina observaciones visuales egocéntricas con una vista de muñeca y la velocidad medida de la muñeca como estado, y se entrena mediante clonación de comportamiento (behavior cloning) sobre episodios recolectados con HG-DAgger.

El interés técnico del modelo reside en su carácter altamente especializado y en el uso de datos de intervención humana para corregir políticas autónomas en una tarea de precisión milimétrica. No obstante, conviene subrayar que se trata de un artefacto de investigación: el propio autor indica que el modelo no se ha ejecutado sobre un robot real y que las métricas reportadas son puramente offline, además de estar calculadas sobre el mismo conjunto de validación empleado para seleccionar el checkpoint. El repositorio ocupa 9,1 GB y no declara licencia ni idiomas soportados.

La relevancia actual del modelo es limitada fuera de su nicho: sirve como referencia reproducible de un pipeline starVLA aplicado a manipulación bimanual fina, pero no constituye una base generalista ni un modelo listo para producción. Su valor está en documentar la receta de entrenamiento (pesos por frame, hiperparámetros, vistas) y en servir de punto de partida para quienes trabajen en tareas de inserción o alineación con robots humanoides.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en starVLA con backbone QwenOFT (VLM) y cabeza de acción; no se detalla la topología interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, `steps_1794_pytorch_model.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de starVLA QwenOFT, un stack VLA que acopla un modelo de visión-lenguaje (QwenOFT) con una cabeza de predicción de acciones. En este fine-tuning se emplean tres vistas visuales —ego, FOCUS y wrist_left— junto con la velocidad medida de la muñeca como parte del estado, y se mantienen todos los parámetros entrenables. La cabeza de acción inicial es la `aug3 INSERT` del checkpoint R3 `steps_2628`.

El entrenamiento se realiza por clonación de comportamiento sobre 230 episodios de entrenamiento y 38 de validación recogidos con HG-DAgger, sin teleoperación, cada uno truncado antes de su fase de extracción (el modelo no aprende el pull-out). Se usan 114.830 anclas de entrenamiento, pérdida L1 con pesos por frame (automático 1, humano 2, enmascarado 0), batch de 128, learning rate de 2e-6 para el VLM, 2e-5 para la cabeza y 5e-6 para el resto, con scheduler coseno hasta 1e-6 durante 10 épocas. No se emplea RL. El checkpoint final es `qwenoft/checkpoints/steps_1794_pytorch_model.pt`.

## Capacidades

- Predicción de acciones de manipulación para el paso 3 de una tarea de pipeteo sobre Unitree G1 con manos Inspire.
- Fusión de múltiples vistas visuales (ego, FOCUS, muñeca izquierda) con estado propioceptivo (velocidad de muñeca).
- Clonación de comportamiento con correcciones humanas (HG-DAgger) para alinear la pipeta con el tubo.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento general ni matemáticas.
- No se documentan capacidades multilingües ni modos de pensamiento (thinking), visión general o audio.
- El alcance funcional está restringido a la tarea y al robot especificados en la model card.

## Casos de uso

- Investigación en manipulación bimanual fina: el modelo sirve como referencia reproducible para estudiar inserción y alineación de precisión con dos manos en un humanoide, usando las tres vistas y el estado de velocidad documentados.
- Reentrenamiento con HG-DAgger: el pipeline descrito (pesos por frame humano/autónomo, truncado antes del pull-out) puede reutilizarse para corregir políticas en tareas de ensamblaje donde el error humano es costoso.
- Evaluación offline de políticas VLA: las métricas L1 sobre 480 muestras retenidas permiten comparar variantes de cabeza de acción o de configuración de vistas sin acceso a hardware.
- Estudio de ablación de vistas: al incluir ego, FOCUS y muñeca izquierda, el checkpoint facilita experimentos sobre qué vista aporta más señal en tareas de alineación milimétrica.
- Base para transferencia a tareas análogas: el fine-tuning sobre QwenOFT puede adaptarse a otras tareas de inserción (tubos, conectores, componentes) con datos propios.
- Docencia y divulgación: como ejemplo completo de receta starVLA con hiperparámetros, composición de datos y criterios de selección de checkpoint para cursos de robótica aprendida.

## Benchmarks y rendimiento

Métricas offline reportadas por el autor (error L1, menor es mejor), sobre 480 muestras retenidas:

| Conjunto | Todas las 38 episodios | Frames humanos | Frames autónomos | Primeras 12 | Últimas 12 |
|---|---|---|---|---|---|
| Este checkpoint | 0.0282 | 0.0422 | 0.0188 | 0.0453 | 0.0233 |
| Referencia "hold still" (repetir primera fila objetivo) | 0.0149 | no disponible | no disponible | 0.0278 | 0.0089 |

El propio autor advierte que el checkpoint se seleccionó sobre el mismo holdout con el que se evalúa, por lo que las cifras son ligeramente optimistas. Además, la referencia "hold still" obtiene un error menor en el agregado, lo que sugiere que la tarea es especialmente sensible a la métrica elegida. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 9,1 GB en formato PyTorch, lo que da una cota inferior orientativa del orden de esa cifra para cargar los pesos, sin contar activaciones ni buffers de las vistas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta.
- Opciones de despliegue: la librería declarada es `starvla`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que el modelo no se ha ejecutado sobre un robot real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starVLA QwenOFT + wrist (este) | no disponible | no disponible | Pipeteo paso 3 en Unitree G1 | no disponible | Hugging Face, 0 descargas |
| starVLA R3 steps_2628 (checkpoint de partida) | no disponible | no disponible | Tarea de inserción con cabeza `aug3 INSERT` | no disponible | Referenciado en la model card |
| Otros VLA open source (p. ej. OpenVLA, π0) | no disponible en esta ficha | no disponible | Manipulación generalista | no disponible | no disponible |

No se dispone de datos comparativos verificables en la información proporcionada; la comparación con alternativas generalistas requeriría consultar sus respectivas model cards.

## Limitaciones y advertencias

- El modelo no se ha ejecutado sobre un robot real: todas las cifras son offline.
- El checkpoint se eligió sobre el mismo holdout con el que se evalúa, por lo que los resultados están sesgados al alza.
- La referencia "hold still" supera al modelo en el error agregado (0.0149 frente a 0.0282), lo que cuestiona la utilidad práctica de la política en su estado actual.
- Entrenado únicamente para el paso 3 de una tarea concreta; no aprende la fase de extracción (pull-out) ni generaliza a otras tareas.
- El `config.yaml` contiene rutas del nodo de entrenamiento (`base_vlm` / tokenizer); es necesario apuntarlas a copias locales antes de usar el modelo.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- No se documentan sesgos, idiomas ni riesgos de alucinación; al ser un modelo de acción, el riesgo principal es de ejecución física incorrecta en un robot real.
- Sin métricas de éxito en robot, latencia ni throughput, no es apto para producción sin una validación adicional exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-qwenoft-ft
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
