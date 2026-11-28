# softsay/Qwen3-ASR-1.7B-gguf

## Resumen

Qwen3-ASR-1.7B-gguf es una distribucion en formato GGUF del modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. El repositorio lo publica el usuario softsay como copia espejo del fichero `Qwen3-ASR-1.7B-Q8_0.gguf` generado por el proyecto Handy para el runtime transcribe.cpp. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son identicos al original, solo cambia el contenedor y el canal de distribucion.

El modelo resuelve la tarea de transcripcion de audio a texto (pipeline `automatic-speech-recognition`) con un tamano de aproximadamente 2.038 millones de parametros, lo que lo situa en la gama ligera y permite ejecucion en hardware modesto. Su interes practico radica en que el formato GGUF y la integracion con transcribe.cpp facilitan el despliegue local sin depender de frameworks de deep learning pesados, algo relevante para aplicaciones de dictado, subtitulado o asistentes de voz en escritorio.

La relevancia de esta ficha concreta es limitada pero clara: ofrece una fuente de descarga alternativa (SoftSay) de una cuantizacion Q8_0 ya existente, con licencia Apache 2.0 heredada del modelo base. No hay innovaciones tecnicas propias ni datos de evaluacion publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR-1.7B; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 2.038.078.608 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica cuantizacion publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3-ASR-1.7B-Q8_0.gguf`, 2.185.030.624 bytes) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3-ASR-1.7B en los datos proporcionados. Por el nombre y el pipeline asignado, se trata de un modelo de reconocimiento automatico del habla, pero no se detalla si emplea un encoder de audio tipo Whisper, Conformer, un encoder acustico combinado con un decoder basado en transformer, ni si incorpora atencion lineal u otras variantes. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

Respecto al proceso de esta publicacion concreta, la model card indica que la conversion a GGUF la realizo el proyecto Handy para transcribe.cpp y que softsay unicamente replica el fichero sin modificarlo, con el SHA-256 `9a0d81792dfea2d5f278b8a63deb3ea6e02139ce42c2301f32ea19c4f77526b7`. No hay innovaciones tecnicas atribuibles a esta distribucion mas alla del propio formato GGUF y su runtime asociado.

## Capacidades

- Transcripcion de audio a texto (automatic speech recognition), tarea principal del pipeline declarado.
- Procesamiento conversacional: la etiqueta `conversational` sugiere uso en dialogos o dictado interactivo, aunque no se detalla el mecanismo.
- Ejecucion mediante transcribe.cpp, runtime especifico para modelos de transcripcion en formato GGUF.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles; no es un modelo de proposito general.
- Vision, audio de entrada mas alla del propio ASR, modo thinking: no disponibles.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: el formato GGUF y transcribe.cpp permiten integrar la transcripcion en herramientas nativas sin dependencias de Python ni de GPUs dedicadas, usando el fichero Q8_0 de 2,2 GB.
- Subtitulado automatico de contenido audiovisual: el modelo puede generar transcripciones que se sincronicen posteriormente con marcas de tiempo en un pipeline de postproduccion, siempre que el runtime exponga esa funcionalidad.
- Asistentes de voz locales con requisitos de privacidad: al ejecutarse en local, el audio no sale del dispositivo, lo que encaja en entornos sanitarios, legales o corporativos con datos sensibles.
- Transcripcion de reuniones y notas: integracion en grabadoras o aplicaciones de notas que conviertan el audio de una reunion en texto para su indexacion y busqueda.
- Accesibilidad: generacion de subtitulos en tiempo real o diferido para personas con discapacidad auditiva en aplicaciones de videollamada o reproduccion multimedia.
- Automatizacion de centros de llamadas: transcripcion por lotes de grabaciones para analisis de calidad, busqueda de palabras clave y generacion de resumenes posteriores con otro modelo de lenguaje.
- Prototipado e investigacion en ASR: al ser una cuantizacion Q8_0 con licencia Apache 2.0, sirve como base para experimentos de evaluacion o comparacion de runtimes sin necesidad de convertir pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 2,19 GB; en inferencia se necesita espacio adicional para el estado del decoder y buffers de audio, por lo que se puede estimar un consumo en torno a 3-4 GB, aunque no hay cifras oficiales en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion. Por tamano, cualquier GPU con 4 GB o mas de VRAM deberia poder alojar el modelo, pero no se confirma.
- GPU de consumo: previsiblemente cabe en tarjetas como RTX 3060, RTX 4060 o superiores, asi como en Apple Silicon con memoria unificada; no confirmado por el autor.
- Opciones de despliegue: transcribe.cpp es el runtime indicado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-gguf (este repo) | 2.038.078.608 | no disponible | GGUF Q8_0 | Apache 2.0 | Hugging Face (softsay) |
| Qwen/Qwen3-ASR-1.7B (original) | 2.038.078.608 | no disponible | safetensors | Apache 2.0 | Hugging Face (Qwen) |
| handy-computer/Qwen3-ASR-1.7B-gguf | 2.038.078.608 | no disponible | GGUF Q8_0 | Apache 2.0 | Hugging Face (Handy) |

No se dispone de datos de benchmarks ni de otros modelos ASR comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento con alternativas como Whisper u otros sistemas.

## Limitaciones y advertencias

- Este repositorio no entrena ni convierte el modelo: es una copia sin cambios del fichero de Handy, por lo que cualquier limitacion del modelo base se hereda integramente.
- No hay informacion sobre sesgos, tasas de alucinacion o calidad por idioma; se desconoce el comportamiento en acentos, audio ruidoso o habla solapada.
- La lista de idiomas soportados no esta disponible, lo que impide garantizar cobertura multilingue.
- Solo se publica la cuantizacion Q8_0; no hay variantes Q4, Q5 o F16 en este repositorio, lo que limita el ajuste fino de memoria.
- El modelo depende de transcribe.cpp; no se garantiza compatibilidad con otros runtimes GGUF como llama.cpp u Ollama.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar los ficheros LICENSE y NOTICE del repositorio original para confirmar obligaciones de atribucion.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria de su funcionamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/softsay/Qwen3-ASR-1.7B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio GGUF de origen (Handy): https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Sitio de SoftSay: https://softsay.ai
