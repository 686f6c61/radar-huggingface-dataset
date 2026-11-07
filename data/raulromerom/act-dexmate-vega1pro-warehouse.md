# raulromerom/act-dexmate-vega1pro-warehouse

## Resumen

`act-dexmate-vega1pro-warehouse` es un checkpoint de política de control robótico publicado por el usuario raulromerom en Hugging Face. Por su nombre y por el contexto de los resultados de búsqueda (el robot humanoide con ruedas Vega 1 Pro de Dexmate), se trata de un modelo de tipo ACT (Action Chunking Transformer), una arquitectura de imitación diseñada para mapear observaciones visuales y de estado del robot a secuencias de acciones motoras. El sufijo "warehouse" sugiere que está entrenado para una tarea concreta de almacén o logística sobre la plataforma Vega 1 Pro.

El modelo tiene 51.701.398 parámetros en formato safetensors y un repositorio de 0,4 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre el hardware del propio robot o en una GPU de gama media. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de aprendizaje por imitación orientado a un entorno y una tarea específicos.

Su relevancia radica en que ejemplifica el patrón actual de despliegue de políticas robóticas entrenadas con datos de teleoperación y publicadas como checkpoints abiertos, lo que permite reproducir experimentos y adaptar el control a nuevas tareas. La información pública disponible es muy limitada: no hay pipeline declarado, ni licencia, ni idiomas, ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), según la convención de nombres del repositorio; no confirmado en la model card |
| Parámetros totales | 51.701.398 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp32 o fp16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del repositorio indica una política ACT (Action Chunking Transformer), una arquitectura basada en transformer que predice bloques de acciones ("chunks") a partir de observaciones visuales y del estado de las articulaciones, en lugar de una acción por paso. Este diseño, popularizado por el trabajo original de ACT para manipulación bimanual, reduce el error de acumulación y permite control a frecuencias efectivas más altas al ejecutar varias acciones por inferencia. Con 51,7 millones de parámetros, el modelo es coherente con una política ACT de tamaño moderado, con un codificador visual y un decoder transformer de acciones.

No se dispone de información sobre el dataset de entrenamiento: no se especifica el número de episodios de teleoperación, la composición de las observaciones (cámaras, propriocepción), el número de tokens ni si hubo etapas de refinamiento. Tampoco hay datos sobre el robot objetivo más allá del nombre: la plataforma Vega 1 Pro de Dexmate es un humanoide con ruedas de propósito general, y el sufijo "warehouse" apunta a una tarea de almacén, pero la model card no detalla la tarea exacta, el espacio de acciones ni las condiciones de recogida de datos.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) a partir de observaciones, orientado a manipulación o navegación en un entorno de almacén.
- Ejecución sobre la plataforma Dexmate Vega 1 Pro, un humanoide con ruedas de propósito general.
- Política específica de tarea: el checkpoint está asociado a un escenario concreto ("warehouse") y no se presenta como un modelo generalista.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión general, audio ni modo "thinking".
- No se documentan capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Automatización de picking en almacén: la política puede ejecutar la secuencia de aproximación, agarre y traslado de objetos sobre el Vega 1 Pro, sustituyendo la programación manual de trayectorias por una política aprendida de demostraciones.
- Reproducción de experimentos de imitación: investigadores pueden cargar el checkpoint en un pipeline de evaluación ACT para comparar metodologías de entrenamiento sobre la misma tarea y plataforma.
- Base para fine-tuning con datos propios: al ser un checkpoint ligero (51,7 M de parámetros), puede adaptarse a variantes de la tarea (nuevos objetos, posiciones o estanterías) con un coste de cómputo reducido.
- Evaluación de robustez en simulación: el modelo puede integrarse en entornos simulados que repliquen el escenario de almacén para medir la tasa de éxito antes de desplegarlo en el robot físico.
- Docencia y prototipado en robótica: sirve como ejemplo práctico de una política ACT entrenada para una plataforma humanoide con ruedas, útil en cursos de aprendizaje por imitación.
- Despliegue en el borde: por su tamaño, la inferencia puede ejecutarse en una GPU de gama media o incluso en hardware embebido con aceleración, lo que facilita la operación en el propio robot sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16; la VRAM total dependerá del codificador visual y de los buffers de inferencia, pero previsiblemente se mantendrá por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 o RTX 4090 cubren el caso con holgura. Para despliegue en el robot, una GPU embebida tipo Jetson Orin es una opción razonable.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con más de 4 GB de VRAM.
- Opciones de despliegue: al ser una política ACT, el despliegue típico es mediante el código de entrenamiento/evaluación de ACT (PyTorch) cargando los safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La latencia vendrá determinada por el codificador visual y la frecuencia de control del robot; los action chunks permiten amortizar la inferencia sobre varios pasos de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-dexmate-vega1pro-warehouse | 51,7 M | no disponible | Política ACT para almacén en Vega 1 Pro | no disponible | Hugging Face (30 descargas) |
| ACT original (Zhao et al.) | ~80 M (referencia) | no aplica | Manipulación bimanual ALOHA | MIT (código) | Repositorio público |
| Diffusion Policy | variable | no aplica | Políticas de imitación visual | MIT (código) | Repositorio público |

La comparación con ACT original y Diffusion Policy es orientativa por categoría (políticas de imitación), no por resultados medidos sobre la misma tarea; no se dispone de benchmarks que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Información pública mínima: no hay model card con descripción de la tarea, el dataset, las observaciones de entrada ni el espacio de acciones, lo que dificulta la reproducibilidad.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Especialización estrecha: el sufijo "warehouse" indica una política entrenada para un escenario concreto; el rendimiento fuera de ese entorno (otros objetos, iluminación o layout) probablemente se degrade.
- Riesgo de sobreajuste al entorno de recogida de datos: sin información sobre la diversidad de demostraciones, no puede evaluarse la generalización.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito que respalde su uso en producción.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, los sesgos relevantes serían de comportamiento físico (por ejemplo, sesgo hacia posiciones de agarre vistas en entrenamiento), no documentados.
- Advertencia de seguridad: cualquier despliegue sobre un robot físico requiere validación en entorno controlado y mecanismos de parada de emergencia, dado que el modelo no incluye garantías de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raulromerom/act-dexmate-vega1pro-warehouse
- Página del producto Dexmate Vega 1 Pro: https://www.dexmate.com/product/vega-1-pro
- Dexmate Software Hub: https://software.dexmate.ai/
