# LuxiaSL/kotodama-tsumugi-1b

## Resumen

kotodama-tsumugi-1b es un modelo base de 1.425.696.256 parámetros (1,42B únicos, con embeddings de entrada y salida atados) desarrollado por Luxia (LuxiaSL) con Anima Labs, entrenado sobre 110.000 millones de tokens en inglés. Es un transformer con una innovación estructural central: un bloque intermedio de 20 capas que se ejecuta dos veces con los mismos pesos, de modo que el modelo computa efectivamente a través de 72 capas aunque solo tenga 52 únicas. Además, sustituye el flujo residual clásico por Block Attention Residuals (Moonshot AI, 2026), donde cada capa lee una mezcla aprendida de las salidas de bloques anteriores en lugar de una suma acumulada única.

El modelo está pensado como checkpoint base sin ajuste de instrucciones, publicado junto a toda la trayectoria de entrenamiento (seed 17 completa y seed 7 hasta 11B tokens) y con el código abierto del proyecto kotodama: entrenador, suite de evaluación y stack de serving. Su relevancia actual reside en que demuestra que técnicas de reciclado de capas y residuales por atención permiten a un modelo de ~1,4B igualar o superar en eficiencia de cómputo a modelos públicos bastante mayores: alcanza un 64,1% de media en nueve benchmarks estándar con 1,24e21 FLOPs, un presupuesto que Pythia 2.8B necesitó multiplicar por ~2,7 y Pythia 6.9B por ~5 para lograr la misma puntuación.

La ventana de contexto es de 4.096 tokens, el tokenizador es SmolLM2 (vocabulario 49.152) y la licencia es Apache 2.0. El interés técnico principal es su capacidad para aplicar reglas inventadas a partir de pocos ejemplos (0,559 en las pruebas de "reglas inventadas", frente a 0,536 del mejor modelo público con el mismo cómputo) y el papel desproporcionado del segundo pase del bloque intermedio en esa habilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con bloque intermedio repetido (looped transformer) y Block Attention Residuals |
| Parametros totales | 1.425.696.256 (1,42B únicos; embeddings de entrada/salida atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch; requiere custom_code) |

## Arquitectura y entrenamiento

El modelo tiene 52 capas únicas pero computa a través de 72: 19 capas de entrada, un bloque intermedio de 20 capas que se ejecuta dos veces con pesos compartidos (capas 19–38 y 39–58) y 13 capas de salida. La anchura es 1536, con 12 cabezas de query, 6 cabezas KV (grouped-query attention), dimensión de cabeza 128 y FFN SwiGLU de 4096. La atención usa RoPE con theta 500K y QK-norm. El flujo residual es Block Attention Residuals: cada capa lee una mezcla aprendida de las salidas de bloques anteriores en lugar de una suma acumulada; hay 8 bloques que arrancan en las capas 0, 1, 7, 9, 17, 19, 39 y 59, y cada pase del bloque intermedio inicia un bloque. Los puntos de inicio se ajustaron a la geometría de capas de un modelo de 52 capas entrenado sin esta técnica, y cada capa conserva sus propias normas y enrutamiento.

El entrenamiento usó Muon para matrices ocultas y AdamW para embeddings, normas y escalares, con z-loss en los logits y precisión bf16. El schedule consistió en un batch de 2M tokens, una fase principal de 100B tokens a learning rate constante y un cooldown de 10B tokens con decaimiento coseno hasta cero; la release es el último paso del cooldown (52.450). El cómputo total es de 1,24e21 FLOPs (1,13e10 FLOPs/token, contando dos veces las capas repetidas). Los datos son una mezcla curada de 32 fuentes predominantemente en inglés (código, papers científicos, patentes, derecho, libros, texto web, matemáticas y conversacional), con un suplemento conversacional del ~0,7% de los tokens; no se incluyeron datasets sintéticos ni de asistente, aunque una fuente pequeña (0,06% de los tokens) resultó ser reescrita por un LLM upstream. La receta de datos está publicada y 19 de las 32 fuentes están disponibles como texto limpio en el dataset kotodama-3b-corpus-open.

## Capacidades

- Generación de texto autoregresiva en inglés; es un modelo base sin ajuste de instrucciones, por lo que no sigue instrucciones de forma fiable sin few-shot prompting.
- Aplicación de reglas inventadas a partir de pocos ejemplos: puntúa 0,559 en las pruebas de "reglas inventadas" del proyecto (0 = azar, 1 = siempre correcto), frente a 0,536 del mejor modelo público con el mismo cómputo.
- Seguimiento de referentes en conversaciones de dos personas con cambio de objetos: mantiene quién es "you" dado tres ejemplos resueltos; al intercambiar quién habla la última línea, la probabilidad de su respuesta anterior cae 0,038 de media (el único modelo base público cuyo intervalo del 95% supera el umbral de +0,02 fijado antes de puntuar).
- Razonamiento de sentido común y comprensión lectora evaluados en HellaSwag, LAMBADA, ARC-Easy, ARC-Challenge, PIQA, SciQ, WinoGrande, COPA y BoolQ, con 64,1% de media sin ejemplos en el prompt.
- Capacidad de código y matemáticas derivada de las fuentes de entrenamiento (código, papers, matemáticas), aunque no hay benchmarks específicos publicados en la información disponible.
- No soporta tool calling ni function calling de forma nativa (modelo base sin plantilla de instrucciones).
- No soporta agentes ni multi-step reasoning de forma fiable sin ajuste posterior.
- Multilingüe: no; entrenado solo en inglés.
- Sin soporte de visión ni audio.
- Sin modo "thinking" explícito.

## Casos de uso

- Investigación sobre eficiencia de cómputo en modelos pequeños: sirve como referencia reproducible para estudiar cómo el reciclado de capas y los Block Attention Residuals reducen el cómputo necesario para alcanzar un 64,1% en nueve benchmarks, con toda la trayectoria de checkpoints publicada.
- Estudio de in-context learning con reglas inventadas: el modelo es un banco de pruebas para analizar cómo un bloque intermedio repetido (segundo pase) soporta la aplicación de reglas a partir de pocos ejemplos; apagar un cuarto de la atención del segundo pase baja la puntuación 0,13 frente a 0,035 en el primer pase.
- Base para fine-tuning supervisado (SFT) en tareas de dominio inglés: al ser un checkpoint base Apache 2.0 con 1,42B parámetros y contexto de 4.096 tokens, es adecuado como punto de partida para ajuste en clasificación, extracción o generación de dominio.
- Evaluación de técnicas de atención residual: los checkpoints intermedios y la suite de evaluación del proyecto permiten reproducir y comparar variantes de Block Attention Residuals en un modelo de tamaño contenido.
- Seguimiento de referentes en diálogo: con few-shot prompting se puede usar para prototipos de resolución de correferencia en conversaciones de dos interlocutores, aunque su rendimiento es limitado (cae 0,038 al cambiar el hablante).
- Serving y despliegue experimental: el stack de serving abierto del proyecto kotodama permite probar el modelo en pipelines de inferencia con código personalizado, útil para validar integraciones antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Benchmark (media de nueve) | Resultado |
|---|---|
| Media HellaSwag, LAMBADA, ARC-Easy, ARC-Challenge, PIQA, SciQ, WinoGrande, COPA, BoolQ | 64,1% correcto |
| Reglas inventadas (few-shot) | 0,559 (0 = azar, 1 = siempre correcto) |
| Reglas inventadas, mejor modelo público con mismo cómputo | 0,536 |
| Corte de un cuarto de la atención del segundo pase (reglas inventadas) | −0,13 (desde 0,546 en los ítems publicados) |
| Corte equivalente en el primer pase | −0,035 |
| Seguimiento de "you" al cambiar hablante | −0,038 de probabilidad media |
| Held-out text (Uncheatable Eval, abril 2026) | 0,768 bits/byte (frente a 0,793 del otro cooldown) |

Comparación de cómputo para alcanzar el 64,1%: Pythia 2.8B necesitó ~2,7 veces el cómputo de tsumugi, Pythia 6.9B ~5 veces y OLMo-1 1B ~7 veces; Pythia 1.4B nunca lo alcanzó; OLMo-2 1B lo logró con un cómputo similar. No se han publicado resultados desglosados por benchmark individual en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~2,9 GB solo de pesos (tamaño del repo), más activaciones y caché KV; en la práctica, entre 4 y 6 GB para contexto completo de 4.096 tokens con batch 1.
- VRAM estimada en cuantización de 8 bits: ~1,5 GB de pesos; en 4 bits: ~0,8 GB de pesos (estimaciones a partir del número de parámetros; no hay cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU consumer con ≥8 GB (RTX 3060, RTX 4060, RTX 4070, RTX 4090) para bf16 o cuantizado; A100/H100 no son necesarias por tamaño, pero sí útiles para throughput alto en batch.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores.
- Opciones de despliegue: el proyecto publica su propio stack de serving (github.com/anima-research/kotodama); al requerir custom_code (Block Attention Residuals y capas repetidas), no es directamente compatible con vLLM, llama.cpp u Ollama sin portar la arquitectura. TGI no está confirmado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media nueve benchmarks | Licencia | Cómputo para 64,1% |
|---|---|---|---|---|---|
| kotodama-tsumugi-1b | 1,42B (52 capas únicas, 72 computadas) | 4.096 | 64,1% | Apache 2.0 | 1,24e21 FLOPs (referencia) |
| Pythia 1.4B | 1,4B | 2.048 | No alcanza 64,1% | Apache 2.0 | Nunca lo alcanzó |
| Pythia 2.8B | 2,8B | 2.048 | Alcanza 64,1% | Apache 2.0 | ~2,7× tsumugi |
| Pythia 6.9B | 6,9B | 2.048 | Alcanza 64,1% | Apache 2.0 | ~5× tsumugi |
| OLMo-1 1B | 1B | 2.048 | Alcanza 64,1% | Apache 2.0 | ~7× tsumugi |
| OLMo-2 1B | 1B | 4.096 | Alcanza 64,1% | Apache 2.0 | ~1× tsumugi |

Los datos de contexto de los modelos comparados no se detallan en la información proporcionada; los valores indicados son los habitualmente publicados para esas familias y deben verificarse en sus model cards. El rendimiento en benchmarks individuales de los comparados no está disponible en la información.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no sigue instrucciones de forma fiable y requiere prompting few-shot o fine-tuning para tareas concretas.
- Solo inglés: no hay soporte multilingüe; el rendimiento en otros idiomas será deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a un modelo base entrenado sin datasets de asistente ni RLHF; no se ha evaluado su calibración.
- Sesgos: los datos provienen de 32 fuentes predominantemente en inglés (derecho, patentes, web, libros) y pueden reflejar sesgos de esas fuentes; no se documentan evaluaciones de sesgo en la información disponible.
- El modelo puntúa al nivel del azar en seguimiento de quién sostiene un objeto en historias en tercera persona, igual que todos los modelos de ~1B medidos.
- Alta varianza entre ejecuciones: el autor documenta una dispersión de ~0,02–0,03 bits/byte en held-out text entre dos cooldowns con los mismos datos y ajustes, y una diferencia de 0,2 puntos en la media de benchmarks (64,1 vs 64,3); cualquier número de un solo checkpoint debe leerse con ese margen.
- Una fuente de datos (0,06% de los tokens) resultó ser reescrita por un LLM upstream, lo que introduce una contaminación sintética mínima no intencionada.
- Licencia Apache 2.0 permite uso comercial, pero la arquitectura requiere custom_code para cargar los pesos; verificar la compatibilidad con el stack de serving antes de desplegar en producción.
- No hay cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b
- Trayectoria seed 17: https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b-trajectory
- Trayectoria seed 7: https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b-seed7-trajectory
- Código del proyecto kotodama: https://github.com/anima-research/kotodama
- Receta de datos: https://github.com/anima-research/kotodama/blob/main/docs/DATA-tsumugi-1b.md
- Corpus abierto: https://huggingface.co/datasets/aethera-gp/kotodama-3b-corpus-open
- Páginas del proyecto: https://kotodama.animalabs.ai/
- Paper de Block Attention Residuals (Moonshot AI, 2026): https://arxiv.org/abs/2603.15031
- Anima Labs: https://animalabs.ai/
- Perfil del autor en X: https://x.com/kataletheia
- Claude (Anthropic): https://www.anthropic.com/claude
