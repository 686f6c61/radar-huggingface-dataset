# Lambent/RWKV7-7.2B-midtrain50-docs-lora

## Resumen

El modelo **Lambent/RWKV7-7.2B-midtrain50-docs-lora** es un adaptador LoRA (QLoRA rank 128) desarrollado por el usuario Lambent sobre el modelo base **RWKV-7 "Goose" 7.2B** (RWKV/RWKV7-7.2B-20260805). Su objetivo principal es mejorar el manejo de documentos largos y dependencias de largo alcance, reduciendo la "contaminación de estado" que se acumula en el estado interno del modelo cuando se procesan secuencias muy extensas. El adaptador se entrenó con 50 millones de tokens procedentes de una mezcla diversa de fuentes: bibliotecas hebreas, textos sagrados, proyectos Gutenberg, wikisource, matemáticas, código y datos de alta calidad (FineWeb2-HQ, DCLM-baseline, arXiv). La arquitectura RWKV-7 combina lo mejor de un RNN y un transformer: atención libre (100% attention-free), complejidad lineal en tiempo y espacio constante (sin KV-cache), lo que permite contextos teóricamente infinitos y entrenamiento rápido.

El adaptador está diseñado para el entrenamiento de contexto largo con ventanas de gradiente de 12k tokens y documentos de hasta 256k. Se ha probado a 56k tokens (196KB) y reporta una "fuerte reducción de la contaminación de estado en contextos largos" y una "ligera ventaja en benchmarks de harness en inglés a este tamaño". No se proporcionan números concretos de benchmarks. El modelo se publica bajo licencia Apache 2.0 y el repositorio ocupa 1.2 GB (pesos del adaptador en formato safetensors). Es un recurso relevante para aplicaciones que requieren procesar documentos muy largos, como análisis legal, histórico, de investigación o conversaciones de contexto extendido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 "Goose" (RNN híbrido con atención lineal, 100% attention-free) |
| Parámetros totales | 7.2 mil millones (modelo base) + adaptador LoRA rank 128 |
| Parámetros activos | no disponible (no es un MoE) |
| Longitud de contexto | Teóricamente infinito (RWKV-7); entrenado con documentos de hasta 256k tokens, probado a 56k tokens |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base se puede cuantizar (GGUF, FP16, etc.) |
| Idiomas soportados | No disponibles; por los datasets de entrenamiento se infieren hebreo, inglés, matemáticas y código |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base **RWKV-7 7.2B** es un modelo de lenguaje autoregresivo que combina características de RNN y Transformer. Su arquitectura utiliza atención lineal y un estado recurrente constante, lo que permite procesar secuencias de longitud arbitraria sin KV-cache y con complejidad O(1) en memoria. El adaptador LoRA de Lambent se entrena sobre este base con QLoRA (rank 128) para ajustar el comportamiento en contextos largos. Los datos de entrenamiento incluyen bibliotecas hebreas (Sefaria, community-datasets), wikisource, Project Gutenberg, open-web-math, algebraic-stack, swallow-math-v2, starcoderdata, dclm-baseline, fineweb-edu, arXiv-CC0, SuperWikiNEXT-32B, FineWeb2-HQ y un dataset privado de logs de Discord para entrenamiento de diálogo con contexto indefinido. El entrenamiento se realizó con 50 millones de tokens (180 pasos) con una tasa de aprendizaje de 3e-5 y un schedule WSD. Se utilizó la ruta de Flash Attention y se verificó la consistencia con las rutas de modelado estándar. El objetivo principal es eliminar la penalización de predicción por contaminación del estado a largo plazo, lo que se probó a 56k tokens.

## Capacidades

- Generación de texto autoregresivo con contexto largo (documentos de hasta 256k tokens en entrenamiento).
- Razonamiento y comprensión de dependencias de largo alcance en documentos extensos.
- Generación de código y matemáticas (por los datasets de entrenamiento).
- Procesamiento de idiomas menos continuos o "token-hungry" (p.ej., hebreo) gracias a la reducción de contaminación del estado.
- Soporte de diálogo de contexto indefinido (debido al dataset privado de Discord).
- Compatible con el conjunto de herramientas del ecosistema RWKV (vLLM, llama.cpp, Ollama, etc.) al basarse en el modelo base.

## Casos de uso

- **Análisis de documentos legales**: el modelo puede procesar contratos, sentencias o expedientes de miles de páginas (hasta 256k tokens) manteniendo el contexto de cláusulas previas, lo que facilita la extracción de información o la generación de resúmenes coherentes.
- **Procesamiento de corpus históricos**: con textos de bibliotecas hebreas y Gutenberg, puede realizar tareas de búsqueda semántica, clasificación o traducción de documentos antiguos extensos.
- **Asistentes de investigación académica**: al manejar artículos de arXiv y libros de larga extensión, puede responder preguntas sobre resultados previos o comparar secciones distantes de un mismo documento.
- **Generación de código en repositorios grandes**: el entrenamiento con starcoderdata permite sugerir código o completar funciones en proyectos con miles de líneas, aprovechando el contexto extendido para entender el estilo y las dependencias.
- **Conversación con memoria extendida**: el dataset de Discord entrenado para diálogo permite que el modelo mantenga el hilo de una conversación a lo largo de muchas interacciones, útil para asistentes virtuales de atención al cliente o herramientas de soporte técnico.
- **Procesamiento de texto matemático**: con datasets de open-web-math y algebraic-stack, puede resolver problemas de álgebra o cálculo que requieren recordar pasos intermedios en contextos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una "ligera ventaja en benchmarks de harness de inglés a este tamaño" y una "fuerte reducción de contaminación de estado en contextos largos", pero no se especifican métricas numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: el modelo base de 7.2B parámetros en bf16 requiere ~15 GB de VRAM para inferencia. El adaptador LoRA añade un pequeño coste adicional. Con cuantización (FP8, INT8, GGUF Q4) puede reducirse a ~5-8 GB.
- **GPU recomendadas**: NVIDIA A100 (40/80GB), H100 (80GB), o consumer como RTX 4090 (24GB) y RTX 3090 (24GB) son suficientes para inferencia con cuantización.
- **Cabe en consumer GPU**: sí, en GPUs de 12GB o más con cuantización (p.ej. GGUF Q4_K_M) o con FP16 en GPU de 24GB.
- **Opciones de despliegue**: compatible con el ecosistema RWKV: vLLM, llama.cpp, Ollama (vía conversión GGUF), TGI, y el runtime oficial RWKV.
- **Latencia y throughput**: no disponible; depende de la implementación y el hardware. RWKV-7 tiene complejidad lineal en tiempo, por lo que la latencia escala mejor que un transformer con KV-cache en contextos muy largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| **RWKV-7 7.2B (base)** | 7.2B | Teóricamente infinito | Apache 2.0 | RNN híbrido, sin KV-cache |
| **Lambent/RWKV7-7.2B-midtrain50-docs-lora** | 7.2B + LoRA | Hasta 256k en entrenamiento | Apache 2.0 | Adaptador para largo contexto, reduce contaminación |
| **Llama 3.1 8B** | 8B | 128k | Llama 3.1 Community License | Transformer con KV-cache, requiere más memoria |
| **Mistral 7B v0.3** | 7B | 32k | Apache 2.0 | Transformer con ventana deslizante, menor contexto |

No se dispone de comparación de rendimiento numérica entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo: requiere cargar el modelo base RWKV7-7.2B (20260805) para funcionar.
- El entrenamiento se realizó con 50M de tokens, una cantidad relativamente pequeña; los resultados pueden ser variables en tareas no cubiertas por los datos.
- No se han publicado evaluaciones formales (benchmarks) sobre el adaptador; las afirmaciones sobre mejoras en contextos largos son cualitativas.
- Los datos incluyen fuentes de internet y bibliotecas; puede contener sesgos culturales, religiosos o de género inherentes a las fuentes (p.ej., textos hebreos o cristianos).
- Riesgo de alucinación en tareas de razonamiento complejo, especialmente cuando se extrapola información de contextos muy largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el adaptador deben citarse correctamente.
- No se especifica el soporte de idiomas más allá del inglés y el hebreo; puede tener menor rendimiento en idiomas poco representados en el dataset.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/Lambent/RWKV7-7.2B-midtrain50-docs-lora)
- [Modelo base RWKV/RWKV7-7.2B-20260805](https://huggingface.co/RWKV/RWKV7-7.2B-20260805)
- [RWKV-LM GitHub](https://github.com/BlinkDL/RWKV-LM)
- [Investigación de RWKV-7 g0-7.2B](https://github.com/BlinkDL/RWKV-LM/blob/main/Research/rwkv7-g0-7.2b.md)
- [Sitio oficial de RWKV](https://www.rwkv.com/)
- [Adaptador de 1.5B (similar)](https://huggingface.co/Lambent/RWKV7-1.5B-midtrain50-docs-lora)
