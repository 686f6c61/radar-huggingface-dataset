# Alevetto07/centvrio-4b

## Resumen

CENTVRIO 4B (identificador `Alevetto07/centvrio-4b`) es un ajuste fino del modelo `unsloth/Qwen3.5-4B` especializado en una unica tarea: la traduccion literaria de latin a italiano. Lo desarrolla el usuario Alevetto07 dentro del proyecto Centvrio, que incluye tambien un hermano menor de 0,8 B (`Alevetto07/legionarius-08b`) pensado para ejecutarse en el navegador. La arquitectura declarada en los metadatos GGUF es `qwen35`, con 4.326.350.848 parametros (4,3 B), una dimension de embedding de 2560 y una longitud de contexto nativa de 262.144 tokens.

El modelo se distribuye principalmente como ficheros GGUF cuantizados para inferencia local con llama.cpp y Ollama, en cinco niveles (Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0). Se entreno mediante QLoRA con Unsloth sobre 46.095 pares de traduccion latin-italiano, y su licencia es Apache-2.0, heredada del modelo base.

Su relevancia actual es doble. Por un lado, cubre un nicho poco atendido (traduccion literaria latin-italiano) en un tamano que cabe en hardware de consumo. Por otro, la model card documenta con un detalle poco habitual un problema metodologico: las dos tablas de evaluacion publicadas no son comparables entre si, y el propio maestro de 7 B del que se destilaron los datos puntua por debajo del estudiante de 4 B cuando la referencia pasa de estilo generado por el maestro a traduccion humana publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer decoder-only, segun metadatos GGUF del autor) |
| Parametros totales | 4.326.350.848 (4,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens de contexto nativo |
| Tipos de cuantizacion | GGUF: Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | latin (la) e italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp; el repositorio declara 4.326.350.848 parametros medidos sobre safetensors, aunque la model card solo documenta los ficheros GGUF |
| Dimension de embedding | 2560 |
| Modelo base | `unsloth/Qwen3.5-4B` (Apache-2.0) |
| Metodo de ajuste | QLoRA con Unsloth 2026.9.2 y Transformers 5.5.0 |
| Datos de entrenamiento | 46.095 pares latin → italiano |
| Pipeline declarado | translation |
| Tamano del repositorio | 16,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/Qwen3.5-4B`, un transformer decoder-only de la familia Qwen 3.5 con 4,3 B de parametros y 2560 dimensiones de embedding. La longitud de contexto nativa declarada en los metadatos GGUF es de 262.144 tokens, aunque la model card no documenta si esa ventana se mantiene efectiva tras el ajuste ni si el entrenamiento utilizo secuencias largas. El ajuste se realizo con QLoRA mediante Unsloth 2026.9.2 y Transformers 5.5.0 sobre 46.095 pares paralelos de latin a italiano, descritos genericamente como "mezcla de texto paralelo curado y material generado por maquina". No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineacion posterior al ajuste supervisado.

El punto tecnicamente mas interesante es la trazabilidad del entrenamiento, que el propio autor declara incompleta: el rango del adaptador de los pesos `v2` no se pudo recuperar de los artefactos de entrenamiento, porque los directorios etiquetados `*-r32` y `*-r64` contienen adaptadores LoRA cuyo config declara `Qwen/Qwen3.5-0.8B` como modelo base (pertenecen a ejecuciones del modelo de 0,8 B que reutilizaron la misma ruta de salida). El unico adaptador de 4 B genuino en disco es `r=16, alpha=32`. Es decir, la receta de `v2` debe tratarse como no confirmada, no como asumida. Ademas, la model card describe un esquema de destilacion desde un maestro de 7 B cuyas traducciones se usaron como referencia en el conjunto de prueba "teacher-style".

## Capacidades

- Traduccion literaria de latin a italiano, que es su unica funcion declarada. El autor es explicito: "this model translates. It is not a general assistant".
- Salida restringida a la traduccion, sin explicaciones ni analisis, cuando se le pasa el prompt de sistema previsto: `Sei un traduttore letterario dal latino all'italiano. Rispondi SOLO con la traduzione italiana, senza spiegazioni ne analisi.`
- Generacion mono-turno de una traduccion completa de un pasaje; no se documenta comportamiento multi-turno ni memoria de conversacion, pese a la etiqueta `conversational` del repositorio.
- Cobertura de contexto amplia en teoria (262.144 tokens nativos), limitada en la practica por la configuracion de servicio publicada (`num_predict 768`).
- Capacidades multilingues limitadas al par latin-italiano. No se documenta competencia en otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Compatibilidad declarada con llama.cpp y Ollama, y etiqueta `endpoints_compatible` en el repositorio.

## Casos de uso

- Pre-traduccion editorial de textos clasicos: generar un primer borrador italiano de pasajes de Cesar, Plinio o Virgilio con `temperature 0.3` y `top_p 0.9`, para que un traductor humano lo revise. El modelo aporta una base con chrF2 de 35-37 frente a referencia humana, suficiente para acelerar el trabajo pero no para sustituirlo.
- Investigacion en filologia clasica: usar el modelo como sujeto de estudio de errores de traduccion automatica en latin, aprovechando que la model card documenta fallos concretos y reproducibles (por ejemplo, `apros` "jabalies" traducido como "conigli" "conejos", o un comparativo invertido en la clausula final de la carta de Plinio).
- Digitalizacion de fondos antiguos en bibliotecas y archivos: encadenar OCR de ediciones latinas con la traduccion italiana del modelo para producir indices de consulta, asumiendo revision humana posterior.
- Herramientas de lectura asistida en la ensenanza del latin en Italia: el modelo permite mostrar una version italiana inmediata de un texto clasico en un portatil, sin depender de servicios en la nube, algo relevante cuando el material de partida tiene derechos de edicion.
- Inferencia local con requisitos minimos: la cuantizacion Q3_K_M ocupa 2211 MB y el autor la senala como la opcion racional, ya que en el conjunto humano las cinco cuantizaciones estan estadisticamente empatadas. Esto permite desplegarlo en equipos modestos con Ollama o llama.cpp.
- Procesamiento por lotes de pares de traduccion en investigacion en PLN: el modelo sirve para generar traducciones sinteticas latin-italiano y estudiar su calidad frente a referencias humanas, con la ventaja de que su licencia Apache-2.0 permite redistribuir los pesos.
- Punto de partida para nuevos ajustes QLoRA: al ser un modelo pequeno, con licencia permisiva y con adaptadores LoRA en el repositorio, es un candidato razonable para reentrenar sobre otros pares de lenguas clasicas o sobre un subgenero latin concreto (medieval, eclesiastico, tecnico).
- Traduccion de documentos largos siempre que se ajuste la configuracion de servicio: la ventana nativa de 262.144 tokens admite entradas extensas, pero el endpoint publicado corta la generacion en 768 tokens, de modo que un uso real con documentos largos exige modificar `num_predict`.

## Benchmarks y rendimiento

Los unicos datos publicados son las dos evaluaciones de traduccion que la model card advierte que no deben compararse entre si: la prueba "teacher-style" (64 pares, referencias generadas por el mismo maestro de 7 B del que se destilo) y la prueba con referencia humana (la traduccion publicada de Plinio, *Epistulae* I.6, 106 palabras latinas, nunca vista en entrenamiento).

| Fichero GGUF | Tamano | Teacher-style, n=64 (chrF2) | Referencia humana, chrF2 | Referencia humana, LaBSE |
|---|---|---|---|---|
| `centvrio-4b-q3_k_m.gguf` | 2211 MB | 57,19 | 35,26 | 0,8704 |
| `centvrio-4b-q4_k_m.gguf` | 2655 MB | 58,96 | 35,78 | 0,8975 |
| `centvrio-4b-q5_k_m.gguf` | 3015 MB | 59,99 | 35,49 | 0,8929 |
| `centvrio-4b-q6_k.gguf` | 3398 MB | 59,82 | 36,92 | 0,8938 |
| `centvrio-4b-q8_0.gguf` | 4397 MB | 59,70 | 36,89 | 0,8922 |
| Maestro 7 B (referencia) | no disponible | no disponible | 34,88 | no disponible |

Notas de lectura aportadas por el autor: en la prueba con referencia humana las cuantizaciones estan estadisticamente empatadas, ya que el ruido de muestreo intra-modelo sobre 3 muestras es de 2,66 chrF2 mientras que la dispersion total de Q3 a Q8 es de 4,25 con rangos solapados. El propio maestro de 7 B obtiene 34,88 en esa prueba humana, por debajo de todas las cuantizaciones de 4 B, lo que sugiere que la tabla "teacher-style" mide similitud de estilo con el maestro y no calidad de traduccion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidades generales. La comparacion humana se basa en un unico documento, y el autor pide tratarla como hipotesis hasta que se anadan mas pares humanos.

## Requisitos de hardware

- VRAM estimada solo para pesos, a partir del tamano de fichero publicado: Q3_K_M ~2,2 GB; Q4_K_M ~2,7 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB. A estas cifras hay que sumar el KV cache, que crece de forma lineal con el contexto; el autor no publica cifras de memoria para la ventana nativa de 262.144 tokens.
- Cabe en GPU de consumo: cualquier GPU con 6-8 GB de VRAM puede ejecutar Q3_K_M o Q4_K_M con contextos moderados. Modelos como la RTX 3060 de 12 GB, la RTX 4060 Ti de 16 GB o la RTX 4090 de 24 GB permiten subir a Q6_K o Q8_0 y ampliar contexto con holgura.
- Ejecucion en CPU: los cinco ficheros GGUF estan pensados para llama.cpp, de modo que la inferencia en CPU con RAM suficiente es viable; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria, sin cifras publicadas por el autor.
- GPU de centro de datos (A100, H100): no se documenta su uso, pero el modelo es lo bastante pequeno como para no necesitarlas; su interes esta precisamente en el despliegue local.
- Opciones de despliegue documentadas: llama.cpp (`llama-cli`) y Ollama (`ollama pull hf.co/Alevetto07/centvrio-4b:Q3_K_M`). El repositorio lleva la etiqueta `endpoints_compatible`, orientada a Hugging Face Inference Endpoints. No se documenta soporte de vLLM ni de TGI, y no se publican pesos en formato para esas pilas.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia.
- Parametros de muestreo recomendados por el autor: `temperature 0.3`, `top_p 0.9`, `num_predict 768` en el endpoint de referencia, mas el prompt de sistema en italiano descrito en la seccion de capacidades.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los dos modelos que la propia model card menciona: el hermano de 0,8 B del mismo proyecto y el maestro de 7 B usado para destilar. No se dispone de datos de otros modelos de traduccion latin-italiano.

| Modelo | Parametros | Contexto | Prueba humana (chrF2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Alevetto07/centvrio-4b` | 4,3 B | 262.144 tokens | 35,26-36,92 segun cuantizacion | Apache-2.0 | GGUF en Hugging Face, Ollama |
| `Alevetto07/legionarius-08b` | 0,8 B | no disponible | no disponible | no disponible | Hugging Face; disenado para ejecucion en navegador |
| Maestro 7 B del proceso de destilacion | 7 B | no disponible | 34,88 | no disponible | no distribuido en el repositorio |

No hay datos publicados que permitan comparar con alternativas externas de traduccion automatica latin-italiano, ni con modelos generalistas del mismo rango de parametros en esta tarea concreta.

## Limitaciones y advertencias

- Alucinacion de contenido: el autor documenta errores reales en la prueba humana, como traducir `apros` ("jabalies") por "conigli" ("conejos"), invertir un comparativo en la clausula final de la carta de Plinio, dejar una palabra latina sin traducir o confundir la persona verbal (`sedebam`, primera persona del singular, renderizado como tercera).
- Truncacion en produccion: el modelo no trunca entradas largas por si mismo, pero el endpoint publicado usa `num_predict 768`. En un pasaje de 106 palabras ninguna cuantizacion alcanzo ese limite, pero un documento mas largo si puede quedar cortado.
- Alcance de la evaluacion humana muy limitado: el conjunto de referencia humana es un unico documento. Las clasificaciones entre cuantizaciones deben tratarse como hipotesis.
- Riesgo metodologico al citar cifras: los valores de 57-60 chrF2 de la tabla "teacher-style" no son puntuaciones de calidad humana y no deben ponerse junto a los de la prueba humana. El autor insiste en este punto.
- Ambito de instrucciones muy estrecho: el modelo traduce y no funciona como asistente general. Usarlo fuera de esa tarea dara resultados poco fiables.
- Cobertura de idiomas restringida al latin y al italiano. No hay evidencia de comportamiento en otras lenguas, ni de traduccion inversa italiano-latin.
- Composicion del dataset no detallada: la model card describe los datos como mezcla de texto paralelo curado y material generado por maquina, sin desglose de generos, autores, periodos ni proporcion de datos sinteticos, por lo que no se puede evaluar la cobertura sobre latin medieval, eclesiastico, tecnico o vulgar.
- Procedencia del ajuste incompleta: el rango del adaptador de los pesos `v2` no se pudo recuperar. La receta debe considerarse no confirmada.
- Licencia y uso comercial: los pesos son Apache-2.0, heredada del modelo base, pero el propio autor advierte de que los datos de entrenamiento son una mezcla de texto paralelo curado y material generado por maquina, y recomienda consultar las notas del proyecto antes de redistribuir el modelo para uso comercial.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de terceros.
- Sesgos: no se documentan sesgos especificos. Cualquier sesgo derivado del corpus latino utilizado y de las traducciones generadas por el maestro de 7 B es desconocido, ya que no se publica la composicion del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alevetto07/centvrio-4b
- Modelo hermano de 0,8 B: https://huggingface.co/Alevetto07/legionarius-08b
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos eran hilos de foro en frances sobre recuperacion de cuentas de Facebook, sin relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.
