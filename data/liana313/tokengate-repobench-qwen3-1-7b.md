# liana313/tokengate-repobench-qwen3-1.7b

## Resumen

TokenGate RepoBench-P para Qwen3-1.7B es un artefacto de investigación publicado por el usuario `liana313` que no contiene un modelo completo, sino dos componentes acoplados: una puerta (*gate*) aprendida de poda de tokens en la caché KV y un adaptador LoRA asociado, ambos entrenados sobre el modelo base Qwen/Qwen3-1.7B. El objetivo es reducir el coste de memoria y de atención en inferencia con contextos largos, descartando entradas de la caché KV que la puerta considera poco relevantes, sin reentrenar el modelo completo.

El checkpoint corresponde al paso 6000 de una receta denominada "iso converged" y fue, según la model card, el seleccionado en los benchmarks del artículo arXiv:2610.26754 por maximizar la precisión de test con contexto completo sobre el conjunto de evaluación de RepoBench-P. El adaptador LoRA tiene rango 16 y alpha 32, aplicado a las proyecciones q y v de todas las capas, y se entrenó junto con la puerta de forma extremo a extremo sobre la tarea de autocompletado de código entre ficheros (par `longbench_repobench_p` de LongBench).

Es relevante ahora porque ataca uno de los cuellos de botella prácticos de los modelos de 1-2B en producción: el coste de la caché KV cuando se quieren usar ventanas de contexto largas en GPU de consumo. Con 0 descargas y 0 likes en el momento de redactar esta ficha, se trata de un lanzamiento muy reciente y sin validación independiente por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen/Qwen3-1.7B); el repositorio aporta una puerta de poda de caché KV más un adaptador LoRA |
| Parámetros totales | 1,7 B en el modelo base (según su identificador); el repositorio solo contiene la puerta y el LoRA (0,2 GB en total) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada; viene determinada por el modelo base Qwen/Qwen3-1.7B |
| Tipos de cuantización | No disponible; no se publican pesos cuantizados (solo checkpoints `.pt` de puerta y LoRA) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (verificar también los términos del modelo base) |
| Formato de pesos | PyTorch `.pt` (`gate_step6000.pt` + `lora_step6000.pt`); sin safetensors ni GGUF |
| Librería de carga | TokenGate (`tokengate.load_model`) |
| Tag de pipeline | text-generation |
| Conjunto de entrenamiento | RepoBench-P (par `longbench_repobench_p` de LongBench), paso 6000 |
| Fecha de publicación | 2026-10-20 |

## Arquitectura y entrenamiento

El repositorio no incluye pesos completos: sobre el transformer decoder-only de Qwen3-1.7B se injerta un adaptador LoRA de rango 16 y alpha 32 en las proyecciones de query y value de todas las capas, más una "puerta" (gate layer 1) que decide qué tokens de la caché KV se conservan durante la generación. Puerta y adaptador se entrenan de forma conjunta y extremo a extremo, de modo que el LoRA aprende a operar sobre la representación ya podada y la puerta aprende a preservar los tokens que el LoRA necesita. Es, por tanto, una solución de *token pruning* aprendida, no una heurística de ventana deslizante ni una cuantización de la caché.

El entrenamiento se realizó sobre RepoBench-P, un benchmark de autocompletado de código que exige recuperar información de otros ficheros del repositorio, lo que fuerza al modelo a trabajar con contextos largos y dependencias dispersas. La model card indica que se usó una "receta iso convergida" y que el paso 6000 fue el checkpoint con mayor precisión de test con contexto completo entre los pasos guardados; no se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO (no disponible).

## Capacidades

- Generación de texto y autocompletado de código, heredados del modelo base Qwen3-1.7B.
- Completado de código entre ficheros: la puerta está entrenada específicamente para conservar el contexto relevante cuando la información necesaria está en otro fichero del repositorio.
- Poda de caché KV en tiempo de inferencia: reduce el número de entradas de caché atendidas, lo que rebaja el coste de atención y la memoria ocupada en contextos largos.
- Funcionamiento con contexto completo: el checkpoint se seleccionó por su precisión con contexto íntegro, es decir, no depende de truncar la entrada.
- Adaptación eficiente: al ser un LoRA, se puede cargar y descargar sobre el modelo base sin duplicar los 1,7 B de pesos.
- Soporte de *tool calling* / *function calling*: no documentado en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas en la información proporcionada.
- Vision, audio, modo *thinking* explícito o soporte multilingüe declarado: no disponible.

## Casos de uso

- Autocompletado de código entre ficheros en IDE: el adaptador se entrenó sobre RepoBench-P, de modo que puede recibir el fichero en edición junto con fragmentos de otros módulos del repositorio y completar llamadas, firmas e importaciones coherentes con el resto del proyecto.
- Servidor de inferencia con presupuesto de memoria ajustado: al podar entradas de la caché KV, se puede atender un contexto más largo en la misma GPU, lo que permite desplegar el modelo de 1,7 B en tarjetas de 8-12 GB sin recurrir a truncar la entrada.
- RAG sobre documentación o repositorios: en lugar de recortar los fragmentos recuperados antes de enviarlos al modelo, la puerta descarta tokens poco informativos en la caché y mantiene los relevantes, lo que abarata consultas con muchos documentos concatenados.
- Reproducción de los resultados del artículo: el repositorio contiene exactamente el checkpoint empleado en los benchmarks de arXiv:2610.26754, por lo que sirve para replicar las cifras del paper con la librería TokenGate.
- Base para adaptación a un dominio propio: se puede reutilizar la puerta y entrenar un LoRA nuevo sobre un corpus interno (por ejemplo, código de una empresa) manteniendo el mecanismo de poda.
- Revisión de código en CI/CD: con contexto largo y bajo coste de memoria, el modelo puede analizar un diff junto con los ficheros afectados y emitir comentarios automáticos en un runner con GPU modesta.
- Experimentación académica en eficiencia de inferencia: sirve como punto de partida para comparar estrategias de poda de caché KV frente a atención completa con el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el paso 6000 fue el checkpoint con mayor precisión de test con contexto completo entre los pasos guardados, pero no se aportan cifras concretas de RepoBench-P, LongBench ni de otras evaluaciones, ni comparaciones numéricas con el modelo base sin poda.

## Requisitos de hardware

- Pesos del modelo base en fp16: aproximadamente 3,4 GB (1,7 B de parámetros). En int8, alrededor de 1,7 GB; en int4, en torno a 0,9 GB (estimaciones a partir del recuento de parámetros; no hay cuantizaciones publicadas).
- Componentes del repositorio: 0,2 GB en total (puerta más adaptador LoRA), cargables junto al modelo base.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8 GB o más para el modelo base en fp16; la presión real proviene de la caché KV, que es precisamente lo que la puerta reduce.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para desarrollo; A100/H100 solo tendrían sentido en despliegues con muchas peticiones concurrentes o contextos muy largos.
- Opciones de despliegue: la vía prevista es la librería TokenGate (`load_model`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF; integrarlo en esos motores requeriría portar el mecanismo de poda.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Mecanismo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liana313/tokengate-repobench-qwen3-1.7b | 1,7 B (base) + puerta y LoRA | No disponible (el del modelo base) | Poda aprendida de caché KV + LoRA q/v | Apache 2.0 | HuggingFace, requiere librería TokenGate |
| Qwen/Qwen3-1.7B (modelo base, sin poda) | 1,7 B | No disponible en esta información | Atención completa, sin poda | Apache 2.0 | HuggingFace, transformers |
| Adaptador LoRA convencional sobre Qwen3-1.7B | 1,7 B + LoRA | El del modelo base | Fine-tuning sin modificar la caché KV | Según autor | Amplia |
| Otros métodos de poda de caché KV para modelos de ~1-2 B | No disponible | No disponible | HIO, SnapKV y similares | No disponible | No disponible |

La comparación relevante es contra el modelo base sin poda: este checkpoint debería ofrecer menor memoria y coste de atención a cambio de una posible pérdida de precisión cuando los tokens descartados sean necesarios. No se dispone de cifras que cuantifiquen ese intercambio.

## Limitaciones y advertencias

- El adaptador LoRA solo cubre las proyecciones q y v; no se modifican las proyecciones de salida ni las capas MLP, por lo que la ganancia de calidad respecto al modelo base está acotada.
- Entrenado exclusivamente sobre RepoBench-P: el dominio es autocompletado de código con dependencias entre ficheros. El comportamiento en otros dominios (texto general, matemáticas, conversación) no está documentado y podría degradarse, especialmente si la puerta descarta tokens relevantes para esas tareas.
- Riesgo de poda agresiva: si la puerta elimina entradas de caché necesarias, el modelo puede producir código o texto incoherente sin señales evidentes de error; no se publican métricas de ese modo de fallo.
- Modelo base pequeño (1,7 B): capacidad limitada de razonamiento y de conocimiento factual, con propensión a la alucinación en tareas abiertas.
- Idiomas soportados no declarados; el entrenamiento sobre código sugiere un sesgo hacia inglés y lenguajes de programación mayoritarios.
- Licencia Apache 2.0 en el repositorio, pero conviene verificar los términos del modelo base Qwen3-1.7B antes de un uso comercial, así como las licencias del dataset RepoBench-P.
- Dependencia de una librería específica (TokenGate) y de un repositorio de GitHub externo; sin soporte en motores de inferencia estándar, el coste de integración en producción es alto.
- Artefacto sin tracción: 0 descargas y 0 likes en el momento de la ficha, sin validación independiente ni informes de terceros.
- No se publican pesos fusionados ni cuantizaciones, lo que impide usarlo directamente con transformers, llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liana313/tokengate-repobench-qwen3-1.7b
- Artículo: https://arxiv.org/abs/2610.26754
- Repositorio de la librería TokenGate: https://github.com/tokengate-models/TokenGate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
