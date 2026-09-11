# es-hetero/ckpt-countdown-families

## Resumen

ckpt-countdown-families es un repositorio de checkpoints de HuggingFace publicado por el usuario es-hetero (serie CDFAM) que recoge el resultado de entrenar cinco familias de modelos no-Qwen sobre la tarea Countdown mediante estrategias de evolución (Evolution Strategies, ES). Las familias son cd-llama3b-*, cd-gemma4b-*, cd-llama8b-*, cd-olmo7b-* y cd-olmoe-*, y cada una se entrena con cinco variantes o brazos (fixed, fresh, hetero, mirror y mirror-v3) durante 300 iteraciones.

No se trata de un modelo listo para inferencia, sino de los artefactos de un estudio de investigación sobre heterogeneidad en ES denominado "learning while serving", alojado en el repositorio https://github.com/akshat57/es-heterogeneity. Cada ejecución incluye checkpoints periódicos, un guardado final, las generaciones de evaluación por ejemplo y un registro de pasos.

El interés actual del repositorio es de reproducibilidad: permite reanudar entrenamientos ES, comparar el efecto de distintas políticas de muestreo de lotes y servir como punto de partida para convertir los pesos a safetensors de transformers y desplegarlos. La licencia declarada es Apache-2.0 y el repositorio no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers decoder-only (familias Llama, Gemma y OLMo) y arquitectura MoE (familia OLMoE); la model card no detalla las variantes exactas |
| Parametros totales | Cinco familias de distinto tamano, segun el identificador del brazo: cd-llama3b-* (aprox. 3B), cd-gemma4b-* (aprox. 4B), cd-olmo7b-* (aprox. 7B), cd-olmoe-* (aprox. 7B) y cd-llama8b-* (aprox. 8B). Valores exactos no disponibles |
| Parametros activos | No disponible. El brazo cd-olmoe-* corresponde a un modelo MoE, pero la model card no indica el numero de parametros activos |
| Longitud de contexto | No disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | No disponible. Los checkpoints se publican exclusivamente en bf16; no hay versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los pesos derivados pueden quedar ademas sujetos a las licencias de los modelos base, que la model card no especifica) |
| Formato de pesos | `.pth` (state dicts de PyTorch en bf16, con claves correspondientes a nombres de parametros de vLLM y proyecciones fusionadas `qkv_proj` y `gate_up_proj`). La conversion a safetensors de transformers esta anunciada pero pendiente |

## Arquitectura y entrenamiento

Cada checkpoint es el resultado de ajustar un modelo base mediante Evolution Strategies, un metodo de optimizacion sin gradiente que perturba los parametros, evalua la funcion de fitness de cada miembro de la poblacion y actualiza los pesos a partir de las perturbaciones mejor valoradas. El entrenamiento se realiza sobre la tarea Countdown, un problema de razonamiento aritmetico en el que hay que alcanzar un numero objetivo combinando una lista de operandos con operaciones basicas. No se documenta en la model card el uso de RLHF, DPO ni supervision con anotaciones humanas.

El eje del estudio es la composicion del lote compartido entre miembros de la poblacion, y se materializa en cinco brazos: fixed (L0, un unico lote compartido reutilizado), fresh (L0.5, un lote compartido nuevo en cada paso), hetero (L1, un lote nuevo por miembro), mirror (V1, pares antiteticos con lote por par) y mirror-v3 (V3, pares antiteticos con lote por miembro). Cada ejecucion se compone de checkpoints periodicos `<run>/iter<N>.pth`, un guardado final `<run>/final/pytorch_model.pth` situado dos o tres pasos ES despues del ultimo checkpoint periodico, generaciones de evaluacion por ejemplo en `<run>/eval-output/` y un registro `<run>/steps.jsonl`. La innovacion tecnica destacable es precisamente la comparacion sistematica de politicas de muestreo de lotes (reutilizado, fresco, heterogeneo y antitetico) en un mismo presupuesto de 300 iteraciones y sobre cinco arquitecturas base distintas.

## Capacidades

- Generacion de respuestas para la tarea Countdown: composicion de operaciones aritmeticas para alcanzar un numero objetivo a partir de una lista de operandos.
- Razonamiento aritmetico de varios pasos, inducido por el entrenamiento ES y no por instrucciones genericas.
- Reanudacion de entrenamiento: los checkpoints son compatibles con la ruta de resume del entrenador original.
- Evaluacion reproducible: cada ejecucion incluye las generaciones de evaluacion por ejemplo en `eval-output/`.
- Trazabilidad experimental: el fichero `steps.jsonl` actua como libro mayor de pasos del entrenamiento.
- Comparacion entre familias base: permite contrastar el comportamiento de Llama, Gemma, OLMo y OLMoE bajo el mismo algoritmo de optimizacion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multilingues.
- No se ha publicado ninguna version convertida a safetensors ni empaquetada para servidores de inferencia estandar.

## Casos de uso

- Investigacion en optimizacion sin gradiente: los checkpoints permiten reproducir y auditar experimentos de Evolution Strategies sobre LLM sin reentrenar desde cero, reanudando desde `iter<N>.pth`.
- Estudio de politicas de muestreo de lotes: comparar los brazos L0, L0.5, L1, V1 y V3 sobre las mismas condiciones controla el efecto de la heterogeneidad del lote en la convergencia de ES.
- Analisis de "learning while serving": el diseno del estudio permite medir como evoluciona el rendimiento del modelo mientras se sigue sirviendo, gracias al ledger `steps.jsonl` y a las generaciones de evaluacion.
- Ajuste eficiente en memoria de tareas de razonamiento: al no requerir retropropagacion, el enfoque ES es utilizable en escenarios con memoria de entrenamiento muy limitada, partiendo de los modelos base de 3B a 8B.
- Punto de partida para despliegue: una vez convertidos a safetensors, los pesos pueden cargarse en vLLM, cuyas convenciones de nombres de parametros ya siguen los checkpoints.
- Comparacion entre familias de modelos: el repositorio permite contrastar Llama 3B frente a Llama 8B, Gemma 4B, OLMo 7B y OLMoE bajo un presupuesto identico de 300 iteraciones.
- Docencia y divulgacion: los artefactos intermedios permiten ilustrar visualmente como se comporta la evaluacion paso a paso en una tarea de razonamiento acotada.
- Replicacion academica: el enlace al repositorio del estudio (`akshat57/es-heterogeneity`) facilita la verificacion independiente de los resultados publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la estructura de los artefactos (checkpoints, guardado final, generaciones de evaluacion y ledger) pero no incluye cifras agregadas de exactitud en Countdown, MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones numericas entre brazos o familias.

## Requisitos de hardware

- Los checkpoints se almacenan como state dicts en bf16 y pueden cargarse en CPU con memoria RAM suficiente antes de transferirlos a GPU.
- VRAM estimada para inferencia en bf16 (aproximada, segun el tamano del modelo base): en torno a 7-9 GB para las familias de 3B-4B, y en torno a 15-18 GB para las familias de 7B-8B (incluido OLMoE, que ocupa memoria por sus parametros totales aunque active una fraccion en cada token).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para servir varias familias en paralelo o hacer ajuste ES; RTX 4090 24 GB para las familias de 3B a 8B en bf16.
- Cabe en GPU de consumo: las familias de 3B y 4B caben en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) y las de 7B-8B en tarjetas de 16-24 GB (RTX 4080, RTX 4090).
- Opciones de despliegue: vLLM es la via natural, dado que los checkpoints usan sus nombres de parametros con `qkv_proj` y `gate_up_proj` fusionados. Las alternativas llama.cpp, Ollama y TGI no son utilizables sin una conversion previa a safetensors y, en su caso, a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

No se conocen colecciones publicas de checkpoints directamente comparables (mismo estudio, misma tarea y mismo presupuesto de 300 iteraciones ES). La comparacion mas informativa es interna, entre los cinco brazos definidos en la model card:

| Brazo | Denominacion | Politica de lote | Reutilizacion |
|---|---|---|---|
| fixed | L0 | Un unico lote compartido, reutilizado | Maxima |
| fresh | L0.5 | Lote compartido nuevo | Alta |
| hetero | L1 | Lote nuevo por miembro | Nula |
| mirror | V1 | Pares antiteticos, lote por par | Media |
| mirror-v3 | V3 | Pares antiteticos, lote por miembro | Nula |

En cuanto a las familias de modelos base incluidas, la model card solo aporta el identificador de cada brazo:

| Familia | Parametros aproximados | Contexto | Licencia del modelo base | Disponibilidad |
|---|---|---|---|---|
| cd-llama3b-* | aprox. 3B | no disponible | no especificada en la model card | checkpoints en este repositorio |
| cd-gemma4b-* | aprox. 4B | no disponible | no especificada en la model card | checkpoints en este repositorio |
| cd-olmoe-* | aprox. 7B (MoE) | no disponible | no especificada en la model card | checkpoints en este repositorio |
| cd-olmo7b-* | aprox. 7B | no disponible | no especificada en la model card | checkpoints en este repositorio |
| cd-llama8b-* | aprox. 8B | no disponible | no especificada en la model card | checkpoints en este repositorio |

## Limitaciones y advertencias

- No es un modelo desplegable: el repositorio contiene checkpoints de entrenamiento, no un artefacto listo para inferencia. Falta la conversion anunciada a safetensors de transformers.
- Ambito restringido: el ajuste se ha realizado sobre la tarea Countdown, por lo que no cabe esperar comportamiento de asistente general, seguimiento de instrucciones libres ni conversacion abierta.
- Sin datos de evaluacion agregados: no hay cifras publicas de exactitud, por lo que no es posible estimar la calidad real de los checkpoints.
- Riesgo de alucinacion y de degeneracion en las generaciones: es esperable en modelos ajustados con ES sobre una tarea acotada, y no hay metricas que lo cuantifiquen.
- Idiomas: no documentados. La tarea Countdown es eminentemente numerica y no se declara cobertura multilingue.
- Sesgos: no evaluados. Los checkpoints heredan los sesgos de los modelos base, que la model card no identifica con version exacta.
- Encaje de licencias: la licencia declarada es Apache-2.0, pero al tratarse de pesos derivados de modelos de terceros (Llama, Gemma, OLMo) conviene verificar las condiciones de cada modelo base antes de cualquier uso comercial. La model card no aclara este punto.
- Cuantizacion: no existen versiones GGUF, AWQ, GPTQ ni FP8, lo que limita el despliegue en entornos de baja VRAM.
- Trazabilidad incompleta: los checkpoints se guardan como state dicts con nombres de parametros de vLLM, por lo que su carga directa en transformers no esta garantizada sin el conversor pendiente.
- Inconsistencia de metadatos: la fecha de creacion que declara HuggingFace para el repositorio es 2026-09-11, posterior a la fecha habitual de publicacion, lo que sugiere un error de registro.
- Adopcion nula: cero descargas y cero likes, sin validacion externa conocida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/es-hetero/ckpt-countdown-families
- Repositorio del estudio "learning while serving" (ES heterogeneity): https://github.com/akshat57/es-heterogeneity
- Resultados de la busqueda web: no aportan informacion relevante sobre el modelo. Los enlaces devueltos corresponden a dominios de una comercializadora electrica francesa (es.fr, particuliers.es.fr) y a entradas de diccionario sobre la preposicion francesa "es"/"ès", sin relacion con el repositorio.
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada.
