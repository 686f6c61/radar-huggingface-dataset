# hjkso1406/groot-peft-so101-3tasks-aug

## Resumen

`hjkso1406/groot-peft-so101-3tasks-aug` es una política robótica (policy) publicada en Hugging Face por el usuario `hjkso1406`, entrenada y subida con la librería LeRobot de Hugging Face. Se trata de un ajuste fino mediante PEFT (técnicas de adaptación eficiente de parámetros, presumiblemente LoRA u similar) sobre lo que el nombre del repositorio identifica como `groot`, es decir, la familia de modelos fundacionales de robótica GR00T de NVIDIA. El modelo está especializado en tres tareas de manipulación ejecutadas con el brazo robótico de bajo coste SO-101 (variante del SO-100 de The Robot Studio), y se ha entrenado con el dataset `hjkso1406/so101-3tasks-100eps`, compuesto por 100 episodios de demostración de esas tres tareas.

El modelo ocupa 2.431.961.024 parámetros (unos 2,43 mil millones) y el repositorio pesa 7,0 GB, lo que es coherente con un checkpoint de pesos completos en precisión de 16 bits más configuraciones asociadas. El sufijo `-aug` del identificador sugiere que el entrenamiento incorporó aumentación de datos, aunque la model card no documenta ni el tipo ni el alcance de dicha aumentación. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y la etiqueta de pipeline es `robotics`.

La relevancia de esta ficha es acotada pero real: se trata de un artefacto de investigación temprana (0 descargas y 0 likes en el momento de la consulta) que ilustra el flujo de trabajo de personalización de políticas VLA (vision-language-action) sobre brazos de bajo coste usando LeRobot y PEFT. La model card es prácticamente una plantilla sin rellenar: no documenta arquitectura, datos de entrenamiento detallados, idiomas, benchmarks ni requisitos de hardware, por lo que buena parte de las especificaciones de esta ficha figuran como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Etiquetada como `groot_peft`; por nomenclatura y por el recuento de parámetros (2,43 B) apunta a un ajuste PEFT sobre el modelo fundacional de robótica NVIDIA GR00T (familia N1, ~2 B). No confirmado por el autor. |
| Parámetros totales | 2.431.961.024 (2,43 mil millones), dato del archivo safetensors |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE). No disponible. |
| Longitud de contexto | No disponible (no aplica en el sentido de un LLM de texto; la política consume observaciones de cámara y estado del robot más una instrucción de tarea) |
| Tipos de cuantización | No se publican variantes cuantizadas. El repositorio contiene pesos en `safetensors` |
| Idiomas soportados | No disponible (no se especifica el idioma de las instrucciones de tarea del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (librería `lerobot`) |
| Pipeline declarado | `robotics` |
| Dataset de entrenamiento | `hjkso1406/so101-3tasks-100eps` (100 episodios, 3 tareas) |
| Robot objetivo | SO-101 |
| Tamaño del repositorio | 7,0 GB |
| Fecha de creación / actualización | 2026-09-11 (creación y última actualización el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo. Las etiquetas de Hugging Face (`lerobot`, `groot_peft`, `robotics`) y el recuento de parámetros permiten inferir que se trata de una política viso-lenguaje-acción derivada del modelo GR00T de NVIDIA, adaptada mediante PEFT en lugar de un ajuste fino completo. Los modelos GR00T combinan habitualmente un codificador visión-lenguaje con una cabeza de difusión que genera secuencias de acciones motoras, pero esta afirmación corresponde a conocimiento general sobre la familia GR00T y no está confirmada en la model card del repositorio, que se limita a indicar "Model type not recognized — please update this template".

Respecto al entrenamiento, lo único documentado es el dataset empleado (`so101-3tasks-100eps`: 100 episodios repartidos en tres tareas) y el sufijo `aug`, que sugiere aumentación de datos. No se especifica el número de pasos de entrenamiento, el tamaño de lote, la tasa de aprendizaje, la composición exacta del dataset, ni si se aplicaron fases de RLHF, DPO o *reward modeling*. Tampoco se detalla la configuración de PEFT (rango de LoRA, módulos objetivo, si se congeló el codificador visual). El autor remite a la guía genérica de LeRobot para el flujo de entrenamiento, con un ejemplo de comando que usa `--policy.type=act`, lo que probablemente es un residuo de la plantilla y no refleja la política realmente entrenada.

## Capacidades

- Control robótico por imitación: genera comandos de acción motora para el brazo SO-101 a partir de observaciones visuales y del estado del robot.
- Ejecución de tres tareas específicas de manipulación, aprendidas del dataset `so101-3tasks-100eps`.
- Acondicionamiento por instrucción de tarea (comportamiento propio de los modelos VLA tipo GR00T, no confirmado explícitamente en la model card).
- Personalización eficiente mediante PEFT: al ser un ajuste de adaptadores, es reutilizable como base para nuevos ajustes con coste computacional reducido.
- Compatibilidad con el ecosistema LeRobot: entrenamiento con `lerobot-train`, inferencia y evaluación con `lerobot-record` sobre robots `so100_follower`.
- No hay evidencia de soporte de *tool calling*, function calling, razonamiento multi-paso, agentes basados en texto, visión general, audio, ni modo de razonamiento extendido (*thinking*). Estas capacidades no aplican a una política robótica de este tipo y no están documentadas.
- Capacidades multilingües: no disponibles ni documentadas.

## Casos de uso

- Automatización de tres tareas de manipulación en un brazo SO-101: la política se carga en LeRobot y se ejecuta sobre el `so100_follower` mediante `lerobot-record --policy.path`, cubriendo las tareas exactas con las que fue entrenada. Es el uso directo y realista del checkpoint.
- Reproducción y validación de experimentos de ajuste PEFT en robótica: sirve como referencia para comparar el coste y el rendimiento de afinar solo adaptadores frente a un ajuste fino completo de un modelo GR00T de ~2 B de parámetros.
- Punto de partida para transfer learning en tareas nuevas: al tratarse de un modelo adaptado con PEFT sobre un modelo fundacional, es un candidato razonable para entrenar nuevas tareas con pocos episodios adicionales, siempre que se verifique que la base subyacente es accesible.
- Docencia y formación en robótica de bajo coste: el binomio SO-101 más LeRobot permite montar prácticas de aprendizaje por imitación en laboratorios con presupuesto limitado, usando este checkpoint como ejemplo ya entrenado.
- Investigación en aumentación de datos para políticas visomotoras: el sufijo `aug` permite estudiar si la aumentación mejora la generalización entre posiciones de objeto o condiciones de iluminación, aunque el autor no publica esa comparación.
- Evaluación comparativa de políticas en el mismo robot: usar este modelo como uno de los brazos de comparación frente a ACT, Diffusion Policy o SmolVLA dentro del mismo *benchmark* interno de tres tareas.
- Prototipado de células de pick-and-place en entornos controlados: con 100 episodios y tres tareas, el modelo es adecuado para demostraciones de laboratorio, no para líneas de producción con variabilidad alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, curvas de aprendizaje, comparaciones con políticas base ni métricas de simulación o de robot real. Tampoco se documentan latencia de inferencia ni frecuencia de control alcanzada.

## Requisitos de hardware

- VRAM estimada para inferencia: los 2,43 B de parámetros ocupan aproximadamente 4,9 GB en FP16/BF16 y unos 9,7 GB en FP32. Sumando el codificador visual, los búferes de activación y el estado del robot, conviene reservar del orden de 8 a 12 GB de VRAM en FP16. Cifra estimada a partir del recuento de parámetros, no publicada por el autor.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para entrenamiento y evaluación cómoda. Para inferencia en FP16 basta una GPU con 12 GB o más.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090. En GPUs de 8 GB exigiría cuantización o *offloading*, no documentados.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) sobre PyTorch con CUDA; es el único flujo documentado. No hay soporte declarado para vLLM, TGI, llama.cpp, Ollama ni GGUF, formatos que además no encajan con una cabeza de acción robótica.
- El repositorio ocupa 7,0 GB, lo que implica que la descarga del checkpoint completo requiere ese espacio en disco, además del dataset de evaluación que se genere.
- Latencia y throughput: no disponibles. Para control robótico en tiempo real se necesitaría verificar que la política alcanza la frecuencia de control del SO-101, dato que el autor no aporta.

## Comparativa con modelos similares

Los valores de las alternativas proceden de conocimiento general sobre el ecosistema LeRobot y deben verificarse contra sus fichas oficiales; no forman parte de la información proporcionada para este modelo.

| Modelo | Parámetros | Contexto / tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| `hjkso1406/groot-peft-so101-3tasks-aug` | 2,43 B | Política VLA para SO-101, 3 tareas, 100 episodios | Apache 2.0 | Hugging Face, 0 descargas |
| ACT (Action Chunking Transformer) | Del orden de 10^7–10^8 según configuración (aprox.) | Política de imitación para brazos tipo ALOHA/SO-100 | Apache 2.0 en LeRobot | Integrada en LeRobot, ampliamente usada |
| Diffusion Policy | Del orden de 10^8 (aprox.) | Política de imitación basada en difusión | Apache 2.0 en LeRobot | Integrada en LeRobot |
| SmolVLA | ~0,45 B (aprox.) | VLA compacto orientado a *hardware* de consumo | Apache 2.0 | Hugging Face / LeRobot |
| GR00T N1 (base) | ~2 B (aprox.) | Modelo fundacional VLA de propósito general para robots | Ver licencia de NVIDIA | Hugging Face |

La diferencia clave frente a ACT o Diffusion Policy es el orden de magnitud en número de parámetros y el enfoque VLA frente a políticas puramente visomotoras. Frente a SmolVLA, este checkpoint es aproximadamente cinco veces mayor, aunque no hay datos públicos de rendimiento que permitan afirmar que esa diferencia se traduzca en mejores tasas de éxito.

Valores de referencia del propio modelo comparado: parámetros 2.431.961.024, licencia Apache 2.0, dataset de 100 episodios y 3 tareas. Para el resto de columnas de las alternativas, no disponible en la información proporcionada.

## Limitaciones y advertencias

- Model card prácticamente vacía: la plantilla no se completó ("Model type not recognized"), de modo que arquitectura, datos de entrenamiento y evaluación son desconocidos.
- Especialización muy estrecha: solo tres tareas y 100 episodios. La generalización a objetos, posiciones o iluminaciones no vistas no está demostrada ni medida.
- Sesgos: no documentados. En robótica por imitación, los sesgos provienen de las trayectorias humanas de demostración (posiciones, velocidades y estrategias repetidas), lo que puede producir comportamientos rígidos ante perturbaciones.
- Riesgo de fallo silencioso: una política de imitación puede generar acciones plausibles pero incorrectas sin señal de error. No hay mecanismo de abstención ni de detección de fuera de distribución documentado.
- Ausencia total de benchmarks: no se puede comparar su tasa de éxito con alternativas ni estimar su fiabilidad antes de desplegarla.
- Limitaciones de contexto e idioma: no disponibles. Si el modelo acepta instrucciones en lenguaje natural, se desconoce en qué idioma se entrenó y si soporta otros.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No obstante, si el modelo deriva de pesos de NVIDIA GR00T, habría que verificar que la licencia de la base es compatible con la relicenciación Apache 2.0, extremo que la ficha no aclara.
- Caveat de producción: 0 descargas y 0 likes, sin validación por parte de terceros. No se recomienda su uso en entornos reales sin una evaluación propia en el robot objetivo.
- Texto de la model card potencialmente engañoso: el ejemplo de comando usa `--policy.type=act`, lo que puede inducir a error sobre la arquitectura real del checkpoint.
- Fecha de creación registrada como 2026-09-11, lo que conviene contrastar con la cronología real del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hjkso1406/groot-peft-so101-3tasks-aug
- Dataset de entrenamiento: https://huggingface.co/datasets/hjkso1406/so101-3tasks-100eps
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Búsqueda web realizada: no se han encontrado enlaces relevantes sobre este modelo, su autor ni el dataset asociado. Los resultados devueltos corresponden a páginas no relacionadas (calculadoras y conversores de unidades) y se descartan por no aportar información utilizable.
