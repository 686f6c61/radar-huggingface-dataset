# mradermacher/qwen3.5-2b-grpo-bird-GGUF

## Resumen

qwen3.5-2b-grpo-bird-GGUF es la version en formato GGUF del ajuste fino trl-lab/qwen3.5-2b-grpo-bird, un modelo especializado en text-to-SQL construido sobre Qwen3.5-2B de Alibaba Cloud y entrenado con aprendizaje por refuerzo mediante GRPO. La publica mradermacher, un cuantizador conocido en HuggingFace, que se limita a convertir los pesos originales a GGUF; el entrenamiento y el ajuste corresponden al usuario trl-lab. Con 1.942.653.248 parametros (unos 1,94 mil millones) y licencia Apache 2.0, se posiciona como una opcion ligera para generar consultas SQL sobre SQLite, con etiquetas que apuntan explicitamente a uso como agente y a tool calling.

Su relevancia actual es doble. Por un lado, el modelo base Qwen3.5-2B pertenece a la ultima generacion de la familia Qwen y, segun la ficha de LM Studio, integra una base unificada de vision y lenguaje con 262.144 tokens de contexto nativo; por otro, este ajuste concreto aplica GRPO, la misma familia de algoritmos de refuerzo que popularizo DeepSeek, sobre datos de los entornos BIRD y SQALE, dos referencias habituales en la evaluacion de text-to-SQL y de agentes SQL.

El resultado es un modelo pequeno (entre 1,1 y 4,0 GB segun cuantizacion) que puede ejecutarse en portatiles y GPUs de gama de entrada mediante llama.cpp, Ollama o LM Studio. Ahora bien, la model card publicada es unicamente la plantilla automatica del cuantizador: no incluye detalles del entrenamiento, ni resultados de benchmarks, ni ejemplos de uso, y el repositorio acumula cero descargas y cero likes, por lo que se trata de una publicacion muy reciente y sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); la model card no detalla la arquitectura concreta |
| Parametros totales | 1.942.653.248 (~1,94 mil millones, dato de safetensors) |
| Parametros activos | No aplica: es un modelo denso, no MoE |
| Longitud de contexto | No especificada en la model card; el Qwen3.5-2B base se anuncia con 262.144 tokens nativos segun LM Studio |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; el modelo original (trl-lab/qwen3.5-2b-grpo-bird) se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso de 2B parametros de la serie Qwen3.5 de Alibaba Cloud. Segun las fichas de terceros consultadas, esta generacion se presenta como un modelo multilingue con razonamiento y seguimiento de instrucciones mejorados respecto a Qwen3, y LM Studio describe el 2B como parte de una base unificada de vision y lenguaje. La model card de esta cuantizacion no aporta ningun detalle adicional sobre la arquitectura interna, el numero de capas, el tipo de atencion ni el tokenizador. La presencia de archivos auxiliares mmproj (0,5 GB en Q8_0 y 0,8 GB en f16) sugiere que el modelo base incorpora componentes multimodales, aunque ni el cuantizador ni el autor del ajuste documentan que capacidad visual se conserva tras el entrenamiento con refuerzo.

En cuanto al entrenamiento, lo unico documentado son las etiquetas del repositorio: reinforcement-learning, grpo, text-to-sql, sql, sqlite, agent, tool-use, bird y sqale. Esto indica que el ajuste se hizo con GRPO (Group Relative Policy Optimization) sobre datos derivados del benchmark BIRD y del entorno SQALE, orientados a la generacion de SQL y a la interaccion de tipo agente con bases de datos. No hay informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, las fases de RLHF o DPO, el uso de decodificacion especulativa ni ninguna innovacion tecnica mas alla del propio algoritmo GRPO. No se especifica tampoco si el ajuste afecto a las capas multimodales del modelo base.

## Capacidades

- Generacion de consultas SQL (text-to-SQL) a partir de lenguaje natural en ingles, con dialecto SQLite segun las etiquetas del repositorio.
- Tool calling y function calling, indicado por la etiqueta tool-use.
- Comportamiento agentico: la etiqueta agent y la referencia al entorno SQALE apuntan a razonamiento multi-paso con ejecucion de consultas y posible correccion de errores.
- Aprendizaje por refuerzo aplicado a la tarea, lo que sugiere optimizacion de la recompensa ligada a la correccion de la consulta generada.
- Capacidad multilingue: las etiquetas solo declaran ingles (en).
- Posible capacidad de vision heredada del modelo base, dado que el repositorio incluye archivos mmproj; no confirmada ni documentada.
- No se documenta modo de pensamiento (thinking mode), audio, ni generacion de codigo general mas alla del SQL.

## Casos de uso

- Asistente de analitica para aplicaciones internas: dado un esquema SQLite y una pregunta en lenguaje natural, el modelo genera la consulta correspondiente que la aplicacion ejecuta contra la base de datos.
- Agente SQL autonomo: integrado en un bucle de ejecucion que lanza la consulta, lee el error o el resultado y reformula, aprovechando la etiqueta de agente y el entrenamiento sobre SQALE.
- Busqueda de datos en herramientas self-service: usuarios de negocio sin conocimientos de SQL formulan preguntas y el modelo traduce a consultas sobre un esquema conocido.
- Despliegue on-device o en el navegador: con la cuantizacion Q4_K_M (1,4 GB) el modelo cabe en un portatil modesto y permite analitica local sin enviar datos a la nube.
- Pipelines de ETL y generacion de vistas: a partir de descripciones textuales de las transformaciones, el modelo produce las consultas de creacion o seleccion necesarias.
- Evaluacion comparativa de pipelines text-to-SQL: sirve como baseline ligero y reproducible en local frente a modelos mayores que consumen mas recursos.
- Formacion y soporte a desarrolladores: generacion de consultas comentadas que un ingeniero junior puede revisar y adaptar antes de incorporarlas a produccion.
- Prototipado rapido en llama.cpp, Ollama o LM Studio: validar una idea de producto basada en SQL generado sin coste de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye ninguna tabla de metricas (ni BIRD, ni Spider, ni SQALE Execution Accuracy, ni MMLU, HumanEval o GSM8K), y el repositorio no enlaza a un informe de evaluacion del ajuste. Tampoco se han publicado datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamano de cada cuantizacion: f16 4,0 GB; Q8_0 2,2 GB; Q6_K 1,7 GB; Q5_K_M 1,6 GB; Q5_K_S 1,5 GB; Q4_K_M 1,4 GB; Q4_K_S e IQ4_XS 1,3 GB; Q3_K_L 1,3 GB; Q3_K_M 1,2 GB; Q2_K y Q3_K_S 1,1 GB. Hay que sumar el espacio de la cache KV, que depende del contexto configurado.
- Si se usan las capacidades multimodales, hay que anadir el archivo mmproj: 0,5 GB en Q8_0 o 0,8 GB en f16.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM: RTX 3050, RTX 4060, RTX 3060, GTX 1650, e incluso en CPU o en equipos Apple Silicon con memoria unificada.
- GPU de datacenter (A100, H100, A10G) no son necesarias para una sola instancia; solo tendrian sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores basados en GGUF; el modelo original en safetensors puede servirse con transformers, vLLM o TGI, aunque para este formato cuantizado lo habitual es llama.cpp.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| mradermacher/qwen3.5-2b-grpo-bird-GGUF (este) | 1,94B | No especificado en la model card | Text-to-SQL con GRPO sobre BIRD y SQALE | Apache 2.0 | GGUF |
| trl-lab/qwen3.5-2b-grpo-bird | 1,94B | No especificado | Mismo ajuste, sin cuantizar | Apache 2.0 | Safetensors |
| Qwen3.5-2B (Alibaba Cloud, base) | 2B | 262.144 tokens nativos segun LM Studio | Modelo generalista multilingue y multimodal | No disponible | No disponible |
| mradermacher/Qwen3.5-2B-GGUF | 2B | 4.096 tokens segun un agregador de terceros; 262.144 segun LM Studio | Cuantizacion del modelo base, sin ajuste para SQL | Apache 2.0 | GGUF |

No hay datos de benchmarks que permitan comparar la calidad de este ajuste frente a otras alternativas de text-to-SQL, ni frente al propio Qwen3.5-2B base; por tanto, la comparativa se limita a parametros, formato y licencia. Cualquier comparacion de rendimiento adicional queda como no disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks del ajuste: no hay evidencia publica de su precision en BIRD, SQALE u otros conjuntos de evaluacion.
- El repositorio registra cero descargas y cero likes, y fue creado en octubre de 2026, por lo que no ha sido validado por la comunidad.
- Solo se declara soporte de ingles; el uso en castellano no esta documentado y previsiblemente degradara la calidad.
- El dialecto objetivo es SQLite; la transferencia a PostgreSQL, MySQL, SQL Server u otros motores no esta garantizada.
- Riesgo de alucinacion de tablas, columnas o funciones inexistentes: en produccion conviene validar la sintaxis y, preferiblemente, ejecutar la consulta en un entorno restringido antes de devolverla al usuario.
- No hay informacion sobre sesgos, datos de entrenamiento ni posibles contaminaciones entre los conjuntos de entrenamiento y de evaluacion de BIRD o SQALE.
- La longitud de contexto real no esta documentada para este ajuste y las fuentes de terceros discrepan (4.096 tokens en un agregador frente a 262.144 tokens nativos anunciados para el modelo base); conviene medirla empiricamente antes de disenar prompts con esquemas grandes.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias ni soporte por parte del autor del ajuste ni del cuantizador.
- El uso de archivos mmproj sin documentacion puede producir comportamientos inesperados; si no se necesita vision, es preferible desplegar solo el archivo GGUF principal.
- Las cuantizaciones por debajo de Q4 (Q2_K, Q3_K) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/qwen3.5-2b-grpo-bird-GGUF
- Modelo base del ajuste: https://huggingface.co/trl-lab/qwen3.5-2b-grpo-bird
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#qwen3.5-2b-grpo-bird-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Cuantizacion del modelo base Qwen3.5-2B: https://huggingface.co/mradermacher/Qwen3.5-2B-GGUF
- Ficha de Qwen3.5-2B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-2b
- Ficha de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Guia de uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
