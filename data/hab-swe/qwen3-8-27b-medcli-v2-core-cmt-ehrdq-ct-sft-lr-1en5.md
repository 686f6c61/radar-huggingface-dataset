# hab-swe/Qwen3.8-27B-MedCLI-V2-Core-CMT-EHRDQ-CT-SFT-LR-1en5

## Resumen

El modelo `hab-swe/Qwen3.8-27B-MedCLI-V2-Core-CMT-EHRDQ-CT-SFT-LR-1en5` es un modelo multimodal de tipo image-text-to-text publicado en HuggingFace por el usuario `hab-swe`. Segun los metadatos del repositorio, cuenta con 27.356.728.560 parametros (aproximadamente 27,36 mil millones), se distribuye en formato safetensors, se ejecuta con la libreria `transformers` y esta etiquetado con la arquitectura `qwen3_5`, lo que lo situa en la familia Qwen. El pipeline declarado (`image-text-to-text`) indica que acepta imagenes y texto como entrada y genera texto como salida.

El repositorio tiene un acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargar los pesos. En el momento de la consulta registra 0 descargas y 0 "likes", y fue creado y actualizado el 17 de septiembre de 2026, por lo que se trata de una publicacion reciente y sin traccion comunitaria documentada. La licencia declarada en las etiquetas es Apache 2.0, aunque el acceso gated anade una capa adicional de control por parte del autor.

El nombre del repositorio sugiere un modelo afinado con SFT (supervised fine-tuning) sobre un backbone Qwen multimodal, orientado a un dominio concreto: los segmentos "MedCLI", "CMT", "EHRDQ" y "CT" apuntan a un enfoque medico-clinico (historia clinica electronica, tomografia computarizada). Se trata, no obstante, de una inferencia a partir del nombre del repositorio y no de informacion confirmada en la model card o en los resultados de busqueda disponibles. Es relevante ahora porque los modelos multimodales abiertos de ~27B parametros con licencia permisiva son candidatos habituales para despliegues on-premise en sectores regulados, donde el procesamiento de documentos e imagenes sin salida a la nube es un requisito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (27,36B), dato de safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no hay GGUF ni AWQ/GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con acceso gated) |
| Formato de pesos | safetensors (repo de 54,7 GB) |
| Modalidades | image-text-to-text (entrada de imagen y texto, salida de texto) |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 54,7 GB |
| Precision implicita de los pesos | ~2 bytes por parametro (54,7 GB / 27,36B), compatible con bf16/fp16 |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Etiquetas adicionales | conversational, endpoints_compatible, region:us |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion confirmada sobre la arquitectura es la etiqueta `qwen3_5` y el pipeline `image-text-to-text`. Esto implica un transformer multimodal con un codificador visual conectado a un decodificador de lenguaje, capaz de procesar tokens de imagen y de texto de forma conjunta y de generar respuestas conversacionales. No se dispone de informacion sobre el numero de capas, dimension del hidden state, numero de cabezas de atencion, tipo de positional encoding, mecanismo de atencion (full, sliding window o hibrido), ni sobre el encoder de vision empleado.

Tampoco hay datos publicados sobre el proceso de entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, la mezcla de datos multimodales (pares imagen-texto, OCR, grounding, VQA), ni si se aplicaron etapas de instruccion, RLHF o DPO adicionales. El sufijo del nombre del repositorio, `SFT-LR-1en5`, sugiere un ajuste supervisado con una tasa de aprendizaje del orden de 1e-5, pero esto es una interpretacion del identificador y no un dato documentado. Tampoco se describen innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica soporte para dialogos multi-turno.
- Entrada multimodal de imagenes y texto: puede recibir imagenes junto con instrucciones en lenguaje natural (pipeline image-text-to-text).
- Salida exclusivamente textual: el repositorio no declara generacion de imagenes ni de audio.
- Compatibilidad con endpoints de inferencia: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en la infraestructura de Inference Endpoints de HuggingFace.
- Especializacion probable en dominio medico-clinico: inferida del nombre del repositorio (`MedCLI`, `CMT`, `EHRDQ`, `CT`), no confirmada por documentacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas figura como no disponible).
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de audio o video: no disponibles.

## Casos de uso

- Analisis de imagenes medicas con informe textual: si la especializacion medica sugerida por el nombre del repositorio se confirma, el modelo podria recibir una imagen (por ejemplo, un corte de tomografia computarizada) junto a una pregunta en lenguaje natural y devolver una descripcion o un borrador de informe. Requiere validacion clinica antes de cualquier uso real.
- Extraccion estructurada de informacion de historias clinicas electronicas: dado el segmento `EHRDQ` del identificador, un uso plausible es convertir notas clinicas o documentos escaneados en campos estructurados (diagnosticos, medicacion, fechas), aprovechando la entrada de imagen y texto. No confirmado por documentacion.
- Asistente documental sobre repositorios de imagen y texto: indexar documentos con figuras, tablas o capturas y responder preguntas sobre ellos en conversaciones multi-turno, apoyandose en la etiqueta `conversational`.
- Preprocesado de pipelines de digitalizacion: clasificacion y descripcion automatica de lotes de imagenes (formularios, radiografias, capturas) antes de enviarlas a un sistema posterior, con la salida textual como campo intermedio.
- Prototipado e investigacion en entornos academicos: al ser un modelo de 27,36B con safetensors y libreria `transformers`, es adecuado para experimentos de fine-tuning adicional y evaluacion comparativa en un solo nodo con GPU de 80 GB.
- Despliegue on-premise en sectores regulados: la licencia Apache 2.0 permite uso comercial y modificacion, y el acceso gated facilita el control de quien descarga los pesos, lo que encaja con requisitos de trazabilidad en entornos sanitarios o financieros.
- Generacion de descripciones asistidas para accesibilidad: producir texto alternativo o descripciones de imagenes dentro de flujos internos de documentacion, sujeta a la calidad real del encoder visual (no evaluada en la informacion disponible).
- Evaluacion como baseline multimodal: servir de punto de partida en comparativas internas frente a otros modelos de ~27B antes de invertir en modelos mayores, dado su tamano manejable y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion (MMLU, MMMU, DocVQA, GSM8K, HumanEval u otros) y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a definiciones del termino frances "hab" y a una libreria, sin conexion con este identificador.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 55 GB solo para pesos (27,36B x 2 bytes), mas la cache KV y las activaciones. Consistente con el tamano de repo de 54,7 GB.
- VRAM estimada en INT8: aproximadamente 27-30 GB de pesos.
- VRAM estimada en INT4: aproximadamente 14-16 GB de pesos, con perdida de calidad no cuantificada en la informacion disponible.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o H200 en un unico dispositivo; alternativamente 2x A100 40 GB o 2x L40S 48 GB con tensor parallelism.
- GPU para INT8: A100 40 GB, L40S 48 GB, RTX A6000 48 GB.
- GPU de consumo: en bf16 no cabe en ninguna GPU de consumo actual. Con cuantizacion a 4 bits es previsible que quepa en RTX 4090 / RTX 3090 de 24 GB, aunque el encoder visual y la cache KV pueden agotar el margen disponible; en 16 GB el encaje es dudoso.
- Memoria unificada: los equipos Apple Silicon con 64 GB o mas podrian alojar el modelo cuantizado a 4 bits; no hay confirmacion de soporte.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM y TGI como servidores de inferencia (soporte concreto de la arquitectura `qwen3_5` no verificado), HuggingFace Inference Endpoints por la etiqueta `endpoints_compatible`. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: 54,7 GB de pesos mas espacio temporal durante la descarga y conversion.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento para este modelo, por lo que cualquier comparacion cuantitativa seria especulativa. La comparativa se limita a situarlo por categoria.

| Modelo | Parametros | Contexto | Licencia | Estado en la informacion disponible |
|---|---|---|---|---|
| hab-swe/Qwen3.8-27B-MedCLI-V2-Core-CMT-EHRDQ-CT-SFT-LR-1en5 | 27,36B | no disponible | apache-2.0 (gated) | Datos del repositorio HuggingFace |
| Alternativas multimodales abiertas de ~26-32B (familia Qwen-VL, InternVL, Gemma multimodal) | no disponible | no disponible | no disponible | No se han identificado alternativas concretas ni datos comparables en la informacion proporcionada |

No se ha encontrado en la busqueda web ningun modelo comparable ni evaluacion cruzada con este identificador. Se recomienda verificar la documentacion oficial de cada familia antes de establecer cualquier comparacion.

## Limitaciones y advertencias

- Model card vacia o no recuperada: no hay documentacion sobre datos de entrenamiento, evaluacion, sesgos o uso previsto, lo que impide auditar el modelo.
- Riesgo de alucinacion no cuantificado: al no existir benchmarks publicados, se desconoce la tasa de error en tareas factuales o de percepcion visual.
- Dominio potencialmente sanitario sin validacion clinica: si el modelo esta especializado en imagenes medicas, su uso en diagnostico o triaje requiere validacion regulatoria y supervision profesional; la licencia Apache 2.0 no exime de cumplir la normativa aplicable (por ejemplo, MDR en la UE).
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o si su entrenamiento se limita al ingles; conviene evaluarlo antes de usarlo en produccion multilingue.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos o historiales extensos.
- Sin archivos cuantizados publicados: el repositorio solo ofrece safetensors, por lo que el despliegue en hardware de consumo exige conversion y cuantizacion propias, con el consiguiente riesgo de degradacion.
- Acceso restringido: el uso comercial y la redistribucion estan sujetos a la aceptacion de las condiciones del autor, ademas de la licencia Apache 2.0.
- Senales de trazabilidad debiles: 0 descargas, 0 likes y una unica actualizacion el mismo dia de creacion; se desconoce si el modelo es funcional o si se trata de un experimento abandonado.
- Inconsistencia en el nombre: el identificador menciona "Qwen3.8-27B" mientras la etiqueta de arquitectura es `qwen3_5`; conviene confirmar la arquitectura real antes de integrarla en pipelines de inferencia.
- Ausencia de garantias del autor: al no haber model card detallada, no se documentan sesgos conocidos, limitaciones de contexto ni restricciones adicionales mas alla de la licencia y el gating.

## Enlaces

- HuggingFace (repositorio principal, acceso gated): https://huggingface.co/hab-swe/Qwen3.8-27B-MedCLI-V2-Core-CMT-EHRDQ-CT-SFT-LR-1en5
- Resultados de la busqueda web: no se ha encontrado ningun enlace relacionado con el modelo, su autor ni su dominio de aplicacion. Los enlaces recuperados (definiciones del termino "hab" en diccionarios franceses, una cuenta de Instagram de una libreria y una pagina de desambiguacion de Wikipedia) no guardan relacion con el modelo y se omiten por no aportar informacion tecnica.
