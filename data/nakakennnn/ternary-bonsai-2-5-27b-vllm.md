# nakakennnn/Ternary-Bonsai-2.5-27B-vllm

## Resumen

Ternary-Bonsai-2.5-27B-vllm es una conversión no oficial del modelo prism-ml/Ternary-Bonsai-2.5-27B al formato safetensors compatible con vLLM. El modelo original, desarrollado por PrismML, emplea una arquitectura híbrida de atención (combinando atención lineal y atención completa) con pesos ternarios empaquetados en int32 y escalas de grupo en FP16, lo que reduce drásticamente el coste de almacenamiento y memoria frente a un modelo denso equivalente en BF16.

La conversión, publicada por el usuario nakakennnn, preserva los códigos ternarios y las escalas del GGUF original sin recuantizar, e incorpora una cabeza MTP (multi-token prediction) para decodificación especulativa, además de una torre de visión en BF16. El resultado es un checkpoint de aproximadamente 3.980 millones de parámetros en safetensors (11,2 GB de repositorio) que puede servirse en vLLM con soporte para el método de cuantización `prism_ternary`.

Su relevancia radica en la combinación de un modelo de gran tamaño nominal (27B) con un formato de pesos de 2 bits que permite ejecutarlo en hardware de gama consumer, manteniendo la integración con vLLM y la decodificación especulativa mediante MTP. La licencia Apache-2.0 facilita su uso comercial, aunque la información publicada sobre idiomas, benchmarks e idiomas soportados es escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa (hybrid-attention), formato `qwen3_5` |
| Parámetros totales | 3.982.951.152 (según safetensors); el nombre comercial indica 27B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternario empaquetado en int32 con escalas de grupo FP16 (g128, base Hadamard por bloques); método `prism_ternary` en vLLM; el GGUF de origen es PQ2_0 |
| Idiomas soportados | no disponible (la prueba de humo menciona chat en japonés e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (vLLM), con torre de visión en `model-vision.safetensors` (BF16) y cabeza MTP |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer híbrido con 64 bloques que alternan atención lineal y atención completa, según el layout del formato vLLM de Bonsai 2 27B. Los pesos lineales se almacenan en formato ternario: códigos de 2 bits empaquetados en int32 junto con escalas de grupo en FP16 (tamaño de grupo 128) y una base de Hadamard por bloques. Los embeddings se guardan dequantizados en BF16, igual que en el formato vLLM de Bonsai 2.

La conversión no recuantiza: los códigos y escalas se copian bit a bit del GGUF `Ternary-Bonsai-2.5-27B-PQ2_0-mtp.gguf`. La cabeza MTP (`mtp.*`) proviene del bloque `blk.64.nextn` del GGUF, dequantizado de Q4_0 a BF16, y la torre de visión se toma de Qwen3.8-27B en BF16 (no del `mmproj` de la versión 2.5). Los vectores de signo de Hadamard son idénticos a los de Bonsai 2 y el 90,5% de los códigos ternarios coinciden con Bonsai 2 27B. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno en japonés e inglés (probado en la prueba de humo de la conversión).
- Generación de código (probado en la prueba de humo).
- Decodificación especulativa mediante cabeza MTP, con una tasa de aceptación aproximada del 74% en unos pocos prompts según el autor de la conversión.
- Procesamiento de visión gracias a la torre de visión en BF16 incluida en el repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible más allá de la mención a japonés e inglés.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en vLLM con tensor parallelism en GPUs de 12 GB: el formato `prism_ternary` y el tamaño compacto de los pesos permiten servir el modelo con TP=2 en dos GPUs de 12 GB, según la configuración de referencia del autor de la conversión.
- Decodificación especulativa en producción: la cabeza MTP integrada permite acelerar la generación aceptando varios tokens por paso, con una tasa de aceptación reportada de aproximadamente el 74% en pruebas preliminares.
- Asistente conversacional en japonés e inglés: el modelo fue probado en chat en ambos idiomas, por lo que es adecuado para aplicaciones de atención al cliente o asistentes bilingües en esos idiomas.
- Generación de código en pipelines de desarrollo: la prueba de humo incluye generación de código, lo que permite integrarlo en herramientas de autocompletado o revisión asistida.
- Tareas multimodal con imagen: la torre de visión en BF16 permite procesar entradas visuales junto con texto, útil para descripción de imágenes o extracción de información de documentos escaneados.
- Investigación sobre cuantización ternaria: el checkpoint sirve como referencia para estudiar el impacto de pesos de 2 bits empaquetados en int32 con escalas de grupo y base Hadamard en tareas de razonamiento y generación.
- Prototipado en hardware de gama consumer: al caber en configuraciones de 2×12 GB, facilita experimentación local con un modelo de 27B nominal sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión indica que solo se realizó una prueba de humo (chat en japonés e inglés, código, y aceptación MTP de aproximadamente el 74% en unos pocos prompts) y remite a la model card oficial para benchmarks.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 11,2 GB; la configuración de referencia del autor usa TP=2 sobre 2 GPUs de 12 GB, lo que sugiere un requisito de aproximadamente 24 GB en total para el despliegue con tensor parallelism.
- GPUs recomendadas: la configuración documentada emplea 2×12 GB; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- GPU consumer: sí, cabe en configuraciones de 2×12 GB según la configuración de referencia.
- Opciones de despliegue: vLLM 0.34 con soporte para `prism_ternary`; el GGUF original es compatible con llama.cpp, pero esta conversión está pensada para vLLM.
- Latencia y throughput: no disponibles; solo se reporta una tasa de aceptación MTP de aproximadamente el 74% en pruebas preliminares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-vllm | 3.982.951.152 (nominal 27B) | no disponible | Ternario int32 + escalas FP16 (prism_ternary) | Apache-2.0 | Hugging Face (conversión no oficial) |
| prism-ml/Ternary-Bonsai-2.5-27B-GGUF | no disponible | no disponible | PQ2_0 (GGUF) | Apache-2.0 | Hugging Face (modelo base) |
| Bonsai 2 27B (formato vLLM) | no disponible | no disponible | prism_ternary | no disponible | Referenciado como plantilla de conversión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: el autor no es PrismML; los benchmarks y garantías del modelo original deben consultarse en su model card.
- Prueba de humo limitada: solo se validó con chat en japonés e inglés, código y una estimación de aceptación MTP en unos pocos prompts; no hay evaluación sistemática.
- La torre de visión proviene de Qwen3.8-27B en BF16 y no del `mmproj` de la versión 2.5, lo que puede introducir diferencias respecto al modelo original en tareas multimodales.
- Requiere una build de vLLM que soporte `prism_ternary`; no funciona con versiones estándar sin ese soporte.
- Idiomas soportados no documentados oficialmente; solo hay evidencia anecdótica de japonés e inglés.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero al ser una conversión de un modelo de terceros conviene verificar la licencia y condiciones del modelo base y de la torre de visión de Qwen3.8-27B.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nakakennnn/Ternary-Bonsai-2.5-27B-vllm
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Configuración de referencia vLLM (TP=2 en 2×12 GB): https://github.com/Nakanokensetsu/bonsai-27b-wsl-tp2
