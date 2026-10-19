# HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-060

## Resumen

`qwen3-4b-medicine-online-pilot-261017-seed42-step-060` es un ajuste fino del modelo Qwen3-4B-Instruct-2507, publicado por el grupo HYU-NLP-EVA2, orientado al dominio medico. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint intermedio (paso 60 de entrenamiento) de una ejecucion experimental identificada como `261017_medicine_online_pilot_seed42`, con semilla 42. El repositorio contiene una exportacion en BF16 para Transformers junto con el checkpoint nativo en formato veRL/FSDP dentro del directorio `original_checkpoint/`.

El modelo resuelve, en principio, la adaptacion de un LLM generalista de 4.022.468.096 parametros a tareas de medicina mediante un esquema de entrenamiento con rubricas evaluadas en linea (el nombre del run sugiere un piloto de RL con rubricas). Es relevante ahora porque la comunidad esta explorando el uso de modelos pequenos (rango 4B) especializados por dominio, que pueden desplegarse en hardware modesto y ajustarse con tecnicas de RL sobre rúbricas, en lugar de depender exclusivamente de modelos gigantes.

La informacion publicada es minima: la model card se limita a describir el artefacto (checkpoint, semilla, formato) y no incluye datos de entrenamiento, evaluacion ni capacidades. Con 17 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3, heredada del modelo base Qwen3-4B-Instruct-2507); detalles de capas y cabezas no disponibles |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens |
| Tipos de cuantizacion | el repositorio solo publica pesos en BF16; no se publican GGUF, AWQ ni GPTQ propios |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (exportacion BF16 para Transformers) + checkpoint nativo veRL/FSDP en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only denso con atencion por grupos de consultas (GQA), del que este repositorio hereda pesos e hiperparametros de tokenizador y contexto. Sobre esa base se ha aplicado un ajuste fino cuyo pipeline se ha ejecutado con veRL y FSDP, segun se deduce de la presencia de los ficheros nativos de checkpoint en `original_checkpoint/`. El nombre del run (`medicine_online_pilot`) apunta a un piloto de entrenamiento con recompensas basadas en rubricas evaluadas en linea, aunque la model card no lo confirma ni detalla la metodologia (RLHF, RLVR, DPO u otra).

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, los datos de instruccion utilizados ni si hubo fases de preferencia. El artefacto corresponde al paso 60 de una unica ejecucion con semilla 42, lo que indica un checkpoint intermedio dentro de un piloto, no un modelo convergido y validado. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento extendido) mas alla de las heredadas del modelo base.

## Capacidades

- Generacion de texto conversacional en el dominio medico, por herencia del ajuste sobre Qwen3-4B-Instruct-2507.
- Respuesta a instrucciones en formato chat (pipeline `text-generation`, tag `conversational`).
- Compatible con Text Generation Inference y con endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- Capacidades de razonamiento, codigo, matematicas y multilingues: no verificadas ni documentadas para este checkpoint concreto; se presumen las del modelo base, sin garantia tras el ajuste.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explicito (thinking): no documentado para este checkpoint.

## Casos de uso

- Evaluacion de pipelines de RL con rubricas: el checkpoint sirve como referencia intermedia para comparar la evolucion del entrenamiento (paso 60) frente al modelo base y frente a checkpoints posteriores de la misma ejecucion.
- Generacion de respuestas medicas de referencia en entornos de investigacion: util para construir y depurar conjuntos de evaluacion de QA clinico en un modelo de 4B ejecutable en una sola GPU.
- Experimentacion academica con ajuste por dominio: laboratorio de partida para reproducir el piloto con la semilla 42 y medir la sensibilidad al numero de pasos.
- Clasificacion y resumen de notas clinicas sinteticas: con contexto potencialmente largo (heredado del modelo base) puede procesar informes extensos, siempre sobre datos anonimizados o sinteticos.
- Prototipado de asistentes de formacion medica: escenarios de simulacion docente con supervision humana, aprovechando el bajo coste de inferencia de un modelo de 4B.
- Base para comparativas de seguridad y alucinacion: permite medir como evoluciona la tasa de afirmaciones no fundamentadas tras un ajuste especifico de dominio frente a Qwen3-4B-Instruct-2507.
- Despliegue en local para pruebas de integracion: al caber en GPUs de consumo, sirve para validar pipelines de TGI/vLLM antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 8 GB solo para pesos (4,02 B x 2 bytes), mas cache KV y overhead; en la practica, 12-16 GB para inferencia comoda con contexto moderado.
- VRAM estimada en FP8/INT8: aproximadamente 4-5 GB de pesos; 8-10 GB de VRAM total.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3 GB de pesos; viable en GPUs de 6-8 GB, siempre que se genere la cuantizacion a partir de los safetensors publicados.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), RTX 4060 Ti (16 GB) e incluso en GPUs de 8 GB con cuantizacion de 4 bits.
- GPU de datacenter: A100 (40/80 GB), H100, L40S y L4 son sobredimensionadas para un modelo de este tamano, pero permiten lotes grandes y mayor throughput.
- Opciones de despliegue: Transformers (formato publicado), Text Generation Inference (el repo esta etiquetado como compatible), vLLM, y llama.cpp/Ollama tras convertir los pesos a GGUF (no se distribuye GGUF oficial).
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota de almacenamiento: el repositorio ocupa 25,7 GB porque incluye, ademas del export BF16, el checkpoint nativo veRL/FSDP completo en `original_checkpoint/`; para servir el modelo solo es necesario el export raiz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-medicine-online-pilot-261017-seed42-step-060 | 4,02 B | no disponible (base: 262.144) | Apache-2.0 | HuggingFace, 17 descargas | Checkpoint intermedio de un piloto de dominio medico, sin evaluacion publicada |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | 262.144 tokens | Apache-2.0 | HuggingFace, ampliamente distribuido | Modelo generalista de referencia; mismo coste de inferencia |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace | El doble de parametros y licencia con restricciones de uso |
| MedGemma-4B-it | ~4 B | 128.000 tokens | Health AI Developer Foundation License | HuggingFace | Especifico de dominio medico con licencia restrictiva para uso clinico |

No se dispone de datos de rendimiento comparado entre estas opciones para este checkpoint; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 60) de un piloto: no hay evidencia de convergencia ni de calidad final; el comportamiento puede degradarse respecto al modelo base.
- Ausencia total de evaluacion publicada: no hay benchmarks, ni evaluacion clinica, ni analisis de seguridad.
- Riesgo elevado de alucinacion en contenido medico: no debe usarse para decisiones clinicas, diagnostico ni consejo sanitario sin supervision profesional.
- No es un producto sanitario: la licencia Apache-2.0 permite uso comercial, pero no otorga ninguna garantia de exactitud ni cumplimiento regulatorio (MDR, FDA).
- Datos de entrenamiento desconocidos: no se puede evaluar el sesgo de la muestra, la procedencia de los datos ni posibles contaminaciones con conjuntos de test.
- Idiomas no declarados: se desconoce si el ajuste ha degradado el rendimiento multilingue del modelo base; el castellano no esta verificado.
- Contexto efectivo no verificado: aunque el modelo base soporta 262.144 tokens, el ajuste puede haber alterado el comportamiento en ventanas largas.
- Sin soporte documentado de tool calling ni de agentes: no conviene asumir estas capacidades en produccion sin pruebas propias.
- Trazabilidad limitada: la model card no identifica autores, institucion, paper ni repositorio de codigo; solo un identificador de ejecucion y una semilla.
- Repositorio pesado (25,7 GB) por la duplicacion del checkpoint nativo, lo que complica su descarga y almacenamiento en entornos con cuotas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-060
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Referencia del framework de entrenamiento citado en el repositorio (veRL): https://github.com/volcengine/verl
- Referencia de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Paper, blog, demo o repositorio del autor: no disponibles; la busqueda web no ha devuelto ningun resultado relacionado con este modelo (los resultados obtenidos corresponden a entidades homonimas sin vinculacion: Hyundai France, canales de YouTube, ONE Championship y Deezer).
