# badr7/rapidchat-MLX-4bit

## Resumen

rapidchat-MLX-4bit es una version cuantizada a 4 bits del modelo rapidchat, un ajuste fino de 9B especializado en atencion al cliente para aerolineas. Lo publica el usuario badr7 en HuggingFace bajo licencia Apache 2.0 y esta empaquetado con la libreria MLX de Apple, por lo que su destino son equipos con silicio de Apple (iPhone, iPad y Mac). El modelo cuenta con 8.953.803.264 parametros (unos 8,95B) y un repositorio de 5,1 GB en formato safetensors.

La relevancia de esta ficha esta en su especializacion: el modelo base declara un 86,5 de pass^1 en la tarea airline de tau2-bench, un benchmark orientado a agentes que ejecutan tareas multi-paso con llamadas a herramientas. Eso lo situa en el nicho de modelos pequenos pero muy afinados para flujos de agente concretos, en lugar de modelos generalistas.

Es importante senalar que la cuantizacion 4-bit no ha sido evaluada por separado: el autor indica explicitamente que las builds cuantizadas no se han benchmarkeado de forma independiente y que el 4-bit suele costar algo de precision respecto al modelo completo en bf16. Ademas, el autor advierte de que estas builds no se han probado en hardware Apple todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso, derivado de Qwen3.5-9B segun los tags del repositorio (tag `qwen3_5`); detalles completos no disponibles |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base existe en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un ajuste fino de 9B para soporte de aerolineas, construido sobre una arquitectura de tipo transformer (los tags del repositorio apuntan a Qwen3.5-9B como base). No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Lo que si se documenta es el conjunto de datos de entrenamiento, publicado de forma abierta como `badr7/rapidchat-data`.

La innovacion principal no esta en la arquitectura sino en la especializacion funcional: el modelo esta entrenado y evaluado sobre tau2-bench, un banco de pruebas de agentes conversacionales con herramientas. Su metrica de referencia es pass^1 en la tarea airline, donde el modelo completo en bf16 alcanza 86,5. Esta version concreta es una conversion a 4 bits realizada con `mlx-lm`, sin cambios de arquitectura mas alla de la cuantizacion.

## Capacidades

- Generacion de texto conversacional orientada a soporte al cliente.
- Ejecucion de tareas de agente con llamadas a herramientas (tool calling), evidenciada por su evaluacion en tau2-bench.
- Razonamiento multi-paso dentro de un flujo de agente con estado (por ejemplo, gestionar una reserva a lo largo de varios turnos).
- Capacidad de seguir instrucciones especificas de dominio (aerolineas: cambios de vuelo, gestion de reservas).
- Ejecucion local en dispositivos Apple mediante MLX (iPhone, iPad, Mac con silicio de Apple).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Atencion al cliente de aerolineas: el modelo esta afinado especificamente para esta tarea y obtiene 86,5 de pass^1 en la division airline de tau2-bench, por lo que puede gestionar cambios de vuelo, consultas de reserva y peticiones similares de forma autonoma.
- Agentes de reservas con herramientas: su entrenamiento en tau2-bench implica que sabe invocar herramientas para consultar y modificar un sistema de reservas, no solo responder texto.
- Asistente embebido en apps moviles de Apple: la build MLX 4-bit esta pensada para ejecutarse localmente en iPhone, iPad y Mac, lo que permite ofrecer asistencia sin enviar datos del usuario a un servidor.
- Prototipado rapido de agentes en Mac: un desarrollador puede levantar el modelo con `mlx_lm.generate` y validar un flujo de agente antes de invertir en infraestructura mayor.
- Soporte en mostrador o kiosco con conectividad limitada: al ser un modelo de ~5 GB cuantizado, cabe en equipos de gama alta con memoria unificada y no depende de una conexion permanente.
- Base para fine-tuning adicional en dominios de servicio: al estar bajo Apache 2.0 y publicar su dataset, sirve como punto de partida para adaptar el flujo de agente a otros sectores (hoteles, alquiler de coches).
- Evaluacion comparativa de cuantizacion: util para medir cuanto degrada el 4-bit frente al bf16 en tareas de agente, ya que el autor no lo ha hecho.

## Benchmarks y rendimiento

| Benchmark | Tarea | Resultado | Notas |
|---|---|---|---|
| tau2-bench | airline, pass^1 | 86,5 | Medido sobre el modelo completo en bf16, no sobre esta build 4-bit |

No se han publicado resultados de benchmarks de esta build cuantizada en la informacion disponible. El autor indica expresamente que las builds cuantizadas no se benchmarkearon por separado y que el 4-bit suele implicar una perdida leve de precision.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB solo para los pesos (el repositorio ocupa 5,1 GB en safetensors 4-bit), mas el coste de la cache KV segun la longitud de contexto, que no esta especificada.
- Entorno objetivo: hardware Apple con silicio propio (M1/M2/M3/M4 y variantes Pro/Max/Ultra) mediante memoria unificada. En un Mac con 16 GB de RAM unificada deberia caber con holgura; en iPhone/iPad depende del modelo concreto y de su RAM disponible.
- GPU NVIDIA/AMD: no es el objetivo de esta build, ya que MLX es un framework especifico de Apple. No se ha publicado una version GGUF ni CUDA.
- Opciones de despliegue: `mlx-lm` (con el comando `mlx_lm.generate` indicado por el autor). No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, al no existir pesos en formatos compatibles.
- Latencia y throughput: no disponibles. El autor advierte de que las builds no se han probado en hardware Apple todavia, por lo que no hay mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rapidchat-MLX-4bit | 8,95B | no disponible | 86,5 pass^1 en tau2-bench airline (bf16 base) | Apache 2.0 | MLX, solo Apple |
| Qwen3.5-9B (base referenciada en los tags) | ~9B | no disponible | no disponible | no disponible | no disponible |
| Otros fine-tunes de 9B para agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre rapidchat y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion 4-bit no ha sido evaluada: el 86,5 de tau2-bench corresponde al modelo completo en bf16 y no debe atribuirse a esta build.
- Las builds no se han ejecutado en hardware Apple, segun reconoce el propio autor, por lo que el funcionamiento practico en dispositivo no esta verificado.
- El modelo esta especializado en soporte de aerolineas; su rendimiento fuera de ese dominio no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a modelos de este tamano en tareas de agente con herramientas.
- Idiomas soportados no documentados: no se puede asumir buen rendimiento en castellano ni en otros idiomas distintos del usado en el entrenamiento.
- Longitud de contexto no especificada: limita la planificacion de cargas con conversaciones largas o muchos documentos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base y del dataset de entrenamiento antes de un despliegue en produccion.
- Traccion muy baja en HuggingFace (11 descargas, 0 likes) y sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/badr7/rapidchat-MLX-4bit
- Modelo base: https://huggingface.co/badr7/rapidchat
- Dataset de entrenamiento: https://huggingface.co/datasets/badr7/rapidchat-data
- Listado de adapters sobre Qwen3.5-9B (referencia de la busqueda): https://huggingface.co/models?other=base_model%3Aadapter%3AQwen%2FQwen3.5-9B
