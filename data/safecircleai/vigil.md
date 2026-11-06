# safecircleai/vigil

## Resumen

Vigil es un clasificador de seguridad infantil desarrollado por SafeCircle AI. Se trata de un encoder mmBERT-base de 322 millones de parámetros, derivado de [Laya-multilingual](https://huggingface.co/convaiinnovations/laya-multilingual), afinado sobre datos sintéticos de conversaciones entre menores y terceros. A diferencia de los modelos generativos de la misma familia (Horizon), Vigil no produce texto: en un único forward pass devuelve una probabilidad por cada una de siete categorías de riesgo (grooming, bullying, contenido sexual, aislamiento, información personal, migración de plataforma y amenazas) junto con una puntuación de severidad. Esto elimina el parseo de salidas y los formatos malformados.

El modelo está pensado para moderación de chats y detección temprana de riesgos en entornos de mensajería, con un enfoque explícito de despliegue en dispositivo (exportaciones LiteRT/TFLite para Android y GGUF para llama.cpp). Su relevancia actual radica en la combinación de un encoder compacto con cabeceras de decisión calibradas y umbrales operativos por categoría, algo poco habitual en clasificadores de seguridad.

No obstante, el propio autor lo etiqueta como *research checkpoint*: todos los datos de entrenamiento y evaluación son conversaciones sintéticas generadas por LLM, no se ha probado en un teléfono real y, sobre generadores no vistos en entrenamiento, marca como riesgo entre el 12 % y el 19 % de chats inocuos. La licencia SafeCircle Research License prohíbe el uso comercial sin permiso escrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-base) con cabecera de decisión de 2 capas, type embedding y scorer |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (entrada `[2, 512]` en el grafo LiteRT) |
| Tipos de cuantizacion | fp32 (LiteRT), f16 (GGUF), Q8_0 (GGUF) |
| Idiomas soportados | en, es |
| Licencia | SafeCircle Research License (SRL-1.0); uso comercial prohibido sin permiso escrito |
| Formato de pesos | safetensors (PyTorch), TFLite/LiteRT, GGUF |
| Modelo base | convaiinnovations/laya-multilingual |
| Pipeline | text-classification |
| Tamano del repo | 3.2 GB |

## Arquitectura y entrenamiento

Vigil parte de Laya-multilingual, un encoder mmBERT-base de 322M parámetros, y lo afina de forma completa (full fine-tuning) sobre datos sintéticos de seguridad infantil de SafeCircle. Sobre el encoder se añade una cabecera de decisión de dos capas, un type embedding y un scorer que, junto con temperaturas de calibración, producen la distribución de probabilidad sobre las siete categorías de riesgo y la puntuación de severidad. El modelo no genera texto: recibe la conversación junto con dos preguntas fijas (una elección de 8 vías para la categoría y una puntuación de severidad) y emite números directamente.

La decisión final se toma aplicando umbrales operativos por categoría definidos en `thresholds.json` / `vigil_spec.json`, archivo obligatorio para cualquier uso del modelo. Las exportaciones incluyen el clasificador completo (encoder, cabecera, type embedding, scorer, temperaturas y tokenizer), no solo el encoder. El tokenizer es un BPE compacto (9 MB) con `prepend_scheme: always` de Metaspace, lo que impide que llama.cpp estándar cargue los GGUF. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación multi-etiqueta de conversaciones en siete categorías de riesgo: grooming, bullying, contenido sexual, aislamiento, información personal, migración de plataforma y amenazas.
- Puntuación de severidad continua con etiquetas cualitativas (`none`, `high`, etc.).
- Salida numérica estructurada (probabilidades + severidad), sin texto que parsear ni riesgo de formato inválido.
- Decisiones calibradas mediante umbrales por categoría y temperaturas ajustadas.
- Multilingüe limitado a inglés y español.
- Despliegue en dispositivo: grafo LiteRT/TFLite fp32 para Android y GGUF f16/Q8_0 para llama.cpp.
- Inferencia determinista entre Metal y CPU en la ruta GGUF (probabilidades idénticas).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de un solo forward pass.
- No dispone de visión, audio ni modo thinking.

## Casos de uso

- Moderación de chats en apps de mensajería para menores: Vigil puede ejecutarse en el propio dispositivo con el grafo LiteRT de 1,29 GB y marcar conversaciones con probabilidad alta de grooming o aislamiento antes de que salgan del terminal, gracias a su ventana de 512 tokens y a la salida numérica directamente accionable.
- Detección de grooming en plataformas de juego online: el ejemplo de la model card (adulto que pide secreto, cambia a Snapchat y pide la edad) se clasifica con probabilidad 0,9906 de grooming y severidad 2,99 (`high`), lo que permite disparar alertas o revisiones humanas.
- Filtrado previo en pipelines de revisión humana: al devolver probabilidades por categoría, permite ordenar la cola de moderación por severidad y reducir el volumen de casos que llegan a revisores.
- Investigación académica sobre detección de riesgos infantiles: el checkpoint y sus datos sintéticos sirven como línea base reproducible para comparar clasificadores y estudiar calibración en dominios sintéticos.
- Clasificación por lotes en servidor con llama.cpp: usando el fork indicado y `run_vigil.py`, se pueden procesar conversaciones en CPU o Metal con probabilidades idénticas, útil para auditar históricos de chat.
- Prototipado de salvaguardas en asistentes conversacionales dirigidos a menores: integrado como capa de filtro posterior a la generación, bloquea respuestas que activen categorías de riesgo antes de mostrarlas.
- Evaluación comparativa frente a modelos generativos de moderación: al ser el contrapunto encoder de Horizon, permite medir coste, latencia y tasa de falsos positivos entre enfoques generativo y discriminativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad y latencia de la exportación LiteRT frente a PyTorch en `litert/report.json` (contenido no incluido en la información proporcionada) y una tasa de falsos positivos del 12–19 % sobre chats inocuos generados por modelos no vistos en entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint PyTorch en fp32 ocupa aproximadamente 1,3 GB de pesos (322M parámetros); con activaciones y overhead de runtime, se recomienda al menos 2–3 GB de VRAM para lotes pequeños.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para fp32 (RTX 3050, RTX 4060, T4); A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en todas las RTX modernas con 4 GB o más; también en Apple Silicon vía Metal con la ruta GGUF.
- Despliegue en dispositivo: LiteRT/TFLite fp32 de 1,29 GB para Android; GGUF f16 de 659 MB y Q8_0 de 542 MB para llama.cpp.
- Opciones de despliegue: PyTorch con `laya.Agent`; LiteRT/TFLite en Android; llama.cpp únicamente mediante el fork `Clauszy/llama.cpp` en el commit `ffc55c93` (target `llama-laya-cli`). vLLM, TGI, Ollama, `llama-cli` y `llama-server` estándar no cargan estos pesos.
- Latencia: aproximadamente 2 s por llamada en un Mac Apple Silicon con el fichero en caché (la primera ejecución es más lenta por lectura de disco); no se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Vigil | 322M | 512 | Clasificación de 7 riesgos infantiles + severidad | SafeCircle Research License (no comercial sin permiso) | safetensors, TFLite, GGUF |
| Horizon (SafeCircle) | no disponible | no disponible | Moderación generativa | SafeCircle Research License | no disponible |
| Laya-multilingual (base) | 322M | no disponible | Encoder multilingüe general | no disponible | safetensors |
| Clasificadores de moderación genéricos | variable | variable | Categorías de toxicidad generales | variable | variable |

La información disponible no incluye datos de rendimiento de Horizon ni de Laya-multilingual que permitan una comparación cuantitativa; la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que no está listo para moderación en producción.
- Entrenamiento y evaluación exclusivamente con conversaciones sintéticas generadas por LLM; no se usaron conversaciones reales de menores.
- Tasa de falsos positivos del 12–19 % sobre chats inocuos generados por modelos no vistos durante el entrenamiento.
- No se ha ejecutado en un teléfono real, pese a la orientación on-device.
- Ventana de contexto de 512 tokens, insuficiente para conversaciones largas sin troceado.
- Solo inglés y español.
- Licencia SRL-1.0: prohibido el uso comercial sin permiso escrito de SafeCircle (legal@safecircle.tech).
- Los GGUF no funcionan con llama.cpp upstream, Ollama ni las herramientas estándar; requieren un fork no oficial y no afiliado a SafeCircle.
- Riesgo de alucinación no aplica en sentido generativo (salida numérica), pero sí de calibración errónea fuera de la distribución sintética.
- No se detallan sesgos demográficos ni lingüísticos en la información disponible.
- Los umbrales de `thresholds.json` son obligatorios; usarlos sin ajuste o modificarlos invalida el comportamiento calibrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/safecircleai/vigil
- Modelo base Laya-multilingual: https://huggingface.co/convaiinnovations/laya-multilingual
- Modelos generativos Horizon: https://huggingface.co/safecircleai/horizon-full
- Licencia SafeCircle Research License: https://huggingface.co/safecircleai/horizon-full/blob/main/LICENSE-SAFECIRCLE.md
- Pull request de referencia en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29363
- Fork de llama.cpp compatible: https://github.com/Clauszy/llama.cpp (commit `ffc55c93`)
