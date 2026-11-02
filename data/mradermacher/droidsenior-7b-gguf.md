# mradermacher/DroidSenior-7B-GGUF

## Resumen

DroidSenior-7B-GGUF es la distribución en formato GGUF del modelo DroidSenior-7B, un ajuste fino (fine-tuning) de la familia Qwen2 orientado específicamente a la asistencia en programación para el ecosistema Android. El modelo original fue desarrollado por el usuario celebibasar y esta versión cuantizada ha sido generada por mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp y derivados. El modelo parte de una base Qwen2 de aproximadamente 7.615 millones de parámetros y ha sido entrenado mediante SFT y DPO sobre un conjunto de datasets centrados en código, con especial énfasis en Kotlin, Jetpack Compose y ejercicios verificados de Android.

El problema que aborda es la falta de asistentes de código especializados en el desarrollo Android moderno, donde las prácticas de Jetpack Compose, la arquitectura recomendada por Google y los ejercicios de compilación verificada no están bien representados en los modelos generalistas. Al estar basado en Qwen2, hereda una arquitectura transformer decoder-only con RoPE y atención de grupos de consultas (GQA), aunque la model card no detalla la longitud de contexto efectiva tras el ajuste.

Esta versión GGUF es relevante para desarrolladores que quieren ejecutar el modelo en local con llama.cpp, Ollama o interfaces similares, incluyendo hardware de consumo, gracias a las cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB). La licencia Apache 2.0 facilita su uso comercial, aunque el modelo está etiquetado únicamente para inglés y turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino con LoRA + SFT + DPO |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | Ingles (en), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version original en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen2, una arquitectura transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE) con atención de grupos de consultas (GQA). Sobre esta base, el autor aplicó un ajuste fino supervisado (SFT) y optimización por preferencias directas (DPO), presumiblemente mediante adaptadores LoRA, según indican las etiquetas `lora`, `sft` y `dpo` de la model card. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la lista de fuentes.

Los datos de entrenamiento combinan ocho datasets públicos: JetBrains/KExercises (ejercicios de Kotlin), dos conjuntos de instrucciones Android verificadas por compilador (giggiovpg/android-kotlin-compose-compiler-verified y giggiovpg/ornith-android-instruct), Glaive Code Assistant v3, Magicoder OSS Instruct 75K, CodeFeedback Filtered Instruction, Microsoft NextCoderDataset y Evol CodeAlpaca v1. Esta mezcla sugiere un entrenamiento orientado a instrucciones de código general con un sesgo fuerte hacia Kotlin y Android. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código en Kotlin, Java y presumiblemente otros lenguajes presentes en los datasets de código (Python, JavaScript, etc.).
- Asistencia específica en Jetpack Compose y patrones de UI declarativa de Android.
- Resolución de ejercicios de programación y tareas de instrucción de código.
- Conversación multi-turno en formato chat (etiqueta `conversational`).
- Ajuste por preferencias (DPO) orientado a mejorar la calidad de las respuestas de código.
- Soporte de inglés y turco; el resto de idiomas no está garantizado.
- No se documenta soporte explícito de tool calling, function calling, agentes o modo de razonamiento extendido.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistente de código en IDE para Android: el modelo puede autocompletar y explicar fragmentos de Kotlin y Jetpack Compose, aprovechando su entrenamiento sobre ejercicios verificados por compilador para reducir errores sintácticos en este ecosistema.
- Generación de pantallas Compose: dado un requisito de UI, el modelo puede proponer composables con estado, layouts y modificadores, útil para prototipado rápido en equipos Android.
- Resolución de ejercicios y formación: al haberse entrenado con JetBrains/KExercises, es adecuado para tutores de programación Kotlin que expliquen soluciones paso a paso.
- Revisión de código en pipelines de CI: puede integrarse como paso de pre-revisión para detectar patrones no idiomáticos en Kotlin, aunque sin garantías de tool calling nativo.
- Chat de soporte técnico para desarrolladores: con su formato conversacional, puede mantener diálogos multi-turno sobre dudas de API de Android, Gradle o Compose.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_S (4,6 GB) y Q8_0 (8,2 GB), puede ejecutarse en portátiles con GPU de consumo para asistencia offline sin enviar código a la nube.
- Generación de tests unitarios en Kotlin: puede producir esqueletos de pruebas JUnit para funciones Android, aunque requiere revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB con Q2_K, 5-6 GB con Q4_K_S, 6-7 GB con Q4_K_M, 8-9 GB con Q8_0 y 16-17 GB con f16 (incluyendo overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4/Q5/Q8; RTX 4090 para f16 o contextos largos; A100/H100 no son necesarias para un modelo de 7B.
- Cabe en GPU de consumo: sí, desde GPUs con 6-8 GB de VRAM usando Q4_K_S o Q4_K_M; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; el repo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| DroidSenior-7B-GGUF | 7,6B | No disponible | Android/Kotlin/Compose | Apache 2.0 | GGUF |
| Qwen2.5-Coder-7B | 7,6B | 32K (tipico en la familia) | Codigo general | Apache 2.0 | safetensors, GGUF |
| CodeLlama-7B | 6,7B | 16K | Codigo general | Llama 2 custom | safetensors, GGUF |
| DeepSeek-Coder-6.7B | 6,7B | 16K | Codigo general | DeepSeek custom | safetensors, GGUF |

La comparativa se basa en características públicas de estos modelos; no se dispone de resultados de benchmarks de DroidSenior-7B para comparar rendimiento real. Su ventaja diferencial es la especialización en Android y Kotlin, mientras que los alternativos son más generalistas en código.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y turco están declarados; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Riesgo de alucinación en APIs de Android: como todo modelo de código, puede inventar métodos, parámetros o dependencias de Gradle que no existen.
- Sesgo hacia el ecosistema Android/Kotlin: su rendimiento en otros dominios (backend, data science, frontend web) puede ser inferior al de modelos generalistas del mismo tamaño.
- Contexto no documentado: se desconoce la ventana efectiva tras el ajuste, lo que complica planificar tareas con repositorios grandes.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines agénticos sin trabajo adicional.
- Datos de entrenamiento de terceros: la mezcla de datasets puede introducir sesgos de estilo o licencias de los datasets originales, aunque el modelo se distribuye como Apache 2.0.
- Versión cuantizada: las cuantizaciones Q2_K y Q3_K degradan la calidad; para producción se recomienda Q4_K_M o superior.
- Repo de 68,1 GB: incluye todas las cuantizaciones, lo que requiere descargar solo el archivo necesario.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/DroidSenior-7B-GGUF
- Modelo base: https://huggingface.co/celebibasar/DroidSenior-7B
- Página de descargas del cuantizador: https://hf.tst.eu/model#DroidSenior-7B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset JetBrains/KExercises: https://huggingface.co/datasets/JetBrains/KExercises
- Dataset android-kotlin-compose-compiler-verified: https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Dataset ornith-android-instruct: https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Dataset glaive-code-assistant-v3: https://huggingface.co/datasets/glaiveai/glaive-code-assistant-v3
- Dataset Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset NextCoderDataset: https://huggingface.co/datasets/microsoft/NextCoderDataset
- Dataset evol-codealpaca-v1: https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
