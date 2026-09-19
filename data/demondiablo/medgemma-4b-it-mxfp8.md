# Demondiablo/medgemma-4b-it-mxfp8

## Resumen

Demondiablo/medgemma-4b-it-mxfp8 es una version cuantizada en MXFP8 del modelo multimodal medico google/medgemma-4b-it, publicada por el usuario Demondiablo. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado del modelo base de Google al que se le ha aplicado una receta de cuantizacion de 8 bits con escalado microscopico por bloques, generada con llm-compressor y empaquetada en el formato compressed-tensors. El pipeline declarado es image-text-to-text, por lo que mantiene la capacidad de procesar imagenes medicas junto con texto.

La relevancia tecnica de esta ficha esta en el esquema de cuantizacion: MXFP8 sigue la especificacion OCP Microscaling Formats, con pesos en Float8 E4M3, escalado por grupos de 32 elementos y exponentes de escala E8M0 (compartidos por bloque), lo que ofrece mayor fidelidad numerica que el FP8 por tensor y permite aceleracion nativa en tensor cores de NVIDIA Blackwell (SM 10.0+). Los modulos sensibles a la precision clinica (lm_head, embed_tokens, multi_modal_projector y el vision tower) se mantienen en BF16.

El modelo tiene 4.300.079.472 parametros (~4,3 B), ocupa 5,5 GB en el repositorio y se distribuye bajo licencia Gemma. El autor lo valido en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 98 GB de VRAM. La model card no documenta resultados de benchmarks ni comparaciones de degradacion frente al modelo base en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Gemma 3; incluye vision tower y multi_modal_projector |
| Parametros totales | 4.300.079.472 (~4,3 B) segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de despliegue del autor configura max_model_len=4096 |
| Tipos de cuantizacion | MXFP8: pesos Float8 E4M3 con escalado por grupos de 32 y exponentes E8M0; activaciones con microscaling dinamico por grupos de 32. lm_head, embed_tokens, multi_modal_projector y vision tower preservados en BF16 |
| Idiomas soportados | No disponible (el campo de idiomas de la ficha de HuggingFace figura como no disponible) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors con cuantizacion compressed-tensors (MXFP8); incluye config.json, recipe.yaml, tokenizer, processor y plantilla de chat |

Datos adicionales: modelo base google/medgemma-4b-it; tamano del repositorio 5,5 GB; libreria transformers; tags de despliegue vllm y text-generation-inference, ademas de endpoints_compatible; fecha de creacion 2026-09-18; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

Este repositorio no aporta entrenamiento nuevo: es una cuantizacion post-entrenamiento del checkpoint google/medgemma-4b-it, que a su vez pertenece a la familia Gemma 3 (tag gemma3) y conserva su estructura multimodal con torre de vision. La receta aplicada con llm-compressor cuantiza los pesos lineales a Float8 E4M3 con un factor de escala por grupo de 32 elementos, almacenado con exponentes E8M0, y aplica microscaling dinamico por grupos de 32 a las activaciones de entrada. Este esquema reduce el numero de bits efectivos por parametro manteniendo la fidelidad numerica dentro de cada bloque, en lugar de compartir una unica escala por tensor.

La decision de diseno mas relevante para el ambito medico es la preservacion en BF16 de lm_head, embed_tokens, multi_modal_projector y los componentes de la torre de vision, con el objetivo declarado de no degradar la fidelidad clinica ni la interpretacion de imagenes. El repositorio incluye recipe.yaml para reproducir la cuantizacion y se valido sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition. No se detalla en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otra alineacion.

## Capacidades

- Generacion de texto conversacional con plantilla de chat incluida en el repositorio (modelo de tipo IT, instruction-tuned).
- Comprension conjunta de imagen y texto (pipeline image-text-to-text), orientada a contenido clinico y diagnostico por imagen.
- Razonamiento y respuesta en dominio medico y sanitario, heredado del ajuste de MedGemma sobre Gemma 3.
- Conversaciones multi-turno mediante el formato de mensajes (messages) con roles de usuario y asistente.
- Despliegue con decodificacion de alto rendimiento en vLLM, que parsea nativamente checkpoints MXFP8 en formato compressed-tensors.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas figura como no disponible).
- Modo thinking explicito, audio u otras modalidades: no documentado en la informacion proporcionada.

## Casos de uso

- Triaje asistido de radiologia: el modelo acepta imagen y texto en la misma peticion, de modo que puede recibir una radiografia de torax junto a una pregunta clinica y devolver una impresion estructurada para que el radiologo la revise. El max_model_len de 4096 del ejemplo de despliegue es suficiente para el prompt de imagen mas un informe corto.
- Redaccion y resumen de informes clinicos: con temperatura baja (0,2 en el ejemplo del autor) se puede generar texto repetible y sobrio a partir de notas de historia clinica, reduciendo variabilidad entre ejecuciones.
- Apoyo a la formacion medica: un asistente de preguntas y respuestas sobre casos, con la torre de vision en BF16 para interpretar figuras de atlas o imagenes de practicas.
- Extraccion de informacion de documentacion sanitaria: conversion de informes o notas en campos estructurados dentro de un pipeline, aprovechando la plantilla de chat y el soporte de endpoints compatibles para integrarlo en aplicaciones existentes.
- Despliegue on-premise con requisito de privacidad: al caber en una unica GPU Blackwell y distribuirse como safetensors, permite ejecutar la inferencia dentro de la infraestructura del hospital sin enviar datos de pacientes a servicios externos.
- Investigacion clinica retrospectiva: anotacion asistida de cohortes de imagenes con revision humana posterior, usando lotes moderados en vLLM para procesar volumenes altos.
- Precribado en dermatologia o imagen de urgencias: generacion de una primera descripcion de hallazgos visibles para priorizar la lectura por especialista, nunca como diagnostico autonomo.
- Evaluacion comparativa de cuantizaciones en investigacion: al incluir recipe.yaml, sirve como referencia reproducible para medir el impacto de MXFP8 frente a BF16 en tareas medicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones medicas, y tampoco reporta la degradacion de calidad respecto al modelo base google/medgemma-4b-it en BF16. No se deben extrapolar cifras del modelo original sin una evaluacion propia.

## Requisitos de hardware

- Pesos en MXFP8: aproximadamente 4,3 GB para los parametros cuantizados (8 bits por parametro) mas los factores de escala E8M0 (1 byte por cada 32 elementos, en torno a 0,13 GB adicionales). Estimacion calculada a partir del numero de parametros, no medida por el autor.
- Sobrecoste por modulos en BF16 (lm_head, embed_tokens, multi_modal_projector y vision tower): presente pero no cuantificado en la informacion disponible.
- VRAM total estimada para inferencia: del orden de 6 GB con contexto de 4096 tokens y lote pequeno, sumando pesos, escalas y cache KV; el repositorio completo ocupa 5,5 GB en disco.
- GPU validadas por el autor: NVIDIA RTX PRO 6000 Blackwell Server Edition (98 GB de VRAM).
- Aceleracion nativa: tensor cores MXFP8 en NVIDIA Blackwell (SM 10.0+). En arquitecturas anteriores (A100, H100) no se documenta aceleracion nativa de MXFP8 en la informacion proporcionada, por lo que el rendimiento puede depender del fallback de dequantizacion del framework.
- Cabe en GPU de consumo: si, siempre que se disponga de una GPU Blackwell con al menos 8-10 GB de VRAM libre; en GPUs no Blackwell el modelo puede cargarse pero sin la via acelerada documentada.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors MXFP8), text-generation-inference (declarado en los tags) y transformers. Para llama.cpp u Ollama no se documenta soporte de MXFP8, por lo que requeriria una conversion previa a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Demondiablo/medgemma-4b-it-mxfp8 | 4,3 B | No disponible (ejemplo de despliegue con 4096) | MXFP8 (E4M3 con escalado por grupos de 32) | Gemma | HuggingFace, vLLM, TGI |
| google/medgemma-4b-it (modelo base) | Mismo base, ~4,3 B (no confirmado en la informacion proporcionada) | No disponible | BF16 | Gemma | HuggingFace, transformers |
| Otras cuantizaciones de medgemma-4b-it (FP8, INT8, AWQ, GGUF) | No disponible | No disponible | No disponible | Gemma | No disponible en la informacion proporcionada |

Las busquedas web realizadas no devolvieron informacion tecnica relacionada con este modelo ni con alternativas comparables, por lo que no se pueden completar mas filas de la comparativa con datos verificados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser una derivacion de MedGemma, hereda los sesgos del corpus medico de entrenamiento del modelo base, que no se detalla en la informacion disponible.
- Riesgo de alucinacion: relevante en dominio clinico; el propio autor no publica evaluaciones de fidelidad factual ni de tasas de error tras la cuantizacion.
- La cuantizacion introduce una perdida de precision no medida: no hay comparativa de calidad frente al modelo base en BF16, por lo que se recomienda validar en la tarea concreta antes de usarlo en produccion.
- Uso clinico: un modelo de 4,3 B no es un dispositivo medico ni sustituye el criterio profesional; cualquier salida debe pasar por supervision humana.
- Longitud de contexto: el valor real no se especifica; el ejemplo de despliegue limita a 4096 tokens, lo que puede ser insuficiente para historiales largos o series de imagenes.
- Idiomas: el campo de idiomas figura como no disponible, asi que no hay garantia declarada de cobertura multilingue distinta del ingles.
- Restricciones de licencia: se aplica la Gemma Terms of Use con sus condiciones de uso, redistribucion y politicas de uso prohibido; conviene revisar los terminos antes de un uso comercial.
- Requisito de hardware especifico: la aceleracion nativa MXFP8 esta ligada a NVIDIA Blackwell (SM 10.0+); el rendimiento en otras generaciones de GPU no esta documentado.
- Madurez del artefacto: 0 descargas y 0 likes, publicacion sin historial de mantenimiento; el campo de idiomas aparece vacio y la model card no incluye resultados de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Demondiablo/medgemma-4b-it-mxfp8
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- llm-compressor (framework de cuantizacion): https://github.com/vllm-project/llm-compressor
- compressed-tensors (formato de checkpoint): https://github.com/vllm-project/compressed-tensors
- vLLM (motor de inferencia): https://github.com/vllm-project/vllm
- Nota: las busquedas web realizadas no devolvieron papers, blogs, repositorios ni demos relacionados con este modelo o su esquema de cuantizacion.
