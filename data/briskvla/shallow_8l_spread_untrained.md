# briskVLA/shallow_8L_spread_untrained

## Resumen

BriskVLA/shallow_8L_spread_untrained es un checkpoint de investigación derivado de SmolVLA, el modelo de visión-lenguaje-acción (VLA) de LeRobot orientado a control robótico. En concreto, se trata de un "action expert" de profundidad reducida: conserva únicamente 8 de las capas del experto del modelo docente `lerobot/smolvla_libero`, seleccionadas según el patrón `[0, 1, 4, 5, 8, 9, 12, 13]`, con un layout canónico denominado `spread` y un ancho de FFN por defecto de 2048. El modelo tiene 400.923.616 parámetros y un tamaño de repositorio de 0,8 GB.

El propósito del checkpoint es servir como punto de partida para experimentos de destilación y compresión de modelos VLA en el benchmark LIBERO. La model card indica explícitamente que es un modelo "untrained" (no reentrenado tras el recorte de capas), por lo que su función principal es la de base para pipelines de destilación posteriores (por ejemplo, reducir de 8L a 4L) y para medir latencia frente al docente completo. No está pensado como un modelo listo para producción.

La relevancia actual radica en el interés creciente por reducir el coste computacional de los modelos VLA, que combinan un backbone de visión-lenguaje con un experto de acciones. Este checkpoint forma parte de una familia de variantes (roles `shallow`, distintos layouts y profundidades) que permiten estudiar el compromiso entre profundidad del experto, latencia y tasa de éxito en tareas de manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA (backbone vision-lenguaje + action expert transformer); experto reducido a 8 capas |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA de LeRobot, en la que un backbone de visión-lenguaje se combina con un experto de acciones que genera comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. En esta variante, el experto se ha recortado a 8 capas seleccionadas del docente `lerobot/smolvla_libero` (commit `a24f1f380461`) según el patrón `[0, 1, 4, 5, 8, 9, 12, 13]`, manteniendo el ancho de FFN por defecto de 2048 y un layout canónico `spread`. El rol del checkpoint es `shallow`, es decir, un experto de baja profundidad.

El checkpoint se distribuye como "untrained": no consta que se haya realizado un reentrenamiento o ajuste fino tras el recorte de capas, por lo que los pesos del experto reducido no han sido recalibrados para la nueva profundidad. La model card propone usarlo como punto de partida para destilación (`distill_student.py`) y para construcción de estudiantes aún más pequeños (`build_student.py`, por ejemplo de 8L a 4L con `--group 2 --keep alternate --ffn fuse`). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural, en el marco del benchmark LIBERO.
- Evaluación en tareas de manipulación con distintos horizontes de ejecución (la model card menciona evaluación con K=10 y K=1).
- Medición de latencia de inferencia mediante el script `latency.py`.
- Servir como estudiante o base para destilación y compresión adicional (por ejemplo, reducción de 8L a 4L).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión general o audio: no disponible; la visión se limita al uso como entrada de política robótica.

## Casos de uso

- Investigación en compresión de modelos VLA: el checkpoint permite medir el impacto de reducir la profundidad del experto de acciones sobre la tasa de éxito en LIBERO, comparando con el docente completo.
- Destilación de estudiantes: mediante `distill_student.py` se puede reentrenar el experto recortado para recuperar parte del rendimiento perdido por el recorte de capas.
- Construcción de variantes aún más ligeras: `build_student.py` permite generar estudiantes de 4L a partir de este checkpoint de 8L, útil para estudiar curvas de compromiso entre tamaño y rendimiento.
- Análisis de latencia en robótica: el script `latency.py` permite cuantificar la reducción de latencia de inferencia frente al docente, relevante para despliegues con requisitos de tiempo real.
- Reproducibilidad de experimentos: al estar vinculado a un commit concreto del docente, sirve como referencia reproducible en estudios comparativos de arquitecturas VLA.
- Base para ablaciones de layout y profundidad: junto con otras variantes de la familia BriskVLA, permite aislar el efecto del layout (`spread`) y del número de capas en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe los comandos para ejecutar la evaluación en LIBERO (K=10 y K=1) y para medir latencia, sin incluir cifras de tasa de éxito ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 400,9 M de parámetros, en precisión de 16 bits los pesos ocuparían aproximadamente 0,8 GB, a lo que habría que sumar el backbone de visión-lenguaje y las activaciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del checkpoint es plausible en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: la librería indicada es `lerobot`; los scripts de evaluación y latencia se ejecutan con `uv run python`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo proporciona el comando para medirlos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_spread_untrained | 400.923.616 | no disponible | no disponible (sin benchmarks publicados) | no disponible | Hugging Face |
| lerobot/smolvla_libero (docente) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras variantes BriskVLA (roles y profundidades alternativos) | no disponible | no disponible | no disponible | no disponible | Hugging Face (familia briskVLA) |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El checkpoint es "untrained": los pesos del experto recortado no han sido reentrenados tras la reducción de capas, por lo que su rendimiento no puede asumirse equivalente al del docente.
- No se han publicado benchmarks ni tasas de éxito en LIBERO, de modo que su calidad real es desconocida.
- La licencia no está disponible, lo que impide determinar si se permite el uso comercial.
- No se especifican los idiomas soportados ni la longitud de contexto.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al tratarse de una política robótica, el riesgo relevante es de ejecución incorrecta de acciones más que de generación de texto.
- Uso previsto de investigación: la model card lo orienta a destilación, compresión y medición de latencia, no a despliegue en producción.
- Dependencia de la librería `lerobot` y de scripts específicos del proyecto BriskVLA para su evaluación y uso.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/shallow_8L_spread_untrained
- Modelo docente: https://huggingface.co/lerobot/smolvla_libero
- Repositorio de LeRobot: no disponible en la información proporcionada
- Paper de SmolVLA: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
