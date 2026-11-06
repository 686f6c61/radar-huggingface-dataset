# Cohere-AR/cohere-transcribe-ar-sft-v9-full

## Resumen

Cohere-AR/cohere-transcribe-ar-sft-v9-full es un modelo de reconocimiento automatico del habla (ASR) especializado en arabe e ingles, desarrollado por la organizacion Cohere-AR mediante ajuste fino supervisado (SFT) sobre el modelo base CohereLabs/cohere-transcribe-arabic-07-2026. Con 2.065.770.752 parametros (aproximadamente 2,07 mil millones), el modelo aborda un problema concreto y mal cubierto por los sistemas ASR genericos: la transcripcion de conversaciones telefonicas con alternancia de codigo (code-switching) entre arabe y ingles, un fenomeno muy frecuente en contextos profesionales y de atencion al cliente en el mundo arabofono.

El modelo se distribuye en formato safetensors bajo la libreria transformers y la arquitectura `cohere_asr`, lo que facilita su integracion en pipelines estandar de Hugging Face. Su publicacion es reciente (noviembre de 2026) y el repositorio aparece con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de la descarga. Aunque no se han publicado todavia descargas ni valoraciones, el interes tecnico reside en su enfoque vertical: en lugar de competir como ASR multilingue generalista, se posiciona como solucion de produccion para audio telefonico bilingue arabe-ingles.

La relevancia actual del modelo radica en dos factores. Primero, el ajuste fino sobre un modelo base ya especializado en arabe permite esperar un rendimiento superior al de whisper-like generalistas en acentos dialectales y ruido telefonico. Segundo, la etiqueta `endpoints_compatible` sugiere compatibilidad con la infraestructura de inferencia gestionada de Hugging Face, lo que reduce la friccion de despliegue para equipos que no quieren montar su propio stack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cohere_asr (transformer encoder-decoder orientado a ASR, segun tag de libreria) |
| Parametros totales | 2.065.770.752 (aprox. 2,07 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | arabe (ar), ingles (en), con soporte de code-switching ar-en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | CohereLabs/cohere-transcribe-arabic-07-2026 |
| Tipo de ajuste | SFT (supervised fine-tuning), version v9-full |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

La informacion publica disponible no detalla la arquitectura interna mas alla de la etiqueta `cohere_asr` y la referencia al modelo base CohereLabs/cohere-transcribe-arabic-07-2026. Por la nomenclatura y el tamano (2,07 B de parametros), es razonable situarla en la familia de modelos encoder-decoder para speech-to-text, pero no se confirma en la ficha si se trata de un transformer puro, un hibrido con capas convolucionales para el front-end de audio o un diseno con atencion lineal. No se dispone de informacion sobre el numero de tokens de audio o texto utilizados en el entrenamiento, la composicion del dataset, ni el uso de RLHF o DPO.

El aspecto de entrenamiento mejor documentado es el tipo de ajuste: SFT (supervised fine-tuning) sobre el modelo base, en una iteracion etiquetada como `v9-full`. Esto indica un proceso iterativo de refinamiento sobre datos supervisados, presumiblemente pares audio-transcripcion de conversaciones telefonicas bilingues, aunque la composicion exacta del dataset no se publica. La etiqueta `code-switching` en los tags confirma que el entrenamiento contempla utterances que mezclan arabe e ingles dentro de la misma frase, un escenario que los ASR monolingues suelen degradar gravemente.

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modulos de diarizacion. Tampoco se especifica si el modelo incluye puntuacion automatica, normalizacion de numeros o marcas de tiempo a nivel de palabra.

## Capacidades

- Transcripcion de voz a texto en arabe y en ingles, con soporte explicito de alternancia de codigo (code-switching) entre ambos idiomas dentro de una misma intervencion.
- Reconocimiento de audio telefonico: los tags incluyen `telephony`, lo que sugiere entrenamiento o evaluacion sobre audio de baja calidad, banda estrecha y ruido de canal.
- Generacion de transcripciones para el pipeline `automatic-speech-recognition` de transformers, lo que permite invocarlo con `pipeline("automatic-speech-recognition", model=...)`.
- Compatibilidad con endpoints gestionados de Hugging Face (tag `endpoints_compatible`), lo que habilita despliegue sin infraestructura propia.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo ASR, no un LLM conversacional.
- No se documentan capacidades de vision, audio-generacion, diarizacion de hablantes ni traduccion automatica.
- No se documenta modo de razonamiento (thinking mode) ni capacidades multimodales mas alla del audio de entrada.

## Casos de uso

- Atencion al cliente telefonica bilingue: el modelo transcribe llamadas donde el cliente alterna entre arabe y ingles (habitual en Emiratos Arabes Unidos, Catar o Arabia Saudi) y genera una transcripcion unica sin segmentar por idioma, adecuada para su volcado en un CRM.
- Cumplimiento y auditoria de call centers: transcripcion masiva de grabaciones telefonicas para revision de calidad, deteccion de palabras clave y auditoria regulatoria, aprovechando el entrenamiento sobre audio de telefonia.
- Subtitulado de reuniones y videoconferencias: generacion de subtitulos para reuniones internas de empresas del Golfo con equipos mixtos arabe-ingles, donde la alternancia de codigo es la norma y no la excepcion.
- Asistentes de voz para banca y seguros: alimentacion de un pipeline ASR + NLU donde la transcripcion precisa de numeros de cuenta, importes y nombres propios en ambos idiomas es critica para la exactitud del downstream.
- Investigacion en linguistica de contacto: analisis de corpus de habla bilingue ar-en para estudios de code-switching, ya que el modelo esta especificamente ajustado para no forzar la salida a un unico idioma.
- Generacion de datasets etiquetados: uso del modelo para pre-anotar grandes volumenes de audio telefonico y reducir el coste de anotacion humana, con revision posterior por anotadores nativos.
- Accesibilidad: transcripcion en tiempo casi real de contenido audiovisual para personas con discapacidad auditiva en comunidades arabofonas con alto nivel de ingles tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision FP16/BF16: aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y buffers de audio; en la practica, entre 6 y 8 GB para inferencia por lotes pequenos.
- VRAM estimada en cuantizacion INT8: alrededor de 2,1 GB de pesos, con requisito total tipico de 4 GB.
- VRAM estimada en cuantizacion INT4 (si se genera via herramientas externas, no documentada oficialmente): aproximadamente 1,1 GB de pesos, aunque la calidad de transcripcion puede degradarse.
- GPU consumer: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problemas en FP16. En GPUs de 8 GB (RTX 3070, RTX 4060) es viable en FP16 con lotes pequenos o en INT8.
- GPU de datacenter recomendadas para produccion: A100 40 GB, H100 80 GB y L40S para servir multiples peticiones concurrentes; una sola A10G o L4 (24 GB) puede alojar varias instancias en FP16.
- Opciones de despliegue: transformers (`pipeline`), TGI (Text Generation Inference no aplica; usar el servidor de ASR de Hugging Face o un wrapper FastAPI propio), Hugging Face Inference Endpoints (tag `endpoints_compatible`), y potencialmente vLLM si se adapta el modelo, aunque no esta documentado.
- llama.cpp y Ollama: no disponibles de forma nativa para arquitectura `cohere_asr` con safetensors; requeririan conversion a GGUF no documentada por el autor.
- Latencia y throughput: no disponible. Como referencia orientativa no publicada, un modelo de 2 B suele procesar audio a varias veces tiempo real en GPU modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cohere-AR/cohere-transcribe-ar-sft-v9-full | 2,07 B | ar, en (code-switching) | no disponible | no disponible | gated en Hugging Face |
| CohereLabs/cohere-transcribe-arabic-07-2026 (base) | no disponible | arabe | no disponible | no disponible | Hugging Face |
| Whisper large-v3 | 1,55 B | multilingue (99 idiomas, incluye ar y en) | 30 s por ventana | MIT | abierto |
| Whisper large-v3-turbo | 0,81 B | multilingue | 30 s por ventana | MIT | abierto |

La comparacion con Whisper es la mas pertinente por tamano y tarea. Whisper large-v3 ofrece cobertura de 99 idiomas y licencia MIT, pero no esta especificamente optimizado para code-switching ar-en ni para audio telefonico de banda estrecha. El modelo de Cohere-AR parte con ventaja en ese nicho concreto, a costa de una licencia no publicada y acceso restringido, lo que complica su adopcion comercial sin aclaracion previa del autor.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial permitido hasta que el autor publique los terminos. Cualquier despliegue en produccion debe verificar la licencia del modelo base CohereLabs/cohere-transcribe-arabic-07-2026, que puede imponer restricciones adicionales.
- Acceso gated: requiere aceptar condiciones en Hugging Face y aprobacion del autor, lo que ralentiza la integracion en CI/CD y la reproducibilidad de experimentos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia publica de validacion por parte de la comunidad ni de casos de exito en produccion.
- Ausencia total de benchmarks publicados: no se puede comparar objetivamente su WER frente a Whisper o el modelo base en condiciones controladas.
- Ambito limitado a arabe e ingles: no debe usarse para otros idiomas ni para variantes dialectales no cubiertas en el dataset de SFT.
- Riesgo de alucinacion en audio con ruido extremo o silencios largos: como todo ASR generativo, puede producir texto plausible no presente en el audio; se recomienda umbral de confianza y revision humana en dominios sensibles.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no se puede evaluar el sesgo por dialecto (egipcio, levantino, golfo, magrebi) ni por genero o edad del hablante.
- No se documenta soporte de marcas de tiempo, diarizacion ni puntuacion; si el caso de uso las requiere, habra que post-procesar o combinar con otros modelos.
- Formato unico safetensors sin variantes cuantizadas oficiales: dificulta el despliegue en hardware modesto sin trabajo adicional de conversion.
- Fecha de creacion y actualizacion (noviembre de 2026) muy reciente: el modelo puede estar en fase temprana y sufrir cambios o retiradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-sft-v9-full
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Organizacion Cohere-AR: https://huggingface.co/Cohere-AR
- Documentacion de pipelines ASR de transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#automatic-speech-recognition
- Hugging Face Inference Endpoints: https://huggingface.co/docs/inference-endpoints/index
