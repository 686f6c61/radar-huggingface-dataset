# mradermacher/LFM2.5-2.6B-opencode-RL-GGUF

## Resumen

LFM2.5-2.6B-opencode-RL-GGUF es una cuantizacion en formato GGUF del modelo FineEnvs/LFM2.5-2.6B-opencode-RL, publicada por el usuario mradermacher. Se trata de un derivado de LFM2.5-2.6B, el modelo denso de 2.600 millones de parametros de Liquid AI disenado para cargas de trabajo agenticas, con ventana de contexto de 128.000 tokens y tool calling nativo. La variante "opencode-RL" anade un ajuste posterior mediante aprendizaje por refuerzo (GRPO) sobre entornos de agente, orientado a tareas de codificacion con agentes.

El interes de esta ficha es doble. Por un lado, permite ejecutar un modelo agentico en hardware de consumo gracias a las 12 cuantizaciones disponibles (desde Q2_K de 1,2 GB hasta f16 de 5,5 GB). Por otro, documenta un caso de RL aplicado a un modelo pequeno sobre el dataset FineEnvs/SmolDataEnvs-harbor-train, con los tags openenv, harbor, smoldataenvs y opencode, lo que lo situa en la interseccion entre agentes de codigo y entrenamiento por refuerzo en entornos.

El repositorio ocupa 24,3 GB e incluye unicamente pesos GGUF (no safetensors). El modelo base sobre el que se construye es en ingles y se distribuye bajo la licencia LFM Open License v1.0 (lfm1.0). No se han publicado resultados de benchmarks ni metricas de evaluacion especificas para esta variante cuantizada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia LFM2.5 de Liquid AI) |
| Parametros totales | 2.697.198.592 (~2,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (segun la documentacion del modelo base LFM2.5-2.6B; no se especifica en la model card de esta cuantizacion) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles); el modelo base LFM2.5-2.6B declara soporte de 16 idiomas |
| Licencia | lfm1.0 (LFM Open License v1.0), etiquetada como "other" en HuggingFace |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El punto de partida es LFM2.5-2.6B de Liquid AI, un modelo denso de 2,6 mil millones de parametros orientado a agentes, con ventana de 128.000 tokens y soporte nativo de llamadas a herramientas. Sobre esa base, el modelo FineEnvs/LFM2.5-2.6B-opencode-RL aplica un ajuste por refuerzo con GRPO (Group Relative Policy Optimization) utilizando como senal de recompensa entornos de agente. Los tags del repositorio (trl, openenv, harbor, smoldataenvs, grpo, opencode) y el dataset declarado (FineEnvs/SmolDataEnvs-harbor-train) indican que el entrenamiento se realizo en entornos ejecutables tipo Harbor/OpenEnv, con tareas de agente de codificacion asociadas a la herramienta OpenCode.

Esta publicacion concreta no es un modelo nuevo, sino una cuantizacion estatica generada por mradermacher (quantize_version 2, convert_type hf, output_tensor_quantised 1) a partir de los pesos del modelo base. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset de RL ni hiperparametros del GRPO. Tampoco se documentan innovaciones de decodificacion (decodificacion especulativa, atencion lineal u otras) en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento conversacional en ingles, heredadas del modelo base LFM2.5-2.6B.
- Tool calling y function calling nativos, segun la documentacion del modelo base.
- Ejecucion de flujos de agente multi-paso, con enfasis en entornos de codificacion (opencode) tras el ajuste por RL.
- Ajuste especifico para tareas de agente en entornos ejecutables (OpenEnv / Harbor), incluida la interaccion con herramientas y la resolucion de tareas con recompensa verificable.
- Capacidades de extraccion de datos estructurados y RAG heredadas del modelo base, segun la documentacion de Liquid AI.
- Capacidades multilingues limitadas: la model card de esta variante declara unicamente ingles, aunque el modelo base LFM2.5-2.6B declara soporte de 16 idiomas.
- Ejecucion en CPU y GPU de gama baja gracias al formato GGUF y a las cuantizaciones de bajo bit (Q2_K a Q4_K).

## Casos de uso

- Agente de codificacion en local: el modelo puede actuar como nucleo de un agente que lee, edita y ejecuta codigo en un repositorio, apoyandose en tool calling nativo y en el ajuste RL sobre el entorno opencode. Es adecuado para equipos que quieren automatizar tareas de refactorizacion sin enviar codigo a la nube.
- Asistente de terminal y CLI: integrado mediante llama.cpp u Ollama, sirve como ayuda contextual para generar comandos, interpretar salidas de error y proponer correcciones dentro de una sesion de shell.
- RAG sobre documentacion tecnica: con 128.000 tokens de contexto, permite inyectar manuales, ficheros de cabecera o especificaciones extensas y responder consultas con contexto largo, reduciendo la fragmentacion tipica de modelos con ventanas cortas.
- Extraccion de datos estructurados: conversion de texto no estructurado (logs, correos, incidencias) a JSON u otros esquemas mediante salidas con formato controlado, un caso de uso citado explicitamente por Liquid AI para la familia LFM2.5.
- Automatizacion de triaje de issues y pull requests: un pipeline puede clasificar, resumir y etiquetar incidencias, y proponer parches preliminares que un humano revisa antes de fusionar.
- Prototipado en dispositivos de borde: con cuantizaciones de 1,2 a 1,8 GB, el modelo cabe en mini-PC, Raspberry Pi con 8 GB de RAM o portatiles sin GPU dedicada, lo que habilita demos y pruebas de concepto sin infraestructura cloud.
- Investigacion en RL para agentes: sirve como linea base reproducible para comparar tecnicas de GRPO sobre entornos de codigo, dado que el dataset y el pipeline (TRL, OpenEnv, Harbor) estan declarados en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizacion ni los resultados de busqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones para esta variante ni para el modelo base del que deriva.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin cache KV): Q2_K ~1,2 GB; Q3_K_S ~1,4 GB; Q3_K_M ~1,5 GB; Q3_K_L ~1,6 GB; IQ4_XS ~1,6 GB; Q4_K_S ~1,7 GB; Q4_K_M ~1,8 GB; Q5_K_S y Q5_K_M ~2,0 GB; Q6_K ~2,3 GB; Q8_0 ~3,0 GB; f16 ~5,5 GB.
- La cache KV para una ventana de 128.000 tokens anade un consumo adicional considerable que no se detalla en la informacion disponible; para contextos largos conviene reservar VRAM extra o reducir la ventana con opciones de llama.cpp.
- GPU de consumo viables: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090 24 GB, e incluso GTX 1060 6 GB para las cuantizaciones Q4 y Q5. Las tarjetas de 6 a 8 GB pueden ejecutar Q4_K_M con contexto moderado.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para este tamano; se usarian solo para servir muchas peticiones concurrentes o contextos muy largos.
- Ejecucion en CPU: viable con llama.cpp, Ollama o LM Studio gracias al formato GGUF; el rendimiento depende del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no son la via natural para este artefacto GGUF, aunque existen rutas de conversion a safetensors para vLLM.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- El autor indica que no hay cuantizaciones ponderadas ni con imatrix para este modelo en el momento de la publicacion; solo estan disponibles las estaticas.

## Comparativa con modelos similares

Los valores de esta tabla marcados con asterisco corresponden a documentacion publica general de cada modelo y no a la informacion proporcionada en la busqueda; se incluyen solo como referencia de categoria y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-opencode-RL-GGUF | ~2,7 B | 128.000 tokens (base) | lfm1.0 | GGUF | Ajuste RL para agentes de codigo; 12 cuantizaciones |
| LFM2.5-2.6B (base) | ~2,6 B | 128.000 tokens | lfm1.0 | safetensors, GGUF | Modelo original de Liquid AI; 16 idiomas declarados; no recomendado por el fabricante para codificacion agentica intensiva |
| Qwen2.5-3B-Instruct | ~3,1 B * | 32.768 tokens * | Apache-2.0 * | safetensors, GGUF * | Alternativa generalista muy desplegada en local * |
| Llama-3.2-3B-Instruct | ~3,2 B * | 128.000 tokens * | Llama 3.2 Community License * | safetensors, GGUF * | Alternativa con contexto largo y ecosistema amplio * |
| Gemma-2-2B-it | ~2,6 B * | 8.192 tokens * | Gemma Terms of Use * | safetensors, GGUF * | Alternativa de Google con contexto mas corto * |

## Limitaciones y advertencias

- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible; al ser un ajuste RL sobre entornos de codigo, el comportamiento puede degradarse fuera de ese dominio.
- Alucinacion: no hay evaluaciones publicadas de tasa de alucinacion para esta variante; el riesgo es el habitual en modelos de 2,6 B, especialmente en tareas de conocimiento factual.
- Contexto e idioma: la model card declara unicamente ingles, aunque el base declara 16 idiomas. En idiomas distintos del ingles el rendimiento no esta garantizado.
- Dominio: Liquid AI advierte que LFM2.5-2.6B no es su modelo recomendado para codificacion agentica intensiva ni para tareas con alta carga de conocimiento. El ajuste RL sobre opencode puede mejorar el comportamiento en ese nicho, pero no se aportan metricas que lo confirmen.
- Licencia: LFM Open License v1.0 (lfm1.0), etiquetada como "other" en HuggingFace. Es una licencia con condiciones especificas que conviene revisar antes de un uso comercial; no es Apache-2.0 ni MIT.
- Cuantizacion: las versiones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior. La ausencia de cuantizaciones con imatrix puede implicar una perdida de calidad mayor que la habitual en los rangos bajos.
- Artefacto derivado: el autor es un tercero (mradermacher), no Liquid AI ni FineEnvs; la trazabilidad y el soporte dependen de la comunidad.
- Reproducibilidad: no se publican hiperparametros del GRPO, numero de tokens ni composicion detallada del dataset, lo que dificulta reproducir el ajuste.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, lo que sugiere un artefacto reciente y sin validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/LFM2.5-2.6B-opencode-RL-GGUF
- Modelo base (FineEnvs): https://huggingface.co/FineEnvs/LFM2.5-2.6B-opencode-RL
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#LFM2.5-2.6B-opencode-RL-GGUF
- Documentacion de LFM2.5-2.6B (Liquid AI): https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Cuantizaciones de LFM2.5-2.6B (sin RL): https://huggingface.co/mradermacher/LFM2.5-2.6B-GGUF
- Guia de ejecucion local de LFM2.5-2.6B: https://lachieslifestyle.com/2026/09/02/how-to-run-lfm2-5-2-6b-locally-on-windows-mac-and-linux/
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/lfm2-5-2-6b.html
- README de referencia de TheBloke sobre GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
