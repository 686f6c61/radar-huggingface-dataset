# GeertWang/starvla-pipette-aim-wrist1031-qwenoft-scratch-pj

## Resumen

starvla-pipette-aim-wrist1031-qwenoft-scratch-pj es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario GeertWang y publicado en HuggingFace bajo la librería `starvla`. El modelo resuelve una tarea concreta de manipulación: el paso 3 de una tarea con pipeta sobre un robot Unitree G1 equipado con manos Inspire, consistente en apuntar con la pipeta de la mano derecha hacia el tubo que sostiene la mano izquierda. Se trata de un modelo de clonación de comportamiento (behavior cloning) entrenado sin refuerzo por aprendizaje supervisado a partir de demostraciones.

El modelo parte de Qwen3-VL-4B-Instruct preentrenado y le añade una cabeza OFT (optimized fine-tuning head) entrenada desde cero. El entrenamiento se realizó sobre el conjunto de datos `data_1031_pj` (una variante de `data_1031` con ponderación de los frames de intervención humana por joystick), con vistas ego, FOCUS y muñeca izquierda, y usando la velocidad medida de la muñeca como estado. Es relevante como ejemplo de adaptación de un VLM grande a control robótico de precisión con pocos datos y sin RL.

El checkpoint publicado corresponde al paso 8970, el último guardado tras 10 épocas con batch 128 y learning rate 2.5e-5 con decaimiento coseno hasta 1e-6. El autor indica explícitamente que el modelo no fue ejecutado sobre un robot en el momento de la subida. El repositorio ocupa 9,1 GB y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en Qwen3-VL-4B-Instruct con cabeza OFT añadida |
| Parametros totales | no disponible (modelo base de 4B; el total con la cabeza OFT no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`steps_8970_pytorch_model.pt`) |

## Arquitectura y entrenamiento

La arquitectura combina un VLM preentrenado, Qwen3-VL-4B-Instruct, con una cabeza OFT inicializada desde cero. Todas las vistas de entrada (ego, FOCUS y muñeca izquierda) y el estado de velocidad de la muñeca se procesan conjuntamente para producir las acciones de control. Todos los parámetros del modelo son entrenables, sin congelar el backbone.

El entrenamiento es de clonación de comportamiento pura, sin RL, durante 10 épocas con batch 128 y learning rate 2.5e-5 con decaimiento coseno hasta 1e-6. El conjunto de datos `data_1031_pj` deriva de `data_1031` y aplica ponderación a los frames de intervención humana: los frames de takeover por joystick tienen peso 1, los frames humanos PICO peso 2 y los automáticos peso 1. Los datos se grabaron con recorte de muñeca y cada episodio se corta antes de su pull-out, lo que restringe la tarea al paso de apuntado. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de precisión para la tarea de apuntar una pipeta hacia un tubo con el robot Unitree G1 y manos Inspire.
- Procesamiento multimodal de tres vistas: ego, FOCUS y muñeca izquierda.
- Integración de estado propioceptivo mediante la velocidad medida de la muñeca.
- Clonación de comportamiento a partir de demostraciones humanas con intervención por joystick.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modo de pensamiento explícito más allá de las del VLM base.
- No se documentan capacidades de visión general, audio ni generación de texto libre en la model card.

## Casos de uso

- Automatización de laboratorio con pipetas: el modelo puede ejecutar el paso de apuntado de una pipeta hacia un tubo en un robot Unitree G1, reduciendo la intervención manual en protocolos repetitivos de laboratorio.
- Investigación en clonación de comportamiento: sirve como referencia para estudiar cómo adaptar un VLM de 4B a control de precisión con datos de intervención humana ponderada.
- Recolección de datos con HG-DAgger: el esquema de ponderación de frames de takeover por joystick es directamente reutilizable en pipelines de aprendizaje por intervención humana.
- Evaluación de políticas VLA en tareas de contacto: la tarea de apuntado con pipeta exige precisión submilimétrica y permite medir el comportamiento del modelo en escenarios de contacto cercano.
- Base para fine-tuning en tareas de manipulación bimanual: al partir de Qwen3-VL-4B-Instruct, el modelo puede adaptarse a otras tareas que requieran coordinación entre manos Inspire.
- Estudio de robustez ante vistas limitadas: la combinación de vistas ego, FOCUS y muñeca permite analizar qué información visual es crítica para el apuntado.
- Prototipado en simulación o banco de pruebas: aunque el autor no lo ejecutó en robot, el checkpoint puede cargarse en entornos de evaluación controlados antes de desplegarlo físicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 9,1 GB, lo que sugiere pesos en precisión completa o mixta; una estimación conservadora para un modelo de 4B en fp16 rondaría los 8-10 GB, pero no se confirma en la model card.
- GPU recomendadas: no disponible. Por tamaño del backbone (4B), cabría esperar GPUs con al menos 16-24 GB de VRAM para fp16, pero no se documenta.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de 4B en fp16 podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), pero la cabeza OFT y las vistas adicionales aumentan los requisitos; no hay datos oficiales.
- Opciones de despliegue: la librería indicada es `starvla`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información recibida, y la tarea (apuntado de pipeta en Unitree G1) es lo suficientemente específica como para que no existan alternativas públicas directamente comparables documentadas.

## Limitaciones y advertencias

- El modelo no fue ejecutado sobre un robot en el momento de la subida, según indica el autor; su comportamiento físico real es desconocido.
- La tarea está restringida al paso 3 (apuntado) de una secuencia con pipeta; no cubre el pull-out ni pasos anteriores o posteriores.
- Entrenado únicamente sobre el conjunto `data_1031_pj`, lo que limita su generalización a otras configuraciones, objetos o entornos.
- Sin RL ni validación en robot, el riesgo de fallos por acumulación de error en clonación de comportamiento es alto.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles: no se documenta comportamiento multilingüe del VLM base en este contexto.
- Riesgo de alucinación y sesgos del VLM base no evaluados en el contexto robótico.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa por parte de la comunidad.
- Sin benchmarks publicados, no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-qwenoft-scratch-pj
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
