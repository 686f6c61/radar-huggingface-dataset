# Ooriginador/Qwen2.5-Coder-1.5B-ArkCompact-1.58bit

## Resumen

El modelo **Ooriginador/Qwen2.5-Coder-1.5B-ArkCompact-1.58bit** es una cuantización extrema de 1,58 bits (ternaria base-3) del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollada por el autor Ooriginador como parte de la infraestructura Arkheion Sovereign AI. Su propósito principal no es ser un modelo de propósito general, sino actuar como **modelo draft y reranker** para acelerar la decodificación especulativa y el reranking de código en entornos de producción, especialmente sobre hardware AMD con ROCm/HIP.

La cuantización reduce el peso a valores ternarios {-1, 0, +1} empaquetados en 5 trits por byte, lo que permite un footprint de VRAM de solo 387 MB (frente a los ~3 GB del FP16) y un arranque por memoria mapeada en menos de 450 ms. El modelo mantiene una ventana de contexto de 32k tokens y alcanza un throughput de 280 tok/s en un solo stream sobre una AMD Radeon RX 6600M, con picos de 21 432 tok/s en modo batch Wave32. Está diseñado para integrarse con el runtime Rust `ark-engine` y ofrece una API compatible con OpenAI.

La relevancia actual radica en su enfoque en **soberanía tecnológica** (sovereign AI) y eficiencia extrema, permitiendo ejecutar modelos de código en hardware de consumo sin sacrificar demasiada fidelidad matemática (Pearson ρ ≥ 0,942 en capas lineales). Es una opción interesante para equipos que buscan acelerar inferencia de modelos grandes mediante drafts ternarios o desplegar asistentes de código en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Coder-1.5B-Instruct (Transformer decoder) cuantizado a 1,58 bits ternario |
| Parametros totales | 1,54 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (RoPE scaling completo) |
| Tipos de cuantizacion | 1,58-bit Base-3 (ternario, 5 trits por byte) |
| Idiomas soportados | Portugues (pt), ingles (en) segun la model card; el modelo base soporta mas idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | No especificado explicitamente; se menciona un archivo `.ark` para el runtime ArkheionNet (posiblemente formato propio) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-Coder-1.5B-Instruct, un transformer decoder con atención multi-cabeza estándar y RoPE. La innovación principal reside en la capa de cuantización **ArkCompact**, que convierte los pesos en valores ternarios {-α, 0, +α} mediante empaquetado base-3 (3^5 = 243 ≤ 256, por lo que 5 trits caben en un byte). Esto elimina las multiplicaciones de punto flotante de 16 bits y las sustituye por acumulaciones enteras y máscaras bitwise fusionadas en Wave32 (arquitectura GPU de AMD).

El entrenamiento original del modelo base (Qwen2.5-Coder-1.5B-Instruct) se realizó con datos de código, matemáticas y razonamiento, pero la cuantización ArkCompact no implica un entrenamiento adicional; es una transformación post-entrenamiento que preserva la fidelidad mediante una técnica de calibración que mantiene una correlación de Pearson ≥ 0,942 en todas las capas lineales 2D. Además, incorpora **Multi-Head Latent Attention (MLA)** que reduce el footprint de la caché KV en un 85,9 %, y **chunked prefill** para eliminar el bloqueo head-of-line en batching continuo.

## Capacidades

- **Generación de texto y código**: al ser una cuantización del modelo instruct, conserva la capacidad de generar código, explicaciones y razonamiento, aunque con posible degradación por la baja precisión.
- **Decodificación especulativa**: diseñado específicamente como modelo draft para verificar múltiples tokens en paralelo (tree-attention), alcanzando 410 tok/s en modo especulativo.
- **Reranking de código**: puede actuar como reranker neuronal para seleccionar la mejor salida entre varias candidatas.
- **Soporte de tool calling**: no se menciona explícitamente, pero el modelo base Qwen2.5-Coder-Instruct sí lo soporta; la cuantización podría conservarlo, aunque no está confirmado.
- **Capacidades multilingües**: la model card indica soporte para portugués e inglés, aunque el modelo base cubre más idiomas.
- **Integración con runtime Rust**: compatible con `ark-engine` y `ark-sdk`, ofreciendo una API OpenAI-compatible para streaming.

## Casos de uso

- **Aceleración de inferencia de modelos grandes**: como modelo draft en un esquema de decodificación especulativa, puede acelerar la generación de un modelo maestro (por ejemplo, Qwen2.5-Coder-32B) en un factor de 1,5 a 2 veces, gracias a su bajo coste de verificación y su alta velocidad (410 tok/s en tree-attention).
- **Asistente de código en dispositivos edge**: con solo 387 MB de VRAM, puede ejecutarse en GPUs integradas o tarjetas de gama baja (como la RX 6600M) para ofrecer autocompletado y generación de código en entornos sin conexión.
- **Reranking de candidatos en pipelines de generación**: en sistemas de generación aumentada por recuperación (RAG) o en generación de código con múltiples muestras, el modelo puede puntuar y seleccionar la mejor salida, mejorando la precisión sin necesidad de un modelo grande.
- **Despliegue en infraestructura soberana**: al estar basado en ROCm/HIP y Rust, es adecuado para organizaciones que requieren evitar dependencias de CUDA o de proveedores cloud específicos.
- **Prototipado rápido de agentes de código**: su bajo consumo permite iterar rápidamente en entornos de desarrollo local, probando flujos de tool calling y razonamiento multi-paso antes de escalar a modelos mayores.
- **Servidor de chat ligero**: puede servir como backend de un chatbot de código con API OpenAI-compatible, útil para equipos pequeños o para educación, donde la latencia es más importante que la máxima calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo proporciona métricas de rendimiento de hardware:

| Metrica | Valor medido |
|---|---|
| Throughput single-stream | 280,0 tok/s |
| Throughput especulativo (tree-attention) | 410,0 tok/s |
| Throughput pico batch Wave32 | 21 432,0 tok/s |
| VRAM | 387 MB |
| Fidelidad matematica (Pearson ρ) | ≥ 0,942 |
| Tiempo de inicializacion (mmap) | < 450 ms |

Estas cifras se obtuvieron en una AMD Radeon RX 6600M (RDNA2) y no son comparables con benchmarks de calidad de generación.

## Requisitos de hardware

- **VRAM estimada**: 387 MB en cuantización 1,58-bit, lo que permite ejecutarlo en cualquier GPU con al menos 1 GB de VRAM.
- **GPU recomendadas**: AMD Radeon RX 6600M (usada en las pruebas), cualquier GPU RDNA2 o superior con soporte ROCm/HIP. También puede funcionar en GPUs NVIDIA si se adapta el runtime, aunque no está documentado.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama baja, integradas o incluso en CPU (aunque con menor rendimiento).
- **Opciones de despliegue**: runtime nativo `ark-engine` (Rust) con API OpenAI-compatible; también se puede usar `ark-sdk` para integración en Rust. No se menciona soporte para vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: 280 tok/s en single-stream, 410 tok/s en modo especulativo, y picos de 21 432 tok/s en batch Wave32 (medidos en la GPU indicada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM | Licencia | Uso principal |
|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (FP16) | 1,5B | 32k | FP16 | ~3 GB | Apache-2.0 | Generación de código general |
| Qwen2.5-Coder-1.5B-ArkCompact-1.58bit | 1,54B | 32k | 1,58-bit ternario | 387 MB | Apache-2.0 | Draft/reranker, edge |
| Qwen2.5-Coder-7B-Instruct (FP16) | 7B | 32k | FP16 | ~14 GB | Apache-2.0 | Generación de código de mayor calidad |

La comparativa muestra que este modelo sacrifica calidad (por la cuantización extrema) a cambio de una reducción drástica de recursos, posicionándose como una herramienta de aceleración más que como un modelo de propósito general.

## Limitaciones y advertencias

- **Degradación de calidad**: la cuantización a 1,58 bits puede provocar errores en tareas complejas de razonamiento o generación de código, a pesar de la alta fidelidad reportada (ρ ≥ 0,942). No se han publicado evaluaciones cualitativas independientes.
- **Alucinación**: al ser una versión cuantizada, el riesgo de alucinación puede ser mayor que en el modelo original, especialmente en contextos largos.
- **Idiomas limitados**: la model card solo declara portugués e inglés; el uso en otros idiomas puede degradar el rendimiento.
- **Dependencia del runtime ArkheionNet**: el modelo está pensado para usarse con `ark-engine`; no se garantiza compatibilidad con otros frameworks de inferencia (Transformers, vLLM, etc.).
- **Hardware específico**: las métricas de rendimiento se obtuvieron en AMD RDNA2 con ROCm; en otras plataformas (NVIDIA, Apple Silicon) el rendimiento puede variar significativamente.
- **Licencia**: aunque la licencia es Apache-2.0, el modelo base Qwen2.5-Coder también es Apache-2.0, por lo que no hay restricciones adicionales para uso comercial, pero se recomienda verificar la atribución.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ooriginador/Qwen2.5-Coder-1.5B-ArkCompact-1.58bit)
- [Modelo base Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)
- [Repositorio ArkheionNet (mencionado en la model card)](https://github.com/Arkheion/ArkheionNet)
- [Documentación de Qwen2.5-Coder (GitHub)](https://github.com/huggingface/Qwen2.5-Coder)
