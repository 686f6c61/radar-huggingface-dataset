# gdiamos/amx-moe256-20b-sft

## Resumen

amx-moe256-20b-sft es un checkpoint de investigación publicado por el usuario gdiamos en Hugging Face. Se trata de un ajuste fino conversacional (SFT) sobre el modelo base gdiamos/amx-moe256-20b, un mixture-of-experts de 256 expertos entrenado con ScalarXLM, un framework propio del autor. El modelo sigue el formato de chat y responde de forma breve, pero su propio autor advierte que la aritmética, el recuerdo factual y el código generado no son fiables.

El dato más relevante para evaluar el checkpoint es la discrepancia entre el nombre del modelo ("20b") y el recuento real de parámetros en los ficheros safetensors: 479.858.467 parámetros, es decir, aproximadamente 0,48 mil millones. El tamaño del repositorio es de 1,9 GB, coherente con un modelo de ese orden en precisión de 16 bits o con shards parciales. Esta inconsistencia debe tenerse en cuenta antes de cualquier uso.

El modelo no es un Transformers estándar: utiliza el formato de ScalarXLM (config.yaml, shards safetensors y tokenizer.json) y se sirve con el motor propietario de ScalarXLM, que según la model card no es público todavía. Esto limita seriamente su reproducibilidad y su despliegue en infraestructura convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (256 expertos) con router de logits normalizados, framework ScalarXLM |
| Parametros totales | 479.858.467 (según safetensors); el nombre del modelo indica "20b", discrepancia no aclarada |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos de SFT son mayoritariamente en inglés) |
| Licencia | no disponible; los datos de SFT tienen licencias diversas, algunas share-alike (CC-BY-SA, GFDL) |
| Formato de pesos | safetensors en formato ScalarXLM (config.yaml, shards y tokenizer.json) |

## Arquitectura y entrenamiento

El modelo base es un mixture-of-experts con 256 expertos entrenado con ScalarXLM. Sobre él se aplicó un preentrenamiento continuado con un router de logits normalizados: la selección de expertos usa los logits estandarizados del router y una ganancia aprendida afina únicamente las compuertas. Este proceso se extendió durante 61.035 pasos (job_000058 de ScalarXLM). El checkpoint que nos ocupa es el SFT conversacional de ese modelo (job_000064, step 002970).

El SFT se realizó con el dataset gdiamos/amx-moe256-20b-sft-mix en la revisión 1b194038: 923.573 conversaciones, aproximadamente 97 millones de tokens. La mezcla incluye chat general (smol-smoltalk con respuestas reescritas por un profesor), aritmética exacta y problemas de matemáticas (GSM8K, MetaMathQA), QA de respuesta corta y con pasaje (NQ-open, TriviaQA, WebQuestions, SQuAD), código corto en C y Python (CodeFeedback C, Rosetta Code C, ediciones filtradas de CommitPackFT C, MBPP) y turnos de reparación de funciones C para tareas de documentos. La receta fue un ajuste fino completo de una época: 2.970 pasos de 16 × 2.048 tokens, AdamW con tasa 5e-4, 150 pasos de calentamiento, decaimiento coseno, recorte de gradiente 2,0 y pérdida solo en turnos del asistente. El sesgo de balanceo de carga del router se mantuvo congelado.

## Capacidades

- Generación de texto conversacional breve y con formato de chat consistente.
- Respuesta a preguntas de cultura general en modalidad cerrada y con pasaje (open-book).
- Aritmética y problemas de matemáticas de palabra: el formato de respuesta trabajada es fluido, pero los resultados de varios dígitos son mayoritariamente incorrectos.
- Generación de código corto en C y Python, con calidad baja: según el autor, el código generado habitualmente no compila ni se ejecuta.
- Reparación de funciones C de tamaño documento en tareas específicas.
- Rechazo explícito de peticiones que no puede satisfacer (por ejemplo, datos meteorológicos en vivo).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los datos de entrenamiento son predominantemente en inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre routing en MoE: el checkpoint permite estudiar el comportamiento de un router de 256 expertos con normalización de logits y ganancia aprendida en un escenario de ajuste conversacional, comparando la selección de expertos antes y después del SFT.
- Experimentos de alineación de formato: útil para analizar cómo un SFT con respuestas normalizadas a un único estilo afecta a la brevedad y al formato de las respuestas en un modelo pequeño.
- Evaluación de QA con pasaje: el rendimiento open-book (6/10 en la sonda del autor) lo hace apto como línea base en experimentos controlados de lectura comprensiva, siempre con expectativas moderadas.
- Estudio de calibración y abstención: el modelo declina preguntas fuera de su conocimiento, lo que permite investigar patrones de abstención en modelos pequeños.
- Reproducción de recetas de SFT: la model card documenta con detalle hiperparámetros (5e-4, 150 warmup, coseno, clip 2,0), lo que facilita replicar el pipeline en otros checkpoints.
- Análisis de sesgos de datos: al mezclar fuentes con licencias share-alike y estilos heterogéneos, sirve para estudiar cómo se filtran esos estilos al modelo final.
- Docencia y demostraciones: como ejemplo de MoE de investigación con limitaciones documentadas honestamente, es útil en materiales formativos sobre evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona únicamente sondas pequeñas, que él mismo califica como no representativas de un benchmark:

| Prueba | Resultado |
|---|---|
| Pérdida en test del mix (conversaciones, GSM8K, MBPP, tareas de documento) | 1,697 |
| Sonda factual cerrada (closed book) | 3/20 |
| Sonda factual con pasaje (open book) | 6/10 |
| Aritmética de varios dígitos | mayoritariamente incorrecta |
| Código C y Python generado | habitualmente no compila ni ejecuta |

## Requisitos de hardware

- VRAM estimada para inferencia: con 479.858.467 parámetros, en FP16 serían aproximadamente 1 GB de pesos; en FP32, unos 1,9 GB. La VRAM real depende del número de expertos activos por token, dato no disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM podría alojar los pesos; sin embargo, el motor de inferencia necesario (ScalarXLM) no es público, por lo que no se puede confirmar compatibilidad con CUDA estándar.
- Cabe en GPU consumer: probablemente sí por tamaño de pesos, pero la disponibilidad del runtime es el factor limitante real.
- Opciones de despliegue: no disponible. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; el formato es específico de ScalarXLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (MoE de 256 expertos en formato ScalarXLM) ni alternativas con las que contrastar parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre ("20b") y los parámetros reales en safetensors (479.858.467): no debe asumirse que el modelo tiene 20.000 millones de parámetros.
- El autor declara explícitamente que la aritmética, el recuerdo factual y el código no son fiables; no es apto para producción en esas tareas.
- Riesgo alto de alucinación factual: en la sonda cerrada responde con tautologías ("The capital of France is the capital of France.").
- El código generado en C y Python habitualmente no compila ni se ejecuta.
- Licencia no disponible: no se puede confirmar el uso comercial. Además, varias fuentes del dataset de SFT son share-alike (CC-BY-SA, GFDL), lo que puede imponer obligaciones de compartición derivadas.
- El modelo requiere el motor ScalarXLM, que no es público, lo que impide su despliegue en infraestructura estándar y compromete la reproducibilidad.
- Idiomas soportados no documentados; el entrenamiento es predominantemente en inglés.
- Longitud de contexto no documentada; el entrenamiento usó secuencias de 2.048 tokens.
- Las evaluaciones publicadas son sondas pequeñas, no benchmarks; no deben extrapolarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gdiamos/amx-moe256-20b-sft
- Modelo base: https://huggingface.co/gdiamos/amx-moe256-20b
- Dataset de SFT: https://huggingface.co/datasets/gdiamos/amx-moe256-20b-sft-mix
- Dataset de tareas de documento: https://huggingface.co/datasets/gdiamos/amx-moe256-20b-sft-docfn
