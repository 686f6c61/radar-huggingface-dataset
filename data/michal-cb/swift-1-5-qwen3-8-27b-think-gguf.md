# michal-cb/Swift-1.5-Qwen3.8-27B-think-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B es un derivado de razonamiento eficiente de Qwen3.8-27B desarrollado por UkisAI. El modelo se presenta como una mejora sobre su predecesor Swift 1.0, con un post-entrenamiento ampliado (RL y OPD) orientado a tareas de codigo, agentes y horizonte largo. La model card declara una reduccion del 58,5% en tokens de "thinking" manteniendo una puntuacion un 0,35% superior a la base, lo que se traduce en una aceleracion de hasta 9,18x en algunas tareas.

La ficha corresponde a la cuantizacion GGUF publicada por el usuario michal-cb, derivada directamente del modelo original de UkisAI mediante llama.cpp. El repositorio incluye un pipeline declarado como image-text-to-text, lo que sugiere capacidades multimodales heredadas de la base, aunque la informacion disponible no detalla la arquitectura exacta ni la composicion del entrenamiento multimodal.

El modelo tiene 27.320.697.856 parametros totales y se distribuye bajo la licencia propietaria swift-open-license-1.0, con opciones de licencia empresarial. Su interes actual reside en la promesa de reducir el coste computacional del razonamiento largo sin sacrificar precision, un aspecto critico para despliegues en produccion con presupuestos de latencia ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.8-27B; transformer presumiblemente, sin confirmar) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; se mencionan tier de cuantizacion e imatrix; tambien existe variante GSQ-RCO GGUF e INT4 en el repo original) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su origen: es un derivado post-entrenado de Qwen3.8-27B, que a su vez se distribuye como un transformer de 27.320 millones de parametros. El pipeline declarado es image-text-to-text, lo que implica que la base incorpora un componente de vision, aunque no se especifica el mecanismo de fusion multimodal ni el codificador visual empleado.

El entrenamiento de Swift 1.5 se realizo sobre Swift 1.0 mediante un escalado de los metodos de post-entrenamiento previos (RL y OPD, on-policy distillation presumiblemente). La tecnica central consiste en identificar tokens asociados a "sobrepensamiento patologico" y penalizarlos sin atacar directamente la longitud del razonamiento, recuperando despues la precision con RL y OPD. El dataset de entrenamiento esta publicado (ukisai/Qwen3.8-27B-multi-turn-agent-sft) pero, segun el autor, no se usa tal cual: se remuestrea y se convierte en entornos de RL. El foco de esta version son tareas agenticas de horizonte largo y codigo, como reflejan las mejoras en LiveCodeBench y Terminal Bench 2.1.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" eficiente en tokens (58,5% menos tokens de pensamiento que la base, segun el autor).
- Generacion de codigo, incluyendo proyectos completos (demo de un juego 3D generado en 11,39 minutos frente a 104,6 minutos de la base).
- Capacidades agenticas y de horizonte largo, con mejoras declaradas en Terminal Bench 2.1.
- Procesamiento image-text-to-text (multimodal entrada imagen + texto), segun el pipeline declarado.
- Razonamiento multi-paso y resolucion de tareas complejas con cadenas de pensamiento comprimidas.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede crear aplicaciones y scripts completos con un coste en tokens muy inferior al de la base, lo que reduce el tiempo de respuesta en pipelines de CI/CD y asistentes de programacion.
- Agentes de terminal y automatizacion de sistemas: las mejoras declaradas en Terminal Bench 2.1 lo hacen adecuado para tareas de shell, gestion de ficheros y operaciones multi-paso en entornos controlados.
- Razonamiento con presupuesto de latencia ajustado: al emitir menos tokens de pensamiento, encaja en aplicaciones interactivas donde la base resultaria demasiado lenta (chat en tiempo real, autocompletado, tutores).
- Analisis de imagenes con texto: gracias al pipeline image-text-to-text, puede emplearse para describir capturas, interpretar diagramas o responder preguntas sobre imagenes acompanadas de instrucciones.
- Desarrollo de videojuegos y prototipado rapido: la demo oficial muestra la generacion de un juego 3D funcional en minutos, util para prototipado de mecanicas o generacion de contenido.
- Evaluacion de modelos y benchmarking interno: su condicion de derivado eficiente de Qwen3.8-27B permite comparar calidad frente a coste en entornos de investigacion sobre razonamiento comprimido.
- Despliegue local con llama.cpp: las cuantizaciones GGUF permiten ejecutar el modelo en hardware de consumo o servidores sin GPU de datacenter, util para prototipos y entornos con requisitos de privacidad.

## Benchmarks y rendimiento

La model card menciona resultados comparativos entre Qwen3.8-27B y Swift 1.5 (mismo protocolo de evaluacion, porcentajes agregados), con mejoras en LiveCodeBench y Terminal Bench 2.1, pero la tabla completa no esta incluida en la informacion proporcionada. Los unicos datos numericos concretos disponibles son:

| Metrica | Base Qwen3.8-27B | Swift 1.5 | Cambio |
|---|---|---|---|
| Tokens de thinking | referencia | -58,5% | reduccion |
| Puntuacion agregada | referencia | +0,35% | mejora |
| Aceleracion en varias tareas | referencia | hasta 9,18x | mejora |
| Demo juego 3D (tiempo de generacion) | 104,6 min | 11,39 min | ~9,2x mas rapido |

No se han publicado en la informacion disponible los valores absolutos de MMLU, HumanEval, GSM8K, LiveCodeBench ni Terminal Bench 2.1.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para 27.320 millones de parametros en GGUF: ~16-18 GB en Q4_K_M, ~20-22 GB en Q5_K_M, ~27-30 GB en Q8_0, ~54 GB en FP16.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) puede alojar cuantizaciones Q4/Q5; para Q8 se requiere A100 40 GB, L40S o H100.
- Cabe en GPU de consumo: si, en cuantizaciones Q4 y Q5 en tarjetas de 24 GB (RTX 3090, 4090); en Q4 podria caber en 16 GB con offload parcial.
- Opciones de despliegue: llama.cpp (llama-server), runtimes compatibles con GGUF; el repo se marca como endpoints_compatible. No se confirma soporte de vLLM ni TGI para esta cuantizacion.
- Latencia y throughput: no disponibles. La model card afirma una aceleracion de hasta 9,18x frente a la base en varias tareas, atribuible a la reduccion de tokens de pensamiento, no a optimizaciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B (esta ficha) | 27,3B | no disponible | swift-open-license-1.0 | Razonamiento eficiente, -58,5% tokens thinking |
| Qwen3.8-27B (base) | 27,3B | no disponible | no disponible en la informacion | Modelo fundacional; referencia de calidad |
| Swift 1.0 Qwen3.8-27b | 27,3B (presumible) | no disponible | no disponible en la informacion | Predecesor con 350k+ descargas; superado por 1.5 |

No se dispone de datos de benchmarks absolutos ni de otros modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia propietaria swift-open-license-1.0: el uso comercial puede requerir licencia empresarial; consultar el enlace de licencia antes de desplegar en produccion.
- Riesgo de alucinacion no cuantificado: no se han publicado tasas de hallucination ni evaluaciones de fidelidad.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera del ingles sin verificacion previa.
- Longitud de contexto no especificada: planificar despliegues con contexto largo requiere validacion empirica.
- Modelo derivado de un derivado: la cadena Qwen3.8-27B -> Swift 1.0 -> Swift 1.5 acumula posibles sesgos y degradaciones no documentadas.
- Cuantizacion GGUF de terceros (michal-cb): aunque derivada directamente del modelo oficial, no es una publicacion de UkisAI; verificar integridad y calidad de la cuantizacion.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria.
- El pipeline image-text-to-text sugiere vision, pero no se documentan limitaciones del componente multimodal (resolucion, tipos de imagen, etc.).
- No se confirma soporte de tool calling nativo, lo que puede limitar su uso en frameworks agenticos que dependan de function calling estructurado.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/michal-cb/Swift-1.5-Qwen3.8-27B-think-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Cuantizacion INT4 oficial: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-INT4
- GGUF oficial: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- GSQ-RCO GGUF oficial: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web de UkisAI: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo interactiva del juego: https://ukisai.com/swift-games/27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
