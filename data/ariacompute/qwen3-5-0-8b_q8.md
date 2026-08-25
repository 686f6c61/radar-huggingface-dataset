# ariacompute/qwen3.5-0.8b_q8

## Resumen

Qwen3.5-0.8B es un modelo de lenguaje denso tipo Transformer decoder-only de 0,8 mil millones de parámetros, desarrollado por el equipo Qwen de Alibaba Cloud. Su arquitectura combina una ratio de 3:1 entre capas de atención lineal DeltaNet y capas de atención completa, lo que permite un procesamiento eficiente de contextos largos. El modelo base se preentrenó sobre corpus públicos diversos y se alineó mediante SFT y DPO.

La distribución ariacompute/qwen3.5-0.8b_q8 es un paquete cuantizado en 8 bits (q8) producido por Aria Compute, que aplica rotación de Hadamard y cuantización Lloyd-Max con codebooks por grupo (tamaño de grupo 32). El resultado es un bundle de aproximadamente 850 MB (frente a los ~1,6 GB del BF16 original, compresión de ~1,8×) con calidad de generación casi sin pérdidas. Está diseñado para inferencia local exclusivamente en CPU, en dispositivos móviles, edge y ordenadores de placa única, sin necesidad de GPU ni conexión en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con capas híbridas DeltaNet (linear attention) y full-attention en ratio 3:1 |
| Parametros totales | 0,8 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K (modelo base según documentación de Qwen3.5); el bundle cuantizado referencia 4K en su desglose de memoria |
| Tipos de cuantizacion | 8 bits (q8) con codebooks por grupo (group_size=32), rotación de Hadamard y Lloyd-Max; RMSNorm y embeddings en FP16 |
| Idiomas soportados | Inglés (principal), chino y más de 20 idiomas adicionales (los tags de HF listan en y zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado; bundle propietario del runtime Aria Engine (usa mmap para los pesos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un Transformer decoder-only denso con una ratio de 3:1 entre capas de atención lineal DeltaNet y capas de atención completa. Esta combinación reduce la complejidad del cálculo de atención para contextos largos, manteniendo la capacidad de capturar dependencias locales y globales. El modelo se preentrenó sobre conjuntos de datos públicos como RedPajama-1T, The Pile y The Stack, y se alineó mediante SFT y DPO.

El bundle de Aria Compute aplica una receta de cuantización uniforme de 8 bits: todas las matrices de pesos de atención (Q/K/V/O) y de la FFN (up/gate/down) se cuantizan con codebooks por grupo de tamaño 32, tras una rotación de Hadamard que reduce la sensibilidad a la cuantización. Las normas RMS y la tabla de embeddings se mantienen en FP16. La cuantización es libre de calibración: no requiere datos de calibración específicos de la tarea. El método declara una pérdida de calidad casi nula en la referencia del método (qwen3-0.6b_q8+group) con una delta de logprob de +0.00685 frente a FP16, estadísticamente indistinguible.

## Capacidades

- Generación de texto en inglés y chino, con soporte de otros idiomas adicionales.
- Tool calling y function calling para APIs móviles y de IoT.
- Generación de embeddings ligeros para recuperación y clasificación on-device.
- Resumen corto de notificaciones, mensajes y contenido local.
- Chat y asistentes conversacionales en modo offline.
- Razonamiento básico de contexto corto, sin capacidades multimodales (solo texto).
- No soporta entrada de imagen, audio ni vídeo (texto únicamente).

## Casos de uso

- Asistentes conversacionales on-device: el modelo puede gestionar diálogos multiturno en un smartphone con 8 GB de RAM, usando ~1,0 GB de memoria en total. Su capacidad de tool calling permite integrarlo con APIs locales del sistema.
- Resumen de notificaciones y mensajes: genera resúmenes cortos de contenido local sin enviar datos a servidores externos, adecuado para aplicaciones de privacidad estricta.
- Autocompletado de texto en tiempo real: para editores de código o apps de mensajería, con baja latencia en CPU.
- Agentes de automatización en dispositivos IoT: ejecución de tareas de control (encender luces, gestionar alarmas) mediante llamadas a funciones definidas localmente.
- Clasificación y recuperación de documentos locales: mediante embeddings ligeros para indexar y buscar en un corpus personal en el dispositivo.
- Asistentes de accesibilidad: lectura de texto y resumen de contenido en tiempo real en dispositivos de bajo coste como Raspberry Pi 5 o gateways de IoT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato declarado en el model-index es una métrica de consistencia de generación frente a FP16, aún pendiente de auditoría independiente:

| Métrica | Valor | Verificado |
|---|---|---|
| Consistencia de generación (vs FP16, método de referencia qwen3-0.6b_q8+group) | mean_token_overlap=0.6429, exact_prefix_frac=0.3854, logprob_delta=+0.00685 | No verificado |

El autor declara que el resultado es "near-lossless" y estadísticamente indistinguible de FP16, pero no hay una evaluación independiente publicada.

## Requisitos de hardware

- Memoria total estimada: ~1,0 GB en contexto de 4K (desglose: ~850 MB de pesos cuantizados con mmap + ~40 MB de KV cache + ~50 MB de runtime + ~60 MB de codebooks).
- Dispositivos objetivo: smartphones de gama alta (8 GB), gama media (4-6 GB), teléfonos de gama baja (2-3 GB), Raspberry Pi 5 y SBC (4-8 GB), gateways de IoT (1-2 GB). No apto para wearables de 1 GB.
- No requiere GPU: inferencia exclusivamente CPU, sin aceleración por hardware.
- No soporta batch inference ni despliegue en producción con GPU.
- Opciones de despliegue: runtime propietario Aria Engine (descargable desde el dashboard de Aria Compute). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este bundle específico.
- KV cache compacto gracias a GQA (20 capas × 2 cabezas KV × head_dim=128), ~3,5× más pequeño que el de Qwen3-1.7B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Calidad de generación |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0,8B | 262K | Apache 2.0 | FP16 | Referencia FP16 |
| qwen3.5-0.8b_q8 (este bundle) | 0,8B | 262K (base) / 4K (referencia del bundle) | Apache 2.0 | 8-bit (q8) | Logprob delta +0.00685 vs FP16 (near-lossless) |
| qwen3-0.6b_q8+group (referencia de método) | 0,6B | No disponible | Apache 2.0 | 8-bit (per-group) | mean_token_overlap=0.6429, exact_prefix_frac=0.3854 |

No se dispone de datos comparativos de rendimiento en tareas como MMLU o HumanEval para estos modelos.

## Limitaciones y advertencias

- No apto para escritura creativa larga (generación superior a 2K tokens por paso).
- No soporta razonamiento matemático avanzado ni demostración de teoremas.
- No es fiable para síntesis completa de programas; solo funciones cortas.
- El modelo es solo de texto: no acepta entrada multimodal (imagen, audio, vídeo).
- No debe usarse en sistemas de decisión de seguridad sin supervisión humana.
- No es adecuado para entornos de producción que requieran batch inference o aceleración por GPU.
- El bundle cuantizado depende del runtime propietario Aria Engine; no se distribuye en formatos estándar (safetensors, GGUF) para otros frameworks.
- Los resultados de calidad de generación declarados por el autor no están aún auditados por un evaluador independiente.
- El modelo base soporta 262K de contexto, pero el bundle cuantizado referencia 4K en su desglose de memoria; no se ha verificado el comportamiento a contextos mayores.

## Enlaces

- [Hugging Face - ariacompute/qwen3.5-0.8b_q8](https://huggingface.co/ariacompute/qwen3.5-0.8b_q8)
- [Hugging Face - Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [GitHub - ariacompute/model (directorio qwen3.5-0.8b)](https://github.com/ariacompute/model/tree/main/qwen/qwen3.5-0.8b)
- [Aria Compute Dashboard](https://ariacompute.com/dashboard/models)
- [Aria Engine](https://ariacompute.com)
- [Repositorio original de Qwen3.5](https://github.com/QwenLM/Qwen3.5)
- [Artículo técnico de Qwen3.5 (pendiente)](https://github.com/QwenLM/Qwen3.5)
- [Guía de hardware local de Qwen3.5](https://www.compute-market.com/blog/qwen-3-5-local-hardware-guide-2026)
