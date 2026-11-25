# m123yt/Attestor-4.6

## Resumen

Attestor-4.6 es un modelo de lenguaje de 4.205.758.976 parámetros (aproximadamente 4,2 mil millones) especializado en ciberseguridad, desarrollado por el usuario m123yt y publicado en Hugging Face bajo licencia Apache 2.0. Se construye a partir de Qwen/Qwen3.5-4B, sobre una versión del modelo base a la que ya se le había aplicado abliteration (eliminación de la dirección de rechazo) y que posteriormente fue afinada en el dominio de la seguridad informática: pentesting, análisis de exploits, evaluación de vulnerabilidades y seguridad defensiva.

El modelo emplea la arquitectura Qwen3.5, un transformer híbrido de 32 capas que combina atención lineal con atención completa cada cuarta capa, con un tamaño oculto de 2.560, 16 cabezas de atención (4 cabezas KV con GQA) y un vocabulario de 248.320 tokens. Hereda del modelo base una ventana de contexto de 262.144 tokens, lo que lo hace adecuado para analizar grandes volúmenes de código, logs o documentación técnica en una sola pasada.

Su relevancia actual radica en dos factores: por un lado, ofrece capacidades de dominio específico en ciberseguridad en un tamaño que cabe en una única GPU de consumo (8 GB o más de VRAM en FP16, según el autor); por otro, al estar abliterado, evita los rechazos que los modelos alineados convencionalmente aplican a consultas sobre explotación, malware o análisis ofensivo, lo que resulta útil en entornos de investigación autorizada y formación. El modelo está etiquetado únicamente para inglés y declarado como text-generation, sin resultados de benchmarks publicados en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa cada 4 capas), estilo Qwen3.5 |
| Parametros totales | 4.205.758.976 (≈4,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el autor solo documenta FP16; el repositorio contiene safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); tamaño del repo 8,4 GB |

## Arquitectura y entrenamiento

Attestor-4.6 se apoya en la arquitectura de Qwen3.5-4B: 32 capas con un esquema de atención híbrido que intercala atención lineal con atención completa cada cuarta capa, 2.560 dimensiones ocultas, 16 cabezas de atención y 4 cabezas KV bajo Grouped Query Attention (GQA), con un vocabulario de 248.320 tokens. El autor indica que el modelo parte de una versión ya abliterada del modelo base y que posteriormente se afinó con datos de ciberseguridad, incluyendo pentesting, análisis de exploits, evaluación de vulnerabilidades y seguridad defensiva. El formato de entrenamiento es conversacional y compatible con la plantilla de chat de Qwen3.5.

La innovación técnica más destacable es la abliteration direccional: se elimina quirúrgicamente la dirección de rechazo del modelo base mediante ajustes de sesgo, cuyos valores quedan almacenados en el fichero `surgery_biases.pkl` incluido en el repositorio. El autor no documenta el número de tokens de entrenamiento, la composición exacta del dataset de afinado ni si se emplearon técnicas de RLHF o DPO; estos datos figuran como no disponibles. Tampoco se especifica si se aplicó decodificación especulativa u otras optimizaciones de inferencia más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat compatible.
- Conocimiento de dominio en ciberseguridad: pentesting, análisis de exploits, evaluación de vulnerabilidades y seguridad defensiva.
- Red team y operaciones ofensivas autorizadas: el modelo no aplica rechazos ante consultas sobre técnicas de ataque, gracias a la abliteration.
- Análisis de código orientado a seguridad: revisión de código, auditoría y detección de patrones vulnerables.
- Soporte de contexto largo de hasta 262.144 tokens, útil para procesar repositorios, logs o documentación extensa.
- Formación y competiciones CTF: explicación de técnicas y resolución de retos.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Pentesting autorizado: el modelo puede generar y explicar técnicas de explotación, comandos y vectores de ataque en el marco de un engagement con permiso escrito, sin los rechazos que aplicarían modelos alineados convencionalmente.
- Revisión de código orientada a seguridad: se puede alimentar un fichero o fragmento de código (hasta 262.144 tokens de contexto) y solicitar un análisis de vulnerabilidades, patrones inseguros y recomendaciones de mitigación.
- Formación en ciberseguridad: instructores pueden usarlo para generar explicaciones didácticas de ataques y defensas, incluidos ejemplos de SQL injection, XSS o escalada de privilegios, con la salvedad de que el contenido debe revisarse.
- Resolución de retos CTF: dado un enunciado o fragmento de binario o script, el modelo puede proponer hipótesis y pasos de resolución, aprovechando su conocimiento de técnicas ofensivas.
- Análisis de logs y alertas: con la ventana de contexto extendida, se pueden volcar logs de un incidente y pedir un resumen de indicadores de compromiso o una hipótesis de cadena de ataque.
- Asistencia en redacción de informes de vulnerabilidad: generación de descripciones técnicas, vectores CVSS y recomendaciones de remediación a partir de notas del analista.
- Laboratorios y entornos de investigación aislados: despliegue con vLLM o Docker para experimentación con técnicas ofensivas en un sandbox sin exposición a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card declara el modelo Attestor-4.6 con una lista de resultados vacía, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de ciberseguridad (por ejemplo, CyberSecEval) aportados por el autor.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 8,4 GB solo para los pesos, más overhead de activaciones y caché KV; el autor indica que funciona en una GPU de consumo con 8 GB o más de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para FP16 con contexto largo; A100 o H100 para despliegues con contexto de 262.144 tokens y concurrencia. En GPUs de 8 GB (RTX 3070, RTX 4060 Ti) cabe en FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas de 8 GB o más en FP16.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve`), Docker Model Runner (`docker model run hf.co/m123yt/Attestor-4.6`). No se documentan instrucciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Attestor-4.6 | ≈4,2 B | 262.144 | Apache 2.0 | Ciberseguridad, abliterado | Hugging Face (53 descargas) |
| Qwen/Qwen3.5-4B (base) | ≈4 B | 262.144 | Apache 2.0 (según modelo base) | Generalista, alineado | Hugging Face |
| Alternativas de ciberseguridad de 4B abliteradas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks del modelo ni de alternativas directamente comparables de la misma categoría (modelos de 4B especializados en ciberseguridad y abliterados) en la información proporcionada, por lo que la comparación de rendimiento figura como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base generalista y aplicar abliteration, pueden persistir sesgos del corpus original y una menor cautela en temas sensibles.
- Riesgo de alucinación: el autor advierte que el modelo puede generar detalles técnicos inexactos y que las respuestas deben verificarse con fuentes autoritativas.
- Limitaciones de contexto o idioma: solo se declara inglés; el contexto de 262.144 tokens es el teórico heredado del modelo base, sin validación publicada de rendimiento a esa longitud.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor desaconseja su uso en producción y en herramientas de seguridad sin supervisión humana.
- Calidad en tareas de código: el autor señala que, como modelo por debajo de 10B, puede producir errores de sintaxis y recomienda limitarlo a tareas pequeñas.
- Uso dual: al estar abliterado y orientado a técnicas ofensivas, existe riesgo de uso malintencionado; el autor lo restringe a investigación legítima y pruebas autorizadas, y el usuario es responsable del cumplimiento legal.
- Madurez del proyecto: 53 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m123yt/Attestor-4.6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
