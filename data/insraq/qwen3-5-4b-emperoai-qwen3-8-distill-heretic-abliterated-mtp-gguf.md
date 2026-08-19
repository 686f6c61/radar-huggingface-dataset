# insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-MTP-GGUF

## Resumen

Este modelo es una conversión GGUF de `insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated`, una versión "decensored" (sin censura) del modelo `empero-ai/Qwen3.8-4B`, obtenida mediante la técnica de abliteration con la herramienta Heretic v1.4.0. El modelo base original es una destilación full-parameter del teacher Qwen3.8 2.4T A95B (un modelo de escala frontier) sobre la arquitectura Qwen3.5-4B, entrenado con aproximadamente 45.000 trazas de razonamiento del teacher. La versión GGUF incluye además un drafter MTP (Multi-Token Prediction) fusionado desde `unsloth/Qwen3.5-4B-MTP-GGUF` para acelerar la decodificación especulativa.

El interés principal de este modelo reside en su doble vertiente: por un lado, hereda del modelo destilado un razonamiento tipo chain-of-thought aprendido de un teacher de 2,4 billones de parámetros, con una ventana de contexto nativa de 262.144 tokens y function calling nativo según la especificación Qwen3.5. Por otro lado, la abliteration elimina los rechazos de contenido, reduciendo las negativas del 99% al 6% en las pruebas del autor, manteniendo una divergencia KL de 0,0167 respecto al original. Esto lo convierte en una opción atractiva para desarrolladores que necesitan un modelo pequeño, eficiente y sin restricciones de contenido, aunque con las implicaciones éticas y de seguridad que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer causal con capas de atención lineal Gated DeltaNet) |
| Parametros totales | 4.326.350.848 (~4,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (formato GGUF; se esperan múltiples archivos de cuantización, pero no se listan en la información proporcionada) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con drafter MTP fusionado) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-4B, que combina capas de atención tradicional con capas de atención lineal basadas en Gated DeltaNet, como se deduce de los requisitos de ejecución (dependencias `flash-linear-attention` y `causal_conv1d`). El modelo original `empero-ai/Qwen3.8-4B` fue entrenado mediante destilación off-policy (SFT) desde el teacher Qwen3.8 2.4T A95B, utilizando unas 45.000 trazas de razonamiento curadas (matemáticas, razonamiento general y seguimiento de instrucciones). El proceso de abliteration posterior, aplicado con Heretic v1.4.0, modifica los pesos de las proyecciones de atención y MLP para eliminar la dirección de rechazo, con parámetros específicos documentados (direction_index 20.01, pesos máximos/mínimos en `attn.o_proj` y `mlp.down_proj`). El drafter MTP fusionado permite decodificación especulativa, acelerando la generación en runtimes compatibles.

## Capacidades

- Generación de texto con razonamiento chain-of-thought: cada respuesta comienza con un bloque `thinking` aprendido de las trazas del teacher.
- Razonamiento matemático y lógico: mejora significativa en MMLU (CoT) respecto al base Qwen3.5-4B (+0,199 en flexible-extract), aunque con ligera regresión en GSM8K (−0,065).
- Function calling nativo según la especificación Qwen3.5, sin necesidad de fine-tuning adicional ni wrappers.
- Contexto largo de 262.144 tokens, adecuado para tareas que requieren ventanas extensas.
- Decodificación especulativa mediante el drafter MTP fusionado, que reduce la latencia en hardware compatible.
- Contenido sin censura (abliterated): rechaza solo 6 de cada 100 solicitudes frente a 99 de 100 en el modelo original.
- Multilingüe limitado: la model card declara únicamente inglés, aunque la arquitectura base podría soportar más idiomas.

## Casos de uso

- Atención al cliente automatizada sin restricciones temáticas: el modelo puede gestionar conversaciones multi-turno sobre cualquier tema gracias a su contexto de 262.144 tokens y su naturaleza sin censura, aunque requiere supervisión humana para evitar respuestas inapropiadas.
- Generación de código en producción: con function calling nativo y razonamiento de nivel frontier, puede integrarse en pipelines de CI/CD para autocompletado, revisión de código o generación de scripts, ejecutándose en GPU de consumo.
- Agentes autónomos de larga duración: la ventana de 262k tokens permite mantener el historial completo de interacciones y ejecutar tareas multi-paso con razonamiento encadenado, por ejemplo en automatización de workflows o navegación web.
- Asistente de investigación y análisis de documentos extensos: puede procesar informes, artículos o libros completos dentro del contexto, extrayendo conclusiones y respondiendo preguntas complejas.
- Creación de contenido creativo sin filtros: redacción de narrativa, guiones o diálogos con libertad temática, aprovechando la abliteration para evitar rechazos automáticos.
- Estudio de alineación y seguridad de modelos: su naturaleza reproducible (incluye scripts de reproducción) y sus métricas de KL divergence y refusals lo convierten en un banco de pruebas para investigar los efectos de la abliteration en modelos pequeños.

## Benchmarks y rendimiento

La model card del modelo original (empero-ai/Qwen3.8-4B) reporta los siguientes resultados, medidos con `lm-evaluation-harness` (backend HF, protocolos CoT). No se han publicado benchmarks específicos para la versión abliterated, pero la KL divergence de 0,0167 respecto al original sugiere un impacto mínimo en el rendimiento general.

| Tarea | Métrica | Qwen3.5-4B (base) | Qwen3.8-4B (destilado) | Δ |
|---|---|---|---|---|
| gsm8k_cot | exact_match (flexible) | 0,850 | 0,785 | −0,065 |
| gsm8k_cot | exact_match (strict) | 0,850 | 0,785 | −0,065 |
| mmlu (CoT, 57 materias) | acc (flexible-extract) | 0,354 | 0,553 | +0,199 |
| mmlu (CoT, 57 materias) | acc (strict-match) | 0,071 | 0,233 | +0,162 |

Condiciones de muestreo: `temperature=0.6, top_p=0.95, top_k=20`.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa unos 8 GB; en cuantizaciones GGUF típicas (Q4_K_M, Q5_K_M) el peso ronda 2,5–3,5 GB, por lo que cabe en GPUs de consumo con 6–8 GB de VRAM.
- GPUs recomendadas: RTX 3060 (12 GB) o superior, RTX 4070, RTX 4090 para mayor velocidad; también funciona en Apple Silicon con Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y runtimes con soporte Qwen3.5 como vLLM o SGLang (requiere kernels de Gated DeltaNet, `flash-linear-attention` y `causal_conv1d`).
- Latencia y throughput: no disponible; la decodificación especulativa con el drafter MTP puede reducir la latencia entre un 20% y un 50% en hardware compatible, aunque no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (CoT) | GSM8K (CoT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,3 B | 262.144 | 0,354 | 0,850 | Apache 2.0 | Hugging Face |
| empero-ai/Qwen3.8-4B (destilado) | 4,3 B | 262.144 | 0,553 | 0,785 | Apache 2.0 | Hugging Face |
| Este modelo (abliterated GGUF) | 4,3 B | 262.144 | No disponible (se espera similar al destilado) | No disponible | Apache 2.0 | Hugging Face |
| huihui-ai/Qwen3-4B-abliterated | 4 B | 32.768 (Qwen3 base) | No disponible | No disponible | Apache 2.0 | Hugging Face |

La comparativa directa con otros modelos abliterated de 4B es limitada; el modelo de huihui-ai se basa en Qwen3-4B (contexto 32k, sin destilación frontier) y no ofrece datos de benchmarks en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: la abliteration elimina los rechazos de contenido, lo que puede llevar a generar respuestas dañinas, ilegales o éticamente problemáticas. No se han evaluado los sesgos residuales tras la modificación de pesos.
- Riesgo de alucinación: como cualquier LLM de 4B, puede producir información falsa o inventada, especialmente en dominios especializados; la destilación no elimina este riesgo.
- Limitaciones de idioma: la model card declara únicamente inglés; el rendimiento en otros idiomas no está garantizado.
- Requisitos de runtime: sin los kernels de Gated DeltaNet (`flash-linear-attention` y `causal_conv1d`), la inferencia cae a operaciones PyTorch lentas y con alto consumo de memoria, lo que puede hacer inviable su uso en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el contenido generado sin censura puede incurrir en responsabilidades legales según el caso de uso.
- Reproducibilidad: aunque el autor afirma que el modelo es reproducible e incluye scripts en el directorio `reproduce`, no se detalla el hardware ni el tiempo necesario para replicar la abliteration.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-MTP-GGUF
- Modelo original (antes de abliteration): https://huggingface.co/empero-ai/Qwen3.8-4B
- Drafter MTP de referencia: https://huggingface.co/unsloth/Qwen3.5-4B-MTP-GGUF
- Base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Proyecto Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Informe técnico de Qwen3 (referencia de destilación): https://arxiv.org/pdf/2505.09388
