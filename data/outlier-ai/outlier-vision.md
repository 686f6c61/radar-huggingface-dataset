# Outlier-Ai/Outlier-Vision

## Resumen

Outlier-Vision es un modelo multimodal de la familia Outlier, desarrollado por Outlier-Ai (vinculado a la plataforma de anotacion y entrenamiento con expertos humanos Outlier AI, parte de Scale AI). Se distribuye como artefacto de investigacion en formato MLX, optimizado para inferencia local en Apple Silicon (M1 a M4), e integra una torre de vision, un codificador de audio y soporte de video sobre una base de tipo Qwen3.5 MoE. El repositorio tiene 35.107.181.936 parametros totales en safetensors y un tamano de 20,4 GB, lo que sugiere pesos cuantizados a 4 bits.

La relevancia del modelo radica en su propuesta de despliegue totalmente local y offline en Mac: vision, audio y video en un unico modelo con contexto declarado de 256K tokens, sin depender de servicios en la nube. No obstante, la propia model card marca este repositorio como superseded: es un artefacto de una linea anterior de Outlier, conservado por reproducibilidad, y no la descarga recomendada. El tier multimodal vigente es Outlier Vision 35B-A3B, al que este repositorio redirige.

La informacion publica disponible es escasa y parcialmente contradictoria: la model card no documenta el entrenamiento, los datos ni los benchmarks, y algunos datos tecnicos provienen solo de resultados de busqueda. Todo dato no confirmado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE) con torre de vision, codificador de audio y soporte de video |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (segun resultado de busqueda; no confirmado en la model card) |
| Tipos de cuantizacion | 4-bit (tag `4-bit`; pesos MLX) |
| Idiomas soportados | 13 idiomas (segun metadatos de la pagina de HF); lista concreta no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer con mezcla de expertos (MoE) de la familia Qwen3.5, envuelta en una clase condicional para generacion multimodal que anade una torre de vision, un codificador de audio y procesamiento de video. Los pesos estan empaquetados para MLX, el framework de Apple para ejecucion en Metal sobre chips de la serie M, con cuantizacion a 4 bits.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card indica explicitamente que se trata de un artefacto de investigacion o preview que puede contener adaptadores, overlays o variantes de cuantizacion experimentales que no llegaron al producto final, y que cualquier afirmacion tecnica de revisiones anteriores de la tarjeta debe considerarse provisional.

## Capacidades

- Generacion de texto y conversacion multi-turno (tags `chat`, `conversational`).
- Vision: respuesta a preguntas visuales (pipeline declarado Visual Question Answering) e image-to-text.
- Audio: codificador de audio integrado para comprension de entrada de voz.
- Video: soporte de comprension de video segun la descripcion del modelo.
- Capacidades multilingues: 13 idiomas declarados en los metadatos.
- Ejecucion local y offline en Apple Silicon (M1, M2, M3, M4) mediante MLX y Metal.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente visual local en Mac: analisis de capturas de pantalla, documentos escaneados o fotografias sin enviar datos a la nube, aprovechando la ejecucion offline sobre Metal y el contexto largo para mantener el hilo de la conversacion.
- Transcripcion y analisis de reuniones: el codificador de audio permite procesar la entrada de voz y combinarla con texto en una misma sesion, util para resumenes locales en entornos con requisitos de privacidad.
- Analisis de video para revision de contenido: comprension de clips y extraccion de descripciones o etiquetas en flujos de trabajo de edicion o moderacion que se ejecutan en el propio equipo.
- Accesibilidad: descripcion de imagenes y contenido audiovisual en tiempo real para usuarios con discapacidad visual, sin dependencia de conectividad.
- Procesamiento de documentos con contexto largo: ingesta de documentacion extensa junto con imagenes de diagramas o tablas, apoyandose en la ventana de 256K tokens declarada.
- Prototipado e investigacion en multimodalidad: al ser un artefacto de investigacion con licencia Apache 2.0, sirve para experimentar con arquitecturas MoE multimodales en hardware de consumo Apple antes de migrar al tier vigente (Outlier Vision 35B-A3B).
- Automatizacion de catalogos de producto: generacion de descripciones y metadatos a partir de imagenes de producto en lotes locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tabla de evaluacion (solo una referencia generica a "Eval Results (legacy)" en los metadatos de la pagina, sin cifras accesibles), y los resultados de busqueda no aportan numeros verificables.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 20,4 GB en pesos de 4 bits, por lo que se requiere al menos ese margen de memoria unificada mas el overhead de contexto y del runtime MLX; no se dispone de cifras oficiales.
- GPU recomendadas: no aplica GPU discreta; el modelo esta pensado para Apple Silicon (M1, M2, M3, M4) con Metal. No se documenta soporte para A100, H100 o RTX 4090.
- Cabe en hardware de consumo: si, en Macs con memoria unificada suficiente (orientativamente 24-32 GB o mas), aunque el dato exacto no esta publicado.
- Opciones de despliegue: MLX (libreria declarada) y la aplicacion de escritorio Outlier para Mac; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Outlier-Vision (este repo) | 35,1B totales | 256K (no confirmado) | MLX 4-bit | Apache 2.0 | Superseded, artefacto de investigacion |
| Outlier Vision 35B-A3B | no disponible | no disponible | MLX 4-bit | no disponible | Tier multimodal vigente |
| Outlier Core 27B | no disponible | no disponible | MLX 4-bit | no disponible | Tier por defecto vigente |
| Outlier Nano 4B | no disponible | no disponible | MLX 4-bit | no disponible | Tier de entrada vigente |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos alternativos para una comparacion cuantitativa.

## Limitaciones y advertencias

- Repositorio marcado como superseded y archivado: no es la descarga recomendada ni esta pensado para produccion; el autor redirige a Outlier Vision 35B-A3B.
- Artefacto de investigacion: puede contener adaptadores u overlays experimentales no validados en el producto final.
- Documentacion tecnica incompleta: sin datos de entrenamiento, benchmarks, parametros activos ni lista de idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluacion publicada que lo cuantifique.
- Sesgos: no documentados en la informacion disponible.
- Limitaciones de plataforma: disenado para MLX/Apple Silicon; no hay rutas de despliegue documentadas para CUDA u otras plataformas.
- Licencia Apache 2.0: permite uso comercial, pero el estado de artefacto de investigacion desaconseja su uso en produccion sin validacion propia.
- Trazabilidad dudosa: parte de las capacidades (audio, video, contexto de 256K) proviene solo de resultados de busqueda y no de la model card oficial.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Vision
- README del repositorio: https://huggingface.co/Outlier-Ai/Outlier-Vision/blob/main/README.md
- Sitio del producto: https://outlier.host/
- Tier vigente Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Plataforma Outlier AI: https://outlier.ai/
- Sobre Outlier AI: https://outlier.ai/about-us
