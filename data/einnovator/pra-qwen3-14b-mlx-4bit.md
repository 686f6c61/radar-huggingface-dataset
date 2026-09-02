# EInnovator/pra-qwen3-14b-mlx-4bit

## Resumen

Este repositorio contiene un adaptador estructural de Progressive Retrieval Attention (PRA) para el modelo base `mlx-community/Qwen3-14B-4bit`, desarrollado por EInnovator. PRA es una técnica que permite seleccionar el contexto relevante de forma progresiva durante la generación, mejorando la capacidad del modelo para manejar secuencias largas sin necesidad de reentrenar los pesos del modelo base. El adaptador incluye componentes estructurales, routers aprendidos opcionales, perfiles de ejecución y metadatos de compatibilidad, pero no duplica los pesos del modelo base.

El problema que resuelve es el coste computacional y la degradación de calidad que sufren los modelos de lenguaje al procesar contextos muy largos. En lugar de atender a todos los tokens por igual, PRA selecciona dinámicamente qué partes del contexto son relevantes, reduciendo la carga de atención y mejorando la precisión en tareas de recuperación y respuesta a preguntas sobre documentos extensos. Su relevancia actual radica en que permite extender el uso práctico de modelos como Qwen3-14B en escenarios de contexto largo sobre hardware local, especialmente en Apple Silicon mediante el framework MLX.

La arquitectura combina el modelo base Qwen3ForCausalLM de 14.000 millones de parámetros en cuantización 4-bit con un adaptador estructural que añade routing de atención. El adaptador incluye un router aprendido de 1.310.720 parámetros, entrenado sobre los datasets QASPER y HotpotQA. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (modelo base) + adaptador estructural PRA |
| Parametros totales | Modelo base: 14B; adaptador: 1.310.720 (router aprendido) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en el bundle; el modelo base Qwen3-14B soporta hasta 40.000 tokens segun fuentes externas |
| Tipos de cuantizacion | 4-bit (modelo base MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio contiene adaptadores estructurales y routers, no pesos del modelo base) |

## Arquitectura y entrenamiento

El adaptador PRA implementa un mecanismo de atencion con recuperacion progresiva. En lugar de procesar todo el contexto con atencion completa, PRA utiliza un router que selecciona dinamicamente los tokens o segmentos mas relevantes en funcion de la consulta actual. El bundle incluye dos componentes: un adaptador estructural validado (`structural_adapter`) y un router aprendido (`combined-router-d128`) entrenado con el metodo multi-positive softmax. El router tiene 1.310.720 parametros y se entreno sobre 48 ejemplos de QASPER y HotpotQA, con 16 ejemplos de validacion y 32 de test retenido. Se probaron cinco semillas (11, 23, 37, 53, 71) y se selecciono la configuracion con mejor AUC0-30 combinado en validacion.

El entrenamiento se realizo sobre el modelo base `mlx-community/Qwen3-14B-4bit` en su revision inmutable `a4d9b2df59d2c150bef02fcbe0d91046b7ca33a4`. No se emplearon tecnicas de RLHF ni DPO; el adaptador se entrena de forma supervisada para optimizar la seleccion de contexto. La libreria PRA (version 0.2.0rc1) gestiona el bundle, los perfiles de ejecucion y la compatibilidad con motores de inferencia como MLX y Hugging Face.

## Capacidades

- Seleccion de contexto relevante en secuencias largas mediante routing de atencion progresiva.
- Mejora de la recuperacion de informacion en tareas de respuesta a preguntas sobre documentos extensos, como papers cientificos (QASPER) y preguntas multi-hop (HotpotQA).
- Soporte de perfiles de ejecucion configurables: `reference` (comprobaciones estructurales sin entrenamiento), `balanced` (perfil portable por defecto con routing coseno generico) y `qasper-learned` (routing aprendido optimizado para QASPER).
- Compatibilidad con el motor MLX para ejecucion en Apple Silicon, y con Hugging Face para uso portable (aunque sin mediciones de memoria nativa en este ultimo).
- Capacidad de evaluacion local mediante la herramienta de linea de comandos `pra evaluate`, que permite medir metricas de calidad en el hardware del usuario.
- Integracion con el modelo base Qwen3-14B-4bit, que incluye modo thinking para razonamiento complejo, generacion de codigo y capacidades multilingues (heredadas del modelo base).

## Casos de uso

- Respuesta a preguntas sobre articulos cientificos: el adaptador esta cualificado para QASPER, un dataset de preguntas sobre papers de investigacion. Un investigador puede cargar un documento largo y obtener respuestas precisas a preguntas especificas, gracias a la seleccion de contexto relevante que reduce el ruido de tokens irrelevantes.
- Recuperacion de informacion multi-hop: en tareas como HotpotQA, donde la respuesta requiere combinar informacion de multiples pasajes, el routing aprendido o generico ayuda a identificar los fragmentos mas relevantes, mejorando la precision en comparacion con la atencion completa.
- Asistentes de lectura de contratos o documentos legales: el adaptador permite procesar documentos extensos (decenas de miles de tokens) en hardware local, seleccionando las clausulas relevantes para responder a consultas especificas sin agotar la ventana de contexto.
- Analisis de transcripciones de reuniones o entrevistas: con contextos largos, PRA puede focalizar la atencion en las partes de la conversacion que responden a una pregunta concreta, mejorando la utilidad en herramientas de busqueda interna.
- Generacion de resumenes selectivos: en lugar de resumir todo el documento, el modelo puede generar resumenes orientados a un tema especifico seleccionando los segmentos relevantes mediante el adaptador.
- Evaluacion y validacion de sistemas RAG: el bundle incluye herramientas de evaluacion (`pra evaluate`) que permiten medir la calidad de recuperacion en el hardware propio, util para equipos que desarrollan pipelines de generacion aumentada por recuperacion y necesitan comparar estrategias de seleccion de contexto.

## Benchmarks y rendimiento

La model card proporciona metricas de recuperacion (R@20%) medidas en un Apple M4 Pro con 48 GB de RAM, utilizando MLX-LM 0.31.3. Se evaluaron dos modos de routing: coseno generico y routing asimetrico aprendido.

| Workload | Modo de routing | R@20% |
|---|---|---|
| QASPER (n=16) | Coseno generico | 0.3182 |
| QASPER (n=16) | Routing aprendido asimetrico | 0.6787 |
| HotpotQA (n=16) | Coseno generico | 0.4942 |
| HotpotQA (n=16) | Routing aprendido asimetrico | 0.3144 |
| Combined (n=32) | Coseno generico | 0.4062 |
| Combined (n=32) | Routing aprendido asimetrico | 0.4966 |

No se han publicado resultados de benchmarks de generacion de texto, codigo o razonamiento en la informacion disponible. Estas metricas son mediciones de cualificacion sobre un numero reducido de ejemplos (16 o 32) y no deben interpretarse como rendimiento garantizado en produccion.

## Requisitos de hardware

- El bundle es un adaptador sin pesos, por lo que los requisitos de hardware son los del modelo base `mlx-community/Qwen3-14B-4bit`.
- Segun fuentes externas, el modelo base en cuantizacion 4-bit requiere aproximadamente 7,9 GB de VRAM, lo que permite su ejecucion en GPUs de consumo como la RTX 4090 (24 GB) o en Apple Silicon con al menos 8 GB de memoria unificada.
- Las mediciones de la model card se realizaron en Apple M4 Pro con 48 GB de RAM, lo que sugiere que el adaptador esta optimizado para el framework MLX en hardware Apple.
- Para despliegue en Apple Silicon, se recomienda usar el motor MLX (via `mlx-lm` o `pra serve`). Para otros entornos, se puede usar Hugging Face con la libreria `pra-hf`, aunque la memoria nativa no esta medida en ese caso.
- No se dispone de datos de latencia ni throughput en la informacion disponible; los valores aparecen como NOT_MEASURED en la model card.
- El adaptador requiere la instalacion del paquete `pra-hf[hf-hub,hf-runtime]` y la ejecucion de `pra doctor` para verificar la compatibilidad.

## Comparativa con modelos similares

No se dispone de datos publicados que comparen este adaptador PRA con otras soluciones de contexto largo sobre el mismo modelo base. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-14B (base) | 14B | 40K | Apache-2.0 | Hugging Face |
| Qwen3-14B-MLX-4bit (base cuantizado) | 14B | 40K | Apache-2.0 | Hugging Face |
| EInnovator/pra-qwen3-14b-mlx-4bit (adaptador) | 14B + 1,3M (router) | No especificado | Apache-2.0 | Hugging Face |

El adaptador no modifica la arquitectura del modelo base, por lo que su comparativa directa se limita a la mejora en tareas de recuperacion de contexto. No se han encontrado adaptadores equivalentes de PRA para otros modelos en la informacion disponible.

## Limitaciones y advertencias

- El router aprendido mejora significativamente QASPER (R@20% de 0.3182 a 0.6787), pero degrada HotpotQA (de 0.4942 a 0.3144). Por ello, el perfil `qasper-learned` es opt-in y no es el default del bundle.
- Las metricas de cualificacion se basan en solo 16 ejemplos retenidos por dataset, lo que no establece calidad de generacion ni economia de servicio en produccion.
- La identidad de cualificacion es especifica de la cuantizacion 4-bit MLX del modelo base y de su revision exacta. No se transfiere automaticamente a pesos en precision completa de Hugging Face ni a otras cuantizaciones.
- No se han medido latencia, throughput ni uso de memoria nativa en el motor Hugging Face; solo se recomienda el uso de Selected Context en ese entorno.
- El adaptador no incluye los pesos del modelo base; es necesario descargar e integrar el modelo base por separado.
- La licencia Apache-2.0 se aplica al adaptador, pero las licencias del modelo base y de los datasets (QASPER, HotpotQA) se aplican por separado al router y a los artefactos asociados.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma del adaptador; estas dependen del modelo base Qwen3-14B.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EInnovator/pra-qwen3-14b-mlx-4bit
- Documentacion de PRA: https://einnovator.github.io/pdattention/
- Repositorio fuente: https://github.com/einnovator/pdattention
- Issues: https://github.com/einnovator/pdattention/issues
- Modelo base: https://huggingface.co/mlx-community/Qwen3-14B-4bit
- Modelo Qwen3-14B original: https://huggingface.co/Qwen/Qwen3-14B
