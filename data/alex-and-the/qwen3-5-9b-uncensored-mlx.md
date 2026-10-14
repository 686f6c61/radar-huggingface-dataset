# alex-and-the/Qwen3.5-9B-Uncensored-MLX

## Resumen

Qwen3.5-9B-Uncensored-MLX es una conversión al formato MLX del modelo HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive, un ajuste "uncensored" del Qwen3.5-9B de Alibaba. Lo publica el usuario alex-and-the en Hugging Face y está pensado para ejecutarse en Apple Silicon mediante la librería MLX. El modelo conserva la arquitectura y las capacidades del original (9B densos, multimodal, contexto nativo de 262K tokens) pero con las negativas de seguridad eliminadas, según afirma el autor del ajuste.

La relevancia de esta ficha está en dos factores. Por un lado, la arquitectura del Qwen3.5-9B es híbrida: combina atención lineal Gated DeltaNet con atención softmax completa en proporción 3:1, lo que reduce el coste de caché KV en contextos largos. Por otro, el modelo es nativamente multimodal (texto, imagen y vídeo) y soporta Multi-Token Prediction (MTP), algo poco habitual en la franja de 9B.

El repositorio ocupa 5,7 GB y los pesos están cuantizados en mxfp4 (4,821 bits por peso), con 9.409.813.744 parámetros totales. La licencia declarada es Apache 2.0, heredada del Qwen3.5-9B original. Es importante señalar que se trata de un modelo sin filtros de rechazo, por lo que su uso en producción exige controles externos de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet (atención lineal) + atención softmax completa, en proporción 3:1; 32 capas |
| Parametros totales | 9.409.813.744 (≈9,41B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens nativos; extensible a 1M con YaRN |
| Tipos de cuantizacion | mxfp4 (4 bits, 4,821 bpw) en la versión publicada; el autor no documenta otras variantes |
| Idiomas soportados | 27 idiomas declarados en las etiquetas: en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el. El autor afirma vocabulario de 248K tokens y cobertura de 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (repo de 5,7 GB); no se publican GGUF ni otros formatos |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-9B, es un transformer denso de 32 capas con una arquitectura híbrida poco convencional: tres de cada cuatro capas usan Gated DeltaNet, un mecanismo de atención lineal con compuertas, y la cuarta capa emplea atención softmax completa. Este diseño reduce el crecimiento de la caché KV con la longitud del contexto, lo que hace viable trabajar con ventanas de 262K tokens sin el coste cuadrático de un transformer estándar. El modelo incorpora además soporte de Multi-Token Prediction (MTP), que permite predecir varios tokens por paso de decodificación y puede acelerar la inferencia especulativa.

Sobre el entrenamiento del modelo original no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo único documentado es el proceso de ajuste posterior realizado por HauhauCS, cuyo autor afirma haber eliminado las negativas de seguridad sin modificar los datasets ni las capacidades del modelo ("no changes to datasets or capabilities"), y reporta una tasa de 0/465 rechazos en su propia evaluación interna. Esa cifra procede del autor del ajuste y no está verificada de forma independiente. La conversión a MLX y la cuantización mxfp4 posterior las realiza alex-and-the; tampoco se documenta la metodología exacta de dicha conversión.

## Capacidades

- Generación de texto conversacional multi-turno en 27 idiomas declarados, con cobertura ampliada a 201 idiomas según el vocabulario del autor.
- Razonamiento en dos modos con parámetros de muestreo diferenciados: modo "thinking" (temperatura 0,6; top_p 0,95; top_k 20) y modo "non-thinking" (temperatura 0,7; top_p 0,8; top_k 20).
- Procesamiento multimodal nativo: entrada de texto, imagen y vídeo, según la especificación del modelo base (pipeline declarado image-text-to-text).
- Contexto largo: 262K tokens nativos, ampliables a 1M mediante escalado YaRN.
- Multi-Token Prediction (MTP), útil para decodificación especulativa y mejora de throughput.
- Ausencia total de rechazos: el modelo no declina peticiones, según el autor (0/465 rechazos declarados).
- Soporte de tool calling / function calling: no confirmado explícitamente en la documentación disponible, aunque es una capacidad habitual en la familia Qwen.
- Comportamiento de agentes y razonamiento multi-paso: no documentado de forma explícita en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: al ser un modelo sin mecanismos de rechazo, resulta útil como caso de estudio para medir qué contenido genera un modelo desalineado y para entrenar clasificadores de seguridad que actúen como capa externa.
- Análisis de documentos largos en local: la ventana de 262K tokens permite procesar contratos, informes técnicos o expedientes completos sin troceado, y la atención lineal Gated DeltaNet reduce el coste de memoria frente a un transformer denso equivalente.
- Asistente multimodal en escritorio: con entrada de imagen y vídeo, se puede usar para describir capturas, resumir vídeos o extraer información de gráficos dentro de una aplicación de escritorio para macOS.
- Generación de texto creativo sin restricciones editoriales: escritura de ficción, guiones o narrativa que aborde temas que los modelos alineados suelen rechazar, siempre con revisión humana posterior.
- Traducción y procesamiento multilingüe: con 27 idiomas etiquetados y vocabulario declarado de 248K tokens, es adecuado para traducción entre lenguas europeas y asiáticas, incluyendo pares poco frecuentes como islandés o panyabí.
- Prototipado rápido en Apple Silicon: al estar en formato MLX y ocupar 5,7 GB, se puede cargar en un Mac con memoria unificada para experimentar con razonamiento, multimodalidad y contexto largo sin depender de GPU dedicadas.
- Extracción estructurada de información: uso como motor de parsing de documentos con contexto largo, clasificación de textos y generación de resúmenes en pipelines internos donde no haya requisitos de filtrado de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de evaluación presente es la afirmación del autor del ajuste sobre la tasa de rechazos (0/465), que no constituye una medida de capacidad. No hay cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales en la documentación proporcionada, ni comparaciones verificables con el modelo base.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 5,7 GB en mxfp4 (4,821 bpw), calculados a partir de los 9.409.813.744 parámetros. Estas cifras son estimaciones derivadas del tamaño del modelo, no medidas publicadas.
- Estimación en otras precisiones (no publicadas por el autor): en torno a 9,4 GB en 8 bits y 18,8 GB en bf16/fp16 para los pesos.
- GPU con memoria suficiente para 4 bits: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090 y RTX 5090. En 8 bits encajaría en tarjetas de 12-16 GB; en 16 bits requeriría 24 GB o más (RTX 3090/4090, A100 40 GB, H100).
- Apple Silicon: al ser un modelo MLX, el destino natural son chips de la serie M. Con memoria unificada de 16 GB se puede cargar en mxfp4; 32 GB o más es recomendable si se trabaja con contextos largos, ya que la caché KV de 262K tokens consume memoria adicional.
- Con caché KV larga: la arquitectura híbrida limita la atención softmax completa a una de cada cuatro capas, lo que reduce el consumo de caché respecto a un transformer denso, pero con 1M tokens (YaRN) el requisito de memoria sigue siendo elevado y no está cuantificado en la documentación.
- Despliegue: MLX es la vía soportada (librería declarada en el repositorio). Para multimodalidad se requeriría el soporte de imagen/vídeo de MLX. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, y estos frameworks no consumen pesos MLX de forma directa.
- Opción de conversión: sería posible convertir a GGUF para llama.cpp u Ollama, pero el autor no publica dicha conversión ni garantiza su viabilidad.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia en ningún hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-MLX (este) | 9,41B densos | 262K nativos, 1M con YaRN | Híbrida Gated DeltaNet + softmax (3:1), multimodal | Apache 2.0 | MLX safetensors, 5,7 GB, mxfp4 |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive (base del ajuste) | 9B densos (según model card) | 262K nativos, 1M con YaRN | Idéntica al Qwen3.5-9B | No disponible en la información proporcionada | Peso original; formatos no disponibles |
| Qwen/Qwen3.5-9B (modelo original) | 9B densos (según model card) | 262K nativos, 1M con YaRN | Híbrida Gated DeltaNet + softmax (3:1), multimodal | Apache 2.0 | Pesos originales; formatos no detallados |
| TheCluster/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4 | 27B (según referencia del autor) | No disponible | No disponible | No disponible | MLX mxfp4, citado como variante mayor |

No se dispone de datos de rendimiento comparativos entre estas variantes. La comparación se limita a parámetros, contexto, licencia y formato, según lo documentado en la model card.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: no rechaza peticiones. Puede generar contenido ilegal, dañino, difamatorio o explícitamente sexual si se le solicita. Requiere una capa de moderación externa obligatoria en cualquier despliegue con usuarios finales.
- La afirmación de "0/465 rechazos" y de "cero pérdida de capacidad" procede del autor del ajuste y no ha sido verificada de forma independiente.
- Riesgo de alucinación: inherente a los modelos de esta escala, y potencialmente mayor en dominios especializados o en idiomas con poca presencia en el corpus de entrenamiento.
- El modelo puede añadir avisos o disclaimers al final de las respuestas (por ejemplo, "esto es información general, no asesoramiento legal"). El autor indica que esto está integrado en el modelo base y no constituye un rechazo.
- Contexto e idiomas: aunque se declaran 27 idiomas en las etiquetas y 201 según el vocabulario del autor, no hay evaluaciones publicadas de calidad por idioma. El rendimiento real en lenguas minoritarias como el islandés, el panyabí o el suajili no está medido.
- Extensión a 1M de contexto mediante YaRN: no hay datos publicados sobre la degradación de calidad en longitudes superiores a los 262K tokens nativos.
- Formato restringido: los pesos están en MLX, lo que limita el despliegue a hardware Apple Silicon y a los frameworks que soportan esta librería. No hay GGUF, no hay vLLM y no hay pesos sin cuantizar en el repositorio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad legal por el contenido generado. La licencia Apache incluye una cláusula de exención de garantías y de responsabilidad de los contribuyentes.
- Sin datos de benchmarks: no es posible estimar la degradación de capacidades introducida por el ajuste uncensored ni por la cuantización mxfp4 a 4,821 bpw.
- Trazabilidad limitada: no se documentan la metodología de cuantización, el proceso de conversión a MLX ni las condiciones exactas del ajuste uncensored.
- Contenido multimodal (imagen y vídeo) sin evaluación de seguridad publicada: los filtros de contenido visual del modelo original pueden haberse visto afectados por el ajuste.
- Advertencia legal: en la Unión Europea, el uso de este modelo puede entrar en conflicto con obligaciones del AI Act en materia de transparencia y de gestión de riesgos si se despliega en aplicaciones de alto riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alex-and-the/Qwen3.5-9B-Uncensored-MLX
- Modelo base del ajuste: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Variante de 27B citada por el autor: https://huggingface.co/TheCluster/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Los resultados devueltos corresponden a entidades y servicios sin relación con el proyecto (plataformas de conciliación laboral, portales inmobiliarios, ayuntamientos y servicios jurídicos), por lo que se descartan.
- No se han encontrado papers, blogs técnicos, repositorios de código ni demos asociados al modelo en la información disponible.
