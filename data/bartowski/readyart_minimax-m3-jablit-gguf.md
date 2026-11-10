# bartowski/ReadyArt_Minimax-M3-jablit-GGUF

## Resumen

ReadyArt_Minimax-M3-jablit-GGUF es una colección de cuantizaciones GGUF del modelo Minimax-M3-jablit, generada por bartowski con llama.cpp (release b12180) e imatrix. El modelo base, publicado por ReadyArt, parte del checkpoint original MiniMax-M3 (427B parámetros, arquitectura MoE) y le aplica dos transformaciones experimentales: abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) y jacobian-lens (una técnica de modificación del comportamiento en inferencia). El resultado es un modelo de 426.174.572.928 parámetros totales según los safetensors del checkpoint, con capacidad multimodal texto-imagen (requiere el fichero mmproj para la torre de visión).

La relevancia de esta ficha es acotada y hay que enmarcarla con honestidad: el repo registra 0 descargas y 0 likes en el momento de la consulta, la licencia es "minimax-community" (etiquetada como "other", no es una licencia open source estándar) y las transformaciones aplicadas (abliteration, jacobian-lens) son explícitamente experimentales. No hay datos publicados de benchmarks ni de evaluación de la calidad tras las modificaciones. Se trata, por tanto, de un artefacto de investigación para quien quiera reproducir o inspeccionar cuantizaciones GGUF de un MoE de gran tamaño, no de un modelo recomendado para producción sin validación previa.

El formato GGUF permite ejecutar el modelo con llama.cpp en configuraciones de memoria muy diversas, pero con 427B parámetros incluso la cuantización Q4_K_M ocupa 269,66 GB, lo que exige hardware de múltiples GPU o servidores con memoria unificada grande. La ventana de contexto no aparece especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer; multimodal texto-imagen con torre de visión vía mmproj |
| Parametros totales | 426.174.572.928 (según safetensors del checkpoint); 427B indicado en la model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_M, Q4_1, IQ4_NL (imatrix); ficheros divididos (split) en todos los casos |
| Idiomas soportados | no disponible (la model card no lista idiomas) |
| Licencia | minimax-community (etiquetada "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizado con llama.cpp b12180); soporta mmproj para visión |

## Arquitectura y entrenamiento

El modelo base MiniMax-M3 es un transformer con arquitectura de mezcla de expertos (MoE) de 427B parámetros, según la model card. La información disponible no detalla el número de expertos, el ratio de activación, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa ni la arquitectura exacta de la torre de visión que acompaña el fichero mmproj.

Sobre el checkpoint de ReadyArt se aplican dos modificaciones destacadas en las etiquetas: abliteration, que típicamente identifica una dirección en el espacio de activaciones asociada a rechazos y la resta de los pesos para reducir negativas, y jacobian-lens, una técnica experimental de intervención sobre el comportamiento del modelo. La model card del cuantizador no documenta metodología, hiperparámetros ni evaluación de estas intervenciones, por lo que no es posible verificar su efecto sobre la calidad, la coherencia o la seguridad del modelo. El prompt format documentado incluye un modo de razonamiento "thinking" con etiquetas `<mm:think>` y modos enabled/disabled/adaptive, además de un formato XML específico para tool calling con bloques `]<]minimax[>[<tool_call>`.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de prompt propio basado en roles system/developer/user/ai.
- Razonamiento step-by-step mediante modo thinking (`<mm:think>`), configurable como enabled, disabled o adaptive.
- Tool calling / function calling con definición de herramientas en JSONSchema y invocación en bloques XML anidados.
- Procesamiento de imágenes junto a texto (pipeline image-text-to-text), siempre que se cargue el fichero mmproj correspondiente.
- Razonamiento multi-paso orientado a agentes, con instrucción explícita de pensar ante resultados de funciones y decisiones complejas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta soporte de audio ni de otras modalidades distintas de texto e imagen.

## Casos de uso

- Agentes con tool calling: el formato XML documentado permite definir herramientas en JSONSchema e invocar varias en un mismo bloque, lo que encaja en orquestadores de agentes que necesiten llamadas encadenadas a APIs externas.
- Análisis de documentos con imágenes: al ser image-text-to-text con mmproj, puede procesar capturas, diagramas o páginas escaneadas junto a instrucciones textuales para extracción de información.
- Razonamiento adaptativo en pipelines de decisión: el modo thinking adaptive permite que el modelo decida cuándo razonar en profundidad, útil en flujos donde no todas las consultas requieren el mismo coste computacional.
- Investigación sobre abliteration y steering: el checkpoint modificado sirve para estudiar el efecto de intervenciones en activaciones sobre el comportamiento de rechazo en un MoE grande.
- Evaluación de cuantizaciones GGUF a gran escala: los ficheros Q4_K_M (269,66 GB) y Q5_K_M (326,30 GB) permiten medir la degradación de calidad de un MoE de 427B bajo cuantización con imatrix.
- Despliegue local en servidores multi-GPU: con llama.cpp y los ficheros split, puede servirse en entornos con memoria agregada suficiente para las variantes más pequeñas (IQ4_NL, Q4_1, Q4_K_M).
- Reproducción de entornos de chat con formato propietario: el prompt format con roles developer y etiquetas minimax permite integrar el modelo en clientes que ya implementen ese protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más overhead. IQ4_NL y Q4_1 rondan 269 GB, Q4_K_M 269,66 GB, Q5_K_S 304,18 GB, Q5_K_M 326,30 GB, Q6_K_S 358,82 GB, Q6_K 376,38 GB y Q8_0 453,61 GB.
- GPU recomendadas: no es viable en una sola GPU de 80 GB (A100/H100) en ninguna cuantización; requiere agregación de memoria en múltiples aceleradores o servidores con memoria unificada muy grande.
- No cabe en GPU consumer (RTX 4090 de 24 GB, ni siquiera en configuraciones multi-GPU convencionales por el volumen de pesos).
- Opciones de despliegue: llama.cpp (versión b12180 usada para cuantizar) y servidores compatibles con GGUF; el repo está etiquetado como endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReadyArt_Minimax-M3-jablit (esta ficha) | 426,17B (MoE) | no disponible | minimax-community | GGUF cuantizado | Abliteration + jacobian-lens, experimental, 0 descargas |
| MiniMax-M3 (base original) | 427B (MoE) | no disponible | minimax-community | safetensors (checkpoint original) | Sin modificaciones de abliteration; referencia para comparar el efecto de las intervenciones |
| ReadyArt/Minimax-M3-jablit | 427B (MoE) | no disponible | no disponible | safetensors | Checkpoint intermedio del que derivan estas cuantizaciones; misma base experimental |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo explícitamente experimental: combina abliteration y jacobian-lens sin evaluación publicada de calidad, coherencia ni seguridad.
- Riesgo elevado de alucinación y de respuestas degradadas por las intervenciones sobre activaciones; no hay benchmarks que lo cuantifiquen.
- La abliteration reduce rechazos, lo que puede aumentar la probabilidad de contenido dañino o no filtrado; requiere capas de moderación externas en producción.
- Licencia "minimax-community" (etiquetada "other"): conviene revisar el fichero LICENSE del repo antes de cualquier uso comercial; no es una licencia open source estándar.
- Idiomas soportados no documentados; no se puede asumir calidad en castellano ni en otros idiomas sin evaluación propia.
- Longitud de contexto no especificada; planificar los despliegues sin asumir una ventana concreta.
- Tamaño prohibitivo: incluso la cuantización más pequeña supera los 260 GB, lo que limita el despliegue a infraestructura especializada.
- Repo sin tracción (0 descargas, 0 likes) y sin señales de mantenimiento; el soporte comunitario es prácticamente inexistente.
- El formato de tool calling usa etiquetas XML propietarias; requiere adaptar los parsers del orquestador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/ReadyArt_Minimax-M3-jablit-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Minimax-M3-jablit
- llama.cpp (release usada para cuantizar): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
