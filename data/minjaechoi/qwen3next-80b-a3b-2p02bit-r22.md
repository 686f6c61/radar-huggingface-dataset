# minjaechoi/qwen3next-80b-a3b-2p02bit-r22

## Resumen

`minjaechoi/qwen3next-80b-a3b-2p02bit-r22` es un checkpoint de investigación derivado de `Qwen/Qwen3-Next-80B-A3B-Thinking`, en el que los expertos enrutados de las capas MoE se han cuantizado a una media de 2,0161 bits por peso, mientras que el resto de los pesos (atención, embeddings, experto compartido y demás componentes) permanece en BF16. El autor lo identifica internamente como «r22» y lo publica como material de estudio, no como un modelo listo para producción.

La relevancia del checkpoint es acotada pero concreta: explora el límite práctico de compresión de los expertos enrutados de un MoE híbrido de gran tamaño y permite medir la degradación asociada a una representación de 2 bits. Un detalle importante para quien vaya a desplegarlo es que los pesos se almacenan **ya desquantizados en tensores BF16**, de modo que no hay ningún ahorro de memoria respecto al modelo base: el repositorio ocupa 162,7 GB, coherente con 81.324.862.720 parámetros a 16 bits.

El modelo se publica bajo la librería `transformers`, con pesos en `safetensors`, 198 descargas y 0 «likes» en el momento de redactar esta ficha. La licencia no se declara en la ficha y el autor indica que hereda la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE), heredado del modelo base Qwen3-Next-80B-A3B-Thinking: capas de Gated DeltaNet (atención lineal) intercaladas con capas de Gated Attention |
| Parametros totales | 81.324.862.720 (81,3 mil millones), dato real de los tensores `safetensors` |
| Parametros activos | Aproximadamente 3 mil millones (según la nomenclatura «A3B» del modelo base); no se detalla en la ficha del checkpoint |
| Longitud de contexto | 262.144 tokens en el modelo base; no se especifica en la ficha de este checkpoint |
| Tipos de cuantizacion | Expertos enrutados a 2,0161 bits de media (identificador interno r22); el resto de pesos en BF16. Los pesos se almacenan desquantizados en tensores BF16, por lo que no se distribuyen ficheros GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha; el autor indica que sigue la licencia del modelo base (Qwen/Qwen3-Next-80B-A3B-Thinking), que no se detalla en la información proporcionada |
| Formato de pesos | safetensors (carga con `transformers`) |
| Modelo base | Qwen/Qwen3-Next-80B-A3B-Thinking |
| Tamaño del repositorio | 162,7 GB |
| Tarea declarada | text-generation |

## Arquitectura y entrenamiento

Este checkpoint no introduce un entrenamiento nuevo: es una transformación de pesos sobre `Qwen/Qwen3-Next-80B-A3B-Thinking`. La única modificación descrita es la cuantización de los expertos enrutados a un promedio de 2,0161 bits, manteniendo en BF16 todos los demás tensores. Al guardarse desquantizado, el resultado es un modelo con el mismo grafo computacional y el mismo consumo de memoria que el base, pero cuyos expertos arrastran el error de una representación de muy baja precisión. El número de tokens de entrenamiento, la composición del dataset y si hubo RLHF o DPO no están disponibles en la información proporcionada; corresponden al modelo base y no se documentan aquí.

La arquitectura subyacente es la de Qwen3-Next: un transformer híbrido que combina capas de Gated DeltaNet (atención lineal con estado recurrente de tamaño constante) con capas de Gated Attention (atención completa), y una capa MoE con un gran número de expertos enrutados más un experto compartido. Esta combinación reduce el coste de la atención en contextos muy largos y concentra la capacidad en los expertos, que son precisamente el objetivo de la cuantización agresiva de este checkpoint. La innovación técnica destacable, por tanto, no está en el modelo sino en el experimento: comprobar hasta qué punto el conocimiento almacenado en expertos poco activados tolera 2 bits por peso.

## Capacidades

- Generación de texto y conversación multiturno en modo instrucciones, heredadas del modelo base.
- Razonamiento explícito en modo *thinking*: la variante del modelo base genera una cadena de razonamiento antes de la respuesta final, y este checkpoint conserva esa plantilla de chat.
- Resolución de problemas de matemáticas y lógica de varios pasos, dentro de los límites del modelo base.
- Generación y explicación de código, sujeta a la degradación que haya podido introducir la cuantización (no medida).
- Procesamiento de contextos muy largos (hasta 262.144 tokens en el modelo base), útil para documentos extensos y repositorios completos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso con llamadas a herramientas: no disponible en la información proporcionada.
- Capacidades de visión o audio: ninguna; el modelo es exclusivamente de texto.
- No se han publicado evaluaciones específicas de este checkpoint, por lo que no puede afirmarse que conserve ninguna de estas capacidades con una calidad determinada.

## Casos de uso

- Estudio de la degradación por cuantización extrema en MoE: comparar las salidas del checkpoint r22 con las del modelo base BF16 sobre el mismo conjunto de *prompts* para cuantificar la pérdida de calidad atribuible a los 2,0161 bits de los expertos. Es el uso para el que el autor lo plantea.
- Investigación sobre el comportamiento de Gated DeltaNet bajo ruido de cuantización: analizar si el estado recurrente de las capas lineales amplifica o amortigua el error introducido en los expertos.
- Generación de datos sintéticos con un modelo «profesor»: usar el checkpoint para producir razonamientos y respuestas etiquetadas con las que entrenar modelos más pequeños, asumiendo que la calidad del profesor está limitada por la cuantización.
- Análisis de documentos largos: gracias a los 262.144 tokens de contexto del modelo base, permite resumir o extraer información de expedientes, normativa o documentación técnica extensa sin truncar el material.
- Asistencia a la programación en entornos internos con GPU de centro de datos: revisión de código y generación de *tests* dentro de un pipeline, siempre que se acepte el coste de servir un modelo de 81,3 mil millones de parámetros.
- Evaluación comparativa de *runtimes* de inferencia para arquitecturas híbridas: medir el rendimiento de `transformers` frente a vLLM con un modelo que combina atención lineal y atención completa, un caso poco frecuente en los *benchmarks* habituales.
- Experimentos académicos sobre asignación de precisión por componente: usar los expertos a 2 bits como punto de referencia para decidir qué partes de un MoE conviene cuantizar primero.
- Reproducción de resultados de cuantización: al publicarse los pesos completos en safetensors, permite repetir el experimento sin reentrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye ninguna tabla de evaluación, ni del checkpoint ni de la diferencia respecto al modelo base, y los resultados de búsqueda no aportan datos al respecto. Tampoco hay cifras de latencia o *throughput* publicadas.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 162,7 GB en BF16 desquantizado; hay que sumar activaciones y caché KV, por lo que conviene reservar al menos 180-200 GB en total para trabajar con comodidad.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojarlo, ni siquiera repartiendo capas entre varias tarjetas de consumo de forma razonable.
- Configuración mínima realista: 4×A100 80 GB o 4×H100 80 GB con paralelismo tensorial. Dos H100 de 80 GB cubren los pesos por poco margen, pero dejan muy poco espacio para caché KV y activaciones.
- Configuración recomendada: 2×H200 (141 GB cada una) o 8×H100 80 GB para servicio concurrente.
- Opciones de despliegue: `transformers` (soporte declarado por el autor) y vLLM (el autor afirma que los pesos cargan con vLLM estándar). El soporte en llama.cpp, Ollama o TGI no está confirmado y, dado que se trata de una arquitectura híbrida con Gated DeltaNet, no puede darse por hecho.
- Latencia y *throughput*: no disponible.
- *Offload* a CPU o a disco: técnicamente posible con `accelerate`, pero inviable en términos de latencia para cualquier uso interactivo.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a la información proporcionada para este checkpoint y, en el caso de los modelos oficiales, a su documentación pública; no forman parte de los resultados de búsqueda.

| Modelo | Parámetros (total / activos) | Contexto | Precisión de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen3next-80b-a3b-2p02bit-r22 | 81,3B / ~3B | 262.144 (heredado del base, no confirmado en la ficha) | Expertos enrutados a 2,0161 bits, resto BF16 (almacenado en BF16) | Hereda la del modelo base; no declarada | 198 descargas, sin evaluaciones publicadas |
| Qwen/Qwen3-Next-80B-A3B-Thinking | 80B / 3B | 262.144 | BF16 | Apache 2.0 según la documentación pública de Qwen, no verificada aquí | Modelo oficial, con mantenimiento |
| Qwen/Qwen3-235B-A22B | 235B / 22B | 128K | BF16 | Apache 2.0 según la documentación pública de Qwen, no verificada aquí | Modelo oficial; requiere mucha más VRAM |
| Qwen/Qwen3-32B | 32,8B / denso | 128K | BF16 | Apache 2.0 según la documentación pública de Qwen, no verificada aquí | Modelo oficial; cabe en 2×A100 40 GB en BF16 |

No se dispone de métricas comparativas de calidad entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: la propia ficha lo califica como «internal research checkpoint», con 198 descargas y ninguna evaluación publicada. No es un modelo validado para producción.
- Degradación desconocida: la cuantización a 2,0161 bits afecta a los expertos enrutados, pero el autor no publica ninguna medición del impacto en perplejidad, razonamiento o código. Es un riesgo abierto e impredecible.
- Sin ahorro de memoria: aunque el promedio de bits de los expertos sea 2,0161, los pesos se guardan desquantizados en BF16. El coste de inferencia es el mismo que el del modelo base completo, lo que elimina la principal ventaja práctica de una cuantización agresiva.
- Riesgo de alucinación: inherente a los modelos generativos y no mitigado aquí; un modelo con expertos degradados puede aumentar la probabilidad de respuestas plausibles pero incorrectas.
- Idiomas: no se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano sin evaluación previa.
- Licencia: no declarada en la ficha del checkpoint. El autor remite a la licencia del modelo base, de modo que cualquier uso comercial exige verificar y cumplir las condiciones de Qwen/Qwen3-Next-80B-A3B-Thinking.
- Sesgos: no se han realizado evaluaciones de sesgo ni de toxicidad; se heredan los del modelo base y pueden verse alterados por la cuantización.
- Compatibilidad de herramientas: al tratarse de una arquitectura híbrida, el soporte en llama.cpp, Ollama u otros *runtimes* alternativos no está garantizado; conviene validar el *stack* antes de planificar un despliegue.
- Mantenimiento: no hay indicios de que el autor vaya a actualizar el repositorio; la última modificación registrada es del 20 de septiembre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3next-80b-a3b-2p02bit-r22
- Modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Thinking
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; el único resultado obtenido fue un hilo de soporte de Microsoft Office en japonés, sin relación con el tema. No se han localizado *papers*, blogs, repositorios ni demos asociados a este checkpoint.
