# iFaz/eqm-aloha_transfer_cube-seed3-18sep2026_1pm

## Resumen

El modelo `iFaz/eqm-aloha_transfer_cube-seed3-18sep2026_1pm` es una política de robótica (robotics policy) entrenada con la librería LeRobot de Hugging Face y publicada en el Hub por el usuario iFaz. Se trata de un checkpoint de aprendizaje por imitación destinado al entorno simulado ALOHA `lerobot/aloha_sim_transfer_cube_human`, es decir, a la tarea de transferencia de un cubo con un manipulador bimanual ALOHA. El identificador del repositorio indica una ejecución concreta: política de tipo `eqm`, tarea `transfer_cube`, semilla 3 y marca temporal de entrenamiento del 18 de septiembre de 2026 a la 13:00.

Con 18.701.190 parámetros reales (según los pesos en safetensors) y un tamaño de repositorio de 0,1 GB, es un modelo muy compacto, orientado a control de bajo nivel más que a generación de lenguaje. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones (imágenes de cámaras y estado de las articulaciones) a acciones motoras. Su relevancia es acotada: se trata de un artefacto de investigación reproducible (una semilla concreta de un experimento), con cero descargas y cero "likes" en el momento de la consulta, y con una model card generada automáticamente por LeRobot que no documenta la arquitectura ni el procedimiento de entrenamiento.

La información disponible es insuficiente para caracterizar el modelo en detalle: la propia model card indica "Model type not recognized — please update this template", y los resultados de búsqueda web devueltos no guardan ninguna relación con el modelo (corresponden a noticias de UniCredit Bank Austria). Por tanto, buena parte de las especificaciones se marcan como "no disponibles" en lugar de inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el tag y el `model_name` "eqm" apuntan a una política de tipo EQM, sin confirmación documental) |
| Parametros totales | 18.701.190 (dato real leído de los pesos safetensors) |
| Parametros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual; horizonte de observación y chunk de acciones no disponibles |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible / no aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | `lerobot/aloha_sim_transfer_cube_human` |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación / actualización | 2026-09-18T13:15:59Z / 2026-09-18T13:16:04Z |

## Arquitectura y entrenamiento

No se dispone de descripción arquitectónica por parte del autor. La model card es la plantilla automática que LeRobot genera al subir una política y contiene el aviso explícito de que el tipo de modelo no ha sido reconocido. El comando de entrenamiento que aparece en la plantilla (`--policy.type=act`) es genérico y no permite concluir que este checkpoint sea una política ACT; el nombre del modelo y la etiqueta `eqm` sugieren una política distinta, pero no hay documentación que lo confirme. El recuento de 18,7 millones de parámetros es coherente con una política de manipulación compacta (codificador visual convolucional o ViT pequeño más un cabezal de predicción de acciones), aunque esto es una inferencia y no un dato declarado.

Respecto al entrenamiento, lo único verificable es el dataset: `lerobot/aloha_sim_transfer_cube_human`, una colección de demostraciones humanas teleoperadas en el simulador ALOHA para la tarea de transferir un cubo entre efectores. El sufijo `seed3` del identificador indica que se fijó la semilla 3, y el sufijo temporal (`18sep2026_1pm`) sugiere que se trata de una ejecución fechada dentro de una campaña de experimentos con múltiples semillas. No se documentan número de tokens, número de episodios, composición del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning posterior. Tampoco se describen innovaciones técnicas (decodificación especulativa, atención lineal, acción chunking explícito, etc.).

## Capacidades

- Control motor por imitación: genera comandos de acción para un manipulador bimanual ALOHA en la tarea concreta de transferencia de cubo en simulación.
- Aprendizaje por imitación a partir de demostraciones humanas: la política se ha entrenado sobre el dataset `aloha_sim_transfer_cube_human`, no mediante recompensa explícita.
- Entrada multimodal (previsiblemente): observaciones visuales de cámaras del entorno más el estado de las articulaciones o del efector; no confirmado en la documentación.
- Integración nativa con LeRobot: se puede cargar con `lerobot-record --policy.path=...` y evaluar directamente en el simulador.
- Tool calling / function calling: no disponible (no aplica a un modelo de robótica de este tipo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles; el pipeline declarado es exclusivamente `robotics`.
- Reproducibilidad experimental: al estar etiquetado con semilla y fecha, sirve como réplica de un punto concreto de un barrido de experimentos.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: cargar el checkpoint con `--policy.path` en LeRobot y replicar los resultados de la semilla 3 para la tarea `transfer_cube`, comparando con las otras semillas de la misma campaña.
- Evaluación comparativa de políticas en simulación ALOHA: usar este checkpoint como línea base de 18,7 M de parámetros frente a otras políticas (ACT, Diffusion Policy, SmolVLA) sobre el mismo dataset, midiendo tasa de éxito por episodio con `lerobot-record --episodes=10`.
- Depuración de pipelines de entrenamiento: al ser un artefacto pequeño (0,1 GB) y con metadatos claros de semilla y fecha, es útil para verificar que un entorno de entrenamiento o de evaluación de LeRobot funciona de extremo a extremo antes de lanzar trabajos mayores.
- Docencia y formación en robótica: sirve para ilustrar el flujo completo de LeRobot (entrenamiento, publicación en el Hub, evaluación en simulador) con un modelo que se descarga y se ejecuta en cuestión de segundos.
- Investigación sobre sensibilidad a la semilla: comparar este checkpoint con los de otras semillas del mismo protocolo permite estimar la varianza del rendimiento y decidir cuántas semillas hacen falta por configuración.
- Pruebas de infraestructura de inferencia robótica: validar latencias de un bucle de control que carga la política y ejecuta el simulador, dado que el modelo cabe holgadamente en memoria y el cuello de botella estará en la simulación, no en el modelo.
- Punto de partida para fine-tuning: aunque no está documentado como tal, un checkpoint de 18,7 M de parámetros con licencia Apache 2.0 es un candidato razonable para ajuste posterior en tareas de manipulación relacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tasas de éxito, curvas de aprendizaje ni comparaciones con otras políticas. El único procedimiento de evaluación sugerido es el genérico de LeRobot (`lerobot-record --episodes=10`), sin resultados reportados. Los resultados de la búsqueda web proporcionada no contienen ningún dato sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 75 MB solo para los pesos (18,7 M de parámetros); en FP16/BF16, unos 37 MB. Con buffers de activaciones, el consumo real dependerá sobre todo de la resolución de las cámaras de entrada y del tamaño de lote.
- GPU recomendadas: prácticamente cualquier GPU moderna sirve; no se requiere una A100 ni una H100. Una NVIDIA RTX 3060, RTX 4090 o incluso una GPU integrada reciente son suficientes para el modelo en sí.
- Viabilidad en GPU de consumo: sí, con enorme margen. El modelo cabe en cualquier GPU de consumo de los últimos diez años y también puede ejecutarse en CPU, dado su tamaño reducido.
- Opciones de despliegue: la vía documentada es LeRobot (`lerobot-record` para evaluación e inferencia, `lerobot-train` para reentrenamiento). No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo. El despliegue típico es un bucle de control en Python sobre el simulador o el robot.
- Latencia y throughput estimados: no disponibles. En un modelo de este tamaño, el coste dominante en la práctica será el renderizado del simulador y la captura de imágenes, no el forward pass.

## Comparativa con modelos similares

La información disponible no permite una comparativa cuantitativa fiable, ya que no hay métricas publicadas para este checkpoint. A continuación se comparan categorías y datos declarados, marcando como no disponible todo lo que no se puede verificar.

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| eqm-aloha_transfer_cube-seed3 (este modelo) | 18.701.190 | Manipulación ALOHA sim, transferencia de cubo | Apache 2.0 | Hugging Face (`iFaz`), 0 descargas | No disponible |
| ACT (Action Chunking Transformer, LeRobot) | No disponible en la información proporcionada | Manipulación ALOHA, tareas diversas | Apache 2.0 (LeRobot) | Hugging Face / GitHub LeRobot | No disponible |
| Diffusion Policy (LeRobot) | No disponible en la información proporcionada | Manipulación, políticas generativas por difusión | Apache 2.0 (LeRobot) | Hugging Face / GitHub LeRobot | No disponible |
| SmolVLA (Hugging Face) | No disponible en la información proporcionada | Política visión-lenguaje-acción, multi-tarea | No disponible en la información proporcionada | Hugging Face | No disponible |

Nota: las filas de ACT, Diffusion Policy y SmolVLA se incluyen únicamente como referencias de la misma categoría (políticas de manipulación integradas en LeRobot); no se dispone aquí de sus recuentos de parámetros ni de resultados comparables, por lo que no debe interpretarse ningún orden de mérito.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al entrenarse sobre demostraciones humanas de una única tarea en simulación, cabe esperar un sesgo hacia las trayectorias y condiciones presentes en el dataset, pero no hay análisis publicado.
- Riesgo de alucinación: no aplica en el sentido lingüístico; el riesgo equivalente es la generación de acciones erráticas o fuera de distribución cuando el estado observado se aleja de las demostraciones.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje. Su "alcance" está restringido a la tarea `transfer_cube` del dataset `aloha_sim_transfer_cube_human`; no hay evidencia de generalización a otras tareas, objetos o entornos.
- Generalización sim-to-real: no documentada. El entrenamiento es en simulación, y no se declara ningún mecanismo de aleatorización de dominio ni validación en hardware real.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con conservación del aviso de licencia y del archivo NOTICE si aplica. Es una de las licencias más permisivas, sin cláusulas de uso aceptable adicionales.
- Caveats para producción: el repositorio tiene 0 descargas y 0 "likes", es un artefacto de investigación reciente (creado y actualizado el 18 de septiembre de 2026 con cinco segundos de diferencia) y su model card no está completada. No hay garantía de mantenimiento, ni de versionado, ni de que la semilla 3 sea representativa del rendimiento del método.
- Ausencia de documentación: la propia plantilla advierte de que el tipo de modelo no se reconoce, por lo que faltan arquitectura, hiperparámetros y protocolo de evaluación. Cualquier uso serio requiere inspeccionar el código y el checkpoint directamente.
- Resultados de búsqueda irrelevantes: las búsquedas web asociadas devuelven contenido sobre UniCredit Bank Austria, sin ninguna relación con el modelo; no aportan información utilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-18sep2026_1pm
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Enlaces adicionales relevantes encontrados en la búsqueda web: no disponible (los resultados obtenidos no guardan relación con el modelo).
