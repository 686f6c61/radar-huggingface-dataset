# chanderbalaji/harrier-gst-embed-v1

## Resumen

`harrier-gst-embed-v1` es un modelo de embeddings de recuperación semántica especializado en el derecho del Impuesto sobre Bienes y Servicios (GST) de la India. Se trata de un ajuste fino mediante LoRA del modelo base `microsoft/harrier-oss-v1-0.6b` (arquitectura Qwen3, 0,6 mil millones de parámetros, 1024 dimensiones, pooling de último token), desarrollado por Shikhar Pant y publicado bajo licencia MIT. El modelo está diseñado para vincular consultas de profesionales del derecho (incluyendo citas de estatutos como «sección 138 de la CGST Act, compounding of offences») con la disposición correcta dentro de un corpus legal de 189 000 fragmentos que incluye leyes, reglas, notificaciones CBIC, circulares, sentencias de tribunales y avisos GSTN/NIC.

Su relevancia actual radica en que aborda un problema específico de la recuperación legal: las colisiones entre números de sección de diferentes estatutos (por ejemplo, la sección 138 existe en varias leyes distintas) y la necesidad de distinguir entre consultas con terminología técnica, escenarios fácticos y referencias estatutarias. Además, incorpora embeddings Matryoshka (1024/512/256 dimensiones) entrenados explícitamente, lo que permite truncar las representaciones a 256 dimensiones conservando aproximadamente el 89 % del margen de recuperación a 1024 dimensiones, una propiedad útil para despliegues con restricciones de almacenamiento o latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder) con pooling de último token, ajuste fino LoRA |
| Parametros totales | 596 049 920 (0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración verificada con llama.cpp) |
| Tipos de cuantizacion | Q8_0 GGUF (verificado); otros formatos no especificados |
| Idiomas soportados | Inglés, hindi (consultas con mezcla Hinglish; pasajes solo en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/harrier-oss-v1-0.6b`, un modelo de embeddings de Microsoft con arquitectura Qwen3, 1024 dimensiones de salida y pooling de último token. Sobre esta base se aplicó un adaptador LoRA con r=32, α=64, dropout 0,05 y objetivos lineales en todas las capas, lo que añade aproximadamente 20,2 millones de parámetros entrenables. La función de pérdida fue `MultipleNegativesRankingLoss` con cinco negativos duros por fila, envuelta en `MatryoshkaLoss` con dimensiones 1024/512/256 y pesos 1,0/0,5/0,25, lo que instala la capacidad Matryoshka de forma nativa en el modelo (el base no la tenía).

El conjunto de entrenamiento consistió en 23 997 pares sintéticos de consulta-pasaje (más 500 de desarrollo), generados con un servidor local Qwen3.8-27B sobre una muestra estratificada de 10 000 fragmentos del corpus legal GST (legislación 16 %, notificaciones 35 %, sentencias 20 %, circulares 15 %, reglas 10 %, avisos y formularios 4 %). El 16 % de las consultas incluían citas estatutarias y aproximadamente el 5 % eran Hinglish. Los negativos duros se extrajeron mediante BM25 y pares deliberados de colisión de número de sección entre estatutos distintos. Se aplicaron filtros de verificación de referencias legales, guardas de longitud y deduplicación exacta y por n-gramas. El entrenamiento duró dos épocas, con tamaño de lote 16, tasa de aprendizaje 1e-4, warmup del 5 %, precisión bf16 y checkpointing de gradientes, totalizando 3000 pasos.

## Capacidades

- Recuperación semántica especializada en el corpus legal GST de la India: leyes, reglas, notificaciones CBIC, circulares, sentencias de tribunales y avisos GSTN/NIC.
- Embeddings Matryoshka entrenados: soporta truncamiento a 1024, 512 o 256 dimensiones con renomalización coherente (256-d conserva ~89 % del margen a 1024-d).
- Manejo de consultas con citas estatutarias (p. ej., «sección 138 de la CGST Act»), terminología técnica, lenguaje llano de profesional y escenarios fácticos.
- Resistencia a colisiones entre números de sección de diferentes estatutos indios (defecto específico optimizado).
- Soporte de instrucciones en la consulta: el modelo espera un prefijo `Instruct: ...\nQuery: ...` para consultas, mientras que los pasajes se codifican sin prefijo.
- Compatibilidad con `sentence-transformers` y con `llama.cpp` (servidor de embeddings con pooling de último token).
- Multilingüismo limitado: consultas en inglés e Hinglish; pasajes solo en inglés.

## Casos de uso

- Búsqueda legal en despachos de abogados: un profesional introduce una consulta como «plazo para emitir factura de impuestos en suministro continuo» y el modelo recupera la sección correspondiente de la CGST Act, reduciendo el tiempo de localización de normativa.
- Asistencia a asesores fiscales: consultas con citas estatutarias ambiguas (p. ej., «sección 138 de la CGST Act, compounding of offences») se resuelven correctamente frente a pasajes de otros estatutos con el mismo número de sección.
- Construcción de sistemas RAG sobre legislación GST: el modelo sirve como componente de recuperación en un pipeline híbrido léxico-vectorial-grafo, mejorando la precisión de la primera etapa frente al modelo base.
- Revisión de notificaciones y circulares CBIC: permite buscar circulares o instrucciones relevantes a partir de descripciones fácticas de un caso, incluso cuando el usuario no conoce la referencia exacta.
- Análisis de jurisprudencia: recuperación de sentencias de tribunales superiores y del Tribunal Supremo relacionadas con un escenario concreto, útil para preparar alegaciones o informes.
- Despliegue en producción con restricciones de recursos: gracias a los embeddings Matryoshka, se puede almacenar solo 256 dimensiones por documento (reducción de 4× en espacio) manteniendo una calidad de recuperación aceptable, adecuado para bases de datos vectoriales de gran tamaño.
- Integración en herramientas de cumplimiento fiscal: automatización de la búsqueda de disposiciones aplicables a un caso de negocio, con verificación posterior contra fuentes primarias.

## Benchmarks y rendimiento

El autor declara resultados sobre un conjunto de desarrollo interno sintético de 500 pares con negativos duros extraídos por BM25. No se han publicado resultados en MTEB ni en otros benchmarks públicos.

| Metrica | Base (harrier-oss-v1-0.6b) | Fine-tuned | Δ |
|---|---|---|---|
| Margen @1024d | 0,0392 | **0,1784** | 4,6× |
| Margen @512d | 0,0288 | **0,1684** | 5,8× |
| Margen @256d | 0,0191 | **0,1597** | 8,4× |

Tasa de fallo por estilo de consulta @256d (negativo duro supera al positivo verdadero):

| Estilo | Base fail-rate | FT fail-rate |
|---|---|---|
| Con cita estatutaria | 28 % | **5 %** |
| Termino tecnico | 39 % | 17 % |
| Lenguaje llano de profesional | 42 % | 22 % |
| Escenario / patron factico | 41 % | 22 % |

Además, se verificó que el redondeo Q8_0 GGUF frente a los pesos fusionados fp32 mantiene una similitud coseno ≥ 0,9988 tanto a 1024 como a 256 dimensiones.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~0,6B parámetros. En fp32 ocupa aproximadamente 2,4 GB; en Q8_0 GGUF, alrededor de 0,6 GB. Cabe sin problemas en cualquier GPU consumer moderna (8 GB o más).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q8_0; para fp32 se recomienda 4-6 GB. Ejemplos: RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100.
- Despliegue: compatible con `sentence-transformers` (Python) y con `llama.cpp` / `llama-server` (modo embedding, pooling de último token, contexto 8192). También puede servirse mediante vLLM o TGI si se adapta, aunque no está documentado explícitamente.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño reducido, se espera una latencia de pocos milisegundos por lote pequeño en GPU consumer y throughput alto en servidores dedicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Especializacion |
|---|---|---|---|---|---|
| harrier-gst-embed-v1 | 0,6B | 8192 | 1024/512/256 (MRL) | MIT | Derecho GST indio |
| microsoft/harrier-oss-v1-0.6b (base) | 0,6B | 8192 | 1024 | MIT | Multilingue general (94 idiomas) |
| bge-m3 (BAAI) | 0,57B | 8192 | 1024 | MIT | Multilingue general, retrieval denso+esparso |
| e5-mistral-7b-instruct | 7B | 32768 | 4096 | MIT | Multilingue, retrieval con instrucciones |

No se dispone de comparaciones directas en benchmarks públicos entre `harrier-gst-embed-v1` y estos modelos. La ventaja del modelo evaluado es su especialización en el dominio legal GST indio, donde supera claramente a su base (4,6× a 8,4× en margen), mientras que los modelos generalistas ofrecerían un rendimiento inferior en este dominio específico sin ajuste.

## Limitaciones y advertencias

- Evaluado únicamente sobre un conjunto de desarrollo interno sintético; no hay resultados en MTEB ni en benchmarks públicos de retrieval legal. La calidad en dominios generales se hereda del modelo base, no se ha mejorado.
- Las consultas están en inglés (con una pequeña fracción Hinglish); los pasajes solo en inglés. No soporta otros idiomas indios ni español.
- El entrenamiento se centró en colisiones entre estatutos indios; puede no generalizar a colisiones de otros sistemas legales.
- El modelo es una ayuda de recuperación sobre texto legal, no proporciona asesoramiento jurídico. Las salidas deben verificarse contra fuentes primarias.
- El conjunto de datos de entrenamiento no se distribuye con el modelo; solo se generaron consultas a partir de texto legal público indio.
- Para un uso correcto en producción, es obligatorio usar pooling de último token (en llama.cpp, `--pooling last`); el pooling por defecto produce resultados incorrectos.
- Las consultas deben llevar el prefijo de instrucción; los pasajes no deben llevarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chanderbalaji/harrier-gst-embed-v1
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Pagina del modelo base en Microsoft Foundry Labs: https://labs.ai.azure.com/innovations/harrier-oss-v1/
- Blog de referencia sobre embeddings en 2026 (menciona el ecosistema): https://zc277584121.github.io/rag/2026/03/20/embedding-models-benchmark-2026.html
