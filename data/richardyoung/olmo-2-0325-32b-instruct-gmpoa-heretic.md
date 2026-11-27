# richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic

## Resumen

OLMo-2-0325-32B-Instruct-GMPOA-heretic es un ajuste fino del modelo allenai/OLMo-2-0325-32B-Instruct, desarrollado por el usuario richardyoung y publicado en Hugging Face. Se trata de una variante "heretic" (también etiquetada como uncensored, decensored y abliterated), es decir, un modelo al que se le han aplicado técnicas de modificación de pesos para reducir los comportamientos de rechazo y las restricciones de seguridad del modelo original. El modelo base, OLMo 2 32B Instruct, es un transformer denso de 32.234.279.936 parámetros desarrollado por el Allen Institute for AI (Ai2) como parte de su familia de modelos completamente abiertos.

La relevancia de esta ficha radica en que combina la transparencia del ecosistema OLMo (pesos, datos y recetas publicados por Ai2) con una modificación de alineamiento orientada a eliminar rechazos, lo que la hace útil para investigación sobre seguridad, evaluación de sesgos y estudios de "abliteration", pero problemática para despliegues en producción orientados al público general. El autor cita los papers arXiv:2501.00656, arXiv:2411.15124 y arXiv:2611.17846 en las etiquetas del repositorio, aunque no se detalla en la información disponible qué metodología concreta (GMPOA) se aplicó ni qué hiperparámetros se usaron.

El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. El modelo está pensado exclusivamente para inglés según la etiqueta de idioma, y se distribuye bajo licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia OLMo 2, decoder-only) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base OLMo 2 32B Instruct soporta 4096 tokens nativos, ampliables; verificar en la model card del autor) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el formato publicado es safetensors en precision completa (probablemente bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del OLMo 2 32B Instruct de Ai2: un transformer decoder-only denso con normalización RMSNorm no parametrizada, atención con RoPE y mejoras introducidas en la segunda generación de OLMo (entre ellas, normalización de la salida de la atención y del bloque feed-forward, y una reordenación de las capas de normalización documentada en el paper arXiv:2412.04454, citado indirectamente por la familia OLMo 2). El modelo base fue entrenado desde cero por Ai2 sobre un corpus abierto (Dolma) y posteriormente sometido a un pipeline de instrucción y preferencias (SFT, DPO y RLVR) descrito en el paper OLMo 2.

Sobre esta base, richardyoung aplica un ajuste etiquetado como "GMPOA" y "heretic", presumiblemente una variante de las técnicas de abliteration (proyección ortogonal de la dirección de rechazo en los pesos) combinada con un ajuste fino sobre el dataset allenai/RLVR-GSM-MATH-IF-Mixed-Constraints. La información disponible no especifica el número de tokens de ajuste, la composición exacta del dataset, ni si se aplicó RLHF o DPO en esta etapa. Tampoco se documenta la innovación técnica concreta que distingue "GMPOA" de otras recetas de decensurado, por lo que cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct base.
- Razonamiento matemático y resolución de problemas GSM/MATH, reforzado por el dataset RLVR-GSM-MATH-IF-Mixed-Constraints usado en el ajuste.
- Seguimiento de instrucciones (instruction following, IF) según la composición del dataset de ajuste.
- Comportamiento "decensored": reducción de rechazos ante peticiones que el modelo base declinaría, incluyendo contenido sensible.
- Soporte de conversaciones multi-turno mediante plantilla de chat de OLMo 2.
- Compatibilidad con endpoints de Hugging Face (etiqueta endpoints_compatible) y con la librería transformers.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Investigación sobre seguridad y alineamiento: el modelo permite estudiar cómo la abliteration afecta a las tasas de rechazo, la utilidad y la coherencia en comparación con el OLMo 2 32B Instruct original, sirviendo como caso control en experimentos de mechanistic interpretability.
- Evaluación de sesgos y toxicidad: al eliminar las capas de rechazo, expone de forma más directa los sesgos latentes del corpus de entrenamiento, lo que facilita su medición con harnesses como ToxiGen o RealToxicityPrompts en entornos de laboratorio.
- Red teaming y generación de datos adversarios: útil para producir ejemplos de prompts y respuestas que alimenten clasificadores de seguridad o filtros de contenido en pipelines de moderación.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas que el modelo base rechazaría, en contextos editoriales controlados.
- Experimentos de ajuste fino posterior: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para investigaciones que requieran un modelo de 32B parámetros sin sesgo de rechazo, por ejemplo en estudios de DPO o RLHF comparativos.
- Benchmarking de técnicas de decensurado: comparar GMPOA/heretic frente a otras recetas de abliteration sobre la misma base OLMo 2 32B para medir degradación de capacidades (MMLU, GSM8K) y reducción de rechazos.
- Docencia y divulgación: ilustrar en cursos de IA los trade-offs entre alineamiento, utilidad y seguridad usando un modelo completamente abierto y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de rechazo (refusal rate) en el momento de redactar esta ficha, y las etiquetas del repositorio solo referencian los papers del modelo base sin aportar cifras propias.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 64 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren 2× A100 40GB, 1× A100 80GB, 1× H100 80GB o 2× RTX 4090 24GB con tensor parallelism.
- Cuantización a 8 bits (GPTQ/AWQ): ~32-35 GB, cabe en una RTX 5090 32GB (ajustado) o A100 40GB.
- Cuantización a 4 bits (GGUF Q4_K_M): ~18-20 GB, cabe en una RTX 4090 24GB o RTX 3090 24GB con contexto moderado.
- No cabe en GPUs consumer de 8-16 GB ni siquiera en 4 bits con contexto largo.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para serving de alto throughput, llama.cpp/Ollama para GGUF (requiere conversión previa, no se distribuyen GGUF en el repo), y endpoints de Hugging Face (etiqueta endpoints_compatible).
- Latencia y throughput: no disponibles en la información proporcionada; para un denso de 32B en bf16 sobre H100 se puede esperar del orden de decenas de tokens por segundo por petición, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic | 32,2B | no disponible | Apache 2.0 | Ajuste heretic/abliterated, acceso gated, solo ingles |
| allenai/OLMo-2-0325-32B-Instruct | 32,2B | 4096 nativo (ampliable) | Apache 2.0 | Modelo base alineado, pesos y datos abiertos, acceso abierto |
| Qwen2.5-32B-Instruct | 32,5B | 131.072 | Apache 2.0 | Alternativa densa de tamano similar, multilingue, ampliamente adoptada |
| Mistral-Small-24B-Instruct | 23,6B | 32.768 | Apache 2.0 | Algo menor, buen equilibrio rendimiento/hardware, multilingue |

La comparación de rendimiento cuantitativo no está disponible porque este ajuste no publica benchmarks propios; en la práctica, la abliteration suele degradar ligeramente métricas de razonamiento y aumentar la tasa de respuestas dañinas, por lo que se recomienda medir antes de cualquier uso serio.

## Limitaciones y advertencias

- Modelo "decensored"/abliterated: elimina deliberadamente los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o sexualmente explícito; no apto para aplicaciones orientadas al público general sin filtros externos.
- Riesgo elevado de alucinación y de respuestas factualmente incorrectas, agravado por la modificación de pesos sobre un modelo base de 32B que ya presenta este problema.
- Sesgos del corpus Dolma y del dataset de ajuste RLVR-GSM-MATH-IF-Mixed-Constraints, sin documentación de mitigación específica en esta variante.
- Solo soporta inglés según la etiqueta de idioma; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada en la información disponible; conviene verificar en la model card antes de asumir 4096 tokens o más.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el contenido generado puede violar términos de servicio de plataformas o legislación sobre contenido dañino; la responsabilidad recae en el desplegador.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a pipelines automatizados.
- Sin benchmarks publicados: no hay evidencia de que las capacidades del modelo base se conserven tras el ajuste heretic.
- El repositorio tiene muy poca tracción (328 descargas, 0 likes) y un único mantenedor, por lo que el soporte y las actualizaciones no están garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Paper OLMo 2 (arXiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo (arXiv:2411.15124): https://arxiv.org/abs/2411.15124
- Paper referenciado en etiquetas (arXiv:2611.17846): https://arxiv.org/abs/2611.17846
- Repositorio OLMo de Ai2: https://github.com/allenai/OLMo
