# nvidia/cosmos3-nano-libero10-sdg-export-D2_s43

## Resumen

`nvidia/cosmos3-nano-libero10-sdg-export-D2_s43` es un checkpoint de política visiomotora (VLA, vision-language-action) publicado por NVIDIA como derivado de `nvidia/Cosmos3-Nano`. No es un modelo de propósito general: es el resultado de un posentrenamiento sobre LIBERO-10, el conjunto de referencia de manipulación robótica de mesa, y corresponde a la semilla de entrenamiento 43 de una única celda (D2_s43) de un estudio controlado sobre datos sintéticos descrito en la receta «Restyle LIBERO-10 Demonstrations with Cosmos3-Nano-Sim-Transfer and Measure the Gain Against a Matched Control» del Cosmos Cookbook. Su interés es, por tanto, metodológico: sirve para medir si el reestilizado de demostraciones mejora la robustez de la política frente a su control emparejado.

El modelo tiene 15.173.136.576 parámetros (unos 15,17 mil millones) y se distribuye como export del checkpoint de entrenamiento en safetensors bf16 con pesos EMA, siete shards y unos 30 GB (31,5 GB de repositorio). Se carga mediante el servidor de políticas de `cosmos-framework` v1.2.2 (commit `c23e51f2`), no mediante pipelines estándar de HuggingFace Transformers.

La relevancia práctica es doble. Por un lado, reporta una tasa de éxito del 93,3 ± 0,7 % en escenas estándar de LIBERO-10 y del 85,5 ± 2,5 % en escenas perturbadas (iluminación, texturas, skybox y jitter de cámara), lo que cuantifica la brecha sim-to-sim. Por otro, la propia model card advierte de que las diferencias inferiores a 2,5 puntos quedan dentro de la dispersión entre semillas de entrenamiento, de modo que el checkpoint solo es interpretable junto a su control.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `nvidia/Cosmos3-Nano`; etiqueta de librería `cosmos3_omni`. Detalle interno (transformer, MoE, híbrida) no disponible |
| Parámetros totales | 15.173.136.576 (≈15,17 mil millones) |
| Parámetros activos | No disponible (no se documenta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el export se publica únicamente en bf16 |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | safetensors (bf16, pesos EMA, 7 shards, ~30 GB) |
| Modelo base | `nvidia/Cosmos3-Nano`, revisión `e59a53c2` |
| Framework de carga | `cosmos-framework` `c23e51f2` (v1.2.2), servidor de políticas |
| Pipeline declarado | `robotics` |
| Tamaño del repositorio | 31,5 GB |
| Descargas / likes | 14 / 0 |
| Fecha de creación | 2026-10-19 |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como una política VLA construida sobre `nvidia/Cosmos3-Nano` y etiquetada con `cosmos3_omni`, lo que apunta a una pila multimodal que consume observaciones visuales e instrucción de tarea y emite acciones. No se detallan en la model card el número de capas, el mecanismo de atención, la presencia de mezcla de expertos, la longitud de contexto ni el tokenizador; estos datos deben considerarse no disponibles. El checkpoint se publica como export del estado de entrenamiento con pesos EMA promediados, en bf16 y dividido en siete shards, y requiere código personalizado (`custom_code`) del framework `cosmos-framework` para su carga.

El posentrenamiento se realizó sobre LIBERO-10 con 379 demostraciones reales más 1137 duplicados generados a partir de la iteración 1000, con semilla de entrenamiento 43. El régimen declarado es una reanudación del control R(seed 43) en la iteración 1000 hasta la 2000, con batch global de 2048. No se documentan fases de RLHF o DPO, ni la composición completa del dataset más allá de LIBERO-10 y de los conjuntos reestilizados que la receta regenera. Los datos de entrenamiento no se redistribuyen en el repositorio; LIBERO-10 está disponible como `nvidia/LIBERO_LeRobot_v3`.

## Capacidades

- Predicción de acciones robóticas a partir de observación visual e instrucción de tarea, en el formato y las tareas de LIBERO-10.
- Ejecución de políticas de manipulación de horizonte corto en las 10 tareas de LIBERO-10 (evaluado sobre 50 estados iniciales por tarea).
- Robustez medida frente a perturbaciones visuales: iluminación, texturas, skybox y jitter de cámara aleatorizados (85,5 ± 2,5 % de éxito).
- Entrada multimodal imagen + texto, coherente con la etiqueta `cosmos3_omni` y con la categoría VLA.
- Servicio como política en bucle cerrado mediante el servidor de políticas de `cosmos-framework` v1.2.2.
- Punto de partida para posentrenamiento en otras tareas de manipulación mediante la misma receta.
- Sin soporte documentado de tool calling, function calling, razonamiento multi-paso, agentes, código, matemáticas, audio o modo «thinking». No aplicable al propósito del checkpoint.

## Casos de uso

- **Línea base reproducible en LIBERO-10**: sirve como referencia cuantitativa (93,3 ± 0,7 % en escenas estándar) para comparar nuevas políticas o nuevos conjuntos de datos sintéticos sobre el mismo benchmark, con la ventaja de que el protocolo de evaluación está descrito (10 tareas × 50 estados iniciales × 3 semillas).
- **Medición de robustez sim-to-sim**: al estar evaluado también en escenas perturbadas (85,5 ± 2,5 %), permite cuantificar la caída de rendimiento ante cambios de iluminación, texturas, skybox y cámara sin necesidad de montar un entorno real.
- **Estudios controlados de aumento de datos**: es una celda concreta (D2_s43) de un experimento de datos sintéticos; se usa junto a su control R(seed 43) para aislar el efecto del reestilizado de demostraciones, siempre con la advertencia de que diferencias menores de 2,5 puntos no son significativas.
- **Barrido de semillas de entrenamiento**: al existir por semilla y celda, permite estimar la dispersión entre semillas y decidir si una mejora observada es atribuible al método o al azar, antes de invertir en evaluación sobre hardware físico.
- **Prototipado de infraestructura de evaluación**: al cargarse con el servidor de políticas de `cosmos-framework`, se puede integrar en un pipeline que reciba observaciones y devuelva acciones, útil para validar la latencia y el bucle de control antes de pasar a un robot real.
- **Inicialización para posentrenamiento en nuevas tareas**: al ser un export de checkpoint completo con pesos EMA, puede reutilizarse como punto de partida para ajuste en otras suites de manipulación, reduciendo el coste frente a entrenar desde `nvidia/Cosmos3-Nano`.
- **Reproducción docente de la receta del Cosmos Cookbook**: útil en cursos y grupos de investigación que quieran reproducir paso a paso un experimento de generación de datos sintéticos con métricas publicadas y control emparejado.

## Benchmarks y rendimiento

| Benchmark | Condición | Métrica | Resultado | Notas |
|---|---|---|---|---|
| LIBERO-10 | Escenas estándar | Tasa de éxito | 93,3 ± 0,7 % | 10 tareas × 50 estados iniciales, tres semillas de evaluación; valores reportados por el propio entrenamiento, registro pendiente |
| LIBERO-10 | Escenas perturbadas | Tasa de éxito | 85,5 ± 2,5 % | Iluminación, texturas, skybox y jitter de cámara aleatorizados; medido en el banco de evaluación el 2026-10-19 |
| Control R(seed 43) | Escenas perturbadas | Tasa de éxito | No disponible | El control no fue evaluado en el punto de 2000 iteraciones sobre escenas perturbadas |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la información disponible; el modelo es una política de acción y su evaluación se limita a tasas de éxito en LIBERO-10.

## Requisitos de hardware

- Pesos en bf16: 15,17 mil millones de parámetros × 2 bytes ≈ 30,3 GB, coherente con los ~30 GB del export y los 31,5 GB del repositorio.
- VRAM estimada para inferencia en bf16: 34-40 GB incluyendo activaciones y buffers del servidor de políticas (estimación a partir del tamaño de los pesos; no publicada por el autor).
- GPU recomendadas: H100 80 GB o A100 80 GB para servicio sin restricciones; A100 40 GB y L40S 48 GB como opciones ajustadas; conviene prever várias GPUs si se quiere batching.
- GPU de consumo: no cabe en bf16 en ninguna tarjeta de 24 GB. Con cuantización a 8 bits (≈16 GB de pesos) podría encajar en RTX 4090 o RTX 3090 de 24 GB, y a 4 bits (≈8-9 GB) en tarjetas de 16 GB, pero no se documentan métodos de cuantización para esta arquitectura ni se distribuyen pesos cuantizados.
- Despliegue: servidor de políticas de `cosmos-framework` v1.2.2 (commit `c23e51f2`), con `custom_code` y librería `cosmos`. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO-10 estándar | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cosmos3-nano-libero10-sdg-export-D2_s43` (este) | 15,17 B | No disponible | 93,3 ± 0,7 % | NVIDIA Open Model License | HuggingFace, 14 descargas |
| Control R(seed 43) | No disponible | No disponible | No disponible | Derivado de NVIDIA Open Model License | No publicado como checkpoint en la información disponible |
| `nvidia/Cosmos3-Nano` (base, rev. `e59a53c2`) | No disponible | No disponible | No disponible (no es una política posentrenada en LIBERO-10) | NVIDIA Open Model License | HuggingFace |
| Otras familias VLA de manipulación (OpenVLA, π0, GR00T N1) | No disponible en la información suministrada | No disponible | No disponible | Varía según modelo | Varía según modelo |

La comparación relevante dentro del material proporcionado es la del checkpoint frente a su control emparejado, no frente a otras familias: la model card insiste en que una celda reestilizada solo es interpretable junto a su duplicado de control y que diferencias inferiores a 2,5 puntos están dentro de la dispersión entre semillas. No se dispone de datos de benchmarks de otras familias VLA en la información suministrada para establecer una comparación numérica fiable.

## Limitaciones y advertencias

- No es un modelo de propósito general: no hay evidencia ni declaración de soporte para generación de texto libre, código, matemáticas, tool calling o agentes.
- Evaluación restringida a un único benchmark (LIBERO-10) y a un único tipo de entorno: manipulación de mesa en simulación. No se documenta ninguna validación en robot físico.
- El propio autor advierte que diferencias por debajo de 2,5 puntos porcentuales quedan dentro de la dispersión entre semillas de entrenamiento; el checkpoint no debe citarse como mejora sin su control.
- Los resultados en escenas estándar están marcados como «record pending»: proceden del registro del entrenamiento y no de un acta de evaluación formal.
- La brecha entre escenas estándar y perturbadas es de unos 7,8 puntos, de modo que en condiciones visuales distintas a las de entrenamiento la tasa de fallo ronda el 14,5 %.
- Los datos de entrenamiento incluyen 1137 duplicados generados en la iteración 1000 sobre 379 demostraciones reales: existe riesgo de sobreajuste a la distribución de LIBERO-10 y de amplificación de sesgos presentes en las demostraciones originales. No se documentan sesgos específicos.
- El dataset de entrenamiento no se redistribuye; la reproducibilidad depende de regenerar los conjuntos restilizados con la receta del Cosmos Cookbook.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingüe en las instrucciones de tarea.
- La licencia NVIDIA Open Model License no es una licencia de código abierto aprobada por la OSI; es responsabilidad del integrador revisar los términos de uso comercial, redistribución y despliegue en producción antes de adoptar el modelo.
- Requiere `cosmos-framework` v1.2.2 y código personalizado; no es cargable de forma directa con `transformers`, lo que añade dependencia de una versión concreta del framework.
- No hay información sobre cuantización, por lo que el despliegue en GPU de consumo queda como estimación teórica no validada.
- Los resultados de búsqueda web consultados no aportan información técnica sobre el modelo: solo devuelven páginas corporativas y de descarga de controladores de NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/cosmos3-nano-libero10-sdg-export-D2_s43
- Modelo base `nvidia/Cosmos3-Nano`: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia (enlace indicado por el autor): https://huggingface.co/nvidia/Cosmos3-Nano
- Dataset LIBERO-10 en formato LeRobot: `nvidia/LIBERO_LeRobot_v3` (referenciado en la model card; no se proporciona URL completa)
- Receta del Cosmos Cookbook «Restyle LIBERO-10 Demonstrations with Cosmos3-Nano-Sim-Transfer and Measure the Gain Against a Matched Control»: no disponible (no se proporciona URL)
- Repositorio de `cosmos-framework` v1.2.2 (commit `c23e51f2`): no disponible (no se proporciona URL)
- Paper técnico: no disponible en la información suministrada
