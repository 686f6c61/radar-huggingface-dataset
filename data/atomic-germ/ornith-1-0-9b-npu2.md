# Atomic-Germ/Ornith-1.0-9B-NPU2

## Resumen

Ornith-1.0-9B-NPU2 es una conversión cuantizada del modelo Ornith-1.0-9B, desarrollada por Atomic-Germ para ejecutarse exclusivamente en el motor de inferencia FastFlowLM sobre NPUs AMD Ryzen AI con arquitectura XDNA2. El modelo original, creado por ornith-ai, es un transformer denso de 8.95 mil millones de parámetros orientado a tareas de codificación agéntica y conversación, con una ventana de contexto de 262 144 tokens. Esta versión Q4NX reorganiza los pesos en un formato empaquetado optimizado para las unidades de matriz de la NPU, lo que permite desplegar un modelo de 9B en hardware de consumo con memoria unificada.

La relevancia de esta ficha radica en que representa una de las primeras adaptaciones de un modelo de código abierto a NPUs AMD de última generación, un segmento emergente frente a las GPU tradicionales. Al ser un formato propietario de FastFlowLM, no es compatible con llama.cpp, Ollama ni otras herramientas habituales, por lo que su uso queda restringido a un ecosistema específico. A pesar de ello, ofrece una vía para ejecutar agentes de codificación con contexto largo en portátiles y equipos de sobremesa con Ryzen AI 300.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia de motor qwen3.5) |
| Parametros totales | 8 953 803 264 (8.95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, basado en Q4_1) |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | other (sin especificar) |
| Formato de pesos | Q4NX (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.0-9B es un transformer denso con 32 capas, tamaño oculto de 4096 y dimensión intermedia de 12 288, con un vocabulario de 248 320 tokens. Según la información disponible, está diseñado como un modelo agéntico de codificación, con soporte para tool calling y una ventana de contexto de 262 144 tokens. Los detalles concretos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no están disponibles en esta ficha; la model card del repositorio remite a la card upstream de ornith-ai para esos datos.

La conversión Q4NX realizada por Atomic-Germ no modifica la arquitectura, sino que reempaqueta los pesos en un diseño optimizado para las operaciones de matriz de la NPU XDNA2. El formato Q4NX es una reorganización de la cuantización Q4_1 adaptada a los tamaños de tile y patrones de acceso a memoria del motor NPU. Los kernels de ejecución (xclbins) son cerrados y no se incluyen en el repositorio; el modelo usa la familia de motor `qwen3.5` y es shape-idéntico al modelo oficial `Qwen3.5-9B-NPU2`.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Soporte de tool calling / function calling, orientado a agentes de codificación.
- Ventana de contexto de 262 144 tokens, adecuada para procesar repositorios completos o documentación extensa.
- Capacidades de razonamiento multi-paso, propias de un modelo agéntico.
- Inferencia acelerada por NPU en hardware AMD Ryzen AI XDNA2 (Strix Point o superior).
- Interfaz de servidor compatible con OpenAI (endpoint `/v1/chat/completions`).

## Casos de uso

- Asistente de programación en local: el modelo puede ejecutarse en un portátil con NPU AMD Ryzen AI 300, ofreciendo respuestas de código y explicaciones sin conexión a internet ni dependencia de servicios en la nube.
- Agente de codificación autónomo: gracias a su soporte de tool calling, puede integrarse en flujos de trabajo donde el modelo ejecuta comandos, edita archivos y gestiona tareas de desarrollo de forma autónoma.
- Análisis de repositorios grandes: con 262 144 tokens de contexto, puede ingerir múltiples archivos de un proyecto y responder preguntas sobre arquitectura, dependencias o posibles errores.
- Revisión de código en CI/CD: el modelo puede actuar como revisor automático en pipelines, señalando problemas de estilo, posibles bugs o sugerencias de optimización, siempre que se integre con las herramientas adecuadas.
- Generación de documentación técnica: puede resumir código fuente, generar comentarios y crear guías de uso a partir de un contexto extenso.
- Chat conversacional con memoria larga: su ventana de contexto permite mantener conversaciones prolongadas sin perder información relevante, útil para soporte técnico o tutorías.
- Procesamiento de documentos largos: aunque está especializado en código, puede resumir o extraer información de textos extensos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite a la card upstream de ornith-ai para datos de rendimiento, pero no se proporcionan en esta ficha. No se dispone de cifras de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta conversión específica.

## Requisitos de hardware

- NPU AMD Ryzen AI con arquitectura XDNA2 (NPU2), es decir, procesadores Strix Point o Ryzen AI 300 series o posteriores.
- Aproximadamente 15 GB de memoria unificada del sistema (pesos Q4NX + activaciones + caché KV).
- Linux con el stack XRT NPU instalado.
- FastFlowLM versión 0.9.46 o superior, con el CLI `flm`.
- El archivo `model.q4nx` ocupa 7.11 GB.
- No es compatible con GPU NVIDIA, AMD Radeon tradicionales ni otros aceleradores; requiere específicamente la NPU XDNA2.
- Despliegue mediante el instalador `flm-add` y el comando `flm run` o `flm serve` (este último expone una API OpenAI-compatible en el puerto 8080).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware objetivo |
|---|---|---|---|---|
| Ornith-1.0-9B-NPU2 | 8.95B | 262 144 | Q4NX | NPU AMD XDNA2 |
| Qwen3.5-9B-NPU2 | 9B (aprox.) | 262 144 (según configuración) | Q4NX | NPU AMD XDNA2 |
| Ornith-1.0-9B (original) | 8.95B | 262 144 | safetensors / GGUF | GPU (80GB) o CPU |

No se dispone de datos cuantitativos de rendimiento para establecer una comparativa objetiva en términos de velocidad o calidad. La conversión Q4NX es shape-idéntica a Qwen3.5-9B-NPU2, lo que sugiere que ambos comparten kernels y rendimiento similar en la NPU, pero no hay cifras publicadas. El modelo original en formato GGUF puede ejecutarse en hardware convencional con llama.cpp, pero esta versión Q4NX no es compatible con ese ecosistema.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay evidencia de capacidades multilingües.
- La licencia es "other" y no se especifica si permite uso comercial. Se recomienda revisar la licencia del modelo base antes de cualquier despliegue en producción.
- Los kernels NPU (xclbins) son cerrados y no se distribuyen en este repositorio; el usuario debe obtenerlos por separado, lo que limita la reproducibilidad.
- No es compatible con llama.cpp, Ollama, vLLM ni otras herramientas estándar; solo funciona con FastFlowLM en hardware AMD específico.
- Requiere el stack XRT y una configuración de Linux no trivial; no hay soporte para Windows o macOS.
- No se han publicado benchmarks de rendimiento ni evaluaciones de calidad para esta conversión, por lo que el comportamiento real en tareas de codificación no está verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de codificación puede generar código incorrecto o inseguro si no se supervisa.
- El contexto de 262 144 tokens puede requerir una gestión cuidadosa de la memoria; el uso prolongado podría exceder los 15 GB estimados.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/Atomic-Germ/Ornith-1.0-9B-NPU2)
- [Modelo base ornith-ai/Ornith-1.0-9B](https://huggingface.co/ornith-ai/Ornith-1.0-9B)
- [GitHub de ornith-ai/Ornith-1](https://github.com/ornith-ai/Ornith-1)
- [Landing page de Ornith 1.0 Model 9B](https://ornith.online/ornith-1-0-model-9b)
- [Guía de ejecución local con llama.cpp (Sajith-K-Sasi)](https://github.com/Sajith-K-Sasi/ornith-local-coding)
- [FastFlowLM](https://fastflowlm.com)
