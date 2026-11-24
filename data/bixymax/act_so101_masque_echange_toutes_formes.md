# Bixymax/act_so101_masque_echange_toutes_formes

## Resumen

El modelo `act_so101_masque_echange_toutes_formes`, publicado por el usuario Bixymax en Hugging Face, es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un controlador robótico entrenado con la librería LeRobot de Hugging Face que predice secuencias cortas de acciones (chunks) en lugar de comandos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación.

El repositorio contiene pesos en formato safetensors con 51.668.614 parámetros (aproximadamente 51,7 millones) y un tamaño total de 0,2 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en hardware modesto. El nombre sugiere un entrenamiento sobre el robot SO-101 (variante del SO-100 de bajo coste) con un conjunto de datos denominado `so101_masque_echange_toutes_formes`, orientado presumiblemente a tareas de enmascarado e intercambio de formas.

Su relevancia radica en que ejemplifica el flujo actual de robótica open source: entrenamiento reproducible con LeRobot, publicación en el Hub y despliegue directo en robots de sobremesa. La licencia Apache 2.0 facilita su reutilización comercial, aunque el modelo tiene cero descargas y cero likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control robótico, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; LeRobot no documenta cuantizaciones en esta ficha) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en cada paso de inferencia el modelo emite un bloque de k acciones futuras en lugar de una sola, lo que mitiga el problema de acumulación de errores típico de las políticas paso a paso. La arquitectura incorpora habitualmente un codificador de imágenes (típicamente ResNet) para las observaciones visuales y un decodificador transformer con query tokens aprendidos que generan las acciones; el paper original también introduce el uso de posiciones objetivo (target positions) para mejorar la precisión en tareas de manipulación fina.

El entrenamiento se realizó con LeRobot sobre el dataset `Bixymax/so101_masque_echange_toutes_formes`, compuesto por demostraciones teleoperadas. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens de entrenamiento (concepto no aplicable a políticas de control) ni sobre si se aplicaron técnicas de aumento de datos o regularización específicas. El modelo se entrenó para el robot SO-101, según indica el identificador del repositorio.

## Capacidades

- Control robótico por imitación: genera comandos de acción para un robot manipulador de sobremesa de la familia SO-100/SO-101.
- Predicción por chunks de acciones, que aporta suavidad y estabilidad en secuencias de movimiento.
- Procesamiento de observaciones visuales mediante codificador de imágenes integrado en la arquitectura ACT.
- Ejecución de tareas de manipulación aprendidas del dataset de entrenamiento (presumiblemente enmascarado e intercambio de formas, según el nombre del dataset).
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y carga directa desde el Hub.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede ejecutar secuencias de agarre y colocación de piezas sobre un SO-101, aprovechando la predicción por chunks para mantener trayectorias suaves y reducir oscilaciones en el efector final.
- Manipulación de formas geométricas en entornos educativos: adecuado para demostraciones docentes de aprendizaje por imitación, ya que el dataset sugiere tareas de enmascarado e intercambio de formas que pueden reproducirse en aulas con robots de bajo coste.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para fine-tuning con datos propios del usuario mediante `lerobot-train`, gracias a sus 51,7 M de parámetros y su licencia permisiva.
- Investigación en aprendizaje por imitación: útil como baseline reproducible para comparar variantes de ACT, aumentos de datos o esquemas de chunking en publicaciones académicas.
- Despliegue en hardware de bajo presupuesto: al ocupar 0,2 GB, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superiores) o incluso en CPU para inferencia de baja frecuencia, lo que abarata la experimentación.
- Integración en pipelines de evaluación automatizada: el flujo `lerobot-record` permite lanzar episodios de evaluación con el modelo y recoger métricas de éxito de forma sistemática en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, curvas de aprendizaje ni comparaciones con otras políticas, y el repositorio no registra descargas ni validación comunitaria que permita inferir rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros equivalen a unos 207 MB en FP32 y unos 103 MB en FP16), más el consumo del codificador visual y del buffer de observaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha documentado el uso de CUDA con `--policy.device=cuda`, y tarjetas como RTX 3060, RTX 4060, RTX 4090 o A100 funcionarían sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida; también es viable en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia y evaluación), con soporte de PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de control robótico.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU, del tamaño del chunk de acciones y de la frecuencia de control del robot SO-101.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_masque_echange_toutes_formes (este) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (paper arXiv:2304.13705) | no disponible en la ficha | no aplica | tasas de éxito altas reportadas en el paper, sin cifras en esta ficha | código de referencia público | paper y repositorio |
| Políticas LeRobot genéricas (p. ej. Diffusion Policy, TDMPC) | variable | no aplica | no disponible | variable según repositorio | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no es posible con los datos disponibles; se recomienda consultar el paper original de ACT y la documentación de LeRobot para contrastar arquitecturas y metodologías.

## Limitaciones y advertencias

- El modelo no ha sido validado por la comunidad: cero descargas y cero likes, sin evidencia externa de su rendimiento real.
- No se documentan tasas de éxito, condiciones de entrenamiento ni composición del dataset, lo que impide evaluar su robustez.
- Fuerte dependencia del dominio: una política de imitación generaliza mal fuera de las condiciones visuales y de objeto vistas durante el entrenamiento; cambios de iluminación, fondo o geometría pueden degradar el comportamiento.
- Riesgo de sobreajuste al robot y al entorno concretos del dataset `so101_masque_echange_toutes_formes`; no se garantiza transferencia a otras configuraciones de SO-101.
- No procesa lenguaje natural ni instrucciones textuales: no debe presentarse como un modelo conversacional o multimodal en el sentido de los LLM.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar la seguridad del despliegue físico en un robot real.
- No se dispone de información sobre sesgos, alucinaciones (concepto no aplicable) ni limitaciones idiomáticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bixymax/act_so101_masque_echange_toutes_formes
- Dataset de entrenamiento: https://huggingface.co/datasets/Bixymax/so101_masque_echange_toutes_formes
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
