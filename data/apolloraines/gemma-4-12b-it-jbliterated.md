# ApolloRaines/Gemma-4-12B-it-Jbliterated

## Resumen

Gemma-4-12B-it-Jbliterated es una variante del modelo instructivo Gemma 4 de 12B parámetros publicada por ApolloRaines, en la que se ha eliminado el comportamiento de rechazo mediante una edición directa de pesos (weight surgery) sin reentrenamiento por gradiente. El modelo base declarado es `google/gemma-4-12b-it-qat-q4_0-unquantized`, la versión sin cuantizar del checkpoint oficial de Google entrenado con quantisation-aware training. El autor denomina a la técnica "jbliteration", presentándola como una versión más selectiva de la abliteración clásica, que busca eliminar la dirección de rechazo sin degradar el resto de capacidades.

El modelo conserva la arquitectura, el tokenizador y el conocimiento del modelo base de Google, con 11.959.730.224 parámetros totales en formato safetensors y un tamaño de repositorio de 86,2 GB que incluye pesos bf16, cuantizaciones GGUF y matrices de importancia. La motivación declarada es el trabajo de seguridad defensiva: el autor argumenta que un modelo que rechaza analizar código hostil no puede auditar código hostil, y cita el incidente de Hugging Face de julio de 2026 como caso de uso real de modelos con rechazo reducido en respuesta a incidentes.

Es relevante ahora porque ejemplifica una tendencia creciente de variantes "uncensored" derivadas de modelos abiertos de gran tamaño, y porque el autor publica métricas propias de retención de capacidad (MMLU sin cambios respecto al base según su arnés de evaluación). No obstante, estas cifras proceden exclusivamente del autor y no han sido verificadas de forma independiente. La versión v2 corrige un problema residual de clasificación de seguridad dentro del canal de razonamiento que el autor documenta en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4 Unified, según tags del repo) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | bf16 (pesos originales), GGUF BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (K-quants con imatrix); base entrenado con QAT q4_0 |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es una edición de pesos sobre `google/gemma-4-12b-it-qat-q4_0-unquantized`, un checkpoint instructivo de la familia Gemma 4 con quantisation-aware training. La model card no detalla la arquitectura interna más allá de la etiqueta `gemma4_unified` del repositorio; no se especifican número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto nativa. Tampoco se documentan los datos de entrenamiento del modelo base (número de tokens, composición del corpus, fases de RLHF o DPO), que corresponden a Google y no al autor de esta variante.

La modificación consiste en una intervención directa sobre los pesos en bfloat16, sin gradient training ni system prompt, orientada a suprimir la dirección de rechazo aprendida. El autor la describe como una versión "de precisión" de la abliteración estándar, con el objetivo de no arrastrar capacidades colaterales. No se publican detalles del algoritmo (capas intervenidas, rangos, vectores calculados, hiperparámetros), por lo que la reproducibilidad de la técnica no es verificable con la información disponible. La model card menciona además que la v1 conserva el hábito de clasificar seguridad dentro del canal de pensamiento en prompts con razonamiento habilitado, y que la v2 añade un pase ligero de SFT sobre trazas auto-reparadas para reducirlo aproximadamente a la mitad.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Razonamiento con canal de pensamiento (thinking), con la salvedad documentada de que la v1 puede entrar en bucles de clasificación de seguridad en ese canal.
- Respuesta directa a prompts que el modelo base rechazaría, según la métrica del autor (~89% de tasa de respuesta directa frente a ~1% del base en un conjunto reservado).
- Análisis de código potencialmente hostil, exploits y artefactos de intrusión, que es el caso de uso declarado.
- Tool calling / function calling: no documentado explícitamente en la información proporcionada; al derivar de un modelo instructivo de la familia Gemma 4 es plausible, pero no se confirma.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Multilingüismo: limitado a inglés según la metadata del repositorio.
- Visión, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Respuesta a incidentes de seguridad: el modelo puede procesar artefactos de ataque (logs, binarios, scripts) sin rechazar el contenido, lo que permite reconstruir cadenas de intrusión a partir de los propios artefactos del atacante, escenario que el autor cita como motivación principal.
- Análisis de malware en laboratorio aislado: lectura y explicación de código malicioso para ingeniería inversa defensiva, con el modelo desplegado en infraestructura propia y sin exposición a datos de producción.
- Red teaming y evaluación de guardrails: generación de prompts adversarios y estudio de cómo los filtros de seguridad de otros sistemas clasifican contenido, usando este modelo como generador de referencia sin restricciones.
- Investigación sobre alineación y rechazo: comparación directa con el modelo base de Google para estudiar qué comportamientos cambian tras la edición de pesos y cuantificar la separación entre capacidad y disposición al rechazo.
- Auditoría de código de terceros: revisión de dependencias o binarios sospechosos donde el analista necesita que el modelo describa con precisión qué hace el código sin negarse a comentarlo.
- Formación y concienciación en seguridad: construcción de entornos de práctica donde los alumnos analizan muestras reales de malware con asistencia de un modelo local autoalojado.
- Procesamiento por streaming en hardware limitado: gracias a las cuantizaciones GGUF incluidas (Q4_K_M de 6,9 GB) y a la herramienta DeepswapLLM del autor, puede ejecutarse en GPUs con menos VRAM que la necesaria para bf16 completo.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del arnés de evaluación del propio autor. No se han verificado de forma independiente y no deben tratarse como comparables con resultados de terceros.

| Metrica | Base (Gemma-4-12B-it QAT) | Este modelo |
|---|---|---|
| MMLU (570 ítems, accuracy) | 78,42% | 78,42% |
| Cambio en MMLU vs. base | -- | 0,00 pts |
| Tasa de respuesta directa (prompts reservados) | ~1% | ~89% |

El autor cita además, como evidencia de la técnica en otro modelo (Sharona, Qwen3.5-27B), un MMLU de 77,89% frente a 76,84% del baseline tras seis fases de edición y cuantización GPTQ W4A16. Ese dato no corresponde a este modelo y no es extrapolable. No hay resultados publicados de HumanEval, GSM8K, MMLU-Pro, benchmarks de seguridad ni evaluaciones de terceros para esta variante.

## Requisitos de hardware

- VRAM para bf16 completo: aproximadamente 24 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 40-48 GB (A100 40GB, A6000, L40S) para contexto amplio.
- GGUF Q8_0 (11,8 GB): viable en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16GB, A4000) con contexto moderado.
- GGUF Q6_K (9,1 GB) y Q5_K_M (8,0 GB): adecuados para GPUs de 12 GB (RTX 3060 12GB, RTX 4070) con contexto ajustado.
- GGUF Q4_K_M (6,9 GB, recomendado por el autor para tarjetas de 8-12 GB): cabe en RTX 3070, RTX 4060 Ti 8GB y similares, con cuantización de caché KV si se necesita contexto largo.
- Despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI para safetensors en bf16 si se dispone de hardware suficiente. La arquitectura Gemma 4 Unified requiere versiones recientes de los runners, según advierte el autor.
- DeepswapLLM (herramienta del autor): streaming de capas entre GPU, RAM y disco para ejecutar el modelo a precisión completa en GPUs pequeñas; el autor afirma hasta 4x más rápido que AirLLM, sin datos de latencia ni throughput publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Gemma-4-12B-it-Jbliterated | 11,96B | no disponible | gemma | Variante sin rechazo por edición de pesos; solo inglés; métricas del autor |
| google/gemma-4-12b-it-qat-q4_0-unquantized | ~12B | no disponible | gemma | Modelo base oficial; rechazo intacto; MMLU 78,42% según el autor de la variante |
| ApolloRaines/Gemma-4-12B-it-Jbliterated-v2 | ~12B | no disponible | gemma | Misma base con SFT ligero sobre trazas reparadas; reduce el bucle de clasificación de seguridad en el canal de pensamiento; recomendado por el autor frente a la v1 |
| Otras variantes abliterated de la familia Gemma | ~12B | no disponible | gemma | No se dispone de datos verificables de terceros en la información proporcionada |

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar el rechazo; puede producir contenido dañino, instrucciones operativas de ataque o análisis de malware sin filtros. El propio autor lo publica para investigación en seguridad y red teaming.
- La v1 conserva un comportamiento residual: en prompts con razonamiento habilitado tiende a clasificar seguridad dentro del canal de pensamiento y, en ocasiones, entra en bucles sin producir respuesta final. El autor recomienda la v2 para uso nuevo.
- Las métricas de retención de capacidad (MMLU sin cambio, tasa de respuesta directa) proceden únicamente del arnés del autor, sin verificación independiente ni detalle del conjunto de evaluación.
- El modelo solo declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- La licencia Gemma Terms of Use impone restricciones de uso, obligaciones de atribución y una política de uso aceptable que puede entrar en conflicto con el propósito declarado de la variante; conviene revisarla antes de cualquier despliegue comercial.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado principalmente con datos en inglés y sin evaluación de sesgo publicada, se deben asumir los sesgos del base.
- Riesgo de alucinación no cuantificado para esta variante; la edición de pesos no incluye evaluación de factualidad.
- La reproducibilidad de la técnica "jbliteration" no es verificable: no se publican capas intervenidas, vectores ni hiperparámetros.
- El repositorio ocupa 86,2 GB e incluye múltiples cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- El contexto máximo no está documentado en la información disponible; no asumir la ventana del modelo base sin verificarla en la configuración del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Gemma-4-12B-it-Jbliterated
- Versión v2: https://huggingface.co/ApolloRaines/Gemma-4-12B-it-Jbliterated-v2
- Modelo base: https://huggingface.co/google/gemma-4-12b-it-qat-q4_0-unquantized
- Herramienta DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Términos de licencia Gemma: no disponible en la información proporcionada (referenciada como `license: gemma` en el repositorio)
