# dhruvv45/lightretriever-llama3.2-3b-full

## Resumen

LightRetriever es una arquitectura de recuperación de texto basada en modelos de lenguaje de gran tamaño (LLM) que reduce drásticamente la latencia de inferencia de consultas. Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base `meta-llama/Llama-3.2-3B` para implementar dicha arquitectura. El adaptador está publicado por el usuario `dhruvv45` y forma parte del proyecto LightRetriever, cuyo paper se encuentra disponible en arXiv (2505.12260).

El modelo resuelve el problema del alto coste computacional de usar un LLM completo como codificador de consultas en sistemas de recuperación. Según el paper, en comparación con servir un LLM completo en una GPU A800, LightRetriever consigue una aceleración superior a 1000x en el encoding de consultas y más de 10x en el throughput de recuperación extremo a extremo, manteniendo una media del 95% del rendimiento de recuperación en benchmarks a gran escala. El adaptador tiene un tamaño de checkpoint de aproximadamente 0.1 GB, lo que lo hace ligero y desplegable en entornos con recursos limitados.

La relevancia actual de este modelo reside en la creciente demanda de sistemas de retrieval aumentado por generación (RAG) y búsqueda semántica eficiente, donde la latencia de codificación de consultas es un cuello de botella crítico. Al ser un adaptador LoRA sobre Llama 3.2 3B, se beneficia de las capacidades lingüísticas del modelo base mientras reduce significativamente el coste de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.2-3B (Transformer decoder) |
| Parametros totales | No disponible (checkpoint de 0.1 GB, adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura LoRA (Low-Rank Adaptation) aplicada sobre el modelo Llama-3.2-3B, que es un transformer decoder con 3 mil millones de parámetros. LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, permitiendo un fine-tuning eficiente con un número reducido de parámetros entrenables. En este caso, el adaptador está diseñado específicamente para la tarea de recuperación de texto, siguiendo la metodología descrita en el paper de LightRetriever.

El paper propone una arquitectura que separa el encoding de consultas del encoding de documentos, optimizando el primero para lograr una inferencia extremadamente rápida. Los detalles del entrenamiento (número de tokens, composición del dataset, hiperparámetros) no se especifican en la model card ni en la información disponible. No se menciona el uso de RLHF o DPO; se asume un entrenamiento supervisado para la tarea de retrieval.

## Capacidades

- Recuperación de texto: el modelo está entrenado para codificar consultas y documentos en un espacio vectorial compartido, permitiendo búsqueda por similitud.
- Encoding de consultas ultrarrápido: según el paper, consigue una aceleración de más de 1000x frente a un LLM completo en la codificación de consultas.
- Integración con pipelines de RAG: puede usarse como componente de retrieval en sistemas de generación aumentada.
- Compatibilidad con el ecosistema Transformers y PEFT: al ser un adaptador LoRA, se carga fácilmente con la librería `peft` y `transformers`.
- No se especifican capacidades de generación de texto, tool calling, agentes o visión; el modelo está orientado exclusivamente a retrieval.

## Casos de uso

- Búsqueda semántica en bases de conocimiento empresariales: el adaptador puede indexar documentos internos y responder consultas de empleados con baja latencia, gracias a su encoding rápido de consultas.
- Sistemas de atención al cliente automatizada: integrándolo en un pipeline RAG, permite recuperar respuestas relevantes de manuales y FAQs en tiempo real, reduciendo el coste de cómputo por consulta.
- Motores de recomendación de contenido: codificando artículos, vídeos o productos, el modelo puede sugerir ítems similares a partir de la consulta del usuario con una latencia mínima.
- Búsqueda en documentación técnica y código: al estar basado en Llama 3.2, puede entender consultas en lenguaje natural y recuperar fragmentos de código o documentación relevante.
- Investigación académica en recuperación de información: sirve como punto de partida para experimentos que requieran un retrieval eficiente sin sacrificar precisión.
- Asistentes virtuales con memoria externa: el modelo puede actuar como módulo de memoria recuperable, permitiendo al asistente acceder a información histórica de conversaciones o bases de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, el paper de LightRetriever (arXiv:2505.12260) reporta los siguientes resultados relativos:

- Aceleración de más de 1000x en el encoding de consultas frente a un LLM completo servido en una GPU A800.
- Aumento de más de 10x en el throughput de recuperación extremo a extremo.
- Mantenimiento de una media del 95% del rendimiento de recuperación en benchmarks a gran escala.

Estos datos son cualitativos y no se desglosan por benchmark específico en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB), por lo que puede cargarse junto con el modelo base Llama-3.2-3B en GPUs de consumo.
- Se estima que la inferencia del modelo base en BF16 requiere aproximadamente 6-8 GB de VRAM (no confirmado oficialmente para este adaptador).
- GPUs recomendadas: RTX 3060, RTX 4090, A10, A100, H100 (cualquier GPU con al menos 8 GB de VRAM es suficiente).
- Opciones de despliegue: al ser un adaptador PEFT, puede usarse con `transformers` + `peft`, o exportarse a formatos como GGUF para su uso con `llama.cpp` u Ollama (aunque no se ha verificado la compatibilidad).
- Para despliegues de alto rendimiento, se recomienda vLLM o TGI, que soportan carga de adaptadores LoRA.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de retrieval basados en LLM. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La model card del adaptador está prácticamente vacía; no se documentan sesgos, riesgos ni limitaciones específicas.
- El modelo está diseñado exclusivamente para recuperación de texto; no debe usarse para generación de lenguaje general.
- La licencia del adaptador no está especificada; el modelo base Llama-3.2-3B está sujeto a la Licencia Comunitaria de Llama, que impone restricciones de uso comercial y requiere atribución.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de retrieval, el riesgo de alucinación es menor que en generación, pero la calidad de los resultados depende de la calidad del corpus indexado.
- El rendimiento en idiomas distintos del inglés no está verificado; aunque Llama 3.2 soporta múltiples idiomas, el adaptador no especifica su cobertura lingüística.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dhruvv45/lightretriever-llama3.2-3b-full
- Paper de LightRetriever: https://arxiv.org/abs/2505.12260
- Organización LightRetriever en HuggingFace: https://huggingface.co/lightretriever
