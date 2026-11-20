# mradermacher/Darwin-27B-RSI-i1-GGUF

## Resumen

Darwin-27B-RSI-i1-GGUF es la versión cuantizada en formato GGUF del modelo Darwin-27B-RSI, desarrollado originalmente por FINAL-Bench y convertido por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 26.900 millones de parámetros (26.895.998.464 exactos según los pesos en safetensors) orientado a razonamiento explícito y a lo que sus etiquetas describen como "recursive self-improvement" (RSI) a nivel de modelo: entrenamiento sin etiquetas humanas, decisiones tipadas y razonamiento tipo System-2 con cadena de pensamiento visible.

El modelo se presenta como una variante especializada en tareas de razonamiento científico y de alto nivel (las etiquetas mencionan GPQA y SuperGPQA), con soporte declarado de inglés, coreano y multilingüe. La ficha del cuantizador no incluye la model card completa del autor original, por lo que buena parte de los detalles de arquitectura y entrenamiento no están disponibles en la información proporcionada.

La relevancia práctica de esta ficha concreta es que mradermacher ofrece un conjunto amplio de cuantizaciones imatrix (desde IQ1_S de 7,2 GB hasta Q6_K de 22,2 GB), lo que permite ejecutar un modelo de ~27B en hardware de consumo y en servidores sin GPU de gama alta, manteniendo la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas apuntan a qwen3.5 como familia de referencia) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix, generadas con convert_type hf y output_tensor_quantised) |
| Idiomas soportados | en, ko, multilingual (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base. Las etiquetas incluyen "qwen3.5" y "27b", lo que sugiere que Darwin-27B-RSI se construye sobre una familia Qwen de 27B, pero no se confirma explícitamente en la documentación disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Las etiquetas del modelo sí describen un enfoque de entrenamiento característico: "recursive-self-improvement", "model-level-rsi", "no-human-labels" y "label-free", junto con "typed-decisions", "decision-index", "jev" y "system-2". Esto indica un pipeline orientado a mejorar el razonamiento del modelo sin supervisión humana directa, con decisiones estructuradas y modo de pensamiento explícito. No hay información verificable sobre innovaciones de inferencia (decodificación especulativa, atención lineal, etc.). Esta versión concreta es una cuantización imatrix del modelo original, generada por mradermacher con pesos ponderados/imatrix.

## Capacidades

- Generación de texto conversacional y razonamiento explícito con cadena de pensamiento ("thinking", "chain-of-thought").
- Razonamiento científico y de alto nivel, con etiquetas específicas para GPQA y SuperGPQA.
- Decisiones tipadas ("typed-decisions") y un "decision-index" como mecanismo declarado de estructuración del razonamiento.
- Enfoque "System-2": razonamiento deliberado frente a respuestas impulsivas.
- Automejora declarada a nivel de modelo ("model-level RSI", "self-evolving"), según las etiquetas del autor.
- Capacidades multilingües: inglés, coreano y multilingüe según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque las etiquetas de razonamiento y decisiones tipadas apuntan en esa dirección.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento científico y preguntas de nivel experto: el modelo está etiquetado para GPQA y SuperGPQA, por lo que encaja en asistentes de investigación que responden preguntas de física, química o biología con razonamiento paso a paso visible.
- Análisis con traza de razonamiento auditable: el modo "thinking" y las "typed-decisions" permiten registrar la cadena de decisión, útil en entornos donde se requiere justificar conclusiones (auditoría, compliance técnico).
- Despliegue en hardware de consumo: con las cuantizaciones Q4_K_M (16,6 GB) o IQ4_XS (15,2 GB) puede ejecutarse en GPUs de 24 GB o en configuraciones CPU+GPU mediante llama.cpp u Ollama.
- Experimentación en automejora de modelos: investigadores interesados en RSI y entrenamiento sin etiquetas pueden usar el modelo como base para reproducir o extender los experimentos del autor original.
- Asistente multilingüe inglés-coreano: para productos dirigidos a mercados de habla coreana o documentación bilingüe, dado el soporte declarado de ambos idiomas.
- Servicio de inferencia local en estaciones de trabajo: con la variante Q5_K_M (19,3 GB) o Q6_K (22,2 GB) se obtiene calidad cercana al modelo original en una única GPU de 24 GB.
- Generación de contenido técnico con razonamiento: borradores de documentación, explicaciones de conceptos complejos y resúmenes analíticos donde el razonamiento explícito mejora la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las etiquetas mencionan GPQA, SuperGPQA y "final-bench", pero no se incluyen cifras numéricas en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño del archivo, más overhead de contexto y KV cache):
  - IQ1_S: ~7,2 GB
  - IQ2_M: ~10,1 GB
  - IQ3_M: ~12,7 GB
  - IQ4_XS: ~15,2 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M a Q6_K; A100 40/80 GB o H100 para FP16/BF16 del modelo base (~54 GB solo pesos).
- Cabe en GPU de consumo: sí, desde RTX 3060 12 GB con cuantizaciones IQ2/IQ3, y con holgura en RTX 4090 con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el repo indica "endpoints_compatible". Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darwin-27B-RSI-i1-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF | Enfoque RSI y razonamiento científico |
| Qwen3 32B (referencia de familia) | ~32B | no disponible | Apache 2.0 | safetensors/GGUF | Familia citada en las etiquetas; comparación no verificada |
| Modelos de razonamiento de ~27-32B | variable | no disponible | variable | variable | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo verificables en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card original no está incluida en la información; muchos detalles (contexto, arquitectura, datos de entrenamiento) no son verificables.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Riesgo de alucinación inherente a modelos de razonamiento; el modo "thinking" puede producir cadenas de razonamiento plausibles pero incorrectas.
- Idiomas: solo inglés y coreano están declarados; el rendimiento en castellano no está garantizado.
- Las afirmaciones de "recursive self-improvement" y "self-evolving" provienen de las etiquetas del autor y no están respaldadas por benchmarks publicados en esta información.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base FINAL-Bench/Darwin-27B-RSI por si hubiera condiciones adicionales.
- El repo ocupa 300,3 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Darwin-27B-RSI-i1-GGUF
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Darwin-27B-RSI-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Darwin-27B-RSI-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
