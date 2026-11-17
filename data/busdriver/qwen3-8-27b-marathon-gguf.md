# Busdriver/Qwen3.8-27B-Marathon-GGUF

## Resumen

Qwen3.8-27B-Marathon-GGUF es una cuantización GGUF del modelo resultante de una fusión de pesos de tres modelos: Swift 1.5 (post-entrenamiento de Qwen3.8-27B realizado por UkisAI, con un modo de razonamiento más corto y eficiente), el delta de eliminación de rechazos de Heretic ARA (trohrbaugh) y el checkpoint base Qwen3.8-27B de Alibaba Cloud. El autor, Busdriver, lo publica como el modelo que ejecuta su proyecto Marathon, un runtime basado en llama.cpp parcheado y orientado a exprimir una única GPU de 24 GB (RTX 3090 / 3090 Ti). La relevancia actual del modelo radica en su combinación de tamaño (27.320.697.856 parámetros), contexto de 262.144 tokens, soporte de visión y decodificación especulativa, todo ello cabiendo en 22,5 GB de VRAM con caché KV q4_0.

La fusión se realizó mediante aritmética de pesos: `merged = Swift 1.5 + 1.0 * (Heretic ARA - Qwen3.8-27B base)`. El delta de Heretic ARA afecta a 60 tensores (22 `out_proj`, 30 `down_proj` y 8 `o_proj`), con un cambio relativo mediano del 3,1 % y máximo del 6,6 %. El resultado se cuantizó a IQ4_XS con llama.cpp usando una importance matrix construida con 200 fragmentos de 512 tokens de wikitext-2 y código fuente de llama.cpp intercalados.

El modelo está explícitamente descrito como "uncensored": sigue peticiones que los modelos originales rechazarían. La licencia es la Swift Open License v1.0 para la contribución de Swift, con Apache 2.0 para la base Qwen y el delta Heretic; el uso comercial por parte de entidades con ingresos brutos anuales de 1.000.000 USD o más requiere una licencia separada de UkisAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); no se detalla en la informacion disponible si es densa o MoE |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ4_XS (modelo de lenguaje); F16 (proyector de vision, mmproj); el drafter asociado se distribuye en Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (contribucion Swift); Apache 2.0 (base Qwen3.8-27B y delta Heretic ARA) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del modelo de lenguaje (IQ4_XS) | 15.309.039.616 bytes |
| Tamano del proyector de vision (F16) | 927.607.008 bytes |
| Tamano total del repo | 16,2 GB |
| Modalidad | image-text-to-text (vision + texto) |
| Decodificacion especulativa | Si, mediante drafter DFlash2 compatible (Busdriver/Qwen3.8-27B-DFlash2-Marathon-GGUF) |
| SHA-256 del GGUF principal | `bd90a6fcf71ed75cf48c923f3596b7b254e55e316f52ebc0a6faf0893a965edb` |
| SHA-256 del proyector de vision | `cb0a71fe9b84af2552fc6260acf8e9773a29d115c683aba01c72a7ac537b212b` |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos, no un entrenamiento desde cero. Se parte de Swift 1.5 (`ukisai/Swift-1.5-Qwen3.8-27b` @ `b4c84d42903a8646b25857eb2827288d92ed85a4`), un post-entrenamiento de Qwen3.8-27B que, según la model card, produce razonamientos más cortos y eficientes. A ese checkpoint se le suma el delta de rechazos de Heretic ARA (`trohrbaugh/Qwen3.8-27B-heretic-ara` @ `a67ae100d933c0d17af3232bda35825979fc63ce`), calculado respecto al commit exacto de la base Qwen3.8-27B (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) sobre el que se construyó Heretic ARA. La fórmula aplicada es `merged = Swift 1.5 + 1.0 * (Heretic ARA - Qwen3.8-27B base)`.

El delta de Heretic ARA toca 60 tensores: 22 `out_proj`, 30 `down_proj` y 8 `o_proj`, con un cambio relativo mediano del 3,1 % y máximo del 6,6 %. Los pesos de visión de Swift 1.5 son idénticos a los de la base, por lo que el proyector multimodal (mmproj) se construye a partir del checkpoint base. La cuantización a IQ4_XS se realizó con llama.cpp empleando una importance matrix de 200 fragmentos de 512 tokens, intercalando wikitext-2 y código fuente de llama.cpp. La model card de Heretic ARA reporta KL 0,0535 y 0/100 rechazos, dato que se cita pero no se ha re-medido tras la fusión.

La innovación técnica destacable no está en el entrenamiento sino en el runtime: el proyecto Marathon incluye parches sobre llama.cpp v1.0.0 (versión indicada en la model card), verificación por árbol de 7 nodos, kernel tuning para SM86, decodificación especulativa DFlash2 con un drafter C3 y caché KV en q4_0. Todo ello orientado a mantener contexto largo y velocidad de decodificación en una sola RTX 3090 limitada a 250 W.

## Capacidades

- Generación de texto conversacional y razonamiento, heredado de Qwen3.8-27B y del post-entrenamiento de Swift 1.5 con thinking más eficiente.
- Generación de código y tareas de agente: la model card reporta 27/27 tareas de código superadas en su evaluación interna.
- Matemáticas y razonamiento multi-paso: no hay benchmarks públicos en la información disponible, pero el modelo está orientado a tareas de agente.
- Visión: pipeline image-text-to-text, con proyector mmproj F16 que se carga junto al modelo de lenguaje.
- Contexto largo: 262.144 tokens, con recall medido de 20/20 hechos a 191K de contexto.
- Decodificación especulativa: compatible con el drafter DFlash2 del mismo autor, lo que acelera la generación.
- Modo "uncensored": sigue peticiones que los modelos originales rechazan (la model card advierte que el comportamiento de rechazo no se re-midió tras la fusión).
- Tool calling / function calling: no se documenta explícitamente en la información disponible; el tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla.
- Idiomas: no disponible.

## Casos de uso

- Asistencia de código en local sobre una RTX 3090: el modelo está ajustado para caber en 24 GB con contexto completo y decodificar a 100-105 tok/s en sesiones de agente de 14K-60K tokens, lo que permite usarlo como copiloto de código sin depender de la nube.
- Agentes autónomos con contexto largo: con 262.144 tokens y recall medido de 20/20 a 191K, es adecuado para sesiones de agente que acumulan historial extenso, trazas de herramientas y documentación sin truncar.
- Análisis de documentos e imágenes: el pipeline image-text-to-text con proyector F16 permite extraer información de capturas, diagramas o documentos escaneados combinados con texto largo.
- Procesamiento por lotes en una sola GPU: al caber en 22,5 GB con caché KV q4_0, se puede desplegar en una máquina de trabajo con una 3090 para tareas de generación por lotes sin clúster.
- Investigación sobre alineación y rechazos: el modelo incorpora el delta de Heretic ARA y se declara uncensored, lo que lo hace útil para estudiar comportamiento de rechazo, aunque el autor advierte que no se re-midió tras la fusión.
- Evaluación de decodificación especulativa: sirve como banco de pruebas del runtime Marathon (DFlash2, verificación por árbol, kernel SM86) en cargas reales de agente.
- Desarrollo de asistentes con contexto de repositorio: la combinación de código, contexto largo y visión permite indexar un repositorio y consultarlo con referencias a capturas o diagramas.

## Benchmarks y rendimiento

Resultados medidos por el autor en RTX 3090 a 250 W, comparando con la fusión anterior (Swift 1.0 + Heretic) en el mismo runtime y ajustes:

| Metrica | Fusion anterior | Este modelo |
|---|---|---|
| 9 tareas de codigo x 3 ejecuciones, thinking xhigh, temperatura 1.0 | 24/27 correctas, 5.104 tokens de media | 27/27 correctas, 4.005 tokens de media |
| Tiempo total de esas ejecuciones | 2.069 s | 1.430 s |
| Recall de 20 hechos a 191K de contexto | 20/20 | 20/20 |
| Decodificacion a 191K de contexto | 78,5 tok/s | 80,4 tok/s |

Otras mediciones reportadas:

| Escenario | Resultado |
|---|---|
| Decodificacion en sesiones de agente retenidas, 14K-60K de contexto, runtime Marathon (llama.cpp v1.0.0 parcheado, KV q4_0, drafter C3, verificacion por arbol de 7 nodos) | 100-105 tok/s en una 3090 |
| Respuesta de 296 tokens a 180K de contexto | 98,8 tok/s |
| Contexto completo de 262.144 tokens | Cabe en 22,5 GB con cache KV q4_0 |

El autor advierte que la muestra es pequeña, a temperatura 1.0, y que el comportamiento de rechazo no se re-midió tras la fusión. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 22,5 GB para el contexto completo de 262.144 tokens con caché KV q4_0 (modelo de lenguaje IQ4_XS de ~15,3 GB más proyector de visión F16 de ~0,93 GB más caché KV).
- GPU objetivo: RTX 3090 o RTX 3090 Ti (24 GB) con límite de 250 W en las mediciones del autor; el runtime Marathon incluye kernel tuning para SM86.
- Cabe en GPU de consumo: sí, en RTX 3090 / 3090 Ti. No se documenta su comportamiento en GPUs de 24 GB de otras arquitecturas ni en GPUs de 16 GB o menos.
- Opciones de despliegue: llama.cpp (versión v1.0.0 con parches de Marathon para decodificación especulativa DFlash2 y verificación por árbol); el autor recomienda `marathon setup-llama qwen38` para obtener el runtime completo. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Comando de referencia: `llama-server` con `--ctx-size 262144`, `--flash-attn on`, `--cache-type-k q4_0`, `--cache-type-v q4_0`, `--spec-type draft-dflash` y el drafter `Qwen3.8-27B-DFlash2-Marathon-C3-Q4_K_M.gguf`.
- Muestreo recomendado: temperatura 1.0, top_p 0.95, top_k 20.
- Throughput estimado: 100-105 tok/s en sesiones de agente de 14K-60K de contexto; 80,4 tok/s a 191K; 98,8 tok/s en una respuesta de 296 tokens a 180K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Marathon-GGUF (este) | 27,32 B | 262.144 | Si (mmproj F16) | Swift Open License v1.0 + Apache 2.0 | Fusion uncensored, cuantizado IQ4_XS, orientado a una RTX 3090 |
| Swift 1.5 (ukisai/Swift-1.5-Qwen3.8-27b) | 27,32 B (base) | no disponible | no disponible | Swift Open License v1.0 | Post-entrenamiento de Qwen3.8-27B con thinking mas corto; base de esta fusion |
| Heretic ARA (trohrbaugh/Qwen3.8-27B-heretic-ara) | 27,32 B (base) | no disponible | no disponible | Apache 2.0 | Variante sin rechazos; KL 0,0535 y 0/100 rechazos segun su card |
| Qwen3.8-27B (Qwen/Qwen3.8-27B) | 27,32 B | no disponible | no disponible | Apache 2.0 | Checkpoint base de Alibaba Cloud |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la única comparación cuantitativa es la de la fusión anterior de Marathon (Swift 1.0 + Heretic), recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Modelo uncensored: sigue peticiones que los modelos originales rechazan; el autor declara explícitamente que el usuario es responsable del uso.
- El comportamiento de rechazo no se re-midió tras la fusión, por lo que la tasa real de rechazos es desconocida.
- La evaluación de código se basa en 9 tareas x 3 ejecuciones a temperatura 1.0; es una muestra pequeña y no sustituye a benchmarks estándar.
- No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks de referencia en la información disponible.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.8-27B y de un post-entrenamiento, hereda los sesgos de esos modelos, que no se detallan.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponible.
- Licencia: la Swift Open License v1.0 exige licencia comercial separada de UkisAI para entidades con ingresos brutos anuales de 1.000.000 USD o más; la base Qwen y el delta Heretic son Apache 2.0. Es necesario revisar `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` antes de un despliegue comercial.
- El rendimiento medido depende del runtime Marathon parcheado (llama.cpp v1.0.0, verificación por árbol, kernel SM86); en llama.cpp estándar o en otras GPUs los números pueden diferir.
- El modelo no está afiliado ni respaldado por UkisAI, Alibaba Cloud ni el autor de Heretic ARA.
- El contexto completo de 262.144 tokens requiere caché KV q4_0 y 22,5 GB de VRAM; con caché de mayor precisión no cabe en 24 GB.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Busdriver/Qwen3.8-27B-Marathon-GGUF
- Drafter compatible (DFlash2): https://huggingface.co/Busdriver/Qwen3.8-27B-DFlash2-Marathon-GGUF
- Proyecto Marathon (runtime): https://github.com/thebusdriver37/Marathon
- Modelo base Swift 1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Modelo Heretic ARA: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
