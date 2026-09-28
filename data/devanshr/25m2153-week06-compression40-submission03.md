# DevanshR/25M2153-Week06-Compression40-Submission03

## Resumen

Este repositorio, publicado por el usuario DevanshR bajo el identificador `DevanshR/25M2153-Week06-Compression40-Submission03`, contiene un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base. Por la nomenclatura ("Week06", "Compression40", "Submission03") parece tratarse de una entrega académica o de un experimento de compresión de modelo, pero la model card no documenta el procedimiento concreto aplicado, ni los datos de entrenamiento, ni el método de compresión. La model card publicada es una copia literal de la de Qwen3.5-4B, por lo que las especificaciones técnicas que se detallan a continuación corresponden al modelo base y no necesariamente al artefacto resultante de este ajuste.

Qwen3.5-4B es un modelo multimodal de la familia Qwen3.5 desarrollado por el equipo Qwen de Alibaba. Se trata de un transformer causal con encoder de visión que combina atención lineal (Gated DeltaNet) y atención tradicional con compuertas (Gated Attention) en un esquema híbrido, con un total de 4.000 millones de parámetros y 32 capas. Integra además entrenamiento con predicción multi-token (MTP) y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000.

Su relevancia radica en que combina capacidades multimodales (imagen-texto-a-texto) con una arquitectura de atención híbrida orientada a reducir el coste de inferencia en contextos largos, además de soporte declarado para 201 idiomas y dialectos. El repositorio concreto aquí analizado no aporta métricas propias ni documentación del ajuste, por lo que debe tratarse con cautela y verificar su comportamiento real antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; hibrido de Gated DeltaNet (atencion lineal) y Gated Attention con FFN. Layout de capas: 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) = 32 capas |
| Parametros totales | 4B (corresponde al modelo base Qwen3.5-4B; el repositorio no publica recuento propio) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens de forma nativa, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el tamano del repo, 3,2 GB, sugiere pesos ya comprimidos o cuantizados, pero no se especifica el esquema) |
| Idiomas soportados | 201 idiomas y dialectos segun la model card del base; no hay lista especifica para este ajuste |
| Licencia | apache-2.0 |
| Formato de pesos | Formato nativo de Transformers (se presume safetensors); no se confirma disponibilidad de GGUF |

Otras especificaciones del base: dimension oculta 2.560; embedding de tokens 248.320 (padded, con pesos atados a la salida LM); dimension intermedia de la FFN 9.216; Gated DeltaNet con 32 cabezas de atencion lineal para V y 16 para QK (dimension de cabeza 128); Gated Attention con 16 cabezas para Q y 4 para KV (dimension de cabeza 256, dimension RoPE 64).

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal multimodal que intercala dos mecanismos de atencion. Por un lado, bloques de Gated DeltaNet, un esquema de atencion lineal recurrente que reduce el coste computacional y de memoria asociado al contexto largo en comparacion con la atencion cuadratica tradicional. Por otro, bloques de Gated Attention convencional con compuertas y RoPE parcial (dimension 64). La combinacion se organiza en ocho repeticiones de tres bloques de DeltaNet mas uno de atencion estandar, hasta un total de 32 capas. El modelo incluye un encoder de vision y se entrena con prediccion multi-token (MTP), lo que permite decodificacion especulativa y acelera la generacion. La model card destaca el uso de Mixture-of-Experts disperso como rasgo general de la familia Qwen3.5, pero la descripcion concreta de la variante de 4B no detalla numero de expertos ni parametros activos, por lo que no puede confirmarse que esta variante sea MoE.

En cuanto al entrenamiento, la model card solo indica que el base paso por fases de preentrenamiento y postentrenamiento, con fusion temprana sobre tokens multimodales y escalado de aprendizaje por refuerzo en entornos multiagente. No se aportan cifras de tokens de entrenamiento, composicion del dataset ni detalles del ajuste RLHF/DPO. Para este repositorio en concreto, no hay absolutamente ninguna informacion sobre el procedimiento de compresion ni sobre los datos usados en el ajuste fino.

## Capacidades

- Generacion de texto y razonamiento en tareas de conocimiento y STEM, con resultados documentados en MMLU-Pro y MMLU-Redux para el modelo base.
- Comprension visual y tareas de imagen-texto-a-texto (pipeline declarado `image-text-to-text`), gracias al encoder de vision integrado.
- Procesamiento de contexto muy largo: 262.144 tokens nativos, extensible hasta 1.010.000, adecuado para documentos extensos o conversaciones multi-turno largas.
- Capacidades multilingues declaradas para 201 idiomas y dialectos.
- Soporte para decodificacion especulativa mediante MTP (prediccion multi-token entrenada).
- Compatibilidad de despliegue con Transformers, vLLM, SGLang y KTransformers, segun la model card del base.
- No se documenta explicitamente soporte de tool calling o function calling para esta variante; no disponible.
- Las capacidades anteriores corresponden al modelo base Qwen3.5-4B. No hay evidencia de que el ajuste `Compression40` las preserve en su totalidad.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir informes, expedientes o libros completos en una sola pasada sin fragmentacion, lo que simplifica pipelines de resumen y extraccion de informacion.
- Analisis de documentos con imagenes: al aceptar entrada de imagen y texto, permite extraer datos de capturas, diagramas o formularios escaneados combinados con texto explicativo.
- Asistente conversacional multilingue: los 201 idiomas declarados lo hacen apto para atencion al usuario en mercados diversos, aunque la calidad por idioma no esta verificada en esta variante.
- Generacion de codigo asistida: el modelo base declara paridad o mejora frente a Qwen3-VL en tareas de codigo y agentes; este ajuste podria integrarse en editores o asistentes de desarrollo, previa validacion del efecto de la compresion.
- Investigacion academica sobre compresion de modelos: dado el nombre del repositorio, sirve como material de estudio para comparar el rendimiento de un modelo de 4B antes y despues de un proceso de compresion al 40 %.
- Despliegue en hardware modesto: con 4B parametros y un repo de 3,2 GB, es candidato para entornos sin GPU de gama alta, siempre que se valide la degradacion introducida por el ajuste.
- Prototipado rapido con contexto largo: la combinacion de atencion lineal y tamano reducido permite experimentos de razonamiento sobre secuencias largas con coste de memoria contenido.
- Clasificacion y resumen de grandes volumenes de texto en pipelines por lotes, apoyandose en la ventana de contexto ampliada.

## Benchmarks y rendimiento

La model card del base solo incluye resultados para la seccion "Knowledge & STEM"; el resto de la tabla aparece truncada en la informacion disponible. Los unicos datos legibles son los siguientes (comparativa sobre MMLU-Pro y MMLU-Redux):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible (truncado) | no disponible (truncado) |

No se han publicado resultados de benchmarks especificos para el ajuste `DevanshR/25M2153-Week06-Compression40-Submission03`. Los valores anteriores corresponden a Qwen3.5-4B (modelo base) y no deben atribuirse al artefacto comprimido sin verificacion.

## Requisitos de hardware

- Inferencia en bf16/fp16: aproximadamente 8-9 GB de VRAM para los pesos, mas el encoder de vision y la cache de atencion. Encaja en GPUs de 12-16 GB.
- Cuantizacion a int8: aproximadamente 4-5 GB de VRAM; viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores.
- Cuantizacion a int4: aproximadamente 2,5-3,5 GB de VRAM; cabe en GPUs de 8 GB e incluso en algunas de 6 GB con contexto reducido.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060/4070/4080/4090) para cuantizaciones de 8 bits o menores; A100/H100 no son necesarias para un modelo de 4B, aunque aportarian mayor throughput en despliegues concurrentes.
- Contexto largo: aunque el modelo soporta 262.144 tokens, la cache KV crece con la longitud de secuencia; el uso de capas de atencion lineal (Gated DeltaNet) reduce este coste en comparacion con un transformer puramente de atencion cuadratica, pero aun se requiere VRAM adicional para secuencias muy largas.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers segun la model card del base. No se confirma compatibilidad con llama.cpp u Ollama al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles. No se aportan mediciones para este repositorio ni para el base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste (Qwen3.5-4B-Base, Compression40) | 4B (base) | 262.144 (ext. 1.010.000) | no disponible (compresion sin medir) | apache-2.0 | HuggingFace, 0 descargas |
| Qwen3.5-4B (base) | 4B | 262.144 (ext. 1.010.000) | 79,1 | apache-2.0 | HuggingFace (oficial) |
| Qwen3.5-9B | 9B | no disponible | 82,5 | no disponible | HuggingFace (oficial) |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE) | no disponible | 80,9 | no disponible | no disponible |

El ajuste comparte tamano y contexto con Qwen3.5-4B, pero no se ha validado si la compresion al 40 % degrada las puntuaciones anteriores. La comparacion con GPT-OSS-20B resulta llamativa porque el modelo de 4B obtiene mejor MMLU-Pro, lo que refleja las mejoras de la generacion Qwen3.5 frente a generaciones anteriores de otros laboratorios.

## Limitaciones y advertencias

- La model card de este repositorio es una copia literal de la de Qwen3.5-4B. No describe el ajuste fino, el metodo de compresion ni los datos empleados, lo que impide reproducir o auditar el resultado.
- El nombre "Compression40" sugiere una reduccion significativa de tamano, lo que habitualmente implica perdida de calidad en tareas de razonamiento, codigo o comprension visual. Dicha perdida no esta cuantificada.
- No hay ningun benchmark publicado para este artefacto concreto; las cifras de la tabla pertenecen al modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Riesgo de alusiones incorrectas y alucinacion inherente a los modelos de lenguaje de este tamano, agravado si el ajuste introdujo alteraciones en los pesos.
- Sesgos conocidos: no documentados para este ajuste ni para el base en la informacion proporcionada.
- Cobertura de idiomas: aunque se declaran 201 idiomas para el base, no hay verificacion especifica tras la compresion.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero conviene conservar el aviso de licencia original de Qwen.
- Al ser una publicacion de un usuario individual y no del equipo Qwen, no hay garantia de soporte, mantenimiento ni correcciones futuras.
- Para produccion se recomienda validar el modelo con un conjunto propio antes de usarlo, dada la ausencia total de documentacion del ajuste.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DevanshR/25M2153-Week06-Compression40-Submission03
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo Qwen3.5-4B (referencia de la model card): https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
