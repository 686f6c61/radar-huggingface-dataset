# hmzprover/hpsearch-embed-4b-v2

## Resumen

hpsearch-embed-4b-v2 es un modelo de embeddings de texto especializado en recuperación de declaraciones matemáticas de Mathlib, la biblioteca formal en Lean 4. Lo desarrolla hmzprover como componente del sistema de búsqueda hpsearch, y se construye mediante un ajuste fino con LoRA en dos rondas sobre Qwen3-Embedding-4B, promediando después los pesos fusionados de ambas rondas. El resultado es un embedder de 4.021.774.336 parámetros orientado a la tarea de similitud semántica entre consultas de búsqueda y declaraciones formales.

El problema que resuelve es concreto: dado un fragmento de Lean, una descripción en lenguaje natural, una notación LaTeX, un eslogan o un caso especial, devolver la declaración de Mathlib que el usuario necesita. Para ello se entrenó con consultas en seis estilos distintos generadas automáticamente sobre 201.000 declaraciones del corpus LeanSearch v2 de Mathlib (versión 4.28.0-rc1), incluyendo definiciones, estructuras, clases, instancias, abbrevs y 120.000 teoremas.

Su relevancia actual radica en que cubre un nicho poco atendido: los embeddings generalistas rinden mal cuando la consulta mezcla sintaxis Lean, notación matemática y prosa técnica. Este modelo se distribuye con licencia Apache 2.0, en formato safetensors, y es compatible con Text Embeddings Inference y con los endpoints de HuggingFace, lo que facilita su despliegue en pipelines de recuperación aumentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-Embedding-4B) adaptado a embeddings con sentence-transformers |
| Parametros totales | 4.021.774.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las consultas de entrenamiento son en ingles y Lean 4) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 8,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-4B, un transformer decoder-only de 4B parámetros, y se ajusta con LoRA en dos rondas sucesivas; los pesos publicados son la media de los dos modelos fusionados resultantes. La entrada de consulta sigue el formato de instrucciones de hpsearch (`Instruct: ...\nQuery: `), mientras que los documentos se codifican como la declaración Lean seguida de su enunciado en lenguaje natural. La salida es un vector de embedding para similitud coseno.

Los datos de entrenamiento son públicos y generados localmente. Se usaron consultas en seis estilos (fragmento Lean, LaTeX, descripción en inglés llano, eslogan, apodo y caso especial concreto) redactadas por Qwen3-30B-A3B-Instruct-2507 para 201.000 declaraciones del corpus LeanSearch v2 de Mathlib, junto con negativos duros minados con el embedder anterior y filtrados para que su coseno quede por debajo de 0,95 veces el del positivo. La segunda ronda replica pares públicos del conjunto de entrenamiento del modelo base: informalizaciones de Lean Finder y LeanSearch v2, firmas de Mathlib y el split de entrenamiento de LeanStateSearch. Se aplicó descontaminación explícita: ninguna declaración que sea gold de los conjuntos de evaluación de hpsearch (MathlibQR/MathlibMPR, Lean Finder, LeanStateSearch, LeanDojo, MIRB, TheoremSearch, TBPS) se usa como positivo ni se solicita por nombre o enunciado, y se eliminan las consultas normalizadas idénticas a consultas de evaluación.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa (pipeline `sentence-similarity`).
- Recuperación de declaraciones de Mathlib a partir de fragmentos de Lean 4, notación LaTeX o descripciones en lenguaje natural.
- Manejo de consultas en seis estilos distintos: fragmento formal, LaTeX, prosa en inglés, eslogan, apodo y caso especial concreto.
- Codificación asimétrica consulta-documento con formato de instrucción específico para consultas.
- Compatibilidad con Text Embeddings Inference y con los endpoints de HuggingFace.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda de lemas en asistentes de demostración: integrar el modelo como recuperador en un IDE o plugin de Lean 4 para que, dado un objetivo o un fragmento de prueba, devuelva los lemas candidatos de Mathlib ordenados por similitud.
- Construcción de índices vectoriales de Mathlib: generar embeddings de las 201.000 declaraciones del corpus LeanSearch v2 y servirlos desde una base vectorial para búsqueda semántica de baja latencia.
- Traducción de prosa matemática a formalizaciones: un usuario describe en inglés llano el resultado que necesita y el modelo recupera la declaración formal correspondiente, que luego puede pasarse a un modelo generador para la prueba.
- Desambiguación por notación LaTeX: investigadores que escriben matemáticas en LaTeX pueden buscar la declaración de Mathlib que corresponde a una fórmula, gracias al entrenamiento con consultas en ese estilo.
- Recuperación aumentada para agentes de demostración automática: alimentar un pipeline de prueba automática con los lemas relevantes recuperados por este embedder antes de invocar al modelo generador.
- Evaluación comparativa de embedders matemáticos: servir como referencia en experimentos de recuperación sobre MathlibQR, LeanStateSearch o MIRB, dado que su conjunto de entrenamiento está descontaminado frente a esos benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 8 GB solo para los pesos, más overhead de activaciones y del tokenizador; en cuantización de 8 bits, en torno a 4-5 GB.
- GPU recomendadas: A100 40 GB u H100 para indexación a gran escala con lotes grandes; RTX 4090 (24 GB) o RTX 3090 para inferencia en FP16 sin problemas.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en FP16; con cuantización de 8 bits podría ajustarse en 8 GB.
- Opciones de despliegue: Text Embeddings Inference (soportado explícitamente), sentence-transformers, y endpoints de HuggingFace; el formato safetensors es compatible con vLLM en modo embedding y con llama.cpp tras conversión a GGUF (no confirmado por el autor).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hmzprover/hpsearch-embed-4b-v2 | 4,02B | no disponible | Mathlib / Lean 4 | apache-2.0 | HuggingFace |
| hmzprover/hpsearch-embed-4b | no disponible | no disponible | Mathlib / Lean 4 (version anterior) | no disponible | HuggingFace |
| Qwen3-Embedding-4B | 4B | no disponible | Embeddings generalistas multilingues | no disponible | HuggingFace |

La comparación con embedders generalistas de tamaño similar es desfavorable para estos últimos en el dominio de Mathlib, aunque no se dispone de cifras publicadas que lo cuantifiquen. Frente a su predecesor, la versión v2 añade el promediado de dos rondas de LoRA y un conjunto de datos ampliado con consultas en seis estilos y negativos duros filtrados.

## Limitaciones y advertencias

- Modelo de embeddings puro: no genera texto, no razona y no puede usarse para completar demostraciones.
- Dominio restringido a Mathlib y Lean 4; su rendimiento fuera de ese ámbito no está documentado y probablemente sea inferior al de embedders generalistas.
- El formato de instrucción de consulta (`Instruct: ...\nQuery: `) es obligatorio; usarlo sin ese prefijo puede degradar la recuperación.
- Los documentos deben codificarse como declaración Lean seguida de enunciado en lenguaje natural; otra estructura de documento puede reducir la calidad.
- Idiomas soportados no documentados; el entrenamiento se realizó con consultas en inglés y sintaxis Lean, por lo que el rendimiento en castellano no está verificado.
- Riesgo de falsos positivos en consultas ambiguas o muy cortas (apodos, eslóganes), mitigado parcialmente por los negativos duros pero no eliminado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-Embedding-4B tiene sus propias condiciones que conviene revisar.
- Sin datos publicados de benchmarks ni de latencia; la evaluación en producción requiere validación propia.
- Solo 31 descargas y ningún like en el momento de la consulta: ecosistema de usuarios muy reducido y poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmzprover/hpsearch-embed-4b-v2
- Modelo base (version anterior): https://huggingface.co/hmzprover/hpsearch-embed-4b
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- Corpus LeanSearch v2 Mathlib: https://huggingface.co/datasets/FrenzyMath/lsv2-mathlib-v4.28.0-rc1-jsonl
