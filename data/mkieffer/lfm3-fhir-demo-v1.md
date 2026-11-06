# mkieffer/LFM3-FHIR-demo-v1

## Resumen

LFM3-FHIR-demo-v1 es un ajuste fino (SFT completo) del modelo base LiquidAI/LFM3-1.7B, publicado por el usuario mkieffer en Hugging Face. El modelo está especializado en tareas de búsqueda y actualización sobre registros de salud electrónicos (EHR) sintéticos mediante la API REST FHIR R4, actuando como un agente que interpreta peticiones en lenguaje natural de personal clínico o administrativo y las traduce en llamadas a la herramienta `fhir_request` (GET search/read, POST, PUT con If-Match, DELETE y transaction Bundles).

El interés del modelo radica en su tamaño reducido: con 1.728.801.600 parámetros y una cuantización Q4_K_M de 1,10 GB, puede ejecutarse en la CPU de un portátil o dentro de una pestaña del navegador mediante un runtime WebGPU. Esto lo convierte en una pieza útil para demostraciones, prototipos e investigación sobre agentes de tool calling en dominios sanitarios, sin necesidad de infraestructura GPU.

El modelo se distribuye únicamente en formato GGUF para llama.cpp, está entrenado exclusivamente en inglés y su uso previsto se limita a investigación y demostración sobre historiales sintéticos. No es un dispositivo médico ni ha sido validado con datos reales de EHR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM3-1.7B; el autor no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de ejecución recomendada (`-c 32768`); entrenamiento con longitud máxima de 16K |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado); el autor reporta también evaluaciones en BF16 y Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial solo para entidades con ingresos anuales inferiores a 10 millones de USD |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B (revisión `ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7`) y se somete a un ajuste fino supervisado completo (full SFT) durante 2 épocas, con learning rate 1e-5 y longitud máxima de 16K tokens. El conjunto de entrenamiento consta de 7.733 filas SFT generadas a partir de transcripciones de GPT-OSS 120B sobre el split de entrenamiento de fhir-env natural-track v0.2.1, conservando únicamente aquellas que resultaron estrictamente exitosas, sin escrituras dañinas y con un máximo de un error de herramienta bajo la calificación corregida. Se añadieron también conjuntos previos del track keyed. Las tareas del split de desarrollo nunca entran en el entrenamiento.

La cuantización se realizó con llama.cpp b12098, calculando una importance matrix (imatrix) sobre 200 secuencias de 4096 tokens de transcripciones FHIR del split de entrenamiento. El modelo conserva el modo de razonamiento (thinking) con el que fue entrenado y utiliza la plantilla de chat embebida en el GGUF. No se detallan innovaciones arquitectónicas propias más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento (thinking) activado.
- Tool calling estructurado: invoca la herramienta `fhir_request` con esquema en formato OpenAI tools, cubriendo GET (search/read), POST, PUT con If-Match, DELETE y transaction Bundles.
- Razonamiento multi-paso orientado a agentes: localiza al paciente, lee los registros necesarios, aplica el cambio solicitado y responde con un JSON más la evidencia `Type/id` consultada.
- Cumplimiento del contrato de herramienta y del system prompt específicos de fhir-env.
- Capacidad de operar en CPU y en navegador (WebGPU) gracias a la cuantización Q4_K_M.
- No dispone de capacidades de visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Demostración interactiva de agentes FHIR en navegador: cargar el GGUF Q4_K_M en un runtime WebGPU permite mostrar a investigadores y desarrolladores el ciclo completo de búsqueda, lectura y actualización sobre historiales sintéticos sin infraestructura de servidor.
- Prototipado de asistentes administrativos sanitarios: el modelo interpreta peticiones como abrir una tarea de reconciliación de medicación o registrar un mensaje de portal, traduciéndolas a llamadas FHIR concretas sobre datos sintéticos para validar flujos antes de invertir en modelos mayores.
- Evaluación de pipelines de tool calling en CPU: al ejecutarse con `llama-server` en un portátil, sirve como banco de pruebas de bajo coste para medir errores de herramienta, latencia y robustez de esquemas antes de escalar a modelos de mayor tamaño.
- Generación de datos sintéticos de entrenamiento: sus transcripciones exitosas pueden servir como material inicial para ampliar conjuntos SFT en dominios FHIR, siempre con revisión humana.
- Investigación en seguridad de agentes con acceso de escritura: permite estudiar políticas de confirmación humana y detección de escrituras dañinas en un entorno controlado y sintético.
- Docencia y formación técnica: ilustra de forma práctica cómo un modelo de 1,7B puede encadenar razonamiento, selección de herramienta y verificación de evidencia en un dominio regulado.

## Benchmarks y rendimiento

Evaluación sobre el split **dev** de fhir-env natural-track v0.2.1 (1.661 tareas × 2 rollouts), servido en BF16 con vLLM:

| Modelo | Strict, natural | Safe, natural | Strict, keyed |
|---|---|---|---|
| LFM3-FHIR-demo-v1 (SFT v0.5.1, BF16) | 37,4% | 36,7% | 84,3% |
| GRPO v0.5 (LFM3 1.7B previo, RL) | 28,6% | 28,2% | 79,1% |
| SFT v0.4 (LFM3 1.7B previo) | 28,8% | 27,6% | 68,8% |
| GPT-OSS 120B (profesor) | 39,0% | 36,1% | 71,7% |

Evaluación de cuantización sobre un subconjunto estratificado fijo de 543 tareas dev, servido con llama.cpp `llama-server` (b12098) en CPU:

| Nivel | Tamano | KLD vs BF16 | Strict, natural | Safe, natural | Strict, keyed | Δ natural strict vs BF16 | Errores de herramienta / episodio |
|---|---|---|---|---|---|---|---|
| BF16 | 3,47 GB | – | 34,2% | 32,8% | 84,6% | referencia | 1,31 |
| Q4_K_M | 1,10 GB | 0,101 | 33,3% | 31,8% | 86,7% | -0,9 pts [-3,8, +2,0] | 1,30 |

El autor advierte que, con un solo rollout sobre 543 tareas, las diferencias de pocos puntos entre niveles están dentro del ruido entre ejecuciones; la divergencia KL respecto a BF16 sobre transcripciones FHIR es la medida más estable del coste de la cuantización.

## Requisitos de hardware

- Inferencia en CPU viable: el archivo Q4_K_M ocupa 1,10 GB y está pensado para ejecutarse en la CPU de un portátil.
- Ejecución en navegador mediante runtime WebGPU, cargando el Q4_K_M desde el repositorio.
- VRAM estimada: no disponible de forma explícita; por tamaño de pesos, el Q4_K_M requiere del orden de 1,1 GB más overhead de contexto (hasta 32K tokens), por lo que cabría en GPUs consumer con 4-8 GB de VRAM, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible; el autor no especifica modelos de GPU.
- Despliegue: llama.cpp (`llama-server`) con `--jinja -c 32768 --temp 0.1 --top-k 50 --repeat-penalty 1.1`; también compatible con endpoints OpenAI. No se mencionan vLLM ni TGI para el GGUF (vLLM se usó solo para servir BF16 en la evaluación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento FHIR (strict natural) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-FHIR-demo-v1 | 1,73B | 32K en ejecución (16K entrenamiento) | 37,4% (BF16) / 33,3% (Q4_K_M) | LFM Open License v1.0 (comercial < 10 M USD) | GGUF en Hugging Face |
| GPT-OSS 120B (profesor) | 120B | no disponible | 39,0% | no disponible | no disponible |
| GRPO v0.5 (LFM3 1.7B, RL) | 1,7B | no disponible | 28,6% | LFM Open License v1.0 | no disponible como checkpoint público |
| SFT v0.4 (LFM3 1.7B) | 1,7B | no disponible | 28,8% | LFM Open License v1.0 | no disponible como checkpoint público |

## Limitaciones y advertencias

- Solo para investigación y demostración sobre historiales sintéticos; no es un dispositivo médico ni ha sido validado con datos reales de EHR.
- No debe conectarse a un EHR de producción con permisos de escritura.
- Solo acierta en una minoría de tareas en lenguaje natural (37,4% strict en el mejor caso); toda escritura propuesta requiere revisión humana.
- Entrenado únicamente en inglés y ajustado al contrato de herramienta y system prompt de fhir-env; fuera de ese contrato el rendimiento puede degradarse.
- Riesgo de alucinación en la evidencia citada y en los identificadores `Type/id`; el scorer exige citas honestas, pero el modelo puede generarlas incorrectamente.
- Licencia LFM Open License v1.0: el uso comercial solo se concede a entidades con ingresos anuales inferiores a 10 millones de USD; el uso no comercial e investigador no está sujeto a ese umbral.
- No afiliado ni respaldado por Liquid AI; "LFM" y "Liquid" son marcas de Liquid AI.
- El único archivo publicado es Q4_K_M; no hay versiones BF16, Q8_0 ni safetensors en el repositorio.
- No se han publicado datos sobre sesgos demográficos ni sobre comportamiento con poblaciones diversas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkieffer/LFM3-FHIR-demo-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de Liquid AI sobre LFM3: https://huggingface.co/blog/LiquidAI/lfm3
- Página de LFM3 en LM Studio: https://lmstudio.ai/models/lfm3
