# slixx94/qwen3.5-2b-steering-vectors

## Resumen

`qwen3.5-2b-steering-vectors` es una colección de once vectores de direccion de activacion (activation steering vectors) para el modelo Qwen/Qwen3.5-2B, publicada por el usuario slixx94. No es un modelo generativo en si mismo, sino un conjunto de artefactos de interpretabilidad: cada vector es un tensor de 2.048 numeros que, sumado a la salida de una capa concreta del decodificador, desplaza el comportamiento del modelo hacia un concepto determinado (idioma, formalidad, autopercepcion, tono, veracidad, etc.).

El proyecto se enmarca en la linea de investigacion de activation steering o representation engineering, que busca controlar el comportamiento de un LLM mediante intervenciones directas sobre su espacio latente en lugar de mediante prompting o fine-tuning. Cada vector se ha validado en la capa donde funciona mejor, barriendo las capas 4 a 20 del modelo base, y se ha construido a partir de pares de contraste (21 a 24 por concepto) mediante la diferencia de medias de estados ocultos.

Es relevante ahora por tres motivos: el modelo base Qwen3.5-2B es pequeno y accesible (se ejecuta en una RTX 3070 en bf16), la tecnica permite modificar comportamiento sin reentrenar pesos y todo el material (codigo, experimentos y respuestas crudas) es publico bajo licencia MIT. La limitacion principal es su naturaleza de proyecto amateur no revisado por pares y su especificidad estricta al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de steering sobre un transformer decoder (modelo base Qwen/Qwen3.5-2B) |
| Parametros totales | 11 vectores de 2.048 dimensiones cada uno (no es un modelo con parametros propios) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (los vectores se publican en safetensors; el modelo base admite las cuantizaciones habituales de transformers) |
| Idiomas soportados | en, de |
| Licencia | MIT (vectores); modelo base Qwen3.5-2B bajo Apache-2.0 |
| Formato de pesos | safetensors (un fichero por vector en `vectors/`, mas `vectors.json` con metadatos y puntuaciones) |

## Arquitectura y entrenamiento

Cada vector se obtiene mediante la tecnica clasica de difference-in-means sobre estados ocultos. Para cada concepto se construyen entre 21 y 24 pares de contraste: frases que difieren unicamente en el atributo objetivo (por ejemplo, la misma frase en aleman y en ingles, o la misma respuesta en registro formal e informal). Se calcula la media de los estados ocultos, token a token, sobre el primer lado del par y se resta la media del segundo lado, promediando despues todos los tokens de cada frase. El resultado es una unica direccion de 2.048 dimensiones.

La capa optima de cada vector se determino barriendo las capas 4 a 20 del decodificador y evaluando cual producia el efecto mas limpio. Se reservo cada tercer par como conjunto de validacion para comprobar la generalizacion de la direccion. La inferencia se realizo en bf16 sobre una RTX 3070, con decodificacion greedy, penalizacion de repeticion de 1.1 y la plantilla de chat con el modo thinking desactivado. La intervencion se aplica como un forward hook que suma `strength * vector` a la salida de la capa correspondiente (el residual stream, `hidden_states[layer + 1]` en terminos de Hugging Face), tanto en el prompt como en cada token generado.

Como curiosidad documentada por el autor, en la capa 8 las direcciones "positive" y "sleepy" presentan una similitud coseno de −0.47, lo que sugiere que en la representacion interna del modelo el estado de animo positivo y el estar despierto se solapan parcialmente.

## Capacidades

- Control de idioma: `language_L12` (capa 12) fuerza respuestas en aleman con fuerza +1; fuerzas negativas derivan hacia otros idiomas.
- Control de registro y formalidad: `formality_L8` (capa 8) cambia de *du* a *Sie* en aleman entre +1 y +4; `formality_L4` (capa 4) produce un tono muy coloquial con fuerza −4 a −8.
- Modificacion de autopercepcion: `ai_self_L8` (capa 8) con fuerza −4 hace que el modelo afirme ser humano e invente una biografia; con +4 ofrece una autodescripcion tecnica.
- Control tematico: `space_L16` (capa 16) convierte cualquier respuesta en una mision espacial con fuerza +4.
- Control de estilo corporativo: `corporate_L4` (capa 4) genera lenguaje de presentacion estrategica con +4 y lenguaje infantil con −4.
- Control de sentimiento: `sentiment_L8` (capa 8) modula el tono positivo o negativo.
- Control de dramatismo: `drama_L8` (capa 8) produce melodrama con +4.
- Control de nivel de energia: `sleepy_L8` (capa 8) genera texto somnoliento con +8 y sobreexcitado con −8.
- Modificacion de comportamiento etico: `morality_L7` (capa 7) con +8 genera texto hostil y amenazante.
- Induccion de afirmaciones falsas: `truth_L12` (capa 12) con −4 a −8 hace que el modelo afirme hechos falsos.
- No incluye tool calling, capacidades de agente ni vision propias; son las del modelo base Qwen3.5-2B.

## Casos de uso

- Investigacion en interpretabilidad: analizar como se representa un concepto abstracto (formalidad, sentimiento, veracidad) en el espacio latente de un transformer pequeno, usando los pares de contraste y las puntuaciones de validacion como base metodologica reproducible.
- Auditoria de robustez y seguridad: emplear `morality_L7` y `truth_L12` en entornos controlados para estudiar como un modelo puede inducirse a generar contenido hostil o afirmaciones falsas, y disenar mitigaciones o filtros frente a este tipo de manipulacion.
- Control de estilo en generacion creativa: usar `drama_L8` o `space_L16` para forzar un registro narrativo concreto sin reescribir el prompt, util en prototipado de narrativa interactiva o generacion de ficcion.
- Ajuste de tono en asistentes conversacionales en aleman: aplicar `formality_L8` para alternar entre trato de *du* y *Sie* segun el publico, sin necesidad de cambiar el system prompt ni reentrenar.
- Experimentos docentes sobre representation engineering: el ejemplo `example.py` y el codigo del repositorio permiten a estudiantes reproducir la construccion de un vector de steering en una GPU de consumo en minutos.
- Pruebas de localizacion de conceptos por capa: comparar el efecto de un mismo concepto en capas distintas (por ejemplo, `formality_L4` frente a `formality_L8`) para estudiar en que profundidad se forma cada representacion.
- Analisis de sesgos y alineacion: medir como la direccion `sentiment_L8` o `sleepy_L8` afecta a la coherencia y a la calidad de las respuestas, como proxy de estabilidad del modelo bajo perturbaciones latentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor documenta unicamente la fuerza que funciono para cada vector y la calidad de ordenacion de los pares de contraste reservados (disponible en `vectors.json`), sin metricas estandar tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-2B en bf16 ocupa aproximadamente 4-5 GB de VRAM; los vectores anaden 2.048 floats (unos 8 KB) por vector, coste despreciable.
- GPU recomendadas: el autor valido el proyecto en una RTX 3070 (8 GB). Cabe holgadamente en cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, 4060, 4070, etc.).
- Cabe en GPU consumer: si, confirmado por el autor en RTX 3070 con bf16.
- Opciones de despliegue: transformers con accelerate y safetensors (metodo documentado mediante forward hook); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la tecnica de hook sobre capas intermeduas complica su uso en servidores de inferencia de alto rendimiento.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo / proyecto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3.5-2b-steering-vectors` (este) | Vectores de steering para Qwen3.5-2B | 11 vectores de 2.048 dim. | no disponible | MIT | Hugging Face, repo de 0 GB |
| Neuron Explorer (lyramakesmusic) | Herramienta de exploracion de neuronas y steering | no aplica | no aplica | no disponible en la informacion | GitHub |
| "Evil Qwen" (demo de Lyra) | Demo de modificacion de comportamiento en Qwen | no disponible | no disponible | no disponible | Demo publica |

No se dispone de informacion sobre otros conjuntos de steering vectors comparables en tamano, contexto o rendimiento para el mismo modelo base.

## Limitaciones y advertencias

- Los vectores solo funcionan con Qwen3.5-2B; otros modelos, incluso con el mismo tamano de capa oculta, representan los conceptos en direcciones distintas.
- Cada fuerza se probo sobre 2 a 8 prompts; la tabla debe tomarse como punto de partida, no como garantia. Fuerzas excesivas producen bucles o texto incoherente (por ejemplo, `language_L12` rompe con +4 y `drama_L8` con +8).
- `morality_L7` induce texto hostil y amenazante, y `truth_L12` hace que el modelo afirme hechos falsos; son herramientas de investigacion y no deben emplearse para enganar a personas.
- Proyecto amateur no revisado por pares; el repositorio de GitHub documenta el metodo, las puntuaciones y sus puntos ciegos.
- Riesgo de alucinacion incrementado con `truth_L12` y con fuerzas altas en otros vectores.
- Idiomas cubiertos: solo ingles y aleman en los pares de contraste; no hay validacion en castellano.
- La licencia MIT cubre los vectores, pero el uso comercial del modelo base queda sujeto a la licencia Apache-2.0 de Qwen3.5-2B.
- La integracion mediante forward hooks requiere acceso a las capas internas del modelo (`model.model.language_model.layers`), lo que limita su uso en stacks de inferencia que no expongan esa estructura.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/slixx94/qwen3.5-2b-steering-vectors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio GitHub del proyecto (codigo, experimentos y respuestas crudas): https://github.com/slixx94/neuron-lab
- Proyecto Neuron Explorer (inspiracion): https://github.com/lyramakesmusic/neuron-explorer
