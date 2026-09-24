# francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed10

## Resumen

El modelo `francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed10` es un ajuste fino (SFT) del modelo base `goldfish-models/eng_latn_100mb`, un transformer decoder-only de tipo GPT-2 entrenado sobre un subconjunto de 100 MB de texto en inglés. El checkpoint resultante tiene 86.508.288 parámetros (aproximadamente 86,5 millones), se distribuye en formato safetensors dentro de un repositorio de 0,2 GB y se ha entrenado con la librería TRL (versión 0.23.0) sobre Transformers 4.56.2.

El nombre del checkpoint sugiere que forma parte de un experimento de investigación sobre tokenizadores ("new-tokenizers" es el nombre del proyecto en Weights & Biases), en el que se manipula el léxico del tokenizador y se prueban variantes relacionadas con hebreo ("heb") antes de un umbral de 100 MB. No obstante, la model card no documenta el corpus de ajuste fino, el idioma final, la composición de datos ni los objetivos del experimento, por lo que esa interpretación es una inferencia a partir del identificador y no un dato confirmado.

Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción: no tiene descargas ni valoraciones, no declara licencia (el campo `licence: license` es un marcador de posición) y no incluye resultados de evaluación. Su interés es como punto de partida reproducible para estudiar el efecto de cambios de tokenizador en modelos pequeños de tipo GPT-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado `gpt2`; derivado de `goldfish-models/eng_latn_100mb`) |
| Parametros totales | 86.508.288 (86,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No documentados por el autor; al ser safetensors es convertible a FP16, BF16, INT8 e INT4 con herramientas estándar |
| Idiomas soportados | No disponibles. El modelo base es monolingüe en inglés; el identificador menciona "heb", pero el autor no confirma idioma de destino |
| Licencia | No disponible (el campo de la model card contiene el marcador de posición `license`) |
| Formato de pesos | safetensors (librería Transformers) |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | text-generation |
| Fecha de creación | 2026-09-24 |
| Fecha de última actualización | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con atención causal completa y sin componentes de mezcla de expertos ni capas de estado (SSM). El modelo base, `goldfish-models/eng_latn_100mb`, pertenece a la colección Goldfish de modelos pequeños entrenados con presupuestos reducidos de datos por idioma; el ajuste fino aquí presentado hereda esa arquitectura y ese tokenizador, aunque el autor no detalla si el tokenizador fue reemplazado en el experimento "new-lex" (nuevo léxico), que es precisamente lo que sugiere el nombre del checkpoint.

El entrenamiento se realizó mediante supervised fine-tuning (SFT) con TRL 0.23.0, sobre PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la receta de hiperparámetros, ni si hubo fases posteriores de RLHF o DPO: únicamente se documenta que se aplicó SFT y se enlaza la ejecución de seguimiento en Weights & Biases. No se declara ninguna innovación técnica adicional (decodificación especulativa, atención lineal, atención por ventanas, etc.).

## Capacidades

- Generación de texto autoregresiva: es la única tarea declarada en el pipeline (`text-generation`) y para la que se ofrece un ejemplo de uso con `transformers.pipeline`.
- Ajuste por instrucciones básico: al haber sido entrenado con SFT sobre un formato conversacional, se espera que responda a entradas con estructura de mensajes (`{"role": "user", "content": ...}`), tal y como muestra la model card.
- Razonamiento y matemáticas: no documentados y poco probables a esta escala (86,5 M de parámetros), sin evidencia publicada.
- Generación de código: no documentada.
- Tool calling / function calling: no soportado ni documentado (el pipeline declarado no incluye herramientas).
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas. El modelo base es inglés; el identificador apunta a material hebreo, sin confirmación del autor.
- Capacidades especiales (modo *thinking*, visión, audio): ninguna declarada.
- Compatibilidad de despliegue: las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, lo que indica que el repositorio sigue la estructura esperada por TGI y por los Inference Endpoints de Hugging Face.

## Casos de uso

- Investigación sobre tokenizadores: el checkpoint encaja como punto de comparación reproducible en experimentos que midan cómo afecta un léxico nuevo ("newlex") a la pérdida y a la calidad de generación de un modelo pequeño, usando como referencia el modelo base sin ajustar.
- Reproducción de experimentos de SFT: dado que se documentan las versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers, sirve para reproducir o auditar una receta de ajuste fino ligera en un entorno controlado.
- Generación de texto de bajo coste en el borde: con 86,5 M de parámetros y menos de 200 MB en FP16, puede ejecutarse en CPU o en GPU integrada para tareas de autocompletado simple o generación de plantillas, donde no se requiera alta calidad.
- Análisis de artefactos de investigación: útil para estudiar el comportamiento de modelos GPT-2 pequeños entrenados con presupuestos de datos muy limitados (100 MB) y detectar degradaciones típicas como repetición o divagación.
- Docencia y prácticas de NLP: adecuado como ejemplo didáctico para ilustrar el ciclo completo de SFT con TRL, carga de safetensors y despliegue con `pipeline`, sin necesidad de hardware especializado.
- Prototipado rápido de interfaces conversacionales: puede emplearse como sustituto de baja latencia en pruebas de integración de una aplicación, antes de conectar un modelo mayor, gracias a su reducido coste de memoria y su compatibilidad con TGI y Endpoints.
- Generación de datos sintéticos a pequeña escala: para aumentar corpus de dominio muy específico en experimentos internos, siempre con revisión humana posterior debido al alto riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluación, ni compara el checkpoint con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, unos 0,35 GB; en FP16/BF16, unos 0,17 GB; en INT8, unos 0,09 GB; en INT4, unos 0,05 GB. Estas cifras son cálculos a partir de los 86,5 M de parámetros y no incluyen caché KV ni activaciones, que a esta escala son marginales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Funciona con tarjetas de gama de entrada (GTX 1050 Ti, GTX 1650), integradas modernas y también en CPU. No requiere A100, H100 ni RTX 4090, que quedarían enormemente infrautilizadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos ocho años, y también en dispositivos con poca memoria unificada.
- Opciones de despliegue: `transformers` (pipeline estándar), Text Generation Inference (TGI, por la etiqueta `text-generation-inference`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), `vLLM` (compatible con modelos GPT-2 pequeños), `llama.cpp`/`Ollama` previa conversión a GGUF, y ejecución directa en CPU con PyTorch.
- Latencia y throughput: no se dispone de mediciones publicadas. Por el tamaño del modelo se espera una latencia muy baja y un throughput alto en GPU moderna, pero al no haberse documentado no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed10` | 86,5 M | No disponible | No disponible (base en inglés) | No disponible | Repositorio Hugging Face, 0 descargas |
| `goldfish-models/eng_latn_100mb` (modelo base) | No disponible en la informacion proporcionada | No disponible | Inglés (según el identificador del modelo) | No disponible | Público en Hugging Face |
| `gpt2` (referencia de la misma arquitectura) | 124 M | 1024 tokens (según documentación pública del modelo) | Inglés | MIT (según documentación pública) | Ampliamente disponible |
| `distilgpt2` (referencia de tamaño similar) | 82 M | 1024 tokens (según documentación pública del modelo) | Inglés | Apache 2.0 (según documentación pública) | Ampliamente disponible |

Nota: los datos de `gpt2` y `distilgpt2` proceden de documentación pública ampliamente conocida y se incluyen como referencia de categoría; no se han verificado contra una fuente en esta búsqueda. Para los modelos Goldfish y el checkpoint ajustado no hay datos de rendimiento comparables publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un modelo entrenado con 100 MB de texto en inglés, hereda los sesgos presentes en ese corpus reducido, que no ha sido descrito por el autor.
- Riesgo de alucinación: elevado. Con 86,5 M de parámetros y un corpus de entrenamiento muy limitado, es esperable que genere afirmaciones plausibles pero falsas, repeticiones y divagaciones.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y el soporte multilingüe no está confirmado. Un uso en hebreo o en otros idiomas distintos del inglés del modelo base no está validado.
- Licencia: no disponible. La model card contiene un marcador de posición (`licence: license`) en lugar de una licencia real, por lo que no se puede asumir permiso para uso comercial ni redistribución.
- Madurez: cero descargas y cero valoraciones. Es un artefacto de investigación sin adopción ni validación externa.
- Ausencia de evaluación: no hay benchmarks, ni análisis de sesgos, ni pruebas de robustez. No debería desplegarse en producción sin una evaluación propia.
- Trazabilidad del experimento: el nombre del checkpoint sugiere experimentación con tokenizadores y con material en hebreo, pero al no estar documentada, no se puede garantizar qué tokenizador ni qué datos se usaron realmente en el ajuste.
- Despliegue en producción: se recomienda tratar cualquier salida como material a revisar por una persona.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/asgntnvt
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL: von Werra, L., Belkada, Y., Tunstall, L., Beeching, E., Thrush, T., Lambert, N., Huang, S., Rasul, K. y Gallouédec, Q. (2020). TRL: Transformer Reinforcement Learning. GitHub.
