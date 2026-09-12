# palette-lab/songgot-l

## Resumen

Songgot-L (송곳, "taladro" o "punzon" en coreano) es un modelo de lenguaje compacto de 303.350.784 parametros (unos 303M) desarrollado por Hanish Keloth (Palette) y publicado por el usuario palette-lab. Se trata de un modelo "tiny" entrenado desde cero, disenado especificamente para una unica tarea: la llamada a herramientas (tool calling / function calling) en coreano sobre dispositivos locales (on-device). No es un modelo de proposito general: no hace chat libre ni razonamiento multi-turno, sino que convierte una peticion en lenguaje natural coreano en una llamada JSON a una funcion con sus argumentos.

Su relevancia actual radica en dos factores. Primero, la eficiencia de tokenizacion en coreano: su tokenizador SentencePiece BPE de 32k vocabulario consume 0.90 tokens por silaba Hangul, frente a 0.98 de Gemma 3, 1.15 de Qwen3 y 3.47 de Needle 2, lo que reduce el coste de inferencia en este idioma. Segundo, su tamano reducido (1,7 GB de repositorio, con exportaciones GGUF de hasta Q4_K_M) permite ejecutarlo en navegador, movil o CPU sin GPU dedicada, algo relevante para asistentes de voz o aplicaciones coreanas que necesitan funcionar sin conexion.

El modelo se distribuye bajo licencia Apache 2.0, soporta coreano e ingles, y esta publicado con pesos en safetensors y GGUF. Su rendimiento en la tarea objetivo es modesto comparado con modelos generalistas mas grandes (28,2 % de acierto exacto en FunctionChat-Bench SingleCall, frente a 70,4 % de Kanana-2-1.3B), pero compite en la franja sub-500M, donde la mayoria de alternativas obtiene resultados cercanos a cero en ese mismo benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "llama" en el repositorio); 24 capas, hidden size 1024 |
| Parametros totales | 303.350.784 (unos 303M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantizacion | GGUF f16, Q8_0 y Q4_K_M; no se documentan otras (AWQ, GPTQ, etc.) |
| Idiomas soportados | Coreano (ko) e ingles (en); entrenamiento con enfoque coreano-first |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos principales) y GGUF (f16, Q8_0, Q4_K_M) |
| Tokenizador | SentencePiece BPE, vocabulario de 32k, con byte fallback (`tokenizer.model`) |
| Tamano del repositorio | 1,7 GB |
| Fecha de publicacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

Songgot-L es un transformer decoder-only de 24 capas y dimension oculta 1024, con aproximadamente 303M de parametros. Segun la model card, fue entrenado desde cero (no es un fine-tuning de un modelo existente) sobre 8 GPU H100 en la plataforma Modal, con un total de 24.000 millones de tokens procedentes de FineWeb-2 en coreano, la Wikipedia en coreano y fineweb-edu. Tras el preentrenamiento se aplico un post-entrenamiento en dos fases: primero con el conjunto "v8" y despues con la version v2 del conjunto de tool calling.

Los datos de entrenamiento declarados incluyen fineweb-edu sample-10BT (ODC-By), Wikipedia en coreano 20231101.ko (CC BY-SA 3.0), glaive-function-calling-v2 (Apache 2.0) y llamadas a herramientas en coreano generadas por plantilla (Apache 2.0, publicadas en el repositorio). La model card afirma explicitamente que no se usaron salidas de modelos cerrados y que FunctionChat-Bench nunca se empleo para entrenamiento, solo para evaluacion.

El formato de interaccion esta fijado por plantilla: bloque `<|system|>` con la lista de herramientas en JSON, bloque `<|user|>` con la peticion, y bloque `<|call|>` con la llamada generada, cerrada con `<|end|>`. Se recomienda usar `sentencepiece` directamente porque los tokens especiales viven dentro del vocabulario. No se documentan innovaciones como decodificacion especulativa, atencion lineal ni arquitecturas hibridas SSM.

## Capacidades

- Seleccion de herramienta en una sola llamada (single-call): dado un conjunto de funciones candidatas y una consulta en coreano, devuelve el nombre de la funcion y los argumentos en JSON.
- Extraccion de argumentos: normaliza valores expresados en lenguaje natural a parametros estructurados (por ejemplo, "내일 아침 7시" a `"time": "07:00"`).
- Tool calling y function calling como capacidad central, no como capacidad secundaria: es el unico modo de operacion documentado.
- Generacion de texto limitada al formato de llamada; segun la model card no hay chat libre.
- Multilingue en coreano e ingles, con clara orientacion al coreano.
- Tokenizacion eficiente de Hangul (0.90 tokens por silaba), lo que reduce el coste por consulta en coreano.
- Ejecucion on-device: el modelo puede correr en navegador (demo publicada que funciona sin conexion tras la primera carga), movil o CPU.
- No soporta multi-turno, ni resultados de herramientas (tool results), ni razonamiento multi-paso. La model card lo declara explicitamente como limitacion de diseno.

## Casos de uso

- Asistentes de voz en dispositivo para apps coreanas: el modelo convierte una orden hablada o escrita ("내일 아침 7시에 알람 맞춰줘") en una llamada `set_alarm` con argumentos normalizados, sin enviar audio ni texto a la nube. Es adecuado porque toda la inferencia puede ejecutarse localmente con un GGUF Q4_K_M.
- Automatizacion del hogar (IoT) sin conexion: integrado en un concentrador domestico, traduce comandos en coreano a llamadas estructuradas sobre dispositivos (luces, climatizacion, persianas). Su tamano permite ejecutarlo en hardware embebido con CPU y memoria limitada.
- Enrutador previo ("pre-router") en pipelines de agentes: como primer filtro barato que decide que herramienta invocar antes de delegar en un LLM mayor. Su latencia baja y su formato de salida estricto lo hacen util como etapa de clasificacion y extraccion, validando siempre la llamada en codigo de aplicacion.
- Aplicaciones web o plugins de navegador: la demo oficial funciona en el navegador y de forma offline tras la primera carga, lo que habilita asistentes embebidos en webs coreanas sin backend de inferencia.
- Extraccion de parametros en formularios y flujos de atencion al cliente: dado un texto libre del usuario, rellenar campos estructurados (fecha, hora, destinatario, importe) antes de pasarlos a un sistema transaccional posterior.
- Investigacion en tokenizacion y modelos compactos para coreano: sirve como referencia reproducible (codigo, generadores de datos y scorer publicados en GitHub) para estudiar la relacion entre tamano de modelo, tokens por silaba Hangul y precision en tool calling.
- Kioscos, automocion y terminales de punto de venta: interfaces de comandos en coreano donde no se puede garantizar conectividad y donde el modelo debe correr en CPU con un presupuesto de memoria inferior a 1 GB.

## Benchmarks y rendimiento

Resultados en Kakao FunctionChat-Bench SingleCall (500 elementos en coreano, 5 condiciones de herramientas, coincidencia exacta de nombre de funcion y argumentos). Los comparadores se ejecutaron con las mismas herramientas y consultas, en sus formatos documentados:

| Modelo | Parametros | exact | 4_random | 4_close | 8_random | 8_close | all | name only |
|---|---|---|---|---|---|---|---|---|
| Songgot-L (24B tokens, 2 epocas, set v8) | 303M | 42,0 | 38,0 | 24,0 | 27,0 | 10,0 | 28,2 | 72,4 |
| Songgot-M | 126M | 45,0 | 43,0 | 26,0 | 34,0 | 18,0 | 33,2 | 73,8 |
| Songgot (6B tokens, 2 epocas, set v8) | 50M | 44,0 | 39,0 | 30,0 | 35,0 | 17,0 | 33,0 | 73,6 |
| Songgot-nano (1 epoca) | 39M | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| Needle 2 | 45M | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| FunctionGemma-270M | 270M | 3,0 | 5,0 | 1,0 | 1,0 | 1,0 | 2,2 | 36,2 |
| Qwen3-0.6B | 600M | 48,0 | 49,0 | 45,0 | 37,0 | 37,0 | 43,2 | 70,8 |
| Qwen3.5-0.8B | 800M | 51,0 | 48,0 | 41,0 | 52,0 | 34,0 | 45,2 | 73,6 |
| Kanana-2-1.3B-Instruct (Kakao) | 1,3B | 76,0 | 72,0 | 70,0 | 71,0 | 63,0 | 70,4 | 93,8 |
| EXAONE-4.0-1.2B (LG) | 1,28B | 73,0 | 65,0 | 53,0 | 66,0 | 58,0 | 63,0 | 85,2 |
| DNA3.0-0.8B (Dnotitia) | 0,8B | 0,0 | 8,0 | 6,0 | 6,0 | 4,0 | 4,8 | 12,2 |
| HyperCLOVA X SEED 0.5B (Naver) | 0,57B | sin interfaz de tool calling en su plantilla de chat | | | | | | |

Nota adicional de la model card: tokens por silaba Hangul sobre las mismas 100 consultas: Songgot 0,90; Gemma 3 0,98; Qwen3 1,15; Needle 2 3,47.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 303M de parametros; el autor no publica cifras oficiales): aproximadamente 610 MB en f16, unos 320 MB en Q8_0 y unos 200 MB en Q4_K_M, mas el espacio de trabajo del runtime.
- GPU recomendadas: no requiere GPU para funcionar. Para entrenamiento o fine-tuning el autor documento 8xH100 (Modal), pero la inferencia es viable en CPU, GPU integrada y GPU de consumo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, etc.); tambien cabe en moviles, navegador con WebGPU/WASM y dispositivos embebidos.
- Opciones de despliegue: llama.cpp y Ollama mediante los GGUF incluidos (f16, Q8_0, Q4_K_M); transformers como biblioteca nativa; text-generation-inference (etiqueta del repositorio); Inference Endpoints (etiqueta `endpoints_compatible`); y navegador, como demuestra la demo oficial on-device.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de latencia ni de tokens por segundo para ninguna configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | all (FunctionChat-Bench SingleCall) | name only | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Songgot-L | 303M | 28,2 | 72,4 | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Songgot-M | 126M | 33,2 | 73,8 | No disponible en la informacion proporcionada | Referenciado en la model card de Songgot-L |
| FunctionGemma-270M | 270M | 2,2 | 36,2 | No disponible en la informacion proporcionada | Comparador evaluado por el autor |
| Qwen3-0.6B | 600M | 43,2 | 70,8 | No disponible en la informacion proporcionada | Comparador evaluado por el autor |
| Kanana-2-1.3B-Instruct | 1,3B | 70,4 | 93,8 | No disponible en la informacion proporcionada | Comparador evaluado por el autor |
| EXAONE-4.0-1.2B | 1,28B | 63,0 | 85,2 | No disponible en la informacion proporcionada | Comparador evaluado por el autor |

Observaciones: dentro de la propia familia Songgot, el modelo mas pequeno (Songgot-M, 126M) supera a Songgot-L en precision agregada (33,2 frente a 28,2), lo que sugiere que un mayor numero de parametros no se traduce necesariamente en mejor tool calling en este rango. Frente a modelos generalistas de mayor tamano, Songgot-L queda por debajo en precision exacta, pero el coste computacional y el espacio de memoria son entre 2 y 4 veces menores. No se dispone de comparativas de latencia ni de licencia de los comparadores en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance funcional muy restringido: la propia model card indica que solo cubre seleccion de herramienta en una unica llamada y extraccion de argumentos. No hay multi-turno, no se procesan resultados de herramientas y no hay chat libre.
- Fragilidad con herramientas poco frecuentes: los modelos pequenos fallan con herramientas raras y con valores parafraseados. La validacion de cada llamada en el codigo de aplicacion es obligatoria.
- Riesgo de alucinacion en nombres de funcion y argumentos: el modelo puede generar llamadas a funciones que no existen en el catalogo o con parametros mal formados. Se debe validar el JSON contra un esquema antes de ejecutarlo.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible. El corpus de preentrenamiento (FineWeb-2 coreano, Wikipedia en coreano, fineweb-edu) puede introducir los sesgos propios de esas fuentes.
- Limitacion idiomatica: el modelo esta optimizado para coreano. Su comportamiento en castellano u otros idiomas distintos del coreano y el ingles no esta documentado ni evaluado.
- Longitud de contexto no especificada: la model card no indica ventana de contexto, lo que impide planificar despliegues con prompts largos de catalogo de herramientas sin medirlo previamente.
- Restricciones de licencia: el codigo y los pesos son Apache 2.0, pero el texto de Wikipedia en coreano empleado en el entrenamiento esta bajo CC BY-SA 3.0; la model card incluye la atribucion y la clausula de share-alike para ese texto. Conviene revisar el alcance de esa obligacion antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, con fecha de publicacion de septiembre de 2026. Es un artefacto muy reciente y sin validacion independiente conocida.
- Madurez de la propia familia: la tabla comparativa del autor muestra que versiones mas pequenas de la misma familia superan a Songgot-L, lo que aconseja evaluar varias variantes antes de fijar una en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palette-lab/songgot-l
- Paper: https://hanishkeloth.github.io/songgot
- Codigo, generadores de datos y scorer: https://github.com/hanishkeloth/songgot
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Hanish/songgot
- Demo on-device en navegador: https://hanishkeloth.github.io/songgot/app/
- Figura de tokens por silaba Hangul: https://hanishkeloth.github.io/songgot/fig1_tokens.png
- Figura de precision por condicion: https://hanishkeloth.github.io/songgot/fig2_bench.png
- Figura de perdida de preentrenamiento: https://hanishkeloth.github.io/songgot/fig3_loss.png
