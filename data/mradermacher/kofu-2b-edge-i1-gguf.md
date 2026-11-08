# mradermacher/kofu-2b-edge-i1-GGUF

## Resumen

kofu-2b-edge-i1-GGUF es una reedición en formato GGUF del modelo kofu-2b-edge, publicada por el usuario mradermacher, especializado en generar cuantizaciones de modelos de terceros. Se trata de una conversión de los pesos originales al formato GGUF de llama.cpp, con cuantizaciones ponderadas (imatrix) en múltiples niveles de precisión, desde IQ1_S hasta Q6_K. El modelo base está etiquetado como perteneciente a la familia Gemma y orientado a ejecución en dispositivos (on-device), según los metadatos del repositorio.

La relevancia de esta ficha es limitada: el repositorio no incluye model card descriptiva, no declara licencia explícita más allá de la etiqueta "gemma" en los metadatos de la búsqueda, y no se han publicado resultados de benchmarks ni especificaciones de entrenamiento. La información disponible se reduce a los metadatos de la conversión y a la referencia al modelo original (shebxyd/kofu-2b-edge).

El dato de parámetros totales registrado en safetensors (1.033.830) es inconsistente con la denominación "2b" del modelo y con la referencia de la búsqueda web a "3B parameters"; se trata probablemente de un error de metadatos o de un recuento parcial, por lo que no debe tomarse como cifra fiable. Se recomienda consultar el repositorio del modelo base para obtener especificaciones verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como familia Gemma en metadatos) |
| Parametros totales | no disponible (metadato safetensors: 1.033.830, inconsistente con la denominacion "2b") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_XS, IQ3_S |
| Idiomas soportados | no disponible (metadatos de busqueda mencionan Spanish, English) |
| Licencia | no disponible (etiqueta "gemma" en metadatos de busqueda) |
| Formato de pesos | GGUF (cuantizado, con variantes imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base kofu-2b-edge. Los metadatos del repositorio de cuantizacion indican `convert_type: hf` y `quantize_version: 2`, lo que confirma que la conversion se realizo a partir de pesos en formato Hugging Face Transformers mediante las herramientas de cuantizacion de llama.cpp. Las cuantizaciones son del tipo ponderado/imatrix, es decir, generadas con una matriz de importancia calculada a partir de un corpus de calibracion, lo que mejora la calidad de los niveles de baja precision (IQ1, IQ2, IQ3).

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste instructivo. La etiqueta "gemma" en los metadatos de busqueda sugiere una posible relacion con la familia de modelos Gemma de Google, pero no se confirma en la informacion proporcionada. Tampoco se detalla ninguna innovacion tecnica especifica (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional: los metadatos de busqueda incluyen las etiquetas "conversational" y "llama.cpp", lo que indica que el modelo esta pensado para dialogos multi-turno.
- Ejecucion on-device: las etiquetas "edge", "android" y "on-device" sugieren un diseno orientado a dispositivos con recursos limitados.
- Multilingue (parcial): los metadatos mencionan Spanish y English, aunque no se detalla el nivel de competencia en cada idioma.
- Compatibilidad con llama.cpp: al estar en formato GGUF, es ejecutable en las herramientas del ecosistema llama.cpp (llama-cli, llama-server, Ollama mediante importacion, etc.).
- No se dispone de informacion sobre soporte de tool calling, razonamiento multi-paso, vision, audio ni modos de pensamiento explicito.

## Casos de uso

- Asistentes conversacionales en dispositivos moviles: el formato GGUF y las cuantizaciones de baja precision (IQ1, IQ2, Q3) permiten ejecutar el modelo en telefonos Android con memoria limitada, gestionando dialogos basicos sin conexion a red.
- Prototipado rapido de chatbots en local: con las variantes Q4_K_M o Q5_K_M se puede desplegar un servidor de inferencia ligero mediante llama.cpp para pruebas de concepto en equipos de desarrollo con CPU.
- Aplicaciones de escritorio con privacidad por diseno: al ejecutarse completamente en local, el modelo es adecuado para asistentes que procesan texto sensible sin enviar datos a servicios externos.
- Educacion y demostraciones de IA en el aula: el reducido tamano de las cuantizaciones IQ2/IQ3 permite ejecutar el modelo en portatiles modestos para ilustrar el funcionamiento de un LLM.
- Filtrado y clasificacion de texto ligera: para tareas de etiquetado simple o resumen corto en pipelines por lotes donde el coste por inferencia es critico.
- Experimentacion con cuantizacion extrema: util para investigadores que comparan la degradacion de calidad entre niveles IQ1_S, IQ2 y Q4_K_M sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable al no confirmarse el numero real de parametros. Como referencia orientativa para un modelo de ~2B en GGUF: Q4_K_M ronda los 1,5-2 GB, Q6_K en torno a 2,5 GB, e IQ2/IQ3 por debajo de 1,5 GB; estas cifras son estimaciones genericas, no datos del repositorio.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar las variantes Q4 y Q6; las variantes IQ2/IQ3 podrian caber en GPUs integradas o en CPU.
- Cabe en GPU consumer: previsiblemente si (RTX 3060, RTX 4060, GTX 1660 y superiores), aunque no se confirma en la documentacion.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama mediante importacion del GGUF, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). No se menciona soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| kofu-2b-edge-i1-GGUF | no disponible (~2B por denominacion) | no disponible | no disponible (etiqueta gemma) | GGUF | Hugging Face |
| Gemma 2B (Google) | 2B | 8K (segun documentacion oficial de Gemma) | Gemma Terms of Use | safetensors, GGUF | Hugging Face, Kaggle |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Phi-3-mini | 3,8B | 4K-128K (segun variante) | MIT | safetensors, GGUF | Hugging Face |

La comparativa es aproximada: no se dispone de datos verificados de parametros, contexto ni rendimiento del modelo kofu-2b-edge, por lo que las filas de alternativas se incluyen solo como referencia de categoria (modelos pequenos para ejecucion local).

## Limitaciones y advertencias

- Ausencia de model card: el repositorio no documenta el entrenamiento, los datos ni las capacidades reales del modelo, lo que impide evaluar su calidad de forma rigurosa.
- Inconsistencia en parametros: el metadato safetensors (1.033.830) no cuadra con la denominacion "2b" ni con la referencia web a "3B"; tratar cualquier cifra de tamano con cautela.
- Licencia no confirmada: la etiqueta "gemma" sugiere que podria estar sujeto a los terminos de uso de Gemma, que imponen restricciones de uso comercial y de redistribucion; verificar antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no evaluado; al no haber benchmarks ni evaluaciones publicadas, se desconoce la fiabilidad factual del modelo.
- Idiomas: solo se mencionan espanol e ingles en metadatos; el rendimiento en otros idiomas es desconocido.
- Cuantizaciones extremas: las variantes IQ1_S e IQ2_XXS pueden degradar notablemente la coherencia y la calidad del texto; no recomendadas para produccion.
- Cero traccion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-07): posible error de registro; conviene verificar la procedencia del repositorio.

## Enlaces

- Repositorio de cuantizacion: https://huggingface.co/mradermacher/kofu-2b-edge-i1-GGUF
- Repositorio alternativo del mismo autor: https://huggingface.co/mradermacher/kofu-2b-edge-GGUF
- Arbol de ficheros: https://huggingface.co/mradermacher/kofu-2b-edge-GGUF/tree/main
- Modelo base: https://huggingface.co/shebxyd/kofu-2b-edge
