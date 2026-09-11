# SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top5pct

## Resumen

JustRL-Qwen3-1p7b-Selective-Top5pct es un checkpoint de ajuste publicado en HuggingFace por el usuario SelectiveDOPD, procedente de los experimentos denominados "BiDirect-OPD" (rama interna `justrl_qwen3_1p7b_js_ladder_95_100_kl`). Por el nombre y por el recuento real de parametros de los pesos safetensors (2.031.739.904, coherente con los 2,03 millares de millones totales de Qwen3-1.7B incluyendo embeddings), todo apunta a que se trata de un fine-tuning sobre el modelo denso Qwen3-1.7B, pero la model card no lo confirma de forma explicita.

El repositorio contiene la rama `main` con el paso global 300 (`global_step_300`) y catorce ramas adicionales con checkpoints intermedios (pasos 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260 y 280). Esto lo situa como un artefacto de investigacion de tipo "escalera de entrenamiento" (ladder), util para estudiar la evolucion del modelo a lo largo del proceso de RL, mas que como un modelo listo para produccion.

La relevancia actual es limitada pero concreta: es un ejemplo publico de post-entrenamiento con refuerzo (aparentemente con restricciones KL y una divergencia JS objetivo, a juzgar por el identificador `js_ladder_95_100_kl` y por la etiqueta "Selective-Top5pct", que sugiere entrenamiento selectivo sobre un subconjunto del 5 % superior de muestras o tokens, extremo no confirmado). No tiene descargas ni likes, no declara licencia ni idiomas, y la card no incluye ningun dato de benchmarks ni de composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; por el nombre del repositorio se infiere un transformer decoder-only denso de la familia Qwen3 (no MoE) |
| Parametros totales | 2.031.739.904 (dato real de los safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen3-1.7B declara 32.768 tokens nativos; no verificado en este checkpoint) |
| Tipos de cuantizacion | No disponible. No se publican pesos cuantizados en el repositorio (solo safetensors en el repositorio original) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card no declara licencia |
| Formato de pesos | Safetensors (libreria `transformers`, `pipeline_tag: text-generation`) |
| Tamano del repositorio | 8,1 GB (incluye multiples ramas de checkpoint) |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada en la model card. Los unicos datos verificables son: el identificador del repositorio, el recuento de parametros de los safetensors (2,03 millares de millones) y la presencia de catorce ramas de checkpoint mas la rama `main` en el paso global 300. La libreria declarada es `transformers` y la tarea es `text-generation` con soporte conversacional.

A partir del nombre del modelo caben las siguientes inferencias, que deben tratarse como hipotesis y no como hechos: "Qwen3-1p7b" indica que el punto de partida es Qwen3-1.7B; "JustRL" sugiere un post-entrenamiento con aprendizaje por refuerzo (RL); "Selective-Top5pct" apunta a un esquema selectivo sobre un subconjunto del 5 % de datos, tokens o trayectorias; y `js_ladder_95_100_kl` sugiere una escala de configuraciones de divergencia Jensen-Shannon con una penalizacion KL. El nombre interno de los experimentos, "BiDirect-OPD", no se explica en ningun momento. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO, GRPO u otro algoritmo, ni sobre innovaciones tecnicas concretas.

## Capacidades

- Generacion de texto y modo conversacional: la model card declara `pipeline_tag: text-generation` y el repositorio incluye la etiqueta `conversational`.
- Compatibilidad con endpoints de inferencia: las etiquetas `text-generation-inference` y `endpoints_compatible` indican que el modelo esta preparado para desplegarse con Text Generation Inference y con los endpoints gestionados de HuggingFace, presumiblemente conservando la plantilla de chat de Qwen3.
- Capacidades heredadas del modelo base: al derivar de Qwen3-1.7B, se le presuponen generacion multilingue, razonamiento y generacion de codigo, pero la model card no documenta ni verifica ninguna de estas capacidades y el proceso de RL selectivo puede haberlas alterado.
- Tool calling / function calling: no disponible (no se documenta).
- Modo "thinking": no disponible (no se documenta si se conserva el modo de razonamiento explicito de la familia Qwen3).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multimodales (vision, audio): no disponibles; el modelo es de texto segun las etiquetas del repositorio.
- Idiomas soportados: no disponibles.

## Casos de uso

- Investigaion sobre dinamicamente de RL: al publicarse catorce checkpoints intermedios mas el paso 300, el repositorio permite estudiar como evolucionan las respuestas de un modelo de 2 millares de millones de parametros a lo largo de un proceso de RL con restriccion KL. Es el uso mas solido que ofrecen los datos disponibles.
- Analisis de colapso de diversidad: la etiqueta "Selective-Top5pct" sugiere entrenamiento sobre un subconjunto reducido; este checkpoint sirve para medir si ese sesgo reduce la variedad de respuestas, la perplejidad de validacion o la cobertura de tareas en comparacion con el modelo base.
- Punto de partida para fine-tuning posterior: con 2,03 millares de millones de parametros y pesos safetensors, es viable continuar el entrenamiento (SFT, DPO) sobre este checkpoint en una unica GPU de 24 GB, siempre que se aclare antes la situacion de licencia.
- Despliegue en entornos de bajos recursos: por tamano, es candidato a ejecutarse en GPU de consumo o en CPU con cuantizacion, para tareas de generacion de texto sencillas (resumen, reformulacion, clasificacion generativa) sin garantias de calidad al no existir evaluacion publica.
- Base para experimentos de decodificacion y alineacion: util como sujeto de prueba en comparaciones de tecnicas de decodificacion o de regularizacion frente a un modelo de referencia, dado que se conocen los pasos de entrenamiento exactos de cada rama.
- Prototipado conversacional interno: puede integrarse con la plantilla de chat de Qwen3 en un entorno de pruebas para validar flujos conversacionales, asumiendo que no hay datos de idiomas, sesgos ni seguridad que respalden un uso externo.
- Docencia y divulgacion: sirve como ejemplo reproducible de artefacto de investigacion con multiples checkpoints y metadatos minimos, util para explicar buenas y malas practicas de publicacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MT-Bench ni metricas equivalentes, y tampoco se documenta la metodologia de evaluacion ni el modelo base exacto contra el que comparar. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: unicamente paginas no relacionadas (foros de soporte en chino sobre descompresion de archivos y juegos), por lo que no hay datos externos que puedan citarse.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 2,03 millares de millones de parametros reales, no confirmada por el autor): aproximadamente 4,1 GB en bf16/fp16 solo para pesos; en torno a 2,2 GB en int8 y 1,2-1,4 GB en cuantizaciones de 4 bits.
- Cache KV: si se asume la configuracion publica de Qwen3-1.7B (28 capas, GQA con 8 cabezas KV y dimension de cabeza 128), el coste es de aproximadamente 115 KB por token, es decir unos 3,8 GB para una ventana de 32.768 tokens en fp16. Estas cifras son una extrapolacion del modelo base y no estan verificadas en este repositorio.
- GPU recomendadas: cualquier GPU con 8 GB o mas permite inferencia en bf16 con contexto moderado. Para contexto largo o lotes grandes conviene una RTX 4090, L40S, A100 o H100. Para cuantizacion de 4 bits basta una GPU de 4-6 GB.
- Caben en GPU de consumo: si. Ejemplos razonables serian RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, asi como equipos Apple Silicon con memoria unificada de 16 GB o mas. En placas de 4 GB solo con cuantizacion agresiva.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference`), endpoints gestionados de HuggingFace (etiqueta `endpoints_compatible`), vLLM o SGLang (compatibles con la familia Qwen3, sin verificar con este checkpoint) y llama.cpp/Ollama previa conversion a GGUF, formato que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas y dependen por completo del hardware y de la cuantizacion.

## Comparativa con modelos similares

Los datos de la columna de alternativas corresponden a especificaciones publicas de cada modelo base y no a este repositorio; se incluyen solo como referencia de categoria. La licencia, el contexto y los benchmarks del modelo analizado figuran como "no disponible" porque su model card no los declara.

| Modelo | Parametros totales | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| JustRL-Qwen3-1p7b-Selective-Top5pct | 2,03 millares de millones (verificado) | No disponible | No disponible | No disponible | HuggingFace, 15 ramas de checkpoint, 0 descargas |
| Qwen3-1.7B | 2,03 millares de millones | 32.768 tokens (extensible) | Apache 2.0 | Si, en la model card oficial | HuggingFace, ampliamente desplegado |
| Llama 3.2 1B | 1,24 millares de millones aprox. | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Si, en la model card oficial | HuggingFace, ecosistema amplio |
| SmolLM2-1.7B | 1,7 millares de millones aprox. | 8.192 tokens (extensible) | Apache 2.0 | Si, en la model card oficial | HuggingFace, con versiones GGUF |

En la practica, la comparacion relevante es contra el propio Qwen3-1.7B sin ajustar: sin benchmarks publicados no es posible afirmar que este checkpoint mejore, iguale o degrade el modelo base en ninguna tarea.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de generacion en la model card. Cualquier afirmacion sobre su calidad es especulativa.
- Licencia no declarada: el repositorio no indica licencia, lo que impide determinar si el uso comercial esta permitido. Aunque el modelo base Qwen3-1.7B se distribuye bajo Apache 2.0, esta derivada no hereda automaticamente una declaracion explicita y conviene contactar con el autor antes de cualquier uso productivo.
- Idiomas y sesgos: sin datos de composicion del dataset ni de idiomas de entrenamiento, no es posible caracterizar sesgos ni cobertura linguistica. Un proceso de RL selectivo sobre el 5 % superior de muestras puede estrechar la distribucion de respuestas y amplificar sesgos presentes en la funcion de recompensa.
- Riesgo de alucinacion: inherente a un modelo de 2 millares de millones de parametros sin alineacion documentada. No se declara ningun uso de RLHF, DPO ni filtros de seguridad.
- Riesgo de colapso por RL: el patron de checkpoints en escalera (pasos 20 a 300) es tipico de experimentos donde la recompensa puede degradar la diversidad o la coherencia en los pasos finales. La rama `main` corresponde al paso 300, el mas avanzado, no necesariamente el mejor.
- Trazabilidad insuficiente: la model card es practicamente auto-generada. No se indica el modelo base exacto, la plantilla de chat, el tokenizador ni los hiperparametros de entrenamiento. El nombre `js_ladder_95_100_kl` y la etiqueta "Selective-Top5pct" no se explican en ningun momento.
- Repositorio sobredimensionado: 8,1 GB para un modelo de 2,03 millares de millones de parametros indica que se almacenan multiples checkpoints, lo que complica la descarga selectiva y el versionado en produccion.
- Adopcion nula: 0 descargas y 0 likes. No hay evidencia de uso independiente, replicacion ni validacion por terceros.
- No apto para produccion sin validacion previa: no debe utilizarse en atencion al cliente, generacion de codigo, ambito sanitario, legal o financiero sin una evaluacion exhaustiva propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top5pct
- Ramas de checkpoint disponibles en el repositorio: `global_step_20`, `global_step_40`, `global_step_60`, `global_step_80`, `global_step_100`, `global_step_120`, `global_step_140`, `global_step_160`, `global_step_180`, `global_step_200`, `global_step_220`, `global_step_240`, `global_step_260`, `global_step_280` y `main` (`global_step_300`)
- Paper, blog, repositorio de codigo o demo: no disponibles. La busqueda web no devolvio ningun resultado relacionado con este modelo ni con los experimentos "BiDirect-OPD" o "JustRL".
