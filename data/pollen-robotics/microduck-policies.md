# pollen-robotics/microduck-policies

## Resumen

`microduck-policies` es un repositorio de políticas de control para el robot cuadrúpedo Microduck, publicado por Pollen Robotics en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: el pipeline declarado es `robotics` y los artefactos distribuidos son ficheros ONNX que encapsulan políticas de control motriz entrenadas para su ejecución en el robot físico o en simulación. La librería asociada es `microduck`, un paquete específico del fabricante para cargar y ejecutar estas políticas.

El repositorio acumula 66.691 descargas y 56 likes, lo que indica una adopción notable dentro de la comunidad de robótica de bajo coste, probablemente impulsada por la popularidad de la plataforma Microduck como robot educativo y de investigación asequible. La fecha de creación (31 de agosto de 2026) y la última actualización (12 de noviembre de 2026) sugieren un proyecto en mantenimiento activo, con iteraciones periódicas sobre las políticas publicadas.

La información disponible en la model card es extremadamente escasa: solo declara la licencia, la librería y el pipeline tag, sin detallar arquitectura de red, observaciones, acciones, datos de entrenamiento ni métricas de rendimiento. El tamaño del repositorio es de 0.0 GB según los metadatos de Hugging Face, lo que puede deberse a un redondeo de ficheros pequeños (políticas ligeras en ONNX) o a que los pesos se distribuyen por otro canal. Cualquier dato técnico no listado a continuación debe considerarse no disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (políticas de control exportadas a ONNX; la topología de red no se especifica en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de las políticas. Por el pipeline declarado (`robotics`), el formato de pesos (ONNX) y la librería `microduck`, se trata de políticas de control entrenadas probablemente mediante aprendizaje por refuerzo o imitación en simulación y exportadas a ONNX para inferencia determinista de baja latencia en el bucle de control del robot. No se especifica si son redes MLP, CNN, recurrentes o transformers ligeros, ni el número de capas, dimensión de las observaciones o de las acciones.

Tampoco se documentan los datos de entrenamiento: no hay información sobre el simulador utilizado, el número de pasos de entrenamiento, la composición del dataset de demostraciones, ni si se aplicaron técnicas de domain randomization, RLHF, DPO u otras. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal, que en cualquier caso no serían aplicables a un modelo de este tipo.

## Capacidades

- Generación de comandos de control motriz para el robot cuadrúpedo Microduck a partir de observaciones del entorno (la naturaleza exacta de las observaciones no se detalla).
- Ejecución de políticas preentrenadas mediante la librería `microduck` y runtime ONNX.
- Despliegue en el robot físico o en simulación, según la integración que permita la librería del fabricante.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.
- No se documentan capacidades multilingües (no aplica a un modelo de control).

## Casos de uso

- Locomoción básica del Microduck: cargar una de las políticas del repositorio con la librería `microduck` para que el robot camine o se desplace de forma autónoma en entornos controlados, aprovechando que los pesos ya están exportados a ONNX listos para inferencia.
- Docencia y talleres de robótica: usar las políticas como punto de partida en cursos donde los estudiantes comparan comportamientos preentrenados antes de entrenar sus propias políticas, gracias a la licencia Apache 2.0 y al bajo coste del hardware.
- Investigación en aprendizaje por refuerzo: emplear las políticas como baseline de referencia frente a políticas entrenadas por el investigador, evaluando diferencias de comportamiento en el mismo robot y condiciones.
- Prototipado rápido de aplicaciones robóticas: integrar la inferencia ONNX en un pipeline propio (Python, C++) para validar la viabilidad de una tarea antes de invertir en entrenamiento desde cero.
- Demostraciones y ferias: desplegar comportamientos pregrabados y reproducibles en el robot para exhibiciones públicas, donde la determinismo de una política ONNX facilita la repetibilidad.
- Benchmarking de hardware: medir latencia de inferencia y consumo en la CPU/GPU del robot o de un host externo usando estas políticas como carga de trabajo representativa, dado que el formato ONNX permite ejecución en múltiples backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de políticas en ONNX y con un repositorio de 0.0 GB, es probable que quepan en CPU sin GPU dedicada, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tipo de carga (control robótico de baja latencia) es plausible la ejecución en CPU, pero no se especifica.
- Opciones de despliegue: runtime ONNX (ONNX Runtime u otro) a través de la librería `microduck`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| pollen-robotics/microduck-policies | Políticas de control para Microduck | ONNX | Apache 2.0 | no aplica | no disponible | Hugging Face |
| Políticas de otros robots cuadrúpedos de bajo coste | Políticas de control | variable | variable | no aplica | no disponible | no disponible en la información proporcionada |
| Alternativas genéricas de RL para robótica | Políticas de control | variable | variable | no aplica | no disponible | no disponible en la información proporcionada |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos, pero al ser un modelo de control entrenado en condiciones posiblemente limitadas, su comportamiento fuera de la distribución de entrenamiento puede ser impredecible.
- No hay información sobre robustez ante perturbaciones, cambios de terreno o fallos de sensores; el uso en producción sin validación previa conlleva riesgo físico para el robot y su entorno.
- No se especifican las observaciones ni las acciones esperadas, por lo que la integración requiere consultar la documentación de la librería `microduck` y del hardware.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan patentes ni restricciones adicionales del fabricante.
- El repositorio figura con tamaño 0.0 GB, lo que puede indicar ficheros muy pequeños o una distribución incompleta de los pesos; conviene verificar la integridad de los artefactos antes de desplegar.
- No se dispone de información sobre idiomas ni sobre capacidades de lenguaje, por lo que no debe tratarse como un modelo de propósito general.

## Enlaces

- Hugging Face: https://huggingface.co/pollen-robotics/microduck-policies
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
