# dasLOL/zils-lite-skills-v2

## Resumen

zils-lite-skills-v2 es un modelo derivado de Qwen/Qwen3.5-0.8B publicado por el usuario dasLOL en HuggingFace. Se presenta como un "soup-body" (cuerpo de pesos de lenguaje y visión) para el pool z3 de Zils, un ecosistema vinculado a la red Bittensor. No es un modelo conversacional autónomo: según la model card, está diseñado para ser evaluado sobre un "chassis" fijado del pool, que aporta la capa de respuesta, el prompt y el runtime. El repositorio tiene 852.985.920 parámetros reales en safetensors (1,7 GB) y licencia Apache-2.0.

El modelo parte del Qwen3.5-0.8B y se ha entrenado con ajuste fino de todos los parámetros (full-parameter) sobre aproximadamente 156.000 ítems de decisión, públicos y generados por el proyecto, con etiquetas gold suavizadas. Después se aplicó una media ponderada 0.75/0.25 con el "soup" de partida. La pipeline declarada es `feature-extraction`, no `text-generation`, lo que refuerza su carácter de componente interno dentro de un pipeline mayor.

Su relevancia es acotada: se trata de un artefacto de investigación y experimentación dentro de un ecosistema concreto (Zils/Bittensor), sin descargas ni likes en el momento de la consulta, sin idiomas declarados y sin benchmarks publicados. Resulta útil para quienes exploren modelos pequeños de decisión y técnicas de model soup, no como sustituto de un LLM generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); detalles internos no disponibles |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. La model card no detalla la arquitectura interna (número de capas, atención, etc.) ni el contexto nativo, por lo que esos datos deben consultarse en el repositorio del modelo base. El autor lo describe como un "soup-body" que contiene pesos de lenguaje y visión, lo que sugiere que el modelo base incorpora componentes multimodales, aunque no se especifica cómo se usan en este derivado.

El entrenamiento consistió en un ajuste fino de todos los parámetros de los pesos de lenguaje contra etiquetas gold suavizadas sobre unos 156.000 ítems de decisión de dominio mixto: conteos aritméticos y de cobertura, verificación de argumentos de llamadas a herramientas, conteo de sílabas con CMUdict, inflexiones del inglés con UniMorph, similitud de captions con CxC y particiones de entrenamiento de PIQA, 20 Newsgroups, TweetEval (ironía y emoción), Sarcasm Headlines, GLUE RTE y QNLI, ANLI, BANKING77, BoolQ, Social IQa y CommonsenseQA. Posteriormente se promediaron los pesos 0.75/0.25 con el soup de partida (media uniforme de vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full). El autor declara que no se usaron datos de exámenes de validadores ni datos de clientes.

## Capacidades

- Clasificación y decisión sobre tareas de razonamiento corto: los datos de entrenamiento cubren PIQA, BoolQ, ANLI, Social IQa y CommonsenseQA, orientados a elección entre opciones.
- Verificación de argumentos de llamadas a herramientas (tool-call argument checks), según la composición del dataset.
- Conteos aritméticos y de cobertura, y conteo de sílabas (CMUdict).
- Inflexiones morfológicas del inglés (UniMorph).
- Similitud semántica de captions (CxC), lo que apunta a una posible utilidad en tareas de emparejamiento texto-imagen, aunque no se detalla el uso de la parte visual.
- Clasificación de intenciones y emociones: BANKING77, TweetEval (ironía y emoción), Sarcasm Headlines.
- Inferencia de lenguaje natural: GLUE RTE y QNLI.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Tool calling general, agentes multi-paso, thinking mode, audio: no disponibles o no documentados.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: el modelo puede clasificar consultas de usuario en categorías predefinidas (estilo BANKING77) antes de derivarlas a un LLM mayor, reduciendo coste por consulta.
- Verificación de argumentos en pipelines de tool calling: validar que los parámetros generados por otro modelo cumplen el esquema esperado antes de ejecutar la llamada, gracias al entrenamiento específico en "tool-call argument checks".
- Filtrado de contenido irónico o sarcástico en moderación: útil para preprocesar comentarios y detectar tono no literal (TweetEval irony, Sarcasm Headlines) antes de un análisis más profundo.
- Respuesta a preguntas de sentido común en entornos de bajos recursos: al ser un modelo de 0,85B, puede desplegarse en CPU o GPU modesta para tareas de QA booleana (BoolQ) o inferencia (RTE/QNLI) en sistemas embebidos.
- Normalización lingüística en pipelines de TTS o análisis textual: conteo de sílabas con CMUdict e inflexiones con UniMorph para preprocesar texto en inglés antes de síntesis de voz o análisis morfológico.
- Evaluación comparativa de técnicas de model soup: sirve como referencia reproducible para estudiar el efecto del promediado de pesos (0.75/0.25) frente al ajuste fino puro en modelos pequeños.
- Componente de decisión dentro de un pool Bittensor: integrado en el chassis del pool z3, el modelo puede actuar como capa de selección entre respuestas candidatas generadas por otros nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB según longitud de secuencia.
- En cuantización de 8 bits: en torno a 0,9 GB de pesos; en 4 bits, aproximadamente 0,5 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4). Para lotes grandes, A10G o L4.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (librería declarada), y previsiblemente vLLM, TGI o llama.cpp si se generan conversiones, aunque no se han publicado artefactos para ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-skills-v2 | 853M | No disponible | Apache-2.0 | Decisión/clasificación (soup-body) |
| Qwen/Qwen3.5-0.8B | ~0,8B | No disponible | Apache-2.0 | LLM generalista multimodal |
| Maincode/Matilda-Decision-v1-Edge | No disponible | No disponible | Apache-2.0 | Decisión (componente del soup) |
| vllm-sr/d3-lite | No disponible | No disponible | Apache-2.0 | Decisión (componente del soup) |

La comparación con alternativas de propósito general no es directa: zils-lite-skills-v2 no se distribuye como modelo conversacional, sino como cuerpo de pesos para un runtime específico. Frente a Qwen3.5-0.8B, pierde capacidad generativa abierta y gana especialización en tareas de decisión y verificación. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el chassis del pool z3 (capa de respuesta, prompt y runtime) para funcionar según lo previsto; usarlo fuera de ese entorno puede degradar gravemente los resultados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Idiomas no declarados: la mayor parte del dataset es en inglés (CMUdict, UniMorph English, GLUE, TweetEval), por lo que el soporte de otros idiomas es dudoso.
- Riesgo de alucinación y de sobreajuste a los formatos de decisión del entrenamiento; puede fallar en tareas generativas abiertas.
- Sesgos: al entrenarse con datasets públicos (TweetEval, Sarcasm Headlines, Social IQa, etc.) hereda los sesgos de esas fuentes; no se documenta ninguna mitigación.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse los NOTICE y términos de los modelos upstream (Qwen y los modelos Zils de origen).
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo día (2026-11-04), lo que indica escasa validación comunitaria.
- El tag `custom_code` implica que la carga requiere `trust_remote_code=True`, con el riesgo de seguridad asociado a ejecutar código del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dasLOL/zils-lite-skills-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/vllm-sr/d3-lite
- Componente del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Componente del soup: https://huggingface.co/zils-ai/jiwo-0.8b-full
