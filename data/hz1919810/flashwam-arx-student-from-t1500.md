# hz1919810/flashwam-arx-student-from-t1500

## Resumen

Flash-WAM ARX Student es un modelo de mundo-acción (world-action) para robótica, desarrollado por el usuario hz1919810 como parte de un proceso de destilación de consistencia sobre el modelo docente LingBot-VA ARX SFT v2. El modelo está diseñado para generar tanto secuencias de video como comandos de acción conjunta a partir de observaciones de múltiples cámaras, con el objetivo de permitir un control robótico rápido y eficiente en pocos pasos de inferencia.

Se trata de un estudiante destilado con la técnica Flash-WAM, que reduce el número de pasos de muestreo de 50 a 1-2 por modalidad, manteniendo una calidad aceptable según las pérdidas finales reportadas (video: 0.3004, acción: 0.0135). El modelo se distribuye en formato diffusers con dos variantes: un objetivo EMA (recomendado para inferencia) y un estudiante online entrenable. Su relevancia radica en la posibilidad de ejecutar políticas robóticas en tiempo real con requisitos computacionales reducidos, aunque el propio autor advierte que la baja pérdida de destilación no garantiza el éxito en tareas reales.

La arquitectura se basa en un `WanTransformer3DModel` de aproximadamente 9.5 GB por variante en precisión bf16, con una ventana de atención de 30 y un perfil de video a 7.5 Hz y acción a 15 Hz. El modelo está pensado para el robot ARX Lift R5, con tres cámaras (alta, muñeca izquierda y muñeca derecha) y resolución de 256x256 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WanTransformer3DModel (diffusers) |
| Parametros totales | no disponible (archivo de ~9.5 GB en bf16 por variante) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención de 30, attn_window=30) |
| Tipos de cuantizacion | bf16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer 3D de tipo `WanTransformer3DModel` adaptado para procesar secuencias de video y generar acciones conjuntas. Se trata de un modelo de mundo-acción que recibe observaciones de tres cámaras simultáneas y produce tanto la siguiente secuencia de video como los comandos de articulación (14-D absoluto, expandido a 30-D según el layout especificado). La destilación se realizó con el método Flash-WAM, que combina consistencia de video y acción con una regularización sensible a la acción, utilizando 2 pasos DDIM por modalidad y un rango de clasificador-free guidance entre 2.0 y 10.0.

El entrenamiento de destilación duró 2000 pasos con un lote efectivo de 16 (4 GPUs con acumulación de 4), tasa de aprendizaje de 5e-6, decaimiento EMA de 0.995 y pérdida Huber con umbral 0.001. El docente fue el checkpoint paso 1500 del modelo LingBot-VA ARX SFT v2, entrenado sobre 160 episodios. No se menciona el uso de RLHF o DPO; el proceso es puramente de destilación de consistencia supervisada.

## Capacidades

- Generación de secuencias de video condicionadas a observaciones de múltiples cámaras (alta, muñeca izquierda, muñeca derecha) a 256x256 píxeles.
- Generación de comandos de acción conjunta (14-D absoluto, expandido a 30-D) a una frecuencia de 15 Hz, sincronizados con el video a 7.5 Hz.
- Inferencia rápida con 1-2 pasos por modalidad gracias a la destilación de consistencia.
- Soporte para control robótico de tipo ARX Lift R5, con perfil de datos K2 (`video_7p5hz_action_15hz_k2`).
- Capacidad de procesamiento multi-cámara y fusión de información visual para la toma de decisiones.
- No se especifican capacidades de lenguaje natural, tool calling ni agentes; el modelo es puramente visual-motor.

## Casos de uso

- Control de brazo robótico en tiempo real: el modelo puede generar comandos de articulación a 15 Hz a partir de las cámaras, permitiendo un bucle de control de baja latencia para tareas de manipulación como agarre o traslado de objetos.
- Simulación de políticas robóticas: al generar video y acción conjuntamente, puede usarse como modelo de mundo para entrenar o evaluar políticas en entornos simulados antes del despliegue físico.
- Teleoperación asistida: el modelo puede predecir la siguiente acción y el video resultante, ayudando a un operador humano a visualizar el resultado esperado antes de ejecutar el movimiento.
- Aprendizaje por imitación: dado un conjunto de demostraciones, el modelo puede ser utilizado para generar nuevas trayectorias de acción y video, aumentando el conjunto de datos de entrenamiento.
- Planificación de movimientos multi-paso: aunque la destilación reduce la fidelidad en rollouts largos, el modelo puede emplearse para planificación a corto plazo con 1-2 pasos de inferencia.
- Investigación en destilación de modelos de mundo: sirve como referencia para estudiar la transferencia de conocimiento de un docente grande a un estudiante rápido, y para analizar el equilibrio entre velocidad y precisión en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta las pérdidas finales de destilación (video: 0.3004, acción: 0.0135), pero no hay métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~9.5 GB en bf16, se requiere al menos 12 GB de VRAM para inferencia con precisión completa; con cuantización a 8 bits podría reducirse a ~6-8 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: tarjetas con 16 GB o más, como RTX 4090, A100, H100, o GPUs de datacenter con suficiente memoria para el batch de inferencia.
- En consumer GPU: es posible ejecutarlo en una RTX 3090/4090 (24 GB) con margen para el batch y las tres cámaras.
- Opciones de despliegue: al ser un modelo diffusers, puede cargarse con la librería `diffusers` y ejecutarse en frameworks como PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos, pero la destilación a 1-2 pasos sugiere una inferencia significativamente más rápida que el docente (50 pasos), aunque el procesamiento de video multi-cámara añade carga computacional.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de mundo-acción para robótica con destilación de consistencia). No se puede establecer una comparativa fiable con los datos proporcionados.

## Limitaciones y advertencias

- El autor advierte explícitamente que la baja pérdida de destilación no garantiza la fidelidad en rollouts multi-paso ni el éxito en tareas con robots reales; es necesario evaluar con simulaciones o en el robot antes de cualquier despliegue.
- La selección entre la variante EMA (target) y la online (student) es responsabilidad del usuario final; no hay una recomendación clara.
- La licencia es "other" y no se especifican los términos exactos; se debe contactar con el autor para aclarar los derechos de uso comercial.
- No se proporcionan datos sobre sesgos, pero al ser un modelo entrenado en un conjunto de datos específico de robótica (160 episodios), puede tener un rendimiento limitado fuera de ese dominio.
- El modelo solo soporta el perfil de datos K2 y el layout de articulaciones especificado; no es directamente transferible a otros robots sin adaptación.
- No se han publicado resultados de benchmarks ni evaluaciones independientes, por lo que su rendimiento real en tareas del mundo real es desconocido.

## Enlaces

- [HuggingFace - hz1919810/flashwam-arx-student-from-t1500](https://huggingface.co/hz1919810/flashwam-arx-student-from-t1500)
