# orbbit-AI-026/Analys-Dynamic-AI

## Resumen

Analys-Dynamic-AI es un modelo de lenguaje publicado por orbbit-AI-026 en Hugging Face bajo licencia Apache 2.0. Segun los metadatos del repositorio, se trata de un modelo de arquitectura `qwen3_5_moe`, es decir, un transformer con mezcla de expertos (MoE) derivado de la familia Qwen 3.5, con 125.086.497.008 parametros totales almacenados en formato safetensors y un tamano de repositorio de 250,2 GB. El tag de pipeline no esta disponible y la model card no aporta informacion sobre contexto, parametros activos ni composicion del entrenamiento.

La model card lo describe como un modelo orientado al "analisis y conocimiento de Dynamic 3: documentos largos, investigacion y consulta para Hi Code", presentado como parte del ecosistema de Orbbit AI para Hi Chat. Se trata, por tanto, de un modelo de proposito general con enfasis declarado en el procesamiento de documentos extensos y tareas de recuperacion y consulta, aunque el autor no detalla la metodologia ni los datos utilizados para conseguirlo.

Su relevancia actual es limitada pero no nula: se trata de un modelo MoE de gran tamano (125.000 millones de parametros) con licencia permisiva, lo que teoricamente permite uso comercial sin restricciones adicionales. Sin embargo, la ausencia de benchmarks, de documentacion tecnica y de cualquier traza de uso (0 descargas, 0 likes en el momento de la consulta) obliga a tratar cualquier afirmacion sobre su calidad con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (`qwen3_5_moe` segun tag del repositorio) |
| Parametros totales | 125.086.497.008 (125,09 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 250,2 GB |
| Pipeline declarado | no disponible |
| Fecha de publicacion | 2026-11-10 |

## Arquitectura y entrenamiento

El tag `qwen3_5_moe` indica que el modelo sigue la arquitectura de mezcla de expertos de la familia Qwen 3.5, un diseno de transformer con capas MoE en las que solo un subconjunto de expertos se activa por token. El numero total de parametros (125,09 mil millones) es coherente con un modelo MoE de gran escala, pero el autor no publica el numero de parametros activos, el numero de expertos, la dimension oculta ni la configuracion de atencion, por lo que no es posible estimar el coste real de inferencia por token a partir de los datos disponibles.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card se limita a indicar que el modelo esta pensado para "documentos largos, investigacion y consulta" en el contexto de "Hi Code" e "Hi Chat", sin especificar la longitud de contexto efectiva ni como se entreno esa capacidad.

## Capacidades

- Generacion de texto y razonamiento general, segun la naturaleza del modelo base Qwen 3.5 MoE.
- Procesamiento de documentos largos: la model card menciona explicitamente "documentos largos" como dominio de uso, aunque no se especifica la ventana de contexto.
- Tareas de investigacion y consulta: orientado a recuperacion de informacion y respuesta a preguntas sobre corpus documentales.
- Integracion declarada con "Hi Code" y "Hi Chat", productos del ecosistema Orbbit AI.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.

## Casos de uso

- Analisis de documentacion tecnica extensa: el modelo esta declarado para "documentos largos", por lo que encaja en la revision de manuales, especificaciones o contratos de decenas de miles de tokens, siempre que se verifique empiricamente la ventana de contexto real antes de desplegarlo.
- Asistente de investigacion documental: consulta y sintesis sobre corpus internos (informes, articulos, actas) en un pipeline RAG, usando el modelo como generador final tras la recuperacion.
- Integracion en Hi Chat: atencion conversacional multi-turno dentro del producto de chat de Orbbit AI, para el que el autor lo declara explicitamente.
- Soporte a Hi Code: asistencia a desarrolladores sobre documentacion de APIs, guias de estilo y bases de codigo documentadas, aprovechando la capacidad declarada de analisis de documentos.
- Extraccion de conocimiento estructurado: conversion de documentos no estructurados en resumenes, tablas o fichas, con validacion humana posterior dado el riesgo de alucinacion.
- Base para fine-tuning vertical: al estar bajo Apache 2.0 y en safetensors, puede ajustarse con LoRA o QLoRA sobre dominios especializados (legal, sanitario, financiero) sin restricciones de licencia.
- Despliegue on-premise en entornos con requisitos de soberania del dato: la licencia permisiva y la disponibilidad de pesos completos permiten ejecucion en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 250 GB solo para pesos, mas KV cache y overhead; requiere al menos 4 GPU de 80 GB (A100/H100) o 8 GPU de 48 GB.
- Cuantizacion a 8 bits: en torno a 125 GB de pesos, viable en 2 x H100 80 GB o 4 x A100 40 GB con margen ajustado.
- Cuantizacion a 4 bits: en torno a 65-70 GB de pesos, viable en una unica H100 80 GB o en 2 x RTX 4090 24 GB con tensor parallelism y offloading parcial.
- GPU consumer: no cabe en una sola RTX 4090 (24 GB) ni en una RTX 3090; solo es viable con cuantizacion agresiva y reparto entre varias GPU, con latencia alta.
- Opciones de despliegue: al no publicarse pesos GGUF ni cuantizaciones, la via directa es vLLM o TGI con safetensors; llama.cpp y Ollama requeririan conversion manual a GGUF, no verificada por el autor.
- Latencia y throughput: no disponibles; al desconocerse los parametros activos del MoE no puede estimarse el coste por token.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Analys-Dynamic-AI | 125,09 mil millones (MoE) | no disponible | Apache 2.0 | Hugging Face, safetensors |
| Qwen3 MoE (familia base declarada) | no disponible en esta ficha | no disponible | Apache 2.0 (segun familia) | Hugging Face |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de especificaciones verificables de alternativas concretas en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni ninguna otra tarea; cualquier evaluacion debe hacerse internamente antes de produccion.
- Documentacion tecnica minima: se desconocen contexto, parametros activos, idiomas e idoneidad real para documentos largos, pese a ser su reclamo principal.
- Riesgo de alucinacion: inherente a los modelos generativos y no mitigado de forma documentada (no se declara RLHF ni DPO).
- Sesgos: no documentados por el autor; al desconocerse la composicion del dataset no puede evaluarse el sesgo linguistico, cultural o de dominio.
- Idiomas: no declarados; el uso en castellano no esta garantizado ni evaluado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar avisos de autoria; la model card remite a `LICENSE` y `NOTICE` para los avisos del modelo de origen, que deben revisarse antes de redistribuir.
- Trazabilidad dudosa: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni cuantizaciones publicadas; conviene verificar la integridad de los pesos y la procedencia del modelo base antes de confiar en el.
- Coste de infraestructura elevado: 250 GB de pesos en BF16 implican multiplas GPU de datacenter para inferencia comoda.

## Enlaces

- Hugging Face: https://huggingface.co/orbbit-AI-026/Analys-Dynamic-AI
