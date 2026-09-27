# cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-INT4

## Resumen

cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-INT4 es una cuantizacion a 4 bits en formato AWQ del modelo ukisai/Swift-1.5-Qwen3.8-27b, un derivado de razonamiento eficiente de Qwen3.8-27B desarrollado por UkisAI. El modelo original esta entrenado para reducir el "sobrepensamiento" patologico: segun la model card, emplea un 58,5% menos de tokens de pensamiento que Qwen3.8-27B manteniendo (y superando ligeramente, +0,35%) la puntuacion del modelo base, lo que se traduce en una aceleracion de hasta 1,95x en varias tareas. Esta version concreta, publicada por el usuario cyankiwi, aplica cuantizacion AWQ INT4 sobre los pesos originales para reducir el peso del repositorio a 21,02 GB y hacer viable su despliegue en GPU de gama alta para consumidores.

El modelo cuenta con 27.781.427.952 parametros (27,78B) segun los safetensors, y se distribuye con la libreria transformers y pesos en formato compress-tensors (safetensors), compatible con endpoints de inferencia. La model card declara capacidades multimodales (pipeline image-text-to-text), razonamiento con modo "thinking", eficiencia de tokens y un enfoque de post-entrenamiento orientado a tareas agente y de codigo, con mejoras reportadas en LiveCodeBench y Terminal Bench 2.1.

Su relevancia actual radica en que ofrece un modelo de 27B con razonamiento comprimido en un paquete de ~21 GB que cabe en GPUs de 24 GB en configuraciones ajustadas, manteniendo un perfil multilingue de 10 idiomas. La contrapartida es una licencia personalizada (swift-open-license-1.0) con acceso restringido (gated) y la ausencia de numeros de benchmark completos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.8 (no se detalla en la informacion disponible si es denso, MoE o hibrido) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 (formato compressed-tensors). Existen versiones GGUF y GSQ-RCO GGUF del modelo base publicadas por UkisAI |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES (10 idiomas declarados en la model card) |
| Licencia | swift-open-license-1.0 (license: other), acceso restringido (gated: true) |
| Formato de pesos | safetensors (compressed-tensors), libreria transformers |
| Tamano del repositorio | 21,0 GB (21,02 GB declarados) |
| Pipeline | image-text-to-text |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |
| Version de la receta de cuantizacion | 26.05.01 |
| Dataset de calibracion | cyankiwi/calibration (STEM and Agentic) |
| Fecha de publicacion | 27 de septiembre de 2026 (segun metadatos) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: se sabe que pertenece a la familia Qwen3.8 y que el pipeline declarado es image-text-to-text, lo que implica soporte de entrada de imagenes ademas de texto, pero no se especifica la arquitectura del codificador visual ni detalles de atencion (lineal, completa, hibrida) en los datos proporcionados. El repositorio analizado es una cuantizacion AWQ INT4 realizada por cyankiwi, calibrada con un dataset propio de dominios STEM y agentico (cyankiwi/calibration), con un peso final de 21,02 GB frente a los aproximadamente 55 GB que ocuparian los pesos en precision completa de 27,78B parametros.

Respecto al entrenamiento del modelo original, UkisAI describe un proceso de dos fases: primero identifican y penalizan los tokens asociados a sobrepensamiento patologico sin atacar directamente la longitud del razonamiento, lo que genera un uso "comprimido" de tokens; despues recuperan precision mediante RL (aprendizaje por refuerzo) y OPD, escalando estos metodos respecto a Swift 1.0 con foco en tareas de horizonte largo, agenticas y de codigo. El dataset de partida es ukisai/Qwen3.8-27B-multi-turn-agent-sft, que segun la model card no se usa tal cual, sino re-muestreado y transformado en entornos de RL. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito ("thinking"), optimizado para consumir muchos menos tokens de razonamiento que el modelo base.
- Codigo y tareas agenticas de horizonte largo: la model card reporta mejoras especificas en LiveCodeBench y Terminal Bench 2.1.
- Entrada multimodal de imagen y texto segun el pipeline declarado (image-text-to-text); no se detalla el alcance real de la comprension visual en la informacion disponible.
- Capacidades multilingues en 10 idiomas: ingles, chino, hindi, arabe, ruso, japones, coreano, neerlandes, frances y espanol.
- Uso conversacional multi-turno (tag conversational).
- Compatibilidad con endpoints de inferencia de HuggingFace (tag endpoints_compatible) y con la libreria transformers.
- No se confirma en la informacion disponible soporte explicito de tool calling, function calling ni decodificacion especulativa.

## Casos de uso

- Agentes de terminal y automatizacion de shell: el modelo esta post-entrenado con foco en tareas agenticas y muestra mejoras reportadas en Terminal Bench 2.1, por lo que encaja en agentes que ejecutan comandos, inspeccionan repositorios y encadenan pasos de forma autonoma.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD para generar parches o tests; su naturaleza "token-efficient" reduce el coste por ejecucion en comparacion con modelos de razonamiento que emiten cadenas de pensamiento mas largas.
- Asistencia al cliente multilingue: con 10 idiomas declarados y modo conversacional, es adecuado para entornos de atencion que requieran alternar idiomas dentro de la misma sesion.
- Analisis de documentos con componentes visuales: al declarar pipeline image-text-to-text, puede emplearse en extraccion de informacion de capturas, diagramas o formularios, siempre que se valide previamente el rendimiento real en vision.
- Despliegue on-premise en hardware limitado: con pesos INT4 de ~21 GB, permite servir un modelo de 27B en un solo servidor con GPU de 24-48 GB, util en organizaciones con restricciones de soberania de datos.
- Prototipado rapido de videojuegos y herramientas interactivas: el demo de la model card muestra la generacion de un juego 3D en 11,39 minutos frente a los 104,6 minutos del modelo base, lo que ejemplifica su uso en generacion de codigo de aplicaciones completas bajo presupuesto de tiempo.
- Razonamiento con presupuesto de tokens ajustado: escenarios donde el coste por token de salida es critico (por ejemplo, inferencia a gran escala) se benefician de la reduccion del 58,5% en tokens de pensamiento declarada.
- Evaluacion comparativa de recetas de cuantizacion: este repositorio sirve como referencia para medir la degradacion de AWQ INT4 frente a los pesos originales en tareas de codigo y agenticas.

## Benchmarks y rendimiento

La informacion extraida incluye una seccion de evaluacion en la model card, pero su tabla de resultados numericos no esta disponible en el contenido proporcionado. Solo se dispone de las siguientes afirmaciones relativas del autor respecto al modelo base Qwen3.8-27B:

| Metrica | Base Qwen3.8-27B | Swift 1.5 27B | Diferencia reportada |
|---|---|---|---|
| Tokens de pensamiento | referencia | -58,5% | reduccion del 58,5% |
| Puntuacion agregada (protocolos propios del autor) | referencia | +0,35% | +0,35 puntos porcentuales |
| Velocidad en varias tareas | referencia | x1,95 | aceleracion de 1,95x |
| Demo de generacion de juego 3D (mismo prompt) | 104,6 minutos | 11,39 minutos | ~9,2x mas rapido |

No se han publicado en la informacion disponible los valores concretos de MMLU, HumanEval, GSM8K, LiveCodeBench ni Terminal Bench 2.1, aunque la model card menciona mejoras cualitativas en los dos ultimos. No se dispone de datos de benchmarks especificos de esta cuantizacion AWQ INT4 frente al modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en INT4 ocupan aproximadamente 14 GB en teoria (27,78B x 0,5 bytes); el repositorio real es de 21,02 GB, por lo que se debe presupuestar entre 18 y 24 GB contando pesos, cache KV y overhead del runtime.
- GPU recomendadas: NVIDIA RTX 4090 / RTX 3090 (24 GB) para uso individual con contextos moderados; RTX 5090 (32 GB) con mas margen; L40S (48 GB), A100 (40/80 GB) y H100 (80 GB) para servicio concurrente o contextos largos.
- Cabe en GPU de consumo: si, en GPUs de 24 GB o mas, siempre que se limite la longitud de contexto y el numero de secuencias concurrentes; en GPUs de 16 GB no cabe con comodidad.
- Opciones de despliegue: vLLM y TGI son las rutas habituales para pesos AWQ/compressed-tensors en CUDA; tambien es posible cargar con transformers. Para llama.cpp u Ollama se debe usar la version GGUF publicada por UkisAI (ukisai/Swift-1.5-Qwen3.8-27B-GGUF), no este repositorio AWQ.
- Restriccion de plataforma: AWQ INT4 esta orientado a GPU NVIDIA con CUDA; no es un formato utilizable directamente en CPU ni en aceleradores sin soporte de kernels AWQ.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card solo reporta la aceleracion relativa de 1,95x frente al modelo base, no valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-INT4 | 27,78B | AWQ INT4 (compressed-tensors) | no disponible | swift-open-license-1.0 (gated) | HuggingFace, 0 descargas, 1 like |
| ukisai/Swift-1.5-Qwen3.8-27b | 27,78B | no disponible (pesos originales) | no disponible | swift-open-license-1.0 | HuggingFace, modelo gated |
| ukisai/Swift-Qwen3.8-27b (Swift 1.0) | no disponible | no disponible | no disponible | no disponible | HuggingFace, mas de 350.000 descargas segun la model card |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | HuggingFace, modelo base de referencia |
| ukisai/Swift-1.5-Qwen3.8-27B-GGUF | no disponible | GGUF | no disponible | swift-open-license-1.0 (presumible) | HuggingFace, alternativa para llama.cpp/Ollama |

La comparacion cuantitativa entre estas variantes no puede completarse porque los datos de parametros, contexto y licencia de los modelos base no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia personalizada: swift-open-license-1.0 no es una licencia estandar; es imprescindible revisar el texto completo enlazado en el modelo base antes de cualquier uso comercial. La model card menciona una seccion de licencia empresarial, lo que sugiere condiciones diferenciadas para produccion.
- Acceso restringido: el repositorio esta marcado como gated, por lo que es necesario solicitar acceso y aceptar condiciones antes de descargar los pesos.
- Sin datos de benchmarks verificables en la informacion disponible: las cifras de mejora (58,5% menos tokens, +0,35% de puntuacion, 1,95x) proceden del propio autor y no se acompanan de la tabla numerica completa ni de evaluaciones independientes.
- Degradacion por cuantizacion: al tratarse de una cuantizacion AWQ INT4, es esperable una perdida de precision respecto a los pesos originales, especialmente en tareas de razonamiento matematico, codigo de baja frecuencia y contextos muy largos. No se han publicado mediciones de esta degradacion para este repositorio concreto.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad para el modelo base ni para la cuantizacion.
- Sesgos: no se dispone de informacion sobre sesgos conocidos, composicion demografica del dataset ni auditorias de seguridad.
- Limitaciones de contexto: la longitud de contexto no esta disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Idiomas: aunque se declaran 10 idiomas, no se especifica el nivel de competencia por idioma ni si la cuantizacion afecta de forma desigual a los idiomas con menos representacion.
- Capacidad multimodal no verificada: el pipeline image-text-to-text indica soporte de imagenes, pero no se detalla el alcance ni se aportan metricas de vision.
- Uso en produccion: la combinacion de licencia no estandar, acceso gated y ausencia de benchmarks publicos hace recomendable una evaluacion propia en el dominio objetivo antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-INT4
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Version anterior (Swift 1.0): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Version GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Version GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo fundacional Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento multi-turno agentico: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Dataset de calibracion de la cuantizacion: https://huggingface.co/datasets/cyankiwi/calibration
- Sitio web de UkisAI: https://ukisai.com
- Pagina de producto de Swift: https://ukisai.com/products/swift
- Demo interactiva del juego generado: https://ukisai.com/swift-games/27b
