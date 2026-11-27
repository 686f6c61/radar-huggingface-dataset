# CyberMalaya/CyberMalaya-9B-GGUF

## Resumen

CyberMalaya-9B-GGUF es una cuantizacion en formato GGUF del modelo Qwen/Qwen3.5-9B, afinada por CyberMalaya para tareas de ciberseguridad a partir del dataset Vyber07/cyber-security. Con 8.953.803.264 parametros (aproximadamente 9B), hereda la arquitectura y la ventana de contexto del modelo base Qwen3.5-9B, y se distribuye unicamente en formato GGUF, lo que lo orienta a inferencia local mediante llama.cpp u Ollama mas que a despliegues de servidor con vLLM o TGI.

Su interes practico reside en la especializacion: en lugar de un modelo generalista, se ofrece una variante entrenada sobre un corpus especifico de seguridad informatica, empaquetada para ejecucion en hardware de consumo. La licencia Apache 2.0 y la compatibilidad declarada con endpoints facilitan su integracion en herramientas y pipelines existentes.

No obstante, conviene senalar que el repositorio es de acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. Ademas, en el momento de redactar esta ficha no hay informacion publica sobre idiomas soportados, resultados de benchmarks ni detalles del proceso de entrenamiento, por lo que varias secciones se limitan a lo verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parametros. La unica modificacion documentada es el ajuste fino (fine-tuning) sobre el dataset Vyber07/cyber-security, orientado a contenidos de ciberseguridad. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

Tampoco se detalla si el ajuste se realizo mediante LoRA, full fine-tuning u otra metodologia, ni que hiperparametros se emplearon. La publicacion se limita a los pesos cuantizados en GGUF; no consta que se hayan liberado los pesos en precision completa (safetensors) ni el adaptador de entrenamiento.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-9B.
- Especializacion en dominio de ciberseguridad segun el dataset de ajuste declarado (Vyber07/cyber-security).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistente de triaje de alertas de seguridad: el modelo puede clasificar y priorizar alertas de un SIEM, redactando resumenes en lenguaje natural a partir de eventos, siempre que se valide su calidad con evaluaciones propias dado que no hay benchmarks publicos.
- Apoyo a analisis de vulnerabilidades: generar explicaciones tecnicas de CVEs y sugerencias de mitigacion para analistas junior, usando la especializacion del ajuste fino como punto de partida.
- Generacion de reglas de deteccion: redactar borradores de reglas Sigma, YARA o Snort que un analista revisa y valida antes de desplegar.
- Formacion y concienciacion: producir escenarios de phishing simulados y material didactico sobre higiene de seguridad, con revision humana obligatoria.
- Documentacion de incidentes: redactar informes post-incidente y resumenes ejecutivos a partir de notas del equipo de respuesta.
- Inferencia local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada de datacenter, util para entornos con requisitos de confidencialidad que impiden enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~9B en GGUF, orientativamente entre 6 y 7 GB en cuantizacion Q4_K_M, en torno a 9-10 GB en Q8_0 y aproximadamente 18 GB en FP16. Son estimaciones por tamano, no cifras publicadas por el autor.
- GPU recomendadas: no disponibles en la informacion del repositorio. Por tamano, una RTX 3090 o RTX 4090 (24 GB) permite ejecutar cuantizaciones altas en su totalidad; GPU de datacenter (A100, H100) no son necesarias para este formato.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas segun la cuantizacion elegida.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; vLLM y TGI no son el formato objetivo de esta publicacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CyberMalaya-9B-GGUF | ~9B | no disponible | GGUF | Apache 2.0 | Ajuste en ciberseguridad; acceso gated |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible | no disponible | Modelo base generalista del que deriva |
| Alternativas especializadas en ciberseguridad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables verificables |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Ausencia de benchmarks: no hay evaluaciones publicadas que permitan verificar la mejora frente al modelo base en tareas de ciberseguridad.
- Riesgo de alucinacion: como todo modelo generativo, puede producir referencias a CVEs, comandos o configuraciones inexactas; en dominio de seguridad esto es especialmente critico y exige validacion humana.
- Sesgos: no documentados; al desconocerse la composicion del dataset de ajuste, no puede evaluarse su cobertura ni posibles sesgos.
- Idiomas: no confirmados; no debe asumirse un rendimiento multilingue sin pruebas.
- Contexto: la ventana efectiva depende del modelo base y no se especifica en la ficha del repositorio.
- Uso comercial: la licencia Apache 2.0 lo permite, pero deben respetarse las condiciones del acceso gated y las obligaciones de la licencia del modelo base Qwen3.5-9B, que no se detallan aqui.
- Formato unico: al publicarse solo en GGUF, no es directamente compatible con stacks de servidor que esperan safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/CyberMalaya/CyberMalaya-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de ajuste: https://huggingface.co/datasets/Vyber07/cyber-security
