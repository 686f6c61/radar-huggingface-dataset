# jancirnodziewiaty/Melody1437-26B-A4B-v2.0-oQ4e

## Resumen

Melody1437-26B-A4B-v2.0-oQ4e es la cuantizacion a 4 bits del modelo ReadyArt/Melody1437-26B-A4B-v2.0, publicada por el usuario jancirnodziewiaty. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a la libreria MLX de Apple, pensada para ejecutar inferencia local en equipos con chip Apple Silicon. El repositorio contiene 25.805.936.206 parametros (unos 25,8 mil millones) almacenados en safetensors con un peso total de 15,8 GB.

La model card es minima: se limita a indicar el tipo de modelo (gemma4), la precision (4 bits), el tamano de grupo (64) y el formato (MLX safetensors). La cuantizacion se ha realizado con la herramienta oQ, integrada en oMLX v0.6.4, que aplica precision mixta en lugar de una cuantizacion uniforme. El autor senala explicitamente que se ha descartado la prediccion multi-token (MTP) presente en el modelo base gemma-4-26B-A4B-it porque degradaba el rendimiento.

Es relevante ahora por dos motivos: permite ejecutar un modelo de ~26B parametros en un Mac con memoria unificada razonable, y sirve como ejemplo practico de cuantizacion mixta de precision con oQ sobre la familia Gemma. La nomenclatura "A4B" del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 4000 millones de parametros activos, aunque este dato no esta confirmado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (segun la model card); sin detalle de si es densa o MoE |
| Parametros totales | 25.805.936.206 (~25,8 mil millones, dato de safetensors) |
| Parametros activos | no disponible; la nomenclatura "A4B" del nombre sugiere ~4000 millones activos, sin confirmar |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con precision mixta (oQ, oMLX v0.6.4), tamano de grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el modelo base pertenece a la familia Gemma, por lo que se aplicaria la licencia de dicho modelo base |
| Formato de pesos | MLX safetensors (libreria mlx) |

Datos adicionales del repositorio: 15,8 GB de tamano, 0 descargas y 0 likes en el momento de la consulta, creado el 20 de septiembre de 2026 y actualizado el 21 de septiembre de 2026.

## Arquitectura y entrenamiento

La model card identifica el tipo de modelo como "gemma4" y el modelo base como ReadyArt/Melody1437-26B-A4B-v2.0, a su vez derivado de gemma-4-26B-A4B-it. Esto implica que la arquitectura subyacente es la de la familia Gemma 4, si bien no se documenta en el repositorio ni la composicion del dataset de entrenamiento, ni el numero de tokens, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. Toda esa informacion corresponderia al modelo base, cuya ficha no forma parte de la informacion proporcionada.

El unico detalle tecnico relevante que aporta el autor es la decision de excluir la prediccion multi-token (MTP) del modelo base, porque su inclusion reducia el rendimiento en pruebas propias. La cuantizacion se ha realizado con oQ (oMLX v0.6.4), un esquema de precision mixta que asigna distintos niveles de bits a distintas capas o tensores, en lugar de aplicar 4 bits uniformes. El tamano de grupo es 64, un valor relativamente fino que reduce el error de cuantizacion a costa de un mayor tamano de fichero por los metadatos de escalas y sesgos. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o variantes de atencion.

## Capacidades

- Generacion de texto: capacidades heredadas del modelo base, no documentadas de forma explicita en el repositorio.
- Razonamiento y matematicas: no disponible; no hay evaluaciones publicadas por el autor.
- Generacion de codigo: no disponible; no confirmada en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades multimodales (vision, audio): no disponible; la model card no menciona modulos multimodales.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Prediccion multi-token (MTP): explicitamente eliminada en esta version por perdida de rendimiento.
- Ejecucion en Apple Silicon mediante MLX: capacidad confirmada por la libreria y el formato de pesos del repositorio.

## Casos de uso

- Inferencia local en Mac con chip Apple Silicon: el formato MLX safetensors permite cargar el modelo directamente con la libreria mlx y ejecutarlo en memoria unificada, sin depender de CUDA ni de servicios en la nube. Es el caso de uso principal del repositorio.
- Prototipado offline y entornos sin conectividad: al ocupar 15,8 GB en disco y ejecutarse en local, el modelo puede desplegarse en portatiles o estaciones de trabajo aisladas donde no se permite enviar datos a APIs externas.
- Aplicaciones con requisitos de privacidad: procesamiento de texto sensible (documentacion interna, borradores, correspondencia) sin salida de datos del equipo, siempre que se asuma que no hay garantias publicadas sobre sesgos ni alucinaciones.
- Asistente de escritura y generacion de textos largos: modelos de la familia Gemma se emplean habitualmente en tareas de redaccion; conviene validar la calidad real de este fine-tune antes de integrarlo, dado que no hay evaluaciones publicadas.
- Evaluacion y comparacion de tecnicas de cuantizacion: el repositorio sirve como caso de estudio de cuantizacion mixta con oQ frente a cuantizaciones uniformes de 4 bits, midiendo perplejidad y calidad de salida en tareas controladas.
- Experimentacion academica sobre ajuste fino de modelos medianos: su tamano (~26B parametros totales) y su naturaleza de derivado comunitario lo hacen util para estudiar como se degradan o preservan capacidades tras el ajuste y la cuantizacion.
- Base para destilacion o generacion de datos sinteticos en local: se puede usar para producir corpus sinteticos en un equipo de sobremesa, sujeto a las restricciones de licencia del modelo base, que no estan declaradas en este repositorio.
- Desarrollo de wrappers y pipelines de inferencia en MLX: util para probar integraciones con servidores locales compatibles con MLX y medir latencia y consumo de memoria en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio ocupa 15,8 GB en disco en cuantizacion de 4 bits con grupo 64. Para inferencia hay que sumar la cache KV, que depende de la longitud de contexto (no documentada). Con contexto corto, un equipo con 24 GB de memoria unificada es el minimo razonable; 32 GB o mas es recomendable para contextos largos o procesamiento por lotes.
- GPU recomendadas: al ser un modelo en formato MLX, el hardware objetivo son los chips Apple Silicon (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). No se proporcionan datos de rendimiento para GPU NVIDIA o AMD; ejecutarlo en ellas requeriria convertir los pesos a otro formato.
- Compatibilidad con GPU de consumo: si en lugar de MLX se convierte a GGUF, un modelo de 25,8B parametros en 4 bits requiere del orden de 15-16 GB de VRAM, por lo que cabria en tarjetas con 24 GB (RTX 3090, RTX 4090) y quedaria muy justo o fuera de tarjetas de 12-16 GB. Esta estimacion es orientativa y no esta confirmada por el autor.
- Opciones de despliegue: MLX (libreria declarada en el repositorio) y, en caso de reconvertir pesos, llama.cpp u Ollama para GGUF. No hay soporte indicado para vLLM o TGI, que no trabajan de forma nativa con pesos MLX.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: se necesitan al menos 15,8 GB libres para los pesos, mas espacio temporal durante la descarga y la carga en memoria.

## Comparativa con modelos similares

Los datos del propio Melody1437-26B-A4B-v2.0-oQ4e no estan publicados fuera del recuento de parametros, por lo que la comparacion se limita a lo verificable. Las cifras de los modelos alternativos proceden de su documentacion publica, no del repositorio analizado.

| Modelo | Parametros | Activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Melody1437-26B-A4B-v2.0-oQ4e | 25,8B | no disponible (nombre sugiere ~4B) | no disponible | no disponible | no disponible | MLX safetensors |
| Gemma 3 27B | 27B | densa | 128K | publicado por Google | licencia Gemma | safetensors, GGUF, MLX |
| Qwen3-30B-A3B | 30,5B | ~3,3B | 128K | publicado por Alibaba | Apache 2.0 | safetensors, GGUF, MLX |
| Mistral Small 3.1 24B | 24B | densa | 128K | publicado por Mistral | Apache 2.0 | safetensors, GGUF |

La ventaja principal de esta publicacion es el formato MLX ya preparado y la cuantizacion mixta a 4 bits con grupo 64. Sus desventajas frente a las alternativas son la ausencia de licencia declarada, la falta de evaluaciones y el hecho de ser un derivado comunitario sin soporte oficial.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni pruebas de perplejidad, ni comparaciones con la version sin cuantizar. No se puede afirmar que la cuantizacion preserve las capacidades del modelo base.
- Sesgos: no documentados. Al ser un derivado de la familia Gemma, heredaria los sesgos del modelo base y los del ajuste fino comunitario, sin que el autor los haya analizado.
- Riesgo de alucinacion: no evaluado. La cuantizacion agresiva a 4 bits puede incrementar la degradacion en tareas de razonamiento y en el seguimiento de instrucciones largas.
- Contexto e idiomas: se desconocen la ventana de contexto real y los idiomas soportados. Cualquier uso multilingue o con contexto largo requiere validacion previa.
- Licencia: el repositorio no declara licencia. Aunque el modelo base sea de la familia Gemma, no se indica que la licencia del modelo base se herede de forma explicita, lo que genera incertidumbre legal para uso comercial. Conviene consultar la ficha de ReadyArt/Melody1437-26B-A4B-v2.0 y los terminos de la familia Gemma antes de cualquier despliegue en produccion.
- MTP desactivado: el autor indica que incluir la prediccion multi-token reducia el rendimiento. Esto implica que esta version no aprovecha esa tecnica de aceleracion y podria ser mas lenta en generacion que el modelo base.
- Naturaleza comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado ni garantias de actualizacion.
- Compatibilidad: esta ligado a MLX. Usarlo fuera de Apple Silicon exige convertir los pesos, proceso que puede introducir perdidas adicionales y que el autor no documenta.
- Advertencia sobre la fecha de publicacion: el repositorio figura como creado en septiembre de 2026, posterior a la mayoria de referencias disponibles; verificar la vigencia de los enlaces antes de usarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jancirnodziewiaty/Melody1437-26B-A4B-v2.0-oQ4e
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-26B-A4B-v2.0
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo: los resultados obtenidos correspondian a listados de templos en Assam y no guardan relacion con la ficha.
