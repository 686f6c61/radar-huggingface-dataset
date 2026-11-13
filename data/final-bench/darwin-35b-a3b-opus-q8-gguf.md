# FINAL-Bench/Darwin-35B-A3B-Opus-Q8-GGUF

## Resumen

Darwin-35B-A3B-Opus-Q8-GGUF es la cuantización oficial en formato GGUF Q8_0 del modelo Darwin-35B-A3B-Opus, desarrollado por FINAL-Bench (con cuantización a cargo de VIDRAFT). Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 34.660 millones de parámetros totales, del cual solo unos 3.000 millones están activos por token, construido sobre la arquitectura Qwen 3.5 MoE. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para inferencia en llama.cpp, Ollama y LM Studio, con un tamaño de repositorio de unos 36,9 GB repartidos en tres shards.

El modelo se presenta como el resultado de un proceso de merge evolutivo y destilación a partir de Claude Opus, con el objetivo de concentrar capacidades de razonamiento de nivel graduado, conocimiento multilingüe y comportamiento de agente de código en un MoE de tamaño medio que pueda ejecutarse en hardware relativamente modesto. Declara una ventana de contexto de 262.000 tokens y soporte para 201 idiomas, lo que lo sitúa en la categoría de modelos de contexto largo con cobertura multilingüe amplia.

Su relevancia actual reside en la combinación de tres factores: un formato GGUF Q8_0 prácticamente sin pérdida (el autor afirma ~99,9% de la calidad del BF16 original), un tamaño que cabe en una A100 de 40 GB o en dos RTX 4090, y una licencia permisiva. Esto lo convierte en una opción atractiva para despliegues en producción donde se necesita razonamiento fuerte sin depender de API propietarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), familia Qwen 3.5 MoE |
| Parámetros totales | 34.660.610.688 (~34,7 B) |
| Parámetros activos | ~3 B (por token) |
| Longitud de contexto | 262.000 tokens (262K) |
| Tipos de cuantización | Q8_0 (esta variante); el modelo base admite otras cuantizaciones GGUF de terceros (p. ej. bartowski) |
| Idiomas soportados | 201 idiomas según el autor; declarados explícitamente en, zh, ko, ja, de, fr, es, ru, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (3 shards, ~36,8 GB en total) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos (MoE) heredada de la familia Qwen 3.5. Con ~34,7 B de parámetros totales y ~3 B activos por token, el coste computacional por token se aproxima al de un modelo denso de 3 B, mientras que la capacidad de representación se acerca a la de un modelo de 35 B. La ventana de contexto declarada es de 262.000 tokens, lo que habilita tareas de contexto largo como análisis de repositorios completos o documentos extensos.

El proceso de construcción combina merge evolutivo (etiquetado como darwin-v5 y evolutionary-merge), merge por capas (layer-wise merge) y destilación a partir de Claude Opus. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones de decodificación como decodificación especulativa o atención lineal. La información sobre el pipeline de entrenamiento es, por tanto, limitada a las etiquetas del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (262K tokens).
- Razonamiento de nivel graduado, con resultados declarados de 90,0% en GPQA Diamond.
- Conocimiento multilingüe amplio (201 idiomas; 85,0% declarado en MMMLU).
- Capacidades de código y agente de programación (etiquetas coding-agent).
- Soporte de tool calling / function calling.
- Razonamiento multi-paso orientado a agentes.
- Modo de razonamiento (etiqueta reasoning; no se detalla si es un modo "thinking" explícito).
- Destilación de Claude Opus como fuente de comportamiento.

## Casos de uso

- Razonamiento científico y técnico: el modelo declara 90,0% en GPQA Diamond, por lo que es adecuado para responder preguntas de nivel posgrado en física, química y biología, así como para asistir en revisión de literatura técnica.
- Agente de código en pipelines de CI/CD: gracias al soporte de tool calling y a su perfil MoE de 3 B activos, puede integrarse en flujos de revisión de PRs, generación de tests y corrección automática con un coste por token bajo.
- Análisis de repositorios completos: con 262K tokens de contexto puede ingerir múltiples ficheros de un proyecto y responder preguntas de arquitectura o detectar inconsistencias entre módulos.
- Atención al cliente multilingüe: los 201 idiomas declarados y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso en español, inglés, chino, coreano, japonés, alemán, francés, ruso o árabe.
- Asistente de documentación técnica: puede resumir y reescribir documentación extensa manteniendo coherencia terminológica a lo largo de decenas de miles de tokens.
- Despliegue en hardware de gama alta de consumo: la variante Q8_0 cabe en una A100 40 GB, en un Mac de 64 GB o en 2x RTX 4090, lo que permite ejecutar un modelo de razonamiento fuerte en infraestructura propia sin GPU de centro de datos.
- Procesamiento por lotes en CPU: al ser GGUF y funcionar con llama.cpp estándar, puede ejecutarse en CPU para tareas de clasificación, extracción o resumen donde la latencia no sea crítica.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| GPQA Diamond | Accuracy | 90,0 |
| MMMLU | Accuracy | 85,0 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: ~37 GB para la variante Q8_0 (3 shards, ~36,8 GB).
- GPU recomendadas: NVIDIA A100 40 GB (cabe), A100 80 GB (cómodo), H100 93 GB (cómodo), 2x RTX 4090 de 24 GB con tensor parallelism (48 GB en total).
- Consumer GPU: no cabe en una única RTX 4090; sí en configuraciones de 2x RTX 4090. En Mac, requiere al menos 64 GB de memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio. El modelo base BF16 admite Transformers, vLLM y SGLang.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser MoE con ~3 B activos, el coste por token es sustancialmente menor que el de un denso de 35 B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos comparables (parámetros, contexto, benchmarks, licencia) para construir una comparativa rigurosa. Como referencia estructural, el propio autor sitúa el modelo en la familia Darwin (Darwin-4B-Opus, Darwin-9B-Opus, Darwin-31B-Opus, Darwin-35B-A3B-Opus) y ofrece variantes GGUF de terceros (bartowski), pero no se aportan métricas cruzadas con alternativas externas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Darwin-35B-A3B-Opus-Q8-GGUF | ~34,7 B totales / ~3 B activos | 262K | Apache 2.0 | GGUF en HF |
| Darwin-35B-A3B-Opus (BF16) | ~34,7 B totales / ~3 B activos | 262K | Apache 2.0 | SafeTensors en HF |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de GPQA Diamond (90,0) y MMMLU (85,0) están marcados como no verificados (`verified: false`) en el model-index; deben tratarse como declaraciones del autor, no como mediciones independientes.
- El proceso de construcción (merge evolutivo + destilación de Claude Opus) no está documentado en detalle en la información disponible: se desconoce el dataset, el número de tokens y las fases de alineación, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados; no se aportan evaluaciones de factualidad ni de calibración.
- Aunque se declaran 201 idiomas, solo nueve están listados explícitamente; el rendimiento real en idiomas no listados no está verificado.
- La ventana de 262K tokens es una capacidad declarada; no se aportan mediciones de degradación de calidad a contextos muy largos (needle-in-a-haystack, RULER, etc.).
- La variante Q8_0 ocupa ~37 GB, lo que excluye su ejecución en GPUs de consumo individuales y en equipos con menos de 64 GB de memoria unificada.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base.
- No se especifican limitaciones de seguridad, filtros de contenido ni evaluaciones de red-teaming.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus-Q8-GGUF
- Modelo base (BF16): https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus
- Demo del modelo base: https://huggingface.co/spaces/FINAL-Bench/Darwin-35B-A3B-Opus
- GGUF de terceros (bartowski): https://huggingface.co/bartowski/FINAL-Bench_Darwin-35B-A3B-Opus-GGUF
- Demo CPU (POCKET): https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Colección POCKET: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Leaderboard ALL Bench: https://huggingface.co/spaces/FINAL-Bench/all-bench-leaderboard
- Paper referenciado (arXiv): arxiv:2605.14386 (no se dispone de URL directa en la información proporcionada)
- Familia Darwin: https://huggingface.co/FINAL-Bench/Darwin-4B-Opus, https://huggingface.co/FINAL-Bench/Darwin-9B-Opus, https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
