# sarahjonesbeck/cnn-transformer-multitask-experiments

## Resumen

El repositorio `sarahjonesbeck/cnn-transformer-multitask-experiments` es una implementación compacta y personalizada en PyTorch de una arquitectura denominada CNN Transformer orientada a tareas multitarea. Lo publica el usuario sarahjonesbeck y su propia model card lo describe explícitamente como un artefacto pensado para revisión de código, pruebas de humo (*smoke tests*) y experimentos pequeños y controlados, no como un modelo preentrenado listo para producción. El recuento real de parámetros reportado en los ficheros safetensors es de 24.832, una cifra extremadamente baja y coherente con un checkpoint de inicialización sin entrenar.

La relevancia de esta ficha es acotada y conviene ser honesto al respecto: no se trata de un modelo que compita con alternativas generativas actuales. Su interés es exclusivamente pedagógico y de ingeniería, ya que sirve como plantilla reproducible para montar un *pipeline* de experimentación multitarea, comparar baselines con presupuestos de ajuste equivalentes y verificar la integración de un modelo con APIs de carga automática. La model card incide repetidamente en que no se reclama ninguna puntuación de *benchmark* y que el checkpoint no ha sido entrenado ni auditado en robustez, imparcialidad o transferencia de dominio.

Respecto a los datos disponibles, la información es muy limitada: no se especifican longitud de contexto, idiomas soportados, tipos de cuantización ni dimensiones internas del modelo (el `config.json` no se reproduce en la model card). La licencia es Apache 2.0 y el formato de pesos es safetensors. Cualquier cifra que no aparezca aquí debe considerarse no disponible y no debe inferirse del nombre "large" que usa el repositorio, que hace referencia a su propia escala interna de nombres y no a un modelo de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (implementación personalizada en PyTorch) |
| Parametros totales | 24.832 (recuento real de safetensors; aproximadamente 24,8 mil) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`); implementación en Python (`finetune.py`) |
| Atencion | Grouped query attention |
| Fusion multimodal/multitarea | Concat MLP |
| Activacion | GELU |
| Normalizacion | GroupNorm |
| Optimizador del recetario por defecto | AdamW con planificador de warmup lineal |
| Escala declarada por el autor | large (escala interna del repositorio) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un componente convolucional (CNN) con bloques de atención tipo transformer, y emplea *grouped query attention* en lugar de atención multi-cabeza completa. La fusión de ramas o tareas se realiza mediante un MLP sobre concatenación (*concat mlp*), con activación GELU y normalización GroupNorm. No se detalla en la model card ni el número de capas, ni la dimensión oculta, ni el número de cabezas, ni la resolución o secuencia de entrada, por lo que no es posible reconstruir el grafo completo a partir de la información proporcionada.

En cuanto al entrenamiento, el repositorio incluye un `training_args.json` con un recetario de experimento por defecto (AdamW con warmup lineal) que el propio autor califica de valores de partida del script, no de evidencia de una ejecución completada. No hay datos sobre volumen de tokens, composición del dataset, número de pasos ni fases de alineación (RLHF, DPO u otras). El fichero `model.safetensors` se presenta explícitamente como un checkpoint de inicialización válido para pruebas de humo y no como un checkpoint entrenado con resultados medidos. Tampoco se documenta ninguna innovación técnica adicional más allá de la combinación CNN más transformer y de la estrategia de fusión por concatenación.

## Capacidades

- No se documenta ninguna capacidad funcional demostrada: el checkpoint distribuido no ha sido entrenado, por lo que no genera texto ni predicciones útiles.
- La implementación sí contempla una cabeza de fusión multitarea mediante concatenación y MLP, pensada para compartir representaciones entre varias tareas, pero sin pesos entrenados asociados.
- Emplea grouped query attention, un mecanismo que en modelos entrenados reduce el coste de memoria del KV cache; aquí es solo una decisión de diseño de la implementación.
- Soporte de *tool calling* o *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.
- Es compatible con un bucle de ajuste fino propio: el repositorio incluye `finetune.py` con un bloque `__main__` de ejemplo y la orden `python finetune.py --help`.
- No es cargable mediante APIs genéricas de carga automática (por ejemplo, clases `AutoModel` de la librería transformers) sin escribir un adaptador explícito, tal como advierte la model card.

## Casos de uso

- Pruebas de humo en integración continua: el checkpoint de inicialización permite verificar que un *pipeline* de carga de pesos, *forward pass* y serialización funciona de extremo a extremo sin depender de un modelo grande, reduciendo el tiempo de CI a milisegundos por ejecución.
- Revisión de código de arquitecturas híbridas CNN-transformer: sirve como referencia legible y de tamano reducido para inspeccionar cómo se implementan grouped query attention, GroupNorm y una fusión multitarea por concatenación.
- Prototipado de recetarios de ajuste fino: `training_args.json` y el optimizador AdamW con warmup lineal permiten ensayar configuraciones de entrenamiento y reproducibilidad (semillas, presupuesto de *tuning*) antes de escalar a modelos mayores.
- Banco de pruebas de comparación de baselines: la propia model card recomienda entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, algo que este repositorio facilita al ser barato de ejecutar en paralelo.
- Docencia y materiales formativos: con 24.832 parámetros y código Python legible, es adecuado para explicar en clase la diferencia entre un checkpoint inicializado y uno entrenado, y por qué un recuento bajo de parámetros no implica utilidad práctica.
- Validación de infraestructura de serialización: permite comprobar herramientas propias de inspección de safetensors, cálculo de huellas (*checksums*) y verificación de versiones de entorno sin consumir GPU.
- Desarrollo de adaptadores de carga personalizados: útil para implementar y probar el *wrapper* que permita exponer un modelo no estándar a frameworks de inferencia o de evaluación.
- Con estos pesos no es viable ningún caso de uso en producción con usuarios reales: no hay generación de texto, ni clasificación fiable, ni ninguna métrica medida que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma explícita que no se reclama ninguna puntuación de *benchmark* y que no se ha auditado el checkpoint en robustez, imparcialidad ni transferencia de dominio. No procede, por tanto, presentar comparaciones numéricas con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- Peso de los parámetros: con 24.832 parámetros, el checkpoint ocupa del orden de 100 KB en fp32 y 50 KB en fp16. Estas cifras se derivan aritméticamente del recuento de parámetros; no proceden de una medición publicada.
- VRAM estimada para inferencia: no disponible. El `config.json` no se reproduce en la información proporcionada, por lo que se desconocen las dimensiones internas y, con ellas, el coste de activaciones y de la ventana de atención.
- GPU recomendadas: ninguna en particular; el modelo es tan pequeno que la ejecución es viable en CPU, en cualquier GPU de consumo e incluso en dispositivos embebidos tipo Raspberry Pi. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquiera, incluidas las más modestas y las integradas.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama no soportan este modelo de forma nativa, ya que no hay pesos en GGUF y la implementación es personalizada. El despliegue requiere ejecutar el propio `finetune.py` o escribir un cargador a medida.
- Latencia y rendimiento: no disponibles, y en cualquier caso carentes de sentido sin un entrenamiento previo.

## Comparativa con modelos similares

No disponible. Este repositorio es un checkpoint de inicialización sin entrenar y de 24.832 parámetros, por lo que no es comparable en igualdad de condiciones con modelos multitarea o multimodal entrenados. La búsqueda web realizada no devolvió información relevante sobre el modelo ni sobre alternativas de su misma categoría, de modo que fijar una tabla comparativa implicaría inventar datos, algo que se descarta deliberadamente.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicialización, no un modelo entrenado: no ha sido entrenado ni auditado en robustez, imparcialidad ni transferencia de dominio.
- No se puede afirmar nada sobre sesgos porque no hay datos de entrenamiento ni evaluación publicados.
- El riesgo de alucinación es indeterminado: no hay un modelo entrenado que pueda alucinar, y no se aportan métricas de fidelidad.
- No se documentan limitaciones de contexto ni de idioma porque no se especifican ni la longitud de contexto ni los idiomas soportados.
- La licencia Apache 2.0 permite uso comercial del código y de los pesos, pero la propia model card advierte de que deben revisarse por separado los términos de los datos de origen si el repositorio se usa con conjuntos de datos externos.
- La etiqueta de escala "large" es interna del repositorio y no debe interpretarse como indicador de tamano real; el recuento de safetensors es de 24.832 parámetros.
- La carga mediante APIs genéricas de la librería transformers fallará sin un adaptador explícito.
- Las cifras de parámetros y de descargas proceden del momento de la consulta (0 descargas, 0 likes), por lo que no hay evidencia de uso ni de validación por parte de la comunidad.
- Antes de citar cualquier resultado, el autor recomienda usar un conjunto de validación específico de la tarea, reportar la métrica con al menos tres semillas e incluir un baseline de capacidad equivalente, además de conservar los registros de entrenamiento y las versiones del entorno.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sarahjonesbeck/cnn-transformer-multitask-experiments
- Ficheros incluidos en el repositorio: `finetune.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors`
- Paper, blog, repositorio de código o demo adicionales: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con su arquitectura.
