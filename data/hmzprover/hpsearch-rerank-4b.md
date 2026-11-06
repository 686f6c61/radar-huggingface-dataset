# hmzprover/hpsearch-rerank-4b

## Resumen

hpsearch-rerank-4b es un modelo de reranking especializado en recuperación de declaraciones del corpus Mathlib de Lean 4, desarrollado por el usuario hmzprover. Se construye a partir de Qwen/Qwen3-Reranker-4B (4.021.784.576 parámetros) mediante dos procesos de fine-tuning LoRA con pérdida listwise softmax sobre un positivo y siete negativos duros por consulta, cuyos pesos se promedian con el modelo base (0,5 base + 0,25 cada fine-tune). Forma parte del modo `best` del buscador hpsearch, disponible en github.com/humanfia/hpsearch.

El modelo resuelve un problema concreto: dado un fragmento de Lean, una fórmula LaTeX, una descripción en inglés, un eslogan, un apodo o un caso especial concreto, ordenar las declaraciones candidatas de Mathlib por relevancia. Para ello reutiliza el prompt y la puntuación sí/no de la familia Qwen3-Reranker, mostrando cada documento como su enunciado Lean seguido de su enunciado en lenguaje natural, truncado a 112 tokens y con 16 documentos por consulta.

Es relevante para investigadores y desarrolladores que construyen asistentes de demostración interactiva, búsqueda semántica sobre librerías formales o pipelines de recuperación aumentada en entornos Lean. La licencia Apache 2.0 y el formato safetensors estándar de transformers facilitan su integración, aunque el ecosistema de evaluación pública del modelo es todavía muy reducido (42 descargas y ninguna valoración en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), adaptado a reranking con puntuación sí/no |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; los documentos se truncan a 112 tokens y se procesan 16 por consulta |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (las consultas de entrenamiento están en inglés y Lean/LaTeX) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura decoder-only de Qwen3-Reranker-4B y conserva su interfaz de puntuación: un prompt con el par consulta-documento y una decisión binaria sí/no cuya probabilidad se usa como score de relevancia. Sobre esa base se aplican dos fine-tunes LoRA independientes con pérdida listwise softmax sobre un positivo y siete negativos duros por consulta, y los pesos finales se obtienen promediando 0,5 del modelo base con 0,25 de cada fine-tune, una técnica de model averaging que suaviza el ajuste y preserva parte del comportamiento original.

Los datos de entrenamiento son públicos y generados localmente. Por un lado, Qwen3-30B-A3B-Instruct-2507 redactó consultas en seis estilos (fragmento Lean, LaTeX, descripción en inglés llano, eslogan, apodo y caso especial concreto) para 201.000 declaraciones del corpus LeanSearch v2 de Mathlib v4.28.0-rc1, que incluye cada definición, estructura, clase, instancia y abbrev, además de 120.000 teoremas; los negativos duros se minaron con el embedder previo aplicando un filtro de positividad (coseno del negativo inferior a 0,95 veces el del positivo). Por otro, se reutilizan pares públicos del conjunto de entrenamiento de hmzprover/hpsearch-embed-4b (informalizaciones de Lean Finder y LeanSearch v2, firmas de Mathlib y el split de entrenamiento de LeanStateSearch).

El autor documenta un proceso de descontaminación: ninguna declaración que sea gold de los conjuntos de evaluación usados por hpsearch (MathlibQR / MathlibMPR, Lean Finder, LeanStateSearch, LeanDojo, MIRB, TheoremSearch, TBPS y hmzprover, en todos sus splits) se emplea como positivo ni se incluye en el prompt, y toda consulta normalizada igual a una consulta de evaluación se descarta.

## Capacidades

- Reranking de documentos: ordena candidatos de Mathlib por relevancia respecto a una consulta, devolviendo una puntuación de sí/no por par.
- Comprensión de consultas heterogéneas: acepta fragmentos de Lean 4, expresiones LaTeX, descripciones en inglés llano, eslóganes, apodos y casos especiales concretos.
- Manejo de enunciados formales e informales: cada documento se representa como enunciado Lean seguido de su informalización, lo que permite emparejar consultas en lenguaje natural con declaraciones formales.
- Recuperación sobre Mathlib: entrenado específicamente sobre definiciones, estructuras, clases, instancias, abbrevs y teoremas de Mathlib v4.28.0-rc1.
- Puntuación listwise: el entrenamiento con softmax sobre un positivo y siete negativos favorece la discriminación fina entre candidatos próximos.
- Integración con transformers: pipeline `text-ranking`, pesos safetensors y compatibilidad con endpoints.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking: no documentado.

## Casos de uso

- Búsqueda semántica de teoremas en asistentes de demostración: dado un objetivo parcial escrito en Lean o una descripción informal, el modelo rerankea los candidatos recuperados por el embedder y prioriza las declaraciones más útiles para cerrar el goal; su entrenamiento sobre 201.000 declaraciones de Mathlib lo hace adecuado para este dominio.
- Autocompletado de nombres de lemas en editores: al escribir un fragmento de prueba, el sistema recupera candidatos y este reranker los ordena, mostrando primero los lemas con mayor probabilidad de ser el buscado.
- Traducción de lenguaje natural a formalizaciones: un usuario describe en inglés una propiedad matemática y el modelo puntúa qué declaración formal de Mathlib corresponde mejor, gracias a su entrenamiento con descripciones llanas y eslóganes.
- Construcción de pipelines RAG sobre documentación formal: en un sistema que responde preguntas sobre Mathlib, el reranker filtra los pasajes recuperados antes de pasarlos al generador, reduciendo contexto irrelevante con 16 documentos por consulta.
- Evaluación y curación de librerías: para detectar duplicados o declaraciones próximas, el modelo puede puntuar la similitud semántica entre un lema y un conjunto de candidatos, útil en tareas de mantenimiento de Mathlib.
- Búsqueda por apodo o caso especial: investigadores que recuerdan un teorema por su nombre coloquial o por un ejemplo concreto pueden recuperarlo aunque no conozcan su enunciado formal, gracias a los seis estilos de consulta usados en el entrenamiento.
- Integración en el buscador hpsearch: como componente del modo `best`, sirve de referencia para quien quiera replicar o extender el pipeline con su propio corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.021.784.576 parámetros, en fp16 se requieren aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en fp32, unos 16 GB; en cuantizaciones de 8 bits, alrededor de 4-5 GB, y en 4 bits, unos 2,5-3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegues en fp16 con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 en una sola GPU.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8 bits, y en 4-6 GB con cuantización de 4 bits, siempre que se disponga de una ruta de carga compatible (el repo solo publica safetensors).
- Opciones de despliegue: transformers con pipeline `text-ranking`, TGI y vLLM para servir el modelo; llama.cpp u Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste por consulta escala con 16 documentos de hasta 112 tokens cada uno, procesables en un único batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hmzprover/hpsearch-rerank-4b | 4,02 B | no disponible | Mathlib / Lean 4 | Apache 2.0 | Hugging Face (42 descargas) |
| Qwen/Qwen3-Reranker-4B | 4 B | no disponible | General | Apache 2.0 | Hugging Face |
| hmzprover/hpsearch-embed-4b | no disponible | no disponible | Mathlib / Lean 4 | no disponible | Hugging Face |

El modelo base Qwen3-Reranker-4B ofrece reranking generalista sin especialización en Lean; hpsearch-rerank-4b lo supera previsiblemente en el dominio de Mathlib por su fine-tuning, a costa de perder generalidad fuera de él. El embedder hpsearch-embed-4b del mismo autor cubre la fase de recuperación previa, por lo que ambos son complementarios dentro del pipeline hpsearch. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente sobre Mathlib v4.28.0-rc1 y consultas en inglés/Lean; su rendimiento fuera de ese dominio o en otras versiones de Mathlib no está documentado.
- Sesgo de dominio: puede favorecer declaraciones con patrones léxicos presentes en el corpus de entrenamiento y degradarse ante formalizaciones o estilos de consulta no cubiertos por los seis estilos generados.
- Riesgo de alucinación: al ser un reranker con salida sí/no, no genera texto libre, pero la puntuación puede ser sobreconfiada en pares ambiguos; conviene calibrar umbrales por aplicación.
- Truncamiento: los documentos se cortan a 112 tokens, lo que puede perder información en declaraciones largas o con enunciados informales extensos.
- Idiomas: no se documenta soporte multilingüe; las consultas de entrenamiento están en inglés y los enunciados en Lean/LaTeX.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-Reranker-4B y los corpus de entrenamiento (LeanSearch v2, Lean Finder, LeanStateSearch) deben verificarse por separado.
- Madurez: 42 descargas y ninguna valoración en el momento de la ficha; no hay benchmarks públicos ni validación independiente.
- Formato: solo se publican safetensors; no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmzprover/hpsearch-rerank-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Embedder del mismo autor: https://huggingface.co/hmzprover/hpsearch-embed-4b
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- Dataset LeanSearch v2 Mathlib: https://huggingface.co/datasets/FrenzyMath/lsv2-mathlib-v4.28.0-rc1-jsonl
