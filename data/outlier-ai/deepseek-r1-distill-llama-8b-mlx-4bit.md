# Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit

## Resumen

DeepSeek-R1-Distill-Llama-8B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo DeepSeek-R1-Distill-Llama-8B, publicada por Outlier-Ai para su ejecución nativa en Apple Silicon (M1, M2, M3, M4). El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Llama, con 8.030.261.248 parámetros totales y entrenado para generar cadenas de razonamiento explícitas (chain-of-thought) antes de emitir la respuesta final.

La relevancia de esta conversión radica en que reduce el peso en disco a aproximadamente 4,5 GB, lo que permite ejecutar un modelo de razonamiento de 8B en Macs con memoria unificada moderada sin conexión a la nube. El repositorio solo altera el formato en disco (safetensors MLX 4-bit, group size 64, simétrico), el tokenizador y la plantilla de chat; los pesos y la licencia se heredan del modelo original de DeepSeek.

Está pensada para desarrolladores que quieran probar razonamiento multi-paso, matemáticas y lógica en local dentro del ecosistema Apple, usando `mlx-lm` 0.31.x o la aplicación Outlier. No incluye datos de benchmarks propios publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), destilado de DeepSeek-R1 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (group size 64, simetrica) |
| Idiomas soportados | en, zh, fr, es, pt, de, ru, ja, ko, ar |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX 4-bit), config.json, tokenizer, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-R1-Distill-Llama-8B, un destilado de DeepSeek-R1 sobre una arquitectura Llama decoder-only de 8B parámetros. La destilación transfiere el comportamiento de razonamiento del modelo R1 (generación de trazas de pensamiento antes de la respuesta) a un modelo denso de menor tamaño. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el destilado.

Esta conversión concreta no reentrena ni modifica los pesos: solo aplica cuantización de 4 bits en formato MLX con group size 64 y cuantización simétrica, y repaqueta los ficheros para que `mlx-lm` 0.31.x pueda cargarlos directamente. La innovación práctica es el soporte nativo de Metal en Apple Silicon, que permite inferencia local sin GPU dedicada.

## Capacidades

- Generación de texto con modo de razonamiento explícito (chain-of-thought / thinking) antes de la respuesta final.
- Razonamiento matemático y resolución de problemas de lógica y word problems.
- Generación y explicación de código.
- Conversación multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Capacidades multilingües declaradas para 10 idiomas: inglés, chino, francés, español, portugués, alemán, ruso, japonés, coreano y árabe.
- Ejecución totalmente offline y on-device en macOS sobre Apple Silicon.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente más allá del razonamiento interno del modo thinking.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de razonamiento local en Mac: ejecutar el modelo con `mlx-lm` para resolver problemas de lógica y matemáticas sin enviar datos a la nube, aprovechando el modo thinking para trazas verificables.
- Prototipado de aplicaciones de IA privadas: integrar el modelo en herramientas internas que procesan datos sensibles en un MacBook o Mac mini, ya que toda la inferencia ocurre en el dispositivo.
- Tutoría educativa de matemáticas y lógica: usar los ejemplos de widget (problemas de máquinas y widgets, rejillas de lógica, problemas de trenes) como base para un asistente que explica el razonamiento paso a paso.
- Evaluación de modelos de razonamiento en edge: comparar el comportamiento del destilado de 8B en 4 bits frente a versiones de mayor precisión o mayor tamaño en el mismo hardware Apple.
- Generación de código asistida en local: usar el modelo dentro de editores o scripts en macOS para autocompletado y explicación de fragmentos, sin dependencia de API.
- Desarrollo y pruebas de pipelines MLX: servir como modelo de referencia para validar integraciones con `mlx-lm` antes de desplegar conversiones mayores (Qwen-14B, Qwen-32B) del mismo autor.
- Chat multilingüe offline: atender consultas en español, francés, alemán, japonés u otros idiomas declarados en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tokens por segundo en Macs de la serie M, pero esos datos no están incluidos en la información proporcionada y no se reproducen aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 4,5 GB en disco en 4-bit; se recomienda al menos 8 GB de memoria unificada para cargar el modelo con margen para el contexto y el sistema.
- Hardware objetivo: Apple Silicon exclusivamente (M1, M2, M3, M4), incluyendo MacBook Air, MacBook Pro, Mac mini y Mac Studio.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable; el formato MLX está pensado para Metal en Apple Silicon.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente; no está pensado para GPUs NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI `python -m mlx_lm.generate` o API Python `load`/`generate`), y la aplicación Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B-MLX-4bit (este) | 8,03B | no disponible | MLX 4-bit safetensors | MIT | Conversion para Apple Silicon |
| DeepSeek-R1-Distill-Qwen-7B-MLX-4bit (Outlier-Ai) | ~7B | no disponible | MLX 4-bit safetensors | no disponible en la información | Alternativa algo menor, misma familia de destilados R1 |
| DeepSeek-R1-Distill-Qwen-14B-MLX-4bit (Outlier-Ai) | ~14B | no disponible | MLX 4-bit safetensors | no disponible en la información | Mayor capacidad, requiere más memoria unificada |
| DeepSeek-R1-Distill-Qwen-32B-MLX-4bit (Outlier-Ai) | ~32B | no disponible | MLX 4-bit safetensors | no disponible en la información | Máxima capacidad de la familia, solo para Macs con mucha memoria |

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda todos los sesgos y limitaciones del DeepSeek-R1-Distill-Llama-8B original.
- La cuantización a 4 bits puede degradar la calidad del razonamiento frente a los pesos originales en precisión completa; no se han publicado métricas de esa pérdida en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios factuales y en cadenas de razonamiento largas.
- Longitud de contexto no documentada en la información proporcionada; conviene verificarla en `config.json` antes de diseñar flujos con contextos largos.
- El soporte multilingüe está declarado por etiquetas, pero no hay evaluación publicada de calidad por idioma en esta conversión.
- Licencia MIT heredada del modelo base; aun así, conviene revisar la model card canónica de DeepSeek para cualquier restricción adicional de uso.
- Exclusivo para Apple Silicon: no es desplegable en GPUs NVIDIA, AMD ni en servidores x86 convencionales sin reconvertir el formato.
- La model card indica que las cifras internas no son pruebas de release oficiales del autor; no deben citarse como benchmarks validados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Aplicación Outlier: https://outlier.host/
- Benchmarks de Outlier: https://outlier.host/benchmarks
- Conversión DeepSeek-R1-Distill-Qwen-7B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Conversión DeepSeek-R1-Distill-Qwen-14B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit
- Conversión DeepSeek-R1-Distill-Qwen-32B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit
- Outlier-Core-27B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
