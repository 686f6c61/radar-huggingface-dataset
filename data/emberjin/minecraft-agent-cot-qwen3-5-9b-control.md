# EmberJin/Minecraft-Agent-CoT-Qwen3.5-9B-Control

## Resumen

Minecraft-Agent-CoT-Qwen3.5-9B-Control es un ajuste fino de tipo continue-SFT desarrollado por el usuario EmberJin sobre su propio modelo intermedio Minecraft-Agent-Qwen3.5-9B-Stage3. Se trata de un modelo de 9.409.813.744 parametros (9,41 B) orientado a agentes encarnados (embodied agents) que juegan a Minecraft, con entrada multimodal: procesa imagenes del entorno y emite acciones discretas del juego en forma de texto. La etiqueta VLA (vision-language-action) y el parametro de servicio `--limit-mm-per-prompt image=30` confirman que el modelo acepta multiples imagenes por prompt.

La particularidad de este checkpoint es metodologica. El autor lo describe como el control de atribucion del proyecto: utiliza exactamente los mismos 6.661 registros de datos y los mismos hiperparametros que su variante CoT v1, pero con las 18.495 anotaciones de tipo `Thought:` eliminadas antes del entrenamiento. De este modo se aisla el efecto de la supervision de pensamiento frente al mero efecto de exposicion a los datos. Segun la model card, es ademas el mejor modelo del proyecto hasta la fecha, con un 31,5 % global en su evaluacion interna.

El modelo se publica bajo licencia Apache-2.0, en formato safetensors, con un repositorio de 18,8 GB. Su relevancia es fundamentalmente experimental: sirve como linea base limpia de calidad de trayectorias para equipos que evaluen rollouts de agentes y como comparador frente a las variantes con chain-of-thought del mismo proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen3.5 (etiqueta `qwen3_5`), orientado a vision-language-action; numero de capas, atencion y detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | No aplica: no se ha publicado informacion que indique una arquitectura MoE |
| Longitud de contexto | 32.768 tokens en la configuracion de servicio recomendada por el autor (`--max-model-len 32768`); contexto nativo maximo no disponible |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible: la model card no especifica idiomas; el formato de salida (`Action: move(dx, dy) and press(keys) [and click(left|right)]`) esta en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (18,8 GB en el repositorio) |
| Modelo base | EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3 |
| Modalidades de entrada | Texto e imagen (hasta 30 imagenes por prompt segun la configuracion de vLLM recomendada) |
| Fecha de publicacion | 15 de septiembre de 2026 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y de su naturaleza multimodal. Se trata por tanto de un transformer con encoder de vision y proyector hacia el espacio de tokens del modelo de lenguaje, empleado como politica de agente: recibe observaciones visuales del entorno de Minecraft mas el historial de interaccion, y produce una accion textual. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, SSM ni arquitecturas hibridas).

El entrenamiento consiste en un continue-SFT sobre el checkpoint Stage3. Los datos son 6.661 filas (5.329 provenientes de trayectorias CoT y 1.332 de replay), las mismas que en la variante CoT v1, pero con las 18.495 lineas `Thought:` eliminadas, de modo que solo queda supervision de acciones. Se aplica un learning rate de 1e-6 durante 5 epocas, y el checkpoint publicado corresponde al paso 525 (epoca 5). No se menciona RLHF, DPO ni ninguna fase de alineacion adicional. La curva de entrenamiento es monotona creciente (22,6 → 22,3 → 24,6 → 28,5 → 31,5) sin senales de sobreajuste a las 5 epocas, a diferencia de v1, que colapsaba en la epoca 5.

## Capacidades

- Generacion de acciones de juego en Minecraft a partir de observaciones visuales: formato de salida estricto `Action: move(dx, dy) and press(keys) [and click(left|right)]`.
- Razonamiento encarnado multi-paso: planificacion y ejecucion de secuencias de accion en un entorno interactivo, evaluado en las categorias "Embodied" y "Combat" de la evaluacion interna.
- Procesamiento multimodal: acepta varias imagenes por prompt (hasta 30 en la configuracion de vLLM indicada), lo que permite aportar contexto visual del entorno.
- Ausencia deliberada de modo pensamiento: el modelo nunca emite lineas `Thought:`, ya que esa supervision fue eliminada de los datos. Esto es una propiedad de diseno, no una limitacion accidental.
- Capacidad de actuar como politica de control pura (action-only), sin cadena de pensamiento intermedia.
- No se documentan capacidades de tool calling, function calling, uso general de codigo, matematicas, audio ni soporte multilingue.

## Casos de uso

- Control de agente en Minecraft: el modelo recibe capturas del entorno y el historial de acciones, y devuelve la siguiente accion a ejecutar en el bucle del agente. Es su proposito directo y el escenario para el que fue entrenado.
- Linea base de control en experimentos de chain-of-thought: comparar sus rollouts con los de las variantes v1 y v2 sobre las mismas semillas permite atribuir cualquier diferencia de comportamiento a la supervision de pensamiento y no a los datos.
- Auditoria de calidad de rollouts: al no generar nunca lineas `Thought:`, sirve como referencia estable de calidad de trayectoria para equipos de QC que revisan episodios de agente.
- Deteccion de bucles de alucinacion: los bucles de hallucination observados en las variantes con pensamiento estan ausentes por construccion en este modelo, lo que lo convierte en un comparador util para medir esa patologia.
- Estudio de exposicion a datos en ajuste fino: el salto de +6,6 puntos porcentuales respecto al modelo base con solo 6.661 filas y un subconjunto de datos del 3,3 % demuestra que el Stage3 original estaba infraentrenado; es un caso de estudio replicable para quien disene pipelines de SFT.
- Investigacion en agentes encarnados de bajo presupuesto: un modelo de 9,41 B ejecutable en una sola GPU de 24 GB en bf16 permite reproducir experimentos de VLA sin infraestructura de gran escala.
- Evaluacion de robustez en combate simulado: la categoria Combat es donde el modelo mejora mas respecto a las variantes con pensamiento (29,9 % frente a 18,4 % y 23,1 %), por lo que es adecuado para estudiar el impacto de la supervision de pensamiento en tareas reactivas.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta su evaluacion interna propia sobre el conjunto "easy-ng, h29", con 3 rollouts y semilla 42:

| Modelo | Global | Embodied | Combat |
|---|---|---|---|
| Base (Stage3, sin continue-SFT) | 24,9 % | 24,8 % | 25,2 % |
| CoT v1 (pensamientos sin depurar, epoca 4) | 25,3 % | 27,5 % | 18,4 % |
| CoT v2 (pensamientos depurados, epoca 4) | 29,2 % | 31,2 % | 23,1 % |
| Este modelo (sin pensamientos, epoca 5) | 31,5 % | 32,0 % | 29,9 % |

Estos valores corresponden a la metrica interna del autor y no son comparables con benchmarks publicos de terceros.

## Requisitos de hardware

- Peso de los pesos en precision completa: 9,41 B de parametros, aproximadamente 18,8 GB en bf16/fp16, que coincide con el tamano del repositorio.
- VRAM estimada para inferencia en bf16: alrededor de 20-24 GB contando pesos y cache KV para contextos cortos; el coste adicional de la cache KV a 32.768 tokens no esta documentado y depende del numero de capas y cabezas, no disponible.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB para bf16 con contexto completo. Con cuantizacion a 8 bits (aproximadamente 10 GB) o 4 bits (aproximadamente 6 GB) cabria en GPUs de 16 GB, aunque no se publican pesos cuantizados oficiales.
- Cabe en GPU de consumo: si, en una RTX 4090 o RTX 3090 de 24 GB en bf16 siempre que se limite la longitud de contexto y el numero de imagenes por prompt; en GPUs de 12-16 GB solo con cuantizacion aplicada por el usuario.
- Opciones de despliegue: vLLM, con el comando exacto que indica el autor (`vllm serve . --served-name cot-ctrl-e5 --max-model-len 32768 --limit-mm-per-prompt image=30`). Tambien son viables TGI o inferencia directa con Transformers. llama.cpp y Ollama requeririan conversion a GGUF y no esta garantizado el soporte multimodal del proyector de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos de terceros directamente comparables en la categoria de agentes VLA para Minecraft. La comparacion mas significativa es dentro del propio proyecto del autor:

| Modelo | Parametros | Contexto | Evaluacion interna (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minecraft-Agent-CoT-Qwen3.5-9B-Control (este) | 9,41 B | 32.768 tokens en servicio | 31,5 % | Apache-2.0 | HuggingFace, 0 descargas |
| Minecraft-Agent-Qwen3.5-9B-Stage3 (base) | 9,41 B (no confirmado en ficha) | no disponible | 24,9 % | Apache-2.0 (segun modelo derivado) | HuggingFace |
| Minecraft-Agent-CoT-Qwen3.5-9B-v1 | no disponible | 32.768 tokens en servicio | 25,3 % (epoca 4) | Apache-2.0 (segun modelo derivado) | HuggingFace |
| Minecraft-Agent-CoT-Qwen3.5-9B-v2 | no disponible | 32.768 tokens en servicio | 29,2 % (epoca 4) | Apache-2.0 (segun modelo derivado) | HuggingFace |

Los datos de parametros y contexto de las variantes v1, v2 y Stage3 no aparecen en la informacion proporcionada; la licencia Apache-2.0 se infiere de la de este modelo derivado y debe verificarse en cada repositorio.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el modelo esta especializado en Minecraft y no debe esperarse un comportamiento util en tareas generales de lenguaje, codigo o razonamiento.
- Salida de formato fijo: solo produce acciones con la sintaxis `move(dx, dy)`, `press(keys)` y `click(left|right)`. No emite razonamiento explicito, lo que dificulta la depuracion de decisiones erroneas.
- Idiomas soportados no declarados: no hay informacion sobre cobertura multilingue; el entrenamiento y el formato de salida estan en ingles.
- Riesgo de alucinacion de acciones: como politica de agente, puede emitir acciones validas sintacticamente pero invalidas para el estado del entorno. El autor senala que los bucles de alucinacion de las variantes con pensamiento estan ausentes aqui por construccion, pero no se cuantifica la tasa de error en el mundo real.
- Evaluacion limitada: la unica metrica disponible es una evaluacion interna de 3 rollouts con una sola semilla (42) sobre el conjunto "easy-ng, h29", sin validacion cruzada ni benchmarks estandar. Los porcentajes no son comparables con resultados publicos.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias; ademas la licencia del modelo base Qwen subyacente debe verificarse por separado.
- Ausencia de pesos cuantizados oficiales: desplegar en hardware limitado exige cuantizar por cuenta propia, con el consiguiente riesgo de degradacion no medida.
- Modelo de investigacion: no se documentan pruebas de seguridad, filtrado de contenido ni comportamiento adversarial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EmberJin/Minecraft-Agent-CoT-Qwen3.5-9B-Control
- Modelo base (Stage3): https://huggingface.co/EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3
- Variante CoT v1: https://huggingface.co/EmberJin/Minecraft-Agent-CoT-Qwen3.5-9B-v1
- Variante CoT v2 (mencionada en la model card, URL no confirmada): no disponible
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados corresponden a sitios genericos de tecnologia y ayuda de Google, sin relacion con el modelo.
