# mradermacher/Qwen3.5-2B-MoE-A1.3B-abliterated-i1-GGUF

## Resumen

`mradermacher/Qwen3.5-2B-MoE-A1.3B-abliterated-i1-GGUF` es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo `luvette/Qwen3.5-2B-MoE-A1.3B-abliterated`. No se trata de un modelo entrenado desde cero por mradermacher, sino de una conversión y cuantización en formato GGUF (con cuantizaciones ponderadas y basadas en imatrix) del checkpoint original, pensada para su uso con llama.cpp y derivados.

El nombre sugiere una arquitectura Mixture of Experts con aproximadamente 2 000 millones de parámetros totales y unos 1 300 millones de parámetros activos por token, y el sufijo "abliterated" indica que el checkpoint de origen ha sido modificado para eliminar (ablacionar) la dirección de rechazo en el espacio de activaciones, un procedimiento habitual en la comunidad para reducir las negativas del modelo ante peticiones que considerarían rechazables.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no incluye model card descriptiva, no declara licencia ni idiomas, no tiene descargas ni likes en el momento de la consulta y el tamaño del repositorio aparece como 0.0 GB. Además, el dato de parámetros reportado en los metadatos de Hugging Face (7 454 274) es incompatible con el nombre del modelo y con el tamaño del repositorio, por lo que no puede tomarse como especificación fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), según el nombre del modelo; detalles no disponibles |
| Parametros totales | ~2B según el nombre del modelo; el metadato de Hugging Face reporta 7 454 274, dato inconsistente y no fiable |
| Parametros activos | ~1.3B según el nombre del modelo |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones ponderadas y con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de lo que indica el nombre del modelo: una mezcla de expertos con aproximadamente 2B parámetros totales y 1.3B activos. No se especifican el número de expertos, el mecanismo de enrutamiento, la dimensión oculta, el número de capas ni el tipo de atención. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo fases de RLHF, DPO u otros ajustes de alineamiento.

El proceso aplicado por mradermacher es de conversión a GGUF y cuantización con pesos ponderados e imatrix, a partir del checkpoint `luvette/Qwen3.5-2B-MoE-A1.3B-abliterated`. La parte "abliterated" procede del modelo de origen y no está documentada en este repositorio: no se describe la metodología de ablación, el conjunto de direcciones eliminadas ni el impacto medido sobre capacidades y seguridad. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje, aunque no hay evaluación publicada en este repositorio.
- Razonamiento y matemáticas: no disponible; no se han publicado resultados ni descripciones.
- Generación de código: no disponible; no se documenta soporte específico.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Efecto de la ablación: se espera una reducción de las respuestas de rechazo respecto al modelo base, pero no se cuantifica ni se documenta en el repositorio.

## Casos de uso

- Inferencia local en equipos con recursos limitados: al tratarse de un MoE de ~2B totales y ~1.3B activos, las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutarlo en CPU o en GPU de gama media mediante llama.cpp, con un coste por token inferior al de un modelo denso del mismo tamaño total.
- Prototipado rápido de aplicaciones de chat: las cuantizaciones ligeras (Q2_K, IQ3_M) permiten desplegar un endpoint de prueba en un portátil sin GPU dedicada, útil para validar flujos de conversación antes de invertir en infraestructura.
- Investigación sobre alineamiento y ablación: el checkpoint ablacionado sirve para estudiar cómo varía la tasa de rechazo y la calidad de respuesta al eliminar la dirección de rechazo, comparándolo con el modelo base.
- Evaluación de cuantizaciones: el repositorio ofrece más de veinte variantes (Q2 a Q6, IQ1 a IQ4), lo que permite medir la degradación de perplejidad y calidad entre niveles de compresión sobre un mismo modelo.
- Experimentos educativos de arquitecturas MoE: útil para ilustrar el enrutamiento disperso y el coste de activación en entornos docentes, siempre que se acepte la falta de documentación.
- Integración en pipelines con llama.cpp u Ollama: el formato GGUF es directamente consumible por estas herramientas, lo que facilita su inclusión en scripts de generación por lotes o en servidores locales de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño nominal de ~2B parámetros, no verificada contra los pesos reales): Q4_K_M en torno a 1.2-1.5 GB; Q5_K_M en torno a 1.5-1.8 GB; Q6_K en torno a 1.8-2.2 GB; Q8 no incluido en el repositorio. Las cuantizaciones IQ1/IQ2 quedarían por debajo de 1 GB, con degradación esperable.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060) debería bastar para las cuantizaciones Q4-Q6; para mayor throughput, RTX 4090 o A100/H100, aunque el modelo es demasiado pequeño para aprovecharlas.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más, y en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). No se garantiza compatibilidad con vLLM o TGI, que requieren otros formatos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-2B-MoE-A1.3B-abliterated, GGUF) | ~2B totales / ~1.3B activos (según nombre) | no disponible | no disponible | GGUF | Cuantizaciones de comunidad, sin model card ni benchmarks |
| Modelo base `luvette/Qwen3.5-2B-MoE-A1.3B-abliterated` | ~2B / ~1.3B activos (según nombre) | no disponible | no disponible | safetensors (presumible) | Checkpoint de origen, sin documentación en este repositorio |
| Alternativas de ~2B densos (p. ej. Qwen2.5-1.5B, Gemma-2-2B) | ~1.5-2B | 32K-128K según modelo | Apache 2.0 / Gemma license | safetensors, GGUF | Modelos ampliamente documentados y con benchmarks públicos; comparación no verificada contra este repositorio |

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción de arquitectura, datos de entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no puede asumirse uso comercial permitido; es necesario contactar con el autor o consultar el modelo de origen antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce la cobertura multilingüe real.
- Metadatos inconsistentes: el número de parámetros reportado (7 454 274) no concuerda con el nombre del modelo ni con el tamaño del repositorio (0.0 GB), lo que impide verificar que los pesos estén completos o correctamente subidos.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- Modelo ablacionado: la eliminación de la dirección de rechazo puede aumentar la probabilidad de respuestas dañinas, inexactas o inapropiadas; no se documenta el método ni sus efectos colaterales sobre la calidad.
- Riesgo de alucinación: no evaluado; en modelos pequeños y con cuantizaciones agresivas (IQ1, IQ2) la degradación de factualidad es habitual.
- Cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS): esperables pérdidas notables de calidad; no se han publicado mediciones de perplejidad.
- Fecha de creación futura (2026-11-26) en los metadatos: indica posible error de registro o naturaleza sintética del repositorio; conviene verificar la procedencia antes de confiar en él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-2B-MoE-A1.3B-abliterated-i1-GGUF
- Modelo de origen: https://huggingface.co/luvette/Qwen3.5-2B-MoE-A1.3B-abliterated
- Perfil del autor: https://huggingface.co/mradermacher
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
