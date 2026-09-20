# M1ztyk/SAIGE-dpo-v5

## Resumen

SAIGE-dpo-v5 es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct mediante DPO (Direct Preference Optimization), publicado por el usuario M1ztyk en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una alineación por preferencias sobre una base ya instruida, con el objetivo de desplazar la distribución de respuestas hacia las preferencias recogidas en el conjunto de pares (elegido, rechazado) utilizado durante el entrenamiento. El modelo conserva por tanto la arquitectura, el tokenizador y la ventana de contexto del modelo base.

El entrenamiento se ha realizado con la librería TRL (versión 1.13.0) sobre Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2, y el repositorio se publica en formato safetensors compatible con la librería transformers. El autor no detalla en la model card ni el dataset de preferencias empleado, ni los hiperparámetros del entrenamiento (beta de DPO, tasa de aprendizaje, número de épocas), ni resultados de evaluación.

La relevancia de esta ficha es limitada pero concreta: se trata de un ejemplo típico de ajuste DPO reproducible sobre un modelo pequeño (3 000 M de parámetros) que cabe en GPU de consumo, útil para experimentar con pipelines de alineación por preferencias sin infraestructura dedicada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado información adicional sobre el modelo más allá de su propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM) con Grouped Query Attention y RoPE, heredada del modelo base |
| Parámetros totales | ~3 090 M (heredado del modelo base Qwen2.5-3B-Instruct) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32 768 tokens (heredada del modelo base; el autor no documenta modificaciones) |
| Tipos de cuantización | No disponible en la ficha del autor. El repositorio publica pesos en precisión completa (safetensors), por lo que admite cuantización externa a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible. El modelo base Qwen2.5 declara soporte multilingüe, pero el autor no especifica idiomas para este ajuste |
| Licencia | No disponible. La model card contiene el marcador literal `licence: license` sin concretar. El modelo base está sujeto a la Qwen Research License |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repositorio | 0,5 GB (dato declarado por HuggingFace; ver limitaciones) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Método de ajuste | DPO (Direct Preference Optimization) con TRL 1.13.0 |
| Compatibilidad declarada | `endpoints_compatible` (etiqueta del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B-Instruct: un transformer decoder-only de 3 090 M de parámetros con normalización RMSNorm, activación SwiGLU, embeddings ligados (tied embeddings) y atención con consultas agrupadas (GQA), que reduce el coste del caché KV frente a atención multi-cabeza completa. Según la documentación pública de Qwen, el modelo base se preentrenó sobre aproximadamente 18 billones de tokens y después se alineó con instruction tuning y preferencias; este repositorio no modifica esa arquitectura, solo los pesos resultantes del ajuste por preferencias.

El ajuste se ha realizado con DPO, el método descrito en Rafailov et al. (2023), que optimiza directamente el modelo de política frente a pares de respuestas preferidas y rechazadas sin entrenar un modelo de recompensa explícito ni usar RL con muestreo (PPO). El autor no publica el dataset de preferencias, el número de pasos, el valor de beta, la tasa de aprendizaje ni si hubo una fase adicional de SFT previa. Tampoco se documenta el uso de técnicas auxiliares como decodificación especulativa, atención lineal o mezcla de expertos. La única traza de entrenamiento es un panel externo alojado en Trackio, enlazado desde la model card.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base instruido.
- Razonamiento de propósito general y resolución de problemas de dificultad media, condicionado al tamaño de 3 000 M de parámetros.
- Generación de código y asistencia de programación a nivel de snippet y funciones cortas.
- Aritmética básica y problemas matemáticos de varios pasos, sin garantía de corrección en cadenas largas.
- Alineación por preferencias: el ajuste DPO busca mejorar el estilo, la utilidad percibida y el cumplimiento de instrucciones respecto al modelo base, aunque no hay evaluación publicada que lo cuantifique.
- Soporte de plantilla de chat conversacional (`role`/`content`) y uso directo con `transformers.pipeline`.
- Tool calling / function calling: no documentado en este repositorio. El modelo base Qwen2.5-Instruct sí lo soporta, pero no se ha verificado que el ajuste DPO lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Modo de pensamiento explícito (thinking), visión y audio: no disponibles. El modelo es exclusivamente texto.
- Capacidades multilingües: no documentadas para este ajuste.

## Casos de uso

- Experimentación con alineación por preferencias: sirve como caso de estudio reproducible de un pipeline DPO completo sobre un modelo de 3 000 M, útil para laboratorios que quieran comparar configuraciones de DPO (beta, dataset, número de épocas) sin coste elevado de cómputo.
- Asistente conversacional local en hardware de consumo: al ocupar aproximadamente 1,9 GB en cuantización Q4_K_M, puede desplegarse en portátiles con GPU de 8 GB o incluso en CPU con llama.cpp u Ollama, manteniendo conversaciones multi-turno.
- Prototipado rápido de productos de chat: la compatibilidad con `transformers.pipeline` y la etiqueta `endpoints_compatible` permiten montar una demo en HuggingFace Inference Endpoints o en un servicio propio con vLLM en minutos.
- Generación y revisión de código en entornos de desarrollo: puede integrarse en un plugin de editor para autocompletar funciones, escribir tests unitarios o explicar fragmentos, con la limitación de contexto de 32 768 tokens.
- Procesamiento por lotes de textos en español y otros idiomas: resumen, reformulación, extracción de información y clasificación mediante prompts, en escenarios donde la latencia importa más que la calidad punta.
- Evaluación comparativa de métodos de alineación: como punto de control intermedio para medir si DPO introduce regresiones en tareas específicas (código, matemáticas, seguimiento de instrucciones) frente al modelo base.
- Generación de datos sintéticos: producción de respuestas candidatas para construir nuevos pares de preferencias o ampliar datasets de evaluación en un bucle de anotación asistida.
- Educación y divulgación: despliegue en talleres o cursos donde se necesite un modelo alineado, ejecutable en una única GPU y con requisitos de memoria bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de M1ztyk/SAIGE-dpo-v5 no incluye ninguna tabla de evaluación (MMLU, GSM8K, HumanEval ni equivalentes), y tampoco se documenta una comparación directa contra el modelo base. El panel de Trackio enlazado podría contener métricas de entrenamiento (pérdida, recompensa implícita), pero no está descrito en el repositorio y no se ha podido verificar su contenido a partir de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 6,2 GB solo para pesos, más el caché KV.
- Caché KV estimado: aproximadamente 36 KB por token (36 capas, 2 cabezas KV, 128 dimensiones por cabeza, 2 bytes por valor). Con los 32 768 tokens de contexto completo suponen cerca de 1,2 GB adicionales. GQA reduce este valor de forma notable respecto a atención multi-cabeza.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,2 GB de pesos.
- VRAM estimada en cuantización de 4 bits (Q4_K_M): aproximadamente 1,8-2 GB de pesos.
- Cabe en GPU de consumo: sí. Con 4 bits es viable en tarjetas de 6-8 GB (RTX 3060, RTX 4060, RTX 2070). En fp16 requiere 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090).
- GPU de centro de datos: A100, H100, L40S o A10G son más que suficientes; quedan sobredimensionadas para un modelo de este tamaño salvo que se busque throughput muy alto con lotes grandes.
- Opciones de despliegue: transformers (nativo, formato safetensors), vLLM y TGI para servido con batching continuo, llama.cpp y Ollama previa conversión a GGUF, y endpoints gestionados de HuggingFace.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| M1ztyk/SAIGE-dpo-v5 | ~3 090 M | 32 768 tokens | No disponible | HuggingFace, safetensors | Ajuste DPO sin evaluación publicada |
| Qwen/Qwen2.5-3B-Instruct | ~3 090 M | 32 768 tokens | Qwen Research License | HuggingFace, safetensors y GGUF | Modelo base; referencia directa de comparación |
| Llama-3.2-3B-Instruct | ~3 200 M | 128 000 tokens | Llama 3.2 Community License | HuggingFace, safetensors y GGUF | Mayor ventana de contexto; licencia con restricciones para grandes despliegues |
| Phi-3.5-mini-instruct | ~3 800 M | 128 000 tokens | MIT | HuggingFace, safetensors y GGUF | Licencia permisiva; entrenado con foco en datos filtrados de alta calidad |
| Gemma-2-2B-it | ~2 600 M | 8 192 tokens | Gemma Terms of Use | HuggingFace, safetensors y GGUF | Menor tamaño y contexto más corto; licencia con condiciones de uso |

Los datos de los modelos comparables provienen de su documentación pública y deben verificarse antes de tomar decisiones de producción. No hay datos de rendimiento comparado para SAIGE-dpo-v5, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no determinada: la model card incluye el marcador `licence: license` sin especificar términos. Antes de cualquier uso comercial es imprescindible aclarar la licencia, teniendo en cuenta que el modelo base Qwen2.5-3B está sujeto a la Qwen Research License, que restringe determinados usos.
- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni análisis de regresiones. No se puede afirmar que el ajuste DPO mejore al modelo base en ninguna tarea concreta.
- Riesgo de degradación por sobreajuste a preferencias: los ajustes DPO sobre datasets pequeños o poco diversos pueden reducir la variedad de respuestas y penalizar tareas como matemáticas o código, un efecto documentado en la literatura de DPO.
- Riesgo de alucinación: inherente a los modelos de 3 000 M de parámetros; no hay medidas de mitigación documentadas ni evaluaciones de veracidad.
- Sesgos: no se documenta ninguna evaluación de sesgos de género, raza, religión o ideología. Al provenir de un modelo base con datos web a gran escala, es esperable que los herede.
- Contexto limitado a 32 768 tokens: suficiente para conversaciones y documentos medianos, insuficiente para análisis de repositorios completos o corpus extensos.
- Idiomas no especificados: el autor no declara cobertura lingüística. El comportamiento en castellano no está verificado y puede diferir del modelo base.
- Tool calling no verificado: aunque el modelo base Qwen2.5-Instruct soporta function calling, no hay confirmación de que el ajuste DPO lo preserve.
- Tamaño de repositorio incoherente: los 0,5 GB declarados son muy inferiores a los aproximadamente 6 GB esperables para 3 090 M de parámetros en fp16, lo que sugiere una subida incompleta, un error de metadata o una cuantización no documentada. Conviene verificar la integridad de los pesos antes de descargar y cargar el modelo.
- Fechas del repositorio anómalas: las marcas de creación y actualización (2026-09-19) son posteriores a la fecha de consulta habitual, lo que puede indicar un error de la plataforma.
- Sin soporte de visión, audio ni modo de razonamiento explícito: es un modelo exclusivamente de texto.
- Trazabilidad escasa: al no publicarse el dataset de preferencias ni los hiperparámetros, resulta imposible reproducir el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/M1ztyk/SAIGE-dpo-v5
- Modelo base Qwen/Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Panel de entrenamiento en Trackio: https://M1ztyk-saige-dpo-v5-contrast-test-trackio.hf.space?project=huggingface&runs=M1ztyk-1789855025&sidebar=collapsed
- Paper de DPO (Direct Preference Optimization): https://huggingface.co/papers/2305.18290
- Preprint de DPO en arXiv: https://arxiv.org/abs/2305.18290
- Repositorio de TRL: https://github.com/huggingface/trl

Nota: la búsqueda web asociada a esta ficha no devolvió ningún resultado relevante sobre el modelo; el único resultado obtenido era contenido no relacionado con el ámbito técnico. Todos los enlaces listados proceden de la model card y de las etiquetas del repositorio de HuggingFace.
