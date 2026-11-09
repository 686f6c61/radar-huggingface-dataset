# joebos/Second-1.0-2B-GGUF

## Resumen

Second-1.0-2B-GGUF es la versión cuantizada en formato GGUF del modelo Second-1.0-2B, un modelo de lenguaje de 1.881.825.088 parámetros desarrollado por el colectivo second-chess y empaquetado por el usuario joebos. Su propósito es muy específico: asistir en el análisis de partidas de ajedrez, operando como un asistente conversacional especializado en tareas de revisión post-partida y estudio, no como un motor de ajedrez al uso. La versión que nos ocupa se distribuye en cuantización Q4_K_M y está optimizada para ejecutarse íntegramente en el navegador mediante wllama (WebAssembly), lo que la convierte en una opción poco habitual dentro del ecosistema de modelos open source.

El modelo base emplea una arquitectura híbrida con atención Gated DeltaNet, según se desprende de las notas del autor sobre fallos de compilación de shaders en WebLLM y Transformers.js. El contexto de ejecución documentado en el ejemplo de uso es de 1024 tokens, aunque no se especifica la longitud de contexto nativa del modelo base. La licencia Apache 2.0 y el formato GGUF facilitan su integración tanto en entornos de escritorio (llama.cpp, Ollama) como en extensiones de navegador.

La relevancia de esta ficha radica en su carácter de caso práctico: un modelo pequeño, especializado y desplegable en cliente, que ilustra una vía alternativa a los grandes modelos generalistas para tareas acotadas. No obstante, la información pública disponible es limitada y muchos parámetros técnicos habituales no están documentados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención Gated DeltaNet (según notas del autor sobre kernels de atención) |
| Parámetros totales | 1.881.825.088 (1,88 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 tokens en la configuración de ejemplo documentada; contexto nativo del modelo base no disponible |
| Tipos de cuantización | Q4_K_M (única publicada en este repositorio) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (monolítico y fragmentado en 3 shards de menos de 500 MB) |

## Arquitectura y entrenamiento

El modelo base Second-1.0-2B emplea una arquitectura transformer con mecanismos de atención híbridos basados en Gated DeltaNet, tal y como se deduce de las notas del autor, que mencionan que WebLLM y Transformers.js fallaron al compilar los shaders de los kernels de atención híbrida de "Qwen 3.5". Esta referencia sugiere que el modelo base podría derivar de la familia Qwen, aunque no se confirma explícitamente en la información disponible. El tamaño de 1,88 mil millones de parámetros lo sitúa en la gama de modelos pequeños, aptos para ejecución en cliente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona una evaluación interna sobre 100 prompts de un conjunto de test (`eval/testset-1.0.jsonl`) con decodificación greedy, y hace referencia a una "voz de diario en primera persona" con una tasa de cumplimiento del 0,00%, lo que sugiere que el modelo fue ajustado para evitar ciertos estilos narrativos y mantener un formato estructurado de análisis de ajedrez. El proceso de cuantización a Q4_K_M se validó con una puerta de calidad: la tasa de fallos graves pasó del 4,67% en bfloat16 a un máximo del 6,70% en Q4_K_M, considerándose aceptable.

## Capacidades

- Generación de texto especializada en análisis de ajedrez: explicación de movimientos, revisión post-partida y estudio de posiciones.
- Formato de conversación basado en la plantilla de chat de Second, con etiquetas `<|im_start|>` y `<|im_end|>` y soporte de modo de razonamiento mediante `<think>`.
- Cumplimiento estricto de formato: 100,0% de tasa de aprobación de formato en la evaluación interna.
- Cumplimiento de longitud objetivo: 99,67% dentro del rango esperado.
- Ejecución en navegador mediante WebAssembly (wllama), sin dependencia de shaders GPU.
- Compatibilidad con llama.cpp y Ollama para ejecución en escritorio.
- Capacidad conversacional multi-turno dentro de la ventana de contexto configurada.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Revisión de partidas de ajedrez en el navegador: el modelo puede cargarse en una extensión de Chrome (Manifest V3 Side Panel) mediante wllama y analizar jugadas concretas sin enviar datos a un servidor, gracias a su tamaño de 1,22 GB en Q4_K_M y su ejecución sobre WebAssembly.
- Estudio de posiciones y explicación de movimientos: el prompt de ejemplo de llama.cpp muestra una tarea `explain_move`, lo que indica que el modelo está ajustado para describir la lógica de una jugada dentro de una posición dada.
- Asistente de ajedrez en aplicaciones web estáticas: al distribuirse en shards de menos de 500 MB, puede cachearse en IndexedDB y servirse desde un CDN, permitiendo un asistente sin backend.
- Análisis post-partida en entornos con recursos limitados: con 1,88 B de parámetros y cuantización Q4_K_M, cabe en equipos de consumo sin GPU dedicada, ejecutándose por CPU.
- Integración en herramientas de escritorio de ajedrez: mediante llama.cpp CLI u Ollama, puede incorporarse a flujos locales de revisión de partidas guardadas en formato PGN.
- Filtro de cumplimiento de fair play: el modelo "falla cerrado" y rechaza operar durante partidas en vivo, por lo que puede usarse como componente de revisión exclusivamente posterior al juego.
- Prototipado de asistentes especializados en dominios acotados: sirve como referencia para equipos que quieran desplegar un modelo pequeño y especializado en cliente sin infraestructura de servidor.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la prueba en navegador con wllama y la comprobación de calidad post-cuantización. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Prueba | Configuración | Resultado |
|---|---|---|
| Time to first token (wllama, Wasm) | Q4_K_M, Chrome MV3 Side Panel, Intel Core Ultra 7 | 16.571 ms |
| Velocidad de generación (wllama, Wasm) | Q4_K_M, mismo entorno | 14,38 tok/s |
| Memoria | Q4_K_M, wllama | 1024 MB de heap Wasm |
| Tasa de fallos graves (bfloat16) | 300 ítems de test congelados | 4,67% |
| Tasa de fallos graves (Q4_K_M) | 100 prompts, greedy | ≤ 6,70% (aprobado) |
| Cumplimiento de longitud objetivo | Q4_K_M | 99,67% |
| Tasa de aprobación de formato | Q4_K_M | 100,0% |
| Voz de diario en primera persona | Q4_K_M | 0,00% |

Como referencia, el autor incluye un fallback de 0,8B con Q4_K_M que alcanza 28,11 tok/s y 6.647 ms hasta el primer token, lo que evidencia el coste de latencia asociado al modelo de 2B en el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no se dispone de medición de VRAM; en el navegador se reserva un heap Wasm de 1024 MB. Para ejecución en GPU con llama.cpp, una estimación conservadora para Q4_K_M de un modelo de 1,88 B sería de aproximadamente 1,5-2 GB, aunque no está confirmado por el autor.
- GPU recomendadas: no documentadas. El modelo está optimizado para CPU mediante WebAssembly; no se han publicado pruebas con A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: por tamaño, es plausible que quepa en GPUs de consumo con 4 GB o más de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: wllama (WebAssembly, en navegador), llama.cpp CLI, Ollama. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: 14,38 tok/s y 16,571 ms hasta el primer token en un Intel Core Ultra 7 con wllama; no hay datos para otras configuraciones.
- Almacenamiento: archivo monolítico de aproximadamente 1,22 GB; shards de 480 MB, 480 MB y 261 MB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables para establecer una comparativa rigurosa con otros modelos de ajedrez o de 2B parámetros. La siguiente tabla recoge únicamente los datos disponibles del propio modelo y del fallback citado por el autor.

| Modelo | Parámetros | Contexto | Cuantización | Velocidad (wllama) | Licencia |
|---|---|---|---|---|---|
| Second-1.0-2B-GGUF | 1,88 B | 1024 (config. ejemplo) | Q4_K_M | 14,38 tok/s | Apache 2.0 |
| Fallback 0,8B (citado por el autor) | no disponible | no disponible | Q4_K_M | 28,11 tok/s | no disponible |

No se han identificado en la información proporcionada alternativas comparables de ajedrez con las que contrastar parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan datos de entrenamiento, contexto nativo, sesgos ni evaluación estándar, lo que dificulta una evaluación rigurosa.
- Especialización estrecha: el modelo está diseñado para análisis de ajedrez; su rendimiento en tareas generales de texto no está evaluado y probablemente sea limitado.
- Idioma: solo se declara soporte de inglés, lo que excluye su uso fiable en castellano u otros idiomas.
- Contexto corto en la configuración documentada: 1024 tokens en el ejemplo de uso, insuficiente para partidas completas o conversaciones largas.
- Riesgo de alucinación: no cuantificado; en un dominio factual como el ajedrez, las explicaciones de jugadas pueden contener errores no detectados.
- Restricción de fair play: el modelo rechaza operar durante partidas en vivo; no es apto como motor de juego ni para asistencia en tiempo real.
- Latencia elevada en navegador: 16,5 segundos hasta el primer token en el hardware probado, lo que limita su uso interactivo.
- Dependencia de un único formato de cuantización: solo se publica Q4_K_M, sin opciones de mayor precisión o menor tamaño en este repositorio.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base second-chess/Second-1.0-2B, ya que la información disponible no detalla posibles restricciones adicionales.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/joebos/Second-1.0-2B-GGUF
- Modelo base: https://huggingface.co/second-chess/Second-1.0-2B
- Repositorio GitHub del proyecto: https://github.com/kleinebossie/second
- Decisión de runtime documentada: https://github.com/kleinebossie/second/blob/main/docs/decisions/runtime.md
- wllama (runtime WebAssembly): https://github.com/ngxson/wllama
