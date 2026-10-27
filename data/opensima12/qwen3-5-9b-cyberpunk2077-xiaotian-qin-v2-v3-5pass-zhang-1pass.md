# opensima12/Qwen3.5-9B-Cyberpunk2077-Xiaotian-Qin-V2-V3-5pass-Zhang-1pass

## Resumen

Este modelo es un ajuste fino (fine-tune) del checkpoint Shift90 de la familia Qwen3.5, con 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) según los pesos en safetensors publicados en el repositorio. Lo publica el usuario `opensima12` y está especializado en el videojuego Cyberpunk 2077: el nombre del checkpoint (`Qwen3.5-9B-Cyberpunk2077-Xiaotian-Qin-V2-V3-5pass-Zhang-1pass`) y el identificador de la ejecución de entrenamiento (`cp2077_xt_qv23_5p_z1p_32g_b32_s42_j7757384`) indican que se han mezclado o combinado varios procesos de ajuste sobre contenidos del juego, presumiblemente para generación de diálogo, descripciones o decisiones de acción dentro del mismo.

El modelo se distribuye como exportación de HuggingFace del checkpoint final (`checkpoint-123`) del mencionado run, partiendo del checkpoint `checkpoint-3876` del modelo base `ltzheng/Qwen3.5-9B-General-Game-Stage2-Shift90`. Mantiene los pesos de visión y la cabeza MTP (predicción multi-token) del modelo original, y la model card advierte de que debe decodificarse con `skip_special_tokens=False` porque los delimitadores de acción forman parte de la salida esperada.

Su relevancia es limitada y muy específica: se trata de un artefacto de investigación sin evaluación publicada, con cero descargas y cero likes en el momento de redactar esta ficha, sin licencia declarada y sin conjunto de validación según el propio autor. Es interesante como ejemplo de pipeline de ajuste multimodal de grano fino sobre un transformer de ~9,6B con contexto de entrenamiento de 128K, pero no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (tag `qwen3_5`), con torre de visión y cabeza MTP (multi-token prediction) conservadas según la model card |
| Parametros totales | 9.653.104.368 (~9,65B), dato de los safetensors |
| Parametros activos | No aplica (no se indica que sea MoE; el recuento total coincide con un modelo denso) |
| Longitud de contexto | 128K según la configuración de entrenamiento citada en la model card; no se especifica de forma independiente la ventana de inferencia |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline declarado | `image-text-to-text` (multimodal entrada imagen + texto) |
| Tamano del repositorio | 57,9 GB |
| Modelo base | `ltzheng/Qwen3.5-9B-General-Game-Stage2-Shift90` (checkpoint-3876) |
| Checkpoint exportado | `checkpoint-123` del run `cp2077_xt_qv23_5p_z1p_32g_b32_s42_j7757384` |
| Fecha de creacion / actualizacion | 2026-10-27 / 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5 en su variante de ~9,6B parámetros, es decir, un transformer denso (no se anuncia mezcla de expertos) al que se le conservan dos componentes adicionales: la torre de visión, que habilita el pipeline `image-text-to-text`, y la cabeza MTP, empleada habitualmente para decodificación especulativa o predicción de varios tokens por paso. El repositorio incluye únicamente pesos en safetensors para `transformers`, sin versiones cuantizadas ni convertidas a otros formatos de inferencia.

El entrenamiento se realizó, según la model card, sobre 32 GPUs con un global batch size de 32, secuencias de 128K tokens, semilla 42 y sin conjunto de validación. El proceso combina varias pasadas de ajuste sobre datos de Cyberpunk 2077 (la nomenclatura "5 passes" para Xiaotian Qin V2/V3 y "1 pass" para Zhang/Zhang2 sugiere etapas o mezclas de datasets distintos) partiendo del checkpoint-3876 del modelo base Shift90. No se documentan número total de tokens, composición del dataset, ni si hubo RLHF, DPO o preferencias; tampoco se describe ninguna innovación técnica propia más allá de la herencia de visión y MTP.

## Capacidades

- Generación de texto conversacional multimodal: acepta imagen y texto como entrada y produce texto, según el `pipeline_tag` declarado.
- Interpretación de imágenes: la torre de visión se mantiene en los pesos exportados, por lo que se conserva la capacidad de describir o razonar sobre capturas y material gráfico.
- Predicción multi-token (MTP): la cabeza correspondiente se conserva, lo que en principio permite decodificación especulativa o generación acelerada, siempre que el runtime la soporte.
- Emisión de delimitadores de acción: el modelo está entrenado para producir tokens especiales que marcan acciones; la model card exige decodificar con `skip_special_tokens=False` para no perderlos.
- Especialización temática en Cyberpunk 2077: diálogo, descripciones y estructura de acciones propias del juego.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo "thinking" o razonamiento explícito: no disponible (no se documenta).

## Casos de uso

- Generación de diálogo NPC en prototipos de mods de Cyberpunk 2077: el ajuste sobre el dominio del juego y la ventana de 128K tokens permiten mantener el contexto de una conversación larga con el jugador y referencias al lore sin salir del personaje.
- Narración automática de partidas o "actual play": a partir de capturas de pantalla (entrada de imagen) y del historial de acciones, el modelo puede generar crónicas coherentes con lo ocurrido en la sesión.
- Etiquetado y clasificación de escenas del juego: usar la torre de visión para describir capturas y anotar localizaciones, personajes o elementos, siempre con revisión humana dado que no hay métricas publicadas.
- Investigación sobre ajuste fino multimodal de dominio estrecho: sirve como caso de estudio reproducible (semilla, batch size, GPUs y checkpoint de partida documentados) para analizar cómo se degrada o especializa un modelo de 9,6B al sobreajustarlo a un único videojuego.
- Generación de contenido para comunidades y wikis: borradores de descripciones de misiones, fichas de personajes o guiones de vídeo, con edición humana obligatoria.
- Pruebas de pipelines de decodificación con tokens especiales: útil para validar infraestructura que necesite `skip_special_tokens=False` y parseo de delimitadores de acción en entornos controlados.
- Base para experimentos de decodificación especulativa: al conservar la cabeza MTP, permite comparar latencias frente a decodificación autoregresiva estándar en el mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el run se realizó sin conjunto de validación y que las comprobaciones estructurales y de checksum de la subida no constituyen una evaluación del rendimiento en el juego. No existen datos de MMLU, HumanEval, GSM8K ni de métricas específicas de la tarea.

## Requisitos de hardware

- Pesos en BF16: ~19,3 GB solo para los parámetros (9,65B × 2 bytes), más overhead de la torre de visión y la cabeza MTP, más caché KV. En la práctica, se recomienda un mínimo de 24 GB de VRAM para contexto corto.
- Pesos en FP32: ~38,6 GB, lo que exige GPU de 48 GB o más (A6000, L40S, A100 80GB) o reparto entre varias GPU.
- Contexto largo: con 128K tokens la caché KV crece de forma significativa; para aprovechar la ventana completa conviene A100 80GB, H100 80GB o un despliegue multi-GPU con tensor parallelism.
- GPU consumer: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16 con contexto moderado; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) sería necesario cuantizar, pero el repositorio no publica pesos cuantizados.
- El tamaño del repositorio (57,9 GB) es muy superior a los ~19,3 GB esperables en BF16, lo que sugiere la presencia de ficheros adicionales (por ejemplo, estados del optimizador u otras precisiones); conviene revisar la lista de ficheros antes de descargar.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` es la vía documentada; vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura ni para este checkpoint, y llama.cpp requeriría una conversión a GGUF que no se distribuye.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`opensima12/Qwen3.5-9B-Cyberpunk2077-...`) | 9,65B | 128K (entrenamiento) | Sin evaluación publicada | No disponible | HuggingFace, 0 descargas |
| `ltzheng/Qwen3.5-9B-General-Game-Stage2-Shift90` (base) | ~9B (heredado) | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace |
| Otros modelos de ~8-9B de propósito general | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara explícitamente que no hubo conjunto de validación y que los checks de checksum no equivalen a una evaluación de rendimiento, por lo que se desconoce la calidad real del modelo incluso en su dominio objetivo.
- Riesgo de sobreajuste: seis pasadas de ajuste sobre un dominio muy estrecho (un único videojuego) hacen probable la pérdida de capacidades generales y una fuerte deriva hacia el estilo y vocabulario del título.
- Alucinación: sin datos de evaluación no hay forma de acotar la tasa de invención, especialmente en preguntas fuera del dominio de Cyberpunk 2077.
- Dependencia de tokens especiales: requiere `skip_special_tokens=False`; con plantillas de chat o APIs estándar que limpian tokens especiales, la salida de acciones se rompe y el comportamiento del modelo puede degradarse de forma difícil de diagnosticar.
- Licencia no declarada: no se especifican términos de uso, lo que impide determinar si el uso comercial está permitido; además, la licencia del modelo base y de Qwen3.5 condiciona cualquier redistribución.
- Idiomas no declarados: se desconoce si conserva las capacidades multilingües del modelo original o si el ajuste las ha reducido drásticamente.
- Posible contenido de terceros: al entrenar sobre material de un videojuego comercial, pueden existir implicaciones de derechos de autor sobre los datos de entrenamiento y sobre las salidas generadas.
- Repositorio de gran tamaño (57,9 GB) con 0 descargas y 0 likes: artefacto experimental, sin comunidad que lo haya validado ni reportado errores.
- No hay pesos cuantizados publicados, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/opensima12/Qwen3.5-9B-Cyberpunk2077-Xiaotian-Qin-V2-V3-5pass-Zhang-1pass
- Modelo base: https://huggingface.co/ltzheng/Qwen3.5-9B-General-Game-Stage2-Shift90
- Paper, blog o repositorio del autor: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible
- Documentación de la familia Qwen3.5: no disponible en la información proporcionada
