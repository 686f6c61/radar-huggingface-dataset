# jsantillana/Qwen2.5-Coder-32B-Instruct-GGUF

## Resumen

`jsantillana/Qwen2.5-Coder-32B-Instruct-GGUF` es un conjunto de cuantizaciones en formato GGUF del modelo `jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated`, que a su vez deriva del modelo oficial `Qwen/Qwen2.5-Coder-32B-Instruct` de Alibaba Qwen. El autor, jsantillana, publica tres variantes cuantizadas (Q3_K_M, Q4_K_M y Q8_0) pensadas para ejecucion local con llama.cpp en hardware de consumo y estaciones de trabajo, orientadas a tareas de programacion, automatizacion de shell y razonamiento agentico.

La particularidad del modelo es su condicion de "abliterated": se ha aplicado una tecnica de ablacion de direcciones de rechazo sobre los pesos del modelo original, lo que elimina total o parcialmente las negativas del modelo a responder ciertas peticiones. Esto lo orienta explicitamente a red-teaming y ciberseguridad, segun las etiquetas de la model card.

El modelo base cuenta con 32.763.876.352 parametros (aproximadamente 32,8 mil millones) y hereda la arquitectura transformer densa de la familia Qwen2.5-Coder. El repositorio ocupa 70,6 GB e incluye los tres ficheros GGUF. La licencia declarada es "other", heredada de la licencia original de Qwen2.5-Coder, que es Apache 2.0 con condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5-Coder) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-32B-Instruct soporta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q3_K_M (~14,8 GB), Q4_K_M (~19,5 GB), Q8_0 (~34,5 GB) |
| Idiomas soportados | en, es, zh |
| Licencia | other (heredada del modelo base Qwen2.5-Coder) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 32,8 mil millones de parametros, derivado de Qwen2.5-Coder-32B-Instruct. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original. La model card del autor no incluye informacion sobre el proceso de entrenamiento.

La innovacion tecnica destacable es el proceso de "abliteration" aplicado sobre el modelo base: se identifican y eliminan las direcciones de activacion asociadas al rechazo de peticiones, lo que modifica el comportamiento del modelo ante solicitudes que el modelo original rechazaria. Las cuantizaciones GGUF se han generado con llama.cpp y estan pensadas para inferencia local eficiente. No se documenta en la informacion disponible el metodo exacto de ablacion ni el impacto cuantificado sobre los benchmarks del modelo original.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion, heredadas de Qwen2.5-Coder.
- Razonamiento agentico y automatizacion de shell, segun la model card.
- Capacidades multilingues en ingles, espanol y chino.
- Comportamiento "abliterated": responde a peticiones que el modelo original rechazaria, orientado a red-teaming y ciberseguridad.
- Soporte de conversacion multi-turno (pipeline text-generation, tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se confirma en la informacion disponible soporte de tool calling, function calling, vision ni audio.

## Casos de uso

- Red-teaming de modelos: el caracter abliterated permite probar respuestas del modelo ante prompts adversarios y evaluar la robustez de sistemas que lo integren, comparando su comportamiento con el del modelo original no modificado.
- Auditoria de seguridad de codigo: el modelo puede analizar fragmentos de codigo y senalar patrones inseguros, aprovechando su base Qwen2.5-Coder y su menor reticencia a discutir tecnicas de explotacion en entornos controlados.
- Desarrollo local de asistentes de programacion: con la cuantizacion Q4_K_M (~19,5 GB) puede ejecutarse en una RTX 3090 o RTX 4090 de 24 GB mediante llama.cpp, ofreciendo generacion de codigo sin dependencia de la nube.
- Automatizacion de shell en estaciones de trabajo: la model card lo describe como modelo para automatizacion de shell, adecuado para generar y explicar comandos en entornos de administracion de sistemas.
- Investigacion sobre alineacion y seguridad: permite estudiar como la ablacion de direcciones de rechazo afecta a las capacidades generales y a la tasa de respuestas daninas, en un contexto academico.
- Despliegue en CPU con 32 GB de RAM: la variante Q3_K_M (~14,8 GB) esta pensada para CPUs Intel Xeon con AVX2 y 32 GB de RAM, lo que permite inferencia sin GPU en servidores modestos.
- Entornos de trabajo con 48 GB de VRAM: la variante Q8_0 (~34,5 GB) ofrece la mayor fidelidad respecto al modelo original para estaciones de trabajo profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada: ~14,8 GB para Q3_K_M, ~19,5 GB para Q4_K_M, ~34,5 GB para Q8_0 (tamanos de fichero declarados en la model card).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M; GPUs profesionales de 48 GB de VRAM para Q8_0.
- CPU: Intel Xeon con AVX2 y 32 GB de RAM para Q3_K_M; estaciones de trabajo con 64 GB de RAM para Q8_0.
- Cabe en GPU de consumo: si, la variante Q4_K_M en RTX 3090/4090; la Q3_K_M en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); compatible con endpoints segun los tags.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| jsantillana/Qwen2.5-Coder-32B-Instruct-GGUF (abliterated) | 32,8 B | no disponible | GGUF | other |
| Qwen/Qwen2.5-Coder-32B-Instruct-GGUF (oficial) | ~33 B | no disponible en la informacion | GGUF | Apache 2.0 (modelo original) |
| jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated (modelo base de este repo) | 32,8 B | no disponible | safetensors | other |

La diferencia principal frente al modelo oficial de Qwen es la ablacion de rechazos y la licencia "other" en lugar de la licencia original. No se dispone de datos de rendimiento comparativo entre ambas variantes.

## Limitaciones y advertencias

- El proceso de abliteration elimina barreras de seguridad: el modelo puede generar contenido danino, instrucciones de explotacion o codigo malicioso. Su uso debe restringirse a entornos controlados de red-teaming y ciberseguridad.
- Riesgo elevado de alucinacion en afirmaciones tecnicas, como en cualquier modelo de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad.
- La licencia "other" heredada del modelo base puede imponer restricciones al uso comercial; es necesario consultar los terminos de Qwen2.5-Coder antes de desplegarlo en produccion.
- Idiomas limitados a ingles, espanol y chino; el rendimiento en otros idiomas no esta documentado.
- Las cuantizaciones Q3_K_M y Q4_K_M introducen perdida de precision respecto al modelo en safetensors; no se han publicado metricas de degradacion.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que reduce la evidencia de validacion por la comunidad.
- No se confirma en la informacion disponible el soporte de tool calling ni de contexto largo, aunque el modelo base Qwen2.5-Coder si lo ofrece.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jsantillana/Qwen2.5-Coder-32B-Instruct-GGUF
- Modelo base abliterated: https://huggingface.co/jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated
- Modelo oficial Qwen2.5-Coder-32B-Instruct-GGUF: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct-GGUF
