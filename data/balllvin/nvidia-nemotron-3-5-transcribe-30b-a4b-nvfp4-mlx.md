# balllvin/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4-MLX

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4-MLX es una cuantizacion de 4 bits en formato NVFP4 realizada por el usuario balllvin sobre el modelo base nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, un sistema de reconocimiento automatico del habla (ASR) desarrollado por NVIDIA. El resultado se distribuye en formato MLX, es decir, optimizado para su ejecucion en Apple Silicon (chips M-series) mediante el framework MLX de Apple. El modelo pertenece a la familia Nemotron y esta construido sobre la arquitectura NeMo SpeechLM, segun los tags del repositorio.

El modelo base cuenta con 33.697.148.727 parametros totales segun los tensores safetensors del repositorio, y su nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. La tarea principal es la transcripcion de audio a texto, con pipeline automatic-speech-recognition.

La relevancia de esta ficha radica en que se trata de una cuantizacion comunitaria (no oficial de NVIDIA) pensada para llevar un modelo ASR de gran tamano a hardware de consumo Apple. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, esta creado el 15 de noviembre de 2026 y requiere aceptar las condiciones de acceso en Hugging Face (modelo gated). La licencia declarada es openmdw-1.1, si bien el campo license:other en los tags indica que deben revisarse los terminos exactos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo SpeechLM (familia Nemotron); posible MoE segun nomenclatura A4B, no confirmado |
| Parametros totales | 33.697.148.727 |
| Parametros activos | Aproximadamente 4.000 millones segun la nomenclatura A4B (no confirmado en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), formato MLX |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 (tag license:other en el repositorio) |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 24,3 GB |
| Tarea | Automatic speech recognition (ASR) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base pertenece a la familia Nemotron de NVIDIA y se apoya en la arquitectura NeMo SpeechLM, un diseno orientado a tareas de voz y transcripcion. El sufijo "A4B" en el nombre sugiere una configuracion de mezcla de expertos con alrededor de 4.000 millones de parametros activos, mientras que el total asciende a 33.697.148.727 parametros. No se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion especifica de esta version es la cuantizacion a NVFP4 (formato de punto flotante de 4 bits de NVIDIA) y su conversion al formato MLX, lo que permite ejecutar el modelo en Apple Silicon. No se han publicado en la informacion proporcionada detalles sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, segun el pipeline declarado.
- Procesamiento de audio de entrada mediante la arquitectura NeMo SpeechLM.
- Ejecucion en Apple Silicon gracias al formato MLX.
- Cuantizacion de 4 bits que reduce el peso del modelo a 24,3 GB en disco.
- Soporte de tool calling, agentes, vision o audio adicional: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se especifican idiomas soportados.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: al ejecutarse en formato MLX sobre Apple Silicon, permite transcribir audio sin enviar datos a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de contenido audiovisual: el modelo puede generar transcripciones para videos y podcasts ejecutandose en un Mac con chip M-series, evitando costes de API por minuto de audio.
- Prototipado de aplicaciones de voz en macOS: desarrolladores que trabajan con MLX pueden integrar el modelo en aplicaciones nativas de Apple sin depender de infraestructura CUDA.
- Investigacion en ASR: la disponibilidad de una version cuantizada facilita experimentos academicos en hardware de consumo, comparando el rendimiento de la cuantizacion NVFP4 frente al modelo original.
- Asistentes de accesibilidad: transcripcion en tiempo real de conversaciones para personas con dificultades auditivas, ejecutada localmente en un equipo personal.
- Pipelines de documentacion clinica o legal: transcripcion de dictados y grabaciones en entornos donde la confidencialidad exige procesamiento on-device, siempre que se valide la calidad de la cuantizacion de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 24,3 GB en disco, por lo que se requiere al menos ese espacio libre mas margen para la carga en memoria.
- Al estar en formato MLX, esta disenado para Apple Silicon (chips M1, M2, M3, M4 y posteriores) con memoria unificada suficiente; se recomienda un minimo de 32 GB de memoria unificada para acomodar los pesos y el estado de inferencia.
- No es compatible de forma nativa con GPU NVIDIA o AMD; el formato MLX es especifico del ecosistema Apple.
- Opciones de despliegue: framework MLX de Apple; no se indica soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| balllvin/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4-MLX | 33.697.148.727 | No disponible | safetensors (MLX, NVFP4) | openmdw-1.1 | Gated, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (base) | 33.697.148.727 | No disponible | No disponible | No disponible | Modelo base en Hugging Face |
| Otras alternativas ASR | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo gated: requiere aceptar las condiciones de acceso en Hugging Face antes de poder descargarlo.
- Cuantizacion comunitaria: no es una version oficial de NVIDIA; la calidad de la transcripcion puede degradarse respecto al modelo base en precision completa.
- Cuantizacion NVFP4 de 4 bits: la perdida de precision puede afectar a la exactitud en audio ruidoso, acentos o vocabulario especializado.
- Idiomas soportados no especificados: no se puede garantizar el rendimiento en castellano ni en otros idiomas sin validacion previa.
- Licencia openmdw-1.1 con tag license:other: es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial.
- Compatibilidad limitada a MLX y Apple Silicon: no se puede desplegar en infraestructura CUDA convencional sin reconvertir los pesos.
- Riesgo de alucinacion en transcripciones: como todo modelo generativo de ASR, puede producir texto plausible no presente en el audio.
- Repositorio sin descargas ni validacion de la comunidad: no hay evidencia publica de su calidad en produccion.
- No se dispone de informacion sobre sesgos conocidos ni sobre la longitud de contexto soportada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4-MLX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Framework MLX: https://github.com/ml-explore/mlx
- Documentacion de NVIDIA Nemotron: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo base: no disponible en la informacion proporcionada
