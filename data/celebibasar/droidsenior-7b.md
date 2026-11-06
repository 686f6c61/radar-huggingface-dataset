# celebibasar/DroidSenior-7B

## Resumen

DroidSenior-7B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-7B-Instruct, desarrollado por el usuario de Hugging Face celebibasar, orientado especificamente al desarrollo de aplicaciones Android. El modelo busca responder como lo haria un ingeniero Android de nivel senior o staff: Kotlin idiomatico y moderno, Jetpack Compose, Coroutines/Flow, Hilt y Room, siguiendo las guias oficiales de arquitectura de Android y evitando APIs obsoletas. Resuelve el problema de que los asistentes de codigo genericos tienden a producir patrones Android desactualizados (AsyncTask, GlobalScope, kapt, synthetics) o respuestas genericas de Java.

Tecnicamente se trata de un transformer decoder-only de 7.615.616.512 parametros (unos 7,6 mil millones), con pesos en formato safetensors y un tamano de repositorio de 15,2 GB. Se ha entrenado mediante LoRA en dos fases (SFT y DPO) sobre el modelo base, con una ventana de contexto que la model card sugiere operar a 16.384 tokens en vLLM (`--max-model-len 16384`), aunque la longitud de contexto nativa del modelo base es mayor.

Su relevancia actual radica en la especializacion vertical: en lugar de competir en benchmarks generales de codigo, se centra en un nicho concreto (Android/Kotlin) con datos filtrados por modernidad y calidad, destilacion de un modelo profesor mayor y filtrado por juez automatico. Esta publicado bajo licencia Apache 2.0, con soporte para transformers, vLLM, Ollama y llama.cpp a traves de un repositorio GGUF separado, e idiomas ingles y turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune de Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens recomendados en vLLM; contexto nativo del base no especificado en la informacion disponible |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M en el repo GGUF); pesos originales en bf16 |
| Idiomas soportados | ingles (en), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo `celebibasar/DroidSenior-7B-GGUF`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso de aproximadamente 7,6 mil millones de parametros con atencion por causalidad estandar y tokenizer Qwen2. Sobre esa base se aplico un ajuste fino con LoRA (bf16) en todas las proyecciones de atencion y MLP, calculando la perdida unicamente sobre los tokens del asistente. El entrenamiento se estructuro en dos etapas: primero SFT y despues DPO con preferencias generadas on-policy (el modelo SFT muestreo 4 respuestas por prompt, un juez eligio la mejor y la peor, generando 654 pares con beta=0,1, learning rate 5e-06 y LoRA r=32).

Los datos combinan ejemplos abiertos de Android/Kotlin procedentes de ocho datasets publicos (JetBrains/KExercises, giggiovpg/android-kotlin-compose-compiler-verified, giggiovpg/ornith-android-instruct, glaiveai/glaive-code-assistant-v3, ise-uiuc/Magicoder-OSS-Instruct-75K, m-a-p/CodeFeedback-Filtered-Instruction, microsoft/NextCoderDataset y theblackcat102/evol-codealpaca-v1), filtrados por relevancia Android, eliminacion de APIs obsoletas y deduplicacion, junto con 4.143 ejemplos sinteticos de nivel senior destilados de Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 (de 8.788 generados, filtrados por un juez segun correccion, modernidad, arquitectura, calidad de codigo, completitud y claridad). La taxonomia de destilacion cubre 12 areas por 9 tipos de tarea (implementacion de features, code review, refactorizacion de legacy, decisiones de arquitectura, depuracion, testing, rendimiento, deep dives y diseno de sistemas). Los datos senior usaron el system prompt recomendado; los datos abiertos usaron un prompt generico como condicionamiento de calidad.

## Capacidades

- Generacion de codigo Kotlin idiomatico y moderno para Android, con enfasis en Jetpack Compose, Coroutines y Flow, Hilt y Room.
- Implementacion de features completas siguiendo la guia oficial de arquitectura de Android.
- Code review y refactorizacion de codigo legacy, con deteccion y sustitucion de APIs obsoletas (AsyncTask, GlobalScope, kapt, synthetics).
- Decisiones de arquitectura con explicacion explicita de trade-offs.
- Depuracion y analisis de errores en proyectos Android.
- Generacion de tests cuando aportan valor.
- Diseno de sistemas y deep dives tecnicos.
- Conversacion multi-turno mediante plantilla de chat (formato de mensajes system/user/assistant).
- Capacidades multilingues limitadas a ingles y turco.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente de desarrollo Android en el IDE: el modelo puede generar pantallas completas con Jetpack Compose, ViewModel y estado gestionado por Flow, manteniendo coherencia con la arquitectura recomendada y evitando APIs obsoletas, gracias a su entrenamiento especifico en Kotlin moderno.
- Migracion de codigo legacy: se le puede pedir que reescriba modulos basados en AsyncTask, LiveData o kapt hacia Coroutines, Flow y KSP, explicando los cambios y los trade-offs, ya que el filtrado de datos elimino explicitamente respuestas con APIs antiguas.
- Revision de pull requests: dado un diff de Kotlin/Android, el modelo puede actuar como revisor senior senalando problemas de arquitectura, fugas de memoria o mal uso de Compose, con justificacion tecnica.
- Generacion de tests unitarios e instrumentados: puede producir tests para ViewModels y repositorios, incluyendo casos con Coroutines y Turbine, cuando aportan valor segun su prompt de sistema.
- Formacion y onboarding de desarrolladores junior: sirve como mentor conversacional que explica decisiones de diseno Android y patrones de arquitectura en ingles o turco, con contexto multi-turno.
- Automatizacion en pipelines de CI/CD: desplegado con vLLM como servidor compatible con la API de OpenAI, puede integrarse en herramientas internas para generar sugerencias de codigo o revisiones automatizadas en repositorios Android.
- Soporte a equipos turcos o angloparlantes: al responder en el idioma del usuario (en/tr), es util para equipos con documentacion o comunicacion en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion Q4_K_M (GGUF): en torno a 5-6 GB para pesos, con margen adicional para contexto.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con vLLM a 16.384 tokens de contexto; RTX 4090 (24 GB) para bf16 en un solo usuario o para cuantizaciones con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB o mas usando GGUF Q4_K_M (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090); en bf16 requiere 24 GB o mas.
- Opciones de despliegue: transformers, vLLM (`vllm serve celebibasar/DroidSenior-7B --max-model-len 16384`), Ollama (`ollama run hf.co/celebibasar/DroidSenior-7B-GGUF:Q4_K_M`), llama.cpp y LM Studio mediante el repo GGUF; el tag `text-generation-inference` sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroidSenior-7B | 7,6 B | 16.384 recomendados en vLLM | Android/Kotlin (Compose, Coroutines, Hilt, Room) | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | contexto nativo del base (no detallado aqui) | Codigo general multilingue | Apache 2.0 | Hugging Face, muy extendido |
| Qwen3-Coder-30B-A3B-Instruct | 30 B (MoE, ~3 B activos) | no disponible en esta ficha | Codigo general, modelo profesor del destilado | no disponible en esta ficha | Hugging Face |

La comparativa con alternativas especificas de Android/Kotlin no esta disponible en la informacion proporcionada. Frente a su modelo base, DroidSenior-7B anade especializacion vertical y filtrado de APIs obsoletas, a costa de un alcance de idiomas mas reducido (en/tr) y de un posible deterioro en tareas de codigo general fuera de Android.

## Limitaciones y advertencias

- Alcance limitado a Android/Kotlin: el ajuste fino puede degradar el rendimiento en otros lenguajes o dominios respecto al modelo base.
- Idiomas: solo se declaran ingles y turco; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo de codigo, puede inventar APIs, firmas o dependencias; requiere verificacion y compilacion en produccion.
- Datos con licencia no comercial: parte del dataset de entrenamiento (JetBrains/KExercises) tiene licencia CC-BY-NC-SA-4.0, lo que puede plantear dudas sobre la procedencia de los datos aunque los pesos se distribuyan como Apache 2.0.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Modelo con cero descargas y cero likes en el momento de la ficha: ecosistema y validacion comunitaria practicamente inexistentes.
- El contexto operativo recomendado (16.384 tokens) es inferior al que pueden ofrecer otros modelos de la misma familia si se configura de otro modo; conviene validar el comportamiento en contextos largos.
- Para uso comercial, revisar la licencia Apache 2.0 del modelo junto con las condiciones de los datasets de entrenamiento citados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/celebibasar/DroidSenior-7B
- Repositorio GGUF: https://huggingface.co/celebibasar/DroidSenior-7B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo profesor: Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 (referenciado en la model card)
- Dataset JetBrains/KExercises: https://huggingface.co/datasets/JetBrains/KExercises
- Dataset giggiovpg/android-kotlin-compose-compiler-verified: https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Dataset giggiovpg/ornith-android-instruct: https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Dataset glaiveai/glaive-code-assistant-v3: https://huggingface.co/datasets/glaiveai/glaive-code-assistant-v3
- Dataset ise-uiuc/Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset m-a-p/CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset microsoft/NextCoderDataset: https://huggingface.co/datasets/microsoft/NextCoderDataset
- Dataset theblackcat102/evol-codealpaca-v1: https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
