# fecasado/gfm-cubes-22dR5

## Resumen
GFM-cubes-22dR5 es una política robótica (policy) entrenada con LeRobot y publicada en Hugging Face por el usuario fecasado. No se trata de un modelo de lenguaje, sino de un modelo de control visuomotor destinado a manipulación robótica, concretamente a tareas de recogida de cubos y depósito en cestas, según se desprende del identificador del dataset asociado (Ncubes-to-Nbaskets-320x240). El modelo emplea una técnica denominada "gaze flow matching" (gfm) para generar acciones, y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo cuenta con 75.248.330 parámetros (aproximadamente 75 millones) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la gama de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. Está etiquetado con el pipeline de robótica y la librería lerobot, lo que implica que se integra en el ecosistema de entrenamiento y evaluación de LeRobot de Hugging Face.

Su relevancia es limitada fuera del ámbito específico de la robótica de manipulación: se trata de un checkpoint concreto para una tarea y un dataset determinados, sin documentación ampliada ni benchmarks publicados. Resulta útil como ejemplo de política entrenada con flow matching aplicada a un caso de pick-and-place, pero no debe confundirse con un modelo fundacional de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gaze flow matching (política visuomotora; detalles internos no disponibles) |
| Parámetros totales | 75.248.330 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica como modelo de lenguaje; entrada visual y de estado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas documentadas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La información disponible indica únicamente que se trata de una política de tipo "gaze flow matching" entrenada y subida al Hub mediante LeRobot. No se detalla la arquitectura interna (tipo de backbone visual, encoder de estado, cabeza de acción, número de capas o dimensión de los embeddings), ni el número de tokens o episodios de entrenamiento, ni si se aplicaron técnicas de regularización, aumento de datos o ajuste fino posterior.

El dataset asociado es fecasado/Ncubes-to-Nbaskets-320x240, lo que sugiere observaciones visuales a resolución 320x240 en una tarea de manipulación de cubos hacia cestas. La model card es una plantilla sin cumplimentar ("Model type not recognized — please update this template"), por lo que no hay información sobre composición del dataset, número de demostraciones, frecuencia de control ni procedimiento de evaluación. La innovación declarada es el uso de flow matching condicionado por la mirada (gaze), pero no se aportan detalles técnicos sobre cómo se implementa.

## Capacidades
- Control visuomotor para manipulación robótica: genera acciones a partir de observaciones visuales y del estado del robot.
- Ejecución de tareas de pick-and-place: el nombre del dataset sugiere recogida de cubos y depósito en cestas.
- Integración con LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Inferencia sobre robot SO-100 follower (según el ejemplo de la model card).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documenta modo thinking, audio ni otras modalidades.

## Casos de uso
- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la política entrenada para recoger cubos y depositarlos en cestas, usando el dataset Ncubes-to-Nbaskets-320x240 como referencia de entrenamiento y evaluación.
- Prototipado de políticas visuomotoras con LeRobot: sirve como checkpoint de partida para comparar variantes de flow matching frente a otras políticas (ACT, Diffusion Policy) en la misma tarea.
- Evaluación reproducible en robot SO-100: la model card proporciona el comando `lerobot-record` con `--robot.type=so100_follower`, lo que permite replicar la evaluación en 10 episodios.
- Docencia e investigación en imitation learning: al ser un modelo pequeño (75M parámetros) y con licencia permisiva, es adecuado para experimentos académicos sobre flow matching aplicado a robótica.
- Base para fine-tuning en tareas similares: puede ajustarse con nuevos datasets de manipulación de objetos pequeños usando el pipeline de LeRobot.
- Despliegue en entornos de bajo coste: sus 0,3 GB de pesos permiten cargarlo en GPUs de consumo para inferencia en tiempo real, siempre que la latencia del lazo de control lo permita.
- Referencia para comparativas de políticas: útil como línea base en estudios que evalúen la eficacia de la condicionalización por mirada (gaze) en tareas de manipulación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 75,2M de parámetros en fp32 los pesos ocupan aproximadamente 0,3 GB, por lo que la VRAM necesaria es baja (del orden de 1-2 GB incluyendo activaciones y buffers visuales, estimación orientativa).
- GPU recomendadas: no disponible en la documentación; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para la inferencia de la política.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de ejecución en CUDA según el ejemplo de entrenamiento (`--policy.device=cuda`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-cubes-22dR5 | 75,2M | no aplica | Manipulación (cubos a cestas) | Apache 2.0 | Hugging Face |
| Políticas ACT en LeRobot | no disponible | no aplica | Imitation learning genérico | según checkpoint | Hugging Face |
| Diffusion Policy | no disponible | no aplica | Imitation learning genérico | según checkpoint | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- Model card incompleta: la plantilla no se ha cumplimentado, por lo que faltan detalles de arquitectura, entrenamiento y evaluación.
- Especialización estrecha: el modelo está entrenado para una tarea y un dataset concretos (cubos a cestas a 320x240); no se espera generalización a otras tareas sin fine-tuning.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito, robustez ni generalización.
- Riesgo de sobreajuste al entorno de entrenamiento: variaciones de iluminación, posición de cámara u objetos pueden degradar el rendimiento.
- Sin información sobre sesgos: no aplica en el sentido lingüístico, pero puede heredar sesgos del dataset de demostraciones (posiciones, colores, configuraciones).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin datos de idioma ni capacidades de texto: no debe emplearse como modelo de lenguaje.
- Advertencia de producción: al no haber validación externa, no se recomienda su despliegue en entornos críticos sin una evaluación propia exhaustiva.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22dR5
- Dataset asociado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
