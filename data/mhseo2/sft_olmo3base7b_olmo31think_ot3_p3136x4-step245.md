# mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step245

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p3136x4-step245` es un checkpoint de ajuste supervisado (SFT) publicado por el usuario `mhseo2` sobre el modelo base `mhseo2/Olmo-3-1025-7B-opd`, que a su vez deriva de Olmo-3-1025-7B (base). El objetivo es transferir a un modelo denso de 7.298 millones de parámetros el comportamiento de razonamiento matemático de `allenai/Olmo-3.1-32B-Think`, un modelo profesor de 32B, mediante destilación de trazas de razonamiento generadas sobre los prompts matemáticos de OpenThoughts3.

El modelo resuelve un problema muy concreto de investigación: producir un 7B abierto capaz de emitir cadenas de razonamiento largas (hasta 32.768 tokens) que terminan en una respuesta encajada con `\boxed{}`, con datos filtrados por criterios de formato y descontaminados con n-gramas contra AIME 2025, AIME 2026 y HMMT Feb 2025. Es relevante ahora porque forma parte de una línea de trabajo reproducible sobre Olmo 3 (ventana de entrenamiento documentada, hiperparámetros y *data arm* explícitos), y porque los pesos se distribuyen con licencia Apache 2.0 en safetensors.

Se trata de un checkpoint intermedio (paso 245 de 735, época 5 de 15), no de un modelo final, y el autor no ha publicado todavía ninguna evaluación. Cualquier uso en producción debería tratar los resultados como provisionales hasta que aparezcan las puntuaciones mean@8 anunciadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado de Olmo 3, familia transformer densa; el autor no detalla la arquitectura en la model card) |
| Parámetros totales | 7.298.011.136 (dato real de los safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible (el entrenamiento se truncó a 32.768 tokens, pero no se declara la ventana nativa del modelo base) |
| Tipos de cuantización | No se distribuyen cuantizaciones; solo pesos safetensors. Convertible a GGUF/AWQ/GPTQ por terceros, no verificado |
| Idiomas soportados | No disponible (los prompts de entrenamiento son matemáticos y de procedencia anglófona, no se declara cobertura multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, 3 fragmentos (`model-00001-of-00003` … `model-00003-of-00003`) con índice; repo de 14,6 GB; incluye `tokenizer.json`, `vocab.json`, `merges.txt`, `chat_template.jinja` y `generation_config.json` |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Olmo-3-1025-7B, un transformer denso de ~7,3B parámetros. La model card no aporta detalles sobre atención, normalización, tokenizador ni posición de las capas; lo que sí documenta es el procedimiento de ajuste: SFT sobre trazas de razonamiento producidas por `allenai/Olmo-3.1-32B-Think` para los prompts matemáticos de OpenThoughts3, con un *data arm* etiquetado `p3136x4` que combina 3.136 prompts con 4 trayectorias cada uno (12.544 muestras, aproximadamente 225M tokens).

El filtrado de datos es el elemento técnico más relevante: solo se conservan trayectorias que terminan, cierran `</think>` exactamente una vez y encapsulan una respuesta con `\boxed{}` después del cierre, todo ello dentro de un límite de 32.768 tokens. Además, se aplicó descontaminación por n-gramas de 10 tokens contra AIME 2025, AIME 2026 y HMMT Feb 2025 para evitar filtración de los conjuntos de evaluación. El entrenamiento usó batch de 256, tasa de aprendizaje 8e-5 con decaimiento coseno hasta 4e-5, calentamiento del 3 %, weight decay 0,01 y 49 pasos por época (735 pasos en 15 épocas); este checkpoint corresponde al paso 245. La infraestructura fue BSC MareNostrum 5, con 2 nodos de 4 H100, FSDP y Ulysses sequence parallelism de grado 2. No se documenta ninguna innovación arquitectónica propia: las mejoras provienen exclusivamente del ajuste y de los datos.

## Capacidades

- Generación de cadenas de razonamiento matemático extensas, con modo *thinking* implícito delimitado por `</think>`.
- Resolución de problemas de competición (estilo AIME/HMMT) con formato de respuesta forzado mediante `\boxed{}`.
- Producción de trazas de razonamiento de hasta 32.768 tokens, útiles como datos de destilación para otros modelos.
- Generación de texto general: no validada, el ajuste se hizo solo con prompts matemáticos y no hay evaluación de retención de capacidades del base.
- Tool calling / function calling: no disponible; no se documenta soporte y el ajuste no incluye datos de herramientas.
- Soporte de agentes y razonamiento multi-paso: parcialmente implícito por el formato de traza larga, pero sin evaluación ni *harness* de agentes documentado.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales: plantilla de chat incluida (`chat_template.jinja`), lo que permite uso conversacional vía `apply_chat_template`. Sin visión ni audio.

## Casos de uso

- Generación de datos de razonamiento para destilación: usar el modelo como generador masivo de trazas matemáticas con formato garantizado (`</think>` + `\boxed{}`) y filtrar por verificador de respuesta, aprovechando que fue entrenado exactamente para ese formato.
- Investigación en currículos de SFT: el checkpoint intermedio (época 5 de 15) permite estudiar la evolución de la capacidad de razonamiento a lo largo del entrenamiento comparándolo con checkpoints posteriores del mismo *data arm*.
- Réplica y ablación de *data arms*: al estar documentados prompts (3.136), trayectorias (4) y filtros, sirve como referencia para medir el efecto del filtrado por formato y de la descontaminación por n-gramas.
- Evaluación de verificadores matemáticos: las respuestas encajadas en `\boxed{}` facilitan el *parsing* automático, por lo que el modelo es útil para probar pipelines de extracción y comprobación de respuestas.
- Fine-tuning posterior con RL: al partir de un modelo ya alineado al formato de razonamiento, es un punto de arranque razonable para RLVR con recompensas basadas en verificación de respuesta.
- Estudio de mecánica interna y fidelidad de trazas: la longitud de salida (hasta 32K tokens) permite analizar si el razonamiento emitido es causal respecto a la respuesta o meramente decorativo.
- Docencia y experimentación local: con cuantización de 4 bits cabe en GPUs de consumo, lo que facilita reproducir experimentos de razonamiento matemático sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación está en cola en los *workers* de sky eval y que las puntuaciones se añadirán a la model card cuando finalice.

| Evaluación | Métrica | Estado |
|---|---|---|
| AIME 2025 | mean@8 | Pendiente (en cola) |
| AIME 2026 | mean@8 | Pendiente (en cola) |
| HMMT Feb 2025 | mean@8 | Pendiente (en cola) |

No se debe asumir ningún nivel de rendimiento hasta que estas cifras se publiquen; además, al ser el paso 245 de 735, los resultados no representan el modelo final de la serie.

## Requisitos de hardware

- VRAM estimada en BF16: ~14,6 GB solo para pesos; con caché KV para secuencias de 32K tokens, el consumo realista se sitúa bastante por encima y depende del número de cabezas KV, dato no disponible. Reservar 24-40 GB para inferencia cómoda con contexto largo.
- VRAM estimada en 8 bits: ~7,5-8 GB de pesos; en 4 bits: ~4-4,5 GB de pesos, más caché KV.
- GPU recomendadas: H100 o A100 80 GB para entrenamiento o inferencia con contexto máximo; L40S/A6000 (48 GB) para servicio con contexto largo; RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado o cuantizada con contexto largo.
- GPU de consumo: sí cabe. En RTX 3090/4090 con cuantización de 4 u 8 bits es viable; en GPUs de 12-16 GB solo con 4 bits y contexto recortado.
- Opciones de despliegue: Hugging Face Transformers (los safetensors están completos e indexados), vLLM y SGLang para servicio con throughput alto, TGI, y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF en el repositorio). Requiere cargar `chat_template.jinja` para un uso correcto del formato conversacional.
- Latencia y throughput: no disponibles. Cualquier estimación debe considerar que el modelo genera trazas muy largas (miles de tokens por respuesta), lo que domina el coste frente al *prefill*.
- Entrenamiento: el autor usó 8 H100 (2 nodos × 4) con FSDP y Ulysses SP 2, batch 256; es una referencia útil para reproducir el ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`sft_olmo3base7b_...-step245`) | 7,298 M | No disponible (entrenado a 32.768) | Apache 2.0 | Safetensors en HF | SFT intermedio, sin evaluación publicada |
| `mhseo2/Olmo-3-1025-7B-opd` (modelo base directo) | ~7,3B (no verificado en la información) | No disponible | No disponible en la información | HF | Punto de partida del ajuste; sin datos de eval en la información |
| `allenai/Olmo-3.1-32B-Think` (profesor) | ~32B (no verificado en la información) | No disponible | No disponible en la información | HF | Fuente de las trazas de razonamiento destiladas |
| Otros 7B de razonamiento matemático (p. ej. derivados de Qwen2.5-Math o destilados de R1) | No disponible | No disponible | No disponible | No disponible | No se han podido verificar datos en la información proporcionada; no se ofrece comparación numérica |

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay MMLU, GSM8K, HumanEval ni resultados en AIME/HMMT; las métricas anunciadas siguen en cola.
- Es un checkpoint intermedio (paso 245 de 735, época 5 de 15), no el modelo final; su calidad puede ser sustancialmente inferior a la de un checkpoint posterior de la misma serie.
- Entrenado exclusivamente con prompts matemáticos de OpenThoughts3: es esperable olvido catastrófico en instrucciones generales, código, charla y tool calling. No hay datos que confirmen retención de capacidades del base.
- Riesgo de alucinación alto en el razonamiento intermedio: el filtro solo comprueba formato (cierre de `</think>`, `\boxed{}`, longitud), no corrección matemática de la respuesta.
- Sesgos: no documentados. Al no declararse idiomas ni composición demográfica del corpus, no es posible evaluar sesgos lingüísticos o culturales.
- Limitaciones de idioma y contexto: sin cobertura multilingüe declarada; el truncado a 32.768 tokens implica que problemas que requieran trazas más largas quedan fuera.
- Coste de inferencia: las trazas largas multiplican los tokens generados por consulta, lo que encarece el servicio y aumenta la latencia.
- Licencia: los pesos son Apache 2.0, pero conviene revisar los términos del modelo base y de los datos destilados de `allenai/Olmo-3.1-32B-Think` antes de un uso comercial, ya que la model card no detalla las condiciones de las trazas generadas por el profesor.
- Reproducibilidad: el autor documenta el árbol de código (`mopdRL` live tree `f1bcc9eb...`, paquete `bsc-olmo-base-opd-2026-10-26`) y los hashes SHA-256 de todos los ficheros, lo que facilita la verificación de integridad, pero no se enlaza un repositorio público de código.
- Advertencia de producción: no usar como sistema de respuesta matemática sin un verificador externo que valide el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step245
- Modelo base directo: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor (trazas de razonamiento): https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts OpenThoughts3: referenciado en la model card, sin enlace directo en la información disponible
- Paper, blog o repositorio de código: no disponible en la información proporcionada (solo se cita el árbol `mopdRL` y el paquete `bsc-olmo-base-opd-2026-10-26` sin URL)
- Infraestructura de entrenamiento: BSC MareNostrum 5 (sin enlace específico en la información disponible)
