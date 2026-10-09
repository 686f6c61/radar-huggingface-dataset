# Lythri/Lythri-4B-A2B

## Resumen

Lythri-4B-A2B es un modelo de lenguaje desarrollado por Lythri, presentado como parte de una familia de modelos orientados a la compania emocional y a la conversacion multi-turno en dispositivo local (on-device). Esta construido sobre google/gemma-4-E2B y cuenta con 4.628.569.379 parametros totales segun los pesos en safetensors, de los cuales el autor declara 2.3B activos, lo que situa al modelo en la categoria de arquitecturas con activacion dispersa (mezcla de expertos) de perfil ligero.

El modelo no compite en tareas de matematicas o generacion de codigo: su entrenamiento esta enfocado en reconocimiento y respuesta emocional, manteniendo un tamano que permite ejecucion local en portatil o telefono. La model card afirma que, con solo 2.3B parametros activos, Lythri-4B-A2B resulta comparable a Gemma 4 E4B-IT (8B) en tres benchmarks de inteligencia emocional en regimen zero-shot.

Su relevancia actual es doble: por un lado cubre un nicho poco atendido por los modelos generalistas (soporte emocional, agentes conversacionales de compania) y por otro demuestra que un ajuste fino especializado sobre un modelo base pequeno puede acercarse en ese dominio a alternativas del doble de tamano. Se distribuye con licencia apache-2.0 y con versiones GGUF para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de google/gemma-4-E2B, con parametros totales y activos diferenciados (perfil tipo mezcla de expertos); familia Gemma 4 |
| Parametros totales | 4.628.569.379 (pesos safetensors); la model card indica 4.63B y una fuente externa cita 5.1B (discrepancia no resuelta) |
| Parametros activos | 2.3B (segun la model card del autor) |
| Longitud de contexto | 32.768 tokens (segun ficha de Featherless; no confirmado en la model card) |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; los niveles concretos no se detallan en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio principal) y GGUF (Lythri-4B-A2B-GGUF) |

## Arquitectura y entrenamiento

La informacion disponible indica que Lythri-4B-A2B es un ajuste fino (finetune) sobre google/gemma-4-E2B, el modelo base de la familia Gemma 4 con activacion de 2B parametros efectivos. Los metadatos de HuggingFace incluyen la etiqueta image-text-to-text, heredada presumiblemente del modelo base, aunque la pipeline declarada del repositorio es text-generation. El autor diferencia explicitamente entre parametros totales (4.63B) y activos (2.3B), lo que apunta a una arquitectura con activacion parcial de parametros por token, si bien la model card no describe el mecanismo interno, el numero de expertos ni la distribucion por capa.

En cuanto a los datos de entrenamiento, la model card no especifica el volumen de tokens, la composicion del corpus, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineacion. El unico detalle metodologico declarado es que las comparativas de inteligencia emocional se realizaron en regimen zero-shot frente a baselines instruction-tuned, y que existen dos variantes en la familia (Lythri-4B-A2B y Lythri-7B-A4B) construidas sobre Gemma 4 E2B y E4B respectivamente. Se referencia un informe tecnico en Zenodo para los detalles completos.

## Capacidades

- Generacion de texto conversacional orientada a compania emocional y soporte afectivo.
- Conversacion multi-turno con mantenimiento de contexto a lo largo de la interaccion.
- Reconocimiento y respuesta a senales emocionales, con rendimiento declarado comparable a modelos instruction-tuned de mayor tamano en tres benchmarks de inteligencia emocional (sin cifras publicadas en la informacion disponible).
- Ejecucion en dispositivo (on-device), con versiones GGUF para equipos sin GPU dedicada o con VRAM limitada.
- Razonamiento de sentido comun y conocimiento general a nivel basico: MMLU 55.23, ARC-E 81.40, HellaSwag 72.80, PIQA 79.49.
- Comprension lectora basica: BoolQ 73.15, OpenBookQA 41.00.
- Capacidades matematicas limitadas: GSM8K 28.81 y MATH 3.62, muy por debajo de modelos generalistas del mismo rango.
- Soporte multimodal: la etiqueta image-text-to-text figura en los metadatos del repositorio, aunque la model card no documenta tareas de vision ni ejemplos de uso; no confirmado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Uso como agente multi-step: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Aplicaciones de acompanamiento emocional en local: el modelo puede mantener conversaciones multi-turno de caracter afectivo directamente en un portatil o movil, sin enviar datos personales a un servicio en la nube, lo que resulta relevante para un dominio con alta sensibilidad de privacidad.
- Chat de apoyo en salud mental de baja intensidad: como primera linea de contencion conversacional (escucha activa, reformulacion, tecnicas basicas de respiracion), siempre con derivacion a profesionales y sin pretension clinica.
- Asistentes de diario personal y reflexion guiada: registro de estado de animo con seguimiento a lo largo de dias apoyado en la ventana de contexto de 32.768 tokens, que permite incorporar entradas previas extensas.
- Integracion en aplicaciones moviles y de escritorio: al tener 2.3B parametros activos y versiones GGUF, puede embeberse en apps de iOS, Android, macOS o Windows mediante llama.cpp sin dependencia de infraestructura servidor.
- Moderacion y triaje de comunidad: clasificacion conversacional del tono emocional de mensajes de usuarios (frustracion, tristeza, enfado) para enrutar a respuestas humanas o recursos adecuados, aprovechando su sensibilidad declarada a senales emocionales.
- Prototipado rapido de agentes conversacionales con personalidad: fine-tuning posterior sobre Lythri como base para personajes persistentes, dado que ya viene alineado para estilo conversacional natural y puede ejecutarse en una sola GPU consumer.
- Juguetes conectados y dispositivos de compania: asistentes de voz o texto en hardware con 8 GB de memoria unificada o menos, donde su reducido coste de inferencia (2.3B activos) permite respuestas interactivas sin servidor.
- Investigacion en inteligencia emocional de modelos pequenos: linea base reproducible y abierta (apache-2.0) para estudiar cuanto de la capacidad emocional de modelos grandes se conserva al reducir parametros activos.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor. Se incluyen los valores de Lythri-4B-A2B y, a modo de referencia de la misma familia, los de Lythri-7B-A4B.

| Benchmark | Lythri-4B-A2B | Lythri-7B-A4B |
|---|---|---|
| MMLU | 55.23 | 69.09 |
| MMLU-Pro | 24.42 | 38.17 |
| ARC-E | 81.40 | 83.42 |
| ARC-C | 52.99 | 60.58 |
| PIQA | 79.49 | 81.88 |
| HellaSwag | 72.80 | 78.29 |
| WinoGrande | 68.43 | 74.90 |
| CommonsenseQA | 65.52 | 77.07 |
| SocialIQA | 49.80 | 50.46 |
| TruthfulQA MC2 | 46.16 | 49.66 |
| OpenBookQA | 41.00 | 43.60 |
| GPQA Diamond | 28.79 | 27.78 |
| GSM8K | 28.81 | 62.02 |
| MATH | 3.62 | 21.28 |
| BoolQ | 73.15 | no disponible (valor truncado en la fuente) |

En los tres benchmarks de inteligencia emocional citados por el autor (no identificados con nombre ni cifras en la informacion disponible), la model card afirma que Lythri-4B-A2B, con 2.3B parametros activos, es comparable a Gemma 4 E4B-IT (8B) en regimen zero-shot. No se han publicado en la informacion disponible los valores numericos de esos tres benchmarks de emocion, ni resultados comparativos frente a otros modelos de la misma categoria distintos de Gemma 4.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 9.3 GB para los pesos (el repositorio ocupa 9.3 GB), mas overhead de activaciones y cache KV; en la practica conviene reservar 11-12 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5 GB; en 4 bits: alrededor de 3 GB (estimacion a partir de los 4.63B parametros totales, ya que los niveles GGUF concretos no se detallan).
- GPU recomendadas: para FP16, NVIDIA A100 40GB, H100, L40S o RTX 4090 (24 GB); para cuantizacion de 4-8 bits, RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070 o superiores.
- Compatibilidad con GPU consumer: si. Al tener solo 2.3B parametros activos, el coste computacional de inferencia es bajo y cabe con holgura en GPUs de 8-12 GB en cuantizacion de 4-8 bits.
- Memoria unificada: viable en Mac con Apple Silicon (M1/M2/M3/M4) desde 8 GB en 4 bits y desde 16 GB en FP16, y en telefonos de gama alta mediante llama.cpp.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp y Ollama a traves del repositorio GGUF, vLLM y TGI para servido, y endpoints gestionados en Featherless AI y FriendliAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La etiqueta endpoints_compatible del repositorio indica compatibilidad con inference endpoints de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Modelo base | Licencia | Enfoque |
|---|---|---|---|---|---|
| Lythri-4B-A2B | 4.63B | 2.3B | Gemma 4 E2B | apache-2.0 | Companía emocional, on-device |
| Lythri-7B-A4B | 7.46B | 4.5B | Gemma 4 E4B | no disponible en la informacion proporcionada | Companía emocional, on-device |
| Gemma 4 E2B (base) | no disponible | 2B (nominal, segun nomenclatura E2B) | - | no disponible en la informacion proporcionada | Modelo generalista |
| Gemma 4 E4B-IT | 8B (segun la model card) | no disponible | - | no disponible en la informacion proporcionada | Modelo generalista instruction-tuned; referencia en benchmarks de emocion |

La model card situa a Lythri-4B-A2B a la par de Gemma 4 E4B-IT (8B) en los tres benchmarks de emocion evaluados en zero-shot, mientras que en conocimiento y razonamiento general queda por debajo de Lythri-7B-A4B en casi todas las metricas. No se dispone de comparativas publicadas frente a otros modelos especializados en soporte emocional ni frente a modelos generalistas de 3-5B de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en matematicas: GSM8K 28.81 y MATH 3.62. No es adecuado para calculo, analisis cuantitativo ni tareas de ingenieria que requieran precision numerica.
- MMLU-Pro de 24.42 y GPQA Diamond de 28.79 indican conocimiento avanzado y razonamiento cientifico limitados; no conviene usarlo como asistente tecnico especializado.
- TruthfulQA MC2 de 46.16 y SocialIQA de 49.80 sugieren una fiabilidad moderada en veracidad y en razonamiento social formal, con riesgo de alucinacion inherente a un modelo de 4.63B parametros.
- Riesgo especifico del dominio: un modelo entrenado para compania emocional puede reforzar estados de animo negativos, generar dependencia afectiva o responder de forma inapropiada ante crisis. No debe presentarse como sustituto de atencion psicologica profesional.
- Idiomas soportados: no disponible. No hay confirmacion de soporte multilingue ni del comportamiento en castellano; la evaluacion publicada esta en ingles.
- Contexto declarado de 32.768 tokens procedente de una fuente externa (Featherless), no confirmado en la model card; en un modelo de este tamano la calidad suele degradarse en el extremo superior de la ventana.
- Discrepancia de parametros: los safetensors dan 4.628.569.379 y una fuente externa cita 5.1B. Conviene verificar el dato antes de dimensionar infraestructura.
- Licencia: el repositorio declara apache-2.0, pero al derivar de un modelo Gemma conviene revisar los terminos de uso del modelo base, ya que la informacion disponible no aclara como se compatibilizan ambas licencias.
- No hay informacion sobre tool calling, function calling, capacidades de agente ni soporte multimodal, pese a la etiqueta image-text-to-text del repositorio.
- No se detallan los datos de entrenamiento, la composicion del corpus ni el proceso de alineacion, lo que dificulta auditar sesgos y comportamientos indeseados.
- La model card incluye un DOI (10.5281/zenodo.23179311) y un enlace a informe tecnico; no se ha podido verificar el contenido de dicho informe a partir de la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lythri/Lythri-4B-A2B
- Version GGUF: https://huggingface.co/Lythri/Lythri-4B-A2B-GGUF
- Variante mayor de la familia: https://huggingface.co/Lythri/Lythri-7B-A4B
- Repositorio GGUF de la variante mayor: https://huggingface.co/Lythri/Lythri-7B-A4B-GGUF
- Informe tecnico (DOI): https://doi.org/10.5281/zenodo.23179311
- Informe tecnico en Zenodo: https://zenodo.org/records/23179312
- Perfil del autor en HuggingFace: https://huggingface.co/Lythri
- Perfil en ModelScope: https://www.modelscope.cn/profile/Spike8086
- Endpoint gestionado en Featherless AI: https://featherless.ai/models/Lythri/Lythri-4B-A2B
- Endpoint gestionado en FriendliAI: https://friendli.ai/models/Lythri/Lythri-4B-A2B
- Grafo de arquitectura en hfviewer: https://hfviewer.com/Lythri/Lythri-4B-A2B
