# OsaurusAI/d3-flash-JANGH2

## Resumen

OsaurusAI/d3-flash-JANGH2 es un paquete cuantizado en formato MLX del modelo vllm-sr/d3-flash, el modelo fundacional de decisión multimodal de 9B que utiliza el Decision 3.0 de vLLM Semantic Router. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeo) y un conjunto de preguntas tipadas —elegir una entre varias opciones, sí/no, o una puntuación en una escala ordenada— y devuelve, en un único forward pass, una distribución de probabilidad por opción, sin producir texto. Está pensado para integrarse como componente de enrutamiento, selección de herramientas y clasificación dentro de pipelines de agentes.

La aportación del bundle es la compresión: reduce los 8,39B parámetros del modelo fuente (16,8 GB en BF16) a 5,28 GB de shards, con una media de 5,03 bits por peso, mediante cuantización JANGH 2-bit de las capas MLP (rotación de Hadamard-32 y codebook odd-cubic) y 8-bit afín en atención, atención lineal, embeddings y torre de visión. La cabeza de respuesta de 255 vías se conserva en FP32 byte a byte. Según el autor, mantiene la misma decisión que el modelo en BF16 en el 92,65 % de 2.000 peticiones del split de test de tasksource/tasksource-jev-typed-decisions.

Su relevancia práctica es que permite ejecutar localmente en Apple Silicon un clasificador de decisión multimodal de 255 opciones con un coste de memoria de 5,3 GB, con licencia Apache-2.0 y sin generación de texto, lo que reduce la latencia frente a esquemas de prompting sobre modelos generativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen/Qwen3.5-9B) con atención completa bidireccional en el forward de decisión, capas de atención lineal y torre de visión; cuantización híbrida JANGH |
| Parametros totales | 8,39 mil millones según la model card del bundle; el recuento de safetensors del repositorio declara 3.901.512.944 (discrepancia no aclarada por el autor) |
| Parametros activos | No aplica; la model card no describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLP en JANGH 2-bit (rotación Hadamard-32, codebook odd-cubic) con las capas más sensibles en mayor precisión; atención, atención lineal, embeddings y torre de visión en 8-bit afín; cabeza de decisión (255 vías) en FP32 original; entradas de la puerta de atención lineal en BF16. Media de 5,03 bits por peso |
| Idiomas soportados | en, multilingual (sin listado detallado de idiomas) |
| Licencia | Apache-2.0 (heredada de vllm-sr/d3-flash, con NOTICE y LICENSE incluidos) |
| Formato de pesos | safetensors para MLX (shards, 5,28 GB), más `decision/readout.safetensors` con la cabeza de respuesta |

## Arquitectura y entrenamiento

El modelo subyacente es d3-flash, construido sobre Qwen/Qwen3.5-9B y adaptado como modelo de decisión: en lugar de decodificar tokens, ejecuta un forward bidireccional con el formato de prompt de decisión y aplica una cabeza de lectura de 255 vías que produce una probabilidad por opción. El bundle conserva esa cabeza en FP32 sin modificar y mantiene en BF16 las entradas de la puerta de atención lineal, que son las más sensibles a la cuantización. El resto de la red se comprime con una mezcla de 2-bit y 8-bit: solo las capas MLP reciben el tratamiento agresivo JANGH 2-bit, y dentro de ellas las más sensibles se mantienen en mayor precisión.

El proceso de cuantización usó calibración sobre el propio forward de decisión de d3-flash (atención bidireccional completa, formato de prompt de decisión, imágenes y vídeo) con 2.778 prompts de decisión y 1,81 millones de tokens. El conjunto de calibración cubre preguntas de enrutamiento sobre peticiones reales, selección de herramientas sobre listas reales de hasta 255 opciones, trazas de agentes y de terminal, código, seguridad, documentos largos, decisiones tipadas, imágenes y vídeos de pantalla. Se aplicaron escalas activation-aware (AWQ) plegadas en las norms y proyecciones productoras, y cada MLP cuantizado se redondeó con GPTQ usando hessianos de ese forward, conservando el redondeo simple en los módulos donde GPTQ no aportaba mejora. No se documentan en la información disponible los datos de entrenamiento originales de d3-flash ni si hubo RLHF o DPO.

## Capacidades

- Clasificación zero-shot con etiquetas arbitrarias: el pipeline declarado es `zero-shot-classification`.
- Decisiones tipadas: elección entre múltiples opciones (hasta 255 vías en la cabeza de lectura), respuesta sí/no con umbral en 0,5, y puntuación en escala ordenada.
- Salida probabilística por opción en un único forward pass, sin generación de texto ni decodificación autorregresiva.
- Enrutamiento de peticiones: selección de ruta o modelo dentro de un router semántico.
- Selección de herramientas sobre listas reales de hasta 255 opciones.
- Entrada multimodal: texto, JSON, imágenes y vídeo (incluidos vídeos de pantalla y trazas de terminal).
- Ámbitos de calibración declarados: código, seguridad, documentos largos y trazas de agentes.
- Multilingüe según la etiqueta del repositorio, con inglés explícito; el resto de idiomas no está detallado.
- No soporta tool calling generativo ni razonamiento multi-paso por sí mismo: emite decisiones, no texto ni llamadas a funciones.

## Casos de uso

- Enrutamiento en vLLM Semantic Router: dado el estado de una petición, elegir entre las rutas o modelos disponibles con una sola pasada y sin generar texto, lo que evita el coste de latencia de un modelo generativo actuando como clasificador.
- Selección de herramientas en agentes: recibir el estado de la conversación y la lista de herramientas disponibles (hasta 255 opciones) y devolver la herramienta más probable, con la distribución completa para aplicar umbrales o fallback.
- Guardrails de permitir/denegar: formular la política como una pregunta sí/no y usar la probabilidad frente a 0,5 como señal de bloqueo, con umbral ajustable según la tolerancia a falsos positivos.
- Triage de tickets de soporte: clasificar texto o JSON de entrada en categorías arbitrarias definidas en el momento (por ejemplo, tipo de incidencia, urgencia o equipo responsable) sin reentrenamiento.
- Moderación con escala ordenada: puntuar contenido en una escala de severidad y decidir el nivel de acción (permitir, revisar, bloquear) a partir del valor esperado de la distribución.
- Agentes de escritorio sobre capturas de pantalla: dado un fotograma o un vídeo de la pantalla y el estado de la tarea, decidir la siguiente acción entre un conjunto cerrado de opciones.
- Evaluación de intención en asistentes de voz o chat: decidir si la utterance del usuario corresponde a una intención de la lista antes de invocar el flujo correspondiente.
- Clasificación de documentos largos y código: asignar etiquetas de seguridad, dominio o tipo de fichero a fragmentos extensos usando el mismo formato de decisión.

## Benchmarks y rendimiento

Datos publicados por el autor del bundle. La coincidencia de decisión compara la opción top elegida (o el mismo lado de 0,5 en sí/no) frente al modelo en BF16; KL se mide sobre las probabilidades de las opciones de cada pregunta. Ninguna de estas preguntas se usó para calibración.

| Conjunto de prueba | Preguntas | Coincidencia de decisión | KL medio | Precisión gold, BF16 → bundle |
|---|---|---|---|---|
| Decision Index 0.3 public suite (466 preguntas de 41 benchmarks) | 466 | 89,27 % | 0,0608 | 71,7 % → 70,5 % |
| LocalLLaMA/typed-decisions test (800 preguntas, gold suave) | 800 | 91,50 % | 0,0248 | 69,6 % → 69,5 % |
| Decisiones held-out sobre textos, imágenes y vídeos propios | 487 | 90,97 % | 0,0280 | no disponible |
| tasksource/tasksource-jev-typed-decisions test (2.000 peticiones, split usado por el proveedor para sus paquetes cuantizados) | 2.000 | 92,65 % | 0,0490 | 81,2 % → 79,0 % |

Comparación entre los tres bundles publicados por Osaurus:

| Bundle | Tamano | Decisiones (tsj, 2.000) | Decisiones (suite) | KL medio (suite) |
|---|---|---|---|---|
| d3-flash-JANG_6M | 7,8 GB | 99,40 % | 99,14 % | 0,0004 |
| d3-flash-JANG_4M | 6,6 GB | 97,65 % | 97,00 % | 0,0038 |
| d3-flash-JANGH2 | 5,3 GB | 92,65 % | 89,27 % | 0,0608 |

No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con modelos de clasificación ajenos a esta familia.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 5,28 GB de shards más overhead del runtime; en la práctica requiere un equipo con al menos 8 GB de memoria unificada disponible para el proceso, y 16 GB son recomendables para trabajar con imágenes o vídeo.
- Plataforma: exclusivamente Apple Silicon (MLX). El formato no es utilizable en GPU NVIDIA o AMD sin conversión, que no está documentada.
- GPU recomendadas: chips de la familia M de Apple (M1 Pro/Max y posteriores). No se documentan requisitos para A100, H100 ni RTX 4090, y MLX no las soporta de forma nativa.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en Apple Silicon con memoria unificada de 16 GB o más; no aplica a GPU discretas de consumo por el formato.
- Opciones de despliegue: runtime Osaurus 0.25.26 o superior (requisito explícito del autor) sobre MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este bundle; el modelo base vllm-sr/d3-flash sí está orientado a vLLM Semantic Router.
- Latencia y throughput: no disponibles. La ventaja esperada frente al modelo en BF16 es la reducción de memoria (5,3 GB frente a 16,8 GB) y, presumiblemente, menor tiempo por forward, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Decisiones (tsj, 2.000) | Decisiones (suite) | KL medio (suite) | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| d3-flash-JANGH2 | 8,39B (según card) | 5,3 GB | 92,65 % | 89,27 % | 0,0608 | Apache-2.0 | safetensors MLX |
| d3-flash-JANG_4M | 8,39B (según card) | 6,6 GB | 97,65 % | 97,00 % | 0,0038 | Apache-2.0 | safetensors MLX |
| d3-flash-JANG_6M | 8,39B (según card) | 7,8 GB | 99,40 % | 99,14 % | 0,0004 | Apache-2.0 | safetensors MLX |
| vllm-sr/d3-flash (BF16) | 8,39B | 16,8 GB | referencia | referencia | 0 | Apache-2.0 | safetensors |

No se dispone de comparaciones con clasificadores zero-shot de otras familias (por ejemplo, modelos NLI o encoders de clasificación) en la información proporcionada.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera explicaciones, resúmenes o llamadas a funciones en formato libre queda fuera de su alcance.
- Pérdida de fidelidad frente a BF16: la coincidencia de decisión es del 89,27 % en la suite pública y del 92,65 % en el split de 2.000 peticiones, lo que implica entre un 7 % y un 11 % de decisiones distintas; el KL medio de 0,0608 en la suite indica además un cambio apreciable en la forma de la distribución.
- La precisión gold baja de 71,7 % a 70,5 % en la suite y de 81,2 % a 79,0 % en el split grande, es decir, el bundle pierde aproximadamente 1-2 puntos absolutos.
- Es el más agresivo de los tres bundles: si la aplicación tolera 6,6 o 7,8 GB, JANG_4M y JANG_6M ofrecen una fidelidad sustancialmente mayor.
- Dependencia de un runtime propietario: requiere Osaurus 0.25.26 o superior; no hay soporte documentado en otras herramientas MLX ni en stacks de servidor convencionales.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad ni equidad para el modelo base ni para el bundle.
- Idioma: solo inglés explícito y una etiqueta genérica "multilingual"; no hay evaluación de rendimiento fuera del inglés, por lo que el uso en castellano no está validado.
- Riesgo de alucinación acotado pero real: el modelo no inventa texto, pero puede asignar alta probabilidad a una opción incorrecta cuando el estado de entrada está fuera de la distribución de calibración (por ejemplo, listas de herramientas o documentos con formatos muy distintos).
- Discrepancia de parámetros: la model card declara 8,39B parámetros fuente mientras que los safetensors del repositorio suman 3.901.512.944; conviene verificar la integridad del bundle antes de desplegarlo.
- Señales de validación débiles: 0 descargas y 0 likes en el momento de la consulta, y marcas temporales del repositorio (creación y actualización el 2026-10-23) anómalas; conviene confirmar la procedencia y reproducibilidad de las cifras.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar LICENSE y NOTICE. Los términos del modelo base y de Qwen3.5-9B deben respetarse igualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/d3-flash-JANGH2
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Modelo del que deriva la base: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime Osaurus: https://osaurus.ai
- Conjunto de evaluación del proveedor: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Conjunto de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Decision Index 0.3 public suite: no disponible (sin URL en la información proporcionada)
- Paper técnico: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
