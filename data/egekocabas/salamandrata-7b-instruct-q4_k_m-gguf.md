# egekocabas/salamandraTA-7b-instruct-Q4_K_M-GGUF

## Resumen

SalamandraTA-7b-instruct es un modelo de traduccion automatica multilingue desarrollado por BSC-LT (Barcelona Supercomputing Center, unidad de Lengua y Tecnologia), dentro del contexto del proyecto ILENIA. Esta version concreta, publicada por egekocabas, es una conversion a formato GGUF del modelo original, cuantizada con Q4_K_M y con *importance matrix* (imatrix), lo que permite ejecutarla de forma local con llama.cpp u otros runtimes compatibles sin depender de APIs remotas.

El modelo tiene 7.768.117.248 parametros (aproximadamente 7.770 millones), un tamano habitual en la categoria de modelos de 7B. Su pipeline principal es la traduccion, con cobertura de 42 idiomas que incluyen la mayoria de lenguas europeas (espanol, catalan, gallego, euskera, portugues, frances, aleman, italiano, etc.), asi como arabe, japones, hindi, coreano, chino e islandes. Al estar cuantizado en Q4_K_M, el repositorio ocupa 4,9 GB, lo que lo hace viable en GPUs de consumo.

Al ser un modelo instructivo y conversacional, no solo traduce, sino que puede seguir indicaciones sobre el formato o el tono de la salida. Es relevante para desarrolladores e investigadores que necesitan un modelo de traduccion modificable (licencia GPL-3.0) y desplegable en entornos locales, privados o sin conexion a internet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en la biblioteca transformers). Detalles especificos de arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 7.768.117.248 |
| Parametros activos | No disponible (la informacion no indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imat). En la version oficial de BSC existen ademas Q8_0 y Q3_K_M |
| Idiomas soportados | bg, ca, cs, cy, da, de, el, en, es, et, eu, fi, fr, ga, gl, hr, hu, it, lt, lv, mt, nl, nb, no, oc, pl, pt, ro, ru, sl, sk, sr, sv, uk, ast, an, ar, ja, hi, ko, zh, is (42 idiomas) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors FP16) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base, el numero de capas, las dimensiones de atencion ni la composicion del dataset de entrenamiento. Se sabe que esta construido con la biblioteca transformers, que pertenece a la familia Salamandra de BSC-LT y que su pipeline de tarea es traduccion (pipeline_tag: translation). El modelo es una version instructiva, lo que sugiere un proceso de alineamiento posterior al preentrenamiento, aunque no se especifica si se empleo RLHF, DPO u otra tecnica.

La conversion a GGUF se realizo con llama.cpp a traves del espacio GGUF-my-repo, aplicando cuantizacion Q4_K_M con imatrix (importance matrix). El uso de imatrix es una mejora tecnica que reduce la perdida de precision al cuantizar, especialmente en tareas que requieren mantener la fidelidad semantica, como la traduccion.

## Capacidades

- Traduccion automatica entre 42 idiomas, incluidos los idiomas cooficiales de Espana (asturiano, aragones, catalan, gallego, euskera) y lenguas europeas de alto y bajo recurso.
- Modo instructivo: permite formatear la salida segun instrucciones, por ejemplo, especificando el registro, el tono o el formato de la traduccion.
- Caracter conversacional: puede mantener dialogos y contextos de traduccion multi-turno.
- Compatible con el ecosistema GGUF: se puede ejecutar con llama.cpp, llama-server, Ollama, LM Studio y herramientas similares.
- Compatible con endpoints (etiqueta endpoints_compatible), lo que facilita su integracion en servicios de inferencia.
- Soporte de precision mixta para traduccion de documentos extensos en entornos locales.

## Casos de uso

- Traduccion de documentos confidenciales en entornos privados: el modelo se despliega en local con llama.cpp u Ollama, evitando enviar informacion sensible a APIs externas. Adecuado para bufetes, centros de investigacion o empresas con requisitos de privacidad.
- Localizacion de software y contenido: al soportar 42 idiomas, permite traducir automaticamente cadenas de interfaz de usuario, documentacion tecnica y casos de prueba en pipelines de integracion continua.
- Traduccion de comunicaciones internas en empresas multinacionales: el modo instructivo permite indicar el formato de salida (correo, memoria, comunicado) y mantener la coherencia terminologica entre departamentos.
- Chatbots multilingues de atencion al cliente: gracias a la capacidad conversacional e instructiva, puede atender consultas en el idioma del usuario y traducir mensajes al idioma del agente de soporte en tiempo real.
- Analisis de texto en idiomas minoritarios: el modelo cubre asturiano, aragones, gallegos y otras lenguas con pocos recursos, lo que lo hace util para extraer entidades, clasificar sentimiento y normalizar textos en estos idiomas mediante prompting o ajuste fino.
- Investigacion en traduccion automatica: su tamano de 7B y su licencia GPL-3.0 permiten experimentos academicos, comparaciones entre cuantizaciones y estudios de calidad en traduccion para pares de idiomas escasamente representados.
- Generacion de contenido de marketing multilingue: el modelo puede traducir y adaptar creatividades publicitarias a distintos mercados, manteniendo el mensaje original y ajustando el tono segun el publico destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,9 GB, por lo que con margen para el contexto y los logits se recomiendan entre 8 y 10 GB de VRAM para una ejecucion fluida en GPU.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB), Tesla T4 (16 GB) para despliegues ligeros, y A100/H100 para produccion con mayor concurrencia.
- Compatible con GPUs de consumo: si, es viable en tarjetas con 8 GB de VRAM si se usan contextos moderados. Con 12 GB o mas se puede trabajar con contextos mas largos.
- Opciones de despliegue: llama.cpp (CLI y servidor llama-server, tal como indica el model card), Ollama, LM Studio y cualquier runtime compatible con GGUF. Para usar la version original sin cuantizar, se puede cargar con transformers desde BSC-LT/salamandraTA-7b-instruct.
- Latencia y throughput: no disponible. No se han publicado datos de tokens por segundo ni comparativas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Formato | Tamano repo |
|---|---|---|---|---|---|
| egekocabas/salamandraTA-7b-instruct-Q4_K_M-GGUF (este modelo) | 7.768.117.248 | Q4_K_M (imat) | GPL-3.0 | GGUF | 4,9 GB |
| BSC-LT/salamandraTA-7b-instruct (original) | 7.768.117.248 | Sin cuantizar (FP16) | GPL-3.0 | safetensors | No disponible |
| BSC-LT/salamandraTA-7B-instruct-GGUF (version oficial) | 7.768.117.248 | Q4_K_M, Q8_0, Q3_K_M | GPL-3.0 | GGUF | No disponible |

Los tres modelos comparten los mismos parametros y licencia; la diferencia principal radica en el formato y la cuantizacion. Esta version de egekocabas incluye imatrix, una tecnica que puede mejorar la calidad de la cuantizacion Q4_K_M en comparacion con una cuantizacion estandar. Para elegir entre ellas, hay que valorar el compromiso entre tamano del modelo (Q3_K_M es mas ligero) y fidelidad de la traduccion (Q8_0 es mas preciso).

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgos en la informacion disponible. Al estar entrenado en corpus multilingues, puede heredar sesgos linguisticos y culturales presentes en los datos.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad. En tareas de traduccion, el modelo puede producir parafraseos o cambios de sentido que conviene revisar manualmente.
- Limitaciones de contexto: la longitud de contexto no esta especificada. Se recomienda validar el comportamiento del modelo en documentos extensos antes de usarlo en produccion.
- Restricciones de licencia: la licencia GPL-3.0 implica copyleft; cualquier obra derivada que se distribuya debe hacerlo bajo la misma licencia. Es necesario evaluar el impacto en proyectos comerciales antes de su integracion.
- Calidad variable por idioma: la cobertura de 42 idiomas no garantiza un rendimiento uniforme. Es posible que lenguas con menos representacion en el corpus (como asturiano o aragones) produzcan traducciones de menor calidad que lenguas mayoritarias.
- Perdida por cuantizacion: Q4_K_M reduce la precision frente a FP16 o Q8_0. En tareas de traduccion con matices o terminologia especializada, puede haber una degradacion perceptible de la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/egekocabas/salamandraTA-7b-instruct-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/BSC-LT/salamandraTA-7b-instruct
- Version GGUF oficial de BSC-LT: https://huggingface.co/BSC-LT/salamandraTA-7B-instruct-GGUF
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Ficha de la version GGUF en el Proyecto ILENIA: https://proyectoilenia.es/en/recurso/salamandra-ta-7b-instruct-gguf/
- Cuantizacion alternativa de RichardErkhov: https://graysoft.dev/models/richarderkhov-salamandra-7b-instruct-q4-k-m
