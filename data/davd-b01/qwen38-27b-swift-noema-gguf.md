# Davd-b01/qwen38-27b-swift-noema-GGUF

## Resumen

Swift–Noema Qwen3.8 27B es una cuantización GGUF experimental publicada por el usuario Davd-b01 sobre un checkpoint Qwen3.8 de 27B (27.320.697.856 parámetros según los safetensors del repo), a la que se ha injertado un módulo MTP (multi-token prediction) para decodificación especulativa y a la que se ha aplicado una búsqueda de asignación de cuantización por grupos (RCO sobre 496 grupos, con GSQ parcial en las capas 0..3). El repo ocupa 13,4 GB y contiene pesos en formato GGUF dominados por IQ3_S, además de un adaptador pequeño en `adapter/`. No es un modelo nuevo entrenado desde cero, sino un artefacto de compresión y optimización de inferencia sobre un modelo base.

Su relevancia es acotada y de carácter metodológico: la model card documenta con detalle inusual el proceso de cuantización, las mediciones locales en un AMD Strix Halo (Ryzen AI MAX 385 / Radeon 8050S, 64 GB de memoria unificada) y un conjunto de controles de utilidad y de verificación del MTP. El propio autor declara que la aceptación de calidad científica es **false** y que la criba de utilidad estricta obtuvo 3/8 frente a 8/8 de la referencia BF16, con cinco regresiones de formato de instrucciones: las cinco fallas consisten en respuestas correctas entregadas con explicación extra o con bloques Markdown alrededor de JSON.

Por tanto, estamos ante un artefacto de investigación reproducible, no ante un modelo listo para producción. No hay licencia declarada, ni idiomas declarados, ni benchmarks estándar (MMLU, HumanEval, GSM8K) publicados, y el autor renuncia explícitamente a cualquier afirmación de mejora general de calidad o de velocidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (imagen local bautizada `qwen38-dense547`), con injerto MTP de decodificación especulativa |
| Parámetros totales | 27.320.697.856 (≈27,3B) según safetensors del repo |
| Parámetros activos | No aplica: el autor no describe un MoE; el artefacto se etiqueta como denso |
| Longitud de contexto | 131.072 tokens configurados por defecto por el usuario tras los barridos; se probaron asignaciones de contexto de hasta 262.144 tokens (entrada máxima medida: 245.760 tokens). La referencia a "128K nativo" aparece truncada en la documentación disponible |
| Tipos de cuantización | Pesos dominantes IQ3_S (con `imatrix`), con búsqueda global RCO sobre 496 grupos y GSQ parcial en capas 0..3; caché KV en Q8_0; el piloto de referencia está en BF16 |
| Idiomas soportados | No disponible (la model card no declara idiomas; solo el tag `conversational`) |
| Licencia | No disponible (el autor remite a `reproduction.json` para licencias de padres, donante y heredadas) |
| Formato de pesos | GGUF (repo `*-GGUF`) y safetensors (tag del repo; el adaptador se distribuye aparte) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de unos 27,3B parámetros, derivado de un checkpoint Qwen3.8 27B. Sobre él se han realizado dos intervenciones: (1) una cuantización IQ3_S con búsqueda de asignación por grupos (RCO de dos actualizaciones globales sobre 496 grupos, y GSQ con seis actualizaciones por capa y 24 en total, restringido a las capas 0..3, que modificó tres payloads serializados y mejoró una capa local de validación dura, dejando las otras 60 capas con los payloads del pool seleccionado); y (2) un injerto MTP con profundidad configurable (se compararon profundidades 1/2/3/4/6/8 y se seleccionó la profundidad 2) que actúa como decodificador especulativo con verificación de tokens nativa. El autor indica explícitamente que el KL global optimizado no se midió y que no se reclama mejora alguna por RCO.

No hay información sobre datos de entrenamiento: no se indica número de tokens, composición del corpus, ni si hubo RLHF, DPO u otra fase de alineamiento posterior. El modelo es un artefacto derivado, con "padres, donante y licencias heredadas" documentadas en `reproduction.json`, y el checkpoint público original (TA) permanece sin cambios; `adapter/` contiene únicamente el adaptador pequeño seleccionado, no un checkpoint BF16 de reemplazo. La innovación técnica destacable es, por tanto, el pipeline de cuantización y el injerto MTP con verificación de borradores (38/40 borradores aceptados, 2 rechazos con rollback en las pruebas nativas), no el entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`), con contexto configurado de 131.072 tokens.
- Recuperación de información en contexto largo: en las siete peticiones de la curva de escala (de 512 a 245.760 tokens de entrada) se recuperaron los tres hechos sintéticos de CONTROL introducidos en el prompt.
- Emisión de JSON: funcional pero con regresiones de formato documentadas; en las pruebas de contexto largo el JSON se entregó con bloques Markdown en las entradas de 61.440, 122.880 y 245.760 tokens, incumpliendo la petición de objeto plano.
- Decodificación especulativa MTP integrada, con profundidad 2 seleccionada y controles de utilidad piloto expuestos (ocho controles).
- Razonamiento numérico básico: una de las cinco salidas fallidas contenía una respuesta numérica correcta acompañada de explicación no solicitada, lo que sugiere capacidad de cálculo pero escaso control de formato.
- Capacidades no documentadas: no se declara soporte de tool calling / function calling, ni de agentes multi-step, ni de visión, audio o modo "thinking" explícito. El tag `endpoints_compatible` indica compatibilidad con endpoints de inferencia, no capacidades adicionales.

## Casos de uso

- Procesamiento por lotes de documentación técnica larga en local: con 131.072 tokens de contexto y recuperación verificada de hechos hasta 245.760 tokens de entrada, el modelo sirve para resumir o extraer datos de repositorios de documentación en máquinas con memoria unificada grande, aceptando latencias de primera token de varios minutos en el extremo alto.
- Extracción de campos con validación posterior obligatoria: el modelo produce JSON correcto en contenido pero puede envolverlo en bloques Markdown, de modo que un pipeline con extracción de bloque ```` ```json ```` y validación de esquema (por ejemplo, con Pydantic) puede aprovechar el artefacto de forma fiable en entornos internos.
- Laboratorio de cuantización e inferencia: es un caso de uso directo como banco de pruebas reproducible para comparar IQ3_S + imatrix, RCO y GSQ parcial frente al piloto BF16, con métricas de aceptación de borradores MTP y calidad de validación por capa.
- Evaluación de decodificación especulativa en hardware de consumo: permite medir aceptación y rollback de borradores MTP en GPUs integradas o discretas modestas, comparando profundidades 1/2/3/4/6/8 sobre prompts técnicos naturales.
- Estación de trabajo de un solo usuario con memoria unificada: el perfil interactivo seleccionado (una sesión, contexto 131.072, caché KV Q8_0, FlashAttention, batch 8192/ubatch 512, 12 hilos, mmap+mlock, MTP profundidad 2) está pensado para ejecución local en un equipo tipo Strix Halo de 64 GB.
- Generación asistida sobre código y documentación de referencia: las pruebas de contexto largo usan documentación y código como relleno, con decodificación sostenida de 9 a 23 tokens/s según longitud de entrada, adecuada para tareas asíncronas o de fondo, no para chat interactivo en el rango alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni ARC). Los únicos datos numéricos son mediciones locales del autor y una criba de utilidad interna:

| Medición | Resultado |
|---|---|
| Criba de utilidad estricta (MTP desactivado) | 3/8 en el GGUF frente a 8/8 del piloto BF16, sobre los mismos prompts tokenizados |
| Aceptación de borradores MTP | 38/40 aceptados, 2 rechazos con rollback |
| Decodificación nativa ponderada (8 casos, 82 tokens emitidos por modo) | 16,3104 → 23,7187 tokens/s (1,454×) |
| Tiempo de pared sumado de las 8 peticiones | 8,043895 s → 7,153561 s (1,124×) |
| llama-bench sin MTP (L4) | 16,1665 tokens/s |
| Benchmark HTTP MTP-on repetitivo (L4) | 26,039–26,245 tokens/s |
| Pico de VRAM (L4) | 12.997 MiB |

Curva de escala en AMD Strix Halo (peticiones HTTP reales con caché fría, muestreo greedy, MTP profundidad 2):

| Tokens de entrada | Tokens emitidos | Contexto asignado | Prefill tok/s | Decode tok/s | Primer token (s) |
|---:|---:|---:|---:|---:|---:|
| 512 | 2.968 | 32.768 | 236,1 | 23,40 | 2,2 |
| 4.096 | 512 | 32.768 | 247,5 | 21,47 | 16,7 |
| 16.384 | 2.048 | 32.768 | 233,3 | 19,97 | 70,4 |
| 30.720 | 1.024 | 32.768 | 214,2 | 18,07 | 143,8 |
| 61.440 | 512 | 65.536 | 180,3 | 15,84 | 340,8 |
| 122.880 | 256 | 131.072 | 135,0 | 12,65 | 910,3 |
| 245.760 | 128 | 262.144 | 87,8 | 9,19 | 2.799,0 |

Advertencias del propio autor: los métodos de medición no son homogéneos (llama-bench frente a HTTP repetitivo frente a decodificación nativa ponderada) y no establecen una aceleración general; la primera token de la entrada máxima tardó 46 min 39 s en el peor caso reportado; y en una comparación 512→2048 tokens las secuencias OFF/ON divergieron en el token 1939 tras 1938 tokens idénticos.

## Requisitos de hardware

- Pesos: 13,4 GB de repo en GGUF IQ3_S dominante; es el suelo práctico de memoria para los pesos.
- VRAM medida: 12.997 MiB de pico en una NVIDIA L4 con MTP activo y ventana corta; el perfil de contexto largo necesita además caché KV Q8_0 proporcional al contexto asignado (32K, 64K, 128K o 256K en las pruebas).
- Memoria unificada: el perfil validado usa 64 GB de UMA en Ryzen AI MAX 385 / Radeon 8050S; el mínimo observado de `MemAvailable` del host durante la curva fue de 11,96 GiB, con GTT global máximo de 29,15 GiB incluyendo otras aplicaciones (las cifras de UMA, GTT y cgroup se solapan y no deben sumarse).
- GPU de consumo: con 13,4 GB de pesos, una GPU de 24 GB (RTX 4090/3090) deja margen para caché KV a contextos moderados; en 16 GB (RTX 4080/4070 Ti Super) el encaje es muy ajustado y exige contextos pequeños o offload a CPU. En 12 GB no cabe con contexto útil.
- Despliegue: llama.cpp es la ruta validada (fuente `547208dca250ceb3e4c8615598d043f2b602a527`, imagen local `qwen38-dense547:vulkan-pc`, backend Vulkan/RADV con Mesa 26.3; HIP y variantes de shader/tile probadas no mostraron mejora general). El tag `gguf` permite otras herramientas compatibles, y la presencia de safetensors abre la puerta a vLLM o TGI, pero no hay ninguna validación publicada de esas rutas en la información disponible.
- Throughput y latencia: 23,4 tokens/s de decodificación con 512 tokens de entrada y 9,19 tokens/s con 245.760; prefill de 236 a 88 tokens/s según longitud; primer token desde 2,2 s hasta 2.799 s. Profundidad MTP 8 degrada a 8,19–9,31 tokens/s, por lo que la profundidad 2 es la recomendada por el autor.
- Nota de viabilidad: el propio autor separa capacidad de latencia útil; a partir de 61.440 tokens de entrada el artefacto es apto para procesos por lotes, no para interacción.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones de terceros en la información proporcionada, por lo que la comparación externa no está disponible. La única comparación interna documentada es con los otros artefactos del mismo autor:

| Artefacto | Parámetros | Contexto | Criba de utilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (GGUF IQ3_S + MTP) | 27,3B | 131.072 por defecto (probado hasta 262.144) | 3/8 | No disponible | Público en HuggingFace, 0 descargas |
| Piloto BF16 de referencia | No disponible | No disponible | 8/8 | No disponible | Referenciado en la model card |
| Checkpoint público original (TA) | No disponible | No disponible | No medido | Heredada, en `reproduction.json` | Público, sin cambios según el autor |
| Motor alternativo ("Nathan engine") | No disponible | No disponible | No medido | No disponible | Construcción local del autor |

Frente a modelos de la misma categoría (27B densos en GGUF), no se aportan cifras de MMLU, HumanEval ni GSM8K que permitan situar este artefacto; cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Estado experimental declarado por el autor: "Experimental: strict utility3/8 versus reference8/8; five instruction-format regressions. Utility screen accepted: false" y "Scientific quality acceptance: false". No debe tratarse como un modelo validado.
- Regresiones de formato: cinco de ocho casos de la criba incumplieron el formato pedido (explicación añadida o JSON envuelto en Markdown). Requiere post-procesado y validación de esquema.
- Cambio de utilidad no aislado: el autor advierte que la diferencia 3/8 frente a 8/8 no puede atribuirse al MTP ni aislarse causalmente entre serialización, cuantización/refinamiento y ejecución en HF frente a llama.cpp.
- Sin evaluación de calidad general ni de rechazo: no se midieron las 72 generaciones completas ni la eficacia de rechazo general, por lo que no se reclama reducción de rechazos ni mejora de calidad.
- Sin aceleración general demostrada: las ganancias de 1,454× en decodificación nativa y 1,124× en tiempo de pared corresponden a ocho casos emparejados y el autor lo califica de observación pequeña, no de afirmación general.
- Riesgo de alucinación: no cuantificado en la información disponible. Las pruebas con hechos sintéticos de CONTROL solo verifican recuperación de información presente en el contexto, no veracidad factual.
- Divergencia en salidas largas: en una comparación OFF/ON de 512 a 2048 tokens las secuencias divergieron en el token 1939, lo que implica que el injerto MTP no garantiza equivalencia bit a bit en todas las longitudes.
- Licencia ausente: sin licencia declarada en el repo y con "licencias heredadas" solo en `reproduction.json`, el uso comercial es jurídicamente indeterminado y no debe asumirse permitido.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluación multilingüe.
- Latencia extrema en contexto largo: hasta 46 min 39 s hasta la primera token en la entrada máxima, lo que invalida casos de uso interactivos en ese régimen.
- Repo sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente de terceros.
- Los resultados de búsqueda web obtenidos no son pertinentes (corresponden a documentación médica sobre displasia arritmogénica del ventrículo derecho y coinciden solo por la cadena "Davd"); no se ha utilizado ninguno de esos enlaces.

## Enlaces

- HuggingFace: https://huggingface.co/Davd-b01/qwen38-27b-swift-noema-GGUF
- `reproduction.json` (licencias de padres, donante y heredadas): referenciado en la model card, dentro del repositorio de HuggingFace
- Carpeta `adapter/` (adaptador pequeño seleccionado): referenciada en la model card, dentro del repositorio de HuggingFace
- Resúmenes públicos de resultados de medición (capas y payloads serializados): mencionados en la model card sin URL disponible
- llama.cpp, revisión `547208dca250ceb3e4c8615598d043f2b602a527`: referenciada como fuente del build local, sin URL explícita en la información disponible
- Documentación de Qwen: no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible
