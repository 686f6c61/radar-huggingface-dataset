# scottlowry/Qwen3.5-122B-A10B-oQ6e-fp16-mtp

## Resumen

`scottlowry/Qwen3.5-122B-A10B-oQ6e-fp16-mtp` es una cuantización de precision mixta del modelo Qwen3.5-122B-A10B, publicada por el usuario scottlowry en HuggingFace. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor ha aplicado la herramienta oQ (oMLX v0.7.1.dev1) para reducir el modelo original a 6 bits con grupo de 64, manteniendo ciertos componentes en fp16 (el sufijo "fp16" del nombre apunta a que el módulo de predicción multi-token, "mtp", se conserva sin cuantizar). El resultado se distribuye en formato MLX safetensors, es decir, pensado para ejecutarse sobre Apple Silicon.

El modelo base pertenece a la familia qwen3_5_moe, una arquitectura de mezcla de expertos. Según el conteo real de safetensors, el checkpoint contiene 125.086.497.008 parámetros (~125,1 mil millones), y la nomenclatura del nombre ("122B-A10B") sugiere 122 mil millones de parámetros totales con aproximadamente 10 mil millones activos por token, aunque estos datos no están confirmados en la model card. El repositorio ocupa 104,0 GB.

La relevancia de esta ficha es acotada: el modelo acumula 7 descargas y 0 likes desde su publicación, la model card es mínima y no incluye licencia, idiomas, contexto ni resultados de evaluación. Además, la búsqueda web asociada no devolvió ninguna fuente técnica relacionada con el modelo (únicamente noticias de sucesos sin relación). Cualquier dato no verificable se marca explícitamente como "no disponible" a lo largo del documento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer de mezcla de expertos; confirmado por el campo `model_type` de la model card) |
| Parametros totales | 125.086.497.008 (dato real del index de safetensors, ~125,1 B) |
| Parametros activos | ~10 B (inferido del sufijo "A10B" del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, precision mixta (oQ), con componentes en fp16 segun el nombre del checkpoint |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (`library_name: mlx`) |
| Tamano del repositorio | 104,0 GB |
| Herramienta de cuantizacion | oQ / oMLX v0.7.1.dev1 |
| Fecha de publicacion | 2026-10-12 (creado), 2026-10-12 (actualizado) |
| Descargas / likes | 7 / 0 |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base en la informacion disponible: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF, DPO o fases de post-entrenamiento. Tampoco se documenta el proceso de cuantizacion mas alla de los parametros declarados (6 bits, group size 64, precision mixta con oQ). El autor indica que esta version sustituye a una anterior subida el 2026-10-11 y recomienda volver a descargar los pesos si se obtuvo la version previa.

A partir del nombre del checkpoint pueden inferirse dos elementos, ambos sin confirmar por el autor. Primero, "mtp" corresponde a multi-token prediction, un modulo auxiliar de prediccion de varios tokens por paso que en arquitecturas tipo DeepSeek-V3 se usa tambien como mecanismo de decodificacion especulativa; el sufijo "fp16" sugiere que ese modulo se mantiene en precision completa mientras el resto del modelo va a 6 bits. Segundo, la mezcla de precisiones ("oQ6e") implica que no todas las capas usan el mismo numero de bits, una practica habitual para preservar capas sensibles (embeddings, normas, atencion) a mayor precision. El repositorio de 104,0 GB es coherente con esta aproximacion: 125,1 B de parametros a 6 bits puros ocuparian unos 93,8 GB, por lo que el exceso apunta a los componentes en fp16.

## Capacidades

- Generacion de texto: es la funcion esperada de un modelo de la familia Qwen, pero no hay ninguna declaracion explicita del autor en la model card.
- Razonamiento y matematicas: no disponible; no se documenta modo de pensamiento ("thinking mode") ni cadenas de razonamiento explicitas.
- Generacion de codigo: no disponible; no hay datos de HumanEval, MBPP ni similares.
- Tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no aparece en el repositorio.
- Capacidades especiales (vision, audio, prediccion multi-token): el nombre del checkpoint sugiere la presencia del modulo de prediccion multi-token (mtp) en fp16, sin confirmacion del autor.
- Ejecucion en Apple Silicon: capacidad confirmada por el formato MLX safetensors y la libreria declarada.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: el formato MLX permite cargar el modelo directamente con mlx-lm sobre Mac Studio o MacBook Pro con memoria unificada suficiente. Es el caso de uso para el que se publico este artefacto y el unico confirmado por el autor.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores que analicen el impacto de la cuantizacion de 6 bits con precision mixta (oQ) frente a fp16 pueden usar este checkpoint como referencia reproducible en el ecosistema MLX.
- Prototipado de aplicaciones de texto en local sin dependencia de la nube: con 104 GB de pesos, el modelo se ejecuta en una maquina propia, lo que evita enviar datos a APIs externas en entornos con requisitos de privacidad.
- Despliegue de un endpoint local: la libreria MLX incluye un servidor compatible con la API de OpenAI, de modo que el modelo puede servir peticiones a herramientas existentes sin cambiar el cliente.
- Experimentacion con decodificacion especulativa: si el modulo mtp se conserva en fp16 segun sugiere el nombre, seria el punto de partida para medir ganancias de velocidad frente a la decodificacion autoregresiva estandar.
- Pruebas de integracion de modelos grandes en LM Studio u otros frontends compatibles con MLX, siempre que la maquina disponga de memoria unificada suficiente.

La naturaleza del repositorio (7 descargas, 0 likes, model card minima) desaconseja usarlo en produccion sin una evaluacion propia previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MATH, MT-Bench ni equivalentes), no hay datos de latencia o throughput, y la busqueda web no devolvio ninguna fuente tecnica relacionada con el modelo. Tampoco se puede comparar el efecto de la cuantizacion a 6 bits frente a los pesos originales, porque no se publican mediciones de degradacion.

## Requisitos de hardware

- Memoria necesaria: aproximadamente 104 GB solo para los pesos, mas el espacio de trabajo del runtime (cache KV, buffers de activacion). En la practica, se recomienda un minimo de 128 GB de memoria unificada y, para contexto largo, 192 GB o mas.
- VRAM estimada por cuantizacion: 6 bits con group size 64 y componentes fp16, alrededor de 100-110 GB en total, segun el tamano real del repositorio (104,0 GB).
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (M-series). No es un formato para CUDA, por lo que GPU como A100, H100 o RTX 4090 no se pueden usar directamente sin reconvertir los pesos.
- Equipos objetivo: Mac Studio con M2 Ultra (192 GB) o M3 Ultra (256/512 GB); los equipos con 64 GB o 96 GB de memoria unificada no pueden cargar el modelo completo.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Tampoco cabe en un MacBook Pro de 128 GB sin recurrir a tecnicas de offloading a SSD, que degradarian fuertemente la latencia.
- Opciones de despliegue: mlx-lm (incluido su servidor HTTP compatible con la API de OpenAI), LM Studio y cualquier runtime que soporte MLX safetensors. vLLM, TGI, llama.cpp y Ollama requieren convertir los pesos a otro formato y pierden la ventaja de la cuantizacion oQ.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos publicados sobre el rendimiento de este checkpoint ni sobre los modelos con los que se deberia comparar, por lo que no es posible establecer una comparativa de calidad. La unica comparacion verificable es estructural, entre el artefacto cuantizado y su hipotetica version en precision completa:

| Version | Parametros | Formato | Tamano en disco | Notas |
|---|---|---|---|---|
| Este checkpoint (oQ6e-fp16-mtp) | 125.086.497.008 | MLX safetensors, 6 bits, group 64 | 104,0 GB (real) | Precision mixta, componentes en fp16 |
| Qwen3.5-122B-A10B en fp16 (estimado) | 125.086.497.008 | safetensors | ~250 GB (estimado: 2 bytes por parametro) | Valor calculado, no publicado por el autor |
| Otras cuantizaciones de 4 bits del mismo base | no disponible | no disponible | no disponible | No se han localizado en la informacion disponible |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | No hay benchmarks ni fuentes que permitan una comparacion fundamentada |

## Limitaciones y advertencias

- Licencia no declarada: la model card no incluye licencia. No se puede asumir uso comercial permitido. La licencia del modelo base Qwen3.5-122B-A10B deberia consultarse en su repositorio original antes de cualquier uso.
- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, idiomas, contexto, sesgos o evaluaciones. Cualquier despliegue exige una evaluacion propia.
- Riesgo de degradacion por cuantizacion: la cuantizacion a 6 bits con precision mixta puede alterar el comportamiento en tareas sensibles (matematicas, codigo, razonamiento de varios pasos). No se publican mediciones de degradacion, por lo que el impacto es desconocido.
- Riesgo de alucinacion: no evaluado ni documentado por el autor. No hay datos que permitan acotarlo.
- Versiones sustituidas: el autor advierte de que esta cuantizacion reemplaza a una version previa subida el 2026-10-11. Los pesos descargados antes de esa fecha estan obsoletos.
- Adopcion marginal: 7 descargas y 0 likes. No existe una comunidad que haya validado el artefacto, ni issues, ni informes de terceros.
- Compatibilidad restringida: al ser MLX safetensors, no se puede usar directamente en stacks CUDA ni en herramientas habituales como vLLM u Ollama sin conversion previa.
- Limitacion de hardware severa: requiere equipos Apple Silicon de gama alta con memoria unificada de 128 GB o superior, lo que excluye la practica totalidad de entornos de desarrollo convencionales.
- Ausencia de datos de contexto e idiomas: impide garantizar el comportamiento en conversaciones largas o en castellano.
- Trazabilidad incompleta: no se documenta la version exacta del modelo base utilizada para la cuantizacion, lo que complica reproducir el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ6e-fp16-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Repositorio del modelo base Qwen3.5-122B-A10B: no disponible en la informacion proporcionada
- Paper o documentacion tecnica del modelo base: no disponible
- Demo o espacio interactivo: no disponible
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces obtenidos correspondian a noticias de sucesos sin vinculacion alguna con el modelo.
