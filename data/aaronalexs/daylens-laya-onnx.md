# aaronalexS/daylens-laya-onnx

## Resumen

`aaronalexS/daylens-laya-onnx` es una conversión a ONNX en fp32 del checkpoint «typed-decisions» de `convaiinnovations/laya`, un modelo de clasificación/decisiones tipadas. El autor del export es el usuario de HuggingFace `aaronalexS`, y el modelo original pertenece a Convai Innovations. El objetivo declarado es ejecutar el modelo de forma local dentro de la aplicación de escritorio Daylens, mediante `onnxruntime-node`, para etiquetar la actividad que aparece en pantalla a partir de cadenas cortas de contexto (nombre de la aplicación, título de la ventana y texto OCR anonimizado).

A diferencia de un LLM generativo, Laya no produce texto libre: recibe un estado y una serie de preguntas tipadas, y devuelve decisiones discretas, distribuciones de probabilidad, puntuaciones ordinales y probabilidades booleanas. El export conserva los pesos originales sin cambios, pero sustituye la cabeza de decisión por una versión trazable en la que las posiciones de los marcadores de pregunta y de opción se pasan como entradas del grafo. El repositorio ocupa 1,7 GB y el fichero `laya.onnx` pesa 1 686 012 251 bytes, lo que en fp32 equivale a aproximadamente 420 millones de parámetros.

Su relevancia es acotada pero concreta: demuestra que un modelo de decisión multilingüe puede ejecutarse íntegramente en local, sin llamadas a API, dentro de una aplicación de escritorio o incluso de un navegador, con una paridad prácticamente exacta respecto al modelo PyTorch original (diferencia máxima de logits de 0,00005 y 96/96 decisiones coincidentes en el conjunto de validación de Daylens).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer codificador con cabeza de decisión tipada (marcadores de pregunta/opción como entradas del grafo). Etiquetas de exports de terceros la asocian a ModernBERT; no confirmado por el autor |
| Parámetros totales | No disponible de forma oficial. Estimación de ~420 M derivada del tamaño del fichero ONNX fp32 (1 686 012 251 B / 4 bytes) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible. Export con longitud de secuencia dinámica |
| Tipos de cuantización | Solo fp32 en este repositorio. No se publican variantes INT8, INT4 ni GGUF del mismo |
| Idiomas soportados | Multilingüe según la descripción de exports de terceros; lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 (misma que el modelo original) |
| Formato de pesos | ONNX fp32 (`laya.onnx`), más `tokenizer.json`, `tokenizer_config.json` y `laya-meta.json` |

## Arquitectura y entrenamiento

La información disponible no documenta el entrenamiento del modelo original: no se indica el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineación. Lo que sí describe la model card es la intervención realizada en el export: se ha exportado el checkpoint a ONNX en fp32 con longitud de secuencia dinámica y una cabeza de decisión trazable, en la que las posiciones de los marcadores de pregunta y de opción se pasan explícitamente como entradas. Los pesos no se han modificado. El fichero `laya-meta.json` (519 B) contiene los identificadores de tokens especiales y los metadatos de los marcadores de opción que necesita el runtime TypeScript de Daylens para formatear las entradas igual que el código Python oficial.

La innovación técnica relevante no está en la arquitectura, sino en el proceso de exportación y verificación. El autor reporta una paridad con el modelo PyTorch original de 0,00005 de diferencia máxima absoluta en los logits y 96 de 96 decisiones coincidentes sobre el conjunto dorado de Daylens. Además, existen otros dos exports independientes del mismo modelo (`receptron/laya-onnx` y `gqgs/laya-onnx`, este último orientado a navegadores), lo que indica un interés por desplegar Laya fuera de Python. No se dispone de detalles sobre la composición del vocabulario, la dimensionalidad de las capas ni el mecanismo de atención más allá de la etiqueta genérica de transformer codificador.

## Capacidades

- Clasificación de texto y decisiones tipadas: a partir de un estado y un conjunto de preguntas, devuelve la opción elegida, la distribución de probabilidad sobre las opciones, puntuaciones ordinales y probabilidades booleanas.
- Decisiones multilingües: la documentación de los exports de terceros describe el modelo como multilingüe, aunque la lista de idiomas soportados no está publicada.
- Ejecución local en escritorio y navegador: formato ONNX compatible con `onnxruntime-node` y `onnxruntime-web`.
- Formato de entrada compatible con el modelo original: la cabecera de decisión se puede invocar con marcadores de pregunta y opción, de modo que las respuestas son comparables con las del modelo PyTorch.
- Etiquetado de contexto de pantalla: uso previsto en Daylens para etiquetar cadenas cortas de contexto (aplicación, título de ventana, OCR anonimizado).
- No dispone de generación de texto libre, razonamiento multi-paso, uso de herramientas ni capacidades de visión o audio.

## Casos de uso

- Etiquetado de actividad en local dentro de Daylens: el modelo recibe el nombre de la aplicación, el título de la ventana y texto OCR anonimizado, y devuelve una etiqueta de actividad sin salir del equipo, lo que evita enviar contenido de pantalla a servicios externos.
- Clasificación con privacidad por diseño en aplicaciones de escritorio: al ejecutarse con `onnxruntime-node`, permite procesar datos sensibles de pantalla en memoria local, requisito habitual en herramientas de productividad y control parental en la UE.
- Inferencia en el navegador: la existencia del export `gqgs/laya-onnx` confirma que el mismo modelo puede desplegarse con `onnxruntime-web` en extensiones o aplicaciones web que necesiten clasificar texto sin backend.
- Servicio de decisiones con API compatible: el proyecto `navopw/laya-onnx` expone `POST /v1/systemone` con el mismo formato que `api.typesafe.ai` y los modelos `typesafe/jev-*` de OpenRouter, lo que permite sustituir una llamada a API en la nube por un servidor ONNX propio.
- Enrutamiento y triaje de peticiones: usar las probabilidades devueltas para decidir si una consulta se resuelve con un modelo pequeño local o se escala a un LLM generativo, aprovechando la salida de distribución en lugar de una única etiqueta.
- Filtros booleanos y disparadores de automatización: las probabilidades booleanas permiten construir condiciones del tipo «¿debe notificarse al usuario?» o «¿esta ventana pertenece a una tarea de trabajo?» dentro de un agente de automatización.
- Puntuación ordinal para ordenación: las salidas ordinales sirven para priorizar elementos (por ejemplo, relevancia de una ventana o urgencia de un aviso) sin necesidad de un modelo generativo.
- Validación de pipelines de exportación: el repo funciona como referencia de paridad (0,00005 de diferencia de logits, 96/96 en el conjunto dorado) para equipos que necesiten portar modelos de decisión de PyTorch a ONNX conservando el comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento publicado es la verificación de paridad frente al modelo original:

| Prueba | Resultado |
|---|---|
| Diferencia máxima absoluta de logits frente al modelo PyTorch original | 0,00005 |
| Decisiones coincidentes en el conjunto dorado de Daylens | 96/96 |

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero de pesos ocupa 1,57 GiB en fp32 (`laya.onnx`, 1 686 012 251 B). Conviene reservar del orden de 2 a 3 GB de memoria para pesos, tokenizador y activaciones, aunque la cifra exacta depende de la longitud de secuencia y no está publicada.
- GPU dedicadas: cualquier GPU con 4 GB o más de memoria puede alojar el modelo en fp32; no se publican cifras de latencia ni de throughput para A100, H100 o similares.
- GPU de consumo: sí cabe en GPU de consumo. Una RTX 3060, RTX 4060 o superior con 8-12 GB puede ejecutarlo con holgura, e incluso GPUs con 4 GB son suficientes para el modelo en fp32. También es viable la conversión a fp16 para reducir a la mitad el uso de memoria.
- CPU: dado el tamaño (~420 M de parámetros estimados), la inferencia en CPU es perfectamente factible con ONNX Runtime; el caso de uso declarado por el autor (`onnxruntime-node` en una app de escritorio) presupone ejecución local sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime para Node.js (`onnxruntime-node`), ONNX Runtime Web para navegador, ONNX Runtime Server (usado por `navopw/laya-onnx` para exponer `POST /v1/systemone`), y cualquier runtime compatible con ONNX (por ejemplo, `onnxruntime-genai` no aplica porque el modelo no es generativo). No procede usar vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es un LLM autoregresivo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aaronalexS/daylens-laya-onnx` (este modelo) | ONNX fp32 | No oficial; ~420 M estimados | No disponible (secuencia dinámica) | Apache-2.0 | HuggingFace, repo de 1,7 GB, 0 descargas |
| `convaiinnovations/laya` (original) | PyTorch | No disponible | No disponible | Apache-2.0 | HuggingFace; recomendado por el propio autor del export para uso general |
| `receptron/laya-onnx` | ONNX | No disponible | No disponible | Apache-2.0 | HuggingFace; export independiente, etiquetado como `decision-model`, `system-one`, `jev`, `modernbert` |
| `gqgs/laya-onnx` | ONNX | No disponible | No disponible | No disponible | GitHub; orientado a ejecución en navegador |
| `typesafe/jev-*` (vía OpenRouter / api.typesafe.ai) | API propietaria | No disponible | No disponible | No disponible | Servicio en la nube con el mismo formato de petición `/v1/systemone` |

Los tres exports ONNX (Daylens, receptron, gqgs) derivan del mismo modelo base y son funcionalmente equivalentes en cuanto a pesos; las diferencias están en el formato de integración (Node.js, servicio HTTP o navegador). La alternativa a este repositorio si se busca soporte y mantenimiento es el modelo original en PyTorch.

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto, no razona en varios pasos y no puede usarse como chatbot ni para generación de código. Solo devuelve decisiones tipadas y sus probabilidades asociadas.
- Uso previsto restringido: la propia model card indica que está pensado para clasificar cadenas cortas de contexto de pantalla dentro de Daylens y recomienda usar el modelo original para uso general.
- Idiomas no documentados: aunque se describe como multilingüe, no se publica la lista de idiomas soportados ni evaluaciones por idioma, por lo que el rendimiento fuera de los idiomas principales es desconocido.
- Sin cuantizaciones publicadas en este repositorio: solo existe fp32, lo que limita el ahorro de memoria frente a alternativas INT8 y hace que el repo ocupe 1,7 GB.
- Formato de entrada dependiente del runtime: las posiciones de los marcadores de pregunta y opción deben enviarse tal y como espera la cabeza de decisión; es imprescindible usar `laya-meta.json` y replicar el formateo del código Python oficial para obtener resultados válidos.
- Riesgo de alucinación no evaluado: no se publican análisis de fiabilidad, calibración de probabilidades ni tasas de error fuera del conjunto dorado de Daylens (96 casos), que es una muestra muy reducida.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgo, equidad o toxicidad del modelo original ni del export.
- Adopción nula verificable: 0 descargas y 0 «likes» en el momento de la consulta, sin issues ni discusiones públicas; no hay evidencia de uso en producción por terceros.
- Obra derivada: el mantenimiento, las correcciones y el soporte dependen de Convai Innovations para los pesos y del autor del export para la integración ONNX. Los ficheros incluyen sumas SHA-256 para verificar la integridad de la descarga.
- Licencia: Apache-2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se atribuya el modelo original a Convai Innovations, tal y como hace la propia model card. No hay cláusulas de uso aceptable adicionales documentadas en la información disponible.

## Enlaces

- Modelo en HuggingFace (este export): https://huggingface.co/aaronalexS/daylens-laya-onnx
- Modelo base original: https://huggingface.co/convaiinnovations/laya
- Export independiente en HuggingFace: https://huggingface.co/receptron/laya-onnx
- Servidor ONNX con endpoint `/v1/systemone`: https://github.com/navopw/laya-onnx
- Export orientado a navegadores: https://github.com/gqgs/laya-onnx
