# dopaemon/Tiel-Coder-35B-A3B-MLX-oQ4e

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ4e es una cuantizacion de 4 bits del modelo Ornith-1.5-35B-A3B (a su vez derivado de la familia Qwen3.5/Qwen3 MoE), publicada en formato MLX para Apple Silicon. El repositorio que nos ocupa esta alojado por el usuario dopaemon, pero la model card y el trabajo de cuantizacion corresponden al build original de peculiar-ragdoll, que aplica el cuantizador oQ4e de oMLX con un pase imatrix y anade la plantilla de chat "Sharp" embebida en el checkpoint. El modelo cuenta con 35.107.181.936 parametros totales en configuracion Mixture-of-Experts con aproximadamente 3.000 millones de parametros activos por token (denominacion A3B).

El objetivo del modelo es el codigo agentico y las conversaciones multi-turno largas en local: segun las mediciones del autor, resuelve 12 de 25 problemas de SWE-bench-Live con una mediana de 8,6 minutos por intento, y alcanza 67,2 en Claw-Eval multi-turno. Es, por tanto, un checkpoint orientado a trabajo de ingenieria real en maquinas Apple Silicon, no a conocimiento enciclopedico ni a razonamiento tipo examen.

El checkpoint incluye vision en la misma carpeta (pipeline image-text-to-text, sin fichero proyector separado) y una ventana de contexto cuyo valor no se especifica en la informacion disponible. La licencia es MIT y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capacidades de vision (tags qwen3_5_moe / qwen35moe), pipeline image-text-to-text |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B (denominacion A3B, no se detalla el numero exacto en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e: 4-bit dynamic mixed precision con pase imatrix (unsloth-dynamic). Existe variante oQ6e del mismo autor (~29,5 GB) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX; existe build GGUF en repositorio separado del autor original |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture-of-Experts con vision integrada, heredado de Ornith-1.5-35B-A3B, que a su vez parte de la familia Qwen3.5/Qwen3-35B-A3B. Los 35B parametros totales se activan de forma dispersa, con aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia respecto a un denso equivalente. Este checkpoint concreto no ha sido reentrenado: es una recuantizacion de los pesos del modelo base a 4 bits mediante el cuantizador oQ de oMLX, con una pasada imatrix para calibrar la precision por capa, y con la plantilla de chat Sharp insertada dentro del checkpoint. La plantilla incluye vision en la misma carpeta, sin proyector separado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO en el modelo base; esos datos pertenecen a Ornith-1.5-35B-A3B y no se reproducen aqui. La innovacion tecnica relevante de este build es doble: por un lado, la cuantizacion mixta dinamica con imatrix, que busca preservar calidad a 4 bits; por otro, la plantilla Sharp, que segun las mediciones del autor cambia el comportamiento del modelo hacia respuestas mas cortas y mas resolutivas, a costa de 4,3 puntos de MMLU-Pro. Este checkpoint en concreto no incorpora la cabeza MTP (multi-token prediction): existe un repositorio hermano con la cabeza nextn entrenada para decodificacion especulativa.

## Capacidades

- Generacion de texto y codigo en tareas de reparacion de repositorios reales (SWE-bench-Live).
- Razonamiento multi-turno y mantenimiento de contexto conversacional largo (Claw-Eval multi-turno: 67,2).
- Codigo agentico: el autor recomienda temperatura 0,6 para este uso, lo que indica soporte para flujos de agente con multiples pasos.
- Vision / image-text-to-text: acepta imagenes junto a texto mediante `mlx_vlm` (preguntas sobre capturas de pantalla, por ejemplo).
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion proporcionada, aunque el enfasis en codigo agentico y en plantillas de chat de tipo agente lo hace plausible; marcar como no confirmado.
- Capacidades multilingues limitadas a ingles y chino.
- Eficiencia de tokens: el autor reporta un 24% de diferencia en recuento de tokens entre MLX y GGUF sobre los mismos pesos, indicando un perfil de respuesta mas corto con la plantilla Sharp.

## Casos de uso

- Reparacion de bugs en repositorios reales: con 12 de 25 problemas resueltos en SWE-bench-Live y una mediana de 8,6 minutos por intento, es adecuado para pipelines de parcheo automatico de issues en proyectos medianos.
- Agente de codigo en local sobre Apple Silicon: al ser un checkpoint MLX de 21,1 GB, se puede ejecutar en un Mac con memoria unificada suficiente sin depender de la nube, lo que resulta util para trabajo con codigo propietario.
- Asistente de desarrollo multi-turno: la puntuacion de 67,2 en Claw-Eval multi-turno lo posiciona para sesiones largas de pair programming donde el contexto acumulado importa mas que la precision factual.
- Analisis de capturas y diagramas: gracias al soporte de vision, puede interpretar screenshots de interfaces, diagramas de arquitectura o trazas de error para responder preguntas sobre ellos.
- Automatizacion de revision de codigo: su perfil de respuestas cortas y resolutivas encaja con generacion de comentarios concisos en PRs, evitando respuestas largas y poco accionables.
- Extraccion y transformacion de codigo en pipelines de CI/CD: puede integrarse como paso de generacion o refactorizacion siempre que el entorno de ejecucion sea MLX (o el build GGUF hermano en llama.cpp).
- Prototipado rapido de agentes con tool calling: planteado para flujos de varios pasos, aunque el soporte explicito de function calling no esta confirmado en la informacion disponible.

## Benchmarks y rendimiento

Advertencia del propio autor: estas cifras se midieron sobre el build GGUF, no sobre este checkpoint MLX. Cambiar de cuantizador altera los resultados (el autor reporta 0,7 puntos de diferencia en MMLU-Pro y un 24% de diferencia en recuento de tokens entre MLX y GGUF sobre los mismos pesos de Nail). Deben interpretarse como evidencia sobre el modelo, no como medicion de este fichero.

| Benchmark | TielCoder | Ornith-1.5 (base) | Nail (Qwen3.6-35B-A3B) | Qwen3.6-35B-A3B stock |
|---|---|---|---|---|
| SWE-bench-Live (resueltos de 25) | 12 | 8 | 9 | 8 |
| Claw-Eval multi-turno | 67,2 | 65,3 | 60,5 | no disponible |
| MMLU-Pro (4-bit) | 73,7 | 78,0 | 84,0 | 85,3 |

Referencias adicionales de la misma tanda de evaluacion: Opus 4.6 (medium) resuelve tambien 12 de 25; Sonnet 5 (medium) resuelve 8; Qwen3.8-27B resuelve 16 con 50,2 minutos por intento; Dirk resuelve 15 con 20,1 minutos por intento; el stock Qwen3.6-35B-A3B resuelve 8 con 5,5 minutos por intento. El tiempo por intento de TielCoder es de 8,6 minutos de mediana y 12,3 de media, frente a 7,2 y 15,7 de Nail.

## Requisitos de hardware

- Al ser un checkpoint MLX, el destino natural es Apple Silicon con memoria unificada; no se ofrecen cifras de VRAM para GPU NVIDIA en la informacion disponible.
- Pesos a 4 bits: 21,1 GB de repositorio. Se necesita un Mac con al menos 32 GB de memoria unificada para cargar el modelo, y 48-64 GB para trabajar con contextos largos con holgura.
- La variante oQ6e del mismo autor ocupa 29,5 GB, lo que eleva el requisito a equipos de 48 GB o mas.
- Hardware recomendado: chips Apple de gama alta (M1 Max/M2 Max/M3 Max/M4 Max y variantes Ultra). No hay datos publicados de rendimiento por chip para este fichero concreto.
- Despliegue mediante oMLX, colocando la carpeta bajo `~/.omlx/models/` o descargandola desde el panel de administracion de oMLX.
- Inferencia por linea de comandos con `mlx_vlm.generate`. Importante: cargar con `mlx-vlm`, no con `mlx-lm`; el segundo acepta el checkpoint pero emite tokens basura de forma silenciosa por un desajuste de loader.
- Para llama.cpp o entornos GGUF hay que usar el build GGUF del autor original, no este fichero.
- No se publican cifras de latencia o throughput para esta cuantizacion. El build hermano con cabeza MTP reporta ganancias de decodificacion especulativa (~1,16x en un M5 Max segun un modelo similar de la misma familia), pero este checkpoint no incluye dicha cabeza.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | SWE-bench-Live (de 25) | Claw-Eval | MMLU-Pro | Licencia |
|---|---|---|---|---|---|---|
| TielCoder 35B-A3B oQ4e (este) | 35B (3B activos) | MLX 4-bit | 12 | 67,2 | 73,7 | MIT |
| Nail (Qwen3.6-35B-A3B) | 35B (3B activos) | GGUF 4-bit | 9 | 60,5 | 84,0 | no disponible en la informacion |
| Ornith-1.5-35B-A3B (base) | 35B (3B activos) | varios | 8 | 65,3 | 78,0 | no disponible en la informacion |
| Dirk (Qwen3.8-27B denso) | 27B densos | GGUF | 15 | no disponible | no disponible | no disponible en la informacion |
| Qwen3.8-27B | 27B densos | varios | 16 | no disponible | no disponible | no disponible en la informacion |

Conclusion del autor: para codigo agentico y conversaciones largas, TielCoder; para conocimiento tipo examen y razonamiento duro, Nail (10,3 puntos mejor en MMLU-Pro y 6,7 peor en conversacion); para maxima tasa de arreglos por problema, Dirk.

## Limitaciones y advertencias

- El autor reconoce explicitamente que el modelo es "cheerfully bad at trivia": pierde 4,3 puntos de MMLU-Pro respecto a su propio base y 10,3 respecto a Nail. No es adecuado para tareas de conocimiento factual.
- Los benchmarks publicados corresponden al build GGUF, no a este checkpoint MLX. Cambiar de cuantizador altera los resultados; el autor advierte de una diferencia medida de 0,7 puntos en MMLU-Pro y un 24% en recuento de tokens entre ambos formatos.
- Riesgo de alucinacion no cuantificado en la informacion disponible, pero inherente a cualquier modelo de 35B cuantizado a 4 bits.
- Idiomas soportados unicamente ingles y chino; no hay soporte declarado para castellano ni otros idiomas.
- Cargar el checkpoint con `mlx-lm` en lugar de `mlx-vlm` produce salida basura sin error visible: es un fallo silencioso que puede pasar desapercibido en integraciones.
- La plantilla Sharp reduce la verbosidad y con ello la calidad en tareas que exigen respuestas largas o matizadas; el propio autor lo plantea como un trade-off deliberado.
- Este checkpoint no incluye la cabeza MTP; para decodificacion especulativa hay que usar el repositorio hermano.
- El repositorio que nos ocupa (dopaemon) es un espejo sin descargas ni likes, y la model card procedente del autor original esta truncada en la informacion disponible; conviene verificar el fichero contra el repo de referencia antes de usarlo en produccion.
- Licencia MIT declarada, lo que permite uso comercial, pero no se especifican los terminos de los pesos base de Ornith-1.5 ni de la familia Qwen subyacente; conviene revisarlos por separado.

## Enlaces

- Repositorio HuggingFace de este checkpoint: https://huggingface.co/dopaemon/Tiel-Coder-35B-A3B-MLX-oQ4e
- Build original del autor: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Variante con cabeza MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Variante oQ6e: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e
- Build GGUF (autor original): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Variante CyberTiel (sin censura): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Nail (Qwen3.6-35B-A3B, GGUF): https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Dirk (Qwen3.8-27B, GGUF): https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
- Ficha de la variante oQ6e en LLM Explorer: https://llm-explorer.com/model/peculiar-ragdoll%2FTiel-Coder-35B-A3B-MLX-oQ6e,73htXcPqtKOdO1vKEX9Az6
- Ficha de la variante oQ6e-MTP en LLM Explorer: https://llm-explorer.com/model/peculiar-ragdoll%2FTiel-Coder-35B-A3B-MLX-oQ6e-MTP,1CJgiIdfVYmQrYbG1EGpf7
- Modelo similar de la familia con cabeza MTP (BigBang): https://huggingface.co/KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit
