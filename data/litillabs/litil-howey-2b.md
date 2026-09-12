# litillabs/LiTiL-Howey-2b

## Resumen

LiTiL-Howey-2b es un adaptador LoRA de tipo PEFT desarrollado por LiTiL Labs sobre el modelo base Qwen3.5-2B, de aproximadamente 2 000 millones de parámetros. No es un modelo de propósito general: es un componente especializado que aplica el test de Howey —el criterio judicial estadounidense para determinar si un acuerdo constituye un contrato de inversión— sobre un conjunto de hechos numerados y devuelve un JSON estricto con la evaluación de cada uno de los cuatro factores (inversión de dinero, empresa común, expectativa de beneficios y esfuerzos de terceros) junto al identificador de la evidencia que respalda cada ruta.

El modelo resuelve un problema de enrutamiento estructurado y de vocabulario cerrado: recibe una tarjeta de autoridad fija (versión `howey-card-historical-2026-07-10`) más declaraciones de evidencia etiquetadas como `E1`, `E2`, etc., y clasifica cada factor como `supported`, `unsupported` o `unclear`, preservando siempre el ID de evidencia. El adaptador ocupa 93 442 816 bytes y se distribuye únicamente en formato safetensors, por lo que el modelo base es obligatorio para poder ejecutarlo.

Su relevancia actual se enmarca en el análisis de criptoactivos y el cumplimiento normativo: ofrece una salida determinista y validable que puede alimentar una matriz de factores revisable por un equipo legal, sin necesidad de recurrir a un juez LLM. El modelo está entrenado únicamente en inglés (idioma `en`), se publicó el 11 de septiembre de 2026 y su licencia es `other`, no estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre transformer decoder-only (modelo base Qwen3.5-2B); no se especifica la arquitectura interna del base más allá de su familia |
| Parametros totales | Aproximadamente 2 000 millones en el modelo base (Qwen3.5-2B); el adaptador LoRA se distribuye como tensor de 93 442 816 bytes (93,4 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se publica en safetensors; las cuantizaciones aplicables dependen del modelo base y no se documentan en la información disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (licencia no estándar; consultar los términos del repositorio y los del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA PEFT; requiere el modelo base `Qwen/Qwen3.5-2B`, revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`) |

Datos adicionales de trazabilidad: revisión de la fuente evaluada `8b0424189441e26b0f7f7ca27b97174763ca4620`, SHA-256 del tensor del adaptador `754a2a9237987dbaa4d02a7ddce8a2f4ee891f9b3df7b28cc9abe78379024ea7`, tamaño del repositorio 0,1 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT) obtenido mediante ajuste supervisado (SFT) sobre Qwen3.5-2B. El contrato de entrada es fijo: se envía el system prompt completo, un mensaje de usuario con la tarjeta de autoridad en su versión `howey-card-historical-2026-07-10`, una cabecera `Evidence record:` y declaraciones numeradas de forma única (`E1`, `E2`, …), cada una con un hecho o una declaración explícita de incertidumbre. Se permiten distractores no relacionados. El contrato de salida exige exactamente dos claves, `factor_routes` y `authority_ids`; cada ruta de factor contiene exactamente un `connection_id` y un ID de evidencia presente en la petición, y `authority_ids` debe incluir `HOWEY`, con `FORMAN`, `EDWARDS` y `TELEGRAM` como IDs secundarios permitidos solo cuando la regla indicada en la tarjeta coincide con la evidencia seleccionada.

El conjunto de entrenamiento consta de 384 filas procedentes de 48 familias de combinaciones de factores, más 48 filas de ajuste fino (*tuning*) provenientes de 12 familias. Las familias de combinaciones de factores de entrenamiento, ajuste y desarrollo son disjuntas. La evaluación se realizó sobre 21 casos sintéticos de desarrollo que cubren 84 espacios de factor, con recuento independiente de las salidas guardadas. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO; el procedimiento descrito es SFT sobre LoRA. La innovación principal no es arquitectónica sino de interfaz: vocabulario de salida cerrado, JSON determinista y trazabilidad obligatoria de cada decisión a un ID de evidencia, lo que permite validación por esquema en lugar de evaluación por juez LLM.

## Capacidades

- Enrutamiento de evidencia a los cuatro factores del test de Howey: `investment_of_money`, `common_enterprise`, `expectation_of_profits` y `efforts_of_others`.
- Clasificación ternaria por factor: `supported`, `unsupported` o `unclear`, con vocabulario cerrado de `connection_id` por factor y estado (por ejemplo, `value_contributed`, `no_value_contributed`, `value_exchange_unresolved`).
- Trazabilidad estricta: cada ruta devuelve un ID de evidencia que existe en la petición, lo que permite mostrar la frase de evidencia citada junto a cada evaluación.
- Salida JSON determinista y validable por esquema, apta para validación automática sin juez LLM.
- Asignación de autoridades: emite `HOWEY` obligatoriamente y los IDs secundarios `FORMAN`, `EDWARDS` y `TELEGRAM` cuando la regla de la tarjeta coincide con la evidencia seleccionada.
- Tolerancia a distractores: admite declaraciones de evidencia no relacionadas en la entrada sin que se enruten a un factor.
- Manejo explícito de incertidumbre mediante rutas `unclear` en lugar de forzar una conclusión binaria.
- Capacidad multilingüe: limitada al inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento (*thinking*), visión o audio: no disponibles; el modelo es exclusivamente de generación de texto estructurado.
- Comportamiento agéntico multi-paso: no documentado; el modelo está diseñado como componente único de enrutamiento, no como agente autónomo.

## Casos de uso

- **Triaje de expedientes en cumplimiento normativo de criptoactivos:** un proceso previo recopila y numera los hechos de una oferta o token; el modelo reparte esa evidencia entre los cuatro factores y devuelve un JSON que un equipo de compliance revisa como punto de partida antes de decidir si el acuerdo puede calificarse como contrato de inversión.
- **Preparación de matrices de factores para bufetes:** el adaptador genera la matriz factor-evidencia (`connection_id` + `evidence_id`) que alimenta una plantilla de memorándum; el abogado solo tiene que validar las rutas, ya que la salida cita la frase de evidencia concreta en lugar de ofrecer una conclusión sin respaldo.
- **Automatización de *due diligence* en procesos de inversión:** integrado en un pipeline que extrae cláusulas de documentación de una ronda (SAFT, términos de *staking*, acuerdos de reparto de ingresos) y las numera como evidencia; el modelo clasifica cada factor y marca como `unclear` lo que no está cubierto, señalando los huecos documentales a solicitar.
- **Validación en CI/CD de productos jurídicos:** al emitir un JSON con esquema fijo, la salida puede validarse automáticamente contra un JSON Schema en un pipeline de integración continua; cualquier respuesta no conforme se detecta y se rechaza, algo inviable con un modelo generativo de formato libre.
- **Escalado humano basado en incertidumbre:** las rutas `unclear` (`value_exchange_unresolved`, `pooling_unresolved`, `profit_expectation_unresolved`, `essential_maintenance_unresolved`) funcionan como señal de escalado; el sistema solo envía a revisión humana los factores no resueltos, reduciendo el volumen de revisión manual.
- **Monitorización continua de listados de tokens:** en un exchange o plataforma de listado, alimentar el modelo con hechos actualizados de cada activo y comparar la matriz de factores resultante entre versiones permite detectar cambios en la estructura de la oferta (por ejemplo, paso de operación descentralizada a trabajo esencial del promotor).
- **Análisis comparado de jurisprudencia relacionada:** el uso de `authority_ids` secundarios (`FORMAN`, `EDWARDS`, `TELEGRAM`) permite que la salida indique qué precedente respalda la ruta seleccionada, útil para construir tablas comparativas entre casos.
- **Formación interna de equipos legales y de producto:** servir la salida del modelo como ejemplo etiquetado y trazable para explicar cómo se aplica cada factor del test de Howey sobre hechos concretos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la *model card* y en el `model-index`. La evaluación se realizó sobre 21 casos sintéticos de desarrollo (84 espacios de factor) con las familias de combinaciones de factores disjuntas entre entrenamiento, ajuste y desarrollo. Las métricas del `model-index` están marcadas como `verified: false`.

| Metrica | Qwen3.5-2B base | LiTiL-Howey-2b (adaptador) |
|---|---:|---:|
| Conexiones de factor correctas | 34 / 84 | 84 / 84 |
| IDs de evidencia correctos | 69 / 84 | 84 / 84 |
| Pares factor-evidencia exactos | 33 / 84 | 84 / 84 |
| Las cuatro rutas correctas | 1 / 21 | 21 / 21 |
| JSON válido | 21 / 21 | 21 / 21 |
| IDs de autoridad no soportados | 0 | 0 |

Métricas agregadas declaradas en el `model-index` para la tarea "Closed-universe factor and evidence routing" sobre el conjunto "Howey v6 synthetic development set": precisión de conexión de factores 1,0; precisión de ID de evidencia 1,0; precisión de las cuatro rutas completas 1,0.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor indica que el resultado mide enrutamiento bajo una tarjeta de autoridad suministrada y un vocabulario de salida fijo, por lo que no es extrapolable a razonamiento jurídico abierto.

## Requisitos de hardware

- VRAM estimada para inferencia (el adaptador añade 93,4 MB a los pesos del base de ~2 000 millones de parámetros): aproximadamente 5-6 GB en FP16/BF16 incluyendo caché KV y sobrecarga del runtime; alrededor de 2,5-3,5 GB en cuantización INT8; en torno a 1,5-2,5 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para despliegue en servidor, A100, H100 o L40S, aunque están sobredimensionadas para un modelo de 2B.
- Cabe en GPU de consumo: sí. Con cuantización de 4 bits funciona en GPUs de 4-6 GB; en FP16 requiere al menos unos 6 GB de VRAM libre.
- Inferencia en CPU: posible únicamente con formatos GGUF mediante llama.cpp/Ollama, con latencias no documentadas.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el modelo base), vLLM con soporte LoRA (`--enable-lora`), TGI con adaptadores, y llama.cpp/Ollama previa conversión del base a GGUF y aplicación del adaptador LoRA.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

La información disponible solo permite comparar el adaptador con su propio modelo base, ya que no se documentan otros adaptadores jurídicos o de enrutamiento de evidencia comparables.

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiTiL-Howey-2b | ~2 000 M (base) + adaptador LoRA de 93,4 MB | No disponible | 84/84 conexiones de factor, 84/84 IDs de evidencia, 21/21 rutas completas correctas | `other` | HuggingFace (`litillabs/LiTiL-Howey-2b`) |
| Qwen3.5-2B (base, sin adaptador) | ~2 000 M | No disponible | 34/84 conexiones de factor, 69/84 IDs de evidencia, 1/21 rutas completas correctas | No disponible en esta ficha | HuggingFace (`Qwen/Qwen3.5-2B`) |
| Otros adaptadores legales o de enrutamiento estructurado | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos sobre alternativas de la misma categoría (tamaño de 2B, dominio jurídico o enrutamiento de evidencia con salida JSON cerrada). Cualquier comparación con modelos de mayor tamaño quedaría fuera del propósito específico de este adaptador.

## Limitaciones y advertencias

- **No es asesoramiento jurídico.** El modelo genera una evaluación estructurada de factores bajo una tarjeta de autoridad fija; su salida debe ser revisada por un profesional cualificado antes de cualquier uso decisorio.
- **Dominio extremadamente estrecho.** Solo sabe aplicar el test de Howey con el vocabulario cerrado descrito. Fuera de ese contrato de entrada y salida no ofrece garantías de comportamiento útil.
- **Idioma único.** Está entrenado y etiquetado únicamente en inglés; su rendimiento en castellano u otros idiomas no está documentado ni evaluado.
- **Evaluación sobre datos sintéticos y de tamaño reducido.** Las métricas de 100 % proceden de 21 casos sintéticos de desarrollo con 84 espacios de factor, generados por el propio autor. No hay validación sobre expedientes reales, ni conjuntos de prueba independientes, ni evaluación por terceros.
- **Métricas no verificadas.** Los resultados del `model-index` están marcados como `verified: false`; proceden del autor del modelo.
- **Riesgo de alucinación en los IDs de evidencia.** El contrato exige que cada ruta cite un ID existente en la petición, pero un modelo de 2B puede degradarse ante entradas largas, numeraciones atípicas o evidencia ambigua; es obligatorio validar que los IDs citados existen y que el JSON cumple el esquema antes de usar la salida.
- **Sensibilidad al formato de entrada.** Requiere la tarjeta de autoridad en la versión `howey-card-historical-2026-07-10` y la cabecera `Evidence record:` con declaraciones numeradas. Cambios en el prompt de sistema o en la numeración pueden invalidar el comportamiento observado, que se midió con una revisión concreta del modelo base.
- **Dependencia del modelo base.** El adaptador no funciona de forma autónoma: hay que cargar `Qwen/Qwen3.5-2B`. La licencia y las restricciones del base se suman a las del adaptador.
- **Licencia `other`.** No es una licencia estándar tipo Apache 2.0 o MIT; es imprescindible revisar los términos del repositorio y del modelo base antes de cualquier uso comercial o redistribución.
- **Madurez y adopción nulas.** El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación de la comunidad que permitan contrastar el comportamiento declarado.
- **Sesgo potencial del vocabulario cerrado.** Al forzar cada factor a un conjunto finito de conexiones, los casos límite o híbridos pueden quedar mal representados; el uso de la ruta `unclear` mitiga, pero no elimina, este riesgo.
- **Sin datos de sesgo demográfico ni de robustez.** No se documentan evaluaciones de sesgo, toxicidad, robustez ante prompts adversarios ni comportamiento ante datos personales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litillabs/LiTiL-Howey-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
- Enlaces adicionales de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados de búsqueda disponibles no guardan relación con LiTiL-Howey-2b.
