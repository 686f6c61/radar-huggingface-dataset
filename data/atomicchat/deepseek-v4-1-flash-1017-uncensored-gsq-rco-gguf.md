# AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF "abliterada" del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por AtomicChat sobre la cuantización GSQ-RCO de ISTA-DASLab. El modelo base es un MoE masivo de 763B parámetros con 384 expertos, y esta versión elimina la dirección de rechazo (refusal direction) de los tensores densos que escriben en el residuo, de modo que el modelo no genera negativas de seguridad.

La relevancia de esta ficha está en la combinación de dos técnicas: por un lado, la cuantización GSQ-RCO de ISTA-DASLab, que aprende el redondeo de baja precisión de los 384 expertos enrutados; por otro, la edición de abliteración aplicada solo a los tensores densos sustituidos (salida de atención, proyección down del experto compartido y proyección de valores del Engram), dejando los expertos intactos byte a byte. Según las mediciones del autor, el coste en tareas de razonamiento es nulo o despreciable (GPQA-Diamond idéntico, AIME25 ligeramente superior).

Un dato notable: el autor afirma que el modelo puede ejecutarse en una GPU de consumo de 12 GB mediante el runtime Strata, que mantiene el backbone en memoria de sistema y transmite la tabla Engram (110 GB) desde un SSD. Esto hace accesible un modelo de cientos de miles de millones de parámetros en hardware doméstico, aunque con las limitaciones propias de cuantizaciones extremas de 1,75 a 2,25 bits por peso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con 384 expertos enrutados, experto compartido y componente "Engram" |
| Parametros totales | 763B (según model card); 551.880.949.208 según metadatos de safetensors (551,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M (1,75 bpw), IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw), formato GSQ-RCO |
| Idiomas soportados | no disponible |
| Licencia | MIT (la cuantización); la licencia del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 no se detalla en la model card |
| Formato de pesos | GGUF (shards multiarchivo) + archivo Engram independiente de 110 GB |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer de tipo mixture-of-experts con 763B de parámetros totales y 384 expertos enrutados, además de un experto compartido y un mecanismo denominado "Engram" con su propia proyección de valores (`engram_wkv`), que se materializa como una tabla de consulta de 110 GB servida desde disco. Incluye modo de razonamiento ("thinking") con niveles de esfuerzo configurables. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

La contribución de AtomicChat no es un reentrenamiento sino una edición de inferencia: se toma el backbone GSQ-RCO de ISTA-DASLab (revisión `cb02422c900d`) y se sustituyen únicamente los tensores densos que escriben en el residuo — `attn_output_b`, `ffn_down_shexp` y `engram_wkv` — con la dirección de rechazo proyectada fuera (fuerza 2.0), aplicada a precisión completa y luego cuantizada al tipo exacto por tensor de ISTA. Los expertos enrutados conservan la cuantización aprendida de GSQ byte a byte, de modo que cada archivo mantiene el mismo tamaño y compatibilidad. La ejecución requiere Strata, ya que la variante con archivo Engram separado no está aún soportada en llama.cpp.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento con modo "thinking" y niveles de esfuerzo configurables (medido en "thinking high" y esfuerzo 50 en los benchmarks del autor).
- Resolución de problemas de matemáticas competitivas (AIME25: 80,0% en la rung IQ2_XXS editada).
- Razonamiento científico de nivel doctoral (GPQA-Diamond: 83,3%).
- Conocimiento general (MMLU-500: 82,8% en IQ2_XXS, dentro de ~1 punto respecto a la cuantización stock).
- Sin rechazos de seguridad: JailbreakBench EN baja de 85,2% a 0,0% de tasa de rechazo tras la edición; XSTest (rechazos en peticiones seguras) baja a 0,0%.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (solo se mide JailbreakBench en inglés).

## Casos de uso

- Investigación de seguridad y alineación: al eliminar por completo la conducta de rechazo, el modelo sirve como sujeto de estudio para evaluar mecanismos de refusales, direcciones de rechazo y técnicas de abliteración en modelos MoE de gran escala.
- Asistentes locales sin filtrado para usuarios avanzados: ejecución offline en hardware de consumo vía Strata, útil para quien necesita respuestas sin las salvaguardas del modelo original, asumiendo la responsabilidad legal y ética correspondiente.
- Benchmarking de cuantizaciones extremas: las tres rungs (IQ1_M, IQ2_XXS, IQ2_XS) publicadas con métricas y KL frente al stock permiten estudiar el impacto de cuantizaciones de 1,75–2,25 bpw en modelos gigantes.
- Razonamiento matemático y científico offline: con puntuaciones de 80% en AIME25 y 83,3% en GPQA-Diamond, es adecuado para resolver problemas de matemáticas competitivas y preguntas de ciencia nivel doctoral sin conexión.
- Experimentación con la arquitectura Engram: es una de las pocas formas prácticas de probar el diseño de tabla Engram externa servida desde SSD, relevante para investigación en sistemas de inferencia.
- Desarrollo y prueba del runtime Strata: el modelo es el caso de uso principal documentado para Strata, útil para desarrolladores que quieran validar despliegues de MoE gigantes con backbone en RAM y tablas auxiliares en SSD.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en Strata. Comparación rung stock GSQ-RCO → versión uncensored:

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (safe refused) | Thinking high (30) | MMLU (500) | KL to stock |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 82,8% (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 81,6% (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 80,6% (p=0,75) | 0,0207 |

Comparación de razonamiento (IQ2_XXS editada frente a stock GSQ-RCO, esfuerzo 50):

| Benchmark | Stock GSQ-RCO | Uncensored |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3% | 83,3% |
| AIME25 (30 preguntas) | 76,7% | 80,0% |

No se han publicado resultados de MMLU, HumanEval o GSM8K comparables con otros modelos de la categoría en la información disponible.

## Requisitos de hardware

- Tamaño de los shards: 231 GB (IQ1_M), 249 GB (IQ2_XXS) o 266 GB (IQ2_XS), más el archivo Engram compartido de 110 GB (se descarga una vez desde el repo de ISTA-DASLab).
- Según el autor, cabe en una sola GPU de 12 GB con Strata: el backbone reside en memoria de sistema y la tabla Engram se transmite desde un SSD rápido. Se recomienda, por tanto, una máquina con RAM amplia (el requisito exacto de RAM no está disponible) y un SSD NVMe rápido.
- No se requieren GPUs de centro de datos (A100/H100) según el método de despliegue documentado; no hay mediciones de latencia o throughput publicadas.
- Despliegue: exclusivamente con Strata (`strata launch`); la variante con archivo Engram separado no está aún soportada en llama.cpp. No hay soporte documentado para vLLM, TGI u Ollama.
- Ejemplo de descarga y arranque:

```bash
hf download AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF --include "*IQ2_XXS*" --local-dir ds-unc
hf download ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF --include "*Engram*" --local-dir ds-unc
strata launch --model-path ds-unc/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ2_XXS-00001-of-00004.gguf
```

## Comparativa con modelos similares

Comparativa entre las rungs disponibles de este mismo repositorio y la cuantización stock de la que deriva:

| Modelo | bpw | Total GB | MMLU (500) | JailbreakBench EN | Licencia |
|---|---|---|---|---|---|
| AtomicChat Uncensored IQ1_M | 1,75 | 231 | 80,6% | 0,0% | MIT |
| AtomicChat Uncensored IQ2_XXS | 2,0 | 249 | 82,8% | 0,0% | MIT |
| AtomicChat Uncensored IQ2_XS | 2,25 | 266 | 81,6% | 0,0% | MIT |
| ISTA-DASLab stock GSQ-RCO (base de la edición) | 1,75–2,25 | 231–266 | ~80–83% | 85–89% | no disponible |

Alternativas de la misma categoría (MoE gigante cuantizado a ultra-baja precisión): no disponible en la información proporcionada.

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta: un rechazo "suave" aparecido más adelante en el texto puede pasar por una respuesta válida, por lo que la eliminación de refusales no es perfecta en todos los puntos del texto.
- La edición elimina los rechazos en todos los temas; no mantiene un subconjunto selectivo de salvaguardas. El modelo responderá a peticiones peligrosas, ilegales o dañinas sin filtrar.
- Con el modo thinking activado, la edición puede planificar una respuesta a una petición problemática (la model card se corta en este punto, por lo que el detalle completo no está disponible).
- No todas las rungs superaron todas las puertas de calidad internas; las que no lo hicieron se publican "tal cual", con sus métricas visibles en la tabla (por ejemplo, la caída de "Thinking high" de 27/30 a 0–2/30 en las rungs editadas).
- La discrepancia entre los 763B declarados en la model card y los 551,9B de los metadatos de safetensors debe tenerse en cuenta al planificar memoria.
- Dependencia de Strata: sin soporte en llama.cpp u otros runtimes mainstream, lo que limita el ecosistema de despliegue.
- Riesgo de alucinación: no disponible; no se han publicado mediciones específicas.
- Licencia: la cuantización se distribuye bajo MIT, pero la licencia del modelo base de DeepSeek (y sus restricciones de uso comercial) no se detalla en la model card; conviene verificarla en el repositorio de deepseek-ai antes de cualquier uso comercial.
- Uso en producción: dada la ausencia total de salvaguardas, este modelo es inapropiado para productos orientados a público general y expone al operador a riesgos legales y reputacionales significativos.

## Enlaces

- Modelo: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Cuantización base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original de DeepSeek: deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de métricas y logs: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Versión uncensored en GGUF estándar del mismo autor: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Runtime Strata: https://github.com/Niko1221/Strata
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- Paper del modelo base y demo: no disponibles en la información proporcionada.
