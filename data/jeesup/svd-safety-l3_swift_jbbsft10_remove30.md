# Jeesup/svd-safety-l3_swift_jbbsft10_remove30

## Resumen

`Jeesup/svd-safety-l3_swift_jbbsft10_remove30` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido con la técnica SVD-LLM hasta el 70,03% de los parámetros densos originales (un 30,00% de parámetros eliminados) y sin ningún componente restaurado (presupuesto de restauración del 0,000%). Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. Forma parte de una rejilla experimental sobre reglas de selección y presupuestos de restauración, por lo que no es un modelo conversacional de propósito general.

El modelo conserva la arquitectura transformer decoder-only de Llama 3, con pesos almacenados en safetensors y compatibilidad declarada con `transformers`, `text-generation-inference` y endpoints. Los metadatos de safetensors reportan 8.030.261.248 parámetros, una cifra que coincide exactamente con el recuento del Llama-3-8B denso y que resulta inconsistente con la fracción de parámetros de 0,7003 declarada en la model card; conviene tratar ese dato con cautela. El tamaño del repositorio es de 16,1 GB, lo que es coherente con pesos en precisión de 16 bits.

Su relevancia es acotada y estrictamente metodológica: sirve como celda de control en estudios de interpretabilidad y seguridad bajo compresión, y aporta métricas medidas con jueces automáticos (AdvBench ASR, StrongREJECT ASR, sobre-rechazo macro con WildGuard y perplejidad en WikiText-2). La propia model card advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad y de que cualquier celda debe evaluarse como sujeto experimental, no desplegarse como asistente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos comprimidos mediante SVD-LLM |
| Parametros totales | 8.030.261.248 según metadatos de safetensors; la model card declara una fracción de parámetros resultante de 0,7003 respecto al modelo denso (discrepancia sin aclarar en la información disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Llama-3-8B-Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos en safetensors (16,1 GB, coherente con 16 bits por parámetro) |
| Idiomas soportados | No disponible en la ficha; el modelo base declara soporte para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Libreria | transformers |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Semilla del experimento | 42 |
| Regla de selección de componentes | `unknown` |
| Componentes restaurados / sustituidos | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y atención con grouped-query attention, entrenado originalmente por Meta con ajuste por instrucciones y preferencias. Sobre ese checkpoint, este artefacto aplica SVD-LLM, un método de compresión que aproxima las matrices de pesos mediante truncamiento de descomposición en valores singulares, eliminando un 30,00% de los parámetros densos. La model card especifica que no se restauró ningún componente SVD (presupuesto de restauración del 0,000%, cero componentes restaurados y cero sustituidos), de modo que el resultado es la versión comprimida sin reparación posterior.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo una fase adicional de RLHF o DPO específica para este checkpoint; el ajuste heredado es el del modelo base. La innovación técnica relevante no está en el entrenamiento, sino en el protocolo experimental: la rejilla cruza reglas de selección de componentes con presupuestos de restauración para medir el compromiso entre seguridad y utilidad bajo compresión, con la semilla 42 fijada para reproducibilidad. El nombre del checkpoint (`swift_jbbsft10_remove30`) sugiere una variante de ajuste sobre datos de jailbreak, pero la información proporcionada no documenta ese procedimiento.

## Capacidades

- Generación de texto conversacional, heredada del ajuste por instrucciones de Llama-3-8B-Instruct, aunque degradada por la compresión (perplejidad en WikiText-2 de 18,9507).
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la pérdida de calidad introducida por el truncamiento SVD.
- Reducción medible de la tasa de éxito de ataques: AdvBench ASR de 0,0192 y StrongREJECT ASR de 0,0319 según el juez HarmBench.
- Comportamiento de rechazo evaluable: sobre-rechazo macro de 0,4273 medido con WildGuard, lo que indica una tendencia elevada a rechazar peticiones legítimas.
- Compatibilidad declarada con `transformers`, `text-generation-inference` y endpoints compatibles, además de la etiqueta `conversational`.
- Capacidades de visión, audio, tool calling, function calling y agentes: no documentadas en la información proporcionada.
- Modo de pensamiento explícito (`thinking mode`): no disponible.

## Casos de uso

- Estudio de compromisos seguridad-utilidad bajo compresión: usar este checkpoint como una celda de la rejilla y comparar sus métricas (ASR de AdvBench y StrongREJECT, sobre-rechazo y perplejidad) con las de las demás celdas para cuantificar cuánto daña la compresión SVD al comportamiento de seguridad.
- Línea base de ablación sin restauración: al tener un presupuesto de restauración del 0,000% y cero componentes restaurados, sirve como referencia inferior frente a variantes que sí restauran componentes, aislando el efecto de la regla de selección.
- Validación de jueces automáticos de seguridad: las métricas se obtuvieron con HarmBench como juez y WildGuard para sobre-rechazo, de modo que el modelo permite reproducir y contrastar el comportamiento de esos evaluadores sobre un sujeto con ASR bajo pero con rechazo excesivo alto.
- Investigación en interpretabilidad de subespacios: analizar qué direcciones del espacio de pesos quedan anuladas por el truncamiento SVD y correlacionarlas con cambios observados en rechazo y en perplejidad.
- Pruebas de robustez de pipelines de evaluación: verificar que un arnés de evaluación de seguridad detecta correctamente un modelo con 1,92% de ASR en AdvBench y 3,19% en StrongREJECT, sin confundir baja peligrosidad aparente con alineación real.
- Reproducción académica del método SVD-LLM: replicar la compresión del 30% sobre Llama-3-8B-Instruct con semilla 42 y comparar la perplejidad obtenida (18,9507 en WikiText-2) con la reportada.
- Docencia y divulgación sobre compresión de modelos: ilustrar con un caso real cómo la compresión altera simultáneamente calidad lingüística y comportamiento de seguridad, algo que no se aprecia solo con la perplejidad.

Ninguno de estos casos implica desplegar el modelo como asistente de producción; la model card desaconseja explícitamente ese uso.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0192 |
| StrongREJECT | ASR (juez HarmBench) | 0,0319 |
| WildGuard | Sobre-rechazo macro | 0,4273 |
| WikiText-2 | Perplejidad | 18,9507 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general, ni la perplejidad del modelo base sin comprimir para establecer una comparación directa. La model card indica que la compresión por sí sola eleva la tasa de éxito de ataques y que varias ramas de la rejilla están deliberadamente degradadas en seguridad, por lo que estos valores deben interpretarse en el contexto del resto de celdas del estudio, no de forma aislada.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros y del tamaño del repositorio; la información proporcionada no incluye mediciones de latencia ni de throughput.

- VRAM para inferencia en 16 bits: aproximadamente 16-18 GB solo para pesos, más caché KV (del orden de 1 GB adicionales para 8.192 tokens con GQA en Llama-3-8B), es decir, en torno a 17-20 GB.
- VRAM en 8 bits: aproximadamente 8-10 GB más caché KV. En 4 bits: aproximadamente 4,5-6 GB más caché KV.
- GPU recomendadas para 16 bits: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB y RTX 3090 24 GB. Las GPU de 16 GB no son suficientes en 16 bits con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 (24 GB) en 16 bits, y en RTX 4080 de 16 GB o RTX 3060 de 12 GB si se cuantiza a 8 o 4 bits, respectivamente, aunque esta última configuración queda muy ajustada.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), vLLM y servidores compatibles con endpoints. El repositorio no incluye pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_swift_jbbsft10_remove30 | 8,03 B reportados (fracción densa declarada 0,7003) | No disponible en la ficha | Artefacto de investigación comprimido con SVD-LLM, sin restauración | Llama 3 Community License | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Modelo conversacional ajustado por instrucciones | Llama 3 Community License | HuggingFace, ampliamente utilizado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Modelo conversacional ajustado por instrucciones, generación posterior | Llama 3.1 Community License | HuggingFace, ampliamente utilizado |
| Mistral-7B-Instruct-v0.3 | Aproximadamente 7,25 B | 32.000 tokens | Modelo conversacional ajustado por instrucciones | Apache 2.0 | HuggingFace, ampliamente utilizado |

Los datos de los tres modelos comparados proceden de sus model cards públicas y no forman parte de la información proporcionada en esta ficha. La comparación es ante todo cualitativa: el checkpoint de este análisis no pretende competir en capacidad general, sino servir como sujeto experimental, y su licencia (Llama 3) es más restrictiva que la Apache 2.0 de Mistral.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card lo describe como artefacto de investigación y desaconseja su uso como asistente desplegable.
- Riesgo de seguridad: la compresión por SVD eleva la tasa de éxito de ataques según la model card, y varias ramas de la rejilla están deliberadamente degradadas en seguridad. Aunque este checkpoint reporta ASR bajo (1,92% en AdvBench y 3,19% en StrongREJECT), esos valores deben validarse de forma independiente.
- Sobre-rechazo elevado: 0,4273 macro con WildGuard indica que el modelo tiende a rechazar peticiones legítimas, lo que lo hace poco adecuado para aplicaciones reales de atención al usuario.
- Pérdida de calidad lingüística: perplejidad de 18,9507 en WikiText-2, sin valor de referencia del modelo base en la información disponible para cuantificar la degradación.
- Riesgo de alucinación: inherente a los modelos de la familia Llama y probablemente agravado por el truncamiento de pesos; no se han publicado evaluaciones de veracidad para este checkpoint.
- Idiomas: no documentados en la ficha; se heredan, en su caso, los del modelo base, con posible degradación desigual por idioma tras la compresión.
- Discrepancia de datos: los metadatos de safetensors indican 8.030.261.248 parámetros, mientras que la model card declara una fracción de parámetros de 0,7003. Conviene verificar el recuento real antes de extraer conclusiones cuantitativas.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con su política de uso aceptable; incluye condiciones de atribución ("Built with Meta Llama 3") y cláusulas específicas para despliegues a gran escala, por lo que el uso comercial está sujeto a dichos términos.
- Reproducibilidad: la regla de selección de componentes figura como `unknown` en la model card, lo que dificulta replicar exactamente la configuración.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbsft10_remove30
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Las búsquedas web realizadas no han devuelto ningún resultado relevante sobre este modelo: los enlaces obtenidos corresponden a un club de taekwondo en Bélgica (daehan.be, perfiles de Facebook e Instagram y un listado de empresas) y no guardan relación con el artefacto. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
