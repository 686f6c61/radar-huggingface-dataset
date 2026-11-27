# migtissera/Tess-4.5-26B-A3B-GGUF

## Resumen

Tess-4.5-26B-A3B es un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) con 26.070.390.272 parámetros totales y 3,4B parámetros activos por token, desarrollado por Migel Tissera en Continuity Research. Se construye sobre el modelo base Inkling 2 Mini de Thinking Machines Lab mediante un ajuste fino orientado a tareas agénticas de programación: el modelo lee el directorio de trabajo, razona antes de actuar y mantiene ese razonamiento a lo largo de los turnos de un bucle de agente. La versión documentada aquí es la cuantización GGUF nativa en NVFP4 para `llama.cpp`.

La relevancia de esta ficha radica en que empaqueta un modelo de 26B en 17,6 GB, lo que permite ejecutarlo en Apple Silicon con 32 GB o más de memoria unificada o en una GPU de consumo como la RTX 4090 de 24 GB, manteniendo visión y decodificación especulativa mediante el borrador DSpark. La ventana de contexto declarada alcanza 1.048.576 tokens.

La arquitectura es un MoE con bucles (looped Mixture-of-Experts) que repite capas para aumentar la profundidad efectiva sin incrementar proporcionalmente el coste por token. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con bucles (looped MoE), transformer |
| Parametros totales | 26.070.390.272 (26,4B según model card) |
| Parametros activos | 3,4B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (expertos en capas 0-19) + Q8_0 (tensores no expertos) + F32 (controladores de bucle); GGUF nativo NVFP4 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint fusionado disponible en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo es un MoE con bucles construido sobre Inkling 2 Mini de Thinking Machines Lab. La innovación estructural es el bucle de capas: los controladores de bucle se almacenan en F32 y las capas de expertos se repiten, lo que permite aumentar la profundidad de razonamiento con un coste computacional por token contenido (3,4B parámetros activos de 26,4B totales). La cuantización GGUF conserva los valores NVFP4 propios del checkpoint base en los expertos de las capas 0-19 y almacena los tensores no expertos en Q8_0.

El ajuste fino aplica la receta completa de Tess-4.5 (agéntica y de programación) sobre la base. El modelo fue entrenado para preservar el razonamiento entre turnos en bucles de agente, de ahí la opción `--reasoning-preserve` en `llama.cpp`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. Incluye un borrador de decodificación especulativa DSpark (749 MB, BF16) y un proyector de visión (642 MB, BF16).

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento controlable mediante `reasoning_effort` (`"xhigh"` o `"high"`).
- Programación agéntica: lectura del directorio de trabajo, planificación y ejecución de tareas de modificación de código.
- Tool calling / function calling: acepta definiciones de herramientas reales en el campo `tools` de la API compatible con OpenAI y las usa; sin herramientas declaradas responde en texto.
- Soporte de agentes y bucles multi-turno con preservación del razonamiento entre turnos.
- Capacidades de visión (pipeline image-text-to-text) mediante el proyector `mmproj` opcional.
- Contexto largo de hasta 1M tokens para tareas de comprensión de repositorios y documentos extensos.
- Decodificación especulativa con el borrador DSpark para reducir latencia.
- Multilingüe: limitado al inglés según la model card.

## Casos de uso

- Asistente de programación en terminal: el modelo se configura con el directorio de trabajo en el system prompt y las definiciones de herramientas, y ejecuta tareas de lectura, edición y ejecución de comandos dentro de un bucle de agente, aprovechando su entrenamiento específico para este flujo.
- Refactorización de repositorios grandes: con 1M tokens de contexto puede cargar múltiples ficheros y trazas de error en una sola ventana, razonar sobre dependencias y proponer cambios coherentes en todo el proyecto.
- Automatización de CI/CD con tool calling: integrado vía API compatible con OpenAI, puede invocar herramientas de build, test y despliegue y reportar fallos de forma explícita, lo que encaja en pipelines que requieren acciones verificables.
- Revisión de código asistida por visión: el proyector `mmproj` permite adjuntar capturas de interfaces o diagramas junto al código para tareas de depuración visual o generación de UI.
- Agentes autónomos en sandbox: desplegado en contenedor con permisos restringidos, sirve para tareas de exploración de código y generación de parches, con la cautela de que el modelo está diseñado para preguntar antes de acciones destructivas pero no las garantiza.
- Despliegue local en estación de trabajo: en una RTX 4090 de 24 GB o Apple Silicon de 32 GB, permite un asistente de código privado sin enviar código a servicios externos, con contexto de 256K en ~23,3 GB de VRAM.
- Procesamiento de documentación técnica extensa: la ventana de 1M tokens y la puntuación en LongBench v2 lo hacen adecuado para resumir y consultar manuales o especificaciones de gran volumen.

## Benchmarks y rendimiento

| Benchmark | Tess-4.5-26B-A3B | Base (Inkling 2 Mini) |
|---|---|---|
| SWE-Bench Pro v2 Hard | 82,4% (42/51) | 77,9% |
| LongBench v2 (contexto 1M) | 67,2% (338/503) | 66,9% |

Mediciones realizadas sobre el checkpoint fusionado Tess-4.5-26B-A3B con `reasoning_effort: "xhigh"`; las cifras base provienen de la model card de Inkling 2 Mini. El GGUF contiene los mismos pesos. No se han publicado en la información disponible otros resultados (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada: 17,6 GB para el GGUF NVFP4 completo; ~23,3 GB de VRAM para servir 256K de contexto en una RTX 4090 con `-ctk q8_0 -ctv q8_0 -ngl 99 --fit off`.
- GPU recomendadas: RTX 4090 (24 GB) para contexto de 256K; GPU de mayor memoria para contextos cercanos a 1M.
- Apple Silicon: requiere 32 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB.
- Opciones de despliegue: `llama.cpp` (`llama-server`) con NVFP4 nativo, visión `mmproj` y decodificación especulativa DSpark; para vLLM o SGLang en una sola GPU se recomienda el checkpoint fusionado Tess-4.5-26B-A3B.
- Latencia y throughput: no disponible (no se publican cifras concretas en la información disponible).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tess-4.5-26B-A3B | 26,4B | 3,4B | 1M | Apache 2.0 | GGUF NVFP4 y safetensors |
| Inkling 2 Mini (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (Thinking Machines) |
| Tess-4.5-594B-A17B | 594B | 17B | no disponible | no disponible | Hugging Face |
| Tess-4.5-27B | 27B | no disponible (denso) | no disponible | no disponible | Hugging Face |

La comparativa se limita a la familia Tess y al modelo base porque la información proporcionada no incluye especificaciones de modelos de otros proveedores. Los datos de Inkling 2 Mini, Tess-4.5-594B-A17B y Tess-4.5-27B no están detallados en la información disponible más allá de su existencia y enlaces.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad.
- Aunque está diseñado para preguntar antes de acciones destructivas y reportar fallos, la model card advierte explícitamente de que ningún modelo es una garantía; debe ejecutarse con permisos, en sandbox o en contenedor.
- Las cifras de benchmarks se midieron con `reasoning_effort: "xhigh"` sobre el checkpoint fusionado; el rendimiento puede variar con cuantizaciones o configuraciones distintas.
- El contexto de 1M tokens no es práctico en hardware de consumo: en RTX 4090 se recomienda limitar a 256K.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- No se detallan sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta auditar riesgos específicos.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/migtissera/Tess-4.5-26B-A3B-GGUF
- Checkpoint fusionado: https://huggingface.co/migtissera/Tess-4.5-26B-A3B
- Modelo mayor de la familia: https://huggingface.co/migtissera/Tess-4.5-594B-A17B
- Modelo denso de la familia: https://huggingface.co/migtissera/Tess-4.5-27B
- Modelo base Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Página del proyecto en Continuity Research: https://continuityresearch.ai/tess-4-5/
- Thinking Machines Lab: https://thinkingmachines.ai
- Perfil del autor en X: https://x.com/migtissera
- Vídeo de lanzamiento: https://huggingface.co/migtissera/Tess-4.5-26B-A3B-GGUF/resolve/main/assets/tess-4.5-26b-a3b-launch-web.mp4
