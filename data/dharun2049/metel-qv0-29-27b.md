# dharun2049/Metel-QV0.29-27B

## Resumen

Metel-QV0.29-27B es una compresion experimental de precision ultra baja del modelo Qwen/Qwen3.8-27B, publicada por el usuario dharun2049 en HuggingFace. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una representacion alternativa de los pesos del modelo base: en lugar de almacenar cada peso en 16 bits (fp16) o en 4 bits (INT4/GPTQ), cada grupo de 32 pesos se sustituye por un indice de 9 bits sobre un codebook aprendido de 512 vectores quinarios, lo que da una tasa teorica de 0,289 bits por peso.

El problema que aborda es el coste de memoria y almacenamiento de los LLM de gran tamano: con esa tasa, el nucleo de los 27B parametros ocupa aproximadamente 1 GB, frente a unos 54 GB en fp16. El repositorio completo pesa 1,1 GB, lo que es coherente con esa cifra una vez anadidos codebooks, escalas, tensores en paso directo y metadatos. La relevancia actual del proyecto es que explora el regimen por debajo de 1 bit/peso, una frontera donde practicamente no existen recetas publicadas y verificadas como las que si hay en 8, 4 o 2 bits.

El punto critico es que QV0.29 no es un formato compatible con Transformers ni con los runtimes habituales de cuantizacion. Requiere un decodificador o runtime nativo especifico que todavia no se distribuye con el modelo. Ademas, la ficha no reporta ningun resultado de evaluacion, por lo que la afirmacion de "capacidad util retenida" no esta cuantificada. La licencia declarada es Apache 2.0 y el modelo base es Qwen/Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se detalla la arquitectura del modelo base Qwen/Qwen3.8-27B en la informacion proporcionada) |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | No disponible (no se indica si el modelo base emplea arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QV0.29, cuantizacion vectorial quinaria; ~0,289 bits/peso; alfabeto {-2, -1, 0, +1, +2}; vector de 32 pesos; codebook de 512 vectores; indice de 9 bits por bloque y escalas compartidas de 8 bits cada 1024 pesos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QV0.29 (formato de compresion personalizado y experimental; no es un formato drop-in de Transformers) |
| Modelo base | Qwen/Qwen3.8-27B (relacion declarada: base_model, finetune) |
| Tamano del repositorio | 1,1 GB |
| Nucleo teorico de pesos | ~1 GB (excluyendo codebooks, metadatos, tensores en paso directo y sobrecarga de formato) |
| Fecha de publicacion | 2026-09-21 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del modelo base Qwen/Qwen3.8-27B (tipo de capas, atencion, numero de capas, dimension oculta, vocabulario o estrategia de posicionamiento). Tampoco se documenta el proceso de entrenamiento del modelo base: no hay datos sobre numero de tokens, composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. En consecuencia, esos apartados quedan como no disponibles.

Lo que si describe la ficha es el procedimiento de compresion, que constituye la innovacion tecnica del repositorio. Frente a la cuantizacion escalar, que trata cada peso de forma independiente, QV0.29 aplica cuantizacion vectorial: agrupa los pesos en bloques de 32 y representa cada bloque mediante una entrada de un codebook aprendido de 512 vectores, cuyas componentes pertenecen al alfabeto quinario {-2, -1, 0, +1, +2}. La reconstruccion sigue la forma `W ≈ scale × gain × codebook[index]`. El coste por bloque es un indice de 9 bits (2^9 = 512 vectores) mas las escalas cuantizadas compartidas, que segun la ficha ocupan 8 bits cada 1024 pesos, lo que lleva al calculo `9 / 32 + 8 / 1024 ≈ 0,289` bits por peso.

Es importante subrayar que no hay evidencia de que se haya realizado ningun tipo de entrenamiento posterior a la compresion (recuperacion de calidad, destilacion o ajuste correctivo). La propia ficha califica el formato como experimental y senala explicitamente que no es un formato drop-in de Transformers y que requiere un decodificador QV0.29 o un runtime nativo para la inferencia.

## Capacidades

- Generacion de texto: no verificada. La ficha afirma que el objetivo es retener "capacidad util" en el regimen sub-1 bit, pero no se aporta ninguna evaluacion que lo respalde.
- Razonamiento, matematicas y generacion de codigo: capacidades heredadas del modelo base Qwen/Qwen3.8-27B, no documentadas en la informacion proporcionada y no verificadas tras la compresion.
- Tool calling / function calling: no disponible. No se documenta si el formato QV0.29 preserva las capacidades de llamada a herramientas del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles. No se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Capacidad operativa real: la unica capacidad confirmada a dia de hoy es servir como objeto de estudio de compresion: almacenar los pesos de un modelo de 27B en aproximadamente 1 GB y permitir su decodificacion mediante un runtime especifico que el autor no incluye en el repositorio.

## Casos de uso

- Investigacion en cuantizacion sub-1 bit: el repositorio permite analizar la receta QV0.29 (tamano de vector 32, codebook de 512 entradas, alfabeto quinario, escalas por 1024 pesos) y comparar empiricamente su comportamiento frente a esquemas escalares como GPTQ o AWQ en 4, 3 y 2 bits. Es adecuado porque expone los hiperparametros completos del formato y un artefacto real de 1,1 GB.
- Desarrollo de decodificadores y kernels nativos: dado que el formato no es drop-in, el caso de uso inmediato es implementar el decodificador QV0.29 (CPU o CUDA) que lea indices de 9 bits, aplique el codebook y reconstruya bloques de 32 pesos. El modelo sirve como caso de prueba con tensores reales de 27B.
- Estudio de degradacion de calidad por compresion extrema: medir perplejidad, exactitud en tareas de conocimiento y coherencia a lo largo de un barrido de bits por peso para localizar el punto en el que el modelo deja de ser utilizable. Requiere integrar el decodificador en un harness de evaluacion tipo lm-evaluation-harness.
- Experimentos de despliegue en memoria muy restringida: si se mantiene el formato comprimido en memoria y se decodifica bajo demanda, el nucleo de pesos ocupa del orden de 1 GB, lo que abre la puerta a probar inferencia en dispositivos donde un modelo de 27B en fp16 (unos 54 GB) es inviable.
- Analisis de libros de codigos vectoriales: estudiar la distribucion de uso del codebook de 512 vectores, la entropia efectiva de los indices y la correlacion entre bloques, con el fin de proponer variantes (por ejemplo, codebooks por capa o tamanos de vector distintos de 32).
- Ensenanza y divulgacion tecnica: usar el repositorio como ejemplo tangible de cuantizacion vectorial frente a cuantizacion escalar en cursos o articulos sobre eficiencia de LLM, ya que la ficha formula el coste en bits por peso de forma explicita.
- Archivado de bajo coste: conservar una copia de 1,1 GB en lugar de decenas de gigabytes para versiones de referencia, siempre que se asuma que la recuperacion del modelo utilizable depende de un decodificador externo.
- Reproducibilidad y auditoria de formatos: inspeccionar como se serializan indices, escalas y ganancias en un formato de pesos no estandar, util para quienes disenan herramientas de conversion entre formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha del modelo no incluye mediciones de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, ni antes ni despues de la compresion. Tampoco hay comparaciones con el modelo base sin cuantizar que permitan estimar la perdida de calidad asociada a 0,289 bits por peso. Cualquier cifra de rendimiento que se atribuya a este repositorio seria una invencion.

## Requisitos de hardware

- VRAM para pesos comprimidos: el nucleo teorico de los 27B pesos ocupa aproximadamente 1 GB segun la propia ficha, y el repositorio completo pesa 1,1 GB. Esta es la unica cifra de memoria respaldada por la informacion disponible.
- VRAM para pesos descomprimidos: si el runtime decodifica los pesos a fp16 en memoria, el requisito se situa en el entorno de los 54 GB solo para pesos, mas activaciones y cache KV. Si decodifica a 8 bits, alrededor de 27 GB. Ambas cifras son estimaciones aritmeticas a partir del numero de parametros, no datos publicados por el autor.
- Estrategia de memoria recomendada: decodificacion en streaming o por capas, manteniendo los indices comprimidos en memoria y reconstruyendo bloques de 32 pesos en el momento del calculo, con el fin de acercarse al limite de ~1 GB. No hay implementacion publicada de esta estrategia en el repositorio.
- GPU recomendadas: no disponible. No se documenta ninguna GPU probada ni requisito de computo. Para desarrollo de un decodificador, una GPU consumer con 24 GB (RTX 3090, RTX 4090) seria suficiente para trabajar con los pesos comprimidos o con subconjuntos de capas; para ejecutar el modelo completo en precision alta harian falta aceleradores de 80 GB (A100, H100) o varias GPU.
- Encaje en GPU de consumo: probable en terminos de almacenamiento de pesos comprimidos (1,1 GB), pero no confirmado en terminos de ejecucion, porque depende de un decodificador inexistente y de la memoria necesaria para el codebook y los buffers intermedios.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan QV0.29, ya que no es un formato compatible con Transformers ni GGUF. El unico despliegue posible hoy es mediante un runtime propio o un script de decodificacion escrito por el usuario.
- Latencia y throughput: no disponibles. No se publican mediciones, y serian fuertemente dependientes de la implementacion del decodificador, dado que la decodificacion por bloques de 32 pesos introduce una sobrecarga de computo por acceso a memoria que no existe con pesos almacenados en precision nativa.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos publicados con el mismo formato o con tasas de compresion comparables en el regimen sub-1 bit, por lo que no es posible establecer una comparativa de rendimiento verificada. La siguiente tabla compara unicamente el coste teorico de almacenamiento de 27B parametros segun el formato. Las filas distintas de QV0.29 son calculos aritmeticos de referencia (numero de parametros multiplicado por bits por peso), no mediciones de este repositorio.

| Formato | Bits por peso | Tamano teorico de 27B pesos | Soporte en runtimes estandar | Notas |
|---|---|---|---|---|
| QV0.29 (este modelo) | ~0,289 | ~1 GB | No (requiere decodificador propio) | Cuantizacion vectorial quinaria, bloques de 32, codebook de 512 |
| Ternario / 1,58 bits | ~1,58 | ~5,3 GB | Parcial (requiere runtimes especializados) | Familia de referencia tipo BitNet; no se dispone de datos de este repositorio para comparar |
| INT4 / GPTQ / AWQ | ~4,5 | ~15 GB | Si | Estandar de facto en despliegue local |
| INT8 | ~8 | ~27 GB | Si | Perdida de calidad habitualmente baja |
| FP16 / BF16 | 16 | ~54 GB | Si | Precision original del modelo base |

Comparativa con el modelo base: se desconoce la ficha tecnica de Qwen/Qwen3.8-27B en la informacion proporcionada (contexto, licencia especifica, idiomas y resultados de benchmarks), por lo que no se puede cuantificar la diferencia de calidad ni de capacidades entre el modelo original y esta version comprimida.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplejidad, ni comparacion con el modelo base. Es imposible saber si el modelo conserva capacidad util, que es precisamente la afirmacion central de la ficha.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en los metadatos proporcionados, por lo que no existe verificacion independiente del formato ni de los resultados.
- No es drop-in: QV0.29 no funciona con Transformers, vLLM, llama.cpp, Ollama ni TGI. Sin un decodificador QV0.29 no se puede ejecutar el modelo.
- Decodificador no incluido: el repositorio no proporciona, segun la informacion disponible, el codigo de decodificacion ni kernels. El coste de ingenieria para hacerlo utilizable recae en el usuario.
- Riesgo de alucinacion: no medido. En compresiones de este orden es esperable una degradacion de la factualidad y de la coherencia, pero no hay datos publicados que lo confirmen o lo descarten para este artefacto.
- Riesgo de fallo silencioso: los formatos de pesos personalizados sin validacion pueden producir salidas degeneradas o repetitivas sin lanzar errores, lo que dificulta distinguir un fallo de decodificacion de una degradacion por compresion.
- Ambiguedad sobre el modelo base: el identificador declarado es Qwen/Qwen3.8-27B, pero la informacion proporcionada no incluye su ficha, su contexto maximo, sus idiomas ni su licencia concreta. Conviene verificar la procedencia y la licencia del modelo base antes de cualquier uso derivado.
- Licencia y uso comercial: la licencia declarada es Apache 2.0, que en principio permite uso comercial, pero las condiciones del modelo base deben comprobarse de forma independiente, ya que un modelo derivado queda sujeto a las restricciones que aplique el modelo original.
- Idiomas: no se declara ningun idioma soportado ni se ha verificado el comportamiento multilingue tras la compresion.
- Madurez del formato: el propio autor lo describe como experimental. No debe considerarse apto para produccion.
- Inconsistencia temporal en los metadatos: la fecha de creacion del repositorio indicada es 2026-09-21, posterior a la fecha actual. Conviene tratar ese dato con cautela.
- Busqueda web sin resultados relevantes: los resultados de busqueda disponibles corresponden a rastreadores de vuelos (Flightradar24, FlightAware y similares) y no guardan ninguna relacion con el modelo, de modo que no aportan informacion adicional ni enlaces utiles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dharun2049/Metel-QV0.29-27B
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog tecnico, repositorio de codigo del decodificador QV0.29 y demos: no disponibles en la informacion proporcionada.
- Resultados de busqueda web: no se encontro ningun enlace relevante; los resultados devueltos correspondian a servicios de seguimiento de vuelos, sin relacion con el modelo.
