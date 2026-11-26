# skt/A.X-K2-NVFP4

## Resumen

A.X K2 NVFP4 es la versión cuantizada en NVFP4 de A.X K2, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por SK Telecom (SKT) como modelo fundacional orientado a tareas agénticas. El modelo completo cuenta con 688 mil millones de parámetros totales y 33 mil millones de parámetros activos por token, lo que permite un rendimiento de razonamiento elevado manteniendo una eficiencia de inferencia práctica. Se trata del sucesor de A.X K1 y forma parte del proyecto de modelo fundacional de IA soberana del gobierno coreano, con especial énfasis en la comprensión del idioma y la cultura coreanas.

Esta variante concreta aplica cuantización NVFP4 W4A4 a los expertos enrutados (routed experts), mientras que la atención, el experto compartido y las capas densas se mantienen en FP8, y el router, los embeddings y el LM head en BF16. El resultado es una reducción de aproximadamente la mitad de la huella de memoria respecto al checkpoint FP8, con un rendimiento declarado comparable. El checkpoint está pensado para servirse con vLLM (fork específico de SKT-AI) y no es compatible con Hugging Face Transformers.

La relevancia de esta versión radica en que hace viable desplegar un modelo de escala frontera (688B) en un solo nodo con 4 GPU NVIDIA B200, algo impensable con los pesos en BF16. El modelo soporta modos de razonamiento (thinking y non-thinking) conmutables por petición, contexto largo de hasta 256K tokens mediante YaRN y tool calling automático, lo que lo posiciona como una opción atractiva para pipelines agénticos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, con atención MLA (multi-head latent attention) y decodificación especulativa soportada en serving |
| Parametros totales | 691.690.231.040 (~688B) |
| Parametros activos | ~33B |
| Longitud de contexto | Hasta 256K tokens (configuración YaRN incluida); extensible a 512K con factor YaRN 4 |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos enrutados; FP8 en atención, experto compartido y capas densas; BF16 en router, embeddings y LM head |
| Idiomas soportados | en, ko, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 8-bit; librería vLLM |

## Arquitectura y entrenamiento

A.X K2 es un transformer de tipo Mixture-of-Experts entrenado desde cero. La arquitectura combina expertos enrutados (que en esta versión NVFP4 se cuantizan a W4A4) con un experto compartido y capas densas en FP8, además de un router en BF16. La atención emplea MLA (multi-head latent attention), y el backend de serving recomendado es `FLASHINFER_MLA_SPARSE`. El modelo incorpora además decodificación especulativa en el stack de vLLM, lo que contribuye a la eficiencia de inferencia.

El entrenamiento utiliza una receta denominada "Think-Fusion", que permite que un único modelo unificado soporte tanto un modo de razonamiento (thinking) para resolución de problemas complejos como un modo directo (non-thinking) para respuestas concisas y de baja latencia, conmutables por petición. Los datasets citados en la model card incluyen nvidia/Nemotron-CC-v2.1, nvidia/Nemotron-Pretraining-Code-v2 y HuggingFaceFW/fineweb-2. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovación técnica principal de esta variante es la cuantización selectiva: solo los expertos enrutados se degradan a NVFP4 (4 bits de pesos y activaciones), preservando la precisión del resto de módulos. Esto reduce la memoria aproximadamente a la mitad respecto al checkpoint FP8 sin pérdida apreciable de calidad según el autor, y permite servir el modelo en 4 GPU B200 con paralelismo tensorial 4 y paralelismo de expertos.

## Capacidades

- Generación de texto y razonamiento complejo en modo thinking, con cadena de razonamiento explícita controlable por petición.
- Modo non-thinking para respuestas directas y de baja latencia, útil cuando se prioriza coste frente a calidad.
- Tool calling / function calling automático (parsers `hermes` y `deepseek_v3` en vLLM).
- Soporte de flujos agénticos y razonamiento multi-paso, orientado como modelo fundacional agéntico.
- Capacidades multilingües en inglés, coreano, chino, japonés y español.
- Contexto largo de hasta 256K tokens con recuperación perfecta en pruebas NIAH (needle-in-a-haystack) a todas las profundidades y longitudes, incluso tras cuantización NVFP4.
- Capacidad de recuperación de hechos en contexto largo verificada hasta 512K tokens con factor YaRN 4.
- No se documentan capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens) para mantener historiales extensos de cliente, y el modo non-thinking permite respuestas rápidas en consultas simples mientras el modo thinking se reserva para casos complejos.
- Generación de código en producción: con soporte de tool calling y parser `hermes`, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o resolución de incidencias, aprovechando el entrenamiento sobre Nemotron-Pretraining-Code-v2.
- Agentes autónomos multi-paso: su orientación agéntica y el razonamiento multi-paso lo hacen adecuado para orquestación de tareas que requieren planificación, invocación de herramientas y verificación de resultados.
- Análisis de documentos extensos: con 256K de contexto y recuperación NIAH perfecta, puede procesar contratos, informes o expedientes completos y extraer información concreta sin truncar el material.
- Asistentes para el mercado coreano y asiático: al ser un modelo soberano con cobertura de coreano, chino y japonés, encaja en productos localizados para esos mercados donde los modelos occidentales rinden peor.
- Despliegue de modelo frontera en infraestructura contenida: al caber en 4 GPU B200 con NVFP4, permite ofrecer un servicio de razonamiento de escala 688B en un único nodo, reduciendo costes de infraestructura frente a alternativas en BF16.
- Investigación en cuantización: sirve como caso de estudio de cuantización selectiva W4A4 en MoE con preservación de calidad, útil para equipos que evalúan técnicas de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta resultados cualitativos de recuperación en NIAH:

| Prueba | Contexto | Resultado |
|---|---|---|
| Needle-in-a-Haystack (zero-shot YaRN) | 128K (factor 1) | Recuperación perfecta (100) |
| Needle-in-a-Haystack (zero-shot YaRN) | 256K (factor 2) | Recuperación perfecta (100) |
| Needle-in-a-Haystack (zero-shot YaRN) | 512K (factor 4) | Recuperación perfecta (100) |

Estos resultados se mantienen tras la cuantización NVFP4 (expertos W4A4). No se dispone de comparativas numéricas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 796,6 GB; con NVFP4 el autor indica una reducción de aproximadamente la mitad respecto a FP8. El despliegue de referencia usa 4 GPU NVIDIA B200.
- GPU recomendadas: 4× NVIDIA B200 en un solo nodo con `--tensor-parallel-size 4` y `--enable-expert-parallel`.
- No cabe en GPU de consumo (RTX 4090, etc.) dado el tamaño de 688B parámetros incluso cuantizado.
- Opciones de despliegue: vLLM mediante el fork SKT-AI (rama `axk2-v0.23.0`), con kernels FlashInfer NVFP4 MoE (`VLLM_USE_FLASHINFER_MOE_FP4=1`) y backend `FLASHINFER_MLA_SPARSE`. No es compatible con Hugging Face Transformers; para ello debe usarse `skt/A.X-K2`.
- Latencia y throughput: no disponibles en la información proporcionada. Se recomienda reducir `--max-model-len` cuando no se requieran contextos largos para ahorrar memoria.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo orientativo de categoría (MoE de escala frontera), los competidores habituales serían modelos como DeepSeek-V3, Qwen3-MoE o Llama-4, pero no se aportan cifras verificables en esta ficha.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A.X K2 NVFP4 | ~688B | ~33B | 256K (512K con YaRN) | Apache 2.0 | Hugging Face (vLLM) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo es compatible con vLLM a través del fork específico de SKT-AI; no funciona en Hugging Face Transformers ni en stacks estándar sin ese fork.
- Requiere hardware de gama alta (4× B200) para el despliegue de referencia; no es viable en GPU de consumo.
- La cuantización NVFP4, aunque selectiva, puede introducir degradaciones en tareas no cubiertas por las pruebas NIAH; el autor solo verifica recuperación de hechos en contexto largo.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado con datasets web a gran escala (fineweb-2, Nemotron-CC), es probable que herede sesgos de esos corpus.
- Cobertura lingüística limitada a cinco idiomas (en, ko, zh, ja, es); el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento subyacentes para usos sensibles.
- El modo thinking incrementa el coste de cómputo y latencia; debe gestionarse por petición según el caso de uso.
- No se documentan capacidades multimodales, por lo que no debe asumirse soporte de visión o audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skt/A.X-K2-NVFP4
- Modelo base (FP8/BF16): https://huggingface.co/skt/A.X-K2
- Colección de modelos A.X K2: https://huggingface.co/collections/skt/ax-k2
- Repositorio GitHub: https://github.com/SKT-AI/A.X-K2
- Informe técnico (PDF): https://github.com/SKT-AI/A.X-K2/blob/main/A_X_K2_Tech_Report.pdf
- Fork de vLLM de SKT-AI: https://github.com/SKT-AI/vllm (rama `axk2-v0.23.0`)
