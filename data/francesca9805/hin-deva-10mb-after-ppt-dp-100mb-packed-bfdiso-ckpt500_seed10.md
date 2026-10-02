# francesca9805/hin-deva-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10

## Resumen

El modelo `hin-deva-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10` es un ajuste fino (SFT) del checkpoint `francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed10`, publicado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo de generación de texto de arquitectura GPT-2 con 39.087.104 parámetros totales, entrenado con la librería TRL (versión 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0. El nombre del checkpoint sugiere trabajo sobre hindi en escritura devanagari ("hin-deva"), con un conjunto de datos empaquetado de 100 MB y un checkpoint en el paso 500 de entrenamiento.

El modelo es relevante como pieza de investigación en la línea de experimentos de tokenización y ajuste fino supervisado del autor (los runs de Weights & Biases están asociados al proyecto "new-tokenizers" de la Universidad de Groningen). No es un modelo de propósito general pensado para producción: su tamaño reducido y la ausencia de datos publicados sobre composición del dataset, longitud de contexto o evaluación lo sitúan en la categoría de modelo pequeño para pruebas de tokenizadores y pipelines de SFT.

La model card es la generada automáticamente por TRL y no aporta información sobre datos de entrenamiento, idiomas soportados o licencia. Todos los datos técnicos que se detallan a continuación provienen del repositorio de HuggingFace o de la información disponible; cualquier campo no documentado se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun el tag `gpt2` del repositorio) |
| Parametros totales | 39.087.104 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors en precision completa |
| Idiomas soportados | no disponible; el nombre del modelo sugiere hindi en escritura devanagari |
| Licencia | no disponible (la model card solo indica `licence: license`, sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio y la presencia del campo `base_model` apuntan a una arquitectura transformer de tipo decoder-only con atención causal, en la familia GPT-2. Con 39.087.104 parámetros, se trata de un modelo de escala muy reducida, por debajo de gpt2-small (124 M de parámetros) y en el rango de distilgpt2 (82 M) o inferior. El tamaño del repositorio (2,7 GB) es superior a lo que ocuparían los pesos en fp32 (aproximadamente 156 MB), lo que sugiere que el repo puede incluir múltiples checkpoints, estados del optimizador u otros artefactos de entrenamiento.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, tomando como punto de partida el checkpoint `francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed10`. El nombre del modelo indica un dataset de 100 MB "packed" (secuencias concatenadas para maximizar el aprovechamiento del contexto durante el entrenamiento) y un checkpoint guardado en el paso 500. No hay información publicada sobre el número total de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases posteriores de RLHF o DPO. El run de Weights & Biases enlazado en la model card pertenece al proyecto "new-tokenizers" del usuario `f-padovani-university-of-groningen`, lo que vincula este modelo a experimentos de evaluación de tokenizadores, no a un ciclo completo de alineamiento.

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado es `text-generation`, con ejemplos de uso mediante `transformers.pipeline`.
- Formato conversacional: el ejemplo de la model card pasa una lista de mensajes con el rol `user`, lo que indica que el modelo fue ajustado con una plantilla de chat o instrucciones, aunque no se documenta el chat template exacto.
- Ajuste por instrucciones (presumiblemente): la etiqueta `sft` y el uso de TRL apuntan a un ajuste supervisado sobre pares de instruccion y respuesta; no hay confirmacion documentada sobre el formato de datos.
- Multilingue: no disponible; el nombre del modelo apunta a hindi (devanagari) como idioma principal de entrenamiento.
- Tool calling / function calling: no disponible; no se documenta soporte alguno.
- Capacidades de agente o razonamiento multi-paso: no disponible; el tamano del modelo hace poco probable un rendimiento util en tareas de agente.
- Vision, audio o modos especiales (thinking mode, etc.): no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Experimentacion con tokenizadores para hindi/devaganari: el modelo pertenece a la serie "new-tokenizers", por lo que su uso principal es comparar el efecto de distintas estrategias de tokenizacion sobre la calidad del texto generado en devanagari.
- Pruebas de pipelines de SFT con TRL: sirve como banco de pruebas de bajo coste para validar configuraciones de entrenamiento, plantillas de chat y checkpoints intermedios sin necesidad de GPUs de gama alta.
- Generacion de texto en hindi para prototipos: permite generar borradores de texto en devanagari para demos internas, aceptando que la calidad estara limitada por los 39 M de parametros.
- Docencia y formacion: es un ejemplo asequible para explicar el flujo completo base model, fine-tuning con SFT, publicacion en HuggingFace y despliegue con `transformers`.
- Evaluacion comparativa de checkpoints: al existir variantes de la misma familia con distintos tamanos de dataset (10 MB, 100 MB) y semillas, permite estudiar el impacto del volumen de datos en un modelo pequeno.
- Inferencia en CPU o dispositivos con recursos minimos: por su tamano, puede ejecutarse en entornos sin GPU, lo que lo hace util para demos offline o tests de integracion continuos.
- Generacion de texto sintetico para aumentar datos de entrenamiento de modelos mayores, siempre que se valide la calidad de las muestras antes de usarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card generada por TRL no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y las busquedas web realizadas no devuelven tablas de resultados para este checkpoint ni para los de su familia.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 156 MB solo para pesos (39,09 M de parametros x 4 bytes), mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 78 MB para pesos, mas overhead de runtime.
- Compatible con cualquier GPU consumer: cabe holgadamente en GTX 1050, GTX 1650, RTX 3060, RTX 4090 y superiores, con un consumo de memoria muy inferior a 1 GB en la mayoria de configuraciones.
- Inferencia en CPU: viable y con latencias de pocos milisegundos a decimas de segundo por token, dependiendo del hardware.
- Opciones de despliegue: `transformers` (pipeline de text-generation) de forma nativa; llama.cpp u Ollama requeririan conversion previa a GGUF, no publicada en el repositorio; vLLM y TGI son compatibles en teoria al ser un modelo GPT-2, pero no hay configuracion publicada ni pruebas documentadas.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Almacenamiento: el repositorio ocupa 2,7 GB, muy por encima del peso de los pesos, por lo que conviene revisar que artefactos adicionales se descargan antes de desplegarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/hin-deva-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10 | 39,09 M | no disponible | no disponible | HuggingFace | Ajuste SFT del checkpoint base de la misma serie |
| francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed10 | no disponible | no disponible | no disponible | HuggingFace | Modelo base declarado en la model card |
| francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | HuggingFace | Variante de la misma familia con otra configuracion de datos |
| francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407 | no disponible | no disponible | no disponible | HuggingFace | Variante con dataset de 10 MB y otra semilla |

No se dispone de modelos externos comparables con datos verificados en la informacion proporcionada; la comparativa se limita, por tanto, a los checkpoints de la misma familia publicados por el autor.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluacion de sesgo ni se conoce la composicion del dataset de entrenamiento.
- Riesgo de alucinacion: elevado en terminos relativos, dado el tamano reducido del modelo (39 M de parametros) y la ausencia de fases de alineamiento documentadas mas alla del SFT.
- Limitaciones de contexto: se desconoce la longitud de contexto efectiva; en la familia GPT-2 es habitual un limite de 1024 tokens, pero no hay confirmacion para este checkpoint.
- Limitaciones de idioma: el modelo parece orientado al hindi en devanagari; no hay datos sobre su comportamiento en castellano, ingles u otras lenguas.
- Licencia: la model card incluye el campo `licence: license` sin especificar terminos, por lo que no se puede confirmar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Uso en produccion: no recomendado sin una evaluacion previa; el modelo no tiene benchmarks publicados, no tiene descargas ni likes en HuggingFace y su model card es autogenerada.
- Repositorio sobredimensionado: 2,7 GB para un modelo de 39 M de parametros implica artefactos adicionales que pueden complicar el despliegue y el versionado.
- Trazabilidad: el nombre incluye un checkpoint concreto (`ckpt500`), por lo que el modelo representa un estado intermedio de entrenamiento y no necesariamente el mejor de la serie.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10
- Modelo base declarado: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Variante de la familia (seed10, sin "after-ppt"): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante con dataset de 10 MB: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Variante en FriendliAI: https://friendli.ai/models/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Registro en free2aitools: https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-10mb-packed-bfd-seed3407
- Entrada en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fhin-deva-10mb-ppt-Dp-100mb_seed10,2gxqbfb7x05raV9Acig3xV
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/1x9evosr
- Repositorio de TRL: https://github.com/huggingface/trl
