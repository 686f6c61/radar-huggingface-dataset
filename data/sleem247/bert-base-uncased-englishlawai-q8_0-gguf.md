# Sleem247/bert-base-uncased-EnglishLawAI-Q8_0-GGUF

## Resumen

`Sleem247/bert-base-uncased-EnglishLawAI-Q8_0-GGUF` es una conversión al formato GGUF del modelo `Makabaka/bert-base-uncased-EnglishLawAI`, un ajuste fino de BERT-base (arquitectura encoder-only) orientado al dominio legal en inglés. El autor de la conversión, Sleem247, ha empaquetado los pesos originales en cuantización Q8_0 mediante la herramienta GGUF-my-repo de ggml.ai, lo que permite ejecutar el modelo con llama.cpp en CPU y GPU consumer sin necesidad de frameworks de deep learning completos.

El modelo subyacente parte de `bert-base-uncased`, con 108.891.648 parámetros (aproximadamente 110 millones, coherente con BERT-base), y fue afinado por Makabaka sobre un corpus legal en inglés. La tarea declarada en el pipeline es `feature-extraction`, es decir, extracción de representaciones vectoriales (embeddings) más que generación de texto autoregresiva. Es relevante ahora por su carácter ligero y desplegable localmente, útil para clasificación, búsqueda semántica y recuperación de documentos legales en entornos con recursos limitados.

Conviene subrayar que, pese a las etiquetas `llama-cpp` y `gguf`, el modelo original es un encoder BERT y no un LLM generativo: su uso principal es producir embeddings o servir de base para tareas de clasificación/NER, no para chat libre. La información disponible sobre el proceso de entrenamiento, datos y benchmarks es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder-only, 12 capas, hidden 768) según el modelo base `bert-base-uncased` |
| Parametros totales | 108.891.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo del README usa `-c 2048` |
| Tipos de cuantizacion | Q8_0 (única variante publicada en este repo) |
| Idiomas soportados | no disponibles (el modelo base es `bert-base-uncased`, orientado a inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`bert-base-uncased-englishlawai-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base es `bert-base-uncased`, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabeceras de atención, preentrenado originalmente con objetivos de masked language modeling y next sentence prediction sobre texto en inglés sin distinción de mayúsculas. Sobre esta base, Makabaka realizó un ajuste fino específico para el dominio legal en inglés (`EnglishLawAI`), aunque la model card no detalla el corpus, el número de tokens, la composición del dataset ni si hubo etapas de RLHF/DPO (en un encoder no aplican de forma habitual).

La conversión a GGUF la realiza Sleem247 mediante la herramienta GGUF-my-repo de ggml.ai, que empaqueta los pesos en cuantización Q8_0 (8 bits por peso, aproximadamente). No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). No hay información disponible sobre hiperparámetros de entrenamiento, régimen de entrenamiento ni evaluación del ajuste fino.

## Capacidades

- Extracción de características y embeddings para texto legal en inglés (tarea declarada `feature-extraction`).
- Codificación de frases y documentos para búsqueda semántica y similitud vectorial.
- Base potencial para clasificación de texto, etiquetado de secuencias (NER) y otras tareas de entendimiento, dado el ajuste fino legal.
- Ejecución local mediante llama.cpp en CPU y GPU, sin dependencias de PyTorch.
- No se documenta soporte de tool calling, function calling ni agentes (no aplica a un encoder BERT).
- No se documenta capacidad multilingüe; el modelo base es de inglés (`uncased`).
- No se documenta modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Búsqueda semántica de documentación legal: generar embeddings de contratos, cláusulas y jurisprudencia para alimentar un índice vectorial y recuperar pasajes relevantes por similitud coseno.
- Clasificación de documentos legales: usar las representaciones del encoder como entrada a un clasificador para categorizar contratos, demandas o resoluciones por tipo o materia.
- Extracción de entidades en textos jurídicos: servir de base para modelos de NER afinados sobre terminología legal (partes, fechas, importes, referencias normativas).
- Deduplicación y agrupamiento de cláusulas: comparar embeddings de fragmentos para detectar textos repetidos o agrupar cláusulas equivalentes en grandes repositorios.
- Enrutamiento y triaje en atención legal: clasificar consultas entrantes por área de práctica antes de derivarlas a un especialista.
- Despliegue en entornos con recursos limitados: al pesar aproximadamente 0,1 GB en Q8_0, puede ejecutarse en portátiles y servidores modestos vía llama.cpp, útil para prototipos o pipelines on-premise.
- Filtrado previo en pipelines RAG: usar los embeddings como primera etapa de recuperación antes de un LLM generativo, reduciendo coste de contexto.

## Benchmarks y rendimiento

La model-index del autor declara una entrada (`bert-base-uncased-issues-128`) pero sin resultados (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa aproximadamente 0,1 GB en Q8_0; la inferencia cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) y en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU NVIDIA con soporte CUDA (GTX 16xx en adelante) acelera la inferencia. Para cargas por lotes grandes, A100/H100 aportan throughput, pero el modelo es pequeño.
- Cabe en GPU consumer: sí, con amplio margen (menos de 1 GB de pesos).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier runtime compatible con GGUF. No se documenta soporte en vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sleem247/bert-base-uncased-EnglishLawAI-Q8_0-GGUF | 108.891.648 | no disponible | feature-extraction (legal, inglés) | apache-2.0 | GGUF en HF |
| Makabaka/bert-base-uncased-EnglishLawAI (original) | ~110 M (BERT-base) | no disponible | feature-extraction (legal, inglés) | no disponible en la información | safetensors en HF |
| bert-base-uncased (Google) | ~110 M | 512 tokens (estándar BERT) | feature-extraction / MLM | apache-2.0 | safetensors en HF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo encoder-only: no genera texto libre de forma fiable; usarlo como chatbot produciría resultados pobres.
- Sesgos: al derivar de `bert-base-uncased` y de un corpus legal no documentado, puede heredar sesgos de género, origen o terminología presentes en los datos de entrenamiento; no se han publicado análisis de sesgo.
- Riesgo de alucinación: bajo en tareas de clasificación/embeddings, pero el ajuste fino no está evaluado; no debe usarse como fuente de asesoramiento legal sin validación humana.
- Idiomas: probablemente limitado al inglés; no se documenta soporte multilingüe.
- Contexto: longitud máxima no documentada; el ejemplo del README usa 2048, pero BERT-base estándar se limita a 512 tokens, por lo que textos largos requerirán troceado.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base original.
- Producción: repo con 0 descargas y 0 likes, sin benchmarks ni validación externa; tratar como experimental y evaluar en el dominio concreto antes de desplegar.

## Enlaces

- Repo Hugging Face: https://huggingface.co/Sleem247/bert-base-uncased-EnglishLawAI-Q8_0-GGUF
- Modelo base original: https://huggingface.co/Makabaka/bert-base-uncased-EnglishLawAI
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp: https://github.com/ggerganov/llama.cpp
