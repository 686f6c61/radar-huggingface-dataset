# LvcidPsyche/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es un checkpoint derivado de `deepseek-ai/DeepSeek-V4.1-Flash`, publicado por el usuario LvcidPsyche (equipo dealignai), en el que se ha aplicado una ablación a nivel de pesos ("abliteration") para eliminar los mecanismos de rechazo del modelo base. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es el mismo checkpoint con los pesos modificados quirúrgicamente, de forma que se carga exactamente igual que el modelo original, sin `model.py` personalizado, hooks de ejecución ni vectores de dirección.

El modelo conserva la arquitectura multimodal y de mezcla de expertos del base: 763.205.315.794 parámetros totales según los safetensors del repositorio (510,3 GB en disco en su mezcla nativa FP8/FP4), decodificador causal con 20+20 capas, 384 expertos enrutados con top-6 más un experto compartido, atención dispersa CSA2, memoria n-gram Engram, cabeza especulativa DSpark y una torre de visión DeepSeek-ViT. La ventana de contexto declarada es de 1 millón de tokens y el pipeline es `image-text-to-text`.

Su relevancia es doble. Por un lado, documenta el estado del arte en arquitecturas MoE multimodales de escala frontera y en formatos de cuantización nativa de bajo bit. Por otro, es un caso de estudio de investigación en seguridad: el autor publica métricas de HarmBench-320 y MMLU-14k que cuantifican el coste de eliminar los guardarraíles (100 % de tasa de cumplimiento en peticiones dañinas frente al 1,56-42,81 % del base). El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y la licencia declarada es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador causal encoder-decoder (20+20 capas), MoE con 384 expertos enrutados (top-6) + 1 experto compartido, Hyper-Connections (residual de 4 canales), atención dispersa CSA2, memoria n-gram Engram y cabeza de borrador especulativa DSpark |
| Parámetros totales | 763.205.315.794 (~763,2 B) según los safetensors; la model card menciona un backbone de 552 B, discrepancia no explicada |
| Parámetros activos | 8 B/16 B por token (según la model card; la cifra es ambigua y no se especifica si son dos configuraciones o un rango) |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantización | Nativa FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32]; expertos enrutados en FP4 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo encoder-decoder con 20 capas de encoder y 20 de decodificador, organizado como mezcla de expertos de grano fino: 384 expertos enrutados con selección top-6 más un experto compartido siempre activo. Incorpora Hyper-Connections, un esquema de conexiones residuales de 4 canales, y atención dispersa CSA2, que reduce el coste del mecanismo atencional en contextos muy largos. La memoria Engram aporta un componente de memoria basada en n-gramas, y la cabeza DSpark implementa decodificación especulativa con un borrador interno, lo que permite acelerar la generación sin un modelo draft externo. La torre de visión es DeepSeek-ViT con RoPE bidimensional y pixel unshuffle, encargada de la entrada de imágenes.

El autor no documenta el entrenamiento del modelo base ni el proceso de abliteración más allá de su carácter "quirúrgico y a nivel de pesos": no hay número de tokens, composición del dataset, ni detalles de RLHF/DPO/RLVR. Lo que sí se afirma es que todos los componentes críticos para las capacidades (expertos enrutados, memoria Engram, atención dispersa CSA2, cabeza DSpark, torre de visión, puertas del router, normalizaciones y embeddings) quedan idénticos byte a byte al base, y que solo se elimina la "circuitería de rechazo". El autor declara que la modificación preserva MMLU, visión, razonamiento, MTP (DSpark) y coherencia multiturno, con una pérdida declarada de 1,1 pp en MMLU excluyendo el cluster de ética.

## Capacidades

- Generación de texto y razonamiento en modo "effort=off" y "effort=max" (razonamiento explícito por defecto en el segundo), con trazas de razonamiento verificables.
- Procesamiento multimodal de entrada `image-text-to-text`: la torre DeepSeek-ViT con 2D-RoPE y pixel unshuffle se mantiene intacta, por lo que conserva comprensión de imágenes.
- Capacidades de código y matemáticas heredadas del base, aunque sin cifras específicas de HumanEval, GSM8K o SWE-bench en la información disponible.
- Uso de herramientas y function calling: la model card menciona explícitamente "vision + tools", pero no detalla el esquema de tool calling ni los formatos soportados.
- Contexto extremadamente largo (1 M tokens), apto para razonamiento multi-paso sobre documentos extensos.
- Decodificación especulativa integrada mediante la cabeza DSpark, que acelera la inferencia.
- Capacidad de razonamiento multiturno preservada según el autor.
- Ausencia total de rechazos: la modificación elimina los mecanismos de negativa y de matización en contenido dañino (véase "Limitaciones y advertencias").

## Casos de uso

- Investigación en seguridad y alineación: el modelo sirve como objeto de estudio controlado para medir cuánto de la capacidad de un modelo frontera depende de su circuitería de rechazo. Las tablas de HarmBench-320 y MMLU-14k del propio autor permiten cuantificar el intercambio entre cumplimiento y precisión de conocimiento.
- Red-teaming y evaluación de clasificadores: al generar cumplimiento del 100 % en las siete categorías semánticas de HarmBench, es un generador de casos adversarios para probar filtros de moderación, clasificadores de contenido y sistemas de detección en pipelines de seguridad.
- Análisis de documentación técnica extensa: con 1 M tokens de contexto puede ingerir manuales completos, expedientes o bases de código y responder preguntas que requieren correlacionar información distribuida a lo largo de cientos de miles de tokens.
- Procesamiento multimodal de documentos: al conservar la torre de visión, puede extraer información de diagramas, planos, capturas de pantalla o páginas escaneadas combinadas con texto largo en un mismo contexto.
- Agentes autónomos multi-paso: la combinación de contexto de 1 M tokens, decodificación especulativa y soporte declarado de herramientas lo hace apto para bucles de agente que acumulan historial largo, siempre que se añada una capa externa de validación.
- Asistencia a la generación de código en pipelines internos: integrable vía `transformers` en entornos de CI/CD para revisión, refactorización o generación de tests sobre repositorios grandes que caben en el contexto.
- Extracción estructurada de información a gran escala: clasificación y normalización de corpus heterogéneos (contratos, informes, registros) donde la ventana de 1 M tokens evita estrategias de chunking y recuperación.
- Auditoría de sesgo y de comportamiento en modelos abliterados: comparación sistemática contra el modelo base para aislar qué comportamientos cambian y cuáles se preservan.

## Benchmarks y rendimiento

HarmBench-320, evaluación completa 2×2 (base vs. versión modificada, `effort=off` vs. `effort=max`), temperatura 0, decodificación voraz. Cada respuesta se clasifica en cuatro niveles (HARD_REF / SOFT_RED / HEDGE / COMPLY).

| Evaluación | ASR base | ASR modificado | Δ (pp) |
|---|---:|---:|---:|
| HB-320 effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320 effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Desglose por categoría semántica de HarmBench:

| Categoría | Ítems | Base off | Modificado off | Base max | Modificado max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k (conjunto de test completo, logits del modelo base, temperatura 0):

| Build | Correctas | Precisión | Δ |
|---|---:|---:|---:|
| base | 12 211 / 14 042 | 86,96 % | — |
| modificado | 11 619 / 14 042 | 82,74 % | -4,22 pp |

Excluyendo el cluster de ética (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), la caída sobre los ~11 000 ítems restantes es de -1,1 pp. La mayor degradación por asignatura se concentra en moral_scenarios (76,9 % → 37,0 %, -39,89 pp) y professional_law (75,9 % → 68,8 %, -7,04 pp). El autor declara cero HARD_REF, cero SOFT_RED y cero HEDGE en la versión modificada en ambos niveles de esfuerzo.

No se han publicado en la información disponible resultados de HumanEval, GSM8K, SWE-bench, MMMU ni benchmarks multilingües.

## Requisitos de hardware

- Peso en disco: 510,3 GB en el repositorio (mezcla nativa FP8 para pesos generales y FP4 para expertos enrutados). Para inferencia en FP8/FP4 nativo hay que reservar un espacio equivalente en VRAM o en memoria unificada.
- VRAM estimada: ~510-540 GB solo para pesos, más el caché KV. Con una ventana de 1 M tokens, el caché KV es el factor dominante y no se dispone de cifras publicadas sobre su tamaño por token.
- Configuración mínima realista: 8× H100 80 GB (640 GB) o 8× A100 80 GB (640 GB) para pesos y un margen muy ajustado; para explotar contexto largo se recomienda 16× H100 80 GB.
- GPU consumer: no cabe en ninguna GPU de consumo. Una RTX 4090 de 24 GB solo podría ejecutarlo con offload masivo a disco o RAM, con latencias inutilizables para producción.
- Opciones de despliegue: `transformers` (librería declarada), y por compatibilidad de formato FP8, servidores como vLLM o SGLang con soporte de cuantización FP8 por bloques. Formatos GGUF/llama.cpp u Ollama no están disponibles en la información proporcionada y no son viables a esta escala.
- Latencia y throughput: no disponible. La decodificación especulativa DSpark debería mejorar el throughput respecto a una decodificación autoregresiva estándar, pero no se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763,2 B totales (8 B/16 B activos, según model card) | 1 M tokens | Sí (DeepSeek-ViT) | MIT | Publicado en HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | No disponible en detalle (el derivado cita 552 B de backbone) | 1 M tokens | Sí | No disponible | Modelo de referencia del que deriva |

No se dispone en la información proporcionada de datos verificables de otros modelos comparables de la misma categoría (por ejemplo, alternativas MoE multimodales de escala frontera), por lo que la comparativa con terceros queda como no disponible. La única comparación con datos es contra el propio modelo base, cuyos resultados en HarmBench-320 y MMLU-14k se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- Eliminación deliberada de los guardarraíles: el modelo reporta un 100 % de cumplimiento en las siete categorías de HarmBench-320, incluidas `chemical_biological`, `cybercrime_intrusion` e `illegal`. No debe desplegarse en aplicaciones orientadas al público ni sin una capa externa de moderación y validación.
- Riesgo alto de contenido dañino, ilegal o desinformativo. La licencia MIT no exime de responsabilidad legal por el uso que se haga del modelo; en la Unión Europea, el uso podría quedar sujeto a obligaciones del AI Act y a la normativa sobre contenidos ilícitos.
- Degradación medible de conocimiento: -4,22 pp en MMLU-14k global y -1,1 pp excluyendo el cluster de ética. La caída es especialmente severa en moral_scenarios (-39,89 pp) y professional_law (-7,04 pp), lo que indica que el juicio normativo y legal está comprometido.
- El comportamiento en `effort=max` del base (1,56 % de cumplimiento) frente al modificado (100 %) sugiere que el razonamiento del modelo modificado ya no activa consideraciones de seguridad antes de responder.
- Sesgos: no se documenta ninguna evaluación de sesgo demográfico, político o cultural. La abliteración puede alterar de forma no controlada el comportamiento en dominios sensibles más allá del rechazo explícito.
- Alucinación: sin datos publicados de tasas de alucinación ni de evaluación de fidelidad factual. La pérdida de precisión en MMLU es un indicio de posible degradación factual.
- Idiomas: no disponible. No se especifica si se conservan las capacidades multilingües del base ni en qué idiomas.
- Discrepancia de especificaciones: los safetensors declaran 763,2 B de parámetros mientras la model card habla de un backbone de 552 B; la cifra de parámetros activos "8 B/16 B por token" es ambigua. Conviene verificarlas antes de dimensionar infraestructura.
- Repositorio sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, metadatos creados y actualizados con dos segundos de diferencia y sin revisión independiente de los resultados de HarmBench ni de MMLU.
- Coste de despliegue prohibitivo para la mayoría de equipos (más de 500 GB de pesos), incluso aunque la licencia sea permisiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LvcidPsyche/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del coautor en X: https://x.com/jordanschenck
- Enlaces relevantes adicionales: no se han encontrado en la búsqueda web (los resultados devueltos corresponden a portales de compraventa de vehículos y no guardan relación con el modelo). No se dispone de paper, blog técnico ni repositorio de código asociados en la información proporcionada.
