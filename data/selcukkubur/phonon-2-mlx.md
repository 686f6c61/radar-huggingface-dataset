# selcukkubur/Phonon-2-mlx

## Resumen

Phonon-2-mlx es una conversión de formato del modelo de reconocimiento automático del habla (ASR) FermionResearch/Phonon-2, que a su vez es una compresión con cuantización consciente de cinco valores de nvidia/parakeet-tdt-0.6b-v3. El repositorio lo publica el usuario selcukkubur y su único objetivo es reempaquetar los pesos en la disposición NeMo/MLX para que una implementación MLX de Parakeet pueda leerlos. No se ha reentrenado ningún peso: los bits de cinco valores se conservan literalmente y solo se renombran los tensores.

El artefacto ocupa 0,2 GB y declara 181.228.034 parámetros, distribuidos en un único archivo model.safetensors formado por 264 bloques empaquetados de cinco valores y 9 tablas int6, con el resto de tensores en float16. Está orientado a transcripción de voz en inglés sobre Apple Silicon mediante MLX, no a generación de texto, razonamiento ni tareas multimodales.

Su interés es fundamentalmente práctico: permite ejecutar la familia Parakeet/Phonon en hardware de Apple con un consumo de memoria muy bajo, algo útil para dictado local y procesamiento de audio en el borde sin depender de la nube. Conviene tener presente que es una conversión de formato sin cifras de WER propias y con cero descargas registradas, por lo que no sustituye a una evaluación de calidad independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) de la familia NVIDIA Parakeet, heredada de nvidia/parakeet-tdt-0.6b-v3; el detalle del codificador no se especifica en la informacion proporcionada |
| Parametros totales | 181.228.034 (recuento declarado en los metadatos de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se declara ventana de audio ni contexto en la informacion proporcionada) |
| Tipos de cuantizacion | Bloques empaquetados de cinco valores (clave phonon_packed, 264 bloques) y 9 tablas int6 (clave phonon_int6); el resto de tensores en float16. El repositorio esta etiquetado como 8-bit. No se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 para los pesos; el codigo lector original del contenedor es Apache-2.0 |
| Formato de pesos | safetensors (disposicion MLX), un unico archivo model.safetensors |
| Libreria | mlx |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-30 (segun metadatos del Hub) |
| Modelos base | FermionResearch/Phonon-2 y nvidia/parakeet-tdt-0.6b-v3 |

## Arquitectura y entrenamiento

Este repositorio no introduce arquitectura nueva ni entrena nada. Hereda la del checkpoint nvidia/parakeet-tdt-0.6b-v3, un transductor TDT cuyo nombre indica que el decodificador predice de forma conjunta el token y su duración. Sobre esa base, FermionResearch/Phonon-2 aplica una compresión con cuantización consciente de cinco valores, y Phonon-2-mlx se limita a reordenar y renombrar los tensores al esquema NeMo/MLX, conservando los bits empaquetados tal cual.

El runtime de referencia de Fermion Research describe un decodificador de dos planos y cinco estados; los artefactos derivados pueden almacenar además el embedding de tokens ligado a la cabeza de salida y determinadas capas lineales de la torre de audio en el formato afín nativo de MLX. El archivo publicado contiene 264 bloques empaquetados de cinco valores y 9 tablas int6, declarados en los metadatos del safetensors bajo las claves phonon_packed y phonon_int6. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; en esta conversión no se ha reentrenado ningún peso.

## Capacidades

- Reconocimiento automático del habla en inglés: es la única tarea declarada en el pipeline del repositorio.
- Decodificación tipo transductor TDT, que según el nombre del checkpoint base predice token y duración conjuntamente, lo que permite emitir varios tokens por paso de decodificación.
- Ejecución nativa en MLX sobre Apple Silicon, con el módulo phonon disponible en el ecosistema mlx-audio para la familia Phonon de Fermion Research.
- Salida de transcripción en texto; no se documentan marcas de tiempo, diarización de hablantes, puntuación ni normalización.
- No soporta tool calling ni function calling.
- No está diseñado para agentes, razonamiento multi-paso ni planificación.
- No dispone de visión, comprensión de audio más allá de ASR, ni modo de razonamiento explícito (thinking mode).
- Cobertura multilingüe: solo inglés.

## Casos de uso

- Dictado local en Mac: al requerir menos de 1 GB de memoria y ejecutarse con MLX, permite transcribir notas de voz y documentos dictados sin enviar audio a servicios externos, algo relevante por privacidad.
- Subtitulado automático de vídeo en inglés: el modelo genera texto a partir del audio, que después puede sincronizarse con la pista temporal mediante herramientas externas, ya que el repositorio no documenta marcas de tiempo.
- Actas y resúmenes de reuniones: transcripción de audio de reuniones en inglés como primer paso de un pipeline que después pasa el texto a un LLM para resumir y extraer acuerdos.
- Analítica de llamadas en centros de contacto: conversión de grabaciones a texto para clasificación posterior, análisis de motivos de contacto y control de calidad; el bajo coste de memoria permite procesar lotes grandes en una sola máquina.
- Accesibilidad: generación de subtítulos para contenido en inglés en entornos donde no se quiere depender de conectividad, por ejemplo quioscos, aulas o salas de conferencias.
- Preprocesado de corpus de audio: transcripción masiva de grabaciones para construir datasets de texto alineado con audio destinados a entrenar o evaluar otros sistemas.
- Indexado y búsqueda de archivos de audio: transcripción de un archivo histórico de grabaciones para habilitar búsqueda por palabras clave sobre el contenido hablado.
- Procesamiento en el borde sin GPU dedicada: al ser un modelo compacto en formato MLX, encaja en portátiles y equipos de sobremesa Apple Silicon donde no hay CUDA disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. La model card indica explícitamente que FermionResearch publica sus propias cifras de WER para Phonon-2, pero que no se reproducen en esta conversión y que este repositorio no las reclama. La única verificación declarada es la fidelidad de las salidas respecto a la implementación de referencia, lo que no equivale a una evaluación de calidad.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB y declara 181.228.034 parámetros. Estimación derivada del recuento: en float16 los pesos sin empaquetar rondarían los 0,36 GB, y el empaquetado de cinco valores reduce aún más el peso en disco. La inferencia debería caber holgadamente por debajo de 1 GB de memoria, aunque no hay cifras oficiales publicadas.
- MLX requiere Apple Silicon, por lo que el destino natural son los chips de la familia M. Cualquier Mac con 8 GB de memoria unificada debería ser suficiente según la estimación anterior.
- GPU CUDA (A100, H100, RTX 4090): los pesos están en formato MLX/safetensors con bloques empaquetados y no se pueden cargar directamente en vLLM, TGI o llama.cpp. Sería necesaria una conversión adicional que el repositorio no proporciona.
- Opciones de despliegue: la librería mlx y, previsiblemente, el módulo phonon de mlx-audio, descrito para la familia Phonon de Fermion Research. No hay soporte documentado para Ollama, vLLM, TGI, whisper.cpp ni servidores de inferencia equivalentes.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de velocidad ni de uso de memoria en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Idiomas | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| selcukkubur/Phonon-2-mlx | 181.228.034 (recuento del repositorio) | no disponible | en | CC-BY-4.0 | safetensors en disposicion MLX; 0 descargas |
| FermionResearch/Phonon-2 | no disponible en la informacion proporcionada | no disponible | en | CC-BY-4.0 | safetensors / MLX; es el origen directo de esta conversion |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B (deducido del nombre del checkpoint; no confirmado en la informacion) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | NeMo; es el checkpoint del que parte Phonon-2 |
| openai/whisper-large-v3 | 1.550M (dato publico, no incluido en la informacion proporcionada) | ventana de 30 s por fragmento (dato publico) | 99 idiomas (dato publico) | MIT (dato publico) | transformers, whisper.cpp y otros; referencia habitual del sector |

La comparación directa de calidad no es posible con los datos disponibles, porque no se publican cifras de WER de esta conversión. Whisper large-v3 se incluye como referencia de categoría, pero sus datos no proceden de la información proporcionada y deberían verificarse en su propia ficha.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: no se reclama ninguna mejora de calidad respecto a FermionResearch/Phonon-2 y no se ha reentrenado ningún peso.
- No se reproducen cifras de WER. Las publica FermionResearch para Phonon-2 y no están verificadas en este repositorio.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de alucinación propio de los sistemas ASR: ante ruido, música, silencio o solapamiento de voces puede generar sustituciones, omisiones o texto plausible que no se corresponde con el audio.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad ni con reportes independientes de errores.
- Licencia CC-BY-4.0: permite uso comercial siempre que se atribuya tanto a FermionResearch (por Phonon-2) como a NVIDIA (por el checkpoint parakeet-tdt-0.6b-v3 del que deriva). El código lector original se distribuye aparte bajo Apache-2.0.
- La fecha de creación declarada en el Hub (2026-09-30) es posterior a la fecha de consulta habitual de este tipo de fichas, lo que apunta a metadatos anómalos o introducidos manualmente.
- No hay información sobre ventana máxima de audio, gestión de audios largos, marcas de tiempo ni diarización, aspectos críticos para producción.
- Despliegue restringido al ecosistema Apple/MLX salvo que se realice una conversión manual adicional; no hay artefactos para CUDA listos para usar.
- El recuento de parámetros declarado (181.228.034) es muy inferior al del checkpoint base (0,6B), algo coherente con la compresión descrita pero cuya causa exacta no se detalla en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/selcukkubur/Phonon-2-mlx
- Modelo base FermionResearch/Phonon-2: https://huggingface.co/FermionResearch/Phonon-2
- Checkpoint original nvidia/parakeet-tdt-0.6b-v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Perfil de GitHub del autor: https://github.com/selcukkubur
- Runtime MLX de referencia de Fermion Research: https://raw.githubusercontent.com/fermionresearch/phonon/refs/heads/main/v18_runtime.py
- Modulo phonon en mlx-audio: https://github.com/Blaizzy/mlx-audio/tree/main/mlx_audio/stt/models/phonon
- Otro modelo MLX del mismo autor (referencia de estilo de publicacion): https://huggingface.co/selcukkubur/Confucius4-R2T2-mlx-4bit
