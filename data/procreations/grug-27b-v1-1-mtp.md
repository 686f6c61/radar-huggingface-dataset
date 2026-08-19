# ProCreations/grug-27b-v1.1-mtp

## Resumen

grug-27b-v1.1-mtp es una variante del modelo grug-27b-v1.1, desarrollado por ProCreations, que incorpora una cabeza de predicción multi-token (MTP) afinada para acelerar la decodificación especulativa. El modelo base es un fine-tune LoRA fusionado sobre Qwen3.6-27B, especializado en razonamiento denso y eficiente sin texto de relleno. Esta versión mantiene exactamente los mismos pesos y puntuaciones que grug-27b-v1.1, pero añade un módulo `mtp.*` de 425 millones de parámetros que predice el token t+2, permitiendo que motores compatibles (vLLM, sglang) verifiquen varios tokens en una sola pasada.

La relevancia de este modelo radica en que aborda uno de los cuellos de botella de los LLM grandes: la latencia de generación. Al afinar la cabeza MTP nativa de Qwen sobre la distribución real de salidas de grug, se logra un acuerdo del 95,37% con el verificador (frente al 90,04% de la cabeza nativa), lo que reduce la tasa de desacuerdo de 1 de cada 10 a 1 de cada 21 tokens. El modelo está disponible bajo licencia Apache 2.0, con pesos en safetensors y versiones GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.6-27B, fine-tune LoRA fusionado) |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varias, ver repositorio GGUF); safetensors en bf16 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.6-27B, un transformer denso con atención de múltiples cabezas y mecanismos de razonamiento explícito (modo thinking). Sobre esta base, ProCreations aplicó un fine-tune LoRA de rango 32 en todas las capas lineales, fusionado en bf16, para crear grug-27b-v1.1. Esta variante MTP añade una cabeza de predicción multi-token (MTP) de 425 millones de parámetros, que se entrena con el backbone completamente congelado.

El entrenamiento de la cabeza MTP utiliza auto-destilación: el profesor es la propia elección greedy del token siguiente de grug-27b-v1.1, de modo que el objetivo de aceptación coincide directamente con el acuerdo con el verificador. Los datos provienen del dataset ProCreations/grug-27b-v2-corrective, que incluye trayectorias de agentes, llamadas a herramientas, razonamiento, código y matemáticas. Se emplearon 4,0 millones de tokens (1,25 millones supervisados) en 489 pasos, con un tiempo total de 26 minutos en una RTX PRO 6000. El resultado es una cabeza MTP que alcanza un 95,37% de acuerdo top-1 con el verificador en los tramos de grug, frente al 90,04% de la cabeza nativa, y una pérdida de evaluación de 0,1649 frente a 0,3802. Es importante señalar que los pesos del modelo principal no cambian: la cabeza solo afecta a la velocidad, nunca a las respuestas.

## Capacidades

- Generación de texto con razonamiento explícito (modo thinking) y respuestas concisas, sin relleno innecesario.
- Razonamiento matemático y resolución de problemas multi-paso.
- Generación de código en varios lenguajes, con soporte para tool calling mediante el parser `qwen3_coder`.
- Capacidades agénticas: puede encadenar llamadas a herramientas y ejecutar tareas de múltiples pasos.
- Decodificación especulativa nativa mediante cabeza MTP, acelerando la inferencia en motores compatibles (vLLM, sglang).
- Soporte multilingüe limitado al inglés (único idioma declarado).

## Casos de uso

- Agentes autónomos con tool calling: el modelo puede gestionar flujos de trabajo que requieren llamadas a APIs, búsquedas o ejecución de código, gracias a su entrenamiento en trayectorias de agentes y su soporte nativo para tool calling en vLLM.
- Asistente de programación en producción: integrable en IDE o pipelines de CI/CD para generar código, explicar fragmentos o autocompletar con razonamiento, aprovechando la baja latencia de la decodificación especulativa.
- Automatización de tareas administrativas: procesamiento de documentos, extracción de datos estructurados y generación de informes, donde la concisión del modelo reduce costes de tokens.
- Razonamiento matemático y científico: resolución de problemas de álgebra, cálculo o lógica con pasos intermedios, útil en entornos educativos o de investigación.
- Chat técnico de soporte: atención al cliente especializada en temas de desarrollo de software, donde el modelo puede mantener conversaciones multi-turno con contexto largo (aunque la longitud exacta no está publicada).
- Inferencia de baja latencia en servidores: gracias a la cabeza MTP, el modelo puede servir peticiones con menor tiempo de respuesta en motores como vLLM o sglang, adecuado para aplicaciones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que esta variante MTP obtiene puntuaciones idénticas al modelo base grug-27b-v1.1, cuyos benchmarks y tabla de esfuerzo se encuentran en su tarjeta principal. No se dispone de datos numéricos de MMLU, HumanEval, GSM8K u otras pruebas en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB (27,36B parámetros × 2 bytes), más overhead de activaciones y caché KV. Se recomienda una GPU con al menos 60 GB de VRAM.
- Con cuantización GGUF de 4 bits (p. ej., Q4_K_M), la huella de memoria se reduce a unos 14-16 GB, permitiendo su ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPUs recomendadas: A100 80GB, H100, RTX 6000 Ada, o GPUs consumer con cuantización.
- Opciones de despliegue: vLLM (con `--speculative-config '{"method":"qwen3_next_mtp","num_speculative_tokens":2}'`), sglang, llama.cpp (para GGUF), y potencialmente Ollama si se empaqueta el GGUF.
- Latencia y throughput: no disponibles. La aceleración real depende del motor, el tamaño de lote y la longitud de los drafts especulativos; no se ha medido una ganancia de velocidad en wall-clock en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos similares en la información proporcionada. El modelo base es un fine-tune de Qwen3.6-27B, por lo que puede compararse con otros modelos de 27-32B parámetros como Qwen3-27B o Llama 3.1 30B, pero no hay datos de rendimiento en esta documentación para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La cabeza MTP solo acelera la inferencia en motores que implementen el protocolo Qwen3 MTP (vLLM, sglang). En transformers estándar, el modelo funciona sin aceleración.
- La decodificación especulativa no siempre produce una ganancia de velocidad; depende del hardware, el tamaño de lote y la longitud de los drafts. La tasa de acuerdo del 95,37% es una métrica de aceptación, no una medida de velocidad real.
- Al ser un fine-tune de Qwen, puede heredar sesgos presentes en el modelo base, aunque no se documentan explícitamente.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda validación humana en aplicaciones críticas.
- La longitud de contexto no está publicada, lo que limita la planificación de aplicaciones que requieran ventanas largas.
- No se proporcionan garantías de rendimiento en producción; se recomienda realizar pruebas propias con cargas de trabajo representativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/grug-27b-v1.1-mtp
- Modelo base grug-27b-v1.1: https://huggingface.co/ProCreations/grug-27b-v1.1
- Modelo base grug-27b (original): https://huggingface.co/ProCreations/grug-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/ProCreations/grug-27b-v2-corrective
- Versión GGUF con cabeza MTP: https://huggingface.co/ProCreations/grug-27b-v1.1-mtp-gguf
- Versión GGUF sin cabeza MTP: https://huggingface.co/ProCreations/grug-27b-v1.1-gguf
- Entrada en LLM Explorer: https://llm-explorer.com/model/ProCreations%2Fgrug-27b,4I3COxIuitPNrvIAJrjQMi
- Reseña en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/grug-27b-procreations
