# jingamin/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking

## Resumen

Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking es un ajuste fino comunitario de tipo denso, no MoE, construido a partir de Qwen/Qwen3.6-27B. Segun la model card, el proceso consistio en aplicar primero una ablacion de rechazos (Heretic), despues entrenar con cinco datasets internos «Deckard/PDK» (caracter, inteligencia, profundidad, observacion y punto de vista), luego expandir la arquitectura de 27B a 40B parametros y, finalmente, un ajuste adicional con un dataset destilado de razonamiento (TeichAI/claude-4.5-opus-high-reasoning-250x) para acortar y estabilizar el razonamiento. El entrenamiento se realizo con Unsloth en hardware local, en varias etapas.

El modelo se presenta como un sistema de 40B parametros densos (39,5B segun fuentes de terceros), con 96 capas y 1275 tensores, lo que supone un 50 % mas de tensores que el modelo base de 27B, y una ventana de contexto de 256K tokens (262.144 segun llmrun.dev). Su rasgo diferencial es la ausencia deliberada de filtros de contenido, junto con un modo de razonamiento («thinking») de longitud variable: mas corto ante peticiones simples y mas extenso ante problemas complejos. El autor afirma que supera al modelo base en 6 de 7 benchmarks, aunque no publica los numeros.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: los procesos de abliteration o desalineacion deliberada, la expansion de parametros sobre checkpoints abiertos para ganar capacidad de razonamiento, y el uso de destilados de modelos frontera para estabilizar la salida. La ficha que se reproduce aqui corresponde al repositorio de jingamin, que replica el modelo publicado originalmente por DavidAU; conviene tener en cuenta que las descargas y los «likes» de este repositorio concreto son cero y que el desarrollo activo (GGUF, FP8, MLX) se concentra en los repositorios del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), derivado de Qwen/Qwen3.6-27B y expandido a 96 capas y 1275 tensores |
| Parametros totales | 40B (39,5B segun llmrun.dev) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256K tokens (262.144 tokens segun llmrun.dev) |
| Tipos de cuantizacion | bfloat16 original; GGUF (Q4_KS sin imatrix, IQ3_S con imatrix, Q5/Q6 o superior recomendados para tool calling); FP8-MTP y MLX 8-bit publicados por terceros |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (library_name: transformers; repositorio de 36,9 GB). Existen conversiones GGUF, FP8-MTP y MLX de terceros |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso, no una mezcla de expertos, pese a lo que afirman algunas fichas de terceros. El punto de partida es Qwen/Qwen3.6-27B; el autor indica que el modelo final tiene 96 capas y 1275 tensores, aproximadamente un 50 % mas que el checkpoint base, y 40B parametros en total. No se detalla en la informacion disponible el metodo exacto de expansion (por ejemplo, si se duplicaron o interpolaron capas), ni el numero de tokens totales de entrenamiento, ni la composicion completa del corpus.

El pipeline de entrenamiento descrito tiene cuatro fases: (1) abliteration o eliminacion de la direccion de rechazo mediante el procedimiento Heretic; (2) ajuste fino supervisado con cinco datasets internos del autor agrupados bajo la denominacion Deckard/PDK; (3) expansion de parametros de 27B a 40B; y (4) segundo ajuste fino con el dataset destilado TeichAI/claude-4.5-opus-high-reasoning-250x, orientado a acortar y estabilizar las cadenas de razonamiento. Todo el proceso se ejecuto con Unsloth. La model card menciona tambien una plantilla Jinja actualizada para corregir problemas de repeticion y bucle detectados en la generacion anterior basada en Qwen 3.5, y un modo «instruct» que se activa fijando `enable_thinking = false` en la plantilla.

## Capacidades

- Generacion de texto y razonamiento extenso con modo «thinking» de longitud variable: respuestas mas breves ante tareas simples y cadenas mas largas ante problemas complejos.
- Escritura creativa y de ficcion: la model card esta orientada explicitamente a narrativa, generacion de tramas y subtramas, construccion de personajes, continuacion de escenas y dialogos.
- Roleplay y mantenimiento de personaje, con «caracter» y voz propia segun el autor.
- Generacion de codigo: la etiqueta `coder` figura entre los casos de uso declarados.
- Soporte de tool calling o function calling, con la recomendacion del autor de usar cuantizaciones Q5 o Q6 como minimo, siguiendo las indicaciones de Qwen.
- Capacidades multilingues limitadas a ingles y chino (`en`, `zh`); no se declara soporte de castellano.
- Salidas muy largas: la model card indica que la generacion puede superar los 100.000 tokens de salida.
- Modo instruct alternativo al modo thinking por defecto, configurable mediante la plantilla Jinja.
- La etiqueta de pipeline declarada es `image-text-to-text` y entre los tags aparece `qwen3_5`, pero la model card no documenta ningun codificador visual ni capacidades de vision; se trata de metadatos probablemente heredados.

## Casos de uso

- Escritura de ficcion de formato largo: con 256K tokens de contexto y salidas que pueden superar los 100.000 tokens, el modelo permite mantener la coherencia de una novela completa (personajes, arcos, subtramas) en una sola sesion, sin trocear el manuscrito.
- Continuacion de escenas y reescritura estilistica: el autor recomienda un `rep pen` de 1,05 a 1,1 en cuantizaciones bajas para forzar prosa mas variada; es util para pasar un borrador por un proceso de reescritura con control de repeticion.
- Roleplay y personajes persistentes: la combinacion de ausencia de filtros y larga ventana de contexto permite sostener conversaciones multi-turno de rol sin que el modelo rompa el personaje ni rechace tematicas adultas.
- Generacion de codigo en tuberias asistidas: con cuantizaciones Q5/Q6 el modelo admite tool calling, por lo que puede integrarse en flujos de agente que consulten repositorios, ejecuten pruebas o generen parches, siempre con supervision humana.
- Razonamiento multi-paso sobre documentos extensos: el modo thinking variable permite atacar problemas analiticos que requieran encadenar calculos o deducciones sobre entradas muy largas, aunque la fiabilidad final debe validarse externamente.
- Generacion de datos sinteticos de dialogo y narrativa: util para producir corpus de entrenamiento conversacional o creativo en ingles y chino, con la salvedad de que el contenido no pasa por ningun filtro de seguridad.
- Investigacion sobre abliteration y alineacion: el modelo sirve como objeto de estudio para medir que capacidades se conservan o se degradan al eliminar la direccion de rechazo y como afecta la expansion de parametros al rendimiento en razonamiento.
- Prototipado de asistentes creativos para guion y narrativa interactiva: la recomendacion de ventana minima de 8.000 a 16.000 tokens y temperatura 0,7 permite configurar un asistente de escritura con latencias razonables incluso en equipos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo «supera al modelo base en 6 de 7 benchmarks» y que su arquitectura Qwen 3.6 «supera incluso al modelo de 398B de Qwen», pero no se indican los nombres de los benchmarks, las puntuaciones obtenidas ni la metodologia de evaluacion. Las fichas de terceros consultadas tampoco aportan cifras numericas.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 80,04 GB segun llmrun.dev. Requiere por tanto GPU de 80 GB o reparto entre varias.
- VRAM estimada por cuantizacion (calculos aproximados a partir de 40B parametros, no publicados por el autor): FP8 en torno a 40-42 GB; GGUF Q8 en torno a 40-42 GB; Q6 en torno a 33-35 GB; Q5 en torno a 28-30 GB; Q4_KS en torno a 23-25 GB; IQ3_S en torno a 17-19 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 en una sola tarjeta; 2x RTX 4090 o 2x RTX 3090 (48 GB agregados) para Q5 y Q6; una RTX 4090, RTX 3090 o RTX 4080 de 24 GB para IQ3_S y Q4_KS.
- Cabe en GPU de consumo: si, en cuantizaciones de 3 a 5 bits. El autor recomienda como minimo Q4_KS sin imatrix o IQ3_S con imatrix, y advierte que para tool calling se necesitan Q5 o Q6 como minimo.
- Mac con memoria unificada: las cuantizaciones Q4 e IQ3_S son viables en equipos de 32 GB o superiores; para FP8 o Q8 se recomienda memoria unificada de 64 GB o mas. Existe una conversion MLX 8-bit publicada por la comunidad.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) para GGUF; vLLM o TGI para bfloat16 y FP8; MLX para Apple Silicon.
- Latencia y throughput: no disponibles. El autor solo indica que las generaciones pueden superar los 100.000 tokens de salida, lo que implica sesiones largas, y recomienda una ventana de contexto de 8.000 a 16.000 tokens como minimo operativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking (este) | 40B densos | 256K | apache-2.0 | safetensors en HF; GGUF, FP8-MTP y MLX de terceros | Abliterado via Heretic, datasets Deckard y destilado de razonamiento |
| DavidAU/Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking | 40B | no disponible | apache-2.0 | safetensors y GGUF | Version anterior sobre arquitectura Qwen 3.5; el autor reporta 181 «likes» |
| Qwen/Qwen3.6-27B (modelo base) | 27B | no disponible | no disponible | safetensors | Checkpoint de partida, sin abliteration ni datasets Deckard |
| gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking | 31B | no disponible | no disponible | safetensors | Misma familia de datasets Deckard sobre arquitectura Gemma 4 |
| gemma-4-19B-A4B-it-The-DECKARD-Heretic-Uncensored-Thinking | 19B (MoE, A4B activos) | no disponible | no disponible | safetensors | Variante MoE de la misma receta |

No se dispone de puntuaciones comparativas de benchmarks entre estos modelos en la informacion consultada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterado y sin censura: se ha eliminado deliberadamente la direccion de rechazo, por lo que puede generar contenido ofensivo, violento, sexual o ilegal sin filtro. No es apto para productos orientados a publico general ni para entornos con requisitos de moderacion.
- Sin guardarrailes de seguridad: la propia model card lo advierte con un aviso explicito. Cualquier despliegue en produccion requiere capas de moderacion propias y responsabilidad legal sobre las salidas.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de veracidad ni de tasas de alucinacion. En tareas factuales, la ausencia de datos de benchmarks impide estimar la fiabilidad.
- Idiomas: solo se declaran ingles y chino. No hay soporte declarado de castellano ni de otros idiomas, por lo que el rendimiento en español es desconocido.
- Contexto efectivo frente a contexto nominal: aunque la ventana es de 256K tokens, el autor recomienda configurar entre 8.000 y 16.000 tokens como minimo operativo, senal de que el rendimiento con ventanas muy largas no esta garantizado.
- Discrepancias en los metadatos: la etiqueta de pipeline es `image-text-to-text` y aparece el tag `qwen3_5`, pero no se documenta ningun componente de vision; ademas, la model card cita un destilado de «Claude 4.6 Opus» mientras que el dataset declarado en los tags es `TeichAI/claude-4.5-opus-high-reasoning-250x`.
- Contradiccion en la arquitectura segun terceros: la model card afirma que el modelo es denso de 40B, mientras que al menos una ficha de terceros (thinkllm.dev) lo describe como una variante MoE de Qwen3 30B-A3B. La fuente primaria es la model card.
- Este repositorio concreto es una replica: el autor indicado es jingamin, con 0 descargas y 0 «likes», mientras que el desarrollo original y las conversiones GGUF, FP8 y MLX corresponden a DavidAU y a otros usuarios. Conviene usar los repositorios originales para obtener versiones mantenidas.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, pero la licencia no exime de responsabilidad por el contenido generado ni de las obligaciones legales aplicables (por ejemplo, normativa de servicios digitales o proteccion de menores).
- Cuantizaciones bajas degradan el comportamiento: el autor advierte de problemas de repeticion y bucle en cuantizaciones agresivas y recomienda minimos de Q4_KS o IQ3_S, y Q5/Q6 para tool calling.
- Fechas y nomenclatura: el repositorio esta fechado en septiembre de 2026 y emplea nombres de modelos y familias que no coinciden con los lanzamientos publicos disponibles en el momento de redactar esta ficha; conviene verificar la procedencia real de los checkpoints antes de integrarlos en una cadena de produccion.

## Enlaces

- Modelo en HuggingFace (repositorio de jingamin): https://huggingface.co/jingamin/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Version GGUF NEO-CODE-Di-IMatrix-MAX de DavidAU: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Version FP8-MTP de tcclaviger: https://huggingface.co/tcclaviger/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-FP8-MTP/discussions
- Version 8-bit MLX de la comunidad: https://www.aimodels.fyi/models/huggingFace/qwen3.6-40b-claude-4.6-opus-deckard-heretic-uncensored-thinking-8bit-mlx-community
- Version sobre Qwen 3.5 de 40B (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Version Gemma 4 31B con datasets Deckard: https://huggingface.co/DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking
- Version Gemma 4 19B-A4B (MoE) con datasets Deckard: https://huggingface.co/DavidAU/gemma-4-19B-A4B-it-The-DECKARD-Heretic-Uncensored-Thinking
- Version Gemma 4 19B-A4B sin abliteration: https://huggingface.co/DavidAU/gemma-4-19B-A4B-it-The-DECKARD-Thinking
- Version Gemma 4 E4B con datasets Deckard: https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking
- Dataset destilado de razonamiento: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Datasets Deckard/PDK: https://huggingface.co/datasets/DavidAU/PkDick-Deckard-5-Datasets
- Ficha tecnica con requisitos de VRAM (llmrun.dev): https://llmrun.dev/model/davidau-qwen3-6-40b-claude-4-6-opus-deckard-heretic-uncensored-thinking
- Ficha resumida de terceros (thinkllm.dev): https://thinkllm.dev/models/qwen3-6-40b-claude-4-6-opus-deckard-heretic-uncensored-thinking
