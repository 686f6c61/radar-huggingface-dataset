# OsaurusAI/Ripple-65B-Preview-JANG_4D

## Resumen
Ripple-65B-Preview-JANG_4D es una cuantización de 4 a 8 bits del modelo denso ricursiveAI/Ripple-65B-Preview, publicada por OsaurusAI para su ejecución en Apple Silicon mediante la librería MLX y el runtime propio Osaurus (versión 0.25.32 o superior). El modelo base es un transformer denso de 65 000 millones de parámetros y 80 capas, diseñado para razonamiento, uso de herramientas, código y flujos agénticos, con una ventana de contexto que la model card original declara de hasta 1 millón de tokens.

El bundle reduce el peso de los pesos a 43,67 GB (5,39 bits por peso sobre los 64 800 millones de parámetros del modelo fuente) manteniendo, según el autor, un 98,3 % de acuerdo top-1 con el modelo en BF16 sobre un conjunto de evaluación de 221 809 posiciones asistente. Incluye además el drafter de decodificación especulativa DFlash2 en BF16 (8,08 GB), que Osaurus cuantiza a 4 bits al cargarlo.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización mixta sensible a la activación (GPTQ, imatrix, AWQ plegada en normas) aplicada módulo a módulo; por otro, ofrece una vía para ejecutar un modelo de 65B con capacidades agénticas en hardware de consumo Apple, a costa de depender de un runtime propietario y de una licencia Apache 2.0 sobre el artefacto derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 80 capas; atención completa sin rotación posicional cada 5 capas (16 en total) y atención de ventana deslizante de 1024 tokens en el resto; gated attention y value residual |
| Parametros totales | 64 782 689 360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 1 000 000 de tokens según la model card original; solo las 16 capas de atención completa mantienen una KV cache que crece con el contexto |
| Tipos de cuantizacion | Afín de 4 a 8 bits con grupo de 64, asignación por módulo según sensibilidad medida; GPTQ en proyecciones de atención, gate/up y lm_head; imatrix en down_proj; embeddings a 6 bits; normas y pesos de value residual en bf16. Media de 5,39 bits por peso |
| Idiomas soportados | Inglés (campo `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); drafter DFlash2 incluido en BF16 |

## Arquitectura y entrenamiento
El modelo base es un transformer denso de 80 capas con un patrón híbrido de atención: una de cada cinco capas usa atención completa sin rotación posicional (16 capas en total) y las otras 64 emplean atención de ventana deslizante de 1024 tokens. Incorpora gated attention y un mecanismo de value residual. No se dispone de información sobre el volumen de tokens de preentrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO en la información proporcionada.

La innovación documentada en este artefacto es el esquema de cuantización JANG_4D: los pesos se asignan por módulo a anchos de 4, 5, 6 u 8 bits según la sensibilidad medida bajo un presupuesto de tamaño, con GPTQ en todas las proyecciones de atención, gate/up y lm_head, redondeo ponderado por activación (imatrix) en down_proj y escalado AWQ plegado exactamente en la norma de entrada del feed-forward. La calibración usó 1,52 millones de tokens de salidas del propio Ripple y de bucles reales de herramientas, cubriendo código en varios lenguajes, bucles agénticos multi-turno, razonamiento y matemáticas, sesiones de terminal y ciberseguridad. El bundle incluye el drafter DFlash2, que propone hasta 15 tokens por paso para verificación por el modelo principal.

## Capacidades
- Generación de texto conversacional y razonamiento con modo de pensamiento decidido por el propio modelo en cada turno (sin interruptor ni niveles de esfuerzo).
- Razonamiento matemático y resolución de problemas multi-paso.
- Generación y edición de código en múltiples lenguajes.
- Uso de herramientas mediante JSON dentro de etiquetas `<tool_call>` con el formato `{"name": ..., "arguments": {...}}`; los resultados vuelven como bloques `<tool_response>` en un turno de usuario.
- Soporte de `tool_choice: "required"` con herramientas estrictas (`"strict": true`, `additionalProperties: false`).
- Flujos agénticos con bucles de herramienta multi-turno y cierre explícito del razonamiento mediante `</think>`.
- Capacidades en dominios de terminal, ciberseguridad y tareas de aplicación del runtime Osaurus, según el conjunto de evaluación del autor.
- Decodificación especulativa integrada mediante el drafter DFlash2 incluido.
- Capacidades multilingües limitadas: el campo de idioma declara únicamente inglés.

## Casos de uso
- Automatización de agentes con herramientas en local: el modelo puede encadenar llamadas a funciones en formato JSON y procesar los resultados como bloques `<tool_response>`, lo que permite construir asistentes que consultan APIs o ejecutan comandos sin salir del equipo.
- Asistencia de programación en el escritorio: con 65B parámetros densos y un 97,9 % de acuerdo top-1 en el dominio de código respecto al modelo BF16, es adecuado para autocompletado, refactorización y explicación de código en entornos Apple Silicon.
- Sesiones de terminal asistidas: el dominio de terminal muestra un 98,6 % de acuerdo top-1, lo que lo hace viable para interpretar salidas de shell, proponer comandos y diagnosticar errores en flujos de administración de sistemas.
- Razonamiento matemático y análisis técnico: el dominio de razonamiento y matemáticas conserva un 98,5 % de acuerdo top-1, útil para tutoría, verificación de cálculos y descomposición de problemas.
- Análisis de seguridad y ciberseguridad defensiva: con un 98,0 % de acuerdo top-1 en el dominio de ciberseguridad, puede apoyar la revisión de configuraciones, el triaje de alertas y la explicación de hallazgos.
- Procesamiento de documentos largos: la ventana declarada de hasta 1M tokens, con KV cache solo en las 16 capas de atención completa, permite resumir o consultar corpus extensos en una sola sesión.
- Asistentes conversacionales multi-turno en inglés: el modelo conserva el razonamiento previo en el historial por defecto (`clear_thinking=false`), lo que facilita conversaciones con continuidad de contexto.

## Benchmarks y rendimiento
Los datos publicados por el autor miden la fidelidad de la cuantización frente al modelo BF16, no el rendimiento absoluto en tareas estándar. Conjunto de evaluación: 221 809 posiciones asistente, con al menos 30 000 en cada uno de 7 dominios, comparadas contra la release BF16 con KL top-128.

| Métrica | BF16 (suelo de medida) | JANG_4D (43,7 GB) | JANG_4M (mismo tamaño, tiers fijos) | JANGH2 (24,6 GB) |
|---|---|---|---|---|
| KL medio ↓ | 0,00017 | 0,00239 | 0,00325 | 0,0841 |
| KL p99 ↓ | 0,0016 | 0,0263 | 0,0390 | 0,939 |
| Top-1 ↑ | 99,48 % | 98,30 % | 98,09 % | 90,28 % |

| Dominio | Posiciones | JANG_4D (KL · top-1) | JANGH2 (KL · top-1) |
|---|---|---|---|
| Bucles agénticos de herramientas | 30 839 | 0,0018 · 98,6 % | 0,066 · 91,3 % |
| Código | 36 021 | 0,0026 · 97,9 % | 0,081 · 89,8 % |
| Terminal | 32 049 | 0,0017 · 98,6 % | 0,057 · 91,3 % |
| Razonamiento / matemáticas | 31 341 | 0,0018 · 98,5 % | 0,060 · 91,1 % |
| Ciberseguridad | 31 076 | 0,0032 · 98,0 % | 0,122 · 88,3 % |
| Multilingüe, ciencia, creativo | 30 457 | 0,0041 · 97,7 % | 0,153 · 86,9 % |
| Tareas de la app Osaurus | 30 026 | 0,0016 · 98,8 % | 0,052 · 93,3 % |

Otras métricas de fidelidad: cambio en log-verosimilitud negativa de los tokens reservados de +0,002; inicio de llamada a herramienta con coincidencia top-1 en 248 de 250 puntos (99,2 %); cierre de razonamiento con `</think>` en los 256 puntos evaluados; primer token de respuesta con coincidencia del 99,2 % sobre 364 turnos; fin de turno con coincidencia del 99,7 % sobre 336 turnos.

Rendimiento del drafter DFlash2 sobre el modelo en precisión completa en la GPU de captura: primer token aceptado entre el 68 % y el 83 % de las veces, con 2,0 a 5,0 tokens redactados aceptados por paso según el dominio (código y trabajo agéntico en torno a 3,3-3,4). La velocidad en Mac no se declara. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- Espacio en disco: 43,67 GB de shards del modelo más 8,08 GB del drafter en BF16 (51,7 GB de repositorio); el drafter se cuantiza a 4 bits al cargar en Osaurus.
- Memoria unificada: al ser un bundle MLX para Apple Silicon, el modelo se ejecuta sobre memoria unificada, no sobre VRAM dedicada; se requiere un Mac con al menos ~44 GB disponibles para los pesos y margen adicional para la KV cache y el drafter.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada suficiente (familias Max y Ultra). No se documentan requisitos para A100, H100 ni RTX 4090, y el formato MLX no es directamente compatible con CUDA.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB o menos en esta variante; el autor publica una variante menor, JANGH2, de 24,6 GB, para presupuestos más ajustados.
- Despliegue: runtime Osaurus 0.25.32 o superior, con librería MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para Mac; el autor indica explícitamente que la velocidad depende de la máquina y no la declara.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/Ripple-65B-Preview-JANG_4D | 64,8B densos | Hasta 1M tokens (declarado) | MLX / Osaurus | Apache 2.0 | Hugging Face, 0 descargas |
| OsaurusAI/Ripple-65B-Preview-JANGH2 | 64,8B densos (24,6 GB) | Hasta 1M tokens (declarado) | MLX / Osaurus | Apache 2.0 | Hugging Face |
| ricursiveAI/Ripple-65B-Preview | 64,8B densos | Hasta 1M tokens (declarado) | BF16 | No indicada en la información disponible | Hugging Face |

Frente a JANGH2, la variante JANG_4D sacrifica 19,1 GB adicionales de peso a cambio de elevar el top-1 del 90,28 % al 98,30 % y reducir el KL medio de 0,0841 a 0,00239. Frente al modelo base en BF16, JANG_4D se queda a 1,18 puntos de top-1 del suelo de medida del propio runtime. No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias
- Idiomas: el modelo declara únicamente inglés; el rendimiento en castellano u otras lenguas no está documentado y el dominio multilingüe del conjunto de evaluación muestra el mayor KL del bundle (0,0041).
- Dependencia de runtime: requiere Osaurus 0.25.32 o superior y MLX; no es portable a vLLM, llama.cpp, Ollama ni TGI sin conversión adicional.
- Contexto efectivo: aunque se declaran hasta 1M tokens, solo 16 de las 80 capas mantienen KV cache creciente, por lo que el comportamiento más allá de la ventana deslizante de 1024 tokens depende del patrón de atención y no está cuantificado en la información disponible.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni tasas de alucinación; los benchmarks publicados miden fidelidad de cuantización, no corrección factual.
- Sesgos: no se dispone de información sobre sesgos evaluados ni sobre la composición del corpus de entrenamiento.
- Licencia: Apache 2.0 sobre el artefacto, pero el modelo base no declara licencia en la información disponible; conviene verificar los términos de ricursiveAI/Ripple-65B-Preview antes de un uso comercial en producción.
- Modo de razonamiento: no existe interruptor ni niveles de esfuerzo; el modelo decide por turno si pensar, lo que complica el control de latencia y coste en producción.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la variante es una preview; no hay evidencia de uso en producción.
- Evaluación optimista: el propio autor advierte que la elección del método de redondeo por módulo consultó las filas de entrada del conjunto de prueba, por lo que las métricas pueden ser ligeramente optimistas.

## Enlaces
- Hugging Face (este bundle): https://huggingface.co/OsaurusAI/Ripple-65B-Preview-JANG_4D
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Drafter DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Variante menor JANGH2: https://huggingface.co/OsaurusAI/Ripple-65B-Preview-JANGH2
- Runtime Osaurus: https://osaurus.ai
