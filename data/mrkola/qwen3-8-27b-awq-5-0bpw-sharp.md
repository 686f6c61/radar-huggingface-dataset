# mrKola/Qwen3.8-27B-AWQ-5.0bpw-Sharp

## Resumen

El modelo `mrKola/Qwen3.8-27B-AWQ-5.0bpw-Sharp` es una cuantización AWQ (Activation-aware Weight Quantization) de 5.0 bits por peso (bpw) del modelo Qwen3.8-27B, desarrollada por mrKola específicamente para Apple Silicon mediante la librería oMLX. El modelo base, Qwen3.8-27B, es un modelo denso de 27.8 mil millones de parámetros con arquitectura híbrida GatedDeltaNet + atención completa, 64 capas, ventana de contexto de 256K tokens, cabezas de predicción multi-token (MTP) y torre de visión, lo que lo convierte en un modelo de visión-lenguaje capaz de procesar imágenes y texto.

Esta cuantización reduce el tamaño del modelo a 17.36 GB (3.2 veces menor que la versión bf16) y está calibrada tanto con texto como con imágenes, lo que garantiza que la torre de visión se ejercite durante el proceso de calibración. El resultado es un modelo que puede ejecutarse en hardware Apple Silicon con un rendimiento de prefill y decodificación optimizado, gracias al uso de kernels nativos de oMLX que requieren un group size de 64 en las capas MLP. La relevancia de esta ficha radica en que ofrece una alternativa práctica para desplegar un modelo de 27B con capacidades multimodales en entornos locales de Apple, sin necesidad de GPUs dedicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GatedDeltaNet + atención completa (del modelo base Qwen3.8-27B) |
| Parametros totales | 27.8B (dense, según model card); el archivo safetensors reporta 4.815.908.816 parámetros, posiblemente por la cuantización o por ser un subconjunto |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (según model card); otras fuentes citan 262K |
| Tipos de cuantizacion | AWQ 5.0bpw con group size 64 (y 128 en algunos componentes: embed_tokens, lm_head, vision tower) |
| Idiomas soportados | No disponibles (el modelo base es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas GatedDeltaNet (una variante de atención lineal con estado recurrente) con capas de atención completa, lo que permite manejar contextos largos de hasta 256K tokens de forma eficiente. Incluye además una torre de visión para procesamiento de imágenes y cabezas MTP (multi-token prediction) que aceleran la decodificación. La cuantización AWQ se aplica de forma secuencial sobre las capas MLP, calibrando cada capa con las activaciones de las capas ya cuantizadas. El resto de componentes (GDN, atención, embeddings, etc.) se cuantizan con RTN (round-to-nearest) a los anchos especificados.

La calibración se realizó con 352 prompts de 1024 tokens (234.477 tokens reales), renderizados con la plantilla de chat de Qwen y una división 50/50 entre modos think y nothink. El conjunto de calibración incluye un 66% de texto (codificación, tool use, agéntico, razonamiento) y un 34% de imágenes (gráficos ChartQA, fotografías VQAv2 y renders GLSL), lo que garantiza que la torre de visión se ejercite durante el proceso. Los bits asignados por componente son: MLP a 4-bit gs64, GDN in_proj a 5-bit gs64, GDN out_proj a 4-bit gs64, atención q/k/v a 8-bit gs64, atención o_proj a 4-bit gs64, embed_tokens a 4-bit gs128, lm_head a 6-bit gs128, vision tower a 8-bit gs128 y MTP head a 8/6/4-bit. No se utiliza 3-bit en ninguna capa porque oMLX no expone kernels q3 para prefill.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de razonamiento complejo, con modo de pensamiento configurable (think/nothink).
- Codificación: soporta generación y análisis de código, incluyendo tool calling y uso de agentes.
- Visión-lenguaje: procesa imágenes (gráficos, fotografías, renders) y responde preguntas sobre ellas.
- Tool calling y function calling: el modelo base está entrenado para usar herramientas, como se refleja en la calibración (tool use, agentic).
- Agentes y razonamiento multi-paso: puede ejecutar tareas agénticas de largo horizonte.
- Multilingüe: aunque no se detallan idiomas, el modelo base Qwen3.8-27B es multilingüe.
- Aceleración por MTP: las cabezas de predicción multi-token integradas aceleran la decodificación.
- Soporte de SpecPrefill: permite acelerar el prefill en contextos largos mediante un modelo drafter.

## Casos de uso

- Asistente de codificación local: el modelo puede integrarse en entornos de desarrollo (IDEs, CLIs) para autocompletar código, explicar fragmentos y refactorizar, aprovechando su contexto de 256K tokens para manejar repositorios completos.
- Análisis de documentos con imágenes: dado su soporte de visión, puede extraer información de gráficos, tablas y fotografías en informes técnicos o científicos, ejecutándose localmente en Apple Silicon.
- Agente autónomo de automatización de tareas: con tool calling y razonamiento multi-paso, puede orquestar flujos de trabajo (envío de correos, gestión de archivos, consultas a APIs) en un entorno controlado.
- Investigación académica: para experimentos de procesamiento de lenguaje natural y visión por computador, al ser un modelo abierto con licencia Apache 2.0 y ejecutable en hardware de consumo.
- Prototipado rápido de aplicaciones de IA: desarrolladores pueden desplegar el modelo en Macs con oMLX para validar ideas sin depender de servicios en la nube.
- Análisis de logs y depuración: su contexto largo permite procesar grandes volúmenes de logs o trazas de ejecución para identificar errores o patrones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de velocidad en Apple Silicon (M5 Max) con oMLX, que se detallan a continuación:

| Contexto | TTFT | TPOT | ppTPS | tgTPS | E2E | Pico de memoria |
|---|---|---|---|---|---|---|
| pp 1k / tg 128 | 1224 ms | 23.5 ms | 837 | 42.8 | 4.2 s | 17.6 GB |
| pp 4k / tg 128 | 5214 ms | 17.8 ms | 786 | 56.5 | 7.5 s | 19.2 GB |
| pp 8k / tg 128 | 10109 ms | 18.6 ms | 810 | 54.3 | 12.5 s | 20.2 GB |
| pp 16k / tg 128 | 6565 ms | 20.3 ms | 2496 | 49.6 | 9.2 s | 21.4 GB |
| pp 32k / tg 128 | 14766 ms | 21.2 ms | 2219 | 47.5 | 17.5 s | 22.8 GB |
| pp 64k / tg 128 | 32029 ms | 23.8 ms | 2046 | 42.3 | 35.1 s | 24.7 GB |
| pp 128k / tg 128 | 75917 ms | 25.1 ms | 1727 | 40.1 | 79.1 s | 28.5 GB |
| pp 200k / tg 128 | 136381 ms | 33.1 ms | 1467 | 30.4 | 140.6 s | 33.1 GB |

En modo batch (misma máquina):

| Batch | tgTPS | TTFT medio | E2E | Speedup |
|---|---|---|---|---|
| 1 | 42.8 | 1224 ms | 4.2 s | 1.00× |
| 2 | 47.6 | 3253 ms | 9.4 s | 1.11× |
| 4 | 77.2 | 5315 ms | 15.3 s | 1.80× |
| 8 | 115.9 | 10158 ms | 27.2 s | 2.71× |

## Requisitos de hardware

- VRAM estimada: entre 17.6 GB (contexto 1K) y 33.1 GB (contexto 200K) en Apple Silicon con oMLX.
- GPU recomendadas: Apple Silicon con memoria unificada (probado en M5 Max). No se mencionan GPUs NVIDIA.
- Compatibilidad con consumer GPU: sí, en Macs con al menos 32 GB de RAM unificada para contextos cortos; para contextos largos se recomienda 64 GB o más.
- Opciones de despliegue: oMLX (librería principal), MLX, LM Studio (según resultados web), y potencialmente otros frameworks que soporten AWQ.
- Latencia y throughput: los datos de la tabla anterior muestran un TPOT de 17.8-33.1 ms y un tgTPS de 30-56 tokens/s según el contexto, con prefill acelerado por SpecPrefill por encima de 8K tokens.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Cuantización | Velocidad (ppTPS) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-AWQ-5.0bpw-Sharp (este) | 17.36 GB | 256K | AWQ 5.0bpw gs64 | 894 (pp 4K) | Apache 2.0 |
| Qwen3.8-27B-AWQ-4.85bpw (True2456) | ~16.8 GB (estimado) | 256K | AWQ 4.85bpw gs128 | 513 (pp 4K, con routing activo) | Apache 2.0 |
| Qwen3.8-27B (bf16 original) | ~55.6 GB | 256K | Sin cuantizar | No disponible | Apache 2.0 |

La versión 5.0bpw con gs64 ofrece un prefill significativamente más rápido que la versión 4.85bpw con gs128 (894 vs 513 ppTPS) sin necesidad de desactivar el routing de kernels, a costa de 0.53 GB adicionales. El modelo original en bf16 requiere más del doble de memoria y no está optimizado para oMLX.

## Limitaciones y advertencias

- Es una cuantización, por lo que puede haber una ligera pérdida de precisión respecto al modelo original en bf16, aunque no se han medido benchmarks de calidad en esta versión.
- El rendimiento óptimo depende de oMLX y de hardware Apple Silicon; en otras plataformas (NVIDIA, AMD) el rendimiento puede ser inferior o requerir adaptaciones.
- El mecanismo SpecPrefill utiliza un modelo drafter con un vocabulario más pequeño (Qwen2.5-0.5B) que no comparte el mismo tokenizer que el modelo objetivo, lo que puede afectar a la precisión en contextos largos (por encima de 8K tokens). La model card advierte que no se ha medido este impacto.
- No se han publicado resultados de benchmarks de calidad (razonamiento, codificación, visión) para esta cuantización específica, por lo que se desconoce su rendimiento real en tareas estándar.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM, que no se han evaluado en esta versión cuantizada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B para confirmar restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrKola/Qwen3.8-27B-AWQ-5.0bpw-Sharp
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión 4.85bpw de referencia: https://huggingface.co/True2456/Qwen3.8-27B-AWQ-4.85bpw
- Pull request de oMLX sobre routing de kernels: https://github.com/jundot/omlx/pull/2657
- Página de LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- OpenLM.ai sobre Qwen 3.8: https://openlm.ai/qwen3.8/
- Seguimiento de lanzamiento: https://aireleasetracker.com/model/qwen/qwen3.8-27b
