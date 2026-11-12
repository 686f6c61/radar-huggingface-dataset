# mounimzad/Llama-3-BrainHR-FT1200

## Resumen

Llama-3-BrainHR-FT1200 es un adaptador LoRA en formato MLX publicado por el usuario mounimzad sobre el modelo base mlx-community/Meta-Llama-3-8B-Instruct-4bit. Se trata de un ajuste fino orientado a investigación histórica y procesamiento de currículos (CV), entrenado durante 1.200 iteraciones con rango 64 y 16 capas adaptadas. El repositorio contiene únicamente los pesos del adaptador (adapters.safetensors, 0,3 GB), no el modelo completo, y está pensado para ejecutarse sobre el stack MLX de Apple Silicon.

El modelo no introduce arquitectura nueva: hereda el transformer denso de Llama 3 8B Instruct de Meta, con 8.000 millones de parámetros y una ventana de contexto nativa de 8.192 tokens, y añade un adaptador de bajo rango entrenado sobre pares de instrucciones relacionadas con análisis de CV y ofertas de empleo. El autor lo presenta explícitamente como una pieza histórica y experimental dentro de una línea de trabajo más amplia, distinta del adaptador QLoRA PEFT publicado posteriormente (Llama-3-BrainHR-QLoRA-Fusion-20261110).

Su relevancia es limitada y muy específica: sirve como referencia reproducible de un experimento de ajuste fino con LoRA sobre MLX, con configuración documentada en adapter_config.json y RUNBOOK.md, y con métricas de desarrollo calculadas sobre 30 CV ficticios, seis ofertas y 120 llamadas. No se reclama validación humana, paridad con PEFT ni reproducción de resultados de ningún paper, por lo que debe tratarse como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3 8B Instruct) con adaptador LoRA; formato MLX |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de rango 64 sobre 16 capas |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3 8B); entrenamiento con longitud 2.048 |
| Tipos de cuantizacion | Base en 4 bits (mlx-community/Meta-Llama-3-8B-Instruct-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible (la model card no especifica; el modelo base Llama 3 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3 Community License |
| Formato de pesos | adapters.safetensors nativo MLX (no compatible con adapter_model.safetensors de PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, cuantizado a 4 bits para su ejecución en MLX. El ajuste fino emplea LoRA con rango 64, escala 2, dropout 0,05, tasa de aprendizaje 1e-4, tamaño de lote 1 sin acumulación, longitud de secuencia 2.048, semilla 42 y mask_prompt=false, durante 1.200 iteraciones registradas sobre 16 capas. La revisión exacta del modelo base es c38b3b1f03cce0ce0ccd235e5c97b0d3d255e651, con hash SHA256 de pesos 65cc2e9a685c7092d11f70f2eaed09c9c6016b88a0e402b83481c67f18f1e8e8.

El autor indica que el dataset de fusión de 7.074 ejemplos no se utilizó en este entrenamiento y que 1.074 ejemplos derivados de CV reales permanecen privados; el resto del material asociado es sintético. No se documenta el número total de tokens de entrenamiento ni la composición exacta del corpus. Tampoco se especifica el uso de RLHF, DPO u otras técnicas de alineación adicionales más allá del ajuste supervisado implícito en el formato de instrucciones del modelo base. La configuración completa está en adapter_config.json y el procedimiento en RUNBOOK.md.

## Capacidades

- Generación de texto instructivo heredada de Llama 3 8B Instruct: respuestas conversacionales, resumen y reescritura.
- Procesamiento de currículos y ofertas de empleo en el dominio del ajuste (extracción y comparación de candidatos según la metodología BrainHR).
- Reranking de candidatos: la model card menciona un reranking oracle que recibe una extracción de referencia, evaluado sobre 30 CV ficticios y seis ofertas.
- Razonamiento multi-turno básico dentro de la ventana de 8.192 tokens del modelo base.
- Soporte multilingüe heredado del modelo base (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés según Meta), aunque el autor no lo declara explícitamente para el adaptador.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking específico del adaptador.

## Casos de uso

- Evaluación de candidatos en investigación histórica de contratación: el adaptador puede comparar un CV con una oferta y producir una puntuación de adecuación siguiendo la metodología BrainHR, útil para reproducir experimentos académicos sobre sesgos en selección de personal.
- Prototipado de pipelines de cribado en Apple Silicon: al ejecutarse en MLX sobre un Mac con memoria unificada, permite iterar localmente sobre extracción y ranking de CV sin depender de GPUs dedicadas.
- Reproducción de experimentos de ajuste fino LoRA: sirve como referencia de hiperparámetros (rango 64, 16 capas, 1.200 iteraciones) para quien quiera replicar el setup en MLX.
- Generación de resúmenes estructurados de trayectorias profesionales: el modelo puede condensar historiales laborales largos en fichas normalizadas, aprovechando el contexto de 8.192 tokens.
- Análisis comparativo de ofertas de empleo: extracción de requisitos y emparejamiento con perfiles, útil en estudios sobre mercado laboral.
- Docencia y formación: ejemplo práctico de adaptador MLX para cursos sobre ajuste fino eficiente y evaluación de modelos en dominios verticales.
- Investigación sobre evaluación de LLM: el repositorio incluye métricas de desarrollo y un dossier de revisores que puede usarse como caso de estudio metodológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de desarrollo internas sobre 30 CV ficticios, seis ofertas y 120 llamadas, sin validación humana, sin paridad con PEFT y sin comparación con los resultados de ningún paper. No se ofrecen cifras de MMLU, HumanEval, GSM8K ni de tareas estándar.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4 bits ocupa aproximadamente 4,5-5 GB de pesos; el adaptador añade unos 0,3 GB. En memoria unificada de Apple Silicon se recomienda un mínimo de 8 GB, y 16 GB para trabajar con contexto largo y comodidad.
- GPU recomendadas: el adaptador está diseñado para MLX, por lo que el hardware objetivo son chips Apple M1/M2/M3/M4 (Pro, Max o Ultra). No es directamente cargable en CUDA sin reconvertir el adaptador a PEFT.
- GPU de consumo: cabe en cualquier Mac con 16 GB o más de memoria unificada. En el ecosistema NVIDIA, el modelo base cuantizado a 4 bits cabría en una RTX 3060 de 12 GB o superior, pero requeriría una conversión del adaptador.
- Opciones de despliegue: MLX (mlx-lm) es la vía nativa. Para otros stacks habría que convertir el adaptador a formato PEFT y usar vLLM, TGI, llama.cpp u Ollama con el modelo base correspondiente, lo cual el autor no garantiza.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3-BrainHR-FT1200 (este) | 8B + LoRA r64 | 8.192 | MLX safetensors | Llama 3 | Adaptador histórico, sin benchmarks públicos |
| Llama-3-BrainHR-QLoRA-Fusion-20261110 | 8B + QLoRA | 8.192 | PEFT | Llama 3 | Mismo autor, experimento distinto y posterior; dataset de fusión de 7.074 ejemplos |
| Meta-Llama-3-8B-Instruct | 8B | 8.192 | safetensors, GGUF | Llama 3 | Modelo base generalista, con benchmarks publicados por Meta |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | safetensors, GGUF | Apache 2.0 | Alternativa generalista con contexto mayor y licencia permisiva |

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que no hay validación humana, evaluación de equidad general, pertinencia sobre CV reales, paridad con PEFT ni reproducción de resultados previos.
- Métricas de desarrollo muy limitadas: solo 30 CV ficticios, seis ofertas y 120 llamadas, con un reranking oracle que recibe una extracción de referencia, lo que infla artificialmente los resultados.
- Riesgo de alucinación y de sesgo: al operar sobre datos sintéticos de selección de personal, puede reproducir sesgos de género, edad u origen presentes en el corpus, sin que se haya auditado.
- Formato no estándar: adapters.safetensors es nativo de MLX y no debe cargarse como adapter_model.safetensors de PEFT; hacerlo provocará errores o comportamiento incorrecto.
- Dependencia del modelo base: la calidad final está acotada por Llama 3 8B Instruct en 4 bits, con la pérdida de precisión que implica la cuantización.
- Licencia Llama 3 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales para productos derivados), obligación de atribución y cláusulas de uso aceptable que deben revisarse antes de cualquier despliegue en producción.
- Idiomas no declarados para el adaptador: aunque el modelo base es multilingüe, el ajuste se documenta en francés y no hay evaluación por idioma.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mounimzad/Llama-3-BrainHR-FT1200
- Modelo base: https://huggingface.co/mlx-community/Meta-Llama-3-8B-Instruct-4bit
- Modelo relacionado del mismo autor: https://huggingface.co/mounimzad/Llama-3-BrainHR-QLoRA-Fusion-20261110
- Dataset de anotaciones de fusión: https://huggingface.co/datasets/mounimzad/brainhr-fusion-annotations-20261110
- Dataset sintético y método de notadores: https://huggingface.co/datasets/mounimzad/brainhr-synthetic-6000-reviewers
- Histórico de investigación: https://huggingface.co/mounimzad/Llama-3-BrainHR-QLoRA-Fusion-20261110/blob/main/history/HISTORIQUE_RECHERCHE.md
- Dossier de revisores V1.2: https://huggingface.co/mounimzad/Llama-3-BrainHR-QLoRA-Fusion-20261110/resolve/main/reviewers/DOSSIER_REVIEWERS_V1_2.docx?download=true
