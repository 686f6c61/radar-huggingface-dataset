# SelectiveDOPD/JustRL-Distilled-DeepSeek-7b-Selective-Top10pct

## Resumen

JustRL-Distilled-DeepSeek-7b-Selective-Top10pct es un modelo de generacion de texto publicado en HuggingFace por el usuario SelectiveDOPD, con 7.615.616.512 parametros (aproximadamente 7,6 mil millones) y pesos en formato safetensors. La model card lo describe como un artefacto subido desde el experimento interno `justrl_deepseek_7b_JSD_rel_90_100`, dentro de los experimentos denominados BiDirect-OPD, y la rama `main` corresponde al checkpoint `global_step_300`. El repositorio incluye ademas 14 ramas con checkpoints intermedios, desde `global_step_20` hasta `global_step_280`.

El nombre del modelo sugiere un proceso de destilacion (posiblemente ligado a aprendizaje por refuerzo, por las siglas RL) sobre una base de 7B y una seleccion del 10 % superior de algun criterio, aunque la model card no documenta el procedimiento, los datos de entrenamiento ni la base exacta utilizada. Las etiquetas de HuggingFace indican `qwen2` como arquitectura, `text-generation` como pipeline y `conversational` como caso de uso, lo que apunta a un transformer decoder-only de tipo Qwen2 adaptado para dialogo; no obstante, existe una discrepancia entre esa etiqueta y el nombre del modelo, que alude a DeepSeek.

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas, y no publica resultados de benchmarks. Se trata, por tanto, de un artefacto de investigacion sin validacion externa ni documentacion suficiente para un despliegue en produccion sin evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiqueta `qwen2` en HuggingFace (transformer decoder-only); no se detalla en la model card |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano del repositorio: 15,2 GB) |
| Libreria | transformers |
| Pipeline | text-generation |
| Etiquetas adicionales | conversational, text-generation-inference, endpoints_compatible, region:us |
| Checkpoint de la rama `main` | global_step_300 |
| Ramas adicionales | global_step_20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo. La unica referencia tecnica es la etiqueta `qwen2` de HuggingFace, que corresponde a una familia de transformers decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con query/key/value bias. El recuento de parametros (7,6 B) es coherente con un modelo denso de esa escala, pero no se confirma en la documentacion disponible ni se indica el numero de capas, la dimension oculta o el numero de cabezas de atencion.

Respecto al entrenamiento, la model card unicamente indica que el modelo se subio desde el experimento `justrl_deepseek_7b_JSD_rel_90_100` dentro de los experimentos BiDirect-OPD, y que se conservan checkpoints cada 20 pasos hasta el paso 300. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la base sobre la que se entreno, ni si se aplicaron tecnicas de alineacion como RLHF, DPO u optimizacion por preferencias. El sufijo `JSD` del identificador interno podria corresponder a una divergencia de Jensen-Shannon, y `Selective-Top10pct` a una seleccion del 10 % superior de ejemplos o de tokens, pero se trata de interpretaciones del nombre y no de datos confirmados por el autor. No hay constancia de innovaciones tecnicas documentadas como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado es `text-generation` y la libreria es `transformers`.
- Conversacion multi-turno: la etiqueta `conversational` sugiere un formato de chat, aunque no se documenta la plantilla de prompt ni los tokens especiales.
- Compatibilidad con text-generation-inference y `endpoints_compatible`, segun las etiquetas del repositorio.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible; no hay indicios de modalidades adicionales.
- Razonamiento matematico o generacion de codigo: no documentado, aunque el nombre del modelo alude a una destilacion de DeepSeek; no se aportan evidencias.

## Casos de uso

Dado que el modelo no publica benchmarks, licencia ni documentacion de entrenamiento, los casos siguientes deben entenderse como escenarios de investigacion o de evaluacion interna, nunca como despliegues en produccion sin validacion previa.

- Investigacion en destilacion y aprendizaje por refuerzo: el repositorio ofrece 15 checkpoints (`global_step_20` a `global_step_300`), lo que permite estudiar la evolucion de las capacidades del modelo a lo largo del entrenamiento comparando ramas con un mismo pipeline de evaluacion.
- Reproduccion de experimentos BiDirect-OPD: el identificador interno `justrl_deepseek_7b_JSD_rel_90_100` permite a un equipo que trabaje en esa linea comprobar resultados intermedios sin reentrenar.
- Fine-tuning posterior: al ser un modelo de 7,6 B con pesos safetensors y libreria `transformers`, es un candidato razonable para ajuste supervisado o DPO en una GPU unica de 24 GB usando LoRA o QLoRA.
- Evaluacion comparativa de calidad conversacional: si la etiqueta `conversational` se confirma, puede emplearse como baseline en pruebas ciegas de chat frente a otros modelos de 7B, siempre midiendo antes la tasa de alucinacion.
- Generacion de texto offline o en entornos aislados: un modelo de 7,6 B cuantizado a 4 bits ocupa del orden de 4-5 GB, lo que permite ejecutarlo en estaciones de trabajo sin conexion para tareas de redaccion o resumen no criticas.
- Servicio de inferencia autohospedado: las etiquetas `text-generation-inference` y `endpoints_compatible` indican que el autor preve su uso con TGI, lo que facilita montar un endpoint interno para pruebas de carga y latencia.
- Docencia y experimentacion con modelos abiertos: su tamano manejable permite ilustrar tecnicas de cuantizacion, despliegue y evaluacion en cursos o laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no adjunta evaluaciones. No se deben asumir capacidades derivadas del nombre del modelo sin medirlas.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (7,6 B) y del tamano del repositorio (15,2 GB), no datos publicados por el autor:

- Inferencia en FP16/BF16: aproximadamente 15,2 GB solo de pesos, mas 2-4 GB de cache KV y activaciones, lo que situa el requisito practico en torno a 18-20 GB de VRAM.
- Inferencia en INT8: del orden de 8 GB de pesos, con un requisito total estimado de 10-12 GB.
- Inferencia en 4 bits (GPTQ, AWQ o GGUF Q4): del orden de 4-5 GB de pesos, con un total estimado de 6-8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con lotes grandes; L40S, RTX A6000 o RTX 4090 (24 GB) para FP16 o INT8 con lotes reducidos; RTX 3090, RTX 4080 o GPUs de 12-16 GB para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM siempre que se cuantice a 4 bits; en 8 GB resulta ajustado y depende de la longitud de contexto efectiva.
- Opciones de despliegue: vLLM y TGI para safetensors en FP16/BF16 o cuantizacion compatible; llama.cpp u Ollama solo si se generan pesos GGUF a partir del modelo, ya que el repositorio no los publica.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de arquitectura suficientes (numero de capas, dimension oculta, longitud de contexto) para estimarlos con rigor.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus model cards publicas. Para el modelo objeto de esta ficha no hay datos de contexto, licencia ni rendimiento, de modo que la comparacion queda necesariamente incompleta.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| JustRL-Distilled-DeepSeek-7b-Selective-Top10pct | 7,6 B | No disponible | No disponible | No disponible |
| Qwen2.5-7B | 7,61 B | 32.768 nativo, ampliable a 131.072 con YaRN | Apache-2.0 | Si, publicado por el autor |
| DeepSeek-R1-Distill-Qwen-7B | 7,6 B | 131.072 | MIT | Si, publicado por el autor |
| Mistral-7B-v0.3 | 7,25 B | 32.768 | Apache-2.0 | Si, publicado por el autor |

La diferencia fundamental no es de capacidad teorica sino de trazabilidad: las tres alternativas declaran licencia, contexto e idiomas y publican evaluaciones, mientras que este modelo carece de esos datos. Ademas, la etiqueta `qwen2` sugiere que la base podria ser la propia Qwen2-7B, en cuyo caso el interes del repositorio estaria en el proceso de destilacion y no en la arquitectura subyacente.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia en HuggingFace, por lo que el uso comercial queda en un limbo legal. Hay que contactar con el autor antes de cualquier despliegue productivo.
- Ausencia de benchmarks: no hay ninguna medicion publica de calidad, razonamiento, codigo o matematicas. Cualquier afirmacion sobre su rendimiento seria especulativa.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni se documenta si hubo alineacion con preferencias humanas, por lo que se debe asumir una tasa de alucinacion desconocida y potencialmente alta.
- Idiomas no declarados: no se especifica que idiomas soporta ni la calidad relativa entre ellos; en particular, no hay confirmacion de un buen rendimiento en castellano.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin medir antes el comportamiento real mas alla del contexto de entrenamiento.
- Discrepancia de metadatos: la etiqueta `qwen2` choca con el nombre del modelo, que alude a DeepSeek, y la fecha de creacion declarada (2026-09-11) resulta atipica. Conviene verificar la procedencia de los pesos antes de confiar en ellos.
- Sin validacion comunitaria: 0 descargas y 0 likes implican que nadie ha reportado fallos, sesgos ni comportamientos anomalos. Es un modelo sin historial de uso.
- Riesgo de sesgos: al desconocerse la composicion del dataset de entrenamiento, no se puede evaluar que sesgos de genero, raza, religion o ideologia pueda arrastrar.
- Checkpoints intermedios sin garantias: las 14 ramas adicionales corresponden a pasos de entrenamiento y no deben tratarse como versiones estables ni comparables entre si sin una evaluacion propia.
- Formato unico: solo hay safetensors, de modo que el despliegue en llama.cpp u Ollama exige convertir los pesos previamente y validar que la conversion no degrada la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Distilled-DeepSeek-7b-Selective-Top10pct
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada.
- Demos o spaces asociados: no disponible en la informacion proporcionada.
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con el modelo. Los unicos enlaces recuperados corresponden a directorios de institutos de secundaria de Brooklyn (publicschoolreview.com, high-schools.com, niche.com, greatschools.org) y no guardan relacion con este repositorio, por lo que no se incluyen.
