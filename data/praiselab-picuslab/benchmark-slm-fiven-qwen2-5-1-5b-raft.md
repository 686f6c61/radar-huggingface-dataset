# praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-raft

## Resumen

`benchmark-slm-fiven-qwen2.5-1.5b-raft` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen2.5-1.5B`, publicado por el usuario `praiselab-picuslab`. No se distribuye como modelo completo, sino como pesos de adaptador en formato `safetensors`, por lo que su uso requiere descargar el modelo base de Qwen y cargar el adaptador encima. El repositorio tiene un tamano de 0.0 GB, lo que es coherente con un adaptador de bajo rango sobre un transformer de 1,5 mil millones de parametros.

El nombre y las etiquetas del repositorio indican que el modelo forma parte de una iniciativa de evaluacion de modelos de lenguaje pequenos (`benchmark-slm`) sobre un conjunto de datos denominado `fiven`, y que la estrategia de ajuste empleada es RAFT (Retrieval Augmented Fine-Tuning), una tecnica orientada a que el modelo responda a partir de contexto recuperado e ignore pasajes distractores. El adaptador esta etiquetado como conversacional (`conversational`, `it`) y en italiano, lo que sugiere un ajuste especifico para ese idioma. No se ha publicado informacion sobre el proceso de entrenamiento, el volumen de datos ni los resultados obtenidos, y el acceso al repositorio esta restringido y requiere aceptar condiciones en HuggingFace.

Su relevancia actual es acotada y de caracter experimental: se trata de un artefacto de investigacion con cero descargas y cero valoraciones, sin model card publica verificable ni benchmarks. Resulta interesante como ejemplo de metodologia (RAFT aplicado a un SLM de 1,5B en italiano) mas que como modelo listo para produccion, y su utilidad practica depende de verificar primero el contenido real del repositorio, dado que el acceso es restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only del modelo base Qwen2.5-1.5B |
| Parametros totales | No disponible para el adaptador (el repositorio no publica el numero de parametros entrenables). El modelo base Qwen2.5-1.5B tiene aproximadamente 1,54 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador. El modelo base Qwen2.5-1.5B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN segun su documentacion publica |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos de adaptador en `safetensors`; la cuantizacion requeriria fusionar el adaptador con el modelo base y convertir a GGUF, AWQ o GPTQ |
| Idiomas soportados | Italiano (`it`) segun las etiquetas del repositorio. El modelo base Qwen2.5 declara soporte multilingue (29 idiomas) |
| Licencia | No disponible. El modelo base Qwen2.5-1.5B se distribuye bajo Apache-2.0 segun su model card |
| Formato de pesos | `safetensors` (adaptador LoRA); requiere el modelo base `Qwen/Qwen2.5-1.5B` |
| Tipo de artefacto | Adaptador de fine-tuning (PEFT), no modelo completo |
| Estrategia de ajuste | RAFT (`strategy-raft`), inferida de las etiquetas del repositorio |
| Dataset declarado | `dataset-fiven` (contenido y tamano no disponibles) |
| Tarea declarada | `text-generation`, `conversational` |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / valoraciones | 0 descargas / 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El artefacto es un conjunto de pesos de adaptacion de bajo rango (LoRA) sobre Qwen2.5-1.5B, un transformer decoder-only con atencion de tipo grouped-query (GQA) y embeddings atados, disenado por el equipo de Qwen. No se ha publicado informacion sobre el rango del adaptador, los modulos objetivo (por ejemplo, `q_proj`/`v_proj` frente a todas las proyecciones lineales), el learning rate ni el numero de pasos de entrenamiento. Tampoco se especifica si el adaptador se entreno a partir del modelo base preentrenado (no instruido) o de una variante ya alineada; la etiqueta `base_model:Qwen/Qwen2.5-1.5B` apunta al checkpoint base, lo que implicaria que la capacidad conversacional proviene integramente del ajuste con el dataset `fiven`.

La innovacion metodologica que sugiere el nombre es RAFT (Retrieval Augmented Fine-Tuning): un esquema de entrenamiento en el que cada ejemplo combina una pregunta, un conjunto de documentos recuperados que incluyen pasajes relevantes y pasajes distractores, y una respuesta que cita el fragmento correcto. El objetivo es que el modelo aprenda a discriminar contexto util de ruido, reduciendo respuestas apoyadas en informacion irrelevante en pipelines de generacion aumentada por recuperacion. No se dispone de detalles sobre la composicion del dataset, el numero de tokens de entrenamiento, ni si se aplicaron fases de RLHF o DPO adicionales; dado el contexto de benchmark, es probable que el ajuste sea exclusivamente supervisado, pero este extremo no esta confirmado en la informacion disponible.

## Capacidades

- Generacion de texto en italiano con formato conversacional, segun las etiquetas `text-generation`, `conversational` e `it`.
- Respuesta condicionada a contexto recuperado (presunta capacidad derivada de la estrategia RAFT), incluyendo el descarte de pasajes distractores.
- Capacidad multilingue heredada del modelo base Qwen2.5, aunque el ajuste y las etiquetas solo cubren italiano; el rendimiento en otros idiomas no esta documentado.
- Razonamiento basico y generacion de codigo limitados por el tamano del modelo base (1,5B), sin datos de evaluacion publicados.
- Soporte de tool calling / function calling: no disponible; no se declara plantilla de chat ni formato de herramientas en el repositorio.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Canal de soporte en italiano sobre base documental: el adaptador puede integrarse en un pipeline RAG en el que se recuperan fragmentos de la base de conocimiento y se pasan como contexto; el entrenamiento RAFT esta disenado precisamente para que el modelo priorice el pasaje correcto frente a distractores. Requiere validacion previa, ya que no hay evaluacion publicada.
- Busqueda de respuestas en documentacion administrativa o normativa italiana: consultas del tipo "que plazo se aplica segun el articulo X" con el articulo recuperado en el prompt, aprovechando la ventana de 32.768 tokens del modelo base para incluir varios documentos completos.
- Extraccion y resumen de contenido en italiano en procesos batch: al ser un modelo de 1,5B, el coste por token es bajo y permite procesar volumenes grandes de textos (correos, incidencias, resenas) en una sola GPU consumer.
- Generacion de FAQs y respuestas predefinidas: ajuste sobre un corpus de preguntas frecuentes italianas para producir respuestas consistentes con el material de referencia, con el adaptador como capa especifica de dominio sobre el modelo base.
- Prototipado e investigacion sobre fine-tuning de SLMs: el artefacto sirve como punto de comparacion en estudios de ablation (RAFT frente a fine-tuning supervisado clasico o DPO) sobre un mismo modelo base de 1,5B, con coste de entrenamiento e inferencia reducido.
- Despliegue on-premise o en el borde con requisitos de privacidad: fusionando el adaptador y cuantizando a 4 bits, el conjunto cabe en GPUs de 4-6 GB o incluso en CPU, lo que permite procesar datos que no pueden salir de la infraestructura del cliente.
- Internacionalizacion de bajo coste: reutilizar el adaptador como plantilla metodologica para construir variantes en otros idiomas con el mismo pipeline de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de RAG o de fidelidad al contexto, y no se ha publicado ninguna comparacion con el modelo base ni con otras variantes del benchmark `benchmark-slm`.

## Requisitos de hardware

- El adaptador en si ocupa muy poco espacio (el repositorio declara 0.0 GB, coherente con decenas de MB de pesos LoRA); el coste real de inferencia lo determina el modelo base de 1,54B.
- VRAM estimada para el modelo base: aproximadamente 3,1 GB en FP16/BF16 solo para pesos, mas cache KV (que crece con la longitud de contexto); en torno a 1,6-2 GB en int8; en torno a 0,9-1,2 GB en cuantizacion de 4 bits. Cifras orientativas de calculo, no mediciones publicadas para este adaptador.
- Cabe en GPU consumer: si, en tarjetas de 6-8 GB (RTX 3050 6 GB, RTX 4060 8 GB, RTX 3060 12 GB) en 4 u 8 bits; en FP16 con contexto largo es recomendable partir de 8-12 GB.
- GPU de datacenter: A100, H100 o L40S estan sobredimensionadas para un modelo de este tamano; su uso solo se justifica por concurrencia alta o por servir muchos adaptadores simultaneamente.
- Despliegue: `transformers` + `peft` para cargar el adaptador sin fusionar; vLLM y TGI admiten adaptadores LoRA dinamicos; llama.cpp, Ollama y LM Studio requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

Datos de los comparadores tomados de sus model cards publicas; no verificados en este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-raft` | Adaptador sobre 1,54B | No disponible (base: 32.768) | No disponible | Gated, 0 descargas | Ajuste RAFT en italiano, sin benchmarks publicados |
| Qwen2.5-1.5B (base) | 1,54B | 32.768 (131.072 con YaRN) | Apache-2.0 | Publico | Modelo preentrenado, sin alineacion conversacional |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (131.072 con YaRN) | Apache-2.0 | Publico | Variante alineada con SFT y preferencias; referencia directa para comparar el efecto del ajuste RAFT |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 | Llama 3.2 Community License | Publico (gated) | Mayor ventana de contexto; licencia con restricciones de uso |
| Gemma 2 2B | ~2,6B | 8.192 | Gemma Terms of Use | Publico (gated) | Mas parametros pero contexto mucho menor; licencia con condiciones |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones, lo que anade friccion a la evaluacion y a la reproducibilidad.
- Licencia no especificada: sin licencia explicita del adaptador no es posible determinar si se permite uso comercial. La licencia Apache-2.0 del modelo base no cubre automaticamente los pesos derivados.
- Artefacto incompleto por si solo: solo contiene pesos de adaptador; cualquier despliegue requiere descargar el modelo base y conocer la configuracion exacta de carga (rango, alpha, modulos objetivo), que no esta documentada en la informacion disponible.
- Ausencia total de evaluacion: cero descargas, cero valoraciones y ningun benchmark publicado; no hay evidencia empirica de que el ajuste mejore al modelo base.
- Tamano limitado: 1,54B de parametros implican menor capacidad de razonamiento complejo, menor robustez en matematicas y codigo, y mayor sensibilidad a contextos largos con informacion redundante frente a modelos de 7B o mas.
- Riesgo de alucinacion: en escenarios RAG, los modelos pequenos ajustados con RAFT pueden igualmente generar respuestas no sustentadas cuando el contexto recuperado es irrelevante o incompleto, especialmente si no se aplica una comprobacion de citacion.
- Cobertura idiomatica declarada solo para italiano: el rendimiento fuera de ese idioma no esta documentado y podria degradarse respecto al modelo base.
- Nombre con marca temporal futura (2026-10-23) y metadatos atipicos: conviene verificar la integridad del repositorio y la procedencia de los pesos antes de cualquier uso en produccion.
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni seguridad del adaptador.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-raft
- Modelo base declarado: https://huggingface.co/Qwen/Qwen2.5-1.5B
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo ni demos.
