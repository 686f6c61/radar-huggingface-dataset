# CaryPalmer/Ternary-Bonsai-2-27B-262k-GGUF

## Resumen

Ternary-Bonsai-2-27B-262k-GGUF es una distribución de inferencia del modelo Ternary Bonsai 2 27B de PrismML, publicada por CaryPalmer. No se trata de una nueva cuantización de los pesos: el autor mantiene el fichero ternario original de PrismML (formato `PTQ1_0`, 1,58 bits, 5,9 GB, licencia Apache 2.0) y le injerta la cabeza MTP (multi-token prediction) de borrador afinada en Q8_0 procedente de ProCreations, además de un stack de servicio propio. El objetivo declarado es servir la ventana de contexto completa de 262.144 tokens en una única GPU de consumo de 12 GB (RTX 4070) con precisión de caché KV q8_0 y salida bit a bit idéntica a la del modelo sin decodificación especulativa.

La arquitectura subyacente es un transformer denso de tipo Qwen 3.5 con 27.320.697.856 parámetros totales, pesos ternarios y una ventana de entrenamiento de 262.144 tokens. La aportación diferencial del repositorio es de ingeniería de despliegue: caché KV por niveles que mantiene aproximadamente los primeros 119.000 tokens en VRAM y el resto en RAM del sistema fijada (pinned), decodificación especulativa con la cabeza MTP activa a cualquier profundidad, y una capa de servidor opcional que normaliza peticiones incompatibles de clientes agénticos (por ejemplo, `effort: "high"`) y expone tool calling nativo en XML.

Es relevante ahora porque demuestra que buena parte de la brecha de calidad percibida en modelos comprimidos para código y agentes procede del runtime y no de la compresión: el autor reporta subidas de HumanEval de 0 a 160 y de AppWorld de 64,3 % a 70,8 % sin tocar los pesos. La distribución está orientada a Windows con GPU NVIDIA RTX 20/30/40/50 y se publica bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen 3.5, pesos ternarios (1,58 bits, `PTQ1_0`), con cabeza MTP de decodificacion especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (ventana completa de entrenamiento) |
| Tipos de cuantizacion | Pesos ternarios `PTQ1_0` (1,58 bits); cache KV en q8_0 o q4_0; fichero GGUF de 6,40 GB con cabeza MTP |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), compatible con safetensors del modelo base |
| Tamano del repo | 22,9 GB |
| Descargas / likes | 6.069 / 37 |
| Fecha de creacion / actualizacion | 2026-10-07 / 2026-10-17 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27.320 millones de parámetros con ventana de 262.144 tokens, cuantizado a pesos ternarios mediante post-training quantization en el formato `PTQ1_0` (1,58 bits efectivos, 5,9 GB). Sobre ese tronco, esta distribución injerta como `blk.64.*` una cabeza MTP Q8_0 afinada on-policy por ProCreations, manteniendo cada tensor original byte a byte idéntico al fichero de PrismML, según la prueba documentada en el repositorio. No se ha re-cuantizado nada.

La innovación técnica está en el stack de servicio, no en el entrenamiento: caché KV por niveles (primeros ~119.000 tokens en VRAM, resto en RAM fijada) con salida bit-idéntica, decodificación especulativa con aceptación de borrador del 70,6 % y activa a toda profundidad, normalización de parámetros de petición que el template rechaza, elevación automática de topes de salida cuando el modo thinking está activo, y tool calling nativo en XML con gramática de servidor. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con modo thinking y presupuesto de razonamiento configurable.
- Generación de código: módulos Python y reescritura de ficheros completos a partir del contexto.
- Tool calling / function calling nativo en XML, con gramática de servidor que garantiza el parseo (9 de 9 peticiones en la prueba del autor, frente a 1 de 9 con el servicio estándar).
- Uso como agente ReAct con ejecución de código en sandbox a través de la capa de servidor opcional.
- Contexto largo real: ventana completa de 262.144 tokens servida en 12 GB de VRAM.
- Decodificación especulativa sin pérdida en todas las profundidades de contexto.
- Capacidades multilingües: limitadas al inglés según la model card.
- Compatibilidad con API OpenAI (`/v1/chat/completions`) en `http://<host>:8080/v1`.

## Casos de uso

- Agentes de código autónomos: el modelo puede ejecutar bucles ReAct con tool calling nativo y sandbox Python; el autor reporta 70,8 % en las 168 tareas de test de AppWorld con solo 1 respuesta mal formateada y 1 salida por tope de pasos, lo que lo hace viable para pipelines agénticos en producción.
- Asistencia de programación en IDE con clientes agénticos (Cline, Kilo, Open WebUI): la capa de servidor normaliza `effort: "high"` y eleva los topes de salida de 256-4096 tokens cuando el thinking está activo, evitando los HTTP 500 y los cortes a mitad de razonamiento que sufren las recetas publicadas.
- Reescritura y refactorización de ficheros completos: la decodificación por lookup drafting alcanza 352 tok/s a 4k de contexto, 164 a 130k y 66 a 250k cuando la respuesta copia el contexto, lo que permite regenerar módulos enteros dentro de la ventana.
- Análisis de documentos y bases de código extensas: con 262.144 tokens de contexto servidos íntegramente en una RTX 4070, se pueden cargar repositorios medianos o expedientes largos sin troceado ni recuperación externa.
- Despliegue en estaciones de trabajo con GPU de consumo: un único comando en Windows sobre RTX 20/30/40/50 levanta el servidor compatible con OpenAI, adecuado para equipos de desarrollo sin acceso a clústeres.
- Evaluación comparativa de modelos comprimidos: el repositorio incluye suites de exact-work, AIME 2025, MMLU-Pro y HumanEval con seeds fijas y recibos en `docs/QUALITY.md`, útil para reproducir mediciones de calidad en runtime controlado.
- Prototipado de asistentes con razonamiento largo: el modo thinking con presupuesto elevado automáticamente permite tareas de matemáticas y lógica (56 en AIME 2025 con la capa de servidor) sin recortes de salida.

## Benchmarks y rendimiento

Rendimiento medido el 2026-10-08 en una RTX 4070 de 12 GB, un solo slot, respuestas greedy de 400 tokens:

| Contexto | Decode texto nuevo (tok/s) | Decode código (tok/s) | Prefill (tok/s) |
|---|---:|---:|---:|
| 4k | 102 | 102 | 1.173 |
| 16k | 83 | 242 | 1.137 |
| 32k | 78 | 175 | 1.031 |
| 64k | 69 | 109 | 867 |
| 112k (en VRAM) | 61 | 91 | 698 |
| 131k | 30 | 63 | 649 |
| 180k | 17,9 | 28 | 547 |
| 258k (final de ventana) | 8,6 | 12,1 | 436 |

Calidad (según el autor; sin datos independientes en la información disponible):

| Benchmark | Servicio estándar | Este servicio | Con capa de servidor |
|---|---:|---:|---:|
| HumanEval 164 (app con `effort: "high"`) | 0 (HTTP 500) | 160 | 161 (medium, sandbox) |
| AppWorld (168 tareas) | 64,3 % | — | 70,8 % (IC 95 %: 63,6-77,2) |
| AIME 2025 (60) | 52 | — | 56 |
| MMLU-Pro (100) | 71 | — | 76 |
| Suite exact-work (37 tareas) | 17 | — | 28 (29 en segundo set de seeds) |
| Tool calls parseados (9 peticiones) | 1 de 9 | — | 9 de 9 |

## Requisitos de hardware

- VRAM: 12 GB suficientes para la ventana completa de 262.144 tokens con caché KV q8_0 y aproximadamente el 99 % en VRAM con q4_0; el fichero GGUF con cabeza MTP ocupa 6,40 GB.
- GPU recomendadas: RTX 4070 12 GB como referencia medida; el bundle incluye código máquina sm_75, sm_86 y sm_89 (RTX 20/30/40) y PTX compute_89 para RTX 50.
- Cabe en GPU de consumo: sí, en RTX 20/30/40/50 con 12 GB o más; requiere driver NVIDIA y CUDA 13 (runtime incluido en el bundle).
- Despliegue: llama.cpp parcheado (fork de PrismML más 66 parches), servidor compatible con OpenAI en el puerto 8080, launcher `start-server.ps1` que dimensiona la línea de VRAM según la memoria libre.
- Sistema operativo: Windows x64 (el bundle es `bonsai-bundle-win-x64.zip`, 617 MB); no se documenta soporte Linux en la información disponible.
- Throughput y latencia: ver tabla de benchmarks; la decodificación especulativa aporta +50-100 % de decode con 70,6 % de aceptación de borrador.
- Alternativa sin drafting: `BONSAI_SPEC=0` o el fichero original de PrismML sin cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-262k (esta ficha) | 27,3 B | 262.144 | Ternaria PTQ1_0 + cabeza MTP Q8_0 | Apache 2.0 | GGUF en HF, bundle Windows |
| Ternary-Bonsai-2-27B (PrismML, original) | 27,3 B | 262.144 | Ternaria PTQ1_0 | Apache 2.0 | GGUF en HF |
| Ternary-Bonsai-2-27B-MTP (ProCreations) | 27,3 B | 262.144 | Ternaria PTQ1_0 + cabeza MTP | no disponible | GGUF en HF |

No se dispone en la información proporcionada de datos de benchmarks comparativos frente a modelos de otros autores con el mismo tamaño o la misma tarea, por lo que la comparación cuantitativa con alternativas externas se considera no disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés según la model card; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Alucinación: no se publican métricas de fidelidad factual; el modo thinking y el contexto largo no eliminan el riesgo, y la capa de servidor con referencias exactas solo mitiga parte del problema en tareas de código.
- Dependencia de plataforma: el bundle de servicio está empaquetado exclusivamente para Windows x64 con GPU NVIDIA; no hay binarios Linux documentados en esta distribución.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y de la cabeza MTP de terceros deben verificarse por separado (la licencia de ProCreations no está disponible en la información proporcionada).
- Los benchmarks de calidad proceden del propio autor, con suites y seeds propias; no se han validado de forma independiente.
- La decodificación especulativa solo es sin pérdida con la cabeza MTP injertada; usar el fichero original sin ella desactiva la aceleración.
- El rendimiento cae de forma marcada más allá de los ~119.000 tokens (de 61 a 30 tok/s al pasar a 131k), por el volcado de la caché KV a RAM del sistema.
- Clientes que envían parámetros no soportados por el template requieren la capa de normalización; sin ella, el servidor estándar devuelve errores HTTP 500.

## Enlaces

- Hugging Face (esta distribución): https://huggingface.co/CaryPalmer/Ternary-Bonsai-2-27B-262k-GGUF
- Modelo base en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Cabeza MTP de ProCreations: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Repositorio del stack de servicio: https://github.com/professorpalmer/bonsai-ada-surgery
- Documentación de contexto completo: `docs/Q8_FULL_CONTEXT.md` (en el repositorio anterior)
- Recibos de benchmarks: `docs/RECEIPTS.md` (en el repositorio anterior)
- Calidad: `docs/QUALITY.md` (en el repositorio anterior)
- Script de benchmark por profundidad: `bench/depth_table.sh` (en el repositorio anterior)
