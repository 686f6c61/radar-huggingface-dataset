# hab-swe/Qwen3.8-27B-MedCLI-CMT-EHRDQ-CT-SFT-100-turns

## Resumen

El modelo `hab-swe/Qwen3.8-27B-MedCLI-CMT-EHRDQ-CT-SFT-100-turns` es un ajuste fino supervisado (SFT) publicado por el usuario `hab-swe` en HuggingFace. Por la nomenclatura del repositorio y la etiqueta de arquitectura `qwen3_5`, se trata de una variante derivada de la familia Qwen3.5, con 27.356.728.560 parametros totales (aproximadamente 27,36 mil millones) y una modalidad de entrada imagen-texto, segun el campo `pipeline: image-text-to-text` y la etiqueta `image-text-to-text`. El repositorio ocupa 54,7 GB, un tamano coherente con pesos almacenados en precision BF16 (2 bytes por parametro), y usa `safetensors` como formato de pesos con la libreria `transformers`.

La denominacion del modelo sugiere un ajuste orientado a dominios clinicos y medicos: los segmentos `MedCLI` (interfaz clinica medica), `EHRDQ` (posiblemente historiales clinicos electronicos y cuestionarios) y `CT` (tomografia computarizada) apuntan a un caso de uso de conversacion medica con soporte de imagenes radiologicas, mientras que el sufijo `SFT-100-turns` indica un entrenamiento supervisado sobre conversaciones de hasta 100 turnos. Esta interpretacion procede unicamente del nombre del repositorio y no esta confirmada por ninguna documentacion publicada, ya que la model card no ha sido indexada ni los resultados de busqueda web aportan informacion tecnica sobre el modelo.

El modelo es relevante por dos motivos practicos: primero, porque ilustra la tendencia de ajustar modelos multimodales de gran tamano sobre datos clinicos especializados con ventanas conversacionales largas, un escenario exigente en coherencia multi-turno; segundo, porque su acceso esta restringido (gated), lo que obliga a aceptar condiciones en HuggingFace antes de descargarlo. En el momento de la consulta acumula 0 descargas y 1 like, y fue creado el 13 de septiembre de 2026 con licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de arquitectura: `qwen3_5`, compatible con transformers) |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos `safetensors`; no se listan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (54,7 GB en el repositorio, consistente con BF16 a 2 bytes por parametro) |
| Modalidad | imagen-texto a texto (`image-text-to-text`) |
| Libreria | transformers |
| Tipo de ajuste | SFT (supervised fine-tuning), segun el sufijo del nombre del repositorio |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Compatibilidad de despliegue | etiqueta `endpoints_compatible` |
| Region declarada | `us` |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura interna mas alla de la etiqueta `qwen3_5`, que situa al modelo en la familia Qwen3.5, y del pipeline declarado `image-text-to-text`, que implica un codificador visual acoplado a un decodificador de lenguaje. No hay datos disponibles sobre si se trata de un transformer denso, de una mezcla de expertos (MoE) con parametros activos reducidos, ni de una arquitectura hibrida. Tampoco se especifica el mecanismo de atencion, la ventana de contexto efectiva ni la estrategia de entrenamiento multimodal (por ejemplo, si el vision encoder se congela durante el ajuste).

Respecto al entrenamiento, el nombre del repositorio indica un ajuste fino supervisado (`SFT`) con conversaciones de hasta 100 turnos (`100-turns`) sobre un corpus clinico cuya composicion exacta se desconoce. No hay informacion publicada sobre el numero de tokens de entrenamiento, la mezcla de datos, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre decisiones de preprocesado de imagenes medicas. Cualquier afirmacion adicional al respecto seria especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno: la etiqueta `conversational` y el sufijo `100-turns` apuntan a un ajuste especifico para mantener coherencia en dialogos largos.
- Procesamiento de imagenes: el pipeline `image-text-to-text` indica entrada conjunta de imagen y texto, presumiblemente imagenes medicas segun la nomenclatura del repositorio.
- Razonamiento sobre dominios clinicos: inferido unicamente del nombre (`MedCLI`, `EHRDQ`, `CT`); no confirmado por documentacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio o video: no disponible; la modalidad declarada es solo imagen-texto.

## Casos de uso

Debido a la ausencia de documentacion publicada, los siguientes casos se derivan de la modalidad declarada y de la nomenclatura del repositorio, no de validaciones oficiales del autor:

- Seguimiento clinico conversacional prolongado: el ajuste sobre 100 turnos encaja con escenarios de anamnesis o seguimiento de paciente en los que el contexto acumulado es largo y debe mantenerse coherente a lo largo de toda la sesion.
- Interpretacion asistida de imagenes de tomografia computarizada: la etiqueta `CT` sugiere entrenamiento especifico para describir o comentar hallazgos en estudios de TC junto a texto clinico asociado.
- Cumplimentacion y consulta de historiales clinicos electronicos: el segmento `EHRDQ` apunta a tareas de extraccion, resumen o pregunta-respuesta sobre registros de salud electronicos y cuestionarios estructurados.
- Generacion de informes radiologicos preliminares: dado su caracter multimodal, podria emplearse para redactar borradores de informes a partir de una imagen y datos de contexto, siempre con supervision facultativa.
- Triaje y apoyo a la decision clinica: uso como capa de resumen previo en flujos asistenciales, integrado en un sistema mayor y nunca como sustituto del criterio medico.
- Investigacion academica en NLP clinico: util como punto de partida para comparativas de ajuste fino sobre dominios medicos con modelos multimodales de ~27B parametros.
- Asistencia mediante tecnicas de recuperacion aumentada (RAG) sobre literatura medica: el modelo podria generar respuestas apoyadas en documentos recuperados, aprovechando su ventana conversacional.
- Prototipado de asistentes de formacion para personal sanitario: simulacion de entrevistas clinicas multi-turno con soporte de imagenes en entornos controlados.

Ninguno de estos casos debe desplegarse en produccion sin una evaluacion clinica y regulatoria previa, dado que no existen benchmarks publicados ni validacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no ha sido indexada en los resultados de busqueda y el autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de tareas medicas o de vision.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (27,36 mil millones) y del tamano del repositorio (54,7 GB):

- Pesos en BF16: aproximadamente 54,7 GB solo de pesos. Con cache KV y activaciones, la inferencia realista requiere del orden de 60-70 GB de VRAM para ventanas de contexto moderadas.
- Pesos en FP8 o INT8: aproximadamente 27-29 GB, lo que permite su ejecucion en una sola GPU de 40 GB (A100 40GB, L40S 48GB) con margen limitado.
- Pesos en INT4: aproximadamente 14-16 GB, viable en GPUs de consumo como RTX 4090 (24 GB) o RTX 5090, siempre que existan cuantizaciones publicadas, cosa que no esta confirmada en el repositorio.
- GPU recomendadas para BF16: A100 80GB, H100 80GB o varias GPUs de 48 GB en paralelo. Para INT8/FP8: A100 40GB, L40S o H100.
- Compatibilidad con GPU de consumo: posible unicamente en cuantizacion INT4, y no hay artefactos de cuantizacion publicados por el autor en la informacion disponible.
- Opciones de despliegue: la etiqueta `endpoints_compatible` indica compatibilidad con HuggingFace Inference Endpoints. Para servidores propios, `transformers` es la libreria declarada; el soporte en vLLM, TGI, llama.cpp u Ollama no esta confirmado y, en el caso de llama.cpp/Ollama, exigiria conversiones GGUF que no aparecen en el repositorio.
- Latencia y throughput: no disponibles.

Advertencia adicional: el acceso es restringido, por lo que es necesario aceptar las condiciones del repositorio en HuggingFace antes de descargar los pesos.

## Comparativa con modelos similares

La busqueda web no ha devuelto resultados relevantes sobre este modelo ni sobre el autor. Todos los resultados obtenidos corresponden a entidades homonimas sin relacion tecnica (una galeria de arte y una libreria en Nantes). Por tanto, no hay datos comparativos verificables.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hab-swe/Qwen3.8-27B-MedCLI-CMT-EHRDQ-CT-SFT-100-turns` | 27,36 mil millones | no disponible | imagen-texto | Apache 2.0 | gated, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer comparaciones con modelos de la misma categoria (ajustes multimodales clinicos de ~27B parametros) sin recurrir a datos no verificados.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con detalles de entrenamiento, datos, evaluacion o uso previsto, lo que impide auditar el modelo.
- Riesgo elevado de alucinacion en dominio clinico: sin evaluacion publicada, no puede asumirse fiabilidad en la interpretacion de imagenes radiologicas ni en la generacion de contenido medico.
- Sesgos desconocidos: se desconoce la composicion del dataset de ajuste, por lo que no pueden caracterizarse sesgos demograficos, de origen de datos ni de equipamiento de imagen.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del que predomine en el corpus de ajuste.
- Longitud de contexto no especificada: no es posible planificar flujos que dependan de ventanas concretas, pese a que el ajuste se anuncia sobre 100 turnos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero debe verificarse que la licencia del modelo base Qwen3.5 y de los datos de ajuste sean compatibles, algo que no se documenta.
- Riesgo regulatorio: cualquier uso en contexto sanitario esta sujeto a normativa de dispositivos medicos y proteccion de datos (RGPD y normativa equivalente); el modelo no declara conformidad con ninguna de ellas.
- Acceso restringido: la descarga esta condicionada a la aceptacion de terminos, lo que puede limitar la reproducibilidad en entornos de investigacion automatizados.
- Trazabilidad baja: con 0 descargas y 1 like, no existe comunidad que haya reportado comportamiento real, problemas de inferencia o calidad de salida.
- Cadena de confianza: se trata de un ajuste de terceros (`hab-swe`) sobre un modelo base de otra organizacion, sin publicacion de recipe de entrenamiento, hiperparametros ni codigo.

## Enlaces

- HuggingFace: https://huggingface.co/hab-swe/Qwen3.8-27B-MedCLI-CMT-EHRDQ-CT-SFT-100-turns
- Resultados de busqueda web: sin enlaces relevantes. Las consultas devolvieron unicamente paginas sobre entidades homonimas sin relacion con el modelo (definicion del termino frances «hab», Librairie HAB y HAB Galerie en Nantes).
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
