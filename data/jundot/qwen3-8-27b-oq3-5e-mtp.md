# Jundot/Qwen3.8-27B-oQ3.5e-mtp

## Resumen

Qwen3.8-27B-oQ3.5e-mtp es un checkpoint cuantizado en precision mixta del modelo Qwen/Qwen3.8-27B, un modelo denso de vision-lenguaje de 27.781 millones de parametros construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot y su interes principal es que reduce un modelo de casi 28.000 millones de parametros a 13,772 GiB de pesos manteniendo un promedio efectivo de 4,258 bits por peso, lo que lo hace desplegable en equipos Apple Silicon con memoria unificada moderada sin renunciar al codigo del modelo original.

El checkpoint no es una cuantizacion uniforme: usa el esquema oQ3.5e de la herramienta oQ (oMLX v0.7.1), que asigna bits por sensibilidad medida de cada capa y despues ajusta escala y sesgo con una matriz de importancia y una refit por minimos cuadrados ponderados. Incluye los tres componentes del modelo original: el backbone de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP).

Es relevante ahora porque los modelos multimodales de ~27B en BF16 exigen del orden de 55 GB de almacenamiento y no caben en la mayoria de portatiles, mientras que este checkpoint se queda en unos 14,8 GB de repositorio y conserva la ventana de contexto nativa de 262.144 tokens, ademas de la cabeza MTP que habilita decodificacion especulativa sobre el propio modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido con capas Gated DeltaNet y Gated Attention (arquitectura Qwen3.5), con codificador de vision y cabeza de prediccion multi-token (MTP) |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Precision mixta afin 3, 4, 5 y 8 bits (grupo 64) mas capas en BF16; media efectiva 4,258 bits/peso. Esquema oQ3.5e |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (13,772 GiB / 14,788 GB) |

Desglose de la cuantizacion por precision:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afin 3 bits, grupo 64 | 21,677B | 78,028% | 8,833 GiB | 3,50 |
| Afin 4 bits, grupo 64 | 0,372B | 1,340% | 0,195 GiB | 4,50 |
| Afin 5 bits, grupo 64 | 3,945B | 14,199% | 2,526 GiB | 5,50 |
| Afin 8 bits, grupo 64 | 1,271B | 4,576% | 1,258 GiB | 8,50 |
| BF16 | 0,516B | 1,857% | 0,961 GiB | 16,00 |
| Total | 27,781B | 100% | 13,772 GiB | 4,258 |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 13,552 GB / 12,621 GiB |
| Codificador de vision | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| Total | 27,781B | 14,788 GB / 13,772 GiB |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer denso de 27B parametros con una disposicion hibrida de capas: alterna capas Gated DeltaNet (una forma de atencion lineal con estado recurrente) y capas Gated Attention clasicas. Esta mezcla busca reducir el coste de atencion en secuencias largas sin perder capacidad de recuperacion exacta de informacion, lo que explica que el modelo pueda sostener una ventana nativa de 262.144 tokens. Sobre el backbone de lenguaje se anaden dos componentes diferenciados: un codificador de vision de 0,461B de parametros, que habilita la comprension conjunta de imagen y texto, y una cabeza MTP de 0,425B, que predice varios tokens futuros de forma simultanea.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original; estos datos corresponden a la model card de Qwen/Qwen3.8-27B y no se reproducen aqui. Lo que si documenta esta ficha es el proceso de cuantizacion: oQ3.5e asigna bits por sensibilidad medida capa a capa y despues redondea cada grupo con una matriz de importancia calculada sobre 128 muestras de 512 tokens, seguido de un reajuste por minimos cuadrados ponderados de la escala y el sesgo del grupo. El resultdo es que el 78% de los pesos queda en 3 bits, mientras que las capas mas sensibles suben a 5, 8 bits o BF16. La cabeza MTP se conserva de forma explicita en el checkpoint, lo que permite usarla para decodificacion especulativa.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato conversacional.
- Comprension de imagen y texto (pipeline image-text-to-text), con entrada de imagenes.
- Comprension de video segun la descripcion del modelo base recogida en la model card.
- Razonamiento de contexto largo: ventana nativa de 262.144 tokens.
- Decodificacion especulativa mediante la cabeza MTP incluida en el checkpoint, que predice multiples tokens por paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no documentado en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos en local: gracias a los 262.144 tokens de contexto, se puede cargar un informe completo o un repositorio de documentacion y hacer preguntas sobre su contenido sin trocear el material, algo poco habitual en modelos de este tamano ejecutables en un portatil.
- Asistente multimodal sobre capturas y diagramas: al incluir codificador de vision, permite describir diagramas de arquitectura, leer capturas de pantalla con errores o extraer informacion de tablas en imagen, todo ello sin enviar datos a un servicio externo.
- Procesamiento de video en flujos de trabajo de edicion o catalogacion: la comprension de video del modelo base permite generar descripciones, resumenes o etiquetas a partir de clips, integrable en un pipeline de gestion de medios.
- Desarrollo asistido en equipos con Mac: el modelo puede usarse como completador y generador de codigo dentro del editor, con la ventaja de que los pesos residen en el equipo y no requieren conexion ni cuota de API.
- Analisis de datos sensibles en entornos regulados: al ser ejecutable en local con licencia Apache-2.0, encaja en flujos donde el texto no puede salir de la organizacion, por ejemplo documentacion clinica o expedientes internos.
- Investigacion sobre cuantizacion: el checkpoint sirve como caso de estudio reproducible de asignacion de bits por sensibilidad, util para comparar la perdida de calidad frente al modelo BF16 en tareas concretas.
- Prototipado rapido en Apple Silicon: con 13,772 GiB de pesos, se puede levantar un servidor de inferencia local en un Mac con memoria unificada suficiente para validar productos antes de invertir en infraestructura con GPU dedicada.
- Generacion de resumenes y respuestas sobre base documental larga combinando recuperacion y contexto amplio, aprovechando la decodificacion especulativa de la cabeza MTP para reducir la latencia por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint describe exclusivamente el proceso de cuantizacion y el reparto de bits por capa; no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones de calidad frente al modelo base en BF16.

## Requisitos de hardware

- Almacenamiento: 14,8 GB de repositorio, con 13,772 GiB de pesos en disco.
- Memoria para inferencia: al tratarse de un checkpoint MLX, los pesos se cargan en memoria unificada. Se necesita un minimo de 16 GB de memoria unificada y se recomienda 24 GB o mas para dejar margen a la cache KV y a las activaciones.
- Equipos compatibles: Apple Silicon (familias M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). No esta pensado para GPU NVIDIA ni AMD: el formato MLX no se ejecuta sobre CUDA.
- Modelo base en BF16 como referencia: una carga en precision completa requeriria del orden de 55,6 GB solo para los pesos, calculo estimado a partir de los 27,781B de parametros multiplicados por 2 bytes.
- Despliegue: MLX mediante mlx-lm o mlx-vlm segun se use solo texto o vision; tambien a traves de herramientas que consumen checkpoints MLX. El ecosistema oQ (github.com/jundot/omlx) es el utilizado para generar la cuantizacion.
- Formatos alternativos: esta publicacion no incluye GGUF ni safetensors en precision completa, por lo que no es directamente compatible con llama.cpp, Ollama, vLLM ni TGI sin una conversion previa.
- Latencia y throughput: no disponibles. Dependen del chip, de la longitud de contexto y de si se activa la decodificacion especulativa con la cabeza MTP.
- Cache KV para el maximo de contexto: no disponible; la model card no publica la configuracion de cabezas y capas necesaria para estimarla con rigor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ3.5e-mtp | 27,781B | 262.144 tokens | MLX safetensors | Mixta 3/4/5/8 bits + BF16, 4,258 bits/peso | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27,781B (estimado por herencia) | 262.144 tokens | Safetensors | BF16 | Apache-2.0 | HuggingFace, repositorio original |
| Otras cuantizaciones de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros checkpoints comparables en la informacion proporcionada, por lo que no es posible contrastar calidad, velocidad de inferencia ni huella de memoria frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada. El checkpoint hereda los sesgos del modelo base, que no se documentan aqui.
- Riesgo de alucinacion: no se publican evaluaciones de fidelidad, por lo que no puede cuantificarse. Es esperable que la cuantizacion a 3 bits en el 78% de los pesos introduzca degradacion adicional frente al modelo en BF16, especialmente en tareas de razonamiento numerico o codigo, aunque no hay mediciones que lo confirmen.
- La cuantizacion de 4,258 bits/peso es agresiva: cualquier uso en produccion deberia validarse contra el modelo base en las tareas concretas del caso de uso antes de adoptarlo.
- Limitaciones de idioma: no se especifica la cobertura linguistica del modelo base ni del checkpoint, asi que no puede garantizarse un rendimiento adecuado en castellano.
- Limite de contexto: 262.144 tokens de ventana nativa, pero el coste de la cache KV a esa longitud no esta documentado y puede agotar la memoria unificada de equipos de 16 GB.
- Restricciones de licencia: Apache-2.0, que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de la propia licencia (conservar avisos y atribucion). Conviene verificar que el modelo base mantiene efectivamente esa licencia.
- Dependencia de plataforma: el formato MLX limita el despliegue a hardware Apple Silicon, lo que excluye servidores con GPU NVIDIA o AMD salvo conversion previa a otro formato.
- Madurez: el repositorio registra 0 descargas y 0 likes, y esta creado y actualizado con segundos de diferencia, por lo que no cuenta con validacion de la comunidad ni historial de incidencias.
- Ausencia de benchmarks en la propia ficha: no hay ninguna tabla comparativa publicada por el autor frente al modelo base, lo que dificulta justificar la eleccion de este checkpoint frente a otros.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-27B-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de la cuantizacion mejorada oQe: https://github.com/jundot/omlx/pull/4385
