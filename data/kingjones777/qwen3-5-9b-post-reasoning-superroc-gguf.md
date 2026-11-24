# kingjones777/Qwen3.5-9B-Post-Reasoning-SuperRoc-GGUF

## Resumen

Qwen3.5-9B-Post-Reasoning-SuperRoc-GGUF es una cuantización GGUF en formato ROCm-FP4 del modelo richmondsin/Qwen3.5-9B-Post-Reasoning, publicada por el usuario kingjones777. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue optimizado para Super Roc, un motor de inferencia local orientado específicamente al hardware Strix Halo (AMD Ryzen AI Max+ 395, arquitectura gfx1151). El pipeline declarado es image-text-to-text, lo que indica que el modelo base es multimodal, e incluye un proyector de visión separado en BF16.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de cuantización ROCm-FP4 sobre GGUF para aceleradores integrados de AMD, un nicho con escasa literatura técnica comparada con el ecosistema CUDA. Por otro, permite evaluar el rendimiento real declarado por el autor: perplexity de 8,30 frente a 8,20 del Q4_K_M estándar del mismo modelo, con velocidades de generación de 40,61 tok/s con prompt de 1K y 114,29 tok/s con prompt de 8K en el hardware de referencia.

El autor reporta además una ventana de contexto cargada de 131.072 tokens, soporte de visión funcional y una tasa de acierto de 7/8 en tool calling tanto en modo requerido como automático. Todos estos datos proceden de la model card y de las mediciones del propio autor, no de evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; arquitectura interna no especificada en la informacion proporcionada) |
| Parametros totales | 456.010.480 (dato de safetensors del repo; en conflicto con la denominacion "9B" del nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (contexto cargado y verificado por el autor en Super Roc) |
| Tipos de cuantizacion | Q4_0 en formato ROCm-FP4 (fichero principal); proyector multimodal en BF16 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; las mediciones de perplexity se hicieron sobre un documento tecnico en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero principal de 5.362.721.504 bytes y mmproj de 921.704.384 bytes) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base richmondsin/Qwen3.5-9B-Post-Reasoning: la model card de esta cuantizacion no detalla si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni describe la composicion del dataset de entrenamiento, el numero de tokens vistos o si hubo fases de RLHF o DPO. El sufijo "Post-Reasoning" en el nombre sugiere un ajuste posterior orientado a razonamiento, pero no se aporta evidencia documental en la informacion disponible.

Lo que si esta documentado es el proceso de cuantizacion. El autor genera un GGUF Q4_0 empleando el formato ROCm-FP4 desarrollado por el equipo ROCmFPX (Carlo Pasquale y colaboradores), construido sobre llama.cpp/ggml. La cuantizacion se realizo con imatrix (importancia matricial), lo que explica que la perplexity resultante (8,30) sea muy proxima a la del Q4_K_M estandar del mismo modelo (8,20) sobre un documento tecnico en ingles de 11K tokens con contexto 4096. El paquete incluye un proyector multimodal BF16 independiente (mmproj) que habilita la entrada de imagenes. El motor Super Roc, sobre el que se distribuye, incorpora soporte de prompt lookup y un modo de pensamiento (thinking) desactivable por peticion mediante chat_template_kwargs.enable_thinking.

## Capacidades

- Generacion de texto y razonamiento: el modelo base incorpora un modo "thinking" que puede activarse o desactivarse por peticion, segun la documentacion del autor.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text y el autor reporta "Vision: pass" en sus pruebas, con el proyector mmproj en BF16.
- Tool calling / function calling: medido por el autor en 7/8 aciertos tanto en modo requerido como en modo automatico.
- Generacion de codigo: el autor reporta 41,2 tok/s de media en dos prompts de codigo.
- Contexto largo: carga verificada de 131.072 tokens, con cache de prompt eficiente (6.961 de 6.986 tokens cacheados en el segundo turno).
- Multilingue: no disponible; no se declara cobertura de idiomas ni se aportan evaluaciones fuera del ingles.
- Agentes multi-paso: no se documenta explicitamente, aunque el soporte de tool calling y el contexto largo son prerequisitos habituales.

## Casos de uso

- Despliegue local en equipos Strix Halo: el caso de uso principal y documentado. Un desarrollador con un Ryzen AI Max+ 395 y 128 GB de RAM puede servir el modelo con Super Roc usando el comando incluido en la model card, con contexto de 131.072 tokens y vision activada.
- Asistencia tecnica sobre documentacion extensa: con 131K de contexto y una perplexity de 8,30 en documentos tecnicos, el modelo es adecuado para resumir, consultar y razonar sobre manuales o bases de codigo de gran tamano en una sola pasada.
- Analisis de capturas y diagramas: al incluir proyector multimodal, permite extraer informacion de imagenes tecnicas (diagramas de arquitectura, capturas de error, tablas escaneadas) combinadas con texto.
- Automatizacion con herramientas: la tasa de 7/8 en tool calling lo hace util para asistentes que invocan APIs externas, aunque el 12,5% de fallo exige validacion en produccion.
- Generacion de codigo en local: con 41,2 tok/s en prompts de codigo, es viable para autocompletado y generacion de funciones en entornos sin GPU NVIDIA.
- Prototipado de agentes con razonamiento conmutable: el modo thinking desactivable permite alternar entre respuestas rapidas y razonamiento extendido segun la tarea, sin cambiar de modelo.
- Integracion via Lemonade: el autor documenta el flujo lemonade pull y lemonade chat, lo que facilita probar el modelo en un entorno de escritorio sin configurar el motor manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta mediciones de perplexity y de rendimiento de inferencia en su hardware de referencia.

| Metrica | Valor |
|---|---|
| Perplexity (documento tecnico en ingles, 11K tokens, contexto 4096) | 8,30 |
| Perplexity del Q4_K_M estandar del mismo modelo | 8,20 |
| Tiempo de carga | 7 s |
| Prompt tok/s (p1k) | 1878,1 |
| Prompt tok/s (p8k) | 1957,7 |
| Generacion tok/s (p1k) | 40,61 |
| Generacion tok/s (p8k) | 114,29 |
| Generacion de codigo tok/s (media de 2 prompts) | 41,2 |
| Tool calls (requerido / automatico) | 7/8 / 7/8 |
| Cache de prompt turno 2 (tokens cacheados / prompt) | 6961 / 6986 |
| Contexto cargado | 131.072 tokens |
| Vision | pass |
| Drafter | off |

Hardware de medida: Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.2, una peticion simultanea, fecha 2026-11-24.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero principal ocupa 5,36 GB y el proyector multimodal 0,92 GB, lo que suma aproximadamente 6,3 GB de pesos. Con contexto de 131.072 tokens, la cache KV anade una cantidad no especificada en la informacion disponible; el autor ejecuta con 128 GB de memoria unificada.
- GPU recomendadas: el caso documentado es el AMD Ryzen AI Max+ 395 (gfx1151, Strix Halo). No se documenta compatibilidad con A100, H100 ni RTX 4090; el formato ROCm-FP4 y el motor Super Roc estan orientados a este acelerador integrado.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo NVIDIA o AMD discretas. El formato esta disenado para ROCm en Strix Halo.
- Opciones de despliegue: Super Roc (motor principal, con comando de servicio incluido), Lemonade (con configuracion de binario ROCm y pull del modelo). No se menciona vLLM, TGI ni Ollama.
- Latencia y throughput: segun las mediciones del autor, 40,61 tok/s de generacion con prompt de 1K y 114,29 tok/s con prompt de 8K, con prefill de aproximadamente 1.900 tok/s. La mejora de generacion con prompt largo sugiere un efecto de cache o de gestion de contexto del motor, no documentado en detalle.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Post-Reasoning-SuperRoc-GGUF (este) | 456 M declarados en safetensors (nombre comercial 9B) | 131.072 | GGUF ROCm-FP4 | Apache 2.0 | Optimizado para Strix Halo y Super Roc; perplexity 8,30 |
| Q4_K_M estandar del mismo modelo base | mismo modelo base | no disponible | GGUF Q4_K_M | Apache 2.0 (heredada) | Perplexity 8,20; referencia de comparacion del autor |
| richmondsin/Qwen3.5-9B-Post-Reasoning | no disponible | no disponible | safetensors (presumible) | no disponible | Modelo base sin cuantizar; sin datos de rendimiento en la informacion disponible |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en la misma categoria.

## Limitaciones y advertencias

- Conflicto de datos en el tamano: el nombre del modelo indica 9B, pero los safetensors del repo declaran 456.010.480 parametros. Esta discrepancia no se resuelve en la informacion disponible y debe verificarse antes de dimensionar el despliegue.
- Perplexity ligeramente superior al Q4_K_M estandar (8,30 frente a 8,20): la cuantizacion ROCm-FP4 introduce una degradacion pequena pero medible en la referencia del autor.
- Tool calling imperfecto: 7/8 aciertos implica un 12,5% de fallo; en produccion requiere validacion y reintentos.
- Cobertura idiomatica no declarada: no hay evaluacion fuera del ingles; el rendimiento en castellano es desconocido.
- Hardware muy especifico: el artefacto esta pensado para Strix Halo y el motor Super Roc; no se garantiza su funcionamiento en otras GPUs o motores.
- Sin benchmarks estandar publicados: no hay MMLU, HumanEval ni GSM8K, lo que impide comparaciones rigurosas con otros modelos.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base richmondsin/Qwen3.5-9B-Post-Reasoning, que no se detalla en la informacion proporcionada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kingjones777/Qwen3.5-9B-Post-Reasoning-SuperRoc-GGUF
- Modelo base: https://huggingface.co/richmondsin/Qwen3.5-9B-Post-Reasoning
- Repositorio Super Roc: https://github.com/kingjones30/superroc
- Documentacion de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4): https://github.com/charlie12345/ROCmFPX
