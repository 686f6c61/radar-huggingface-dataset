# saybeok03/folding_final_compat_224

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, orientado a la generalización en entornos abiertos para tareas de robótica. La implementación disponible en este repositorio, publicada por el usuario saybeok03, es un checkpoint entrenado con LeRobot y ajustado sobre el dataset `lerobot-data-collection/level2_final_quality3`, con un pipeline declarado de robótica. El modelo resuelve el problema de transferir instrucciones en lenguaje natural y observaciones visuales a acciones motoras concretas en un robot, y es relevante porque representa un paso más allá de π₀ en capacidad de generalización a situaciones no vistas durante el entrenamiento.

El checkpoint contiene 3.616.757.520 parámetros en formato safetensors y ocupa 7,5 GB en el repositorio. Está publicado bajo licencia Apache 2.0 y se integra en el ecosistema LeRobot de Hugging Face, lo que permite tanto el entrenamiento desde cero como la evaluación mediante las herramientas `lerobot-train` y `lerobot-record`. La model card original no aporta detalles sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks.

Al tratarse de una política robótica y no de un modelo de lenguaje, las métricas habituales (MMLU, HumanEval, GSM8K) no aplican; la evaluación se realiza mediante episodios de ejecución física en el robot. La información disponible es escasa y procede casi por completo de la model card del autor y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); detalles internos no disponibles |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | lerobot-data-collection/level2_final_quality3 |
| Tamano del repositorio | 7,5 GB |
| Descargas | 17 |
| Likes | 0 |

## Arquitectura y entrenamiento

La model card identifica el modelo como π₀.₅ (Pi05), un modelo Vision-Language-Action con generalización en entornos abiertos, desarrollado por Physical Intelligence. La implementación incluida en el repositorio es una adaptación de su repositorio OpenPI, integrada en LeRobot. No se especifican en la información disponible detalles sobre la arquitectura interna (tipo de transformer, mecanismo de atención, número de capas o dimensión de las representaciones), ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO.

El checkpoint ha sido entrenado y publicado mediante LeRobot sobre el dataset `lerobot-data-collection/level2_final_quality3`. La model card describe el flujo de entrenamiento con `lerobot-train` y la evaluación con `lerobot-record`, apuntando a un robot de tipo `so100_follower` en el ejemplo de inferencia. No se documentan innovaciones técnicas concretas más allá de la propia naturaleza VLA del modelo y su orientación a la generalización fuera de distribución.

## Capacidades

- Generación de acciones motoras a partir de instrucciones en lenguaje natural y observaciones visuales (política VLA).
- Generalización a entornos y situaciones no vistas durante el entrenamiento, según la descripción del autor original.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- Ejecución de tareas robóticas de manipulación mediante el pipeline `lerobot-record`.
- Soporte de tool calling, function calling o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible más allá de la componente visual implícita en un modelo VLA.

## Casos de uso

- Manipulación robótica de objetos en entornos controlados: el modelo recibe observaciones visuales e instrucciones y emite comandos motores; es adecuado para tareas de pick-and-place o plegado sobre el robot `so100_follower` empleado en el ejemplo de la model card.
- Evaluación de políticas VLA en laboratorio: mediante `lerobot-record` con `--policy.path` apuntando al checkpoint y un número definido de episodios, permite medir la tasa de éxito de la política en el robot físico.
- Reentrenamiento sobre nuevos datasets: el checkpoint sirve como punto de partida para ajustar la política a dominios concretos usando `lerobot-train` con el dataset propio del usuario.
- Investigación en generalización de políticas robóticas: al ser un modelo orientado a entornos abiertos, es útil para estudiar la transferencia a escenarios no vistos durante el entrenamiento.
- Prototipado de flujos de imitation learning: el repositorio incluye instrucciones para entrenar desde cero y evaluar, lo que facilita montar pipelines de aprendizaje por imitación.
- Integración en sistemas de robótica de investigación con LeRobot: al estar publicado en el Hub con la librería `lerobot`, se puede cargar directamente en flujos existentes que ya usen esa herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio (7,5 GB) y los 3.616.757.520 parámetros sugieren requisitos de memoria del orden de decenas de GB en precisión completa, aunque no se confirma.
- GPU recomendadas: no disponible; la model card solo indica `--policy.device=cuda` en el ejemplo de entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) según la documentación del autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| π₀.₅ (este checkpoint) | 3.616.757.520 | no disponible | Apache 2.0 | Hugging Face (LeRobot) | Ajustado sobre dataset propio |
| π₀ (original) | no disponible | no disponible | no disponible | OpenPI | Predecesor directo según la model card |
| Otros modelos VLA (p. ej. ACT en LeRobot) | no disponible | no disponible | no disponible | LeRobot | Alternativa de política en el mismo ecosistema |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La información técnica disponible es muy limitada: no hay datos sobre arquitectura interna, contexto, cuantización ni idiomas.
- No se han publicado benchmarks, por lo que no es posible evaluar su rendimiento de forma objetiva a partir del repositorio.
- Al ser una política robótica, su validez está ligada al robot y al dataset de entrenamiento (`level2_final_quality3`); el comportamiento fuera de ese dominio no está garantizado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras en el robot físico.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original de Physical Intelligence y del dataset utilizado.
- El repositorio tiene 17 descargas y 0 likes, lo que sugiere escasa validación por parte de la comunidad.
- No se documentan limitaciones de contexto o idioma por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/saybeok03/folding_final_compat_224
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible como enlace directo en la información proporcionada
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot-data-collection/level2_final_quality3
