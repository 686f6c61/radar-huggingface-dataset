# mradermacher/Kataguru-Polyglot-264E-35B-A3B-GGUF

## Resumen

Kataguru-Polyglot-264E-35B-A3B es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por kataguru, distribuido bajo licencia Apache 2.0. El repositorio analizado aquí es una recopilación de cuantizaciones GGUF estáticas producidas por mradermacher a partir del modelo original en formato safetensors. El modelo cuenta con 36.537.721.984 parámetros totales (aproximadamente 36,5 mil millones) y activa alrededor de 3 mil millones por token, según indica la nomenclatura A3B. La etiqueta qwen3_5_moe en la model card sugiere que se apoya en la familia arquitectónica Qwen 3.5 MoE, aunque el autor no detalla la configuración exacta de expertos, capas ni atención.

El modelo está orientado explícitamente a un perfil políglota poco habitual: inglés, finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés y turco. Esta selección incluye varias lenguas aglutinantes y de bajos recursos, lo que lo hace relevante para traducción, RAG cross-lingual y aplicaciones multilingües en nichos donde la mayoría de modelos abiertos rinden de forma deficiente. Además, las etiquetas declaran capacidades de código, tool calling, agentes, matemáticas, razonamiento, visión y contenido sin censura, aunque la model card no aporta detalles técnicos que respalden cada una de estas afirmaciones.

La relevancia actual del modelo radica en su combinación de tamaño contenido (36,5B totales con activación dispersa), licencia permisiva y cobertura lingüística específica. Al estar disponible en GGUF, puede ejecutarse en hardware de consumo con cuantizaciones agresivas, lo que lo convierte en una opción atractiva para desarrolladores que necesitan inferencia local multilingüe sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer; etiqueta qwen3_5_moe en la model card |
| Parametros totales | 36.537.721.984 (36,5B) |
| Parametros activos | aproximadamente 3B por token (según nomenclatura A3B; no confirmado en detalle por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en safetensors/bf16 |

## Arquitectura y entrenamiento

La arquitectura es Mixture-of-Experts con 36,5B parámetros totales y aproximadamente 3B activos por token. La etiqueta qwen3_5_moe indica que el modelo se construye sobre la familia Qwen 3.5 MoE, si bien el autor no publica el número de expertos, el número de capas, la dimensión oculta ni el mecanismo de enrutamiento. Tampoco se detalla el esquema de atención (si es full attention, sliding window o atención lineal) ni si incorpora decodificación especulativa u otras optimizaciones de inferencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la proporción de datos por idioma ni si se aplicaron fases de RLHF, DPO o instruction tuning. La model card tampoco especifica la estrategia de alineación ni el tratamiento del contenido etiquetado como uncensored. El repositorio analizado es una conversión a GGUF mediante cuantización estática; no aporta detalles adicionales sobre el entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en once idiomas declarados.
- Traducción y RAG cross-lingual, con foco en lenguas aglutinantes y de bajos recursos (finés, estonio, húngaro, euskera, georgiano, galés, islandés).
- Generación de código y asistencia a la programación según las etiquetas del autor.
- Tool calling y function calling, con soporte declarado para flujos agénticos.
- Razonamiento multi-paso y uso en pipelines de agentes.
- Capacidades STEM, matemáticas y razonamiento declaradas en las etiquetas.
- Modalidad multimodal (visión) indicada por la etiqueta multimodal y los ficheros mmproj del repositorio GGUF.
- Modo sin censura (uncensored) según la model card.
- No se especifica si dispone de modo thinking explícito, soporte de audio ni límites concretos de contexto.

## Casos de uso

- Traducción automática en lenguas de bajos recursos: el modelo cubre finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés y turco, idiomas con poca representación en modelos abiertos, lo que permite construir traductores locales sin depender de APIs comerciales.
- RAG cross-lingual para administraciones públicas: indexación de documentación en lenguas cooficiales o minoritarias (por ejemplo, euskera o galés) y consulta en inglés, aprovechando la orientación políglota del modelo.
- Asistentes de código en entornos con restricciones de idioma: generación y revisión de código con explicaciones en la lengua del desarrollador, útil en equipos de países nórdicos o bálticos.
- Agentes con tool calling en producción: integración en pipelines que requieran function calling para consultar APIs, bases de datos o servicios internos, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones.
- Atención al cliente multilingüe: despliegue local en GGUF con llama.cpp u Ollama para gestionar conversaciones multi-turno con datos que no pueden salir de la infraestructura de la organización.
- Procesamiento de documentos con componente visual: uso de los ficheros mmproj para tareas de extracción de información de imágenes o PDFs escaneados, combinando visión y texto en un mismo modelo.
- Investigación lingüística comparada: análisis de fenómenos morfológicos en lenguas aglutinantes (finés, estonio, húngaro, turco) aprovechando que el modelo ha sido entrenado explícitamente en ellas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas multilingües, y tampoco se aportan comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (según los tamaños de fichero publicados): Q2_K requiere aproximadamente 13,7 GB; Q4_K_S aproximadamente 21,1 GB. Las cuantizaciones superiores (Q5, Q6, Q8, f16) no publican tamaño en la tabla del autor, pero por proporción se sitúan por encima de los 25 GB y pueden superar los 70 GB en f16.
- GPU recomendadas: para Q4_K_S, una RTX 4090 (24 GB) o RTX 3090 permiten cargar el modelo completo en VRAM. Para Q2_K, una RTX 4080 (16 GB) o RTX 4060 Ti (16 GB) son suficientes. Para Q8_0 o f16 se recomienda A100 80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K y Q4_K_S con GPUs de 16-24 GB. Las cuantizaciones Q5 y superiores requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI si la arquitectura qwen3_5_moe está soportada por dichos frameworks (no confirmado en la información disponible).
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 3B parámetros activos, se espera un throughput notablemente superior al de un modelo denso de 36,5B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Idiomas destacados |
|---|---|---|---|---|---|---|
| Kataguru-Polyglot-264E-35B-A3B | 36,5B | ~3B | no disponible | Apache 2.0 | GGUF, safetensors | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr |
| Qwen3 MoE (referencia de familia) | variable (30B-A3B en su variante pequeña) | ~3B | no disponible en esta ficha | Apache 2.0 en variantes abiertas | safetensors, GGUF | multilingüe amplio, sin foco específico en lenguas ugrofinesas o celtas |
| Mixtral 8x7B | 46,7B | ~12,9B | 32k | Apache 2.0 | safetensors, GGUF | principalmente en, fr, de, es, it |
| Llama 3.1 8B | 8B | denso | 128k | Llama 3.1 Community License | safetensors, GGUF | multilingüe amplio |

La comparativa se limita a características estructurales, ya que no hay benchmarks publicados para el modelo analizado. Frente a Mixtral 8x7B, Kataguru activa muchos menos parámetros por token (aproximadamente 3B frente a 12,9B), lo que debería traducirse en menor latencia y menor huella de memoria en inferencia, a costa de una cobertura idiomática distinta y sin datos de calidad comparables. Frente a Llama 3.1 8B, el modelo de Kataguru ofrece una cobertura específica de lenguas minoritarias que el modelo de Meta no declara.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no es posible verificar las capacidades declaradas (código, matemáticas, razonamiento, tool calling, visión) con datos objetivos.
- La model card no detalla la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- La etiqueta uncensored implica que el modelo puede generar contenido sin los filtros habituales; es responsabilidad del integrador añadir moderación si el caso de uso lo requiere.
- Riesgo de alucinación no cuantificado; al no haber evaluación publicada, no se puede estimar su tasa en tareas factuales.
- La cobertura idiomática está limitada a once lenguas; el rendimiento fuera de ellas (por ejemplo, castellano, francés o alemán) no está documentado y podría ser deficiente.
- Aunque la licencia es Apache 2.0, conviene verificar que los pesos del modelo base no arrastren restricciones adicionales derivadas de sus datos de entrenamiento.
- El repositorio contiene únicamente cuantizaciones estáticas; el autor indica que no hay cuantizaciones ponderadas o con imatrix disponibles en el momento de la publicación.
- El tamaño del repositorio (75 GB) implica que la descarga completa incluye todas las cuantizaciones; conviene descargar solo el fichero GGUF y el mmproj necesarios.
- No se especifica si la arquitectura qwen3_5_moe está soportada por vLLM o TGI en el momento de la publicación, lo que puede limitar el despliegue en servidores de alto rendimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kataguru-Polyglot-264E-35B-A3B-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B
- Página de descargas del autor: https://hf.tst.eu/model#Kataguru-Polyglot-264E-35B-A3B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
