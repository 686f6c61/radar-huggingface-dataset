# OsaurusAI/d3-turbo-JANG_4M

## Resumen

OsaurusAI/d3-turbo-JANG_4M es una cuantización de 4 bits en formato MLX del modelo vllm-sr/d3-turbo, un modelo de decisión multimodal de aproximadamente 26.090 millones de parámetros (27B nominales) que forma parte de Decision 3.0, el componente de enrutamiento semántico del proyecto vLLM Semantic Router. No es un modelo generativo: recibe un estado (texto o JSON y, opcionalmente, imágenes y vídeos) junto con preguntas tipadas —elegir una opción entre varias, responder sí/no, puntuar en una escala ordenada o localizar un objeto con una caja y su confianza— y devuelve, en una sola pasada forward, una distribución de probabilidad por opción sin producir ningún token de texto.

El interés de esta ficha concreta está en la compresión: el bundle ocupa 19,31 GB de shards (5,92 bits por peso efectivos) frente a los 52,2 GB del original en BF16, y según el autor mantiene la misma decisión que el modelo de precisión completa en el 97,65 % de 2.000 peticiones del test tasksource/tasksource-jev-typed-decisions y en el 97,42 % de 466 preguntas del suite público Decision Index 0.3. Es, por tanto, una alternativa para ejecutar localmente en Apple Silicon un router de decisiones de 27B con una degradación medida y acotada, no estimada.

La relevancia práctica es doble: por un lado, permite integrar enrutamiento de peticiones, selección de herramientas entre hasta 255 opciones y clasificación zero-shot multimodal en hardware de consumo; por otro, demuestra un pipeline de cuantización mixta (4 bits en las MLP, 8 bits en atención, embeddings y torre de visión, cabeza de decisión conservada en FP32) calibrado sobre el propio forward de decisión del modelo base. Requiere el runtime Osaurus 0.25.26 o superior y está licenciado Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención completa y atención lineal (híbrida), torre de visión y cabeza de decisión de 255 vías; derivada de Qwen/Qwen3.8-27B |
| Parametros totales | 26.085.330.160 (26,09B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG mixta: MLP (gate/up/down) affine 4 bits con escalas AWQ y redondeo GPTQ; atención, atención lineal, embeddings y torre de visión affine 8 bits; entradas de la puerta de atención lineal en BF16; cabeza de decisión (`decision/readout.safetensors`) en FP32 original. Media de 5,92 bits por peso |
| Idiomas soportados | en, multilingual |
| Licencia | Apache-2.0 (heredada del modelo base; se incluyen `NOTICE` y `LICENSE`) |
| Formato de pesos | safetensors (MLX), shards de 19,31 GB; librería `mlx` |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3-turbo es un transformer multimodal construido sobre Qwen/Qwen3.8-27B que sustituye la generación autoregresiva por una cabeza de lectura de 255 vías: el estado se lee una sola vez con atención prefix-bidireccional y cada pregunta se responde con una probabilidad por opción en un único forward pass. Esa cabeza de decisión se conserva aquí byte a byte en FP32, de modo que la cuantización no toca el tensor que traduce representaciones a probabilidades. El bundle no se ha reentrenado: es una cuantización post-entrenamiento, y el autor no documenta datos de preentrenamiento, número de tokens ni etapas de RLHF/DPO del modelo original.

El proceso de cuantización sí está documentado con detalle: la calibración ejecutó el propio forward de decisión de d3-turbo (formato de prompt de decisión, imágenes y vídeos incluidos) sobre 2.899 prompts de decisión y 1,96 millones de tokens, cubriendo preguntas de routing sobre peticiones reales, selección de herramientas sobre listas reales de hasta 255 opciones, trazas de agentes y terminal, código, seguridad, documentos largos, decisiones tipadas, imágenes, vídeos de pantalla y 121 preguntas de tipo Box sobre las imágenes de calibración. Las escalas activation-aware (AWQ) se pliegan en las normas y proyecciones productoras, y cada MLP cuantizada se redondea con GPTQ usando las matrices de Hessian de ese forward, conservando la cuantización módulo a módulo solo cuando supera al redondeo simple.

## Capacidades

- Clasificación zero-shot: asignar un estado a una de varias opciones con probabilidad por opción (`pipeline_tag: zero-shot-classification`).
- Decisiones booleanas sí/no con umbral explícito en 0,5.
- Puntuación en escalas ordenadas (typed decisions), incluyendo etiquetas de oro suaves.
- Selección de herramientas y routing de peticiones entre listas de hasta 255 opciones en una sola pasada.
- Entrada multimodal: texto, JSON, imágenes y vídeos.
- Localización visual (Box): devuelve una caja con su confianza, en una imagen o en un instante concreto de un vídeo.
- Procesamiento de trazas de agentes y de terminal, código, documentos largos y contenido de seguridad como estados de entrada.
- Multilingüe según la etiqueta del autor (con inglés como idioma principal declarado).
- No genera texto: la salida es siempre una distribución de probabilidad sobre opciones.

## Casos de uso

- Enrutamiento de peticiones entre modelos o proveedores: dado el prompt de un usuario como estado y una lista de modelos candidatos como opciones, el modelo devuelve la probabilidad de cada ruta en un solo forward, lo que permite umbralizar y derivar a un modelo grande solo cuando la confianza es baja.
- Selección de herramientas en agentes: con listas reales de hasta 255 herramientas, el modelo puntúa cada candidata sin necesidad de incluir todas las descripciones en un prompt generativo, reduciendo coste por decisión y evitando la latencia de decodificación.
- Clasificación zero-shot de documentos y tickets: asignar categoría, prioridad o cola a partir de texto o JSON de entrada, con probabilidades calibradas que permiten derivar a revisión humana los casos por debajo de un umbral.
- Moderación y triaje de seguridad: usar el modelo como clasificador sí/no o multietiqueta sobre trazas y contenido, aprovechando que la salida es una probabilidad y no una explicación generada, lo que facilita auditoría y logging.
- Grounding visual en documentos: localizar campos concretos (importes, totales, referencias) en facturas, capturas de pantalla, terminales o gráficos devolviendo una caja con confianza, útil en pipelines de extracción documental.
- Análisis de vídeos de pantalla: decidir en qué momento de una grabación ocurre un evento, usando la variante de caja temporal sobre vídeo.
- Evaluación automática de decisiones: al replicar la salida del modelo BF16 con alta fidelidad, sirve como sustituto barato en tests de regresión de routers y pipelines de agentes donde no se requiere precisión completa.

## Benchmarks y rendimiento

Los datos publicados miden concordancia con el modelo BF16, no rendimiento absoluto frente a terceros. Ninguna de estas preguntas se usó para calibración.

| Conjunto de test | Preguntas | Decisiones coincidentes | KL medio (↓) | Exactitud gold, BF16 → bundle |
|---|---|---|---|---|
| Decision Index 0.3 public suite (466 preguntas de 41 benchmarks) | 466 | 97,42 % | 0,0052 | 76,4 → 77,6 % |
| LocalLLaMA/typed-decisions test (gold suave) | 800 | 98,50 % | 0,0021 | 73,0 → 73,5 % |
| Decisiones held-out sobre textos, imágenes y vídeos propios | 487 | 97,54 % | 0,0049 | no disponible |
| tasksource/tasksource-jev-typed-decisions test (2.000 peticiones) | 2.000 | 97,65 % | 0,0048 | 83,5 → 83,4 % |

En preguntas de tipo Box, sobre 29 preguntas held-out (código, gráficos, documentos, capturas, terminales y una factura), la caja de este bundle solapa con la del BF16 con un IoU medio de 0,39; el autor señala que las cajas se desplazan ante cualquier perturbación y que JANG_6M alcanza 0,52 en la misma métrica. Comparativa interna de los tres bundles del autor:

| Bundle | Tamano | Decisiones (tsj, 2.000) | Decisiones (suite) | KL medio (suite) |
|---|---|---|---|---|
| d3-turbo-JANG_6M | 23,6 GB | 99,25 % | 98,07 % | 0,0006 |
| d3-turbo-JANG_4M | 19,3 GB | 97,65 % | 97,42 % | 0,0052 |
| d3-turbo-JANGH2 | 14,5 GB | 92,65 % | 91,63 % | 0,0592 |

## Requisitos de hardware

- VRAM/memoria unificada: los shards suman 19,31 GB; hay que prever margen para el estado, las imágenes o vídeos de entrada y las activaciones, por lo que se recomienda un Mac con 32 GB de memoria unificada o más. En máquinas de 24 GB el margen es muy ajustado.
- GPU: exclusivamente Apple Silicon mediante MLX. No hay soporte CUDA, ROCm ni TPU en este bundle; para GPU NVIDIA habría que usar el modelo base vllm-sr/d3-turbo (52,2 GB en BF16) u otra cuantización.
- Chips recomendados: series M1/M2/M3/M4 Max y Ultra por ancho de banda de memoria; los chips base pueden ejecutarlo pero con mayor latencia por token de estado procesado.
- Despliegue: runtime Osaurus 0.25.26 o superior (requisito explícito del autor); al ser un paquete MLX, también puede cargarse con la librería `mlx` si se respeta el layout JANG. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles. La arquitectura de decisión resuelve cada pregunta en un único forward pass sin decodificación autoregresiva, lo que en la práctica elimina el coste de generación, pero el autor no publica cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| OsaurusAI/d3-turbo-JANG_4M | 26,09B | no disponible | MLX safetensors, 19,3 GB | Apache-2.0 | 97,65 % de concordancia con BF16 en 2.000 peticiones |
| OsaurusAI/d3-turbo-JANG_6M | 26,09B | no disponible | MLX safetensors, 23,6 GB | Apache-2.0 | 99,25 % de concordancia; casi sin pérdida en decisiones |
| OsaurusAI/d3-turbo-JANGH2 | 26,09B | no disponible | MLX safetensors, 14,5 GB | Apache-2.0 | 92,65 % de concordancia; opción para memoria muy limitada |
| vllm-sr/d3-turbo (BF16) | 26,09B | no disponible | safetensors BF16, 52,2 GB | Apache-2.0 | Referencia de precisión completa; requiere mucha más memoria |

No se dispone de comparación con clasificadores zero-shot de otros autores (por ejemplo, modelos NLI de tamaño medio) en la información proporcionada; la comparativa disponible es interna a la familia d3-turbo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, explicaciones ni cadenas de razonamiento. Cualquier uso que espere salida en lenguaje natural requiere otro modelo.
- Divergencia medible: entre el 1,5 % y el 2,6 % de las decisiones cambian respecto al BF16 según el conjunto, y el KL medio en el suite público es de 0,0052, un orden de magnitud peor que JANG_6M (0,0006). En routing con umbrales ajustados, esa diferencia puede alterar el reparto de tráfico.
- Localización visual degradada: IoU medio de 0,39 frente al BF16 en preguntas de caja, sobre objetivos pequeños que el propio modelo completo responde con baja confianza. No es adecuado para extracción de coordenadas de precisión.
- Longitud de contexto no documentada; el autor no publica la ventana máxima, lo que impide planificar entradas de documentos largos con garantías.
- Idioma: etiqueta `multilingual` pero solo `en` declarado como idioma; el rendimiento fuera del inglés no está medido en la información disponible.
- Dependencia de runtime: requiere Osaurus 0.25.26 o superior y está atado a MLX/Apple Silicon; no es portable a infraestructura NVIDIA sin recuantizar desde el modelo base.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni equidad para este bundle ni para el modelo base.
- Riesgo de alucinación conceptual: al emitir probabilidades, un modelo mal calibrado puede devolver confianza alta en opciones incorrectas; conviene monitorizar la confianza por opción y no solo la etiqueta ganadora.
- Licencia Apache-2.0 permite uso comercial, pero se heredan `NOTICE` y `LICENSE` del modelo base y deben conservarse; el modelo base se apoya en Qwen/Qwen3.8-27B, cuyos términos conviene verificar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de las cifras de concordancia publicadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/d3-turbo-JANG_4M
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Modelo del que deriva el base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime Osaurus: https://osaurus.ai
- Conjunto de evaluación citado: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Conjunto de evaluación citado: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Contacto del cuantizador: eric@osaurus.ai
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
