# bikesa/averon1.1

## Resumen

Averon 1.1 es un modelo de lenguaje publicado por el usuario bikesa en HuggingFace bajo el identificador `bikesa/averon1.1`. Se distribuye en formato GGUF, el formato de pesos optimizado para inferencia con llama.cpp y sus derivados, e incluye la etiqueta `imatrix`, lo que indica que las cuantizaciones se han calibrado mediante una matriz de importancia (importance matrix) para reducir la pérdida de calidad respecto a una cuantización uniforme. El repositorio tiene un tamaño de 67,5 GB y el recuento real de parámetros en safetensors es de 35.505.251.456, es decir, aproximadamente 35,5 mil millones de parámetros.

La etiqueta `conversational` sugiere un ajuste orientado a diálogo o instrucciones, y `endpoints_compatible` apunta a que el repositorio está preparado para desplegarse mediante HF Inference Endpoints. Fuera de estos metadatos, la información pública es prácticamente inexistente: no se ha publicado arquitectura, longitud de contexto, composición del dataset de entrenamiento, licencia ni idiomas soportados. El modelo acumula 12 descargas y 0 likes desde su creación el 20 de octubre de 2026, lo que lo sitúa en una fase muy temprana de adopción.

Por su volumen de parámetros, se enmarca en la categoría de modelos densos de ~35B, un rango que habitualmente requiere cuantización agresiva o hardware de gama alta para inferencia local. Cualquier evaluación de sus capacidades reales debe realizarse empíricamente, ya que no hay benchmarks ni documentación técnica publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no se ha publicado información sobre la arquitectura; no se ha confirmado que sea transformer denso, MoE ni híbrida) |
| Parámetros totales | 35.505.251.456 (~35,5B) |
| Parámetros activos | No disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF, con cuantizaciones calibradas mediante importance matrix (`imatrix`); los niveles concretos (Q2_K, Q4_K_M, Q5_K_M, Q8_0, etc.) no están documentados en la información disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (pesos cuantizados para llama.cpp); el recuento de parámetros se ha verificado sobre safetensors |
| Tamaño del repositorio | 67,5 GB |
| Etiquetas declaradas | `gguf`, `endpoints_compatible`, `region:us`, `imatrix`, `conversational` |
| Descargas / likes | 12 / 0 |
| Fecha de creación | 2026-10-20 |
| Última actualización | 2026-10-20 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. El recuento de parámetros (35,5B) y el formato GGUF son los únicos datos estructurales verificables. La presencia de la etiqueta `imatrix` es un indicador técnico relevante: implica que el autor generó una matriz de importancia a partir de un corpus de calibración para guiar la cuantización, una técnica habitual para preservar el rendimiento en niveles de 4 y 5 bits, especialmente en modelos de este tamaño.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, las fases de alineación (RLHF, DPO, ORPO u otras) ni innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. Cualquier afirmación al respecto sería especulativa. El tamaño del repositorio (67,5 GB) es coherente con un conjunto de varias cuantizaciones del mismo modelo base, pero no permite deducir los niveles exactos ni el peso original en precisión completa.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` sugiere ajuste para diálogo multi-turno, aunque no se ha documentado el formato de plantilla de chat empleado.
- Instrucciones y seguimiento de prompts: presumible por el perfil declarado, sin datos publicados que lo verifiquen.
- Inferencia local y en servidor: el formato GGUF permite ejecución en CPU/GPU con llama.cpp, Ollama, LM Studio y servidores compatibles.
- Despliegue gestionado: la etiqueta `endpoints_compatible` indica compatibilidad con HF Inference Endpoints.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

Los siguientes escenarios se derivan del perfil técnico verificable (modelo conversacional de ~35,5B en GGUF, con cuantización calibrada) y deben validarse empíricamente antes de llevarlos a producción, dado que no hay benchmarks publicados.

- Asistente conversacional autoalojado: desplegado con llama.cpp u Ollama sobre hardware propio, el modelo puede atender diálogos multi-turno sin enviar datos a terceros, lo que encaja en entornos con requisitos de soberanía del dato.
- Prototipado rápido de productos de chat: el formato GGUF y la compatibilidad con Inference Endpoints permiten pasar de una prueba local a un endpoint gestionado sin reconvertir pesos.
- Procesamiento por lotes de textos largos en CPU: con cuantizaciones de 4-5 bits (en torno a 20-25 GB de pesos) el modelo puede ejecutarse en servidores sin GPU dedicada, priorizando coste sobre latencia.
- Generación y revisión de documentación técnica interna: un modelo de 35B suele manejar registro formal y coherencia a lo largo de secciones extensas, siempre que se confirme su ventana de contexto real.
- Base para ajuste fino específico de dominio: al disponer de pesos en abierto (licencia no confirmada, ver advertencias), podría servir como punto de partida para LoRA o QLoRA sobre datos propios.
- Extracción y reescritura de información en pipelines internos: resumen de correos, clasificación de incidencias o normalización de textos, ejecutado en local para evitar exposición de datos sensibles.
- Evaluación comparativa interna: útil como candidato adicional en pruebas ciegas frente a modelos de tamaño similar, dado que su licencia y procedencia deben verificarse antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación estándar para `bikesa/averon1.1`. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros (35,5B); no son cifras publicadas por el autor y deben tomarse como orientativas.

- VRAM estimada para inferencia (solo pesos, sin caché KV):
  - FP16: ~71 GB
  - Q8_0: ~38 GB
  - Q6_K: ~29 GB
  - Q5_K_M: ~25 GB
  - Q4_K_M: ~21 GB
  - Q3_K_M: ~17 GB
  - Q2_K: ~13 GB
- La caché KV crece de forma lineal con la longitud de contexto y el número de capas; con contextos largos puede añadir varios GB, por lo que conviene reservar un 15-25 % adicional de memoria.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 y cuantizaciones altas; A100 40 GB o L40S 48 GB para Q6/Q5; RTX 6000 Ada 48 GB como alternativa de workstation.
- GPU de consumo: una RTX 4090 (24 GB) solo admite Q4_K_M o inferiores con la totalidad de las capas en GPU al límite; con contextos amplios es necesario repartir capas entre GPU y CPU (offload parcial). Dos RTX 4090 permiten Q5_K_M o Q6_K sin offload.
- Memoria unificada: equipos Apple Silicon con 64 GB o 128 GB pueden ejecutar cuantizaciones de 4-5 bits de forma holgada mediante llama.cpp con backend Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y servidores compatibles con GGUF; HF Inference Endpoints por la etiqueta `endpoints_compatible`. vLLM y TGI no son la vía natural para pesos GGUF en este repositorio.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 35B en Q4_K_M sobre una RTX 4090 con offload parcial suele quedar por debajo de las decenas de tokens por segundo, pero no hay mediciones para este modelo concreto.

## Comparativa con modelos similares

`bikesa/averon1.1` no tiene datos públicos de contexto, licencia ni rendimiento, por lo que la comparación solo puede establecerse por rango de parámetros. Los datos de los modelos alternativos provienen de sus fichas oficiales y deben verificarse en la fuente.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| bikesa/averon1.1 | ~35,5B | No disponible | No disponible | No disponible | GGUF en HuggingFace (12 descargas) |
| Qwen2.5-32B | ~32,8B | 128K (versión base/instruct) | Apache 2.0 | Amplia batería de benchmarks publicada | Muy extendida, múltiples formatos |
| Gemma 3 27B | ~27B | 128K | Licencia Gemma | Benchmarks publicados por Google | Muy extendida |
| Command R (Cohere) | ~35B | 128K | CC-BY-NC 4.0 (no comercial) | Benchmarks publicados por Cohere | Pesos abiertos, uso no comercial |

La comparación relevante es de orden práctico: frente a estas alternativas, Averon 1.1 carece de documentación, de licencia declarada y de evaluaciones, lo que introduce un riesgo operativo que los modelos citados no presentan.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explícita no se puede asumir permiso de uso comercial, redistribución ni modificación. Es un bloqueante para cualquier despliegue en producción.
- Procedencia y autoría no verificadas: el repositorio pertenece a un usuario individual sin documentación técnica asociada, lo que impide auditar el origen de los datos de entrenamiento.
- Riesgo de alucinación: no evaluado; no hay datos de fiabilidad factual ni de calibración.
- Sesgos: desconocidos, al no haberse publicado la composición del corpus de entrenamiento ni evaluaciones de sesgo.
- Idiomas: no confirmados. No se debe asumir un rendimiento correcto en castellano sin pruebas previas.
- Longitud de contexto desconocida: limita el diseño de aplicaciones que dependan de ventanas largas.
- Adopción prácticamente nula (12 descargas, 0 likes): sin comunidad, sin issues, sin validación independiente. La probabilidad de encontrar fallos sin soporte es alta.
- Cuantizaciones no documentadas: no se especifican los niveles incluidos en el repositorio ni el corpus de calibración usado para la importance matrix, lo que impide reproducir la build.
- El tamaño del repositorio (67,5 GB) implica una descarga considerable; conviene inspeccionar los archivos individuales antes de clonar.
- Posible confusión de nombre: no debe confundirse con modelos de generación 3D o de imagen que aparecen en búsquedas con términos similares; el presente repositorio es un modelo de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/bikesa/averon1.1

No se han encontrado en la búsqueda web enlaces relevantes a este modelo (paper, blog, repositorio de código o demo). El resto de resultados obtenidos corresponden a generadores de modelos 3D, mercados de modelos de imagen y leaderboards genéricos, sin relación con `bikesa/averon1.1`.
