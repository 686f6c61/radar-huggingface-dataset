# Mungert/Nanbeige4.2-3B-GGUF

## Resumen

Nanbeige4.2-3B es un modelo compacto de tipo agéntico construido sobre Nanbeige4.2-3B-Base y publicado bajo licencia Apache 2.0. Su rasgo arquitectónico principal es el uso de un *Looped Transformer*: reutiliza las mismas capas del transformer en varias pasadas para aumentar la capacidad efectiva del modelo sin incrementar el número de parámetros. Con 4.169.800.704 parámetros totales (de los cuales aproximadamente 3B son no-embedding), el modelo se posiciona en la franja de 3-4B, pero su entrenamiento está orientado de forma explícita a tareas de agente: uso de herramientas, agentes de oficina y agentes de código.

La relevancia de esta ficha concreta es que se trata de la versión cuantizada en GGUF publicada por el usuario Mungert, generada con llama.cpp en el commit `344be0a60`. Esto permite ejecutar el modelo en local con llama.cpp, Ollama u otros motores compatibles con GGUF, algo especialmente interesante dado el enfoque del modelo hacia asistentes personales locales (por ejemplo, con scaffolds tipo OpenClaw). El autor del modelo afirma que supera a Qwen3.5-9B y Gemma4-12B en benchmarks de agente y código, pese a tener un tercio de los parámetros.

Los idiomas declarados son inglés y chino. La información disponible no incluye la longitud de contexto soportada, los niveles de cuantización concretos incluidos en el repositorio ni la composición detallada del dataset de entrenamiento; estos datos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura *Looped* (reutilización de capas); incluye mejoras LoopSplit, mHC con *depth attention* y *n-gram embeddings* concatenados en `modeling_nanbeige.py` |
| Parametros totales | 4.169.800.704 (~4B) |
| Parametros activos | No aplica (no es MoE); ~3B no-embedding según el autor |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF generado con llama.cpp (commit `344be0a60`); niveles concretos no listados en la información disponible. Tamaño del repo: 109,7 GB |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors: Nanbeige/Nanbeige4.2-3B-Base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con reutilización de capas (*Looped Transformer*): el modelo aplica repetidamente un mismo bloque de capas para incrementar la profundidad efectiva sin añadir parámetros. Según la model card, el archivo `modeling_nanbeige.py` incorpora además mejoras arquitectónicas más recientes (LoopSplit, mHC con *depth attention* y *n-gram embeddings* concatenados) que se integrarán en Nanbeige4.5, cuyo entrenamiento estaba en curso en el momento de publicación. El modelo parte de Nanbeige4.2-3B-Base y se afina después para comportamiento agéntico y alineación.

El entrenamiento consta de dos fases descritas por el autor. En la fase de *supervised fine-tuning* (SFT) se amplía la diversidad de entornos mediante integraciones de entornos reales y síntesis de entornos a gran escala, diversificando tipos de tarea, activos y *scaffolds* agénticos; el filtrado de datos se aplica tanto a nivel de trayectoria como de turno, combinando validación por casos de prueba con evaluación por rúbricas. En la fase de *reinforcement learning* (RL) se combinan recompensas de resultado y de proceso para estabilizar el entrenamiento en un modelo de tamaño reducido. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Comportamiento agéntico: uso complejo de herramientas (*tool use*), agentes de oficina y agentes de código.
- Razonamiento matemático, científico y de código, continuando la línea de Nanbeige4.1-3B.
- Soporte de *function calling* / *tool calling* implícito en su entrenamiento agéntico (evaluado en MCP-Atlas y Agent-IF-Oneday).
- Ejecución de tareas multi-paso en *scaffolds* agénticos orientados a flujos personales (mencionado con OpenClaw).
- Capacidad de operar en terminal y resolución de issues de software (evaluado en SWE-Bench Verified/Pro y Terminal-Bench 2.0).
- Integración declarada con endpoints compatibles (tag `endpoints_compatible`).
- No se declaran capacidades de visión, audio ni *thinking mode* explícito en la información disponible.

## Casos de uso

- Asistente personal local: combinado con un *scaffold* agéntico tipo OpenClaw, el modelo puede encadenar tareas de asistencia diaria, ofimática e investigación profunda en una máquina de sobremesa, al caber en GPU de consumo en formato GGUF cuantizado.
- Automatización de oficina: generación y manipulación de documentos, hojas de cálculo y correos dentro de flujos multi-paso; el modelo fue evaluado específicamente en Office-QA-Pro y Agent-IF-Oneday, lo que indica ajuste a este tipo de tareas.
- Agente de código en CI/CD: resolución de issues y modificación de repositorios (63,6 en SWE-Bench Verified según el autor) permite integrarlo en pipelines que abren *pull requests* automáticas o aplican parches sobre failing tests.
- Automatización de terminal y operaciones: con 44,1 en Terminal-Bench 2.0, es adecuado para agentes que ejecutan comandos, diagnostican errores y reparan entornos de desarrollo.
- Integración de herramientas vía MCP: su rendimiento en MCP-Atlas (57,8) lo hace apto como cerebro de un cliente MCP que orquesta servidores de herramientas diversos.
- Despliegue *edge* y prototipado rápido: al ser un GGUF de ~4B, sirve para validar ideas de agentes en portátiles o estaciones sin GPU de datacenter antes de escalar a modelos mayores.
- Investigación en arquitecturas *looped*: útil como referencia práctica para estudiar el equilibrio entre reutilización de capas, capacidad efectiva y coste de inferencia.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo en la model card. La tabla original está truncada en la información disponible: las filas posteriores a GPQA-Diamond (empezando por HMMT-Feb-2026) no se pudieron recuperar, por lo que se omiten.

| Benchmark | Nanbeige4.2-3B | Qwen3.5-9B | Qwen3.5-4B | Gemma4-12B | Gemma4-E4B |
|---|---|---|---|---|---|
| Parámetros totales | 4B | 10B | 5B | 12B | 8B |
| Parámetros no-embedding | 3B | 8B | 4B | 10B | 4B |
| GDPval rubrics | 74,3 | 61,9 | 46,7 | 68,5 | 31,5 |
| Agent-IF-Oneday | 67,5 | 60,4 | 56,9 | — | — |
| Office-QA-Pro | 21,1 | 15,8 | 8,3 | 15,3 | 3,1 |
| Pinch-Bench-V2 | 74,7 | 68,2 | 63,9 | 53,8 | 33,3 |
| Claw-Gym | 65,0 | 56,1 | 53,0 | 40,8 | 16,4 |
| Claw-Eval (pass^3) | 52,2 | 47,1 | 36,9 | 25,5 | 15,9 |
| MCP-Atlas | 57,8 | 47,4 | 40,8 | 30,5 | 15,0 |
| SWE-Bench Verified | 63,6 | 53,1 | 38,8 | 44,2 | 14,0 |
| SWE-Bench Pro | 46,9 | 33,8 | 29,4 | 21,9 | 4,0 |
| Terminal-Bench 2.0 | 44,1 | 29,2 | 25,8 | 21,1 | 12,4 |
| HLE sin búsqueda | 17,8 | 12,5 | 6,8 | 14,8 | 4,0 |
| SciCode | 35,6 | 32,7 | 22,7 | 38,2 | 24,9 |
| GPQA-Diamond | 87,4 | 81,7 | 78,2 | 78,8 | 60,6 |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible. El autor afirma además que Nanbeige4.2-3B encabeza el ranking de modelos pequeños de Artificial Analysis, si bien esa referencia no se puede verificar con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo propio a partir de 4,17B parámetros, no dato del autor): ~2,5-3 GB en Q4_K_M, ~4,5-5 GB en Q8_0, ~8,5 GB en FP16. El contexto efectivo impacta directamente en el consumo de KV cache; al no conocerse la longitud de contexto, debe validarse empíricamente.
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) para cuantizaciones Q4/Q8; A100, H100 o L40S para servir en FP16 con concurrencia alta o contextos largos.
- Cabe en GPU de consumo: sí, en Q4 y Q8 prácticamente en cualquier GPU moderna con 8 GB; en FP16 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama y derivados, servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI (verificar soporte de la arquitectura *looped* en dichos motores, ya que requiere `modeling_nanbeige.py` personalizado).
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo denso de ~4B en Q4 sobre una RTX 4090 suele quedar en decenas de tokens por segundo, pero no hay mediciones publicadas para esta variante.
- Nota: el repositorio ocupa 109,7 GB, lo que sugiere que contiene múltiples niveles de cuantización (incluidos probablemente FP16 y variantes grandes); conviene descargar solo el archivo del nivel deseado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Punto fuerte declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.2-3B (esta ficha, GGUF) | 4B (3B no-embedding) | no disponible | Agentes, código, razonamiento a escala 3B | Apache 2.0 | GGUF en HF; base en safetensors |
| Qwen3.5-4B | 5B (4B no-embedding) | no disponible | Base comparable, referencia del autor | no disponible en esta información | no disponible en esta información |
| Qwen3.5-9B | 10B (8B no-embedding) | no disponible | Modelo mayor con el que se compara | no disponible en esta información | no disponible en esta información |
| Gemma4-12B | 12B (10B no-embedding) | no disponible | Razonamiento científico (SciCode 38,2) | no disponible en esta información | no disponible en esta información |
| Gemma4-E4B | 8B (4B no-embedding) | no disponible | Variante eficiente | no disponible en esta información | no disponible en esta información |

En la comparativa publicada por el autor, Nanbeige4.2-3B gana en todos los benchmarks de agente y código listados frente a modelos de hasta 12B, y solo cede en SciCode frente a Gemma4-12B. Se trata de cifras aportadas por el propio autor, sin verificación independiente en la información disponible.

## Limitaciones y advertencias

- La model card de esta variante GGUF es una plantilla de cuantización de Mungert: no añade evaluación propia, por lo que el rendimiento real de las versiones cuantizadas puede degradarse respecto al modelo original en FP16/BF16.
- Los benchmarks presentados los publica el autor del modelo; no se dispone de verificación independiente ni de detalles sobre el *harness* de evaluación.
- Riesgo de alucinación inherente a modelos de 3-4B: la puntuación en HLE sin búsqueda (17,8) indica capacidad de razonamiento limitada en problemas de alta dificultad, y Office-QA-Pro se sitúa en 21,1 sobre 100, lo que sugiere margen de error notable en tareas de oficina complejas.
- Cobertura lingüística restringida a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Longitud de contexto desconocida: no se debe asumir soporte de contextos largos en producción sin pruebas previas.
- Licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribución y revisar las licencias del modelo base y de los datos de entrenamiento, no detalladas aquí.
- La arquitectura *looped* requiere código de modelado personalizado; la compatibilidad con motores de inferencia estándar (vLLM, TGI) no está confirmada y puede requerir `trust_remote_code`.
- Fecha de creación del repositorio y referencia arXiv (2607.22083) exigen verificar la vigencia y la disponibilidad real del informe técnico antes de citarlo.
- El tamaño del repo (109,7 GB) implica costes de descarga y almacenamiento considerables si se clona completo en lugar de archivos individuales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mungert/Nanbeige4.2-3B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B-Base
- Informe técnico (arXiv): https://arxiv.org/abs/2607.22083
- Código de modelado: https://huggingface.co/Nanbeige/Nanbeige4.2-3B/blob/main/modeling_nanbeige.py
- Modelo predecesor: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
- llama.cpp (commit usado): https://github.com/ggerganov/llama.cpp/commit/344be0a60074e6395da3c4a4f300f7361df5a67d
- Guía de selección de formato GGUF del cuantizador: https://readyforquantum.com/huggingface_gguf_selection_guide.html
- Artículo de Artificial Analysis citado por el autor: https://artificialanalysis.ai/articles/mobile-phone-intelligence-inference
