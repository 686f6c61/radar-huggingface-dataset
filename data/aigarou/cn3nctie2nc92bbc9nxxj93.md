# AIGAROU/cn3nctie2nc92bbc9nxxj93

## Resumen

Tiel Coder 35B-A3B es una cuantizacion dinamica en formato GGUF del modelo ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario AIGAROU bajo el identificador `AIGAROU/cn3nctie2nc92bbc9nxxj93`. El modelo base emplea una arquitectura MoE (mezcla de expertos) de tipo Qwen3.5-MoE con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, lo que le permite mantener una velocidad de inferencia propia de un modelo mucho mas pequeno. Esta version incorpora una imatrix propia, cuantizacion dinamica de tipo unsloth-dynamic, soporte de decodificacion especulativa MTP (multi-token prediction) y la plantilla de chat Sharp embebida en el propio archivo GGUF.

El objetivo declarado del autor es el coding agentico y las conversaciones multi-turno de larga duracion: el modelo prioriza respuestas directas y breves frente a la verbosidad, sacrificando rendimiento en tareas de conocimiento tipo examen. Segun la model card, resuelve 12 de 25 problemas de SWE-bench-Live, el mismo resultado que Opus 4.6 en modo medium, y obtiene 67,2 en Claw-Eval multi-turno frente a 65,3 de su modelo base. La ventana de contexto nativa del modelo base es de 262.144 tokens, con un KV cache de menos de 5 GB en RAM a 16 bits.

Es relevante ahora porque demuestra que un MoE de ~35B con solo ~3B activos puede ejecutarse en GPUs de consumo (16-32 GB) con contexto largo y calidad de coding cercana a modelos frontera en tareas concretas, a costa de un rendimiento claramente inferior en conocimiento enciclopedico (73,7 en MMLU-Pro frente a 84,0 de Nail).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo Qwen3.5-MoE (transformer con mezcla de expertos) |
| Parametros totales | ~35.000 millones (dato del nombre del modelo base); el campo safetensors del repo indica 446.571.248, discrepancia no aclarada en la informacion disponible |
| Parametros activos | ~3.000 millones (A3B) |
| Longitud de contexto | 262.144 tokens (segun la model card) |
| Tipos de cuantizacion | GGUF dinamica (unsloth-dynamic): UD-Q2_K_XL, UD-IQ3_XXS, UD-IQ3_S, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_S, UD-Q4_K_XL, UD-Q5_K_S y superiores |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); existe version MLX oQ4e publicada aparte |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5-MoE: alrededor de 35.000 millones de parametros totales con aproximadamente 3.000 millones activos por token, lo que reduce drasticamente el coste computacional por token frente a un modelo denso del mismo tamano. Esta version concreta no reentrena el modelo, sino que lo recuantiza con una imatrix propia y cuantizacion dinamica (unsloth-dynamic), e integra la plantilla de chat Sharp directamente en el GGUF. Ademas incluye soporte MTP (multi-token prediction) para decodificacion especulativa en llama.cpp.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. La model card del autor atribuye la mayor parte de la diferencia en MMLU-Pro a la plantilla Sharp (respuestas mas cortas) y no a la cuantizacion: la misma cuantizacion con la plantilla original de Ornith reproduce exactamente la puntuacion de Ornith. Existen variantes no-MTP en GGUF y en MLX publicadas por el mismo autor.

## Capacidades

- Generacion de texto y razonamiento general, con especial enfasis en coding agentico.
- Generacion y edicion de codigo en flujos de trabajo sobre repositorios reales (resolucion de issues, parches).
- Vision: pipeline image-text-to-text, acepta imagenes como entrada junto a texto.
- Soporte de decodificacion especulativa mediante MTP en llama.cpp.
- Conversacion multi-turno optimizada: respuestas directas con menos preguntas aclaratorias que el modelo base (segun Claw-Eval, 3,8 puntos mas en calidad de respuesta y 5,1 puntos menos en preguntas de aclaracion).
- Eficiencia de tokens: la plantilla Sharp acorta las respuestas, lo que reduce coste y latencia en produccion.
- Capacidades multilingues limitadas a ingles y chino.
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- Reparacion de issues en repositorios reales: el modelo resuelve problemas de codigo sobre bases existentes (12 de 25 en SWE-bench-Live) y puede integrarse en un agente que lea el repositorio, localice el fallo y proponga un parche, con un tiempo mediano de 8,6 minutos por intento.
- Asistente de coding en IDE con GPU de consumo: con la cuantizacion UD-Q4_K_XL (22,7 GB) cabe en una RTX 4090 de 24 GB o en 32 GB combinados de RAM y VRAM, permitiendo autocompletado y refactorizacion local sin enviar codigo a la nube.
- Conversaciones tecnicas de larga duracion: su ventana de 262.144 tokens y su KV cache reducido (<5 GB en RAM a 16 bits) permiten mantener sesiones de soporte o revision de codigo con mucho historial sin perder coherencia, y con la mejor puntuacion multi-turno medida por el autor entre los modelos locales comparados (67,2 en Claw-Eval).
- Procesamiento de documentacion tecnica con imagenes: al soportar image-text-to-text, puede extraer informacion de capturas de pantalla, diagramas de arquitectura o documentacion escaneada y combinarla con texto para generar codigo o explicaciones.
- Despliegue en entornos con recursos limitados: la variante UD-IQ3_XXS (13,6 GB) permite ejecutar el modelo en una GPU de 16 GB, adecuada para prototipado o para equipos de desarrollo con hardware modesto.
- Pipelines de agente autonomo con contexto largo: la combinacion de MoE de ~3B activos, decodificacion especulativa MTP y contexto de 262k lo hace apto para bucles de agente que acumulan muchas iteraciones de lectura y escritura de archivos.
- Traduccion y asistencia tecnica ingles-chino: el modelo cubre ambos idiomas, util para equipos que trabajan con documentacion o bases de codigo en chino.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (cuantizacion 4 bits salvo indicacion):

| Benchmark | Tiel Coder 35B-A3B | Ornith-1.5-35B-A3B (base) | Nail (Qwen3.6-35B-A3B) | Opus 4.6 (medium) | Qwen3.8-27B (denso) |
|---|---|---|---|---|---|
| SWE-bench-Live (de 25) | 12 | 8 | 9 | 12 | 16 |
| Claw-Eval multi-turno | 67,2 | 65,3 | 60,5 | no disponible | no disponible |
| MMLU-Pro | 73,7 | 78,0 | 84,0 | no disponible | no disponible |

Datos adicionales de la model card: Sonnet 5 (medium) resuelve 8 de 25 en SWE-bench-Live; Dirk (denso 27B) resuelve 15 de 25 a 20,1 minutos por intento; Qwen3.8-27B tarda 50,2 minutos por intento. Tiel Coder registra una mediana de 8,6 minutos por intento y una media de 12,3 minutos (frente a 7,2 y 15,7 de Nail). El modelo base Qwen3.6-35B-A3B obtiene 85,3 en MMLU-Pro.

## Requisitos de hardware

- VRAM/RAM combinada estimada segun cuantizacion: UD-Q2_K_XL 12,7 GB (16 GB), UD-IQ3_XXS 13,6 GB (16 GB), UD-IQ3_S 14,1 GB (16 GB), UD-Q3_K_XL 17,2 GB (24 GB), UD-IQ4_XS 18,1 GB (24 GB), UD-Q4_K_S 21,3 GB (24 GB), UD-Q4_K_XL 22,7 GB (24-32 GB), UD-Q5_K_S 25,3 GB (32 GB).
- GPU recomendadas: RTX 4090 (24 GB) para UD-Q4_K_XL con contexto ajustado; GPUs de 32 GB o superiores para UD-Q5 en adelante; A100/H100 no son necesarias para el modelo completo, pero aceleran el throughput.
- Cabe en GPU de consumo: si, desde 16 GB con cuantizaciones de 3 bits; el autor recomienda no bajar de UD-Q4 si se puede repartir entre RAM y VRAM.
- KV cache: menos de 5 GB en RAM para 262k de contexto a 16 bits, y se recomienda al menos q8_0 para coding agentico.
- Opciones de despliegue: llama.cpp (formato nativo, con soporte MTP), y por extension cualquier frontend basado en GGUF como Ollama o LM Studio; existe version MLX oQ4e para Apple Silicon.
- Latencia y throughput: no se publican cifras de tokens por segundo en la informacion disponible; la model card solo aporta tiempos por intento en SWE-bench-Live (mediana 8,6 min, media 12,3 min).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench-Live (de 25) | MMLU-Pro | Licencia |
|---|---|---|---|---|---|---|
| Tiel Coder 35B-A3B | ~35B (MoE) | ~3B | 262k | 12 | 73,7 | MIT |
| Ornith-1.5-35B-A3B | ~35B (MoE) | ~3B | 262k | 8 | 78,0 | no disponible |
| Nail (Qwen3.6-35B-A3B) | ~35B (MoE) | ~3B | no disponible | 9 | 84,0 | no disponible |
| Qwen3.8-27B | 27B (denso) | 27B | no disponible | 16 | no disponible | no disponible |
| Dirk (Qwen3.8-27B) | 27B (denso) | 27B | no disponible | 15 | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento bajo en conocimiento enciclopedico y razonamiento tipo examen: 73,7 en MMLU-Pro frente a 84,0 de Nail, una diferencia de 10,3 puntos. No es adecuado para tareas de trivia o examenes.
- La plantilla Sharp reduce la verbosidad y las preguntas aclaratorias; si se necesita un modelo que interrogue antes de actuar, el modelo base lo hace mejor.
- La cuantizacion de 2 bits (UD-Q2_K_XL) degrada seriamente la capacidad en coding agentico; el autor la califica como ultimo recurso.
- Solo soporta ingles y chino; no hay cobertura documentada de castellano.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes que dependan de llamadas a herramientas estructuradas.
- Riesgo de alucinacion no cuantificado en la informacion disponible; como todo modelo de lenguaje, puede generar APIs o funciones inexistentes en codigo.
- Discrepancia entre los parametros declarados en el nombre (~35B) y el campo safetensors del repo (446.571.248), no aclarada por el autor.
- El repositorio es una recuantizacion de terceros, no una publicacion oficial del creador del modelo base; conviene verificar la integridad de los pesos.
- Licencia MIT declarada, lo que permite uso comercial, pero al derivar de Ornith-1.5 conviene revisar tambien las condiciones del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AIGAROU/cn3nctie2nc92bbc9nxxj93
- Modelo base Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante GGUF sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Variante MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Variante CyberTiel sin censura: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Modelo Nail (Qwen3.6-35B-A3B): https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Modelo Dirk (Qwen3.8-27B): https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
