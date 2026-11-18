# ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-3e-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-3e-compile-ep3 es un ajuste fino (SFT) del modelo ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, que a su vez deriva de la familia Qwen3.5. El autor, ConnorYU, publica este checkpoint bajo licencia Apache 2.0 con un total de 9.409.813.744 parametros almacenados en formato safetensors. Por los tags del repositorio, el pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales de entrada (imagen y texto), aunque la model card no documenta detalles al respecto.

El modelo esta orientado a tareas medicas segun indica su nombre ("Medical-SFT"), y ha sido entrenado con la libreria Unsloth junto con TRL de Hugging Face, lo que el autor describe como un entrenamiento 2x mas rapido. Se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de evaluacion publicados.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de la cadena de ajustes (GRPO con instrucciones thinking, seguido de SFT medico) sobre una base Qwen3.5 de ~9B; por otro, advierte de la escasez de informacion verificable, lo que limita su uso en produccion sin una evaluacion propia. La informacion disponible sobre arquitectura interna, datos de entrenamiento y contexto es muy limitada y se indica como "no disponible" cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con cuantizacion estandar via transformers/bitsandbytes, sin confirmar) |
| Idiomas soportados | en (segun model card y tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre el checkpoint ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, que a su vez parece haber sido entrenado con GRPO (Group Relative Policy Optimization) sobre una base Qwen3.5 de ~9,4B parametros. El nombre del checkpoint incluye "think", lo que sugiere un modo de razonamiento explicito (thinking mode) heredado de la cadena de entrenamiento. El tag `image-text-to-text` y el pipeline declarado indican que la familia Qwen3.5 en esta configuracion admite entradas multimodales de imagen y texto.

El entrenamiento se realizo con Unsloth y TRL, segun la model card, y el autor afirma una velocidad 2x superior frente a un entrenamiento convencional. No se especifican el numero de tokens de entrenamiento, la composicion del dataset medico, si hubo RLHF/DPO adicional, ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). El sufijo "3e-compile-ep3" sugiere 3 epocas y compilacion, pero no se documenta su significado exacto.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` y el idioma declarado.
- Razonamiento con modo "think" heredado de la cadena GRPO/thinking (indicado por el nombre del modelo base).
- Entrada multimodal imagen-texto segun el pipeline declarado (`image-text-to-text`), sin documentacion adicional de capacidades visuales.
- Ajuste especifico para dominio medico por el SFT aplicado (sin detalle del dataset ni de las tareas cubiertas).
- Compatibilidad con text-generation-inference y transformers, segun los tags.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no documentado; el modo think podria habilitarlo, pero no se confirma.
- Capacidades multilingues: solo `en` declarado.
- Capacidades especiales (vision, audio, thinking): vision y thinking plausibles por tags y nombre; audio no disponible.

## Casos de uso

- Asistencia clinica documental en ingles: el modelo puede redactar resumenes de historiales o notas clinicas en ingles, aprovechando el SFT medico; requiere validacion por personal sanitario por el riesgo de alucinacion.
- Preguntas y respuestas medicas de apoyo: util como borrador de respuestas para profesionales, con revision humana obligatoria; su naturaleza SFT medico lo hace mas adecuado que la base para terminologia clinica.
- Extraccion de informacion de imagenes medicas simples (si la capacidad multimodal se confirma): el pipeline image-text-to-text permitiria describir o clasificar imagenes acompanadas de texto, siempre con supervision experta.
- Generacion de material formativo sanitario: redaccion de casos, preguntas de autoevaluacion y explicaciones en ingles para estudiantes de medicina.
- Preprocesado de informes en pipelines NLP: clasificacion, resumen y normalizacion de textos clinicos en ingles integrados en flujos de datos.
- Prototipado de asistentes conversacionales de salud: base para experimentar con dialogos multi-turno en ingles, con contexto limitado por la falta de datos sobre ventana.
- Investigacion en ajuste fino medico: punto de partida para experimentos de SFT/GRPO en dominio clinico con licencia Apache 2.0.

No se recomienda su uso en diagnostico autonomo, triaje clinico sin supervision ni atencion al paciente directa sin capas de seguridad adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB de pesos, mas overhead de activaciones y KV cache; se recomienda 24 GB o mas (p. ej., RTX 4090 24 GB, A10G 24 GB) para contexto corto.
- VRAM estimada en cuantizacion 8 bits: ~10-11 GB; en 4 bits: ~6-7 GB (estimacion por tamano, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para produccion; RTX 4090 o L40S para desarrollo; cabe en GPU de consumo de 24 GB en FP16 con contexto limitado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), endpoints_compatible; vLLM, llama.cpp y Ollama no estan documentados para este checkpoint (la presencia de safetensors no garantiza GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-3e-compile-ep3 | 9,41B | no disponible | apache-2.0 | SFT medico sobre base Qwen3.5; sin benchmarks |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400 (modelo base) | ~9,4B (estimado) | no disponible | no disponible | Checkpoint previo con GRPO/thinking |
| Familia Qwen3.5 (modelo oficial) | no disponible | no disponible | no disponible | Referencia de la arquitectura base |
| Otros LLM medicos open source en ingles (p. ej., variantes Meditron/Llama medicas) | variable | variable | variable | Comparacion generica; datos no disponibles en la busqueda |

No se dispone de datos de rendimiento comparativo verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; un SFT medico sobre datos no descritos puede heredar sesgos de la base y del dataset clinico.
- Riesgo de alucinacion elevado en dominio medico; no apto para decisiones clinicas sin revision experta.
- Contexto maximo no documentado; limita el diseno de aplicaciones con documentos largos.
- Solo ingles declarado; no se garantiza calidad en castellano ni otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso medico recae en el integrador; verificar terminos de la base Qwen3.5.
- Model card minima: sin dataset, sin evaluacion, sin instrucciones de uso; checkpoint de investigacion con 0 descargas, lo que reduce la validacion comunitaria.
- La capacidad multimodal (image-text-to-text) no esta documentada en detalle; probar antes de asumirla.
- El modo "think" puede incrementar latencia y tokens de salida; considerar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Paper GRPO (referencia general): no disponible en la busqueda para este modelo
- Repos, blogs y demos adicionales: no disponibles
