# mradermacher/Policy-Qwen3-14B_GPT-OSS-120B-GGUF

## Resumen

Policy-Qwen3-14B_GPT-OSS-120B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo wonderful9462/Policy-Qwen3-14B_GPT-OSS-120B, publicadas por el usuario mradermacher. Se trata, por tanto, de un artefacto de distribución más que de un modelo entrenado desde cero: el trabajo original corresponde a wonderful9462, mientras que esta ficha cubre la conversión a GGUF que permite ejecutar el modelo en llama.cpp, Ollama y otros runners compatibles. El modelo base parte de Qwen3-14B, un transformer denso de 14.768.307.200 parámetros, y el sufijo "GPT-OSS-120B" sugiere un proceso de destilación o mezcla a partir de un modelo mayor, aunque la model card no documenta el procedimiento.

La relevancia de esta publicación es práctica: ofrece once variantes de cuantización entre Q2_K (5,9 GB) y Q8_0 (15,8 GB), lo que permite desplegar un modelo de casi 15.000 millones de parámetros en hardware de consumo. El repositorio ocupa 102 GB en total, pero cada archivo individual es manejable y descargable por separado. La licencia no está declarada en la información disponible, lo que constituye un riesgo para uso comercial.

El modelo está etiquetado únicamente para inglés y orientado a uso conversacional. No se han publicado detalles sobre el dataset de entrenamiento, el contexto máximo ni los resultados de benchmarks en la información proporcionada, por lo que la ficha se limita a documentar lo verificable: arquitectura derivada de Qwen3, tamaño de parámetros, cuantizaciones disponibles y compatibilidad con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 14.768 millones de parámetros, heredero de la familia Qwen3. Al no tratarse de una arquitectura MoE, todos los parámetros se activan en cada token generado. El nombre del modelo base (Policy-Qwen3-14B_GPT-OSS-120B) indica que wonderful9462 partió de Qwen3-14B y aplicó algún tipo de ajuste o destilación con referencia a GPT-OSS-120B, pero la model card no documenta ni el dataset, ni el número de tokens, ni si hubo RLHF, DPO o SFT. Tampoco se especifica la longitud de contexto nativa ni si se preservan las capacidades de razonamiento extendido de Qwen3.

La contribución de mradermacher se limita a la cuantización: conversión de safetensors a GGUF con el tipo de conversión "hf" y cuantizaciones estáticas (sin imatrix ni ponderación por importancia, según indica el propio autor). No se han generado variantes ponderadas por imatrix en el momento de la publicación, y el autor señala que no tiene previsto hacerlo salvo petición en la discusión comunitaria. Las cuantizaciones Q4_K_S y Q4_K_M están marcadas como "fast, recommended", y Q6_K como "very good quality".

## Capacidades

- Generación de texto conversacional en inglés, con soporte multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse a través de infraestructuras de inferencia estándar.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- Capacidades heredadas de Qwen3-14B (razonamiento, código, matemáticas) presumiblemente presentes, aunque no verificadas ni documentadas en esta publicación.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (9,1 GB) el modelo cabe en GPUs de consumo con 12 GB o más de VRAM, permitiendo asistentes conversacionales privados sin conexión a la nube.
- Prototipado de agentes conversacionales: la etiqueta "conversational" y el soporte de endpoints permiten montar un servidor compatible con OpenAI y probar flujos multi-turno antes de escalar a modelos mayores.
- Evaluación de modelos destilados: investigadores que quieran comparar el comportamiento de una destilación de Qwen3-14B frente al original pueden usar las distintas cuantizaciones para medir la degradación por cuantización (de Q2_K a Q8_0).
- Inferencia en CPU: las variantes Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten ejecutar el modelo en servidores sin GPU, útil para pruebas de integración o entornos de CI.
- Educación y experimentación: el rango completo de cuantizaciones permite estudiar el impacto de la precisión numérica en la calidad de salida con un mismo modelo base.
- Sustitución de API en entornos air-gapped: al ser GGUF y ejecutable con llama.cpp, puede desplegarse en redes aisladas donde no se permite tráfico hacia servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y el autor de las cuantizaciones no aporta evaluaciones de calidad más allá de las notas cualitativas sobre los tipos de cuantización.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB (más overhead de contexto y KV cache).
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080/4070 Ti (16 GB) para Q4_K_M y Q5_K_M; RTX 3060 12 GB para Q4_K_S con contexto moderado.
- Cabe en GPU de consumo: sí, desde GPUs de 8 GB con Q2_K/Q3_K_S (contexto reducido) hasta 24 GB para las variantes de mayor calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runner compatible con GGUF; para el modelo base en safetensors, vLLM o TGI (no aplicable directamente a estos archivos GGUF).
- Latencia y throughput: no disponibles; dependen del hardware, del tamaño de contexto y del backend. Como referencia cualitativa, Q4_K_M está marcado como "fast" por el autor, pero no se aportan tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Policy-Qwen3-14B_GPT-OSS-120B (esta ficha) | 14,77 B | no disponible | no disponible | GGUF | Destilación/ajuste de Qwen3-14B; solo inglés |
| Qwen3-14B (original) | 14,77 B | no disponible en esta ficha | Apache 2.0 (según familia Qwen3) | safetensors, GGUF | Modelo upstream; multilingüe |
| Llama 3.1 8B | 8,03 B | 128K | Llama 3.1 Community License | safetensors, GGUF | Menor tamaño, contexto documentado |
| Mistral Nemo 12B | 12,2 B | 128K | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar |

La comparación con Qwen3-14B original es la más relevante: esta publicación es una derivación cuantizada, por lo que hereda sus limitaciones y añade la del idioma (solo inglés) y la ausencia de licencia declarada. Frente a Llama 3.1 8B y Mistral Nemo 12B, el modelo aquí descrito ofrece más parámetros pero carece de documentación pública sobre contexto y rendimiento, lo que dificulta una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor del modelo base (wonderful9462) antes de usarlo en producción.
- Solo inglés: la etiqueta de idioma restringe el uso a textos en inglés; el rendimiento en castellano no está garantizado ni documentado.
- Sin benchmarks: no hay evidencia publicada de calidad, razonamiento o código, por lo que las capacidades heredadas de Qwen3-14B son una suposición razonable pero no verificada.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; la ausencia de evaluaciones agrava la incertidumbre.
- Procedencia opaca: el proceso de creación del modelo base (destilación desde GPT-OSS-120B, ajuste fino, mezcla) no está documentado, lo que impide evaluar sesgos introducidos.
- Cuantizaciones estáticas sin imatrix: el autor indica que no hay variantes ponderadas por importancia, lo que puede penalizar la calidad en las cuantizaciones bajas (Q2_K, Q3_K_S).
- Contexto desconocido: no se especifica la ventana máxima; usar contextos largos sin verificar puede degradar la calidad o provocar errores.
- Repositorio de 102 GB: la descarga completa es costosa; conviene bajar solo la cuantización necesaria.
- Fecha de creación futura (2026-02-12): metadato anómalo que conviene verificar antes de confiar en la trazabilidad del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Policy-Qwen3-14B_GPT-OSS-120B-GGUF
- Modelo base: https://huggingface.co/wonderful9462/Policy-Qwen3-14B_GPT-OSS-120B
- Página de descargas del autor: https://hf.tst.eu/model#Policy-Qwen3-14B_GPT-OSS-120B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
