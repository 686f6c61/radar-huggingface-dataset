# mikekeror/qwen2.5-7b-advocate-dpo-lora

## Resumen

`mikekeror/qwen2.5-7b-advocate-dpo-lora` es un adaptador LoRA (no un modelo completo) construido sobre `Qwen/Qwen2.5-7B-Instruct`. Lo desarrolla el usuario mikekeror y su propósito es alimentar el Advocate Remuneration Assistant, un asistente de generación aumentada por recuperación (RAG) que responde preguntas sobre la Advocates (Remuneration) Order de Kenia y sobre resoluciones judiciales relativas a la tasación de costas. El adaptador espera un prompt de tipo RAG con fragmentos de contexto recuperados más una pregunta, y responde citando los identificadores de los fragmentos suministrados.

El entrenamiento combina un ajuste supervisado con QLoRA (4 bits NF4) y un posterior DPO on-policy. El adaptador tiene 40,4 millones de parámetros entrenables (rango 16, alpha 32, aplicado a todas las capas lineales) y se distribuye como safetensors PEFT, con licencia Apache 2.0. El modelo base aporta la arquitectura transformer decoder-only y el conocimiento general; el adaptador únicamente especializa el comportamiento de respuesta y citación en el dominio legal keniano.

Su relevancia es metodológica más que de escala: es un ejemplo reproducible y documentado de cómo un adaptador pequeño (0,2 GB de repositorio) puede eliminar citas fabricadas en un pipeline RAG legal sin degradar la corrección de las respuestas. La propia model card advierte de que no es un modelo legal de propósito general, de que se entrenó con datos sintéticos generados por un profesor de 20B y de que no constituye asesoramiento jurídico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-7B-Instruct) con adaptador LoRA/PEFT de rango 16 y alpha 32 sobre todas las capas lineales |
| Parámetros totales | 7,61 mil millones en el modelo base; el adaptador aporta 40,4 millones de parámetros entrenables |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (ampliable a 131.072 con YaRN según la documentación pública de Qwen2.5); no se especifica una longitud distinta para el adaptador |
| Tipos de cuantización | Entrenado con QLoRA 4 bits NF4; en inferencia el adaptador se carga sobre el base, que admite bfloat16 y float16, además de cuantizaciones de terceros del base (GGUF, AWQ, GPTQ). No se publican pesos cuantizados del adaptador |
| Idiomas soportados | Inglés (`en`) declarado por el autor; el modelo base es multilingüe, pero el adaptador no fue entrenado para otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, 0,2 GB de repositorio) |

## Arquitectura y entrenamiento

El adaptador se inyecta en `Qwen2.5-7B-Instruct`, un transformer decoder-only con atención de consultas agrupadas (GQA) y ventana nativa de 32.768 tokens. El autor no modifica la arquitectura del base: entrena módulos LoRA de rango 16 y alpha 32 en todas las capas lineales, con pérdida calculada solo sobre la completación (completion-only loss). El ajuste supervisado se hizo con QLoRA en 4 bits NF4, sobre 550 ejemplos sintéticos escritos por un modelo profesor de 20B (`gpt-oss-20b`), e incluye respuestas fundamentadas en resoluciones y en la norma, cálculos de honorarios, rechazos y ejemplos fuera de alcance. Las citas se insertaron mediante script, nunca por el profesor, y la partición se agrupó por caso, excluyendo de evaluación todos los casos, pasajes, preguntas e importes. Se conservó 1 época (mejor pérdida de validación: 0,198).

La segunda fase es un DPO on-policy con beta 0,1, tasa de aprendizaje 2e-5, 2 épocas y un regularizador NLL de 0,2. Las 81 parejas de preferencia se minaron a partir de los fallos del propio modelo SFT sobre los prompts de entrenamiento (respuesta incorrecta o cita de fuente ausente), y el modelo de referencia es el propio adaptador SFT. La precisión de preferencia en validación fue de 0,917. El resultado técnico destacable es la eliminación total de citas fabricadas (de 11 en el base a 0), a costa de una ligera pérdida de fidelidad por sobrecompresión de algunas respuestas.

## Capacidades

- Generación de respuestas con recuperación aumentada: consume fragmentos de contexto y produce respuestas fundamentadas con citas a los identificadores de fragmento recibidos.
- Citación verificable: el adaptador cita explícitamente el caso o fragmento preguntado, con una tasa del 92,3% en la evaluación publicada.
- Cálculo de honorarios y tasación de costas: cubre cálculos de tarifas conforme a la Advocates (Remuneration) Order, aunque el autor recomienda que las cifras provengan del calculador determinista de la aplicación y no del modelo.
- Rechazo de consultas fuera de alcance: se entrenó con ejemplos explícitos de rechazo y de material fuera de dominio.
- Reducción de alucinación de citas: 0 citas fabricadas en la evaluación frente a 11 en el modelo base.
- Formato de prompt restringido: no es un asistente conversacional de propósito general; rinde solo con el formato RAG para el que fue entrenado.
- Despliegue multi-adaptador: compatible con el servidor de vLLM mediante `--enable-lora --max-lora-rank 16`.
- No dispone de tool calling documentado, ni visión, ni audio, ni modo de razonamiento extendido propios.

## Casos de uso

- Asistente de honorarios para abogados en Kenia: dada una consulta sobre costas y un conjunto de fragmentos de la Order recuperados por un buscador, el adaptador redacta la respuesta citando el fragmento aplicable; encaja porque fue entrenado exactamente con ese formato de prompt.
- Investigación de jurisprudencia sobre tasación de costas: el RAG recupera resoluciones de Kenya Law y el adaptador sintetiza la doctrina aplicable con citas al caso concreto, con un 92,3% de acierto en la identificación del caso preguntado.
- Generación de borradores con trazabilidad documental: al citar únicamente identificadores de fragmentos suministrados, la salida puede auditarse de forma automática contra el contexto recuperado, algo crítico en un dominio donde una cita inventada invalida el resultado.
- Filtrado y derivación de consultas fuera de alcance: el adaptador fue entrenado para rechazar peticiones ajenas al corpus, lo que permite usarlo como primera capa de triaje antes de escalar a un profesional.
- Servicio multi-tenant con LoRA dinámico: mediante vLLM se puede servir el base una sola vez y cargar este adaptador junto a otros, reduciendo el coste por consulta en comparación con desplegar un modelo completo por dominio.
- Plantilla metodológica para adaptar modelos a otros ordenamientos jurídicos: la combinación QLoRA más DPO on-policy sobre fallos propios del modelo, documentada paso a paso, es replicable para otros corpus legales con presupuestos pequeños de datos.
- Evaluación comparativa de pipelines RAG: al publicar métricas de fidelidad y de citas fabricadas frente al base y al SFT, sirve como referencia para medir el efecto real de un adaptador en un sistema de recuperación.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor: 62 preguntas (33 reservadas) con un pipeline RAG de recuperación idéntica para todos los modelos.

| Métrica | Base | SFT | SFT + DPO (este adaptador) |
|---|---|---|---|
| Corrección | 85,5% | 87,1% | 87,1% |
| Citas fabricadas | 11 | 0 | 0 |
| Cita el caso preguntado | 87,2% | 89,7% | 92,3% |
| Fidelidad (1-5, juez LLM) | 4,80 | 4,69 | 4,64 |

El propio autor señala que las diferencias de corrección están dentro del ruido con n=62, que el efecto claro es la eliminación de citas fabricadas y que la fidelidad baja ligeramente porque el adaptador sobrecomprime algunas respuestas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base completo de 7,61 mil millones de parámetros.
- VRAM estimada (no publicada por el autor; cifras orientativas para el base): en bfloat16 o float16, aproximadamente 15-16 GB solo de pesos, más la caché KV; en cuantización de 4 bits, aproximadamente 4-6 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para servir en precisión completa con lotes grandes; una RTX 4090 (24 GB) es suficiente para bf16 con lotes moderados.
- Cabe en GPU de consumo: sí, en tarjetas de 12-16 GB si se cuantiza el base (4 bits), y en 24 GB sin cuantizar.
- Opciones de despliegue documentadas: `transformers` más `peft` (`PeftModel.from_pretrained`) y vLLM con `--enable-lora --max-lora-rank 16 --lora-modules advocate-dpo=...`. El autor no documenta llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se conocen adaptadores públicos comparables en el mismo nicho (asistente RAG sobre la Advocates (Remuneration) Order de Kenia). La comparación se establece, por tanto, con el modelo base y con alternativas generalistas del mismo tamaño.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-advocate-dpo-lora | 7,61B (40,4M entrenables) | 32.768 tokens | RAG legal (Kenia), citación verificable | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | 7,61B | 32.768 tokens nativos | Propósito general, multilingüe | Apache 2.0 | HuggingFace |
| Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | Propósito general, tool calling | Licencia comunitaria Llama 3.1 | HuggingFace |
| Mistral 7B Instruct v0.3 | 7,25B | 32.768 tokens | Propósito general | Apache 2.0 | HuggingFace |

Datos de los modelos alternativos tomados de sus respectivas model cards públicas; no proceden de la información proporcionada sobre este adaptador. En el benchmark del autor, el modelo base sin adaptar fabricó 11 citas frente a 0 del adaptador, diferencia cualitativa más relevante que la variación de corrección.

## Limitaciones y advertencias

- Entrenado sobre datos sintéticos de un profesor de 20B, filtrados por reglas y no revisados por ningún abogado.
- Conjunto de evaluación pequeño (62 preguntas, 33 reservadas); el DPO no mostró ganancia medible de corrección sobre el SFT.
- El adaptador está atado a un corpus concreto (la Order revisada hasta 2022 y resoluciones de Kenya Law) y a un formato de prompt concreto; fuera de ese formato o corpus no hay garantía de comportamiento.
- Las cifras económicas deben proceder del calculador determinista de la aplicación, no del modelo.
- No constituye asesoramiento jurídico; el propio autor lo declara explícitamente.
- Idiomas: solo inglés declarado; no hay datos de rendimiento en otros idiomas.
- Riesgo de alucinación: aunque se eliminaron las citas fabricadas en la evaluación, el adaptador puede sobrecomprimir respuestas y perder matices (fidelidad 4,64 frente a 4,80 del base), lo que puede omitir excepciones o condiciones relevantes.
- Sin soporte documentado de tool calling ni de agentes multi-paso; no se recomienda su uso en flujos que dependan de invocación de funciones.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial del modelo base Qwen2.5-7B-Instruct debe verificarse contra los términos de su propia licencia.
- El repositorio no registra descargas ni valoraciones, y el autor no publica un pipeline declarado; conviene validar el adaptador en el caso de uso propio antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikekeror/qwen2.5-7b-advocate-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de la aplicación Advocate Remuneration Assistant: https://github.com/mikekeror-rgb/advocate_renumeration_assistant_v1
- Resultado de búsqueda web (listado genérico de modelos LoRA en HuggingFace, sin información adicional sobre este modelo): https://huggingface.co/models?sort=modified&search=lora
