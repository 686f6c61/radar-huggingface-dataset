# MouseWurX/Bobert-101Bob-A6B-Flash-Next-REAP80-GGUF

## Resumen

Bobert 101Bob A6B Flash-Next REAP80 es una version podada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario MouseWurX en Hugging Face. Se trata de un modelo de arquitectura MoE (mixture of experts) al que se le han eliminado 102 de los 512 expertos de cada una de sus 48 capas, conservando 410 expertos por capa (un 80 % del total). Segun la model card, el resultado ronda los 100.900 millones de parametros de los 125.000 millones del modelo base, sin contar el embedding n-gram ni la capa MTP. No se ha reentrenado ni reparado el modelo tras el recorte.

La seleccion de expertos se hizo con puntuaciones de estilo REAP (router-weighted expert activation pruning), calculadas a partir de 153 ejecuciones limpias de tareas reales de asistente personal (correo, ofimatica y codigo) ejecutadas a traves del bucle de herramientas del proyecto Bob. Los conjuntos de tareas de evaluacion se mantuvieron separados y nunca se usaron para puntuar expertos. El objetivo declarado es conservar las capacidades del Flash-Next completo en un tamano que quepa en una GPU de 16 GB junto con 32 GB de RAM.

Los pesos se distribuyen en formato GGUF, cuantizados a partir de una version Q8_0 del modelo base (no desde BF16), usando una imatrix propia generada con conversaciones de entrenamiento del autor. El repositorio ocupa 200,3 GB e incluye tres cuantizaciones: IQ2_XXS (56,7 GB), IQ2_M (61,0 GB) y Q3_K_M (81,6 GB). La licencia es qwen-community-1.0, etiquetada como "other" en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capa MTP (multi-token prediction) y embedding n-gram; modelo base Qwen/Qwen3.8-Flash-Next |
| Parametros totales | 152.866.546.560 (dato real de safetensors del repo); la model card indica ~100,9B tras el recorte, sin contar embedding n-gram ni capa MTP |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS, IQ2_M, Q3_K_M (GGUF); recuantizado desde Q8_0 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp); incluye `keep.json` con los ids de expertos conservados por capa e `imatrix.gguf` |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 48 capas, 512 expertos por capa en el modelo original y una capa MTP (multi-token prediction) que actua como cabecera de borrador para decodificacion especulativa. El recorte elimina 102 expertos por capa y conserva 410 (80 %), manteniendo intactos el experto compartido y todo lo que queda fuera de los expertos. La capa MTP conserva los expertos que aparecen con mas frecuencia en el resto de capas. No hubo reentrenamiento ni proceso de "healing" posterior al recorte.

La seleccion de expertos se baso en puntuaciones REAP: para cada experto se calcula el peso que le asigna el router multiplicado por el tamano de su salida, sumado sobre todas las palabras de las 153 ejecuciones limpias. Las ejecuciones se obtuvieron haciendo que el Flash-Next completo (Unsloth UD-Q4_K_XL) resolviera tareas cotidianas del proyecto Bob a traves de su bucle de herramientas: ordenar y responder correo, crear y editar archivos ofimaticos y trabajar en proyectos de codigo. Solo se conservaron las ejecuciones que pasaron los evaluadores. Los archivos GGUF se generaron cortando directamente desde la version Q8_0 del modelo base con `gguf_cut_experts.py` (copiando porciones enteras de experto sin modificar su interior) y recuantizando despues con `llama-quantize` e imatrix propia. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno, heredadas del modelo base Qwen3.8-Flash-Next.
- Uso de herramientas (tool calling / function calling): la model card indica que fue evaluado con unas 55 herramientas ofrecidas como llamadas a funciones.
- Razonamiento multi-paso y ejecucion de tareas con bucle de agente (correo, ofimatica, codigo, busqueda web).
- Manipulacion de correo electronico: lectura, busqueda, clasificacion, archivado, borrado y respuesta.
- Creacion y edicion de documentos, hojas de calculo y presentaciones (verificadas abriendo los archivos en LibreOffice).
- Trabajo en repositorios de codigo: lectura de archivos, edicion y ejecucion de comprobaciones en proyectos pequenos con bugs plantados y tests ocultos.
- Busqueda y lectura de paginas web para preguntas con respuestas verificables.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente personal local: el modelo esta disenado para ejecutarse en el propio ordenador del usuario como cerebro de un asistente (proyecto Bob) que gestiona chat, correo, archivos y codigo sin enviar datos a servicios externos salvo que el usuario lo active.
- Gestion de bandeja de entrada: clasificar, archivar, borrar y responder correo electronico de forma automatizada; en las pruebas del autor encontro correctamente el 92,2 % de los correos relevantes con el 80 % de expertos conservados, sin acciones daninas.
- Automatizacion ofimatica: generar y modificar documentos, hojas de calculo y presentaciones mediante llamadas a herramientas, con verificacion del resultado abriendo los archivos en LibreOffice.
- Asistencia en desarrollo de software: leer, editar y validar codigo en repositorios pequenos con tests ocultos, integrable en un bucle de agente que ejecuta comprobaciones tras cada cambio.
- Busqueda web asistida: responder preguntas con respuestas verificables consultando paginas web a traves de herramientas de busqueda y lectura.
- Despliegue en hardware de consumo: al caber en una GPU de 16 GB con 32 GB de RAM en sus cuantizaciones IQ2, permite montar un asistente con tool calling en estaciones de trabajo modestas mediante llama.cpp.
- Prototipado de agentes con contexto de herramientas amplio: las ~55 herramientas ofrecidas como function calls en las pruebas del autor sirven como referencia para disenar conjuntos de herramientas en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluacion propia sobre conjuntos de tareas retenidos (held-out) del proyecto Bob, con el modelo base Flash-Next UD-Q4_K_XL y una mascara de expertos aplicada en tiempo de servicio (sin archivo recortado ni healing), una ejecucion por nivel:

| Expertos conservados | Office (de 14) | Code repo (de 12) | Web (de 11) | Inbox (correos correctos) | Acciones daninas |
|---|---|---|---|---|---|
| 100 % | 13 | 12 | 8 | 85,0 % | 0 |
| 90 % | 13 | 12 | 9 | 92,7 % | 0 |
| 80 % | 12 | 12 | 9 | 92,2 % | 0 |
| 75 % | 13 | 10 | 8 | 90,8 % | 1 (borro un correo que requeria respuesta) |
| 65 % | 13 | 12 | 9 | 79,0 % | 0 |
| 60 % | 13 | 12 | 8 | 79,6 % | 0 |
| 50 % | 9 | 11 | 9 | 85,7 % | 0 |

El autor justifica el 80 % como el nivel mas bajo sin acciones daninas ni caida clara de rendimiento; por debajo, la bandeja de entrada empeora primero (65-60 %), el 75 % produjo la primera accion danina y el 50 % rompe la ofimatica. Con 11 a 14 tareas por conjunto, una o dos tareas de diferencia se considera ruido. Como nota adicional, redirigir la cuota de cada experto apagado a su experto conservado mas parecido empeoro claramente la bandeja de entrada (64 de 117 encontrados frente a 85 con la mascara simple del 80 % y 90 con todos los expertos), por lo que el recorte elimina expertos en lugar de fusionarlos.

## Requisitos de hardware

- VRAM estimada: las cuantizaciones IQ2_XXS (56,7 GB) e IQ2_M (61,0 GB) no caben integras en una GPU de 16 GB; el objetivo declarado del autor es que el modelo quepa en una GPU de 16 GB combinada con 32 GB de RAM, lo que implica descarga parcial de capas a CPU.
- La cuantizacion Q3_K_M (81,6 GB) requiere mas memoria total que las variantes IQ2.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano de los archivos, un despliegue integro en GPU requeriria aceleradores con 60-80 GB o mas de memoria (por ejemplo, A100 80 GB o H100), aunque esto no lo confirma la model card.
- GPU de consumo: el autor afirma que el modelo esta pensado para una GPU de 16 GB (por ejemplo, RTX 4060 Ti, 4070 Ti Super, 4080 o 5080) con 32 GB de RAM del sistema, usando descarga de capas a CPU.
- Opciones de despliegue: llama.cpp, en las builds que ya ejecutan Qwen/Qwen3.8-Flash-Next. El repositorio incluye `imatrix.gguf` y `keep.json` para reproducir el recorte. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bobert 101Bob A6B Flash-Next REAP80 | 152,9B en safetensors del repo; ~100,9B segun la model card tras el recorte | no disponible | qwen-community-1.0 | GGUF (IQ2_XXS, IQ2_M, Q3_K_M) | Podado al 80 % de expertos, sin reentrenar |
| Qwen/Qwen3.8-Flash-Next (modelo base) | ~125B segun la model card del autor | no disponible | qwen-community-1.0 | safetensors y GGUF (Unsloth UD-Q4_K_XL) | Modelo completo, 512 expertos por capa |
| unsloth/Qwen3.8-Flash-Next-GGUF | ~125B | no disponible | qwen-community-1.0 | GGUF (incluye Q8_0) | Version cuantizada del base usada como punto de partida del recorte |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo no se ha reentrenado ni reparado tras el recorte de expertos; el rendimiento en tareas distintas de las evaluadas (correo, ofimatica, codigo y web) puede degradarse de forma no medida.
- La seleccion de expertos se hizo con puntuaciones REAP sobre tareas cotidianas del autor; el modelo puede estar sesgado hacia ese perfil de uso y rendir peor en dominios alejados de el.
- Con el 75 % de expertos se observo una accion danina (borrado de un correo que requeria respuesta); con menos expertos, la bandeja de entrada y la ofimatica se degradan. El 80 % es el limite inferior validado por el autor.
- Las evaluaciones se hicieron con 11 a 14 tareas por conjunto, por lo que las diferencias de una o dos tareas estan dentro del ruido estadistico.
- Las cuantizaciones IQ2 son muy agresivas (2 bits) y se obtuvieron recuantizando desde Q8_0, no desde BF16, lo que puede introducir perdidas adicionales de calidad frente a una cuantizacion desde precision completa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es inherente a los modelos de lenguaje y puede aumentar con cuantizaciones de 2 bits.
- Idiomas soportados: no disponible; no se puede confirmar el soporte multilingue mas alla de lo que herede del modelo base.
- Longitud de contexto: no disponible; condiciona el uso en conversaciones largas o repositorios grandes.
- Licencia qwen-community-1.0 (etiquetada como "other"): conviene revisar el archivo LICENSE del repositorio antes de un uso comercial, ya que las condiciones no se detallan en la informacion proporcionada.
- El modelo esta pensado como parte del proyecto personal Bob; no hay garantias de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/MouseWurX/Bobert-101Bob-A6B-Flash-Next-REAP80-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Version GGUF del base usada para el recorte: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio del proyecto Bob: https://github.com/MouseWurX/Bob
- Dataset de lecciones y puntuaciones de expertos: https://huggingface.co/datasets/MouseWurX/bob-lessons
- Paper de REAP (Lasby et al. 2025): no disponible como enlace en la informacion proporcionada
