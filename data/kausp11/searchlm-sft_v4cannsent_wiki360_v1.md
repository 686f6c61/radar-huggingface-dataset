# Kausp11/searchlm-sft_v4cannsent_wiki360_v1

## Resumen

Search-LLM Wikipedia 360M (SFT) es un modelo de generación de texto desarrollado por el usuario Kausp11 y publicado en Hugging Face bajo el identificador `Kausp11/searchlm-sft_v4cannsent_wiki360_v1`. Se trata de un modelo de aproximadamente 362 millones de parámetros basado en la arquitectura Llama, entrenado previamente con una estrategia de preentrenamiento habilitado para búsqueda ("search-enabled pretraining") y posteriormente ajustado mediante fine-tuning supervisado (SFT) sobre datos de conversación, tool calling y bloques de búsqueda.

El problema que aborda es la creación de modelos de lenguaje pequeños capaces de integrar resultados de búsqueda y llamadas a herramientas en sus conversaciones, un enfoque relevante para aplicaciones ligeras que necesitan capacidades de recuperación de información sin depender de modelos de gran tamaño. El SFT combina el dataset SmolTalk (chat y habilidades), SmolTalk2 (tool calling) y conversaciones SmolTalk con bloques de búsqueda procedentes del pipeline de anotación del preentrenamiento, colocados al inicio de la frase.

Es relevante ahora porque forma parte de la tendencia de modelos compactos y eficientes, con un tamaño de repo de apenas 0,7 GB, lo que lo hace accesible para hardware modesto. Fue publicado el 26 de octubre de 2026 y procede del checkpoint `search-lm/ckpts/sft_v4cannsent_wiki360_v1` del clúster RCP, incluyendo únicamente pesos y tokenizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 361.824.960 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Llama, una familia de transformadores decodificador-only muy extendida en el ecosistema open source, con una base de aproximadamente 362 millones de parámetros. Según la model card, el checkpoint base procede de un preentrenamiento denominado `wiki6m_v2/search/ep4`, entrenado durante 4 épocas con una estrategia de "search-enabled pretraining", es decir, un preentrenamiento en el que el modelo aprende con bloques de búsqueda integrados en el texto.

El ajuste supervisado (SFT) se realizó durante 1 época sobre una mezcla de datos compuesta por: SmolTalk (conversación y habilidades), SmolTalk2 (tool calling) y conversaciones SmolTalk con bloques de búsqueda generados por el pipeline de anotación del preentrenamiento, insertados al inicio de la frase. El formato de chat empleado es `User: ...\n\nAssistant: ...`, un formato simple sin plantilla de chat compleja. No hay información disponible sobre el número total de tokens, el uso de RLHF o DPO, ni otras innovaciones técnicas concretas del entrenamiento.

## Capacidades

- Generacion de texto conversacional en formato `User: .../Assistant: ...` gracias al SFT sobre SmolTalk.
- Tool calling (llamada a funciones) entrenado con el dataset SmolTalk2.
- Integracion de bloques de busqueda en las respuestas: el modelo fue entrenado con conversaciones que incluyen resultados de busqueda, lo que sugiere compatibilidad con flujos de tipo RAG o search-augmented generation.
- Razonamiento, codigo, matematicas y capacidades multilingues: no disponible, sin datos publicados.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el pipeline es text-generation puro.

## Casos de uso

- Chatbots ligeros: el SFT sobre SmolTalk permite desplegar asistentes conversacionales en hardware modesto, dado que el modelo completo ocupa unos 0,7 GB y puede ejecutarse incluso en portatiles sin GPU dedicada.
- Asistentes con busqueda aumentada: al haber sido entrenado con bloques de busqueda al inicio de la frase, puede integrarse en pipelines RAG donde los resultados de un buscador se insertan en el contexto antes de generar la respuesta.
- Agentes con tool calling: el entrenamiento con SmolTalk2 lo hace adecuado para agentes que necesitan invocar funciones (calculadoras, APIs, consultas a bases de datos) en flujos de varios pasos.
- Prototipado rapido de aplicaciones LLM: su tamano reducido y licencia Apache 2.0 permiten iterar en local sin costes de API antes de escalar a modelos mayores.
- Investigacion en preentrenamiento con busqueda: al ser un modelo experimental de la linea "search-enabled pretraining", sirve como base de estudio para investigadores que analizan como el preentrenamiento con resultados de busqueda afecta al comportamiento del modelo.
- Generacion de texto embebida en aplicaciones edge: su huella pequena lo hace viable para despliegues en dispositivos con recursos limitados donde no caben modelos de 7B o mas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 362 millones de parametros en fp16, el modelo ocupa unos 0,7 GB de pesos; con overhead de KV cache y activaciones, entre 1 y 2 GB de VRAM son suficientes para contextos moderados. En CPU, la inferencia es viable con RAM de 2-4 GB.
- GPU recomendadas: cualquier GPU moderna; no se requiere hardware de datacenter. Una RTX 3060, RTX 4060 o superior lo ejecuta con holgura.
- Consumer GPUs: cabe comodamente en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en GPUs integradas via CPU.
- Opciones de despliegue: Transformers (libreria nativa indicada en la model card, `endpoints_compatible` en Hugging Face Inference Endpoints); al estar en safetensors con arquitectura Llama, es probablemente compatible con llama.cpp y Ollama mediante conversion a GGUF, aunque no hay conversiones publicadas.
- Latencia y throughput estimados: no disponible; dada la escala de 362M, se espera latencia baja y throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia |
|---|---|---|---|---|
| Search-LLM wiki360 SFT (este modelo) | 361,8M | no disponible | Si (entrenado con SmolTalk2) | Apache 2.0 |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Si | Apache 2.0 (algunos variantes con otras licencias) |
| SmolLM2-360M-Instruct | 361M | 8.192 tokens | Limitado | Apache 2.0 |
| Llama 3.2-1B-Instruct | 1.240M | 128.000 tokens | Si | Llama Community License |

Frente a SmolLM2-360M-Instruct, de tamano casi identico, este modelo destaca por su entrenamiento explicito con bloques de busqueda, aunque carece de benchmarks publicados y de la madurez de un modelo respaldado por Hugging Face. Frente a Qwen2.5-0.5B-Instruct, es mas ligero pero con menos documentacion y sin longitud de contexto publicada. Frente a Llama 3.2-1B, es unas 3 veces mas pequeno y con licencia mas permisiva, a costa presumiblemente de capacidad general.

## Limitaciones y advertencias

- No hay model card detallada: faltan datos de contexto, idiomas, benchmarks y plantilla de chat formal, lo que complica su uso en produccion sin pruebas previas.
- Riesgo de alucinacion elevado al tratarse de un modelo de 362M entrenado sobre datos limitados (base wiki6m y 1 epoca de SFT); los bloques de busqueda integrados en el entrenamiento no garantizan veracidad factual.
- Idiomas no especificados: la base "wiki6m" sugiere entrenamiento sobre Wikipedia, posiblemente en un solo idioma o en un subconjunto no documentado; el rendimiento en castellano es incierto.
- Formato de chat simple (`User:/Assistant:`) sin plantilla estandar: puede requerir ajustes manuales del prompt para obtener buenos resultados en librerias de inferencia.
- Sesgos: no documentados; al derivar de Wikipedia y datasets SmolTalk, heredara los sesgos de esos corpus.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion sin restricciones relevantes, mas alla de la atribucion estandar.
- Advertencia general: el modelo procede de un usuario individual con muy poca traccion (241 descargas, 0 likes), por lo que carece de auditoria comunitaria; se recomienda evaluacion exhaustiva antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Kausp11/searchlm-sft_v4cannsent_wiki360_v1
- Paper, repositorio de codigo o demo: no disponible en la informacion proporcionada.
