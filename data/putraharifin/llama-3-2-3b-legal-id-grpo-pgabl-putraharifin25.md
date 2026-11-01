# putraharifin/llama-3.2-3b-legal-id-GRPO-PGABL-putraharifin25

## Resumen

Este modelo es un ajuste fino (finetune) de Llama 3.2 3B especializado en el dominio legal, desarrollado por el usuario putraharifin y publicado en HuggingFace. El nombre sugiere que se trata de un modelo orientado al ámbito jurídico indonesio ("legal-id") que ha sido entrenado en dos etapas: una primera fase con PGABL (posiblemente una variante de entrenamiento por preferencias) y una segunda fase con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo popularizada para alinear modelos de lenguaje con preferencias específicas de dominio.

El modelo parte de la arquitectura Llama de Meta con aproximadamente 3.200 millones de parametros y ha sido entrenado utilizando la biblioteca Unsloth junto con TRL (Transformer Reinforcement Learning) de HuggingFace, lo que permite un entrenamiento significativamente mas rapido y eficiente en memoria. Su relevancia radica en la creciente demanda de modelos especializados por verticales (legal, medico, financiero) que pueden ejecutarse en hardware modesto, dado su tamaño reducido.

Cabe destacar que la model card es muy escueta: no documenta el dataset de entrenamiento, ni los resultados de evaluacion, ni el metodo exacto de GRPO aplicado. Esto debe tenerse en cuenta antes de considerar su uso en produccion, especialmente en un dominio tan sensible como el juridico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 (transformer decoder) |
| Parametros totales | 3.212.749.824 (~3,21 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Llama 3.2 3B base suele ser de 128.000 tokens) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors) |
| Idiomas soportados | en (segun tags; el dominio "legal-id" sugiere posible soporte de indonesio, no confirmado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.2 3B de Meta: un transformer decoder optimizado para tamano reducido, con pesos en precision bfloat16 (deducible del tamano del repositorio, 6,4 GB para ~3,21 B de parametros). No se trata de un modelo MoE, por lo que todos los parametros estan activos en cada pasada de inferencia.

El entrenamiento se ha realizado en al menos dos etapas. La primera, a partir de un modelo previo del mismo autor (putraharifin/llama-3.2-3b-legal-id-PGABL-putraharifin25), cuyo metodo PGABL no esta documentado publicamente. La segunda etapa aplica GRPO (Group Relative Policy Optimization), un algoritmo de RL que optimiza el modelo comparando grupos de respuestas generadas para un mismo prompt, sin necesidad de un modelo de recompensa entrenado aparte. El autor indica que el entrenamiento fue acelerado con Unsloth y la biblioteca TRL de HuggingFace. No se ha publicado informacion sobre el numero de tokens, la composicion del dataset ni los hiperparametros.

## Capacidades

- Generacion de texto en formato conversacional (tag "conversational").
- Especializacion presunta en contenido juridico (por el nombre del modelo), aunque sin documentacion de capacidades concretas.
- Compatibilidad con la biblioteca transformers de HuggingFace y con text-generation-inference.
- Entrenado con soporte del ecosistema Unsloth, lo que facilita la inferencia optimizada y futuros ajustes finos.
- No hay evidencia documentada de soporte de vision, audio, tool calling ni modos de razonamiento extendido.

## Casos de uso

- Asistente juridico conversacional: dada su especializacion legal y formato conversacional, podria emplearse para responder consultas sobre legislacion o redactar borradores de documentos juridicos, siempre con supervision humana.
- Resumen de documentos legales: su tamano compacto permite desplegarlo para resumir contratos o sentencias en entornos con recursos limitados.
- Clasificacion de textos juridicos: puede adaptarse para categorizar clausulas o documentos por tipologia mediante prompts.
- Generacion de respuestas en chatbots legales de bajo coste: al ser un modelo de 3B, es viable su ejecucion en GPUs de consumo para prototipos de atencion al usuario en despachos pequenos.
- Investigacion en alineacion por refuerzo: util como caso de estudio de pipelines GRPO + Unsloth + TRL sobre modelos de dominio legal.
- Base para nuevos ajustes finos: al estar bajo licencia Apache 2.0, puede servir como punto de partida para modelos legales adaptados a otras jurisdicciones o idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, GSM8K, HumanEval ni ninguna otra evaluacion, ni comparaciones con el modelo base Llama 3.2 3B.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,5-7 GB solo para los pesos, mas overhead de contexto (8-10 GB en la practica).
- Con cuantizacion a 4 bits (por ejemplo, Q4_K_M en GGUF, si se convierte): unos 2-2,5 GB de VRAM.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores para inferencia en precision completa; cualquier GPU moderna de 8 GB con cuantizacion.
- Cabe en GPUs de consumo: si, tanto en precision completa (GPUs de 12 GB o mas) como cuantizado (GPUs de 4-8 GB).
- Opciones de despliegue: transformers de HuggingFace, text-generation-inference, vLLM, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion).
- Latencia y throughput: no disponible; al tratarse de un modelo denso de 3B, se esperan velocidades de decodificacion altas en hardware de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| putraharifin/llama-3.2-3b-legal-id-GRPO-PGABL-putraharifin25 | ~3,21 B | no disponible | Apache 2.0 | Dominio legal (presunto) |
| Meta Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Generalista multilingue |
| Qwen2.5 3B Instruct | 3,09 B | 32.768 tokens | Qwen Research / Apache 2.0 (variantes) | Generalista, fuerte en codigo y matematicas |
| Phi-3.5 Mini Instruct | 3,82 B | 128.000 tokens | MIT | Generalista, razonamiento |

El modelo comparado destaca por su supuesta especializacion legal y su licencia permisiva, pero carece de la documentacion, los benchmarks y el respaldo de los modelos generalistas de referencia.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay dataset, hiperparametros, ni evaluaciones publicadas, lo que dificulta verificar la calidad del ajuste fino.
- Riesgo elevado de alucinacion en el dominio juridico: los modelos legales pueden generar citas, articulos o jurisprudencia inexistentes; su uso sin supervision experta es peligroso.
- Ambiguedad idiomatica: los tags indican ingles ("en"), pero el nombre sugiere orientacion al derecho indonesio ("id"); el rendimiento real en cada idioma no esta verificado.
- Sin benchmarks comparativos frente al modelo base, por lo que no se puede confirmar que el entrenamiento GRPO haya mejorado el rendimiento.
- Contexto no confirmado: si conserva el contexto de Llama 3.2 3B (128.000 tokens), el uso de contextos largos incrementa notablemente los requisitos de VRAM.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar la licencia del modelo base de Meta (Llama 3.2 Community License) y su politica de uso aceptable.
- Procedencia de creador individual con pocas descargas (353) y sin comunidad activa: mayor riesgo de errores no detectados frente a modelos mantenidos por organizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/putraharifin/llama-3.2-3b-legal-id-GRPO-PGABL-putraharifin25
- Modelo base del autor: https://huggingface.co/putraharifin/llama-3.2-3b-legal-id-PGABL-putraharifin25
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
