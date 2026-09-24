# ilsp/Llama-Krikri-8B-Instruct-v1.5-4bit-mlx

## Resumen

Llama-Krikri-8B-Instruct-v1.5-4bit-mlx es una version cuantizada a 4 bits en formato MLX del modelo ilsp/Llama-Krikri-8B-Instruct-v1.5, publicado por la organizacion ilsp. Se trata de un modelo de lenguaje de 8.202.227.712 parametros (unos 8,2 mil millones) orientado a generacion de texto conversacional, con griego moderno (el) e ingles (en) como idiomas declarados. El repositorio ocupa 4,6 GB y la libreria indicada es mlx, por lo que su ejecucion esta pensada para hardware de Apple Silicon (familias M) mediante memoria unificada.

El modelo se apoya en la arquitectura etiquetada como "llama" (transformer decoder-only) y hereda el ajuste de instrucciones del modelo base, segun indica el propio nombre "Instruct-v1.5". La relevancia practica esta en el ambito del procesamiento del lenguaje natural en griego: permite desplegar un asistente conversacional en griego en un portatil o equipo de sobremesa de Apple sin necesidad de GPU dedicada, a cambio de una perdida de precision asociada a la cuantizacion de 4 bits.

La licencia es la Llama 3.1 Community License, lo que condiciona el uso comercial y obliga a revisar las clausulas de atribucion. El repositorio no registra descargas ni valoraciones en el momento de la consulta, y no se han publicado resultados de benchmarks en la informacion disponible, por lo que cualquier evaluacion de calidad debe realizarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (etiqueta "llama" del repositorio); numero de capas, cabezas y dimension oculta no disponible |
| Parametros totales | 8.202.227.712 (aproximadamente 8,2 mil millones) |
| Parametros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits en formato MLX; el modelo base se distribuye en precision completa. No se documentan otros formatos |
| Idiomas soportados | Griego moderno (el) e ingles (en) |
| Licencia | Llama 3.1 Community License (identificador "llama3.1") |
| Formato de pesos | Safetensors en formato MLX (cuantizacion de 4 bits); libreria mlx |

Otros datos del repositorio: tamano total de 4,6 GB, pipeline de text-generation, etiquetas adicionales "text-generation-inference", "conversational", "safetensors" y "region:eu".

## Arquitectura y entrenamiento

La informacion disponible describe un transformer decoder-only de la familia Llama, derivado del modelo ilsp/Llama-Krikri-8B-Instruct-v1.5, que a su vez es un modelo ajustado por instrucciones ("Instruct") en su version 1.5. Esta ficha corresponde a una conversion de esos pesos a 4 bits mediante el framework MLX. No se especifican en la informacion proporcionada el numero de capas, la dimension del modelo, el numero de cabezas de atencion, ni si se emplean variantes como grouped-query attention, atencion lineal o decodificacion especulativa.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens utilizados, la composicion del corpus (proporcion de griego frente a ingles, contenido de codigo o matematicas), la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni el procedimiento exacto de cuantizacion (calibracion, granularidad de grupo, tratamiento de capas sensibles). Cualquier afirmacion sobre estos puntos requeriria consultar la model card del modelo base, no incluida en la informacion disponible.

## Capacidades

- Generacion de texto conversacional e instrucciones de un solo turno y multi-turno, segun la etiqueta "conversational" del repositorio.
- Redaccion y comprension en griego moderno (el) e ingles (en); no hay evidencia de soporte para otros idiomas.
- Ajuste por instrucciones: el nombre "Instruct" indica entrenamiento para seguir indicaciones y mantener formato de dialogo.
- Inferencia local en Apple Silicon gracias al formato MLX, sin dependencia de CUDA.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Comportamiento como agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking): no disponibles; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Asistente conversacional en griego en produccion ligera: el modelo puede gestionar dialogos multi-turno en griego desplegado sobre un Mac con memoria unificada, util para pymes griegas o servicios internos que no quieren enviar datos a APIs externas.
- Atencion al cliente automatizada en griego: con la cuantizacion de 4 bits, el coste de servir varias sesiones concurrentes en un solo equipo de Apple es bajo, lo que permite prototipar un bot de soporte antes de escalar a infraestructura con GPU.
- Traduccion asistida griego-ingles y postedicion: al declarar ambos idiomas, sirve como base para traducir documentacion tecnica, correos o articulos, siempre con revision humana dado el riesgo de alucinacion.
- Resumen de documentos administrativos o periodisticos en griego: adecuado para sintetizar informes, actas o noticias, con la ventaja de que los datos no salen del equipo local.
- Herramienta de apoyo a la redaccion en griego: correccion de estilo, reescritura y generacion de borradores para periodistas, traductores o estudiantes que trabajan en griego.
- Prototipado e investigacion en PLN griego sin GPU: ideal para investigadores que necesitan evaluar rapidamente un modelo de 8B en griego sobre un portatil Apple, comparandolo con alternativas antes de invertir en hardware.
- Extraccion de informacion y clasificacion mediante prompts: analisis de sentimiento de resenas, etiquetado de tickets o extraccion de entidades en textos griegos, con la salvedad de que la precision de estas tareas no esta documentada.
- Base para ajuste fino especifico de dominio: el modelo base puede servir de punto de partida para adaptaciones con LoRA/QLoRA en griego juridico, medico o financiero; la viabilidad sobre los pesos ya cuantizados a 4 bits debe verificarse en la practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, evaluaciones en griego (por ejemplo conjuntos de referencia del propio ILSP) ni comparaciones con otros modelos. Tampoco se documentan metricas de latencia o throughput para esta version cuantizada.

## Requisitos de hardware

- Peso en disco de los pesos cuantizados: aproximadamente 4,6 GB, correspondiente al tamano total del repositorio.
- Memoria necesaria: alrededor de 5-6 GB de memoria unificada para inferencia con contextos moderados, sumando pesos y cache KV; la cifra exacta depende de la longitud de contexto, que no esta documentada.
- Equipos compatibles: exclusivamente Apple Silicon (familias M1, M2, M3, M4) al estar en formato MLX. Cabe con holgura en configuraciones de 16 GB o mas de memoria unificada; en equipos de 8 GB el margen es muy ajustado.
- GPU NVIDIA: no ejecutable directamente con CUDA, vLLM o TGI, ya que el formato de pesos es MLX. Requeriria conversion previa a otro formato, procedimiento no documentado en la informacion disponible.
- Alternativa en precisión completa: hacer uso del modelo base ilsp/Llama-Krikri-8B-Instruct-v1.5 incrementa los requisitos de memoria aproximadamente a 16 GB en bf16/fp16.
- Opciones de despliegue: la libreria MLX y su ecosistema de generacion de texto para Apple Silicon. Otros runners (llama.cpp, Ollama, TGI, vLLM) no estan confirmados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|---|
| ilsp/Llama-Krikri-8B-Instruct-v1.5-4bit-mlx | 8,2 B (4 bits) | No disponible | el, en | Llama 3.1 Community License | Safetensors MLX 4-bit | No |
| ilsp/Llama-Krikri-8B-Instruct-v1.5 (modelo base) | 8,2 B | No disponible | el, en | Llama 3.1 Community License | No disponible en esta informacion | No |
| Llama 3.1 8B Instruct (familia de referencia) | 8,03 B | 128.000 tokens segun la documentacion publica de Meta (no confirmado para este derivado) | Multilingue amplio | Llama 3.1 Community License | Safetensors, GGUF y otros | Si, multiples |

No se dispone de datos de rendimiento del modelo objeto de esta ficha ni de comparaciones verificadas frente a alternativas especializadas en griego, por lo que la tabla anterior solo contrasta caracteristicas estructurales y no calidad de resultados.

## Limitaciones y advertencias

- Idiomas limitados a griego moderno e ingles: no hay evidencia de un rendimiento aceptable en castellano u otros idiomas, y el comportamiento en ellos no esta documentado.
- Cuantizacion de 4 bits: implica una perdida de precision respecto al modelo base en precision completa; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada, lo que impide dimensionar correctamente la cache KV y planificar tareas de contexto largo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en dominios juridicos, medicos o administrativos en griego la salida debe validarse siempre con revision humana.
- Sesgos: no hay informacion sobre la composicion del corpus de entrenamiento ni sobre evaluaciones de sesgo, por lo que no pueden descartarse sesgos de genero, origen o ideologia presentes en los datos originales.
- Licencia Llama 3.1 Community License: impone condiciones al uso comercial, obligaciones de atribucion ("Built with Llama" y copia de la licencia) y limites aplicables a productos con un volumen muy elevado de usuarios activos mensuales. Es imprescindible revisar el texto completo antes de un despliegue comercial.
- Dependencia de plataforma: el formato MLX restringe el despliegue a hardware de Apple Silicon, lo que limita su uso en clusters con GPU NVIDIA o en entornos de servidor tradicionales.
- Madurez: el repositorio registra 0 descargas y 0 valoraciones, por lo que no existe validacion por parte de la comunidad ni historial de incidencias resueltas.
- Ausencia total de benchmarks y de documentacion de entrenamiento en la informacion disponible, lo que dificulta justificar su eleccion frente a alternativas de la misma categoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5-4bit-mlx
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5

No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.
