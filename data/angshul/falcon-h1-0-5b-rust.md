# Angshul/Falcon-H1-0.5B-Rust

## Resumen

Falcon-H1-0.5B-Rust es una reimplementación en Rust, sobre el framework Candle de Hugging Face, del modelo Falcon-H1-0.5B-Instruct desarrollado originalmente por el Technology Innovation Institute (TII). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de los pesos originales en FP32 a un formato propio denominado `.f32pack`, acompañada de un motor de inferencia escrito en Rust con soporte para CUDA y CPU. El autor del repositorio es Angshul.

El interés de esta ficha reside en su valor como artefacto de ingeniería más que como modelo lingüístico: reproduce la arquitectura híbrida de Falcon-H1 (Mamba-2 en paralelo con atención, GQA, RoPE, RMSNorm y SwiGLU) y valida numéricamente la implementación contra la referencia de Transformers, con un error absoluto máximo de logits de 7,0522e-5 y una coincidencia total en el top-5 de tokens para una entrada de tres tokens.

El modelo subyacente tiene 0,5 mil millones de parámetros y está orientado a generación de texto y conversación. Su relevancia es limitada para producción general, pero resulta útil para quienes necesiten ejecutar Falcon-H1 sin el stack de Python, integrar inferencia en servicios Rust o estudiar una implementación de referencia de la arquitectura híbrida Mamba-2/atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Mamba-2 en paralelo con atención, grouped-query attention, RoPE, RMSNorm, SwiGLU |
| Parametros totales | 0,5 mil millones (heredados de tiiuae/Falcon-H1-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en FP32 dentro de un formato propietario `.f32pack` |
| Idiomas soportados | no disponible |
| Licencia | Falcon-LLM License (falcon-llm-license) |
| Formato de pesos | `.f32pack` (formato propio, no cargable con `Transformers.from_pretrained`) |

## Arquitectura y entrenamiento

La implementación reproduce la arquitectura de Falcon-H1: bloques híbridos que combinan Mamba-2 y atención en paralelo, atención con grouped-query attention, embeddings posicionales rotatorios (RoPE), normalización RMSNorm y redes feed-forward con activación SwiGLU. El motor está escrito en Rust sobre Candle y puede compilarse con soporte CUDA mediante `cargo build --release --features cuda`.

No hubo entrenamiento ni fine-tuning adicional: el checkpoint contiene únicamente los pesos FP32 convertidos desde `tiiuae/Falcon-H1-0.5B-Instruct`. Por tanto, las características de entrenamiento (número de tokens, composición del dataset, alineación mediante RLHF o DPO) son las del modelo original de TII y no se detallan en la información disponible. La validación numérica se realizó en una NVIDIA Tesla T4 vía Google Colab, comparando contra la implementación de Hugging Face con una entrada de tres tokens `[1, 2, 3]`: error absoluto máximo de logits 7,0522e-5, error absoluto medio 1,4631e-5 y top-5 de tokens idéntico. La destilación de conocimiento figura como no implementada y la optimización de entrenamiento en GPU como pendiente.

## Capacidades

- Generación de texto autoregresiva y conversación, heredadas del modelo base Instruct.
- Inferencia en GPU CUDA (validada en Tesla T4) y en CPU.
- API HTTP integrada con los endpoints `GET /health`, `GET /v1/model`, `POST /v1/logits` y `POST /v1/generate`.
- Exposición directa de logits, útil para evaluación, calibración o búsqueda controlada.
- La API actual acepta identificadores de token, no texto en crudo; el tokenizador debe gestionarse externamente.
- Soporte de tool calling, agentes, visión, audio o modo de razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicios de inferencia en Rust: integración del binario `falcon-h1-api` en un backend ya escrito en Rust, evitando el runtime de Python y sus dependencias, con despliegue sobre CUDA o CPU según el hardware disponible.
- Validación de implementaciones propias: el repositorio sirve como referencia numérica para verificar portes de Falcon-H1 a otros lenguajes o frameworks, gracias a los errores de logits documentados frente a Transformers.
- Evaluación controlada por tokens: el endpoint `/v1/logits` permite obtener distribuciones completas sobre secuencias de IDs, útil para investigación en calibración, análisis de incertidumbre o decodificación restringida.
- Prototipado de arquitecturas híbridas: al reproducir Mamba-2 más atención en paralelo con dimensiones originales, es un banco de pruebas para estudiar el comportamiento de esta familia sin el stack de Python.
- Despliegue en hardware modesto: con 0,5 mil millones de parámetros en FP32, el checkpoint de 2,1 GB puede ejecutarse en GPU de gama media y en CPU, adecuado para entornos de demostración o CI.
- Pruebas de regresión en pipelines: el endpoint `/health` y la API HTTP facilitan integrar el modelo en tests automatizados que verifiquen que un cambio en el entorno no altera las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la concordancia numérica con la implementación de Hugging Face:

| Metrica | Valor |
|---|---|
| Error absoluto maximo de logits | 7,0522e-5 |
| Error absoluto medio de logits | 1,4631e-5 |
| Coincidencia top-5 de tokens | Identica |
| Entrada de validacion | [1, 2, 3] |
| Hardware de validacion | NVIDIA Tesla T4 (Google Colab) |

## Requisitos de hardware

- VRAM estimada: el checkpoint FP32 ocupa 2,1 GB; en inferencia hay que sumar activaciones y caché, por lo que se recomienda al menos 4-6 GB de VRAM en GPU.
- GPU validadas: NVIDIA Tesla T4. Por tamaño, debería caber en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, A100 y H100, aunque solo la T4 está confirmada explícitamente.
- GPU de consumo: sí, el modelo de 0,5 mil millones de parámetros en FP32 es apto para tarjetas consumer con 6 GB o más.
- CPU: soportada según la model card, sin cifras de rendimiento publicadas.
- Despliegue: binario Rust con Candle (`cargo build --release --features cuda`) y servidor HTTP propio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; de hecho, el formato `.f32pack` no es cargable con `Transformers.from_pretrained`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Angshul/Falcon-H1-0.5B-Rust | 0,5 B | no disponible | `.f32pack` (Rust/Candle) | Falcon-LLM License | Reimplementación en Rust, sin entrenamiento adicional |
| tiiuae/Falcon-H1-0.5B-Instruct | 0,5 B | no disponible | safetensors (Transformers) | Falcon-LLM License | Modelo original de referencia, ecosistema Python |
| Alternativas de ~0,5 B (p. ej. Qwen2.5-0.5B-Instruct) | ~0,5 B | no disponible | safetensors, GGUF | según modelo | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda todos los sesgos y limitaciones del Falcon-H1-0.5B-Instruct original, incluidos los riesgos de alucinación propios de un modelo de 0,5 mil millones de parámetros.
- La validación numérica se realizó con una única entrada de tres tokens; no hay evidencia publicada sobre secuencias largas ni sobre estabilidad en generación prolongada.
- El formato `.f32pack` es propietario y no es compatible con `Transformers.from_pretrained`, lo que impide reutilizar el ecosistema estándar de Python sin conversión.
- La API acepta IDs de token, no texto; es necesario aportar el tokenizador por separado, lo que añade complejidad de integración.
- La licencia Falcon-LLM License impone condiciones específicas de uso; debe revisarse el enlace oficial antes de cualquier uso comercial.
- Idiomas soportados y longitud de contexto no están documentados en la información disponible.
- La destilación de conocimiento no está implementada y la optimización de entrenamiento en GPU está pendiente, por lo que no es adecuado como base para fine-tuning en este repositorio.
- El repositorio registra 0 descargas y 0 likes, sin comunidad ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Angshul/Falcon-H1-0.5B-Rust
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-0.5B-Instruct
- Licencia Falcon-LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Framework Candle: https://github.com/huggingface/candle
- Technology Innovation Institute (TII): https://www.tii.ae
