# mradermacher/ZOZ-Function-Master-3B-i1-GGUF

## Resumen

ZOZ-Function-Master-3B-i1-GGUF es un repositorio de pesos cuantizados en formato GGUF publicado por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion a GGUF del modelo base z51722369/ZOZ-Function-Master-3B, cuyo nombre sugiere una especializacion en function calling o uso de herramientas, si bien la model card no documenta ninguna capacidad de forma explicita.

El autor ha generado la coleccion completa de cuantizaciones con la variante "i1", es decir, cuantizacion asistida por matriz de importancia (imatrix) y calibracion ponderada, lo que en la practica mejora la calidad de los niveles de compresion mas agresivos (IQ1_S, IQ2_M, IQ3_XXS, etc.) frente a una cuantizacion estandar. Se ofrecen 24 variantes que abarcan desde 1 hasta 6 bits, lo que permite desplegar el modelo tanto en GPUs de gama alta como en equipos con recursos muy limitados.

La relevancia de esta publicacion es de tipo practico y de despliegue: facilita ejecutar un modelo de la familia de 3.000 millones de parametros en entornos locales mediante llama.cpp y sus derivados. No obstante, la informacion disponible es extremadamente escasa: no se documentan licencia, idiomas, arquitectura, datos de entrenamiento ni resultados de benchmarks, y el propio repositorio presenta inconsistencias de metadatos que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el repositorio declara 838.908 en metadatos de safetensors, dato inconsistente con la denominacion "3B" del modelo base) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS y small-IQ4_NL (24 variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizados; el modelo base se distribuye presumiblemente en safetensors, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base z51722369/ZOZ-Function-Master-3B: ni el tipo de red (transformer denso, MoE o hibrida), ni la estrategia de atencion, ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT sobre datos de function calling. La model card del repositorio GGUF se limita a los metadatos de la propia conversion.

Lo unico verificable en la informacion proporcionada es el proceso de cuantizacion: se trata de cuantizaciones ponderadas y con imatrix ("weighted/imatrix quants") de la version original, generadas con la herramienta de conversion de mradermacher (convert_type: hf, quantize_version: 2) y con cuantizacion de tensores de salida activada (output_tensor_quantised: 1). Las variantes "i1" del catalogo indican que los niveles de baja precision se han calibrado con una matriz de importancia, lo que reduce la perdida de calidad respecto a una cuantizacion uniforme de los mismos bits.

## Capacidades

- No se documenta ninguna capacidad de forma explicita en la informacion disponible.
- El nombre del modelo base ("Function-Master") apunta a una posible especializacion en function calling o invocacion de herramientas, pero se trata de una inferencia a partir del nombre, no de un dato confirmado.
- No hay confirmacion de soporte de tool calling, razonamiento multi-paso, agentes, capacidad multilingue, modo de razonamiento (thinking) ni capacidades multimodales (vision o audio).
- La unica capacidad verificable es la de ejecucion en inferencia local mediante runtimes compatibles con GGUF, incluidos los niveles de cuantizacion mas bajos (IQ1_S, IQ1_M) para hardware muy restringido.

## Casos de uso

- Inferencia local en portatil sin GPU dedicada: las variantes IQ2_M, IQ3_XXS o Q2_K permiten cargar el modelo en CPU con tamaños de fichero reducidos, utiles para pruebas de concepto offline.
- Despliegue en una GPU de consumo de 8 GB: las cuantizaciones Q4_K_M o IQ4_XS dejan margen suficiente para la ventana de contexto y el cache KV en tarjetas como la RTX 3060 o la RTX 4060.
- Servicio de bajo coste en produccion: la variante Q4_K_M puede servirse desde un unico nodo con vLLM o llama.cpp server para cargas moderadas, reduciendo el coste por token frente a modelos de mayor tamano.
- Evaluacion comparativa de cuantizaciones: al existir 24 variantes del mismo modelo, el repositorio sirve como banco de pruebas para medir la degradacion de calidad entre IQ1_S y Q6_K sobre una tarea concreta.
- Integracion en herramientas de escritorio o plugins locales: un modelo de ~3B en GGUF puede embeberse en aplicaciones de escritorio que requieran inferencia sin conexion.
- Filtrado o clasificacion de peticiones en una arquitectura de agentes: si el modelo base conserva capacidades de function calling, podria usarse como enrutador de herramientas de bajo coste delante de un modelo mayor, aunque esta capacidad no esta confirmada.
- Experimentacion educativa: el rango completo de cuantizaciones permite ilustrar en un aula el compromiso entre bits por peso, tamaño en disco y calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones de ingenieria derivadas del numero de bits por peso de cada cuantizacion y del orden de magnitud de un modelo de ~3.000 millones de parametros, no datos publicados por el autor.

- VRAM estimada para inferencia (solo pesos):
  - IQ1_S / IQ1_M: en torno a 0,7-1,0 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S: en torno a 1,0-1,3 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 1,4-1,7 GB.
  - IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 1,8-2,2 GB.
  - Q5_K_S / Q5_K_M: en torno a 2,2-2,5 GB.
  - Q6_K: en torno a 2,5-2,8 GB.
- Hay que sumar a esas cifras el cache KV y el overhead del runtime, que dependen de la longitud de contexto configurada (no disponible para este modelo).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM cubre las cuantizaciones de 4 bits; una RTX 3060, RTX 4060, RTX 3070 o superior resulta adecuada. Para las variantes Q6_K o para contextos largos conviene una GPU de 8 GB o mas (RTX 4070, RTX 3080). No se requiere A100 ni H100 para este tamano, salvo para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, practicamente en todas las tarjetas modernas desde 4-6 GB de VRAM, y tambien en CPU con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF como llama.cpp server. vLLM y TGI soportan GGUF de forma parcial o mediante conversion a otros formatos; no estan confirmados como opciones oficiales para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones del modelo base, por lo que la comparacion se limita a lo que puede afirmarse con la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| ZOZ-Function-Master-3B-i1-GGUF (este repositorio) | no disponible (denominado 3B) | no disponible | no disponible | GGUF (24 cuantizaciones) | no disponible |
| ZOZ-Function-Master-3B (modelo base, z51722369) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la categoria ~3B orientadas a function calling (por ejemplo, familias tipo Qwen, Llama o Functionary) | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a Logicat, una plataforma de datos tecnicos de reparacion de vehiculos sin relacion alguna con este repositorio.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamano declarado de 0,0 GB, lo que sugiere que puede estar vacio, incompleto o que los metadatos no se han indexado correctamente. Conviene verificar los ficheros antes de cualquier uso.
- Los metadatos declaran 838.908 parametros totales, una cifra incompatible con la denominacion "3B" del modelo base. Es probable que sea un error de indexacion de la plataforma, pero implica que no se puede confirmar el tamano real del modelo.
- No se especifica licencia. Sin licencia explicita no hay autorizacion clara para uso comercial, y la licencia del modelo base (z51722369/ZOZ-Function-Master-3B) es igualmente desconocida, por lo que la cadena de derechos no esta resuelta.
- No hay informacion sobre sesgos, idiomas de entrenamiento ni comportamiento en dominios sensibles.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Como en cualquier modelo de ~3B, cabe esperar una tasa de error mayor que en modelos de mayor tamano, especialmente en razonamiento multi-paso.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S) degradan notablemente la calidad de salida; no son recomendables para produccion salvo que el objetivo sea minimizar huella de memoria.
- La cuantizacion de tensores de salida (output_tensor_quantised: 1) puede afectar a la calidad de la capa de proyeccion final en modelos pequenos.
- La especializacion en function calling es una inferencia basada en el nombre del modelo; no hay documentacion que la respalde, y un fallo en el formato de las llamadas a herramientas romperia cualquier pipeline de agentes.
- Al ser un derivado no oficial, no cabe esperar soporte del autor del modelo base ni actualizaciones coordinadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ZOZ-Function-Master-3B-i1-GGUF
- Modelo base: https://huggingface.co/z51722369/ZOZ-Function-Master-3B
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Paper, blog o demo oficial: no disponible
- Resultados de la busqueda web: sin coincidencias relevantes (los resultados obtenidos apuntan a Logicat, plataforma de datos de reparacion de vehiculos, sin relacion con el modelo)
