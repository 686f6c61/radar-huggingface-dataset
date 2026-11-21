# mradermacher/grok-oss-Cerberus-24B-GGUF

## Resumen

`mradermacher/grok-oss-Cerberus-24B-GGUF` es una coleccion de cuantizaciones GGUF del modelo base `c4tdr0ut/Cerberus-24B`, publicada por el cuantizador habitual mradermacher. El modelo original es un fine-tune de la familia Mistral de aproximadamente 23.570 millones de parametros, afinado mediante QLoRA y posteriormente alineado con ORPO, orientado a conversacion y etiquetado explicitamente como "uncensored". Esta version GGUF no introduce cambios en los pesos mas alla de la cuantizacion: su valor es hacer el modelo desplegable en hardware de consumo mediante llama.cpp y derivados.

La relevancia practica de esta publicacion esta en el formato: ofrece once variantes de cuantizacion estaticas (desde Q2_K de 9,0 GB hasta Q8_0 de 25,2 GB), lo que permite ejecutar un modelo de casi 24B en GPUs de consumo con 12-24 GB de VRAM, con compromisos de calidad explicitamente documentados por el autor. El repositorio ocupa 161,4 GB en total al alojar todas las variantes.

La informacion publicada es escasa: no se detalla la longitud de contexto, la composicion del dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks. La model card se limita a listar los ficheros y a remitir a la documentacion generica de TheBloke para el uso de GGUF. Todo lo que sigue se atiene estrictamente a los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral, segun tags del autor); detalles no disponibles |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | Ingles (tag `en` en la model card); resto no disponible |
| Licencia | "other" (no se especifican terminos concretos) |
| Formato de pesos | GGUF (cuantizado); original en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base `c4tdr0ut/Cerberus-24B` es un fine-tune de un modelo Mistral de ~24B, segun los tags `mistral`, `qlora` y `orpo` de la model card. El proceso declarado combina QLoRA (fine-tuning con cuantizacion de 4 bits) para la adaptacion al dominio conversacional y ORPO (Odds Ratio Preference Optimization) como etapa de alineacion de preferencias, una alternativa a la combinacion SFT + DPO que integra ambas fases en un unico objetivo. El tag `uncensored` indica que el ajuste elimino total o parcialmente los rechazos y filtros de seguridad del modelo base.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la longitud de contexto nativa ni innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). Esta publicacion concreta solo aplica cuantizacion estatica sobre los pesos del modelo base; mradermacher indica que las cuantizaciones ponderadas con imatrix estan en un repositorio separado (`grok-oss-Cerberus-24B-i1-GGUF`), que suelen ofrecer mejor calidad por tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con formato de chat.
- Fine-tuning orientado a dialogo (tags `chat` y `conversational`).
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo base rechazaria.
- Razonamiento, codigo y matematicas: capacidad esperable por el tamano y la familia, pero no documentada ni evaluada en la informacion disponible.
- Tool calling / function calling: no disponible en la documentacion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (14,4 GB) o Q5_K_M (16,9 GB) permite ejecutar un modelo de 23,57B en una RTX 4090 (24 GB) o en una RTX 4080 (16 GB) con offload parcial, usando llama.cpp u Ollama.
- Experimentacion con alineacion ORPO: util para investigadores que quieran comparar el comportamiento de un modelo afinado con ORPO frente a alternativas SFT+DPO del mismo tamano en tareas de dialogo.
- Generacion creativa sin filtros: el caracter "uncensored" lo hace adecuado para escritura de ficcion, roleplay y generacion de contenido que los modelos alineados convencionalmente rechazan, siempre con las cautelas legales y eticas correspondientes.
- Prototipado de asistentes conversacionales en ingles: el formato de chat y el fine-tuning de dialogo permiten montar rapidamente un asistente para pruebas internas sin depender de APIs externas.
- Evaluacion de cuantizaciones: el repositorio ofrece once variantes del mismo modelo, lo que facilita medir la degradacion de perplejidad y calidad entre Q2_K y Q8_0 en un caso concreto.
- Inferencia en CPU o entornos sin GPU dedicada: las variantes Q2_K (9,0 GB) y Q3_K_S (10,5 GB) permiten ejecucion en RAM con llama.cpp, a costa de una perdida de calidad notable.
- Fine-tuning posterior sobre el modelo cuantizado: las variantes de mayor precision (Q8_0, Q6_K) sirven como base para experimentos de adaptacion con LoRA en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, segun variante: Q2_K ~9,0 GB; Q3_K_S ~10,5 GB; Q3_K_M ~11,6 GB; Q3_K_L ~12,5 GB; IQ4_XS ~13,0 GB; Q4_K_S ~13,6 GB; Q4_K_M ~14,4 GB; Q5_K_S ~16,4 GB; Q5_K_M ~16,9 GB; Q6_K ~19,4 GB; Q8_0 ~25,2 GB. Anadir margen para el contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M y Q6_K con contexto moderado; RTX 4080 / 4070 Ti Super (16 GB) para Q4_K_M; RTX 4060 Ti 16 GB para Q4_K_S. Para Q8_0 sin offload se requiere una GPU de 32 GB o superior (A100 40 GB, H100, RTX 5090 si aplica).
- Cabe en GPU de consumo: si, desde Q2_K hasta Q6_K en tarjetas de 12-24 GB, con offload parcial en las variantes mayores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, la variante y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grok-oss-Cerberus-24B-GGUF (este) | 23,57B | no disponible | other | GGUF | Fine-tune Mistral con ORPO, uncensored |
| Mistral Small 24B (referencia de familia) | ~24B | no disponible en esta ficha | Apache 2.0 (segun Mistral) | safetensors, GGUF de terceros | Modelo base comercial de Mistral AI; contexto y benchmarks no verificados aqui |
| c4tdr0ut/Cerberus-24B (modelo original) | 23,57B | no disponible | other | safetensors | Fuente de estas cuantizaciones; misma calidad sin comprimir |
| mradermacher/grok-oss-Cerberus-24B-i1-GGUF | 23,57B | no disponible | other | GGUF (imatrix) | Mismo modelo con cuantizacion ponderada, mejor calidad por tamano |

La comparacion con alternativas de la misma categoria (modelos de ~24B uncensored) no puede completarse con datos verificados en la informacion disponible.

## Limitaciones y advertencias

- La licencia "other" no especifica terminos: es imprescindible consultar la model card del modelo base `c4tdr0ut/Cerberus-24B` antes de cualquier uso comercial. No se garantiza permiso de uso comercial.
- El etiquetado "uncensored" implica que el modelo puede generar contenido que otros modelos rechazan; requiere filtros y politicas de uso propias en produccion.
- Riesgo de alucinacion inherente a los modelos de ~24B sin datos de evaluacion publicados; no hay benchmarks que cuantifiquen su fiabilidad.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La longitud de contexto no esta especificada; asumir contextos largos sin verificacion puede degradar la calidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma significativa; el autor recomienda Q4_K_S o Q4_K_M como equilibrio "rapido y recomendado".
- El repositorio ocupa 161,4 GB; descargar solo la variante necesaria.
- No hay informacion sobre sesgos, datos de entrenamiento ni procedencia del corpus, lo que dificulta auditorias.
- El nombre "grok-oss" en el identificador no implica relacion con xAI; es una denominacion del autor del fine-tune.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/grok-oss-Cerberus-24B-GGUF
- Modelo base: https://huggingface.co/c4tdr0ut/Cerberus-24B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/grok-oss-Cerberus-24B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#grok-oss-Cerberus-24B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
