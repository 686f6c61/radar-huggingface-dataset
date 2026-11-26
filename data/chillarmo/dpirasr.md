# Chillarmo/DpirASR

## Resumen
DpirASR es un modelo de reconocimiento automatico del habla (ASR) especializado en armenio oriental, desarrollado por el usuario Chillarmo mediante ajuste fino (fine-tuning) del modelo Qwen/Qwen3-ASR-0.6B-hf. Se distribuye a traves de Hugging Face con la libreria transformers y pesos en formato safetensors, con un total de 782.426.112 parametros (aproximadamente 0,78 mil millones). Su proposito es cubrir una lengua de bajos recursos como el armenio oriental, para la que existen pocos sistemas ASR publicos de calidad.

El modelo parte de la familia Qwen3-ASR, una arquitectura de reconocimiento de voz basada en el transformer multimodal de Qwen3, adaptada aqui a un unico idioma mediante entrenamiento supervisado sobre datos de habla en armenio. La relevancia actual radica en que amplia la cobertura multilingue del ecosistema Qwen3-ASR hacia una lengua con escasa representacion en los benchmarks ASR habituales, y lo hace bajo licencia Apache 2.0, lo que facilita su uso comercial.

El acceso es restringido (gated): es necesario aceptar las condiciones en la pagina del modelo en Hugging Face antes de descargar los pesos. El repositorio ocupa 1,6 GB y el modelo esta etiquetado como compatible con endpoints de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de reconocimiento de voz (familia Qwen3-ASR), ajustado desde Qwen/Qwen3-ASR-0.6B-hf |
| Parametros totales | 782.426.112 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Armenio (hy), armenio oriental |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen3-ASR en su variante de 0,6B parametros, un sistema de reconocimiento automatico del habla que combina un codificador de audio con el decodificador de lenguaje de la familia Qwen3. Sobre esta base, Chillarmo ha realizado un ajuste fino supervisado orientado exclusivamente al armenio oriental, sustituyendo o complementando la cobertura multilingue original por un dominio especializado en esta lengua.

No se dispone de informacion publica sobre el volumen de datos de entrenamiento, la composicion del corpus de audio (horas, dominio, calidad de transcripciones), ni sobre si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones posteriores al ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal especificas de este fine-tuning.

## Capacidades
- Transcripcion de voz a texto en armenio oriental (variedad estandar de Armenia).
- Reconocimiento de habla continua en un unico idioma, sin soporte documentado de otros idiomas.
- Integracion con la libreria transformers mediante el pipeline `automatic-speech-recognition`.
- Compatibilidad declarada con endpoints de inferencia de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo ASR y no de un LLM conversacional.
- No se documentan capacidades de diarizacion, marcas de tiempo a nivel de palabra ni traduccion automatica.

## Casos de uso
- Transcripcion de reuniones y entrevistas en armenio oriental: el modelo convierte audio de voz en texto para actas, subtitulos o busqueda posterior, aprovechando su especializacion en esta lengua frente a modelos ASR multilingues genericos.
- Subtitulado automatico de contenido audiovisual armenio: permite generar subtitulos para videos, podcasts o material educativo en armenio oriental, un nicho con escasa oferta de herramientas.
- Digitalizacion de archivos orales y patrimonio inmaterial: util para instituciones culturales que necesiten transcribir grabaciones historicas o etnograficas en armenio.
- Atencion al cliente en centros de llamadas armenios: transcripcion de conversaciones telefonicas para analitica, control de calidad o generacion de resumenes posteriores con un LLM aparte.
- Investigacion linguistica y corpus: generacion de transcripciones a gran escala para estudios de linguistica computacional del armenio oriental.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en entornos donde el armenio oriental es la lengua principal.
- Prototipado rapido en aplicaciones moviles o web: al tener 0,78B parametros, puede desplegarse en infraestructura modesta para pruebas de concepto de dictado o asistentes de voz.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en precision fp16: en torno a 1,6 GB solo para los pesos (0,78B parametros x 2 bytes), mas el consumo del codificador de audio y las activaciones, por lo que se recomienda reservar al menos 3-4 GB de VRAM.
- En cuantizacion de 8 bits, la huella de pesos baja a aproximadamente 0,8 GB; en 4 bits, a unos 0,4 GB, aunque el modelo no publica variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090) deberia poder ejecutarlo; para produccion con concurrencia se recomienda A10G, L4, A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (pipeline de ASR), endpoints de inferencia de Hugging Face (declarado compatible), y servidores compatibles con transformers como TGI o vLLM si soportan la arquitectura qwen3_asr. No se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chillarmo/DpirASR | 782.426.112 | No disponible | Armenio oriental | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3-ASR-0.6B-hf (base) | ~0,6B | No disponible | Multilingue | No disponible en la informacion | Publico en Hugging Face |
| Whisper large-v3 (OpenAI) | ~1,55B | 30 s de audio por ventana | Multilingue (incluye armenio de forma limitada) | MIT | Publico en Hugging Face |
| Whisper small (OpenAI) | ~244M | 30 s de audio por ventana | Multilingue | MIT | Publico en Hugging Face |

La comparativa con Whisper es orientativa: DpirASR esta especializado en armenio oriental, mientras que Whisper es multilingue generico y su rendimiento en armenio suele ser inferior al de un modelo ajustado especificamente. No se dispone de datos de benchmarks que permitan cuantificar la diferencia.

## Limitaciones y advertencias
- Modelo mono-idioma: solo soporta armenio oriental; no se garantiza su funcionamiento en armenio occidental ni en otras lenguas.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no estandar, habla solapada o vocabulario tecnico especializado.
- Sesgos potenciales derivados del corpus de entrenamiento, no documentado: posible peor rendimiento en variedades dialectales, voces infantiles o registros formales poco representados.
- Ausencia de informacion sobre datos de entrenamiento, evaluacion y limitaciones conocidas, lo que dificulta estimar su calidad real en produccion.
- Acceso restringido: es necesario aceptar condiciones en Hugging Face, lo que puede complicar la automatizacion de despliegues.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-ASR conviene verificar las condiciones de la licencia del modelo base.
- No se documentan marcas de tiempo, diarizacion ni puntuacion; pueden requerir post-procesado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Chillarmo/DpirASR
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Repositorio de Qwen3-ASR (familia Qwen): https://github.com/QwenLM/Qwen3-ASR (referencia de la familia, no verificada en la busqueda)
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
