# guitarorangedog/manifeel-dp-gear

## Resumen

`manifeel-dp-gear` es un checkpoint de política de difusión (Diffusion Policy) para control robótico, entrenado con la librería LeRobot 0.6.1 a través del proyecto robo-synapse. Lo publica el usuario `guitarorangedog` como baseline reproducible sobre el dataset `RoboSynapse/manifeel-tacr_franka-panda_gear`, orientado a manipulación con robot Franka Panda y percepción táctil. No es un modelo de lenguaje: es un modelo de imitación que mapea observaciones visuales y táctiles a acciones de control de bajo nivel.

El modelo consume dos flujos de entrada: la imagen de una cámara de muñeca (wrist cam) y una imagen táctil del sensor derecho (`tacimg`). Con esos datos predice secuencias de acciones mediante un esquema de difusión, un enfoque habitual en robótica de imitación por su capacidad de modelar distribuciones multimodales de acciones. El checkpoint tiene 329.216.262 parámetros y ocupa 1,3 GB en el repositorio, en formato safetensors.

Su relevancia es acotada pero concreta: sirve como referencia cuantitativa (46,0 % de tasa de éxito) para experimentos de manipulación con feedback táctil sobre Franka Panda, y como punto de partida reproducible para quien quiera comparar variantes de Diffusion Policy en el mismo entorno. La información pública disponible es muy limitada: no hay licencia declarada, ni idiomas, ni benchmarks más allá de la tasa de éxito indicada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control robótico), sobre LeRobot 0.6.1 |
| Parametros totales | 329.216.262 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una Diffusion Policy, una familia de políticas de imitación que generan trayectorias de acción mediante un proceso de difusión condicionado por las observaciones. La entrada combina la imagen de la cámara de muñeca y la imagen táctil del sensor derecho (`tacimg`), y la salida es una secuencia de acciones de control para el robot. El checkpoint se entrenó con robo-synapse sobre LeRobot 0.6.1, con semilla 1000, precisión mixta (AMP) y sin aumentación de datos.

El dataset de entrenamiento es `RoboSynapse/manifeel-tacr_franka-panda_gear`, orientado a manipulación con Franka Panda y señales táctiles. La model card no detalla el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este contexto). Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal; la información disponible se limita a la configuración de entrenamiento descrita y a la tasa de éxito reportada.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones visuales (cámara de muñeca) y táctiles (`tacimg`).
- Manipulación de objetos con robot Franka Panda en el entorno del dataset `manifeel-tacr_franka-panda_gear`.
- Política de imitación entrenada por difusión, adecuada para modelar distribuciones multimodales de acciones.
- Integración con el ecosistema LeRobot 0.6.1 para carga y evaluación.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM.
- No tiene capacidades multilingües (no aplica).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Baseline reproducible en investigación de manipulación táctil: usar el checkpoint como referencia con tasa de éxito del 46,0 % para comparar nuevas variantes de Diffusion Policy sobre el mismo dataset y robot.
- Evaluación de políticas de imitación con Franka Panda: cargar el modelo en LeRobot 0.6.1 y ejecutar los 50 episodios por semilla descritos en la model card para reproducir la métrica reportada.
- Estudio de fusión viso-táctil: analizar cómo contribuye la imagen táctil (`tacimg`) frente a la cámara de muñeca en el rendimiento de la política, usando este checkpoint como punto de partida.
- Prototipado de pipelines de robótica con LeRobot: integrar el checkpoint en flujos de entrenamiento y evaluación existentes para validar la infraestructura antes de entrenar modelos propios.
- Docencia y divulgación: emplear un checkpoint pequeño (1,3 GB, 329 M de parámetros) como ejemplo práctico de Diffusion Policy en robótica de imitación.
- Reproducibilidad de experimentos: servir como artefacto de referencia para verificar recetas de entrenamiento (semilla 1000, AMP, sin aumentación) publicadas en robo-synapse.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de éxito | 46,0 % | 4 semillas × 50 episodios, máximo 500 pasos |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 329 M de parámetros en safetensors, la huella de pesos ronda 1,3 GB en precisión original, pero no se detalla el consumo real en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni se descarta.
- Opciones de despliegue: LeRobot 0.6.1 (librería declarada); otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (Diffusion Policy sobre Franka Panda con entrada táctil) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución del checkpoint.
- Información muy escasa: la model card no detalla dataset, composición, hiperparámetros completos ni metodología de evaluación más allá de la tasa de éxito.
- Tasa de éxito del 46,0 %: implica que más de la mitad de los episodios evaluados no tienen éxito; no es adecuado para producción sin mejoras.
- Entrenado para un entorno y robot concretos (Franka Panda, dataset `manifeel-tacr_franka-panda_gear`): no se garantiza generalización a otras tareas, objetos o configuraciones de sensores.
- Dependencia de la cámara de muñeca y del sensor táctil derecho: sin esas entradas, el modelo no puede operar según lo descrito.
- Riesgo de sobreajuste al dataset y a la semilla de entrenamiento (1000) sin aumentación de datos.
- Sin datos sobre sesgos, alucinación (no aplica en el sentido de LLM) ni comportamiento fuera de distribución.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso independiente.

## Enlaces

- Hugging Face: https://huggingface.co/guitarorangedog/manifeel-dp-gear
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_gear
- Código y receta: https://github.com/kwk2696/robo-synapse/pull/2
