# francesca9805/eus-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/eus-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10` es un ajuste fino supervisado (SFT) de 124.770.816 parametros sobre la arquitectura GPT-2, publicado por el usuario de HuggingFace francesca9805. Parte del modelo base `francesca9805/ppt-wc-zipf-newlex-eus-after-100mb-packed-bfdiso_seed10` y se ha entrenado con la libreria TRL en su version 0.23.0, lo que lo situa en la categoria de los modelos densos tipo decoder-only de escala reducida (aproximadamente 124 millones de parametros, comparable a GPT-2 small).

Por el identificador se deduce que el trabajo se enmarca en un proyecto de investigacion sobre tokenizacion y modelado de una lengua concreta: el sufijo `eus` corresponde al codigo ISO 639-2 del euskera, y los fragmentos `zipf`, `newlex` y `100mb` apuntan a experimentos sobre distribuciones lexicas (ley de Zipf), ampliacion de vocabulario y un corpus de entrenamiento de unos 100 MB empaquetado (packed). El repositorio ocupa 5,7 GB, muy por encima de lo que requeriria el peso puro del modelo en bf16 (unos 250 MB), lo que sugiere la presencia de multiples checkpoints o estados del optimizador.

Su relevancia es fundamentalmente academica y de investigacion: se trata de un modelo pequeno, sin datos publicados de benchmarks, sin licencia declarada de forma efectiva y con cero descargas en el momento de redactar esta ficha. No es un modelo pensado para produccion, sino una pieza dentro de una linea de experimentos sobre lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only denso) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no la especifica; GPT-2 base usa 1024 tokens como referencia no confirmada) |
| Tipos de cuantizacion | no se han publicado cuantizaciones oficiales; pesos en safetensors |
| Idiomas soportados | no disponible en la model card; el sufijo `eus` del identificador apunta al euskera |
| Licencia | no disponible (la model card contiene un campo placeholder `licence: license`) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | francesca9805/ppt-wc-zipf-newlex-eus-after-100mb-packed-bfdiso_seed10 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Tamano del repositorio | 5,7 GB |
| Fecha de creacion | 2026-10-13 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con 124,77 millones de parametros. No se trata de un modelo MoE, ni hibrido, ni basado en SSM: es un denso clasico de atencion completa. La model card no describe ninguna innovacion arquitectonica adicional (no se mencionan decodificacion especulativa, atencion lineal, ventanas deslizantes ni variantes de RoPE), por lo que cabe asumir la configuracion estandar GPT-2 publicada por OpenAI, aunque este extremo no esta confirmado por el autor.

El entrenamiento se realizo mediante SFT con la libreria TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El autor enlaza una ejecucion de Weights & Biases (`new-tokenizers/runs/bm289qy0`) para el seguimiento del entrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Los indicios del nombre (`100mb`, `packed`, `zipf`, `newlex`, `ckpt500`) sugieren un corpus empaquetado de aproximadamente 100 MB, un vocabulario o lexico nuevo y un checkpoint correspondiente al paso 500, pero ninguno de estos extremos se detalla en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en la linea de los modelos GPT-2.
- Ajuste por instrucciones mediante SFT: el ejemplo de la model card usa el formato de chat con roles (`{"role": "user", "content": ...}`), aunque el modelo no dispone de plantilla de chat documentada.
- Capacidad multilingue: no disponible; por el identificador se orienta al euskera.
- Razonamiento complejo, matematicas y codigo: no documentado ni verificado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, modo de pensamiento): no disponibles.
- No se ha publicado ninguna evaluacion funcional de capacidades.

## Casos de uso

- Investigacion sobre tokenizacion de lenguas de bajos recursos: el modelo permite comparar como afecta un vocabulario nuevo (`newlex`) a la generacion de texto en euskera frente al modelo base, midiendo perplejidad y cobertura lexica.
- Reproducibilidad de experimentos sobre la ley de Zipf: sirve como punto de control intermedio (paso 500) para estudiar la evolucion de la distribucion de frecuencias durante el entrenamiento.
- Generacion de texto sintetico en euskera para aumento de datos: con 124M de parametros puede producir frases de forma rapida y en grandes volumenes, utiles como material auxiliar en pipelines de bajo coste.
- Linea base academica en trabajos de comparacion: al ser un modelo pequeno y documentado en su procedencia (modelo base y checkpoint), es util como referencia inferior en estudios de escalado o de ajuste fino.
- Inferencia en CPU o dispositivos de bajos recursos: el tamano reducido permite ejecutarlo en portatiles o entornos sin GPU para pruebas de concepto linguisticas.
- Experimentos de ajuste fino posterior (continued pretraining / SFT adicional) sobre euskera: parte de un checkpoint ya adaptado al idioma, lo que reduce el coste de un nuevo ajuste.
- Docencia y divulgacion: adecuado para ilustrar el ciclo completo de SFT con TRL y el seguimiento con W&B sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 250 MB; con la cache KV y el overhead del runtime, la inferencia cabe en menos de 1 GB de VRAM.
- En fp32, los pesos ocupan aproximadamente 500 MB, con un consumo total por debajo de 1,5 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 no suponen ninguna restriccion. El modelo es claramente sobredimensionado para estas GPUs en terminos de capacidad.
- Cabe holgadamente en cualquier GPU de consumo, incluidas tarjetas con 4 GB o menos, e incluso en GPU integradas con memoria compartida.
- Inferencia en CPU: viable, con latencias interactivas en procesadores modernos.
- Opciones de despliegue: transformers (pipeline de text-generation), Text Generation Inference (la etiqueta `text-generation-inference` y `endpoints_compatible` estan presentes en el repositorio), vLLM, y llama.cpp u Ollama si se genera previamente una conversion a GGUF (no publicada oficialmente).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano, se espera un throughput alto en GPU, coherente con un modelo de 124M de parametros, pero no hay mediciones publicadas.
- Nota: el repositorio de 5,7 GB muy probablemente incluye checkpoints intermedios o estados de optimizador, por lo que la descarga completa no refleja el tamano real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Contexto de uso |
|---|---|---|---|---|
| Este modelo (francesca9805/eus-...) | 124,77 M | no disponible | no disponible | Ajuste fino SFT para euskera, investigacion |
| GPT-2 small (referencia de la familia) | 124 M | 1024 | MIT (version de OpenAI) | Generacion de texto en ingles, linea base general |
| DistilGPT-2 (referencia de la familia) | 82 M | 1024 | MIT (version de OpenAI) | Generacion de texto ligera, destilada |
| Modelos especificos de euskera (por ejemplo, la familia Latxa de HiTZ) | no disponible | no disponible | no disponible | LLM orientados al euskera de mayor escala |

La comparacion con GPT-2 small y DistilGPT-2 es aproximada por tamano y arquitectura, pero no por idioma ni por datos de entrenamiento: este modelo esta orientado al euskera y carece de evaluaciones publicadas, mientras que los modelos de OpenAI si disponen de resultados conocidos. No se dispone de datos numericos suficientes para una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada de perplejidad, MMLU, HumanEval, GSM8K ni similares, por lo que no es posible evaluar su calidad real.
- Licencia no declarada de forma efectiva: el campo de licencia de la model card contiene un placeholder (`licence: license`), lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier uso en produccion.
- Riesgo elevado de alucinacion: por su tamano (124M de parametros) y su naturaleza GPT-2, la coherencia en generaciones largas es limitada y la fidelidad factual no esta garantizada.
- Sesgos: no documentados, pero un modelo de este tamano entrenado sobre un corpus de 100 MB hereda los sesgos presentes en esos datos.
- Limitaciones de idioma: el identificador apunta al euskera, pero no se confirma el alcance multilingue ni la calidad por idioma.
- Limitaciones de contexto: la longitud de contexto no esta declarada; si se asume la configuracion estandar de GPT-2, seria de 1024 tokens, insuficiente para tareas de contexto largo.
- Sin plantilla de chat documentada: el ejemplo de la model card usa roles, pero no se especifica el formato exacto de prompt que se uso durante el SFT, lo que puede degradar el rendimiento si no se replica.
- Trazabilidad limitada: con cero descargas y cero likes, no hay evidencia de uso o validacion externa.
- Discrepancia de tamano: el repositorio de 5,7 GB frente a los 124,77M de parametros sugiere artefactos adicionales; conviene revisar los archivos antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-eus-after-100mb-packed-bfdiso_seed10
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/bm289qy0
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita del autor): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020, https://github.com/huggingface/trl
- No se han encontrado papers, blogs ni demos adicionales asociados al modelo en la busqueda web disponible.
