# mradermacher/K2-Horizon-7B-GMCE-i1-GGUF

## Resumen

K2-Horizon-7B-GMCE-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo emperorofrome/K2-Horizon-7B-GMCE, publicada por mradermacher, un autor conocido por generar versiones cuantizadas de modelos abiertos con la herramienta de llama.cpp. El modelo base se distribuye con licencia Apache 2.0, está etiquetado para inglés y orientado a código y eficiencia, y en sus safetensors declara 8.999.178.240 parámetros totales, es decir, cerca de 9.000 millones, aunque el nombre comercial lo presente como "7B".

El interés práctico de esta ficha no está en el modelo original, del que apenas hay documentación publicada, sino en el conjunto de cuantizaciones "i1" generadas a partir de un fichero imatrix: 24 variantes que van desde 2,6 GB (IQ1_S) hasta 7,5 GB (Q6_K), lo que permite ejecutar el modelo en GPUs de consumo desde 8 GB de VRAM e incluso en configuraciones más ajustadas con cuantizaciones de 2-3 bits. El repositorio completo ocupa 108,7 GB porque incluye todas las variantes.

La información disponible es muy limitada: la model card solo documenta el proceso de cuantización, los enlaces de descarga y los tipos de quant. No se publican datos de arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluación de calidad debe hacerse por prueba directa. Además, el modelo tiene un historial de adopción nulo (0 descargas y 0 me gusta en el momento de la consulta), lo que implica ausencia de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la detalla; el proceso de conversion es de tipo HF/transformers) |
| Parametros totales | 8.999.178.240 (~9B, segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix de 0,1 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors; static quants en repositorio aparte) |
| Metodo de cuantizacion | imatrix / weighted quants, quantize_version 2, output_tensor_quantised 1 |
| Tamano del repositorio | 108,7 GB (todas las variantes) |
| Rango de tamano de quant | 2,6 GB (IQ1_S) a 7,5 GB (Q6_K) |
| Modelo base | emperorofrome/K2-Horizon-7B-GMCE |
| Fecha de creacion | 2026-10-20 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card del repositorio cuantizado no describe el tipo de red (transformer denso, MoE, hibrido SSM, etc.), el numero de capas, las dimensiones ocultas ni el mecanismo de atencion. Lo unico deducible del proceso de publicacion es que el modelo base esta en formato Hugging Face/transformers y que la conversion a GGUF se hizo con `convert_type: hf`, un camino estandar de llama.cpp que asume una arquitectura de transformer compatible con las que soporta dicha herramienta.

Tampoco hay datos sobre el entrenamiento: ni numero de tokens, ni composicion del corpus, ni si hubo fases de instruccion, RLHF o DPO. Las etiquetas del repositorio (`coding`, `efficiency`, `gmce`, `conversational`) sugieren un ajuste orientado a generacion de codigo y uso conversacional, pero no se aporta ninguna descripcion metodologica que lo respalde. El sufijo "GMCE" del nombre no aparece explicado en la documentacion disponible. En consecuencia, no es posible evaluar innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido: simplemente no estan documentadas.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Generacion y asistencia de codigo, segun la etiqueta `coding`; no hay benchmarks ni ejemplos que cuantifiquen el rendimiento.
- Optimizacion para eficiencia de despliegue: la existencia de cuantizaciones desde 2,6 GB apunta a escenarios con recursos limitados.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante infraestructura de inferencia estandar.
- Ejecucion local offline a traves de llama.cpp y derivados (formato GGUF).
- Soporte multilingue: no disponible; solo se declara ingles.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio o modo thinking: no documentados.

## Casos de uso

- Asistencia de codigo en local: con la variante i1-Q4_K_M (5,7 GB) el modelo cabe en una GPU de 8-12 GB y permite autocompletado y explicacion de codigo sin enviar el codigo fuente a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Despliegue en portatiles y equipos sin GPU dedicada: las variantes i1-IQ2_M (3,6 GB) e i1-IQ3_S (4,4 GB) permiten ejecucion en CPU con llama.cpp sobre 8-16 GB de RAM, utiles para prototipos y demos off-line.
- Prototipado rapido de chatbots en ingles: al ser un modelo conversacional de ~9B, sirve para validar flujos de dialogo multi-turno antes de invertir en modelos mayores; la ausencia de datos de contexto obliga a medir empiricamente el limite util.
- Generacion de codigo en pipelines internos: puede integrarse en un servicio HTTP servido con llama.cpp o con el soporte experimental de GGUF de vLLM, siempre que el rendimiento se valide con pruebas propias dado que no hay benchmarks publicados.
- Educacion e investigacion sobre cuantizacion: el repositorio incluye el fichero imatrix y 24 variantes del mismo modelo, lo que lo convierte en un banco de pruebas para medir la degradacion de perplejidad entre IQ1_S y Q6_K sobre una misma red.
- Evaluacion comparativa de tecnicas de quant: util para experimentar con la afirmacion del autor de que IQ3_S "beats Q3_K*" o que IQ4_XS es preferible a IQ4_NL, replicando las mediciones en un caso concreto.
- Entornos aislados o air-gapped: al ser un artefacto unico descargable y ejecutable sin dependencias de red, encaja en maquetas y laboratorios sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se referencian evaluaciones del modelo base emperorofrome/K2-Horizon-7B-GMCE. El unico material de rendimiento es la grafica externa de ikawrakow sobre perplejidad relativa de tipos de quant de baja calidad, que compara formatos de cuantizacion, no modelos.

## Requisitos de hardware

Estimaciones de VRAM calculadas a partir del tamano de cada fichero GGUF mas overhead de runtime y cache KV; la cache KV no puede calcularse con precision porque no se publican el numero de capas, cabezas ni la longitud de contexto.

| Variante | Tamano | VRAM estimada (contexto corto) | Notas |
|---|---:|---:|---|
| i1-IQ1_S | 2,6 GB | ~3,5 GB | calidad muy degradada ("for the desperate") |
| i1-IQ2_M | 3,6 GB | ~4,5 GB | minima viable |
| i1-IQ3_M | 4,5 GB | ~5,5 GB | compromiso tamano/calidad |
| i1-Q4_K_S | 5,5 GB | ~6,5 GB | el autor lo marca como optimo en tamano/velocidad/calidad |
| i1-Q4_K_M | 5,7 GB | ~7 GB | recomendado por el autor, rapido |
| i1-Q5_K_M | 6,6 GB | ~8 GB | |
| i1-Q6_K | 7,5 GB | ~9 GB | practicamente equivalente al Q6_K estatico |

- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB y RTX 4090 24 GB con todas las variantes; en GPUs de 8 GB conviene usar IQ3 o Q4_K_S con contexto moderado.
- GPU profesional: A100 40/80 GB y H100 permiten servir varias instancias concurrentes o mantener contexto largo, aunque no hay datos de throughput publicados.
- CPU: las variantes IQ2 e IQ3 son viables en CPU con 8-16 GB de RAM; el resto requiere 8 GB o mas de RAM libre ademas del sistema.
- Despliegue: llama.cpp, Ollama (importando el GGUF mediante Modelfile), LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI estan pensados para safetensors; vLLM tiene soporte GGUF experimental y TGI no lo soporta de forma nativa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| K2-Horizon-7B-GMCE-i1-GGUF (esta ficha) | ~9B (8.999.178.240) | no disponible | GGUF cuantizado (i1, imatrix) | apache-2.0 | no publicados |
| emperorofrome/K2-Horizon-7B-GMCE (base) | ~9B (8.999.178.240) | no disponible | safetensors (BF16, ~18 GB estimados) | apache-2.0 | no publicados |
| K2-Horizon-7B-GMCE-GGUF (static quants del mismo autor) | ~9B | no disponible | GGUF estatico (Q2_K a Q6_K) | apache-2.0 | no publicados |

No se dispone en la informacion proporcionada de datos objetivos (parametros, contexto, benchmarks) de otros modelos de la misma categoria con los que establecer una comparacion fiable, por lo que la comparativa se limita a las tres variantes del mismo modelo. Cualquier comparacion con familias como Llama, Mistral o Qwen requeriria verificar sus especificaciones en sus propias fichas y ejecutar una evaluacion comun, que aqui no esta disponible.

## Limitaciones y advertencias

- Solo se declara soporte de ingles (`language: en`); el rendimiento en castellano no esta verificado y probablemente sea inferior.
- No se publica la longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones o ficheros largos; hay que medirlo antes de disenar prompts.
- Ausencia total de benchmarks: no hay evidencia publica de calidad en codigo, matematicas o razonamiento mas alla de las etiquetas del repositorio.
- Riesgo de alucinacion inherente a los modelos de ~9B sin datos de alineacion documentados; no se especifica si hubo RLHF, DPO o filtrado de datos.
- Desconocimiento de la composicion del dataset de entrenamiento: no se puede evaluar sesgo de dominio, contaminacion de benchmarks ni procedencia licita de los datos.
- Las cuantizaciones de 1-2 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan la calidad de forma severa; el propio autor las describe como "for the desperate" o "mostly desperate".
- Licencia Apache 2.0 en el artefacto cuantizado, que permite uso comercial; conviene verificar que el modelo base mantiene la misma licencia y que no arrastra restricciones adicionales.
- Adopcion nula (0 descargas, 0 me gusta) y fecha de publicacion anomala (2026-10-20): no existe validacion externa de que los ficheros funcionen correctamente ni de que la conversion sea fiel al modelo original.
- El nombre comercial "7B" no coincide con los 8.999 millones de parametros declarados en safetensors; dimensionar hardware con el dato real de ~9B.
- Los repositorios de cuantizacion suelen contener decenas de ficheros; descargar solo la variante necesaria para evitar los 108,7 GB del repo completo.
- No hay garantia de soporte de chat template ni de formato de prompt: al no documentarse, hay que inspeccionar el tokenizer del modelo base.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/K2-Horizon-7B-GMCE-i1-GGUF
- Modelo base: https://huggingface.co/emperorofrome/K2-Horizon-7B-GMCE
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/K2-Horizon-7B-GMCE-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#K2-Horizon-7B-GMCE-i1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del autor): https://www.nethype.de/
