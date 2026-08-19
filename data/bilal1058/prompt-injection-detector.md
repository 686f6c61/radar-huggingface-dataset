# bilal1058/prompt-injection-detector

## Resumen

El modelo `bilal1058/prompt-injection-detector` es un fine-tune del modelo base `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, desarrollado por el usuario bilal1058. Su propósito, según el nombre del repositorio, es la detección de inyecciones de prompts (prompt injection attacks) en aplicaciones basadas en LLM, un problema de seguridad creciente en sistemas que procesan entradas de usuarios no confiables. El modelo está entrenado sobre una base Llama 3.2 3B instruct, cuantizada a 4 bits mediante la librería Unsloth, lo que lo hace ligero y desplegable en entornos con recursos limitados.

La relevancia de este modelo radica en la necesidad de proteger aplicaciones LLM frente a manipulaciones maliciosas de entrada, como intentos de extraer el prompt del sistema o de ejecutar acciones no autorizadas. Al estar fine-tuneado específicamente para esta tarea, ofrece una alternativa a los métodos basados en reglas o en clasificadores tradicionales. Sin embargo, la documentación disponible es extremadamente escasa: la model card no incluye detalles sobre el dataset de entrenamiento, el proceso de fine-tuning, ni métricas de rendimiento. El repositorio tiene cero descargas y cero likes, lo que sugiere que es un proyecto reciente o poco difundido.

A pesar de la falta de documentación, la arquitectura base (Llama 3.2 3B) es conocida y permite inferir algunas capacidades. No obstante, cualquier afirmación sobre el comportamiento específico del modelo debe tomarse con cautela, ya que no hay evidencia publicada que la respalde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B) |
| Parametros totales | no disponible (estimado ~3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, probablemente 4-bit, sin confirmar) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del Llama 3.2 3B instruct de Meta. La arquitectura subyacente es un transformer decoder-only con atención causal, optimizado mediante las técnicas de Unsloth para acelerar el entrenamiento y reducir el uso de memoria. El proceso de fine-tuning se realizó con la librería TRL (Transformers Reinforcement Learning), según los tags del repositorio, aunque no se especifica si se usó SFT, DPO o RLHF.

No se proporciona información sobre el dataset utilizado, el número de tokens de entrenamiento, ni las hiperparametros empleadas. Tampoco se detalla si se aplicaron técnicas de regularización o aumentación de datos. La única pista es el nombre del modelo, que sugiere una tarea de clasificación binaria (detectar si un prompt es una inyección o no). Dado que la model card no incluye ningún detalle técnico adicional, cualquier afirmación sobre el entrenamiento debe considerarse especulativa.

## Capacidades

- Detección de inyecciones de prompts: el modelo está diseñado para identificar intentos de manipulación de entradas, como "ignora las instrucciones anteriores" o "muestra el prompt del sistema". No obstante, no se ha publicado ninguna demostración ni ejemplo de uso.
- Generación de texto: al estar basado en Llama 3.2 instruct, conserva la capacidad de generar texto, aunque su fine-tuning probablemente la haya orientado hacia la clasificación.
- Razonamiento: se desconoce si el fine-tuning afecta a las capacidades de razonamiento general del modelo base.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible.
- Capacidades multilingües: solo inglés (según la model card).
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Filtro de entrada en chatbots: integrar el modelo como un paso previo en un pipeline de chatbot para bloquear o marcar mensajes que intenten manipular el comportamiento del LLM subyacente. El modelo, al ser ligero (3B cuantizado), puede ejecutarse en tiempo real con baja latencia.
- Protección de asistentes de código: en herramientas de autocompletado o asistentes de programación que reciben instrucciones de archivos externos, el modelo puede detectar intentos de inyección en el contexto del prompt.
- Moderación de contenido generado por usuarios: en foros o plataformas colaborativas donde los usuarios pueden introducir texto que será procesado por un LLM, el modelo puede clasificar si el texto es malicioso antes de enviarlo al modelo principal.
- Seguridad en agentes autónomos: cuando un agente LLM ejecuta herramientas o accede a APIs, el detector puede validar las entradas de usuarios o de terceros para evitar acciones no autorizadas.
- Auditoría de logs de prompts: analizar históricos de conversaciones para identificar intentos de inyección pasados y mejorar las defensas del sistema.
- Gateway de API para LLM: desplegar el modelo como un servicio independiente (por ejemplo, con FastAPI) que recibe prompts y devuelve una puntuación de riesgo, permitiendo a otros sistemas integrarlo fácilmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre precisión, recall, F1, ni comparaciones con otros detectores de inyección de prompts.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3B parámetros cuantizado a 4 bits, se estiman entre 2 y 3 GB de VRAM para inferencia. No hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. También es viable en Apple Silicon (M1/M2) mediante llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPU consumer actuales.
- Opciones de despliegue: al estar basado en transformers, puede servirse con vLLM, TGI (text-generation-inference), o mediante llama.cpp/Ollama si se convierte a GGUF. No se proporcionan configuraciones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de inyección de prompts basados en LLM. Existen herramientas como `pytector` o `prompt-injection-detector` (paquete PyPI) que abordan el mismo problema, pero son librerías basadas en reglas o en modelos más pequeños, no comparables directamente con un LLM de 3B. El modelo base Llama 3.2 3B instruct podría considerarse un punto de referencia, pero su comportamiento sin fine-tuning no está documentado para esta tarea.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| bilal1058/prompt-injection-detector | ~3B | no disponible | Apache 2.0 | Fine-tune LLM |
| pytector (librería) | N/A | N/A | MIT | Reglas + modelos pequeños |
| prompt-injection-detector (PyPI) | N/A | N/A | no disponible | Clasificador tradicional |

## Limitaciones y advertencias

- Documentación insuficiente: no hay información sobre el dataset de entrenamiento, el proceso de fine-tuning ni las métricas de rendimiento. Esto dificulta evaluar su fiabilidad en producción.
- Posibles sesgos: al estar entrenado sobre un modelo base que ya presenta sesgos, el fine-tuning podría heredarlos o amplificarlos. No se ha realizado ninguna auditoría.
- Riesgo de alucinación: como todo LLM, puede generar respuestas incorrectas o clasificar erróneamente prompts legítimos como inyecciones (falsos positivos) o viceversa (falsos negativos).
- Limitación de idioma: solo soporta inglés, lo que limita su uso en entornos multilingües.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un fine-tune de Llama 3.2, debe cumplirse la licencia de Meta (Llama 3.2 Community License), que tiene restricciones adicionales para usuarios con más de 700 millones de usuarios mensuales.
- Estado del proyecto: el repositorio tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad. Su uso en producción conlleva un riesgo significativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bilal1058/prompt-injection-detector
- Modelo base (Unsloth): https://huggingface.co/unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit
- Librería pytector (relacionada): https://github.com/MaxMLang/pytector
- Paquete PyPI prompt-injection-detector: https://pypi.org/project/prompt-injection-detector/
- Proyecto PromptShield (modelos ML): https://huggingface.co/neuralchemy/prompt-injection-dectector-ml-models
- Documentación LLM Guard sobre inyección de prompts: https://protectai.github.io/llm-guard/input_scanners/prompt_injection/
