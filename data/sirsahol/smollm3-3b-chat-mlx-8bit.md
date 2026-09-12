# SirSahOl/SmolLM3-3B-chat-mlx-8bit

## Resumen

SmolLM3-3B-chat-mlx-8bit es una conversion de pesos a formato MLX de Apple, en cuantizacion de 8 bits, del modelo HuggingFaceTB/SmolLM3-3B. La ha publicado el usuario SirSahOl mediante su pipeline MLX Foundry y esta pensada exclusivamente para ejecutar inferencia sobre Apple Silicon (M1 o posterior) con la libreria mlx-lm. No es un modelo nuevo ni un fine-tuning: se trata de una conversion weight-only, por lo que la arquitectura, el tokenizador y el comportamiento conversacional son los del modelo base, con la perdida de calidad inherente a la cuantizacion.

El interes practico esta en el formato: los pesos se distribuyen en safetensors compatibles con MLX, con un peso total de 3.075.098.624 parametros y un repositorio de 3,3 GB, lo que permite ejecutar un modelo de ~3B en equipos con memoria unificada limitada. La licencia Apache 2.0 heredada del modelo base facilita el uso comercial, y la conversion sigue siendo relevante para desarrolladores que quieren prototipar chat local en macOS sin depender de GPUs dedicadas ni de servicios en la nube.

La ficha del autor no documenta la arquitectura interna, los datos de entrenamiento ni los idiomas soportados, y los benchmarks publicados se limitan a metricas de velocidad de inferencia en un Apple M1 con 8 GB de memoria unificada (14,59 tokens/s, TTFT de 68,55 ms). No se han publicado resultados de calidad tipo MMLU, GSM8K o HumanEval para esta conversion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (conversion weight-only; hereda la del modelo base HuggingFaceTB/SmolLM3-3B) |
| Parametros totales | 3.075.098.624 (~3,08 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible; el autor advierte degradacion del rendimiento con contextos superiores a 8K tokens |
| Tipos de cuantizacion | 8 bits (esta conversion). El autor recomienda 4 bits, 8 bits o 16 bits segun la memoria disponible |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

Datos adicionales de la conversion: mlx-lm 0.31.3, tiempo de conversion 39,01 s, tamano de salida 3,1 GB, fecha 2026-09-11. El modelo base declarado es HuggingFaceTB/SmolLM3-3B con relacion `base_model_relation: quantized`.

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo subyacente, los datos de entrenamiento ni si hubo etapas de RLHF o DPO. Lo unico documentado es que se trata de una conversion de solo pesos (`weight-only conversion`): el autor indica explicitamente que «the model architecture and behavior are inherited from the source model» y que la unica transformacion aplicada es la cuantizacion a 8 bits con `mlx_lm.convert --q-bits 8`. Cualquier detalle sobre numero de capas, atencion, tokenizador o composicion del dataset debe consultarse en la model card de HuggingFaceTB/SmolLM3-3B, no en este repositorio.

La innovacion tecnica relevante aqui no es de modelado sino de despliegue: la conversion a MLX permite aprovechar la memoria unificada de los chips de Apple y el backend Metal, sin necesidad de CUDA ni de GPUs dedicadas. La reproducibilidad esta documentada paso a paso, incluida la version exacta de mlx-lm (0.31.3) y el comando de conversion, lo que permite regenerar el artefacto.

## Capacidades

- Generacion de texto y conversacion multi-turno: las etiquetas del repositorio incluyen `conversational` y `text-generation`, y la model card ofrece ejemplos de uso con `mlx_lm.chat`.
- Ejecucion local en Apple Silicon: requiere M1 o posterior; es la capacidad diferencial de esta conversion frente a los pesos originales.
- Inferencia en 8 bits: mantiene mayor fidelidad respecto al modelo base que una conversion a 4 bits, a costa de mas memoria.
- Integracion programatica: API de Python (`load`, `generate`) y CLI (`mlx_lm.chat`, `mlx_lm.generate`) con `max_tokens` configurable.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion proporcionada.
- Ajuste de agresividad de cuantizacion: el autor documenta alternativas de 4 y 16 bits segun el hardware.

## Casos de uso

- Asistentes de chat locales en macOS: un desarrollador puede levantar un chat interactivo con `mlx_lm.chat --model SirSahOl/SmolLM3-3B-chat-mlx-8bit` sin enviar datos a la nube. Es adecuado porque el modelo es conversacional y la conversion esta optimizada para memoria unificada de Apple.
- Procesamiento de datos sensibles o bajo confidencialidad: al ejecutarse integramente en el equipo, permite resumir o transformar documentos internos (contratos, informes medicos, codigo propietario) sin que salgan de la maquina. El requisito de Apple Silicon encaja con el parque de portatiles de muchos equipos de desarrollo.
- Prototipado rapido de productos de IA antes de decidir el modelo final: con 3,1 GB de pesos y una API de Python de dos lineas, sirve para validar prompts, flujos conversacionales y formatos de salida sin coste de GPU cloud.
- Generacion y asistencia de codigo en tareas ligeras: autocompletado, explicacion de fragmentos o generacion de tests en un editor local. El tamano de ~3B limita la complejidad de los problemas abordables, por lo que es apropiado para tareas de baja y media dificultad.
- Educacion e investigacion sobre cuantizacion: el repositorio documenta el comando exacto de conversion y permite comparar la misma familia de pesos en 4, 8 y 16 bits para medir el impacto de la cuantizacion en la calidad de las respuestas.
- Aplicaciones de escritorio integradas en macOS: al usar MLX y safetensors, la inferencia puede embeberse en apps nativas (por ejemplo, herramientas de nota-taking o correccion de estilo) sin dependencias de CUDA.
- Evaluacion comparativa de rendimiento en hardware Apple: los datos publicados (14,59 tokens/s y 68,55 ms de TTFT en un M1 de 8 GB) permiten estimar si el modelo cumple un presupuesto de latencia para interfaces de chat en streaming.
- Uso como linea base en pipelines de investigacion: al ser una conversion reproducible de un modelo Apache 2.0, sirve como referencia estable para experimentos que necesiten un modelo pequeno con comportamiento conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, HumanEval u otros) en la informacion disponible. El autor solo publica metricas de inferencia:

| Metrica | Valor (8 bits) | Condiciones |
|---|---|---|
| Tokens por segundo | 14,59 | Apple M1, 8 GB de memoria unificada, media de 5 ejecuciones, 256 tokens max |
| TTFT (time to first token) | 68,55 ms | Mismas condiciones |
| Memoria pico | 116,6 MB | Mismas condiciones; cifra publicada por el autor no coherente con el tamano del repositorio (3,3 GB), por lo que probablemente no refleje el consumo real del modelo cargado |

Advertencia sobre estos numeros: al tratarse de una media de 5 ejecuciones con `max_tokens=256`, no informan sobre rendimiento en contextos largos ni sobre throughput en batalla (batching). Tampoco hay comparacion con el modelo base sin cuantizar en las mismas condiciones.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: los pesos ocupan 3,1 GB (repositorio de 3,3 GB). Con cache KV y overhead del runtime, el consumo realista se situa en el entorno de 4-4,5 GB para contextos cortos y crece con la longitud del contexto. Estimacion derivada del tamano del repositorio, no publicada por el autor.
- Requisito de plataforma: Apple Silicon M1 o posterior. MLX no se ejecuta en GPUs NVIDIA, AMD ni en CPU x86 convencional.
- Guia del propio autor por hardware: M1/M2 con 8 GB, usar la variante de 4 bits; M1/M2 Pro/Max con 16-32 GB, usar 8 bits (esta conversion); M2/M3/M4 Ultra con 64 GB o mas, usar 16 bits.
- Cabe en GPU de consumo: no aplica en el sentido habitual; no hay soporte de CUDA. El equivalente practico es un Mac con memoria unificada de 8 GB o superior, aunque para 8 bits el autor recomienda 16 GB o mas.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, o API de Python con `load` y `generate`); tambien `mlx_lm.convert` para regenerar la conversion. No hay version GGUF, por lo que no es compatible con llama.cpp, Ollama ni LM Studio en su formato actual; tampoco se documenta soporte de vLLM o TGI.
- Latencia y throughput: 14,59 tokens/s y 68,55 ms de TTFT medidos en un Apple M1 con 8 GB. En chips M Pro, Max o Ultra el rendimiento deberia ser superior, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con su propio modelo de origen. No se han proporcionado datos de modelos alternativos de tamano similar (por ejemplo, otras familias de ~3B) ni resultados de calidad comparables.

| Modelo | Parametros | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| SirSahOl/SmolLM3-3B-chat-mlx-8bit | 3.075.098.624 | No disponible | safetensors MLX, 8 bits | apache-2.0 | 14,59 tokens/s y 68,55 ms de TTFT en Apple M1 (datos del autor) |
| HuggingFaceTB/SmolLM3-3B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | apache-2.0 (heredada) | No disponible |
| Alternativas de ~3B de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible |

No disponible: no se han encontrado en la busqueda web enlaces ni datos tecnicos relevantes sobre modelos comparables que puedan incorporarse a esta ficha. La busqueda devolvio unicamente herramientas de medicion de velocidad de conexion, sin relacion con el modelo.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el autor reconoce que la conversion introduce una pequena perdida respecto al modelo original y que a menor numero de bits, mayor degradacion. La cuantizacion de 8 bits es un compromiso, no una copia exacta.
- Contextos largos: la model card advierte de posible degradacion del rendimiento con contextos superiores a 8K tokens en niveles bajos de cuantizacion. No se especifica la ventana de contexto nativa del modelo base en esta ficha.
- Dependencia de plataforma: requiere Apple Silicon (M1 o posterior). No es ejecutable en GPUs NVIDIA o AMD, ni en servidores x86 con CUDA, lo que limita su uso en produccion sobre infraestructura cloud convencional.
- Formato no universal: al ser safetensors para MLX, no es compatible con llama.cpp, Ollama, LM Studio, vLLM ni TGI sin una nueva conversion a otro formato.
- Sin datos de calidad publicados: no hay MMLU, GSM8K, HumanEval ni evaluaciones de sesgo, alucinacion o seguridad para esta conversion.
- Herencia completa del modelo base: sesgos, alucinaciones y limitaciones idiomaticas son los del modelo SmolLM3-3B, y deben consultarse en su model card. Esta ficha no los documenta porque la informacion proporcionada no los incluye.
- Idiomas no declarados: el repositorio no especifica que idiomas soporta, por lo que el rendimiento en castellano no esta garantizado ni medido.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la unica version publicada (v1.0) data del 2026-09-11. No hay historial de mantenimiento ni validacion por parte de terceros.
- Dato de memoria sospechoso: la cifra de 116,6 MB de memoria pico publicada por el autor no es coherente con los 3,3 GB del repositorio. Conviene medir el consumo real antes de dimensionar hardware en funcion de ese numero.
- Licencia: Apache 2.0, que permite uso comercial, pero el usuario debe verificar las condiciones completas en la model card del modelo base, incluidas posibles obligaciones de atribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/SmolLM3-3B-chat-mlx-8bit
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Perfil del autor: https://huggingface.co/SirSahOl
- MLX (Apple): https://github.com/ml-explore/mlx
- Pipeline de conversion MLX Foundry: https://github.com/SirSahOl/mlx-foundry
- Variante de 8 bits (misma que esta ficha): https://huggingface.co/SirSahOl/SmolLM3-3B-chat-mlx-8bit

Nota: la busqueda web realizada no aporto enlaces relevantes sobre el modelo, su arquitectura o modelos comparables; los resultados obtenidos fueron herramientas de medicion de velocidad de red y no se incluyen.
