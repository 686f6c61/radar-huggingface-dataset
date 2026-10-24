# OsaurusAI/d3-turbo-JANGH2

## Resumen

OsaurusAI/d3-turbo-JANGH2 es una cuantización de 2 bits del modelo multimodal de decisión vllm-sr/d3-turbo, el modelo de 27B que da soporte a Decision 3.0 dentro de vLLM Semantic Router. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeos) junto con preguntas tipadas —elegir una opción entre varias, sí/no, una puntuación en una escala ordenada o localizar un objeto con una caja y su confianza— y devuelve, en un único forward pass, una distribución de probabilidad por opción sin producir ningún token de texto. El modelo base se construye sobre Qwen/Qwen3.8-27B.

La aportación de este bundle es de compresión: empaqueta los 26,09B parámetros del modelo original (52,2 GB en BF16) en 14,50 GB de shards, con una media de 4,45 bits por peso, mediante un esquema propietario JANGH2 (MLP de 2 bits con rotación de Hadamard-32 y codebook odd-cubic) que deja en 8 bits afines la atención, la atención lineal, los embeddings y la torre de visión, y conserva en FP32 la cabeza de respuesta de 255 vías. Según el autor, mantiene la misma decisión que el modelo en precisión completa en el 92,65 % de las 2.000 peticiones del split de tasksource/tasksource-jev-typed-decisions.

Es relevante porque demuestra que un modelo de enrutamiento y decisión de 27B puede ejecutarse en memoria unificada de Apple Silicon con una pérdida de acuerdo medida y acotada, algo crítico cuando el modelo debe estar siempre residente para enrutar tráfico en producción. El bundle requiere el runtime Osaurus 0.25.26 o superior y está publicado con licencia Apache-2.0, la misma del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención prefix-bidirectional, capas de atención lineal, torre de visión y cabeza de respuesta de 255 vías (modelo de decisión, no generativo); base Qwen/Qwen3.8-27B |
| Parámetros totales | 10.178.366.704 según los metadatos de safetensors; la model card declara 26,09B parámetros en el modelo de origen (52,2 GB en BF16) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | JANGH2: MLP a 2 bits (rotación Hadamard-32, codebook odd-cubic) con capas más sensibles en bits superiores; atención, atención lineal, embeddings y torre de visión en 8 bits afines; cabeza de respuesta en FP32; entradas de puerta de atención lineal en BF16; media de 4,45 bits por peso |
| Idiomas soportados | Inglés y multilingüe (según etiquetas del autor; sin desglose de idiomas) |
| Licencia | Apache-2.0 (se conservan NOTICE y LICENSE del modelo base) |
| Formato de pesos | safetensors para MLX (shards), con tensor de lectura separado `decision/readout.safetensors` |
| Tamaño del repositorio | 14,5 GB |
| Pipeline declarado | zero-shot-classification |
| Modelo base | vllm-sr/d3-turbo (relación: quantized) |
| Runtime requerido | Osaurus 0.25.26 o superior (Apple Silicon) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del d3-turbo original: un transformer multimodal con atención prefix-bidirectional en el que el estado se lee una sola vez, pensado para formular la decisión como una clasificación sobre opciones en lugar de como generación autoregresiva. Incluye capas de atención lineal (cuyas entradas de puerta se mantienen en BF16 tras la cuantización), una torre de visión que procesa imágenes y fotogramas de vídeo, y una cabeza de respuesta de 255 vías que emite una probabilidad por opción. El bundle no reentrena el modelo: es un proceso de cuantización post-entrenamiento.

La calibración ejecutó el propio forward de decisión de d3-turbo (atención prefix-bidirectional con lectura única del estado, formato de prompt de decisión, imágenes y vídeos) sobre 2.899 prompts de decisión y 1,96M tokens. El corpus de calibración cubre preguntas de enrutamiento sobre peticiones reales, selección de herramientas sobre listas reales de hasta 255 opciones, trazas de agentes y terminal, código, seguridad, documentos largos, decisiones tipadas, imágenes, vídeos de pantalla y 121 preguntas de tipo Box sobre las imágenes de calibración. Las escalas activation-aware (AWQ) se pliegan en las normas y proyecciones productoras, y cada MLP cuantizado se redondea con GPTQ usando hessianos de ese forward, conservando el módulo solo cuando supera al redondeo simple. La cabeza de lectura de 255 vías se mantiene como tensor FP32 original, byte a byte.

## Capacidades

- Clasificación zero-shot con opciones tipadas: elegir una entre varias alternativas, responder sí/no o emitir una puntuación sobre una escala ordenada, devolviendo probabilidad por opción.
- Enrutamiento de peticiones y selección de herramientas: soporta listas de hasta 255 opciones en una sola pasada.
- Decisiones multimodales: acepta imágenes y fotogramas de vídeo junto al estado textual o JSON.
- Localización tipo Box: devuelve una caja con su confianza sobre una imagen o sobre un instante concreto de un vídeo.
- Procesamiento de estados estructurados: entrada en texto plano o JSON, útil para trazas de agentes, terminal, código y documentos largos.
- Salida puramente probabilística: no genera texto, lo que elimina el riesgo de alucinación en formato y reduce la latencia a un único forward pass.
- Capacidades multilingües declaradas por el autor, sin desglose de cobertura.
- No soporta tool calling generativo ni razonamiento multi-paso en el sentido de un LLM de chat: la decisión se resuelve en una pasada.

## Casos de uso

- Enrutamiento de tráfico en un semantic router: dado un prompt de usuario y una lista de modelos o rutas candidatas, el modelo devuelve la probabilidad de cada una y permite aplicar umbrales de confianza en lugar de un clasificador entrenado a medida; su ventana de estado se lee una sola vez, lo que abarata el coste por petición.
- Selección de herramientas en agentes: con listas reales de hasta 255 herramientas, el modelo puntúa cada candidata y resuelve la elección en un solo forward pass, sin coste de decodificación.
- Clasificación de trazas de agente y terminal: sobre logs y trazas en JSON decide si la ejecución ha tenido éxito, si requiere intervención o a qué categoría de fallo pertenece.
- Moderación y seguridad: preguntas sí/no sobre contenido y políticas, con probabilidad calibrada que permite fijar el punto de corte según la tolerancia a falsos positivos del sistema.
- Triage documental: sobre documentos largos, responder si un texto pertenece a una categoría, si contiene una cláusula concreta o asignar una puntuación de relevancia en una escala ordenada.
- Grounding en capturas de pantalla e interfaces: localizar un elemento con una caja y su confianza sobre screenshots, gráficos o terminales, útil para agentes de automatización de UI (con la cautela de que la precisión de cajas es la métrica más degradada por la cuantización).
- Análisis de vídeo de pantalla: decidir en qué momento de un vídeo ocurre un evento o si aparece un elemento concreto, sin transcripción ni generación de texto.

## Benchmarks y rendimiento

Acuerdo con el modelo en precisión completa (BF16). Cada pregunta se responde con el bundle y con el modelo BF16; "decisiones" cuenta la misma opción superior (o el mismo lado de 0,5 en sí/no) y KL se mide sobre las probabilidades de cada pregunta. Ninguna de estas preguntas se usó para calibración.

| Conjunto de test | Preguntas | Decisiones coincidentes | KL medio ↓ | Exactitud vs. gold, BF16 → bundle |
|---|---|---|---|---|
| Decision Index 0.3 public suite (466 preguntas de 41 benchmarks) | 466 | 91,63 % | 0,0592 | 76,4 → 74,5 % |
| LocalLLaMA/typed-decisions test (gold blando) | 800 | 93,12 % | 0,0262 | 73,0 → 76,1 % |
| Decisiones held-out sobre textos, imágenes y vídeos propios | 487 | 93,22 % | 0,0285 | — |
| 2.000 peticiones de tasksource/tasksource-jev-typed-decisions test | 2.000 | 92,65 % | 0,0466 | 83,5 → 82,5 % |

Comparativa interna de los tres bundles publicados por el autor:

| Bundle | Tamaño | Decisiones (tsj, 2.000) | Decisiones (suite) | KL medio (suite) |
|---|---|---|---|---|
| d3-turbo-JANG_6M | 23,6 GB | 99,25 % | 98,07 % | 0,0006 |
| d3-turbo-JANG_4M | 19,3 GB | 97,65 % | 97,42 % | 0,0052 |
| d3-turbo-JANGH2 | 14,5 GB | 92,65 % | 91,63 % | 0,0592 |

Preguntas de tipo Box: sobre 29 preguntas held-out en código, gráficos, documentos, capturas, terminales y una factura (objetivos pequeños que el propio modelo en precisión completa responde con baja confianza), las cajas se desplazan ante cualquier perturbación, por lo que el acuerdo se mide contra ese suelo: la caja de este bundle solapa con la del BF16 con un IoU medio de 0,40 (el bundle JANG_6M, casi sin pérdida en decisiones, alcanza 0,52). No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval) en la información disponible, y no serían representativos al no ser un modelo generativo.

## Requisitos de hardware

- VRAM/memoria estimada: 14,5 GB de pesos en disco; con caché KV, torre de visión y overhead del runtime, se recomienda al menos 20-24 GB de memoria unificada. 32 GB o más deja margen para estados largos, imágenes y vídeo.
- Plataforma: exclusivamente Apple Silicon (formato MLX). No hay pesos para CUDA en este repositorio.
- GPU recomendadas: chips Apple M-series con 24 GB o más de memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). En configuraciones de 16 GB el modelo no cabe con holgura.
- Cabe en GPU de consumo: sí, en el sentido de equipos Apple Silicon de gama alta; no en GPUs NVIDIA de consumo, porque el formato JANGH2 no es compatible con CUDA.
- Opciones de despliegue: runtime Osaurus 0.25.26 o superior (requisito explícito del autor). Para servir el modelo base en servidores con GPU, el camino es vllm-sr/d3-turbo en BF16 con vLLM, no este bundle.
- llama.cpp, Ollama y TGI no están soportados para este bundle: el codebook odd-cubic y la rotación Hadamard-32 son específicos de JANG y requieren el runtime de Osaurus.
- Latencia y throughput: no disponibles. Por diseño, cada pregunta se resuelve en un único forward pass sin decodificación autoregresiva, lo que sitúa el coste muy por debajo de un modelo generativo del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/d3-turbo-JANGH2 | 26,09B origen (10,18B según safetensors); 4,45 bits/peso | No disponible | MLX safetensors, 14,5 GB | Apache-2.0 | HuggingFace, requiere runtime Osaurus |
| OsaurusAI/d3-turbo-JANG_4M | 26,09B origen | No disponible | MLX safetensors, 19,3 GB | Apache-2.0 (presumible, misma familia) | HuggingFace; 97,65 % de decisiones en tsj |
| OsaurusAI/d3-turbo-JANG_6M | 26,09B origen | No disponible | MLX safetensors, 23,6 GB | Apache-2.0 (presumible, misma familia) | HuggingFace; 99,25 % de decisiones en tsj |
| vllm-sr/d3-turbo (BF16) | 26,09B | No disponible | safetensors BF16, 52,2 GB | Apache-2.0 | HuggingFace; servible con vLLM |
| Qwen/Qwen3.8-27B | No disponible en la información | No disponible | — | No disponible en la información | Modelo base de la cadena |

Dentro de la misma categoría (modelos de decisión para enrutamiento), la elección entre los tres bundles es un compromiso entre memoria y fidelidad: JANG_6M cuesta 9,1 GB más que JANGH2 y reduce el KL medio de 0,0592 a 0,0006. Frente a un clasificador BERT o un cross-encoder, d3-turbo ofrece 255 opciones en una sola pasada y entrada multimodal; no se dispone de comparativas publicadas con esos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, tool calls ni razonamiento encadenado. Solo emite probabilidades por opción; cualquier uso conversacional es un error de planteamiento.
- Degradación medible frente a BF16: 92,65 % de decisiones coincidentes en el split de 2.000 peticiones y KL medio de 0,0592 en la suite pública, con caída de exactitud de 76,4 a 74,5 % en esa suite. No es un bundle "casi sin pérdida"; para eso está JANG_6M.
- Localización de cajas especialmente frágil: IoU medio de 0,40 frente al BF16 en objetivos pequeños, con el propio modelo de referencia respondiendo con baja confianza. No recomendable para grounding de precisión.
- Discrepancia de recuento de parámetros: los metadatos de safetensors declaran 10.178.366.704 parámetros mientras la model card habla de 26,09B en el origen. Conviene verificar el inventario real antes de dimensionar infraestructura.
- Dependencia dura de un runtime propietario (Osaurus 0.25.26+): sin soporte en llama.cpp, Ollama, TGI ni vLLM, el bundle queda atado a Apple Silicon y a la hoja de ruta del autor.
- Longitud de contexto no documentada: no se puede planificar el tamaño de estados largos (trazas, documentos, vídeo) sin medición propia.
- Cobertura lingüística declarada como "inglés y multilingüe" sin desglose; el rendimiento fuera del inglés no está verificado.
- Sesgos: no documentados por el autor. Al calibrarse sobre peticiones reales de enrutamiento, el modelo puede heredar la distribución y los sesgos de ese tráfico.
- Riesgo de alucinación bajo en formato (no genera texto libre), pero las probabilidades pueden estar mal calibradas fuera de la distribución de calibración; requiere validación con datos propios y ajuste de umbrales.
- Licencia Apache-2.0 permisiva para uso comercial, con obligación de conservar LICENSE y NOTICE del modelo base; verificar las condiciones de Qwen/Qwen3.8-27B en la cadena.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de las cifras de acuerdo declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/d3-turbo-JANGH2
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Runtime Osaurus: https://osaurus.ai
- Modelo sobre el que se construye la cadena: https://huggingface.co/Qwen/Qwen3.8-27B

No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs, repositorios o demos) asociados a este modelo; los resultados devueltos no guardan relación con él.
