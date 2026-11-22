# mradermacher/jairo-ai-1.0-pro-GGUF

## Resumen

jairo-ai-1.0-pro-GGUF es la version cuantizada en formato GGUF del modelo LouieR09112/jairo-ai-1.0-pro, un modelo de lenguaje de 8.030.261.312 parametros (aproximadamente 8B) orientado a razonamiento y conversacion. La cuantizacion ha sido realizada por mradermacher, un conocido publicador de versiones GGUF de modelos open source, que distribuye hasta once variantes de cuantizacion distintas para adaptarse a diferentes presupuestos de memoria.

El modelo base se presenta como un modelo de tipo Llama afinado sobre el dataset HuggingFaceH4/ultrachat_200k, un corpus de conversaciones multirreno en ingles. Su nombre comercial ("jairo-ai-1.0-pro") y las etiquetas asociadas (reasoning, pro) sugieren un enfoque hacia tareas de razonamiento, aunque la model card original no aporta detalles tecnicos sobre el proceso de entrenamiento, la composicion exacta del dataset ni innovaciones arquitectonicas mas alla de la referencia al dataset de chat.

La relevancia de esta ficha radica en que la version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en safetensors de 8B. Con cuantizaciones que van desde 3,3 GB (Q2_K) hasta 16,2 GB (f16), el modelo es accesible en GPUs consumer de gama media-alta y en CPU con suficiente RAM. La licencia MIT facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Llama, segun la etiqueta "llama" del modelo) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta "llama" y el tamano de 8B parametros, lo que apunta a un transformer decoder-only con atencion multi-cabeza estandar. No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa. El modelo base fue afinado sobre HuggingFaceH4/ultrachat_200k, un dataset de aproximadamente 200.000 conversaciones multirreno en ingles generadas y filtradas para entrenamiento de instrucciones. No hay informacion sobre el numero de tokens de entrenamiento, la posible aplicacion de RLHF o DPO, ni innovaciones como decodificacion especulativa o atencion lineal.

La cuantizacion realizada por mradermacher sigue el flujo estandar de llama.cpp: conversion de pesos safetensors a GGUF y aplicacion de los distintos esquemas de cuantizacion K-quant e I-quant. Se ofrece tambien una version con imatrix (weighted/imatrix quants) en un repositorio separado, que suele mejorar la calidad en cuantizaciones de baja precision al ponderar la importancia de cada tensor.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en razonamiento ("reasoning" es una de las etiquetas del modelo).
- Dialogo multirreno gracias al entrenamiento sobre ultrachat_200k.
- Capacidad de razonamiento de proposito general, si bien no hay benchmarks que la cuantifiquen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; las etiquetas sugieren cierta orientacion a reasoning, pero sin evidencia verificable.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede mantener dialogos multirreno gracias a su entrenamiento sobre ultrachat_200k, ejecutandose en local con llama.cpp u Ollama sin depender de APIs externas.
- Prototipado rapido de aplicaciones de chat: con cuantizaciones Q4_K_M de 5,0 GB, se puede desplegar en una RTX 3060 o superior para probar flujos conversacionales antes de escalar a modelos mayores.
- Generacion de texto en entornos con recursos limitados: la variante Q2_K (3,3 GB) permite ejecucion en GPUs de 4 GB de VRAM o en CPU con 8 GB de RAM, adecuada para demos y entornos embebidos.
- Educacion e investigacion: al ser un modelo pequeno con licencia MIT, sirve como base para experimentos de fine-tuning, evaluacion de cuantizaciones o estudios de comportamiento conversacional.
- Generacion de contenido en ingles: redaccion de borradores, resumenes y respuestas a preguntas en ingles, con la ventaja de que todo el procesamiento ocurre en local.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: el modelo puede actuar como "juez" o generador de referencia en tests automatizados de calidad conversacional, dado su bajo coste de inferencia.
- Despliegue en dispositivos edge: la cuantizacion Q3_K_S (3,8 GB) o IQ4_XS (4,6 GB) permite ejecutarlo en mini-PCs y portatiles con GPU integrada de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~3,3 GB; Q3_K_S ~3,8 GB; Q3_K_M ~4,1 GB; Q3_K_L ~4,4 GB; IQ4_XS ~4,6 GB; Q4_K_S ~4,8 GB; Q4_K_M ~5,0 GB; Q5_K_S ~5,7 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB. A estos valores hay que anadir el overhead del contexto KV cache, que crece con la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las cuantizaciones mas altas; GPUs de 6-8 GB (RTX 3050, RTX 2060) para cuantizaciones Q3/Q4.
- Cabe en GPU consumer: si. Las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 8 GB; Q6_K y Q8_0 requieren 10-12 GB; f16 requiere 24 GB o mas (RTX 3090/4090, A100, H100).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI para esta version, ya que estan orientados a safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jairo-ai-1.0-pro (este) | 8B | no disponible | MIT | GGUF, safetensors | Afinado sobre ultrachat_200k, solo ingles |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Multilingue, ampliamente evaluado |
| Mistral 7B | 7B | 32K | Apache 2.0 | safetensors, GGUF | Multilingue, muy extendido |
| Qwen2.5 7B | 7B | 128K | Apache 2.0 | safetensors, GGUF | Multilingue, fuerte en codigo y matematicas |

La comparativa es orientativa: no hay datos de rendimiento del modelo jairo-ai que permitan una comparacion cuantitativa con estas alternativas. La principal ventaja diferencial del modelo es su licencia MIT, mas permisiva que la Llama 3.1 Community, y su disponibilidad inmediata en GGUF. Sus desventajas son la falta de documentacion tecnica, la ausencia de benchmarks y el soporte unicamente en ingles.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al entrenarse sobre ultrachat_200k (generado por modelos) puede heredar sesgos de ese corpus.
- Riesgo de alucinacion no cuantificado; al no haber benchmarks, no se puede estimar su fiabilidad en tareas factuales.
- Contexto nativo no documentado: se desconoce la ventana maxima y el comportamiento mas alla de ella.
- Soporte unicamente en ingles segun la model card; el rendimiento en castellano es impredecible y probablemente deficiente.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantias ni soporte.
- El modelo base no incluye documentacion sobre el proceso de entrenamiento (datos, RLHF, filtros de seguridad), lo que dificulta evaluar su robustez en produccion.
- No se declaran capacidades de tool calling ni de agentes; no asumir su disponibilidad sin validacion previa.
- La cuantizacion Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- Repositorio con 757 descargas y 0 likes en el momento de la consulta: comunidad muy reducida, sin validacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jairo-ai-1.0-pro-GGUF
- Modelo base: https://huggingface.co/LouieR09112/jairo-ai-1.0-pro
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/jairo-ai-1.0-pro-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#jairo-ai-1.0-pro-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
