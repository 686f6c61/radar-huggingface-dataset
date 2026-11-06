# OsaurusAI/MiniMax-M3.1-Flash-JANGHT1.9

## Resumen

MiniMax-M3.1-Flash-JANGHT1.9 es una cuantización de tipo JANGHT del modelo MiniMax-M3.1-Flash de MiniMaxAI, publicada por OsaurusAI para su ejecución en Macs con 128 GB de memoria unificada mediante el runtime Osaurus (versión 0.25.30 o superior) sobre MLX. El modelo base es un transformer MoE de 60 capas con atención dispersa propietaria (MiniMax sparse attention), 128 expertos enrutados por capa con top-4 más un experto compartido, y una torre de visión de 32 capas. El bundle ocupa 95,5 GiB en memoria, de los cuales 93,3 GiB corresponden al modelo (incluida la torre de visión de 1,6 GiB) y 2,1 GiB al borrador especulativo DSpark.

El interés de esta publicación no reside en el modelo base, sino en la técnica de cuantización: los expertos enrutados (413B de los aproximadamente 427B de parámetros fuera del borrador, un 97 %) se comprimen a 1,748 bits por peso mediante códigos trellis JANGT, rotación Hadamard-128 con signos de columna por capa, feedback de error derivado del Hessiano de activaciones de cada experto y refit de ganancias por fila. El resto del tronco (atención, expertos compartidos, MLPs densos de las capas 0-2) se cuantiza a 4 bits afín con GPTQ, y el `lm_head` y los embeddings a 6 bits. El resultado son 1,878 bits por peso de media, redondeados a 1,9 en el nombre.

La relevancia actual es que demuestra que un MoE de esta escala puede ejecutarse íntegramente en memoria en hardware Apple Silicon de gama alta con una degradación medible y acotada: un KL medio de 0,258 sobre tokens de asistente en dominios de retención, con un top-1 del 85,9 % respecto al modelo fuente en precisión de release. Es, por tanto, una pieza orientada a desarrolladores que quieran evaluar el modelo base en local sin infraestructura de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa MiniMax (lightning indexer, top-16 bloques de 128 claves), 60 capas, hidden 6144, 64 cabezas de query / 4 de KV, RoPE parcial, torre de visión de 32 capas |
| Parametros totales | 36.688.878.464 (safetensors del bundle); aproximadamente 427B en el modelo fuente fuera del borrador DSpark |
| Parametros activos | 128 expertos enrutados por capa con top-4 más un experto compartido; MLPs densos en capas 0-2. Número exacto de parámetros activos: no disponible |
| Longitud de contexto | No disponible en la información proporcionada (el conjunto de evaluación incluye documentos de hasta 16k tokens) |
| Tipos de cuantizacion | JANGT trellis a 1/1,5/2/2,5 bits por capa y proyección en expertos enrutados; afín 4 bits (grupo 64) con GPTQ en atención, expertos compartidos y MLPs densos; MXFP8 en el indexer de atención dispersa; F32 en gates del router y biases de corrección de score; BF16 en norms; afín 6 bits (grupo 64) con GPTQ en embeddings y `lm_head`; BF16/F32 sin tocar en torre de visión, patch merge y proyector; MXFP8/BF16 en el borrador DSpark. Media: 1,878 bits por peso |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | minimax-community (license: other) |
| Formato de pesos | safetensors (MLX), bundle JANGHT con subdirectorio `dspark/` para el borrador |

## Arquitectura y entrenamiento

El modelo base es un MoE de 60 capas con atención dispersa propietaria: un indexador tipo lightning selecciona los 16 mejores bloques de 128 claves para cada query, lo que reduce el coste de atención en contextos largos. Los expertos enrutados (128 por capa, top-4 más uno compartido) se distribuyen en las capas 3 a 59, mientras que las capas 0 a 2 usan MLPs densos. La torre de visión tiene 32 capas y el borrador especulativo DSpark, 5 capas con bloques de 7 tokens. Los detalles de entrenamiento del modelo fuente (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada.

La innovación técnica de esta publicación es el esquema de cuantización JANGT. Los expertos enrutados se comprimen con códigos trellis, rotación Hadamard-128 con signos de columna por capa, feedback de error a partir del Hessiano de activaciones del propio experto, refit de ganancias por fila y columnas atípicas exactas. El ancho de bits se asigna por capa y proyección según el efecto medido de cada una sobre el KL de tokens de asistente: gate/up a 1 bit en 16 capas, 1,5 en 26 y 2 en 15; down a 1 bit en 2 capas, 1,5 en 12, 2 en 10 y 2,5 en 33. La atención, los expertos compartidos y los MLPs densos se cuantizan a 4 bits afín con GPTQ sobre estadísticas de entrada capturadas por capa, una decisión tomada por medición: en un subconjunto de retención de 38 conversaciones, ese tronco a 4 bits costó un KL de asistente de 0,015 y el `lm_head` a 6 bits, 0,0003. La torre de visión y el proyector se conservan byte a byte en BF16/F32.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento adaptativo y cinco niveles de esfuerzo de razonamiento.
- Generación de código, con buen comportamiento medido en el dominio de coding (top-1 del 91,3 % frente al fuente en tokens de asistente).
- Capacidades matemáticas y científicas: el dominio de science muestra la mayor degradación relativa (KL medio 0,251, top-1 84,5 %), pero se mantiene funcional.
- Entrada de imagen (pipeline image-text-to-text): OCR de facturas, conteo de formas, gráficos de barras, tablas, capturas de código con errores, errores de terminal, layout y color, aritmética visual, OCR en chino, comparación de dos imágenes y páginas de documento de hasta 1543 × 1999 píxeles, incluidas imágenes de 112 px no múltiplas de 28.
- Tool calling y function calling, con esquemas de herramientas gestionados en el contexto.
- Uso como agente en conversaciones multiturno con llamadas a herramientas y razonamiento multi-paso.
- Decodificación especulativa mediante el borrador DSpark de 5 capas y bloques de 7 tokens.
- Capacidades multilingües limitadas a inglés y chino; el dominio multilingüe es el que más se degrada en la cuantización (top-1 del 71,4 %).

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo mantiene un top-1 del 91,3 % frente al fuente en tokens de asistente de coding y un KL mediano de 0,0008, por lo que es adecuado para autocompletado, revisión de parches y explicación de errores en un flujo de trabajo sin conexión.
- Agente de terminal y automatización de shell: el dominio terminal es el que mejor retiene (KL medio 0,048, top-1 93,6 %), lo que lo hace apto para tareas de ejecución de comandos, interpretación de salidas de error y reparación iterativa en un bucle de agente.
- Procesamiento de documentos con OCR y extracción estructurada: la torre de visión se conserva sin cuantizar y supera 12 de 12 pruebas de imagen graduadas, incluidas facturas, tablas y páginas de documento de alta resolución; útil para pipelines de digitalización en escritorio.
- Análisis de capturas de pantalla y depuración visual: puede localizar un bug en una captura de código o interpretar un error de terminal a partir de una imagen, lo que encaja en herramientas de soporte técnico y triaje de incidencias.
- Asistente conversacional multiturno con herramientas: el dominio agentic retiene un top-1 del 88,8 % y un top-5 del 99,3 %, suficiente para flujos de atención al cliente o asistentes internos que encadenan llamadas a APIs.
- Razonamiento y resolución de problemas con modo de pensamiento: los cinco niveles de esfuerzo permiten ajustar el coste computacional al tipo de consulta, desde respuestas directas hasta cadenas de razonamiento largas en tareas de análisis.
- Evaluación e investigación del modelo base: al ser una cuantización con métricas de fidelidad publicadas por dominio, sirve para estudiar el impacto de la compresión extrema en MoEs de gran escala sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card publica métricas de fidelidad frente al modelo fuente en precisión de release, evaluadas con teacher forcing sobre 290 conversaciones de retención y 456.954 posiciones puntuadas, con KL sobre los 128 tokens principales del fuente más un bucket de cola.

| Dominio (tokens de asistente) | Posiciones | KL medio ↓ | KL mediano ↓ | KL p99 ↓ | Top-1 ↑ | Top-5 ↑ |
|---|---|---|---|---|---|---|
| Agentic (tool calls, multiturno) | 34.066 | 0,128 | 0,022 | 1,58 | 88,8 % | 99,3 % |
| Coding | 48.223 | 0,140 | 0,0008 | 2,41 | 91,3 % | 99,1 % |
| Terminal | 29.650 | 0,048 | 0,0022 | 0,55 | 93,6 % | 99,9 % |
| Reasoning | 29.068 | 0,091 | 0,0014 | 1,31 | 92,6 % | 99,7 % |
| Contexto largo (documentos hasta 16k) | 782 | 0,143 | 0,0072 | 2,17 | 89,5 % | 99,9 % |
| Science | 16.236 | 0,251 | 0,043 | 2,76 | 84,5 % | 98,3 % |
| Story (escritura creativa) | 36.199 | 0,611 | 0,216 | 5,62 | 71,9 % | 93,0 % |
| Multilingual | 18.393 | 0,732 | 0,174 | 6,62 | 71,4 % | 91,5 % |
| **Total** | **212.617** | **0,258** | **0,017** | **3,61** | **85,9 %** | **97,6 %** |

Sobre todas las posiciones puntuadas (incluidos system prompts, esquemas de herramientas, resultados de herramientas, texto de usuario y documentos): KL medio 1,236, mediano 0,085, top-1 70,1 %, top-5 85,4 %. La model card advierte de que ese texto es de lectura, no de escritura, y que el propio modelo fuente es inseguro ahí (NLL medio de 5,44 nats por token), por lo que la medida de calidad válida son los tokens de asistente.

Desglose por confianza del fuente (todas las posiciones): cuando el fuente asigna ≥ 0,99 al token principal (26 % de las posiciones) el bundle coincide el 97,6 % de las veces; en el rango 0,9-0,99, el 84,6 %; en 0,7-0,9, el 72,6 %; en 0,5-0,7, el 58,2 %; por debajo de 0,5, entre el 45 % y el 49 %.

En imágenes: 12 de 12 prompts graduados correctos. Con teacher forcing sobre las propias respuestas del bundle con las mismas características de imagen (1.764 tokens de respuesta): KL medio 0,073, mediano 0,0004, top-1 93,8 %, top-5 99,7 %; la elección entre pensar y omitir el razonamiento coincide 12 de 12 veces con el fuente.

## Requisitos de hardware

- Memoria: el bundle completo ocupa 95,5 GiB, todos residentes en memoria: 93,3 GiB del modelo (incluida la torre de visión de 1,6 GiB) más 2,1 GiB del borrador DSpark. Está diseñado para Macs de 128 GB de memoria unificada.
- GPU: no aplica en el sentido convencional; el runtime es MLX sobre Apple Silicon. No hay soporte indicado para A100, H100 ni RTX 4090 en la información disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional por tamaño; el objetivo es Apple Silicon de 128 GB.
- Despliegue: runtime Osaurus 0.25.30 o superior (el `osaurus.json` declara `required_osaurus_version` 0.25.30 y `model_version` 1). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El borrador especulativo DSpark (5 capas, bloques de 7 tokens) está pensado para acelerar la decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / hardware | Notas |
|---|---|---|---|---|---|
| OsaurusAI/MiniMax-M3.1-Flash-JANGHT1.9 | 36,7B en safetensors del bundle; ~427B en el fuente fuera del borrador | No disponible | minimax-community | safetensors MLX, Apple Silicon 128 GB | Cuantización JANGHT a 1,878 bits/peso con métricas de fidelidad por dominio |
| MiniMaxAI/MiniMax-M3.1-Flash (fuente) | ~427B fuera del borrador | No disponible | minimax-community | Precisión de release (BF16/MXFP8 según tensor) | Referencia de calidad contra la que se mide el bundle; requiere hardware muy superior |
| Otras cuantizaciones del mismo fuente | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la información proporcionada |

No se dispone de datos de benchmarks estándar ni de otras alternativas comparables en la información proporcionada, por lo que la comparación se limita al par bundle/fuente.

## Limitaciones y advertencias

- La licencia minimax-community es de tipo "other"; deben revisarse los términos del archivo LICENSE antes de cualquier uso comercial. No se detallan aquí las restricciones concretas.
- Solo soporta inglés y chino; el dominio multilingüe es el más degradado por la cuantización (KL medio 0,732, top-1 71,4 %), por lo que no es adecuado para otros idiomas.
- La escritura creativa (story) es el segundo dominio más afectado (KL medio 0,611, top-1 71,9 %); para producción literaria conviene validar contra el fuente.
- El dominio de science muestra la mayor degradación entre los dominios técnicos (KL medio 0,251, top-1 84,5 %); en contextos científicos de alta precisión, verificar las salidas.
- El texto de lectura (prompts, esquemas de herramientas, documentos) presenta un KL medio de 1,236 y un top-1 del 70,1 %; la model card atribuye buena parte de esto a la inseguridad del propio fuente, pero implica que pequeñas diferencias pueden alterar decisiones en esas posiciones.
- El texto de ciberseguridad no estaba en los conjuntos de calibración ni de retención, por lo que su comportamiento en ese dominio es desconocido.
- La cuantización introduce riesgo adicional de alucinación y de deriva en la elección de tokens de baja probabilidad; los flips se concentran donde el fuente es inseguro (por debajo de 0,7 de confianza, la coincidencia cae al 45-58 %).
- Dependencia estricta del runtime Osaurus 0.25.30 o superior y de MLX; no hay indicios de compatibilidad con otros motores de inferencia.
- Requiere 128 GB de memoria unificada; no es desplegable en hardware convencional de consumo ni en GPUs de centro de datos con los formatos indicados.
- El número de descargas y likes es muy bajo (2 descargas, 0 likes en el momento de la consulta), lo que sugiere poca validación comunitaria independiente.
- La longitud de contexto del modelo no se especifica en la información disponible; la evaluación solo cubre documentos de hasta 16k tokens.

## Enlaces

- [OsaurusAI/MiniMax-M3.1-Flash-JANGHT1.9 en Hugging Face](https://huggingface.co/OsaurusAI/MiniMax-M3.1-Flash-JANGHT1.9)
- [MiniMaxAI/MiniMax-M3.1-Flash (modelo base)](https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash)
- [Osaurus AI](https://osaurus.ai)
