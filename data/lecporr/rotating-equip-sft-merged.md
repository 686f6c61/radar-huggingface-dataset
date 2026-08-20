# lecporr/rotating-equip-sft-merged

## Resumen

Modelo de generación de texto en inglés resultante de un fine-tuning por Supervised Fine-Tuning (SFT) sobre el modelo base Qwen3-1.7B de Alibaba, publicado por el usuario lecporr. El nombre del repositorio ("rotating-equip") sugiere una especialización en el dominio de equipos rotativos industriales (bombas, compresores, turbinas), aunque la model card no documenta el dataset de entrenamiento ni confirma explícitamente esta especialización. El entrenamiento se realizó con las librerías Unsloth y TRL de HuggingFace, y los adaptadores se fusionaron con los pesos base para producir un modelo standalone.

Con 1.720.574.976 parámetros (~1,7B), es un modelo compacto que cabe en GPUs de consumo medio. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo reciente y sin adopción comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only) |
| Parametros totales | 1.720.574.976 (~1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-1.7B soporta 32K tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors, 3,5 GB, consistente con pesos FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 de Alibaba, un transformer decoder-only con atención multi-cabeza estándar. El fine-tuning se realizó mediante SFT utilizando Unsloth (para acelerar el entrenamiento sobre el modelo base cuantizado a 4 bits) y la biblioteca TRL de HuggingFace. El sufijo "merged" en el nombre indica que los adaptadores LoRA/QLoRA se fusionaron con los pesos del modelo base para producir un checkpoint completo, listo para inferencia sin necesidad de cargar adaptadores por separado.

El modelo base es unsloth/Qwen3-1.7B-unsloth-bnb-4bit, una versión del Qwen3-1.7B cuantizada a 4 bits y optimizada con Unsloth. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni la aplicación de técnicas adicionales como RLHF o DPO. La model card es extremadamente mínima y no documenta ningún detalle del proceso de fine-tuning más allá de las librerías utilizadas.

## Capacidades

- Generación de texto en inglés, con soporte para conversación multi-turno (etiqueta "conversational").
- Compatible con text-generation-inference (TGI) y la librería transformers.
- Posible especialización en el dominio de equipos rotativos industriales, inferida del nombre del repositorio pero no confirmada por documentación.
- Al estar basado en Qwen3-1.7B, hereda las capacidades generales del modelo base: razonamiento, generación de código y comprensión de instrucciones, aunque el fine-tuning puede haber alterado estas capacidades.
- No se documenta soporte para tool calling, function calling, ni modos de razonamiento extendido (thinking mode) en la model card.

## Casos de uso

- Asistencia técnica para mantenimiento de equipos rotativos: el modelo podría responder consultas sobre diagnóstico de fallos, procedimientos de mantenimiento y especificaciones de bombas, compresores o turbinas, aunque esta capacidad no está verificada con benchmarks.
- Generación de documentación técnica en inglés: adecuado para redactar informes de mantenimiento, procedimientos operativos o fichas técnicas, aprovechando su tamaño compacto para despliegue en entornos con recursos limitados.
- Chatbot de soporte en entornos industriales: su naturaleza conversacional y su licencia permisiva permiten integrarlo en sistemas de atención interna para personal de planta.
- Extracción y resumen de manuales técnicos: con su ventana de contexto de 32K (heredada del modelo base), puede procesar documentos extensos y generar resúmenes estructurados.
- Prototipado rápido de aplicaciones NLP: al ser un modelo pequeño con licencia Apache 2.0, es adecuado para validar pipelines de generación de texto antes de escalar a modelos mayores.
- Clasificación de textos industriales: mediante fine-tuning adicional o prompting, puede utilizarse para categorizar partes de equipos, órdenes de trabajo o incidencias técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. El rendimiento real del modelo es desconocido y requiere evaluación independiente antes de su uso en producción.

## Requisitos de hardware

- Con ~1,7B parámetros y un tamaño de repo de 3,5 GB (consistente con pesos FP16), el modelo requiere aproximadamente 4 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090, o cualquier GPU con al menos 8 GB de VRAM para inferencia en FP16.
- En cuantización INT8 o INT4 (no incluida en el repo, pero aplicable mediante herramientas como llama.cpp o GPTQ), cabría en GPUs con 4-6 GB de VRAM, como RTX 3050 o GTX 1660 Super.
- Opciones de despliegue: vLLM, HuggingFace TGI (etiquetado como compatible), llama.cpp, Ollama, o transformers estándar.
- La latencia estimada en una GPU consumer moderna (RTX 4090) sería del orden de 20-50 ms por token generado, aunque no se dispone de mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| lecporr/rotating-equip-sft-merged | 1,7B | 32K (base) | Apache 2.0 | Equipos rotativos (inferida) |
| Qwen3-1.7B (base) | 1,7B | 32K | Apache 2.0 | Generalista |
| Qwen3-0.6B | 0,6B | 32K | Apache 2.0 | Generalista |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 (uso comercial permitido) | Generalista |

El modelo se diferencia del Qwen3-1.7B base únicamente por el fine-tuning SFT, que presumiblemente lo especializa en un dominio concreto. Frente a Llama-3.2-3B, ofrece la ventaja de la licencia Apache 2.0 (más permisiva que la licencia Llama) y un tamaño menor, a costa de una ventana de contexto más reducida (32K frente a 128K).

## Limitaciones y advertencias

- Model card extremadamente mínima: no se documentan datos de entrenamiento, composición del dataset, ni metodología de evaluación. Cualquier uso en producción requiere una evaluación independiente exhaustiva.
- Solo soporta inglés (etiqueta "en"). No se garantiza rendimiento en otros idiomas.
- Sin benchmarks publicados: el rendimiento real en tareas de razonamiento, código o dominio específico es desconocido.
- La especialización en equipos rotativos es inferida del nombre del repositorio, no confirmada por documentación. Podría tratarse de un fine-tuning sobre datos no relacionados.
- Riesgo de alucinación: como cualquier modelo de 1,7B fine-tuneado sin evaluación, puede generar información técnica incorrecta o inventada, especialmente en dominios especializados.
- 0 descargas y 0 likes en HuggingFace: sin adopción comunitaria ni validación externa.
- El modelo base fue entrenado con cuantización 4 bits (bnb-4bit), lo que puede haber introducido degradación de calidad respecto al Qwen3-1.7B original en FP16.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lecporr/rotating-equip-sft-merged
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL (HuggingFace): https://github.com/huggingface/trl
