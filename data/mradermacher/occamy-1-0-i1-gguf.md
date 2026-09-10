# mradermacher/occamy-1.0-i1-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo occamy-1.0, publicado originalmente por Accio-Lab y convertido por mradermacher. No se trata por tanto de un modelo entrenado desde cero, sino de una distribucion de pesos ya cuantizados, generada con el pipeline habitual de mradermacher (etiqueta interna `nicoboss`, `quantize_version: 2`, `convert_type: hf`) y construida con matrices de importancia (imatrix), lo que suele traducirse en una perdida de calidad menor que las cuantizaciones ciegas equivalentes.

El dato mas solido disponible es el recuento de parametros del modelo base en safetensors: 34.660.610.688 parametros, es decir, en torno a 34,7 mil millones. Es una escala intermedia-alta dentro de los LLM abiertos, pensada para despliegue en una sola GPU de 24-48 GB o en configuraciones de doble GPU cuando se usan cuantizaciones de 4 bits o superiores. El repositorio ocupa 48,5 GB en total, lo que confirma que incluye multiples variantes de cuantizacion con distintos tamanos.

La relevancia de este repositorio es practica: permite ejecutar occamy-1.0 en hardware de consumo o en servidores modestos mediante llama.cpp, Ollama u otros runners compatibles con GGUF, sin necesidad de disponer de los pesos originales en precision completa. La ficha tecnica esta limitada por la ausencia de model card detallada: no se declaran licencia, idiomas, arquitectura interna ni resultados de benchmarks, por lo que cualquier evaluacion de calidad debe hacerse sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 34.660.610.688 (34,7 B, dato de safetensors del modelo base) |
| Parametros activos | no aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, small-IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (24 variantes, todas con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones; el modelo base usa safetensors) |
| Tamano del repositorio | 48,5 GB |
| Fecha de creacion | 2026-09-10 (segun metadatos de HuggingFace) |
| Fecha de actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna de occamy-1.0 en la informacion proporcionada: ni la model card del repositorio GGUF ni los metadatos de HuggingFace indican si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con atencion lineal/SSM o cualquier otra variante. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO.

Lo unico verificable tecnicamente es el proceso de cuantizacion. El repositorio es una conversion a GGUF del modelo `Accio-Lab/occamy-1.0`, con `convert_type: hf` y `quantize_version: 2`, que cubre desde cuantizaciones extremas de 1-2 bits (IQ1_S, IQ1_M, IQ2_XXS) hasta Q6_K. El uso de imatrix implica que los errores de cuantizacion se ponderan por la importancia de cada peso, estimada a partir de estadisticas de activacion; en la practica esto mejora la fidelidad de las variantes de baja precision (Q2, Q3, IQ2, IQ3) frente a cuantizaciones sin calibracion, aunque no elimina la degradacion en los niveles mas agresivos.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo base esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el artefacto puede servirse a traves de infraestructura de inferencia estandar (por ejemplo, endpoints compatibles con OpenAI en HuggingFace o servidores GGUF).
- Razonamiento, codigo, matematicas, vision o audio: no disponible; no se declara ninguna capacidad especifica en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo de razonamiento explicito (thinking) u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional: al ser un GGUF de ~34,7 B, puede ejecutarse con llama.cpp u Ollama en una estacion de trabajo con GPU de 24 GB usando cuantizaciones Q4_K_M o inferiores, lo que permite mantener un chatbot privado sin enviar datos a APIs externas.
- Prototipado y evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes del mismo modelo, lo que permite medir en un mismo banco de pruebas como afecta cada nivel de compresion (de IQ1_S a Q6_K) a la coherencia y a la tasa de respuestas validas.
- Generacion aumentada por recuperacion (RAG) sobre documentacion interna: el modelo puede actuar como generador final en un pipeline que recupere fragmentos de una base vectorial; conviene validar primero su ventana de contexto real, ya que no esta declarada.
- Atencion al cliente en despliegues con recursos limitados: la orientacion conversacional y la compatibilidad con endpoints lo hacen apto para servir respuestas en un backend propio; el limite practico sera el throughput por GPU disponible.
- Experimentacion academica con modelos de ~35 B en cuantizacion de 4 bits: util para estudios sobre degradacion por cuantizacion o sobre el impacto de imatrix, comparando las variantes Q4_K_M frente a Q4_0/Q4_1 sin calibracion.
- Servicio de inferencia autoalojado en un cluster pequeno: con vLLM u otro servidor compatible con GGUF (sujeto a soporte de la arquitectura concreta) se puede exponer una API interna para equipos de desarrollo que necesiten un modelo intermedio sin coste por token.
- Filtrado y resumen de texto en lote: procesamiento offline de documentos largos divididos en trozos, con la variante Q5_K_M o Q6_K si la precision es prioritaria sobre el coste de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos consultados incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del recuento de parametros (34,7 B) y del numero de bits por peso de cada tipo de cuantizacion; no proceden de mediciones publicadas por el autor.

- VRAM aproximada para inferencia, solo pesos: IQ1_S/IQ2_XXS en torno a 9-11 GB; IQ2_M/Q2_K alrededor de 12-13 GB; IQ3_XS/IQ3_S en torno a 14-15 GB; Q3_K_M aproximadamente 16-17 GB; IQ4_XS/Q4_K_S cerca de 18-19 GB; Q4_K_M en torno a 20-21 GB; Q5_K_M alrededor de 24-25 GB; Q6_K cerca de 28-29 GB.
- Margen adicional: hay que sumar el coste del contexto KV cache, que crece con la longitud de secuencia y depende del numero de capas y cabezas del modelo (dato no disponible). En la practica conviene reservar entre 1 y 4 GB extra segun la longitud de contexto configurada.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M o inferiores con contexto moderado; A6000, L40S o RTX 6000 Ada (48 GB) para Q5_K_M y Q6_K con contexto amplio; A100 40/80 GB o H100 para servir varias peticiones concurrentes o precision superior.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizaciones de 4 bits o menos; en tarjetas de 16 GB solo caben las variantes de 2-3 bits (IQ2, IQ3_XS), con degradacion esperada de calidad. Las variantes de 1 bit (IQ1_S, IQ1_M) son para escenarios de memoria muy restringida y su calidad suele ser muy inferior.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; tambien servidores de inferencia con soporte GGUF si admiten la arquitectura subyacente. El despliegue con vLLM o TGI requiere que exista soporte para la arquitectura del modelo base, extremo no confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada (ni arquitectura, ni contexto, ni licencia, ni benchmarks del modelo base). La comparacion se limita a los dos artefactos conocidos:

| Artefacto | Parametros | Formato | Tamano | Licencia | Observaciones |
|---|---|---|---|---|---|
| Accio-Lab/occamy-1.0 (base) | 34,7 B | safetensors | no disponible | no disponible | Modelo original; sin model card detallada en la informacion disponible |
| mradermacher/occamy-1.0-i1-GGUF | 34,7 B | GGUF | 48,5 GB (repo completo, 24 cuantizaciones) | no disponible | Cuantizaciones con imatrix, desde 1 a 6 bits |
| Otras cuantizaciones GGUF de modelos de ~30-35 B | no disponible | GGUF | no disponible | no disponible | No se han consultado datos verificables en esta busqueda |

## Limitaciones y advertencias

- Licencia no declarada: al no indicarse licencia ni en el repositorio de cuantizacion ni, segun la informacion disponible, en el modelo base, no hay base clara para uso comercial. Es imprescindible comprobar la licencia de `Accio-Lab/occamy-1.0` antes de cualquier despliegue productivo.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual ni de tasas de alucinacion; debe asumirse el comportamiento tipico de un LLM de su escala y validar las salidas en dominios criticos.
- Idioma y cobertura linguistica desconocidos: no se declara lista de idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.
- Longitud de contexto desconocida: sin ese dato no se puede planificar el uso en tareas de contexto largo ni dimensionar correctamente la memoria del KV cache.
- Degradacion por cuantizacion: las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS comprimen muy agresivamente; aunque el uso de imatrix reduce el dano, la perdida de calidad en tareas de razonamiento o codigo puede ser sustancial. Para produccion se recomienda Q4_K_M o superior.
- Sesgos: no hay documentacion sobre el dataset de entrenamiento ni sobre analisis de sesgos.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026-09-10) aparecen en el futuro respecto a la fecha habitual de consulta, lo que sugiere un posible error de metadatos o de reloj en el entorno de publicacion; conviene no basar decisiones de versionado en esas fechas.
- Popularidad nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre la calidad de las cuantizaciones.
- Sin garantias del cuantizador: mradermacher actua solo como conversor de pesos; no respalda el comportamiento del modelo ni ofrece soporte.
- Los resultados de la busqueda web realizada no contenian informacion tecnica relevante sobre el modelo; no se han podido verificar datos externos.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/occamy-1.0-i1-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Paper, blog o demo oficial: no disponible
- Repositorio de codigo: no disponible
- Otra documentacion relevante: la busqueda web no devolvio resultados utiles sobre este modelo; no hay enlaces adicionales que aportar.
