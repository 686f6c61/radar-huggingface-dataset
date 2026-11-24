# MouseWurX/Bobert-101Bob-A6B-Flash-Next-REAP80-GGUF

## Resumen

Bobert 101Bob A6B Flash-Next REAP80 es una variante podada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el desarrollador independiente MouseWurX bajo el paraguas de su proyecto personal "Bob". Se trata de un modelo de arquitectura MoE al que se le han eliminado 102 de los 512 expertos de cada una de sus 48 capas (se conservan 410, un 80%), aplicando una puntuacion estilo REAP (router-weighted expert activation pruning) calculada sobre trazas reales de uso. El resultado son aproximadamente 100,9B parametros de los 125B originales, sin reentrenamiento ni proceso de "curado" posterior.

La relevancia de esta publicacion es doble. Por un lado, demuestra una metodologia de poda guiada por tareas concretas (correo, ofimatica, codigo y busqueda web) en lugar de por texto generico, con conjuntos de evaluacion separados de los usados para puntuar expertos. Por otro, el objetivo declarado es conservar la habilidad del Flash-Next completo en un tamano que quepa en una GPU de 16 GB junto con 32 GB de RAM, algo que el modelo base no permite.

La distribucion es unicamente en formato GGUF, re-cuantizado desde una version Q8_0 (no desde BF16), con una matriz de importancia (imatrix) generada a partir de chats de entrenamiento propios del autor. El repositorio ocupa 0,9 GB, aunque la tabla de ficheros de la model card aparece como "(uploading)" y no detalla los pesos finales. La ficha de Hugging Face registra 233.467.158 parametros en safetensors, un dato que no cuadra con los ~100,9B declarados en el texto y que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, derivada de Qwen3.8-Flash-Next; 48 capas, 512 expertos por capa en el original, 410 tras la poda; incluye capa MTP (multi-token prediction) y embedding n-gram |
| Parametros totales | ~100,9B tras la poda (de ~125B en el base, sin contar embedding n-gram ni capa MTP). El campo safetensors del repo indica 233.467.158, dato inconsistente con la model card |
| Parametros activos | No disponible (el nombre "A6B" sugiere ~6B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, re-cuantizado desde Q8_0 con llama-quantize e imatrix propia; niveles concretos no detallados en la model card |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en los tags) |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 48 capas y 512 expertos por capa en su forma original. La intervencion consiste en una poda estructurada de expertos completos: en cada capa se conservan los 410 expertos con mayor puntuacion REAP y se eliminan los 102 restantes. Los cortes se realizaron copiando slices enteros de experto desde la version Q8_0 de unsloth/Qwen3.8-Flash-Next mediante el script gguf_cut_experts.py, sin modificar el contenido interno de cada experto. El experto compartido y todo lo que queda fuera de los expertos permanece intacto. La capa MTP (usada para decodificacion especulativa) conserva los expertos que aparecen con mas frecuencia entre las demas capas.

No hubo reentrenamiento ni "healing" posterior a la poda. La seleccion de expertos se baso en una puntuacion estilo REAP (Lasby et al. 2025): para cada experto se multiplica el peso que le asigna el router por el tamano de su salida y se suma sobre todas las palabras de 153 ejecuciones limpias de tareas reales del asistente Bob (correo, ficheros de oficina y proyectos de codigo), ejecutadas con el modelo completo en cuantizacion UD-Q4_K_XL. Los conjuntos de evaluacion usados para juzgar el resultado se mantuvieron separados y nunca se emplearon para puntuar expertos. La cuantizacion final se hizo con llama-quantize usando una imatrix (imatrix.gguf) generada a partir de chats de entrenamiento del autor, no de las tareas de evaluacion.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-Flash-Next.
- Uso de herramientas (tool calling / function calling) mediante un conjunto de aproximadamente 55 herramientas ofrecidas como llamadas de funcion, con una "tool shape" fija (shape 4) especifica para la familia Qwen.
- Gestion de correo electronico: lectura, busqueda, clasificacion, archivado, borrado y respuesta, evaluado sobre un buzon sintetico con correos trampa (phishing, trampas de baja).
- Ofimatica: creacion y edicion de documentos, hojas de calculo y presentaciones, verificado abriendo los ficheros resultantes en LibreOffice.
- Trabajo en repositorios de codigo: lectura de ficheros, edicion y ejecucion de comprobaciones en proyectos pequenos con bugs plantados y tests ocultos.
- Busqueda y lectura web para responder preguntas con respuestas verificables.
- Razonamiento multi-paso dentro de un bucle de agente con herramientas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente personal local de correo: el modelo puede leer, buscar, ordenar, archivar y responder correo dentro de un bucle de herramientas, con un rendimiento medido del 92,2% en localizacion de correos correctos sobre el conjunto de evaluacion retenido. Es adecuado porque la poda se guio precisamente con estas tareas y el modelo cabe en hardware de consumo.
- Automatizacion ofimatica en escritorio: generacion y edicion de documentos, hojas de calculo y presentaciones que se validan abriendo el fichero en LibreOffice. El nivel de 80% de expertos obtuvo 12 de 14 tareas correctas, frente a 13 de 14 del modelo completo.
- Asistencia de programacion en proyectos pequenos: lectura de ficheros, edicion y ejecucion de tests en repositorios con bugs plantados; el modelo resolvio 12 de 12 tareas de codigo en la evaluacion retenida, igual que el modelo sin podar.
- Agente de investigacion web con verificacion: busqueda y lectura de paginas para responder preguntas con respuesta comprobable; obtuvo 9 de 11 frente a 8 de 11 del modelo completo, dentro del ruido estadistico de un conjunto tan pequeno.
- Despliegue en estacion de trabajo con GPU de 16 GB: el objetivo declarado del corte es caber en 16 GB de VRAM mas 32 GB de RAM, lo que permite ejecutar un MoE de ~100B en un equipo personal mediante llama.cpp.
- Prototipado de asistentes con tool calling sin salida a la nube: al ejecutarse en local con llama.cpp, encaja en escenarios con requisitos de privacidad donde no se quiere enviar correo ni documentos a servicios externos.
- Evaluacion de tecnicas de poda de MoE: el repositorio incluye keep.json con los identificadores de expertos conservados por capa, lo que permite reproducir el corte o compararlo con otras estrategias de pruning.

## Benchmarks y rendimiento

Los unicos datos publicados son evaluaciones propias del autor sobre conjuntos de tareas retenidos (no benchmarks academicos estandar). Se comparan distintos niveles de retencion de expertos con el modelo completo, usando mascara de expertos en tiempo de servicio, una ejecucion por nivel, el 22 de noviembre de 2026:

| Expertos conservados | Oficina (de 14) | Codigo (de 12) | Web (de 11) | Bandeja de entrada (aciertos) | Acciones daninas |
|---|---|---|---|---|---|
| 100% | 13 | 12 | 8 | 85,0% | 0 |
| 90% | 13 | 12 | 9 | 92,7% | 0 |
| 80% | 12 | 12 | 9 | 92,2% | 0 |
| 75% | 13 | 10 | 8 | 90,8% | 1 |
| 65% | 13 | 12 | 9 | 79,0% | 0 |
| 60% | 13 | 12 | 8 | 79,6% | 0 |
| 50% | 9 | 11 | 9 | 85,7% | 0 |

El autor justifica el 80% como el nivel mas bajo sin acciones daninas y sin caida clara de rendimiento; por debajo, la bandeja de entrada se degrada primero (65-60%) y oficina se rompe al 50%. Con 11 a 14 tareas por conjunto, una o dos diferencias se consideran ruido. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el objetivo declarado es caber en una GPU de 16 GB de VRAM junto con 32 GB de RAM del sistema; los niveles de cuantizacion concretos no se detallan en la model card.
- GPU recomendadas: no disponibles de forma explicita; por el objetivo de 16 GB, encajan tarjetas de gama alta de consumo como RTX 4080/4090 o equivalentes con 16 GB o mas.
- Cabe en GPU de consumo: si, segun el objetivo del autor (16 GB de VRAM + 32 GB de RAM), aunque sin cifras de rendimiento verificadas.
- Opciones de despliegue: llama.cpp, en builds compatibles con Qwen/Qwen3.8-Flash-Next. No se mencionan vLLM, TGI, Ollama ni otros motores; al ser GGUF, llama.cpp es la via soportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bobert 101Bob A6B Flash-Next REAP80 | ~100,9B (MoE, 410/512 expertos por capa) | No disponible | Evaluacion propia del autor: 12/14 oficina, 12/12 codigo, 9/11 web, 92,2% bandeja | qwen-community-1.0 | GGUF en Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | ~125B (MoE, 512 expertos por capa) | No disponible | 13/14 oficina, 12/12 codigo, 8/11 web, 85,0% bandeja en la evaluacion del autor | qwen-community-1.0 | Pesos originales y GGUF (unsloth) |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-Q4_K_XL) | ~125B (MoE) | No disponible | Usado como referencia de evaluacion por el autor | qwen-community-1.0 | GGUF en Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La poda se optimizo para las tareas cotidianas del asistente Bob (correo, ofimatica, codigo, web); el rendimiento en otros dominios no esta evaluado y podria degradarse mas que en las tareas medidas.
- Los conjuntos de evaluacion son muy pequenos (11 a 14 tareas por conjunto) y de una sola ejecucion por nivel, por lo que las diferencias observadas pueden ser ruido estadistico; el propio autor lo advierte.
- Al 80% de retencion se observo una tarea de oficina fallida (12/14 frente a 13/14 del modelo completo), aunque el autor atribuye el fallo a una carencia del prompt y no a la poda.
- El nivel de 75% produjo una accion danina (borrado de un correo que requeria respuesta); el margen frente a comportamientos no deseados en produccion es estrecho.
- No hubo reentrenamiento ni healing: los expertos eliminados no se compensan y los pesos internos no se ajustaron.
- Los pesos se re-cuantizaron desde Q8_0 en lugar de BF16, lo que anade una perdida adicional de precision respecto al modelo original.
- Existe una inconsistencia entre los 233.467.158 parametros del campo safetensors y los ~100,9B declarados en la model card; conviene verificar el contenido real del repositorio antes de usarlo.
- La tabla de ficheros de la model card aparece como "(uploading)" y el repositorio ocupa solo 0,9 GB, lo que resulta llamativo para un modelo de este tamano; verificar que los pesos estan completos.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3.8-Flash-Next.
- Licencia qwen-community-1.0: revisar las condiciones de uso comercial del modelo base antes de desplegarlo en produccion.
- El modelo solo se distribuye en GGUF y solo se ha probado con llama.cpp; no hay soporte documentado para otros motores de inferencia.
- Idiomas soportados no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/MouseWurX/Bobert-101Bob-A6B-Flash-Next-REAP80-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF del que se parte: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Proyecto Bob (codigo, releases y notas): https://github.com/MouseWurX/Bob
- Dataset de lecciones y puntuaciones de expertos: https://huggingface.co/datasets/MouseWurX/bob-lessons
- Referencia REAP (Lasby et al. 2025): no disponible como enlace en la informacion proporcionada.
