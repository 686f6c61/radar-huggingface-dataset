# mradermacher/Sijo2.0-1.7B-i1-GGUF

## Resumen

Sijo2.0-1.7B-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo myjellylabs/Sijo2.0-1.7B, generadas por mradermacher con el metodo i1 (imatrix) sobre los pesos originales en formato Hugging Face. El modelo base es un transformer de 1.728.801.600 parametros (aproximadamente 1,7 mil millones) afinado mediante LoRA y DPO para tareas de agente autonomo, razonamiento, generacion de codigo y uso de terminal Linux, segun las etiquetas declaradas por el autor. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles.

La relevancia de esta publicacion radica en que ofrece el modelo en un rango amplio de cuantizaciones (desde IQ1_S de 0,6 GB hasta Q6_K de 1,5 GB), lo que permite ejecutarlo en hardware muy modesto, incluidas GPUs de consumo con poca VRAM o incluso CPU. El repositorio ocupa 21,3 GB en total porque incluye todas las variantes, pero cada archivo individual es pequeno. Se trata de una publicacion de cuantizacion, no de un modelo nuevo: el autor del modelo es myjellylabs y mradermacher solo produce los archivos GGUF.

La informacion disponible sobre el modelo base es limitada: no se publican en la model card datos sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. Las etiquetas indican que se uso LoRA y DPO, y que el modelo esta orientado a flujos agenticos con tool calling y terminal Linux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle interno no disponible) |
| Parametros totales | 1.728.801.600 (1,7 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (metodo i1/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo base es un transformer de 1,7 mil millones de parametros. Segun las etiquetas de la model card, el entrenamiento incluyo una fase de ajuste con LoRA y una fase de optimizacion por preferencias con DPO (Direct Preference Optimization). El objetivo declarado es un modelo "standalone" para agentica, terminal Linux, codigo, razonamiento y tool calling. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la longitud de contexto nativa ni detalles de la arquitectura de atencion.

Las cuantizaciones de este repositorio se generaron con el metodo i1 de llama.cpp, que utiliza una matriz de importancia (imatrix) calculada sobre un corpus de calibracion para reducir el error de cuantizacion en pesos sensibles. El autor incluye el archivo imatrix (`Sijo2.0-1.7B.imatrix.gguf`, 0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Existe tambien un repositorio de cuantizaciones estaticas (sin imatrix) en mradermacher/Sijo2.0-1.7B-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y resolucion de problemas (etiqueta `reasoning`).
- Generacion y edicion de codigo (etiqueta `coding`).
- Tool calling / function calling (etiqueta `tool-calling`).
- Operacion en terminal Linux y flujos agenticos (etiquetas `linux-terminal`, `agentic-ai`, `standalone`).
- Capacidad de ejecucion local sin dependencias de API (etiqueta `standalone`).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Vision, audio o modo thinking explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de terminal Linux: el modelo puede integrarse en un bucle de agente que traduzca instrucciones en lenguaje natural a comandos de shell, ejecute la orden y procese la salida. Su tamano de 1,7 B permite ejecutarlo en la misma maquina que administra, sin depender de servicios externos.
- Asistente de codigo en local: con cuantizaciones Q4_K_M (1,2 GB) o Q5_K_M (1,4 GB) se puede desplegar en un portatil para autocompletado, explicacion de funciones y generacion de parches, manteniendo el codigo dentro de la maquina.
- Automatizacion de tareas de sistema: scripts que invocan al modelo para interpretar logs, proponer comandos de diagnostico o resumir la salida de herramientas como `systemctl`, `journalctl` o `df`, aprovechando su entrenamiento orientado a terminal.
- Tool calling en pipelines ligeros: al soportar function calling, puede conectarse a APIs internas o a herramientas MCP en entornos con recursos limitados, usando vLLM o llama.cpp como servidor compatible con OpenAI.
- Prototipado de agentes multi-paso: util para validar disenos de agentes (planificacion, llamada a herramientas, observacion) en fases tempranas de desarrollo antes de escalar a modelos mayores, gracias a su bajo coste de inferencia.
- Educacion y experimentacion: las cuantizaciones IQ1/IQ2 (0,6-0,8 GB) permiten ejecutar el modelo en Raspberry Pi o CPUs modestas para aprender tecnicas de cuantizacion, imatrix y despliegue GGUF.
- Filtrado y clasificacion de texto: su tamano reducido permite procesar grandes volumenes de texto en CPU con latencia aceptable para tareas de etiquetado o extraccion simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_S/IQ1_M ~0,6 GB; IQ2_* ~0,7-0,8 GB; Q3_* ~0,9-1,1 GB; Q4_K_M ~1,2 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en consumer GPU: si, en practicamente cualquier GPU dedicada de los ultimos diez anos; tambien en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (llama.cpp server, vLLM con soporte GGUF). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera que sea muy bajo en GPU de consumo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sijo2.0-1.7B (este) | 1,7 B | no disponible | Apache 2.0 | GGUF i1, safetensors | Orientado a agentica y terminal Linux; solo ingles |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 K (tipico) | Apache 2.0 | safetensors, GGUF | Multilingue, base muy extendida, benchmarks publicos |
| Llama-3.2-1B-Instruct | 1,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Multilingue, tool calling, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 K (tipico) | Apache 2.0 | safetensors, GGUF | Multilingue, entrenado con datos abiertos |

La comparativa se limita a parametros, contexto, licencia y formato porque no hay benchmarks publicados de Sijo2.0-1.7B. Las cifras de contexto de los modelos alternativos son las tipicas de sus model cards y deben verificarse en cada caso; no se dispone de datos de rendimiento comparativo para Sijo2.0.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad en razonamiento, codigo o tool calling frente a alternativas del mismo tamano.
- Riesgo de alucinacion inherente a un modelo de 1,7 B: puede inventar comandos de shell peligrosos, APIs inexistentes o rutas de archivo erroneas. En uso agentico sobre terminal es imprescindible sandboxing y revision humana de comandos destructivos.
- La longitud de contexto no esta documentada; no se debe asumir una ventana amplia en produccion.
- La model card del repositorio de cuantizacion es generica de mradermacher y no aporta informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate". Para uso real se recomienda Q4_K_M o superior.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene verificar la licencia y procedencia de los datos del modelo base en myjellylabs/Sijo2.0-1.7B.
- El repositorio ocupa 21,3 GB por incluir todas las variantes; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Sijo2.0-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/myjellylabs/Sijo2.0-1.7B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Sijo2.0-1.7B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Sijo2.0-1.7B-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
