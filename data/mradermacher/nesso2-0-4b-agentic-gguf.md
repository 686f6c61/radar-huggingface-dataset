# mradermacher/nesso2-0.4B-agentic-GGUF

## Resumen

Nesso2-0.4B-Agentic-GGUF es la version cuantizada en formato GGUF del modelo mii-llm/nesso2-0.4B-agentic, un small language model bilingue (italiano e ingles) de aproximadamente 0,44 mil millones de parametros disenado especificamente para function calling y ejecucion agentica. Las cuantizaciones las produce mradermacher, que publica los ficheros GGUF de forma estatica a partir de los pesos originales. El modelo base lo desarrolla mii-llm (grupo zagreus-nesso-slm), que lo presenta como el modelo abierto mas fuerte para uso de herramientas en italiano dentro de la clase sub-billion de parametros.

La relevancia de este modelo reside en su combinacion de tamano minimo (437.760.960 parametros reales), licencia Apache-2.0 y especializacion en tool use y salida estructurada, lo que lo hace candidato para despliegue en entornos de edge computing, dispositivos con recursos limitados y pipelines de agentes donde el coste por inferencia y la latencia son criticos. Al estar disponible en GGUF con cuantizaciones desde Q2_K hasta f16, puede ejecutarse en CPU, en GPUs de consumo e incluso en hardware embebido.

La arquitectura es de tipo llama (transformer denso, no MoE), con pesos originales publicados por mii-llm y etiquetas que apuntan a uso de nanotron y TRL en el entrenamiento. El repositorio GGUF ocupa 4,8 GB en total por incluir todas las variantes de cuantizacion, aunque cada fichero individual pesa entre 0,4 GB y 1,0 GB. No se dispone de datos publicados sobre longitud de contexto, composicion del dataset ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (transformer denso) |
| Parametros totales | 437.760.960 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en transformers/safetensors |
| Modelo base | mii-llm/nesso2-0.4B-agentic |
| Biblioteca declarada | transformers |
| Tipo de modelo | llama |
| Tamano del repositorio | 4,8 GB (todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo llama con 437.760.960 parametros, orientado a la clase sub-billion (por debajo de los 1.000 millones). No emplea mezcla de expertos ni arquitecturas hibridas SSM segun la informacion disponible. Las etiquetas de la model card original incluyen `llama`, `nanotron` y `trl`, lo que indica que el entrenamiento se apoyo en el framework Nanotron para el preentrenamiento distribuido y en TRL para fases de ajuste (previsiblemente SFT y/o alineamiento orientado a instrucciones y uso de herramientas), aunque no se especifican en la informacion disponible ni el numero de tokens de entrenamiento ni la composicion exacta del dataset ni si hubo RLHF o DPO.

El proposito declarado del modelo, segun el repositorio GitHub del autor, es el function calling y la ejecucion agentica, con enfasis en salida estructurada y tool use. La model card del repositorio GGUF no incluye detalles adicionales sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal u optimizaciones de inferencia; se trata de una conversion estatica de pesos sin modificaciones arquitectonicas. Las cuantizaciones son estaticas (no ponderadas con imatrix), segun indica el propio autor.

## Capacidades

- Generacion de texto bilingue en italiano e ingles.
- Function calling y tool use: el modelo esta especializado en invocar herramientas externas y devolver llamadas estructuradas.
- Salida estructurada: orientado a formatos parseables para integracion en pipelines de agentes.
- Ejecucion agentica: disenado para flujos de razonamiento multi-paso con uso de herramientas, segun la descripcion del autor del modelo base.
- Formato conversacional: la model card lo marca como `conversational`.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`.
- No se documentan en la informacion disponible capacidades de vision, audio, thinking mode explicito ni modos de razonamiento extendido.

## Casos de uso

- Agentes de automatizacion en edge: al ocupar entre 0,4 GB y 1,0 GB segun cuantizacion, puede desplegarse en dispositivos con poca memoria y ejecutar bucles de tool calling localmente sin conexion a servicios en la nube.
- Atencion al cliente bilingue italiano/ingles: el modelo puede gestionar conversaciones multi-turno y derivar acciones a funciones internas (consulta de pedidos, cambio de direccion) mediante function calling estructurado.
- Orquestacion de APIs en microservicios: integrado como componente de enrutamiento que decide que endpoint invocar y con que parametros, devolviendo JSON parseable.
- Extraccion de datos estructurados: conversion de texto libre en italiano o ingles a esquemas JSON predefinidos para ingesta en bases de datos o ETL.
- Asistentes integrados en aplicaciones moviles: su tamano permite empaquetarlo con llama.cpp o Ollama dentro de una app sin depender de conectividad.
- Prototipado rapido de pipelines agenticos: sirve como modelo de bajo coste para validar arquitecturas de agentes antes de escalar a modelos mayores.
- Clasificacion y enrutamiento de intenciones: uso como primer nivel de decision en sistemas con multiples herramientas o subagentes.
- Educacion e investigacion en SLM: banco de pruebas para estudiar cuantizacion, trade-offs de calidad y comportamiento de tool calling en modelos sub-billion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y los resultados de busqueda no aportan cifras. El autor del modelo base afirma, en el repositorio GitHub, que se trata del "modelo abierto mas fuerte para uso de herramientas agenticas en italiano dentro de la clase sub-billion", pero no se aportan numeros que respalden esa afirmacion en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion (peso de los pesos, sin contar KV cache):
  - Q2_K: ~0,4 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: ~0,4 GB
  - Q4_K_S: ~0,4 GB
  - Q4_K_M: ~0,5 GB
  - Q5_K_S / Q5_K_M: ~0,5 GB
  - Q6_K: ~0,6 GB
  - Q8_0: ~0,6 GB
  - f16: ~1,0 GB
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, e incluso en iGPUs y aceleradores integrados. Para CPU pura y hardware embebido tipo Raspberry Pi es viable con cuantizaciones bajas.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de memoria, y en muchos casos directamente en CPU.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers. No se documenta soporte oficial en vLLM o TGI para esta variante GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- Nota del autor: las cuantizaciones ponderadas/imatrix no estan disponibles por el momento; solo hay cuantizaciones estaticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|---|
| nesso2-0.4B-agentic (este) | 437.760.960 | no disponible | it, en | apache-2.0 | GGUF / safetensors | Function calling, agentic, salida estructurada |
| Qwen2.5-0.5B-Instruct | ~0,5B (por nombre) | no disponible en la informacion proporcionada | multilingue (segun catalogo publico) | no disponible en la informacion proporcionada | safetensors, GGUF (terceros) | Instrucciones generales, tool calling basico |
| SmolLM2-360M-Instruct | ~0,36B (por nombre) | no disponible en la informacion proporcionada | ingles principalmente | no disponible en la informacion proporcionada | safetensors, GGUF (terceros) | Instrucciones generales en ingles |
| Functionary-small / modelos de tool use | no disponible | no disponible | no disponible | no disponible | no disponible | Function calling |

Los datos de contexto, rendimiento y licencias de los modelos alternativos no estaban incluidos en la informacion proporcionada, por lo que se marcan como no disponibles. La comparativa se limita a la clase de tamano y a la especializacion declarada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; cualquier modelo bilingue it/en entrenado con datos web puede heredar sesgos de esos corpus.
- Riesgo de alucinacion: con apenas 437 millones de parametros, la capacidad de conocimiento factual es limitada; es esperable que falle en tareas de conocimiento amplio y que deba apoyarse en herramientas externas.
- Idiomas: cobertura declarada unicamente de italiano e ingles. No hay soporte documentado de castellano, por lo que su uso en espanol no esta garantizado ni evaluado.
- Limitaciones de contexto: la longitud de contexto no esta publicada; conviene verificarla antes de disenar flujos con historiales largos.
- Licencia: Apache-2.0, lo que permite uso comercial, modificacion y redistribucion, siempre manteniendo el aviso de licencia y atribucion correspondiente. Al ser una cuantizacion de un modelo base Apache-2.0, la licencia se mantiene.
- Caveat de produccion: las cuantizaciones Q2_K y Q3_K degradan la calidad; para uso agentico en produccion se recomienda Q4_K_M o superior. El propio autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q6_K como "very good quality".
- Caveat de cuantizacion: son cuantizaciones estaticas, no ponderadas con imatrix, lo que puede implicar una perdida de calidad algo mayor que las variantes ponderadas equivalentes.
- Especializacion estrecha: el modelo esta optimizado para tool use y salida estructurada; su rendimiento en tareas generativas abiertas sera inferior al de modelos de mayor tamano.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- Fecha de creacion registrada: 2026-10-05, sin informacion adicional sobre actualizaciones posteriores.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/nesso2-0.4B-agentic-GGUF
- Modelo base: https://huggingface.co/mii-llm/nesso2-0.4B-agentic
- Pagina de descarga y vision general de cuantizaciones: https://hf.tst.eu/model#nesso2-0.4B-agentic-GGUF
- Repositorio GitHub del modelo (zagreus-nesso-slm, rama nesso2): https://github.com/mii-llm/zagreus-nesso-slm/tree/main/nesso2
- Perfil del cuantizador en HuggingFace: https://huggingface.co/mradermacher/models
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
