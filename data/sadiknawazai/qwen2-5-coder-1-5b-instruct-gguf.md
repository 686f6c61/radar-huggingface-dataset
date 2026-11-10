# SadikNawazAI/Qwen2.5-Coder-1.5B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-1.5B-Instruct-GGUF es una cuantización en formato GGUF (Q4_K_M) del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado originalmente por Alibaba Cloud (equipo Qwen) y republicado por el usuario SadikNawazAI. El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (1,54B) especializado en generación, razonamiento y corrección de código, que además funciona como modelo conversacional general de pequeño tamaño. Esta versión GGUF está empaquetada para su uso directo con Ollama, llama.cpp y otros runtimes compatibles, y coincide con el build que Ollama distribuye como `qwen2.5-coder:1.5b`.

El problema que resuelve es el despliegue de un modelo de código en entornos con recursos limitados: al ocupar 0,92 GiB en Q4_K_M, cabe en CPU, en GPUs de consumo e incluso en dispositivos de borde, manteniendo una ventana de contexto de 32.768 tokens. Es relevante para desarrolladores que necesitan autocompletado, generación de funciones o asistencia de código en local sin depender de APIs externas, y para quienes quieren integrar un modelo pequeño en pipelines de CI/CD o herramientas de desarrollo.

La arquitectura declarada es `qwen2` (transformer decoder-only denso), con 28 capas, dimensión de embedding de 1.536 y vocabulario de 151.936 tokens. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo frente a alternativas con licencias más restrictivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`qwen2`), denso |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (4-bit K-quant mixto); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | Inglés (el modelo base soporta múltiples lenguajes naturales; el repo solo declara `en`); código en más de 90 lenguajes de programación |
| Licencia | Apache 2.0 (Copyright 2024 Alibaba Cloud) |
| Formato de pesos | GGUF (archivo `Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf`, 0,92 GiB / 0,99 GB) |
| Dimension de embedding | 1.536 |
| Numero de capas | 28 |
| Vocabulario | 151.936 tokens |
| Plantilla de chat | Incluida en los metadatos del GGUF |
| SHA-256 del archivo | `29d8c98fa6b098e200069bfb88b9508dc3e85586d20cba59f8dda9a808165104` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de la familia Qwen2, con 28 capas, dimensión de embedding de 1.536 y un vocabulario de 151.936 tokens. Es un modelo instruct, por lo que ha pasado por un proceso de ajuste supervisado y optimización para seguir instrucciones y mantener conversaciones multi-turno. La model card del repo de cuantización no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería a la model card del modelo base original de Alibaba Cloud, que no se incluye en la información proporcionada.

La innovación principal de esta publicación no está en la arquitectura, sino en el empaquetado: una cuantización Q4_K_M que reduce el peso a 0,92 GiB manteniendo la plantilla de chat en los metadatos del GGUF, lo que permite usar el modelo directamente con `ollama run`, `llama-cli --jinja` o `llama-cpp-python` sin pasos adicionales de conversión. No se documentan innovaciones como decodificación especulativa, atención lineal ni modos de razonamiento extendido en la información disponible.

## Capacidades

- Generación de código en más de 90 lenguajes de programación, según declara el autor.
- Razonamiento sobre código y corrección de errores (code fixing).
- Generación de texto y conversación general: el autor indica que funciona bien como modelo de chat pequeño.
- Conversaciones multi-turno con plantilla de chat incluida en los metadatos del GGUF.
- Generación de consultas SQL, funciones, scripts y fragmentos de código a partir de descripciones en lenguaje natural.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el repo declara únicamente inglés; el modelo base Qwen2.5 soporta varios idiomas naturales, pero no se detallan en esta ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Autocompletado y asistencia de código en el IDE: con 32.768 tokens de contexto, el modelo puede recibir el archivo actual y fragmentos relevantes del proyecto para sugerir funciones o completar bloques, ejecutándose en local con llama.cpp u Ollama sin enviar código a servicios externos.
- Generación de código en pipelines de CI/CD: al ocupar menos de 1 GiB en Q4_K_M, puede desplegarse en runners con CPU para tareas como generar plantillas de tests, documentación de funciones o mensajes de commit a partir de diffs.
- Chatbot de soporte técnico para desarrolladores: su naturaleza instruct y su plantilla de chat permiten gestionar conversaciones multi-turno sobre APIs, errores de compilación o dudas de sintaxis, con contexto suficiente para incluir logs y fragmentos de código.
- Generación de consultas SQL y transformación de datos: el modelo puede traducir descripciones en lenguaje natural a SQL, como se muestra en el ejemplo de la model card (encontrar correos duplicados), útil en herramientas internas de análisis.
- Enseñanza y aprendizaje de programación: un modelo de 1,5B ejecutable en portátiles permite ofrecer explicaciones de código y ejercicios en entornos educativos sin infraestructura de GPU dedicada.
- Prototipado rápido en dispositivos de borde: al caber en CPU y en GPUs de consumo, sirve para validar flujos de asistencia de código en entornos sin conectividad o con requisitos de privacidad estrictos.
- Preprocesamiento y revisión de código en lote: puede usarse para tareas masivas como resumir funciones, detectar patrones repetidos o generar descripciones de cambios, aprovechando su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repo de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1,5 GB en Q4_K_M (el archivo pesa 0,92 GiB; hay que sumar el espacio para el contexto KV). Con 32.768 tokens de contexto completo, el consumo de memoria para la caché KV aumenta de forma notable y puede requerir varios GB adicionales según el runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para contextos moderados; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo está claramente sobredimensionado para GPUs de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM; también funciona en CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/SadikNawazAI/Qwen2.5-Coder-1.5B-Instruct-GGUF`), llama.cpp (`llama-cli -hf ... --jinja`), llama-cpp-python, y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct-GGUF (este) | 1,54B | 32.768 | Apache 2.0 | GGUF Q4_K_M | Cuantización comunitaria del modelo de Alibaba; 0,92 GiB |
| Qwen2.5-Coder-1.5B-Instruct (original) | 1,54B | 32.768 | Apache 2.0 | safetensors | Pesos completos en FP16/BF16; requiere conversión para llama.cpp |
| Modelos de código de ~1-2B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación con alternativas de otras familias (por ejemplo, CodeLlama o StarCoder en tamaños similares) no se incluye porque no hay datos verificados en la información proporcionada y no se deben inventar cifras.

## Limitaciones y advertencias

- Es una cuantización Q4_K_M: introduce una pérdida de precisión respecto a los pesos originales en FP16/BF16, que puede manifestarse en tareas de código complejas o en contextos muy largos.
- El repo declara únicamente inglés como idioma; el rendimiento en castellano u otros idiomas naturales no está garantizado por esta ficha.
- Riesgo de alucinación inherente a los modelos de 1,5B: puede generar APIs inexistentes, firmas de funciones incorrectas o código que compila pero no hace lo esperado. Requiere revisión humana en producción.
- Con 1,54B de parámetros, su capacidad de razonamiento multi-paso y de manejar bases de código grandes es limitada frente a modelos de 7B o más.
- La ventana de 32.768 tokens es nominal; el rendimiento efectivo en contextos muy largos puede degradarse y el consumo de memoria de la caché KV crece con el contexto.
- Es una republicación comunitaria (SadikNawazAI) con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de que el archivo coincida con el build oficial de Ollama más allá de lo que declara el autor.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base original de Alibaba Cloud y las obligaciones de atribución.
- No se documentan mitigaciones de sesgos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/SadikNawazAI/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
