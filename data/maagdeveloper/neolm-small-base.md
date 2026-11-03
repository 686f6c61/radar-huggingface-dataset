# MaagDeveloper/NeoLM-Small-Base

## Resumen

NeoLM-Small-Base es un modelo de lenguaje de tipo decoder-only publicado por el desarrollador independiente MaagDeveloper bajo el identificador `MaagDeveloper/NeoLM-Small-Base`. Se trata de un checkpoint de la fase 1 (Foundation) de un proyecto propio de preentrenamiento desde cero, entrenado con PyTorch y la librería Transformers. Con 61.356.032 parámetros únicos (embeddings atados), 12 capas y una dimensión oculta de 512, es un modelo pequeño orientado exclusivamente al inglés y a la predicción del siguiente token, no a instrucciones ni a conversación.

El modelo emplea una arquitectura transformer causal con innovaciones habituales en modelos modernos: atención con GQA (8 cabezas de consulta y 2 de clave/valor), MLP SwiGLU con tamaño intermedio de 1.536, normalización RMSNorm con QK Norm y codificación posicional RoPE. Su contexto es de solo 1.024 tokens y utiliza un tokenizador ByteLevel BPE propio de 49.152 entradas entrenado específicamente sobre el corpus del proyecto, sin reutilizar tokenizadores de terceros.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación de un autor individual, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados. Es útil como referencia para quienes estudian el preentrenamiento de modelos pequeños desde cero o quieran reproducir la arquitectura, pero no está pensado para producción ni para tareas que requieran seguimiento de instrucciones. El propio autor advierte que el modelo base puede no responder de forma fiable a preguntas factuales ni realizar razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con GQA, SwiGLU, RMSNorm, QK Norm y RoPE |
| Parametros totales | 61.356.032 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors en BF16 |
| Capas | 12 |
| Dimension oculta | 512 |
| Cabezas de consulta / KV | 8 / 2 (GQA) |
| Tamano intermedio MLP | 1.536 |
| Vocabulario | 49.152 (ByteLevel BPE propio) |
| Tokens especiales | EOS `<|endoftext|>` ID 0, PAD `<|pad|>` ID 1, sin BOS |
| Implementacion | `NeoLMForCausalLM` personalizada (`trust_remote_code=True`) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar con varias decisiones de diseño propias de modelos recientes pero aplicadas a una escala muy reducida: 12 capas, dimensión oculta 512, GQA con 8 cabezas de consulta y 2 de clave/valor, MLP SwiGLU de tamaño intermedio 1.536, RMSNorm con QK Norm y RoPE para la posición. Los embeddings de entrada y salida están atados, lo que explica que el recuento de parámetros únicos sea de 61,36 millones. La implementación no usa el código estándar de Transformers, sino una clase `NeoLMForCausalLM` propia que requiere `trust_remote_code=True` para cargarse.

El preentrenamiento se realizó sobre la configuración `foundation` del corpus NeoCorpus, derivado de un subconjunto filtrado en inglés de Karpathy ClimbMix Shuffle, a su vez basado en NVIDIA Nemotron-ClimbMix. El split de entrenamiento contiene 1.889.952 documentos y 1.147.218.931 tokens contados con el tokenizador de esta release (incluyendo separadores EOS por documento). El tokenizador ByteLevel BPE se entrenó exclusivamente sobre esos documentos de entrenamiento, excluyendo validación y test, con pre-tokenización estilo GPT y agrupación de 1 a 3 dígitos. El autor indica explícitamente que este es un checkpoint de entrenamiento publicado y no una versión convergida: el calendario previsto de tres épocas no se completó y no se documentan el paso exacto del checkpoint ni la perplejidad completa de validación y test. No se mencionan fases de RLHF, DPO ni ajuste por instrucciones en esta release.

## Capacidades

- Generación de texto autoregresiva en inglés mediante predicción del siguiente token.
- Completado de texto y continuación de prompts, con soporte de decodificación por muestreo (temperatura, top-p) y penalización por repetición.
- Generación en streaming mediante `TextStreamer` de Transformers.
- Tokenizador propio cargable de forma independiente, sin necesidad de cargar los pesos del modelo.
- Capacidad demostrada de adaptación a tareas de QA y clasificación de texto mediante fine-tuning posterior, según indica el autor en la model card (sin resultados numéricos publicados).
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso ni modo "thinking".
- No dispone de capacidades de visión, audio ni multimodalidad.
- No es un modelo de chat: no hay formato de roles ni plantilla de conversación.

## Casos de uso

- Investigación sobre preentrenamiento desde cero: el modelo sirve como referencia reproducible para estudiar el efecto de decisiones arquitectónicas (GQA, QK Norm, SwiGLU) a escala pequeña, con un tokenizador propio entrenado sobre un corpus documentado.
- Experimentos académicos de tokenización: al incluir un ByteLevel BPE de 49.152 entradas entrenado solo sobre el split de entrenamiento, permite analizar el impacto del vocabulario en la perplejidad y en la eficiencia de codificación sin depender de tokenizadores ajenos.
- Fine-tuning para clasificación de texto en inglés: el autor reporta que la arquitectura se adapta a clasificación y QA tras ajuste fino, por lo que puede usarse como base ligera para tareas de clasificación con presupuesto de cómputo mínimo.
- Generación de texto de completado en entornos con recursos muy limitados: con 61 millones de parámetros y pesos en BF16 de aproximadamente 0,1 GB, cabe en CPU y en GPUs de gama baja para experimentos de continuación de texto.
- Docencia y divulgación: útil para explicar el funcionamiento interno de un transformer causal (atención con GQA, RoPE, RMSNorm) con un modelo cuyo código y configuración son inspeccionables.
- Pruebas de infraestructura de despliegue: por su tamaño reducido, sirve para validar pipelines de carga con `trust_remote_code`, streaming y decodificación antes de escalar a modelos mayores.
- Baseline en estudios de escalado: puede actuar como punto de comparación de perplejidad frente a modelos del mismo orden de magnitud entrenados con otros corpus o tokenizadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona únicamente una disminución de la pérdida de siguiente token en entrenamiento y validación durante el preentrenamiento, sin cifras concretas, y advierte que los resultados de tareas posteriores tras fine-tuning no deben confundirse con la perplejidad del modelo base. No se documentan MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,12 GB en BF16 (61,36 M de parámetros × 2 bytes), más el overhead de activaciones y del runtime de PyTorch. En FP32 sería de unos 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- CPU: es viable en CPU; el autor recomienda usar `dtype=torch.float32` si la CPU no soporta BF16 correctamente.
- Opciones de despliegue: carga estándar con `transformers` y `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la implementación personalizada dificulta su uso en esos motores sin conversión previa.
- Latencia y throughput: no disponibles. Por el tamaño del modelo se espera una latencia muy baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoLM-Small-Base | 61,36 M | 1.024 | Inglés | No disponible | HuggingFace, requiere `trust_remote_code` |
| GPT-2 small | 124 M | 1.024 | Inglés | MIT (pesos publicados por OpenAI) | HuggingFace, integrado en Transformers |
| Pythia-70M | 70 M | 2.048 | Inglés | Apache 2.0 | HuggingFace, EleutherAI |
| TinyLlama-1.1B | 1,1 B | 2.048 | Inglés | Apache 2.0 | HuggingFace |

La comparación se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados de NeoLM-Small-Base que permitan contrastar rendimiento. Frente a GPT-2 small y Pythia-70M, NeoLM ofrece un contexto menor (1.024 frente a 2.048 de Pythia) y una licencia sin declarar, lo que supone una desventaja clara para uso comercial frente a alternativas con licencias permisivas. Su interés es fundamentalmente académico y de reproducibilidad.

## Limitaciones y advertencias

- No es un modelo de instrucciones ni de chat: puede no seguir instrucciones, responder preguntas factuales de forma fiable ni realizar razonamiento multi-paso, tal como advierte el autor.
- Contexto muy limitado: 1.024 tokens restringen tareas que requieran documentos largos o conversaciones multi-turno.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Licencia no disponible: la ausencia de licencia declarada impide asumir permisos de uso comercial; es necesario contactar con el autor antes de cualquier uso en producción.
- Checkpoint no convergido: el calendario de tres épocas no se completó y no se documentan la perplejidad de validación ni el paso exacto del checkpoint, por lo que su calidad final es incierta.
- Riesgo de alucinación: como modelo base pequeño entrenado con un corpus filtrado, es esperable que genere contenido plausible pero incorrecto; no se han publicado evaluaciones de factualidad.
- Sesgos: no se documentan análisis de sesgo; el corpus deriva de ClimbMix, por lo que puede heredar sesgos presentes en datos web filtrados en inglés.
- Dependencia de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; el autor recomienda revisarlo antes de habilitarlo.
- Sin soporte de tool calling ni agentes: no dispone de mecanismos nativos para integración con herramientas o pipelines agénticos.
- Ecosistema limitado: sin integraciones documentadas con vLLM, llama.cpp, Ollama o TGI, y con cero descargas y likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MaagDeveloper/NeoLM-Small-Base
- Dataset NeoCorpus: https://huggingface.co/datasets/MaagDeveloper/NeoCorpus
- Dataset Karpathy ClimbMix Shuffle (origen de los datos): https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset NVIDIA Nemotron-ClimbMix (origen subyacente): https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
