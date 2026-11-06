# mradermacher/DroidSenior-7B-i1-GGUF

## Resumen

DroidSenior-7B-i1-GGUF es la versión cuantizada en formato GGUF del modelo DroidSenior-7B, desarrollado originalmente por el usuario celebibasar y cuantizado por mradermacher. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen2 de 7.000 millones de parámetros, especializado en generación de código para el ecosistema Android, con especial énfasis en Kotlin y Jetpack Compose. El modelo se distribuye bajo licencia Apache 2.0 y está pensado como asistente de programación para desarrolladores de aplicaciones móviles.

El modelo parte de una arquitectura transformer decoder-only de tipo Qwen2, con 7.615.616.512 parámetros totales según los pesos en safetensors. Ha sido entrenado mediante una combinación de SFT (supervised fine-tuning) y DPO (direct preference optimization) sobre un conjunto de datasets orientados a código, incluyendo datos específicos de Android y Kotlin. Esta versión GGUF incorpora cuantizaciones con imatrix (importance matrix) que permiten ejecutar el modelo en hardware de consumo con pérdidas de calidad controladas.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y desplegable localmente para tareas de asistencia en desarrollo Android, un nicho poco cubierto por los modelos generalistas. Al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros runners de inferencia local, lo que facilita su integración en entornos de desarrollo sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_NL, i1-Q4_K_S (y otras variantes i1 listadas en la model card) |
| Idiomas soportados | en, tr |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen2, una arquitectura transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU, tal como corresponde a la familia Qwen2 de 7B. El fine-tuning se realizó sobre el checkpoint celebibasar/DroidSenior-7B, que a su vez parte de Qwen2. El entrenamiento combina SFT y DPO, según indican las etiquetas de la model card (`lora`, `sft`, `dpo`), lo que sugiere un pipeline de ajuste supervisado seguido de optimización por preferencias para alinear las respuestas con código de calidad.

Los datos de entrenamiento provienen de ocho datasets: JetBrains/KExercises, giggiovpg/android-kotlin-compose-compiler-verified, giggiovpg/ornith-android-instruct, glaiveai/glaive-code-assistant-v3, ise-uiuc/Magicoder-OSS-Instruct-75K, m-a-p/CodeFeedback-Filtered-Instruction, microsoft/NextCoderDataset y theblackcat102/evol-codealpaca-v1. Esta composición mezcla ejercicios de Kotlin, instrucciones verificadas de Android/Compose, datos generales de asistencia de código y datasets de instrucciones filtradas, lo que apunta a un entrenamiento orientado tanto a la corrección sintáctica como a la instrucción en lenguaje natural. No se especifica el número total de tokens de entrenamiento ni la composición exacta por dataset. Las cuantizaciones i1 utilizan importance matrix, lo que mejora la calidad respecto a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de código en Kotlin, con especial atención a Jetpack Compose y patrones de Android.
- Asistencia de programación general: explicación de código, refactorización, corrección de errores y generación de tests.
- Razonamiento sobre instrucciones en lenguaje natural para producir código funcional.
- Soporte de conversación multi-turno (etiqueta `conversational`).
- Capacidades multilingües limitadas a inglés y turco según la model card; el código fuente se genera principalmente en Kotlin/Java.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta modo de razonamiento extendido (thinking mode), visión ni audio.
- Compatible con endpoints de Hugging Face (etiqueta `endpoints_compatible`).

## Casos de uso

- Asistencia en el desarrollo de pantallas Jetpack Compose: el modelo puede generar composables a partir de descripciones en lenguaje natural, aprovechando el dataset android-kotlin-compose-compiler-verified para producir código que compila.
- Autocompletado y generación de boilerplate Android: creación de actividades, fragmentos, ViewModels y manifiestos a partir de instrucciones, reduciendo el trabajo repetitivo en proyectos nuevos.
- Explicación y refactorización de código Kotlin existente: el modelo puede analizar fragmentos y proponer mejoras idiomáticas, útil en revisiones de código o incorporación de nuevos desarrolladores.
- Generación de tests unitarios para lógica de negocio en Kotlin, a partir de la firma de funciones y descripciones de comportamiento esperado.
- Despliegue local en estaciones de trabajo de desarrolladores mediante llama.cpp u Ollama, sin enviar código propietario a APIs externas, lo que es relevante por requisitos de confidencialidad.
- Integración en asistentes de IDE o pipelines de CI para sugerencias de parches menores, dado que el formato GGUF permite ejecución en CPU/GPU de consumo con cuantizaciones de 4-5 GB.
- Soporte a la docencia de Android: generación de ejemplos didácticos y ejercicios de Kotlin, apoyándose en el dataset JetBrains/KExercises.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB para i1-Q2_K, 3,7 GB para i1-IQ3_M, 4,6 GB para i1-Q4_K_S y en torno a 6-7 GB para cuantizaciones Q6_K/Q8_0 (esta última no listada en la model card pero habitual en la familia).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para cuantizaciones altas y mayor throughput; A100/H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, desde GTX 1660 6 GB o RTX 3050 8 GB con cuantizaciones Q4; en i1-Q4_K_S es viable en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| DroidSenior-7B-i1-GGUF | 7,6 B | no disponible | Apache 2.0 | GGUF | Código Android/Kotlin |
| Qwen2-7B-Instruct | 7,6 B | 32.768 (según ficha oficial de Qwen2) | Apache 2.0 | safetensors, GGUF | Propósito general |
| CodeQwen1.5-7B | 7,0 B | 65.536 (según ficha oficial) | Apache 2.0 | safetensors, GGUF | Código general |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | 16.384 (según ficha oficial) | DeepSeek License | safetensors, GGUF | Código general |

La comparativa se basa en datos públicos de las fichas oficiales de cada modelo; los valores de contexto de DroidSenior-7B no están documentados en la información disponible. DroidSenior se diferencia por su especialización en Android/Kotlin, mientras que los alternativos cubren código general o propósito general con contextos más amplios documentados.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés y turco; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Al ser un fine-tuning de 7B, el riesgo de alucinación en APIs de Android poco comunes o recientes es elevado; conviene verificar el código generado contra la documentación oficial.
- No se documenta la longitud de contexto efectiva; asumir contextos largos puede provocar degradación.
- Aunque la licencia es Apache 2.0, el modelo base Qwen2 y los datasets de entrenamiento pueden imponer condiciones adicionales; revisar las licencias de los datasets (algunos como JetBrains/KExercises o Magicoder pueden tener términos propios).
- El entrenamiento con datasets de instrucciones filtradas puede introducir sesgos hacia patrones de código concretos y reducir la diversidad de soluciones.
- No hay benchmarks publicados que respalden la calidad frente a alternativas; la evaluación debe hacerse con pruebas propias.
- Las cuantizaciones de 2-3 bits (Q2_K, IQ3_XXS) degradan notablemente la calidad; para producción se recomienda Q4_K_S o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/DroidSenior-7B-i1-GGUF
- Modelo base: https://huggingface.co/celebibasar/DroidSenior-7B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/DroidSenior-7B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#DroidSenior-7B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
