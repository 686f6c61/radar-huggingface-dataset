# Nole326/LeIsaac-SO101-PickOrange

## Resumen

LeIsaac-SO101-PickOrange es un modelo de robótica publicado en Hugging Face por el usuario Nole326 bajo el identificador `Nole326/LeIsaac-SO101-PickOrange`. Se trata de una política de imitación basada en ACT (Action Chunking Transformer), entrenada para la tarea de recogida de naranjas sobre la plataforma robótica SO-101, que es la variante de bajo coste del ecosistema SO-100/SO-101 de Hugging Face. El modelo se distribuye en formato safetensors con 51.596.934 parámetros y un tamaño de repositorio de 0,8 GB.

El modelo resuelve una tarea concreta de manipulación robótica mediante aprendizaje por imitación: a partir de demostraciones teleoperadas, aprende a generar secuencias de acciones articulares para que el brazo SO-101 localice y agarre una naranja. La arquitectura ACT es una elección habitual en robótica de bajo coste porque combina un codificador visual con un transformer que predice "chunks" de acciones, lo que reduce la acumulación de error frente a políticas paso a paso.

La relevancia del modelo es acotada y práctica: sirve como ejemplo reproducible de un pipeline de imitación sobre hardware accesible (SO-101) dentro del entorno de simulación LeIsaac, y como punto de partida para quien quiera replicar tareas de pick-and-place. No es un modelo de propósito general ni un LLM: es una política específica de tarea, sin datos publicados de benchmarks, idiomas ni licencia declarada, y con acceso restringido que exige aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parametros totales | 51.596.934 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea ACT (Action Chunking Transformer), una arquitectura de aprendizaje por imitación que combina un codificador visual (habitualmente un ResNet preentrenado) con un transformer encoder-decoder que predice bloques de acciones futuras en lugar de una única acción por paso. Esta formulación, introducida en el trabajo ALOHA/ACT, mitiga el error compounding típico de las políticas de imitación y permite un control más suave y estable en tareas de manipulación fina. El número de parámetros (51,6 M) es coherente con una configuración ACT de tamaño medio con backbone visual.

No se dispone de información sobre el conjunto de datos de entrenamiento (número de episodios, composición, si hubo aumento de datos o variaciones de iluminación), ni sobre el proceso de entrenamiento (número de épocas, hiperparámetros, función de pérdida). El nombre del modelo sugiere que las demostraciones se recogieron en el entorno LeIsaac, un simulador orientado a tareas de manipulación con robots SO-100/SO-101, pero este extremo no está confirmado en la información disponible.

## Capacidades

- Generación de secuencias de acciones articulares para el brazo robótico SO-101 orientadas a la tarea de recogida de naranjas (pick orange).
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere refuerzo explícito).
- Predicción de chunks de acciones, lo que aporta estabilidad temporal en la ejecución.
- Entrada visual (cámara) combinada con el estado de las articulaciones, según el diseño estándar de ACT.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No se ha documentado soporte de thinking mode, visión general, audio ni otras modalidades fuera del pipeline robótico.

## Casos de uso

- Replicación de experimentos de imitación en simulación: usar el modelo dentro del entorno LeIsaac para reproducir la tarea pick-orange y comparar curvas de éxito con otras políticas ACT entrenadas por el usuario.
- Punto de partida para fine-tuning en hardware SO-101: partir de estos pesos y reentrenar con demostraciones propias para tareas de recogida de otros objetos (frutas, piezas, herramientas) ajustando solo la cabeza de acciones.
- Docencia y formación en robótica de bajo coste: emplear el modelo como ejemplo didáctico de pipeline completo (teleoperación, entrenamiento ACT, despliegue en brazos SO-101) en cursos de robótica o máster.
- Validación de infraestructura de despliegue: probar el flujo de carga de safetensors y ejecución de políticas ACT en un stack de robótica (ROS 2, LeRobot) antes de entrenar modelos propios.
- Benchmark interno de políticas de manipulación: comparar la tasa de éxito de este modelo frente a políticas propias en la misma tarea y condiciones de iluminación y posicionamiento.
- Generación de datos sintéticos de evaluación: usar el modelo como "experto" en simulación para generar trayectorias de referencia que sirvan de baseline en experimentos de evaluación de otras políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,6 M de parámetros en safetensors (aproximadamente 200 MB en fp32), la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más; en fp16 el peso ronda los 100 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; para despliegue en robot real se suele usar una GPU integrada o una RTX 3060/4060 en el puesto de control. Para entrenamiento o evaluación en simulación a alta frecuencia, se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: el stack habitual para ACT es LeRobot (Hugging Face) con PyTorch; también es posible exportar a ONNX o TorchScript para inferencia de baja latencia en el robot. No se ha documentado soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada. En la práctica, la latencia vendrá dominada por la frecuencia de control del SO-101 y por el coste del codificador visual, no por el tamaño del transformer.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeIsaac-SO101-PickOrange | 51,6 M | Pick orange (SO-101) | no disponible | no disponible | Gated en HF |
| ACT original (ALOHA) | ~80 M (aprox.) | Manipulación bimanual | no disponible | MIT (código) | Repo público |
| Diffusion Policy | variable (10-100 M) | Manipulación general | no disponible | MIT (código) | Repo público |
| Políticas LeRobot SO-100 | variable | Tareas pick-and-place | no disponible | variable | Hub de LeRobot |

La comparación es aproximada: los modelos ACT y Diffusion Policy son arquitecturas de referencia con implementaciones públicas, mientras que este modelo es un checkpoint concreto entrenado para una tarea específica. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de tarea: solo se ha entrenado (presumiblemente) para recoger naranjas con SO-101; no generaliza a otras tareas sin reentrenamiento.
- Sin datos de entrenamiento publicados: se desconoce el número de episodios, la variabilidad de posiciones e iluminación, y por tanto el riesgo de sobreajuste al entorno de recogida de datos.
- Riesgo de fallo fuera de distribución: cambios en la posición de la cámara, el color del objeto o la iluminación pueden degradar gravemente el rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor o revisar las condiciones de acceso antes de cualquier despliegue en producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la integración automatizada en pipelines.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito ni comparación con alternativas.
- Sin idiomas ni capacidades lingüísticas: no debe evaluarse como modelo de lenguaje; los tags de idioma no aplican.
- Sesgos conocidos: no documentados; en robótica, los sesgos suelen manifestarse como preferencia por posiciones y objetos vistos en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nole326/LeIsaac-SO101-PickOrange
- LeRobot (stack de referencia para ACT y SO-100/SO-101): https://github.com/huggingface/lerobot
- Paper ACT / ALOHA: https://arxiv.org/abs/2304.13705
- SO-101 (brazo de bajo coste): https://github.com/TheRobotStudio/SO-ARM100
- LeIsaac (entorno de simulación): no disponible en la información proporcionada
