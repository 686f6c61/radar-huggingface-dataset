# mradermacher/Kronumos-Kairos-v2-i1-GGUF

## Resumen

Kronumos-Kairos-v2-i1-GGUF es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo Kronumos-Kairos-v2, publicado originalmente por el usuario Kronumos. Se trata de un modelo de tipo transformer decoder-only de aproximadamente 7,6 mil millones de parametros (7.615.616.512 segun los safetensors del modelo base) construido sobre la arquitectura Qwen2, segun la etiqueta `qwen2` de la model card. El repositorio no contiene pesos nuevos: es una redistribucion optimizada para inferencia local, con cuantizaciones de tipo imatrix (i1) en el rango IQ1_S a Q6_K.

El problema que aborda el modelo base es la reparacion automatica de programas y la resolucion de tareas de ingenieria de software reales, ya que fue entrenado (o ajustado) tomando como referencia el dataset princeton-nlp/SWE-bench_Verified. Las etiquetas del autor (`autonomous-agents`, `program-repair`, `automated-program-repair`, `code-generation`, `swe-bench`) situan el modelo en el nicho de agentes autonomos que editan repositorios de codigo, y otras etiquetas mas idiosincraticas (`rust-subcortex`, `dual-brain`, `right-brain`, `procedural-seeds`) reflejan la nomenclatura propia del autor sin que la model card documente su significado tecnico.

La relevancia de esta ficha concreta es practica: permite ejecutar el modelo en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF, con ficheros que van de 2,0 GB (i1-IQ1_S) a 6,4 GB (i1-Q6_K). La informacion publica sobre arquitectura interna, contexto, regimen de entrenamiento y benchmarks es muy escasa, por lo que gran parte de los apartados siguientes quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (segun etiqueta `qwen2`) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La unica referencia arquitectonica disponible es la etiqueta `qwen2` incluida por el autor, lo que apunta a un transformer decoder-only con atencion causal, normalizacion RMSNorm y el esquema de embeddings de Qwen2. No se documenta en la model card el numero de capas, dimensiones ocultas, cabezas de atencion ni el tipo de tokenizer mas alla de la mencion implicita a la familia Qwen2. Tampoco se especifica la longitud de contexto, dato que resulta critico para tareas de reparacion de codigo sobre repositorios reales.

En cuanto al entrenamiento, la informacion disponible es puramente inferencial a partir de las etiquetas y del campo `pipeline: reinforcement-learning`. El dataset declarado es princeton-nlp/SWE-bench_Verified, un conjunto de incidencias reales de GitHub con parches de referencia utilizado habitualmente para evaluar agentes de ingenieria de software. La presencia de etiquetas como `unsloth`, `reinforcement-learning` y `procedural-seeds` sugiere un proceso de ajuste fino y, probablemente, etapas de aprendizaje por refuerzo, pero no se detallan hiperparametros, numero de tokens de entrenamiento, composicion del corpus ni si hubo RLHF o DPO. No se documenta ninguna innovacion tecnica especifica (decodificacion especulativa, atencion lineal, atencion hibrida, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de codigo en general, con enfasis declarado en reparacion automatica de programas (`program-repair`, `automated-program-repair`).
- Resolucion de incidencias de software del estilo SWE-bench, es decir, localizar el fallo, editar ficheros y producir un parche.
- Comportamiento como agente autonomo (`autonomous-agents`), lo que implica planificacion multi-paso sobre un entorno de codigo.
- Conversacion multi-turno, segun la etiqueta `conversational`.
- Soporte de tool calling / function calling: no disponible (no confirmado en la model card).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (`thinking mode`): no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Otras etiquetas del autor sin descripcion tecnica: `rust-subcortex`, `dual-brain`, `right-brain`, `procedural-seeds`.

## Casos de uso

- Reparacion automatica de errores en repositorios: el modelo puede recibir el fallo de una suite de tests y generar un parche, aprovechando su ajuste sobre SWE-bench_Verified. Es el escenario para el que el autor parece haber disenado el modelo.
- Agente de mantenimiento de dependencias: integrado en un bot que abre pull requests ante vulnerabilidades o cambios de API, leyendo el arbol del proyecto y proponiendo ediciones acotadas.
- Asistente de revision de codigo en CI: conectado a un pipeline de integracion continua, analiza el diff de cada PR y sugiere correcciones antes del merge. Requiere verificar el soporte real de tool calling antes de desplegarlo.
- Generacion de tests unitarios a partir de codigo existente, como complemento al bucle de reparacion.
- Migracion de fragmentos de codigo entre versiones de un lenguaje o framework, siempre que el contexto efectivo del modelo sea suficiente para el fichero en cuestion.
- Analisis de trazas de error en produccion: dado un stack trace y el codigo relevante, identificar la causa raiz y proponer un cambio.
- Prototipado local sin conexion: al distribuirse en GGUF, permite ejecutar el modelo en una estacion de trabajo aislada, algo util en entornos con codigo propietario que no puede salir de la red corporativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni ninguna otra metrica. El dataset SWE-bench_Verified aparece unicamente como dato de entrenamiento o evaluacion declarado en el campo `datasets`, sin cifras asociadas. Los resultados de la busqueda web realizada no guardan relacion con el modelo y no aportan datos utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el fichero GGUF elegido: en torno a 2,0-2,9 GB para las cuantizaciones IQ1/IQ2, entre 3,2 y 4,2 GB para IQ3/Q3, alrededor de 4,3-4,8 GB para IQ4/Q4, 5,4 GB para Q5_K_S y 6,4 GB para Q6_K. Hay que anadir el espacio de la cache KV, cuyo tamano depende de la longitud de contexto, dato no disponible.
- Las cuantizaciones Q4_K_M e IQ4_XS (4,3-4,8 GB) caben con holgura en GPUs de consumo con 8 GB o mas, como RTX 3060 Ti, RTX 4060, RTX 3070 o superiores.
- Las cuantizaciones Q6_K (6,4 GB) requieren al menos 8 GB de VRAM dedicada o el uso de offload parcial a CPU/RAM.
- Las cuantizaciones de 2 bits (IQ1/IQ2) permiten ejecucion en GPUs de 4-6 GB o incluso en CPU con RAM suficiente, a costa de una degradacion de calidad que el propio autor senala en las notas ("for the desperate", "very low quality").
- Para servir el modelo a varios usuarios de forma concurrente, se recomienda una GPU profesional tipo A10, L4, A100 o H100, aunque no hay datos de throughput publicados para este modelo.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp, text-generation-webui) al tratarse de ficheros GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay datos de benchmarks ni de contexto que permitan una comparacion cuantitativa honesta con alternativas de la misma categoria. Como referencia estructural, se pueden citar modelos de tamano similar y orientacion a codigo, pero sin cifras de rendimiento verificadas para Kronumos-Kairos-v2:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kronumos-Kairos-v2 | ~7,6 B | no disponible | apache-2.0 | HuggingFace (base y GGUF) |
| Qwen2.5-Coder-7B | ~7,6 B | no disponible en esta ficha | apache-2.0 (segun variante) | HuggingFace, ampliamente cuantizado |
| DeepSeek-Coder-V2-Lite | ~16 B (MoE) | no disponible en esta ficha | licencia propia | HuggingFace |

La comparacion de rendimiento entre estos modelos no puede establecerse con la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse predominantemente en ingles y sobre codigo, es esperable un sesgo hacia convenciones de codigo angloparlantes, pero no hay evidencia publicada.
- Riesgo de alucinacion: elevado en tareas de codigo, donde el modelo puede inventar APIs, funciones o ficheros inexistentes. La ausencia de benchmarks publicados impide cuantificar este riesgo.
- Idiomas: el modelo esta declarado unicamente para ingles (`en`). El rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto desconocida: esto limita seriamente su uso en repositorios grandes, ya que no se puede planificar cuanto codigo cabe en el prompt.
- Cuantizaciones agresivas: los ficheros IQ1 e IQ2 degradan la calidad de forma notable, tal y como advierte el propio mradermacher en las notas de la tabla de cuants. Para uso serio se recomienda Q4_K_M o superior.
- Licencia: apache-2.0, lo que permite uso comercial y modificacion. No obstante, conviene verificar la licencia del modelo base Kronumos/Kronumos-Kairos-v2, ya que la model card del GGUF la declara pero el repositorio base podria tener condiciones adicionales.
- Trazabilidad: las etiquetas `dual-brain`, `right-brain`, `rust-subcortex` y `procedural-seeds` no vienen acompanadas de ninguna explicacion tecnica, lo que dificulta la reproducibilidad.
- Procedencia de los datos de ajuste: se declara SWE-bench_Verified como dataset, pero no se detalla la composicion completa del corpus de entrenamiento.
- Popularidad nula: el repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace (cuantizaciones imatrix): https://huggingface.co/mradermacher/Kronumos-Kairos-v2-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Kronumos-Kairos-v2-GGUF
- Modelo base: https://huggingface.co/Kronumos/Kronumos-Kairos-v2
- Dataset de referencia: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Verified
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#Kronumos-Kairos-v2-i1-GGUF
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
