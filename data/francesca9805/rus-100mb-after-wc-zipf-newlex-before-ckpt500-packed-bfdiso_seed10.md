# francesca9805/rus-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/rus-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10` es un ajuste fino de tipo SFT (supervised fine-tuning) sobre el checkpoint base `francesca9805/ppt-wc-zipf-newlex-rus-before-100mb-packed-bfdiso_seed10`, publicado en Hugging Face por el usuario `francesca9805`. Con 124.770.816 parámetros (unos 124,8 millones) y arquitectura declarada GPT-2, se trata de un modelo pequeño de generación de texto, orientado aparentemente a experimentación con tokenizadores y preentrenamiento en ruso, según se deduce del identificador del repositorio y del nombre del proyecto de Weights & Biases asociado (`new-tokenizers`, cuenta `f-padovani-university-of-groningen`).

El modelo se ha entrenado con la librería TRL (versión 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0, y se distribuye únicamente en formato safetensors. No hay información pública sobre el dataset de ajuste, el número de tokens, el idioma final soportado ni la licencia, y el repositorio no registra descargas en el momento de redactar esta ficha.

Su relevancia es fundamentalmente de investigación: sirve como artefacto reproducible dentro de una línea de experimentos sobre tokenización y ajuste supervisado en modelos pequeños, más que como modelo listo para producción. No se ha publicado ningún resultado de benchmarks ni documentación sobre alineación, seguridad o comportamiento multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según la etiqueta `gpt2` del repositorio) |
| Parámetros totales | 124.770.816 (≈124,8 M, dato de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el identificador sugiere ruso, sin confirmación en la model card) |
| Licencia | no disponible (la model card indica `licence: license` sin especificar términos) |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/ppt-wc-zipf-newlex-rus-before-100mb-packed-bfdiso_seed10 |
| Tamaño del repositorio | 6,0 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Fecha de creación | 2026-10-12 (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-2, es decir, un transformer decoder-only autorregresivo con atención causal completa. El recuento de parámetros (124,77 M) coincide con el de GPT-2 small, aunque la model card no confirma la configuración concreta (número de capas, cabezas de atención, dimensión oculta ni longitud de contexto máxima). El modelo parte de un checkpoint intermedio del preentrenamiento del modelo base, identificado en el nombre como `ckpt500`, lo que sugiere que se trata de un artefacto de una etapa temprana de una ejecución de entrenamiento más larga.

El ajuste se realizó mediante SFT con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no detalla la composición del dataset de ajuste, el número de tokens vistos, si hubo etapas de RLHF o DPO, ni qué porcentaje de datos correspondía a cada idioma. El nombre del modelo apunta a un corpus empaquetado (`packed`) de aproximadamente 100 MB en ruso, y el proyecto de seguimiento en Weights & Biases se denomina `new-tokenizers`, lo que indica que el experimento gira en torno al diseño o la validación de tokenizadores. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos, etc.).

Un detalle relevante es que el ejemplo de inicio rápido de la model card usa `pipeline` con una lista de mensajes con rol (`{"role": "user", "content": ...}`), lo que sugiere la presencia de una plantilla de chat en el tokenizer, aunque esto no se confirma explícitamente en la documentación.

## Capacidades

- Generación de texto autorregresiva mediante `transformers.pipeline("text-generation")` o los pesos safetensors directamente.
- Ajuste posterior (fine-tuning) documentado con TRL, lo que facilita reentrenarlo sobre datasets propios.
- Integración con Text Generation Inference (TGI): el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`.
- Posible uso conversacional de un solo turno mediante plantilla de chat, a partir del ejemplo de la model card (no confirmado en la documentación).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Capacidades de visión, audio o modo de razonamiento explícito: no disponibles.
- Capacidades de código o matemáticas: no documentadas y poco probables dado el tamaño y el enfoque del corpus.

## Casos de uso

- Investigación sobre tokenizadores: el modelo forma parte de una serie de experimentos (`new-tokenizers`) y puede usarse para comparar el efecto de distintas estrategias de tokenización sobre la calidad de la generación en ruso.
- Reproducción de experimentos de SFT con TRL: sirve como punto de partida documentado (versiones exactas de TRL, Transformers, PyTorch y Datasets) para replicar pipelines de ajuste supervisado en modelos de ~125 M de parámetros.
- Ajuste fino en dominios concretos: al ser un modelo pequeño, se puede reentrenar por completo en una única GPU de consumo sobre datasets especializados de texto en ruso (por ejemplo, reseñas, titulares o documentación técnica).
- Generación de datos sintéticos de bajo coste: útil para aumentar corpus de texto en ruso en tareas de aumento de datos, siempre que se filtre y valide la calidad de las muestras generadas.
- Pruebas de infraestructura de despliegue: su huella de memoria (menos de 1 GB en precisión completa) lo hace adecuado para validar pipelines de TGI, endpoints compatibles con la API de Hugging Face o servidores de inferencia en entornos con recursos limitados.
- Docencia y demostraciones: permite ilustrar de extremo a extremo un flujo de preentrenamiento, ajuste con SFT y publicación en Hugging Face sin necesidad de hardware especializado.
- Prototipado de autocompletado o generación de texto corto: para borradores de texto en ruso de hasta unas pocas decenas de tokens, con revisión humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,50 GB en fp32, 0,25 GB en fp16/bf16, 0,13 GB en int8 y 0,07 GB en int4 (cálculo teórico a partir de 124,77 M de parámetros; no incluye caché KV ni activaciones).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 1-2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 están sobradamente dimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU o en CPU (el ejemplo de la model card usa `device="cuda"`, pero la inferencia en CPU es viable).
- Opciones de despliegue: `transformers` (pipeline), Text Generation Inference (etiqueta oficial del repositorio) y endpoints compatibles. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se ha publicado.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rus-100mb-after-wc-zipf-newlex-before-ckpt500-... (este modelo) | 124,8 M | no disponible | no disponible | Hugging Face, safetensors | Ajuste SFT sobre checkpoint intermedio, sin benchmarks |
| GPT-2 small | 124 M | 1024 tokens | MIT (según la model card de OpenAI en Hugging Face) | Hugging Face, safetensors y otros | Referencia de la misma arquitectura y tamaño; ampliamente evaluado |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face | Versión destilada, más rápida, menor calidad de generación |
| Pythia-160M | 160 M | 2048 tokens | Apache 2.0 | Hugging Face | Serie de modelos de investigación con checkpoints intermedios publicados |

La comparación de rendimiento con estas alternativas no es posible porque no se han publicado benchmarks del modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre perplejidad, calidad de generación ni comportamiento en tareas estándar.
- Riesgo elevado de alucinación y de texto incoherente: con 124,8 M de parámetros y un ajuste sobre un corpus reducido, la coherencia en generaciones largas es limitada.
- Checkpoint intermedio: el identificador `before-ckpt500` sugiere que el modelo base no completó su preentrenamiento, lo que puede degradar la calidad frente a un modelo entrenado por más pasos.
- Sesgos desconocidos: no se documenta composición del dataset, filtrado, deduplicación ni mitigación de sesgos.
- Idiomas no declarados: no hay lista oficial de idiomas soportados; el nombre apunta al ruso, pero se desconoce su competencia en castellano o inglés.
- Licencia ausente o ambigua: la model card indica `licence: license` sin términos concretos, por lo que el uso comercial es jurídicamente incierto y no se recomienda sin aclaración previa del autor.
- Sin documentación de alineación ni seguridad: la etiqueta `sft` no implica alineación de seguridad; no hay información sobre filtrado de contenido dañino.
- Longitud de contexto no especificada: cualquier integración en producción requeriría verificar experimentalmente el límite real de tokens.
- Repositorio de 6,0 GB para un modelo de 124,8 M de parámetros: conviene revisar qué contiene el repositorio (posibles checkpoints del optimizador u otros artefactos) antes de descargarlo.
- Cero descargas y un único like: no hay comunidad que haya validado el modelo, por lo que no existen informes independientes de comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/rus-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-rus-before-100mb-packed-bfdiso_seed10
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ft9tctus
- Documentación de Transformers: https://huggingface.co/docs/transformers
