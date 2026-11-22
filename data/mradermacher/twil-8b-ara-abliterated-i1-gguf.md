# mradermacher/TwIL-8B-ARA-Abliterated-i1-GGUF

## Resumen
TwIL-8B-ARA-Abliterated-i1-GGUF es la versión cuantizada en formato GGUF del modelo Austriani/TwIL-8B-ARA-Abliterated, un modelo de lenguaje de 8.791.592.960 parámetros construido sobre la familia Granite 4.2 (IBM) y distribuido por el cuantizador mradermacher. El modelo base ha sido sometido a un proceso de "abliteration" mediante técnicas de "arbitrary-rank ablation" (ARA) y herramientas como Heretic, orientado a eliminar los mecanismos de rechazo y el comportamiento censurado típico de los modelos alineados. El resultado es un modelo descensurado, etiquetado explícitamente como NSFW y "not-for-all-audiences", que conserva las capacidades de razonamiento, matemáticas y código del modelo original.

Esta variante i1-GGUF ofrece cuantizaciones ponderadas con imatrix, lo que permite ejecutar el modelo en hardware de consumo con pérdidas de calidad controladas. El repositorio ocupa 101,4 GB e incluye desde cuantizaciones IQ1 de 2,2 GB hasta Q6_K de 7,3 GB, cubriendo un espectro amplio de compromisos entre tamaño, velocidad y fidelidad. La licencia es "webai-non-commercial-license-ver-1.0", lo que restringe el uso comercial.

La relevancia de esta ficha radica en que documenta un caso de modelo "abliterated" de la familia Granite, un fenómeno creciente en la comunidad open source para investigar alineación, refusal y comportamiento de modelos, así como para aplicaciones que requieren contenido sin filtros. No obstante, la ausencia de benchmarks publicados y de especificaciones detalladas en la model card obliga a tratar muchos datos como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Granite 4.2, según tags del modelo); detalles no disponibles |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix/weighted): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; también disponibles cuantizaciones estáticas en repo separado |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | webai-non-commercial-license-ver-1.0 (no comercial) |
| Formato de pesos | GGUF (transformers como librería declarada) |

## Arquitectura y entrenamiento
El modelo base Austriani/TwIL-8B-ARA-Abliterated se construye sobre la arquitectura Granite 4.2 de IBM, según los tags "granite" y "granite-4.2". Se trata de un transformer de 8.791.592.960 parámetros. La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable es el proceso de "abliteration" mediante "arbitrary-rank ablation" (ARA) y Heretic, que elimina selectivamente las direcciones de activación asociadas al rechazo, dando como resultado un modelo "uncensored" y "refusal-removed".

Esta variante i1-GGUF ha sido generada por mradermacher mediante cuantización ponderada con imatrix (archivo imatrix.gguf de 0,1 GB incluido), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. No se dispone de información sobre la decodificación especulativa, atención lineal u otras optimizaciones del modelo base.

## Capacidades
- Generación de texto conversacional e instrucciones (tags: instruction-following, conversational).
- Razonamiento (tag: reasoning).
- Matemáticas (tag: math).
- Generación de código (tag: code).
- Modelo descensurado: sin mecanismos de rechazo (tags: abliterated, uncensored, refusal-removed), lo que permite generar contenido que otros modelos alineados rechazarían.
- Contenido NSFW y para adultos (tags: nsfw, not-for-all-audiences).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (en).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso
- Investigación sobre alineación y refusal: el modelo permite estudiar cómo la ablación de direcciones de activación afecta al comportamiento de rechazo, comparando respuestas con el modelo Granite original y con la variante abliterated. Es adecuado por su naturaleza "refusal-removed" y su base Granite documentada.
- Generación de narrativa y contenido creativo para adultos: con cuantizaciones Q4_K_M (5,4 GB) o Q5_K_M (6,4 GB) puede ejecutarse en GPU de consumo y generar texto sin filtros para proyectos editoriales o de ficción que requieran contenido explícito.
- Asistencia de código sin restricciones en entornos controlados: el tag "code" sugiere capacidad de generación de código; puede usarse en pipelines internos de desarrollo donde se requiera un asistente local sin censura, aunque sin garantías de tool calling.
- Razonamiento y matemáticas en local: con cuantización Q6_K (7,3 GB) se aproxima a la calidad del modelo original y puede emplearse para resolución de problemas matemáticos en notebooks con GPU de 8-12 GB.
- Experimentación con cuantizaciones extremas: las variantes IQ1_S (2,2 GB) e IQ2 (2,6-3,3 GB) permiten estudiar la degradación de calidad en modelos de 8B bajo cuantización agresiva, útil para investigación sobre eficiencia de inferencia.
- Despliegue en hardware limitado: la cuantización Q4_K_S (5,2 GB) o IQ4_XS (4,9 GB) cabe en GPUs de 6-8 GB de VRAM, permitiendo ejecutar un modelo de 8,8B en portátiles con GPU modesta para tareas de generación de texto general.
- Evaluación comparativa de técnicas de abliteration: investigadores pueden comparar esta variante ARA con otras técnicas (p. ej., abliteration estándar) sobre la misma base Granite 4.2 para medir el impacto en capacidades y en tasas de rechazo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia (según cuantización, aproximada por tamaño de archivo más overhead de contexto):
  - IQ1_S (2,2 GB): ~3 GB VRAM.
  - IQ2_M (3,3 GB): ~4 GB VRAM.
  - IQ3_M (4,2 GB): ~5 GB VRAM.
  - Q4_K_M (5,4 GB): ~6,5 GB VRAM.
  - Q5_K_M (6,4 GB): ~7,5 GB VRAM.
  - Q6_K (7,3 GB): ~8,5 GB VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100 para las cuantizaciones más altas o para mayor contexto.
- Cabe en GPU de consumo: sí, desde cuantizaciones IQ1 (GPUs de 4 GB) hasta Q6_K (GPUs de 8-12 GB). Las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor para velocidad y calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para la versión no cuantizada, transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TwIL-8B-ARA-Abliterated-i1-GGUF (este) | 8,79B | no disponible | webai-non-commercial-ver-1.0 | GGUF (i1) | Abliterated, uncensored, NSFW; sin benchmarks |
| TwIL-8B-ARA-Abliterated (base) | 8,79B | no disponible | webai-non-commercial-ver-1.0 | safetensors (transformers) | Modelo original sin cuantizar; sin benchmarks |
| TwIL-8B-ARA-Abliterated-GGUF (estático) | 8,79B | no disponible | webai-non-commercial-ver-1.0 | GGUF (estático) | Cuantizaciones sin imatrix; menor calidad en bajas precisiones |
| Granite 4.2 (familia IBM) | no disponible | no disponible | no disponible | no disponible | Base del modelo; alineado y con rechazo; datos no verificados en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- Modelo explícitamente descensurado: la eliminación de rechazo puede producir contenido ofensivo, ilegal o dañino; no apto para aplicaciones públicas sin moderación externa.
- Etiquetado "not-for-all-audiences" y "nsfw": no debe desplegarse en entornos accesibles a menores ni en productos de consumo general.
- Licencia no comercial (webai-non-commercial-license-ver-1.0): restringe el uso comercial; es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en producción.
- Solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea degradado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que las capacidades de razonamiento, matemáticas o código se conserven tras la abliteration; la ablación puede degradar el rendimiento.
- Riesgo de alucinación: inherente a los modelos de 8B; sin datos específicos de evaluación.
- Las cuantizaciones IQ1 e IQ2 conllevan pérdida de calidad significativa; el propio autor las describe como "for the desperate" o "mostly desperate".
- Longitud de contexto no disponible: no se puede garantizar el soporte de ventanas largas.
- El repositorio ocupa 101,4 GB; la descarga completa no es práctica para la mayoría de usuarios, que deberán seleccionar cuantizaciones individuales.

## Enlaces
- Hugging Face (este modelo): https://huggingface.co/mradermacher/TwIL-8B-ARA-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/Austriani/TwIL-8B-ARA-Abliterated
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/TwIL-8B-ARA-Abliterated-GGUF
- Página de descarga del cuantizador: https://hf.tst.eu/model#TwIL-8B-ARA-Abliterated-i1-GGUF
- Licencia: https://huggingface.co/webAI-Official/TwIL-8B/blob/main/LICENSE.md
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
