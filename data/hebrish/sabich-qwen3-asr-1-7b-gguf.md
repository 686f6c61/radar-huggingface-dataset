# Hebrish/Sabich-Qwen3-ASR-1.7B-GGUF

## Resumen

Sabich-Qwen3-ASR-1.7B-GGUF es la version cuantizada en formato GGUF del modelo de reconocimiento automatico del habla Sabich-Qwen3-ASR-1.7B, publicado por el usuario Hebrish en Hugging Face. El modelo esta construido sobre la arquitectura Qwen3 y esta especializado en transcripcion de audio con soporte nativo para ingles y hebreo, incluyendo cambio de codigo (code-switching) entre ambos idiomas dentro de una misma locucion. Con 1.720.574.976 parametros (aproximadamente 1,7 mil millones), se posiciona como un modelo compacto orientado a dictado y transcripcion conversacional.

La relevancia de esta publicacion reside en dos factores. Por un lado, el formato GGUF y las herramientas asociadas (llama.cpp y transcribe.cpp) permiten ejecutar el modelo en hardware de consumo sin necesidad de GPUs de datacenter. Por otro lado, la combinacion ingles-hebreo con soporte de code-switching cubre un nicho poco atendido por los modelos ASR mainstream, que habitualmente tratan cada idioma de forma aislada.

El modelo es de acceso restringido (gated): requiere aceptar las condiciones en Hugging Face antes de descargarlo. La licencia declarada es Apache 2.0. El repositorio ocupa 10,9 GB y acumula 19 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (transformer), adaptada para ASR; detalles internos no disponibles |
| Parametros totales | 1.720.574.976 (aprox. 1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles en la informacion) |
| Idiomas soportados | Ingles (en), hebreo (he); code-switching en-he |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (derivado de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo deriva de Hebrish/Sabich-Qwen3-ASR-1.7B, un ajuste de la familia Qwen3 orientado a reconocimiento automatico del habla. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens de audio procesados ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica si el encoder de audio es un componente separado o si la arquitectura emplea un enfoque de audio integrado en el transformer.

La innovacion principal de esta publicacion es el empaquetado en GGUF compatible con llama.cpp y transcribe.cpp, lo que habilita inferencia local eficiente. El modelo esta marcado con la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con infraestructura de endpoints de Hugging Face. No se dispone de informacion sobre tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles y hebreo.
- Code-switching: transcripcion de audio donde el hablante alterna entre ingles y hebreo dentro de la misma frase o conversacion.
- Orientado a dictado (etiqueta `dictation`) y audio conversacional (etiqueta `conversational`).
- Inferencia local mediante llama.cpp y transcribe.cpp gracias al formato GGUF.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se ha documentado soporte de tool calling, agentes, vision, audio generation ni modo thinking en la informacion disponible.

## Casos de uso

- Dictado multilingue para profesionales bilingues: un usuario que trabaja en ingles y hebreo puede dictar notas mezclando ambos idiomas y obtener una transcripcion unificada, gracias al soporte nativo de code-switching.
- Transcripcion de reuniones en entornos israelies o equipos internacionales: el modelo maneja conversaciones donde los participantes alternan entre hebreo e ingles, un escenario frecuente en empresas tecnologicas de la region.
- Subtitulado local de contenido audiovisual: al ejecutarse en formato GGUF sobre hardware de consumo, permite generar subtitulos sin enviar audio a servicios en la nube, lo que reduce costes y mejora la privacidad.
- Asistentes de voz embebidos: con 1,7 B de parametros, el modelo puede integrarse en aplicaciones de escritorio o dispositivos con recursos limitados para transcripcion en tiempo real de comandos y consultas.
- Documentacion clinica o legal dictada: profesionales que alternan terminologia en ingles y hebreo pueden grabar informes y transcribirlos localmente, manteniendo la confidencialidad de los datos.
- Investigacion en ASR code-switching: el modelo sirve como linea base reproducible en formato GGUF para experimentos academicos sobre transcripcion bilingue, al ser ejecutable en estaciones de trabajo convencionales.
- Pipeline de analisis de llamadas: integracion en sistemas de atencion al cliente que reciben llamadas en hebreo con terminos tecnicos en ingles, generando transcripciones para analisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1,7 B en cuantizacion de 4 bits, el peso ronda 1-1,5 GB; en 8 bits, aproximadamente 2 GB; en FP16, unos 3,5 GB. Estas cifras son estimaciones por tamano y no estan confirmadas en la informacion del repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia poder ejecutar las cuantizaciones mas agresivas; una RTX 3060, RTX 4060 o superior ofrece margen comodo.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs consumer modernas con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: llama.cpp y transcribe.cpp (segun las etiquetas del repositorio); Ollama no esta confirmado pero podria ser compatible al ser GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sabich-Qwen3-ASR-1.7B-GGUF | 1,7 B | en, he (code-switching) | GGUF | Apache 2.0 | Acceso gated; orientado a dictado y conversacion |
| Whisper large-v3 | 1,55 B | Multilingue (99 idiomas) | safetensors, GGUF (via comunidad) | MIT | Referencia ASR generalista; sin soporte explicito de code-switching en-he |
| Qwen2-Audio | 8,4 B | Multilingue | safetensors | Apache 2.0 | Modelo audio-language mas grande; mayor coste de inferencia |

La comparativa con Whisper es la mas directa por tamano y tarea. Whisper large-v3 ofrece cobertura de 99 idiomas pero no esta especializado en code-switching hebreo-ingles. Qwen2-Audio es sustancialmente mayor y cubre tareas audio-language mas amplias, no solo ASR. No se dispone de datos de rendimiento comparativo para Sabich-Qwen3-ASR.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que anade friccion para su adopcion en produccion.
- Cobertura limitada de idiomas: solo ingles y hebreo; no es adecuado para transcripcion en castellano ni en otros idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (WER, etc.) en la informacion disponible, lo que dificulta evaluar su idoneidad frente a alternativas.
- Riesgo de alucinacion en audio: como todo modelo generativo aplicado a ASR, puede producir transcripciones plausibles pero incorrectas en audio con ruido, acentos marcados o terminologia especializada.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos o dialectales.
- Detalles de cuantizacion no disponibles: se desconoce que variantes GGUF concretas incluye el repositorio y con que perdida de calidad respecto al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated antes de desplegar en produccion.
- Comunidad muy pequena: 19 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hebrish/Sabich-Qwen3-ASR-1.7B-GGUF
- Modelo base: https://huggingface.co/Hebrish/Sabich-Qwen3-ASR-1.7B
- DOI asociado: https://doi.org/10.57967/hf/11182
