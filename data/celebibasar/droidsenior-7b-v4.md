# celebibasar/DroidSenior-7B-v4

## Resumen

DroidSenior-7B-v4 es un modelo de generación de texto especializado en desarrollo Android y Kotlin, publicado por el usuario celebibasar en Hugging Face. Se trata de un ajuste fino (SFT) sobre DroidSenior-7B-v3, que a su vez parte de la familia Qwen2, con 7.615.616.512 parámetros totales en formato safetensors. El modelo está entrenado para escribir código idiomático sobre el stack estable de Android: Jetpack Compose, Coroutines/Flow, Hilt y Room, siguiendo la guía oficial de arquitectura de Android.

Su propuesta de valor es la actualidad del stack: está calibrado contra versiones concretas (AGP 9.5.1, Kotlin 2.4.21, Gradle 9.9.0, compileSdk 37, Compose BOM 2026.09.00, con fecha de referencia 2026-11-08) y evita APIs obsoletas. El autor reporta que todas las respuestas de entrenamiento compilan sin warnings de deprecación contra esas versiones, lo que lo hace útil como asistente de código Android frente a modelos generalistas que tienden a generar APIs legacy.

El modelo es relevante para equipos que necesitan un asistente de código Android desplegable localmente (existe una cuantización Q4_K_M GGUF de 4,68 GB que corre a 7,3 tokens/s en CPU en Colab) y que priorizan licencia Apache 2.0 y compatibilidad con text-generation-inference. Sus idiomas declarados son inglés y turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF, 4,68 GB); otras no disponibles |
| Idiomas soportados | en, tr |
| Licencia | apache-2.0 (con caveat de linaje, ver limitaciones) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 7.615.616.512 parámetros, afinado mediante SFT sobre DroidSenior-7B-v3. El entrenamiento consistió en 3.479 ejemplos con LoRA de rango 32 y cálculo de pérdida únicamente sobre los tokens del asistente. De esos ejemplos, 1.461 fueron escritos o reparados por Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 tras pasar comprobaciones de compilación, lo que introduce una destilación parcial desde un modelo profesor mayor.

La innovación metodológica destacable es la verificación por compilador: cada respuesta objetivo del conjunto de entrenamiento compila contra las versiones objetivo sin warnings de deprecación. El modelo está calibrado contra AGP 9.5.1 (Kotlin integrado), Kotlin 2.4.21, Gradle 9.9.0, compileSdk 37 y Compose BOM 2026.09.00, con fecha de corte 2026-11-08. Los datasets empleados son giggiovpg/android-kotlin-compose-compiler-verified y giggiovpg/ornith-android-instruct. No se documentan fases de RLHF o DPO.

## Capacidades

- Generación de código Kotlin idiomático para Android: Jetpack Compose, Coroutines/Flow, Hilt y Room.
- Migración de APIs obsoletas a las versiones actuales del stack Android.
- Respuestas con explicación breve de decisiones de diseño y trade-offs.
- Inclusión de tests cuando aportan valor, según el system prompt recomendado.
- Respuesta en el idioma del usuario (declarados en y tr).
- Compatible con text-generation-inference y endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el autor documenta rondas de reparación externas con herramientas alrededor del modelo.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente de código Android en IDE o CLI: el modelo genera pantallas Compose, ViewModels y capas de datos siguiendo la arquitectura oficial, con la ventaja de que su entrenamiento está verificado por compilador contra AGP 9.5.1 y Kotlin 2.4.21, reduciendo la aparición de APIs deprecadas.
- Migración de proyectos legacy: preguntas de migración se responden con código efectivamente migrado, ya que el conjunto de evaluación "current" exige que las migraciones se realicen de verdad y sin ajustes Gradle obsoletos.
- Generación de tests unitarios y de UI: el system prompt indica incluir tests cuando aportan valor, útil para completar cobertura en módulos nuevos.
- Revisión de código en pipelines de CI: combinado con compilación (`:app:compileDebugKotlin`) y rondas de reparación automática, el autor reporta tasas de compilación del 58,4% tras dos rondas, lo que permite usarlo como primer paso de un pipeline de generación con verificación.
- Despliegue local en estaciones de trabajo: la cuantización Q4_K_M de 4,68 GB permite ejecución en CPU (7,3 tokens/s en Colab), adecuada para entornos sin GPU o con privacidad de código.
- Soporte a equipos con documentación de versiones: al pegar el `libs.versions.toml` en el prompt se mitiga el corte de conocimiento de librerías posterior a 2026-11-08.
- Formación y onboarding: explicaciones de decisiones de diseño y trade-offs en Kotlin moderno para desarrolladores que llegan al stack Android actual.

## Benchmarks y rendimiento

Resultados autoevaluados por el autor, con el mismo system prompt y decodificación greedy; intervalos bootstrap al 95%.

| Modelo | Nuevo set: compila | Nuevo set: compila y actual | Set anterior: compila | Kotlin HumanEval | + auto import | + 2 rondas de reparación |
|---|---|---|---|---|---|---|
| v3 | 39,4% (35%-45%) | 36,4% (32%-41%) | 42,3% (32%-54%) | 73,9% (67%-81%) | 47,0% (42%-52%) | 47,6% (43%-53%) |
| sft_r4 (v4) | 47,3% (42%-52%) | 46,7% (42%-52%) | 50,0% (38%-62%) | 72,7% (66%-80%) | 55,7% (51%-61%) | 58,4% (53%-64%) |

- El nuevo set consta de 368 preguntas generadas para esta versión y nunca usadas en entrenamiento; un modelo profesor mayor podía resolverlas bajo las mismas comprobaciones.
- "Current" exige compilar sin warnings de deprecación, sin versiones de librería obsoletas ni ajustes Gradle legacy, y que las preguntas de migración estén realmente migradas.
- El set anterior son 78 preguntas retenidas de la versión previa.
- La compilación usa `:app:compileDebugKotlin` en un proyecto plantilla sin KSP; no prueba comportamiento en tiempo de ejecución.
- Auto import y reparación son resultados de sistema con herramientas alrededor del modelo, no de un único intento.
- Frente a v3: compilación +7,9% (IC 95% +2,2% a +13,6%) y "current" +10,3% (IC 95% +4,6% a +16,0%).
- No son resultados oficiales de Android Bench; son pruebas autoejecutadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo denso de 7,6B en FP16 se requieren aproximadamente 15,2 GB de pesos (tamaño del repo), y en Q4_K_M el archivo GGUF ocupa 4,68 GB.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; la cuantización Q4_K_M de 4,68 GB es compatible con GPUs de consumo con suficiente VRAM, pero el autor no especifica modelos concretos.
- Despliegue: transformers, text-generation-inference, endpoints compatibles y GGUF (Q4_K_M). No se mencionan vLLM, llama.cpp u Ollama de forma explícita, aunque el formato GGUF es compatible con dichos runners.
- Rendimiento: 7,3 tokens/s en CPU en Colab con Q4_K_M. Throughput en GPU no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroidSenior-7B-v4 | 7,6B | no disponible | Código Android/Kotlin, stack 2026 | apache-2.0 (con caveat de linaje) | Hugging Face |
| DroidSenior-7B-v3 | no disponible | no disponible | Versión previa del mismo linaje | no disponible | Hugging Face (base del v4) |
| Qwen2 base (familia) | ~7B | no disponible | Modelo generalista | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada; la única comparación cuantitativa disponible es v4 frente a v3.

## Limitaciones y advertencias

- El código generado puede ser incorrecto; el autor recomienda revisarlo antes de usarlo.
- El conocimiento de APIs de librerías se detiene en la fecha objetivo 2026-11-08; versiones posteriores son desconocidas para el modelo.
- Los benchmarks son autoejecutados y no equivalen a un resultado oficial de Android Bench.
- La compilación de evaluación no prueba comportamiento en tiempo de ejecución.
- Linaje con datos de JetBrains/KExercises bajo CC-BY-NC-SA-4.0 en las versiones v1 a v3: aunque la licencia declarada es Apache 2.0, el autor advierte de revisar esos términos antes de un uso comercial.
- Idiomas limitados a inglés y turco; el soporte de castellano no está garantizado.
- Longitud de contexto no documentada, lo que dificulta planificar prompts largos (por ejemplo, proyectos completos).
- Riesgo de alucinación de APIs o versiones de librería no presentes en el entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Sin datos de tool calling ni de comportamiento agéntico nativo; las mejoras de reparación dependen de herramientas externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/celebibasar/DroidSenior-7B-v3 (base) y https://huggingface.co/celebibasar/DroidSenior-7B-v4
- Dataset: https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Dataset: https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Modelo profesor citado: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8
- Fichero de versiones objetivo: `droidsenior_versions.json` (referenciado en la model card, no enlazado)
- Paper, blog o demo oficial: no disponible
