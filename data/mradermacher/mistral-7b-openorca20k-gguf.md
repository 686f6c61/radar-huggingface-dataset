# mradermacher/mistral-7b-openorca20k-GGUF

## Resumen

Esta ficha describe `mradermacher/mistral-7b-openorca20k-GGUF`, una colección de cuantizaciones en formato GGUF del modelo base `rana-shahroz/mistral-7b-openorca20k`. El trabajo de cuantización lo realiza mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. El modelo subyacente parte de Mistral 7B, un transformer decoder-only de 7.241.732.096 parámetros (aproximadamente 7,24 mil millones), afinado presuntamente sobre el dataset OpenOrca de 20.000 muestras, de ahí el sufijo "20k" en el nombre.

El repositorio no aporta una model card técnica propia: se limita a listar los ficheros GGUF generados y a remitir a la página del modelo base para más detalles. No se documentan datos de entrenamiento, hiperparámetros, benchmarks ni licencia en la información disponible. El repo ocupa 63,9 GB en total, suma de todas las variantes de cuantización publicadas (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB).

Su relevancia práctica es acotada: se trata de una variante cuantizada de un fine-tune comunitario de Mistral 7B orientado a instrucciones, útil para quienes quieran ejecutar un modelo de 7B en hardware de consumo mediante llama.cpp, Ollama o interfaces compatibles con GGUF. No es un modelo de frontera ni compite con modelos actuales de 7B-8B; es una opción de despliegue local ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral 7B) |
| Parametros totales | 7.241.732.096 (según safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Mistral 7B original: 8.192 tokens; no confirmado para este fine-tune) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repo | 63,9 GB (conjunto de todas las cuantizaciones) |
| Modelo base | rana-shahroz/mistral-7b-openorca20k |
| Cuantizador | mradermacher |
| Variantes imatrix | disponibles en mradermacher/mistral-7b-openorca20k-i1-GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Mistral 7B, un transformer decoder-only con atención de ventana deslizante (sliding-window attention) en la arquitectura original, 32 capas, dimensión oculta de 4.096 y 32 cabezas de atención. El nombre "openorca20k" sugiere un ajuste supervisado sobre aproximadamente 20.000 muestras del dataset OpenOrca, un corpus de instrucciones generado a partir de GPT-4 y orientado a tareas de razonamiento e instrucciones generales. No se dispone de información verificada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

La capa añadida por mradermacher es puramente de cuantización: los ficheros GGUF se generan a partir de los pesos del modelo base en formato Hugging Face (convert_type: hf) y se publican en variantes estáticas (quantize_version: 2). No hay innovaciones arquitectónicas propias de este repositorio; el valor añadido es la disponibilidad de múltiples niveles de compresión para distintos presupuestos de memoria. Las cuantizaciones ponderadas/imatrix, que suelen preservar mejor la calidad a igual tamaño, se publican en un repositorio separado.

## Capacidades

- Generación de texto en inglés con estilo de instrucciones, heredado del fine-tune sobre OpenOrca.
- Razonamiento básico de múltiples pasos y respuesta a preguntas, limitado por el tamaño de 7B.
- Generación de código y explicaciones técnicas a nivel introductorio-medio (no confirmado por benchmarks).
- Conversación multi-turno en inglés.
- Capacidades multilingües: limitadas; la model card declara únicamente inglés.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible (no documentado).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales en inglés: al ser un GGUF de 7B, puede ejecutarse en un portátil con GPU modesta o incluso en CPU, lo que permite iterar sobre prompts y flujos sin coste de API.
- Experimentación con fine-tunes comunitarios: útil para investigadores que quieran comparar el comportamiento de un ajuste sobre OpenOrca frente a otros fine-tunes de Mistral 7B, usando las distintas cuantizaciones para aislar el efecto de la compresión.
- Generación de texto offline en entornos sin conectividad: con la variante Q4_K_M (4,5 GB) cabe en dispositivos con 8 GB de RAM/VRAM y funciona sin red.
- Educación y demostraciones de inferencia LLM: sirve para mostrar el pipeline completo (descarga GGUF, carga con llama.cpp, generación) en cursos o talleres.
- Tareas de clasificación y extracción de información en inglés: con prompting adecuado, puede etiquetar textos o extraer campos estructurados en lotes pequeños, siempre con validación humana.
- Base para ajustes ligeros con LoRA en entornos con recursos limitados: al partir de un modelo de 7B, el coste de un fine-tune adicional es bajo comparado con modelos mayores.
- Redacción asistida de borradores en inglés: útil como primer paso de generación que luego se revisa manualmente, dado el riesgo de alucinación del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de cuantización no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de perplejidad comparativas para este fine-tune concreto. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ≈ 2,8 GB; Q3_K_M ≈ 3,6 GB; IQ4_XS ≈ 4,0 GB; Q4_K_M ≈ 4,5 GB; Q5_K_M ≈ 5,2 GB; Q6_K ≈ 6,0 GB; Q8_0 ≈ 7,8 GB; f16 ≈ 14,6 GB. Añadir margen para el contexto KV cache (típicamente 0,5-1,5 GB según longitud).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4-Q5 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para f16, se requiere una GPU de 16-24 GB (RTX 4090, A10, L4, A100).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más usando Q4_K_M o inferiores; también en CPU con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, interfaces compatibles con GGUF. Los tags del repo indican `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo Inference Endpoints de Hugging Face para GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/mistral-7b-openorca20k-GGUF | 7,24 B | no disponible | no disponible | GGUF | Fine-tune comunitario sobre OpenOrca 20k, cuantizado |
| TheBloke/Mistral-7B-OpenOrca-GGUF | 7,24 B | 8.192 (modelo original) | Apache 2.0 (modelo original) | GGUF | Cuantización del fine-tune OpenOrca oficial sobre Mistral 7B |
| Mistral 7B Instruct (original) | 7,24 B | 8.192 | Apache 2.0 | safetensors, GGUF | Modelo base oficial de Mistral AI, fine-tune instructivo |
| Llama 3.1 8B Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | Modelo más reciente, mayor contexto y rendimiento general |

La comparación directa con benchmarks no es posible por falta de datos publicados para este fine-tune. Frente a Mistral 7B Instruct y Llama 3.1 8B, este modelo parte de una base más antigua (Mistral 7B, 2023) y un fine-tune comunitario, por lo que es previsible un rendimiento inferior en tareas de razonamiento e instrucciones, aunque no se dispone de mediciones que lo confirmen.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni del fine-tune, lo que impide confirmar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: inherente a un modelo de 7B afinado sobre un dataset sintético (OpenOrca); no hay evaluaciones de fidelidad.
- Sesgos: el dataset OpenOrca se genera a partir de salidas de GPT-4, lo que puede arrastrar sesgos del modelo generador; no hay documentación de mitigación.
- Contexto: la longitud de contexto efectiva de este fine-tune no está documentada; no asumir 8.192 tokens sin verificación.
- Fine-tune comunitario: procedencia y calidad del ajuste no auditadas; no hay información sobre hiperparámetros ni datos de validación.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que dependan de function calling sin ingeniería adicional.
- Repositorio de cuantización sin model card técnica: no hay garantías explícitas sobre fidelidad de las cuantizaciones frente al modelo base, más allá de las notas genéricas del cuantizador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/mistral-7b-openorca20k-GGUF
- Modelo base: https://huggingface.co/rana-shahroz/mistral-7b-openorca20k
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/mistral-7b-openorca20k-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#mistral-7b-openorca20k-GGUF
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Cuantización GGUF del fine-tune OpenOrca oficial (TheBloke): https://huggingface.co/TheBloke/Mistral-7B-OpenOrca-GGUF
