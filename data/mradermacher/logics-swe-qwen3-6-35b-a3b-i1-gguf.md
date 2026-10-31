# mradermacher/Logics-SWE-Qwen3.6-35B-A3B-i1-GGUF

## Resumen

Logics-SWE-Qwen3.6-35B-A3B es un modelo de lenguaje especializado en ingeniería de software (SWE, *software engineering*) y generación de código, desarrollado por Logics-MLLM a partir de la arquitectura Qwen3.6. Se trata de un modelo de tipo MoE (*Mixture of Experts*) con 34.660.610.688 parámetros totales, de los cuales aproximadamente 3B están activos por token (como indica el sufijo "A3B"), lo que permite un rendimiento de inferencia elevado manteniendo la capacidad de un modelo de tamaño medio-grande.

El modelo ha sido entrenado mediante técnicas de post-entrenamiento agéntico, incluyendo aprendizaje por refuerzo (RL), destilación *on-policy* y el uso del dataset Logics-MLLM/Logics-SWE-Env-2.5K, un entorno específico para tareas de ingeniería de software. Esto lo orienta de forma concreta hacia la resolución de issues reales, edición de repositorios y razonamiento multi-paso sobre bases de código.

La ficha que se presenta aquí corresponde a la cuantización GGUF con imatrix (*importance matrix*) realizada por mradermacher, que proporciona versiones comprimidas del modelo para su ejecución local con llama.cpp, Ollama y otras herramientas compatibles, con cuants que van desde 7,6 GB (IQ1_S) hasta 28,6 GB (Q6_K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (basado en Qwen3.6) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B (indicado por el sufijo A3B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix); el modelo base esta disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base, Logics-MLLM/Logics-SWE-Qwen3.6-35B-A3B, es un transformer de tipo MoE derivado de Qwen3.6, con 34,7B de parametros totales y unos 3B activos por token. Esta configuracion permite obtener latencias y throughput propios de modelos de 3B manteniendo la capacidad representacional de un modelo mucho mayor, una caracteristica especialmente util en flujos agenticos donde se realizan muchas llamadas consecutivas al modelo.

El post-entrenamiento se ha centrado en ingenieria de software mediante tres tecnicas declaradas en la model card: aprendizaje por refuerzo (reinforcement learning), destilacion on-policy (on-policy distillation) y entrenamiento agéntico (agentic post-training). El dataset de entrenamiento declarado es Logics-MLLM/Logics-SWE-Env-2.5K, un entorno de 2.500 muestras aparentemente disenado para tareas SWE. No se ha publicado informacion detallada sobre el numero de tokens de preentrenamiento, la composicion completa del corpus ni los algoritmos de RL concretos utilizados. La version aqui documentada es una cuantizacion GGUF con matriz de importancia (imatrix) generada por mradermacher, que no altera los pesos originales sino que los comprime para inferencia local.

## Capacidades

- Generacion y edicion de codigo, con especializacion en tareas de ingenieria de software (resolucion de issues, parches, refactoring).
- Razonamiento agéntico multi-paso: el entrenamiento agéntico y el pipeline de RL sugieren capacidad para operar en bucles de agente (planificar, ejecutar herramientas, observar, corregir).
- Etiquetado con la pipeline "reinforcement-learning" en HuggingFace, lo que indica afinidad con flujos de trabajo de RL y entornos interactivos.
- Capacidades conversacionales (tag "conversational").
- El repositorio estatico indica que se trata de un modelo de vision: los archivos mmproj estan disponibles en el repositorio estatico de mradermacher, por lo que el modelo base soportaria entrada multimodal (vision).
- Soporte de tool calling: no disponible explicitamente en la informacion proporcionada, aunque el entrenamiento agéntico sugiere que esta orientado a uso con herramientas.
- Idioma principal de trabajo: ingles.

## Casos de uso

- Resolucion automatica de issues en repositorios reales: el modelo puede integrarse en frameworks agénticos tipo SWE-agent para analizar un bug, localizar el archivo afectado y proponer un parche, aprovechando su post-entrenamiento especifico en entornos SWE.
- Revision de pull requests: dado su enfoque en ingenieria de software, puede usarse como revisor automatico que comenta cambios, detecta regresiones potenciales y sugiere mejoras en pipelines de CI/CD.
- Refactoring de bases de codigo heredadas: con ~3B de parametros activos, es lo bastante rapido para iterar sobre multiples archivos en sesiones largas de edicion asistida.
- Generacion de tests unitarios a partir de codigo existente: puede analizarse el codigo fuente y producir casos de prueba que cubran rutas criticas, integrandose en etapas de calidad del pipeline de desarrollo.
- Asistentes de codigo locales y privados: gracias a las cuantizaciones GGUF (desde ~21 GB en Q4_K_M), puede ejecutarse en estaciones de trabajo con GPUs de consumo para equipos que no pueden enviar codigo a APIs externas.
- Investigacion en RL y destilacion on-policy para codigo: al ser Apache 2.0 y publicarse junto a su entorno de entrenamiento (Logics-SWE-Env-2.5K), es util como base reproducible para experimentos de post-entrenamiento agéntico.
- Analisis de capturas o documentacion visual: al tratarse de un modelo con soporte de vision (mmproj disponible), puede procesar capturas de errores de interfaz o diagramas junto con codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas (SWE-bench, HumanEval, LiveCodeBench u otras), y tampoco se han encontrado datos publicados para el modelo base Logics-MLLM/Logics-SWE-Qwen3.6-35B-A3B en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamaño de cada cuant GGUF):
  - i1-Q4_K_M (recomendada, 21,3 GB): cabe en una RTX 3090/4090 de 24 GB con contexto moderado.
  - i1-Q4_K_S (20,0 GB) e i1-IQ4_XS (18,8 GB): opciones mas holgadas para 24 GB con contexto largo.
  - i1-Q5_K_M (24,8 GB) e i1-Q6_K (28,6 GB): requieren GPUs de 32 GB (por ejemplo RTX 5090, RTX PRO 6000) o descarga parcial a CPU/RAM.
  - i1-IQ3_M (15,5 GB) e inferiores: ejecutables en GPUs de 16 GB (RTX 4080/4090 laptops, RTX 5060 Ti 16 GB) con calidad reducida.
  - i1-IQ1_S/IQ1_M (7,6-8,3 GB): solo como ultimo recurso, con degradacion notable de calidad.
- Dado que solo ~3B de parametros estan activos por token (MoE), la velocidad de generacion una vez cargado el modelo es comparable a la de un modelo denso de 3B, aunque la VRAM necesaria depende del tamaño total del archivo.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M; A100 40 GB o H100 para servir el modelo a multiples usuarios con vLLM o TGI usando los pesos originales en safetensors.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (LM Studio, Ollama, koboldcpp) para las cuants de esta ficha; vLLM, SGLang o TGI para el modelo base en formato original.
- Latencia y throughput estimados: no disponible; al ser un MoE con ~3B de parametros activos, se espera un throughput alto en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| Logics-SWE-Qwen3.6-35B-A3B | ~34,7B | ~3B | safetensors / GGUF (imatrix) | Apache 2.0 | Ingenieria de software agéntica (RL + destilacion on-policy) |
| Qwen3-30B-A3B (Alibaba) | ~30,5B | ~3B | safetensors / GGUF | Apache 2.0 | Modelo generalista MoE, fuerte en codigo y razonamiento |
| Qwen3-Coder-30B-A3B-Instruct | ~30,5B | ~3B | safetensors / GGUF | Apache 2.0 | Codigo y tareas agénticas de programacion |

Comparado con Qwen3-30B-A3B y Qwen3-Coder-30B-A3B-Instruct, Logics-SWE-Qwen3.6-35B-A3B comparte la filosofia MoE con ~3B de parametros activos, pero aporta un post-entrenamiento especifico en entornos SWE con RL y destilacion on-policy, lo que teoricamente lo favorece en tareas de resolucion de issues y edicion de repositorios. Sin benchmarks publicados para el modelo base, no es posible cuantificar la diferencia de rendimiento frente a estas alternativas.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de codigo, puede generar APIs, funciones o rutas de archivos inexistentes; en flujos agénticos es recomendable validar cada parche con compilacion y tests automaticos.
- Idioma: la model card declara unicamente ingles como idioma soportado; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto: no disponible en la informacion proporcionada; debe verificarse antes de planificar tareas que requieran repositorios grandes en contexto.
- Cuantizaciones extremas: las versiones IQ1_S, IQ1_M, IQ2_* y Q2_* (7,6-13 GB) presentan degradacion significativa de calidad segun las propias notas del cuantizador y deben evitarse en produccion.
- Vision: los archivos mmproj se encuentran en el repositorio estatico (mradermacher/Logics-SWE-Qwen3.6-35B-A3B-GGUF), no en este; es necesario descargarlos de alli para usar capacidades multimodales.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque el modelo base hereda los terminos de Qwen3.6, cuya licencia conviene revisar en el repositorio original.
- Datos de entrenamiento: el dataset Logics-SWE-Env-2.5K es pequeno (2.500 muestras declaradas); el alcance real del post-entrenamiento y posibles sesgos del modelo base no estan documentados.
- Benchmarks: al no existir resultados publicados, la idoneidad para un caso de uso concreto debe validarse empiricamente antes de adoptar el modelo en produccion.

## Enlaces

- Repositorio de la cuantizacion GGUF (imatrix): https://huggingface.co/mradermacher/Logics-SWE-Qwen3.6-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estaticas GGUF (incluye archivos mmproj): https://huggingface.co/mradermacher/Logics-SWE-Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Logics-MLLM/Logics-SWE-Qwen3.6-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/Logics-MLLM/Logics-SWE-Env-2.5K
- Pagina de descarga resumida de mradermacher: https://hf.tst.eu/model#Logics-SWE-Qwen3.6-35B-A3B-i1-GGUF
- Guia de uso de GGUF de TheBloke referenciada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog oficial o demos: no disponibles en la informacion proporcionada.
