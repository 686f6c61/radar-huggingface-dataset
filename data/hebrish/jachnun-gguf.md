# Hebrish/Jachnun-GGUF

## Resumen

Jachnun-GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático del habla (ASR) Hebrish/Jachnun, desarrollado por el usuario Hebrish y publicado en HuggingFace. Se trata de un sistema especializado en *code-switching* hebreo-inglés, es decir, en transcribir audio donde el hablante alterna entre ambos idiomas dentro de la misma conversación o incluso de la misma frase, un fenómeno habitual en el entorno tecnológico y académico israelí. Con 617.869.958 parámetros, se sitúa en la gama de 0,6 mil millones, lo que lo hace desplegable en hardware modesto.

El modelo se basa en la arquitectura Parakeet con decodificador TDT (*Token-and-Duration Transducer*), una familia de transductores desarrollada por NVIDIA para ASR. La variante GGUF está pensada para ejecutarse con transcribe.cpp, un runtime de inferencia local que permite usar el modelo sin depender de frameworks de deep learning completos ni de servicios en la nube.

Su relevancia actual radica en dos factores: por un lado, cubre un nicho poco atendido como es el ASR bilingüe hebreo-inglés con calidad de producción; por otro, su licencia CC-BY-4.0 permite uso comercial y su empaquetado GGUF facilita el despliegue *on-premise* y en el borde, algo crítico para organizaciones que no pueden enviar audio a APIs externas. El acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet con decodificador TDT (transductor token-and-duration) |
| Parámetros totales | 617.869.958 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; al ser un modelo ASR, el límite relevante es la duración máxima de audio por inferencia, no especificada en la información proporcionada |
| Tipos de cuantización | Formato GGUF; los niveles concretos de cuantización no se detallan en la información disponible (el repositorio ocupa 12,2 GB, lo que sugiere varias variantes del modelo de 618 M de parámetros) |
| Idiomas soportados | Inglés (en) y hebreo (he), con soporte de code-switching entre ambos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base Hebrish/Jachnun se publica en su formato original, no especificado |
| Pipeline | automatic-speech-recognition |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 218 descargas, 0 likes (a fecha de la información disponible) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Parakeet en su variante TDT. Los transductores TDT combinan un codificador (habitualmente un Conformer o FastConformer en la familia Parakeet) con un decodificador que predice conjuntamente el token siguiente y su duración, lo que permite emitir varios fotogramas por paso de decodificación y reduce la latencia frente a los transductores clásicos. El resultado es un modelo no autorregresivo en el sentido de los LLM, sin ventana de contexto textual ni mecanismo de atención sobre tokens previos: procesa directamente representaciones acústicas y produce la secuencia de transcripción.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en ASR). Tampoco se especifican las horas de audio, la proporción de audio bilingüe frente a monolingüe ni las estrategias de aumento de datos. El modelo base Hebrish/Jachnun es el artefacto del que deriva esta versión; Jachnun-GGUF es una conversión de formato y cuantización, no un reentrenamiento, por lo que las capacidades del modelo cuantizado dependen de las del original. La innovación técnica diferencial es, por tanto, doble: la especialización en code-switching hebreo-inglés y el empaquetado GGUF para inferencia local con transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en hebreo e inglés, con manejo de *code-switching* intra e inter-frase.
- Reconocimiento de terminología técnica en inglés dentro de discurso en hebreo (anglicismos de ingeniería, producto y medicina), que es el escenario para el que el etiquetado del modelo sugiere que fue diseñado.
- Inferencia local mediante transcribe.cpp, sin necesidad de GPU de datacenter ni de conectividad.
- Procesamiento por lotes de archivos de audio en pipelines automatizados.
- Salida de transcripción con marcas temporales, en función de lo que exponga el runtime transcribe.cpp (no confirmado en la información disponible).
- No se han documentado capacidades de diarización de hablantes, traducción automática, detección de idioma explícita por segmento ni puntuación avanzada.
- No dispone de tool calling, razonamiento multi-paso ni modo *thinking*: no es un modelo generativo de propósito general.

## Casos de uso

- Transcripción de reuniones de equipos israelíes con terminología técnica en inglés: el modelo está entrenado específicamente para frases que mezclan hebreo y anglicismos, de modo que evita el fallo típico de los sistemas monolingües, que transcriben literalmente el inglés con fonética hebrea o pierden el segmento.
- Atención al cliente y *call centers*: transcripción de grabaciones de soporte donde el cliente habla hebreo y cita nombres de producto, comandos o mensajes de error en inglés. El despliegue GGUF permite procesar el audio dentro de la infraestructura de la empresa.
- Subtitulado de clases, ponencias y webinars: conferencias académicas o técnicas en Israel donde el ponente alterna hebreo e inglés; el tamaño de 618 M permite procesar horas de audio en paralelo en una sola GPU de gama media.
- Documentación clínica y legal con validación humana: dictado de informes donde el profesional usa hebreo con terminología médica o legal en inglés. Requiere supervisión humana por el riesgo de error en entidades críticas, pero reduce el tiempo de transcripción manual.
- Investigación cualitativa y ciencias sociales: transcripción de entrevistas semiestructuradas bilingües para análisis temático, con la ventaja de mantener los datos de los participantes en servidores propios, algo relevante para comités de ética.
- Despliegue en el borde o en entornos aislados: el modelo cabe en GPUs de consumo y en CPU, por lo que puede ejecutarse en estaciones de trabajo sin conexión, escenarios de defensa, o instalaciones con requisitos de soberanía del dato.
- Pipelines de medios y archivo audiovisual: indexación y búsqueda sobre fondos de vídeo en hebreo con inserción de términos en inglés, alimentando motores de búsqueda internos con transcripciones normalizadas.
- Prototipado rápido de asistentes de voz bilingües: al ser un GGUF de 618 M, sirve como base para validar productos de dictado o voz antes de invertir en infraestructura de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan cifras de WER (*word error rate*) sobre conjuntos como Common Voice, FLEURS, el leaderboard Open ASR de HuggingFace ni benchmarks específicos de code-switching hebreo-inglés. Tampoco se documentan métricas de latencia o *real-time factor* (RTF) para el runtime transcribe.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 1,24 GB (618 M de parámetros); en cuantizaciones de 8 bits, alrededor de 0,65 GB; en 4 bits, del orden de 0,35-0,40 GB. A ello hay que sumar el *buffering* de características acústicas y las activaciones del codificador, por lo que conviene reservar entre 1,5 y 3 GB en total según la cuantización y la duración del audio.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX A2000 o superiores. Para procesamiento por lotes a gran escala, una A100 o H100 aporta margen para paralelizar muchos flujos, aunque el modelo está claramente sobredimensionado para ellas en términos de memoria.
- Cabe holgadamente en GPU de consumo: sí, en prácticamente cualquier tarjeta discreta de los últimos ocho años con 4 GB o más. También es viable en CPU (inferencia en lote con RTF moderado) y en Apple Silicon mediante el backend correspondiente de transcribe.cpp.
- Opciones de despliegue: transcribe.cpp es el runtime indicado por las etiquetas del repositorio para los pesos GGUF. Para los pesos originales del modelo base, la vía habitual en la familia Parakeet es el ecosistema NVIDIA NeMo, aunque la información disponible no lo confirma. vLLM, TGI y Ollama no son aplicables: están orientados a LLM generativos y no soportan transductores ASR.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo de 618 M es aproximadamente 2,5 veces más pequeño que Whisper large-v3 (1550 M), lo que en GPUs modernas suele traducirse en un RTF muy inferior a 1, pero se trata de una estimación general y no de una medición de este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Jachnun-GGUF | 617,9 M | he, en (con code-switching) | CC-BY-4.0 | GGUF / transcribe.cpp | Acceso gated; especializado en alternancia hebreo-inglés |
| Whisper large-v3 (OpenAI) | 1550 M | 99 idiomas | Apache-2.0 | safetensors, GGUF, ONNX / whisper.cpp, faster-whisper | Referencia generalista; cobertura de hebreo sin especialización explícita en code-switching |
| Whisper medium (OpenAI) | 769 M | 99 idiomas | Apache-2.0 | safetensors, GGUF / whisper.cpp, faster-whisper | Alternativa de tamaño comparable; menor huella que large-v3, cobertura multilingüe amplia |
| NVIDIA Parakeet-TDT-0.6B-v2 | ~600 M | en | CC-BY-4.0 | NeMo / NVIDIA NeMo, exportaciones | Misma familia arquitectónica (Parakeet TDT), pero monolingüe en inglés |
| Fine-tunes de Whisper para hebreo (ivrit-ai y similares) | No disponible | he, en | No disponible | No disponible | Alternativa específica para hebreo; requiere consultar cada ficha para licencia y parámetros |

La ventaja competitiva de Jachnun-GGUF no es el WER absoluto frente a Whisper large-v3, que no se puede evaluar sin datos, sino la combinación de licencia CC-BY-4.0 sin restricciones de uso comercial, tamaño reducido para despliegue local y especialización declarada en code-switching hebreo-inglés.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al estar entrenado sobre corpus de hebreo e inglés, es previsible un peor rendimiento con acentos no nativos, dialectos del hebreo (mizrají, yemenita) o hablantes que mezclan árabe y hebreo, pero no hay evaluación publicada al respecto.
- Riesgo de alucinación: en ASR, el equivalente son las inserciones y sustituciones de texto no presentes en el audio, especialmente en segmentos con ruido, música o silencios largos. No se han publicado tasas de error que permitan cuantificarlo.
- Limitaciones de idioma: el modelo cubre únicamente hebreo e inglés. No debe esperarse comportamiento correcto en árabe, ruso, amhárico u otros idiomas presentes en la población israelí, a pesar de su relevancia demográfica.
- Sin benchmarks: no existen cifras públicas de WER para este modelo, por lo que cualquier decisión de producción debería ir precedida de una evaluación propia sobre el dominio objetivo (audio telefónico, médico, reuniones, etc.).
- Licencia CC-BY-4.0: permite uso comercial y obras derivadas, pero exige atribución al autor original. Conviene revisar también las condiciones del modelo base Hebrish/Jachnun, ya que la licencia del derivado no puede ser más permisiva que la del original.
- Acceso restringido: el repositorio es *gated*, de modo que la automatización de descargas en CI/CD requiere un token de HuggingFace con los permisos aceptados.
- Madurez: con 218 descargas y 0 likes, el modelo no cuenta con una comunidad amplia que haya reportado problemas. No hay garantía de mantenimiento ni de soporte.
- Runtime: la dependencia de transcribe.cpp limita las opciones de integración frente a ecosistemas más maduros como faster-whisper o NeMo, y no se dispone de información sobre el soporte de *streaming* en tiempo real.
- Metadatos incompletos: se desconoce la duración máxima de audio por inferencia, el vocabulario del tokenizador y el comportamiento con audio de más de unos minutos sin segmentar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hebrish/Jachnun-GGUF
- Modelo base: https://huggingface.co/Hebrish/Jachnun
- Repositorio de transcribe.cpp: no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible en la información proporcionada
- Demos o espacios asociados: no disponible en la información proporcionada
