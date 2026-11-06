# celebibasar/DroidSenior-7B-v3

## Resumen

DroidSenior-7B-v3 es un modelo de generación de texto especializado en desarrollo Android y Kotlin, desarrollado por el usuario de Hugging Face `celebibasar`. Se trata de un ajuste fino (fine-tuning) del modelo base DroidSenior-7B, que a su vez parte de la familia Qwen2, con 7.615.616.512 parámetros totales. El modelo está diseñado para actuar como un ingeniero Android de nivel staff, generando código Kotlin idiomático con Jetpack Compose, Coroutines/Flow, Hilt y Room, siguiendo las guías oficiales de arquitectura de Android.

La versión v3 incorpora un pipeline de entrenamiento en dos fases: SFT (supervised fine-tuning) con 6.026 ejemplos y DPO (direct preference optimization) con 1.208 pares verificados por compilador, donde la respuesta rechazada no compilaba. Esta combinación busca mejorar la tasa de compilación del código generado, un problema endémico en asistentes de código. El modelo se distribuye bajo licencia Apache 2.0, aunque el autor advierte que los datos de entrenamiento de versiones anteriores incluyeron JetBrains/KExercises bajo CC-BY-NC-SA-4.0, lo que requiere revisión antes de uso comercial.

El modelo soporta inglés y turco, tiene una ventana de contexto no especificada en la información disponible y se distribuye en formato safetensors (15,2 GB de repositorio) y GGUF cuantizado Q4_K_M (4,68 GB). Es relevante para equipos que necesitan un asistente de código Android ejecutable en hardware modesto, con métricas de compilación publicadas y verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (4,68 GB); otros no disponibles |
| Idiomas soportados | en, tr |
| Licencia | Apache 2.0 (con caveat sobre datos CC-BY-NC-SA-4.0) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de la familia Qwen2, con 7.615.616.512 parámetros. El entrenamiento se realizó en dos fases sobre el modelo base DroidSenior-7B. La primera fase de SFT utilizó 6.026 ejemplos con LoRA de rango 32, calculando la pérdida únicamente sobre los tokens del asistente. La segunda fase aplicó DPO con 1.208 pares verificados por compilador, donde la respuesta rechazada fallaba al compilar, con un valor beta de 0,1. Las preguntas del split de evaluación fueron eliminadas de los datos de entrenamiento para evitar contaminación.

Los datasets utilizados son `giggiovpg/android-kotlin-compose-compiler-verified` y `giggiovpg/ornith-android-instruct`. El autor indica que los datos de entrenamiento de las versiones v1/v2 incluyeron JetBrains/KExercises bajo licencia CC-BY-NC-SA-4.0, lo que introduce una restricción potencial para uso comercial que debe verificarse. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de las fuentes citadas.

## Capacidades

- Generación de código Kotlin idiomático para Android, incluyendo Jetpack Compose, Coroutines/Flow, Hilt y Room.
- Explicación de decisiones de diseño y trade-offs de forma breve, según el system prompt definido por el autor.
- Evitación de APIs obsoletas (legacy API rate del 0% en la evaluación publicada).
- Inclusión de tests cuando aportan valor, según las instrucciones del system prompt.
- Respuesta en el idioma del usuario (soporte declarado para inglés y turco).
- Generación de código autocontenido compilable (tasa de compilación Android del 20,5% en la evaluación).
- Capacidad de razonamiento sobre arquitectura Android y patrones de diseño.
- No se declara soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente de código en el IDE: el modelo puede integrarse en extensiones de editor para generar pantallas Compose completas y ViewModels con StateFlow, aprovechando su entrenamiento específico en la arquitectura oficial de Android y su baja tasa de APIs obsoletas (0% en la evaluación publicada).
- Generación de código de UI con Jetpack Compose: adecuado para producir composables autocontenidos que compilen en un proyecto plantilla, útil en prototipado rápido de pantallas y componentes reutilizables.
- Revisión y modernización de código legacy: dado que el modelo evita APIs obsoletas, puede emplearse para sugerir migraciones de Views a Compose o de LiveData a Flow en bases de código existentes.
- Generación de tests unitarios: el system prompt indica incluir tests cuando aportan valor, por lo que puede usarse para generar tests de ViewModels y repositorios con JUnit y coroutines-test.
- Formación y onboarding de desarrolladores junior: el modelo explica decisiones de diseño y trade-offs, lo que lo hace útil como herramienta de aprendizaje en equipos que adoptan Compose y Hilt.
- Despliegue en entornos con recursos limitados: la versión GGUF Q4_K_M (4,68 GB) permite ejecución en CPU a 7,3 tokens/s en Colab, lo que habilita su uso en portátiles sin GPU dedicada para tareas de autocompletado o consultas puntuales.
- Asistencia en turco para equipos de desarrollo: el soporte declarado de turco permite atender consultas técnicas en ese idioma, útil en equipos mixtos.

## Benchmarks y rendimiento

| Modelo | Tasa de compilación Android | Tasa de paso Kotlin HumanEval | Tasa de API legacy |
|---|---|---|---|
| base | 2,6% (0%-6%) | 62,1% (55%-70%) | 40% |
| v1 | 5,1% (1%-10%) | 64,0% (57%-71%) | 3% |
| v2 | 3,8% (0%-9%) | 64,6% (57%-72%) | 4% |
| sft_r2 | 20,5% (12%-29%) | 67,7% (60%-75%) | 0% |
| dpo_r2 (seleccionado) | 20,5% (12%-29%) | 67,7% (61%-75%) | 0% |

La tasa de compilación Android se midió sobre 78 preguntas reservadas, cada una solicitando código autocontenido, compilado con `:app:compileDebugKotlin` en un proyecto plantilla fijo sin KSP. Mide compilación, no comportamiento. Kotlin HumanEval comprende 161 tareas de JetBrains/Kotlin_HumanEval. Los intervalos son del 95% por bootstrap. La diferencia de Android frente a v1 es de +15,4% (IC 95% +6,4% a +24,4%). El modelo seleccionado es `dpo_r2`. El autor advierte que son pruebas propias, no un resultado oficial de Android Bench.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15,2 GB (tamaño del repositorio en safetensors), por lo que requiere GPU con al menos 16 GB para carga completa.
- VRAM estimada en Q4_K_M: 4,68 GB, según el archivo GGUF publicado.
- GPU recomendadas: A100 o H100 para FP16 con throughput alto; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090/4080 (16 GB) al límite para FP16.
- Cabe en GPU consumer: sí, en RTX 4090 para FP16 y en GPUs con 8 GB o más usando Q4_K_M.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`), llama.cpp/Ollama para GGUF.
- Latencia y throughput: 7,3 tokens/s en CPU con Q4_K_M en Colab, según el autor. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroidSenior-7B-v3 | 7,6B | no disponible | Android/Kotlin | Apache 2.0 (caveat NC en datos) | Hugging Face, GGUF |
| Qwen2.5-Coder-7B | 7,6B | 32K (según versión) | Código general | Apache 2.0 | Hugging Face, GGUF, vLLM |
| CodeLlama-7B | 6,7B | 16K | Código general | Llama 2 custom | Hugging Face, GGUF |
| DeepSeek-Coder-6.7B | 6,7B | 16K | Código general | DeepSeek custom | Hugging Face, GGUF |

Los datos de contexto y licencia de los modelos comparables provienen de conocimiento general y no de la información proporcionada en esta ficha; verifíquense antes de su uso. DroidSenior-7B-v3 se diferencia por su especialización vertical en Android/Kotlin y por publicar métricas de compilación específicas del dominio, frente a los modelos generalistas de código.

## Limitaciones y advertencias

- El código generado puede ser incorrecto; el autor recomienda revisarlo antes de usarlo.
- APIs recientes pueden no estar presentes en el modelo, dado que el entrenamiento no cubre necesariamente las últimas versiones del SDK.
- Las métricas son autoevaluaciones del autor, no resultados oficiales de Android Bench.
- La tasa de compilación Android del 20,5% implica que aproximadamente 4 de cada 5 respuestas no compilan en el proyecto plantilla, lo que limita su uso autónomo en producción sin verificación.
- Los datos de entrenamiento de v1/v2 incluyeron JetBrains/KExercises bajo CC-BY-NC-SA-4.0, lo que puede restringir el uso comercial pese a la licencia Apache 2.0 declarada; es necesario revisar los términos.
- Solo se declaran inglés y turco; el rendimiento en castellano no está evaluado.
- No se declara soporte de tool calling, agentes ni multimodalidad, lo que limita su integración en pipelines agénticos.
- No se especifica la longitud de contexto, lo que impide planificar su uso en bases de código extensas.
- Riesgo de alucinación en APIs y firmas de funciones no vistas durante el entrenamiento.
- Sesgos no documentados en la información disponible.

## Enlaces

- [Hugging Face: celebibasar/DroidSenior-7B-v3](https://huggingface.co/celebibasar/DroidSenior-7B-v3)
- [Modelo base: celebibasar/DroidSenior-7B](https://huggingface.co/celebibasar/DroidSenior-7B)
- [Dataset: giggiovpg/android-kotlin-compose-compiler-verified](https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified)
- [Dataset: giggiovpg/ornith-android-instruct](https://huggingface.co/datasets/giggiovpg/ornith-android-instruct)
- [JetBrains/KExercises](https://huggingface.co/datasets/JetBrains/KExercises)
- [JetBrains/Kotlin_HumanEval](https://huggingface.co/datasets/JetBrains/Kotlin_HumanEval)
