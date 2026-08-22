# Krypto-Whitehat/qwen3.8-9b-uncensored-cyber-xrpl-v4

## Resumen

Krypto-Whitehat/qwen3.8-9b-uncensored-cyber-xrpl-v4 es un modelo de lenguaje especializado en análisis de vulnerabilidades y ciberseguridad, centrado en el ecosistema XRPL (rippled) y en lenguajes como C/C++ y Python. Desarrollado por Krypto-Whitehat, parte de un fine-tuning QLoRA sobre la base MegaPanchamZ/Qwen3.8-9B-abliterated-25, que a su vez es una versión "abliterada" (sin direcciones de rechazo) del modelo Qwen3.8-9B. El resultado es un modelo de 8.95 mil millones de parámetros, con arquitectura híbrida Mamba-SSM y atención completa intercalada, diseñado para producir respuestas con veredictos explícitos (VERDICT) y citas file:line para reducir la alucinación.

El modelo se distribuye en formato GGUF con cuantizaciones Q6_K, Q8_0 y F16, optimizadas mediante imatrix para preservar la calidad en tareas estructuradas de ciberseguridad. Su relevancia actual radica en la creciente demanda de asistentes de IA para auditoría de código y análisis de exploits, especialmente en el ámbito de blockchain y contratos inteligentes, donde la precisión y la trazabilidad de las afirmaciones son críticas. Aunque el conjunto de entrenamiento es reducido (184 filas), el enfoque en anti-alucinación y la obligación de emitir veredictos lo convierten en una propuesta interesante para entornos de investigación y desarrollo de herramientas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-SSM + atención completa (full_attention_interval=4), 33 capas de atención |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (recomendado 4k-8k para el corpus de entrenamiento) |
| Tipos de cuantizacion | GGUF: Q6_K (6,9 GB), Q8_0 (8,9 GB), F16 (17 GB); base en BF16 safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (base) y GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

El modelo parte de la base MegaPanchamZ/Qwen3.8-9B-abliterated-25, que es una versión "abliterated" (sin direcciones de rechazo) del Qwen3.8-9B, con pesos en BF16. Sobre esta base se aplicó un fine-tuning QLoRA con cuantización 4-bit NF4 y LoRA con r=16 y alpha=32, afectando a todas las capas q/k/v/o y MLP en capas seleccionadas mediante el filtro de unsloth. El entrenamiento se realizó durante 2 épocas con una pérdida final de train_loss=1.691 y eval_loss=1.428 sobre un conjunto de evaluación de 33 filas. Los datos de entrenamiento consisten en 184 filas (112 específicas de XRPL y 72 de fuentes externas de ciberseguridad), con un corpus de retención para imatrix de 80 filas.

La arquitectura es híbrida: combina capas Mamba-SSM con capas de atención completa intercaladas cada 4 capas (full_attention_interval=4), totalizando 33 capas de atención. Esta configuración busca un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance. El entrenamiento se realizó en una RTX 5090 Laptop con 24 GB GDDR7, y la cuantización GGUF se generó con llama.cpp CUDA (sm_120) utilizando imatrix calculado sobre un holdout de 196 líneas (~3700 tokens). El modelo incorpora un mecanismo anti-alucinación que obliga a cada respuesta a incluir un veredicto (VERDICT: EXPLOITABLE, UNPROVEN, SAFE o NEEDS_REVIEW) y a citar archivo:línea en el 100% de las filas de entrenamiento.

## Capacidades

- Generación de texto especializada en análisis de vulnerabilidades y ciberseguridad, con foco en XRPL (rippled), C/C++ y Python.
- Emisión obligatoria de veredictos estructurados (VERDICT) para clasificar hallazgos como explotables, no probados, seguros o pendientes de revisión.
- Citación de archivo:línea en las respuestas, lo que facilita la trazabilidad y reduce la alucinación.
- Soporte de tool calling mediante el token `xrpl-drill`, que se espera en la salida cuando se delega a herramientas externas.
- Capacidad de razonamiento multi-paso para análisis de lógica de negocio, validación de entradas y bypass de controles.
- Multilingüe: no se especifican idiomas, pero al estar basado en Qwen3.8, probablemente hereda capacidades multilingües del modelo base (no confirmado).
- Modo "uncensored": al estar abliterado, no aplica direcciones de rechazo, lo que permite respuestas sin filtros de seguridad (con las implicaciones éticas correspondientes).

## Casos de uso

- Auditoría de código en proyectos XRPL: el modelo puede analizar contratos y código de rippled para identificar vulnerabilidades de memoria, lógica o validación, emitiendo veredictos y citas file:line que los desarrolladores pueden verificar directamente.
- Revisión de seguridad en C/C++: gracias a su entrenamiento en memory safety, puede detectar desbordamientos de buffer, uso después de liberar y otros fallos típicos, con evidencia de ASan cuando esté disponible.
- Análisis de código Python: útil para identificar fallos de lógica, inyección de comandos o problemas de saneamiento de entrada en aplicaciones web o scripts.
- Generación de informes de vulnerabilidad: el formato VERDICT estructurado permite integrar las respuestas en pipelines de CI/CD o en herramientas de gestión de incidencias, facilitando la triage automática.
- Asistente en pruebas de penetración: puede guiar a analistas en la exploración de vectores de ataque, proponiendo pasos de explotación y validando hipótesis con el veredicto UNPROVEN cuando no hay evidencia suficiente.
- Entrenamiento y educación en ciberseguridad: al ser "uncensored" y estar orientado a explotación, puede usarse en entornos controlados para enseñar técnicas de análisis de vulnerabilidades, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados son las pérdidas de entrenamiento y evaluación: train_loss=1.691 y eval_loss=1.428 tras 2 épocas, sobre un conjunto de evaluación de 33 filas. El autor indica que el conjunto de evaluación es pequeño y recomienda una evaluación anti-alucinación más amplia (200+ filas) para uso en producción. No se dispone de métricas comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: Q6_K (6,9 GB) cabe en GPUs con 8 GB o más; Q8_0 (8,9 GB) requiere al menos 12 GB; F16 (17 GB) necesita 20 GB o más.
- GPU recomendadas: RTX 3060/4060 (8-12 GB) para Q6_K; RTX 4070/4080 (12-16 GB) para Q8_0; RTX 4090 o A100 para F16. El entrenamiento se realizó en una RTX 5090 Laptop (24 GB GDDR7).
- Es compatible con GPUs de consumo medio-alto; la cuantización Q6_K es la opción por defecto recomendada por el autor para GPUs de 24 GB.
- Opciones de despliegue: LM Studio, llama.cpp, Ollama, vLLM, transformers/unsloth. El autor advierte que la ruta llama.cpp-qwen3.5-CUDA es experimental y recomienda transformers/unsloth/ollama/vllm para mayor robustez.
- Latencia y throughput: no se han publicado datos específicos. Dado el tamaño (9B) y la arquitectura híbrida, se espera una latencia moderada en GPUs consumer, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Cuantizaciones | Especialización |
|---|---|---|---|---|---|---|
| Krypto-Whitehat/qwen3.8-9b-uncensored-cyber-xrpl-v4 | MegaPanchamZ/Qwen3.8-9B-abliterated-25 | 8,95B | No disponible | Apache-2.0 | Q6_K, Q8_0, F16 | XRPL, ciberseguridad, anti-alucinación |
| Krypto-Whitehat/qwen3.8-9b-uncensored-cyber-exploit-XRPL-v3 | MegaPanchamZ/Qwen3.8-9B-abliterated-25 | 8,95B | No disponible | Apache-2.0 | No especificado | XRPL, explotación (versión anterior) |
| rohit267/Qwen3.8-9B-heretic-uncensored | Qwen3.8-9B | 8,95B | No disponible | Apache-2.0 | No especificado | Abliterado, sin direcciones de rechazo |

La comparativa se limita a características estructurales, ya que no hay benchmarks públicos que permitan comparar rendimiento. El modelo v4 se distingue por su énfasis en anti-alucinación y veredictos estructurados, mientras que el v3 y el heretic-uncensored son variantes sin ese mecanismo.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored" y abliterado, puede generar contenido ofensivo, peligroso o no ético si se usa sin control. No se han documentado sesgos específicos, pero la ausencia de filtros de seguridad es un riesgo inherente.
- Riesgo de alucinación: aunque el entrenamiento anti-alucinación reduce la probabilidad, no la elimina. El conjunto de entrenamiento es muy pequeño (184 filas) y la evaluación limitada (33 filas), por lo que el modelo puede fallar en dominios fuera de su corpus.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; el autor recomienda 4k-8k tokens para el estilo del corpus, pero el modelo base podría soportar más. Usar contextos mayores puede degradar la calidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el carácter "uncensored" puede implicar responsabilidades legales si se usa para actividades maliciosas.
- Caveats de producción: la ruta de inferencia GGUF vía llama.cpp no ha sido verificada en un forward pass completo; la validación estructural (sha256, tensores, metadatos) es correcta, pero la inferencia real está pendiente de prueba con LM Studio o vLLM. El conjunto de evaluación es insuficiente para garantizar fiabilidad en entornos productivos.
- Dependencia de herramientas externas: el token `xrpl-drill` se espera en la salida cuando se delega a tooling, pero no se documenta cómo integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Krypto-Whitehat/qwen3.8-9b-uncensored-cyber-xrpl-v4
- Versión v3: https://huggingface.co/Krypto-Whitehat/qwen3.8-9b-uncensored-cyber-exploit-XRPL-v3
- Repositorio GitHub (agente de explotación): https://github.com/Krypto-Whitehat/qwen3.8-9b-cyber-exploit-agent-uncensored
- Releases en GitHub: https://github.com/Krypto-Whitehat/qwen3.8-9b-cyber-exploit-agent-uncensored/releases
- Modelo base abliterado: https://huggingface.co/MegaPanchamZ/Qwen3.8-9B-abliterated-25
- Modelo heretic-uncensored (alternativa): https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Referencia en Vulners: https://vulners.com/githubexploit/00B37D2C-7FB1-5F5E-9CC5-2B6BE8F6D124
