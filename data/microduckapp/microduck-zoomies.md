# microduckapp/microduck-zoomies

## Resumen

Microduck-zoomies es una política de control motriz en formato ONNX publicada por la cuenta microduckapp en Hugging Face, etiquetada con el pipeline `robotics`. No es un modelo de lenguaje: es un artefacto de comportamiento (un "move") para el robot bípedo MicroDuck de Pollen Robotics, un robot de 25 cm y 15 motores presentado como plataforma open source de 399 dólares. El fichero `policy.onnx` implementa un movimiento de 11,3 segundos de duración, ejecutado a 50 Hz, que recibe 61 observaciones y emite 14 consignas de articulación. El nombre describe la conducta: arranques bruscos, giros cerrados y carreras de un lado a otro de la habitación.

El interés del artefacto es práctico: forma parte del conjunto `microduck-move`, el catálogo de comportamientos que la aplicación MicroDuck instala y reproduce en el robot. Cada política se acompaña de un `manifest.json` que declara qué necesita el pato para instalarla y ejecutarla, y de un vídeo de previsualización. Esto convierte al modelo en un ejemplo de distribución de políticas de control como paquetes versionados, un patrón habitual en robótica de consumo basada en aprendizaje por refuerzo en simulación (el stack de MicroDuck se entrena en MuJoCo según la documentación de Pollen Robotics).

La información publicada es mínima: el repositorio ocupa 0,0 GB, no declara licencia ni idiomas, y acumula 0 descargas y 0 likes en el momento de la consulta. No hay detalles sobre la topología de la red, el dataset de entrenamiento, la función de recompensa ni evaluaciones. Cualquier uso en producción exige contactar con el autor o inspeccionar el propio grafo ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de control exportada a ONNX; topología interna (capas, activaciones, tamaño) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso de control |
| Tipos de cuantizacion | no disponible (se distribuye un único artefacto ONNX sin variantes cuantizadas declaradas) |
| Idiomas soportados | no aplica (modelo de control motriz, sin entrada ni salida de texto) |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | ONNX (`policy.onnx`); metadatos en `manifest.json`; previsualización en `media/preview.mp4` |
| Dimension de observacion | 61 |
| Dimension de accion | 14 consignas de articulación |
| Frecuencia de control | 50 Hz |
| Duracion del movimiento | 11,3 s (equivalente a unos 565 pasos de control a 50 Hz) |
| Pipeline declarado | `robotics` |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la política. Lo que sí se puede afirmar es la interfaz: un modelo ONNX que mapea un vector de 61 observaciones a 14 objetivos articulares, pensado para ejecutarse en bucle cerrado a 50 Hz durante 11,3 segundos. La disparidad entre los 14 valores de salida y los 15 motores que la documentación de Pollen Robotics atribuye al robot no se explica en la información proporcionada; podría deberse a que una articulación (por ejemplo, la del pico prensil) no se comanda en este comportamiento, pero es una hipótesis no confirmada.

Tampoco se detallan los datos de entrenamiento, el número de tokens o episodios, la composición del dataset, ni si hubo ajuste fino con RLHF o DPO (categorías, por otra parte, propias de modelos de lenguaje y no de políticas de control). El contexto de la plataforma indica que el stack de MicroDuck permite entrenar comportamientos en simulación y transferirlos al robot, y que el robot se entrena con refuerzo en MuJoCo según la nota de prensa de MarkTechPost; no hay confirmación de que esta política concreta siga ese esquema. El `manifest.json` actúa como contrato de instalación y despliegue, pero su contenido no está incluido en la información disponible.

## Capacidades

- Ejecución de un comportamiento motriz fijo y coreografiado: "zoomies", con arranques, giros bruscos y carreras de ida y vuelta.
- Control en bucle cerrado a 50 Hz: la política consume 61 observaciones y emite 14 consignas articulares en cada paso.
- Duración determinada de 11,3 segundos por reproducción; no se documenta si admite repetición, interrupción o encadenamiento con otros movimientos.
- Integración con la aplicación MicroDuck mediante `manifest.json`, que declara dependencias y forma de instalación en el robot.
- Distribución portable en ONNX, lo que permite inspeccionar el grafo y ejecutarlo con ONNX Runtime fuera del robot para pruebas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües: no procesa texto.
- No incorpora visión, audio ni modo "thinking", aunque el robot MicroDuck disponga de cámara y LiDAR como hardware; esta política no declara entradas perceptivas de ese tipo entre sus 61 observaciones.
- No es un modelo generalista: no genera texto, código ni resuelve problemas matemáticos.

## Casos de uso

- Demostración de comportamiento expresivo en el robot: instalar el movimiento desde la aplicación MicroDuck para exhibir una rutina de 11,3 segundos en ferias, aulas o vídeos de producto, aprovechando que el `manifest.json` gestiona la instalación sin intervención manual.
- Referencia para el entrenamiento de nuevas políticas: usar la interfaz de 61 observaciones y 14 acciones como plantilla del espacio de observación y acción al entrenar comportamientos propios en simulación y comparar la transferencia sim2real con este artefacto.
- Pruebas de regresión del stack de despliegue: reproducir la política a 50 Hz con ONNX Runtime y verificar que el pipeline de inferencia del robot mantiene la frecuencia de control y el orden de las consignas articulares tras actualizaciones de firmware.
- Docencia en robótica bípeda: analizar un policy exportado real, inspeccionar el grafo ONNX, medir el coste de inferencia por paso y discutir la brecha entre simulación y hardware con un caso de 565 pasos de control.
- Investigación en aprendizaje por imitación: emplear la trayectoria resultante como datos de referencia para entrenar un modelo que imite el movimiento, o como política experta en un esquema de destilación.
- Validación de seguridad en robótica de consumo: reproducir el movimiento en un entorno controlado para caracterizar aceleraciones, estabilidad y riesgos de colisión de un comportamiento que implica giros cerrados y carreras, antes de autorizar su uso cerca de personas.
- Prueba de compatibilidad multiplataforma: al ser ONNX, ejecutar la política en una placa externa o en un simulador para verificar que el mismo artefacto produce consignas coherentes fuera del firmware original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta recompensa media, tasa de éxito del episodio, error de seguimiento de trayectoria, coste de inferencia por paso ni ninguna métrica de transferencia sim2real.

| Metrica | Valor |
|---|---|
| Recompensa media en simulacion | no disponible |
| Tasa de exito del episodio | no disponible |
| Error de seguimiento articular | no disponible |
| Latencia de inferencia por paso | no disponible |
| Rendimiento tras transferencia al robot real | no disponible (solo se ofrece un vídeo de previsualización) |

## Requisitos de hardware

- La política está diseñada para ejecutarse en el hardware integrado del MicroDuck, cuyas especificaciones de cómputo no están disponibles en la información proporcionada.
- VRAM estimada para inferencia en GPU: no disponible; por la naturaleza del artefacto (una política de 61 entradas y 14 salidas a 50 Hz) el coste esperado es muy bajo, pero no se publican parámetros ni FLOPs que permitan una cifra fiable.
- GPU recomendadas: no aplica en el caso de uso previsto; para inspección o ejecución en laboratorio basta CPU con ONNX Runtime.
- No requiere GPU de consumo: el despliegue objetivo es un robot bípedo de 25 cm, no un servidor de inferencia. Cualquier comparación con RTX 4090, A100 o H100 carece de sentido para este artefacto.
- Opciones de despliegue: ONNX Runtime (CPU) para pruebas e inspección; en el robot, a través de la aplicación MicroDuck y del `manifest.json` incluido. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la única cifra publicada es la frecuencia de control de 50 Hz, es decir, un presupuesto de 20 ms por paso de inferencia. No se indica la latencia real medida ni el margen disponible.

## Comparativa con modelos similares

No hay datos públicos de rendimiento que permitan una comparación cuantitativa. La alternativa más directa son otras políticas del mismo catálogo `microduck-move` publicadas por la misma cuenta (por ejemplo `microduck-midnight-snack`), de las que tampoco se detallan parámetros, contexto ni licencia.

| Modelo | Tipo | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-zoomies | Política de control ONNX para MicroDuck | no disponible | 61 observaciones, 50 Hz | no disponible | Hugging Face, 0 descargas |
| microduck-midnight-snack (mismo autor) | Política de control ONNX para MicroDuck | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas del catálogo microduck-move (16 modelos en la cuenta) | Políticas de control | no disponible | no disponible | no disponible | Hugging Face |
| Políticas de robótica de propósito general tipo VLA (por ejemplo OpenVLA o π0) | Modelos visión-lenguaje-acción | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

Las políticas VLA citadas pertenecen a otra categoría funcional (entrada visual y de instrucciones en lenguaje) y no son intercambiables con un movimiento preentrenado de 11,3 segundos; se mencionan solo como referencia de categoría, sin datos comparativos verificados en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin un texto de licencia explícito no hay autorización clara para uso comercial, redistribución ni obras derivadas; es un bloqueo legal potencial para integrar el movimiento en un producto.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública sobre su funcionamiento.
- Model card mínima: no se documenta la topología, el dataset, la recompensa, la semilla ni el procedimiento de entrenamiento, lo que impide auditar el comportamiento.
- Sin métricas de rendimiento ni de robustez: no hay datos de tasa de éxito, estabilidad o degradación ante perturbaciones, terreno irregular o empujes.
- Brecha sim2real desconocida: no se indica si la política se validó en el robot físico más allá del vídeo de previsualización; el vídeo no es una evaluación reproducible.
- Comportamiento acotado y no generalizable: 11,3 segundos de movimiento fijo, sin adaptación a obstáculos, personas u obstrucciones; no hay evidencia de que reaccione a entradas perceptivas.
- Riesgo físico: el propio nombre y la descripción implican arranques y giros bruscos; un robot bípedo de 25 cm ejecutando esta rutina cerca de bordes de mesa, escaleras o personas requiere supervisión y un espacio despejado.
- Dependencia del ecosistema: la instalación pasa por la aplicación MicroDuck y el `manifest.json`; cambios de firmware o de versión de la app pueden romper la compatibilidad.
- Ambigüedad en la interfaz: 14 consignas de salida frente a 15 motores declarados en el robot; conviene verificar el mapeo exacto antes de reutilizar la política.
- Sin soporte multilingüe ni de texto: no debe evaluarse con criterios de modelos de lenguaje (MMLU, HumanEval, GSM8K) ni esperar razonamiento, tool calling o generación de código.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la política puede producir acciones fuera de distribución ante observaciones anómalas sin ninguna señal de confianza asociada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-zoomies
- Cuenta del autor en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página oficial del producto MicroDuck: https://pollen-robotics.com/microduck/
- Nota de prensa sobre MicroDuck en MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Modelos STEP 3D del MicroDuck (repositorio de terceros): https://github.com/tianjin66/microduck-step-3d-models-ai-stl
