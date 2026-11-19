# orcarouter/Mistral-Large-4-1T-A52B-GGUF

## Resumen

Mistral-Large-4-1T-A52B-GGUF es una colección de cuantizaciones GGUF del modelo Mistral-Large-4-1T-A52B, publicada por orcarouter. El modelo original es un transformer de tipo mezcla de expertos (MoE) desarrollado por Mistral AI, con 1.049.357.365.536 parámetros totales y 52B parámetros activos por token, lo que lo sitúa en la categoría de modelos de un billón de parámetros con activación dispersa. Esta ficha se centra en la versión GGUF, pensada para ejecución local con llama.cpp.

La relevancia de esta publicación radica en que hace viable ejecutar un modelo de 1T de parámetros en hardware de un solo nodo: ofrece dos builds, Mix-256G (232,9 GB en memoria) y Mix-512G (492,2 GB), que caben respectivamente en máquinas de 256 GB y 512 GB de memoria (Mac de 512 GB, servidores en CPU o configuraciones de 2×H200 y 4×H200). El autor afirma que, a igual tamaño de archivo, sus builds presentan menor divergencia KL que los ficheros UD de unsloth del mismo tamaño.

El modelo incorpora atención MLA, atención dispersa de estilo DeepSeek con top-2048, un contexto de 1M de tokens, 128 expertos enrutados con top-4 más un experto compartido, soporte de visión mediante proyector mmproj y decodificación especulativa con el drafter DSpark de Mistral. La licencia es la Mistral Ecosystem Open Weight License, que no es de código abierto en sentido estricto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA y atención dispersa estilo DeepSeek (top-2048) |
| Parámetros totales | 1.049.357.365.536 (1T) |
| Parámetros activos | 52B por token (128 expertos enrutados, top-4, más 1 experto compartido) |
| Longitud de contexto | 1M tokens |
| Tipos de cuantización | GGUF mixta con búsqueda de precisión por grupo de capas de expertos (imatrix, KL divergence medida); builds Mix-256G (1,72 bpw en expertos) y Mix-512G (3,72 bpw en expertos) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar |
| Licencia | mistral-ecosystem-open-weight-license (license: other) |
| Formato de pesos | GGUF (llama.cpp); incluye proyector de visión mmproj y drafter DSpark para decodificación especulativa |
| Tamaño del repositorio | 732,2 GB |
| Pipeline | text-generation |
| Descargas / likes | 3.126 / 17 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 1 billón de parámetros totales y 52B activos por token. Emplea 128 expertos enrutados con enrutamiento top-4 más un experto compartido, atención MLA (Multi-head Latent Attention) y un mecanismo de atención dispersa de estilo DeepSeek con selección top-2048. El contexto declarado alcanza 1M de tokens. Los expertos enrutados representan el 98% de los pesos, por lo que la cuantización se concentra en ellos.

La innovación principal de esta publicación no está en el entrenamiento del modelo base, sino en el proceso de cuantización: cada grupo de capas de expertos recibió su propia precisión a partir de una búsqueda guiada por divergencia KL medida, en lugar de una regla fija manual. La evaluación se realizó contra un GGUF Q8_0 del checkpoint oficial en FP8, usando la KLD de vocabulario completo de llama.cpp sobre respuestas generadas por el propio modelo (prompts de UltraChat 200k, WildChat, Magicoder OSS-Instruct y OpenR1-Math), con temperatura 1.0 y top_p 0.95, y razonamiento variable low/medium/high renderizado como bloque `[THINK]`. Se midieron 64 ventanas de 2048 tokens sobre tokens del asistente, descartando respuestas truncadas. El conjunto de búsqueda de precisión fue distinto del conjunto de evaluación.

## Capacidades

- Generación de texto conversacional multi-turno en once idiomas.
- Razonamiento explícito con modo de pensamiento (`[THINK]`) y esfuerzo de razonamiento configurable (low, medium, high).
- Razonamiento matemático, evaluado con prompts de OpenR1-Math en el proceso de cuantización.
- Generación de código, con datos de Magicoder OSS-Instruct en la evaluación.
- Entrada de imágenes mediante el proyector de visión `mmproj` incluido en el repositorio.
- Decodificación especulativa con el drafter DSpark de Mistral, que según el autor acelera la generación entre 1,4 y 1,5 veces.
- Ejecución local con llama.cpp y compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Capacidad de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo de 1T en un solo nodo: con el build Mix-512G en una máquina de 512 GB de memoria (Mac de 512 GB, servidor en CPU o 4×H200) se obtiene un modelo cercano al original (97% de coincidencia en el siguiente token, perplejidad un 0,75% superior), adecuado para laboratorios que quieren evitar dependencia de API.
- Despliegue en hardware más modesto: el build Mix-256G permite ejecutar el modelo completo en 256 GB de memoria (Mac de 256 GB, PC en CPU o 2×H200), a costa de una calidad inferior (92% de coincidencia top-1, perplejidad un 8,7% superior), útil para prototipado y evaluación interna.
- Procesamiento de documentos largos: el contexto de 1M tokens permite analizar repositorios de código, expedientes o corpus documentales extensos en una sola pasada sin troceado.
- Asistentes conversacionales multilingües: el soporte de once idiomas (incluido español) y el modo de razonamiento configurable permiten ajustar el coste computacional según la complejidad de cada consulta.
- Análisis de imágenes con descripción y razonamiento: el proyector mmproj habilita tareas de preguntas y respuestas sobre imágenes combinadas con generación de texto largo.
- Generación de código asistida en local: el modelo se ha evaluado con datos de código (Magicoder OSS-Instruct) y puede integrarse en flujos de desarrollo que requieran confidencialidad y no puedan enviar código a servicios externos.
- Investigación sobre cuantización: los builds y su metodología de búsqueda de precisión por KLD medida sirven como referencia para estudiar el compromiso entre tamaño, bits por peso y fidelidad al modelo original.

## Benchmarks y rendimiento

Los datos publicados son métricas de fidelidad de la cuantización respecto al modelo original (Q8_0 del checkpoint FP8), no benchmarks de tareas estándar.

| Build | Memoria | bpw en expertos | KLD ↓ | Top-1 ↑ | PPL vs. original |
|---|---:|---:|---:|---:|---:|
| Mix-256G | 232,9 GB | 1,72 | 0,0975 | 91,6% | +8,7% |
| Mix-512G | 492,2 GB | 3,72 | 0,0129 | 96,9% | +0,75% |

El autor indica que, a igual tamaño de archivo, ambos builds presentan menor KLD que los ficheros UD-IQ1_S y UD-Q3_K_XL de unsloth: un 20% menos a 233 GB y un 13% menos a 492 GB, sobre texto no visto durante la búsqueda. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 232,9 GB para Mix-256G y 492,2 GB para Mix-512G, según el autor.
- Configuraciones admitidas por el autor: Mac de 256 GB o 512 GB, PC o servidor en CPU con esa memoria, 2×H200 (Mix-256G) y 4×H200 (Mix-512G).
- GPU consumer: no cabe en ninguna GPU consumer actual; el build más pequeño requiere 232,9 GB, muy por encima de los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. Solo es viable con memoria unificada de Apple de 256 GB o superior, o mediante offload a RAM del sistema.
- Opciones de despliegue: llama.cpp (formato nativo) y, por extensión del formato GGUF, herramientas compatibles como Ollama; el tag `endpoints_compatible` sugiere integración con gateways de API. El autor promociona Orca Connect para exponer el equipo local mediante su API compatible con OpenAI.
- Latencia y throughput: el autor afirma una aceleración de 1,4 a 1,5 veces con el drafter DSpark, pero no se publican cifras absolutas de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Large-4-1T-A52B (este GGUF) | 1T | 52B | 1M | Mistral Ecosystem Open Weight License | GGUF en Hugging Face |
| Mistral-Large-4-1T-A52B (original, FP8) | 1T | 52B | 1M | Mistral Ecosystem Open Weight License | Pesos originales en Hugging Face |
| unsloth/Mistral-Large-4-1T-A52B-GGUF (UD-IQ1_S, UD-Q3_K_XL) | 1T | 52B | 1M | Mistral Ecosystem Open Weight License | GGUF en Hugging Face |

La comparación directa disponible se limita a las cuantizaciones de unsloth del mismo modelo base: a igual tamaño de archivo, el autor reporta menor KLD para sus builds (20% menos a 233 GB, 13% menos a 492 GB). No se dispone de comparaciones con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- El build Mix-256G pierde calidad de forma apreciable: perplejidad un 8,7% superior al original y solo un 91,6% de coincidencia top-1, lo que puede degradar tareas sensibles al detalle.
- La licencia Mistral Ecosystem Open Weight License no es de código abierto: impone condiciones para uso comercial que deben revisarse antes de desplegar en producción.
- Los requisitos de memoria (232,9 GB mínimo) excluyen GPU consumer y limitan el despliegue a equipos de gama alta o servidores; el rendimiento en CPU puede ser bajo para uso interactivo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de tasas de alucinación en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- El modo de razonamiento con bloques `[THINK]` consume tokens adicionales y requiere gestionar el esfuerzo (low/medium/high) para controlar coste y latencia.
- La evaluación de la cuantización se basa en KLD y perplejidad sobre respuestas del propio modelo, no en benchmarks de tareas; la fidelidad estadística no garantiza el mismo rendimiento en tareas específicas.
- El repositorio ocupa 732,2 GB, lo que exige planificación de almacenamiento y ancho de banda de descarga considerables.

## Enlaces

- Repositorio GGUF: https://huggingface.co/orcarouter/Mistral-Large-4-1T-A52B-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Cuantizaciones de referencia de unsloth: https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Sitio del autor (OrcaRouter): https://www.orcarouter.ai
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Orca Connect: https://www.orcarouter.ai/solutions/orca-connect
- X del autor: https://x.com/OrcaRouter
- Discord del autor: https://discord.gg/yAh6Tex6kx
- GitHub del autor: https://github.com/Continuum-AI-Corp
