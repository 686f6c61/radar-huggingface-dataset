# ragmishra108/4-iredium-line-newarmA

## Resumen

4-iredium-line-newarmA es una política robótica de tipo vision-language-action (VLA) publicada por el usuario ragmishra108 en HuggingFace, entrenada mediante aprendizaje por imitación para una tarea muy concreta: extender queso y colocar salami en una maqueta de pizza dentro de la Robot Pizza Cup. El modelo parte de `lerobot/smolvla_base` (SmolVLA, el VLA compacto del ecosistema LeRobot) y se ha ajustado de forma secuencial sobre un modelo anterior (`4-iredium-line-modelA`) para adaptar la política a un brazo seguidor de reemplazo, después de que el brazo original cambiara.

Con 450.046.176 parámetros y un repositorio de 1,2 GB, es un modelo pequeño para los estándares actuales de VLA, lo que lo hace ejecutable en una sola GPU. Su relevancia no está en el rendimiento generalista, sino en el flujo de trabajo que documenta: reajuste de una política preentrenada con datos de replay mezclados con demostraciones nuevas sobremuestreadas, VLM congelado y solo el experto de acciones entrenado, en 1.500 pasos sobre una única RTX PRO 6000. Es un caso práctico de recuperación de una política robótica tras un cambio de hardware.

La model card es escueta y no incluye resultados de evaluación, licencia ni idiomas declarados, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre `lerobot/smolvla_base`: VLM preentrenado congelado más experto de acciones entrenado por imitación |
| Parametros totales | 450.046.176 (dato real de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el repo solo incluye safetensors) |
| Idiomas soportados | no disponible; los prompts de entrenamiento están en inglés (`Put cheese on spot {k} of 7.`, `Put salami on spot {k} of 6.`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, `stats.safetensors`, `config.json`) |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Modelo predecesor | 4-iredium-line-modelA |

## Arquitectura y entrenamiento

La política sigue la arquitectura SmolVLA del ecosistema LeRobot: un modelo visión-lenguaje que procesa observaciones visuales e instrucciones en lenguaje natural y un experto de acciones que genera comandos articulares. En este ajuste el VLM se mantiene congelado y solo se entrena el experto de acciones, lo que reduce coste y riesgo de degradar la percepción aprendida en el modelo base. El autor no detalla en la model card la variante exacta del experto de acciones ni la resolución o frecuencia de las observaciones.

El entrenamiento consistió en 1.500 pasos con batch 64, learning rate 3e-5 con decaimiento coseno y una única RTX PRO 6000, alcanzando una pérdida final de 0,077. La mezcla de datos combina 182 episodios del modelo anterior usados como replay (grabados con el brazo original) y demostraciones del brazo nuevo sobremuestreadas: una demostración de queso dividida en 7 etapas y replicada ×8, y 11 episodios de salami de una sola loncha replicados ×4. Esa estrategia de replay más sobremuestreo es lo que permite conservar el comportamiento previo y, a la vez, adaptar la política a la cinemática del brazo de reemplazo con muy pocas demostraciones nuevas.

La ejecución no es autónoma de extremo a extremo en lenguaje: se realiza a través de un planificador (`smolvla_py/scripts/planner.py`) que selecciona el prompt de etapa y la bandera de finalización, mientras que todos los comandos articulares provienen de la política.

## Capacidades

- Manipulación robótica de una sola tarea: extensión de queso en 7 posiciones discretas y colocación de salami en 6 posiciones.
- Seguimiento de instrucciones en lenguaje natural por etapas, con prompts parametrizados por índice de posición.
- Aprendizaje por imitación: reproduce trayectorias aprendidas de demostraciones humanas o teleoperadas.
- Adaptación a un brazo seguidor distinto del usado en los datos originales, manteniendo el comportamiento previo mediante replay.
- Emisión directa de comandos articulares (el planificador no genera acciones, solo selecciona etapa y fin).
- No dispone de tool calling, razonamiento multi-paso simbólico, capacidades multimodales de chat, audio ni generación de texto libre. Es una política de control, no un asistente conversacional.
- Capacidades multilingües: no disponibles; los prompts están en inglés.

## Casos de uso

- Sustitución de hardware en un montaje existente: cuando el brazo seguidor se rompe o se reemplaza, el flujo replay + demostraciones nuevas permite recuperar la política en 1.500 pasos y una sola GPU, en lugar de regrabar todo el conjunto de datos.
- Automatización de una celda de demostración tipo Robot Pizza Cup: la política ejecuta las etapas de queso (7 posiciones) y salami (6 posiciones) mediante el planificador, útil para ferias, docencia o validación de montajes.
- Investigación en aprendizaje por imitación con pocos datos: sirve como ejemplo reproducible de sobremuestreo de una única demostración segmentada en etapas (1 demo de queso convertida en 7 etapas ×8).
- Ajuste fino sobre SmolVLA: al mantener el VLM congelado, es un punto de partida barato para experimentar con nuevos objetos o nuevas cinemáticas sin reentrenar la percepción.
- Evaluación de estrategias anti-olvido: los 182 episodios de replay permiten estudiar empíricamente la mezcla entre datos antiguos y nuevos en políticas robóticas.
- Docencia y reproducción de pipelines LeRobot: el modelo documenta el ciclo completo (grabación, segmentación por etapas, mezcla de datos, entrenamiento y despliegue con `SmolVLAPolicy.from_pretrained`).
- Pruebas de integración de un planificador externo: útil para medir cómo de bien una política sigue instrucciones de etapa cuando el texto lo genera otro componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de entrenamiento final (0,077), que no es comparable entre modelos ni constituye una evaluación de éxito de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB en fp32 (450 millones de parámetros) y aproximadamente 1 GB en fp16/bf16, sin contar buffers de imagen ni el runtime; cifra estimada, no publicada por el autor.
- Entrenamiento observado: 1× RTX PRO 6000, 1.500 pasos, batch 64, VLM congelado.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4090) es suficiente para inferencia; para reentrenar el experto de acciones conviene una GPU de 24 GB o superior.
- Cabe en GPU consumer: sí, con margen amplio en el caso de inferencia.
- Opciones de despliegue: runtime de LeRobot/`smolvla_py` mediante `SmolVLAPolicy.from_pretrained(<dir>)`, junto con el planificador `planner.py`. vLLM, TGI o llama.cpp no son aplicables: es una política de control con salida de acciones, no un modelo de generación de texto.
- Latencia y throughput: no disponibles. Depende del hardware, de la frecuencia de control del robot y del VLM congelado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observaciones | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 4-iredium-line-newarmA | 450.046.176 | no disponible | Extender queso y colocar salami (brazo de reemplazo) | no disponible | HuggingFace, 0 descargas |
| lerobot/smolvla_base | no disponible en esta ficha (misma familia, ~450 M) | no disponible | Política VLA generalista para manipulación | no disponible | HuggingFace (modelo base) |
| 4-iredium-line-modelA | no disponible | no disponible | Misma tarea, brazo original | no disponible | Referenciado en la model card; no verificado |
| Políticas tipo ACT / Diffusion Policy de LeRobot | no disponible | no disponible | Manipulación por imitación | no disponible | Ecosistema LeRobot |

No se dispone de datos verificados de otros modelos VLA comparables (por ejemplo, familias π0 o RT-2) en la información proporcionada, por lo que no se incluyen cifras que no se puedan contrastar.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Modelo de una sola tarea y un solo robot: la política está ajustada a un brazo seguidor concreto y a la maqueta de pizza; no generaliza a otras cinemáticas ni objetos.
- Dependencia del planificador: la selección de etapa y la bandera de finalización vienen de código externo (`planner.py`); un fallo del planificador invalida la secuencia aunque la política sea correcta.
- Riesgo de sobreajuste a las demostraciones nuevas: la etapa de queso se construyó a partir de una única demostración segmentada en 7 etapas y replicada ×8, lo que reduce la variabilidad cubierta.
- Sesgo de entorno y de iluminación: al no publicarse la composición visual del dataset, se desconoce la robustez ante cambios de cámara, fondo o iluminación.
- Errores acumulativos típicos de imitación: pequeñas desviaciones pueden sacar al robot de la distribución de estados vista en entrenamiento; no hay evaluación publicada de tasa de éxito ni de recuperación.
- Sin datos de seguridad: no se documentan límites de par, paradas de emergencia ni comportamientos ante fallos, algo imprescindible en un robot físico.
- Idiomas: prompts en inglés; no hay evidencia de que el modelo responda a instrucciones en castellano.
- Repositorio sin tracción (0 descargas, 0 likes) y con fecha de creación muy reciente; no hay validación externa independiente.
- La búsqueda web realizada no devolvió documentación técnica sobre este modelo: los resultados obtenidos eran contenidos sobre webcams de Niza, sin relación alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ragmishra108/4-iredium-line-newarmA
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio LeRobot (runtime y ecosistema SmolVLA): https://github.com/huggingface/lerobot
- Paper de SmolVLA (referencia de la arquitectura base): https://arxiv.org/abs/2506.01844
- Repositorios y demos adicionales del autor: no disponibles en la información proporcionada.
- Nota: la búsqueda web no devolvió enlaces relevantes sobre este modelo; los resultados eran páginas de webcams de Niza sin relación con el contenido.
