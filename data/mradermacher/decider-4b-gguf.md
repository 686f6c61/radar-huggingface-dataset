# mradermacher/decider-4b-GGUF

## Resumen

decider-4b-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo Mapika/decider-4b, publicado por mradermacher. Se trata de un modelo de decisión de tipo "System One": en lugar de generar cadenas de razonamiento largas, está afinado para resolver tareas en una sola pasada (one-pass) y devolver salidas estructuradas y calibradas. El autor del modelo base lo describe como una reproducción abierta de la clase de modelos "System One" (Jev, de TypeSafe AI), de la que este repositorio es una conversión comunitaria de pesos, no un entrenamiento propio.

El modelo cuenta con 4.205.751.296 parámetros (~4,2 B) y deriva de Qwen/Qwen3.5-4B-Base, según la documentación del proyecto Mapika/decider en GitHub. La familia decider incluye además una variante de 2B sobre Qwen3.5-2B-Base y una variante MoE de 35B sobre Qwen3.5-35B-A3B-Base; este repositorio cubre únicamente la variante densa de 4B.

Su relevancia práctica está en el empaquetado: al ofrecer cuantizaciones desde Q2_K (2,0 GB) hasta f16 (8,5 GB), permite desplegar un modelo de decisión multi-tarea en hardware de consumo mediante llama.cpp u Ollama. La licencia Apache 2.0 y su naturaleza independiente (sin afiliación con TypeSafe AI) facilitan su uso comercial, aunque con las cautelas habituales de un modelo derivado y poco rodado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, derivado de Qwen/Qwen3.5-4B-Base |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base (Mapika/decider-4b) se distribuye en safetensors |
| Modelo base | Mapika/decider-4b |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 38,9 GB |
| Fecha de publicacion del repo | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B-Base: un transformer decoder denso de aproximadamente 4,2 B de parametros. Sobre esa base, el proyecto Mapika/decider aplica un ajuste fino orientado a lo que denomina "System One", un paradigma en el que el modelo emite la decision directamente en una sola pasada en lugar de desplegar un razonamiento extendido paso a paso. El resultado esperado es menor latencia por consulta y una salida de decision mas compacta.

Los metadatos del repositorio etiquetan el modelo con decision-model, calibrated, structured-output, multi-task, system-one y one-pass, lo que indica que el entrenamiento persiguio tres objetivos: producir una respuesta de decision unica, calibrar la confianza asociada y respetar un esquema de salida estructurado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. Tampoco hay datos sobre innovaciones de decodificacion especulativa, atencion lineal u otras optimizaciones.

Este repositorio concreto no contiene entrenamiento nuevo: es una conversion de pesos a GGUF realizada por mradermacher, que incluye tanto cuantizaciones estaticas como tipos K e IQ. El autor de la cuantizacion indica que no ha publicado variantes ponderadas ni imatrix en el momento de la publicacion.

## Capacidades

- Generacion de decisiones en una sola pasada (one-pass): el modelo esta afinado para emitir una respuesta de decision sin cadena de razonamiento extensa.
- Salida estructurada: orientado a producir resultados en formatos estructurados y parseables, segun la etiqueta structured-output.
- Calibracion de confianza: la etiqueta calibrated sugiere que las puntuaciones o probabilidades de decision estan calibradas, aunque no se detalla la metodologia.
- Multi-tarea: la etiqueta multi-task indica que cubre varias tareas de decision dentro del mismo modelo.
- Uso conversacional: el repositorio incluye la etiqueta conversational y los quants son utilizables desde interfaces de chat de llama.cpp u Ollama.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseno one-pass apunta en la direccion contraria.
- Capacidades multilingues: limitadas al ingles (language: en).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Enrutado de consultas en un pipeline de atencion al cliente: el modelo puede clasificar cada mensaje entrante y decidir a que cola o servicio derivarlo en una sola pasada, lo que reduce la latencia frente a modelos que generan razonamiento previo.
- Clasificacion y triaje de tickets de soporte: al estar afinado para salida estructurada, encaja como componente de clasificacion multi-tarea (categoria, urgencia, sentimiento) dentro de un backend ya existente.
- Filtrado previo en sistemas RAG: puede actuar como decisor que determine si una consulta requiere recuperacion externa, que documento usar o si debe rechazarse, antes de invocar el modelo generador principal.
- Validacion y enrutado en pipelines de datos: uso como componente de decision para descartar, marcar o etiquetar registros en procesos ETL, aprovechando su tamano reducido para ejecutarse en CPU.
- Asistente de decisiones en herramientas de escritorio: gracias a sus cuantizaciones de 2,0 a 4,6 GB, puede integrarse en aplicaciones locales via llama.cpp u Ollama sin depender de la nube.
- Prototipado rapido e investigacion sobre modelos System One: sirve como referencia abierta y ligera para comparar con aproximaciones de razonamiento explicito, dado su enfoque one-pass.
- Moderacion o prechequeo de contenido: como clasificador binario o multiclase de bajo coste antes de pasar el texto a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y la documentacion del proyecto Mapika/decider citada en la busqueda web tampoco aporta cifras de evaluacion.

## Requisitos de hardware

Los tamanos que figuran a continuacion son los de los ficheros GGUF publicados; la VRAM necesaria para inferencia es una estimacion que anade margen para el contexto y los buffers del runtime.

- Q2_K: 2,0 GB de fichero. Inferencia estimada en torno a 2,5-3,5 GB de VRAM.
- Q3_K_S / Q3_K_M / Q3_K_L: 2,2 / 2,4 / 2,5 GB. Aproximadamente 3-4 GB de VRAM.
- IQ4_XS: 2,6 GB. Aproximadamente 3-4 GB de VRAM.
- Q4_K_S / Q4_K_M: 2,7 / 2,8 GB. El autor los marca como "fast, recommended". Cabe en GPU de 6-8 GB.
- Q5_K_S / Q5_K_M: 3,1 / 3,2 GB. Cabe en GPU de 8 GB.
- Q6_K: 3,6 GB, marcado como "very good quality". Cabe en GPU de 8-12 GB.
- Q8_0: 4,6 GB, marcado como "fast, best quality". Requiere en torno a 6-7 GB de VRAM.
- f16: 8,5 GB, 16 bits por peso; el autor lo considera "overkill". Requiere 10-12 GB de VRAM.
- GPU recomendadas: por tamano, cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente. Para despliegues con muchas peticiones concurrentes o contexto largo, tarjetas de 16-24 GB o profesionales tipo A100/H100 aportan margen, si bien un modelo de 4 B no las necesita en la mayoria de escenarios.
- CPU: las cuantizaciones Q2_K a Q4_K_M son viables en CPU con RAM de 8-16 GB, especialmente en equipos Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (referencia directa para GGUF), Ollama, LM Studio y servidores compatibles con GGUF. No se ha confirmado compatibilidad con vLLM o TGI, que priorizan safetensors; para ello seria preferible partir de Mapika/decider-4b.
- Latencia y throughput: no disponible. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-4b-GGUF (este repo) | ~4,2 B | no disponible | no disponible | apache-2.0 | Cuantizaciones GGUF de Q2_K a f16 |
| Mapika/decider-4b (modelo base) | ~4,2 B | no disponible | no disponible | apache-2.0 | safetensors |
| Mapika/decider-2b | ~2 B (sobre Qwen3.5-2B-Base) | no disponible | no disponible | no disponible | repositorio del proyecto |
| Mapika/decider-35b (MoE) | ~35 B totales (sobre Qwen3.5-35B-A3B-Base) | no disponible | no disponible | no disponible | repositorio del proyecto |

Las tres variantes comparten la filosofia System One y el mismo origen de pesos Qwen3.5, por lo que la eleccion entre ellas es principalmente una cuestion de presupuesto de computo y latencia. No se dispone de cifras de rendimiento que permitan una comparacion cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Idiomas: el modelo declara unicamente ingles (language: en). No hay evidencia de soporte fiable para castellano u otros idiomas.
- Sesgos: no disponible. No se documentan evaluaciones de sesgo ni de toxicidad.
- Alucinacion: al ser un modelo pequeno derivado de una base de 4 B, el riesgo de respuestas incorrectas es apreciable, especialmente fuera de la tarea de decision para la que fue afinado. La calibracion declarada no elimina este riesgo.
- Dependencia de la tarea: el ajuste one-pass lo orienta a decisiones, no a generacion abierta ni a razonamiento de multiples pasos. Usarlo fuera de ese marco puede degradar la calidad.
- Ambiguedad sobre la clase de modelo: se describe como reproduccion abierta de la clase "System One" de TypeSafe AI, sin afiliacion ni respaldo de dicha empresa. Conviene tratar esa comparacion como orientativa.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en los datos consultados, por lo que no existe validacion de la comunidad ni evidencia de uso en produccion.
- Madurez del ecosistema: la base declarada es Qwen3.5, y no se aporta informacion sobre la longitud de contexto ni sobre el proceso de entrenamiento, lo que dificulta evaluar su comportamiento en entradas largas.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Mapika/decider-4b y de Qwen3.5-4B-Base antes de desplegarlo en produccion, ya que las obligaciones de la licencia del modelo original pueden heredarse.
- Ausencia de benchmarks: no hay metricas publicadas que respalden afirmaciones de calidad o comparaciones con alternativas.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/decider-4b-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-4b
- Repositorio GitHub del proyecto decider: https://github.com/Mapika/decider
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#decider-4b-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
