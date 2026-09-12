# Jeesup/svdsafety_l2_remove50_whiten_protk8

## Resumen

`svdsafety_l2_remove50_whiten_protk8` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup, que forma parte de un estudio sobre cómo la compresión mediante SVD-LLM degrada el comportamiento de seguridad de un modelo de chat y qué regla de selección de componentes restaurados repara mejor ese daño. No es un modelo de propósito general: la propia model card lo describe como un artefacto de investigación, una celda concreta de una rejilla de experimentos que cruza reglas de selección con presupuestos de restauración.

El repositorio contiene 6.738.415.616 parámetros en formato safetensors (unos 6,74 mil millones), ocupa 13,5 GB y se distribuye a través de la librería transformers con pipeline de `text-generation`. Está etiquetado como compatible con text-generation-inference y endpoints, e incluye las etiquetas `svd`, `compression`, `safety` e `interpretability`. Acumula 0 descargas y 0 "likes", por lo que no existe validación comunitaria alguna sobre su comportamiento real.

Su relevancia es metodológica más que práctica: permite estudiar la relación entre compresión y alineación de seguridad. La model card advierte explícitamente de que varias ramas de la rejilla están degradadas deliberadamente en seguridad respecto a Llama-2-7b-chat, que la compresión por sí sola eleva la tasa de éxito de ataques y que el objetivo del trabajo es cuantificar ese efecto. Existe además una discrepancia no resuelta entre el nombre del repositorio (`remove50_whiten_protk8`, que sugiere eliminar un 50 % y selección "whiten" con k=8) y los valores declarados en la tabla de procedencia (0,00 % de parámetros eliminados, 0,000 % de presupuesto de restauración, regla `unknown`, 0 componentes restaurados y 0 intercambiados).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2); derivado de Llama-2-7b-chat |
| Parámetros totales | 6.738.415.616 (≈6,74 B), dato de safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama-2-7b-chat emplea 4096 tokens, dato no confirmado para este derivado) |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors, sin variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 2 7B chat: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con caché de clave/valor. Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión que descompone en valores singulares las matrices de pesos y trunca componentes de forma consciente del error de truncamiento. Según la model card, a este ejemplar concreto no se le han eliminado parámetros (0,00 %), no se le ha asignado presupuesto de restauración (0,000 %), no se restauran componentes y no se intercambia ninguno, con semilla 42. La regla de selección aparece como `unknown`.

No se documentan en la información disponible ni el volumen de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste posterior: al tratarse de un derivado por compresión, el entrenamiento relevante es el del modelo base, no detallado aquí. Tampoco se especifican innovaciones adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. La innovación del artefacto es metodológica: explorar qué regla de selección de componentes SVD restaura mejor el comportamiento de seguridad perdido por la compresión, con marcado de los componentes restaurados e intercambiados y uso de "whitening" en la selección según sugiere el nombre del repositorio.

## Capacidades

- Generación de texto conversacional: heredada nominalmente del modelo base Llama-2-7b-chat, pero no verificada ni documentada para este checkpoint concreto.
- Razonamiento, matemáticas y generación de código: no documentado; la model card no publica evaluaciones de ningún tipo.
- Tool calling / function calling: no documentado. Llama-2-7b-chat no incorpora un protocolo nativo de llamada a herramientas verificado; cualquier uso en ese sentido requeriría prompting manual y no hay garantía de que sobreviva al proceso de compresión.
- Soporte de agentes y razonamiento multi-paso: no documentado; la model card desaconseja explícitamente su uso como asistente desplegable.
- Capacidades multilingües: no disponibles; el campo de idiomas aparece vacío en los metadatos.
- Capacidades especiales (modo thinking, visión, audio): ninguna. Es un modelo exclusivamente de texto, sin torre visual ni de audio.
- Uso previsto real: servir como sujeto experimental para medir la degradación de seguridad y la pérdida de utilidad bajo compresión SVD, y comparar reglas de selección de componentes entre las celdas de la rejilla.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como una celda más de la rejilla de reglas de selección y presupuestos para medir la curva de compromiso entre tasa de éxito de ataques y calidad de generación.
- Evaluación de seguridad de modelos alineados: someter el checkpoint a baterías de red-teaming (por ejemplo, conjuntos de prompts adversarios) y comparar la tasa de éxito de ataques frente a Llama-2-7b-chat sin comprimir, tal como propone la model card.
- Auditoría de artefactos publicados: reconstruir la discrepancia entre el nombre del repositorio (`remove50_whiten_protk8`) y los valores de procedencia declarados para determinar qué transformación se aplicó realmente a los pesos.
- Reproducibilidad de estudios de SVD-LLM: verificar si la semilla 42, el presupuesto de restauración declarado y la regla `unknown` producen los mismos resultados en una réplica del pipeline.
- Análisis de interpretabilidad de pesos comprimidos: inspeccionar las matrices descompuestas y los componentes marcados como restaurados o intercambiados para localizar qué subespacios de pesos están asociados al comportamiento de rechazo de peticiones dañinas.
- Docencia y divulgación técnica: ilustrar en un aula o artículo cómo una técnica de compresión aparentemente neutra puede alterar propiedades de alineación que no están codificadas en las métricas de perplejidad.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún escenario orientado a usuario final: la propia model card lo desaconseja y el modelo no aporta ninguna ventaja funcional frente a su base sin comprimir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MT-Bench ni métricas de seguridad cuantificadas. La búsqueda web asociada a este modelo no devolvió resultados técnicos: los enlaces recuperados corresponden a guías turísticas de Banff (Tripadvisor, Banff & Lake Louise Tourism, Authentik Canada) y son completamente ajenos al modelo, por lo que no aportan datos aprovechables.

## Requisitos de hardware

Estimaciones a partir del recuento real de parámetros (6.738.415.616) y del tamaño del repositorio (13,5 GB); no proceden de la model card, que no documenta requisitos:

- Inferencia en fp16/bf16: aproximadamente 13,5 GB solo de pesos, más caché KV y activaciones; en la práctica entre 15 y 17 GB de VRAM según longitud de secuencia y tamaño de lote.
- Inferencia en int8: en torno a 7-8 GB de VRAM.
- Inferencia en 4 bits: en torno a 4-5 GB de VRAM, aunque esta ruta exige cuantizar el checkpoint uno mismo, ya que no se publican pesos GGUF, AWQ ni GPTQ.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o A6000 sin problemas, con margen para lotes grandes y contexto largo.
- GPU de consumo: cabe en fp16 en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB, con poco margen); una RTX 3080 de 10 GB o una RTX 3060 de 12 GB requieren cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM y TGI (la etiqueta `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con endpoints gestionados), además de transformers con `accelerate`. Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, tarea no facilitada por el autor.
- Latencia y throughput: no disponibles; no hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svdsafety_l2_remove50_whiten_protk8` | 6,74 B | No disponible | Llama 2 Community License | safetensors | Repositorio público, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6,74 B | 4096 tokens | Llama 2 Community License | safetensors | Ampliamente desplegado y validado |
| Otras celdas de la misma rejilla del autor | No disponible | No disponible | Llama 2 Community License | safetensors | Públicas, sin métricas publicadas |
| Alternativas generalistas de ~7-8 B (Mistral 7B Instruct, Llama 3.1 8B Instruct, Qwen2.5 7B Instruct) | 7-8 B | 8k-128k según modelo | Apache 2.0 o licencias comunitarias propias | safetensors y GGUF | Muy extendidas, con benchmarks públicos |

La comparación con alternativas generalistas se ofrece solo como referencia de categoría; no se dispone de resultados de benchmarks de este checkpoint que permitan una comparación de rendimiento rigurosa. Frente a su propio modelo base, la diferencia relevante no es de capacidad sino de estado: este artefacto es una variante experimental potencialmente degradada en seguridad.

## Limitaciones y advertencias

- Artefacto de investigación, no desplegable: la model card indica explícitamente que "no es un modelo de chat de propósito general" y que debe tratarse como sujeto experimental.
- Seguridad degradada de forma deliberada en varias ramas del estudio: la compresión eleva la tasa de éxito de ataques, y este repositorio pertenece a esa rejilla, por lo que no se debe asumir un comportamiento de rechazo equivalente al de Llama-2-7b-chat.
- Discrepancia de procedencia sin resolver: el nombre del repositorio sugiere eliminar un 50 % de componentes con selección "whiten" y protección k=8, mientras que la tabla de la model card declara 0,00 % de parámetros eliminados, 0,000 % de presupuesto de restauración y 0 componentes restaurados. Cualquier uso analítico debe auditar primero los pesos reales.
- Riesgo de alucinación: no evaluado en la información disponible; se hereda el riesgo típico del modelo base y puede verse agravado por la compresión.
- Idiomas y contexto: el campo de idiomas está vacío y no hay confirmación del contexto efectivo tras la compresión.
- Restricciones de licencia: Llama 2 Community License, con sus cláusulas habituales (uso comercial permitido con condiciones, obligaciones de atribución "Built with Llama 2", restricciones de uso recogidas en `USE_POLICY.md` y umbral de usuarios activos mensuales que obliga a solicitar licencia a Meta).
- Ausencia de validación externa: 0 descargas y 0 "likes", sin issues ni discusiones públicas que permitan contrastar su comportamiento.
- Riesgo de sesgos: no documentado en la información disponible; no hay evaluación de sesgos ni de toxicidad.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/Jeesup/svdsafety_l2_remove50_whiten_protk8
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf

Nota: la búsqueda web realizada no devolvió ningún enlace relacionado con este modelo ni con SVD-LLM; los resultados obtenidos eran guías turísticas de Banff, sin relación con el contenido de esta ficha. No se incluyen enlaces a papers, repositorios de código ni demos porque no aparecen en la información proporcionada.
