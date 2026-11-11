# richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-general-GGUF

## Resumen
Qwen2.5-Coder-14B-Instruct-heretic1x-general GGUF es una compilación en formato GGUF de un modelo derivado de Qwen2.5-Coder-14B-Instruct, publicado por el investigador Richard J. Young. El modelo original de Qwen está especializado en generación de código y tiene 14.770.033.664 parámetros. La variante "heretic1x-general" aplica una técnica de abliteración (eliminación de rechazos) mediante ablación direccional de rango 1 con direcciones de rechazo generales, generada con la herramienta Heretic 1.x (heretic-llm 1.4.0). El resultado es un modelo que responde a muchas solicitudes que el original rechaza.

Este repositorio contiene únicamente los pesos cuantizados en GGUF para su uso con llama.cpp y Ollama, no los pesos completos en safetensors. La versión de precisión completa (bf16) fue evaluada en un artículo académico de Young sobre comparación de herramientas de abliteración; los archivos cuantizados aquí publicados no fueron evaluados en dicho artículo y la cuantización puede alterar el comportamiento de rechazo. El autor declara explícitamente que estos archivos se publican para investigación sobre eliminación de rechazos y su evaluación, no como asistente de propósito general.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de modelo de código de 14B parámetros ejecutable en hardware de consumo; por otro, ilustra una práctica controvertida (abliteración) con métricas publicadas de reducción de rechazos, lo que resulta útil para investigadores que estudian seguridad, alineamiento y evaluación de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-14B-Instruct; detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | 14.770.033.664 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M (9,0 GB), Q8_0 (15,7 GB); anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K; matriz de importancia imatrix (17 MB) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 (heredada del modelo fuente Qwen2.5-Coder-14B-Instruct) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-Coder-14B-Instruct, un transformer decoder-only de 14,77 mil millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card de Qwen y no se incluyen en este repositorio.

La innovación técnica de esta variante es la abliteración: se aplicó ablación direccional de rango 1 con direcciones de rechazo generales mediante Heretic 1.x. Según el artículo citado, la regla de selección consistió en elegir, entre 200 ensayos, el que minimizaba los rechazos en el conjunto de desarrollo con una divergencia KL de primer token respecto al original menor o igual a 0,01. El ensayo seleccionado presenta una KL de primer token de 0,0099 y 36 rechazos por palabra clave sobre los 100 prompts de ajuste. Los archivos GGUF se generaron con llama.cpp (commit 468fde9): conversión a bf16 con `convert_hf_to_gguf.py` y cuantización con `llama-quantize` en CPU, verificando cada peso contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan matriz de importancia calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estáticas.

## Capacidades
- Generación de texto y código, heredadas de Qwen2.5-Coder-14B-Instruct.
- Razonamiento y matemáticas a nivel de modelo de 14B (sin datos de benchmark en esta información).
- Conversación multi-turno (tag "conversational").
- Ejecución local mediante llama.cpp y Ollama.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Reducción drástica de rechazos: 12,3% de rechazo sobre 972 prompts dañinos retenidos (juez WildGuard) frente al 85,5% del original, según el artículo para la versión bf16.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada (el modelo base Qwen2.5-Coder-Instruct lo soporta, pero esta variante no lo documenta).
- Capacidades multilingües: la model card declara únicamente inglés.

## Casos de uso
- Investigación sobre abliteración: comparar el comportamiento de rechazo de esta variante cuantizada frente al modelo original y a otras herramientas (Heretic 2.0, OBLITERATUS) usando los prompts y el juez WildGuard del artículo. Es el uso declarado por el autor.
- Evaluación de robustez de defensas: medir si técnicas de mitigación o system prompts recuperan tasas de rechazo en un modelo abliterado, con la ventaja de que Q4_K_M cabe en 9 GB y permite iterar en estación de trabajo.
- Estudio del efecto de la cuantización en el alineamiento: comparar Q4_K_M frente a Q8_0 sobre el mismo conjunto de prompts para cuantificar cómo la cuantización altera la tasa de rechazo, una cuestión que el autor señala explícitamente como no evaluada.
- Asistencia de código en local para prototipado: con 14,77B parámetros y Q4_K_M de 9 GB, puede ejecutarse en GPU de consumo para autocompletado y generación de fragmentos en entornos sin conexión.
- Despliegue con Ollama en flujos de investigación reproducibles: el tag por defecto es Q4_K_M y existen tags por tamaño, lo que facilita fijar la variante exacta en scripts de evaluación.
- Análisis de sesgos y contenido dañino: al aceptar solicitudes que el original rechaza, sirve como generador de casos adversarios para entrenar o validar clasificadores de seguridad, siempre en un entorno controlado y con las salvaguardas legales correspondientes.

## Benchmarks y rendimiento

| Métrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 85,5% | 12,3% (120/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | No disponible | 36 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | No disponible | 0,0099 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores describen el modelo de precisión completa (bf16); los archivos GGUF no fueron evaluados en el artículo.

## Requisitos de hardware
- VRAM estimada: Q4_K_M ocupa 9,0 GB en disco y requiere aproximadamente 10-11 GB de VRAM para inferencia con contexto moderado; Q8_0 ocupa 15,7 GB y requiere en torno a 17-18 GB.
- GPU recomendadas: Q4_K_M cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB); Q8_0 cabe en RTX 4090, RTX 3090 y A100/H100. Para despliegue multiusuario se recomienda A100 40/80 GB o H100.
- GPU de consumo: sí, Q4_K_M en tarjetas de 12 GB o más (con contexto reducido) y Q8_0 en tarjetas de 16-24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run richardyoung/qwen2.5-coder-14b-instruct-heretic1x-general`), y cualquier servidor compatible con GGUF (llama.cpp server). vLLM y TGI no se citan en la información proporcionada para estos archivos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-Coder-14B-Instruct-heretic1x-general GGUF) | 14,77B | No disponible | Apache 2.0 | GGUF | Abliterado; rechazo 12,3% en bf16 |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,77B | No disponible en esta información | Apache 2.0 | safetensors, GGUF | Modelo original; rechazo 85,5% |
| Heretic 2.0 sobre Qwen2.5-Coder (citado en el artículo) | No disponible | No disponible | No disponible | No disponible | Alternativa de abliteración comparada en el paper |
| OBLITERATUS sobre Qwen2.5-Coder (citado en el artículo) | No disponible | No disponible | No disponible | No disponible | Alternativa de abliteración comparada en el paper |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas de abliteración en la información proporcionada; solo se citan como objetos de comparación del artículo.

## Limitaciones y advertencias
- Modelo abliterado: elimina deliberadamente los rechazos, por lo que puede generar contenido dañino, ilegal o inseguro. No debe desplegarse como asistente de propósito general sin salvaguardas externas.
- El autor restringe el uso previsto a investigación sobre eliminación de rechazos y su evaluación; el usuario es responsable del uso lícito.
- Las métricas de rechazo publicadas corresponden al modelo bf16; la cuantización puede alterar el comportamiento de rechazo y no ha sido evaluada.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está documentado.
- Longitud de contexto: no documentada en esta información; conviene verificar la configuración de llama.cpp/Ollama antes de usarla en tareas de contexto largo.
- Riesgo de alucinación: inherente a los modelos de 14B; sin benchmarks de capacidad publicados no puede cuantificarse.
- Sesgos: no documentados en la información proporcionada; la abliteración puede amplificar la exposición a contenido sesgado al eliminar filtros de rechazo.
- Licencia Apache 2.0 permite uso comercial, pero las restricciones de uso del modelo fuente y las implicaciones legales del contenido generado recaen sobre el usuario.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes independientes de calidad.

## Enlaces
- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-general-GGUF
- Modelo base (bf16): https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-general
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Licencia del modelo fuente: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct/blob/main/LICENSE
- Artículo citado: Young, R. J. "The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder" (2026); enlace arXiv pendiente de publicación según la model card.
- Herramienta Heretic (heretic-llm 1.4.0): no se proporciona enlace en la información disponible.
- llama.cpp: no se proporciona enlace en la información disponible.
