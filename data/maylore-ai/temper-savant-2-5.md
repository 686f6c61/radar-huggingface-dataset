# maylore-ai/Temper-Savant-2.5

## Resumen

Temper-Savant-2.5 es un ajuste fino (fine-tune) del modelo multimodal Gemma 4 26B-A4B-it de Google, especializado en generación de código Rust. Lo desarrolla maylore-ai y se distribuye bajo licencia Apache 2.0. El modelo parte de una arquitectura de mezcla de expertos (MoE) con 25.805.936.206 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, lo que lo sitúa en la misma categoría de eficiencia que su modelo base.

El problema que aborda es la baja competencia de los modelos generalistas en Rust, un lenguaje con un sistema de tipos y de préstamos (borrowing) particularmente estricto. Según la model card, su cuantización Q3 de 12,7 GB supera en HumanEval-RS y en el benchmark interno Temper Bench v2 tanto a Gemma 4 26B-A4B como a Qwen3.6-35B-A3B en precisión completa, lo que resulta relevante para equipos que necesitan asistencia de código Rust en hardware de gama consumer.

El modelo está pensado para uso conversacional y de generación de código, no como agente autónomo: el autor advierte explícitamente de que es débil en tareas multi-paso dentro de clientes como OpenCode. Su ventana de contexto, los datos de entrenamiento y los detalles de la composición del dataset no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Gemma 4 26B-A4B-it; transformer multimodal image-text-to-text |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4.000 millones (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3 GGUF (12,7 GB) disponible en maylore-ai/Temper-Savant-2.5-GGUF; pesos completos en safetensors (51,6 GB) |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp, LM Studio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 26B-A4B-it: un transformer con mezcla de expertos de 25.805.936.206 parámetros totales y unos 4.000 millones activos por token, con capacidad multimodal de entrada imagen-texto (pipeline image-text-to-text). El ajuste fino se orienta a generación de código Rust y a conversación, y el autor indica que el modelo responde sin modo de razonamiento (thinking mode): su plantilla de chat ignora el parámetro `enable_thinking`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas propias más allá de las heredadas del modelo base. La configuración de generación recomendada es temperatura 0.2 y top_p 0.95, que son los ajustes usados para obtener los resultados publicados.

## Capacidades

- Generación de código Rust, con resultados destacados en HumanEval-RS y MBPP-RS según la model card.
- Generación de texto y conversación multi-turno (pipeline text-generation, tag conversational).
- Entrada multimodal imagen-texto heredada de Gemma 4 26B-A4B-it.
- Capacidades multilingües limitadas a inglés y ruso según los metadatos de idioma.
- Respuesta sin modo de razonamiento: la plantilla de chat ignora `enable_thinking`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: explícitamente débil según el autor; no recomendado para uso agéntico autónomo.

## Casos de uso

- Asistencia de código Rust en el editor: el modelo puede completar y generar funciones Rust con una tasa de acierto de 91,5 en HumanEval-RS (pass@1), adecuado para autocompletado y generación de fragmentos en IDE.
- Revisión y corrección de código Rust en pipelines de CI: dado su rendimiento en MBPP-RS (78,5 pass@1), puede emplearse para generar tests o parches candidatos que luego se validan automáticamente.
- Despliegue en hardware de gama consumer: la cuantización Q3 de 12,7 GB permite ejecutarlo en llama.cpp o LM Studio en equipos con GPU de 16 GB o superiores, manteniendo 91,0 en HumanEval-RS.
- Generación de utilidades y herramientas CLI en Rust: el autor documenta que el modelo llevó una utilidad de tareas (todo) a un estado funcional con todos los tests pasando.
- Prototipado de backends en Rust (por ejemplo, con axum): aunque el autor reporta fallos en tareas complejas de cuatro handlers con tests, el modelo escribió todo el código y se detuvo en dos errores de compilación, lo que lo hace útil como generador de borradores que un humano completa.
- Conversación técnica en inglés y ruso: para equipos que trabajan en esos dos idiomas y necesitan explicaciones o asistencia sobre código Rust.
- Evaluación comparativa de modelos de código: como referencia en benchmarks internos de Rust gracias a la disponibilidad de sus scripts de evaluación en maylore-ai/rust-evals.

## Benchmarks y rendimiento

| Modelo | Tamano | HumanEval-RS (pass@1 / pass@10) | MBPP-RS (pass@1 / pass@10) | Temper Bench v2 |
|---|---|---|---|---|
| Temper Savant 2.5 | 51,6 GB | 91,5 / 94,6 | 78,5 / 81,8 | 80,7 |
| Temper Savant 2.5 Q3 | 12,7 GB | 91,0 / 94,2 | 77,5 / no disponible | 78,0 |
| Qwen3.6-35B-A3B | 71,9 GB | 89,2 / 95,3 | 78,1 / 83,3 | 63,3 |
| Gemma 4 26B-A4B | 51,6 GB | 86,8 / 90,6 | 75,0 / 78,3 | 74,7 |
| Gemma 4 26B-A4B QAT Q4 | 14,4 GB | 87,0 / 91,6 | 74,7 / 78,9 | 62,0 |

HumanEval-RS y MBPP-RS se midieron con pass@1 y pass@10 a temperatura 0,2 con 50 respuestas por tarea. La fila Q3 de Savant se ejecutó en llama.cpp con 10 respuestas en MBPP-RS, por lo que solo se ofrece pass@1. Gemma 4 26B-A4B QAT Q4 se ejecutó en vLLM con los pesos QAT de Google. Temper Bench v2 es pass@1 greedy sobre 150 tareas internas. Todos los modelos se ejecutaron sin modo de razonamiento.

## Requisitos de hardware

- Pesos completos en safetensors: 51,6 GB, por lo que la inferencia en precisión completa requiere al menos una GPU con 80 GB (A100 80GB, H100) o varias GPU en paralelo.
- Cuantización Q3 GGUF: 12,7 GB, apta para GPU consumer con 16 GB de VRAM (RTX 4060 Ti 16GB, RTX 4070 Ti Super, RTX 4080) o con 24 GB (RTX 3090, RTX 4090) sin problemas.
- Despliegue en servidor: el autor recomienda `vllm serve maylore-ai/Temper-Savant-2.5`.
- Despliegue en local: llama.cpp y LM Studio mediante el repositorio maylore-ai/Temper-Savant-2.5-GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-RS (pass@1) | Temper Bench v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Temper Savant 2.5 | 25,8B totales / ~4B activos | no disponible | 91,5 | 80,7 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | no disponible | 89,2 | 63,3 | no disponible | Hugging Face |
| Gemma 4 26B-A4B | 25,8B totales / ~4B activos | no disponible | 86,8 | 74,7 | Apache 2.0 | Hugging Face |
| Gemma 4 26B-A4B QAT Q4 | 25,8B totales / ~4B activos | no disponible | 87,0 | 62,0 | Apache 2.0 | Hugging Face |

Temper Savant 2.5 lidera en HumanEval-RS pass@1 y en Temper Bench v2 frente a los tres modelos comparados, aunque Qwen3.6-35B-A3B le supera en pass@10 (95,3 frente a 94,6) y en MBPP-RS pass@10 (83,3 frente a 81,8). La ventaja principal de Savant es su eficiencia: con 12,7 GB en Q3 mantiene 91,0 en HumanEval-RS, por encima de los modelos comparados a precisión completa.

## Limitaciones y advertencias

- Debilidad como agente: el autor advierte de que en tareas multi-paso el modelo puede quedarse atascado en errores de compilación o reiniciar el proyecto en lugar de corregirlo. En pruebas intentó borrar la carpeta del proyecto con `rm -rf` para "empezar de cero", por lo que recomienda configurar permisos de aprobación para comandos destructivos en el cliente (por ejemplo, OpenCode).
- Fallo en tareas complejas: en una tarea de backend axum con cuatro handlers y tests, el modelo no completó la tarea y se detuvo en dos errores de compilación.
- Idiomas limitados: solo inglés y ruso según los metadatos; no se garantiza un rendimiento adecuado en castellano.
- Ventana de contexto no documentada: no se especifica la longitud de contexto, lo que dificulta planificar su uso en repositorios grandes.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de código, puede producir APIs o crates inexistentes.
- Sin modo de razonamiento: la plantilla de chat ignora `enable_thinking`, por lo que no se beneficia de cadenas de pensamiento explícitas.
- Licencia Apache 2.0: permite uso comercial, pero las obras derivadas deben mantener las atribuciones indicadas en el fichero NOTICE.
- Modelo recién publicado: cero descargas y cero likes en el momento de la consulta, sin validación independiente de los resultados reportados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/maylore-ai/Temper-Savant-2.5
- Pesos GGUF: https://huggingface.co/maylore-ai/Temper-Savant-2.5-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Sitio web: https://maylore.com/temper-savant-2.5
- Benchmark Temper Bench v2: https://maylore.com/temper-bench
- Scripts de evaluación: https://github.com/maylore-ai/rust-evals
