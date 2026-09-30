# Baekpica/MiMo-V2.6-Flash-MOPD-Mixed-Quant-GGUF

## Resumen

MiMo-V2.6-Flash-MOPD-Mixed-Quant-GGUF es una cuantizacion de precision mixta en formato GGUF del modelo multimodal XiaomiMiMo/MiMo-V2.6-Flash-MOPD, publicada por el usuario Baekpica. El modelo base, desarrollado por Xiaomi, es un transformer de tipo mezcla de expertos (MoE) que procesa texto, imagen, video y audio, con unos 309.766 millones de parametros totales. Esta variante fija la conversion al commit `2479e2d0029eca9a34cc7e7f55a121925f81908e` del repositorio original.

El objetivo de esta publicacion es permitir la inferencia local del modelo mediante llama.cpp, reduciendo el peso de los tensores de mayor tamano a cuantizaciones IQ2_XXS e IQ2_XS, a la vez que conserva en precision alta (Q8_0/F32) los componentes mas sensibles: atencion, capas densas, embeddings, routers, normas y los bloques de prediccion multi-token (MTP). Los componentes de entrada de vision y audio se mantienen en BF16/F32 para no degradar la ruta multimodal.

Es relevante ahora porque ofrece una receta reproducible y verificable (con SHA256SUMS y manifiesto de artefactos) para ejecutar un modelo multimodal de gran tamano, con decodificacion especulativa integrada, en hardware de gama alta pero no necesariamente de centro de datos. El conjunto completo de pesos ocupa 93.092 GB (86.699 GiB) repartidos en seis archivos, sin contar los ficheros adicionales de calibracion y reproduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto, imagen, video, audio) con bloques MTP y borrador DFlash para decodificacion especulativa |
| Parametros totales | 309.766.601.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Mixta: IQ2_XXS (gate/up de expertos enrutados), IQ2_XS (down de expertos), Q8_0 (atencion compartida, denso, embedding, output y tres bloques MTP), F32 (routers, normas, sinks), Q8_0/F32 (borrador DFlash), BF16/F32 (componentes de vision y audio) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 47 capas enrutadas, segun la auditoria por capa que describe la model card. Incluye tres bloques MTP embebidos y un borrador DFlash independiente de cinco capas con su propia mascara de embedding y configuracion, pensado para decodificacion especulativa. La ruta multimodal procesa imagen, video y audio mediante un codificador y proyector nativos que generan embeddings proyectados, que se insertan junto a los tokens de texto antes de entrar en el backbone del LLM.

La cuantizacion se genera a partir de una referencia de representacion original: los bloques de expertos en MXFP4 se reempaquetan sin cuantizacion adicional y los pesos densos en FP8 se expanden a BF16. No se parte, por tanto, de un checkpoint BF16 completo original. La calibracion combina un corpus de texto de 122 registros y 234.844 tokens MiMo (razonamiento previo, codigo, fragmentos generales y de recuperacion, prefijos de agente interactivo y trayectorias de codigo resueltas) con datos multimedia: 48 imagenes de graficos y documentos, 32 registros de voz, 24 clips de video real y 24 entradas audiovisuales conjuntas. En total, 298.411 posiciones, de las que aproximadamente el 78,7 % son texto y el 21,3 % contienen medios.

## Capacidades

- Generacion de texto y razonamiento en ingles y chino.
- Comprension de imagen, video y audio a traves de la ruta multimodal nativa (image-text-to-text, video-understanding y audio).
- Modo de pensamiento conmutable mediante `enable_thinking` en el chat template embebido.
- Soporte de conversacion multi-turno con plantilla de chat y tokenizer propios de MOPD.
- Uso de herramientas y agentes: el corpus de calibracion incluye prefijos de agente interactivo y llamadas a herramientas con argumentos estructurados.
- Generacion de codigo y resolucion de trayectorias de codigo, evidenciada en la seleccion del corpus de calibracion.
- Decodificacion especulativa mediante el borrador DFlash y los bloques MTP embebidos (calidad y velocidad no cualificadas por las pruebas de decodificacion simple).

## Casos de uso

- Analisis de documentos y graficos: el modelo puede recibir imagenes de graficos o documentos y responder preguntas sobre ellos, ya que la calibracion incluye 48 imagenes de este tipo y la ruta de vision mantiene embeddings nativos en BF16.
- Transcripcion y comprension de voz: dado que incorpora un tokenizador de audio y un codificador local en la ruta nativa, puede procesar registros de voz y combinarlos con texto en una misma conversacion.
- Analisis de video con marcas temporales: la ruta de video conserva parches temporales de dos fotogramas, limites de video y timestamps explicitos, lo que permite consultas sobre clips concretos.
- Agentes de codigo en pipelines de CI/CD: los prefijos de agente y las trayectorias de codigo resueltas del corpus indican soporte para llamadas a herramientas estructuradas, integrables en flujos automatizados de generacion y revision de codigo.
- Asistente conversacional multilingue en ingles y chino: la plantilla de chat y el tokenizador permiten gestionar dialogos multi-turno con ambos idiomas como idiomas de trabajo declarados.
- Razonamiento asistido con modo de pensamiento: activando `enable_thinking` en el template, el modelo puede generar cadenas de razonamiento antes de la respuesta final, util para tareas analiticas.
- Despliegue local de inferencia multimodal: al estar en GGUF y ejecutarse con llama.cpp, encaja en entornos on-premise que requieren procesar medios sin enviarlos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del backbone principal: 88,778 GB repartidos en cuatro shards; el conjunto de los seis archivos GGUF (incluyendo medios y DFlash) suma 93,092 GB (86,699 GiB).
- El tamano de archivo no determina por si solo la memoria de dispositivo necesaria: en tiempo de ejecucion se anaden la cache KV y los buffers de trabajo.
- La model card documenta pruebas en tres GPU RTX PRO 6000 Blackwell de 96 GB con un limite de RAM de contenedor de 272.000.000.000 bytes.
- No cabe en GPU de consumo: los 88,778 GB del backbone superan la VRAM de cualquier tarjeta para consumidor (incluidas las de 24 o 32 GB); se requiere multi-GPU o descarga parcial a CPU/RAM.
- Despliegue previsto mediante llama.cpp (build de calibracion en el commit `58367713a6935c0810103378144008df32e3d5db`), con `llama-cli` y `-ngl 999` en el ejemplo facilitado.
- Los cuatro shards principales deben permanecer en el mismo directorio y se pasa el primer shard al cargador.
- Latencia y throughput: no disponibles. La model card indica que la calidad y la velocidad de la decodificacion especulativa (MTP y DFlash) no estan cualificadas por las pruebas de decodificacion simple.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Baekpica/MiMo-V2.6-Flash-MOPD-Mixed-Quant-GGUF | Este modelo | 309.766.601.088 | Mixta (IQ2_XXS/IQ2_XS/Q8_0/F32/BF16) | GGUF | MIT | Backbone 88,778 GB, seis archivos, 93,092 GB totales |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD | Modelo base | no disponible | no disponible (referencia en MXFP4/FP8) | no disponible | no disponible | Origen de la conversion; commit fijado `2479e2d0...` |
| Baekpica/MiMo-V2.6-Flash-RL-Mixed-Quant-GGUF | Variante RL | no disponible | Receta de tensores identica (IQ2_XXS/IQ2_XS/Q8_0/F32) | GGUF | no disponible | Publicada antes; patron de receta reutilizado |

No se dispone de datos de rendimiento comparativo con modelos de otras familias de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas declarados limitados a ingles y chino (en, zh); el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan tasas ni evaluaciones de fidelidad.
- La calibracion multimedia no cubre de forma amplia agentes de interfaz de usuario (UI-agent) ni eventos acusticos: el conjunto esta centrado en graficos, documentos y voz.
- El proceso de calibracion parte de una referencia de representacion original (reempaquetado de MXFP4 y expansion de FP8 a BF16), no de un checkpoint BF16 completo original, por lo que pueden existir diferencias respecto al modelo de referencia.
- No se reutilizan las estadisticas de activacion ni los embeddings multimedia del release RL.
- La calidad y la velocidad de la decodificacion especulativa (bloques MTP embebidos y paquete DFlash) no estan validadas por las comprobaciones de decodificacion simple.
- El fichero de medios en BF16/F32 contiene componentes de modalidad de entrada, no una ruta de servicio de salida de audio cualificada.
- El ejemplo de invocacion no valida el preprocesamiento generico `--image`, `--audio` o `--video` para todas las modalidades; la comparacion del backbone con datos retenidos inserta embeddings nativos directamente.
- El filtro de deduplicacion de trayectorias es una heuristica de muestreo, no un detector semantico completo de repeticiones.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar la licencia y los terminos del modelo base y de los componentes de audio o vision que se redistribuyan.
- El modelo no registra descargas ni valoraciones en el momento de la ficha (0 descargas, 0 likes), lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-MOPD-Mixed-Quant-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Release RL con la misma receta de tensores: https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-Mixed-Quant-GGUF
- Informe tecnico (seccion 5.6): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Fichero de sumas SHA256: MQ-IQ2-XXS-XS-Q8-MM-BF16/SHA256SUMS
- Manifiesto de artefactos: MQ-IQ2-XXS-XS-Q8-MM-BF16/artifact-manifest.json
- Detalles de reproduccion y conversion: MQ-IQ2-XXS-XS-Q8-MM-BF16/reproduction/README.md
- Analisis de repeticion de herramientas: enlace truncado en la model card como https://mimo. (no disponible completo)
