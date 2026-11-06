# nhatcm/smolvla-so101-balloon-to-tray-rgb-eef-delta

## Resumen

SmolVLA SO-101 balloon-to-tray es un checkpoint de política visión-lenguaje-acción (VLA) basado en la arquitectura SmolVLA y ajustado para una tarea robótica concreta: depositar un globo sobre una bandeja con un brazo SO-101. Lo publica el usuario nhatcm en Hugging Face bajo la librería LeRobot, con licencia no especificada y sin métricas de rendimiento publicadas. El modelo no es un LLM de propósito general: es un controlador que mapea una imagen RGB de 256x256, el estado articular de seis ejes y una instrucción de lenguaje fija a una secuencia de acciones de efector final.

El interés técnico está en su tamaño reducido (450 millones de parámetros, 0,9 GB de pesos en safetensors) y en el contrato de acción explícito: deltas de posición y rotación en marco mundial más apertura de pinza, con decodificación documentada y cotas numéricas concretas (0,004 m por unidad de traslación, 0,5 rad por unidad de rotación, pinza entre 20 y 29,08 unidades). Esto lo hace reproducible para quien quiera replicar el pipeline de LeRobot sobre un SO-101 real o simulado.

Es relevante como ejemplo de VLA pequeño y desplegable en hardware modesto, entrenado con 131 episodios y 38.732 fotogramas a 20 Hz (unas 32 minutos de demostraciones) y 20.000 actualizaciones. No obstante, la información disponible es escasa: no hay benchmarks, no hay datos de licencia ni de idiomas, y el propio autor indica que las demostraciones provienen de simulación con humanos ausentes, lo que limita las garantías de transferencia al mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, familia LeRobot) |
| Parametros totales | 450.046.188 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada: una imagen RGB 256x256, estado de 6 articulaciones y una instrucción de tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucción de tarea fija en inglés: `put balloon onto tray`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,9 GB, librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es una política visión-lenguaje-acción: combina un codificador visual, un codificador de lenguaje y un decodificador de acciones que produce chunks de 50 pasos con 7 valores por paso (`dx, dy, dz, dRx, dRy, dRz, gripper`), todos acotados a [-1, 1]. La representación de acción es `so101_normalized_eef_delta_v1`: traslación y rotación son deltas en marco mundial respecto a la pose más reciente del efector final, y la rotación se expresa como vector de eje-ángulo. Los campos `joint_delta` y `joint_command` del dataset original se conservan solo para auditoría y no son objetivos de la política.

El entrenamiento se realizó durante 20.000 actualizaciones sobre 131 episodios (38.732 fotogramas a 20 Hz) de demostraciones en simulación con humanos ausentes. La aumentación visual es solo de apariencia (brillo, contraste, saturación, tono, nitidez y ruido de sensor), sin máscaras de dropout ni deformaciones geométricas. La pérdida final por rango quedó entre 0,004 y 0,007. La normalización guardada usa `IDENTITY` para RGB y para la acción de 7 dimensiones, y `MEAN_STD` para el estado de 6 articulaciones; el autor advierte explícitamente de no aplicar normalización ni desnormalización por estadísticas del dataset a la acción predicha.

## Capacidades

- Control robótico de efector final: genera chunks de 50 acciones de 7 dimensiones para un brazo SO-101.
- Condicionamiento por lenguaje: acepta la instrucción de tarea `put balloon onto tray`.
- Percepción visual monocámara: procesa una imagen RGB de 256x256.
- Integración con estado propioceptivo: consume seis valores articulares medidos.
- Decodificación determinista documentada: traslación escalada a 0,004 m por unidad, rotación a 0,5 rad por unidad y pinza mapeada linealmente entre 20,0 (cerrada) y 29,07763448 (abierta).
- Compatibilidad con LeRobot: política y procesadores cargables desde la configuración guardada, con metadatos de acción en `action_contract.json`.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política de control, no un modelo conversacional.

## Casos de uso

- Manipulación pick-and-place en simulación: replicar la tarea de depositar un globo en una bandeja dentro de un entorno simulado con SO-101, usando el checkpoint como referencia de política entrenada y comparando la pérdida de validación con nuevos entrenamientos.
- Base para fine-tuning en tareas de bandeja: partir de este checkpoint de 450 M parámetros y reentrenar con demostraciones propias para variantes de la misma tarea (otros objetos, otras posiciones de bandeja), aprovechando que el contrato de acción ya está fijado.
- Validación de pipelines LeRobot: usar el modelo como caso de prueba de extremo a extremo para verificar la carga de políticas, el preprocesado de observaciones y la decodificación de acciones antes de desplegar modelos mayores.
- Control de efector final con cinemática inversa: integrar la salida decodificada (posición, matriz de rotación y unidades de pinza) en un controlador IK calibrado del SO-101 con límites articulares, tal como describe la model card.
- Investigación en aumentación visual para VLA: evaluar el efecto de la aumentación solo de apariencia (sin warps geométricos) comparando este checkpoint con variantes entrenadas con otras políticas de aumentación.
- Docencia y prototipado de robótica de bajo coste: el tamaño de 0,9 GB permite experimentar en estaciones de trabajo con una sola GPU consumer, sin necesidad de clústeres.
- Auditoría de contratos de acción: servir de ejemplo de especificación formal de acciones (cotas, escalas, sistema de referencia) para equipos que definan sus propios formatos de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de rendimiento es la pérdida final de entrenamiento por rango, aproximadamente 0,004 a 0,007, que no es comparable con métricas de éxito de tarea ni con benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en precisión completa (fp32) los pesos ocupan unos 1,8 GB, y en fp16/bf16 unos 0,9 GB, a lo que hay que sumar activaciones del codificador visual y del decodificador de acciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo en fp16, incluidas RTX 3060, RTX 4060 y RTX 4090.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repo (0,9 GB), aunque no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: LeRobot (librería declarada), con la política y los procesadores cargados desde la configuración guardada; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son el objetivo de una política VLA.
- Latencia y throughput: no disponibles. La frecuencia de entrenamiento fue de 20 Hz, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nhatcm/smolvla-so101-balloon-to-tray-rgb-eef-delta | 450.046.188 | Imagen 256x256 + estado de 6 articulaciones + instrucción fija | Depositar globo en bandeja con SO-101 | no disponible | Hugging Face, 0 descargas, 0 likes |
| SmolVLA (modelo base de LeRobot) | no disponible en la informacion proporcionada | no disponible | Política VLA generalista | no disponible | no disponible |
| Otros checkpoints SO-101 de la comunidad | no disponible | no disponible | Tareas específicas de manipulación | no disponible | no disponible |

No se dispone de datos verificables de modelos alternativos en la información proporcionada; la comparación cuantitativa con el SmolVLA base u otros checkpoints SO-101 no está disponible.

## Limitaciones y advertencias

- Entrenado únicamente con demostraciones en simulación y con humanos ausentes: no hay evidencia publicada de transferencia al mundo real ni de robustez ante variaciones físicas.
- Una sola tarea y una sola instrucción de lenguaje (`put balloon onto tray`): no generaliza a otras órdenes sin reentrenamiento.
- Una sola cámara RGB de 256x256: sensible a oclusiones, iluminación y cambios de punto de vista no cubiertos por la aumentación de apariencia.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Sin benchmarks ni métricas de éxito de tarea: el rendimiento real es desconocido más allá de la pérdida de entrenamiento.
- Riesgo de acumulación de error: al ser deltas respecto a la pose más reciente, la decodificación debe hacerse contra la pose medida actual y no contra la del inicio del chunk, tal como advierte el autor.
- No aplicar normalización ni desnormalización por estadísticas del dataset a la acción predicha; ignorar esta advertencia produce comandos incorrectos.
- La salida debe pasar por IK calibrada y controlador de límites articulares del SO-101; el modelo no garantiza comandos cinemáticamente válidos por sí mismo.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación de la comunidad ni issues documentados.
- No hay información sobre sesgos, idiomas ni comportamiento fuera de distribución más allá de lo indicado.

## Enlaces

- Hugging Face: https://huggingface.co/nhatcm/smolvla-so101-balloon-to-tray-rgb-eef-delta
- Metadatos de acción: `action_contract.json` (incluido en el repositorio del modelo)
- Configuración de entrenamiento: `train_config.json` (incluido en el repositorio del modelo)
- Política de aumentación visual: `strong_visual_augmentation.json` (incluida en el repositorio del modelo)
- LeRobot (librería declarada): https://github.com/huggingface/lerobot
