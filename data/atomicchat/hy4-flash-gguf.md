# AtomicChat/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por Tencent, con 218.938.353.741 parámetros totales según los pesos en safetensors. De ellos, 155.500 millones corresponden a la red principal (512 expertos enrutados, 16 activos por token, 11.300 millones de parámetros activos) y 63.500 millones a Engram, una tabla de embeddings de bigramas y trigramas aprendidos que se consulta por hash. El modelo procesa texto e imágenes y declara una ventana de contexto de 1 millón de tokens.

La relevancia de esta ficha concreta reside en que se trata de una cuantización GGUF experimental publicada por AtomicChat, no del modelo original. El objetivo declarado es hacer viable la inferencia de un modelo de 220.000 millones de parámetros en máquinas de 64 GB de memoria, manteniendo los expertos enrutados a unos 2.3 bits por peso, el resto de la red en Q8_0 y la tabla Engram en un fichero separado que puede permanecer en el SSD. Es, por tanto, una pieza pensada para despliegues locales con limitaciones severas de VRAM.

El precio de esa compresión es medible: el autor reporta una divergencia KL media de 0.725 frente a su conversión BF16 de los pesos originales, con un 76.4 % de coincidencia en el token más probable. La model card lo describe explícitamente como una build experimental, y requiere una versión de llama.cpp con soporte para Hy4-flash (PR abierto), por lo que ni LM Studio ni Ollama ni el llama.cpp estándar cargan estos ficheros todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (512 expertos enrutados, 16 activos por token) más tabla Engram de embeddings de bigramas y trigramas consultada por hash; proyector de visión para entrada de imagen |
| Parametros totales | 218.938.353.741 (155.5B en la red, 63.5B en Engram) |
| Parametros activos | 11.3B por token |
| Longitud de contexto | 1.000.000 tokens (declarado por el modelo base) |
| Tipos de cuantizacion | IQ2_S (proyecciones down de expertos), IQ2_XXS (gate/up de expertos), Q8_0 (resto de la red), Q4_0 (tabla Engram); media de 2.52 bits por peso en el fichero principal |
| Idiomas soportados | no disponible (la model card menciona corpus de evaluación en 30 idiomas y pruebas manuales en inglés y chino, pero no publica lista oficial) |
| Licencia | tencent-hy-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (3 ficheros: dos partes del modelo y el proyector de visión en F16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con un componente poco habitual: Engram, una tabla de 660 millones de filas de 96 dimensiones que almacena embeddings de bigramas y trigramas aprendidos y se consulta mediante hash. Esa tabla se lee fila a fila, unos pocos kilobytes por token, lo que permite mantenerla en disco en lugar de en memoria. La red principal reparte 512 expertos enrutados con 16 activos por token, lo que da 11.3B parámetros activos sobre un total de 155.5B en la red. El modelo acepta entradas de texto e imagen mediante un proyector de visión separado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. La model card de esta cuantización tampoco detalla innovaciones de decodificación; el único dato técnico relevante sobre el proceso de cuantización es que los ficheros de Tencent incluyen un bloque de predicción multi-token de su export interno que el checkpoint público no tiene. El autor señala que el modelo pierde más precisión con la cuantización que la mayoría: incluso su Q8_0 difiere del BF16 en el 8.2 % de los tokens, y la hipótesis que maneja es que pequeñas diferencias de redondeo alteran qué 16 de los 512 expertos selecciona el router.

## Capacidades

- Generación de texto conversacional en inglés y chino, verificado manualmente por el autor de la cuantización.
- Razonamiento con modo de pensamiento activado por defecto; un puzle de razonamiento se resolvió correctamente en las pruebas.
- Aritmética y respuestas factuales breves correctas en las comprobaciones manuales.
- Generación de código: produjo una función Python correcta en la prueba del autor.
- Visión: descripción de formas, colores, posiciones y texto presente en una imagen de prueba, usando el proyector `mmproj-Hy4-flash-F16.gguf`.
- Tool calling / function calling: con razonamiento activado el modelo invoca la herramienta proporcionada; con `reasoning_effort` en `no_think` respondió en prosa en lugar de llamar a la herramienta, a diferencia del Q8_0 del mismo autor.
- Contexto largo de hasta 1 millón de tokens según el modelo base.
- Capacidades multilingües: no documentadas oficialmente; el corpus de evaluación de la cuantización cubre 30 idiomas, pero no hay lista de idiomas soportados.

## Casos de uso

- Asistencia conversacional local en máquinas de 64 GB: el modelo cabe con 49.1 GB de pesos en memoria más la tabla Engram en SSD, lo que permite desplegar un asistente multi-turno sin depender de la nube, aceptando la pérdida de calidad de la cuantización.
- Análisis de documentos e imágenes en local: con el proyector de visión y una ventana de contexto de hasta 1M tokens, se pueden procesar capturas, diagramas o páginas escaneadas junto con texto largo en un mismo flujo.
- Automatización de agentes con tool calling: la model card indica que conviene mantener el razonamiento activado, ya que en modo `no_think` el modelo tiende a responder en prosa en lugar de invocar herramientas; es adecuado para pipelines de agentes donde el coste de latencia es asumible.
- Generación de código en entornos con requisitos de confidencialidad: al ejecutarse íntegramente en local, encaja en equipos que no pueden enviar código a APIs externas, con la advertencia de que el autor no ha ejecutado benchmarks de tarea sobre esta build.
- Investigación sobre cuantización extrema: el repositorio publica métricas de KLD y coincidencia de token frente a BF16, lo que lo convierte en un caso de estudio útil para medir el impacto de bajar expertos a 2 bits en arquitecturas MoE con router.
- Procesamiento de corpus multilingües a gran escala en hardware modesto: el corpus de evaluación de 30 idiomas sugiere cobertura amplia, aunque no hay garantías formales de calidad por idioma.
- Pruebas de concepto de contexto largo: la ventana de 1M tokens permite experimentar con resumen de documentos extensos, aunque el autor solo verificó un contexto de 32K en sus pruebas de servidor.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de cuantización, no de tareas. Se midieron con `llama-perplexity` sobre un corpus neutral de 30 idiomas (104 fragmentos de 4096 tokens), con llama.cpp PR #32517 en el commit `0a054d0b` y 8x A100 80 GB, comparando contra la conversión BF16 propia del autor.

| Fichero | Memoria (GB) | Disco (GB) | KLD media | KLD percentil 99 | Mismo token top |
|---|---:|---:|---:|---:|---:|
| Q8_0 (del autor, no publicado) | 165.5 | 232.8 | 0.136 | 2.92 | 91.8 % |
| Tencent Q4_K_M | 105.0 | 168.4 | 0.198 | 4.18 | 89.3 % |
| Tencent IQ2-AH | 71.6 | 135.0 | 0.651 | 8.73 | 77.9 % |
| AD-IQ2_S-IQ2_XXS (este repo) | 49.1 | 84.7 | 0.725 | 9.08 | 76.4 % |

La columna de memoria excluye la tabla Engram. El autor advierte que la KLD mediana del Q4_K_M de Tencent es de 0.008, lo que indica que la mayor parte de los tokens salen casi exactos y una minoría diverge mucho. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) para esta cuantización; Tencent reporta que su IQ2-AH queda entre 2 y 6.5 puntos por debajo de BF16 en sus propios benchmarks de agentes y código, pero esos datos corresponden al fichero de Tencent, no a este.

## Requisitos de hardware

- VRAM estimada: 49.1 GB de pesos en memoria para el fichero principal, más 0.97 GB del proyector de visión en F16. Con proyector y contexto de 32K, `llama-server` retuvo 51.4 GB de memoria de GPU en la máquina CUDA del autor.
- La tabla Engram (35.64 GB en disco) puede permanecer en SSD y se lee fila a fila, unos pocos kilobytes por token.
- GPU recomendadas: el autor probó con 8x A100 80 GB para las métricas y con 4x A100 80 GB para velocidad (capas repartidas entre tarjetas, tabla Engram en el host). No se ha medido en Mac.
- Cabe en máquinas de 64 GB de memoria, que es el objetivo declarado del repositorio. No se indica compatibilidad con GPU de consumo tipo RTX 4090 en la información disponible.
- Despliegue: exclusivamente llama.cpp con soporte para Hy4-flash (PR ggml-org/llama.cpp#32517, probado en `0a054d0b`). Stock llama.cpp, LM Studio y Ollama no cargan estos ficheros todavía.
- Throughput medido: aproximadamente 23 a 26 tokens/s de generación en 4x A100 80 GB. No hay datos de latencia en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria en inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash AD-IQ2_S-IQ2_XXS (este repo) | 218.9B totales, 11.3B activos | 1M | 49.1 GB + tabla Engram en SSD | tencent-hy-license | GGUF, requiere llama.cpp con PR #32517 |
| Hy4-flash IQ2-AH (Tencent) | 218.9B totales, 11.3B activos | 1M | 71.6 GB + tabla Engram | tencent-hy-license | GGUF oficial de Tencent |
| Hy4-flash Q4_K_M (Tencent) | 218.9B totales, 11.3B activos | 1M | 105.0 GB + tabla Engram | tencent-hy-license | GGUF oficial de Tencent |
| Hy4-flash Q8_0 (conversión del autor, no publicada) | 218.9B totales, 11.3B activos | 1M | 165.5 GB + tabla Engram | tencent-hy-license | No publicada |

La comparación con modelos de otras familias no está disponible en la información proporcionada. Dentro de la misma familia, la elección depende del hardware: el autor recomienda los ficheros de Tencent en máquinas de 96 GB y 128 GB, y reserva este para 64 GB a cambio de 1.4 puntos de coincidencia de token top frente al IQ2-AH de Tencent.

## Limitaciones y advertencias

- Pérdida de calidad medible: KLD media de 0.725 y 76.4 % de coincidencia en el token top frente a BF16. El propio autor califica la build de experimental.
- El modelo pierde más con la cuantización que la media: incluso el Q8_0 baja al 91.8 % de coincidencia, cuando la mayoría de modelos supera el 98 %. La causa probable es que el redondeo altera la selección de expertos en el router.
- Tool calling degradado en modo `no_think`: el modelo responde en prosa en lugar de invocar herramientas, a diferencia del Q8_0. Para agentes hay que mantener el razonamiento activado.
- Dependencia de una versión no fusionada de llama.cpp: sin el PR #32517, ni el llama.cpp estándar ni LM Studio ni Ollama cargan los ficheros.
- Sin benchmarks de tarea publicados para esta cuantización; las cifras de Tencent sobre IQ2-AH corresponden a otro fichero.
- Idiomas soportados no documentados oficialmente; solo hay verificación manual en inglés y chino y un corpus de evaluación de 30 idiomas sin desglose.
- Licencia `tencent-hy-license` etiquetada como "other": hay que revisar el texto de la licencia antes de cualquier uso comercial, y no se detallan aquí sus restricciones.
- Riesgo de alucinación no cuantificado en la información disponible; las pruebas manuales se limitaron a respuestas factuales breves, aritmética y un puzle.
- Sin mediciones en hardware Apple; el rendimiento en Mac es desconocido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se creó y actualizó el mismo día, lo que indica que no ha pasado por validación comunitaria.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/AtomicChat/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- GGUF oficiales de Tencent: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- PR de llama.cpp con soporte Hy4-flash: https://github.com/ggml-org/llama.cpp/pull/32517
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord del autor: https://discord.gg/8wGSsvmg4V
- Perfil en X: https://x.com/atomic_chat_hq
