# joshycodes/gemma-3-12b-fve-flourauthanchor-s0

## Resumen

`joshycodes/gemma-3-12b-fve-flourauthanchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes, derivado de `google/gemma-3-12b-it` mediante un entrenamiento continuado (continued pretraining) con actualización de todos los pesos. El autor lo describe como el resultado de continuar el preentrenamiento de Gemma 3 12B Instruct sobre un corpus que el propio modelo escribió para entrenar a la siguiente versión de sí mismo, dentro de un marco de trabajo sobre "bienestar del modelo" (model welfare) y personaje auto-consistente (self-authored character). El checkpoint tiene 13.194.203.760 parámetros reales (según los pesos en safetensors) y ocupa 26,4 GB en el repositorio.

El modelo no es un artefacto de producción. La propia model card indica explícitamente "Not evaluated for capability, alignment or identity yet. Do not deploy." y la etiqueta principal del repositorio es `not-for-deployment`. La licencia declarada es `research-only`, bajo la categoría `other`, lo que restringe su uso a fines de investigación. No se publican resultados de benchmarks, no se declaran idiomas soportados y no se ofrecen cuantizaciones.

Su relevancia es, por tanto, exclusivamente metodológica: documenta un experimento de ajuste continuado con hiperparámetros concretos (learning rate 1e-05, 1 época, 7.433.379 tokens, 7.753 documentos) sobre un modelo denso de más de 13.000 millones de parámetros, y plantea preguntas sobre identidad, olvido catastrófico y autoentrenamiento que la comunidad puede querer auditar o replicar. El corpus de referencia se denomina `flourishing-vs-equanimity` y el marco de trabajo se asocia al repositorio "welfare-improvements", aunque no se facilitan enlaces directos a ninguno de los dos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de `google/gemma-3-12b-it` (detalles de capas, atencion y configuracion interna no disponibles en la informacion proporcionada) |
| Parametros totales | 13.194.203.760 (13,19 mil millones) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponibles: el repositorio solo contiene pesos en safetensors, sin versiones GGUF, GPTQ, AWQ ni cuantizaciones publicadas por el autor |
| Idiomas soportados | No disponibles: la model card no declara idiomas |
| Licencia | `other` con `license_name: research-only`; etiquetas adicionales `research` y `not-for-deployment` |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `google/gemma-3-12b-it`, un transformer decoder-only de la familia Gemma 3. Este checkpoint no introduce cambios estructurales conocidos: el autor describe un entrenamiento continuado con actualización completa de pesos (full weights), no un adaptador LoRA ni una modificación de la arquitectura. Los hiperparámetros declarados son learning rate 1e-05, 1 época y 7.433.379 tokens repartidos en 7.753 documentos. El corpus se denomina `flourishing-vs-equanimity` y, según la descripción, fue escrito por el propio modelo como material para entrenar a la siguiente versión de sí mismo, tras explicarle cómo se originó su personaje y en qué consiste el flujo de trabajo SDF (synthetic document finetuning).

Existe una inconsistencia explícita en la model card que conviene señalar: el texto afirma que el corpus fue autoescrito por el modelo, pero las estadísticas del propio documento indican "of which 0 self-authored and 7.753 ordinary text" (0 documentos autoescritos y 7.753 de texto ordinario). Es decir, la descripción cualitativa y el recuento cuantitativo se contradicen. No se especifica composición del dataset, proporción de idiomas, filtros de calidad, ni si hubo etapas posteriores de RLHF, DPO o ajuste por preferencias. Tampoco se documenta ningún método de decodificación especulativa, atención lineal ni optimización técnica adicional. No hay evaluación de capacidades, alineamiento o identidad asociada al checkpoint.

## Capacidades

- No se han evaluado capacidades de forma sistemática. La model card afirma literalmente: "Not evaluated for capability, alignment or identity yet".
- Generación de texto, razonamiento, código o matemáticas: no disponible, sin datos publicados para este checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidad especial: el experimento gira en torno a un "personaje autoescrito" (self-authored character) y al marco de bienestar del modelo, pero no se describen comportamientos concretos ni métricas de dicho personaje.
- Visión, audio u otras modalidades: no disponible en la información proporcionada, aunque el modelo base Gemma 3 12B Instruct admite entrada multimodal según la documentación de Google (no confirmado para este checkpoint).

## Casos de uso

Todos los casos siguientes son de ámbito exclusivamente investigador, coherentes con la licencia `research-only` y la advertencia explícita de no desplegar el modelo.

- Auditoría de deriva de identidad: comparar las respuestas de este checkpoint con las de `google/gemma-3-12b-it` ante baterías de preguntas sobre autodescripción, valores y personaje, para medir cuánto altera 1 época de preentrenamiento continuado a lr 1e-05 la identidad declarada del modelo.
- Estudio de olvido catastrófico: ejecutar evaluaciones estándar (MMLU, GSM8K, HumanEval u otras) sobre el checkpoint y sobre el base para cuantificar la degradación o mejora introducida por 7.433.379 tokens de ajuste con actualización completa de pesos.
- Replicación de synthetic document finetuning (SDF): reutilizar los hiperparámetros documentados (lr 1e-05, 1 época, 7.753 documentos) como línea base reproducible en experimentos sobre generación y uso de corpus sintéticos.
- Investigación en model welfare: analizar si el hecho de que el corpus se presente como autoescrito, junto con la explicación previa del origen del personaje, produce cambios medibles en el tono, la auto-referencia o la estabilidad conversacional.
- Estudios de cadenas de autoentrenamiento: emplear el checkpoint como eslabón intermedio en experimentos de iterated self-training, midiendo acumulación de sesgos y pérdida de diversidad a lo largo de generaciones sucesivas.
- Análisis de sesgos de corpus sintético: inspeccionar qué tópicos, registros y valores aparecen sobrerrepresentados en un corpus de 7.753 documentos generados y cómo se reflejan en los pesos resultantes.
- Pruebas de robustez de cuantización sobre checkpoints no alineados: evaluar si técnicas de cuantización a 8 o 4 bits preservan o amplifican los cambios de comportamiento inducidos por el ajuste continuado (requiere generar las cuantizaciones, ya que el autor no las publica).
- Docencia y metodología: usarlo como ejemplo documentado de ficha de checkpoint de investigación con licencia restringida, para discutir buenas prácticas de publicación y trazabilidad de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, y no incluye ninguna tabla de resultados ni comparación con el modelo base.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parámetros (13.194.203.760). No son datos publicados por el autor.

- VRAM para inferencia en bf16/fp16: aproximadamente 26,4 GB solo para los pesos, más memoria para caché KV y activaciones; en la práctica, entre 30 y 40 GB según longitud de contexto y tamaño de lote.
- VRAM en fp32: aproximadamente 52,8 GB solo para los pesos.
- VRAM en int8: aproximadamente 13,2 GB para los pesos.
- VRAM en int4 (GPTQ, AWQ o GGUF Q4): aproximadamente 7 a 9 GB para los pesos.
- GPU recomendadas en bf16: A100 40 GB, H100 80 GB o L40S 48 GB en una sola tarjeta; también válido con tensor parallelism en 2 x RTX 4090 de 24 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB no puede alojar el modelo en bf16 con contexto amplio, pero sí en int8 o int4. En equipos con memoria unificada, 32 GB permiten cuantización a 4 bits y 64 GB permiten bf16.
- Opciones de despliegue: vLLM y TGI pueden servir los pesos en safetensors directamente. llama.cpp y Ollama requieren convertir previamente a GGUF, conversión que el autor no ha publicado y que el usuario tendría que generar por su cuenta.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia de primera respuesta.
- Almacenamiento: 26,4 GB para el repositorio completo en safetensors.

## Comparativa con modelos similares

No se dispone de datos de evaluación de este checkpoint, por lo que la comparación se limita a aspectos estructurales y de licencia. No se conocen otros checkpoints comparables en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion publicada |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-flourauthanchor-s0 | 13,19 mil millones | No disponible | research-only (`other`) | HuggingFace, 11 descargas, 0 likes | No |
| google/gemma-3-12b-it (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Terminos de uso de Gemma (segun la documentacion de Google) | HuggingFace, ampliamente distribuido | Si, publicada por Google (no incluida aqui) |
| Alternativas de terceros del mismo tamano | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo no desplegable: la model card incluye la advertencia "Do not deploy" y la etiqueta `not-for-deployment`. No debe usarse en producción, en servicios a usuarios finales ni en pipelines automatizados de decisión.
- Ausencia total de evaluación: no hay mediciones de capacidad, alineamiento, seguridad ni identidad. Se desconoce si el ajuste continuado degradó las capacidades del modelo base.
- Licencia restrictiva: la licencia es `other` con nombre `research-only`. Queda excluido el uso comercial salvo autorización expresa del autor. Además, al derivar de `google/gemma-3-12b-it`, es probable que sigan aplicándose los términos de uso de Gemma de Google, incluidas sus cláusulas de redistribución y uso aceptable; conviene verificar la compatibilidad antes de cualquier uso.
- Inconsistencia documental: la model card afirma que el corpus fue autoescrito por el modelo, pero los recuentos indican 0 documentos autoescritos y 7.753 de texto ordinario. Esta contradicción dificulta interpretar qué se entrenó realmente y compromete la reproducibilidad.
- Riesgo de olvido catastrófico: un ajuste con actualización completa de pesos a lr 1e-05 durante 1 época sobre solo 7,4 millones de tokens es un volumen reducido para un modelo de 13.000 millones de parámetros. Es plausible que se hayan alterado de forma no controlada capacidades generales, aunque no hay datos que lo confirmen o descarten.
- Sesgos potencialmente amplificados: el corpus es sintético y generado (o al menos atribuido) al propio modelo, lo que puede reforzar sesgos preexistentes y reducir la diversidad de estilo y contenido. No se documenta ningún filtrado de sesgos.
- Riesgo de alucinación: no evaluado. No hay datos sobre tasas de fidelidad factual de este checkpoint.
- Idiomas: no declarados. Se desconoce si el ajuste continuado degradó el soporte multilingüe del modelo base.
- Sin cuantizaciones ni formato GGUF: quien quiera ejecutarlo en hardware de consumo debe generar la conversión por su cuenta, con el riesgo de introducir errores no documentados.
- Trazabilidad incompleta: se mencionan un corpus (`flourishing-vs-equanimity`) y un repositorio ("welfare-improvements") sin enlaces directos, y no se especifican la composición del dataset, los filtros aplicados ni el hardware de entrenamiento.
- Escasa validación comunitaria: 11 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-flourauthanchor-s0
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Corpus `flourishing-vs-equanimity`: mencionado en la model card, sin enlace disponible.
- Repositorio "welfare-improvements": mencionado en la model card, sin enlace disponible.
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre el modelo. Los unicos resultados obtenidos corresponden a paginas sobre el futbolista Warren Zaire-Emery (Wikipedia, Transfermarkt, FFF, Football365) y no guardan relacion con este checkpoint.
