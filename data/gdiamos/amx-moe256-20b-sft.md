# gdiamos/amx-moe256-20b-sft

## Resumen

amx-moe256-20b-sft es un checkpoint de investigación publicado por el usuario gdiamos en Hugging Face. Se trata de un ajuste fino conversacional (SFT) sobre el modelo base gdiamos/amx-moe256-20b, una arquitectura de mezcla de expertos (MoE) con 256 expertos entrenada con ScalarXLM, un framework propio del autor. El objetivo declarado es explorar el comportamiento de un MoE de muchos expertos tras un ajuste conversacional, no ofrecer un modelo listo para producción.

El modelo sigue el formato de chat y responde de forma breve y con formato correcto, pero el propio autor advierte que su aritmética, recuperación de hechos y generación de código son poco fiables. La evaluación publicada se limita a sondas pequeñas: pérdida de 1.697 en el conjunto de test del mix de SFT, 3/20 en una prueba de hechos a libro cerrado y 6/10 a libro abierto. No hay benchmarks estandarizados.

Un dato relevante para cualquier evaluación técnica: pese al nombre "20b", los pesos en safetensors suman 479.858.467 parámetros totales, y el repositorio ocupa 1,9 GB. El checkpoint está en el formato nativo de ScalarXLM (config.yaml, shards safetensors y tokenizer.json), no en formato Transformers, y su motor de inferencia no es público todavía, lo que limita seriamente su uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 256 expertos, entrenada con ScalarXLM; router con logits normalizados y ganancia aprendida |
| Parametros totales | 479.858.467 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los datos de SFT conservan sus licencias de origen, varias share-alike: CC-BY-SA, GFDL) |
| Formato de pesos | safetensors en formato ScalarXLM (config.yaml, shards y tokenizer.json); no es un modelo Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer con capa MoE de 256 expertos. Sobre el modelo base se hizo un preentrenamiento continuado con un router de logits normalizados: la selección de expertos usa los logits estandarizados del router y una ganancia aprendida afina las compuertas. Ese preentrenamiento continuado constó de 61.035 pasos (job_000058 de ScalarXLM). El checkpoint que nos ocupa es el ajuste fino conversacional de esa segunda etapa (job_000064@step-002970).

El SFT usó el dataset gdiamos/amx-moe256-20b-sft-mix (revisión 1b194038): 923.573 conversaciones, unos 97 millones de tokens, con mezcla de chat general (smol-smoltalk con respuestas reescritas por un profesor), aritmética exacta y problemas de matemáticas (GSM8K, MetaMathQA), QA de respuesta corta y a libro abierto (NQ-open, TriviaQA, WebQuestions, SQuAD), C y Python cortos (CodeFeedback C, Rosetta Code C, ediciones C filtradas de CommitPackFT, MBPP) y turnos de reparación de C de tamaño función para tareas de documentos. El ajuste fue completo, una época (2.970 pasos de 16 × 2.048 tokens), AdamW a 5e-4 con 150 pasos de calentamiento y decaimiento coseno, recorte de gradiente 2.0, pérdida solo en turnos del asistente y el sesgo de balanceo de carga del router congelado.

## Capacidades

- Generación de texto conversacional en formato de chat, con respuestas breves y normalizadas a un único estilo.
- Aritmética exacta y problemas de matemáticas de tipo GSM8K en el entrenamiento, aunque en las pruebas puntuales la aritmética de varios dígitos falla casi siempre pese a mantener un formato de respuesta fluido.
- QA de respuesta corta y a libro abierto: responde a partir de un pasaje proporcionado (6/10 en la sonda del autor), pero el recuerdo de hechos a libro cerrado es muy débil (3/20).
- Generación de código C y Python corto, con calidad baja: el código generado normalmente no compila ni se ejecuta.
- Reparación de funciones C de tamaño documento para tareas de documentos (dataset gdiamos/amx-moe256-20b-sft-docfn).
- Rechazo de peticiones que no puede cumplir: declina lo que no sabe ("I don't have access to live weather data").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre enrutado MoE: el checkpoint permite estudiar cómo se comporta un router de 256 expertos con logits normalizados tras un SFT conversacional, comparando la distribución de expertos antes y después del ajuste.
- Reproducción de experimentos de SFT: sirve como referencia para validar recetas de ajuste completo (una época, 5e-4, pérdida solo en turnos del asistente) sobre datasets mixtos de chat, matemáticas y código.
- Estudio de alineación de formato: útil para analizar cómo un SFT breve normaliza el estilo de respuesta y hace que el modelo decline peticiones fuera de su alcance.
- Evaluación de QA a libro abierto: con pasajes de contexto, el modelo responde con cierta fiabilidad (6/10 en la sonda), lo que permite probar pipelines de extracción de respuestas con contexto explícito.
- Análisis de fallos en aritmética: el modelo mantiene el formato de respuesta trabajada aunque el resultado sea incorrecto, un caso interesante para investigar la brecha entre forma y contenido en modelos pequeños.
- Docencia y divulgación: como ejemplo de checkpoint de investigación con limitaciones documentadas y evaluación honesta, útil en cursos sobre entrenamiento de LLM y MoE.
- No es adecuado para atención al cliente, generación de código en producción, asistentes factuales ni despliegues comerciales, según las propias advertencias del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. El autor solo reporta sondas pequeñas:

| Prueba | Resultado |
|---|---|
| Pérdida en test del mix de SFT (chat, GSM8K, MBPP, tareas de documentos) | 1.697 |
| Sonda de hechos a libro cerrado | 3/20 |
| Sonda de hechos a libro abierto | 6/10 |
| Aritmética de varios dígitos | mayoritariamente incorrecta |
| Código C y Python generado | normalmente no compila ni se ejecuta |

El propio autor indica que estas son sondas pequeñas, no un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 479.858.467 parámetros, en fp16 serían unos 0,96 GB de pesos y en fp32 unos 1,92 GB, pero el formato ScalarXLM y el motor de inferencia no público impiden dar cifras fiables de memoria total ni de overhead.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: probablemente sí por tamaño de pesos, pero no verificable sin el motor de ScalarXLM.
- Opciones de despliegue: solo el motor de ScalarXLM, que no es público todavía. No hay soporte conocido para vLLM, llama.cpp, Ollama ni TGI, ya que el checkpoint no está en formato Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (MoE de 256 expertos de ~0,5B parámetros en formato ScalarXLM) con datos de rendimiento, licencia o disponibilidad que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El autor califica el checkpoint como de investigación: la aritmética, el recuerdo de hechos y el código son poco fiables.
- Riesgo alto de alucinación factual: a libro cerrado responde cosas como "The capital of France is the capital of France." cuando no recuerda el hecho.
- El código C y Python generado normalmente no compila ni se ejecuta.
- No es un modelo Transformers: requiere el motor de ScalarXLM, que no es público, por lo que en la práctica no se puede servir con el stack habitual.
- Licencia no disponible: los datos de SFT conservan sus licencias de origen, varias share-alike (CC-BY-SA, GFDL), lo que introduce incertidumbre legal para uso comercial.
- Idiomas soportados no declarados; no hay garantías multilingües.
- Longitud de contexto no documentada; el entrenamiento usa secuencias de 2.048 tokens.
- El nombre "20b" no coincide con el recuento real de parámetros en safetensors (479.858.467), lo que puede inducir a error en la planificación de recursos.
- Sin soporte documentado de tool calling ni de agentes multi-paso.
- No usar en producción sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gdiamos/amx-moe256-20b-sft
- Modelo base: https://huggingface.co/gdiamos/amx-moe256-20b
- Dataset de SFT: https://huggingface.co/datasets/gdiamos/amx-moe256-20b-sft-mix
- Dataset de tareas de documentos: https://huggingface.co/datasets/gdiamos/amx-moe256-20b-sft-docfn
- Paper, blog o repositorio de ScalarXLM: no disponible
