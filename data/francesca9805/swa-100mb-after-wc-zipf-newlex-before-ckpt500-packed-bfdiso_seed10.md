# francesca9805/swa-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10

## Resumen

El modelo `swa-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10` es un ajuste fino de generación de texto publicado por el usuario francesca9805 en HuggingFace. Se trata de un transformer decoder-only de tipo GPT-2 (así lo indica el tag `gpt2` del repositorio) con 124.770.816 parámetros totales, según los datos de los archivos safetensors. Deriva del modelo base `francesca9805/ppt-wc-zipf-newlex-swa-before-100mb-packed-bfdiso_seed10` y se ha entrenado mediante SFT (supervised fine-tuning) con la librería TRL.

Por el nombre del repositorio y el del modelo base se deduce que forma parte de una línea de experimentación de investigación sobre tokenizadores (`newlex`, `zipf`), posiblemente atención de ventana deslizante (`swa`), empaquetado de secuencias (`packed`), precisión bf16 y control de semilla (`seed10`). La model card, sin embargo, no documenta el conjunto de datos, la composición del entrenamiento, la longitud de contexto ni los idiomas soportados.

El modelo acumula 0 descargas y 0 likes, y no presenta resultados de benchmarks ni una licencia declarada de forma explícita. Se trata, por tanto, de un artefacto de investigación experimental más que de un modelo listo para producción, y su interés principal es el estudio del impacto del tokenizador y de la configuración de entrenamiento en modelos pequeños de 124 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (según tag `gpt2` del repositorio) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, según el tag `gpt2` del repositorio, con 124.770.816 parámetros, un tamaño que coincide con el de GPT-2 small. El nombre del modelo incluye el acrónimo `swa`, que en la literatura suele corresponder a sliding window attention (atención de ventana deslizante), aunque la model card no confirma esta característica ni detalla la configuración de atención. Tampoco se especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni el tamaño de vocabulario resultante del tokenizador experimental (`newlex`).

El entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni el régimen de precisión exacto (`bfdiso` en el nombre sugiere bf16, sin confirmación). El autor enlaza una ejecución de Weights & Biases en el proyecto «new-tokenizers» de la Universidad de Groningen, lo que refuerza la hipótesis de que se trata de un experimento académico sobre tokenización.

## Capacidades

- Generación de texto autoregresiva: el pipeline de ejemplo genera respuestas a partir de mensajes con rol de usuario, con control de `max_new_tokens`.
- Formato conversacional: la model card usa una estructura de mensajes con `role` y `content`, lo que indica que el ajuste SFT se orientó a diálogo de un solo turno o multi-turno.
- Generación condicionada por prompt: admite cualquier instrucción textual dentro de los límites del tokenizador entrenado.
- Capacidades multilingües: no disponibles (no se declara ningún idioma en la ficha).
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no documentado.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con endpoints de HuggingFace (tag `endpoints_compatible`) a nivel de despliegue, no de capacidad funcional.

## Casos de uso

- Investigación sobre tokenizadores: el modelo sirve como punto de comparación para medir cómo un vocabulario nuevo (`newlex`) y una distribución Zipf afectan a la perplejidad y a la calidad de generación frente a un tokenizador estándar.
- Reproducción de experimentos académicos: al estar vinculado a una ejecución concreta de Weights & Biases, permite reproducir y auditar una configuración de SFT (TRL 0.23.0, semilla 10, secuencias empaquetadas).
- Generación de texto breve en prototipos: con 124 millones de parámetros puede ejecutarse en local para producir frases, títulos o continuaciones de texto en fase de pruebas, sin coste de API.
- Base para fine-tuning posterior: su tamaño reducido permite reentrenarlo o ajustarlo en una GPU de consumo para tareas concretas (clasificación de texto, generación de plantillas, chatbots de dominio cerrado).
- Docencia y experimentación con transformers: es un ejemplo práctico de SFT con TRL y de empaquetado de secuencias para cursos de NLP.
- Pruebas de pipeline de despliegue: al declarar compatibilidad con text-generation-inference y endpoints, puede usarse para validar infraestructuras de servicio con un modelo ligero antes de escalar a modelos mayores.
- Generación de datos sintéticos a pequeña escala: puede emplearse para producir ejemplos preliminares que luego se filtren con modelos de mayor tamaño, dado su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 124,77 M de parámetros):
  - FP32: en torno a 500 MB.
  - FP16 / BF16: en torno a 250 MB.
  - int8: en torno a 125 MB.
  - int4: en torno a 65 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). Modelos de este tamaño quedan sobredimensionados en GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: `transformers` con `pipeline` (método indicado en la model card), Text Generation Inference (tag `text-generation-inference`) y endpoints de HuggingFace (tag `endpoints_compatible`). No se confirma compatibilidad con llama.cpp, Ollama o vLLM, aunque al ser una arquitectura GPT-2 estándar podría convertirse a GGUF.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, la latencia sería muy baja en cualquier hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Este modelo | 124,77 M | no disponible | no disponible | HuggingFace (0 descargas) | no disponible |
| GPT-2 small | 124 M | 1024 tokens | MIT (modificada) | HuggingFace | benchmarks publicos disponibles en su model card |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | HuggingFace | benchmarks publicos disponibles en su model card |
| SmolLM2-135M | 135 M | 2048 tokens | Apache 2.0 | HuggingFace | benchmarks publicos disponibles en su model card |

No se dispone de métricas de este modelo que permitan una comparación cuantitativa directa con las alternativas; la comparación se limita a tamaño, contexto declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada de forma inequívoca: la model card incluye `licence: license` como marcador sin valor real, y el campo de licencia del repositorio aparece como «no disponible». El uso comercial queda en un limbo legal y no debería asumirse permisividad.
- Idiomas no documentados: no se indica qué lenguas domina, por lo que no puede garantizarse un comportamiento correcto fuera del idioma de entrenamiento, presumiblemente inglés.
- Longitud de contexto desconocida: no se especifica la ventana de contexto soportada, lo que impide planificar usos con entradas largas.
- Riesgo elevado de alucinación: con 124 millones de parámetros y sin datos sobre el volumen de entrenamiento, la fiabilidad factual es muy limitada.
- Ausencia total de benchmarks: no hay evidencia pública de calidad, por lo que no debe emplearse en producción sin una evaluación propia.
- Adopción nula: 0 descargas y 0 likes, sin comunidad que haya validado el modelo.
- Tokenizador experimental: al usar un vocabulario nuevo, puede presentar incompatibilidades con herramientas estándar y un rendimiento distinto al de tokenizadores consolidados.
- Naturaleza de investigación: el nombre del repositorio refleja un punto de control intermedio (`ckpt500`) dentro de una ejecución experimental, no una versión final optimizada.
- Sin garantías de mantenimiento: no se documentan actualizaciones ni soporte posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-swa-before-100mb-packed-bfdiso_seed10
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/w1hjqbwj
- Repositorio de TRL: https://github.com/huggingface/trl
