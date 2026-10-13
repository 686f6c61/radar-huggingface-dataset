# scottlowry/Qwen3.6-35B-A3B-oQ4e-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ4e-fp16-mtp es una cuantizacion de precision mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario scottlowry. La conversion se ha realizado con la herramienta oQ (oMLX v0.7.1.dev1) y el resultado se distribuye en formato MLX safetensors, es decir, pensado para inferencia sobre Apple Silicon mediante la libreria MLX. No se trata por tanto de un modelo nuevo, sino de una redistribucion optimizada del modelo base de Qwen.

El modelo conserva los 35.951.822.704 parametros del original (aproximadamente 35,95 mil millones) y aplica cuantizacion de 4 bits con group size 64. El repositorio ocupa 22,5 GB, lo que permite ejecutarlo en equipos con memoria unificada relativamente moderada, un escenario inviable con los pesos en precision completa. La nomenclatura del modelo base ("A3B") sugiere una arquitectura de mezcla de expertos con unos 3.000 millones de parametros activos por token, aunque este dato no se confirma en la informacion disponible.

Su relevancia es fundamentalmente practica: ofrece una via para ejecutar localmente un MoE de ~36.000 millones de parametros en un Mac, con la reduccion de coste de memoria que implica la cuantizacion a 4 bits. La ficha publica es muy escueta y no declara licencia, idiomas, contexto soportado ni resultados de evaluacion, por lo que buena parte de los apartados siguientes quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer con mezcla de expertos, segun la etiqueta del repositorio) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (la nomenclatura "A3B" del modelo base sugiere ~3.000 millones, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta oQ (oMLX v0.7.1.dev1) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio; se heredaria del modelo base) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es una conversion de pesos. El modelo de partida, Qwen/Qwen3.6-35B-A3B, pertenece a la familia qwen3_5_moe, lo que indica una arquitectura de transformer con capas de mezcla de expertos (MoE). La cuantizacion aplicada por oQ es de tipo mixto: se asignan 4 bits con group size 64 a la mayor parte de las matrices, mientras que el sufijo "fp16" del nombre apunta a que determinadas capas o tensores se mantienen en coma flotante de 16 bits para preservar precision. El sufijo "mtp" no aparece explicado en la model card, por lo que no se puede confirmar a que hace referencia.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documentan innovaciones tecnicas propias de esta version mas alla del propio esquema de cuantizacion mixta. El autor solo detalla el tipo de modelo, los bits, el tamano de grupo y el formato de salida.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.6-35B-A3B; no se documenta de forma explicita en este repositorio.
- Razonamiento y matematicas: no disponible en la informacion proporcionada.
- Generacion de codigo: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local en Apple Silicon: capacidad confirmada por el formato MLX safetensors y la libreria declarada (mlx).

Al no existir model card detallada ni evaluaciones publicadas, no es posible confirmar ninguna capacidad concreta mas alla de la compatibilidad de formato.

## Casos de uso

- Inferencia local en Mac: el repositorio esta empaquetado en MLX safetensors y ocupa 22,5 GB, por lo que se puede cargar con MLX en equipos Apple Silicon con memoria unificada suficiente para trabajar sin conexion y sin enviar datos a servicios externos.
- Asistente de codigo en el puesto de trabajo: un MoE de ~36.000 millones de parametros cuantizado a 4 bits permite mantener un asistente de autocompletado y explicacion de codigo en local, reduciendo la dependencia de APIs y el coste por token.
- Procesamiento de documentacion sensible: en entornos con requisitos de confidencialidad (legal, salud, sector publico) el modelo puede resumir y extraer informacion de documentos sin que estos salgan del equipo.
- Prototipado e investigacion sobre MoE: sirve como banco de pruebas para estudiar el comportamiento de un MoE cuantizado a 4 bits frente a los pesos originales, midiendo la degradacion introducida por oQ.
- Desarrollo de aplicaciones MLX: al ser un artefacto nativo de MLX, es util para validar pipelines de inferencia, gestion de memoria unificada y cuantizacion en el ecosistema de Apple antes de integrar el modelo en una aplicacion mayor.
- Evaluacion comparativa de esquemas de cuantizacion: permite contrastar la precision mixta de oQ (4 bits, group size 64, componentes en fp16) con otras estrategias como GGUF Q4_K_M o AWQ, siempre que existan conversiones equivalentes del mismo modelo base.
- Despliegue educativo o docente: ejecutar un modelo de ~36.000 millones de parametros en hardware de sobremesa facilita demostraciones y practicas sobre arquitecturas MoE sin acceso a clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni comparaciones con el modelo base en precision completa que permitan estimar la degradacion por cuantizacion.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos ocupan 22,5 GB en disco. Con overhead de activaciones y cache KV, se recomienda un minimo practico de 32 GB de memoria unificada, y 48-64 GB para trabajar con contextos largos o lotes mayores.
- Plataforma: MLX solo se ejecuta en Apple Silicon. No es utilizable directamente en GPU NVIDIA o AMD.
- Equipos Apple recomendados: Mac con chip M1/M2/M3/M4 Max de 32 GB como minimo viable; versiones Ultra con 64 GB o 128 GB para contextos amplios y mayor margen.
- GPU NVIDIA: no compatible con este repositorio tal cual. Para CUDA habria que usar el modelo base Qwen/Qwen3.6-35B-A3B (en bf16 ocuparia del orden de 72 GB, estimacion aritmetica a partir de los parametros) o generar una cuantizacion GGUF/AWQ equivalente por cuenta propia.
- Opciones de despliegue: MLX (libreria declarada en el repositorio). Para llama.cpp, Ollama o LM Studio seria necesaria una conversion a GGUF que no se proporciona aqui. vLLM y TGI no soportan safetensors de MLX.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni comparativas con otras cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Tamano de pesos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| scottlowry/Qwen3.6-35B-A3B-oQ4e-fp16-mtp | 35,95 B | 4 bits oQ, group size 64, fp16 en parte | 22,5 GB | MLX safetensors | no disponible | HuggingFace |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,95 B | sin cuantizar (supuesto; no confirmado en la informacion) | ~72 GB (estimado) | no disponible | no disponible | HuggingFace |
| Otras cuantizaciones del mismo modelo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre conversiones alternativas del mismo modelo base ni de modelos comparables de otros autores, por lo que no se puede establecer una comparacion de rendimiento, contexto o licencia mas alla de la diferencia de tamano frente a los pesos sin cuantizar.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: la conversion a 4 bits con group size 64 puede degradar el rendimiento en tareas sensibles a la precision numerica (matematicas, razonamiento encadenado largo, generacion de codigo estricto). No hay evaluaciones publicadas que cuantifiquen esta perdida.
- Sesgos: no disponible. No se documenta ninguna evaluacion de sesgo ni de seguridad del modelo base ni de esta cuantizacion.
- Riesgo de alucinacion: inherente a los modelos generativos; la cuantizacion agresiva puede incrementarlo en tareas de conocimiento factual, aunque no hay datos que lo confirmen para esta version.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto soportada ni los idiomas cubiertos. El castellano no esta confirmado en la informacion disponible.
- Licencia: no declarada en el repositorio. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base Qwen/Qwen3.6-35B-A3B, ya que este artefacto es una redistribucion derivada.
- Dependencia de plataforma: al ser MLX safetensors, el modelo queda restringido a Apple Silicon. No es portable a CUDA sin conversion.
- Ausencia de mantenimiento y validacion: el repositorio registra 0 descargas y 0 likes, y no hay model card detallada ni resultados de pruebas. No hay evidencia publica de que los pesos se hayan validado mas alla del proceso automatico de cuantizacion.
- Los sufijos "fp16" y "mtp" del nombre no estan explicados en la documentacion, por lo que no se puede verificar que correspondan exactamente con el contenido de los tensores.
- En produccion, la falta de benchmarks y de licencia explicita hace recomendable tratar esta version como experimental y validarla contra el modelo base antes de desplegarla.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/scottlowry/Qwen3.6-35B-A3B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- No se han encontrado otros enlaces relevantes en la busqueda web; los resultados obtenidos no guardan relacion con el modelo.
