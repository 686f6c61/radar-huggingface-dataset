# francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed10

## Resumen

`ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed10` es un ajuste fino (SFT) del modelo monolingüe `goldfish-models/eng_latn_100mb`, desarrollado por el usuario `francesca9805` en el marco de un proyecto de investigación sobre tokenizadores de la Universidad de Groningen (los registros de entrenamiento apuntan al proyecto `new-tokenizers` en Weights & Biases). Se trata de un artefacto experimental, no de un modelo pensado para producción: acumula cero descargas y cero likes en el momento de redactar esta ficha, y el nombre del repositorio codifica las condiciones del experimento (léxico nuevo, empaquetado de secuencias, presupuesto de 100 MB, semilla 10).

Técnicamente es un transformer decoder-only de tipo GPT-2 con 86.508.288 parámetros (~86,5 M), almacenado en safetensors dentro de un repositorio de 0,2 GB. El entrenamiento se realizó con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1, empleando supervisión directa (SFT) en lugar de RLHF o DPO. El modelo hereda del base `eng_latn_100mb` un entrenamiento monolingüe en inglés sobre un corpus de 100 MB.

Su relevancia es acotada y de naturaleza investigadora: sirve para comparar variantes de tokenización bajo un presupuesto de cómputo fijo, no como un asistente de propósito general. No se ha publicado licencia, idiomas declarados ni resultados de benchmarks en la información disponible, por lo que cualquier evaluación de calidad debe realizarse por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | 86.508.288 (~86,5 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no declarada en la model card; la arquitectura GPT-2 suele usar 1024 tokens) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | No declarados; el modelo base es `eng_latn` (ingles) |
| Licencia | No disponible (la model card incluye un campo placeholder `licence: license`) |
| Formato de pesos | safetensors (compatible con la libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, con 86,5 millones de parámetros. Esta cifra es coherente con la del modelo base `goldfish-models/eng_latn_100mb`, un modelo monolingüe de inglés entrenado sobre un corpus de 100 MB dentro del proyecto Goldfish, orientado a estudiar el rendimiento de modelos pequeños por idioma con presupuestos de datos reducidos. No se detalla en la información disponible el número de capas, dimensiones de atención ni número de cabezas.

El ajuste se realizó mediante supervisión directa (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No hay evidencia de una fase de RLHF o DPO. El identificador del experimento y el proyecto de W&B (`new-tokenizers`) sugieren que el objetivo es evaluar el efecto de modificaciones en el tokenizador, el empaquetado de secuencias (`packed`) y la composición léxica (`newlex`, `uniform`) bajo un límite de 100 MB y una semilla concreta (`seed10`). No se documentan en la model card innovaciones como decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base monolingüe.
- Instrucción conversacional básica: el ejemplo de la model card invoca `pipeline("text-generation", ...)` pasando una lista con el rol `user`, lo que indica formato de chat simple.
- No se documentan capacidades de razonamiento avanzado, matemáticas ni código.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el base es específicamente inglés (`eng_latn`).
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación sobre tokenizadores: comparar esta variante (`newlex`, `packed`, `uniform`) frente a otras ejecuciones del mismo proyecto `new-tokenizers` para medir el impacto del vocabulario y el empaquetado en la pérdida y la perplejidad.
- Reproducibilidad de experimentos: al estar fijada la semilla (`seed10`) y el presupuesto (100 MB), permite replicar resultados bajo condiciones controladas.
- Docencia y prácticas de ajuste fino: su tamaño reducido (86,5 M de parámetros) y su pipeline de TRL lo convierten en un caso asequible para aprender SFT de principio a fin.
- Pruebas de infraestructura de despliegue: sirve como modelo de juguete para validar pipelines de transformers, text-generation-inference o endpoints compatible antes de escalar a modelos mayores.
- Generación de texto en inglés de dominio acotado: útil para completar frases o párrafos breves cuando el estilo coincide con el corpus de ajuste, sin expectativas de calidad general.
- Evaluación de sesgos y de comportamiento de modelos pequeños: al carecer de alineación avanzada, es un buen banco de pruebas para estudiar qué fallos aparecen en modelos de 100 MB entrenados con datos limitados.
- Baseline en estudios comparativos de idioma: sirve como referencia inglesa para contrastar con los modelos Goldfish de otras lenguas bajo el mismo presupuesto de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación, y tampoco se aportan curvas de entrenamiento más allá del enlace al registro de Weights & Biases.

## Requisitos de hardware

- VRAM estimada: muy baja. Con 86,5 M de parámetros, la inferencia en fp32 ocupa en torno a 0,35 GB de pesos y en fp16 alrededor de 0,17 GB; con el overhead de activaciones y caché, un presupuesto de 1-2 GB de VRAM es más que suficiente.
- GPU recomendadas: cualquier GPU moderna sirve; se puede ejecutar incluso en iGPU o en CPU sin problema. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650 e inferiores) e incluso en CPU.
- Opciones de despliegue: `transformers` con el pipeline de text-generation (documentado en la model card), y por las etiquetas del repositorio también `text-generation-inference` (TGI) y endpoints compatibles. No hay evidencia de pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed10` | ~86,5 M | No disponible | No publicado | No disponible | HuggingFace (0 descargas) |
| `goldfish-models/eng_latn_100mb` (modelo base) | ~86,5 M | No disponible | No disponible en esta ficha | No disponible en esta ficha | HuggingFace |
| `distilgpt2` | 82 M | 1024 tokens | Métricas históricas publicadas por su autor | Apache-2.0 (uso comercial permitido) | HuggingFace |
| `gpt2` | 124 M | 1024 tokens | Métricas históricas publicadas por su autor | MIT (uso comercial permitido) | HuggingFace |

La comparación con `distilgpt2` y `gpt2` es de categoría (transformers decoder-only pequeños en inglés), no de rendimiento medido, ya que este modelo no publica benchmarks. La ventaja principal frente a ellos es su coste computacional mínimo; la desventaja, su falta de licencia declarada, de evaluación y de soporte.

## Limitaciones y advertencias

- No se declara licencia utilizable: la model card contiene un campo placeholder (`licence: license`), por lo que no hay autorización explícita para uso comercial ni para redistribución.
- Modelo puramente experimental: cero descargas y cero likes, sin mantenimiento ni soporte documentado.
- Riesgo de alucinación alto: es un modelo de 86,5 M de parámetros entrenado sobre 100 MB de texto, con capacidad muy limitada para retener hechos y mantener coherencia en respuestas largas.
- Idiomas: entrenado en inglés (`eng_latn`); no se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- Contexto limitado: no se declara la ventana, y la arquitectura GPT-2 subyacente tiene una longitud típica de 1024 tokens, insuficiente para conversaciones o documentos largos.
- Sin alineación avanzada: al ser un SFT sobre un base pequeño y no haber RLHF/DPO, es probable que genere contenido sesgado, repetitivo o fuera de tema.
- Sin benchmarks: cualquier afirmación sobre su calidad carece de respaldo medible; se recomienda evaluarlo internamente antes de considerarlo para cualquier tarea.
- El nombre del repositorio y el proyecto apuntan a un estudio de tokenización, por lo que su tokenizer puede diferir del estándar GPT-2 y romper supuestos de herramientas que asumen el vocabulario original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/7i5v0uv4
- Repositorio de TRL: https://github.com/huggingface/trl
