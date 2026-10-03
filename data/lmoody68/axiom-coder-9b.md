# lmoody68/AXIOM-coder-9B

## Resumen

AXIOM-coder-9B es un ajuste fino (fine-tune) del modelo abierto Yi-Coder-9B-Chat de 01.AI, orientado especificamente a tareas de asistencia en programacion. Lo desarrolla Leslie Moody (usuario lmoody68 en HuggingFace) como un asistente de codigo personal que se ejecuta de forma totalmente local y privada. El modelo conserva la identidad "AXIOM, built by Leslie Moody" y esta afinado para ser honesto y para centrarse en escribir, explicar, depurar y refactorizar codigo.

Tecnicamente es un transformer decoder-only denso de aproximadamente 8.830 millones de parametros (8.829.407.232 segun safetensors), heredado integramente del base Yi-Coder-9B-Chat, que soporta una ventana de contexto de hasta 128.000 tokens y 52 lenguajes de programacion. El ajuste se realizo con QLoRA en 4 bits (rango 16, una epoca) sobre un conjunto propio de pares docstring-codigo mas filas de un dataset publico de instrucciones en Python.

El resultado se exporta unicamente en formato GGUF cuantizado a Q4_K_M (archivo de ~5,3 GB), pensado para ejecutarse en Ollama o llama.cpp en hardware de consumo. Su relevancia es la de un asistente de codigo offline, con licencia Apache 2.0, que no requiere enviar codigo a servicios externos, aunque con las limitaciones propias de un modelo de 9B ajustado en una sola epoca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Yi); ajuste fino QLoRA |
| Parametros totales | 8.829.407.232 (~8,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el Modelfile incluido fija num_ctx en 8192 |
| Tipos de cuantizacion | Q4_K_M (unico GGUF publicado en el repositorio). El modelo base ofrece varias cuantizaciones |
| Idiomas soportados | Ingles (en) y codigo; capacidad multilingue limitada |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (axiom-v1.Q4_K_M.gguf, ~5,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de 01-ai/Yi-Coder-9B-Chat, un transformer decoder-only denso orientado a codigo con soporte de 52 lenguajes de programacion y una ventana de contexto de 128.000 tokens. El ajuste fino se realizo mediante QLoRA en 4 bits con rango 16 durante una sola epoca, sobre un total de 6.964 ejemplos: aproximadamente 1.964 pares docstring-codigo extraidos de proyectos personales del autor en Python, mas 5.000 filas del dataset publico `iamtarun/python_code_instructions_18k_alpaca`. El entrenamiento se llevo a cabo en una unica GPU de capa gratuita.

Tras el ajuste, los pesos se fusionaron (merge) a fp16, se convirtieron a formato GGUF y se cuantizaron a Q4_K_M con las herramientas de llama.cpp. El repositorio incluye ademas un `Modelfile` con el prompt de sistema de AXIOM (identidad, enfoque en codigo y honestidad) y parametros de generacion predeterminados: `temperature 0.25` y `num_ctx 8192`. No se documentan innovaciones arquitectonicas propias ni tecnicas como decodificacion especulativa o atencion lineal; las capacidades proceden del modelo base.

## Capacidades

- Generacion de codigo en Python principalmente, heredando del base el soporte de hasta 52 lenguajes de programacion.
- Explicacion de fragmentos de codigo, generacion de docstrings y comentarios.
- Depuracion de errores y refactorizacion para mejorar la legibilidad.
- Conversacion multi-turno orientada a asistencia de programacion.
- Ejecucion local y privada, sin conexion a servicios externos.
- Salida en ingles, con capacidad multilingue limitada por el enfoque del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo de razonamiento explicito ("thinking mode"): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion offline: el modelo se ejecuta integramente en local mediante Ollama o llama.cpp, de modo que el codigo nunca abandona la maquina, adecuado para entornos con requisitos de confidencialidad.
- Generacion de docstrings y documentacion: dado un fragmento de funcion, produce cadenas de documentacion y comentarios, aprovechando los cerca de 1.964 pares docstring-codigo usados en el ajuste.
- Explicacion de codigo heredado: permite comprender funciones o modulos poco documentados pidiendo una descripcion paso a paso del flujo de ejecucion.
- Refactorizacion rapida: reescritura de funciones para mejorar legibilidad o claridad estructural, un caso que el propio autor cita en los ejemplos de uso.
- Apoyo a la depuracion: identificacion de errores comunes en fragmentos de codigo y propuesta de correcciones, siempre con revision humana posterior.
- Generacion de esqueletos de funciones en Python: creacion de plantillas de funciones con firmas, validaciones y estructura basica a partir de una descripcion en lenguaje natural.
- Asistente de estudio y aprendizaje: respuestas a dudas puntuales de sintaxis o algoritmos en ingles para desarrolladores que estan aprendiendo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el fine-tune AXIOM-coder-9B en la informacion disponible. Los siguientes datos corresponden al modelo base 01-ai/Yi-Coder-9B-Chat, por lo que no reflejan necesariamente el rendimiento del ajuste.

| Modelo | LiveCodeBench (pass rate) | Parametros |
|---|---|---|
| Yi-Coder-9B-Chat (base de AXIOM) | 23% | 9B |
| DeepSeekCoder-33B-Ins | 22,3% | 33B |
| CodeGeex4-9B-all | 17,8% | 9B |
| CodeLLama-34B-Ins | 13,3% | 34B |
| CodeQwen1.5-7B-Chat | 12% | 7B |

El modelo base es, segun la documentacion de 01.AI, el unico con menos de 10.000 millones de parametros en superar el 20% de tasa de exito en LiveCodeBench.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB con la cuantizacion Q4_K_M (~5,3 GB de pesos mas overhead de contexto y cache KV).
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, RTX 4090; tambien Mac con memoria unificada de 8 GB o mas mediante llama.cpp.
- GPU de centro de datos: A100, H100 y similares si se despliega el modelo base sin cuantizar o para mayor concurrencia.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM usando Q4_K_M.
- Opciones de despliegue: Ollama (mediante el `Modelfile` incluido) y llama.cpp. Otros runners compatibles con GGUF tambien pueden usarlo.
- Latencia y throughput estimados: no disponibles. No se publican cifras de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| AXIOM-coder-9B | 8,8B | 128K en base (8192 en Modelfile) | No publicado | Apache 2.0 | GGUF Q4_K_M |
| Yi-Coder-9B-Chat (base) | 9B | 128K | 23% | Apache 2.0 | Safetensors y GGUF (varias cuantizaciones) |
| CodeQwen1.5-7B-Chat | ~7B | No disponible | 12% | No disponible | No disponible |
| CodeGeex4-9B-all | 9B | No disponible | 17,8% | No disponible | No disponible |

AXIOM-coder-9B se distingue de Yi-Coder-9B-Chat por su ajuste especifico en Python y por su distribucion exclusiva en GGUF Q4_K_M, orientada al uso local. Frente a las alternativas de tamano similar, hereda las ventajas del base en LiveCodeBench, aunque sin benchmarks propios publicados.

## Limitaciones y advertencias

- Es un fine-tune de 9B, no un modelo frontera; no igualara a asistentes alojados de gran tamano en tareas dificiles, de contexto largo o de codificacion agentica.
- Enfocado a ingles y codigo; la capacidad en idiomas distintos del ingles es limitada porque el modelo base no es ampliamente multilingue.
- Riesgo de alucinacion: como cualquier LLM puede generar codigo incorrecto con aparente seguridad. Debe verificarse siempre la salida y no utilizarse para decisiones criticas de seguridad sin revision.
- Un ajuste de una sola epoca sobre un dataset pequeno puede sobreajustar el fraseo; conviene tratar la salida como un borrador solido, no como verdad absoluta.
- El contexto operativo esta limitado por el `num_ctx 8192` configurado en el Modelfile, muy por debajo de los 128.000 tokens que soporta el modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de instrucciones empleados.
- Sesgos conocidos: no se documentan de forma especifica en la informacion disponible; al derivar del base, hereda los sesgos de este y de los datos de entrenamiento utilizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lmoody68/AXIOM-coder-9B
- Modelo base Yi-Coder-9B-Chat: https://huggingface.co/01-ai/Yi-Coder-9B-Chat
- Modelo base Yi-Coder-9B (sin chat): https://huggingface.co/01-ai/Yi-Coder-9B
- Dataset de instrucciones de codigo: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
- Version GGUF del base por QuantFactory: https://huggingface.co/QuantFactory/Yi-Coder-9B-GGUF
- Resumen y requisitos en FitMyLLM: https://www.fitmyllm.com/model/yi-coder-9b
- Ficha de Yi-Coder-9B en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/yi-coder-9b-01-ai
- Ficha de Yi Coder 9B en b3 blog: https://b3blog.b-tech.io/en/resources/models/yi-coder-9b
