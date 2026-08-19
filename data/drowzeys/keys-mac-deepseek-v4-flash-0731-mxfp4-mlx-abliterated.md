# drowzeys/keys-Mac-DeepSeek-V4-Flash-0731-MXFP4-MLX-Abliterated

## Resumen

Este modelo es un checkpoint comunitario que adapta DeepSeek-V4-Flash-0731, un modelo de mezcla de expertos (MoE) de 59.060 millones de parámetros, para ejecutarse de forma nativa en Apple Silicon mediante la librería MLX. El autor, drowzeys, ha aplicado una cuantización MXFP4 de 4 bits, ha eliminado los mecanismos de rechazo de contenido (técnica conocida como "abliteration") y ha incorporado el soporte para decodificación especulativa DSpark, que utiliza cabezas de borrador MTP (Multi-Token Prediction) para acelerar la generación. El resultado es un modelo que alcanza 49 tokens por segundo en un Mac Studio con M3 Ultra y admite una ventana de contexto de 1 millón de tokens, lo que lo convierte en una opción viable para ejecutar un LLM de gran tamaño localmente en hardware de consumo profesional.

La relevancia de este lanzamiento radica en que demuestra que es posible ejecutar un modelo de la familia DeepSeek-V4 con calidad cercana a la versión completa en equipos Mac de gama alta, sin depender de servicios en la nube ni de GPUs dedicadas. El checkpoint está diseñado específicamente para la pila oMLX, que incluye un kernel Metal compilado para DSA (Deep Speculative Architecture), y mantiene las cabezas de borrador MTP necesarias para la decodificación especulativa. El acceso está restringido (gated) y requiere aceptar las condiciones de la licencia de DeepSeek.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con decodificacion especulativa DSpark |
| Parametros totales | 59.059.787.710 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (segun repositorio del autor) |
| Tipos de cuantizacion | MXFP4 (4 bits) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | deepseek (licencia propietaria de DeepSeek, con acceso restringido) |
| Formato de pesos | safetensors, adaptado para MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4-Flash-0731, es un transformer de mezcla de expertos desarrollado por DeepSeek, aunque los detalles arquitectonicos completos (numero de expertos, dimensiones de capas, parametros activos) no estan disponibles en la informacion publica consultada. Este checkpoint no es un entrenamiento desde cero, sino una adaptacion posterior: se parte del modelo base y se aplica cuantizacion MXFP4 para reducir el peso de 59.000 millones de parametros a aproximadamente 30 GB, lo que permite su carga en memoria unificada de Apple Silicon.

La innovacion principal de esta version es la integracion de DSpark, un esquema de decodificacion especulativa que emplea cabezas de borrador MTP (Multi-Token Prediction) para generar varios tokens candidatos en paralelo y validarlos con el modelo principal. Segun el autor, el checkpoint conserva estas cabezas MTP, algo que no ocurre en otras cuantizaciones. Ademas, se ha aplicado "abliteration", una tecnica que modifica los pesos del modelo para eliminar los patrones de rechazo de contenido, dando como resultado una version sin censura. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de alineacion (RLHF, DPO) del modelo base.

## Capacidades

- Generacion de texto en ingles y chino con contexto de hasta 1 millon de tokens.
- Razonamiento y resolucion de problemas complejos, heredado del modelo base DeepSeek-V4-Flash.
- Generacion de codigo y soporte para tareas de programacion, aunque no se confirma tool calling explicito.
- Decodificacion especulativa DSpark con cabezas MTP, que acelera la generacion hasta 49 tokens por segundo en hardware Apple Silicon.
- Capacidad de procesamiento de secuencias muy largas (1M tokens) gracias a la cuantizacion MXFP4 y la memoria unificada.
- Contenido sin filtros de seguridad: el abliteration elimina los rechazos habituales, permitiendo respuestas sobre temas que el modelo base bloquearia.
- Ejecucion nativa en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni capa de traduccion.

## Casos de uso

- Analisis de documentos extensos: con 1M de tokens de contexto, se puede procesar libros completos, expedientes legales o historiales clinicos en una sola pasada. El modelo puede resumir, extraer entidades y responder preguntas sobre el contenido sin necesidad de dividir el texto.
- Asistente de programacion local: un desarrollador puede ejecutar el modelo en su Mac Studio para generar, revisar y refactorizar codigo en proyectos grandes, manteniendo el contexto de todo el repositorio. La velocidad de 49 tok/s permite una interaccion fluida.
- Investigacion academica sin conexion: investigadores que trabajan con articulos cientificos en ingles o chino pueden cargar corpus completos y realizar busquedas semanticas, resumenes y comparaciones sin enviar datos a servicios externos, lo que preserva la confidencialidad.
- Generacion de contenido creativo sin restricciones: la version abliterated permite explorar narrativas, guiones o dialogos que los modelos censurados rechazarian, util para escritores que necesitan libertad creativa total.
- Desarrollo de agentes conversacionales con memoria larga: un asistente virtual puede mantener el historial de una conversacion que abarque meses, gracias a la ventana de 1M tokens, sin perder el hilo.
- Prototipado de aplicaciones de razonamiento multiclave: el modelo puede encadenar pasos de razonamiento sobre grandes volumenes de datos estructurados (logs, informes financieros) para detectar anomalias o generar hipotesis, ejecutandose en un equipo de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento confirmados por el autor son de velocidad y eficiencia de decodificacion especulativa, medidos en un Mac Studio con M3 Ultra:

| Metrica | Valor |
|---|---|
| Velocidad de generacion | 49 tokens por segundo |
| Tasa de aceptacion de tokens de borrador | 32 de 32 (100 %) |
| Contexto maximo probado | 1.000.000 tokens |

Estos resultados indican que la decodificacion especulativa DSpark funciona de forma optima en este checkpoint, pero no permiten comparar la calidad del texto generado con otros modelos. Para evaluar la capacidad real de razonamiento o codigo, seria necesario ejecutar pruebas estandarizadas, algo que no se ha publicado.

## Requisitos de hardware

- Apple Silicon con memoria unificada de al menos 64 GB; el autor ha validado el funcionamiento en Mac Studio con M3 Ultra y en MacBook Pro con M4 Max de 128 GB.
- La cuantizacion MXFP4 reduce los pesos a aproximadamente 30 GB, pero la ventana de contexto de 1M tokens requiere una cantidad significativa de memoria adicional para la cache de atencion. Se recomienda 128 GB para usar el contexto completo sin degradacion.
- No es compatible con GPUs NVIDIA ni AMD; esta disenado exclusivamente para la pila MLX de Apple.
- Despliegue mediante oMLX (libreria MLX optimizada) y el kernel Metal DSA compilado que incluye el repositorio del autor. No se ha probado con vLLM, llama.cpp u Ollama.
- En un Mac Studio M3 Ultra, la latencia por token es de aproximadamente 20 ms (49 tok/s). En un M4 Max de 128 GB, el rendimiento es similar segun las pruebas del autor, aunque no se ha publicado una cifra exacta.

## Comparativa con modelos similares

La comparacion directa es dificil porque no existen otros checkpoints de DeepSeek-V4-Flash adaptados a MLX con decodificacion especulativa. Como referencia, se puede comparar con modelos locales de tamano similar que se ejecutan en Apple Silicon:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash (base) | 59.060 M (MoE) | 1M | FP8 (original) | deepseek | Gated en HF |
| Este checkpoint (MXFP4 MLX) | 59.060 M (MoE) | 1M | MXFP4 4-bit | deepseek | Gated en HF |
| Qwen2.5-72B-Instruct | 72.700 M (dense) | 128K | GGUF 4-bit | Apache 2.0 | Abierto |
| Llama-3.1-70B-Instruct | 70.600 M (dense) | 128K | GGUF 4-bit | Llama 3.1 | Abierto |

La ventaja de este modelo es su contexto de 1M tokens y la velocidad de decodificacion especulativa, que supera a las alternativas densas en equipos Apple. Sin embargo, la licencia restrictiva y el acceso gated limitan su uso comercial. Los modelos Qwen y Llama ofrecen licencias mas permisivas y soporte para mas herramientas, aunque con menos contexto.

## Limitaciones y advertencias

- El abliteration elimina los mecanismos de seguridad del modelo, lo que puede generar contenido ofensivo, peligroso o ilegal. No es adecuado para aplicaciones publicas sin supervision humana.
- La licencia de DeepSeek es restrictiva y no permite uso comercial sin autorizacion expresa. El acceso al checkpoint esta gated y requiere aceptar las condiciones en HuggingFace.
- Solo se soportan ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- El modelo requiere hardware Apple Silicon especifico (M3 Ultra o M4 Max con 128 GB) para un uso optimo. En equipos con menos memoria, la ventana de contexto se reducira drasticamente.
- No se han publicado benchmarks de calidad, por lo que se desconoce si la cuantizacion MXFP4 o el abliteration degradan el rendimiento en tareas de razonamiento, matematicas o codigo.
- La decodificacion especulativa DSpark depende de un kernel Metal compilado; si el entorno de ejecucion no coincide con el del autor, podrian aparecer incompatibilidades o perdidas de rendimiento.
- Al ser un checkpoint comunitario, no hay garantias de mantenimiento, soporte ni correccion de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drowzeys/keys-Mac-DeepSeek-V4-Flash-0731-MXFP4-MLX-Abliterated
- Modelo base DeepSeek-V4-Flash-0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio GitHub del autor (instrucciones de ejecucion): https://github.com/drowzeys/keys-Mac-DeepSeek-V4-Flash-DSpark-0731-MXFP4-MLX-49tps
- Benchmarks publicados por el autor: https://github.com/drowzeys/keys-Mac-DeepSeek-V4-Flash-DSpark-0731-MXFP4-MLX-Abliterated-49tps/blob/main/bench/RESULTS.md
- Articulo en LinkedIn sobre ejecucion en M4 Max: https://www.linkedin.com/pulse/running-deepseekv4flash-natively-apple-mlx-128gb-m4-max-popescu-cvppe
