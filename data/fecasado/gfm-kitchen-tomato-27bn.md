# fecasado/gfm-kitchen-tomato-27bN

## Resumen

gfm-kitchen-tomato-27bN es una política de robótica (policy) publicada por el usuario fecasado en Hugging Face bajo la librería LeRobot, orientada a una tarea concreta de manipulación: llevar un tomate a un plato en un entorno de cocina. No es un modelo de lenguaje: es un controlador entrenado por imitación que produce acciones de robot a partir de observaciones visuales, y su pipeline declarado es `robotics`, con licencia Apache-2.0.

El modelo se registra con el nombre interno `gaze_flow_matching`, lo que apunta a una formulación de flow matching condicionada por información de mirada (gaze). El repositorio ocupa 0,3 GB y contiene pesos en formato safetensors con 75.228.826 parámetros reales (unos 75,2 millones), según el recuento del propio archivo de safetensors. Cabe señalar que el sufijo "27bN" del identificador no se corresponde con el tamaño real del modelo, que está tres órdenes de magnitud por debajo de los 27.000 millones de parámetros que ese sufijo sugiere.

Su relevancia es acotada pero clara para quien trabaja en aprendizaje por imitación: es un checkpoint ligero, entrenado sobre el dataset `fecasado/tomato-to-plate-320x240` a resolución 320x240, que puede ejecutarse y evaluarse con el flujo estándar de LeRobot sobre robots de tipo SO-100. La model card, sin embargo, es prácticamente una plantilla sin completar: no documenta arquitectura, datos de entrenamiento, métricas ni resultados de evaluación, y el propio autor la marca con el aviso "Model type not recognized — please update this template".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de robótica basada en gaze flow matching; detalles internos no disponibles |
| Parámetros totales | 75.228.826 (aproximadamente 75,2 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido de ventana de tokens) |
| Tipos de cuantización | No disponible; el repositorio contiene pesos en safetensors sin cuantizaciones documentadas |
| Idiomas soportados | No disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

Otros datos registrados: pipeline `robotics`, tamaño del repositorio 0,3 GB, dataset asociado `fecasado/tomato-to-plate-320x240`, resolución de observación 320x240, 0 descargas y 0 likes en el momento de la consulta, fecha de creación y última actualización 2026-09-25.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. Los metadatos indican que se trata de una política de flow matching con condicionamiento por mirada (`gaze_flow_matching`), entrenada y subida al Hub mediante LeRobot. No se especifica el número de capas, el tipo de codificador visual, el número de tokens de entrenamiento, el número de episodios del dataset ni si se emplearon etapas de ajuste tipo RLHF o DPO, que en cualquier caso no son habituales en políticas de imitación robótica.

La model card incluye un ejemplo genérico de entrenamiento con `--policy.type=act`, pero se trata de la plantilla estándar de LeRobot y no necesariamente del tipo de política realmente usado, ya que el nombre declarado del modelo es `gaze_flow_matching`. El dataset asociado es `fecasado/tomato-to-plate-320x240`, y el ejemplo de evaluación apunta a un robot `so100_follower`. No hay información sobre composición del dataset, número de episodios, variaciones de iluminación, objetos o posiciones, ni sobre técnicas de aumento de datos.

## Capacidades

- Generación de acciones de robot a partir de observaciones visuales a resolución 320x240.
- Ejecución de una tarea de manipulación concreta: trasladar un tomate a un plato en un entorno de cocina.
- Condicionamiento por señal de mirada (gaze), según el nombre declarado de la política.
- Entrenamiento e inferencia dentro del ecosistema LeRobot, con comandos `lerobot-train` y `lerobot-record`.
- Compatibilidad declarada con robots de tipo SO-100 (el ejemplo de evaluación usa `so100_follower`).
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles más allá del uso de entrada visual para control.

## Casos de uso

- Manipulación pick-and-place en cocina: el modelo puede controlar un brazo SO-100 para coger un tomate y depositarlo en un plato, que es exactamente la tarea sobre la que se ha entrenado el dataset `tomato-to-plate-320x240`.
- Evaluación reproducible de políticas de imitación: con `lerobot-record --policy.path=fecasado/gfm-kitchen-tomato-27bN` se pueden grabar episodios de evaluación y comparar el comportamiento del checkpoint con otras políticas sobre el mismo montaje físico.
- Reentrenamiento iterativo y aumento de datos: al ser un checkpoint ligero (0,3 GB), sirve como punto de partida para fine-tuning con nuevos episodios grabados en el mismo robot, ampliando variaciones de posición del tomate o del plato.
- Investigación en condicionamiento por mirada: el nombre `gaze_flow_matching` lo hace adecuado como banco de pruebas para estudiar si la señal de gaze mejora la precisión en tareas de agarre fino frente a políticas puramente visuales.
- Baseline de referencia en experimentos de flow matching robótico: permite comparar variantes de flow matching frente a otras formulaciones (por ejemplo, políticas de difusión) sobre una tarea estándar y un dataset público concreto.
- Prototipado de automatización de servicio de alimentos: en un entorno de laboratorio, se puede integrar en una celda con cámara fija a 320x240 y brazo de bajo coste para demostrar el ciclo completo de percepción y actuación.
- Docencia y demostraciones de aprendizaje por imitación: el tamaño reducido permite ejecutar inferencia en hardware asequible, incluso en CPU, lo que facilita talleres y prácticas sin acceso a GPU de gama alta.
- Despliegue en el borde (edge): con aproximadamente 75 M de parámetros, el modelo es candidato a ejecutarse en un equipo compacto conectado al robot, siempre que se valide la latencia en la configuración concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, métricas de error de posición ni comparaciones cuantitativas con otras políticas. Tampoco se documentan curvas de entrenamiento ni valores de pérdida.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 para los pesos y unos 0,15 GB en fp16/bf16; con buffers de imagen y activaciones, el consumo esperado se mantiene por debajo de 1-2 GB en la mayoría de configuraciones (estimación derivada del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: no hay recomendaciones publicadas; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente, incluidas RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en prácticamente cualquier GPU de consumo de los últimos años, e incluso en CPU para inferencia de baja frecuencia de control.
- Opciones de despliegue: LeRobot (comandos `lerobot-train` y `lerobot-record`), con PyTorch como backend. No aplican servidores de inferencia de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. La viabilidad en tiempo real depende de la frecuencia de control exigida por el robot y del hardware de inferencia, dato que no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-tomato-27bN | 75,2 M | No aplica | Tomate a plato (SO-100) | Apache-2.0 | Público en Hugging Face |
| fecasado/gfm-kitchen-tomato-baseline | No disponible | No aplica | Tomate a plato | No disponible | Público en Hugging Face |
| Políticas estándar de LeRobot (por ejemplo, ACT) | No disponible | No aplica | Manipulación diversa | No disponible | Público mediante la librería LeRobot |
| Políticas de difusión para robótica | No disponible | No aplica | Manipulación diversa | No disponible | Implementaciones públicas diversas |

La comparación cuantitativa no es posible con la información disponible: no hay métricas publicadas para este checkpoint ni para el baseline del mismo autor. La única referencia directa encontrada es `fecasado/gfm-kitchen-tomato-baseline`, que aparentemente cubre la misma tarea y comparte la estructura de model card, pero sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Model card incompleta: la propia plantilla indica "Model type not recognized", sin secciones de arquitectura, datos, evaluación o uso previsto.
- Nombre potencialmente engañoso: el sufijo "27bN" no refleja el tamaño real del modelo, que es de unos 75,2 millones de parámetros.
- Especialización extrema: está entrenado para una única tarea (tomate a plato) en un montaje concreto; no se espera generalización a otros objetos, tareas o entornos sin reentrenamiento.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de fiabilidad, robustez ante cambios de iluminación o variaciones de posición.
- Dependencia del montaje: el rendimiento probablemente depende de la cámara, la resolución 320x240, la calibración y el tipo de robot (SO-100), parámetros que no se detallan.
- Riesgo de sobreajuste al dataset: al no documentarse el número de episodios ni la diversidad de `fecasado/tomato-to-plate-320x240`, no puede descartarse un ajuste excesivo a las condiciones de grabación.
- Idiomas: no aplica, pero conviene no confundirlo con un modelo de lenguaje multilingüe pese a las etiquetas genéricas del Hub.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el usuario debe verificar de forma independiente la licencia y procedencia del dataset asociado y de cualquier tercero implicado.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad, issues ni validación externa documentada.
- Para producción: no se recomienda desplegarlo sin una evaluación propia en el montaje objetivo, con medición de tasa de éxito y latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-tomato-27bN
- Dataset asociado: https://huggingface.co/datasets/fecasado/tomato-to-plate-320x240
- Modelo baseline del mismo autor: https://huggingface.co/fecasado/gfm-kitchen-tomato-baseline
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
