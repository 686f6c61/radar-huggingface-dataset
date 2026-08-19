# ProCreations/grug-v1.1-qwen-3.8-27b-mtp-awq-int4

## Resumen

Grug v1.1 Qwen3.8 27B AWQ INT4 es una cuantización orientada a vLLM del modelo híbrido ProCreations/grug-v1.1-qwen-3.8-27b-mtp, desarrollado por ProCreations sobre la arquitectura Qwen3.8 (tag qwen3_5). El modelo combina una torre de visión, un backbone híbrido con capas GatedDeltaNet y un head de predicción multi-token (MTP) entrenado, lo que lo convierte en una opción multimodal con decodificación especulativa integrada. La cuantización emplea AWQ asimétrico W4A16 con group size 128, calibrado en 128 muestras de Ultrachat a 1024 tokens, y conserva en BF16 las partes sensibles a la precisión: la torre de visión, embeddings, LM head y las puertas a/b de GatedDeltaNet.

El modelo resuelve el problema de desplegar un sistema multimodal de 27B parámetros en una sola GPU, manteniendo el rendimiento de razonamiento y tool calling de la familia Qwen3.8. Su licencia Apache 2.0 lo hace apto para uso comercial sin restricciones, y su integración con vLLM permite servir con speculative decoding mediante el método qwen3_next_mtp, reduciendo la latencia en generación. La versión cuantizada aquí descrita está optimizada para producción, con un tamaño de repo de 19.6 GB y 5.823.717.664 parámetros en los pesos safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (Qwen3.5 con GatedDeltaNet y visión), basada en Qwen3.8 27B |
| Parametros totales | 5.823.717.664 (según safetensors; el nombre del modelo indica 27B, posiblemente MoE) |
| Parametros activos | No disponible |
| Longitud de contexto | 32.768 tokens (configuración sugerida de vLLM) |
| Tipos de cuantizacion | AWQ INT4 asimétrico (W4A16, group size 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con tensores cuantizados AWQ y pesos BF16 para componentes sensibles) |

## Arquitectura y entrenamiento

El modelo base, grug-v1.1-qwen-3.8-27b-mtp, es una variante de Qwen3.8 27B que incorpora una arquitectura híbrida con capas GatedDeltaNet (una aproximación de atención lineal) y un módulo de visión que permite entrada imagen-texto. El head MTP está entrenado para predecir múltiples tokens futuros, lo que se usa para decodificación especulativa en vLLM. La cuantización AWQ se aplicó al backbone completo, excluyendo la torre de visión, los embeddings, el LM head y las puertas a/b de GatedDeltaNet, que se mantienen en BF16 para preservar la precisión. El proceso de calibración usó 128 muestras de Ultrachat a 1024 tokens, y el head MTP entrenado se mantiene en BF16, garantizando compatibilidad con el método de speculative decoding qwen3_next_mtp.

## Capacidades

- Generación de texto multimodal: acepta imágenes y texto como entrada, genera texto coherente.
- Tool calling: soporta el parser qwen3_coder para llamadas a herramientas, activable con `--enable-auto-tool-choice`.
- Decodificación especulativa: integrado con MTP para acelerar la inferencia con `--speculative-config '{"method":"qwen3_next_mtp","num_speculative_tokens":2}'`.
- Razonamiento: compatible con el parser de razonamiento qwen3, útil para tareas de chain-of-thought.
- Multilingüe: no se han especificado idiomas concretos, pero se basa en Qwen3.8, que soporta múltiples idiomas (no confirmado para esta variante).
- Despliegue en vLLM: optimizado para servir en entornos de producción con endpoints compatibles.

## Casos de uso

- **Asistente multimodal en producción**: el modelo puede procesar imágenes y texto en un solo pipeline, por ejemplo para atender consultas de soporte técnico con capturas de pantalla, gracias a su torre de visión y su contexto de 32K tokens.
- **Generación de código con tool calling**: integrado en vLLM con el parser qwen3_cool_call, puede usarse en entornos de desarrollo para autocompletar código y ejecutar herramientas externas.
- **Razonamiento matemático y lógico**: el parser de razonamiento qwen3 y el head MTP mejoran la precisión en tareas de multi-step reasoning, adecuado para sistemas de tutoría o análisis.
- **Inferencia especulativa en alta carga**: la decodificación con MTP reduce la latencia en servicios de chat o generación de texto en tiempo real, manteniendo calidad.
- **Despliegue en una sola GPU**: con la cuantización INT4, el modelo cabe en GPUs de 24 GB o 48 GB, lo que permite servir un modelo de 27B en infraestructura moderada.
- **Investigación en arquitecturas híbridas**: el uso de GatedDeltaNet y MTP lo hace un candidato para experimentos sobre eficiencia de atención y decodificación especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos de FriendliAI mencionan métricas de "disagree rate" y "gold top-1" para el modelo base, pero no se aportan cifras concretas en la model card ni en la búsqueda web. La cuantización AWQ está diseñada para preservar la calidad del modelo original, pero no hay métricas comparativas con la versión BF16 en la documentación.

## Requisitos de hardware

- VRAM estimada: el modelo base (grug-27b-v1.1) requiere ~54.8 GB en BF16 según LLM Explorer. La cuantización INT4 reduce el peso a aproximadamente 1/4, estimando ~15-20 GB para inferencia con contexto 32K, pero no se confirma.
- GPU recomendadas: para vLLM, se sugiere una GPU con al menos 24 GB de VRAM (p. ej., RTX 4090, A100 40 GB, H100 80 GB) para el modelo cuantizado. Para el modelo BF16, se necesitan GPUs de 80 GB (A100/H100) o configuración multi-GPU.
- Compatibilidad: cabe en consumer GPU de 24 GB (RTX 4090) con la cuantización, pero el rendimiento dependerá de la memoria y el contexto.
- Opciones de despliegue: vLLM (soporte oficial), llama.cpp/Ollama para despliegue local (no confirmado), TGI puede requerir adaptación.
- Latencia y throughput: no disponible, pero la decodificación especulativa con MTP reduce el número de pasos de generación, mejorando el throughput en vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|
| ProCreations/grug-v1.1-qwen-3.8-27b-mtp (base) | 27B (total) | 32K (configurable) | Apache 2.0 | BF16 | Modelo original con MTP y visión |
| Qwen3.8 27B (base) | 27B | 32K | Apache 2.0 | BF16 | Modelo original de Qwen, sin MTP |
| Grug-27b-v1.1 (variante anterior) | 27B | No disponible | Apache 2.0 | BF16 | Modelo anterior sin MTP |

La comparativa se limita a variantes de la misma familia; no se dispone de información sobre modelos de otros proveedores con características similares.

## Limitaciones y advertencias

- **Precisión reducida**: la cuantización AWQ INT4 puede degradar ligeramente la calidad en tareas de alta sensibilidad numérica o razonamiento complejo, aunque el modelo mantiene partes críticas en BF16.
- **Sesgos y alucinación**: no hay información específica sobre sesgos o tasas de alucinación; como modelo multimodal, puede generar contenido incorrecto en contextos ambiguos.
- **Idiomas no confirmados**: la documentación no especifica los idiomas soportados, aunque la base Qwen3.8 es multilingüe.
- **Dependencia de vLLM**: el soporte de MTP y speculative decoding está optimizado para vLLM; otros frameworks pueden no aprovechar estas características.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la base Qwen3.8 para evitar conflictos.
- **Despliegue**: el modelo base requiere ~55 GB de VRAM; la versión cuantizada cabe en 24 GB, pero el contexto máximo de 32K puede aumentar los requisitos de memoria.

## Enlaces

- Modelo en HuggingFace: [ProCreations/grug-v1.1-qwen-3.8-27b-mtp-awq-int4](https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-mtp-awq-int4)
- Modelo base: [ProCreations/grug-v1.1-qwen-3.8-27b-mtp](https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-mtp)
- Backbone cuantizado: [ProCreations/grug-v1.1-qwen-3.8-27b-awq-int4](https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-awq-int4)
- Información de VRAM: [LLM Explorer - Grug 27B V1.1](https://llm-explorer.com/model/ProCreations%2Fgrug-27b-v1.1,7w81YA2p3vl4IO1tukcqWu)
- API de inferencia: [FriendliAI - grug-v1.1-qwen-3.8-27b-mtp](https://friendli.ai/models/ProCreations/grug-v1.1-qwen-3.8-27b-mtp)
- Guía de producción Qwen 3.8: [Yottalabs - How to Run Qwen 3.8 in Production](https://www.yottalabs.ai/post/how-to-run-qwen-3-8-in-production)
