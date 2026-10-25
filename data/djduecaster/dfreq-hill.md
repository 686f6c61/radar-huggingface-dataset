# djduecaster/dfreq-hill

## Resumen
dfreq-hill es una política de control para robótica publicado por djduecaster en Hugging Face. Se trata de una recalibración específica de evento, sin memoria, de la política de referencia Hill Climb de Pollen Robotics. El modelo no introduce nuevos pesos neuronales: conserva íntegramente la red original y añade un envoltorio ONNX que modifica una única observación de comando de avance antes del normalizador. El objetivo es ajustar la velocidad forward en la pista positiva de Hill Climb en simulación.

La interfaz del modelo es de 61 observaciones float32 de entrada y 14 acciones float32 de salida a 50 Hz, con el normalizador embebido y el rig de patas activo. El cambio consiste en sumar 0,025 al comando externo y recortarlo al intervalo [0,15, 1,0] antes del normalizador. En la verificación local del autor, el modelo completó 5 de 5 carreras con un tiempo medio de 5,848 s, frente a 5,880 s de la referencia sin modificar, una mejora de 0,032 s, aproximadamente el 0,54%.

Es relevante como ejemplo acotado de calibración de comandos y de empaquetado reproducible en ONNX para un benchmark de robótica, no como un modelo general de locomoción. La publicación es de alcance muy específico: simulación, rejilla positiva de Hill Climb y ausencia de garantía de parada o de seguridad en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control neuronal de retroalimentación, exportada a ONNX; topología interna no documentada |
| Parámetros totales | No disponible; el archivo `policy.onnx` ocupa 794.338 bytes y no se declara el número de parámetros |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No aplica; no es un modelo de lenguaje. Interfaz de 61 observaciones float32 a 14 acciones float32 |
| Tipos de cuantización | Float32 en la interfaz; no se documentan otros formatos de cuantización |
| Idiomas soportados | No aplica; no es un modelo de lenguaje |
| Licencia | No disponible; no se afirma una licencia open source independiente para los pesos upstream. La publicación se describe como remix atribuido y limitado al servicio |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento
La arquitectura es una política de control neuronal de retroalimentación ordinaria, sin estado, exportada a ONNX. No se describe la topología interna de la red. La interfaz declarada es de 61 observaciones float32 de entrada y 14 acciones float32 de salida a 50 Hz, con el normalizador embebido y el rig de patas activo. El modelo es perpetuo y mantiene una pose de entrada de pie. No contiene reloj, contador de pasos, clasificador de semilla, tabla de semillas ni condicionamiento por metadatos en tiempo de ejecución; tampoco es una secuencia de acciones pregrabada.

No hubo nuevo entrenamiento neuronal ni fine-tuning: todos los pesos neuronales originales permanecen sin cambios. Los metadatos de entrenamiento retenidos describen el modelo original de Pollen Robotics. El único cambio es un mapeo de la observación 48, correspondiente al comando de avance, antes del normalizador original: `vx_internal = Clip(float32(vx_external + float32(0.025)), float32(0.15), float32(1.0))`. El envoltorio utiliza operadores ONNX estándar `Split`, `Add`, `Clip` y `Concat`; las otras 60 observaciones, incluida la historia real de acciones previas, no se modifican. No se dispone de información sobre el dataset original, el número de tokens ni procesos de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades
- Control de locomoción en simulación: transforma 61 observaciones float32 en 14 acciones float32 a 50 Hz para el rig de patas de Hill Climb.
- Calibración del comando de avance: aplica un desplazamiento fijo de +0,025 y un recorte a [0,15, 1,0] antes del normalizador.
- Comportamiento sin memoria: no usa reloj, contador de pasos, semilla ni historial explícito más allá de las observaciones de entrada.
- Compatibilidad con el runner local descrito por el autor: evaluado con el runner v4 de Arena y con la interfaz de modelo API 1.
- Exportación ONNX con operadores estándar: facilita la inspección del grafo y la integración en entornos compatibles con ONNX.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación simbólica.
- No dispone de visión, audio, lenguaje natural ni capacidades multilingües.
- No ofrece garantía de parada: el recorte incondicional convierte un comando de avance cero o negativo en +0,15 interno, por lo que el campo heredado `command.idle` no está validado como parada segura.

## Casos de uso
- Evaluación comparativa en el simulador de Hill Climb: permite ejecutar la referencia y la variante calibrada con el mismo comando externo y las mismas semillas para medir diferencias de tiempo de finalización en un entorno controlado.
- Reproducción de experimentos locales: el autor documenta 30 carreras con el runner v4, 18 velocidades de la rejilla oficial en la semilla 1 y las tres mejores combinaciones en las semillas 1 a 5; el modelo sirve para repetir ese protocolo y comprobar la estabilidad de los resultados.
- Pruebas de regresión de exportación ONNX: útil para verificar que el grafo mantiene las formas 61 a 14, que el normalizador sigue embebido y que los operadores `Split`, `Add`, `Clip` y `Concat` se comportan como se espera tras una reexportación.
- Estudio acotado de calibración de comandos: permite comparar el efecto de offsets fijos como +0,0125, +0,025 y +0,0375 en el rendimiento de la política, manteniendo el resto de observaciones sin cambios.
- Docencia e investigación en control reactivo: adecuado para ilustrar cómo una política de retroalimentación puede modificarse mediante una envoltura de preprocesado sin reentrenar la red.
- Integración en un banco de pruebas de control a 50 Hz: sirve para medir determinismo, temporización y repetibilidad en un pipeline de simulación, no para validación en robot físico.
- Análisis de sensibilidad a la velocidad forward: útil para documentar qué comandos de la rejilla producen caídas o timeouts, con la advertencia de que el modelo está especializado en la zona positiva de la pista.

## Benchmarks y rendimiento
No hay resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Los únicos datos disponibles son pruebas locales de carrera proporcionadas por el autor, no verificadas en servidor y no equivalentes a un benchmark público.

| Prueba local | Resultado |
|---|---|
| Referencia sin modificar, 5 carreras | 5,880 s; 5/5 finalizaciones |
| dfreq-hill, 5 carreras | 5,848 s; 5/5 finalizaciones |
| Mejora declarada | 0,032 s; aproximadamente 0,54% |
| Comando externo seleccionado | 0,55 m/s; representación interna float32 0,574999988079071 m/s |
| Cobertura del barrido | 18 velocidades oficiales en semilla 1; tres mejores comandos en semillas 1 a 5; 30 carreras |

| Semilla de inicio | Tiempo de finalización (s) |
|---|---:|
| 1 | 5,88 |
| 2 | 5,84 |
| 3 | 5,82 |
| 4 | 5,86 |
| 5 | 5,84 |

El autor indica que las cinco semillas usadas para seleccionar el comando no constituyen evidencia de robustez fuera de muestra. Otras configuraciones de la rejilla incluyeron caídas y un timeout, por lo que no se trata de una afirmación de finalización a todas las velocidades. También se documentaron 55 carreras y 27.843 pasos de control entre línea base, cribado, barrido oficial y confirmación, sin cambios en la física.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; no se publican requisitos de memoria.
- GPU recomendadas: no disponible; no se indica ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no se proporciona evidencia; no se afirma que quepa en una GPU de consumo concreta.
- Tamaño del artefacto: `policy.onnx` ocupa 794.338 bytes, con interfaz float32 de 61 entradas y 14 salidas.
- Opciones de despliegue: el artefacto es una política ONNX para la librería `microduck`; no aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje. El runtime ONNX concreto no se especifica.
- Latencia y throughput: no se publican medidas de latencia ni de throughput; la única referencia temporal es la frecuencia de control de 50 Hz.
- Uso en robot real: no se proporcionan instrucciones de carga en robot ni garantías de seguridad; el modelo se declara exclusivamente para simulación.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Rendimiento local | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dfreq-hill | Referencia Hill Climb de Pollen Robotics, fijada en `d319208d92896353f581be754f6325d01f5e3732` | No disponible | No aplica; 61 observaciones a 14 acciones | 5,848 s; 5/5 finalizaciones | No disponible | Hugging Face |
| Referencia Hill Climb de Pollen Robotics sin modificar | Modelo original de Pollen Robotics | No disponible | No aplica; 61 observaciones a 14 acciones | 5,880 s; 5/5 finalizaciones | No disponible | Hugging Face |
| Otros modelos microduck comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otras alternativas públicas de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias
- Modelo exclusivamente de simulación: no es una recomendación de seguridad para robot real ni un caminante general.
- Especialización muy estrecha: está ajustado a la rejilla positiva de la carrera Hill Climb; no se ha validado en otros entornos, tareas o sentidos de marcha.
- El recorte incondicional transforma comandos de avance cero o negativos en +0,15 interno; el campo heredado `command.idle` no es una garantía de parada o frenado.
- La mejora es modesta: 0,032 s, aproximadamente un 0,54%, y procede de una verificación local, no de un servidor ni de un leaderboard.
- Las cinco semillas usadas para seleccionar el comando no son evidencia de robustez fuera de muestra; otras velocidades de la rejilla produjeron caídas y un timeout.
- No se han publicado resultados de benchmarks estándar ni comparaciones independientes.
- No se afirma una licencia open source independiente para los pesos upstream; la publicación se describe como remix atribuido y limitado al servicio, no como una concesión general de redistribución fuera de la plataforma.
- Los metadatos de entrenamiento retenidos describen el modelo original de Pollen Robotics, no un nuevo entrenamiento de esta variante.
- No es un modelo de lenguaje: no procede evaluar sesgos lingüísticos, alucinación factual o capacidades multilingües; el riesgo principal es la generalización indebida a partir de un resultado local muy específico.
- No se proporcionan instrucciones de carga en robot, garantías de seguridad ni validación de cumplimiento normativo para producción.

## Enlaces
- [Modelo dfreq-hill en Hugging Face](https://huggingface.co/djduecaster/dfreq-hill)
- [Referencia Hill Climb de Pollen Robotics, revisión fijada](https://huggingface.co/pollen-robotics/microduck-hill-climb-1m5-reference/tree/d319208d92896353f581be754f6325d01f5e3732)

No se han encontrado papers, blogs, repositorios adicionales o demos en la información proporcionada.
