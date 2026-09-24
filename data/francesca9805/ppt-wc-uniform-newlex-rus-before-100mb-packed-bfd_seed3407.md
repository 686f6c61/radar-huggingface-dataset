# francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfd_seed3407` es un ajuste fino de tipo SFT (supervised fine-tuning) realizado por el usuario francesca9805 sobre el checkpoint monolingüe `goldfish-models/eng_latn_100mb`. Se trata de un transformer decoder-only de la familia GPT-2 con 86.508.288 parámetros (según los pesos publicados en safetensors) y un repositorio de 0,2 GB, lo que lo sitúa en la gama de modelos pequeños capaces de ejecutarse en hardware muy modesto.

El modelo se entrenó con la librería TRL (versión 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1, y su nombre sugiere que forma parte de un experimento académico sobre tokenizadores (el run de Weights & Biases asociado pertenece al proyecto "new-tokenizers" del grupo de F. Padovani, University of Groningen). El sufijo del nombre alude a un corpus de 100 MB "packed", a un supuesto componente en ruso ("rus") y a una semilla concreta (seed 3407), lo que apunta a un checkpoint de investigación más que a un modelo listo para producción.

Su relevancia actual es fundamentalmente metodológica: sirve para reproducir y auditar experimentos de ajuste fino con TRL sobre modelos GPT-2 pequeños, y como banco de pruebas de bajo coste para pipelines de generación de texto. No cuenta con métricas publicadas, no declara licencia y no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2`, `transformers`) |
| Parámetros totales | 86.508.288 (dato real de los safetensors publicados) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (la arquitectura GPT-2 suele emplear 1024 tokens; valor no confirmado en la información proporcionada) |
| Tipos de cuantización | No se publican versiones cuantizadas; los pesos se distribuyen en safetensors (precisión original no indicada) |
| Idiomas soportados | No disponible en la model card; el modelo base es de inglés (`eng_latn`, corpus de 100 MB) |
| Licencia | No disponible (el campo `licence: license` de la model card no especifica términos) |
| Formato de pesos | Safetensors (`transformers`) |
| Modelo base | `goldfish-models/eng_latn_100mb` |
| Método de ajuste | SFT con TRL 0.23.0 |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | `text-generation` |
| Compatibilidad | `text-generation-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only autorregresivo de la familia GPT-2, heredada del checkpoint base `goldfish-models/eng_latn_100mb`. Ese modelo base pertenece a la colección Goldfish de modelos monolingües pequeños y, por el identificador `eng_latn`, corresponde a un entrenamiento sobre aproximadamente 100 MB de texto en inglés con escritura latina. Con 86,5 millones de parámetros, el modelo es más pequeño que GPT-2 small (124 M), diferencia coherente con un vocabulario reducido, algo habitual en experimentos de tokenización como el que sugiere el nombre del checkpoint ("newlex", proyecto "new-tokenizers").

El ajuste se realizó mediante SFT supervisado con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El ejemplo de uso de la model card emplea el formato de mensajes con rol `user`, lo que indica que el ajuste se hizo sobre datos conversacionales o de instrucciones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Todos esos datos figuran como no disponibles.

## Capacidades

- Generación de texto autorregresiva en el formato de chat simple (`role: user`) que muestra la model card.
- Seguimiento básico de instrucciones, derivado del ajuste fino supervisado con TRL sobre el checkpoint base.
- Generación de respuestas a preguntas abiertas y prompts conversacionales de un solo turno; el ejemplo oficial usa `max_new_tokens=128`.
- Ejecución mediante `pipeline("text-generation")` de Transformers, con soporte de GPU (`device="cuda"`).
- Compatibilidad declarada con Text Generation Inference y con endpoints de Inferencia de Hugging Face.
- Capacidades multilingües: no disponibles; el modelo base es inglés y el componente "rus" del nombre no está confirmado en la información.
- Tool calling / function calling: no disponible, no declarado.
- Uso como agente o razonamiento multi-paso: no disponible, no declarado.
- Visión, audio o modos de "thinking": no disponibles, no declarados.

## Casos de uso

- Prototipado rápido de pipelines de generación de texto: al ocupar 0,2 GB en disco y 86,5 M de parámetros, permite validar código de inferencia con Transformers, TGI o endpoints en segundos, sin aprovisionar GPU de gama alta.
- Reproducción de experimentos de ajuste fino con TRL: el checkpoint conserva en su model card las versiones exactas de TRL (0.23.0), Transformers (4.56.2) y PyTorch (2.5.1), lo que facilita replicar el entrenamiento SFT y comparar configuraciones de tokenizador.
- Investigación sobre tokenizadores multilingües: el nombre del modelo y el run asociado de Weights & Biases ("new-tokenizers") lo vinculan a estudios de vocabulario; sirve como punto de comparación frente a otros checkpoints de la misma serie con tokenizadores distintos.
- Docencia y formación en ajuste fino: es un caso de estudio económico para explicar el flujo completo de SFT (dataset de instrucciones, plantilla de chat, métricas de pérdida) sin necesidad de clústeres.
- Generación de texto en dispositivos de bajos recursos: cabe en CPU, Raspberry Pi o GPU integradas, por lo que puede usarse en demos offline, plugins de escritorio o entornos educativos sin conexión.
- Evaluación comparativa de infraestructura de servicio: al ser un modelo diminuto compatible con TGI y endpoints, permite medir latencia, throughput y consumo de memoria de un stack de despliegue antes de escalar a modelos mayores.
- Generación de datos sintéticos de bajo valor añadido: puede usarse para poblar corpus de prueba o de relleno en inglés, siempre que se revise y filtre la calidad, dado el escaso volumen de datos de entrenamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,35 GB de pesos; en fp16/bf16, unos 0,17 GB; en int8, unos 0,09 GB; en int4, unos 0,04 GB. Añadir el coste de la caché KV y de activaciones, que con 86,5 M de parámetros es reducido.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente (RTX 3050, RTX 4060, T4, L4). Aceleradores de gama alta como A100 o H100 funcionan, pero están enormemente sobredimensionados.
- Cabe en GPU de consumo: sí, en toda la gama consumer actual e incluso en GPUs integradas y en CPU. También es viable en dispositivos tipo Raspberry Pi 4/5 o portátiles sin GPU dedicada.
- Opciones de despliegue: Transformers (`pipeline`), Text Generation Inference (declarado en las etiquetas), endpoints de Inferencia de Hugging Face y vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no se han publicado cifras medidas. Como estimación orientativa para un modelo denso de este tamaño en fp16 sobre una GPU moderna, la decodificación en batch 1 se sitúa en el orden de cientos de tokens por segundo, y en CPU en el orden de decenas; son valores estimados, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfd_seed3407` | 86,5 M | No disponible | No disponible | Hugging Face, 0 descargas |
| `goldfish-models/eng_latn_100mb` (base) | No confirmado | No disponible | No disponible en esta ficha | Hugging Face (modelo base) |
| GPT-2 small | 124 M | 1024 tokens | Licencia de OpenAI para los pesos (con restricciones) | Ampliamente disponible |
| SmolLM2-135M | 135 M | 8192 tokens | Apache 2.0 | Hugging Face, muy extendido |

La comparación cuantitativa de rendimiento con estas alternativas no es posible porque este checkpoint no publica resultados de benchmarks. La diferencia principal frente a GPT-2 small y SmolLM2-135M no es el tamaño, sino el nivel de documentación y de soporte: aquellos incluyen licencia explícita, contexto declarado y evaluaciones públicas, mientras que este checkpoint carece de esos elementos.

## Limitaciones y advertencias

- Licencia no especificada: el campo `licence: license` de la model card no define términos legales, por lo que no hay base clara para un uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de perplejidad, de modo que el rendimiento real es desconocido y no verificable.
- Riesgo elevado de alucinación: el modelo base se entrenó con aproximadamente 100 MB de texto inglés, un volumen muy reducido que limita el conocimiento factual y favorece respuestas inventadas.
- Idiomas: la model card no declara idiomas soportados; el componente "rus" del nombre sugiere experimentación con ruso, pero no está confirmado ni evaluado, y la base es inglesa.
- Ventana de contexto limitada o no documentada: aunque GPT-2 suele operar con 1024 tokens, el valor real de este checkpoint no se especifica, lo que impide planificar conversaciones largas o documentos extensos.
- Naturaleza experimental: el nombre contiene referencias a una semilla concreta y a un checkpoint intermedio ("before-100mb"), por lo que probablemente sea uno de varios artefactos de un estudio y no una versión final curada.
- Sin validación comunitaria: cero descargas y cero valoraciones implican que no hay retroalimentación externa sobre su calidad, estabilidad o comportamientos indeseados.
- Sin versiones cuantizadas oficiales: para usar GGUF en llama.cpp u Ollama hay que realizar la conversión por cuenta propia, asumiendo el riesgo de degradación.
- Sesgos: no evaluados. Al entrenarse sobre un corpus monolingüe pequeño, es previsible que reproduzca sesgos presentes en ese corpus, sin que existan informes al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/bm1cds82
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL (von Werra et al., 2020): https://github.com/huggingface/trl (referencia BibTeX incluida en la model card)
