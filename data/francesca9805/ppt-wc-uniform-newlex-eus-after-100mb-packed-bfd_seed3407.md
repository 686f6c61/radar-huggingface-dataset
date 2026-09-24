# francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed3407

## Resumen

`francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed3407` es un modelo de generacion de texto de arquitectura GPT-2 con 86.508.288 parametros, publicado por el usuario francesca9805 en HuggingFace. Se trata de un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/eng_latn_100mb`, un modelo monolingue en ingles entrenado sobre 100 MB de texto dentro del proyecto Goldfish, que cubre cientos de idiomas con presupuestos de datos muy reducidos.

El modelo ha sido entrenado con SFT mediante la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121. El identificador del repositorio sugiere un experimento centrado en la adaptacion de lexico o tokenizador ("newlex") sobre el idioma euskera ("eus"), aunque la model card no documenta ni el dataset, ni el numero de tokens de entrenamiento, ni el idioma final soportado.

Su relevancia es limitada y estrictamente experimental: acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y no publica resultados de benchmarks. Resulta interesante unicamente como artefacto de investigacion reproducible en el ambito del ajuste fino de modelos pequenos con presupuesto de datos reducido, y como ejemplo practico del flujo de trabajo TRL + Transformers para modelos de menos de 100 M de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (tag `gpt2`) |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura base GPT-2 emplea habitualmente 1024 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors en precision original |
| Idiomas soportados | no disponible. El modelo base esta entrenado en ingles (`eng_latn`) y el identificador incluye "eus" (codigo ISO del euskera), pero la model card no lo confirma |
| Licencia | no disponible (la model card contiene el marcador de posicion "licence: license") |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion causal, correspondiente a la familia GPT-2, tal como indican los tags del repositorio (`gpt2`, `transformers`). Con 86.508.288 parametros se situa por debajo de GPT-2 small (124 M), lo que sugiere una configuracion con menos capas o con embeddings mas reducidos que la original de OpenAI. El modelo deriva directamente de `goldfish-models/eng_latn_100mb`, un modelo del proyecto Goldfish entrenado sobre un presupuesto de 100 MB de texto en ingles, disenado para explorar el rendimiento de modelos pequenos en regimenes de datos extremadamente limitados.

El entrenamiento documentado es un ajuste fino supervisado (SFT) realizado con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica el dataset empleado ni el numero de tokens, aunque el identificador ("100mb-packed", "newlex", "bfd", "seed3407") apunta a un experimento con datos empaquetados de 100 MB, una posible extension de lexico o tokenizador y una semilla fija de reproducibilidad. El entrenamiento se registro en Weights & Biases bajo el proyecto "new-tokenizers" del usuario f-padovani (University of Groningen), lo que indica un contexto de investigacion academica. No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional sobre la arquitectura base.

## Capacidades

- Generacion de texto autoregresiva en el estilo y dominio de los datos de ajuste; el ejemplo de la model card muestra generacion condicionada por un mensaje de usuario con formato de chat (`[{"role": "user", "content": ...}]`).
- Razonamiento y conocimiento general muy limitados: un modelo de 86 M de parametros entrenado sobre 100 MB de texto no retiene conocimiento factual fiable.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no confirmadas; el modelo base es monolingue en ingles y existe una posible componente en euskera no documentada.
- Capacidades especiales (modo thinking, vision, audio): ninguna documentada.
- Compatibilidad con `text-generation-inference` y endpoints, segun los tags del repositorio.

## Casos de uso

- Investigacion sobre adaptacion lexica y de tokenizador: el identificador "newlex" y el proyecto W&B "new-tokenizers" sugieren que el modelo sirve para estudiar como una reforma del lexico o del vocabulario afecta al rendimiento de un modelo pequeno; se usaria como punto de comparacion frente al modelo base y a otros brazos experimentales con semillas distintas.
- Reproducibilidad de experimentos academicos: al estar entrenado con semilla fija (`seed3407`) y framework versionado (TRL 0.23.0), permite reproducir el ajuste y comparar variantes controlando el ruido estadistico.
- Generacion de texto sintetico de bajo coste: al requerir menos de 1 GB de VRAM, puede generar grandes volumenes de texto en paralelo para aumentar datos de entrenamiento de clasificadores o para pruebas de carga, asumiendo calidad limitada.
- Prototipado local sin GPU dedicada: el modelo cabe en CPU y en cualquier GPU consumer, por lo que es util para validar pipelines de inferencia antes de migrar a modelos mayores.
- Pruebas de infraestructura de despliegue: sirve para verificar configuraciones de TGI, vLLM o endpoints compatibles con la API de HuggingFace sin consumir recursos de GPU relevantes.
- Etiquetado y clasificacion mediante fine-tuning adicional: al ser un modelo pequeno, es economicamente viable reajustarlo por tarea (analisis de sentimiento, clasificacion de topicos) en una unica GPU consumer.
- Experimentos de destilacion: puede actuar como alumno en ejercicios de destilacion de conocimiento desde modelos mayores, o como banco de pruebas de tecnicas de compresion.
- Docencia y formacion: ejemplo completo y ligero de un flujo SFT con TRL, reproducible en un portatil, para cursos de ajuste fino de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (86,5 M de parametros x 4 bytes) y unos 0,17 GB en fp16/bf16; con cache KV y overhead del runtime, el consumo real se situa en torno a 1 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; no requiere A100, H100 ni RTX 4090. Funciona en RTX 3060, RTX 4090, T4 o incluso en GPUs integradas.
- Compatibilidad con GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos; tambien es viable en CPU con latencia aceptable.
- Opciones de despliegue: `transformers` (via `pipeline`), `text-generation-inference` (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM (la arquitectura GPT-2 esta soportada). Ollama y llama.cpp requeririan una conversion a GGUF que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (`francesca9805/ppt-wc-uniform-newlex-eus-...`) | 86,5 M | no disponible | no disponible | safetensors, 0 descargas |
| `goldfish-models/eng_latn_100mb` (modelo base) | ~86,5 M segun los pesos derivados | no disponible | no disponible | safetensors |
| GPT-2 small (`openai-community/gpt2`) | 124 M | 1024 tokens | licencia MIT modificada | safetensors, muy extendido |
| Pythia-70M (`EleutherAI/pythia-70m`) | 70 M | 2048 tokens | Apache 2.0 | safetensors, ampliamente usado en investigacion |
| SmolLM-135M (`HuggingFaceTB/SmolLM-135M`) | 135 M | 2048 tokens | Apache 2.0 | safetensors, con variantes GGUF |

Nota: los datos de los modelos comparativos proceden de sus fichas publicas y se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento entre ellos y este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada que permita estimar la calidad de las generaciones.
- Licencia no declarada: el campo aparece como "licence: license" en la model card, un marcador de posicion sin valor legal. El uso comercial es juridicamente indeterminado y no deberia asumirse permitido.
- Riesgo alto de alucinacion: con 86,5 M de parametros y un presupuesto de datos de 100 MB, el modelo carece de conocimiento factual fiable y producira afirmaciones incorrectas con frecuencia.
- Sesgos no evaluados: no se documenta la composicion del dataset de ajuste, por lo que no es posible caracterizar sesgos de genero, raza, religion o idioma.
- Cobertura idiomatica incierta: el modelo base es monolingue en ingles y el sufijo "eus" del identificador no se corresponde con ninguna declaracion explicita de soporte del euskera; el comportamiento en ese idioma es una hipotesis no verificada.
- Limitacion de contexto: la ventana de contexto no esta documentada; si se mantiene la configuracion GPT-2 estandar (1024 tokens), no es adecuado para tareas de contexto largo.
- Artefacto experimental: 0 descargas y 0 likes, creado en el marco de un proyecto de investigacion sobre tokenizadores; no hay indicios de mantenimiento, soporte ni actualizaciones.
- No apto para produccion: sin licencia, sin evaluaciones y sin garantias, no deberia desplegarse en sistemas que interactuen con usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organizacion Goldfish Models: https://huggingface.co/goldfish-models
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/12geh81w
