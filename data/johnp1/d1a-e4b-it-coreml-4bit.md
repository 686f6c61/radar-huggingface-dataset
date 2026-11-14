# JohnP1/d1a-e4b-it-coreml-4bit

## Resumen

D1A-E4B-it v0.6 Core ML int4 es la conversión a Core ML con cuantización de 4 bits del modelo de decisión D1A, desarrollado por JohnP1 (jonpol01) sobre el modelo base google/gemma-4-E4B-it de Google. No es un modelo generativo al uso: recibe un documento y un conjunto de preguntas (de tipo sí/no, elección múltiple o puntuación) y devuelve, en una sola pasada hacia delante, una probabilidad calibrada para cada opción, sin generar texto. Esto garantiza que toda respuesta sea una opción válida del conjunto planteado.

La arquitectura subyacente es un transformer de 42 capas derivado de Gemma 4 E4B-it, con pesos cuantizados a int4 por bloques de 32 (2,1 GB en fragmentos más 2,3 GB de tablas de embeddings), orientado a ejecución en el Apple Neural Engine y la GPU de dispositivos Apple. La ventana de contexto está limitada a 512 tokens y el modelo es exclusivamente de texto.

Su relevancia actual radica en que ofrece inferencia local de clasificación y decisión estructurada en hardware de consumo Apple (Mac con M1 Max, potencialmente iPhone aunque no verificado), con licencia Apache-2.0. No obstante, la propia model card advierte de que la cuantización a 4 bits introduce desviaciones en las respuestas (3 de 42 respuestas cambian frente a la referencia fp32) y de que el modelo es sobreconfiado en dominios fuera de entrenamiento, por lo que para decisiones críticas se recomienda la build MLX de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 42 capas (derivado de Gemma 4 E4B-it), con cabeza de puntero para clasificación |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens (máximo, solo texto) |
| Tipos de cuantizacion | int4 (pesos por bloques de 32); embeddings con cuantización afín MLX; existe build MLX 8-bit alternativa |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlpackage) más safetensors para embeddings y cabeza; tokenizer.json de Gemma 4 E4B-it |

## Arquitectura y entrenamiento

El modelo es una conversión Core ML de D1A-E4B-it v0.6, que a su vez se construye sobre el transformer Gemma 4 E4B-it de Google. La arquitectura conserva las 42 capas del modelo base, pero sustituye la generación autoregresiva por una cabeza de puntero ("pointer head") que produce probabilidades calibradas sobre las opciones de cada pregunta en una única pasada. Los pesos se cuantizan a int4 en bloques de 32 y se distribuyen en 7 fragmentos .mlpackage; las tablas de embeddings se leen fila a fila en el host desde safetensors con cuantización afín MLX. El modelo incluye una temperatura de servicio de 1,55 registrada en d1a_config.json.

El entrenamiento se realizó con un token `<bos>` (id 2) al inicio de cada registro, aunque el tokenizer de Gemma 4 E4B-it no lo añade por defecto; las aplicaciones que codifiquen peticiones deben anteponerlo manualmente y rellenar por la derecha hasta 512 tokens. La model card no detalla el volumen de tokens de entrenamiento ni la composición del dataset, pero sí menciona que se evaluó sobre "transfer-v4", un conjunto de ocho fuentes de tareas públicas mantenidas fuera del entrenamiento. D1A se construye sobre el framework Kev de Jared Palmer (Apache-2.0).

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de tipo sí/no ("noul"), elección múltiple ("choice") y puntuación, devolviendo una probabilidad calibrada por opción.
- Sin generación de texto: cada respuesta es siempre una de las opciones proporcionadas, lo que elimina el riesgo de respuestas fuera de formato.
- Procesamiento de documentos de hasta 512 tokens en una sola pasada.
- Soporte de múltiples preguntas simultáneas sobre un mismo estado o documento (por ejemplo, asignación de equipo y urgencia en una sola petición).
- Ejecución en Apple Neural Engine y GPU de Apple mediante Core ML (CPU_AND_GPU).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni vídeo (los encoders de foto, voz y vídeo son modelos separados no convertidos).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una reclamación, el modelo asigna el equipo responsable (devoluciones, envío, facturación) y determina si requiere respuesta urgente, como ilustra el ejemplo de la model card con un pedido tardío y un doble cargo.
- Enrutamiento de correo entrante: clasificación de mensajes en categorías predefinidas con probabilidad calibrada, útil para derivar a departamentos sin generación de texto libre.
- Moderación de contenido ligera: evaluación de documentos cortos contra criterios binarios definidos por la aplicación, aprovechando que toda respuesta es una opción válida.
- Extracción de señales en formularios: puntuación de campos o respuestas en encuestas y formularios estructurados de hasta 512 tokens.
- Preetiquetado en pipelines de anotación: la model card menciona un conjunto de 276 "labeler answers", lo que sugiere su uso como etiquetador previo en flujos de anotación humana.
- Clasificación local en macOS: aplicaciones de escritorio que necesiten decidir sobre documentos sin enviar datos a la nube, ejecutando el modelo en la GPU del Mac (p50 de 6,6 s por petición en un M1 Max).
- Automatización de decisiones en dispositivos Apple: integración en apps de macOS 15 / iOS 18 o posteriores mediante Core ML, aunque la ejecución en iPhone no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta métricas de fidelidad y calibración:

| Metrica | Valor |
|---|---|
| Respuestas alteradas vs. referencia fp32 (int4, M1 Max) | 3 de 42 (7,1%), todas en preguntas claras (ventaja > 0,05); cambio máximo de probabilidad 0,455 |
| Comparación: D1A-E2B-it int4 Core ML | 0 de 42 respuestas alteradas |
| Latencia en GPU del Mac (CPU_AND_GPU) | p50 6,6 s; p95 9,2 s por petición |
| Tiempo de carga inicial (compilado) | 469 s |
| Calibración en transfer-v4 (build MLX 8-bit) | Confianza media 0,08 por encima de la precisión (ECE 0,081); rango de −0,04 (qnli) a +0,25 (emotion) |
| Respuestas con confianza ≥ 0,9 incorrectas | 8,8% |
| Temperatura óptima para transfer-v4 | 2,3 (frente a 1,55 servida); empeora 15 de los otros 21 conjuntos |
| Fidelidad build MLX 8-bit | 1 de 202 respuestas de demo y 3 de 276 de etiquetado difieren del modelo servido |

## Requisitos de hardware

- VRAM/almacenamiento: 4,6 GB de repositorio (2,1 GB de fragmentos int4 más 2,3 GB de tablas de embeddings).
- Hardware verificado: Apple M1 Max con GPU (CPU_AND_GPU); requiere macOS 15 o iOS 18 o posterior.
- No verificado en iPhone; no hay build int8 Core ML planificada para E4B-it.
- No cabe en GPU consumer NVIDIA: el formato es Core ML, específico de Apple Silicon y el Neural Engine.
- Despliegue: coremltools con el paquete d1a (git+https://github.com/jonpol01/d1a); scripts de referencia run.py (una petición), workers.py (un proceso por fragmento), d1a_coreml.py (embeddings y máscaras en host) y pipeline.py (todos los fragmentos en un proceso).
- Latencia: p50 6,6 s y p95 9,2 s por petición en M1 Max; la primera ejecución compila los fragmentos en coreml/.compiled/ y tarda varios minutos (469 s en la medición reportada).
- Para respuestas que no deban moverse, se recomienda la build MLX 8-bit JohnP1/d1a-e4b-it-mlx-q8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| D1A-E4B-it Core ML int4 (este) | no disponible (42 capas) | 512 tokens | int4 (bloques de 32) | Apache-2.0 | 3 de 42 respuestas alteradas vs. fp32; p50 6,6 s en M1 Max |
| D1A-E4B-it MLX 8-bit (JohnP1/d1a-e4b-it-mlx-q8) | no disponible | 512 tokens | 8-bit | Apache-2.0 | 1 de 202 respuestas de demo y 3 de 276 de etiquetado difieren del servido; recomendado para decisiones críticas |
| D1A-E2B-it Core ML int4 | no disponible | no disponible | int4 | Apache-2.0 | 0 de 42 respuestas alteradas; mayor fidelidad en la comparación reportada |
| D1A-E4B-it v0.6 (original, JohnP1/d1a-e4b-it) | no disponible | 512 tokens | fp32/8-bit según build | Apache-2.0 | Modelo de referencia del que derivan las conversiones |

## Limitaciones y advertencias

- La cuantización int4 altera respuestas: 3 de 42 cambian frente a la referencia fp32, con un cambio máximo de probabilidad de 0,455, incluso en preguntas claras.
- Sobreconfianza en dominios fuera de entrenamiento: en transfer-v4 la confianza media supera la precisión en 0,08 (ECE 0,081) y el 8,8% de las respuestas dadas con confianza ≥ 0,9 son incorrectas; una única temperatura global no corrige el sesgo (la óptima para transfer-v4, 2,3, empeora 15 de los otros 21 conjuntos).
- No verificado en iPhone; solo probado en Mac con M1 Max.
- Límite estricto de 512 tokens y solo texto; sin soporte de foto, voz ni vídeo.
- Requiere anteponer manualmente el token `<bos>` (id 2) si la aplicación codifica las peticiones por sí misma; de lo contrario, los resultados pueden degradarse.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Idiomas soportados no disponibles; no se documenta cobertura multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 4 de Google también es Apache-2.0 según la model card; conviene verificar los términos de Gemma 4 en su repositorio oficial.
- Para decisiones críticas, la propia model card recomienda la build MLX 8-bit en lugar de esta conversión int4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnP1/d1a-e4b-it-coreml-4bit
- Modelo original: https://huggingface.co/JohnP1/d1a-e4b-it
- Build MLX 8-bit recomendada: https://huggingface.co/JohnP1/d1a-e4b-it-mlx-q8
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del framework d1a: https://github.com/jonpol01/d1a
- Issue sobre calibración y temperatura: https://github.com/jonpol01/d1a/issues/361#issuecomment-6874951783
- Framework Kev de Jared Palmer: no disponible (enlace no incluido en la información proporcionada)
