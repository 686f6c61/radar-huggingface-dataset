# experimentalmachines/Qwen2.5-1.5B-Instruct-ExecuTorch

## Resumen

Qwen2.5-1.5B-Instruct-ExecuTorch es un export del modelo Qwen/Qwen2.5-1.5B-Instruct (revisión `989aa7980e4c`) al formato `.pte` de ExecuTorch 1.4.0, preparado por el usuario experimentalmachines para inferencia en dispositivo (on-device) sobre Android y cualquier runtime ExecuTorch compatible. Se trata, por tanto, de un artefacto de despliegue y no de un modelo entrenado desde cero: el autor parte del modelo instruct de Qwen y lo cuantiza y exporta con el backend XNNPACK para CPU arm64.

El problema que resuelve es la ejecución local de un LLM de 1,5B parámetros en teléfonos, sin GPU dedicada y sin enviar datos a la nube. Para ello distribuye cuatro ficheros con ventana de contexto fija (2.048, 4.096, 8.192 y 16.384 tokens), cada uno de aproximadamente 1,11-1,14 GB, con cuantización de pesos de 4 bits en grupos de 32 y activaciones dinámicas de 8 bits. El KV cache se reserva completo en el momento de la carga, de modo que la elección del fichero depende de la memoria libre del dispositivo, con un presupuesto de referencia de 5 GB.

Su relevancia es doble: por un lado, demuestra un pipeline reproducible de exportación de un LLM moderno a ExecuTorch; por otro, ofrece una vía práctica de llevar un modelo con licencia Apache 2.0 a aplicaciones Android mediante la app openweights. El repositorio tiene 0 descargas y 0 likes y no está respaldado por Qwen ni por el equipo de PyTorch, por lo que debe tratarse como un artefacto experimental de terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) con Grouped Query Attention y RoPE; exportado a un grafo ExecuTorch ejecutado por XNNPACK |
| Parámetros totales | 1,5B (modelo base Qwen2.5-1.5B-Instruct) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Modelo base: 32.768 tokens según la ficha de Qwen; en este repo: ventana fija por fichero de 2.048, 4.096, 8.192 y 16.384 tokens (la model card menciona que se exportó "de 2k a 32k", pero la tabla de ficheros solo lista hasta 16k) |
| Tipos de cuantización | Esquema 8da4w: pesos de 4 bits en grupos de 32, activaciones dinámicas de 8 bits, embeddings int8 por canal, KV cache en fp32. El repo solo distribuye los `.pte`; no incluye variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en el repositorio; el modelo base Qwen2.5-Instruct declara soporte multilingüe en su documentación |
| Licencia | Apache 2.0 (derivado cuantizado del modelo base, con el fichero LICENSE original incluido sin cambios) |
| Formato de pesos | `.pte` (ExecuTorch), más `tokenizer.json` copiado del repo origen |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct (relación: quantized) |
| Runtime objetivo | ExecuTorch 1.4.0, backend XNNPACK (CPU) sobre arm64 |
| Tamaño del repositorio | 4,5 GB |
| Tamaño por fichero | 1,11 GB (2k) / 1,11 GB (4k) / 1,12 GB (8k) / 1,14 GB (16k) |
| Precisión del KV cache | fp32, 57.344 bytes por token, reservado en su totalidad al cargar |
| Pipeline declarado | text-generation |
| Fecha de creación / actualización | 2026-09-13 |

## Arquitectura y entrenamiento

No se ha realizado ningún entrenamiento en este repositorio. El contenido es una exportación del modelo Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5B parámetros con atención de consultas agrupadas (GQA) y embeddings rotatorios posicionales, propio de la familia Qwen2.5. La model card no aporta detalles sobre el dataset, el número de tokens de entrenamiento ni las etapas de alineación (SFT, RLHF o DPO) del modelo original; esos datos corresponden a la documentación de Qwen y no están reproducidos aquí.

La innovación técnica de este artefacto está en el pipeline de exportación, no en la arquitectura. Se usó la herramienta `export_llm` de ExecuTorch 1.4.0 con backend XNNPACK y operadores extendidos, prefill en chunks de 2.048 tokens, KV cache en fp32 y una cuantización 8da4w (4 bits por peso en grupos de 32, activaciones de 8 bits dinámicas, embeddings int8 por canal). Cada `.pte` fija la ventana de contexto en el propio fichero: el runtime asigna el KV cache entero al cargar el modelo, por lo que no hay escalado dinámico de contexto en tiempo de ejecución. El autor publica además, por cada fichero, un `config.json` de variantes y un `export-report-<window>.json` con el registro completo de la exportación, lo que permite auditar el proceso y reproducirlo (build asociado a un run concreto de GitHub Actions). Cada una de las cuatro ventanas superó una prueba de humo que consistió en responder "Paris" a una pregunta simple, según la model card.

## Capacidades

- Generación de texto y seguimiento de instrucciones en formato conversacional, heredadas del modelo Instruct original.
- Conversación multi-turno con contexto de hasta 16.384 tokens en el fichero de mayor ventana (frente a los 32.768 del modelo base sin exportar).
- Razonamiento básico y resolución de problemas sencillos propios de un modelo de 1,5B parámetros; sin datos de benchmarks publicados en este repositorio que lo cuantifiquen.
- Generación de código de complejidad baja o media (la ficha de Qwen reporta resultados de HumanEval para el modelo base, no reproducidos aquí).
- Capacidades multilingües heredadas del modelo base; el repositorio no declara una lista concreta de idiomas.
- Aritmética y matemáticas elementales.
- Ejecución completamente local en CPU arm64, sin acceso a red y sin GPU.
- No incluye visión, audio ni entrada multimodal: el pipeline es exclusivamente text-generation.
- No incorpora en el artefacto exportado la lógica de plantilla de chat ni un parser de tool calling; cualquier soporte de function calling heredado del modelo base debe implementarse en la aplicación que consume el `.pte`.
- No se distribuyen builds para otros backends de ExecuTorch (Vulkan, Core ML, QNN) ni variantes para GPU o NPU.

## Casos de uso

- Asistente conversacional offline en Android: integrado a través de la app openweights o de un runner propio sobre ExecuTorch 1.4.0, el modelo permite chatear sin conexión y sin enviar prompts a servidores externos, algo crítico cuando el texto contiene datos personales o profesionales sensibles.
- Procesamiento de documentos confidenciales en el dispositivo: con la ventana de 16.384 tokens se pueden resumir, reescribir o extraer datos de informes, contratos o notas que no deben salir del teléfono, cumpliendo así con requisitos estrictos de protección de datos.
- Clasificación y extracción de información estructurada: uso del modelo como motor de etiquetado local (categorización de correos, extracción de entidades de tickets o mensajes) dentro de una app que no quiera depender de una API en la nube ni asumir costes por token.
- Autocompletado y reescritura en aplicaciones de productividad móvil: un editor de notas o de correo puede ofrecer sugerencias de redacción en tiempo real aprovechando que todo el cómputo ocurre en CPU arm64 y que la ventana de contexto cubre documentos de varias páginas.
- Traducción y reformulación multilingüe en despliegues de campo: escenarios con conectividad intermitente (asistencia técnica, logística, personal sanitario) donde hace falta una traducción o reformulación razonable sin depender de cobertura de red.
- Prototipado de pipelines ExecuTorch antes de escalar: el repositorio, con sus informes de exportación y sus cuatro ventanas, sirve como referencia para validar el consumo de memoria, la asignación de KV cache y el rendimiento de XNNPACK antes de invertir en modelos mayores o en backends acelerados.
- Asistencia de código ligera en el propio dispositivo: generación de fragmentos, explicación de expresiones o conversión de pseudocódigo dentro de un IDE móvil, aceptando las limitaciones propias de un modelo de 1,5B parámetros.
- Pruebas de concepto educativas y de investigación: entorno reproducible para medir cómo se comporta una cuantización 8da4w en calidad de salida y en huella de memoria sobre hardware móvil real, sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta que cada uno de los cuatro ficheros superó una prueba de humo (smoke test) consistente en responder "Paris" a una consulta simple, y aporta los informes de exportación (`export-report-<window>.json`). No hay cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput, ni comparaciones con otras cuantizaciones del mismo modelo.

## Requisitos de hardware

- No requiere GPU: los cuatro ficheros están exportados para el backend XNNPACK sobre CPU arm64 y se ejecutan en cualquier dispositivo con esa arquitectura.
- Tamaño en almacenamiento: 1,11 GB (2k), 1,11 GB (4k), 1,12 GB (8k) y 1,14 GB (16k); el repositorio completo ocupa 4,5 GB.
- Memoria para el KV cache, reservada íntegramente al cargar el modelo: 117.440.512 bytes (2.048 tokens), 234.881.024 bytes (4.096 tokens), 469.762.048 bytes (8.192 tokens) y 939.524.096 bytes (16.384 tokens), a 57.344 bytes por token en fp32.
- Presupuesto de referencia: los `config.json` de cada carpeta incluyen un campo `fits_phone_budget` que estima la viabilidad contra un presupuesto de 5 GB. En la práctica, el fichero de 2k debería caber en la mayoría de móviles arm64 de gama media-alta, mientras que el de 16k exige un dispositivo con abundante RAM libre.
- No hay cifras publicadas de latencia ni de tokens por segundo para ninguno de los cuatro ficheros.
- Opciones de despliegue: app openweights para Android, o cualquier runtime ExecuTorch 1.4.0 capaz de cargar `.pte` con operadores XNNPACK extendidos.
- Para el modelo base sin exportar, las estimaciones habituales son: aproximadamente 3,1 GB de VRAM en fp16 (más el KV cache correspondiente), en torno a 1,6 GB en cuantización de 8 bits y cerca de 1 GB en 4 bits. En ese caso podría ejecutarse en GPUs de consumo como una RTX 3060 de 12 GB o una RTX 4090, e incluso en GPUs de 6-8 GB con cuantización agresiva, mediante vLLM, llama.cpp, Ollama, TGI o LM Studio. Estas cifras son estimaciones generales para un modelo de 1,5B parámetros y no están verificadas en la información proporcionada.

## Comparativa con modelos similares

Los datos de modelos distintos del base se toman de su documentación pública y no de la información proporcionada en esta búsqueda; se marcan como no disponibles aquellos que no se pueden afirmar con seguridad.

| Modelo | Parámetros | Contexto (modelo original) | Licencia | Formato de distribución |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-ExecuTorch (este repo) | 1,5B | Ventana fija por fichero: 2.048-16.384 tokens | Apache 2.0 | `.pte` (ExecuTorch) |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 tokens según la ficha de Qwen | Apache 2.0 | safetensors |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens según su documentación | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B-IT | 2,6B | 8.192 tokens según su documentación | Gemma Terms of Use | safetensors |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens según su documentación | Apache 2.0 | safetensors, GGUF |

Diferencias relevantes: este repositorio es el único de la tabla que se distribuye como artefacto compilado para ExecuTorch y con ventana de contexto fijada en el fichero, lo que simplifica el despliegue móvil pero impide ampliar el contexto sin volver a exportar. Frente a Llama-3.2-1B, ofrece más parámetros y licencia Apache 2.0 (sin las cláusulas de la licencia comunitaria de Meta) a cambio de una ventana efectiva menor. No hay datos de rendimiento publicados para este export que permitan comparar calidad con las alternativas.

## Limitaciones y advertencias

- Es un derivado cuantizado a 4 bits por peso con activaciones de 8 bits; cabe esperar una degradación de calidad respecto al modelo base en fp16, no cuantificada en la información disponible.
- La ventana de contexto está fijada dentro de cada `.pte` y no puede ampliarse en tiempo de ejecución; además, el KV cache se reserva completo al cargar, por lo que un fichero con ventana sobredimensionada puede agotar la memoria del dispositivo antes de generar un solo token.
- El único control de calidad documentado es una prueba de humo que responde "Paris"; no hay evaluación sistemática de capacidades ni de tasas de error.
- Un modelo de 1,5B parámetros presenta riesgo apreciable de alucinación, errores aritméticos y fallos en razonamiento de varios pasos; no es adecuado para tareas que requieran precisión verificable sin supervisión humana.
- El repositorio no declara la lista de idiomas soportados; el comportamiento multilingüe depende íntegramente del modelo base y no está validado en este export.
- El artefacto lo publica un tercero (experimentalmachines) y no está respaldado por Qwen ni por el equipo de PyTorch; con 0 descargas y 0 likes, carece de validación por parte de la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, esta se hereda del modelo base y se debe verificar el cumplimiento de las condiciones de Qwen y de las dependencias de ExecuTorch y XNNPACK.
- El export no incluye plantilla de chat, gestión de turnos ni parser de tool calling; la aplicación debe aportar esa lógica, y sin ella el modelo puede degradar notablemente en formato conversacional.
- Solo se distribuyen builds para CPU arm64 con XNNPACK; no hay rutas aceleradas por GPU o NPU en este repositorio, lo que limita el throughput en comparación con backends como Vulkan, QNN o Core ML.
- Las fechas de creación y actualización del repositorio (2026-09-13) y el reducido tiempo entre ambas (unos 13 minutos) sugieren un artefacto generado de forma automática; conviene revisar los informes de exportación antes de usarlo en producción.
- La model card menciona exportaciones "de 2k a 32k", pero la tabla de ficheros solo lista hasta 16k: no hay confirmación de que existan los ficheros de 32k.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/experimentalmachines/Qwen2.5-1.5B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- App Android openweights: https://github.com/alpharomercoma/openweights
- Repositorio del exportador: https://github.com/ExperimentalMachines/executorch-model-exporter
- Run de exportación citado en la model card: https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34749021797
- Documentación de ExecuTorch: no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible en la información proporcionada
- Resultados de búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido turístico sobre la isla de Bangi, Malasia), por lo que no se han utilizado.
