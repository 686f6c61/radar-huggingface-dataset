# holdoutlabs/gamedecider

## Resumen

GameDecider v0.1 es un modelo de decisión para videojuegos desarrollado por holdoutlabs. No es un modelo generativo: recibe una escena en texto o JSON (quién está presente, qué se ha dicho, qué ha hecho el jugador), una o varias preguntas y un conjunto de opciones por pregunta, y devuelve en un único forward pass una probabilidad calibrada para cada opción. Cuando la confianza no supera un umbral configurable, el modelo se abstiene, de modo que el juego puede recurrir a sus propias reglas o consultar a un LLM.

Se construye sobre el encoder Ettin 400M (familia ModernBERT) afinado con LoRA y fusionado mediante un weight soup uniforme de dos semillas. El paquete incluye 42 adaptadores LoRA compilados, un runtime Python propio (`gamedecider` 0.1.0) que expone un servidor HTTP local con endpoint `POST /judge`, y pesos en formato ONNX (fp16 por defecto, 792,5 MB; fp32, 1,58 GB).

Su relevancia práctica está en sustituir llamadas a LLM en decisiones de NPC de baja latencia y alto volumen: clasificación de intención, detección de amenazas, asignación de interlocutor, reacción emocional o aceptación de misiones, con calibración explícita y abstención como mecanismo de control de riesgo. La limitación principal es que solo soporta inglés y que la evaluación se ha hecho sobre conjuntos privados, no sobre benchmarks públicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT, base Ettin 400M) con adaptadores LoRA fusionados |
| Parámetros totales | 400M (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 3.072 tokens de estado |
| Tipos de cuantización | fp16 (por defecto, ONNX) y fp32 (ONNX) |
| Idiomas soportados | inglés únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model_fp32.onnx`), tokenizer.json, calibration.json, thresholds.json |
| Tipos de pregunta | `choice` (2-32 opciones), `score` (2-10 opciones ordenadas), `noul` (sí/no) |
| Tamaño del repositorio | 3,6 GB |
| Runtime | Paquete Python `gamedecider` 0.1.0 (Apache-2.0), servidor local en 127.0.0.1:8040 |
| Adaptadores incluidos | 42 (39 de cookbook, 2 estilo SkyrimNet, 1 de reacción de personaje) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/ettin-encoder-400m` (revisión `7662476d`, licencia MIT), un encoder de la familia ModernBERT de 400M de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA y se fusionaron dos semillas afinadas mediante un weight soup uniforme (checkpoint interno `rel5_ettin400_mixI_B_safe3_soup_enc`). La entrada se empaqueta en un formato propio denominado "layout C": el estado seguido de cada pregunta con sus opciones en una única secuencia con máscaras de segmento; la salida son logits por opción.

La calibración es explícita: los logits se dividen por una temperatura específica por tipo de pregunta y por rango de número de opciones (definida en `calibration.json`), se aplica softmax y solo se responde si la probabilidad máxima supera el umbral del perfil activo. Los umbrales se reajustaron sobre el split de desarrollo. El entrenamiento usó una mezcla de datasets públicos de NLU, moderación y diálogo: AmazonScience/massive, Paul/hatecheck, PolyAI/banking77, kchawla123/casino, go_emotions, deepset/prompt-injections, google/civil_comments, snips_built_in_intents, FIREBALL, circa, irc_disentangle y allenai/atomic. No se detalla el número de tokens ni si hubo RLHF o DPO (no aplica a un encoder de clasificación).

Dos innovaciones destacables: la abstención calibrada por tipo de pregunta y la media sobre el orden de las opciones (option-order averaging), que es la configuración enviada por defecto. Los usuarios que consumen el ONNX en crudo no obtienen ni el guard de seguridad ni esa media de orden, y deben implementarlos por su cuenta.

## Capacidades

- Clasificación de intención del jugador con probabilidades calibradas por opción en un solo forward pass.
- Preguntas de tipo `choice` (2 a 32 opciones), `score` (2 a 10 opciones ordenadas) y `noul` (sí/no).
- Abstención controlada por umbral, con dos perfiles (`default` y `strict`) según el coste del error.
- Detección de amenazas, asignación de interlocutor de una línea de diálogo, aceptación o rechazo de misiones y estado emocional de NPC.
- Adaptadores LoRA especializados: 39 de cookbook, 2 estilo SkyrimNet (`memory_match`, `npc_mood`) y 1 de reacción de personaje (`motion/reaction`).
- Guard de seguridad de menores activado por defecto en el runtime.
- Sin generación de texto: la salida son logits y probabilidades, lo que elimina el riesgo de alucinación textual.
- Soporte multilingüe: no disponible (solo inglés).
- Tool calling y razonamiento multi-paso: no disponibles por diseño.

## Casos de uso

- **Decisión de NPC en tiempo real**: el modelo evalúa en un forward pass si el jugador amenaza al NPC, si acepta una misión o qué emoción muestra el tendero, con latencia de encoder de 400M y sin coste de generación. Adecuado para miles de decisiones por sesión.
- **Enrutado de diálogo en mundos abiertos**: dada una línea del jugador y la lista de personajes presentes, el modelo asigna el destinatario de la frase (`choice`), lo que permite que el motor de diálogo seleccione el árbol conversacional correcto sin un LLM.
- **Moderación en multijugador**: con el perfil `strict` y el guard de menores, clasificar mensajes de chat como aceptables o problemáticos, con abstención cuando la confianza es baja para derivar a revisión humana.
- **Sistemas de memoria de NPC (estilo SkyrimNet)**: los adaptadores `skyrimnet/memory_match` y `npc_mood` permiten decidir si un evento debe registrarse en la memoria del personaje y actualizar su estado emocional.
- **Reacción de personajes a acciones del jugador**: el adaptador `motion/reaction` clasifica la reacción esperada ante una acción concreta, útil para animación o cambio de comportamiento sin generar texto.
- **Fallback determinista en pipelines con LLM**: usar GameDecider como primera etapa barata; si se abstiene, escalar al LLM generativo. Reduce coste y latencia en el caso mayoritario.
- **Etiquetado y telemetría de partidas**: procesar logs de sesión para clasificar intenciones y emociones de jugadores a escala, con probabilidades calibradas para análisis estadístico.

## Benchmarks y rendimiento

Todos los conjuntos de evaluación son privados y no se publican; ninguno es un benchmark público. Las cifras corresponden al modelo con el guard desactivado y, salvo indicación, con option-order averaging.

| Evaluación | n | Métrica | Resultado |
|---|---|---|---|
| heldout_v3 (option-order averaging) | 2.993 preguntas | Accuracy | no disponible (tabla truncada en la información) |
| Comparación vs. release a3 | — | Diferencia en puntos (IC 95 %) | no disponible (tabla truncada) |

Cobertura (fracción de preguntas respondidas sin abstenerse):

| Perfil | choice 3-5 | choice 6-10 | noul | score 3-5 | Cobertura dev | Cobertura cookbook | Cobertura heldout_v3 |
|---|---|---|---|---|---|---|---|
| default | 0,470 | 0,431 | 0,730 | 0,511 | 0,974 | 0,973 | 0,662 |
| strict | 0,713 | 0,537 | 0,783 | 0,511 | no disponible | 0,824 | no disponible |

Nota: `choice` con 2 opciones y con 11 o más opciones nunca se abstiene en ninguno de los dos perfiles.

## Requisitos de hardware

- Inferencia en CPU viable: el ONNX fp16 ocupa 792,5 MB y el fp32 1,58 GB; un encoder de 400M con contexto de 3.072 tokens se ejecuta en CPU con latencia de decenas de milisegundos por lote pequeño (cifra exacta no disponible).
- GPU: cualquier GPU con al menos 2-3 GB de VRAM libre para fp16, incluidas GTX 1650, RTX 3060, RTX 4090, A100 y H100. Cabe holgadamente en GPU de consumo.
- Despliegue: ONNX Runtime (vía del runtime `gamedecider`), servidor HTTP local con `gamedecider serve` en 127.0.0.1:8040. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no son formatos soportados por el paquete).
- El runtime no realiza conexiones de red.
- Throughput y latencia medidos: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| GameDecider v0.1 | 400M | 3.072 tokens | Clasificación calibrada con abstención para juegos | Apache-2.0 | ONNX |
| Ettin encoder 400M (base) | 400M | no disponible | Encoder generalista | MIT | safetensors |
| LLM generativo pequeño (p. ej. modelos de 1-3B) | 1.000-3.000M | 8.000-32.000 tokens | Generación y decisión vía prompting | variable | safetensors, GGUF |

La comparación con alternativas específicas de "decision model" para juegos no está disponible: no se conocen modelos públicos equivalentes con calibración y abstención integradas. Frente a un LLM generativo, GameDecider ofrece menor coste, latencia y ausencia de alucinación textual, a cambio de solo inglés, sin generación y con evaluación privada no verificable externamente.

## Limitaciones y advertencias

- Solo inglés: cualquier escena o pregunta en otro idioma queda fuera de distribución.
- Evaluación sobre conjuntos privados no publicados; no hay resultados en benchmarks públicos que permitan verificación independiente.
- Los usuarios de ONNX en crudo no obtienen el guard de seguridad de menores ni el option-order averaging; deben implementarlos.
- El modelo se abstiene por diseño; con el perfil `default`, la cobertura en heldout_v3 cae al 66,2 %, lo que implica que un tercio de las consultas requieren fallback.
- `choice` con 2 opciones y con 11 o más nunca se abstiene, incluso si la confianza es baja: riesgo de respuestas forzadas en esos rangos.
- Riesgo de sesgo heredado de los datasets de entrenamiento (civil_comments, hatecheck, go_emotions), que incluyen contenido sensible de moderación.
- El estado está limitado a 3.072 tokens; escenas largas deben truncarse o resumirse, con pérdida de información.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Ettin es MIT y los datasets de entrenamiento tienen sus propias condiciones que conviene revisar.
- El repositorio es de 3,6 GB por los 42 adaptadores y los dos formatos ONNX; el despliegue mínimo solo necesita `model/`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/holdoutlabs/gamedecider
- Modelo base Ettin encoder 400M: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Paper, blog, repositorio o demo adicionales: no disponible
