# maxmeyer/smolvla-three-tool-306-step036000

## Resumen

SmolVLA three-tool es una política robótica de tipo vision-language-action (VLA) obtenida por ajuste fino de `lerobot/smolvla_base`, el modelo base de SmolVLA publicado por Hugging Face dentro del ecosistema LeRobot. El autor del ajuste es el usuario `maxmeyer` y el resultado es un checkpoint intermedio (paso 36 000 de 60 000 planificados) de la ejecución de entrenamiento `smolvla_bce_e2e3_306_vis_2`. El modelo resuelve una tarea muy concreta: controlar un brazo SO-101 para trasladar tres herramientas (alicates, martillo y destornillador) desde una zona verde a una zona roja.

La relevancia es acotada pero clara para quien trabaja en manipulación robótica de bajo coste: demuestra el flujo completo de ajuste fino de SmolVLA sobre un dataset pequeño (306 episodios teleoperados) y aporta un checkpoint que funcionó en un demostrador de feria, lo que constituye una referencia práctica de despliegue real. No es un modelo de propósito general ni un LLM: su salida son acciones de 6 articulaciones a 30 Hz, no texto.

Con 450 millones de parámetros y un repositorio de 0,9 GB, el modelo es ligero y está pensado para inferencia en el bucle de control de un robot, no para servidores de gran escala. La licencia Apache 2.0 facilita su reutilización comercial, aunque la utilidad práctica queda limitada al entorno físico y a la morfología concretos con los que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), ajuste fino de `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de texto; ventana de observación multimodal con 2 cámaras 640×480 y estado de 6 articulaciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se expresan en inglés en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de SmolVLA, una política VLA que combina un codificador visual y de lenguaje con un cabezal de acciones, integrada en la librería LeRobot. La entrada consta de `observation.state` (6 articulaciones), `observation.images.camera1` (cámara de sala, 640×480) y `observation.images.camera2` (cámara de muñeca, 640×480); la salida es `action` (6 articulaciones) con un chunk de 50 acciones a 30 Hz. No se detalla en la información disponible la composición interna del transformer ni el número de tokens de entrenamiento.

El entrenamiento se realizó sobre el dataset `JanPhilipp/three_tool_BCE_E2E3_merged_306`, compuesto por 306 episodios teleoperados, con batch de 64, learning rate 5e-5 con decaimiento coseno y un plan de 60 000 pasos; este checkpoint corresponde al paso 36 000. No se especifica en la model card si hubo RLHF, DPO ni otras fases de alineación, ni innovaciones técnicas adicionales más allá del propio pipeline de SmolVLA.

## Capacidades

- Control robótico de un brazo SO-101 mediante predicción de acciones de 6 articulaciones.
- Ejecución de tareas de manipulación guiadas por instrucción en lenguaje natural: "Move the pliers / the hammer / the screwdriver / all tools from the green area to the red area".
- Fusión de dos vistas de cámara (sala y muñeca) con el estado de las articulaciones para generar acciones.
- Generación de chunks de acción de 50 pasos a 30 Hz, adecuada para control continuo.
- Generalización limitada a las tres herramientas y a la disposición verde/roja del entorno de entrenamiento.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Demostración interactiva en feria o laboratorio: el checkpoint se usó en un demostrador con el prompt "Move all tools from the green area to the red area" para todas las escenas, lo que permite reproducir una demo funcional con un solo comando.
- Punto de partida para ajuste fino: al ser un checkpoint intermedio de una ejecución documentada, sirve como inicialización para experimentos con variaciones del dataset de 306 episodios o con nuevas herramientas.
- Investigación en manipulación de bajo coste: permite estudiar el comportamiento de SmolVLA en un brazo SO-101 con dos cámaras y 6 articulaciones sin partir del modelo base.
- Clasificación y traslado de objetos en entornos controlados: útil para tareas de pick-and-place con zonas de origen y destino delimitadas por color.
- Evaluación comparativa de checkpoints: al existir varios pasos de la misma ejecución, permite medir la evolución del rendimiento entre el paso 36 000 y el resto del entrenamiento.
- Pruebas de integración con LeRobot: el comando `lerobot-rollout` documentado facilita validar pipelines de despliegue y registro de rollouts en un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros y pesos en safetensors (repositorio de 0,9 GB), la inferencia en precisión nativa requiere del orden de 2 GB de memoria, aunque el dato no está confirmado en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño, es plausible en GPU de consumo, pero no se aporta evidencia.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=maxmeyer/smolvla-three-tool-306-step036000` y estrategia `base`, según el ejemplo de la model card.
- Latencia y throughput: no disponibles; la política genera chunks de 50 acciones a 30 Hz, pero no se documentan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| maxmeyer/smolvla-three-tool-306-step036000 | 450.046.176 | 2 cámaras 640×480 + estado de 6 articulaciones | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face |
| Otras políticas VLA de la familia SmolVLA | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en tres herramientas concretas y en un entorno con zonas verde y roja; fuera de esa configuración su comportamiento no está validado.
- Es un checkpoint intermedio (paso 36 000 de 60 000), por lo que no representa el estado final del entrenamiento.
- El dataset de entrenamiento es pequeño (306 episodios teleoperados), lo que limita la generalización a variaciones de iluminación, posiciones u objetos.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez; al tratarse de una política de control, el riesgo principal es la ejecución de acciones incorrectas sobre hardware físico.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías ni soporte por parte del autor.
- No se especifican requisitos de seguridad para el despliegue en un robot real; debe validarse en entorno controlado antes de cualquier uso con personas cerca.
- El prompt de tarea se documenta en inglés; no hay evidencia de soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxmeyer/smolvla-three-tool-306-step036000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/JanPhilipp/three_tool_BCE_E2E3_merged_306
- Librería LeRobot: https://github.com/huggingface/lerobot
