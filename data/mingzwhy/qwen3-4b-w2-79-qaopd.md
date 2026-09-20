# MingZwhy/Qwen3-4B-W2.79-QAOPD

## Resumen

Qwen3-4B-W2.79-QAOPD es un checkpoint del modelo Qwen/Qwen3-4B cuantizado a 2,79 bits por peso y posteriormente recuperado mediante un proceso en dos fases: destilación con conocimiento de cuantización (quantization-aware distillation, QAD) seguida de destilación on-policy (OPD). Lo publica el usuario MingZwhy en HuggingFace, junto con el código, el harness de evaluación y la receta de entrenamiento en el repositorio GitHub MingZwhy/QAOPD. El problema que aborda es el de la pérdida de calidad típica de las cuantizaciones agresivas (por debajo de 3 bits por peso): en lugar de aceptar la degradación, el autor la compensa con destilación, de modo que el modelo resultante se carga y se evalúa directamente, sin necesidad de aplicar ninguna cuantización en tiempo de inferencia.

El modelo conserva los 4.022.468.096 parámetros del Qwen3-4B original (arquitectura transformer densa, sin mezcla de expertos) y mantiene la licencia Apache-2.0 heredada del modelo base. La cuantización está "baked in": los pesos ya vienen en formato mixto INT1.58/INT4 en bloques de 256, con el 50 % de los bloques en INT4, lo que da los 2,79 bits efectivos, embeddings y cabeza de salida en INT4, activaciones en INT8 y caché KV en 16 bits.

Su relevancia actual es doble: por un lado, permite desplegar un modelo de 4B en hardware con muy poca memoria; por otro, sirve como referencia metodológica reproducibles (receta, código y harness públicos) para evaluar hasta dónde se puede comprimir un modelo pequeño sin destruir su capacidad de razonamiento matemático y de generación de código. El checkpoint es reciente (creado el 20 de septiembre de 2026) y no acumula todavía descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), no MoE |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no especificada en la model card; heredada de Qwen/Qwen3-4B) |
| Tipos de cuantizacion | Pesos en INT1.58/INT4 mixto por bloques de 256 (50 % de bloques en INT4), 2,79 bits efectivos. Embeddings y cabeza de salida en INT4. Activaciones en INT8. Cache KV en 16 bits |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | Apache-2.0 (heredada de Qwen3-4B) |
| Formato de pesos | safetensors con custom_code (requiere trust_remote_code=True) |
| Modelo base | Qwen/Qwen3-4B |
| Tamano del repositorio | 8,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-4B, un transformer denso de 4.022 millones de parámetros, sin capas de mezcla de expertos. Sobre ese modelo se aplica una cuantización de pesos con granularidad de bloque (bloques de 256 elementos) en precisión mixta: el 50 % de los bloques se almacena en INT4 y el resto en INT1.58, lo que arroja una media efectiva de 2,79 bits por peso. Los embeddings y la cabeza de salida se mantienen en INT4, las activaciones se cuantizan a INT8 y la caché KV se conserva en 16 bits, presumiblemente para no degradar la calidad del contexto largo.

La innovación técnica está en el procedimiento de recuperación posterior a la cuantización, en dos etapas encadenadas: primero una destilación con conocimiento de cuantización (QAD), que entrena el modelo cuantizado para imitar las salidas del modelo sin cuantizar, y después una destilación on-policy (OPD), en la que el propio modelo cuantizado genera las secuencias sobre las que se destila, de forma que la corrección se concentra en la distribución de estados que realmente visita el modelo comprimido. El autor no detalla en la model card el número de tokens de entrenamiento, la composición del dataset ni hiperparámetros, pero sí publica la receta y el harness en el repositorio QAOPD y en `docs/EVALUATION.md`.

## Capacidades

- Generación de texto conversacional y continuaciones de contexto, con la etiqueta `conversational` en el repositorio.
- Razonamiento matemático: los resultados publicados cubren GSM8K, MATH-500 y AMC23, lo que indica capacidad para problemas aritméticos y de competición, aunque con pérdida respecto al modelo sin cuantizar.
- Generación de código: se reportan resultados en MBPP y HumanEval (pass@1 greedy), por lo que el modelo está orientado a tareas de programación.
- Evaluación mediante scoring de verosimilitud en nueve benchmarks agregados (métrica QA9 del autor), lo que implica un uso válido como modelo base para evaluación comparativa de cuantizaciones.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona explícitamente; los benchmarks de matemáticas y código son indicativos, pero no concluyentes).
- Capacidades multilingües: no disponible (no especificado).
- Capacidades especiales (modo thinking, visión, audio): no disponible (no se menciona ninguna en la model card).
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Inferencia en hardware de gama baja o embebido: con 2,79 bits por peso, los 4.022 millones de parámetros ocupan aproximadamente 1,4 GB en disco y en memoria, lo que permite ejecutar el modelo en GPUs consumer con poca VRAM o en nodos de borde donde un 4B en BF16 (unos 8 GB) no cabría.
- Evaluación comparativa de técnicas de cuantización: al publicar el harness y la receta, el checkpoint sirve como referencia reproducible para medir el coste en calidad de bajar de 4 bits, comparando contra el Qwen3-4B BF16 con las mismas condiciones de evaluación (5-shot en GSM8K, 4-shot en MATH-500, avg@16 en AMC23, pass@1 greedy en MBPP y HumanEval).
- Asistente de código en local: el modelo mantiene 64,0 en HumanEval y 57,8 en MBPP, suficiente para autocompletado, generación de funciones y explicación de fragmentos en un IDE, siempre que se acepte la pérdida de unos 18 puntos de HumanEval frente al modelo completo.
- Tutoria y resolución de problemas matemáticos de nivel escolar y de competición: con 77,86 en GSM8K y 54,40 en MATH-500 puede usarse para generar soluciones paso a paso y para construir datasets sintéticos de problemas resueltos, verificando después las respuestas con un solver simbólico.
- Prototipado rápido y pruebas de concepto: al ser un checkpoint que se carga directamente con `from_pretrained` y `trust_remote_code=True`, permite validar pipelines de generación sin montar infraestructura de cuantización propia.
- Ajuste fino posterior sobre un modelo ya comprimido: al estar la cuantización integrada, se puede partir de este checkpoint para tareas específicas de dominio cuando el presupuesto de memoria es limitado, asumiendo que el fine-tuning sobre pesos cuantizados requiere técnicas compatibles (LoRA/QLoRA, no especificado por el autor).
- Servicio de generación de texto autoalojado con TGI: la etiqueta `text-generation-inference` y `endpoints_compatible` indica que el checkpoint está pensado para servirse mediante ese stack, útil para equipos que quieran un endpoint compatible con la API de mensajes sin depender de proveedores externos.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre este checkpoint frente al Qwen3-4B sin cuantizar:

| Benchmark | Este modelo | Qwen3-4B BF16 | Diferencia |
|---|---:|---:|---:|
| GSM8K (5-shot, strict-match) | 77,86 | 86,35 | -8,49 |
| MATH-500 (4-shot) | 54,40 | 68,80 | -14,40 |
| AMC23 (avg@16) | 39,38 | 55,00 | -15,62 |
| MBPP (pass@1 greedy) | 57,8 | 67,6 | -9,8 |
| HumanEval (pass@1 greedy) | 64,0 | 82,3 | -18,3 |
| QA9 (media de nueve benchmarks con scoring de verosimilitud) | 57,37 | 61,63 | -4,26 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, MMLU-Pro, IFEval, seguridad, multilingue) ni comparaciones con otras cuantizaciones de 2 bits.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,4 GB, calculados a partir de 4.022.468.096 parámetros a 2,79 bits por peso. Cifra derivada, no publicada por el autor.
- VRAM estimada en ejecución: no disponible de forma oficial. Como referencia, a los pesos hay que sumar activaciones en INT8, caché KV en 16 bits y el overhead del runtime; en la práctica conviene reservar varios GB adicionales en función de la longitud de contexto y del tamaño de lote. No se han publicado mediciones de pico de memoria.
- GPU recomendadas: no disponible. Cualquier GPU con al menos unos pocos GB de VRAM libre debería poder alojar los pesos; no hay datos oficiales de compatibilidad por modelo.
- GPU consumer: sí, en principio cabe en GPUs consumer por tamaño de pesos (la cifra de 1,4 GB es muy inferior a los 8 GB del BF16), pero no hay confirmación oficial de funcionamiento en tarjetas concretas.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` (método documentado por el autor) y text-generation-inference (etiqueta oficial). Compatibilidad con vLLM, llama.cpp, Ollama o TGI en versiones concretas: no disponible. Al no ser GGUF y requerir `custom_code` con kernels de cuantización propios, no cabe esperar soporte en runtimes que solo acepten formatos estándar sin kernels personalizados.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota sobre el tamaño del repositorio (8,1 GB): es muy superior a los 1,4 GB que ocuparían los pesos a 2,79 bits, por lo que el repositorio incluye artefactos adicionales (por ejemplo, tensores en mayor precisión o ficheros auxiliares) no detallados en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | GSM8K | MATH-500 | HumanEval | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-4B-W2.79-QAOPD (este) | 4,02 B | no disponible | Apache-2.0 | 77,86 | 54,40 | 64,0 | HuggingFace, safetensors + custom_code |
| Qwen/Qwen3-4B BF16 | 4,02 B | no disponible | Apache-2.0 | 86,35 | 68,80 | 82,3 | HuggingFace |
| Otras cuantizaciones de Qwen3-4B (AWQ, GPTQ, GGUF Q2/Q4) | 4,02 B | no disponible | Apache-2.0 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de cuantizaciones alternativas de Qwen3-4B en la informacion proporcionada, por lo que la unica comparacion cuantitativa posible es contra el modelo base sin cuantizar.

## Limitaciones y advertencias

- Pérdida de calidad medible: la cuantizacion a 2,79 bits reduce las puntuaciones entre 8,5 y 18,3 puntos en los benchmarks publicados, con HumanEval como el caso mas afectado (64,0 frente a 82,3). El modelo no es equivalente al Qwen3-4B original.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad, factualidad ni tasas de alucinacion para este checkpoint; la compresion agresiva tiende a agravar estos comportamientos, pero no hay datos que lo confirmen.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o seguridad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan especificados en la model card, por lo que no se puede garantizar el comportamiento en contextos largos ni en idiomas distintos del ingles de los benchmarks.
- Requisito de codigo personalizado: la carga exige `trust_remote_code=True`. Esto implica ejecutar codigo del autor del repositorio, algo que debe evaluarse en entornos con requisitos de seguridad estrictos.
- Compatibilidad limitada de runtime: al no distribuirse en GGUF ni en formatos estandar de cuantizacion, no hay garantia de que funcione en llama.cpp, Ollama u otros motores que no soporten los kernels propios del checkpoint.
- Madurez del artefacto: 0 descargas y 0 likes, publicado por un autor individual. No ha pasado por una validacion comunitaria amplia, lo que desaconseja su uso en produccion critica sin una evaluacion propia previa.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar que no existan condiciones adicionales en la licencia de Qwen/Qwen3-4B y en los datos de entrenamiento empleados.
- Sin informacion sobre el proceso de fine-tuning sobre pesos ya cuantizados: no se detalla si es posible seguir entrenando el checkpoint ni con que tecnicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-4B-W2.79-QAOPD
- Repositorio de codigo, harness y receta: https://github.com/MingZwhy/QAOPD
- Documentacion de evaluacion: https://github.com/MingZwhy/QAOPD/blob/main/docs/EVALUATION.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (los resultados obtenidos correspondian a portales inmobiliarios y no guardan relacion con el contenido de esta ficha).
