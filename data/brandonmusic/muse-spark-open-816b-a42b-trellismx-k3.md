# brandonmusic/Muse-Spark-Open-816B-A42B-TrellisMX-K3

## Resumen

Muse-Spark-Open-816B-A42B-TrellisMX-K3 es una versión cuantizada a 3 bits del modelo Muse Spark Open 816B-A42B de Meta Superintelligence Labs, publicada por el usuario brandonmusic en HuggingFace. El modelo base es un Mixture-of-Experts disperso de 816.000 millones de parámetros totales con 42.000 millones activos por token, ventana de contexto de 1 millón de tokens y capacidad multimodal nativa (entrada de texto, imagen, vídeo y audio; salida de texto). Está orientado a programación y trabajo agéntico de largo horizonte, y es el modelo del que se destiló Muse Glimmer 30B.

La aportación de esta ficha no es un modelo nuevo, sino un artefacto de compresión: pesos en formato TrellisMX de 3 bits con elementos mxfp8 sobre safetensors, con un repositorio de 679,4 GB. El autor incluye un drafter para decodificación especulativa y un servidor con API compatible con OpenAI en el puerto 8010, bajo el nombre de modelo `muse-spark-trellismx-k3`.

Su relevancia actual es práctica: permite evaluar un MoE de 816B en hardware de 4 GPU de workstation (el autor reporta mediciones en cuatro RTX PRO 6000 Blackwell), con una pérdida de fidelidad medida frente a la referencia BF16: divergencia KL de 0,0330 nats y 94,62 % de acuerdo top-1 en ventanas de 2.048 tokens, y 0,0203 nats con 96,01 % en ventanas de 8.192 tokens. El acceso está restringido (gated) y la licencia es la Muse Model License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos dispersa (sparse MoE) y codificadores multimodales; pesos cuantizados con esquema TrellisMX |
| Parametros totales | 816B en el modelo base; el índice safetensors de este repo declara 23.594.934.784 (unos 23,6B), dato que no cuadra con el tamaño del base (ver limitaciones) |
| Parametros activos | 42B por token |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 3 bits con TrellisMX (trellis-quantization), elementos mxfp8; existe una variante FP4 del mismo autor |
| Idiomas soportados | no disponibles |
| Licencia | muse-model-license (etiquetada como `license:other`); acceso restringido, requiere aceptar condiciones |
| Formato de pesos | safetensors (repo de 679,4 GB) |
| Modalidades | Entrada: texto, imagen, vídeo y audio. Salida: texto |
| Pipeline declarado | image-text-to-text |
| Servidor incluido | API compatible con OpenAI en el puerto 8010, modelo `muse-spark-trellismx-k3`, entradas de imagen, vídeo y audio vía `/v1/chat/completions` |
| Fecha de publicación | Creado el 2026-10-16, actualizado el 2026-10-18 |
| Metricas de comunidad | 8 descargas, 4 likes |

## Arquitectura y entrenamiento

El modelo base, Muse Spark Open 816B-A42B, es un transformer con mezcla de expertos dispersa: 816B de parámetros totales de los que solo 42B se activan por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamaño. Incorpora codificadores multimodales nativos que aceptan texto, imagen, vídeo y audio, y mantiene una ventana de contexto de 1M tokens. Meta lo describe como un modelo de razonamiento orientado a programación agéntica de largo horizonte, e indica que la versión de pesos abiertos incorpora post-entrenamiento adicional de seguridad. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni detalles del pipeline de RLHF/DPO en la información proporcionada.

Sobre esa base, esta publicación aplica una cuantización post-entrenamiento de 3 bits con el esquema TrellisMX, que combina una estructura de cuantización en retícula (trellis) con elementos de tipo mxfp8. El autor cuantifica la fidelidad de la versión comprimida comparándola con las logits BF16 del profesor, publicadas en el dataset `brandonmusic/Muse-Spark-Open-816B-A42B-BF16-Teacher-Logits`, sobre el conjunto de evaluación v2 (32 ventanas de 8.192 tokens, equivalente a 128 ventanas de 2.048 tokens, con revision `0bd19bd6`). La distribución se compara sobre el vocabulario completo en fp64, con estimador `full_vocabulary_fp64` y dirección reference→candidate. El paquete incluye además un modelo drafter para decodificación especulativa, lo que explica las cifras de throughput reportadas.

## Capacidades

- Generación de texto y razonamiento: el base se describe explícitamente como modelo de razonamiento; esta versión conserva la distribución de salida con 96,01 % de acuerdo top-1 en ventanas de 8.192 tokens.
- Programación y trabajo agéntico de largo horizonte: el modelo base está diseñado para tareas de codificación sostenidas y flujos agénticos, con contexto de 1M tokens.
- Comprensión multimodal de entrada: procesa imagen, vídeo y audio junto con texto a través de `/v1/chat/completions`.
- Ventana de contexto extensa: 1M tokens, con 1.040.217 tokens de caché KV medidos en la configuración de referencia del autor.
- Decodificación especulativa: incluye drafter, con 63,7 tok/s por petición y 357,6 tok/s agregados a 16 peticiones en la configuración medida.
- Integración por API compatible con OpenAI: permite sustituir un endpoint existente sin cambiar el cliente.
- Tool calling / function calling: no documentado explícitamente en la información disponible, aunque el base está orientado a uso agéntico.
- Capacidades multilingües: no disponibles; no se declara la lista de idiomas.
- Modo thinking o salidas de audio/imagen: no disponibles; la salida declarada es únicamente texto.

## Casos de uso

- Refactorización de repositorios completos: con 1M tokens de contexto se puede cargar un árbol de código amplio y ejecutar cambios coherentes entre múltiples ficheros, algo inviable con ventanas de 32K-128K sin troceado agresivo.
- Revisión y auditoría de código en CI/CD: el servidor compatible con OpenAI permite integrar el modelo como paso de revisión en pipelines existentes sin adaptadores propietarios.
- Agentes de largo horizonte: tareas de varias decenas de pasos (investigación, ejecución de comandos, corrección de errores) se benefician del contexto de 1M tokens y de los 42B activos, que mantienen el coste por token contenido.
- Análisis de vídeo y audio para documentación técnica: al aceptar vídeo y audio en la API, se pueden generar resúmenes, transcripciones anotadas o documentación a partir de grabaciones de sesiones y demos.
- Asistentes sobre base documental extensa: ingesta de manuales, normativa o expedientes completos en una sola ventana, con recuperación menos dependiente de un pipeline RAG.
- Despliegue on-premise en hardware de workstation: el autor reporta funcionamiento en 4× RTX PRO 6000 Blackwell con 63,7 tok/s en una petición, adecuado para equipos internos con requisitos de soberanía de datos.
- Investigación sobre cuantización de bajo régimen de bits: la comparación KL frente a BF16 con vocabulario completo permite estudiar el impacto de 3 bits en la distribución de salida sin entrenar nada.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (todos con `verified: false`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Metrica | Ventanas de 2.048 tokens | Ventanas de 8.192 tokens |
|---|---|---|
| Divergencia KL media token a token (reference ‖ candidate), texto, nats | 0,032985 | 0,020333 |
| Acuerdo top-1 con la referencia, texto | 0,94619 (94,62 %) | 0,96005 (96,01 %) |

| Metrica de inferencia (4× RTX PRO 6000 Blackwell, con drafter) | Valor |
|---|---|
| Tokens KV en caché | 1.040.217 |
| Decodificación, 1 petición | 63,7 tok/s |
| Decodificación, 16 peticiones (agregado) | 357,6 tok/s |
| Decodificación a contexto de 16K, 1 petición | 61,1 tok/s |
| Decodificación a contexto de 16K, 16 peticiones (agregado) | 356,0 tok/s |

## Requisitos de hardware

- VRAM estimada solo para pesos: a 3 bits, 816.000 millones de parámetros equivalen a unos 306 GB teóricos; hay que añadir overhead de metadatos de cuantización, activaciones y caché KV. El repositorio ocupa 679,4 GB, por encima de esa estimación, lo que sugiere que incluye artefactos adicionales además de los pesos cuantizados.
- GPU recomendadas: la única configuración medida y reportada por el autor es 4× NVIDIA RTX PRO 6000 Blackwell. No hay datos publicados para A100, H100 u otras.
- GPU de consumo: no cabe en una GPU de consumo individual (RTX 4090, 24 GB). No se dispone de datos de despliegue en configuraciones con offload a CPU o disco.
- Caché KV: 1.040.217 tokens cacheados en la configuración medida; el coste de KV para 1M tokens de contexto no se detalla en la información disponible.
- Opciones de despliegue: servidor propio incluido en el repositorio con API compatible con OpenAI en el puerto 8010. Existe receta de vLLM para el modelo base `meta-models/Muse-Spark-Open-816B-A42B`, pero no se confirma compatibilidad de vLLM, llama.cpp, Ollama o TGI con el formato TrellisMX de 3 bits.
- Latencia y throughput: 63,7 tok/s por petición y 357,6 tok/s agregados a 16 peticiones; la degradación al pasar a 16K de contexto es mínima (61,1 y 356,0 tok/s), lo que indica que el cuello de botella está en el cómputo y no en la caché KV.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Spark-Open-816B-A42B-TrellisMX-K3 (esta ficha) | 816B / 42B | 1M | safetensors 3-bit TrellisMX, 679,4 GB | muse-model-license, gated | HuggingFace, 8 descargas |
| meta-models/Muse-Spark-Open-816B-A42B (base) | 816B / 42B | 1M | safetensors (BF16 como referencia de evaluación) | Muse Model License | HuggingFace, modelo oficial de Meta |
| Variante FP4 del mismo autor (Muse Spark Open 816B A42B TrellisMX K3 FP4) | 816B / 42B | 1M | cuantización FP4, tamaño no disponible | no disponible | Referenciada en agregadores, no verificada |
| Muse Glimmer 30B (destilado del base) | ~30B (activos no disponibles) | no disponible | no disponible | no disponible | Mencionado en la documentación del base |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de la fidelidad KL frente a la referencia BF16.

## Limitaciones y advertencias

- Pérdida de fidelidad cuantificada: 5,38 % de desacuerdo top-1 en ventanas de 2.048 tokens y 3,99 % en ventanas de 8.192; la divergencia KL (0,0330 y 0,0203 nats) implica un cambio real en la distribución de probabilidad, no una copia exacta del modelo.
- Métricas no verificadas: todos los resultados del model-index tienen `verified: false` y proceden del propio autor; no hay evaluación independiente ni benchmarks estándar (MMLU, HumanEval, GSM8K) publicados.
- Discrepancia de parámetros: el índice safetensors declara 23.594.934.784 parámetros, frente a los 816B del modelo base. Es necesario verificar el contenido real del repositorio antes de planificar recursos.
- Licencia restrictiva y acceso gated: la Muse Model License no es una licencia de código abierto estándar; hay que aceptar condiciones en HuggingFace y revisar los términos de uso comercial antes de desplegar en producción.
- Idiomas no documentados: no se puede asumir calidad en castellano ni en otros idiomas distintos del inglés sin evaluación propia.
- Salida limitada a texto: pese a aceptar imagen, vídeo y audio, no genera contenido multimedia.
- Madurez baja: 8 descargas y 4 likes desde el 16 de octubre de 2026; sin evidencia de validación por terceros.
- Riesgo de alucinación: no cuantificado en la información disponible; en un modelo de razonamiento con contexto de 1M tokens, la ausencia de benchmarks de fidelidad factual es un caveat relevante.
- Requisitos de hardware elevados: no cabe en GPU de consumo; la única configuración validada son 4× RTX PRO 6000 Blackwell, lo que limita su uso a entornos con presupuesto de cómputo alto.
- Compatibilidad de herramientas incierta: el formato TrellisMX de 3 bits no está confirmado en vLLM, llama.cpp, Ollama ni TGI; el despliegue depende del servidor incluido en el repo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brandonmusic/Muse-Spark-Open-816B-A42B-TrellisMX-K3
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Dataset de logits del profesor BF16: https://huggingface.co/datasets/brandonmusic/Muse-Spark-Open-816B-A42B-BF16-Teacher-Logits
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/meta-models/Muse-Spark-Open-816B-A42B
- Artículo de MarkTechPost sobre el lanzamiento: https://www.marktechpost.com/2026/10/15/meta-muse-spark-open-816b-open-weight-model/
- Ficha en free2aitools: https://free2aitools.com/model/brandonmusic/muse-spark-open-816b-a42b-trellismx-k3-fp4
