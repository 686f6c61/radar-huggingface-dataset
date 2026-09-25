# positron-ai/google_gemma-4-E4B-it-ingest-best-gptq-permuted

## Resumen

`positron-ai/google_gemma-4-E4B-it-ingest-best-gptq-permuted` es un checkpoint cuantizado en GPTQ de 4 bits derivado de `google/gemma-4-E4B-it`, el modelo multimodal de la familia Gemma 4 de Google DeepMind. Lo publica el usuario `positron-ai` con una finalidad muy concreta y declarada: servir como fixture de ingesta en pipelines de integracion continua (CI) y pruebas de regresion. El propio autor indica en la model card que no reclama cualificacion para servir en produccion ni ninguna garantia de precision.

El modelo base pertenece a la familia Gemma 4, que segun la documentacion de Google DeepMind es multimodal: acepta texto e imagen como entrada y genera texto, con soporte de audio en los modelos mas pequenos. La nomenclatura «E4B» y el recuento real de parametros del repositorio (7.941.101.386 en safetensors) apuntan a un diseno con parametros efectivos reducidos respecto al total, aunque la informacion disponible no detalla la arquitectura interna ni el numero de parametros activos.

Su relevancia es fundamentalmente practica y acotada: se trata de una pieza de infraestructura para validar herramientas de cuantizacion, no de un modelo pensado para despliegue final. Publicado el 25 de septiembre de 2026, acumula 0 descargas y 0 likes, y el repositorio ocupa 10,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo base multimodal de la familia Gemma 4 (texto e imagen de entrada, texto de salida) |
| Parametros totales | 7.941.101.386 (segun safetensors) |
| Parametros activos | no disponible; la nomenclatura «E4B» sugiere un diseno con parametros efectivos reducidos, sin confirmar en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits, group size 64, simetrica, con activation order (actorder) habilitado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0, con license_link a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (checkpoint GPTQ, libreria transformers) |

## Arquitectura y entrenamiento

No hay informacion tecnica detallada sobre la arquitectura en la documentacion proporcionada. El modelo base `google/gemma-4-E4B-it` pertenece a la familia Gemma 4 de Google DeepMind, descrita como multimodal (entrada de texto e imagen, salida de texto, con audio en los modelos pequenos) y construida sobre la misma investigacion que Gemini 3. El sufijo «it» indica que se trata de la variante instruida (instruction-tuned), presumiblemente con ajuste por instrucciones y tecnicas de alineacion, aunque no se especifican los detalles de RLHF, DPO u otras etapas de post-entrenamiento.

Este repositorio concreto no es un reentrenamiento, sino una transformacion de pesos: una cuantizacion GPTQ de 4 bits con tamano de grupo 64, esquema simetrico y ordenacion de activaciones activada. La model card la describe explicitamente como «CI ingest checkpoint», un artefacto de prueba para validar la ingesta de checkpoints GPTQ y las pruebas de regresion asociadas. La diferencia entre el tamano del repositorio (10,2 GB) y el que corresponderia a una representacion puramente de 4 bits de 7,94 mil millones de parametros (del orden de 4-5 GB) sugiere que una parte de los pesos, posiblemente embeddings o la cabeza de salida, se conserva en mayor precision, aunque este extremo no se confirma en la informacion disponible.

## Capacidades

Debido a que se trata de un checkpoint de prueba derivado de un modelo multimodal, las capacidades declaradas son las del modelo base, no verificadas para este artefacto concreto:

- Generacion de texto conversacional (pipeline declarado: `text-generation`).
- Procesamiento de entrada multimodal imagen-texto, segun los tags `image-text-to-text` y `gemma4`.
- Soporte de audio en los modelos pequenos de la familia Gemma 4, segun la documentacion del modelo base.
- Capacidades multilingues: no disponible (los idiomas no se listan en la informacion proporcionada).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- El autor no reclama ninguna capacidad de precision ni de servicio para este checkpoint; su unica funcion declarada es servir de fixture de CI.

## Casos de uso

- Pruebas de integracion continua de pipelines de cuantizacion: el modelo se publica explicitamente como fixture para verificar que una herramienta de ingesta carga correctamente un checkpoint GPTQ de 4 bits con group size 64 y actorder, comparando el resultado contra una referencia conocida.
- Pruebas de regresion de frameworks de inferencia: permite comprobar que una version nueva de transformers, vLLM u Optimum sigue produciendo la misma salida sobre un checkpoint fijo, detectando regresiones en el soporte GPTQ.
- Validacion de scripts de conversion y permutacion de pesos: el sufijo «permuted» indica que los pesos se han reordenado; este artefacto sirve para verificar que una rutina de permutacion es reversible y consistente.
- Verificacion de carga en GPU de gama consumer: con unos 10,2 GB de pesos, sirve para comprobar que el pipeline de carga funciona en GPUs de 12-16 GB antes de pasar a modelos mayores.
- Pruebas de humo de extremo a extremo (smoke tests) en entornos de CI sin acceso a los checkpoints originales, que pueden ser de mayor tamano o requerir autenticacion.
- Benchmarking interno de latencia de carga y de memoria pico de un esquema GPTQ 4 bits frente a alternativas como GGUF o AWQ, usando un modelo de tamano medio como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el checkpoint se publica como fixture de prueba y que no se reclama ninguna cualificacion de servicio ni de precision, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales asociadas a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 10-11 GB solo para los pesos, dado que el repositorio ocupa 10,2 GB. Una representacion puramente de 4 bits de 7,94 mil millones de parametros ocuparia 4-5 GB, por lo que la diferencia apunta a que parte de los tensores se conserva en mayor precision.
- Memoria adicional: hay que sumar el cache KV, cuyo tamano depende de la longitud de contexto (no disponible) y del numero de capas. Para contextos largos en GPUs de 12 GB el margen puede ser insuficiente.
- GPU recomendadas: RTX 4090 (24 GB), A100 40/80 GB, H100, L40S. Una RTX 3090 o 4090 de 24 GB ofrece margen comodo; una RTX 3060 de 12 GB o una RTX 4070 de 12 GB quedan al limite.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas con holgura y en tarjetas de 12 GB con contextos cortos y cuantizacion de cache KV.
- Opciones de despliegue: transformers con Optimum/AutoGPTQ, vLLM, Text Generation Inference (TGI) y cualquier runtime que soporte GPTQ. No es directamente compatible con llama.cpp u Ollama, que requieren formato GGUF y una conversion previa.
- Latencia y throughput estimados: no disponible. No se proporcionan mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/google_gemma-4-E4B-it-ingest-best-gptq-permuted | 7,94 B | no disponible | GPTQ 4 bits, g64, simetrica, actorder | apache-2.0 con license_link a Gemma 4 | HuggingFace, 0 descargas |
| positron-ai/google_gemma-4-E4B-it-ingest-best-gptq | no disponible en la informacion | no disponible | GPTQ 4 bits | apache-2.0 con license_link a Gemma 4 | HuggingFace; repositorio hermano mencionado en la busqueda |
| google/gemma-4-E4B-it (modelo base) | no disponible en la informacion | no disponible | pesos sin cuantizar (presumiblemente bf16/fp16) | licencia de Gemma 4 | HuggingFace, Google AI for Developers, Qualcomm AI Hub |

No se dispone de datos de rendimiento comparativos entre estas variantes. La comparativa se limita a parametros, formato y licencia; las cifras de contexto y de evaluacion no estan publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que no se reclama cualificacion de servicio ni de precision: no debe usarse como base para un despliegue en produccion sin una evaluacion propia previa.
- Es un artefacto de prueba de CI, con 0 descargas y 0 likes, sin comunidad que haya validado su comportamiento.
- La cuantizacion GPTQ de 4 bits introduce perdida de precision respecto al modelo base, no cuantificada en la informacion disponible.
- El sufijo «permuted» indica reordenacion de pesos; si la rutina de permutacion no es correcta o no se documenta, puede producir salidas degeneradas sin que el error sea evidente.
- Sesgos conocidos: no disponible. El modelo base es de Google DeepMind y no se detallan sus evaluaciones de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; se hereda del modelo base y de la cuantizacion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican, por lo que no se puede garantizar el comportamiento multilingue.
- Licencia: aunque la etiqueta declare apache-2.0, el campo license_link apunta a la licencia especifica de Gemma 4. Hay que revisar los terminos de uso de Gemma 4, que pueden imponer restricciones adicionales a las de Apache 2.0, especialmente en cuanto a uso comercial y redistribucion.
- Al ser un derivado cuantizado, la licencia efectiva depende tanto de los terminos de Gemma 4 como de las condiciones que el publicador aplique.
- No hay garantia de compatibilidad con versiones futuras de transformers, vLLM u otros runtimes GPTQ.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/positron-ai/google_gemma-4-E4B-it-ingest-best-gptq-permuted
- Repositorio hermano en HuggingFace: https://huggingface.co/positron-ai/google_gemma-4-E4B-it-ingest-best-gptq
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Anuncio de Gemma 4 en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Ficha de Gemma-4-E4B-it en Qualcomm AI Hub: https://aihub.qualcomm.com/models/gemma_4_e4b_it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
