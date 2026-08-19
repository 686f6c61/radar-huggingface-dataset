# empero-ai/Qwen3.8-4B-Distill-GGUF

## Resumen

Qwen3.8-4B-Distill-GGUF es el conjunto de cuantizaciones GGUF del modelo Qwen3.8-4B, desarrollado por Empero, un laboratorio independiente de investigación en IA con sede en Alemania. Se trata de una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-4B, entrenada con aproximadamente 45.000 trazas de razonamiento del modelo profesor. El objetivo es trasladar las capacidades de razonamiento de un modelo masivo a un formato de 4.000 millones de parámetros ejecutable en hardware de consumo.

El modelo base emplea una arquitectura híbrida con capas Gated DeltaNet intercaladas con capas de atención completa, lo que requiere una versión reciente de llama.cpp con soporte para Qwen3.5 / Gated DeltaNet. Las cuantizaciones GGUF permiten ejecutarlo en llama.cpp, Ollama, LM Studio, Jan y KoboldCpp con tamaños de archivo que van desde 2,7 GB en Q4_K_M hasta 8,6 GB en BF16. El modelo está pensado para razonamiento con cadenas de pensamiento (CoT) y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas Gated DeltaNet y capas de atención completa (Qwen3.5) |
| Parametros totales | 4.326.350.848 (4,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo; la guía de VRAM menciona 256K en una variante similar, pero no se confirma para este modelo) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3.8-4B es una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-4B. La arquitectura es híbrida: por cada capa de atención completa hay tres capas Gated DeltaNet, un mecanismo de atención lineal con compuertas que reduce el coste del estado recurrente frente a la atención softmax estándar. Esta hibridación permite mantener una ventana de contexto larga con un coste de memoria de caché KV reducido, aunque requiere soporte específico en el runtime.

El entrenamiento se realizó sobre aproximadamente 45.000 trazas de razonamiento (cadenas de pensamiento) generadas por el modelo profesor Qwen3.8 2.4T, extraídas de los conjuntos de datos internos de destilación de Empero. No se indica el uso de RLHF ni DPO en la información disponible. Los pesos se distribuyen tal cual, heredando la licencia Apache-2.0 del modelo base Qwen3.5-4B.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo abre cada respuesta con un bloque ` thinking` antes de la respuesta final, siguiendo el protocolo de cadenas de pensamiento.
- Razonamiento matemático y lógico: mejora sustancial en MMLU con CoT respecto al modelo base (0,553 frente a 0,354), aunque con una ligera regresión en GSM8K (0,785 frente a 0,850).
- Capacidad multilingüe limitada: la model card declara únicamente inglés como idioma soportado.
- Integración con runtimes GGUF estándar: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp mediante plantilla de chat incrustada en el archivo.
- Sin soporte documentado de tool calling, función de visión ni capacidades multimodales en la información disponible.

## Casos de uso

- Razonamiento y análisis en local: el modelo puede generar explicaciones paso a paso para problemas de lógica y matemáticas en equipos sin GPU dedicada, gracias a las cuantizaciones Q4_K_M y Q5_K_M que caben en 4-6 GB de VRAM o incluso en CPU.
- Asistente de documentación técnica en inglés: con su ventana de contexto amplia (heredada de la arquitectura Qwen3.5), puede resumir y responder preguntas sobre documentos extensos en entornos de desarrollo.
- Prototipado de agentes conversacionales: al ser un modelo de razonamiento, puede estructurar respuestas complejas en entornos de chatbot donde se requiera justificación de decisiones.
- Educación y tutoría en STEM: su rendimiento en MMLU (0,553 con CoT) lo hace adecuado para generar explicaciones didácticas de conceptos científicos en inglés.
- Despliegue en edge computing: las cuantizaciones pequeñas (2,7 GB) permiten ejecutarlo en dispositivos con poca memoria, como mini-PCs o portátiles antiguos, mediante llama.cpp.
- Evaluación de destilación de modelos: sirve como referencia para estudiar cómo se transfieren las capacidades de razonamiento de un modelo masivo a uno pequeño mediante destilación de trazas CoT.

## Benchmarks y rendimiento

La model card del GGUF incluye resultados del modelo fuente (Qwen3.8-4B) comparados con el modelo base Qwen3.5-4B, obtenidos con protocolos CoT y `lm-evaluation-harness` en condiciones idénticas:

| Tarea | Qwen3.5-4B (base) | Qwen3.8-4B | Delta |
|---|---:|---:|---:|
| MMLU (CoT, 57 materias) | 0,354 | 0,553 | +0,199 |
| GSM8K (CoT) | 0,850 | 0,785 | -0,065 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GPQA, etc.) en la información disponible.

## Requisitos de hardware

- Q4_K_M (2,783 GB) y Q5_K_M (3,161 GB): cómodos en tarjetas de 4-6 GB de VRAM; también funcionan bien solo con CPU.
- Q6_K (3,563 GB) y Q8_0 (4,611 GB): recomendados 6-8 GB de VRAM.
- BF16 (8,666 GB): requiere 12 GB o más de VRAM.
- La caché KV es el factor dominante en contextos largos; puede ser necesario descargar parte del modelo a CPU aunque los pesos quepan en VRAM.
- Despliegue compatible con llama.cpp, Ollama, LM Studio, Jan y KoboldCpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (CoT) | GSM8K (CoT) | Licencia |
|---|---|---|---:|---:|---|
| Qwen3.8-4B (Empero) | 4,3 B | no disponible | 0,553 | 0,785 | Apache-2.0 |
| Qwen3.5-4B (Alibaba) | 4 B | no disponible | 0,354 | 0,850 | Apache-2.0 |
| Qwen3.8 2.4T A95B (profesor) | 2,4 T (95 B activos) | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card. No se dispone de comparaciones con otros modelos de 4B como Llama 3.2 3B o Gemma 3 4B en la información proporcionada.

## Limitaciones y advertencias

- Requiere una versión reciente de llama.cpp con soporte para Qwen3.5 / Gated DeltaNet; las versiones antiguas no cargarán la arquitectura.
- El modelo es un modelo de razonamiento: todas las respuestas abren con un bloque ` thinking` que debe eliminarse antes de mostrar la salida al usuario final.
- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- Regresión en GSM8K respecto al modelo base Qwen3.5-4B (0,785 frente a 0,850), lo que indica que la destilación no mejora todas las capacidades de forma uniforme.
- La longitud de contexto no se especifica en la model card; la guía de VRAM advierte que la caché KV puede requerir descarga a CPU en contextos largos.
- No hay información sobre sesgos, riesgos de alucinación ni evaluación de seguridad en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero los pesos se comparten "tal cual" sin garantías adicionales.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill-GGUF
- Modelo base (safetensors): https://huggingface.co/empero-ai/Qwen3.8-4B
- Modelo base original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio web de Empero: https://empero.org
- Perfil de Empero en HuggingFace: https://huggingface.co/empero-ai
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio con información sobre la destilación Qwen3.8 (2B/4B/9B): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
