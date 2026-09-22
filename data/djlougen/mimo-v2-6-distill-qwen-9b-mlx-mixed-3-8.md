# DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-8

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-8 es una conversion de formato del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B a safetensors de MLX, publicada por el usuario DJLougen. No se trata de un entrenamiento nuevo: el modelo de partida es un ajuste supervisado (SFT) de Qwen/Qwen3.5-9B sobre datos de agente generados por MiMo, con cobertura de codigo, tareas de agente generales, codigo visual y ciberseguridad. Esta ficha describe por tanto el artefacto cuantizado, no una ejecucion de entrenamiento nueva.

El modelo es multimodal (pipeline image-text-to-text) y denso, con 9.409.813.744 parametros totales y una arquitectura Qwen3_5ForConditionalGeneration: 32 capas de texto, hidden 4096, 16 cabezas de consulta frente a 4 de clave/valor, atencion completa cada cuarta capa y una torre de vision Qwen3.5 de profundidad 27. La configuracion declara 262.144 tokens de contexto.

La relevancia de este repositorio es acotada y muy tecnica: es un ejemplo de receta de cuantizacion mixta agresiva (22 modulos a 8 bits y 228 a 3 bits, con la torre de vision congelada en BF16) generada con las predicados integrados de mlx-vlm 0.7.2, no con una busqueda de sensibilidad. El autor documenta una prueba de humo y advierte explicitamente de que no se han reejecutado los benchmarks del modelo original ni se ha medido perplejidad. El repositorio no declara licencia, ni idiomas, y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (`model_type: qwen3_5`); transformer decoder-only multimodal con atencion completa cada 4 capas y torre de vision Qwen3.5 |
| Parametros totales | 9.409.813.744 (aprox. 9,41 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (segun `config` del checkpoint) |
| Tipos de cuantizacion | MLX affine, group size 64. Este repo: mixta 3/8 bits (22 modulos a 8 bits, 228 a 3 bits); el conversor reporta 5,625 bits/peso, no recalculado de forma independiente. Otros builds citados en la model card: bf16, mixed-3-5, mixed-3-6, mixed-4-6, mixed-4-8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no la declara y la model card del checkpoint de origen tampoco) |
| Formato de pesos | safetensors en formato MLX; 1260 tensores en los builds mixtos (760 en BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only multimodal de la familia Qwen3.5. El componente de texto tiene 32 capas, dimension oculta 4096 y 16 cabezas de consulta con 4 cabezas de clave/valor; la atencion completa se aplica cada cuarta capa. La torre de vision es la de Qwen3.5, con profundidad 27, hidden 1152 y patch de 16. La plantilla de chat incluida (`chat_template.jinja`) es la de MiMo v2.6. No hay innovaciones propias de este repositorio: es una conversion de pesos, no un entrenamiento.

La receta de cuantizacion merece detalle porque es el unico aporte tecnico del artefacto. Se aplican predicados integrados de mlx-vlm (no una busqueda de sensibilidad), en modo affine con grupo de 64. Los 22 modulos que se mantienen a 8 bits son `embed_tokens` y `lm_head`, `down_proj` en las capas 0, 1, 2, 3, 6, 9, 12, 15, 18, 21, 24, 27, 28, 29, 30 y 31, y `v_proj` unicamente en las capas de atencion completa 3, 15, 27 y 31. Los otros 228 modulos cuantizados usan el ancho inferior. El predicado excluye los modulos multimodales, por lo que la torre de vision permanece en BF16. Conviene notar una discrepancia documentada: el campo `quantization.bits` de nivel superior vale 4 (valor por defecto de mlx-vlm), mientras que los valores `bits` por modulo son los realmente aplicados. El proceso se ejecuto con mlx-vlm 0.7.2 y mlx 0.32.2 (rueda CUDA 13) sobre una maquina spark-d500 con NVIDIA GB10, verificando previamente que los cuatro shards de origen coincidian con los hashes SHA-256 de LFS del Hub.

## Capacidades

- Generacion de texto y razonamiento: la prueba de humo muestra resolucion aritmetica basica (calculo del 15 % de 240) tanto en BF16 como en los builds mixtos.
- Modo de razonamiento (thinking): los builds mixed-3-6 y mixed-3-8 emitieron un bloque de pensamiento seguido de la respuesta numerica, incluso cuando la plantilla cerraba el pensamiento con `enable_thinking=False`.
- Vision: pipeline image-text-to-text; en la prueba de humo con una imagen PNG roja de 64x64 el build mixed-4-6 respondio "Red". La torre de vision se conserva en BF16.
- Codigo y tareas de agente: el SFT de origen se realizo sobre datos de agente generados por MiMo que cubren codigo, tareas generales de agente, codigo visual y ciberseguridad, segun la model card.
- Codigo visual: la mencion al "visual coding" en el dataset de SFT sugiere capacidades de generacion de interfaz a partir de entradas visuales, aunque no hay evaluacion publicada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Razonamiento multi-paso y comportamiento agentico: inferido del dataset de SFT, sin evaluacion publicada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en estacion de trabajo con GPU de gama alta: el artefacto ocupa unos 6,6 GB en disco, por lo que es viable ejecutarlo en una GPU con 16-24 GB de VRAM mediante mlx-vlm, sin enviar datos a servicios externos.
- Agentes de codigo sobre repositorios extensos: los 262.144 tokens de contexto de la configuracion permiten incluir arboles de proyecto y multiples ficheros en una sola ventana, y el SFT sobre datos de agente encaja con flujos de edicion multi-archivo.
- Generacion de interfaz a partir de capturas: con la torre de vision activa, el modelo puede recibir una imagen de referencia y producir marcado o estilos, un escenario coherente con la mencion a codigo visual en el dataset de origen.
- Analisis de documentos escaneados de gran tamano: informes, facturas o planos con tablas pueden procesarse combinando entrada visual y contexto largo para extraer datos estructurados.
- Triaje asistido en ciberseguridad: el SFT incluye datos de ciberseguridad, de modo que un uso realista es resumir alertas, explicar fragmentos de codigo sospechoso o proponer consultas de deteccion, siempre con revision humana.
- Automatizacion de tareas de varios pasos con traza de razonamiento: el modo thinking permite separar el razonamiento interno de la respuesta final, util para auditar decisiones en pipelines automatizados.
- Investigacion sobre cuantizacion agresiva: comparar este build 3/8 con los builds bf16, mixed-3-5, mixed-3-6, mixed-4-6 y mixed-4-8 del mismo autor permite medir la degradacion inducida por recetas mixtas sobre un mismo checkpoint.
- Atencion al cliente multimodal con contexto largo: conversaciones multi-turno que adjunten capturas de pantalla o fotos de producto pueden mantenerse dentro de una unica ventana de contexto, con la advertencia de que no hay datos de calidad medidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que no se reejecutaron los numeros del modelo original ni se calculo perplejidad, y que no se reportan tasas de decodificacion ni pico de memoria. El unico dato empirico es una prueba de humo con decodificacion greedy (`max_tokens=64`, `temperature=0.0`), una generacion por build:

| Build | Tipo de entrada | Resultado | Salida |
|---|---|---|---|
| bf16 | texto | correcto | `36` |
| mixed-3-5 | texto | correcto | `<value>36</value>` |
| mixed-3-6 | texto | correcto | bloque de pensamiento y despues `36` |
| mixed-3-8 | texto | correcto | bloque de pensamiento y despues `36` |
| mixed-4-6 | texto | correcto | `36` |
| mixed-4-6 | imagen | correcto | `Red` |
| mixed-4-8 | texto | correcto | `36` |

El autor califica estas diferencias de formato de salida (etiquetas `<value>` en mixed-3-5 y bloque de pensamiento en mixed-3-6 y mixed-3-8 pese a usar `enable_thinking=False`) como diferencias de calidad sobre un unico prompt, no como fallos de carga. El registro completo esta en `smoke-results.json` dentro del repositorio.

## Requisitos de hardware

- VRAM para los pesos: unos 6,6 GB (coincide con el tamano del repositorio y con los 5,625 bits/peso reportados sobre 9,41 B de parametros). El checkpoint BF16 equivalente del que deriva ocuparia aproximadamente 18,8 GB.
- VRAM real de inferencia: no disponible. La model card no reporta pico de memoria, y la cache KV para 262.144 tokens no esta cuantificada; el hecho de que solo haya atencion completa cada cuarta capa reduce ese coste, pero el mecanismo de las capas restantes no se detalla en la informacion.
- GPU recomendadas: no hay una lista publicada. La conversion y la prueba de humo se ejecutaron sobre NVIDIA GB10 (spark-d500) usando la rueda CUDA 13 de mlx 0.32.2. Cualquier GPU con 8-10 GB o mas de VRAM deberia poder alojar los pesos en contextos cortos, y una GPU de 24 GB (RTX 3090, RTX 4090) ofrece margen para contextos mayores, aunque son estimaciones a partir del tamano del repo, no cifras verificadas.
- Cabe en GPU de consumo: si, segun el tamano de pesos, en tarjetas de 8-12 GB para contexto corto y con holgura en tarjetas de 16-24 GB.
- Opciones de despliegue: el repositorio esta en formato MLX y se carga con `mlx_vlm.load` mas `mlx_vlm.generate` (mlx-vlm 0.7.2). No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requeririan una reconversion no incluida. No hay indicios de soporte en vLLM o TGI para este artefacto concreto.
- Latencia y throughput: no disponible. La model card indica que no se reportan tasas de decodificacion porque la llamada BF16 fue en frio y las salidas posteriores tuvieron entre 3 y 64 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|---|
| DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-8 | 9,41 B | 262.144 | safetensors MLX, mixta 3/8 bits (5,625 bits/peso) | no disponible | no (solo prueba de humo) | HuggingFace, 0 descargas, 0 likes |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (origen) | 9,41 B | 262.144 | safetensors BF16 | no declarada en su model card | no reejecutados en esta conversion | HuggingFace |
| Builds hermanos mixed-3-5, mixed-3-6, mixed-4-6, mixed-4-8 | 9,41 B | 262.144 | safetensors MLX, mixtas | no disponible | no | mismo autor |
| Qwen/Qwen3.5-9B (base del SFT) | aprox. 9 B | no disponible | BF16 | no disponible en la informacion | no disponible en la informacion | HuggingFace |

No hay datos de rendimiento que permitan comparar estos artefactos entre si ni con alternativas externas de la misma categoria; la informacion disponible se limita a la arquitectura, el proceso de conversion y la prueba de humo descrita.

## Limitaciones y advertencias

- Licencia sin declarar: ni este repositorio ni la model card del checkpoint de origen especifican licencia. Esto impide determinar si el uso comercial esta permitido; en la practica, tratarlo como no apto para produccion comercial sin aclaracion previa del titular.
- Degradacion por cuantizacion: los builds de 3 bits muestran diferencias de comportamiento en la prueba de humo (bloques de pensamiento emitidos con `enable_thinking=False` y envoltura de la respuesta en etiquetas `<value>`), lo que sugiere inestabilidad en el control del formato de salida.
- Ausencia total de evaluacion de calidad: no hay perplejidad, benchmarks ni mediciones de latencia o memoria. El unico dato empirico es una generacion por build sobre un unico prompt.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se aplica el riesgo habitual de los modelos generativos de 9 B cuantizados a 3 bits en la mayoria de sus modulos.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes, creado y actualizado el mismo dia (21 de septiembre de 2026), sin mantenimiento posterior documentado.
- Idiomas no declarados: no se puede confirmar cobertura multilingue ni el comportamiento en castellano.
- Mezcla de precisiones: la torre de vision permanece en BF16 mientras que el cuerpo de texto usa mayoritariamente 3 bits, lo que puede producir desajustes entre la representacion visual y el razonamiento textual.
- No es reproducible como entrenamiento: es una conversion de pesos; los fallos de calidad no pueden corregirse sin volver al checkpoint de origen.
- Frontera de contexto no verificada: aunque la configuracion declara 262.144 tokens, no se ha probado el modelo con contextos largos y no se conoce el consumo de memoria asociado.
- Restricciones de despliegue: al ser MLX, no se integra directamente en pilas de inferencia habituales como vLLM, TGI, llama.cpp u Ollama.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-8
- Modelo de origen (BF16): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Revision concreta del checkpoint de origen citada en la model card: `f2773fb482ac3dd047a4af4003b86e56b7225d0d`
- Modelo base del ajuste supervisado: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de la prueba de humo: `smoke-results.json` en el repositorio
- Plantilla de chat: `chat_template.jinja` en el repositorio
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces encontrados no guardan relacion con la ficha.
