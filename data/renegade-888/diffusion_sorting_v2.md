# Renegade-888/diffusion_sorting_v2

## Resumen

`Renegade-888/diffusion_sorting_v2` es una política de control visuomotor basada en Diffusion Policy, publicada por el usuario Renegade-888 y entrenada con el framework LeRobot de Hugging Face. El modelo trata el control motor como un proceso generativo de difusión: en lugar de predecir una única acción, genera trayectorias de acción multimuestral suavizadas, lo que resulta especialmente adecuado para tareas de manipulación con contacto rico.

El artefacto tiene 266.623.358 parámetros y un repositorio de 1,1 GB, con pesos en formato safetensors. Se distribuye bajo licencia Apache-2.0 y está asociado al dataset `Renegade-888/so101-sorting-v2`, lo que apunta a una tarea de clasificación o selección de objetos sobre un brazo robótico de la familia SO-101 (los ejemplos de la model card usan `so100_follower`). Se trata de un modelo de robótica, no de un modelo de lenguaje: no procesa ni genera texto.

Su relevancia es la de un ejemplo reproducible de política de difusión lista para entrenar, evaluar y afinar dentro del ecosistema LeRobot. No obstante, el repositorio presenta cero descargas y cero likes, no publica métricas de evaluación ni detalles del entrenamiento (número de demostraciones, horizonte de observación o de predicción), por lo que debe considerarse un punto de partida experimental antes que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión para control visuomotor (Diffusion Policy, arXiv:2303.04137); implementación de LeRobot |
| Parámetros totales | 266.623.358 (≈266,6 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; no aplica en el sentido de un LLM. El equivalente sería el horizonte de observación y de predicción (`n_obs_steps` / `n_action_steps`), no especificado en la información disponible |
| Tipos de cuantización | No disponible; el repositorio distribuye safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | No aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 1,1 GB) |
| Tipo de modelo | Política de imitación (imitation learning) para robótica |
| Pipeline declarado | robotics |
| Librería | lerobot |
| Dataset de entrenamiento | `Renegade-888/so101-sorting-v2` |
| Robot objetivo | Brazo SO-101 / SO-100 follower (según los ejemplos de la model card) |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según el repositorio) | 2026-09-13 |
| Fecha de actualización (según el repositorio) | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura sigue el planteamiento de Diffusion Policy: un modelo generativo que aprende la distribución de secuencias de acciones condicionada por observaciones visuales y propioceptivas. En la inferencia se parte de ruido y se aplican varios pasos de denoising hasta obtener una trayectoria de acción completa y coherente, lo que produce movimientos suaves y multimuestrales en lugar de acciones puntuales. Este diseño es el que permite abordar tareas de manipulación con contacto rico, donde pequeñas variaciones en la trayectoria determinan el éxito. El modelo se ha entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación.

La información disponible no detalla la composición del dataset (número de episodios, cámaras usadas, frecuencia de control, resolución de imagen), ni el número de pasos de entrenamiento, ni si se emplearon técnicas de refinamiento posteriores como RLHF o DPO (que, por otra parte, no son habituales en este tipo de políticas). Tampoco se especifican hiperparámetros de la difusión, como el número de pasos de denoising o el scheduler empleado. Un detalle técnico reseñable es que el bloque de ejemplo de la model card usa `--policy.type=act` para el entrenamiento, lo que corresponde a la política ACT y no a una política de difusión; se trata presumiblemente de una plantilla genérica de LeRobot no adaptada al modelo publicado y conviene verificarlo antes de reentrenar.

## Capacidades

- Generación de trayectorias de acción multimuestrales a partir de observaciones visuales y del estado del robot, con salidas suavizadas gracias al proceso de difusión.
- Manipulación con contacto rico: el caso de uso declarado por la librería para Diffusion Policy es el de tareas donde el contacto físico entre objetos y efector es crítico.
- Tarea específica de sorting o clasificación de objetos, derivada del dataset `so101-sorting-v2` asociado al modelo.
- Aprendizaje por imitación: reproduce la distribución de comportamiento de las demostraciones del dataset con el que se ha entrenado.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje y no expone API de herramientas.
- No soporta agentes ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües: no procesa texto en ningún idioma.
- No incorpora modo de razonamiento (thinking mode), visión para descripción de imágenes, audio ni ninguna capacidad multimodal de tipo VLM.

## Casos de uso

- Clasificación y selección de objetos (sorting) en línea de montaje o célula de trabajo: es la tarea para la que se ha entrenado, según el dataset `so101-sorting-v2`, y permite automatizar la separación de piezas por tipo, color o forma sobre un brazo SO-101.
- Pick-and-place en almacén o laboratorio: la política genera trayectorias completas de aproximación, agarre y depósito, lo que reduce el número de decisiones discretas necesarias frente a un controlador por pasos.
- Tareas de ensamblaje con tolerancias ajustadas (inserción de conectores, encaje de piezas, atornillado guiado): la naturaleza generativa de la difusión produce movimientos suaves que absorben pequeñas variaciones de posición mejor que una política determinista.
- Base de referencia (baseline) en investigación sobre aprendizaje por imitación: permite comparar Diffusion Policy frente a ACT u otras políticas de LeRobot sobre el mismo dataset y el mismo robot.
- Punto de partida para fine-tuning con datos propios: al estar bajo Apache-2.0 y en formato safetensors integrable con LeRobot, se puede reentrenar con demostraciones capturadas mediante teleoperación en un banco de pruebas distinto.
- Evaluación de robustez frente a cambios de iluminación, posición inicial o fondo: al ser un checkpoint reproducible con comandos documentados (`lerobot-record`), sirve para medir la degradación de la política antes de invertir en más datos.
- Demostraciones educativas de robótica e IA: el flujo completo de entrenamiento, evaluación y registro de episodios está documentado en LeRobot, lo que facilita reproducir el pipeline en un curso o taller.
- Prototipado rápido de células robotizadas de bajo coste: al ejecutarse sobre la familia SO-100/SO-101, encaja en montajes de hardware económico frente a brazos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de tasa de éxito, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas, y cuenta con cero descargas y cero likes, por lo que tampoco existen datos de uso que permitan inferir su rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 266,6 M de parámetros ocupan aproximadamente 1,07 GB en FP32 y 0,53 GB en FP16/BF16 solo en pesos; sumando activaciones y buffers, la inferencia debería caber en GPUs con 4-8 GB de VRAM. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Para inferencia en tiempo real son suficientes GPUs consumer de gama media (por ejemplo, RTX 3060 o superior); para entrenamiento, LeRobot soporta `--policy.device=cuda` y en la práctica se emplean GPUs con 12-24 GB (RTX 3090/4090, A100, H100) en función del tamaño de lote y de la resolución de imagen.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial ni requisitos mínimos publicados.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` para inferencia y `--robot.type=so100_follower` en el ejemplo de la model card) y PyTorch en general. vLLM, TGI, llama.cpp y Ollama no aplican, ya que no es un modelo de lenguaje y no existen variantes GGUF.
- Hardware robótico necesario: brazo SO-101 (o SO-100 follower, según el ejemplo documentado) y las cámaras utilizadas durante la grabación del dataset; la política no funcionará sobre otra morfología sin reentrenamiento.
- Latencia y throughput: no disponibles. Cabe señalar que una política de difusión ejecuta varios pasos de denoising por cada acción o bloque de acciones, por lo que su coste por inferencia es varias veces superior al de un único forward pass de un modelo del mismo tamaño.

## Comparativa con modelos similares

Los datos de los modelos alternativos no están disponibles en la información proporcionada; la comparación se limita a lo que puede afirmarse con lo documentado.

| Modelo | Tipo de política | Parámetros | Contexto / horizonte | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Renegade-888/diffusion_sorting_v2 | Diffusion Policy (LeRobot) | 266,6 M | No disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) | No |
| ACT (política de LeRobot) | Action Chunking Transformer | No disponible | No disponible | No disponible en la información | Referenciado en la propia model card como `--policy.type=act` | No |
| Diffusion Policy original (Chi et al., 2023) | Diffusion Policy (implementación de referencia) | No disponible | No disponible | No disponible | Paper en arXiv:2303.04137; repositorio no incluido en la información | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones en lenguaje natural, no soporta tool calling ni agentes. Cualquier expectativa de ese tipo es incorrecta.
- Riesgo de fallo fuera de distribución: como política de imitación, si las condiciones de cámara, iluminación, fondo o posición inicial difieren de las del dataset de entrenamiento, la tasa de éxito puede desplomarse. No hay datos publicados que cuantifiquen esta degradación.
- No se documentan métricas de evaluación, número de episodios ni tasa de éxito, por lo que no es posible estimar su fiabilidad antes de desplegarlo.
- Dependencia fuerte del hardware: la política está entrenada para la morfología SO-101/SO-100 y un montaje concreto de cámaras; no es transferible a otro robot sin fine-tuning.
- La fecha de creación indicada por el repositorio (2026-09-13) es posterior a la fecha de consulta habitual, lo que sugiere un error de metadatos o un reloj mal configurado; conviene tratarla con cautela.
- Discrepancia en la documentación: el bloque de entrenamiento de la model card emplea `--policy.type=act`, que corresponde a otra política; hay que confirmar la configuración exacta usada para este checkpoint antes de reproducir el entrenamiento.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados. La licencia del dataset `Renegade-888/so101-sorting-v2` no se especifica en la información disponible y debe verificarse por separado.
- El término "alucinación" no aplica en sentido estricto, pero sí existe un fenómeno análogo: la política puede generar trayectorias plausibles pero físicamente inviables o colisiones si se le presentan observaciones alejadas de la distribución de entrenamiento.
- Sin variantes cuantizadas ni soporte GGUF/llama.cpp, las opciones de optimización para despliegue en hardware muy limitado son escasas más allá del uso de FP16/BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renegade-888/diffusion_sorting_v2
- Dataset asociado: https://huggingface.co/datasets/Renegade-888/so101-sorting-v2
- Paper de Diffusion Policy (arXiv:2303.04137): https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre Diffusion Policy; los enlaces anteriores proceden de la información del repositorio y de su model card.
