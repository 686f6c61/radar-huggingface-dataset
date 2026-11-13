# FINAL-Bench/Darwin-36B-Opus

## Resumen

Darwin-36B-Opus es un modelo de lenguaje de tipo mixture-of-experts (MoE) con 36.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, desarrollado por FINAL-Bench / VIDRAFT_LAB. No se trata de un entrenamiento desde cero, sino del resultado de un proceso automatizado de fusión evolutiva denominado Darwin V7, que recombina dos modelos públicos derivados de la misma base: Qwen3.6-35B-A3B y una variante del mismo destilada en razonamiento a partir de trazas de Claude 4.6 Opus. El objetivo es preservar el comportamiento de cadena de pensamiento del padre destilado sin degradar la topología de expertos del padre base.

El modelo se presenta como el miembro de mayor rendimiento de la familia Darwin y declara un 88,4 % de precisión en GPQA Diamond, un conjunto de 198 preguntas de nivel de posgrado en física, química y biología. Según la tabla comparativa publicada por el autor, ese resultado empataría con Qwen3.5-397B-A17B, un modelo con un orden de magnitud más de parámetros. La propuesta central es obtener capacidades de razonamiento avanzado mediante recombinación de pesos en lugar de reentrenamiento, con un coste de cómputo declarado inferior a una hora en una sola GPU.

La relevancia práctica del modelo reside en su relación entre capacidad declarada y huella de inferencia: al ser MoE con 3B activos, el coste por token es bajo en comparación con modelos densos de tamaño similar, y el contexto declarado alcanza los 262.144 tokens. La licencia Apache 2.0 y la disponibilidad de cuantizaciones derivadas para CPU y dispositivos móviles lo sitúan en el espacio de modelos desplegables en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (Qwen3.6-35B-A3B), 256 expertos enrutados |
| Parametros totales | 34.660.610.688 (≈36B) |
| Parametros activos | ≈3B por token (A3B) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16 en el checkpoint principal; GGUF y MLX en los derivados POCKET (cuantizaciones no detalladas en la información disponible) |
| Idiomas soportados | en, zh, ko, ja, de, fr, es, ru, ar (multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF y MLX en derivados |
| Modo de razonamiento | Thinking mode (cadena de pensamiento) |
| Tipo de modelo | text-generation (sin visión ni audio declarados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.6-35B-A3B: un transformer con mezcla de expertos, 256 expertos enrutados y atención híbrida. Sobre esa base, Darwin V7 no aplica un entrenamiento convencional sino una fusión evolutiva entre dos checkpoints con el mismo origen estructural. El padre base aporta la fidelidad de la topología de expertos; el padre de razonamiento, una destilación de trazas de Claude 4.6 Opus, aporta el comportamiento de cadena de pensamiento. El motor de cría recombina ambos y produce un checkpoint desplegable en bfloat16.

El autor declara que el proceso completo es automatizado y se ejecuta en menos de una hora en una única GPU. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO sobre el descendiente; la destilación de razonamiento proviene del padre, no de un pipeline propio documentado. Tampoco se detalla el algoritmo concreto de recombinación (interpolación de pesos, selección por capas o mezcla de expertos), por lo que la reproducibilidad del método queda limitada a lo que publique el autor.

## Capacidades

- Generación de texto conversacional y de formato largo, con ventana de 262K tokens.
- Razonamiento avanzado en modo thinking, con cadenas de pensamiento destiladas del padre de razonamiento.
- Resolución de preguntas de nivel de posgrado en física, química y biología, según el resultado declarado en GPQA Diamond.
- Soporte multilingüe en inglés, chino, coreano, japonés, alemán, francés, español, ruso y árabe.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`) y con la librería transformers.
- Capacidad de ejecución en CPU sin GPU y en iPhone mediante las cuantizaciones derivadas de la familia POCKET.
- No se declaran capacidades de visión, audio, tool calling ni uso de agentes en la información disponible.

## Casos de uso

- Razonamiento científico asistido: el modelo puede abordar preguntas de física, química y biología de nivel graduado activando el modo thinking, lo que lo hace adecuado para herramientas de estudio, generación de exámenes o revisión de hipótesis en entornos de investigación.
- Asistencia a la investigación documental: con 262K tokens de contexto puede ingerir artículos completos, tesis o informes técnicos extensos y responder preguntas que requieran cruzar información entre secciones distantes del documento.
- Despliegue en infraestructura sin GPU: las cuantizaciones POCKET permiten servir el modelo en CPU con llama.cpp estándar, útil para prototipos, entornos air-gapped o demos públicas de bajo coste.
- Aplicaciones móviles: la variante MLX para iPhone permite integrar un modelo de 35B en una app iOS para tareas de razonamiento offline, sin depender de una API externa.
- Atención al cliente multilingüe: la cobertura de nueve idiomas y el contexto largo permiten mantener conversaciones multi-turno con historial extenso en mercados con varios idiomas simultáneos.
- Generación de material didáctico y evaluación: útil para construir bancos de preguntas de dificultad alta y para comparar respuestas de otros modelos contra un referente de razonamiento científico.
- Sustitución de modelos densos grandes en pipelines existentes: al tener 3B activos, el coste por token en inferencia es sensiblemente menor que el de un denso de 36B, lo que permite reemplazar modelos mayores en tareas de razonamiento sin escalar el hardware proporcionalmente.

## Benchmarks y rendimiento

| Modelo | Parámetros | GPQA Diamond |
|---|---|---|
| TNSA/NGen-4-Pro | no disponible | 91,1 % |
| TNSA/NGen-4 | no disponible | 90,1 % |
| Qwen/Qwen3.5-397B-A17B | 397B | 88,4 % |
| FINAL-Bench/Darwin-36B-Opus | 36B (A3B) | 88,4 % |
| moonshotai/Kimi-K2.5 | no disponible | 87,6 % |
| FINAL-Bench/Darwin-27B-Opus | 27B | 86,9 % |
| Qwen/Qwen3.5-122B-A10B | 122B | 86,6 % |
| zai-org/GLM-5.1 | 744B | 86,2 % |
| zai-org/GLM-5 | 744B | 86,0 % |
| zai-org/GLM-4.7 | no disponible | 85,7 % |

Los datos proceden de la tabla publicada por el autor con fecha 23 de abril de 2026 y no están verificados de forma independiente. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 69 GB solo para pesos (34,66B × 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere 80 GB o más, lo que implica A100 80GB, H100 80GB o varias GPU.
- Cuantización a 8 bits: en torno a 35 GB de pesos, viable en una RTX 6000 Ada (48 GB) o A6000.
- Cuantización a 4 bits: en torno a 18-20 GB de pesos, ajustable en una RTX 4090 (24 GB) con contexto moderado; el contexto de 262K exige mucha más memoria de caché KV y no es realista a esa cuantización en consumer.
- CPU: las variantes POCKET permiten ejecución en CPU sin GPU con llama.cpp estándar, sin fork; el throughput esperado es bajo y adecuado para chat interactivo, no para servir en producción de alta concurrencia.
- Móvil: variante MLX para iPhone disponible en la colección POCKET.
- Opciones de despliegue: transformers (formato nativo), llama.cpp y Ollama vía GGUF, MLX en Apple Silicon; vLLM y TGI no están confirmados en la información disponible, aunque la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | GPQA Diamond | Licencia |
|---|---|---|---|---|---|
| Darwin-36B-Opus | 36B | ≈3B | 262K | 88,4 % | Apache 2.0 |
| Qwen3.5-397B-A17B | 397B | 17B | no disponible | 88,4 % | no disponible |
| Qwen3.5-122B-A10B | 122B | 10B | no disponible | 86,6 % | no disponible |
| Darwin-27B-Opus | 27B | no disponible | no disponible | 86,9 % | Apache 2.0 (según familia) |

La comparación relevante es con Qwen3.5-397B-A17B: mismo resultado declarado en GPQA Diamond con once veces menos parámetros totales y con una fracción de los activos. Frente a Darwin-27B-Opus, el 36B ofrece 1,5 puntos más en la misma prueba y comparte linaje y licencia. No se dispone de datos de contexto ni de licencia de los modelos Qwen comparados en la información proporcionada.

## Limitaciones y advertencias

- El resultado de 88,4 % en GPQA Diamond está declarado por el autor y marcado como no verificado; no hay evaluación independiente en la información disponible.
- Solo se publica un benchmark. No hay datos de MMLU, HumanEval, GSM8K, tareas de código, matemáticas ni evaluación multilingüe, por lo que la caracterización del modelo es parcial.
- Al ser una fusión de pesos y no un entrenamiento, los sesgos heredados de ambos padres se transmiten sin mitigación documentada; no se detallan procesos de alineación o filtrado posteriores.
- El riesgo de alucinación es el propio de un modelo de razonamiento destilado: cadenas de pensamiento plausibles pero incorrectas, especialmente fuera de dominios científicos.
- El modo thinking incrementa el número de tokens generados y, por tanto, la latencia y el coste; no se documenta un modo no-thinking alternativo.
- La ventana de 262K tokens es nominal; no se aportan resultados de aguja en pajar ni de degradación con contexto largo.
- Aunque la licencia es Apache 2.0, el linaje incluye una destilación de trazas de Claude 4.6 Opus; conviene revisar las condiciones de uso del padre destilado antes de un despliegue comercial.
- El método de fusión no está especificado en detalle, lo que limita la reproducibilidad y la auditoría del proceso.
- No se declaran capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-36B-Opus
- Padre base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Padre de razonamiento: https://huggingface.co/hesamation/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled
- Hermano Darwin-27B-Opus: https://huggingface.co/FINAL-Bench/Darwin-27B-Opus
- Darwin-4B-Genesis: https://huggingface.co/FINAL-Bench/Darwin-4B-Genesis
- Darwin-9B-Opus: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- Darwin-31B-Opus: https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
- Colección familia Darwin: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Demo CPU POCKET: https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Colección POCKET: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- POCKET-35B GGUF: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-KR MLX (iPhone): https://huggingface.co/FINAL-Bench/POCKET-KR-MLX
- POCKET-EN GGUF: https://huggingface.co/FINAL-Bench/POCKET-EN-GGUF
- Paper de referencia (arXiv): https://arxiv.org/abs/2605.14386
