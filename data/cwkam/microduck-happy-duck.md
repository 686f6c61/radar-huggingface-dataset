# CWKAM/microduck-happy-duck

## Resumen

microduck-happy-duck es una política de control por refuerzo (reinforcement learning) para el robot bípedo microduck de Pollen Robotics, exportada a ONNX y publicada por el usuario CWKAM en Hugging Face. No es un modelo de lenguaje: se trata de una "gait" o patrón de marcha que se carga en una de las ranuras de política del daemon del robot y se ejecuta de forma continua a 50 Hz, con 61 dimensiones de observación como entrada y 14 acciones como salida.

El modelo es un fine-tune de joanfox/microduck-happy-hop (Apache-2.0) y define un comportamiento concreto y acotado: cinco pasos rápidos seguidos de tres saltos y dos graznidos, según describe el propio autor en la model card. Se enmarca en el ecosistema microduck, un robot bípedo de 25 cm, 800 g y 399 USD presentado por Hugging Face y Pollen Robotics como plataforma abierta para experimentar con IA física, aprendizaje por refuerzo y transferencia de comportamientos de simulación a hardware real.

Su relevancia es práctica antes que comparativa: demuestra el flujo completo de publicación y despliegue de políticas en un robot de bajo coste, con el normalizador de observaciones embebido en el propio `policy.onnx` y un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon. El repositorio es de 0.0 GB, acumula 0 descargas y 0 likes, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con reinforcement learning y exportada a ONNX; topología interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la política consume 61 dimensiones de observación por paso a 50 Hz |
| Tipos de cuantizacion | no disponible (exportación ONNX; el normalizador de observaciones va embebido en `policy.onnx`) |
| Idiomas soportados | no disponible; no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible en la model card (el modelo base joanfox/microduck-happy-hop es Apache-2.0) |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json`, esquema 2 del manifiesto de políticas de microduck |

Otros datos verificables: pipeline `robotics`, librería `microduck`, relación con el modelo base `finetune`, 14 acciones de salida, ejecución perpetua hasta recibir una orden de parada, 0 descargas, 0 likes, repositorio de 0.0 GB, creado el 2026-10-28 y actualizado el mismo día.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red (número de capas, anchura, tipo de encoder ni si emplea memoria recurrente). Lo que sí se especifica es la interfaz: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz y una política de tipo perpetuo, es decir, un bucle de control que se mantiene activo hasta que el operador lo descarga de la ranura correspondiente. El autor indica que el normalizador de observaciones está integrado en el fichero ONNX, de modo que el consumidor debe alimentar observaciones en crudo y no aplicar preprocesado adicional.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`, y el propio autor advierte que la exportación proviene de un checkout con cambios sin commitear, lo que limita la reproducibilidad exacta del binario. No se publican número de pasos de entrenamiento, composición del dataset, distribución de recompensas, ni si se aplicaron técnicas de domain randomization o de regularización propias de sim-to-real. El comportamiento final deriva de un fine-tune sobre joanfox/microduck-happy-hop y está descrito de forma cualitativa como "cinco pasos rápidos, luego tres saltos con dos graznidos".

## Capacidades

- Locomoción bípeda pregrabada: ejecuta una secuencia fija de cinco pasos rápidos, tres saltos y dos graznidos de forma continua.
- Control en bucle cerrado a 50 Hz con observaciones de 61 dimensiones, lo que permite correcciones reactivas durante la marcha.
- Ejecución perpetua: la política no termina por sí misma, sino que corre hasta que se descarga de la ranura.
- Despliegue estandarizado mediante el daemon del robot (`robotctl policy load <slot> <repo>`), sin reentrenamiento en el dispositivo.
- Compatibilidad con el formato de manifiesto esquema 2, lo que facilita su integración junto a otras políticas del mismo robot.
- Capacidad de servir como base para nuevos fine-tunes dentro de la familia microduck.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de propósito general.

## Casos de uso

- Demostraciones y exhibiciones: cargar la política en una ranura y dejar que el robot ejecute el patrón de pasos y saltos de forma continua, útil en ferias, aulas y vídeos de producto donde se busca un comportamiento vistoso y repetible.
- Investigación en sim-to-real: usar esta política como referencia de comportamiento entrenado en simulación y medir su transferencia al robot físico, comparando la ejecución real con la del simulador del repositorio `microduck_rl`.
- Punto de partida para fine-tuning: al ser un fine-tune de una política previa, sirve como inicialización para experimentos que modifiquen el estilo de marcha, la cadencia o la secuencia de saltos.
- Validación del daemon y del formato de manifiesto: útil para probar el flujo `robotctl policy load`, la gestión de ranuras y el cumplimiento del esquema 2 en pipelines de integración del software del robot.
- Docencia en aprendizaje por refuerzo: ejemplo mínimo y de bajo coste de una política publicada en Hugging Face y ejecutable en hardware real, adecuado para prácticas de despliegue de políticas.
- Pruebas de robustez mecánica: la secuencia de saltos permite someter al robot a ciclos repetidos de impacto controlado para evaluar la resistencia de patas y servos en condiciones de uso intensivo.
- Base para composición de repertorios: combinada con otras políticas de la familia (por ejemplo, microduck-sad-duck), permite construir secuencias de comportamiento cargando y descargando ranuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de éxito, curvas de recompensa, ni métricas de seguimiento de trayectoria, estabilidad o consumo energético. Tampoco se aportan comparaciones cuantitativas con el modelo base joanfox/microduck-happy-hop ni con otras políticas microduck.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Se trata de una política ONNX de observación 61 y acción 14, por lo que la huella de cómputo es intrínsecamente reducida, pero no se publica cifra alguna de memoria ni de tamaño del fichero.
- GPU recomendadas: no disponibles. El escenario objetivo es la ejecución en el propio robot microduck, no en un servidor con GPU.
- Compatibilidad con GPU de consumo: no se documenta; previsiblemente innecesaria para la inferencia, dado que la política se ejecuta en el hardware del robot.
- Requisitos de entrenamiento o reentrenamiento: no disponibles. El repositorio `pollen-robotics/microduck_rl` es la referencia para reproducir el pipeline, pero no se detallan máquinas, horas ni frameworks concretos.
- Opciones de despliegue: `robotctl policy load <slot> CWKAM/microduck-happy-duck` sobre el daemon de microduck; inferencia ONNX con el normalizador de observaciones embebido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso) y un tamaño de acción de 14 dimensiones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / interfaz | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CWKAM/microduck-happy-duck | Política RL para microduck (ONNX) | no disponible | 61 obs. / 14 acciones a 50 Hz | no disponible | no disponible | Hugging Face, 0 descargas |
| joanfox/microduck-happy-hop | Política RL para microduck (modelo base) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| CWKAM/microduck-sad-duck | Política RL para microduck, mismo autor | no disponible | ranuras walk, stand, sitstand, ground_pick, kick_left, kick_right, roulade | no disponible | no disponible | Hugging Face |

La comparación cuantitativa no es posible con la información disponible: ninguno de los tres modelos publica número de parámetros ni métricas de rendimiento. La diferencia observable es de comportamiento y de licencia: el modelo base declara Apache-2.0, mientras que los fine-tunes de CWKAM no declaran licencia en la información consultada.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica términos de uso, lo que impide confirmar si se permite el uso comercial. Cualquier despliegue en producto debería aclararse con el autor antes de proceder.
- Reproducibilidad limitada: el autor indica que el ONNX se exportó desde un checkout con cambios sin commitear sobre el commit `6ff40704a`, por lo que reconstruir exactamente el binario no está garantizado.
- Comportamiento no generalista: la política ejecuta una secuencia concreta (cinco pasos, tres saltos, dos graznidos) de forma perpetua; no es una política de locomoción versátil ni responde a objetivos de navegación.
- Ausencia de métricas: sin tasas de éxito, estabilidad o consumo, no es posible estimar la fiabilidad en entornos distintos del de entrenamiento ni el desgaste mecánico asociado a los saltos repetidos.
- Dependencia del hardware específico: está diseñada para el robot microduck y su interfaz de observación de 61 dimensiones; no es portable a otras plataformas sin reentrenamiento.
- Sin información sobre sesgos: al no tratarse de un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí un posible sesgo de distribución frente al simulador y a las condiciones reales del terreno.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es la ejecución de una marcha inadecuada ante observaciones fuera de distribución, sin mecanismo de seguridad documentado en la model card.
- Idiomas: no disponible; irrelevante para la función del modelo, pero conviene tenerlo en cuenta si se esperaba documentación multilingüe.
- Advertencia de seguridad física: los saltos repetidos sobre el robot implican impacto; deben considerarse superficies adecuadas y supervisión durante las pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CWKAM/microduck-happy-duck
- Modelo base: https://huggingface.co/joanfox/microduck-happy-hop
- Otro fine-tune del mismo autor: https://huggingface.co/CWKAM/microduck-sad-duck
- Repositorio del robot: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`); documentación del manifiesto en `docs/policy-manifest.md` del repositorio del daemon
- Cobertura de prensa: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura de prensa: https://www.tech360.tv/hugging-face-unveils-microduck-new-open-source-biped-ai-robot-2026-31-08
- Cobertura de prensa: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-and-open-source-microduck-robot/
