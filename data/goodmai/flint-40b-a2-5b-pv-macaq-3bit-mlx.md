# goodmai/Flint-40B-A2.5B-PV-MACaQ-3bit-MLX

## Resumen

Flint-40B-A2.5B-PV-MACaQ-3bit-MLX es un checkpoint cuantizado del modelo `RecursiveSI/flint`, un transformer de tipo Mixture of Experts con 40B parámetros totales y 2.5B activos (256 expertos), publicado por el usuario `goodmai`. La cuantización aplica el algoritmo MACaQ (Model Agnostic Calibrated Quantization, arXiv:2611.10649) en precisión de 3 bits afín sobre las proyecciones lineales, manteniendo embeddings y cabeza de salida en 4 bits. El objetivo es hacer viable en Apple Silicon un modelo que en BF16 ocupa 79.58 GB y no cabe en memoria unificada de 24 GB.

El checkpoint resultante ocupa 17.54 GB (una reducción de 4.54×) y está pensado para ejecutarse nativamente en Metal/MLX a través de Basalt, un runtime Swift/Metal que implementa la transformada de Walsh-Hadamard y el `quantizedMM` de Apple Silicon. En una máquina M4 Pro de 24 GB alcanza 72 tok/s de decodificación con un TTFT de 0.070 s y un consumo de memoria activa de 16.712 MB.

La relevancia actual del modelo reside en dos frentes: por un lado, demuestra que la cuantización calibrada de 3 bits permite desplegar arquitecturas MoE de gran tamaño en hardware de consumo; por otro, sirve como banco de pruebas reproducible para evaluar la degradación de capacidades de razonamiento y generación de código bajo cuantización agresiva, con resultados mixtos (2 de 5 rungs superados en el benchmark "Ladder to the Moon").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (familia `flint`, 256 expertos) |
| Parametros totales | 29.999.919.136 (≈30B según safetensors; el autor declara 40B-A2.5B) |
| Parametros activos | 2.5B (según nomenclatura del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PV-MACaQ 3-bit Affine (g=64, B=64, α=0.75, alternating P/V-step) + 4-bit en embeddings y head |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base es `RecursiveSI/flint`, un transformer de tipo Mixture of Experts con 256 expertos por capa y 2.5B parámetros activos sobre un total declarado de 40B (la suma real de safetensors es de 29.999.919.136 parámetros). No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card del checkpoint cuantizado no incluye estos datos.

La innovación técnica de este checkpoint es la cuantización MACaQ, implementada en Swift/Metal dentro de Basalt. El pipeline consta de tres etapas: (1) channel balance con exponente α=0.75 para ecualizar los rangos dinámicos de pesos y activaciones; (2) rotación mediante una trama Sylvester Walsh-Hadamard de bloque B=64; y (3) refinamiento discreto de códigos mediante descenso por coordenadas sobre el Hessiano con conjunto activo. Se aplicaron 303.055.563 actualizaciones monótonas de escalas y sesgos (P-step) y 1.037.838.721 volteos discretos de código (V-step), logrando una mejora de +3.93 dB de SNR respecto a la cuantización RTN de 3 bits. Se cuantizaron 343 proyecciones 2D y 141 tensores `MACaQSwitchLinear` 3D apilados de 256 expertos. La verificación de integridad de Basalt reportó `intact = true` con `quantizationMode = "macaq"` tras 2326.2 s de proceso.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con trazas de razonamiento explícitas (bloques `[reasoning]` en la salida).
- Generación de código en tareas algorítmicas: el benchmark interno muestra resolución correcta de álgebra lineal, Fibonacci, traducción y raíces de ecuaciones bicuadráticas (reales y complejas) con residual < 1e-9.
- Traducción multilingüe: el rung `translation` etiqueta correctamente 3 de 3 idiomas objetivo.
- Razonamiento matemático simbólico y numérico en contextos de hasta ~12.000 tokens generados (observado en el rung `lunar`).
- Ejecución nativa en Apple Silicon vía MLX y Basalt, con decodificación a 72 tok/s en M4 Pro.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: parcial; el modelo produce trazas de razonamiento, pero los rungs de código complejo (`fourier`, `pump`, `lunar`) fallan al no emitir bloques de código que definan las funciones solicitadas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales en Mac: el checkpoint cabe en 24 GB de memoria unificada y decodifica a 72 tok/s, lo que permite iterar sobre prompts y flujos multi-turno sin depender de APIs externas ni de GPUs dedicadas.
- Evaluación de cuantización agresiva en investigación: el par base/cuantizado y el benchmark "Ladder to the Moon" permiten medir la degradación de capacidades de razonamiento y código bajo 3 bits, con métricas reproducibles de SNR (+3.93 dB sobre RTN) y tasa de acierto por rung.
- Generación de código para tareas algorítmicas bien delimitadas: el modelo resuelve correctamente problemas de álgebra, sucesiones y raíces de polinomios, por lo que encaja en asistentes de scripting o generación de funciones utilitarias con validación posterior.
- Traducción automática de documentos cortos: el rung de traducción supera 3/3 idiomas objetivo, lo que lo hace utilizable para traducción de párrafos en pipelines ligeros sobre hardware Apple.
- Enseñanza y demostraciones de razonamiento paso a paso: la emisión de trazas `[reasoning]` estructuradas facilita su uso en entornos educativos para mostrar descomposición de problemas.
- Servicio REST local con Basalt: el comando `basalt serve --rest --reasoning-effort none` permite exponer el modelo como endpoint HTTP en una estación de trabajo Mac, útil para integraciones internas de bajo volumen.
- Investigación sobre formatos de cuantización: los detalles de channel balance, rotación Hadamard y refinamiento Hessiano sirven como referencia implementable para quienes desarrollen sus propios esquemas de cuantización calibrada.

## Benchmarks y rendimiento

Datos medidos por el autor en Apple M4 Pro de 24 GB:

| Checkpoint | Cuantización | Tamaño | Velocidad decodificación | TTFT | Memoria activa | Ladder to the Moon |
|---|---|---:|---:|---:|---:|---:|
| `RecursiveSI/flint` | BF16 (40B-A2.5B, 256 expertos) | 79.58 GB | OOM en 24 GB | — | > 24 GB | — |
| `goodmai/Flint-40B-A2.5B-PV-MACaQ-3bit-MLX` | PV-MACaQ 3-bit Affine (g=64, B=64, α=0.75) | 17.54 GB (4.54×) | 72.00 tok/s | 0.070 s | 16.712 MB | 2/5 |

Resultados del benchmark "Ladder to the Moon" (5 rungs + warm-up 3/3):

| Stage / Rung | Veredicto | Tokens | Velocidad | Detalle |
|---|---|---:|---:|---|
| `algebra` | PASS | 134 | 60.0 tok/s | x = 5 |
| `fibonacci` | PASS | 460 | 67.2 tok/s | fibonacci(10,20,30) = [55, 6765, 832040] |
| `translation` | PASS | 1073 | 67.4 tok/s | 3/3 idiomas objetivo etiquetados |
| `biquad-real` | PASS | 4034 | 65.8 tok/s | 5/5 casos, incluidos vacío, repetido y raíces cero |
| `biquad-complex` | PASS | 11106 | 58.7 tok/s | 4 casos × 4 raíces, residual < 1e-9 |
| `fourier` | FAIL | 9647 | 57.3 tok/s | sin bloque de código que defina `fourier_coefficients` |
| `pump` | FAIL | 6538 | 59.6 tok/s | sin bloque de código que defina `pump_head` |
| `lunar` | FAIL | 12288 | 51.0 tok/s | sin bloque de código que defina `exhaust_velocity` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16.712 MB de memoria activa medida en M4 Pro de 24 GB; el checkpoint en disco ocupa 17.54 GB.
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada (M4 Pro validado por el autor). No hay datos de rendimiento en A100, H100 ni RTX 4090, ya que el formato es MLX/Metal y no CUDA.
- Cabe en GPU de consumo: sí, en Apple Silicon de gama alta (M4 Pro 24 GB y superiores). No es ejecutable en GPUs NVIDIA de consumo con este formato.
- Opciones de despliegue: Basalt (`basalt run`, `basalt serve --rest`), librería MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 72.00 tok/s de decodificación (σ=0.349), TTFT de 0.070 s (σ=0.001), tiempo de generación de 1.184 s para 80 tokens en 3 iteraciones.
- El modelo base en BF16 requiere más de 24 GB y provoca OOM en M4 Pro de 24 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `goodmai/Flint-40B-A2.5B-PV-MACaQ-3bit-MLX` | 30B totales / 2.5B activos (MoE) | no disponible | 72 tok/s en M4 Pro 24 GB; 2/5 rungs | apache-2.0 | Hugging Face (MLX) |
| `RecursiveSI/flint` (base BF16) | 40B-A2.5B (MoE) | no disponible | OOM en M4 Pro 24 GB | no disponible | Hugging Face |
| Alternativas MLX de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de 30-40B cuantizados para Apple Silicon) en la documentación proporcionada.

## Limitaciones y advertencias

- Degradación funcional bajo cuantización de 3 bits: el modelo falla en 3 de 5 rungs del benchmark interno (`fourier`, `pump`, `lunar`), todos ellos tareas de generación de código que requieren definir funciones específicas. No debe asumirse paridad con el modelo base en tareas de código complejo.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; la cuantización agresiva puede incrementar la tasa de errores factuales y de formato, como evidencian los fallos de emisión de bloques de código.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y los idiomas soportados no se especifican. El benchmark de traducción solo cubre 3 idiomas no identificados.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la licencia del modelo base `RecursiveSI/flint` no se detalla en la información disponible; conviene verificarla antes de un despliegue comercial.
- Dependencia de hardware: el checkpoint es MLX/Metal y solo se ejecuta en Apple Silicon; no hay soporte CUDA ni GGUF documentado.
- Reproducibilidad: el benchmark se ejecutó en una única máquina (M4 Pro 24 GB) y con una sola configuración de decodificación; no se reportan intervalos de confianza sobre la calidad, solo sobre la velocidad.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Flint-40B-A2.5B-PV-MACaQ-3bit-MLX
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Paper MACaQ: https://arxiv.org/abs/2611.10649
- Repositorio Basalt: https://github.com/goodmai/basalt
- Sitio web Basalt: https://bas-alt.vercel.app
- Demo "Run with Basalt": https://huggingface.co/spaces/goodmai/run-with-basalt?model=goodmai%2FFlint-40B-A2.5B-PV-MACaQ-3bit-MLX
