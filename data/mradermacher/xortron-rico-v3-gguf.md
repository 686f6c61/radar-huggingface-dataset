# mradermacher/XORTRON-RICO-v3-GGUF

## Resumen

XORTRON-RICO-v3-GGUF es la versión cuantizada en formato GGUF del modelo darkc0de/XORTRON-RICO-v3, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad. El modelo base es un merge (fusión) construido con mergekit a partir de otros modelos, orientado a la generación de texto conversacional sin restricciones de contenido (uncensored/abliterated), con un tono marcado como experimental, tóxico y no apto para todo tipo de audiencias según sus propias etiquetas.

El modelo cuenta con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamaño. La información disponible no especifica la arquitectura interna exacta más allá de ser un transformer compatible con la librería transformers, ni datos sobre longitud de contexto, composición del dataset de entrenamiento o procesos de alineación como RLHF o DPO.

La relevancia de esta ficha reside en documentar de forma rigurosa un artefacto de la comunidad que combina cuantización GGUF con un modelo base de tipo merge sin alineación de seguridad, algo habitual en el ecosistema de modelos abliterated. Es importante señalar que la información disponible es limitada: no se publican benchmarks, no hay licencia declarada y el único idioma soportado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (según etiqueta transformers; detalles internos no disponibles) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 (variantes imatrix en repo separado) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (y safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer compatible con la librería transformers. El modelo es un merge construido con mergekit, lo que implica que sus pesos resultan de la combinación de otros modelos preexistentes mediante alguna técnica de fusión (no se especifica si es linear, SLERP, TIES, DARE u otra). Las etiquetas del modelo indican que incorpora componentes de tipo "heretic" y "abliterated", lo que sugiere que parte de los modelos fusionados han sido sometidos a procesos de eliminación o atenuación de mecanismos de rechazo (refusal) para generar contenido sin restricciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización fue realizada por mradermacher con la versión 2 de su pipeline de cuantización, con tensores de salida cuantizados y conversión desde formato HF; se ofrecen tanto cuantizaciones estáticas como variantes con imatrix (ponderadas) en un repositorio separado.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Modelo sin alineación de seguridad (uncensored/abliterated), capaz de producir contenido que otros modelos rechazarían.
- Soporte multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica capacidad de procesamiento de visión en el modelo base, aunque no se detallan las capacidades exactas.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- No se documenta soporte explícito de tool calling o function calling.
- No se documentan capacidades de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la metadata.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar cómo las técnicas de abliteration y merge afectan al comportamiento de rechazo en modelos de 27B, permitiendo comparar respuestas frente a modelos alineados.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas adultas o controvertidas, donde el modelo no aplica filtros de rechazo.
- Evaluación de cuantizaciones GGUF: al ofrecer un abanico de cuantizaciones desde Q2_K hasta Q8_0, permite medir el impacto de la compresión en la perplejidad y la calidad de generación en un modelo de 27B.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q4_K_S (15,9 GB) permiten ejecutar un modelo de 27B en GPU con 24 GB de VRAM o en configuraciones híbridas CPU/GPU.
- Pruebas de robustez y red teaming: útil para que equipos de seguridad generen prompts adversarios y evalúen la resistencia de sistemas de moderación frente a un modelo deliberadamente no alineado.
- Experimentación con modelos merge: investigadores que estudien técnicas de fusión de modelos pueden usar este artefacto para analizar el comportamiento emergente de merges con componentes abliterated y heretic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~11 GB, Q3_K_S ~12,4 GB, Q3_K_M ~13,6 GB, Q3_K_L ~14,7 GB, IQ4_XS ~15,5 GB, Q4_K_S ~15,9 GB, Q4_K_M ~16,9 GB, Q5_K_S ~19,1 GB, Q5_K_M ~19,6 GB, Q6_K ~22,5 GB, Q8_0 ~29,1 GB (más overhead de contexto y KV cache).
- GPU recomendadas: para Q8_0 se requiere una A100 40 GB, H100 o RTX 6000 Ada; para Q4_K_M cabe en una RTX 4090 (24 GB) o RTX 3090; las cuantizaciones Q2_K y Q3 pueden ejecutarse en GPUs de 16 GB como RTX 4080 o A4000.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB con Q2_K/Q3_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI), y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XORTRON-RICO-v3-GGUF | 27,3B | No disponible | No disponible | GGUF | Merge abliterated/heretic, solo inglés |
| Modelos densos de ~27B de la comunidad | ~27B | Variable | Variable | GGUF/safetensors | No se dispone de comparación directa documentada |
| Alternativas abliterated de tamaño similar | No disponible | No disponible | No disponible | GGUF | No se identifican modelos comparables concretos en la información disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos concretos de la misma categoría, dado que no se publican benchmarks ni detalles de arquitectura del modelo base.

## Limitaciones y advertencias

- Modelo explícitamente etiquetado como uncensored, harmful, toxic y not-for-all-anchored audiences: puede generar contenido dañino, ofensivo o inapropiado sin filtros.
- Riesgo elevado de alucinación: al ser un merge sin datos de entrenamiento documentados ni benchmarks, no hay garantías de fiabilidad factual.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Longitud de contexto desconocida: limita la planificación de aplicaciones que requieran ventanas largas.
- El modelo base es un merge experimental: la combinación de componentes abliterated y heretic puede producir comportamientos impredecibles o incoherentes.
- No apto para producción en entornos donde se requiera moderación de contenido o cumplimiento normativo.
- La cuantización Q2_K y Q3_K_M tienen calidad reducida según las propias notas del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/XORTRON-RICO-v3-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-RICO-v3
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/XORTRON-RICO-v3-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#XORTRON-RICO-v3-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
