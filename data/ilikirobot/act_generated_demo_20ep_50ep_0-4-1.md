# ilikirobot/act_generated_demo_20ep_50ep_0.4.1

## Resumen

El modelo `ilikirobot/act_generated_demo_20ep_50ep_0.4.1` es una política robótica basada en Action Chunking with Transformers (ACT), una arquitectura de aprendizaje por imitación presentada en el paper arXiv:2304.13705. Desarrollado por el usuario ilikirobot y entrenado con el framework LeRobot de Hugging Face, este modelo predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. Está diseñado para ser utilizado con robots de bajo coste como el SO-100, y se distribuye bajo licencia Apache 2.0.

El modelo cuenta con aproximadamente 51,6 millones de parámetros y se ha entrenado sobre un dataset generado sintéticamente (`ilikirobot/generated_demo_20ep_50ep`), que contiene demostraciones teleoperadas. Aunque no se especifican detalles sobre el número de episodios exactos ni la composición del dataset, el nombre sugiere 20 y 50 épocas de entrenamiento. Es un modelo ligero, pensado para ejecutarse en tiempo real en hardware modesto, y su formato de pesos es safetensors, compatible con el ecosistema LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador y decodificador |
| Parametros totales | 51.596.934 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se han publicado versiones cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformers que combina un codificador de visión (para procesar observaciones de cámaras) y un decodificador autorregresivo que genera secuencias de acciones. La innovación clave es el *action chunking*: en lugar de predecir una sola acción por paso de control, el modelo predice un bloque de acciones futuras, lo que reduce la acumulación de errores y mejora la suavidad del movimiento. El entrenamiento se realiza mediante aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de refuerzo explícito.

El modelo fue entrenado con el framework LeRobot, que facilita el registro de datasets, el entrenamiento y la evaluación de políticas robóticas. El dataset utilizado, `ilikirobot/generated_demo_20ep_50ep`, parece ser generado sintéticamente (posiblemente mediante simulación o aumentación de datos), aunque no se detalla su composición exacta. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Generación de acciones de control para robots manipuladores: predice posiciones de articulaciones o comandos de velocidad a partir de observaciones visuales y del estado del robot.
- Aprendizaje por imitación: reproduce comportamientos demostrados, como alcanzar, agarrar o mover objetos.
- Ejecución en tiempo real: al ser un modelo pequeño (51M parámetros), puede ejecutarse en GPUs de consumo o incluso en CPU con latencias aceptables.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación y registro de LeRobot, lo que facilita su uso en entornos de investigación.
- Soporte para robots SO-100: el comando de evaluación incluido en la model card indica que está pensado para el robot seguidor SO-100, un brazo robótico de bajo coste.
- No tiene capacidades de lenguaje, visión general ni tool calling; es exclusivamente una política de control robótico.

## Casos de uso

- Manipulación robótica en laboratorios de investigación: el modelo puede controlar un brazo SO-100 para tareas de pick-and-place, apilado o ensamblaje, replicando las demostraciones del dataset. Su tamaño reducido permite iterar rápidamente en experimentos.
- Prototipado de robots de bajo coste: al estar diseñado para SO-100, es adecuado para proyectos educativos o de hobby donde se busca una política de imitación sin necesidad de hardware caro.
- Evaluación de algoritmos de imitación: investigadores pueden usar este modelo como baseline para comparar nuevas técnicas de action chunking o variantes de ACT, gracias a su integración con LeRobot.
- Generación de datos sintéticos para entrenamiento: el dataset asociado (`generated_demo_20ep_50ep`) puede servir para probar pipelines de aumento de datos o simulación, y el modelo resultante puede validar la calidad de esos datos.
- Automatización de tareas repetitivas en entornos controlados: en una celda de trabajo fija, el modelo puede ejecutar secuencias de manipulación aprendidas, como clasificar piezas o alimentar una máquina, siempre que las condiciones sean similares a las demostraciones.
- Investigación en aprendizaje por imitación: el modelo sirve como ejemplo de aplicación de ACT con LeRobot, permitiendo estudiar el efecto del número de épocas, el tamaño del dataset o la arquitectura en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasas de éxito, métricas de precisión ni comparaciones con otros modelos en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño del modelo (51,6M parámetros), se estima que la inferencia requiere menos de 1 GB de VRAM en FP32, pero no se han publicado cifras oficiales.
- GPU recomendadas: no se especifican. Cualquier GPU moderna con al menos 2 GB de VRAM debería ser suficiente, incluyendo tarjetas de consumo como la GTX 1650 o superiores.
- Compatibilidad con consumer GPU: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de gama baja e incluso en CPU para inferencia no en tiempo real.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), y potencialmente exportación a otros formatos si se convierte, aunque no se documenta.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. ACT es una arquitectura conocida, pero este checkpoint específico no tiene modelos equivalentes documentados en la misma fuente.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con demostraciones de un dataset generado sintéticamente; su rendimiento en entornos reales no validados puede degradarse significativamente.
- No se especifican los detalles del dataset (número de episodios, variabilidad de escenarios, calidad de las demostraciones), lo que limita la reproducibilidad.
- Al ser un modelo de imitación, no generaliza a tareas fuera de las demostraciones; cualquier cambio en la posición de la cámara, iluminación o disposición de objetos puede causar fallos.
- No hay información sobre sesgos, pero al ser un modelo robótico, los sesgos se manifiestan en comportamientos no deseados ante entradas fuera de distribución.
- Riesgo de sobreajuste: el nombre del modelo sugiere 20 y 50 épocas, pero sin métricas de validación no se puede evaluar si hay sobreajuste.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset utilizado no tenga restricciones adicionales.
- No se proporcionan instrucciones claras para desplegar el modelo en producción; el flujo de trabajo está orientado a investigación con LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilikirobot/act_generated_demo_20ep_50ep_0.4.1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset asociado: https://huggingface.co/ilikirobot/act_generated_dataset
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
