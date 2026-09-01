# mradermacher/Dark-Goetia-26B-A4B-v4-GGUF

## Resumen

Dark-Goetia-26B-A4B-v4-GGUF es una cuantización en formato GGUF del modelo Dark-Goetia-26B-A4B-v4, publicada por el usuario mradermacher en Hugging Face. El nombre sugiere que se trata de una variante de la familia Gemma 4 de Google DeepMind, concretamente la versión de 26B parámetros con activación de 4B (MoE), aunque no se dispone de documentación oficial que lo confirme. El repositorio contiene únicamente los pesos cuantizados en varios formatos (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS, f16) y está etiquetado como orientado a conversación.

La relevancia de este modelo radica en su disponibilidad como archivos GGUF, lo que permite su ejecución local en hardware de consumo mediante herramientas como llama.cpp u Ollama. Sin embargo, la ausencia de una model card detallada, métricas de rendimiento o información sobre licencia limita su evaluación objetiva. El repositorio no registra descargas ni valoraciones, lo que sugiere que es una publicación reciente o poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente MoE, segun el sufijo A4B) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (el sufijo A4B sugiere 4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles sobre la arquitectura interna del modelo original. El nombre "Dark-Goetia-26B-A4B-v4" sugiere una arquitectura de mezcla de expertos (MoE) con 26B parametros totales y 4B activos por token, similar a la familia Gemma 4 de Google. No obstante, no se ha publicado ninguna documentacion tecnica, descripcion del dataset de entrenamiento, ni informacion sobre tecnicas de alineamiento como RLHF o DPO. El repositorio actual es una cuantizacion estatica (static quants) del modelo base, realizada con herramientas de conversion a GGUF, sin modificaciones adicionales en los pesos.

## Capacidades

- Conversacion: el modelo esta etiquetado como "conversational", lo que indica que esta orientado a tareas de dialogo y generacion de texto interactivo.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse en servidores de inferencia compatibles con la API de OpenAI (por ejemplo, vLLM o llama.cpp con servidor).
- No se dispone de informacion sobre capacidades especificas como tool calling, razonamiento multi-paso, vision, audio o soporte multilingue.

## Casos de uso

- Asistentes conversacionales locales: al ser un modelo GGUF, puede ejecutarse en equipos de escritorio o portatiles con suficiente VRAM, permitiendo crear chatbots privados sin conexion a internet.
- Prototipado rapido de aplicaciones de chat: gracias a su compatibilidad con endpoints, se puede integrar en entornos de desarrollo que usen la API de OpenAI, facilitando pruebas de concepto.
- Generacion de texto creativo: el modelo puede utilizarse para redactar historias, guiones o contenido literario, aunque no hay datos que confirmen su calidad en esta tarea.
- Analisis de sentimiento y clasificacion de texto: como modelo de lenguaje generico, podria adaptarse mediante prompt engineering para tareas de clasificacion, aunque no hay benchmarks que lo respalden.
- Educacion y experimentacion: util para investigadores o estudiantes que quieran explorar el comportamiento de un modelo MoE cuantizado en hardware modesto.
- Despliegue en entornos con restricciones de red: al ser un archivo local, es adecuado para entornos aislados o con politicas de seguridad que prohiban servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo. Tampoco se dispone de comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: para una cuantizacion Q4_K_S, un modelo de 25B parametros requiere aproximadamente 15-16 GB de VRAM. Las cuantizaciones mas agresivas (Q2_K) pueden reducir el requisito a unos 10-11 GB, mientras que f16 necesitaria alrededor de 50 GB.
- GPU recomendadas: para ejecutar el modelo en Q4_K_S se necesitan GPUs con al menos 16 GB de VRAM, como NVIDIA RTX 4080/4090, A100 40GB o similares. Para cuantizaciones mas bajas, una RTX 3090 (24 GB) o RTX 4070 Ti (12 GB) podrian ser suficientes con Q2_K.
- Compatibilidad con consumer GPU: si, con cuantizaciones Q4_K_S o inferiores en GPUs de gama alta (RTX 3090/4090). No es viable en GPUs de 8 GB o menos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF), o servidores compatibles con la API de OpenAI.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_S, se podria esperar una velocidad de generacion de 20-40 tokens por segundo, pero es una estimacion sin confirmar.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El modelo parece derivar de Gemma 4 26B A4B, pero no hay datos publicos sobre su rendimiento relativo. Se podria comparar con otros modelos GGUF de tamano similar como Llama 3.1 8B o Mistral 7B, pero la falta de benchmarks impide una evaluacion objetiva. Se recomienda consultar la documentacion de Gemma 4 para obtener referencias de la familia base.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo original.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial o impone restricciones. Se debe contactar con el autor o revisar el repositorio original antes de usar en produccion.
- El modelo no tiene una model card detallada, lo que dificulta evaluar su idoneidad para tareas especificas.
- Al ser una cuantizacion, puede haber una degradacion de calidad respecto al modelo original en tareas complejas.
- No hay garantia de soporte o mantenimiento por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Dark-Goetia-26B-A4B-v4-GGUF
- Repositorio del modelo original (referenciado en la model card): https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v4
- Variante v2 del mismo autor: https://huggingface.co/mradermacher/Dark-Goetia-26B-A4B-v2-GGUF
- Documentacion de Gemma 4 (posible base del modelo): https://ai.google.dev/gemma/docs/core/model_card_4
- Guia de ejecucion local de Gemma 4: https://unsloth.ai/docs/models/gemma-4
