# Infinix-io/elevenlabs-speech

## Resumen

ViiTorVoice-NAR es un modelo de generacion de voz no autorregresivo (NAR) publicado por Infinix-io bajo el identificador `Infinix-io/elevenlabs-speech` en Hugging Face. Se distribuye como un conjunto de componentes empaquetados para el proyecto de codigo abierto [viitor-ai/viitor-voice-nar](https://github.com/viitor-ai/viitor-voice-nar) y esta disenado para clonacion de voz, edicion local de audio y control de emociones y elementos paralinguisticos. La arquitectura combina un LLM basado en Qwen3-0.6B que genera tokens de habla, un codec neuronal (DualCodec) para convertir entre forma de onda y tokens discretos, un extractor de caracteristicas semanticas (W2V-BERT 2.0) y un alineador forzado (Qwen3-ForcedAligner-0.6B) que proporciona marcas temporales para la edicion local.

El modelo es relevante porque aborda tres tareas tradicionalmente separadas (sintesis, edicion y control expresivo) dentro de un mismo pipeline no autorregresivo, lo que reduce la latencia frente a enfoques autoregresivos token a token. Su tamano compacto (0.6B parametros en el componente LLM) lo hace apto para despliegue en hardware modesto, y su licencia Apache 2.0 facilita el uso comercial. La publicacion cubre cuatro idiomas (chino, ingles, japones y coreano) y se apoya en el ecosistema Qwen3, lo que simplifica la integracion con herramientas existentes.

El repositorio ocupa 11.6 GB e incluye pesos en formato safetensors y ONNX, ademas de los checkpoints de los submodelos auxiliares. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline no autorregresivo (NAR) con LLM Qwen3-0.6B + DualCodec + W2V-BERT 2.0 + alineador forzado Qwen3 |
| Parametros totales | 0.6B en el componente LLM principal; el total del pipeline no esta disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y ONNX) |
| Idiomas soportados | chino (zh), ingles (en), japones (ja), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El pipeline es no autorregresivo: el componente LLM (`llm/0p6_emotion/`) recibe texto, tokens de habla de prompt, mascaras de edicion, condiciones de duracion y etiquetas de emocion o eventos no verbales, y genera de una vez el conjunto de tokens de habla objetivo. Esos tokens se convierten a forma de onda mediante DualCodec, que a su vez utiliza caracteristicas semanticas extraidas por W2V-BERT 2.0. El alineador Qwen3-ForcedAligner-0.6B proporciona marcas temporales que permiten editar solo la region modificada de un enunciado. El modelo base declarado es Qwen/Qwen3-0.6B, lo que sugiere que el LLM generador de tokens deriva de esa familia.

Los datos de entrenamiento declarados son `amphion/Emilia-Dataset`, `amphion/Emilia-NV` y `simon3000/genshin-voice`. No se especifica el numero de horas o tokens de audio, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la innovacion de decodificacion mas alla de la naturaleza NAR del generador. La informacion disponible no permite confirmar detalles sobre atencion lineal, decodificacion especulativa ni estrategias de alineacion adicionales.

## Capacidades

- Sintesis de voz a partir de texto preservando las caracteristicas del hablante del audio de prompt (clonacion de voz).
- Edicion local de audio: reemplazo unicamente de la region modificada manteniendo estable el resto del enunciado, gracias a las marcas temporales del alineador forzado.
- Control de emociones y elementos paralinguisticos mediante etiquetas (emocion, eventos vocales no verbales).
- Generacion de voz en chino, ingles, japones y coreano.
- Conversion entre forma de onda y tokens discretos mediante DualCodec, con extraccion de caracteristicas semanticas con W2V-BERT 2.0.
- Alineacion forzada entre audio y texto con timestamps.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo esta orientado a TTS).
- Capacidades de vision o audio de entrada mas alla del prompt de voz: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Clonacion de voz para locuciones: el modelo sintetiza nuevo texto con la voz del audio de prompt, util para generar narraciones personalizadas o doblaje manteniendo la identidad vocal del hablante original.
- Edicion de podcasts y locuciones: permite corregir una palabra o frase concreta de una grabacion sin regenerar el resto del audio, ya que el alineador forzado delimita la region a sustituir y el generador NAR reemplaza solo ese tramo.
- Postproduccion de audiolibros: cambio de entonacion o correccion de errores en fragmentos puntuales conservando la coherencia del resto del capitulo.
- Control expresivo en asistentes de voz: incorporacion de etiquetas de emocion y eventos no verbales para generar respuestas mas naturales en dialogos hablados.
- Localizacion de contenido audiovisual: generacion de voces en chino, ingles, japones y coreano a partir de un mismo prompt, util para doblaje multilingue con identidad vocal consistente.
- Prototipado rapido de interfaces de voz: al ser un modelo compacto (0.6B en el LLM) con licencia Apache 2.0, se puede desplegar en entornos de desarrollo para iterar sobre experiencias conversacionales sin depender de APIs externas.
- Investigacion en edicion de habla: la separacion modular (LLM, codec, extractor semantico, alineador) facilita experimentar con cada componente de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 11.6 GB e incluye varios submodelos (LLM 0.6B, DualCodec, W2V-BERT 2.0 y alineador 0.6B), por lo que el consumo agregado en memoria supera el de un unico modelo de 0.6B; se recomienda reservar al menos 16 GB de VRAM para cargar todos los componentes en precision nativa.
- GPU recomendadas: no especificadas por el autor. Por el tamano de los componentes, una RTX 4090 (24 GB) o una A100/H100 son opciones razonables para ejecutar el pipeline completo; una GPU consumer de 8-12 GB podria requerir cuantizacion o carga secuencial de submodelos.
- Cabe en GPU consumer: probablemente si en modelos con 16 GB o mas, aunque no hay confirmacion oficial.
- Opciones de despliegue: el repositorio incluye pesos ONNX y safetensors, lo que permite usar ONNX Runtime ademas de PyTorch. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI; al ser un pipeline TTS multi-componente, el despliegue se realiza a traves del codigo de viitor-ai/viitor-voice-nar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ViiTorVoice-NAR (este) | 0.6B (LLM) + codec + alineador | no disponible | zh, en, ja, ko | Apache 2.0 | NAR, clonacion y edicion local |
| Qwen3-TTS | no disponible | no disponible | no disponible | no disponible | Familia referenciada en los tags del repo |
| Alternativas TTS open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No se han publicado benchmarks que permitan validar la calidad de sintesis, la similitud vocal o la fidelidad de edicion frente a otros sistemas.
- El modelo solo cubre chino, ingles, japones y coreano; no se declara soporte para castellano ni otras lenguas.
- Riesgo de alucinacion y artefactos en la generacion de habla: al ser un modelo NAR, errores en las mascaras de edicion o en la alineacion pueden producir sustituciones incompletas o discontinuidades audibles.
- La clonacion de voz plantea riesgos de suplantacion de identidad y uso indebido; aunque la licencia es Apache 2.0, es responsabilidad del usuario cumplir la normativa aplicable sobre sintesis de voz y consentimiento del hablante.
- La licencia Apache 2.0 se aplica al repositorio, pero la model card advierte de que deben revisarse los terminos de licencia de cada submodelo (Qwen3, DualCodec, W2V-BERT 2.0 y el alineador) antes de su uso en produccion.
- La estructura de directorios debe mantenerse intacta salvo que se modifique el codigo de carga; un reempaquetado incorrecto rompe el pipeline.
- No hay informacion sobre sesgos demograficos o acusticos del dataset de entrenamiento (Emilia, Emilia-NV, genshin-voice), lo que impide evaluar su cobertura de acentos y variedades dialectales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/elevenlabs-speech
- Repositorio GitHub: https://github.com/viitor-ai/viitor-voice-nar
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ZzWater/ViiTorVoice
- Notebook referenciado en la model card: https://cuty.io/pQGWF3c7
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset Emilia: https://huggingface.co/datasets/amphion/Emilia-Dataset
- Dataset Emilia-NV: https://huggingface.co/datasets/amphion/Emilia-NV
- Dataset Genshin Voice: https://huggingface.co/datasets/simon3000/genshin-voice
