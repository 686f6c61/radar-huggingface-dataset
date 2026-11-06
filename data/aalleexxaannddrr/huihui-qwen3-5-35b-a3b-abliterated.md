# AAlleexxaannddrr/Huihui-Qwen3.5-35B-A3B-abliterated

## Resumen

Huihui-Qwen3.5-35B-A3B-abliterated es una variante "abliterated" (sin rechazos) del modelo multimodal Qwen3.5-35B-A3B de Alibaba Qwen, publicada por el usuario AAlleexxaannddrr en Hugging Face. El modelo base es un transformer de tipo mixture-of-experts (MoE) con arquitectura `qwen3_5_moe`, orientado a tareas image-text-to-text, es decir, acepta tanto texto como imagenes como entrada y genera texto. Cuenta con 35.951.822.704 parametros totales segun los pesos en safetensors y un tamano de repositorio de 71,9 GB, lo que sugiere pesos en precision alta (probablemente bf16).

La particularidad de esta version es el proceso de abliteration, una tecnica que elimina las direcciones de activacion asociadas a los rechazos del modelo alineado, de modo que el modelo deja de negarse a responder ante ciertas peticiones. El autor original de la tecnica aplicada es huihui-ai (la model card referencia `huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated`), y esta publicacion de AAlleexxaannddrr parece una redistribucion o adaptacion del mismo. Es relevante para investigadores que necesitan estudiar el comportamiento de modelos sin filtros de seguridad, evaluar sesgos o experimentar con alineacion, pero no es adecuado para produccion publica sin salvaguardas adicionales.

La licencia declarada es Apache 2.0, heredada del modelo base Qwen, y el modelo se distribuye en formato safetensors para la libreria transformers, con soporte adicional para Ollama y llama.cpp segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (existe version Ollama `huihui_ai/qwen3.5-abliterated:35b`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); disponible tambien via Ollama |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `qwen3_5_moe` del modelo Qwen/Qwen3.5-35B-A3B, un transformer con mezcla de expertos (MoE) y capacidad multimodal de entrada (imagenes y texto). Los pesos publicados suman 35.951.822.704 parametros totales, aunque no se especifica en la informacion disponible cuantos de ellos estan activos por token ni la distribucion de expertos. El pipeline declarado es `image-text-to-text`, lo que confirma que integra un codificador visual junto al decodificador de lenguaje.

El entrenamiento original del modelo base (composicion del dataset, numero de tokens, fases de RLHF/DPO) no se detalla en la informacion proporcionada. Sobre esta base, el autor aplico abliteration, una tecnica que identifica y elimina las direcciones de activacion responsables de los rechazos mediante la modificacion de los pesos, sin usar TransformerLens (implementacion "cruda" de prueba de concepto segun la model card). Ademas, se incluyen plantillas de chat adicionales: `chat_template-vl-think.jinja`, que habilita el modo "think" (razonamiento explicito), y `chat_template-vl.jinja`, orientada a mejorar la compatibilidad del tool calling en llama-server y evitar errores 500.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes combinadas con texto (image-text-to-text): descripcion, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Modo "think" (razonamiento explicito) mediante la plantilla `chat_template-vl-think.jinja`.
- Tool calling / function calling, con soporte mejorado en llama-server mediante `chat_template-vl.jinja`.
- Capacidades de agente y razonamiento multi-paso derivadas del modelo base Qwen3.5.
- Ausencia de rechazos ante peticiones que el modelo alineado rechazaria (abliterated/uncensored).
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar que comportamientos emergen cuando se eliminan las direcciones de rechazo, comparando respuestas con el modelo base alineado en experimentos controlados.
- Evaluacion de sesgos y robustez: util para medir como varian las respuestas ante prompts sensibles y para construir conjuntos de evaluacion de seguridad en entornos de laboratorio.
- Analisis de imagenes en pipelines internos: al ser image-text-to-text, puede extraer informacion de capturas, diagramas o documentos escaneados en flujos de trabajo controlados donde no se requiere filtrado estricto.
- Prototipado de asistentes conversacionales sin restricciones: en entornos de desarrollo cerrados, sirve para explorar respuestas ante consultas que un modelo alineado rechazaria, sin exponer el resultado al publico.
- Generacion de codigo asistida con tool calling: integrable en llama-server con la plantilla `chat_template-vl.jinja` para flujos de agentes de codigo (opencode, oh-my-opencode) en entornos de prueba.
- Experimentos de razonamiento con modo think: la plantilla `chat_template-vl-think.jinja` permite activar cadenas de razonamiento para tareas de matematicas o logica en investigacion.
- Despliegue local con Ollama: mediante `ollama run huihui_ai/qwen3.5-abliterated:35b` para pruebas en maquina local con GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.951.822.704 parametros, en bf16 los pesos ocupan aproximadamente 71,9 GB, por lo que se necesita al menos 80 GB de VRAM para cargar el modelo completo sin cuantizar.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Cuantizacion: para caber en GPU consumer seria necesario cuantizar (por ejemplo, a 4 bits, lo que reduciria los pesos a unos 18-20 GB), pero no se especifican en la informacion proporcionada los formatos de cuantizacion disponibles ni sus requisitos exactos.
- Cabe en consumer GPU: solo con cuantizacion agresiva; una RTX 4090 (24 GB) podria alojar una version de 4 bits, aunque no hay datos confirmados de dicha version en el repositorio.
- Opciones de despliegue: transformers (formato nativo), Ollama (version `huihui_ai/qwen3.5-abliterated:35b`, requiere ollama v0.17.5 o superior) y llama.cpp/llama-server con las plantillas de chat incluidas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-35B-A3B-abliterated (este) | 35,95 B (MoE) | no disponible | Si (image-text-to-text) | Apache 2.0 | Sin rechazos (abliterated) |
| Qwen/Qwen3.5-35B-A3B (base) | 35,95 B (MoE) | no disponible | Si | Apache 2.0 | Modelo alineado con filtros de seguridad |
| huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated | 35,95 B (MoE) | no disponible | Si | Apache 2.0 | Version abliterated original de huihui-ai |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: el proceso de abliteration elimina los rechazos, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado.
- No apto para todas las audiencias: los outputs pueden ser inadecuados para entornos publicos, menores o aplicaciones que requieran alta seguridad.
- Riesgo de alucinacion: no se documenta en la informacion proporcionada, pero es inherente a los modelos de lenguaje; la ausencia de rechazos no elimina este riesgo.
- Responsabilidad legal y etica: el usuario debe garantizar el cumplimiento de las leyes y estandares eticos locales; el autor declina responsabilidad por las consecuencias del uso.
- Uso recomendado solo en investigacion, pruebas o entornos controlados, evitando produccion o aplicaciones comerciales de cara al publico.
- Sin garantias de seguridad por defecto: el modelo no ha pasado optimizacion de seguridad rigurosa.
- Idiomas y contexto: no se especifican en la informacion disponible, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- Licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero las advertencias del autor desaconsejan produccion publica sin revision manual.
- Se recomienda monitorizacion en tiempo real y revision manual de los outputs.

## Enlaces

- Hugging Face: https://huggingface.co/AAlleexxaannddrr/Huihui-Qwen3.5-35B-A3B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Version abliterated original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated
- Repositorio de la tecnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Plantilla de chat con modo think: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated/blob/main/chat_template-vl-think.jinja
- Ollama (version del modelo): https://ollama.com/huihui_ai/qwen3.5-abliterated:35b
- Ollama release v0.17.5: https://github.com/ollama/ollama/releases/tag/v0.17.5
- llama.cpp releases: https://github.com/ggml-org/llama.cpp/releases
- opencode: https://github.com/anomalyco/opencode/releases
- oh-my-opencode: https://github.com/code-yeongyu/oh-my-opencode/releases
- Ko-fi del autor: https://ko-fi.com/huihuiai
