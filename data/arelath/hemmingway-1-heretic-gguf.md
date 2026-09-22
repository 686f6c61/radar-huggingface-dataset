# arelath/Hemmingway-1-heretic-GGUF

## Resumen

Hemmingway-1-heretic-GGUF es una version cuantizada en formato GGUF de Hemmingway-1-heretic, un modelo de generacion de texto de aproximadamente 26.895 millones de parametros construido por el usuario arelath. El modelo se obtiene fusionando el adaptador arelath/Hemmingway-1-heretic-adapter sobre el modelo base Altworld/Hemmingway-1 en precision BF16 mediante PEFT, y convirtiendo despues el resultado a GGUF y cuantizandolo con llama.cpp. La model card indica que los commits exactos de origen estan documentados en un fichero provenance.json del repositorio.

El elemento diferenciador es la naturaleza "heretic" del modelo: el adaptador se genero con Heretic v2.0.0.dev0, una herramienta que elimina el alineamiento de seguridad de modelos transformer combinando ablacion direccional (abliteration, segun Arditi et al. 2024) con un optimizador de parametros basado en TPE sobre Optuna. Se trata, por tanto, de una variante deliberadamente descensurada del modelo original, no de un modelo con alineamiento estandar.

La relevancia practica de esta publicacion es limitada pero concreta: ofrece pesos listos para inferencia local en hardware de consumo mediante runtimes compatibles con llama.cpp, con cuantizaciones Q4_K_M y Q3_K_M. La model card advierte explicitamente de que no se ha realizado ninguna evaluacion de calidad ni de inferencia en este pipeline, y que la cabeza opcional de prediccion multi-token (MTP) queda excluida, por lo que los ficheros contienen unicamente el modelo de generacion normal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que se requiere un runtime llama.cpp reciente con soporte de Qwen3.5) |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE; la cabeza MTP esta excluida) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q3_K_M (familias de cuantizacion mixta de 4 y 3 bits; el almacenamiento efectivo por parametro es superior al nominal) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 29,8 GB) |
| Modelo base | Altworld/Hemmingway-1 |
| Adaptador aplicado | arelath/Hemmingway-1-heretic-adapter |
| Libreria | gguf |
| Pipeline | text-generation |
| Etiquetas relevantes | gguf, conversational, endpoints_compatible, region:us |
| Fecha de publicacion | 2026-09-22 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. La model card unicamente menciona que la generacion de los ficheros se realizo fusionando el adaptador arelath/Hemmingway-1-heretic-adapter sobre Altworld/Hemmingway-1 en BF16 con PEFT, para despues convertir y cuantizar con llama.cpp. La referencia a "un runtime llama.cpp reciente compatible con Qwen3.5" sugiere que la arquitectura subyacente podria derivar de la familia Qwen3.5, pero este extremo no se confirma en la documentacion disponible. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion tecnica documentada se situa en el proceso de descensurado, no en el entrenamiento. El adaptador se genero con Heretic v2.0.0.dev0, que aplica ablacion direccional (abliteration) para eliminar la direccion latente asociada al rechazo o al alineamiento de seguridad, y optimiza automaticamente los hiperparametros de dicha ablacion mediante un optimizador TPE basado en Optuna. La model card del adaptador indica que el proceso es reproducible y remite al directorio reproduce del repositorio. Ademas, la cabeza opcional de prediccion multi-token (MTP) se excluye deliberadamente de los pesos publicados, de modo que los ficheros GGUF contienen un modelo de generacion estandar sin decodificacion especulativa integrada.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" y el pipeline text-generation indican soporte de dialogos multi-turno, si bien no se detalla el formato de plantilla de chat empleado.
- Razonamiento y conocimiento general: no disponible; no se han publicado evaluaciones ni descripciones de capacidades especificas.
- Generacion de codigo: no disponible; no se menciona en la informacion proporcionada.
- Matematicas: no disponible.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta cumplimentado en el repositorio.
- Capacidad especial: el modelo esta descensurado mediante abliteration, lo que implica la ausencia de rechazos por alineamiento de seguridad ante peticiones que el modelo base rechazaria.
- Compatibilidad de despliegue: los pesos son compatibles con endpoints (etiqueta endpoints_compatible) y con runtimes tipo llama.cpp que soporten la arquitectura del modelo base.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q3_K_M y Q4_K_M permiten ejecutar un modelo de 26,9 mil millones de parametros en GPUs de 24 GB o en configuraciones con memoria unificada, algo inviable en BF16.
- Experimentacion en investigacion sobre alineamiento y seguridad: al ser una variante descensurada reproducible con Heretic, resulta util para estudiar el efecto de la ablacion direccional sobre el comportamiento del modelo base, comparando respuestas antes y despues del descensurado.
- Analisis de robustez y red teaming: el modelo permite evaluar como responde una version sin alineamiento ante prompts adversarios, como caso de estudio controlado en laboratorio.
- Generacion de texto creativo sin filtros editoriales: escritura de ficcion, guiones o narrativa donde los rechazos del modelo alineado resultan un obstaculo, siempre que el uso cumpla la legislacion aplicable.
- Despliegue en entornos aislados (air-gapped): al distribuirse como GGUF y requerir solo un runtime local, puede ejecutarse sin conexion a servicios externos, util en entornos con requisitos de confidencialidad.
- Base para futuras cuantizaciones o fine-tuning adicional: el repositorio incluye los pesos convertidos, lo que facilita servir de punto de partida para nuevas versiones cuantizadas o para aplicar adaptadores adicionales.
- Comparativa de rendimiento entre cuantizaciones: el repositorio publica simultaneamente Q3_K_M y Q4_K_M, lo que permite medir la degradacion de calidad entre ambas en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que este pipeline no ha realizado ninguna evaluacion de calidad ni de inferencia, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar para esta version cuantizada ni, segun la informacion recogida, para el modelo base.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 16-17 GB de pesos, mas la cache KV (estimacion a partir de los 26,9 mil millones de parametros; el propio autor advierte que el almacenamiento efectivo por parametro supera el nominal de 4 bits). Cifra orientativa, no confirmada por el autor.
- VRAM estimada para Q3_K_M: en torno a 12-13 GB de pesos, mas la cache KV. Cifra orientativa, no confirmada por el autor.
- GPU consumer: la cuantizacion Q4_K_M puede caber en una RTX 4090 o RTX 3090 de 24 GB, con contexto reducido para dejar margen a la cache KV. La Q3_K_M ofrece mas margen y permite ventanas de contexto mayores.
- GPU profesional: A6000 (48 GB), A100 40/80 GB y H100 permiten ejecutar el modelo con contextos amplios y mayor paralelismo.
- Configuraciones multi-GPU: dos GPUs de 24 GB permiten repartir los pesos y ampliar el contexto disponible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python. Requiere un runtime reciente con soporte de la arquitectura del modelo base (la model card menciona Qwen3.5). vLLM y TGI no estan documentados para estos ficheros; para usarlos habria que reconvertir a safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| arelath/Hemmingway-1-heretic-GGUF | 26,9 mil millones | no disponible | GGUF (Q3_K_M, Q4_K_M) | Apache 2.0 | Cuantizacion de tercero, sin evaluacion publicada |
| Altworld/Hemmingway-1 | no disponible | no disponible | no disponible | no disponible | Modelo base original, presumiblemente alineado |
| arelath/Hemmingway-1-heretic-adapter | no aplica (adaptador PEFT) | no disponible | no disponible | Apache 2.0 | Adaptador de descensurado generado con Heretic v2.0.0.dev0 |

No se dispone de datos verificados sobre modelos alternativos de la misma categoria (mismo tamano o misma tarea) que permitan una comparacion objetiva de rendimiento, ya que no existen benchmarks publicados para ninguna de las variantes de esta familia. Las dos filas adicionales de la tabla corresponden a los artefactos de origen del propio modelo, no a alternativas de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ninguna evaluacion de sesgos. Al estar el alineamiento de seguridad ablacionado, es previsible que el modelo reproduzca sesgos y contenido toxico con mayor facilidad que el modelo base, aunque no existen mediciones que lo cuantifiquen.
- Riesgo de alucinacion: no evaluado. No hay datos de fiabilidad factual ni de tasas de alucinacion.
- Descensurado deliberado: el proceso de abliteration elimina los rechazos por alineamiento, por lo que el modelo puede generar contenido danino, ilegal o gravemente inapropiado. Su uso en produccion orientada al publico es desaconsejable sin una capa de moderacion externa.
- Ausencia total de evaluacion: la model card declara explicitamente que este pipeline no ha realizado ninguna comprobacion de calidad ni de inferencia. No hay garantia de que la fusion del adaptador ni la cuantizacion hayan preservado las capacidades del modelo base.
- Limitaciones de contexto e idioma: se desconocen la longitud de contexto soportada y los idiomas cubiertos, ya que el repositorio no cumplimenta esos campos.
- Cabeza MTP excluida: no se puede aprovechar la prediccion multi-token para decodificacion especulativa con estos ficheros.
- Requisito de runtime especifico: necesita una version reciente de llama.cpp u otro runtime compatible con la arquitectura del modelo base; versiones antiguas pueden fallar al cargar los pesos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero el usuario asume toda la responsabilidad legal sobre el contenido generado por un modelo sin alineamiento de seguridad.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe una comunidad que haya validado su comportamiento en produccion.
- Fecha de publicacion futura respecto al conocimiento habitual de la familia: conviene verificar la vigencia del runtime recomendado antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/arelath/Hemmingway-1-heretic-GGUF
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Adaptador heretic: https://huggingface.co/arelath/Hemmingway-1-heretic-adapter
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Referencia de abliteration citada por Heretic: Arditi et al. 2024 (URL no disponible en la informacion proporcionada)
