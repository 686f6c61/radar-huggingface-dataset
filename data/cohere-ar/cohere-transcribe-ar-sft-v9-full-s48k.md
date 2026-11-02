# Cohere-AR/cohere-transcribe-ar-sft-v9-full-s48k

## Resumen

Cohere-AR/cohere-transcribe-ar-sft-v9-full-s48k es un modelo de reconocimiento automatico del habla (ASR) especializado en arabe e ingles, desarrollado por la organizacion Cohere-AR como un ajuste fino supervisado (SFT) del modelo base CohereLabs/cohere-transcribe-arabic-07-2026. El modelo esta disenado para transcripcion de audio en escenarios de code-switching (alternancia entre arabe e ingles dentro de una misma conversacion) y en dominios de telefonia, segun indican sus etiquetas. Con 2.065.770.752 parametros (aproximadamente 2,07 mil millones), se situa en la gama media de modelos ASR y se distribuye en formato safetensors a traves de la libreria transformers.

El modelo resulta relevante porque aborda uno de los problemas practicos mas dificiles en ASR: la transcripcion de habla bilingue arabe-ingles en condiciones de telefonia, donde la calidad del audio es baja y los hablantes cambian de idioma de forma espontanea. La mayoria de los sistemas ASR comerciales estan optimizados para un unico idioma o para pares de idiomas de alto recursos, por lo que un ajuste especifico sobre un modelo base arabe representa una alternativa especializada para este nicho.

El acceso al modelo esta restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de poder descargar los pesos. El repositorio ocupa 4,1 GB y en el momento de la consulta no registra descargas ni likes, lo que sugiere una publicacion reciente o de circulacion limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en transformers; arquitectura concreta no especificada en la informacion proporcionada) |
| Parametros totales | 2.065.770.752 (~2,07 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar), ingles (en); soporte de code-switching ar-en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | CohereLabs/cohere-transcribe-arabic-07-2026 |
| Libreria | transformers |
| Tamano del repositorio | 4,1 GB |
| Acceso | restringido (gated) |
| Dominio declarado | telefonia, code-switching |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se trata de un modelo de transformers para reconocimiento automatico del habla, con 2.065.770.752 parametros y pesos en safetensors. El modelo es un ajuste fino supervisado (SFT) del checkpoint CohereLabs/cohere-transcribe-arabic-07-2026, segun los metadatos de `base_model` y `base_model:finetune`. El sufijo del identificador ("sft-v9-full-s48k") sugiere una novena iteracion de ajuste supervisado sobre un conjunto de datos completo, con una frecuencia de muestreo de 48 kHz implicita en la nomenclatura, aunque este extremo no se confirma en la informacion proporcionada.

No se dispone de datos sobre el numero de tokens de audio utilizados, la composicion del dataset de entrenamiento, la presencia de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). Tampoco se documentan detalles sobre el preprocesamiento de audio, el tokenizador o la funcion de perdida empleada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en arabe e ingles.
- Transcripcion con soporte de code-switching arabe-ingles dentro de una misma emision.
- Orientacion a audio de telefonia (canales de banda estrecha, posible ruido y compresion).
- Integracion con la libreria transformers y el pipeline `automatic-speech-recognition`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de traduccion, diarizacion de hablantes, puntuacion automatica, marcas de tiempo a nivel de palabra ni tool calling.

## Casos de uso

- Transcripcion de centros de contacto bilingues arabe-ingles: el modelo puede procesar grabaciones de llamadas donde el cliente alterna entre ambos idiomas, aprovechando su entrenamiento especifico en code-switching y telefonia para reducir errores en los puntos de cambio de idioma.
- Analitica de calidad en atencion al cliente: transcripcion masiva de llamadas para extraer metricas (motivos de llamada, sentimiento, cumplimiento) en mercados del Golfo donde el ingles y el arabe coexisten en la operativa diaria.
- Subtitulado y documentacion de reuniones: generacion de transcripciones de reuniones internas de equipos bilingues, como paso previo a la generacion de actas o resumenes con un LLM posterior.
- Investigacion en linguistica de contacto: corpus de habla espontanea arabe-ingles para estudios de alternancia de codigo, donde la fidelidad de transcripcion en los cambios de idioma es critica.
- Verificacion de cumplimiento normativo: transcripcion de grabaciones telefonicas reguladas (por ejemplo, en banca o seguros) en entornos donde se exige conservar registro textual de las conversaciones en ambos idiomas.
- Prototipado de asistentes de voz para telefonia: uso del modelo como componente ASR en pipelines de IVR o agentes telefonicos que deben entender consultas en arabe con incrustaciones en ingles.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenidos audiovisuales bilingues de telefonia o difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 8,3 GB solo para pesos (2,07 mil millones de parametros x 4 bytes), mas memoria para activaciones y buffers de audio.
- VRAM estimada en fp16/bf16: alrededor de 4,1 GB para pesos, lo que encaja con el tamano del repositorio (4,1 GB).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,1 GB para pesos; en 4 bits, alrededor de 1,1 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: para fp16, una GPU con 8-12 GB de VRAM es suficiente (RTX 3060 12 GB, RTX 4070, RTX 4080, L4, A10G). Para fp32 o lotes grandes, A100 o H100 ofrecen mayor margen.
- Cabe en GPU de consumo: si, en modelos con al menos 8 GB de VRAM en fp16 y en GPUs de 4-6 GB con cuantizacion (sujeto a que el runtime soporte cuantizacion para esta arquitectura concreta, no confirmado).
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), servidores compatibles con endpoints de HuggingFace. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR y no un LLM de decodificacion autoregresiva estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| Cohere-AR/cohere-transcribe-ar-sft-v9-full-s48k | ~2,07 mil millones | ar, en (code-switching) | no disponible | no disponible | gated | Especializado en telefonia y code-switching ar-en |
| CohereLabs/cohere-transcribe-arabic-07-2026 (modelo base) | no disponible | arabe (principal) | no disponible | no disponible | no disponible | Checkpoint base del que deriva el ajuste |
| Whisper large-v3 (OpenAI) | ~1,55 mil millones | multilingue (incluye ar, en) | 30 s de audio por ventana | MIT | abierto | Referencia generalista; no especializado en code-switching ni telefonia |
| MMS (Meta) | ~1 mil millones (por idioma) | multilingue | no disponible | CC-BY-NC 4.0 | abierto | Cobertura amplia de idiomas, pero no orientado a code-switching |

La comparativa con Whisper y MMS se ofrece como referencia de categoria; no se dispone de resultados de benchmarks que permitan comparar rendimiento numerico entre estos modelos y el modelo descrito.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en HuggingFace para descargar los pesos, lo que puede limitar la reproducibilidad y el despliegue automatizado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar las condiciones antes de usarlo en produccion.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos dialectales (arabe estandar frente a dialectos regionales), de genero o de acento.
- Riesgo de alucinacion en ASR: como todo modelo de transcripcion, puede generar texto plausible en segmentos de audio ruidoso o ininteligible, especialmente en telefonia de baja calidad.
- Limitaciones de idioma: solo se declaran arabe e ingles; no se garantiza el rendimiento en otros idiomas ni en variedades dialectales no representadas en el entrenamiento.
- Sin datos de benchmarks: la ausencia de metricas publicas (WER, CER) impide validar el rendimiento frente a alternativas; se recomienda una evaluacion propia sobre el dominio objetivo.
- Modelo con cero descargas y cero likes en el momento de la consulta: senal de escasa validacion por parte de la comunidad; conviene tratarlo con cautela en entornos criticos.
- Sin informacion sobre contexto de audio maximo, lo que dificulta planificar la segmentacion de grabaciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-sft-v9-full-s48k
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
