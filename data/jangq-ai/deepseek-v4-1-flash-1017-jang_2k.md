# JANGQ-AI/DeepSeek-V4.1-Flash-1017-JANG_2K

## Resumen

DeepSeek-V4.1-Flash-1017-JANG_2K es una versión cuantizada del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek AI, preparada por JANGQ-AI para ejecutarse en hardware Apple Silicon mediante la librería MLX. El modelo original es un LLM multimodal (texto e imagen) de arquitectura mixture-of-experts, y esta variante aplica un esquema de cuantización mixta propietario llamado JANG_2K, que reduce los expertos enrutados a una media de 2,47 bits mientras mantiene la atención y otros componentes críticos a 8 bits, con el objetivo de que un modelo de más de 550.000 millones de parámetros quepa en memoria unificada de Mac de gama alta.

La relevancia de esta ficha radica en que permite ejecutar en un solo Mac (256 GB de memoria unificada, probado sobre un M5 Ultra) un modelo frontier con ventana de contexto de más de un millón de tokens, capacidades de visión, razonamiento y uso de herramientas, algo tradicionalmente reservado a clústeres de GPU. El bundle incluye además las tablas Engram del release original, un borrador especulativo de tres etapas llamado dSpark para acelerar la decodificación, y la torre de visión, todo empaquetado para el runtime vMLX. La licencia MIT heredada del modelo base lo hace apto para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (40 capas, 384 expertos enrutados top-6 + experto compartido, hiper-conexiones, atención dispersa comprimida con indexador compartido, embeddings n-gram Engram en capas 1 y 14) |
| Parametros totales | 552.366.103.664 (~552 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (con YaRN) |
| Tipos de cuantizacion | JANG_2K mixed affine (grupo 64): expertos enrutados a 2-3 bits (media 2,47 bits), atención, experto compartido, embeddings y LM head a 8 bits, normas y router en F32; tablas Engram en FP8 original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), repo de 423,6 GB |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer disperso de 40 capas con 384 expertos enrutados de los que se activan 6 por token, más un experto compartido. Incorpora hiper-conexiones, un mecanismo de atención dispersa comprimida con un indexador compartido, y embeddings n-gram Engram en las capas 1 y 14, cuyas tablas (~203 GB en FP8) se leen desde SSD por filas sin cargarlas en RAM. La torre de visión (ViT + aligner) está incluida en el bundle, lo que habilita la entrada de imágenes.

En cuanto a la cuantización, el perfil JANG_2K asigna un bit extra al `down_proj` de los expertos enrutados (3 bits, ya que su salida entra directamente en el flujo residual) y 2 bits al `gate_proj`/`up_proj` de las capas 8-39, dejando los primeros 8 niveles a 3 bits. Todo el camino no enrutado (atención, experto compartido, indexador, embeddings, LM head) se mantiene a 8 bits. Los expertos se recuantizaron desde el checkpoint FP4 original mediante una búsqueda de clipping con matriz de importancia (ponderada por activación al cuadrado, 11 ratios de clip por grupo), calibrada con 694.517 tokens de texto técnico y de seguridad. Los pesos MTP del modelo original se sustituyen por el borrador especulativo dSpark de 3 etapas (expertos a 4 bits, 8,9 GB). No se dispone de datos sobre el entrenamiento del modelo base (tokens, dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generacion de texto general y razonamiento, con modo de pensamiento (thinking) activable o desactivable.
- Comprension de imagenes (pipeline image-text-to-text) mediante la torre ViT incluida en el bundle.
- Uso de herramientas (tool calling), segun los tags del modelo.
- Ventana de contexto extrema de 1.048.576 tokens, con recuperacion verificada de hechos en prompts de ~845k y ~925k tokens.
- Decodificacion especulativa mediante dSpark (3 etapas), con salida equivalente a greedy salvo empates cercanos.
- Ejecucion local en Apple Silicon via vMLX (Python y Swift/Osaurus), sin necesidad de GPU NVIDIA.
- Recuperacion de lineas numeradas en contextos de ~460k tokens con precision alta (probabilidad top-1 de 0,90-0,99 en las pruebas del autor).

## Casos de uso

- Analisis de corpus documentales masivos: con 1M de tokens de contexto, puede ingerir bases de codigo, expedientes legales o colecciones de informes completas en un solo prompt y responder preguntas sobre su contenido.
- Auditoria de seguridad y revision tecnica: la calibracion de la cuantizacion se realizo con texto tecnico y de seguridad, y el autor documenta pruebas de recuperacion sobre listas de miles de lineas, util para escaneo de logs y configuraciones.
- Asistentes multimodales locales: la torre de vision permite construir aplicaciones que describen, analizan o responden sobre imagenes sin enviar datos a la nube, relevante para sectores con requisitos de privacidad.
- Generacion de codigo en estaciones Mac Pro: el bundle se diseno para vMLX/Osaurus, ofreciendo 68-119 tok/s con dSpark en tareas de codigo sobre un M5 Ultra, suficiente para autocompletado y refactorizacion interactiva.
- Procesamiento por lotes de documentos largos (RAG de contexto nativo): la atencion dispersa comprimida y el contexto de 1M de tokens permiten sustituir pipelines de chunking por ingesta directa de documentos completos.
- Servidores de inferencia autoalojados en entornos sin GPU NVIDIA: la licencia MIT y el despliegue via `vmlx serve` o la app Osaurus facilitan montar un endpoint OpenAI-compatible en hardware Apple de 256 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos son mediciones del propio autor sobre este bundle:

| Medicion | Resultado |
|---|---|
| Perplejidad (teacher-forced, 6.766 tokens held-out) | 9,318 (NLL/token 2,2319) |
| Perplejidad, affine sin calibracion (referencia) | 9,234 |
| Perplejidad, imatrix con dominio held-out excluido | 9,356 |
| Decodificacion con dSpark, codigo / code2 / estructurado / prosa (Python, M5 Ultra) | 84 / 68 / 119 / 44 tok/s |
| Decodificacion con dSpark (Swift/Osaurus) | 68 / 55 / 104 / 42 tok/s |
| Decodificacion simple sin dSpark, 2k contexto | 39-44 tok/s (34 tok/s a 100k) |
| Decodificacion simple sin dSpark (Swift) | 43-45 tok/s |
| Fidelidad de logits (prompt-suffix pruning, 8k/32k) | cos 0,99996 / 0,99994, 24/24 tokens greedy identicos |
| Fidelidad de kernels de decodificacion fusionados | 256/256 tokens greedy identicos |
| Recuperacion de hecho distintivo a ~460k / ~845k tokens | correcta (prob. top-1 0,99) |
| Recuperacion en 46.200 / 92.600 lineas numeradas | correcta (0,90 / 0,99) |
| Variante dificil (IDs similares + segundo numero) | correcta hasta 300k; fallos a 461k y 924k |

## Requisitos de hardware

- Memoria unificada: se requiere un Mac con 256 GB; la huella de servido es de ~207 GB (~197 GB de backbone residente + tablas Engram leidas desde SSD).
- Probado sobre Apple M5 Ultra de 256 GB; no hay datos de funcionamiento en Macs de 128 GB ni en GPU NVIDIA.
- Espacio en disco: 423,6 GB para el repositorio completo (backbone de 45 shards, tablas Engram en FP8 y borrador dSpark).
- Despliegue: runtime vMLX, tanto via `vmlx serve` (Python) como mediante la app Osaurus (Swift); el modelo no es ejecutable con llama.cpp, Ollama, vLLM o TGI al ser un formato MLX/JANG.
- Rendimiento: 84/68/119/44 tok/s con dSpark en Python (codigo/code2/estructurado/prosa) sobre M5 Ultra; 39-44 tok/s sin decodificacion especulativa a contexto corto, cayendo a ~34 tok/s a 100k tokens.
- La lectura de tablas Engram desde SSD por filas implica que el rendimiento puede depender de la velocidad del almacenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Ejecucion |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-JANG_2K | ~552 B (MoE) | 1.048.576 | MIT | Apple Silicon (MLX), 256 GB |
| DeepSeek-V4.1-Flash-1017 (original) | ~552 B (MoE) | 1.048.576 | MIT | no ejecutable en Apple Silicon segun el autor (FP4/FP8) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

No hay datos suficientes en la informacion proporcionada para comparar con otros modelos cuantizados de 500B+ en detalle; la referencia directa es el checkpoint original de DeepSeek, respecto al cual este bundle no reporta agreement top-1 ni KL al no poder ejecutarse el original en el mismo hardware.

## Limitaciones y advertencias

- Requisito de hardware muy estricto: solo es viable en Macs con 256 GB de memoria unificada y ~424 GB de disco; no es desplegable en la mayoria de entornos de inferencia convencionales.
- Fallo documentado de recuperacion en la variante dificil (lineas casi identicas con IDs similares) a partir de ~461k tokens; el autor lo atribuye a limites de la atencion dispersa del modelo original, no de la cuantizacion.
- No se reportan metricas de fidelidad (top-1 agreement, KL) contra el checkpoint FP4/FP8 original, por lo que la perdida exacta por cuantizacion a 2,47 bits de media en expertos no esta cuantificada frente a referencias estandar.
- Sin benchmarks publicos estandar para esta build; la calidad solo esta caracterizada por perplejidad en 6.766 tokens held-out, una muestra muy pequena.
- Riesgo de alucinacion inherente a LLM de gran tamano; no se documentan evaluaciones de veracidad para esta variante.
- Idiomas soportados no especificados en la model card.
- La dependencia de vMLX y Osaurus (ecosistema propietario del autor) limita la portabilidad del formato de pesos.
- Uso comercial permitido por la licencia MIT, sin restricciones conocidas documentadas.

## Enlaces

- Modelo: https://huggingface.co/JANGQ-AI/DeepSeek-V4.1-Flash-1017-JANG_2K
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Runtime vMLX: https://vmlx.net
