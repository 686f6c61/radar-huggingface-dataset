# learner1119/posco_pi05_260820_left_c50

## Resumen

El modelo `learner1119/posco_pi05_260820_left_c50` es una política de control robótico basada en el enfoque PI05 (flow-matching VLA) entrenada con la librería LeRobot 0.4.3 sobre el conjunto de datos de pick-and-place del brazo izquierdo de POSCO. El autor, learner1119 (Doyoung Kim), publica este modelo como un ejemplo de clonación de comportamiento para robótica, con observaciones visuales de una cámara y el estado del robot, y predicción de acciones en tramos de 50 pasos a 20 Hz.

Se trata de un modelo de 3,6 mil millones de parámetros en formato safetensors, orientado a la manipulación de un brazo robótico de siete articulaciones más una pinza. Su relevancia radica en que es una implementación práctica de un VLA (Vision-Language-Action) de flujo-matching aplicado a robótica, con un tokenizer PaliGemma integrado en el propio repositorio, lo que evita depender de repositorios con acceso restringido. Aunque no se publican métricas de validación, el modelo sirve como base para investigar y desplegar políticas de control en entornos industriales.

El contexto de desarrollo se enmarca en la colaboración entre POSCO DX y NC AI para avanzar en inteligencia física para robótica industrial, aunque no hay evidencia directa de que este modelo forme parte de esa colaboración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PI05 (flow-matching VLA) |
| Parámetros totales | 3.616.757.520 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (imágenes de 480x640 + estado) |
| Tipos de cuantizacion | no disponible (safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo robótico, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PI05 de LeRobot, que combina un modelo de visión-lenguaje (VLM) con un mecanismo de flow-matching para generar acciones de control. La entrada consiste en una imagen de la cámara `agentview` (resolución 480x640) y el estado del robot (8 dimensiones: 7 articulaciones del brazo izquierdo y la pinza). La salida es un tramo de 50 acciones (chunk size 50) a una frecuencia de control de 20 Hz, lo que cubre 2,5 segundos de ejecución. El tokenizer de PaliGemma se incluye en el repositorio para evitar dependencias externas.

El entrenamiento se realizó con 50.000 pasos, batch de 32 y una tasa de aprendizaje de 2,5e-05 sobre un dataset de 100 episodios y 44.136 frames. Durante el preprocesado se eliminaron las dimensiones del brazo derecho porque en las grabaciones eran constantes (desviación típica cero), por lo que bajo normalización solo aportaban ruido de sensor. No se utilizó RLHF ni DPO; el aprendizaje es puramente clonación de comportamiento (behavioral cloning) con un objetivo de flujo.

## Capacidades

- Control robótico de brazo izquierdo para tareas de pick-and-place.
- Predicción de acciones de 50 pasos (chunk) a 20 Hz, con normalización y desnormalización a través de procesadores `pre` y `post`.
- Observación multimodal: imagen de cámara + estado de articulaciones.
- Soporte de integración con LeRobot para inferencia en tiempo real (carga de política con `PI05Policy.from_pretrained`).
- Tokenizer PaliGemma incorporado, lo que permite ejecutar sin acceso a repositorios externos con gating.
- No incluye capacidades de lenguaje natural, tool calling, agentes ni multilingüismo.

## Casos de uso

- **Pick-and-place industrial**: el modelo puede controlar un brazo robótico para recoger y colocar objetos en una línea de montaje, aprovechando su predicción de acciones de 2,5 segundos para movimientos fluidos.
- **Investigación en clonación de comportamiento**: sirve como base para estudiar técnicas de VLA con flow matching y comparar variantes de arquitectura o preprocesado.
- **Integración en entornos LeRobot**: se puede usar directamente con el framework LeRobot para desarrollo de prototipos, gracias a la API estándar de políticas.
- **Evaluación de controladores en simulación**: dado que el modelo predice acciones en el espacio real, puede ser ejecutado en simuladores robóticos para testear robustez antes del despliegue físico.
- **Formación de robots en tareas de precisión**: el modelo está entrenado con datos de alta frecuencia (20 Hz) y observaciones de cámara, lo que permite su uso en tareas que requieren realimentación visual.
- **Investigación sobre reducción de dimensiones de acción**: el modelo demuestra cómo eliminar dimensiones constantes (brazo derecho) puede simplificar el aprendizaje sin pérdida de funcionalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el entrenamiento se realizó sin un split de validación, por lo que no hay una métrica honesta de generalización. El valor de pérdida de entrenamiento se considera como indicador de ajuste, no de capacidad real.

## Requisitos de hardware

- **VRAM estimada**: con 3,6 mil millones de parámetros, el modelo en precisión fp16 ocuparía aproximadamente 7,2 GB de memoria. El tamaño del repositorio (7,5 GB) sugiere pesos en fp16 o bf16. Para inferencia con un chunk de 50 acciones, se recomienda al menos 12 GB de VRAM para mantener la latencia baja.
- **GPU recomendadas**: una NVIDIA RTX 3080/4080 con 12-16 GB sería suficiente; GPUs de centro de datos como A100 o H100 ofrecen mayor margen para batch de inferencia.
- **Despliegue**: se puede usar directamente con LeRobot en Python, o exportar a formato GGUF para ejecución en llama.cpp u Ollama, aunque no hay cuantizaciones publicadas.
- **Latencia**: no se dispone de datos de latencia oficiales; la frecuencia de control de 20 Hz (50 ms por paso) sugiere que la inferencia debe completarse en menos de 50 ms para un uso en tiempo real, lo cual es factible en GPUs modernas con el modelo en fp16.

## Comparativa con modelos similares

No disponible. No hay información pública sobre modelos comparables en el mismo nicho (VLA de pick-and-place con flow matching y 3,6B parámetros) en la información proporcionada. Se recomienda consultar el ecosistema LeRobot para alternativas.

## Limitaciones y advertencias

- **Sin validación honesta**: el modelo fue entrenado con todos los episodios disponibles sin dejar un conjunto de prueba, por lo que no hay una evaluación fuera de distribución. No es recomendable usarlo en producción sin validación adicional.
- **Sesgo de datos**: el dataset proviene de una sola configuración de robot (brazo izquierdo de POSCO), por lo que el modelo no generaliza a otros brazos o configuraciones de cámara.
- **Riesgo de alucinación**: al ser un modelo de acción, puede generar movimientos erráticos si las observaciones difieren del dominio de entrenamiento (por ejemplo, iluminación o ángulo de cámara distinto).
- **Limitaciones de contexto**: solo acepta una cámara y el estado del brazo izquierdo; no soporta entradas de lenguaje natural ni múltiples cámaras.
- **Restricciones de licencia**: la licencia no está especificada, lo que impide conocer si hay limitaciones para uso comercial. Se debe contactar al autor para aclaraciones.
- **Dimensiones eliminadas**: las articulaciones del brazo derecho se descartaron; si se usa el modelo en un robot con ambos brazos, la política no podrá controlar el derecho.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/learner1119/posco_pi05_260820_left_c50)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Noticia de colaboración POSCO DX y NC AI (POSCO Newsroom)](https://newsroom.posco.com/en/posco-dx-nc-ai-physical-ai-based-launch-of-joint-development-of-industrial-robot-foundation-model/)
- [Artículo de Robot Today](https://robottoday.com/industry-briefing/nc-ai-posco-dx-join-hands-in-robot-ai-model-development/4840)
