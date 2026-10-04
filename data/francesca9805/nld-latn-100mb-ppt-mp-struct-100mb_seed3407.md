# francesca9805/nld-latn-100mb-ppt-mp-struct-100mb_seed3407

## Resumen

El modelo `francesca9805/nld-latn-100mb-ppt-mp-struct-100mb_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/nld_latn_100mb`, publicado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo de generación de texto de arquitectura GPT-2 con 124.770.816 parámetros totales (aproximadamente 125 M), lo que lo sitúa en la categoría de modelos pequeños, aptos para ejecución en CPU o en GPU de consumo. El entrenamiento se realizó con la librería TRL (versión 0.23.0) mediante SFT, según indica la propia model card.

El nombre del repositorio sigue una convención experimental muy específica (`ppt-mp-struct-100mb` + semilla `seed3407`), lo que sugiere que forma parte de una batería de experimentos académicos sobre recetas de datos, tokenizadores y currículos de entrenamiento, más que de un modelo orientado a producción. De hecho, la ejecución de Weights & Biases enlazada pertenece al proyecto "new-tokenizers" de la Universidad de Groningen, lo que refuerza la hipótesis de un contexto de investigación. El repositorio tiene un tamaño de 0,3 GB y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes.

La relevancia de este modelo es, por tanto, fundamentalmente metodológica: sirve como punto de comparación reproducible (semilla fija) dentro de una familia de variantes del mismo modelo base. No se dispone de información publicada sobre licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), según el tag `gpt2` de HuggingFace; no se detalla la configuración exacta de capas y cabezas |
| Parámetros totales | 124.770.816 (dato real de los pesos en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; es técnicamente convertible a int8/int4 y GGUF, pero no se ofrece) |
| Idiomas soportados | no disponible (el identificador `nld_latn` del modelo base sugiere neerlandés en escritura latina, sin confirmación en la model card) |
| Licencia | no disponible (la model card indica únicamente `licence: license`) |
| Formato de pesos | safetensors (confirmado por los tags del repositorio), cargable con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only de tipo GPT-2, tal y como declara el tag `gpt2` del repositorio. Con 124.770.816 parámetros, el modelo se corresponde con la escala de GPT-2 base (124 M), aunque no se especifican en la información disponible el número de capas, la dimensión de los embeddings, el número de cabezas de atención ni la longitud máxima de secuencia. El modelo parte de `goldfish-models/nld_latn_100mb`, un modelo monolingüe de la familia Goldfish (modelos pequeños entrenados por idioma), y ha sido ajustado posteriormente.

Respecto al entrenamiento, la model card confirma que se utilizó SFT (supervised fine-tuning) con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros como la tasa de aprendizaje, el tamaño de lote o el número de épocas. La ejecución asociada en Weights & Biases (`new-tokenizers`, semilla 3407) apunta a un experimento sobre tokenizadores y estructuras de datos, pero el detalle no está disponible en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva: es la capacidad principal declarada (pipeline `text-generation`), orientada a completar o continuar texto.
- Ajuste por instrucciones básico: el ejemplo de la model card invoca el pipeline pasando una lista de mensajes con rol `user`, lo que indica un formato conversacional de un solo turno.
- Generación de texto corto: adecuada para respuestas de hasta 128 tokens nuevos en el ejemplo publicado.
- Integración con el ecosistema transformers: carga directa mediante `pipeline`, `AutoModelForCausalLM` y compatibilidad con text-generation-inference (`endpoints_compatible`).
- Capacidad de razonamiento, código, matemáticas o visión: no disponible; no hay evidencia de que el modelo haya sido entrenado para estas tareas.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño y el tipo de ajuste no lo hacen esperable.
- Capacidades multilingües: no disponibles; el identificador del modelo base apunta a un único idioma (neerlandés), pero no se confirma.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Reproducibilidad de experimentos académicos: dado que el repositorio incluye una semilla fija (`seed3407`) y una receta concreta (`ppt-mp-struct-100mb`), el caso más realista es usarlo como punto de comparación reproducible frente a otras variantes de la misma familia al estudiar el efecto de distintas recetas de datos o tokenizadores.
- Prototipado de pipelines de SFT: sirve como banco de pruebas de bajo coste para validar un flujo completo de ajuste supervisado con TRL antes de escalarlo a modelos mayores, ya que 125 M de parámetros permiten iterar en minutos sobre una sola GPU.
- Generación de texto corto en local sobre CPU: con pesos en fp32 de aproximadamente 500 MB, el modelo cabe en memoria RAM convencional y puede ejecutar inferencia sin GPU mediante `transformers`, útil para demos docentes o pruebas de concepto desconectadas.
- Autocompletado ligero en herramientas de escritura: para completar frases o párrafos cortos en el idioma del modelo base, con latencia baja por el reducido número de parámetros, siempre que se valide antes la calidad real de las salidas.
- Aumento de datos y generación de texto sintético: puede emplearse para producir variaciones de texto corto en experimentos de NLP de bajo presupuesto, aceptando que la coherencia en secuencias largas será limitada.
- Fine-tuning posterior específico de dominio: al ser un modelo pequeño con licencia no especificada, es viable reajustarlo para una tarea concreta (clasificación mediante cabeza adicional, resumen de frases cortas, normalización de texto) si la licencia del modelo base lo permite, extremo que debe verificarse.
- Evaluación comparativa de modelos pequeños: como miembro de una familia numerosa de variantes publicadas por el mismo autor, permite medir el impacto de cambios en el corpus (`100mb` frente a `10mb`) o en el empaquetado de datos (`packed`, `structured`) manteniendo constante la arquitectura.
- Enseñanza de conceptos de transformers: por su tamaño y su integración estándar con `transformers`, es adecuado para ilustrar carga de pesos, tokenización y generación autoregresiva en un aula o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para este modelo, y tampoco se proporcionan métricas de pérdida, perplejidad o comparaciones con el modelo base. No se deben inferir valores a partir del nombre del repositorio ni de la familia a la que pertenece.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad | no disponible |
| Comparación con el modelo base | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de los 124,77 M de parámetros, no son cifras publicadas por el autor):
  - fp32: aproximadamente 0,50 GB solo de pesos.
  - fp16 / bf16: aproximadamente 0,25 GB solo de pesos.
  - int8: aproximadamente 0,13 GB solo de pesos.
  - int4: aproximadamente 0,07 GB solo de pesos.
  - Un tercero (LLM Explorer) indica 0,2 GB de VRAM para una variante de la misma familia de 124,8 M de parámetros.
- Repositorio completo en disco: 0,3 GB.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con 2 GB o más de memoria es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100; también es viable la inferencia en CPU.
- ¿Cabe en GPU de consumo? Sí, con margen amplio, en cualquier GPU de consumo con al menos 1-2 GB de VRAM, e incluso en iGPU compartiendo memoria del sistema.
- Opciones de despliegue: `transformers` (soporte confirmado en la model card); text-generation-inference (el repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`); FriendliAI (aparece como proveedor para una variante de la familia). `vLLM`, `llama.cpp`, `Ollama` o `TGI` autohospedado no están confirmados para este repositorio concreto, aunque serían viables en principio; para `llama.cpp` u `Ollama` haría falta convertir los pesos a GGUF, conversión que no se ofrece publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/nld-latn-100mb-ppt-mp-struct-100mb_seed3407 | 124.770.816 | no disponible | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) |
| goldfish-models/nld_latn_100mb (modelo base) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | HuggingFace |
| francesca9805/nld-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455 (variante hermana) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | HuggingFace |
| francesca9805/nld-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed10 (variante hermana) | 124,8 M (según LLM Explorer) | no disponible | no disponible | no disponible | HuggingFace; listado en LLM Explorer |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento entre estas variantes. La comparación posible es estructural (mismo modelo base, distinto corpus o empaquetado de datos y distinta semilla) y no de calidad. Tampoco se dispone de información sobre licencias, lo que impide comparar condiciones de uso comercial.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad de las generaciones. Cualquier uso en producción exige una evaluación propia previa.
- Riesgo elevado de alucinación y de incoherencia: con 125 M de parámetros y un ajuste SFT sin datos de preferencias documentados, es esperable que el modelo produzca texto fluido pero factualmente poco fiable y que pierda coherencia en secuencias largas.
- Longitud de contexto desconocida: no se especifica la ventana máxima, por lo que no se puede garantizar el comportamiento en conversaciones multi-turno o documentos largos.
- Idiomas no confirmados: el identificador apunta a neerlandés (`nld_latn`), pero la model card no declara idiomas. No hay garantía de un rendimiento aceptable en castellano ni en otras lenguas.
- Licencia no disponible: la model card solo indica `licence: license`, sin especificar términos. No se puede asumir permiso para uso comercial; hay que consultar con el autor y verificar la licencia del modelo base `goldfish-models/nld_latn_100mb` antes de cualquier despliegue.
- Sesgos no evaluados: no se ha publicado ningún análisis de sesgos, toxicidad o representación. Al derivar de un corpus de 100 MB, es probable que herede los sesgos de esa fuente, que tampoco se documenta.
- Procedencia del ajuste poco documentada: se desconoce el dataset de SFT, el número de tokens, los hiperparámetros y si hubo filtrado de datos. Esto dificulta auditar el comportamiento del modelo.
- Trazabilidad del repositorio: 0 descargas y 0 likes, sin historial de uso; es un artefacto de investigación sin validación por parte de la comunidad.
- Formato conversacional asumido: el ejemplo de la model card pasa una lista de mensajes con rol, pero no se documenta una plantilla de chat formal, por lo que el formato esperado puede no estar bien definido.
- Metadatos inconsistentes: la fecha de creación registrada (2026-10-04) resulta anómala, lo que conviene tener en cuenta al citar el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nld-latn-100mb-ppt-mp-struct-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/5d90ej1x
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana: https://huggingface.co/francesca9805/nld-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407
- Variante hermana: https://huggingface.co/francesca9805/nld-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455
- Ficha en LLM Explorer: https://llm-explorer.com/model/francesca9805%2Fnld-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed10,5VKnXDOGIjD26sdhFiII4W
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/nld-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/nld-latn-100mb-ppt-dp-10mb-packed-bfdiso_seed3407
