# Lucas989/sn92-generalist-m1-core7a

## Resumen

SN92 generalist-m1-core7a es un modelo de clasificación de texto publicado por Lucas989 en Hugging Face, construido mediante un merge en el espacio de pesos (weight-space merge) de cuatro fine-tunes sobre el modelo base baselabs/mammoth-1. Mammoth-1 es a su vez un post-entrenamiento de Qwen3.5-27B (Apache-2.0) realizado por Base Labs / Baseten, con una arquitectura de backbone Qwen3_5Model y un cabezal de lectura de respuestas ("answer-code readout") que lo convierte en un modelo de decisión: en lugar de generar texto libre, selecciona una opción entre un conjunto de respuestas codificadas.

El modelo combina dos fine-tunes públicos (isomsom/sn92-gen-m87b y xflud/sn92-decider-1, ambos con licencia MIT y peso 0.7) con dos fine-tunes propios del autor (v3a y v7a, peso 0.25 cada uno), aplicando aritmética de tareas lineal sobre cada tensor del backbone. El resultado es un modelo de 26.085.330.160 parámetros (unos 26,1 mil millones) en formato bf16, orientado a tareas de decisión de opción múltiple en 58 tipos de tareas, incluyendo razonamiento aritmético, lógica, código, conocimiento factual, análisis de sentimiento, NLI y recuperación de argumentos.

Su relevancia radica en que demuestra una técnica de composición de modelos (task arithmetic sobre fine-tunes) aplicada a un modelo de decisión de gran tamaño, con una receta reproducible documentada tensor a tensor. No es un modelo generativo conversacional: es un clasificador de decisión con readout de letra, pensado para evaluación y benchmarking de razonamiento, no para despliegue como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3_5Model con atención completa no causal y readout de respuesta (REAX joint-readout) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 6.144 tokens (longitud máxima de prompt usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los datasets de entrenamiento incluyen MASSIVE 1.1 localizado, pero no se especifica cobertura) |
| Licencia | MIT |
| Formato de pesos | safetensors, bfloat16 (repo de 52,2 GB) |

## Arquitectura y entrenamiento

El modelo es un merge en el espacio de pesos de cuatro fine-tunes sobre baselabs/mammoth-1. La receta aplicada es aritmética de tareas lineal tensor a tensor: `base + lam * combine_i(w_i * (parent_i - base))` con `lam = 1.0`, calculada en float32 y redondeada una sola vez a bfloat16. Los pesos de cada padre son 0.7 para los dos fine-tunes públicos y 0.25 para cada uno de los dos fine-tunes propios. El readout de respuesta (`readout.safetensors`) es la media de los readouts de los padres tras normalizar cada uno por su escala respecto al readout de mammoth-1. La configuración (`config.json`, `joint_config.json`, tokenizer y `decision_config.json` con temperatura 0.5) sigue el paquete conjunto de mammoth-1.

Los fine-tunes propios se entrenaron con LoRA de rango 16 y alpha 32 (sin dropout) sobre las proyecciones q/k/v/o de atención, las proyecciones in_proj_qkv / in_proj_z / out_proj del Gated DeltaNet y las proyecciones gate/up/down del MLP de las 64 capas del modelo de lenguaje, fusionadas en los pesos bf16. El entrenamiento usó entropía cruzada entre `softmax(letter logits / 2)` y la opción dorada con label smoothing de 0.1, AdamW con lr 5e-5 y decaimiento coseno, 20 pasos de warm-up, batch efectivo de 32 filas y 1 época sobre 43.242 filas de pregunta de 58 tipos de tarea (unas 600-900 filas por tipo, 2.400 para preguntas de abstención), con longitud máxima de prompt de 6.144 tokens. El fine-tune v7a añade 7.620 filas de "owner-gap" (stance, sarcasmo, NLI clínico, aritmética GSM8K-train con distractores de código, recuperación de herramientas de línea de comandos, recuperación de contraargumentos y ranking de productos); el merge usa su checkpoint tras 400 de 1.590 pasos de optimizador.

Los datos de entrenamiento de los padres propios proceden solo de fuentes permisivas: ítems generados proceduralmente (CC0 1.0), Project Gutenberg, CMU Pronouncing Dictionary (BSD-2-Clause), GeoNames (CC BY 4.0), ContractNLI (CC BY 4.0), HANS (MIT), MASSIVE 1.1 (CC BY 4.0), CLINC150 + OOS (CC BY 3.0), BANKING77 (CC BY 4.0), args.me (CC BY 4.0), metadatos de arXiv (CC0 1.0), Wikidata (CC0 1.0), Aegis 2.0 (CC BY 4.0), PEPs de Python, índice de RFC de la IETF, obras del gobierno de EE. UU. (dominio público), WinoGrande (CC BY), CommonsenseQA (MIT) y StrategyQA (MIT). No se incluye texto escrito por modelos de OpenAI o Anthropic ni el split de test de Decision-Index.

## Capacidades

- Clasificación de decisión de opción múltiple: selecciona una letra de respuesta entre las opciones codificadas mediante el readout de respuesta.
- Razonamiento aritmético y matemático: problemas de palabras aritméticos y aritmética GSM8K-train con distractores de código.
- Razonamiento lógico y causal: preguntas de lógica, causal sí/no, ajedrez, acordes musicales.
- Comprensión de código: predicción de salida de código y recuperación de herramientas de línea de comandos.
- Conocimiento factual: preguntas de conocimiento con opción explícita de "no lo sé" y abstención calibrada.
- NLI y análisis semántico: inferencia de lenguaje natural (ContractNLI, HANS), postura (stance), sarcasmo.
- Clasificación de intenciones y dominio: CLINC150 + OOS, BANKING77, MASSIVE 1.1.
- Recuperación de argumentos y contraargumentos: corpus args.me.
- Ranking de productos y recuperación de herramientas / API.
- Clasificación de seguridad: etiquetas de daño de respuesta derivadas de Aegis 2.0.
- No dispone de generación de texto libre, tool calling generativo ni capacidades de agente multi-paso en el sentido conversacional; su salida es una decisión codificada.

## Casos de uso

- Evaluación de razonamiento en benchmarks de opción múltiple: el modelo puede ejecutar baterías de preguntas en formato REAX eval-v5.1 (aritmética, lógica, NLI, conocimiento) y producir una letra de respuesta por ítem, lo que permite medir precisión por tipo de tarea con prompts de hasta 6.144 tokens.
- Clasificación de intenciones en asistentes de voz y chatbots: con los datos de CLINC150, BANKING77 y MASSIVE 1.1, puede etiquetar la intención de una consulta de usuario entre un conjunto cerrado de clases, adecuado para enrutamiento previo a un modelo generativo.
- Moderación y clasificación de seguridad: usando las etiquetas de daño de Aegis 2.0, puede clasificar respuestas de un sistema como dañinas o no dañinas dentro de un pipeline de filtrado.
- Verificación de consistencia en contratos y documentos legales: con ContractNLI y HANS, puede evaluar si una hipótesis se sigue de una premisa contractual, útil para revisiones automatizadas de cláusulas.
- Análisis de sentimiento y postura en redes sociales o foros: los tipos de tarea de stance y sarcasmo permiten clasificar la posición de un texto respecto a un tema, con contexto de hasta 6.144 tokens para hilos largos.
- Recuperación de argumentos para sistemas de debate o recomendación: con args.me, puede seleccionar el argumento más relevante entre candidatos para una consulta dada.
- Ranking de productos y recuperación de herramientas: puede ordenar candidatos (productos, APIs, comandos de línea de comandos) según su adecuación a una consulta, como paso de re-ranking en un pipeline de búsqueda.
- Abstención calibrada en preguntas de conocimiento: el entrenamiento con opción "no lo sé" y la temperatura 0.5 del `decision_config.json` permiten que el modelo decline responder cuando su probabilidad de acierto es baja, útil en sistemas que priorizan precisión sobre cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,1 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 60-70 GB de VRAM para inferencia cómoda.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB con paralelismo de tensor) para bf16.
- No cabe en una única GPU consumer de 24 GB en bf16; requeriría cuantización (no documentada en el repo) o sharding multi-GPU.
- Opciones de despliegue: el repo usa `library_name: pytorch` y requiere el paquete conjunto de mammoth-1 (`config.json`, `joint_config.json`, tokenizer, `decision_config.json`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo estándar es probable que estos motores no lo soporten sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lucas989/sn92-generalist-m1-core7a | 26,1 B | 6.144 tokens (prompt de entrenamiento) | Clasificador de decisión (merge) | MIT | Hugging Face, 58 descargas |
| baselabs/mammoth-1 | no disponible en la información | no disponible | Modelo de decisión (base) | MIT | Hugging Face |
| isomsom/sn92-gen-m87b | no disponible en la información | no disponible | Fine-tune de decisión | MIT | Hugging Face |
| xflud/sn92-decider-1 | no disponible en la información | no disponible | Fine-tune de decisión | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; su salida es una decisión codificada sobre un conjunto cerrado de opciones.
- Riesgo de alucinación en el sentido de seleccionar una opción incorrecta con alta confianza; la calibración depende de la temperatura 0.5 del `decision_config.json` y del entrenamiento con abstención, pero no se han publicado métricas de calibración.
- Sesgos potenciales derivados de los datasets de entrenamiento (Project Gutenberg, censos de EE. UU., GeoNames, Aegis 2.0, entre otros); no se documenta una evaluación de sesgos.
- Cobertura de idiomas no declarada; aunque MASSIVE 1.1 está localizado, no se especifica qué idiomas domina el modelo.
- Longitud de contexto limitada a 6.144 tokens en entrenamiento; prompts más largos pueden degradar el rendimiento.
- El merge combina fine-tunes con pesos fijos (0.7 y 0.25) sin validación publicada de que la combinación sea óptima para todas las tareas.
- Licencia MIT permite uso comercial, pero los datos de entrenamiento de los padres públicos no están documentados en esta ficha; conviene revisar las model cards de isomsom/sn92-gen-m87b y xflud/sn92-decider-1 antes de un despliegue comercial.
- El autor declara no estar afiliado a Base Labs / Baseten, al equipo de Qwen ni a REAX; el modelo se publica como trabajo independiente.
- Repo de 52,2 GB y solo 58 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucas989/sn92-generalist-m1-core7a
- Modelo base mammoth-1: https://huggingface.co/baselabs/mammoth-1
- Padre público isomsom/sn92-gen-m87b: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre público xflud/sn92-decider-1: https://huggingface.co/xflud/sn92-decider-1
- Qwen3.5-27B (origen del backbone, Apache-2.0): no disponible en la información proporcionada
- Paper o blog de REAX eval-v5.1: no disponible en la información proporcionada
- Repositorio de código del merge: no disponible en la información proporcionada
