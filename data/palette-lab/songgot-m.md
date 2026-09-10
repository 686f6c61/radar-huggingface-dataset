# palette-lab/songgot-m

## Resumen

Songgot-M (송곳, "taladro" en coreano) es un modelo de lenguaje de 126 millones de parametros desarrollado por Hanish Keloth (Palette) y publicado bajo el identificador `palette-lab/songgot-m`. Se trata de un modelo entrenado desde cero, no de un fine-tuning sobre una base existente, y su proposito es muy concreto: la seleccion de herramientas (tool calling) de un solo paso en coreano, pensada para ejecutarse en dispositivo (on-device) y en navegador. La model card lo describe explicitamente como un modelo "tiny agentic" con el coreano como idioma prioritario.

Tecnicamente es un transformer decoder-only de 16 capas y dimension oculta 768, con unos 125,3 millones de parametros reales segun los pesos safetensors publicados. Se preentreno con 6.000 millones de tokens sobre 8 GPU H100 en Modal, y despues se postentreno sobre un conjunto interno de tool calling (v5) y sobre el corpus v2 de llamadas a funciones. El tokenizador es SentencePiece BPE de 32.000 entradas con byte fallback, y el repositorio incluye exportaciones GGUF en f16, Q8_0 y Q4_K_M, lo que habilita su ejecucion en CPU y en movil.

Su relevancia actual esta en la combinacion de tres factores: licencia Apache 2.0 sin restricciones, un tamano que cabe en cualquier dispositivo y un tokenizador eficiente en hangul (0,90 tokens por silaba coreana frente a 0,98 de Gemma 3, 1,15 de Qwen3 y 3,47 de Needle 2, segun las mediciones del autor). No obstante, el propio autor advierte que el alcance es limitado: solo seleccion de herramienta y extraccion de argumentos en una unica llamada, sin multiturno, sin resultados de herramienta y sin chat libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "llama" en el repo) |
| Parametros totales | 125.264.640 (aprox. 126M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF f16, Q8_0, Q4_K_M; pesos safetensors en el repo |
| Idiomas soportados | Coreano (ko) y ingles (en); coreano como idioma prioritario |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

Detalles adicionales de configuracion: 16 capas, hidden size 768, tokenizador SentencePiece BPE de 32.000 tokens con byte fallback (`tokenizer.model`). El tamano del repositorio es de 0,7 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 16 capas con dimension oculta 768, entrenado desde cero. El preentrenamiento se realizo sobre 6.000 millones de tokens en 8 GPU H100 (Modal). La composicion de datos declarada es: muestra sample-10BT de fineweb-edu (licencia ODC-By), Wikipedia en coreano del 20231101 (CC BY-SA 3.0), el corpus glaive-function-calling-v2 (Apache 2.0) y llamadas a herramientas en coreano generadas por plantilla (Apache 2.0, incluidas en el repositorio). El autor afirma explicitamente que no se usaron salidas de modelos cerrados y que FunctionChat-Bench nunca se empleo para entrenamiento.

El postentrenamiento consta de dos fases sobre los conjuntos v5 y v2 de tool calling. Existe una variante hermana, "Songgot" (50M), que anade una fase de RL con recompensa de similitud, pero los pesos de este repositorio corresponden a Songgot-M, 2 epocas del conjunto v5, sin esa fase de RL. El formato de prompt es explicito y estructurado: bloque `<|system|>` con la lista de herramientas en JSON, bloque `<|user|>` con la consulta, y salida en `<|call|>` con un objeto JSON de nombre y argumentos cerrado por `<|end|>`. Los tokens especiales viven dentro del vocabulario, por lo que debe usarse `sentencepiece` directamente.

## Capacidades

- Seleccion de herramienta de un solo paso (single-call tool selection) a partir de una lista de funciones descrita en JSON.
- Extraccion de argumentos estructurados: el modelo emite un objeto JSON con `name` y `arguments` listo para parsear.
- Soporte de function calling / tool calling en el sentido estricto de elegir funcion y rellenar parametros, no de orquestar.
- Generacion de texto condicionada al esquema de herramientas, en formato de plantilla cerrado.
- Capacidad multilingue limitada a coreano e ingles, con clara prioridad por el coreano (tokenizacion de 0,90 tokens por silaba hangul).
- No dispone de modo de razonamiento explicito (thinking), ni vision, ni audio, ni capacidad multimodal.
- No soporta multiturno, ni resultados de herramienta, ni chat libre, segun los limites declarados por el autor.
- No se declara soporte de agentes multi-paso ni de razonamiento encadenado.

## Casos de uso

- Control de domotica en dispositivo: el modelo recibe la lista de funciones de un asistente de hogar (por ejemplo `set_alarm`, `set_light`) y la frase del usuario en coreano, y devuelve la llamada con argumentos normalizados. Es el escenario literal del ejemplo de la model card ("내일 아침 7시에 알람 맞춰줘" -> `{"name":"set_alarm","arguments":{"time":"07:00"}}`) y encaja por su tamano reducido y su ejecucion offline.
- Asistentes moviles sin conectividad: con la exportacion Q4_K_M (del orden de decenas de MB) el modelo puede embeberse en una app Android o iOS mediante llama.cpp y resolver la seleccion de funcion localmente, sin enviar audio ni texto a un servidor.
- Router de intenciones en pipelines de agentes mayores: usar Songgot-M como primer clasificador barato que decide que herramienta invocar y delega la ejecucion en un modelo mayor. Reduce coste y latencia en el paso mas frecuente, que suele ser la seleccion de herramienta.
- Extraccion de parametros en coreano para backends de ticketing o reservas: a partir de una frase como una fecha o una hora expresada en lenguaje natural coreano, el modelo produce el JSON con el argumento formateado, que luego se valida en el codigo de aplicacion.
- Preprocesado de formularios y comandos en castellano tecnico interno: aunque no es su idioma objetivo, puede usarse como referencia de investigacion para comparar el coste de tokenizacion y la precision de tool calling entre coreano, ingles y otras lenguas.
- Evaluacion y benchmarking: sirve como baseline pequeno y reproducible (con scorer publicado en el repositorio) para medir si un modelo de 126M puede competir en FunctionChat-Bench frente a alternativas de 270M o 600M.
- Demo en navegador y formacion: al ejecutarse en el navegador sin instalacion tras la primera carga, es util para talleres, demos docentes y pruebas de concepto de asistentes on-device.
- Automatizacion de escritorio en coreano: integracion en herramientas tipo CLI o scripts que traduzcan lenguaje natural a invocaciones de funciones locales (abrir aplicaciones, crear recordatorios) siempre que cada llamada se valide antes de ejecutarse.

## Benchmarks y rendimiento

Resultados publicados por el autor en Kakao FunctionChat-Bench SingleCall (500 elementos en coreano, 5 condiciones de herramientas; coincidencia exacta en nombre de funcion y argumentos; scorer disponible en el repositorio). Los comparadores se ejecutaron con las mismas herramientas y consultas, en sus formatos documentados:

| Modelo | Parametros | exact | 4_random | 4_close | 8_random | 8_close | all | name only |
|---|---|---|---|---|---|---|---|---|
| Songgot-M (2 epocas, set v5) | 126M | 32,0 | 13,0 | 8,0 | 7,0 | 0,0 | 12,0 | 53,0 |
| Songgot (2 epocas, v5 + RL de similitud) | 50M | 26,0 | 12,0 | 10,0 | 7,0 | 2,0 | 11,4 | 53,6 |
| Songgot-nano (1 epoca) | 39M | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| Needle 2 | 45M | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| FunctionGemma-270M | 270M | 3,0 | 5,0 | 1,0 | 1,0 | 1,0 | 2,2 | 36,2 |
| Qwen3-0.6B | 600M | 48,0 | 49,0 | 45,0 | 37,0 | 37,0 | 43,2 | 70,8 |

Nota de coherencia: la tabla anterior reproduce las cifras de la seccion "Numbers" de la model card; la seccion "Status" del mismo documento cita para Songgot-M una precision de llamada (`all`) de 12,0 y `name only` de 53,0, que coinciden con la fila de la tabla. La columna `exact` (32,0) no se explica con detalle en la informacion disponible.

Eficiencia de tokenizacion en coreano, medida sobre las mismas 100 consultas: Songgot 0,90 tokens por silaba hangul, Gemma 3 0,98, Qwen3 1,15, Needle 2 3,47. No se especifica en la model card si la cifra de 0,90 corresponde a la variante M o a la variante de 50M. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en f16 unos 250 MB de pesos; en Q8_0 alrededor de 130 MB; en Q4_K_M en torno a 75-80 MB. Hay que sumar el espacio del contexto y del tokenizador, marginal en cualquier caso.
- GPU recomendadas: no necesita GPU dedicada. Puede ejecutarse en cualquier GPU consumer (RTX 3060, RTX 4090, integradas modernas) y tambien en CPU. El entrenamiento se realizo en 8xH100, pero eso no condiciona la inferencia.
- Cabe sin problema en GPU consumer: si, en practicamente todas, incluidas GPU integradas y aceleradores de movil. El cuello de botella real es la memoria del dispositivo, no la capacidad de computo.
- Opciones de despliegue: llama.cpp y Ollama mediante los GGUF incluidos; Transformers con los safetensors; text-generation-inference (el repo lleva la etiqueta `text-generation-inference`); vLLM es viable por tamano aunque no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles. No se publican cifras de tokens por segundo ni de latencia por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FunctionChat-Bench (all / name only) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Songgot-M | 126M | no disponible | 12,0 / 53,0 | Apache 2.0 | safetensors y GGUF en HuggingFace |
| Songgot | 50M | no disponible | 11,4 / 53,6 | Apache 2.0 | variante hermana del mismo autor |
| Songgot-nano | 39M | no disponible | 0,0 / 0,0 | no disponible | variante del mismo autor |
| Needle 2 | 45M | no disponible | 0,0 / 0,0 | no disponible | comparador citado por el autor |
| FunctionGemma-270M | 270M | no disponible | 2,2 / 36,2 | no disponible | comparador citado por el autor |
| Qwen3-0.6B | 600M | no disponible | 43,2 / 70,8 | no disponible | comparador citado por el autor |

Lectura de la comparativa: Songgot-M supera con claridad a FunctionGemma-270M, que tiene mas del doble de parametros, y queda muy por detras de Qwen3-0.6B, casi cinco veces mayor. Frente a modelos de su propia escala (39M-50M) la ventaja es total, ya que tanto Songgot-nano como Needle 2 obtienen cero. La informacion disponible no incluye la licencia ni la longitud de contexto de los comparadores.

## Limitaciones y advertencias

- Alcance funcional muy restringido: solo seleccion de herramienta de una unica llamada y extraccion de argumentos. No hay multiturno, ni gestion de resultados de herramienta, ni conversacion libre. Usarlo como chatbot produce resultados fuera de su distribucion de entrenamiento.
- Fragilidad con herramientas poco frecuentes y con valores parafraseados. El autor recomienda explicitamente validar cada llamada en el codigo de aplicacion antes de ejecutarla.
- Riesgo de alucinacion en argumentos: puede emitir nombres de funcion o valores plausibles pero incorrectos, especialmente cuando la lista de herramientas es larga (la precision cae a 7,0 en la condicion 8_random y a 0,0 en 8_close).
- Precision global baja: 12,0 de coincidencia exacta global en FunctionChat-Bench SingleCall. Aunque la identificacion del nombre de funcion alcanza 53,0, el relleno correcto de argumentos es el principal punto debil.
- Cobertura idiomatica limitada: coreano e ingles declarados; no hay evidencia de rendimiento en castellano y el tokenizador no esta optimizado para otras lenguas.
- Longitud de contexto no especificada en la informacion disponible, lo que impide planificar usos con prompts largos o listas de herramientas extensas.
- Atribucion obligatoria por el corpus de Wikipedia en coreano: la licencia CC BY-SA 3.0 del texto de entrenamiento implica mantener el aviso de atribucion y share-alike; la model card lo asume, pero conviene conservarlo en redistribuciones.
- Licencia del modelo: Apache 2.0, sin restriccion de uso comercial explicita. Verificar en cualquier caso las licencias de los datasets derivados (ODC-By para fineweb-edu).
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema practicamente sin validacion externa ni casos de produccion conocidos.
- Advertencia de integracion: los tokens especiales estan dentro del vocabulario, por lo que hay que usar `sentencepiece` directamente y respetar el formato de plantilla; un prompt mal formateado degrada la salida de forma acusada.

## Enlaces

- HuggingFace: https://huggingface.co/palette-lab/songgot-m
- Paper: https://hanishkeloth.github.io/songgot
- Codigo, generadores de datos y scorer: https://github.com/hanishkeloth/songgot
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Hanish/songgot
- Aplicacion en navegador (offline tras la primera carga): https://hanishkeloth.github.io/songgot/app/
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Wikipedia (coreano): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
