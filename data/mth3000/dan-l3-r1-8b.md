# MTH3000/DAN-L3-R1-8B

## Resumen

DAN-L3-R1-8B es un ajuste fino (fine-tune) del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicado por el usuario MTH3000 en HuggingFace. Se presenta explicitamente como un modelo "sin filtros" (uncensored), orientado a eliminar las restricciones de seguridad y alineacion del modelo original, con capacidad declarada de generar contenido NSFW, toxico y agresivo. El repositorio tiene 8.030.261.248 parametros (unos 8B), un tamano de 32,1 GB y esta etiquetado con terminos como UnfilteredAI, DAN, NSFW, Toxic-AI y not-for-all-audiences.

Tecnicamente es un transformer decoder-only de la familia Llama 3, heredado de la destilacion de DeepSeek-R1 sobre Llama-3.1-8B. La model card declara una longitud de contexto de 128.000 tokens y soporte unicamente de ingles. El modelo esta pensado, segun su autor, para investigacion sobre alineacion, pruebas de contenido en entornos sin moderacion y prototipado experimental, y el propio autor advierte de que no es apto para uso generalista.

Su relevancia es doble: por un lado, ilustra el fenomeno de los fine-tunes "abliterated"/DAN que eliminan el alineamiento de un modelo R1 destilado con razonamiento paso a paso; por otro, es un caso de estudio util para equipos de seguridad de IA que necesitan modelos deliberadamente no alineados como sujeto de pruebas (red-teaming, evaluacion de guardrails, generacion de datos adversarios).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3, base DeepSeek-R1-Distill-Llama-8B) |
| Parametros totales | 8.030.261.248 (aproximadamente 8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (segun la model card del autor) |
| Tipos de cuantizacion | Safetensors en precision completa; se anuncia GGUF en los tags del repositorio, pero la model card no desglosa niveles concretos: no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (declarada en el repositorio); el modelo base arrastra sus propias condiciones, ver seccion de limitaciones |
| Formato de pesos | Safetensors y GGUF (segun tags del repositorio); tamano total del repo 32,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de publicacion | 11 de octubre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3: transformer decoder-only con normalizacion RMSNorm pre-norm, activacion SwiGLU en la MLP, RoPE para codificacion posicional y atencion agrupada (GQA) con 32 capas y 8 cabezas KV en el modelo de 8B. Sobre esa base, DeepSeek-R1-Distill-Llama-8B incorpora el comportamiento de razonamiento en cadena de R1, con plantilla de chat que expone un bloque `` con el proceso de pensamiento antes de la respuesta final. El fine-tune DAN-L3-R1-8B mantiene esa plantilla y el ejemplo de la model card la usa explicitamente.

Respecto al entrenamiento, la model card indica que se partio del modelo destilado y se aplico un proceso de tres pasos: eliminacion de las restricciones de alineamiento de seguridad, ajuste de sesgo hacia "maxima expresion y minima restriccion" sobre un dataset descrito como "dialogos toxicos, conversaciones crudas de internet e interacciones de alta agresividad", y un refuerzo experimental para incrementar respuestas agresivas y provocadoras. No se proporcionan datos verificables sobre numero de tokens de entrenamiento, composicion exacta del dataset, hiperparametros, uso de RLHF/DPO ni metodologia reproducible; toda esa informacion es no disponible.

No se documenta ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal, SSM ni variantes hibridas). La unica singularidad es el efecto del desalineamiento deliberado sobre un modelo con modo de razonamiento.

## Capacidades

- Generacion de texto conversacional en ingles con modo de pensamiento explicito mediante bloques ``, heredado del destilado de R1.
- Razonamiento paso a paso (chain-of-thought) en tareas de logica y matematicas, en la medida en que lo conserva el modelo base destilado.
- Generacion de contenido explicito, NSFW y potencialmente toxico, presentada por el autor como capacidad principal.
- Adopcion de personajes ("dark persona") con respuestas agresivas o provocadoras segun el system prompt.
- Respuestas sin rechazo ante peticiones que otros modelos alineados bloquearian (comportamiento tipo DAN).
- Soporte de plantilla de chat con roles system/user/assistant y `apply_chat_template` de transformers.
- Capacidades multilingues: no disponibles; el modelo declara soporte unicamente de ingles.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente o multi-step tool use: no documentadas.
- Vision, audio o multimodalidad: no disponibles.

## Casos de uso

- Red-teaming de modelos y sistemas: usar el modelo como atacante o como fuente de prompts adversarios para medir la robustez de guardrails propios, clasificadores de toxicidad y filtros de moderacion en un entorno aislado.
- Evaluacion de alineamiento e investigacion en seguridad de IA: estudiar como se degrada el comportamiento de un modelo R1 destilado tras eliminar el alineamiento, comparando tasas de rechazo y tipos de respuesta frente al modelo base.
- Generacion de datasets adversarios para clasificadores: producir pares prompt-respuesta etiquetados como inseguros que sirvan para entrenar o validar moderadores de contenido, siempre con revision humana y trazabilidad.
- Pruebas de regresion de sistemas de moderacion: inyectar las salidas del modelo en un pipeline de moderacion y verificar que los filtros detectan contenido toxico, NSFW o instrucciones peligrosas antes de llegar al usuario final.
- Investigacion en psicologia computacional y analisis de discurso: analizar patrones retoricos de toxicidad, agresion y manipulacion generados sinteticamente, con fines academicos y bajo protocolo etico aprobado.
- Estudio de jailbreaks y taxonomias de ataques: documentar sistematicamente que tecnicas de prompting consiguen respuestas no restringidas, para construir defensas y heuristica de deteccion.
- Prototipado de personajes de ficcion para narrativa adulta: en entornos controlados y con audiencia verificada, generar dialogos o guiones con restricciones tematicas reducidas, asumiendo las obligaciones legales de etiquetado de contenido para adultos.
- Benchmarking de tecnicas de mitigacion: comparar tecnicas de intervencion (steering vectors, filtros de salida, system prompts correctivos, RLHF posterior) sobre un modelo deliberadamente desalineado.

Advertencia: estos casos de uso presuponen despliegue en entorno controlado, sin exposicion a usuarios generalistas y con supervision humana. El modelo no es apto para atencion al cliente, produccion de contenido publico ni sistemas que interactuen con menores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de DAN-L3-R1-8B no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica cuantitativa, y tampoco reporta evaluaciones de seguridad (tasas de rechazo, toxicidad medida, etc.). El modelo base DeepSeek-R1-Distill-Llama-8B si dispone de resultados publicados por su autor original, pero no son extrapolables a este fine-tune, ya que un proceso de desalineamiento de este tipo degrada tipicamente el rendimiento en tareas de instruccion y aumenta la tasa de salidas no conformes. No se debe asumir ninguna cifra de rendimiento sin medirla.

## Requisitos de hardware

Estimaciones orientativas de VRAM para inferencia (según el tamano de 8B, sin datos medidos por el autor):

| Precision | Peso aproximado de los pesos | VRAM recomendada (contexto corto) |
|---|---|---|
| FP16 / BF16 | ~16 GB | 20-24 GB (RTX 4090, A100 40GB, L40S) |
| INT8 / Q8_0 | ~8,5 GB | 12-16 GB (RTX 3060 12GB, RTX 4070, RTX 4080) |
| Q5_K_M | ~5,7 GB | 10-12 GB |
| Q4_K_M | ~4,9 GB | 8 GB o menos (RTX 3060 12GB, RTX 4060 Ti 16GB, GPUs de 8 GB con contexto reducido) |

- La memoria de la cache KV crece con el contexto: en FP16, para un modelo de 8B con GQA de esta familia, 128.000 tokens de contexto ocupan del orden de 16 GB adicionales de VRAM. Usar la ventana completa exigiria, por tanto, GPU de 40-80 GB o bien cuantizacion de la cache KV.
- Cabe en GPU de consumo: si, con cuantizaciones Q4/Q5 en GPUs de 8-12 GB, y en FP16 en RTX 4090 o RTX 3090 (24 GB) con contexto moderado.
- Opciones de despliegue: transformers (referencia de la model card), llama.cpp y Ollama para GGUF, vLLM o TGI para servido en FP16/BF16 con batching. El repositorio esta etiquetado como compatible con text-generation-inference y endpoints.
- Latencia y throughput estimados: no disponible. No hay datos publicados de tokens por segundo, TTFT ni comportamiento bajo batching concurrente para este modelo.
- Nota de seguridad en despliegue: si se sirve como endpoint, es imprescindible colocar un filtro de salida y autenticacion, dado que el modelo no incorpora ninguna salvaguarda interna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAN-L3-R1-8B | 8,03B | 128k (segun model card) | Desalineado deliberadamente (DAN/NSFW) | Apache 2.0 declarada (verificar condiciones del base) | HuggingFace, safetensors + GGUF |
| DeepSeek-R1-Distill-Llama-8B | 8B | 128k | Alineado, con modo de razonamiento | MIT declarada por DeepSeek (modelo derivado de Llama 3.1) | HuggingFace, safetensors |
| Llama-3.1-8B-Instruct | 8,03B | 128k | Alineado para uso general | Llama 3.1 Community License | HuggingFace, safetensors |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Alineado para uso general | Apache 2.0 | HuggingFace, safetensors + GGUF |

Comparativa de rendimiento en benchmarks: no disponible para DAN-L3-R1-8B, al no existir resultados publicados por el autor. Las cifras de parametros, contexto y licencias de los modelos alternativos corresponden a sus fichas publicas, pero se recomienda verificarlas en la fuente antes de citarlas en produccion.

## Limitaciones y advertencias

- Contenido NSFW y toxico por diseno: el modelo puede generar material explicito, ofensivo, agresivo o potencialmente danino sin ninguna salvaguarda interna.
- Sesgos conocidos: no hay auditoria publicada. El dataset descrito ("dialogos toxicos, conversaciones crudas de internet") apunta a sesgos de agresion, toxicidad y posiblemente sesgos demograficos heredados de datos web sin curacion.
- Riesgo de alucinacion: alto y no medido. No se han publicado evaluaciones de factualidad, y el desalineamiento de seguridad no mejora la veracidad.
- Limitacion de idioma: solo ingles declarado. El rendimiento en castellano u otros idiomas es no disponible y probablemente degradado.
- Limitacion de contexto: los 128k tokens son una declaracion de la model card; no hay verificacion independiente y el coste de memoria de la cache KV a esa longitud es muy elevado.
- Licencia: el repositorio declara Apache 2.0, pero el modelo base (DeepSeek-R1-Distill-Llama-8B) deriva de la familia Llama 3.1 y arrastra condiciones adicionales. Antes de cualquier uso comercial hay que verificar la licencia del modelo base y de la cadena de derivacion; la informacion disponible no permite confirmar compatibilidad.
- Idoneidad para produccion: muy baja. El autor indica explicitamente que es solo para investigacion en entornos controlados y declina responsabilidad por el uso.
- Riesgo legal y de cumplimiento: puede generar contenido que infrinja normativa de proteccion de menores, difamacion, incitacion al odio o normativa de plataformas (DSA, politicas de proveedores cloud). Su despliegue publico exige controles de acceso por edad y filtros de salida.
- Reproducibilidad: el proceso de entrenamiento no esta documentado con detalle (dataset, hiperparametros, fases de RL), lo que impide replicar o auditar el modelo.
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta, sin historial de la comunidad ni revision independiente.
- Recomendacion operativa: en produccion, tratar cualquier salida como no fiable y aplicar moderacion, registro de auditoria y aislamiento de red.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MTH3000/DAN-L3-R1-8B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio de DeepSeek-R1 (paper y pesos): https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Llama 3.1 (arquitectura base): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los enlaces recuperados corresponden a preguntas de Stack Overflow sin relacion con IA). No hay papers, blogs ni demos adicionales disponibles.
