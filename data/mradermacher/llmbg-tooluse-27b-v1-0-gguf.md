# mradermacher/LLMBG-ToolUse-27B-v1.0-GGUF

## Resumen

LLMBG-ToolUse-27B-v1.0-GGUF es la version cuantizada en formato GGUF del modelo Tucan-27B-v1.0, desarrollado por el colectivo llm-bg y especializado en uso de herramientas (tool use / function calling) para el idioma bulgaro. Esta publicacion corre a cargo de mradermacher, un conocido cuantizador de la comunidad que distribuye versiones GGUF estaticas (sin imatrix) del modelo original. El modelo cuenta con 27.227.128.320 parametros totales (aproximadamente 27,2 mil millones) y esta pensado para ejecutarse en entornos de inferencia local mediante llama.cpp y herramientas compatibles con GGUF.

El modelo resuelve el problema de dotar a un LLM de capacidad fiable de invocacion de funciones y agentes en bulgaro, un idioma con relativamente pocos modelos especializados. Los tags del repositorio (function_calling, MCP, tool_use) indican que el modelo ha sido ajustado especificamente para protocolos de llamada a herramientas y para el Model Context Protocol (MCP), lo que lo hace relevante para pipelines de agentes que necesitan operar en lengua bulgara.

La relevancia actual radica en que permite desplegar un modelo de 27B especializado en tool use en hardware de consumo gracias a las cuantizaciones GGUF, que van desde Q2_K (10,5 GB) hasta Q8_0 (29,0 GB). La licencia es gemma, heredada del modelo base, lo que impone las condiciones de uso de la familia Gemma de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Tucan-27B-v1.0; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 27.227.128.320 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | bg (bulgaro) |
| Licencia | gemma |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Tucan-27B-v1.0 en la informacion proporcionada. El nombre y el tamano (27,2B parametros) sugieren una arquitectura transformer densa, pero no se confirma si emplea atencion lineal, decodificacion especulativa u otras innovaciones. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Lo que si se conoce es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) directamente a partir de los pesos en formato Hugging Face del modelo base. Adicionalmente, el autor indica que existen cuantizaciones ponderadas con imatrix en un repositorio separado (LLMBG-ToolUse-27B-v1.0-i1-GGUF), que suelen ofrecer mejor calidad por tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto en bulgaro como idioma principal.
- Invocacion de funciones (function calling) y uso de herramientas (tool use), segun los tags del repositorio.
- Soporte del Model Context Protocol (MCP), lo que facilita la integracion en arquitecturas de agentes que usan este estandar.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere que puede servirse a traves de APIs compatibles con OpenAI.
- Razonamiento multi-paso orientado a agentes, derivado de su especializacion en tool use (no confirmado con benchmarks).
- Capacidades multilingues: limitadas al bulgaro segun el campo language del repositorio.
- Capacidades de vision, audio o modo thinking: no disponibles.

## Casos de uso

- Agentes de automatizacion en bulgaro: el modelo puede gestionar cadenas de llamadas a herramientas (APIs, bases de datos, servicios externos) en lengua bulgara, aprovechando su ajuste especifico en function calling para orquestar tareas multi-paso.
- Integracion en pipelines MCP: al soportar el Model Context Protocol, encaja en arquitecturas de agentes que exponen herramientas mediante servidores MCP, permitiendo construir asistentes que consultan recursos externos de forma estandarizada.
- Asistentes de atencion al cliente en bulgaro: puede gestionar conversaciones multi-turno e invocar funciones de consulta de pedidos, estado de cuenta o reservas mediante tool calling, siempre que el contexto disponible sea suficiente (no confirmado).
- Automatizacion de back-office: extraccion de datos de formularios y sistemas internos mediante llamadas a funciones tipadas, adecuado para entornos donde el idioma de trabajo sea el bulgaro.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones Q4_K_M (16,7 GB) y Q5_K_M (19,5 GB), puede ejecutarse en GPUs de consumo de gama alta (24 GB de VRAM) para prototipado y pruebas de agentes sin depender de la nube.
- Evaluacion de agentes en idiomas de bajos recursos: util como modelo de referencia para investigar el rendimiento de tool calling en bulgaro frente a modelos multilingues genericos.
- Servicio de inferencia con llama.cpp u Ollama: las cuantizaciones Q4_K_S y Q4_K_M estan marcadas como "fast, recommended" por el autor, lo que las hace idoneas para servir el modelo en produccion ligera con latencia aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto):
  - Q2_K: ~10,5 GB de pesos; ~12-13 GB con contexto moderado.
  - Q4_K_M: ~16,7 GB de pesos; ~18-20 GB con contexto moderado.
  - Q5_K_M: ~19,5 GB de pesos; ~21-23 GB con contexto moderado.
  - Q6_K: ~22,4 GB de pesos; ~24-26 GB con contexto moderado.
  - Q8_0: ~29,0 GB de pesos; requiere ~32 GB o mas.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB (RTX 4080, 4070 Ti Super) para Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: si, en modelos de 24 GB para cuantizaciones Q4/Q5; en 16 GB para Q3/IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). Para el modelo base en safetensors, vLLM o TGI (no confirmado para esta version GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| LLMBG-ToolUse-27B-v1.0-GGUF | 27,2B | no disponible | Tool use en bulgaro | gemma | GGUF |
| Tucan-27B-v1.0 (base) | 27,2B | no disponible | Modelo base | gemma | safetensors |
| LLMBG-ToolUse-27B-v1.0-i1-GGUF | 27,2B | no disponible | Tool use en bulgaro (imatrix) | gemma | GGUF |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (tool use en bulgaro) en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta orientado exclusivamente al bulgaro (language: bg); su rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia gemma: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Gemma de Google, que impone restricciones de uso aceptable y obligaciones de atribucion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad; como todo LLM, puede generar llamadas a funciones con argumentos incorrectos o inventar herramientas inexistentes.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de tool calling, lo que impide validar su calidad frente a alternativas.
- Contexto desconocido: se desconoce la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos o historiales extensos.
- Cuantizaciones de baja calidad: el autor advierte que Q3_K_M es de "lower quality"; para produccion se recomienda Q4_K_M o superior, o bien las versiones imatrix del repositorio i1.
- Popularidad limitada: 191 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Fecha de actualizacion futura: el repositorio muestra una fecha de actualizacion posterior a la de creacion (2026-11-13), lo que puede indicar revisiones; conviene verificar la integridad de los archivos descargados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LLMBG-ToolUse-27B-v1.0-GGUF
- Modelo base: https://huggingface.co/llm-bg/Tucan-27B-v1.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LLMBG-ToolUse-27B-v1.0-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#LLMBG-ToolUse-27B-v1.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
