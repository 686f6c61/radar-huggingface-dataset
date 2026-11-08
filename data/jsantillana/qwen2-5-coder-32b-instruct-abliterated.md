# jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated

## Resumen

Qwen2.5-Coder-32B-Instruct-abliterated es una variante "abliterada" (sin mecanismos de rechazo) del modelo Qwen2.5-Coder-32B-Instruct desarrollado originalmente por Alibaba Cloud. La modificación la firma el usuario jsantillana y consiste en la aplicación de proyección ortogonal sobre subespacios concretos en las capas 59 a 63 del transformer, apuntando a los módulos `self_attn.o_proj` y `mlp.down_proj`, con el objetivo de eliminar las respuestas de rechazo predefinidas del modelo original sin reentrenar los pesos.

El modelo conserva la base técnica del Qwen2.5-Coder-32B-Instruct: 32.763.876.352 parámetros en formato safetensors, arquitectura transformer densa (no MoE), licencia "other" heredada del modelo base y soporte para inglés, español y chino. El repositorio ocupa 65,5 GB e incluye pesos en safetensors; el autor publica cuantizaciones GGUF (Q3_K_M, Q4_K_M, Q8_0) en un repositorio separado.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de modificación de pesos (abliteration) cada vez más común en la comunidad open source; por otro, advierte de que el resultado es un modelo sin filtros de seguridad, orientado explícitamente a red-teaming, auditoría y ciberseguridad defensiva, con implicaciones legales y éticas que el usuario debe asumir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), basado en Qwen2.5-Coder-32B-Instruct |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q3_K_M, Q4_K_M, Q8_0 (repositorio separado del autor); pesos originales en safetensors |
| Idiomas soportados | en, es, zh |
| Licencia | other (heredada del modelo base Qwen2.5-Coder-32B-Instruct) |
| Formato de pesos | safetensors (repo principal); GGUF en repo secundario |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-32B-Instruct: un transformer denso de aproximadamente 32,8 mil millones de parámetros, sin mezcla de expertos, orientado a generación de código, razonamiento tipo agente y tareas de terminal. El modelo original fue entrenado por Alibaba Cloud y publicado como modelo instruct; esta variante no reentrena los pesos, sino que aplica una intervención post-entrenamiento conocida como abliteration.

La abliteration implementada por jsantillana consiste en una proyección ortogonal dirigida sobre las capas 59, 60, 61, 62 y 63, actuando específicamente sobre `self_attn.o_proj` y `mlp.down_proj`. El objetivo declarado es eliminar los comportamientos de rechazo predefinidos ("canned refusal behaviors") preservando las capacidades de síntesis de código, razonamiento de terminal y flujos agénticos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y código en inglés, español y chino.
- Razonamiento de código: síntesis, refactorización, explicación y depuración.
- Razonamiento tipo agente y flujos multi-paso (agentic workflows, terminal reasoning).
- Soporte declarado por el autor para red-teaming, descubrimiento de vulnerabilidades, scripts de pentesting y auditoría de sistemas.
- Respuestas sin rechazos predefinidos ante consultas técnicas que el modelo base rechazaría.
- Capacidad multilingüe limitada a los tres idiomas indicados en las etiquetas.
- No se documenta soporte explícito de tool calling ni function calling en la información proporcionada, aunque el modelo base Qwen2.5-Coder-Instruct sí lo incorpora habitualmente.

## Casos de uso

- Red-teaming autorizado: el modelo puede generar payloads, escenarios de ataque y pruebas de concepto en entornos controlados sin las interrupciones de rechazo del modelo original, lo que agiliza ejercicios de seguridad ofensiva con permiso explícito.
- Auditoría de código y revisión de seguridad: análisis de repositorios para detectar patrones inseguros, malas prácticas criptográficas o vulnerabilidades conocidas, aprovechando su base Coder de 32B.
- Formación en ciberseguridad: generación de ejercicios prácticos, CTFs y material didáctico sobre explotación y defensa en laboratorios aislados.
- Desarrollo de herramientas defensivas: escritura de reglas de detección, parsers de logs, scripts de hardening y automatización de respuesta ante incidentes.
- Asistencia a desarrolladores en entornos con requisitos de contenido permisivos: generación de código en pipelines internos donde las políticas de filtrado del modelo base resultan demasiado restrictivas para tareas legítimas (por ejemplo, análisis de malware en sandbox).
- Investigación sobre alineación y seguridad de modelos: estudio empírico del efecto de la abliteration sobre capacidades y comportamiento, comparando con el modelo base.
- Evaluación comparativa de robustez: uso como contrapunto "sin filtros" en benchmarks de seguridad para medir la eficacia de mecanismos de rechazo en modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 65 GB solo para pesos, más overhead de KV cache; requiere múltiples GPU o una GPU de 80 GB con cuantización parcial.
- Cuantización Q8_0: en torno a 34-35 GB de pesos, viable en una A100 80 GB o H100 80 GB con margen.
- Cuantización Q4_K_M: aproximadamente 19-20 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 con contexto moderado.
- Cuantización Q3_K_M: en torno a 15-16 GB, viable en GPUs consumer de 16 GB (RTX 4080, 4060 Ti 16 GB) con contexto reducido.
- Despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI para los safetensors en FP16/BF16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated | 32,8B | no disponible | other | Variante abliterada, sin rechazos, orientada a red-teaming |
| Qwen/Qwen2.5-Coder-32B-Instruct | ~33B | no disponible en la informacion | other (Qwen) | Modelo base alineado, con filtros de seguridad |
| bartowski/Qwen2.5-Coder-32B-Instruct-abliterated-GGUF | 32,8B | no disponible | other | Misma familia abliterada, distribuida en GGUF por otro autor |

## Limitaciones y advertencias

- Ausencia total de mecanismos de rechazo: el modelo responderá a solicitudes de contenido dañino o ilegal, lo que traslada toda la responsabilidad legal al operador.
- Riesgo elevado de uso indebido: generación de exploits, malware o instrucciones peligrosas sin filtro; requiere controles de acceso y registro de uso en producción.
- Alucinaciones: al ser una modificación de pesos sin reentrenamiento, conserva los sesgos y errores del modelo base, y la abliteration puede alterar ligeramente la coherencia en dominios sensibles.
- Licencia "other" heredada: es imprescindible revisar los términos de Qwen2.5-Coder-32B-Instruct antes de cualquier uso comercial; la modificación no otorga permisos adicionales.
- Idiomas limitados a inglés, español y chino; no se garantiza calidad en otros idiomas.
- Longitud de contexto no documentada en esta ficha; conviene verificar la del modelo base antes de diseñar aplicaciones con ventanas largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de calidad reproducida por terceros.
- La técnica de abliteration no garantiza la eliminación completa de todos los comportamientos de rechazo ni la preservación íntegra de capacidades; se recomienda evaluar empíricamente antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated
- GGUF del autor: https://huggingface.co/jsantillana/Qwen2.5-Coder-32B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- GGUF alternativo (bartowski): https://huggingface.co/bartowski/Qwen2.5-Coder-32B-Instruct-abliterated-GGUF
