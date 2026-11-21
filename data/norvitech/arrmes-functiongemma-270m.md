# NorviTech/arrmes-functiongemma-270m

## Resumen

ARRMES FunctionGemma-270M es un ajuste fino de `google/functiongemma-270m-it`, un modelo de 268 millones de parámetros especializado en tool calling (llamada a funciones). Lo desarrolla NorviTech como parte del proyecto ARRMES v1.7.2 (etiqueta interna "v10") y está pensado para emitir llamadas a herramientas estructuradas con alta precisión, incluyendo el rechazo de llamadas no autorizadas o mal formadas. El modelo base pertenece a la familia Gemma de Google y está optimizado para invocación de funciones en inglés.

El ajuste combina una fase de SFT con LoRA en BF16 (2 épocas, learning rate 1.5e-4, 12.620 ejemplos) y una segunda fase de preferencia RPO-DPO acotada (20 pasos, learning rate 1.5e-6) sobre pares contrastivos. El resultado se exporta a tres formatos: pesos MLX (4-bit y 8-bit) para Apple Silicon, y GGUF Q8_0 y Q4_K_M para llama.cpp en CPU y CUDA.

Su relevancia práctica está en el tamaño: con 270M parámetros y cuantización 4-bit, el modelo ocupa alrededor de 0,5 GB en memoria y puede ejecutarse en CPU, en GPU de consumo y en dispositivos Apple, lo que lo hace apto para agentes locales de bajo coste donde la latencia y el footprint importan más que el razonamiento general. La ventana de contexto no está documentada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma; detalles de atención no disponibles) |
| Parametros totales | 268.098.176 (268M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit, MLX 8-bit, GGUF Q8_0, GGUF Q4_K_M, BF16 (checkpoint fusionado) |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma Terms of Use (+ Prohibited Use Policy) |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de `google/functiongemma-270m-it`, un transformer decoder-only de la familia Gemma orientado a function calling. NorviTech aplica un ajuste fino en dos etapas sobre el checkpoint base: primero un SFT con LoRA en BF16 durante 2 épocas a learning rate 1.5e-4 sobre 12.620 ejemplos, y después una fase de optimización de preferencias RPO-DPO acotada a 20 pasos con learning rate 1.5e-6 sobre pares de preferencia contrastivos con anclaje positivo ("positive-anchored"). Los adaptadores se fusionan en BF16 y el checkpoint resultante se cuantiza a MLX 4-bit/8-bit y GGUF Q8_0/Q4_K_M.

La tarea declarada es la clasificación y emisión de llamadas entre 28 clases de herramientas ("28-class two-stage fine-tune"), con especial énfasis en distinguir llamadas positivas correctas de negativos duros (peticiones que parecen invocaciones pero no deben ejecutarse). No se documentan en la información disponible ni la composición detallada del dataset, ni el número de tokens de entrenamiento, ni innovaciones arquitectónicas propias (no hay decodificación especulativa ni atención lineal documentadas).

## Capacidades

- Generación de llamadas a herramientas (tool calling) estructuradas sobre un espacio de 28 clases de funciones definido por el autor.
- Distinción entre llamadas legítimas y negativos duros: el modelo está entrenado para no proponer invocaciones cuando la petición no lo justifica.
- Bloqueo de propuestas de escritura no autorizadas antes de su ejecución (requiere confirmación externa).
- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- No se documenta soporte de visión, audio, modo thinking explícito ni capacidades multilingües más allá del inglés.
- El soporte de agentes multi-paso depende del orquestador externo; el modelo emite la llamada, no gestiona el bucle.

## Casos de uso

- Agentes locales de automatización personal: con 270M parámetros y cuantización 4-bit, el modelo cabe en un portátil o en una Raspberry Pi y puede decidir qué función invocar (calendario, ficheros, APIs domésticas) sin depender de la nube.
- Enrutamiento de intenciones en pipelines de backend: clasificar una petición de usuario en una de las 28 clases de herramientas y emitir los argumentos en formato estructurado antes de pasar el control a un servicio especializado.
- Asistentes de atención al cliente con catálogo cerrado de acciones: el modelo decide entre consultar pedido, abrir incidencia o escalar a humano, con la ventaja de que su tasa de negativos duros verificados (91,59% en Track B) reduce invocaciones espurias.
- Integración en aplicaciones macOS/iOS mediante MLX: el export `mlx-4bit/` permite ejecutar el modelo en Metal sobre Apple Silicon con latencia baja para asistentes de escritorio.
- Despliegue en entornos con CPU únicamente: el GGUF Q4_K_M rinde 88,75% Track B en CPU Linux x86_64 con p50 en caliente de 131,32 ms, adecuado para servicios sin GPU.
- Guardarraíl de acciones sensibles: usar el modelo como filtro previo que detecta y bloquea propuestas de escritura no confirmadas (26 de 3.135 en la evaluación sellada) antes de que lleguen al sistema de ejecución.
- Pruebas de CI/CD de agentes: al ser pequeño y determinista con temperature=0, sirve como componente reproducible en tests de integración de pipelines de tool calling.

## Benchmarks y rendimiento

Evaluación sellada "acceptance-v8" sobre el checkpoint fusionado en BF16, temperature=0, N=3.135:

| Split | N | Track A (raw exact) | Track B (verified exact) |
|---|---|---|---|
| Llamadas positivas | 1.685 | 62,79% | 65,34% |
| Negativos duros | 1.450 | 71,79% | 91,59% |
| Escrituras no autorizadas bloqueadas | 3.135 | 26 propuestas (19 positivas + 7 negativas) | — |

Cualificación de exports cuantizados sobre "overnight-v1 Open-Phrasing Suite" (N=80), Track B verified exact:

| Artefacto | Plataforma | Track A | Track B | Latencia p50 en caliente |
|---|---|---|---|---|
| MLX 4-bit | macOS ARM64 Metal | 70,00% | 82,50% | no disponible |
| MLX 8-bit | macOS ARM64 Metal | no disponible | 90,00% | no disponible |
| GGUF Q4_K_M | macOS ARM64 CPU | no disponible | 90,00% | no disponible |
| GGUF Q4_K_M | macOS ARM64 Metal | no disponible | 88,75% | no disponible |
| GGUF Q4_K_M | Linux x86_64 CPU | no disponible | 88,75% | 131,32 ms |
| GGUF Q4_K_M | Linux CUDA | no disponible | 90,00% | 40,73 ms |
| GGUF Q4_K_M | Windows Server 2025 AMD64 CPU | no disponible | 88,75% | 372,40 ms (539,29 MiB PeakWorkingSet) |
| GGUF Q8_0 | Linux x86_64 CPU | no disponible | 87,50% | no disponible |
| GGUF Q8_0 | Linux CUDA | no disponible | 88,75% | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16 ocupa aproximadamente 0,54 GB en pesos; con MLX 4-bit o GGUF Q4_K_M baja a unos 0,15-0,2 GB de pesos, más overhead de runtime y KV cache (que depende de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente (RTX 3050/4060, T4, L4). En Linux CUDA el autor reporta p50 de 40,73 ms con Q4_K_M.
- Cabe holgadamente en GPU de consumo y en Apple Silicon (MLX 4-bit/8-bit sobre Metal). También funciona en CPU x86_64 (131,32 ms p50 en Linux) y en Windows Server (372,40 ms p50, 539,29 MiB de pico de memoria de trabajo).
- Opciones de despliegue: llama.cpp (GGUF Q8_0 y Q4_K_M), MLX en macOS ARM64, y cualquier runtime compatible con GGUF. No se documenta soporte explícito de vLLM, TGI u Ollama en la información disponible, aunque el formato GGUF es compatible con Ollama de forma genérica.
- Throughput: no disponible; solo se publican latencias p50 en caliente por plataforma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARRMES FunctionGemma-270M (este) | 268M | no disponible | Tool calling especializado (28 clases) | Gemma Terms | HF (MLX + GGUF) |
| google/functiongemma-270m-it (base) | 270M | no disponible | Tool calling general | Gemma Terms | HF |
| google/gemma-3-270m-it | 270M | no disponible | Instrucción general | Gemma Terms | HF |
| Qwen2.5-0.5B-Instruct | 494M | 32K (según ficha pública de Qwen) | Instrucción general + tool calling | Apache 2.0 | HF |

La comparación cuantitativa de rendimiento con los modelos base y alternativas no está disponible en la información proporcionada: el autor solo publica métricas internas de su suite ARRMES, no comparaciones cruzadas con otros modelos.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está calibrado para 28 clases de herramientas concretas de ARRMES v1.7.2; fuera de ese esquema el rendimiento puede degradarse notablemente.
- Solo inglés: no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación en argumentos: aunque reduce llamadas espurias, el 62,79% de exactitud raw en llamadas positivas implica que una fracción relevante de invocaciones no coincide exactamente con la referencia.
- Escrituras no autorizadas: la evaluación reporta 26 propuestas de escritura no autorizadas en 3.135 casos; el sistema debe bloquearlas con confirmación externa, no confiar solo en el modelo.
- Licencia Gemma Terms of Use con Prohibited Use Policy: el uso comercial está permitido bajo esas condiciones, pero conviene revisar las restricciones de redistribución y las obligaciones de atribución antes de desplegar.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o con muchas herramientas en el prompt.
- Sin likes ni tracción comunitaria (0 likes, 860 descargas en la fecha de consulta): no hay validación independiente de las métricas del autor.
- Evaluaciones internas: todos los benchmarks provienen del propio autor y de suites privadas ("acceptance-v8", "overnight-v1"), sin comparación con estándares públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorviTech/arrmes-functiongemma-270m
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
