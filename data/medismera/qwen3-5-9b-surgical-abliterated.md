# medismera/Qwen3.5-9B-Surgical-Abliterated

## Resumen

Qwen3.5-9B-Surgical-Abliterated es una versión modificada de Qwen/Qwen3.5-9B publicada por el usuario medismera en HuggingFace. Se trata de un modelo de lenguaje causal al que se le ha aplicado una técnica conocida como "abliteración quirúrgica" (surgical refusal ablation): una intervención sobre las representaciones latentes del modelo para eliminar el subspace de rechazo (refusal subspace) presente en ciertas capas del transformer, con el objetivo de que el modelo no emita negativas predefinidas ni advertencias morales.

El problema que resuelve es el de la "alineación excesiva": muchos modelos de código abierto rechazan peticiones legítimas en contextos técnicos como auditoría de seguridad, red-teaming o análisis de redes, lo que resulta molesto para investigadores y auditores. Esta variante conserva, según su autor, el conocimiento factual, la precisión en código y el razonamiento lógico del modelo base gracias a restricciones ortogonales benignas y preservación de la norma de Frobenius durante la proyección.

Es relevante ahora porque forma parte de la tendencia de modelos "uncensored" comunitarios sobre bases potentes: con 9.653.104.368 parámetros (dato real de safetensors), pesos en safetensors y GGUF, licencia Apache 2.0 y compatibilidad con endpoints estándar de Transformers, es un candidato práctico para investigación en seguridad y uso local. El modelo base es Qwen/Qwen3.5-9B, con un backbone de atención híbrida de 8.95B parámetros según la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm) con backbone de atención híbrida, según la model card del autor |
| Parametros totales | 9.653.104.368 (dato real de safetensors) |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y GGUF, pero no se detallan las variantes de cuantización) |
| Idiomas soportados | Ingles (etiquetado oficial; el modelo base Qwen suele ser multilingue, pero no consta en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF (tamano total del repo: 25,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de lenguaje causal (causal-lm) basado en Qwen3.5-9B. La model card del autor menciona un "backbone de atención híbrida de 8.95B parámetros", lo que sugiere una combinación de mecanismos de atención (por ejemplo, atención completa y atenuada o similar), aunque no se detallan las capas exactas, cabezas de atención ni dimensiones ocultas. No es un modelo MoE según la información disponible.

Sobre el entrenamiento: no se ha publicado información sobre el número de tokens, composición del dataset ni procesos de post-entrenamiento (RLHF, DPO) del modelo base Qwen3.5-9B en la información proporcionada. La única modificación documentada es la abliteración quirúrgica: una proyección direccional sobre las representaciones latentes en capas críticas del transformer para eliminar el "subspace unificado de rechazo". Según el autor, esta operación se realizó bajo "restricciones ortogonales benignas" y con "preservación de la norma de Frobenius", con el objetivo de no degradar la sintaxis de programación, la corrección algorítmica ni la profundidad de razonamiento del modelo original. Esta técnica no añade datos de entrenamiento nuevos: es una intervención post-hoc sobre los pesos.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), con plantilla de chat si el tokenizador la incluye.
- Generacion y analisis de codigo: el autor afirma preservación completa de la sintaxis de programación y la corrección algorítmica respecto al modelo base.
- Razonamiento logico y matematico: se declara retención de la "profundidad de razonamiento" del modelo base, sin datos cuantitativos publicados.
- Cumplimiento sin rechazos: el modelo responde directamente a instrucciones tecnicas de ciberseguridad, auditoria de redes y escritura creativa sin emitir tokens de rechazo tipicos ("As an AI...", "I cannot fulfill this request...").
- No hay evidencia en la ficha de capacidades multimodales (vision, audio), tool calling, function calling ni modos de razonamiento explicitos (thinking mode).
- Capacidades multilingues: solo el ingles esta etiquetado oficialmente; el resto no disponible.

## Casos de uso

- Red-teaming y evaluacion de seguridad: investigadores pueden usar el modelo para probar defensas, generar escenarios de ataque sinteticos y auditar sistemas propios, ya que no bloquea instrucciones tecnicas ofensivas/defensivas.
- Auditoria de redes locales: generar scripts de auditoria con sockets crudos en Python u otros lenguajes, tal como ilustra el propio ejemplo de la model card, util para administradores de sistemas en entornos controlados.
- Investigacion academica sobre alineacion: estudiar el efecto de la abliteracion sobre representaciones latentes, comparando salidas del modelo base y el abliterado ante prompts sensibles.
- Escritura creativa sin restricciones: ficcion con contenido maduro o moralmente ambiguo donde los modelos alineados suelen interrumpir la narrativa con advertencias.
- Analisis de malware en sandbox: interpretacion y anotacion de codigo malicioso para equipos de inteligencia de amenazas que trabajan con muestras aisladas.
- Generacion de datasets de entrenamiento: crear pares instruccion-respuesta tecnicos sin rechazos para entrenar o evaluar otros modelos en dominios de seguridad.
- Prototipado local de asistentes tecnicos: gracias a los pesos GGUF, puede ejecutarse en local con llama.cpp u Ollama para flujos de trabajo privados donde no se desean filtros de contenido en tareas legítimas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma cualitativamente que se preservan los benchmarks de conocimiento factual, precision en codigo y razonamiento logico, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K ni otros).

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65B parametros en bfloat16, se necesitan en torno a 19-20 GB solo de pesos; en cuantizacion de 4 bits (GGUF Q4, tipico en repos de este tamano), aproximadamente 6-7 GB. Las cifras exactas por cuantizacion no estan detalladas en la ficha.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) cubre la inferencia en precision completa o media; para cuantizaciones de 4 bits bastan GPUs de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4070). No se requieren A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, tanto en 4 bits (GPUs de 8-12 GB) como en bf16 (RTX 3090/4090 de 24 GB). Tambien es viable en CPU con GGUF, con latencias mayores.
- Opciones de despliegue: Transformers (codigo de ejemplo incluido en la model card con torch_dtype=bfloat16 y device_map="auto"), llama.cpp y Ollama gracias a los GGUF, y cualquier servidor compatible con safetensors (vLLM, TGI, LM Studio). El repo esta etiquetado como endpoints_compatible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Caracteristica diferencial |
|---|---|---|---|---|
| medismera/Qwen3.5-9B-Surgical-Abliterated | 9,65B | safetensors, GGUF | Apache 2.0 | Abliteracion quirurgica del rechazo sobre Qwen3.5-9B |
| Qwen/Qwen3.5-9B (base) | no disponible (backbone de 8,95B segun la model card de la derivada) | no disponible | no disponible | Modelo original con alineacion estandar, conserva rechazos |
| Otras variantes abliteradas comunitarias (p. ej. abliteraciones de Qwen de tamano similar) | variable | safetensors, GGUF | variable | Mismas tecnicas de abliteracion, pero sobre bases distintas |

No se han publicado datos de rendimiento comparables entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Riesgo elevado de uso indebido: al eliminar el subspace de rechazo, el modelo no se niega a peticiones potencialmente daninas. Es responsabilidad del usuario cumplir la legislacion aplicable, tal como advierte la propia model card.
- Riesgo de alucinacion: no hay datos publicados; al tratarse de una intervencion sobre pesos sin reentrenamiento, el riesgo de alucinacion se presume similar al del modelo base, pero no disponible con cifras.
- La abliteracion puede degradar sutilmente el comportamiento del modelo (coherencia, seguridad de formato, estabilidad en generaciones largas) incluso cuando el autor afirma preservacion; conviene validar contra el modelo base antes de uso serio.
- Idioma: solo el ingles esta soportado oficialmente segun la etiqueta; el rendimiento en espanol no esta documentado.
- Contexto: la longitud de ventana de contexto no esta publicada en la ficha, lo que dificulta planificar aplicaciones con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y las marcas Qwen pueden tener consideraciones propias no documentadas aqui.
- Sin benchmarks verificables: las afirmaciones de preservacion de capacidad no estan respaldadas por cifras publicadas; no usar en produccion sin evaluacion propia.
- Contenido: el modelo puede generar contenido ofensivo, peligroso o ilegal si se le pide; no es adecuado para productos orientados a publico general sin capas de seguridad adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/medismera/Qwen3.5-9B-Surgical-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
