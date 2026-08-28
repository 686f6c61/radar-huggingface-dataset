# DonnyFlo85/llama2_70b_chat_uncensored-GGUF

## Resumen

Este repositorio contiene el modelo Llama 2 70B Chat Uncensored en formato GGUF, una versión cuantizada del fine-tuning realizado por Jarrad Hope sobre el Llama 2 70B Chat de Meta. El modelo original fue entrenado con el dataset Wizard Vicuna 70k Unfiltered, que combina instrucciones de WizardLM y Vicuna sin filtros de moderación, con el objetivo de eliminar las restricciones de contenido propias del modelo base. El resultado es un asistente conversacional que responde sin censura a peticiones que normalmente serían bloqueadas por los mecanismos de seguridad de Llama 2.

La relevancia de esta versión GGUF radica en que permite ejecutar un modelo de 70 mil millones de parámetros en hardware de consumo mediante cuantización, gracias al formato introducido por llama.cpp en agosto de 2023. Aunque el autor del repositorio es DonnyFlo85, la model card corresponde a la cuantización original realizada por TheBloke, y el modelo base es el publicado por Jarrad Hope. La arquitectura es un transformer decoder-only estándar de Llama 2, con 68.976.648.192 parámetros totales y una ventana de contexto que no se especifica en la información disponible, aunque el modelo base Llama 2 utiliza 4096 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 68.976.648.192 (68,98 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K (segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 (licencia de Meta) |
| Formato de pesos | GGUF (safetensors y pytorch en el modelo original) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 2, un transformer decoder-only con normalización RMSNorm, embeddings rotatorios (RoPE) y atención con máscara causal. El modelo original de Jarrad Hope parte del checkpoint Llama 2 70B Chat de Meta y se somete a un fine-tuning supervisado sobre el dataset ehartford/wizard_vicuna_70k_unfiltered, que contiene aproximadamente 70.000 conversaciones de instrucción y respuesta sin filtrar, combinando los estilos de WizardLM y Vicuna. El proceso de "descensura" sigue la metodología descrita por Eric Hartford en su blog, que consiste en entrenar al modelo para que ignore las instrucciones de seguridad del sistema y responda de forma directa a cualquier petición, sin rechazos ni advertencias.

No se dispone de información sobre el número total de tokens de entrenamiento, el uso de técnicas de alineación como RLHF o DPO, ni detalles adicionales sobre el proceso de cuantización más allá de que se utilizó el formato GGUF v2 con los métodos K-quant. La cuantización fue realizada por TheBloke y es compatible con llama.cpp a partir del commit d0cee0d36d5be95a0d9088b674dbb27354107221 (27 de agosto de 2023).

## Capacidades

- Generación de texto conversacional en formato Human/Response, con respuestas directas y sin filtros de moderación.
- Manejo de instrucciones complejas y razonamiento multi-paso, heredado del modelo base Llama 2 70B Chat.
- Capacidad para responder a peticiones que el modelo base rechazaría por razones de seguridad, como contenido controvertido, lenguaje explícito o temas sensibles.
- Soporte de prompts en el formato `### HUMAN: ... ### RESPONSE:`, que es el template definido en la model card.
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Creación de contenido creativo sin restricciones: el modelo puede generar narrativas, diálogos o guiones con temáticas adultas o controvertidas que otros modelos censurarían, útil para escritores y guionistas que necesitan explorar límites.
- Roleplay y simulación de personajes: al no aplicar filtros de seguridad, permite mantener conversaciones inmersivas con personajes ficticios sin interrupciones por contenido inapropiado, ideal para juegos de rol o asistentes de ficción interactiva.
- Investigación sobre alineación y seguridad en IA: sirve como caso de estudio para comparar el comportamiento de modelos censurados y no censurados, analizando sesgos, riesgos y mecanismos de mitigación.
- Desarrollo de asistentes especializados en dominios sensibles: por ejemplo, educación sexual, asesoramiento legal sobre temas tabú o discusión abierta de ideologías políticas, donde la censura del modelo base limitaría la utilidad.
- Pruebas de robustez y evaluación de riesgos: los equipos de seguridad pueden utilizar este modelo para identificar vulnerabilidades en sistemas de moderación y desarrollar contramedidas.
- Generación de código y razonamiento técnico: aunque no es su propósito principal, al estar basado en Llama 2 70B conserva capacidades de programación y matemáticas, útiles en entornos donde se prefiere evitar restricciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estándar para esta variante específica. El modelo base Llama 2 70B Chat obtiene resultados competitivos en dichos benchmarks, pero la cuantización y el fine-tuning sin censura pueden afectar al rendimiento, y no hay datos que lo confirmen.

## Requisitos de hardware

- El tamaño del repositorio es de 521,5 GB, lo que indica que contiene múltiples archivos de cuantización. Para una cuantización Q4_K, el archivo típico de un modelo de 70B ocupa aproximadamente 40 GB, por lo que se requiere al menos esa cantidad de almacenamiento para la versión más ligera.
- Para inferencia con cuantización Q4_K se estima un requisito de VRAM de unos 40-45 GB, lo que supera la capacidad de GPUs de consumo como la RTX 4090 (24 GB). Se necesitan GPUs profesionales como A100 (80 GB), H100 (80 GB) o configuraciones multi-GPU.
- Las cuantizaciones Q2_K y Q3_K pueden reducir el requisito a unos 25-30 GB, lo que podría permitir ejecución en una RTX 4090 con offloading parcial a CPU, aunque con degradación de calidad.
- Para ejecución solo en CPU, se necesitan al menos 64 GB de RAM para la cuantización Q4_K, y el rendimiento será bajo (varios segundos por token).
- Opciones de despliegue compatibles: llama.cpp, text-generation-webui, KoboldCpp, LM Studio, LoLLMS Web UI, Faraday.dev, ctransformers, llama-cpp-python y candle.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Llama 2 70B Chat (Meta) | 68,98 B | 4096 | Llama 2 | safetensors | Chat con moderación estándar |
| Llama 2 70B Chat Uncensored (jarradh) | 68,98 B | no disponible | Llama 2 | pytorch | Chat sin censura, fine-tuning con Wizard Vicuna 70k Unfiltered |
| WizardLM-Uncensored (varios tamaños) | 7B-70B | 4096 | Llama 2 | safetensors | Instrucciones sin censura, basado en WizardLM |
| Este modelo (GGUF) | 68,98 B | no disponible | Llama 2 | GGUF | Versión cuantizada del modelo uncensored de Jarrad Hope |

La principal diferencia frente al Llama 2 70B Chat original es la eliminación de los filtros de moderación, mientras que frente a otros modelos uncensored como WizardLM-Uncensored, este se basa específicamente en el dataset Wizard Vicuna 70k Unfiltered y conserva el prompt template Human/Response. La licencia Llama 2 permite uso comercial con la restricción de que, si el producto tiene más de 700 millones de usuarios mensuales, se requiere una licencia adicional de Meta.

## Limitaciones y advertencias

- El modelo puede generar contenido dañino, ofensivo, ilegal o éticamente problemático al no tener filtros de moderación. Su uso en producción requiere evaluación cuidadosa de riesgos y responsabilidad legal.
- Al estar basado en Llama 2, hereda los sesgos del modelo base, que pueden manifestarse en respuestas sexistas, racistas o discriminatorias, especialmente al no estar mitigados por la alineación.
- La cuantización puede degradar la calidad de las respuestas, especialmente en cuantizaciones bajas como Q2_K o Q3_K, afectando a la coherencia y al razonamiento.
- No se ha confirmado la longitud de contexto; si sigue el estándar de Llama 2, será de 4096 tokens, lo que limita conversaciones largas o documentos extensos.
- La licencia Llama 2 de Meta impone restricciones de uso comercial para productos con más de 700 millones de usuarios mensuales, y exige atribución adecuada.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que puede ser una copia no verificada o reciente. Se recomienda descargar desde el repositorio original de TheBloke para mayor fiabilidad.
- No hay información sobre el idioma de entrenamiento; se asume que es principalmente inglés, dado el dataset utilizado.

## Enlaces

- Repositorio de HuggingFace de este modelo: https://huggingface.co/DonnyFlo85/llama2_70b_chat_uncensored-GGUF
- Modelo original de Jarrad Hope: https://huggingface.co/jarradh/llama2_70b_chat_uncensored
- Repositorio GGUF original de TheBloke: https://huggingface.co/TheBloke/llama2_70b_chat_uncensored-GGUF
- Repositorio GGUF de Llama 2 70B Chat (versión censurada): https://huggingface.co/TheBloke/Llama-2-70B-Chat-GGUF
- Página de Ollama para llama2-uncensored: https://ollama.com/library/llama2-uncensored
- Paper de Llama 2: https://arxiv.org/abs/2305.14314
- Dataset ehartford/wizard_vicuna_70k_unfiltered: https://huggingface.co/datasets/ehartford/wizard_vicuna_70k_unfiltered
