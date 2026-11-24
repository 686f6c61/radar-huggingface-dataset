# nhmacwan/fanpose_main_part_1_interact

## Resumen

`interact` es una política robótica (policy) entrenada con LeRobot, el framework de aprendizaje por imitación de Hugging Face, y publicada en el Hub por el usuario `nhmacwan`. No se trata de un modelo de lenguaje: es un modelo de control visuomotor entrenado sobre el dataset `nhmacwan/lerobot_fanpose_main_part_1`, orientado a la manipulación robótica mediante imitación de demostraciones. Su pipeline declarado en el Hub es `robotics` y su única dependencia de ejecución es la librería `lerobot`.

El repositorio contiene un checkpoint de aproximadamente 90,3 millones de parámetros (90.285.516 según los pesos en safetensors) con un tamaño de 0,4 GB, lo que lo sitúa en el rango de políticas de manipulación tipo ACT (Action Chunking Transformer). La model card no especifica el tipo de política ni la arquitectura, y conserva el texto por defecto de la plantilla de LeRobot ("Model type not recognized"), por lo que la mayor parte de los detalles técnicos no están documentados por el autor.

Su relevancia es acotada: se publica bajo licencia Apache 2.0, lo que facilita su reutilización y fine-tuning, pero con cero descargas y cero likes en el momento de la consulta y sin documentación técnica sustantiva. Es un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de imitación LeRobot; la model card no especifica el tipo, presumiblemente ACT por el comando de entrenamiento de ejemplo) |
| Parametros totales | 90.285.516 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política visuomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. El comando de entrenamiento de ejemplo de la model card utiliza `--policy.type=act`, lo que sugiere que el checkpoint sigue el paradigma Action Chunking Transformer: un codificador visual (típicamente ResNet preentrenado) que procesa imágenes de cámara, un codificador de estado proprioceptivo y un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales. Sin embargo, el autor no confirma explícitamente este extremo, por lo que debe tratarse como una inferencia a partir de la plantilla y no como un dato verificado.

El entrenamiento se realizó con LeRobot sobre el dataset `nhmacwan/lerobot_fanpose_main_part_1`, cuyo contenido (número de episodios, tareas, frecuencia de control, número de cámaras) no está documentado en la información proporcionada. No hay mención a RLHF, DPO ni a ningún proceso de ajuste posterior; las políticas de imitación de LeRobot se entrenan típicamente con pérdida L1 sobre las acciones demostradas. No se dispone de datos sobre número de tokens, composición del dataset ni innovaciones técnicas destacables.

## Capacidades

- Control visuomotor robótico por imitación: genera comandos de acción a partir de observaciones visuales y de estado del robot.
- Ejecución de tareas de manipulación aprendidas del dataset `lerobot_fanpose_main_part_1` (la naturaleza exacta de la tarea "fanpose" no está documentada).
- Compatibilidad con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y despliegue sobre robots tipo `so100_follower` según los ejemplos de la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, visión general, audio) más allá del procesamiento de imágenes propio de una política visuomotora.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como checkpoint de referencia o punto de partida para comparar variantes de políticas ACT sobre el mismo dataset.
- Fine-tuning sobre un robot SO-100/SO-101: el ejemplo de la model card apunta a `so100_follower`, por lo que puede adaptarse a tareas de manipulación con ese hardware mediante reentrenamiento con `lerobot-train`.
- Reproducción de experimentos: al estar el dataset asociado publicado en el Hub, permite reproducir el pipeline de entrenamiento y evaluar la variabilidad entre ejecuciones.
- Evaluación de robustez visuomotora: útil para medir cómo se degrada la política ante cambios de iluminación, posición de cámara o fondo, al no haber sido entrenada con aumentos documentados.
- Benchmark interno de políticas: con 90 M de parámetros y 0,4 GB, es un candidato ligero para comparar latencia y tasa de éxito frente a políticas más grandes en el mismo banco de pruebas.
- Prototipado académico en robótica de bajo coste: su licencia Apache 2.0 y su tamaño reducido permiten desplegarlo en estaciones de trabajo con una sola GPU consumer para experimentos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor; con 90,3 M de parámetros en precisión completa (FP32) los pesos ocupan aproximadamente 0,36 GB, y en FP16 unos 0,18 GB, a lo que hay que sumar el codificador visual y los buffers de activación.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la política, pero no hay confirmación del autor.
- GPU consumer: previsiblemente cabe en tarjetas como RTX 3060, RTX 4060 o superiores, aunque este extremo no está verificado en la información proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), tal como indica la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `nhmacwan/fanpose_main_part_1_interact` | 90,3 M | no aplica | Apache 2.0 | Hub de Hugging Face, 0 descargas | Sin documentación técnica |
| Políticas ACT de referencia de LeRobot | variable (decenas de millones) | no aplica | Apache 2.0 | Hub de Hugging Face y repositorio LeRobot | Documentación y ejemplos oficiales |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | Apache 2.0 | Hub de Hugging Face y repositorio LeRobot | Alternativa generativa a ACT |

No se dispone de datos de rendimiento del modelo comparado con estas alternativas, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación inexistente: la model card conserva la plantilla por defecto y no especifica arquitectura, tipo de política, tarea, número de episodios ni frecuencia de control.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos de distribución (posiciones, objetos, iluminación) que la política haya podido aprender.
- Riesgo de fallo fuera de distribución: como toda política de imitación, su comportamiento ante escenarios no representados en las demostraciones es impredecible; no hay métricas de tasa de éxito publicadas.
- Sin soporte de lenguaje: no puede usarse para tareas de generación de texto, razonamiento, código ni atención al cliente.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el dataset asociado puede tener condiciones propias que no se detallan en la información disponible.
- Caveat para producción: con cero descargas y sin validación externa, no hay evidencia de que el checkpoint sea funcional; se recomienda evaluarlo con `lerobot-record` antes de cualquier uso.
- Sin cuantizaciones publicadas: no hay variantes GGUF, INT8 ni ONNX que faciliten el despliegue en hardware embebido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nhmacwan/fanpose_main_part_1_interact
- Dataset asociado: https://huggingface.co/datasets/nhmacwan/lerobot_fanpose_main_part_1
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
