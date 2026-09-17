# Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-fp16-vision

## Resumen

El repositorio Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-fp16-vision es una distribucion cuantizada del modelo que su autor denomina Qwen3.8-35B-A3B-Distill, publicada por el usuario Johneeee en HuggingFace el 17 de septiembre de 2026. No se trata de un entrenamiento original, sino de una conversion a 5 bits en precision mixta realizada con la herramienta oQ de oMLX (version v0.7.0.dev2). El resultado son pesos en formato MLX safetensors de 35.107.181.936 parametros totales, con un tamano de repositorio de 26,3 GB.

La relevancia de esta publicacion es practica: empaqueta un modelo de aproximadamente 35.000 millones de parametros en un formato optimizado para inferencia local en hardware Apple Silicon, reduciendo el peso de los pesos frente a una distribucion en fp16. El sufijo A3B del nombre sugiere una arquitectura de mezcla de expertos (MoE) con unos 3.000 millones de parametros activos por token, y la etiqueta qwen3_5_moe confirma que se trata de un modelo de tipo MoE de la familia Qwen3.5, aunque la model card no documenta el numero de expertos, el enrutador ni la longitud de contexto.

El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, no declara licencia, no declara idiomas soportados y no incluye informacion sobre datos de entrenamiento ni resultados de evaluacion. Es, por tanto, un artefacto de cuantizacion experimental mas que una release documentada, y cualquier uso en produccion exige validar primero el comportamiento del modelo y la situacion legal de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de tipo transformer (etiqueta qwen3_5_moe); numero de capas, expertos y dimension oculta: no disponible |
| Parametros totales | 35.107.181.936 (dato real extraido de los safetensors) |
| Parametros activos | no confirmado; el sufijo A3B del nombre sugiere aproximadamente 3.000 millones, sin verificacion en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits con group size 64, precision mixta generada por oQ (oMLX v0.7.0.dev2); no se documentan otras variantes en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria mlx) |
| Tamano del repositorio | 26,3 GB |
| Fecha de publicacion | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento de este modelo, porque el repositorio es una cuantizacion y no una release de entrenamiento. La unica informacion tecnica aportada por el autor es la relativa al proceso de cuantizacion: modelo de tipo qwen3_5_moe, 5 bits, group size 64 y formato MLX safetensors. Se desconoce el numero de tokens de entrenamiento, la composicion del corpus, la existencia de fases de RLHF, DPO u otras tecnicas de alineamiento, asi como cualquier innovacion de arquitectura mas alla de la propia naturaleza MoE.

Por el nombre del repositorio se pueden inferir dos cosas que conviene tratar como hipotesis y no como hechos confirmados. La primera es que el modelo base seria una variante destilada (Distill) de la familia Qwen3.5 o Qwen3.8 con arquitectura MoE y aproximadamente 3.000 millones de parametros activos, dado el patron A3B. La segunda es que el proceso de cuantizacion oQ en su variante oQ5e-fp16 mantendria determinados componentes en fp16 mientras cuantiza el resto a 5 bits, algo habitual en esquemas de precision mixta para preservar capas sensibles. Ninguna de las dos afirmaciones esta documentada en la model card.

## Capacidades

La model card no documenta capacidades funcionales, benchmarks ni tareas evaluadas. Lo unico verificable es el formato y el esquema de cuantizacion. Por tanto:

- Generacion de texto: capacidad inherente a un modelo de lenguaje de 35.000 millones de parametros, pero no verificada ni documentada por el autor.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision: el identificador del repositorio incluye la palabra "vision", pero la model card no menciona ningun componente visual ni se listan ficheros de proyector multimodal; tratar como no confirmado.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Cuantizacion: confirmada a 5 bits con group size 64 en formato MLX safetensors.

## Casos de uso

Nota previa: al no existir documentacion de capacidades ni evaluaciones, los escenarios siguientes son aplicaciones plausibles del artefacto por su formato y tamano, no casos validados por el autor.

- Inferencia local en Mac para desarrollo de software: al estar en formato MLX, el modelo se puede ejecutar con mlx-lm o MLX Swift sobre Apple Silicon, lo que permite mantener el codigo y los prompts dentro de la maquina sin enviarlos a una API externa. Es adecuado para equipos con requisitos de confidencialidad.
- Prototipado y evaluacion de cuantizaciones: sirve como sujeto de prueba para medir la degradacion de un esquema de 5 bits con group size 64 frente a la version fp16 del mismo modelo base, usando un conjunto de prompts propio y comparando perplejidad o calidad de respuesta.
- Servidor local compatible con la API de OpenAI: desplegado con mlx_lm.server se puede exponer un endpoint HTTP en la red local e integrarlo en un IDE o en un asistente de terminal, evitando costes por token en tareas de alto volumen y baja criticidad.
- Recuperacion aumentada (RAG) sobre documentacion interna: el modelo puede actuar como generador final en un pipeline que recupere fragmentos de manuales o bases de conocimiento y los inyecte en el prompt. Requiere validar antes la longitud de contexto real y el comportamiento con prompts largos.
- Generacion y resumen de documentacion tecnica: redaccion de notas de version, resumenes de incidencias o borradores de documentacion de API a partir de fuentes internas, con supervision humana posterior.
- Investigacion en destilacion y compresion de modelos: el artefacto es util como punto de partida para estudiar como se comporta un modelo destilado de tipo MoE tras una cuantizacion agresiva, o para generar datos sinteticos con los que entrenar modelos mas pequenos.
- Asistencia conversacional en puesto de trabajo sin conectividad: en entornos aislados o con red restringida, un modelo local cuantizado permite mantener un asistente de texto sin dependencia de servicios externos. La calidad multilingue y la latencia real deben medirse antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos: 26,3 GB de repositorio en formato MLX safetensors. Es el minimo absoluto de memoria que debe poder reservar el sistema para cargar el modelo.
- Memoria unificada recomendada: 36 GB o mas en Apple Silicon, para dejar margen a la cache KV, al contexto y al propio sistema operativo. Con 32 GB el margen es muy estrecho y depende de la longitud de contexto configurada.
- Equipos compatibles: Mac con chip de la serie M y 36 GB o mas de memoria unificada (por ejemplo M3 Max de 36 o 48 GB, M4 Pro de 48 GB, M4 Max o M2 Ultra). No cabe en configuraciones de 8, 16 o 24 GB.
- GPU NVIDIA y AMD: MLX no las soporta de forma nativa. Para usar CUDA seria necesario convertir los pesos a otro formato (por ejemplo GGUF o safetensors de Transformers) y verificar que la arquitectura MoE concreta esta implementada en el runtime de destino.
- Opciones de despliegue: mlx-lm (Python, incluye servidor HTTP), MLX Swift, LM Studio en Mac y cualquier runtime que consuma pesos MLX. vLLM, TGI y llama.cpp no cargan pesos MLX directamente.
- Latencia y throughput: no disponible. Dependen del chip, del ancho de banda de memoria unificada, de la longitud de contexto y del numero de tokens generados.
- Espacio en disco: al menos 27 GB libres para el repositorio, mas espacio adicional si se descarga tambien el modelo base en fp16 para comparar.

## Comparativa con modelos similares

No se dispone de informacion verificable sobre modelos comparables en el material proporcionado. No hay datos de contexto, licencia, parametros activos ni resultados de evaluacion del modelo analizado mas alla del recuento total de parametros, por lo que cualquier comparacion numerica seria inventada. La tabla siguiente recoge unicamente los campos confirmados y deja el resto como no disponible.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-fp16-vision | 35,1 B | no confirmado (~3 B segun el nombre) | no disponible | no disponible | MLX safetensors, 26,3 GB, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, la categoria natural de comparacion seria la de modelos MoE de 30 a 40 mil millones de parametros totales con unos pocos miles de millones activos, distribuidos en formatos cuantizados para inferencia local. No se han podido confirmar datos concretos de ninguno de ellos a partir de la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card solo describe el proceso de cuantizacion. No hay informacion sobre datos de entrenamiento, evaluaciones, sesgos ni comportamiento esperado.
- Licencia no declarada: al no especificarse licencia en el repositorio, no hay autorizacion explicita de uso comercial. Ademas, la licencia efectiva depende de la del modelo base, que no se identifica con precision. Cualquier uso en produccion requiere aclarar esto antes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y no cuantificado en este caso. La cuantizacion a 5 bits puede incrementar ligeramente la tasa de errores frente a fp16, especialmente en tareas de razonamiento o con contexto largo.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas. No debe asumirse un rendimiento multilingue sin pruebas propias.
- Contexto desconocido: sin longitud de contexto documentada no se puede planificar el uso en RAG con documentos largos ni en conversaciones de muchos turnos.
- Capacidad de vision no confirmada: aunque el nombre del repositorio incluye "vision", no hay evidencia en la model card ni en los metadatos de que exista un encoder visual o un proyector multimodal.
- Compatibilidad limitada: al ser pesos MLX, no se pueden cargar con vLLM, TGI o llama.cpp sin conversion previa. Esto restringe el despliegue a entornos Apple Silicon salvo trabajo adicional.
- Estado experimental: 0 descargas y 0 likes, publicacion de un autor individual y sin historial de uso. No hay garantia de mantenimiento, correccion de errores ni soporte.
- Verificacion obligatoria antes de produccion: conviene medir perplejidad, calidad de respuesta y latencia en el hardware objetivo, y comparar contra el modelo base en fp16 para cuantificar la perdida introducida por la cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-fp16-vision
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Documentacion de MLX: no disponible en la informacion proporcionada
- Modelo base Qwen3.8-35B-A3B-Distill: no disponible en la informacion proporcionada
- Paper o informe tecnico: no disponible
- Demos o espacios asociados: no disponible
