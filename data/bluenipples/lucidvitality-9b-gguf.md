# BlueNipples/LucidVitality-9b-GGUF

## Resumen

LucidVitality-9b-GGUF es la versión cuantizada en formato GGUF de LucidVitality-9b, un modelo de lenguaje de aproximadamente 8.953.803.264 parámetros (unos 8,95 mil millones) publicado por el usuario BlueNipples. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) de dos ajustes finos de la familia Qwen3.5-9B: `DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED` y `Darkhn/Qwen3.5-9B-Animus-V13.0`. El objetivo declarado por el autor es conservar la coherencia, el seguimiento de instrucciones, el comportamiento natural de EOS y la resistencia a bucles del ajuste basado en Claude, incorporando parte de la prosa creativa del segundo.

El repositorio contiene únicamente pesos cuantizados (Q4_K_M, Q5_K_M y F16) más la matriz de importancia (`.imatrix`) utilizada durante el proceso, generada a partir del dataset de calibración Qwen calibration-v6 con ejemplos adicionales de prosa. El tamaño total del repositorio es de 30,0 GB, coherente con la inclusión de la variante F16 junto a las cuantizaciones de 4 y 5 bits.

Su relevancia es limitada y muy específica: se trata de un modelo de nicho orientado a generación creativa y despliegue local en hardware de consumo, con un historial público escaso (82 descargas y 0 "likes" en el momento de la consulta). No se ha publicado información sobre licencia, idiomas soportados, longitud de contexto, benchmarks ni detalles del proceso de fusión, lo que condiciona seriamente su evaluabilidad para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible explícitamente; el modelo base pertenece a la familia Qwen3.5-9B (etiqueta `qwen3.5`), de tipo transformer denso |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, F16 (más el archivo `.imatrix` de calibración) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (`library_name: gguf`); el modelo base se distribuye aparte, presumiblemente en safetensors |
| Autor | BlueNipples |
| Modelo base | BlueNipples/LucidVitality-9b (relación: `quantized`) |
| Modelos fusionados | `DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED` y `Darkhn/Qwen3.5-9B-Animus-V13.0` |
| Dataset de calibración de la imatrix | Qwen calibration-v6, con ejemplos adicionales de prosa |
| Tamaño del repositorio | 30,0 GB |
| Descargas / likes | 82 / 0 |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-15 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen3.5` y del recuento de parámetros. Todo apunta a un transformer denso de ~9B parámetros, pero no se detallan número de capas, dimensión oculta, tipo de atención, uso de atención lineal o híbrida, ni vocabulario. Tampoco se especifica la longitud de contexto nativa, un dato crítico y ausente.

En cuanto al proceso de construcción, no hubo entrenamiento desde cero en este repositorio: LucidVitality-9b es una fusión de dos modelos ajustados sobre Qwen3.5-9B, y esta versión GGUF es una cuantización posterior de dicha fusión. El autor no indica el método de fusión empleado (por ejemplo, SLERP, TIES, DARE o linear), ni los pesos relativos de cada componente, ni si hubo etapas adicionales de RLHF o DPO. La única innovación técnica documentada es la cuantización con matriz de importancia: las cuantizaciones se generaron con una imatrix derivada del dataset Qwen calibration-v6 más ejemplos de prosa, una práctica que reduce la pérdida de calidad en capas sensibles. Los objetivos declarados de la fusión son la coherencia, el seguimiento de instrucciones, un comportamiento de EOS natural (evitar generaciones que no terminan) y la resistencia a bucles repetitivos, junto con una mejora de la prosa creativa.

## Capacidades

- Generación de texto general y continuación de texto en formato conversacional e instructivo.
- Seguimiento de instrucciones: es uno de los objetivos explícitos de la fusión, heredado del ajuste denominado HighIQ-INSTRUCT.
- Prosa creativa: incorpora parte de la capacidad de escritura del componente Animus-V13.0, orientada a narración y estilo.
- Estabilidad de generación: comportamiento de EOS natural y resistencia a bucles repetitivos, según el autor.
- Escritura larga y coherente: la coherencia se cita como la principal propiedad preservada del ajuste basado en Claude.
- Perfil de contenido: el nombre del modelo fusionado incluye el término "UNCENSORED", lo que sugiere una menor tasa de rechazos ante peticiones sensibles; no hay documentación formal al respecto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, visión, audio, matemáticas o código): no disponible.

## Casos de uso

- Escritura creativa y narrativa local: el modelo se ha construido explícitamente buscando mejorar la prosa creativa manteniendo coherencia; con la cuantización Q4_K_M cabe en GPUs de consumo, lo que permite usarlo como asistente de escritura sin conexión y sin enviar textos a terceros.
- Generación de variantes y reescritura de estilo: dado su perfil orientado a prosa, encaja en tareas de reescritura, ajuste de tono y generación de alternativas sobre un mismo pasaje, trabajando con el modelo cargado en Ollama o LM Studio.
- Diálogo de personajes y role-play: la combinación de menor censura declarada y prosa más rica lo hace adecuado para prototipos de chatbots de personaje, siempre que se aplique una capa propia de moderación si el producto es público.
- Generación de datos sintéticos de texto narrativo: se puede usar para producir corpus de prosa (descripciones, diálogos, escenas) destinados a alimentar otros pipelines de ajuste fino, con revisión humana posterior por el riesgo de alucinación y sesgos.
- Asistente conversacional de propósito general en local: para equipos que necesitan un LLM autoalojado sin coste por token, sobre hardware de gama alta de consumo (por ejemplo, 12-16 GB de VRAM con Q4_K_M), aceptando la ausencia de garantías de licencia.
- Laboratorio de evaluación de fusiones de modelos: sirve como caso de estudio para medir cómo una fusión de ajustes finos sobre una misma base se comporta tras cuantización con imatrix, comparando Q4_K_M, Q5_K_M y F16 sobre el mismo prompt set.
- Prototipado rápido con descarga única: el repositorio incluye las tres variantes de cuantización, lo que permite hacer búsqueda de compromiso calidad/velocidad sin depender de terceros que reproduzcan las cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y la búsqueda web realizada no devolvió resultados relevantes (únicamente enlaces genéricos a Facebook, sin relación con el modelo). Tampoco existen datos de evaluación publicados por terceros en la información proporcionada.

| Benchmark | Resultado | Comparativa |
|---|---|---|
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |
| MT-Bench / evaluaciones subjetivas | No disponible | No disponible |

## Requisitos de hardware

Estimaciones orientativas a partir del recuento de parámetros; no hay mediciones publicadas por el autor.

- VRAM estimada en inferencia (solo pesos): F16 ≈ 17,9 GB; Q5_K_M ≈ 6,4 GB; Q4_K_M ≈ 5,4 GB. A estas cifras hay que sumar la caché KV, que depende de la longitud de contexto efectiva (no documentada) y de la implementación.
- VRAM total práctica estimada: F16 ≈ 20-22 GB; Q5_K_M ≈ 7-8 GB; Q4_K_M ≈ 6-7 GB con contexto moderado.
- GPU recomendadas: para Q4_K_M y Q5_K_M, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti/4080, RTX 3090/4090; para F16, RTX 3090/4090 24 GB, A100 40 GB, H100 80 GB, o dos GPU de 16 GB repartiendo capas.
- Cabe en GPU de consumo: sí, en las variantes Q4_K_M y Q5_K_M. También es viable en equipos Apple Silicon con memoria unificada de 16 GB o más, y en CPU con 16 GB de RAM usando Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, kobold.cpp, text-generation-webui y llama-cpp-python. El soporte de GGUF en vLLM y TGI es limitado o experimental, por lo que para servir en producción a escala convendría partir del modelo base en safetensors y convertirlo.
- Latencia y throughput: no disponibles como dato publicado. Como referencia únicamente orientativa, un modelo denso de ~9B en Q4_K_M suele situarse en el rango de decenas de tokens por segundo en GPU de gama alta de consumo, pero no se ha verificado para esta fusión concreta.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas públicas habituales y no de la información proporcionada para esta ficha. No hay datos de rendimiento comparables, porque LucidVitality-9b no publica benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| LucidVitality-9b-GGUF | ~8,95B | No disponible | No disponible | GGUF (Q4_K_M, Q5_K_M, F16) | 82 descargas, 0 likes |
| Qwen3.5-9B (familia base, sin fusionar) | ~9B | No disponible | No disponible | No disponible | Es la base de la que derivan los componentes |
| Llama 3.1 8B Instruct | ~8,03B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Ampliamente desplegado, cuantizaciones abundantes |
| Gemma 2 9B | ~9,24B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Ampliamente desplegado, cuantizaciones abundantes |

Frente a estas alternativas, la ventaja diferencial de LucidVitality-9b es su orientación declarada a prosa creativa y su menor censura aparente; las desventajas son la ausencia total de licencia y de benchmarks, un contexto desconocido y una validación comunitaria prácticamente nula.

## Limitaciones y advertencias

- Licencia no disponible: sin términos explícitos, no hay autorización clara para uso comercial. Conviene tratar el modelo como no apto para producción hasta que el autor publique una licencia.
- Idiomas no declarados: se desconoce si el modelo conserva el multilingüismo de la familia Qwen3.5 o si la fusión lo ha degradado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo (documentos extensos, conversaciones multi-turno largas) sin una evaluación propia.
- Ausencia total de benchmarks: no hay métricas de razonamiento, código, matemáticas ni calidad conversacional; cualquier decisión debe basarse en evaluación propia.
- Validación comunitaria mínima: 82 descargas y 0 likes indican muy poco escrutinio externo; los fallos no están catalogados.
- Perfil de contenido sensible: uno de los componentes fusionados se denomina "HERETIC-UNCENSORED", lo que implica un sesgo hacia respuestas sin salvaguardas. Es imprescindible añadir moderación propia si se expone a usuarios finales.
- Riesgo de alucinación: inherente a los modelos de ~9B y no mitigado por ninguna técnica documentada (RAG, verificación, etc.).
- Pérdida por cuantización: las variantes Q4_K_M y Q5_K_M introducen degradación respecto a F16, atenuada por el uso de imatrix, pero no eliminada. Para evaluaciones de calidad conviene usar F16 como referencia.
- Naturaleza de fusión: al ser un merge de dos ajustes finos, puede heredar inconsistencias de comportamiento entre ambos, además de los sesgos de sus datasets de origen, que no se documentan.
- Metadatos incompletos: no se especifica pipeline, ni plantilla de chat, ni tokenizer, lo que puede provocar errores de formato en conversaciones si no se usa la plantilla correcta de la familia Qwen3.5.
- Consumo de disco: el repositorio ocupa 30,0 GB, por lo que conviene descargar solo el archivo de cuantización necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BlueNipples/LucidVitality-9b-GGUF
- Modelo base (no cuantizado): https://huggingface.co/BlueNipples/LucidVitality-9b
- Componente fusionado 1: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED
- Componente fusionado 2: https://huggingface.co/Darkhn/Qwen3.5-9B-Animus-V13.0
- Paper, blog o repositorio técnico: no disponible
- Demo o espacio interactivo: no disponible
- Resultados de la búsqueda web: no se encontraron enlaces relevantes; los resultados devueltos correspondían a páginas genéricas de Facebook sin relación con el modelo.
