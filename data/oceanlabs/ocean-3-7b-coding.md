# OceanLabs/Ocean-3.7B-coding

## Resumen

Ocean-3.7B-coding es un modelo de lenguaje denso, decoder-only, publicado por OceanLabs bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo base IFM/K2-Horizon-3.7B, del que hereda arquitectura y código (los ficheros `configuration_k2_horizon.py` y `modeling_k2_horizon.py` se añadieron posteriormente para permitir la carga con `trust_remote_code=True`). Aunque la nomenclatura comercial habla de "3.7B", el recuento real en safetensors es de 5.058.255.360 parámetros totales; la cifra de 3.7B excluye la matriz de embeddings.

El modelo está orientado a razonamiento, generación de código, flujos agénticos y contexto muy largo, con una ventana nativa de 524.288 tokens (512K). Incorpora un modo de razonamiento configurable (high/medium/low) con tokens de pensamiento dedicados y soporte nativo de tool calling en formatos JSON, XML y Markdown. Su relevancia actual radica en ofrecer una ventana de contexto de 512K en un modelo compacto que puede servirse en una sola GPU de gama alta.

La arquitectura es un transformer denso de 36 capas, hidden size 2560, 32 cabezas de atención con 8 cabezas KV (GQA), dimensión de cabeza 128, vocabulario de 250.624 tokens, activación SiLU y RoPE con theta 10.000.000. Los pesos se distribuyen en bfloat16 y el repositorio ocupa 10,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia k2_horizon) |
| Parametros totales | 5.058.255.360 (≈3,78B sin embeddings) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en, de, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Hidden size | 2560 |
| Intermediate size | 10240 |
| Capas | 36 |
| Cabezas de atencion | 32 |
| Cabezas KV | 8 (GQA) |
| Dimension de cabeza | 128 |
| Tamano de vocabulario | 250.624 |
| Activacion | SiLU |
| Precision | bfloat16 |
| RoPE theta | 10.000.000 |
| Modelo base | IFM/K2-Horizon-3.7B |
| Descargas en Hugging Face | 76 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only con atención de tipo GQA (32 cabezas de consulta y 8 cabezas clave-valor), 36 capas y hidden size de 2560. Emplea activación SiLU y RoPE con theta de 10 millones, valor coherente con la extensión de contexto a 512K. El vocabulario es amplio (250.624 tokens), lo que favorece la eficiencia en tokenización multilingüe y de código. No hay componentes MoE ni SSM: es un denso puro.

El pipeline de entrenamiento descrito en la model card consta de cuatro etapas: (1) preentrenamiento con 22,9 billones de tokens; (2) midtraining con extensión progresiva de contexto 32K → 128K → 512K, incorporando datos agénticos y de razonamiento; (3) reinforcement learning con expertos especializados en matemáticas, código y STEM-code, seguido de fusión de modelos (model merging); y (4) supervised fine-tuning multi-dominio con decaimiento de learning rate. No se detalla la composición exacta del dataset ni si se aplicaron técnicas de DPO o RLHF clásico más allá de la fase de RL descrita.

## Capacidades

- Generación de texto y razonamiento con chain-of-thought explícito mediante tokens de pensamiento dedicados.
- Razonamiento configurable en tres niveles de esfuerzo (high, medium, low); el autor recomienda siempre `high` para máxima calidad.
- Generación de código y tareas de STEM-code, reforzadas en la fase de RL.
- Razonamiento matemático y científico.
- Tool calling estructurado nativo en formatos JSON, XML y Markdown.
- Flujos agénticos y razonamiento multi-paso, con parsers nativos de razonamiento y tool-call para vLLM y SGLang.
- Contexto ultra-largo de 512K tokens para análisis de documentos extensos, planificación de horizonte largo y conversaciones multi-turno prolongadas.
- Capacidades multilingües declaradas: inglés, alemán y multilingüe genérico.
- Conversación multi-turno con plantilla de chat en `chat_template.jinja`.

## Casos de uso

- Análisis de repositorios completos: con 512K tokens de contexto puede ingerir varios ficheros de código y documentación en una sola pasada para responder preguntas de arquitectura, detectar dependencias o proponer refactorizaciones sin trocear el código.
- Asistente de coding en IDE o CI/CD: el soporte de tool calling en JSON/XML permite integrarlo en pipelines que invocan linters, ejecutan tests o consultan APIs, y el modo de razonamiento alto mejora la calidad en tareas de depuración compleja.
- Agentes autónomos multi-paso: la ventana de 512K y los parsers nativos de tool-call lo hacen adecuado para agentes que acumulan historial largo de observaciones y acciones sin perder el hilo.
- Atención al cliente con historial extenso: conversaciones multi-turno con contexto de cientos de miles de tokens permiten mantener el estado completo de un caso sin resumen intermedio.
- Análisis de documentación técnica y legal en inglés y alemán: su soporte declarado de ambos idiomas y el contexto largo permiten resumir contratos, manuales o normativa extensa en una sola llamada.
- Generación de tests y documentación a partir de código fuente: el modelo puede recibir un módulo completo y producir tests unitarios o docstrings coherentes con el contexto global del proyecto.
- Razonamiento matemático y científico asistido: útil en entornos educativos o de investigación para resolver problemas paso a paso con trazas de razonamiento visibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "strong results across agentic, coding, mathematical, and scientific reasoning benchmarks" sin aportar cifras concretas ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 10,1 GB solo para pesos, más overhead de activaciones y caché KV. Con contexto de 512K y GQA de 8 cabezas KV, la caché KV crece de forma considerable; para ventanas completas se recomienda una GPU de 80 GB (A100/H100) o varias GPUs.
- Para contextos moderados (8K–32K) cabe en GPUs consumer de 24 GB (RTX 4090, RTX 3090) en bfloat16, con margen para activaciones.
- GPU recomendadas: H100 o A100 80 GB para contexto completo y serving de producción; RTX 4090 para desarrollo y contextos reducidos.
- Opciones de despliegue: transformers con `trust_remote_code=True`, vLLM y SGLang (validados por el autor, con FlashAttention-3 recomendado). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Configuración de serving recomendada: `temperature=1.0`, `top_p=0.95`, `max_new_tokens` de al menos 32.768 para no truncar las trazas de razonamiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni comparaciones con modelos de la misma categoría, por lo que no es posible establecer una comparativa rigurosa con alternativas de tamaño o tarea similares.

## Limitaciones y advertencias

- El recuento real de parámetros es de 5,06B, no 3,7B; la cifra comercial excluye embeddings y puede inducir a error al planificar hardware.
- El modelo requiere `trust_remote_code=True` y ficheros de código personalizados (`configuration_k2_horizon.py`, `modeling_k2_horizon.py`); la versión inicial no se podía cargar por ficheros ausentes y el repo id interno era incorrecto, según la corrección del 23-11-2026.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni tasas de hallucination.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas: solo se declaran inglés, alemán y multilingüe genérico; el rendimiento en castellano no está verificado ni documentado.
- El contexto de 512K implica un coste elevado de memoria para la caché KV; usarlo en producción requiere planificación de GPU y posiblemente parallelism.
- Con solo 76 descargas y 1 like, el modelo tiene muy poca validación comunitaria; conviene fijar una revisión concreta y validar en el caso de uso propio antes de producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio y las condiciones del modelo base IFM/K2-Horizon-3.7B.

## Enlaces

- Hugging Face: https://huggingface.co/OceanLabs/Ocean-3.7B-coding
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Licencia: https://huggingface.co/OceanLabs/Ocean-3.7B-coding/blob/main/LICENSE
