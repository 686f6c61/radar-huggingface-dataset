# CollectionStudio/Devstral-Small-2507

## Resumen

Devstral Small 1.1 es un modelo de lenguaje de tipo agente ("agentic LLM") orientado a tareas de ingeniería de software, desarrollado por Mistral AI en colaboración con All Hands AI. Se trata de un ajuste fino ("finetune") del modelo Mistral-Small-3.1-24B-Instruct-2503, del que hereda su ventana de contexto de hasta 128.000 tokens, y al que se le ha eliminado el codificador de visión para dejarlo como un modelo exclusivamente de texto. Con 23.572.403.200 parámetros, es lo bastante compacto como para ejecutarse en una única RTX 4090 o en un Mac con 32 GB de RAM.

El problema que aborda es el de los agentes de software que necesitan explorar repositorios de código, editar varios ficheros y encadenar llamadas a herramientas de forma autónoma. Según la model card, Devstral Small 1.1 alcanza un 53,6 % en SWE-Bench Verified con el andamiaje de OpenHands, superando en 6,8 puntos a Devstral Small 1.0 y en 11,4 puntos al segundo mejor modelo del estado del arte, lo que lo sitúa como el modelo de código abierto líder en ese benchmark según el autor.

Es relevante ahora porque combina tres factores poco frecuentes a la vez: licencia Apache 2.0 (uso comercial permitido), tamaño apto para despliegue local y soporte del formato de llamada a funciones de Mistral. La ficha de HuggingFace consultada está publicada por el usuario "CollectionStudio", aunque la model card atribuye el desarrollo a Mistral AI y All Hands AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Small-3.1); codificador de vision eliminado, solo texto |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 128.000 tokens |
| Tipos de cuantizacion | safetensors en BF16 como formato base; cuantizaciones GGUF disponibles a traves de llama.cpp y Ollama (los tipos concretos no se detallan en la informacion disponible) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria declarada: mistral-common) |
| Tokenizer | Tekken, vocabulario de 131.000 tokens |
| Tamano del repositorio | 94,3 GB |

## Arquitectura y entrenamiento

Devstral Small 1.1 es un transformer denso obtenido por ajuste fino supervisado a partir de Mistral-Small-3.1 (base de 24B). Antes del ajuste se eliminó el codificador de visión del modelo original, de modo que Devstral es un modelo estrictamente de texto. Conserva la ventana de contexto larga de 128.000 tokens y emplea el tokenizer Tekken con un vocabulario de 131.000 tokens.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La información sí indica que el modelo está especializado en el uso de herramientas para explorar bases de código y editar múltiples ficheros, y que admite el formato de llamada a funciones de Mistral (documentado en mistral-common). Respecto a Devstral Small 1.0, la versión 1.1 mejora el rendimiento en benchmarks, generaliza mejor a otros prompts y entornos de programación distintos de OpenHands, y añade soporte del formato de function calling de Mistral.

## Capacidades

- Generacion de texto y razonamiento general, heredado del modelo base Mistral-Small-3.1.
- Codificacion agentica: exploracion de repositorios, lectura y edicion de multiples ficheros y resolucion de tareas de ingenieria de software.
- Soporte de tool calling / function calling con el formato de herramientas de Mistral.
- Soporte de agentes y razonamiento multi-paso (disenado para funcionar con andamiajes como OpenHands).
- Capacidades multilingues en 24 idiomas, entre ellos espanol, ingles, frances, aleman, portugues, italiano, japones, coreano, ruso, chino, arabe, hindi o vietnamita.
- Contexto largo de hasta 128.000 tokens, util para trabajar con bases de codigo extensas.
- Modelo exclusivamente de texto: no dispone de capacidades de vision (el codificador visual fue eliminado).
- No se documenta en la informacion disponible un modo de razonamiento explicito ("thinking mode") ni capacidades de audio.

## Casos de uso

- Agentes autonomos de ingenieria de software: integrado con OpenHands u otro andamiaje, el modelo puede recibir un issue o tarea y, de forma autonoma, explorar el repositorio, localizar los ficheros relevantes, aplicar cambios y verificar resultados, gracias a su soporte de tool calling y su contexto de 128.000 tokens.
- Resolucion de bugs y parcheo sobre bases de codigo grandes: el contexto largo permite cargar varios ficheros y el historial de conversacion sin truncar, lo que facilita tareas de depuracion que requieren correlacionar codigo disperso.
- Asistente de refactorizacion multi-fichero: puede editar simultaneamente varios ficheros de un proyecto, un escenario en el que los modelos de contexto corto fallan al perder coherencia entre cambios.
- Automatizacion en pipelines de CI/CD: mediante function calling, el modelo puede invocarse como paso de un flujo que ejecuta comandos, lee salidas de tests y propone correcciones, integrándose con herramientas de integracion continua.
- Migracion de codigo entre versiones o frameworks: el modelo puede leer el estado actual del proyecto y generar los cambios necesarios de forma guiada por herramientas, reduciendo trabajo manual repetitivo.
- Despliegue local en estaciones de trabajo de desarrollo: al caber en una unica RTX 4090 o en un Mac con 32 GB de RAM, permite asistencia de codigo sobre repositorios de empresa sin enviar codigo propietario a servicios externos.
- Revision de codigo asistida: puede analizar un conjunto de cambios y generar comentarios estructurados o sugerencias de mejora dentro de un flujo de pull requests.
- Generacion de tests: puede inspeccionar funciones existentes y producir casos de prueba, encadenando la ejecucion mediante herramientas para validarlos.

## Benchmarks y rendimiento

Resultados de SWE-Bench Verified reportados en la model card:

| Modelo | Andamiaje | SWE-Bench Verified (%) |
|---|---|---|
| Devstral Small 1.1 | OpenHands Scaffold | 53,6 |
| Devstral Small 1.0 | OpenHands Scaffold | 46,8 |
| DeepSWE | R2E-Gym Scaffold | 42,2 |
| Claude 3.5 Haiku | Anthropic Scaffold | 40,6 |
| SWE-smith-LM 32B | SWE-agent Scaffold | 40,2 |
| Skywork SWE | OpenHands Scaffold | 38,0 |
| GPT-4.1-mini | OpenAI Scaffold | 23,6 |

La model card afirma que, evaluado bajo el mismo andamiaje (OpenHands) y segun informe el autor, Devstral Small 1.1 supera a modelos mucho mayores como DeepSeek-V3-0324 y Qwen3 232B-A22B. No se han publicado en la informacion disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos orientativos a partir de los 23,57 B de parametros; no confirmados en la model card): en BF16 en torno a 47 GB; en FP8/INT8 en torno a 24 GB; en cuantizacion de 4 bits en torno a 12-14 GB.
- GPU recomendadas: la model card indica que el modelo cabe en una unica RTX 4090; tambien es apto para A100, H100 o similares en despliegues de mayor concurrencia.
- Caben en GPU de consumo: si, la RTX 4090 es citada explicitamente por el autor, y tambien un Mac con 32 GB de RAM unificada.
- Opciones de despliegue soportadas segun la model card: vLLM (recomendado, requiere vLLM >= 0.9.1 y mistral-common >= 1.7.0), mistral-inference, transformers, LMStudio, llama.cpp y Ollama. Tambien se ofrece via API de Mistral integrada en OpenHands.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-Bench Verified (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devstral Small 1.1 | 23,57 B | 128k | 53,6 | Apache 2.0 | Pesos abiertos |
| Devstral Small 1.0 | no disponible | no disponible | 46,8 | no disponible en la informacion | Pesos abiertos |
| DeepSWE | no disponible | no disponible | 42,2 | no disponible en la informacion | no disponible |
| Skywork SWE | no disponible | no disponible | 38,0 | no disponible en la informacion | no disponible |
| SWE-smith-LM 32B | 32 B (segun denominacion) | no disponible | 40,2 | no disponible en la informacion | no disponible |
| GPT-4.1-mini | no disponible | no disponible | 23,6 | Propietaria | API |
| Claude 3.5 Haiku | no disponible | no disponible | 40,6 | Propietaria | API |

La model card menciona ademas que, bajo el andamiaje OpenHands, el modelo supera a DeepSeek-V3-0324 y Qwen3 232B-A22B, aunque no se aportan los valores numericos de estos dos modelos en la informacion disponible.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imagenes, ya que el codificador de vision fue eliminado durante el ajuste.
- Pese a la baja tasa de alucinacion esperable en tareas de codigo, sigue siendo un modelo generativo y puede producir codigo incorrecto o inventar APIs; conviene validar sus salidas con pruebas automatizadas.
- Sesgos conocidos: la model card no documenta analisis de sesgos especificos; como todo modelo entrenado con datos web y de codigo, puede reproducir sesgos presentes en esos datos.
- Rendimiento dependiente del andamiaje: los resultados de SWE-Bench se obtienen con OpenHands; el comportamiento puede variar con otros entornos, aunque la version 1.1 afirma generalizar mejor.
- Cobertura de idiomas: aunque soporta 24 idiomas, la especializacion en codigo y el grueso de los datos de entrenamiento probablemente estan dominados por el ingles; el rendimiento en idiomas minoritarios puede ser inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero la model card incluye un aviso de tratamiento de datos personales y enlaces a la politica de privacidad de Mistral, que conviene revisar en despliegues con datos de usuario.
- Discrepancia de autoria: la ficha de HuggingFace esta publicada por el usuario "CollectionStudio", mientras que la model card atribuye el desarrollo a Mistral AI y All Hands AI; conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- No debe confundirse el modelo de 23,57 B de parametros con su base (Mistral-Small-3.1), que incluye vision; Devstral no la hereda.

## Enlaces

- Ficha de HuggingFace (publicacion consultada): https://huggingface.co/CollectionStudio/Devstral-Small-2507
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Modelo base (variante Base) citado en la model card: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Version anterior Devstral Small 1.0: https://huggingface.co/mistralai/Devstral-Small-2505
- Blog de Mistral AI sobre Devstral: https://mistral.ai/news/devstral-2507
- Mistral AI: https://mistral.ai/
- All Hands AI: https://www.all-hands.dev/
- Repositorio OpenHands: https://github.com/All-Hands-AI/OpenHands/tree/main
- Documentacion de function calling de mistral-common: https://mistralai.github.io/mistral-common/usage/tools/
- Repositorio mistral-common: https://github.com/mistralai/mistral-common
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio mistral-inference: https://github.com/mistralai/mistral-inference
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://github.com/ollama/ollama
- LM Studio: https://lmstudio.ai/
- Politica de privacidad de Mistral: https://mistral.ai/terms/
