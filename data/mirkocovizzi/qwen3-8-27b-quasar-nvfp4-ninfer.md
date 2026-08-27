# MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer

## Resumen

Qwen3.8-27B-QUASAR-NVFP4-NInfer es un artefacto de inferencia nativo para el motor NInfer, construido a partir del checkpoint QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4, una versión con entrenamiento de cuantización consciente (QAT) en formato NVFP4 del modelo Qwen/Qwen3.8-27B de Alibaba. El modelo base es un transformer denso de 27 000 millones de parámetros con capacidades de visión y razonamiento, ventana de contexto nativa de 262 144 tokens y licencia Apache-2.0. Este artefacto empaqueta los pesos NVFP4, el backbone de texto, la torre de visión, el modelo borrador MTP, el tokenizador, la plantilla de chat y los recursos de procesamiento multimedia en un único archivo `.ninfer` de 16,35 GiB.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de 27B con cuantización NVFP4 en GPUs NVIDIA Blackwell de consumo, como la RTX 5090 Laptop de 24 GB, gracias a la optimización del motor NInfer y a la decodificación especulativa MTP. Es una opción para desarrolladores que necesitan desplegar un modelo de razonamiento y visión en un solo GPU sin recurrir a infraestructura multi-GPU, manteniendo la compatibilidad con APIs estilo OpenAI y Anthropic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención completa y Gated DeltaNet (híbrido), más torre de visión |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (códigos E2M1, escalas de bloque E4M3FN, divisores FP32) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (formato propietario del motor NInfer, no compatible con Transformers, GGUF o Safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo denso de visión-lenguaje que combina atención completa con capas Gated DeltaNet, una arquitectura híbrida que reduce el coste de atención para secuencias largas. El checkpoint QUASAR se obtuvo mediante entrenamiento de cuantización consciente (QAT) en NVFP4, lo que permite representar los pesos con 4 bits manteniendo la precisión mediante escalas de bloque y divisores globales. El artefacto NInfer conserva los códigos E2M1 empaquetados, las escalas E4M3FN y los divisores FP32 de las 400 matrices lineales de texto que soporta el motor, fusionando matrices en el límite de consumo para reducir el número de padres almacenados a 256. Las matrices de control de Gated DeltaNet (in_proj_a y in_proj_b) se decodifican a BF16 y se fusionan en un único padre de control, siendo esta la única conversión numérica aplicada a las matrices de texto. Los componentes fijos (vocabulario, etc.) provienen del checkpoint BF16 oficial de Qwen3.8.

## Capacidades

- Generación de texto con y sin modo *thinking* (razonamiento explícito).
- Procesamiento multimodal: imágenes, múltiples imágenes, vídeo y mensajes mixtos de texto e imagen.
- Decodificación especulativa MTP (Multi-Token Prediction) con cabecera de propuesta optimizada.
- Caché KV en BF16 e INT8 con agrupación de 64 canales.
- Decodificación con CUDA Graph y reutilización de prefijos compatibles.
- Servidor con API compatible con OpenAI Responses Core, OpenAI Chat Completions y Anthropic Messages.
- Ejecución mediante CLI de NInfer o servidor concurrente acotado (máximo de peticiones activas fijado en el arranque).

## Casos de uso

- Asistente de chat con razonamiento en local: el modo *thinking* permite respuestas explicadas paso a paso, útil para depuración de código o resolución de problemas matemáticos en entornos sin conexión.
- Análisis de documentos con imágenes: al aceptar imágenes y vídeo, puede extraer información de capturas, diagramas o vídeos cortos en tareas de revisión de informes técnicos.
- Servicio de API interna compatible con OpenAI/Anthropic: el servidor `ninfer-serve` traduce las peticiones a los formatos estándar, facilitando la integración con aplicaciones existentes sin cambiar el cliente.
- Generación de código asistida por visión: el modelo base destaca en tareas de codificación agéntica; con la entrada de capturas de pantalla de errores o diagramas, puede sugerir correcciones contextuales.
- Prototipado de aplicaciones multimodales en hardware de consumo: una RTX 5090 Laptop de 24 GB puede ejecutar el modelo con contexto útil usando KV INT8, permitiendo desarrollar y probar sin acceso a clústeres.
- Despliegue de un asistente de productividad ofimática: el modelo base está optimizado para tareas de oficina (resúmenes, redacción, extracción de datos de tablas en imágenes), y este artefacto lo hace ejecutable en un solo GPU Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- GPU NVIDIA Blackwell con soporte FP4 (por ejemplo, RTX 5090 Laptop de 24 GB o RTX 5090 Desktop de 32 GB).
- CUDA Toolkit 13.1 o superior.
- VRAM: 15,31 GiB para ejecución solo texto; 16,06 GiB con MTP materializado. La memoria de contexto se añade a estas cifras. Con KV INT8, una GPU de 24 GB permite contextos útiles; una de 32 GB ofrece más margen.
- NInfer es un motor de un solo GPU: no admite offload CPU/GPU, multi-GPU, ni servidores distribuidos.
- Despliegue: compilar NInfer desde el commit `93d7a613` del repositorio `MirkoCovizzi/ninfer-rtx5090-laptop` (rama `feat/quasar-nvfp4-converter`), o usar el binario precompilado si está disponible.
- El artefacto se ejecuta mediante la CLI `ninfer` o el servidor `ninfer-serve`; no es compatible con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | VRAM estimada | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | Safetensors BF16 | 27B | 256K | ~54 GB | Apache-2.0 |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 | Checkpoint NVFP4 (Transformers) | 27B | 256K | No disponible | Apache-2.0 |
| MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer | `.ninfer` NVFP4 | 27B | 256K | 15,31 GiB (texto) | Apache-2.0 |

La principal diferencia frente al modelo original es el formato de pesos y la cuantización: el artefacto NInfer reduce el uso de VRAM a menos de un tercio del BF16, a costa de requerir hardware Blackwell y el motor NInfer. Frente al checkpoint QUASAR original, este artefacto añade la integración con el motor de inferencia optimizado, incluyendo MTP y caché KV INT8, pero pierde la portabilidad a otros frameworks.

## Limitaciones y advertencias

- El artefacto solo funciona con NInfer; no es un checkpoint de Transformers, Safetensors, GGUF ni un formato NVFP4 genérico. No se puede cargar con bibliotecas estándar.
- Requiere hardware NVIDIA Blackwell con soporte FP4; no es compatible con GPUs Ampere, Ada Lovelace o anteriores.
- NInfer es de un solo GPU: no hay escalado horizontal, offload a CPU ni ejecución multi-GPU. El número de peticiones activas se fija en el arranque y no se puede cambiar dinámicamente.
- La cuantización NVFP4 puede introducir pérdida de precisión frente a BF16, especialmente en tareas de razonamiento largo o matemáticas complejas. Se recomienda validar la calidad en el dominio de uso.
- No se dispone de información sobre sesgos, alucinaciones o comportamiento en idiomas distintos del inglés. El modelo base Qwen3.8 es multilingüe, pero este artefacto no documenta los idiomas soportados.
- La compilación requiere una versión concreta de NInfer (commit `93d7a613`), lo que puede dificultar la reproducibilidad si el repositorio cambia.
- El artefacto está pensado para un perfil de hardware específico (RTX 5090); su rendimiento en otras GPUs Blackwell no está garantizado.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer
- Checkpoint QUASAR de origen: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio con el perfil QUASAR y commit de referencia: https://github.com/MirkoCovizzi/ninfer-rtx5090-laptop/pull/19
- Documentación de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Guía de Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
