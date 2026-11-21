# NorviTech/arrmes-qwen3-0.6b

## Resumen

ARRMES Qwen3-0.6B es un ajuste fino de Qwen/Qwen3-0.6B desarrollado por NorviTech, orientado especificamente a la generacion de llamadas a herramientas (tool calling) en el contexto de su sistema ARRMES v1.7.2. El modelo parte del checkpoint base de Alibaba Cloud (596 millones de parametros, licencia Apache 2.0) y se especializa mediante un entrenamiento en dos etapas: un SFT con LoRA en BF16 y un posterior refinamiento con RPO-DPO sobre pares de preferencia contrastivos.

La relevancia del modelo radica en su enfoque cerrado y verificable: el autor publica cifras de aceptacion sobre un conjunto sellado de 3.135 casos, con metricas separadas para llamadas positivas y negativos duros, asi como un recuento explicito de propuestas de escritura no autorizadas bloqueadas (0 de 3.135). Esto lo diferencia de ajustes genericos de tool calling, donde la evaluacion suele ser menos trazable.

El modelo se distribuye en tres formatos: pesos BF16 fusionados en safetensors, cuantizaciones MLX de 4 y 8 bits para Apple Silicon, y GGUF Q8_0 y Q4_K_M para llama.cpp en multiples plataformas (macOS ARM64, Linux x86_64, Linux CUDA y Windows AMD64). Su tamano reducido lo hace desplegable en hardware de consumo, a costa de un conocimiento general limitado al del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (fusionado), MLX 4-bit, MLX 8-bit, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Ingles (segun metadatos de Hugging Face) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3-0.6B. Sobre esa base, NorviTech aplica un ajuste fino en dos etapas: primero un SFT con LoRA en BF16 durante 3 epocas, con tasa de aprendizaje 3,5e-4, sobre 12.620 ejemplos; despues un entrenamiento RPO-DPO anclado por NLL durante 1 epoca, con tasa de aprendizaje 4,0e-5, sobre 3.100 pares de preferencia contrastivos. Los adaptadores se fusionan en BF16 antes de exportar a MLX y GGUF.

El objetivo declarado es el "full-schedule 28-class" de ARRMES v1.7.2, es decir, la clasificacion y generacion de llamadas a herramientas dentro de un esquema de 28 clases. La innovacion principal no esta en la arquitectura, sino en el proceso de cualificacion: el autor reporta resultados sobre un conjunto de aceptacion sellado (acceptance-v8, N=3.135) y sobre una suite de fraseo abierto (overnight-v1, N=80), con metricas separadas por artefacto cuantizado y plataforma. El entrenamiento RPO-DPO busca penalizar propuestas de escritura no autorizadas, un aspecto critico en agentes que ejecutan acciones.

## Capacidades

- Generacion de llamadas a herramientas (tool calling) dentro del esquema de 28 clases de ARRMES v1.7.2.
- Distincion entre llamadas positivas y negativos duros, con verificacion de exactitud en dos pistas (Track A raw y Track B verified).
- Bloqueo de propuestas de escritura no autorizadas antes de su ejecucion, segun los resultados reportados (0 de 3.135).
- Generacion de texto conversacional, heredada del modelo base Qwen3-0.6B.
- Soporte de function calling estructurado, orientado a integracion con endpoints compatibles (tag `endpoints_compatible`).
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Orquestacion de agentes con ejecucion controlada de herramientas: el modelo puede clasificar y emitir llamadas a herramientas dentro de un esquema fijo de 28 clases, con un mecanismo de bloqueo de escrituras no confirmadas que reduce el riesgo de acciones destructivas en produccion.
- Asistentes de automatizacion en macOS: la exportacion MLX 4-bit y 8-bit permite ejecutar el modelo en Apple Silicon con Metal, con un 91,25% y 97,50% de exactitud verificada respectivamente en la suite overnight-v1, adecuado para prototipos locales de agentes.
- Despliegue en entornos Linux con CUDA: el GGUF Q4_K_M alcanza un 92,50% de exactitud verificada con una latencia p50 en caliente de 53,01 ms, lo que lo hace viable para servicios de baja latencia en GPU modestas.
- Integracion en pipelines de CI/CD: el formato GGUF y la licencia Apache 2.0 permiten incorporar el modelo en flujos automatizados de validacion de llamadas a herramientas sin coste de licencia.
- Enrutamiento de intenciones en aplicaciones de chat: el modelo puede decidir que herramienta invocar en funcion del turno de conversacion, con un sesgo conservador hacia no ejecutar escrituras sin confirmacion.
- Despliegue en Windows Server: el GGUF Q4_K_M reporta un 88,75% de exactitud verificada en Windows Server 2025 AMD64 con un pico de memoria combinado de 1.210,61 MiB, adecuado para entornos corporativos con recursos limitados.
- Evaluacion y benchmarking de tecnicas de alineacion: la publicacion de metricas por etapa (SFT + RPO-DPO) y por artefacto cuantizado permite reproducir y comparar el efecto de la cuantizacion en la exactitud de tool calling.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el checkpoint BF16 fusionado (acceptance-v8, temperature=0, N=3.135):

| Conjunto | N | Track A raw exact | Track B verified exact |
|---|---|---|---|
| Llamadas positivas | 1.685 | 81,54% | 84,21% |
| Negativos duros | 1.450 | 86,14% | 95,24% |
| Escrituras no autorizadas bloqueadas | 3.135 | 0 propuestas ejecutadas | 0 propuestas ejecutadas |

Resultados por artefacto cuantizado (overnight-v1 Open-Phrasing Suite, N=80, Track B verified exact salvo indicacion):

| Artefacto | Plataforma | Exactitud verificada |
|---|---|---|
| MLX 4-bit | macOS ARM64 Metal | 95,00% (Track A raw: 91,25%) |
| MLX 8-bit | macOS ARM64 Metal | 97,50% |
| GGUF Q4_K_M | macOS ARM64 CPU | 95,00% |
| GGUF Q4_K_M | macOS ARM64 Metal | 91,25% |
| GGUF Q4_K_M | Linux x86_64 CPU | 92,50% |
| GGUF Q4_K_M | Linux CUDA | 92,50% (p50 en caliente: 53,01 ms) |
| GGUF Q4_K_M | Windows Server 2025 AMD64 CPU | 88,75% (pico de memoria: 1.210,61 MiB) |
| GGUF Q8_0 | Linux x86_64 CPU | 97,50% |
| GGUF Q8_0 | Linux CUDA | 97,50% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en BF16 para los 596 millones de parametros; el GGUF Q4_K_M reporta un pico de memoria combinado de 1.210,61 MiB en Windows Server 2025 AMD64.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones de 4 bits; el autor reporta ejecucion en Linux CUDA sin especificar modelo de GPU.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores, y en Apple Silicon mediante MLX.
- Opciones de despliegue: llama.cpp (GGUF Q8_0 y Q4_K_M), MLX en macOS ARM64 (4-bit y 8-bit), y endpoints compatibles segun el tag `endpoints_compatible`. No se documenta soporte explicito de vLLM, TGI u Ollama.
- Latencia y throughput: p50 en caliente de 53,01 ms en Linux CUDA con GGUF Q4_K_M. No se reportan otras cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NorviTech/arrmes-qwen3-0.6b | 596 M | No disponible | Tool calling especializado (28 clases) | Apache 2.0 | Hugging Face (safetensors, MLX, GGUF) |
| Qwen/Qwen3-0.6B | 596 M | No disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| Otros ajustes de tool calling de ~0,5-1 B | No disponible | No disponible | Tool calling generico | Variable | No disponible |

La comparacion con alternativas de la misma categoria no esta disponible en la informacion proporcionada. El unico punto de referencia directo es el modelo base Qwen3-0.6B, del que este ajuste hereda arquitectura y tamano pero del que no se ofrecen metricas comparativas de tool calling.

## Limitaciones y advertencias

- El modelo esta ajustado exclusivamente para el esquema de 28 clases de ARRMES v1.7.2; su comportamiento fuera de ese esquema no esta documentado.
- Los idiomas soportados se limitan al ingles segun los metadatos; no hay evidencia de capacidades multilingues.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar conversaciones de contexto largo.
- Al derivar de un modelo de 0,6 B, el conocimiento general y la capacidad de razonamiento son limitados; el ajuste se centra en tool calling, no en conocimiento factual.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion disponible.
- Las metricas reportadas proceden del propio autor y no de una evaluacion independiente; deben interpretarse con cautela.
- Aunque la licencia es Apache 2.0, el uso comercial requiere conservar los avisos de copyright de Alibaba Cloud y de NorviTech.
- No se documentan sesgos especificos ni evaluaciones de seguridad mas alla del bloqueo de escrituras no autorizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorviTech/arrmes-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
