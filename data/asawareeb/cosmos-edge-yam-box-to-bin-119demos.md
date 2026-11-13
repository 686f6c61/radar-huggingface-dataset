# asawareeb/Cosmos-Edge-YAM-box-to-bin-119demos

## Resumen

Cosmos-Edge-YAM-box-to-bin-119demos es un checkpoint de política robótica nativa (no un modelo de lenguaje) desarrollado por el usuario asawareeb y publicado en Hugging Face bajo el paraguas de la familia Cosmos de NVIDIA. Concretamente, se trata de una iteración (paso 1500) del modelo Cosmos3 Edge aplicado a la tarea concreta de abrir una caja y cargar todos los objetos en la caja amarilla, entrenado sobre 119 demostraciones de manipulación con un brazo robótico YAM Ultra 2. El repositorio ocupa 38,4 GB y contiene el checkpoint original en formato PyTorch Distributed Checkpoint (DCP), no un export estándar de Transformers.

El modelo resuelve el problema de aprendizaje de políticas visuomotoras de extremo a extremo para un dominio robótico específico (`yam_right_joint`), mapeando observaciones visuales y estado de las articulaciones a comandos de control a 15 Hz. Su relevancia es doble: por un lado, demuestra el flujo de trabajo de Cosmos3 Edge para adaptar un modelo fundacional robótico a una tarea concreta con pocas demostraciones; por otro, incluye registros de despliegue físico en hardware real (YAM Ultra 2) con marcas de tiempo y huellas de metadatos que permiten verificar la procedencia del checkpoint.

La información pública disponible es limitada: no hay model card extendida, no se publican benchmarks de tasa de éxito y la licencia no está especificada. La ficha se limita, por tanto, a lo que el autor documenta en el README y a las especificaciones inferidas del contrato de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 Edge (política visuomotora nativa, familia Cosmos de NVIDIA); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana de observación visual 640×832 RGB) |
| Tipos de cuantizacion | no disponible (checkpoint DCP en precisión original) |
| Idiomas soportados | en (etiqueta del repositorio) |
| Licencia | no disponible |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP): `model/`, `optim/`, `scheduler/`, `trainer/`; requiere loader compatible con Cosmos, no `from_pretrained` de Transformers |
| Dominio de acción | `yam_right_joint` (6 posiciones absolutas de articulación + pinza normalizada en crudo) |
| Frecuencia de control | 15 Hz, 32 acciones por paso |
| Entrada visual | lienzo RGB nativo 640×832; imagen de muñeca sobre imagen egocéntrica recortada |
| Condicionamiento | por estado (state conditioning), sin inversión de pinza |
| Iteración de entrenamiento | 1500 |
| Demostraciones | 119 |
| SHA-256 de metadatos | `c625ee95c4dc345affec856e7fd2565089238da5f70e4cde7f48568986289397` |
| Tamaño del repositorio | 38,4 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Cosmos3 Edge, orientada a inferencia en el borde (edge) para robótica. El autor lo describe como una "native policy" entrenada durante 1500 iteraciones sobre 119 demostraciones de la tarea "abrir la caja y cargar todos los objetos en la caja amarilla". No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por imitación supervisada más allá de la mención a las demostraciones. Tampoco se detallan innovaciones arquitectónicas internas (atención, decodificación especulativa u otras).

El checkpoint se distribuye en formato PyTorch Distributed Checkpoint completo, incluyendo estados de modelo, optimizador, scheduler y trainer, lo que permite reanudar el entrenamiento o inspeccionar el proceso. Se conservan los ficheros shard de rango de longitud cero del checkpoint original. El contrato de despliegue especifica un condicionamiento por estado de las articulaciones, sin inversión de la pinza, y una disposición visual concreta (imagen de muñeca sobre imagen egocéntrica recortada) que debe respetarse para que la política funcione.

## Capacidades

- Generación de comandos de control robótico: produce 32 acciones a 15 Hz correspondientes a 6 posiciones absolutas de articulación del brazo derecho YAM más la pinza normalizada en crudo.
- Política visuomotora condicionada por estado: integra observación visual (640×832 RGB) y estado de las articulaciones para generar acciones.
- Ejecución de una tarea de manipulación concreta: abrir una caja y trasladar objetos a una caja amarilla.
- Despliegue físico verificado: existen registros de rollout en un YAM Ultra 2 con dry-run desactivado, comandos de política y posiciones de articulación medidas.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión general o audio; el modelo está especializado en control robótico.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje natural como interfaz principal.

## Casos de uso

- Automatización de picking y packing en almacén: la política puede ejecutar la secuencia de abrir una caja y depositar objetos en un contenedor amarillo, integrándose en una celda robotizada con brazo YAM Ultra 2 a 15 Hz.
- Investigación en aprendizaje por imitación con pocas demostraciones: sirve como referencia reproducible para estudiar cómo 119 demostraciones bastan para adaptar un modelo Cosmos3 Edge a una tarea nueva.
- Validación de pipelines de despliegue Cosmos: al incluir checkpoint DCP completo (modelo, optimizador, scheduler, trainer), permite probar cargadores compatibles con el framework Cosmos y verificar la reanudación de entrenamiento.
- Auditoría de procedencia de políticas robóticas: el SHA-256 de metadatos y los registros de rollout con huella de metadatos permiten trazar qué checkpoint generó qué comandos en pruebas físicas.
- Benchmark interno de control a 15 Hz: útil para medir latencia y estabilidad de la política en hardware real frente a simuladores, aunque no se publica tasa de éxito.
- Base para fine-tuning en tareas de manipulación similares: partiendo de esta iteración 1500, un equipo puede continuar el entrenamiento con nuevas demostraciones del mismo dominio `yam_right_joint`.
- Docencia y demostraciones de robótica de borde: el tamaño de 38,4 GB y la orientación edge de Cosmos3 permiten ilustrar el despliegue de políticas en estaciones de trabajo con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los registros de pruebas físicas "establecen que hubo pruebas físicas, no una tasa de éxito de la tarea". Se documenta un rollout del 29 de septiembre en servidor local con 93 resultados de inferencia y 744 registros de comandos de política que coinciden con la huella de metadatos del checkpoint, pero no se traduce en métricas de éxito, precisión ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 38,4 GB incluye modelo, optimizador, scheduler y trainer, por lo que el peso del modelo es inferior a esa cifra, pero no se especifica.
- GPU recomendadas: no disponible en la información proporcionada. El autor menciona un "workstation rollout" y un "local-server rollout" sin detallar GPU.
- Compatibilidad con GPU de consumo: no confirmada. La orientación edge de Cosmos3 sugiere viabilidad en hardware compacto, pero no hay datos concretos.
- Opciones de despliegue: requiere un loader compatible con el framework Cosmos; no es compatible con `from_pretrained` de Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política robótica.
- Latencia y throughput: se especifica control a 15 Hz (32 acciones por paso), lo que implica un presupuesto de unos 66 ms por paso de política; no se publican latencias medidas.
- Hardware físico de referencia: YAM Ultra 2, con pruebas registradas el 28 y 29 de septiembre de 2026; la configuración actual puede diferir de la registrada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints comparables de la familia Cosmos3 Edge, ni políticas robóticas alternativas (por ejemplo, RT-2, OpenVLA u Octo) con datos que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia. Cualquier comparación numérica sería inventada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial; es necesario contactar con el autor o consultar el repositorio antes de cualquier despliegue productivo.
- Especialización extrema: la política está entrenada para una única tarea (box-to-bin) y un único dominio (`yam_right_joint`); no generaliza a otras tareas, brazos o morfologías sin reentrenamiento.
- Sin métricas de éxito: las pruebas físicas documentadas no acreditan una tasa de éxito, por lo que no hay evidencia cuantitativa de fiabilidad.
- Riesgo de alucinación en el sentido robótico: como toda política aprendida, puede generar comandos fuera de distribución ante cambios de iluminación, posiciones de objetos o configuraciones de hardware distintas a las del entrenamiento.
- Dependencia de la configuración visual: el contrato exige un lienzo 640×832 con imagen de muñeca sobre imagen egocéntrica recortada; desviarse de esta disposición puede degradar el rendimiento.
- Condicionamiento por estado sin inversión de pinza: cualquier cambio en la convención de la pinza o en la lectura de las articulaciones invalida la política.
- Formato de checkpoint no estándar: requiere un loader Cosmos específico; no se puede cargar con herramientas genéricas de Transformers.
- Ficheros shard de longitud cero: el checkpoint conserva shards vacíos del original, lo que puede requerir filtrado en algunos cargadores.
- Sesgos conocidos: no documentados; al entrenarse con 119 demostraciones de un entorno concreto, hereda los sesgos de esa configuración física y de las condiciones de captura.
- Idiomas: la etiqueta `en` no implica capacidad de procesamiento de lenguaje; el modelo no es un LLM conversacional.

## Enlaces

- Hugging Face: https://huggingface.co/asawareeb/Cosmos-Edge-YAM-box-to-bin-119demos
- Resultado de búsqueda web proporcionado (contexto sobre LLM en NVIDIA Jetson Orin, no específico del modelo): https://quelllm.fr/guide/jetson-orin-llm-edge
- No se han encontrado en la información disponible papers, blogs, repositorios de código ni demos adicionales asociados a este checkpoint.
