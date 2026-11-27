# richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic

## Resumen

OLMo-2-0325-32B-Instruct-SOM-heretic es un ajuste fino del modelo allenai/OLMo-2-0325-32B-Instruct, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" o "abliterated" del modelo original de AI2: el autor ha aplicado técnicas de modificación de pesos orientadas a eliminar los mecanismos de rechazo y censura del modelo base, manteniendo la arquitectura y el conocimiento subyacente. El resultado es un modelo de 32.234.279.936 parámetros (32,2 B) diseñado para generación de texto conversacional sin las restricciones de seguridad típicas del modelo instruct original.

El modelo hereda la arquitectura transformer densa de la familia OLMo 2 de Allen Institute for AI, un proyecto de IA totalmente abierta que publica pesos, datos de entrenamiento y código. OLMo-2-0325-32B-Instruct es la variante instruct de 32 B del modelo presentado en marzo de 2025, entrenada sobre el corpus Dolma y ajustada con datos de instrucciones y preferencias. Este derivado conserva esa base pero modifica el comportamiento de alineación.

La relevancia de esta ficha es doble: por un lado, documenta una variante no oficial que circula en el ecosistema abierto y que los desarrolladores pueden encontrar al buscar modelos "uncensored"; por otro, advierte de que se trata de un derivado de terceros, con acceso restringido (gated), sin métricas de evaluación publicadas y con implicaciones éticas y de cumplimiento relevantes para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia OLMo 2, decoder-only) |
| Parametros totales | 32.234.279.936 (32,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base OLMo-2-0325-32B-Instruct soporta contexto largo, pero no se confirma el valor exacto para este derivado) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser safetensors en BF16/FP16 es cuantizable a GGUF, AWQ, GPTQ mediante herramientas estandar |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (etiqueta del repo); el modelo base es de licencia abierta |
| Formato de pesos | safetensors (transformers) |
| Tamano del repo | 64,5 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Descargas | 328 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 2, un transformer decoder-only denso de 32 B parámetros desarrollado por AI2. La familia OLMo 2 se caracteriza por un entrenamiento completamente abierto: pesos, datos (corpus Dolma), recetas y checkpoints intermedios se publican. El modelo base allenai/OLMo-2-0325-32B-Instruct fue entrenado con un pipeline que incluye preentrenamiento sobre trillones de tokens y posteriores fases de ajuste supervisado (SFT) y optimización de preferencias (DPO/RLVR), según la documentación de AI2 referenciada en los papers arxiv:2501.00656 y arxiv:2411.15124.

Sobre este derivado concreto no se dispone de detalles del proceso de modificación en la información proporcionada. La etiqueta "heretic" y "abliterated" indica que el autor aplicó técnicas de edición de pesos (típicamente abliteration, que proyecta fuera del espacio de activaciones las direcciones asociadas a rechazos) para reducir la tasa de respuestas negativas del modelo. El dataset referenciado en las etiquetas (allenai/RLVR-GSM-MATH-IF-Mixed-Constraints) sugiere que el ajuste pudo apoyarse en datos de razonamiento matemático y seguimiento de instrucciones, aunque no se especifica la composición exacta ni el número de tokens de entrenamiento de este derivado. No hay información sobre si se aplicó RLHF, DPO o decodificación especulativa específica en esta variante.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y resolución de problemas matemáticos (herencia del ajuste RLVR del modelo base).
- Generación y explicación de código, aunque sin datos de benchmark específicos para este derivado.
- Seguimiento de instrucciones (instruction following), heredado del modelo instruct base.
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo original, por diseño de la modificación.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada; el modelo base OLMo 2 Instruct incluye capacidades de instrucción, pero no se detalla el soporte de herramientas en este derivado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Multilingüismo: limitado a inglés según la etiqueta de idiomas del repo.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve para estudiar cómo la abliteration afecta a la tasa de rechazos, la calidad de las respuestas y los sesgos, comparándolo con el modelo base sin modificar en experimentos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas sensibles que el modelo original rechazaría, en entornos donde el operador asume la responsabilidad del contenido.
- Evaluación de robustez de filtros: probar sistemas de moderación y clasificadores de contenido frente a un modelo que produce respuestas que el modelo alineado evita, para medir la cobertura de dichos filtros.
- Red teaming de aplicaciones: simular ataques y prompts adversarios contra pipelines de producción para identificar puntos de fallo antes de desplegar modelos alineados.
- Experimentos académicos de edición de pesos: replicar o comparar técnicas de abliteration sobre un modelo de 32 B con arquitectura y datos completamente abiertos, lo que facilita la reproducibilidad.
- Generación de datos sintéticos para ajuste: producir corpus de respuestas en dominios donde el modelo base es demasiado conservador, con revisión humana posterior obligatoria.
- Fine-tuning posterior para dominios especializados: usar el modelo como base para tareas de dominio (legal, médico, técnico) donde se necesita un punto de partida menos restrictivo, asumiendo las advertencias de licencia y sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni otras métricas para este derivado, y no se dispone de evaluaciones independientes. Cualquier cifra de rendimiento del modelo base OLMo-2-0325-32B-Instruct no es directamente extrapolable a esta variante modificada, ya que la abliteration puede degradar capacidades de razonamiento y seguimiento de instrucciones.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 64 GB solo para pesos, más overhead de KV cache; se recomienda al menos 80 GB para contexto moderado.
- VRAM en cuantización de 8 bits: aproximadamente 32-36 GB, viable en una A100 40 GB o dos RTX 4090.
- VRAM en cuantización de 4 bits (GGUF Q4): aproximadamente 18-22 GB, viable en una RTX 4090 (24 GB) o RTX 3090 con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; RTX 4090, RTX 3090, L40S para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en RTX 4090/3090; en 8 bits requiere dos GPU de consumo o una GPU profesional.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM, TGI, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic | 32,2 B | No disponible | Apache 2.0 | Gated | Derivado abliterated no oficial |
| allenai/OLMo-2-0325-32B-Instruct | 32,2 B | No disponible en esta ficha | Apache 2.0 | Abierto | Modelo base oficial, alineado |
| Meta Llama 3.3 70B Instruct | 70 B | 128 K (según documentación de Meta) | Llama Community License | Gated | Mayor tamaño, licencia no Apache |
| Qwen2.5 32B Instruct | 32,7 B | 128 K (según documentación de Qwen) | Apache 2.0 | Abierto | Alternativa de tamaño similar con contexto largo documentado |

La comparativa con Llama 3.3 70B y Qwen2.5 32B se ofrece como referencia de categoría; no se dispone de evaluaciones comparativas directas con este derivado. Para el modelo base OLMo 2 se recomienda consultar la documentación oficial de AI2, que sí publica resultados de benchmarks.

## Limitaciones y advertencias

- La modificación "heretic/abliterated" degrada intencionadamente la alineación de seguridad; el modelo puede producir contenido dañino, ilegal o sexualmente explícito sin las salvaguardas del original.
- No hay benchmarks publicados: se desconoce la magnitud de la degradación en razonamiento, matemáticas y código respecto al modelo base.
- Riesgo elevado de alucinación, agravado por la falta de evaluaciones independientes.
- Sesgos: hereda los sesgos del corpus Dolma y del ajuste del modelo base, sin que se documenten mitigaciones adicionales en este derivado.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia: Apache 2.0 según la etiqueta del repo, pero al ser un derivado de terceros conviene verificar la trazabilidad y las condiciones del modelo base antes de uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para despliegues automatizados.
- Autoría no oficial: no es un modelo de AI2 ni está respaldado por la organización; el mantenimiento y la documentación dependen de un único publicador.
- Uso en producción: requiere revisión legal y de cumplimiento, filtros de salida propios y auditoría de contenido; no se recomienda como sustituto directo de un modelo alineado en aplicaciones orientadas al usuario final.
- Sin soporte confirmado de tool calling ni de contexto largo específico para este derivado.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Paper OLMo 2 (arxiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo 2 (arxiv:2411.15124): https://arxiv.org/abs/2411.15124
- Referencia arxiv:2611.17846 (citada en las etiquetas del repo): https://arxiv.org/abs/2611.17846
- Dataset RLVR-GSM-MATH-IF-Mixed-Constraints: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
