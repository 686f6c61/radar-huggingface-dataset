# prithivMLmods/Phai-A1-35B-1M-MTP-Repacked

## Resumen

Phai-A1-35B-1M-MTP-Repacked es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 35.951.822.704 parámetros totales, desarrollado por PhaiModelLab y empaquetado en este repositorio por prithivMLmods. Se construye sobre Qwen3.6-35B-A3B (35B totales, 3B activos) y está especializado en programación y flujos de trabajo agénticos. El post-entrenamiento se realizó íntegramente sobre NPUs Huawei Ascend, combinando Supervised Fine-Tuning (SFT) y Group Relative Policy Optimization (GRPO) sobre 4.000 entornos sandbox reales, con retroalimentación basada en ejecución de código, tests unitarios e interacciones con herramientas.

La característica diferencial de este repositorio es el "repacking" con Multi-Token Prediction (MTP): los pesos incluyen cabeceras adicionales que predicen varios tokens futuros en una sola pasada, lo que integra decodificación especulativa directamente en el modelo sin necesidad de un modelo draft separado. Además, soporta una ventana de contexto de hasta 1 millón de tokens mediante escalado RoPE YaRN (factor=4), lo que habilita comprensión de repositorios completos y planificación de tareas de largo horizonte.

El modelo se distribuye en formato Transformers BF16 (12 shards safetensors) y en GGUF con cuantizaciones que van de MXFP4_MOE (20,3 GB) a Q8_0 (37,8 GB), incluyendo un proyector multimodal mmproj en BF16. Soporta seis idiomas (en, zh, ja, ar, ru, de) bajo licencia Apache 2.0, lo que lo hace relevante para despliegues comerciales que requieran contexto extremo y capacidades de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.6-35B-A3B, transformer con Multi-Token Prediction (MTP) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (según model card del modelo base Qwen3.6-35B-A3B) |
| Longitud de contexto | Hasta 1.000.000 tokens (YaRN factor=4) |
| Tipos de cuantizacion | BF16 (safetensors), MXFP4_MOE, Q4_K_M, Q5_K_M, Q5_K_S, Q8_0 (GGUF) |
| Idiomas soportados | zh, en, ja, ar, ru, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (12 shards), GGUF, mmproj-bf16 (proyector multimodal) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 35B parámetros totales y 3B activos por token, heredado de Qwen3.6-35B-A3B. Incorpora Multi-Token Prediction (MTP), una extensión que añade cabeceras de salida para predecir múltiples tokens futuros en un único forward pass; esto permite decodificación especulativa integrada en los pesos, eliminando la necesidad de un modelo draft externo y acelerando la inferencia local. El contexto de 1M tokens se logra mediante escalado RoPE YaRN con factor 4.

El post-entrenamiento se ejecutó íntegramente en NPUs Huawei Ascend mediante SFT y GRPO sobre 4.000 entornos sandbox reales. La retroalimentación proviene de la ejecución efectiva de código, tests unitarios e interacciones con herramientas, lo que orienta el modelo hacia razonamiento multi-paso, depuración y tool calling. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de programación.
- Generación y depuración de código con retroalimentación basada en ejecución (tests unitarios, sandbox).
- Tool calling y function calling para integración con herramientas externas.
- Flujos agénticos y planificación de tareas de largo horizonte (long-horizon task planning).
- Comprensión de código a escala de repositorio gracias al contexto de hasta 1M tokens.
- Capacidades multimodales imagen-texto (pipeline image-text-to-text, proyector mmproj-bf16).
- Soporte multilingüe en seis idiomas: inglés, chino, japonés, árabe, ruso y alemán.
- Decodificación especulativa nativa mediante MTP (aceleración de inferencia sin draft model).
- Compatible con endpoints y despliegue en text-generation-inference y llama.cpp (llama-cli).

## Casos de uso

- Comprensión de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir un repositorio entero y responder preguntas sobre arquitectura, dependencias y flujos de datos sin fragmentar el código en trozos.
- Agente de resolución de incidencias (estilo SWE-Bench): el entrenamiento con GRPO en sandboxes y feedback de tests lo hace adecuado para localizar bugs, proponer parches y validarlos ejecutando la suite de pruebas.
- Automatización de CI/CD: integrado vía tool calling, puede analizar fallos de build, inspeccionar logs y sugerir correcciones dentro de un pipeline.
- Asistente de programación en IDE con contexto largo: al retener el contexto de múltiples archivos y turnos de conversación, mantiene coherencia en sesiones de refactorización prolongadas.
- Agentes multi-paso con herramientas: planificación y ejecución de tareas que requieren llamadas encadenadas a APIs, lectura de documentación y verificación de resultados.
- Atención al cliente técnica multilingüe: cubre consultas en inglés, chino, japonés, árabe, ruso y alemán con contexto conversacional extenso.
- Análisis de documentación técnica con imágenes: el proyector multimodal permite procesar diagramas y capturas junto a texto en tareas de soporte o revisión de código.

## Benchmarks y rendimiento

La model card menciona resultados en SWE-Bench, TAU3-Bench e IFBench, pero no se proporcionan cifras numéricas en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 72 GB solo para pesos (35,95B × 2 bytes), más overhead de contexto; requiere múltiples GPU o GPU de 80 GB con cuantización.
- GGUF MXFP4_MOE: 20,3 GB, optimizado para NVIDIA Blackwell (RTX Pro 6000, RTX 50-series, B200, B300) con Tensor Cores FP4.
- GGUF Q4_K_M: 21,7 GB, opción recomendada por equilibrio tamaño/calidad; cabe en GPU consumer de 24 GB (RTX 4090, RTX 3090) con margen limitado para contexto.
- GGUF Q5_K_M: 25,3 GB y Q5_K_S: 24,6 GB; requieren 32 GB de VRAM o descarga parcial a CPU.
- GGUF Q8_0: 37,8 GB; requiere GPU de 48 GB o superior (A6000, A100 40/80 GB).
- Proyector multimodal mmproj-bf16: 903 MB adicionales para capacidades de visión.
- Despliegue: text-generation-inference, llama.cpp (llama-cli), endpoints compatibles; transformers para BF16.
- Latencia y throughput: no disponibles en la información proporcionada; MTP debería reducir la latencia por token frente a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Phai-A1-35B-1M-MTP-Repacked | 35,95B / 3B | 1M (YaRN) | Apache 2.0 | MTP integrado, multimodal, 6 idiomas |
| Qwen3.6-35B-A3B (modelo base) | 35B / 3B | no disponible en la información | no disponible en la información | Base sobre la que se post-entrena Phai-A1 |
| Phai-A1-35B-1M (modelo base directo) | 35B / 3B | 1M | Apache 2.0 | Sin repacking MTP ni GGUF en este repo |

No se dispone de datos de benchmarks comparativos numéricos en la información proporcionada para contrastar rendimiento frente a alternativas.

## Limitaciones y advertencias

- No se han publicado métricas de sesgo en la información disponible; el modelo hereda los sesgos de su base Qwen3.6 y de los datos de post-entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de código donde puede generar APIs o funciones inexistentes; se recomienda validación por ejecución.
- El contexto de 1M tokens depende de YaRN (factor=4); el rendimiento en ventanas muy largas puede degradarse respecto a contextos nativos y no se documentan evaluaciones específicas.
- El soporte idiomático se limita a seis idiomas (en, zh, ja, ar, ru, de); el español no figura entre los idiomas declarados.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B antes de uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un artefacto reciente (creado el 2026-11-20) sin validación comunitaria extensa.
- El tamaño del repo (202,5 GB) incluye todas las variantes de cuantización; descargar solo los archivos necesarios.
- El rendimiento de MXFP4_MOE está ligado a hardware Blackwell; en GPUs anteriores se pierde la aceleración FP4 nativa.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-MTP-Repacked
- GGUF: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-MTP-Repacked/tree/main/GGUF
- Modelo base: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
- Perfil del autor del repacking: https://huggingface.co/prithivMLmods
