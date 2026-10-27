# microduckapp/microduck-photo-shoot

## Resumen

microduck-photo-shoot no es un modelo de lenguaje, sino una política de control motriz («move») para el robot bípedo Microduck, publicada en HuggingFace por el usuario microduckapp dentro del ecosistema de etiquetas microduck-move. El artefacto contiene `policy.onnx`, un `manifest.json` con lo que el robot necesita para instalar y reproducir el movimiento, y un vídeo de previsualización (`media/preview.mp4`). La política define una secuencia de 10,8 segundos en la que el robot adopta sucesivas poses ante una cámara, girando entre ellas.

La interfaz es explícita: 61 observaciones de entrada, 14 consignas articulares de salida y una frecuencia de control de 50 Hz (un paso cada 20 ms). El repositorio reporta un tamaño de 0,0 GB (redondeado) y no incluye información sobre arquitectura interna, parámetros, dataset de entrenamiento ni métricas de evaluación.

Su relevancia es la de un ejemplo de distribución de comportamientos de IA física como artefactos portables e instalables desde una aplicación, sobre un robot de 25 cm con 15 motores, cámara, sensor de profundidad y pico articulado, desarrollado por Pollen Robotics y Hugging Face. La licencia no está declarada, lo que limita cualquier uso más allá del experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de control exportada a ONNX; la model card no describe la red) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de control de 61 observaciones por paso |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`), con `manifest.json` y `media/preview.mp4` |
| Entradas | 61 observaciones por paso |
| Salidas | 14 consignas articulares (joint targets) |
| Frecuencia de control | 50 Hz (paso de 20 ms) |
| Duración del movimiento | 10,8 s |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamaño del repositorio | 0,0 GB (redondeado) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-27 / 2026-10-27 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura de la red: solo se especifica el contrato de entrada/salida (61 observaciones → 14 objetivos articulares a 50 Hz) y el formato de exportación, ONNX. No hay información sobre número de capas, tipo de red (MLP, transformer o política recurrente), función de pérdida, ni sobre el proceso de entrenamiento (número de tokens o episodios, composición del dataset, uso de simulación, imitación o aprendizaje por refuerzo).

Tampoco se detalla la composición del vector de observaciones ni el significado de cada una de las 14 salidas. Existe una discrepancia no explicada entre las 14 consignas de salida y los 15 motores del robot Microduck, por lo que al menos una articulación no estaría actuada por esta política. Los materiales de terceros sobre el robot indican que su pila de software es abierta y que permite entrenar comportamientos en simulación y ejecutarlos después en el hardware, pero la model card no confirma que este movimiento concreto se haya obtenido así.

## Capacidades

- Reproducción de una secuencia de poses predefinida de 10,8 segundos de duración, con giros entre poses para mostrar distintos perfiles ante una cámara.
- Generación de consignas de control articular a 50 Hz (20 ms por paso) para 14 articulaciones.
- Ejecución determinista de un comportamiento cerrado: no hay condicionamiento por lenguaje, instrucciones ni objetivos de alto nivel.
- Distribución como artefacto portable ONNX, con manifiesto de instalación que describe dependencias y metadatos del movimiento.
- Inclusión de material de previsualización (`media/preview.mp4`) para verificar el comportamiento esperado antes de instalarlo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No procesa imagen: aunque el robot Microduck incorpora cámara y sensor de profundidad, la política declara únicamente 61 observaciones cuyo contenido no está documentado.

## Casos de uso

- Demostraciones en ferias y eventos: el movimiento está pensado explícitamente para posar ante una cámara, de modo que sirve como comportamiento de escaparate para mostrar el robot a público no técnico sin desarrollo adicional.
- Validación de la cadena de instalación de movimientos: al incluir `manifest.json`, es un caso de prueba útil para verificar que la app MicroDuck descarga, instala y reproduce correctamente un move de terceros.
- Composicionado de secuencias de comportamiento: el movimiento puede encadenarse con otros del ecosistema microduck-move para construir rutinas más largas (por ejemplo, paseo, pose y saludo), siempre que la app permita concatenación.
- Docencia en robótica: ejemplo mínimo y legible de artefacto de política (entrada, salida, frecuencia, formato) para explicar cómo se empaqueta y despliega un controlador entrenado en un robot real.
- Pruebas de temporización y latencia: a 50 Hz el margen por paso es de 20 ms, por lo que el movimiento sirve para medir si un pipeline de inferencia ONNX en una plataforma concreta cumple el presupuesto de tiempo real.
- Captura de material audiovisual: Photoshoot está diseñado para generar tomas repetibles del robot en distintas orientaciones, útil para vídeos de producto, documentación o datasets visuales del propio robot.
- Pruebas de ciclo largo y repetibilidad: al ser una secuencia corta y determinista, permite ejecutar ciclos prolongados para evaluar calentamiento de motores, deriva de las articulaciones o degradación mecánica.
- Verificación de integración de un runtime ONNX: sirve como caso de prueba para validar la exportación e importación entre versiones de ONNX Runtime antes de desplegar políticas más críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de la tarea, error de seguimiento articular, tasas de caída, ni comparaciones con otras políticas. Tampoco se reportan latencias medidas ni throughput de inferencia.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio reporta 0,0 GB redondeados, lo que impide estimar el peso real del fichero ONNX; por la naturaleza del artefacto (política de control de un robot de 25 cm), se espera que la inferencia sea ligera, pero no hay confirmación en la información proporcionada.
- GPU recomendadas: no aplica ni está documentado. No se especifica ningún acelerador para ejecutar la política.
- Viabilidad en GPU de consumo: previsiblemente irrelevante; el cuello de botella es el bucle de control a 50 Hz en el propio robot o en el host que lo controla, no la capacidad de cómputo gráfico.
- CPU: opción natural para ONNX Runtime en el bucle de control, aunque no se documenta la plataforma exacta que emplea la app MicroDuck.
- Opciones de despliegue: ONNX Runtime como runtime declarado por el formato; instalación a través del manifiesto y la app MicroDuck. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el requisito implícito es de 20 ms por paso (50 Hz). No se publican latencias medidas ni margen real de cómputo.
- Robot: Microduck, 25 cm de altura, 15 motores, cámara, sensor de profundidad (LiDAR según el fabricante), dos sensores de movimiento y pico articulado con capacidad de agarre; precio de preventa anunciado de 399 USD.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-photo-shoot | Política de control ONNX para Microduck | No disponible | 61 observaciones por paso a 50 Hz | No disponible | HuggingFace, 0 descargas |
| Otros moves de microduck-move | Políticas de control ONNX para Microduck | No disponible | No disponible | No disponible | Ecosistema microduck-move, sin datos en la información proporcionada |
| Políticas VLA generalistas (OpenVLA, π0 y similares) | Visión-lenguaje-acción | No disponible en la información proporcionada | No disponible | No disponible | No verificado en esta búsqueda |

La comparación cuantitativa no es posible con los datos disponibles: no se han encontrado parámetros, contextos, licencias ni métricas de los modelos alternativos dentro de la información proporcionada. La diferencia categórica principal es que este artefacto es un comportamiento cerrado y específico de hardware, mientras que las políticas VLA generalistas se condicionan por instrucciones en lenguaje y requieren órdenes de magnitud más de cómputo, extremo que no se puede cifrar aquí.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, redistribución ni modificación; es un bloqueo potencial para cualquier despliegue en producto.
- Ausencia total de documentación técnica: no se describe la arquitectura, el dataset, el procedimiento de entrenamiento ni el significado de las 61 observaciones, lo que impide evaluar robustez o diagnosticar fallos.
- Cero validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros de que el movimiento se ejecute correctamente en hardware real.
- Acoplamiento estricto al hardware: la política está entrenada para la morfología y los motores del Microduck; no es transferible a otro robot sin reentrenamiento.
- Discrepancia entre 14 salidas y 15 motores: se desconoce qué articulación queda fuera de control y si el movimiento depende de una posición por defecto del resto.
- Riesgo de brecha sim-a-real: si el movimiento se generó en simulación (los materiales del fabricante indican que la pila permite entrenar en simulación, aunque la card no lo confirma para este move), pueden aparecer desviaciones de seguimiento o inestabilidad en el robot físico.
- Sin métricas de seguridad: no se documenta el comportamiento ante interrupciones, pérdida de comunicación o bloqueo de una articulación.
- El riesgo de alucinación no aplica: el modelo no genera lenguaje ni contenido factual.
- El riesgo de sesgo lingüístico o cultural no aplica por la misma razón; el sesgo relevante sería de dominio (entorno, iluminación, superficie) y no está evaluado.
- Sin soporte de contexto largo ni de instrucciones: la política no se puede redirigir con prompts; solo reproduce el comportamiento grabado.
- Las afirmaciones sobre el robot (15 motores, LiDAR, precio) proceden de notas de prensa y del fabricante, no de la model card, y podrían variar según la versión de hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-photo-shoot
- Repositorio del robot en GitHub (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Ficha del robot en ROBOTS: https://robotsguide.com/robots/microduck
- Página oficial de compra: https://microducks.org/
- Página del fabricante (Pollen Robotics): https://pollen-robotics.com/microduck/
- Artículo divulgativo en CNX Software: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
