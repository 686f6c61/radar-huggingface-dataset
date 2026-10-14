# mradermacher/Docket-3B-GGUF

## Resumen

mradermacher/Docket-3B-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo shahjenil/Docket-3B, publicadas por el usuario mradermacher. El modelo original es un "decision model" de tipo *system one*: según las etiquetas del repositorio, está orientado a la generación de decisiones tipadas (*typed decisions*), la clasificación y su integración en flujos de agentes en entornos empresariales. Tiene 3.659.737.600 parámetros (unos 3,66 mil millones) y el repositorio de cuantizaciones redistribuye sus pesos en 12 variantes GGUF.

El interés práctico de esta publicación es que permite ejecutar un modelo de 3,66 B en hardware de consumo: las variantes Q4_K_S y Q4_K_M ocupan 2,2 y 2,3 GB respectivamente, de modo que caben en GPUs con 4-6 GB de VRAM e incluso en CPU. La licencia es Apache 2.0, tanto en el original como en las cuantizaciones, y el único idioma declarado es el inglés.

La limitación principal es documental: el repositorio de cuantizaciones no aporta arquitectura, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. Las etiquetas (`granite`, `agents`, `classification`) y los conjuntos de datos citados (WANLI, Banking77, GSM8K, AQuA-RAT) permiten inferir la orientación del modelo, pero no sustituyen a una model card detallada del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `granite` apunta a una base de la familia IBM Granite, sin confirmar) |
| Parametros totales | 3.659.737.600 (datos reales de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura en la documentación publicada. Las etiquetas del repositorio incluyen `granite`, lo que sugiere que Docket-3B parte de un modelo denso de la familia IBM Granite (transformer decoder) y ha sido adaptado o afinado para tareas de decisión; sin embargo, ni el cuantizador ni los metadatos confirman esta correspondencia. Tampoco se especifican número de tokens de entrenamiento, composición del dataset ni si hubo etapas de RLHF o DPO.

Los conjuntos de datos declarados en los metadatos son `alisawuffles/WANLI` (inferencia de lenguaje natural con explicaciones), `PolyAI/banking77` (clasificación de intenciones en banca), `openai/gsm8k` (problemas aritméticos con solución paso a paso) y `deepmind/aqua_rat` (razonamiento matemático con racionales). No se indica si se usaron para entrenamiento, ajuste fino o evaluación, de modo que cualquier afirmación sobre el proceso de entrenamiento sería especulativa. El enfoque declarado mediante etiquetas es el de "decisiones tipadas": emitir una decisión con una estructura o tipo predefinido, en lugar de texto libre, lo que encaja con casos de enrutado y clasificación en pipelines de agentes. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de decisiones tipadas y clasificación: la etiqueta `typed-decisions` y `classification` indica que el modelo está pensado para devolver una decisión estructurada dentro de un conjunto cerrado de opciones.
- Clasificación de intenciones: la presencia de Banking77 sugiere capacidad para etiquetar intenciones de usuario en dominios de atención al cliente y banca.
- Inferencia de lenguaje natural: el uso de WANLI apunta a tareas de entailment, contradicción y neutralidad.
- Razonamiento aritmético y matemático básico: los datasets GSM8K y AQuA-RAT señalan entrenamiento o evaluación en problemas de matemáticas de nivel escolar, con y sin opciones múltiples.
- Integración en agentes: la etiqueta `agents` sugiere su uso como componente de decisión dentro de sistemas multi-paso, aunque no se documenta soporte explícito de *tool calling* ni de function calling.
- Multilingüismo: no disponible; el único idioma declarado es el inglés.
- Capacidades multimodales (visión, audio) y modos de razonamiento extendido: no disponibles; no hay ninguna referencia en los metadatos.
- Conversacional: el repositorio incluye la etiqueta `conversational`, aunque sin plantilla de chat ni formato de prompt documentado.

## Casos de uso

- Enrutado de peticiones en un sistema multiagente: el modelo puede actuar como clasificador de bajo coste que decide qué agente o herramienta debe atender una consulta, con la ventaja de caber en 2,3 GB en cuantización Q4_K_M y poder ejecutarse en la misma GPU que el modelo principal.
- Clasificación de intenciones en atención al cliente: dado un mensaje de usuario, asignar una etiqueta de intención (reclamación, consulta de saldo, baja, etc.), una tarea para la que Banking77 es una referencia habitual.
- Moderación y filtrado previo: uso como "system one" rápido para descartar o etiquetar entradas antes de enviarlas a un modelo mayor, reduciendo el coste por petición en pipelines de alto volumen.
- Verificación de entailment en flujos RAG: comprobar si un fragmento recuperado respalda una afirmación antes de mostrarla al usuario, aprovechando el entrenamiento o evaluación sobre WANLI.
- Resolución asistida de problemas aritméticos sencillos: apoyo en herramientas educativas o en la validación de cálculos de facturación, siempre con verificación posterior dado el tamaño del modelo.
- Despliegue en el borde o en local: al ocupar 1,6-4,0 GB según cuantización, puede integrarse en aplicaciones de escritorio, portátiles o dispositivos con Apple Silicon sin conexión a servicios en la nube.
- Preetiquetado de datos para anotación: generación automática de etiquetas en grandes corpus de texto que después se revisan por humanos, reduciendo el coste de la anotación inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de cuantizaciones no incluye tabla de evaluación y los conjuntos de datos citados (WANLI, Banking77, GSM8K, AQuA-RAT) aparecen únicamente como metadatos, sin métricas asociadas. Tampoco se dispone de comparaciones con otros modelos publicadas por el autor del modelo base en la información proporcionada.

## Requisitos de hardware

Los tamaños siguientes son los de los archivos GGUF publicados; la VRAM necesaria añade entre 0,5 y 2 GB adicionales en función del contexto, del tamaño de la caché KV y del *backend* utilizado.

| Cuantizacion | Tamano del archivo | VRAM estimada en inferencia | Notas |
|---|---|---|---|
| Q2_K | 1,6 GB | ~2-3 GB | calidad reducida |
| Q3_K_S | 1,8 GB | ~2-3 GB |  |
| Q3_K_M | 1,9 GB | ~3 GB | calidad inferior según el cuantizador |
| Q3_K_L | 2,1 GB | ~3 GB |  |
| IQ4_XS | 2,1 GB | ~3 GB |  |
| Q4_K_S | 2,2 GB | ~3-4 GB | rápido, recomendado |
| Q4_K_M | 2,3 GB | ~3-4 GB | rápido, recomendado |
| Q5_K_S | 2,7 GB | ~4-5 GB |  |
| Q5_K_M | 2,7 GB | ~4-5 GB |  |
| Q6_K | 3,1 GB | ~4-5 GB | muy buena calidad |
| Q8_0 | 4,0 GB | ~5-6 GB | mejor calidad, rápido |
| f16 | 7,4 GB | ~9-10 GB | 16 bpw, sobredimensionado |

- GPU de consumo compatibles: GTX 1060 6 GB, RTX 2060/3060, RTX 4060/4070 con la mayoría de cuantizaciones; RTX 4090 o A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, de forma holgada, incluso en iGPU con memoria unificada (Apple Silicon, APUs con 8-16 GB asignados).
- Ejecución en CPU: viable en todas las cuantizaciones, especialmente Q4_K_M o inferiores con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y bindings llama-cpp-python. vLLM, TGI o SGLang no admiten GGUF de forma nativa y requerirían el modelo en safetensors, que no se incluye en este repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La comparación es de categoría, no de rendimiento: no existen resultados de benchmarks públicos de Docket-3B en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| Docket-3B (GGUF) | 3,66 B | no disponible | Apache 2.0 | Decisiones tipadas, clasificación, agentes |
| IBM Granite 3.x (2B / 8B) | 2 B / 8 B | no disponible en esta ficha | Apache 2.0 | Uso general, enterprise, tool calling |
| Qwen2.5-3B | 3,09 B | no disponible en esta ficha | Apache 2.0 | Uso general, multilingüe, código |
| Llama 3.2-3B | 3,21 B | no disponible en esta ficha | Licencia comunitaria Llama 3.2 | Uso general, instrucciones, tool calling |

Frente a estos modelos, Docket-3B no se posiciona como alternativa generalista, sino como un componente especializado en decisiones y clasificación. Su ventaja declarada sería el tamaño reducido y su encaje en flujos de agentes; su desventaja, la ausencia de documentación técnica y de métricas que permitan verificar esa especialización. Todos los comparadores están disponibles en GGUF mediante cuantizaciones de la comunidad, igual que Docket-3B.

## Limitaciones y advertencias

- Ausencia de model card técnica: no se documentan arquitectura, contexto, plantilla de prompt ni formato de salida de las decisiones tipadas, lo que complica la integración en producción sin ingeniería inversa.
- Contexto desconocido: al no declararse la ventana de contexto, no puede asumirse soporte para documentos largos.
- Solo inglés: cualquier uso en castellano u otros idiomas queda fuera del alcance declarado y previsiblemente degradará la calidad.
- Riesgo de alucinación: un modelo de 3,66 B puede producir decisiones o justificaciones incorrectas con alta confianza; en tareas de clasificación crítica conviene añadir validación de esquema y umbrales de confianza.
- Trazas de sesgo: los datasets citados (WANLI, Banking77, GSM8K) incorporan sesgos propios de sus dominios; no se documenta ningún proceso de alineación o mitigación.
- Rendimiento no verificado: no hay benchmarks publicados, por lo que no puede compararse objetivamente con alternativas del mismo tamaño.
- Validación comunitaria muy baja: 110 descargas y 0 likes en el momento de redactar esta ficha, lo que implica poca revisión independiente del comportamiento del modelo.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene conservar los avisos de licencia y verificar las condiciones del modelo base original en shahjenil/Docket-3B antes de redistribuirlo.
- Fechas de metadatos anómalas: el repositorio declara creación y actualización en octubre de 2026, dato que conviene contrastar si se planifica su uso en producción.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Docket-3B-GGUF
- Modelo base: https://huggingface.co/shahjenil/Docket-3B
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Docket-3B-GGUF
- Guía de uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comentarios sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
- Grafíco comparativo de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: los enlaces obtenidos corresponden a la película The Hateful Eight (2015) y se han descartado por no guardar relación con Docket-3B. No se han encontrado papers, blogs técnicos ni demos adicionales.
