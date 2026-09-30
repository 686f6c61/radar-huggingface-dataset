# OliviaRossi/OliviaRossi_MiMo-Ornith-9B-AGSI-GGUF

## Resumen

OliviaRossi_MiMo-Ornith-9B-AGSI-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo MiMo-Ornith-9B-AGSI, publicado por el usuario OliviaRossi y generado con llama.cpp (release b11159) mediante cuantizacion con matriz de importancia (imatrix). El modelo original es un "merge" etiquetado con las familias qwen y qwen3_5, orientado a razonamiento, codigo, uso agentico, uso de terminal y tool calling, segun los tags declarados por el autor.

El modelo base declara 9.197.093.888 parametros reales en safetensors (aproximadamente 9,2 mil millones), aunque la model card del repositorio GGUF indica "10B" de forma aproximada. Soporta unicamente entrada de texto, esta disponible en ingles y chino, y se distribuye bajo licencia Apache 2.0. Incorpora decodificacion especulativa mediante MTP (multi-token prediction), un detalle relevante para latencia en inferencia.

La relevancia de este repositorio es practica: al ser una publicacion exclusivamente de cuantizaciones GGUF, permite ejecutar un modelo de ~9B orientado a agentes y codigo en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp), sin necesidad de GPU de datacenter. No se han publicado resultados de benchmarks ni detalles de arquitectura o entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren familia qwen / qwen3_5; no confirmado) |
| Parametros totales | 9.197.093.888 (safetensors); la model card indica "10B" |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0 (lista truncada en la informacion disponible) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones del modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los tags del repositorio apuntan a una base de la familia qwen3_5 como origen del merge, y el nombre del modelo (MiMo-Ornith-9B-AGSI) indica un proceso de fusion de pesos ("merge") con el sufijo AGSI, cuyo significado no se explica en la informacion disponible. El recuento real de parametros en safetensors es de 9.197.093.888.

El unico detalle tecnico confirmado sobre inferencia es el uso de decodificacion especulativa mediante MTP (multi-token prediction), declarado en la model card. La cuantizacion se realizo con llama.cpp release b11159 aplicando imatrix, un metodo que pondera la importancia de los pesos a partir de estadisticas de activacion para preservar mejor la calidad en tamanos bajos. No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, con formato de prompt ChatML (`<|im_start|>` / `<|im_end|>`) y bloque de razonamiento `<think>`.
- Razonamiento explicito mediante modo thinking, activado al abrir el turno del asistente con `<think>`.
- Generacion de codigo y tareas de programacion, segun los tags "coding" y "swe-bench".
- Uso agentico y multi-paso, con tags "agentic", "terminal-use" y "tool-use".
- Tool calling / function calling con un formato XML propio: bloques `<tool_call>` que contienen un `<function=...>` con parametros `<parameter=...>`.
- Capacidades multilingues limitadas a ingles (en) y chino (zh).
- Entrada exclusivamente de texto: no se declara soporte de vision ni audio.
- Decodificacion especulativa MTP para acelerar la generacion.

## Casos de uso

- Asistente de codigo en terminal: el modelo declara soporte de terminal-use y tool calling, por lo que puede integrarse en agentes de linea de comandos que ejecutan comandos, leen ficheros y proponen parches de forma iterativa.
- Resolucion de issues y tareas tipo SWE-bench: dado el tag "swe-bench", encaja en pipelines que reciben un repositorio y un problema descrito en lenguaje natural y deben producir un cambio de codigo verificable con tests.
- Agente de automatizacion con herramientas externas: el formato `<tool_call>` permite conectar el modelo a APIs (por ejemplo, consulta de precios de acciones, tal como ilustra la propia model card) y encadenar varias llamadas en una tarea.
- Atencion al cliente en ingles y chino: al soportar ambos idiomas de forma nativa, sirve para despliegues bilingues de soporte conversacional sin necesidad de un modelo adicional de traduccion.
- Generacion asistida con razonamiento visible: el bloque `<think>` permite auditar la cadena de razonamiento antes de la respuesta final, util en entornos donde se requiere trazabilidad de decisiones.
- Despliegue local en estaciones de trabajo: con cuantizaciones desde 5,6 GB (Q4_K_S) hasta 9,8 GB (Q8_0), el modelo cabe en GPUs de consumo y permite prototipado sin coste de API.
- Extraccion y transformacion de datos estructurados: el modo razonamiento mas salida controlada facilita tareas de parsing y normalizacion de texto en pipelines ETL.
- Evaluacion comparativa interna: al ser una cuantizacion imatrix, sirve como referencia reproducible para medir degradacion por cuantizacion frente al bf16 de 18,41 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los tags "swe-bench", "coding" y "reasoning" indican el ambito objetivo del modelo, pero no se acompanan de cifras (MMLU, HumanEval, GSM8K, SWE-bench u otras).

## Requisitos de hardware

- VRAM estimada segun el fichero GGUF (tamano en disco mas overhead de contexto y cache KV):
  - Q4_K_S: 5,62 GB; Q4_K_M: 5,98 GB; IQ4_NL: 5,96 GB; Q4_1: 6,08 GB; Q4_K_L: 6,34 GB.
  - Q5_K_S: 6,63 GB; Q5_K_M: 7,01 GB.
  - Q6_K_S: 7,65 GB; Q6_K: 7,93 GB; Q6_K_L: 8,24 GB.
  - Q8_0: 9,80 GB; bf16: 18,41 GB.
- GPU recomendadas: no indicadas por el autor. Por tamano, una RTX 3060 de 12 GB o superior puede ejecutar comodamente las cuantizaciones Q4 y Q5; una RTX 4090 (24 GB) permite Q8_0 e incluso bf16 con contexto limitado. Para bf16 con contexto largo son necesarias GPUs de datacenter (A100 40/80 GB, H100).
- Cabe en GPU de consumo: si, en las cuantizaciones de 4 y 5 bits (5,6-7 GB), y en 6 bits (7,6-8,2 GB) con GPUs de 12 GB o mas.
- Opciones de despliegue: llama.cpp (release b11159 o posterior, usado para la cuantizacion), y los proyectos derivados habituales compatibles con GGUF (Ollama, LM Studio, koboldcpp, llama-cpp-python). vLLM y TGI no cargan GGUF de forma nativa en su flujo estandar; para esos motores habria que usar el modelo base en safetensors. El repositorio se marca como "endpoints_compatible".
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP puede reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

Categoria: modelos densos de ~8-10B orientados a texto, codigo y agentes, en ingles y chino.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| OliviaRossi_MiMo-Ornith-9B-AGSI-GGUF | 9,2B (declarado 10B) | no disponible | apache-2.0 | GGUF | no disponible |
| Modelo base OliviaRossi/MiMo-Ornith-9B-AGSI | 9,2B | no disponible | apache-2.0 | safetensors | no disponible |
| Qwen3-8B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Llama 3.1 8B Instruct | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas equivalentes.

## Limitaciones y advertencias

- No hay informacion sobre sesgos del modelo, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO), por lo que el riesgo de sesgo no puede evaluarse.
- Riesgo de alucinacion inherente a los modelos generativos; el modo `<think>` expone el razonamiento pero no lo valida, por lo que puede producir cadenas coherentes con conclusiones incorrectas.
- Idiomas soportados limitados a ingles y chino: el castellano no figura como idioma declarado, por lo que su rendimiento en espanol es incierto.
- La longitud de contexto no se especifica, lo que impide planificar despliegues con documentos largos o historiales extensos.
- Es un proceso de "merge": la fusion de pesos puede introducir degradaciones dificiles de diagnosticar y no auditables sin la model card del modelo base.
- La lista de ficheros de cuantizacion aparece truncada en la informacion disponible; conviene verificar el repositorio antes de automatizar descargas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un merge sobre una base qwen3_5 conviene revisar los terminos del modelo base y de los modelos originales fusionados.
- La model card advierte de un formato de tool calling estricto (XML anidado con `<tool_call>` y `<function=...>`); un formateo incorrecto puede provocar fallos silenciosos en agentes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OliviaRossi/OliviaRossi_MiMo-Ornith-9B-AGSI-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI
- Repositorio de referencia de cuantizaciones (bartowski): https://huggingface.co/bartowski/OliviaRossi_MiMo-Ornith-9B-AGSI-GGUF
- llama.cpp, release b11159 usada para la cuantizacion: https://github.com/ggml-org/llama.cpp/releases/tag/b11159
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp/
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda disponibles.
