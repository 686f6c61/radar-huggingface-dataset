# ProjectAstroAI/Sonke-1.5-350M

## Resumen

Sonke-1.5-350M es un modelo de lenguaje de tipo decoder-only de 350 millones de parámetros desarrollado por ProjectAstroAI. Se trata de un reentrenamiento fino (finetune) del modelo Sonke-1.0-350M, orientado a generación de texto en inglés y publicado bajo licencia Apache 2.0. Su relevancia radica en que es un modelo pequeño (small-lm) pensado para escenarios con recursos limitados, donde el coste de inferencia y el espacio de despliegue son críticos.

El modelo se distribuye a través de Hugging Face con la librería transformers y la etiqueta `endpoints_compatible`, lo que indica compatibilidad con los endpoints de inferencia gestionados de Hugging Face. La model card pública no incluye detalles sobre la arquitectura interna (más allá de ser un transformer decoder-only), la longitud de contexto ni los datos exactos de entrenamiento en cuanto a número de tokens.

La información disponible se limita a la ficha de Hugging Face y a la lista de datasets empleados en el entrenamiento. No se han publicado resultados de benchmarks ni especificaciones detalladas de contexto o cuantización, por lo que esta ficha marca explícitamente como "no disponible" todos los datos que no figuran en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido de la pipeline text-generation; no detallado en la model card) |
| Parámetros totales | 350M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors por el uso de transformers, pero no confirmado) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un transformer de generación de texto de 350M de parámetros, sin especificar el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto. El modelo es un finetune de ProjectAstroAI/Sonke-1.0-350M, por lo que hereda la arquitectura base de la versión 1.0, cuyos detalles tampoco se detallan en la información disponible.

Respecto a los datos de entrenamiento, la model card enumera una mezcla de datasets que combina corpus web de alta calidad (finepdfs_edu, finephrase, Ultra-FineWeb-L3), datos de código y matemáticas (UltraData-Code, UltraData-Math, Code-Reasoning, Math-Reasoning), datos de instrucciones y comportamientos (TxT360-v2, Pretrain-Behaviors), Wikipedia y varios conjuntos especializados de NVIDIA para preentrenamiento y SFT (Nemotron-Pretraining-Specialized-v1.2, Nemotron-SFT-Competitive-Programming-v2, Nemotron-SFT-Math-v4, Nemotron-SFT-Science-v2, Nemotron-SFT-Instruction-Following-Chat-v3, Nemotron-Cascade-2-SFT-Data). No se especifica el número total de tokens, la proporción de cada fuente ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con foco en contenido educativo y de propósito general (según los datasets de preentrenamiento utilizados).
- Razonamiento sobre código y matemáticas, dado el uso de UltraData-Code, UltraData-Math, Code-Reasoning, Math-Reasoning y Nemotron-SFT-Competitive-Programming-v2.
- Instrucciones conversacionales y seguimiento de instrucciones, respaldado por Nemotron-SFT-Instruction-Following-Chat-v3 y Nemotron-Cascade-2-SFT-Data.
- Conocimiento científico, por la inclusión de Nemotron-SFT-Science-v2 y Wikipedia en el corpus.
- Capacidad multilingüe limitada: solo se declara inglés como idioma soportado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Clasificación y etiquetado de texto en pipelines de bajo coste: al ser un modelo de 350M, puede desplegarse en CPU o en GPUs de gama baja para tareas de clasificación, extracción de entidades o enrutamiento de consultas, con latencia reducida y sin necesidad de hardware especializado.
- Generación de texto asistida en inglés para aplicaciones educativas: dado el peso de los datasets educativos (finepdfs_edu, fineweb_edu), el modelo puede emplearse para resumir o reformular material didáctico en inglés.
- Autocompletado y generación de borradores en herramientas de escritura: su tamaño compacto permite integrarlo en editores o extensiones con presupuestos de latencia estrictos.
- Asistencia en tareas de programación de complejidad baja: el corpus incluye datos de código y programación competitiva, por lo que puede sugerir fragmentos de código o explicar errores sencillos en entornos de desarrollo.
- Filtrado y preprocesado de datos en pipelines de ML: puede usarse como modelo auxiliar para puntuar o filtrar textos antes de pasarlos a modelos de mayor tamaño, reduciendo el coste computacional global.
- Prototipado rápido e investigación: al ser un modelo pequeño con licencia Apache 2.0, es adecuado para experimentos de investigación, ablations y pruebas de concepto que requieran ejecución local sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 350M de parámetros, en precisión completa (fp32) ocuparía aproximadamente 1,4 GB; en fp16/bfloat16, alrededor de 0,7 GB; en cuantización de 8 bits, unos 0,35 GB; y en 4 bits, aproximadamente 0,18 GB (estimaciones basadas en el número de parámetros, no en datos publicados del modelo).
- GPU recomendadas: cualquier GPU consumer moderna puede alojar el modelo, incluidas RTX 3060, RTX 4060, RTX 4090, así como GPUs de datacenter (A100, H100) para despliegues de alto throughput.
- Cabe en GPU consumer: sí, con holgura en cualquier GPU con 2 GB o más de VRAM, e incluso puede ejecutarse en CPU.
- Opciones de despliegue: transformers (librería declarada), endpoints de Hugging Face (etiqueta endpoints_compatible). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sonke-1.5-350M | 350M | No disponible | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 360M | 8K (según su model card pública) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 500M | 32K (según su model card pública) | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2K (según su model card pública) | Apache 2.0 | Hugging Face |

La comparación con alternativas se limita a parámetros y licencia, ya que no se han publicado benchmarks de Sonke-1.5-350M que permitan contrastar rendimiento. Los datos de contexto de los modelos comparados provienen de sus model cards públicas y no de la información proporcionada para Sonke.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas, incluido el castellano, no está garantizado.
- No se han publicado evaluaciones de sesgos, alucinación ni robustez, por lo que su comportamiento en producción es incierto.
- Al ser un modelo de 350M, su capacidad de razonamiento complejo y conocimiento factual es limitada en comparación con modelos de mayor tamaño; es propenso a errores en tareas que requieran conocimiento profundo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio concreto antes de desplegarlo.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ProjectAstroAI/Sonke-1.5-350M
- Modelo base: https://huggingface.co/ProjectAstroAI/Sonke-1.0-350M
