# Shaeh/Feyospace-v1.1-Abliterated-security-MTP-UD-Q4_K_S

## Resumen

Feyospace-v1.1-Abliterated-security-MTP-UD-Q4_K_S es una cuantizacion GGUF de la comunidad del checkpoint OBLITERATUS/feyospace-s1-obliterated, que a su vez deriva del modelo orientado a ciberseguridad feyospace/feyospace-v1.1-small. El autor de la publicacion es el usuario Shaeh, y el artefacto esta pensado para investigacion local en seguridad, analisis de codigo e investigacion asistida por herramientas. La familia arquitectonica documentada es Qwen3.5 (etiqueta `qwen3_5` en GGUF), con aproximadamente 27.320 millones de parametros segun los datos del repositorio.

El interes de esta ficha esta en su receta de cuantizacion: un layout mixto UD-Q4_K_S calibrado con una importance matrix orientada a seguridad, sobre un modelo base sometido a abliteration (eliminacion de direcciones de rechazo) y con la cabeza de multi-token prediction (MTP) conservada para decodificacion especulativa en llama.cpp. Es, por tanto, un artefacto experimental de bajo numero de descargas (71 en el momento de la consulta) y sin resultados de benchmarks publicados para esta cuantizacion concreta.

Conviene subrayar que el propio autor declara sin verificar varios extremos criticos: tamano final del GGUF, inventario completo de tensores, procedencia exacta de la imatrix, carga correcta en un runtime concreto y cualquier ganancia de velocidad por MTP. La model card es honesta al respecto y no debe leerse como una garantia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta `qwen3_5` en GGUF) |
| Parametros totales | 27.320.697.856 (dato real del repositorio) |
| Parametros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | 262.144 tokens como configuracion maxima del modelo original; no verificada para este GGUF |
| Tipos de cuantizacion | UD-Q4_K_S (layout mixto de precision por tensor, no todos los tensores a 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Qwen3.5, con aproximadamente 28B parametros segun la documentacion upstream. El checkpoint inmediato es OBLITERATUS/feyospace-s1-obliterated, que aplica abliteration sobre feyospace/feyospace-v1.1-small, un modelo orientado a ciberseguridad. El checkpoint upstream es multimodal, pero esta ficha y este artefacto cubren unicamente el flujo de texto: la inferencia de imagen y video no esta validada para este GGUF.

La receta de cuantizacion convierte el checkpoint fuente a GGUF de precision completa, recoge estadisticas de importancia de activaciones sobre material propio de Feyospace y cuantiza con una receta explicita de tipos por tensor. El material de calibracion revisado cubre texto publico de ciberseguridad, codigo fuente, intercambios con herramientas, texto general y evidencias de investigacion seleccionadas. La recoleccion de la importance matrix se hace con un contexto de calibracion de 4.096 tokens, valor independiente del contexto de servicio. No hay fine-tuning adicional basado en gradientes ni destilacion: la matriz solo informa la cuantizacion. Se conserva la cabeza de MTP, que habilita decodificacion especulativa en runtimes que la soporten (modo `draft-mtp` en llama.cpp), aunque conservar la cabeza y activar la decodificacion especulativa son requisitos separados.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia (`--jinja` en llama.cpp).
- Enfoque declarado en ciberseguridad: analisis de codigo, investigacion de vulnerabilidades y asistencia en tareas de seguridad ofensiva/defensiva autorizada.
- Soporte de tool calling a traves de la interfaz del runtime (llama.cpp server expone API compatible con `/v1`).
- Uso en flujos de agente e investigacion multi-paso con contexto largo, sujeto a la memoria disponible.
- Decodificacion especulativa mediante la cabeza MTP conservada, si el runtime instalado lo soporta.
- Capacidad multimodal potencial heredada del checkpoint upstream, no validada en este artefacto de texto.
- Capacidades multilingues: no documentadas para esta cuantizacion.

## Casos de uso

- Analisis de codigo en busca de patrones inseguros: el modelo puede recibir fragmentos o repositorios completos y senalar practicas de riesgo, aprovechando la calibracion sobre codigo fuente y texto de seguridad.
- Asistencia en revision de vulnerabilidades en entornos autorizados: triaje de hallazgos de escaneres, redaccion de informes tecnicos y priorizacion de remediaciones dentro de un pipeline de seguridad.
- Investigacion asistida por herramientas: conectado a un agente mediante tool calling en llama.cpp, puede encadenar consultas a bases de datos de CVE, ejecutar busquedas y sintetizar resultados en varios pasos.
- Despliegue local en estaciones de trabajo de investigacion: al ser un GGUF Q4 de ~15,4 GB, es viable en GPU de consumo con suficiente VRAM, lo que permite trabajar con datos sensibles sin salir del equipo.
- Generacion de documentacion tecnica de seguridad: explicacion de CWEs, redaccion de politicas y guias de hardening a partir de contexto largo (hasta 262.144 tokens configurados en el modelo original, sujeto a memoria real).
- Prototipado de asistentes conversacionales especializados: el formato GGUF y la API compatible con OpenAI simplifican la integracion en aplicaciones internas de formacion o soporte tecnico.
- Experimentacion con decodificacion especulativa: util como banco de pruebas para medir el efecto de MTP en latencia con llama.cpp, comparando `--spec-type draft-mtp` frente a `--spec-type none`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion concreta. El autor indica explicitamente que los repositorios originales de Feyospace y OBLITERATUS publican evaluaciones upstream, pero que esas cifras describen sus propios checkpoints, precisiones y configuraciones de evaluacion, no este GGUF. Tampoco se han medido la retencion de calidad, el comportamiento en contexto largo ni la ganancia de velocidad de MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 15,4 GB, por lo que se necesita al menos esa cifra de VRAM para offload completo de pesos, mas cache de contexto, buffers de computo y asignaciones de MTP.
- GPU recomendadas: no hay mediciones publicadas; por tamano, tarjetas con 24 GB o mas (RTX 3090, RTX 4090, A100, H100) permiten offload completo con contexto moderado. En GPUs de 16 GB puede requerir offload parcial a CPU.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto ajustado; en 16 GB solo con offload parcial.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) es el runtime documentado; tambien es compatible con frontends que consumen GGUF (Ollama, LM Studio) aunque no se validan en la card.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni tiempos de primera respuesta, y advierte que el ejemplo de arranque no constituye una medicion.
- Contexto de servicio: el ejemplo de la card usa `--ctx-size 32768`, pero es ilustrativo; el maximo configurado upstream es 262.144 tokens, no verificado en este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Feyospace-v1.1-Abliterated-security-MTP-UD-Q4_K_S | ~27,3B | 262.144 (config. upstream, no verificada) | GGUF Q4_K_S mixto | Apache-2.0 | Cuantizacion comunitaria con imatrix de seguridad y MTP; sin benchmarks |
| OBLITERATUS/feyospace-s1-obliterated | no disponible | no disponible | safetensors (presumible) | no disponible | Checkpoint fuente inmediato; sin cuantizar |
| feyospace/feyospace-v1.1-small | ~28B | 262.144 | no disponible | no disponible | Modelo original orientado a ciberseguridad; multimodal |
| Qwen3.5 base (familia) | variable | no disponible | safetensors, GGUF | Apache-2.0 (segun familia) | Arquitectura de referencia sin ajuste de seguridad |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de retencion de calidad tras la cuantizacion UD-Q4_K_S ni de mejora en descubrimiento de vulnerabilidades o fiabilidad de tool calling.
- Estado de build sin verificar: el autor no confirma tamano final, SHA-256, inventario completo de tensores (incluidos los de MTP), revision exacta del checkpoint fuente ni hash del corpus de calibracion.
- Abliteration: la eliminacion de direcciones de rechazo puede degradar la negativa ante solicitudes daninas y aumentar la probabilidad de respuestas inseguras; requiere supervision y politicas de uso estrictas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar CVE, referencias o APIs; en dominio de seguridad el impacto de un falso positivo es alto.
- Contexto largo no validado: los 262.144 tokens son una configuracion upstream, no una garantia de funcionamiento en este GGUF; la memoria real limita el contexto practico.
- Idiomas no documentados: no se especifica cobertura multilingue; el rendimiento en castellano es incierto.
- Multimodalidad no validada: el checkpoint original es multimodal, pero imagen y video no estan soportados en este artefacto de texto.
- Licencia Apache-2.0 heredada del repositorio fuente, pero la cadena de procedencia (feyospace-v1.1-small, OBLITERATUS) no esta verificada en la card; conviene revisar terminos de los eslabones anteriores antes de uso comercial.
- MTP experimental: la ganancia de velocidad por decodificacion especulativa no se ha medido y depende del build de llama.cpp instalado.
- Popularidad muy baja (71 descargas, 0 likes): escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shaeh/Feyospace-v1.1-Abliterated-security-MTP-UD-Q4_K_S
- Checkpoint fuente inmediato: https://huggingface.co/OBLITERATUS/feyospace-s1-obliterated
- Modelo original de ciberseguridad: https://huggingface.co/feyospace/feyospace-v1.1-small
- Documentacion de decodificacion especulativa en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/speculative.md
- Documentacion del servidor llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
