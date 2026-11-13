# richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF

## Resumen

Olmo-3.1-32B-Instruct-ARA-heretic-GGUF es una compilación en formato GGUF del modelo richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic, que a su vez es una versión "abliterada" (con las capacidades de rechazo eliminadas) del modelo allenai/Olmo-3.1-32B-Instruct. La abliteración se realizó con Heretic 2.0 empleando Arbitrary-Rank Ablation (ARA), el método de optimización de Heretic. El modelo resultante tiene 32.233.522.176 parámetros y está pensado explícitamente como objeto de investigación sobre eliminación de rechazos, no como asistente de propósito general.

El autor, Richard J. Young, publica estos archivos como material de soporte de un artículo académico sobre abliteración ("Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors"), en el que se comparan tasas de rechazo y divergencia KL frente a los modelos originales. El repositorio GGUF contiene únicamente cuantizaciones (Q4_K_M, Q8_0 y una matriz de importancia), no los pesos completos.

La relevancia del modelo es doble: por un lado, sirve para estudiar hasta qué punto la abliteración degrada el comportamiento del modelo base (medido como divergencia KL de primer token); por otro, permite a investigadores reproducir y auditar los resultados del artículo con hardware de consumo gracias a las cuantizaciones GGUF. La licencia declarada es apache-2.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: allenai/Olmo-3.1-32B-Instruct, transformer; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, matriz de importancia (imatrix); anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo fuente) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo allenai/Olmo-3.1-32B-Instruct, del que no se detallan en la información proporcionada ni la composición del dataset de entrenamiento, ni el número de tokens, ni si hubo RLHF/DPO. Lo que sí se documenta es el proceso de modificación: la abliteración se aplicó con Heretic 2.0 mediante Arbitrary-Rank Ablation (ARA), un método de optimización que busca la ablación de direcciones de rechazo con un rango arbitrario en lugar de una única dirección. La selección de la prueba (trial) siguió la regla de minimizar los rechazos por palabra clave en el conjunto de desarrollo sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1, sobre una búsqueda de 100 pruebas.

Los resultados reportados en el artículo para el modelo en precisión completa (bf16) son: tasa de rechazo del 84,1% en el original frente al 10,8% (105 de 972) en el modelo abliterado, medido sobre 972 prompts dañinos retenidos con el juez WildGuard; 48 rechazos por palabra clave sobre los 100 prompts de ajuste en la prueba seleccionada; y divergencia KL de primer token de 0,053. Es importante subrayar que estas cifras describen el modelo bf16, no las cuantizaciones GGUF publicadas aquí, que no fueron evaluadas en el artículo y cuyo comportamiento de rechazo puede diferir tras la cuantización.

El proceso de conversión a GGUF se realizó con llama.cpp (commit 468fde9): convert_hf_to_gguf.py con --outtype bf16 y posterior llama-quantize sobre CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la matriz de importancia (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estáticas. Cada archivo Q4_K_M se cargó y respondió a un prompt de prueba antes de la subida, y los pesos safetensors de origen se verificaron contra sus sumas SHA-256 (revisión fd2efab317e0).

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct de Olmo 3.1.
- Cumplimiento de solicitudes que el modelo original rechaza: la tasa de rechazo baja del 84,1% al 10,8% en el conjunto de evaluación del artículo (modelo bf16).
- Modo de razonamiento o "thinking": no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades de visión o audio: no disponibles.
- Ejecución local mediante llama.cpp y Ollama, con compatibilidad con endpoints.

## Casos de uso

- Investigación sobre abliteración: el modelo permite reproducir y auditar los experimentos del artículo de Young, comparando tasas de rechazo y divergencia KL entre el original y la versión modificada, tanto en bf16 como en las cuantizaciones publicadas.
- Evaluación de defenses frente a la eliminación de rechazos: sirve como modelo adversario controlado para probar clasificadores de seguridad, filtros de salida y sistemas de moderación, ya que su tasa de rechazo es conocida y medible.
- Estudio del efecto de la cuantización en el comportamiento de rechazo: al disponer de Q4_K_M y Q8_0 del mismo modelo, se puede medir si la cuantización altera la tasa de cumplimiento, una cuestión que el autor señala explícitamente como no evaluada.
- Reproducibilidad en hardware de consumo: la build Q4_K_M (19,5 GB) permite ejecutar un modelo de 32B en una sola GPU de consumo con suficiente VRAM, facilitando experimentos que en bf16 requerirían hardware de datacenter.
- Análisis de sesgos y daños en modelos sin alineación de rechazo: útil para caracterizar qué tipos de contenido genera un modelo abliterado y en qué proporción, como insumo para políticas de uso y diseño de salvaguardas.
- Docencia e investigación en seguridad de LLMs: como ejemplo práctico de un pipeline completo de modificación de pesos (fuente safetensors, conversión a GGUF, cuantización con imatrix, verificación SHA-256) documentado paso a paso.
- Pruebas de pipelines de inferencia local: validar integraciones con Ollama o llama.cpp usando un modelo de 32B con requisitos de memoria conocidos y comportamiento de rechazo alterado de forma controlada.

## Benchmarks y rendimiento

Los únicos datos publicados en la información proporcionada corresponden al modelo en precisión completa (bf16) y miden comportamiento de rechazo, no capacidades generales:

| Metrica | Original | Modelo abliterado (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 84,1% | 10,8% (105/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (prueba seleccionada) | no disponible | 48 |
| Divergencia KL de primer token respecto al original (prueba seleccionada) | no aplica | 0,053 |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni para el modelo bf16 ni para las cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 19,5 GB de pesos; con overhead de contexto y caché KV, se recomienda un mínimo de 22-24 GB de VRAM.
- VRAM estimada para Q8_0: aproximadamente 34,3 GB de pesos; requiere al menos 36-40 GB de VRAM para inferencia cómoda.
- GPU recomendadas para Q4_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB), A100 (40/80 GB).
- GPU recomendadas para Q8_0: A100 80 GB, H100 80 GB, o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, la build Q4_K_M en RTX 4090, RTX 3090 y tarjetas con 24 GB o más. La Q8_0 no cabe en GPU de consumo de una sola unidad.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (ollama run hf.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF:Q4_K_M), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Olmo-3.1-32B-Instruct-ARA-heretic-GGUF (este) | 32,2B | no disponible | apache-2.0 | GGUF | Abliterado con Heretic 2.0 (ARA); rechazo 10,8% en bf16 |
| allenai/Olmo-3.1-32B-Instruct | 32,2B | no disponible | no disponible en la informacion proporcionada | safetensors | Modelo original; rechazo 84,1% |
| richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic | 32,2B | no disponible | apache-2.0 | safetensors | Versión bf16 del mismo modelo abliterado; evaluada en el artículo |

No se dispone en la información proporcionada de datos sobre otros modelos abliterados comparables (por ejemplo, versiones de Qwen o Gemma mencionadas en el artículo) que permitan una comparación cuantitativa adicional.

## Limitaciones y advertencias

- El modelo está diseñado para eliminar el rechazo: cumple muchas solicitudes que el original rechaza, lo que incluye potencialmente contenido dañino. No debe desplegarse como asistente de propósito general sin salvaguardas externas.
- Las cuantizaciones GGUF no fueron evaluadas en el artículo; el autor advierte que la cuantización puede alterar el comportamiento de rechazo, por lo que las cifras del 10,8% no son necesariamente válidas para Q4_K_M o Q8_0.
- La abliteración introduce una divergencia KL de 0,053 respecto al original en el primer token, lo que implica cambios en la distribución de salida que pueden afectar a la calidad o coherencia en tareas generales; no se han publicado evaluaciones de capacidades.
- Idioma limitado al inglés según la etiqueta del repositorio; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada en la información proporcionada.
- Sesgos conocidos: no documentados específicamente, pero al heredar los del modelo base y eliminar el rechazo, es probable que los sesgos y contenidos problemáticos del original se expresen con mayor facilidad.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 32B sin evaluación de capacidades publicada, no hay datos que permitan acotarlo.
- Licencia apache-2.0 heredada del modelo fuente, pero el uso previsto declarado es la investigación sobre eliminación de rechazos y su medición; los usuarios son responsables del uso lícito.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF
- Modelo fuente (bf16 abliterado): https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic
- Modelo original de AllenAI: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Artículo citado: Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (2026), enlace arXiv pendiente de añadir según la model card.
- llama.cpp (herramienta de conversión y cuantización, commit 468fde9): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
