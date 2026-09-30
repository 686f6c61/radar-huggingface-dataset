# brianbellx/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-copy

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una derivada no oficial de Qwen3.8-27B, publicada por el usuario brianbellx como copia del repositorio original de HauhauCS. Se distribuye exclusivamente en formato GGUF e incorpora dos elementos diferenciales: un perfil de "descensura" agresivo (el autor afirma 0 rechazos en 465 peticiones de prueba) y un sidecar de aceleración denominado HauhauCS FastMTP, orientado a decodificación especulativa sobre la cabeza MTP/NextN nativa del modelo base.

Técnicamente es un modelo denso de 27B nominales con arquitectura híbrida: 64 capas, de las cuales 48 son Gated DeltaNet y 16 son capas de atención con gating. Mantiene un contexto nativo de 262.144 tokens, extensible hasta 1.000.000 según la model card, y conserva las capacidades multimodales (imagen y vídeo) del base mediante un proyector de visión BF16 separado de 931 MB.

Su relevancia actual es doble: por un lado, ofrece una vía de despliegue local en GPU de consumo gracias a cuantizaciones desde IQ2_M (10,32 GB) hasta Q8_K_P (31,46 GB); por otro, incorpora una capa de optimización de velocidad que el autor cuantifica en hasta 3,02x de generación en tareas de documento respecto a la variante sin MTP. Conviene señalar que el repositorio no publica benchmarks de calidad ni datos de entrenamiento, y que los metadatos safetensors del propio repo declaran 1.863.907.840 parámetros, una cifra incompatible con la denominación "27B" y sin explicación en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal híbrido: 64 capas, 48 capas Gated DeltaNet + 16 capas de atención con gating; codificador de visión y cabeza MTP/NextN embebida |
| Parametros totales | 27B nominales según la model card; los metadatos safetensors del repo indican 1.863.907.840 parámetros (discrepancia no aclarada por el autor) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 según la model card |
| Tipos de cuantizacion | GGUF K_P: Q8_K_P, Q6_K_P, Q5_K_P, Q4_K_P, Q3_K_P, Q2_K_P. GGUF estándar: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M. GGUF IQ: IQ4_XS, IQ3_M, IQ3_XS, IQ2_M |
| Idiomas soportados | Inglés, chino y multilingüe (sin listado completo ni cobertura declarada por idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (texto, proyector de visión y sidecar FastMTP). No se publican safetensors en este repo |
| Tamano de capa oculta | 5.120 |
| Tamano de FFN | 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Tamano del repo | 172,5 GB |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de secuencia en un mismo stack de 64 capas: 48 capas Gated DeltaNet (familia de modelos de estado recurrente con compuertas, orientada a coste lineal en la longitud de secuencia) y 16 capas de atención con gating. Esta hibridación es la que permite sostener ventanas de 262.144 tokens nativos con un coste de memoria de caché inferior al de un transformer de atención completa equivalente. El modelo conserva la cabeza Multi-Token Prediction (MTP/NextN) embebida en los tensores de texto, que actúa como mecanismo de decodificación especulativa nativo, y añade el perfil FastMTP-32K de HauhauCS como sidecar de 903 MB. El componente visual se sirve aparte, mediante un proyector BF16 de 931 MB, y es necesario descargarlo únicamente si se quiere entrada de imagen o vídeo.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por etapas de RLHF, DPO u otro alineamiento. La model card indica explícitamente que "no hay cambios en datasets ni en capacidades previstas": el trabajo del autor se limita al perfil de descensura (variante Aggressive, con respuestas directas y mínimo preámbulo en prompts difíciles) y a la capa de aceleración. Las cuantizaciones K_P ("Perfect") son un perfil de cuantización propio del autor que aplica análisis específico por modelo para preservar calidad en las capas más sensibles, con un coste declarado de entre un 5% y un 15% más de tamaño que la cuantización base equivalente.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, con soporte multilingüe adicional sin cobertura detallada.
- Razonamiento multi-paso y flujos agénticos heredados de Qwen3.8-27B, según declara el autor.
- Entrada multimodal de imagen y vídeo mediante el proyector BF16 (pipeline `image-text-to-text`).
- Conversación multi-turno con ventana nativa de 262.144 tokens.
- Decodificación especulativa mediante MTP/NextN nativo más el perfil FastMTP-32K en runtimes compatibles.
- Perfil de respuesta sin rechazos: el autor reporta 0 rechazos en 465 peticiones de prueba.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el autor menciona capacidades agénticas preservadas.
- Modo "thinking" o razonamiento extendido: no se especifica en la información disponible.

## Casos de uso

- Procesado de documentos largos en local: con 262.144 tokens de contexto nativo, permite cargar contratos, informes técnicos o expedientes completos sin troceado agresivo, y el sidecar FastMTP está optimizado específicamente para este régimen de generación de documento.
- Asistencia sobre expedientes con imágenes intercaladas: el proyector de visión permite procesar facturas, capturas o diagramas junto al texto en una misma conversación, útil en flujos de extracción de datos semiestructurados.
- Investigación sobre alineamiento y robustez: al publicarse como modelo sin comportamientos de rechazo, sirve como objeto de estudio para medir deriva de seguridad frente al base con licencia apache-2.0.
- Generación de texto creativo sin filtros editoriales: narrativa, guiones o material de ficción donde los rechazos del modelo alineado interrumpen el flujo de trabajo.
- Desarrollo y prueba de pipelines de decodificación especulativa: el repositorio incluye material para validar MTP/FastMTP en llama.cpp, LM Studio o runtimes GGUF compatibles, útil para equipos que trabajan en optimización de inferencia.
- Análisis de corpus en chino e inglés: el soporte bilingüe declarado cubre casos de resumen, clasificación y extracción sobre documentación técnica en ambos idiomas.
- Despliegue en estación de trabajo de gama alta: con cuantizaciones IQ2_M o Q2_K_P de ~10 GB cabe en GPU de 12 GB, lo que habilita prototipado local sin dependencia de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos aportados por el autor son métricas relativas de velocidad de generación (TG, tokens generados por segundo) frente a variantes sin MTP, que no son comparables con benchmarks de calidad:

| Comparativa de velocidad declarada por el autor | Multiplicador |
|---|---|
| TG en tareas de documento, FastMTP vs sin MTP | hasta 3,02x |
| TG en tareas de razonamiento, FastMTP vs sin MTP | hasta 1,93x |
| TG en documento, FastMTP vs MTP embebido estándar | hasta +35,2% |
| TG en razonamiento, FastMTP vs MTP embebido estándar | hasta +21,1% |

Estas cifras provienen de la model card del autor, sin metodología de medición publicada, sin hardware especificado y sin verificación independiente. El repositorio de este listado concreto (brianbellx) registra 0 descargas y 0 me gusta en el momento de redactar la ficha.

## Requisitos de hardware

Los tamaños que se indican a continuación son los ficheros publicados; la VRAM necesaria es como mínimo el tamaño del GGUF más el espacio para la caché KV, el proyector de visión y los buffers del runtime, cantidades que no se especifican en la información disponible.

| Cuantizacion | BPW | Tamano |
|---|---:|---:|
| Q8_K_P | 9,21 | 31,46 GB |
| Q6_K_P | 7,59 | 25,92 GB |
| Q5_K_P | 5,92 | 20,22 GB |
| Q4_K_P | 5,25 | 17,92 GB |
| IQ4_XS | 4,60 | 15,71 GB |
| Q3_K_P | 3,93 | 13,44 GB |
| IQ3_M | 3,74 | 12,79 GB |
| IQ3_XS | 3,56 | 12,18 GB |
| Q2_K_P | 3,12 | 10,68 GB |
| IQ2_M | 3,02 | 10,32 GB |
| Proyector de visión BF16 | — | 931 MB |
| Sidecar FastMTP-32K | — | 903 MB |

- GPU de consumo de 12 GB (RTX 3060 12 GB, RTX 4070): viables IQ2_M y Q2_K_P a contexto reducido; el resto requerirá offload parcial a CPU, con la consiguiente caída de velocidad.
- GPU de consumo de 16-24 GB (RTX 4080, RTX 4090, RX 7900 XTX): viables IQ4_XS, Q4_K_P y, con contexto moderado, Q5_K_P.
- GPU profesional (A100 40 GB, A100 80 GB, H100): Q8_K_P completo con margen para contexto largo.
- Configuraciones multi-GPU: necesarias para Q6_K_P y Q8_K_P a contexto completo o para aprovechar la extensión hasta 1.000.000 de tokens.
- Runtimes compatibles según la documentación: llama.cpp, LM Studio y GGUF-compatibles en general. El repositorio de terceros Wassimyounes01/qwen38-uncensored documenta además flux con Ollama y una ruta MLX para Apple Silicon (con una mejora declarada del 30-50% en ese hardware). Soporte en vLLM o TGI con MTP: no disponible.
- Latencia y throughput en valores absolutos: no disponibles. Solo existen los multiplicadores relativos de la tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Perfil | Disponibilidad |
|---|---|---|---|---|---|---|
| brianbellx/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-copy (este) | 27B nominales declarados (metadatos safetensors: 1,86B) | 262.144 nativo / 1.000.000 extensible | apache-2.0 | GGUF + proyector + sidecar MTP | Descensurado agresivo, MTP acelerado | 0 descargas, 0 me gusta |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF (original) | 27B nominales | 262.144 nativo | apache-2.0 | GGUF + proyector + sidecar MTP | Descensurado agresivo, MTP acelerado | Repositorio de referencia del que deriva este |
| LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-MTP-GGUF | No disponible | No disponible | No disponible | GGUF | Descensurado alternativo con MTP | Activo |
| Qwen/Qwen3.8-27B (base) | 27B nominales | 262.144 nativo | apache-2.0 | No disponible en la información recogida | Alineado con rechazos estándar | Modelo oficial de referencia |
| Qwen3.8-27B TURBO (fine-tune reseñado en HackerNoon) | 27B nominales | No disponible | No disponible | GGUF | Descensurado con reducción de tokens de pensamiento | Terceros |

No hay datos de rendimiento comparado (benchmarks) para ninguna de estas variantes en la información disponible, por lo que la comparativa se limita a parámetros, contexto, licencia, formato y perfil de comportamiento.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: la variante Aggressive elimina deliberadamente los rechazos, lo que implica que puede generar contenido dañino, ilegal o inseguro sin fricción. No es apta para productos de cara al público sin capas de moderación externas.
- El propio autor desaconseja su uso en trabajo agéntico de contexto largo crítico para la fiabilidad, y recomienda una variante Balanced si está disponible.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la tasa de error en razonamiento, matemáticas o código, ni compararla con el modelo base.
- Discrepancia de parámetros: los metadatos safetensors del repositorio declaran 1.863.907.840 parámetros frente a los 27B nominales de la model card. Esta inconsistencia no está explicada y debe verificarse antes de cualquier uso en producción.
- Procedencia: el repositorio es una copia ("‑copy") del trabajo original de HauhauCS, con 0 descargas y 0 me gusta. Para uso real conviene acudir al repositorio original del autor, que es la fuente mantenida.
- Idiomas: solo se declaran inglés, chino y multilingüe genérico, sin métricas de cobertura. El rendimiento en castellano no está documentado.
- Cuantizaciones bajas: IQ2_M, Q2_K_P y en menor medida las IQ3 introducen degradación de calidad perceptible. Las cuantizaciones K_P pueden mostrarse como "?" en la columna de cuantización de LM Studio, aunque cargan con normalidad.
- Dependencia de componentes externos: la entrada de imagen y vídeo requiere descargar y configurar el proyector BF16 por separado; la aceleración FastMTP requiere el sidecar de 903 MB y un runtime que soporte el perfil de 32K.
- Licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial, pero no se aporta verificación de que los términos del modelo base Qwen/Qwen3.8-27B se cumplan para esta redistribución derivada. Conviene revisar la licencia del modelo base antes de explotación comercial.
- Cifras de velocidad y de rechazos: todas las métricas aportadas (3,02x, 1,93x, 35,2%, 21,1%, 0/465) proceden exclusivamente del autor, sin metodología ni hardware especificados ni replicación independiente.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/brianbellx/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-copy
- Repositorio original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante Genesis de LuffyTheFox: https://huggingface.co/LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-MTP-GGUF
- Repositorio GitHub con instrucciones para Ollama y MLX: https://github.com/Wassimyounes01/qwen38-uncensored
- Guía de requisitos de hardware y configuración en LM Studio: https://localairig.com/models/qwen3-8-27b-uncensored-hardware-deployment-guide/
- Reseña de Qwen3.8-27B TURBO en HackerNoon: https://hackernoon.com/qwen38-27b-turbo-review-a-faster-thinking-uncensored-qwen-fine-tune
- Servidor de Discord del autor: https://discord.gg/SZ5vacTXYf
