# iamrodrigocoelho/gemma-4-e2b-refauna-lora16

## Resumen

Gemma 4 E2B Refauna LoRA16 es un ajuste fino mediante LoRA de 16 bits sobre el modelo instructivo `google/gemma-4-e2b-it`, publicado por el usuario iamrodrigocoelho en Hugging Face. El modelo está especializado en portugués de Brasil en temáticas de defaunación, refaunación, reintroducción de fauna, dispersión de semillas e interacciones ecológicas en la Mata Atlántica, a partir de la producción científica de la iniciativa Refauna. Cuenta con 5.123.178.051 parámetros totales y un repositorio de 10,3 GB en formato safetensors.

Se trata de una variante entrenada con LoRA de 16 bits sobre los mismos datos que la versión QLoRA del mismo autor, concebida para comparar ambos métodos de ajuste. El modelo fue desarrollado para la charla «Pequenos modelos, conhecimento especializado: fine-tuning e RAG com os dados do Refauna» y está pensado para su uso combinado con recuperación aumentada (RAG), citando los fragmentos recuperados en formato [n].

Su relevancia radica en demostrar un flujo completo de especialización de un modelo pequeño en un dominio científico acotado, con datos sintéticos estilo RAFT, abstención explícita cuando el contexto no contiene la respuesta y evaluación mediante juez LLM. La licencia es Apache 2.0 y los idiomas declarados son portugués e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B instruct), ajuste fino LoRA sobre capas de lenguaje |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LoRA 16-bit en safetensors; version GGUF Q4_K_M publicada en repo aparte |
| Idiomas soportados | pt (PT-BR), en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF (repo `-GGUF`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it` (Apache 2.0), cargado vía `unsloth/gemma-4-E2B-it`, y aplica un ajuste fino LoRA de 16 bits con r=16, alpha=16, 2 épocas y learning rate 0,0002, únicamente sobre las capas de lenguaje. Se emplea la plantilla de chat `gemma-4` sin modo thinking. El entrenamiento se ejecutó en una NVIDIA L4 en 23,9 minutos con un pico de 12,45 GB de VRAM.

Los datos consisten en 942 ejemplos sintéticos en PT-BR generados a partir de 22 artículos científicos, con formato estilo RAFT: aproximadamente 60% con contexto y citas, 15% de abstención y 25% sin contexto, con revisión humana por muestreo y partición por documento para evitar filtración. El pipeline de RAG recomendado combina embeddings de `google/embeddinggemma-300m` con BM25 mediante fusión RRF y recupera los 4 fragmentos superiores.

## Capacidades

- Generación de texto conversacional especializado en ecología de la conservación, concretamente defaunación, refaunación, reintroducción de fauna, dispersión de semillas e interacciones ecológicas de la Mata Atlántica.
- Respuesta fundamentada en contexto: recibe fragmentos numerados y cita los usados en formato [n].
- Abstención explícita cuando el contexto no contiene la respuesta, indicando que no encontró la información en los documentos de Refauna.
- Capacidad multimodal declarada por el pipeline `image-text-to-text` del modelo base, aunque el ajuste fino se aplica solo a capas de lenguaje.
- Soporte de portugués de Brasil como idioma principal y inglés declarado.
- Integración con transformers mediante `pipeline("text-generation", ...)`.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repo).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Asistente RAG para divulgación científica: recibir preguntas del público sobre reintroducción de especies en la Mata Atlántica, recuperar fragmentos de los artículos de Refauna y responder con citas [n] verificables.
- Apoyo a investigadores en revisión bibliográfica: consultar rápidamente qué publicaciones del corpus tratan un aspecto concreto (por ejemplo, dispersión de semillas por *Dasyprocta leporina*) y obtener las referencias citadas para acudir al original.
- Herramienta educativa en aulas y talleres: explicar conceptos de defaunación y refaunación en PT-BR de forma didáctica, con abstención cuando la pregunta queda fuera del corpus.
- Material de divulgación para organizaciones conservacionistas: generar borradores de respuestas a preguntas frecuentes sobre los programas de reintroducción, siempre con revisión humana y contraste con las fuentes.
- Demostración técnica de fine-tuning especializado: servir como caso de referencia para comparar LoRA de 16 bits frente a QLoRA sobre el mismo dataset en charlas y cursos.
- Despliegue local ligero: ejecutar la versión GGUF Q4_K_M en Ollama en equipos de sobremesa para consultas sin conexión durante trabajo de campo o talleres presenciales.
- Base para extender el corpus: reutilizar el formato de prompt system/user y el esquema de citas para añadir nuevos documentos de Refauna mediante RAG sin reentrenar.

## Benchmarks y rendimiento

Evaluación publicada por el autor con un juez LLM, notas de 1 a 5. A = base, B = base+RAG, C = fine-tuned, D = fine-tuned+RAG.

| Config | Correccion | Fidelidad | Citacion correcta | Abstencion correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1,12 | no disponible | no disponible | no disponible | 1,00 |
| B: base+RAG | 2,45 | 4,34 | 0,52 | 0,88 | 1,00 |
| C: FT | 2,00 | no disponible | no disponible | no disponible | 1,00 |
| D: FT+RAG | 2,34 | 4,21 | 0,52 | 0,88 | 1,00 |

Recuperación híbrida en test (n=74): Recall@4 = 0,42, MRR@20 = 0,30.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entrenamiento: NVIDIA L4 con pico de 12,45 GB de VRAM para el ajuste LoRA de 16 bits.
- Inferencia en precisión completa (5,12 mil millones de parámetros): aproximadamente 10-11 GB en fp16, más overhead de activaciones y KV cache.
- Inferencia con GGUF Q4_K_M: aproximadamente 3-4 GB de pesos, apta para GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) y para ejecución en CPU.
- GPU recomendadas para servicio: A100, H100 o L4 para despliegues concurrentes; RTX 4090 para desarrollo e inferencia local rápida.
- Opciones de despliegue: transformers, Ollama (vía `hf.co/iamrodrigocoelho/gemma-4-e2b-refauna-lora16-GGUF:Q4_K_M`), llama.cpp con el GGUF; vLLM y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-e2b-refauna-lora16 | 5.123.178.051 | no disponible | Refauna / Mata Atlantica, PT-BR, con citas | apache-2.0 | HF (safetensors y GGUF) |
| gemma-4-e2b-refauna (QLoRA) | mismo base | no disponible | misma, entrenado con QLoRA | apache-2.0 | HF |
| google/gemma-4-e2b-it | no disponible | no disponible | proposito general, instruct | apache-2.0 | HF |

No se dispone de datos de benchmarks comparativos frente a modelos de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Uso educativo y de divulgación científica; no sustituye a la literatura original, que debe consultarse siempre.
- Sin RAG, el modelo puede equivocarse en números, fechas y nombres de especies.
- El conocimiento está restringido a los 22 artículos usados en el entrenamiento y no cubre todo el trabajo de Refauna.
- El corpus es en portugués de Brasil; el rendimiento en inglés no está evaluado.
- Riesgo de alucinación en preguntas fuera del contexto, mitigado parcialmente por el entrenamiento en abstención (15% de los ejemplos).
- La evaluación se basa en un juez LLM con escala de 1 a 5 y n reducido (74 en recuperación); no hay evaluación con benchmarks estándar ni comparación con anotadores humanos independientes.
- El autor no documenta sesgos específicos ni evaluación de robustez frente a prompts adversarios.
- La licencia Apache 2.0 permite uso comercial, pero la calidad científica del contenido debe validarse con fuentes primarias antes de cualquier uso en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna-lora16
- Variante QLoRA: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Repositorio Unsloth del base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Iniciativa Refauna: https://refauna.org.br
- Embeddings del RAG: https://huggingface.co/google/embeddinggemma-300m
- DOI de referencia (2013): https://doi.org/10.1590/S1984-46702013000100015
- DOI de referencia (2014): https://doi.org/10.1177/194008291400700415
- DOI de referencia (2014): https://doi.org/10.1590/bjb.2014.0087
- DOI de referencia (2015): https://doi.org/10.1590/0102-33062015abb0008
- DOI de referencia (2017): https://doi.org/10.1002/ece3.2746
- DOI de referencia (2017): https://doi.org/10.1016/j.pecon.2017.09.004
- DOI de referencia (2018): https://doi.org/10.1017/S0030605316001149
