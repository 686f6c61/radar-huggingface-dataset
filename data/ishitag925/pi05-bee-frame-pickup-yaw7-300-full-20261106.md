# ishitag925/pi05-bee-frame-pickup-yaw7-300-full-20261106

## Resumen

El modelo `ishitag925/pi05-bee-frame-pickup-yaw7-300-full-20261106` es un ajuste fino (fine-tuning) del modelo Vision-Language-Action (VLA) π₀.₅ (Pi05) de Physical Intelligence, publicado por el usuario ishitag925 en Hugging Face. Está entrenado para una tarea robótica muy concreta: la recogida de un marco de abeja (bee-frame) con una orientación de yaw de 7 grados, sobre el robot Piper-X. El modelo se ha entrenado con la implementación oficial OpenPI de Physical Intelligence y se distribuye como un checkpoint de política completo, junto con los activos de normalización necesarios para su ejecución.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general, sino de un artefacto de investigación reproducido para un experimento de manipulación robótica concreto. El repositorio publica checkpoints cada 500 actualizaciones del optimizador bajo `checkpoints/STEP/`, con etiquetas `step-STEP` coincidentes, lo que permite seguir la evolución del entrenamiento. El autor advierte explícitamente que no existe un split de evaluación reservado (held-out) y que la pérdida de entrenamiento no permite establecer el éxito de la política en el mundo real.

Al tratarse de un ajuste fino de π₀.₅, hereda la arquitectura y las capacidades del modelo base: un VLA con generalización en entornos abiertos, orientado a la conversión de instrucciones en lenguaje natural e imágenes en acciones motoras. El repositorio no aporta información sobre parámetros totales, contexto, licencia ni idiomas, por lo que buena parte de la ficha se completará con "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence; detalles de arquitectura interna no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints de política OpenPI (parámetros completos y activos de normalización); formatos concretos no disponibles |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del VLA π₀.₅ (Pi05) desarrollado por Physical Intelligence, entrenado mediante la implementación oficial OpenPI. La arquitectura subyacente es la de π₀.₅, un modelo Vision-Language-Action diseñado para la generalización en entornos abiertos, que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. El autor no detalla en la model card la composición interna del modelo base (número de parámetros, mecanismo de atención, contexto máximo), por lo que esos datos quedan como no disponibles.

El entrenamiento se ha realizado sobre el dataset `ishitag925/bee-frame-pickup-yaw7-300-center-right-wrist-lerobot`, con la receta exacta documentada en `run_config.json` y `project_config.py` del repositorio. Los checkpoints se publican cada 500 actualizaciones del optimizador bajo `checkpoints/STEP/`, con etiquetas `step-STEP` coincidentes. Cada checkpoint contiene los parámetros completos de la política y los activos de normalización; el estado del optimizador permanece en el entorno de entrenamiento (MIT) para permitir la reanudación. El autor indica explícitamente que no existe un split de evaluación reservado y que la pérdida de entrenamiento no establece el éxito de la política, lo que apunta a un experimento de ajuste fino orientado a la reproducibilidad más que a una validación rigurosa del rendimiento.

## Capacidades

- Control robótico de manipulación: generación de acciones motoras a partir de observaciones visuales e instrucciones, aplicado a la tarea de recogida de un marco de abeja con orientación de yaw de 7 grados.
- Percepción visual multimodal: integración de imágenes de cámara (incluyendo vista de muñeca, según el nombre del dataset) para guiar la política.
- Comprensión de instrucciones en lenguaje natural: heredada del modelo base π₀.₅, orientada a la conversión de indicaciones en secuencias de acción.
- Generalización en entornos abiertos: capacidad declarada del modelo base π₀.₅, aunque no validada específicamente para este ajuste fino.
- Ejecución sobre robot Piper-X: el ajuste está orientado a esta plataforma concreta.
- Publicación de checkpoints intermedios: permite evaluar la evolución de la política a lo largo del entrenamiento (cada 500 pasos).
- No se dispone de información sobre tool calling, soporte de agentes, capacidades multilingües, modo de razonamiento extendido, visión general, audio ni otras capacidades especiales en la información proporcionada.

## Casos de uso

- Recogida automatizada de marcos de abeja en apicultura robotizada: la política está entrenada específicamente para recoger un bee-frame con una orientación de yaw de 7 grados sobre el robot Piper-X, por lo que su uso principal es la ejecución de esta tarea de manipulación en un entorno controlado.
- Investigación en ajuste fino de VLA: el repositorio publica la receta completa (`run_config.json`, `project_config.py`) y checkpoints intermedios, lo que permite reproducir el experimento y estudiar la evolución del entrenamiento paso a paso.
- Evaluación comparativa de checkpoints: al publicarse un checkpoint cada 500 actualizaciones, se puede comparar el comportamiento de políticas en distintas fases del entrenamiento para analizar la convergencia.
- Desarrollo de pipelines de robótica con OpenPI: el modelo sirve como ejemplo de integración de un ajuste fino con la implementación oficial OpenPI de Physical Intelligence, útil para equipos que quieran adaptar π₀.₅ a sus propias tareas.
- Reanudación de entrenamientos: dado que el estado del optimizador permanece en el entorno de entrenamiento, el checkpoint puede emplearse como punto de partida para continuar el ajuste fino con nuevos datos o configuraciones.
- Prototipado de manipulación con Piper-X: equipos que trabajen con esta plataforma robótica pueden usar el modelo como base para tareas de recogida y orientación de objetos similares.
- Docencia y demostraciones de VLA: por su carácter acotado y su documentación de receta, puede emplearse en entornos formativos para ilustrar el flujo completo de ajuste fino de un modelo Vision-Language-Action.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existe un split de evaluación reservado y que la pérdida de entrenamiento no establece el éxito de la política, por lo que no hay métricas de éxito, MMLU, HumanEval, GSM8K ni equivalentes para esta tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros totales ni cuantizaciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es `openpi`, por lo que el despliegue se realiza a través de la implementación oficial OpenPI de Physical Intelligence; no se indican soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ishitag925/pi05-bee-frame-pickup-yaw7-300-full-20261106 | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face (0 descargas) |
| AHegai/pi05_pickup_white_box | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| ishitag925/piperx-grasp-sim-50-samples | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Los modelos comparables encontrados son otros ajustes finos de π₀.₅ o datasets/artefactos relacionados con Piper-X, todos ellos sin datos públicos de parámetros, contexto o rendimiento en la información disponible. La comparación cuantitativa no es posible con los datos proporcionados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un ajuste fino para una tarea robótica concreta, los sesgos relevantes serían los del dataset de entrenamiento, que no se documentan.
- Riesgo de alucinación: no evaluado; el autor advierte que la pérdida de entrenamiento no establece el éxito de la política, por lo que no hay garantía de comportamiento correcto en el mundo real.
- Limitaciones de contexto o idioma: no disponibles; no se documentan la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Ausencia de evaluación held-out: no existe un split de evaluación reservado, por lo que no hay métricas de éxito de la política.
- Especificidad de la tarea: el modelo está entrenado para una tarea y una orientación concretas (bee-frame pickup, yaw 7) sobre Piper-X; su uso fuera de ese escenario no está validado.
- Estado del optimizador no incluido: los checkpoints contienen parámetros y activos de normalización, pero el estado del optimizador permanece en el entorno de entrenamiento, lo que limita la reanudación fuera de ese entorno.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishitag925/pi05-bee-frame-pickup-yaw7-300-full-20261106
- Dataset de entrenamiento: https://huggingface.co/datasets/ishitag925/bee-frame-pickup-yaw7-300-center-right-wrist-lerobot
- Modelo comparable AHegai/pi05_pickup_white_box: https://huggingface.co/AHegai/pi05_pickup_white_box
- Repositorio relacionado ishitag925/piperx-grasp-sim-50-samples: https://huggingface.co/ishitag925/piperx-grasp-sim-50-samples
- Implementación oficial OpenPI de Physical Intelligence: no disponible en la información proporcionada (referenciada por el autor como repositorio OpenPI)
- Papers, blogs y demos: no disponibles en la información proporcionada
