# junwoo77/jungpt1.1beta

## Resumen

JUNGPT 1.1 Beta es un modelo de lenguaje conversacional desarrollado por el usuario junwoo77, diseñado específicamente para el coreano. Se trata de un fine-tuning del modelo base Kanana-2-3B-Instruct mediante técnicas LoRA y SFT, lo que lo convierte en una alternativa ligera y ejecutable localmente para tareas de diálogo y asistencia en ese idioma.

El modelo se distribuye en formato GGUF cuantizado a Q4_K_M, con un tamaño de archivo de aproximadamente 2,1 GB y un total de 3.508.972.032 parámetros. Su estado es beta, lo que indica que aún no ha alcanzado una madurez completa, pero ofrece capacidades básicas de conversación, respuesta a preguntas generales y soporte para consultas de programación.

Su relevancia radica en la posibilidad de desplegarlo en entornos locales con recursos limitados, gracias a su pequeño tamaño y compatibilidad con Ollama y llama.cpp. No se dispone de información pública sobre licencia, idiomas adicionales o resultados de benchmarks, lo que limita una evaluación exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Kanana-2-3B-Instruct) |
| Parametros totales | 3.508.972.032 (3,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el Modelfile de ejemplo sugiere num_ctx 8192, pero no se confirma la longitud nativa) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Coreano (principal, segun la model card) |
| Licencia | no disponible (el modelo relacionado junGPT usa apache-2.0, pero no se especifica para esta version) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

JUNGPT 1.1 Beta parte del modelo base Kanana-2-3B-Instruct, un transformer de 3.000 millones de parametros preentrenado para instrucciones. El fine-tuning se realizo mediante LoRA (Low-Rank Adaptation) y SFT (Supervised Fine-Tuning), lo que permite adaptar el modelo a tareas conversacionales en coreano sin modificar todos los pesos originales. No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO.

El modelo se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M, lo que reduce significativamente el requisito de memoria y facilita su ejecucion en hardware modesto. No hay informacion sobre innovaciones tecnicas especificas mas alla del enfoque de fine-tuning.

## Capacidades

- Conversacion en coreano: disenado para mantener dialogos cotidianos en este idioma.
- Respuesta a preguntas generales: capaz de abordar consultas de conocimiento comun.
- Soporte basico de codificacion: puede responder preguntas relacionadas con desarrollo y programacion.
- Ejecucion local: compatible con entornos GGUF como Ollama y llama.cpp, permitiendo uso sin conexion.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente personal en coreano: un usuario puede desplegarlo localmente para obtener respuestas a preguntas cotidianas, recordatorios o informacion general, aprovechando su bajo consumo de recursos.
- Chatbot para comunidades coreanas: integrable en aplicaciones de mensajeria o foros para moderar o responder consultas frecuentes en coreano.
- Soporte de codigo para desarrolladores coreanos: puede ayudar con dudas de sintaxis, depuracion o explicaciones de conceptos de programacion, aunque sin garantias de precision avanzada.
- Prototipado rapido de aplicaciones conversacionales: al ser un modelo pequeno, permite iterar rapidamente en entornos de desarrollo sin necesidad de GPUs de alto rendimiento.
- Educacion y practica de idioma: puede usarse como herramienta de conversacion para estudiantes de coreano, aunque su calidad no esta validada.
- Entornos con privacidad estricta: al ejecutarse localmente, evita enviar datos a servicios en la nube, adecuado para organizaciones que manejan informacion sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M y 3,5B parametros, el archivo pesa ~2,1 GB, por lo que se puede ejecutar en GPUs con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) o incluso en CPU con suficiente RAM (8 GB recomendados).
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA o Apple Silicon; para inferencia rapida se sugiere RTX 3060 o superior.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: Ollama (creando un Modelfile), llama.cpp, o cualquier servidor compatible con GGUF.
- Latencia y throughput: no disponibles, pero al ser un modelo de 3B, se espera una generacion de varios tokens por segundo en hardware consumer.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de tamano similar (como Llama-3.2-3B, Phi-3-mini o Qwen2.5-3B). No hay datos de rendimiento ni de licencia para JUNGPT 1.1 Beta, por lo que no es posible realizar una comparacion objetiva.

## Limitaciones y advertencias

- Estado beta: el modelo no ha sido probado exhaustivamente y puede presentar errores o respuestas incoherentes.
- Enfoque exclusivo en coreano: no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Licencia no definida: no se especifica la licencia de uso, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad frente a otros modelos.
- Limitaciones de contexto: la longitud de contexto nativa no esta documentada, aunque el ejemplo de Ollama sugiere 8192 tokens, podria ser menor en la practica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junwoo77/jungpt1.1beta
- Perfil del autor: https://huggingface.co/junwoo77
- Modelo relacionado junGPT: https://huggingface.co/junwoo77/junGPT
