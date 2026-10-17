# RMDWLLC/Jah-7.0-Mini-MLX-8bit

## Resumen

Jah 7.0 Mini es el miembro pequeño de la familia Jah 7.0 de RMDW LLC (Georgia, Estados Unidos), una empresa que comercializa el asistente Kiyomi. Se trata de un modelo de generación de texto afinado por RMDW a partir de una base abierta más pequeña, y esta versión concreta es la cuantización a 8 bits en formato MLX, pensada para ejecutarse localmente en ordenadores Mac con Apple Silicon. El repositorio declara 26.895.993.856 parámetros (~26,9 mil millones) y un tamaño de 28,6 GB, lo que lo sitúa en la gama alta de los modelos que se pueden ejecutar en una estación de trabajo personal con memoria unificada amplia.

El modelo se presenta como "uncensored": según el autor, el comportamiento de rechazo se ha eliminado a nivel de pesos, de modo que responde a preguntas históricas, políticas o técnicas que los modelos convencionales declinan. Además incorpora llamada a herramientas (tool calling) y un modo de razonamiento ("thinking") activable por plantilla de chat, dos capacidades que lo acercan a los casos de uso de agente que hoy demanda el ecosistema open source.

Su relevancia actual es acotada pero clara: cubre el nicho de la inferencia totalmente local y privada en hardware de consumo Apple, sin cuenta ni nube, con una API compatible con OpenAI servida desde el propio equipo. Conviene tener presente que el repositorio no publica detalles de entrenamiento, longitud de contexto ni resultados de benchmarks estándar, y que en el momento de redactar esta ficha acumula 0 descargas y 0 "likes".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base abierta; el tag del repo indica `qwen3_5`). Detalles de arquitectura no disponibles |
| Parámetros totales | 26.895.993.856 (~26,9 mil millones) |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits (esta versión, formato MLX). Existe una variante de 4 bits de la misma familia |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (no se ofrece GGUF) |
| Tamaño en disco | 28,6 GB de repositorio; ~27 GB en disco en 8 bits según el autor |
| Librería de inferencia | `mlx-lm` |
| Modalidad | Texto (el flagship de la familia es el que declara visión) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo que se puede afirmar con los datos del repositorio es que se trata de un transformer decoder-only derivado de una base abierta de menor tamaño (el tag `qwen3_5` apunta a la familia Qwen 3.5 como origen), posteriormente alineado por RMDW LLC. El autor menciona explícitamente una alineación propia que incluye la eliminación del comportamiento de rechazo "a nivel de pesos", pero no detalla la metodología: no se especifica si se empleó fine-tuning supervisado, DPO, RLHF u otra técnica, ni se indica el número de tokens de entrenamiento ni la composición del dataset.

En el plano de las capacidades declaradas, el modelo incorpora un modo de razonamiento opcional que se controla mediante `chat_template_kwargs: {"enable_thinking": true}` y una plantilla de chat que permite activarlo o desactivarlo según la dificultad de la tarea. También se declara soporte de tool calling y de memoria multi-turno, verificados según el autor con "pruebas de capacidad" internas (aritmética exacta, llamadas a herramientas, memoria conversacional y modo thinking). No hay información pública sobre innovaciones técnicas adicionales como atención lineal, decodificación especulativa o estrategias de entrenamiento con datos sintéticos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con memoria de la conversación según las comprobaciones del autor.
- Razonamiento explícito opcional mediante modo "thinking" activable por plantilla de chat; desactivable para respuestas inmediatas.
- Tool calling / function calling: el modelo puede emitir llamadas a herramientas dentro de un pipeline de agente.
- Aritmética exacta: el autor afirma que supera comprobaciones de cálculo exacto (sin detallar el conjunto de pruebas).
- Respuestas sin rechazo: según la model card, contesta 6 de 6 preguntas de su "batería de censura" (históricas, políticas y mecánicas) que los modelos convencionales declinan.
- Identidad propia: se presenta como Jah, hecho por RMDW, y admite un system prompt del usuario por encima de esa identidad.
- Integración con servidor compatible con OpenAI (`mlx_lm.server`) y con LM Studio mediante el motor MLX.
- Capacidades multimodales: no disponibles en esta variante (la visión se atribuye al modelo Jah 7.0 completo).

## Casos de uso

- **Asistente local con privacidad estricta**: despacho jurídico o consultoría que necesita procesar documentos confidenciales sin que salgan del equipo; el modelo corre sobre MLX en un Mac con 64 GB o más y se sirve mediante `mlx_lm.server` en la red interna.
- **Agente de automatización con herramientas**: al soportar tool calling, se puede conectar a APIs internas (consulta de bases de datos, creación de tickets, envío de correo) usando el servidor compatible con OpenAI como backend de un framework de agentes.
- **Razonamiento asistido por pasos para problemas técnicos**: activando `enable_thinking` para tareas de diagnóstico, revisión de cálculos o análisis de casos, y desactivándolo en consultas triviales para reducir latencia.
- **Generación y revisión de código en local**: el modelo puede integrarse en un IDE o en un script de pre-commit que llame al endpoint local; el contexto disponible no está documentado, por lo que conviene limitar el tamaño de los fragmentos enviados.
- **Investigación sobre alineación y censura**: útil como objeto de estudio para comparar el comportamiento de un modelo con el rechazo eliminado frente a una base alineada convencional, siempre con revisión ética del uso.
- **Chatbot de atención al cliente en inglés**: con memoria multi-turno y respuesta rápida en hardware local; requiere un filtrado y una capa de moderación propios, dado que el modelo no incorpora rechazo.
- **Prototipado rápido en Mac sin infraestructura cloud**: validar una idea de producto conversacional en un portátil o estación Apple antes de migrar a un modelo mayor o a GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo menciona comprobaciones internas no estandarizadas, que se recogen a continuación como afirmaciones suyas y no como métricas comparables:

| Prueba declarada por el autor | Resultado |
|---|---|
| Batería de censura (6 preguntas históricas, políticas y mecánicas) | 6 de 6 respondidas |
| Aritmética exacta | superada (sin detalle del conjunto) |
| Tool calling | superado (sin detalle) |
| Memoria multi-turno | superada (sin detalle) |
| Modo thinking | superado (sin detalle) |

| Métrica de rendimiento | Valor |
|---|---|
| Velocidad de generación | ~24 tokens/s en Apple M5 Max con la variante de 4 bits |
| Throughput con 8 bits | No disponible |

No hay datos de MMLU, HumanEval, GSM8K ni de comparativas con otros modelos.

## Requisitos de hardware

- **Memoria**: el autor indica que la versión de 8 bits necesita un Mac con 64 GB de memoria unificada o más; el repositorio ocupa 28,6 GB.
- **GPU / plataforma**: exclusivamente Apple Silicon (MLX). No hay soporte publicado para CUDA, ROCm ni CPU x86.
- **¿Cabe en GPU de consumo?** No en tarjetas gráficas dedicadas de consumo, al no existir backend CUDA ni GGUF. En el ecosistema Apple sí cabe en equipos de gama alta con 64 GB o más de memoria unificada (Mac Studio, MacBook Pro M-series Max).
- **Despliegue**: `mlx-lm` (CLI `mlx_lm.generate`), servidor compatible con OpenAI mediante `mlx_lm.server --port 8080`, y LM Studio con el motor MLX. No se mencionan vLLM, TGI, llama.cpp ni Ollama, y no hay pesos GGUF publicados.
- **Latencia y throughput**: ~24 tokens/s en Apple M5 Max con cuantización de 4 bits; no se publica la cifra para 8 bits, que previsiblemente será inferior por el mayor ancho de banda de memoria requerido (dato no confirmado por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Formato | Hardware | Licencia |
|---|---|---|---|---|---|---|
| Jah 7.0 Mini MLX 8-bit (este) | ~26,9 mil millones | No disponible | No | MLX safetensors 8 bits | Mac con 64 GB+ | Apache 2.0 |
| Jah 7.0 Mini MLX 4-bit (variante de la familia) | ~26,9 mil millones | No disponible | No | MLX safetensors 4 bits | Mac (menor requisito de memoria; cifra no publicada) | Apache 2.0 |
| Jah 7.0 (flagship) | No disponible | 1.000.000 tokens | Sí | No disponible | 4 GPU de 96 GB | No disponible |
| Base abierta de origen (familia Qwen 3.5 según el tag) | No disponible para el checkpoint concreto | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones verificables para establecer una comparación cuantitativa con modelos de la misma categoría; las alternativas comparables en el ecosistema MLX no se detallan en la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: solo se declara inglés; no hay garantía de calidad en castellano ni en otros idiomas.
- **Contexto desconocido**: la longitud de contexto no se publica, lo que impide planificar tareas de documento largo con seguridad.
- **Ausencia de benchmarks**: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de terceros; las únicas cifras provienen del propio autor y no son reproducibles con la información dada.
- **Modelo "uncensored"**: la eliminación del rechazo a nivel de pesos implica riesgo real de generar contenido dañino, ilegal o inexacto. Es imprescindible una capa de moderación y filtrado propia en cualquier despliegue de producción.
- **Riesgo de alucinación**: no se documenta ninguna mitigación específica (RAG, verificación factual, calibración), por lo que debe asumirse un riesgo estándar o superior en un modelo afinado sin evaluación pública.
- **Sesgos**: no hay información sobre la composición del dataset de alineación ni auditorías de sesgo; el origen de la base (Qwen 3.5) hereda los sesgos de su propio corpus.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la base original y el archivo `LICENSE` del repositorio antes de redistribuir.
- **Restricción de plataforma**: dependencia de MLX y Apple Silicon; no hay pesos GGUF ni soporte CUDA, lo que excluye su uso en infraestructura Linux con GPU sin conversión manual.
- **Madurez del proyecto**: 0 descargas y 0 "likes" en el momento de la consulta, autor único y sin documentación técnica publicada; trátese como un artefacto experimental.
- **Identidad inyectada**: el modelo se presenta como Jah por defecto; si se requiere otra persona, hay que sobrescribirla explícitamente con el system prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RMDWLLC/Jah-7.0-Mini-MLX-8bit
- Modelo flagship de la familia: https://huggingface.co/RMDWLLC/Jah-7.0
- Sitio del autor: https://rmdw.ai
- Producto comercial del autor: https://kiyomibot.ai
