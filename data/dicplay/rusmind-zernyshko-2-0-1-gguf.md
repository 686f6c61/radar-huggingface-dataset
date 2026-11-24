# DICPlay/RusMind-Zernyshko-2.0.1-GGUF

## Resumen

RusMind Zernyshko 2.0.1 es un modelo de lenguaje compacto de 342 millones de parámetros desarrollado por DICPlay, entrenado desde cero con un enfoque específico en el idioma ruso. Forma parte de la familia RusMind, una línea de modelos presentada por el autor como "IA nacional" rusa. Esta versión 2.0.1 es un ajuste fino de la 2.0 orientado a mejorar la coherencia conversacional multi-turno, el cálculo aritmético dentro de diálogos y la explicación de conceptos cotidianos.

La arquitectura es un transformer decoder convencional con RMSNorm, RoPE, SwiGLU y atención GQA con ratio 16/4, distribuido en 26 capas con dimensión oculta de 1024. Emplea un tokenizador propio de 48.000 tokens entrenado sobre ruso y una ventana de contexto de 4096 tokens. El formato de diálogo es ChatML y los pesos se distribuyen en GGUF con la disposición estándar de llama.cpp para garantizar compatibilidad con LM Studio, Ollama y llama.cpp.

Su relevancia radica en ser un modelo entrenado íntegramente desde cero (no un fine-tune de un modelo occidental) y en su tamaño extremadamente reducido, que permite inferencia completamente offline en portátiles y teléfonos. No obstante, su rendimiento absoluto es muy limitado: el propio autor reporta un 0,054 en MERA 2.0, lo que lo sitúa lejos de modelos rusos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RMSNorm, RoPE, SwiGLU, GQA 16/4) |
| Parametros totales | 342.283.264 (342 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF); bf16 en safetensors |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay); uso no comercial libre, comercial bajo contrato |
| Formato de pesos | GGUF (llama.cpp), safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 26 capas con dimensión 1024, normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU y atención con query grouping (GQA) en ratio 16/4. El tokenizador es propio, con un vocabulario de 48.000 tokens entrenado específicamente sobre ruso, lo que difiere del tokenizador Llama estándar. Para la versión GGUF se ha adoptado la disposición de tensores estándar de llama.cpp, lo que permite cargarlo en herramientas convencionales sin conversiones adicionales.

El entrenamiento se realizó desde cero sobre aproximadamente 4.500 millones de tokens, con una mezcla de Wikipedia en ruso, web rusa, datos conversacionales propios, código y problemas matemáticos. Posteriormente se aplicó un ajuste fino orientado a habilidades prácticas: aritmética, generación de código, salida en JSON, traducción, invocación de herramientas, cortesía y calibración de la honestidad ("decir que no sabe"). No se documenta el uso de RLHF o DPO, ni se detalla la composición exacta del dataset más allá de las categorías mencionadas.

## Capacidades

- Generación de texto conversacional en ruso con soporte multi-turno (ChatML).
- Aritmética básica dentro de la conversación (sumas, cálculo de velocidad a partir de distancia y tiempo).
- Generación de código en contextos sencillos.
- Salida estructurada en JSON a partir de lenguaje natural.
- Tool calling / function calling con formato JSON (`{"tool": ..., "args": {...}}`).
- Explicación de conceptos cotidianos (familia, amistad, volcán, espacio).
- Capacidad declarada de admitir desconocimiento en lugar de alucinar.
- Sin soporte de visión, audio ni modo de razonamiento extendido.
- Multilingüe limitado: solo ruso declarado.

## Casos de uso

- Asistente conversacional offline en dispositivos móviles: con 219 MB en Q4_K_M y 4096 tokens de contexto, puede ejecutarse en teléfonos mediante llama.cpp u Ollama para responder consultas cotidianas sin conexión.
- Extracción de datos estructurados en pipelines ligeros: convierte frases en ruso a JSON (por ejemplo, producto y precio) para alimentar sistemas de inventario o formularios en entornos con recursos limitados.
- Enrutamiento de intenciones y tool calling en agentes pequeños: el modelo emite llamadas JSON a herramientas (por ejemplo, `weather`) útiles en asistentes de voz o bots de bajo coste.
- Educación y práctica de ruso: explicación de vocabulario básico y resolución de problemas aritméticos elementales en un entorno controlado y sin dependencia de la nube.
- Prototipado rápido en LM Studio: al estar disponible en el catálogo integrado, permite probar flujos conversacionales en ruso en minutos sin infraestructura.
- Filtrado o clasificación previa en pipelines de bajo presupuesto: por su tamaño, puede ejecutarse en CPU y servir como primera etapa antes de invocar modelos mayores.
- Demostraciones de investigación sobre modelos "from scratch": útil para estudiar el comportamiento de modelos pequeños entrenados con tokenizador propio en ruso.

## Benchmarks y rendimiento

| Benchmark | RusMind Zernyshko 2.0.1 | Referencia indicada por el autor |
|---|---|---|
| MERA 2.0 (puntuación global) | 0,054 (versión 2.0) | no disponible |
| Test práctico interno (120 preguntas) | 74 (versión 2.0) frente a 53,5 antes del ajuste | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de MERA 2.0 y del test interno corresponden a la versión 2.0, no específicamente a la 2.0.1.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en todas las cuantizaciones; Q4_K_M requiere aproximadamente 0,3 GB y Q8_0 alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en GPU consumer: sí, en cualquier RTX, GTX o iGPU con más de 1 GB de memoria; también en Raspberry Pi y teléfonos.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...`), LM Studio (búsqueda "RusMind Zernyshko") y Transformers con los safetensors del repo base.
- Latencia y throughput: no disponible en la información proporcionada; por el tamaño, se espera inferencia en tiempo real incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0.1 | 342 M | 4096 | ru | RusMind License (no comercial libre) | GGUF y safetensors en HF |
| Qwen2.5-0.5B | 500 M | 32.768 | multilingüe | Apache 2.0 | HF, GGUF, Ollama |
| SmolLM2-360M | 360 M | 8192 | inglés principalmente | Apache 2.0 | HF, GGUF |
| TinyLlama-1.1B | 1.100 M | 2048 | inglés | Apache 2.0 | HF, GGUF |

Los modelos comparables de tamaño similar (Qwen2.5-0.5B, SmolLM2-360M) ofrecen contextos mayores y licencias permisivas, pero no están especializados en ruso. RusMind Zernyshko se distingue por su tokenizador específico para ruso y su entrenamiento desde cero, aunque su rendimiento absoluto es inferior y su licencia restringe el uso comercial.

## Limitaciones y advertencias

- Rendimiento global muy bajo: MERA 2.0 de 0,054 indica una calidad limitada incluso en ruso.
- Riesgo elevado de alucinación en temas fuera de su dominio; el propio autor enfatiza la calibración de "no sé" como mitigación, no como garantía.
- Solo soporta ruso; no se declara ni evalúa el rendimiento en otros idiomas.
- Contexto corto (4096 tokens) que limita tareas de documentos largos o conversaciones extensas.
- Licencia restrictiva: uso comercial, redistribución de versiones modificadas o integración en productos requiere contrato escrito con DICPlay.
- Sin datos publicados sobre sesgos, composición exacta del dataset ni evaluaciones independientes.
- El tokenizador propio de 48.000 tokens implica que no es compatible con herramientas que asumen el vocabulario Llama estándar más allá de la carga en llama.cpp.
- Los resultados reportados corresponden a la versión 2.0; la 2.0.1 no tiene métricas propias publicadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF
- Repositorio safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1
- Archivo Q8_0: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/RusMind-Zernyshko-2.0.1-Q8_0.gguf
- Archivo Q4_K_M: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/RusMind-Zernyshko-2.0.1-Q4_K_M.gguf
- Archivo F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/RusMind-Zernyshko-2.0.1-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/LICENSE
- Contacto Telegram: https://t.me/DanKirillin
- Contacto MAX: https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
