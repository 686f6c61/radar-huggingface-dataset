# Haku-2004/act_k5_base_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El checkpoint `act_k5_base_10`, publicado por el usuario Haku-2004, es una política entrenada con la librería LeRobot de Hugging Face sobre el dataset propio `Haku-2004/k5_20261110_143202`, presumiblemente recogido mediante teleoperación.

El modelo emplea una arquitectura transformer con un codificador visual y un decodificador de acciones con mecanismo de chunking, e incorpora 51.668.614 parámetros almacenados en formato safetensors (0,2 GB de repositorio). Está pensado para ejecutarse sobre robots tipo SO-100/SO-101 mediante el stack LeRobot, y su relevancia radica en que ejemplifica el flujo completo de entrenamiento y despliegue de políticas de imitación en hardware de bajo coste.

Se trata de un modelo de nicho, sin descargas ni interacciones en el momento de la ficha, con licencia Apache 2.0 y sin documentación adicional sobre hiperparámetros, composición del dataset o resultados de evaluación más allá de lo que genera automáticamente LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT), codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes de cámaras del robot) con un transformer encoder-decoder que genera un chunk de acciones de horizonte fijo, junto con una cabeza de estilo CVAE que modela la variabilidad de las demostraciones humanas. La innovación principal del método original es la predicción de chunks temporales agregados, que suaviza la política y evita el compounding error típico de las políticas paso a paso.

En este checkpoint concreto no se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset `k5_20261110_143202`, el número de episodios de teleoperación, los hiperparámetros de entrenamiento ni si se aplicaron técnicas de aumento de datos. La model card únicamente indica que fue entrenado y subido con LeRobot y remite a la guía de entrenamiento de la documentación oficial.

## Capacidades

- Control robótico por imitación: genera chunks de acciones de bajo nivel (posiciones articulares) a partir de observaciones visuales y del estado del robot.
- Manipulación de objetos en entornos de mesa: adecuado para tareas de pick-and-place, apilado y ensamblaje sencillo, siempre que estén representadas en el dataset de entrenamiento.
- Ejecución en robots de bajo coste del ecosistema LeRobot (SO-100 follower, entre otros).
- Inferencia en tiempo real sobre GPU consumer mediante el pipeline `lerobot-record`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto: es una política de control, no un modelo de lenguaje.
- No incorpora visión generalista ni descripción de escenas; el codificador visual se usa exclusivamente para condicionar la política.

## Casos de uso

- Manipulación de laboratorio reproducible: servir como línea base para comparar variantes de ACT sobre el mismo dataset `k5_20261110_143202` y medir tasas de éxito con `lerobot-record`.
- Automatización de tareas de pick-and-place en mesa: el chunking de acciones proporciona movimientos suaves y repetibles en brazos SO-100 con cámaras cenitales.
- Prototipado académico de aprendizaje por imitación: permite reproducir el pipeline completo (teleoperación, entrenamiento, evaluación) con un coste de cómputo inferior a 0,2 GB de pesos.
- Evaluación de datasets de teleoperación: al ser un checkpoint pequeño, se puede reentrenar rápidamente para validar la calidad de nuevas grabaciones antes de escalar la recogida de datos.
- Despliegue en estaciones de trabajo con GPU consumer: su tamaño permite inferencia interactiva en tarjetas de gama media sin necesidad de servidores dedicados.
- Integración en flujos de investigación sobre generalización de políticas: comparar el rendimiento de este checkpoint frente a variantes con mayor número de parámetros o datasets más amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en precisión nativa, dado el tamaño de 51,7 M de parámetros y el buffer de activaciones del codificador visual.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el cuello de botella real será la latencia de las cámaras y del bus del robot, no el cómputo.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 4 GB de VRAM, incluidas GTX 1650 o superiores.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) sobre PyTorch/CUDA; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de robótica.
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y el número de cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5_base_10 (este) | 51,7 M | no aplica | Imitación robótica (ACT) | Apache 2.0 | Hugging Face |
| ACT original (Zhao et al., 2023) | no disponible | no aplica | Imitación robótica (ACT) | no disponible | Paper + código de referencia |
| Diffusion Policy (Chi et al., 2023) | no disponible | no aplica | Imitación robótica (difusión) | no disponible | Repositorio oficial |
| Políticas LeRobot preentrenadas (p. ej. SmolVLA) | variable | variable | Imitación robótica generalista | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: la política reproduce los sesgos de las demostraciones de teleoperación (posiciones, objetos, iluminación y disposición de la mesa del dataset `k5_20261110_143202`); fuera de esa distribución el rendimiento puede degradarse sin aviso.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras ante observaciones fuera de distribución.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural ni tiene ventana de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper original de ACT y verificar la licencia del dataset asociado.
- Caveats para producción: sin métricas de tasa de éxito publicadas, sin documentación de episodios ni de configuración de entrenamiento, y con cero descargas registradas; requiere validación propia antes de cualquier despliegue real. La seguridad física del robot debe garantizarse con límites de par y paradas de emergencia independientes de la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5_base_10
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
