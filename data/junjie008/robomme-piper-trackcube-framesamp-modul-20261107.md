# junjie008/robomme-piper-trackcube-framesamp-modul-20261107

## Resumen

RoboMME Piper TrackCube (FrameSamp + Modul, 30k) es un checkpoint de política robótica publicado por el usuario junjie008 en Hugging Face, entrenado sobre la base π0.5 (pi05) mediante la librería openpi. El modelo resuelve una tarea concreta de manipulación con memoria: observar una demostración en vídeo en la que una mano humana cubre un cubo de color con un vaso y lo desplaza, para después, en ejecución con un brazo Piper, levantar el vaso que oculta el cubo del color indicado en la instrucción. No es un modelo de lenguaje general, sino un artefacto de investigación orientado a evaluación en el benchmark RoboMME (ICML 2026 Oral), dentro de la suite de permanencia de objeto.

El interés técnico reside en su mecanismo de memoria: 2048 tokens de memoria que codifican cada frame de cámara fija en una rejilla de 4×4 tokens, leídos de forma uniforme sobre el histórico de demostración más ejecución hasta un máximo de 128 frames. El modelo parte de π0.5-base con el backbone SigLIP congelado y entrena el VLM, el action expert y el módulo de memoria. El paquete de 12 GB incluye pesos EMA en el paso 30.000, normalización, código fuente reproducible, demos de referencia y utilidades de despliegue por WebSocket.

La relevancia es acotada pero clara para quien investiga memoria en políticas visomotoras: ofrece un pipeline reproducible de extremo a extremo (datos, entrenamiento, normalización, servidor y cliente) sobre un conjunto pequeño y controlado de 70 ejecuciones, con advertencias explícitas del autor sobre el riesgo de atajos por memorización de posiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visomotor tipo π0.5 (VLM SigLIP congelado + action expert + módulo de memoria de 2048 tokens) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en tokens de texto; memoria visual limitada a 128 frames (4×4 tokens por frame, 2048 tokens de memoria) |
| Tipos de cuantizacion | no disponible (pesos publicados como checkpoint JAX/OpenPI, no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (instrucciones en inglés en los ejemplos de la model card) |
| Licencia | no disponible en los metadatos; el paquete incluye `LICENSE` y `LICENSE_GEMMA.txt` |
| Formato de pesos | `checkpoint_030000.tar` (checkpoint OpenPI/JAX con pesos EMA), más `normalization/`, `code/source_aaeda39.tar.gz` y recursos auxiliares |

## Arquitectura y entrenamiento

El modelo se inicializa desde π0.5-base y adopta la configuración denominada FrameSamp + Modul: el backbone SigLIP permanece congelado y se entrenan el VLM, el action expert y un módulo de memoria. La memoria se implementa con 2048 tokens; cada frame de la cámara fija se proyecta en una rejilla de 4×4 tokens y se lee de forma uniforme sobre el histórico acumulado de demostración y ejecución, con un máximo de 128 frames. Las demostraciones aportan únicamente contexto visual: no contribuyen a la pérdida de acciones ni entran en las estadísticas de normalización de acciones o estado.

El entrenamiento se realizó en 8 GPU A800 con batch global de 64, acumulación de gradiente 1 y un plan de 50.000 pasos; el checkpoint publicado corresponde al paso 30.000 con pesos EMA (EMA 0,999). El schedule usa 10.000 pasos de warmup hasta 5e-5 y después tasa constante. Los datos provienen del dataset `Mockingbird315/piper-repickcup-70-20261106` (revisión fija `96904fdf2908e28f47c6dce7e6d6de3c2b54e6a0`): 7 grupos, cada uno con 1 demostración y 10 ejecuciones, 70 ejecuciones en total; los grupos 1–5 tienen 3 vasos y los grupos 6–7 tienen 4. Los colores objetivo por grupo son red, green, yellow, red, green, yellow, green. La normalización de acciones es relativa H20 y se calcula solo sobre las 70 ejecuciones. El autor corrige la instrucción original («pick up the same cup») por «pick up the cup that hides the {color} cube», ya que el color se refiere al cubo bajo el vaso, no al vaso.

## Capacidades

- Control visomotor de un brazo Piper a 20 Hz: produce chunks de 20 pasos (`float32 [20,7]`) con objetivos absolutos de junta (rad) y apertura absoluta de pinza (m).
- Memoria episódica visual: integra una demostración en vídeo y el histórico de ejecución para razonar sobre la posición de objetos ocultos (permanencia de objeto).
- Condicionamiento por instrucción en lenguaje natural que especifica el color del cubo objetivo.
- Entrada multimodal: cámara fija frontal (`front_rgb`), cámara de muñeca (`wrist_rgb`) y estado propioceptivo de 7 dimensiones (j1–j6 en rad más apertura de pinza en m).
- Gestión explícita de episodios: `start_episode` con demo de referencia y `infer` para ejecución, con memoria reiniciada en cada episodio.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión general, audio ni modo thinking; es una política robótica especializada.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Evaluación de memoria en manipulación: usar el checkpoint como línea base en la suite de permanencia de objeto de RoboMME, comparando si el modelo sigue la evidencia visual de la demo o recurre a posiciones memorizadas.
- Reproducción de experimentos de investigación: el paquete incluye código fuente, `uv.lock`, configuración de entrenamiento y demos alineadas, lo que permite replicar la inferencia y auditar la normalización.
- Prototipado de pipelines demo-a-ejecución: sirve para validar arquitecturas cliente-servidor por WebSocket donde una demostración humana actualiza la memoria del modelo antes de la ejecución del robot.
- Estudio de transferencia humano-robot: la demo es de mano humana y la ejecución de brazo Piper, lo que permite analizar la brecha de dominio en políticas visomotoras.
- Pruebas de sincronización temporal: el contrato exige rejilla causal de 20 Hz, timestamps en nanosegundos y tratamiento de chunks obsoletos, útil para validar infraestructura de control asíncrono.
- Docencia y demostraciones de laboratorio: con 7 disposiciones controladas y demos de referencia incluidas, es adecuado para prácticas de robótica con memoria, siempre que se respete el encuadre de cámara del entrenamiento.
- Auditoría de sesgos de atajo: el autor recomienda cambiar posiciones y alternar demos dentro de la misma disposición para comprobar si el objetivo sigue la evidencia; el checkpoint sirve como caso de estudio de memorización frente a razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta verificaciones de release: lectura completa de parámetros en el paso 30k, comprobación de finitud, consistencia de normalización y construcción de la política, además de un short test en 8 GPU con batch 64 y una comparación de entradas online frente a caché offline. El autor advierte explícitamente que no se debe interpretar el short test previo al entrenamiento como validación de tasa de éxito en bucle cerrado con robot real a 30k.

## Requisitos de hardware

- Servidor Linux con GPU NVIDIA; el entrenamiento usó 8×A800, pero la inferencia del checkpoint requiere una sola GPU según el script de despliegue (`CUDA_VISIBLE_DEVICES=0`).
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 12 GB e incluye SigLIP, por lo que se necesita una GPU con memoria suficiente para cargar el checkpoint completo, el tokenizer y el runtime JAX.
- GPU recomendadas: A800/H100/A100 por proximidad al entorno de entrenamiento; no se documenta compatibilidad con GPUs de consumo.
- No se indica que quepa en GPUs de consumo tipo RTX 4090; no hay datos para afirmarlo.
- Despliegue mediante el servidor incluido `deploy/serve_piper.py` sobre WebSocket y el cliente `openpi_client.websocket_client_policy`; el entorno se crea con `uv sync --frozen --no-dev` y Python 3.11.
- Variables de entorno relevantes: `OPENPI_DATA_HOME`, `PYTHONPATH`, `XLA_PYTHON_CLIENT_PREALLOCATE=false`; se debe evitar `JAX_PLATFORMS`.
- Latencia y throughput: no disponibles. El control es asíncrono a 20 Hz y el cliente debe gestionar latencia de inferencia y chunks caducados.
- Un servicio atiende una única sesión de robot a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / memoria | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboMME Piper TrackCube (este) | no disponible | 128 frames, 2048 tokens de memoria | Permanencia de objeto con brazo Piper | no disponible (ver `LICENSE` y `LICENSE_GEMMA.txt`) | Hugging Face, 0 descargas, 0 likes |
| π0.5-base (OpenPI) | no disponible | no disponible | Política visomotora generalista | no disponible en esta ficha | Referenciado como inicialización; no se detallan sus cifras aquí |
| Otros checkpoints del benchmark RoboMME | no disponible | no disponible | Suites de counting, permanence y otras | no disponible | Repositorio `RoboMME/robomme_benchmark` |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de atajo por memorización: solo hay 7 disposiciones de referencia; el modelo podría recordar posiciones en lugar de razonar sobre la evidencia visual. El autor recomienda validar cambiando posiciones y alternando demos en la misma disposición.
- El loss de entrenamiento no basta como prueba de tasa de éxito; no hay validación de bucle cerrado en robot real a 30k.
- Dependencia estricta del encuadre: la cámara fija es la fuente de memoria y el encuadre de entrenamiento incluye un recorte central de 2× de campo de visión; desviarse degrada el rendimiento. La cámara de muñeca, al volver a la pose inicial, mira principalmente a la pared y algunos objetivos quedan cerca del borde inferior.
- Cada ejecución requiere una demo de referencia emparejada; no se puede reutilizar la memoria de un episodio anterior.
- El paquete no incluye estado de optimizador ni reanudación completa del entrenamiento.
- No se documentan sesgos demográficos, lingüísticos o culturales; al ser una política robótica especializada, el riesgo principal es de generalización fuera de las 7 disposiciones.
- Licencia no declarada en los metadatos; antes de uso comercial deben revisarse `LICENSE` y `LICENSE_GEMMA.txt`, que pueden imponer restricciones por componentes Gemma.
- El modelo no conecta ni acciona el robot por sí mismo: el SDK, los límites de junta y la programación de acciones son responsabilidad del cliente.
- Las rutas absolutas de Huawei en la configuración de entrenamiento son solo para trazabilidad; el despliegue debe usar las rutas del paquete de release.
- Idiomas soportados no documentados; los ejemplos de instrucción están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junjie008/robomme-piper-trackcube-framesamp-modul-20261107
- Dataset de entrenamiento: https://huggingface.co/datasets/Mockingbird315/piper-repickcup-70-20261106
- Benchmark RoboMME: https://robomme.github.io/index.html
- Repositorio RoboMME: https://github.com/RoboMME/robomme_benchmark
