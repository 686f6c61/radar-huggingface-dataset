# JHaeringer/pi05_isaac_piper_finetune_1000_delta_chunk_15_9000

## Resumen

`JHaeringer/pi05_isaac_piper_finetune_1000_delta_chunk_15_9000` es un checkpoint de ajuste fino del modelo **pi0.5** de OpenPI, una política visión-lenguaje-acción (VLA) orientada a manipulación robótica. El autor, JHaeringer, lo ha entrenado sobre datos sintéticos generados en Isaac Sim para una tarea concreta de pick-and-place con un brazo AgileX Piper: coger un cubo y depositarlo en una bandeja gris.

El checkpoint corresponde al paso 9000 de la ejecución de entrenamiento `isaac_finetune_1000_delta_chunk_15`, que emplea acciones delta y un tamaño de chunk de acción de 15. Se distribuye con los pesos de inferencia en formato orbax (unos 12 GB) y las estadísticas de normalización en `assets/`, sin `train_state`, ya que este solo es necesario para reanudar el entrenamiento.

Su relevancia es acotada: no es un modelo de propósito general, sino una política especializada para una tarea y un robot concretos, útil como referencia para quien quiera reproducir el pipeline de ajuste fino de pi0.5 en OpenPI o desplegar la política en el mismo entorno simulado. No hay información sobre arquitectura interna, número de parámetros ni contexto en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLA de OpenPI); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en inglés) |
| Licencia | other |
| Formato de pesos | orbax (checkpoint OpenPI); tamaño aproximado de 12 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de pi0.5, la política VLA de OpenPI, que combina entrada visual y una instrucción textual de tarea para producir acciones de robot. La model card no detalla la arquitectura interna (transformer, componentes de visión, política de difusión o similar), por lo que no se puede confirmar su diseño más allá de la etiqueta `pi0.5` y `vla`.

El entrenamiento se realizó sobre datos sintéticos generados en Isaac Sim para la tarea de pick-and-place con el brazo AgileX Piper, usando acciones delta y un chunk de acción de 15. La ejecución se denomina `isaac_finetune_1000_delta_chunk_15` y el checkpoint publicado corresponde al paso 9000. No se especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Las estadísticas de normalización se publican como asset separado (`JHaeringer/isaac_cube_pick_place_1000_no_depth`).

## Capacidades

- Generación de acciones de manipulación robótica condicionadas a observaciones visuales y a una instrucción de tarea.
- Ejecución de la tarea concreta de pick-and-place: coger un cubo y colocarlo en una bandeja gris.
- Uso de acciones delta con chunk de acción de 15, lo que implica predicción de secuencias cortas de acciones.
- Integración con el stack OpenPI para servir y evaluar la política (`scripts/serve_policy.py`).
- Instrucción por defecto: "Pick up the cube and place it on the gray tray."
- No hay información sobre tool calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modos de pensamiento.

## Casos de uso

- Evaluación de políticas VLA en simulación: desplegar el checkpoint en Isaac Sim con OpenPI para medir la tasa de éxito en la tarea de pick-and-place y comparar con otros checkpoints del mismo entrenamiento.
- Reproducción de pipelines de ajuste fino: usar este checkpoint como referencia para validar el flujo de entrenamiento `isaac_finetune_1000_delta_chunk_15` con acciones delta y chunk 15.
- Pruebas de integración con OpenPI: apuntar `serve_policy.py` al directorio del paso 9000 para verificar que el servidor de políticas carga pesos y estadísticas de normalización correctamente.
- Base para ajuste fino adicional: partir de estos pesos para adaptar la política a variaciones de la tarea (otra posición de bandeja, otro objeto) en el mismo entorno simulado.
- Docencia y experimentación en robótica: ilustrar el ciclo completo de datos sintéticos, entrenamiento VLA y evaluación en simulación con un caso acotado y reproducible.
- Validación de infraestructura de checkpoints: comprobar que un directorio de paso sin `train_state` se integra correctamente en el gestor de checkpoints de OpenPI para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos de inferencia ocupan aproximadamente 12 GB en formato orbax, por lo que se necesita al menos esa cantidad de memoria de GPU para cargarlos, sin contar overhead del runtime.
- GPU recomendadas: no especificadas por el autor; por tamaño de checkpoint, una GPU con 16 GB o más de VRAM es el mínimo razonable, y se recomienda 24 GB o más (RTX 4090, A100, H100) para margen operativo.
- No se indica si cabe en GPU de consumo con cuantización; no hay información sobre cuantizaciones soportadas.
- Opciones de despliegue: OpenPI (`scripts/serve_policy.py`) con el directorio del paso como `--policy.dir`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato de checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_isaac_piper_finetune_1000_delta_chunk_15_9000 | VLA (pi0.5 fine-tune) | Pick-and-place Piper en Isaac Sim | no disponible | other | Hugging Face, 0 descargas |
| pi0.5 base (OpenPI) | VLA | Manipulación general | no disponible | no disponible | Repositorio OpenPI |
| Otros checkpoints del mismo run | VLA (pi0.5 fine-tune) | Misma tarea, distintos pasos | no disponible | other | No disponibles en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una única tarea (cubo a bandeja gris) con un robot concreto (AgileX Piper) en Isaac Sim; no es un modelo de propósito general.
- Entrenado con datos sintéticos, lo que puede provocar una brecha de realidad (sim-to-real) si se despliega en un robot físico sin adaptación.
- Sin `train_state`: el repositorio no permite reanudar el entrenamiento, solo inferencia.
- Licencia "other": no se detallan los términos; es necesario revisar las condiciones de OpenPI y del autor antes de cualquier uso comercial.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas; al ser una política de acciones, el riesgo principal es la ejecución incorrecta de la tarea, no la generación de texto.
- Sin datos de benchmarks ni de tasa de éxito, por lo que no se puede evaluar su calidad objetivamente a partir de la información disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/JHaeringer/pi05_isaac_piper_finetune_1000_delta_chunk_15_9000
- Asset de estadísticas de normalización: https://huggingface.co/JHaeringer/isaac_cube_pick_place_1000_no_depth
- OpenPI (repositorio del framework): no disponible en la información proporcionada
- Isaac Sim (NVIDIA): no disponible en la información proporcionada
