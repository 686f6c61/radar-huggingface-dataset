# llmfan46/Qwen3-VL-32B-Instruct-uncensored-heretic-GGUF

## Resumen

Qwen3-VL-32B-Instruct-uncensored-heretic-GGUF es una cuantizacion en formato GGUF del modelo llmfan46/Qwen3-VL-32B-Instruct-uncensored-heretic, que a su vez es una version "decensored" (abliterated) del modelo multimodal Qwen/Qwen3-VL-32B-Instruct desarrollado por Alibaba Qwen. El autor de la cuantizacion y del modelo derivado es el contribuyente independiente llmfan46. El modelo resuelve la tarea de image-text-to-text (vision-lenguaje) con un sesgo de rechazo reducido: segun la model card, pasa de 99/100 rechazos en el original a 15/100 en esta version, con una divergencia KL de 0,0141 respecto al modelo base.

La relevancia actual reside en dos factores. Primero, el modelo base Qwen3-VL-32B-Instruct es un transformer multimodal de 32.762.123.264 parametros (32,7B) con capacidades de razonamiento visual y textual. Segundo, la tecnica de abliteracion aplicada (Heretic v1.2.0 con Arbitrary-Rank Ablation, ARA) permite eliminar buena parte de las respuestas de rechazo preservando el rendimiento en benchmarks de conocimiento y sentido comun, lo que interesa a quienes necesitan un modelo menos restrictivo para investigacion o generacion creativa sin censura.

El repositorio ocupa 246,2 GB e incluye multiples cuantizaciones GGUF (de BF16 a Q4_K_S), lo que permite desplegarlo desde estaciones de trabajo con GPU consumer hasta servidores con multiples aceleradores. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia de Gemma 4 de Google, lo que constituye una inconsistencia que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 32.762.123.264 (32,7B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (la model card enlaza ademas a la licencia de Gemma 4, dato inconsistente) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF del checkpoint llmfan46/Qwen3-VL-32B-Instruct-uncensored-heretic, derivado de Qwen/Qwen3-VL-32B-Instruct. La arquitectura subyacente es un transformer multimodal de 32,7B parametros orientado a image-text-to-text, si bien la informacion proporcionada no detalla la composicion exacta de capas, el mecanismo de atencion ni el encoder visual. No se dispone de datos sobre el numero de tokens de entrenamiento del modelo original ni sobre la composicion del dataset.

La innovacion tecnica destacable es el proceso de abliteracion aplicado con Heretic v1.2.0 mediante Arbitrary-Rank Ablation (ARA). Los parametros reportados son: start_layer_index 31, end_layer_index 35, preserve_good_behavior_weight 0,7620, steer_bad_behavior_weight 0,0002, overcorrect_relative_weight 1,2141 y neighbor_count 8, actuando sobre el componente attn.o_proj. Este procedimiento modifica las proyecciones de atencion en un rango de capas para suprimir la direccion de rechazo, logrando reducir los rechazos de 99/100 a 15/100 con una divergencia KL de 0,0141 frente al modelo original. No se documenta en la informacion disponible si hubo RLHF, DPO u otras etapas de alineamiento adicionales.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text) y genera respuestas textuales.
- Razonamiento visual: capacidad de responder preguntas sobre imagenes, segun el pipeline declarado.
- Conocimiento general y razonamiento: evaluado en MMLU con 57 materias (82,44 % en el original, 81,44 % en la version heretic).
- Sentido comun fisico: evaluado en PIQA (93,09 % original, 93,31 % heretic).
- Menor tasa de rechazo: 15/100 rechazos frente a 99/100 del original, orientado a usos que requieren menor censura.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision, audio u otras capacidades especiales: solo se confirma vision; el resto no disponible.

## Casos de uso

- Investigacion sobre alineamiento y abliteracion: el modelo sirve como caso de estudio reproducible para medir el efecto de ARA sobre la tasa de rechazo y la divergencia KL, comparando directamente con el checkpoint original de Qwen3-VL-32B-Instruct.
- Analisis de imagenes en entornos de investigacion sin restricciones de contenido: permite describir y razonar sobre imagenes medicas, forenses o de contenido sensible donde el modelo original rechazaria la peticion, con la advertencia de validacion humana obligatoria.
- Generacion creativa y narrativa: escritura de ficcion con tematicas adultas o controvertidas donde la censura del modelo base resulta limitante, apoyandose en la reduccion de rechazos documentada.
- Evaluacion comparativa de sesgos: uso del par original/heretic para cuantificar como cambia el comportamiento en MMLU (descenso de 1 punto porcentual) y en las materias sensibles (moral_scenarios cae de 68,78 % a 62,67 %).
- Prototipado de asistentes visuales en local: las cuantizaciones Q4_K_M y Q4_K_S permiten ejecutar un modelo de 32,7B en hardware consumer mediante llama.cpp u Ollama, util para demos sin conexion.
- Red teaming y pruebas de seguridad: generacion de respuestas que un modelo alineado bloquearia, para auditar filtros y sistemas de moderacion propios.
- Procesamiento de documentos con imagenes en pipelines internos: extraccion y descripcion de contenido visual en entornos controlados donde la licencia Apache 2.0 (sujeta a verificacion) facilita la integracion.

## Benchmarks y rendimiento

| Benchmark | Original (Qwen3-VL-32B-Instruct) | Heretic (este modelo) |
|---|---|---|
| MMLU (7021 preguntas) | 82,44 % (5788 correctas) | 81,44 % (5718 correctas) |
| PIQA (1838 preguntas) | 93,09 % (1711 correctas) | 93,31 % (1715 correctas) |
| Rechazos (100 prompts) | 99/100 | 15/100 |
| Divergencia KL | 0 (por definicion) | 0,0141 |

Desglose MMLU por materia (original / heretic): professional_law 62,68 % / 59,75 %; moral_scenarios 68,78 % / 62,67 %; miscellaneous 93,47 % / 92,95 %; professional_psychology 85,76 % / 83,86 %; high_school_psychology 96,30 % / 95,93 %; high_school_macroeconomics 91,37 % / 88,83 %; elementary_mathematics 89,13 % / 89,67 %; moral_disputes 84,48 % / 82,18 %; prehistory 89,53 % / 90,70 %; philosophy 82,39 % / 81,76 %. No se han publicado resultados de HumanEval, GSM8K ni benchmarks multimodales (MMMU, DocVQA) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 65 GB solo para pesos, mas overhead de contexto y cache KV; Q8_0 ronda los 35 GB; Q6_K unos 27 GB; Q5_K_M unos 23 GB; Q4_K_M unos 19-20 GB; Q4_K_S algo menos.
- GPU recomendadas: para BF16, multiples A100 80 GB o H100 80 GB; para Q8_0, una A100 40 GB o H100; para Q4_K_M, una RTX 4090 (24 GB) resulta ajustada y puede requerir offload parcial a CPU.
- Cabe en GPU consumer: Q4_K_S y Q4_K_M en RTX 4090 (24 GB) con posible offload; en GPUs de 16 GB o menos sera necesario offload a RAM del sistema, con caida de rendimiento.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base admite transformers y vLLM/TGI en formato safetensors. Para vision en GGUF conviene verificar el soporte del proyector multimodal en la version concreta del runner.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (heretic GGUF) | 32,7B | No disponible | 81,44 % | Apache 2.0 (con inconsistencia) | GGUF |
| Qwen/Qwen3-VL-32B-Instruct | 32,7B | No disponible | 82,44 % | Apache 2.0 | Safetensors |
| Qwen3-VL-32B-Instruct-uncensored-heretic (base del GGUF) | 32,7B | No disponible | 81,44 % | Apache 2.0 | Safetensors |
| Otras alternativas multimodales de ~30B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa directa mas relevante es contra el modelo original de Qwen: misma arquitectura y tamano, con una perdida de 1 punto porcentual en MMLU y una ganancia en PIQA de 0,22 puntos, a cambio de reducir los rechazos un 84,8 %. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina parcialmente el alineamiento de seguridad: el modelo puede generar contenido que el original rechazaria, con implicaciones legales y eticas segun la jurisdiccion y el uso.
- Descenso en materias sensibles: moral_scenarios cae 6,11 puntos y professional_law 2,93 puntos respecto al original, lo que sugiere perdida de matiz en razonamiento normativo y etico.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor no publica evaluaciones de factualidad ni de tasas de hallucination.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue fuera del ingles sin evaluacion propia.
- Longitud de contexto no disponible: impide planificar casos de uso con documentos largos o conversaciones extensas.
- Inconsistencia de licencia: la model card declara Apache 2.0 pero enlaza a la licencia de Gemma 4 de Google; es imprescindible aclarar la licencia aplicable antes de un uso comercial.
- Procedencia: modelo derivado por un contribuyente independiente, sin auditoria externa; el repositorio depende de donaciones y el autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face.
- Advertencia de contenido en la propia model card: incluye imagenes y enlaces promocionales (Patreon, Ko-fi) ajenos al modelo; no deben interpretarse como parte de las especificaciones tecnicas.
- Uso en produccion: requiere evaluacion propia de sesgos, moderacion de salida y validacion humana, especialmente en dominios regulados (salud, legal, finanzas).

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-uncensored-heretic-GGUF
- Modelo base del GGUF: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-uncensored-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia enlazada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
