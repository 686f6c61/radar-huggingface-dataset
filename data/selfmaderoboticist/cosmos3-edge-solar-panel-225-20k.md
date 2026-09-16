# selfmaderoboticist/cosmos3-edge-solar-panel-225-20k

## Resumen

cosmos3-edge-solar-panel-225-20k es un fine-tune del modelo nvidia/Cosmos3-Edge publicado por el usuario selfmaderoboticist en HuggingFace. Se trata de una política robótica de imitación entrenada para una tarea concreta de manipulación: limpiar con un cepillo un panel solar situado encima de un helicóptero, empleando un brazo SO101. El modelo consume una imagen de muñeca (wrist camera) junto con una instrucción de tarea en texto y produce 16 acciones relativas de pose del efector final más los valores de pinza, a una frecuencia de 15 Hz.

El entrenamiento se lanzó el 15 de septiembre de 2026 y está planificado para 20.000 pasos sobre 8 GPU H100, con un dataset de 225 episodios (202 de entrenamiento y 23 de validación, semilla 42). La model card indica que el dataset procesado en H.264 es privado y que no se publican ni vídeos ni ficheros parquet de episodios. El repositorio ocupa 61,7 GB e incluye checkpoints verificados bajo `checkpoints/` con un puntero `latest_checkpoint.json`.

Se trata de un artefacto de investigación más que de un modelo de propósito general: la política de acciones deriva de LIBERO y ha sido adaptada a Cosmos3 Edge y al robot SO101, y el propio autor aclara que no es un checkpoint oficial de NVIDIA. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y no se han publicado resultados de evaluación ni la licencia de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. Fine-tune de nvidia/Cosmos3-Edge con una política de acciones derivada de LIBERO adaptada a Cosmos3 Edge y SO101 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible. La entrada es una única imagen de muñeca más la instrucción de tarea, sin historial de observaciones ni estado del robot |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible. La instrucción de tarea se proporciona como texto (ejemplo documentado en inglés), pero no se declaran idiomas soportados |
| Licencia | no disponible. El autor no especifica licencia; el modelo base nvidia/Cosmos3-Edge tiene sus propias condiciones de uso |
| Formato de pesos | safetensors (según las etiquetas del repositorio). Checkpoints publicados bajo `checkpoints/` con puntero verificado en `latest_checkpoint.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base nvidia/Cosmos3-Edge ni del fine-tune. Lo que sí se documenta es la interfaz de la política: entrada compuesta por la imagen actual de la cámara de muñeca y la instrucción de tarea (sin historial de observaciones ni estado del robot), y salida de 16 acciones de pose relativa del efector final por fotograma junto con los valores de pinza, emitidas a 15 Hz. La política de acciones procede de LIBERO y se ha adaptado a Cosmos3 Edge y al SO101, según la model card.

El entrenamiento se ejecutó con los siguientes hiperparámetros: tasa de aprendizaje base 5e-5, multiplicador de 5 para la cabeza de acciones (action head), 500 pasos de warmup, scheduler lineal a 20.000 pasos, batch efectivo de 64 (8 muestras × 8 GPU), precisión BF16 y checkpointing de activaciones completo. El dataset consta de 225 episodios de origen, divididos en 202 de entrenamiento y 23 de validación con semilla 42; el material procesado en H.264 es privado y no se publican vídeos ni parquet de episodios. El código y la receta exacta están en el repositorio cosmos-framework del autor, con el último upstream de NVIDIA fusionado identificado por el commit `3f94d25d564ff0a982ac3e540cb83bfe4a5e5a11`.

## Capacidades

- Generación de acciones de manipulación robótica: 16 acciones de pose relativa del efector final por fotograma más valores de pinza, a 15 Hz.
- Condicionamiento por instrucción en lenguaje natural: la tarea documentada es "usar el cepillo para limpiar el panel solar encima del helicóptero".
- Condicionamiento visual: utiliza la imagen actual de la cámara de muñeca como observación principal.
- Ejecución de una tarea de contacto físico con herramienta (cepillado/limpieza) sobre una superficie.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades multilingües ni generación de texto.

## Casos de uso

- Limpieza automatizada de paneles solares: es la tarea objetivo del modelo; la política convierte la imagen de muñeca del SO101 en comandos de pose y pinza a 15 Hz para cepillar la superficie del panel.
- Automatización de mantenimiento en entornos de difícil acceso: el escenario planteado (panel sobre un helicóptero) representa tareas de limpieza en altura o en ubicaciones no ergonómicas donde el acceso humano es costoso o peligroso.
- Base para fine-tuning en tareas de limpieza análogas: la receta de 20.000 pasos con batch efectivo de 64 y LR 5e-5 sobre 225 episodios sirve como punto de partida para otras superficies o herramientas.
- Investigación en aprendizaje por imitación con políticas derivadas de LIBERO: el repositorio permite reproducir el pipeline completo (código, hiperparámetros, semilla y split) para experimentos comparativos.
- Recolección de datos y teleoperación asistida: la política puede utilizarse como generador de acciones durante la recogida de demostraciones sobre el SO101, reduciendo la carga de teleoperación.
- Evaluación de transferencia sim-to-real: al derivar de una política LIBERO adaptada a un modelo de mundo (Cosmos3 Edge) y desplegarse en un brazo real, es un banco de pruebas para medir la brecha entre simulación y robot físico.
- Despliegue en bucle cerrado a 15 Hz: la salida frame-wise a 15 Hz es compatible con control reactivo en tiempo real, aunque no se han publicado métricas de latencia.
- Estudio de modelos de mundo aplicados a manipulación: permite analizar cómo se comporta un backbone tipo Cosmos3 Edge cuando se le acopla una cabeza de acciones entrenada específicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de LIBERO ni evaluaciones en robot real o simulación, y no se proporcionan comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se documentan parámetros totales ni cuantizaciones, por lo que no es posible calcularla de forma fiable.
- Tamaño del repositorio: 61,7 GB. Si el contenido fuese un único conjunto de pesos en BF16, equivaldría aproximadamente a 30.000 millones de parámetros, pero se trata de una inferencia no confirmada: el repositorio puede contener varios checkpoints de los 20.000 pasos de entrenamiento.
- GPU recomendadas: no disponibles. El entrenamiento se realizó con 8 GPU H100, dato que no implica requisitos equivalentes para inferencia.
- Compatibilidad con GPU de consumo: no determinable con la información disponible.
- Opciones de despliegue: no documentadas. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ningún runtime específico; el código de referencia está en cosmos-framework.
- Latencia y throughput: la política emite acciones a 15 Hz como requisito de diseño, pero no se han publicado mediciones de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3-edge-solar-panel-225-20k (este modelo) | no disponible | Imagen de muñeca + instrucción de tarea | No publicado | no disponible | HuggingFace, 61,7 GB, 0 descargas |
| nvidia/Cosmos3-Edge (modelo base) | no disponible | no disponible | no disponible | Condiciones propias de NVIDIA (no detalladas en la información disponible) | HuggingFace |
| Otras políticas de imitación para manipulación (p. ej. derivadas de LIBERO) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables con alternativas de la misma categoría (políticas robóticas VLA del mismo tamaño o para la misma tarea). Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Sin licencia declarada: el autor no especifica ninguna licencia en la información disponible, lo que impide determinar si el uso comercial está permitido. El modelo base nvidia/Cosmos3-Edge mantiene además sus propias condiciones.
- No es un checkpoint oficial de NVIDIA: la model card lo indica explícitamente ("this is not an official NVIDIA checkpoint"), por lo que no debe presentarse como tal.
- Dataset privado y no reproducible: el dataset procesado en H.264 es privado y no se publican vídeos ni parquet de episodios, lo que impide auditar la calidad o la composición de los datos de entrenamiento.
- Sin resultados de evaluación: no hay tasas de éxito, ni métricas en simulación, ni validación en robot real publicadas. El rendimiento real de la política es desconocido.
- Especialización extrema: el modelo está entrenado para limpiar un panel solar concreto situado sobre un helicóptero con un SO101. Se espera un rendimiento muy degradado fuera de esa tarea, esa herramienta y ese entorno.
- Sin historial de observaciones ni estado del robot: al depender solo de la imagen actual de muñeca más la instrucción, la política no puede modelar la dinámica pasada ni corregir errores acumulados a partir del estado del robot.
- Riesgo de sobreajuste al entorno de entrenamiento: 225 episodios de origen son un volumen reducido, y la iluminación, la posición de la cámara o el aspecto del panel pueden provocar fallos fuera de la distribución vista.
- Idiomas no declarados: no se especifica en qué idiomas acepta la instrucción de tarea; el único ejemplo documentado está en inglés.
- Estado de entrenamiento: la model card describe un run en curso hacia los 20.000 pasos, con checkpoints verificados de forma progresiva. Debe comprobarse `latest_checkpoint.json` antes de usar cualquier peso, ya que los checkpoints intermedios pueden tener un rendimiento inferior al final.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de uso o validación por terceros.
- Riesgo de alucinación / comportamiento errático en robótica: al ser una política que emite comandos de movimiento, los errores se traducen en acciones físicas potencialmente inseguras, por lo que requiere supervisión y paradas de emergencia en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/selfmaderoboticist/cosmos3-edge-solar-panel-225-20k
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Cosmos3-Edge
- Código y receta de entrenamiento (cosmos-framework, rama solar-panel-edge-20k): https://github.com/Rebis-IvLabs/cosmos-framework/tree/codex/solar-panel-edge-20k/examples/solar_edge
- Commit de upstream de NVIDIA fusionado: `3f94d25d564ff0a982ac3e540cb83bfe4a5e5a11`
- Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes al modelo (corresponden a contenido no relacionado sobre seguros médicos); no se han encontrado papers, blogs ni demos adicionales.
