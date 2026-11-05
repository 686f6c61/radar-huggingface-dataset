# iPwnds/lexeuropa-qwen3b-lora

## Resumen

LexEuropa Qwen3B LoRA es un adaptador LoRA de bajo rango (r=16, alpha=32) entrenado sobre el modelo base Qwen/Qwen2.5-3B-Instruct, desarrollado por el usuario iPwnds en el contexto del proyecto LexEuropa, una herramienta de investigación jurídica con verificación de citas sobre derecho de la Unión Europea. El adaptador no busca mejorar el razonamiento jurídico general del modelo base, sino imponer una disciplina concreta de formato y citación: responder a partir de extractos de fuentes suministradas, estructurando la respuesta como afirmaciones JSON, cada una asociada a un identificador de fuente (S1..S8), y rechazar la pregunta cuando las fuentes no cubren lo solicitado.

El modelo se distribuye como adaptador PEFT en formato safetensors, con un tamaño de repositorio de 0,3 GB, y existe una versión fusionada independiente publicada como `lexeuropa-qwen3b-merged`. La licencia es Apache 2.0 y el único idioma declarado es el inglés. El entrenamiento se realizó con SFT mediante TRL sobre un conjunto de 506 ejemplos construidos de forma determinista a partir de texto real del RGPD y de las sentencias del TJUE C-131/12 y C-136/17.

Su relevancia es acotada pero clara: demuestra cómo un ajuste fino pequeño y muy dirigido puede mejorar la precisión y el recall de citas en un pipeline RAG jurídico, pasando de 0,82/0,88 con el modelo base a 0,95/0,95 con el adaptador en su evaluación de 42 preguntas. Es un prototipo de investigación, no una herramienta de asesoramiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-3B-Instruct) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA añade un conjunto reducido de parámetros entrenables (no se especifica el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Qwen2.5-3B-Instruct (no confirmada en la información proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base fusionado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros. El ajuste es un LoRA de rango 16 y alpha 32, entrenado durante 2 épocas con una pérdida final de entrenamiento de 0,011, usando SFT a través de TRL. No se documentan innovaciones arquitectónicas propias: la contribución está en los datos y en el objetivo de entrenamiento, no en la topología.

Los datos de entrenamiento son 506 ejemplos (422 positivos y 84 de rechazo) generados de forma determinista a partir de texto real del RGPD y de las sentencias del TJUE C-131/12 y C-136/17 en inglés, con una partición de validación a nivel de provisión. No se emplearon objetivos escritos por modelos. Se documenta un defecto conocido en la versión v1: algunas afirmaciones objetivo se cortaban a mitad de frase en las referencias cruzadas en línea (por ejemplo, "point (a) of Article 6(1)"), corregido en el constructor de datasets del repositorio y en la versión v2, aún no publicada. No se menciona RLHF ni DPO.

## Capacidades

- Generación de respuestas estructuradas en JSON a partir de extractos de fuentes suministradas, con una afirmación por objeto y una cita asociada a un identificador de fuente (S1..S8).
- Disciplina de citación: cada afirmación debe apuntar a una fuente concreta del contexto proporcionado.
- Rechazo explícito cuando las fuentes no cubren la pregunta (capacidad entrenada con 84 ejemplos de rechazo).
- Respuesta anclada a contexto (grounded answering) en un pipeline RAG jurídico.
- Comprensión de texto jurídico europeo en inglés: RGPD y jurisprudencia del TJUE.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación jurídica asistida sobre RGPD: el modelo recibe extractos de artículos y considerandos y devuelve afirmaciones JSON citando cada fuente, lo que permite construir respuestas trazables en una herramienta interna de consulta normativa.
- Verificación de citas en pipelines RAG: al forzar que cada afirmación lleve un handle S1..S8, se puede validar automáticamente que la respuesta no introduce referencias inventadas y descartar salidas sin respaldo.
- Filtrado de preguntas fuera de alcance: gracias a los ejemplos de rechazo, el adaptador puede actuar como capa de abstención cuando la recuperación no devuelve pasajes pertinentes, evitando respuestas alucinadas en producción.
- Extracción estructurada de obligaciones y derechos: a partir de un fragmento del RGPD, generar objetos JSON con la obligación, el sujeto y la provisión citada, útiles para alimentar bases de conocimiento internas.
- Análisis de jurisprudencia del TJUE: dado un conjunto de pasajes de sentencias como C-131/12 o C-136/17, producir afirmaciones citadas sobre los criterios aplicados, con trazabilidad a párrafo o provisión.
- Prototipado y evaluación de sistemas legales RAG: sirve como componente de referencia para medir disciplina de citación frente al modelo base, con una métrica concreta (precisión y recall de citas) y un conjunto de evaluación reproducible.
- Docencia y experimentación con SFT: el par dataset determinista más adaptador LoRA pequeño es un caso de estudio útil para enseñar ajuste fino dirigido a formato y abstención con recursos mínimos.

## Benchmarks y rendimiento

Evaluación sobre 42 preguntas retenidas, con la recuperación actual y un juez Qwen2.5-7B-Instruct. Las preguntas son plantilladas, por lo que los valores absolutos son optimistas.

| Modelo | Precisión de citas | Recall de citas | Notas |
|---|---|---|---|
| lexeuropa-qwen3b-lora v1 | 0,95 | 0,95 | 40 de 42 preguntas; 2 errores de arranque en frío |
| lexeuropa-qwen3b-lora v2 (dataset reconstruido) | 0,93 | 0,93 | Entrenado sobre el dataset corregido |
| Qwen2.5-7B-Instruct sin ajustar | 0,82 | 0,88 | Línea base |
| Figura anterior (previa a correcciones de recuperación) | 0,29 | 0,24 | Obsoleta; no comparable |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; el consumo real depende del modelo base Qwen2.5-3B-Instruct sobre el que se cargue.
- Inferencia en fp16 del modelo base de 3B: aproximadamente 6-7 GB de VRAM, estimación orientativa no confirmada en la model card.
- Cuantización a 8 bits: en torno a 3-4 GB de VRAM; a 4 bits: en torno a 2-3 GB. Valores estimados, no publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para fp16; A100 o H100 solo necesarias para lotes grandes o despliegue concurrente.
- Cabe en GPU consumer: sí, con el modelo base en fp16 en 8-12 GB o cuantizado en 4-6 GB.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; la versión fusionada `lexeuropa-qwen3b-merged` permite usar vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lexeuropa-qwen3b-lora | 3B (base) + LoRA | no disponible | Adaptador jurídico para citación y abstención sobre RGPD y TJUE | apache-2.0 | HuggingFace (adaptador y versión fusionada) |
| Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | Modelo generalista de instrucciones | apache-2.0 | HuggingFace |
| Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo generalista de instrucciones, usado como juez y línea base | apache-2.0 | HuggingFace |

La comparación relevante es frente al propio modelo base: el adaptador mejora la precisión y el recall de citas de 0,82/0,88 a 0,95/0,95 en el conjunto de evaluación del autor, a costa de un alcance temático muy restringido (tres documentos en inglés). No se dispone de comparación con otros adaptadores jurídicos en la información proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento de solo tres documentos en inglés (RGPD, C-131/12 y C-136/17); el modelo puede rechazar preguntas que requieran síntesis entre un estatuto y una sentencia.
- El objetivo es la disciplina de formato y citación, no el razonamiento jurídico general; no debe interpretarse como mejora de la calidad argumentativa.
- Las preguntas de evaluación son plantilladas, por lo que las métricas absolutas son optimistas y no extrapolables a consultas reales.
- Defecto conocido en v1: algunas afirmaciones objetivo se cortaban a mitad de frase en referencias cruzadas en línea, lo que puede producir citas fragmentadas; corregido en v2, no publicada.
- Riesgo de alucinación persistente fuera del dominio entrenado y cuando la recuperación no aporta pasajes relevantes; la abstención mitiga pero no elimina este riesgo.
- Solo inglés declarado; no hay soporte documentado para castellano ni otras lenguas.
- Es un prototipo de investigación, no asesoramiento legal; no debe usarse para decisiones jurídicas sin revisión humana.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y el alcance limitado hacen desaconsejable su despliegue en producción sin evaluación propia.
- No se documentan sesgos específicos más allá de los inherentes al corpus (texto normativo y jurisprudencial europeo en inglés).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iPwnds/lexeuropa-qwen3b-lora
- Proyecto LexEuropa en GitHub: https://github.com/lumenworksco/-LexEuropa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Versión fusionada: https://huggingface.co/iPwnds/lexeuropa-qwen3b-merged (referenciada en la model card; no verificada en la información disponible)
