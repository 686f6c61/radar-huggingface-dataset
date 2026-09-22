# SeanWang0027/qwen3-1.7b-searchqa-guided-opd-qwen3-32b-step200

## Resumen

SeanWang0027/qwen3-1.7b-searchqa-guided-opd-qwen3-32b-step200 es un ajuste fino del modelo base Qwen/Qwen3-1.7B obtenido mediante destilacion on-policy guiada (Guided-OPD, del proyecto FutureBridge) sobre el conjunto de datos SearchQA. El resultado es un modelo denso de 2.031.739.904 parametros (segun los pesos publicados en safetensors) orientado a generacion de texto conversacional en escenarios de pregunta-respuesta con busqueda, es decir, tareas de tipo ReAct donde el modelo alterna razonamiento y consultas a un entorno de recuperacion de informacion.

El entrenamiento sigue un esquema de destilacion en el que un profesor de mayor capacidad (Qwen3-32B en bf16) guia al estudiante (Qwen3-1.7B) turno a turno, con un reparto de roles profesor/estudiante por turno y un coeficiente beta con decaimiento coseno de 1.0 a 0.0 a lo largo del 80 por ciento de los pasos. Se congelo el modo thinking (thinking off) y se utilizo la conversacion ReAct del script searchqa/eval_react.py, con 16 rondas por episodio. El checkpoint publicado corresponde al paso 200 del entrenador.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un artefacto de investigacion, no de un modelo listo para produccion. La propia model card indica "Not evaluated", el repositorio no declara licencia ni idiomas soportados, no incluye cuantizaciones alternativas y no se han publicado resultados de benchmarks. Su interes principal es metodologico (replicar el pipeline TCOD/OPD sobre SearchQA) mas que como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); no se detallan capas ni dimensiones en la informacion proporcionada |
| Parametros totales | 2.031.739.904 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 4,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, y se ajusta con destilacion on-policy guiada (Guided-OPD) implementada sobre el codigo de kokolerk/TCOD mas el overlay FutureBridge-OPD (trinity-rft). El esquema asigna roles de profesor y estudiante por turno dentro de la conversacion, con un parametro beta que decae de forma coseno desde 1.0 hasta 0.0 cubriendo el 80 por ciento de los pasos de entrenamiento, y una perdida mixta con mu = 0.5. El profesor es Qwen3-32B en bf16 y el estudiante es Qwen3-1.7B.

Los datos de entrenamiento corresponden al split de 6000 preguntas de SearchQA, portado segun el documento docs/TCOD_SEARCHQA.md del repositorio online-rose (rama tcod-searchqa). La conversacion sigue el formato ReAct de searchqa/eval_react.py con 16 rondas, modo thinking desactivado, batch de 16 episodios / 64 turnos, learning rate 1e-6, coeficiente KL de 1.0 y 200 pasos totales. El checkpoint publicado es la exportacion a HuggingFace del paso 200. No se documenta composicion adicional del dataset, uso de RLHF o DPO, ni innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a pregunta-respuesta.
- Razonamiento de tipo ReAct: alternancia de pasos de razonamiento y consultas a un entorno de busqueda/recuperacion, con hasta 16 rondas por episodio segun la configuracion de entrenamiento.
- Ajuste especifico sobre el dominio SearchQA, es decir, preguntas factibles de resolver mediante recuperacion de evidencia.
- Modo thinking desactivado durante el entrenamiento, por lo que no se ha optimizado para cadenas de razonamiento explicitas largas.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada, aunque la tarea ReAct implica interaccion con un entorno de busqueda.
- Capacidades de agente multi-paso: derivadas del formato ReAct, limitadas al esquema de busqueda de SearchQA.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles (no se mencionan).

## Casos de uso

- Prototipado de agentes de busqueda y QA: el modelo puede integrarse como componente estudiante en un bucle ReAct para responder preguntas que requieren consultar un indice documental, replicando el escenario exacto de entrenamiento (SearchQA).
- Investigacion en destilacion on-policy: sirve como punto de comparacion frente a otros checkpoints del mismo pipeline TCOD/Guided-OPD, ya que el repositorio conserva el estado del paso 200 para reproducir curvas de entrenamiento.
- Experimentos de destilacion profesor-alumno a pequena escala: al tener un profesor Qwen3-32B y un estudiante Qwen3-1.7B, permite medir la transferencia de comportamiento con un coste computacional bajo en el lado del estudiante.
- Evaluacion de degradacion por destilacion: util para estudiar cuanto del rendimiento del profesor se conserva en un modelo 18 veces menor bajo un presupuesto de 200 pasos.
- Generacion de trazas de razonamiento ReAct como datos sinteticos: el modelo puede producir secuencias de pensamiento-accion-observacion en el dominio de QA con busqueda, reutilizables para filtrar o aumentar datasets.
- Pruebas de infraestructura de entrenamiento: sirve para validar pipelines que usan transformers, TensorBoard, safetensors y TGI antes de escalar a modelos mayores.
- Despliegue en entornos con GPU de gama media para demos internas: por su tamano de 2,03 mil millones de parametros, cabe en GPUs de consumo con suficiente memoria, lo que permite montar un servicio de QA experimental sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "Not evaluated" para el checkpoint del paso 200.

## Requisitos de hardware

- Peso de los pesos en precision de entrenamiento (bf16/fp16): aproximadamente 4,1 GB, coherente con el tamano del repositorio.
- VRAM estimada para inferencia: en torno a 5-6 GB en bf16/fp16 contando pesos y cache KV; alrededor de 3 GB en cuantizacion INT8; en torno a 1,5-2 GB en INT4 (estimaciones generales a partir del numero de parametros, no verificadas con este checkpoint).
- GPU recomendadas: cabe con holgura en una RTX 4090 (24 GB), RTX 4080, RTX 3090 y RTX 3060 de 12 GB en bf16; en GPUs profesionales, A100, H100, L40S o A10G son mas que suficientes.
- Compatibilidad con GPU de consumo: si, en cualquier tarjeta con 8 GB o mas en cuantizacion y con 8-12 GB en precision completa.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (el modelo lleva la etiqueta endpoints_compatible), TensorBoard para el seguimiento del entrenamiento. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa por parte del usuario. vLLM es viable al ser una arquitectura Qwen3 densa estandar, aunque no esta confirmado en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-searchqa-guided-opd-qwen3-32b-step200 | 2.031.739.904 | no disponible | Ajuste por destilacion OPD sobre SearchQA | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-1.7B (modelo base) | ~1,7 mil millones nominales | no disponible en la informacion proporcionada | Modelo denso de proposito general | Apache 2.0 segun la ficha del modelo base, no verificada aqui | Ampliamente disponible |
| Qwen/Qwen3-32B (profesor) | ~32 mil millones | no disponible en la informacion proporcionada | Modelo denso de proposito general | Apache 2.0 segun la ficha del modelo base, no verificada aqui | Ampliamente disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, origen y disponibilidad.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no ha sido evaluado ("Not evaluated"). No hay ninguna garantia de calidad, exactitud ni coherencia en las respuestas.
- Sesgos conocidos: no disponible. Al entrenarse sobre SearchQA, que es un dataset en ingles y de dominio acotado, es probable que herede los sesgos de esa fuente, pero no hay analisis publicado en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado. Es un modelo pequeno destilado de un profesor mucho mayor en un unico dominio, lo que aumenta el riesgo de inventar respuestas fuera de ese dominio.
- Limitacion de idioma: no se declaran idiomas soportados. El entrenamiento con SearchQA sugiere un uso principal en ingles; el rendimiento en castellano es desconocido.
- Ambito de uso muy restringido: el entrenamiento se limita a conversaciones ReAct de 16 rondas con thinking desactivado. Comportamientos fuera de ese formato no estan garantizados.
- Licencia: no disponible. Esta es una advertencia critica para produccion, ya que sin licencia explicita no puede asumirse permiso de uso comercial. Ademas, el uso derivado debe verificar las condiciones de la licencia del modelo base Qwen3-1.7B.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 22 de septiembre de 2026, sin senales de mantenimiento ni de comunidad.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ, por lo que el despliegue en entornos con memoria limitada exige conversion manual.
- Caveat de contexto: no se especifica la longitud de contexto efectiva tras el ajuste fino, lo que impide planificar aplicaciones con historiales largos.

## Enlaces

- HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-searchqa-guided-opd-qwen3-32b-step200
- Modelo base: Qwen/Qwen3-1.7B (referenciado en la model card; URL no proporcionada en la informacion disponible)
- Repositorio de codigo TCOD: kokolerk/TCOD (mencionado en la model card; URL no proporcionada)
- Overlay FutureBridge-OPD sobre trinity-rft (mencionado en la model card; URL no proporcionada)
- Repositorio online-rose, rama tcod-searchqa, documento docs/TCOD_SEARCHQA.md (mencionado en la model card; URL no proporcionada)
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web.
